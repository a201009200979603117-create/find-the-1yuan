// ================= 數值 =================
const lv=id=>G.ups[id]||0;
// 收藏櫃裡每一種 1 元的加成（同一種只算一次）
const bonus=k=>{if(!G)return 0;let s=0;for(const t of ONE_TYPES)if(G.coll[t.id]&&t.fx[k])s+=t.fx[k];return s};
function grown(t,base){const g=t.gr,l=lv(t.big);if(!g)return base;return g.add?base+g.add*l:base*(1+g.pct*l)}
function capOf(id){if(id==='hand')return Math.round((1+lv('grab'))*(1+bonus('scoop')+bonus('hand')));const t=TOOL[id];if(!t.cap)return 0;return Math.round(grown(t,t.cap)*(1+(t.cont?bonus('cont'):0)))}
function scoopOf(id){if(id==='hand')return capOf('hand');const t=TOOL[id];return Math.round((t.id==='bucket'||t.id==='cart'?t.scoop:grown(t,t.scoop))*(1+bonus('scoop')+bonus('hand')))}
const priceEach=()=>BASE_PRICE*(1+.05*(G?lv('price'):0)+bonus('price'));
const beltSpeed=()=>.7*(1+.45*lv('beltSpd')+bonus('belt'));
// 活塞耙：每耙一次的枚數、每次的間隔
const rakeAmt=()=>{const l=lv('rakeHead');return l?Math.round(50*Math.pow(1.25,l-1)):35};
const machSpd=k=>1+bonus('mach')+(k?bonus(k):0);
const bufMul=()=>1+bonus('buf');
const genKW=()=>6+2*lv('genBig'),genCap=()=>Math.round(240*(1+.5*lv('genBig'))*bufMul());
const spanR=()=>9+1.5*lv('spans'),dropR=()=>6+lv('drops');
const droneRange=()=>12+3.6*lv('droneRange');
const buildReach=()=>(10+.5*lv('tape'))*(1+bonus('reach'));
const toolOwned=id=>id==='hand'||!!G.tools[id]&&!(G.drop&&G.drop[id]);
// 放在地上的工具：Q 放下、F 丟出去、E 撿回來；水桶和手推車放在地上可以把硬幣丟進去裝
const dropMeshes={};
function dropTool(throwIt){
  const id=G.tool;if(id==='hand'||G.build)return;
  if(G.carry>0&&!TOOL[id].cont){toast('先把手上的硬幣丟掉');return}
  G.drop=G.drop||{};const fx=-Math.sin(pl.yaw),fz=-Math.cos(pl.yaw),d=throwIt?3:.9,x=pl.x+fx*d,z=pl.z+fz*d;
  G.drop[id]={x,z,y:standAt(x,z,pl.y+.5),fill:TOOL[id].cont?G.carry:0};G.carry=0;G.tool='hand';G.flags.dropped=true;
  tone(throwIt?300:420,.08,'triangle',.04);renderHotbar();
}
function nearDropped(){if(!G.drop)return null;let best=null,bd=1.7;for(const id in G.drop){const p=G.drop[id],d=Math.hypot(pl.x-p.x,pl.z-p.z);if(d<bd){bd=d;best=id}}return best}
function pickDropped(id){const p=G.drop[id];if(G.carry>0&&G.tool!==id){toast('先把手上的硬幣丟掉');return}delete G.drop[id];G.tool=id;G.carry=p.fill||0;G.flags.picked=true;tone(800,.06);renderHotbar()}
// 對準地上的水桶或手推車（丟硬幣進去）
function aimDropped(maxT){if(!G.drop)return null;const{o,d}=camRay(0);let best=null,bt=maxT;for(const id in G.drop){if(!TOOL[id].cont)continue;const p=G.drop[id],cx=p.x-o.x,cy=p.y+.3-o.y,cz=p.z-o.z,t=cx*d.x+cy*d.y+cz*d.z;if(t<0||t>bt)continue;if(cx*cx+cy*cy+cz*cz-t*t<.45*.45){bt=t;best=id}}return best}
function fillDropped(id,n){const p=G.drop[id],room=Math.max(0,capOf(id)-p.fill),k=Math.min(room,n);p.fill+=k;if(n>k)items.push({x:p.x+.6,y:p.y,z:p.z,n:n-k,ones:0,belt:false});return k}
function drawDropped(){
  for(const id of Object.keys(dropMeshes))if(!G||!G.drop||!G.drop[id]){scene.remove(dropMeshes[id]);delete dropMeshes[id];shadowDirty=true}
  if(!G||!G.drop)return;
  for(const id in G.drop){let m=dropMeshes[id];const p=G.drop[id];
    if(!m){m=new THREE.Group();const c=toolModels[id].clone();c.scale.set(1,1,1);m.add(c);const b=c.getObjectByName('bail');if(b)b.rotation.x=1.5;
      const bb=new THREE.Box3().setFromObject(c);c.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y+.005,-(bb.min.z+bb.max.z)/2);c.traverse(o=>{if(o.isMesh)o.castShadow=true});
      if(p.ry==null)p.ry=Math.random()*6.283;m.rotation.y=p.ry;scene.add(m);dropMeshes[id]=m;shadowDirty=true}
    m.position.set(p.x,p.y,p.z);if(FILLS[id]&&TOOL[id].cont)FILLS[id](m.children[0],Math.min(1,(p.fill||0)/Math.max(1,capOf(id))))}
}

