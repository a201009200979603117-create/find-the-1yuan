// ================= HUD =================
function toast(msg,cls){msg=TT(msg);const box=$('toasts');for(const o of box.children)if(o.textContent===msg){o.style.animation='none';void o.offsetWidth;o.style.animation='';clearTimeout(o._t);o._t=setTimeout(()=>o.remove(),3200);return}
  const e=document.createElement('div');e.textContent=msg;if(cls)e.className=cls;box.appendChild(e);e._t=setTimeout(()=>e.remove(),3200);while(box.children.length>4)box.firstChild.remove()}
function mouseSvg(right,h=40){return '<svg viewBox="0 0 26 38" width="'+(h*.68)+'" height="'+h+'"><rect x="1.5" y="1.5" width="23" height="35" rx="11.5" fill="#fff" stroke="#222" stroke-width="2"/><path d="M13 1.5v14M1.5 15.5h23" stroke="#222" stroke-width="2"/><path d="'+(right?'M23.5 14.5a11 11 0 0 0-9.5-12v12z':'M2.5 14.5a11 11 0 0 1 9.5-12v12z')+'" fill="#e33"/></svg>'}
function setPrompt(k,l,s){const p=$('prompt');if(!l){p.classList.add('hidden');return}p.classList.remove('hidden');const K=$('pKey');K.style.display=k?'':'none';if(TTON&&k){K.className='key tkp';K.textContent=TKEY[k]||k}else if(k==='LMB'||k==='RMB'){K.className='key mouse';K.innerHTML=mouseSvg(k==='RMB')}else{K.className='key';K.textContent=k}$('pLbl').textContent=l;$('pSub').textContent=s||''}
function renderHotbar(){
  $('hotbar').innerHTML=TOOLS.filter(t=>toolOwned(t.id)).map(t=>'<div class="hb'+(G.tool===t.id&&!G.build?' on':'')+'"><span class="k">'+t.key+'</span>'+t.icon+'</div>').join('')+
    (G.favs||[]).map((id,k)=>'<div class="hb'+(G.build&&G.build.item===id?' on':'')+'" style="border-color:#c9a03a66"><span class="k">⇧'+(k+1)+'</span>'+BIT[id].icon+'</div>').join('');
  $('hints').innerHTML=G.build?'<span><span class="kc">R</span>旋轉</span><span><span class="kc">X</span>拆除</span><span><span class="kc">G</span>方格</span><span><span class="kc">F</span>吸附</span><span>滾輪／<span class="kc">C</span><span class="kc">V</span>遠近</span><span><span class="kc">PgUp</span>架高</span><span><span class="kc">N</span>藍圖</span><span><span class="kc">Ctrl+Z</span>復原</span><span><span class="kc">B</span>離開</span>':
    '<span>'+mouseSvg(false,16)+' 撿</span><span>'+mouseSvg(true,16)+' 丟</span><span><span class="kc">E</span>互動</span><span><span class="kc">Q</span>收起</span><span><span class="kc">C</span>蹲</span><span><span class="kc">Tab</span>科技樹</span><span><span class="kc">B</span>建造</span>';
  showTool();$('meter').classList.toggle('hidden',G.tool!=='det'&&G.tool!=='hscan');
}
function setTool(id){
  if(!toolOwned(id)||G.tool===id)return;
  const c=capOf(id);
  if((id==='det'||id==='broom'||id==='hscan')&&G.carry>0){toast('手上還有硬幣，先按右鍵丟掉');return}
  if(id!=='det'&&id!=='broom'&&id!=='hscan'&&G.carry>c){toast('手上有 '+G.carry+' 枚，'+TOOL[id].name+'裝不下，先丟掉一些');return}
  if(G.tool==='toy'&&id==='hand')G.flags.swapA=true;if(G.flags.swapA&&id==='toy')G.flags.swap=true;
  G.tool=id;renderHotbar();
}
let tipI=0,tipT=0,soldRecent=0,rateT=0,dispMoney=0,secT=0;
function updateHud(dt){
  tipT-=dt;if(tipT<=0){tipT=12;$('tipTxt').textContent=TIPS[tipI++%TIPS.length]}
  const c=capOf(G.tool);
  $('carry').textContent=c?G.carry+' / '+c:'';
  const arc=$('ringArc'),f=c?G.carry/c:0;arc.setAttribute('stroke-dasharray',(f*163.4).toFixed(1)+' 999');$('ring').style.display=c>=100?'block':'none';
  $('oneHand').textContent=(G.onesHand?'🟠 1 元 ×'+G.onesHand+'　':'')+(G.held&&G.held.length?'📦 '+G.held.map(h=>PROD[h.prod].name).join('、')+'（'+G.held.length+'/'+heldMax()+'）':'');
  dispMoney=Math.abs(G.money-dispMoney)<.01||Math.abs(G.money-dispMoney)>G.money*2+1000?G.money:dispMoney+(G.money-dispMoney)*.4;$('money').textContent=money(dispMoney);$('left').textContent='剩餘硬幣 '+fmt(G.left);
  rateT+=dt;if(rateT>=5){G.rate=G.rate*.6+G.rateAcc/rateT*60*.4;G.rateAcc=0;rateT=0}$('rate').textContent=money(G.rate||0)+'/min';
  if(G.beltAcc>=.5){const v=G.beltAcc;G.beltAcc=0;const f2=document.createElement('div');f2.className='float s';f2.textContent='+'+money(v);f2.style.top=130+Math.random()*30+'px';$('floats').appendChild(f2);setTimeout(()=>f2.remove(),1400)}
  const o=ORDERS[G.order],pin=$('pin');
  if(G.pinned&&o){pin.classList.remove('hidden');pin.innerHTML='訂單'+(G.order+1)+'/'+ORDERS.length+'<b>'+o.name+'</b>'+fmtS(Math.min(G.ordProg,o.n))+' / '+fmtS(o.n)+(o.t==='coin'?'枚':'個'+PROD[o.t].name)+'<br><small>'+ordTimeTxt()+'</small>'+(G.special?'<br><small style="color:#ffd76a">★ '+specialTxt()+'</small>':'')}else if(G.special){pin.classList.remove('hidden');pin.innerHTML='<b>★ 特別訂單</b><small>'+specialTxt()+'</small>'}else pin.classList.add('hidden');
  $('stamI').style.width=Math.min(100,pl.stam/stamMax()*100)+'%';
  // 用電超過門檻的警示（原作 V8）
  let warn='';for(const t of tiles.values()){const n=t.net;if(n&&n.dem>0&&!n.off&&n.sup>0&&n.sup<n.dem){warn='⚡ 用電超過！用電 '+n.dem+'kW，供電只有 '+n.sup+'kW，機器會變慢';break}}
  if(!warn)for(const t of tiles.values())if(isGen(t)&&t.net&&t.net.dem>0&&!t.net.off&&!genOn(t)){warn='⚡ '+BIT[t.type].name+(t.fuel<=0?'沒燃料了':'沒有水');break}
  $('pwarn').textContent=warn;$('pwarn').classList.toggle('hidden',!warn);
  $('jet').classList.toggle('hidden',!lv('jetpack'));$('jetI').style.width=(pl.jet/10*100).toFixed(0)+'%';
  updateObjective();
  secT=(secT||0)+dt;if(secT>=1){secT=0;checkAch();recordStats();updateSpecial();checkChallenge();const np=machineProblems().length;$('warnN').classList.toggle('hidden',!np);$('warnN').textContent='⚠ '+np+' 台機器有狀況（按 O 看）'}
  if(gaugeNeedle){G.gauge=(G.gauge||0)*.8+soldRecent/dt*.2;soldRecent=0;gaugeNeedle.rotation.z=-(Math.min(G.gauge,50)/50*Math.PI*1.5-Math.PI*.75)}
  if(G.combo&&G.comboT<=0)G.combo=0;
  drawBoardT=(drawBoardT||0)+dt;if(drawBoardT>2){drawBoardT=0;drawBoard()}
}
let drawBoardT=0;
function orderAdd(t,n){if(t==='coin')specialAdd('coin',n);const o=ORDERS[G.order];if(!o||o.t!==t)return;G.ordProg+=n;if(G.ordProg>=o.n){const late=(G.ordT||0)>o.min*60,rw=late?o.rw/2:o.rw;addMoney(rw,true);toast(late?'訂單完成，但是遲交了：「'+o.name+'」只拿到一半獎勵 '+money(rw):'準時完成訂單！「'+o.name+'」獎勵 '+money(rw),'gold');chime();buzz([60,40,60]);G.order++;G.ordProg=0;G.ordT=0;drawBoard();if(t!=='coin'&&truck.g){truck.state='leave';tone(180,.5,'sawtooth',.05)}}}

