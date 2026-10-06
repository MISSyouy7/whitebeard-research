import * as current from '../app/market.mjs';
import * as legacy from './legacy-market.mjs';
const engine=s=>s.v===2?current:legacy;
const newGame=input=>(input.edition===2?current:legacy).initial(crypto.getRandomValues(new Uint8Array(1))[0]%3);

const API='/api/mirror/';
const codeAlphabet='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const newCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(20)),b=>codeAlphabet[b%codeAlphabet.length]).join('').match(/.{5}/g).join('-');
export const normalizeCode=value=>typeof value==='string'?value.toUpperCase().replace(/[\s-]/g,''):'';
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new HttpError(status,message);};
const bearer=request=>request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
const dbOf=env=>{if(!env.DB)fail(503,'兑换服务尚未配置，请稍后再试。');return env.DB;};
async function bodyOf(request){if(Number(request.headers.get('Content-Length'))>4096)fail(413,'提交内容过长。');const raw=await request.text();if(raw.length>4096)fail(413,'提交内容过长。');try{return JSON.parse(raw);}catch{fail(400,'提交格式不正确。');}}
async function rateLimit(db,request,kind,max){
  const now=Date.now(),bucket=Math.floor(now/3600000);
  const identity=await hash(request.headers.get('cf-connecting-ip')||'local');
  const row=await db.prepare('INSERT INTO mirror_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(`${kind}:${identity}:${bucket}`,now+7200000).first();
  if(row.count===1)await db.prepare('DELETE FROM mirror_limits WHERE expires_at < ?').bind(now).run();
  if(row.count>max)fail(429,'尝试次数较多，请一小时后再试。');
}
async function sessionOf(db,request){
  const token=bearer(request);if(!token)fail(401,'体验凭证已丢失，请返回开场重新开始。');
  const row=await db.prepare('SELECT * FROM mirror_sessions WHERE id=?').bind(await hash(token)).first();
  if(!row)fail(401,'体验凭证已失效，请返回开场重新开始。');
  return {...row,game:JSON.parse(row.state)};
}
async function isUnlocked(db,id){return !!await db.prepare("SELECT id FROM mirror_codes WHERE claimed_by=? AND status='active' LIMIT 1").bind(id).first();}
function view(row,unlocked){
  const s=row.game,locked=s.step>=2&&!unlocked,logic=engine(s),{chapters,PATHS,equity,exposure,result}=logic,total=chapters.length;
  return {version:row.version,unlocked,locked,game:{edition:s.v,total,step:s.step,cash:s.cash,shares:s.shares,drawdown:s.drawdown,trades:s.trades,assets:equity(s),exposure:exposure(s),prices:PATHS[s.path].slice(0,s.step+1),history:s.history.map(h=>({...h,title:chapters[h.chapter].title,reasonText:chapters[h.chapter].reasons.find(r=>r.tag===h.reason).text,echo:chapters[h.chapter].reasons.find(r=>r.tag===h.reason).echo||null}))},chapter:!locked&&s.step<total?(logic.currentChapter?logic.currentChapter(s):chapters[s.step]):null,out:!locked&&s.step===total?result(s):null};
}
async function saveGame(db,row,game){
  const changed=await db.prepare('UPDATE mirror_sessions SET state=?,version=version+1,updated_at=? WHERE id=? AND version=? RETURNING version').bind(JSON.stringify(game),Date.now(),row.id,row.version).first();
  if(!changed)fail(409,'进度已在另一页面更新，请刷新后继续。');
  return {...row,game,version:changed.version};
}
async function admin(db,request,env){
  await rateLimit(db,request,'admin',100);
  const token=bearer(request);
  if(!env.MIRROR_ADMIN_HASH||!token||(await hash(token))!==env.MIRROR_ADMIN_HASH)fail(403,'管理密钥不正确。');
}

export async function mirrorAPI(request,env){
  const url=new URL(request.url);if(!url.pathname.startsWith(API))return null;
  const origin=request.headers.get('Origin');
  const allowed=new Set(['https://baihuzigl.com','https://www.baihuzigl.com',url.origin]);
  if(url.hostname==='localhost'||url.hostname==='127.0.0.1')allowed.add('http://localhost:3000');
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
  if(origin&&allowed.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='GET,POST,OPTIONS';headers['Access-Control-Allow-Headers']='Authorization,Content-Type';headers['Access-Control-Max-Age']='600';}
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(origin&&!allowed.has(origin))return json({error:'不支持的访问来源。'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  try{
    const db=dbOf(env),action=url.pathname.slice(API.length).replace(/\/$/,'');
    if(action==='health'){
      if(!['GET','POST'].includes(request.method))fail(405,'不支持的请求方式。');
      // POST probes exercise the same transport as gameplay without creating a session or claiming a code.
      if(request.method==='POST')await bodyOf(request);
      await db.prepare('SELECT id FROM mirror_sessions LIMIT 1').first();return json({ok:true});
    }
    if(action.startsWith('admin/')){
      await admin(db,request,env);
      if(action==='admin/codes'&&request.method==='GET'){
        const rows=await db.prepare('SELECT id,suffix,batch,status,created_at,claimed_at FROM mirror_codes ORDER BY created_at DESC LIMIT 500').all();return json({codes:rows.results});
      }
      if(request.method!=='POST')fail(405,'不支持的请求方式。');
      const input=await bodyOf(request);
      if(action==='admin/issue'){
        if(!Number.isInteger(input.count)||input.count<1||input.count>100)fail(400,'每批可生成 1—100 个兑换码。');
        if(typeof input.batch!=='string'||!input.batch.trim()||input.batch.length>60)fail(400,'请填写 1—60 字的批次名称。');
        const now=Date.now(),items=[];
        for(let i=0;i<input.count;i++){const code=newCode();items.push({id:crypto.randomUUID(),code,hash:await hash(normalizeCode(code)),suffix:code.slice(-5)});}
        await db.batch(items.map(c=>db.prepare('INSERT INTO mirror_codes (id,hash,suffix,batch,status,created_at) VALUES (?,?,?,?,?,?)').bind(c.id,c.hash,c.suffix,input.batch.trim(),'active',now)));
        return json({codes:items.map(({id,code})=>({id,code})),batch:input.batch.trim()});
      }
      if(action==='admin/revoke'||action==='admin/reset'){
        if(typeof input.id!=='string')fail(400,'请选择兑换码。');
        const sql=action==='admin/revoke'?"UPDATE mirror_codes SET status='revoked' WHERE id=? RETURNING id":"UPDATE mirror_codes SET claimed_by=NULL,claimed_at=NULL,status='active' WHERE id=? RETURNING id";
        if(!await db.prepare(sql).bind(input.id).first())fail(404,'兑换码不存在。');return json({ok:true});
      }
      fail(404,'管理操作不存在。');
    }
    if(action==='start'&&request.method==='POST'){
      await rateLimit(db,request,'start',30);
      const input=await bodyOf(request);
      const token=randomToken(),id=await hash(token),game=newGame(input),now=Date.now();
      await db.prepare('INSERT INTO mirror_sessions (id,state,version,created_at,updated_at) VALUES (?,?,0,?,?)').bind(id,JSON.stringify(game),now,now).run();return json({token,...view({game,version:0},false)});
    }
    const row=await sessionOf(db,request);let unlocked=await isUnlocked(db,row.id);
    if(action==='state'&&request.method==='GET')return json(view(row,unlocked));
    if(request.method!=='POST')fail(405,'不支持的请求方式。');
    const input=await bodyOf(request);
    if(action==='redeem'){
      await rateLimit(db,request,'redeem',30);
      if(unlocked)return json(view(row,true));
      const code=normalizeCode(input.code);
      if(!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{20}$/.test(code))fail(400,'兑换码格式不正确，请检查后再试。');
      const claimed=await db.prepare("UPDATE mirror_codes SET claimed_by=?,claimed_at=COALESCE(claimed_at,?) WHERE hash=? AND status='active' AND (claimed_by IS NULL OR claimed_by=?) RETURNING id").bind(row.id,Date.now(),await hash(code),row.id).first();
      if(!claimed)fail(409,'兑换码无效、已停用或已在其他浏览器使用。需要换设备时，请联系卖家重置。');
      return json(view(row,true));
    }
    if(action==='restart'){
      if(input.version!==row.version)fail(409,'进度已更新，请刷新后重试。');
      return json(view(await saveGame(db,row,newGame(input)),unlocked));
    }
    if(action==='turn'){
      if(row.game.step>=2&&!unlocked)fail(402,'请先兑换，解锁后续剧情。');
      if(input.version!==row.version)fail(409,'进度已更新，请刷新后继续。');
      const {chapters,settle}=engine(row.game);
      if(![0,.25,.6,1].includes(input.target)||row.game.step>=chapters.length||!chapters[row.game.step].reasons.some(r=>r.tag===input.reason))fail(400,'请选择本关的操作和理由。');
      return json(view(await saveGame(db,row,settle(row.game,input.target,input.reason)),unlocked));
    }
    fail(404,'操作不存在。');
  }catch(error){if(!(error instanceof HttpError))console.error('Mirror storage request failed',error?.message);return json({error:error instanceof HttpError?error.message:'服务暂时不可用，输入内容已保留，请稍后重试。'},error instanceof HttpError?error.status:503);}
}
