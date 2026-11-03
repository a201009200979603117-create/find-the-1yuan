// ================= 主選單 =================
let slotMode='new';
function showMenu(w){
  $('mainList').classList.toggle('hidden',w!=='main');$('social').classList.toggle('hidden',w!=='main');
  $('slotPanel').classList.toggle('hidden',w!=='slots');$('sizePanel').classList.toggle('hidden',w!=='size');$('rankPanel').classList.toggle('hidden',w!=='rank');
  if(w==='slots')renderSlots();
  if(w==='size')$('sizeList').innerHTML=Object.entries(SIZES).map(([k,s])=>'<div class="size" data-size="'+k+'"><div class="n">'+s.name+'</div><div class="d">'+s.d+'　'+s.info+'</div></div>').join('');
  if(w==='rank'){setTimeout(()=>{const b=chalBest(),rows=Object.keys(SIZES).filter(k=>b[k]&&b[k].length).map(k=>'<div class="slot"><div><b>⏱ 挑戰・'+SIZES[k].name+'</b><div class="meta">最佳紀錄：'+b[k].map(fmtT).join('、')+'</div></div></div>').join('');const dr=dailyRow();if(rows||dr)$('rankList').insertAdjacentHTML('afterbegin',dr+rows);renderOnline()},0);const a=loadSlots().filter(Boolean).sort((x,y)=>(y.G.onesFound-x.G.onesFound)||(y.G.dug-x.G.dug));$('rankList').innerHTML=a.length?a.map((s,k)=>'<div class="slot"><div><b>#'+(k+1)+'　'+(s.name||'')+'</b><div class="meta">'+s.G.onesFound+' 枚 1 元　挖了 '+fmtS(s.G.dug)+' 枚　賺了 '+money(s.G.earned)+'　'+SIZES[s.size].name+'　玩了 '+Math.floor(s.G.play/60)+' 分鐘</div></div></div>').join(''):'<div class="slot"><div class="meta">還沒有紀錄</div></div>'}
  const has=loadSlots().some(Boolean);document.querySelector('[data-m="load"]').disabled=!has;
}
function renderSlots(){
  const a=loadSlots();$('slotTitle').textContent=slotMode==='new'?'選一個存檔欄位開新局':'讀取存檔';
  let h='';
  a.forEach((s,k)=>{if(!s)return;const d=new Date(s.date);
    h+='<div class="slot" data-slot="'+k+'"><div><b>'+(s.name||'存檔欄位'+(k+1))+'</b><div class="meta">'+money(s.G.money||0)+' '+(s.G.onesFound||0)+'枚1元 挖了'+fmtS(s.G.dug||0)+'枚 還剩'+fmtS(s.G.left)+' '+SIZES[s.size].name+' '+(d.getMonth()+1)+'月'+d.getDate()+'日 '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+'</div></div><div class="ops"><button class="sbtn" data-ren="'+k+'">改名</button><button class="sbtn" data-export="'+k+'">匯出</button><button class="sbtn" data-bk="'+k+'">備份</button><button class="sbtn" data-lock="'+k+'">'+(s.locked?'🔒 解鎖':'鎖定')+'</button><button class="sbtn" data-del="'+k+'"'+(s.locked?' disabled title="鎖定的存檔不能刪除"':'')+'>刪除</button></div></div>'});
  if(slotMode==='new')h+='<div class="slot new" data-newslot="1"><div><b>新遊戲</b><div class="meta">在這裡開新局</div></div></div>';
  if(!h)h='<div class="slot"><div class="meta">還沒有存檔</div></div>';
  h+='<div class="slot" data-import="1"><div><b>📂 匯入存檔</b><div class="meta">從別台裝置帶過來的存檔檔案或存檔碼</div></div></div>';
  $('slotList').innerHTML=h;
}
function dialog(title,body,btns){$('dlgT').textContent=title;$('dlgB').innerHTML=body;$('dlgR').innerHTML='';btns.forEach(([t,cls,fn])=>{const b=document.createElement('button');b.className='btn '+(cls||'');b.textContent=t;b.onclick=()=>{$('dialog').classList.add('hidden');fn&&fn()};$('dlgR').appendChild(b)});$('dialog').classList.remove('hidden')}
const HELP='<p style="text-align:left"><b>W A S D</b> 移動、<b>Shift</b> 跑、<b>C</b> 蹲著走（手上的硬幣不會灑）、<b>空白鍵</b> 跳（有噴射背包就按住往上飛）、滑鼠轉視角<br>挖硬幣會耗體力，拿著硬幣跑步或跳起來落地會灑出來<br><b>左鍵</b> 按住拿硬幣　<b>右鍵</b> 丟硬幣（對準收購站進料口就是賣）<br><b>E</b> 開門、五金行、訂單板、一元收藏櫃<br><b>1～0</b> 換工具、<b>Q</b> 把工具放到地上、<b>F</b> 丟出去、<b>E</b> 撿回來<br><b>Tab</b> 科技樹、<b>B</b> 建造目錄（R 旋轉、X 拆除、滾輪或 C／V 拉近推遠、PageUp／PageDown 架高、F 吸附）<br><b>滑鼠中鍵</b> 複製看著的建築、看著輸送帶<b>按住 E</b> 把它反過來、看著機器按 <b>E</b> 開設定<br><b>L</b> 手電筒、<b>P</b> 拍照模式、<b>M</b> 俯瞰模式、<b>O</b> 機器狀態、<b>J</b> 成就與統計、<b>Ctrl+Z</b> 復原、建造時 <b>N</b> 藍圖（框選整組複製）、<b>F4</b> 隱藏介面、<b>F5</b> 存檔、<b>Esc</b> 暫停</p>';
function openSettings(){$('sLang').value=LANG;$('sMus').value=SET.music;$('sAmb').value=SET.amb??.6;$('sSens').value=SET.sens;$('sVol').value=SET.vol;$('sFov').value=SET.fov;$('sRes').value=String(SET.res);$('sShadowQ').value=String(SET.shadowQ);$('sCoinQ').value=String(SET.coinQ);$('sFps').checked=!!SET.fps;$('sVib').checked=SET.vib!==false;$('sEco').checked=!!SET.eco;$('sFz').value=String(SET.fz||1);$('sUltra').checked=!!SET.ultra;$('sVib').closest('.setrow').style.display=TTON&&navigator.vibrate?'':'none';$('sDay').checked=SET.daynight!==false;$('sMusS').value=SET.musicStyle||'soft';$('sTouch').value=SET.touch||'auto';keyWait=null;renderKeys();$('sWx').checked=SET.weather!==false;$('setPanel').classList.remove('hidden')}
$('sLang').addEventListener('change',()=>{SET.lang=$('sLang').value;applySet();const e=SET.lang==='en';dialog(e?'Language':'語言','<p>'+(e?'Reload the page to switch to English.':'重新整理頁面之後就會換成中文。')+'</p>',[[e?'Reload now':'現在重新整理','gold',()=>{if(G)saveGame(true);location.reload()}],[e?'Later':'等一下']])});
$('sTouch').addEventListener('change',()=>{SET.touch=$('sTouch').value;applySet();dialog('觸控操作','<p>重新整理頁面之後才會套用。</p>',[['現在重新整理','gold',()=>{if(G)saveGame(true);location.reload()}],['等一下']])});
['sSens','sVol','sAmb','sMus','sMusS','sFov','sRes','sShadowQ','sCoinQ','sFps','sDay','sWx','sVib','sEco','sFz','sUltra'].forEach(id=>$(id).addEventListener('input',()=>{SET.ultra=$('sUltra').checked;SET.vib=$('sVib').checked;SET.eco=$('sEco').checked;SET.fz=+$('sFz').value;SET.musicStyle=$('sMusS').value;musT=0;SET.daynight=$('sDay').checked;SET.weather=$('sWx').checked;SET.music=+$('sMus').value;SET.sens=+$('sSens').value;SET.vol=+$('sVol').value;SET.amb=+$('sAmb').value;SET.fov=+$('sFov').value;SET.res=$('sRes').value==='auto'?'auto':+$('sRes').value;SET.shadowQ=+$('sShadowQ').value;SET.coinQ=+$('sCoinQ').value;SET.fps=$('sFps').checked;applySet()}));
$('setClose').onclick=()=>$('setPanel').classList.add('hidden');
$('menu').addEventListener('click',e=>{
  const t=e.target.closest('[data-m],[data-slot],[data-newslot],[data-size],[data-ren],[data-del],[data-lock],[data-export],[data-bk],[data-import]');if(!t)return;
  if(t.dataset.export!==undefined){e.stopPropagation();exportSlot(+t.dataset.export);return}
  if(t.dataset.bk!==undefined){e.stopPropagation();showBackups(+t.dataset.bk);return}
  if(t.dataset.import){importSave();return}
  if(t.dataset.lock!==undefined){e.stopPropagation();const k=+t.dataset.lock,a=loadSlots();a[k].locked=!a[k].locked;writeSlots(a);renderSlots();return}
  tone(900,.04,'triangle',.03);
  const m=t.dataset.m;
  if(m==='new'){slotMode='new';showMenu('slots')}
  else if(m==='daily')startDaily();
  else if(m==='load'){slotMode='load';showMenu('slots')}
  else if(m==='main')showMenu('main');
  else if(m==='slots')showMenu('slots');
  else if(m==='rank')showMenu('rank');
  else if(m==='set')openSettings();
  else if(m==='quit')dialog('離開遊戲','<p>網頁版沒辦法自己關掉視窗，直接關掉這個分頁就可以了。存檔都已經存好。</p>',[['好','gold']]);
  else if(m==='help')dialog('操作說明',TTON?HELP_T:HELP,[['知道了','gold']]);
  else if(m==='news')dialog('更新紀錄','<p style="text-align:left">V2.8：線上排行榜——每日挑戰完成後可以取個暱稱上傳成績，主選單的排行榜最上面看今天全世界的前 20 名。<br>V2.7：英文版（瀏覽器不是中文的話自動用英文，設定裡可以切換語言）；程式拆成好幾個檔案整理，由 build.py 組回單一檔案。<br>V2.6：電腦版設定多了「極高畫質」：用螢幕原本的解析度，硬幣之間、機器腳邊和牆角多了環境光遮蔽的暗影，畫面更有立體感（很吃效能）。<br>V2.5：建造目錄多了「裝飾」：盆栽、小花圃、長椅、紅燈籠、招財貓，不用解鎖；坐在長椅上可以休息，體力回得比較快；玩一陣子會有貓跑進院子，可以摸摸牠；晚上偶爾有流星，白天雨停之後會出現彩虹；多了 6 個成就。<br>V2.4：挑戰朋友（挑戰成功後產生連結，朋友打開就是同一座硬幣堆，完成時比較誰快）；每日挑戰記錄連續天數，多兩個連續天數的成就；設定多了字體大小（標準、大、特大）。<br>V2.3：遊戲出錯時畫面上會跳「點這裡回報」，可以一鍵複製錯誤資訊；「回報問題」也能複製裝置和遊戲資訊、直接到 GitHub 回報；一格畫面出錯不會再讓整個遊戲卡住；設定多了省電模式（每秒 30 格，手機比較不會燙）；打開時會顯示載入中，3D 引擎下載失敗會自動換一個來源，真的載入不了會說明原因。<br>V2.2：每日挑戰（每天一座一樣的硬幣堆，計時找出所有的 1 元，紀錄記在排行榜）；成績分享圖（挑戰成功、挖完硬幣堆、成就與統計都能分享）；手機找到 1 元、完成訂單、買到科技、拿到成就會震動（設定可以關）；網頁版更新了會提示，點一下就換新版。<br>V2.1：手機版重做——搖桿按哪裡就出現在哪裡、右下圍成一圈的按鍵、左上工具列、點一下選工具；建造時有架高、降低、方格、復原、藍圖、拉近推遠、取消，看著建築可以複製，建造目錄長按加到快捷欄；教學和提示改成按鈕說法；所有面板改成手機專用排法（科技樹左邊分類、中間小卡片，多一個「買得起」分類；建造目錄一次看得到三排；機器設定從下方拉出；設定兩欄、暫停大按鈕）；進遊戲自動全螢幕並鎖橫向，可以加入主畫面；加入主畫面後沒網路也能玩；拍照和匯出存檔在手機上改用分享選單（存到相簿、存到檔案、傳 LINE），多了存檔碼，複製貼上就能把存檔搬到別台裝置。雙手和所有工具照真實比例重做，有挖、丟、倒、掃的動作；走到機器上不會再卡住；水桶不會破圖。<br>V2：數值改成原作（遊戲資料）；24 種 1 元；第五種尺寸 The Mountain；體力、灑出來、蹲著走、噴射背包；壓縮機、包裝機、造粒機、圓盤壓製機、紙漿機、造紙機、筒倉、燃氣發電廠；抽水機和水管；T 型接頭、閘門、封閉式輸送帶、分流器優先、手臂連輸送帶；地下電纜箱、開關箱、用電警示；衛星天線、精準定位；平台、樓梯、欄杆、牆、屋頂、升降機、架高輸送帶；工作燈、油漆板；訂單時間限制；音效和背景音樂；教學照原作改成 46 步。<br>V1：照《Find The Needle》試玩版的流程做的台幣版。硬幣當乾草、1 元當針。</p>',[['好','gold']]);
  else if(m==='bug')openReport();
  else if(t.dataset.ren!==undefined){e.stopPropagation();const k=+t.dataset.ren,a=loadSlots(),n=prompt('存檔名稱',a[k].name||'');if(n){a[k].name=n.slice(0,20);writeSlots(a);renderSlots()}}
  else if(t.dataset.del!==undefined){e.stopPropagation();const k=+t.dataset.del;if(loadSlots()[k].locked){toast('這個存檔鎖定了，先解鎖才能刪除');return}dialog('刪除存檔','<p>確定要刪除「'+(loadSlots()[k].name||'存檔欄位'+(k+1))+'」嗎？刪掉就救不回來了。</p>',[['先不要'],['刪除','gold',()=>{const a=loadSlots();a[k]=null;writeSlots(a);renderSlots()}]])}
  else if(t.dataset.slot!==undefined){const k=+t.dataset.slot;startGame(k,loadSlots()[k])}
  else if(t.dataset.newslot){const a=loadSlots();if(a.indexOf(null)<0&&a.length>=3){dialog('存檔欄位滿了','<p>三個存檔欄位都用掉了，先刪掉一個再開新局。</p>',[['好','gold']]);return}showMenu('size')}
  else if(t.dataset.size){
    const k=t.dataset.size,go0=gm=>{const a=loadSlots();let s=a.indexOf(null);if(s<0)s=a.length;startGame(s,{name:'存檔欄位'+(s+1),size:k,seed:(Math.random()*2**31)|0,gmode:gm})};
    const go=()=>dialog('選擇模式','<p style="text-align:left"><b>一般</b>：照原作的玩法。<br><b>挑戰</b>：計時，看多快能找出所有的 1 元，最佳紀錄會記在排行榜。<br><b>無盡</b>：硬幣堆挖完，卡車會再倒一車，1 元重新藏好，可以一直玩下去。</p>',[['一般','gold',()=>go0('normal')],['挑戰','',()=>go0('challenge')],['無盡','',()=>go0('endless')]]);
    if(SIZES[k].warn)dialog('更大的硬幣堆','<p>這些硬幣堆可能要很強的電腦才跑得動，遊戲可能要載入很久，也可能根本載入不了，還可能會當機。</p><p>「標準」才是遊戲原本調好的大小。</p>',[['先不要'],['還是讓我看看','gold',go]]);
    else go();
  }
});

