(function(){
/* Dimensional Slash's masteries (v448). Run on the dev page: __kk.ev(await (await fetch('/tests/dsm-test.js')).text()) returns [name, ok, detail] rows.
   A straight stretch of road with the hero in line with it (as in dslash-test), foes standing on it; the game is stepped (update and updFx),
   hurt is wrapped to log the amount each hit is called with (the scroll's power is 100: the split deals 1200, a rift tick 45). Every cut logs
   its line (DSM.dbg), so which foes it should strike is checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0];let best=null;for(let d=1;d<R.len-6;d+=.25){const A=posAt(d,R),B=posAt(d+5,R);let dev=0;for(let k=1;k<10;k++){const p=posAt(d+k*.5,R),t2=k/10,cx=A[0]+(B[0]-A[0])*t2,cz=A[1]+(B[1]-A[1])*t2;dev=Math.max(dev,Math.hypot(p[0]-cx,p[1]-cz));}
    if(dev<.08){best=d;break;}}
  const d0=best==null?2:best,A=posAt(d0,R),B=posAt(d0+5,R),ux=(B[0]-A[0])/5,uz=(B[1]-A[1])/5;
  let hc=null,hb=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),tx=A[0]-ux*1.6,tz=A[1]-uz*1.6,dd=(q.x-tx)**2+(q.z-tz)**2;if(dd<hb){hb=dd;hc=[c,r];}}
  spawnHero(hc[0],hc[1]);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;return{R,d0};}
function foe(R,d,off,hp){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=d;e.off=off||0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.dslash=SM_XP[L-1];else delete meta.smast.dslash;};
const cast=L=>{setL(L);castScrollNow('dslash',heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'dark',anc:false,spell:'dslash'});};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>DSM.dbg.filter(d=>d.ev===n);
const onCut=(s,e,w)=>dslOnLine(e,heroU.x,heroU.z,Math.sin(s.ang),Math.cos(s.ang),s.len,w==null?s.W:w);
const exact=(s,F)=>F.every(e=>onCut(s,e)===s.L.includes(e));
const hits=(e,amt,o)=>log.filter(h=>h.e===e&&near(h.amt,amt)&&(!o||((o.dot==null||h.dot===o.dot)&&(o.smx==null||h.smx===o.smx))));
const left=added=>added.filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
/* nine foes along the road, and two beside it 0.62 off its middle */
const stage=()=>{const G=go(),L=[];for(let i=0;i<9;i++)L.push(foe(G.R,G.d0+i*.55));const S=[foe(G.R,G.d0+1.9,.62),foe(G.R,G.d0+3.6,-.62)];return{G,L,S,F:L.concat(S)};};
try{
  /* ---- the card ---- */
  ok('the five masteries: Keen Edge, Deeper Rift, The Still Heartbeat, Severance, Worldsplitter (v448)',SM_D.dslash.map(x=>x.n).join('|')==='Keen Edge|Deeper Rift|The Still Heartbeat|Severance|Worldsplitter',SM_D.dslash.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (0.75 tiles; 7.5s / 50% / 60%; 25%; 20%; 50% / 300%)',/0\.75 tiles/.test(smDesc('dslash',0))&&/7\.5s/.test(smDesc('dslash',1))&&/50%/.test(smDesc('dslash',1))&&/60%/.test(smDesc('dslash',1))&&/25%/.test(smDesc('dslash',2))&&/20%/.test(smDesc('dslash',3))&&/50%/.test(smDesc('dslash',4))&&/300%/.test(smDesc('dslash',4))
    &&DSM.w===.75&&DSM.rift===7.5&&DSM.tdmg===.5&&DSM.slow===.6&&DSM.stillK===.25&&DSM.sev===.2&&DSM.wsK===.5&&DSM.seal===3);
  ok('the old masteries are gone (no bleed, mark, echo cut or singularity hooks); calibrated on the Legendary ladder with hidden factors',!SMF.dslash.hit&&!SMF.dslash.cast&&SMA.dslash.every(x=>x===1)&&SMG.dslash.length===5&&SMG.dslash.every(x=>x>=.8&&x<1.3),SMG.dslash.join());
  /* ---- Mastery 0 ---- */
  /* (the plain cut's handle gives its line: it aims to catch the most foes, so it need not run down the road's middle) */
  const plain=()=>NSP.dslash(heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'dark',spell:'dslash'});
  const exactP=(h,F)=>F.every(e=>dslOnLine(e,heroU.x,heroU.z,Math.sin(h.ang),Math.cos(h.ang),h.L,DSL.W)===hits(e,1200,{dot:false}).length>0);
  {const S=stage();DSM.dbg=[];log=[];wrapHurt();let h=null;try{setL(0);h=plain();run(10);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the cut as before (1200% to exactly the foes within 0.5 of its line), no mastery events',S.L.every(e=>hits(e,1200,{dot:false}).length===1)&&exactP(h,S.F)&&!DSM.dbg.length);}
  /* ---- M1 Keen Edge ---- */
  {const S=stage();DSM.dbg=[];log=[];const added=track();wrapHurt();try{cast(1);run(10);}finally{hurt=H0;scene.add=S0;setL(0);}const s=ev('split')[0];
    ok('M1: the cut strikes foes up to 0.75 off the line: the two beside the road too',s&&near(s.W,.75)&&S.F.every(e=>s.L.includes(e))&&exact(s,S.F)&&S.S.every(e=>hits(e,1200,{dot:false}).length===1),s&&s.L.length);
    ok('M1: the rift too (its ticks reach them)',S.S.every(e=>log.some(h=>h.e===e&&h.dot&&near(h.amt,45))));
    ok('M1: no other change (split 1200%, the rift 45% a tick for 6s)',S.L.every(e=>hits(e,1200,{dot:false}).length===1)&&!log.some(h=>h.dot&&!near(h.amt,45)));
    ok('M1: nothing is left behind',left(added)===0,left(added));}
  /* ---- M2 Deeper Rift ---- */
  {const trial=L=>{const S=stage();DSM.dbg=[];log=[];let slow=0;wrapHurt();const t0=time;try{cast(L);for(let i=0;i<220;i++){run(.05);if(!S.L[4].dead)slow=Math.max(slow,S.L[4].slow||0);}}finally{hurt=H0;setL(0);}
      const tk=log.filter(h=>h.e===S.L[4]&&h.dot),sp=ev('split')[0];return{tk,slow,t0,sp,first:tk.length?tk[0].t-t0:0,last:tk.length?tk[tk.length-1].t-t0:0};};
    const a=trial(1),b=trial(2);
    ok('M2: the rift shreds for 50% a tick (45% before)',b.tk.length&&b.tk.every(h=>near(h.amt,50))&&a.tk.every(h=>near(h.amt,45)),b.tk.length&&b.tk[0].amt);
    ok('M2: and stays open 7.5s (6 before): it ticks for 1.5s longer',near(b.last-b.first,7.25,.04)&&near(a.last-a.first,5.75,.05),(a.last-a.first).toFixed(2)+' / '+(b.last-b.first).toFixed(2));
    ok('M2: it slows 60% (45% before)',near(b.slow,.6)&&near(a.slow,.45),a.slow+' / '+b.slow);}
  /* ---- M3 The Still Heartbeat ---- */
  {const S=stage();DSM.dbg=[];log=[];let held=null,gray='';wrapHurt();try{cast(3);for(let i=0;i<60;i++){run(.05);if(!held&&ev('hold').length){held=S.L.map(e=>e.stunT||0);gray=renderer.domElement.style.filter;}}run(10);}finally{hurt=H0;setL(0);}
    const ho=ev('hold')[0],sp=ev('split')[0];
    ok('M3: at the draw the foes on the line are held in the stilled moment, until space splits',ho&&S.L.every(e=>ho.L.includes(e))&&held&&held.every(v=>v>.7),held&&held.map(v=>v.toFixed(2)).join(','));
    ok('M3: the stillness lasts a quarter second longer (the split comes 0.8s after the draw, 0.55 before)',ho&&sp&&near(sp.t-ho.t,.8,.08),ho&&sp&&(sp.t-ho.t).toFixed(2));
    ok('M3: the world is drained of colour while it lasts, and its colour comes back',/grayscale/.test(gray)&&!/grayscale/.test(renderer.domElement.style.filter),gray);
    ok('M3: the split strikes 25% harder (1500%)',S.L.every(e=>hits(e,1500,{dot:false}).length===1));}
  /* ---- M4 Severance ---- */
  {const trial=L=>{const S=stage();S.L[2].hp=S.L[2].maxHp*.19;S.L[5].hp=S.L[5].maxHp*.3;S.L[7].boss=true;S.L[7].hp=S.L[7].maxHp*.1;DSM.dbg=[];log=[];wrapHurt();try{cast(L);run(3);}finally{hurt=H0;setL(0);}
      return{d19:S.L[2].dead,d30:S.L[5].dead,boss:S.L[7].dead,sv:ev('sever').map(d=>S.L.indexOf(d.e))};};
    const a=trial(3),b=trial(4);
    ok('M4: a foe the split leaves under 20% is cut down (one at 19%); not at Mastery 3',b.d19&&!a.d19,[a.d19,b.d19].join());
    ok('M4: not one above it (30%), nor a boss (10%)',!b.d30&&!b.boss);
    ok('M4: logged',b.sv.join()==='2',b.sv.join());}
  /* ---- M5 Worldsplitter ---- */
  {const S=stage();DSM.dbg=[];log=[];const added=track();wrapHurt();try{cast(5);run(12);}finally{hurt=H0;scene.add=S0;setL(0);}const sp=ev('split')[0],se=ev('seal')[0];
    ok('M5: the split strikes 50% harder on top (1200 x 1.25 x 1.5 = 2250%)',S.L.every(e=>hits(e,2250,{dot:false}).length===1));
    ok('M5: when the rift seals it snaps shut on every foe still inside it: 300%',se&&se.L.length>0&&se.L.every(e=>hits(e,300,{smx:true}).length===1)&&near(se.t-sp.t,7.5,.06),se&&se.L.length+' '+(se.t-sp.t).toFixed(2));
    ok('M5: Masteries 1-4 ride it (the wider cut, the deeper rift, the stillness)',sp&&near(sp.W,.75)&&S.S.every(e=>sp.L.includes(e))&&ev('hold').length===1&&log.some(h=>h.dot&&near(h.amt,50)));
    ok('M5: nothing is left behind',left(added)===0&&!/grayscale|invert/.test(renderer.domElement.style.filter),left(added));}
  {const S=stage();DSM.dbg=[];cast(4);run(11);setL(0);ok('M5 needs Mastery 5',!ev('seal').length);}
  /* ---- the rest ---- */
  {const S=stage();DSM.dbg=[];log=[];setL(5);wrapHurt();let h=null;try{h=plain();run(10);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast are the old cut',!DSM.dbg.length&&S.L.every(e=>hits(e,1200,{dot:false}).length===1)&&exactP(h,S.F));}
  {const e0=errs;for(let L=1;L<=5;L++){const S=stage();S.F.forEach(e=>{e.maxHp=e.hp=2000;});heroU.scd={};heroU.gcd=0;setL(L);meta.spells.dslash=meta.spells.dslash||{lvl:1,hero:null};fireScroll(heroU,'dslash',heroStats(),S.F.slice());run(12);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;DSM.dbg=null;window.__fz=false;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
