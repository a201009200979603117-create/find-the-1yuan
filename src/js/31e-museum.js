// ================= 一元博物館：一元展結束以後，黃理事長送的玻璃展示櫃 =================
// 24 個小架子，一種 1 元一格：找到的會自己擺上去慢慢轉，還沒找到的是黑黑的剪影。24 格都擺滿，整個櫃子會亮起來。
// 晚上偶爾有鎮上的人走過來，站在自己那一枚前面說一句話。走過去按 E 可以打開收藏櫃細看。
GIFT.museum='giftMuseum';
const MUS_X0=.75,MUS_DX=-.3,MUS_Y0=.885,MUS_DY=.29,MUS_R=.105;
// 每一格的位置（站在玻璃前面看：從左到右、從下到上，越上面越稀有）
const musSlot=i=>({x:MUS_X0+(i%6)*MUS_DX,y:MUS_Y0+Math.floor(i/6)*MUS_DY});
const MUS_GEO=share(new THREE.CylinderGeometry(MUS_R,MUS_R,.016,32));
const musSide=share(new THREE.MeshStandardMaterial({color:0xc9934a,metalness:.7,roughness:.35})),musEmpty=share(new THREE.MeshStandardMaterial({color:0x4a2620,metalness:.05,roughness:.95}));
const musMat={},musTexC={};let musSignTex=null,musSignEN=null;
// CSS 濾鏡字串（收藏櫃用的）拆成 [名稱, 數值]，用拍照模式那套顏色矩陣自己算（Safari 的畫布不支援 filter）
function cssFx(s){const out=[];String(s||'').replace(/([a-z-]+)\(([-\d.]+)(?:deg)?\)/g,(_,k,v)=>{out.push([k,+v]);return''});return out}
// 一種 1 元的一面：照收藏櫃裡的樣子（顏色、偏打、打孔、轉向、凹）畫在小畫布上
function musTex(id){if(musTexC[id])return musTexC[id];const src=oneFace.map&&oneFace.map.image;if(!src||!src.width)return null;
  const S=ONE_STORY[id]||['','',''],W=128,c=document.createElement('canvas');c.width=c.height=W;const g=c.getContext('2d');
  g.save();g.translate(W/2,W/2);if(S[1]==='rot')g.rotate(Math.PI/2);if(S[1]&&S[1].startsWith('skew'))g.transform(1,0,.12,1,0,0);
  const sc=S[1]==='offc'?1.3:1;g.drawImage(src,-W/2*sc+(S[1]==='offc'?W*.1:0),-W/2*sc+(S[1]==='offc'?W*.08:0),W*sc,W*sc);g.restore();
  const f=cssFx(S[2]);if(f.length){const im=g.getImageData(0,0,W,W),d=im.data,{A,o}=fxMat(f);
    for(let i=0;i<d.length;i+=4){const r=d[i]/255,gg=d[i+1]/255,b=d[i+2]/255;d[i]=(A[0]*r+A[1]*gg+A[2]*b+o[0])*255;d[i+1]=(A[3]*r+A[4]*gg+A[5]*b+o[1])*255;d[i+2]=(A[6]*r+A[7]*gg+A[8]*b+o[2])*255}g.putImageData(im,0,0)}
  if(S[2]==='hole'){g.globalCompositeOperation='destination-out';g.beginPath();g.arc(W/2,W/2,W*.11,0,7);g.fill()}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return musTexC[id]=t}
const musPlain=share(new THREE.MeshStandardMaterial({color:0xcf9447,metalness:.6,roughness:.35}));
function musFace(id){if(musMat[id])return musMat[id];const tx=musTex(id);if(!tx)return musPlain;
  const m=share(new THREE.MeshStandardMaterial({map:tx,metalness:.55,roughness:.36,alphaTest:ONE_STORY[id]&&ONE_STORY[id][2]==='hole'?.5:0}));linMat(m);return musMat[id]=m}
// 上面的木頭招牌
function musSign(){const en=!!EN_ON;if(en?musSignEN:musSignTex)return en?musSignEN:musSignTex;
  const t=canvasTex(1024,256,(g,W,Hh)=>{const gr=g.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,'#4a2a16');gr.addColorStop(1,'#2e190c');g.fillStyle=gr;g.fillRect(0,0,W,Hh);
    g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;for(let y=10;y<Hh;y+=16){g.beginPath();g.moveTo(0,y);g.bezierCurveTo(W*.3,y+5,W*.6,y-5,W,y);g.stroke()}
    g.strokeStyle='#d8b060';g.lineWidth=8;g.strokeRect(14,14,W-28,Hh-28);g.fillStyle='#f2d690';g.textAlign='center';g.textBaseline='middle';
    if(en){g.font='bold 92px Georgia,serif';g.fillText('NT$1 MUSEUM',W/2,Hh/2-14);g.font='bold 30px Georgia,serif';g.fillStyle='#d8b060';g.fillText('HAIKOU VILLAGE',W/2,Hh-50)}
    else{g.font='900 112px "DFKai-SB","BiauKai","Kaiti TC","Microsoft JhengHei",serif';g.fillText('一元博物館',W/2,Hh/2-16);g.font='bold 30px Georgia,serif';g.fillStyle='#d8b060';g.fillText('HAIKOU NT$1 MUSEUM',W/2,Hh-50)}});
  return en?(musSignEN=t):(musSignTex=t)}
// 模型（2×1）：下面是木櫃，上面是玻璃展示區，背板是紅色絨布；正面朝 -z（跟其他東西一樣）
MODELS.museum=function(S,D,t){
  const wd=paint(0x6a4024,.05,.55),dk=paint(0x3a2414,.05,.6),vel=paint(0x6a1a22,0,.95),cream=paint(0xe8dcc0,.1,.6),gold=MM.brass;
  rbx(S,1.96,.1,.64,.02,dk,0,.05,0);rbx(S,1.88,.6,.56,.03,wd,0,.4,0);
  for(const sx of[-1,1]){bx(S,.84,.46,.015,dk,sx*.45,.4,-.284);cyl(S,.016,.016,.02,gold,sx*.07,.42,-.297,Math.PI/2,0,0)}
  rbx(S,1.94,.05,.62,.02,dk,0,.725,0);
  for(const sx of[-1,1])for(const sz of[-1,1])bx(S,.05,1.3,.05,wd,sx*.93,1.4,sz*.27);
  bx(S,1.82,1.28,.02,vel,0,1.39,.27);rbx(S,1.96,.07,.64,.02,dk,0,2.07,0);bx(S,1.9,.03,.02,gold,0,2.03,-.31);
  for(let r=0;r<4;r++){const y=MUS_Y0+r*MUS_DY-.14;if(r)bx(S,1.82,.025,.4,dk,0,y-.012,.06);bx(S,1.82,.014,.014,gold,0,y,-.14)}
  for(let i=0;i<24;i++){const p=musSlot(i),y0=p.y-.14;cyl(S,.04,.045,.012,gold,p.x,y0+.006,-.02);bx(S,.014,.05,.014,gold,p.x,y0+.03,-.02);bx(S,.13,.03,.004,cream,p.x,y0+.022,-.15,-.6,0,0)}
  mk(S,planeGeo(1.82,1.29),MM.glass,0,1.39,-.29,0,Math.PI,0);for(const sx of[-1,1])mk(S,planeGeo(.52,1.29),MM.glass,sx*.94,1.39,0,0,Math.PI/2,0);
  // 招牌（有字的那面朝前）
  for(const sx of[-1,1]){cyl(S,.02,.02,.16,gold,sx*.55,2.18,0);sph(S,.035,gold,sx*.72,2.15,0)}
  const sm=new THREE.MeshStandardMaterial({map:musSign(),roughness:.7,emissive:0x2a1808,emissiveIntensity:.4}),sb=new THREE.Mesh(boxGeo(1.3,.32,.05),[dk,dk,dk,dk,dk,sm]);sb.position.set(0,2.27,0);D.add(sb);t.musSignM=sm;
  // 上蓋下面的燈條（擺滿了會更亮）
  const lm=new THREE.MeshStandardMaterial({color:0x332211,emissive:0xffd890,emissiveIntensity:.7,roughness:.5});mk(D,boxGeo(1.7,.02,.03),lm,0,2.015,-.2);t.musLight=lm;
  // 24 枚 1 元（每一枚自己一個網格，才轉得起來、換得了樣子）
  t.musCoins=[];for(let i=0;i<24;i++){const p=musSlot(i),pv=new THREE.Group();pv.position.set(p.x,p.y,-.02);D.add(pv);const m=new THREE.Mesh(MUS_GEO,musEmpty);m.rotation.x=-Math.PI/2;pv.add(m);t.musCoins.push({pv,m,id:ONE_TYPES[i].id})}
  // 擺滿的時候，後面的光暈
  const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glintTex,color:0xffd27a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));gl.position.set(0,1.4,.12);gl.scale.set(2.6,1.9,1);D.add(gl);t.musGlow=gl;
  t.mus=1;t.musSig=''};
const musFull=()=>!!G&&ONE_TYPES.every(x=>G.coll[x.id]);
// 每一幀（animTile 會叫）：收藏有變就重新擺，有的慢慢轉，擺滿了會發亮
function museumAnim(t,dt,now){if(!G||!t.musCoins)return;const tex=!!(oneFace.map&&oneFace.map.image);
  const sig=ONE_TYPES.map(x=>G.coll[x.id]?1:0).join('')+(tex?'t':'');
  if(sig!==t.musSig){t.musSig=sig;for(const c of t.musCoins){const have=!!G.coll[c.id];c.have=have;c.m.material=have?[musSide,musFace(c.id),musFace(c.id)]:musEmpty;if(!have)c.pv.rotation.y=0}
    const full=musFull();t.musLight.emissiveIntensity=full?2:.7;
    if(full&&!G.flags.museFull&&mode==='play'){G.flags.museFull=true;toast('✨ 一元博物館的 24 格全部擺滿了！','gold');[784,988,1175,1568].forEach((f,i)=>setTimeout(()=>tone(f,.5,'sine',.03),i*180))}}
  const s=now/1000;t.musCoins.forEach((c,i)=>{if(c.have)c.pv.rotation.y=s*.55+i*.7});
  if(t.musCoins.every(c=>c.have)){t.musGlow.material.opacity=.32+Math.sin(s*1.6)*.1;t.musLight.emissiveIntensity=1.8+Math.sin(s*2.2)*.3}else t.musGlow.material.opacity=0}
const museumTile=()=>{for(const t of tiles.values())if(t.type==='museum')return t;return null};
function nearMuseum(){const t=museumTile();if(!t)return null;const c=fpCenter('museum',t.gx,t.gz,t.dir),[fx,fz]=DIRS[t.dir];
  const d=Math.hypot(pl.x-c.x,pl.z-c.z);if(d>2.1||Math.abs(pl.y-(t.L||0)*LH)>1.2)return null;
  return(pl.x-c.x)*fx+(pl.z-c.z)*fz>-.2?t:null} // 要站在玻璃那一面
const musPrompt=()=>{const n=ONE_TYPES.filter(x=>G.coll[x.id]).length;return EN_ON?n+' / 24 kinds on display':'展示了 %s / 24 種'.replace('%s',n)};

// ---------- 晚上來看展示櫃的人 ----------
const MUS_LINES={huang:'民國四十九年的那枚擺在這裡，好像真的博物館裡的寶貝。',lan:'凹凹的那枚擺在玻璃櫃裡，也好好看。凹的也是一元嘛。',
  chen:'金色的那枚放在這麼亮的地方，有點不好意思。',de:'刮傷的那枚是我的。玻璃擦得這麼亮，刮痕都看得一清二楚。',
  tsai:'紅紅的那枚！下次載貨經過，我還要再來看。',ahai:'有洞的那枚，以前綁在我的船頭，現在換它休息了。',
  yun:'我的新亮一元！明天我要帶同學來看！',kai:'磁鐵一元在這裡！老師說，下次自然課要來參觀。',
  mei:'梅花那枚擺在這裡，大家都可以來沾沾好運。',ming:'兩面都是正面的那枚……猜猜看，現在朝外的是哪一面？',shui:'磨平的那枚，四十年的豆花錢，現在住進玻璃櫃了。'};
let musV=null,musVT=45;
function musFree(x,z){return allowed(x,z)&&!occ.has(tkey(Math.floor(x),Math.floor(z)))&&groundAt(x,z)<.3&&Math.hypot(x-MAILP.x,z-MAILP.z)>1}
function museumVisit(dt,now){
  if(musV){const v=musV,p=v.p;if(!folk.includes(p)){musV=null;return}const gp=p.g.position;
    if(v.st==='walk'||v.st==='out'){const tx=v.st==='walk'?v.to:v.from,dx=tx.x-gp.x,dz=tx.z-gp.z,d=Math.hypot(dx,dz);
      if(d<.06){if(v.st==='walk'){v.st='look';v.t=0;p.yaw=v.face;p.g.rotation.y=p.yaw}else{p.gone=1;musV=null}p.legs.forEach(l=>{l.th.rotation.x=0;l.sh.rotation.x=0});return}
      const sp=Math.min(d,dt*.85);gp.x+=dx/d*sp;gp.z+=dz/d*sp;p.yaw=Math.atan2(-dx,-dz);p.g.rotation.y=p.yaw;v.ph+=dt*7;
      p.legs.forEach((l,i)=>{l.th.rotation.x=Math.sin(v.ph+i*Math.PI)*.42;l.sh.rotation.x=-Math.max(0,-Math.sin(v.ph+i*Math.PI))*.5});p.arms.forEach((a,i)=>{a.rotation.x=Math.sin(v.ph+i*Math.PI)*-.3});
      if(v.st==='out'&&(v.t+=dt)>7)p.gone=1;return}
    v.t+=dt;const near=Math.hypot(pl.x-gp.x,pl.z-gp.z);
    if(!v.said&&v.t>1.2){v.said=1;if(near<14)sayFolk(p,MUS_LINES[p.id]);if(near>6)toast(EN_ON?'🌙 '+L(p.d.n)+' came to see the NT$1 Museum':'🌙 %s來看一元博物館了'.replace('%s',p.d.n),'gold')}
    if(v.t>(near<3?40:16)||!museumTile()||(SET.daynight!==false&&!isNight())){v.st='out';v.t=0}return}
  if(!storyOK()||mode!=='play'||fest||!G.story.festDone)return;
  musVT-=dt;if(musVT>0)return;musVT=70+Math.random()*80;
  if(SET.daynight!==false&&!isNight())return;
  const m=museumTile();if(!m)return;
  const cand=TOWN.filter(d=>G.coll[d.coin]&&!folk.some(f=>f.id===d.id&&!f.gone));if(!cand.length)return;
  const d=cand[Math.floor(Math.random()*cand.length)],i=ONE_TYPES.findIndex(x=>x.id===d.coin);
  const c=fpCenter('museum',m.gx,m.gz,m.dir),[fx,fz]=DIRS[m.dir],[rx,rz]=DIRS[(m.dir+1)%4],lx=musSlot(i).x;
  let to={x:c.x+rx*lx+fx*1,z:c.z+rz*lx+fz*1};if(!musFree(to.x,to.z)){to={x:c.x+fx*1.1,z:c.z+fz*1.1};if(!musFree(to.x,to.z))return}
  // 從幾公尺外走過來；路上有東西擋住就直接出現在櫃子前面
  let from=null;for(const a of[0,.5,-.5,1,-1,1.5,-1.5]){const ca=Math.cos(a),sa=Math.sin(a),dx=fx*ca-fz*sa,dz=fz*ca+fx*sa,len=3.5;let ok=true;
    for(let s=.4;s<=len;s+=.4)if(!musFree(to.x+dx*s,to.z+dz*s)){ok=false;break}if(ok){from={x:to.x+dx*len,z:to.z+dz*len};break}}
  const st=from||to,face=Math.atan2(fx,fz),p=addFolk(d.id,st.x,st.z,face,false);p.g.position.y=(m.L||0)*LH;p.mus=1;
  musV={p,to,from:from||{x:to.x+fx*2,z:to.z+fz*2},face,st:from?'walk':'look',t:0,ph:0,said:0}}
const MUS_MORE=['晚上的院子好安靜。','你阿公以前也常常這樣，一個人站著看那些一元。','謝謝你把它們擺得這麼漂亮。','看完就回家了，不吵你。'];
function talkMus(p){p.n=(p.n||0)+1;sayFolk(p,p.n===1?MUS_LINES[p.id]:MUS_MORE[(p.n-2)%MUS_MORE.length]);if(musV&&musV.p===p&&musV.st==='look')musV.t=Math.min(musV.t,4)}
function museumReset(){musV=null;musVT=45}
