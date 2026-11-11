// ================= 存檔 =================
const SKEY='find_the_1yuan_saves_v2';
function loadSlots(){try{const a=JSON.parse(localStorage.getItem(SKEY));if(Array.isArray(a))return a}catch(e){}return[null,null,null]}
function writeSlots(a){try{localStorage.setItem(SKEY,JSON.stringify(a));return true}catch(e){toast('存檔失敗：瀏覽器不允許儲存','red');return false}}
function snapshot(){
  const bits=new Uint8Array(Math.ceil(M/8));
  for(let i=0;i<M;i++)if(st[i]===0)bits[i>>3]|=1<<(i&7);
  let s='';for(let k=0;k<bits.length;k+=8192)s+=String.fromCharCode.apply(null,bits.subarray(k,k+8192));
  const g={...G};delete g.build;
  sellQ.forEach(q=>{g.money+=q.left*priceEach()*q.mul});
  // 地上的硬幣堆和輸送帶上的東西不存，直接算回硬幣堆
  items.forEach(it=>{if(!it.prod)g.left+=it.n;g.onesHand+=it.ones||0});g.onesHand+=oneObjs.length;
  return{name:G.name,size:G.size,seed:G.seed,date:Date.now(),mask:HFm?hfEncode():btoa(s),anch:HFm?[...anchors]:undefined,G:g,tiles:[...tiles.values()].filter(t=>t.type!=='sell'&&t.type!=='dock').map(tileData),
    pipes:[...pipes.values()].map(p=>[p.type,p.gx,p.gz,p.dir,p.paid||0]),structs:structs.map(x=>{const o={...x};delete o.mesh;return o})};
}
function saveGame(quiet){if(!G||slotIdx<0)return;const a=loadSlots(),old=a[slotIdx];a[slotIdx]=snapshot();if(old&&old.locked)a[slotIdx].locked=true;if(writeSlots(a)&&!quiet)toast('已存檔');cloudSoon(slotIdx,!quiet)}
setInterval(()=>{if(mode==='play')saveGame(true)},30000);
addEventListener('beforeunload',()=>{if(G&&(mode==='play'||mode==='pause'))saveGame(true)});

