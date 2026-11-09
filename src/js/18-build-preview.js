// ================= 建造預覽：真的機器樣子、整條輸送帶路線 =================
// 預覽用半透明的真機器（綠色＝可以放、紅色＝不行）
const ghostMat=share(new THREE.MeshBasicMaterial({color:0x44ff66,transparent:true,opacity:.5,depthWrite:false,toneMapped:false}));
let ghostItem=null,ghostModel=null,ghostTmp=null;
function setGhostModel(id){
  if(ghostItem===id)return;ghostItem=id;
  if(ghostModel){ghost.remove(ghostModel);disposeObj(ghostModel);if(ghostTmp&&ghostTmp.tex)ghostTmp.tex.dispose();ghostModel=null}
  const b=id&&BIT[id];if(!b||b.st||b.layer==='pipe')return;
  try{ghostTmp={type:id,gx:0,gz:0,dir:0,L:0,q:[],outQ:[],n:0,buf:0,bufN:0,buf2:0,bufN2:0};const g=makeTileMesh(ghostTmp);g.position.set(0,0,0);g.rotation.set(0,0,0);
    const rm=[];g.traverse(o=>{if(o.isLight)rm.push(o);if(o.isMesh){if(!SHARED.has(o.material))o.material.dispose();o.material=ghostMat;o.castShadow=o.receiveShadow=false;o.renderOrder=2}});
    rm.forEach(o=>o.parent.remove(o));addGhostIO(g,id);ghost.add(g);ghostModel=g}catch(e){ghostModel=null}
}
// 輸送帶路線：先走一個方向，到轉角再轉彎（R 換成先走另一個方向）
function beltRoute(a,c){
  const dx=c.gx-a.gx,dz=c.gz-a.gz;
  if(!dx&&!dz)return[{gx:a.gx,gz:a.gz,dir:G.build.dir}];
  let xFirst=Math.abs(dx)>=Math.abs(dz);if(G.build.flip)xFirst=!xFirst;if(!dx)xFirst=false;if(!dz)xFirst=true;
  const legs=xFirst?[['x',dx],['z',dz]]:[['z',dz],['x',dx]],out=[];let x=a.gx,z=a.gz;
  for(const[ax,n]of legs){if(!n)continue;const s=Math.sign(n),d=ax==='x'?(s>0?1:3):(s>0?2:0);
    for(let k=0;k<Math.abs(n);k++){out.push({gx:x,gz:z,dir:d});if(ax==='x')x+=s;else z+=s}}
  out.push({gx:x,gz:z,dir:out[out.length-1].dir});
  return out}
// 從一條輸送帶的尾巴接著蓋：尾巴那格自動轉向，硬幣才會轉過去
function startTurn(route,L0){
  if(route.length<2||!BELTLIKE.has(G.build.item))return null;const f=route[0],ex=cellAt(tkey(f.gx,f.gz,L0));
  if(!ex||(ex.type!=='belt'&&ex.type!=='beltC')||ex.dir===f.dir)return null;
  const[fx,fz]=DIRS[ex.dir];if(occ.has(tkey(ex.gx+fx,ex.gz+fz,L0)))return null;return ex}
// 整條路線的預覽：綠色會蓋、紅色那格已經有東西會跳過、黃色是會轉向的尾巴
const PATH_MAX=400;
const pathTex=canvasTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.62)';g.fillRect(3,0,w-6,h);g.strokeStyle='#fff';g.lineWidth=7;g.lineCap='square';g.beginPath();g.moveTo(16,40);g.lineTo(32,24);g.lineTo(48,40);g.stroke()});
const pathMesh=new THREE.InstancedMesh(beltGeo,share(new THREE.MeshBasicMaterial({map:pathTex,transparent:true,opacity:.9,depthWrite:false,toneMapped:false})),PATH_MAX);
pathMesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(PATH_MAX*3),3);pathMesh.count=0;pathMesh.frustumCulled=false;pathMesh.renderOrder=3;scene.add(pathMesh);
const startMark=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1.4,10),new THREE.MeshBasicMaterial({color:0xffd04a,transparent:true,opacity:.8,depthWrite:false,toneMapped:false}));startMark.visible=false;scene.add(startMark);
const _pm=new THREE.Matrix4(),_pq=new THREE.Quaternion(),_pc=new THREE.Color(),_ps=new THREE.Vector3(1,1,1),_pp=new THREE.Vector3();
function showPath(route,fr,L0,turn){
  const n=Math.min(PATH_MAX,route.length);
  for(let i=0;i<n;i++){const c=route[i];_pp.set(c.gx+.5,L0*LH+.37,c.gz+.5);_pq.setFromAxisAngle(UP,-c.dir*Math.PI/2);_pm.compose(_pp,_pq,_ps);pathMesh.setMatrixAt(i,_pm);
    _pc.setHex(i===0&&turn?0xffd04a:fr[i]?0x66ff88:0xff5544);pathMesh.setColorAt(i,_pc)}
  pathMesh.count=n;pathMesh.instanceMatrix.needsUpdate=true;pathMesh.instanceColor.needsUpdate=true;
  startMark.visible=true;startMark.position.set(route[0].gx+.5,L0*LH+.7,route[0].gz+.5)}
function hidePath(){pathMesh.count=0;startMark.visible=false}
function ensureGhost(){
  if(ghost)return;ghost=new THREE.Group();
  const b=new THREE.Mesh(new THREE.BoxGeometry(.98,.6,.98),new THREE.MeshBasicMaterial({color:0x44ff66,transparent:true,opacity:.3,depthWrite:false}));b.position.y=.3;ghost.add(b);ghost.box=b;
  const ar=new THREE.Mesh(new THREE.ConeGeometry(.22,.4,3),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}));ar.rotation.x=-Math.PI/2;ar.position.set(0,.7,-.2);ghost.add(ar);
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.35,1.45,40),new THREE.MeshBasicMaterial({color:0x44ff66,transparent:true,opacity:.6,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(0,.02,2.5);ghost.add(ring);ghost.ring=ring;
  const ring2=new THREE.Mesh(new THREE.RingGeometry(.97,1,72),new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:.7,side:THREE.DoubleSide}));ring2.rotation.x=-Math.PI/2;ring2.position.y=.03;ghost.add(ring2);ghost.ring2=ring2;
  scene.add(ghost);
}
// 對準的格子：先看平台頂面，沒有就是地面；輸送帶和線條類可以用滾輪架高
function buildAim(){
  const R=topV?999:buildReach(),{o,d}=camRay(0);let best=null,bt=R;
  if(d.y<-.02)for(const s of structs){if(s.kind!=='platform')continue;const y=s.L*LH;if(o.y<=y)continue;const t=(y-o.y)/d.y;if(t>bt)continue;const x=o.x+d.x*t,z=o.z+d.z*t,gx=Math.floor(x),gz=Math.floor(z);
    if(gx>=s.x0&&gx<=s.x1&&gz>=s.z0&&gz<=s.z1){bt=t;best={gx,gz,L:s.L,deck:true}}}
  if(best)return best;
  // 拉近推遠：滾輪或 C／V 調過距離之後，預覽就固定在前方那個距離
  let p;if(G.build&&G.build.near!=null){const D=Math.min(R,G.build.near);p={x:pl.x-Math.sin(pl.yaw)*D,z:pl.z-Math.cos(pl.yaw)*D}}else p=groundAim(R);if(!p)return null;
  const b=G.build&&BIT[G.build.item],lvl=G.build?G.build.lvl||0:0;
  return{gx:Math.floor(p.x),gz:Math.floor(p.z),L:b&&(BELTLIKE.has(b.id)||LINES[b.id])&&b.id!=='pipe'?lvl:b&&b.st==='rect'?Math.max(1,lvl):0};
}
function inYardFree(gx,gz){
  const x=gx+.5,z=gz+.5;
  if(x<-H-EXT+1||x>H-1||z>H-1||z<-H+1)return false;
  for(const o of obstacles){const dx=x-o.x,dz=z-o.z;if(dx*dx+dz*dz<(o.r+.45)*(o.r+.45))return false}
  return true;
}
// item：要蓋的東西（機器不能蓋在水管上，輸送帶可以）
function tileFree(gx,gz,item,L){
  L=L||0;
  if(occ.has(tkey(gx,gz,L)))return false;
  if(!L&&item&&SOLID.has(item)&&pipes.has(tkey(gx,gz)))return false;
  // 牆：一般的牆什麼都不能放，窗牆和門口可以讓輸送帶穿過去
  const w=wallCells.get(tkey(gx,gz));if(w&&(w==='wall'||!item||!BELTLIKE.has(item)))return false;
  // 架高：機器一定要放在平台上，輸送帶可以用支柱架高
  if(L>0&&!deckAt(gx,gz,L)&&!(item&&BELTLIKE.has(item)))return false;
  return inYardFree(gx,gz);
}
function pipeFree(gx,gz){const t=cellAt(tkey(gx,gz));return !pipes.has(tkey(gx,gz))&&!(t&&(SOLID.has(t.type)||t.type==='sell'||t.type==='dock'))&&inYardFree(gx,gz)}
// 點兩下拉一條線的東西：輸送帶、封閉式輸送帶、水管
const LINES={
  belt:{name:'輸送帶',cost:()=>Math.round(8*wasteMul()*100)/100,free:(x,z,L)=>tileFree(x,z,'belt',L),place:(c,p,L)=>addTile('belt',c.gx,c.gz,c.dir,p,{L})},
  beltC:{name:'封閉式輸送帶',cost:()=>Math.round(12*wasteMul()*100)/100,free:(x,z,L)=>tileFree(x,z,'beltC',L),place:(c,p,L)=>addTile('beltC',c.gx,c.gz,c.dir,p,{L})},
  pipe:{name:'水管',cost:()=>Math.round(14*disc()*100)/100,free:pipeFree,place:(c,p)=>addPipe('pipe',c.gx,c.gz,c.dir,p)}
};
const freeFor=(b,gx,gz,L,dir)=>b.layer==='pipe'?pipeFree(gx,gz):dir==null||!FP[b.id]?tileFree(gx,gz,b.id,L):fpFree(b.id,gx,gz,dir,L);
// 蓋房子的東西：點兩下（平台是兩個角、樓梯是平台邊和落腳處、其他是一條線）
function structPlan(b,a,c){
  const W=wasteMul();
  if(b.st==='rect'){const L=a.L||1,x0=Math.min(a.gx,c.gx),x1=Math.max(a.gx,c.gx),z0=Math.min(a.gz,c.gz),z1=Math.max(a.gz,c.gz),n=(x1-x0+1)*(z1-z0+1);
    let ok=true;for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)if(!inYardFree(x,z)||deckAt(x,z,L))ok=false;
    return{ok,cost:Math.round(n*b.price*W*100)/100,s:{kind:'platform',x0,x1,z0,z1,L},txt:(x1-x0+1)+'×'+(z1-z0+1)+' 公尺・高 '+(L*LH)+' 公尺'}}
  if(b.st==='stairs'){const L=deckLevelAt(a.gx,a.gz);if(!L)return{ok:false,cost:0,txt:'先點平台的邊'};
    const dx=c.gx-a.gx,dz=c.gz-a.gz;if(dx&&dz||!dx&&!dz)return{ok:false,cost:0,txt:'落腳處要跟平台邊在同一直線上'};
    const n=Math.abs(dx||dz),d=dx>0?1:dx<0?3:dz>0?2:0;if(n<2)return{ok:false,cost:0,txt:'離平台太近了'};
    return{ok:true,cost:Math.round(b.price*L*LH*W*100)/100,s:{kind:'stairs',lx:c.gx,lz:c.gz,d:(d+2)%4,n,L},txt:'高 '+(L*LH)+' 公尺・長 '+n+' 公尺'}}
  const line=beltLine(a,c),ax=line.length>1?(line[0].dir%2?1:0):(G.build.dir%2?1:0);
  if(b.id==='railing'){const L=deckLevelAt(a.gx,a.gz);if(!L)return{ok:false,cost:0,txt:'欄杆要沿著平台的邊蓋'};
    return{ok:line.every(p=>deckAt(p.gx,p.gz,L)),cost:Math.round(line.length*b.price*W*100)/100,s:{kind:'railing',cells:line.map(p=>[p.gx,p.gz]),L},txt:line.length+' 公尺'}}
  if(b.id==='wall'||b.id==='window'||b.id==='door')
    return{ok:line.every(p=>inYardFree(p.gx,p.gz)&&!wallCells.has(tkey(p.gx,p.gz))&&!occ.has(tkey(p.gx,p.gz))),cost:Math.round(line.length*b.price*W*100)/100,s:{kind:b.id,cells:line.map(p=>[p.gx,p.gz,ax])},txt:line.length+' 公尺'};
  // 屋頂：沿著線往箭頭方向蓋進去 2 公尺；天窗在中間留一個洞
  const[ux,uz]=DIRS[G.build.dir],cells=[];line.forEach((p,i)=>{for(let r=0;r<2;r++)cells.push([p.gx+ux*r,p.gz+uz*r,b.id==='hatch'&&r===1&&i===Math.floor(line.length/2)?1:0,b.id==='roofA'?r*.5+.25:0])});
  return{ok:true,cost:Math.round(line.length*b.price*W*100)/100,s:{kind:b.id,cells,d:G.build.dir},txt:line.length+' 公尺・往箭頭方向 2 公尺'};
}
// 同一組的東西一起算數量（三種機械手臂共用 48 支的上限，每多一支更貴）
function groupCount(b){return b.group?BUILD.filter(x=>x.group===b.group).reduce((s,x)=>s+countType(x.id),0):countType(b.id)}
const disc=()=>1-bonus('cost');
const beltCost=()=>Math.round(8*disc()*100)/100;
function buildCost(id){const b=BIT[id];
  if(id==='pole'&&G.freePole)return 0;
  if(id==='rake'){if(G.freeRake)return 0;return Math.round(b.price*Math.pow(b.grow,Math.max(0,countType('rake')-(G.gotFreeRake?1:0)))*disc()*100)/100}
  return Math.round(b.price*(b.grow?Math.pow(b.grow,groupCount(b)):1)*disc()*100)/100}
function beltLine(a,b){const dx=b.gx-a.gx,dz=b.gz-a.gz,ax=Math.abs(dx)>=Math.abs(dz),n=ax?Math.abs(dx):Math.abs(dz),s=ax?Math.sign(dx):Math.sign(dz),dir=ax?(s>0?1:3):(s>0?2:0),out=[];for(let k=0;k<=n;k++)out.push({gx:a.gx+(ax?k*s:0),gz:a.gz+(ax?0:k*s),dir:n?dir:G.build.dir});return out}
function updateBuild(){
  ensureGhost();aimTile=buildAim();hidePath();setPreviewWires([]);
  showCoverage(!G.build.remove&&!G.build.dropFor&&!G.build.bp&&(pwrOf({type:G.build.item})>0||PWR_ITEMS.has(G.build.item)));
  if(G.build.bp){setGhostModel(null);ghost.box.visible=true;if(aimTile){ghost.position.set(aimTile.gx+.5,0,aimTile.gz+.5)}bpUpdate();return}
  const b=BIT[G.build.item];let txt='';
  if(!aimTile){ghost.visible=false;$('buildHint').innerHTML='<b>'+(G.build.dropFor?'設定放料點':G.build.remove?'拆除':b.name)+'</b><br>對準地面';return}
  const AL=aimTile.L||0;
  gridHelper.visible=!!G.showGrid;if(G.showGrid)gridHelper.position.set(aimTile.gx+.5,AL*LH+.03,aimTile.gz+.5);
  ghost.visible=true;ghost.position.set(aimTile.gx+.5,AL*LH,aimTile.gz+.5);ghost.rotation.y=-G.build.dir*Math.PI/2;
  ghost.ring.visible=G.build.item==='rake'&&!G.build.remove&&!G.build.dropFor;
  const rr=G.build.remove?0:G.build.dropFor?droneRange():b.id==='pole'?dropR():b.id==='cbox'?10+lv('drops'):isGen({type:b.id})?3.2:b.reach||0;
  if(G.build.dropFor){ghost.ring2.visible=true;ghost.ring2.scale.set(rr,rr,1);ghost.ring2.position.set(G.build.dropFor.gx-aimTile.gx,.03,G.build.dropFor.gz-aimTile.gz).applyAxisAngle(UP,G.build.dir*Math.PI/2)}else ghost.ring2.position.set(0,.03,0);ghost.ring2.visible=rr>0;ghost.ring2.scale.set(rr,rr,1);
  const ex=cellAt(tkey(aimTile.gx,aimTile.gz,AL))||cellAt(tkey(aimTile.gx,aimTile.gz));let ok;
  const lvTxt=AL?'　<span style="color:#9cf">高 '+(AL*LH)+' 公尺</span>':'';
  if(G.build.remove||G.build.dropFor){setGhostModel(null);ghost.box.visible=true}
  if(G.build.dropFor){const pad=G.build.dropFor,dd=Math.hypot(aimTile.gx-pad.gx,aimTile.gz-pad.gz),far=dd>droneRange();ok=!far&&!!ex&&(BELTLIKE.has(ex.type)||ex.type==='sell'||ex.type==='dock');ghost.box.material.color.setHex(far?0xff4444:ok?0x44ff66:0xffaa33);$('buildHint').innerHTML='<b>設定運幣無人機的放料點</b>　離停機坪 '+dd.toFixed(1)+' / '+droneRange().toFixed(1)+' 公尺<br>'+(far?'<span class="r">太遠了</span>':ok?'左鍵設在這裡':'點輸送帶、卸料口或收購站比較好（放在地上也可以）')+'<br>B／Esc 離開';return}
  if(G.build.remove){const ep=pipes.get(tkey(aimTile.gx,aimTile.gz)),sx=structAt(aimTile.gx,aimTile.gz),tg=ex&&ex.type!=='sell'&&ex.type!=='dock'?ex:ep||sx;ok=!!tg;ghost.box.material.color.setHex(ok?0xff6644:0x888888);
    const nm=tg?(BIT[tg.type]||BIT[tg.kind]||{}).name||'':'';$('buildHint').innerHTML='<b class="r">拆除模式</b><br>'+(ok?'左鍵拆掉「'+nm+'」，退還 '+money(tg.paid||0):'對準要拆的東西')+'<br>X 切回建造・B／Esc 離開';return}
  const LN=LINES[G.build.item];
  if(b.st){ // 平台、樓梯、欄杆、牆、屋頂
    if(beltStart){const P=structPlan(b,beltStart,aimTile);ok=P.ok&&G.money>=P.cost;txt='<b>'+b.name+'</b>　'+P.txt+'<br><span class="'+(ok?'':'r')+'">'+money(P.cost)+'</span><br>再點一下確定・右鍵取消'}
    else{ok=true;txt='<b>'+b.name+'</b>'+(b.st==='rect'?'　高 '+(Math.max(1,G.build.lvl||1)*LH)+' 公尺（PageUp／PageDown 調整）':'')+'<br>'+(b.st==='rect'?'點第一個角':b.st==='stairs'?'先點平台的邊':'點一下定起點')+(b.id.startsWith('roof')||b.id==='hatch'?'・R 轉屋頂往哪邊蓋':'')+'・X 拆除・B／Esc 離開'}}
  else if(LN&&beltStart){const L0=beltStart.L||0,route=beltRoute(beltStart,aimTile),fr=route.map(c=>LN.free(c.gx,c.gz,L0)),nf=fr.filter(Boolean).length,cost=nf*LN.cost(),turn=startTurn(route,L0),corner=route.some((c,i)=>i&&c.dir!==route[i-1].dir);ok=G.money>=cost;
    showPath(route,fr,L0,turn);ghost.visible=false;
    txt='<b>'+LN.name+'</b>　'+nf+' 公尺'+(L0?'　高 '+(L0*LH)+' 公尺':'')+'　<span class="'+(ok?'':'r')+'">'+money(cost)+'</span>'+(nf+(turn?1:0)<route.length?'<br><span style="color:#ff8a7a">紅色的格子不能蓋（已經有東西或在牆外），會跳過</span>':'')+(turn?'<br><span style="color:#ffd04a">黃色那格會轉向接上</span>':'')+'<br>'+(corner?'R 換轉彎方向・':'')+'放開滑鼠或再點一下定終點・右鍵取消'}
  else{const ad=autoDir(aimTile.gx,aimTile.gz,b.id,AL),bd=ad!=null?ad:G.build.dir,an=b.layer==='pipe'?aimTile:fpAnchor(b.id,aimTile.gx,aimTile.gz,bd);ghost.position.set(an.gx+.5,AL*LH,an.gz+.5);ghost.rotation.y=-bd*Math.PI/2;G.build.an={gx:an.gx,gz:an.gz,dir:bd};
    const c=LN?LN.cost():buildCost(G.build.item),pw=pwrOf({type:b.id}),fr=freeFor(b,an.gx,an.gz,AL,bd);ok=fr&&G.money>=c&&!(b.max&&groupCount(b)>=b.max);
    txt='<b>'+b.name+'</b>　'+(fr?'對準地面':'<span class="r">'+(AL&&!BELTLIKE.has(b.id)&&!deckAt(aimTile.gx,aimTile.gz,AL)?'機器要放在平台上':'這裡不能放')+'</span>')+lvTxt+(BELTLIKE.has(b.id)||LN?'（PageUp／PageDown 架高）':'')+'<br><span class="'+(G.money>=c?'':'r')+'">'+(c?money(c):'免費')+'</span>'+(LN?'／每公尺':'')+(b.grow?'　每多一台貴'+Math.round((b.grow-1)*100)+'%　'+groupCount(b)+'/'+b.max:b.max>1?'　'+groupCount(b)+'/'+b.max:'')+(pw?'　耗電 '+pw+'kW（目前 '+power.dem+'/'+power.sup+'kW）':'')+(b.water?'　用水每秒 '+b.water+' 公升':'')+'<br>'+(LN?'點一下定起點（或按住拖到終點）':'左鍵放置')+'・R 旋轉・F 吸附：'+(G.build.free?'關':'開')+'・X 拆除・B／Esc 離開';if(b.layer!=='pipe')txt+=powerPreview(b.id,an,bd,AL)}
  ghost.box.material.color.setHex(ok?0x44ff66:0xff4444);$('buildHint').innerHTML=txt;
  setGhostModel(b.st?null:G.build.item);ghost.box.visible=!ghostModel;ghostMat.color.setHex(ok?0x44ff66:0xff4444);
}
function buildClick(){undoBegin();try{buildClick0()}finally{undoEnd()}}
function buildClick0(){
  if(G.build.bp){bpClick();return}
  if(!aimTile)return;const k=tkey(aimTile.gx,aimTile.gz);
  if(G.build.dropFor){const pad=G.build.dropFor;if(Math.hypot(aimTile.gx-pad.gx,aimTile.gz-pad.gz)>droneRange()){toast('太遠了，放料點要在停機坪 '+droneRange().toFixed(1)+' 公尺內');return}pad.drop={...aimTile};pad.ds='idle';toast('放料點設好了，無人機開始搬硬幣');tone(800,.08);exitBuild();return}
  const AL=aimTile.L||0;
  if(G.build.remove){const t=cellAt(tkey(aimTile.gx,aimTile.gz,AL))||cellAt(k),p=pipes.get(k),sx=structAt(aimTile.gx,aimTile.gz);
    if(t&&t.type!=='sell'&&t.type!=='dock'){G.money+=t.paid||0;removeTile(t);G.flags.removed=true;tone(400,.08)}else if(p){G.money+=p.paid||0;removePipe(p);tone(400,.08)}else if(sx){G.money+=sx.paid||0;removeStruct(sx);tone(400,.08)}return}
  const b=BIT[G.build.item],LN=LINES[b.id];
  if(b.st){
    if(!beltStart){if(b.st==='stairs'&&!deckLevelAt(aimTile.gx,aimTile.gz)){toast('先點平台的邊');return}beltStart={...aimTile,L:b.st==='rect'?Math.max(1,G.build.lvl||1):aimTile.L};tone(700,.05,'square',.03);return}
    const P=structPlan(b,beltStart,aimTile);if(!P.ok){toast(P.txt&&!P.s?P.txt:'這裡不能蓋');return}
    if(G.money<P.cost){toast('錢不夠，需要 '+money(P.cost));return}
    G.money-=P.cost;P.s.paid=P.cost;addStruct(P.s);beltStart=null;tone(700,.08,'square',.03);return}
  if(LN){
    if(!beltStart){beltStart={...aimTile};tone(700,.05,'square',.03);return}
    const L0=beltStart.L||0,bc=LN.cost(),route=beltRoute(beltStart,aimTile),turn=startTurn(route,L0),line=route.filter(c=>LN.free(c.gx,c.gz,L0)),cost=line.length*bc;
    if(G.money<cost){toast('錢不夠，需要 '+money(cost));return}
    if(turn){undoLog({k:'rot',t:turn,d:turn.dir});turn.dir=route[0].dir;turn.mesh.rotation.y=-turn.dir*Math.PI/2}
    G.money-=cost;line.forEach(c=>LN.place(c,bc,L0));beltStart=null;tone(700,.08,'square',.03);if(b.id==='belt')G.beltsBuilt=(G.beltsBuilt||0)+line.length;return;
  }
  const c=buildCost(b.id);
  const ad=autoDir(aimTile.gx,aimTile.gz,b.id,AL),bd=ad!=null?ad:G.build.dir,an=b.layer==='pipe'?aimTile:fpAnchor(b.id,aimTile.gx,aimTile.gz,bd);
  if(!freeFor(b,an.gx,an.gz,AL,bd)){toast(AL&&!BELTLIKE.has(b.id)&&!deckAt(aimTile.gx,aimTile.gz,AL)?'機器要放在平台上':'這裡不能放');return}
  if(b.max&&groupCount(b)>=b.max){toast(b.name+'最多只能蓋 '+b.max+' 個');return}
  if(G.money<c){toast('錢不夠，需要 '+money(c));return}
  G.money-=c;
  if(b.layer==='pipe'){addPipe(b.id,aimTile.gx,aimTile.gz,G.build.dir,c);tone(700,.06,'square',.03);return}
  if(b.id==='rake'&&G.freeRake){G.freeRake=false;G.gotFreeRake=true}
  if(b.id==='pole'&&G.freePole&&c===0)G.freePole=false;
  const nt=addTile(b.id,an.gx,an.gz,bd,c,{L:AL});tone(700,.06,'square',.03);
  if(b.id==='rake'){const[dx,dz]=DIRS[bd];if(!nearPile(an.gx+.5-dx*2.5,an.gz+.5-dz*2.5,1.6))toast('活塞耙前面要對準硬幣堆（綠圈那邊）')}
  if(b.id==='drone'){G.build={item:'drone',dir:G.build.dir,dropFor:nt};toast('再點一下設定放料點');return}
  if(needPower(nt)){rebuildPower();if(nt.pw<=0)toast('這台還沒有電：離發電機 3 公尺內，或在 6 公尺內放電線桿')}
  if(b.max===1)exitBuild();
}
// 吸附：蓋在輸送帶出口的機器會自動轉成順著輸送帶的方向（按 F 關掉就照 R 轉的方向）
const AUTO=new Set(['roller','wrap','pellet','disc','pulp','paper','unroll','silo','scanner','scanner2','detector','split','splitU','splitL','split3','smart','tube','lift','gate','tjunc','merge','mergeU','mergeL','mergeC']);
function autoDir(gx,gz,id,L){if(G.build.free||!AUTO.has(id))return null;const D=fpSize(id)[1];for(let d=0;d<4;d++){const[dx,dz]=DIRS[d],an=fpAnchor(id,gx,gz,d),nb=cellAt(tkey(an.gx-dx*D,an.gz-dz*D,L));if(nb&&BELTLIKE.has(nb.type)&&nb.dir===d)return d}return null}
// 從快捷欄選建築，直接進建造模式
function selectBuild(id){const b=BIT[id];if(b.req&&!lv(b.req)){toast(b.name+'還沒解鎖');return}G.build={item:id,dir:G.build?G.build.dir:0,remove:false,lvl:G.lastLvl||0};beltStart=null;$('buildHint').classList.remove('hidden');renderHotbar()}
function exitBuild(){showCoverage(false);setPreviewWires([]);bpGhost.visible=false;hidePath();if(ghost)setGhostModel(null);bpA=null;gridHelper.visible=false;if(G.build)G.lastLvl=G.build.lvl||0;G.build=null;beltStart=null;if(ghost)ghost.visible=false;$('buildHint').classList.add('hidden');renderHotbar()}

