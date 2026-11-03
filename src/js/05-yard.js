// ================= 院子 =================
const world=new THREE.Group();scene.add(world);
let door,doorOpenAmt=0,hopper,gaugeNeedle,obstacles=[],shopPos,sellTile,boardPos,boardTex,boardCanvas,priceTex,priceCanvas;
function box(w,h,d,mat,x,y,z,parent=world){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
function texMat(base,rx,ry){const t=base.map.clone();t.needsUpdate=true;t.repeat.set(rx,ry);return Object.assign(base.clone(),{map:t})}
function plane(w,h,tex,x,y,z,ry=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);m.rotation.y=ry;world.add(m);return m}
function buildWorld(){
  while(world.children.length){const c=world.children.pop();c.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
  obstacles=[];
  const WH=6,L=2*H;
  sun.position.set(H*.6,40,H*.35);sun.target.position.set(0,0,0);
  EXT=G?5*lv('expand'):0;const X0=-H-EXT;
  Object.assign(sun.shadow.camera,{left:X0-6,right:H+6,top:H+6,bottom:-H-6,near:1,far:140});sun.shadow.camera.updateProjectionMatrix();
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(L+60,L+60),texMat(new THREE.MeshStandardMaterial({map:sandTex,roughness:1,envMapIntensity:.3}),(L+60)/5,(L+60)/5));
  fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;world.add(fl);floorMat=fl.material;
  // 木板牆＋深色立柱；北邊是一棟比較高的鐵皮大倉庫
  const wall=(x,z,len,alongX)=>{
    box(alongX?len:.4,.8,alongX?.4:len,texMat(M_.conc,len/4,1),x,.4,z);
    box(alongX?len:.3,WH-.8,alongX?.3:len,texMat(M_.plank,len/5,1.1),x,.8+(WH-.8)/2,z);
    for(let s=-len/2;s<=len/2+.01;s+=4){const px_=alongX?x+s:x,pz_=alongX?z:z+s;box(.35,WH+.2,.35,M_.dark,px_,(WH+.2)/2,pz_)}
  };
  wall(X0,0,L,false);
  // 東牆中間留一道出貨大門（卡車停在外面）
  wall(H,(-H+GATE0)/2,GATE0+H,false);wall(H,(GATE1+H)/2,H-GATE1,false);
  box(.5,WH-3.6,GATE1-GATE0,texMat(M_.plank,1,1),H,3.6+(WH-3.6)/2,(GATE0+GATE1)/2);
  const gz_=box(.52,.3,GATE1-GATE0,new THREE.MeshStandardMaterial({map:hazardTex}),H,3.45,(GATE0+GATE1)/2);gz_.castShadow=false;
  wall((X0-1.3)/2,H,-X0-1.3,true);wall((H+1.3)/2,H,H-1.3,true);
  box(2.6,WH-2.7,.3,texMat(M_.plank,1,1),0,2.7+(WH-2.7)/2,H);
  const hz=box(2.6,.28,.32,new THREE.MeshStandardMaterial({map:hazardTex}),0,2.84,H);hz.castShadow=false;
  box(L+EXT+.6,10,.5,texMat(M_.corr,(L+EXT)/3,2.5),-EXT/2,5,-H-.1);
  const lean=box(L+EXT+.6,.2,4,M_.dark,-EXT/2,9.6,-H+1.6);lean.rotation.x=.18;
  // 一開始被關的小房間
  box(.3,3,4,M_.conc,-2,1.5,H+2);box(.3,3,4,M_.conc,2,1.5,H+2);box(4.3,3,.3,M_.conc,0,1.5,H+4);box(4.3,.25,4.3,M_.dark,0,3.1,H+2);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.08,10,8),new THREE.MeshBasicMaterial({color:0xffe2a0}));bulb.position.set(0,2.8,H+2);world.add(bulb);
  const pl_=new THREE.PointLight(0xffc98a,1.1,7,1.6);pl_.position.set(0,2.6,H+2);world.add(pl_);
  door=box(2.6,2.7,.12,new THREE.MeshStandardMaterial({map:shutterTex,metalness:.5,roughness:.5}),0,1.35,H);
  // 拱形鐵骨＋透明屋頂（The Mountain 太高了，屋頂蓋不住，所以沒有屋頂）
  const arcH=4.5,noRoof=G&&SIZES[G.size].hf;
  if(!noRoof)for(let z=-H;z<=H+.01;z+=3){const rib=new THREE.Mesh(new THREE.TorusGeometry(H,.07,6,40,Math.PI),M_.rib);rib.scale.y=arcH/H;rib.position.set(0,WH,z);rib.castShadow=true;world.add(rib)}
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(H,H,L,40,1,true,Math.PI/2,Math.PI),M_.glass);
  roof.geometry.rotateX(Math.PI/2);roof.scale.y=arcH/H;roof.position.y=WH;if(!noRoof)world.add(roof);
  // 收購站（北邊大倉庫前的角落）
  const sx=-H+5,sz=-H;
  box(4.4,3,2.2,texMat(M_.wood,2,1.5),sx,1.5,sz+1.35);
  const rf=box(5,.15,3,M_.dark,sx,3.15,sz+1.7);rf.rotation.x=-.12;
  plane(3.6,.9,signTex('SELL COINS','#3b2414','#f3e3c0','收購站'),sx,2.45,sz+2.47);
  const hgx=Math.floor(sx),hgz=Math.floor(sz+3.6);sellTile=tkey(hgx,hgz);
  const hx=hgx+.5,hz2=hgz+.5;
  hopper=new THREE.Group();hopper.position.set(hx,0,hz2);world.add(hopper);
  const fun=new THREE.Mesh(new THREE.CylinderGeometry(.85,.32,.75,20,1,true),new THREE.MeshStandardMaterial({color:0x9aa3a8,metalness:.8,roughness:.35,side:THREE.DoubleSide}));fun.position.y=1.15;fun.castShadow=true;hopper.add(fun);
  for(const[a,b]of[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]])box(.07,.8,.07,M_.dark,a,.4,b,hopper);
  box(.7,.05,.7,M_.steel,0,.78,0,hopper);
  const hin=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.4),new THREE.MeshBasicMaterial({map:signTex('COIN IN','#e9e1cc','#2a1c10')}));hin.position.set(0,2.05,-.2);hopper.add(hin);
  box(.06,.7,.06,M_.dark,-.7,1.75,-.2,hopper);box(.06,.7,.06,M_.dark,.7,1.75,-.2,hopper);
  box(.12,3.2,.12,M_.dark,sx+2.6,1.6,sz+2.8);
  const face=new THREE.Mesh(new THREE.CircleGeometry(.75,40),new THREE.MeshBasicMaterial({map:gaugeTex}));face.position.set(sx+2.6,3.4,sz+2.88);world.add(face);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.76,.05,8,40),M_.wood);rim.position.copy(face.position);world.add(rim);
  gaugeNeedle=new THREE.Group();gaugeNeedle.position.set(sx+2.6,3.4,sz+2.9);world.add(gaugeNeedle);
  const nd=new THREE.Mesh(new THREE.BoxGeometry(.04,.62,.01),new THREE.MeshBasicMaterial({color:0xc0201a}));nd.position.y=.28;gaugeNeedle.add(nd);
  // 黑色價格立牌
  priceCanvas=document.createElement('canvas');priceCanvas.width=256;priceCanvas.height=200;priceTex=new THREE.CanvasTexture(priceCanvas);drawPrice();
  const pb=new THREE.Group();pb.position.set(sx+4.2,0,sz+3.8);pb.rotation.y=-.5;world.add(pb);
  const pbf=new THREE.Mesh(new THREE.PlaneGeometry(1,.8),new THREE.MeshBasicMaterial({map:priceTex}));pbf.position.set(0,.85,.04);pbf.rotation.x=-.18;pb.add(pbf);
  const pbb=box(1.05,.85,.04,M_.dark,0,.83,0,pb);pbb.rotation.x=-.18;
  box(.04,.9,.04,M_.dark,-.45,.45,.25,pb);box(.04,.9,.04,M_.dark,.45,.45,.25,pb);
  for(let k=0;k<4;k++)box(.9,.5,.6,new THREE.MeshStandardMaterial({color:0xc9a85e,roughness:1}),sx-1.4+(k%2)*.95,.25+Math.floor(k/2)*.5,sz+3.1);
  obstacles.push({x:sx,z:sz+1.3,r:1.3},{x:sx-1.3,z:sz+1.3,r:1.2},{x:sx+1.3,z:sz+1.3,r:1.2},{x:hx,z:hz2,r:.45},{x:sx+2.6,z:sz+2.8,r:.2},{x:sx-.9,z:sz+3.1,r:1},{x:sx+4.2,z:sz+3.8,r:.4});
  // SUPPLY CO.（五金行，東牆）
  box(2.6,3,5.4,texMat(M_.wood,1.5,1.5),H-1.3,1.5,0);
  box(1,1.05,4.6,texMat(M_.wood,1,.6),H-3.1,.52,0);
  box(3.8,.15,6.2,M_.dark,H-2,3.1,0);
  plane(3.6,.8,signTex('SUPPLY CO.','#e9e1cc','#2a1c10','五金行'),H-2.62,2.5,0,-Math.PI/2);
  const reg=box(.4,.3,.35,new THREE.MeshStandardMaterial({color:0x5a2a12,metalness:.6,roughness:.4}),H-3.1,1.2,.6);
  const bk=new THREE.Mesh(new THREE.CylinderGeometry(.2,.16,.35,14),M_.wood);bk.position.set(H-3.1,1.22,-1.4);bk.castShadow=true;world.add(bk);
  box(.05,.05,.8,M_.wood,H-3.1,1.08,1.6);box(.2,.02,.25,M_.steel,H-3.1,1.08,2.05);
  shopPos={x:H-4.4,z:0};
  obstacles.push({x:H-2.8,z:-1.8,r:1.1},{x:H-2.8,z:0,r:1.1},{x:H-2.8,z:1.8,r:1.1});
  // 訂單板 Deliveries（五金行北邊的牆上）
  boardCanvas=document.createElement('canvas');boardCanvas.width=512;boardCanvas.height=320;boardTex=new THREE.CanvasTexture(boardCanvas);
  // 訂單板 Deliveries 在鐵捲門旁邊的牆上（照原作）
  const bx=-4.6;box(3.4,2.2,.2,M_.wood,bx,1.9,H-.35);
  plane(3.2,2,boardTex,bx,1.9,H-.52,Math.PI);
  boardPos={x:bx,z:H-2.2};drawBoard();
  // 出貨口：加工品送到這裡就會裝上卡車
  const dgx=Math.floor(H-1.5),dgz=Math.floor((GATE0+GATE1)/2-.5);dockTile=tkey(dgx,dgz);
  box(.98,.35,.98,texMat(M_.wood,1,1),dgx+.5,.175,dgz+.5);
  plane(1.4,.36,signTex('LOADING','#e9e1cc','#2a1c10','出貨口'),dgx+.5,1.6,dgz+.5-.55,Math.PI);
  box(.05,1.6,.05,M_.dark,dgx-.1,.8,dgz);box(.05,1.6,.05,M_.dark,dgx+1.1,.8,dgz);
  truck.g=buildTruck();truck.g.rotation.y=-Math.PI/2;truck.base=H+3.6;truck.g.position.set(truck.base+truck.x,0,dgz+.5);world.add(truck.g);
  // 角落的梯子和木箱
  const lad=new THREE.Group();lad.position.set(X0+1,0,H-3);lad.rotation.z=.25;world.add(lad);
  box(.06,2.6,.06,M_.wood,0,1.3,-.25,lad);box(.06,2.6,.06,M_.wood,0,1.3,.25,lad);for(let k=0;k<6;k++)box(.05,.05,.5,M_.wood,0,.3+k*.4,0,lad);
  for(let k=0;k<3;k++)box(.7,.6,.7,M_.wood,X0+1+k*.75,.3,H-5.2);
  obstacles.push({x:X0+1.8,z:H-5.2,r:1.1});
  linColors(world);
}
let EXT=0,dockTile='',floorMat=null;const GATE0=7,GATE1=10.6;
function drawPrice(){if(!priceCanvas)return;const g=priceCanvas.getContext('2d');g.fillStyle='#16161a';g.fillRect(0,0,256,200);g.strokeStyle='#ddd';g.lineWidth=4;g.strokeRect(6,6,244,188);g.fillStyle='#fff';g.textAlign='center';g.font='bold 52px "Segoe UI",sans-serif';g.fillText('$'+priceEach().toFixed(4),128,92);g.font='bold 40px "Microsoft JhengHei",sans-serif';g.fillText('每枚',128,156);priceTex.needsUpdate=true}
// 訂單的時間限制：時間內完成拿全額，遲交只拿一半
function ordTimeTxt(){const o=G&&ORDERS[G.order];if(!o)return '';const l=o.min*60-(G.ordT||0);return l>0?'剩 '+Math.floor(l/60)+':'+String(Math.floor(l%60)).padStart(2,'0'):'遲交了（獎勵減半）'}
function drawBoard(){
  if(!boardCanvas)return;const g=boardCanvas.getContext('2d');
  g.fillStyle='#7a5434';g.fillRect(0,0,512,320);g.fillStyle='#1e1e1e';g.fillRect(0,0,512,64);
  g.fillStyle='#f1ead8';g.font='bold 44px "Segoe UI",sans-serif';g.textAlign='center';g.fillText('Deliveries',256,48);
  g.fillStyle='#ece6d6';g.fillRect(126,74,260,28);g.fillStyle='#222';g.font='bold 18px "Microsoft JhengHei",sans-serif';g.fillText('剩餘硬幣　'+(G?fmt(G.left):'—'),256,95);
  const o=G&&ORDERS[G.order];
  g.fillStyle='#ece6d6';g.fillRect(40,116,200,180);g.fillStyle='#c22';g.beginPath();g.arc(140,118,7,0,7);g.fill();
  g.fillStyle='#222';g.textAlign='left';g.font='14px "Microsoft JhengHei",sans-serif';
  if(o){g.fillText('訂單'+(G.order+1)+'/'+ORDERS.length,54,146);g.font='bold 22px "Microsoft JhengHei",sans-serif';g.fillText(o.name,54,178);g.font='bold 28px sans-serif';g.fillText(fmtS(Math.min(G.ordProg,o.n))+' / '+fmtS(o.n),54,222);g.font='14px "Microsoft JhengHei",sans-serif';g.fillText('獎勵 '+money(o.rw)+'　'+ordTimeTxt(),54,256);g.fillText(G.pinned?'已釘選':'E 釘選這張訂單',54,282)}
  else{g.font='bold 20px "Microsoft JhengHei",sans-serif';g.fillText('訂單都完成了',54,190)}
  g.fillStyle='#ece6d6';g.fillRect(280,116,190,80);g.fillStyle='#c22';g.beginPath();g.arc(375,118,7,0,7);g.fill();
  g.fillStyle='#222';g.font='bold 20px "Microsoft JhengHei",sans-serif';g.textAlign='center';g.fillText('清倉',375,150);g.font='13px "Microsoft JhengHei",sans-serif';g.fillText('把做好的東西全部賣掉',375,178);
  const nx=G&&ORDERS[G.order+1];
  g.fillStyle='#ece6d6';g.fillRect(280,210,190,86);g.fillStyle='#222';g.font='bold 18px "Microsoft JhengHei",sans-serif';g.fillText('下一批',375,236);g.font='13px "Microsoft JhengHei",sans-serif';g.fillText(nx?nx.name:'—',375,262);g.fillText(nx?'獎勵 '+money(nx.rw):'',375,284);
  boardTex.needsUpdate=true;
}

