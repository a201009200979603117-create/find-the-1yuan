// ================= 機器模型：照玩家看得懂的樣子重做（圓的、斜的、會動的零件），大機器佔好幾格 =================
// 共用的形狀和材質（同樣大小只做一次）
function rboxGeo(w,h,d,r){const k='rb'+w+'|'+h+'|'+d+'|'+r;let g=_geo.get(k);if(g)return g;
  const b=Math.max(.004,Math.min(r,w/2-.004,h/2-.004,d/2-.004)),sw=w-2*b,sh=h-2*b,cr=Math.min(b*.7,sw/2-.002,sh/2-.002),s=new THREE.Shape(),x0=-sw/2,y0=-sh/2;
  if(cr>.004){s.moveTo(x0+cr,y0);s.lineTo(x0+sw-cr,y0);s.quadraticCurveTo(x0+sw,y0,x0+sw,y0+cr);s.lineTo(x0+sw,y0+sh-cr);s.quadraticCurveTo(x0+sw,y0+sh,x0+sw-cr,y0+sh);s.lineTo(x0+cr,y0+sh);s.quadraticCurveTo(x0,y0+sh,x0,y0+sh-cr);s.lineTo(x0,y0+cr);s.quadraticCurveTo(x0,y0,x0+cr,y0)}
  else{s.moveTo(x0,y0);s.lineTo(x0+sw,y0);s.lineTo(x0+sw,y0+sh);s.lineTo(x0,y0+sh);s.lineTo(x0,y0)}
  g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.002,d-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:3});g.translate(0,0,-Math.max(.002,d-2*b)/2);
  share(g);_geo.set(k,g);return g}
function cylGeo(rt,rb,h,seg,open,ts,tl){const k='cy'+[rt,rb,h,seg,open,ts,tl];let g=_geo.get(k);if(!g){g=share(new THREE.CylinderGeometry(rt,rb,h,seg||20,1,!!open,ts||0,tl||Math.PI*2));_geo.set(k,g)}return g}
function sphGeo(r,ws,hs){const k='sp'+[r,ws,hs];let g=_geo.get(k);if(!g){g=share(new THREE.SphereGeometry(r,ws||16,hs||12));_geo.set(k,g)}return g}
function torGeo(R,r,arc,ts){const k='to'+[R,r,arc,ts];let g=_geo.get(k);if(!g){g=share(new THREE.TorusGeometry(R,r,8,ts||28,arc||Math.PI*2));_geo.set(k,g)}return g}
function latheGeo(k,pts,seg){k='la'+k;let g=_geo.get(k);if(!g){g=share(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg||24));_geo.set(k,g)}return g}
function planeGeo(w,h){const k='pl'+w+'|'+h;let g=_geo.get(k);if(!g){g=share(new THREE.PlaneGeometry(w,h));_geo.set(k,g)}return g}
function arrowGeo(len,wid){const k='ar'+len+'|'+wid;let g=_geo.get(k);if(g)return g;const s=new THREE.Shape(),hw=wid/2,sw=wid*.22;
  s.moveTo(-sw,-len*.5);s.lineTo(sw,-len*.5);s.lineTo(sw,len*.05);s.lineTo(hw,len*.05);s.lineTo(0,len*.5);s.lineTo(-hw,len*.05);s.lineTo(-sw,len*.05);s.lineTo(-sw,-len*.5);
  g=new THREE.ShapeGeometry(s);g.rotateX(-Math.PI/2);share(g);_geo.set(k,g);return g}
const _paintM=new Map();function paint(c,met,rough){met=met??.3;rough=rough??.5;const k=c+'|'+met+'|'+rough;let m=_paintM.get(k);if(!m){m=share(new THREE.MeshStandardMaterial({color:c,metalness:met,roughness:rough}));_paintM.set(k,m)}return m}
const _gm=new Map();function glowM(c,i){const k=c+'|'+(i||1);let m=_gm.get(k);if(!m){m=share(new THREE.MeshStandardMaterial({color:0x111111,emissive:c,emissiveIntensity:i||1,roughness:.4}));_gm.set(k,m)}return m}
const _lm=new Map();function labelMat(txt,w,bg,fg){const k=txt+'|'+(w||512)+bg+fg;let m=_lm.get(k);if(!m){m=share(new THREE.MeshBasicMaterial({map:signTex(txt,bg||'#1b1b1b',fg||'#f0c030',null,w||512)}));_lm.set(k,m)}return m}
const MM={steel:M_.steel,dark:M_.dark,chrome:paint(0xd6dbe0,.95,.18),rubber:paint(0x1b1b1b,0,.92),brass:paint(0xc9a24a,.85,.3),copper:paint(0xc07a3a,.85,.32),white:paint(0xe9e9e6,.1,.55),
  steelDS:share(new THREE.MeshStandardMaterial({color:0xa3abb1,metalness:.8,roughness:.32,side:THREE.DoubleSide})),
  hazard:share(new THREE.MeshStandardMaterial({map:hazardTex,roughness:.6})),glass:share(new THREE.MeshStandardMaterial({color:0xbfe6ff,transparent:true,opacity:.25,roughness:.05,metalness:.2,depthWrite:false,side:THREE.DoubleSide})),
  arrIn:share(new THREE.MeshBasicMaterial({color:0x39b8ff,toneMapped:false})),arrOut:share(new THREE.MeshBasicMaterial({color:0xff9a2e,toneMapped:false})),arrOff:share(new THREE.MeshBasicMaterial({color:0x8a5a2a,toneMapped:false})),
  pad:share(new THREE.MeshStandardMaterial({map:padTex,roughness:.8})),yellowDS:share(new THREE.MeshStandardMaterial({color:0xe2a51c,metalness:.3,roughness:.5,side:THREE.DoubleSide})),
  dishM:share(new THREE.MeshStandardMaterial({color:0xe8ecef,metalness:.35,roughness:.4,side:THREE.DoubleSide})),laser:share(new THREE.MeshBasicMaterial({color:0xff4040,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide,toneMapped:false})),drawer:share(new THREE.MeshStandardMaterial({map:drawerTex,roughness:.7}))};
// 擺零件的小工具：p 是放到哪個群組
function mk(p,geo,mat,x,y,z,rx,ry,rz){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);p.add(m);return m}
const bx=(p,w,h,d,m,x,y,z,rx,ry,rz)=>mk(p,boxGeo(w,h,d),m,x,y,z,rx,ry,rz);
const rbx=(p,w,h,d,r,m,x,y,z,rx,ry,rz)=>mk(p,rboxGeo(w,h,d,r),m,x,y,z,rx,ry,rz);
const cyl=(p,rt,rb,h,m,x,y,z,rx,ry,rz,seg)=>mk(p,cylGeo(rt,rb,h,seg),m,x,y,z,rx,ry,rz);
const sph=(p,r,m,x,y,z)=>mk(p,sphGeo(r),m,x,y,z);
const tor=(p,R,r,m,x,y,z,rx,ry,rz)=>mk(p,torGeo(R,r),m,x,y,z,rx,ry,rz);
const lat=(p,k,pts,m,x,y,z,seg)=>mk(p,latheGeo(k,pts,seg),m,x,y,z);
const tube=(p,pts,r,m)=>mk(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(a=>new THREE.Vector3(a[0],a[1],a[2]))),Math.max(10,pts.length*8),r,8,false),m);
const label=(p,txt,w,h,x,y,z,ry,bg,fg)=>mk(p,planeGeo(w,h),labelMat(txt,w>1.2?1024:512,bg,fg),x,y,z,0,ry||0,0);
const arrow=(p,m,len,wid,x,y,z,ry)=>mk(p,arrowGeo(len,wid),m,x,y,z,0,ry||0,0);
function lampOn(p,x,y,z,r){const l=new THREE.Mesh(sphGeo(r||.05,10,8),new THREE.MeshBasicMaterial({color:0x33ff66}));l.position.set(x,y,z);p.add(l);return l}
// 一段輸送帶（跟一般輸送帶同一個樣子）
function beltSeg(p,z,len){const L=len||1;mk(p,beltGeo,M_.belt,0,.34,z).scale.z=L;for(const sx of[-.5,.5]){bx(p,.05,.2,L,M_frame,sx,.31,z);bx(p,.075,.03,L,M_.yellow,sx,.425,z)}for(const sx of[-.42,.42])bx(p,.07,.22,.07,M_.dark,sx,.11,z)}
// 漏斗（上寬下窄，開口的）
const funnel=(p,rt,rb,h,x,y,z,seg,m)=>mk(p,cylGeo(rt,rb,h,seg||20,true),m||MM.steelDS,x,y,z,0,seg===4?Math.PI/4:0,0);
// 把不會動的零件依材質合併成幾個大網格，畫面才不會卡
function mergeStatic(grp){
  grp.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(grp.matrixWorld).invert(),byMat=new Map(),tmp=new THREE.Matrix4();
  grp.traverse(o=>{if(o.isMesh){let a=byMat.get(o.material);if(!a)byMat.set(o.material,a=[]);a.push(o)}});
  const out=new THREE.Group();
  for(const[mat,list]of byMat){let n=0;const parts=[];
    for(const o of list){const src=o.geometry,ge=src.index?src.toNonIndexed():src.clone();tmp.multiplyMatrices(inv,o.matrixWorld);ge.applyMatrix4(tmp);parts.push(ge);n+=ge.attributes.position.count;if(!SHARED.has(src))src.dispose()}
    const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let off=0;
    for(const ge of parts){pos.set(ge.attributes.position.array,off*3);if(ge.attributes.normal)nor.set(ge.attributes.normal.array,off*3);if(ge.attributes.uv)uv.set(ge.attributes.uv.array,off*2);off+=ge.attributes.position.count;ge.dispose()}
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));bg.setAttribute('normal',new THREE.BufferAttribute(nor,3));bg.setAttribute('uv',new THREE.BufferAttribute(uv,2));bg.computeBoundingSphere();
    out.add(new THREE.Mesh(bg,mat))}
  return out}

// ---------- 分流器、合流器：上面畫著藍色箭頭（從這裡進）、橘色箭頭（從這裡出），中間的擋板指著下一個東西要往哪走 ----------
// 方向代號：F 前、R 右、B 後、L 左（相對機器的箭頭方向）
const SIDE={F:[0,-1],R:[1,0],B:[0,1],L:[-1,0]},SIDE_ROT={F:0,R:-Math.PI/2,B:Math.PI,L:Math.PI/2},SIDE_REL={F:0,R:1,B:2,L:3};
const IO={split:{i:'B',o:'LR'},splitU:{i:'B',o:'FR'},split3:{i:'B',o:'LFR'},smart:{i:'B',o:'LFR'},merge:{i:'LR',o:'F'},mergeU:{i:'BR',o:'F'},mergeC:{i:'LRB',o:'F'},tjunc:{i:'',o:''}};
function junction(S,D,t,T){
  const io=IO[T],col=T==='smart'?0x2f7fc4:T==='split3'?0xd8732a:T.startsWith('merge')?0x3f8f5a:T==='tjunc'?0x6d737a:0xe2a51c;
  // 底座和中間的轉盤
  rbx(S,1,.26,1,.05,M_frame,0,.13,0);rbx(S,.98,.04,.98,.02,paint(col,.35,.5),0,.27,0);
  const open=T==='tjunc'?'FRBL':io.i+io.o;
  for(const sd of'FRBL'){const[sx,sz]=SIDE[sd];
    if(open.includes(sd)){ // 這一邊有開口：一小段輸送帶
      const m=mk(S,beltGeo,paint(0x2a2a2c,.1,.85),sx*.27,.34,sz*.27,0,io.i.includes(sd)||T==='tjunc'?SIDE_ROT[sd]+Math.PI:SIDE_ROT[sd],0);m.scale.z=.46}
    else{bx(S,sz?.98:.07,.16,sz?.07:.98,M_.yellow,sx*.47,.4,sz*.47)}} // 沒開口的那一邊有擋板
  cyl(S,.26,.28,.06,MM.steel,0,.36,0,0,0,0,24);
  // 箭頭
  t.outArr={};
  for(const sd of io.i)arrow(S,MM.arrIn,.42,.34,SIDE[sd][0]*.3,.43,SIDE[sd][1]*.3,SIDE_ROT[sd]+Math.PI);
  for(const sd of io.o){const a=arrow(D,io.o.length>1?MM.arrOff:MM.arrOut,.42,.34,SIDE[sd][0]*.3,.435,SIDE[sd][1]*.3,SIDE_ROT[sd]);t.outArr[SIDE_REL[sd]]=a}
  if(T==='tjunc')for(const sd of'FRBL')cyl(S,.03,.03,.02,MM.arrIn,SIDE[sd][0]*.33,.43,SIDE[sd][1]*.33);
  // 分流器才有擋板（指著下一個要出去的方向）
  if(io.o.length>1){const pd=new THREE.Group();pd.position.y=.4;D.add(pd);t.paddle=pd;
    rbx(pd,.07,.16,.34,.02,paint(col,.4,.45),0,.06,-.15);cyl(pd,.07,.07,.2,MM.dark,0,.08,0);
    arrow(pd,MM.arrOut,.2,.18,0,.16,-.2,0);pd.rotation.y=-SIDE_REL[io.o[0]]*Math.PI/2}
  if(T==='smart'){const s=new THREE.Mesh(sphGeo(.06,10,8),new THREE.MeshBasicMaterial({color:0x66ccff}));s.position.set(0,.62,0);D.add(s);cyl(S,.015,.015,.2,MM.dark,0,.5,0)}
}

// ---------- 每一台機器的樣子 ----------
// 座標：模型的正中間是 (0,0,0)，箭頭方向（出口）是 -z，右邊是 +x；w×d 是佔的格子
// 紅燈籠的燈罩：天黑時調亮（全部燈籠共用一個材質）
let coSignTex=null;
const LANT_M=share(new THREE.MeshStandardMaterial({color:0xc8241c,emissive:0xff3a1a,emissiveIntensity:.25,roughness:.7}));
const MODELS={
  plant(S,D,t){ // 盆栽：陶盆＋圓圓的葉子
    const pot=paint(0xb5653a,0,.85),lf=paint(0x3f8a3a,0,.7),lf2=paint(0x5aa548,0,.7);
    lat(S,'pot',[[0,0],[.19,0],[.23,.3],[.26,.32],[.26,.37],[0,.37]],pot,0,0,0);cyl(S,.225,.225,.02,paint(0x4a3222,0,1),0,.35,0);cyl(S,.025,.03,.35,paint(0x5b4a2e,0,.9),0,.5,0);
    for(const[x,y,z,r,m]of[[0,.84,0,.22,lf],[.14,.74,.06,.16,lf2],[-.13,.73,-.05,.17,lf2],[.03,.71,-.15,.15,lf],[-.05,.98,.06,.14,lf2],[.08,.92,-.08,.12,lf]])sph(S,r,m,x,y,z)},
  flowers(S,D,t){ // 小花圃：木框裡種一排排的花
    rbx(S,.92,.2,.92,.03,M_.wood,0,.1,0);bx(S,.84,.04,.84,paint(0x4a3222,0,1),0,.2,0);
    const cols=[0xe8504a,0xf2c230,0xf08cc0,0xffffff,0x9a6ad8],st=paint(0x3f8a3a,0,.7),lv_=paint(0x4f9a44,0,.7);let k=0;
    for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=-.3+i*.2+(j%2)*.04,z=-.3+j*.2;cyl(S,.008,.008,.16,st,x,.3,z);sph(S,.045,paint(cols[(k++)%5],0,.6),x,.4,z);sph(S,.045,lv_,x+.03,.25,z-.02)}},
  bench(S,D,t){ // 長椅（2 格）：鑄鐵椅腳＋木條，椅背在後面
    const iron=paint(0x2a2a2c,.6,.5);
    for(const x of[-.78,.78]){bx(S,.06,.44,.06,iron,x,.22,-.18);bx(S,.06,.44,.06,iron,x,.22,.18);bx(S,.06,.06,.44,iron,x,.43,0);bx(S,.06,.55,.06,iron,x,.72,.21,-.12,0,0)}
    for(const z of[-.16,-.055,.055,.16])bx(S,1.75,.04,.085,M_.wood,0,.47,z);
    for(const y of[.63,.77,.91])bx(S,1.75,.09,.035,M_.wood,0,y,.22+(y-.63)*.12,-.12,0,0)},
  lantern(S,D,t){ // 紅燈籠：木柱＋橫桿，燈籠晚上會亮
    cyl(S,.05,.06,2.0,M_.wood,0,1.0,0);bx(S,.5,.05,.05,M_.wood,.22,1.95,0);cyl(S,.006,.006,.2,MM.dark,.42,1.84,0);
    lat(S,'lant',[[0,0],[.11,0],[.19,.06],[.23,.2],[.19,.34],[.11,.4],[0,.4]],LANT_M,.42,1.34,0);
    const cap=paint(0x1a1a1a,.3,.5);cyl(S,.1,.1,.04,cap,.42,1.34,0);cyl(S,.1,.1,.04,cap,.42,1.74,0);
    const gd=paint(0xf2c230,.3,.5);for(let k=0;k<6;k++)cyl(S,.005,.005,.16,gd,.42+Math.cos(k*1.05)*.05,1.24,Math.sin(k*1.05)*.05)},
  luckycat(S,D,t){ // 招財貓：左手抱金幣，右手一直招
    const w=paint(0xf7f3ea,.05,.45),red=paint(0xd0281e,.1,.5),gold=paint(0xe0b030,.8,.3),blk=paint(0x1b1b1b,0,.6),pink=paint(0xf0a0a8,0,.6);
    rbx(S,.4,.06,.34,.02,paint(0x8a1e1a,.1,.7),0,.03,0);
    lat(S,'lcb',[[0,0],[.14,0],[.16,.08],[.15,.2],[.1,.28],[0,.3]],w,0,.06,0);
    sph(S,.13,w,0,.46,0);for(const x of[-.075,.075]){cyl(S,0,.045,.08,w,x,.58,0,0,Math.PI/4,x>0?-.25:.25);cyl(S,0,.025,.05,pink,x,.575,-.012,0,Math.PI/4,x>0?-.25:.25)}
    for(const x of[-.045,.045])bx(S,.04,.008,.01,blk,x,.48,-.125);sph(S,.013,pink,0,.45,-.13);for(const x of[-1,1])for(const y of[.435,.45])bx(S,.07,.004,.004,blk,x*.09,y,-.11,0,0,x*(y-.44)*8);
    tor(S,.1,.015,red,0,.34,0,Math.PI/2,0,0);sph(S,.03,gold,0,.31,-.1);
    sph(S,.045,w,.08,.22,-.12);cyl(S,.075,.075,.015,gold,.02,.22,-.15,Math.PI/2,0,0);
    const pw=new THREE.Group();pw.position.set(-.12,.36,-.02);D.add(pw);t.wave=pw;cyl(pw,.03,.036,.15,w,0,.075,0);sph(pw,.042,w,0,.16,0);sph(pw,.016,pink,0,.17,-.035)},
  radio(S,D,t){ // 阿公的舊收音機（劇情送的）：小木桌上的木頭收音機，打開時刻度窗會亮
    const wd=paint(0x8a5a32,0,.8),bodyM=paint(0x6b3a1c,.1,.42),dk=paint(0x2a1a10,.1,.6);
    rbx(S,.62,.04,.46,.015,wd,0,.56,0);for(const x of[-.26,.26])for(const z of[-.18,.18])cyl(S,.018,.016,.54,wd,x,.27,z);bx(S,.5,.02,.36,wd,0,.18,0);
    rbx(S,.5,.3,.24,.035,bodyM,0,.73,0);mk(S,cylGeo(.25,.25,.24,24,false,Math.PI/2,Math.PI),bodyM,0,.875,0,Math.PI/2,0,0).scale.set(1,1,.42);
    bx(S,.24,.18,.01,paint(0xcdb88e,0,.95),-.09,.75,-.121);for(let k=0;k<5;k++)bx(S,.012,.18,.012,dk,-.19+k*.05,.75,-.127);
    cyl(S,.028,.028,.03,dk,.07,.66,-.128,Math.PI/2,0,0);cyl(S,.028,.028,.03,dk,.15,.66,-.128,Math.PI/2,0,0);cyl(S,.005,.004,.5,MM.chrome,.17,1.06,.06,0,0,-.42);
    const dm=new THREE.MeshStandardMaterial({color:0xf3e2b0,emissive:0xffb040,emissiveIntensity:0,roughness:.5});mk(D,boxGeo(.16,.065,.008),dm,.11,.8,-.122);bx(D,.004,.052,.01,paint(0xc0281e,0,.5),.1,.8,-.127);t.dial=dm},
  cosign(S,D,t){ // 合作社的舊招牌（劇情送的）：兩根木柱撐著一塊木頭招牌
    const post=paint(0x5a3a22,0,.8),dk=paint(0x2a1a10,0,.7);
    for(const x of[-.86,.86]){cyl(S,.05,.06,2.0,post,x,1.0,0);cyl(S,.08,.09,.06,dk,x,.03,0)}bx(S,2.02,.05,.16,dk,0,1.93,0);
    if(!coSignTex)coSignTex=canvasTex(1024,300,(g,W,Hh)=>{g.fillStyle='#5a3418';g.fillRect(0,0,W,Hh);g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2;for(let y=8;y<Hh;y+=14){g.beginPath();g.moveTo(0,y+Math.sin(y)*3);g.bezierCurveTo(W*.3,y+6,W*.6,y-6,W,y+Math.cos(y)*3);g.stroke()}
      g.strokeStyle='#d8b060';g.lineWidth=10;g.strokeRect(16,16,W-32,Hh-32);g.fillStyle='#f2d690';g.textAlign='center';g.textBaseline='middle';
      let fs=150;const txt='海口信用合作社';g.font='900 '+fs+'px "DFKai-SB","BiauKai","Kaiti TC","Microsoft JhengHei",serif';while(g.measureText(txt).width>W-90&&fs>40){fs-=6;g.font='900 '+fs+'px "DFKai-SB","BiauKai","Kaiti TC","Microsoft JhengHei",serif'}
      g.fillText(txt,W/2,Hh/2-18);g.font='bold 34px Georgia,serif';g.fillStyle='#d8b060';g.fillText('HAIKOU CREDIT CO-OP',W/2,Hh-58)});
    const bm=[dk,dk,dk,dk,new THREE.MeshStandardMaterial({map:coSignTex,roughness:.8}),new THREE.MeshStandardMaterial({map:coSignTex,roughness:.8})];
    const b=new THREE.Mesh(boxGeo(1.9,.56,.07),bm);b.position.set(0,1.6,0);b.castShadow=true;D.add(b)},
  split:(S,D,t)=>junction(S,D,t,'split'),splitU:(S,D,t)=>junction(S,D,t,'splitU'),split3:(S,D,t)=>junction(S,D,t,'split3'),smart:(S,D,t)=>junction(S,D,t,'smart'),
  merge:(S,D,t)=>junction(S,D,t,'merge'),mergeU:(S,D,t)=>junction(S,D,t,'mergeU'),mergeC:(S,D,t)=>junction(S,D,t,'mergeC'),tjunc:(S,D,t)=>junction(S,D,t,'tjunc'),

  rake(S,D,t){ // 活塞耙（1×2）：綠色蒸汽機身，後面的耙子伸進硬幣堆，前面的出料口把硬幣倒上輸送帶
    const gr=paint(0x3f6b34,.35,.5),gr2=paint(0x2f5228,.35,.55);
    rbx(S,.9,.16,1.86,.04,MM.dark,0,.1,0);for(const z of[-.7,.7])for(const x of[-.47,.47])cyl(S,.13,.13,.09,MM.rubber,x,.13,z,0,0,Math.PI/2);
    rbx(S,.84,.5,1.15,.08,gr,0,.42,.12);rbx(S,.88,.05,1.2,.02,gr2,0,.69,.12);
    cyl(S,.27,.27,.95,gr,0,.95,.18,Math.PI/2);for(const z of[-.18,.2,.58])tor(S,.275,.025,MM.brass,0,.95,z);cyl(S,.22,.27,.05,MM.brass,0,.95,-.31,Math.PI/2);
    cyl(S,.07,.09,.75,MM.dark,.24,1.42,-.12);cyl(S,.12,.07,.08,MM.dark,.24,1.82,-.12);
    // 出料口
    rbx(S,.7,.06,.42,.02,M_.belt,0,.5,-.78,.35);bx(S,.05,.2,.45,M_.yellow,-.36,.58,-.78,.35);bx(S,.05,.2,.45,M_.yellow,.36,.58,-.78,.35);
    // 活塞
    for(const x of[-.3,.3]){cyl(S,.06,.06,.55,MM.chrome,x,.62,.72,Math.PI/2.4);cyl(S,.08,.08,.3,gr2,x,.68,.5,Math.PI/2.4)}
    const box_=rbx(S,.24,.3,.2,.03,MM.dark,-.36,.86,-.42);t.lamp=lampOn(D,-.36,1.05,-.42,.045);
    // 飛輪
    const wh=new THREE.Mesh(cylGeo(.36,.36,.06,26),MM.dark);wh.position.set(.5,.62,.12);wh.rotation.z=Math.PI/2;D.add(wh);t.wheel=wh;
    for(let k=0;k<6;k++)bx(wh,.03,.62,.03,MM.steel,0,0,0,k*Math.PI/6);cyl(wh,.06,.06,.09,MM.brass,0,0,0);
    // 耙子（前後動）
    const arm=new THREE.Group();arm.position.set(0,.5,.85);D.add(arm);t.arm=arm;t.armZ=.85;
    for(const x of[-.34,.34])rbx(arm,.07,.07,.5,.02,MM.steel,x,.05,.12);rbx(arm,.86,.07,.09,.02,MM.dark,0,-.05,.38);
    for(let k=-4;k<=4;k++)bx(arm,.025,.26,.025,MM.steel,k*.095,-.2,.4,-.3);
  },
  arm:(S,D,t)=>robotArm(S,D,t,0x232326,1),arm2:(S,D,t)=>robotArm(S,D,t,0xd06a1a,1.2),arm3:(S,D,t)=>robotArm(S,D,t,0xe0b020,1.45),

  gen(S,D,t){ // 硬幣發電機（2×2）：柴油發電機那種外殼，上面有投幣的漏斗
    const tl=paint(0x2f6070,.35,.45);
    rbx(S,1.9,.14,1.75,.03,MM.dark,0,.07,0);bx(S,1.9,.06,.06,MM.hazard,0,.15,-.86);
    rbx(S,1.7,.95,1.32,.09,tl,0,.62,.05);rbx(S,1.76,.07,1.38,.03,MM.dark,0,1.12,.05);
    for(const sx of[-1,1])for(let k=0;k<5;k++)bx(S,.04,.06,.9,MM.dark,sx*.86,.38+k*.13,.05,0,0,sx*.5);
    rbx(S,1.2,.7,.06,.02,MM.dark,0,.62,-.63);for(let k=0;k<6;k++)bx(S,1.1,.03,.07,MM.steel,0,.33+k*.11,-.67);
    const fh=new THREE.Group();fh.position.set(0,.62,-.69);fh.rotation.x=Math.PI/2;D.add(fh);const fan=new THREE.Group();fh.add(fan);t.wheel=fan;
    for(let k=0;k<5;k++){const b=bx(fan,.08,.02,.28,MM.steel,0,0,.14);b.parent.remove(b);const arm=new THREE.Group();arm.rotation.y=k*Math.PI*2/5;arm.add(b);b.rotation.z=.4;fan.add(arm)}cyl(fan,.07,.07,.05,MM.dark,0,0,0);
    tor(S,.3,.02,MM.steel,0,.62,-.7);
    cyl(S,.08,.08,.9,MM.dark,-.62,1.55,.4);cyl(S,.16,.16,.5,MM.steel,-.62,1.25,.12,Math.PI/2);cyl(S,.13,.08,.06,MM.dark,-.62,2.02,.4);
    funnel(S,.32,.12,.35,.45,1.35,.35);cyl(S,.12,.12,.18,MM.steel,.45,1.13,.35);tor(S,.32,.02,MM.brass,.45,1.52,.35,Math.PI/2);
    rbx(S,.36,.42,.12,.03,MM.dark,.55,.75,-.69);for(const x of[.45,.65]){cyl(S,.06,.06,.02,MM.white,x,.85,-.76,Math.PI/2);cyl(S,.065,.065,.015,MM.dark,x,.85,-.755,Math.PI/2)}
    t.lamp=lampOn(D,.55,.62,-.76);label(S,'GENERATOR',.9,.18,-.25,1.0,-.66,Math.PI);
  },
  gas(S,D,t){ // 燃氣發電廠（3×3）：橘色機房、渦輪、紅白煙囪、白色儲氣槽
    const or=paint(0xc8642a,.3,.5);
    rbx(S,2.9,.12,2.9,.03,M_.conc,0,.06,0);
    rbx(S,1.8,1.4,1.7,.06,or,-.45,.82,.45);rbx(S,1.9,.1,1.8,.03,MM.dark,-.45,1.57,.45);
    for(const x of[-1.05,-.45,.15])rbx(S,.36,.3,.04,.02,glowM(0xffd27a,.6),x,1.1,-.42);rbx(S,.5,.9,.05,.02,MM.dark,-.95,.55,-.42);
    cyl(S,.38,.38,1.4,MM.steel,.85,.55,.35,Math.PI/2);for(const z of[-.15,.35,.85])tor(S,.385,.03,MM.dark,.85,.55,z);cyl(S,.42,.3,.25,MM.dark,.85,.55,-.45,Math.PI/2);
    cyl(S,.2,.17,3.2,paint(0xd9d9d9,.3,.5),1.05,1.7,1.05);for(const y of[2.6,3.05])cyl(S,.19,.19,.22,paint(0xc0392b,.3,.5),1.05,y,1.05);cyl(S,.24,.2,.1,MM.dark,1.05,3.32,1.05);
    tube(S,[[.85,.9,.9],[.95,1.2,1.0],[1.05,1.4,1.05]],.08,MM.steel);
    sph(S,.5,paint(0xeeeeee,.4,.35),-1.0,1.1,-1.0);for(const[a,b]of[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]])cyl(S,.03,.03,.7,MM.dark,-1.0+a,.4,-1.0+b);
    tube(S,[[-.7,1.0,-.85],[-.3,.9,-.5],[-.2,.8,-.38]],.05,MM.steel);
    funnel(S,.4,.15,.4,.75,1.05,-.95,4);cyl(S,.12,.12,.3,MM.steel,.75,.72,-.95);label(S,'環保磚',.5,.14,.75,1.32,-1.24,Math.PI,'#3a2a1a','#ffd27a');
    const fh=new THREE.Group();fh.position.set(-1.36,.9,.45);fh.rotation.z=Math.PI/2;D.add(fh);const fan=new THREE.Group();fh.add(fan);t.wheel=fan;for(let k=0;k<4;k++)bx(fan,.06,.02,.5,MM.steel,0,0,0,0,k*Math.PI/4,0);
    t.lamp=lampOn(D,.2,1.7,-.4);label(S,'GAS PLANT',1.1,.22,-.45,1.35,-.43,Math.PI);
  },
  pole(S,D,t){ // 電線桿：木桿、橫擔、綠色礙子、變壓器
    cyl(S,.08,.11,3.3,M_.wood,0,1.65,0,0,0,0,12);cyl(S,.16,.18,.2,M_.conc,0,.1,0);
    rbx(S,1.0,.08,.1,.02,M_.wood,0,3.0,0);for(const x of[-.42,0,.42]){cyl(S,.035,.045,.12,glowM(0x2f8f5a,.15),x,3.11,0);cyl(S,.05,.05,.02,glowM(0x2f8f5a,.15),x,3.08,0)}
    cyl(S,.15,.15,.42,paint(0x8a9298,.6,.4),0,2.35,.2);bx(S,.06,.06,.24,MM.dark,0,2.35,.06);cyl(S,.02,.02,.5,MM.dark,0,2.75,.2);
    for(let k=0;k<5;k++)bx(S,.18,.02,.02,MM.dark,0,.9+k*.35,k%2?.09:-.09,0,k%2?.5:-.5,0);
    t.lamp=lampOn(D,0,2.72,.1);
  },
  cbox(S,D,t){ // 地下電纜箱：綠色電箱，下面接管子進地下
    rbx(S,.6,.12,.42,.02,M_.conc,0,.06,0);rbx(S,.52,.72,.34,.04,paint(0x3c5a3c,.35,.5),0,.48,0);rbx(S,.56,.05,.38,.02,MM.dark,0,.86,0);
    bx(S,.005,.6,.3,MM.dark,0,.48,-.172);rbx(S,.16,.12,.02,.01,MM.glass,.12,.66,-.175);cyl(S,.03,.03,.04,MM.white,.12,.66,-.18,Math.PI/2);
    cyl(S,.05,.05,.3,MM.dark,-.15,.06,.25,Math.PI/2);t.lamp=lampOn(D,-.14,.72,-.18,.035);
  },
  switch(S,D,t){ // 開關箱：柱子上的配電盤，8 個燈＋大拉桿
    rbx(S,.3,.1,.3,.02,M_.conc,0,.05,0);cyl(S,.05,.05,1.2,MM.dark,0,.65,.05);rbx(S,.82,.68,.2,.04,paint(0x5a6470,.45,.45),0,1.3,.08);rbx(S,.86,.05,.26,.02,MM.dark,0,1.66,.08);
    t.lights=[];for(let k=0;k<8;k++){const l=new THREE.Mesh(sphGeo(.035,8,6),new THREE.MeshBasicMaterial({color:0x33ff66}));l.position.set(-.27+(k%4)*.18,1.42-Math.floor(k/4)*.2,-.03);D.add(l);t.lights.push(l)}
    bx(S,.06,.22,.04,MM.dark,.36,1.15,-.03);cyl(S,.05,.05,.08,paint(0xc0392b,.3,.5),.36,1.27,-.06,Math.PI/2);label(S,'POWER',.36,.09,0,1.56,-.03,Math.PI);
  },
  dish(S,D,t){ // 衛星天線（2×2）：塔上一個會轉的拋物面天線
    rbx(S,1.6,.2,1.6,.04,M_.conc,0,.1,0);cyl(S,.18,.3,2.1,MM.steel,0,1.25,0,0,0,0,16);for(const y of[.6,1.2,1.8])tor(S,.24-y*.03,.02,MM.dark,0,y,0,Math.PI/2);
    const hd=new THREE.Group();hd.position.y=2.35;D.add(hd);t.anim=hd;cyl(hd,.22,.22,.15,MM.dark,0,0,0);
    const tilt=new THREE.Group();tilt.rotation.x=-.65;tilt.position.y=.15;hd.add(tilt);
    const pts=[];for(let k=0;k<=10;k++){const r=.95*k/10;pts.push([r,.32*(r/.95)**2])}
    mk(tilt,latheGeo('dish',pts,32),MM.dishM,0,0,0);
    tor(tilt,.95,.02,MM.steel,0,.32,0,Math.PI/2);for(let k=0;k<3;k++){const a=k*Math.PI*2/3;cyl(tilt,.012,.012,.85,MM.dark,Math.cos(a)*.38,.62,Math.sin(a)*.38,Math.sin(a)*.5,0,-Math.cos(a)*.5)}
    cyl(tilt,.06,.04,.18,MM.dark,0,.98,0);rbx(hd,.3,.3,.3,.04,MM.dark,0,0,.3);
    t.lamp=lampOn(D,.6,.3,-.6);
  },
  scanner:(S,D,t)=>scannerModel(S,D,t,false),scanner2:(S,D,t)=>scannerModel(S,D,t,true),
  detector(S,D,t){ // 一元偵測機（1×3）：一整座黃色隧道，上面有轉動的雷達
    for(const z of[-1,0,1])beltSeg(S,z);const yl=paint(0xe2a51c,.3,.5);
    for(const sx of[-1,1])rbx(S,.2,1.5,2.7,.05,yl,sx*.62,.95,0);rbx(S,1.44,.5,2.7,.08,yl,0,1.92,0);
    for(const z of[-1.37,1.37]){rbx(S,1.44,.14,.08,.02,MM.dark,0,1.6,z);for(const sx of[-1,1])rbx(S,.08,1.2,.08,.02,MM.dark,sx*.52,.95,z)}
    bx(S,1.46,.1,2.72,MM.hazard,0,.25,0);for(const sx of[-1,1])rbx(S,.03,.5,1.6,.02,glowM(0x7fd8ff,.35),sx*.725,1.2,0);
    label(S,'ONE DETECTOR',1.2,.28,0,1.92,-1.36,Math.PI);rbx(S,.42,.5,.6,.04,MM.dark,-.85,.3,0);label(S,'1元',.3,.14,-1.065,.42,0,-Math.PI/2,'#1b1b1b','#ffd34d');
    const rd=new THREE.Group();rd.position.set(0,2.2,.6);D.add(rd);t.spin=rd;rbx(rd,.7,.22,.05,.02,MM.steel,0,.15,0);cyl(rd,.05,.05,.25,MM.dark,0,0,0);
    t.lamp=lampOn(D,0,2.24,-.6,.08);
  },
  roller(S,D,t){ // 壓縮機（1×2）：後面進料斗、四根柱子的油壓機、前面出料
    const bl=paint(0x4d6a86,.35,.45);
    rbx(S,.92,.3,1.86,.04,MM.dark,0,.15,0);rbx(S,.86,.55,.8,.06,bl,0,.55,.5);funnel(S,.5,.2,.5,0,1.12,.5,4);bx(S,.5,.05,.05,M_.yellow,0,1.38,.15);
    rbx(S,.76,.16,.76,.04,MM.steel,0,.4,-.42);for(const[a,b]of[[-.32,-.74],[.32,-.74],[-.32,-.1],[.32,-.1]])cyl(S,.045,.045,1.3,MM.chrome,a,1.05,b);
    rbx(S,.86,.2,.82,.05,bl,0,1.72,-.42);cyl(S,.15,.15,.45,MM.steel,0,2.0,-.42);cyl(S,.06,.06,.3,MM.chrome,0,1.5,-.42);
    t.anim=rbx(D,.62,.12,.62,.03,M_.yellow,0,1.3,-.42);
    cyl(S,.18,.18,.4,MM.dark,.5,.6,.5,0,0,Math.PI/2);cyl(S,.14,.14,.05,MM.steel,.72,.6,.5,0,0,Math.PI/2);
    rbx(S,.56,.05,.3,.02,M_.belt,0,.45,-.86,.25);label(S,'COMPRESSOR',.7,.14,0,.55,.085,Math.PI);t.lamp=lampOn(D,.3,1.86,-.42);
  },
  unroll(S,D,t){ // 硬幣捆拆解機（1×2）：紅色機身，上面兩片會轉的刀片
    const rd=paint(0x8a3a2a,.35,.5);rbx(S,.9,.28,1.8,.04,MM.dark,0,.14,0);rbx(S,.82,.6,1.4,.07,rd,0,.58,.1);
    rbx(S,.6,.08,.5,.02,MM.dark,0,.92,.35);funnel(S,.38,.18,.3,0,1.05,.55,4);
    const sp=new THREE.Group();sp.position.set(0,.95,-.15);D.add(sp);t.spin=sp;t.spinAx='x';
    for(const x of[-.15,.15]){const bl=cyl(sp,.2,.2,.03,MM.chrome,x,0,0,0,0,Math.PI/2,24);}
    bx(S,.62,.12,.06,M_.yellow,0,1.05,-.42);rbx(S,.56,.05,.3,.02,M_.belt,0,.42,-.82,.25);label(S,'UNROLLER',.6,.13,0,.6,-.61,Math.PI);t.lamp=lampOn(D,-.3,.95,.6);
  },
  wrap(S,D,t){ // 包裝機（1×2）：輸送帶穿過一個會轉的包膜環
    beltSeg(S,-.5);beltSeg(S,.5);const bl=paint(0x5d7f97,.35,.45);
    for(const sx of[-1,1])rbx(S,.14,1.4,.3,.03,bl,sx*.55,.75,0);rbx(S,1.24,.18,.34,.04,bl,0,1.5,0);
    const ring=new THREE.Group();ring.position.set(0,.78,0);D.add(ring);t.spin=ring;t.spinAx='z';
    mk(ring,torGeo(.48,.045,0,36),MM.steel,0,0,0);cyl(ring,.07,.07,.3,MM.white,0,.48,0,Math.PI/2);cyl(ring,.03,.03,.34,MM.dark,0,.48,0,Math.PI/2);
    rbx(S,.3,.7,.4,.04,MM.dark,.75,.35,.6);rbx(S,.2,.12,.02,.01,glowM(0x55ff99,.5),.75,.55,.39);
    for(const z of[.75,.95])cyl(S,.08,.08,.3,MM.white,-.72,.3,z,0,0,0);label(S,'WRAPPER',.6,.13,0,1.5,-.18,Math.PI);t.lamp=lampOn(D,.55,1.62,0);
  },
  pellet(S,D,t){ // 造粒機（1×2）：橫躺的加熱筒＋上面的料斗＋後面的馬達
    const gr=paint(0x4f7a3a,.35,.5);rbx(S,.9,.3,1.86,.04,MM.dark,0,.15,0);
    cyl(S,.22,.22,1.2,MM.steel,0,.72,-.1,Math.PI/2);for(let k=0;k<4;k++)tor(S,.23,.035,glowM(0xff6a2a,.35),0,.72,-.5+k*.25);
    rbx(S,.7,.6,.5,.06,gr,0,.75,.62);cyl(S,.2,.2,.35,MM.dark,0,.75,.35,Math.PI/2);funnel(S,.4,.16,.45,0,1.25,.15);cyl(S,.12,.12,.2,MM.steel,0,.95,.15);
    cyl(S,.28,.28,.12,MM.dark,0,.72,-.72,Math.PI/2);t.anim=rbx(D,.3,.05,.06,.01,MM.chrome,0,.95,-.8);
    cyl(S,.06,.06,.7,MM.dark,.3,1.4,.62);rbx(S,.56,.05,.3,.02,M_.belt,0,.42,-.82,.25);label(S,'PELLETIZER',.6,.13,0,.75,.36,Math.PI);t.lamp=lampOn(D,-.3,1.08,.62);
  },
  disc(S,D,t){ // 圓盤壓製機（2×2）：四根柱子的大油壓機，後面兩個料斗（硬幣、環保磚）
    const pu=paint(0x6b4f8a,.35,.45);rbx(S,1.85,.4,1.85,.06,pu,0,.2,0);cyl(S,.62,.62,.12,MM.steel,0,.46,0,0,0,0,32);
    for(const[a,b]of[[-.62,-.62],[.62,-.62],[-.62,.62],[.62,.62]]){cyl(S,.07,.07,1.7,MM.chrome,a,1.2,b);cyl(S,.11,.11,.08,MM.dark,a,2.0,b)}
    rbx(S,1.6,.32,1.6,.06,pu,0,2.12,0);cyl(S,.28,.28,.45,MM.steel,0,2.5,0);t.anim=cyl(D,.55,.55,.2,M_.yellow,0,1.55,0,0,0,0,32);cyl(S,.08,.08,.5,MM.chrome,0,1.85,0);
    funnel(S,.32,.14,.35,-.5,1.0,.78);label(S,'硬幣',.34,.13,-.5,1.0,1.11,0,'#1b1b1b','#e8e8e8');
    funnel(S,.32,.14,.35,.5,1.0,.78,20,paint(0x7a5a3a,.3,.6));label(S,'環保磚',.4,.13,.5,1.0,1.11,0,'#3a2a1a','#ffd27a');
    rbx(S,.56,.05,.3,.02,M_.belt,-.5,.42,-.95,.25);label(S,'DISC PRESS',.9,.18,0,2.12,-.81,Math.PI);t.lamp=lampOn(D,.75,2.32,-.75);
  },
  pulp(S,D,t){ // 紙漿機（2×2）：大槽＋上面的攪拌馬達
    lat(S,'vat',[[.82,.15],[.86,.2],[.86,1.2],[.9,1.25],[.9,1.3],[.82,1.3],[.82,.15]],MM.steelDS,0,0,.1,32);mk(S,new THREE.CircleGeometry(.82,32),paint(0x8f8466,.1,.2),0,1.08,.1,-Math.PI/2);
    for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;cyl(S,.05,.05,.3,MM.dark,Math.cos(a)*.7,.15,.1+Math.sin(a)*.7)}tor(S,.87,.03,MM.dark,0,.6,.1,Math.PI/2);
    rbx(S,1.9,.1,.16,.02,MM.dark,0,1.45,.1);rbx(S,.36,.3,.36,.04,MM.dark,0,1.62,.1);
    const ag=new THREE.Group();ag.position.set(0,1.0,.1);D.add(ag);t.spin=ag;t.anim=ag;cyl(ag,.03,.03,1.0,MM.chrome,0,.15,0);for(let k=0;k<3;k++)bx(ag,.5,.04,.08,MM.steel,0,-.25,0,0,k*Math.PI/3,0);
    tube(S,[[.95,.1,.7],[.95,.9,.7],[.75,1.25,.55]],.06,pipeMat);rbx(S,.56,.05,.3,.02,M_.belt,-.5,.42,-.95,.25);rbx(S,.3,.5,.3,.03,paint(0x2a5f8f,.5,.4),-.75,.25,-.6);
    label(S,'PULPER',.6,.14,0,1.45,.0,Math.PI);t.lamp=lampOn(D,.25,1.82,.1);
  },
  paper(S,D,t){ // 造紙機（2×3）：一排滾筒、烘乾罩、前面捲成一捲紙
    rbx(S,1.85,.28,2.85,.04,MM.dark,0,.14,0);for(const sx of[-1,1])rbx(S,.1,.75,2.6,.03,paint(0x3d5a6e,.35,.45),sx*.82,.6,0);
    for(let k=0;k<6;k++){const z=1.15-k*.4,r=k===2||k===3?.24:.14;cyl(S,r,r,1.55,k===2||k===3?MM.chrome:MM.white,0,.78,z,0,0,Math.PI/2,20)}
    t.anim=bx(D,1.5,.02,2.2,paint(0xf8f6f0,.05,.8),0,.98,.15);
    rbx(S,1.75,.55,1.0,.08,paint(0x3d5a6e,.35,.45),0,1.38,.1);for(let k=0;k<4;k++)cyl(S,.06,.06,.25,MM.steel,-.5+k*.33,1.75,.1);
    const rl=new THREE.Group();rl.position.set(0,.72,-1.15);D.add(rl);t.spin=rl;t.spinAx='x';cyl(rl,.3,.3,1.3,MM.white,0,0,0,0,0,Math.PI/2,24);cyl(rl,.06,.06,1.5,MM.dark,0,0,0,0,0,Math.PI/2);
    tube(S,[[-.9,1.2,.6],[-1.0,1.6,.6],[-1.0,1.8,.2]],.05,MM.copper);rbx(S,.5,.8,.4,.04,MM.dark,.9,.4,1.2);rbx(S,.3,.15,.02,.01,glowM(0x55ff99,.5),.9,.7,.99);
    rbx(S,.56,.05,.3,.02,M_.belt,-.5,.42,-1.45,.25);label(S,'PAPER MILL',.9,.18,0,1.4,-.41,Math.PI);t.lamp=lampOn(D,.6,1.72,-.3);
  },
  silo(S,D,t){ // 筒倉（2×2）：四隻腳上的大圓筒，下面漏斗接到出口
    for(const[a,b]of[[-.62,-.62],[.62,-.62],[-.62,.62],[.62,.62]])rbx(S,.12,1.4,.12,.02,MM.steel,a,.7,b);for(const z of[-.62,.62])bx(S,1.2,.06,.06,MM.dark,0,.6,z,0,0,.0);
    mk(S,cylGeo(.88,.1,.6,32,false),paint(0xbfc5c9,.75,.35),0,1.55,0);const bd=paint(0xc5cacd,.75,.35);cyl(S,.88,.88,2.8,bd,0,3.25,0,0,0,0,32);
    for(let k=0;k<5;k++)tor(S,.89,.02,MM.dark,0,2.0+k*.6,0,Math.PI/2);mk(S,cylGeo(.1,.92,.45,32),MM.steel,0,4.88,0);cyl(S,.12,.12,.15,MM.dark,0,5.15,0);
    tor(S,.92,.025,M_.yellow,0,4.75,0,Math.PI/2);for(const a of[0,1.57,3.14,4.71])cyl(S,.015,.015,.3,M_.yellow,Math.cos(a)*.92,4.6,Math.sin(a)*.92);
    for(const x of[.82,.98])bx(S,.03,3.4,.03,MM.dark,x,3.0,.35,0,0,0);for(let k=0;k<12;k++)bx(S,.18,.02,.02,MM.dark,.9,1.5+k*.28,.35);
    tube(S,[[0,1.2,0],[-.3,.9,-.5],[-.5,.6,-.85]],.09,MM.steel);rbx(S,.56,.05,.3,.02,M_.belt,-.5,.42,-.95,.25);
    rbx(S,.06,2.2,.12,.02,glowM(0x55ff99,.25),-.89,3.0,0);label(S,'SILO',.6,.2,0,3.4,-.89,Math.PI);t.lamp=lampOn(D,-.5,1.75,-.75);
  },
  pump(S,D,t){ // 鑽井抽水機（2×2）：點頭的抽油機那種樣子
    const yl=paint(0xe2a51c,.35,.5);rbx(S,1.85,.14,1.85,.03,M_.conc,0,.07,0);
    for(const sx of[-1,1])rbx(S,.08,1.6,.1,.02,yl,sx*.2,.85,-.05,0,0,sx*.15);rbx(S,.5,.08,.12,.02,yl,0,1.62,-.05);
    const bm=new THREE.Group();bm.position.set(0,1.7,-.05);D.add(bm);t.beam=bm;
    rbx(bm,.14,.14,1.7,.03,yl,0,0,.1);rbx(bm,.3,.5,.14,.04,yl,0,-.1,.92);cyl(bm,.25,.25,.16,MM.dark,0,-.05,.92,0,0,Math.PI/2,16);rbx(bm,.3,.3,.3,.04,MM.dark,0,-.05,-.75);
    t.anim=cyl(D,.025,.025,1.2,MM.chrome,0,.95,.85);
    cyl(S,.12,.12,.35,pipeMat,0,.3,.85);cyl(S,.1,.1,.06,M_.yellow,0,.5,.85);tor(S,.1,.015,paint(0xc0392b,.3,.5),.16,.45,.85,0,Math.PI/2,0);tube(S,[[0,.3,.85],[.5,.25,.85],[.85,.2,.85]],.06,pipeMat);
    rbx(S,.4,.35,.45,.04,paint(0x2a5f8f,.5,.4),.55,.32,-.55);tube(S,[[.4,.45,-.5],[.15,1.0,-.6],[0,1.4,-.7]],.03,MM.rubber);
    for(const sx of[-1,1])rbx(S,.08,.55,.08,.02,MM.dark,sx*.18,.4,-.7);t.lamp=lampOn(D,.55,.55,-.78);
  },
  pusher(S,D,t){ // 硬幣推送機：履帶車＋前面的推鏟（往硬幣那邊推）
    const ol=paint(0x6d7f3a,.35,.5);for(const sx of[-1,1])rbx(S,.16,.24,.82,.08,MM.rubber,sx*.36,.14,0);
    rbx(S,.6,.38,.62,.06,ol,0,.42,-.05);rbx(S,.4,.26,.3,.04,glowM(0x223344,.1),0,.72,.0);rbx(S,.5,.05,.4,.02,M_.belt,0,.38,-.4,.25);
    const bl=new THREE.Group();bl.position.set(0,0,.5);D.add(bl);t.anim=bl;t.animZ=.5;
    mk(bl,cylGeo(.45,.45,.9,16,true,-.6,1.2),MM.yellowDS,0,.25,-.3,0,0,Math.PI/2);
    for(const sx of[-1,1])cyl(bl,.035,.035,.45,MM.chrome,sx*.25,.35,-.25,Math.PI/2.5);
  },
  drone(S,D,t){ // 無人機停機坪（2×2）：H 字停機坪＋四角的燈＋充電樁
    mk(S,boxGeo(1.8,.08,1.8),MM.pad,0,.04,0);for(const[a,b]of[[-.85,-.85],[.85,-.85],[-.85,.85],[.85,.85]])cyl(S,.05,.05,.05,glowM(0x55aaff,.6),a,.1,b);
    rbx(S,.22,.6,.22,.04,MM.dark,.8,.3,.8);rbx(S,.14,.08,.02,.01,glowM(0x55ff99,.5),.8,.48,.69);t.lamp=lampOn(D,.8,.66,.8,.04);
  },
  cabinet(S,D,t){ // 一元收藏櫃（2×1）：下面抽屜、上面玻璃展示櫃（正面朝 +z）
    rbx(S,1.9,.08,.6,.02,MM.dark,0,.04,0);rbx(S,1.85,.8,.55,.03,M_.wood,0,.48,0);bx(S,1.75,.68,.02,MM.drawer,0,.48,.28);
    rbx(S,1.85,.08,.58,.02,M_.wood,0,.92,0);for(const sx of[-1,1])rbx(S,.06,.95,.55,.02,M_.wood,sx*.9,1.42,0);rbx(S,1.85,.06,.55,.02,M_.wood,0,1.92,0);rbx(S,1.95,.08,.62,.02,M_.wood,0,2.0,0);
    bx(S,1.75,.03,.45,M_.wood,0,1.42,-.02);mk(S,planeGeo(1.76,.92),MM.glass,0,1.42,.27);bx(S,.02,.92,.02,MM.brass,0,1.42,.28);
    for(let k=0;k<6;k++)cyl(S,.05,.05,.012,MM.brass,-.7+k*.28,1.47,0);
  },
  chute(S,D,t){ // 卸料口：輸送帶上的大漏斗
    beltSeg(S,0);lat(S,'chute',[[.18,.55],[.2,.6],[.5,1.15],[.55,1.18],[.55,1.22],[.48,1.22]],MM.steelDS,0,0,0,24);
    for(const[a,b]of[[-.38,-.38],[.38,-.38],[-.38,.38],[.38,.38]])bx(S,.05,.75,.05,MM.dark,a,.8,b);tor(S,.55,.025,M_.yellow,0,1.2,0,Math.PI/2);
  },
  tube(S,D,t){ // 管式發射器：輸送帶後面進，往前斜斜的砲管
    beltSeg(S,.25,.5);rbx(S,.7,.45,.55,.06,MM.dark,0,.55,-.1);cyl(S,.26,.3,.15,MM.steel,0,.82,-.1);
    cyl(S,.15,.2,1.1,MM.steel,0,1.05,-.42,-.95);tor(S,.2,.03,M_.yellow,0,.78,-.12,-.95+Math.PI/2);cyl(S,.17,.17,.08,MM.dark,0,1.38,-.8,-.95);
  },
  lift(S,D,t){ // 硬幣升降機：四根黃柱、上面滑輪、平台上下
    beltSeg(S,0);for(const[a,b]of[[-.5,-.4],[.5,-.4],[-.5,.4],[.5,.4]])rbx(S,.08,1.75,.08,.02,M_.yellow,a,.88,b);
    rbx(S,1.12,.1,.9,.03,M_.yellow,0,1.75,0);cyl(S,.12,.12,.1,MM.dark,0,1.62,0,Math.PI/2,0,0);for(const sx of[-1,1])cyl(S,.01,.01,1.1,MM.dark,sx*.4,1.15,0);
    t.anim=rbx(D,.9,.05,.62,.02,MM.steel,0,.6,0);
  }
};
function robotArm(S,D,t,col,len){ // 機械手臂：底座、會轉的轉台、上臂、下臂、三爪夾子
  const cm=paint(col,.4,.4);lat(S,'armbase',[[0,0],[.42,0],[.42,.08],[.34,.14],[.3,.3],[0,.3]],MM.dark,0,0,0,24);
  for(let k=0;k<6;k++){const a=k*Math.PI/3;cyl(S,.03,.03,.04,MM.steel,Math.cos(a)*.36,.1,Math.sin(a)*.36)}
  const piv=new THREE.Group();piv.position.y=.3;D.add(piv);t.arm=piv;
  cyl(piv,.27,.3,.14,cm,0,.07,0,0,0,0,24);for(const sx of[-1,1])rbx(piv,.06,.32,.24,.03,cm,sx*.13,.28,0);cyl(piv,.1,.1,.34,MM.dark,0,.38,0,0,0,Math.PI/2);
  const up=new THREE.Group();up.position.y=.38;up.rotation.x=.5;piv.add(up);rbx(up,.16,.8*len,.16,.05,cm,0,.4*len,0);cyl(up,.05,.05,.5*len,MM.chrome,.12,.32*len,.06);
  const el=new THREE.Group();el.position.y=.8*len;el.rotation.x=1.25;up.add(el);cyl(el,.1,.1,.24,MM.dark,0,0,0,0,0,Math.PI/2);
  rbx(el,.12,.75*len,.12,.04,cm,0,.37*len,0);const wr=new THREE.Group();wr.position.y=.75*len;el.add(wr);cyl(wr,.07,.07,.12,MM.dark,0,.04,0);
  for(let k=0;k<3;k++){const f=new THREE.Group();f.rotation.y=k*Math.PI*2/3;wr.add(f);rbx(f,.03,.16,.03,.01,MM.steel,.07,.17,0,0,0,-.4)}
  tube(piv,[[-.1,.2,-.12],[-.12,.6,.05],[-.1,.9,.3]],.018,MM.rubber);
  t.lamp=lampOn(D,.3,.22,-.3,.04);
}
function scannerModel(S,D,t,mk2){ // 掃描器（1×2）：輸送帶穿過一個門型的掃描框，紅色雷射掃過去
  beltSeg(S,-.5);beltSeg(S,.5);const cm=mk2?paint(0x3a8fd0,.35,.45):paint(0xe2a51c,.35,.5);
  for(const sx of[-1,1]){rbx(S,.12,1.3,1.5,.04,cm,sx*.58,.85,0);mk(S,planeGeo(1.3,.7),MM.glass,sx*.52,.85,0,0,Math.PI/2,0)}
  rbx(S,1.3,.3,1.6,.06,cm,0,1.55,0);rbx(S,1.0,.06,1.2,.02,MM.dark,0,1.38,0);
  const bar=new THREE.Group();bar.position.set(0,1.32,0);D.add(bar);t.scanBar=bar;bx(bar,1.0,.04,.04,glowM(0xff3030,2),0,0,0);mk(bar,planeGeo(.98,.9),MM.laser,0,-.45,0);
  label(S,mk2?'SCANNER MK II':'SCANNER MK I',1.0,.2,0,1.55,-.81,Math.PI);
  rbx(S,.3,.26,.44,.04,MM.dark,-.78,.95,-.5);cyl(S,.02,.02,.2,MM.chrome,-.94,.95,-.5,Math.PI/2);rbx(S,.18,.12,.02,.01,glowM(0x55ff99,.6),.64,1.1,.35,0,Math.PI/2,0);
  if(mk2){rbx(S,.42,.06,.5,.02,MM.steel,.78,.42,-.5);bx(S,.06,.4,.06,MM.dark,.78,.2,-.5);for(const sx of[-1,1])bx(S,.42,.08,.02,MM.steel,.78,.48,-.5+sx*.24)}
  t.lamp=lampOn(D,0,1.76,.5,.07);
}
// 用新的模型；沒有新模型的（輸送帶、閘門、燈、油漆板…）照舊
function makeTileMesh(t){
  const T=t.type,mf=MODELS[T];if(!mf)return makeTileMesh0(t);
  const g=new THREE.Group(),inner=new THREE.Group(),S=new THREE.Group(),D=new THREE.Group();g.add(inner);inner.add(D);
  const c=fpCenter(T,0,0,0,t.cmp);inner.position.set(c.ca,0,c.cb);
  if(t.cmp){const f=FP[T]||[1,1],s=.9/Math.max(f[0],f[1]);inner.scale.set(s,s,s)}
  mf(S,D,t);inner.add(mergeStatic(S));
  // 會動的零件：每一組自己合併（整組一起轉、一起動）
  const refs=[t.wheel,t.spin,t.anim,t.arm,t.paddle,t.beam,t.scanBar].filter(x=>x&&x.isGroup);
  for(const c of new Set(refs)){let inner_=false;c.traverse(o=>{if(o!==c&&refs.includes(o))inner_=true});let k=0;c.traverse(o=>{if(o.isMesh)k++});if(!inner_&&k>1){const m=mergeStatic(c);c.clear();c.add(m)}}
  if((t.L||0)>0&&BELTLIKE.has(T)&&!deckAt(t.gx,t.gz,t.L))for(const x of[-.4,.4])partBox(g,.07,t.L*LH,.07,M_.dark,x,-t.L*LH/2+.1,0);
  g.position.set(t.gx+.5,(t.L||0)*LH,t.gz+.5);g.rotation.y=-t.dir*Math.PI/2;
  g.traverse(o=>{if(o.isMesh){o.castShadow=!o.material.transparent;o.receiveShadow=true}});
  linColors(g);if(t.anim)t.animY=t.anim.position.y;
  return g;
}
