// ================= 開局 / 讀檔 =================
function newG(name,size,seed){const S=SIZES[size||'small'];return{name,size,seed,money:0,earned:0,onesFound:0,onesHand:0,onesLost:0,dug:0,left:S.coins,removed:0,carry:0,autoSold:0,coinsSold:0,rollsSold:0,lostCoins:0,tool:'hand',tools:{},ups:{},coll:{},flags:{},step:0,doorOpen:false,freeRake:false,gotFreeRake:false,combo:0,comboT:0,bestCombo:1,rate:0,rateAcc:0,beltAcc:0,order:0,ordProg:0,pinned:false,play:0,thrown:0,held:[],tags:defTags(),marked:[]}}
const defTags=()=>[...'ABCDEFGH'].map(c=>({name:c,on:true,high:false}));
function setupLevel(seed,size,mask){
  generate(seed,size,mask);
  H=SIZES[size].hf?48:G&&G.H?G.H:Math.max(14,Math.ceil(.21*Math.cbrt(SIZES[size].inst)+8));
  tiles.forEach(t=>{if(t.mesh){tileRoot.remove(t.mesh);disposeObj(t.mesh)}if(t.dm){scene.remove(t.dm);disposeObj(t.dm)}});tiles=new Map();occ=new Map();items=[];oneObjs=[];flying.length=0;sellQ=[];
  pipes.forEach(p=>{pipeRoot.remove(p.mesh);disposeObj(p.mesh)});pipes=new Map();waterDirty=true;
  structs.forEach(x=>{structRoot.remove(x.mesh);disposeObj(x.mesh)});structs=[];rebuildStructIndex();undoStack.length=0;topV=null;
  truck.x=0;truck.state='park';truck.load=0;
  buildWorld();shadowDirty=true;powerDirty=true;
  for(const k of[sellTile,dockTile]){const o={type:k===sellTile?'sell':'dock',gx:+k.split(',')[0],gz:+k.split(',')[1],dir:0,pw:1};tiles.set(k,o);occ.set(k,o)}
}
let introT=0;
function startGame(slot,data){
  $('loading').classList.remove('hidden');$('loading').textContent='載入中…';
  lock(true);
  setTimeout(()=>{
    slotIdx=slot;
    if(data.mask){const s=atob(data.mask),mask=new Uint8Array(s.length);for(let k=0;k<s.length;k++)mask[k]=s.charCodeAt(k);
      G=Object.assign(newG(data.name,data.size,data.seed),data.G);G.build=null;G.removed=0;if(!G.tags)G.tags=defTags();if(!G.held)G.held=[];if(!G.marked)G.marked=[];
      setupLevel(data.seed,data.size,mask);for(let i=0;i<M;i++)if(st[i]===0)G.removed++;
      if(HFm&&data.anch)anchors=new Set(data.anch);
      if(data.tiles.some(x=>x[0]==='gen'||x[0]==='pole'))G.ups.genBP=1;
      // 舊存檔：機器變大以後如果會壓到旁邊的東西，就維持一格大小
      const resv=new Set(data.tiles.map(x=>tkey(x[1],x[2],(x[5]&&x[5].L)||0)));
      for(const[type,gx,gz,dir,paid,ex]of data.tiles){const ty=type==='press'?'pellet':type;if(!BIT[ty])continue;const L=(ex&&ex.L)||0,own=tkey(gx,gz,L);
        const cmp=FP[ty]&&fpCells(ty,gx,gz,dir).some(([x,z])=>{const k=tkey(x,z,L);return k!==own&&resv.has(k)});addTile(ty,gx,gz,dir,paid,cmp?{...ex,cmp:true}:ex)}
      for(const[type,gx,gz,dir,paid]of data.pipes||[])addPipe(type,gx,gz,dir,paid)
      for(const x of data.structs||[])addStruct(x)}
    else{G=newG(data.name,data.size,data.seed);G.gmode=data.gmode||'normal';if(data.daily)G.daily=data.daily;if(data.vs)G.vs=data.vs;if(!SIZES[data.size].hf)G.H=Math.max(14,Math.ceil(.21*Math.cbrt(SIZES[data.size].inst)+8))+8;setupLevel(data.seed,data.size,null)}
    doorOpenAmt=G.doorOpen?1:0;door.position.y=1.35+doorOpenAmt*2.6;
    Object.assign(pl,G.doorOpen?{x:0,z:H-3,yaw:0}:{x:0,z:H+2.4,yaw:0},{y:0,vy:0,pitch:-.05,stam:1,jet:10,air:0});
    $('loading').classList.add('hidden');$('menu').classList.add('hidden');
    drawPrice();drawBoard();
    if(!data.mask){mode='intro';introT=0;['lbT','lbB','skip'].forEach(i=>$(i).classList.remove('hidden'));saveGame(true)}
    else beginPlay();
  },60);
}
function beginPlay(){if(HFm&&pourK<1){pourK=1;hf.set(hfT);hfSync(true)}['lbT','lbB','skip'].forEach(i=>$(i).classList.add('hidden'));$('hud').classList.remove('hidden');mode='play';renderHotbar();tipT=0;if(!locked)lock()}
function toMenu(){
  if(G)saveGame(true);
  mode='menu';panel=null;G=null;unlock();
  ['shopPanel','techPanel','buildPanel','boardPanel','cabPanel','cfgPanel','statPanel','ovPanel','appraise','pausePanel','setPanel','endPanel','card'].forEach(p=>$(p).classList.add('hidden'));
  $('hud').classList.add('hidden');$('menu').classList.remove('hidden');showMenu('main');menuScene();
}
function menuScene(){G=newG('menu','std',menuSeed);setupLevel(menuSeed,'std',null);door.position.y=1.35+2.6;G=null}

