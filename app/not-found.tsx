import Link from "next/link";
import { SiteHeader } from "@/app/components/SiteHeader";

export default function NotFound() {
  return <><SiteHeader /><main className="not-found"><span>404 / NOT FOUND</span><h1>这页研究<br />还没有结论。</h1><p>可能是链接失效，也可能是文章仍在推演中。</p><Link className="primary-button button-dark" href="/">返回首页 <span>→</span></Link></main></>;
}
