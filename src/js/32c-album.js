// ================= 相簿：拍照模式存的照片，遊戲裡也收一份（存在這台裝置的瀏覽器裡，不會上傳） =================
// 主選單和暫停選單都打得開；點一張可以放大看、左右翻、存到裝置、刪掉（要按兩次才會刪）。
const ALB_MAX=200;let ALB_DB='fty1-album',albDB=null,albList=[],albSel=-1,albURLs=[],albDelArm=false;
function albOpen(){if(albDB)return albDB;albDB=new Promise((ok,no)=>{try{const r=indexedDB.open(ALB_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('p',{keyPath:'t'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}});
  albDB.catch(()=>{albDB=null});return albDB}
function albReq(mode,f){return albOpen().then(db=>new Promise((ok,no)=>{const tx=db.transaction('p',mode),r=f(tx.objectStore('p'));let out;if(r)r.onsuccess=()=>{out=r.result};tx.oncomplete=()=>ok(out);tx.onerror=tx.onabort=()=>no(tx.error)}))}
const albAll=()=>albReq('readonly',st=>st.getAll()).then(a=>(a||[]).sort((x,y)=>y.t-x.t));
const albCount=()=>albReq('readonly',st=>st.count());
const albDel=t=>albReq('readwrite',st=>st.delete(t));
// 存圖的時候：縮成 1280 寬的 JPEG（看大圖、存到裝置）和 360 寬的小圖（排在相簿裡）
function albAdd(url,meta){return new Promise(ok=>{const im=new Image();im.onerror=()=>ok(false);
  im.onload=()=>{const shrink=(w,q)=>new Promise(r=>{const s=Math.min(1,w/im.width),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>r(b),'image/jpeg',q)});
    Promise.all([shrink(1280,.88),shrink(360,.8)]).then(([big,th])=>{if(!big||!th)return ok(false);
      return albCount().then(n=>n>=ALB_MAX?ok('full'):albReq('readwrite',st=>st.put({t:Date.now(),big,th,...meta})).then(()=>ok(true)))}).catch(()=>ok(false))};
  im.src=url})}
const albStamp=t=>{const d=new Date(t),z=n=>String(n).padStart(2,'0');return d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+'_'+z(d.getHours())+z(d.getMinutes())+z(d.getSeconds())};
const albDate=t=>{const d=new Date(t),z=n=>String(n).padStart(2,'0');return d.getFullYear()+'/'+z(d.getMonth()+1)+'/'+z(d.getDate())+' '+z(d.getHours())+':'+z(d.getMinutes())};
function openAlbum(){albSel=-1;albDelArm=false;$('album').classList.remove('hidden');return albRender()}
function closeAlbum(){$('album').classList.add('hidden');albURLs.forEach(u=>URL.revokeObjectURL(u));albURLs=[];albList=[];$('alGrid').innerHTML='';$('alView').innerHTML=''}
const albOn=()=>!$('album').classList.contains('hidden');
async function albRender(){let a;try{a=await albAll()}catch(e){$('alN').textContent='';$('alGrid').innerHTML='<div class="al-none">這個瀏覽器存不了相簿（可能是無痕模式）。<br>照片還是會存到裝置裡。</div>';albList=[];albSel=-1;albShow();return}
  albURLs.forEach(u=>URL.revokeObjectURL(u));albURLs=[];albList=a;if(albSel>=a.length)albSel=a.length-1;
  $('alN').textContent=a.length?(EN_ON?a.length+(a.length>1?' photos':' photo'):a.length+' 張'):'';
  $('alGrid').innerHTML=a.length?a.map((p,i)=>{const u=URL.createObjectURL(p.th);albURLs.push(u);return '<button class="al-it" data-al="'+i+'"><img src="'+u+'" alt=""><span>'+albDate(p.t)+'</span></button>'}).join('')
    :'<div class="al-none">'+(TOUCH?'還沒有照片。<br>點左上角的 📷 進入拍照模式，再點「存圖」拍一張。':'還沒有照片。<br>按 P 進入拍照模式，按 Enter 拍一張。')+'</div>';
  albShow()}
function albShow(){const v=$('alView'),p=albList[albSel];if(!p){v.classList.add('hidden');v.innerHTML='';$('alGrid').classList.remove('hidden');return}
  $('alGrid').classList.add('hidden');v.classList.remove('hidden');const u=URL.createObjectURL(p.big);albURLs.push(u);
  v.innerHTML='<div class="al-img"><img src="'+u+'" alt=""></div><div class="al-bar"><button class="sbtn" data-alk="back">‹ 返回</button><span class="al-meta">'+albDate(p.t)+(p.fx&&p.fx!=='原色'?'・'+L(p.fx):'')+(p.name?'・'+p.name:'')+'</span><span class="sp"></span>'+
    (albList.length>1?'<button class="sbtn" data-alk="prev">‹</button><span class="al-i">'+(albSel+1)+' / '+albList.length+'</span><button class="sbtn" data-alk="next">›</button>':'')+
    '<button class="sbtn" data-alk="save">💾 存到裝置</button><button class="sbtn al-del'+(albDelArm?' arm':'')+'" data-alk="del">'+(albDelArm?'確定刪掉？':'🗑 刪掉')+'</button></div>'}
function albNav(d){if(albList.length<2||albSel<0)return;albSel=(albSel+d+albList.length)%albList.length;albDelArm=false;albShow()}
async function albAct(k){const p=albList[albSel];
  if(k==='back'){albSel=-1;albDelArm=false;albShow()}else if(k==='prev')albNav(-1);else if(k==='next')albNav(1);
  else if(k==='save'&&p)giveFile(new File([p.big],'大海撈一元_'+albStamp(p.t)+'.jpg',{type:'image/jpeg'}),'照片存好了');
  else if(k==='del'&&p){if(!albDelArm){albDelArm=true;albShow();return}albDelArm=false;try{await albDel(p.t)}catch(e){}await albRender();if(!albList.length)albSel=-1;albShow();toast('照片刪掉了')}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-al],[data-alk],#alX');if(!b||!albOn())return;tone(800,.03,'triangle',.03);
  if(b.id==='alX'){closeAlbum();return}if(b.dataset.al!=null){albSel=+b.dataset.al;albDelArm=false;albShow();return}albAct(b.dataset.alk)});
$('album').addEventListener('click',e=>{if(e.target.id==='album')closeAlbum()});
// 相簿打開的時候，鍵盤只給相簿用：Esc 返回或關掉，左右翻
document.addEventListener('keydown',e=>{if(!albOn())return;e.stopPropagation();const C=e.code;
  if(C==='Escape'||C==='Backspace'){e.preventDefault();if(albSel>=0)albAct('back');else closeAlbum()}
  else if(C==='ArrowLeft'||C==='KeyA')albNav(-1);else if(C==='ArrowRight'||C==='KeyD')albNav(1)},true);
$('pAlbum').onclick=()=>openAlbum();
// 存圖時閃一下（像相機的快門）
function shutterFx(){const f=$('shutter');f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
