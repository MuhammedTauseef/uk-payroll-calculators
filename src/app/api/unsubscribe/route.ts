import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";

// Email unsubscribe endpoint (UX Phase 2, 2026-11-20), posted to by
// the /unsubscribe page. Server-side only, through the service-role
// client when configured (the subscribers table has RLS on with no
// public policies — no direct public database access). An address
// that is not on the list gets a gentle "not-on-list" answer, not an
// error.
//
// NOTE for future email sends: every email sent to the subscribers
// list MUST link to /unsubscribe (AppConfig.siteUrl + "/unsubscribe")
// so recipients can post their address here and be removed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type UnsubscribeBody = { email?: unknown };

export async function POST(request: Request) {
  let body: UnsubscribeBody;
  try {
    body = (await request.json()) as UnsubscribeBody;
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length === 0 || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const supabase = getServiceClient() ?? createPublicClient();
  if (!supabase) {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }

  const { data: existing, error: lookupError } = await supabase
    .from("subscribers")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (lookupError) {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
  if (!existing) return NextResponse.json({ status: "not-on-list" });

  const { error: deleteError } = await supabase
    .from("subscribers")
    .delete()
    .eq("email", email);
  if (deleteError) {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
  return NextResponse.json({ status: "ok" });
}
