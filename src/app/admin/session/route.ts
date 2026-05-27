import { NextResponse } from "next/server";

import { adminRoleLabel, getCurrentAdmin } from "@/lib/admin-users";

export async function GET() {
  const currentAdmin = await getCurrentAdmin();

  return NextResponse.json(
    {
      admin: currentAdmin
        ? {
            username: currentAdmin.username,
            roleLabel: adminRoleLabel(currentAdmin.role)
          }
        : null
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
