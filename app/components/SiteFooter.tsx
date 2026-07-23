import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-mark">白胡子<span>研究院</span></div>
          <p>看懂 AI 产业链，跟踪真实变化。</p>
        </div>
        <div className="footer-links">
          <Link href="/articles">研究档案</Link>
          <Link href="/about">研究原则</Link>
          <Link href="/categories/research-methods">研究方法</Link>
        </div>
        <div className="footer-note">
          <p>本站内容仅供研究与交流，不构成任何投资建议。</p>
          <p>© {new Date().getFullYear()} WHITEBEARD INSTITUTE</p>
        </div>
      </div>
    </footer>
  );
}
