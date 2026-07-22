# 白胡子研究院

白胡子盐话官方网站。一个使用 Markdown 管理文章、支持分类浏览并适配手机端的静态研究网站。

## 写一篇新文章

在 `content/articles` 新建一个 `.md` 文件。文件名会成为文章链接，建议使用简短的英文小写与连字符，例如 `ai-hardware-cycle.md`。

每篇文章以这段信息开头：

```md
---
title: "文章标题"
description: "用于首页和分享的简短摘要"
date: "2026-07-22"
category: "产业观察"
categorySlug: "industry-observation"
tags: ["标签一", "标签二"]
readingTime: 8
featured: false
issue: "015"
---

从这里开始写正文。
```

正文支持标题、段落、粗体、斜体、链接、引用、列表、分隔线和代码块。提交到 `main` 分支后，GitHub Actions 会自动重新生成并发布网站。

## 现有分类

| 分类 | categorySlug |
| --- | --- |
| 宏观与策略 | `macro-strategy` |
| 产业观察 | `industry-observation` |
| 公司研究 | `company-research` |
| 方法与工具 | `methods-tools` |

分类定义在 `lib/content.ts`。新增分类时，同时在这里补充分类名称、说明和排序。

## 本地运行

需要 Node.js 22.13 或更高版本与 pnpm。

```bash
pnpm install
pnpm dev
```

生成 GitHub Pages 静态文件：

```bash
GITHUB_PAGES=true pnpm exec next build
```

输出位于 `out` 目录。

## 发布到 GitHub Pages

1. 把本目录推送到一个 GitHub 仓库，默认分支设为 `main`。
2. 在仓库的 **Settings → Pages** 中，将 Source 选择为 **GitHub Actions**。
3. 推送一次代码，等待 `Deploy to GitHub Pages` 工作流完成。

项目页和 `用户名.github.io` 根站点都会自动处理资源路径。若使用自定义域名，可在 `public` 目录新增 `CNAME` 文件，内容只写域名。

## 内容边界

本站示例内容仅用于研究与交流，不构成任何投资建议。发布新文章前，请核验来源，并明确区分事实、判断与不确定性。
