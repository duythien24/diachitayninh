"use client";

import { Plus, Save, Search, Upload, X } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { createDocumentAction, updateDocumentAction } from "@/app/admin/documents/actions";
import type { Commune, Document, DocumentType } from "@/lib/types";
import { getPdfPageCount, makePreviewPdf, previewWatermark, renderPdfCover } from "@/lib/pdf-tools";
import { normalizeVietnamese, typePrefix } from "@/lib/utils";

type SignedUpload = {
  bucket: string;
  path: string;
  token: string;
  publicUrl: string;
};

const maxPdfFileSize = 50 * 1024 * 1024;
const maxImageFileSize = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

function browserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Chưa cấu hình Supabase public env.");
  }

  return createClient(url, anonKey);
}

function validateClientFile(file: File, folder: "pdf" | "covers") {
  if (folder === "pdf") {
    if (file.type !== "application/pdf") throw new Error("Chỉ được upload file PDF.");
    if (file.size > maxPdfFileSize) throw new Error("File PDF không được vượt quá 50MB.");
    return;
  }

  if (!allowedImageTypes.includes(file.type)) {
    throw new Error("Ảnh bìa chỉ hỗ trợ JPG, PNG hoặc WEBP.");
  }

  if (file.size > maxImageFileSize) {
    throw new Error("Ảnh bìa không được vượt quá 5MB.");
  }
}

async function signedUpload(file: File, folder: "pdf" | "covers") {
  validateClientFile(file, folder);

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

function keywordValue(document?: Document) {
  return document?.keywords?.join(", ") || "";
}

function canAttachCommunesFor(type: DocumentType) {
  return type !== "tai_lieu_cap_tinh";
}

function typeHelpText(type: DocumentType) {
  if (type === "bao_tay_ninh") {
    return "Có thể chọn một hoặc nhiều xã/phường nếu số báo, bài báo hoặc chuyên đề có nội dung liên quan đến địa phương đó.";
  }

  if (type === "tai_lieu_cap_tinh") {
    return "Tài liệu cấp tỉnh được lưu ở phạm vi toàn tỉnh, không gắn riêng xã/phường nào.";
  }

  return "Giữ Ctrl để chọn nhiều xã/phường nếu một tài liệu liên quan nhiều đơn vị.";
}

/** Communes whose name appears as whole words in the title, e.g. "Lịch sử xã Tân Chánh" → Tân Chánh. */
function suggestCommunes(title: string, communes: Commune[]) {
  const text = ` ${normalizeVietnamese(title).replace(/[^a-z0-9]+/g, " ")} `;
  if (text.trim().length < 3) return [];
  return communes.filter((commune) => {
    const name = normalizeVietnamese(commune.name).replace(/[^a-z0-9]+/g, " ").trim();
    return name.length >= 4 && text.includes(` ${name} `) && !text.includes(` tinh ${name} `);
  });
}

export function DocumentForm({ communes, document }: { communes: Commune[]; document?: Document }) {
  const action = document ? updateDocumentAction.bind(null, document.id) : createDocumentAction;
  const formRef = useRef<HTMLFormElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverUrlRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>(document?.documentType || "dia_chi");
  const [selectedCommuneIds, setSelectedCommuneIds] = useState<string[]>(
    document?.communeIds?.length ? document.communeIds : document?.communeId ? [document.communeId] : []
  );
  const [communeQuery, setCommuneQuery] = useState("");
  const [titleText, setTitleText] = useState(document?.title || "");
  const [pdfInfo, setPdfInfo] = useState<{ pages: number; coverUrl?: string } | null>(null);
  const generatedCoverRef = useRef<File | null>(null);
  const pageCountRef = useRef<HTMLInputElement>(null);
  const previewPagesRef = useRef<HTMLInputElement>(null);
  const accessModeRef = useRef<HTMLSelectElement>(null);
  const communeSuggestions = useMemo(
    () => (canAttachCommunesFor(selectedDocumentType) ? suggestCommunes(titleText, communes).filter((commune) => !selectedCommuneIds.includes(commune.id)) : []),
    [communes, selectedCommuneIds, selectedDocumentType, titleText]
  );

  async function handlePdfSelected(file: File | undefined) {
    generatedCoverRef.current = null;
    setPdfInfo(null);
    if (!file) return;

    try {
      setUploadStatus("Đang đọc file PDF...");
      const pages = await getPdfPageCount(file);
      if (pageCountRef.current && !pageCountRef.current.value) pageCountRef.current.value = String(pages);

      let coverUrl: string | undefined;
      const hasCover = Boolean(coverInputRef.current?.files?.length || coverUrlRef.current?.value);
      if (!hasCover) {
        setUploadStatus("Đang tạo ảnh bìa từ trang đầu...");
        const cover = await renderPdfCover(file);
        generatedCoverRef.current = cover;
        coverUrl = URL.createObjectURL(cover);
      }

      setPdfInfo({ pages, coverUrl });
      setUploadStatus(null);
    } catch (error) {
      setUploadStatus(null);
      setUploadError(error instanceof Error ? `Không đọc được PDF: ${error.message}` : "Không đọc được PDF.");
    }
  }

  const canAttachCommunes = selectedDocumentType !== "tai_lieu_cap_tinh";
  const primaryCommuneId = canAttachCommunes ? selectedCommuneIds[0] || "" : "";
  const selectedCommuneSet = useMemo(() => new Set(selectedCommuneIds), [selectedCommuneIds]);
  const selectedCommunes = useMemo(
    () => communes.filter((commune) => selectedCommuneSet.has(commune.id)),
    [communes, selectedCommuneSet]
  );
  const filteredCommunes = useMemo(() => {
    const query = normalizeVietnamese(communeQuery.trim());

    if (!query) {
      return communes;
    }

    return communes.filter((commune) =>
      normalizeVietnamese([typePrefix(commune.type), commune.name, commune.districtOld, commune.description].join(" ")).includes(query)
    );
  }, [communeQuery, communes]);

  function toggleCommune(communeId: string) {
    setSelectedCommuneIds((current) =>
      current.includes(communeId) ? current.filter((id) => id !== communeId) : [...current, communeId]
    );
  }

  function removeCommune(communeId: string) {
    setSelectedCommuneIds((current) => current.filter((id) => id !== communeId));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = formRef.current;

    if (!form || form.dataset.filesUploaded === "true") {
      return;
    }

    const pickedPdf = previewInputRef.current?.files?.[0] || null;
    const coverFile = coverInputRef.current?.files?.[0] || (coverUrlRef.current?.value ? null : generatedCoverRef.current);
    const previewFile = pickedPdf;

    if (!previewFile && !coverFile) {
      return;
    }

    event.preventDefault();
    setUploadError(null);
    setIsUploading(true);
    setUploadStatus("Đang kiểm tra file...");

    try {
      if (previewFile && previewUrlRef.current) {
        let uploadFile = previewFile;
        if (accessModeRef.current?.value === "preview") {
          const pageLimit = Number(previewPagesRef.current?.value) || 10;
          setUploadStatus(`Đang cắt ${pageLimit} trang đọc thử và đóng watermark...`);
          const preview = await makePreviewPdf(previewFile, pageLimit);
          uploadFile = preview.file;
          if (previewPagesRef.current) previewPagesRef.current.value = String(preview.keptPages);
        }
        setUploadStatus("Đang tải PDF lên...");
        previewUrlRef.current.value = await signedUpload(uploadFile, "pdf");
        if (previewInputRef.current) previewInputRef.current.value = "";
      }

      if (coverFile && coverUrlRef.current) {
        setUploadStatus("Đang upload ảnh bìa...");
        coverUrlRef.current.value = await signedUpload(coverFile, "covers");
        if (coverInputRef.current) coverInputRef.current.value = "";
      }

      setUploadStatus("Upload xong, đang lưu dữ liệu...");
      form.dataset.filesUploaded = "true";
      form.requestSubmit();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Không upload được file lên Supabase Storage.");
      setUploadStatus(null);
      setIsUploading(false);
    }
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="grid gap-6 rounded border border-ink/10 bg-white p-6 shadow-sm">
      <input type="hidden" name="existing_preview_file_url" value={document?.previewFileUrl || ""} />
      <input type="hidden" name="existing_cover_image_url" value={document?.coverImageUrl || ""} />
      <input type="hidden" name="commune_id" value={primaryCommuneId} />

      {uploadError ? (
        <div className="rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm font-medium text-lacquer">
          {uploadError}
        </div>
      ) : null}

      {uploadStatus ? (
        <div className="rounded border border-palm/20 bg-palm/8 p-4 text-sm font-medium text-palm">
          {uploadStatus}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Tên tài liệu
          <input
            name="title"
            defaultValue={document?.title}
            onChange={(event) => setTitleText(event.target.value)}
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
            placeholder="dia-chi-xa-tan-bien"
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
              if (nextType === "tai_lieu_cap_tinh") {
                setSelectedCommuneIds([]);
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
          Năm xuất bản
          <input
            name="year"
            defaultValue={document?.year || new Date().getFullYear()}
            type="number"
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Số trang xem thử
          <input
            ref={previewPagesRef}
            name="preview_page_count"
            defaultValue={document?.previewPageCount || 10}
            type="number"
            min={0}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
      </div>

      {canAttachCommunes ? (
        <>
          <section className="grid gap-3 rounded border border-ink/10 bg-white p-4">
            {selectedCommuneIds.map((communeId) => (
              <input key={communeId} type="hidden" name="commune_ids" value={communeId} />
            ))}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Xã/phường liên quan</p>
                <p className="mt-1 text-xs leading-5 text-ink/55">{typeHelpText(selectedDocumentType)}</p>
                {communeSuggestions.length ? (
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/60">
                    Gợi ý theo tên tài liệu:
                    {communeSuggestions.map((commune) => (
                      <button
                        key={commune.id}
                        type="button"
                        onClick={() => toggleCommune(commune.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-palm/30 bg-palm/8 px-2.5 py-1 font-semibold text-palm transition hover:bg-palm/15"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        {typePrefix(commune.type)} {commune.name}
                      </button>
                    ))}
                  </p>
                ) : null}
              </div>
              <span className="rounded bg-palm/10 px-2.5 py-1 text-xs font-semibold text-palm">
                Đã chọn {selectedCommuneIds.length}
              </span>
            </div>

            {selectedCommunes.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedCommunes.map((commune) => (
                  <span
                    key={commune.id}
                    className="inline-flex max-w-full items-center gap-2 rounded bg-paper px-2.5 py-1 text-xs font-semibold text-ink/70"
                  >
                    <span className="truncate">
                      {typePrefix(commune.type)} {commune.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCommune(commune.id)}
                      className="grid h-5 w-5 shrink-0 place-items-center rounded text-ink/45 transition hover:bg-white hover:text-lacquer"
                      aria-label={`Bỏ ${typePrefix(commune.type)} ${commune.name}`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedCommuneIds([])}
                  className="rounded border border-ink/10 px-2.5 py-1 text-xs font-semibold text-lacquer transition hover:bg-lacquer/8"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            ) : (
              <div className="rounded bg-paper px-3 py-2 text-sm text-ink/58">
                Chưa chọn xã/phường nào. Tài liệu vẫn lưu được, nhưng trang xã/phường sẽ không tự hiện tài liệu này.
              </div>
            )}

            <label className="flex min-h-11 items-center gap-3 rounded border border-ink/10 bg-paper/80 px-3 text-ink/55">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Tìm xã/phường</span>
              <input
                value={communeQuery}
                onChange={(event) => setCommuneQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
                placeholder="Tìm nhanh theo tên xã, phường, đơn vị cũ..."
              />
              {communeQuery ? (
                <button
                  type="button"
                  onClick={() => setCommuneQuery("")}
                  className="grid h-7 w-7 place-items-center rounded text-ink/45 transition hover:bg-white hover:text-lacquer"
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </label>

            <div className="max-h-80 overflow-y-auto rounded border border-ink/10">
              {filteredCommunes.length ? (
                <div className="grid divide-y divide-ink/8">
                  {filteredCommunes.map((commune) => {
                    const checked = selectedCommuneSet.has(commune.id);

                    return (
                      <label
                        key={commune.id}
                        className="flex cursor-pointer items-start gap-3 px-3 py-3 text-sm transition hover:bg-paper"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCommune(commune.id)}
                          className="mt-1 h-4 w-4 rounded border-ink/20 text-palm accent-palm"
                        />
                        <span className="min-w-0">
                          <span className="block font-semibold text-ink">
                            {typePrefix(commune.type)} {commune.name}
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-xs text-ink/50">{commune.districtOld}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="px-3 py-8 text-center text-sm text-ink/55">Không tìm thấy xã/phường phù hợp.</div>
              )}
            </div>
          </section>

          <label className="hidden">
          Xã/phường liên quan
          <select
            multiple
            size={8}
            value={selectedCommuneIds}
            onChange={(event) => {
              setSelectedCommuneIds(Array.from(event.currentTarget.selectedOptions, (option) => option.value));
            }}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          >
            {communes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {typePrefix(commune.type)} {commune.name}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal leading-5 text-ink/55">{typeHelpText(selectedDocumentType)}</span>
        </label>
        </>
      ) : (
        <div className="rounded border border-ink/10 bg-paper p-4 text-sm leading-6 text-ink/65">
          <p className="font-semibold text-ink">Phạm vi tài liệu</p>
          <p className="mt-1">{typeHelpText(selectedDocumentType)}</p>
        </div>
      )}

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
          Tác giả
          <input
            name="author"
            defaultValue={document?.author || ""}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Nhà xuất bản
          <input
            name="publisher"
            defaultValue={document?.publisher || ""}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Nguồn
          <input
            name="source"
            defaultValue={document?.source || "Thư viện tỉnh Tây Ninh"}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Số trang
          <input
            ref={pageCountRef}
            name="page_count"
            defaultValue={document?.pageCount || ""}
            type="number"
            min={0}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Từ khóa
          <input
            name="keywords"
            defaultValue={keywordValue(document)}
            className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
            placeholder="di tích, lịch sử, văn hóa"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        Ghi chú liên hệ
        <input
          name="contact_note"
          defaultValue={document?.contactNote || "Vui lòng liên hệ thư viện để đọc bản đầy đủ."}
          className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          File PDF
          <span className="flex flex-col gap-3 rounded border border-dashed border-ink/20 px-3 py-5 text-sm font-normal text-ink/55">
            <span className="flex items-center gap-3">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Chọn file PDF gốc (bản scan đầy đủ cũng được)
            </span>
            <input
              ref={previewInputRef}
              name="preview_file"
              type="file"
              accept="application/pdf"
              className="text-sm"
              onChange={(event) => handlePdfSelected(event.target.files?.[0])}
            />
            {pdfInfo ? (
              <span className="flex items-start gap-3 rounded bg-paper p-3 text-xs leading-5 text-ink/70">
                {pdfInfo.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pdfInfo.coverUrl} alt="Ảnh bìa tạo từ trang đầu" className="h-24 w-auto rounded-sm shadow-sm" />
                ) : null}
                <span>
                  File có <strong>{pdfInfo.pages} trang</strong>.{" "}
                  {pdfInfo.coverUrl ? "Ảnh bìa bên cạnh được lấy từ trang đầu và sẽ tự tải lên nếu bạn không chọn ảnh khác. " : ""}
                  Nếu chọn chế độ đọc thử, chỉ phần đầu (theo ô Số trang xem thử) được tải lên, có watermark “{previewWatermark}”.
                </span>
              </span>
            ) : null}
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
              Upload JPG, PNG, WEBP hoặc dán URL ảnh
            </span>
            <input ref={coverInputRef} name="cover_image" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
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
          ref={accessModeRef}
          name="access_mode"
          defaultValue={document ? (document.isPreviewOnly === false ? "full" : "preview") : "full"}
          className="rounded border border-ink/12 px-3 py-2.5 font-normal outline-none transition focus:border-palm"
        >
          <option value="full">Bản đầy đủ - cho đọc hết</option>
          <option value="preview">Bản preview - chỉ đọc thử</option>
        </select>
      </label>

      <div className="rounded bg-paper p-4 text-sm leading-6 text-ink/68">
        PDF tối đa <strong>50MB</strong>. Ảnh bìa tối đa <strong>5MB</strong>, chỉ hỗ trợ JPG, PNG hoặc WEBP.
        Tài liệu địa chí có thể gắn nhiều xã/phường qua bảng <strong>document_communes</strong>.
      </div>

      <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-5">
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90 disabled:cursor-wait disabled:bg-palm/60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isUploading ? "Đang xử lý..." : "Lưu tài liệu"}
        </button>
      </div>
    </form>
  );
}
