import Image from "next/image";
import Link from "next/link";
import type { MarketData } from "../../lib/market-types";
import { feedIsOld } from "./market-ui";

const destinations = [
  {
    number: "01",
    href: "#news",
    title: "热点快讯",
    description: "追踪市场正在发生的事",
  },
  {
    number: "02",
    href: "#limit-up",
    title: "涨停复盘",
    description: "看连板梯队与行业分布",
  },
  {
    number: "03",
    href: "/research/",
    title: "产业研究",
    description: "读懂热度背后的生意",
  },
];

export function GlassHero({
  data,
  loading,
}: {
  data: MarketData | null;
  loading: boolean;
}) {
  const pool = data?.limitUp;
  const ladder = pool?.ladder || [];
  const bars = [1, 2, 3, 4, 5].map((board) => ({
    label: board === 1 ? "首板" : board === 5 ? "5板及以上" : `${board}板`,
    count: ladder
      .filter((item) =>
        board === 5 ? item.boards >= 5 : item.boards === board,
      )
      .reduce((sum, item) => sum + item.count, 0),
  }));
  const scale = Math.max(
    4,
    Math.ceil(Math.max(...bars.map((bar) => bar.count)) / 4) * 4,
  );
  const available = !!pool?.summary && ladder.length > 0;
  const stale =
    !!pool?.fetchedAt &&
    (pool.status === "stale" ||
      feedIsOld(pool.fetchedAt, data?.mode || "live"));
  return (
    <section className="lj-glass-hero lj-wrap" aria-labelledby="hero-title">
      <div className="lj-glass-hero-art" aria-hidden="true">
        <Image
          src="/brand/palace-snow-background.png"
          alt=""
          width={1536}
          height={1024}
          priority
          unoptimized
        />
      </div>
      <div className="lj-glass-hero-copy">
        <span className="lj-kicker">路见资本 · 独立研究</span>
        <h1 id="hero-title">
          看见产业，
          <br />
          理解资本。
        </h1>
        <p>
          从一条快讯，到一份复盘，再到一门生意。
          <br />
          沿着事实与证据，形成自己的判断。
        </p>
        <nav className="lj-hero-destinations" aria-label="首页主要入口">
          {destinations.map((item) => (
            <Link
              className="lj-hero-destination"
              href={item.href}
              key={item.href}
            >
              <span className="lj-hero-destination-number" aria-hidden="true">
                {item.number}
              </span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </div>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="lj-hero-visual">
        <Image
          className="lj-hero-orb"
          src="/brand/palace-red-orb.png"
          alt=""
          width={1254}
          height={1254}
          unoptimized
          aria-hidden="true"
        />
        <aside className="lj-hero-chart" aria-label="市场结构速览">
          <div className="lj-hero-chart-heading">
            <span>涨停结构</span>
            <a href="#overview">查看详情 ↗</a>
          </div>
          <p className="lj-hero-chart-date">
            {pool?.tradeDate
              ? `交易日 ${pool.tradeDate}${stale ? " · 历史快照" : ""}`
              : "连板分布 · 单位：只"}
          </p>
          {available ? (
            <>
              <div className="lj-hero-chart-summary">
                <strong>{pool.summary?.total}</strong>
                <span>只涨停</span>
              </div>
              <div
                className="lj-hero-mini-bars"
                role="group"
                aria-label="连板数量预览"
              >
                {bars.map((bar) => (
                  <div
                    className="lj-hero-mini-bar"
                    key={bar.label}
                    role="img"
                    aria-label={`${bar.label}：${bar.count}只`}
                  >
                    <span className="lj-hero-mini-track">
                      <i style={{ height: `${(bar.count / scale) * 100}%` }} />
                      <b>{bar.count}</b>
                    </span>
                    <small>{bar.label}</small>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="lj-hero-chart-empty">
              <svg
                viewBox="0 0 40 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M6 5v29h29M13 27V16M21 27V9M29 27V19" />
              </svg>
              <h2>
                {loading
                  ? "正在连接市场数据"
                  : pool?.status === "empty"
                    ? "该日期暂无股池"
                    : "等待市场数据"}
              </h2>
              <p>连接恢复后展示连板结构</p>
            </div>
          )}
          <a className="lj-hero-chart-link" href="#overview">
            进入市场总览 →
          </a>
        </aside>
      </div>
    </section>
  );
}
