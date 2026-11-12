// ================= 手機版：虛擬搖桿、拖曳轉視角、觸控按鈕 =================
const TOUCH=SET.touch==='on'||(SET.touch!=='off'&&!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches));
if(TOUCH){document.body.classList.add('touch');if(SET.res==null)SET.res='auto';if(localStorage.getItem('ft1y_settings')==null){SET.shadowQ=1;SET.coinQ=0}}
const tState={stick:null,look:null,lookX:0,lookY:0};
function tKey(code,down){padKey(code,down)}
const TSHORT={det:'探測器',vac:'吸塵器',hscan:'掃描器'};
// 手機版：教學、提示、說明裡的鍵盤說法換成畫面上按鈕的名字（電腦版不動）
var TTON=false;
var TKEY={LMB:'撿',RMB:'丟',E:'E',TAB:'科技',B:'建造',Q:'放下',R:'旋轉',X:'拆除',G:'方格',SHIFT:'跑','1':'工具'};
const TTR=[
  ['俯瞰模式：WASD 移動、滾輪拉近拉遠、B 建造、M 回去','俯瞰模式：拖曳畫面移動地圖，點「建造」可以直接點地上蓋，再點「俯瞰」回去'],
  ['拍照模式：WASD 飛、空白鍵／C 上下、Enter 存圖、P 離開','拍照模式：搖桿飛、「跳」「蹲」上下、按「撿」存圖，再點「拍照」離開'],
  ['按 1 把鏟子換回徒手，再按 2 把鏟子拿出來','點下方中間的工具鍵，先換成雙手，再換回玩具鏟'],['放在快捷欄第 2 格，就在徒手旁邊','下方中間的工具鍵裡選得到'],
  ['再點一下設定','再按一次「蓋」設定'],
  ['按 Q 放到地上，或按 F 丟出去','按「放下」放到地上'],
  ['滑鼠上就會出現預覽','畫面中間就會出現預覽'],['轉動滑鼠滾輪，或按 C 和 V','按右下的「拉近」和「推遠」'],
  ['按滑鼠中鍵','按右下的「複製」'],['中鍵複製','可以按「複製」'],['中鍵','「複製」'],
  ['再按一次 Tab 就能關掉','點面板右上的 ✕ 就能關掉'],['按 Tab','點左上的「科技」'],
  ['再按一次 G','再點一次「方格」'],['按 G','點左上的「方格」'],
  ['再按 B','再點左上的「建造」'],['按 B','點左上的「建造」'],
  ['點一下地上的位置','對準地上按「蓋」'],['點一下定起點，再點一下定終點','按「蓋」定起點，再按一次「蓋」定終點'],
  ['點一下就拆掉','對準要拆的東西按「拆」'],['左鍵拆掉','按「拆」拆掉'],['X 切回建造・B／Esc 離開','「拆除」切回建造・點「建造」離開'],
  ['再點一下確定・右鍵取消','再按一次「蓋」確定・「取消」重來'],['再點一下定','再按一次「蓋」定'],['點一下定','按「蓋」定'],
  ['點第一個角','按「蓋」定第一個角'],['先點平台的邊','先對準平台的邊按「蓋」'],['點兩個角','用「蓋」點兩個角'],
  ['・F 吸附：開',''],['・F 吸附：關',''],['（或按住拖到終點）',''],['左鍵放置','按「蓋」放置'],['B／Esc 離開','點「建造」離開'],['X 切回建造','「拆除」切回建造'],['X 拆除','「拆除」'],['按 X 切換拆除','按「拆除」切換拆除'],['R 旋轉','「旋轉」'],
  ['R 轉方向','「旋轉」轉方向'],['N 離開藍圖','再點「藍圖」離開'],['左鍵貼上','按「蓋」貼上'],['N 重新','點「藍圖」重新'],
  ['按 R','按「旋轉」'],['按 X','按「拆除」'],['按 Q','按「放下」'],
  ['PageUp／PageDown','左上的「架高」「降低」'],
  ['按住 Shift','把搖桿推到底'],['左下的黃條','下方中間的黃條'],['按住 C','按「蹲」'],
  ['按住左鍵','按住「撿」'],['按左鍵','按「撿」'],['左鍵','「撿」'],
  ['按住右鍵','按住「丟」'],['按右鍵','按「丟」'],['右鍵','「丟」'],['空白鍵','「跳」'],
  ['按住 E','按住「E」'],['按 E','按「E」']];
function TT(s){if(!TTON||typeof s!=='string')return s;if(EN_ON)return TTEN(Lh(s));const o=s;for(const[a,b]of TTR)if(s.indexOf(a)>=0)s=s.split(a).join(b);
  return s===o?s:s.replace(/([」一-鿿]) (?=[一-鿿「（])/g,'$1')}
// 遊戲寫進這些地方的字，手機版先翻成按鈕說法
function hookText(id,prop){const el=$(id);if(!el)return;const P=prop==='innerHTML'?Element.prototype:Node.prototype,d=Object.getOwnPropertyDescriptor(P,prop);
  Object.defineProperty(el,prop,{configurable:true,get(){return d.get.call(this)},set(v){d.set.call(this,TT(String(v)))}})}
const HELP_T='<p style="text-align:left"><b>左下</b>：手指按哪裡搖桿就在哪裡，推到底會跑<br><b>右半邊畫面</b>：拖曳轉視角<br><b>撿</b>：按住拿硬幣　<b>丟</b>：丟硬幣（對準收購站進料口就是賣）<br><b>E</b>：開門、五金行、訂單板、收藏櫃、機器設定；看著輸送帶按住 E 把它反過來<br><b>跳</b>（有噴射背包就按住往上飛）、<b>蹲</b>（手上的硬幣不會灑）、<b>放下</b>（把工具放到地上）<br>看著建築時右下會出現<b>複製</b><br><b>下方中間</b>：點一下選工具，也能選快捷欄的建築<br><b>左上</b>：選單、科技樹、建造、俯瞰、手電筒、拍照、成就<br><b>建造時</b>：蓋、旋轉、拆除、拉近、推遠；左上換成架高、降低、方格、復原、藍圖<br>建造目錄裡<b>長按</b>建築可以加到快捷欄</p>';
// 手機進遊戲就全螢幕，把網址列藏起來，順便鎖成橫向；離開全螢幕後在遊戲裡點一下會再進去
const isStandalone=()=>!!(navigator.standalone||window.matchMedia&&matchMedia('(display-mode: fullscreen),(display-mode: standalone)').matches);
function goFull(){
  if(!TOUCH||isStandalone()||document.fullscreenElement||document.webkitFullscreenElement)return;
  const d=document.documentElement,rq=d.requestFullscreen||d.webkitRequestFullscreen;if(!rq)return;
  try{const p=rq.call(d,{navigationUI:'hide'});if(p&&p.then)p.then(lockLand,()=>{});else lockLand()}catch(_){}}
// 手機震動：找到 1 元、完成訂單、買到科技、拿到成就（iPhone 的網頁不能震動）
function buzz(p){const ua=navigator.userActivation;if(TTON&&SET.vib!==false&&navigator.vibrate&&!(ua&&!ua.hasBeenActive))try{navigator.vibrate(p)}catch(_){}}
function lockLand(){try{const o=screen.orientation;if(o&&o.lock)o.lock('landscape').catch(()=>{})}catch(_){}}
// ---------- 安裝成 App：主選單右下的綠色按鈕（從 App 打開的時候不顯示） ----------
// Chrome／Edge／Android 直接跳出瀏覽器的安裝視窗；iPhone／iPad 和其他瀏覽器沒有安裝視窗，就一步一步教
let installEvt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;updInstallBtn()});
addEventListener('appinstalled',()=>{installEvt=null;updInstallBtn();toast('📲 安裝好了！之後從桌面或主畫面的「大海撈一元」圖示打開','gold')});
function updInstallBtn(){const b=$('installBtn');if(b)b.classList.toggle('hidden',isStandalone())}
function installApp(){
  if(installEvt){const e=installEvt;installEvt=null;try{e.prompt();e.userChoice.then(c=>{if(c&&c.outcome==='accepted')toast('📲 安裝中…','gold')}).catch(()=>{})}catch(_){installHelp()}return}
  installHelp()}
function installHelp(){const ua=navigator.userAgent,ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),inApp=/Line\/|FBAN|FBAV|Instagram|MicroMessenger/i.test(ua),android=/Android/.test(ua);
  const save='<br><span style="color:#aaa">App 和瀏覽器裡的存檔是分開的：用「☁ 雲端存檔」登入同一個 Google 帳號，就能把進度帶過去。</span>';
  let h;
  if(inApp)h='現在是在 LINE、Facebook 之類的 App 裡面打開的，這裡沒辦法安裝。<br>點右上角（或右下角）的選單，選「用瀏覽器開啟」（iPhone 選 Safari、Android 選 Chrome），再按一次「📲 安裝成 App」。';
  else if(ios)h='1. 點 Safari 的「分享」按鈕（方框加一個往上的箭頭；iPhone 在下面、iPad 在右上角）<br>2. 往下滑，點「加入主畫面」<br>3. 點右上角的「加入」<br>4. 之後從主畫面的「大海撈一元」圖示打開，就是全螢幕，沒網路也能玩'+save;
  else if(android)h='這個瀏覽器沒有跳出安裝視窗。<br>點瀏覽器右上角的 ⋮ 選單，選「安裝應用程式」或「加到主畫面」。<br>如果已經安裝過，直接從主畫面的「大海撈一元」圖示打開就好。'+save;
  else h='用 Chrome 或 Edge 打開的話，網址列右邊有一個安裝圖示（螢幕加一個往下的箭頭），點它再按「安裝」。<br>也可以從瀏覽器的 ⋮ 選單找「安裝大海撈一元」。<br>如果已經安裝過，直接從桌面或開始選單的圖示打開就好。'+save;
  dialog('📲 安裝成 App','<p style="text-align:left;line-height:2">'+h+'</p>',[['知道了','gold']])}
// iPhone 的 Safari 不能讓網頁全螢幕：第一次打開時教玩家加入主畫面
function iosHint(){
  const d=document.documentElement;if(!TOUCH||isStandalone()||d.requestFullscreen||d.webkitRequestFullscreen||!/iPhone|iPod/.test(navigator.userAgent))return;
  try{if(localStorage.getItem('ft1y_ioshint'))return;localStorage.setItem('ft1y_ioshint','1')}catch(_){}
  dialog('想要全螢幕玩？','<p style="text-align:left">iPhone 的 Safari 不能讓網頁自己全螢幕，網址列會一直在。<br>點 Safari 的<b>分享</b>按鈕 → <b>加入主畫面</b>，之後從主畫面的「大海撈一元」圖示打開，就是全螢幕。<br><span style="color:#aaa">主畫面打開的存檔和 Safari 裡的是分開的，可以在「匯出存檔」按「複製存檔碼」，再到另一邊的「匯入存檔」貼上。</span></p>',[['知道了','gold']])}
// 下方中間的工具鍵：顯示現在拿的工具，建造時顯示要蓋的東西
let tChipK='';
function toolChip(){
  if(!document.body.classList.contains('touch')||!G)return;
  const b=G.build&&BIT[G.build.item],t=TOOLS.find(t=>t.id===G.tool)||TOOLS[0],k=b?'b'+G.build.item:G.build?'b':'t'+t.id;if(k===tChipK)return;tChipK=k;
  const c=$('tTool');c.querySelector('.tci').textContent=b?b.icon:G.build?'🔨':t.icon;c.querySelector('.tcn').textContent=b?b.name:G.build?'建造':TSHORT[t.id]||t.name;
  if(!$('tPick').classList.contains('hidden'))fillPick()}
function fillPick(){const f=(G.favs||[]).filter(id=>BIT[id]);
  $('tPick').innerHTML=TOOLS.filter(t=>toolOwned(t.id)).map(t=>'<button data-tool="'+t.id+'"'+(t.id===G.tool&&!G.build?' class="sel"':'')+'><b>'+t.icon+'</b>'+(TSHORT[t.id]||t.name)+'</button>').join('')+
    (f.length?'<div class="ph2">快捷欄的建築</div>'+f.map(id=>'<button data-fav="'+id+'"'+(G.build&&G.build.item===id?' class="sel"':'')+'><b>'+BIT[id].icon+'</b>'+BIT[id].name.slice(0,5)+'</button>').join(''):'')}
function showPick(on){const p=$('tPick');if(on){fillPick();p.classList.remove('hidden')}else p.classList.add('hidden');$('tTool').classList.toggle('on',on)}
function touchInit(){
  if(!TOUCH)return;const ui=$('touchUI');iosHint();ui.addEventListener('pointerup',goFull,true);
  TTON=true;[['buildHint','innerHTML'],['techInfo','innerHTML'],['shopList','innerHTML'],['mtip','innerHTML'],['buildFoot','textContent'],['meterTxt','textContent'],['objD','textContent'],['pLbl','textContent'],['pSub','textContent']].forEach(([id,pr])=>hookText(id,pr));
  for(const sp of document.querySelectorAll('#buildTop span'))if(sp.textContent.indexOf('左鍵裝備')>=0){sp.textContent='點一下裝備・長按加快捷欄';sp.className='bhint'}
  $('pSave').textContent='存檔';$('pStat').textContent='成就與統計';$('pMail').textContent='信件';$('sSens').previousElementSibling.textContent='視角靈敏度';
  $('techTree').addEventListener('click',e=>{const l=e.target.closest('[data-tlane]');if(!l)return;techLane=l.dataset.tlane;renderTech();const g=$('techTree').querySelector('.tmG');if(g)g.scrollTop=0});
  const stick=$('tStick'),knob=$('tKnob'),zone=$('tZone'),look=$('tLook');
  // 搖桿：手指按下的地方就是搖桿中心，放開回到左下角
  const stickMove=e=>{const s=tState.stick;if(!s||s.id!==e.pointerId)return;let dx=(e.clientX-s.cx)/52,dy=(e.clientY-s.cy)/52;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}
    knob.style.transform='translate('+dx*44+'px,'+dy*44+'px)';tKey('KeyW',dy<-.35);tKey('KeyS',dy>.35);tKey('KeyA',dx<-.35);tKey('KeyD',dx>.35);tKey('ShiftLeft',l>1.2);stick.classList.toggle('run',l>1.2)};
  zone.addEventListener('pointerdown',e=>{e.preventDefault();if(tState.stick)return;showPick(false);try{zone.setPointerCapture(e.pointerId)}catch(_){}
    const R=66*(innerWidth<=600||innerHeight<=340?.88:1),x=Math.max(R+6,Math.min(innerWidth*.42,e.clientX)),y=Math.max(R+6,Math.min(innerHeight-R-6,e.clientY));
    stick.style.left=(x-66)+'px';stick.style.top=(y-66)+'px';stick.style.bottom='auto';stick.classList.add('on');tState.stick={id:e.pointerId,cx:x,cy:y};stickMove(e)});
  zone.addEventListener('pointermove',stickMove);
  const stickEnd=e=>{if(!tState.stick||tState.stick.id!==e.pointerId)return;tState.stick=null;knob.style.transform='';stick.style.left=stick.style.top=stick.style.bottom='';stick.classList.remove('on','run');['KeyW','KeyS','KeyA','KeyD','ShiftLeft'].forEach(k=>tKey(k,false))};
  zone.addEventListener('pointerup',stickEnd);zone.addEventListener('pointercancel',stickEnd);
  // 右邊拖曳：轉視角（俯瞰時是移動地圖；建造時點一下就蓋在點的位置）
  look.addEventListener('pointerdown',e=>{e.preventDefault();showPick(false);try{look.setPointerCapture(e.pointerId)}catch(_){}tState.look={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now()}});
  look.addEventListener('pointermove',e=>{const s=tState.look;if(!s||s.id!==e.pointerId)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;s.x=e.clientX;s.y=e.clientY;
    if(topV){topV.x-=dx*topV.h/innerHeight*1.4;topV.z-=dy*topV.h/innerHeight*1.4}else if(mode==='play'||mode==='photo'){pl.yaw-=dx*.0055*SET.sens;pl.pitch=Math.max(-1.5,Math.min(1.5,pl.pitch-dy*.0055*SET.sens))}});
  const lookEnd=e=>{const s=tState.look;if(!s||s.id!==e.pointerId)return;tState.look=null;
    if(topV&&G&&G.build&&Math.hypot(e.clientX-s.sx,e.clientY-s.sy)<8){mouseNDC.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);aimTile=buildAim();buildClick()}};
  look.addEventListener('pointerup',lookEnd);look.addEventListener('pointercancel',lookEnd);
  // 選工具
  $('tPick').addEventListener('pointerup',e=>{const b=e.target.closest('[data-tool],[data-fav]');if(!b||!G)return;if(b.dataset.fav)selectBuild(b.dataset.fav);else{if(G.build)exitBuild();setTool(b.dataset.tool)}showPick(false)});
  // 建造目錄：長按把建築加到快捷欄（iPhone 沒有右鍵選單），放開時不要順便裝備
  let lpT=0,lpFired=false;const bl=$('buildList');
  bl.addEventListener('pointerdown',e=>{const c=e.target.closest('[data-build]');lpFired=false;clearTimeout(lpT);if(!c||!G)return;const x=e.clientX,y=e.clientY;
    lpT=setTimeout(()=>{lpFired=true;toggleFav(c.dataset.build);if(navigator.vibrate)navigator.vibrate(15)},480);
    const cancel=ev=>{if(ev.type!=='pointermove'||Math.hypot(ev.clientX-x,ev.clientY-y)>10){clearTimeout(lpT);bl.removeEventListener('pointermove',cancel);bl.removeEventListener('pointerup',cancel);bl.removeEventListener('pointercancel',cancel)}};
    bl.addEventListener('pointermove',cancel);bl.addEventListener('pointerup',cancel);bl.addEventListener('pointercancel',cancel)});
  bl.addEventListener('click',e=>{if(lpFired){e.stopPropagation();e.preventDefault();lpFired=false}},true);
  // Android 長按也會跳右鍵選單：手機版一律在這裡處理，只切換一次
  bl.addEventListener('contextmenu',e=>{e.preventDefault();e.stopImmediatePropagation();const c=e.target.closest('[data-build]');if(c&&G&&!lpFired){lpFired=true;clearTimeout(lpT);toggleFav(c.dataset.build)}},true);
  // 按鈕
  ui.querySelectorAll('[data-t]').forEach(b=>{
    const down=e=>{e.preventDefault();b.classList.add('on');const t=b.dataset.t;if(t!=='tool')showPick(false);
      if(t==='grab'){if(mode==='photo')return;lmb=true;if(G&&G.build)buildClick()}else if(t==='throw')rmb=true;else if(t==='jump')tKey('Space',true);else if(t==='use')tKey('KeyE',true);
      else if(t==='crouch'){tState.crouch=!tState.crouch;tKey('KeyC',tState.crouch)}
      else if(t==='menu'){if(mode==='play')openPause()}else if(t==='tool'){if(G&&G.build)openPanel('buildPanel');else showPick($('tPick').classList.contains('hidden'))}else if(t==='tech')openPanel('techPanel');else if(t==='build'){if(G&&G.build)exitBuild();else openPanel('buildPanel')}
      else if(t==='map')toggleTop();else if(t==='stats')openPanel('statPanel');else if(t==='rot')tKey('KeyR',true);else if(t==='rm'){if(beltStart)beltStart=null;else tKey('KeyX',true)}else if(t==='photo'){if(mode==='photo')exitPhoto();else enterPhoto()}
      else if(t==='lamp')tKey('KeyL',true);else if(t==='drop')tKey('KeyQ',true)
      else if(t==='up')tKey('PageUp',true);else if(t==='down')tKey('PageDown',true);else if(t==='grid')tKey('KeyG',true);else if(t==='bp')tKey('KeyN',true);else if(t==='undo'){if(G&&G.build)undo()}
      else if(t==='near')tKey('KeyC',true);else if(t==='far')tKey('KeyV',true);else if(t==='copy'){if(G&&!G.build&&mode==='play')copyBuilding()}};
    const up=e=>{if(b.dataset.t!=='tool')b.classList.remove('on');const t=b.dataset.t;if(t==='grab'){lmb=false;if(mode==='photo'&&e.type==='pointerup')savePhoto()}else if(t==='throw')rmb=false;else if(t==='jump')tKey('Space',false);else if(t==='use')tKey('KeyE',false);
      else if(t==='rot')tKey('KeyR',false);else if(t==='rm')tKey('KeyX',false);else if(t==='lamp')tKey('KeyL',false);else if(t==='drop')tKey('KeyQ',false);else if(t==='up')tKey('PageUp',false);else if(t==='down')tKey('PageDown',false);else if(t==='grid')tKey('KeyG',false);else if(t==='bp')tKey('KeyN',false);else if(t==='near')tKey('KeyC',false);else if(t==='far')tKey('KeyV',false)};
    b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up)});
}
// 每一格：介面開關、建造模式換按鍵、開著的功能亮金色
function updateTouchUI(){if(!TOUCH)return;const ui=$('touchUI'),show=(mode==='play'||mode==='photo')&&!panel;ui.classList.toggle('hidden',!show);if(!show)showPick(false);
  ui.classList.toggle('building',!!(G&&G.build));$('rotateMsg').classList.toggle('hidden',innerHeight<=innerWidth||mode==='menu');
  if(show){const q=t=>ui.querySelector('[data-t="'+t+'"]');q('lamp').classList.toggle('lock',headlamp.intensity>0);q('map').classList.toggle('lock',!!topV);q('build').classList.toggle('lock',!!(G&&G.build));
    q('photo').classList.toggle('lock',mode==='photo');q('crouch').classList.toggle('lock',!!tState.crouch);toolChip();
    const B=G&&G.build;ui.classList.toggle('rmMode',!!(B&&B.remove));ui.classList.toggle('beltOn',!!(B&&beltStart));q('rm').classList.toggle('lock',!!(B&&B.remove));
    q('grid').classList.toggle('lock',!!(G&&G.showGrid));q('bp').classList.toggle('lock',!!(B&&B.bp));
    const n=performance.now();if(n-(tState.cpT||0)>150){tState.cpT=n;ui.classList.toggle('canCopy',!!(G&&!B&&mode==='play'&&!topV&&(machineLooked()||lookBelt())))}}}

