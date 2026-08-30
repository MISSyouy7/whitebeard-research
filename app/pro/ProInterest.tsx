"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { trackEvent } from "@/app/components/Analytics";
import { proInterest } from "@/lib/membership";

export function ProInterest() {
  const [feature, setFeature] = useState<string>(proInterest.features[0]);
  const [price, setPrice] = useState<string>(proInterest.priceBands[0]);
  const [preference, setPreference] = useState<string>(proInterest.preferences[0]);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => `PRO内测｜${feature}｜${price}｜${preference}`, [feature, price, preference]);
  const reveal = () => { setRevealed(true); trackEvent("pro_apply_click", { feature, price, preference }); };
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const field = document.createElement("textarea");
        field.value = code;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
      }
      setCopied(true);
      trackEvent("intent_code_copy", { context: "pro", feature, price, preference });
    } catch {
      setCopied(false);
    }
  };
  return <div className="pro-interest-form">
    <div className="pro-feature-field"><span>你最想先解决什么？</span><div className="pro-feature-options" role="group" aria-label="你最想先解决什么？">{proInterest.features.map((item) => <button type="button" aria-pressed={item === feature} className={item === feature ? "active" : ""} onClick={() => setFeature(item)} key={item}>{item}</button>)}</div></div>
    <label>你愿意接受的年度价格带？<select value={price} onChange={(event) => setPrice(event.target.value)}>{proInterest.priceBands.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
    <label>你主要研究哪一类对象？<select value={preference} onChange={(event) => setPreference(event.target.value)}>{proInterest.preferences.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
    {!revealed ? <button className="capital-primary" type="button" onClick={reveal}>生成内测口令 <b>→</b></button> : <div className="pro-qr-result"><img src={proInterest.qrImage} width="888" height="1131" alt="添加Louis微信申请路见Pro内测" /><div><span>申请内测</span><p>添加微信后发送下面的专属口令。网站不会保存你的联系方式。</p><button type="button" onClick={copy}>{copied ? "口令已复制" : `复制口令：${code}`}</button></div></div>}
  </div>;
}
