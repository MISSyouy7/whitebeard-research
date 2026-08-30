import { parse as parseYaml } from "yaml";
import { generatedContent } from "./generated-content";

export type PublishStatus = "draft" | "published";
export type CategorySlug = "ai-industry" | "market-review" | "trading-cognition";
export type ResearchAccess = "public" | "zsxq";
export type MainlineStage = "萌芽" | "基础设施建设" | "爆发" | "生态竞争" | "重构";
export type CapitalStrength = "偏强" | "中性" | "偏弱" | "待核验";
export type ResearchHeat = "高" | "中" | "低" | "待核验";
export type QuarterlyStatus = "upcoming" | "published";

export type ResearchEntry = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  categorySlug: CategorySlug;
  access: ResearchAccess;
  status: PublishStatus;
  author: "广路";
  readingTime: number;
  content: string;
  keyPoints: string[];
  zsxqUrl?: string;
  updatedAt: string;
  reportType: "company" | "industry" | "market" | "method";
  companyName?: string;
  stockCode?: string;
  industrySlugs: string[];
  tags: string[];
  pdfFile?: string;
  accessModel: "public_full" | "public_preview" | "external_member";
};

export type PublicResearchCard = Pick<
  ResearchEntry,
  | "slug"
  | "title"
  | "description"
  | "category"
  | "updatedAt"
  | "companyName"
  | "stockCode"
  | "industrySlugs"
  | "tags"
  | "pdfFile"
>;

export type WeeklyBrief = {
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  issue: string;
  state: string;
  focus: string[];
  status: PublishStatus;
  content: string;
};

export type QuarterlyReport = {
  slug: string;
  title: string;
  quarter: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  publishedAt: string;
  status: QuarterlyStatus;
  summary: string;
  keyFindings: string[];
  outline: string[];
  coverImage?: string;
  previewImages: string[];
  previewFile?: string;
  zsxqUrl?: string;
  sources: string[];
  risks: string[];
  content: string;
};

export type DirectionItem = {
  name: string;
  reason: string;
  evidence: string;
};

export type CapitalFlowRecord = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  dataCutoff: string;
  coreIndustry: string;
  continuity: string;
  inflows: DirectionItem[];
  outflows: DirectionItem[];
  logic: string;
  methodology: string;
  counterEvidence: string;
  sources: string[];
  risks: string[];
  status: PublishStatus;
  content: string;
};

export type CompanyMapping = {
  name: string;
  role: string;
  evidenceStatus: string;
};

export type MainlineRecord = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  industry: string;
  currentStage: MainlineStage;
  stageBasis: string;
  industryTraits: string[];
  representativeLinks: string[];
  companyMappings: CompanyMapping[];
  capitalBehavior: string;
  catalysts: string[];
  risks: string[];
  falsification: string[];
  trackingIndicators: string[];
  sources: string[];
  status: PublishStatus;
  content: string;
};

export type BoardPiece = {
  name: string;
  stage: MainlineStage;
  capitalStrength: CapitalStrength;
  researchHeat: ResearchHeat;
  capitalDirection: string;
  evidenceStatus: string;
  updatedAt: string;
  evidence: string;
};

export type BoardSnapshot = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  dataCutoff: string;
  pieces: BoardPiece[];
  sources: string[];
  risks: string[];
  status: PublishStatus;
};

export type HerPerspectiveEntry = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  issue: string;
  cover: string;
  images: string[];
  marketContext: string;
  keyData: string[];
  explanation: string;
  womenInsight: string;
  risks: string;
  source: string;
  videoUrl?: string;
  status: PublishStatus;
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

export const mainlineStages: MainlineStage[] = ["萌芽", "基础设施建设", "爆发", "生态竞争", "重构"];

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

type ContentGroup = "articles" | "previews" | "weekly" | "quarterly" | "capital-flow" | "mainline" | "boards" | "her-perspective";
type ParsedDocument = { data: Record<string, unknown>; body: string };

const contentGroups = generatedContent as unknown as Record<ContentGroup, Record<string, string>>;

function parseDocument(raw: string, fileName: string): ParsedDocument {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${fileName} is missing front matter.`);
  const parsed = parseYaml(match[1]);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${fileName} has invalid front matter.`);
  return { data: parsed as Record<string, unknown>, body: match[2].trim() };
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => asString(item)).filter(Boolean) : [];
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
}

function publishedStatus(value: unknown): PublishStatus {
  return value === "published" ? "published" : "draft";
}

function readGroup(group: ContentGroup): Array<[string, string]> {
  return Object.entries(contentGroups[group] ?? {});
}

function resolveCategorySlug(value: string): CategorySlug {
  const canonical = categoryAliases[value] ?? value;
  return categories.some((category) => category.slug === canonical) ? canonical as CategorySlug : "ai-industry";
}

export function getCategory(slug: string) {
  const canonical = resolveCategorySlug(slug);
  return categories.find((category) => category.slug === canonical);
}

function inferDate(fileName: string, value: unknown): string {
  const explicit = asString(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(explicit)) return explicit;
  return fileName.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
}

function estimateReadingTime(content: string): number {
  const chineseCharacters = content.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords = content.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(chineseCharacters / 400 + latinWords / 200));
}

function parseResearchEntry(fileName: string, raw: string, access: ResearchAccess): ResearchEntry {
  const { data, body } = parseDocument(raw, fileName);
  const categorySlug = resolveCategorySlug(asString(data.categorySlug, "ai-industry"));
  const category = categories.find((item) => item.slug === categorySlug)?.name ?? "AI产业链研究";
  const keyPoints = asStringArray(data.keyPoints);
  const description = asString(data.description);
  const readingSource = access === "public" ? body : `${description} ${keyPoints.join(" ")}`;
  const reportType = asString(data.reportType, categorySlug === "market-review" ? "market" : categorySlug === "trading-cognition" ? "method" : "industry") as ResearchEntry["reportType"];

  return {
    slug: fileName.replace(/\.md$/, ""),
    title: asString(data.title, fileName.replace(/\.md$/, "")),
    description,
    date: inferDate(fileName, data.date),
    category,
    categorySlug,
    access,
    status: publishedStatus(data.status),
    author: "广路",
    readingTime: estimateReadingTime(readingSource),
    content: access === "public" ? body : "",
    keyPoints,
    zsxqUrl: access === "zsxq" ? asString(data.zsxqUrl) : undefined,
    updatedAt: asString(data.updatedAt, inferDate(fileName, data.date)),
    reportType: (["company", "industry", "market", "method"] as const).includes(reportType) ? reportType : "industry",
    companyName: asString(data.companyName) || undefined,
    stockCode: asString(data.stockCode) || undefined,
    industrySlugs: asStringArray(data.industrySlugs),
    tags: asStringArray(data.tags),
    pdfFile: access === "public" ? asString(data.pdfFile) || undefined : undefined,
    accessModel: access === "public" ? "public_full" : "external_member",
  };
}

export function getAllArticles(): ResearchEntry[] {
  return [
    ...readGroup("articles").map(([fileName, raw]) => parseResearchEntry(fileName, raw, "public")),
    ...readGroup("previews").map(([fileName, raw]) => parseResearchEntry(fileName, raw, "zsxq")),
  ]
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

export function getPublicResearch(): ResearchEntry[] {
  return getAllArticles().filter((article) => article.accessModel === "public_full");
}

export function getPublicResearchCards(): PublicResearchCard[] {
  return getPublicResearch().map(({ slug, title, description, category, updatedAt, companyName, stockCode, industrySlugs, tags, pdfFile }) => ({
    slug,
    title,
    description,
    category,
    updatedAt,
    companyName,
    stockCode,
    industrySlugs,
    tags,
    pdfFile,
  }));
}

function parseWeeklyBrief(fileName: string, raw: string): WeeklyBrief {
  const { data, body } = parseDocument(raw, fileName);
  return {
    slug: fileName.replace(/\.md$/, ""),
    title: asString(data.title, fileName.replace(/\.md$/, "")),
    description: asString(data.description),
    startDate: asString(data.startDate),
    endDate: asString(data.endDate),
    issue: asString(data.issue, "000"),
    state: asString(data.state, "跟踪中"),
    focus: asStringArray(data.focus),
    status: publishedStatus(data.status),
    content: body,
  };
}

export function getWeeklyBriefs(): WeeklyBrief[] {
  return readGroup("weekly")
    .map(([fileName, raw]) => parseWeeklyBrief(fileName, raw))
    .filter((brief) => brief.status === "published")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getLatestWeeklyBrief(): WeeklyBrief | undefined {
  return getWeeklyBriefs()[0];
}

function parseQuarterlyReport(fileName: string, raw: string): QuarterlyReport {
  const { data, body } = parseDocument(raw, fileName);
  const rawStatus = asString(data.status, "upcoming");
  return {
    slug: fileName.replace(/\.md$/, ""),
    title: asString(data.title),
    quarter: asString(data.quarter),
    startDate: asString(data.startDate),
    endDate: asString(data.endDate),
    dueDate: asString(data.dueDate),
    publishedAt: asString(data.publishedAt),
    status: rawStatus === "published" ? "published" : "upcoming",
    summary: asString(data.summary),
    keyFindings: asStringArray(data.keyFindings),
    outline: asStringArray(data.outline),
    coverImage: asString(data.coverImage) || undefined,
    previewImages: asStringArray(data.previewImages),
    previewFile: asString(data.previewFile) || undefined,
    zsxqUrl: asString(data.zsxqUrl) || undefined,
    sources: asStringArray(data.sources),
    risks: asStringArray(data.risks),
    content: body,
  };
}

export function getQuarterlyReports(): QuarterlyReport[] {
  return readGroup("quarterly")
    .map(([fileName, raw]) => parseQuarterlyReport(fileName, raw))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getLatestQuarterlyReport(): QuarterlyReport | undefined {
  return getQuarterlyReports()[0];
}

function parseDirections(value: unknown): DirectionItem[] {
  return asRecordArray(value).map((item) => ({
    name: asString(item.name),
    reason: asString(item.reason),
    evidence: asString(item.evidence),
  }));
}

function parseCapitalFlow(fileName: string, raw: string): CapitalFlowRecord {
  const { data, body } = parseDocument(raw, fileName);
  return {
    slug: fileName.replace(/\.md$/, ""),
    title: asString(data.title),
    summary: asString(data.summary),
    date: inferDate(fileName, data.date),
    dataCutoff: asString(data.dataCutoff),
    coreIndustry: asString(data.coreIndustry),
    continuity: asString(data.continuity),
    inflows: parseDirections(data.inflows),
    outflows: parseDirections(data.outflows),
    logic: asString(data.logic),
    methodology: asString(data.methodology),
    counterEvidence: asString(data.counterEvidence),
    sources: asStringArray(data.sources),
    risks: asStringArray(data.risks),
    status: publishedStatus(data.status),
    content: body,
  };
}

export function getCapitalFlows(): CapitalFlowRecord[] {
  return readGroup("capital-flow")
    .map(([fileName, raw]) => parseCapitalFlow(fileName, raw))
    .filter((item) => item.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export function getCapitalFlow(slug: string): CapitalFlowRecord | undefined {
  return getCapitalFlows().find((item) => item.slug === slug);
}

export function getLatestCapitalFlow(): CapitalFlowRecord | undefined {
  return getCapitalFlows()[0];
}

function parseCompanyMappings(value: unknown): CompanyMapping[] {
  return asRecordArray(value).map((item) => ({
    name: asString(item.name),
    role: asString(item.role),
    evidenceStatus: asString(item.evidenceStatus),
  }));
}

function parseMainline(fileName: string, raw: string): MainlineRecord {
  const { data, body } = parseDocument(raw, fileName);
  const stage = asString(data.currentStage, "萌芽") as MainlineStage;
  return {
    slug: fileName.replace(/\.md$/, ""),
    title: asString(data.title),
    summary: asString(data.summary),
    date: inferDate(fileName, data.date),
    industry: asString(data.industry),
    currentStage: mainlineStages.includes(stage) ? stage : "萌芽",
    stageBasis: asString(data.stageBasis),
    industryTraits: asStringArray(data.industryTraits),
    representativeLinks: asStringArray(data.representativeLinks),
    companyMappings: parseCompanyMappings(data.companyMappings),
    capitalBehavior: asString(data.capitalBehavior),
    catalysts: asStringArray(data.catalysts),
    risks: asStringArray(data.risks),
    falsification: asStringArray(data.falsification),
    trackingIndicators: asStringArray(data.trackingIndicators),
    sources: asStringArray(data.sources),
    status: publishedStatus(data.status),
    content: body,
  };
}

export function getMainlines(): MainlineRecord[] {
  return readGroup("mainline")
    .map(([fileName, raw]) => parseMainline(fileName, raw))
    .filter((item) => item.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export function getMainline(slug: string): MainlineRecord | undefined {
  return getMainlines().find((item) => item.slug === slug);
}

export function getResearchStats() {
  const publicResearch = getPublicResearch();
  const mainlines = getMainlines();
  const companies = new Set([
    ...publicResearch.map((item) => item.companyName).filter(Boolean),
    ...mainlines.flatMap((item) => item.companyMappings.map((company) => company.name)),
  ]);
  const industries = new Set([
    ...publicResearch.flatMap((item) => item.industrySlugs),
    ...mainlines.map((item) => item.industry).filter(Boolean),
  ]);
  return { companies: companies.size, industries: industries.size, reports: publicResearch.length };
}

function parseBoard(fileName: string, raw: string): BoardSnapshot {
  const { data } = parseDocument(raw, fileName);
  const pieces = asRecordArray(data.pieces).map((item) => {
    const stage = asString(item.stage, "萌芽") as MainlineStage;
    const strength = asString(item.capitalStrength, "待核验") as CapitalStrength;
    const heat = asString(item.researchHeat, "待核验") as ResearchHeat;
    return {
      name: asString(item.name),
      stage: mainlineStages.includes(stage) ? stage : "萌芽",
      capitalStrength: (["偏强", "中性", "偏弱", "待核验"] as const).includes(strength) ? strength : "待核验",
      researchHeat: (["高", "中", "低", "待核验"] as const).includes(heat) ? heat : "待核验",
      capitalDirection: asString(item.capitalDirection),
      evidenceStatus: asString(item.evidenceStatus, "待核验"),
      updatedAt: asString(item.updatedAt),
      evidence: asString(item.evidence),
    };
  });
  return {
    slug: fileName.replace(/\.md$/, ""),
    title: asString(data.title),
    summary: asString(data.summary),
    date: inferDate(fileName, data.date),
    dataCutoff: asString(data.dataCutoff),
    pieces,
    sources: asStringArray(data.sources),
    risks: asStringArray(data.risks),
    status: publishedStatus(data.status),
  };
}

export function getBoards(): BoardSnapshot[] {
  return readGroup("boards")
    .map(([fileName, raw]) => parseBoard(fileName, raw))
    .filter((item) => item.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export function getLatestBoard(): BoardSnapshot | undefined {
  return getBoards()[0];
}

function parseHerPerspective(fileName: string, raw: string): HerPerspectiveEntry {
  const { data } = parseDocument(raw, fileName);
  return {
    slug: fileName.replace(/\.md$/, ""),
    title: asString(data.title),
    summary: asString(data.summary),
    date: inferDate(fileName, data.date),
    issue: asString(data.issue),
    cover: asString(data.cover),
    images: asStringArray(data.images),
    marketContext: asString(data.marketContext),
    keyData: asStringArray(data.keyData),
    explanation: asString(data.explanation),
    womenInsight: asString(data.womenInsight),
    risks: asString(data.risks),
    source: asString(data.source),
    videoUrl: asString(data.videoUrl) || undefined,
    status: publishedStatus(data.status),
  };
}

export function getHerPerspectiveEntries(): HerPerspectiveEntry[] {
  return readGroup("her-perspective")
    .map(([fileName, raw]) => parseHerPerspective(fileName, raw))
    .filter((item) => item.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date) || b.issue.localeCompare(a.issue));
}

export function getHerPerspectiveEntry(slug: string): HerPerspectiveEntry | undefined {
  return getHerPerspectiveEntries().find((item) => item.slug === slug);
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
