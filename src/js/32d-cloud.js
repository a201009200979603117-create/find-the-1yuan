// ================= 雲端存檔：用 Google 帳號登入，存檔自動同步，換裝置接著玩 =================
// 用線上排行榜同一個 Supabase 專案（ONLINE）。登入走 OAuth PKCE：帳號密碼只在 Google 的網頁輸入，遊戲只拿到登入憑證。
// 資料表和權限在 supabase/cloud_saves.sql：每個人只看得到、改得到自己的存檔。沒登入的人完全照舊。
// 上傳：每次存檔都記下來，同一台最快 90 秒傳一次；手動存檔、暫停、回主選單、切到別的 App 時馬上傳。失敗就安靜地等下次再補。
const AUTH_KEY='ft1y_auth',PKCE_KEY='ft1y_pkce',CLOUD_GAP=90000;
let cloudReady=false,cloudList=null,cloudBusy=false,cloudLast=0,cloudErr='',cloudFetch=(...a)=>fetch(...a); // 自我檢查會換成假的雲端
const cloudDirty=new Set(),cloudDel=new Set();
const authBase=()=>ONLINE.url.replace(/\/$/,'')+'/auth/v1/';
function authGet(){try{const s=JSON.parse(localStorage.getItem(AUTH_KEY)||'null');return s&&s.access_token?s:null}catch(e){return null}}
function authSave(s){try{s?localStorage.setItem(AUTH_KEY,JSON.stringify(s)):localStorage.removeItem(AUTH_KEY)}catch(e){}}
const authName=()=>{const s=authGet(),u=s&&s.user;return u?(u.email||u.name||'Google'):''};
const iosApp=()=>navigator.standalone===true;
// ---------- 登入（PKCE） ----------
const b64url=u8=>b64(u8).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function pkceChallenge(v){return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))))}
function pkceVerifier(){const a=new Uint8Array(48);crypto.getRandomValues(a);return b64url(a)}
const cloudOff=()=>dialog('雲端存檔還沒開放','<p>Google 登入還沒設定好，等設定好再試試看。存檔一樣會留在這台裝置。</p>',[['好','gold']]);
async function authLogin(){if(!onlineOn())return;
  if(!window.crypto||!crypto.subtle){toast('這個網址沒辦法登入，請用網頁版','red');return}
  // 先問 Supabase 有沒有打開 Google 登入，沒打開就不要跳到一頁看不懂的錯誤
  try{const r=await cloudFetch(authBase()+'settings',{headers:{apikey:ONLINE.key}});const j=await r.json();if(!j.external||!j.external.google){cloudOff();return}}
  catch(e){toast(navigator.onLine?'連不上登入服務，等一下再試':'沒有網路，連上之後再登入','red');return}
  if(G&&slotIdx>=0&&(mode==='play'||mode==='pause'))saveGame(true);
  const v=pkceVerifier();try{localStorage.setItem(PKCE_KEY,v)}catch(e){toast('瀏覽器不允許儲存，沒辦法登入','red');return}
  location.href=authBase()+'authorize?provider=google&redirect_to='+encodeURIComponent(location.origin+location.pathname)+'&code_challenge='+await pkceChallenge(v)+'&code_challenge_method=s256'}
async function authTokenReq(grant,body){const r=await cloudFetch(authBase()+'token?grant_type='+grant,{method:'POST',headers:{apikey:ONLINE.key,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error_description||j.msg||j.error||('HTTP '+r.status));e.status=r.status;throw e}
  const u=j.user||{},m=u.user_metadata||{};
  return{access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Date.now()+(j.expires_in||3600)*1000,user:{id:u.id||'',email:u.email||m.email||'',name:m.full_name||m.name||''}}}
// Google 登完回到遊戲：網址上的 ?code= 換成登入憑證，然後把網址整理乾淨
async function authReturn(){const q=new URLSearchParams(location.search),h=new URLSearchParams(location.hash.slice(1)),code=q.get('code'),err=q.get('error_description')||q.get('error')||h.get('error_description')||h.get('error');
  if(!code&&!err)return;
  ['code','error','error_code','error_description','state'].forEach(k=>q.delete(k));const rest=q.toString();history.replaceState(null,'',location.pathname+(rest?'?'+rest:''));
  const fail=m=>dialog('登入沒有成功','<p>'+m+'</p>',[['好','gold']]);
  if(err){fail(/not enabled|unsupported provider/i.test(err)?'雲端存檔還沒開放，等設定好再試試看。':'Google 登入沒有完成，等一下再試一次。');return}
  let v='';try{v=localStorage.getItem(PKCE_KEY)||''}catch(e){}
  if(!v){fail(iosApp()?'iPhone 主畫面 App 回不到登入的地方。請用 Safari 打開網頁版登入，或用「匯出存檔」的存檔碼把進度搬過來。':'請再按一次「用 Google 登入」。');return}
  try{const s=await authTokenReq('pkce',{auth_code:code,code_verifier:v});authSave(s);try{localStorage.removeItem(PKCE_KEY)}catch(e){}
    toast(EN_ON?'☁ Signed in as '+authName()+'. Your saves will sync to the cloud automatically.':'☁ 登入好了（'+authName()+'），存檔會自動同步到雲端','gold');await cloudSyncAll();if(mode==='menu')showMenu('cloud')}
  catch(e){fail('Google 登入沒有完成，等一下再試一次。');console.warn('登入失敗',e)}
  refreshCloudUI()}
// 登入憑證快過期就換新的；換不到（被登出了）就當成沒登入，沒網路的話先不要登出
async function authToken(){const s=authGet();if(!s)return null;if(Date.now()<s.expires_at-60000)return s.access_token;
  try{const n=await authTokenReq('refresh_token',{refresh_token:s.refresh_token});if(!n.user.id)n.user=s.user;authSave(n);return n.access_token}
  catch(e){if(e.status>=400&&e.status<500){authSave(null);cloudList=null;refreshCloudUI()}return null}}
function authLogout(){const s=authGet();if(s)cloudFetch(authBase()+'logout',{method:'POST',headers:{apikey:ONLINE.key,Authorization:'Bearer '+s.access_token}}).catch(()=>{});
  authSave(null);cloudList=null;cloudDirty.clear();refreshCloudUI();toast('已經登出，存檔還留在這台裝置')}
// ---------- 雲端的存檔 ----------
async function cloudReq(q,opt){const t=await authToken();if(!t)throw new Error('not logged in');opt=opt||{};
  const r=await cloudFetch(onlineBase()+q,{...opt,headers:{apikey:ONLINE.key,Authorization:'Bearer '+t,...(opt.headers||{})}});
  if(!r.ok)throw new Error('HTTP '+r.status+' '+(await r.text().catch(()=>'')).slice(0,160));return r}
const cloudFetchList=()=>cloudReq('cloud_saves?select=sid,name,size,saved_at&order=saved_at.desc').then(r=>r.json()).then(a=>(cloudList=a));
const newSid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2,12);
// 以前的存檔沒有編號：補一個寫回去（之後讀進來玩的也是這個編號）
function slotSid(a,k){const s=a[k];if(!s||!s.G)return null;if(!s.G.sid){s.G.sid=newSid();writeSlots(a);if(G&&k===slotIdx)G.sid=s.G.sid}return s.G.sid}
async function cloudPut(s){const data=await packCode(JSON.stringify(s));
  await cloudReq('cloud_saves?on_conflict=user_id,sid',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify({sid:s.G.sid,name:String(s.name||'').slice(0,40),size:String(s.size||'').slice(0,16),saved_at:s.date||Date.now(),data})})}
function cloudSoon(k,now){if(!authGet()||k==null||k<0)return;cloudDirty.add(k);if(now||Date.now()-cloudLast>CLOUD_GAP)cloudFlush()}
async function cloudFlush(){if(cloudBusy||!cloudDirty.size||!authGet()||!navigator.onLine)return;cloudBusy=true;
  try{const a=loadSlots();for(const k of[...cloudDirty]){if(!a[k]||!a[k].G){cloudDirty.delete(k);continue}slotSid(a,k);await cloudPut(a[k]);cloudDirty.delete(k)}
    cloudLast=Date.now();cloudErr='';if(cloudList)await cloudFetchList().catch(()=>{})}
  catch(e){cloudErr=String(e&&e.message||e);console.warn('雲端存檔上傳失敗，下次存檔再補傳',e)}
  finally{cloudBusy=false;refreshCloudUI()}}
setInterval(()=>{if(cloudDirty.size&&Date.now()-cloudLast>CLOUD_GAP)cloudFlush()},20000);
// 切到別的 App、關掉分頁之前：先存一下、馬上傳（手機上的遊戲常常是直接被關掉的）
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G&&slotIdx>=0&&authGet()&&(mode==='play'||mode==='pause')){saveGame(true);cloudSoon(slotIdx,true)}});
// 剛登入：這台的存檔都傳上去（雲端沒有或這台比較新的），再看雲端有沒有比較新的
async function cloudSyncAll(){if(!authGet())return;try{await cloudFetchList();const a=loadSlots(),by={};for(const c of cloudList)by[c.sid]=c;
  a.forEach((s,k)=>{const sid=slotSid(a,k);if(sid&&(!by[sid]||s.date>by[sid].saved_at))cloudDirty.add(k)});await cloudFlush()}catch(e){cloudErr=String(e&&e.message||e)}refreshCloudUI()}
// 雲端有、但這台沒有或比較舊的存檔
function cloudNewer(){if(!cloudList)return[];const a=loadSlots(),loc={};a.forEach(s=>{if(s&&s.G&&s.G.sid)loc[s.G.sid]=s.date||0});return cloudList.filter(c=>!(c.sid in loc)||c.saved_at>loc[c.sid]+1000)}
async function cloudDownload(sid){toast('下載中…');let d;
  try{const r=await cloudReq('cloud_saves?sid=eq.'+encodeURIComponent(sid)+'&select=data');const a=await r.json();if(!a[0])throw new Error('not found');d=await unpackCode(a[0].data)}
  catch(e){toast(navigator.onLine?'下載失敗，等一下再試':'沒有網路，連上之後再下載','red');return}
  if(!d||!d.G||!SIZES[d.size]){toast('雲端的存檔壞掉了','red');return}if(!d.G.sid)d.G.sid=sid;
  const slots=loadSlots(),k=slots.findIndex(s=>s&&s.G&&s.G.sid===sid);
  const put=i=>{const b=loadSlots();d.locked=!!(b[i]&&b[i].locked);b[i]=d;if(!writeSlots(b))return;slotMode='load';showMenu('slots');toast(EN_ON?'☁ Downloaded into slot '+(i+1):'☁ 下載好了，放在第 '+(i+1)+' 個欄位','gold')};
  if(k<0){importData(d);if(loadSlots().some(x=>x&&x.G&&x.G.sid===sid)){slotMode='load';showMenu('slots')}refreshCloudUI();return}
  if((slots[k].date||0)>(d.date||0)+1000)dialog('這台的存檔比較新','<p>'+(EN_ON?'The save in slot '+(k+1)+' (“'+esc(slots[k].name||'')+'”) is newer than the one in the cloud. Replace it with the cloud one?':'第 '+(k+1)+' 個欄位的「'+esc(slots[k].name||'')+'」比雲端的還新。要換成雲端的嗎？')+'</p>',[['換成雲端的','gold',()=>put(k)],['留著這台的']]);
  else put(k)}
async function cloudRemove(sid){try{await cloudReq('cloud_saves?sid=eq.'+encodeURIComponent(sid),{method:'DELETE'});await cloudFetchList();toast('雲端的存檔刪掉了')}catch(e){toast('刪除失敗，等一下再試','red')}cloudDel.delete(sid);refreshCloudUI()}
// ---------- 畫面：讀取存檔最上面那一列、設定裡的一列、主選單的小標記 ----------
const agoTxt=t=>{const m=Math.round((Date.now()-t)/60000);if(EN_ON)return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago';return m<1?'剛剛':m<60?m+' 分鐘前':m<1440?Math.round(m/60)+' 小時前':Math.round(m/1440)+' 天前'};
const esc=s=>{const d=document.createElement('div');d.textContent=String(s);return d.innerHTML.split(String.fromCharCode(34)).join('&quot;')};
function cloudBoxHTML(){const s=authGet();if(!onlineOn()||(!s&&!cloudReady))return''; // Google 登入還沒打開就先不顯示
  if(!s)return'<div class="slot cloud"><div><b>☁ 雲端存檔</b><div class="meta">用 Google 帳號登入，存檔會自動同步，換手機或電腦也能接著玩。'+(iosApp()?'<br>iPhone 主畫面 App 如果登不進去，請用 Safari 開網頁版登入。':'')+'</div></div><div class="ops"><button class="sbtn gold" data-cloud="login">用 Google 登入</button></div></div>';
  const nw=cloudNewer(),st=cloudBusy?'同步中…':cloudErr?'上次沒傳成功，下次存檔會再補傳':cloudLast?'上次同步：'+agoTxt(cloudLast):cloudList?'已連上雲端':'讀取中…';
  let h='<div class="slot cloud"><div><b>☁ 雲端存檔</b>　<span class="cmail"></span><div class="meta">'+st+'・登入後每次存檔都會自動上傳</div></div><div class="ops"><button class="sbtn" data-cloud="logout">登出</button></div></div>';
  for(const c of nw){const d=new Date(+c.saved_at),here=loadSlots().some(x=>x&&x.G&&x.G.sid===c.sid);
    h+='<div class="slot cloud sub"><div><b class="cname"></b><div class="meta">'+(SIZES[c.size]?SIZES[c.size].name+'・':'')+(d.getMonth()+1)+'月'+d.getDate()+'日 '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+'・'+(here?'雲端的比較新':'這台還沒有')+'</div></div>'+
      '<div class="ops"><button class="sbtn gold" data-cloud="get" data-sid="'+esc(c.sid)+'">下載到這台</button><button class="sbtn'+(cloudDel.has(c.sid)?' arm':'')+'" data-cloud="del" data-sid="'+esc(c.sid)+'">'+(cloudDel.has(c.sid)?'確定刪掉？':'刪除')+'</button></div></div>'}
  return h}
function fillCloudNames(el){const m=el.querySelector('.cmail');if(m)m.textContent=authName();const nw=cloudNewer();el.querySelectorAll('.cname').forEach((b,i)=>{b.textContent=nw[i]?nw[i].name||'存檔':''})}
function refreshCloudUI(){const box=$('cloudBox');if(box){box.innerHTML=cloudBoxHTML();fillCloudNames(box)}
  const set=$('cloudSet');if(set){const s=authGet();set.innerHTML=!onlineOn()?'':s?'<span class="cmail"></span> <button class="sbtn" data-cloud="logout">登出</button>':'<button class="sbtn gold" data-cloud="login">用 Google 登入</button>';fillCloudNames(set)}
  const row=$('cloudRow');if(row)row.classList.toggle('hidden',!onlineOn()||(!cloudReady&&!authGet()));
  const ld=document.querySelector('[data-m="load"]');if(ld){const n=cloudNewer().length;ld.classList.toggle('cnew',n>0);if(n)ld.disabled=false}
  // 主選單「⬇ 下載雲端存檔」：登入後雲端有比這台新的存檔時，才出現金色的大按鈕
  const mc=$('miCloud');if(mc){const n=authGet()?cloudNewer().length:0;mc.classList.toggle('hidden',!onlineOn()||!n);mc.classList.toggle('cnewbig',n>0); // 只有雲端真的有新的存檔可以下載時才出現，平常不佔主選單的位置
    const t=n?(EN_ON?'⬇ Download cloud saves ('+n+')':'⬇ 下載雲端存檔（'+n+'）'):L('☁ 雲端存檔');if(mc.textContent!==t)mc.textContent=t}
  const cp=$('cloudPanel');if(cp&&!cp.classList.contains('hidden'))renderCloudPage()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cloud]');if(!b)return;e.stopPropagation();tone(900,.04,'triangle',.03);const k=b.dataset.cloud,sid=b.dataset.sid;
  if(k==='login')authLogin();else if(k==='logout')authLogout();else if(k==='get')cloudDownload(sid);
  else if(k==='del'){if(!cloudDel.has(sid)){cloudDel.add(sid);refreshCloudUI();return}cloudRemove(sid)}},true);
// ---------- 專門的雲端頁（主選單「☁ 雲端存檔」）：每個雲端存檔一列，下載是大按鈕，手機也好按 ----------
function renderCloudPage(){const el=$('cloudPage');if(!el)return;const s=authGet();
  if(!s){el.innerHTML='<div class="slot cloud"><div><b>☁ 用 Google 帳號登入</b><div class="meta">登入以後，每次存檔都會自動上傳。換手機或電腦登入同一個帳號，就能在這裡下載接著玩。'+(iosApp()?'<br>iPhone 主畫面 App 如果登不進去，請用 Safari 開網頁版登入。':'')+'</div></div></div><button class="btn gold cbig" data-cloud="login">用 Google 登入</button>';return}
  const st=cloudBusy?'同步中…':cloudErr?'上次沒傳成功，下次存檔會再補傳':cloudLast?'上次同步：'+agoTxt(cloudLast):'已連上雲端';
  let h='<div class="slot cloud"><div><b>☁ 雲端存檔</b>　<span class="cmail"></span><div class="meta">'+st+'・登入後每次存檔都會自動上傳</div></div><div class="ops"><button class="sbtn" data-cloud="logout">登出</button></div></div>';
  if(!cloudList){el.innerHTML=h+'<div class="slot"><div class="meta">讀取中…</div></div>';el.querySelector('.cmail').textContent=authName();if(!cloudBusy)cloudFetchList().then(renderCloudPage,()=>{const m=el.querySelector('.slot:last-child .meta');if(m)m.textContent=L(navigator.onLine?'連不上雲端，等一下再試':'沒有網路，連上之後才看得到雲端的存檔')});return}
  if(!cloudList.length)h+='<div class="slot"><div class="meta">雲端還沒有存檔。在別台裝置登入同一個帳號、存一次檔，就會出現在這裡。</div></div>';
  const loc={};loadSlots().forEach(x=>{if(x&&x.G&&x.G.sid)loc[x.G.sid]=x.date||0});
  cloudList.forEach((c,i)=>{const here=c.sid in loc,newer=!here||c.saved_at>loc[c.sid]+1000,d=new Date(+c.saved_at),sid=esc(c.sid);
    h+='<div class="slot cloud crow'+(newer?' cnewrow':'')+'"><div><b class="cpn" data-i="'+i+'"></b><div class="meta">'+(SIZES[c.size]?SIZES[c.size].name+'・':'')+(d.getMonth()+1)+'月'+d.getDate()+'日 '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+'・'+(!here?'這台還沒有':newer?'雲端的比較新':'這台已經是最新的')+'</div></div><div class="ops">'+
      (newer?'<button class="btn gold cbig" data-cloud="get" data-sid="'+sid+'">⬇ 下載到這台</button>':'<span class="cok">✓ 已同步</span>')+
      '<button class="sbtn'+(cloudDel.has(c.sid)?' arm':'')+'" data-cloud="del" data-sid="'+sid+'">'+(cloudDel.has(c.sid)?'確定刪掉？':'刪除')+'</button></div></div>'});
  el.innerHTML=h;el.querySelector('.cmail').textContent=authName();el.querySelectorAll('.cpn').forEach(b=>{const c=cloudList[+b.dataset.i];b.textContent=c?c.name||L('存檔'):''})}
// 開網頁時：剛從 Google 回來就換登入憑證；已經登入的話看看雲端有沒有比較新的存檔
if(onlineOn())cloudFetch(authBase()+'settings',{headers:{apikey:ONLINE.key}}).then(r=>r.json()).then(j=>{cloudReady=!!(j.external&&j.external.google);refreshCloudUI()}).catch(()=>{});
if(onlineOn())authReturn().then(()=>{if(authGet()&&!cloudList)return cloudFetchList()}).catch(()=>{}).then(refreshCloudUI);
