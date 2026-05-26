import { Mail, PhoneCall } from "lucide-react";

export function ContactPanel() {
  return (
    <aside className="rounded border border-palm/20 bg-palm p-5 text-white shadow-soft">
      <p className="text-sm font-semibold uppercase text-white/70">
        Bản đầy đủ
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Liên hệ thư viện</h2>
      <p className="mt-3 text-sm leading-6 text-white/78">
        Website chỉ công bố bản preview. Bản toàn văn được phục vụ theo quy định lưu trữ và quyền khai thác tài liệu.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={process.env.NEXT_PUBLIC_LIBRARY_CONTACT_URL || "mailto:thuvien@tayninh.gov.vn"}
          className="inline-flex items-center gap-2 rounded bg-white px-3 py-2 text-sm font-semibold text-palm transition hover:bg-paper"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Gửi liên hệ
        </a>
        <a
          href="tel:+842763000000"
          className="inline-flex items-center gap-2 rounded border border-white/28 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          Gọi thư viện
        </a>
      </div>
    </aside>
  );
}
