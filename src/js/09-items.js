// ================= 地上和輸送帶上的硬幣（一堆一堆） =================
// item: {x,y,z,n,ones,roll,belt}；地上的可以撿、可以掃，輸送帶上的會往前走
let items=[],oneObjs=[],tiles=new Map();
const heapGeo=share(new THREE.SphereGeometry(1,10,6,0,6.283,0,Math.PI/2));
const heapMesh=new THREE.InstancedMesh(heapGeo,M_.heap,2000);heapMesh.frustumCulled=false;heapMesh.count=0;heapMesh.castShadow=true;scene.add(heapMesh);
const rollGeo=share(new THREE.CylinderGeometry(.12,.12,.5,12).rotateZ(Math.PI/2));
const rollMesh=new THREE.InstancedMesh(rollGeo,new THREE.MeshStandardMaterial({color:0xe9dcc0,roughness:.8}),600);rollMesh.frustumCulled=false;rollMesh.count=0;scene.add(rollMesh);
const oneGeo=share(new THREE.CylinderGeometry(.2,.2,.05,24));
const oneMesh=new THREE.InstancedMesh(oneGeo,[M_.copper,oneFace,oneFace],64);oneMesh.frustumCulled=false;oneMesh.count=0;scene.add(oneMesh);
const heapR=n=>Math.min(.55,.09+.03*Math.cbrt(n));
const wrapMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.14,.14,.54,14).rotateZ(Math.PI/2),new THREE.MeshStandardMaterial({color:0x6aa6d8,roughness:.25,metalness:.1,transparent:true,opacity:.9}),600);wrapMesh.frustumCulled=false;wrapMesh.count=0;scene.add(wrapMesh);
const prodMesh=(geo,mat,n)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.frustumCulled=false;m.count=0;m.castShadow=true;linMat(mat);scene.add(m);return m};
const ecoMesh=prodMesh(new THREE.BoxGeometry(.42,.2,.28),new THREE.MeshStandardMaterial({color:0x5f8f45,roughness:.7,metalness:.2}),400);
const discMesh=prodMesh(new THREE.CylinderGeometry(.3,.3,.12,24),new THREE.MeshStandardMaterial({color:0xd8b04a,roughness:.3,metalness:.85}),400);
const pulpMesh=prodMesh(new THREE.BoxGeometry(.5,.06,.4),new THREE.MeshStandardMaterial({color:0xb7ad94,roughness:.95}),400);
const paperMesh=prodMesh(new THREE.CylinderGeometry(.18,.18,.6,16).rotateZ(Math.PI/2),new THREE.MeshStandardMaterial({color:0xf6f3ea,roughness:.7}),300);
function drawItems(){
  let hc=0;const pc={roll:0,wrap:0,eco:0,disc:0,pulp:0,paper:0},PM={roll:rollMesh,wrap:wrapMesh,eco:ecoMesh,disc:discMesh,pulp:pulpMesh,paper:paperMesh};
  for(const it of items){
    if(it.belt){const bt=cellAt(tkey(Math.floor(it.x),Math.floor(it.z),it.L||0));if(bt&&bt.type==='beltC')continue} // 封閉式輸送帶裡面看不到
    if(it.prod){const m=PM[it.prod];if(m&&pc[it.prod]<m.instanceMatrix.count){_p.set(it.x,it.y+.12,it.z);_q.identity();_s.set(1,1,1);_m.compose(_p,_q,_s);m.setMatrixAt(pc[it.prod]++,_m)}}
    else if(hc<2000){const r=heapR(it.n);_p.set(it.x,it.y,it.z);_q.identity();_s.set(r,r*.55,r);_m.compose(_p,_q,_s);heapMesh.setMatrixAt(hc++,_m)}
  }
  heapMesh.count=hc;heapMesh.instanceMatrix.needsUpdate=true;
  for(const k in PM){PM[k].count=pc[k];PM[k].instanceMatrix.needsUpdate=true}
  oneObjs.forEach((o,k)=>{_p.set(o.x,o.y,o.z);_q.setFromAxisAngle(UP,performance.now()/600+k);_s.set(1,1,1);_m.compose(_p,_q,_s);oneMesh.setMatrixAt(k,_m)});
  oneMesh.count=oneObjs.length;oneMesh.instanceMatrix.needsUpdate=true;
}
// 丟出去的硬幣先飛一段，落地才變成一堆
const flying=[];
function launchHeap(from,to,n,ones,onLand){flying.push({a:from.clone(),b:to.clone(),t:0,n,ones,onLand})}
const flyMesh=new THREE.InstancedMesh(heapGeo,M_.heap,40);flyMesh.frustumCulled=false;flyMesh.count=0;scene.add(flyMesh);
function updateFlying(dt){
  for(let k=flying.length-1;k>=0;k--){const f=flying[k];f.t+=dt*2.2;if(f.t>=1){flying.splice(k,1);f.onLand&&f.onLand(f)}}
  flyMesh.count=Math.min(40,flying.length);
  flying.slice(0,40).forEach((f,k)=>{const r=heapR(f.n);_p.lerpVectors(f.a,f.b,f.t);_p.y+=Math.sin(f.t*Math.PI)*.8;_q.identity();_s.set(r,r*.6,r);_m.compose(_p,_q,_s);flyMesh.setMatrixAt(k,_m)});
  flyMesh.instanceMatrix.needsUpdate=true;
}

