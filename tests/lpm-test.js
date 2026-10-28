(function(){
/* Spatial Loop's masteries (v422). Run on the dev page: __kk.ev(await (await fetch('/tests/lpm-test.js')).text())
   returns [name, ok, detail] rows. Foes walk the road (moveEnemy, so the fold's foldHop sends them back) while the effects are stepped
   (updFx, with the game clock moved along); hurt is wrapped to log the amount each hit is called with. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{if(FOLD.on&&FOLD.end)FOLD.end(true);meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){for(const e of enemies)if(!e.dead)moveEnemy(e,.05);updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.loop=SM_XP[L-1];else delete meta.smast.loop;};
const foe=(d,spd,off)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=spd;e.maxHp=e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time,o});return H0.apply(this,arguments);};};
const cast=L=>{setL(L);castScrollNow('loop',heroU,tStats(heroU),enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'light',anc:false,spell:'loop'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,amt));
const ev=n=>LPM.dbg.filter(d=>d.ev===n);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
/* a lead walking slowly, and a pack behind it walking fast enough to go round the loop more than once in 10s */
const pack=()=>{const D=Math.min(12,ROUTES[0].len-6),A=foe(D,.05),B=foe(D-2,2.6),C=foe(D-3,2.6,.2),E=foe(D-5,2.6,-.2);return{A,B,C,E,F:[B,C,E]};};
try{
  ok('the five masteries: Long Fold, Shear, Groundhog Lap, Displaced, Snapback',SM_D.loop.map(x=>x.n).join('|')==='Long Fold|Shear|Groundhog Lap|Displaced|Snapback',SM_D.loop.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (8 tiles, 40%, 50%, 15%, 120% / 40%)',/8 tiles/.test(smDesc('loop',0))&&/40%/.test(smDesc('loop',1))&&/50%/.test(smDesc('loop',2))&&/15%/.test(smDesc('loop',3))&&/120%/.test(smDesc('loop',4))&&/40%/.test(smDesc('loop',4))
    &&LPM.backMax===8&&LPM.sh===.4&&LPM.lap===.5&&LPM.dp===.15&&LPM.dpT===3&&LPM.sb===1.2&&LPM.sbLap===.4);
  ok('the old masteries are gone (no hooks); the loop deals no damage, so its factors stay 1 (not SM.free)',!SMF.loop.hit&&!SMF.loop.cast&&SMA.loop.every(x=>x===1)&&SMG.loop.every(x=>x===1)&&!(SM.free&&SM.free.loop));
  /* ---- Mastery 0 ---- */
  {play();LPM.dbg=[];log=[];const P=pack();const added=track();wrapHurt();try{cast(0);run(11.5);}finally{hurt=H0;scene.add=S0;setL(0);}const fd=ev('fold')[0];
    ok('Mastery 0: the same fold (3 to 8 tiles back, at random) and the pack is sent back through it',fd&&[3,3.5,4,5,5.5,6,7,8].some(v=>near(v,fd.back))||fd&&near(fd.back,fd.dD-.8),fd&&fd.back);
    ok('Mastery 0: no damage, no seam, no mastery events',!log.length&&!ev('hop').length&&!added.some(o=>o.userData&&o.userData.sm),log.length);}
  /* ---- M1 Long Fold ---- */
  {play();LPM.dbg=[];log=[];const P=pack();const added=track();wrapHurt();try{cast(1);run(4);const fd=ev('fold')[0];
      ok('M1: the fold reaches back 8 tiles (or as far as the road allows)',fd&&near(fd.back,Math.min(8,fd.dD-.8)),fd&&fd.back+' of '+fd.dD.toFixed(1));
      ok('M1: its seam shows (a curtain of folded light)',added.some(o=>o.userData&&o.userData.sm));
      ok('M1: still no damage',!log.length&&ev('hop').length>0&&ev('hop').every(d=>!d.sh&&!d.lap&&!d.dp),ev('hop').length+' hops');run(8);
      ok('M1: the seam goes with the fold',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  /* ---- M2 Shear ---- */
  {play();LPM.dbg=[];log=[];const P=pack();wrapHurt();try{cast(2);run(11.5);}finally{hurt=H0;setL(0);}const hp=ev('hop');
    ok('M2: every time the fold sends a foe back it takes 40%',hp.length>=3&&P.F.every(e=>hits(e,40).length===hp.filter(d=>d.e===e).length)&&hp.every(d=>d.sh),hp.length+' hops');
    ok('M2: only the shear (no laps, no displacement)',hp.every(d=>!d.lap&&!d.dp)&&log.every(h=>near(h.amt,40)));}
  /* ---- M3 Groundhog Lap ---- */
  {play();LPM.dbg=[];log=[];const P=pack();wrapHurt();try{cast(3);run(11.5);}finally{hurt=H0;setL(0);}const hp=ev('hop');
    ok('M3: a foe goes round more than once in the 10 seconds',hp.some(d=>d.n>=2),hp.map(d=>d.n).join(''));
    ok('M3: from its second lap on, each lap deals 50% more for every lap before it',hp.every(d=>d.lap===d.n-1)&&hp.filter(d=>d.n>=2).every(d=>log.some(h=>h.e===d.e&&h.smx&&near(h.amt,50*(d.n-1))&&near(h.t,d.t,.01))),hp.map(d=>d.lap).join(''));
    ok('M3: and nothing on the first lap',hp.filter(d=>d.n===1).every(d=>!log.some(h=>h.e===d.e&&near(h.t,d.t,.01)&&!near(h.amt,40))));}
  /* ---- M4 Displaced ---- */
  {play();LPM.dbg=[];log=[];const P=pack();cast(4);let got=null;for(let i=0;i<120&&!got;i++){run(.05);const d=ev('hop')[0];if(d)got=d;}setL(0);
    const e=got&&got.e,mk=e&&e.smMk&&e.smMk['*'];ok('M4: a foe the fold sends back is displaced for 3s',mk&&near(mk.v,.15)&&near(mk.until-time,3,.06),mk&&(mk.until-time).toFixed(2));
    let dmg=0;if(e){const h0=e.hp;hurt(e,100,'phys',{src:{}});dmg=h0-e.hp;}ok('M4: a tower\'s hit on it deals 15% more',near(dmg,115,.001),dmg);
    run(3.1);let dmg2=0;if(e){const h0=e.hp;hurt(e,100,'phys',{src:{}});dmg2=h0-e.hp;}ok('M4: and only for 3s',near(dmg2,100,.001)||(e.smMk['*']&&e.smMk['*'].until>time),dmg2);}
  /* ---- M5 Snapback ---- */
  {play();LPM.dbg=[];log=[];const P=pack();const added=track();wrapHurt();try{cast(5);run(10.9);const sn=ev('snap')[0],fd=ev('fold')[0];
      ok('M5: when the loop ends the looped road snaps back',sn&&sn.L.length>0,sn&&sn.L.length);
      ok('M5: 120% to each foe on the stretch plus 40% a lap it walked',sn&&sn.L.every(q=>log.some(h=>h.e===q.e&&h.smx&&near(h.amt,120+40*q.n))),sn&&sn.L.map(q=>q.n).join(''));
      ok('M5: only foes on the looped stretch',sn&&sn.L.every(q=>q.e.dist>=fd.dB-.7&&q.e.dist<=fd.dD+.7));
      ok('M5: the laps the snap counts are the laps it walked',sn&&sn.L.every(q=>q.n===ev('hop').filter(d=>d.e===q.e).length));
      run(2);ok('M5: nothing is left behind',smLeft(added)===0&&!LPM.cur,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();LPM.dbg=[];const P=pack();cast(4);run(11.5);setL(0);ok('M5 needs Mastery 5',!ev('snap').length);}
  /* ---- the rest ---- */
  {play();LPM.dbg=[];const P=pack();setL(5);castLoop(heroU,enemies.slice(),100,{src:heroU,el:'light',spell:'loop'});run(11.5);setL(0);
    ok('casts that are not a mastered scroll cast get no masteries',!ev('hop').length&&!ev('snap').length&&ev('fold').length===1);}
  {play();LPM.dbg=[];const P=pack();cast(5);run(3);cast(5);run(11.5);setL(0);ok('a second loop ends the first one cleanly (one snap, no stale fold)',ev('fold').length===2&&ev('snap').length===1&&!LPM.cur&&!FOLD.on,ev('snap').length);}
  {const e0=errs;for(let L=1;L<=5;L++){play();const P=pack();P.F.forEach(e=>{e.maxHp=e.hp=150;});cast(L);run(11.5);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0&&!LPM.cur,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;LPM.dbg=null;try{if(FOLD.on&&FOLD.end)FOLD.end(true);clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
