#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import os
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import portrait
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = Path(os.environ["LUJIAN_IP_WORKSPACE"]).expanduser() if os.environ.get("LUJIAN_IP_WORKSPACE") else None
PUBLIC_PDF_DIR = ROOT / "public" / "research-pdf"
PRIVATE_DELIVERY_DIR = WORKSPACE / "lead_delivery" / "2026-08-24_2026-08-28" if WORKSPACE else None
WEEKLY_DATA_DIR = WORKSPACE / "ths_fund_migration" / "data" / "weekly" / "2026-08-24_2026-08-28" if WORKSPACE else None
PAGE = portrait((118 * mm, 210 * mm))

FONT_REGULAR = "LujianHeiti"
FONT_LIGHT = "LujianHeitiLight"
pdfmetrics.registerFont(TTFont(FONT_REGULAR, "/System/Library/Fonts/STHeiti Medium.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont(FONT_LIGHT, "/System/Library/Fonts/STHeiti Light.ttc", subfontIndex=0))

NAVY = colors.HexColor("#07121D")
FOREST = colors.HexColor("#102C2E")
GOLD = colors.HexColor("#D7AA56")
INK = colors.HexColor("#14191E")
MUTED = colors.HexColor("#66727C")
PAPER = colors.HexColor("#F5F2EA")
RED = colors.HexColor("#A94F48")
GREEN = colors.HexColor("#2E716B")
LINE = colors.HexColor("#D9D4C8")


def parse_markdown(path: Path):
    raw = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n([\s\S]*?)\n---\n?([\s\S]*)$", raw)
    if not match:
        raise ValueError(f"Missing front matter: {path}")
    frontmatter = match.group(1)
    body = match.group(2).strip()

    def field(name: str, fallback: str = ""):
        m = re.search(rf"^{re.escape(name)}:\s*[\"']?(.*?)[\"']?\s*$", frontmatter, flags=re.M)
        return m.group(1).strip().strip('"\'') if m else fallback

    return {
        "title": field("title", path.stem),
        "description": field("description"),
        "date": field("date", path.stem[:10]),
        "body": body,
    }


def clean_inline(text: str) -> str:
    text = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1（\2）", text)
    text = text.replace("**", "").replace("`", "")
    return text.strip()


def base_styles():
    styles = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("TitleCN", parent=styles["Title"], fontName=FONT_REGULAR, fontSize=23, leading=32, textColor=INK, spaceAfter=12),
        "subtitle": ParagraphStyle("SubtitleCN", parent=styles["BodyText"], fontName=FONT_LIGHT, fontSize=9.2, leading=17, textColor=MUTED, spaceAfter=16),
        "h2": ParagraphStyle("H2CN", parent=styles["Heading2"], fontName=FONT_REGULAR, fontSize=13.5, leading=20, textColor=FOREST, spaceBefore=15, spaceAfter=8),
        "body": ParagraphStyle("BodyCN", parent=styles["BodyText"], fontName=FONT_LIGHT, fontSize=8.8, leading=16, textColor=INK, spaceAfter=7, wordWrap="CJK"),
        "bullet": ParagraphStyle("BulletCN", parent=styles["BodyText"], fontName=FONT_LIGHT, fontSize=8.5, leading=15, leftIndent=9, firstLineIndent=-7, textColor=INK, spaceAfter=5, wordWrap="CJK"),
        "eyebrow": ParagraphStyle("EyebrowCN", parent=styles["BodyText"], fontName=FONT_REGULAR, fontSize=7, leading=10, textColor=GOLD, tracking=1.2, spaceAfter=14),
        "center": ParagraphStyle("CenterCN", parent=styles["BodyText"], fontName=FONT_LIGHT, fontSize=8.5, leading=14, textColor=MUTED, alignment=TA_CENTER),
    }


def page_decor(canvas, doc):
    canvas.saveState()
    width, height = PAGE
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.35)
    canvas.line(14 * mm, 12 * mm, width - 14 * mm, 12 * mm)
    canvas.setFont(FONT_LIGHT, 6.4)
    canvas.setFillColor(MUTED)
    canvas.drawString(14 * mm, 7.4 * mm, "路见资本研究库 · 主理人广路")
    canvas.drawRightString(width - 14 * mm, 7.4 * mm, f"{doc.page}")
    canvas.restoreState()


def make_doc(path: Path, title: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(path),
        pagesize=PAGE,
        rightMargin=14 * mm,
        leftMargin=14 * mm,
        topMargin=16 * mm,
        bottomMargin=17 * mm,
        title=title,
        author="广路",
        creator="路见资本研究库",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="research", frames=frame, onPage=page_decor)])
    return doc


def markdown_story(body: str, styles):
    story = []
    current_bullets = []

    def flush_bullets():
        nonlocal current_bullets
        if current_bullets:
            story.extend([Paragraph(f"• {clean_inline(item)}", styles["bullet"]) for item in current_bullets])
            current_bullets = []

    paragraphs = re.split(r"\n\s*\n", body)
    for block in paragraphs:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        if not lines:
            continue
        if lines[0].startswith("## "):
            flush_bullets()
            story.append(Paragraph(clean_inline(lines[0][3:]), styles["h2"]))
            lines = lines[1:]
        for line in lines:
            if line.startswith("- "):
                current_bullets.append(line[2:])
            else:
                flush_bullets()
                story.append(Paragraph(clean_inline(line), styles["body"]))
    flush_bullets()
    return story


def build_public_article_pdf(markdown_path: Path, output_path: Path):
    data = parse_markdown(markdown_path)
    styles = base_styles()
    story = [
        Paragraph("LUJIAN CAPITAL · OPEN RESEARCH", styles["eyebrow"]),
        Paragraph(data["title"], styles["title"]),
        Paragraph(f"发布 / 更新：{data['date']}　｜　作者：广路　｜　本报告永久免费开放", styles["subtitle"]),
        Table([[Paragraph(data["description"], styles["body"])]], colWidths=[90 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#E8E3D8")),
            ("BOX", (0, 0), (-1, -1), 0.5, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ])),
        Spacer(1, 8),
    ]
    story.extend(markdown_story(data["body"], styles))
    story.extend([
        PageBreak(),
        Spacer(1, 43 * mm),
        Paragraph("研究不会停在报告发布那一天", ParagraphStyle("CloseTitle", parent=styles["title"], alignment=TA_CENTER, fontSize=20, leading=29, textColor=FOREST)),
        Spacer(1, 7 * mm),
        Paragraph("这份报告记录的是一个时间点。真正重要的是，公司、产业和核心假设之后发生了什么。", styles["center"]),
        Spacer(1, 7 * mm),
        Paragraph("访问 baihuzigl.com/research 查看公开研究；需要持续跟踪时，可在报告页面领取专属口令。", styles["center"]),
        Spacer(1, 14 * mm),
        Paragraph("本网站内容仅用于信息分享与研究交流，不构成任何证券投资咨询、投资建议或收益承诺。市场有风险，投资需独立判断。", styles["center"]),
    ])
    make_doc(output_path, data["title"]).build(story)


def money(value: float):
    return f"{value:+.2f}"


def build_weekly_pdf(csv_path: Path, audit_path: Path, output_path: Path):
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    audit = json.loads(audit_path.read_text(encoding="utf-8"))
    if len(rows) != 90:
        raise ValueError(f"Expected 90 industries, got {len(rows)}")
    styles = base_styles()
    hook = audit["story_facts"]["hook"]
    story = [
        Paragraph("路见资本 · 免费完整体验", styles["eyebrow"]),
        Paragraph("本周90行业<br/>资金迁徙清单", styles["title"]),
        Paragraph("2026.08.24—08.28｜公开数据整理｜五个已核验收盘快照", styles["subtitle"]),
        Spacer(1, 7 * mm),
        Paragraph("594亿进攻，为什么只持续了一天？", ParagraphStyle("Hook", parent=styles["title"], fontSize=25, leading=35, textColor=FOREST)),
        Spacer(1, 8 * mm),
        Table([
            ["周四科技硬件", f"+{hook['attack_yi']:.2f}亿"],
            ["周五科技硬件", f"{hook['retreat_yi']:.2f}亿"],
            ["全周90行业合计", f"{audit['market']['weekly_total_net_yi']:.2f}亿"],
        ], colWidths=[48 * mm, 42 * mm], style=TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), FONT_REGULAR),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (0, 0), (0, -1), MUTED),
            ("TEXTCOLOR", (1, 0), (1, 0), RED),
            ("TEXTCOLOR", (1, 1), (1, 2), GREEN),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])),
        Spacer(1, 13 * mm),
        Paragraph("先看连续性，再看进攻 / 回流 / 撤退，最后看下周验证条件。", styles["body"]),
        PageBreak(),
        Paragraph("本周只需要记住三件事", styles["eyebrow"]),
        Paragraph("资金没有全面离场，<br/>但最强进攻缺少连续增援。", styles["title"]),
        Spacer(1, 7 * mm),
    ]
    summary_cards = [
        ("连续主攻", "软件开发", "周二至周五连续4日流入；全周 +30.15亿。"),
        ("后半周回流", "农业链", "后三个交易日合计 +56.58亿；全周 +40.58亿。"),
        ("持续撤退", "医药生物", "全周 -221.15亿；五天中4天净流出。"),
    ]
    for label, title, copy in summary_cards:
        story.append(KeepTogether([
            Paragraph(label, ParagraphStyle("CardLabel", parent=styles["eyebrow"], textColor=GREEN, spaceAfter=4)),
            Paragraph(title, ParagraphStyle("CardTitle", parent=styles["h2"], fontSize=18, leading=24, spaceBefore=0)),
            Paragraph(copy, styles["body"]),
            Spacer(1, 6 * mm),
        ]))
    story.append(Paragraph("下周验证：科技能否重新获得增援；软件开发的连续流入是否中断；农业链回流能否扩散。", styles["body"]))
    story.append(PageBreak())

    dates = audit["sessions"]
    for offset in range(0, len(rows), 10):
        chunk = rows[offset:offset + 10]
        story.append(Paragraph(f"90行业五日资金轨迹｜{offset + 1:02d}—{offset + len(chunk):02d}", styles["eyebrow"]))
        data = [["排名", "行业", "周一", "周二", "周三", "周四", "周五", "全周"]]
        for row in chunk:
            data.append([
                row["rank"], row["industry"],
                money(float(row[dates[0]])), money(float(row[dates[1]])), money(float(row[dates[2]])),
                money(float(row[dates[3]])), money(float(row[dates[4]])), money(float(row["weekly_net_inflow_yi"])),
            ])
        table = Table(data, colWidths=[7 * mm, 24 * mm, 10.5 * mm, 10.5 * mm, 10.5 * mm, 10.5 * mm, 10.5 * mm, 12 * mm], repeatRows=1, rowHeights=[8 * mm] + [11.5 * mm] * len(chunk))
        style = [
            ("FONTNAME", (0, 0), (-1, -1), FONT_LIGHT),
            ("FONTNAME", (0, 0), (-1, 0), FONT_REGULAR),
            ("FONTSIZE", (0, 0), (-1, 0), 6.2),
            ("FONTSIZE", (0, 1), (-1, -1), 6.3),
            ("BACKGROUND", (0, 0), (-1, 0), FOREST),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LINEBELOW", (0, 1), (-1, -1), 0.3, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ]
        for row_index, row in enumerate(chunk, start=1):
            weekly = float(row["weekly_net_inflow_yi"])
            style.append(("TEXTCOLOR", (7, row_index), (7, row_index), RED if weekly > 0 else GREEN))
        table.setStyle(TableStyle(style))
        story.extend([table, Spacer(1, 5 * mm), Paragraph("单位：亿元。正值表示净流入，负值表示净流出。", styles["center"])])
        if offset + 10 < len(rows):
            story.append(PageBreak())

    story.extend([
        PageBreak(),
        Paragraph("口径、边界与验证", styles["eyebrow"]),
        Paragraph("把复杂留在后台，<br/>把可验证留给读者。", styles["title"]),
        Paragraph(audit["methodology"], styles["body"]),
        Paragraph("公开5日排行已排除：该页面与五个已核验收盘快照求和存在冲突，本清单只使用逐日收盘快照。", styles["body"]),
        Paragraph("行业组合只用于栏目表达，不代表板块之间发生逐笔定向转账。数据冲突、来源缺失或口径不可比时应明确标记，不用旧数据补齐。", styles["body"]),
        Spacer(1, 10 * mm),
        Paragraph("下一步怎么用", styles["h2"]),
        Paragraph("1. 先观察连续性，不用单日第一名替代趋势。", styles["body"]),
        Paragraph("2. 再观察流入是否扩散，以及原有撤退方向是否停止失血。", styles["body"]),
        Paragraph("3. 下一期只验证已经写下的问题，不预测涨跌。", styles["body"]),
        Spacer(1, 12 * mm),
        Paragraph("本资料仅作市场观察与研究交流，不构成证券投资咨询、投资建议或收益承诺。市场有风险，投资需独立判断。", styles["center"]),
    ])
    make_doc(output_path, "路见资本｜本周90行业资金迁徙清单").build(story)


def main():
    PUBLIC_PDF_DIR.mkdir(parents=True, exist_ok=True)
    mapping = {
        "2026-07-30-170905.md": "2026-07-30-market-review-ai-transition.pdf",
        "2026-07-30-ai-applications-physical-ai.md": "2026-07-30-ai-applications-physical-ai.pdf",
        "2026-08-09-from-concept-to-financial-verification.md": "2026-08-09-five-level-evidence.pdf",
        "2026-08-25-market-breadth-repair.md": "2026-08-25-market-breadth-repair.pdf",
        "2026-08-26-finance-metals-support-index.md": "2026-08-26-finance-metals-support-index.pdf",
        "2026-08-27-technology-expansion.md": "2026-08-27-technology-expansion.pdf",
    }
    for source, output in mapping.items():
        build_public_article_pdf(ROOT / "content" / "articles" / source, PUBLIC_PDF_DIR / output)

    if WORKSPACE is None or WEEKLY_DATA_DIR is None or PRIVATE_DELIVERY_DIR is None:
        raise RuntimeError("Set LUJIAN_IP_WORKSPACE to the private IP operations workspace before building the weekly delivery PDF.")

    build_weekly_pdf(
        WEEKLY_DATA_DIR / "weekly_industry_checklist.csv",
        WEEKLY_DATA_DIR / "weekly_migration_audit.json",
        PRIVATE_DELIVERY_DIR / "路见资本-本周90行业资金清单-2026-08-24至08-28.pdf",
    )
    print(json.dumps({"public_pdfs": len(mapping), "weekly_pdf": str(PRIVATE_DELIVERY_DIR)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
