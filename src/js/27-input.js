// ================= 滑鼠鎖定與輸入 =================
// Chrome 剛按過 Esc 的一秒多內不准再鎖定滑鼠，這不代表瀏覽器不支援：先顯示「點一下畫面」，真的連續失敗才改用備用操作
let lockReq=false,unlockT=-1e9,lockFails=0;
function lockFailed(){if(!lockReq)return;lockReq=false;if(performance.now()-unlockT>2500)lockFails++;if(lockFails>=3||!cv.requestPointerLock)enableFallback()}
function enableFallback(){if(!fallback){fallback=true;toast('這個瀏覽器不能鎖定滑鼠：按住滑鼠中鍵或 Alt＋拖曳轉視角')}locked=true;$('pausePanel').classList.add('hidden')}
function lock(force){if(!force&&mode!=='play')return;if(topV&&!force)return;if(TOUCH){locked=true;$('pausePanel').classList.add('hidden');goFull();return}if(fallback){locked=true;$('pausePanel').classList.add('hidden');return}lockReq=true;try{const p=cv.requestPointerLock();if(p&&p.catch)p.catch(lockFailed)}catch(e){lockFailed()}}
function unlock(){lmb=rmb=false;if(fallback||TOUCH)locked=false;else if(document.pointerLockElement&&document.exitPointerLock)document.exitPointerLock()}
function openPause(){if(mode!=='play')return;if(authGet()&&slotIdx>=0){saveGame(true);cloudSoon(slotIdx,true)}mode='pause';unlock();$('pMail').style.display=storyOK()?'':'none';$('pausePanel').classList.remove('hidden')}
function resume(){$('pausePanel').classList.add('hidden');mode='play';lock()}
document.addEventListener('pointerlockerror',lockFailed);
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===cv){fallback=false;lockFails=0;lockReq=false}else unlockT=performance.now();if(fallback)return;locked=document.pointerLockElement===cv;if(!locked&&mode==='play'&&!panel&&!topV)openPause()});
cv.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>{if(mode==='play')e.preventDefault()});
cv.addEventListener('click',()=>{if(mode==='play'&&!locked&&!panel)lock();if(mode==='intro')introT=99});
$('skip').onclick=()=>{introT=99};
$('pResume').onclick=resume;$('pMail').onclick=()=>{$('pausePanel').classList.add('hidden');mode='play';if(storyOK())openMail();else{toast('這個模式沒有信件');lock()}};$('pStat').onclick=()=>{$('pausePanel').classList.add('hidden');mode='play';openPanel('statPanel')};$('pSave').onclick=()=>saveGame(false);$('pMenu').onclick=toMenu;$('pSet').onclick=openSettings;
$('eStay').onclick=()=>{$('endPanel').classList.add('hidden');mode='play';lock()};$('eMenu').onclick=toMenu;
document.addEventListener('mousemove',e=>{if((mode!=='play'&&mode!=='photo')||panel||!locked)return;if(fallback&&!(e.buttons&4)&&!e.altKey)return;const s=.0022*SET.sens;pl.yaw-=e.movementX*s;pl.pitch=Math.max(-1.5,Math.min(1.5,pl.pitch-e.movementY*s))});
document.addEventListener('mousedown',e=>{if(mode!=='play'||panel||(!locked&&!topV))return;
  if(e.button===1){e.preventDefault();if(fallback){midDown={x:e.clientX,y:e.clientY};return}if(!G.build)copyBuilding();return}
  if(fallback&&e.button===0&&cv.requestPointerLock){try{const p=cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
  if(e.button===0){lmb=true;if(G.build){const had=!!beltStart;buildClick();beltDrag=!had&&!!beltStart}}
  if(e.button===2){if(G.build){if(beltStart){beltStart=null;return}const t=aimTile&&cellAt(tkey(aimTile.gx,aimTile.gz));if(t&&t.type!=='sell'&&t.type!=='dock'&&!fallback&&!G.build.dropFor){undoBegin();G.money+=t.paid||0;removeTile(t);undoEnd()}return}rmb=true;grabCd=Math.min(grabCd,0)}});
// 沒辦法鎖定滑鼠時，中鍵拖曳是轉視角；中鍵點一下（沒拖）才是複製
let midDown=null;
// 按住左鍵拖到終點再放開，也可以蓋一整條
let beltDrag=false;
document.addEventListener('mouseup',e=>{if(e.button===0){lmb=false;if(beltDrag&&mode==='play'&&!panel&&G&&G.build&&beltStart&&aimTile&&(aimTile.gx!==beltStart.gx||aimTile.gz!==beltStart.gz))buildClick();beltDrag=false}if(e.button===2)rmb=false;if(e.button===1&&midDown&&mode==='play'&&!panel&&G&&!G.build&&Math.hypot(e.clientX-midDown.x,e.clientY-midDown.y)<5)copyBuilding();if(e.button===1)midDown=null});
// 建造的時候滾輪調高度（架高輸送帶、平台）
function buildNear(d){const R=buildReach();if(G.build.near==null){const p=groundAim(R);G.build.near=p?Math.hypot(p.x-pl.x,p.z-pl.z):4}G.build.near=Math.max(1.5,Math.min(R,G.build.near+d));G.flags.zoomed=(G.flags.zoomed||0)+1;tone(500+G.build.near*40,.03)}
function buildLevel(d){G.build.lvl=Math.max(0,Math.min(3,(G.build.lvl||0)+d));toast(G.build.lvl?'高度 '+(G.build.lvl*LH)+' 公尺':'貼地');tone(600+G.build.lvl*150,.05)}
document.addEventListener('wheel',e=>{if(mode==='play'&&!panel&&topV){topV.h=Math.max(8,Math.min(H*2.2,topV.h*(e.deltaY>0?1.12:.89)));return}
  if(mode==='play'&&!panel&&locked&&G&&G.build&&!G.build.dropFor&&!G.build.remove){buildNear(e.deltaY<0?.5:-.5);return}if(mode!=='play'||panel||!locked||(G&&G.build))return;const own=TOOLS.filter(t=>toolOwned(t.id)),k=own.findIndex(t=>t.id===G.tool);setTool(own[(k+(e.deltaY>0?1:own.length-1))%own.length].id)});
addEventListener('keydown',e=>{
  if(['Tab','F4','F5'].includes(e.code))e.preventDefault();
  const C=keyCode(e);if(C==='_none')return;
  if(mode==='card'){if(C==='KeyE'){cardFlip=!cardFlip;renderCard()}else if(C==='Escape'||C==='Space')closeCard();return}
  if(mode==='intro'){introT=99;return}
  if(mode==='appraise'){if(['KeyE','Space','Escape','Enter'].includes(C))apReveal();return}
  if(mode==='memo'){if(['KeyE','Space','Escape','Enter'].includes(C)){if(memoMode==='tinLetter')finishTin();else closeMemo()}return}
  if(mode==='pause'&&C==='Escape'){resume();return}
  if(mode==='photo'){if(C==='KeyP'||C==='Escape')exitPhoto();else if(C==='Enter')savePhoto();else if(C==='KeyF')photoNextFx();else if(C==='KeyT')photoNextTod();else keys.add(C);return}
  if(mode!=='play')return;
  if(C==='F4'){hudOff=!hudOff;$('hud').classList.toggle('off',hudOff);return}
  if(C==='F5'){saveGame(false);return}
  if(panel&&cabKey(C))return;
  if(panel){if(C==='Escape'||(C==='KeyK'&&panel==='mailPanel')||(C==='KeyE'&&['shopPanel','boardPanel','cabPanel','cfgPanel','mailPanel'].includes(panel))||(C==='KeyJ'&&panel==='statPanel')||(C==='KeyO'&&panel==='ovPanel')||(C==='Tab'&&panel==='techPanel')||(C==='KeyB'&&panel==='buildPanel'))closePanel();return}
  if(C==='Escape'){if(G.build){exitBuild();return}if(fallback)openPause();return}
  if(!locked&&!topV)return;
  keys.add(C);
  if((e.ctrlKey||e.metaKey)&&C==='KeyZ'){e.preventDefault();undo();return}
  if(C==='KeyM'){toggleTop();return}
  if(C==='KeyO'){openPanel('ovPanel');return}
  if(C==='KeyE')interactE();
  if(C==='Tab'){if(G.build)exitBuild();openPanel('techPanel')}
  if(C==='KeyB'){if(G.build)exitBuild();else openPanel('buildPanel')}
  if(e.shiftKey&&/^Digit[1-9]$/.test(C)){const id=(G.favs||[])[+C.slice(5)-1];if(id)selectBuild(id);return}
  if(G.build){if(C==='KeyN'){const m=G.build.bp;G.build.bp=m==='paste'?'select':m==='select'?null:G.clip?'paste':'select';bpA=null;bpGhost.visible=false;toast(G.build.bp==='select'?'藍圖：點兩個角框選要複製的機器':G.build.bp==='paste'?'藍圖：貼上':'離開藍圖')}
    if(C==='KeyR'&&G.build.bp==='paste'&&G.clip){bpRotate(G.clip);return}
    if(C==='KeyR'){if(beltStart&&LINES[G.build.item])G.build.flip=!G.build.flip;else{G.build.dir=(G.build.dir+1)%4;G.flags.rotated=true}}if(C==='KeyG'){G.showGrid=!G.showGrid;G.flags.grid=true;toast(G.showGrid?'顯示方格':'關掉方格')}if(C==='PageUp')buildLevel(1);if(C==='PageDown')buildLevel(-1);if(C==='KeyC')buildNear(-.5);if(C==='KeyV')buildNear(.5);if(C==='KeyF'){G.build.free=!G.build.free;toast(G.build.free?'不吸附：照你轉的方向放':'吸附：機器會自動順著輸送帶')}if(C==='KeyX'){G.build.remove=!G.build.remove;beltStart=null}return}
  if(C==='KeyP'){enterPhoto();return}
  if(C==='KeyJ'){openPanel('statPanel');return}
  if(C==='KeyK'){if(storyOK())openMail();else toast('這個模式沒有信件');return}
  if(C==='KeyL'){headlamp.intensity=headlamp.intensity?0:2.2;toast(headlamp.intensity?'手電筒打開了':'手電筒關掉了');tone(headlamp.intensity?900:500,.04)}
  if(C==='KeyQ')dropTool(false);
  if(C==='KeyF')dropTool(true);
  const t=TOOLS.find(x=>'Digit'+x.key===C);if(t)setTool(t.id);
  if(C==='Space'&&pl.onGround){const h=(.9+.05*lv('spring'))*(1+bonus('jump'));pl.vy=Math.sqrt(40*h);pl.onGround=false}
});
addEventListener('keyup',e=>keys.delete(keyCode(e)));
addEventListener('blur',()=>{keys.clear();lmb=rmb=false});
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});

