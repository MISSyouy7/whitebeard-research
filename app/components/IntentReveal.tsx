"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { trackEvent } from "@/app/components/Analytics";
import { TrackedLink } from "@/app/components/TrackedLink";

type Props = {
  intentCode: string;
  qrImage: string;
  contactName?: string;
  buttonLabel: string;
  context: string;
  description: string;
  showJoinAfterReveal?: boolean;
  joinHref?: string;
};

export function IntentReveal({ intentCode, qrImage, contactName = "Louis", buttonLabel, context, description, showJoinAfterReveal = false, joinHref = "/join" }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const reveal = () => {
    setRevealed(true);
    trackEvent("wechat_code_reveal", { context, intentCode });
  };

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(intentCode);
      } else {
        const field = document.createElement("textarea");
        field.value = intentCode;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
      }
      setCopied(true);
      trackEvent("intent_code_copy", { context, intentCode });
    } catch {
      setCopied(false);
    }
  };

  return <div className="intent-reveal">
    {!revealed ? <button className="capital-primary intent-main-button" type="button" onClick={reveal}>{buttonLabel}<span>↗</span></button> : <div className="intent-panel">
      <div className="intent-panel-copy"><span>领取方式</span><h3>长按识别二维码<br />添加 {contactName}</h3><p>{description}</p><button type="button" onClick={copy}>{copied ? "口令已复制" : `复制口令：${intentCode}`}</button></div>
      <img src={qrImage} width="888" height="1131" alt={`添加${contactName}微信二维码`} />
      {showJoinAfterReveal ? <div className="intent-next-step"><p>如果你不想每周重新领取，资金战场研究室会持续更新每日、每周和季度记录。</p><TrackedLink href={joinHref} event="join_page_click" data={{ source: context }} className="outline-button">查看299元年度订阅 <b>→</b></TrackedLink></div> : null}
    </div>}
  </div>;
}
