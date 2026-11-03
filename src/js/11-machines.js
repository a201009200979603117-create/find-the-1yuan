// ================= 機器與輸送帶 =================
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
// L：第幾層（0 是地面，一層 1.5 公尺）
function tkey(x,z,L){return L?x+','+z+','+L:x+','+z}
const LH=1.5;
const tileRoot=new THREE.Group();scene.add(tileRoot);
const M_frame=share(new THREE.MeshStandardMaterial({color:0x5b646c,metalness:.55,roughness:.5}));
let _bfGeo=null,M_beltFrame=null;
function beltFrameGeo(){if(_bfGeo)return _bfGeo;
  const parts=[];const add=(w,h,d,col,x,y,z)=>{const ge=new THREE.BoxGeometry(w,h,d).toNonIndexed();ge.translate(x,y,z);const c=new THREE.Color(col).convertSRGBToLinear(),n=ge.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b}ge.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(ge)};
  for(const sx of[-.5,.5]){add(.05,.2,1,0x5b646c,sx,.31,0);add(.075,.03,1,0xe2a51c,sx,.425,0)}for(const sx of[-.42,.42])add(.07,.22,.07,0x2c2c2e,sx,.11,0);
  let n=0;parts.forEach(p=>n+=p.attributes.position.count);const out={position:new Float32Array(n*3),normal:new Float32Array(n*3),uv:new Float32Array(n*2),color:new Float32Array(n*3)};let o=0;
  for(const p of parts){for(const k of['position','normal','color'])out[k].set(p.attributes[k].array,o*3);out.uv.set(p.attributes.uv.array,o*2);o+=p.attributes.position.count;p.dispose()}
  const g=new THREE.BufferGeometry();for(const k in out)g.setAttribute(k,new THREE.BufferAttribute(out[k],k==='uv'?2:3));g.computeBoundingSphere();_bfGeo=share(g);
  M_beltFrame=share(new THREE.MeshStandardMaterial({vertexColors:true,metalness:.5,roughness:.5,map:panelTex}));M_beltFrame.userData.lin=true;return _bfGeo}
const beltGeo=share(new THREE.BoxGeometry(.96,.08,1)),railGeo=share(new THREE.BoxGeometry(.05,.1,1)),legGeo=share(new THREE.BoxGeometry(.05,.3,.05));
const _geo=new Map();function boxGeo(w,h,d){const k=w+'|'+h+'|'+d;let g=_geo.get(k);if(!g){g=share(new THREE.BoxGeometry(w,h,d));_geo.set(k,g)}return g}
const _mat=new Map();function matC(c){let m=_mat.get(c);if(!m){m=share(new THREE.MeshStandardMaterial({color:c,metalness:.45,roughness:.45}));_mat.set(c,m)}return m}
// 釋放一個物件底下自己的幾何和材質（共用的不動）
function disposeObj(root){root.traverse(o=>{if(o.geometry&&!SHARED.has(o.geometry))o.geometry.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!SHARED.has(m))m.dispose()})})}
// 每個方塊面都有一圈比較暗的邊和細細的亮線，看起來像有倒角的金屬板，不會像一塊塊色塊
const panelTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);
  for(let k=0;k<900;k++){const v=232+Math.random()*23|0;g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(Math.random()*w,Math.random()*h,2,2)}
  const e=12;for(const[x0,y0,x1,y1,rx,ry,rw,rh]of[[0,0,e,0,0,0,e,h],[w,0,w-e,0,w-e,0,e,h],[0,0,0,e,0,0,w,e],[0,h,0,h-e,0,h-e,w,e]]){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'rgba(0,0,0,.42)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(rx,ry,rw,rh)}
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1.5;g.strokeRect(3.5,3.5,w-7,h-7)});
share(panelTex);
const _panelM=new Map();
function panelMat(m){if(!m||m.map||m.transparent||!m.isMeshStandardMaterial)return m;let v=_panelM.get(m);if(!v){v=share(m.clone());v.map=panelTex;_panelM.set(m,v)}return v}
function partBox(g,w,h,d,mat,x,y,z){const m=new THREE.Mesh(boxGeo(w,h,d),panelMat(mat));m.position.set(x,y,z);g.add(m);return m}
share(rollMesh.material);share(wrapMesh.material);
