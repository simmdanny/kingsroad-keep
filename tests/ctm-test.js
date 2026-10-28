(function(){
/* Chronostasis's masteries (v433). Run on the dev page: __kk.ev(await (await fetch('/tests/ctm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add,B0=cfmBoom;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.chronostasis=SM_XP[L-1];else delete meta.smast.chronostasis;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=4;d<R.len-4;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>CTM.dbg.filter(d=>d.ev===n);
const MEV=['rewind','hand','echo','haste','second'];
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const knot=(n,gap)=>{const d0=spotD(),F=[];for(let i=0;i<n;i++)F.push(foe(d0+(i-(n>>1))*(gap||.3),(i%3-1)*.15));return F;};
const cast=(L,c)=>{setL(L);castScrollNow('chronostasis',heroU,tStats(heroU),[c],100,{src:heroU,bane:0,el:'light',anc:false,spell:'chronostasis'});};
const inF=(e,c)=>(e.x-c.x)**2+(e.z-c.z)**2<=CTM.R*CTM.R;
const END=CTM.COL+CTM.scT+1;
try{
  ok('the five masteries: Rewind, Sweeping Hand, Echoes, Stolen Time, Second Collapse',SM_D.chronostasis.map(x=>x.n).join('|')==='Rewind|Sweeping Hand|Echoes|Stolen Time|Second Collapse',SM_D.chronostasis.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (180%, 35%, 40%, 30%, 140%)',/180%/.test(smDesc('chronostasis',0))&&/35%/.test(smDesc('chronostasis',1))&&/40%/.test(smDesc('chronostasis',2))&&/30%/.test(smDesc('chronostasis',3))&&/140%/.test(smDesc('chronostasis',4))
    &&CTM.rw===.8&&CTM.rwD===1.8&&CTM.hd===.35&&CTM.hdT===2&&CTM.ec===.4&&CTM.ecN===6&&CTM.hs===.3&&CTM.sc===1.4&&CTM.scT===1.2&&CTM.scStun===.5);
  ok('the old masteries are gone (no hooks), calibrated on the Legendary ladder with hidden factors (not SM.free)',!SMF.chronostasis.hit&&!SMF.chronostasis.cast&&SMA.chronostasis.every(x=>x===1)&&SMG.chronostasis.length===5&&SMG.chronostasis.every(x=>x>=1&&x<1.3)&&!(SM.free&&SM.free.chronostasis),SMG.chronostasis.join());
  ok('it stays a developer-mode scroll (Legendary is not opened)',!SM_OPEN.includes('legendary'));
  /* ---- Mastery 0 ---- */
  {play();CTM.dbg=[];log=[];const F=knot(7);let nb=0;cfmBoom=function(){nb++;return B0.apply(this,arguments);};const added=track();wrapHurt();let fA=0;
    try{cast(0,F[3]);run(CTM.COL+.03);fA=flashA;run(END-CTM.COL);}finally{hurt=H0;cfmBoom=B0;scene.add=S0;setL(0);}const cl=ev('collapse')[0],c={x:F[3].x,z:F[3].z};
    ok('Mastery 0: time catches up with 500% to every foe inside',cl&&F.filter(e=>inF(e,c)).every(e=>log.some(h=>h.e===e&&!h.smx&&!h.dot&&near(h.amt,500))));
    ok('Mastery 0: the glass of time is real 3D shards with a pale 3D blast, and a softer flash',nb>=1&&added.filter(o=>o.isMesh&&o.geometry===LPM.sg).length>=30&&fA<=.31,nb+' blasts, '+added.filter(o=>o.isMesh&&o.geometry===LPM.sg).length+' shards, flash '+fA.toFixed(2));
    ok('Mastery 0: no masteries',!log.some(h=>h.smx)&&!CTM.dbg.some(d=>MEV.includes(d.ev)));}
  /* ---- M1 Rewind ---- */
  {play();CTM.dbg=[];log=[];const F=knot(5),Far=foe(F[2].dist+6);F.forEach(e=>{e.spd=1;});const d0=F.map(e=>e.dist),df=Far.dist;wrapHurt();try{cast(1,F[2]);run(1);}finally{hurt=H0;setL(0);}const rw=ev('rewind')[0];
    ok('M1: as the field forms, every foe inside is wound back 0.8 tiles',rw&&rw.L.length===5&&F.every((e,i)=>near(d0[i]-e.dist,CTM.rw,.02)),F.map((e,i)=>(d0[i]-e.dist).toFixed(2)).join(' '));
    ok('M1: and takes 180%',F.every(e=>log.some(h=>h.e===e&&h.smx&&near(h.amt,180))));
    ok('M1: not the foes outside',Far.dist===df&&!log.some(h=>h.e===Far));}
  /* ---- M2 Sweeping Hand ---- */
  {play();CTM.dbg=[];log=[];const F=knot(5,.4);wrapHurt();try{cast(2,F[2]);run(END);}finally{hurt=H0;setL(0);}const hd=ev('hand');
    ok('M2: the hand passes over every foe inside about once every 2 seconds (5 turns in 10s)',F.every(e=>{const n=hd.filter(d=>d.e===e).length;return n>=4&&n<=6;}),F.map(e=>hd.filter(d=>d.e===e).length).join(''));
    ok('M2: 35% each pass, once a turn',hd.every(d=>log.some(h=>h.e===d.e&&h.smx&&near(h.amt,35)&&near(h.t,d.t,.01)))&&F.every(e=>{const T=hd.filter(d=>d.e===e).map(d=>d.turn);return new Set(T).size===T.length;}));
    ok('M2: it stops when time stands still (no passes in the last 0.25s)',!hd.some(d=>d.t>ev('collapse')[0].t-CTM.FRZ+.05&&d.t<ev('collapse')[0].t));}
  /* ---- M3 Echoes ---- */
  {play();CTM.dbg=[];log=[];const F=knot(5,.4);wrapHurt();try{cast(3,F[2]);run(END);}finally{hurt=H0;setL(0);}const ec=ev('echo')[0];
    ok('M3: a foe that spent the whole 10s inside has 6 echoes',ec&&ec.L.length===5&&ec.L.every(q=>q.n===CTM.ecN),ec&&ec.L.map(q=>q.n).join(''));
    ok('M3: they rush back into it when time catches up: 40% each',ec&&ec.L.every(q=>log.some(h=>h.e===q.e&&h.smx&&near(h.amt,40*q.n)&&h.t>ec.t&&h.t<ec.t+.4)));}
  /* ---- M4 Stolen Time ---- */
  {play();CTM.dbg=[];const F=knot(3);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const p=tw(c,r),d=(p.x-F[1].x)**2+(p.z-F[1].z)**2;if(d<bd&&d>1){bd=d;best=[c,r];}}
    gold+=buildCost('archer');placeTower('archer',best[0],best[1]);const T=towers[towers.length-1];cast(4,F[1]);run(3);const hs=ev('haste')[0];const c0=T.cd=5;towerUpdate(T,1);const dc=c0-T.cd;
    ok('M4: towers that can reach into the field are found',hs&&hs.L.includes(T),hs&&hs.L.length);
    ok('M4: and attack 30% faster while it holds',near(dc,1.3,.001),dc.toFixed(2));
    run(CTM.COL);T.cd=5;towerUpdate(T,1);const dc2=5-T.cd;setL(0);ok('M4: and only while it holds',near(dc2,1,.001),dc2.toFixed(2));}
  /* ---- M5 Second Collapse ---- */
  {play();CTM.dbg=[];log=[];const F=knot(5,.4),Far=foe(F[2].dist+6);const added=track();wrapHurt();try{cast(5,F[2]);run(END);const sc=ev('second')[0],cl=ev('collapse')[0];
      ok('M5: the moment happens again 1.2s after the collapse',sc&&near(sc.t-cl.t,CTM.scT+.45,.12),sc&&(sc.t-cl.t).toFixed(2));
      ok('M5: 140% to every foe inside, and frozen 0.5s',sc&&sc.L.length===5&&sc.L.every(e=>log.some(h=>h.e===e&&h.smx&&near(h.amt,140)&&near(h.t,sc.t,.01)))&&!sc.L.includes(Far),sc&&sc.L.length);
      run(3);ok('M5: nothing is left behind',smLeft(added)===0&&!CTM.haste,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();CTM.dbg=[];const F=knot(3);cast(4,F[1]);run(END);setL(0);ok('M5 needs Mastery 5',!ev('second').length);}
  /* ---- the rest ---- */
  {play();CTM.dbg=[];const F=knot(3);setL(5);castChronostasis(heroU,F[1],100,{src:heroU,el:'light',spell:'chronostasis'});run(END);setL(0);
    ok('casts that are not a mastered scroll cast get no masteries (only the new 3D collapse)',ev('collapse').length===1&&!CTM.dbg.some(d=>MEV.includes(d.ev)));}
  {const e0=errs;for(let L=1;L<=5;L++){play();const F=knot(6);F.forEach(e=>{e.maxHp=e.hp=150;});cast(L,F[3]);run(END+1);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0&&!CTM.haste,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;cfmBoom=B0;CTM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
