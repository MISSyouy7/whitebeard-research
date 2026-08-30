import type { MetadataRoute } from "next";
import { categories, getAllArticles, getCapitalFlows, getHerPerspectiveEntries, getMainlines } from "@/lib/content";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://baihuzigl.com").replace(/\/$/, "");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/capital-flow", "/research", "/pro", "/weekly", "/quarterly", "/articles", "/mainline", "/board", "/her-perspective", "/about", "/join"].map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: ["", "/capital-flow", "/weekly"].includes(route) ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : ["/capital-flow", "/weekly", "/quarterly", "/join"].includes(route) ? 0.9 : 0.7,
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
    priority: article.access === "public" ? 0.8 : 0.7,
  }));
  const capitalFlowRoutes = getCapitalFlows().map((record) => ({
    url: `${siteUrl}/capital-flow/${record.slug}`,
    lastModified: record.date,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const mainlineRoutes = getMainlines().map((record) => ({
    url: `${siteUrl}/mainline/${record.slug}`,
    lastModified: record.date,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const industryRoutes = getMainlines().map((record) => ({
    url: `${siteUrl}/industry/${record.slug}`,
    lastModified: record.date,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));
  const perspectiveRoutes = getHerPerspectiveEntries().map((entry) => ({
    url: `${siteUrl}/her-perspective/${entry.slug}`,
    lastModified: entry.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...capitalFlowRoutes, ...mainlineRoutes, ...industryRoutes, ...articleRoutes, ...perspectiveRoutes, ...categoryRoutes];
}
