(function(){
/* Magma Geyser's masteries as Simon designed them (v410). Run on the dev page: __kk.ev(await (await fetch('/tests/gmm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.geyser=SM_XP[L-1];else delete meta.smast.geyser;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
const row=(n,gap,hp)=>{const d0=spotD(),F=[];for(let i=0;i<n;i++)F.push(foe(d0+(i-Math.floor(n/2))*gap,0,hp));return F;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('geyser',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'fire',anc:false,spell:'geyser'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&!h.dot&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const ev=n=>GMM.dbg.filter(d=>d.ev===n);
const MEV=['shrapnel','vein','veinHit','heartStart','heart','cascade','fissure','calBurst','caldera','calPulse','calEnd'];
const inR=(d,R)=>d.L.every(e=>Math.hypot(e.x-d.x,e.z-d.z)<=R+1e-6)&&enemies.filter(e=>!e.dead&&!e.fake&&Math.hypot(e.x-d.x,e.z-d.z)<R-.01).every(e=>d.L.includes(e)||e.fly);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.geyser.map(x=>x.n).join('|')==='Molten Shrapnel|Lava Veins|Heart of the Volcano|Fissure Cascade|Caldera',SM_D.geyser.map(x=>x.n).join('|'));
  ok('and his numbers: 85%, 30% and 20%/s, 120%, 100%, 100% / 45% / 150%',/85%/.test(smDesc('geyser',0))&&/30%/.test(smDesc('geyser',1))&&/20%/.test(smDesc('geyser',1))&&/120%/.test(smDesc('geyser',2))&&/100%/.test(smDesc('geyser',3))&&/100%/.test(smDesc('geyser',4))&&/45%/.test(smDesc('geyser',4))&&/150%/.test(smDesc('geyser',4))
    &&GMM.sh===.85&&GMM.vein===.3&&GMM.vBurn===.2&&GMM.vCd===.75&&GMM.heart===1.2&&GMM.heartR===.85&&GMM.heartWait===1.5&&GMM.fis===1&&GMM.fisN===3&&GMM.cal===1&&GMM.calPulse===.45&&GMM.calT===3&&GMM.calEnd===1.5);
  ok('the old masteries are gone (no hooks), every factor at least 1, his numbers',!SMF.geyser.hit&&!SMF.geyser.cast&&SMA.geyser.every(x=>x===1)&&SMG.geyser.length===5&&SMG.geyser.every(x=>x>=1)&&SM.free&&!!SM.free.geyser);
  /* ---- Mastery 0 ---- */
  {play();GMM.dbg=[];log=[];const F=row(7,.4),T=F[3];wrapHurt();try{cast(T,0);run(4);}finally{hurt=H0;setL(0);}const er=ev('erupt')[0];
    ok('Mastery 0: the same eruption (230% within 1.1) and six blobs with pools, now with real fireballs, no masteries',er&&er.L.length>0&&er.L.every(e=>hits(e,230,false).length===1)&&ev('pool').length===6&&!log.some(h=>h.smx)&&!GMM.dbg.some(d=>MEV.includes(d.ev)),er&&er.L.length);}
  /* ---- M1 Molten Shrapnel ---- */
  {play();GMM.dbg=[];log=[];const F=row(15,.4),T=F[7];wrapHurt();try{cast(T,1);run(3);}finally{hurt=H0;setL(0);}const sh=ev('shrapnel'),er=ev('erupt')[0];
    ok('M1: three chunks of molten rock smash down after the eruption',sh.length===3&&sh.every(d=>d.t>er.t+.9),sh.length);
    ok('M1: farther out than the blobs, 85% to every foe within 0.55 of each',sh.every(d=>Math.hypot(d.x-er.x,d.z-er.z)>1.6&&inR(d,GMM.shR)&&d.L.every(e=>hits(e,85,true).length>=1)),sh.map(d=>Math.hypot(d.x-er.x,d.z-er.z).toFixed(2)+':'+d.L.length).join(' '));
    ok('M1: nothing else (no veins, heart, fissures or caldera)',!ev('vein').length&&!ev('heart').length&&!ev('cascade').length&&!ev('caldera').length);}
  /* ---- M2 Lava Veins ---- */
  {play();GMM.dbg=[];log=[];const F=row(9,.35),T=F[4],Fl=foe(spotD()+.2,.1);Fl.fly=true;wrapHurt();const c0=SM.id;try{cast(T,2);run(6);}finally{hurt=H0;setL(0);}const c=SM.ctx.get(c0+1),S=c&&c.gm;
    const er=ev('erupt')[0],R0=nsRouteNear(er.x,er.z),onRoad=q=>{let b=1e9;for(let d=0;d<R0.rt.len;d+=.05){const p=posAt(d,R0.rt);b=Math.min(b,Math.hypot(p[0]-q.x,p[1]-q.z));}return b;};
    ok('M2: three streams of lava well out of the crater just after the eruption',S&&S.veins.length===3&&ev('vein').every(d=>near(d.t-er.t,GMM.vStart,.06))&&S.veins.every(v=>Math.hypot(v.path[0].x-er.x,v.path[0].z-er.z)<1e-6)&&new Set(ev('vein').map(d=>d.dir)).size===2,S&&S.veins.length);
    ok('M2: they flow only along the road (never more than 0.32 off its middle), at most 2.2 long',S.veins.every(v=>v.path.slice(Math.ceil(.4/.06)).every(q=>onRoad(q)<=GMM.vSide+.03)&&v.len<=GMM.vLen*1.6),S.veins.map(v=>Math.max(...v.path.slice(7).map(onRoad)).toFixed(2)+'/'+v.len.toFixed(2)).join(' '));
    ok('M2: in their own meandering patterns, not straight lines',S.veins.every(v=>v.path.slice(7).some(q=>onRoad(q)>.08)));
    const vh=ev('veinHit');ok('M2: ground foes crossing a vein take 30% and burn for 20% a second',vh.length>0&&vh.every(d=>hits(d.e,30,true).length>=1)&&!vh.some(d=>d.e===Fl),vh.length);
    const byE=new Map();vh.forEach(d=>{const a=byE.get(d.e)||[];a.push(d.t);byE.set(d.e,a);});
    ok('M2: at most once every 0.75s for each foe',[...byE.values()].every(a=>a.every((t,i)=>!i||t-a[i-1]>=GMM.vCd-1e-6)),[...byE.values()].map(a=>a.length).join(','));}
  {play();GMM.dbg=[];const T=foe(spotD());const c0=SM.id;cast(T,2);run(GMM.ER+GMM.vStart+.5);const S=SM.ctx.get(c0+1).gm,fr=()=>S.veins.map(v=>v.path.slice(0,v.rev+1).reduce((a,q,i,P)=>a+(i?Math.hypot(q.x-P[i-1].x,q.z-P[i-1].z):0),0));
    const a1=fr();run(1);const a2=fr();run(3);const a3=fr();setL(0);
    ok('M2: the lava creeps on slowly (about 0.7 tiles a second) until the stream is full length',a1.every((x,i)=>x<.6&&a2[i]>x+.4&&a2[i]<x+1)&&a3.every((x,i)=>near(x,S.veins[i].len,.02)),a1.map(x=>x.toFixed(2))+' / '+a2.map(x=>x.toFixed(2))+' / '+a3.map(x=>x.toFixed(2)));}
  {play();GMM.dbg=[];const F=row(9,.35),T=F[4];cast(T,1);run(5);setL(0);ok('M2 needs Mastery 2',!ev('vein').length&&!ev('veinHit').length);}
  /* ---- M3 Heart of the Volcano ---- */
  {play();GMM.dbg=[];log=[];const F=row(7,.3),T=F[3];wrapHurt();try{cast(T,3);run(5);}finally{hurt=H0;setL(0);}const sk=ev('sunk')[0],h=ev('heart')[0],er=ev('erupt')[0];
    ok('M3: 1.5s after the column sinks the heart erupts again',h&&near(h.t-sk.t,GMM.heartWait,.04),h&&(h.t-sk.t).toFixed(2));
    ok('M3: 120% to every foe within 0.85 of the crater',h&&near(h.x,er.x)&&inR(h,GMM.heartR)&&h.L.length>0&&h.L.every(e=>hits(e,120,true).length===1),h&&h.L.length);
    ok('M3: and three more blobs (nine pools in all)',ev('pool').length===9,ev('pool').length);}
  /* ---- M4 Fissure Cascade ---- */
  {play();GMM.dbg=[];log=[];const F=row(21,.35),T=F[10];wrapHurt();try{cast(T,4);run(5);}finally{hurt=H0;setL(0);}const fs=ev('fissure'),cs=ev('cascade')[0],er=ev('erupt')[0];
    ok('M4: three fissures burst along the road, one after another 0.35s apart',cs&&fs.length===3&&fs.every((d,i)=>!i||near(d.t-fs[i-1].t,GMM.fisStep,.06)),fs.map(d=>d.t.toFixed(2)).join(','));
    ok('M4: 1, 2 and 3 tiles out along the road from the crater, on one side',cs&&cs.vents.every((v,i)=>near(Math.abs(v.d-cs.vents[0].d),i*GMM.fisGap,.02))&&fs.every((d,i)=>near(d.x,cs.vents[i].x)&&near(d.z,cs.vents[i].z)));
    ok('M4: each 100% to the foes within 0.6, with blobs of their own (twelve pools in all)',fs.every(d=>inR(d,GMM.fisR)&&d.L.every(e=>hits(e,100,true).length>=1))&&fs.some(d=>d.L.length)&&ev('pool').length===6+3+GMM.fisN*GMM.fisBlobs,ev('pool').length);}
  /* ---- M5 Caldera ---- */
  {play();GMM.dbg=[];log=[];const F=row(9,.3),T=F[4],Fl=foe(spotD()+.1,.1);Fl.fly=true;const added=track();wrapHurt();
    try{cast(T,5);run(8);const cb=ev('calBurst')[0],er=ev('erupt')[0],sk=ev('sunk')[0],cp=ev('calPulse'),ce2=ev('calEnd')[0];
      ok('M5: the eruption blasts the middle for 100% more (within 1)',cb&&near(cb.t,er.t)&&inR(cb,GMM.calR)&&cb.L.every(e=>log.some(h=>h.e===e&&h.smx&&near(h.amt,100)&&near(h.t,cb.t,.01))),cb&&cb.L.length);
      ok('M5: the caldera surges three times, 1s apart, 45% to ground foes within 1.25 (not flyers)',cp.length===3&&cp.every((d,i)=>Math.abs(d.t-sk.t-(i+.5))<.08)&&cp.every(d=>!d.L.includes(Fl)&&d.L.length>0&&d.L.every(e=>Math.hypot(e.x-er.x,e.z-er.z)<=GMM.calPulseR+1e-6)),cp.map(d=>(d.t-sk.t).toFixed(2)+':'+d.L.length).join(' '));
      ok('M5: then it caves in and explodes outward: 150% to every foe within 1.7, flyers too',ce2&&near(ce2.t-sk.t,GMM.calT+.3,.06)&&inR(ce2,GMM.calEndR)&&ce2.L.includes(Fl)&&ce2.L.every(e=>hits(e,150,true).length===1),ce2&&(ce2.t-sk.t).toFixed(2));
      run(4);ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();GMM.dbg=[];const T=foe(spotD());cast(T,4);run(6);setL(0);ok('M5 needs Mastery 5',!ev('caldera').length&&!ev('calBurst').length);}
  /* ---- the rest ---- */
  {play();GMM.dbg=[];const T=foe(spotD());setL(5);castMagmaGeyser(heroU,T,100,{src:heroU,el:'fire',spell:'geyser'});run(5);setL(0);
    ok('casts that are not a mastered scroll cast get no masteries (only the new fireballs)',ev('erupt').length===1&&!GMM.dbg.some(d=>MEV.includes(d.ev)));}
  {const e0=errs,n0=NS_OWN.size;for(let L=1;L<=5;L++){play();const F=row(11,.35,400),T=F[5];cast(T,L);run(9);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors and frees what it made',errs===e0&&NS_OWN.size<=n0,(errs-e0)+' errors, '+(NS_OWN.size-n0)+' left');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;GMM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
