// ================= 機器設定（看著機器按 E） =================
let cfgT=null;
function cfgDef(t){
  const T=t.type,S=[],lk=(id,n)=>!lv(id)&&'要先在科技樹解鎖「'+n+'」';
  if(T==='arm'||T==='arm2'||T==='arm3'){
    S.push({title:'從哪裡拿',key:'from',def:'pile',opts:[['pile','硬幣堆'],['belt','後面的輸送帶',lk('links','手臂連輸送帶')],['over','輸送帶塞住才拿',lk('overflow','溢流手臂')]]});
    S.push({title:'從輸送帶拿哪些種類（都沒勾就全部拿）',key:'kinds',multi:true,opts:KINDS.map(k=>[k,kindName(k),lk('links','手臂連輸送帶')])});
    S.push({title:'先拿什麼（有 1 元的一定先拿）',key:'order',def:'loose',opts:[['loose','散硬幣'],['big','最大的'],['near','最近的']].map(o=>[...o,lk('pickOrder','拿取順序')])});
  }
  if(T==='split'||T==='splitU'||T==='split3'){const nm=T==='split'?['左邊','右邊']:T==='splitU'?['前面','右邊']:['左邊','前面','右邊'];
    S.push({title:'分流方式',key:'prio',def:0,opts:[[0,'輪流分'],...nm.map((n,k)=>[k+1,n+'優先',lk('prio','分流器優先')])]})}
  if(T==='smart'){smartKinds(t);['往左','直走','往右'].forEach((n,k)=>S.push({title:n+'的出口收哪些東西',key:'kinds',idx:k,multi:true,opts:KINDS.map(x=>[x,kindName(x)])}))}
  if(T==='rake')S.push({title:'把硬幣丟多遠（往後幾公尺）：讓硬幣落在輸送帶上，或落進地上的水桶、手推車裡',key:'throwD',def:1,opts:[[1,'1 公尺'],[2,'2 公尺'],[3,'3 公尺'],[4,'4 公尺']]});
  if(T==='tube')S.push({title:'發射距離',key:'dist',def:8,opts:[2,3,4,5,6,7,8].map(v=>[v,v+' 公尺'])});
  if(T==='pellet'&&lv('swivel'))S.push({title:'出料口轉向',key:'outSide',def:0,opts:[[0,'前面'],[1,'左邊'],[2,'右邊']]});
  if(T==='silo'){const top=siloTop();S.push({title:'每分鐘放幾批（每批 '+siloLoad()+' 枚，最多 '+top+' 批）',key:'lpm',def:10,opts:[0,5,10,20,30,40,60,80,100,120].filter(v=>v<=top).map(v=>[v,v?v+' 批':'關閉'])})}
  if(T==='switch')return switchDef(t);
  // 有開關箱的時候，有電的機器都可以貼標籤
  if(needPower(t)&&countType('switch'))S.push({title:'開關箱標籤',key:'tag',def:null,opts:[[null,'沒有'],...G.tags.map((g,k)=>[k,g.name+(g.on?'':'（關）')])]});
  return S.length?S:null;
}
function switchDef(){
  const cnt=k=>[...tiles.values()].filter(t=>t.tag===k).length;
  return G.tags.map((g,k)=>({title:'標籤 '+'ABCDEFGH'[k]+'：'+g.name+'（'+cnt(k)+' 台）',opts:[['on','開'],['off','關'],['high','優先'],['normal','一般'],['ren','改名']],
    cur:v=>v==='on'?g.on:v==='off'?!g.on:v==='high'?g.high:v==='normal'?!g.high:false,
    apply:v=>{if(v==='on'||v==='off')g.on=v==='on';else if(v==='high'||v==='normal')g.high=v==='high';else{const n=prompt('標籤名稱',g.name);if(n)g.name=n.slice(0,12)}}}));
}
function openCfg(t){cfgT=t;const b=BIT[t.type];$('cfgI').textContent=b.icon;$('cfgT').textContent=b.name;openPanel('cfgPanel')}
function renderCfg(){
  const t=cfgT;if(!t)return;const S=cfgDef(t)||[];
  let h=S.map((s,si)=>'<h4>'+s.title+'</h4><div class="opts">'+s.opts.map(([v,label,lock])=>{
    const cur=s.cur?s.cur(v):s.multi?(s.idx!=null?t[s.key][s.idx]:t[s.key]||[]).includes(v):(t[s.key]??s.def)===v;
    return '<button class="ob'+(cur?' on':'')+'" data-cfg="'+si+'|'+encodeURIComponent(JSON.stringify(v))+'"'+(lock?' disabled title="'+lock+'"':'')+'>'+label+'</button>'}).join('')+'</div>').join('');
  h+='<div class="st">'+machineInfo(t)+'</div>';
  if(t.net&&t.net.tiles.some(isGen))h+='<h4>電</h4><div class="opts"><button class="ob" data-cfgline>'+(t.net.off?'打開':'關閉')+'整條線路</button></div>';
  $('cfgBd').innerHTML=h;
}
function cfgClick(b){
  const t=cfgT;if(!t)return;
  if(b.dataset.cfgline!==undefined){toggleLine(t);rebuildPower();return}
  const[si,raw]=b.dataset.cfg.split('|'),s=cfgDef(t)[+si],v=JSON.parse(decodeURIComponent(raw));
  if(s.apply)s.apply(v);
  else if(s.multi){const a=s.idx!=null?t[s.key][s.idx]:(t[s.key]=t[s.key]||[]),k=a.indexOf(v);if(k>=0)a.splice(k,1);else a.push(v)}
  else t[s.key]=v;
  powerDirty=true;tone(800,.04,'square',.03);
}

