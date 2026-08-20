// Edge Function: the only path that can create an `entries` row. Direct
// inserts from anon/authenticated are revoked at the database level — this
// function is what verifies the Turnstile token and enforces the rate limit
// before calling the `submit_entry` Postgres function (via the service role,
// which bypasses that revoked grant).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY")!;
const IP_HASH_PEPPER = Deno.env.get("IP_HASH_PEPPER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${IP_HASH_PEPPER}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let body: {
    id?: string;
    medications?: unknown;
    notes?: string | null;
    attachmentPath?: string | null;
    turnstileToken?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const { id, medications, notes, attachmentPath, turnstileToken } = body;
  if (!id || !turnstileToken) {
    return json({ error: "Missing required fields." }, 400);
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Verify the CAPTCHA token against Cloudflare directly — this is the actual
  // gate. A request with a fabricated or replayed token fails here regardless
  // of what the client claims.
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken, remoteip: clientIp }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    return json({ error: "Verification failed. Please try again." }, 400);
  }

  // Resolve the signed-in user from the caller's own JWT — never trust a
  // client-supplied user id.
  const authHeader = req.headers.get("Authorization") ?? "";
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await callerClient.auth.getUser();
  const userId = userData.user?.id ?? null;

  const ipHash = await hashIp(clientIp);
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await admin.rpc("submit_entry", {
    p_id: id,
    p_user_id: userId,
    p_medications: medications ?? [],
    p_notes: notes || null,
    p_attachment_path: attachmentPath || null,
    p_ip_hash: ipHash,
  });

  if (error) {
    if (error.message?.includes("rate_limited")) {
      return json({ error: "Too many submissions from this network. Please try again later." }, 429);
    }
    return json({ error: "Couldn't save your entry. Please try again." }, 500);
  }

  return json({ entry: data });
});
