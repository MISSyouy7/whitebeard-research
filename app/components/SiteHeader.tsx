import Link from "next/link";

const links = [
  { href: "/capital-flow", label: "资金迁徙" },
  { href: "/weekly", label: "一周资金" },
  { href: "/quarterly", label: "季度报告" },
  { href: "/articles", label: "研究档案" },
  { href: "/join", label: "订阅｜299元/年" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="路见资本首页">
          <span className="brand-seal" aria-hidden="true">路</span>
          <span className="brand-copy">
            <strong>路见资本</strong>
            <small>LUJIAN CAPITAL</small>
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
