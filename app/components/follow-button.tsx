'use client';

import { useEffect, useRef, useState } from 'react';
import { CopyAccount } from './navigation';

export function FollowButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return <>
    <button ref={trigger} type="button" className="lj-nav-cta" aria-haspopup="dialog" onClick={() => {
      dialog.current?.showModal();
      setOpen(true);
    }}>关注路见 <span aria-hidden="true">↗</span></button>
    <dialog ref={dialog} className="lj-follow-dialog" aria-labelledby="follow-title" aria-describedby="follow-instructions" onClose={() => {
      setOpen(false);
      trigger.current?.focus();
    }} onClick={event => {
      if (event.target === event.currentTarget) dialog.current?.close();
    }} onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }}>
      <div className="lj-follow-dialog-inner">
        <div className="lj-follow-dialog-heading">
          <span className="lj-kicker">把研究，带到微信里</span>
          <button type="button" aria-label="关闭关注卡片" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <h2 id="follow-title">在微信，继续看路见。</h2>
        <p className="lj-follow-intro">从产业变化，到公司的生意。关注公众号，阅读路见资本的持续观察。</p>
        <div className="lj-follow-account-card">
          <span>微信公众号</span>
          <strong>路见资本</strong>
          <CopyAccount />
        </div>
        <p id="follow-instructions" className="lj-follow-instructions">复制名称后，打开微信「搜一搜」，选择「公众号」并搜索「路见资本」。进入公众号主页后点击「关注」。</p>
      </div>
    </dialog>
  </>;
}
