import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseMiddlewareClient } from "@/lib/supabase-middleware";

const authPages = ["/sign-in", "/sign-up", "/login", "/register"];
const protectedPaths = ["/dashboard", "/transactions", "/settings", "/accounts"];

function cloneCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
}

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
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
  const isAuthPage = matches(pathname, authPages);
  const isProtected = matches(pathname, protectedPaths);

  if (isAuthPage) {
    if (user) {
      const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
      cloneCookies(response, redirectResponse);
      return redirectResponse;
    }
    return response;
  }

  if (isProtected) {
    if (!user) {
      const redirectResponse = NextResponse.redirect(new URL("/sign-in", request.url));
      cloneCookies(response, redirectResponse);
      return redirectResponse;
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
