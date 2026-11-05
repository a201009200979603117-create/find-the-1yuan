// ================= 機器的大小：不是每台都只佔一格 =================
// [寬, 長]：寬是左右，長是沿著箭頭方向。東西從後面或旁邊進來，從最前排的「出口格」往箭頭方向出去
const FP={bench:[2,1],cosign:[2,1],museum:[2,1],rake:[1,2],gen:[2,2],gas:[3,3],pump:[2,2],dish:[2,2],silo:[2,2],roller:[1,2],unroll:[1,2],wrap:[1,2],pellet:[1,2],disc:[2,2],pulp:[2,2],paper:[2,3],scanner:[1,2],scanner2:[1,2],detector:[1,3],drone:[2,2],cabinet:[2,1]};
// 機器多高（看著機器、拉電線用）
const MH={plant:.9,radio:1.15,cosign:2.1,museum:2.45,flowers:.3,bench:.9,lantern:2.1,luckycat:.6,rake:1.5,arm:1.6,arm2:1.8,arm3:2,gen:1.5,gas:2.6,pole:3.3,cbox:.8,switch:1.7,dish:3,scanner:1.6,scanner2:1.6,detector:2.2,roller:2,unroll:1.3,wrap:1.7,pellet:1.8,disc:2.3,pulp:1.9,paper:1.9,silo:4.6,pump:2.3,pusher:.9,drone:.4,cabinet:1.9,lamp:2.3,paint:1.8,chute:1.4,tube:1.4,lift:1.8};
let occ=new Map();
const cellAt=k=>occ.get(k);
const fpSize=(type,cmp)=>cmp?[1,1]:FP[type]||[1,1];
const fpLat=w=>w%2?-(w-1)/2:0;
function fpCells(type,gx,gz,dir,cmp){const[w,d]=fpSize(type,cmp),[fx,fz]=DIRS[dir],[rx,rz]=DIRS[(dir+1)%4],a0=fpLat(w),out=[];
  for(let a=a0;a<a0+w;a++)for(let b=0;b<d;b++)out.push([gx+rx*a-fx*b,gz+rz*a-fz*b]);return out}
// 機器正中間（模型就畫在這裡）
function fpCenter(type,gx,gz,dir,cmp){const[w,d]=fpSize(type,cmp),[fx,fz]=DIRS[dir],[rx,rz]=DIRS[(dir+1)%4],ca=w%2?0:(w-1)/2,cb=(d-1)/2;return{x:gx+.5+rx*ca-fx*cb,z:gz+.5+rz*ca-fz*cb,ca,cb}}
// 準星對著的格子 → 出口格（長的機器讓準星落在中間那排）
function fpAnchor(type,gx,gz,dir){const d=fpSize(type)[1],[fx,fz]=DIRS[dir],k=Math.floor((d-1)/2);return{gx:gx+fx*k,gz:gz+fz*k}}
function fpFree(type,gx,gz,dir,L){return fpCells(type,gx,gz,dir).every(([x,z])=>tileFree(x,z,type,L))}
function fpRect(cells){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const[x,z]of cells){x0=Math.min(x0,x);x1=Math.max(x1,x+1);z0=Math.min(z0,z);z1=Math.max(z1,z+1)}return{x0,x1,z0,z1}}
// 一個點到機器範圍的水平距離（供電範圍用：碰到機器的邊就算）
function distToTile(x,z,t){const r=t.rect;if(!r)return Math.hypot(x-t.gx-.5,z-t.gz-.5);const dx=Math.max(r.x0-x,0,x-r.x1),dz=Math.max(r.z0-z,0,z-r.z1);return Math.hypot(dx,dz)}
function fpRegister(t){const cells=fpCells(t.type,t.gx,t.gz,t.dir,t.cmp),c=fpCenter(t.type,t.gx,t.gz,t.dir,t.cmp);t.cells=cells;t.cx=c.x;t.cz=c.z;t.rect=fpRect(cells);
  for(const[x,z]of cells)occ.set(tkey(x,z,t.L),t)}
function fpUnregister(t){for(const[x,z]of t.cells||[[t.gx,t.gz]]){const k=tkey(x,z,t.L);if(occ.get(k)===t)occ.delete(k)}}
// 看著哪台機器：用機器的整個外框來算
function machineLooked(){const{o,d}=camRay(0);let best=null,bt=4.2;
  for(const t of tiles.values()){if(t.type==='belt'||t.type==='sell'||t.type==='dock'||!t.rect)continue;
    const r=t.rect,yb=(t.L||0)*LH,h=MH[t.type]||1,pad=t.type==='pole'?.3:0,b0=[r.x0+pad,yb,r.z0+pad],b1=[r.x1-pad,yb+h,r.z1-pad],oo=[o.x,o.y,o.z],dd=[d.x,d.y,d.z];
    let tn=0,tf=bt,ok=true;for(let i=0;i<3;i++){if(Math.abs(dd[i])<1e-6){if(oo[i]<b0[i]||oo[i]>b1[i]){ok=false;break}continue}
      let t1=(b0[i]-oo[i])/dd[i],t2=(b1[i]-oo[i])/dd[i];if(t1>t2){const s=t1;t1=t2;t2=s}tn=Math.max(tn,t1);tf=Math.min(tf,t2);if(tn>tf){ok=false;break}}
    if(ok&&tn<bt){bt=tn;best=t}}
  return best}
function makeTileMesh0(t){
  const g=new THREE.Group(),T=t.type;
  // 輸送帶：連續的側板＋黃色護邊，接在一起看起來是一整條
  const belt=()=>{const b=new THREE.Mesh(beltGeo,M_.belt);b.position.y=.34;g.add(b);g.add(new THREE.Mesh(beltFrameGeo(),M_beltFrame))};
  const mat=matC;
  if(T==='belt'||T==='merge'||T==='mergeU'||T==='mergeC'||T==='tjunc'||T==='gate'||T==='beltC')belt();
  if(T==='mergeC'){partBox(g,.06,.2,.4,mat(0xd8732a),-.5,.46,.25);partBox(g,.06,.2,.4,mat(0xd8732a),.5,.46,.25);partBox(g,.4,.2,.06,mat(0xd8732a),0,.46,.5)}
  if(T==='tjunc'){partBox(g,.5,.05,.12,M_.yellow,0,.42,0);partBox(g,.12,.05,.3,M_.yellow,0,.42,.18)}
  if(T==='gate'){for(const x of[-.52,.52])partBox(g,.07,.75,.07,M_.dark,x,.55,0);partBox(g,1.1,.07,.1,M_.dark,0,.92,0);
    t.anim=partBox(g,.96,.3,.04,mat(0xc0392b),0,.75,0);const lv_=partBox(g,.05,.4,.05,M_.yellow,.62,.75,0);lv_.rotation.z=.4;t.lever=lv_}
  if(T==='beltC'){const c=partBox(g,1,.34,.98,new THREE.MeshStandardMaterial({color:0x6c7378,metalness:.6,roughness:.45}),0,.5,0);partBox(g,1.02,.04,.2,M_.dark,0,.68,.39)}
  if(T==='merge'){partBox(g,.06,.2,.5,M_.yellow,-.5,.46,.2);partBox(g,.06,.2,.5,M_.yellow,.5,.46,.2)}
  if(T==='mergeU')partBox(g,.06,.2,.5,M_.yellow,.5,.46,.2);
  if(T==='split'||T==='splitU'||T==='split3'||T==='smart'){
    belt();partBox(g,.12,.28,.5,mat(T==='smart'?0x3a8fd0:T==='split3'?0xd8732a:0xe2a51c),0,.52,.15);
    if(T==='smart'){const s=new THREE.Mesh(new THREE.SphereGeometry(.08,10,8),new THREE.MeshBasicMaterial({color:0x66ccff}));s.position.set(0,.74,.15);g.add(s)}
  }
  if(T==='chute'){belt();const f=new THREE.Mesh(new THREE.CylinderGeometry(.5,.2,.55,18,1,true),new THREE.MeshStandardMaterial({color:0x9aa3a8,metalness:.8,roughness:.35,side:THREE.DoubleSide}));f.position.y=.9;g.add(f);for(const[a,b]of[[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]])partBox(g,.05,.7,.05,M_.dark,a,.7,b)}
  if(T==='tube'){belt();partBox(g,.6,.45,.55,M_.dark,0,.6,.2);const tb=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,1.2,16),M_.steel);tb.rotation.x=-.95;tb.position.set(0,.95,-.25);g.add(tb)}
  if(T==='lift'){belt();for(const x of[-.52,.52])partBox(g,.08,1.5,.08,M_.yellow,x,.75,0);partBox(g,1.12,.08,.5,M_.yellow,0,1.5,0);const pl2=partBox(g,.9,.05,.6,M_.steel,0,.6,0);t.anim=pl2}
  if(T==='rake'){ // 綠色活塞耙：前面（+z）對著硬幣堆，後面（-z）把硬幣送上輸送帶
    partBox(g,.95,.55,.95,M_.green,0,.32,0);partBox(g,1,.06,1,M_.dark,0,.6,0);
    const boiler=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.7,16),M_.green);boiler.rotation.x=Math.PI/2;boiler.position.set(0,.84,.05);g.add(boiler);
    for(const z of[-.2,.3]){const band=new THREE.Mesh(new THREE.TorusGeometry(.245,.02,6,20),M_.steel);band.position.set(0,.84,z);g.add(band)}
    const ch=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,.65,10),M_.dark);ch.position.set(.3,1.2,-.25);g.add(ch);
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.07,22),M_.dark);wheel.rotation.z=Math.PI/2;wheel.position.set(.53,.6,.1);g.add(wheel);t.wheel=wheel;
    for(let k=0;k<6;k++){const sp=partBox(wheel,.03,.6,.03,M_.steel,0,0,0);sp.rotation.x=k*Math.PI/6}
    const arm=new THREE.Group();arm.position.set(0,.45,.45);g.add(arm);t.arm=arm;
    partBox(arm,.08,.08,.8,M_.steel,0,0,.35);partBox(arm,.9,.05,.08,M_.dark,0,-.18,.75);
    for(let k=-4;k<=4;k++)partBox(arm,.02,.22,.02,M_.steel,k*.1,-.3,.78);
    partBox(g,.6,.05,.45,M_.belt,0,.37,-.5);
  }
  if(T==='arm'||T==='arm2'||T==='arm3'){
    const L=BIT[T].reach,col=T==='arm'?0x1b1b1d:T==='arm2'?0xd06a1a:0xcfa21a;
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,.3,16),M_.dark);base.position.y=.15;g.add(base);
    const piv=new THREE.Group();piv.position.y=.3;g.add(piv);t.arm=piv;
    partBox(piv,.16,.9,.16,mat(col),0,.45,0);
    const j=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),M_.dark);j.position.y=.9;piv.add(j);
    const fore=new THREE.Group();fore.position.y=.9;piv.add(fore);partBox(fore,.11,.11,L*.55,mat(col),0,0,L*.27);
    partBox(fore,.28,.1,.08,M_.steel,0,-.06,L*.55);partBox(fore,.04,.16,.04,M_.steel,-.12,-.16,L*.55);partBox(fore,.04,.16,.04,M_.steel,.12,-.16,L*.55);
  }
  if(T==='gen'){partBox(g,.95,.75,.95,mat(0x2f5f6e),0,.38,0);for(let k=0;k<5;k++)partBox(g,.97,.03,.6,M_.dark,0,.2+k*.12,.1);const ex=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.7,10),M_.dark);ex.position.set(-.3,1.05,-.3);g.add(ex);const fan=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.04,12),M_.steel);fan.rotation.x=Math.PI/2;fan.position.set(0,.45,.49);g.add(fan);t.wheel=fan;const lamp=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0x33ff66}));lamp.position.set(.35,.8,.35);g.add(lamp);t.lamp=lamp}
  if(T==='pole'){const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,3.2,10),M_.wood);p.position.y=1.6;g.add(p);partBox(g,.8,.07,.07,M_.wood,0,3.0,0);for(const x of[-.35,.35]){const ins=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.12,8),new THREE.MeshStandardMaterial({color:0xdde6ea,roughness:.2}));ins.position.set(x,3.1,0);g.add(ins)}const lamp=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0x33ff66}));lamp.position.set(0,2.75,.09);g.add(lamp);t.lamp=lamp}
  if(SCANS.has(T)){
    belt();
    if(T!=='detector'){const mk2=T==='scanner2';partBox(g,.08,1.1,.12,M_.dark,-.52,.6,0);partBox(g,.08,1.1,.12,M_.dark,.52,.6,0);partBox(g,1.12,.18,mk2?.7:.5,mk2?mat(0x3a8fd0):M_.yellow,0,1.18,0);
      const gl=new THREE.Mesh(new THREE.BoxGeometry(1,.7,.45),new THREE.MeshStandardMaterial({color:0x7ad0ff,transparent:true,opacity:.22,depthWrite:false}));gl.position.y=.8;g.add(gl);
      // 抽屜（Mk I 在側邊，Mk II 多一個托盤）
      partBox(g,.3,.22,.4,M_.dark,-.7,.95,0);partBox(g,.04,.06,.2,M_.steel,-.86,.95,0);
      if(mk2){partBox(g,.42,.06,.5,M_.steel,.78,.42,0);partBox(g,.06,.42,.06,M_.dark,.78,.2,0)}
      const tag=new THREE.Mesh(new THREE.PlaneGeometry(.6,.15),new THREE.MeshBasicMaterial({map:signTex(mk2?'MK II':'MK I','#1b1b1b','#f0c030',null,256)}));tag.position.set(0,1.18,-(mk2?.36:.26));tag.rotation.y=Math.PI;g.add(tag)}
    else{const body=partBox(g,1.15,1.1,.9,M_.yellow,0,1.05,0);partBox(g,1.17,.12,.92,M_.dark,0,.62,0);
      const lab=new THREE.Mesh(new THREE.PlaneGeometry(1,.26),new THREE.MeshBasicMaterial({map:signTex('ONE DETECTOR','#1b1b1b','#f0c030',null,768)}));lab.position.set(0,1.25,-.46);lab.rotation.y=Math.PI;g.add(lab);
      partBox(g,.5,.5,.5,M_.dark,.85,.25,0)}
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),new THREE.MeshBasicMaterial({color:0x33ff66}));lamp.position.set(0,T!=='detector'?1.32:1.66,0);g.add(lamp);t.lamp=lamp;
  }
  const outlet=()=>partBox(g,.5,.25,.08,M_.dark,0,.42,-.48);
  const label=(txt,y,z)=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(.8,.2),new THREE.MeshBasicMaterial({map:signTex(txt,'#1b1b1b','#f0c030',null,512)}));l.position.set(0,y,z);g.add(l)};
  if(T==='roller'){ // 壓縮機：上面是進料斗，裡面的壓板一上一下
    partBox(g,.95,.8,.95,mat(0x4d6a86),0,.4,0);const hp=new THREE.Mesh(new THREE.CylinderGeometry(.42,.3,.35,4,1,true),new THREE.MeshStandardMaterial({color:0x9aa3a8,metalness:.8,roughness:.35,side:THREE.DoubleSide}));hp.rotation.y=Math.PI/4;hp.position.y=.98;g.add(hp);
    for(const x of[-.38,.38])partBox(g,.07,.7,.07,M_.steel,x,1.15,.35);partBox(g,.84,.08,.12,M_.dark,0,1.5,.35);t.anim=partBox(g,.5,.1,.5,M_.yellow,0,1.3,.1);outlet();label('COMPRESSOR',.62,.48)}
  if(T==='unroll'){partBox(g,.95,.8,.95,mat(0x8a3a2a),0,.4,0);for(let k=0;k<3;k++)partBox(g,.8,.03,.1,M_.steel,0,.82,-.3+k*.3);outlet()}
  if(T==='wrap'){partBox(g,.95,.85,.95,mat(0x5d7f97),0,.43,0);const pr=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.8,14),wrapMesh.material);pr.rotation.z=Math.PI/2;pr.position.y=1.0;g.add(pr);outlet();label('WRAPPER',.62,.48)}
  if(T==='pellet'){ // 造粒機：綠色機身＋進料斗＋煙囪
    partBox(g,.95,.75,.95,mat(0x4f7a3a),0,.38,0);const hp=new THREE.Mesh(new THREE.CylinderGeometry(.35,.18,.4,12,1,true),new THREE.MeshStandardMaterial({color:0x9aa3a8,metalness:.8,roughness:.35,side:THREE.DoubleSide}));hp.position.set(-.15,.95,.15);g.add(hp);
    const ch=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.7,10),M_.dark);ch.position.set(.3,1.1,.3);g.add(ch);t.anim=partBox(g,.3,.12,.3,M_.yellow,.25,.85,-.2);outlet();label('PELLETIZER',.55,.48)}
  if(T==='disc'){ // 圓盤壓製機：四根柱子上一個圓形壓頭
    partBox(g,1,.55,1,mat(0x6b4f8a),0,.28,0);for(const[a,b]of[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]])partBox(g,.07,1.1,.07,M_.steel,a,1.1,b);partBox(g,1,.1,1,M_.dark,0,1.65,0);
    const hd=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.18,24),M_.yellow);hd.position.y=1.3;g.add(hd);t.anim=hd;outlet();label('DISC PRESS',.4,.51)}
  if(T==='pulp'){ // 紙漿機：一個大槽，裡面是水
    const vat=new THREE.Mesh(new THREE.CylinderGeometry(.45,.42,.75,24,1,true),new THREE.MeshStandardMaterial({color:0x8d949a,metalness:.8,roughness:.35,side:THREE.DoubleSide}));vat.position.y=.45;g.add(vat);
    const wtr=new THREE.Mesh(new THREE.CircleGeometry(.43,24),new THREE.MeshStandardMaterial({color:0x8f8466,roughness:.2,metalness:.1}));wtr.rotation.x=-Math.PI/2;wtr.position.y=.7;g.add(wtr);
    partBox(g,.9,.12,.9,M_.dark,0,.06,0);t.anim=partBox(g,.06,.6,.06,M_.steel,0,1,0);outlet()}
  if(T==='paper'){ // 造紙機：長機身上兩支白色滾筒
    partBox(g,.95,.6,.95,mat(0x3d5a6e),0,.3,0);for(const z of[-.2,.2]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.85,16),new THREE.MeshStandardMaterial({color:0xf2f0ea,roughness:.6}));r.rotation.z=Math.PI/2;r.position.set(0,.76,z);g.add(r)}
    t.anim=partBox(g,.85,.04,.5,new THREE.MeshStandardMaterial({color:0xf8f6f0,roughness:.8}),0,.92,0);outlet();label('PAPER MILL',.45,.48)}
  if(T==='silo'){ // 筒倉：高高的圓筒
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,2.8,24),new THREE.MeshStandardMaterial({color:0xc5cacd,metalness:.75,roughness:.35}));body.position.y=1.9;g.add(body);
    const top=new THREE.Mesh(new THREE.ConeGeometry(.48,.45,24),M_.steel);top.position.y=3.52;g.add(top);
    const bot=new THREE.Mesh(new THREE.ConeGeometry(.46,.4,24),M_.steel);bot.rotation.x=Math.PI;bot.position.y=.3;g.add(bot);
    for(const[a,b]of[[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]])partBox(g,.06,.6,.06,M_.dark,a,.3,b);
    for(let k=0;k<4;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(.465,.015,6,24),M_.dark);r.rotation.x=Math.PI/2;r.position.y=.8+k*.75;g.add(r)}outlet()}
  if(T==='gas'){ // 燃氣發電廠：橘色機房＋高煙囪＋儲氣槽
    partBox(g,.95,.9,.95,mat(0xc8642a),0,.45,0);partBox(g,.97,.08,.97,M_.dark,0,.92,0);
    const ch=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,1.6,12),M_.steel);ch.position.set(-.3,1.7,-.3);g.add(ch);
    const tk=new THREE.Mesh(new THREE.SphereGeometry(.26,16,12),new THREE.MeshStandardMaterial({color:0xe8e8e8,metalness:.5,roughness:.3}));tk.position.set(.22,1.18,.22);g.add(tk);
    const fan=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.04,12),M_.steel);fan.rotation.x=Math.PI/2;fan.position.set(0,.45,.49);g.add(fan);t.wheel=fan;
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0x33ff66}));lamp.position.set(.38,.98,-.38);g.add(lamp);t.lamp=lamp}
  if(T==='pump'){ // 鑽井抽水機：A 字架＋馬達＋井口
    partBox(g,.9,.1,.9,M_.conc,0,.05,0);const well=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.3,14),pipeMat);well.position.y=.25;g.add(well);
    for(const s of[-1,1]){const leg=partBox(g,.06,1.5,.06,M_.yellow,s*.3,.75,0);leg.rotation.z=s*.2}partBox(g,.2,.08,.08,M_.yellow,0,1.45,0);
    partBox(g,.3,.25,.25,new THREE.MeshStandardMaterial({color:0x2a5f8f,metalness:.5,roughness:.4}),.25,.25,-.25);t.anim=partBox(g,.05,.8,.05,M_.steel,0,.8,0);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0x33ff66}));lamp.position.set(.25,.45,-.25);g.add(lamp);t.lamp=lamp}
  if(T==='pusher'){partBox(g,.9,.45,.9,mat(0x6d7f3a),0,.23,0);t.anim=partBox(g,.95,.25,.06,M_.steel,0,.2,.55);partBox(g,.6,.05,.45,M_.belt,0,.47,-.3)}
  if(T==='dish'){ // 衛星天線：柱子上一個會轉的碟子
    partBox(g,.8,.2,.8,M_.conc,0,.1,0);const post=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,2.2,12),M_.steel);post.position.y=1.2;g.add(post);
    const head=new THREE.Group();head.position.y=2.3;g.add(head);t.anim=head;
    const dsh=new THREE.Mesh(new THREE.SphereGeometry(.75,24,12,0,Math.PI*2,0,Math.PI*.32),new THREE.MeshStandardMaterial({color:0xe8ecef,metalness:.4,roughness:.35,side:THREE.DoubleSide}));dsh.rotation.x=-Math.PI/2+.5;head.add(dsh);
    const feed=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.7,6),M_.dark);feed.rotation.x=.5+Math.PI/2;feed.position.set(0,.15,.28);head.add(feed);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0x33ff66}));lamp.position.set(.3,.25,.3);g.add(lamp);t.lamp=lamp}
  if(T==='cbox'){partBox(g,.5,.4,.4,mat(0x3c5a3c),0,.2,0);partBox(g,.52,.05,.42,M_.dark,0,.42,0);const cd=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.3,10),M_.dark);cd.position.set(0,.05,-.25);cd.rotation.x=Math.PI/2;g.add(cd);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),new THREE.MeshBasicMaterial({color:0x33ff66}));lamp.position.set(.15,.32,.21);g.add(lamp);t.lamp=lamp}
  if(T==='switch'){partBox(g,.08,1.3,.08,M_.dark,0,.65,0);partBox(g,.7,.6,.22,mat(0x5a6470),0,1.25,.08);
    for(let k=0;k<8;k++){const l=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshBasicMaterial({color:0x33ff66}));l.position.set(-.27+(k%4)*.18,1.38-Math.floor(k/4)*.2,.2);g.add(l);(t.lights=t.lights||[]).push(l)}}
  if(T==='drone'){const pad=new THREE.Mesh(new THREE.BoxGeometry(.98,.06,.98),new THREE.MeshStandardMaterial({map:padTex,roughness:.8}));pad.position.y=.03;g.add(pad)}
  if(T==='cabinet'){const c=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.9,.6),[M_.wood,M_.wood,M_.wood,M_.wood,new THREE.MeshStandardMaterial({map:drawerTex}),M_.wood]);c.position.y=.95;g.add(c)}
  if(T==='hstairs'){ // 硬幣階梯：一階一階往上的輸送帶
    for(let k=0;k<6;k++){const st_=partBox(g,.9,.08,.18,M_.belt,0,.42+k*LH/6,.4-k*.16);st_.castShadow=true}
    for(const x of[-.48,.48]){const r=partBox(g,.05,.05,1.25,M_.yellow,x,.42+LH/2+.1,0);r.rotation.x=Math.atan2(LH,1)}
    for(const x of[-.42,.42])partBox(g,.06,LH+.4,.06,M_.dark,x,(LH+.4)/2,-.42)}
  if(T==='lamp'){ // 工作燈：腳架＋燈頭
    for(let k=0;k<3;k++){const lg=partBox(g,.04,1.2,.04,M_.dark,Math.cos(k*2.09)*.18,.55,Math.sin(k*2.09)*.18);lg.rotation.set(Math.sin(k*2.09)*.2,0,-Math.cos(k*2.09)*.2)}
    partBox(g,.05,1.1,.05,M_.dark,0,1.55,0);const hd=partBox(g,.35,.25,.15,M_.yellow,0,2.1,.05);hd.rotation.x=-.4;
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(.28,.18),new THREE.MeshBasicMaterial({color:0xfff2c0}));glow.position.set(0,2.05,-.04);glow.rotation.set(-.4+Math.PI,0,0);g.add(glow);
    t.light=new THREE.PointLight(0xffe6b0,1.2,12,1.8);t.light.position.set(0,1.95,-.4);g.add(t.light)}
  if(T==='paint'){ // 油漆板：可以畫畫的白板
    for(const x of[-.6,.6])partBox(g,.06,1.9,.06,M_.wood,x,.95,0);
    t.cv=document.createElement('canvas');t.cv.width=256;t.cv.height=160;const c=t.cv.getContext('2d');c.fillStyle='#f6f4ee';c.fillRect(0,0,256,160);
    if(t.img){const im=new Image();im.onload=()=>{c.drawImage(im,0,0);t.tex.needsUpdate=true};im.src=t.img}
    t.tex=new THREE.CanvasTexture(t.cv);t.tex.encoding=THREE.sRGBEncoding;
    const bd=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.75),new THREE.MeshBasicMaterial({map:t.tex}));bd.position.set(0,1.35,.04);bd.rotation.y=Math.PI;g.add(bd);t.board=bd;
    partBox(g,1.26,.81,.05,M_.dark,0,1.35,0)}
  // 架高的輸送帶底下沒有平台，就加支柱
  if((t.L||0)>0&&BELTLIKE.has(T)&&!deckAt(t.gx,t.gz,t.L))for(const x of[-.4,.4])partBox(g,.07,t.L*LH,.07,M_.dark,x,-t.L*LH/2+.1,0);
  g.position.set(t.gx+.5,(t.L||0)*LH,t.gz+.5);g.rotation.y=-t.dir*Math.PI/2;
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  linColors(g);if(t.anim)t.animY=t.anim.position.y;if(T==='gate')setGate(t);
  return g;
}
