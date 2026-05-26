import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, FileText, Library, ShieldCheck } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { getCommunes, getDocuments } from "@/lib/repository";

const heroImage =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ch%C3%B9a_B%C3%A0_v%C3%A0_c%E1%BA%A3nh_ch%C3%A2n_tr%E1%BB%9Di%2C_KDL_N%C3%BAi_B%C3%A0_%C4%90en.jpg?width=1600";

export default async function HomePage() {
  const [communes, documents] = await Promise.all([getCommunes(), getDocuments()]);
  const wardCount = communes.filter((commune) => commune.type === "phuong").length;
  const communeCount = communes.filter((commune) => commune.type === "xa").length;

  return (
    <>
      <section className="relative min-h-[640px] overflow-hidden bg-ink text-white">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-ink/20" />
        <div className="relative mx-auto flex min-h-[640px] max-w-7xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded bg-white/12 px-3 py-1 text-sm font-semibold backdrop-blur">
              <Library className="h-4 w-4" aria-hidden="true" />
              Thư viện tỉnh Tây Ninh
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">Địa chí số Tây Ninh</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
              Cổng đọc thử tài liệu địa chí, báo chí địa phương và hồ sơ số hóa theo từng xã, phường.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/xa-phuong"
                className="inline-flex items-center gap-2 rounded bg-brass px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brass/90"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Xem 96 xã/phường
              </Link>
              <Link
                href="/tai-lieu"
                className="inline-flex items-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Mở kho tài liệu
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageShell>
        <section className="-mt-20 grid gap-4 md:grid-cols-4">
          {[
            { label: "Xã", value: communeCount, icon: Building2 },
            { label: "Phường", value: wardCount, icon: Building2 },
            { label: "Tài liệu mẫu", value: documents.length, icon: BookOpen },
            { label: "Chế độ", value: "Preview", icon: ShieldCheck }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded border border-ink/10 bg-white p-5 shadow-soft">
                <Icon className="h-5 w-5 text-lacquer" aria-hidden="true" />
                <p className="mt-4 text-3xl font-semibold text-ink">{item.value}</p>
                <p className="mt-1 text-sm text-ink/60">{item.label}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-lacquer">Luồng tra cứu</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Từ địa danh đến bản đọc thử trong vài bước</h2>
            <p className="mt-4 leading-7 text-ink/68">
              Giai đoạn đầu ưu tiên trải nghiệm rõ ràng: chọn xã/phường, xem tài liệu liên quan, đọc preview 10 trang và liên hệ thư viện khi cần bản đầy đủ.
            </p>
            <Link
              href="/tai-lieu"
              className="mt-6 inline-flex items-center gap-2 rounded border border-ink/12 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Xem tài liệu mới
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {documents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {documents.slice(0, 2).map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
              Chưa có tài liệu trên Supabase. Vào khu quản trị để thêm bản PDF preview đầu tiên.
            </div>
          )}
        </section>
      </PageShell>
    </>
  );
}
