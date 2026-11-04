// ================= 劇情《第一枚一元》：信件、信箱、硬幣山裡的回憶 =================
// 海口庄的信用合作社要收了，金庫裡五十年的零錢倒進阿公的院子。阿公當了四十年出納，鎮上每個孩子存的「第一枚一元」都混在這座山裡。
// 只有一般、無盡模式有劇情，設定裡可以關掉。劇情跟著本來就在做的事走（開門、找到 1 元、蓋機器、交訂單、挖山），
// 沒有時間限制，信會一直放在信箱裡等你讀；送的禮物都是裝飾，不會讓遊戲變簡單或變難。
const storyOK=()=>!!(G&&G.story&&SET.story!==false);
const STORY_MACH=new Set(['gen','gas','rake','arm','arm2','arm3','roller','scanner','scanner2','detector','drone']);
const STORY_PPL={huang:'黃理事長',lan:'秀蘭阿嬤',de:'阿德',tsai:'阿財',chen:'陳師傅',gp:'阿公'};
const STORY_STAMP={huang:'🏦',lan:'🍧',de:'🔧',tsai:'🚚',chen:'🪙',gp:'🍬'};
// 劇情送的裝飾：用一個看不到的科技等級解鎖
const GIFT={radio:'giftRadio',cosign:'giftSign'};
const hasBench=()=>{for(const t of tiles.values())if(t.type==='bench')return t;return null};
const storyDug=()=>!G||(G.round||1)>1?1:Math.max(0,1-G.left/SIZES[G.size].coins);
const LETTERS=[
  {id:'intro',from:'huang',title:'給阿公的孫子',to:'給阿公的孫子：',when:()=>G.doorOpen,delay:7,
    body:['你好，我是海口信用合作社的黃理事長。昨天晚上卡車倒東西的聲音，應該把你吵醒了吧，真不好意思。',
      '合作社月底就要收了，金庫裡存了五十年的零錢，實在不知道該放哪裡。後來我們在你阿公的抽屜裡找到一張紙條，上面寫著：「金庫的錢，交給我孫子整理。」所以就全部倒在你家院子了。',
      '你阿公在合作社當了四十年的出納。鎮上的孩子第一次來開戶，存的都是一枚 1 元，他會在存摺上蓋第一個章，再把那枚 1 元收進金庫。那些「第一枚一元」，現在全都混在這座山裡。',
      '硬幣賣掉的錢都歸你，工具可以去五金行找阿德買。只拜託你一件事：裡面的 1 元，請一枚一枚找出來，放進收藏櫃。鎮上的人都很想再看看自己的第一枚。',
      '不用急，慢慢來就好。'],sig:'海口信用合作社　黃理事長'},
  {id:'first1',from:'lan',title:'凹凹的一元',to:'孩子：',when:()=>G.onesFound>0,delay:6,
    body:['阿德跟我說，你找到第一枚了！',
      '你阿公以前常常坐在我店門口喝彈珠汽水，順便幫我數零錢。他數錢的時候好認真，眼鏡都滑到鼻頭了也不知道。',
      '我的第一枚一元是凹的。那天我把它放在門口的台階上，被我弟弟的腳踏車壓過去，我哭了一整個下午。你阿公蹲下來跟我說：「凹的也是一元啊，一樣可以存。」',
      '如果你找到一枚凹凹的一元，說不定就是我的。找到的話，要讓我看看喔。',
      '肚子餓了就過來，阿嬤請你吃枝仔冰。'],sig:'隔壁柑仔店　秀蘭阿嬤'},
  {id:'gen',from:'de',title:'阿公的收音機',to:'小老闆：',when:()=>[...tiles.values()].some(t=>STORY_MACH.has(t.type)),delay:10,gift:'radio',
    body:['聽到你院子裡的機器聲了，很好聽！',
      '你阿公是我店裡最會殺價的客人，買一包螺絲可以講二十分鐘，最後還要我多送兩顆。不過他修東西真的厲害，合作社那台老算錢機，他修了三十年都沒換。',
      '他走之前，在我店裡寄放了一台舊收音機，說等孫子回來再交給你。我已經幫你放進建造目錄的「裝飾」了，不用錢。',
      '放在院子裡，走過去按 E 就能打開。他以前最喜歡一邊修東西、一邊聽老歌。'],sig:'SUPPLY CO. 五金行　阿德'},
  {id:'order1',from:'tsai',title:'叭叭！',to:'老闆你好：',when:()=>G.order>0,delay:8,
    body:['我是開卡車的阿財啦！訂單的貨都是我來載。',
      '偷偷跟你說，你不要跟理事長講：第一天晚上我倒錯位置了，本來要倒在院子中間偏左一點……算了，反正都在院子裡。',
      '你做的硬幣捆很漂亮，整整齊齊的。我載去城裡，人家都問是哪裡做的，我就說：海口庄啊！',
      '以後我出發的時候，會按喇叭跟你說再見。叭叭！'],sig:'卡車司機　阿財'},
  {id:'glasses',from:'lan',title:'阿公的眼鏡',to:'孩子：',when:()=>G.story.items.glasses,delay:8,
    body:['阿德說你在硬幣堆裡挖到一副眼鏡。我一看就知道，那是你阿公的！右邊的鏡腳是他自己用鐵絲綁的，綁了十幾年都捨不得換。',
      '他總說戴著這副眼鏡，才看得清楚每一枚一元的年份。有一次他找眼鏡找了一整個下午，結果眼鏡就掛在他頭上。',
      '放在收藏櫃裡吧，讓它繼續陪著那些一元。'],sig:'秀蘭阿嬤'},
  {id:'passbook',from:'huang',title:'第一枚登記簿',to:'你好：',when:()=>G.story.items.passbook,delay:8,gift:'cosign',
    body:['你挖到的那本，是合作社最早的「第一枚登記簿」！我們找了好多年。',
      '每個孩子存第一枚一元的那天，你阿公都會在上面寫下名字和日期。我的名字在第三頁，民國六十四年，那年我六歲。',
      '最後一頁有一行字，是你阿公的筆跡，寫的是你的名字，旁邊註明：「乖孫的第一枚，先放在我這裡。」',
      '所以，你的第一枚一元，應該也在這座山的某個地方。',
      '為了謝謝你，合作社的舊招牌就送給你了，已經放進建造目錄的「裝飾」。掛了五十年，跟我差不多老呢。'],sig:'海口信用合作社　黃理事長'},
  {id:'photo',from:'lan',title:'照片裡的人',to:'孩子：',when:()=>G.story.items.photo,delay:8,
    body:['你挖到的那張照片，阿德拿來給我看了。我看了好久好久。',
      '照片裡綁辮子的女孩是我，旁邊穿工作服的，是陳師傅。那年他剛去造幣廠當學徒，每次回鎮上，都會繞到我店裡買一瓶彈珠汽水。',
      '他說過，總有一天要送我一枚「世界上獨一無二的一元」。後來他調到外地，就再也沒有回來了。',
      '我寫了一封信寄去他以前的地址，也不知道他還住不住在那裡。如果有回信，我再告訴你。'],sig:'秀蘭阿嬤'},
  {id:'chen',from:'chen',title:'五十年',to:'你好：',need:['photo'],when:()=>true,delay:150,
    body:()=>['我是陳師傅。秀蘭的信，我收到了，讀了三遍。',
      '那張照片，我也有一張，一直放在皮夾裡。',
      '說起來不好意思。年輕時，我用造幣廠試鑄的模具，偷偷打了一枚一元，自己鍍上一層金，想送給秀蘭。可是走到柑仔店門口，就是不敢進去。最後我把它存進合作社，請你阿公幫我保管，說等我有勇氣了再去拿。',
      '這一等，就是五十年。',
      G.coll.gold?'秀蘭說，那枚金色的一元，你已經找到了。謝謝你。':'那枚金色的一元，應該還在你院子的硬幣山裡。如果你找到了，可以幫我放進收藏櫃嗎？不急，慢慢找。',
      '下次回海口庄，我想去你的院子坐坐。'],sig:'陳師傅'},
  {id:'reunion',from:'lan',title:'長椅',to:'孩子：',need:['chen'],when:()=>G.coll.gold>0,delay:12,
    body:()=>['陳師傅回來了！他說想看看那枚金色的一元，也想看看你阿公的院子。',
      '他還是跟以前一樣，講沒兩句話就臉紅。',
      hasBench()?'我們找一個晚上，去你院子的長椅坐坐，不會吵到你的。':'你的院子如果有一張長椅就好了，我們老人家站不久。（建造目錄的「裝飾」裡有長椅）',
      '謝謝你，孩子。'],sig:'秀蘭阿嬤'},
  {id:'grandpa',from:'gp',title:'給乖孫',to:'乖孫：',manual:true,
    body:()=>['你看到這封信的時候，院子應該亂得不像話吧。',
      '這五十年，鎮上每個孩子的第一枚一元，都是我收的。我一直想讓大家再看一次，可是年紀大了，數不動了，只好交給你。',
      '盒子裡那枚，是你的第一枚一元。那年你才三歲，握在手裡不肯放，最後是用一顆糖跟你換的。',
      G.story.goldBox?'另外那枚金色的，是陳師傅寄放的。他來拿的時候，幫我跟他說一句：她一直在等。':'山裡那枚金色的一元，是陳師傅寄放在我這裡的。如果他回來了，幫我跟他說一句：她一直在等。',
      '慢慢挖，不用急。累了就坐下來，摸摸貓，看看天空。',
      '錢是拿來用的，可是有些一元，是拿來記得的。'],sig:'阿公'},
  {id:'fest',from:'huang',title:'今晚，一元展',to:'你好：',need:['grandpa'],when:()=>true,delay:4,act:'fest',
    body:['謝謝你，把整座山都整理好了。',
      '鎮上的人聽說了，都想來看看自己的第一枚。今天晚上，可以在你的院子辦一場「一元展」嗎？',
      '大家會帶天燈來。阿財說他負責載椅子，秀蘭阿嬤負責枝仔冰。'],sig:'海口信用合作社　黃理事長'},
  {id:'after',from:'lan',title:'天燈',to:'孩子：',need:['fest'],when:()=>G.story.festDone,delay:40,
    body:['昨天晚上的天燈好漂亮，我跟陳師傅看到最後一盞飛不見了才回家。',
      '你阿公一定也看到了。',
      '院子整理好了，可是不用急著走喔。有空就來柑仔店坐坐，彈珠汽水阿嬤請。'],sig:'秀蘭阿嬤'}
];
const LETTER=Object.fromEntries(LETTERS.map(l=>[l.id,l]));
// 每種 1 元的主人：收藏櫃和翻過來的卡片上會多一句「主人的話」
const ONE_OWNER={
  bent:['秀蘭阿嬤','被我弟弟的腳踏車壓過，我哭了一整個下午。你阿公說：凹的也是一元啊。'],
  worn:['賣豆花的阿水伯','推車賣了四十年豆花，找零找到字都磨不見了。'],
  shiny:['國小三年級的小芸','我第一次自己去存錢，櫃檯的阿公還送我一顆糖。'],
  scratch:['五金行的阿德','跟鑰匙、螺絲放在同一個口袋，刮成這樣很正常啦。'],
  old:['菜市場的月娥阿嬤','這是我出嫁前存的。那時候的一元，可以買好多顆糖。'],
  green:['廟公阿榮伯','掉進廟口的水溝好幾年，撈起來就長滿銅綠了。'],
  red:['卡車司機阿財','小時候拿去磨，想把它磨成金的，結果磨成紅的。'],
  plum:['美玲老師','我都跟學生說，梅花特別清楚的那枚，是幸運的一元。'],
  burnt:['烤肉高手志偉','中秋節烤肉，它掉進炭火裡，第二天才撿出來。'],
  holed:['漁夫阿海伯','穿個洞綁在船頭，出海四十年，一次都沒翻船。'],
  black:['理髮廳的阿珠姨','放在剪刀盒裡太久，變得黑亮黑亮的，可以照鏡子。'],
  twin:['辦桌魔術師阿明叔','這是我的魔術道具！猜正反面，我從來沒輸過。'],
  pure:['打銅的老林','顏色這麼純的銅，我做了一輩子銅器也很少看到。'],
  y1960:['黃理事長','這是我自己的第一枚。那年我六歲，你阿公還是個年輕人。'],
  proof:['愛收藏的淑芬','從盒子裡拿出來存，被我爸念了好久。'],
  mint:['剛當爸爸的阿傑','孩子滿月那天，我們拿全新的一元替她存了第一筆。'],
  offc:['陳師傅','這枚是我當學徒的時候打歪的，本來要銷毀……噓。'],
  sealed:['收藏家許先生','我封好膜才拿去存，你阿公笑我：錢就是要拿來存的嘛。'],
  magnet:['國小五年級的阿凱','自然課做實驗，它跟迴紋針黏在一起，就再也拿不下來了。'],
  rare:['開計程車的阿國','這一年的鑄得特別少，我兒子就是那年出生的。'],
  error:['鐘錶行的老吳','修了一輩子的錶，我一眼就看出它轉了一個角度。'],
  gold:['陳師傅','年輕時偷偷打的，本來要送給一個人。'],
  pattern:['合作社的阿春姨','你阿公說試鑄的很少見，叫我一定要收好。'],
  memo:['國小的王校長','學校一百歲生日那年，每個學生都拿到一枚。']};
function ownerOf(id){if(!storyOK())return null;if(id==='gold'&&!G.story.got.chen)return['？？？','邊緣刻著一個很小的「陳」字。'];return ONE_OWNER[id]||null}
// 硬幣山挖到一定程度會露出來的東西（at：挖掉幾成）；鐵盒在整座山的最底下
const MEMOS=[
  {id:'glasses',at:.25,name:'阿公的老花眼鏡',desc:'鏡片有一點刮痕，右邊的鏡腳用細鐵絲綁過。阿公戴著它，數了四十年的零錢。'},
  {id:'passbook',at:.5,name:'第一枚登記簿',desc:'海口信用合作社最早的登記簿。每一頁都寫滿了名字和日期，旁邊蓋著小小的紅章。最後一頁，寫著你的名字。'},
  {id:'photo',at:.75,name:'一張老照片',desc:'泛黃的照片：柑仔店門口，一個綁辮子的女孩，和一個穿工作服的年輕人，兩個人都笑得有點害羞。背面寫著「民國六十二年　春」。'},
  {id:'tin',at:1,name:'阿公的餅乾鐵盒',desc:'壓在整座山最底下的鐵盒，蓋子上畫著褪了色的花。'},
  {id:'mine',name:'你的第一枚一元',desc:'三歲的你，握在手裡不肯放的那一枚。阿公用一顆糖跟你換來，一直收在鐵盒裡。'}];
const MEMO=Object.fromEntries(MEMOS.map(m=>[m.id,m]));

// ---------- 開局、讀檔 ----------
function storyInit(fresh){if(!G)return;
  if(G.daily||G.vs||(G.gmode&&G.gmode!=='normal'&&G.gmode!=='endless')){G.story=null;return}
  if(G.story){for(const k in G.story.got){const l=LETTER[k];if(l&&l.gift)G.ups[GIFT[l.gift]]=1}return}
  G.story={got:{},read:{},items:{},memo:{},wait:{},last:-99,radio:false};
  if(fresh)return;
  // 舊存檔：已經做到的部分，信直接放進信箱，不一封一封跳通知
  let n=0;for(const id of['intro','first1','gen','order1']){const l=LETTER[id];if(l.when()){G.story.got[id]=Math.max(.01,G.play-n);n++;if(l.gift)G.ups[GIFT[l.gift]]=1}}
  if(n)setTimeout(()=>{if(storyOK())toast('📮 信箱裡有 '+n+' 封信，在鐵捲門右邊的牆上','gold')},2500)}
const mailUnread=()=>{const S=G&&G.story;if(!S)return 0;let n=0;for(const k in S.got)if(!S.read[k])n++;return n};

// ---------- 每一幀：送信、回憶物品、信箱的旗子 ----------
let storyAcc=0;
function storyTick(dt,now){
  const on=storyOK();if(mailBox)mailBox.visible=on;
  if(!on){memoClear();return}
  if(mailFlag){const up=mailUnread()>0;mailFlag.rotation.x+=((up?0:1.5)-mailFlag.rotation.x)*Math.min(1,dt*5);mailEnv.visible=up}
  memoAnim(dt,now);
  if(mode!=='play')return;
  storyAcc+=dt;if(storyAcc<.5)return;const d=storyAcc;storyAcc=0;const S=G.story;
  memoTick();
  if(G.play-S.last<14)return; // 兩封信之間隔一下，不要一直跳通知
  for(const l of LETTERS){if(S.got[l.id]||l.manual)continue;
    if(l.need&&!l.need.every(k=>S.read[k]))continue;
    if(!l.when()){S.wait[l.id]=0;continue}
    S.wait[l.id]=(S.wait[l.id]||0)+d;if(S.wait[l.id]<(l.delay||5)||panel||G.build)continue;
    deliver(l.id);break}}
function deliver(id,quiet){const S=G.story,l=LETTER[id];if(!S||S.got[id])return;S.got[id]=G.play||.01;S.last=G.play;
  if(l.gift)G.ups[GIFT[l.gift]]=1;
  if(!quiet){toast('📮 '+STORY_PPL[l.from]+'寄來一封信'+(TOUCH?'，點右上角的信封就能看':'，按 K 或走到信箱看看'),'gold');bell()}
  updMailHud()}
// 郵差腳踏車的鈴聲
function bell(){if(SET.vol<=0||!audio())return;try{const T=ac.currentTime;for(let k=0;k<2;k++)for(const f of[2093,2637,3520]){const o=ac.createOscillator(),g=ac.createGain(),t0=T+k*.17;o.frequency.value=f*(1+k*.004);
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(f===2093?.045:.022,t0+.004);g.gain.exponentialRampToValueAtTime(.0001,t0+.85);o.connect(g).connect(sfxG);o.start(t0);o.stop(t0+.9)}}catch(e){}}
function paperSnd(){noiseS(.18,2600,.6,.05,'highpass');setTimeout(()=>noiseS(.12,1800,.8,.035,'bandpass'),120)}
function updMailHud(){const b=$('mailBadge');if(!b)return;const on=storyOK()&&G.doorOpen&&mode!=='intro',n=on?mailUnread():0;b.classList.toggle('hidden',!on);b.classList.toggle('new',n>0);
  const h='✉'+(n?'<b>'+n+'</b>':'')+(TOUCH?'':'<span>K</span>');if(b._h!==h){b.innerHTML=h;b._h=h}}

// ---------- 信箱（鐵捲門右邊的牆上） ----------
let mailBox=null,mailFlag=null,mailEnv=null;const MAILP={x:2.75,z:0};
function buildMailbox(){const g=new THREE.Group();g.position.set(2.75,0,H-.16);world.add(g);MAILP.z=H-1.15;
  const grn=paint(0x2f6b45,.15,.55),dk=paint(0x1d3b2a,.1,.7),red=paint(0xc8281e,.2,.45),brass=paint(0xc9a040,.8,.3);
  rbx(g,.48,.36,.28,.025,grn,0,1.22,-.14);
  bx(g,.54,.035,.2,dk,0,1.45,-.09,-.38,0,0);bx(g,.54,.035,.2,dk,0,1.45,-.25,.38,0,0);
  bx(g,.28,.03,.012,paint(0x0c0c0c,0,.8),0,1.31,-.283);bx(g,.16,.07,.01,brass,0,1.12,-.283);
  bx(g,.1,.5,.06,dk,0,1.05,-.02);
  mailEnv=bx(g,.2,.1,.006,paint(0xf3ecd8,0,.9),0,1.345,-.285,.25,0,0);
  const fp=new THREE.Group();fp.position.set(.255,1.18,-.14);g.add(fp);mailFlag=fp;fp.rotation.x=1.5;
  bx(fp,.02,.3,.02,red,0,.15,0);bx(fp,.012,.11,.15,red,0,.25,-.07);
  obstacles.push({x:2.75,z:H-.32,r:.32});mailBox=g;g.visible=storyOK()}
const nearMail=()=>storyOK()&&G.doorOpen&&Math.hypot(pl.x-MAILP.x,pl.z-MAILP.z)<1.9&&pl.y<1.6;

// ---------- 讀信 ----------
let mailSel=null;
function openMail(id){if(!storyOK())return;const S=G.story,ids=LETTERS.filter(l=>S.got[l.id]).sort((a,b)=>S.got[b.id]-S.got[a.id]).map(l=>l.id);
  mailSel=id||ids.find(k=>!S.read[k])||ids[0]||null;openPanel('mailPanel')}
const letterBody=l=>typeof l.body==='function'?l.body():l.body;
function letterHTML(l,anim){const S=G.story;
  let act='';if(l.act==='fest')act=S.festDone?'':S.fest?'<div class="lt-act"><span>一元展正在院子裡進行中</span></div>':'<div class="lt-act"><button class="btn gold" data-fest="go">今晚辦一元展</button>'+(S.fin?'':'<button class="btn" data-fest="later">晚點再說</button>')+'</div>';
  return '<div class="letter'+(anim?' anim':'')+(EN_ON?' en':'')+'"><div class="lt-hd"><div class="lt-to">'+l.to+'</div><div class="lt-stamp"><i>'+STORY_STAMP[l.from]+'</i><small>海口庄</small></div></div>'+
    letterBody(l).map(p=>'<p>'+TT(p)+'</p>').join('')+'<div class="lt-sig">'+l.sig+'</div>'+
    (l.gift?'<div class="lt-gift">🎁 <b>'+BIT[l.gift].name+'</b> 已經放進建造目錄的「裝飾」</div>':'')+act+'</div>'}
function renderMail(){const S=G.story;if(!S)return;const ls=LETTERS.filter(l=>S.got[l.id]).sort((a,b)=>S.got[b.id]-S.got[a.id]);
  if(!LETTER[mailSel]||!S.got[mailSel])mailSel=ls[0]?ls[0].id:null;
  const l=LETTER[mailSel],fresh=l&&!S.read[l.id];if(l&&fresh){S.read[l.id]=G.play||1;readFx(l)}
  $('mailList').innerHTML=ls.length?ls.map(x=>'<div class="mli'+(S.read[x.id]?'':' unread')+(mailSel===x.id?' sel':'')+'" data-mail="'+x.id+'"><span class="env">'+STORY_STAMP[x.from]+'</span><div class="mt"><b>'+x.title+'</b><small>'+STORY_PPL[x.from]+'</small></div></div>').join(''):'<div class="mnone">還沒有信</div>';
  $('mailRead').innerHTML=l?letterHTML(l,fresh):'<div class="mnone">信箱是空的。<br>阿公的院子很安靜。</div>';if(fresh){paperSnd();$('mailRead').scrollTop=0}
  updMailHud()}
// 第一次讀的時候才發生的事
function readFx(l){const S=G.story;if(l.id==='chen'&&!G.coll.gold)S.forceGold=true}
document.addEventListener('click',e=>{const b=e.target.closest('[data-mail],[data-fest],#mailBadge,[data-readmail]');if(!b||!G)return;
  if(b.id==='mailBadge'){if(mode==='play'&&!G.build)openMail();return}
  if(b.dataset.mail){mailSel=b.dataset.mail;renderMail();tone(700,.03);return}
  if(b.dataset.readmail){if(G.story&&G.story.got[b.dataset.readmail])openMail(b.dataset.readmail);return}
  if(b.dataset.fest==='go'){closePanel();festStart();return}
  if(b.dataset.fest==='later'){G.story.fin=true;closePanel();toast('一元展的信會留在信箱裡，想辦的時候再打開它')}});

// ---------- 硬幣山裡露出來的東西 ----------
const memoObj={};let memoTex=null,beamTex=null;
function memoTick(){const S=G.story,fr=storyDug();
  for(const m of MEMOS){if(m.at==null||m.id==='tin'||S.items[m.id]||S.memo[m.id])continue;if(fr>=m.at){spawnMemo(m.id);break}}
  for(const id in S.memo)if(!S.items[id]&&!memoObj[id])makeMemoObj(id)}
// 結局：整座山挖完以後，正常的結束畫面（或無盡模式再倒一車）要等鐵盒和一元展
function storyHold(){if(!storyOK()||(G.round||1)>1||G.story.fin)return false;const S=G.story;
  if(!S.memo.tin&&!S.items.tin){spawnMemo('tin');setTimeout(()=>toast('硬幣山挖完了……最底下好像壓著一個鐵盒','gold'),1200)}return true}
function memoSpot(id){
  if(id==='tin'){for(let r=0;r<H;r+=.5)for(let k=0;k<12;k++){const a=k/12*6.283+r,x=Math.cos(a)*r,z=Math.sin(a)*r;if(allowed(x,z)&&!occ.has(tkey(Math.floor(x),Math.floor(z))))return{x,z}}return{x:0,z:0}}
  const a0=Math.atan2(pl.z,pl.x);
  for(let k=0;k<40;k++){const a=a0+(Math.random()-.5)*(k<20?1.3:6.283);
    for(let r=Rp*.95;r>Rp*.12;r-=.3){const x=Math.cos(a)*r,z=Math.sin(a)*r;if(groundAt(x,z)>.3&&!occ.has(tkey(Math.floor(x),Math.floor(z))))return{x,z}}}
  return{x:Math.cos(a0)*Rp*.4,z:Math.sin(a0)*Rp*.4}}
function spawnMemo(id){const S=G.story;S.memo[id]=memoSpot(id);makeMemoObj(id);
  if(id!=='tin'){toast('✨ 硬幣堆裡好像露出了什麼東西……','gold');setTimeout(()=>{tone(1320,.25,'sine',.03);setTimeout(()=>tone(1760,.35,'sine',.025),140)},200)}}
function memoMats(){if(memoTex)return;
  const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,248,220,1)');gr.addColorStop(.25,'rgba(255,220,140,.7)');gr.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);memoTex=new THREE.CanvasTexture(cv);
  const c2=document.createElement('canvas');c2.width=4;c2.height=128;const y=c2.getContext('2d'),g2=y.createLinearGradient(0,0,0,128);g2.addColorStop(0,'rgba(255,230,170,0)');g2.addColorStop(.7,'rgba(255,230,170,.35)');g2.addColorStop(1,'rgba(255,240,200,.8)');y.fillStyle=g2;y.fillRect(0,0,4,128);beamTex=new THREE.CanvasTexture(c2)}
function makeMemoObj(id){memoMats();const p=G.story.memo[id],g=new THREE.Group(),m=new THREE.Group();g.add(m);
  if(id==='glasses'){const fr=paint(0x4a2c18,.3,.4),lens=new THREE.MeshStandardMaterial({color:0xcfe6ff,transparent:true,opacity:.35,metalness:.2,roughness:.05}),wire=paint(0xb8b8b8,.9,.3);
    for(const sx of[-1,1]){mk(m,new THREE.TorusGeometry(.05,.007,8,24),fr,sx*.058,.012,0,Math.PI/2,0,0);mk(m,cylGeo(.05,.05,.003,24),lens,sx*.058,.012,0);bx(m,.007,.007,.13,fr,sx*.108,.012,.065,0,sx*.12,0)}
    mk(m,new THREE.TorusGeometry(.018,.005,6,12,Math.PI),fr,0,.012,0,-Math.PI/2,0,0);for(let k=0;k<4;k++)mk(m,new THREE.TorusGeometry(.009,.002,4,10),wire,.11,.012,.04+k*.012,0,Math.PI/2,0);
    m.scale.setScalar(2.4);m.rotation.set(.12,.6,.08)}
  else if(id==='passbook'){const cover=paint(0x7a1e1a,.1,.7),gold=paint(0xd8b050,.8,.35);bx(m,.15,.022,.21,cover,0,.011,0);bx(m,.142,.016,.2,paint(0xefe6cf,0,.9),.005,.011,0);bx(m,.1,.003,.03,gold,0,.0235,-.05);bx(m,.04,.003,.04,gold,0,.0235,.04);m.scale.setScalar(2.2);m.rotation.set(.1,-.4,-.08)}
  else if(id==='photo'){const t=new THREE.CanvasTexture(memoCanvas('photo',320,240));t.encoding=THREE.sRGBEncoding;mk(m,new THREE.PlaneGeometry(.2,.15),new THREE.MeshStandardMaterial({map:t,roughness:.8,side:THREE.DoubleSide}),0,.006,0,-Math.PI/2,0,0);m.scale.setScalar(2.4);m.rotation.set(.15,.3,.05)}
  else if(id==='tin'){const t=new THREE.CanvasTexture(memoCanvas('tinside',512,96));t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;const side=new THREE.MeshStandardMaterial({map:t,metalness:.55,roughness:.35}),lid=new THREE.CanvasTexture(memoCanvas('tinlid',256,256));lid.encoding=THREE.sRGBEncoding;
    mk(m,new THREE.CylinderGeometry(.2,.2,.13,40,1,true),side,0,.065,0);mk(m,new THREE.CircleGeometry(.2,40),paint(0x6a1812,.5,.4),0,.002,0,-Math.PI/2,0,0);
    mk(m,new THREE.CylinderGeometry(.207,.207,.035,40),[new THREE.MeshStandardMaterial({color:0xc8a040,metalness:.8,roughness:.3}),new THREE.MeshStandardMaterial({map:lid,metalness:.45,roughness:.4}),paint(0x6a1812,.5,.4)],0,.14,0);m.scale.setScalar(1.5)}
  m.traverse(o=>{if(o.isMesh)o.castShadow=true});linColors(m);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:memoTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.setScalar(1.1);glow.position.y=.15;g.add(glow);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.04,.2,7,16,1,true),new THREE.MeshBasicMaterial({map:beamTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,opacity:.5}));beam.position.y=3.5;g.add(beam);
  g.position.set(p.x,surfY(p.x,p.z),p.z);scene.add(g);memoObj[id]={g,glow,beam,m,y:g.position.y}}
const surfY=(x,z)=>Math.max(0,groundAt(x,z))+.02;
function memoAnim(dt,now){for(const id in memoObj){const o=memoObj[id],p=o.g.position;const ty=surfY(p.x,p.z);o.y+=(ty-o.y)*Math.min(1,dt*3);p.y=o.y;
  const k=.5+.5*Math.sin(now/420+p.x),near=Math.min(1,Math.hypot(pl.x-p.x,pl.z-p.z)/6);o.glow.material.opacity=.3+k*.35;o.glow.scale.setScalar(.6+k*.25);o.beam.material.opacity=(.1+k*.12)*(.35+.65*near);o.beam.rotation.y+=dt*.3}}
function memoClear(){for(const id in memoObj){scene.remove(memoObj[id].g);disposeObj(memoObj[id].g);delete memoObj[id]}}
function nearMemo(){if(!storyOK())return null;for(const id in memoObj){const p=memoObj[id].g.position;if(Math.hypot(pl.x-p.x,pl.z-p.z)<1.7&&Math.abs(pl.y-p.y)<2.2)return id}return null}
function pickMemo(id){const S=G.story,o=memoObj[id];if(o){scene.remove(o.g);disposeObj(o.g);delete memoObj[id]}delete S.memo[id];S.items[id]=G.play||1;chime();buzz([20,40,20]);showMemo(id,true)}

// ---------- 撿到東西的畫面 ----------
let memoMode=null;
function showMemo(id,fresh){const m=MEMO[id],v=$('memoView');memoMode=id;mode='memo';unlock();
  const tin=id==='tin'&&fresh;
  v.innerHTML='<div class="mv-card'+(tin?' tin':'')+'"><div class="mv-h">'+(fresh?'在硬幣堆裡找到了':'回憶')+'</div><div class="mv-art"><img id="mvImg" src="'+memoArt(id)+'"></div><div class="mv-n">'+m.name+'</div><div class="mv-d">'+m.desc+'</div>'+
    (tin?'<div class="mv-act"><button class="btn gold" id="mvOpen">打開鐵盒</button></div>':'<div class="mv-f">'+(fresh?'已經放進收藏櫃的「回憶」・':'')+(TOUCH?'點一下關閉':'點一下或按 E 關閉')+'</div>')+'</div>';
  v.classList.remove('hidden');
  if(tin)$('mvOpen').onclick=e=>{e.stopPropagation();openTin()}}
function closeMemo(){if(!memoMode)return;if(memoMode==='tin'&&!G.story.items.mine){openTin();return}
  $('memoView').classList.add('hidden');memoMode=null;mode='play';lock()}
$('memoView').addEventListener('click',e=>{if(e.target.closest('button,.letter'))return;if(memoMode==='tinLetter'){finishTin();return}closeMemo()});
// 打開鐵盒：蓋子掀開，裡面是阿公的信和你的第一枚一元
function openTin(){const S=G.story;if(!S.items.mine){S.items.mine=G.play||1;if(!G.coll.gold){G.coll.gold=1;S.goldBox=true}}
  memoMode='tinLetter';const v=$('memoView');
  v.innerHTML='<div class="mv-tin"><div class="mv-box"><img src="'+memoImg('tinopen')+'"></div><div class="mv-lt">'+letterHTML(LETTER.grandpa,true)+'<div class="mv-act"><button class="btn gold" id="mvKeep">把鐵盒收好</button></div></div></div>';
  paperSnd();tone(523,.5,'sine',.035);setTimeout(()=>tone(659,.6,'sine',.03),300);setTimeout(()=>tone(784,.9,'sine',.028),600);
  $('mvKeep').onclick=e=>{e.stopPropagation();finishTin()}}
function finishTin(){const S=G.story;if(!S.got.grandpa){S.got.grandpa=G.play||.01;S.read.grandpa=G.play||.01;S.last=G.play-10}
  $('memoView').classList.add('hidden');memoMode=null;mode='play';lock();
  toast('收藏櫃的「回憶」多了「你的第一枚一元」'+(S.goldBox?'，還有陳師傅的黃金一元':''),'gold');if(S.goldBox)drawPrice();updMailHud()}

// ---------- 回憶的插圖（用程式畫） ----------
const memoImgC={};
const memoArt=(id,thumb)=>memoImg(id==='photo'?(thumb?'photo':'photoBig'):id==='tin'&&G&&G.story&&G.story.items.mine?'tinopen':id);
function memoImg(id){return memoImgC[id]||(memoImgC[id]=memoCanvas(id,480,360).toDataURL())}
function memoCanvas(id,W,Hh){const c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d'),s=W/480,KAI='"DFKai-SB","BiauKai","Kaiti TC","STKaiti","KaiTi",serif';
  const bg=()=>{const gr=g.createRadialGradient(W/2,Hh*.45,10,W/2,Hh/2,W*.7);gr.addColorStop(0,'#5a4330');gr.addColorStop(1,'#1e150d');g.fillStyle=gr;g.fillRect(0,0,W,Hh)};
  const shadow=(x,y,rx,ry)=>{g.save();g.fillStyle='rgba(0,0,0,.35)';g.filter='blur('+8*s+'px)';g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();g.restore()};
  if(id==='glasses'){bg();shadow(240*s,250*s,170*s,26*s);g.lineCap='round';
    g.strokeStyle='#3a2414';g.lineWidth=7*s;g.beginPath();g.moveTo(92*s,160*s);g.lineTo(40*s,120*s);g.moveTo(388*s,160*s);g.lineTo(440*s,118*s);g.stroke();
    g.strokeStyle='#bfbfbf';g.lineWidth=2.5*s;for(let k=0;k<5;k++){g.beginPath();g.ellipse((405+k*7)*s,(138-k*5)*s,4*s,8*s,.7,0,7);g.stroke()}
    for(const cx of[160,320]){const gr=g.createRadialGradient((cx-20)*s,150*s,5,cx*s,175*s,75*s);gr.addColorStop(0,'rgba(220,240,255,.55)');gr.addColorStop(1,'rgba(150,190,230,.18)');g.fillStyle=gr;g.beginPath();g.ellipse(cx*s,175*s,70*s,62*s,0,0,7);g.fill();
      g.strokeStyle='#4a2c18';g.lineWidth=11*s;g.stroke();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=4*s;g.beginPath();g.arc((cx-18)*s,160*s,38*s,3.6,4.4);g.stroke();
      g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1.2*s;g.beginPath();g.moveTo((cx-30)*s,200*s);g.lineTo((cx+10)*s,185*s);g.stroke()}
    g.strokeStyle='#4a2c18';g.lineWidth=9*s;g.beginPath();g.moveTo(228*s,160*s);g.quadraticCurveTo(240*s,140*s,252*s,160*s);g.stroke()}
  else if(id==='passbook'){bg();shadow(240*s,300*s,190*s,24*s);
    g.save();g.translate(240*s,180*s);g.rotate(-.04);g.fillStyle='#7a1e1a';g.fillRect(-205*s,-128*s,410*s,262*s);
    for(const sd of[-1,1]){g.fillStyle='#f1e7cf';g.fillRect(sd<0?-198*s:2*s,-120*s,196*s,246*s);g.strokeStyle='rgba(120,90,60,.35)';g.lineWidth=1*s;for(let k=0;k<9;k++){const y=(-80+k*24)*s;g.beginPath();g.moveTo((sd<0?-188:12)*s,y);g.lineTo((sd<0?-12:188)*s,y);g.stroke()}}
    g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-4*s,-120*s,8*s,246*s);
    g.fillStyle='#3a2a1a';g.font='bold '+17*s+'px '+KAI;g.textAlign='center';g.fillText('第一枚登記簿',-100*s,-94*s);
    g.font=13*s+'px '+KAI;g.textAlign='left';for(let k=0;k<8;k++){const y=(-62+k*24)*s;g.globalAlpha=.75;g.fillRect(-182*s,y-8*s,(50+((k*37)%40))*s,2*s);g.fillRect(-108*s,y-8*s,(38+((k*23)%30))*s,2*s);g.globalAlpha=1;
      g.fillStyle='rgba(200,40,30,.75)';g.beginPath();g.arc(-30*s,y-10*s,7*s,0,7);g.fill();g.fillStyle='#3a2a1a'}
    for(let k=0;k<6;k++){const y=(-62+k*24)*s;g.globalAlpha=.75;g.fillRect(24*s,y-8*s,(56+((k*29)%36))*s,2*s);g.fillRect(104*s,y-8*s,(30+((k*17)%28))*s,2*s);g.globalAlpha=1;g.fillStyle='rgba(200,40,30,.75)';g.beginPath();g.arc(170*s,y-10*s,7*s,0,7);g.fill();g.fillStyle='#3a2a1a'}
    g.fillStyle='rgba(255,226,120,.45)';g.fillRect(16*s,(-62+6*24-22)*s,176*s,28*s);g.fillStyle='#2a1a0e';g.font='bold '+16*s+'px '+KAI;g.fillText('乖孫的第一枚',26*s,(-62+6*24)*s);
    g.restore()}
  else if(id==='photo'||id==='photoBig'){const P=id==='photo',ph=P?{x:0,y:0,w:W,h:Hh}:{x:40*s,y:28*s,w:400*s,h:300*s};if(!P){bg();shadow(240*s,330*s,180*s,18*s);g.save();g.translate(240*s,178*s);g.rotate(-.05);g.translate(-240*s,-178*s)}
    g.fillStyle='#f4efe4';g.fillRect(ph.x,ph.y,ph.w,ph.h);const b=ph.w*.05,ix=ph.x+b,iy=ph.y+b,iw=ph.w-2*b,ih=ph.h-2*b*(P?1:2.4);
    const sk=g.createLinearGradient(0,iy,0,iy+ih);sk.addColorStop(0,'#cdb592');sk.addColorStop(1,'#a88a62');g.fillStyle=sk;g.fillRect(ix,iy,iw,ih);
    const X=v=>ix+v*iw,Y=v=>iy+v*ih;
    g.fillStyle='#8a6c48';g.fillRect(X(.08),Y(.28),iw*.84,ih*.5);g.fillStyle='#6e5234';g.fillRect(X(.04),Y(.22),iw*.92,ih*.08);
    for(let k=0;k<9;k++){g.fillStyle=k%2?'#c9ad84':'#7a5c3a';g.beginPath();g.moveTo(X(.04+k*.102),Y(.3));g.lineTo(X(.04+(k+1)*.102),Y(.3));g.lineTo(X(.04+(k+1)*.102-.01),Y(.38));g.lineTo(X(.04+k*.102-.01),Y(.38));g.fill()}
    g.fillStyle='#e8dcc4';g.fillRect(X(.3),Y(.1),iw*.4,ih*.1);g.fillStyle='#5a4028';g.font='bold '+ih*.07+'px '+KAI;g.textAlign='center';g.textBaseline='middle';g.fillText('柑仔店',X(.5),Y(.152));
    g.fillStyle='#5e4630';g.fillRect(X(.12),Y(.42),iw*.26,ih*.3);g.fillStyle='#a48a64';for(let k=0;k<3;k++)g.fillRect(X(.14),Y(.46+k*.08),iw*.22,ih*.02);
    g.fillStyle='#9c7c56';g.fillRect(X(0),Y(.78),iw,ih*.22);
    const person=(cx,hgt,girl)=>{const top=Y(.78)-ih*hgt;g.fillStyle='#3e2c1c';
      g.fillRect(X(cx)-iw*.018,Y(.78)-ih*.2,iw*.014,ih*.2);g.fillRect(X(cx)+iw*.004,Y(.78)-ih*.2,iw*.014,ih*.2);
      if(girl){g.fillStyle='#e6d6b8';g.beginPath();g.moveTo(X(cx)-iw*.055,Y(.78)-ih*.18);g.lineTo(X(cx)+iw*.055,Y(.78)-ih*.18);g.lineTo(X(cx)+iw*.03,top+ih*.17);g.lineTo(X(cx)-iw*.03,top+ih*.17);g.fill()}
      else{g.fillStyle='#4a3a2a';g.fillRect(X(cx)-iw*.04,top+ih*.15,iw*.08,ih*(hgt-.33))}
      g.fillStyle=girl?'#d8c6a4':'#4a3a2a';g.fillRect(X(cx)-iw*.035,top+ih*.14,iw*.07,ih*.13);
      g.fillStyle='#caa880';g.beginPath();g.arc(X(cx),top+ih*.08,ih*.06,0,7);g.fill();g.fillStyle='#2a1c10';g.beginPath();g.arc(X(cx),top+ih*.065,ih*.062,Math.PI,0);g.fill();
      if(girl){g.fillRect(X(cx)-iw*.045,top+ih*.07,iw*.012,ih*.16);g.fillRect(X(cx)+iw*.033,top+ih*.07,iw*.012,ih*.16)}else{g.fillRect(X(cx)-iw*.05,top+ih*.02,iw*.1,ih*.025)}};
    person(.52,.5,true);person(.66,.6,false);
    const im=g.getImageData(ix,iy,iw,ih),d=im.data;for(let k=0;k<d.length;k+=4){const n=(Math.random()-.5)*26,l=(d[k]*.3+d[k+1]*.59+d[k+2]*.11);d[k]=Math.min(255,l*1.08+28+n);d[k+1]=Math.min(255,l*.95+16+n);d[k+2]=Math.min(255,l*.72+4+n)}g.putImageData(im,ix,iy);
    const vg=g.createRadialGradient(ix+iw/2,iy+ih/2,iw*.25,ix+iw/2,iy+ih/2,iw*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(60,30,0,.45)');g.fillStyle=vg;g.fillRect(ix,iy,iw,ih);
    if(!P){g.fillStyle='#5a4a3a';g.font=17*s+'px '+KAI;g.textAlign='right';g.textBaseline='alphabetic';g.fillText('民國六十二年　春',ix+iw-6*s,ph.y+ph.h-14*s);g.restore()}}
  else if(id==='tinside'){g.fillStyle='#9a2a20';g.fillRect(0,0,W,Hh);g.fillStyle='#d8b050';g.fillRect(0,0,W,8);g.fillRect(0,Hh-8,W,8);
    for(let k=0;k<8;k++){const x=(k+.5)*W/8,y=Hh/2;g.fillStyle='rgba(250,230,200,.55)';for(let p=0;p<5;p++){g.beginPath();g.ellipse(x+Math.cos(p*1.256)*13,y+Math.sin(p*1.256)*13,9,6,p*1.256,0,7);g.fill()}g.fillStyle='rgba(240,200,80,.8)';g.beginPath();g.arc(x,y,6,0,7);g.fill()}}
  else if(id==='tinlid'){const gr=g.createRadialGradient(W*.4,Hh*.35,10,W/2,Hh/2,W*.55);gr.addColorStop(0,'#c0463a');gr.addColorStop(1,'#7a1c14');g.fillStyle=gr;g.fillRect(0,0,W,Hh);
    g.strokeStyle='#d8b050';g.lineWidth=6;g.beginPath();g.arc(W/2,Hh/2,W*.44,0,7);g.stroke();
    for(let k=0;k<6;k++){const a=k*1.047,x=W/2+Math.cos(a)*W*.25,y=Hh/2+Math.sin(a)*Hh*.25;g.fillStyle='rgba(250,225,190,.5)';for(let p=0;p<5;p++){g.beginPath();g.ellipse(x+Math.cos(p*1.256)*16,y+Math.sin(p*1.256)*16,12,7,p*1.256,0,7);g.fill()}g.fillStyle='rgba(240,200,80,.85)';g.beginPath();g.arc(x,y,7,0,7);g.fill()}
    g.fillStyle='rgba(250,225,190,.6)';for(let p=0;p<6;p++){g.beginPath();g.ellipse(W/2+Math.cos(p*1.047)*26,Hh/2+Math.sin(p*1.047)*26,20,11,p*1.047,0,7);g.fill()}g.fillStyle='#e8c050';g.beginPath();g.arc(W/2,Hh/2,12,0,7);g.fill()}
  else if(id==='tin'||id==='tinopen'){const op=id==='tinopen',cx=(op?205:240)*s;bg();shadow(cx,292*s,150*s,26*s);const cy=200*s,rx=135*s,ry=48*s,hh=78*s;
    g.fillStyle='#7a1c14';g.fillRect(cx-rx,cy-hh/2,rx*2,hh);g.beginPath();g.ellipse(cx,cy+hh/2,rx,ry,0,0,Math.PI);g.fill();
    const sg=g.createLinearGradient(cx-rx,0,cx+rx,0);sg.addColorStop(0,'rgba(0,0,0,.35)');sg.addColorStop(.35,'rgba(255,220,200,.18)');sg.addColorStop(1,'rgba(0,0,0,.4)');g.fillStyle=sg;g.fillRect(cx-rx,cy-hh/2,rx*2,hh+ry*.9);
    g.fillStyle='#d8b050';g.fillRect(cx-rx,cy+hh/2-10*s,rx*2,6*s);
    for(let k=0;k<5;k++){const x=cx-rx*.8+k*rx*.4,y=cy+8*s;g.fillStyle='rgba(250,225,190,.45)';for(let p=0;p<5;p++){g.beginPath();g.ellipse(x+Math.cos(p*1.256)*10*s,y+Math.sin(p*1.256)*10*s,8*s,5*s,p*1.256,0,7);g.fill()}}
    if(op){g.fillStyle='#4a120c';g.beginPath();g.ellipse(cx,cy-hh/2,rx,ry,0,0,7);g.fill();
      g.save();g.translate(cx-30*s,cy-hh/2);g.rotate(-.12);g.fillStyle='#f3ead4';g.fillRect(-70*s,-30*s,140*s,62*s);g.strokeStyle='rgba(150,110,70,.6)';g.lineWidth=1.5*s;g.beginPath();g.moveTo(-70*s,-30*s);g.lineTo(0,4*s);g.lineTo(70*s,-30*s);g.stroke();
      g.fillStyle='#3a2a1a';g.font=14*s+'px '+KAI;g.textAlign='center';g.fillText('給乖孫',0,22*s);g.restore();
      const coin=(x,y,r,gold)=>{const cg=g.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);cg.addColorStop(0,gold?'#fff0a0':'#f3c58a');cg.addColorStop(1,gold?'#c08a10':'#9a5a22');g.fillStyle=cg;g.beginPath();g.ellipse(x,y,r,r*.55,0,0,7);g.fill();g.strokeStyle=gold?'#8a6008':'#6a3a12';g.lineWidth=2*s;g.stroke()};
      coin(cx+70*s,cy-hh/2+6*s,24*s,false);if(G&&G.story&&G.story.goldBox)coin(cx+30*s,cy-hh/2+24*s,22*s,true);
      g.fillStyle='#f0e0b0';g.save();g.translate(cx+96*s,cy-hh/2-14*s);g.rotate(.3);g.fillRect(-12*s,-7*s,24*s,14*s);g.fillStyle='#3a2a1a';g.font=10*s+'px '+KAI;g.textAlign='center';g.textBaseline='middle';g.fillText('乖孫',0,0);g.restore();
      g.save();g.translate(cx+rx+22*s,cy+6*s);g.rotate(1.38);const lg2=g.createLinearGradient(-rx,0,rx,0);lg2.addColorStop(0,'#6a1810');lg2.addColorStop(.5,'#b8402e');lg2.addColorStop(1,'#5a140c');g.fillStyle=lg2;g.beginPath();g.ellipse(0,0,rx*.98,ry*.92,0,0,7);g.fill();g.strokeStyle='#d8b050';g.lineWidth=5*s;g.stroke();g.restore()}
    else{const lg=g.createRadialGradient(cx-40*s,cy-hh/2-14*s,5,cx,cy-hh/2,rx);lg.addColorStop(0,'#c8483a');lg.addColorStop(1,'#7a1c14');g.fillStyle=lg;g.beginPath();g.ellipse(cx,cy-hh/2,rx+4*s,ry+3*s,0,0,7);g.fill();g.strokeStyle='#d8b050';g.lineWidth=5*s;g.stroke();
      for(let k=0;k<6;k++){const a=k*1.047,x=cx+Math.cos(a)*rx*.55,y=cy-hh/2+Math.sin(a)*ry*.55;g.fillStyle='rgba(250,225,190,.45)';for(let p=0;p<5;p++){g.beginPath();g.ellipse(x+Math.cos(p*1.256)*11*s,y+Math.sin(p*1.256)*6*s,8*s,4*s,p*1.256,0,7);g.fill()}}}}
  else if(id==='mine'){bg();shadow(240*s,268*s,90*s,18*s);const x=240*s,y=180*s,r=84*s;
    if(oneImgURL&&memoCoinImg&&memoCoinImg.complete&&memoCoinImg.naturalWidth){g.save();g.beginPath();g.arc(x,y,r,0,7);g.clip();g.drawImage(memoCoinImg,x-r,y-r,r*2,r*2);g.restore()}
    else{const cg=g.createRadialGradient(x-r*.3,y-r*.3,4,x,y,r);cg.addColorStop(0,'#f6cf96');cg.addColorStop(1,'#9a5a22');g.fillStyle=cg;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
    g.strokeStyle='rgba(255,240,210,.4)';g.lineWidth=3*s;g.beginPath();g.arc(x,y,r-2*s,3.5,4.6);g.stroke();
    g.strokeStyle='#c8281e';g.lineWidth=2.5*s;g.beginPath();g.moveTo(x+r*.62,y-r*.62);g.quadraticCurveTo(x+r*1.2,y-r*1.1,x+r*1.45,y-r*.55);g.stroke();
    g.save();g.translate(x+r*1.5,y-r*.42);g.rotate(.25);g.fillStyle='#f3ead4';g.fillRect(-30*s,-15*s,60*s,30*s);g.fillStyle='#c8281e';g.beginPath();g.arc(-22*s,0,3*s,0,7);g.fill();g.fillStyle='#3a2a1a';g.font='bold '+16*s+'px '+KAI;g.textAlign='center';g.textBaseline='middle';g.fillText('乖孫',4*s,1*s);g.restore()}
  return c}
let memoCoinImg=null;function memoCoinLoad(){if(memoCoinImg||!oneImgURL)return;memoCoinImg=new Image();memoCoinImg.onload=()=>{delete memoImgC.mine};memoCoinImg.src=oneImgURL}
