// ================= 主迴圈 =================
let last=performance.now(),slowT=0;
// 每 2 秒看一次平均每幀幾毫秒：太慢就把解析度降一點，夠快再慢慢調回來
let perfAcc=0,perfN=0,perfT=0;
let fpsNow=0;
function perfWatch(ms){perfAcc+=ms;perfN++;perfT+=ms;if(perfT<2000)return;const avg=perfAcc/perfN;perfAcc=perfN=perfT=0;fpsNow=Math.round(1000/avg);
  if(SET.fps)$('fps').textContent=Math.round(1000/avg)+' FPS・'+avg.toFixed(1)+' ms'+(SET.res==='auto'?'・解析度 '+Math.round(dynScale*100)+'%':'');
  if(SET.res==='auto'&&mode==='play'){const o=dynScale,hi=SET.eco?40:24,lo=SET.eco?36:15;if(avg>hi&&dynScale>.55)dynScale=Math.max(.55,dynScale-.1);else if(avg<lo&&dynScale<1)dynScale=Math.min(1,dynScale+.05);if(o!==dynScale)renderer.setPixelRatio(basePR()*dynScale)}}
function frame(now){requestAnimationFrame(frame);if(SET.eco&&now-last<30)return;const ms=now-last,dt=Math.min(.05,ms/1000);last=now;
  try{tick(dt,now)}catch(e){logErr(e&&e.message||e,'tick',e&&e.stack)}perfWatch(ms)}
const clickPlayEl=$('clickPlay');
function tick(dt,now){
  clickPlayEl.classList.toggle('hidden',!(G&&mode==='play'&&!locked&&!panel&&!topV&&!TOUCH));
  updateMusic(dt);pollPad(dt);updateTouchUI();
  if(mode==='menu'){
    const a=now/16000;camera.position.set(Math.sin(a)*(H-3),2.4+Math.sin(a*.7)*.6,Math.cos(a)*(H-3)*.8+2);camera.lookAt(0,Rp*.45,0);
  }else if(mode==='intro'){
    // The Mountain：硬幣要倒一分鐘，鏡頭跟著慢慢繞
    const L=HFm?60:5;introT+=dt;const k=Math.min(1,introT/L),a=-2.3+k*1.6,r=H-3;
    camera.position.set(Math.sin(a)*r,HFm?6+k*30:2.2+k*1.2,Math.cos(a)*r);camera.lookAt(0,HFm?18*pourK:Rp*.4,0);
    updateHF(dt);
    if(introT>=L)beginPlay();
  }else if(G){
    if(mode==='photo'){updatePhoto(dt);updateAuto(dt);updateFlying(dt);processSell(dt)}
    if(mode==='play'){
      G.play+=dt;if(ORDERS[G.order])G.ordT=(G.ordT||0)+dt;
      if(topV)updateTop(dt);else{if(!panel&&locked)updatePlayer(dt);placeCam()}
      updateFlow(dt);updateOvMark(dt);autoBackup(dt);
      if(!panel){if(G.build){updateBuild();$('buildHint').classList.remove('hidden')}else{interactions(dt);detector(dt)}}
      updateAuto(dt);updateFlying(dt);processSell(dt);
      updateVM(dt);
      if(G.doorOpen&&doorOpenAmt<1){doorOpenAmt=Math.min(1,doorOpenAmt+dt*.6);door.position.y=1.35+doorOpenAmt*2.6;shadowDirty=true}
      if(G.left<=0&&!G.ended&&G.gmode==='endless')refillPile();
      if(G.left<=0&&!G.ended){G.ended=true;mode='end';unlock();$('endTxt').innerHTML='整堆硬幣都挖完了。<br>找到 <b>'+G.onesFound+'</b> 枚 1 元'+(G.onesLost?'，另外有 <b>'+G.onesLost+'</b> 枚被賣掉了':'')+'。<br>總共賺了 <b>'+money(G.earned)+'</b>，玩了 '+Math.floor(G.play/60)+' 分鐘。';$('endPanel').classList.remove('hidden')}
    }
    updateMovers(dt);updateHF(dt);if(mode==='play')updateHover();drawItems();drawBeacons();drawDropped();
    slowT-=dt;if(slowT<=0&&mode!=='intro'){updateHud(.15);slowT=.15}
    if(mode==='play')showTool();
  }
  updateEnv(dt);updateWeather(dt);updateVisitors(dt,now);updateParts(dt);updateLoops(dt);if(noPwr.size)bobNoPower(now);
  dirty.forEach((r,m)=>{const a=m.instanceMatrix;a.updateRange.offset=r[0]*16;a.updateRange.count=(r[1]-r[0]+1)*16;a.needsUpdate=true});dirty.clear();
  colorDirty.forEach(m=>{if(m.instanceColor)m.instanceColor.needsUpdate=true});colorDirty.clear();
  if(shadowDirty&&now-lastShadow>250){renderer.shadowMap.needsUpdate=true;shadowDirty=false;lastShadow=now}
  renderer.render(scene,camera);if(ultraOn())renderAO();renderVM();
}
let beepT=0;
// 手持硬幣掃描器：綠圈裡有 1 元的硬幣堆會被標出來
const scanRing=new THREE.Mesh(new THREE.RingGeometry(3.85,4,80),new THREE.MeshBasicMaterial({color:0x44ff66,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}));scanRing.rotation.x=-Math.PI/2;scanRing.visible=false;scene.add(scanRing);
const markMesh=new THREE.InstancedMesh(new THREE.ConeGeometry(.12,.3,10).rotateX(Math.PI),new THREE.MeshBasicMaterial({color:0xff3b30}),40);markMesh.frustumCulled=false;markMesh.count=0;scene.add(markMesh);
// 衛星天線標的紅色記號：一直留在硬幣堆上，直到那枚 1 元被挖出來
const dishMk=()=>lv('dish4BP')?4:lv('dish3BP')?3:lv('dish2BP')?2:1;
const beaconMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.04,.04,2.4,6),new THREE.MeshBasicMaterial({color:0xff3b30,transparent:true,opacity:.75}),200);beaconMesh.frustumCulled=false;beaconMesh.count=0;scene.add(beaconMesh);
const beaconTip=new THREE.InstancedMesh(new THREE.ConeGeometry(.22,.45,10).rotateX(Math.PI),new THREE.MeshBasicMaterial({color:0xff3b30}),200);beaconTip.frustumCulled=false;beaconTip.count=0;scene.add(beaconTip);
function drawBeacons(){
  if(!G||!G.marked){beaconMesh.count=beaconTip.count=0;return}
  G.marked=G.marked.filter(i=>anchors.has(i));let k=0;const tt=performance.now()/300;
  for(const i of G.marked){if(k>=200)break;const top=Math.max(py[i],HFm?hfAt(px[i],pz[i]):groundAt(px[i],pz[i]));
    _q.identity();_s.set(1,1,1);_p.set(px[i],top+1.2,pz[i]);_m.compose(_p,_q,_s);beaconMesh.setMatrixAt(k,_m);
    _p.set(px[i],top+.35+Math.sin(tt+k)*.12,pz[i]);_m.compose(_p,_q,_s);beaconTip.setMatrixAt(k,_m);k++}
  beaconMesh.count=beaconTip.count=k;beaconMesh.instanceMatrix.needsUpdate=beaconTip.instanceMatrix.needsUpdate=true;
}
function handScan(dt){
  scanRing.visible=G.tool==='hscan';markMesh.count=0;if(G.tool!=='hscan')return;
  scanRing.position.set(pl.x,pl.y+.03,pl.z);scanRing.material.opacity=.35+.25*Math.sin(performance.now()/200);
  let mk=0,heapOnes=0;
  for(const it of items){if(!it.ones||Math.hypot(it.x-pl.x,it.z-pl.z)>4)continue;heapOnes+=it.ones;if(mk<40){_p.set(it.x,it.y+.7+Math.sin(performance.now()/150)*.08,it.z);_q.identity();_s.set(1,1,1);_m.compose(_p,_q,_s);markMesh.setMatrixAt(mk++,_m)}}
  let best=1e9,bi=-1;for(const i of anchors){const dd=Math.hypot(px[i]-pl.x,pz[i]-pl.z);if(dd<best){best=dd;bi=i}}
  if(best<=4&&mk<40){_p.set(px[bi],py[bi]+.9,pz[bi]);_q.identity();_s.set(1.6,1.6,1.6);_m.compose(_p,_q,_s);markMesh.setMatrixAt(mk++,_m)}
  markMesh.count=mk;markMesh.instanceMatrix.needsUpdate=true;
  const s=best<=4?1:Math.max(0,1-(best-4)/8);
  detSig=s;$('meterFill').style.width=(s*100).toFixed(0)+'%';
  $('meterTxt').textContent='🟨 '+(heapOnes?'圈裡的硬幣堆有 '+heapOnes+' 枚 1 元！':best<=4?'圈裡的硬幣堆深處有 1 元（紅色記號）':anchors.size?'圈裡沒有 1 元，最近的在約 '+best.toFixed(1)+' 公尺外':'硬幣堆裡沒有 1 元了');
}
function detector(dt){
  handScan(dt);
  if(G.tool!=='det')return;
  detSig=0;
  if(!G.detOn){$('meterFill').style.width='0%';$('meterTxt').textContent='📡 金屬探測器關著，按左鍵打開';return}
  const{o,d}=camRay(0),h=pickRay(o,d,8),p=h?_v.set(o.x+d.x*h.t,o.y+d.y*h.t,o.z+d.z*h.t):_v.set(o.x+d.x*2,o.y+d.y*2,o.z+d.z*2);
  // 線圈：隔著硬幣堆只測得到很近，空曠的地方（地上、輸送帶上、托盤上的 1 元）測得遠
  const L=lv('coil'),pileR=1+.27*L,openR=5+2*L;let s=0,best=1e9;
  for(const i of anchors){const dd=Math.hypot(px[i]-p.x,py[i]-p.y,pz[i]-p.z);if(dd<pileR&&1-dd/pileR>s){s=1-dd/pileR;best=dd}}
  for(const e of oneObjs.concat(items.filter(e=>e.ones))){const dd=Math.hypot(e.x-p.x,(e.y||0)-p.y,e.z-p.z);if(dd<openR&&1-dd/openR>s){s=1-dd/openR;best=dd}}
  const none=!anchors.size&&!oneObjs.length&&!items.some(e=>e.ones);
  $('meterFill').style.width=(s*100).toFixed(0)+'%';
  $('meterTxt').textContent='📡 '+(G.pinpoint?'［精準］':'')+(none?'院子裡沒有 1 元了':s<=0?'沒有訊號（硬幣堆裡 '+pileR.toFixed(1)+' 公尺、空曠處 '+openR+' 公尺內才測得到）':s<.45?'有一點訊號':s<.8?'訊號變強了':'就在附近！')+(s>0?'（約 '+best.toFixed(1)+' 公尺）':'');
  beepT-=dt;if(s>0&&beepT<=0){tone(500+900*s,.06,'square',.03);beepT=G.pinpoint?.025+.5*Math.pow(1-s,2):.08+1.1*(1-s)}
}
function updateMovers(dt){
  for(const i of movers){
    if(st[i]===2){vy[i]-=9.8*dt;const ny=py[i]+vy[i]*dt,sup=supportY(i,px[i],pz[i],py[i]+.03);
      if(ny<=sup){py[i]=sup;st[i]=1;vy[i]=0;gAdd(i);movers.delete(i);if(!buried(i))show(i);reveal(px[i],pz[i],py[i])}else py[i]=ny;setInst(i)}
    else movers.delete(i);
  }
}
menuScene();showMenu('main');touchInit();if(TOUCH)applySet();
// 離線玩：存下遊戲和 three.js（只有網址是 http/https 才能用）
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
// 新版本提示：網頁版更新了就在上面跳一條，點一下先存檔再重新整理（主畫面 App 放在背景很久不會自己更新）
let verTag=null,verT=0;
function checkVer(){if(!/^https?:$/.test(location.protocol)||!navigator.onLine)return;verT=performance.now();
  fetch(location.pathname,{method:'HEAD',cache:'no-store'}).then(r=>{const v=r.ok&&(r.headers.get('etag')||r.headers.get('last-modified'));if(!v)return;if(verTag==null)verTag=v;else if(v!==verTag)$('upd').classList.remove('hidden')}).catch(()=>{})}
if(TTON)$('upd').textContent='🆕 有新版本・點這裡更新';
checkVer();setInterval(checkVer,20*60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&performance.now()-verT>60000)checkVer()});
$('upd').onclick=()=>{if(G&&slotIdx>=0)saveGame(true);location.reload()};
// 自我檢查（開發用）：網址加 ?selftest 會自動跑一遍主要功能，跑完把存檔還原
async function selfTest(){const sk=[SKEY,DKEY,BKEY,CHKEY],bk={};sk.forEach(k=>bk[k]=localStorage.getItem(k));const t0=performance.now(),out=[];
  const box=document.createElement('pre');box.id='selftest';box.style.cssText='position:fixed;left:8px;top:8px;z-index:99;max-height:90vh;overflow:auto;background:#000d;color:#ccc;font:12px/1.5 monospace;padding:10px;margin:0;pointer-events:none;white-space:pre-wrap;max-width:60vw';document.body.appendChild(box);
  const w=ms=>new Promise(r=>setTimeout(r,ms)),until=async(f,ms)=>{const e=performance.now()+ms;while(performance.now()<e){if(f())return true;await w(100)}return false},
    show=()=>box.textContent='自我檢查 '+(out.every(x=>x.ok)?'':'（有失敗）')+'\n'+out.map(x=>(x.ok?'✓ ':'✗ ')+x.n+(x.info?'　'+x.info:'')).join('\n'),
    // 回傳 true 算通過、字串是失敗原因、{skip} 是略過
    run=async(n,f)=>{let r;try{r=await f()}catch(e){r=String(e&&e.message||e)||'出錯了'}out.push({n,ok:r===true||!!(r&&r.skip),info:typeof r==='string'?r:r&&r.skip||''});show()},
    gf=giveFile,playing=()=>{if(mode==='intro')for(let i=0;i<20;i++)tick(.05,performance.now());return mode==='play'};let file=null;
  await run('一開始沒有錯誤',()=>ERRS.length?ERRS.map(e=>e.m).join('；'):true);
  await run('主選單',()=>!$('menu').classList.contains('hidden')&&document.querySelectorAll('#mainList .mi').length===6);
  await run('存檔碼壓縮再解開',async()=>{const o={G:{a:1,b:'一元'},size:'small',seed:1};return JSON.stringify(await unpackCode(await packCode(JSON.stringify(o))))===JSON.stringify(o)});
  await run('挑戰朋友連結',()=>{const v=vsParse('?x=1&vs=std.123456.754');return!!v&&v.size==='std'&&v.seed===123456&&v.t===754&&!vsParse('?vs=nope.1.2')});
  await run('連續天數',()=>{const d={},day=new Date();for(let i=1;i<=3;i++){day.setDate(day.getDate()-1);d[dailyKey(day)]=100}localStorage.setItem(DKEY,JSON.stringify(d));const a=dailyStreak();d[dailyKey()]=90;localStorage.setItem(DKEY,JSON.stringify(d));const b=dailyStreak();localStorage.removeItem(DKEY);return a===3&&b===4&&dailyStreak()===0||a+'、'+b});
  await run('每日挑戰種子固定',()=>dailySeed('2026-01-01')===dailySeed('2026-01-01')&&dailySeed('2026-01-01')!==dailySeed('2026-01-02'));
  writeSlots([null,null,null]);
  await run('開新局（小）',async()=>{startGame(0,{name:'自我檢查',size:'small',seed:12345,gmode:'challenge'});return await until(playing,30000)||'等不到遊戲開始：'+mode});
  await run('8 枚 1 元',()=>anchors.size===8||String(anchors.size));
  await run('同一個種子，硬幣堆一樣',()=>{const a=[...anchors].join();generate(12345,'small',null);return[...anchors].join()===a});
  await run('存檔',()=>{saveGame(true);const s=loadSlots()[0];return!!(s&&s.G&&s.name==='自我檢查')});
  await run('回主選單再讀檔',async()=>{toMenu();await w(800);startGame(0,loadSlots()[0]);return await until(()=>playing()&&G&&G.name==='自我檢查',30000)||'讀檔失敗'});
  if(TTON)await run('觸控按鍵',async()=>await until(()=>!$('touchUI').classList.contains('hidden'),3000)&&document.querySelectorAll('#touchUI [data-t]').length>=15||'觸控按鍵沒出現');
  await run('打開每個面板',async()=>{for(const p of['techPanel','buildPanel','shopPanel','boardPanel','cabPanel','statPanel']){openPanel(p);await w(150);if($(p).classList.contains('hidden'))return p+' 沒打開';closePanel();await w(80)}return true});
  await run('買科技',()=>{G.money=1e7;const t=Object.values(TECHD).find(t=>{const x=techState(t);return!t.shop&&!t.auto&&x.cls!=='lock'&&x.price!=null});if(!t)return'找不到能買的';const l=lv(t.id);techBuy(t);return lv(t.id)===l+1});
  await run('裝飾品和長椅',()=>{const made=[];let gx=Math.floor(-H+2);const gz=Math.floor(H-3);
    for(const tp of['plant','flowers','bench','lantern','luckycat']){const t=addTile(tp,gx,gz,0,0);if(!t||!t.mesh)return tp+' 蓋不起來';made.push(t);gx+=3}
    const b=made[2];pl.x=fpCenter('bench',b.gx,b.gz,0).x;pl.z=b.gz-.4;pl.y=0;const nb=nearBench()===b;sitBench(b);updatePlayer(.1);const sat=!!pl.sit;keys.add('KeyW');updatePlayer(.05);keys.delete('KeyW');const up=!pl.sit;
    made.forEach(removeTile);return nb&&sat&&up||'靠近 '+nb+'、坐下 '+sat+'、站起來 '+up});
  await run('來訪的貓',()=>{removeCat();G.catNext=0;updateCat(.1,performance.now());if(!cat)return'貓沒出現';const now=performance.now();for(let i=0;i<80;i++)updateCat(.1,now+i*100);
    const p=cat.g.position;pl.x=p.x+.6;pl.z=p.z;pl.y=p.y;if(!nearCat())return'靠不近';const n=G.catPets||0;petCat();const pet=G.catPets===n+1;cat.stay=0;for(let i=0;i<600&&cat;i++)updateCat(.1,now+i*100);return pet&&!cat||'貓沒離開'});
  await run('流星',()=>{if(SET.daynight===false)return{skip:'日夜循環關掉了，略過'};const tod=G.tod;G.tod=23;meteorT=0;updateMeteor(.1);const ok=!!meteor;for(let i=0;i<30;i++)updateMeteor(.1);G.tod=tod;return ok&&!meteor||'流星沒出現或沒消失'});
  await run('彩虹',()=>{if(G.wx)G.wx.rain=0;rainbowG=G;rainbowT=100;updateRainbow(20);const ok=rainbow&&rainbow.visible&&rainbow.material.uniforms.op.value>.5;rainbowT=0;updateRainbow(.1);return ok&&!rainbow.visible||'彩虹沒出現'});
  await run('極高畫質',()=>{if(TTON)return{skip:'手機不提供，略過'};const u=SET.ultra,gl=renderer.getContext();SET.ultra=true;gl.getError();renderer.render(scene,camera);renderAO();renderVM();const e=gl.getError();
    const px=new Uint8Array(4);renderer.readRenderTargetPixels(aoRT3,aoRT3.width>>1,aoRT3.height>>1,1,1,px);SET.ultra=u;return e===0&&px[0]>20||'WebGL 錯誤 '+e+'、遮蔽值 '+px[0]});
  giveFile=f=>{file=f};
  await run('成績分享圖',()=>{file=null;shareScore('自我檢查');return!!(file&&file.type==='image/png'&&file.size>5000)||'沒產生圖片'});
  await run('拍照',()=>{file=null;enterPhoto();savePhoto();exitPhoto();return!!(file&&file.size>5000)||'沒產生照片'});
  giveFile=gf;
  await run('匯入存檔',()=>{importData(JSON.parse(JSON.stringify(loadSlots()[0])));return!!loadSlots()[1]});
  await run('挑戰完成',()=>{anchors.clear();G.onesHand=0;checkChallenge();const ok=$('dlgT').textContent===L('挑戰成功！')&&G.chalDone;$('dialog').classList.add('hidden');return ok});
  // 用假的時間跑主迴圈：60Hz 和 120Hz 的螢幕，省電模式都應該剛好每秒 30 格
  await run('省電模式每秒 30 格',()=>{const raf=window.requestAnimationFrame,tk=tick,e0=SET.eco;let n=0,t=last;window.requestAnimationFrame=()=>0;tick=()=>{n++};
    const sim=(hz,eco)=>{SET.eco=eco;n=0;for(let i=0;i<hz;i++){t+=1000/hz;frame(t)}return n};
    const r=[sim(60,true),sim(120,true),sim(60,false)];SET.eco=e0;tick=tk;window.requestAnimationFrame=raf;last=performance.now();
    return r[0]===30&&r[1]===30&&r[2]===60||'60Hz 省電 '+r[0]+' 格、120Hz 省電 '+r[1]+' 格、一般 '+r[2]+' 格'});
  await run('線上排行榜（只讀）',async()=>{if(!onlineOn())return{skip:'還沒設定 Supabase，略過'};const r=await onlineTop(dailyKey(),1);return Array.isArray(r)||'讀不到排行榜'});
  await run('回主選單',async()=>{toMenu();await w(800);return mode==='menu'});
  await run('最後沒有錯誤',()=>ERRS.length?ERRS.map(e=>e.m+'（'+e.at+'）').join('；'):true);
  sk.forEach(k=>bk[k]==null?localStorage.removeItem(k):localStorage.setItem(k,bk[k]));showMenu('main');
  const pass=out.every(x=>x.ok);out.push({n:'花了 '+((performance.now()-t0)/1000).toFixed(1)+' 秒，存檔已還原',ok:pass});show();box.style.color=pass?'#9f9':'#f99';window.__selftest={pass,out}}
if(/[?&]selftest\b/.test(location.search))setTimeout(selfTest,500);
{const v=vsParse(location.search);if(v){history.replaceState(null,'',location.pathname);const ask=()=>$('dialog').classList.contains('hidden')&&mode==='menu'?acceptVs(v):setTimeout(ask,300);setTimeout(ask,300)}}
window.__booted=true;$('loading').classList.add('hidden');
linColors(scene);scene.fog.color.convertSRGBToLinear();scene.background.convertSRGBToLinear();
window.__g={get G(){return G},get pl(){return pl},get tiles(){return tiles},get items(){return items},get oneObjs(){return oneObjs},get anchors(){return anchors},
  st:()=>({M,Rp,H,mode,panel,locked,hover:hover&&hover.k,vis:mcount.reduce((a,b)=>a+b,0),power}),
  step:(n,dt=.05)=>{for(let k=0;k<n;k++){last=performance.now();tick(dt,last)}},
  addTile,startGame,openPanel,closePanel,setTool,takeCoins,depositOne,interactE,techBuy:id=>techBuy(TECHD[id]),
  forceOne:()=>{const i=[...anchors][0];return i},
  fns:{capOf,scoopOf,buildCost,priceEach,beltSpeed,drawerCap,machineInfo,sellHand,feedGen,rakeAmt,genCap,genKW,spanR,dropR,rebuildPower,bonus,groupCount,droneRange,buildClick,interactions,throwCoins,addPipe,get pipes(){return pipes},addStruct,structPlan,standAt,blockedMove,nearHatch,get structs(){return structs},setAim:a=>{aimTile=a},updateBuild,get sellQ(){return sellQ},get power(){return power}}};
requestAnimationFrame(frame);
