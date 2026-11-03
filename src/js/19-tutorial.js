// ================= 教學步驟 =================
const remOnes=()=>anchors.size;
// 照原作影片的教學順序（第N步跟影片一樣；影片裡閃太快沒看清楚的幾步照前後文補上）
const STEPS=[
  {t:'開門',k:'E',d:'你被關在一間小房間裡，不記得是怎麼來的。走到門前按 E 把門打開。',done:()=>G.doorOpen},
  {t:'拿一點硬幣',k:'LMB',d:'看著硬幣堆，按左鍵把硬幣抽出來。用手一次只能拿一枚，鏟子會拿得多。',done:()=>G.carry>0||G.earned>0},
  {t:'丟硬幣',k:'RMB',d:'按右鍵把手上的硬幣丟出去。',done:()=>G.thrown>0||G.earned>0},
  {t:'跑步',k:'SHIFT',d:'走路時按住 Shift 就能跑，跑得比較快，但會耗體力（左下的黃條）。',done:()=>G.flags.ran||G.earned>0},
  {t:'去收購站賣硬幣',k:'RMB',d:'收購站在遠處的角落。走過去，站在敞開的進料口前，按右鍵把硬幣丟進去，就能拿到錢。',goal:.1,p:()=>[G.earned,.1,'$']},
  {t:'打開科技樹',k:'TAB',d:'按 Tab 打開科技樹，機器和升級都在這裡買。再按一次 Tab 就能關掉。',done:()=>G.flags.techOpened},
  {t:'抓更大把',k:'TAB',d:'在科技樹花 $0.35 買「抓更大把」，雙手一次可以多抓一枚。',rw:.05,done:()=>lv('grab')>0,p:()=>[G.money,.35,'$']},
  {t:'存錢買玩具鏟',k:'',d:'一直賣硬幣，賣到連擊條滿。途中再買一級「抓更大把」，連擊條就清得更快。玩具鏟在商店賣 $3.25。',rw:.25,goal:3.25,p:()=>[G.money+(G.tools.toy?3.25:0),3.25,'$']},
  {t:'找到五金行',k:'E',d:'五金行是另一個角落的那棟房子（SUPPLY CO.）。走到櫃檯前，按 E 打開商店。',rw:.25,done:()=>G.flags.shopOpened},
  {t:'買下玩具鏟',k:'',d:'點「玩具鏟」旁邊的購買。',done:()=>G.tools.toy},
  {t:'把鏟子收起來',k:'1',d:'新鏟子已經在手上，放在快捷欄第 2 格，就在徒手旁邊。按 1 把鏟子換回徒手，再按 2 把鏟子拿出來。',rw:.25,done:()=>G.flags.swap},
  {t:'用鏟子挖',k:'LMB',d:'拿著玩具鏟對硬幣堆按左鍵，一次就挖起一整鏟。',done:()=>G.flags.toyDug},
  {t:'把鏟子裝滿',k:'LMB',d:'一直挖，挖到鏟子滿了為止。',done:()=>G.flags.toyFull},
  {t:'把鏟子倒空',k:'RMB',d:'對準要放硬幣的地方，按右鍵把整鏟硬幣倒過去，做三次。',rw:.5,done:()=>(G.flags.toyThrows||0)>=3,p:()=>[G.flags.toyThrows||0,3,'#']},
  {t:'買個水桶',k:'E',d:'去商店花 $25 買個水桶，裝的比鏟子多很多。',rw:.5,done:()=>G.tools.bucket,p:()=>[G.money+(G.tools.bucket?25:0),25,'$']},
  {t:'把水桶裝滿',k:'LMB',d:'把水桶放在地上（按 Q），挖硬幣，然後對準水桶按右鍵丟進去。也可以拿著水桶直接挖。裝滿 600 枚。',rw:.5,done:()=>G.flags.bucketFull,p:()=>[G.drop&&G.drop.bucket?G.drop.bucket.fill:G.tool==='bucket'?G.carry:0,capOf('bucket'),'#']},
  {t:'倒進收購站',k:'RMB',d:'按 E 帶走水桶，提到收購站，站在敞開的進料口前，按住右鍵把硬幣倒進去。',rw:.5,done:()=>G.flags.bucketSold},
  {t:'賺到 $30',k:'',d:'一直賣硬幣，賣到連擊條滿為止，途中買東西不會讓連擊條變慢。圓鍬在商店賣 $30。',rw:1,goal:30,p:()=>[G.money+(G.tools.spade?30:0),30,'$']},
  {t:'買圓鍬',k:'E',d:'去商店花 $30 買圓鍬，會放進快捷欄的下一格。',rw:1,done:()=>G.tools.spade},
  {t:'放下工具',k:'Q',d:'手上拿著工具，按 Q 放到地上，或按 F 丟出去。工具會留在原地，走過去按 E 就能再撿起來。',rw:1,done:()=>G.flags.dropped},
  {t:'找回弄丟的工具',k:'Q',d:'按 Q 把工具放到地上，走到商店櫃檯前按 E，點那件工具旁邊的「送到我這」，工具就會回到你腳邊。',rw:2,rwText:'一元收藏櫃（免費）',done:()=>G.flags.delivered},
  {t:'把工具撿起來',k:'E',d:'工具就在你腳邊，走過去按 E 撿起來。',done:()=>G.flags.picked&&G.flags.delivered},
  {t:'建造一元收藏櫃',k:'B',d:'按 B 選一元收藏櫃，這個不用錢，點一下地上的位置就能蓋好。找到的 1 元要放這裡。',done:()=>countType('cabinet')>0},
  {t:'鋪第一條輸送帶',k:'B',d:'按 Tab，花 $40 買「輸送帶藍圖」。按 B 選輸送帶，點一下定起點，再點一下定終點。輸送帶上的硬幣會自己往前走。',rw:3,done:()=>(G.beltsBuilt||0)>0,p:()=>[G.money+(lv('beltBP')?40:0),40,'$']},
  {t:'拉近推遠',k:'LMB',d:'按 B 隨便選一樣東西，滑鼠上就會出現預覽。轉動滑鼠滾輪，或按 C 和 V，預覽就會拉近或推遠。',rw:3,done:()=>(G.flags.zoomed||0)>=2,p:()=>[G.flags.zoomed||0,2,'#']},
  {t:'轉方向',k:'R',d:'建造的時候按 R，預覽就會轉 90 度。箭頭指的就是硬幣要走的方向。',rw:1,done:()=>G.flags.rotated},
  {t:'拆掉重蓋',k:'X',d:'建造的時候按 X 切到拆除模式，點一下就拆掉，錢全部退還。',rw:1,done:()=>G.flags.removed},
  {t:'把輸送帶接到收購站',k:'B',d:'按 B 選輸送帶，讓終點落在收購站的進料口，這樣輸送帶上的硬幣就會自己賣掉。',rw:5,done:()=>G.autoSold>0},
  {t:'把輸送帶反過來',k:'E',d:'輸送帶只會往一個方向送硬幣。看著蓋好的輸送帶，上面的箭頭指出往哪走。按住 E 直到箭頭轉過來，輸送帶就反著走，不用花錢。',rw:3,done:()=>G.flags.reversed},
  {t:'複製建築',k:'LMB',d:'看著一元收藏櫃按滑鼠中鍵，手上就會有一個一模一樣的，可以直接蓋。蓋好的東西都能這樣複製。',rw:3,done:()=>G.flags.copied},
  {t:'對齊格線',k:'G',d:'建造的時候按 G，地上會出現方格，看得出建築會對齊哪一格。再按一次 G 就關掉。',rw:3,done:()=>G.flags.grid},
  {t:'把硬幣丟上輸送帶',k:'RMB',d:'對準輸送帶按右鍵，把手上的硬幣丟上去，看它自己送到收購站。',rw:3,done:()=>G.flags.onBelt||G.autoSold>2000},
  {t:'開始供電',k:'B',d:'按 Tab 買「電力」（$30），再按 B 蓋一台硬幣發電機（$160），放些硬幣進去燒（對著它按右鍵）。一台 6kW，3 公尺內的機器直接有電。',rwText:'活塞耙（免費）',done:()=>countType('gen')>0,onDone:()=>{G.freeRake=true}},
  {t:'放下免費的活塞耙',k:'B',d:'按 B 選活塞耙，這台免費，放在硬幣堆前面、面向硬幣堆。後面要保持淨空。',rw:10,rwText:'電線桿（免費）',done:()=>countType('rake')>0,onDone:()=>{G.freePole=true}},
  {t:'用電線桿接上活塞耙',k:'B',d:'在離活塞耙和發電機都不超過 6 公尺的地方放一根電線桿（這根免費），活塞耙就會開始工作。',rw:5,done:()=>[...tiles.values()].some(t=>t.type==='rake'&&t.pw>0&&t.net&&t.net.sup>0)},
  {t:'設定活塞耙丟多遠',k:'E',d:'在活塞耙前按 E，選硬幣要丟多遠，讓硬幣落在輸送帶上，或落進地上的水桶或手推車裡。',rw:10,done:()=>G.flags.rakeSet},
  {t:'讓輸送帶變快',k:'TAB',d:'輸送帶目前很慢。按 Tab 花 $15 買「輸送帶速度提升」第一級，所有輸送帶都會變快，蓋好的也一樣。',rw:15,done:()=>lv('beltSpd')>0},
  {t:'建造機械手臂',k:'TAB',d:'按 Tab，花 $10 買「小型機械手臂藍圖」。按 B 把手臂放在硬幣堆和輸送帶之間（一支 $100 起），旁邊要有電線桿，手臂會把硬幣放到輸送帶上。',rw:20,done:()=>countType('arm')+countType('arm2')+countType('arm3')>0},
  {t:'關閉整條線路',k:'E',d:'看著電線桿按 E，把整條線路切到關，線上所有機器都會停下，然後再切回開。',rw:5,done:()=>G.flags.toggled},
  {t:'買金屬探測器',k:'E',d:'按 Tab 解鎖「金屬探測器」，再去商店花 $390 買。離 1 元越近，嗶得越快。在硬幣堆上走一走，仔細聽。',rw:50,done:()=>G.tools.det},
  {t:'打開探測器',k:'LMB',d:'拿著金屬探測器，按左鍵打開。',done:()=>G.flags.detOn},
  {t:'釘選訂單',k:'E',d:'鐵捲門旁的看板上有一張訂單。看著左邊那張大單子按 E，訂單就會出現在螢幕角落。',rw:50,done:()=>G.pinned},
  {t:'完成第一張訂單',k:'',d:'這張訂單要在卡車上放二十個硬幣捆。按 Tab 先買「T型分流器」，再花 $150 買「壓縮機藍圖」，按 B 把壓縮機蓋在輸送帶上（$350），旁邊要有電線桿。壓縮機把硬幣壓成捆，賣得比較貴。把硬幣捆送到東牆的出貨口就會裝上卡車。',rw:50,done:()=>G.order>0,p:()=>[G.order>0?20:G.ordProg,20,'#']},
  {t:'建造草堆掃描器',k:'B',d:'硬幣裡藏著 1 元，跟著賣掉就沒了。按 Tab 花 $100 買「掃描器 Mk I 藍圖」，再按 B 把掃描器放在收購站前面的輸送帶上（一台 $250），掃描器會把 1 元挑出來放進抽屜。',rw:30,done:()=>countType('scanner')+countType('scanner2')+countType('detector')>0},
  {t:'完成包裝訂單',k:'TAB',d:'看板上的下一張訂單要十八個包裝硬幣捆。按 Tab 花 $150 買「包裝機藍圖」，按 B 把包裝機蓋在壓縮機後面的輸送帶上（$300），包好的硬幣捆送到卡車上。',rw:100,done:()=>G.order>1,p:()=>[G.order>1?18:G.order===1?G.ordProg:0,18,'#']},
  {t:'建造運幣無人機',k:'B',d:'按 Tab 買「運幣無人機藍圖」。按 B 放下停機坪（一架 $200 起），再點一下設定 12 公尺內的放料點，無人機會自己來回搬硬幣。',rw:150,done:()=>countType('drone')>0},
  {t:'擴建棚子',k:'TAB',d:'按 Tab 買「擴建棚子」，每升一級棚子就會變大。',rw:150,done:()=>lv('expand')>0},
  {t:'找到第一枚 1 元',k:'',d:'讓掃描器幫你挑，或用金屬探測器找。挖得越多越容易找到。',done:()=>G.onesHand>0||G.onesFound>0},
  {t:'把 1 元放進收藏櫃',k:'E',d:'走到一元收藏櫃前面按 E，把手上的 1 元放進去。每一種 1 元都有加成。',done:()=>G.onesFound>0},
  {t:'找到所有的 1 元',k:'',d:'硬幣堆裡還藏著很多 1 元。把它們全部找出來。',done:()=>remOnes()===0&&G.onesHand===0,p:()=>[G.onesFound,SIZES[G.size].ones,'#']}
];
function updateObjective(){
  let s=STEPS[G.step];
  while(s&&(s.goal!=null?s.p()[0]>=s.goal:s.done())){
    if(s.rw){G.money+=s.rw;G.earned+=s.rw}if(s.onDone)s.onDone();
    toast('✔ 完成：'+s.t+(s.rw||s.rwText?'　獎勵：'+[s.rw?money(s.rw):'',s.rwText||''].filter(Boolean).join(' + '):''));tone(1000,.1);G.step++;s=STEPS[G.step];
  }
  if(!s){$('objN').textContent='';$('objT').textContent='全部完成';$('objD').textContent='教學都做完了，繼續把 1 元找出來吧。';$('objR').textContent='';$('objBarW').style.display='none';$('objP').textContent='';$('objL').textContent='';$('objK').innerHTML='';return}
  $('objN').textContent=G.step?'第'+G.step+'步':'開始';$('objT').textContent=s.t;$('objD').textContent=s.d;
  $('objK').innerHTML=TTON&&s.k?'<span class="tkey">'+(TKEY[s.k]||s.k)+'</span>':s.k==='LMB'||s.k==='RMB'?mouseSvg(s.k==='RMB',22):s.k?'<span class="kc">'+(s.k==='TAB'?'TAB':s.k)+'</span>':'';
  $('objR').textContent=s.rw||s.rwText?'獎勵：'+[s.rw?money(s.rw):'',s.rwText||''].filter(Boolean).join(' + '):'';
  if(s.p){const[v,g,u]=s.p(),f=Math.max(0,Math.min(1,v/g));$('objBarW').style.display='block';$('objBar').style.width=f*100+'%';
    if(u==='$'){$('objP').textContent=money(Math.min(v,g))+' / '+money(g);$('objL').textContent=v<g?'還差'+money(g-v):''}
    else{$('objP').textContent=fmt(Math.min(v,g))+' / '+fmt(g);$('objL').textContent=''}}
  else{$('objBarW').style.display='none';$('objP').textContent='';$('objL').textContent=''}
}

