import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-mark">白胡子<span>研究院</span></div>
          <p>把 AI 产业变化，研究成可跟踪的股票线索。</p>
          <p>主理人 · 广路</p>
          <p>baihuzigl.com</p>
        </div>
        <div className="footer-links">
          <Link href="/weekly">本周跟踪</Link>
          <Link href="/articles">研究档案</Link>
          <Link href="/categories/ai-industry">AI产业链研究</Link>
          <Link href="/categories/market-review">A股市场复盘</Link>
          <Link href="/categories/trading-cognition">交易与认知</Link>
          <Link href="/join">加入研究院</Link>
          <Link href="/about">关于与边界</Link>
          <Link href="/admin">内容后台</Link>
        </div>
        <div className="footer-note">
          <p>事实、判断与推测分开记录。本站内容仅作研究交流，不构成投资建议。</p>
          <p>© {new Date().getFullYear()} WHITEBEARD INSTITUTE</p>
        </div>
      </div>
    </footer>
  );
}
