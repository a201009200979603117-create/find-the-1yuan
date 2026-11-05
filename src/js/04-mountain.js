// ================= The Mountain：50 公尺高的硬幣山用高度圖畫 =================
// 硬幣多到沒辦法一枚一枚畫：整座山是一張高度圖，靠近玩家的地方再撒上一層真的硬幣當細節
let HFm=false,hf=null,hfT=null,hfCPM=1,hfMesh=null,hfDirty=false,hfNormT=0,pourK=1;
const HFS=.5,HFH=46,HFN=Math.round(2*HFH/HFS)+1;
const hfIdx=(a,b)=>a+b*HFN;
function hfAt(x,z){const fx=(x+HFH)/HFS,fz=(z+HFH)/HFS;let a=Math.floor(fx),b=Math.floor(fz);if(a<0||b<0||a>=HFN-1||b>=HFN-1)return 0;const u=fx-a,v=fz-b;return (hf[hfIdx(a,b)]*(1-u)+hf[hfIdx(a+1,b)]*u)*(1-v)+(hf[hfIdx(a,b+1)]*(1-u)+hf[hfIdx(a+1,b+1)]*u)*v}
function hfMaxIn(x,z,r){let m=0;const a0=Math.max(0,Math.floor((x-r+HFH)/HFS)),a1=Math.min(HFN-1,Math.ceil((x+r+HFH)/HFS)),b0=Math.max(0,Math.floor((z-r+HFH)/HFS)),b1=Math.min(HFN-1,Math.ceil((z+r+HFH)/HFS));for(let b=b0;b<=b1;b++)for(let a=a0;a<=a1;a++){const v=hf[hfIdx(a,b)];if(v>m)m=v}return m}
function genHF(seed,S,mask){
  const r=mulberry32(seed);hfT=new Float32Array(HFN*HFN);
  const bumps=Array.from({length:14},()=>({x:(r()-.5)*40,z:(r()-.5)*40,s:3+r()*6,h:(r()-.3)*4}));
  let V=0;
  for(let b=0;b<HFN;b++)for(let a=0;a<HFN;a++){const x=a*HFS-HFH,z=b*HFS-HFH,d=Math.hypot(x,z);
    let h=50*(1-d/42);if(h>46)h=46+(h-46)*.4; // 頂端圓一點
    for(const k of bumps){const e=Math.hypot(x-k.x,z-k.z)/k.s;if(e<2)h+=k.h*Math.exp(-e*e)}
    h=Math.max(0,h);hfT[hfIdx(a,b)]=h;V+=h*HFS*HFS}
  hfCPM=S.coins/V;
  hf=new Float32Array(HFN*HFN);
  if(mask){const v=new Uint16Array(mask.buffer,mask.byteOffset,Math.min(HFN*HFN,mask.byteLength>>1));for(let k=0;k<v.length;k++)hf[k]=v[k]/100;pourK=1}
  else{pourK=0}
  // 1 元埋在表面下 0.1～1.5 公尺
  const n=S.ones;px=new Float32Array(n);py=new Float32Array(n);pz=new Float32Array(n);st=new Uint8Array(n).fill(1);anchors=new Set();
  for(let i=0;i<n;i++){let x,z,h;do{x=(r()-.5)*80;z=(r()-.5)*80;h=hfT[hfIdx(Math.round((x+HFH)/HFS),Math.round((z+HFH)/HFS))]}while(h<1.5);px[i]=x;pz[i]=z;py[i]=h-.1-r()*1.4;anchors.add(i)}
  if(!hfMesh){
    const geo=new THREE.PlaneGeometry(2*HFH,2*HFH,HFN-1,HFN-1);geo.rotateX(-Math.PI/2);
    const tex=M_.heap.map.clone();tex.needsUpdate=true;tex.repeat.set(20,20);
    hfMesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,metalness:.75,roughness:.36,color:0xb8b4a8}));hfMesh.castShadow=hfMesh.receiveShadow=true;linMat(hfMesh.material);scene.add(hfMesh);
  }
  hfMesh.visible=true;hfSync(true);detailInit();
}
function hfSync(norm){const p=hfMesh.geometry.attributes.position;for(let k=0;k<HFN*HFN;k++)p.setY(k,hf[k]);p.needsUpdate=true;if(norm)hfMesh.geometry.computeVertexNormals();hfMesh.geometry.computeBoundingSphere();shadowDirty=true}
// 挖掉 vol 立方公尺，再讓太陡的地方往下滑
function hfDig(x,z,vol){
  const R=.7,a0=Math.max(1,Math.floor((x-R+HFH)/HFS)),a1=Math.min(HFN-2,Math.ceil((x+R+HFH)/HFS)),b0=Math.max(1,Math.floor((z-R+HFH)/HFS)),b1=Math.min(HFN-2,Math.ceil((z+R+HFH)/HFS));
  let W=0;const cells=[];for(let b=b0;b<=b1;b++)for(let a=a0;a<=a1;a++){const d=Math.hypot(a*HFS-HFH-x,b*HFS-HFH-z);if(d<R){const w=1-d/R;cells.push([hfIdx(a,b),w]);W+=w}}
  if(!W)return;for(const[k,w]of cells)hf[k]=Math.max(0,hf[k]-vol*w/W/(HFS*HFS));
  // 太陡的地方不是一下子削平，而是接下來一秒多慢慢滑下來（見 hfSlumpTick）
  const c0=Math.max(1,a0-6),c1=Math.min(HFN-2,a1+6),d0=Math.max(1,b0-6),d1=Math.min(HFN-2,b1+6),old=hfSlumps.find(r=>r.c0<=c0&&r.c1>=c1&&r.d0<=d0&&r.d1>=d1);
  if(old)old.t=0;else{hfSlumps.push({c0,c1,d0,d1,t:0});if(hfSlumps.length>12)hfSlumps.shift()}
  for(let it=0;it<2;it++)hfSlumpStep(c0,c1,d0,d1,.5);hfDirty=true;
}
// 比 50 度還陡的格子，把多出來的高度分一部分給旁邊比較低的格子；k 越大滑得越快
const HF_MAXD=Math.tan(50*Math.PI/180)*HFS;let hfSlumps=[],hfSlT=0;
function hfSlumpStep(c0,c1,d0,d1,k){let moved=0,big=null;
  for(let b=d0;b<=d1;b++)for(let a=c0;a<=c1;a++){const i=hfIdx(a,b);for(const n of[i+1,i-1,i+HFN,i-HFN]){const df=hf[i]-hf[n];if(df>HF_MAXD){const m=(df-HF_MAXD)/2*k;hf[i]-=m;hf[n]+=m;moved+=m;if(m>.04&&(!big||m>big.m))big={m,a,b}}}}
  return{moved,big}}
function hfSlumpTick(dt){if(!hfSlumps.length)return;hfSlT-=dt;if(hfSlT>0)return;hfSlT=.05;
  for(let j=hfSlumps.length-1;j>=0;j--){const r=hfSlumps[j];r.t+=.05;let moved=0,big=null;for(let it=0;it<2;it++){const o=hfSlumpStep(r.c0,r.c1,r.d0,r.d1,.5);moved+=o.moved;if(o.big&&(!big||o.big.m>big.m))big=o.big}if(moved>.002)hfDirty=true;
    // 滑得多的地方滾下幾枚小硬幣，叮叮噹噹
    if(big){const x=big.a*HFS-HFH,z=big.b*HFS-HFH;burst(x,hfAt(x,z)+.1,z,2,.6);if(SET.vol>0&&Math.random()<.5)clink()}
    if(moved<.002||r.t>3.5)hfSlumps.splice(j,1)}}
function hfRay(o,d,reach){if(d.y>.9)return null;for(let t=.2;t<=reach;t+=.08){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;if(y<hfAt(x,z)&&y>.05)return{i:-1,t};if(y<0)return null}return null}
function hfTake(x,y,z,n){
  n=Math.min(Math.floor(n),G.left);if(n<=0||hfAt(x,z)<.05)return{n:0,ones:0};
  G.left-=n;G.dug+=n;hfDig(x,z,n/hfCPM);detailHide(x,y,z,n);
  let ones=0;for(const i of[...anchors]){if(Math.hypot(px[i]-x,pz[i]-z)<.8&&hfAt(px[i],pz[i])<py[i]+.08){anchors.delete(i);ones++}}
  return{n,ones};
}
function hfEncode(){const v=new Uint16Array(HFN*HFN);for(let k=0;k<v.length;k++)v[k]=Math.min(65535,Math.round(hf[k]*100));const b=new Uint8Array(v.buffer);let s='';for(let k=0;k<b.length;k+=8192)s+=String.fromCharCode.apply(null,b.subarray(k,k+8192));return btoa(s)}
// 靠近玩家的地方撒一層真的硬幣（挖過的地方就不放，看起來像挖出一個洞）
const DET=1800,detMeshes=CT.map((t,k)=>{const m=new THREE.InstancedMesh(coinGeo,COINMAT[k],DET);m.count=0;m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.visible=false;scene.add(m);return m});
let detC={x:1e9,z:1e9},detGone=new Set(),detT=0;
const DCS=.32,dhash=(a,b,s)=>{let h=Math.imul(a*374761393+b*668265263+s*2246822519,1274126177);h^=h>>>13;return((h>>>0)%10000)/10000};
function detailInit(){detGone=new Set();detC={x:1e9,z:1e9};detMeshes.forEach(m=>m.visible=true)}
function detailBuild(cx,cz){
  detC={x:cx,z:cz};const cnt=CT.map(()=>0),R=7.5,a0=Math.floor((cx-R)/DCS),a1=Math.ceil((cx+R)/DCS),b0=Math.floor((cz-R)/DCS),b1=Math.ceil((cz+R)/DCS);
  for(let b=b0;b<=b1;b++)for(let a=a0;a<=a1;a++){
    const x=(a+dhash(a,b,1))*DCS,z=(b+dhash(a,b,2))*DCS;if((x-cx)**2+(z-cz)**2>R*R||detGone.has(a+','+b))continue;
    const h=hfAt(x,z);if(h<.08)continue;const u=dhash(a,b,3),k=u<.012?3:u<.2?0:u<.6?1:2;if(cnt[k]>=DET)continue;
    const gx=(hfAt(x+.3,z)-hfAt(x-.3,z))/.6,gz=(hfAt(x,z+.3)-hfAt(x,z-.3))/.6;
    _v.set(-gx+(dhash(a,b,4)-.5)*.6,1,-gz+(dhash(a,b,5)-.5)*.6).normalize();_q.setFromUnitVectors(UP,_v).multiply(_q2.setFromAxisAngle(UP,dhash(a,b,6)*6.283));
    _p.set(x,h+.02,z);_s.set(CT[k].r,CT[k].th,CT[k].r);_m.compose(_p,_q,_s);detMeshes[k].setMatrixAt(cnt[k]++,_m);
  }
  detMeshes.forEach((m,k)=>{m.count=cnt[k];m.instanceMatrix.needsUpdate=true});
}
function detailHide(x,y,z,n){const k=Math.min(6,Math.ceil(n/200));const a=Math.floor(x/DCS),b=Math.floor(z/DCS);let c=0;for(let r=0;r<=2&&c<k;r++)for(let db=-r;db<=r&&c<k;db++)for(let da=-r;da<=r&&c<k;da++){const key=(a+da)+','+(b+db);if(!detGone.has(key)){detGone.add(key);c++}}detC.x=1e9}
function updateHF(dt){
  if(!HFm)return;
  if(pourK<1){pourK=Math.min(1,pourK+dt/60);const k=pourK;for(let i=0;i<hf.length;i++)hf[i]=Math.min(hfT[i],hfT[i]*k*1.15);hfSync(false);hfNormT+=dt;if(hfNormT>.5||k>=1){hfNormT=0;hfMesh.geometry.computeVertexNormals()}detC.x=1e9}
  hfSlumpTick(dt);
  if(hfDirty){hfNormT+=dt;if(hfNormT>.25){hfNormT=0;hfDirty=false;hfSync(true);detC.x=1e9}}
  detT-=dt;const c=mode==='play'?pl:{x:camera.position.x,z:camera.position.z};
  if(detT<=0&&Math.hypot(c.x-detC.x,c.z-detC.z)>2){detT=.2;detailBuild(c.x,c.z)}
}

