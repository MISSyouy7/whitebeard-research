# 路见资本

路见资本官网：热点新闻、A股涨停复盘、产业研究与公开研究档案。首页采用米白、深墨绿与少量金色的财经刊物风格；支持手机阅读。原股市照妖镜保留在 `/mirror/`，入口仅在页尾。

## 本地运行

Node.js 24、pnpm 11.9.0：

```bash
pnpm install --frozen-lockfile
pnpm dev --hostname localhost --port 3000
```

首页与研究页不依赖数据库。游戏和管理功能继续使用已有 D1 配置；不需要为官网重置数据库。

```bash
pnpm test
pnpm lint
pnpm build
pnpm build:pages
```

`build` 生成 Cloudflare/Vinext Worker，`build:pages` 生成 GitHub Pages 静态站点。两者都会先从 Markdown 重新生成研究内容索引。

## 页面与品牌

- `/`：路见资本首页，新闻、涨停复盘、精选研究、关于路见。
- `/research/`：按分类、关键词检索已公开研究。
- `/research/[slug]/`：公开研究正文、原始发布日期、依据与来源。
- `/mirror/`：原股市照妖镜，原接口、存档与兑换权益保持兼容。
- `/manage/`：原游戏兑换码管理。

首页不使用演示行情。接口暂不可用时显示明确状态和来源入口，不生成替代股票、涨幅或新闻。已有研究是原仓库的历史文章，日期保留，不包装成当天复盘。

手机端提供固定底部导航、涨停纵向卡片；快讯支持搜索、只看要闻和新消息手动载入。研究页保留筛选条件，文章支持目录与阅读进度。前后测量及浏览器验证见 [UX/UI 优化记录](docs/ux-review.md)。

## 热点新闻与涨停复盘

详细数据来源、口径、更新机制、故障处理及上线检查见 [市场数据说明](docs/market-data.md)。

- 新闻：东方财富公开7×24快讯，分类筛选、发布时间、原文入口。
- 涨停：东方财富涨停股池；首板/连板数量、连板梯队、行业分布、个股搜索、排序、筛选结果 CSV。
- Worker 模式：同源 `/api/market`，60秒缓存，页面每60秒检查更新；支持近30天指定日期。
- GitHub Pages 模式：工作流每15分钟计划同步到公开 `market-data` 分支；浏览器检查最新快照。计划任务及 GitHub 原始文件缓存可能延迟，**不是秒级实时行情**。

手动检查公开源并生成初始快照：

```bash
pnpm market:update
```

## 内容维护

已公开文章来自 `content/articles/`，产业主线来自 `content/mainline/`。仅 `status: published` 且公开访问的内容进入研究页；其他草稿与会员预览不公开正文。

更新 Markdown 后运行：

```bash
pnpm content:generate
pnpm build:pages
```

`.pages.yml` 保留 Pages CMS 的内容编辑配置。账户数据、私人交易、客户名单和付费记录不得放入公开文章或公开行情快照。

## 发布

原 GitHub Pages 部署配置和 `public/CNAME`（`baihuzigl.com`）保留。合并到 `main` 后，`Deploy to GitHub Pages` 构建并发布官网；再手动运行一次 `Update public market data` 建立公开行情分支，后续由定时计划刷新。仓库需允许工作流写入仓库内容。

本次云环境尚未验证上游实网数据（访问源站被网络规则阻断），GitHub API 也被网络规则阻断；代码与本地预览完成不等于线上已经更新。发布前须在可访问数据源的环境中确认两个 feed 返回 `ok`、来源日期正确，并在生产域名抽查原文与股票数据。
