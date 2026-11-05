// ================= 互動 =================
function nearTile(tp,r){for(const t of tiles.values())if(t.type===tp&&Math.hypot(pl.x-t.gx-.5,pl.z-t.gz-.5)<r)return t;return null}
function machineInfo(t){
  const T=t.type;let s=t.status;
  if(isGen(t))s=(T==='gas'?'燃料 '+Math.ceil(t.fuel)+' / '+fuelCap(t)+' 秒（環保磚）・水 '+Math.round((t.wr||0)*100)+'%・':'燃料 '+Math.ceil(t.fuel)+' / '+fuelCap(t)+' 枚・')+(!genOn(t)?(t.fuel<=0?'沒燃料了':'沒有水'):'線路供電 '+(t.net?t.net.sup:GENS[T].kw())+'kW・用電 '+(t.net?t.net.dem:0)+'kW')+(t.off?'（關掉了）':'');
  if(!s){
    if(T==='pole'||T==='cbox')s=t.net&&t.net.sup?'線路 '+t.net.sup+'kW・用電 '+t.net.dem+'kW':'還沒接到發電機';
    else if(PROCS[T]){const P=PROCS[T];s=(P.inp?'裡面 '+t.buf+' 個'+PROD[P.inp].name+' / 要 '+P.need():'裡面 '+fmt(t.buf)+' 枚 / 要 '+P.need()+' 枚')+(P.inp2?'・'+PROD[P.inp2].name+' '+t.buf2+' / 要 '+P.need2():'')+(t.prog>0?'・做'+PROD[P.out].name+'中':'')+(BIT[T].water?'・水 '+Math.round((t.wr||0)*100)+'%':'')}
    else if(T==='silo')s='存著 '+fmt(t.store)+' / '+fmt(siloCap())+' 枚・每分鐘放 '+Math.min(t.lpm??10,siloTop())+' 批（每批 '+siloLoad()+' 枚）';
    else if(T==='pump')s='每秒抽 '+(t.pw>0?pumpRate()*t.pw:0).toFixed(1)+' 公升'+(t.wsup?'・水管上用水 '+t.wsup.dem+' 公升':'・還沒接水管');
    else if(SCANS.has(T))s='每分鐘 '+fmt(t.cap*60||0)+' 枚'+(T==='detector'?(t.bin?'・收著 '+t.bin+' 枚 1 元':''):'・抽屜 '+t.bin+' / '+drawerCap(t));
    else if(T==='drone')s=t.drop?'放料點 ('+t.drop.gx+','+t.drop.gz+')':'還沒設定放料點';
    else s='運作中'}
  if(needPower(t)&&t.pw>0&&t.pw<1)s+='・電不夠（'+Math.round(t.pw*100)+'%）';
  return s;
}
function interactions(dt){
  G.comboT=Math.max(0,G.comboT-dt);grabCd-=dt;
  if(G.build){setPrompt(null);return}
  const nearDoor=!G.doorOpen&&Math.hypot(pl.x,pl.z-H)<3.2;
  const nearShop=Math.hypot(pl.x-shopPos.x,pl.z-shopPos.z)<2.6;
  const nearBoard=Math.hypot(pl.x-boardPos.x,pl.z-boardPos.z)<2.6;
  const cab=nearTile('cabinet',2.2),mus=nearMuseum();
  const hop=G.carry>0&&aimHopper();
  const mt=machineLooked();
  if(mt&&BIT[mt.type])machineTip(mt.type);
  const hh=nearHatch(),pbh=paintHit(),sn=storyNear();
  if(pl.sit)setPrompt('E','站起來','坐在長椅上休息，體力回得比較快');
  else if(nearDoor)setPrompt('E','開門');
  else if(sn)setPrompt('E',sn.l,sn.s);
  else if(hh)setPrompt('E',pl.y<1.5?'爬上屋頂':'爬下梯子','屋頂天窗');
  else if(nearDropped())setPrompt('E','撿起'+TOOL[nearDropped()].name,TOOL[nearDropped()].cont?'裡面 '+fmt(G.drop[nearDropped()].fill)+' / '+fmt(capOf(nearDropped()))+' 枚':'');
  else if(G.carry>0&&aimDropped(7))setPrompt('RMB','丟進'+TOOL[aimDropped(7)].name,'裡面 '+fmt(G.drop[aimDropped(7)].fill)+' / '+fmt(capOf(aimDropped(7)))+' 枚');
  else if(nearCat())setPrompt('E','摸摸'+cat.coat.n,'來院子玩的貓');
  else if(nearBench())setPrompt('E','坐下休息','長椅');
  else if(pbh)setPrompt('LMB','畫畫','右鍵擦掉・油漆板');
  else if(hop)setPrompt('RMB','丟進收購站','手上 '+fmt(G.carry)+' 枚・每枚 $'+priceEach().toFixed(4));
  else if(mus&&!(cab&&G.onesHand))setPrompt('E','看一元博物館',musPrompt());
  else if(cab&&G.onesHand)setPrompt('E','把 1 元放進收藏櫃','手上有 '+G.onesHand+' 枚');
  else if(cab)setPrompt('E','打開一元收藏櫃');
  else if(nearShop)setPrompt('E','打開商店','五金行・工具');
  else if(nearBoard)setPrompt('E','看訂單','Deliveries');
  else if(hover&&hover.k==='one')setPrompt('LMB','撿起 1 元');
  else if(hover&&hover.k==='prod')setPrompt('LMB','撿起'+PROD[hover.e.prod].name,'手上 '+((G.held||[]).length)+' / '+heldMax()+' 個');
  else if(mt&&isGen(mt)&&G.carry>0&&!['det','broom','hscan'].includes(G.tool))setPrompt('RMB','丟進發電機當燃料',machineInfo(mt));
  else if(mt&&mt.type!=='cabinet'){const B=BIT[mt.type];
    if(SCANS.has(mt.type)&&mt.bin)setPrompt('E','拿出 1 元（'+mt.bin+' 枚）',B.name+'・'+machineInfo(mt));
    else if(mt.type==='drone')setPrompt('E','重新設定放料點',B.name+'・'+machineInfo(mt));
    else if(mt.type==='gate')setPrompt('E',mt.closed?'拉桿放行':'拉桿擋住',B.name);
    else if(cfgDef(mt))setPrompt('E','設定',B.name+'・'+machineInfo(mt));
    else if(mt.net&&mt.net.tiles.some(isGen))setPrompt('E',(mt.net.off?'打開':'關閉')+'整條線路',B.name+'・'+machineInfo(mt));
    else setPrompt('',B.name,machineInfo(mt))}
  else if(hover&&!['det','broom','vac','hscan'].includes(G.tool)&&G.carry<capOf(G.tool))setPrompt('LMB','拿一點硬幣','按住左鍵');
  else if(G.carry>0)setPrompt('RMB','丟硬幣','手上 '+fmt(G.carry)+' 枚');
  else if(G.held&&G.held.length)setPrompt('RMB','丟出'+PROD[G.held[G.held.length-1].prod].name,'按 E 放下');
  else if(lookBelt()){const lb2=lookBelt();setPrompt('E','按住 E 把輸送帶反過來',eHold>0?'轉向中… '+Math.round(eHold/.6*100)+'%':'每分鐘送 '+fmt(lb2.flow||0)+' 枚'+(lb2.jamT&&performance.now()-lb2.jamT<700?'・塞住了！':'')+'・中鍵複製')}
  else setPrompt(null);
  // 按住 E 把看著的輸送帶反過來
  const lb=lookBelt();if(lb&&keys.has('KeyE')&&!mt){eHold+=dt;if(eHold>=.6){reverseBelt(lb);eHold=-99}}else if(!keys.has('KeyE'))eHold=0;
  // 油漆板：看著它左鍵畫、右鍵擦
  const pb=(lmb||rmb)&&paintHit();if(pb){paintAt(pb,lmb);return}
  if(lmb&&grabCd<=0){
    if(G.tool==='broom'){sweep();grabCd=.5}
    else if(G.tool==='vac'){
      vacAcc+=TOOL.vac.rate*(1+.25*lv('suction'))*dt;
      while(vacAcc>=1){vacAcc-=1;if(G.carry>=capOf('vac'))break;const{o,d}=camRay(.22*(1+.2*lv('suction'))),h=pickRay(o,d,5);if(h){const r=takeCoins(o.x+d.x*h.t,o.y+d.y*h.t,o.z+d.z*h.t,12);G.carry+=r.n;if(r.ones)gotOne(r.ones,'吸塵器在硬幣裡');clink()}}
      if(Math.random()<dt*20)tone(140+Math.random()*30,.05,'sawtooth',.012);
    }
    else if(G.tool==='det'){ // 左鍵：關 → 開 →（有精準定位）精準 → 關
      if(!G.detOn){G.detOn=true;G.pinpoint=false;G.flags.detOn=true;toast('金屬探測器打開了')}else if(lv('pinpoint')&&!G.pinpoint){G.pinpoint=true;toast('精準模式：靠近 1 元時嗶得很快')}else{G.detOn=false;G.pinpoint=false;toast('金屬探測器關掉了')}
      tone(G.detOn?900:400,.06,'square',.03);grabCd=.4}
    else if(G.tool!=='det'&&G.tool!=='hscan'){grab();grabCd=G.tool==='hand'?.3:TOOL[G.tool].iv;if(G.tool==='bucket'&&G.carry>=capOf('bucket'))G.flags.bucketFull=true;showTool()}
  }
  if(rmb&&G.carry<=0&&G.held&&G.held.length&&grabCd<=0){throwHeld();grabCd=.35}
  const pr=TOOL[G.tool].pour;
  if(rmb&&G.carry>0&&pr){pourAcc+=pr*(1+.12*lv('pour'))*dt;const k=Math.floor(Math.min(G.carry,pourAcc));if(k>=Math.min(G.carry,30)){pourAcc-=k;throwCoins(k);G.thrown=(G.thrown||0)+1;showTool()}}
  else if(rmb&&G.carry>0&&grabCd<=0){throwCoins();G.thrown=(G.thrown||0)+1;grabCd=.25;showTool()}
  if(!rmb)pourAcc=0;
}
// 看著的輸送帶（按住 E 反過來、中鍵複製用）
function lookBelt(){const p=groundAim(4.5);if(!p)return null;const t=cellAt(tkey(Math.floor(p.x),Math.floor(p.z)));return t&&(t.type==='belt'||t.type==='beltC')?t:null}
let eHold=0;
function reverseBelt(t){t.dir=(t.dir+2)%4;t.mesh.rotation.y=-t.dir*Math.PI/2;G.flags.reversed=true;tone(600,.1,'square',.04);toast('輸送帶反過來了')}
// 中鍵：複製看著的建築，直接進建造模式
function copyBuilding(){const mt=machineLooked()||lookBelt();if(!mt||!BIT[mt.type])return;const b=BIT[mt.type];
  if(b.req&&!lv(b.req)){toast(b.name+'還沒解鎖');return}
  G.build={item:mt.type,dir:mt.dir,remove:false,lvl:mt.L||0};beltStart=null;G.flags.copied=true;$('buildHint').classList.remove('hidden');renderHotbar();toast('複製了「'+b.name+'」');tone(900,.05)}
const paintRay=new THREE.Raycaster();
function paintHit(){const{o,d}=camRay(0);paintRay.set(o,d);paintRay.far=3.2;
  for(const t of tiles.values())if(t.type==='paint'&&t.board){const h=paintRay.intersectObject(t.board)[0];if(h&&h.uv)return{t,uv:h.uv}}return null}
function paintAt(p,draw){const c=p.t.cv.getContext('2d'),x=(1-p.uv.x)*256,y=(1-p.uv.y)*160;c.fillStyle=draw?'#1d2b4a':'#f6f4ee';c.beginPath();c.arc(x,y,draw?3.5:9,0,7);c.fill();p.t.tex.needsUpdate=true;p.t.img=null}
function interactE(){
  if(pl.sit){standUp();return}
  if(storyUse())return;
  if(nearCat()){petCat();return}
  {const b=nearBench();if(b){sitBench(b);return}}
  const hh=nearHatch();if(hh){climbHatch(hh);return}
  const nd=nearDropped();if(nd){pickDropped(nd);return}
  if(!G.doorOpen&&Math.hypot(pl.x,pl.z-H)<3.2){G.doorOpen=true;tone(160,.6,'sawtooth',.04);return}
  const cab=nearTile('cabinet',2.2);
  if(nearMuseum()&&!(cab&&G.onesHand>0)){openPanel('cabPanel');return}
  if(cab&&G.onesHand>0){G.onesHand--;depositOne();return}
  if(cab){openPanel('cabPanel');return}
  if(Math.hypot(pl.x-shopPos.x,pl.z-shopPos.z)<2.6){openPanel('shopPanel');return}
  if(Math.hypot(pl.x-boardPos.x,pl.z-boardPos.z)<2.6){openPanel('boardPanel');return}
  const mt=machineLooked(),held=G.held&&G.held.length;
  if(!mt){if(held)putDownHeld();return}
  if(mt.type==='rake')G.flags.rakeSet=true;
  if(SCANS.has(mt.type)&&mt.bin){G.onesHand+=mt.bin;toast('拿出 '+mt.bin+' 枚 1 元，拿去一元收藏櫃放好','gold');mt.bin=0;mt.status='';tone(988,.15);return}
  if(mt.type==='drone'){G.build={item:'drone',dir:0,dropFor:mt};$('buildHint').classList.remove('hidden');renderHotbar();return}
  if(mt.type==='gate'){mt.closed=!mt.closed;setGate(mt);tone(mt.closed?300:600,.08,'square',.04);toast(mt.closed?'閘門關上了，硬幣會停在這裡':'閘門打開了');return}
  if(cfgDef(mt)){openCfg(mt);return}
  if(held){putDownHeld();return}
  if(mt.net)toggleLine(mt);
}
function rollType(){const tot=ONE_TYPES.reduce((s,t)=>s+1/t.w,0);let r=Math.random()*tot;for(const t of ONE_TYPES){r-=1/t.w;if(r<=0)return t}return ONE_TYPES[0]}
function depositOne(){
  let t=rollType();
  // 劇情：讀完陳師傅的信以後，下一枚就是那枚金色的一元
  if(G.story&&G.story.forceGold&&!G.coll.gold){t=ONE_TYPES.find(x=>x.id==='gold');G.story.forceGold=false}
  const isNew=!G.coll[t.id];G.coll[t.id]=(G.coll[t.id]||0)+1;G.onesFound++;
  if(!isNew)addMoney(10*t.w,true);drawPrice();
  (G.oneLog=G.oneLog||[]).push({t:Math.round(G.play),id:t.id});if(isNight())G.flags.nightOne=true;
  if(isNew)buzz([30,30,30]);startAppraise(t,isNew);
}
let cardFlip=false,cardType=null,cardNew=true;
function showCard(t,isNew){cardType=t;cardNew=isNew;cardFlip=false;renderCard();$('card').classList.remove('hidden');mode='card';unlock()}
function renderCard(){const t=cardType;$('cardIn').innerHTML=cardFlip?
  '<div class="hd2">'+t.name+'</div>'+coin3d(t,true,true)+'<div style="margin-top:8px;font-size:14px;line-height:1.9;color:#ddd">機率 1/'+t.w+'<br>加成：'+t.bo+'<br>收藏了 '+G.coll[t.id]+' 枚・總共找到 '+G.onesFound+' 枚<br><span style="color:#e9dcc0">'+(ONE_STORY[t.id]||[''])[0]+'</span>'+(ownerOf(t.id)?'<div class="own">「'+ownerOf(t.id)[1]+'」<br><small>'+ownerOf(t.id)[0]+'</small></div>':'')+'</div><div class="ft">E・翻回去　點一下關閉</div>':
  '<div class="hd2">'+(cardNew?'新的一元':'重複的一元')+'</div><div class="coin"'+(oneImgURL?' style="background:url('+oneImgURL+') center/cover;color:transparent"':'')+'>1</div><div class="en">'+t.en+'</div><div class="rt">機率1/'+t.w+'</div><div class="bo">'+(cardNew?t.bo:'賣給收藏家 +'+money(10*t.w))+'</div><div class="ft">E・翻過來看看　點一下關閉</div>'}
function closeCard(){$('card').classList.add('hidden');mode='play';lock()}
$('card').addEventListener('click',closeCard);

