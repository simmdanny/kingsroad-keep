(function(){
/* Piercing Verdict's masteries as Simon designed them (v409). Run on the dev page: __kk.ev(await (await fetch('/tests/pvm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand where they are put in a row from the hero (only the effects are stepped, updFx, with the game
   clock moved along), and hurt is wrapped to log the amount and the time of each hit, so the numbers are checked exactly (power 100: the
   line is 375). PVM.last is the cast's mastery state (V): the line's palm point, direction and length, so foes can be put on it, across
   it or off it. PVM.dbg logs the events with their times. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(typeof STORM!=='undefined')STORM.left=0;if(typeof CLOUD!=='undefined')CLOUD.left=0;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=(sec,dt)=>{dt=dt||.05;for(let i=0;i<Math.round(sec/dt);i++){updFx(dt);time+=dt;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.verdict=SM_XP[L-1];else delete meta.smast.verdict;};
const foe=type=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=5;moveEnemy(e,0);e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
const put=(e,x,z)=>{e.x=x;e.z=z;if(e.g){e.g.position.x=x;e.g.position.z=z;}return e;};
/* the row runs from the hero toward the road; foes at these distances from the hero */
let D,N;const dirSet=()=>{const R=ROUTES[0];let bd=1e9,p=null;for(let d=4;d<R.len-4;d+=.1){const q=posAt(d,R),h=Math.hypot(q[0]-heroU.x,q[1]-heroU.z);if(h>2.2&&h<bd){bd=h;p=q;}}
  const l=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);D={x:(p[0]-heroU.x)/l,z:(p[1]-heroU.z)/l};N={x:D.z,z:-D.x};};
const rowAt=(d,s,type)=>put(foe(type),heroU.x+D.x*d+N.x*(s||0),heroU.z+D.z*d+N.z*(s||0));
const row=(ds,type)=>ds.map(d=>rowAt(d,0,type));
/* a point on the cast's own line, d from its palm point, s to the side */
const onLine=(V,d,s)=>({x:V.cp.x+V.dir.x*d+V.dir.z*(s||0),z:V.cp.z+V.dir.z*d-V.dir.x*(s||0)});
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('verdict',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'light',anc:false,spell:'verdict'});return time;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,t0,t1)=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,amt)&&(t0==null||(h.t>=t0-1e-6&&h.t<=t1+1e-6)));
const ev=(k,e)=>PVM.dbg.filter(x=>x.ev===k&&(e===undefined||x.e===e));
const fireT=()=>{const f=ev('fire')[0];return f?f.t:NaN;};
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const rng=()=>tStats(heroU).range;
try{
  /* ---- the card and the texts ---- */
  ok('the five masteries carry Simon\'s names',SM_D.verdict.map(x=>x.n).join('|')==='Luminous Afterimage|Severance Line|Absolute Focus|Consecrated Passage|The Unerring Verdict',SM_D.verdict.map(x=>x.n).join('|'));
  ok('and his numbers: 0.6s and 20%; 2.5s and 55%; 35%; 65%; 0.45s and 100%',/0\.6s/.test(smDesc('verdict',0))&&/20%/.test(smDesc('verdict',0))&&/2\.5s/.test(smDesc('verdict',1))&&/55%/.test(smDesc('verdict',1))
    &&/35%/.test(smDesc('verdict',2))&&/65%/.test(smDesc('verdict',3))&&/0\.45s/.test(smDesc('verdict',4))&&/100%/.test(smDesc('verdict',4))
    &&PVM.m1===.2&&PVM.m1At===.6&&PVM.m2===.55&&PVM.m2T===2.5&&PVM.m3===.35&&PVM.m4===.65&&PVM.m5===1&&PVM.m5At===.45);
  ok('the old masteries are gone, every factor 1, his numbers kept',!SMF.verdict.cast&&!SMF.verdict.hit&&SMF.verdict.m===3.75&&SMA.verdict.every(x=>x===1)&&SMG.verdict.every(x=>x>=1)&&SM.free&&!!SM.free.verdict);
  /* ---- Mastery 0 ---- */
  {play();dirSet();PVM.dbg=[];PVM.last=null;log=[];const R=row([1.4,2,2.6]);wrapHurt();try{cast(R[1],0);run(2.5);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the old line (375% once to each foe on it, no hooks) and none of the masteries',!PVM.last&&!PVM.dbg.length&&!log.some(h=>h.smx)&&R.every(e=>log.filter(h=>h.e===e).length===1&&near(log.find(h=>h.e===e).amt,375)),R.map(e=>log.filter(h=>h.e===e).map(h=>h.amt)).join(' / '));}
  /* ---- M1 Luminous Afterimage ---- */
  {play();dirSet();PVM.dbg=[];log=[];const added=track(),R=row([1.4,2,2.6,3.1]),Off=rowAt(2,1.3);wrapHurt();let F;
    try{cast(R[1],1);run(.7);F=fireT();run(1.2);}finally{hurt=H0;scene.add=S0;setL(0);}
    const ts=R.map(e=>{const h=hits(e,20);return h.length===1?h[0].t-F:NaN;});
    ok('M1: a point of light hangs where the line pierced each foe',ev('stars').length===1&&ev('stars')[0].n===R.length,ev('stars').map(x=>x.n));
    ok('M1: 0.6s after the shot they flare: 20% once to each foe hit',R.every((e,i)=>hits(e,20).length===1&&ts[i]>=PVM.m1At-.051&&ts[i]<=PVM.m1At+PVM.m1Sweep+.051),ts.map(t=>t.toFixed(2)).join(','));
    ok('M1: one after another from the hero outward',ts.every((t,i)=>!i||t>=ts[i-1]-1e-6)&&ts[3]>ts[0],ts.map(t=>t.toFixed(2)).join(','));
    ok('M1: nothing to a foe the line missed, and nothing left behind',!hits(Off,20).length&&smLeft(added)===0,hits(Off,20).length+' '+smLeft(added));}
  /* ---- M2 Severance Line ---- */
  {play();dirSet();PVM.dbg=[];log=[];const added=track(),R=row([1.4,2,2.6]);let X,Fl,Late,Past,F,V;wrapHurt();
    try{cast(R[1],2);run(.7);F=fireT();V=PVM.last;const mid=V.len*.45;
      X=foe();Fl=foe('raven');Past=foe();
      /* X walks across the line, then back again; a flyer crosses further along; one crosses past the line's end */
      for(let i=0;i<=14;i++){const s=.7-i*.1;let p=onLine(V,mid,s);put(X,p.x,p.z);p=onLine(V,mid+1,-s);put(Fl,p.x,p.z);p=onLine(V,V.len+.6,s);put(Past,p.x,p.z);run(.05);}
      for(let i=0;i<=14;i++){const p=onLine(V,mid,-.7+i*.1);put(X,p.x,p.z);run(.05);}
      run(Math.max(0,PVM.m2T+.15-(time-F)));Late=foe();for(let i=0;i<=14;i++){const p=onLine(V,mid,.7-i*.1);put(Late,p.x,p.z);run(.05);}run(.6);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M2: the line leaves a scar for 2.5s',ev('scar').length===1);
    ok('M2: a foe that crosses it is pierced by a miniature verdict: 55% once, not again when it crosses back',hits(X,55).length===1&&ev('mini',X).length===1,hits(X,55).length);
    ok('M2: a flyer crossing it too',hits(Fl,55).length===1);
    ok('M2: not the foes the line itself pierced, nor one crossing past its end, nor one crossing after 2.5s',R.every(e=>!hits(e,55).length)&&!hits(Past,55).length&&!hits(Late,55).length,[R.map(e=>hits(e,55).length),hits(Past,55).length,hits(Late,55).length].join(' '));
    ok('M2: the scar fades and nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 Absolute Focus ---- */
  {play();dirSet();PVM.dbg=[];log=[];const added=track(),L0=rng()+4,R=row([1.4,2,2.6]),Far=rowAt(L0*.85);let F,V;wrapHurt();
    try{cast(R[1],3);run(.7,.02);F=fireT();V=PVM.last;run(3.2);}finally{hurt=H0;scene.add=S0;setL(0);}
    const prF=(Far.x-V.cp.x)*V.dir.x+(Far.z-V.cp.z)*V.dir.z;
    ok('M3: the circle collapses into a pinprick and the line fires as its own needle',ev('charge').length===1&&ev('pin').length===1&&V.ownBeam);
    ok('M3: foes on the narrow first half take 35% more, as the line strikes',R.every(e=>hits(e,35,F-.06,F+.06).length===1),R.map(e=>hits(e,35).length));
    ok('M3: not a foe on the far half (it still takes the line)',prF>PVM.m3Core*V.len&&!hits(Far,35).length&&log.some(h=>h.e===Far&&!h.smx&&near(h.amt,375)),prF.toFixed(2)+' / '+V.len.toFixed(2));
    ok('M3: nothing left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Consecrated Passage ---- */
  {play();dirSet();PVM.dbg=[];log=[];const added=track(),R=row([1.4,2,2.6]),K=rowAt(3.1);let F;wrapHurt();
    try{cast(R[1],4);run(.7);F=fireT();K.hp=1;H0(K,10,'magic',{});run(3.2);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M4: each foe pierced gets a seal',ev('seals').length===1&&ev('seals')[0].n===4,ev('seals').map(x=>x.n));
    ok('M4: as the line fades they ignite together: 65% once to each foe, about 0.38s after the shot',R.every(e=>hits(e,65,F+PVM.m4At-.06,F+PVM.m4At+.06).length===1)&&ev('ignite').length===1,R.map(e=>hits(e,65).map(h=>(h.t-F).toFixed(2))).join(' '));
    ok('M4: a foe that fell before then takes nothing',K.dead&&!hits(K,65).length);
    ok('M4: nothing left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 The Unerring Verdict ---- */
  {play();dirSet();PVM.dbg=[];log=[];const added=track(),R=row([1.4,2,2.6]);let F,V,New,Fl,Off;wrapHurt();
    try{cast(R[1],5);run(.7);F=fireT();V=PVM.last;
      /* the shot is fired: one foe steps off the line, one steps onto it, a flyer comes over it, one stands beside it */
      let p=onLine(V,R[0].x?((R[0].x-V.cp.x)*V.dir.x+(R[0].z-V.cp.z)*V.dir.z):1,1.4);put(R[0],p.x,p.z);
      New=foe();p=onLine(V,V.len*.7,.1);put(New,p.x,p.z);Fl=foe('raven');p=onLine(V,V.len*.5,0);put(Fl,p.x,p.z);Off=foe();p=onLine(V,V.len*.5,.9);put(Off,p.x,p.z);
      run(3.2);}finally{hurt=H0;scene.add=S0;setL(0);}
    const s2=ev('second')[0];
    ok('M5: a point stays at the palm and 0.45s after the shot a second beam fires',ev('point').length===1&&!!s2&&s2.t-F>=PVM.m5At-.051&&s2.t-F<=PVM.m5At+.051,s2?(s2.t-F).toFixed(2):'none');
    ok('M5: down the exact same line: 100% once to every foe on it now, a flyer too',[R[1],R[2],New,Fl].every(e=>hits(e,100).length===1),[R[1],R[2],New,Fl].map(e=>hits(e,100).length));
    ok('M5: it does not chase: nothing to the foe that stepped off the line, nor to one beside it',!hits(R[0],100).length&&!hits(Off,100).length);
    ok('M5: the scars glow and fade, nothing is left behind and the light is handed back',smLeft(added)===0&&FXL.intensity<=.001,smLeft(added)+' '+FXL.intensity.toFixed(2));}
  /* ---- other casters ---- */
  {play();dirSet();PVM.dbg=[];PVM.last=null;log=[];const R=row([1.4,2,2.6]);wrapHurt();
    try{meta.smast.judgment=SM_XP[4];castScrollNow('judgment',heroU,tStats(heroU),[R[1]],100,{src:heroU,bane:0,el:'light',anc:false,spell:'judgment'});run(3);
      setL(5);castJudgment(heroU,375,{src:heroU,el:'light'},rng(),false);castJudgment(heroU,375,smO({src:heroU,el:'light',smId:1}),rng(),false);run(3);}finally{hurt=H0;setL(0);delete meta.smast.judgment;}
    ok('the Judgment and Verdict casts that are not the hero\'s own mastered scroll stay the old line',!PVM.last&&!PVM.dbg.length,PVM.dbg.length);}
  {const e0=errs,added=track();try{for(let L=1;L<=5;L++){play();dirSet();const R=row([1.3,1.8,2.3,2.8]);rowAt(2,.15,'raven');rowAt(2.4,-.1,'knight');rowAt(1.6,.6);cast(R[1],L);run(3.6,L===3?.02:.05);}}finally{scene.add=S0;setL(0);}
    ok('the real cast path at every mastery runs without errors, leaves nothing behind and hands the light back',errs===e0&&smLeft(added)===0&&FXL.intensity<=.001,(errs-e0)+' '+smLeft(added));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;PVM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
