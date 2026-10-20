import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin-users";
import { searchLibraryCatalog } from "@/lib/library-catalog";

export async function GET(request: NextRequest) {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return NextResponse.json({ error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 3) {
    return NextResponse.json({ matches: [] });
  }

  try {
    return NextResponse.json({ matches: await searchLibraryCatalog(query) });
  } catch (error) {
    console.error("[catalog-lookup] failed", error);
    return NextResponse.json({ error: "Không tra được kho số của Thư viện tỉnh lúc này." }, { status: 502 });
  }
}
