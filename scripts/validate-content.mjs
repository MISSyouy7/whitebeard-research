import fs from "node:fs";
import path from "node:path";

const articleDirectory = path.join(process.cwd(), "content", "articles");
const previewDirectory = path.join(process.cwd(), "content", "previews");
const weeklyDirectory = path.join(process.cwd(), "content", "weekly");
const categorySlugs = new Set(["ai-industry", "market-review", "trading-cognition"]);
const bannedPromises = ["必涨", "稳赚", "确定性极高", "目标价必达", "逢低布局", "无条件清仓", "果断加仓", "跟票"];
const internalPhrases = ["199元", "20名有效候补", "10名付费", "最多30人", "小红书", "爱股票社区", "十五家公司"];
const errors = [];

function listMarkdownFiles(directory) {
  return fs.existsSync(directory) ? fs.readdirSync(directory).filter((file) => file.endsWith(".md")) : [];
}

function unquote(value) {
  const clean = value.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) return clean.slice(1, -1);
  return clean;
}

function parseDocument(directory, file) {
  const raw = fs.readFileSync(path.join(directory, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { raw, fields: new Map(), body: "", valid: false };

  const fields = new Map();
  const lines = match[1].split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const separator = line.indexOf(":");
    if (separator < 1 || /^\s/.test(line)) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (rawValue) {
      const value = unquote(rawValue);
      if (value.startsWith("[") && value.endsWith("]")) {
        fields.set(key, value.slice(1, -1).split(",").map(unquote).filter(Boolean));
      } else {
        fields.set(key, value);
      }
      continue;
    }

    const items = [];
    while (index + 1 < lines.length && /^\s+-\s+/.test(lines[index + 1])) {
      index += 1;
      items.push(unquote(lines[index].replace(/^\s+-\s+/, "")));
    }
    fields.set(key, items);
  }
  return { raw, fields, body: match[2].trim(), valid: true };
}

function validateStatus(file, fields) {
  const status = fields.get("status") ?? "draft";
  if (!new Set(["draft", "published"]).has(status)) errors.push(`${file}: status 只能是 draft 或 published。`);
  return status;
}

function inferredDate(file, fields) {
  const explicit = fields.get("date") ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(explicit)) return explicit;
  return file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
}

function checkBannedLanguage(file, value) {
  for (const phrase of [...bannedPromises, ...internalPhrases]) {
    if (value.includes(phrase)) errors.push(`${file}: 包含不应公开的用语“${phrase}”。`);
  }
}

const articleFiles = listMarkdownFiles(articleDirectory);
for (const file of articleFiles) {
  const document = parseDocument(articleDirectory, file);
  if (!document.valid) {
    errors.push(`${file}: 缺少完整的 front matter。`);
    continue;
  }
  const { fields, body } = document;
  const status = validateStatus(file, fields);
  if (status !== "published") continue;

  for (const field of ["title", "description", "categorySlug", "status"]) {
    if (!fields.get(field)) errors.push(`${file}: 正式公开文章缺少 ${field}。`);
  }
  if (!inferredDate(file, fields)) errors.push(`${file}: 文件名需以 YYYY-MM-DD 开头，或提供 date。`);
  if (!categorySlugs.has(fields.get("categorySlug"))) errors.push(`${file}: categorySlug 不在三个正式栏目中。`);

  for (const section of ["## 已确认事实", "## 当前判断及依据", "## 尚未证实的推测", "## 反方观点与证伪条件", "## 风险提示", "## 后续跟踪指标", "## 来源"]) {
    if (!body.includes(section)) errors.push(`${file}: 缺少“${section.replace("## ", "")}”章节。`);
  }
  for (const label of ["【事实】", "【判断】", "【推测】"]) {
    if (!body.includes(label)) errors.push(`${file}: 缺少 ${label} 标注。`);
  }
  if (!/https?:\/\//.test(body)) errors.push(`${file}: 正式公开文章至少需要一个可核验来源链接。`);
  if (!body.includes("仅作研究交流，不构成投资建议")) errors.push(`${file}: 缺少统一风险声明。`);
  if (/!\[[^\]]*\]\((?!https?:\/\/|\/)/.test(body)) errors.push(`${file}: 图片链接只允许 HTTPS 或站内绝对路径。`);
  checkBannedLanguage(file, `${fields.get("title")} ${fields.get("description")} ${body}`);
}

const previewFiles = listMarkdownFiles(previewDirectory);
const seenTopics = new Map();
for (const file of previewFiles) {
  const document = parseDocument(previewDirectory, file);
  if (!document.valid) {
    errors.push(`${file}: 星球试读缺少完整的 front matter。`);
    continue;
  }
  const { fields, body } = document;
  const status = validateStatus(file, fields);
  if (body) errors.push(`${file}: 星球试读文件不得保存付费正文。`);

  const url = fields.get("zsxqUrl") ?? "";
  const topicMatch = String(url).match(/^https:\/\/wx\.zsxq\.com\/(?:group\/15554884215522\/topic\/([0-9]+)|mweb\/views\/topicdetail\/topicdetail\.html\?topic_id=([0-9]+)&group_id=15554884215522)$/);
  if (topicMatch) {
    const topicId = topicMatch[1] ?? topicMatch[2];
    if (seenTopics.has(topicId)) errors.push(`${file}: 与 ${seenTopics.get(topicId)} 使用了同一个知识星球主题。`);
    seenTopics.set(topicId, file);
  } else if (url) {
    errors.push(`${file}: 知识星球链接不属于“白胡子研究室（持续研究版）”。`);
  }

  const previewRequiredFields = ["title", "description", "categorySlug", "keyPoints", "zsxqUrl", "status"];
  const isCompleteDraft = previewRequiredFields.every((field) => fields.get(field) && (!Array.isArray(fields.get(field)) || fields.get(field).length > 0));
  if (status === "published") {
    for (const field of previewRequiredFields) {
      if (!fields.get(field) || (Array.isArray(fields.get(field)) && fields.get(field).length === 0)) errors.push(`${file}: 正式星球试读缺少 ${field}。`);
    }
  }
  if (status !== "published" && !isCompleteDraft) continue;
  if (!inferredDate(file, fields)) errors.push(`${file}: 文件名需以 YYYY-MM-DD 开头，或提供 date。`);
  if (!categorySlugs.has(fields.get("categorySlug"))) errors.push(`${file}: categorySlug 不在三个正式栏目中。`);
  const description = String(fields.get("description") ?? "").replace(/\s/g, "");
  if (description.length < 200 || description.length > 400) errors.push(`${file}: 公开摘要需为200—400字，当前为${description.length}字。`);
  const keyPoints = fields.get("keyPoints");
  if (!Array.isArray(keyPoints) || keyPoints.length !== 3 || keyPoints.some((point) => !String(point).trim())) errors.push(`${file}: 必须恰好填写3个非空要点。`);
  if (!topicMatch) errors.push(`${file}: 缺少有效的知识星球原文链接。`);
  checkBannedLanguage(file, `${fields.get("title")} ${fields.get("description")} ${Array.isArray(keyPoints) ? keyPoints.join(" ") : ""}`);
}

const weeklyFiles = listMarkdownFiles(weeklyDirectory);
for (const file of weeklyFiles) {
  const document = parseDocument(weeklyDirectory, file);
  if (!document.valid) {
    errors.push(`${file}: 每周跟踪缺少完整的 front matter。`);
    continue;
  }
  const { fields, body } = document;
  const status = validateStatus(file, fields);
  if (status !== "published") continue;
  for (const field of ["title", "description", "startDate", "endDate", "issue", "state", "focus", "status"]) {
    if (!fields.get(field)) errors.push(`${file}: 正式每周跟踪缺少 ${field}。`);
  }
  for (const field of ["startDate", "endDate"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.get(field) ?? "")) errors.push(`${file}: ${field} 必须是 YYYY-MM-DD。`);
  }
  for (const section of ["## 本周核心问题", "## 当前研究状态", "## 风险与边界"]) {
    if (!body.includes(section)) errors.push(`${file}: 缺少“${section.replace("## ", "")}”章节。`);
  }
  if (!body.includes("仅作研究交流，不构成投资建议")) errors.push(`${file}: 缺少统一风险声明。`);
  checkBannedLanguage(file, `${fields.get("title")} ${fields.get("description")} ${body}`);
}

if (errors.length > 0) {
  console.error("内容检查未通过：\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const publishedArticles = articleFiles.filter((file) => parseDocument(articleDirectory, file).fields.get("status") === "published").length;
const publishedPreviews = previewFiles.filter((file) => parseDocument(previewDirectory, file).fields.get("status") === "published").length;
console.log(`内容检查通过：${publishedArticles} 篇公开全文，${publishedPreviews} 篇正式星球试读，${previewFiles.length - publishedPreviews} 篇星球试读草稿，${weeklyFiles.length} 份每周跟踪。`);
