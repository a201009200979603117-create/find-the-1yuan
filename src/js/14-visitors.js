// ================= 輕鬆的小驚喜：長椅、來訪的貓、流星、彩虹（沒理它們也沒關係） =================
function nearBench(){for(const t of tiles.values())if(t.type==='bench'){const c=fpCenter('bench',t.gx,t.gz,t.dir);if(Math.hypot(pl.x-c.x,pl.z-c.z)<1.5&&Math.abs(pl.y-(t.L||0)*LH)<.6)return t}return null}
function sitBench(t){const c=fpCenter('bench',t.gx,t.gz,t.dir),[fx,fz]=DIRS[t.dir];pl.sit={t,x:c.x+fx*.12,z:c.z+fz*.12,y:(t.L||0)*LH};pl.yaw=Math.atan2(-fx,-fz);pl.pitch=-.05;G.flags.sat=true;tone(300,.08,'triangle',.03)}
function standUp(){const s=pl.sit;pl.sit=null;if(!s)return;const[fx,fz]=DIRS[s.t.dir];pl.x=s.x+fx*.6;pl.z=s.z+fz*.6;pl.crouch=false}
// 來訪的貓：玩一陣子會有貓晃進院子，在硬幣堆旁邊走走坐坐，可以摸摸牠，過幾分鐘自己離開
const CAT_COATS=[{n:'橘貓',b:0xd98a3d,s:0xb8682a,w:0xf4dcb4},{n:'黑白貓',b:0x232323,s:0x232323,w:0xf2f2f2},{n:'三花貓',b:0xf3ede3,s:0xc9782f,w:0xf3ede3,p:0x2b2b2b},{n:'虎斑貓',b:0x8b7b62,s:0x564836,w:0xdcd1bc},{n:'白貓',b:0xf4f2ee,s:0xf4f2ee,w:0xf4f2ee}];
let cat=null,heartTex=null;
function makeCat(c){const g=new THREE.Group(),m=x=>paint(x,0,.85),B=m(c.b),S=m(c.s),W=m(c.w),dark=paint(0x1b1b1b,0,.5),pink=paint(0xeea0a8,0,.6);
  const body=new THREE.Group();body.position.y=.2;g.add(body);
  mk(body,sphGeo(.13,14,10),B,0,0,0).scale.set(.85,.8,1.7);mk(body,sphGeo(.11,12,8),W,0,-.04,-.03).scale.set(.8,.6,1.5);
  if(c.p){mk(body,sphGeo(.07,10,8),m(c.p),.05,.07,.06).scale.set(1,.5,1.3);mk(body,sphGeo(.06,10,8),S,-.06,.065,-.08).scale.set(1,.5,1.2)}
  else if(c.s!==c.b){const cap=share(new THREE.SphereGeometry(.13,14,6,0,Math.PI*2,0,Math.PI*.42));for(const z of[-.13,-.045,.04,.125])mk(body,cap,S,0,0,z).scale.set(.858,.808,.09)} // 背上的條紋
  const head=new THREE.Group();head.position.set(0,.1,-.22);body.add(head);
  mk(head,sphGeo(.1,14,12),B,0,0,0).scale.set(1.05,.92,.95);mk(head,sphGeo(.055,10,8),W,0,-.03,-.065).scale.set(1.1,.8,.7);
  for(const sd of[-1,1]){mk(head,cylGeo(0,.04,.08,4),B,sd*.055,.09,.01,0,Math.PI/4,sd*-.25);mk(head,cylGeo(0,.022,.05,4),pink,sd*.055,.085,-.004,0,Math.PI/4,sd*-.25);
    mk(head,sphGeo(.017,8,6),paint(0x5a9a3a,.2,.2),sd*.038,.02,-.085);mk(head,sphGeo(.008,6,4),dark,sd*.038,.02,-.1)}
  mk(head,sphGeo(.012,6,4),pink,0,-.015,-.105);
  const legs=[];for(const[x,z]of[[-.06,-.14],[.06,-.14],[-.06,.14],[.06,.14]]){const lg=new THREE.Group();lg.position.set(x,.17,z);g.add(lg);mk(lg,cylGeo(.025,.022,.17,8),z<0?W:B,0,-.085,0);legs.push(lg)}
  // 尾巴：根部接在屁股上，往後翹起來（外層左右甩、內層固定往後傾）
  const tail=new THREE.Group();tail.position.set(0,.24,.19);g.add(tail);const tt=new THREE.Group();tt.rotation.x=.55;tail.add(tt);mk(tt,cylGeo(.017,.026,.3,8),S,0,.15,0);mk(tt,sphGeo(.018,8,6),S,0,.3,0);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});linColors(g);return{g,body,head,legs,tail}}
// 院子邊緣：沿著角度往外找，最遠還站得到的地方
function catEdge(a){for(let r=H*1.45;r>Rp+1.5;r-=.25)if(allowed(Math.cos(a)*r,Math.sin(a)*r))return r;return Rp+1.5}
function catSpot(){for(let k=0;k<20;k++){const a=Math.random()*6.283,r=Rp+1.5+Math.random()*Math.max(.5,catEdge(a)-Rp-2.5);if(allowed(Math.cos(a)*r,Math.sin(a)*r))return{a,r}}return null}
function spawnCat(){if(HFm||H-Rp<3.5)return false;const sp=catSpot();if(!sp)return false;const c=CAT_COATS[Math.floor(Math.random()*CAT_COATS.length)],a0=sp.a+(Math.random()-.5)*1.2;
  cat={...makeCat(c),coat:c,gid:G,a:a0,r:catEdge(a0),ta:sp.a,tr:sp.r,st:'walk',stay:150+Math.random()*90,leave:false,pets:0,hearts:[],yaw:0,walk:0,petT:0,out:0};
  cat.g.scale.setScalar(.01);scene.add(cat.g);toast('🐈 有一隻'+c.n+'跑進院子了','gold');return true}
function removeCat(){if(!cat)return;scene.remove(cat.g);cat.hearts.forEach(h=>scene.remove(h.s));cat=null}
function nearCat(){if(!cat||cat.leave||!G)return false;const p=cat.g.position;return Math.hypot(pl.x-p.x,pl.z-p.z)<2&&Math.abs(pl.y-p.y)<1.2}
function petCat(){const c=cat;c.petT=2.5;c.st='sit';c.sitT=Math.max(c.sitT||0,6);G.catPets=(G.catPets||0)+1;if(!c.pets++)c.stay+=40;
  if(!heartTex){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');x.font='52px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ff5a78';x.fillText('❤',32,36);heartTex=new THREE.CanvasTexture(cv)}
  const p=c.g.position;for(let k=0;k<3;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:heartTex,transparent:true,depthWrite:false}));s.scale.setScalar(.16);s.position.set(p.x+(Math.random()-.5)*.25,p.y+.45+k*.05,p.z+(Math.random()-.5)*.25);scene.add(s);c.hearts.push({s,t:-k*.25})}
  for(let k=0;k<6;k++)setTimeout(()=>tone(52+Math.random()*8,.13,'sawtooth',.018),k*150);
  toast(['🐈 呼嚕呼嚕～','🐈 牠瞇起眼睛了','🐈 牠蹭了蹭你的手','🐈 牠翻過來給你摸肚子'][Math.floor(Math.random()*4)])}
function updateCat(dt,now){
  if(cat&&cat.gid!==G)removeCat();if(!G)return;
  if(!cat){if(mode!=='play')return;G.catNext=(G.catNext??300)-dt;if(G.catNext<=0){G.catNext=480+Math.random()*360;spawnCat()}return}
  const c=cat;c.stay-=dt;c.petT=Math.max(0,c.petT-dt);
  if(c.stay<=0&&!c.leave){c.leave=true;c.st='walk';c.ta=c.a;c.tr=catEdge(c.a)}
  let mvx=0,mvz=0;
  if(c.st==='walk'){let da=c.ta-c.a;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;const dr=c.tr-c.r,dist=Math.hypot(da*c.r,dr);
    if(dist<.05){if(c.leave)c.st='out';else{c.st='sit';c.sitT=8+Math.random()*14}}
    else{const k=Math.min(1,.75*dt/dist),x0=Math.cos(c.a)*c.r,z0=Math.sin(c.a)*c.r;c.a+=da*k;c.r+=dr*k;mvx=Math.cos(c.a)*c.r-x0;mvz=Math.sin(c.a)*c.r-z0;c.walk+=dt*10}}
  else if(c.st==='sit'){c.sitT-=dt;if(c.sitT<=0&&!c.petT){const sp=catSpot();if(sp){c.ta=sp.a;c.tr=sp.r;c.st='walk'}else c.sitT=5}}
  // 進場、離開：慢慢變大、變小
  if(c.st==='out'){c.out+=dt*2;if(c.out>=1){removeCat();return}}
  c.g.scale.setScalar(c.st==='out'?Math.max(.01,1-c.out):Math.min(1,c.g.scale.x+dt*2));
  const x=Math.cos(c.a)*c.r,z=Math.sin(c.a)*c.r;c.g.position.set(x,groundAt(x,z),z);
  // 走路面向前進方向，坐著、被摸的時候轉頭看你
  let want=c.yaw;if(mvx||mvz)want=Math.atan2(-mvx,-mvz);else if(Math.hypot(pl.x-x,pl.z-z)<4)want=Math.atan2(-(pl.x-x),-(pl.z-z));
  let d=want-c.yaw;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;c.yaw+=d*Math.min(1,dt*4);c.g.rotation.y=c.yaw;
  const walking=c.st==='walk';c.legs.forEach((l,i)=>l.rotation.x=walking?Math.sin(c.walk+(i===0||i===3?0:Math.PI))*.55:l.rotation.x*.8);
  c.body.position.y=walking?.2+Math.abs(Math.sin(c.walk))*.012:.17;c.body.rotation.x=walking?0:-.12;
  c.head.rotation.x=c.petT>0?-.35:Math.sin(now/1700)*.08;c.tail.rotation.y=Math.sin(now/(c.petT>0?140:520))*(c.petT>0?.6:.35);
  for(const h of c.hearts){h.t+=dt;if(h.t<0){h.s.visible=false;continue}h.s.visible=true;h.s.position.y+=dt*.45;h.s.material.opacity=Math.max(0,1-h.t/1.3)}
  c.hearts=c.hearts.filter(h=>{if(h.t>1.3){scene.remove(h.s);return false}return true})}
// 流星：晚上偶爾從你看的方向劃過天空，第一次看到會提醒你許願
let meteor=null,meteorT=20,glowTex=null;
function updateMeteor(dt){
  if(meteor){const m=meteor;m.t+=dt;const k=m.t/m.d;if(k>=1||m.gid!==G){scene.remove(m.l,m.s);m.l.geometry.dispose();meteor=null;return}
    const h=m.p0.clone().addScaledVector(m.v,k),tl=m.p0.clone().addScaledVector(m.v,Math.max(0,k-.3)),p=m.l.geometry.attributes.position;p.setXYZ(0,h.x,h.y,h.z);p.setXYZ(1,tl.x,tl.y,tl.z);p.needsUpdate=true;
    const o=Math.sin(Math.PI*k);m.l.material.opacity=o;m.s.material.opacity=o;m.s.position.copy(h);return}
  if(!G||mode!=='play'&&mode!=='photo'||!isNight())return;
  meteorT-=dt;if(meteorT>0)return;meteorT=30+Math.random()*60;
  if(!glowTex){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(200,220,255,.6)');gr.addColorStop(1,'rgba(200,220,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);glowTex=new THREE.CanvasTexture(cv)}
  const a=pl.yaw+(Math.random()-.5)*1.4,sd=Math.random()<.5?-1:1,y=110+Math.random()*60,cx=pl.x-Math.sin(a)*220,cz=pl.z-Math.cos(a)*220;
  const p0=new THREE.Vector3(cx-Math.cos(a)*sd*60,y,cz+Math.sin(a)*sd*60),v=new THREE.Vector3(Math.cos(a)*sd*120,-45-Math.random()*25,-Math.sin(a)*sd*120);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([p0.x,p0.y,p0.z,p0.x,p0.y,p0.z],3));g.setAttribute('color',new THREE.Float32BufferAttribute([1,1,1,0,0,0],3));
  const l=new THREE.Line(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));l.frustumCulled=false;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.scale.setScalar(5);sp.position.copy(p0);
  scene.add(l,sp);meteor={l,s:sp,p0,v,t:0,d:.9+Math.random()*.5,gid:G};
  if(!G.flags.meteor){G.flags.meteor=true;toast('✨ 流星！許個願吧','gold')}}
// 彩虹：白天雨停之後掛在背對太陽的天邊，慢慢淡掉
let rainbow=null,rainbowT=0,rainbowG=null;
function updateRainbow(dt){
  if(rainbowG!==G){rainbowT=0;rainbowG=G}
  if(rainbowT<=0||!G){if(rainbow)rainbow.visible=false;return}
  rainbowT-=dt;
  if(!rainbow){rainbow=new THREE.Mesh(new THREE.RingGeometry(150,172,96,1,0,Math.PI),new THREE.ShaderMaterial({uniforms:{op:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float op;varying vec2 vP;vec3 hue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}void main(){float t=(length(vP)-150.)/22.;gl_FragColor=vec4(hue((1.-t)*.78),op*smoothstep(0.,.2,t)*smoothstep(1.,.8,t)*.45);}'}));
    rainbow.frustumCulled=false;scene.add(rainbow)}
  const rain=G.wx?G.wx.rain:0,op=Math.min(1,(100-rainbowT)/15)*Math.min(1,rainbowT/15)*Math.max(0,1-rain*2);
  rainbow.visible=op>.01;rainbow.material.uniforms.op.value=op;
  const sx=sun.position.x,sz=sun.position.z,l=Math.hypot(sx,sz)||1;rainbow.position.set(-sx/l*300,-40,-sz/l*300);rainbow.lookAt(0,-40,0);
  if(op>.5&&!G.flags.rainbow){G.flags.rainbow=true;toast('🌈 雨停了，天邊出現彩虹','gold')}}
function updateVisitors(dt,now){updateCat(dt,now);updateMeteor(dt);updateRainbow(dt)}
// 每一格都會呼叫：分流器的擋板轉向、掃描雷射、轉動的零件
function animTile(t,dt,now){
  if(t.paddle){const rel=t.lastOut!=null?(t.lastOut-t.dir+4)%4:null;if(rel!=null){let a=-rel*Math.PI/2,c=t.paddle.rotation.y;while(a-c>Math.PI)a-=Math.PI*2;while(c-a>Math.PI)a+=Math.PI*2;t.paddle.rotation.y=c+(a-c)*Math.min(1,dt*12);
    if(t.outArr&&t.litRel!==rel){t.litRel=rel;for(const k in t.outArr)t.outArr[k].material=+k===rel?MM.arrOut:MM.arrOff}}}
  if(t.scanBar)t.scanBar.position.z=Math.sin(now/300)*.55;
  if(t.wave)t.wave.rotation.x=-.25+Math.sin(now/280)*.45; // 招財貓招手
  if(t.mus)museumAnim(t,dt,now); // 一元博物館：1 元慢慢轉
  if(t.spin){const k=dt*(t.prog>0||!PROCS[t.type]?4:.6)*(t.pw||0);if(t.spinAx==='z')t.spin.rotation.z+=k;else if(t.spinAx==='x')t.spin.rotation.x+=k;else t.spin.rotation.y+=k}
  if(t.beam){t.beam.rotation.x=Math.sin(now/400)*.22*(t.pw>0?1:0)}
}
// 建造預覽：藍色箭頭＝東西從這裡進去，橘色箭頭＝從這裡出來
const FLOWT=new Set(['rake','arm','arm2','arm3','pusher','scanner','scanner2','detector','roller','unroll','wrap','pellet','disc','pulp','paper','silo','chute','tube','lift','gate','hstairs','belt','beltC']);
const gArrIn=share(new THREE.MeshBasicMaterial({color:0x39b8ff,toneMapped:false,depthTest:false,transparent:true,opacity:.95})),gArrOut=share(new THREE.MeshBasicMaterial({color:0xff9a2e,toneMapped:false,depthTest:false,transparent:true,opacity:.95}));
function addGhostIO(g,id){
  const io=IO[id],put=(m,x,z,ry)=>{const a=mk(g,arrowGeo(.5,.42),m,x,.62,z,0,ry,0);a.renderOrder=5};
  if(io){if(id==='tjunc')return;for(const sd of io.i)put(gArrIn,SIDE[sd][0]*.8,SIDE[sd][1]*.8,SIDE_ROT[sd]+Math.PI);for(const sd of io.o)put(gArrOut,SIDE[sd][0]*.8,SIDE[sd][1]*.8,SIDE_ROT[sd]);return}
  if(!FLOWT.has(id))return;const[w,d]=fpSize(id),ca=w%2?0:(w-1)/2;
  if(!id.startsWith('arm'))put(gArrIn,ca,d-.5+.3,0);put(gArrOut,0,-.8,0)}
