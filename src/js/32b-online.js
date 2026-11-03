// ================= 線上排行榜（每日挑戰）：成績放在 Supabase =================
// 網址和金鑰是給網頁用的公開金鑰（publishable／anon），能做什麼由 supabase/leaderboard.sql 的權限決定。
// 只收每日挑戰：同一天每個人的硬幣堆都一樣，比起來才公平。兩個都空著的話，線上的功能都不會出現。
const ONLINE={url:'https://qkjylbmtrpdneasvnvnm.supabase.co',key:'sb_publishable_XAPs2IzTPXIjZeszHu32xg_sGOHK4SW'};
const onlineOn=()=>!!(ONLINE.url&&ONLINE.key),onlineBase=()=>ONLINE.url.replace(/\/rest\/v1\/?$/,'').replace(/\/$/,'')+'/rest/v1/';
function onlineHeaders(json){const h={apikey:ONLINE.key};if(!/^sb_/.test(ONLINE.key))h.Authorization='Bearer '+ONLINE.key;if(json){h['Content-Type']='application/json';h.Prefer='return=minimal'}return h}
function playerId(){let p='';try{p=localStorage.getItem('ft1y_pid')||''}catch(e){}if(!p){p=crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36);try{localStorage.setItem('ft1y_pid',p)}catch(e){}}return p}
function playerName(){try{return localStorage.getItem('ft1y_name')||''}catch(e){return''}}
const cleanName=s=>String(s||'').replace(/[<>]/g,'').trim().slice(0,16);
async function onlineGet(q,extra){const r=await fetch(onlineBase()+q,{headers:{...onlineHeaders(),...extra||{}}});if(!r.ok)throw new Error('HTTP '+r.status);return r}
const onlineTop=(board,n)=>onlineGet('best_scores?board=eq.'+board+'&select=name,seconds,player&order=seconds.asc,created_at.asc&limit='+(n||20)).then(r=>r.json());
// 排第幾名：比我快的人數＋1
const onlineRank=(board,sec)=>onlineGet('best_scores?board=eq.'+board+'&seconds=lt.'+sec+'&select=player&limit=1',{Prefer:'count=exact'}).then(r=>{const c=r.headers.get('content-range');return c&&/\/\d+$/.test(c)?+c.split('/')[1]+1:null});
async function onlineSubmit(board,sec,name){const r=await fetch(onlineBase()+'scores',{method:'POST',headers:onlineHeaders(true),body:JSON.stringify({board,seconds:sec,name,player:playerId()})});
  if(!r.ok)throw new Error('HTTP '+r.status+' '+(await r.text()).slice(0,160))}
// 取暱稱：第一次上傳時問，之後記在瀏覽器裡
function askName(then){
  dialog('線上排行榜','<p style="text-align:left">取一個暱稱放在排行榜上（最多 16 個字，不要用真實姓名）。</p><input id="nameIn" maxlength="16" autocomplete="off">',
    [['確定','gold',()=>{const v=cleanName($('nameIn').value);if(!v){toast('先取一個暱稱');return}try{localStorage.setItem('ft1y_name',v)}catch(e){}then(v)}],['先不要']]);
  $('nameIn').value=playerName();setTimeout(()=>{try{$('nameIn').focus()}catch(_){}},50)}
function uploadDaily(board,sec){if(!onlineOn())return;
  const go=name=>{toast('上傳中…');onlineSubmit(board,sec,name).then(()=>onlineRank(board,sec)).then(k=>{toast(k?'上傳好了！你今天排第 '+k+' 名':'上傳好了！','gold');G&&(G.flags.online=true)})
    .catch(e=>{toast(navigator.onLine?'上傳失敗，等一下再試試看':'沒有網路，連上之後再上傳','red');console.warn('上傳成績失敗',e)})};
  const n=playerName();if(n)go(n);else askName(go)}
// 主選單「排行榜」最上面：今天的線上排行。暱稱用文字節點放，英文版不會去翻別人的名字
function renderOnline(){if(!onlineOn())return;const k=dailyKey(),box=document.createElement('div');box.className='slot';box.id='onlineRank';
  box.innerHTML='<div style="width:100%"><b>🌐 線上排行・每日挑戰 '+dayLbl(k)+'</b><div class="meta" id="onlineList">讀取中…</div></div>';
  const old=$('onlineRank');if(old)old.remove();$('rankList').prepend(box);
  onlineTop(k,20).then(rows=>{const el=$('onlineList');if(!el)return;el.textContent='';
    if(!rows.length){el.textContent='今天還沒有人上傳，完成每日挑戰就能當第一名。';return}
    const me=playerId();rows.forEach((r,i)=>{const d=document.createElement('div');d.style.cssText='display:flex;gap:10px;word-spacing:normal'+(r.player===me?';color:var(--gold);font-weight:700':'');
      const a=document.createElement('span');a.style.minWidth='2.2em';a.appendChild(document.createTextNode('#'+(i+1)));const b=document.createElement('span');b.style.flex='1';b.appendChild(document.createTextNode(r.name));
      const c=document.createElement('span');c.appendChild(document.createTextNode(fmtT(r.seconds)));d.append(a,b,c);el.appendChild(d)});
    const nm=document.createElement('button');nm.className='sbtn';nm.style.marginTop='6px';nm.textContent='改暱稱';nm.onclick=e=>{e.stopPropagation();askName(()=>toast('暱稱改好了，下次上傳會用新的'))};el.appendChild(nm)})
  .catch(()=>{const el=$('onlineList');if(el)el.textContent=navigator.onLine?'連不上線上排行榜，等一下再看看。':'沒有網路，連上之後才看得到線上排行榜。'})}
