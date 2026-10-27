(function(){
/* Soul Lantern's masteries as Simon designed them (slm_b.js). Run on the dev page: __kk.ev(await (await fetch('/tests/slm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still where they are put (only the effects are stepped, updFx, with the game clock), hurt is wrapped
   to log the amount each hit is called with, and window.setTimeout (the lantern's jumps land 70ms later) is queued on the same clock, so every
   number is checked exactly. Casts are at power 100: the beam is 50, its jump 30. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add,ST0=window.setTimeout;
/* the Monarch's aura bursts when foes die near the hero: off here, it would hit the test foes */
const AU=AURA[meta.equipped],B0=AU&&AU.boom;if(AU)AU.boom=0;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
let clock=0;const Q=[];
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;clock+=.05;for(let j=0;j<Q.length;)if(Q[j].at<=clock+1e-9){const q=Q.splice(j,1)[0];try{q.f();}catch(err){console.error(err);}}else j++;
  for(const e of enemies){if(e.stunT>0)e.stunT=Math.max(0,e.stunT-.05);if(e.slowT>0)e.slowT=Math.max(0,e.slowT-.05);}}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.lantern=SM_XP[L-1];else delete meta.smast.lantern;};
const spot=()=>{const R=ROUTES[0];let bd=1e9,bp=null;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bp=p;}}return bp;};
const foe=(x,z,type,hp)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.x=x;e.z=z;e.spd=0;e.maxHp=hp||1e9;e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:clock});return H0.apply(this,arguments);};};
let O=null;const cast=(T,L)=>{setL(L);O={src:heroU,bane:0,el:'dark',anc:false,spell:'lantern'};castScrollNow('lantern',heroU,tStats(heroU),[T],100,O);};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
/* the road spot; the lantern floats 0.9 from the target toward the hero: d = that way, s = across it */
const base=()=>{play();SLM.dbg=[];log=[];Q.length=0;clock=0;const p=spot(),dx=heroU.x-p[0],dz=heroU.z-p[1],l=Math.hypot(dx,dz),d=[dx/l,dz/l],s=[-d[1],d[0]],c=[p[0]+d[0]*.9,p[1]+d[1]*.9];
  return{p,d,s,c,at:(a,b)=>[p[0]+d[0]*a+s[0]*b,p[1]+d[1]*a+s[1]*b],ac:(a,b)=>[c[0]+d[0]*a+s[0]*b,c[1]+d[1]*a+s[1]*b]};};
const ev=n=>SLM.dbg.filter(q=>q.ev===n);
const watch=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const inScene=o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;};
try{
  window.setTimeout=function(f,ms){if(typeof f!=='function')return ST0.apply(window,arguments);Q.push({f,at:clock+(ms||0)/1000});return 0;};
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.lantern.map(x=>x.n).join('|')==='Brighter Wick|Phantom Bolt|Wandering Souls|Soul Harvest|Lantern of the Dead',SM_D.lantern.map(x=>x.n).join('|'));
  ok('and the numbers: up to 15%, 10%, two flames every 2s for 10%, up to 3 souls of 25%, 10% and a 40% slow for 1.5s',/15%/.test(smDesc('lantern',0))&&/10%/.test(smDesc('lantern',1))&&/2s/.test(smDesc('lantern',2))&&/10%/.test(smDesc('lantern',2))&&/up to 3/.test(smDesc('lantern',3))&&/25%/.test(smDesc('lantern',3))&&/10%/.test(smDesc('lantern',4))&&/40%/.test(smDesc('lantern',4))&&/1\.5s/.test(smDesc('lantern',4))&&SLM.ramp===.15&&SLM.bolt===.1&&SLM.wisp===.1&&SLM.soul===.25&&SLM.souls===3&&SLM.rift===.1,SM_D.lantern.map((x,i)=>smDesc('lantern',i)).join(' | '));
  ok('no mastery of it shares its name with a scroll',SM_D.lantern.every(m=>!SCROLL_IDS.some(k=>SPELLS_S[k].n===m.n)));
  ok('the old masteries are gone (only the soul hooks), calibrated on the ladder (not in SM.free)',typeof SMF.lantern.hit==='function'&&typeof SMF.lantern.kill==='function'&&!SMF.lantern.cast&&SMA.lantern.every(x=>x===1)&&SMG.lantern.length===5&&!(SM.free&&SM.free.lantern),SMG.lantern.join(','));
  /* ---- Mastery 0 ---- */
  {const B=base(),T=foe(...B.at(0,0)),J=foe(...B.at(-.6,0));const added=watch();wrapHurt();try{cast(T,0);run(9);}finally{hurt=H0;scene.add=S0;setL(0);}
    const bt=log.filter(h=>h.e===T&&!h.smx),bj=log.filter(h=>h.e===J&&!h.smx);
    ok('Mastery 0: the old lantern, 5 beams of 50 and their jumps of 30, none of the masteries',bt.length===5&&bt.every(h=>near(h.amt,50))&&bj.length===5&&bj.every(h=>near(h.amt,30))&&!SLM.dbg.length&&!log.some(h=>h.smx),bt.map(h=>h.amt)+' / '+bj.map(h=>h.amt)+' '+SLM.dbg.length);
    ok('Mastery 0: it is gone after 7.3s as before',added.every(o=>!inScene(o)));}
  /* ---- M1 Brighter Wick ---- */
  {const B=base(),T=foe(...B.at(0,0)),J=foe(...B.at(-.6,0));wrapHurt();let S=null;try{cast(T,1);run(.2);S=SM.ctx.get(O.smId).slm;run(8);}finally{hurt=H0;setL(0);}
    const want=[0,1,2,3,4].map(i=>1+.15*Math.min(1,i/4)),bt=log.filter(h=>h.e===T&&!h.smx).map(h=>h.amt),bj=log.filter(h=>h.e===J&&!h.smx).map(h=>h.amt);
    ok('M1: each beam stronger than the last, by 15% x i/4: 50, 51.9, 53.8, 55.6, 57.5 (the 5th +15%)',bt.length===5&&bt.every((a,i)=>near(a,50*want[i])),bt.map(a=>a.toFixed(2)).join(','));
    ok('M1: its jumps too (30 up to 34.5)',bj.length===5&&bj.every((a,i)=>near(a,30*want[i])),bj.map(a=>a.toFixed(2)).join(','));
    ok('M1: the frame is dressed: 11 joint glows on it and glowing seams, the pool swirl with its five marks all lit by the end',!!S&&S.joints.length===11&&!!S.poolD&&S.poolM.uniforms.uN.value===5&&S.kv>.95,S&&S.joints.length+' '+(S&&S.poolM.uniforms.uN.value)+' '+(S&&S.kv.toFixed(2)));}
  /* ---- M2 Phantom Bolt ---- */
  {const B=base(),T=foe(...B.at(0,0)),J=foe(...B.at(-.6,0));const added=watch();wrapHurt();const bt=[];
    try{cast(T,2);for(let i=0;i<180;i++){const n=ev('bolt').length;run(.05);if(ev('bolt').length>n)bt.push(+clock.toFixed(2));}}finally{hurt=H0;scene.add=S0;setL(0);}
    const bo=ev('bolt'),bs=ev('beam'),hb=log.filter(h=>h.smx);
    ok('M2: every beam leaves a rune over its target, and SLM.boltT (0.55s) later it fires a bolt into that foe',ev('rune').length===5&&bo.length===5&&bo.every(q=>q.e===T)&&bt.every((t,i)=>near(t,1.1*(i+1)+.55,.08)),bt.join(','));
    ok('M2: each bolt deals 10% of the power, and only it',hb.length===5&&hb.every(h=>near(h.amt,10)&&h.e===T),hb.map(h=>h.amt).join(','));
    ok('M2: the runes and their shards are gone afterwards',added.filter(o=>o.userData&&o.userData.sm).every(o=>!inScene(o)));}
  {const B=base(),T=foe(...B.at(0,0));wrapHurt();try{cast(T,2);run(1.15);T.dead=true;run(1);}finally{hurt=H0;setL(0);}
    ok('M2: a rune whose foe died fires nothing',ev('rune').length===1&&!ev('bolt').length&&!log.some(h=>h.smx));}
  /* ---- M3 Wandering Souls (the bolts are logged too, as 'bolt') ---- */
  {const B=base(),T=foe(...B.at(0,0)),J=foe(...B.at(-.6,0)),K=foe(...B.at(0,.8)),far=foe(...B.ac(0,3));wrapHurt();let S=null,back=null;const wt=[];
    try{cast(T,3);for(let i=0;i<180;i++){const n=ev('wisp').length;run(.05);if(!S)S=SM.ctx.get(O.smId).slm;if(ev('wisp').length>n)wt.push(+clock.toFixed(2));if(near(clock,2.85,.01)&&S.wisps)back=S.wisps[0].mode;}}finally{hurt=H0;setL(0);}
    const w=ev('wisp'),hw=log.filter(h=>h.smx);
    ok('M3: two spectral flames; each darts out every 2s, the first at 1.9s, the second 1s after, 5 strikes in the lantern\'s life',!!S&&S.wisps&&S.wisps.length===2&&w.length===5&&near(wt[0],1.95,.06)&&near(wt[1],2.95,.06)&&near(wt[2],3.95,.06)&&w.filter(q=>q.i===0).length===3,wt.join(','));
    ok('M3: each strike is 10% of the power (as each bolt), and nothing hits the foe out of reach',hw.length===w.length+ev('bolt').length&&hw.every(h=>near(h.amt,10))&&!log.some(h=>h.e===far),hw.length);
    ok('M3: a flame never strikes the same foe as the strike before it',w.every((q,i)=>!i||q.e!==w[i-1].e),w.map(q=>[T,J,K].indexOf(q.e)).join(','));
    ok('M3: and goes back to its orbit',back==='orbit',back);}
  /* ---- M4 Soul Harvest ---- */
  {const B=base(),T=foe(...B.at(0,0)),A=foe(...B.at(.3,.3)),C=foe(...B.at(.3,-.3)),D=foe(...B.at(-.2,.4)),E=foe(...B.at(-.2,-.4));const added=watch();wrapHurt();let S=null,face=false;
    try{cast(T,4);run(.2);S=SM.ctx.get(O.smId).slm;
      /* A..E are hit by the lantern (its own o), then slain by something else: their souls go to the pool, three are kept */
      for(const e of[A,C,D,E])hurt(e,1,'magic',O);run(.1);for(const e of[A,C,D,E])H0(e,1e10,'magic',{src:heroU});
      for(let i=0;i<30;i++){run(.05);if(!face)scene.traverse(o=>{if(o.isSprite&&o.material&&o.material.map===SLMT.face)face=true;});}
      ok('M4: a foe the lantern hit sends its soul to the pool when it dies; a ghostly face rises there',ev('soul').length===4&&ev('store').length===4&&face,ev('soul').length+' '+ev('store').length+' '+face);
      ok('M4: at most 3 are stored',S.souls===3,S.souls);
      run(1);const b=ev('beam'),hb=log.filter(h=>h.e===T&&!h.smx);
      ok('M4: the next beam is 25% stronger a soul (x1.75 with 3, on top of the Brighter Wick x1.0375) and spends them',b.length>=2&&b[1].used===3&&near(hb[1].amt,50*1.0375*1.75)&&S.souls===0,b.map(q=>q.used).join(',')+' '+hb.map(h=>h.amt.toFixed(2)).join(','));
      run(1.2);ok('M4: the beam after it has only the Brighter Wick charge again (53.75)',near(log.filter(h=>h.e===T&&!h.smx)[2].amt,53.75));
      run(6);ok('M4: the souls, their ribbons and the faces are gone afterwards',added.every(o=>!inScene(o)),added.filter(o=>inScene(o)).length);}
    finally{hurt=H0;scene.add=S0;setL(0);}}
  {const B=base(),T=foe(...B.at(0,0),'soldier',40),U=foe(...B.at(-.6,0));wrapHurt();let S=null;try{cast(T,4);run(.2);S=SM.ctx.get(O.smId).slm;run(1.2);}finally{hurt=H0;setL(0);}
    ok('M4: a foe the beam itself kills gives its soul too',T.dead&&ev('soul').length===1&&ev('soul')[0].e===T);}
  {const B=base(),T=foe(...B.at(0,0)),A=foe(...B.at(.3,.3));wrapHurt();try{cast(T,4);run(.2);hurt(A,1,'magic',O);run(6.6);H0(A,1e10,'magic',{src:heroU});run(1);}finally{hurt=H0;setL(0);}
    ok('M4: a foe dying after the lantern has gone out gives nothing',!ev('soul').length);}
  {const B=base(),T=foe(...B.at(0,0)),A=foe(...B.at(.3,.3));wrapHurt();try{cast(T,4);run(.2);H0(A,1e10,'magic',{src:heroU});run(1.5);}finally{hurt=H0;setL(0);}
    ok('M4: nor does a foe it never hit',!ev('soul').length);}
  /* ---- M5 Lantern of the Dead ---- */
  {const B=base(),T=foe(...B.at(0,0)),A=foe(...B.ac(0,1)),Bf=foe(...B.ac(0,-2.4)),F=foe(...B.ac(1.2,.4),'raven'),Ou=foe(...B.ac(0,3.1));const added=watch();wrapHurt();const T0={};let slowOk=false,S=null;
    try{cast(T,5);run(.2);S=SM.ctx.get(O.smId).slm;for(let i=0;i<240;i++){run(.05);for(const n of['rift','surge','implode','spark'])if(T0[n]==null&&ev(n).length)T0[n]=+clock.toFixed(2);if(T0.surge!=null&&!slowOk&&clock>T0.surge+.6)slowOk=A.slow>=.4&&A.slowT>.8&&Bf.slow>=.4;}}
    finally{hurt=H0;scene.add=S0;setL(0);}
    const r=e=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,10)&&h.t>6.5).length;
    ok('M5: when its 6.5s are up a rift opens, the ghost fire surges, then it implodes into a spark',near(T0.rift,6.55,.06)&&near(T0.surge,6.5+SLM.surgeT,.08)&&near(T0.implode,6.5+SLM.impT,.08)&&near(T0.spark,6.5+SLM.sparkT,.08),JSON.stringify(T0));
    ok('M5: every foe within 2.6 is hit once for 10% of the power (flyers too), a foe outside is not',r(A)===1&&r(Bf)===1&&r(F)===1&&r(T)===1&&r(Ou)===0,[r(A),r(Bf),r(F),r(T),r(Ou)].join(','));
    ok('M5: and slowed 40% for 1.5s',slowOk);
    ok('M5: the lantern stays for its rift and then everything is gone, its light handed back',added.every(o=>!inScene(o))&&!SLML.on,added.filter(o=>inScene(o)).length+' '+SLML.on);}
  /* ---- other casters, the real cast path ---- */
  {const B=base(),T=foe(...B.at(0,0));wrapHurt();try{setL(5);castLantern(heroU,T,100,{src:heroU,el:'dark'});castLantern(heroU,T,100,smO({src:heroU,el:'dark',smId:1}));run(8);}finally{hurt=H0;setL(0);}
    ok('casts that are not the hero\'s own mastered scroll stay the old lantern',!SLM.dbg.length&&log.filter(h=>h.e===T).every(h=>near(h.amt,50)),SLM.dbg.length);}
  {const e0=errs;for(let L=1;L<=5;L++){const B=base(),T=foe(...B.at(0,0));for(let i=0;i<6;i++)foe(...B.at((i-3)*.35,(i%2?.25:-.25)),i===5?'raven':'knight',i===2?60:0);cast(T,L);run(10);}setL(0);
    ok('the real cast path at every mastery runs without errors',errs===e0,errs-e0);}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{if(AU)AU.boom=B0;window.setTimeout=ST0;console.error=ce;hurt=H0;scene.add=S0;SLM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
