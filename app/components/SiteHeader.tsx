import Link from "next/link";

const links = [
  { href: "/articles", label: "全部研究" },
  { href: "/categories/industry-observation", label: "产业观察" },
  { href: "/categories/company-research", label: "公司研究" },
  { href: "/about", label: "关于研究院" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="白胡子研究院首页">
          <span className="brand-seal" aria-hidden="true">白</span>
          <span className="brand-copy">
            <strong>白胡子研究院</strong>
            <small>WHITEBEARD INSTITUTE</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="主导航">
          {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <details className="mobile-menu">
          <summary aria-label="打开导航"><span /><span /></summary>
          <nav aria-label="移动端导航">
            {links.map((link, index) => (
              <Link href={link.href} key={link.href}>
                <span>0{index + 1}</span>{link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
