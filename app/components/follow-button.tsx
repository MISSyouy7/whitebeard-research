'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CopyAccount } from './navigation';

const qrImage = `${process.env.NEXT_PUBLIC_PAGES_BASE_PATH || ''}/brand/wechat-follow.jpg`;

export function FollowButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return <>
    <button ref={trigger} type="button" className="lj-nav-cta" aria-haspopup="dialog" onClick={() => {
      setImageFailed(false);
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
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
      const first = controls[0];
      const last = controls[controls.length - 1];
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
        <p className="lj-follow-intro">关注「路见资本」公众号，继续阅读产业与公司的生意。</p>
        {!imageFailed && <>
          <a className="lj-follow-qr" href={qrImage} target="_blank" rel="noopener noreferrer" aria-label="查看路见资本公众号二维码原图（新窗口）">
            <Image src={qrImage} width={1086} height={1164} alt="路见资本公众号二维码，请使用微信扫描" unoptimized onError={() => setImageFailed(true)} />
          </a>
          <div className="lj-follow-qr-actions">
            <a href={qrImage} target="_blank" rel="noopener noreferrer">查看原图 <span aria-hidden="true">↗</span></a>
            <a href={qrImage} download="路见资本公众号二维码.jpg">保存二维码 <span aria-hidden="true">↓</span></a>
          </div>
        </>}
        <p id="follow-instructions" className="lj-follow-instructions" role={imageFailed ? 'status' : undefined}>{imageFailed ? '二维码暂时无法加载，可复制公众号名称，到微信搜索关注。' : '电脑用微信扫一扫；微信内可长按识别，其他浏览器可保存图片后，在微信「扫一扫」中从相册选择。'}</p>
        <div className="lj-follow-fallback">
          <span>微信「搜一搜」→「公众号」→「路见资本」</span>
          <CopyAccount />
        </div>
      </div>
    </dialog>
  </>;
}
