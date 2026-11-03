// ================= 手上的工具和雙手：照真的大小重做，另外畫一層（先清掉深度），走到硬幣堆、牆邊也不會插進去 =================
const vmScene=new THREE.Scene(),vmRoot=new THREE.Group();vmRoot.matrixAutoUpdate=false;vmScene.add(vmRoot);vmRoot.add(vm);vmScene.environment=scene.environment;
const vmHemi=new THREE.HemisphereLight(0xffffff,0xffffff,1),vmSun=new THREE.DirectionalLight(0xffffff,1),vmHead=new THREE.PointLight(0xfff1d6,0,3,1.5);
vmScene.add(vmHemi,vmSun,vmSun.target);vmRoot.add(vmHead);vmHead.position.set(.12,.12,.05);
const grainTex=canvasTex(64,256,(g,w,h)=>{g.fillStyle='#b0814e';g.fillRect(0,0,w,h);for(let k=0;k<40;k++){g.fillStyle=`rgba(${70+Math.random()*40|0},${40+Math.random()*25|0},15,${.15+Math.random()*.3})`;g.fillRect(Math.random()*w,0,1+Math.random()*2,h)}noise(g,w,h,600,v=>`rgba(40,20,5,${v*.25})`)},true);
const fabricTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#8a8a8a';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2){g.fillStyle=`rgba(0,0,0,${.05+Math.random()*.08})`;g.fillRect(0,y,w,1)}for(let x=0;x<w;x+=3){g.fillStyle=`rgba(255,255,255,${.03+Math.random()*.05})`;g.fillRect(x,0,1,h)}},true);
const galvTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#aeb5bb';g.fillRect(0,0,w,h);for(let k=0;k<700;k++){const x=Math.random()*w,y=Math.random()*h,r=3+Math.random()*8,v=160+Math.random()*50|0;g.fillStyle=`rgba(${v},${v+3},${v+6},.35)`;g.beginPath();for(let a=0;a<6;a++){const t=a/6*6.283+Math.random()*.6,rr=r*(.5+Math.random()*.6);g.lineTo(x+Math.cos(t)*rr,y+Math.sin(t)*rr)}g.closePath();g.fill()}},true);
const bristleTex=canvasTex(128,32,(g,w,h)=>{g.fillStyle='#3a2a1c';g.fillRect(0,0,w,h);for(let x=0;x<w;x++){g.fillStyle=`rgba(${120+Math.random()*60|0},${90+Math.random()*40|0},${50+Math.random()*30|0},${.3+Math.random()*.5})`;g.fillRect(x,Math.random()*4,1,h)}},true);
const smat=o=>new THREE.MeshStandardMaterial(o);
const VM={skin:smat({color:0xc98f68,roughness:.55,emissive:0x3a1206,emissiveIntensity:.3}),nail:smat({color:0xf0cdbd,roughness:.28}),
  sleeve:smat({color:0x3b4f69,roughness:.95,map:fabricTex}),cuff:smat({color:0x27364b,roughness:.95,map:fabricTex}),
  wood:smat({map:grainTex,roughness:.62}),steel:smat({color:0xa4acb2,metalness:.88,roughness:.3}),steelDS:smat({color:0x9aa2a8,metalness:.85,roughness:.34,side:THREE.DoubleSide}),
  dark:smat({color:0x2b2d30,metalness:.55,roughness:.45}),galv:smat({map:galvTex,metalness:.8,roughness:.36}),
  red:smat({color:0xd23a2c,roughness:.42}),yellowDS:smat({color:0xf1c232,roughness:.45,side:THREE.DoubleSide}),
  rubber:smat({color:0x18181a,roughness:.88}),tray:smat({color:0xb3271d,metalness:.45,roughness:.42,side:THREE.DoubleSide}),
  hiVis:smat({color:0xe8a817,roughness:.45,metalness:.2}),orange:smat({color:0xe9741a,roughness:.42,metalness:.1}),
  glass:smat({color:0xd8ecff,transparent:true,opacity:.22,roughness:.05,metalness:.1,side:THREE.DoubleSide,depthWrite:false}),
  detScr:smat({color:0x0a140c,emissive:0x2bd36a,emissiveIntensity:.15,roughness:.3}),hsScr:smat({color:0x0a140c,emissive:0x2bd36a,emissiveIntensity:1,roughness:.3}),
  glow:smat({color:0x111111,emissive:0x44ff77,emissiveIntensity:1.4}),bristle:smat({map:bristleTex,roughness:.95}),
  heap:Object.assign(M_.heap.clone(),{roughness:.5,metalness:.6}),gold:smat({color:0xd9b45a,metalness:.85,roughness:.3}),silver:smat({color:0xcfd3d6,metalness:.85,roughness:.28}),
  hazard:smat({map:hazardTex,roughness:.5})};
const _V=(x,y,z)=>new THREE.Vector3(x,y,z);
// 硬幣堆的表面：中間高、邊緣低，貼圖平鋪（每枚硬幣看起來是真的大小）；sq 越大越接近方形
function domeGeo(sq){const k='dome'+sq;let g=_geo.get(k);if(g)return g;const NR=6,NS=32,pos=[0,1,0],uv=[.5,.5],idx=[];
  for(let i=1;i<=NR;i++){const p=i/NR;for(let j=0;j<NS;j++){const a=j/NS*Math.PI*2,c=Math.cos(a),s=Math.sin(a),m=sq?1/Math.pow(Math.pow(Math.abs(c),sq)+Math.pow(Math.abs(s),sq),1/sq):1,x=c*m*p,z=s*m*p;pos.push(x,1-p*p,z);uv.push(x*.5+.5,z*.5+.5)}}
  for(let j=0;j<NS;j++)idx.push(0,1+(j+1)%NS,1+j);
  for(let i=1;i<NR;i++)for(let j=0;j<NS;j++){const a=1+(i-1)*NS+j,b=1+(i-1)*NS+(j+1)%NS,c=a+NS,d=b+NS;idx.push(a,b,c,b,d,c)}
  g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();share(g);_geo.set(k,g);return g}
// 鏟面：從握把那端（v=0）往 -z 長 len，寬度 wf(v)，兩邊往上翹 curv，靠握把那端翹起 lip
function scoopGeo(key,len,wf,curv,lip,wmax){const k='sc'+key;let g=_geo.get(k);if(g)return g;const NU=12,NV=16,pos=[],uv=[],idx=[];
  for(let j=0;j<=NV;j++){const v=j/NV,w=wf(v);for(let i=0;i<=NU;i++){const u=i/NU,x=(u-.5)*w,e=2*x/wmax;pos.push(x,curv*e*e+lip*Math.pow(Math.max(0,1-v/.2),2),-v*len);uv.push(u,v)}}
  for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){const a=j*(NU+1)+i,b=a+1,c=a+NU+1,d=c+1;idx.push(a,b,c,b,d,c)}
  g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();share(g);_geo.set(k,g);return g}
// 兩點之間的圓棍
function rod(p,a,b,r,m,seg){const A=_V(...a),B=_V(...b),d=B.clone().sub(A),L=d.length(),o=mk(p,cylGeo(r,r,L,seg||12),m);o.position.copy(A).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(_V(0,1,0),d.normalize());return o}

// ---------- 手：手掌、四根三節的手指、大拇指、手腕、前臂、工作外套的袖子（右手；左手用鏡像） ----------
// 手的座標：手掌朝 -y、手指朝 -z、大拇指在 -x、手腕往 +z
const FING=[[-.0285,-.043,[.040,.025,.021],.0087,-.07],[-.0095,-.046,[.045,.028,.022],.0091,-.015],[.0095,-.044,[.042,.026,.021],.0086,.03],[.0275,-.038,[.033,.021,.019],.0076,.085]];
function fingerMesh(g,pts,r,nailN){const c=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.45);
  mk(g,new THREE.TubeGeometry(c,18,r,9,false),VM.skin);
  const tip=pts[pts.length-1],d=c.getTangent(1).normalize();
  mk(g,sphGeo(r,10,8),VM.skin,tip.x,tip.y,tip.z);mk(g,sphGeo(r*1.12,10,8),VM.skin,pts[0].x,pts[0].y,pts[0].z);
  if(nailN){const n=nailN.clone().addScaledVector(d,-nailN.dot(d)).normalize(),x=new THREE.Vector3().crossVectors(n,d).normalize(),m=mk(g,sphGeo(1,10,6),VM.nail);
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,n,d));m.scale.set(r*.78,r*.3,r*.95);m.position.copy(tip).addScaledVector(d,-r*.62).addScaledVector(n,r*.72)}}
// 一節一節往掌心彎
function fChain(base,dir,up,lens,ang){const pts=[base.clone()],d=dir.clone().normalize(),u=up.clone().normalize(),q=new THREE.Quaternion();let p=base.clone();
  for(let i=0;i<lens.length;i++){const ax=new THREE.Vector3().crossVectors(d,u).normalize();q.setFromAxisAngle(ax,-ang[i]);d.applyQuaternion(q);u.applyQuaternion(q);p=p.clone().addScaledVector(d,lens[i]);pts.push(p)}
  return{pts,up:u}}
const GRIP_C=rh=>[-.013-rh-.003,-.024]; // 握把中心在手的座標裡的 y、z
function palmGeo(){let g=_geo.get('palm');if(g)return g;const s=new THREE.Shape();s.moveTo(-.034,.036);
  s.splineThru([new THREE.Vector2(-.016,.041),new THREE.Vector2(.002,.042),new THREE.Vector2(.02,.04),new THREE.Vector2(.032,.032),new THREE.Vector2(.034,.0),new THREE.Vector2(.028,-.032),new THREE.Vector2(.018,-.041),new THREE.Vector2(-.018,-.041),new THREE.Vector2(-.029,-.032),new THREE.Vector2(-.036,-.004),new THREE.Vector2(-.034,.036)]);
  g=new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:true,bevelThickness:.007,bevelSize:.006,bevelSegments:3,curveSegments:24});g.rotateX(-Math.PI/2);g.translate(0,-.006,0);g.computeVertexNormals();share(g);_geo.set('palm',g);return g}
const _hands=new Map();
function handGeo(pose,rh){const key=pose+'|'+(rh||0);let h=_hands.get(key);if(h)return h;const g=new THREE.Group();
  mk(g,palmGeo(),VM.skin,0,0,-.002);for(const[x,kz,L,r]of FING)mk(g,sphGeo(r*1.05,10,8),VM.skin,x,.005,kz+.004).scale.set(1,.8,1);
  mk(g,sphGeo(.021,14,10),VM.skin,-.026,-.006,.014).scale.set(1.05,.62,1.35);
  mk(g,sphGeo(.016,12,8),VM.skin,.029,-.005,.012).scale.set(1,.6,1.7);
  mk(g,cylGeo(.025,.025,.06,14),VM.skin,0,-.001,.07,Math.PI/2).scale.set(1.32,1,.78);
  mk(g,cylGeo(.036,.029,.25,16),VM.skin,0,-.002,.215,Math.PI/2).scale.set(1.22,1,.9);
  mk(g,cylGeo(.056,.052,.32,18),VM.sleeve,0,-.002,.33,Math.PI/2).scale.set(1.12,1,.98);
  mk(g,cylGeo(.055,.055,.036,18),VM.cuff,0,-.002,.172,Math.PI/2).scale.set(1.12,1,.98);
  for(const[x,kz,L,r,spread]of FING){let pts,nn;
    if(pose==='grip'){const R=rh+r,[cy,cz]=GRIP_C(rh),ky=-.003,ph0=Math.atan2(-(kz-cz),ky-cy);pts=[_V(x,ky,kz)];
      const a=ph0+.4,f=_V(x,cy+Math.cos(a)*R,cz-Math.sin(a)*R);pts.push(f);const span=(L[0]+L[1]+L[2]-f.distanceTo(pts[0]))/R;
      for(let i=1;i<=5;i++){const b=a+span*i/5;pts.push(_V(x,cy+Math.cos(b)*R,cz-Math.sin(b)*R))}
      const t=pts[pts.length-1];nn=_V(0,t.y-cy,t.z-cz)}
    else{const ang=pose==='cup'?[.32,.5,.36]:[.4,.7,.45],c=fChain(_V(x,-.002,kz),_V(spread*(pose==='cup'?.4:1),0,-1),_V(0,1,0),L,ang);pts=c.pts;nn=c.up}
    fingerMesh(g,pts,r,nn)}
  if(pose==='grip'){const[cy,cz]=GRIP_C(rh),o=rh+.0087*2+.011;
    fingerMesh(g,[_V(-.033,-.006,.012),_V(-.046,-.024,-.004),_V(-.042,cy-o*.45,cz-o*.62),_V(-.022,cy-o*.72,cz-o*.66),_V(-.006,cy-o*.86,cz-o*.42)],.0102,_V(-.3,-.8,-.4))}
  else{const c=fChain(_V(-.034,-.004,.01),pose==='cup'?_V(-.3,.12,-.95):_V(-.55,-.15,-.8),_V(-.4,.9,0),[.03,.03,.026],pose==='cup'?[.04,.12,.18]:[.2,.35,.3]);fingerMesh(g,c.pts,.0102,c.up)}
  h=mergeStatic(g);h.traverse(o=>{if(o.isMesh)share(o.geometry)});_hands.set(key,h);return h}
function addHand(par,side,pose,rh){const w=new THREE.Group(),inner=new THREE.Group();for(const c of handGeo(pose,rh).children)inner.add(new THREE.Mesh(c.geometry,c.material));inner.scale.x=side;w.add(inner);par.add(w);return w}
const _X=new THREE.Vector3(),_Y=new THREE.Vector3(),_Z=new THREE.Vector3(),_M4=new THREE.Matrix4(),_Q=new THREE.Quaternion();
// 握住握把：P 是握把上拳頭的中心、thumb 是大拇指那頭沿著握把的方向（工具的座標），wrist 是手腕往哪邊（畫面的座標）
function gripOn(h,side,rh,P,thumb,wrist){const w=addHand(h,side,'grip',rh);_Q.copy(h.quaternion).invert();
  _X.set(...thumb).normalize().multiplyScalar(side>0?-1:1);_Z.set(...wrist).applyQuaternion(_Q);_Z.addScaledVector(_X,-_Z.dot(_X)).normalize();_Y.crossVectors(_Z,_X);
  _M4.makeBasis(_X,_Y,_Z);w.quaternion.setFromRotationMatrix(_M4);const[cy,cz]=GRIP_C(rh);
  w.position.set(...P).addScaledVector(_Y,-cy).addScaledVector(_Z,-cz);return w}
function holdHand(par,side,pose,pos,rot){const w=addHand(par,side,pose);w.position.set(...pos);w.rotation.set(...rot);return w}

// ---------- 每一種工具：rig（整組會動）→ holder（工具和手擺在畫面哪裡）→ 工具本體、手 ----------
const VMT={},FILLS={};
function vmRig(id,model,pos,rot,piv,act){const r=new THREE.Group(),h=new THREE.Group();h.position.set(...pos);
  if(rot.dir)h.quaternion.setFromUnitVectors(_V(0,0,-1),_V(...rot.dir).normalize());else h.rotation.set(...rot);
  h.add(model);r.add(h);r.visible=false;vm.add(r);toolModels[id]=model;VMT[id]={rig:r,holder:h,piv:_V(...piv),act:act||{}};return h}
const fillOf=m=>m.getObjectByName('fill');
function heapOn(p,x,y,z,sx,sy,sz){const f=new THREE.Group();f.name='fill';f.position.set(x,y,z);p.add(f);mk(f,domeGeo(0),VM.heap).scale.set(sx,sy,sz);
  for(let i=0;i<7;i++){const a=i*2.4,rr=.25+.5*((i*.37)%1),c=mk(f,cylGeo(.4,.4,.06,16),i%3?VM.silver:VM.gold,Math.cos(a)*rr*sx,sy*(1-rr*rr)+.003,Math.sin(a)*rr*sz,.5*Math.sin(i*1.7),0,.5*Math.cos(i*2.3));c.scale.setScalar(Math.min(sx,sz)*.42)}
  f.visible=false;return f}
function buildToolModels(){
  const P2=Math.PI/2;
  // 雙手：兩隻手掌往上合起來捧硬幣
  {const m=new THREE.Group();heapOn(m,0,.01,-.035,.05,.022,.045);
    const h=vmRig('hand',m,[0,-.2,-.33],[.62,0,0],[0,-.2,-.33],{dig:[0,-.07,-.1,-.4,0,0],thr:[0,.04,-.1,.32,0,0]});
    holdHand(h,1,'cup',[.046,-.008,0],[0,-.14,Math.PI+.38]);holdHand(h,-1,'cup',[-.046,-.008,0],[0,.14,Math.PI-.38]);
    FILLS.hand=(m,k,n)=>{const f=fillOf(m);f.visible=n>0;f.scale.setScalar(Math.min(1,.32+.13*Math.cbrt(n||0)))}}
  // 玩具鏟：紅色塑膠握柄、黃色的小鏟子
  {const m=new THREE.Group();
    mk(m,cylGeo(.0105,.0105,.27,14),VM.red,0,0,-.135,P2);mk(m,sphGeo(.017,14,10),VM.red,0,0,.004).scale.set(1,1,.8);mk(m,cylGeo(.016,.012,.05,14),VM.red,0,0,-.27,P2);
    const s=new THREE.Group();s.position.set(0,-.006,-.285);s.rotation.x=.35;m.add(s);
    mk(s,scoopGeo('toy',.15,v=>.115*Math.pow(1-Math.pow(Math.max(0,(v-.45)/.55),4),.3),.032,.03,.115),VM.yellowDS);
    heapOn(s,0,.004,-.07,.045,.02,.055);
    const h=vmRig('toy',m,[.16,-.17,-.26],{dir:[-.42,-.22,-.88]},[.16,-.17,-.26],{dig:[0,-.05,-.1,-.3,0,0],thr:[0,.04,-.06,.35,0,0]});
    gripOn(h,1,.0105,[0,0,-.06],[0,0,-1],[.45,-.8,.35]);
    FILLS.toy=(m,k)=>{const f=fillOf(m);f.visible=k>0;f.scale.setScalar(.4+.6*Math.cbrt(k))}}
  // 水桶：鍍鋅鐵桶（有厚度、捲邊、兩圈壓紋），提把上有木頭握把
  {const m=new THREE.Group(),rb=.115,rt=.148,H_=.3,t=.0035,ry=y=>rb+(rt-rb)*y/H_;
    mk(m,latheGeo('bucket2',[[0,0],[rb-.008,0],[rb,.007],[rt,H_-.004],[rt,H_],[rt-t,H_],[rb-t,t+.006],[rb-.008-t,t],[0,t]],40),VM.galv);
    mk(m,torGeo(rt+.002,.0055,0,40),VM.galv,0,H_,0,P2);for(const y of[.085,.2])mk(m,torGeo(ry(y)+.001,.0028,0,40),VM.galv,0,y,0,P2);
    for(const sx of[-1,1]){mk(m,rboxGeo(.03,.045,.006,.002),VM.steel,sx*(rt-.001),H_-.032,0,0,P2,sx*.1);mk(m,sphGeo(.005,8,6),VM.dark,sx*(rt+.004),H_-.035,0)}
    const b=new THREE.Group();b.name='bail';b.position.y=H_-.035;b.rotation.x=.75;m.add(b);
    mk(b,torGeo(rt+.007,.0032,Math.PI,28),VM.steel);mk(b,cylGeo(.0125,.0125,.1,14),VM.wood,0,rt+.007,0,0,0,P2);
    const f=new THREE.Group();f.name='fill';m.add(f);mk(f,domeGeo(0),VM.heap);f.visible=false;
    const h=vmRig('bucket',m,[.1,-.5,-.72],[.5,Math.PI/2,0],[.2,-.17,-.54],{dig:[0,-.08,-.1,-.25,0,0],pour:[0,.05,-.05,-1.1,0,.25]});
    gripOn(h,1,.0125,[0,H_-.035+Math.cos(.75)*(rt+.007),Math.sin(.75)*(rt+.007)],[1,0,0],[.4,-.85,.35]);
    FILLS.bucket=(m,k)=>{const f=fillOf(m);f.visible=k>0;const y=t+.003+k*(H_-.035),r=ry(y)-t-.001;f.position.y=y-.02*r/.14;f.scale.set(r,.04*Math.min(1,k*6)+.004,r)}}
  // 圓鍬、草叉、掃把共用的長木柄
  const shaft=(m,L,r)=>{mk(m,cylGeo(r,r,L,14),VM.wood,0,0,-L/2,P2);mk(m,cylGeo(r+.003,r+.003,.03,14),VM.rubber,0,0,.0,P2);mk(m,sphGeo(r+.003,12,8),VM.rubber,0,0,.015).scale.set(1,1,.6)};
  const longHands=(h,rh)=>{gripOn(h,1,rh,[0,0,-.06],[0,0,-1],[.6,-.7,.35]);gripOn(h,-1,rh,[0,0,-.5],[0,0,-1],[-.75,-.6,.15])};
  // 圓鍬：尖頭鐵鏟面、鐵套筒、踩腳的折邊
  {const m=new THREE.Group();shaft(m,.98,.0165);
    mk(m,cylGeo(.019,.026,.17,14),VM.dark,0,-.002,-1.0,P2);
    const s=new THREE.Group();s.position.set(0,-.012,-1.06);s.rotation.x=.42;m.add(s);
    mk(s,scoopGeo('spade',.3,v=>.235*(v<.55?1:Math.sqrt(Math.max(0,1-Math.pow((v-.55)/.45,2)))),.026,.012,.235),VM.steelDS);
    mk(s,rboxGeo(.235,.012,.022,.004),VM.steel,0,.015,-.004);
    heapOn(s,0,.008,-.12,.08,.035,.09);
    const h=vmRig('spade',m,[.22,-.21,-.12],{dir:[-.24,-.28,-.93]},[.22,-.21,-.12],{dig:[0,-.04,-.12,-.18,0,0],thr:[0,.05,-.05,.3,0,0]});
    longHands(h,.0165);
    FILLS.spade=(m,k)=>{const f=fillOf(m);f.visible=k>0;f.scale.setScalar(.35+.65*Math.cbrt(k))}}
  // 草叉：四根彎彎的叉齒
  {const m=new THREE.Group();shaft(m,.95,.016);
    mk(m,cylGeo(.018,.024,.14,14),VM.dark,0,0,-.98,P2);
    const s=new THREE.Group();s.position.set(0,-.004,-1.05);s.rotation.x=.24;m.add(s);
    tube(s,[[-.085,.004,-.03],[-.05,-.004,.0],[0,-.006,.012],[.05,-.004,0],[.085,.004,-.03]],.0075,VM.dark);
    for(const x of[-.085,-.03,.03,.085]){tube(s,[[x,.004,-.03],[x*.98,-.002,-.12],[x*.96,.002,-.22],[x*.95,.012,-.3]],.0055,VM.steel);const c=mk(s,cylGeo(.0005,.0055,.03,8),VM.steel,x*.95,.016,-.322);c.rotation.x=-1.4}
    heapOn(s,0,.004,-.16,.09,.03,.1);
    const h=vmRig('fork',m,[.22,-.21,-.12],{dir:[-.24,-.28,-.93]},[.22,-.21,-.12],{dig:[0,-.04,-.12,-.18,0,0],thr:[0,.05,-.05,.3,0,0]});
    longHands(h,.016);
    FILLS.fork=(m,k)=>{const f=fillOf(m);f.visible=k>0;f.scale.setScalar(.35+.65*Math.cbrt(k))}}
  // 手推車：紅色鐵斗、兩根把手、前面一個輪子、後面兩隻腳
  {const m=new THREE.Group(),T=[[-.34,-.52],[.34,-.52],[.32,.3],[-.32,.3]],B=[[-.2,-.22],[.2,-.22],[.2,.22],[-.2,.22]],yT=.66,yB=.38;
    const pos=[],tri=(a,b,c)=>pos.push(...a,...b,...c),q=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d)},TT=T.map(([x,z])=>[x,yT,z]),BB=B.map(([x,z])=>[x,yB,z]);
    q(BB[0],BB[1],BB[2],BB[3]);for(let i=0;i<4;i++){const j=(i+1)%4;q(BB[i],TT[i],TT[j],BB[j])}
    const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.computeVertexNormals();
    const uvs=[];for(let i=0;i<pos.length;i+=3)uvs.push(pos[i],pos[i+2]);tg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));mk(m,tg,VM.tray);
    for(let i=0;i<4;i++){const j=(i+1)%4;rod(m,TT[i],TT[j],.011,VM.tray);mk(m,sphGeo(.011,8,6),VM.tray,...TT[i])}
    for(const sx of[-1,1]){tube(m,[[sx*.27,.6,1.0],[sx*.255,.52,.6],[sx*.22,.36,.1],[sx*.15,.28,-.4],[sx*.06,.2,-.78]],.016,VM.dark);
      rod(m,[sx*.272,.615,1.02],[sx*.262,.57,.82],.021,VM.rubber,14);rod(m,[sx*.22,.36,.18],[sx*.23,0,.26],.013,VM.dark);mk(m,rboxGeo(.05,.015,.07,.005),VM.rubber,sx*.23,.008,.27);
      rod(m,[sx*.2,.35,.0],[sx*.2,yB,.0],.01,VM.dark);rod(m,[sx*.17,.31,-.3],[sx*.18,yB+.02,-.2],.01,VM.dark)}
    const w=new THREE.Group();w.position.set(0,.205,-.8);m.add(w);mk(w,torGeo(.16,.045,0,32),VM.rubber,0,0,0,0,P2);mk(w,cylGeo(.125,.125,.05,24),VM.steel,0,0,0,0,0,P2);mk(w,cylGeo(.03,.03,.13,12),VM.dark,0,0,0,0,0,P2);
    const f=new THREE.Group();f.name='fill';m.add(f);mk(f,domeGeo(5),VM.heap);f.visible=false;
    // 畫面裡的手推車縮小、把手縮短，斗口朝玩家斜一點，才看得到斗裡的硬幣；倒的時候把手抬起來，手就會出現
    const S=.78;m.scale.set(S,S,S*.55);const h=vmRig('cart',m,[0,-.984,-1.136],[.2,0,0],[0,-.76,-1.44],{dig:[0,-.03,-.05,-.04,0,0],pour:[0,.02,.05,-.42,0,0]});
    for(const sx of[-1,1])gripOn(h,sx,.021*S,[sx*.267*S,.592*S,.92*S*.55],[0,0,-1],[sx*.25,-1,.3]);
    FILLS.cart=(m,k)=>{const f=fillOf(m);f.visible=k>0;const y=yB+.005+k*(yT-yB-.03),u=(y-yB)/(yT-yB),hx=.2+.13*u-.012,z0=-.22-.3*u,z1=.22+.08*u;f.position.set(0,y,(z0+z1)/2);f.scale.set(hx,.025+.05*Math.min(1,k*3),(z1-z0)/2-.012)}}
  // 掃把：推掃把（長木柄、木頭刷座、一排刷毛）
  {const m=new THREE.Group();shaft(m,1.3,.014);
    const s=new THREE.Group();s.position.set(0,0,-1.3);s.rotation.x=.33;m.add(s);
    mk(s,rboxGeo(.46,.045,.07,.01),VM.wood,0,-.02,0);mk(s,rboxGeo(.44,.09,.058,.004),VM.bristle,0,-.085,0);mk(s,cylGeo(.022,.02,.05,12),VM.dark,0,.015,0);
    const h=vmRig('broom',m,[.22,-.2,-.12],{dir:[-.2,-.32,-.93]},[.22,-.2,-.12],{sw:[0,-.03,-.28,-.06,0,0]});
    longHands(h,.014)}
  // 金屬探測器：手臂托架、握把、黃色控制盒（綠色螢幕）、伸縮桿、黑色線圈
  {const m=new THREE.Group();
    mk(m,new THREE.CylinderGeometry(.044,.044,.11,18,1,true,-P2,Math.PI),VM.dark,0,.0,.075,P2).material=VM.rubber;
    mk(m,torGeo(.046,.006,Math.PI,18),VM.dark,0,0,.1);
    tube(m,[[0,-.047,.13],[0,-.05,.02],[0,-.056,-.14],[0,-.09,-.3]],.012,VM.hiVis);
    mk(m,cylGeo(.016,.019,.12,14),VM.rubber,0,-.11,-.05,-.28);
    const bx_=new THREE.Group();bx_.position.set(0,-.025,-.2);bx_.rotation.x=-.18;m.add(bx_);
    mk(bx_,rboxGeo(.085,.048,.15,.012),VM.hiVis);const scr=mk(bx_,planeGeo(.06,.04),VM.detScr,0,.0255,.012,-P2);scr.name='scr';
    for(let i=0;i<3;i++)mk(bx_,cylGeo(.006,.006,.006,10),i?VM.dark:VM.red,-.022+i*.022,.026,-.04);
    mk(bx_,planeGeo(.07,.016),labelMat('COIN DETECTOR',512,'#1b1b1b','#f0c030'),0,.0255,-.058,-P2);
    rod(m,[0,-.09,-.3],[0,-.5,-.97],.009,VM.steel);mk(m,cylGeo(.014,.014,.04,12),VM.dark,0,-.13,-.37,-.55);
    const pts=[];for(let i=0;i<=26;i++){const f=i/26,a=f*Math.PI*9;pts.push([Math.cos(a)*.015,-.1-.39*f+Math.sin(a)*.01,-.32-.63*f])}tube(m,pts,.0028,VM.rubber);
    const c=new THREE.Group();c.position.set(0,-.56,-1.03);c.rotation.x=.12;m.add(c);
    mk(c,torGeo(.12,.013,0,36),VM.rubber,0,0,0,P2).scale.set(1.3,1,1);mk(c,torGeo(.085,.006,0,30),VM.hiVis,0,.004,0,P2).scale.set(1.3,1,1);
    mk(c,rboxGeo(.3,.006,.05,.002),VM.rubber,0,.002,0);mk(c,rboxGeo(.04,.006,.22,.002),VM.rubber,0,.002,0);mk(c,cylGeo(.025,.025,.03,14),VM.dark,0,.02,0);rod(c,[0,.02,0],[0,.08,.06],.009,VM.dark);
    const h=vmRig('det',m,[.17,-.13,-.24],[.14,.17,0],[.17,-.13,-.24]);
    gripOn(h,1,.017,[0,-.11,-.05],[0,1,-.3],[.25,-.45,1])}
  // 院子吸塵器：手持式，橘色馬達在後面、透明集塵桶在上面（看得到裝了多少硬幣）、吸管往前下方伸出去
  {const m=new THREE.Group();
    mk(m,rboxGeo(.13,.12,.3,.03),VM.orange,0,0,0);mk(m,cylGeo(.055,.055,.04,20),VM.dark,0,0,.16,P2);for(let i=0;i<4;i++)mk(m,boxGeo(.09,.005,.01),VM.dark,0,-.03+i*.02,.181);
    tube(m,[[0,.05,.14],[0,.12,.13],[0,.135,.07],[0,.12,.03],[0,.06,.02]],.014,VM.dark);mk(m,boxGeo(.014,.03,.02),VM.red,0,.09,.06);
    mk(m,cylGeo(.064,.064,.15,28,true),VM.glass,0,.135,-.07);mk(m,cylGeo(.064,.064,.004,28),VM.glass,0,.208,-.07);mk(m,torGeo(.066,.007,0,28),VM.dark,0,.21,-.07,P2);mk(m,cylGeo(.068,.068,.012,28),VM.dark,0,.062,-.07);
    const d=_V(0,-.42,-.91).normalize(),e=[0,-.02+d.y*.6,-.15+d.z*.6];rod(m,[0,-.02,-.15],e,.036,VM.dark,18);
    mk(m,cylGeo(.05,.04,.06,20),VM.orange,e[0],e[1],e[2]).quaternion.setFromUnitVectors(_V(0,1,0),d);
    const f=new THREE.Group();f.name='fill';m.add(f);f.position.set(0,.068,-.07);mk(f,cylGeo(.06,.06,1,24),VM.heap,0,.5,0);f.visible=false;
    const h=vmRig('vac',m,[.16,-.27,-.58],[.3,.18,0],[.16,-.27,-.58]);
    gripOn(h,1,.014,[0,.132,.075],[0,0,-1],[.45,-.85,.3]);
    FILLS.vac=(m,k)=>{const f=fillOf(m);f.visible=k>0;f.scale.y=Math.max(.01,k*.14)}}
  // 手持硬幣掃描器：黃黑色機身、手槍握把、前面的掃描頭、上面的綠色螢幕
  {const m=new THREE.Group();
    mk(m,rboxGeo(.085,.075,.25,.018),VM.hiVis,0,.055,-.08);mk(m,rboxGeo(.088,.078,.04,.01),VM.hazard,0,.055,.025);
    mk(m,cylGeo(.058,.052,.05,24),VM.dark,0,.04,-.225,P2);mk(m,torGeo(.046,.004,0,28),VM.glow,0,.04,-.251);mk(m,cylGeo(.04,.04,.004,20),smat({color:0x101418,metalness:.9,roughness:.1}),0,.04,-.25,P2);
    const scr=mk(m,planeGeo(.065,.045),VM.hsScr,0,.0935,-.05,-P2+.12);scr.name='scr';
    mk(m,planeGeo(.07,.016),labelMat('COIN SCANNER',512,'#e2a51c','#111'),.0431,.06,-.1,0,P2,0);
    mk(m,rboxGeo(.034,.12,.045,.012),VM.rubber,0,-.025,.01,.28);mk(m,rboxGeo(.012,.03,.02,.004),VM.dark,0,.0,-.03);
    const h=vmRig('hscan',m,[.17,-.21,-.42],[.1,.1,0],[.17,-.21,-.42],{thr:[0,.04,-.06,.2,0,0]});
    gripOn(h,1,.019,[0,-.03,.01],[0,1,-.28],[.2,-.45,1])}
  linColors(vmScene)}
buildToolModels();

// ---------- 動作：走路晃、轉頭時慢半拍、挖、丟、倒、掃、換工具 ----------
let detSig=0;
const VA={dig:0,thr:0,pour:0,pk:0,sw:0,chg:0,cur:'',yaw:0,pit:0,sx:0,sy:0,t:0,mv:0,lb:0,shade:1,shT:0,shTarget:1};
const VDUR={dig:.32,thr:.28,sw:.45,chg:.3};
function vmKick(k){VA[k]=1}
const _vq=new THREE.Quaternion(),_ve=new THREE.Euler(),_vp=new THREE.Vector3(),_rc=new THREE.Raycaster(),_sd=new THREE.Vector3();
function updateVM(dt){
  if(!G)return;VA.t+=dt;const id=G.tool,T=VMT[id];
  for(const k in VMT)VMT[k].rig.visible=k===id&&!G.build;
  if(id!==VA.cur){VA.cur=id;VA.chg=1}
  for(const k in VDUR)VA[k]=Math.max(0,VA[k]-dt/VDUR[k]);
  VA.pk+=((VA.pour>0?1:0)-VA.pk)*Math.min(1,dt*7);VA.pour=Math.max(0,VA.pour-dt/.25);
  let dy=pl.yaw-VA.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const dp=pl.pitch-VA.pit;VA.yaw=pl.yaw;VA.pit=pl.pitch;
  const k=Math.min(1,dt*9);VA.sx+=(Math.max(-.05,Math.min(.05,dy))-VA.sx)*k;VA.sy+=(Math.max(-.05,Math.min(.05,dp))-VA.sy)*k;
  const mv=pl.bob!==VA.lb?(SET.calm?.25:1):0;VA.lb=pl.bob;VA.mv+=(mv-VA.mv)*Math.min(1,dt*6);
  vm.rotation.set(-VA.sy*1.4,-VA.sx*1.6,VA.sx*.6);
  vm.position.set(Math.sin(pl.bob*.5)*.011*VA.mv,-Math.abs(Math.cos(pl.bob*.5))*.009*VA.mv+Math.sin(VA.t*1.7)*.0022,0);
  if(!T)return;
  const S=x=>x>0?Math.sin((1-x)*Math.PI):0,a=T.act,w={dig:S(VA.dig),thr:S(VA.thr),sw:S(VA.sw),pour:VA.pk};
  let px=0,py=-VA.chg*.25,pz=0,rx=VA.chg*.35,ry=0,rz=0;
  for(const n in w){const v=a[n];if(!v||!w[n])continue;px+=v[0]*w[n];py+=v[1]*w[n];pz+=v[2]*w[n];rx+=v[3]*w[n];ry+=v[4]*w[n];rz+=v[5]*w[n]}
  if(id==='det'&&G.detOn)ry+=Math.sin(VA.t*2.1)*.13;
  if(id==='vac'&&lmb&&!panel){px+=(Math.random()-.5)*.003;py+=(Math.random()-.5)*.003}
  _vq.setFromEuler(_ve.set(rx,ry,rz));T.rig.quaternion.copy(_vq);_vp.copy(T.piv).applyQuaternion(_vq);T.rig.position.set(T.piv.x-_vp.x+px,T.piv.y-_vp.y+py,T.piv.z-_vp.z+pz);
  // 螢幕：探測器有訊號就亮、越近越亮
  if(id==='det')VM.detScr.emissiveIntensity=G.detOn?.5+1.4*Math.max(0,detSig)*(beepT>.05?.7:1):.05;
  // 有屋頂擋住太陽（或在一開始的小房間裡），手上的東西也要暗一點
  VA.shT-=dt;if(VA.shT<=0){VA.shT=.25;let s=1;if(Math.abs(pl.x)<1.8&&pl.z>H+.3)s=.12;
    else if(structRoot.children.length){_sd.copy(sun.position).sub(sun.target.position).normalize();_rc.set(camera.position,_sd);_rc.far=60;if(_rc.intersectObject(structRoot,true).length)s=.15}VA.shTarget=s}
  VA.shade+=(VA.shTarget-VA.shade)*Math.min(1,dt*4)}
// 極高畫質（電腦）：環境光遮蔽。先只畫一次深度，算出哪裡被周圍擋住，
// 模糊之後乘到畫面上，硬幣之間、機器腳邊和牆角會有自然的暗影
let aoRT=null,aoRT2,aoRT3,aoScene,aoCam,aoQuad,aoMat,aoBlur,aoMul,aoDepthM;
function aoInit(){const w=1,h=1,vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  aoRT=new THREE.WebGLRenderTarget(w,h,{depthBuffer:true});aoRT.depthTexture=new THREE.DepthTexture(w,h);aoRT.depthTexture.type=THREE.UnsignedIntType;
  aoRT2=new THREE.WebGLRenderTarget(w,h);aoRT3=new THREE.WebGLRenderTarget(w,h);aoDepthM=new THREE.MeshBasicMaterial({colorWrite:false});
  aoScene=new THREE.Scene();aoCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);aoQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));aoQuad.frustumCulled=false;aoScene.add(aoQuad);
  aoMat=new THREE.ShaderMaterial({uniforms:{tD:{value:aoRT.depthTexture},pInv:{value:new THREE.Matrix4()},proj:{value:new THREE.Matrix4()},res:{value:new THREE.Vector2(w,h)}},vertexShader:vs,depthTest:false,depthWrite:false,
    fragmentShader:`uniform sampler2D tD;uniform mat4 pInv,proj;uniform vec2 res;varying vec2 vUv;
      vec3 vp(vec2 uv){float d=texture2D(tD,uv).x;vec4 p=pInv*vec4(uv*2.-1.,d*2.-1.,1.);return p.xyz/p.w;}
      float rnd(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
      void main(){if(texture2D(tD,vUv).x>=.99999){gl_FragColor=vec4(1.);return;}vec3 P=vp(vUv);
        vec3 N=normalize(cross(vp(vUv+vec2(1./res.x,0.))-P,vp(vUv+vec2(0.,1./res.y))-P));
        float R=.4,sr=min(.06,R*proj[1][1]*.5/(-P.z)),a0=rnd(vUv*res)*6.2832,occ=0.;
        for(int i=0;i<12;i++){float t=(float(i)+.5)/12.;float a=a0+t*31.4;vec2 o=vec2(cos(a),sin(a))*sr*t;o.x*=res.y/res.x;
          vec3 v=vp(vUv+o)-P;float vv=dot(v,v);occ+=max(0.,dot(v,N)-.01*(-P.z))/(vv+.02)*max(0.,1.-vv/(R*R*4.));}
        float ao=clamp(1.-occ*.075,0.,1.);gl_FragColor=vec4(vec3(mix(ao,1.,smoothstep(25.,70.,-P.z))),1.);}`});
  aoBlur=new THREE.ShaderMaterial({uniforms:{t:{value:null},res:{value:new THREE.Vector2(w,h)}},vertexShader:vs,depthTest:false,depthWrite:false,
    fragmentShader:'uniform sampler2D t;uniform vec2 res;varying vec2 vUv;void main(){float s=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)s+=texture2D(t,vUv+vec2(x,y)/res).r;gl_FragColor=vec4(vec3(s/9.),1.);}'});
  // 乘到畫面上：畫面顏色 × 遮蔽量
  aoMul=new THREE.ShaderMaterial({uniforms:{t:{value:null}},vertexShader:vs,depthTest:false,depthWrite:false,transparent:true,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.ZeroFactor,blendDst:THREE.SrcColorFactor,
    fragmentShader:'uniform sampler2D t;varying vec2 vUv;void main(){gl_FragColor=vec4(vec3(mix(1.,texture2D(t,vUv).r,.7)),1.);}'})}
function renderAO(){if(!aoRT)aoInit();const sz=renderer.getDrawingBufferSize(_aoV),w=Math.max(1,sz.x),h=Math.max(1,sz.y);
  if(aoRT.width!==w||aoRT.height!==h){aoRT.setSize(w,h);aoRT2.setSize(w,h);aoRT3.setSize(w,h);aoMat.uniforms.res.value.set(w,h);aoBlur.uniforms.res.value.set(w,h)}
  const bg=scene.background;scene.background=null;scene.overrideMaterial=aoDepthM;renderer.setRenderTarget(aoRT);renderer.clear();renderer.render(scene,camera);scene.overrideMaterial=null;scene.background=bg;
  aoMat.uniforms.proj.value.copy(camera.projectionMatrix);aoMat.uniforms.pInv.value.copy(camera.projectionMatrixInverse);
  aoQuad.material=aoMat;renderer.setRenderTarget(aoRT2);renderer.render(aoScene,aoCam);
  aoQuad.material=aoBlur;aoBlur.uniforms.t.value=aoRT2.texture;renderer.setRenderTarget(aoRT3);renderer.render(aoScene,aoCam);
  aoQuad.material=aoMul;aoMul.uniforms.t.value=aoRT3.texture;renderer.setRenderTarget(null);renderer.autoClear=false;renderer.render(aoScene,aoCam);renderer.autoClear=true}
const _aoV=new THREE.Vector2();
function renderVM(){
  if(!G||mode!=='play'||topV||G.build)return;
  vmRoot.matrix.copy(camera.matrixWorld);vmRoot.matrixWorldNeedsUpdate=true;
  vmSun.position.copy(sun.position);vmSun.target.position.copy(sun.target.position);vmSun.color.copy(sun.color);vmSun.intensity=sun.intensity*VA.shade;
  vmHemi.color.copy(hemi.color);vmHemi.groundColor.copy(hemi.groundColor);vmHemi.intensity=hemi.intensity*(.55+.45*VA.shade);vmHead.intensity=headlamp.intensity?1.1:0;
  renderer.autoClear=false;renderer.clearDepth();renderer.render(vmScene,camera);renderer.autoClear=true}

function makeDrone(){
  const d=new THREE.Group();partBox(d,.36,.12,.36,M_.dark,0,0,0);const rs=[];
  for(const[a,b]of[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]]){partBox(d,.32,.03,.03,M_.dark,a/2,0,b/2).rotation.y=Math.atan2(b,a);const r=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.01,12),new THREE.MeshBasicMaterial({color:0x222222,transparent:true,opacity:.5}));r.position.set(a,.06,b);d.add(r);rs.push(r)}
  d.bin=partBox(d,.24,.14,.24,M_.yellow,0,-.14,0);d.rotors=rs;d.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(d);return d;
}
function addTile(type,gx,gz,dir,paid,extra){shadowDirty=true;powerDirty=true;waterDirty=true;const t={type,gx,gz,dir,acc:0,cool:0,n:0,flash:0,tog:0,load:0,bin:0,q:[],paid:paid||0,status:'',pw:1,wr:0,off:false,
    buf:0,bufN:0,buf2:0,bufN2:0,prog:0,jobN:0,outQ:[],store:0,sOnes:0,rate:600,...(extra||{})};t.L=t.L||0;
  if(!t.cmp&&FP[type]&&fpCells(type,gx,gz,dir).some(([x,z])=>occ.has(tkey(x,z,t.L))||!inYardFree(x,z)))t.cmp=true;fpRegister(t);
  t.mesh=makeTileMesh(t);tileRoot.add(t.mesh);tiles.set(tkey(gx,gz,t.L),t);
  if(type==='drone'){t.dm=makeDrone();t.dm.position.set(t.cx,.4,t.cz);t.ds='idle'}
  if(isGen(t)&&t.fuel==null)t.fuel=fuelCap(t);
  undoLog({k:'tile',t});
  return t}
// 發電機加燃料：裝不下的掉在旁邊地上
// it：送進去的東西。硬幣發電機吃散硬幣，燃氣發電廠吃環保磚
function feedGen(t,it){
  const u=GENS[t.type].fuel(it);if(u<=0)return 0;
  if(it.ones){G.onesLost+=it.ones;toast('糟糕！有 1 元被丟進發電機燒掉了','red')}
  const was=t.fuel;let k=1;
  if(t.type==='gen'){const room=Math.max(0,Math.floor(fuelCap(t)-t.fuel));k=Math.min(room,it.n);t.fuel+=k;
    if(it.n>k){const x=t.gx+.5+(Math.random()-.5),z=t.gz+1.3;items.push({x,y:0,z,n:it.n-k,ones:0,belt:false})}}
  else t.fuel=Math.min(fuelCap(t),t.fuel+u);
  if(was<=0&&t.fuel>0)powerDirty=true;
  return k;
}
const genOn=t=>t.fuel>0&&(!usesWater(t)||t.wr>0);
function removeTile(t){
  undoLog({k:'rmTile',d:tileData(t)});
  tileRoot.remove(t.mesh);disposeObj(t.mesh);tiles.delete(tkey(t.gx,t.gz,t.L));fpUnregister(t);shadowDirty=true;powerDirty=true;waterDirty=true;
  if(t.dm){scene.remove(t.dm);disposeObj(t.dm)}
  if(t.tex)t.tex.dispose();
  if(t.bin){G.onesHand+=t.bin;t.bin=0;toast('偵測機裡的 1 元拿到手上了')}
  const cs=new Set((t.cells||[[t.gx,t.gz]]).map(([x,z])=>x+','+z));
  items.forEach(it=>{if(it.belt&&cs.has(Math.floor(it.x)+','+Math.floor(it.z))&&(it.L||0)===t.L){it.belt=false;it.y=standAt(it.x,it.z,it.y);it.L=0}});
}
function moveTile(t,gx,gz){tiles.delete(tkey(t.gx,t.gz,t.L));fpUnregister(t);t.gx=gx;t.gz=gz;fpRegister(t);tiles.set(tkey(gx,gz,t.L),t);t.mesh.position.set(gx+.5,(t.L||0)*LH,gz+.5);shadowDirty=true;powerDirty=true}
const drawerCap=t=>t.type==='detector'?1e9:Math.round((t.type==='scanner'?4:8)+4*lv('drawer'))*(1+bonus('drawer'));
const trayPos=t=>{const a=t.dir*Math.PI/2;return{x:t.gx+.5+Math.cos(a)*.78,z:t.gz+.5+Math.sin(a)*.78}};
const countType=tp=>{let n=0;for(const t of tiles.values())if(t.type===tp)n++;return n};

// ---------- 供電網路：發電機＋電線桿自動拉電纜 ----------
let power={sup:0,dem:0,ratio:0},powerDirty=true;
const cableGroup=new THREE.Group();scene.add(cableGroup);
const cableMat=new THREE.LineBasicMaterial({color:0x151515});
