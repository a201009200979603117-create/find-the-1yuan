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
    const a=now/16000;camera.position.set(Math.sin(a)*(H-5),2.4+Math.sin(a*.7)*.6,Math.cos(a)*(H-3)*.8+2);camera.lookAt(0,Rp*.45,0);
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
      // 劇情：挖完以後先等鐵盒和一元展，再出現結束畫面（或無盡模式再倒一車）
      if(G.left<=0&&!G.ended&&!storyHold()){if(G.gmode==='endless')refillPile();
        else{G.ended=true;mode='end';unlock();$('endTxt').innerHTML='整堆硬幣都挖完了。<br>找到 <b>'+G.onesFound+'</b> 枚 1 元'+(G.onesLost?'，另外有 <b>'+G.onesLost+'</b> 枚被賣掉了':'')+'。<br>總共賺了 <b>'+money(G.earned)+'</b>，玩了 '+Math.floor(G.play/60)+' 分鐘。'+(G.story&&G.story.festDone?'<br><span style="color:var(--gold)">《第一枚一元》的故事，謝謝你看到最後。</span>':'');$('endPanel').classList.remove('hidden')}}
    }
    storyTick(dt,now);storyWorld(dt,now);seasonTick(dt,now);
    updateMovers(dt);updateHF(dt);if(mode==='play')updateHover();drawItems();drawBeacons();drawDropped();
    slowT-=dt;if(slowT<=0&&mode!=='intro'){updateHud(.15);updMailHud();slowT=.15}
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
    if(st[i]===3)slideStep(i,dt); // 沿著坡滑（硬幣滑落）
    else if(st[i]===2){vy[i]-=9.8*dt;const ny=py[i]+vy[i]*dt,sup=supportY(i,px[i],pz[i],py[i]+.03);
      if(ny<=sup){py[i]=sup;st[i]=1;vy[i]=0;gAdd(i);movers.delete(i);if(!buried(i))show(i);reveal(px[i],pz[i],py[i]);if(slid&&slid[i])slideLand(i);else if(slid)slideAdd(i,1)}else py[i]=ny;setInst(i)}
    else movers.delete(i);
  }
  slideTick();
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
async function selfTest(){setMute(true);const sk=[SKEY,DKEY,BKEY,CHKEY],bk={};sk.forEach(k=>bk[k]=localStorage.getItem(k));const t0=performance.now(),out=[];ALB_DB='fty1-album-selftest';albDB=null;
  const box=document.createElement('pre');box.id='selftest';box.style.cssText='position:fixed;left:8px;top:8px;z-index:99;max-height:90vh;overflow:auto;background:#000d;color:#ccc;font:12px/1.5 monospace;padding:10px;margin:0;pointer-events:none;white-space:pre-wrap;max-width:60vw';document.body.appendChild(box);
  const w=ms=>new Promise(r=>setTimeout(r,ms)),until=async(f,ms)=>{const e=performance.now()+ms;while(performance.now()<e){if(f())return true;await w(100)}return false},
    show=()=>box.textContent='自我檢查 '+(out.every(x=>x.ok)?'':'（有失敗）')+'\n'+out.map(x=>(x.ok?'✓ ':'✗ ')+x.n+(x.info?'　'+x.info:'')).join('\n'),
    // 回傳 true 算通過、字串是失敗原因、{skip} 是略過
    run=async(n,f)=>{let r;try{r=await f()}catch(e){r=String(e&&e.message||e)||'出錯了'}out.push({n,ok:r===true||!!(r&&r.skip),info:typeof r==='string'?r:r&&r.skip||''});show()},
    gf=giveFile,playing=()=>{if(mode==='intro')for(let i=0;i<20;i++)tick(.05,performance.now());return mode==='play'};let file=null;
  await run('一開始沒有錯誤',()=>ERRS.length?ERRS.map(e=>e.m).join('；'):true);
  await run('主選單',()=>!$('menu').classList.contains('hidden')&&document.querySelectorAll('#mainList .mi').length===7);
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
  if(TTON)await run('觸控按鍵',async()=>await until(()=>{updateTouchUI();return!$('touchUI').classList.contains('hidden')},3000)&&document.querySelectorAll('#touchUI [data-t]').length>=15||'觸控按鍵沒出現');
  await run('打開每個面板',async()=>{for(const p of['techPanel','buildPanel','shopPanel','boardPanel','cabPanel','statPanel']){openPanel(p);await w(150);if($(p).classList.contains('hidden'))return p+' 沒打開';closePanel();await w(80)}return true});
  await run('買科技',()=>{G.money=1e7;const t=Object.values(TECHD).find(t=>{const x=techState(t);return!t.shop&&!t.auto&&x.cls!=='lock'&&x.price!=null});if(!t)return'找不到能買的';const l=lv(t.id);techBuy(t);return lv(t.id)===l+1});
  await run('裝飾品和長椅',()=>{const made=[];let gx=Math.floor(-H+2);const gz=Math.floor(H-3);
    for(const tp of['plant','flowers','bench','lantern','luckycat']){const t=addTile(tp,gx,gz,0,0);if(!t||!t.mesh)return tp+' 蓋不起來';made.push(t);gx+=3}
    const b=made[2];pl.x=fpCenter('bench',b.gx,b.gz,0).x;pl.z=b.gz-.4;pl.y=0;const nb=nearBench()===b;sitBench(b);updatePlayer(.1);const sat=!!pl.sit;keys.add('KeyW');updatePlayer(.05);keys.delete('KeyW');const up=!pl.sit;
    made.forEach(removeTile);return nb&&sat&&up||'靠近 '+nb+'、坐下 '+sat+'、站起來 '+up});
  await run('硬幣滑落',()=>{const visL=[];for(let i=0;i<M;i++)if(st[i]===1&&vis[i])visL.push(i);if(!visL.length)return'沒有硬幣';let calm=0;for(let k=0;k<400;k++)if(slideDir(visL[Math.floor(Math.random()*visL.length)]))calm++;
    const P={x:Rp*.42,z:.3},far=()=>groundAt(P.x-2.2,P.z),f0=far(),n0=slideN;for(let pass=0;pass<12;pass++)for(let i=0;i<M;i++){if(st[i]===0||anchors.has(i))continue;if(Math.hypot(px[i]-P.x,pz[i]-P.z)<.8&&py[i]>.3)removeInst(i)}
    const hole=groundAt(P.x,P.z);for(let f=0;f<900&&(slideQ.size||movers.size);f++)updateMovers(1/60);let moving=0;for(let i=0;i<M;i++)if(st[i]>=2)moving++;
    const slid=slideN-n0,refill=groundAt(P.x,P.z)-hole,keep=Math.abs(far()-f0)<.08;
    return calm<=4&&slid>=5&&!moving&&!slideQ.size&&refill>.2&&keep||['沒挖過會滑 '+calm+'/400','滑了 '+slid,'還在動 '+moving,'填回 '+refill.toFixed(2),'遠處不變 '+keep].join('、')});
  await run('來訪的貓',()=>{removeCat();G.catNext=0;updateCat(.1,performance.now());if(!cat)return'貓沒出現';const now=performance.now();for(let i=0;i<80;i++)updateCat(.1,now+i*100);
    const p=cat.g.position;pl.x=p.x+.6;pl.z=p.z;pl.y=p.y;if(!nearCat())return'靠不近';const n=G.catPets||0;petCat();const pet=G.catPets===n+1;cat.stay=0;for(let i=0;i<600&&cat;i++)updateCat(.1,now+i*100);return pet&&!cat||'貓沒離開'});
  await run('流星',()=>{if(SET.daynight===false)return{skip:'日夜循環關掉了，略過'};const tod=G.tod;G.tod=23;meteorT=0;updateMeteor(.1);const ok=!!meteor;for(let i=0;i<30;i++)updateMeteor(.1);G.tod=tod;return ok&&!meteor||'流星沒出現或沒消失'});
  await run('彩虹',()=>{if(G.wx)G.wx.rain=0;rainbowG=G;rainbowT=100;updateRainbow(20);const ok=rainbow&&rainbow.visible&&rainbow.material.uniforms.op.value>.5;rainbowT=0;updateRainbow(.1);return ok&&!rainbow.visible||'彩虹沒出現'});
  await run('極高畫質',()=>{if(TTON)return{skip:'手機不提供，略過'};const u=SET.ultra,gl=renderer.getContext();SET.ultra=true;gl.getError();renderer.render(scene,camera);renderAO();renderVM();const e=gl.getError();
    const px=new Uint8Array(4);renderer.readRenderTargetPixels(aoRT3,aoRT3.width>>1,aoRT3.height>>1,1,1,px);SET.ultra=u;return e===0&&px[0]>20||'WebGL 錯誤 '+e+'、遮蔽值 '+px[0]});
  giveFile=f=>{file=f};
  await run('成績分享圖',()=>{file=null;shareScore('自我檢查');return!!(file&&file.type==='image/png'&&file.size>5000)||'沒產生圖片'});
  await run('拍照',()=>{file=null;enterPhoto();savePhoto();exitPhoto();return!!(file&&file.size>5000)||'沒產生照片'});
  await run('拍照濾鏡和時間',()=>{file=null;const tod=G.tod;enterPhoto();photoNextFx();photoNextFx();photoNextFx();const fx=PHOTO_FX[photoFx].n,css=cv.style.filter;if(SET.daynight!==false)photoNextTod();const t1=G.tod;savePhoto();exitPhoto();
    const m=photoMat(2).A,gray=Math.abs(m[0]-m[3])<1e-6&&Math.abs(m[1]-m[4])<1e-6;return fx==='復古'&&/sepia/.test(css)&&!!file&&file.size>5000&&G.tod===tod&&cv.style.filter===''&&gray&&(SET.daynight===false||t1===8.5)||[fx,css,G.tod,tod,t1].join('、')});
  await run('相簿',async()=>{let n=0;for(let i=0;i<30&&n<2;i++){await w(200);try{n=await albCount()}catch(e){return'打不開相簿：'+e}}await openAlbum();const g=document.querySelectorAll('#alGrid .al-it').length;albSel=0;albShow();const big=!!$('alView').querySelector('img');closeAlbum();return n>=2&&g===n&&big||'相簿 '+n+' 張、畫面 '+g+' 張、大圖 '+big});
  giveFile=gf;
  await run('匯入存檔',()=>{importData(JSON.parse(JSON.stringify(loadSlots()[0])));return!!loadSlots()[1]});
  // 雲端存檔：用假的雲端測（不用真的登入 Google）
  await run('雲端存檔（假的雲端）',async()=>{const ch=await pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');if(ch!=='E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')return'PKCE 算錯：'+ch;
    const a0=localStorage.getItem(AUTH_KEY),f0=cloudFetch,rows={},js=x=>new Response(JSON.stringify(x),{status:200,headers:{'Content-Type':'application/json'}});let down=false;
    cloudFetch=async(url,o={})=>{if(down)return new Response('boom',{status:500});const u=new URL(url),m=o.method||'GET',sid=(u.searchParams.get('sid')||'').replace(/^eq\./,'');
      if(!/cloud_saves/.test(u.pathname))return new Response('{}',{status:404});
      if(m==='POST'){const b=JSON.parse(o.body);rows[b.sid]=b;return new Response(null,{status:201})}
      if(m==='DELETE'){delete rows[sid];return new Response(null,{status:204})}
      if(u.searchParams.get('select')==='data')return js(rows[sid]?[{data:rows[sid].data}]:[]);
      return js(Object.values(rows).map(r=>({sid:r.sid,name:r.name,size:r.size,saved_at:r.saved_at})).sort((x,y)=>y.saved_at-x.saved_at))};
    const keep=loadSlots();
    try{authSave({access_token:'t',refresh_token:'r',expires_at:Date.now()+3600e3,user:{id:'u',email:'test@example.com'}});cloudList=null;cloudLast=0;cloudErr='';
      const k=keep.findIndex(Boolean);if(k<0)return'沒有存檔可以測';
      await cloudSyncAll();const sid=loadSlots()[k].G.sid;if(!sid||!rows[sid])return'這台的存檔沒有上傳';
      const back=await unpackCode(rows[sid].data);if(back.G.sid!==sid||back.name!==loadSlots()[k].name)return'上傳的內容不對';
      // 換一台裝置：這台沒有存檔，讀取存檔看得到雲端的，下載回來是同一個存檔
      writeSlots([null,null,null]);await cloudFetchList();slotMode='load';renderSlots();
      if(!($('cloudBox')&&$('cloudBox').querySelector('[data-cloud="get"]')))return'讀取存檔裡沒有雲端的存檔';
      await cloudDownload(sid);const b=loadSlots(),j=b.findIndex(x=>x&&x.G&&x.G.sid===sid);if(j<0)return'沒有下載下來';
      // 這台的比較新：要先問
      b[j].date=Date.now()+60000;writeSlots(b);await cloudDownload(sid);const asked=!$('dialog').classList.contains('hidden')&&$('dlgT').textContent===L('這台的存檔比較新');$('dialog').classList.add('hidden');
      // 上傳失敗：不跳錯誤，留著下次補傳
      down=true;cloudSoon(j,true);await w(400);const quiet=$('dialog').classList.contains('hidden')&&cloudDirty.has(j);down=false;
      return asked&&quiet||'這台比較新會先問 '+asked+'、上傳失敗不吵 '+quiet}
    finally{cloudFetch=f0;writeSlots(keep);a0==null?localStorage.removeItem(AUTH_KEY):localStorage.setItem(AUTH_KEY,a0);cloudList=null;cloudErr='';cloudDirty.clear();refreshCloudUI()}});
  await run('挑戰完成',()=>{anchors.clear();G.onesHand=0;checkChallenge();const ok=$('dlgT').textContent===L('挑戰成功！')&&G.chalDone;$('dialog').classList.add('hidden');return ok});
  // 用假的時間跑主迴圈：60Hz 和 120Hz 的螢幕，省電模式都應該剛好每秒 30 格
  await run('省電模式每秒 30 格',()=>{const raf=window.requestAnimationFrame,tk=tick,e0=SET.eco;let n=0,t=last;window.requestAnimationFrame=()=>0;tick=()=>{n++};
    const sim=(hz,eco)=>{SET.eco=eco;n=0;for(let i=0;i<hz;i++){t+=1000/hz;frame(t)}return n};
    const r=[sim(60,true),sim(120,true),sim(60,false)];SET.eco=e0;tick=tk;window.requestAnimationFrame=raf;last=performance.now();
    return r[0]===30&&r[1]===30&&r[2]===60||'60Hz 省電 '+r[0]+' 格、120Hz 省電 '+r[1]+' 格、一般 '+r[2]+' 格'});
  await run('線上排行榜（只讀）',async()=>{if(!onlineOn())return{skip:'還沒設定 Supabase，略過'};const r=await onlineTop(dailyKey(),1);return Array.isArray(r)||'讀不到排行榜'});
  // 劇情《第一枚一元》：開新的一般模式跑一遍
  await run('劇情：開門收到信',async()=>{toMenu();await w(400);startGame(0,{name:'劇情檢查',size:'small',seed:777,gmode:'normal'});if(!await until(playing,30000))return'等不到遊戲開始';
    if(!G.story)return'一般模式沒有劇情';storyTick(.05,performance.now());if(!mailBox||!mailBox.visible)return'信箱沒出現';G.doorOpen=true;G.story.last=-99;for(let i=0;i<20;i++){G.play+=.5;storyTick(.5,performance.now())}
    if(!G.story.got.intro)return'開門以後沒收到信';openMail();const ok=panel==='mailPanel'&&!!$('mailRead').querySelector('.letter')&&!!G.story.read.intro;closePanel();
    const g=G.story;G.story=null;G.order=1;storyInit(false);const old=!!(G.story&&G.story.got.intro&&G.story.got.order1);G.story=g;G.order=0;
    return ok&&old||'讀信 '+ok+'、舊存檔補信 '+old});
  await run('劇情：硬幣山裡的回憶',()=>{G.left=Math.floor(SIZES[G.size].coins*.7);storyTick(.6,performance.now());if(!G.story.memo.glasses||!memoObj.glasses)return'眼鏡沒出現';
    pickMemo('glasses');const ok=!!G.story.items.glasses&&mode==='memo';closeMemo();return ok&&mode==='play'||'撿不起來'});
  await run('放大鏡和收藏櫃',async()=>{G.coll={};const r0=rollType;rollType=()=>ONE_TYPES.find(t=>t.id==='holed');depositOne();const ap=mode==='appraise'&&!!appr&&appr.spots.length===3;apReveal();
    await until(()=>mode==='card',4000);closeCard();depositOne();rollType=r0;const dup=mode==='play'&&G.coll.holed===2;
    openPanel('cabPanel');cabSel='holed';renderCab();const v=!$('cabView').classList.contains('hidden')&&$('cabView').textContent.includes(L(ownerOf('holed')[0]));
    cabTab='memo';cabSel=null;renderCab();const m=document.querySelectorAll('#cabList .memo').length===MEMOS.filter(x=>!x.season||G.story.items[x.id]).length;cabTab='one';closePanel();
    return ap&&dup&&v&&m||('放大鏡 '+ap+'、重複的 '+dup+'、細看 '+v+'、回憶 '+m)});
  await run('劇情：鐵盒和一元展',()=>{const S=G.story;G.left=0;storyHold();if(!memoObj.tin)return'鐵盒沒出現';pickMemo('tin');openTin();finishTin();if(!S.items.mine||!G.coll.gold)return'鐵盒裡沒有東西';
    S.last=-99;for(let i=0;i<20;i++){G.play+=.5;storyTick(.5,performance.now())}if(!S.got.fest)return'沒收到一元展的信';
    festStart();if(folk.length<8)return'鎮上的人沒來：'+folk.length;const p=folk.find(x=>!x.sit);talkFolk(p);if(!p.bub)return'聊不起來';
    fest.ready=true;launchMark(true);launchLanterns();if(fest.lan.length<20)return'天燈沒放';for(let i=0;i<40;i++)festTick(.1,performance.now());endCredits();
    return S.festDone&&S.fin||'結局沒完成'});
  // 一元展結束：鎮民回家（像天亮了一樣），再檢查博物館、節日、收音機
  folk.slice().forEach(removeFolk);festLights(false);launchMark(false);if(fest){fest.lan.forEach(l=>{scene.remove(l.g);disposeObj(l.g)});fest=null}
  await run('一元博物館',()=>{deliver('museum',true);if(!lv('giftMuseum'))return'沒有送展示櫃';const t=addTile('museum',Math.floor(-H+3),Math.floor(H-4),0,0);if(!t||!t.musCoins)return'蓋不起來';animTile(t,.1,performance.now());
    const have=ONE_TYPES.filter(x=>G.coll[x.id]).length,shown=t.musCoins.filter(c=>c.have).length,c=fpCenter('museum',t.gx,t.gz,0);pl.x=c.x;pl.z=c.z-1.2;pl.y=0;const near=nearMuseum()===t;
    G.tod=22;musVT=0;museumVisit(.1,performance.now());const v=!!musV;for(let i=0;i<220&&musV&&musV.st!=='look';i++)museumVisit(.1,performance.now());for(let i=0;i<20&&musV;i++)museumVisit(.1,performance.now());
    const said=!!(musV&&musV.said);folk.filter(p=>p.mus).forEach(removeFolk);musV=null;removeTile(t);
    return t.musCoins.length===24&&shown===have&&have>0&&near&&v&&said||['格子 '+t.musCoins.length,'擺了 '+shown+'/'+have,'靠近 '+near,'有人來看 '+v,'說話 '+said].join('、')});
  await run('節日：過年和中秋',()=>{const S=G.story,d0=seasonDay,now=()=>performance.now();
    seasonDay='2027-02-06';seaT=0;seaT0=now()-20000;S.last=-99;G.play=Math.max(G.play,100);seasonTick(.1,now());
    const cny=!!cnyG&&SEA.cny===2027,got=!!S.got.cny2027;openMail('cny2027');const red=!!$('mailRead').querySelector('.letter.red')&&!!S.items.hb2027;closePanel();launchFw();const fw=FW.length>0;
    seasonDay='2027-09-15';seaT=0;S.last=-99;G.tod=21;seasonTick(.1,now());seasonTick(.1,now());const moon=!cnyG&&!!moonP&&moonS.visible&&moonS.scale.x>25,ml=!!S.got.moon2027;
    seasonDay='2026-11-05';seaT=0;seasonTick(.1,now());const off=!cnyG&&!moonP;seasonDay=d0;seaT=0;
    return cny&&got&&red&&fw&&moon&&ml&&off||['春聯 '+cny,'紅包信 '+got,'紅信紙 '+red,'煙火 '+fw,'中秋 '+moon,'中秋的信 '+ml,'收起來 '+off].join('、')});
  await run('收音機換台',()=>{G.ups.giftRadio=1;const t=addTile('radio',Math.floor(-H+3),Math.floor(H-7),0,0);if(!t)return'蓋不起來';pl.x=t.gx+.5;pl.z=t.gz-.6;pl.y=0;
    G.story.radio=true;const old=radioSt()===1,seen=[];for(let i=0;i<5;i++){const n=storyNear();if(!n||n.k!=='radio')return'靠近收音機沒有提示';storyUse();seen.push(radioSt())}
    G.story.radio=4;updateRadio(.1);const blue=t.dialC===0x60b8ff;G.story.radio=0;updateRadio(.1);removeTile(t);
    return old&&seen.join()==='2,3,4,0,1'&&blue||'舊存檔 '+old+'、順序 '+seen.join()+'、雨聲的燈 '+blue});
  await run('回主選單',async()=>{toMenu();await w(800);return mode==='menu'});
  await run('最後沒有錯誤',()=>ERRS.length?ERRS.map(e=>e.m+'（'+e.at+'）').join('；'):true);
  sk.forEach(k=>bk[k]==null?localStorage.removeItem(k):localStorage.setItem(k,bk[k]));showMenu('main');
  try{(await albOpen()).close()}catch(e){}albDB=null;try{indexedDB.deleteDatabase('fty1-album-selftest')}catch(e){}ALB_DB='fty1-album';
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
