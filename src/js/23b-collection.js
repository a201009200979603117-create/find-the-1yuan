// ================= 一元收藏櫃：抽屜一格一格排好，點開來可以轉著看每一枚；回憶；放大鏡鑑定 =================
const ONE_TIER={2:['常見','#a7adb3'],4:['少見','#6cc26c'],8:['稀有','#58a6ff'],16:['很稀有','#b98cff'],24:['珍貴','#ff9f4a'],48:['傳說','#f2c230']};
let cabTab='one',cvAng=0,cvDrag=null,cvRaf=0,cvFlip=0;
const MEMO_LETTER={glasses:'glasses',passbook:'passbook',photo:'photo',tin:'grandpa',mine:'grandpa'};
// 一枚 1 元的一面（扁平的），帶著這種 1 元的特徵：顏色、偏打、打孔、轉向
function faceCss(t,blur){const S=ONE_STORY[t.id]||['','',''],fl=[S[2]&&S[2]!=='hole'?S[2]:'',blur?'blur('+blur+'px)':''].join(' ').trim();
  return (oneImgURL?'background-image:url('+oneImgURL+');':'')+(fl?'filter:'+fl+';':'')+(S[1]==='offc'?'background-position:35% 40%;background-size:130%;':'')+(S[1]==='rot'?'transform:rotate(90deg);':'')+(S[1]&&S[1].startsWith('skew')?'transform:'+S[1]+';':'')+
    (S[2]==='hole'?'-webkit-mask:radial-gradient(circle,transparent 11%,#000 12%);mask:radial-gradient(circle,transparent 11%,#000 12%);':'')}
function renderCab(){const st=storyOK();if(!st)cabTab='one';G.cabSeen=G.cabSeen||{};
  const memoNew=st&&MEMOS.some(m=>G.story.items[m.id]&&!G.cabSeen['m_'+m.id]);
  $('cabTabs').innerHTML=st?[['one','一元'],['memo','回憶']].map(([k,n])=>'<button class="ctab'+(cabTab===k?' on':'')+'" data-cabtab="'+k+'">'+n+(k==='memo'&&memoNew?'<i></i>':'')+'</button>').join(''):'';
  if(cabTab==='one'){const have=ONE_TYPES.filter(t=>G.coll[t.id]).length;
    $('cabTop').innerHTML='<div class="ctxt"><span>收藏了 <b>'+have+'</b> / '+ONE_TYPES.length+' 種</span><span>總共找到 <b>'+G.onesFound+'</b> 枚 1 元</span></div><div class="cbar"><i style="width:'+(have/ONE_TYPES.length*100).toFixed(1)+'%"></i></div>';
    $('cabList').className='drawers';
    $('cabList').innerHTML=ONE_TYPES.map(t=>{const n=G.coll[t.id]||0,[tn,tc]=ONE_TIER[t.w];
      return '<div class="drawer'+(n?'':' none')+'" data-cab="'+t.id+'" style="--tc:'+tc+'">'+(n&&!G.cabSeen[t.id]?'<span class="nw">NEW</span>':'')+coin3d(t,n,false)+'<div class="lab">'+(n?t.name:'？？？')+'</div><div class="meta"><span class="tier">'+tn+'</span><span class="cnt">'+(n?'×'+n:'1/'+t.w)+'</span></div></div>'}).join('')}
  else{const fr=storyDug();
    $('cabTop').innerHTML='<div class="ctxt"><span>從硬幣山裡找到的東西</span><span>硬幣山挖掉了 <b>'+Math.floor(fr*100)+'%</b></span></div><div class="cbar"><i style="width:'+(fr*100).toFixed(1)+'%"></i></div>';
    $('cabList').className='memos';
    $('cabList').innerHTML=MEMOS.filter(m=>!m.season||G.story.items[m.id]).map(m=>{const got=G.story.items[m.id];
      return '<div class="memo'+(got?'':' none')+'" data-memo="'+m.id+'">'+(got&&!G.cabSeen['m_'+m.id]?'<span class="nw">NEW</span>':'')+'<div class="mi">'+(got?'<img src="'+memoArt(m.id,true)+'">':'<span>？</span>')+'</div><div class="lab">'+(got?m.name:'？？？')+'</div><div class="meta">'+(got?'':m.at==null?'還不知道在哪裡':m.at>=1?'在整座山的最底下':EN_ON?'When '+Math.round(m.at*100)+'% is dug':'挖掉 %s% 的時候'.replace('%s',Math.round(m.at*100)))+'</div></div>'}).join('')}
  renderCabView()}
function renderCabView(){const v=$('cabView');if(!cabSel){v.classList.add('hidden');v.innerHTML='';cvStop();return}v.classList.remove('hidden');
  if(cabSel.startsWith('m_')){cvStop();const m=MEMO[cabSel.slice(2)],got=storyOK()&&G.story.items[m.id],lt=MEMO_LETTER[m.id];
    v.innerHTML='<div class="cv-in memo"><button class="sbtn cv-x" data-cabx>‹ 返回</button><div class="cv-l"><div class="cv-art">'+(got?'<img src="'+memoArt(m.id)+'">':'<span>？</span>')+'</div></div>'+
      '<div class="cv-r"><div class="cv-en">'+(got?'MEMORY':'？？？')+'</div><div class="cv-name">'+(got?m.name:'還沒找到')+'</div>'+
      (got?'<div class="cv-sec"><div>'+m.desc+'</div></div>'+(lt&&G.story.got[lt]?'<button class="sbtn cv-mail" data-readmail="'+lt+'">'+(EN_ON?'✉ Read “'+L(LETTER[lt].title)+'” again':'✉ 再讀一次〈%s〉'.replace('%s',LETTER[lt].title))+'</button>':''):'<div class="cv-sec"><div>繼續挖，總有一天會找到。</div></div>')+'</div></div>';return}
  const t=ONE_TYPES.find(x=>x.id===cabSel);if(!t){cabSel=null;renderCabView();return}
  const n=G.coll[t.id]||0,[tn,tc]=ONE_TIER[t.w],own=n?ownerOf(t.id):null,list=ONE_TYPES.filter(x=>G.coll[x.id]),i=list.indexOf(t),first=(G.oneLog||[]).find(e=>e.id===t.id);
  v.innerHTML='<div class="cv-in" style="--tc:'+tc+'"><button class="sbtn cv-x" data-cabx>‹ 返回</button>'+
    '<div class="cv-l"><div class="cv-coin'+(n?'':' none')+'" id="cvCoin">'+coin3d(t,n,true)+'</div>'+
    (n?'<div class="cv-hint"><button class="sbtn" data-cabflip>↻ 翻面</button><span>'+(TOUCH?'用手指轉一轉':'拖曳可以轉動')+'</span></div>':'')+
    (n&&list.length>1?'<div class="cv-nav"><button class="sbtn" data-cabnav="-1">‹</button><span>'+(i+1)+' / '+list.length+'</span><button class="sbtn" data-cabnav="1">›</button></div>':'')+'</div>'+
    '<div class="cv-r"><div class="cv-en">'+(n?t.en:'？？？')+'</div><div class="cv-name">'+(n?t.name:'還沒找到的 1 元')+'</div>'+
    '<div class="cv-tags"><span class="tier">'+tn+'・機率 1/'+t.w+'</span>'+(n?'<span>收藏了 '+n+' 枚</span>':'')+'</div>'+
    (n?'<div class="cv-sec"><div class="cv-h">加成</div><div class="cv-bo">'+t.bo+'</div></div><div class="cv-sec"><div class="cv-h">錢幣小知識</div><div>'+(ONE_STORY[t.id]||[''])[0]+'</div></div>'+
      (own?'<div class="cv-sec owner"><div class="cv-h">主人的話</div><blockquote>「'+own[1]+'」<cite>'+own[0]+'</cite></blockquote></div>':'')+
      (first?'<div class="cv-foot">'+(EN_ON?'First found '+Math.max(1,Math.round(first.t/60))+' min into the game':'第一次找到：玩到第 %s 分鐘'.replace('%s',Math.max(1,Math.round(first.t/60))))+'</div>':'')
     :'<div class="cv-sec"><div>還沒找到這一種。挖得越多，越有機會遇到它。</div></div>')+'</div></div>';
  cvStart()}
// 大大的 1 元：自己慢慢轉，可以用滑鼠或手指拖著轉，按「翻面」轉到另一面
function cvStart(){const c=$('cvCoin');cvStop();if(!c)return;const ci=c.querySelector('.ci');if(!ci)return;const base=(ci.getAttribute('style')||'').match(/skewY\([^)]*\)/);ci.style.animation='none';
  let last=performance.now();cvFlip=0;cvAng=((cvAng%360)+360)%360;
  const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;if(!cvDrag){if(cvFlip>0){const d=Math.min(cvFlip,dt*600);cvAng+=d;cvFlip-=d}else cvAng+=dt*26}
    ci.style.transform='rotateY('+cvAng.toFixed(1)+'deg)'+(base?' '+base[0]:'');if(c.isConnected)cvRaf=requestAnimationFrame(loop)};cvRaf=requestAnimationFrame(loop);
  c.onpointerdown=e=>{cvDrag={x:e.clientX,a:cvAng};cvFlip=0;try{c.setPointerCapture(e.pointerId)}catch(_){}};c.onpointermove=e=>{if(cvDrag)cvAng=cvDrag.a+(e.clientX-cvDrag.x)*.9};c.onpointerup=c.onpointercancel=()=>{cvDrag=null};c.ondblclick=()=>{cvFlip+=180}}
function cvStop(){cancelAnimationFrame(cvRaf);cvDrag=null}
function cabNav(d){if(!cabSel||cabSel.startsWith('m_'))return;const list=ONE_TYPES.filter(x=>G.coll[x.id]);if(!list.length)return;let i=list.findIndex(x=>x.id===cabSel);i=(i+d+list.length)%list.length;cabSel=list[i].id;G.cabSeen[cabSel]=1;tone(760,.03);renderCab()}
function cabKey(C){if(panel!=='cabPanel'||!cabSel)return false;if(C==='Escape'||C==='Backspace'){cabSel=null;renderCab();return true}
  if(C==='ArrowRight'||C==='KeyD'){cabNav(1);return true}if(C==='ArrowLeft'||C==='KeyA'){cabNav(-1);return true}if(C==='Space'||C==='KeyF'){cvFlip+=180;return true}return false}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cab],[data-cabtab],[data-cabx],[data-cabnav],[data-memo],[data-cabflip]');if(!b||!G||panel!=='cabPanel')return;
  if(b.dataset.cabtab){cabTab=b.dataset.cabtab;cabSel=null;renderCab();tone(700,.03);return}
  if(b.dataset.cabx!==undefined){cabSel=null;renderCab();return}
  if(b.dataset.cabnav){cabNav(+b.dataset.cabnav);return}
  if(b.dataset.cabflip!==undefined){cvFlip+=180;return}
  if(b.dataset.memo){cabSel='m_'+b.dataset.memo;if(G.story&&G.story.items[b.dataset.memo])G.cabSeen[cabSel]=1;renderCab();tone(820,.04);return}
  if(b.dataset.cab){cabSel=b.dataset.cab;if(G.coll[cabSel])G.cabSeen[cabSel]=1;cvAng=0;renderCab();tone(820,.04)}});

// ---------- 放大鏡鑑定 ----------
// 新的 1 元：拿放大鏡在模糊的硬幣上找 3 個特徵（亮亮的地方），看完就知道是哪一種。重複的直接收好，不打斷你。
const AP_Z=2.3;
const AP_TRAIT={bent:'整枚有一點彎，放在桌上會晃',worn:'花紋和字都磨淡了',shiny:'亮得可以照出你的眼睛',scratch:'表面有一道一道的刮痕',old:'圖案跟現在的不太一樣',green:'縫隙裡長了綠綠的銅綠',
  red:'顏色特別紅',plum:'梅花的紋路特別清楚',burnt:'顏色又黑又暗，像被火烤過',holed:'中間被打了一個洞',black:'黑得發亮，像一面小鏡子',twin:'翻過來……還是同一面！',
  pure:'顏色很純，像剛熔好的銅',y1960:'字體很古老，是早年的一圓',proof:'表面像鏡子一樣，連指紋都看得到',mint:'邊緣一點磨損都沒有',offc:'圖案偏到一邊去了',sealed:'外面包著一層透明的膜',
  magnet:'放大鏡的鐵框好像被它吸過去了',rare:'這個年份很少見',error:'正面和背面的方向對不上',gold:'金黃色的，邊緣好像刻著一個小字',pattern:'顏色灰灰的，跟一般的不一樣',memo:'背面的圖案很特別'};
const AP_MINOR=['邊緣的齒紋很整齊','上面有一個小小的指紋','沾了一點點灰塵','「1」的數字很清楚','摸起來涼涼的','亮光底下有細細的紋路'];
function apYear(t){const y=t.id==='y1960'?49:t.id==='old'?50+Math.floor(Math.random()*20):70+Math.floor(Math.random()*44);
  if(t.id==='pattern')return'年份：沒有刻年份';if(t.id==='memo')return'背面：紀念的圖案';return EN_ON?'Year: '+(1911+y):'年份：民國 %s 年'.replace('%s',y)}
let appr=null;
function startAppraise(t,isNew){if(!isNew){dupFound(t);return}
  appr={t,isNew,found:0,done:false,spots:[],clues:[AP_MINOR[Math.floor(Math.random()*AP_MINOR.length)],apYear(t),AP_TRAIT[t.id]||''],tx:0,ty:0,lx:0,ly:0,last:performance.now()};mode='appraise';unlock();
  const el=$('appraise');
  el.innerHTML='<div class="ap-t">放大鏡鑑定</div><div class="ap-s" id="apS">'+(TOUCH?'用手指拖著放大鏡':'移動滑鼠拿著放大鏡')+'，找出這枚 1 元的 3 個特徵</div>'+
    '<div class="ap-row"><div class="ap-stage" id="apStage"><div class="ap-coin" id="apCoin"><div class="ap-face blur" id="apBlur" style="'+faceCss(t,9)+'"></div></div>'+
    '<div class="ap-lens" id="apLens"><div class="ap-glass"><div class="ap-zoom" id="apZoom"><div class="ap-face" style="'+faceCss(t)+'"></div></div><div class="ap-glare"></div></div><div class="ap-handle"></div></div>'+
    '<div class="ap-seal hidden" id="apSeal"><b>鑑定</b></div></div>'+
    '<div class="ap-clues"><div class="ap-ch">特徵</div>'+[0,1,2].map(i=>'<div class="ap-clue" id="apCl'+i+'"><i>'+(i+1)+'</i><span>？</span></div>').join('')+'</div></div>'+
    '<button class="sbtn ap-skip" id="apSkip">直接看結果'+(TOUCH?'':'（E）')+'</button>';
  el.classList.remove('hidden');$('apSkip').onclick=e=>{e.stopPropagation();apReveal()};
  const c=$('apCoin').getBoundingClientRect();appr.tx=appr.lx=c.left+c.width*.92;appr.ty=appr.ly=c.top+c.height*.9;
  const pts=[];for(let k=0;k<300&&pts.length<3;k++){const a=Math.random()*6.283,d=.12+Math.random()*.24,fx=.5+Math.cos(a)*d,fy=.5+Math.sin(a)*d;if(pts.every(p=>Math.hypot(p.fx-fx,p.fy-fy)>.24))pts.push({fx,fy,dw:0,ok:false})}
  while(pts.length<3)pts.push({fx:.3+pts.length*.2,fy:.5,dw:0,ok:false});
  for(const p of pts){const s=document.createElement('div');s.className='ap-spot';s.style.left=p.fx*100+'%';s.style.top=p.fy*100+'%';s.style.animationDelay=(-Math.random()*2).toFixed(2)+'s';$('apCoin').appendChild(s);p.el=s}
  appr.spots=pts;requestAnimationFrame(apLoop)}
function apLoop(){const a=appr;if(!a||a.done)return;const now=performance.now(),dt=Math.min(.05,(now-a.last)/1000);a.last=now;const c=$('apCoin'),lens=$('apLens'),st=$('apStage');if(!c)return;
  const r=c.getBoundingClientRect(),sr=st.getBoundingClientRect(),cs=r.width,R=lens.offsetWidth/2;
  a.lx+=(a.tx-a.lx)*Math.min(1,dt*16);a.ly+=(a.ty-a.ly)*Math.min(1,dt*16);
  lens.style.transform='translate('+(a.lx-sr.left-R).toFixed(1)+'px,'+(a.ly-sr.top-R).toFixed(1)+'px)';
  const lx=a.lx-r.left,ly=a.ly-r.top,z=$('apZoom');z.style.width=z.style.height=cs*AP_Z+'px';z.style.left=(R-lx*AP_Z).toFixed(1)+'px';z.style.top=(R-ly*AP_Z).toFixed(1)+'px';
  for(const p of a.spots){if(p.ok)continue;if(Math.hypot(lx-p.fx*cs,ly-p.fy*cs)<cs*.12){p.dw+=dt;p.el.classList.add('warm');p.el.style.setProperty('--k',Math.min(1,p.dw/.5).toFixed(2));if(p.dw>=.5)apFind(p)}
    else if(p.dw>0){p.dw=Math.max(0,p.dw-dt*.6);p.el.style.setProperty('--k',(p.dw/.5).toFixed(2));if(!p.dw)p.el.classList.remove('warm')}}
  if(!a.done)requestAnimationFrame(apLoop)}
function apFind(p){const a=appr;p.ok=true;a.found++;p.el.className='ap-spot ok';p.el.textContent=a.found;const cl=$('apCl'+(a.found-1));cl.classList.add('ok');cl.querySelector('span').textContent=a.clues[a.found-1];
  tone(760+a.found*180,.12,'triangle',.05);if(a.found>=3)setTimeout(apReveal,420)}
function apReveal(){const a=appr;if(!a||a.done)return;a.done=true;
  a.spots.forEach((p,i)=>{if(!p.ok){p.ok=true;p.el.className='ap-spot ok';p.el.textContent=i+1}});[0,1,2].forEach(i=>{const cl=$('apCl'+i);if(cl){cl.classList.add('ok');cl.querySelector('span').textContent=a.clues[i]}});
  $('apLens').classList.add('gone');$('apBlur').style.cssText=faceCss(a.t);$('apBlur').classList.remove('blur');$('apCoin').classList.add('clear');
  const s=$('apSeal');s.classList.remove('hidden');$('apS').textContent='是「'+a.t.name+'」！';tone(140,.18,'sine',.08);setTimeout(()=>tone(1100,.12),120);
  setTimeout(()=>{$('appraise').classList.add('hidden');if(appr!==a)return;appr=null;showCard(a.t,a.isNew);chime()},1600)}
function apAim(x,y){if(appr&&!appr.done){appr.tx=x;appr.ty=y}}
addEventListener('mousemove',e=>{if(mode==='appraise')apAim(e.clientX,e.clientY)});
for(const ev of['touchstart','touchmove'])addEventListener(ev,e=>{if(mode==='appraise'&&e.touches[0])apAim(e.touches[0].clientX,e.touches[0].clientY-72)},{passive:true});
// 重複的 1 元：收進櫃子、賣給收藏家，用一行提示就好
function dupFound(t){toast(EN_ON?'🪙 Another '+L(t.name)+' — a collector bought it for '+money(10*t.w):'🪙 又一枚「%s」，收藏家出價 %s 買走了'.replace('%s',t.name).replace('%s',money(10*t.w)),'gold');tone(1180,.08,'triangle',.04);setTimeout(()=>tone(1570,.12,'triangle',.035),90)}
