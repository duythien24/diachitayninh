import type { DocumentType } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function documentTypeLabel(type: DocumentType) {
  return type === "dia_chi" ? "Địa chí" : "Báo Tây Ninh";
}

export function typePrefix(type: "xa" | "phuong") {
  return type === "xa" ? "Xã" : "Phường";
}
