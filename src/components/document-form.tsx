"use client";

import { Save, Upload } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { createDocumentAction, updateDocumentAction } from "@/app/admin/documents/actions";
import type { Commune, Document, DocumentType } from "@/lib/types";
import { typePrefix } from "@/lib/utils";

type SignedUpload = {
  bucket: string;
  path: string;
  token: string;
  publicUrl: string;
};

const maxSupabaseFileSize = 50 * 1024 * 1024;

function browserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Chưa cấu hình Supabase public env.");
  }

  return createClient(url, anonKey);
}

async function signedUpload(file: File, folder: "pdf" | "covers") {
  if (file.size > maxSupabaseFileSize) {
    throw new Error(
      "File vượt quá 50MB. Hãy nén PDF, chia nhỏ file hoặc dùng link PDF đã lưu ở nơi khác."
    );
  }

  const response = await fetch("/admin/uploads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      folder
    })
  });

  const payload = (await response.json()) as SignedUpload & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Không tạo được link upload.");
  }

  const supabase = browserSupabaseClient();
  const { error } = await supabase.storage.from(payload.bucket).uploadToSignedUrl(payload.path, payload.token, file);

  if (error) {
    throw new Error(error.message);
  }

  return payload.publicUrl;
}

export function DocumentForm({ communes, document }: { communes: Commune[]; document?: Document }) {
  const action = document ? updateDocumentAction.bind(null, document.id) : createDocumentAction;
  const formRef = useRef<HTMLFormElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverUrlRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>(document?.documentType || "dia_chi");
  const [selectedCommuneId, setSelectedCommuneId] = useState(document?.communeId || "");

  const emptyCommuneLabel =
    selectedDocumentType === "bao_tay_ninh"
      ? "Báo Tây Ninh - không gắn xã/phường cụ thể"
      : selectedDocumentType === "tai_lieu_cap_tinh"
        ? "Không gắn xã/phường - tài liệu cấp tỉnh"
        : "Chọn xã/phường liên quan hoặc để trống";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = formRef.current;

    if (!form || form.dataset.filesUploaded === "true") {
      return;
    }

    const previewFile = previewInputRef.current?.files?.[0] || null;
    const coverFile = coverInputRef.current?.files?.[0] || null;

    if (!previewFile && !coverFile) {
      return;
    }

    event.preventDefault();
    setUploadError(null);
    setIsUploading(true);

    try {
      if (previewFile && previewUrlRef.current) {
        previewUrlRef.current.value = await signedUpload(previewFile, "pdf");
        if (previewInputRef.current) previewInputRef.current.value = "";
      }

      if (coverFile && coverUrlRef.current) {
        coverUrlRef.current.value = await signedUpload(coverFile, "covers");
        if (coverInputRef.current) coverInputRef.current.value = "";
      }

      form.dataset.filesUploaded = "true";
      form.requestSubmit();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Không upload được file lên Supabase Storage.");
      setIsUploading(false);
    }
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="grid gap-6 rounded border border-ink/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="existing_preview_file_url" value={document?.previewFileUrl || ""} />
      <input type="hidden" name="existing_cover_image_url" value={document?.coverImageUrl || ""} />

      {uploadError ? (
        <div className="rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm font-medium text-lacquer">
          {uploadError}
        </div>
      ) : null}

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
            value={selectedDocumentType}
            onChange={(event) => {
              const nextType = event.target.value as DocumentType;
              setSelectedDocumentType(nextType);
              if (nextType === "bao_tay_ninh" || nextType === "tai_lieu_cap_tinh") {
                setSelectedCommuneId("");
              }
            }}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          >
            <option value="dia_chi">Địa chí</option>
            <option value="bao_tay_ninh">Báo Tây Ninh</option>
            <option value="tai_lieu_cap_tinh">Tài liệu cấp tỉnh</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Xã/phường
          <select
            name="commune_id"
            value={selectedCommuneId}
            onChange={(event) => setSelectedCommuneId(event.target.value)}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          >
            <option value="">{emptyCommuneLabel}</option>
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
          File PDF
          <span className="flex flex-col gap-3 rounded border border-dashed border-ink/20 px-3 py-5 text-sm font-normal text-ink/55">
            <span className="flex items-center gap-3">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Chọn file PDF để upload lên Supabase Storage
            </span>
            <input ref={previewInputRef} name="preview_file" type="file" accept="application/pdf" className="text-sm" />
            <input
              ref={previewUrlRef}
              name="preview_file_url"
              defaultValue={document?.previewFileUrl}
              className="rounded border border-ink/12 px-3 py-2.5 outline-none transition focus:border-palm"
              placeholder="Hoặc dán URL PDF"
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
            <input ref={coverInputRef} name="cover_image" type="file" accept="image/*" className="text-sm" />
            <input
              ref={coverUrlRef}
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
        File được upload trực tiếp lên Supabase Storage, sau đó hệ thống lưu thông tin tài liệu vào bảng <strong>documents</strong>. Giới hạn hiện tại của bucket là <strong>50MB/file</strong>.
      </div>

      <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-5">
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90 disabled:cursor-wait disabled:bg-palm/60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isUploading ? "Đang upload file..." : "Lưu tài liệu"}
        </button>
      </div>
    </form>
  );
}
