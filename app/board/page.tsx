import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { formatDate, getLatestBoard, mainlineStages, type BoardPiece, type CapitalStrength } from "@/lib/content";

export const metadata: Metadata = {
  title: "A股棋盘",
  description: "用产业阶段和资金强弱观察AI硬件、机器人、创新药、资源与消费，缺少证据时明确显示待核验。",
};

const strengthRows: Exclude<CapitalStrength, "待核验">[] = ["偏强", "中性", "偏弱"];

function PieceCard({ piece }: { piece: BoardPiece }) {
  return <article className="board-piece-card" data-strength={piece.capitalStrength}><div><span>{piece.researchHeat === "待核验" ? "热度待核验" : `研究热度 · ${piece.researchHeat}`}</span><b>{piece.evidenceStatus}</b></div><h3>{piece.name}</h3><p>{piece.capitalDirection}</p><small>{piece.stage} · {piece.updatedAt}</small><em>{piece.evidence}</em></article>;
}

export default function BoardPage() {
  const board = getLatestBoard();
  if (!board) return <><SiteHeader /><main className="system-page section-shell"><div className="empty-state"><span>BOARD WAITING</span><h1>棋盘等待核验</h1><p>没有正式快照时不会显示推测数据。</p></div></main><SiteFooter /></>;
  const verifiedPieces = board.pieces.filter((piece) => piece.capitalStrength !== "待核验");
  const unverifiedPieces = board.pieces.filter((piece) => piece.capitalStrength === "待核验");
  const groups: CapitalStrength[] = ["偏强", "中性", "偏弱", "待核验"];

  return (
    <>
      <SiteHeader />
      <main className="system-page board-page section-shell">
        <header className="system-masthead">
          <div><p>A-SHARE BOARD / {formatDate(board.date)}</p><h1>A股棋盘</h1></div>
          <div><strong>产业阶段，<br />交叉资金强弱。</strong><p>{board.summary}</p><small>数据截至：{board.dataCutoff}</small></div>
        </header>

        <section className="board-desktop" aria-label="A股棋盘二维矩阵">
          <div className="board-axis-corner"><span>资金强弱</span><b>产业阶段 →</b></div>
          {mainlineStages.map((stage, index) => <div className="board-stage-label" style={{ gridColumn: index + 2, gridRow: 1 }} key={stage}>{stage}</div>)}
          {strengthRows.map((strength, index) => <div className="board-strength-label" style={{ gridColumn: 1, gridRow: index + 2 }} key={strength}>{strength}</div>)}
          {strengthRows.map((strength, rowIndex) => mainlineStages.map((stage, columnIndex) => <div className="board-cell" style={{ gridColumn: columnIndex + 2, gridRow: rowIndex + 2 }} key={`${strength}-${stage}`} />))}
          {verifiedPieces.map((piece) => {
            const style = { gridColumn: mainlineStages.indexOf(piece.stage) + 2, gridRow: strengthRows.indexOf(piece.capitalStrength as Exclude<CapitalStrength, "待核验">) + 2 } as CSSProperties;
            return <div className="board-piece-position" style={style} key={piece.name}><PieceCard piece={piece} /></div>;
          })}
        </section>

        {unverifiedPieces.length > 0 && <section className="board-unverified"><header><span>待核验区</span><p>没有足够同口径证据，不强行放入资金强弱矩阵。</p></header><div>{unverifiedPieces.map((piece) => <PieceCard piece={piece} key={piece.name} />)}</div></section>}

        <section className="board-mobile-groups" aria-label="手机端按资金强弱分组">
          {groups.map((group) => {
            const pieces = board.pieces.filter((piece) => piece.capitalStrength === group);
            if (!pieces.length) return null;
            return <div key={group}><header><span>{group}</span><small>{pieces.length} 个方向</small></header>{pieces.map((piece) => <PieceCard piece={piece} key={piece.name} />)}</div>;
          })}
        </section>

        <section className="source-risk board-source">
          <div><span>来源</span><ul>{board.sources.map((source) => <li key={source}>{source}</li>)}</ul></div>
          <div><span>风险提示</span><ul>{board.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul><p>仅作研究交流，不构成投资建议。</p></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
