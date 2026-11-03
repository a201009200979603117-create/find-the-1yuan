const $=id=>document.getElementById(id);
function fatal(msg){document.body.innerHTML='<div style="color:#eee;padding:30px;font:16px/1.8 sans-serif;max-width:600px">'+msg+'<br><button onclick="location.reload()" style="margin-top:16px;padding:8px 20px;font-size:16px">重新整理</button></div>';document.body.style.cssText='background:#111;overflow:auto;user-select:text';throw new Error(msg)}
if(!window.THREE)fatal('沒辦法載入 3D 引擎（three.js）。<br>請確認網路連線，再重新整理一次。加入主畫面的話，要先連網打開過一次才能離線玩。');
{const c=document.createElement('canvas'),gl=c.getContext('webgl2')||c.getContext('webgl');if(!gl)fatal('這個瀏覽器沒辦法顯示 3D 畫面（WebGL）。<br>請換成 Chrome、Edge 或 Safari，或到瀏覽器設定打開「硬體加速」再試一次。');const x=gl.getExtension('WEBGL_lose_context');if(x)x.loseContext()}
// 錯誤回報：出錯時記下來，畫面上跳一條，點了可以複製錯誤資訊給開發者
const ERRS=[];
function logErr(m,at,st){m=String(m||'').slice(0,200);if(!m||/ResizeObserver/.test(m)||/^Script error\.?$/.test(m)&&!at||/extension:\/\//.test(at||''))return;
  const o=ERRS.find(e=>e.m===m&&e.at===at);if(o){o.n++;return}if(ERRS.length>=10)return;
  ERRS.push({m,at:at||'',st:String(st||'').split('\n').slice(1,4).map(x=>x.trim()).join(' ← ').slice(0,300),n:1});const b=$('errBar');if(b)b.classList.remove('hidden')}
addEventListener('error',e=>{if(e.target!==window)return;logErr(e.message,(e.filename||'').split('/').pop()+':'+e.lineno+':'+e.colno,e.error&&e.error.stack)},true);
addEventListener('unhandledrejection',e=>{const r=e.reason;if(r&&/AbortError|NotAllowedError/.test(r.name))return;logErr('Promise：'+(r&&r.message||r),'',r&&r.stack)});
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const fmt=n=>Math.round(n).toLocaleString('en-US');
const fmtS=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(Math.round(n));
const money=n=>n>=1000?'$'+fmt(Math.floor(n)):'$'+n.toFixed(2);

