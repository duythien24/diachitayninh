import { NextRequest, NextResponse } from "next/server";

import { adminSessionCookie } from "@/lib/admin-auth";

function logout(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  response.headers.append(
    "Set-Cookie",
    `${adminSessionCookie}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
  );
  response.headers.append(
    "Set-Cookie",
    `${adminSessionCookie}=; Path=/admin; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
  );

  return response;
}

export async function GET(request: NextRequest) {
  return logout(request);
}

export async function POST(request: NextRequest) {
  return logout(request);
}
