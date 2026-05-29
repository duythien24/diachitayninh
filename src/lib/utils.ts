import type { CommuneType, DocumentType } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function normalizeVietnamese(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function slugify(value: string) {
  return normalizeVietnamese(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function documentTypeLabel(type: DocumentType) {
  if (type === "dia_chi") return "Địa chí";
  if (type === "bao_tay_ninh") return "Báo Tây Ninh";
  return "Tài liệu cấp tỉnh";
}

export function documentTypeShortLabel(type: DocumentType) {
  if (type === "dia_chi") return "Địa chí";
  if (type === "bao_tay_ninh") return "Báo chí";
  return "Cấp tỉnh";
}

export function typePrefix(type: CommuneType) {
  return type === "xa" ? "Xã" : "Phường";
}

export function communeDescription(name: string, type: CommuneType) {
  const unitType = type === "phuong" ? "phường" : "xã";
  return `Kho tư liệu địa chí, báo chí địa phương và tài liệu liên quan đến ${unitType} ${name} trên địa bàn tỉnh Tây Ninh.`;
}
