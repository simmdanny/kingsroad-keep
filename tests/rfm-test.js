(function(){
/* Riftfang's masteries as Simon designed them (v408). Run on the dev page: __kk.ev(await (await fetch('/tests/rfm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.riftfang=SM_XP[L-1];else delete meta.smast.riftfang;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
const row=(n,gap,hp)=>{const d0=spotD(),F=[];for(let i=0;i<n;i++)F.push(foe(d0+(i-Math.floor(n/2))*gap,0,hp));return F;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot)});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('riftfang',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'dark',anc:false,spell:'riftfang'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&!h.dot&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const ev=n=>RFM.dbg.filter(d=>d.ev===n);
const MEV=['burst','splAim','splinter','pin','pinHit','mark','markMove','deathmark','barrage','spear','converge','cvBoom'];
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.riftfang.map(x=>x.n).join('|')==='Shardburst|Void Pins|Deathmark|Blackglass Barrage|Cataclysmic Convergence',SM_D.riftfang.map(x=>x.n).join('|'));
  ok('and his numbers: 30%, 45%, 120%, 45%, 100% and 50%',/30%/.test(smDesc('riftfang',0))&&/45%/.test(smDesc('riftfang',1))&&/120%/.test(smDesc('riftfang',2))&&/45%/.test(smDesc('riftfang',3))&&/100%/.test(smDesc('riftfang',4))&&/50%/.test(smDesc('riftfang',4))&&RFM.sb===.3&&RFM.pin===.45&&RFM.dm===1.2&&RFM.bb===.45&&RFM.cv===1&&RFM.cvArc===.5&&RFM.bbN===6&&RFM.bbOpen===.7);
  ok('the old masteries are gone (no hooks), every factor at least 1, his numbers',!SMF.riftfang.hit&&!SMF.riftfang.cast&&SMA.riftfang.every(x=>x===1)&&SMG.riftfang.length===5&&SMG.riftfang.every(x=>x>=1)&&SM.free&&!!SM.free.riftfang);
  /* ---- Mastery 0 ---- */
  {play();RFM.dbg=[];log=[];const T=foe(spotD());wrapHurt();try{cast(T,0);run(3);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the same cast as before (150% piercing shard, four 80% side shards), now with void explosions, no masteries',hits(T,150,false).length===1&&hits(T,80,false).length===4&&!log.some(h=>h.smx)&&!RFM.dbg.some(d=>MEV.includes(d.ev))&&ev('side').length===4,log.filter(h=>!h.dot).map(h=>h.amt).join(','));}
  /* ---- M1 Shardburst ---- */
  {play();RFM.dbg=[];log=[];const F=row(9,.45),T=F[4];wrapHurt();try{cast(T,1);run(1.6);}finally{hurt=H0;}const b=ev('burst')[0],sp=F.filter(e=>hits(e,30,true).length);
    ok('M1: the piercing shard bursts into 3 splinters, 30% each to 3 different foes',ev('burst').length===1&&sp.length===3&&sp.every(e=>hits(e,30,true).length===1)&&ev('splinter').length===3,sp.length);
    const pierced=ev('pierce')[0].L,cand=F.filter(e=>Math.hypot(e.x-b.x,e.z-b.z)<RFM.sbR&&!pierced.includes(e));
    ok('M1: they take the nearest foes within 2.8 of the burst that the shard did not pierce',sp.every(e=>Math.hypot(e.x-b.x,e.z-b.z)<RFM.sbR&&!pierced.includes(e))&&cand.length>=3,cand.length);
    run(2);setL(0);ok('M1: nothing else (no pins, marks, barrage or convergence)',!ev('pin').length&&!ev('mark').length&&!ev('barrage').length&&!ev('converge').length);}
  {play();RFM.dbg=[];log=[];const T=foe(spotD());wrapHurt();try{cast(T,1);run(2);}finally{hurt=H0;setL(0);}ok('M1: with nobody else near, it still bursts but no splinter hits',ev('burst').length===1&&!ev('splinter').length&&!log.some(h=>near(h.amt,30)),ev('burst').length+' '+ev('splinter').length+' '+log.filter(h=>!h.dot).map(h=>h.amt).join(','));}
  /* ---- M2 Void Pins ---- */
  {play();RFM.dbg=[];log=[];const F=row(5,.45),T=F[2];wrapHurt();try{cast(T,2);run(1.33);}finally{hurt=H0;}
    ok('M2: each side shard drives a blade in where it lands, four in all',ev('pin').length===4,ev('pin').length);
    log=[];wrapHurt();try{run(.6);}finally{hurt=H0;}const ph=ev('pinHit');
    ok('M2: at the fourth, the blades erupt: 45% to every foe within 0.6 of each',ph.length===4&&ph.every(d=>d.L.every(e=>Math.hypot(e.x-d.x,e.z-d.z)<=RFM.pinR+1e-6)&&enemies.filter(e=>!e.dead&&Math.hypot(e.x-d.x,e.z-d.z)<RFM.pinR-.01).every(e=>d.L.includes(e))),ph.map(d=>d.n).join(','));
    ok('M2: a foe near several blades is hit by each (here the target)',hits(T,45,true).length===ph.filter(d=>d.L.includes(T)).length&&hits(T,45,true).length>=2,hits(T,45,true).length);run(2);setL(0);}
  {play();RFM.dbg=[];const F=row(5,.45),T=F[2];T.maxHp=T.hp=100;cast(T,2);run(2.2);setL(0);ok('M2: if the target dies early, the blades still form where the shards land, and erupt',T.dead&&ev('pin').length===4&&ev('pinHit').length===4);}
  /* ---- M3 Deathmark ---- */
  {play();RFM.dbg=[];log=[];const F=row(5,.45),T=F[2];wrapHurt();try{cast(T,3);run(2.2);}finally{hurt=H0;setL(0);}
    ok('M3: each side shard on the target carves a mark; at four they detonate for 120% more',ev('mark').length===4&&ev('mark').every(d=>d.e===T)&&ev('deathmark').length===1&&hits(T,120,true).length===1,ev('mark').length+' marks');}
  {play();RFM.dbg=[];log=[];const F=row(5,.45),T=F[2];T.maxHp=T.hp=200;wrapHurt();try{cast(T,3);run(2.4);}finally{hurt=H0;setL(0);}const mv=ev('markMove')[0],H=mv&&mv.to;
    ok('M3: when the target dies first, its marks pass to the nearest foe within 1.2 (the killing shard\'s mark counts)',T.dead&&mv&&mv.n===1&&Math.hypot(H.x-T.x,H.z-T.z)<RFM.dmR,mv&&mv.n);
    ok('M3: and the sequence finishes on that foe: 120%',ev('mark').length===4&&ev('deathmark').length===1&&ev('deathmark')[0].e===H&&hits(H,120,true).length===1);}
  /* ---- M4 Blackglass Barrage ---- */
  {play();RFM.dbg=[];log=[];const F=row(9,.4),T=F[4],Fl=foe(spotD()+.3,.4);Fl.fly=true;wrapHurt();try{cast(T,4);run(3);}finally{hurt=H0;setL(0);}const sp=ev('spear');
    ok('M4: after the five shards the rift hurls six spears, 45% each',ev('barrage').length===1&&sp.length===6&&sp.every(d=>hits(d.e,45,true).length>=1),sp.length);
    ok('M4: at six different foes when there are six, flyers too',new Set(sp.map(d=>d.e)).size===6&&sp.every(d=>Math.hypot(d.e.x-T.x,d.e.z-T.z)<RFM.bbR)&&(Math.hypot(Fl.x-T.x,Fl.z-T.z)>Math.hypot(F[1].x-T.x,F[1].z-T.z)||sp.some(d=>d.e===Fl)));}
  {play();RFM.dbg=[];const F=row(2,.45),T=F[1];cast(T,4);run(3);setL(0);ok('M4: with fewer foes the spears go round them again',ev('spear').length===6&&new Set(ev('spear').map(d=>d.e)).size===2);}
  /* ---- M5 Cataclysmic Convergence ---- */
  {play();RFM.dbg=[];log=[];const F=row(9,.4),T=F[4];const added=track();wrapHurt();
    try{cast(T,5);run(3.2);const cb=ev('cvBoom');
      ok('M5: the five shards leave five fractures; after the fifth they all explode',ev('converge').length===1&&ev('converge')[0].n===5&&cb.length===5,cb.length);
      const hit=new Set();cb.forEach(d=>d.L.forEach(e=>hit.add(e)));
      ok('M5: 100% to the foes within 0.75 of each, once per foe however many explosions catch it',[...hit].every(e=>hits(e,100,true).length===1)&&cb.every(d=>d.L.every(e=>Math.hypot(e.x-d.x,e.z-d.z)<=RFM.cvR+1e-6)),hit.size);
      const arc=new Set();cb.forEach(d=>d.arc.forEach(e=>arc.add(e)));
      ok('M5: violet lightning leaps to up to 2 foes near each explosion for 50%, once per foe',arc.size>0&&[...arc].every(e=>hits(e,50,true).length===1)&&cb.every(d=>d.arc.length<=RFM.cvArcN),arc.size);
      run(3);ok('M5: then the rift snaps shut and nothing is left behind',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();RFM.dbg=[];const T=foe(spotD());cast(T,4);run(3);setL(0);ok('M5 needs Mastery 5',!ev('converge').length&&!ev('cvBoom').length);}
  /* ---- the rest ---- */
  {play();RFM.dbg=[];const T=foe(spotD());setL(5);castRiftfang(heroU,T,100,{src:heroU,el:'dark',spell:'riftfang'});run(3);setL(0);
    ok('casts that are not a mastered scroll cast get no masteries (only the new explosions)',RFM.dbg.length&&!RFM.dbg.some(d=>MEV.includes(d.ev)));}
  {const e0=errs,n0=NS_OWN.size;for(let L=1;L<=5;L++){play();const F=row(10,.4,260),T=F[5];cast(T,L);run(5);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors and frees its trails',errs===e0&&NS_OWN.size<=n0,(errs-e0)+' errors, '+(NS_OWN.size-n0)+' left');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;RFM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
