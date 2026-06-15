"use client";

import { useEffect } from "react";

import { addRecentDocument } from "@/lib/reading-shelf";

export function ReadingHistoryTracker({ documentId }: { documentId: string }) {
  useEffect(() => addRecentDocument(documentId), [documentId]);
  return null;
}
