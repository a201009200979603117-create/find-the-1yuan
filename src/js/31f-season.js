// ================= 節日：照真實的日期，院子會自己變樣子 =================
// 過年（除夕前一週到元宵）：鐵捲門兩邊貼春聯、掛紅燈籠，晚上遠遠的有人放煙火；秀蘭阿嬤寄紅包來。
// 中秋（前四天到後兩天）：月亮又大又圓，院子裡擺著烤肉架和柚子；烤肉高手志偉寄信來。
// 沒有任務、沒有倒數，只是看了會開心的東西。網址加 ?date=2027-02-06 可以換一天看看。
const CNY_D={2026:'02-17',2027:'02-06',2028:'01-26',2029:'02-13',2030:'02-03',2031:'01-23',2032:'02-11',2033:'01-31',2034:'02-19',2035:'02-08'};
const MOON_D={2026:'09-25',2027:'09-15',2028:'10-03',2029:'09-22',2030:'09-12',2031:'10-01',2032:'09-19',2033:'09-08',2034:'09-27',2035:'09-16'};
let seasonDay=(location.search.match(/[?&]date=(\d{4}-\d\d-\d\d)/)||[])[1]||null;
function seasonNow(){const n=seasonDay?new Date(seasonDay+'T12:00:00'):new Date(),y=n.getFullYear(),day=Date.UTC(y,n.getMonth(),n.getDate());
  const off=tab=>{const md=tab[y];if(!md)return null;const[m,d]=md.split('-').map(Number);return Math.round((day-Date.UTC(y,m-1,d))/864e5)};
  const c=off(CNY_D),m=off(MOON_D);return{y,cny:c!=null&&c>=-7&&c<=14?y:0,cnyK:c,moon:m!=null&&m>=-4&&m<=2?y:0,moonK:m}}
let SEA={y:0,cny:0,moon:0},seaT=0,seaT0=0;
function seasonTick(dt,now){if(!G)return;if(!seaT0)seaT0=now;seaT-=dt;if(seaT<=0){seaT=5;SEA=seasonNow();seaLetters(now)}
  cnyDeco(!!SEA.cny);updateFireworks(dt);updateMoon();moonProps(!!SEA.moon,dt,now)}
function seasonReset(){cnyDeco(false);moonProps(false);FW.splice(0).forEach(f=>{scene.remove(f.pts);f.pts.geometry.dispose();f.pts.material.dispose()});seaT=0;seaT0=0;if(moonS)moonS.visible=moonHalo.visible=false}

// ---------- 紅紙（灑金）和上面的毛筆字 ----------
const KAI_F='"DFKai-SB","BiauKai","Kaiti TC","STKaiti","KaiTi",serif',seaTexC={};
function redPaper(g,W,Hh,x0,y0){const gr=g.createLinearGradient(0,0,W,Hh);gr.addColorStop(0,'#cc2a1c');gr.addColorStop(1,'#a51c14');g.fillStyle=gr;g.fillRect(x0||0,y0||0,W,Hh);
  for(let k=0;k<W*Hh/700;k++){g.fillStyle='rgba(255,'+(196+Math.random()*44|0)+',90,'+(.25+Math.random()*.5).toFixed(2)+')';const s=1+Math.random()*2.6;g.fillRect((x0||0)+Math.random()*W,(y0||0)+Math.random()*Hh,s,s)}
  g.strokeStyle='rgba(240,190,80,.75)';g.lineWidth=5;g.strokeRect((x0||0)+9,(y0||0)+9,W-18,Hh-18)}
function seaTex(txt,kind){const k=kind+txt;if(seaTexC[k])return seaTexC[k];const ink=g=>{g.fillStyle='#1d0e08';g.textAlign='center';g.textBaseline='middle'};let t;
  if(kind==='v')t=canvasTex(180,960,(g,W,Hh)=>{redPaper(g,W,Hh);ink(g);g.font='900 106px '+KAI_F;const ch=[...txt];ch.forEach((c,i)=>g.fillText(c,W/2,Hh/2+(i-(ch.length-1)/2)*126))});
  else if(kind==='h')t=canvasTex(760,200,(g,W,Hh)=>{redPaper(g,W,Hh);ink(g);g.font='900 112px '+KAI_F;const ch=[...txt];ch.forEach((c,i)=>g.fillText(c,W/2+(i-(ch.length-1)/2)*164,Hh/2+6))});
  else t=canvasTex(360,360,(g,W)=>{g.save();g.translate(W/2,W/2);g.rotate(Math.PI/4);redPaper(g,236,236,-118,-118);g.restore();ink(g);g.font='900 170px '+KAI_F;g.fillText(txt,W/2,W/2+10)});
  return seaTexC[k]=t}

// ---------- 過年：春聯、福、紅燈籠 ----------
let cnyG=null;
function cnyDeco(on){if(cnyG&&(!on||cnyG.userData.H!==H||cnyG.userData.G!==G)){scene.remove(cnyG);disposeObj(cnyG);cnyG=null}if(!on||cnyG||mode==='intro')return;
  const g=new THREE.Group();g.userData.H=H;g.userData.G=G;const z=H-.17;
  const paper=(tex,w,h,x,y,clear)=>{const m=new THREE.Mesh(planeGeo(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.85,transparent:!!clear,alphaTest:clear?.4:0}));m.position.set(x,y,z);m.rotation.y=Math.PI;g.add(m);return m};
  // 站在院子裡看：上聯在右邊、下聯在左邊
  paper(seaTex('一元復始春光好','v'),.4,2.13,-1.66,1.42);paper(seaTex('萬象更新福氣多','v'),.4,2.13,1.66,1.42);
  paper(seaTex('年年有餘','h'),1.62,.43,0,3.25);paper(seaTex('福','d'),.82,.82,0,4.05,true);
  for(const x of[-1.66,1.66]){const br=paint(0x2a1a10,.3,.6);bx(g,.05,.05,.42,br,x,3.05,z-.2);cyl(g,.006,.006,.22,MM.dark,x,2.93,z-.4);
    lat(g,'lant',[[0,0],[.11,0],[.19,.06],[.23,.2],[.19,.34],[.11,.4],[0,.4]],LANT_M,x,2.42,z-.4);const cap=paint(0x1a1a1a,.3,.5);cyl(g,.1,.1,.04,cap,x,2.42,z-.4);cyl(g,.1,.1,.04,cap,x,2.82,z-.4);
    const gd=paint(0xf2c230,.3,.5);for(let k=0;k<6;k++)cyl(g,.005,.005,.18,gd,x+Math.cos(k*1.05)*.05,2.31,z-.4+Math.sin(k*1.05)*.05)}
  linColors(g);scene.add(g);cnyG=g;
  if(!storyOK()&&!G.flags['cny'+SEA.y]){G.flags['cny'+SEA.y]=1;setTimeout(()=>toast('🧧 新年快樂！鐵捲門兩邊貼上春聯了','gold'),2500)}}

// ---------- 過年的晚上：遠遠的煙火 ----------
const FW=[],FW_COL=[[1,.16,.1],[1,.62,.08],[.25,.55,1],[.3,1,.3],[1,.25,.7],[1,.85,.35]];let fwT=4,fwTex=null;
function launchFw(){if(!fwTex)fwTex=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)});
  const a=pl.yaw+(Math.random()-.5)*1.6,d=60+Math.random()*40,cx=pl.x-Math.sin(a)*d,cz=pl.z-Math.cos(a)*d,cy=72+Math.random()*30,N=120,pick=()=>FW_COL[Math.floor(Math.random()*FW_COL.length)],c1=pick(),c2=Math.random()<.45?pick():c1;
  const pos=new Float32Array(N*3),col=new Float32Array(N*3),vel=[];
  for(let i=0;i<N;i++){const u=Math.random()*2-1,th=Math.random()*6.283,r=Math.sqrt(1-u*u),sp=15+Math.random()*3;vel.push([r*Math.cos(th)*sp,u*sp,r*Math.sin(th)*sp]);pos.set([cx,cy,cz],i*3);col.set(i%2?c1:c2,i*3)}
  const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(pos,3));gm.setAttribute('color',new THREE.BufferAttribute(col,3));
  const pts=new THREE.Points(gm,new THREE.PointsMaterial({size:3.2,map:fwTex,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));pts.frustumCulled=false;scene.add(pts);
  FW.push({pts,vel,c:[cx,cy,cz],t:0,life:2.6});
  setTimeout(()=>{if(SET.vol>0&&audio()){noiseS(.7,110,.7,.07,'lowpass');setTimeout(()=>noiseS(.6,3000,.4,.012,'highpass'),260)}},d/340*1000)}
function updateFireworks(dt){
  for(let i=FW.length-1;i>=0;i--){const f=FW[i];f.t+=dt;const t=f.t,k=(1-Math.exp(-1.7*t))/1.7,fall=1.8*t*t,p=f.pts.geometry.attributes.position;
    for(let j=0;j<f.vel.length;j++){const v=f.vel[j];p.setXYZ(j,f.c[0]+v[0]*k,f.c[1]+v[1]*k-fall,f.c[2]+v[2]*k)}p.needsUpdate=true;f.pts.material.opacity=Math.max(0,1-t/f.life)**1.4;
    if(t>f.life){scene.remove(f.pts);f.pts.geometry.dispose();f.pts.material.dispose();FW.splice(i,1)}}
  if(!SEA.cny||(mode!=='play'&&mode!=='photo')||!isNight())return;
  fwT-=dt;if(fwT>0)return;const big=SEA.cnyK===-1||SEA.cnyK===0||SEA.cnyK===14;fwT=(big?4:11)+Math.random()*(big?6:14);launchFw();if(big&&Math.random()<.5)setTimeout(launchFw,500+Math.random()*700)}

// ---------- 月亮：每天晚上都有；中秋那幾天又大又圓 ----------
let moonS=null,moonHalo=null;
function updateMoon(){
  if(!moonS){const tx=canvasTex(256,256,(g)=>{const gr=g.createRadialGradient(118,112,10,128,128,120);gr.addColorStop(0,'#fffdf4');gr.addColorStop(.85,'#f1ead6');gr.addColorStop(.97,'rgba(236,226,200,.9)');gr.addColorStop(1,'rgba(236,226,200,0)');g.fillStyle=gr;g.beginPath();g.arc(128,128,120,0,7);g.fill();
      for(const[x,y,r,a]of[[96,100,30,.1],[150,86,18,.08],[160,150,34,.09],[104,166,20,.07],[130,124,12,.06],[176,112,10,.05]]){const c=g.createRadialGradient(x,y,1,x,y,r);c.addColorStop(0,'rgba(150,140,120,'+a*1.6+')');c.addColorStop(1,'rgba(150,140,120,0)');g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()}});
    moonS=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,fog:false}));moonS.renderOrder=-.5;
    moonHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glintTex,color:0xffe0a0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));moonHalo.renderOrder=-.4;
    moonS.position.set(70,182,158);moonHalo.position.copy(moonS.position);scene.add(moonS,moonHalo)}
  const h=SET.daynight===false?12:(G.tod??9),vis=Math.max(Math.min(1,(h-18.5)/1.1),Math.min(1,(5.7-h)/.9),0),rain=G.wx?G.wx.rain:0,big=!!SEA.moon;
  moonS.visible=vis>0;moonHalo.visible=vis>0&&big;if(!moonS.visible)return;
  moonS.material.opacity=vis*(1-rain*.85);moonS.scale.setScalar(big?30:17);moonS.material.color.setHex(big?0xffe6b4:0xf2efe4);
  if(big){moonHalo.material.opacity=vis*.45*(1-rain);moonHalo.scale.setScalar(110);
    if(vis>.8&&mode==='play'&&!G.flags['moon'+SEA.y]){G.flags['moon'+SEA.y]=1;toast('🌕 中秋節快樂！今天晚上的月亮好圓','gold')}}}

// ---------- 中秋：烤肉架、柚子和月餅 ----------
let moonP=null,smkTex=null;
function moonSpot(){const cand=[],b=hasBench();
  if(b){const c=fpCenter('bench',b.gx,b.gz,b.dir),[fx,fz]=DIRS[b.dir],[rx,rz]=DIRS[(b.dir+1)%4];cand.push([c.x+fx*1.8,c.z+fz*1.8,rx,rz],[c.x+rx*2.2,c.z+rz*2.2,fx,fz],[c.x-rx*2.2,c.z-rz*2.2,fx,fz])}
  for(const x of[-3.6,3.6,-6,6])cand.push([x,H-2.2,1,0]);
  for(let r=H-3;r>3;r-=2)for(let k=0;k<12;k++){const a=k/12*6.283;cand.push([Math.cos(a)*r,Math.sin(a)*r,-Math.sin(a),Math.cos(a)])}
  for(const[x,z,rx,rz]of cand){const tx=x+rx*1.2,tz=z+rz*1.2;if(musFree(x,z)&&musFree(tx,tz)&&musFree((x+tx)/2,(z+tz)/2))return{x,z,tx,tz}}return null}
function moonProps(on,dt,now){
  if(moonP&&(!on||moonP.gid!==G)){scene.remove(moonP.g);disposeObj(moonP.g);for(const o of moonP.obs){const i=obstacles.indexOf(o);if(i>=0)obstacles.splice(i,1)}moonP=null}
  if(!on||mode==='intro')return;
  if(moonP){moonP.chk-=dt;if(moonP.chk<=0){moonP.chk=3;const s=moonP.s;if(!musFree(s.x,s.z)||!musFree(s.tx,s.tz)){moonProps(false);return}}
    const f=.85+Math.sin(now/170)*.08+Math.sin(now/53)*.05;moonP.coal.emissiveIntensity=1.6*f;moonP.glow.material.opacity=.55*f;
    for(const s of moonP.smoke){s.t+=dt;if(s.t>3.2)s.t-=3.2;const k=s.t/3.2;s.sp.position.set(moonP.s.x+s.dx*k+Math.sin(now/900+s.ph)*.1,1.0+k*2.4,moonP.s.z+s.dz*k);s.sp.scale.setScalar(.35+k*1.1);s.sp.material.opacity=.32*Math.sin(Math.PI*k)}return}
  const s=moonSpot();if(!s)return;const g=new THREE.Group(),dk=paint(0x2b2b2e,.6,.45),coal=new THREE.MeshStandardMaterial({color:0x2a1208,emissive:0xff5a14,emissiveIntensity:1.6,roughness:.9});
  // 烤肉架：四隻腳、長長的炭槽、鐵網、上面的玉米和香腸
  const gr=new THREE.Group();gr.position.set(s.x,0,s.z);gr.rotation.y=Math.atan2(s.tx-s.x,s.tz-s.z);g.add(gr);
  for(const[a,b]of[[-.38,-.16],[.38,-.16],[-.38,.16],[.38,.16]])cyl(gr,.018,.018,.72,dk,a,.36,b);
  bx(gr,.9,.2,.04,dk,0,.78,-.2);bx(gr,.9,.2,.04,dk,0,.78,.2);bx(gr,.04,.2,.44,dk,-.45,.78,0);bx(gr,.04,.2,.44,dk,.45,.78,0);bx(gr,.9,.03,.44,dk,0,.69,0);
  mk(gr,boxGeo(.84,.05,.36),coal,0,.74,0);for(let k=0;k<14;k++)mk(gr,sphGeo(.035,8,6),coal,-.38+Math.random()*.76,.78,-.15+Math.random()*.3);
  for(let k=0;k<9;k++)bx(gr,.012,.012,.42,MM.chrome,-.4+k*.1,.89,0);
  const corn=paint(0xf0c23a,0,.6),saus=paint(0x9a3a22,.1,.45),stick=paint(0xc9a46a,0,.8);
  for(const[x,m,r,l]of[[-.25,corn,.035,.18],[-.08,saus,.025,.16],[.08,saus,.025,.16],[.25,corn,.035,.18]]){cyl(gr,r,r,l,m,x,.925,0,Math.PI/2,0,0);cyl(gr,.004,.004,.36,stick,x,.925,.02,Math.PI/2,0,0)}
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glintTex,color:0xff7a30,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));glow.position.set(0,.95,0);glow.scale.set(1.5,.7,1);gr.add(glow);
  // 小桌子：三顆柚子、一盒月餅、一盤切好的月餅
  const tb=new THREE.Group();tb.position.set(s.tx,0,s.tz);tb.rotation.y=gr.rotation.y;g.add(tb);const wd=paint(0x8a5a32,0,.75);
  rbx(tb,.72,.04,.48,.01,wd,0,.48,0);for(const[a,b]of[[-.32,-.2],[.32,-.2],[-.32,.2],[.32,.2]])cyl(tb,.02,.02,.46,wd,a,.23,b);
  const pom=paint(0xc9d65a,0,.55),leaf=paint(0x3f8a3a,0,.7);for(const[x,z,r]of[[-.2,-.06,.1],[-.04,.08,.095],[-.22,.14,.09]]){mk(tb,sphGeo(r,16,12),pom,x,.5+r*.92,z).scale.set(1,.92,1);cyl(tb,.006,.006,.03,leaf,x,.5+r*1.85,z);bx(tb,.05,.004,.025,leaf,x+.025,.5+r*1.86,z,0,.4,.2)}
  rbx(tb,.22,.07,.16,.01,paint(0xb8261a,.1,.5),.18,.535,-.08);bx(tb,.18,.004,.12,paint(0xe8c050,.6,.35),.18,.572,-.08);
  cyl(tb,.11,.11,.012,MM.white,.18,.506,.13);for(const[a,b]of[[.14,.11],[.22,.12],[.18,.17]])cyl(tb,.035,.035,.03,paint(0xc0803a,0,.6),a,.527,b);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});linColors(g);scene.add(g);
  const smk=smkTex||(smkTex=canvasTex(64,64,(c)=>{const q=c.createRadialGradient(32,32,0,32,32,32);q.addColorStop(0,'rgba(220,220,220,.9)');q.addColorStop(1,'rgba(220,220,220,0)');c.fillStyle=q;c.fillRect(0,0,64,64)})),smoke=[];
  for(let k=0;k<6;k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smk,transparent:true,depthWrite:false,opacity:0}));g.add(sp);smoke.push({sp,t:k*.53,dx:(Math.random()-.5)*.6,dz:(Math.random()-.5)*.6,ph:Math.random()*6})}
  const obs=[{x:s.x,z:s.z,r:.5},{x:s.tx,z:s.tz,r:.42}];obstacles.push(...obs);
  moonP={g,s,coal,glow,smoke,obs,chk:3,gid:G};
  if(!storyOK()&&!G.flags['moonp'+SEA.y]){G.flags['moonp'+SEA.y]=1;setTimeout(()=>toast('🌕 中秋節快樂！院子裡多了烤肉架和柚子','gold'),2500)}}

// ---------- 節日的信和紅包 ----------
function seaLetter(id){if(LETTER[id])return LETTER[id];const y=id.slice(-4);let l=null;
  if(/^cny\d{4}$/.test(id))l={id,from:'lan',title:'新年快樂',to:'孩子：',manual:true,red:true,memo:'hb'+y,note:'🧧 紅包收進收藏櫃的「回憶」了',
    body:['新年快樂！','海口庄的習慣，過年要給孩子包紅包。你阿公以前每年都會包一枚亮晶晶的 1 元給鎮上的孩子，說是「一元復始」：新的一年，從一元開始。',
      '今年換阿嬤包給你。紅包袋裡只有一枚 1 元，不多，可是它是新的一年的第一枚。','春聯是阿德幫你貼的，就在鐵捲門兩邊。晚上記得抬頭看看，鎮上的人在海邊放煙火。','有空來柑仔店，阿嬤請你吃年糕。'],sig:'秀蘭阿嬤'};
  else if(/^moon\d{4}$/.test(id))l={id,from:'zw',title:'中秋節快樂',to:'你好：',manual:true,
    body:['中秋節快樂！我是烤肉高手志偉，就是把一元掉進炭火裡的那個。','今年我多帶了一個烤肉架，已經擺在你的院子裡了，炭也幫你點好了。秀蘭阿嬤說中秋一定要有柚子，就放在旁邊的小桌子上。',
      '烤肉的時候記得把零錢收好，不然會像我一樣，第二天才從炭裡把它撿出來。','今天晚上的月亮很圓，記得抬頭看看。'],sig:'烤肉高手志偉'};
  if(l){LETTERS.push(l);LETTER[id]=l}return l}
function seaMemo(id){if(MEMO[id])return MEMO[id];const y=id.slice(2),m={id,season:1,name:EN_ON?'Red envelope, '+y:y+' 年的紅包',desc:'秀蘭阿嬤包的紅包，裡面是一枚亮晶晶的 1 元。阿公說：新的一年，從一元開始。'};
  MEMOS.push(m);MEMO[id]=m;MEMO_LETTER[id]='cny'+y;return m}
function seaLetters(now){const S=G&&G.story;if(!S)return;
  for(const k in S.got)if(/^(cny|moon)\d{4}$/.test(k))seaLetter(k);for(const k in S.items)if(/^hb\d{4}$/.test(k))seaMemo(k);
  if(!storyOK()||mode!=='play'||!S.read.intro||panel||G.build||now-seaT0<12000||G.play-S.last<14)return;
  for(const id of[SEA.cny&&'cny'+SEA.y,SEA.moon&&'moon'+SEA.y])if(id&&!S.got[id]){seaLetter(id);deliver(id);break}}
// 老人家在節日說的話
const CNY_ELDER=[['lan','新年快樂！紅包收到了嗎？'],['chen','以前過年，合作社門口也貼一樣的春聯。'],['lan','年糕在桌上，吃一塊再去挖。'],['chen','一元復始，萬象更新。你阿公每年都這樣寫。']];
const MOON_ELDER=[['lan','今天的月亮好圓。'],['chen','五十年前的中秋，我也在柑仔店門口看月亮。'],['lan','柚子剝好了，柚子皮給你戴，當帽子。'],['chen','志偉的烤肉，還是一樣有點焦。']];
const seaElder=()=>SEA.cny?CNY_ELDER:SEA.moon?MOON_ELDER:null;
// 回憶裡的紅包插圖
function hbArt(g,W,Hh,s,KAI,bg,shadow){bg();shadow(240*s,292*s,120*s,20*s);
  const x=240*s,y=176*s,w=150*s,h=214*s;g.save();g.translate(x,y);g.rotate(-.08);
  // 紅包裡露出來的 1 元
  const cx=18*s,cy=-h/2+6*s,r=48*s;if(oneImgURL&&memoCoinImg&&memoCoinImg.complete&&memoCoinImg.naturalWidth){g.save();g.beginPath();g.arc(cx,cy,r,0,7);g.clip();g.drawImage(memoCoinImg,cx-r,cy-r,r*2,r*2);g.restore()}
  else{const cg=g.createRadialGradient(cx-r*.3,cy-r*.3,4,cx,cy,r);cg.addColorStop(0,'#f6cf96');cg.addColorStop(1,'#9a5a22');g.fillStyle=cg;g.beginPath();g.arc(cx,cy,r,0,7);g.fill()}
  const gr=g.createLinearGradient(-w/2,0,w/2,0);gr.addColorStop(0,'#a81c14');gr.addColorStop(.5,'#d83424');gr.addColorStop(1,'#a01a12');g.fillStyle=gr;g.fillRect(-w/2,-h/2+30*s,w,h-30*s);
  g.fillStyle='#b8261a';g.beginPath();g.moveTo(-w/2,-h/2+30*s);g.lineTo(0,-h/2+70*s);g.lineTo(w/2,-h/2+30*s);g.closePath();g.fill();g.strokeStyle='rgba(240,200,90,.8)';g.lineWidth=2*s;g.stroke();
  g.strokeStyle='#e8c050';g.lineWidth=3*s;g.strokeRect(-w/2+10*s,-h/2+40*s,w-20*s,h-50*s);
  g.fillStyle='#f2d070';g.textAlign='center';g.textBaseline='middle';g.font='900 '+64*s+'px '+KAI;g.fillText('福',0,30*s);g.font='bold '+20*s+'px '+KAI;g.fillText('一元復始',0,82*s);g.restore()}
