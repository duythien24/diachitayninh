import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-server";

const allowedEventTypes = new Set(["detail_view", "pdf_open"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return new NextResponse(null, { status: 204 });

  const body = (await request.json().catch(() => null)) as {
    documentId?: string;
    eventType?: string;
    visitorId?: string;
  } | null;

  if (
    !body?.documentId ||
    !uuidPattern.test(body.documentId) ||
    !body.eventType ||
    !allowedEventTypes.has(body.eventType) ||
    !body.visitorId ||
    body.visitorId.length > 160
  ) {
    return NextResponse.json({ error: "Dữ liệu thống kê không hợp lệ." }, { status: 400 });
  }

  const salt = process.env.ANALYTICS_SALT || process.env.ADMIN_SESSION_SECRET || "dia-chi-tay-ninh";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const visitorKey = createHash("sha256")
    .update(`${salt}:${body.visitorId}:${userAgent}`)
    .digest("hex");

  const { error } = await supabase.from("document_events").upsert(
    {
      document_id: body.documentId,
      event_type: body.eventType,
      visitor_key: visitorKey
    },
    {
      onConflict: "document_id,event_type,visitor_key,occurred_on",
      ignoreDuplicates: true
    }
  );

  // The client retries later without exposing database details to readers.
  if (error) return NextResponse.json({ error: "Chưa thể ghi nhận lượt đọc." }, { status: 503 });

  return new NextResponse(null, { status: 204 });
}
