const fallbackSiteUrl = "https://diachitayninh.vercel.app";

function normalizeUrl(url?: string) {
  if (!url?.trim()) return fallbackSiteUrl;
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export const siteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL);

export const siteName = "Địa chí số Tây Ninh";
export const siteDescription = "Kho đọc trực tuyến tài liệu địa chí, Báo Tây Ninh và tài liệu cấp tỉnh dạng số.";
