// ================= 電：看得到的粗電線、供電範圍、蓋之前先看會接到哪 =================
const cableMat2=share(new THREE.MeshStandardMaterial({color:0x1c1c1c,roughness:.7,metalness:.2}));
// 電線接在哪：電線桿接在橫擔，發電機接在頂上，機器接在靠電線桿那一邊的側面
function wireEnd(t,toward){
  const yb=(t.L||0)*LH;if(t.type==='pole')return new THREE.Vector3(t.cx,yb+3.05,t.cz);
  const r=t.rect||{x0:t.gx,x1:t.gx+1,z0:t.gz,z1:t.gz+1},tx=toward?toward.cx:t.cx,tz=toward?toward.cz:t.cz;
  const x=Math.max(r.x0+.1,Math.min(r.x1-.1,tx)),z=Math.max(r.z0+.1,Math.min(r.z1-.1,tz));
  return new THREE.Vector3(x,yb+Math.min((MH[t.type]||1)-.1,isGen(t)?1.2:.95),z)}
function sagCurve(a,b){const d=a.distanceTo(b),pts=[];for(let k=0;k<=10;k++){const f=k/10;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f-Math.sin(f*Math.PI)*Math.min(.6,d*.06),a.z+(b.z-a.z)*f))}return pts}
function drawCables(edges){
  disposeObj(cableGroup);cableGroup.clear();if(!edges.length)return;
  const grp=new THREE.Group();
  for(const[a,b]of edges){const pa=wireEnd(a,b),pb=wireEnd(b,a);grp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sagCurve(pa,pb)),12,.022,5,false),cableMat2))}
  const m=mergeStatic(grp);m.traverse(o=>{if(o.isMesh)o.castShadow=true});cableGroup.add(m)}
// 沒電的機器頭上會浮一個紅色的閃電
const noPwrTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#c0392b';g.beginPath();g.arc(64,64,58,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=8;g.stroke();g.fillStyle='#ffd34d';g.beginPath();g.moveTo(72,14);g.lineTo(34,72);g.lineTo(60,72);g.lineTo(50,114);g.lineTo(94,52);g.lineTo(66,52);g.closePath();g.fill()});
const noPwrMat=share(new THREE.SpriteMaterial({map:noPwrTex,depthTest:true,toneMapped:false}));
const noPwr=new Map();
function syncNoPower(){
  for(const[t,s]of noPwr)if(!tiles.has(tkey(t.gx,t.gz,t.L))||tiles.get(tkey(t.gx,t.gz,t.L))!==t||t.pw>0||tagOff(t)){scene.remove(s);noPwr.delete(t)}
  for(const t of tiles.values())if(needPower(t)&&t.pw<=0&&!tagOff(t)&&!noPwr.has(t)){const s=new THREE.Sprite(noPwrMat);s.scale.set(.45,.45,1);s.position.set(t.cx,(t.L||0)*LH+(MH[t.type]||1)+.35,t.cz);scene.add(s);noPwr.set(t,s)}}
function bobNoPower(now){for(const[t,s]of noPwr)s.position.y=(t.L||0)*LH+(MH[t.type]||1)+.35+Math.sin(now/300)*.06}
// 建造時：所有電線桿、電纜箱、發電機的供電範圍畫在地上
const COV_MAX=160,covFill=new THREE.InstancedMesh(new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),share(new THREE.MeshBasicMaterial({color:0xffd34d,transparent:true,opacity:.1,depthWrite:false,toneMapped:false})),COV_MAX),
  covRing=new THREE.InstancedMesh(new THREE.RingGeometry(.975,1,64).rotateX(-Math.PI/2),share(new THREE.MeshBasicMaterial({color:0xffd34d,transparent:true,opacity:.55,depthWrite:false,toneMapped:false})),COV_MAX);
for(const m of[covFill,covRing]){m.count=0;m.frustumCulled=false;m.renderOrder=1;scene.add(m)}
const PWR_ITEMS=new Set(['pole','cbox','gen','gas']);
function covRadius(t){return t.type==='pole'?dropR():t.type==='cbox'?10+lv('drops'):isGen(t)?3:0}
function showCoverage(on){let n=0;if(on){const m=new THREE.Matrix4();for(const t of tiles.values()){const r=covRadius(t);if(!r||n>=COV_MAX)continue;
  const R=r;m.makeScale(R,1,R).setPosition(t.cx,(t.L||0)*LH+.03+n*.0005,t.cz);covFill.setMatrixAt(n,m);covRing.setMatrixAt(n,m);n++}}
  covFill.count=covRing.count=n;covFill.instanceMatrix.needsUpdate=covRing.instanceMatrix.needsUpdate=true}
// 預覽電線：從會接到的那根電線桿拉到預覽的機器（黃色）
const PV_MAX=12,pvPos=new Float32Array(PV_MAX*10*2*3),pvGeo=new THREE.BufferGeometry();pvGeo.setAttribute('position',new THREE.BufferAttribute(pvPos,3));
const pvLines=new THREE.LineSegments(pvGeo,share(new THREE.LineBasicMaterial({color:0xffd34d,depthTest:false,transparent:true,toneMapped:false})));pvLines.frustumCulled=false;pvLines.renderOrder=6;scene.add(pvLines);pvGeo.setDrawRange(0,0);
function setPreviewWires(pairs){let n=0;for(const[a,b]of pairs.slice(0,PV_MAX)){const pts=sagCurve(a,b);for(let k=0;k<10;k++){for(const p of[pts[k],pts[k+1]]){pvPos[n*3]=p.x;pvPos[n*3+1]=p.y;pvPos[n*3+2]=p.z;n++}}}
  pvGeo.attributes.position.needsUpdate=true;pvGeo.setDrawRange(0,n)}
// 預覽的機器會不會有電、會接到誰
function powerPreview(id,an,dir,L){
  const b=BIT[id];if(!b)return'';const fake={type:id,gx:an.gx,gz:an.gz,dir,L:L||0};fpRegisterFake(fake);
  const carriers=[...tiles.values()].filter(t=>t.type==='pole'||t.type==='cbox'||isGen(t));
  if(id==='pole'||id==='cbox'){const SPp=spanR(),SPc=18+1.5*lv('spans'),near=carriers.filter(t=>Math.hypot(t.cx-fake.cx,t.cz-fake.cz)<=(id==='cbox'&&(t.type==='cbox'||isGen(t))?SPc:SPp));
    setPreviewWires(id==='cbox'?[]:near.filter(t=>t.type!=='cbox').map(t=>[wireEnd(t,fake),wireEnd(fake,t)]));
    const pw=[...tiles.values()].filter(t=>needPower(t)&&distToTile(fake.cx,fake.cz,t)<=covRadius(fake)).length;
    return '<br><span style="color:#ffd34d">⚡ '+(near.length?'會連到 '+near.length+' 個電線桿／發電機':'附近沒有電線桿或發電機可以連（要 '+SPp+' 公尺內）')+'・範圍內 '+pw+' 台機器</span>'}
  if(isGen({type:id})){setPreviewWires([]);return'<br><span style="color:#ffd34d">⚡ 3 公尺內的機器直接有電，遠的用電線桿接</span>'}
  if(!pwrOf({type:id})){setPreviewWires([]);return''}
  let best=null,bd=1e9;for(const c of carriers){const d=distToTile(c.cx,c.cz,fake),R=covRadius(c);if(d<=R&&d<bd){bd=d;best=c}}
  if(best){setPreviewWires(best.type==='cbox'?[]:[[wireEnd(best,fake),wireEnd(fake,best)]]);return'<br><span style="color:#ffd34d">⚡ 會接到'+(best.type==='pole'?'電線桿':best.type==='cbox'?'地下電纜箱':'發電機')+'（'+bd.toFixed(1)+' 公尺）</span>'}
  setPreviewWires([]);let nd=1e9,nc=null;for(const c of carriers){const d=distToTile(c.cx,c.cz,fake);if(d<nd){nd=d;nc=c}}
  return'<br><span class="r">⚡ 這裡沒有電'+(nc?'：最近的'+(nc.type==='pole'?'電線桿':isGen(nc)?'發電機':'電纜箱')+'在 '+nd.toFixed(1)+' 公尺外（要 '+covRadius(nc)+' 公尺內），黃色圈圈裡才有電':'：先蓋發電機，再用電線桿把電接過來')+'</span>'}
function fpRegisterFake(t){const c=fpCenter(t.type,t.gx,t.gz,t.dir);t.cx=c.x;t.cz=c.z;t.rect=fpRect(fpCells(t.type,t.gx,t.gz,t.dir))}

const pwrOf=t=>{const b=BIT[t.type];if(!b||!b.power)return 0;if(t.type==='rake')return lv('rakeHead')?4:2;return b.power};
const needPower=t=>pwrOf(t)>0;
const isGen=t=>!!GENS[t.type];
const fuelCap=t=>Math.round(GENS[t.type].cap()*bufMul());
const tagOff=t=>t.tag!=null&&G.tags&&countType('switch')>0&&!G.tags[t.tag].on,tagHigh=t=>t.tag!=null&&G.tags&&countType('switch')>0&&G.tags[t.tag].high;
function rebuildPower(){
  powerDirty=false;
  // 電線桿和地下電纜箱都會帶電：電線桿之間 9 公尺、電纜箱 18 公尺；供電範圍電線桿 6 公尺、電纜箱 10 公尺
  const carrier=t=>t.type==='pole'||t.type==='cbox';
  const ts=[...tiles.values()].filter(t=>isGen(t)||carrier(t)||needPower(t));
  const par=ts.map((_,k)=>k),find=k=>par[k]===k?k:(par[k]=find(par[k]));
  const edges=[],drops=new Map(),SP=spanR(),DR=dropR(),SPc=18+1.5*lv('spans'),DRc=10+lv('drops');
  for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){
    const a=ts[i],b=ts[j],ac=carrier(a),bc=carrier(b),ag=isGen(a),bg=isGen(b),d=(ac||ag)&&(bc||bg)?Math.hypot(a.cx-b.cx,a.cz-b.cz):ac||ag?distToTile(a.cx,a.cz,b):distToTile(b.cx,b.cz,a);
    const under=a.type==='cbox'||b.type==='cbox';
    let ok=false;
    if((ac||ag)&&(bc||bg)&&(ac||bc))ok=d<=(a.type==='cbox'&&(b.type==='cbox'||bg)||b.type==='cbox'&&ag?SPc:SP);
    else if(ac||bc){const c=ac?a:b,m=ac?b:a;ok=needPower(m)&&d<=(c.type==='cbox'?DRc:DR)}
    else if(ag||bg){const m=ag?b:a;ok=needPower(m)&&d<=3}
    if(ok){par[find(i)]=find(j);if((ac||ag)&&(bc||bg)){if(!under)edges.push([a,b])}else{const m=ac||ag?b:a,c=m===a?b:a,pr=drops.get(m);if(!pr||d<pr.d)drops.set(m,{c,d})}}
  }
  // 開關箱：關掉的標籤不供電；設成優先的標籤，電不夠時先給它
  const nets=new Map();
  ts.forEach((t,k)=>{const r=find(k);let n=nets.get(r);if(!n)nets.set(r,n={sup:0,dem:0,hi:0,off:false,tiles:[]});n.tiles.push(t);if(isGen(t)){if(genOn(t))n.sup+=GENS[t.type].kw();if(t.off)n.off=true}if(needPower(t)&&!tagOff(t)){n.dem+=pwrOf(t);if(tagHigh(t))n.hi+=pwrOf(t)}});
  let sup=0,dem=0;
  for(const n of nets.values()){
    const live=!n.off&&n.sup>0,rh=!live?0:n.hi?Math.min(1,n.sup/n.hi):1,rest=n.dem-n.hi,rr=!live?0:rest?Math.min(1,Math.max(0,n.sup-n.hi)/rest):1,r=!live?0:n.dem?Math.min(1,n.sup/n.dem):1;
    n.tiles.forEach(t=>{t.net=n;t.pw=tagOff(t)?0:!needPower(t)?r:n.hi?(tagHigh(t)?rh:rr):r});if(!n.off)sup+=n.sup;dem+=n.dem}
  for(const t of tiles.values())if(!ts.includes(t)){t.net=null;t.pw=1}
  power={sup,dem,ratio:dem?Math.min(1,sup/dem):1};
  const hgt=t=>t.type==='pole'?3.08:isGen(t)?.85:.7;
  for(const t of tiles.values())if(t.lamp&&t.type==='cbox')t.lamp.material.color.setHex(t.pw>0?0x33ff66:0xaa2222);
  for(const[m,{c}]of drops)if(c.type!=='cbox')edges.push([c,m]);
  drawCables(edges);syncNoPower();
}
function toggleLine(t){
  if(!t.net){toast('這台沒有接上電');return}
  const gens=t.net.tiles.filter(isGen);if(!gens.length){toast('這條線路沒有發電機');return}
  const off=!gens[0].off;gens.forEach(x=>x.off=off);G.flags.toggled=true;powerDirty=true;
  toast(off?'整條線路關掉了，線上的機器都停下來':'整條線路打開了');tone(off?300:700,.12,'square',.04);
}

// ---------- 供水：抽水機＋水管（另一層，輸送帶可以蓋在水管上面） ----------
let pipes=new Map(),waterDirty=true,waterNets=[];
const pipeRoot=new THREE.Group();scene.add(pipeRoot);
const pipeMat=new THREE.MeshStandardMaterial({color:0x2f6fa8,metalness:.55,roughness:.4}),flangeMat=new THREE.MeshStandardMaterial({color:0x23527d,metalness:.6,roughness:.35});
linMat(pipeMat);linMat(flangeMat);share(pipeMat);share(flangeMat);
const pumpRate=()=>5*(1+.25*lv('bore'));
// 每一節水管朝哪幾個方向有開口（0 北、1 東、2 南、3 西）
function pipeOpen(p){if(p.type==='pipe')return p.dir%2===0?[0,2]:[1,3];if(p.type==='ptee')return[0,1,2,3].filter(d=>d!==(p.dir+2)%4);return[0,1,2,3]}
function makePipeMesh(p){
  const g=new THREE.Group(),y=.16;
  for(const d of pipeOpen(p)){const[dx,dz]=DIRS[d];const c=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.5,12),pipeMat);c.rotation.set(dz?Math.PI/2:0,0,dx?Math.PI/2:0);c.position.set(dx*.25,y,dz*.25);g.add(c);
    const f=new THREE.Mesh(new THREE.CylinderGeometry(.115,.115,.04,14),flangeMat);f.rotation.copy(c.rotation);f.position.set(dx*.48,y,dz*.48);g.add(f)}
  if(p.type!=='pipe'){const b=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),flangeMat);b.position.y=y;g.add(b)}
  for(const s of[-.3,.3])partBox(g,.04,.12,.04,M_.dark,p.dir%2?s:0,.06,p.dir%2?0:s);
  g.position.set(p.gx+.5,0,p.gz+.5);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return g;
}
function addPipe(type,gx,gz,dir,paid){const p={type,gx,gz,dir,paid:paid||0};undoLog({k:'pipe',p});p.mesh=makePipeMesh(p);pipeRoot.add(p.mesh);pipes.set(tkey(gx,gz),p);waterDirty=true;shadowDirty=true;return p}
function removePipe(p){undoLog({k:'rmPipe',d:[p.type,p.gx,p.gz,p.dir,p.paid]});pipeRoot.remove(p.mesh);disposeObj(p.mesh);pipes.delete(tkey(p.gx,p.gz));waterDirty=true;shadowDirty=true}
const usesWater=t=>BIT[t.type]&&BIT[t.type].water;
function rebuildWater(){
  waterDirty=false;
  const keys=[...pipes.keys()],ts=[...tiles.values()].filter(t=>t.type==='pump'||usesWater(t)),ids=new Map();
  keys.forEach((k,i)=>ids.set('p'+k,i));ts.forEach((t,i)=>ids.set('t'+tkey(t.gx,t.gz),keys.length+i));
  const par=[...Array(keys.length+ts.length).keys()],find=k=>par[k]===k?k:(par[k]=find(par[k]));
  for(const p of pipes.values())for(const d of pipeOpen(p)){const[dx,dz]=DIRS[d],nk=tkey(p.gx+dx,p.gz+dz),q=pipes.get(nk),a=ids.get('p'+tkey(p.gx,p.gz));
    if(q&&pipeOpen(q).includes((d+2)%4))par[find(a)]=find(ids.get('p'+nk));
    const t=cellAt(nk);if(t&&(t.type==='pump'||usesWater(t)))par[find(a)]=find(ids.get('t'+tkey(t.gx,t.gz)))}
  const nets=new Map();ts.forEach((t,i)=>{const r=find(keys.length+i);let n=nets.get(r);if(!n)nets.set(r,n={pumps:[],users:[]});(t.type==='pump'?n.pumps:n.users).push(t)});
  for(const t of tiles.values())if(usesWater(t))t.wr=0;
  waterNets=[...nets.values()];
}
function updateWater(){
  if(waterDirty)rebuildWater();
  for(const n of waterNets){let sup=0,dem=0;n.pumps.forEach(p=>{sup+=p.pw>0&&!(p.net&&p.net.off)?pumpRate()*p.pw:0;p.wsup=n});n.users.forEach(u=>dem+=BIT[u.type].water);n.sup=sup;n.dem=dem;const r=dem?Math.min(1,sup/dem):0;n.users.forEach(u=>{u.wr=sup?r:0;u.wnet=n})}
}

// ---------- 蓋房子：平台、樓梯、欄杆、牆、屋頂（另一層，存在 structs） ----------
let structs=[],railEdges=new Set(),wallCells=new Map();
const structRoot=new THREE.Group();scene.add(structRoot);
const wasteMul=()=>Math.max(.5,1-.05*lv('wasteMat'))*disc();
const deckMat=new THREE.MeshStandardMaterial({color:0x8a8d90,metalness:.6,roughness:.45}),steelWall=new THREE.MeshStandardMaterial({color:0x7d8a94,metalness:.55,roughness:.5}),roofMat=new THREE.MeshStandardMaterial({color:0x6a5040,metalness:.3,roughness:.7});
[deckMat,steelWall,roofMat].forEach(m=>{linMat(m);share(m)});
function deckAt(gx,gz,L){for(const s of structs)if(s.kind==='platform'&&s.L===L&&gx>=s.x0&&gx<=s.x1&&gz>=s.z0&&gz<=s.z1)return s;return null}
function deckLevelAt(gx,gz){let L=0;for(const s of structs)if(s.kind==='platform'&&gx>=s.x0&&gx<=s.x1&&gz>=s.z0&&gz<=s.z1)L=Math.max(L,s.L);return L}
// 樓梯：從落腳處（0 公尺）一路升到平台邊（L 層）
function stairH(s,x,z){const[ux,uz]=DIRS[s.d],px_=(x-(s.lx+.5))*ux+(z-(s.lz+.5))*uz,perp=Math.abs((x-(s.lx+.5))*uz-(z-(s.lz+.5))*ux);if(perp>.55||px_<-.5||px_>s.n-.5)return -1;return Math.max(0,(px_+.5)/s.n)*s.L*LH}
const roofCells=s=>s.cells;
// 腳下可以站的高度：硬幣堆、平台、樓梯、平屋頂（只算不比 y 高太多的）
function standAt(x,z,y){let h=groundAt(x,z);const gx=Math.floor(x),gz=Math.floor(z);
  for(const s of structs){let top=-1;
    if(s.kind==='platform'){if(gx>=s.x0&&gx<=s.x1&&gz>=s.z0&&gz<=s.z1)top=s.L*LH}
    else if(s.kind==='roof'||s.kind==='hatch'){if(s.cells.some(c=>c[0]===gx&&c[1]===gz&&!c[2]))top=2.5}
    else if(s.kind==='stairs')top=stairH(s,x,z);
    if(top>h&&top<=y+.65)h=top}
  return h}
// 欄杆和牆擋路
function blockedMove(x0,z0,x1,z1,y){
  const a=Math.floor(x0),b=Math.floor(z0),c=Math.floor(x1),d=Math.floor(z1);
  const w=wallCells.get(tkey(c,d));if(w==='wall'&&y<2.3&&wallCells.get(tkey(a,b))!=='wall')return true;
  if(a===c&&b===d)return false;
  let dir=c>a?1:c<a?3:d>b?2:0;
  for(let L=1;L<=3;L++)if(Math.abs(y-L*LH)<.5&&railEdges.has(a+','+b+','+dir+','+L))return true;
  return false;
}
function makeStructMesh(s){
  const g=new THREE.Group(),K=s.kind;
  if(K==='platform'){const w=s.x1-s.x0+1,d=s.z1-s.z0+1,y=s.L*LH;
    const top=new THREE.Mesh(new THREE.BoxGeometry(w,.12,d),texMat(M_.plank,w/2,d/2));top.position.set(s.x0+w/2,y-.06,s.z0+d/2);g.add(top);
    partBox(g,w,.18,.08,deckMat,s.x0+w/2,y-.2,s.z0);partBox(g,w,.18,.08,deckMat,s.x0+w/2,y-.2,s.z1+1);partBox(g,.08,.18,d,deckMat,s.x0,y-.2,s.z0+d/2);partBox(g,.08,.18,d,deckMat,s.x1+1,y-.2,s.z0+d/2);
    for(let x=s.x0;x<=s.x1+1;x+=Math.max(1,Math.min(3,w)))for(let z=s.z0;z<=s.z1+1;z+=Math.max(1,Math.min(3,d)))partBox(g,.1,y,.1,deckMat,Math.min(x,s.x1+1),y/2,Math.min(z,s.z1+1))}
  if(K==='stairs'){const[ux,uz]=DIRS[s.d],H_=s.L*LH,steps=Math.ceil(H_/.2);
    // 實心的階梯，一階一階疊上去
    for(let k=0;k<steps;k++){const f=(k+.5)/steps,h=(k+1)/steps*H_,dp=s.n/steps+.01;partBox(g,uz?1:dp,h,ux?1:dp,deckMat,s.lx+.5+ux*(f*s.n-.5),h/2,s.lz+.5+uz*(f*s.n-.5))}
    const a=Math.atan2(H_,s.n),len=Math.hypot(s.n,H_);
    for(const side of[-.48,.48]){const r=new THREE.Mesh(ux?new THREE.BoxGeometry(len,.05,.05):new THREE.BoxGeometry(.05,.05,len),M_.yellow);
      r.position.set(s.lx+.5+ux*(s.n/2-.5)+(uz?side:0),H_/2+.9,s.lz+.5+uz*(s.n/2-.5)+(ux?side:0));
      if(ux)r.rotation.z=a*Math.sign(ux);else r.rotation.x=-a*Math.sign(uz);g.add(r)}}
  if(K==='railing'){const y=s.L*LH;for(const c of s.cells)for(let dd=0;dd<4;dd++){if(deckAt(c[0]+DIRS[dd][0],c[1]+DIRS[dd][1],s.L))continue;const[ux,uz]=DIRS[dd],ex=c[0]+.5+ux*.47,ez=c[1]+.5+uz*.47;
      partBox(g,uz?1:.05,.05,ux?1:.05,M_.yellow,ex,y+1.05,ez);partBox(g,uz?1:.04,.04,ux?1:.04,M_.yellow,ex,y+.55,ez);partBox(g,.05,1.05,.05,M_.yellow,ex-uz*.47,y+.52,ez-ux*.47)}}
  if(K==='wall'||K==='window'||K==='door')for(const c of s.cells){const ax=c[2],cx=c[0]+.5,cz=c[1]+.5,L1=ax?1:.16,L2=ax?.16:1;
    if(K==='wall')partBox(g,L1,2.4,L2,steelWall,cx,1.2,cz);
    else{const top=K==='window'?1.3:2.1;partBox(g,L1,2.4-top,L2,steelWall,cx,top+(2.4-top)/2,cz);partBox(g,ax?.1:.18,top,ax?.18:.1,M_.dark,cx-(ax?.45:0),top/2,cz-(ax?0:.45));partBox(g,ax?.1:.18,top,ax?.18:.1,M_.dark,cx+(ax?.45:0),top/2,cz+(ax?0:.45))}}
  if(K==='roof'||K==='hatch'||K==='roofA'){for(const c of s.cells){const rise=K==='roofA'?c[3]||0:0;
      if(c[2]){const lad=new THREE.Group();lad.position.set(c[0]+.5,0,c[1]+.5);g.add(lad);for(const sx of[-.22,.22])partBox(lad,.05,2.6,.05,M_.wood,sx,1.3,0);for(let k=0;k<8;k++)partBox(lad,.45,.04,.04,M_.wood,0,.3+k*.3,0);
        for(const[a,b]of[[-.47,0],[.47,0],[0,-.47],[0,.47]])partBox(g,a?.06:1,.12,b?.06:1,roofMat,c[0]+.5+a,2.45,c[1]+.5+b)}
      else{const p=partBox(g,1.01,.1,1.01,roofMat,c[0]+.5,2.45+rise,c[1]+.5);if(K==='roofA'){const[ux,uz]=DIRS[s.d];p.rotation.set(uz?-Math.sign(uz)*.46:0,0,ux?Math.sign(ux)*.46:0)}}}}
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});linColors(g);return g;
}
function rebuildStructIndex(){
  railEdges=new Set();wallCells=new Map();
  for(const s of structs){
    if(s.kind==='railing')for(const c of s.cells)for(let d=0;d<4;d++)if(!deckAt(c[0]+DIRS[d][0],c[1]+DIRS[d][1],s.L))railEdges.add(c[0]+','+c[1]+','+d+','+s.L);
    if(s.kind==='wall'||s.kind==='window'||s.kind==='door')for(const c of s.cells)wallCells.set(tkey(c[0],c[1]),s.kind);
  }
}
function addStruct(s){undoLog({k:'struct',s});s.mesh=makeStructMesh(s);structRoot.add(s.mesh);structs.push(s);rebuildStructIndex();shadowDirty=true;
  // 平台蓋好之後，平台上的欄杆、架高輸送帶的支柱要重畫
  if(s.kind==='platform')structs.filter(r=>r.kind==='railing').forEach(r=>{structRoot.remove(r.mesh);r.mesh=makeStructMesh(r);structRoot.add(r.mesh)});return s}
function removeStruct(s){const sd={...s};delete sd.mesh;undoLog({k:'rmStruct',d:sd});structRoot.remove(s.mesh);disposeObj(s.mesh);structs.splice(structs.indexOf(s),1);rebuildStructIndex();shadowDirty=true}
function structAt(gx,gz){
  for(let k=structs.length-1;k>=0;k--){const s=structs[k];
    if(s.kind==='platform'&&gx>=s.x0&&gx<=s.x1&&gz>=s.z0&&gz<=s.z1)return s;
    if(s.cells&&s.cells.some(c=>c[0]===gx&&c[1]===gz))return s;
    if(s.kind==='stairs'&&stairH(s,gx+.5,gz+.5)>=0)return s}
  return null}
// 爬梯子：站在天窗的梯子旁邊按 E
function nearHatch(){for(const s of structs)if(s.kind==='hatch')for(const c of s.cells)if(c[2]&&Math.hypot(pl.x-c[0]-.5,pl.z-c[1]-.5)<1.3)return{s,c};return null}
function climbHatch(h){const[ux,uz]=DIRS[h.s.d];if(pl.y<1.5){pl.x=h.c[0]+.5+ux*1;pl.z=h.c[1]+.5+uz*1;pl.y=2.5;pl.vy=0}else{pl.x=h.c[0]+.5-ux*.9;pl.z=h.c[1]+.5-uz*.9;pl.y=standAt(pl.x,pl.z,.2);pl.vy=0}tone(500,.08)}

// ---------- 賣、出貨 ----------
const prodValue=it=>{const P=PROD[it.prod]||PROD.roll;return it.n*priceEach()*P.mul*(1+(P.q?.07*lv(P.q):0)+(P.q2?.07*lv(P.q2):0))};
// 加工機：吃什麼（null 是散硬幣）、幾個做一個、做多久（秒）、做出什麼
const baleSize=()=>Math.round(60*(1+.25*lv('baleBig')));
const PROCS={
  roller:{inp:null,need:baleSize,time:2,spd:'compSpd',comp:1,out:'roll'},
  wrap:  {inp:'roll',need:()=>1,time:1.2,spd:'wrapSpd',out:'wrap'},
  pellet:{inp:null,need:()=>Math.round(100*(1+.25*lv('ecoBig'))),time:2.5,spd:'pelletSpd',comp:1,out:'eco'},
  disc:  {inp:null,need:()=>50,inp2:'eco',need2:()=>2,time:3,spd:'discSpd',out:'disc'},
  pulp:  {inp:null,need:()=>Math.round(80*(1+.25*lv('pulpBig'))),time:3,spd:'pulpSpd',out:'pulp'},
  paper: {inp:'pulp',need:()=>3,time:4,spd:'paperSpd',out:'paper'}
};
const procSpeed=T=>{const P=PROCS[T];return 1+.08*lv(P.spd)+bonus('mach')+(P.comp?bonus('comp'):0)};
const bufCap=(P,two)=>Math.round((two?P.need2()*3:P.inp?P.need()*2+2:P.need()*3)*bufMul());
// 筒倉：一批一批放，每分鐘幾批可以調；升級加快上限、每批更多、容量更大
const siloCap=()=>Math.round(20000*(1+.25*lv('siloBig'))*bufMul());
const siloLoad=()=>Math.round(30*(1+.25*lv('siloLoad'))),siloTop=()=>20+20*lv('siloOut');
function sellItem(it){
  if(it.prod){addMoney(prodValue(it),false);soldRecent+=it.n;return}
  if(it.ones){G.onesLost+=it.ones;toast('糟糕！有 '+it.ones+' 枚 1 元跟著硬幣被賣掉了','red');tone(220,.4,'sawtooth',.05)}
  const v=it.n*priceEach();G.autoSold+=it.n;G.coinsSold+=it.n;orderAdd('coin',it.n);soldRecent+=it.n;G.beltAcc+=v;G.money+=v;G.earned+=v;G.rateAcc+=v;
}
function dockItem(it){
  if(!it.prod){sellItem(it);return}
  specialAdd(it.prod,1);const o=ORDERS[G.order],v=prodValue(it);G.money+=v;G.earned+=v;G.rateAcc+=v;G.beltAcc+=v;
  if(o&&o.t===it.prod){truck.load++;orderAdd(it.prod,1)}
}
function emit(t,n,ones,prod,sd){if(G){(G.made=G.made||{})[t.type]=(G.made[t.type]||0)+n;if(prod)(G.madeProd=G.madeProd||{})[prod]=1}items.push({x:t.gx+.5,z:t.gz+.5,y:(t.L||0)*LH+.42,L:t.L||0,n,ones:ones||0,prod,belt:true,from:t,sd:sd!=null?sd:null})}
// ---------- 分流設定 ----------
const KINDS=['coin','roll','wrap','eco','disc','pulp','paper'],kindOf=it=>it.prod||'coin',kindName=k=>k==='coin'?'散硬幣':PROD[k].name;
let beltCnt=new Map();
// 往 d 方向那一格收不收、塞住了沒
function outBlocked(nt,d,it){const[dx,dz]=DIRS[d],k=tkey(nt.gx+dx,nt.gz+dz,nt.L),n2=cellAt(k);if(!n2||!accepts(n2,it))return true;if(BELTLIKE.has(n2.type)&&n2.dir===(d+2)%4)return true;return(beltCnt.get(k)||0)>=4}
// 分流器：一般是輪流；有「分流器優先」就先給選定的那一邊，塞住了才給別邊
function pickOut(nt,outs,it){
  if(nt.prio&&lv('prio')){const f=outs[nt.prio-1];if(!outBlocked(nt,f,it))return f;const o=outs.find(d=>d!==f&&!outBlocked(nt,d,it));return o!=null?o:f}
  for(let k=0;k<outs.length;k++){nt.tog=(nt.tog+1)%outs.length;if(!outBlocked(nt,outs[nt.tog],it))return outs[nt.tog]}
  return outs[nt.tog%outs.length];
}
// T 型接頭：東西從哪邊進來，就分給其他接著的輸送帶
function tjOuts(nt,it){const px_=Math.floor(it.x),pz_=Math.floor(it.z);let din=-1;for(let d=0;d<4;d++)if(nt.gx+DIRS[d][0]===px_&&nt.gz+DIRS[d][1]===pz_)din=d;
  return[0,1,2,3].filter(d=>d!==din&&!outBlocked(nt,d,it))}
const smartKinds=t=>t.kinds||(t.kinds=[['roll','wrap','eco','disc','pulp','paper'],['coin'],[]]);
function setGate(t){if(!t.anim)return;t.anim.position.y=t.closed?.52:.86;if(t.lever)t.lever.rotation.z=t.closed?-.45:.45}
// 下一格收不收這個東西
function accepts(nt,it){
  if(!nt)return false;const T=nt.type;
  if(BELTLIKE.has(T)||T==='sell'||T==='dock')return true;
  if(isGen(nt))return GENS[T].fuel(it)>0&&nt.fuel<fuelCap(nt);
  if(nt.pw<=0)return false;
  const P=PROCS[T];
  if(P){if(P.inp2&&it.prod===P.inp2)return nt.buf2<bufCap(P,true);if(P.inp?it.prod===P.inp:!it.prod)return nt.buf<bufCap(P);return false}
  if(T==='unroll')return it.prod==='roll'||it.prod==='wrap';
  if(T==='silo')return !it.prod&&nt.store<siloCap();
  return false;
}
// 東西進到某一格：處理機器的吃進去、分流器的轉向
function enterTile(it,nt){
  const T=nt.type;if(BELTLIKE.has(T))nt.flowAcc=(nt.flowAcc||0)+it.n;
  if(T==='sell'){sellItem(it);return 'gone'}
  if(T==='dock'){dockItem(it);return 'gone'}
  if(isGen(nt)){feedGen(nt,it);return 'gone'}
  const P=PROCS[T];
  if(P){
    if(it.ones){G.onesLost+=it.ones;toast('糟糕！有 1 元被壓進'+BIT[T].name+'裡了','red');tone(220,.4,'sawtooth',.05)}
    if(P.inp2&&it.prod===P.inp2){nt.buf2++;nt.bufN2+=it.n}else if(P.inp){nt.buf++;nt.bufN+=it.n}else{nt.buf+=it.n;nt.bufN+=it.n}
    return 'gone'}
  if(T==='unroll'){emit(nt,it.n,0);return 'gone'}
  if(T==='silo'){nt.store+=it.n;nt.sOnes+=it.ones||0;return 'gone'}
  it.sd=null;
  if(T==='split')it.sd=pickOut(nt,[(nt.dir+3)%4,(nt.dir+1)%4],it);
  if(T==='splitU')it.sd=pickOut(nt,[nt.dir,(nt.dir+1)%4],it);
  if(T==='split3')it.sd=pickOut(nt,[(nt.dir+3)%4,nt.dir,(nt.dir+1)%4],it);
  if(T==='tjunc'){const o=tjOuts(nt,it);if(o.length){nt.tog=(nt.tog+1)%o.length;it.sd=o[nt.tog]}}
  if(T==='smart'){ // 智慧分流器：三個出口各自設定收哪些種類
    const K=smartKinds(nt),outs=[(nt.dir+3)%4,nt.dir,(nt.dir+1)%4].filter((d,k)=>K[k].includes(kindOf(it)));
    it.sd=outs.length?pickOut(nt,outs,it):nt.dir}
  if(it.sd!=null)nt.lastOut=it.sd;
  return 'in';
}
// 東西射出去或跳過去，落地後交給那一格
// 東西落在 (gx,gz) 第 L 層：那層沒有東西接就一路往下掉，掉到下面的輸送帶、機器、平台或地上
function landItem(it,gx,gz,L){
  L=L||0;it.x=gx+.5;it.z=gz+.5;it.from=null;it.sk=null;
  for(let l=L;l>=0;l--){const nt=cellAt(tkey(gx,gz,l));if(!nt)continue;
    if(accepts(nt,it)){it.L=l;it.y=l*LH+.42;it.belt=true;const r=enterTile(it,nt);if(r!=='gone')items.push(it);return}break}
  it.belt=false;it.L=0;it.y=standAt(it.x,it.z,L*LH+.1);
  // 落在地上的水桶或手推車旁邊，就裝進去
  const dd=!it.prod&&G&&G.drop&&Object.keys(G.drop).find(id=>TOOL[id].cont&&Math.hypot(G.drop[id].x-it.x,G.drop[id].z-it.z)<.9);if(dd){fillDropped(dd,it.n);return}
  items.push(it);
}
function launchItem(it,t,dist){const[dx,dz]=DIRS[t.dir];let tx=null;
  for(let k=2;k<=dist;k++){const nt=cellAt(tkey(t.gx+dx*k,t.gz+dz*k,t.L));if(nt&&accepts(nt,it)){tx=k;break}}
  if(tx==null)tx=Math.min(6,dist);
  const gx=t.gx+dx*tx,gz=t.gz+dz*tx,y0=t.L*LH;
  launchHeap(new THREE.Vector3(t.gx+.5,y0+.9,t.gz+.5),new THREE.Vector3(gx+.5,y0+.45,gz+.5),it.n,it.ones,()=>landItem(it,gx,gz,t.L));
}
// 升降機和階梯輸送帶：把東西送上一層，放到前面那一格
function liftItem(it,t){const[dx,dz]=DIRS[t.dir],L2=Math.min(3,t.L+1),gx=t.gx+dx,gz=t.gz+dz;
  launchHeap(new THREE.Vector3(t.gx+.5,t.L*LH+.6,t.gz+.5),new THREE.Vector3(gx+.5,L2*LH+.45,gz+.5),it.n,it.ones,()=>landItem(it,gx,gz,L2));
  if(t.anim)t.anim.position.y=t.animY+LH}
function updateAuto(dt){
  if(powerDirty)rebuildPower();
  updateWater();
  const cnt=new Map();for(const it of items)if(it.belt){const k=tkey(Math.floor(it.x),Math.floor(it.z),it.L||0);cnt.set(k,(cnt.get(k)||0)+1)}
  beltCnt=cnt;const now=performance.now(),room=t=>(cnt.get(tkey(t.gx,t.gz,t.L))||0)<4;
  for(const t of tiles.values()){
    t.flash=Math.max(0,t.flash-dt);
    const T=t.type,pw=t.pw;
    if(t.lamp)t.lamp.material.color.setHex(t.flash>0&&Math.floor(t.flash*8)%2?0xff3333:(needPower(t)||T==='pole'||T==='cbox'||isGen(t))&&pw<=0?0xaa2222:0x33ff66);
    if(SCANS.has(T)){const cap=(T==='scanner'?16.7:T==='scanner2'?27.8:100)*(1+.25*lv('scanBatch')+bonus('batch'))*(1+.15*lv('scanSpd')+bonus('scan'));t.cap=cap;t.load=Math.max(0,t.load-cap*dt)}
    if(isGen(t)){
      const n=t.net,load=n&&n.sup&&!n.off?Math.min(1,n.dem/n.sup):0;
      const on=genOn(t);if(on!==t.onPrev){t.onPrev=on;powerDirty=true}
      if(on&&load>0){t.fuel=Math.max(0,t.fuel-dt*load/GENS[T].burn);if(t.fuel<=0){powerDirty=true;toast(T==='gas'?'有一座燃氣發電廠沒燃料了，送環保磚進去':'有一台硬幣發電機沒燃料了，丟硬幣進去','red')}}
      if(t.wheel)t.wheel.rotation.y+=dt*12*(t.off||t.fuel<=0?0:1);
    }
    if(needPower(t)&&pw<=0){t.status=tagOff(t)?'開關箱把「'+G.tags[t.tag].name+'」關掉了':t.net&&t.net.off?'線路關掉了':'沒有電';continue}
    animTile(t,dt,now);
    if(T==='rake'){
      if(t.arm)t.arm.position.z=(t.armZ??.45)+Math.sin(now/220)*.12;if(t.wheel)t.wheel.rotation.x+=dt*6*pw;
      const[dx,dz]=DIRS[t.dir],rb=1.5+fpSize(t.type,t.cmp)[1]-1,fx=t.gx+.5-dx*rb,fz=t.gz+.5-dz*rb;
      if(!nearPile(fx,fz,1.6)){
        t.status='前面沒有硬幣';
        if(lv('rakeWheel')){t.cool-=dt;if(t.cool<=0){t.cool=1.5;const nx=t.gx-dx,nz=t.gz-dz;if(fpCells(t.type,nx,nz,t.dir,t.cmp).every(([x,z])=>{const o=cellAt(tkey(x,z,t.L));return(!o||o===t)&&inYardFree(x,z)})&&nearPile(nx+.5-dx*rb,nz+.5-dz*rb,4))moveTile(t,nx,nz)}}
        continue;
      }
      t.cool-=dt*pw*(1+.08*lv('rakeSpd')+bonus('rake'));
      if(t.cool<=0){if(!room(t)){t.status='後面塞住了，要保持淨空';continue}
        t.status='';t.cool=2.7;const r=takeCoins(fx,1,fz,rakeAmt());if(r.n&&(t.throwD||1)>1){sfxAt(t.gx+.5,t.gz+.5,SND.rake);const tx=t.gx+dx*t.throwD,tz=t.gz+dz*t.throwD,it={n:r.n,ones:r.ones,x:0,y:0,z:0,belt:false};launchHeap(new THREE.Vector3(t.gx+.5,t.L*LH+1,t.gz+.5),new THREE.Vector3(tx+.5,t.L*LH+.5,tz+.5),r.n,r.ones,()=>landItem(it,tx,tz,t.L))}else if(r.n){sfxAt(t.gx+.5,t.gz+.5,SND.rake);if(Math.hypot(pl.x-fx,pl.z-fz)<20)burst(fx,1,fz,3,1.8);emit(t,r.n,r.ones);cnt.set(tkey(t.gx,t.gz),(cnt.get(tkey(t.gx,t.gz))||0)+1)}}
    }
    if(T==='arm'||T==='arm2'||T==='arm3'){
      const B=BIT[T];t.cool-=dt*pw*(1+.1*lv('armSpd')+bonus('arm'));if(t.arm)t.arm.rotation.y=Math.sin(now/400)*1.2;
      if(t.cool<=0){t.cool=3;const[dx,dz]=DIRS[t.dir],ox=t.gx+dx,oz=t.gz+dz,ot=cellAt(tkey(ox,oz,t.L));
        // 手臂連輸送帶：從後面的輸送帶拿，放到前面的輸送帶
        if(t.from&&t.from!=='pile'&&lv('links')){
          const sx=t.gx-dx,sz=t.gz-dz,src=cellAt(tkey(sx,sz,t.L));
          if(!src||!BELTLIKE.has(src.type)){t.status='後面要接一條輸送帶（從那條拿）';continue}
          if(!ot||!BELTLIKE.has(ot.type)){t.status='箭頭前面要接輸送帶';continue}
          if(t.from==='over'){const[ex,ez]=DIRS[src.dir],nk=tkey(sx+ex,sz+ez,t.L);if((cnt.get(tkey(sx,sz,t.L))||0)<3||((cnt.get(nk)||0)<5&&occ.has(nk))){t.status='輸送帶沒塞住，先不拿';continue}}
          const K=t.kinds&&t.kinds.length?t.kinds:null,cand=items.filter(i=>i.belt&&(i.L||0)===t.L&&Math.floor(i.x)===sx&&Math.floor(i.z)===sz&&(!K||K.includes(kindOf(i))));
          if(!cand.length){t.status='輸送帶上沒有要拿的東西';continue}
          if((cnt.get(tkey(ox,oz,t.L))||0)>=4){t.status='前面的輸送帶塞住了';continue}
          const ord=lv('pickOrder')?t.order||'loose':'loose';
          cand.sort((a,b)=>((b.ones?1:0)-(a.ones?1:0))||(ord==='big'?b.n-a.n:ord==='near'?Math.hypot(a.x-t.gx-.5,a.z-t.gz-.5)-Math.hypot(b.x-t.gx-.5,b.z-t.gz-.5):(a.prod?1:0)-(b.prod?1:0)));
          const it=cand[0];items.splice(items.indexOf(it),1);it.sd=null;landItem(it,ox,oz,t.L);t.status='';continue}
        let px_=t.gx+.5,pz_=t.gz+.5,ok=false;
        // 從最遠伸到最近，找得到硬幣堆就抓
        for(const[ax,az]of[[-dx,-dz],[dz,-dx],[-dz,dx]]){for(let rr=B.reach;rr>=1;rr-=.6){if(nearPile(px_+ax*rr,pz_+az*rr,1)){px_+=ax*rr;pz_+=az*rr;ok=true;break}}if(ok)break}
        if(!ok){t.status='手臂碰不到硬幣（'+B.reach+' 公尺內）';continue}
        if(!ot||!BELTLIKE.has(ot.type)){t.status='箭頭前面要接輸送帶';continue}
        t.status='';sfxAt(t.gx+.5,t.gz+.5,SND.arm);const r=takeCoins(px_,1,pz_,Math.round(B.take*(1+.08*lv('armCarry'))));if(r.n)items.push({x:ox+.5,z:oz+.5,y:.42,n:r.n,ones:r.ones,belt:true});
      }
    }
    if(T==='pusher'){
      t.cool-=dt*pw;if(t.anim)t.anim.position.z=(t.animZ??.55)+Math.max(0,Math.sin(now/200))*.15;
      if(t.cool<=0){t.cool=.5;const[dx,dz]=DIRS[t.dir],fx=t.gx+.5-dx*1.6,fz=t.gz+.5-dz*1.6;
        const e=items.find(e=>!e.belt&&!e.prod&&Math.hypot(e.x-fx,e.z-fz)<2.5);
        if(e&&room(t)){items.splice(items.indexOf(e),1);const n=Math.min(e.n,120);if(e.n>n){e.n-=n;items.push(e)}emit(t,n,e.n>n?0:e.ones);if(e.n<=n)e.ones=0;t.status=''}else t.status=e?'後面塞住了':'前面地上沒有硬幣'}
    }
    const P=PROCS[T];
    if(P){
      const wr=BIT[T].water?t.wr:1;
      if(t.outQ.length){if(room(t)){const o=t.outQ.shift();emit(t,o.n,0,o.prod,T==='pellet'&&t.outSide&&lv('swivel')?(t.outSide===1?(t.dir+3)%4:(t.dir+1)%4):null);cnt.set(tkey(t.gx,t.gz),(cnt.get(tkey(t.gx,t.gz))||0)+1);t.status=''}else t.status='出口塞住了'}
      if(t.prog>0){
        if(wr<=0)t.status='沒有水，要用水管接到抽水機';
        else{t.prog-=dt*pw*Math.min(1,wr)*procSpeed(T);if(!t.outQ.length)t.status=wr<1?'水不夠（'+Math.round(wr*100)+'%）':'';if(t.anim)t.anim.position.y=t.animY-Math.max(0,Math.sin(now/180))*.18;
          if(t.prog<=0){t.prog=0;t.outQ.push({n:t.jobN,prod:P.out});t.jobN=0;sfxAt(t.gx+.5,t.gz+.5,SND.press)}}
      }else if(t.outQ.length<2){
        const n1=P.need();
        if(t.buf>=n1&&(!P.inp2||t.buf2>=P.need2())){
          let n;if(P.inp){n=Math.round(t.bufN/t.buf*n1);t.buf-=n1;t.bufN-=n}else{n=n1;t.buf-=n1;t.bufN-=n1}
          if(P.inp2){const n2=P.need2(),m=Math.round(t.bufN2/t.buf2*n2);t.buf2-=n2;t.bufN2-=m;n+=m}
          t.jobN=n;t.prog=P.time}
      }
    }
    if(T==='dish'){ // 衛星天線：每隔一段時間標出 45 公尺內埋著的 1 元
      const mk=dishMk(),iv=[60,30,15,8][mk-1],per=[1,1,2,4][mk-1];if(t.anim)t.anim.rotation.y+=dt*.6*pw;
      t.cool-=dt*pw;t.status='Mk '+['I','II','III','IV'][mk-1]+'・下一次掃描 '+Math.max(0,Math.ceil(t.cool))+' 秒・已標 '+[...G.marked].filter(i=>anchors.has(i)).length+' 枚';
      if(t.cool<=0){t.cool=iv;const c=[...anchors].filter(i=>!G.marked.includes(i)&&Math.hypot(px[i]-t.gx-.5,pz[i]-t.gz-.5)<45).sort((a,b)=>Math.hypot(px[a]-t.gx,pz[a]-t.gz)-Math.hypot(px[b]-t.gx,pz[b]-t.gz)).slice(0,per);
        if(c.length){G.marked.push(...c);toast('衛星天線標出了 '+c.length+' 枚埋著的 1 元（紅色記號）','gold');tone(1200,.1,'sine',.04)}}
    }
    if(T==='switch'&&t.lights)t.lights.forEach((l,k)=>l.material.color.setHex(G.tags[k].on?0x33ff66:0xaa2222));
    if(T==='pump'&&t.anim)t.anim.position.y=t.animY-Math.sin(now/400)*(t.beam?.2:-.15);
    if(T==='silo'){
      const lpm=Math.min(t.lpm??10,siloTop());
      if(t.store>0&&lpm>0&&room(t)){t.acc+=lpm/60*dt*pw;
        if(t.acc>=1){t.acc-=1;const n=Math.min(t.store,siloLoad());let o=0;for(let k=0;k<t.sOnes;k++)if(Math.random()<n/t.store)o++;t.store-=n;t.sOnes-=o;emit(t,n,o);cnt.set(tkey(t.gx,t.gz),(cnt.get(tkey(t.gx,t.gz))||0)+1)}}
      t.status=lpm?'':'放料關閉中（按 E 調整）';
    }
    if(T==='drone')updateDrone(t,dt,now);
  }
  const sp=beltSpeed();
  for(let n=items.length-1;n>=0;n--){
    const it=items[n];if(!it.belt)continue;
    const gx=Math.floor(it.x),gz=Math.floor(it.z),IL=it.L||0,t=cellAt(tkey(gx,gz,IL));
    if(!t||t.type==='sell'||t.type==='dock'){if(IL>0){items.splice(n,1);landItem(it,gx,gz,IL-1)}else{it.belt=false;it.y=standAt(it.x,it.z,.1)}continue}
    const dir=it.sd!=null?it.sd:t.dir,[dx,dz]=DIRS[dir],cx=gx+.5,cz=gz+.5,kk=Math.min(1,dt*8);
    if(dx)it.z+=(cz-it.z)*kk;else it.x+=(cx-it.x)*kk;
    let nx=it.x+dx*sp*dt,nz=it.z+dz*sp*dt;const ngx=Math.floor(nx),ngz=Math.floor(nz);
    const passed=((nx-cx)*dx+(nz-cz)*dz)>0;
    if(SCANS.has(t.type)&&it.sk!==t&&passed){
      const dc=drawerCap(t);
      // Mk I：抽屜滿了，整條輸送帶停在掃描器這裡，等人來清
      if(t.type==='scanner'&&t.pw>0&&t.bin>=dc){t.status='抽屜滿了，走過去按 E 拿出 1 元';t.flash=Math.max(t.flash,.3);if(dx)it.x=cx;else it.z=cz;continue}
      if(t.pw<=0){it.sk=t}
      else if(t.load>t.cap*4){it.sk=t;t.status='太多了，有些沒掃到';t.flash=Math.max(t.flash,.3)}
      else{t.load+=it.n;t.status='';
        if(it.ones){
          const fit=Math.min(it.ones,dc-t.bin),rest=it.ones-fit;t.bin+=fit;it.ones=rest;
          if(rest&&t.type==='scanner2'){const p=trayPos(t);for(let k=0;k<rest;k++)oneObjs.push({x:p.x+(k%3-1)*.1,y:.48+.04*k,z:p.z});it.ones=0}
          toast(t.type==='detector'?'一元偵測機抓到了 1 元！走過去按 E 拿出來':rest&&t.type==='scanner2'?'抽屜滿了，1 元放到旁邊的托盤，去撿起來':'掃描器抓到了 1 元！走過去按 E 拿出來','gold');
          t.flash=3;buzz([40,40,90]);tone(988,.25,'square',.05);setTimeout(()=>tone(988,.25,'square',.05),300)}
        if(!it.ones)it.sk=t}
    }
    if(t.type==='gate'&&t.closed&&passed){if(dx)it.x=cx;else it.z=cz;continue}
    if(t.type==='tube'&&passed&&t.pw>0){items.splice(n,1);launchItem(it,t,t.dist||8);continue}
    if((t.type==='lift'&&t.pw>0||t.type==='hstairs')&&passed&&t.L<3){items.splice(n,1);liftItem(it,t);continue}
    if(ngx!==gx||ngz!==gz){
      const nk=tkey(ngx,ngz,IL),nt=cellAt(nk),here=tkey(gx,gz,IL);
      if(nt&&nt!==it.from&&accepts(nt,it)&&(cnt.get(nk)||0)<6){
        const r=enterTile(it,nt);cnt.set(here,(cnt.get(here)||1)-1);
        if(r==='gone'){items.splice(n,1);continue}
        cnt.set(nk,(cnt.get(nk)||0)+1);it.from=null;
      }else if(!nt&&IL>0&&!deckAt(ngx,ngz,IL)){ // 架高的輸送帶尾端沒接東西：往下掉
        items.splice(n,1);cnt.set(here,(cnt.get(here)||1)-1);it.sd=null;landItem(it,ngx,ngz,IL-1);continue}
      else{t.jamT=now;if(dx)nx=dx>0?gx+.97:gx+.03;if(dz)nz=dz>0?gz+.97:gz+.03}
    }
    it.x=nx;it.z=nz;
  }
  for(const t of tiles.values())if(t.type==='lift'&&t.anim)t.anim.position.y+=(t.animY-t.anim.position.y)*Math.min(1,dt*3);
  beltTex.offset.y-=dt*sp;
  updateTruck(dt);
}
// ---------- 運幣無人機 ----------
function updateDrone(t,dt,now){
  const d=t.dm;if(!d)return;d.rotors.forEach((r,k)=>r.rotation.y+=dt*40);
  const home=new THREE.Vector3(t.cx,.4,t.cz);
  if(!t.drop){t.status='還沒設定放料點（看著它按 E 設定）';d.position.lerp(home,Math.min(1,dt*3));return}
  const dt2=new THREE.Vector3(t.drop.gx+.5,2.2,t.drop.gz+.5),sp=6*(1+.25*lv('droneSpd')+bonus('drone'))*dt;
  const fly=(target,up)=>{const v=target.clone().sub(d.position);const l=v.length();if(l<=sp){d.position.copy(target);return true}d.position.add(v.multiplyScalar(sp/l));return false};
  if(t.ds==='idle'){t.cool-=dt;if(t.cool>0)return;
    // 無人機撿東西：先撿停機坪附近地上的加工品
    const zr=3.2+.5*lv('droneRange');
    if(lv('dronePick')){const pr=items.find(e=>e.prod&&!e.belt&&Math.hypot(e.x-t.gx-.5,e.z-t.gz-.5)<zr);if(pr){t.cargo=pr;t.pick=new THREE.Vector3(pr.x,.7,pr.z);t.ds='toPick';t.status='';return}}
    if(!nearPile(t.cx,t.cz,zr)){t.status='停機坪 '+zr.toFixed(1)+' 公尺內沒有硬幣';t.cool=1;return}
    if(HFm){let bh=0,bx=0,bz=0;for(let k=0;k<16;k++){const a=k/16*6.283,x=t.cx+Math.cos(a)*2.5,z=t.cz+Math.sin(a)*2.5,h=hfAt(x,z);if(h>bh){bh=h;bx=x;bz=z}}
      if(bh<.3){t.cool=1;return}t.pick=new THREE.Vector3(bx,bh+.5,bz)}
    else{let best=null,bd=1e9;near(t.cx,t.cz,3.2,i=>{if(st[i]===1&&vis[i]){const dd=Math.hypot(px[i]-t.gx-.5,pz[i]-t.gz-.5);if(dd<bd){bd=dd;best=i}}});
      if(best==null){t.cool=1;return}
      t.pick=new THREE.Vector3(px[best],py[best]+.5,pz[best])}
    t.ds='toPick';t.status=''}
  if(t.ds==='toPick'&&fly(t.pick)){
    if(t.cargo){const k=items.indexOf(t.cargo);if(k>=0&&!t.cargo.belt){items.splice(k,1);t.ds='toDrop'}else{t.cargo=null;t.ds='back'}}
    else{const r=takeCoins(t.pick.x,t.pick.y,t.pick.z,60);t.load=r.n;t.ld1=r.ones;t.ds='toDrop'}d.bin&&(d.bin.visible=true)}
  if(t.ds==='toDrop'&&fly(dt2)){
    const it=t.cargo||{n:t.load,ones:t.ld1,x:0,z:0,y:.42,belt:true};
    landItem(it,t.drop.gx,t.drop.gz);t.load=0;t.ld1=0;t.cargo=null;t.ds='back'}
  if(t.ds==='back'&&fly(new THREE.Vector3(home.x,2,home.z))){t.ds='land'}
  if(t.ds==='land'&&fly(home)){t.ds='idle';t.cool=.3}
}
// ---------- 出貨卡車 ----------
const truck={g:null,x:0,state:'park',t:0,load:0};
function buildTruck(){
  const g=new THREE.Group(),red=new THREE.MeshStandardMaterial({color:0xa8261c,metalness:.4,roughness:.45});
  partBox(g,2.2,1.6,1.8,red,0,1.3,-2.6);partBox(g,2,.6,.05,new THREE.MeshStandardMaterial({color:0x223344,metalness:.9,roughness:.1}),0,1.65,-3.52);
  partBox(g,2.3,.25,4.2,M_.dark,0,.75,.6);partBox(g,2.3,.5,4.2,texMat(M_.wood,2,1),0,1.05,.6);
  for(const[x,z]of[[-1.05,-2.5],[1.05,-2.5],[-1.05,1.6],[1.05,1.6]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.3,16),M_.dark);w.rotation.z=Math.PI/2;w.position.set(x,.42,z);g.add(w)}
  const cargo=new THREE.Group();g.add(cargo);g.cargo=cargo;
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});linColors(g);
  return g;
}
function updateTruck(dt){
  if(!truck.g)return;truck.t+=dt;
  if(truck.state==='leave'){truck.x+=dt*6;if(truck.x>40){truck.state='arrive';truck.load=0;truck.g.cargo.clear()}}
  else if(truck.state==='arrive'){truck.x=Math.max(0,truck.x-dt*6);if(truck.x<=0)truck.state='park'}
  truck.g.position.x=truck.base+truck.x;
  const want=Math.min(24,truck.load);
  while(truck.g.cargo.children.length<want){const k=truck.g.cargo.children.length,b=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.5,10),rollMesh.material);b.rotation.z=Math.PI/2;b.position.set(-.8+(k%4)*.5,1.45+Math.floor(k/12)*.27,-.6+Math.floor(k/4)%3*.6);truck.g.cargo.add(b)}
}

