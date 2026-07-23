import fs from "node:fs";
import path from "node:path";

const contentDirectory = path.join(process.cwd(), "content", "articles");
const categorySlugs = new Set([
  "ai-compute-hardware",
  "embodied-intelligence",
  "physical-ai-applications",
  "company-industry-tracking",
  "research-methods",
]);
const requiredFields = ["title", "description", "date", "category", "categorySlug", "tags", "readingTime", "featured", "issue", "status"];
const requiredSections = [
  "## 已确认事实",
  "## 当前判断及依据",
  "## 尚未证实的推测",
  "## 反方观点与证伪条件",
  "## 风险提示",
  "## 后续跟踪指标",
  "## 来源",
];
const bannedPromises = ["必涨", "稳赚", "确定性极高", "目标价必达"];

const errors = [];
const files = fs.existsSync(contentDirectory)
  ? fs.readdirSync(contentDirectory).filter((file) => file.endsWith(".md"))
  : [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(contentDirectory, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    errors.push(`${file}: 缺少完整的 front matter。`);
    continue;
  }

  const fields = new Map();
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator > 0) fields.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, ""));
  }

  const status = fields.get("status") ?? "draft";
  if (!new Set(["draft", "published"]).has(status)) errors.push(`${file}: status 只能是 draft 或 published。`);
  if (status !== "published") continue;

  for (const field of requiredFields) {
    if (!fields.get(field)) errors.push(`${file}: 正式文章缺少 ${field}。`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.get("date") ?? "")) errors.push(`${file}: date 必须是 YYYY-MM-DD。`);
  if (!categorySlugs.has(fields.get("categorySlug"))) errors.push(`${file}: categorySlug 不在正式分类中。`);

  const body = match[2];
  for (const section of requiredSections) {
    if (!body.includes(section)) errors.push(`${file}: 缺少“${section.replace("## ", "")}”章节。`);
  }
  for (const label of ["【事实】", "【判断】", "【推测】"]) {
    if (!body.includes(label)) errors.push(`${file}: 缺少 ${label} 标注。`);
  }
  if (!/https?:\/\//.test(body)) errors.push(`${file}: 正式文章至少需要一个可核验来源链接。`);
  if (!body.includes("仅作研究交流，不构成投资建议")) errors.push(`${file}: 缺少统一风险声明。`);
  for (const phrase of bannedPromises) {
    if (body.includes(phrase)) errors.push(`${file}: 包含禁止的收益承诺用语“${phrase}”。`);
  }
}

if (errors.length > 0) {
  console.error("内容检查未通过：\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const publishedCount = files.filter((file) => {
  const raw = fs.readFileSync(path.join(contentDirectory, file), "utf8");
  return /\nstatus:\s*["']?published["']?\s*\n/.test(raw);
}).length;
console.log(`内容检查通过：${publishedCount} 篇正式文章，${files.length - publishedCount} 篇草稿。`);
