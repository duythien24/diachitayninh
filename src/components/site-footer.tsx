import Link from "next/link";
import { ExternalLink, Globe, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-ink/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase text-brass">Thư viện tỉnh Tây Ninh</p>
          <h2 className="mt-3 text-2xl font-semibold">Thông tin liên hệ</h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/78">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
              <div>
                <p className="font-semibold text-white">Cơ sở 1</p>
                <p>33 Nguyễn Đình Chiểu, Phường Long An, tỉnh Tây Ninh.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
              <div>
                <p className="font-semibold text-white">Cơ sở 2</p>
                <p>83 Phạm Tung, Phường Tân Ninh, tỉnh Tây Ninh.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase text-brass">Kênh liên hệ</p>
          <div className="mt-5 space-y-3 text-sm text-white/78">
            <a
              href="tel:02723837050"
              className="flex items-center gap-3 rounded border border-white/10 px-4 py-3 transition hover:border-brass/60 hover:bg-white/5 hover:text-white"
            >
              <Phone className="h-5 w-5 text-brass" aria-hidden="true" />
              Hotline: (0272) 3837050
            </a>
            <a
              href="https://thuvien.tayninh.gov.vn"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded border border-white/10 px-4 py-3 transition hover:border-brass/60 hover:bg-white/5 hover:text-white"
            >
              <Globe className="h-5 w-5 text-brass" aria-hidden="true" />
              Website: thuvien.tayninh.gov.vn
              <ExternalLink className="ml-auto h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.facebook.com/ThuvientinhTayNinh"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded border border-white/10 px-4 py-3 transition hover:border-brass/60 hover:bg-white/5 hover:text-white"
            >
              <Globe className="h-5 w-5 text-brass" aria-hidden="true" />
              Facebook: Thư viện tỉnh Tây Ninh
              <ExternalLink className="ml-auto h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/55">
        <span>Địa chí số Tây Ninh - Thư viện tỉnh Tây Ninh</span>
        <span className="mx-2 text-white/25">|</span>
        <Link href="/admin" className="transition hover:text-white">
          Quản trị
        </Link>
      </div>
    </footer>
  );
}
