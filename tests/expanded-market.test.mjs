import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,settle,result,restore,equity,PATHS,chapters,TOTAL,currentChapter,roles} from '../app/market.mjs';

test('fifteen distinct chapters have balanced personality opportunities and complete feedback',()=>{
 assert.equal(TOTAL,15);assert.equal(new Set(chapters.map(c=>c.title)).size,15);
 for(const path of PATHS)assert.equal(path.length,16);
 for(const family of ['calm','chase','rumor','hold','dip','plan'])assert.equal(chapters.filter(c=>c.reasons.some(r=>r.tag===family)).length,10);
 for(const chapter of chapters){assert.equal(chapter.reasons.length,4);assert.equal(new Set(chapter.reasons.map(r=>r.tag)).size,4);assert.ok(chapter.act);for(const r of chapter.reasons)assert.ok(r.echo&&r.signal);}
 assert.equal(Object.keys(roles).length,30);assert.equal(new Set(Object.values(roles).map(r=>r.number)).size,30);assert.equal(roles.plan_2.name,'股市公务员');
});
test('fifteen-turn accounts conserve assets and restore by replay; incomplete results stay locked',()=>{
 assert.throws(()=>result(initial()));
 for(let p=0;p<PATHS.length;p++)for(let run=0;run<100;run++){
  let s=initial(p);
  for(let i=0;i<TOTAL;i++){s=settle(s,[0,.25,.6,1][(i+run)%4],chapters[i].reasons[run%4].tag);assert.ok(s.cash>=0&&s.shares>=0);assert.equal(equity(s),s.history.at(-1).after);assert.ok(s.drawdown>=0&&s.drawdown<=1);}
  assert.deepEqual(restore(JSON.stringify(s)),s);assert.equal(result(s).dimensions.reduce((n,d)=>n+d.count,0),15);
 }
 assert.equal(restore(JSON.stringify({v:2,path:99,history:[]})),null);
 assert.throws(()=>settle(initial(),.55,'plan'));
});
test('story callbacks quote actual prior choices without revealing future prices',()=>{
 let s=initial();for(let i=0;i<3;i++)s=settle(s,.25,chapters[i].reasons[0].tag);
 const c=currentChapter(s);assert.ok(c.memory.includes(chapters[0].reasons[0].text));assert.ok(c.memory.includes('25%'));assert.equal(c.title,chapters[3].title);
});
test('all thirty badges are reachable from valid plays, including six behavioral combinations',()=>{
 let seed=127;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const reached=new Set(),families=['calm','chase','rumor','hold','dip','plan'];
 for(let run=0;run<30000&&reached.size<30;run++){
  const focus=families[run%6],constant=[0,.25,.6,1][Math.floor(run/6)%4];let s=initial(run%3);
  for(let i=0;i<TOTAL;i++){const opts=chapters[i].reasons;const focused=opts.find(r=>r.tag===focus);const reason=focused&&random()<.6?focused:opts[Math.floor(random()*4)];const target=run%5===0?[0,.25,.6,1][Math.floor(random()*4)]:constant;s=settle(s,target,reason.tag);}
  const r=result(s);reached.add(r.key);assert.ok(r.evidence.length>0);assert.ok(r.evidence.every(h=>s.history.includes(h)));assert.ok(r.profile.trigger&&r.reasonSummary&&r.contrast);
 }
 assert.equal(reached.size,30,'Unreachable: '+Object.keys(roles).filter(k=>!reached.has(k)).join(','));
});
