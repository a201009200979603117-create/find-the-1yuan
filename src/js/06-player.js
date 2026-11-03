// ================= 玩家 =================
const pl={x:0,y:0,z:0,vy:0,yaw:0,pitch:0,onGround:true,bob:0,stam:1,jet:10,air:0};
const keys=new Set();
let mode='menu',panel=null,locked=false,fallback=false,lmb=false,rmb=false,G=null,slotIdx=-1,menuSeed=20261027,hudOff=false;
const SET={sens:1,vol:.7,fov:72,music:.35,res:'auto',shadowQ:2,coinQ:1,fps:false};
try{Object.assign(SET,JSON.parse(localStorage.getItem('ft1y_settings')||'{}'))}catch(e){}
if(SET.shadow===false&&SET.shadowQ==null)SET.shadowQ=0;delete SET.shadow;
// 畫質：解析度（自動會依卡不卡調整）、陰影品質、硬幣幾何的細緻度
const BASE_PR=Math.min(devicePixelRatio,1.5),ultraOn=()=>!!SET.ultra&&!TTON,basePR=()=>ultraOn()?Math.min(devicePixelRatio,2):BASE_PR;let dynScale=1,curShadowQ=-1,curCoinQ=-1;
function applyQuality(){
  renderer.setPixelRatio(basePR()*(SET.res==='auto'?dynScale:+SET.res));
  const sq=+SET.shadowQ;if(sq!==curShadowQ){curShadowQ=sq;renderer.shadowMap.enabled=sq>0;if(sq>0){const n=[0,1024,2048,4096][sq];sun.shadow.mapSize.set(n,n);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}shadowDirty=true;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true)})}
  const cq=+SET.coinQ;if(cq!==curCoinQ&&typeof coinGeo!=='undefined'){curCoinQ=cq;const g=share(new THREE.CylinderGeometry(1,1,1,[8,14,24][cq]));const old=coinGeo;coinGeo=g;
    [...(typeof meshes!=='undefined'?meshes:[]),...(typeof detMeshes!=='undefined'?detMeshes:[])].forEach(m=>m.geometry=g);if(old!==g)old.dispose()}
  $('fps').classList.toggle('hidden',!SET.fps);
}
function applySet(){document.body.style.setProperty('--fz',SET.fz||1);try{applyVol()}catch(e){}camera.fov=SET.fov;camera.updateProjectionMatrix();try{applyQuality()}catch(e){}try{localStorage.setItem('ft1y_settings',JSON.stringify(SET))}catch(e){}}
applySet();
function allowed(x,z){
  const inYard=x>-H-EXT+.45&&x<H-.45&&z<H-.4&&z>-H+.6;
  const inRoom=Math.abs(x)<1.6&&z>H+.35&&z<H+3.65;
  const inDoor=G&&G.doorOpen&&Math.abs(x)<1.0&&z>=H-.45&&z<=H+.45;
  if(!(inYard||inRoom||inDoor))return false;
  for(const o of obstacles){const dx=x-o.x,dz=z-o.z;if(dx*dx+dz*dz<(o.r+.3)*(o.r+.3))return false}
  return true;
}
// 機器擋路：每台機器是一個有高度的方塊，人是半徑 0.3 的圓柱
// 機器頂比腳高不到 0.6 公尺就踩得上去（站在硬幣堆上走過去、跳上矮機器），不會再穿進機器裡卡住
const PR=.3;
function solidBox(t){const yb=(t.L||0)*LH,top=yb+(MH[t.type]||1);
  if(t.type==='pole'){const cx=t.cx??t.gx+.5,cz=t.cz??t.gz+.5;return{x0:cx-.14,x1:cx+.14,z0:cz-.14,z1:cz+.14,yb,top}}
  const r=t.rect||{x0:t.gx,x1:t.gx+1,z0:t.gz,z1:t.gz+1},k=t.cells&&t.cells.length>1?.04:.18;
  return{x0:r.x0+k,x1:r.x1-k,z0:r.z0+k,z1:r.z1-k,yb,top}}
// 每一格只看玩家身邊 4 公尺內的機器
const nearSolids=[];
function gatherSolids(){nearSolids.length=0;for(const t of tiles.values()){if(!SOLID.has(t.type)&&t.type!=='dock')continue;const r=t.rect;
  if(r?(pl.x<r.x0-4||pl.x>r.x1+4||pl.z<r.z0-4||pl.z>r.z1+4):Math.abs(pl.x-t.gx)>5||Math.abs(pl.z-t.gz)>5)continue;nearSolids.push(solidBox(t))}}
function solidHit(x,z,y){
  for(const b of nearSolids){
    if(b.top<=y+.6||b.yb>=y+1.7)continue;
    const cx=Math.max(b.x0,Math.min(x,b.x1)),cz=Math.max(b.z0,Math.min(z,b.z1));if((x-cx)*(x-cx)+(z-cz)*(z-cz)<PR*PR)return b}
  return null}
// 人腳下的高度：地面、硬幣堆、平台再加上機器頂
function standP(x,z,y){let h=standAt(x,z,y);
  for(const b of nearSolids){
    if(b.top>h&&b.top<=y+.65&&x>b.x0-.12&&x<b.x1+.12&&z>b.z0-.12&&z<b.z1+.12)h=b.top}
  return h}
// 被機器包住（機器蓋在身上、活塞耙移過來、腳下的硬幣被挖走）：推到最近的空地，推不出去就站到機器頂上
function unstick(){
  for(let n=0;n<4;n++){const b=solidHit(pl.x,pl.z,pl.y);if(!b)return;
    const e=PR+.02,opts=[[b.x0-e,pl.z],[b.x1+e,pl.z],[pl.x,b.z0-e],[pl.x,b.z1+e]].sort((p,q)=>Math.hypot(p[0]-pl.x,p[1]-pl.z)-Math.hypot(q[0]-pl.x,q[1]-pl.z));
    const o=opts.find(([x,z])=>allowed(x,z)&&!solidHit(x,z,pl.y)&&standP(x,z,pl.y)<pl.y+.6);
    if(o){pl.x=o[0];pl.z=o[1]}else{pl.y=b.top;pl.vy=0}}}
function updatePlayer(dt){
  // 坐在長椅上：不能走，體力回得比較快；推搖桿、按移動鍵或跳就站起來
  if(pl.sit){const t=pl.sit.t;if(tiles.get(tkey(t.gx,t.gz,t.L))!==t||['KeyW','KeyA','KeyS','KeyD','Space'].some(k=>keys.has(k)))standUp();
    else{pl.x=pl.sit.x;pl.z=pl.sit.z;pl.y=pl.sit.y;pl.vy=0;pl.onGround=true;pl.crouch=true;pl.stam=Math.min(stamMax(),pl.stam+dt*.5);return}}
  const want=(keys.has('ShiftLeft')||keys.has('ShiftRight'))&&pl.stam>.02;
  let mx=0,mz=0;const fx=-Math.sin(pl.yaw),fz=-Math.cos(pl.yaw),rx=Math.cos(pl.yaw),rz=-Math.sin(pl.yaw);
  if(keys.has('KeyW')){mx+=fx;mz+=fz}if(keys.has('KeyS')){mx-=fx;mz-=fz}
  if(keys.has('KeyD')){mx+=rx;mz+=rz}if(keys.has('KeyA')){mx-=rx;mz-=rz}
  pl.crouch=keys.has('KeyC');
  const l=Math.hypot(mx,mz),run=want&&l>0&&!pl.crouch,stMax=stamMax();
  pl.restT=(pl.restT||0)+dt;
  pl.stam=Math.max(0,Math.min(stMax,pl.stam+(run?-dt*.22:pl.restT>.6?dt*.16*(1+.18*lv('secondWind')):0)));
  const sp=(pl.crouch?2*(1+.05*lv('careful')):run?7*(1+bonus('run')):4)*(1+.04*lv('boots'))*(TOOL[G.tool].slow||1);
  gatherSolids();unstick();
  if(l>0){
    const step=.6,nx=pl.x+mx/l*sp*dt,nz=pl.z+mz/l*sp*dt,ok=(x,z)=>allowed(x,z)&&standP(x,z,pl.y)<pl.y+step&&!blockedMove(pl.x,pl.z,x,z,pl.y)&&!solidHit(x,z,pl.y);
    if(ok(nx,nz)){pl.x=nx;pl.z=nz}else if(ok(nx,pl.z))pl.x=nx;else if(ok(pl.x,nz))pl.z=nz;
    if(pl.onGround){pl.bob+=dt*(run?14:pl.crouch?6:9);pl.stepA=(pl.stepA||0)+dt*(run?2.4:pl.crouch?1:1.7);if(pl.stepA>=1){pl.stepA=0;const gy0=groundAt(pl.x,pl.z);SND.step(pl.y>gy0+.3,gy0>.15&&Math.abs(pl.y-gy0)<.2)}}
    // 拿著硬幣跑步會灑出來（蹲著走不會）
    if(run)G.flags.ran=true;
    if(run&&G.carry>0)spill(G.carry*.06*dt*Math.max(0,1-.08*lv('steadyH')));
  }
  // 站在跑動的輸送帶上會被帶走（有防滑靴就不會）
  const bL=Math.round(pl.y/LH);
  if(pl.onGround&&Math.abs(pl.y-bL*LH)<.45&&!lv('grippy')){const bt=cellAt(tkey(Math.floor(pl.x),Math.floor(pl.z),bL));
    if(bt&&BELTLIKE.has(bt.type)&&bt.type!=='beltC'){const[dx,dz]=DIRS[bt.dir],s=beltSpeed()*dt,nx=pl.x+dx*s,nz=pl.z+dz*s;if(allowed(nx,nz)&&standP(nx,nz,pl.y)<pl.y+.6&&!blockedMove(pl.x,pl.z,nx,nz,pl.y)&&!solidHit(nx,nz,pl.y)){pl.x=nx;pl.z=nz}}}
  // 噴射背包：在空中按住空白鍵往上飛
  const jetOn=lv('jetpack')&&!pl.onGround&&keys.has('Space')&&pl.jet>0;
  if(jetOn){pl.jet=Math.max(0,pl.jet-dt);pl.vy=Math.min(5,pl.vy+30*dt);if(Math.random()<dt*14)tone(90+Math.random()*40,.08,'sawtooth',.015)}
  else if(pl.onGround)pl.jet=Math.min(10,(pl.jet??10)+dt*10/8);
  const gy=standP(pl.x,pl.z,pl.y);pl.vy-=20*dt;pl.y+=pl.vy*dt;
  if(pl.y<=gy){
    // 跳起來落地也會灑
    if(!pl.onGround&&pl.air>.35&&G.carry>0)spill(G.carry*.1*Math.max(0,1-.1*lv('softLand')));
    pl.y=gy;pl.vy=0;pl.onGround=true;pl.air=0}
  else if(pl.y>gy+.05){pl.onGround=false;pl.air=(pl.air||0)+dt}
}
const stamMax=()=>1+.15*lv('strongBack');
const reachOf=()=>REACH+.3*lv('reach');
let spillAcc=0;
function spill(n){
  spillAcc+=n;const k=Math.min(G.carry,Math.floor(spillAcc));if(k<=0)return;spillAcc-=k;G.carry-=k;
  const x=pl.x-Math.sin(pl.yaw)*.4,z=pl.z-Math.cos(pl.yaw)*.4,e=items.find(e=>!e.belt&&!e.prod&&Math.hypot(e.x-x,e.z-z)<.6);
  if(e)e.n+=k;else items.push({x,y:groundAt(x,z),z,n:k,ones:0,belt:false});
  showTool();
}
// 挖硬幣耗體力：工具越大越累
const DIG_EFFORT={hand:.025,toy:.03,bucket:.035,spade:.05,fork:.055,cart:.06};
function digCost(id){return(DIG_EFFORT[id]||.04)*Math.max(.1,1-.08*lv('easySwing')+bonus('dig'))}
function placeCam(){camera.position.set(pl.x,pl.y+(pl.crouch?1.05:1.6)+(SET.calm?0:Math.sin(pl.bob)*.035),pl.z);camera.rotation.set(pl.pitch,pl.yaw,0)}

// 手上的工具模型在後面（buildToolModels）
const vm=new THREE.Group();
const toolModels={};
function showTool(){if(!G)return;const id=G.tool,f=FILLS[id];if(f&&toolModels[id]){const c=capOf(id);f(toolModels[id],c?Math.min(1,G.carry/c):0,G.carry)}}

