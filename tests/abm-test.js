(function(){
/* Abyssal Genesis's masteries (v459). Run on the dev page: __kk.ev(await (await fetch('/tests/abm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road; the game is stepped (update and updFx), hurt is wrapped to log the amount each hit is called with (the scroll's
   power is 100: a bite deals 600, 650 with Leviathan's Hunger, the eldest's 900; the backwash 1000, 1300 with the third leviathan; a foe drowns a
   share of its max health of 1e6 every 0.5s). Every mastered sea logs its events (ABM.dbg: each lunge, bite, drowning tick, the eldest and its
   rise), so which foe is bitten, and when, is checked exactly. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
const T=()=>ANC.live.abyss?ANC.live.abyss.T:-1,runTo=t=>{for(let i=0;i<900&&ANC.live.abyss&&T()<t;i++)run(.05);},runOut=()=>{for(let i=0;i<900&&ANC.live.abyss;i++)run(.05);run(1);};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(camTarget.x,camTarget.z,1);scene.updateMatrixWorld(true);}
function foe(d,i,hp){const R=ROUTES[0];spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.min(R.len-1,d);e.off=(i%3-1)*.2;e.hp=e.maxHp=hp||1e6;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
/* a pack of twelve along the road, and one foe far up the road that no leviathan reaches */
const stage=hp=>{go();const R=ROUTES[0],F=[];for(let i=0;i<12;i++)F.push(foe(R.len*.45+(i-5.5)*.35,i,hp));F.far=foe(.6,12,hp);return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.abyss=SM_XP[L-1];else delete meta.smast.abyss;};
const oA=()=>({src:heroU,bane:0,el:'ice',anc:true,spell:'abyss'});
const cast=L=>{setL(L);castScrollNow('abyss',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oA());worldSlow=1;slowT=0;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,dot:!!(o&&o.dot),sp:!!(o&&o.spell),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>ABM.dbg.filter(d=>d.ev===n);
const hits=(e,amt,sp)=>log.filter(h=>h.e===e&&near(h.amt,amt)&&(sp==null||h.sp===sp));
const drowns=e=>log.filter(h=>h.e===e&&h.dot);
/* (a foe's own Resolve ring is the foe's, and the ripples of foes wading through the board's water are the terrain's pool, not the sea's) */
const left=added=>added.filter(o=>{if(enemies.some(e=>e.rsvRing===o)||typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const rootOf=added=>added.find(o=>o.isGroup&&o.children.length>40);
const pts=(root,ro)=>{let n=0;root&&root.traverse(o=>{if(o.isPoints&&o.renderOrder===ro)n++;});return n;};
const gaps=L=>{const t=L.map(d=>d.t),g=[];for(let i=1;i<t.length;i++)g.push(t[i]-t[i-1]);return g;};
try{
  /* ---- the card ---- */
  const NM=SM_D.abyss.map(x=>x.n);
  ok('the five masteries: Drowning Depths, The Weight of the Sea, Leviathan\'s Hunger, Blood in the Water, The Third Leviathan (v459)',NM.join('|')==='Drowning Depths|The Weight of the Sea|Leviathan\'s Hunger|Blood in the Water|The Third Leviathan',NM.join('|'));
  {const other=[];for(const k in SM_D)if(k!=='abyss')for(const m of SM_D[k])other.push(m.n);if(typeof MAST_D!=='undefined')for(const k in MAST_D)for(const m of MAST_D[k]||[])if(m&&m.n)other.push(m.n);
    for(const k in SPELLS_S)other.push(SPELLS_S[k].n);for(const c of COMBOS)other.push(c.n);const dup=NM.filter(n=>other.includes(n));
    ok('their names are used by no other scroll, mastery or synergy',!dup.length,dup.join(', '));}
  ok('the numbers on the card are the ones in the code (1.6% / 0.5%; 70%; 2.2s, 7 lunges, 650%, 1.35; 50% faster for 4s; 900%, 1300%)',
    /1\.6% of their max health a second/.test(smDesc('abyss',0))&&/0\.5%/.test(smDesc('abyss',0))&&/70% slower/.test(smDesc('abyss',1))&&/every 2\.2s/.test(smDesc('abyss',2))&&/7 times/.test(smDesc('abyss',2))&&/650%/.test(smDesc('abyss',2))&&/1\.35 tiles/.test(smDesc('abyss',2))
    &&/50% faster for 4s/.test(smDesc('abyss',3))&&/900%/.test(smDesc('abyss',4))&&/1300%/.test(smDesc('abyss',4))
    &&near(ABM.drown*2,.016)&&near(ABM.drownB*2,.005)&&ABM.slow===.7&&ABM.gap===2.2&&ABM.bite===6.5&&ABM.reach===1.35&&ABM.bloodK===1.5&&ABM.bloodT===4&&ABM.elderBite===9&&ABM.wave===13);
  ok('no add-on hooks; calibrated with hidden factors',!SMF.abyss.hit&&!SMF.abyss.cast&&SMA.abyss.every(x=>x===1)&&SMG.abyss.length===5&&SMG.abyss.every(x=>x>=.9&&x<1.2),SMG.abyss.join());
  ok('with its factor no mastered part hits weaker than at Mastery 0 (bites, the eldest, the backwash)',SMG.abyss.every((g,i)=>g*(i>=2?ABM.bite:6)>=6&&g*(i>=4?ABM.wave:10)>=10),SMG.abyss.map((g,i)=>(g*(i>=2?ABM.bite:6)*100).toFixed(0)+'/'+(g*(i>=4?ABM.wave:10)*100).toFixed(0)).join(' '));
  ok('the defaults table is the old sea (1.2% / 0.4% drowning, 60% slow, 2.2 tiles, a lunge every 2.6s at 600% within 1.26, a 1000% backwash, no eldest, no blood)',
    ABYD.drown===.006&&ABYD.drownB===.002&&ABYD.slow===.6&&ABYD.surf===2.2&&ABYD.gap===2.6&&ABYD.bite===6&&ABYD.reach2===1.6&&ABYD.wave===10&&ABYD.crestR===1.3&&ABYD.band===1.1&&!ABYD.elder&&!ABYD.blood&&!ABYD.fx&&ABYD.pool===1600);
  /* ---- Mastery 0 ---- */
  /* the sea's own defaults given as options (only a log added) are the same cast: the same lunges, the same hits */
  let tot0=null;
  /* (the drowning ticks every 0.5s of the sea's clock: at this 0.05s step, every 11th frame) */
  const nTick=e=>drowns(e).length,same=F=>F.every(e=>nTick(e)===nTick(F[0]))&&nTick(F[0])>=28&&nTick(F[0])<=33;
  {const F=stage();F[11].boss=true;ABM.dbg=[];log=[];wrapHurt();try{setL(0);castAbyss(heroU,100,oA(),{log:d=>{d.t=time;ABM.dbg.push(d);}});worldSlow=1;slowT=0;runOut();}finally{hurt=H0;}
    const L=ev('lunge'),g=gaps(L);tot0=F.map(e=>log.filter(h=>h.e===e).reduce((a,h)=>a+h.amt,0));
    ok('the defaults: six lunges 2.6s apart, the two leviathans in turn',L.length===6&&g.every(x=>Math.abs(x-2.6)<.06)&&L.every((d,i)=>d.i===i%2&&!d.eld),L.map(d=>d.i).join('')+' '+g.map(x=>x.toFixed(2)).join(','));
    ok('the defaults: bites of 600% within 1.26 of the lunge, a 1000% backwash once on every foe, 0.6% of max health every 0.5s (a boss 0.2%)',ev('bite').every(d=>d.k===6&&d.r2<1.6)&&ev('bite').length>=6&&F.concat([F.far]).every(e=>hits(e,1000,true).length===1&&drowns(e).every(h=>near(h.amt,e.boss?2000:6000)))&&same(F.concat([F.far])),ev('bite').length+' bites, '+nTick(F[0])+' ticks');}
  {const F=stage(),B=F[11];B.boss=true;ABM.dbg=[];log=[];let sl=null;const added=track();wrapHurt();try{cast(0);runTo(10);sl=ancF(F[3]);runOut();}finally{hurt=H0;scene.add=S0;}
    const tot=F.map(e=>log.filter(h=>h.e===e).reduce((a,h)=>a+h.amt,0));
    ok('Mastery 0: exactly the old sea (every foe takes what it took from the defaults with a log)',tot.every((v,i)=>near(v,tot0[i],1e-9)),tot.slice(0,4).map(v=>v.toFixed(0)).join(','));
    ok('Mastery 0: 60% slow, a boss drowns 0.2% a tick, bites of 600%, a 1000% backwash, no mastery events',near(sl,.4,.05)&&drowns(B).every(h=>near(h.amt,2000))&&log.filter(h=>h.sp&&!h.dot).every(h=>near(h.amt,600)||near(h.amt,1000))&&!ABM.dbg.length,sl&&sl.toFixed(3));
    ok('Mastery 0: nothing is left behind',left(added)===0&&!ANC.live.abyss&&!ANC.on);}
  /* ---- M1 Drowning Depths ---- */
  {const F=stage(),B=F[11];B.boss=true;ABM.dbg=[];log=[];const added=track();let bp=0;wrapHurt();try{cast(1);runTo(9);bp=pts(rootOf(added),46);runOut();}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M1: foes drown 0.8% of their max health every 0.5s (1.6% a second; a boss 0.25%), the bites and the backwash unchanged',same(F)&&F.every(e=>drowns(e).every(h=>near(h.amt,e.boss?2500:8000)))&&log.filter(h=>h.sp&&!h.dot).every(h=>near(h.amt,600)||near(h.amt,1000)),drowns(F[0]).length);
    {const c=ev('opts')[0];ok('M1: bubbles stream off every foe (their own pool) and the marine snow falls twice as thick',bp===1&&c&&c.X.snow===2&&c.X.fx===abmFx,bp);}
    ok('M1: nothing is left behind',left(added)===0&&!ANC.live.abyss,left(added));}
  {const F=stage();const added=track();let bp=-1;try{cast(0);runTo(9);bp=pts(rootOf(added),46);runOut();}finally{scene.add=S0;}ok('no bubble pool at Mastery 0',bp===0,bp);}
  /* ---- M2 The Weight of the Sea ---- */
  {const F=stage();ABM.dbg=[];const added=track();let sl=null,sy=null,hc=null;try{cast(2);runTo(10);sl=ancF(F[3]);const s=rootOf(added).children.find(m=>m.geometry&&m.geometry.parameters&&m.geometry.parameters.width===110);sy=s&&s.position.y;hc=ANC.L.abyss&&ANC.L.abyss.hc.getHex();runOut();}finally{scene.add=S0;setL(0);}
    ok('M2: foes move 70% slower (60% before)',near(sl,.3,.05),sl&&sl.toFixed(3));
    ok('M2: the sea stands at 2.7 tiles (2.2 before), its light a deeper teal',near(sy,2.7,1e-3)&&hc===0x3ab6d2,sy+' #'+(hc||0).toString(16));
    ok('M2: the slow ends with the sea',!ANC.fs.abyss&&ancF(F[3])===1);}
  /* ---- M3 Leviathan's Hunger ---- */
  {const F=stage();ABM.dbg=[];log=[];const added=track();let hp=0;wrapHurt();try{cast(3);runTo(6);hp=pts(rootOf(added),57);runOut();}finally{hurt=H0;scene.add=S0;setL(0);}
    const L=ev('lunge'),g=gaps(L),B=ev('bite');
    ok('M3: seven lunges 2.2s apart (six 2.6s apart before)',L.length===7&&g.every(x=>Math.abs(x-2.2)<.06),L.length+' '+g.map(x=>x.toFixed(2)).join(','));
    ok('M3: every bite 650% (no 600%), each the bite of a logged lunge',B.length>=7&&B.every(d=>d.k===6.5&&hits(d.e,650,true).length>=1)&&!log.some(h=>near(h.amt,600)),B.length);
    ok('M3: the bites reach 1.35 tiles from the lunge, and some land beyond the old 1.26',B.every(d=>d.r2<1.35*1.35+1e-9)&&B.some(d=>d.r2>1.6),B.map(d=>Math.sqrt(d.r2).toFixed(2)).sort().slice(-3).join(','));
    {const c=ev('opts')[0];ok('M3: both leviathans 15% larger, spots larger, eyes and spots glowing (one glow layer), twice the spray',c&&c.X.levS===1.15&&c.X.spotS===1.3&&c.X.spray===2&&hp===1,hp);}}
  {const F=stage();ABM.dbg=[];log=[];wrapHurt();try{cast(2);runOut();}finally{hurt=H0;setL(0);}ok('M3 needs Mastery 3 (at Mastery 2: six lunges, 600%)',ev('lunge').length===6&&ev('bite').every(d=>d.k===6));}
  /* ---- M4 Blood in the Water ---- */
  {const F=stage();ABM.dbg=[];log=[];wrapHurt();try{cast(4);runOut();}finally{hurt=H0;setL(0);}
    const B=ev('bite'),D=ev('drown');let bad=0,nb=0,amb=0;
    for(const d of D){const bt=B.filter(b=>b.e===d.e&&b.t<=d.t+1e-6).map(b=>b.t),last=bt.length?bt[bt.length-1]:-99;const inB=d.t-last<3.9,outB=d.t-last>4.1;if(!inB&&!outB){amb++;continue;}if(d.bl!==inB)bad++;if(d.bl)nb++;}
    const amts=F.map(e=>drowns(e)).flat();
    ok('M4: a foe drowns 50% faster for the 4s after a leviathan bites it, and only then',!bad&&nb>20,nb+' bloody ticks, '+bad+' wrong, '+amb+' at the edge');
    ok('M4: its drowning ticks are 1.2% (0.8% x 1.5), the others 0.8%',amts.every(h=>near(h.amt,8000)||near(h.amt,12000))&&amts.filter(h=>near(h.amt,12000)).length===nb,amts.filter(h=>near(h.amt,12000)).length);
    ok('M4: the foe no leviathan reaches never bleeds',!B.some(b=>b.e===F.far)&&drowns(F.far).every(h=>near(h.amt,8000)));}
  /* ---- M5 The Third Leviathan ---- */
  {const F=stage();ABM.dbg=[];log=[];const added=track();let E=null,z0=null,z1=null,y0=null,vis=null,tr=null;wrapHurt();
    try{cast(5);E=ev('elder')[0]&&ev('elder')[0].lev;vis=E&&E.segs.some(s=>s.visible);runTo(11.9);tr=ev('rise').length;runTo(20.4);z0=E.pos.z;y0=E.pos.y;runTo(21.1);z1=E.pos.z;y0=Math.min(y0,E.pos.y);runOut();}finally{hurt=H0;scene.add=S0;setL(0);}
    const L=ev('lunge'),R=ev('rise')[0],k=L.findIndex(d=>d.eld),t0=ev('opts')[0].t;
    ok('M5: the eldest waits unseen in the deep until halfway, larger than the two (1.32x their size at Mastery 0)',E&&!vis&&tr===0&&near(E.segs[0].scale.x,.58*1.32,1e-9)&&E.eld,E&&E.segs[0].scale.x.toFixed(3));
    ok('M5: it bursts up out of the deep at the first lunge after 12s',R&&k>0&&L[k].t-t0>=12&&L[k].t-t0<14.5&&R.t>=L[k].t&&R.t-L[k].t<1.5,R&&(R.t-t0).toFixed(2));
    ok('M5: from then on it takes every other lunge (the two still in turn between)',L.slice(k).every((d,i)=>d.eld===(i%2===0))&&L.filter(d=>d.eld).length===2&&L.length===7,L.map(d=>d.eld?'E':d.i).join(''));
    ok('M5: the eldest bites 900%, the two 650%',ev('bite').every(d=>d.k===(d.eld?9:6.5))&&ev('bite').some(d=>d.eld)&&ev('bite').filter(d=>d.eld).every(d=>hits(d.e,900,true).length>=1),ev('bite').filter(d=>d.eld).length+' bites by the eldest');
    ok('M5: one backwash, 1300% on every foe once (no 1000%)',F.concat([F.far]).every(e=>hits(e,1300,true).length===1)&&!log.some(h=>near(h.amt,1000)));
    ok('M5: the eldest rides the backwash up the field, high on the crest',z0!=null&&z1<z0-4&&y0>1.2,z0&&(z0.toFixed(1)+' > '+z1.toFixed(1)+' at y '+y0.toFixed(2)));
    ok('M5: Masteries 1-4 ride it (0.8% drowning, 70% slow, 2.2s, blood)',ev('opts')[0].X.drown===.008&&ev('opts')[0].X.slow===.7&&ev('opts')[0].X.gap===2.2&&ev('opts')[0].X.blood===1);
    ok('M5: nothing is left behind',left(added)===0&&!ANC.live.abyss&&!ANC.on&&!Object.keys(ANC.fs).length,left(added));}
  {const F=stage();ABM.dbg=[];log=[];wrapHurt();try{cast(4);runOut();}finally{hurt=H0;setL(0);}
    ok('M5 needs Mastery 5 (at Mastery 4: no eldest, a 1000% backwash)',!ev('elder').length&&!ev('bite').some(d=>d.eld)&&F.every(e=>hits(e,1000,true).length===1));}
  /* ---- the rest ---- */
  {const F=stage();ABM.dbg=[];log=[];wrapHurt();try{cast(5);run(6);const lv=ANC.live.abyss,T0=lv.T;setL(0);castScrollNow('abyss',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oA());worldSlow=1;slowT=0;
      ok('casting it again while it runs extends it, keeping its masteries',ANC.live.abyss===lv&&lv.T<T0&&near(lv.T,4.5,1e-3),T0.toFixed(2)+'>'+lv.T.toFixed(2));runOut();}finally{hurt=H0;setL(0);}
    ok('the extended sea still raises the eldest and strikes 1300% (the first cast\'s options rule)',ev('rise').length===1&&ev('opts').length===1&&F.every(e=>hits(e,1300,true).length===1)&&!log.some(h=>near(h.amt,1000)));}
  {const F=stage();ABM.dbg=[];log=[];setL(5);wrapHurt();try{NSP.abyss(heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'ice',spell:'abyss'});worldSlow=1;slowT=0;runOut();}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast are the old sea',!ABM.dbg.length&&F.every(e=>hits(e,1000,true).length===1&&drowns(e).every(h=>near(h.amt,6000)))&&same(F));}
  {const e0=errs;const bad=[];for(let L=1;L<=5;L++){const F=stage(300);heroU.scd={};heroU.gcd=0;setL(L);meta.spells.abyss=meta.spells.abyss||{lvl:1,hero:null};ABM.dbg=[];fireScroll(heroU,'abyss',heroStats(),F.slice());
      for(let i=0;i<200&&!ANC.live.abyss;i++)run(.05);worldSlow=1;slowT=0;runOut();const o=ev('opts')[0];if(!o||o.L!==L||F.some(e=>!e.dead))bad.push(L+':'+(o?o.L:'-')+'/'+F.filter(e=>!e.dead).length);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive, every foe dies) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;ABM.dbg=null;window.__fz=false;try{resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;worldSlow=1;slowT=0;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);ancUnfilter();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
