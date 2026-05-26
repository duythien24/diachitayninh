import { Save, Upload } from "lucide-react";

import { createDocumentAction, updateDocumentAction } from "@/app/admin/documents/actions";
import type { Commune, Document } from "@/lib/types";
import { typePrefix } from "@/lib/utils";

export function DocumentForm({ communes, document }: { communes: Commune[]; document?: Document }) {
  const action = document ? updateDocumentAction.bind(null, document.id) : createDocumentAction;

  return (
    <form action={action} className="grid gap-6 rounded border border-ink/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="existing_preview_file_url" value={document?.previewFileUrl || ""} />
      <input type="hidden" name="existing_cover_image_url" value={document?.coverImageUrl || ""} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Tên tài liệu
          <input
            name="title"
            defaultValue={document?.title}
            required
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
            placeholder="Địa chí xã..."
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Slug
          <input
            name="slug"
            defaultValue={document?.slug}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
            placeholder="dia-chi-xa-tan-bien-preview"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Loại tài liệu
          <select
            name="document_type"
            defaultValue={document?.documentType || "dia_chi"}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          >
            <option value="dia_chi">Địa chí</option>
            <option value="bao_tay_ninh">Báo Tây Ninh</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Xã/phường
          <select
            name="commune_id"
            defaultValue={document?.communeId || ""}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          >
            <option value="">Toàn tỉnh</option>
            {communes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {typePrefix(commune.type)} {commune.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Năm
          <input
            name="year"
            defaultValue={document?.year || new Date().getFullYear()}
            type="number"
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        Mô tả
        <textarea
          name="description"
          defaultValue={document?.description}
          rows={5}
          className="rounded border border-ink/12 px-3 py-2.5 font-normal leading-6 outline-none transition focus:border-palm"
          placeholder="Tóm tắt nội dung tài liệu..."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Nguồn
          <input
            name="source"
            defaultValue={document?.source || "Thư viện tỉnh Tây Ninh"}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Ghi chú liên hệ
          <input
            name="contact_note"
            defaultValue={document?.contactNote || "Vui lòng liên hệ thư viện để đọc bản đầy đủ."}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          File PDF preview
          <span className="flex flex-col gap-3 rounded border border-dashed border-ink/20 px-3 py-5 text-sm font-normal text-ink/55">
            <span className="flex items-center gap-3">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Chọn file PDF preview 10 trang
            </span>
            <input name="preview_file" type="file" accept="application/pdf" className="text-sm" />
            <input
              name="preview_file_url"
              defaultValue={document?.previewFileUrl}
              className="rounded border border-ink/12 px-3 py-2.5 outline-none transition focus:border-palm"
              placeholder="Hoặc dán URL PDF preview"
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Ảnh bìa
          <span className="flex flex-col gap-3 rounded border border-dashed border-ink/20 px-3 py-5 text-sm font-normal text-ink/55">
            <span className="flex items-center gap-3">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload hoặc dán URL ảnh
            </span>
            <input name="cover_image" type="file" accept="image/*" className="text-sm" />
            <input
              name="cover_image_url"
              defaultValue={document?.coverImageUrl}
              className="rounded border border-ink/12 px-3 py-2.5 outline-none transition focus:border-palm"
              placeholder="URL ảnh bìa"
            />
          </span>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-ink md:max-w-sm">
        Chế độ đọc
        <select
          name="access_mode"
          defaultValue={document ? (document.isPreviewOnly === false ? "full" : "preview") : "full"}
          className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
        >
          <option value="full">Bản đầy đủ - cho đọc hết</option>
          <option value="preview">Bản preview - chỉ đọc thử</option>
        </select>
      </label>

      <div className="rounded bg-paper p-4 text-sm leading-6 text-ink/68">
        Khi có Supabase env, form này sẽ upload file vào bucket <strong>documents-preview</strong> và lưu metadata vào bảng <strong>documents</strong>.
      </div>

      <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-5">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Lưu tài liệu
        </button>
      </div>
    </form>
  );
}
