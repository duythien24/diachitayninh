"use client";

import { useEffect } from "react";

type DocumentEventType = "detail_view" | "pdf_open";

const visitorStorageKey = "dia-chi-tay-ninh-visitor";

function getVisitorId() {
  const existing = window.localStorage.getItem(visitorStorageKey);
  if (existing) return existing;

  const generated = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(visitorStorageKey, generated);
  return generated;
}

export function DocumentEventTracker({ documentId, eventType }: { documentId: string; eventType: DocumentEventType }) {
  useEffect(() => {
    const date = new Date().toISOString().slice(0, 10);
    const sentKey = `dia-chi-event:${date}:${eventType}:${documentId}`;

    if (window.localStorage.getItem(sentKey)) return;

    const controller = new AbortController();

    void fetch("/api/analytics/document-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, eventType, visitorId: getVisitorId() }),
      signal: controller.signal,
      keepalive: true
    }).then((response) => {
      if (response.ok) window.localStorage.setItem(sentKey, "1");
    }).catch(() => undefined);

    return () => controller.abort();
  }, [documentId, eventType]);

  return null;
}
