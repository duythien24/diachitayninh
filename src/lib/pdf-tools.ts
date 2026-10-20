"use client";

// Browser-side PDF helpers for the admin form: read page count, cut a watermarked preview, render a cover image.
// Everything runs in the admin's browser, so the full scan never has to be uploaded when only a preview is published.
import { PDFDocument, degrees } from "pdf-lib";

export const previewWatermark = "Bản đọc tham khảo - Thư viện tỉnh Tây Ninh";

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs;
}

export async function getPdfPageCount(file: File) {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  return pdf.getPageCount();
}

/** Draws the watermark with the browser's own fonts (pdf-lib's built-in fonts cannot render Vietnamese). */
async function watermarkImage(text: string) {
  const canvas = document.createElement("canvas");
  const fontSize = 40;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Trình duyệt không hỗ trợ vẽ watermark.");

  context.font = `600 ${fontSize}px "Be Vietnam Pro", Arial, sans-serif`;
  canvas.width = Math.ceil(context.measureText(text).width) + 40;
  canvas.height = fontSize + 30;
  context.font = `600 ${fontSize}px "Be Vietnam Pro", Arial, sans-serif`;
  context.fillStyle = "rgba(168, 54, 42, 0.55)";
  context.textBaseline = "middle";
  context.fillText(text, 20, canvas.height / 2);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Không tạo được watermark.");
  return { bytes: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height };
}

/** Keeps the first `pageLimit` pages and stamps the library watermark across each page. */
export async function makePreviewPdf(file: File, pageLimit: number) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const total = source.getPageCount();
  const keep = Math.max(1, Math.min(pageLimit || 10, total));
  const preview = await PDFDocument.create();
  const pages = await preview.copyPages(source, Array.from({ length: keep }, (_, index) => index));
  const mark = await watermarkImage(previewWatermark);
  const markImage = await preview.embedPng(mark.bytes);

  for (const page of pages) {
    preview.addPage(page);
    const { width, height } = page.getSize();
    const markWidth = width * 0.8;
    const markHeight = (markWidth / mark.width) * mark.height;
    // Diagonal across the middle, plus a small line at the foot of the page.
    page.drawImage(markImage, {
      x: width * 0.1 + markHeight * 0.7,
      y: height * 0.35,
      width: markWidth,
      height: markHeight,
      opacity: 0.35,
      rotate: degrees(35)
    });
    page.drawImage(markImage, { x: width * 0.05, y: 12, width: width * 0.45, height: (width * 0.45 * mark.height) / mark.width, opacity: 0.8 });
  }

  const bytes = await preview.save();
  const name = file.name.replace(/\.pdf$/i, "") + `-doc-thu-${keep}-trang.pdf`;
  return { file: new File([new Uint8Array(bytes)], name, { type: "application/pdf" }), keptPages: keep, totalPages: total };
}

/** Renders page 1 as a JPEG cover, about 600 px wide. */
export async function renderPdfCover(file: File) {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: 600 / base.width });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Trình duyệt không hỗ trợ vẽ ảnh bìa.");

  await page.render({ canvasContext: context, viewport }).promise;
  await pdf.destroy();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("Không tạo được ảnh bìa từ PDF.");
  return new File([blob], file.name.replace(/\.pdf$/i, "") + "-bia.jpg", { type: "image/jpeg" });
}

/**
 * Text from the first pages: the PDF's own text layer when it has one, otherwise OCR (Vietnamese) of the page images.
 * Scanned books usually have no text layer, so OCR is the common path; it downloads the Vietnamese model on first use.
 */
export async function readFirstPagesText(file: File, pageLimit = 3, onProgress?: (message: string) => void) {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = Math.min(pageLimit, pdf.numPages);
  const texts: string[] = [];

  for (let number = 1; number <= pages; number++) {
    const page = await pdf.getPage(number);
    const content = await page.getTextContent();
    texts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }

  if (texts.join("").replace(/\s/g, "").length >= 40) {
    await pdf.destroy();
    return texts.join("\f");
  }

  onProgress?.("Trang đầu là ảnh scan, đang nhận dạng chữ (lần đầu cần tải bộ chữ tiếng Việt)...");
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("vie");
  const ocrTexts: string[] = [];

  try {
    for (let number = 1; number <= pages; number++) {
      onProgress?.(`Đang nhận dạng chữ trang ${number}/${pages}...`);
      const page = await pdf.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(2.5, 1600 / base.width) });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) continue;
      await page.render({ canvasContext: context, viewport }).promise;
      const result = await worker.recognize(canvas);
      ocrTexts.push(result.data.text);
    }
  } finally {
    await worker.terminate();
    await pdf.destroy();
  }

  return ocrTexts.join("\f");
}

export type GuessedDetails = { year?: number; publisher?: string; author?: string };

/** "BÙI-QUANG-TUNG" → "Bùi Quang Tung": old prints hyphenate syllables and set names in capitals. */
function tidyName(value: string) {
  return value
    .replace(/[-–]/g, " ")
    .replace(/[^\p{L}\s.]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("vi")
    .replace(/(^|\s)(\p{L})/gu, (match) => match.toLocaleUpperCase("vi"));
}

const creditLine = /(kh[ảa]o|bi[êe]n|t[áa]c)[-\s]?(so[ạa]n|gi[ảa]|d[ịi]ch)|ch[ủu][-\s]?bi[êe]n/i;

/**
 * Best-effort guesses from title-page text (pages separated by form feeds); the admin always reviews them.
 * Only page 1 is trusted for the year, because later pages quote historical dates.
 */
export function guessBookDetails(text: string): GuessedDetails {
  const pages = text.split("\f");
  const linesOf = (pageText: string) =>
    pageText
      .split(/\n+/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter((line) => line.length > 2);
  const firstLines = linesOf(pages[0] || "");
  const allLines = pages.flatMap(linesOf);
  const thisYear = new Date().getFullYear();

  const years = [...(pages[0] || "").matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)]
    .map((match) => Number(match[1]))
    .filter((year) => year <= thisYear);

  let publisher: string | undefined;
  for (const line of allLines) {
    const named = line.match(/(?:nh[àa][-\s]xu[ấa]t[-\s]b[ảa]n|NXB)\s*[:.]?\s*(.+)/i);
    const by = line.match(/(?:^|\s)do\s+(.+?)\s+xu[ấa]t[-\s]b[ảa]n/i);
    const found = named?.[1] || by?.[1];
    if (found) {
      publisher = tidyName(found.replace(/\s+(t[ạa]i|n[ăa]m)\s.*$/i, ""));
      break;
    }
  }

  let author: string | undefined;
  for (const [index, line] of firstLines.entries()) {
    if (!creditLine.test(line)) continue;
    const inline = line.replace(creditLine, "").replace(/^[\s:.‹›-]+/, "").trim();
    const candidate = inline.length > 4 ? inline : firstLines[index - 1];
    if (candidate && candidate.length < 60) {
      author = tidyName(candidate);
      break;
    }
  }

  return { year: years.length ? Math.max(...years) : undefined, publisher: publisher || undefined, author: author || undefined };
}
