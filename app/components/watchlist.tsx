"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { LimitStock, MarketData } from "../../lib/market-types";
import { change } from "./market-ui";

const KEY = "lujian:watchlist:v1";
const EVENT = "lujian:watchlist-changed";
type SavedStock = { code: string; name: string };
const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener(EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(EVENT, notify);
  };
};
function snapshot() {
  try {
    return localStorage.getItem(KEY) || "[]";
  } catch {
    return "[]";
  }
}
function read(raw: string): SavedStock[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    return value
      .filter((item): item is SavedStock => {
        if (
          !item ||
          typeof item !== "object" ||
          !/^\d{6}$/.test(item.code) ||
          typeof item.name !== "string" ||
          seen.has(item.code)
        )
          return false;
        seen.add(item.code);
        return true;
      })
      .slice(0, 30)
      .map((item) => ({ code: item.code, name: item.name.slice(0, 40) }));
  } catch {
    return [];
  }
}
function save(list: SavedStock[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}
export function useWatchlist() {
  return read(useSyncExternalStore(subscribe, snapshot, () => "[]"));
}
export function WatchButton({
  stock,
}: {
  stock: Pick<LimitStock, "code" | "name">;
}) {
  const list = useWatchlist();
  const saved = list.some((item) => item.code === stock.code);
  const [error, setError] = useState("");
  return (
    <span className="lj-watch-action">
      <button
        className="lj-watch-button"
        aria-label={`${saved ? "移除自选" : "加入自选"}：${stock.name}`}
        aria-pressed={saved}
        title={saved ? "移除自选" : "加入自选"}
        onClick={() => {
          const current = read(snapshot());
          const exists = current.some((item) => item.code === stock.code);
          if (!exists && current.length >= 30) {
            setError("最多保存30只，请先移除其他自选");
            return;
          }
          setError(
            save(
              exists
                ? current.filter((item) => item.code !== stock.code)
                : [...current, { code: stock.code, name: stock.name }],
            )
              ? ""
              : "浏览器未允许保存，请检查存储设置",
          );
        }}
      >
        <svg
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.6"
          fill={saved ? "currentColor" : "none"}
          aria-hidden="true"
        >
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
        </svg>
      </button>
      {error && (
        <span className="lj-watch-error" role="status">
          {error}
        </span>
      )}
    </span>
  );
}

export function Watchlist({ pool }: { pool?: MarketData["limitUp"] }) {
  const list = useWatchlist();
  return (
    <aside className="lj-watchlist" aria-labelledby="watchlist-title">
      <div className="lj-panel-heading">
        <h2 id="watchlist-title">
          我的自选 <span>{list.length}</span>
        </h2>
        <a href="#limit-up" aria-label="从涨停股池添加自选">
          ＋
        </a>
      </div>
      {list.length ? (
        <>
          <div className="lj-watchlist-labels">
            <span>名称 / 代码</span>
            <span>股池涨幅</span>
          </div>
          <ul>
            {list.map((saved) => {
              const current = pool?.stocks.find(
                (stock) => stock.code === saved.code,
              );
              return (
                <li key={saved.code}>
                  <div>
                    {current ? (
                      <a
                        href={current.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <strong>{saved.name}</strong>
                        <small>{saved.code}</small>
                      </a>
                    ) : (
                      <span>
                        <strong>{saved.name}</strong>
                        <small>{saved.code}</small>
                      </span>
                    )}
                  </div>
                  <span
                    className={current ? "lj-rise" : "lj-watch-unavailable"}
                  >
                    {current
                      ? change(current.change)
                      : pool?.summary
                        ? "未在股池"
                        : "待更新"}
                  </span>
                  <WatchButton stock={saved} />
                </li>
              );
            })}
          </ul>
          <p className="lj-watchlist-date">
            {pool?.tradeDate
              ? `行情日期 ${pool.tradeDate} · 仅匹配该日股池`
              : "行情连接后显示对应交易日数据"}
          </p>
        </>
      ) : (
        <div className="lj-watchlist-empty">
          <span aria-hidden="true">☆</span>
          <h3>留意你关心的公司</h3>
          <p>
            在涨停股池点亮星标，
            <br />
            把研究线索放在手边。
          </p>
          <a className="lj-button lj-button-outline" href="#limit-up">
            添加自选 <span aria-hidden="true">＋</span>
          </a>
        </div>
      )}
      <p className="lj-watchlist-foot">保存在当前浏览器 · 最多30只</p>
      <div className="lj-watchlist-research">
        <span>从行情，走向研究</span>
        <p>
          热度是起点，
          <br />
          <strong>生意才是答案。</strong>
        </p>
        <Link href="/research/">
          探索研究档案 <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </aside>
  );
}
