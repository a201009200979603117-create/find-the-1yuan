// ================= 英文版：畫面上的中文在顯示之前換成英文 =================
// 遊戲程式裡還是用中文；寫進畫面（innerHTML、textContent、畫布上的字、對話框）的時候才查字典換掉。
// 沒設定過語言的話：瀏覽器是中文就用中文，其他語言用英文
const LANG=(()=>{try{const s=JSON.parse(localStorage.getItem('ft1y_settings')||'{}');if(s.lang==='zh'||s.lang==='en')return s.lang}catch(e){}return/^zh/i.test(navigator.language||'zh')?'zh':'en'})();
const HAN_RE=/[一-鿿　-〿！-？・～]/,EN_ON=LANG==='en';
let enRe=null;const enCache=new Map();
// 中文標點換成英文標點，片段之間補空白
const EN_PUNCT={'，':', ','。':'. ','、':', ','：':': ','；':'; ','！':'! ','？':'? ','（':' (','）':') ','「':' “','」':'” ','『':' “','』':'” ','・':' · ','～':'~','／':'/','＋':'+','　':' · '};
function L(s){
  if(!EN_ON||typeof s!=='string'||!HAN_RE.test(s))return s;
  let r=enCache.get(s);if(r!=null)return r;
  if(!enRe)enRe=new RegExp(Object.keys(EN_DICT).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  r=s.replace(enRe,m=>'\u0001'+EN_DICT[m]+'\u0001').replace(/[，。、：；！？（）「」『』・～／＋　]/g,c=>'\u0001'+EN_PUNCT[c]+'\u0001');
  r=r.replace(/^\u0001+|\u0001+$/g,'').replace(/\u0001+/g,' ').replace(/ {2,}/g,' ')
    .replace(/ ([,.!?:;)\]%”])/g,'$1').replace(/([(\[“$#]) /g,'$1').replace(/” ([,.!?:;)])/g,'”$1');
  // 原本頭尾沒有空白就拿掉；結尾是逗號、句號這類標點的話留著，後面接粗體字才不會黏在一起
  if(!/^[\s（「『]/.test(s))r=r.replace(/^ +/,'');if(!/[\s，。、：；！？）」』・]$/.test(s))r=r.replace(/ +$/,'');
  if(enCache.size>4000)enCache.clear();enCache.set(s,r);return r}
// HTML：只翻標籤外面的字，標籤裡只翻 title、placeholder（data-* 這些程式要用的值不能動）
// 中文的粗體字前後不會空格，翻成英文之後要補，不然「took<b>10:00</b>to」會黏成一串
function Lh(h){if(!EN_ON||!HAN_RE.test(h))return h;let last='',lastT=false;
  return h.split(/(<[^>]*>)/).map(p=>{if(p[0]==='<')return p.replace(/\b(title|placeholder|aria-label|alt)="([^"]*)"/g,(m,a,v)=>a+'="'+L(v)+'"');if(!p)return p;
    const t=HAN_RE.test(p);let r=L(p);if((t||lastT)&&/[\w%)”!?.,:]$/.test(last)&&/^[\w“($]/.test(r))r=' '+r;last=r;lastT=t;return r}).join('')}
// 英文版的手機說法：先翻成英文，再把鍵盤滑鼠的說法換成按鈕（中文版是 28-touch.js 的 TTR）
const TTEN_R=[[/scroll the mouse wheel or press C and V/gi,'tap "Zoom in" and "Zoom out" at the bottom right'],
  [/press 1 to switch back to your hands, then 2 to take the shovel out again/gi,'tap the tool button at the bottom center, switch to Hands, then back to the Toy Shovel'],
  [/in hotbar slot 2, right next to your bare hands/gi,'in the tool button at the bottom center'],[/a preview follows your mouse/gi,'a preview appears in the middle of the screen'],
  [/the yellow bar at the bottom left/gi,'the yellow bar at the bottom center'],[/hold left-click/gi,'hold "Grab"'],[/left-click/gi,'tap "Grab"'],[/hold right-click/gi,'hold "Throw"'],[/right-click/gi,'tap "Throw"'],
  [/middle-click/gi,'tap "Copy"'],[/hold Shift/gi,'push the stick all the way'],[/press Tab/gi,'tap "Tech" at the top left'],[/press B\b/gi,'tap "Build" at the top left'],
  [/hold E\b/gi,'hold "Use"'],[/press E\b/gi,'tap "Use"'],[/\bE to\b/g,'"Use" to'],[/press Q\b/gi,'tap "Drop"'],[/press R\b/gi,'tap "Rotate"'],[/\bR (rotates?|to turn)\b/g,'"Rotate" $1'],
  [/press X\b/gi,'tap "Remove"'],[/\bX (remove|back to building)\b/g,'"Remove" $1'],[/hold C\b/gi,'tap "Crouch"'],[/hold Space/gi,'hold "Jump"'],[/press G\b/gi,'tap "Grid" at the top left'],
  [/PageUp\/PageDown/g,'"Raise"/"Lower" at the top left'],[/B\/Esc to exit/g,'tap "Build" to exit'],[/\bN exits the blueprint/g,'tap "Blueprint" again to exit'],[/\bclick(s|ed|ing)?\b/gi,'tap$1']];
function TTEN(s){for(const[a,b]of TTEN_R)s=s.replace(a,(m,...g)=>{let r=typeof b==='string'?b.replace(/\$1/g,typeof g[0]==='string'?g[0]:''):b;return/^[A-Z]/.test(m)?r[0].toUpperCase()+r.slice(1):r});return s}
if(EN_ON){
  document.documentElement.lang='en';
  const ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML'),tc=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
  Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,get(){return ih.get.call(this)},set(v){ih.set.call(this,Lh(String(v)))}});
  Object.defineProperty(Node.prototype,'textContent',{configurable:true,get(){return tc.get.call(this)},set(v){tc.set.call(this,v==null?v:L(String(v)))}});
  const iah=Element.prototype.insertAdjacentHTML;Element.prototype.insertAdjacentHTML=function(p,h){return iah.call(this,p,Lh(String(h)))};
  const sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){return sa.call(this,n,/^(title|placeholder|aria-label|alt)$/.test(n)?L(String(v)):v)};
  // 畫布上的字（招牌、訂單板、統計圖、分享圖）；只有一個字的不翻，硬幣上的字是一個一個畫的
  const C2=CanvasRenderingContext2D.prototype,ct=t=>typeof t==='string'&&t.length>1?L(t):t;
  for(const f of['fillText','strokeText','measureText']){const o=C2[f];C2[f]=function(t,...a){return o.call(this,ct(t),...a)}}
  for(const f of['prompt','alert','confirm']){const o=window[f];window[f]=(m,...a)=>o.call(window,L(String(m)),...a)}
  document.title=L(document.title);
  // 原本就寫在網頁裡的字
  // （data-nt 的不翻：主選單的「1 元」是遊戲名字）
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let n;(n=w.nextNode());)if(HAN_RE.test(n.nodeValue)&&!n.parentElement.closest('[data-nt]'))n.nodeValue=L(n.nodeValue);
  document.querySelectorAll('[title],[placeholder],[aria-label],[alt]').forEach(e=>{for(const a of['title','placeholder','aria-label','alt'])if(e.hasAttribute(a))e.setAttribute(a,e.getAttribute(a))});
}
