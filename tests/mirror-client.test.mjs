import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../app/mirror-client.mjs';

function browser(t){
 const oldLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
 const oldStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'location',{configurable:true,value:{hostname:'baihuzigl.com'}});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=> 'saved-session'}});
 t.after(()=>{if(oldLocation)Object.defineProperty(globalThis,'location',oldLocation);else delete globalThis.location;if(oldStorage)Object.defineProperty(globalThis,'localStorage',oldStorage);else delete globalThis.localStorage;});
}
test('older browsers without AbortSignal.timeout send one authenticated request',async t=>{
 browser(t);t.mock.method(AbortSignal,'timeout',undefined);
 let calls=0;
 t.mock.method(globalThis,'fetch',async(url,opts)=>{calls++;assert.equal(url,'https://test-api.baihuzigl.com/api/mirror/redeem');assert.equal(opts.headers.Authorization,'Bearer saved-session');assert.equal(opts.body,JSON.stringify({code:'example'}));return {ok:true,json:async()=>({unlocked:true})};});
 assert.deepEqual(await api('redeem',{code:'example'}),{unlocked:true});assert.equal(calls,1);
});
test('AbortController is optional for successful requests',async t=>{
 browser(t);const old=globalThis.AbortController;globalThis.AbortController=undefined;t.after(()=>globalThis.AbortController=old);
 t.mock.method(globalThis,'fetch',async(_url,opts)=>{assert.equal('signal' in opts,false);return {ok:true,json:async()=>({version:1})};});
 assert.deepEqual(await api('state'),{version:1});
});
test('server errors preserve the actionable message',async t=>{
 browser(t);t.mock.method(globalThis,'fetch',async()=>({ok:false,json:async()=>({error:'兑换码已在其他浏览器使用。'})}));
 await assert.rejects(api('redeem',{code:'example'}),/兑换码已在其他浏览器使用/);
});
test('connection failure is not reported as proven device disconnection',async t=>{
 browser(t);t.mock.method(globalThis,'fetch',async()=>{throw new TypeError('Failed to fetch')});
 await assert.rejects(api('start',{edition:2}),/连接不上体验服务/);
});
test('HTML access challenges have a distinct error',async t=>{
 browser(t);t.mock.method(globalThis,'fetch',async()=>({ok:false,json:async()=>{throw new SyntaxError('HTML')}}));
 await assert.rejects(api('state'),/访问验证或服务异常/);
});
test('timeout covers a hanging response body and never retries a mutation',async t=>{
 browser(t);t.mock.timers.enable({apis:['setTimeout']});let calls=0,signal;
 t.mock.method(globalThis,'fetch',async(_url,opts)=>{calls++;signal=opts.signal;return {ok:true,json:()=>new Promise(()=>{})};});
 const pending=api('redeem',{code:'example'});const checked=assert.rejects(pending,/刷新页面确认进度/);
 t.mock.timers.tick(15000);await checked;assert.equal(calls,1);assert.equal(signal.aborted,true);
});
