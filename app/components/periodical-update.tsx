import { getPeriodicalState } from '../../lib/research';

export function PeriodicalUpdate() {
  const data = getPeriodicalState();
  const retained = data.publications.filter(source => source.status !== 'ok');
  const time = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(data.checkedAt));
  return <div className="lj-periodical-status">
    <p><span aria-hidden="true">◷</span> 每日同步新刊 <span className="lj-periodical-checked">最近检查 <time dateTime={data.checkedAt}>{time}</time> · 北京时间</span></p>
    {retained.length > 0 && <p className="lj-periodical-retained">{retained.map(source => source.name).join('、')}暂未刷新，展示上次保存的期刊。</p>}
  </div>;
}
