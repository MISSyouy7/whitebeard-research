import {families,roles,exposureBands,familyLabels,personalityProfiles} from './catalog.mjs';
import {chapters} from './scenes.mjs';
export {chapters};
export {families,roles,roleCatalog,exposureBands} from './catalog.mjs';
export const PATHS=[[100,106,115,109,96,104,118,110,92,101,107,105,119,112,108,117],[100,103,99,108,116,105,112,98,104,111,102,97,109,104,116,110],[100,96,102,94,101,110,106,115,103,97,109,113,106,118,110,120]];
export const TOTAL=chapters.length;
export function initial(path=0){return {v:2,path,step:0,cash:100000,shares:0,peak:100000,drawdown:0,trades:0,history:[],scores:Object.fromEntries(Object.keys(families).map(k=>[k,0]))};}
export const equity=s=>s.cash+s.shares*PATHS[s.path][s.step];
export const exposure=s=>equity(s)>0?s.shares*PATHS[s.path][s.step]/equity(s):0;
export function settle(s,target,reason){
 if(s.v!==2||s.step>=TOTAL||![0,.25,.6,1].includes(target)||!chapters[s.step].reasons.some(r=>r.tag===reason))throw new Error('Invalid turn');
 const price=PATHS[s.path][s.step],before=equity(s);let cash=s.cash,shares=s.shares;const delta=before*target-shares*price;let fee=0,quantity=0;
 if(delta>0.01){const spend=Math.min(cash,delta*1.001);quantity=spend/1.001/price;fee=spend-spend/1.001;shares+=quantity;cash-=spend;}
 else if(delta<-.01){quantity=-Math.min(shares,-delta/price);fee=-quantity*price*.001;shares+=quantity;cash+=-quantity*price-fee;}
 cash=Math.max(0,cash);const next=PATHS[s.path][s.step+1],after=cash+shares*next,peak=Math.max(s.peak,before,after);
 return {...s,step:s.step+1,cash,shares,peak,drawdown:Math.max(s.drawdown,(peak-after)/peak),trades:s.trades+(Math.abs(quantity)>1e-8?1:0),scores:{...s.scores,[reason]:s.scores[reason]+1},history:[...s.history,{chapter:s.step,target,reason,before,after,price,next,fee,quantity}]};
}
export function currentChapter(s){
 const chapter=chapters[s.step];if(!chapter)return null;
 const memoryIndex={3:0,5:1,7:2,10:3,13:7,14:0}[s.step];const memory=s.history[memoryIndex];
 return {...chapter,memory:memory?`镜子记得：第 ${memory.chapter+1} 关，你说“${chapters[memory.chapter].reasons.find(r=>r.tag===memory.reason).text}”，目标仓位 ${Math.round(memory.target*100)}%。现在呢？`:null};
}
export function result(s){
 if(s.step!==TOTAL)throw new Error('Complete all chapters first');
 // Equal choice opportunities; ties follow the most recent chosen reason.
 const order=Object.keys(families),recent=Object.fromEntries(order.map(k=>[k,s.history.findLastIndex(h=>h.reason===k)]));
 const ranked=order.toSorted((a,b)=>s.scores[b]-s.scores[a]||recent[b]-recent[a]);const family=ranked[0];
 const averageTarget=s.history.reduce((n,h)=>n+h.target,0)/TOTAL;
 const band=averageTarget<=.1000001?0:averageTarget<=.4000001?1:averageTarget<=.7500001?2:3;
 const signal=(h,name)=>chapters[h.chapter].reasons.find(r=>r.tag===h.reason).signal===name;
 const selected=s.history.filter(h=>h.reason===family);
 const switches=s.history.filter((h,i)=>i>0&&Math.abs(h.target-s.history[i-1].target)>=.35-1e-8);
 const additions=s.history.filter((h,i)=>i>0&&s.history[i-1].next<s.history[i-1].price&&h.target>s.history[i-1].target+.1);
 const guards=selected.filter(h=>signal(h,'vigilance')),shows=selected.filter(h=>signal(h,'display')),selfShows=s.history.filter(h=>h.reason==='chase'&&signal(h,'display')),anchors=selected.filter(h=>signal(h,'anchor')),reviews=selected.filter(h=>signal(h,'review'));
 const special=family==='calm'?guards.length>=3&&averageTarget>.1:family==='chase'?switches.length>=4:family==='rumor'?shows.length>=2&&selfShows.length>=1:family==='hold'?anchors.length>=3:family==='dip'?additions.length>=2&&averageTarget>.4:reviews.length>=3&&switches.length>=2;
 const key=family+'_'+(special?4:band),role=roles[key];
 const specialReason={calm:`你有 ${guards.length} 次选择想让自己少盯盘、睡好或正常生活，但仍然留在场内`,chase:`你有 ${switches.length} 次把目标仓位调整至少 35 个百分点，想参与的念头伴着频繁转向`,rumor:`你有 ${shows.length} 次被群聊展示或解释影响，也有 ${selfShows.length} 次想用自己的截图获得回应`,hold:`你有 ${anchors.length} 次明确选择回本、证明原判断或继续等一个交代`,dip:`已发生的下跌之后，你有 ${additions.length} 次提高目标仓位至少 10 个百分点`,plan:`你有 ${reviews.length} 次选择记录和复查，也有 ${switches.length} 次明显调整仓位`};
 const evidence=(special?({calm:guards,chase:switches,rumor:[...shows.slice(-2),...selfShows.slice(-1)],hold:anchors,dip:additions,plan:reviews}[family]):selected).slice(-3);
 const cautiousHeavy=s.history.filter(h=>h.reason==='calm'&&h.target>=.6).length;
 const contrast=cautiousHeavy>=2?`你有 ${cautiousHeavy} 次说想留退路，却选择了至少六成仓位。知道自己在怕什么，和真的愿意退一步，是两回事。`:switches.length>=4?`目标仓位大幅变化了 ${switches.length} 次。你很愿意回应局面，情绪也可能跟着获得了更大的发言权。`:averageTarget<=.1?'账户大多留在场外，理由却未必平静。低仓位能减少波动，不能自动替你关掉内心的行情。':`你这局平均目标仓位 ${Math.round(averageTarget*100)}%。这说明你愿意让多少资金参与，不等于你内心有多笃定。`;
 const blend=s.scores[family]-s.scores[ranked[1]]<=1?`同时带有「${familyLabels[ranked[1]]}」倾向，两种声音在这局很接近。`:`「${familyLabels[family]}」是这局最常出现的理由倾向。`;
 const bad=s.history.filter(h=>(h.quantity>0&&h.next<h.price)||(h.quantity<0&&h.next>h.price)).length;
 return {key,...role,averageTarget,bandLabel:special?specialReason[family]:exposureBands[band],title:s.trades===0?'账户很静，内心很忙':bad>=7?'反指体验官':equity(s)<100000?'关灯面馆常客':'这局有点运气',evidence,blend,profile:personalityProfiles[family],contrast,dimensions:order.map(k=>({key:k,label:familyLabels[k],count:s.scores[k],opportunities:10,value:s.scores[k]*10})),reasonSummary:special?`${specialReason[family]}。这枚勋章由具体行为组合触发。`:`你有 ${s.scores[family]} 次选择「${familyLabels[family]}」方向的理由，再结合平均目标仓位，照出这枚勋章。`};
}
export function restore(raw){try{const p=JSON.parse(raw);if(p.v!==2||!Number.isInteger(p.path)||!PATHS[p.path]||!Array.isArray(p.history)||p.history.length>TOTAL)return null;return p.history.reduce((s,h)=>settle(s,h.target,h.reason),initial(p.path));}catch{return null;}}
