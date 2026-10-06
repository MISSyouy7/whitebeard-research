export const PATHS = [[100,106,115,109,96,104,118,110,92,101,107],[100,103,99,108,116,105,112,98,104,111,102],[100,96,102,94,101,110,106,115,103,97,109]];
export const families = {
 calm:{name:'空仓祖师爷',line:'大家都在操作，你在等大家操作完。',desc:'你习惯先留后手。错过会让你心痒，但未知比涨幅更让你警觉。',mark:'守'},
 chase:{name:'阳线教主',line:'你的信仰，每根 K 线更新一次。',desc:'你容易被正在发生的上涨吸引。别人说得再多，不如一根阳线让你心动。',mark:'追'},
 rumor:{name:'小作文首席',line:'消息来源：一个不能透露来源的人。',desc:'你喜欢抢在共识之前找到线索。这个月，群里的声音多次挤进你的决策。',mark:'信'},
 hold:{name:'股东钉子户',line:'进场想赚差价，留下开始关心公司传承。',desc:'你很难轻易推翻自己的选择。成本价和最初的判断，经常成为继续等待的理由。',mark:'等'},
 dip:{name:'半山腰业主',line:'别人等底，你沿途置业。',desc:'价格越低，你越容易看见机会。你愿意逆着情绪走，也容易把便宜当成理由。',mark:'接'},
 plan:{name:'人间清醒',line:'群聊可以静音，自己的计划不能。',desc:'你倾向于看条件、留记录，再做决定。结果有运气，你更在意过程能否说清。',mark:'察'}
};
export const roleCatalog={
 calm:[
 ['空仓祖师爷','空仓','祖师爷','大家都在操作，你在等大家操作完。','手中无仓 · 心中有数'],
 ['现金保管员','现金','保管员','股票负责热闹，你负责保管余额。','小仓参与 · 现金压阵'],
 ['安全带车手','安全带','车手','车已经上了，安全带还要再检查三遍。','参与行情 · 惦记退路'],
 ['嘴硬风控官','嘴硬','风控官','嘴上说风险第一，账户说已经满了。','理性发言 · 感性下单']
 ],
 chase:[
 ['踏空文学家','踏空','文学家','账户没怎么动，内心已经写完一部长篇。','仓位很轻 · 内心很忙'],
 ['追涨见习生','追涨','见习生','先买一点，主要是给心动一个交代。','小仓试探 · 心向阳线'],
 ['阳线教主','阳线','教主','你的信仰，每根 K 线更新一次。','见红心动 · 顺势而来'],
 ['满仓气氛组','满仓','气氛组','行情刚热场，你已经把座位买满了。','气氛到位 · 仓位到位']
 ],
 rumor:[
 ['消息收藏家','消息','收藏家','消息存了三百条，买入键还挺干净。','消息很多 · 仓位很少'],
 ['瓜田试水员','瓜田','试水员','本来只想吃瓜，顺手买了点瓜田。','听个故事 · 买点参与'],
 ['小作文首席','小作文','首席','消息来源：一个不能透露来源的人。','消息在手 · 剧本我有'],
 ['重仓课代表','重仓','课代表','别人的一句重点，成了你的整本仓位。','重点全画 · 仓位全上']
 ],
 hold:[
 ['场外意难平','场外','意难平','仓位可以不在，那个价格一直都在。','人已离席 · 心还在场'],
 ['底仓守门员','底仓','守门员','留一点不是舍不得，是故事还没看完。','仓位不大 · 念念不忘'],
 ['股东钉子户','股东','钉子户','进场想赚差价，留下开始关心公司传承。','初心未改 · 仓位仍在'],
 ['回本永动机','回本','永动机','交易计划只有一页：回本再说。','仓位很满 · 等待很长']
 ],
 dip:[
 ['抄底观光客','抄底','观光客','每个底都点评过，每次都说再看看。','研究地形 · 暂不施工'],
 ['半山腰业主','半山腰','业主','别人等底，你沿途置业。','分批入场 · 沿途置业'],
 ['补仓工程师','补仓','工程师','成本线画得很漂亮，预算还在往里填。','价格越低 · 图纸越厚'],
 ['抄底施工队','抄底','施工队','别人问到底没有，你已经把设备全开进去了。','全面进场 · 等待地基']
 ],
 plan:[
 ['独立观察员','独立','观察员','行情说它的，你等自己的条件。','保持观察 · 不赶热闹'],
 ['人间清醒','人间','清醒','群聊可以静音，自己的计划不能。','看得见热闹 · 守得住自己'],
 ['计划执行官','计划','执行官','你下单之前，已经给自己写好备忘录。','有据入场 · 事后复盘'],
 ['清醒冒险家','清醒','冒险家','风险你都写下了，仓位你也真上了。','想过风险 · 仍愿重仓']
 ]
};
export const exposureBands=['平均目标仓位不超过 10%','平均目标仓位超过 10%、不超过 40%','平均目标仓位超过 40%、不超过 75%','平均目标仓位超过 75%'];
export const roles=Object.fromEntries(Object.entries(roleCatalog).flatMap(([family,items],fi)=>items.map(([name,first,second,line,motto],band)=>[family+'_'+band,{...families[family],name,line,motto,lines:[first,second],family,band,number:String(fi*4+band+1).padStart(2,'0')}])));
const r=(text,tag)=>({text,tag});
export const chapters=[
{title:'老周又赚钱了',day:'第 1—2 个交易日',speaker:'老周',say:'也没怎么操作。先上车，总比在站台上强。',body:'周日晚上的收益截图，让你失眠了十分钟。周一，10 万元模拟本金到账。虚构股票「镜海科技」出现在你的自选里。',reasons:[r('不想成为群里唯一没参与的人','chase'),r('还没搞清楚，先给自己留余地','calm'),r('先用可承受的仓位观察','plan')]},
{title:'先买一点试试',day:'第 3—4 个交易日',speaker:'阿冲',say:'这个票我盯很久了，走得挺有意思。',body:'你开始习惯早上先打开账户。第一笔浮动盈亏，比你想象的更能影响心情。阿冲第一次主动私信你。',reasons:[r('价格在动，我怕错过下一段','chase'),r('先看变化是否符合入场理由','plan'),r('阿冲熟，他可能知道得更多','rumor')]},
{title:'这个消息别外传',day:'第 5—6 个交易日',speaker:'阿冲',say:'朋友转来的，说有个大订单。截图你看看，别外传。',body:'截图里只有一段聊天，没有公告、日期和签名。群里已经有人发“起飞”的表情。你打开了下单页。',reasons:[r('等公告出来，价格可能就晚了','rumor'),r('找不到原始出处，暂时不采信','plan'),r('群里这么多人看好，跟一点','chase')]},
{title:'只是正常调整',day:'第 7—8 个交易日',speaker:'小林',say:'先别急着解释涨跌。你当初买它的理由，还成立吗？',body:'行情并没有按群里预测的时间表走。有人说洗盘，有人说趋势变了。同一张图，被画出了两个方向。',reasons:[r('我更关心还能不能守住现金','calm'),r('既然选了，就再给它一点时间','hold'),r('复查最初假设，再决定仓位','plan')]},
{title:'越便宜，越心动？',day:'第 9—10 个交易日',speaker:'老周',say:'我一般分批。价格低了，就把平均成本做下来。',body:'你点开持仓成本，又看了看现价。摊薄成本的计算很诱人，但账户里的现金用掉就少一笔。',reasons:[r('价格更低时，我更愿意买','dip'),r('想把回本需要的涨幅降下来','hold'),r('现金要给尚未发生的事情留着','calm')]},
{title:'另一个选择的诱惑',day:'第 11—12 个交易日',speaker:'阿冲',say:'早知道刚才就……算了，不说了。',body:'你开始计算“如果上次选另一项，现在会怎样”。那个不存在的账户，似乎总比真实账户更漂亮。',reasons:[r('想把错过的那段补回来','chase'),r('不能让后悔替我下下一笔单','plan'),r('我还是信最开始那个判断','hold')]},
{title:'朋友圈都是赢家',day:'第 13—14 个交易日',speaker:'老周',say:'今天又吃到一点。你们怎么样？',body:'刷到的都是红色截图，亏损的人没有更新。你不知道他们的本金、持仓，也不知道截图前发生过什么。',reasons:[r('别人都能赚，我得更主动','chase'),r('截图没说完的部分，也很重要','plan'),r('想问问他们下一步看什么','rumor')]},
{title:'我就等回本',day:'第 15—16 个交易日',speaker:'小林',say:'如果今天是第一次看到它，你还会做同样的选择吗？',body:'成本价像一条看不见的线。即使已经空仓，你仍记得自己买卖的位置。市场不会记得，但你记得。',reasons:[r('至少让我回到心里的那个位置','hold'),r('比之前便宜，就有重新买的理由','dip'),r('从今天的信息重新判断','plan')]},
{title:'群突然安静了',day:'第 17—18 个交易日',speaker:'阿冲',say:'我先忙了，今天不看盘。',body:'群里不再有人解释行情。那条“大订单”的消息仍未得到证实。你发现，最后点确认的人始终只有自己。',reasons:[r('先把不确定性降下来','calm'),r('安静时反而容易捡到便宜','dip'),r('消息也许还需要时间兑现','rumor')]},
{title:'月底，交作业',day:'第 19—20 个交易日',speaker:'小林',say:'这个月，你最想留下的是收益截图，还是一条能重复的原则？',body:'故事来到最后一笔决定。账户会结算，但收益高低不决定你是什么角色。镜子记住的是，你每一次为什么这样选。',reasons:[r('我会记录每次决定及其前提','plan'),r('下一次，我还是不想错过行情','chase'),r('先活到下一轮，机会总会有','calm')]}
];
export function initial(path=0){return {v:1,path,step:0,cash:100000,shares:0,peak:100000,drawdown:0,trades:0,history:[],scores:Object.fromEntries(Object.keys(families).map(k=>[k,0]))};}
export function equity(s){return s.cash+s.shares*PATHS[s.path][s.step];}
export function exposure(s){return equity(s)>0?s.shares*PATHS[s.path][s.step]/equity(s):0;}
export function settle(s,target,reason){if(s.step>=10||!Number.isFinite(target)||target<0||target>1||!chapters[s.step].reasons.some(r=>r.tag===reason))throw new Error('Invalid turn');const price=PATHS[s.path][s.step];const before=equity(s);let cash=s.cash,shares=s.shares;const delta=before*target-shares*price;let fee=0,quantity=0;if(delta>0.01){const spend=Math.min(cash,delta*1.001);quantity=spend/1.001/price;fee=spend-spend/1.001;shares+=quantity;cash-=spend;}else if(delta<-.01){quantity=-Math.min(shares,-delta/price);fee=-quantity*price*.001;shares+=quantity;cash+=-quantity*price-fee;}cash=Math.max(0,cash);const next=PATHS[s.path][s.step+1],after=cash+shares*next,peak=Math.max(s.peak,before,after);return {...s,step:s.step+1,cash,shares,peak,drawdown:Math.max(s.drawdown,(peak-after)/peak),trades:s.trades+(Math.abs(quantity)>1e-8?1:0),scores:{...s.scores,[reason]:s.scores[reason]+1},history:[...s.history,{chapter:s.step,target,reason,before,after,price,next,fee,quantity}]};}
export function result(s){
 const family=Object.keys(families).reduce((best,k)=>s.scores[k]>s.scores[best]?k:best,'plan');
 const averageTarget=s.history.reduce((n,h)=>n+h.target,0)/Math.max(s.history.length,1);
 const band=averageTarget<=.1000001?0:averageTarget<=.4000001?1:averageTarget<=.7500001?2:3,key=family+'_'+band;
 const bad=s.history.filter(h=>(h.quantity>0&&h.next<h.price)||(h.quantity<0&&h.next>h.price)).length;
 const title=s.trades===0?'全程场外观察员':bad>=5?'反指体验官':equity(s)<100000?'关灯面馆常客':'这个月有点运气';
 return {key,...roles[key],averageTarget,bandLabel:exposureBands[band],title,evidence:s.history.filter(h=>h.reason===family).slice(0,3)};
}
export function restore(raw){try{const parsed=JSON.parse(raw);if(parsed.v!==1||!Number.isInteger(parsed.path)||!PATHS[parsed.path]||!Array.isArray(parsed.history)||parsed.history.length>10)return null;return parsed.history.reduce((s,h)=>settle(s,h.target,h.reason),initial(parsed.path));}catch{return null;}}
