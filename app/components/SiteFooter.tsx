import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-mark">白胡子<span>研究院</span></div>
          <p>保持好奇，尊重事实，延迟判断。</p>
        </div>
        <div className="footer-links">
          <Link href="/articles">研究档案</Link>
          <Link href="/about">研究原则</Link>
          <Link href="/about">内容说明</Link>
        </div>
        <div className="footer-note">
          <p>本站内容仅供研究与交流，不构成任何投资建议。</p>
          <p>© {new Date().getFullYear()} WHITEBEARD INSTITUTE</p>
        </div>
      </div>
    </footer>
  );
}
