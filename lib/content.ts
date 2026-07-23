import fs from "node:fs";
import path from "node:path";

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categorySlug: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
  issue: string;
  status: "draft" | "published";
  content: string;
};

export const categories = [
  {
    slug: "ai-compute-hardware",
    name: "AI算力与硬件",
    short: "算力",
    index: "01",
    description: "跟踪芯片、服务器、光通信、PCB、液冷与电源等关键环节。",
  },
  {
    slug: "embodied-intelligence",
    name: "具身智能",
    short: "具身",
    index: "02",
    description: "拆解机器人本体、执行器、传感器、控制系统与核心零部件。",
  },
  {
    slug: "physical-ai-applications",
    name: "物理AI与应用",
    short: "物理",
    index: "03",
    description: "研究自动驾驶、工业机器人、无人机与智能制造的真实落地。",
  },
  {
    slug: "company-industry-tracking",
    name: "公司与产业跟踪",
    short: "跟踪",
    index: "04",
    description: "用公告、财报、订单、产能与经营数据持续验证产业逻辑。",
  },
  {
    slug: "research-methods",
    name: "研究方法",
    short: "方法",
    index: "05",
    description: "公开信息源、研究框架、反方证据与判断修正过程。",
  },
] as const;

const contentDirectory = path.join(process.cwd(), "content", "articles");

function parseValue(value: string): string | boolean | number | string[] {
  const clean = value.trim();
  if (clean === "true") return true;
  if (clean === "false") return false;
  if (/^\d+$/.test(clean)) return Number(clean);
  if (clean.startsWith("[") && clean.endsWith("]")) {
    return clean
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }
  return clean.replace(/^['"]|['"]$/g, "");
}

function parseArticle(fileName: string): Article {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(contentDirectory, fileName), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error(`Article ${fileName} is missing front matter.`);
  }

  const data: Record<string, string | boolean | number | string[]> = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    data[line.slice(0, separator).trim()] = parseValue(line.slice(separator + 1));
  }

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    category: String(data.category ?? "未分类"),
    categorySlug: String(data.categorySlug ?? "uncategorized"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: Number(data.readingTime ?? 5),
    featured: Boolean(data.featured ?? false),
    issue: String(data.issue ?? "000"),
    status: data.status === "published" ? "published" : "draft",
    content: match[2].trim(),
  };
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(contentDirectory)) return [];
  return fs
    .readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map(parseArticle)
    .filter((article) => article.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return getAllArticles().filter((article) => article.categorySlug === categorySlug);
}

export function formatDate(date: string): string {
  return date.replaceAll("-", ".");
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
  const links: string[] = [];
  let result = escapeHtml(value);

  result = result.replace(/`([^`]+)`/g, (_, content: string) => {
    code.push(`<code>${content}</code>`);
    return `%%CODE${code.length - 1}%%`;
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
