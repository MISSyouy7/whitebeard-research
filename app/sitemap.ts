import type { MetadataRoute } from "next";
import { categories, getAllArticles } from "@/lib/content";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://baihuzigl.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/articles", "/about"].map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.8,
  }));
  const categoryRoutes = categories.map((category) => ({
    url: `${siteUrl}/categories/${category.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const articleRoutes = getAllArticles().map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: article.date,
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
