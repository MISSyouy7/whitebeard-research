import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
const directories = Object.fromEntries(
  ["articles", "previews", "weekly", "quarterly", "capital-flow", "mainline", "boards", "her-perspective"]
    .map((name) => [name, path.join(root, "content", name)]),
);
const categorySlugs = new Set(["ai-industry", "market-review", "trading-cognition"]);
const mainlineStages = new Set(["萌芽", "基础设施建设", "爆发", "生态竞争", "重构"]);
const capitalStrengths = new Set(["偏强", "中性", "偏弱", "待核验"]);
const researchHeats = new Set(["高", "中", "低", "待核验"]);
const bannedPromises = ["必涨", "稳赚", "确定性极高", "目标价必达", "逢低布局", "无条件清仓", "果断加仓", "跟票", "复制持仓"];
const internalPhrases = ["199元", "20名有效候补", "10名付费", "最多30人", "爱股票社区", "十五家公司"];
const errors = [];

function listMarkdownFiles(directory) {
  return fs.existsSync(directory) ? fs.readdirSync(directory).filter((file) => file.endsWith(".md")).sort() : [];
}

function parseDocument(directory, file) {
  const raw = fs.readFileSync(path.join(directory, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { raw, data: {}, body: "", valid: false };
  try {
    const data = parseYaml(match[1]);
    if (!data || typeof data !== "object" || Array.isArray(data)) return { raw, data: {}, body: match[2].trim(), valid: false };
    return { raw, data, body: match[2].trim(), valid: true };
  } catch (error) {
    errors.push(`${file}: YAML front matter 无法解析（${error.message}）。`);
    return { raw, data: {}, body: match[2].trim(), valid: false };
  }
}

function asString(value) {
  return value === null || value === undefined ? "" : String(value);
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => asString(item).trim());
}

function validateStatus(file, data) {
  const status = asString(data.status || "draft");
  if (!new Set(["draft", "published"]).has(status)) errors.push(`${file}: status 只能是 draft 或 published。`);
  return status;
}

function inferredDate(file, data) {
  const explicit = asString(data.date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(explicit)) return explicit;
  return file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
}

function requireFields(file, data, fields, label = "正式内容") {
  for (const field of fields) {
    const value = data[field];
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      errors.push(`${file}: ${label}缺少 ${field}。`);
    }
  }
}

function checkBannedLanguage(file, value) {
  for (const phrase of [...bannedPromises, ...internalPhrases]) {
    if (value.includes(phrase)) errors.push(`${file}: 包含不应公开的用语“${phrase}”。`);
  }
}

const articleFiles = listMarkdownFiles(directories.articles);
for (const file of articleFiles) {
  const document = parseDocument(directories.articles, file);
  if (!document.valid) {
    errors.push(`${file}: 缺少完整的 front matter。`);
    continue;
  }
  const { data, body } = document;
  const status = validateStatus(file, data);
  if (status !== "published") continue;

  requireFields(file, data, ["title", "description", "categorySlug", "status"], "正式公开文章");
  if (!inferredDate(file, data)) errors.push(`${file}: 文件名需以 YYYY-MM-DD 开头，或提供 date。`);
  if (!categorySlugs.has(asString(data.categorySlug))) errors.push(`${file}: categorySlug 不在三个正式栏目中。`);
  for (const section of ["## 已确认事实", "## 当前判断及依据", "## 尚未证实的推测", "## 反方观点与证伪条件", "## 风险提示", "## 后续跟踪指标", "## 来源"]) {
    if (!body.includes(section)) errors.push(`${file}: 缺少“${section.replace("## ", "")}”章节。`);
  }
  for (const label of ["【事实】", "【判断】", "【推测】"]) {
    if (!body.includes(label)) errors.push(`${file}: 缺少 ${label} 标注。`);
  }
  if (!/https?:\/\//.test(body)) errors.push(`${file}: 正式公开文章至少需要一个可核验来源链接。`);
  if (!body.includes("仅作研究交流，不构成投资建议")) errors.push(`${file}: 缺少统一风险声明。`);
  if (/!\[[^\]]*\]\((?!https?:\/\/|\/)/.test(body)) errors.push(`${file}: 图片链接只允许 HTTPS 或站内绝对路径。`);
  checkBannedLanguage(file, `${asString(data.title)} ${asString(data.description)} ${body}`);
  if (data.pdfFile) {
    const pdfFile = asString(data.pdfFile);
    if (!/^\/research-pdf\/.+\.pdf$/i.test(pdfFile)) errors.push(`${file}: 公开PDF必须位于 /research-pdf/。`);
    if (!fs.existsSync(path.join(root, "public", pdfFile.replace(/^\//, "")))) errors.push(`${file}: 公开PDF不存在：${pdfFile}。`);
  }
  if (data.reportType && !new Set(["company", "industry", "market", "method"]).has(asString(data.reportType))) errors.push(`${file}: reportType 无效。`);
  for (const field of ["industrySlugs", "tags"]) {
    if (data[field] !== undefined && !Array.isArray(data[field])) errors.push(`${file}: ${field} 必须是数组。`);
  }
}

const previewFiles = listMarkdownFiles(directories.previews);
const seenTopics = new Map();
for (const file of previewFiles) {
  const document = parseDocument(directories.previews, file);
  if (!document.valid) {
    errors.push(`${file}: 星球试读缺少完整的 front matter。`);
    continue;
  }
  const { data, body } = document;
  const status = validateStatus(file, data);
  if (body) errors.push(`${file}: 星球试读文件不得保存付费正文。`);

  const url = asString(data.zsxqUrl);
  const topicMatch = url.match(/^https:\/\/wx\.zsxq\.com\/(?:group\/15554884215522\/topic\/([0-9]+)|mweb\/views\/topicdetail\/topicdetail\.html\?topic_id=([0-9]+)&group_id=15554884215522)$/);
  if (topicMatch) {
    const topicId = topicMatch[1] ?? topicMatch[2];
    if (seenTopics.has(topicId)) errors.push(`${file}: 与 ${seenTopics.get(topicId)} 使用了同一个知识星球主题。`);
    seenTopics.set(topicId, file);
  } else if (url) {
    errors.push(`${file}: 知识星球链接不属于当前研究星球。`);
  }

  if (status !== "published") continue;
  requireFields(file, data, ["title", "description", "categorySlug", "keyPoints", "zsxqUrl", "status"], "正式星球试读");
  if (!inferredDate(file, data)) errors.push(`${file}: 文件名需以 YYYY-MM-DD 开头，或提供 date。`);
  if (!categorySlugs.has(asString(data.categorySlug))) errors.push(`${file}: categorySlug 不在三个正式栏目中。`);
  const description = asString(data.description).replace(/\s/g, "");
  if (description.length < 200 || description.length > 400) errors.push(`${file}: 公开摘要需为200—400字，当前为${description.length}字。`);
  if (!Array.isArray(data.keyPoints) || data.keyPoints.length !== 3 || data.keyPoints.some((point) => !asString(point).trim())) errors.push(`${file}: 必须恰好填写3个非空要点。`);
  if (!topicMatch) errors.push(`${file}: 缺少有效的知识星球原文链接。`);
  checkBannedLanguage(file, `${asString(data.title)} ${asString(data.description)} ${Array.isArray(data.keyPoints) ? data.keyPoints.join(" ") : ""}`);
}

const weeklyFiles = listMarkdownFiles(directories.weekly);
for (const file of weeklyFiles) {
  const document = parseDocument(directories.weekly, file);
  if (!document.valid) {
    errors.push(`${file}: 每周跟踪缺少完整的 front matter。`);
    continue;
  }
  const { data, body } = document;
  const status = validateStatus(file, data);
  if (status !== "published") continue;
  requireFields(file, data, ["title", "description", "startDate", "endDate", "issue", "state", "focus", "status"], "正式每周跟踪");
  for (const field of ["startDate", "endDate"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asString(data[field]))) errors.push(`${file}: ${field} 必须是 YYYY-MM-DD。`);
  }
  for (const section of ["## 本周核心问题", "## 当前研究状态", "## 风险与边界"]) {
    if (!body.includes(section)) errors.push(`${file}: 缺少“${section.replace("## ", "")}”章节。`);
  }
  if (!body.includes("仅作研究交流，不构成投资建议")) errors.push(`${file}: 缺少统一风险声明。`);
  checkBannedLanguage(file, `${asString(data.title)} ${asString(data.description)} ${body}`);
}

const quarterlyFiles = listMarkdownFiles(directories.quarterly);
for (const file of quarterlyFiles) {
  const document = parseDocument(directories.quarterly, file);
  if (!document.valid) {
    errors.push(`${file}: 季度报告缺少完整的 front matter。`);
    continue;
  }
  const { data, body } = document;
  const status = asString(data.status || "upcoming");
  if (!new Set(["upcoming", "published"]).has(status)) errors.push(`${file}: 季度报告 status 只能是 upcoming 或 published。`);
  requireFields(file, data, ["title", "quarter", "startDate", "endDate", "dueDate", "summary", "outline", "sources", "risks", "status"], "季度报告");
  for (const field of ["startDate", "endDate", "dueDate"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asString(data[field]))) errors.push(`${file}: ${field} 必须是 YYYY-MM-DD。`);
  }
  if (!/^\d{4} Q[1-4]$/.test(asString(data.quarter))) errors.push(`${file}: quarter 必须类似 2026 Q3。`);
  if (!Array.isArray(data.outline) || data.outline.length !== 8) errors.push(`${file}: 季度报告目录必须恰好包含8项。`);
  if (!isNonEmptyArray(data.sources) || !isNonEmptyArray(data.risks)) errors.push(`${file}: 季度报告来源和风险提示必须是非空列表。`);
  if (status === "upcoming") {
    if (Array.isArray(data.keyFindings) && data.keyFindings.length > 0) errors.push(`${file}: 季度未结束时不得预写关键结论。`);
    if (data.zsxqUrl) errors.push(`${file}: upcoming 季度报告不得预填知识星球原文链接。`);
  }
  if (status === "published") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asString(data.publishedAt))) errors.push(`${file}: 正式季度报告必须提供 publishedAt。`);
    if (!Array.isArray(data.keyFindings) || data.keyFindings.length !== 3) errors.push(`${file}: 正式季度报告必须恰好公开3条关键结论。`);
    if (!/^https:\/\/wx\.zsxq\.com\//.test(asString(data.zsxqUrl))) errors.push(`${file}: 正式季度报告必须提供知识星球链接。`);
    if (!/^\/uploads\/quarterly\/.+\.(png|jpe?g|webp)$/i.test(asString(data.coverImage))) errors.push(`${file}: 正式季度报告必须提供季度目录下的公开封面。`);
    if (!/^\/uploads\/quarterly\/.+\.pdf$/i.test(asString(data.previewFile)) || /full|完整版|完整报告/i.test(asString(data.previewFile))) errors.push(`${file}: 正式季度报告必须提供独立的公开试读PDF，且不得指向完整版。`);
  }
  if (!body.includes("不提前编写季度结论") && status === "upcoming") errors.push(`${file}: upcoming 页面必须明确不提前编写季度结论。`);
  checkBannedLanguage(file, `${asString(data.title)} ${asString(data.summary)} ${body}`);
}

const capitalFlowFiles = listMarkdownFiles(directories["capital-flow"]);
for (const file of capitalFlowFiles) {
  const document = parseDocument(directories["capital-flow"], file);
  if (!document.valid) {
    errors.push(`${file}: 资金迁徙记录缺少完整的 front matter。`);
    continue;
  }
  const { data, body } = document;
  const status = validateStatus(file, data);
  if (status !== "published") continue;
  requireFields(file, data, ["title", "summary", "date", "dataCutoff", "coreIndustry", "continuity", "inflows", "outflows", "logic", "methodology", "counterEvidence", "sources", "risks", "status"], "正式资金迁徙记录");
  const date = inferredDate(file, data);
  if (!date) errors.push(`${file}: 缺少有效日期。`);
  if (!new RegExp(`^${date} \\d{2}:\\d{2}$`).test(asString(data.dataCutoff))) errors.push(`${file}: dataCutoff 必须包含同一交易日期和 HH:mm。`);
  for (const field of ["inflows", "outflows"]) {
    if (!Array.isArray(data[field]) || data[field].length === 0) errors.push(`${file}: ${field} 至少需要一个方向。`);
    for (const [index, item] of (Array.isArray(data[field]) ? data[field] : []).entries()) {
      if (!item || typeof item !== "object" || !item.name || !item.reason || !item.evidence) errors.push(`${file}: ${field} 第${index + 1}项必须包含 name、reason、evidence。`);
    }
  }
  if (!isNonEmptyArray(data.sources) || !isNonEmptyArray(data.risks)) errors.push(`${file}: 来源和风险提示必须是非空列表。`);
  if (body && !body.includes("仅作研究交流，不构成投资建议")) errors.push(`${file}: 补充正文缺少统一风险声明。`);
  checkBannedLanguage(file, `${asString(data.title)} ${asString(data.summary)} ${asString(data.logic)} ${body}`);
}

const mainlineFiles = listMarkdownFiles(directories.mainline);
for (const file of mainlineFiles) {
  const document = parseDocument(directories.mainline, file);
  if (!document.valid) {
    errors.push(`${file}: 主线生命记录缺少完整的 front matter。`);
    continue;
  }
  const { data, body } = document;
  const status = validateStatus(file, data);
  if (status !== "published") continue;
  requireFields(file, data, ["title", "summary", "date", "industry", "currentStage", "stageBasis", "industryTraits", "representativeLinks", "companyMappings", "capitalBehavior", "catalysts", "risks", "falsification", "trackingIndicators", "sources", "status"], "正式主线生命记录");
  if (!inferredDate(file, data)) errors.push(`${file}: 缺少有效日期。`);
  if (!mainlineStages.has(asString(data.currentStage))) errors.push(`${file}: currentStage 不在五个固定阶段中。`);
  for (const field of ["industryTraits", "representativeLinks", "catalysts", "risks", "falsification", "trackingIndicators", "sources"]) {
    if (!isNonEmptyArray(data[field])) errors.push(`${file}: ${field} 必须是非空列表。`);
  }
  if (!Array.isArray(data.companyMappings) || data.companyMappings.length === 0) errors.push(`${file}: 至少需要一个上市公司研究映射。`);
  for (const [index, item] of (Array.isArray(data.companyMappings) ? data.companyMappings : []).entries()) {
    if (!item || typeof item !== "object" || !item.name || !item.role || !item.evidenceStatus) errors.push(`${file}: companyMappings 第${index + 1}项必须包含 name、role、evidenceStatus。`);
  }
  if (body && !body.includes("仅作研究交流，不构成投资建议")) errors.push(`${file}: 补充正文缺少统一风险声明。`);
  checkBannedLanguage(file, `${asString(data.title)} ${asString(data.summary)} ${asString(data.stageBasis)} ${body}`);
}

const boardFiles = listMarkdownFiles(directories.boards);
for (const file of boardFiles) {
  const document = parseDocument(directories.boards, file);
  if (!document.valid) {
    errors.push(`${file}: A股棋盘缺少完整的 front matter。`);
    continue;
  }
  const { data } = document;
  const status = validateStatus(file, data);
  if (status !== "published") continue;
  requireFields(file, data, ["title", "summary", "date", "dataCutoff", "pieces", "sources", "risks", "status"], "正式A股棋盘");
  const pieces = Array.isArray(data.pieces) ? data.pieces : [];
  if (pieces.length !== 5) errors.push(`${file}: V1棋盘必须恰好包含5枚棋子。`);
  const names = new Set();
  for (const [index, piece] of pieces.entries()) {
    if (!piece || typeof piece !== "object") {
      errors.push(`${file}: 第${index + 1}枚棋子格式错误。`);
      continue;
    }
    requireFields(`${file} 第${index + 1}枚棋子`, piece, ["name", "stage", "capitalStrength", "researchHeat", "capitalDirection", "evidenceStatus", "updatedAt", "evidence"], "");
    if (names.has(piece.name)) errors.push(`${file}: 棋子名称“${piece.name}”重复。`);
    names.add(piece.name);
    if (!mainlineStages.has(asString(piece.stage))) errors.push(`${file}: “${piece.name}”产业阶段无效。`);
    if (!capitalStrengths.has(asString(piece.capitalStrength))) errors.push(`${file}: “${piece.name}”资金强弱无效。`);
    if (!researchHeats.has(asString(piece.researchHeat))) errors.push(`${file}: “${piece.name}”研究热度无效。`);
    if (piece.evidenceStatus === "待核验" && (piece.capitalStrength !== "待核验" || piece.researchHeat !== "待核验")) {
      errors.push(`${file}: “${piece.name}”缺少证据时，资金强弱和研究热度都必须显示待核验。`);
    }
  }
  for (const expected of ["AI硬件", "机器人", "创新药", "资源", "消费"]) {
    if (!names.has(expected)) errors.push(`${file}: 缺少“${expected}”棋子。`);
  }
  if (!isNonEmptyArray(data.sources) || !isNonEmptyArray(data.risks)) errors.push(`${file}: 来源和风险提示必须是非空列表。`);
  checkBannedLanguage(file, `${asString(data.title)} ${asString(data.summary)} ${JSON.stringify(pieces)}`);
}

const perspectiveFiles = listMarkdownFiles(directories["her-perspective"]);
for (const file of perspectiveFiles) {
  const document = parseDocument(directories["her-perspective"], file);
  if (!document.valid) {
    errors.push(`${file}: 她的资本视角内容缺少完整的 front matter。`);
    continue;
  }
  const { data } = document;
  const status = validateStatus(file, data);
  if (status !== "published") continue;
  requireFields(file, data, ["title", "summary", "date", "issue", "cover", "images", "marketContext", "keyData", "explanation", "womenInsight", "risks", "source", "status"], "正式漫画内容");
  if (!inferredDate(file, data)) errors.push(`${file}: 缺少有效日期。`);
  if (!Array.isArray(data.images) || data.images.length !== 7) errors.push(`${file}: 漫画必须恰好包含7张图片。`);
  if (Array.isArray(data.images) && data.images[0] !== data.cover) errors.push(`${file}: 封面必须与第1张漫画一致。`);
  for (const image of Array.isArray(data.images) ? data.images : []) {
    const imagePath = asString(image);
    if (!/^\/uploads\/.*\.(?:png|jpe?g|webp)$/i.test(imagePath)) errors.push(`${file}: 图片必须使用站内 /uploads/ 绝对路径。`);
    if (!fs.existsSync(path.join(root, "public", imagePath.replace(/^\//, "")))) errors.push(`${file}: 图片不存在：${imagePath}。`);
  }
  if (!isNonEmptyArray(data.keyData)) errors.push(`${file}: 至少需要一条关键数据或现实议题说明。`);
  if (data.videoUrl && !/^https:\/\//.test(asString(data.videoUrl))) errors.push(`${file}: 外部视频链接必须使用 HTTPS。`);
  checkBannedLanguage(file, `${asString(data.title)} ${asString(data.summary)} ${asString(data.marketContext)} ${asString(data.explanation)} ${asString(data.womenInsight)} ${asString(data.risks)}`);
}

if (errors.length > 0) {
  console.error("内容检查未通过：\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const countPublished = (directory, files) => files.filter((file) => parseDocument(directory, file).data.status === "published").length;
console.log(
  `内容检查通过：${countPublished(directories.articles, articleFiles)} 篇公开全文，` +
  `${countPublished(directories.previews, previewFiles)} 篇星球试读，` +
  `${countPublished(directories["capital-flow"], capitalFlowFiles)} 条资金迁徙，` +
  `${countPublished(directories.mainline, mainlineFiles)} 条主线生命，` +
  `${countPublished(directories.boards, boardFiles)} 份A股棋盘，` +
  `${countPublished(directories["her-perspective"], perspectiveFiles)} 篇她的资本视角。`,
);
