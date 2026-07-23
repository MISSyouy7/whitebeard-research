import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("用法：pnpm new:article ai-industry-chain-map");
  console.error("文章代号只能包含英文小写、数字和连字符。");
  process.exit(1);
}

const articlePath = path.join(process.cwd(), "content", "articles", `${slug}.md`);
if (fs.existsSync(articlePath)) {
  console.error(`文章已存在：${articlePath}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const template = `---
title: "待填写：文章标题"
description: "待填写：用于首页和分享的简短摘要"
date: "${today}"
category: "AI算力与硬件"
categorySlug: "ai-compute-hardware"
tags: ["AI产业链"]
readingTime: 8
featured: false
issue: "000"
status: "draft"
---
用不超过150字说明研究对象、核心问题和当前结论。

## 已确认事实

- 【事实】待填写。来源：机构或公司，《材料标题》，发布日期，[链接](https://example.com)。

## 当前判断及依据

- 【判断】待填写，并说明证据、关键假设和证据强弱。

## 尚未证实的推测

- 【推测】暂无，或写明尚待核验的线索与核验路径。

## 反方观点与证伪条件

- 反方观点：待填写。
- 证伪条件：待填写可观察、可更新的条件。

## 风险提示

- 待填写需求、价格、竞争、技术、财务、监管或估值风险。

## 后续跟踪指标

- 指标：当前状态；更新频率；触发阈值。

## 来源

- 机构或公司，《材料标题》，发布日期，[原文](https://example.com)。

仅作研究交流，不构成投资建议。
`;

fs.writeFileSync(articlePath, template, "utf8");
console.log(`已创建草稿：${articlePath}`);
console.log("核验完成后，把 status 改为 published 才会出现在官网。");
