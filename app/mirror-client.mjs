const TOKEN='market-mirror-access-v2';
export const readToken=()=>{try{return localStorage.getItem(TOKEN);}catch{return null;}};
export const writeToken=token=>{try{localStorage.setItem(TOKEN,token);}catch{throw new Error('浏览器不允许保存凭证，请开启存储后再兑换。');}};
export async function api(action,body,adminToken){
  const remote=['baihuzigl.com','www.baihuzigl.com'].includes(location.hostname)?'https://whitebeard-research-institute.prime-cabin-3794.chatgpt.site':'';
  const token=adminToken||readToken();
  let response;
  try{response=await fetch(remote+'/api/mirror/'+action,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});}catch{throw new Error('未能连接兑换服务，请检查网络后重试。');}
  const data=await response.json().catch(()=>({error:'兑换服务尚未开放，请稍后再试。'}));
  if(!response.ok)throw new Error(data.error||'服务暂时不可用，请重试。');
  return data;
}
