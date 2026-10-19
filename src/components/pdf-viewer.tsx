"use client";

// Renders a PDF page by page with pdf.js, so it reads the same on phones (where PDFs in an iframe
// are blank on Android or stop at page 1 on iOS) as on desktop. Pages render only when scrolled near.
import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

type Status = "loading" | "ready" | "error";

function PdfPage({ pdf, pageNumber, width, onVisible }: { pdf: PDFDocumentProxy; pageNumber: number; width: number; onVisible: (page: number) => void }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(pageNumber <= 2);
  const [ratio, setRatio] = useState(1.414);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setNear(true);
          if (entry.intersectionRatio > 0.4) onVisible(pageNumber);
        }
      },
      { rootMargin: "800px 0px", threshold: [0, 0.4] }
    );
    observer.observe(holder);
    return () => observer.disconnect();
  }, [onVisible, pageNumber]);

  useEffect(() => {
    if (!near || !width) return;
    let cancelled = false;
    let task: { cancel: () => void; promise: Promise<void> } | undefined;

    (async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      setRatio(base.height / base.width);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: (width / base.width) * pixelRatio });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      task = page.render({ canvasContext: context, viewport });
      await task.promise.catch(() => undefined);
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [near, pdf, pageNumber, width]);

  return (
    <div ref={holderRef} className="mx-auto bg-white shadow-book" style={{ width, height: width * ratio }}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-label={`Trang ${pageNumber}`} />
    </div>
  );
}

export function PdfViewer({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        // Range requests: only the pages being read are downloaded, which matters for 40 MB scans on mobile data.
        loaded = await pdfjs.getDocument({ url, disableAutoFetch: true }).promise;
        if (cancelled) return;
        setPdf(loaded);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      loaded?.destroy();
    };
  }, [url]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleVisible = useCallback((page: number) => setCurrentPage(page), []);
  const pageWidth = Math.max(240, Math.min(containerWidth - 24, 900) * zoom);

  if (status === "error") {
    return <iframe src={url} title={title} className="h-[76vh] w-full bg-white" />;
  }

  return (
    <div ref={containerRef} className="relative bg-sand/60">
      <div className="sticky top-16 z-10 flex items-center justify-between gap-3 border-b border-ink/10 bg-white/95 px-4 py-2 text-sm backdrop-blur">
        <span className="text-ink/65">
          {status === "loading" ? "Đang tải tài liệu..." : `Trang ${currentPage} / ${pdf?.numPages}`}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(0.6, Math.round((value - 0.2) * 10) / 10))}
            className="grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-paper"
            aria-label="Thu nhỏ"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-12 text-center text-xs text-ink/60">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(2.4, Math.round((value + 0.2) * 10) / 10))}
            className="grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-paper"
            aria-label="Phóng to"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </span>
      </div>
      <div className="h-[76vh] overflow-auto px-3 py-4">
        <div className="flex flex-col gap-4" style={{ width: zoom > 1 ? pageWidth + 24 : undefined }}>
          {pdf && containerWidth
            ? Array.from({ length: pdf.numPages }, (_, index) => (
                <PdfPage key={index + 1} pdf={pdf} pageNumber={index + 1} width={pageWidth} onVisible={handleVisible} />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
