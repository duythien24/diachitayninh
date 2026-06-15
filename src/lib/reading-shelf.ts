export const readingShelfEvent = "dia-chi-reading-shelf-change";

const savedKey = "dia-chi-tay-ninh-saved";
const recentKey = "dia-chi-tay-ninh-recent";
const recentLimit = 24;

function readIds(key: string) {
  if (typeof window === "undefined") return [];

  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
    window.dispatchEvent(new CustomEvent(readingShelfEvent));
  } catch {
    // Browsing remains available when storage is disabled.
  }
}

export function getSavedDocumentIds() {
  return readIds(savedKey);
}

export function getRecentDocumentIds() {
  return readIds(recentKey);
}

export function toggleSavedDocument(documentId: string) {
  const current = getSavedDocumentIds();
  const isSaved = current.includes(documentId);
  writeIds(savedKey, isSaved ? current.filter((id) => id !== documentId) : [documentId, ...current]);
  return !isSaved;
}

export function addRecentDocument(documentId: string) {
  writeIds(recentKey, [documentId, ...getRecentDocumentIds().filter((id) => id !== documentId)].slice(0, recentLimit));
}

export function clearRecentDocuments() {
  writeIds(recentKey, []);
}
