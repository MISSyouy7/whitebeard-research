const TOKEN='market-mirror-access-v2';
export const readToken=()=>{try{return localStorage.getItem(TOKEN);}catch{return null;}};
export const writeToken=token=>{try{localStorage.setItem(TOKEN,token);}catch{throw new Error('浏览器不允许保存凭证，请开启存储后再兑换。');}};
export async function api(action,body,adminToken){
  const remote=['baihuzigl.com','www.baihuzigl.com'].includes(location.hostname)?'https://api.baihuzigl.com':'';
  const token=adminToken||readToken();
  if(typeof fetch!=='function')throw new Error('当前浏览器版本较旧，请复制网址到手机自带浏览器打开。');
  const controller=typeof AbortController==='function'?new AbortController():null;
  let timer,timedOut=false;
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{timedOut=true;reject(new Error('连接超时'));controller?.abort();},15000);});
  try{
    const request=(async()=>{
      let response;
      try{response=await fetch(remote+'/api/mirror/'+action,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),...(controller?{signal:controller.signal}:{})});}
      catch{throw new Error(typeof navigator!=='undefined'&&navigator.onLine===false?'当前设备处于离线状态，请连接网络后重试。':'页面已打开，但暂时连接不上体验服务。请尝试切换 Wi-Fi／移动网络；若仍失败，请联系卖家并告知浏览器名称。');}
      let data;
      try{data=await response.json();}catch{throw new Error('体验服务未返回有效数据，可能遇到访问验证或服务异常。请稍后重试；若持续出现，请联系卖家。');}
      if(!response.ok)throw new Error(data?.error||'服务暂时不可用，请稍后重试。');
      if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('体验服务返回异常，请稍后重试。');
      return data;
    })();
    return await Promise.race([request,deadline]);
  }catch(error){
    if(timedOut)throw new Error('体验服务连接超时。请稍后刷新页面确认进度，再重试；已兑换用户请保留浏览器数据。');
    throw error;
  }finally{clearTimeout(timer);}
}
