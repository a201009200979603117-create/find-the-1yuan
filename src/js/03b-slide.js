// ================= 硬幣滑落：挖得太陡的地方，邊上的硬幣會沿著坡滑下來 =================
// 只有比 58 度還陡（像懸崖）的地方才會滑，只滑上面沒壓著東西的硬幣，滑到不陡就停；
// 每挖一次只會往外帶動幾圈（SL_GEN），不會整面牆一下子垮掉。
// 硬幣山原本的坡大約 31 度，所以整座山的形狀不會變，只是挖出來的洞和斷崖會自己塌一點下來。
// 硬幣狀態 st：0 沒了、1 靜止、2 直直往下掉、3 沿著坡滑
const SL_D=.5,SL_GEN=4;
let svx=null,svz=null,sdist=null,slid=null,sgen=null,slideQ=new Map(),slideN=0,slClinkT=0;
function slideInit(){svx=new Float32Array(M);svz=new Float32Array(M);sdist=new Float32Array(M);slid=new Uint8Array(M);sgen=new Uint8Array(M);slideQ=new Map();slideN=0}
// 把附近的硬幣排進「檢查要不要滑」的清單；gen 是這一串崩塌已經往外帶了幾圈；
// 比空出來的位置還低的硬幣不可能滑進去，所以只排比 minY 高的
function slideAdd(i,gen){if(gen>SL_GEN)return;const o=slideQ.get(i);if(o==null||gen<o)slideQ.set(i,gen)}
function slideNear(x,z,r,gen,minY){if(!slid||HFm)return;gen=gen||0;minY=minY??-1;near(x,z,r,k=>{if(st[k]===1&&vis[k]&&py[k]>minY)slideAdd(k,gen)})}
// 上面沒有直接疊著別的硬幣（只高一層左右、又蓋在它上面的才算；上坡那邊本來就比較高的不算），
// 旁邊在 0.3 或 0.55 公尺的地方又是很陡的落差，就回傳往哪邊滑
const SL_TAN=Math.tan(58*Math.PI/180);
function groundEx(x,z,i){let best=0;near(x,z,.42,k=>{if(k===i)return;const dx=px[k]-x,dz=pz[k]-z,l=rad[k]*.85+.15;if(dx*dx+dz*dz<l*l){const t=py[k]+th[k]/2;if(t>best)best=t}});return best}
function slideDir(i){if(st[i]!==1||!vis[i])return null;const x=px[i],z=pz[i],top=py[i]+th[i]/2;
  let cov=false;near(x,z,.4,k=>{if(cov||k===i||st[k]!==1)return;const dy=py[k]-py[i];if(dy<th[i]*.5||dy>th[i]*1.8)return;const dx=px[k]-x,dz=pz[k]-z,l=(rad[i]+rad[k])*.6;if(dx*dx+dz*dz<l*l)cov=true});if(cov)return null;
  let best=null,bd=0;const a0=Math.random()*6.283;
  for(let k=0;k<8;k++){const a=a0+k*.785,dx=Math.cos(a),dz=Math.sin(a);
    for(const r of[.3,.55]){const nx=x+dx*r,nz=z+dz*r,s=(top-groundEx(nx,nz,i))/r;if(s>SL_TAN&&s>bd&&allowed(nx,nz)&&!occ.has(tkey(Math.floor(nx),Math.floor(nz)))){bd=s;best=[dx,dz]}}}
  return best}
function startSlide(i,d,gen){const ox=px[i],oz=pz[i],oy=py[i],sp=1.3+Math.random()*.7;
  gDel(i);st[i]=3;slid[i]=1;sgen[i]=gen;svx[i]=d[0]*sp;svz[i]=d[1]*sp;sdist[i]=SL_D*(1+Math.random()*.6);vy[i]=0;movers.add(i);slideN++;
  settle(ox,oz,oy,rad[i]);reveal(ox,oz,oy);slideNear(ox,oz,.8,gen+1,oy-.1)}
// 每一幀：沿著坡往下走，碰到坡面就貼著坡，邊走邊翻滾；走完這段再交給「往下掉」落地
const _sa=new THREE.Vector3();
function slideStep(i,dt){const sp=Math.hypot(svx[i],svz[i]),mv=Math.min(sdist[i],sp*dt),k=mv/sp;
  px[i]+=svx[i]*k;pz[i]+=svz[i]*k;sdist[i]-=mv;vy[i]-=9.8*dt;let y=py[i]+vy[i]*dt;const sup=supportY(i,px[i],pz[i],py[i]+.05);if(y<sup){y=sup;vy[i]=Math.min(0,vy[i]*.3)}py[i]=y;
  _q.set(qx[i],qy[i],qz[i],qw[i]);_q.premultiply(_q2.setFromAxisAngle(_sa.set(svz[i]/sp,0,-svx[i]/sp),mv*7));storeQ(i,_q);
  if(sdist[i]<=.001)st[i]=2;setInst(i)}
// 滑下來的硬幣落地：照坡面躺好，叮一聲，再看看落地的地方會不會又太陡
function slideLand(i){slid[i]=0;
  const x=px[i],z=pz[i],gx=(groundAt(x+.3,z)-groundAt(x-.3,z))/.6,gz=(groundAt(x,z+.3)-groundAt(x,z-.3))/.6;
  _v.set(-Math.max(-.8,Math.min(.8,gx))+(Math.random()-.5)*.3,1,-Math.max(-.8,Math.min(.8,gz))+(Math.random()-.5)*.3).normalize();
  _q.setFromUnitVectors(UP,_v).multiply(_q2.setFromAxisAngle(UP,Math.random()*6.283));storeQ(i,_q);setInst(i);slideAdd(i,sgen[i]+1);
  const n=performance.now();if(n-slClinkT>80&&SET.vol>0){slClinkT=n;tone(1700+Math.random()*1900,.05,'triangle',.016)}}
// 每一幀檢查一些（手機少一點），一次最多開始滑幾枚，同時在滑的也有上限
function slideTick(){if(!slideQ.size||HFm||!slid)return;
  let checks=TOUCH||SET.eco?12:24,starts=TOUCH||SET.eco?4:8,moving=0;for(const i of movers)if(st[i]===3)moving++;if(moving>(TOUCH?60:120))return;
  const s0=starts;
  for(const[i,gen]of slideQ){slideQ.delete(i);if(--checks<0)break;const d=slideDir(i);if(d){startSlide(i,d,gen);if(--starts<=0)break}}
  if(s0-starts>=4&&SET.vol>0)noiseS(.35,2800,.7,.018)} // 一次滑好幾枚：嘩啦一聲
