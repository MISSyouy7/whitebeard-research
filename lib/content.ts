import fs from "node:fs";
import path from "node:path";

export type CategorySlug = "ai-industry" | "market-review" | "trading-cognition";
export type ResearchAccess = "public" | "zsxq";

export type ResearchEntry = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categorySlug: CategorySlug;
  access: ResearchAccess;
  status: "draft" | "published";
  author: "广路";
  readingTime: number;
  content: string;
  keyPoints: string[];
  zsxqUrl?: string;
};

export type WeeklyBrief = {
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  issue: string;
  state: string;
  focus: string[];
  status: "draft" | "published";
  content: string;
};

export const categories = [
  {
    slug: "ai-industry",
    name: "AI产业链研究",
    short: "AI研究",
    index: "01",
    description: "从算力、具身智能到物理 AI，持续核验产业环节、上市公司与业绩传导。",
  },
  {
    slug: "market-review",
    name: "A股市场复盘",
    short: "市场复盘",
    index: "02",
    description: "记录指数、量能、市场结构与主线变化，把盘面判断交给后续数据验证。",
  },
  {
    slug: "trading-cognition",
    name: "交易与认知",
    short: "交易认知",
    index: "03",
    description: "沉淀研究方法、交易纪律与复盘规则，不提供实时喊单或收益承诺。",
  },
] as const;

export const categoryAliases: Record<string, CategorySlug> = {
  "ai-compute-hardware": "ai-industry",
  "embodied-intelligence": "ai-industry",
  "physical-ai-applications": "ai-industry",
  "company-industry-tracking": "ai-industry",
  "industry-observation": "ai-industry",
  "company-research": "ai-industry",
  "macro-strategy": "market-review",
  "research-methods": "trading-cognition",
  "methods-tools": "trading-cognition",
};

export const legacyCategorySlugs = [
  "ai-compute-hardware",
  "embodied-intelligence",
  "physical-ai-applications",
  "company-industry-tracking",
  "research-methods",
] as const;

const contentDirectory = path.join(process.cwd(), "content", "articles");
const previewDirectory = path.join(process.cwd(), "content", "previews");
const weeklyDirectory = path.join(process.cwd(), "content", "weekly");

type FrontMatterValue = string | boolean | number | string[];

function unquote(value: string): string {
  const clean = value.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    return clean.slice(1, -1).replaceAll('\\"', '"').replaceAll("\\'", "'");
  }
  return clean;
}

function parseScalar(value: string): FrontMatterValue {
  const clean = value.trim();
  if (clean === "true") return true;
  if (clean === "false") return false;
  if (/^\d+(?:\.\d+)?$/.test(clean)) return Number(clean);
  if (clean.startsWith("[") && clean.endsWith("]")) {
    return clean
      .slice(1, -1)
      .split(",")
      .map((item) => unquote(item))
      .filter(Boolean);
  }
  return unquote(clean);
}

function parseDocument(raw: string, fileName: string): { data: Record<string, FrontMatterValue>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${fileName} is missing front matter.`);

  const data: Record<string, FrontMatterValue> = {};
  const lines = match[1].split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const separator = line.indexOf(":");
    if (separator < 1 || /^\s/.test(line)) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (rawValue) {
      data[key] = parseScalar(rawValue);
      continue;
    }

    const items: string[] = [];
    while (index + 1 < lines.length && /^\s+-\s+/.test(lines[index + 1])) {
      index += 1;
      items.push(unquote(lines[index].replace(/^\s+-\s+/, "")));
    }
    data[key] = items;
  }

  return { data, body: match[2].trim() };
}

function resolveCategorySlug(value: string): CategorySlug {
  const canonical = categoryAliases[value] ?? value;
  return categories.some((category) => category.slug === canonical) ? canonical as CategorySlug : "ai-industry";
}

export function getCategory(slug: string) {
  const canonical = resolveCategorySlug(slug);
  return categories.find((category) => category.slug === canonical);
}

function inferDate(fileName: string, value: FrontMatterValue | undefined): string {
  const explicit = String(value ?? "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(explicit)) return explicit;
  return fileName.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
}

function estimateReadingTime(content: string): number {
  const chineseCharacters = content.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords = content.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(chineseCharacters / 400 + latinWords / 200));
}

function parseResearchEntry(fileName: string, directory: string, access: ResearchAccess): ResearchEntry {
  const raw = fs.readFileSync(path.join(directory, fileName), "utf8");
  const { data, body } = parseDocument(raw, fileName);
  const categorySlug = resolveCategorySlug(String(data.categorySlug ?? "ai-industry"));
  const category = categories.find((item) => item.slug === categorySlug)?.name ?? "AI产业链研究";
  const keyPoints = Array.isArray(data.keyPoints) ? data.keyPoints.map(String) : [];
  const description = String(data.description ?? "");
  const readingSource = access === "public" ? body : `${description} ${keyPoints.join(" ")}`;

  return {
    slug: fileName.replace(/\.md$/, ""),
    title: String(data.title ?? fileName.replace(/\.md$/, "")),
    description,
    date: inferDate(fileName, data.date),
    category,
    categorySlug,
    access,
    status: data.status === "published" ? "published" : "draft",
    author: "广路",
    readingTime: estimateReadingTime(readingSource),
    content: access === "public" ? body : "",
    keyPoints,
    zsxqUrl: access === "zsxq" ? String(data.zsxqUrl ?? "") : undefined,
  };
}

function readResearchDirectory(directory: string, access: ResearchAccess): ResearchEntry[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => parseResearchEntry(fileName, directory, access));
}

export function getAllArticles(): ResearchEntry[] {
  return [...readResearchDirectory(contentDirectory, "public"), ...readResearchDirectory(previewDirectory, "zsxq")]
    .filter((article) => article.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export function getArticle(slug: string): ResearchEntry | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): ResearchEntry[] {
  const canonical = resolveCategorySlug(categorySlug);
  return getAllArticles().filter((article) => article.categorySlug === canonical);
}

function parseWeeklyBrief(fileName: string): WeeklyBrief {
  const raw = fs.readFileSync(path.join(weeklyDirectory, fileName), "utf8");
  const { data, body } = parseDocument(raw, fileName);

  return {
    slug: fileName.replace(/\.md$/, ""),
    title: String(data.title ?? fileName.replace(/\.md$/, "")),
    description: String(data.description ?? ""),
    startDate: String(data.startDate ?? ""),
    endDate: String(data.endDate ?? ""),
    issue: String(data.issue ?? "000"),
    state: String(data.state ?? "跟踪中"),
    focus: Array.isArray(data.focus) ? data.focus.map(String) : [],
    status: data.status === "published" ? "published" : "draft",
    content: body,
  };
}

export function getWeeklyBriefs(): WeeklyBrief[] {
  if (!fs.existsSync(weeklyDirectory)) return [];
  return fs
    .readdirSync(weeklyDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map(parseWeeklyBrief)
    .filter((brief) => brief.status === "published")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getLatestWeeklyBrief(): WeeklyBrief | undefined {
  return getWeeklyBriefs()[0];
}

export function formatDate(date: string): string {
  return date ? date.replaceAll("-", ".") : "日期待定";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value: string): string {
  const code: string[] = [];
  const images: string[] = [];
  const links: string[] = [];
  let result = escapeHtml(value);

  result = result.replace(/`([^`]+)`/g, (_, content: string) => {
    code.push(`<code>${content}</code>`);
    return `%%CODE${code.length - 1}%%`;
  });

  result = result.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt: string, src: string) => {
    const safeSrc = /^(https?:\/\/|\/)/.test(src) ? src : "";
    if (!safeSrc) return alt;
    images.push(`<img src="${safeSrc}" alt="${alt}" loading="lazy" decoding="async" />`);
    return `%%IMAGE${images.length - 1}%%`;
  });

  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
    const safeHref = /^(https?:\/\/|\/|#)/.test(href) ? href : "#";
    const external = safeHref.startsWith("http") ? ' target="_blank" rel="noreferrer"' : "";
    links.push(`<a href="${safeHref}"${external}>${label}</a>`);
    return `%%LINK${links.length - 1}%%`;
  });

  result = result
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

  result = result.replace(/%%CODE(\d+)%%/g, (_, index: string) => code[Number(index)]);
  result = result.replace(/%%IMAGE(\d+)%%/g, (_, index: string) => images[Number(index)]);
  return result.replace(/%%LINK(\d+)%%/g, (_, index: string) => links[Number(index)]);
}

function isBlockStart(line: string): boolean {
  return /^(#{1,3})\s|^>\s?|^[-*]\s+|^\d+\.\s+|^```|^---$/.test(line);
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trimEnd();
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      html.push(`<pre><code${language ? ` data-language="${escapeHtml(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length + 1;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (line === "---") {
      html.push("<hr />");
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trimStart().startsWith(">")) {
        quote.push(lines[index].trimStart().replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${inlineMarkdown(quote.join(" "))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(`<li>${inlineMarkdown(lines[index].trim().replace(/^[-*]\s+/, ""))}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(`<li>${inlineMarkdown(lines[index].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        index += 1;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return html.join("\n");
}
