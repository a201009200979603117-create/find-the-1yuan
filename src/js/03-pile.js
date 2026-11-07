// ================= 硬幣山（畫面上的硬幣） =================
let M=0,px,py,pz,qx,qy,qz,qw,vy,rad,th,typ,st,inst,cellId,bright;
// st: 0=沒了 1=靜止 2=掉落
let meshes=[],movers=new Set(),dirty=new Map(),colorDirty=new Set();
let Rp=6,H=16,perInst=320,anchors=new Set(),hover=null;
const ZERO=new THREE.Matrix4().makeScale(0,0,0),UP=new THREE.Vector3(0,1,0);
const _p=new THREE.Vector3(),_q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_s=new THREE.Vector3(),_m=new THREE.Matrix4(),_c=new THREE.Color(),_v=new THREE.Vector3(),_d=new THREE.Vector3(),_o=new THREE.Vector3();
const GS=.6,GH=60,GN=Math.ceil(2*GH/GS);let grid=[];
const ci=v=>{let a=Math.floor((v+GH)/GS);return a<0?0:a>=GN?GN-1:a};
function gAdd(i){const c=ci(px[i])+ci(pz[i])*GN;cellId[i]=c;grid[c].push(i)}
function gDel(i){const c=cellId[i];if(c<0)return;const a=grid[c],k=a.indexOf(i);if(k>=0){a[k]=a[a.length-1];a.pop()}cellId[i]=-1}
function near(x,z,r,fn){const a0=ci(x-r),a1=ci(x+r),b0=ci(z-r),b1=ci(z+r);for(let b=b0;b<=b1;b++)for(let a=a0;a<=a1;a++){const arr=grid[a+b*GN];for(let k=0;k<arr.length;k++)fn(arr[k])}}
function supportY(i,x,z,yLim){let best=th[i]/2;const ri=rad[i];near(x,z,(ri+MAXR)*.75,k=>{if(k===i||py[k]>=yLim)return;const dx=px[k]-x,dz=pz[k]-z,l=(ri+rad[k])*.72;if(dx*dx+dz*dz<l*l){const t=py[k]+(th[k]+th[i])/2;if(t>best)best=t}});return best}
function groundAt(x,z){if(HFm)return hfAt(x,z);let best=0;near(x,z,.6,k=>{const dx=px[k]-x,dz=pz[k]-z,l=rad[k]*.85+.15;if(dx*dx+dz*dz<l*l){const t=py[k]+th[k]/2;if(t>best)best=t}});return best}
function markDirty(m,k){const r=dirty.get(m);if(r){if(k<r[0])r[0]=k;if(k>r[1])r[1]=k}else dirty.set(m,[k,k])}
let vis,owner=[],mcount=CT.map(()=>0);
function setInst(i){if(st[i]===0){hide(i);return}if(!vis[i])return;const m=meshes[typ[i]];_p.set(px[i],py[i],pz[i]);_q.set(qx[i],qy[i],qz[i],qw[i]);_s.set(rad[i],th[i],rad[i]);_m.compose(_p,_q,_s);m.setMatrixAt(inst[i],_m);markDirty(m,inst[i]);shadowDirty=true}
function setColor(i,hi){if(!vis[i])return;const m=meshes[typ[i]],v=bright[i]*(hi?1.6:1);m.setColorAt(inst[i],_c.setRGB(v,v,v));colorDirty.add(m)}
function storeQ(i,q){qx[i]=q.x;qy[i]=q.y;qz[i]=q.z;qw[i]=q.w}
// 只畫看得到的硬幣：埋在裡面的不放進繪圖清單，挖開之後才補上
function buried(i){let b=false;const x=px[i],z=pz[i],y=py[i]+.6;near(x,z,.3,k=>{if(b||st[k]!==1||py[k]<=y)return;const dx=px[k]-x,dz=pz[k]-z;if(dx*dx+dz*dz<.0625)b=true});return b}
function show(i){if(vis[i])return;const k=typ[i],s=mcount[k]++;inst[i]=s;owner[k][s]=i;vis[i]=1;meshes[k].count=mcount[k];setInst(i);setColor(i,false)}
function hide(i){if(!vis[i])return;const k=typ[i],s=inst[i],l=--mcount[k],j=owner[k][l];vis[i]=0;meshes[k].count=mcount[k];if(j!==i){owner[k][s]=j;inst[j]=s;setInst(j);setColor(j,false)}shadowDirty=true}
function reveal(x,z,y){near(x,z,.9,k=>{if(st[k]!==1||vis[k])return;const dx=px[k]-x,dy=py[k]-y,dz=pz[k]-z;if(dx*dx+dy*dy+dz*dz<.81)show(k)})}
function settle(x,z,y,r){
  const q=[[x,z,y,r]];let guard=0;
  while(q.length&&guard++<600){
    const[cx,cz,cy,cr]=q.pop(),list=[];
    near(cx,cz,(cr+MAXR)*.75,k=>{if(py[k]>cy-.001){const dx=px[k]-cx,dz=pz[k]-cz,l=(cr+rad[k])*.72;if(dx*dx+dz*dz<l*l)list.push(k)}});
    for(const k of list){if(st[k]!==1)continue;
      if(supportY(k,px[k],pz[k],py[k]-.004)<py[k]-.02){gDel(k);st[k]=2;vy[k]=0;show(k);movers.add(k);q.push([px[k],pz[k],py[k],rad[k]])}}
  }
}
// 把畫面上的一枚硬幣拿掉（它如果是藏著 1 元的那枚，就回傳 true）
function removeInst(i){if(typ[i]===3&&G){G.twenty=(G.twenty||0)+1;G.money+=.35;G.earned+=.35}gDel(i);st[i]=0;settle(px[i],pz[i],py[i],rad[i]);reveal(px[i],pz[i],py[i]);slideNear(px[i],pz[i],.9,0,py[i]-.1);setInst(i);G.removed++;if(anchors.has(i)){anchors.delete(i);return true}return false}

function generate(seed,sizeKey,mask){
  meshes.forEach(m=>{scene.remove(m);if(m.dispose)m.dispose()});
  const S=SIZES[sizeKey],r=mulberry32(seed);
  HFm=!!S.hf;if(hfMesh)hfMesh.visible=HFm;detMeshes.forEach(m=>m.visible=HFm);
  if(HFm){M=0;perInst=1;meshes=[];owner=[];mcount=CT.map(()=>0);vis=new Uint8Array(0);movers=new Set();hover=null;grid=Array.from({length:GN*GN},()=>[]);Rp=40;slid=null;hfSlumps=[];genHF(seed,S,mask);return}
  M=S.inst;perInst=S.coins/S.inst;
  [px,py,pz,qx,qy,qz,qw,vy,rad,th,bright]=Array.from({length:11},()=>new Float32Array(M));
  typ=new Uint8Array(M);st=new Uint8Array(M);inst=new Int32Array(M);cellId=new Int32Array(M).fill(-1);
  grid=Array.from({length:GN*GN},()=>[]);movers=new Set();hover=null;
  for(let i=0;i<M;i++){const u=r();typ[i]=u<.012?3:u<.2?0:u<.6?1:2}
  anchors=new Set();while(anchors.size<S.ones)anchors.add(Math.floor(M*(.12+r()*.8)));
  const gauss=()=>Math.sqrt(-2*Math.log(1-r()))*Math.cos(6.283*r());
  const est=.2*Math.cbrt(M),spread=1.2*Math.cbrt(M/10000);
  const HS=.08,HH=Math.max(12,est*1.6+6),HN=Math.ceil(2*HH/HS),hm=new Float32Array(HN*HN);
  const hi=v=>{let a=Math.floor((v+HH)/HS);return a<0?0:a>=HN?HN-1:a};
  const fpMax=(x,z,rr)=>{let m=0;for(let b=hi(z-rr);b<=hi(z+rr);b++)for(let a=hi(x-rr);a<=hi(x+rr);a++){const v=hm[a+b*HN];if(v>m)m=v}return m};
  const stamp=(x,z,rr,v)=>{for(let b=hi(z-rr);b<=hi(z+rr);b++)for(let a=hi(x-rr);a<=hi(x+rr);a++){const cx=a*HS-HH-x,cz=b*HS-HH-z;if(cx*cx+cz*cz<=rr*rr&&hm[a+b*HN]<v)hm[a+b*HN]=v}};
  const cnt=CT.map(()=>0);
  for(let i=0;i<M;i++){
    const t=typ[i];rad[i]=CT[t].r;th[i]=CT[t].th;cnt[t]++;bright[i]=.85+r()*.15;
    let x=gauss()*spread,z=gauss()*spread;
    if(mask&&(mask[i>>3]>>(i&7)&1)){st[i]=0;anchors.delete(i);continue}
    for(let it=0;it<120;it++){ // 往低處滾，坡度約 31 度
      const hc=fpMax(x,z,.06);let bx=x,bz=z,bh=hc;const a0=r()*6.283;
      for(let k=0;k<6;k++){const a=a0+k*1.047,nx=x+Math.cos(a)*.3,nz=z+Math.sin(a)*.3,nh=fpMax(nx,nz,.06);if(nh<bh){bh=nh;bx=nx;bz=nz}}
      if(bh<hc-.18){x=bx;z=bz}else break;
    }
    const y=fpMax(x,z,.06);px[i]=x;py[i]=y+th[i]/2;pz[i]=z;
    const gx=(fpMax(x+.3,z,.06)-fpMax(x-.3,z,.06))/.6,gz=(fpMax(x,z+.3,.06)-fpMax(x,z-.3,.06))/.6;
    _v.set(-Math.max(-.8,Math.min(.8,gx))+(r()-.5)*.3,1,-Math.max(-.8,Math.min(.8,gz))+(r()-.5)*.3).normalize();
    _q.setFromUnitVectors(UP,_v).multiply(_q2.setFromAxisAngle(UP,r()*6.283));storeQ(i,_q);
    stamp(x,z,rad[i]*.75,y+th[i]);st[i]=1;gAdd(i);
  }
  const ds=[];for(let i=0;i<M;i++)if(st[i]===1)ds.push(Math.hypot(px[i],pz[i]));ds.sort((a,b)=>a-b);
  Rp=ds.length?ds[Math.floor(ds.length*.98)]+.3:4;
  meshes=CT.map((t,k)=>{const cap=Math.max(1,cnt[k]),m=new THREE.InstancedMesh(coinGeo,COINMAT[k],cap);m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3).fill(1),3);m.count=0;m.frustumCulled=false;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m});
  owner=cnt.map(n=>new Int32Array(Math.max(1,n)));mcount=CT.map(()=>0);vis=new Uint8Array(M);
  // 埋在裡面的不畫；但硬幣山側面常有小台階，台階立面上的硬幣從旁邊看得到，不能當成埋住（不然會破洞看穿整座山）
  const open=i=>{const x=px[i],z=pz[i],y=py[i]+.25;for(let k=0;k<8;k++){const a=k*.785;if(fpMax(x+Math.cos(a)*.42,z+Math.sin(a)*.42,.06)<y)return true}return false};
  for(let i=0;i<M;i++)if(st[i]===1&&(open(i)||!buried(i)))show(i);
  slideInit();
}

// 從硬幣堆的某個位置拿走 n 枚（抽象數量），畫面上的硬幣按比例消失；藏著的 1 元會一起被拿出來
function takeCoins(x,y,z,n){
  if(HFm)return hfTake(x,y,z,n);
  n=Math.min(Math.floor(n),G.left);if(n<=0)return{n:0,ones:0};
  G.left-=n;G.dug+=n;
  let ones=0;const target=Math.min(M,Math.floor((SIZES[G.size].coins-G.left)/perInst));
  while(G.removed<target){
    let best=-1,bd=9;
    near(x,z,2.2,i=>{if(st[i]!==1||!vis[i])return;const dx=px[i]-x,dy=py[i]-y,dz=pz[i]-z,d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;best=i}});
    if(best<0){for(let i=0;i<M;i++)if(st[i]===1&&vis[i]){best=i;break}}
    if(best<0)break;
    if(removeInst(best))ones++;
  }
  return{n,ones};
}
function nearPile(x,z,r){if(HFm)return hfMaxIn(x,z,r)>.25;let ok=false;near(x,z,r,i=>{if(!ok&&st[i]===1&&vis[i]){const dx=px[i]-x,dz=pz[i]-z;if(dx*dx+dz*dz<r*r)ok=true}});return ok}

