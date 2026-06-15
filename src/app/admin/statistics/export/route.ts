import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin-users";
import { getAdminDocuments } from "@/lib/repository";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { documentTypeLabel } from "@/lib/utils";

type ExportEventRow = {
  document_id: string;
  event_type: "detail_view" | "pdf_open";
  occurred_on: string;
};

function validDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function csvCell(value: string | number) {
  const raw = String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function defaultDate(daysAgo: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) return NextResponse.json({ error: "Chưa đăng nhập quản trị." }, { status: 401 });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Chưa cấu hình Supabase." }, { status: 500 });

  const from = validDate(request.nextUrl.searchParams.get("from")) || defaultDate(29);
  const to = validDate(request.nextUrl.searchParams.get("to")) || defaultDate(0);

  if (from > to) {
    return NextResponse.json({ error: "Ngày bắt đầu phải trước ngày kết thúc." }, { status: 400 });
  }

  const [{ data, error }, documents] = await Promise.all([
    supabase
      .from("document_events")
      .select("document_id,event_type,occurred_on")
      .gte("occurred_on", from)
      .lte("occurred_on", to)
      .order("occurred_on", { ascending: true })
      .limit(50000),
    getAdminDocuments()
  ]);

  if (error) {
    return NextResponse.json({ error: "Chưa thể đọc dữ liệu thống kê. Hãy kiểm tra bảng document_events." }, { status: 503 });
  }

  const documentMap = new Map(documents.map((document) => [document.id, document]));
  const aggregate = new Map<string, { date: string; documentId: string; detailViews: number; pdfOpens: number }>();

  for (const event of (data || []) as ExportEventRow[]) {
    if (!documentMap.has(event.document_id)) continue;
    const key = `${event.occurred_on}:${event.document_id}`;
    const row = aggregate.get(key) || {
      date: event.occurred_on,
      documentId: event.document_id,
      detailViews: 0,
      pdfOpens: 0
    };

    if (event.event_type === "detail_view") row.detailViews += 1;
    else row.pdfOpens += 1;
    aggregate.set(key, row);
  }

  const header = ["Ngày", "Tên tài liệu", "Loại tài liệu", "Năm", "Lượt xem chi tiết", "Lượt mở đọc", "Tổng tương tác"];
  const rows = Array.from(aggregate.values())
    .sort((left, right) => left.date.localeCompare(right.date) || left.documentId.localeCompare(right.documentId))
    .map((row) => {
      const document = documentMap.get(row.documentId)!;
      return [
        row.date,
        document.title,
        documentTypeLabel(document.documentType),
        document.year,
        row.detailViews,
        row.pdfOpens,
        row.detailViews + row.pdfOpens
      ].map(csvCell).join(",");
    });

  const csv = `\uFEFF${header.map(csvCell).join(",")}\r\n${rows.join("\r\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="thong-ke-luot-doc-${from}-${to}.csv"`,
      "Cache-Control": "no-store"
    }
  });
}
