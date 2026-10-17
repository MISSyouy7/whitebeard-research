"use client";

import { useState } from "react";
import type { MarketData } from "../../lib/market-types";
import { FeedState, feedIsOld, stamp } from "./market-ui";
import { Watchlist } from "./watchlist";

export function MarketOverview({
  data,
  loading,
  refresh,
}: {
  data: MarketData | null;
  loading: boolean;
  refresh: () => void;
}) {
  const [view, setView] = useState<"boards" | "sectors">("boards");
  const [selected, setSelected] = useState("");
  const pool = data?.limitUp;
  const entries =
    view === "boards"
      ? [...(pool?.ladder || [])]
          .sort((a, b) => a.boards - b.boards)
          .map((item) => ({
            label: item.boards === 1 ? "首板" : `${item.boards}连板`,
            value: item.count,
          }))
      : (pool?.sectors || [])
          .slice(0, 6)
          .map((item) => ({ label: item.name, value: item.count }));
  const maximum = Math.max(1, ...entries.map((item) => item.value));
  const scale = Math.max(4, Math.ceil(maximum / 4) * 4);
  const selectedItem = entries.find((item) => item.label === selected);
  const stats = [
    ["涨停家数", pool?.summary?.total, "只", "股池内个股数量"],
    ["首板", pool?.summary?.firstBoard, "只", "连续涨停第一天"],
    ["连板家数", pool?.summary?.consecutive, "只", "连续涨停超过一天"],
    ["最高连板", pool?.summary?.highest, "板", "股池内最高高度"],
  ] as const;
  const stale =
    !!pool?.fetchedAt &&
    (pool.status === "stale" ||
      feedIsOld(pool.fetchedAt, data?.mode || "live"));
  return (
    <section
      className="lj-workspace lj-wrap"
      id="overview"
      aria-labelledby="overview-title"
    >
      <div className="lj-workspace-heading">
        <div>
          <h2 id="overview-title">
            市场总览<span>A股涨停观察</span>
          </h2>
          <p>从市场结构，寻找值得追问的线索。</p>
        </div>
        <FeedState
          status={pool?.status}
          at={pool?.fetchedAt}
          mode={data?.mode}
          loading={loading}
        />
      </div>
      <div className="lj-workspace-grid">
        <div className="lj-overview-main">
          <div className="lj-market-cards">
            {stats.map(([label, value, unit, hint]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>
                  {value ?? "—"}
                  <small>{value === undefined ? "" : unit}</small>
                </strong>
                <small>{value === undefined ? "等待数据连接" : hint}</small>
              </div>
            ))}
          </div>
          <div className="lj-chart-panel">
            <div className="lj-chart-toolbar">
              <div className="lj-chart-symbol" aria-hidden="true">
                市
              </div>
              <div>
                <h3>涨停股池分布</h3>
                <p>
                  {pool?.tradeDate
                    ? `交易日 ${pool.tradeDate} · ${stale ? "历史快照" : "当日股池分布"}`
                    : "A股 · 涨停股池"}
                </p>
              </div>
              <button
                className="lj-refresh"
                onClick={refresh}
                disabled={loading}
                aria-label="刷新市场总览"
              >
                ↻<span className="sr-only">刷新</span>
              </button>
            </div>
            <div className="lj-chart-tabs" aria-label="图表维度">
              {[
                ["boards", "连板分布"],
                ["sectors", "行业分布"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={view === key}
                  onClick={() => {
                    setView(key as "boards" | "sectors");
                    setSelected("");
                  }}
                >
                  {label}
                </button>
              ))}
              <a href="#limit-up">查看个股明细 ↗</a>
            </div>
            {pool?.summary && entries.length ? (
              <div className="lj-chart-body">
                <div className="lj-chart-readout" aria-live="polite">
                  <span>
                    {selectedItem?.label ||
                      (view === "boards" ? "连板结构" : "数量前六行业")}
                  </span>
                  <strong>
                    {selectedItem
                      ? `${selectedItem.value} 只`
                      : `${pool.summary.total} 只涨停`}
                  </strong>
                  <small>
                    {selectedItem
                      ? "点击图柱查看数量"
                      : "点击或聚焦图柱查看数量"}
                  </small>
                </div>
                <div
                  className="lj-distribution-chart"
                  role="group"
                  aria-label={
                    view === "boards"
                      ? "各连板高度的股票数量"
                      : "股池前六行业的股票数量"
                  }
                >
                  <div className="lj-chart-grid" aria-hidden="true">
                    {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
                      <div key={ratio}>
                        <span>{Number((scale * ratio).toFixed(1))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="lj-chart-bars">
                    {entries.map((item) => (
                      <button
                        className="lj-chart-bar"
                        key={item.label}
                        aria-label={`${item.label}：${item.value}只`}
                        aria-pressed={selected === item.label}
                        onClick={() => setSelected(item.label)}
                        onFocus={() => setSelected(item.label)}
                        onMouseEnter={() => setSelected(item.label)}
                      >
                        <span className="lj-bar-track">
                          <span
                            className="lj-bar-fill"
                            style={{ height: `${(item.value / scale) * 100}%` }}
                          >
                            <b>{item.value}</b>
                          </span>
                        </span>
                        <span className="lj-bar-label">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="lj-chart-unavailable">
                <div className="lj-chart-grid" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div key={line} />
                  ))}
                </div>
                <div className="lj-chart-empty-message" role="status">
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M6 5v29h29M13 27V16M21 27V9M29 27V19" />
                  </svg>
                  <h4>
                    {loading
                      ? "正在连接市场数据"
                      : pool?.status === "empty"
                        ? "该日期暂无股池"
                        : "等待市场数据"}
                  </h4>
                  <p>
                    {loading
                      ? "即将呈现连板与行业分布"
                      : "连接恢复后，在这里查看真实的股池结构。"}
                  </p>
                  {!loading && (
                    <button
                      className="lj-button lj-button-dark"
                      onClick={refresh}
                    >
                      重新连接
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="lj-chart-caption">
              <span>
                {pool?.fetchedAt
                  ? `更新于 ${stamp(pool.fetchedAt)}`
                  : "等待数据更新"}
              </span>
              <span>单位：只 · 非价格走势图</span>
            </div>
          </div>
        </div>
        <Watchlist pool={pool} />
      </div>
    </section>
  );
}
