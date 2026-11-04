// ================= 成就、統計、特別訂單、挑戰／無盡模式、放大鏡鑑定 =================
const ACH=[
  {id:'first1',n:'第一枚 1 元',d:'找到第一枚 1 元',rw:5,c:()=>G.onesFound>=1},
  {id:'coll6',n:'小小收藏家',d:'收藏 6 種 1 元',rw:50,c:()=>Object.keys(G.coll).length>=6},
  {id:'coll12',n:'收藏家',d:'收藏 12 種 1 元',rw:200,c:()=>Object.keys(G.coll).length>=12},
  {id:'coll24',n:'一元博物館',d:'24 種 1 元全部集滿',rw:2000,c:()=>Object.keys(G.coll).length>=24},
  {id:'earn100',n:'第一桶金',d:'總共賺到 $100',rw:10,c:()=>G.earned>=100},
  {id:'earn1k',n:'小老闆',d:'總共賺到 $1,000',rw:50,c:()=>G.earned>=1000},
  {id:'earn10k',n:'大老闆',d:'總共賺到 $10,000',rw:300,c:()=>G.earned>=10000},
  {id:'rate100',n:'印鈔機',d:'每分鐘賺 $100',rw:100,c:()=>(G.rate||0)>=100},
  {id:'combo10',n:'手不停',d:'賣硬幣連擊到 x10',rw:5,c:()=>(G.bestCombo||1)>=10},
  {id:'dig1m',n:'一百萬',d:'挖出 100 萬枚硬幣',rw:100,c:()=>G.dug>=1e6},
  {id:'belt100',n:'輸送帶達人',d:'鋪了 100 公尺輸送帶',rw:50,c:()=>(G.beltsBuilt||0)>=100},
  {id:'tile50',n:'工廠長',d:'院子裡有 50 台機器',rw:100,c:()=>{let n=0;for(const t of tiles.values())if(BIT[t.type]&&!BELTLIKE.has(t.type))n++;return n>=50}},
  {id:'order7',n:'準時送達',d:'完成全部 7 張訂單',rw:500,c:()=>G.order>=ORDERS.length},
  {id:'night',n:'夜貓子',d:'在晚上找到 1 元',rw:30,c:()=>G.flags.nightOne},
  {id:'rain',n:'雨中的生意',d:'下雨的時候賣硬幣',rw:10,c:()=>G.flags.rainSell},
  {id:'twenty10',n:'貳拾圓',d:'撿到 10 枚 20 元',rw:20,c:()=>(G.twenty||0)>=10},
  {id:'noLoss',n:'一枚都不放過',d:'找到 10 枚 1 元，而且沒有任何一枚被賣掉',rw:100,c:()=>G.onesFound>=10&&!G.onesLost},
  {id:'power50',n:'電力公司',d:'電網供電達到 50kW',rw:100,c:()=>power.sup>=50},
  {id:'photo',n:'攝影師',d:'在拍照模式拍一張照片',rw:5,c:()=>G.flags.photo},
  {id:'sky',n:'飛高高',d:'飛到 15 公尺高',rw:20,c:()=>(G.maxY||0)>=15},
  {id:'peak',n:'攻頂',d:'爬上 The Mountain 40 公尺高的地方',rw:200,c:()=>SIZES[G.size].hf&&(G.maxY||0)>=40},
  {id:'streak3',n:'每天來撈一下',d:'每日挑戰連續完成 3 天',rw:30,c:()=>dailyStreak()>=3},
  {id:'streak7',n:'天天報到',d:'每日挑戰連續完成 7 天',rw:150,c:()=>dailyStreak()>=7},
  {id:'decor5',n:'佈置院子',d:'在院子裡擺 5 個裝飾',rw:30,c:()=>{let n=0;for(const t of tiles.values())if(BIT[t.type]&&BIT[t.type].cat==='裝飾')n++;return n>=5}},
  {id:'sitdown',n:'休息一下',d:'坐在長椅上休息',rw:5,c:()=>G.flags.sat},
  {id:'petcat',n:'摸到貓了',d:'摸摸跑進院子的貓',rw:10,c:()=>(G.catPets||0)>=1},
  {id:'catlover',n:'貓奴',d:'摸貓 10 次',rw:80,c:()=>(G.catPets||0)>=10},
  {id:'meteor',n:'對流星許願',d:'在晚上看到流星',rw:20,c:()=>G.flags.meteor},
  {id:'rainbow',n:'雨後彩虹',d:'雨停之後看到彩虹',rw:20,c:()=>G.flags.rainbow},
  {id:'online',n:'上榜了',d:'把每日挑戰的成績上傳到線上排行榜',rw:20,c:()=>G.flags.online},
  {id:'letter1',n:'有你的信',d:'讀了第一封信',rw:5,c:()=>!!(G.story&&G.story.read.intro)},
  {id:'memory3',n:'山裡的回憶',d:'從硬幣山裡找到阿公的眼鏡、登記簿和老照片',rw:80,c:()=>!!(G.story&&G.story.items.glasses&&G.story.items.passbook&&G.story.items.photo)},
  {id:'reunion',n:'五十年後',d:'看到秀蘭阿嬤和陳師傅坐在長椅上',rw:100,c:()=>!!(G.story&&G.story.met)},
  {id:'story',n:'第一枚一元',d:'在一元展放天燈，看完劇情的結局',rw:500,c:()=>!!(G.story&&G.story.festDone)},
  {id:'allOnes',n:'大海撈一元',d:'找出這個院子所有的 1 元',rw:1000,c:()=>anchors.size===0&&G.onesHand===0&&G.onesFound>0},
  {id:'special3',n:'有求必應',d:'完成 3 張特別訂單',rw:200,c:()=>(G.specialDone||0)>=3},
  {id:'chal',n:'挑戰成功',d:'在挑戰模式找出所有的 1 元',rw:300,c:()=>G.chalDone}
];
function checkAch(){
  G.ach=G.ach||{};G.maxY=Math.max(G.maxY||0,pl.y);
  for(const a of ACH)if(!G.ach[a.id]&&a.c()){G.ach[a.id]=Math.round(G.play);addMoney(a.rw,true);toast('🏆 成就：'+a.n+'　獎勵 '+money(a.rw),'gold');chime();buzz([30,30,30,30,60])}
}
// 統計：每 20 秒記一次，太多就把舊的資料減半
function recordStats(){G.hist=G.hist||[];const h=G.hist,last=h[h.length-1];if(last&&G.play-last.t<20)return;
  h.push({t:Math.round(G.play),e:+G.earned.toFixed(2),r:+(G.rate||0).toFixed(2),d:G.dug,o:G.onesFound});if(h.length>360)G.hist=h.filter((_,i)=>i%2===0||i===h.length-1)}
const fmtT=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
function drawChart(cvs){const g=cvs.getContext('2d'),W=cvs.width,Hh=cvs.height,h=G.hist||[];g.fillStyle='#101012';g.fillRect(0,0,W,Hh);
  g.strokeStyle='#ffffff18';g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();g.moveTo(40,k*Hh/4);g.lineTo(W-8,k*Hh/4);g.stroke()}
  if(h.length<2){g.fillStyle='#888';g.font='14px sans-serif';g.fillText('再玩一下就會有資料',W/2-70,Hh/2);return}
  const t0=h[0].t,t1=h[h.length-1].t||1,me=Math.max(...h.map(p=>p.e))||1,mr=Math.max(...h.map(p=>p.r))||1,X=t=>40+(t-t0)/Math.max(1,t1-t0)*(W-50);
  const line=(f,mx,col)=>{g.strokeStyle=col;g.lineWidth=2;g.beginPath();h.forEach((p,i)=>{const y=Hh-14-f(p)/mx*(Hh-30);i?g.lineTo(X(p.t),y):g.moveTo(X(p.t),y)});g.stroke()};
  line(p=>p.e,me,'#e8c23a');line(p=>p.r,mr,'#5ab4ff');
  g.fillStyle='#e8c23a';g.font='12px sans-serif';g.fillText('總收入 '+money(me),44,14);g.fillStyle='#5ab4ff';g.fillText('每分鐘收入（最高 '+money(mr)+'）',190,14);g.fillStyle='#888';g.fillText(fmtT(t0),40,Hh-2);g.fillText(fmtT(t1),W-48,Hh-2)}
let statTab='ach';
function renderStats(){
  const tabs='<div class="opts" style="margin:6px 0 10px"><button class="ob'+(statTab==='ach'?' on':'')+'" data-stab="ach">成就</button><button class="ob'+(statTab==='stat'?' on':'')+'" data-stab="stat">統計</button></div>';
  if(statTab==='ach'){const got=ACH.filter(a=>G.ach&&G.ach[a.id]).length;
    $('statBd').innerHTML=tabs+'<div style="color:#aaa;font-size:13px;margin-bottom:8px">解鎖了 '+got+' / '+ACH.length+' 個</div><div class="achs">'+ACH.map(a=>{const ok=G.ach&&G.ach[a.id]!=null;return '<div class="ach'+(ok?' ok':'')+'"><b>'+(ok?'🏆 ':'🔒 ')+a.n+'</b><span>'+a.d+'</span><small>'+(ok?'在 '+fmtT(G.ach[a.id])+' 解鎖':'獎勵 '+money(a.rw))+'</small></div>'}).join('')+'</div>';return}
  const made=Object.entries(G.made||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<tr><td>'+(BIT[k]?BIT[k].icon+' '+BIT[k].name:k)+'</td><td style="text-align:right">'+fmt(v)+' 枚</td></tr>').join('');
  const ones=(G.oneLog||[]).slice(-30).reverse().map(o=>{const t=ONE_TYPES.find(x=>x.id===o.id);return '<tr><td>'+fmtT(o.t)+'</td><td>'+(t?t.name:o.id)+'</td></tr>'}).join('');
  $('statBd').innerHTML=tabs+'<canvas id="statChart" width="640" height="200" style="width:100%;max-width:640px;display:block"></canvas>'+
    '<div class="stgrid"><div><h4>總覽</h4><table>'+[['玩了',fmtT(G.play)],['總收入',money(G.earned)],['挖出的硬幣',fmt(G.dug)+' 枚'],['賣掉的硬幣',fmt(G.coinsSold)+' 枚'],['找到的 1 元',G.onesFound+' 枚'],['被賣掉的 1 元',(G.onesLost||0)+' 枚'],['撿到的 20 元',(G.twenty||0)+' 枚'],['完成的特別訂單',(G.specialDone||0)+' 張']].map(r=>'<tr><td>'+r[0]+'</td><td style="text-align:right">'+r[1]+'</td></tr>').join('')+'</table></div>'+
    '<div><h4>每種機器做了多少</h4><table>'+(made||'<tr><td style="color:#888">還沒有機器在工作</td></tr>')+'</table></div>'+
    '<div><h4>找到 1 元的時間</h4><table>'+(ones||'<tr><td style="color:#888">還沒找到</td></tr>')+'</table></div></div>';
  drawChart($('statChart'));
}
// 特別訂單：不定時出現；限時高價交貨，或收藏家指定要某一種 1 元
function newSpecial(){
  const prods=['coin',...['roll','wrap','eco','disc','pulp','paper'].filter(p=>(G.madeProd||{})[p])];
  const owned=ONE_TYPES.filter(t=>G.coll[t.id]);
  if(owned.length&&Math.random()<.35){const t=owned[Math.floor(Math.random()*owned.length)];G.special={kind:'collector',id:t.id,rw:Math.round(40*t.w+20),until:G.play+600}}
  else{const t=prods[Math.floor(Math.random()*prods.length)],n=t==='coin'?Math.round(8000+Math.random()*12000):Math.round(6+Math.random()*24);
    const val=t==='coin'?n*priceEach():n*60*priceEach()*(PROD[t]?PROD[t].mul:1)*1.2;G.special={kind:'deliver',t,n,prog:0,rw:Math.max(20,Math.round(val*3)),until:G.play+(t==='coin'?420:540)}}
  toast('★ 新的特別訂單！去訂單板看看','gold');tone(880,.1);tone(1320,.2);
}
function specialAdd(t,n){const sp=G&&G.special;if(!sp||sp.kind!=='deliver'||sp.t!==t)return;sp.prog+=n;if(sp.prog>=sp.n)finishSpecial()}
function finishSpecial(){const sp=G.special;addMoney(sp.rw,true);toast('★ 特別訂單完成！獎勵 '+money(sp.rw),'gold');chime();buzz([60,40,60]);G.specialDone=(G.specialDone||0)+1;G.special=null;G.specialNext=G.play+300+Math.random()*240}
function specialTxt(){const sp=G.special;if(!sp)return '';const left=fmtT(sp.until-G.play);
  if(sp.kind==='collector'){const t=ONE_TYPES.find(x=>x.id===sp.id);return '收藏家想要一枚「'+t.name+'」，獎勵 '+money(sp.rw)+'（剩 '+left+'）'}
  return '限時交貨：'+(sp.t==='coin'?fmtS(sp.n)+' 枚硬幣（丟進收購站或用輸送帶賣掉）':sp.n+' 個'+PROD[sp.t].name+'（送到出貨口）')+'　'+fmtS(Math.min(sp.prog,sp.n))+' / '+fmtS(sp.n)+'，獎勵 '+money(sp.rw)+'（剩 '+left+'）'}
function updateSpecial(){if(G.specialNext==null)G.specialNext=G.play+360;
  if(G.special&&G.play>G.special.until){toast('特別訂單過期了','red');G.special=null;G.specialNext=G.play+300+Math.random()*240}
  if(!G.special&&G.play>G.specialNext&&G.step>20)newSpecial()}
// 挑戰模式：計時找出所有 1 元，最佳紀錄記在這台電腦；無盡模式：硬幣堆挖完再倒一車
const CHKEY='ft1y_challenge';
function chalBest(){try{return JSON.parse(localStorage.getItem(CHKEY)||'{}')}catch(e){return{}}}
function checkChallenge(){if(G.gmode!=='challenge'||G.chalDone)return;$('chal').classList.remove('hidden');$('chal').textContent='⏱ '+(G.daily?'每日挑戰':G.vs?'朋友挑戰':'挑戰')+' '+fmtT(G.play)+(G.vs?'／朋友 '+fmtT(G.vs):'')+'・還有 '+(anchors.size+G.onesHand)+' 枚 1 元';
  if(anchors.size===0&&G.onesHand===0){G.chalDone=true;const t=G.chalTime=Math.round(G.play);buzz([100,60,200]);
    const share=['分享成績','',()=>shareScore((G.daily?'每日挑戰 ':G.vs?'朋友挑戰 ':'挑戰成功 ')+fmtT(t))],vs=['挑戰朋友','',()=>sendVs(t)];
    if(G.daily){const d=dailyRec(),prev=d[G.daily];d[G.daily]=prev?Math.min(prev,t):t;saveDaily(d);const sk=dailyStreak();
      dialog('每日挑戰成功！','<p>找出今天所有的 1 元，用了 <b>'+fmtT(t)+'</b>。</p>'+(prev?'<p>今天的最佳紀錄：'+fmtT(d[G.daily])+'</p>':'')+(sk>1?'<p>已經連續 <b>'+sk+'</b> 天完成每日挑戰！</p>':'')+'<p>明天會換一座新的硬幣堆。</p>',(onlineOn()?[['上傳排行榜','gold',()=>uploadDaily(G.daily,t)],vs,share,['好']]:[vs,share,['好','gold']]));return}
    const b=chalBest(),list=b[G.size]||[];list.push(t);list.sort((a,c)=>a-c);b[G.size]=list.slice(0,5);try{localStorage.setItem(CHKEY,JSON.stringify(b))}catch(e){}
    if(G.vs){const d=t-G.vs;
      dialog(d<0?'你贏了！':d>0?'差一點！':'平手！','<p>你用了 <b>'+fmtT(t)+'</b>，朋友用了 <b>'+fmtT(G.vs)+'</b>。</p><p>'+(d<0?'比朋友快了 <b>'+fmtT(-d)+'</b>。':d>0?'比朋友慢了 '+fmtT(d)+'，再挑戰一次也可以。':'跟朋友一樣快。')+'</p>',[['回傳挑戰','',()=>sendVs(t)],share,['好','gold']]);return}
    dialog('挑戰成功！','<p>找出所有的 1 元，用了 <b>'+fmtT(t)+'</b>。</p><p>'+SIZES[G.size].name+' 的最佳紀錄：'+b[G.size].map(fmtT).join('、')+'</p>',[vs,share,['好','gold']])}}
// 每日挑戰：用日期當種子，同一天每個人拿到同一座「小」硬幣堆，計時找出所有的 1 元
const DKEY='ft1y_daily';
function dailyKey(d=new Date()){const z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())}
function dailySeed(k){let h=2166136261;for(const c of'ft1y-daily-'+k){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0)&0x7fffffff}
function dailyRec(){try{return JSON.parse(localStorage.getItem(DKEY)||'{}')}catch(e){return{}}}
function saveDaily(d){const ks=Object.keys(d).sort().slice(-400),o={};ks.forEach(k=>o[k]=d[k]);try{localStorage.setItem(DKEY,JSON.stringify(o))}catch(e){}}
// 連續天數：今天還沒玩的話從昨天往回算，中斷就重算
let streakC=null;
function dailyStreak(){const raw=localStorage.getItem(DKEY)||'',k=dailyKey();if(streakC&&streakC.raw===raw&&streakC.k===k)return streakC.n;
  const d=dailyRec(),day=new Date();let n=0;if(!d[dailyKey(day)])day.setDate(day.getDate()-1);while(d[dailyKey(day)]){n++;day.setDate(day.getDate()-1)}streakC={raw,k,n};return n}
const dayLbl=k=>+k.slice(5,7)+'/'+ +k.slice(8);
function dailyRow(){const d=dailyRec(),ks=Object.keys(d).sort().reverse().slice(0,7);if(!ks.length)return'';
  const sk=dailyStreak();return'<div class="slot"><div><b>📅 每日挑戰'+(sk>1?'・連續 '+sk+' 天':'')+'</b><div class="meta">'+ks.map(k=>dayLbl(k)+' '+fmtT(d[k])).join('、')+'</div></div></div>'}
// 找一個欄位開挑戰：有空的就用；滿了可以拿舊的每日挑戰、朋友挑戰來換（鎖定的不換）
function pickSlot(title,intro,go){const a=loadSlots();let s=a.indexOf(null);if(s<0&&a.length<3)s=a.length;
  if(s>=0){dialog(title,intro,[['開始','gold',()=>go(s)],['先不要']]);return}
  const j=a.findIndex(x=>x&&x.G&&(x.G.daily||x.G.vs)&&!x.locked);
  if(j>=0)dialog(title,intro+'<p>三個存檔欄位都用掉了，要取代「'+a[j].name+'」嗎？</p>',[['取代','gold',()=>go(j)],['先不要']]);
  else dialog('存檔欄位滿了','<p>挑戰會用一個存檔欄位，三個都用掉了，先刪掉一個再來。</p>',[['好','gold']])}
function startDaily(){const k=dailyKey(),a=loadSlots(),i=a.findIndex(x=>x&&x.G&&x.G.daily===k);
  // 今天的已經開過就接著玩
  if(i>=0){startGame(i,a[i]);return}
  const best=dailyRec()[k],sk=dailyStreak();
  pickSlot('每日挑戰・'+dayLbl(k),'<p style="text-align:left">今天每個人拿到的都是同一座「小」硬幣堆，8 枚 1 元也藏在一樣的地方。計時，看多快能全部找出來，明天會換一座新的。'+(best?'<br>你今天的紀錄：<b>'+fmtT(best)+'</b>':'')+(sk>0&&!best?'<br>已經連續 <b>'+sk+'</b> 天了，今天也來撈一下吧。':'')+'</p>',
    s=>startGame(s,{name:'每日挑戰 '+dayLbl(k),size:'small',seed:dailySeed(k),gmode:'challenge',daily:k}))}
// 挑戰朋友：把硬幣堆的種子和自己的成績放進連結，朋友打開就是同一座硬幣堆、1 元藏在一樣的地方
function vsParse(q){const m=/[?&]vs=([a-z]+)\.(\d+)\.(\d+)/.exec(q||'');return m&&SIZES[m[1]]?{size:m[1],seed:+m[2],t:+m[3]}:null}
function vsLink(t){return location.origin+location.pathname+'?vs='+G.size+'.'+G.seed+'.'+t}
function sendVs(t){const url=vsLink(t),txt='我在「大海撈一元」用 '+fmtT(t)+' 找出了'+SIZES[G.size].name+'硬幣堆裡所有的 1 元，你能比我快嗎？',copy=()=>copyText(txt+'\n'+url,'挑戰連結複製好了，貼給朋友就可以','挑戰朋友');
  if(TTON&&navigator.share)navigator.share({title:'大海撈一元',text:txt,url}).catch(e=>{if(e&&e.name!=='AbortError')copy()});else copy()}
function acceptVs(v){const S=SIZES[v.size];
  pickSlot('朋友挑戰你！','<p style="text-align:left">朋友在「'+S.name+'」硬幣堆用了 <b>'+fmtT(v.t)+'</b> 找出所有 '+S.ones+' 枚 1 元。你拿到的是同一座硬幣堆，1 元也藏在一樣的地方，看誰比較快。'+(S.warn?'<br><span style="color:#f0b060">這座硬幣堆比較大，手機或比較舊的電腦可能會跑不動。</span>':'')+'</p>',
    s=>startGame(s,{name:'朋友挑戰 '+fmtT(v.t),size:v.size,seed:v.seed,gmode:'challenge',vs:v.t}))}
// 成績分享圖：遊戲畫面加上成績，手機跳分享選單，電腦下載
function shareScore(head){if(!G)return;renderer.render(scene,camera);
  const W=1200,H=630,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),sw=cv.width,sh=cv.height,k=Math.max(W/sw,H/sh);
  x.fillStyle='#000';x.fillRect(0,0,W,H);x.drawImage(cv,(W-sw*k)/2,(H-sh*k)/2,sw*k,sh*k);
  const g=x.createLinearGradient(0,0,W*.8,0);g.addColorStop(0,'rgba(0,0,0,.85)');g.addColorStop(.55,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
  const F='"Microsoft JhengHei","PingFang TC","Noto Sans TC",sans-serif',md=G.daily?'每日挑戰 '+dayLbl(G.daily):{challenge:'挑戰',endless:'無盡'}[G.gmode]||'一般';
  x.fillStyle='#fff';x.font='900 30px "Arial Black","Segoe UI",sans-serif';x.fillText('FIND THE 1元',60,78);
  x.fillStyle='#e8b931';x.font='bold 58px '+F;x.fillText(head,60,168);
  [['模式',md+'・'+SIZES[G.size].name+'硬幣堆'],['找到 1 元',G.onesFound+' 枚'],['收藏',Object.keys(G.coll||{}).length+' / '+ONE_TYPES.length+' 種'],['挖了',fmtS(G.dug)+' 枚硬幣'],['賺了',money(G.earned)],['玩了',Math.floor(G.play/60)+' 分鐘']]
    .forEach(([a,b],i)=>{const y=240+i*52;x.fillStyle='#aaa';x.font='28px '+F;x.fillText(a,60,y);x.fillStyle='#fff';x.font='bold 30px '+F;x.fillText(b,220,y)});
  x.fillStyle='#8fa3b8';x.font='22px '+F;x.fillText('大海撈一元・a201009200979603117-create.github.io/find-the-1yuan',60,H-36);
  const d=new Date(),z=n=>String(n).padStart(2,'0'),bin=atob(c.toDataURL('image/png').split(',')[1]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  giveFile(new File([u],'大海撈一元_成績_'+d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+'_'+z(d.getHours())+z(d.getMinutes())+'.png',{type:'image/png'}),'成績圖存好了')}
// 回報問題：版本、裝置、遊戲狀態和最近的錯誤，一鍵複製
function reportInfo(){const sf=f=>{try{return f()}catch(_){return'?'}},gl=sf(()=>renderer.getContext()),dbg=gl&&gl!=='?'&&gl.getExtension('WEBGL_debug_renderer_info');
  return['大海撈一元 '+sf(()=>document.querySelector('#ver .a').textContent.replace(/^Find The 1元\s*/,'')),'時間：'+new Date().toLocaleString('zh-TW'),'網址：'+location.href.split('?')[0],'裝置：'+navigator.userAgent,
    '畫面：'+innerWidth+'×'+innerHeight+' @'+devicePixelRatio+'・觸控 '+sf(()=>TTON?'開':'關')+'・主畫面 App '+sf(()=>isStandalone()?'是':'否')+'・省電 '+(SET.eco?'開':'關'),
    '顯示卡：'+(dbg?gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL):'?'),
    '遊戲：'+sf(()=>G?SIZES[G.size].name+'・'+(G.daily?'每日挑戰':G.gmode||'normal')+'・玩了 '+Math.floor(G.play/60)+' 分鐘・欄位 '+(slotIdx+1):'在主選單')+'・'+sf(()=>mode)+'・'+sf(()=>fpsNow)+' FPS',
    '錯誤：'+(ERRS.length?'':'沒有')].concat(ERRS.map(e=>'・'+e.m+(e.at?'（'+e.at+'）':'')+(e.n>1?' ×'+e.n:'')+(e.st?'\n  '+e.st:''))).join('\n')}
function openReport(){$('errBar').classList.add('hidden');const info=reportInfo(),url='https://github.com/a201009200979603117-create/find-the-1yuan/issues/new?title='+encodeURIComponent('問題回報：')+'&body='+encodeURIComponent('發生了什麼事：\n\n\n'+info);
  dialog('回報問題','<p style="text-align:left">'+(ERRS.length?'遊戲剛剛出了 <b>'+ERRS.length+'</b> 個錯誤。':'')+'按「複製問題資訊」，連同你做了什麼、畫面截圖一起傳給開發者；有 GitHub 帳號的話也可以直接開一則回報。</p><textarea readonly></textarea>',
    [['複製問題資訊','gold',()=>copyText(info,'問題資訊複製好了','複製問題資訊')],['到 GitHub 回報','',()=>open(url,'_blank','noopener')],['關閉']]);$('dlgB').querySelector('textarea').value=info}
$('errBar').onclick=()=>{if(locked)unlock();openReport()};
$('statShare').onclick=()=>shareScore('找到 '+G.onesFound+' 枚 1 元');
$('eShare').onclick=()=>shareScore('整堆硬幣都挖完了！');
function refillPile(){G.round=(G.round||1)+1;const seed=(Math.random()*2**31)|0;G.seed=seed;generate(seed,G.size,null);G.left=SIZES[G.size].coins;G.removed=0;G.ended=false;G.marked=[];
  shadowDirty=true;toast('卡車又倒了一整車硬幣進來！第 '+G.round+' 車，1 元也重新藏好了','gold');tone(160,.6,'sawtooth',.05)}


