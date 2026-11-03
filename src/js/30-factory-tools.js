// ================= 蓋工廠更方便：復原、藍圖、俯瞰、機器狀態、輸送帶流量 =================
// 存檔、復原、藍圖都用同一種格式記一台機器
function tileData(t){return[t.type,t.gx,t.gz,t.dir,t.paid||0,{off:t.off||false,drop:t.drop||null,fuel:t.fuel,bin:t.bin||0,store:t.store,sOnes:t.sOnes,lpm:t.lpm,from:t.from,kinds:t.kinds,order:t.order,prio:t.prio,dist:t.dist,outSide:t.outSide,closed:t.closed,tag:t.tag,throwD:t.throwD,L:t.L,img:t.cv?t.cv.toDataURL('image/png'):undefined,buf:t.buf,bufN:t.bufN,buf2:t.buf2,bufN2:t.bufN2}]}
// 復原（Ctrl+Z）：每次點擊蓋的、拆的東西記成一筆，錢也一起退回或扣回
let undoRec=null;const undoStack=[];
function undoBegin(){undoRec={ops:[],money:G.money}}
function undoEnd(){const r=undoRec;undoRec=null;if(!r||!r.ops.length)return;r.cost=r.money-G.money;undoStack.push(r);if(undoStack.length>40)undoStack.shift()}
function undoLog(op){if(undoRec)undoRec.ops.push(op)}
function undo(){const r=undoStack.pop();if(!r){toast('沒有可以復原的了');return}
  for(const op of r.ops.slice().reverse()){
    if(op.k==='tile'){if(cellAt(tkey(op.t.gx,op.t.gz,op.t.L))===op.t)removeTile(op.t)}
    else if(op.k==='rmTile'){const[type,gx,gz,dir,paid,ex]=op.d;if(!occ.has(tkey(gx,gz,ex.L||0)))addTile(type,gx,gz,dir,paid,ex)}
    else if(op.k==='pipe'){if(pipes.get(tkey(op.p.gx,op.p.gz))===op.p)removePipe(op.p)}
    else if(op.k==='rmPipe'){const[type,gx,gz,dir,paid]=op.d;if(!pipes.has(tkey(gx,gz)))addPipe(type,gx,gz,dir,paid)}
    else if(op.k==='struct'){if(structs.includes(op.s))removeStruct(op.s)}
    else if(op.k==='rmStruct')addStruct({...op.d})
    else if(op.k==='rot'){if(cellAt(tkey(op.t.gx,op.t.gz,op.t.L))===op.t){op.t.dir=op.d;op.t.mesh.rotation.y=-op.d*Math.PI/2}}}
  G.money+=r.cost;rebuildPower();toast('復原了'+(r.cost>0?'，退回 '+money(r.cost):r.cost<0?'，扣回 '+money(-r.cost):''));tone(500,.06)}
// 藍圖：建造時按 N，點兩個角框選，整組複製；R 轉方向，左鍵貼上
const bpGhost=new THREE.Group();bpGhost.visible=false;scene.add(bpGhost);
const bpGeo=share(new THREE.BoxGeometry(.94,.5,.94)),bpOk=new THREE.MeshBasicMaterial({color:0x44ff66,transparent:true,opacity:.3,depthWrite:false}),bpBad=new THREE.MeshBasicMaterial({color:0xff4444,transparent:true,opacity:.3,depthWrite:false});
let bpA=null;
function bpCopy(a,b){const x0=Math.min(a.gx,b.gx),x1=Math.max(a.gx,b.gx),z0=Math.min(a.gz,b.gz),z1=Math.max(a.gz,b.gz),clip={tiles:[],pipes:[]};
  for(const t of tiles.values())if(BIT[t.type]&&t.gx>=x0&&t.gx<=x1&&t.gz>=z0&&t.gz<=z1&&t.type!=='cabinet'&&t.type!=='switch'&&t.type!=='dish'){const d=tileData(t);d[1]-=x0;d[2]-=z0;d[4]=0;const ex={...d[5]};['fuel','bin','store','sOnes','buf','bufN','buf2','bufN2','drop','img'].forEach(k=>delete ex[k]);d[5]=ex;clip.tiles.push(d)}
  for(const p of pipes.values())if(p.gx>=x0&&p.gx<=x1&&p.gz>=z0&&p.gz<=z1)clip.pipes.push([p.type,p.gx-x0,p.gz-z0,p.dir]);
  clip.w=x1-x0+1;clip.h=z1-z0+1;return clip}
// 轉 90 度：位置轉、方向也轉
function bpRotate(c){c.tiles.forEach(d=>{const x=d[1],z=d[2];d[1]=c.h-1-z;d[2]=x;d[3]=(d[3]+1)%4});c.pipes.forEach(d=>{const x=d[1],z=d[2];d[1]=c.h-1-z;d[2]=x;d[3]=(d[3]+1)%4});const w=c.w;c.w=c.h;c.h=w;bpGhostBuild()}
function bpCost(c){let n=0;for(const d of c.tiles)n+=LINES[d[0]]?LINES[d[0]].cost():buildCost(d[0]);for(const d of c.pipes)n+=d[0]==='pipe'?LINES.pipe.cost():buildCost(d[0]);return Math.round(n*100)/100}
function bpGhostBuild(){while(bpGhost.children.length)bpGhost.remove(bpGhost.children[0]);const c=G.clip;if(!c)return;
  for(const d of c.tiles){const m=new THREE.Mesh(bpGeo,bpOk);m.position.set(d[1]+.5,(d[5].L||0)*LH+.25,d[2]+.5);m.userData.d=d;bpGhost.add(m)}
  for(const d of c.pipes){const m=new THREE.Mesh(bpGeo,bpOk);m.scale.y=.3;m.position.set(d[1]+.5,.08,d[2]+.5);m.userData.p=d;bpGhost.add(m)}}
function bpUpdate(){const a=aimTile;bpGhost.visible=false;
  if(G.build.bp==='select'){ghost.visible=!!a;$('buildHint').innerHTML='<b>藍圖：框選</b><br>'+(bpA?'再點一下定另一個角':'點一下定第一個角')+'・N 離開藍圖';return}
  if(!a||!G.clip)return;ghost.visible=false;bpGhost.visible=true;bpGhost.position.set(a.gx,0,a.gz);let ok=0;
  bpGhost.children.forEach(m=>{const d=m.userData.d||m.userData.p,gx=a.gx+d[1],gz=a.gz+d[2],free=m.userData.d?(!BIT[d[0]].req||lv(BIT[d[0]].req))&&freeFor(BIT[d[0]],gx,gz,d[5].L||0,d[3]):pipeFree(gx,gz);m.material=free?bpOk:bpBad;if(free)ok++});
  const c=bpCost(G.clip);$('buildHint').innerHTML='<b>藍圖：貼上</b>　'+G.clip.w+'×'+G.clip.h+'・'+ok+'/'+bpGhost.children.length+' 個放得下<br><span class="'+(G.money>=c?'':'r')+'">'+money(c)+'</span>・R 轉方向・左鍵貼上・N 重新框選'}
function bpClick(){const a=aimTile;if(!a)return;
  if(G.build.bp==='select'){if(!bpA){bpA={...a};tone(700,.05);return}G.clip=bpCopy(bpA,a);bpA=null;if(!G.clip.tiles.length&&!G.clip.pipes.length){toast('框起來的地方沒有東西');return}G.build.bp='paste';bpGhostBuild();toast('複製了 '+G.clip.tiles.length+' 台機器、'+G.clip.pipes.length+' 段水管');tone(900,.06);return}
  const c=G.clip;if(G.money<bpCost(c)){toast('錢不夠，需要 '+money(bpCost(c)));return}let n=0;
  for(const d of c.tiles){const b=BIT[d[0]],gx=a.gx+d[1],gz=a.gz+d[2],L=d[5].L||0;if(b.req&&!lv(b.req))continue;if(!freeFor(b,gx,gz,L,d[3]))continue;if(b.max&&groupCount(b)>=b.max)continue;
    const cost=LINES[d[0]]?LINES[d[0]].cost():buildCost(d[0]);if(G.money<cost)break;G.money-=cost;addTile(d[0],gx,gz,d[3],cost,{...d[5],kinds:d[5].kinds?JSON.parse(JSON.stringify(d[5].kinds)):undefined});n++}
  for(const d of c.pipes){const gx=a.gx+d[1],gz=a.gz+d[2];if(!pipeFree(gx,gz))continue;const cost=d[0]==='pipe'?LINES.pipe.cost():buildCost(d[0]);if(G.money<cost)break;G.money-=cost;addPipe(d[0],gx,gz,d[3],cost);n++}
  rebuildPower();toast('貼上了 '+n+' 個');tone(700,.08,'square',.03)}
// 俯瞰模式（M）：從上面看整個院子，WASD 移動、滾輪拉近拉遠，滑鼠直接點地上蓋東西
let topV=null;const mouseNDC=new THREE.Vector2(),topRay=new THREE.Raycaster();
addEventListener('mousemove',e=>{mouseNDC.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1)});
function toggleTop(){if(!G)return;if(topV){topV=null;lock();toast('回到第一人稱');return}topV={x:pl.x,z:pl.z,h:Math.min(34,H*1.3)};unlock();toast('俯瞰模式：WASD 移動、滾輪拉近拉遠、B 建造、M 回去')}
function updateTop(dt){const sp=topV.h*.9*dt;if(keys.has('KeyW'))topV.z-=sp;if(keys.has('KeyS'))topV.z+=sp;if(keys.has('KeyA'))topV.x-=sp;if(keys.has('KeyD'))topV.x+=sp;
  topV.x=Math.max(-H-EXT,Math.min(H,topV.x));topV.z=Math.max(-H,Math.min(H,topV.z));camera.position.set(topV.x,topV.h,topV.z+topV.h*.45);camera.lookAt(topV.x,0,topV.z)}
// 機器狀態總覽（O）：沒電、沒燃料、塞住、抽屜滿的機器列成一張表
function machineProblems(){const out=[];for(const t of tiles.values()){const b=BIT[t.type];if(!b)continue;let msg='';
  if(isGen(t)&&!genOn(t))msg=t.fuel<=0?'沒燃料了':'沒有水';
  else if(needPower(t)&&t.pw<=0)msg=t.status||'沒有電';
  else if(SCANS.has(t.type)&&t.type!=='detector'&&t.bin>=drawerCap(t))msg='抽屜滿了';
  else if(t.status&&/塞住|沒有|碰不到|要接|滿了|太多|不夠/.test(t.status))msg=t.status;
  if(msg)out.push({t,msg})}return out}
let ovMark=null,ovMarkT=0;
const ovArrow=new THREE.Mesh(new THREE.ConeGeometry(.45,1.1,12).rotateX(Math.PI),new THREE.MeshBasicMaterial({color:0xffd23a}));ovArrow.visible=false;scene.add(ovArrow);
function renderOverview(){const list=machineProblems().sort((a,b)=>Math.hypot(a.t.gx-pl.x,a.t.gz-pl.z)-Math.hypot(b.t.gx-pl.x,b.t.gz-pl.z));
  $('ovBd').innerHTML=list.length?'<table class="ovt">'+list.map((x,i)=>'<tr><td>'+BIT[x.t.type].icon+' '+BIT[x.t.type].name+'</td><td style="color:#ffb3a0">'+x.msg+'</td><td>'+Math.round(Math.hypot(x.t.gx+.5-pl.x,x.t.gz+.5-pl.z))+' 公尺</td><td><button class="ob" data-ovmark="'+tkey(x.t.gx,x.t.gz,x.t.L)+'">標出位置</button></td></tr>').join('')+'</table>':'<p style="color:#9f9">所有機器都正常運作 👍</p>'}
function updateOvMark(dt){if(!ovMark)return;ovMarkT-=dt;if(ovMarkT<=0||!occ.has(tkey(ovMark.gx,ovMark.gz,ovMark.L))){ovMark=null;ovArrow.visible=false;return}
  ovArrow.visible=true;ovArrow.position.set(ovMark.gx+.5,(ovMark.L||0)*LH+3+Math.sin(performance.now()/200)*.3,ovMark.gz+.5)}
// 輸送帶流量：每 5 秒算一次每分鐘送多少；塞住的輸送帶上面會出現紅色記號
let flowT=0;const jamMesh=new THREE.InstancedMesh(new THREE.ConeGeometry(.16,.4,8).rotateX(Math.PI),new THREE.MeshBasicMaterial({color:0xff3b30}),120);jamMesh.frustumCulled=false;jamMesh.count=0;scene.add(jamMesh);
function updateFlow(dt){flowT+=dt;const now=performance.now();if(flowT>=5){for(const t of tiles.values())if(BELTLIKE.has(t.type)){t.flow=(t.flowAcc||0)*60/flowT;t.flowAcc=0}flowT=0}
  let k=0;for(const t of tiles.values()){if(k>=120)break;if(t.jamT&&now-t.jamT<700&&Math.hypot(t.gx-pl.x,t.gz-pl.z)<30){_p.set(t.gx+.5,(t.L||0)*LH+.95+Math.sin(now/180)*.08,t.gz+.5);_q.identity();_s.set(1,1,1);_m.compose(_p,_q,_s);jamMesh.setMatrixAt(k++,_m)}}
  jamMesh.count=k;jamMesh.instanceMatrix.needsUpdate=true}


