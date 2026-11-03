// ================= 抓、丟、賣 =================
function camRay(spread){if(topV){topRay.setFromCamera(mouseNDC,camera);_o.copy(topRay.ray.origin);_d.copy(topRay.ray.direction);return{o:_o,d:_d}}camera.getWorldDirection(_d);_o.copy(camera.position);if(spread){_d.x+=(Math.random()-.5)*spread;_d.y+=(Math.random()-.5)*spread;_d.z+=(Math.random()-.5)*spread;_d.normalize()}return{o:_o,d:_d}}
let pickStamp=new Uint32Array(0),pickGen=0;
function pickRay(o,d,reach){
  if(HFm)return hfRay(o,d,reach);
  if(pickStamp.length!==M)pickStamp=new Uint32Array(M);pickGen++;
  let best=-1,bt=reach;
  const test=i=>{if(pickStamp[i]===pickGen)return;pickStamp[i]=pickGen;
    if(st[i]!==1||!vis[i])return;
    const cx=px[i]-o.x,cy=py[i]-o.y,cz=pz[i]-o.z,tc=cx*d.x+cy*d.y+cz*d.z,r=rad[i];
    if(tc<0||tc-r>bt)return;
    const p2=cx*cx+cy*cy+cz*cz-tc*tc;if(p2>r*r)return;
    const nx=2*(qx[i]*qy[i]-qw[i]*qz[i]),ny=1-2*(qx[i]*qx[i]+qz[i]*qz[i]),nz=2*(qy[i]*qz[i]+qw[i]*qx[i]),den=d.x*nx+d.y*ny+d.z*nz;
    let t=tc;
    if(Math.abs(den)>.08){t=(cx*nx+cy*ny+cz*nz)/den;const hx=d.x*t-cx,hy=d.y*t-cy,hz=d.z*t-cz;if(hx*hx+hy*hy+hz*hz>r*r)return}
    else if(p2>th[i]*th[i]*4)return;
    if(t>0&&t<bt){bt=t;best=i}
  };
  // 沿著射線每 0.45 公尺看一次附近的格子；找到了就不用再往後看
  for(let s_=0;s_<=reach+.5;s_+=.45){if(best>=0&&s_>bt+.5)break;near(o.x+d.x*s_,o.z+d.z*s_,.45,test)}
  return best<0?null:{i:best,t:bt};
}
function pickSphere(o,d,reach,list,rf){let best=null,bt=reach;list.forEach(e=>{if(e.belt)return;const r=rf(e),cx=e.x-o.x,cy=e.y-o.y,cz=e.z-o.z,tc=cx*d.x+cy*d.y+cz*d.z;if(tc<0||tc>bt)return;if(cx*cx+cy*cy+cz*cz-tc*tc<r*r){bt=tc;best=e}});return best?{e:best,t:bt}:null}
// 準星看到的東西
function updateHover(){
  let h=null;
  if(mode==='play'&&!panel&&!G.build){
    const{o,d}=camRay(0);
    const R=reachOf(),p=pickRay(o,d,R),one=pickSphere(o,d,R,oneObjs,()=>.3),hp=pickSphere(o,d,R,items.filter(e=>!e.prod),e=>Math.max(.3,heapR(e.n)));
    let bt=R+1;
    if(p&&p.t<bt){bt=p.t;h={k:'pile',i:p.i,t:p.t}}
    if(hp&&hp.t<bt+.2){bt=hp.t;h={k:'heap',e:hp.e,t:hp.t}}
    const pp=pickSphere(o,d,R,items.filter(e=>e.prod),()=>.35);if(pp&&pp.t<bt+.2){bt=pp.t;h={k:'prod',e:pp.e,t:pp.t}}
    if(one&&one.t<bt+.4){h={k:'one',e:one.e,t:one.t}}
  }
  const old=hover&&hover.k==='pile'?hover.i:-1,nw=h&&h.k==='pile'?h.i:-1;
  if(old!==nw){if(old>=0&&st[old]===1)setColor(old,false);if(nw>=0)setColor(nw,true)}
  hover=h;
}
function aimHopper(){const{o,d}=camRay(0),c=hopper.position,cx=c.x-o.x,cy=1.2-o.y,cz=c.z-o.z,t=cx*d.x+cy*d.y+cz*d.z;if(t<0||t>5)return false;return cx*cx+cy*cy+cz*cz-t*t<1.2*1.2}
function groundAim(maxT){const{o,d}=camRay(0);if(d.y>-.02)return null;const t=-o.y/d.y;if(t>maxT)return null;return new THREE.Vector3(o.x+d.x*t,0,o.z+d.z*t)}
function gotOne(n,how){if(!n)return;G.onesHand+=n;toast(how+'發現了一枚 1 元！拿去一元收藏櫃放好','gold');chime();buzz([40,40,90])}
let grabCd=0,vacAcc=0,pourAcc=0;
function grab(){
  const t=TOOL[G.tool],cap=capOf(G.tool),room=cap-G.carry;
  if(!hover)return;
  if(hover.k==='one'){const o=hover.e;oneObjs.splice(oneObjs.indexOf(o),1);G.onesHand++;toast('撿起一枚 1 元，拿去一元收藏櫃放好','gold');tone(988,.15);hover=null;return}
  if(hover.k==='prod'){G.held=G.held||[];if(G.held.length>=heldMax()){toast('拿不下了，按 E 放下一個');return}const e=hover.e;items.splice(items.indexOf(e),1);G.held.push({prod:e.prod,n:e.n});tone(800,.06);hover=null;return}
  if(room<=0){const n=performance.now();if(!(n-(grab.t||0)<2500)){grab.t=n;toast('拿滿了，按右鍵丟出去')}return}
  // 挖一次耗一點體力，沒體力就挖不動
  const cost=digCost(G.tool);
  if(pl.stam<cost){const n=performance.now();if(!(n-(grab.tt||0)<2500)){grab.tt=n;toast('太累了，休息一下再挖')}return}
  pl.stam-=cost;pl.restT=0;vmKick('dig');
  const want=Math.min(scoopOf(G.tool),room);
  if(hover.k==='heap'){const e=hover.e,n=Math.min(want,e.n);e.n-=n;G.carry+=n;burst(e.x,e.y+.1,e.z,3,1.6);G.flags.pickHeap=true;if(G.tool==='toy'){G.flags.toyDug=true;if(G.carry>=capOf('toy'))G.flags.toyFull=true}if(e.ones){gotOne(e.ones,'你在地上的硬幣裡');e.ones=0}if(e.n<=0){items.splice(items.indexOf(e),1);hover=null}clink();return}
  if(hover.k==='pile'){const tw0=G.twenty||0;setTimeout(()=>{if((G.twenty||0)>tw0){toast('撿到 20 元硬幣！多賺 $0.35','gold');tone(1320,.12);tone(1760,.18)}},0);const{o,d}=camRay(0),x=o.x+d.x*hover.t,y=o.y+d.y*hover.t,z=o.z+d.z*hover.t,r=takeCoins(x,y,z,want);G.carry+=r.n;if(r.n)burst(x,y,z,Math.min(8,2+Math.ceil(r.n/40)));if(G.tool==='toy'&&r.n){G.flags.toyDug=true;if(G.carry>=capOf('toy'))G.flags.toyFull=true}const ones=r.ones+(r.n?digReveal(x,y,z):0);if(ones)gotOne(ones,'你在硬幣裡');if(r.n)clink()}
}
// 用手挖的時候，挖的地方附近的 1 元也會被翻出來
function digReveal(x,y,z){const r=.5*(1+bonus('reveal'));let n=0;for(const i of[...anchors])if(st[i]===1&&Math.hypot(px[i]-x,py[i]-y,pz[i]-z)<r){if(HFm){anchors.delete(i);n++}else if(removeInst(i))n++}return n}
// amt：水桶和手推車是一點一點倒出去的
function throwCoins(amt){
  if(G.carry<=0)return;
  const n=amt?Math.min(amt,G.carry):G.carry;G.carry-=n;vmKick(amt?'pour':'thr');if(G.tool==='toy')G.flags.toyThrows=(G.flags.toyThrows||0)+1;
  const from=camera.position.clone().add(_v.set(0,-.25,0));
  if(aimHopper()){if(G.tool==='bucket')G.flags.bucketSold=true;launchHeap(from,new THREE.Vector3(hopper.position.x,1.3,hopper.position.z),n,0,()=>sellHand(n,!!amt));return}
  const dd=aimDropped(7);if(dd){const p=G.drop[dd];launchHeap(from,new THREE.Vector3(p.x,p.y+.4,p.z),n,0,()=>{fillDropped(dd,n);if(dd==='bucket'&&p.fill>=capOf('bucket'))G.flags.bucketFull=true});return}
  const mt=machineLooked();if(mt&&isGen(mt)){launchHeap(from,new THREE.Vector3(mt.gx+.5,.9,mt.gz+.5),n,0,()=>{const k=feedGen(mt,{n,ones:0});if(k)toast('發電機加了 '+k+' 枚燃料');else items.push({x:mt.gx+.5,y:0,z:mt.gz+1.3,n,ones:0,belt:false})});return}
  const{o,d}=camRay(0),p=pickRay(o,d,7);
  if(p){const tp=new THREE.Vector3(o.x+d.x*p.t,o.y+d.y*p.t,o.z+d.z*p.t);launchHeap(from,tp,n,0,()=>{G.left+=n;G.dug-=n});return}
  let gp=groundAim(7);if(!gp){camera.getWorldDirection(_d);gp=new THREE.Vector3(pl.x+_d.x*2.5,0,pl.z+_d.z*2.5)}
  launchHeap(from,gp,n,0,f=>{
    const k=tkey(Math.floor(gp.x),Math.floor(gp.z)),t=cellAt(k);
    if(t&&BELTLIKE.has(t.type)&&t.type!=='beltC'){G.flags.onBelt=true;items.push({x:Math.floor(gp.x)+.5,y:.42,z:Math.floor(gp.z)+.5,n,ones:0,belt:true});return}
    if(k===sellTile){sellHand(n);return}
    burst(gp.x,.05,gp.z,Math.min(8,2+Math.ceil(n/60)),1.4);clink();
    const keep=Math.max(1,Math.round(n*(1-.3+.1*lv('waste'))));G.lostCoins+=n-keep;
    const e=items.find(e=>!e.belt&&!e.prod&&Math.hypot(e.x-gp.x,e.z-gp.z)<.5);
    if(e)e.n+=keep;else items.push({x:gp.x,y:0,z:gp.z,n:keep,ones:0,belt:false});
  });
  tone(500,.06,'triangle',.03);
}
// 手上拿的加工品（硬幣捆、環保磚…）：右鍵丟出去，E 放下
const heldMax=()=>1+lv('carryMore');
function throwHeld(){
  vmKick('thr');
  const h=G.held.pop(),it={n:h.n,ones:0,prod:h.prod,belt:false,x:0,y:0,z:0},from=camera.position.clone().add(_v.set(0,-.25,0));
  if(aimHopper()){launchHeap(from,new THREE.Vector3(hopper.position.x,1.3,hopper.position.z),h.n,0,()=>sellItem(it));return}
  const mt=machineLooked();
  if(mt&&isGen(mt)&&GENS[mt.type].fuel(it)>0){launchHeap(from,new THREE.Vector3(mt.gx+.5,.9,mt.gz+.5),h.n,0,()=>{feedGen(mt,it);toast(BIT[mt.type].name+'加了燃料')});return}
  let gp=groundAim(7);if(!gp){camera.getWorldDirection(_d);gp=new THREE.Vector3(pl.x+_d.x*2.5,0,pl.z+_d.z*2.5)}
  launchHeap(from,gp,h.n,0,()=>{const gx=Math.floor(gp.x),gz=Math.floor(gp.z),t=cellAt(tkey(gx,gz));
    if(t&&t.type!=='beltC'&&(BELTLIKE.has(t.type)||t.type==='dock'||t.type==='sell'||accepts(t,it)))landItem(it,gx,gz);else{it.x=gp.x;it.z=gp.z;it.y=groundAt(gp.x,gp.z);items.push(it)}});
  tone(500,.06,'triangle',.03);
}
function putDownHeld(){const h=G.held.pop(),x=pl.x-Math.sin(pl.yaw),z=pl.z-Math.cos(pl.yaw);items.push({x,y:groundAt(x,z),z,n:h.n,ones:0,prod:h.prod,belt:false});tone(400,.06)}
function sweep(){
  const gp=groundAim(5);if(!gp)return;
  const list=items.filter(e=>!e.belt&&!e.prod&&Math.hypot(e.x-gp.x,e.z-gp.z)<2.5+.75*lv('broom'));if(list.length<2&&!(list.length===1&&Math.hypot(list[0].x-gp.x,list[0].z-gp.z)>.3))return;
  let n=0,ones=0;list.forEach(e=>{n+=e.n;ones+=e.ones;items.splice(items.indexOf(e),1)});
  items.push({x:gp.x,y:0,z:gp.z,n,ones,belt:false});tone(300,.15,'sawtooth',.02);vmKick('sw');
}
// 手上的硬幣丟進收購站：有連擊加成
// 收購站一秒只收得進一定數量，丟進去的硬幣會排隊慢慢算錢
let sellQ=[];
const sellRate=()=>200*(1+bonus('sell'));
function processSell(dt){
  let cap=sellRate()*dt;
  while(cap>0&&sellQ.length){const q=sellQ[0],k=Math.min(q.left,cap);q.left-=k;cap-=k;const v=k*priceEach()*q.mul;q.v+=v;
    G.money+=v;G.earned+=v;G.rateAcc+=v;G.coinsSold+=k;orderAdd('coin',k);soldRecent+=k;
    if(q.left<=1e-6){sellQ.shift();addMoney(0,true,q.v)}}
}
function sellHand(n,pouring){
  // 倒的時候一直流進去，半秒內算同一次，不會一直加連擊
  const now=performance.now();
  if(pouring&&G.comboT>0&&now-(G.lastCombo||0)<500){G.comboT=3}
  else{if(G.comboT>0)G.combo=Math.min(G.combo+1,10);else G.combo=1;G.comboT=3;G.lastCombo=now}
  const mul=1+.05*(G.combo-1);
  sellQ.push({left:n,mul,v:0});if(G.wx&&G.wx.rain>.5)G.flags.rainSell=true;burst(hopper.position.x,1.25,hopper.position.z,Math.min(7,2+Math.ceil(n/80)),1.2);
  const c=$('combo');if(G.combo>1){c.textContent='連擊 x'+G.combo;c.style.opacity=1;clearTimeout(c._t);c._t=setTimeout(()=>c.style.opacity=0,1500)}
  if(G.combo>(G.bestCombo||1)&&G.combo>=3){G.bestCombo=G.combo;const r=$('record');r.textContent='連擊新紀錄 x'+G.combo;r.style.opacity=1;clearTimeout(r._t);r._t=setTimeout(()=>r.style.opacity=0,1600)}
  tone(1200,.1,'triangle',.05);
}
function addMoney(v,big,shown){G.money+=v;G.earned+=v;G.rateAcc+=v;const f=document.createElement('div');f.className='float'+(big?'':' s');f.textContent='+'+money(shown!=null?shown:v);f.style.top=(big?60:120)+Math.random()*40+'px';$('floats').appendChild(f);setTimeout(()=>f.remove(),1400)}

