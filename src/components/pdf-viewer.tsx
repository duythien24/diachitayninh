"use client";

// Book reader built on pdf.js, so it reads the same on phones (where PDFs in an iframe are blank on
// Android or stop at page 1 on iOS) as on desktop. Pages render only when scrolled near.
// Toolbar: page thumbnails, previous/next and go-to-page, zoom (fit width, fit page, steps),
// one or two pages side by side, open in new tab, download (full copies only), full screen.
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  ExternalLink,
  Maximize,
  Minimize,
  MoveHorizontal,
  PanelLeft,
  RectangleVertical,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

type Status = "loading" | "ready" | "error";
type Fit = "width" | "page" | "custom";

const ZOOM_STEPS = [0.5, 0.67, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
// CSS pixels for one PDF point at 100%.
const POINT = 96 / 72;

function PdfPage({
  pdf,
  pageNumber,
  width,
  ratio,
  root,
  onVisible,
  register,
  thumbnail = false
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  ratio: number;
  root: HTMLElement | null;
  onVisible?: (page: number) => void;
  register?: (page: number, element: HTMLDivElement | null) => void;
  thumbnail?: boolean;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(pageNumber <= 2);
  const [pageRatio, setPageRatio] = useState(ratio);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setNear(true);
          if (onVisible && entry.intersectionRatio > 0.5) onVisible(pageNumber);
        }
      },
      { root, rootMargin: thumbnail ? "400px 0px" : "1200px 0px", threshold: [0, 0.5] }
    );
    observer.observe(holder);
    return () => observer.disconnect();
  }, [onVisible, pageNumber, root, thumbnail]);

  useEffect(() => {
    if (!near || !width) return;
    let cancelled = false;
    let task: { cancel: () => void; promise: Promise<void> } | undefined;

    (async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      setPageRatio(base.height / base.width);
      // Sharp on high-density screens, but keep the canvas within what browsers handle well.
      const pixelRatio = thumbnail ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min((width / base.width) * pixelRatio, 4096 / base.width);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      task = page.render({ canvasContext: context, viewport });
      await task.promise.then(() => !cancelled && setRendered(true)).catch(() => undefined);
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [near, pdf, pageNumber, width, thumbnail]);

  const setRef = (element: HTMLDivElement | null) => {
    holderRef.current = element;
    register?.(pageNumber, element);
  };

  return (
    <div
      ref={setRef}
      data-page={pageNumber}
      className={`relative shrink-0 bg-white ${thumbnail ? "shadow-sm" : "shadow-[0_2px_14px_rgba(0,0,0,0.35)]"}`}
      style={{ width, height: width * pageRatio }}
    >
      {!rendered ? (
        <span className="absolute inset-0 grid place-items-center text-xs text-ink/35">{pageNumber}</span>
      ) : null}
      <canvas ref={canvasRef} className="relative block h-full w-full" aria-label={`Trang ${pageNumber}`} />
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  active = false,
  disabled = false,
  className = "",
  children
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded transition disabled:opacity-35 ${
        active ? "bg-white/20 text-brass" : "text-paper/85 hover:bg-white/10 hover:text-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function PdfViewer({
  url,
  title,
  badge,
  downloadable = false,
  initialPage = 1
}: {
  url: string;
  title: string;
  badge?: string;
  downloadable?: boolean;
  initialPage?: number;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [thumbScroller, setThumbScroller] = useState<HTMLDivElement | null>(null);
  const pageElements = useRef(new Map<number, HTMLDivElement>());
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [baseSize, setBaseSize] = useState({ width: 595, height: 842 });
  const [fit, setFit] = useState<Fit>("width");
  const [customScale, setCustomScale] = useState(1);
  const [spread, setSpread] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState("1");
  const [fullscreen, setFullscreen] = useState(false);
  // iPhone Safari has no element full screen; there the reader covers the window instead.
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const isFull = fullscreen || pseudoFullscreen;

  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        // Range requests: only the pages being read are downloaded, which matters for 40 MB scans on mobile data.
        loaded = await pdfjs.getDocument({ url, disableAutoFetch: true }).promise;
        const first = await loaded.getPage(1);
        const viewport = first.getViewport({ scale: 1 });
        if (cancelled) return;
        setBaseSize({ width: viewport.width, height: viewport.height });
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

  // Thumbnails open by default on wide screens.
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setShowThumbs(true);
  }, []);

  useEffect(() => {
    if (!scroller) return;
    const observer = new ResizeObserver(([entry]) => setArea({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [scroller]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!pseudoFullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [pseudoFullscreen]);

  const numPages = pdf?.numPages || 0;
  const ratio = baseSize.height / baseSize.width;
  const useSpread = spread && area.width >= 640;
  const padding = area.width < 640 ? 16 : 48;
  const gap = 12;

  const fitWidth = useMemo(() => {
    const available = Math.max(200, area.width - padding);
    return useSpread ? Math.min((available - gap) / 2, 760) : Math.min(available, 920);
  }, [area.width, padding, useSpread]);
  const fitPage = useMemo(() => Math.min(fitWidth, Math.max(200, (area.height - 32) / ratio)), [area.height, fitWidth, ratio]);
  const pageWidth = fit === "width" ? fitWidth : fit === "page" ? fitPage : baseSize.width * POINT * customScale;
  const percent = Math.round((pageWidth / (baseSize.width * POINT)) * 100);

  const rows = useMemo(() => {
    const pages = Array.from({ length: numPages }, (_, index) => index + 1);
    if (!useSpread) return pages.map((page) => [page]);
    // Book layout: the cover alone, then facing pages.
    const result: number[][] = [[1]];
    for (let page = 2; page <= numPages; page += 2) result.push(page + 1 <= numPages ? [page, page + 1] : [page]);
    return result;
  }, [numPages, useSpread]);

  const register = useCallback((page: number, element: HTMLDivElement | null) => {
    if (element) pageElements.current.set(page, element);
    else pageElements.current.delete(page);
  }, []);

  useEffect(() => {
    if (!scroller) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = scroller.scrollTop + scroller.clientHeight * 0.35;
        let page = 1;
        for (const [number, element] of pageElements.current) if (element.offsetTop <= line && number > page) page = number;
        setCurrentPage(page);
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [scroller]);
  useEffect(() => setPageInput(String(currentPage)), [currentPage]);

  const goTo = useCallback(
    (page: number) => {
      const target = Math.min(Math.max(1, page), numPages || 1);
      const element = pageElements.current.get(target);
      if (element && scroller) {
        scroller.scrollTo({ top: element.offsetTop - 16, behavior: "smooth" });
      }
      setCurrentPage(target);
    },
    [numPages, scroller]
  );

  // After switching layout or zoom, stay on the page being read.
  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;
  useEffect(() => {
    if (!scroller) return;
    const frame = requestAnimationFrame(() => {
      const element = pageElements.current.get(pageRef.current);
      if (element) scroller.scrollTop = element.offsetTop - 16;
    });
    return () => cancelAnimationFrame(frame);
  }, [useSpread, pageWidth, scroller]);

  // Opened from a search result (?trang=N): jump there once the pages are laid out.
  const jumped = useRef(initialPage <= 1);
  useEffect(() => {
    if (jumped.current || !pdf || !area.width || !scroller) return;
    const frame = requestAnimationFrame(() => {
      const element = pageElements.current.get(Math.min(initialPage, pdf.numPages));
      if (!element) return;
      scroller.scrollTop = element.offsetTop - 16;
      jumped.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [pdf, area.width, scroller, initialPage]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (!thumbScroller) return;
    const thumb = thumbScroller.querySelector<HTMLElement>(`[data-thumb="${currentPage}"]`);
    if (!thumb) return;
    const top = thumb.offsetTop - thumbScroller.clientHeight / 2 + thumb.clientHeight / 2;
    thumbScroller.scrollTo({ top, behavior: "smooth" });
  }, [currentPage, thumbScroller]);

  const step = useSpread ? 2 : 1;
  const previous = () => goTo(useSpread && currentPage > 1 ? currentPage - (currentPage % 2 === 0 ? 2 : 1) : currentPage - 1);
  const next = () => goTo(useSpread ? (currentPage === 1 ? 2 : currentPage + (currentPage % 2 === 0 ? 2 : 1)) : currentPage + step);

  const zoomBy = (direction: 1 | -1) => {
    const current = pageWidth / (baseSize.width * POINT);
    const nextStep =
      direction > 0 ? ZOOM_STEPS.find((value) => value > current + 0.01) : [...ZOOM_STEPS].reverse().find((value) => value < current - 0.01);
    setCustomScale(nextStep ?? (direction > 0 ? ZOOM_STEPS[ZOOM_STEPS.length - 1] : ZOOM_STEPS[0]));
    setFit("custom");
  };

  const toggleFullscreen = async () => {
    const shell = shellRef.current;
    if (!shell) return;
    if (isFull) {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      setPseudoFullscreen(false);
      return;
    }
    if (shell.requestFullscreen) {
      try {
        await shell.requestFullscreen();
        return;
      } catch {
        // fall through to the in-page version
      }
    }
    setPseudoFullscreen(true);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).tagName === "INPUT") return;
    const keys: Record<string, () => void> = {
      ArrowLeft: previous,
      PageUp: previous,
      ArrowRight: next,
      PageDown: next,
      Home: () => goTo(1),
      End: () => goTo(numPages),
      "+": () => zoomBy(1),
      "=": () => zoomBy(1),
      "-": () => zoomBy(-1),
      f: toggleFullscreen,
      Escape: () => pseudoFullscreen && setPseudoFullscreen(false)
    };
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  if (status === "error") {
    return <iframe src={url} title={title} className="h-[80vh] w-full bg-white" />;
  }

  const thumbWidth = 104;

  return (
    <div
      ref={shellRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={`flex scroll-mt-20 flex-col bg-[#3b3330] outline-none ${
        pseudoFullscreen ? "fixed inset-0 z-[100]" : fullscreen ? "h-screen" : "h-[calc(100vh-6rem)] min-h-[560px]"
      }`}
      aria-label={`Trình đọc: ${title}`}
    >
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-black/30 bg-ink px-2 text-sm text-paper sm:gap-2 sm:px-3">
        <ToolButton
          label={showThumbs ? "Ẩn danh sách trang" : "Hiện danh sách trang"}
          onClick={() => setShowThumbs((value) => !value)}
          active={showThumbs}
          className="hidden sm:grid"
        >
          <PanelLeft className="h-[18px] w-[18px]" aria-hidden="true" />
        </ToolButton>
        <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
          <span className="truncate font-semibold text-paper/90" title={title}>
            {title}
          </span>
          {badge ? <span className="shrink-0 rounded bg-brass/20 px-2 py-0.5 text-xs font-semibold text-brass">{badge}</span> : null}
        </div>

        <div className="flex flex-1 items-center justify-center gap-1 lg:flex-none">
          <ToolButton label="Trang trước" onClick={previous} disabled={currentPage <= 1}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </ToolButton>
          <form
            className="flex items-center gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              const page = Number(pageInput);
              if (Number.isFinite(page)) goTo(page);
            }}
          >
            <input
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value.replace(/\D/g, ""))}
              onBlur={() => setPageInput(String(currentPage))}
              inputMode="numeric"
              aria-label="Đến trang"
              className="h-8 w-12 rounded border border-white/15 bg-black/25 text-center text-sm text-white outline-none focus:border-brass"
            />
            <span className="whitespace-nowrap text-paper/70">/ {numPages || "…"}</span>
          </form>
          <ToolButton label="Trang sau" onClick={next} disabled={!numPages || currentPage >= numPages}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </ToolButton>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 lg:flex-1 lg:justify-end">
          <span className="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true" />
          <ToolButton label="Thu nhỏ" onClick={() => zoomBy(-1)} className="hidden sm:grid">
            <ZoomOut className="h-[18px] w-[18px]" aria-hidden="true" />
          </ToolButton>
          <span className="hidden w-12 text-center text-xs tabular-nums text-paper/75 sm:block">{percent}%</span>
          <ToolButton label="Phóng to" onClick={() => zoomBy(1)} className="hidden sm:grid">
            <ZoomIn className="h-[18px] w-[18px]" aria-hidden="true" />
          </ToolButton>
          <ToolButton label="Vừa chiều rộng" onClick={() => setFit("width")} active={fit === "width"} className="hidden md:grid">
            <MoveHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
          </ToolButton>
          <ToolButton label="Vừa trang" onClick={() => setFit("page")} active={fit === "page"} className="hidden md:grid">
            <RectangleVertical className="h-[18px] w-[18px]" aria-hidden="true" />
          </ToolButton>
          <ToolButton label={spread ? "Xem từng trang" : "Xem hai trang"} onClick={() => setSpread((value) => !value)} active={spread} className="hidden md:grid">
            <Columns2 className="h-[18px] w-[18px]" aria-hidden="true" />
          </ToolButton>
          <span className="mx-1 hidden h-6 w-px bg-white/15 md:block" aria-hidden="true" />
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Mở trong tab mới"
            aria-label="Mở trong tab mới"
            className="hidden h-9 w-9 place-items-center rounded text-paper/85 transition hover:bg-white/10 hover:text-white sm:grid"
          >
            <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
          {downloadable ? (
            <a
              href={url}
              download
              title="Tải về"
              aria-label="Tải về"
              className="hidden h-9 w-9 place-items-center rounded text-paper/85 transition hover:bg-white/10 hover:text-white sm:grid"
            >
              <Download className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
          ) : null}
          <ToolButton label={isFull ? "Thoát toàn màn hình" : "Toàn màn hình"} onClick={toggleFullscreen}>
            {isFull ? <Minimize className="h-[18px] w-[18px]" aria-hidden="true" /> : <Maximize className="h-[18px] w-[18px]" aria-hidden="true" />}
          </ToolButton>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {showThumbs && pdf ? (
          <div
            ref={setThumbScroller}
            className="relative hidden w-[140px] shrink-0 overflow-y-auto border-r border-black/30 bg-[#2c2523] px-4 py-4 sm:block"
            aria-label="Danh sách trang"
          >
            <div className="flex flex-col items-center gap-4">
              {Array.from({ length: numPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  data-thumb={page}
                  onClick={() => goTo(page)}
                  className={`flex flex-col items-center gap-1.5 rounded p-1 transition ${
                    page === currentPage ? "bg-brass/25 ring-2 ring-brass" : "hover:bg-white/10"
                  }`}
                  aria-label={`Trang ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  <PdfPage pdf={pdf} pageNumber={page} width={thumbWidth} ratio={ratio} root={thumbScroller} thumbnail />
                  <span className={`text-xs ${page === currentPage ? "font-semibold text-brass" : "text-paper/60"}`}>{page}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div ref={setScroller} className="relative min-w-0 flex-1 overflow-auto" style={{ padding: `16px ${padding / 2}px` }}>
          {status === "loading" ? (
            <div className="grid h-full place-items-center text-sm text-paper/70">Đang mở tài liệu…</div>
          ) : null}
          {pdf && area.width ? (
            <div className="mx-auto flex w-max min-w-full flex-col items-center gap-4">
              {rows.map((row) => (
                <div key={row[0]} className="flex justify-center" style={{ gap }}>
                  {row.map((page) => (
                    <PdfPage
                      key={page}
                      pdf={pdf}
                      pageNumber={page}
                      width={pageWidth}
                      ratio={ratio}
                      root={scroller}
                      register={register}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
