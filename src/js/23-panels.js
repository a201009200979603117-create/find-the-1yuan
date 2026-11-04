// ================= 面板 =================
let techSel='grab',cabSel=null;
function openPanel(id){
  panel=id;lmb=rmb=false;unlock();
  ['shopPanel','techPanel','buildPanel','boardPanel','cabPanel','cfgPanel','statPanel','ovPanel','mailPanel'].forEach(p=>$(p).classList.add('hidden'));
  if(id==='cabPanel')cabSel=null;$(id).classList.remove('hidden');if(id==='techPanel')G.flags.techOpened=true;if(id==='shopPanel')G.flags.shopOpened=true;renderPanel();
}
function closePanel(){if(!panel)return;if(panel==='cabPanel')cvStop();$(panel).classList.add('hidden');panel=null;lock()}
function techState(t){
  const req=t.req&&!techOwned(TECHD[t.req]);
  if(t.shop){const tl=TOOL[t.shop];if(G.tools[t.shop])return{cls:'own',a:'完成',b:'已擁有'};if(req)return{cls:'lock',a:'已鎖定',b:''};return{cls:'',a:'商店有賣',b:money(tl.price)}}
  if(t.auto)return{cls:'own',a:'完成',b:'已擁有'};
  const l=lv(t.id);if(l>=t.max)return{cls:'own',a:'完成',b:l+'/'+t.max};
  if(req)return{cls:'lock',a:'已鎖定',b:l+'/'+t.max};
  return{cls:'',a:'',b:l+'/'+t.max,price:t.cost(l)};
}
// 手機版科技樹：左邊選類別（最上面是「買得起」），中間是小卡片照層數排，右邊是說明和購買
let techLane=null,techSeen=null;
function renderTechM(){
  const depth={},dep=t=>depth[t.id]!=null?depth[t.id]:(depth[t.id]=t.req?dep(TECHD[t.req])+1:0);TECH.forEach(dep);
  const canBuy=t=>{const s=techState(t);return s.cls!=='lock'&&s.price!=null&&G.money>=s.price};
  const lanes=[...new Set(TECH.map(t=>t.lane))],afford=TECH.filter(canBuy),inLane=l=>l==='★'?afford:TECH.filter(t=>t.lane===l);
  if(techSel!==techSeen){techSeen=techSel;if(!techLane||!inLane(techLane).includes(TECHD[techSel]))techLane=TECHD[techSel].lane}
  const tr=$('techTree'),oG=tr.querySelector('.tmG'),oL=tr.querySelector('.tmL'),sg=oG?oG.scrollTop:0,sl=oL?oL.scrollTop:0;
  let h='<div class="tmL"><div data-tlane="★" class="'+(techLane==='★'?'on':'')+'"><span>買得起</span>'+(afford.length?'<i>'+afford.length+'</i>':'')+'</div>'+
    lanes.map(l=>{const ts=inLane(l),b=ts.filter(canBuy).length;return '<div data-tlane="'+l+'" class="'+(l===techLane?'on':'')+'"><span>'+l+'<small>'+ts.filter(techOwned).length+' / '+ts.length+'</small></span>'+(b?'<i>'+b+'</i>':'')+'</div>'}).join('')+'</div><div class="tmG">';
  const list=inLane(techLane).slice().sort((a,b)=>depth[a.id]-depth[b.id]),d0=list.length?Math.min(...list.map(t=>depth[t.id])):0;let last=null;
  if(!list.length)h+='<div class="tier">現在沒有買得起的，多賣一點硬幣再來。</div>';
  list.forEach(t=>{const d=depth[t.id];if(techLane!=='★'&&d!==last){h+='<div class="tier">'+(d===d0?'一開始就能買':'第 '+(d-d0+1)+' 層')+'</div>';last=d}
    const s=techState(t),st=s.price!=null?'<span class="pr'+(G.money<s.price?' no':'')+'">'+money(s.price)+'</span>':s.cls==='lock'?'🔒 先解鎖「'+TECHD[t.req].name+'」':s.a;
    h+='<div class="tc '+s.cls+(t.id===techSel?' sel':'')+'" data-tech="'+t.id+'"><b>'+t.icon+'</b><div style="min-width:0;flex:1"><div class="n">'+t.name+'</div><div class="s"><span>'+st+'</span><span>'+(t.max>1?s.b:'')+'</span></div></div>'+(canBuy(t)?'<span class="ok"></span>':'')+'</div>'});
  tr.innerHTML=h+'</div>';tr.querySelector('.tmG').scrollTop=sg;tr.querySelector('.tmL').scrollTop=sl}
function techOwned(t){if(!t)return true;if(t.shop)return!!G.tools[t.shop];if(t.auto)return true;return lv(t.id)>0}
function techBuy(t){const s=techState(t);if(t.shop||t.auto||s.cls==='lock'||s.price==null)return;if(G.money<s.price){toast('錢不夠');return}G.money-=s.price;G.ups[t.id]=lv(t.id)+1;tone(1000,.12);buzz(25);if(t.id==='expand'){buildWorld();shadowDirty=true;toast('院子往西邊擴建了 5 公尺','gold')}drawPrice();showTool();renderPanel()}
function renderTech(){
  $('techCash').textContent='可用：'+money(G.money);
  if(TTON)renderTechM();else{
  const lanes=[...new Set(TECH.map(t=>t.lane))],depth={};
  const dep=t=>depth[t.id]!=null?depth[t.id]:(depth[t.id]=t.req?dep(TECHD[t.req])+1:0);TECH.forEach(dep);
  let html='<div id="techAxis">'+[0,1,2,3,4].map(k=>'<span style="left:'+(170+k*200+60)+'px">'+(k?k+'分':'開始')+'</span>').join('')+'</div>',y=36,pos={},lines='';
  lanes.forEach(l=>{
    const ts=TECH.filter(t=>t.lane===l),cols={};ts.forEach(t=>{(cols[depth[t.id]]=cols[depth[t.id]]||[]).push(t)});
    const rows=Math.max(...Object.values(cols).map(a=>a.length)),h=rows*78+20,own=ts.filter(techOwned).length,buy=ts.filter(t=>{const s=techState(t);return s.price!=null&&G.money>=s.price}).length;
    html+='<div class="lane" style="top:'+y+'px;height:'+h+'px"><div class="lh">'+l+'<small>已解鎖'+own+'個，共'+ts.length+'個'+(buy?'・'+buy+'個可買':'')+'</small></div></div>';
    Object.entries(cols).forEach(([d,a])=>a.forEach((t,i)=>{const x=170+d*200,yy=y+12+i*78;pos[t.id]={x,y:yy};const s=techState(t);
      html+='<div class="tn '+s.cls+(t.id===techSel?' sel':'')+'" data-tech="'+t.id+'" style="left:'+x+'px;top:'+yy+'px"><div class="ti">'+t.icon+'</div><div class="c">'+t.lane+'</div><div class="n">'+t.name+'</div><div class="s"><span>'+(s.price!=null?'<span class="pr">'+money(s.price)+'</span>':s.a)+'</span><span>'+s.b+'</span></div></div>'}));
    y+=h;
  });
  TECH.forEach(t=>{if(t.req&&pos[t.req]){const a=pos[t.req],b=pos[t.id],x1=a.x+170,y1=a.y+33,x2=b.x,y2=b.y+33,mx=(x1+x2)/2;lines+='<path d="M'+x1+' '+y1+' H'+mx+' V'+y2+' H'+x2+'" stroke="'+(techOwned(TECHD[t.req])?'#c9a03a':'#555')+'" stroke-width="2" fill="none"/>'}});
  const W=Math.max(1300,...Object.values(pos).map(q=>q.x+200));
  $('techTree').innerHTML=html+'<svg id="techLines" width="'+W+'" height="'+y+'">'+lines+'</svg>';}
  const t=TECHD[techSel],s=techState(t);
  $('techInfo').innerHTML='<div class="c">'+t.lane+'</div><h2>'+t.icon+' '+t.name+'</h2><div class="st">'+(s.cls==='own'?'解鎖・已擁有':s.cls==='lock'?'已鎖定：要先解鎖「'+TECHD[t.req].name+'」':t.shop?'解鎖・五金行有賣':lv(t.id)?'解鎖・已擁有':'解鎖・還沒買')+(t.max>1?'　等級 '+lv(t.id)+'/'+t.max:'')+'</div><p>'+t.desc+'</p>'+
    (s.price!=null&&s.cls!=='lock'?'<button class="btn gold" data-techbuy="'+t.id+'" '+(G.money<s.price?'disabled':'')+'>'+(lv(t.id)?'升級':'解鎖')+' '+money(s.price)+'</button>':'');
}
function renderPanel(){
  const cash=money(G.money);
  if(panel==='shopPanel'){
    $('shopCash').textContent=cash;
    $('shopList').innerHTML=TOOLS.filter(t=>t.price).map(t=>{const own=G.tools[t.id],lk=t.lock&&!lv(t.lock);
      return '<div class="row2'+(lk?' lock':'')+'"><div class="ic">'+t.icon+'</div><div class="tx"><div class="nm">'+t.name+'</div><div class="ds">'+t.desc+'</div></div><div class="own">'+(own?'你有1個':'')+'</div><div class="pr">'+money(t.price)+'</div>'+
      '<button class="ob" data-to="'+t.id+'" '+(own&&G.tool!==t.id?'':'disabled')+'>⤓ 送到我這</button><button class="ob" data-sell="'+t.id+'" '+(own?'':'disabled')+'>$ 賣出</button><button class="ob" data-buy="'+t.id+'" '+(!own&&!lk&&G.money>=t.price?'':'disabled')+'>'+(lk?'🔒 已鎖定':'🛒 購買')+'</button></div>'}).join('');
  }
  if(panel==='techPanel')renderTech();
  if(panel==='cfgPanel')renderCfg();
  if(panel==='statPanel')renderStats();
  if(panel==='ovPanel')renderOverview();
  if(panel==='buildPanel'){
    $('buildCash').textContent='可用：'+cash;
    $('buildCats').innerHTML=CATS.map(c=>'<div class="'+(c===buildCat?'on':'')+'" data-cat="'+c+'"><span>'+CATICON[c]+'</span>'+c+'</div>').join('');
    const q=$('buildSearch').value.trim();
    const favs=G.favs||[],srt=$('buildSort').value;
    const list=BUILD.filter(b=>(!b.gift||lv(b.req))&&(buildCat==='全部'||b.cat===buildCat||(buildCat==='已解鎖'&&(!b.req||lv(b.req)))||(buildCat==='已設快捷鍵'&&favs.includes(b.id)))&&(!q||b.name.includes(q)||b.desc.includes(q)));
    if(srt==='price')list.sort((x,y)=>buildCost(x.id)-buildCost(y.id));else if(srt==='name')list.sort((x,y)=>x.name.localeCompare(y.name,'zh-Hant'));else if(srt==='open')list.sort((x,y)=>(x.req&&!lv(x.req)?1:0)-(y.req&&!lv(y.req)?1:0));
    $('buildList').innerHTML=list.length?list.map(b=>{const lk=b.req&&!lv(b.req),c=buildCost(b.id);
      return '<div class="card'+(lk?' lock':'')+'" data-build="'+b.id+'" title="'+b.desc+'">'+(lk?'<span class="lk">🔒</span>':'')+(favs.includes(b.id)?'<span style="position:absolute;right:4px;top:2px;color:var(--gold)">★'+(favs.indexOf(b.id)+1)+'</span>':'')+'<div class="ic">'+b.icon+'</div><div class="nm">'+b.name+'</div><div class="pr">'+(c===0?'免費 x1':money(c)+(b.per?' 每公尺':''))+'</div></div>'}).join(''):'<div style="color:#888;padding:20px">這裡還沒有東西</div>';
  }
  if(panel==='boardPanel'){
    const o=ORDERS[G.order],nx=ORDERS[G.order+1];
    $('boardBd').innerHTML='<div class="hd3">Deliveries</div><div style="text-align:center"><span class="left">剩餘硬幣　'+fmt(G.left)+'</span></div><div class="ords">'+
      (o?'<div class="paper">訂單'+(G.order+1)+'/'+ORDERS.length+'<b>'+o.name+'</b>'+fmtS(Math.min(G.ordProg,o.n))+' / '+fmtS(o.n)+'<br>獎勵 '+money(o.rw)+'<br>'+ordTimeTxt()+'<br><button class="ob" data-pin style="margin-top:6px">'+(G.pinned?'取消釘選':'釘選這張訂單')+'</button></div>':'<div class="paper"><b>訂單都完成了</b></div>')+
      (G.special?'<div class="paper" style="border:2px solid #e8c23a"><b>★ 特別訂單</b>'+specialTxt()+(G.special.kind==='collector'?'<br><button class="ob" data-collector style="margin-top:6px" '+(G.coll[G.special.id]?'':'disabled')+'>交給收藏家</button>':'')+'</div>':'')+
      '<div class="paper"><b>清倉</b>把做好的東西全部賣掉<br><button class="ob" data-clear style="margin-top:6px">清倉</button></div>'+
      '<div class="paper"><b>下一批</b>'+(nx?nx.name+'<br>獎勵 '+money(nx.rw):'沒有了')+'</div></div>';
  }
  if(panel==='cabPanel')renderCab();
  if(panel==='mailPanel')renderMail();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-close],[data-buy],[data-sell],[data-to],[data-tech],[data-techbuy],[data-cat],[data-build],[data-pin],[data-clear],[data-cfg],[data-cfgline],[data-collector],[data-stab],[data-ovmark]');if(!b||!G)return;
  if(b.dataset.cfg||b.dataset.cfgline!==undefined){cfgClick(b);renderPanel();return}
  if(b.dataset.close!==undefined){closePanel();return}
  if(b.dataset.buy){const t=TOOL[b.dataset.buy];if(G.money>=t.price&&!G.tools[t.id]){G.money-=t.price;G.tools[t.id]=1;tone(1200,.15);if((t.id==='det'||t.id==='broom')?!G.carry:G.carry<=capOf(t.id))setTool(t.id);renderHotbar()}}
  if(b.dataset.sell){const id=b.dataset.sell;if(G.tool===id){if(G.carry>capOf('hand')){toast('先把手上的硬幣丟掉');return}G.tool='hand'}G.tools[id]=0;G.money+=TOOL[id].price*.5;renderHotbar()}
  if(b.dataset.to){const id=b.dataset.to;if(G.drop&&G.drop[id]){const fx=-Math.sin(pl.yaw),fz=-Math.cos(pl.yaw);Object.assign(G.drop[id],{x:pl.x+fx*.8,z:pl.z+fz*.8,y:standAt(pl.x,pl.z,pl.y+.5)});G.flags.delivered=true;toast(TOOL[id].name+'送到你腳邊了，按 E 撿起來')}else setTool(id)}
  if(b.dataset.tech){techSel=b.dataset.tech;const t=TECHD[techSel];if(e.detail>=2)techBuy(t)}
  if(b.dataset.techbuy){techBuy(TECHD[b.dataset.techbuy])}
  if(b.dataset.cat){buildCat=b.dataset.cat}
  if(b.dataset.build){const it=BIT[b.dataset.build];if(it.req&&!lv(it.req)){techSel=it.req;openPanel('techPanel');return}G.build={item:it.id,dir:G.build?G.build.dir:0,remove:false,lvl:G.lastLvl||0};beltStart=null;closePanel();$('buildHint').classList.remove('hidden');renderHotbar();return}
  if(b.dataset.pin!==undefined){G.pinned=!G.pinned;drawBoard()}
  if(b.dataset.collector!==undefined&&G.special&&G.special.kind==='collector'&&G.coll[G.special.id]){const id=G.special.id;G.coll[id]--;if(!G.coll[id])delete G.coll[id];finishSpecial();drawPrice()}
  if(b.dataset.stab){statTab=b.dataset.stab}
  if(b.dataset.ovmark){ovMark=cellAt(b.dataset.ovmark);ovMarkT=20;closePanel();toast('黃色箭頭標出那台機器的位置了');return}
  if(b.dataset.clear!==undefined){let n=0,v=0;items=items.filter(it=>{if(!it.belt&&it.prod){v+=prodValue(it);n++;return false}return true});if(n){addMoney(v,true);toast('清倉賣掉 '+n+' 個加工品')}else toast('地上現在沒有做好的東西')}
  renderPanel();
});
$('buildSearch').addEventListener('input',renderPanel);$('buildSort').addEventListener('change',renderPanel);
// 右鍵：把建築加到快捷欄（最多 9 個，Shift+數字或滾輪選）
$('buildList').addEventListener('contextmenu',e=>{e.preventDefault();const c=e.target.closest('[data-build]');if(!c||!G)return;toggleFav(c.dataset.build)});
function toggleFav(id){G.favs=G.favs||[];const k=G.favs.indexOf(id);if(k>=0){G.favs.splice(k,1);toast('從快捷欄拿掉「'+BIT[id].name+'」')}else if(G.favs.length<9){G.favs.push(id);toast('加到快捷欄：'+BIT[id].name)}else{toast('快捷欄最多 9 個建築');return}renderPanel();renderHotbar()}
$('buildList').addEventListener('mouseover',e=>{const c=e.target.closest('[data-build]');if(!c)return;const b=BIT[c.dataset.build];$('buildFoot').textContent=b.req&&!lv(b.req)?b.name+'要用「'+TECHD[b.req].name+'」解鎖，點一下到科技樹查看。':b.desc})

