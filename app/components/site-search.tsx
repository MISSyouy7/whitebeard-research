"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SiteSearch() {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else {
          dialog.current?.showModal();
          input.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <>
      <button
        className="lj-global-search"
        ref={trigger}
        onClick={() => {
          dialog.current?.showModal();
          input.current?.focus();
        }}
        aria-label="打开全站研究搜索"
        aria-haspopup="dialog"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <span>搜索产业、公司或研究</span>
      </button>
      <dialog
        className="lj-search-dialog"
        ref={dialog}
        aria-labelledby="global-search-title"
        onClose={() => trigger.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="lj-search-dialog-inner">
          <div className="lj-search-dialog-title">
            <h2 id="global-search-title">寻找下一条研究线索</h2>
            <button
              aria-label="关闭搜索"
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              dialog.current?.close();
              router.push(
                `/research/${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`,
              );
            }}
          >
            <label className="lj-search">
              <input
                ref={input}
                type="search"
                aria-label="全站研究搜索"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索公司、产业或关键词"
              />
            </label>
            <button className="lj-button lj-button-dark" type="submit">
              搜索
            </button>
          </form>
          <p>研究方向</p>
          <ul>
            {["AI", "具身智能", "市场复盘"].map((topic) => (
              <li key={topic}>
                <Link
                  href={`/research/?q=${encodeURIComponent(topic)}`}
                  onClick={() => dialog.current?.close()}
                >
                  <span aria-hidden="true">⌕</span>
                  <strong>{topic}</strong>
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="lj-search-dialog-foot">
            <span>输入关键词查找研究 · 按退出键关闭</span>
            <Link
              href={`/research/${query ? `?q=${encodeURIComponent(query)}` : ""}`}
              onClick={() => dialog.current?.close()}
            >
              全部研究 →
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
