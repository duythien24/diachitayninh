import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { adminSessionCookie, isValidAdminSession } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin/login") || pathname === "/admin/session" || pathname === "/admin/logout") {
    return NextResponse.next();
  }

  const session = request.cookies.get(adminSessionCookie)?.value;

  if (await isValidAdminSession(session)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/admin/:path*"
};
