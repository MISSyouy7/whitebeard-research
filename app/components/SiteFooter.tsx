import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-mark">路见<span>资本</span></div>
          <p>看见资本流向，理解产业周期，记录市场情绪。</p>
          <p>主理人 · 广路</p>
          <p>baihuzigl.com</p>
        </div>
        <div className="footer-links">
          <Link href="/capital-flow">资金迁徙</Link>
          <Link href="/mainline">主线生命</Link>
          <Link href="/board">A股棋盘</Link>
          <Link href="/articles">研究文章</Link>
          <Link href="/her-perspective">她的资本视角</Link>
          <Link href="/about">关于路见资本</Link>
          <Link href="/join">订阅与防失联</Link>
          <Link href="/admin">内容后台</Link>
        </div>
        <div className="footer-note">
          <p>事实、判断与推测分开记录。本站内容仅作研究交流，不构成投资建议。</p>
          <p>© {new Date().getFullYear()} LUJIAN CAPITAL</p>
        </div>
      </div>
    </footer>
  );
}
