import { NextRequest, NextResponse } from "next/server";

// Triggered by the Vercel Cron schedule in vercel.json. Pings Supabase's
// REST endpoint so the free-tier project doesn't get auto-paused for inactivity.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_URL / SUPABASE_ANON_KEY not set" },
      { status: 500 }
    );
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { apikey: supabaseAnonKey },
  });

  return NextResponse.json({ ok: res.ok, pingedAt: new Date().toISOString() });
}
