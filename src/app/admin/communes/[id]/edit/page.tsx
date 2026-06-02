import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus, Save } from "lucide-react";

import { updateCommuneAction } from "@/app/admin/communes/actions";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getAdminCommuneById } from "@/lib/repository";
import { typePrefix } from "@/lib/utils";

export default async function EditCommunePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const commune = await getAdminCommuneById(id);

  if (!commune) {
    notFound();
  }

  const action = updateCommuneAction.bind(null, commune.id);

  return (
    <PageShell>
      <Link href="/admin/communes" className="inline-flex items-center gap-2 text-sm font-semibold text-palm">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại danh sách xã/phường
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_26rem]">
        <section>
          <SectionHeader
            eyebrow="Quản trị xã/phường"
            title={`${typePrefix(commune.type)} ${commune.name}`}
            description="Cập nhật nội dung hiển thị trên trang chi tiết của đơn vị hành chính này."
          />

          <form action={action} className="mt-8 grid gap-5 rounded border border-ink/10 bg-white p-6 shadow-sm">
            <input type="hidden" name="slug" value={commune.slug} />
            <input type="hidden" name="existing_cover_image_url" value={commune.coverImageUrl || ""} />

            <label className="grid gap-2 text-sm font-semibold text-ink">
              Mô tả trang xã/phường
              <textarea
                name="description"
                rows={6}
                defaultValue={commune.description}
                className="resize-y rounded border border-ink/12 px-3 py-3 font-normal leading-6 text-ink outline-none transition focus:border-palm"
                placeholder="Nhập mô tả riêng cho xã/phường..."
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-ink">
                Ảnh đại diện
                <span className="rounded border border-dashed border-ink/16 bg-paper/70 p-4">
                  <span className="mb-3 flex items-center gap-2 text-sm font-normal text-ink/55">
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    Upload JPG, PNG hoặc WEBP, tối đa 5MB
                  </span>
                  <input name="cover_image" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-ink">
                Hoặc dán URL ảnh
                <input
                  name="cover_image_url"
                  defaultValue={commune.coverImageUrl || ""}
                  className="rounded border border-ink/12 px-3 py-3 font-normal outline-none transition focus:border-palm"
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-ink">
              Từ khóa
              <input
                name="keywords"
                defaultValue={(commune.keywords || []).join(", ")}
                className="rounded border border-ink/12 px-3 py-3 font-normal outline-none transition focus:border-palm"
                placeholder="di tích, lịch sử, địa danh..."
              />
              <span className="text-xs font-normal text-ink/50">Phân tách nhiều từ khóa bằng dấu phẩy.</span>
            </label>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Lưu thông tin xã/phường
            </button>
          </form>
        </section>

        <aside className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Xem trước</p>
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded bg-paper">
            {commune.coverImageUrl ? (
              <Image src={commune.coverImageUrl} alt="" fill sizes="26rem" className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-sm text-ink/45">Chưa có ảnh đại diện</div>
            )}
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink">{commune.name}</h2>
          <p className="mt-3 text-sm leading-6 text-ink/65">{commune.description}</p>
          {commune.keywords?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {commune.keywords.map((keyword) => (
                <span key={keyword} className="rounded bg-paper px-2.5 py-1 text-xs font-semibold text-ink/65">
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}
