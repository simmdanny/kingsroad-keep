(function(){
/* Developer-mode building mastery previews (v368): the building mastery card opens previews only in developer mode, the panel names the
   building and the mastery, and the arena (smPvStartT / smPvTickT), run here in the main page for every building at Mastery 5: the building
   stands by the road at that mastery, foes keep coming and get hurt (or a paying building pays), support buildings get an archer beside them,
   and the long-range ones watch a road stretch they can hit. The preview frame itself loads asynchronously and is not loaded here.
   Run on the dev page: __kk.ev(await (await fetch('/tests/bmprev-test.js')).text()). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,dev0=meta.dev;
let errs=0,H0=null;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const step=sec=>{let t=performance.now()/1000;for(let i=0;i<sec/.05;i++){update(.05);updFx(.05);t+=.05;anim(.05,t);}};
try{
  /* ---- the card ---- */
  /* v374: outside developer mode only an unlocked building and the masteries it has reached open a preview (tests/pvown-test.js) */
  meta.dev=false;mastOpen('archer');let md=document.getElementById('mastModal');ok('without developer mode only what the building has reached opens a preview',!!md&&md.querySelectorAll('.mst-lvl[data-smpv]').length===(unlocked('archer')?mastLv('archer'):0)&&!!md.querySelector('.mst-head img[data-smpv]')===!!unlocked('archer'));if(md)md.remove();
  meta.dev=true;mastOpen('archer');md=document.getElementById('mastModal');const rows=md.querySelectorAll('.mst-lvl[data-smpv]');
  ok('in developer mode every mastery and the picture open a preview',rows.length===5&&!!md.querySelector('.mst-head img[data-smpv="0"]')&&!!md.querySelector('.smpv-hint'));
  rows[4].dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));const box=document.getElementById('smPv');
  ok('hovering shows the building and the mastery',!!box&&!box.hidden&&/Archer Tower/.test(box.textContent)&&/Mastery 5/.test(box.textContent)&&/Rain of Arrows/.test(box.textContent)&&SMPW.want&&SMPW.want.kind==='tower',box&&box.textContent.slice(0,70));
  md.remove();smPvDrop();
  /* ---- every building at Mastery 5 ---- */
  /* count the hits on the arena's foes (dead ones leave the list at once) */
  let hits=0;H0=hurt;hurt=function(e,amt){if(e&&e.smpv&&amt>0)hits++;return H0.apply(this,arguments);};
  const bad=[],noHit=[],sides=[],far=[];for(const k of Object.keys(MAST_D)){hits=0;if(!TD[k])continue;const e0=errs;let started=false;try{started=smPvStartT(k,5);}catch(e){console.error(e);}
    if(!started||!SMPV.tw||SMPV.tw.type!==k||mastLv(k)!==5){bad.push(k+':start');continue;}const w0=wave;step(8);
    const anyHurt=hits>0;
    if(errs>e0)bad.push(k+':errors');if(!BMPV_PAY.includes(k)&&!anyHurt&&k!=='mine')noHit.push(k);
    if(BMPV_PAY.includes(k)&&!(wave>w0))bad.push(k+':no pay');
    if(BMPV_AURA.includes(k)){const a=SMPV.tw2;if(!a||a.type!=='archer'||a.r!==SMPV.tw.r)sides.push(k);}
    if(BMPV_WANT[k]){const p=posAt(SMPV.d,SMPV.rt),d=Math.hypot(p[0]-SMPV.tw.x,p[1]-SMPV.tw.z);if(Math.abs(d-BMPV_WANT[k])>.4)far.push(k+':'+d.toFixed(2));}}
  hurt=H0;H0=null;
  ok('every building starts its preview at Mastery 5 and runs without errors',!bad.length,bad.join(' '));
  ok('and its foes get hurt',!noHit.length,noHit.join(' '));
  ok('support buildings get an archer beside them, in the same row',!sides.length,sides.join(' '));
  ok('long-range buildings watch a stretch of road they can hit',!far.length,far.join(' '));
  /* ---- the scroll previews still work ---- */
  smPvStart('hexspark',2);step(5);ok('scroll previews still work after a building one',SMPV.kind==='scroll'&&!SMPV.tw&&SM.cnt.hexspark>=1,SM.cnt.hexspark);
  smPvStop();ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;if(H0)hurt=H0;try{smPvDrop();SMPV.on=false;SMPV.kind=null;SMPV.tw=SMPV.tw2=null;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;meta.dev=dev0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
