import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {mirrorAPI,hash} from '../server/mirror-api.mjs';

function fixture(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../drizzle/0000_slippery_nightmare.sql',import.meta.url),'utf8'));
 const prepare=sql=>({args:[],bind(...args){this.args=args;return this;},async first(){return sqlite.prepare(sql).get(...this.args)||null;},async all(){return {results:sqlite.prepare(sql).all(...this.args)};},async run(){return sqlite.prepare(sql).run(...this.args);}});
 const DB={prepare,async batch(items){sqlite.exec('BEGIN');try{const result=[];for(const s of items)result.push(await s.run());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 const adminToken='a'.repeat(64),env={DB};
 const call=async(action,body,token,origin='https://baihuzigl.com')=>{env.MIRROR_ADMIN_HASH=await hash(adminToken);const response=await mirrorAPI(new Request('https://site.test/api/mirror/'+action,{method:body===undefined?'GET':'POST',headers:{Origin:origin,...(token?{Authorization:'Bearer '+token}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env);return {status:response.status,data:await response.json(),headers:response.headers};};
 return {call,sqlite,adminToken};
}
test('connection probes are read-only, allow permitted origins and preserve origin restrictions',async()=>{
 const {call,sqlite}=fixture();
 for(const body of [undefined,{}]){
  const r=await call('health',body,'0'.repeat(64));
  assert.equal(r.status,200);assert.deepEqual(r.data,{ok:true});
  assert.equal(r.headers.get('Cache-Control'),'no-store');
  assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://baihuzigl.com');
 }
 assert.equal((await call('health',{},undefined,'https://evil.test')).status,403);
 assert.equal((await call('health',{text:'x'.repeat(4097)})).status,413);
 for(const table of ['mirror_sessions','mirror_codes','mirror_limits'])assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM '+table).get().n,0);
});
test('two free turns, server gate, valid redemption, reload and ten-turn result',async()=>{
 const {call,sqlite,adminToken}=fixture();let r=await call('start',{}),token=r.data.token;
 for(let i=0;i<2;i++){r=await call('turn',{version:r.data.version,target:.25,reason:'plan'},token);assert.equal(r.status,200);}
 assert.equal(r.data.locked,true);assert.equal(r.data.chapter,null);assert.equal(r.data.out,null);assert.equal(r.data.game.prices.length,3);
 const blocked=await call('turn',{version:2,target:.25,reason:'plan'},token);assert.equal(blocked.status,402);
 const issued=await call('admin/issue',{batch:'test',count:1},adminToken);const code=issued.data.codes[0].code;
 assert.equal(sqlite.prepare('SELECT hash FROM mirror_codes').get().hash,await hash(code.replaceAll('-','')));
 assert.equal((await call('redeem',{code:'bad'},token)).status,400);
 r=await call('redeem',{code:code.toLowerCase().replaceAll('-',' ')},token);assert.equal(r.data.unlocked,true);assert.equal(r.data.chapter.title,'这个消息别外传');
 assert.equal((await call('redeem',{code},token)).status,200);
 r=await call('state',undefined,token);assert.equal(r.data.game.step,2);assert.equal(r.data.unlocked,true);
 while(r.data.game.step<10){r=await call('turn',{version:r.data.version,target:.25,reason:r.data.chapter.reasons.some(x=>x.tag==='plan')?'plan':r.data.chapter.reasons[0].tag},token);assert.equal(r.status,200);}
 assert.equal(r.data.out.name,'人间清醒');
 assert.equal((await call('restart',{version:r.data.version},token)).data.unlocked,true);
});
test('one code cannot bind two browsers; revocation and reset revoke old access',async()=>{
 const {call,adminToken}=fixture();const a=(await call('start',{})).data,b=(await call('start',{})).data;
 const item=(await call('admin/issue',{batch:'concurrency',count:1},adminToken)).data.codes[0];
 const claims=await Promise.all([call('redeem',{code:item.code},a.token),call('redeem',{code:item.code},b.token)]);
 assert.deepEqual(claims.map(r=>r.status).sort(),[200,409]);const winner=claims[0].status===200?a:b,loser=winner===a?b:a;
 assert.equal((await call('admin/revoke',{id:item.id},adminToken)).status,200);
 assert.equal((await call('state',undefined,winner.token)).data.unlocked,false);
 assert.equal((await call('redeem',{code:item.code},winner.token)).status,409);
 assert.equal((await call('admin/reset',{id:item.id},adminToken)).status,200);
 assert.equal((await call('redeem',{code:item.code},loser.token)).status,200);
 assert.equal((await call('state',undefined,winner.token)).data.unlocked,false);
});
test('admin authorization, token isolation, stale turns and rate limits',async()=>{
 const {call,adminToken}=fixture();assert.equal((await call('admin/codes')).status,403);
 assert.equal((await call('admin/issue',{batch:'x',count:1},'b'.repeat(64))).status,403);
 const s=(await call('start',{})).data;
 assert.equal((await call('state',undefined,'b'.repeat(64))).status,401);
 assert.equal((await call('turn',{version:0,target:1,reason:'plan'},s.token)).status,200);
 assert.equal((await call('turn',{version:0,target:1,reason:'plan'},s.token)).status,409);
 assert.equal((await call('state',undefined,s.token,'https://evil.test')).status,403);
 assert.equal((await call('state',undefined,s.token)).headers.get('Access-Control-Allow-Origin'),'https://baihuzigl.com');
 for(let i=0;i<30;i++)await call('redeem',{code:'bad'},s.token);
 assert.equal((await call('redeem',{code:'bad'},s.token)).status,429);
 const list=(await call('admin/codes',undefined,adminToken)).data;assert.ok(Array.isArray(list.codes));
});

test('new fifteen-chapter edition uses the same redemption entitlement and preserves old saves',async()=>{
 const {call,adminToken}=fixture();const old=(await call('start',{})).data;
 assert.equal(old.game.total,10);assert.equal(old.game.edition,1);
 let oldTurn=(await call('turn',{version:0,target:.25,reason:'plan'},old.token)).data;
 assert.equal(oldTurn.chapter.title,'先买一点试试');
 const code=(await call('admin/issue',{count:1,batch:'upgrade'},adminToken)).data.codes[0].code;
 assert.equal((await call('redeem',{code},old.token)).status,200);
 let r=await call('restart',{version:oldTurn.version,edition:2},old.token);
 assert.equal(r.data.game.total,15);assert.equal(r.data.unlocked,true);assert.equal(r.data.game.edition,2);
 for(let i=0;i<15;i++){
  const reason=r.data.chapter.reasons.find(x=>x.tag==='plan')||r.data.chapter.reasons[0];
  r=await call('turn',{version:r.data.version,target:.6,reason:reason.tag},old.token);assert.equal(r.status,200);
  if(i===9){assert.equal(r.data.game.step,10);assert.equal(r.data.out,null);assert.ok(r.data.chapter);}
 }
 assert.equal(r.data.game.step,15);assert.equal(r.data.out.name,'股市公务员');assert.equal(r.data.out.dimensions.length,6);
 const restored=(await call('state',undefined,old.token)).data;assert.equal(restored.game.history.length,15);assert.deepEqual(restored.out,r.data.out);
 const fresh=(await call('start',{edition:2})).data;
 let v=fresh;for(let i=0;i<2;i++)v=(await call('turn',{version:v.version,target:0,reason:v.chapter.reasons[0].tag},fresh.token)).data;
 assert.equal(v.locked,true);assert.equal(v.chapter,null);assert.equal((await call('turn',{version:v.version,target:0,reason:'plan'},fresh.token)).status,402);
});
