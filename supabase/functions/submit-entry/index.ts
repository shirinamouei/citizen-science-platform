// Edge Function: the only path that can create an `entries` row. Direct
// inserts from anon/authenticated are revoked at the database level — this
// function is what verifies the Turnstile token and enforces the rate limit
// before calling the `submit_entry` Postgres function (via the service role,
// which bypasses that revoked grant). Attachments are uploaded here too, after
// the CAPTCHA check, so storage has no client-writable path.
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

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mirrors src/lib/file-validation.ts — the client check is only a convenience;
// this is the one that counts.
const SIGNATURES: Record<string, { contentType: string; magic?: number[] }> = {
  ".csv": { contentType: "text/csv" },
  ".xlsx": { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", magic: [0x50, 0x4b] },
  ".pdf": { contentType: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  ".png": { contentType: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  ".jpg": { contentType: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  ".jpeg": { contentType: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
};

function validateFile(file: File, bytes: Uint8Array): { extension: string; contentType: string } | null {
  if (file.size > MAX_FILE_SIZE_BYTES || bytes.length > MAX_FILE_SIZE_BYTES) return null;
  const extension = `.${(file.name.split(".").pop() ?? "").toLowerCase()}`;
  const spec = SIGNATURES[extension];
  if (!spec) return null;
  if (spec.magic) {
    if (!spec.magic.every((byte, i) => bytes[i] === byte)) return null;
  } else if (bytes.slice(0, 512).some((byte) => byte === 0)) {
    return null;
  }
  return { extension, contentType: spec.contentType };
}

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

  let id: string | undefined;
  let medications: unknown;
  let notes: string | null | undefined;
  let attachmentPath: string | null | undefined;
  let turnstileToken: string | undefined;
  let file: File | null = null;

  try {
    if ((req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const form = await req.formData();
      id = form.get("id")?.toString();
      turnstileToken = form.get("turnstileToken")?.toString();
      notes = form.get("notes")?.toString() || null;
      medications = JSON.parse(form.get("medications")?.toString() ?? "[]");
      const maybeFile = form.get("file");
      if (maybeFile instanceof File) file = maybeFile;
    } else {
      // Legacy JSON request (client uploaded to storage itself). Kept only so
      // cached clients keep working during rollout; the path is validated below.
      const body = await req.json();
      ({ id, medications, notes, attachmentPath, turnstileToken } = body);
    }
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  if (!id || !turnstileToken) {
    return json({ error: "Missing required fields." }, 400);
  }
  if (!UUID_RE.test(id)) {
    return json({ error: "Invalid entry id." }, 400);
  }
  // Cheap checks first; the CAPTCHA is verified before any storage write.
  if (file && file.size > MAX_FILE_SIZE_BYTES) {
    return json({ error: "File is too large (max 3MB)." }, 400);
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
  const owner = userId ?? "guest";

  // The storage path is built here, never taken from the client.
  let uploadedPath: string | null = null;
  if (file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const checked = validateFile(file, bytes);
    if (!checked) {
      console.error("attachment rejected:", { name: file.name, type: file.type, size: file.size });
      return json({ error: "Unsupported or invalid file. Please attach a CSV, XLSX, PDF, PNG, or JPG up to 3MB." }, 400);
    }
    uploadedPath = `${owner}/${id}${checked.extension}`;
    const { error: uploadError } = await admin.storage
      .from("entry-attachments")
      .upload(uploadedPath, bytes, { contentType: checked.contentType });
    if (uploadError) {
      console.error("attachment upload failed:", uploadError.message, { path: uploadedPath, size: bytes.length });
      return json({ error: "Couldn't save your attachment. Please try again." }, 500);
    }
  } else if (attachmentPath) {
    const legacyPattern = new RegExp(`^${owner}/${id}\\.(csv|xlsx|pdf|png|jpe?g)$`);
    if (!legacyPattern.test(attachmentPath)) {
      return json({ error: "Invalid attachment." }, 400);
    }
    uploadedPath = attachmentPath;
  }

  const { data, error } = await admin.rpc("submit_entry", {
    p_id: id,
    p_user_id: userId,
    p_medications: medications ?? [],
    p_notes: notes || null,
    p_attachment_path: uploadedPath,
    p_ip_hash: ipHash,
  });

  if (error) {
    if (file && uploadedPath) await admin.storage.from("entry-attachments").remove([uploadedPath]);
    if (error.message?.includes("rate_limited")) {
      return json({ error: "Too many submissions from this network. Please try again later." }, 429);
    }
    return json({ error: "Couldn't save your entry. Please try again." }, 500);
  }

  return json({ entry: data });
});
