// ================= 音效和音樂 =================
let ac=null,sfxG=null,musG=null,ambG=null,noiseBuf=null,pinkBuf=null;
function audio(){
  if(ac)return ac;
  try{ac=new (window.AudioContext||window.webkitAudioContext)();
    const lim=ac.createDynamicsCompressor();lim.threshold.value=-8;lim.knee.value=6;lim.ratio.value=12;lim.attack.value=.003;lim.release.value=.2;lim.connect(ac.destination);
    sfxG=ac.createGain();sfxG.connect(lim);musG=ac.createGain();musG.connect(lim);ambG=ac.createGain();ambG.connect(sfxG);
    noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    pinkBuf=ac.createBuffer(1,ac.sampleRate*4,ac.sampleRate);const q=pinkBuf.getChannelData(0);let b0=0,b1=0,b2=0;for(let i=0;i<q.length;i++){const w=Math.random()*2-1;b0=.99765*b0+w*.099;b1=.963*b1+w*.2965;b2=.57*b2+w*1.0526;q[i]=(b0+b1+b2+w*.1848)*.11}
    applyVol()}catch(e){ac=null}
  return ac}
function applyVol(){if(!ac)return;sfxG.gain.value=SET.vol;musG.gain.value=SET.music??.35;ambG.gain.value=SET.amb??.6}
// 視窗縮小或切到別的分頁就把聲音整個停掉，回來再開
document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend();else ac.resume()});
addEventListener('pointerdown',()=>{if(ac&&ac.state==='suspended')ac.resume()});addEventListener('keydown',()=>{if(ac&&ac.state==='suspended')ac.resume()});
function tone(f,d,type='sine',vol=.07){if(SET.vol<=0||!audio())return;try{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(g).connect(sfxG);o.start();o.stop(ac.currentTime+d)}catch(e){}}
// 濾過的雜訊：硬幣嘩啦聲、腳步聲、機器聲
function noiseS(d,freq,q,vol,type='bandpass'){if(SET.vol<=0||!audio())return;try{const s=ac.createBufferSource();s.buffer=noiseBuf;const f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=ac.createGain();g.gain.setValueAtTime(vol,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);s.connect(f).connect(g).connect(sfxG);s.start(ac.currentTime,Math.random()*1.5);s.stop(ac.currentTime+d)}catch(e){}}
// 離玩家越遠越小聲，太遠就不放
function sfxAt(x,z,fn){const d=Math.hypot(pl.x-x,pl.z-z);if(d>22)return;fn(1/(1+d*.22))}
const SND={
  rake:a=>{tone(75,.2,'sine',.1*a);noiseS(.16,2600,.7,.06*a)},
  arm:a=>{tone(380,.14,'sawtooth',.018*a);tone(520,.1,'sawtooth',.012*a)},
  press:a=>{tone(110,.22,'square',.04*a);noiseS(.18,700,1,.05*a)},
  drop:a=>noiseS(.2,3200,.6,.05*a),
  step:(deck,pile)=>pile?(noiseS(.07,3600,.8,.05),tone(2600+Math.random()*1500,.05,'triangle',.015)):noiseS(.06,deck?900:420,1.2,deck?.06:.045)
};
// 一直響的聲音：輸送帶、發電機、無人機，音量看附近有幾台
let loops=null;
function makeLoop(kind){const g=ac.createGain();g.gain.value=0;g.connect(ambG);
  if(kind==='belt'||kind==='rain'){const s=ac.createBufferSource();s.buffer=pinkBuf;s.loop=true;s.loopStart=0;s.loopEnd=pinkBuf.duration;
    const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=kind==='rain'?1500:320;
    if(kind==='rain'){const h=ac.createBiquadFilter();h.type='highpass';h.frequency.value=250;s.connect(h).connect(f).connect(g)}else s.connect(f).connect(g);s.start()}
  else{const o=ac.createOscillator();o.type=kind==='gen'?'triangle':'sine';o.frequency.value=kind==='gen'?55:170;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=kind==='gen'?140:500;o.connect(f).connect(g);o.start()}
  return g}
let dripT=0;
function updateLoops(dt){
  if(!ac||ac.state!=='running')return;
  // 暫停、回主選單、看卡片的時候，機器聲和雨聲都要慢慢收掉
  const on=SET.vol>0&&G&&(mode==='play'||mode==='photo');
  if(!on){if(loops)for(const k in loops)loops[k].gain.setTargetAtTime(0,ac.currentTime,.15);return}
  if(!loops)loops={belt:makeLoop('belt'),gen:makeLoop('gen'),drone:makeLoop('drone'),rain:makeLoop('rain')};
  const rk=G.wx?G.wx.rain:0;loops.rain.gain.setTargetAtTime(.16*rk,ac.currentTime,.5);
  // 雨滴打在屋頂上
  dripT-=dt||0;if(rk>.2&&dripT<=0){dripT=.04+Math.random()*.25/rk;noiseS(.03,1800+Math.random()*2400,6,.012*rk*(SET.amb??.6))}
  let b=0,gn=0,dr=0;
  for(const t of tiles.values()){const d=Math.hypot(pl.x-t.gx-.5,pl.z-t.gz-.5);if(d>16)continue;const a=1/(1+d*.3);
    if(BELTLIKE.has(t.type))b+=a;else if(isGen(t)&&genOn(t)&&!t.off)gn+=a;else if(t.type==='drone'&&t.ds!=='idle')dr+=a}
  const T=ac.currentTime;loops.belt.gain.setTargetAtTime(Math.min(.12,b*.016),T,.3);loops.gen.gain.setTargetAtTime(Math.min(.06,gn*.035),T,.3);loops.drone.gain.setTargetAtTime(Math.min(.025,dr*.016),T,.2);
}
// 背景音樂：慢慢換和弦的柔和鋪底，偶爾一顆撥弦音
const CHORDS=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,59]],PENTA=[60,62,64,67,69,72,74,76];
let musT=0,musI=0;
const mtof=m=>440*Math.pow(2,(m-69)/12);
// 撥弦（像月琴、古箏）、木魚、鑼
function pluck(t0,m,v,len){t0=Math.max(t0,ac.currentTime);const o=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),lf=ac.createOscillator(),lg=ac.createGain();o.type='triangle';o2.type='sine';o.frequency.value=mtof(m);o2.frequency.value=mtof(m)*2;
  lf.frequency.value=5.5;lg.gain.value=mtof(m)*.006;lf.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.008);g.gain.exponentialRampToValueAtTime(.0001,t0+(len||1.1));
  o.connect(g);o2.connect(g);g.connect(musG);[o,o2,lf].forEach(x=>{x.start(t0);x.stop(t0+(len||1.1)+.05)})}
function woodblock(t0,v){t0=Math.max(t0,ac.currentTime);const s=ac.createBufferSource();s.buffer=noiseBuf;const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=1250;f.Q.value=12;const g=ac.createGain();g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.12);s.connect(f).connect(g).connect(musG);s.start(t0,Math.random());s.stop(t0+.15)}
function gong(t0,v){t0=Math.max(t0,ac.currentTime);const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(140,t0);o.frequency.exponentialRampToValueAtTime(118,t0+3);g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+4);o.connect(g).connect(musG);o.start(t0);o.stop(t0+4.1)}
const TW_SCALE=[55,57,60,62,64,67,69,72,74,76],TW_PHR=[[0,2,4,2,1,0],[4,5,7,5,4,2],[2,4,5,4,2,1],[7,5,4,2,4,0]];let musPh=0;
function updateMusic(dt){
  if(!ac||ac.state!=='running'||(SET.music??.35)<=0)return;
  if(radioNear>.2)return; // 走到阿公的收音機旁邊，背景音樂先停一下
  const style=SET.musicStyle||'soft';
  if(style!=='soft'){musT-=dt;if(musT>0)return;
    // 稍微往後排一點：撥弦音會隨機早一點點，剛打開遊戲時聲音的時鐘還在 0 附近，不能排到負的時間
    const T=ac.currentTime+.05,fast=style==='market',beat=fast?.32:.62,ph=TW_PHR[musPh++%TW_PHR.length];musT=beat*8;
    ph.forEach((n,k)=>{if(Math.random()<.9)pluck(T+k*beat*(fast?1:1.3)+(Math.random()-.5)*.02,TW_SCALE[n]+(fast?12:0),fast?.05:.045,fast?.6:1.4)});
    for(let k=0;k<8;k++){if(fast||k%2===0)woodblock(T+k*beat,fast?(k%2?.02:.035):.03);if(fast&&k%4===0)pluck(T+k*beat,TW_SCALE[[0,4,2,0][musPh%4]]-12,.05,.4)}
    if(!fast&&musPh%4===1)gong(T,.05);
    if(!fast)pluck(T,TW_SCALE[0]-12,.03,4);
    return}
  musT-=dt;if(musT>0)return;musT=6;
  const T=ac.currentTime,ch=CHORDS[musI++%CHORDS.length];
  ch.forEach((m,k)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=k?'sine':'triangle';o.frequency.value=mtof(m);g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(.035,T+2);g.gain.linearRampToValueAtTime(0,T+7);o.connect(g).connect(musG);o.start(T);o.stop(T+7.2)});
  for(let k=0;k<3;k++)if(Math.random()<.6){const t0=T+1+k*1.6+Math.random()*.4,o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=mtof(PENTA[Math.floor(Math.random()*PENTA.length)]);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.04,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+1.4);o.connect(g).connect(musG);o.start(t0);o.stop(t0+1.5)}
}
let lastClink=0;function clink(){const n=performance.now();if(n-lastClink<45)return;lastClink=n;tone(2200+Math.random()*1800,.08,'triangle',.035)}
function chime(){tone(660,.15);setTimeout(()=>tone(880,.15),110);setTimeout(()=>tone(1320,.3),220)}

