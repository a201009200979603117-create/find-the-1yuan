// ================= 日夜循環、天氣、挖硬幣的效果、拍照模式 =================
// 一天 16 分鐘；晚上不會全黑，工作燈和手電筒（L）才有用
const DAY_LEN=16*60;
const SKY_KEYS=[[0,0x050b1e,0x16223c,0x8aa0ff,.22,.24],[5,0x0d1a38,0x34344f,0x9aa8ff,.22,.26],[6.5,0x4a6fb0,0xf0a070,0xffb070,1.1,.5],[8,0x3f86d6,0xd8e8f2,0xfff0d8,1.9,.75],
  [16.5,0x3f86d6,0xd8e8f2,0xfff0d8,1.9,.75],[18,0x3a5aa0,0xf08850,0xff9050,1.1,.5],[19.5,0x0d1a38,0x2c2c4a,0x9aa8ff,.22,.26],[24,0x050b1e,0x16223c,0x8aa0ff,.22,.24]];
const _ca=new THREE.Color(),_cb=new THREE.Color(),envTop=new THREE.Color(),envHor=new THREE.Color(),envSun=new THREE.Color(),RAINGRAY=new THREE.Color(0x6d737a).convertSRGBToLinear();
let envT=0,sunT=0,wetness=0;
const headlamp=new THREE.SpotLight(0xfff1d6,0,22,.55,.5,1.4);camera.add(headlamp);headlamp.target.position.set(0,0,-1);camera.add(headlamp.target);
function envAt(h){let a=SKY_KEYS[0],b=SKY_KEYS[1];for(let k=0;k<SKY_KEYS.length-1;k++)if(h>=SKY_KEYS[k][0]&&h<=SKY_KEYS[k+1][0]){a=SKY_KEYS[k];b=SKY_KEYS[k+1];break}
  const f=(h-a[0])/Math.max(.001,b[0]-a[0]),mix=(i,out)=>out.copy(_ca.setHex(a[i]).convertSRGBToLinear()).lerp(_cb.setHex(b[i]).convertSRGBToLinear(),f);
  mix(1,envTop);mix(2,envHor);mix(3,envSun);return{sun:a[4]+(b[4]-a[4])*f,amb:a[5]+(b[5]-a[5])*f}}
const isNight=()=>G&&SET.daynight!==false&&(G.tod<6||G.tod>19);
function updateEnv(dt){
  if(G&&mode==='play'&&SET.daynight!==false)G.tod=((G.tod??9)+dt/DAY_LEN*24)%24;
  const h=G&&SET.daynight!==false?(G.tod??9):12,rain=G&&G.wx?G.wx.rain:0;
  envT-=dt;if(envT>0)return;envT=.4;
  const e=envAt(h);envTop.lerp(RAINGRAY,rain*.6);envHor.lerp(RAINGRAY,rain*.7);
  if(skyGeo){const ps=skyGeo.attributes.position,cs=skyGeo.attributes.color;for(let i=0;i<ps.count;i++){const t=Math.max(0,ps.getY(i)/320);_ca.copy(envHor).lerp(envTop,Math.pow(t,.55));cs.setXYZ(i,_ca.r,_ca.g,_ca.b)}cs.needsUpdate=true}
  scene.fog.color.copy(envHor);scene.background.copy(envHor);
  const night=e.sun<.5;clouds.forEach(c=>{c.material.opacity=(night?.25:.85)*(1-rain*.3)+rain*.15;c.material.color.copy(envHor).lerp(_ca.setRGB(1,1,1),night?.1:.8)});
  sun.color.copy(envSun);sun.intensity=e.sun*(1-rain*.55);hemi.intensity=e.amb*(1-rain*.25);
  // 太陽每 5 秒移動一次（移動就要重算陰影）
  sunT-=.4;if(sunT<=0){sunT=5;const ang=(h-6)/12*Math.PI,up=Math.sin(ang),sx=Math.cos(ang),k=up>.05?1:-1;
    sun.position.set(H*.9*sx*k,Math.max(12,40*Math.abs(up)+10),H*.35);shadowDirty=true}
  for(const t of tiles.values())if(t.light)t.light.intensity=night?1.6:.45;
  LANT_M.emissiveIntensity=night?2.4:.25;
  // 下過雨地上會濕、比較反光
  wetness+=(rain-wetness)*.05;if(floorMat){floorMat.roughness=1-.55*wetness;floorMat.color.setScalar(1-.28*wetness)}
  if(G){const hh=Math.floor(h),mm=Math.floor((h%1)*60);$('clock').textContent=(SET.daynight===false?'':(night?'🌙 ':'☀ ')+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'))+(rain>.2?'　🌧 下雨':'')}
}
// 下雨：每隔一段時間可能下一陣雨；雨絲畫在屋頂上面（沒有屋頂就落到地上）
const RAIN_N=1400,rainGeo=new THREE.BufferGeometry(),rainPos=new Float32Array(RAIN_N*6);rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rainMesh=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xb8c6d4,transparent:true,opacity:0,depthWrite:false}));rainMesh.frustumCulled=false;rainMesh.visible=false;scene.add(rainMesh);
const rainSeed=new Float32Array(RAIN_N*3);for(let i=0;i<RAIN_N;i++){rainSeed[i*3]=Math.random()*50-25;rainSeed[i*3+1]=Math.random();rainSeed[i*3+2]=Math.random()*50-25}
function updateWeather(dt){
  if(!G)return;G.wx=G.wx||{rain:0,target:0,next:240};const w=G.wx;
  if(mode==='play'&&SET.weather!==false){w.next-=dt;if(w.next<=0){const was=w.target;w.target=w.target>0?0:Math.random()<.45?1:0;if(was>0&&!w.target&&!isNight())rainbowT=100;w.next=w.target?90+Math.random()*120:240+Math.random()*360}}else if(SET.weather===false)w.target=0;
  w.rain+=(w.target-w.rain)*Math.min(1,dt*.15);
  rainMesh.visible=w.rain>.02;if(!rainMesh.visible)return;
  rainMesh.material.opacity=.4*w.rain;const roof=SIZES[G.size].hf?0:10.8,top=roof+22,cx=camera.position.x,cz=camera.position.z,t=performance.now()/1000;
  for(let i=0;i<RAIN_N;i++){const x=cx+rainSeed[i*3],z=cz+rainSeed[i*3+2],f=(rainSeed[i*3+1]+t*1.3)%1,y=top-f*(top-roof),o=i*6;rainPos[o]=x;rainPos[o+1]=y;rainPos[o+2]=z;rainPos[o+3]=x+.05;rainPos[o+4]=y-.7;rainPos[o+5]=z}
  rainGeo.attributes.position.needsUpdate=true;
}
// 挖硬幣、丟硬幣的時候噴出小硬幣，還會閃一下
const PMAX=260,partMat=share(new THREE.MeshStandardMaterial({color:0xffffff,metalness:.85,roughness:.28})),partMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.065,.065,.014,10),partMat,PMAX);
partMesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(PMAX*3).fill(1),3);partMesh.frustumCulled=false;partMesh.count=0;scene.add(partMesh);
const glintTex=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,240,1)');gr.addColorStop(.25,'rgba(255,240,180,.6)');gr.addColorStop(1,'rgba(255,220,120,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)});
const glints=[...Array(16)].map(()=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glintTex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0}));sp.visible=false;scene.add(sp);sp.life=0;return sp});
const parts=[],PCOL=[[.95,.78,.36],[.88,.89,.9],[.8,.82,.83]],_e=new THREE.Euler();
function burst(x,y,z,n,up){for(let k=0;k<n;k++){if(parts.length>=PMAX)parts.shift();const a=Math.random()*6.283,sp=.8+Math.random()*1.6;
    parts.push({x,y,z,vx:Math.cos(a)*sp,vy:(up||2.2)+Math.random()*1.8,vz:Math.sin(a)*sp,rx:Math.random()*3,ry:Math.random()*3,w:(Math.random()-.5)*20,life:.9+Math.random()*.5,c:PCOL[Math.random()<.2?0:Math.random()<.5?1:2]})}
  const g=glints.find(s=>s.life<=0);if(g){g.position.set(x,y+.15,z);g.life=.35;g.visible=true;g.scale.setScalar(.5)}}
function updateParts(dt){
  for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.life-=dt;if(q.life<=0){parts.splice(i,1);continue}
    q.vy-=12*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.rx+=q.w*dt;const gy=G?(HFm?hfAt(q.x,q.z):groundAt(q.x,q.z)):0;
    if(q.y<gy+.01){q.y=gy+.01;q.vy*=-.35;q.vx*=.6;q.vz*=.6;q.w*=.6}}
  let k=0;for(const q of parts){if(k>=PMAX)break;_q.setFromEuler(_e.set(q.rx,q.ry,0));_p.set(q.x,q.y,q.z);const sc=Math.min(1,q.life*3);_s.set(sc,sc,sc);_m.compose(_p,_q,_s);partMesh.setMatrixAt(k,_m);partMesh.setColorAt(k,_c.setRGB(q.c[0],q.c[1],q.c[2]));k++}
  partMesh.count=k;if(k){partMesh.instanceMatrix.needsUpdate=true;partMesh.instanceColor.needsUpdate=true}
  for(const g of glints)if(g.life>0){g.life-=dt;g.material.opacity=Math.max(0,g.life/.35);g.scale.setScalar(.5+(.35-g.life)*3);if(g.life<=0)g.visible=false}
}
// 拍照模式：P 進入，WASD 飛、空白鍵上升、C 下降、Shift 加速，Enter 存成圖片
let photo=null;
function enterPhoto(){if(!G||G.build)return;photo={x:camera.position.x,y:camera.position.y,z:camera.position.z,hud:hudOff};hudOff=true;$('hud').classList.add('off');mode='photo';toast('拍照模式：WASD 飛、空白鍵／C 上下、Enter 存圖、P 離開')}
function exitPhoto(){if(!photo)return;hudOff=photo.hud;$('hud').classList.toggle('off',hudOff);photo=null;mode='play'}
function updatePhoto(dt){const sp=(keys.has('ShiftLeft')?12:4)*dt,cp=Math.cos(pl.pitch),fx=-Math.sin(pl.yaw)*cp,fy=Math.sin(pl.pitch),fz=-Math.cos(pl.yaw)*cp,rx=Math.cos(pl.yaw),rz=-Math.sin(pl.yaw);
  if(keys.has('KeyW')){photo.x+=fx*sp;photo.y+=fy*sp;photo.z+=fz*sp}if(keys.has('KeyS')){photo.x-=fx*sp;photo.y-=fy*sp;photo.z-=fz*sp}
  if(keys.has('KeyD')){photo.x+=rx*sp;photo.z+=rz*sp}if(keys.has('KeyA')){photo.x-=rx*sp;photo.z-=rz*sp}if(keys.has('Space'))photo.y+=sp;if(keys.has('KeyC'))photo.y=Math.max(.3,photo.y-sp);
  camera.position.set(photo.x,photo.y,photo.z);camera.rotation.set(pl.pitch,pl.yaw,0)}
function savePhoto(){G.flags.photo=true;renderer.render(scene,camera);const d=new Date(),z=n=>String(n).padStart(2,'0'),bin=atob(cv.toDataURL('image/png').split(',')[1]),b=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)b[i]=bin.charCodeAt(i);tone(1500,.05);
  giveFile(new File([b],'大海撈一元_'+d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+'_'+z(d.getHours())+z(d.getMinutes())+z(d.getSeconds())+'.png',{type:'image/png'}),'照片存好了')}


