(function(){
/* Rime Bloom's masteries as Simon designed them (rbm_b.js). Run on the dev page: __kk.ev(await (await fetch('/tests/rbm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still where they are put (only the effects are stepped, updFx), and hurt is wrapped to log the
   amount each hit is called with (before armour, auras or artifacts), so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add,E0=rbmErupt;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
/* the effects run on their own clock; the game clock (time, which Brittle reads) moves with them */
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;for(const e of enemies){if(e.stunT>0)e.stunT=Math.max(0,e.stunT-.05);if(e.slowT>0)e.slowT=Math.max(0,e.slowT-.05);if(e.chillT>0)e.chillT=Math.max(0,e.chillT-.05);}}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.rimebloom=SM_XP[L-1];else delete meta.smast.rimebloom;};
const spot=()=>{const R=ROUTES[0];let bd=1e9,bp=null;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bp=p;}}return bp;};
const foe=(x,z,type,boss)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.x=x;e.z=z;e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;if(boss)e.boss=true;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),shat:!!(o&&o.rbShat),el:o&&o.el});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('rimebloom',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'ice',anc:false,spell:'rimebloom'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
/* a cast at the road spot; u = along the road, v = across it */
const base=()=>{play();RBM.dbg=[];log=[];const p=spot(),ang=p[2],u=[Math.sin(ang),Math.cos(ang)],v=[Math.cos(ang),-Math.sin(ang)]/* along the road and across it: a segment's angle is atan2(dx,dz) */;const at=(a,b)=>[p[0]+u[0]*a+v[0]*b,p[1]+u[1]*a+v[1]*b];return{p,u,v,at};};
const crack=e=>{let n=0;e.g.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===RBMT.crack)n++;});return n;};
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.rimebloom.map(x=>x.n).join('|')==='Permafrost|Crystal Eruption|Brittle Ground|Glacial Prison|Everfrost Lily',SM_D.rimebloom.map(x=>x.n).join('|'));
  ok('no mastery of it shares its name with a scroll (Eternal Winter is the Mythic scroll; the fifth is Everfrost Lily since its rename)',SM_D.rimebloom.every(m=>!SCROLL_IDS.some(k=>SPELLS_S[k].n===m.n)),SM_D.rimebloom.filter(m=>SCROLL_IDS.some(k=>SPELLS_S[k].n===m.n)).map(m=>m.n).join(','));
  ok('and his numbers: 2s longer, 1s more, 40%, 4s, 1.25s (bosses 0.5s), 3s and 50% (the shatter 30%)',/2s longer/.test(smDesc('rimebloom',0))&&/1s after/.test(smDesc('rimebloom',0))&&/40%/.test(smDesc('rimebloom',1))&&/4s/.test(smDesc('rimebloom',2))&&/30%/.test(smDesc('rimebloom',2))&&/1\.25s \(bosses 0\.5s/.test(smDesc('rimebloom',3))&&/3s/.test(smDesc('rimebloom',4))&&/50%/.test(smDesc('rimebloom',4))&&RBM.erupt===.4&&RBM.wave===.5&&RBM.prison===1.25);
  ok('the old masteries are gone (only the Brittle hook), every factor at least 1',typeof SMF.rimebloom.hit==='function'&&!SMF.rimebloom.cast&&SMA.rimebloom.every(x=>x===1)&&SMG.rimebloom.length===5&&SMG.rimebloom.every(x=>x>=1)&&SM.free&&!!SM.free.rimebloom);
  /* ---- Mastery 0 ---- */
  {const B=base(),T=foe(B.p[0],B.p[1]);wrapHurt();try{cast(T,0);run(6);}finally{hurt=H0;setL(0);}
    const imp=log.filter(h=>h.e===T&&!h.smx&&!h.dot);ok('Mastery 0: the old bloom, 220% of its power, and none of the masteries',imp.length===1&&near(imp[0].amt,220)&&!RBM.dbg.length&&!log.some(h=>h.smx)&&!T.rbBr,imp.map(h=>h.amt)+' '+RBM.dbg.length);}
  /* ---- M1 Permafrost ---- */
  {const B=base(),T=foe(...B.at(0,0));const W=foe(...B.at(0,1.42)),F=foe(...B.at(.3,.3),'raven');wrapHurt();try{cast(T,1);run(1);
      ok('M1: a foe at 1.42 tiles (past the old 1.3) is slowed 25% and chilled by the frost',W.slow>=.25&&W.slowT>1&&W.chillT>1,W.slow+' '+W.slowT.toFixed(2)+' '+W.chillT.toFixed(2));
      ok('M1: a flying foe is not',!(F.chillT>0)||RBM.dbg.every(d=>d.ev!=='chill'||d.e!==F));
      run(4.4);const N=foe(...B.at(.5,0));run(.4);ok('M1: at 5.8s (the old ground ended at 4.6) a foe stepping on is still slowed and chilled',N.slow>=.25&&N.slowT>1&&N.chillT>1,N.slowT.toFixed(2)+' '+N.chillT.toFixed(2));
      const q=B.at(0,3.5);N.x=q[0];N.z=q[1];run(.8);const k1=N.slowT>0&&N.chillT>0;run(.9);
      ok('M1: after stepping off it stays slowed and chilled for about 1s more',k1&&!(N.slowT>0)&&!(N.chillT>0),k1);
      run(1);const Z=foe(...B.at(-.4,0));run(.5);ok('M1: after 6.6s the frost is gone',!(Z.chillT>0)&&!(Z.slowT>0));}finally{hurt=H0;setL(0);}}
  /* ---- M2 Crystal Eruption ---- */
  {const B=base(),T=foe(...B.at(0,0)),F=[];for(let a=-1.3;a<=1.31;a+=.26)if(Math.abs(a)>.01)F.push(foe(...B.at(a,(F.length%3-1)*.15)));const far=foe(...B.at(2.6,0));const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};
    wrapHurt();let t0=null;try{cast(T,2);for(let i=0;i<40;i++){run(.05);if(t0===null&&RBM.dbg.some(d=>d.ev==='erupt'))t0=(i+1)*.05;}run(6);}finally{hurt=H0;scene.add=S0;setL(0);}
    const er=RBM.dbg.filter(d=>d.ev==='erupt'),hits=log.filter(h=>h.smx&&near(h.amt,40));
    ok('M2: three crystals erupt, after the bloom, inside its area and on the road',er.length===3&&t0>.45&&er.every(d=>{const q=nsRouteNear(d.x,d.z),w=posAt(q.d,q.rt);return (d.x-B.p[0])**2+(d.z-B.p[1])**2<RBM.R*RBM.R&&Math.hypot(d.x-w[0],d.z-w[1])<.35;}),er.length+' at '+t0+' '+er.map(d=>{const q=nsRouteNear(d.x,d.z),w=posAt(q.d,q.rt);return Math.hypot(d.x-B.p[0],d.z-B.p[1]).toFixed(2)+'/'+Math.hypot(d.x-w[0],d.z-w[1]).toFixed(2);}).join(' '));
    ok('M2: each crystal hits the foes around it for 40% of the power, and only those',hits.length>0&&RBM.dbg.filter(d=>d.ev==='crystal').every(d=>er.some(q=>(d.e.x-q.x)**2+(d.e.z-q.z)**2<RBM.crR*RBM.crR))&&log.filter(h=>h.smx&&!near(h.amt,40)).length===0&&!log.some(h=>h.e===far&&h.smx),hits.length+' hits');
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 Brittle Ground (the crystals are switched off here, so they cannot shatter it first) ---- */
  rbmErupt=function(){};
  {const B=base(),T=foe(...B.at(0,0)),A=foe(...B.at(.5,.2)),C=foe(...B.at(-.5,-.2)),D=foe(...B.at(.3,-.3)),far=foe(...B.at(2.6,0));wrapHurt();
    try{cast(T,3);run(.6);
      ok('M3: the foes the bloom hit are Brittle for 4s, frosted cracks on their bodies; foes it missed are not',[T,A,C,D].every(e=>e.rbBr&&near(e.rbBr.until-time,RBM.brit-.2,.02))&&crack(A)>0&&!far.rbBr,[T,A,C,D].map(e=>crack(e)).join(','));
      const n0=log.length;hurt(A,10,'magic',{src:heroU,el:'ice',spell:'frostshard'});const sh=log.slice(n0).filter(h=>h.e===A&&h.shat);
      ok('M3: the next ice scroll hit shatters it for 30% of the power and ends it',sh.length===1&&near(sh[0].amt,30)&&!A.rbBr,sh.map(h=>h.amt));
      const n1=log.length;hurt(A,10,'magic',{src:heroU,el:'ice',spell:'frostshard'});ok('M3: a second ice hit does not shatter again',!log.slice(n1).some(h=>h.shat));
      const n2=log.length;hurt(C,10,'magic',{src:heroU,el:'fire',spell:'emberbolt'});hurt(C,10,'magic',{src:heroU,el:'ice',spell:'frostshard',dot:true});hurt(C,10,'magic',{src:heroU,el:'ice'});
      ok('M3: a fire hit, an ice damage tick and an ice hit that is not a scroll leave it Brittle',!log.slice(n2).some(h=>h.shat)&&!!C.rbBr);
      run(.4);ok('M3: the cracks are taken off once it shatters',crack(A)===0&&crack(C)>0,crack(A)+' '+crack(C));
      run(3.95);const n3=log.length;hurt(D,10,'magic',{src:heroU,el:'ice',spell:'frostshard'});
      ok('M3: after its 4s it is over: no shatter, no cracks left',!log.slice(n3).some(h=>h.shat)&&crack(D)===0&&crack(C)===0,crack(D));}
    finally{hurt=H0;setL(0);}}
  {const B=base(),T=foe(...B.at(0,0));wrapHurt();try{cast(T,3);run(.6);const n=log.length;cast(T,3);run(1);ok('M3: a later Rime Bloom\'s own hit shatters an earlier one\'s Brittle',log.slice(n).some(h=>h.e===T&&h.shat));}finally{hurt=H0;setL(0);}}
  rbmErupt=E0;
  /* ---- M4 Glacial Prison ---- */
  {const B=base(),T=foe(...B.at(0,0)),Bs=foe(...B.at(.6,0),'ogre',true),F=foe(...B.at(-.4,.2),'raven'),O=foe(...B.at(0,2)),Rs=foe(...B.at(-.6,-.1));stunE(Rs,5);Rs.stunT=0;
    const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};wrapHurt();
    try{cast(T,4);run(.75);const h=RBM.dbg.filter(d=>d.ev==='held'),g=e=>(h.find(d=>d.e===e)||{}).got;
      ok('M4: the ground foes inside are frozen for 1.25s, a boss for 0.5s',near(g(T),1.25,.01)&&near(g(Bs),.5,.01)&&T.stunT>1,g(T)+' '+g(Bs));
      ok('M4: Resolve applies (a foe whose Resolve is spent is not held), flyers and foes outside are not held',!(g(Rs)>0)&&g(F)===undefined&&g(O)===undefined,g(Rs)+' '+g(F)+' '+g(O));
      run(1.2);ok('M4: then the walls shatter',RBM.dbg.some(d=>d.ev==='prisonbreak'));run(6);ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
    finally{hurt=H0;scene.add=S0;setL(0);}}
  /* ---- M5 Eternal Winter ---- */
  {const B=base(),T=foe(...B.at(0,0)),A=foe(...B.at(1.9,0)),F=foe(...B.at(-.8,.6),'raven'),O=foe(...B.at(2.6,0));const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};
    wrapHurt();const ts=[];let slowOk=true;
    try{cast(T,5);let chk=false;for(let i=0;i<100;i++){const n0=RBM.dbg.filter(d=>d.ev==='petal').length;run(.05);const n1=RBM.dbg.filter(d=>d.ev==='petal').length;if(n1>n0)ts.push(+((i+1)*.05).toFixed(2));
        if(ts.length===3&&!chk&&(i+1)*.05>=ts[2]+.45){chk=true;slowOk=A.slow>=.45&&A.slowT>2.4;}}
      run(6);}finally{hurt=H0;scene.add=S0;setL(0);}
    const w=e=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,50)).length;
    ok('M5: a crystal flower; one great petal shatters at the end of each second, three in all',RBM.dbg.some(d=>d.ev==='flower')&&ts.length===3&&near(ts[0],1.4,.05)&&near(ts[1],2.4,.05)&&near(ts[2],3.4,.05),ts.join(','));
    ok('M5: each petal\'s ring of ice hits every foe out to 2.2 once, for 50% of the power (flyers too)',w(T)===3&&w(A)===3&&w(F)===3&&w(O)===0,[w(T),w(A),w(F),w(O)].join(','));
    ok('M5: and refreshes their slow (45% for 3s)',slowOk);ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- other casters, the real cast path ---- */
  {const B=base(),T=foe(...B.at(0,0));wrapHurt();try{setL(5);castRimeBloom(heroU,T,100,{src:heroU,el:'ice'});castRimeBloom(heroU,T,100,smO({src:heroU,el:'ice',smId:1}));run(5);}finally{hurt=H0;setL(0);}
    ok('casts that are not the hero\'s own mastered scroll stay the old Rime Bloom',!RBM.dbg.length&&log.filter(h=>h.e===T&&!h.shat).every(h=>near(h.amt,220)),RBM.dbg.length);}
  {const e0=errs;for(let L=1;L<=5;L++){const B=base(),T=foe(...B.at(0,0));for(let i=0;i<6;i++)foe(...B.at((i-3)*.35,(i%2?.25:-.25)),i===5?'raven':'knight');cast(T,L);run(7);}setL(0);
    ok('the real cast path at every mastery runs without errors',errs===e0,errs-e0);}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;rbmErupt=E0;RBM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
