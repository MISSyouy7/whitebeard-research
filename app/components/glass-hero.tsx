import Image from "next/image";

export function GlassHero() {
  return (
    <section className="lj-glass-hero lj-wrap" aria-labelledby="hero-title">
      <h1 className="sr-only" id="hero-title">
        SKEUOMORPHIC GLASS — 路见资本
      </h1>
      <div className="lj-glass-hero-art">
        <Image
          src="/brand/obsidian-glass.png"
          alt="SKEUOMORPHIC GLASS：纯净深墨绿背景中，悬浮绿曜石玻璃卡片与翡翠光球组成的界面概念海报"
          width={1536}
          height={1024}
          priority
          unoptimized
        />
      </div>
      <div className="lj-glass-hero-copy">
        <span className="lj-kicker">
          LUJIAN CAPITAL / A CLEARER PERSPECTIVE
        </span>
        <h2>透过热度，看懂生意。</h2>
        <p>
          市场快讯、涨停结构与产业研究，
          <br />
          用更通透的视角，寻找资本的方向。
        </p>
        <div>
          <a className="lj-button lj-button-dark" href="#overview">
            进入市场工作台 <span aria-hidden="true">↗</span>
          </a>
          <a className="lj-text-link" href="#news">
            浏览快讯 →
          </a>
        </div>
      </div>
      <span className="lj-glass-art-caption">材质与界面概念图</span>
    </section>
  );
}
