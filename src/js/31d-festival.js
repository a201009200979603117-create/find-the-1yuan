// ================= 劇情：鎮上的人、長椅上的兩位老人、一元展和天燈、阿公的收音機 =================
// ---------- 人的模型（站著或坐著，頭會轉過來看你） ----------
function makePerson(o){const h=o.h||1,g=new THREE.Group(),root=new THREE.Group();g.add(root);root.scale.setScalar(h);
  const skin=paint(o.skin||0xe8c4a0,0,.75),top=paint(o.top,0,.85),bot=paint(o.bot,0,.85),hairM=paint(o.hairC||0x222222,0,.9),shoe=paint(0x2a2420,.1,.7),dark=paint(0x161616,0,.6);
  const legs=[];for(const sx of[-1,1]){const th=new THREE.Group();th.position.set(sx*.08,.84,0);root.add(th);mk(th,cylGeo(.062,.056,.42,10),bot,0,-.21,0);
    const sh=new THREE.Group();sh.position.y=-.42;th.add(sh);mk(sh,cylGeo(.054,.048,.4,10),o.skirt&&!o.kid?skin:bot,0,-.2,0);bx(sh,.1,.06,.2,shoe,0,-.41,-.04);legs.push({th,sh})}
  rbx(root,.34,.16,.22,.05,bot,0,.86,0);
  if(o.skirt)mk(root,cylGeo(.17,.26,.36,14),bot,0,.72,0);
  const body=new THREE.Group();body.position.y=.9;root.add(body);
  rbx(body,.36*(o.wide||1),.5,.22,.07,top,0,.25,0);
  if(o.apron)bx(body,.3,.46,.012,paint(o.apron,0,.9),0,.12,-.117);
  if(o.tie)bx(body,.04,.22,.01,paint(o.tie,0,.6),0,.33,-.116);
  if(o.bow)bx(body,.1,.04,.02,paint(0x161616,0,.5),0,.47,-.115);
  mk(body,cylGeo(.05,.055,.08,10),skin,0,.53,0);
  const arms=[];for(const sx of[-1,1]){const a=new THREE.Group();a.position.set(sx*.205*(o.wide||1),.46,0);body.add(a);mk(a,cylGeo(.048,.044,.5,10),top,0,-.25,0);sph(a,.05,skin,0,-.53,0);a.rotation.z=sx*.08;arms.push(a)}
  const head=new THREE.Group();head.position.y=.69;body.add(head);
  mk(head,sphGeo(.135,18,14),skin,0,0,0).scale.set(1,1.06,1);
  for(const sx of[-1,1]){mk(head,sphGeo(.014,8,6),dark,sx*.045,.015,-.124);mk(head,sphGeo(.03,8,6),skin,sx*.13,0,0)}
  mk(head,sphGeo(.018,8,6),paint(0xd8a88a,0,.8),0,-.02,-.133);
  bx(head,.05,.008,.01,paint(0x8a4a3a,0,.7),0,-.065,-.122);
  if(o.cheek)for(const sx of[-1,1])mk(head,sphGeo(.022,8,6),paint(0xf0a0a0,0,.9),sx*.075,-.035,-.105).scale.set(1,.6,.5);
  const hair=o.hair||'short';
  if(hair!=='bald')mk(head,new THREE.SphereGeometry(.145,18,10,0,Math.PI*2,0,hair==='long'?Math.PI*.62:Math.PI*.5),hairM,0,.01,.012).rotation.x=-.25;
  else mk(head,new THREE.SphereGeometry(.142,18,8,Math.PI*.15,Math.PI*1.7,Math.PI*.42,Math.PI*.2),hairM,0,0,0).rotation.y=Math.PI;
  if(hair==='bun')sph(head,.07,hairM,0,.1,.12);
  if(hair==='braid')for(const sx of[-1,1]){mk(head,cylGeo(.025,.02,.22,8),hairM,sx*.12,-.13,.04);sph(head,.03,paint(0xd83a4a,0,.6),sx*.12,-.25,.04)}
  if(hair==='long')mk(head,cylGeo(.135,.155,.28,16,true,-Math.PI*.6,Math.PI*1.2),hairM,0,-.1,.02);
  if(hair==='cap'){mk(head,new THREE.SphereGeometry(.15,18,8,0,Math.PI*2,0,Math.PI*.45),paint(o.capC||0xc0392b,0,.7),0,.02,0);bx(head,.2,.015,.12,paint(o.capC||0xc0392b,0,.7),0,.045,-.15)}
  if(hair==='hat'){mk(head,cylGeo(.3,.3,.015,20),paint(0xd8c07a,0,.9),0,.1,0);mk(head,cylGeo(.12,.15,.1,16),paint(0xd8c07a,0,.9),0,.15,0)}
  if(o.glasses){const fr=paint(0x2a1a10,.4,.4);for(const sx of[-1,1])mk(head,new THREE.TorusGeometry(.032,.006,6,16),fr,sx*.048,.015,-.132);bx(head,.03,.006,.006,fr,0,.02,-.135)}
  g.traverse(x=>{if(x.isMesh)x.castShadow=true});linColors(g);
  return{g,root,body,head,arms,legs,h}}
function sitPose(p,on){for(const l of p.legs){l.th.rotation.x=on?Math.PI/2:0;l.sh.rotation.x=on?-Math.PI/2:0}p.root.position.y=on?.47-.84*p.h+.04:0}
// 名牌和對話泡泡（畫在畫布上的看板，永遠面向鏡頭）
function textSprite(txt,kind){const lines=wrapTxt(L(txt),kind==='tag'?40:13),fs=kind==='tag'?30:32,W=512,lh=fs*1.35,Hh=Math.ceil(lines.length*lh+(kind==='tag'?22:44));
  const c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');g.font=(kind==='tag'?'bold ':'')+fs+'px "Microsoft JhengHei","PingFang TC",sans-serif';
  const tw=Math.min(W-8,Math.max(...lines.map(s=>g.measureText(s).width))+(kind==='tag'?34:44)),x0=(W-tw)/2;
  g.fillStyle=kind==='tag'?'rgba(20,16,12,.72)':'rgba(255,250,238,.96)';g.beginPath();g.roundRect?g.roundRect(x0,2,tw,Hh-(kind==='tag'?4:24),16):g.rect(x0,2,tw,Hh-24);g.fill();
  if(kind!=='tag'){g.beginPath();g.moveTo(W/2-14,Hh-23);g.lineTo(W/2,Hh-4);g.lineTo(W/2+14,Hh-23);g.fill()}
  g.fillStyle=kind==='tag'?'#f2dca0':'#3a2a1a';g.textAlign='center';g.textBaseline='middle';lines.forEach((s,i)=>g.fillText(s,W/2,(kind==='tag'?11:20)+lh*(i+.5)));
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,depthTest:kind==='tag'}));sp.renderOrder=kind==='tag'?5:6;
  const sc=kind==='tag'?.95:1.2;sp.scale.set(sc,sc*Hh/W,1);sp.center.set(.5,0);return sp}
function wrapTxt(s,n){if(/ /.test(s)&&!HAN_RE.test(s)){const w=s.split(' '),out=[];let cur='';const m=n*2.1;for(const x of w){if((cur+' '+x).trim().length>m&&cur){out.push(cur);cur=x}else cur=(cur+' '+x).trim()}if(cur)out.push(cur);return out}
  const out=[];for(let i=0;i<s.length;i+=n)out.push(s.slice(i,i+n));return out}

// ---------- 鎮上的人 ----------
const TOWN=[
  {id:'huang',n:'黃理事長',coin:'y1960',look:{top:0x2c3550,bot:0x2a2a2e,hair:'short',hairC:0x8a8a8a,glasses:1,tie:0xa83232},
    a:'那枚民國四十九年的一圓，就是我的第一枚。六歲的我一定想不到，會在這裡再看到它。',b:'我的那枚好像沒找到，大概被我自己偷偷花掉了，哈哈。',c:'你阿公要是看到今天這樣，一定很高興。'},
  {id:'lan',n:'秀蘭阿嬤',coin:'bent',look:{top:0xd87a90,bot:0x2a3550,hair:'bun',hairC:0xe6e6e6,h:.9,skirt:1,cheek:1},
    a:'凹凹的那枚，真的是我的！你阿公說得對，凹的也是一元。',b:'我的那枚沒找到也沒關係，今天晚上已經夠開心了。',c:'枝仔冰在桌上，自己拿喔！'},
  {id:'chen',n:'陳師傅',coin:'gold',look:{top:0x5a6a48,bot:0x3a3a3a,hair:'short',hairC:0xdedede,h:.96},
    a:'這枚一元，終於送出去了。',b:'這枚一元，終於送出去了。',c:'五十年了，柑仔店的彈珠汽水還是一樣好喝。'},
  {id:'de',n:'阿德',coin:'scratch',look:{top:0x3a6aa8,bot:0x33333a,apron:0x7a4a20,wide:1.12,hair:'short'},
    a:'那枚刮傷的是我的啦！跟螺絲放在一起，難怪。',b:'收音機還好用嗎？那是你阿公的寶貝。',c:'收音機還好用嗎？那是你阿公的寶貝。'},
  {id:'tsai',n:'阿財',coin:'red',look:{top:0xf0f0f0,bot:0x40506a,hair:'cap',capC:0xc0392b,skin:0xd8a878},
    a:'紅紅的那枚是我的！就是小時候想磨成金的那枚！',b:'椅子我載來了，坐坐坐！',c:'椅子我載來了，坐坐坐！'},
  {id:'ahai',n:'阿海伯',coin:'holed',look:{top:0x4a7aa0,bot:0x2a2a2a,hair:'hat',skin:0xc08a60,h:.95},
    a:'那枚有洞的，是我的護身符。謝謝你幫我找回來。',b:'我那枚，可能還綁在船上吧，哈哈。',c:'今天風很好，天燈會飛很高。'},
  {id:'yun',n:'小芸',coin:'shiny',look:{top:0xf6f6f6,bot:0x2c3e8a,hair:'braid',h:.66,skirt:1,kid:1,cheek:1},
    a:'我的新亮一元！阿公送我的那顆糖，是草莓口味的。',b:'沒找到也沒關係，我要把今天的一元存進撲滿裡！',c:'我把今天的零用錢存進撲滿了！'},
  {id:'kai',n:'阿凱',coin:'magnet',look:{top:0xf6f6f6,bot:0x2c3e8a,hair:'short',h:.7,kid:1},
    a:'我的磁鐵一元！你看，迴紋針還黏在上面耶！',b:'我帶了磁鐵來，可是好像吸不到它……',c:'天燈什麼時候放？我好期待！'},
  {id:'mei',n:'美玲老師',coin:'plum',look:{top:0xc98a5a,bot:0x4a4a5a,hair:'long',hairC:0x2a1a10,glasses:1,skirt:1,h:.95},
    a:'梅花那枚是我的。看吧，幸運的一元，真的回來了。',b:'我的幸運一元沒回來，可是今天大家都很幸運。',c:'孩子們都說，這是今年最好玩的一天。'},
  {id:'ming',n:'阿明叔',coin:'twin',look:{top:0xa82020,bot:0x161616,hair:'short',bow:1},
    a:'猜猜看，正面還是反面？……兩面都是正面啦！',b:'我的魔術道具不見了？沒關係，我再變一枚出來給你！',c:'要不要看魔術？……下次再表演！'},
  {id:'shui',n:'阿水伯',coin:'worn',look:{top:0xd8d0b8,bot:0x3a3a3a,hair:'bald',hairC:0xd0d0d0,h:.92},
    a:'磨平的那枚是我的，四十年的豆花錢啊。',b:'我帶了豆花來，大家都吃吃看！',c:'豆花還有，多吃一碗！'}];
const TOWNP=Object.fromEntries(TOWN.map(p=>[p.id,p]));
const ELDER_LINES=[['lan','他還是一樣，講沒兩句話就臉紅。'],['chen','這枚一元，終於送出去了。'],['lan','你阿公以前也最喜歡坐在這裡看星星。'],['chen','謝謝你阿公，幫我保管了這麼久。'],['lan','枝仔冰吃完了嗎？阿嬤明天再帶來。'],['chen','五十年了，她笑起來還是一樣。']];
let folk=[];
function addFolk(id,x,z,yaw,sit){const d=TOWNP[id],p=makePerson(d.look);p.id=id;p.d=d;p.g.position.set(x,0,z);p.yaw=yaw;p.g.rotation.y=yaw;p.sit=!!sit;sitPose(p,p.sit);
  p.tag=textSprite(d.n,'tag');p.tag.position.y=(p.sit?1.28:1.78)*p.h+.08;p.tag.visible=false;p.g.add(p.tag);
  p.bub=null;p.bt=0;p.talk=0;p.fade=0;p.ph=Math.random()*6;p.g.scale.setScalar(.01);scene.add(p.g);folk.push(p);return p}
function removeFolk(p){scene.remove(p.g);disposeObj(p.g);folk=folk.filter(x=>x!==p)}
function sayFolk(p,txt){if(p.bub){p.g.remove(p.bub);disposeObj(p.bub)}p.bub=textSprite(txt,'bub');p.bub.position.y=(p.sit?1.32:1.86)*p.h+.12;p.g.add(p.bub);p.bt=6.5;p.talk=1.6;
  for(let k=0;k<3;k++)setTimeout(()=>tone((p.d.look.kid?620:p.d.look.h<.95?430:330)+Math.random()*60,.06,'triangle',.02),k*90)}
function updateFolk(dt,now){for(const p of folk){
  const tgt=p.gone?0:1;p.fade+=(tgt-p.fade)*Math.min(1,dt*2.5);p.g.scale.setScalar(Math.max(.01,p.fade));
  const gp=p.g.position,dx=pl.x-gp.x,dz=pl.z-gp.z,dist=Math.hypot(dx,dz);
  let hy=0;if(dist<5){hy=Math.atan2(-dx,-dz)-p.yaw;while(hy>Math.PI)hy-=6.283;while(hy<-Math.PI)hy+=6.283;hy=Math.max(-.9,Math.min(.9,hy))}
  p.head.rotation.y+=(hy-p.head.rotation.y)*Math.min(1,dt*4);p.head.rotation.x=Math.sin(now/1900+p.ph)*.05+(dist<5?-.08:0);
  p.body.rotation.x=Math.sin(now/1300+p.ph)*.015;p.talk=Math.max(0,p.talk-dt);
  p.arms.forEach((a,i)=>{a.rotation.x=p.talk>0&&i===1?-.9+Math.sin(now/120)*.25:(p.sit?-.55:Math.sin(now/1500+p.ph+i)*.04)});
  p.tag.visible=dist<4.5&&!p.bub;
  if(p.bub){p.bt-=dt;p.bub.material.opacity=Math.min(1,p.bt);if(p.bt<=0){p.g.remove(p.bub);disposeObj(p.bub);p.bub=null}}}
  folk.filter(p=>p.gone&&p.fade<.03).forEach(removeFolk)}
const nearFolk=()=>{let best=null,bd=1.7;for(const p of folk){if(p.gone)continue;const d=Math.hypot(pl.x-p.g.position.x,pl.z-p.g.position.z);if(d<bd){bd=d;best=p}}return best};
function talkFolk(p){const S=G.story;if(p.mus){talkMus(p);return}
  if(p.id==='lan'||p.id==='chen'){if(!fest){const EL=seaElder()||ELDER_LINES,k=(S.elderK=(S.elderK||0)+1)%EL.length,[who,txt]=EL[k];const q=folk.find(x=>x.id===who&&!x.gone)||p;sayFolk(q,txt);return}}
  p.n=(p.n||0)+1;sayFolk(p,p.n===1?(G.coll[p.d.coin]?p.d.a:p.d.b):p.n%2?p.d.c:(G.coll[p.d.coin]?p.d.a:p.d.b));
  if(fest){fest.talked.add(p.id)}}

// ---------- 長椅上的兩位老人（收到〈長椅〉這封信以後，晚上會來） ----------
let elderSeat=null;
function benchSeats(b){const c=fpCenter('bench',b.gx,b.gz,b.dir),[fx,fz]=DIRS[b.dir],ax=-fz,az=fx,y=(b.L||0)*LH;
  return{l:{x:c.x+ax*.55+fx*.1,z:c.z+az*.55+fz*.1},r:{x:c.x-ax*.55+fx*.1,z:c.z-az*.55+fz*.1},yaw:Math.atan2(-fx,-fz),y}}
function updateElders(){const S=G.story;
  const want=!fest&&S.got.reunion&&(SET.daynight===false||isNight());const b=want?hasBench():null;
  if(b&&!elderSeat){const s=benchSeats(b);elderSeat=b;for(const[id,q]of[['lan',s.l],['chen',s.r]]){const p=addFolk(id,q.x,q.z,s.yaw,true);p.g.position.y=s.y;p.elder=1}
    if(!S.met){S.met=1;setTimeout(()=>toast('🌙 秀蘭阿嬤和陳師傅，坐在你院子的長椅上','gold'),800)}}
  if(elderSeat&&(!b||b!==elderSeat||!tiles.has(tkey(b.gx,b.gz,b.L||0)))){folk.filter(p=>p.elder).forEach(p=>p.gone=1);elderSeat=null}}

// ---------- 一元展 ----------
let fest=null;
function festStart(){const S=G.story;if(!S||S.festDone||fest)return;S.fest=1;
  folk.filter(p=>p.elder).forEach(p=>p.gone=1);elderSeat=null;
  fest={t:0,talked:new Set(),ready:false,launched:0,lan:[],tod0:G.tod??9,todT:SET.daynight!==false&&!isNight()?5:0,cred:null};
  // 鎮民站在收藏櫃前面和院子裡，面向中間
  let cab=null;for(const t of tiles.values())if(t.type==='cabinet'){cab=t;break}
  const spots=[];const tryAt=(x,z)=>allowed(x,z)&&!occ.has(tkey(Math.floor(x),Math.floor(z)))&&spots.every(q=>Math.hypot(q.x-x,q.z-z)>1)&&Math.hypot(x-MAILP.x,z-MAILP.z)>1.2;
  const add=(x,z,fx,fz)=>{spots.push({x,z,yaw:Math.atan2(-(fx-x),-(fz-z))})};
  if(cab){const c=fpCenter('cabinet',cab.gx,cab.gz,cab.dir),[fx,fz]=DIRS[cab.dir];for(const[r,o]of[[1.5,0],[1.7,.7],[1.7,-.7],[2.5,.35],[2.5,-.35]]){const a=Math.atan2(-fz,-fx)+o,x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;if(tryAt(x,z))add(x,z,c.x,c.z)}}
  const b=hasBench(),bs=b?benchSeats(b):null;
  for(let ring=0;ring<4&&spots.length<12;ring++){const r=2.6+ring*1.4;for(let k=0;k<10&&spots.length<12;k++){const a=k/10*6.283+ring*.4,x=Math.cos(a)*r,z=Math.sin(a)*r;if(tryAt(x,z))add(x,z,0,0)}}
  const ids=TOWN.map(p=>p.id).filter(id=>!(bs&&(id==='lan'||id==='chen')));
  ids.forEach((id,i)=>{const s=spots[i];if(s)addFolk(id,s.x,s.z,s.yaw,false)});
  if(bs){for(const[id,q]of[['lan',bs.l],['chen',bs.r]]){const p=addFolk(id,q.x,q.z,bs.yaw,true);p.g.position.y=bs.y}S.met=1}
  festLights(true);
  if(!cat&&!HFm&&H-Rp>=3.5)spawnCat();
  toast(EN_ON?'🏮 The townsfolk are here! Walk up and '+(TOUCH?'tap "Use"':'press E')+' to chat with them':'🏮 鎮上的人來了！走過去%s，跟大家聊聊'.replace('%s',TOUCH?'按「互動」':'按 E'),'gold');chime()}
function festTick(dt,now){if(!fest)return;const S=G.story;fest.t+=dt;
  if(fest.todT>0){fest.todT-=dt;const k=1-Math.max(0,fest.todT)/5;let a=fest.tod0,b2=19.4;G.tod=a+(b2-a)*k;envT=0;sunT=0}
  if(lights)lights.material.opacity=.75+Math.sin(now/600)*.08;
  if(!fest.ready&&(fest.talked.size>=3||fest.t>90)){fest.ready=true;const h=folk.find(p=>p.id==='huang');if(h)sayFolk(h,'大家準備好了嗎？到院子中間，我們來放天燈！');toast('🏮 黃理事長：到院子中間，我們來放天燈！','gold');launchMark(true)}
  if(markM){markM.material.opacity=.45+Math.sin(now/300)*.25;markM.rotation.z+=dt*.4}
  for(const l of fest.lan){l.t+=dt;if(l.t<0){l.g.visible=false;continue}l.g.visible=true;l.v=Math.min(.85,l.v+dt*.025);l.g.position.y+=l.v*dt;l.g.position.x+=(.18+Math.sin(l.t*.6+l.ph)*.22)*dt;l.g.position.z+=Math.cos(l.t*.45+l.ph)*.25*dt;l.g.rotation.y+=dt*.2;
    const f=.85+Math.sin(now/90+l.ph*7)*.15;l.glow.material.opacity=f;if(l.g.position.y>70){const o=Math.max(0,1-(l.g.position.y-70)/40);l.m.material.opacity=.95*o;l.glow.material.opacity*=o}}
  if(fest.launched&&!fest.cred&&fest.t-fest.launched>6)startCredits();
  // 天亮以後大家回家
  if(S.festDone&&(SET.daynight===false?fest.t-fest.doneT>120:G.tod>5.5&&G.tod<18)){folk.forEach(p=>p.gone=1);festLights(false);launchMark(false);fest.lan.forEach(l=>{scene.remove(l.g);disposeObj(l.g)});fest=null}}
// 院子上方的燈泡串
let lights=null,bulbTex=null;
function festLights(on){if(lights){scene.remove(lights);lights.geometry.dispose();lights.material.dispose();lights=null}if(banner){scene.remove(banner);disposeObj(banner);banner=null}if(!on)return;
  if(!bulbTex){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.2,'rgba(255,255,255,.9)');gr.addColorStop(.45,'rgba(255,255,255,.25)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);bulbTex=new THREE.CanvasTexture(cv)}
  const pos=[],col=[],C=[[1,.85,.55],[1,.35,.25],[1,.72,.2],[.55,1,.5],[1,.95,.8]];let k=0;
  const run=(x0,z0,x1,z1,y,sag)=>{const len=Math.hypot(x1-x0,z1-z0),n=Math.max(2,Math.round(len/.7));for(let i=0;i<=n;i++){const t=i/n;pos.push(x0+(x1-x0)*t,y-sag*4*t*(1-t),z0+(z1-z0)*t);const c=C[k++%C.length];col.push(c[0],c[1],c[2])}};
  const X0=-H-EXT+.4,X1=H-.4,Z0=-H+.6,Z1=H-.4;
  for(let x=X0;x<X1-1;x+=4)run(x,Z1,Math.min(X1,x+4),Z1,5.3,.45);for(let x=X0;x<X1-1;x+=4)run(x,Z0,Math.min(X1,x+4),Z0,5.3,.45);
  for(let z=Z0;z<Z1-1;z+=4){run(X0,z,X0,Math.min(Z1,z+4),5.3,.45);run(X1,z,X1,Math.min(Z1,z+4),5.3,.45)}
  for(const x of[X0+(X1-X0)*.33,X0+(X1-X0)*.66])run(x,Z0,x,Z1,5.6,1.4);run(X0,0,X1,0,5.6,1.4);
  const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gm.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  lights=new THREE.Points(gm,new THREE.PointsMaterial({size:.55,map:bulbTex,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));lights.frustumCulled=false;scene.add(lights);
  const t=canvasTex(1024,256,(g,W,Hh)=>{g.fillStyle='#b0201a';g.fillRect(0,0,W,Hh);g.fillStyle='#8a1612';for(let x=0;x<W;x+=8)g.fillRect(x,0,2,Hh);g.strokeStyle='#e8c050';g.lineWidth=10;g.strokeRect(14,14,W-28,Hh-28);
    g.fillStyle='#ffe08a';g.textAlign='center';g.textBaseline='middle';g.font='900 120px "DFKai-SB","BiauKai","Kaiti TC","Microsoft JhengHei",serif';g.fillText('海口庄　一元展',W/2,Hh/2+6)});
  banner=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.15),new THREE.MeshStandardMaterial({map:t,side:THREE.DoubleSide,roughness:.9,emissive:0x401008,emissiveIntensity:.6}));banner.position.set(0,4.55,H-.3);banner.rotation.y=Math.PI;scene.add(banner)}
let banner=null,markM=null;const LAUNCH={x:0,z:0};
function launchMark(on){if(markM){scene.remove(markM);markM.geometry.dispose();markM.material.dispose();markM=null}if(!on)return;
  for(let r=0;r<H;r+=.5){let ok=false;for(let k=0;k<12;k++){const a=k/12*6.283,x=Math.cos(a)*r,z=Math.sin(a)*r;if(allowed(x,z)&&!occ.has(tkey(Math.floor(x),Math.floor(z)))&&folk.every(p=>Math.hypot(p.g.position.x-x,p.g.position.z-z)>1.2)){LAUNCH.x=x;LAUNCH.z=z;ok=true;break}}if(ok)break}
  markM=new THREE.Mesh(new THREE.RingGeometry(.55,.8,48),new THREE.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));markM.rotation.x=-Math.PI/2;markM.position.set(LAUNCH.x,groundAt(LAUNCH.x,LAUNCH.z)+.03,LAUNCH.z);scene.add(markM)}
const nearLaunch=()=>fest&&fest.ready&&!fest.launched&&Math.hypot(pl.x-LAUNCH.x,pl.z-LAUNCH.z)<1.8;
// 天燈：每個人一盞，牆外的鎮民也一起放
const LANT_W=['平安','健康','團圓','順利','幸福','海口庄','一元','謝謝'];const lanTexC={};
function lanTex(w){return lanTexC[w]||(lanTexC[w]=canvasTex(256,256,(g,W,Hh)=>{const gr=g.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,'#f6d6a0');gr.addColorStop(1,'#ffb060');g.fillStyle=gr;g.fillRect(0,0,W,Hh);
  g.strokeStyle='rgba(160,90,30,.35)';g.lineWidth=3;for(let x=0;x<W;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,Hh);g.stroke()}
  g.fillStyle='#b8261a';g.textAlign='center';g.textBaseline='middle';const n=[...w].length;g.font='900 '+(n>2?62:84)+'px "DFKai-SB","BiauKai","Kaiti TC","Microsoft JhengHei",serif';
  if(n<=2)[...w].forEach((ch,i)=>g.fillText(ch,W/2,Hh/2+(i-(n-1)/2)*88));else[...w].forEach((ch,i)=>g.fillText(ch,W/2,Hh/2+(i-(n-1)/2)*62))}))}
function makeLantern(word,x,y,z){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.CylinderGeometry(.34,.24,.72,4,1,true),new THREE.MeshBasicMaterial({map:lanTex(word),transparent:true,opacity:.95,side:THREE.DoubleSide,fog:false}));m.rotation.y=Math.PI/4;g.add(m);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:memoTex||bulbTex,color:0xffa040,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));glow.scale.setScalar(1.4);glow.position.y=-.2;g.add(glow);
  g.scale.setScalar(1.5);g.position.set(x,y,z);scene.add(g);return{g,m,glow,t:0,v:.22+Math.random()*.16,ph:Math.random()*6}}
function launchLanterns(){if(!fest||fest.launched)return;memoMats();fest.launched=fest.t;launchMark(false);
  const me=makeLantern('謝謝阿公',LAUNCH.x+(-Math.sin(pl.yaw))*.8,1.4,LAUNCH.z+(-Math.cos(pl.yaw))*.8);me.v=.3;fest.lan.push(me);
  const pt=new THREE.PointLight(0xffa050,1.4,9,1.6);pt.position.y=-.2;me.g.add(pt);
  folk.forEach((p,i)=>{if(p.gone)return;const l=makeLantern(LANT_W[i%LANT_W.length],p.g.position.x,1.6+p.h*.3,p.g.position.z);l.t=-.6-i*.35;fest.lan.push(l)});
  for(let k=0;k<26;k++){const a=Math.random()*6.283,r=H+6+Math.random()*30,l=makeLantern(LANT_W[k%LANT_W.length],Math.cos(a)*r,1+Math.random()*3,Math.sin(a)*r);l.t=-Math.random()*9;fest.lan.push(l)}
  folk.forEach(p=>{p.talk=2.5});toast('🏮 抬頭看看天空','gold');
  [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.8,'sine',.03),i*260))}
// 片尾字幕：畫面下方慢慢浮現，可以一邊看天燈
const CRED=[['第一枚一元','big'],['海口信用合作社　黃理事長'],['隔壁柑仔店　秀蘭阿嬤'],['陳師傅'],['五金行的阿德　卡車司機阿財'],['阿水伯　小芸　阿凱　美玲老師　阿明叔　阿海伯'],['還有，海口庄的每一個人'],['謝謝你，慢慢地把它們找回來。','big']];
let credTok=null;
function startCredits(){fest.cred=1;const el=$('storyCred'),tok=credTok={};el.innerHTML='';el.classList.remove('hidden');let i=0;
  const next=()=>{if(tok!==credTok)return;if(i>=CRED.length){setTimeout(()=>{if(tok===credTok)endCredits()},4200);return}const[t,k]=CRED[i++];el.innerHTML='<div class="cr'+(k?' '+k:'')+'">'+t+'</div>';setTimeout(next,k?5200:3400)};next()}
function endCredits(){$('storyCred').classList.add('hidden');credTok=null;if(fest)fest.cred=1;const S=G&&G.story;if(!S||S.festDone)return;S.festDone=true;S.fest=0;S.fin=true;if(fest)fest.doneT=fest.t;
  if(G.ended){mode='end';unlock();$('endPanel').classList.remove('hidden')}}

// ---------- 靠近的時候能按 E 做的事（劇情的部分） ----------
function storyNear(){if(!storyOK())return null;
  const m=nearMemo();if(m)return{k:'memo',id:m,l:'撿起'+MEMO[m].name,s:'硬幣堆裡露出來的'};
  if(nearLaunch())return{k:'launch',l:'放天燈',s:'一元展'};
  const p=nearFolk();if(p)return{k:'folk',p,l:EN_ON?'Talk to '+L(p.d.n):'跟%s聊聊'.replace('%s',p.d.n),s:fest?'一元展':p.mus?'一元博物館':'長椅'};
  if(nearMail()){const n=mailUnread();return{k:'mail',l:'看信',s:n?n+' 封新信':'信箱'}}
  const r=nearTile('radio',1.6);if(r){const i=radioSt(),last=i===RADIO_ST.length-1;return{k:'radio',l:!i?'打開收音機':last?'關掉收音機':'轉到下一台',s:i?(EN_ON?'On air: '+L(RADIO_ST[i].n):'現在：%s'.replace('%s',RADIO_ST[i].n)):'阿公的舊收音機'}}
  return null}
function storyUse(){const s=storyNear();if(!s)return false;
  if(s.k==='memo')pickMemo(s.id);else if(s.k==='launch')launchLanterns();else if(s.k==='folk')talkFolk(s.p);else if(s.k==='mail')openMail();
  else if(s.k==='radio'){const i=(radioSt()+1)%RADIO_ST.length;G.story.radio=i;if(i){toast('📻 '+(EN_ON?'Station '+i+': '+L(RADIO_ST[i].n):'第 %s 台：'.replace('%s',i)+RADIO_ST[i].n));radioTune()}else toast('📻 收音機關掉了');radioStep=0;radioT=.9}
  return true}

// ---------- 阿公的收音機：走近才聽得到；按 E 換台（三首老歌、雨聲和蟲鳴），轉到最後一台再按一下就關掉 ----------
// 每小節：旋律[音, 拍數]和和弦；三首都是自己寫的小曲子
const RADIO_SONG=[[[[64,1],[67,1],[69,1]],'C'],[[[67,2],[64,1]],'C'],[[[62,1],[64,1],[67,1]],'G'],[[[64,3]],'C'],
  [[[67,1],[69,1],[72,1]],'Am'],[[[69,2],[67,1]],'F'],[[[64,1],[62,1],[60,1]],'C'],[[[62,3]],'G'],
  [[[64,1],[67,1],[69,1]],'C'],[[[72,2],[69,1]],'Am'],[[[67,1],[64,1],[62,1]],'G'],[[[60,3]],'C'],
  [[[69,1],[72,1],[74,1]],'Am'],[[[76,2],[74,1]],'C'],[[[72,1],[69,1],[67,1]],'F'],[[[69,3]],'Am'],
  [[[67,1],[64,1],[62,1]],'C'],[[[64,2],[67,1]],'C'],[[[62,1],[60,1],[62,1]],'G'],[[[60,3]],'C']];
// 〈月娘〉：4/4 拍，慢慢的
const RADIO_SONG2=[[[[69,2],[72,1],[74,1]],'Am'],[[[76,3],[74,1]],'C'],[[[72,1],[74,1],[72,1],[69,1]],'F'],[[[67,4]],'G'],
  [[[69,2],[72,1],[74,1]],'Am'],[[[76,2],[79,2]],'C'],[[[76,1],[74,1],[72,2]],'Dm'],[[[74,4]],'G'],
  [[[79,2],[76,1],[74,1]],'C'],[[[76,2],[72,2]],'Am'],[[[74,1],[72,1],[69,2]],'Dm'],[[[67,4]],'Em'],
  [[[69,1],[72,1],[74,1],[76,1]],'F'],[[[74,2],[72,2]],'G'],[[[69,1],[67,1],[64,2]],'Am'],[[[69,4]],'Am']];
// 〈騎鐵馬〉：2/4 拍，輕快的，每八小節響一下腳踏車鈴
const RADIO_SONG3=[[[[67,.5],[71,.5],[74,1]],'G'],[[[76,.5],[74,.5],[71,1]],'G'],[[[72,.5],[71,.5],[69,.5],[67,.5]],'C'],[[[69,2]],'D'],
  [[[67,.5],[71,.5],[74,1]],'G'],[[[79,1],[76,1]],'C'],[[[74,.5],[72,.5],[71,.5],[69,.5]],'D'],[[[67,2]],'G'],
  [[[71,.5],[71,.5],[74,1]],'G'],[[[76,.5],[76,.5],[79,1]],'C'],[[[78,.5],[76,.5],[74,1]],'D'],[[[71,2]],'G'],
  [[[72,.5],[74,.5],[76,1]],'C'],[[[74,.5],[71,.5],[67,1]],'G'],[[[69,.5],[71,.5],[69,.5],[66,.5]],'D'],[[[67,2]],'G']];
const RADIO_CH={C:[48,[60,64,67]],Am:[45,[57,60,64]],F:[41,[57,60,65]],G:[43,[55,59,62]],Dm:[50,[62,65,69]],Em:[52,[59,64,67]],D:[50,[62,66,69]]};
const RADIO_ST=[null,{n:'老歌〈海口小調〉',beats:3,B:.72,bars:RADIO_SONG},{n:'老歌〈月娘〉',beats:4,B:.82,bars:RADIO_SONG2,lead:'sine'},{n:'老歌〈騎鐵馬〉',beats:2,B:.4,bars:RADIO_SONG3},{n:'雨聲和蟲鳴',nature:1}];
// 以前的存檔是 true／false，現在是第幾台（0 是關掉）
const radioSt=()=>{const r=G&&G.story?G.story.radio:0;return r===true?1:Math.max(0,Math.min(RADIO_ST.length-1,+r||0))};
let radioBus=null,radioHiss=null,radioT=0,radioStep=0,radioNear=0,noteT=0,noteTex=null,natBus=null,natN=0;const radioNotes=[];
function radioOut(){if(radioBus)return radioBus;const g=ac.createGain();g.gain.value=0;const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=330;const pk=ac.createBiquadFilter();pk.type='peaking';pk.frequency.value=1400;pk.Q.value=.8;pk.gain.value=6;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3100;
  g.connect(hp).connect(pk).connect(lp).connect(musG);radioBus=g;
  try{const s=ac.createBufferSource();s.buffer=pinkBuf||noiseBuf;s.loop=true;const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=2400;f.Q.value=.5;const hg=ac.createGain();hg.gain.value=.05;s.connect(f).connect(hg).connect(g);s.start();radioHiss=hg}catch(e){}
  return g}
function rnote(t0,m,v,len,type){const o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),lf=ac.createOscillator(),lg=ac.createGain();o.type=type||'triangle';o2.type='sine';o.frequency.value=mtof(m);o2.frequency.value=mtof(m)*1.003;
  lf.frequency.value=5;lg.gain.value=mtof(m)*.005;lf.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.025);g.gain.exponentialRampToValueAtTime(v*.45,t0+len*.5);g.gain.exponentialRampToValueAtTime(.0001,t0+len+.25);
  o.connect(g);o2.connect(g);g.connect(radioBus);[o,o2,lf].forEach(x=>{x.start(t0);x.stop(t0+len+.3)})}
function radioTune(){if(SET.vol<=0||!audio())return;try{radioOut();const T=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(1800,T);o.frequency.exponentialRampToValueAtTime(420,T+.6);g.gain.setValueAtTime(.025,T);g.gain.exponentialRampToValueAtTime(.0001,T+.7);o.connect(g).connect(radioBus);o.start(T);o.stop(T+.75);noiseS(.6,2200,.4,.04)}catch(e){}}
// 一小節：旋律＋伴奏（3/4 拍：低音、和弦、和弦；4/4 拍：低音和弦交替；2/4 拍：碰恰）
function radioBar(st){const B=st.B,T=ac.currentTime+.05,[mel,ch]=st.bars[radioStep%st.bars.length],[bass,tri]=RADIO_CH[ch];radioStep++;radioT=B*st.beats;
  let b=0;for(const[m,n]of mel){rnote(T+b*B,m,st.lead==='sine'?.085:.075,n*B*.95,st.lead);b+=n}
  if(st.beats===3){rnote(T,bass,.07,B*1.6,'sine');for(const q of[1,2])tri.forEach(m=>rnote(T+q*B,m,.022,B*.55,'sine'))}
  else if(st.beats===4){for(const q of[0,2])rnote(T+q*B,bass,.065,B*1.8,'sine');for(const q of[1,3])tri.forEach(m=>rnote(T+q*B,m,.018,B*.8,'sine'))}
  else{rnote(T,bass,.07,B*.6,'sine');tri.forEach(m=>rnote(T+B,m,.02,B*.35,'sine'));if(radioStep%8===0){rnote(T+B*1.1,96,.03,.3,'sine');rnote(T+B*1.45,96,.03,.4,'sine')}}
  for(let c=0;c<4;c++)if(Math.random()<.6){const t0=T+Math.random()*B*st.beats;try{const s=ac.createBufferSource();s.buffer=noiseBuf;const g=ac.createGain();g.gain.setValueAtTime(.06*Math.random(),t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.012);s.connect(g).connect(radioBus);s.start(t0,Math.random());s.stop(t0+.02)}catch(e){}}}
// 雨聲和蟲鳴：一直下的小雨＋幾滴大一點的雨滴，兩隻蟋蟀輪流叫，偶爾一隻青蛙
function natureOut(){if(natBus)return natBus;const g=ac.createGain();g.gain.value=0;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6500;g.connect(lp).connect(musG);natBus=g;
  try{const s=ac.createBufferSource();s.buffer=pinkBuf||noiseBuf;s.loop=true;const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=380;const l2=ac.createBiquadFilter();l2.type='lowpass';l2.frequency.value=2400;const rg=ac.createGain();rg.gain.value=.2;s.connect(hp).connect(l2).connect(rg).connect(g);s.start()}catch(e){}
  return g}
function natureTick(){const T=ac.currentTime+.03;natN++;
  try{for(let k=0;k<3;k++)if(Math.random()<.45){const t0=T+Math.random()*.25,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf;f.type='bandpass';f.frequency.value=1600+Math.random()*2600;f.Q.value=2.5;g.gain.setValueAtTime(.012+Math.random()*.04,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.035);s.connect(f).connect(g).connect(natBus);s.start(t0,Math.random()*1.5);s.stop(t0+.05)}
    const chirp=(t0,fq)=>{for(let i=0;i<3;i++){const t=t0+i*.048,o=ac.createOscillator(),g=ac.createGain();o.frequency.value=fq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.016,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.03);o.connect(g).connect(natBus);o.start(t);o.stop(t+.04)}};
    if(natN%3===0&&Math.random()<.85)chirp(T,4300);if(natN%5===2&&Math.random()<.8)chirp(T+.1,3750);
    if(Math.random()<.018)for(let i=0;i<2;i++){const t=T+i*.17,o=ac.createOscillator(),lp=ac.createBiquadFilter(),g=ac.createGain();o.type='sawtooth';o.frequency.setValueAtTime(190,t);o.frequency.linearRampToValueAtTime(140,t+.1);lp.type='lowpass';lp.frequency.value=650;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.03,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.12);o.connect(lp).connect(g).connect(natBus);o.start(t);o.stop(t+.14)}}catch(e){}}
function updateRadio(dt){const ri=storyOK()?radioSt():0,st=RADIO_ST[ri],t=ri?nearTileAny('radio'):null;let k=0;
  if(t){const d=Math.hypot(pl.x-t.gx-.5,pl.z-t.gz-.5);k=Math.max(0,Math.min(1,1.3-d/13))}
  radioNear=k;for(const x of tiles.values())if(x.type==='radio'&&x.dial){x.dial.emissiveIntensity=ri?1.2:0;const c=st&&st.nature?0x60b8ff:0xffb040;if(x.dialC!==c){x.dialC=c;x.dial.emissive.setHex(c).convertSRGBToLinear()}}
  radioFloat(dt,st&&!st.nature?t:null,k);
  if(!ac||ac.state!=='running'||(SET.music??.35)<=0)return;if(!radioBus&&!natBus&&!t)return;
  const T=ac.currentTime;radioOut().gain.setTargetAtTime(st&&!st.nature?k*k*1.1:0,T,.3);if(st&&st.nature)natureOut();if(natBus)natBus.gain.setTargetAtTime(st&&st.nature?k*k*1.3:0,T,.3);
  if(!t||k<=0)return;radioT-=dt;if(radioT>0)return;
  if(st.nature){radioT=.25;natureTick();return}
  radioBar(st)}
const nearTileAny=tp=>{for(const t of tiles.values())if(t.type===tp)return t;return null};
// 收音機開著的時候飄出音符
function radioFloat(dt,t,k){noteT-=dt;
  if(t&&k>0&&noteT<=0){noteT=1.1+Math.random()*.6;if(!noteTex){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');x.font='bold 50px serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffe6a0';x.shadowColor='#000';x.shadowBlur=6;x.fillText('♪',32,34);noteTex=new THREE.CanvasTexture(cv)}
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:noteTex,transparent:true,depthWrite:false}));s.scale.setScalar(.22);s.position.set(t.gx+.5+(Math.random()-.5)*.3,(t.L||0)*LH+1.05,t.gz+.5+(Math.random()-.5)*.3);scene.add(s);radioNotes.push({s,t:0,dx:(Math.random()-.5)*.25})}
  for(const n of radioNotes){n.t+=dt;n.s.position.y+=dt*.32;n.s.position.x+=n.dx*dt;n.s.material.opacity=Math.max(0,1-n.t/2.4)}
  while(radioNotes.length&&radioNotes[0].t>2.4){const n=radioNotes.shift();scene.remove(n.s);n.s.material.dispose()}}
// 卡車出發時按喇叭（讀過阿財的信以後）
function honk(){if(SET.vol<=0||!audio())return;for(const k of[0,.32])for(const f of[392,494]){try{const T=ac.currentTime+k,o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;lp.type='lowpass';lp.frequency.value=1400;g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(.03,T+.02);g.gain.setValueAtTime(.03,T+.2);g.gain.exponentialRampToValueAtTime(.0001,T+.28);o.connect(lp).connect(g).connect(sfxG);o.start(T);o.stop(T+.3)}catch(e){}}}

// ---------- 每一幀 ----------
function storyWorld(dt,now){if(!G)return;
  if(!storyOK()){if(folk.length)folk.forEach(p=>p.gone=1);updateFolk(dt,now);if(fest||lights){festLights(false);launchMark(false);if(fest){fest.lan.forEach(l=>{scene.remove(l.g);disposeObj(l.g)});fest=null}}radioNear=0;if(radioBus)radioBus.gain.value=0;if(natBus)natBus.gain.value=0;return}
  const S=G.story;if(S.fest&&!fest&&!S.festDone&&mode==='play')festStart();
  if(mode==='play'||mode==='photo'){updateElders();festTick(dt,now)}
  updateFolk(dt,now);museumVisit(dt,now);updateRadio(dt)}
// 回主選單或換存檔：把劇情的東西清掉
function storyReset(){folk.slice().forEach(removeFolk);elderSeat=null;museumReset();seasonReset();festLights(false);launchMark(false);if(fest){fest.lan.forEach(l=>{scene.remove(l.g);disposeObj(l.g)});fest=null}memoClear();
  credTok=null;radioNotes.forEach(n=>scene.remove(n.s));radioNotes.length=0;radioNear=0;if(radioBus)radioBus.gain.value=0;if(natBus)natBus.gain.value=0;$('storyCred').classList.add('hidden');$('memoView').classList.add('hidden');memoMode=null}
