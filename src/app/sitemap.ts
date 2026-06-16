import type { MetadataRoute } from "next";

import { getCommunes, getDocuments } from "@/lib/repository";
import { siteUrl } from "@/lib/site-config";

function url(path: string) {
  return `${siteUrl}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [communes, documents] = await Promise.all([getCommunes(), getDocuments()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: url("/tai-lieu"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: url("/xa-phuong"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: url("/bo-suu-tap"), lastModified: now, changeFrequency: "weekly", priority: 0.84 },
    { url: url("/dong-thoi-gian"), lastModified: now, changeFrequency: "weekly", priority: 0.82 },
    { url: url("/gioi-thieu"), lastModified: now, changeFrequency: "monthly", priority: 0.7 }
  ];

  const communeRoutes: MetadataRoute.Sitemap = communes.map((commune) => ({
    url: url(`/xa-phuong/${commune.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75
  }));

  const documentRoutes: MetadataRoute.Sitemap = documents.map((document) => ({
    url: url(`/tai-lieu/${document.slug}`),
    lastModified: document.createdAt ? new Date(document.createdAt) : now,
    changeFrequency: "monthly",
    priority: document.isPreviewOnly ? 0.65 : 0.75
  }));

  return [...staticRoutes, ...communeRoutes, ...documentRoutes];
}
