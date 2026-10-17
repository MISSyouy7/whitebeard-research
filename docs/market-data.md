# 市场数据与上线核对

## 数据来源与统计口径

| 栏目 | 上游接口 | 官网展示 |
| --- | --- | --- |
| 热点新闻 | `https://np-weblist.eastmoney.com/comm/web/getFastNewsList` | 标题、摘要、北京时间、原文链接；按关键词筛选分类 |
| 涨停复盘 | `https://push2ex.eastmoney.com/getTopicZTPool` | 来源股池明细、数量、首板/连板、最高连板、行业分布 |

新闻字段参考 [AKShare 快讯适配器](https://github.com/akfamily/akshare/blob/master/akshare/stock_feature/stock_info.py)。接口是公开数据入口，可能限流或变更，不是带服务保证的行情订阅。只有上游明确返回的记录才会展示。涨停字段与参数参考 [AKShare 的公开适配器](https://github.com/akfamily/akshare/blob/master/akshare/stock_feature/stock_ztb_em.py)，接口参数里的 `ut` 是公开客户端标识，不是个人凭据。统计口径参考该公开适配器和来源股池说明，不含 ST、科创板、未开板连续一字新股，实际覆盖以来源最新说明为准。

- `p` 为千分之一元，显示前除以1000；`fund` 为元；`zdp` 已是百分数，不再次乘100。
- `lbc` 为连续涨停板数。首板和连板相加等于当前股池记录数。
- `fbt` 的前导零补足6位后显示北京时间。无有效时间显示“—”。
- 行业是来源的行业分类，不代表涨停原因。该接口不能证明净流入、情绪分数、炸板率或晋级率，因此不显示这些衍生指标。
- 空池/休市/尚未公布不解释为“0家涨停”。默认模式逐个探查最近16个自然日内的工作日，保留真实返回日期；不自行编造节假日交易日历。
- 新闻日期按北京时间解析，去重并按时间排序；链接仅允许 HTTPS 东方财富域名。

## 两种部署模式

### Cloudflare/Vinext

`worker/index.ts` 的 `/api/market` 聚合两个源，独立容错。单实例60秒缓存并合并并发请求；失败后15秒可重试。缓存有32项上限，不新增数据库迁移。

页面每60秒轮询，隐藏页面暂停轮询，重新可见时刷新。日期输入仅在此模式可用。失败后保留同一日期的成功结果及原获取时间，标记历史快照；绝不把另一日期的缓存挂到新日期下。

### GitHub Pages

静态站不能执行同源服务端聚合。构建时通过 `pnpm market:update` 生成初始 `public/data/market.json`。`.github/workflows/update-market.yml` 默认在 UTC 每小时 07、22、37、52 分执行，只同步公开快照到 `market-data` 分支，不每次重建官网。

浏览器默认读取：
`https://raw.githubusercontent.com/MISSyouy7/whitebeard-research/market-data/market.json`

可通过 `NEXT_PUBLIC_MARKET_SNAPSHOT_URL` 指定另一公开 HTTPS 快照。GitHub Actions 调度和 raw 文件缓存可能延迟；页面显示“定时更新”、来源获取时间、真实交易日期，超过40分钟标记历史快照。无法从分支读取时尝试构建内快照。不会将刷新页面的时间当作数据更新时间。

仓库需公开或改用浏览器可匿名读取的快照地址。工作流需要 `contents: write`，且 GitHub 定时任务需要存在于默认分支；长期不活跃的公开仓库可能被 GitHub 暂停定时任务。保留一次手动 `workflow_dispatch` 作为恢复入口。

## 首次上线

1. 发布代码，确认 `Deploy to GitHub Pages` 通过。
2. 在 GitHub Actions 手动运行 `Update public market data`，确认生成 `market-data/market.json`。
3. 检查 `news.status` 与 `limitUp.status`。非交易时段可以显示最后可用交易日；不能仅凭 HTTP 200 判定接入成功。
4. 在 `baihuzigl.com` 核对名称、发布时间、实际交易日期、股票代码、封板时间、资金单位；抽查来源链接。
5. 若需每分钟而非定时快照，使用本项目 Worker 部署承载官网，不通过浏览器跨域直连源站。

## 本次验证记录

- 8项新数据测试覆盖字段、金额、时间、分页完整性、休市回退、跨日缓存隔离、失败保留时间、并发缓存。
- 全仓29项测试通过，TypeScript、GitHub Pages 与 Vinext 构建通过。
- 浏览器实测桌面和390px手机布局、研究检索、正文、新闻分类、涨停筛选、CSV下载、展开与跨日期断网处理。
- 交互测试使用明确标记的合成数据，只在测试浏览器拦截请求；未写入 `public/`、生产接口或交付截图。
- 云环境对行情域名的代理连接返回403，实际公开源内容尚未读取成功；需在网络规则允许后完成实网验收。
- GitHub API 请求被环境网络规则阻断，身份检查无法完成；不据此认定凭据失效。尚未修改线上网站。
