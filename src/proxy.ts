import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy (Next.js 16's renamed Middleware), scoped to /admin/* only —
 * the site's public pages and calculators never pass through here.
 *
 * - Refreshes the Supabase auth session on admin routes.
 * - /admin/* (except /admin/login) requires a signed-in user whose
 *   profiles row carries role = 'admin'; everyone else is bounced to
 *   /admin/login. The pages and server actions re-check the same
 *   thing themselves (requireAdminContext) — this is the outer gate,
 *   not the only one.
 * - A signed-in admin visiting /admin/login is sent to /admin.
 * - Fails closed when Supabase isn't configured yet: admin pages
 *   redirect to the login page, which explains the state.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (isLoginPage) return NextResponse.next({ request });
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() revalidates the session with the auth server
  // (and triggers the cookie refresh above). Do not swap in getSession.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isLoginPage) return response;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  let role: string | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (data as { role: string } | null)?.role ?? null;
  } catch {
    role = null;
  }

  if (role !== "admin") {
    if (isLoginPage) return response;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
