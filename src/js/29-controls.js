// ================= 操作：自訂按鍵、手把、備份和匯出匯入、第一次看到機器的說明 =================
// 自訂按鍵：遊戲裡用的是「預設按鍵」的代號，玩家改過的按鍵在這裡翻譯回去
const KEYDEF=[['KeyW','往前'],['KeyS','往後'],['KeyA','往左'],['KeyD','往右'],['ShiftLeft','跑'],['Space','跳／噴射背包'],['KeyC','蹲（建造時拉近）'],['KeyV','建造時推遠'],
  ['KeyE','互動'],['Tab','科技樹'],['KeyB','建造目錄'],['KeyQ','把工具放到地上'],['KeyF','丟出工具（建造時：吸附）'],['KeyR','旋轉'],['KeyX','拆除'],['KeyG','方格'],['KeyN','藍圖'],
  ['KeyL','手電筒'],['KeyP','拍照模式'],['KeyM','俯瞰模式'],['KeyO','機器狀態'],['KeyJ','成就與統計'],['PageUp','架高'],['PageDown','降低'],['F4','隱藏介面'],['F5','存檔']];
let keyMapCache=null;
function keyMap(){if(keyMapCache)return keyMapCache;const m={},kb=SET.keys||{};for(const[d]of KEYDEF){const b=kb[d]||d;m[b]=d}
  for(const[d]of KEYDEF){const b=kb[d]||d;if(b!==d&&!(d in m))m[d]='_none'}return keyMapCache=m}
function keyCode(e){if(e.padLogical)return e.code;const m=keyMap();return m[e.code]||e.code}
const keyName=c=>c==='_none'?'—':c.replace(/^Key/,'').replace(/^Digit/,'').replace('ShiftLeft','左 Shift').replace('ShiftRight','右 Shift').replace('ControlLeft','左 Ctrl').replace('Space','空白鍵').replace('ArrowUp','↑').replace('ArrowDown','↓').replace('ArrowLeft','←').replace('ArrowRight','→');
let keyWait=null;
function renderKeys(){$('keyList').innerHTML=KEYDEF.map(([d,l])=>'<div class="setrow"><span>'+l+'</span><button class="sbtn" data-key="'+d+'">'+(keyWait===d?'按下新按鍵…':keyName((SET.keys||{})[d]||d))+'</button></div>').join('')+'<div class="setrow"><span></span><button class="sbtn" data-keyreset>恢復預設按鍵</button></div>'}
document.addEventListener('click',e=>{const b=e.target.closest('[data-key],[data-keyreset]');if(!b)return;if(b.dataset.keyreset!==undefined){SET.keys={};keyMapCache=null;applySet()}else{keyWait=b.dataset.key}renderKeys()});
addEventListener('keydown',e=>{if(!keyWait)return;e.preventDefault();e.stopImmediatePropagation();if(e.code!=='Escape'){SET.keys=SET.keys||{};for(const k in SET.keys)if(SET.keys[k]===e.code)delete SET.keys[k];SET.keys[keyWait]=e.code;keyMapCache=null;applySet()}keyWait=null;renderKeys()},true);
// 手把：左搖桿走、右搖桿看，A 跳、B 蹲／關面板、X 互動、Y 建造、LT 丟、RT 撿／蓋、LB/RB 換工具、Back 科技樹、Start 暫停、L3 跑
const padKeys=new Set();let padOn=false,padPrev=[];
function padKey(code,down){if(down&&!padKeys.has(code)){padKeys.add(code);const ev=new KeyboardEvent('keydown',{code});ev.padLogical=true;dispatchEvent(ev)}else if(!down&&padKeys.has(code)){padKeys.delete(code);const ev=new KeyboardEvent('keyup',{code});ev.padLogical=true;dispatchEvent(ev)}}
function cycleTool(dir){if(!G)return;const own=TOOLS.filter(t=>toolOwned(t.id)),k=own.findIndex(t=>t.id===G.tool);setTool(own[(k+dir+own.length)%own.length].id)}
function pollPad(dt){
  const gp=navigator.getGamepads?[...navigator.getGamepads()].find(g=>g&&g.connected):null;if(!gp)return;
  if(!padOn){padOn=true;toast('偵測到手把：左搖桿走、右搖桿看，RT 撿、LT 丟，X 互動')}
  const b=i=>gp.buttons[i]&&gp.buttons[i].pressed,edge=i=>b(i)&&!padPrev[i],dz=v=>Math.abs(v)<.2?0:v,ax=gp.axes;
  if(mode==='play'&&!panel&&!fallback)locked=true;
  padKey('KeyW',dz(ax[1])<-.35);padKey('KeyS',dz(ax[1])>.35);padKey('KeyA',dz(ax[0])<-.35);padKey('KeyD',dz(ax[0])>.35);padKey('ShiftLeft',b(10));padKey('Space',b(0));padKey('KeyC',b(1)&&!panel);
  if((mode==='play'||mode==='photo')&&!panel){pl.yaw-=dz(ax[2])*dt*2.6*SET.sens;pl.pitch=Math.max(-1.5,Math.min(1.5,pl.pitch-dz(ax[3])*dt*2*SET.sens))}
  if(mode==='play'&&!panel){const rt=b(7),lt=b(6);if(rt&&!padPrev[7]&&G.build)buildClick();lmb=rt;rmb=lt;if(edge(4))cycleTool(-1);if(edge(5))cycleTool(1)}
  if(edge(2))padKey('KeyE',true);else if(!b(2))padKey('KeyE',false);
  if(edge(3))padKey('KeyB',true);else if(!b(3))padKey('KeyB',false);
  if(edge(8))padKey('Tab',true);else if(!b(8))padKey('Tab',false);
  if(edge(1)&&panel)closePanel();
  if(edge(9)){if(mode==='play')openPause();else if(mode==='pause')resume()}
  if(edge(12))padKey('KeyR',true);else if(!b(12))padKey('KeyR',false);
  if(edge(13))padKey('KeyX',true);else if(!b(13))padKey('KeyX',false);
  if(edge(14))padKey('KeyJ',true);else if(!b(14))padKey('KeyJ',false);
  if(edge(15))padKey('KeyO',true);else if(!b(15))padKey('KeyO',false);
  padPrev=gp.buttons.map(x=>x.pressed);
}
// 自動備份：每 5 分鐘把目前的存檔多留一份，每個欄位留最近 4 份
const BKEY='ft1y_backups';
function loadBk(){try{return JSON.parse(localStorage.getItem(BKEY)||'{}')}catch(e){return{}}}
let bkT=0;
function autoBackup(dt){if(!G||slotIdx<0)return;bkT+=dt;if(bkT<300)return;bkT=0;const bk=loadBk(),list=bk[slotIdx]=bk[slotIdx]||[];list.unshift(snapshot());bk[slotIdx]=list.slice(0,4);
  for(let tries=0;tries<6;tries++){try{localStorage.setItem(BKEY,JSON.stringify(bk));return}catch(e){const k=Object.keys(bk).find(k=>bk[k].length>1)||Object.keys(bk)[0];if(!k)return;bk[k].pop();if(!bk[k].length)delete bk[k]}}}
// 匯出／匯入存檔：存成檔案（手機跳出分享選單），或複製一串存檔碼到另一邊貼上
function b64(u8){let s='';for(let k=0;k<u8.length;k+=8192)s+=String.fromCharCode.apply(null,u8.subarray(k,k+8192));return btoa(s)}
async function packCode(j){if(typeof CompressionStream==='undefined')return j;
  const b=await new Response(new Blob([j]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer();return'FT1Y:'+b64(new Uint8Array(b))}
async function unpackCode(t){t=String(t).trim();if(t[0]==='{')return JSON.parse(t);if(!/^FT1Y:/.test(t))throw 0;
  const bin=atob(t.slice(5).replace(/\s+/g,'')),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  return JSON.parse(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate'))).text())}
// 手機跳出分享選單（存到相簿、存到檔案、傳 LINE）；電腦或不能分享時照舊下載
function giveFile(f,msg){const dl=()=>{const a=document.createElement('a'),u=URL.createObjectURL(f);a.href=u;a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);toast(msg)};
  if(TTON&&navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f]}).then(()=>toast(msg),e=>{if(e&&e.name!=='AbortError')dl()});else dl()}
function copyText(t,msg,title){const ok=()=>toast(msg||'存檔碼複製好了，到另一邊的「匯入存檔」貼上'),manual=()=>{
    const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.appendChild(ta);ta.select();let done=false;try{done=document.execCommand('copy')}catch(_){}ta.remove();
    if(done){ok();return}dialog(title||'複製存檔碼','<p>沒辦法自動複製，請在框框裡長按全選，再複製。</p><textarea readonly></textarea>',[['好','gold']]);$('dlgB').querySelector('textarea').value=t};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,manual);else manual()}
function exportSlot(k){const s=loadSlots()[k];if(!s)return;const j=JSON.stringify(s),nm='大海撈一元_存檔_'+(s.name||('欄位'+(k+1))),fl=TTON?'分享檔案':'下載檔案';
  let code='';packCode(j).then(c=>code=c,()=>{});
  const file=()=>{let f=new File([j],nm+'.json',{type:'application/json'});
    // Android 的 Chrome 不能分享 .json，改成 .txt（匯入一樣讀得到）
    if(TTON&&navigator.canShare&&!navigator.canShare({files:[f]}))f=new File([j],nm+'.txt',{type:'text/plain'});giveFile(f,'存檔匯出了')};
  dialog('匯出存檔','<p style="text-align:left">把存檔搬到別台裝置，或在 iPhone 的 Safari 和主畫面 App 之間搬：<br><b>'+fl+'</b>：存成檔案，到另一邊的「匯入存檔」選這個檔案<br><b>複製存檔碼</b>：複製一串文字，到另一邊的「匯入存檔」貼上</p>',
    [[fl,'gold',file],['複製存檔碼','',()=>copyText(code||j)],['取消']])}
function importData(d){if(!d||!d.G||!d.size||d.seed==null||!SIZES[d.size])throw 0;const a=loadSlots();let k=a.indexOf(null);if(k<0){if(a.length<3)k=a.length;else{dialog('存檔欄位滿了','<p>三個欄位都有存檔，先刪掉一個再匯入。</p>',[['好','gold']]);return}}
  d.locked=false;a[k]=d;if(!writeSlots(a))return;slotMode='load';renderSlots();toast('匯入成功，放在第 '+(k+1)+' 個欄位')}
const badSave=()=>dialog('匯入失敗','<p>這不是大海撈一元的存檔，或存檔碼沒有複製完整。</p>',[['好','gold']]);
function importFile(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,.txt,application/json,text/plain';inp.onchange=()=>{const f=inp.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>unpackCode(rd.result).then(importData).catch(badSave);rd.readAsText(f)};inp.click()}
function importSave(){
  dialog('匯入存檔','<p style="text-align:left">選一個匯出的存檔檔案，或把存檔碼貼在下面的框框裡'+(TTON?'（長按框框 → 貼上）':'')+'。</p><textarea id="codeIn" placeholder="在這裡貼上存檔碼"'+(TTON?' inputmode="none"':'')+'></textarea>',
    [['匯入存檔碼','gold',()=>{const t=$('codeIn').value;
      // 框框是空的就直接讀剪貼簿
      if(t.trim())unpackCode(t).then(importData).catch(badSave);
      else if(navigator.clipboard&&navigator.clipboard.readText)navigator.clipboard.readText().then(c=>c.trim()?unpackCode(c).then(importData).catch(badSave):toast('剪貼簿裡沒有存檔碼'),()=>toast('先把存檔碼貼在框框裡'));
      else toast('先把存檔碼貼在框框裡')}],['選擇檔案','',importFile],['取消']])}
function showBackups(k){const list=loadBk()[k]||[];if(!list.length){dialog('沒有備份','<p>這個欄位還沒有自動備份（玩超過 5 分鐘才會有）。</p>',[['好','gold']]);return}
  dialog('自動備份','<p>選一份備份來還原（目前的存檔會被取代）。</p>',list.map((b,i)=>{const d=new Date(b.date);return[(d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+'・'+money(b.G.money||0),i?'':'gold',()=>{const a=loadSlots();a[k]={...b,locked:a[k]&&a[k].locked};writeSlots(a);renderSlots();toast('還原了')}]}).concat([['取消']]))}
// 第一次看到每台機器：右下角跳一張小說明卡
let tipTimer=0;
function machineTip(type){G.seen=G.seen||{};if(G.seen[type]||!BIT[type])return;G.seen[type]=1;const b=BIT[type],el=$('mtip');
  el.innerHTML='<div class="mt-h"><span>'+b.icon+'</span>'+b.name+'</div><div class="mt-d">'+b.desc+'</div>'+(b.power?'<div class="mt-f">耗電 '+pwrOf({type})+'kW'+(b.water?'・用水每秒 '+b.water+' 公升':'')+'</div>':'');
  el.classList.remove('hidden');clearTimeout(tipTimer);tipTimer=setTimeout(()=>el.classList.add('hidden'),7000)}


