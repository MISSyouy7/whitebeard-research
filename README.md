# 白胡子研究院

白胡子盐话官方网站，也是白胡子长期积累 AI 产业链研究与个人信用的数字名片。

网站使用 Markdown 管理文章，支持分类浏览、手机端阅读、内容发布检查和 GitHub Pages 自动部署。季度运营工作台位于 `operations/quarter-2026-07-27/`。

## 最简单的写作流程

### 1. 新建一篇安全草稿

```bash
pnpm new:article ai-industry-chain-map
```

新文章会出现在 `content/articles/ai-industry-chain-map.md`。默认状态是：

```text
status: "draft"
```

草稿不会出现在公开网站。现有6篇通用示例已明确标记为 `draft`，因此也不会被发布。

### 2. 按研究标准补全内容

正式文章必须包含：

- 已确认事实及来源
- 当前判断及依据
- 尚未证实的推测
- 反方观点与证伪条件
- 风险提示
- 后续跟踪指标
- 统一声明“仅作研究交流，不构成投资建议”

先使用 `templates/research-master.md` 完成母版事实表，再使用 `templates/content-pack.md` 拆成公众号、小红书、爱股票社区和口播版本。

### 3. 发布前检查

```bash
pnpm validate:content
```

检查通过后，把文章头部改为：

```text
status: "published"
```

再次运行检查和构建。只有 `published` 文章才会出现在首页、分类和研究档案。

## 正式分类

| 分类 | categorySlug |
| --- | --- |
| AI算力与硬件 | `ai-compute-hardware` |
| 具身智能 | `embodied-intelligence` |
| 物理AI与应用 | `physical-ai-applications` |
| 公司与产业跟踪 | `company-industry-tracking` |
| 研究方法 | `research-methods` |

分类定义在 `lib/content.ts`，内容检查规则在 `scripts/validate-content.mjs`。

## 私密数据边界

真实交易、用户访谈、联系方式、付费记录和账户数据不得写入公开文章或提交到公开仓库。

在本地新建 `private/` 存放这些资料。这个目录已经加入 `.gitignore`。可复制使用：

- `templates/trade-decision.md`
- `templates/user-interview.md`
- `templates/weekly-review.md`

## 本地运行

需要 Node.js 22.13 或更高版本与 pnpm。

```bash
pnpm install
pnpm dev
```

完整检查：

```bash
pnpm test
pnpm lint
```

生成 GitHub Pages 静态文件：

```bash
GITHUB_PAGES=true pnpm exec next build
```

## 发布到 GitHub Pages

1. 将项目推送到公开 GitHub 仓库，默认分支使用 `main`。
2. 在仓库的 **Settings → Pages** 中选择 **GitHub Actions**。
3. 推送后等待 `Deploy to GitHub Pages` 完成。
4. 准备好真实代表作后绑定永久域名 `baihuzigl.com` 并开启 HTTPS。

域名已经购买自阿里云，不需要再购买服务器、OSS或CDN。工程中的 `public/CNAME` 会让 GitHub Pages 使用 `baihuzigl.com` 作为正式地址。

## 阿里云DNS记录

GitHub Pages 仓库上线后，在阿里云云解析DNS中添加：

| 记录类型 | 主机记录 | 记录值 |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `MISSyouy7.github.io` |

不要在 GitHub Pages 仓库上线前添加这些记录，否则域名会暂时显示无法访问。
