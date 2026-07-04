import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseMiddlewareClient } from "@/lib/supabase-middleware";

function cloneCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createSupabaseMiddlewareClient(request, response);
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!user && !isAuthPage) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    cloneCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (user && isAuthPage) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    cloneCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
