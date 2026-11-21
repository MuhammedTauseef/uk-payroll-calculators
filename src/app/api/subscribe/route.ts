import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";

// Email subscribe endpoint for the site-wide email box (UX Phase 2,
// 2026-11-20). The write happens here, server-side, through the
// service-role client when it is configured — the subscribers table
// has RLS switched on with no public policies, so there is no direct
// public database access by design. The public (anon) client is only
// a fallback for a deployment where an insert policy exists. A
// duplicate email is a friendly success ("already"), never an error.
//
// Signup is single opt-in (email nizam, 2026-11-21): the address is
// Confirmed the moment it is entered — no confirmation email is sent.
// An address that previously unsubscribed is reactivated in place
// (unsubscribed_at cleared) and also answers "ok", so the visitor is
// simply back on the list. Until the 2026-11-21 migration adds the
// unsubscribed_at column, the lookup below fails and the endpoint
// falls through to the plain insert, exactly as before.
//
// NOTE for future email sends: every email sent to this list MUST
// carry an unsubscribe link to /unsubscribe (AppConfig.siteUrl +
// "/unsubscribe") — that page posts to /api/unsubscribe.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type SubscribeBody = { email?: unknown; source?: unknown };

export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source =
    typeof body.source === "string" && body.source.startsWith("/")
      ? body.source.slice(0, 200)
      : null;

  if (email.length === 0 || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const supabase = getServiceClient() ?? createPublicClient();
  if (!supabase) {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }

  // Already on the list? Active → friendly "already"; unsubscribed →
  // clear the mark and welcome them back with "ok".
  const { data: existing, error: lookupError } = await supabase
    .from("subscribers")
    .select("id,unsubscribed_at")
    .eq("email", email)
    .maybeSingle();
  if (!lookupError && existing) {
    const row = existing as unknown as { unsubscribed_at: string | null };
    if (row.unsubscribed_at === null) {
      return NextResponse.json({ status: "already" });
    }
    const { error: reactivateError } = await supabase
      .from("subscribers")
      .update({ unsubscribed_at: null })
      .eq("email", email);
    if (!reactivateError) return NextResponse.json({ status: "ok" });
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }

  const { error } = await supabase
    .from("subscribers")
    .insert({ email, source });

  if (!error) return NextResponse.json({ status: "ok" });
  // 23505 = unique_violation: the address is already on the list.
  if ((error as { code?: string }).code === "23505") {
    return NextResponse.json({ status: "already" });
  }
  return NextResponse.json({ status: "unavailable" }, { status: 503 });
}
