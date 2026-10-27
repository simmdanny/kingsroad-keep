(function(){
/* Ball Lightning's masteries as Simon designed them (v404). Run on the dev page: __kk.ev(await (await fetch('/tests/blm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand where they are put (only the effects are stepped, updFx, with the game clock moved along), and
   hurt is wrapped to log the amount and the time of each hit, so the numbers are checked exactly. BLM.last is the ball's mastery state (B),
   so the tests can see where the ball is. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();STORM.left=0;CLOUD.left=0;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;for(const e of enemies){if(e.stunT>0)e.stunT=Math.max(0,e.stunT-.05);if(e.zapT>0)e.zapT=Math.max(0,e.zapT-.05);}}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.balllightning=SM_XP[L-1];else delete meta.smast.balllightning;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=4;d<R.len-4;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,type,boss)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=1;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;if(boss)e.boss=true;return e;};
/* a foe put dx, dz off a point (it stands there: nothing moves it) */
const at=(p,dx,dz,type)=>{const e=foe(5,0,type);e.x=p.x+dx;e.z=p.z+dz;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('balllightning',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'lightning',anc:false,spell:'balllightning'});return time;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,t0,t1)=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,amt)&&(t0==null||(h.t>=t0&&h.t<=t1)));
const ev=(k,e)=>BLM.dbg.filter(x=>x.ev===k&&(e===undefined||x.e===e));
const ball=()=>BLM.last.root.position.clone();
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card and the texts ---- */
  ok('the five masteries carry Simon\'s names',SM_D.balllightning.map(x=>x.n).join('|')==='Thunderstrike|Static Wake|Storm Satellites|Rolling Thunder|Tempest Incarnate',SM_D.balllightning.map(x=>x.n).join('|'));
  ok('and his numbers: 60%; three, 2s and 45%; 45%; 0.8s and 50%; 6, 100% and 40%',/60%/.test(smDesc('balllightning',0))&&/three/.test(smDesc('balllightning',1))&&/2s/.test(smDesc('balllightning',1))&&/45%/.test(smDesc('balllightning',1))&&/45%/.test(smDesc('balllightning',2))
    &&/0\.8s/.test(smDesc('balllightning',3))&&/50%/.test(smDesc('balllightning',3))&&/6 foes/.test(smDesc('balllightning',4))&&/100%/.test(smDesc('balllightning',4))&&/40%/.test(smDesc('balllightning',4))
    &&BLM.land===.6&&BLM.wake===.45&&BLM.wakeT===2&&BLM.wakeAt.length===3&&BLM.sat===.45&&BLM.satEvery===1&&BLM.ring===.5&&BLM.ringCharge===.8&&BLM.tmp===1&&BLM.tmpX===.4&&BLM.tmpN===6);
  ok('the old masteries are gone, every factor at least 1, his numbers kept',!SMF.balllightning.cast&&!SMF.balllightning.hit&&SMA.balllightning.every(x=>x===1)&&SMG.balllightning.every(x=>x>=1)&&SM.free&&!!SM.free.balllightning);
  ok('the stats line and the Supercell text say what v389 made it (nearest foe, every 0.5s, 35%; every 0.4s, 20% harder)',/0\.5s/.test(SPELL_FX.balllightning)&&/35%/.test(SPELL_FX.balllightning)&&!/40%/.test(SPELL_FX.balllightning)&&/20% harder/.test(COMBO_BY.supercell.d)&&!/twice/.test(COMBO_BY.supercell.d));
  /* ---- Mastery 0 ---- */
  {play();BLM.dbg=[];BLM.last=null;log=[];const T=foe(spotD());wrapHurt();try{cast(T,0);run(6);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the old ball (35% zaps, no hooks) and none of the masteries',!BLM.last&&!BLM.dbg.length&&!log.some(h=>h.smx)&&log.filter(h=>h.e===T).length>=3&&log.filter(h=>h.e===T).every(h=>near(h.amt,35)),log.filter(h=>h.e===T).map(h=>h.amt).join(','));}
  /* ---- M1 Thunderstrike ---- */
  {play();BLM.dbg=[];log=[];const added=track(),d0=spotD(),T=foe(d0),A=foe(d0+1.6),F=foe(d0+1.6+2.5),Fl=foe(d0+2.1,0,'raven');wrapHurt();try{cast(T,1);run(.6);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M1: the ball lands 1.6 ahead of its foe and bursts: 60% once to the foes nearby, its own foe and a flyer too',ev('land').length===1&&[A,T,Fl].every(e=>hits(e,60).length===1),[A,T,Fl].map(e=>hits(e,60).length));
    ok('M1: nothing to a foe 2.5 tiles from where it lands',!hits(F,60).length);}
  /* ---- M2 Static Wake ---- */
  {play();BLM.dbg=[];log=[];const added=track(),T=foe(spotD());let W;wrapHurt();
    try{cast(T,2);T.x+=40;/* out of the ball's way, so only W comes near a patch */run(1.25);const p=ev('patch')[0];W=at({x:p.x,z:p.z},0,0);run(.3);var w1=hits(W,45).length;run(4.5);/* the last patch is left at 3.15s and lasts 2.6s */}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M2: three charged patches are left on the trail, 1s apart',ev('patch').length===3,ev('patch').length);
    ok('M2: a foe that comes near one sets it off: 45%, once; the patches nobody came to fizzle out',w1===1&&hits(W,45).length===1&&ev('discharge').length===1,w1+' '+hits(W,45).length+' '+ev('discharge').length);
    ok('M2: the patches crackle out and leave nothing behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 Storm Satellites ---- */
  {play();BLM.dbg=[];log=[];const added=track(),T=foe(spotD());let A,B2,F;wrapHurt();
    try{cast(T,3);run(.8);const c=ball();A=at(c,.9,0);B2=at(c,-.9,0);F=at(c,0,3.2);run(2.3);}finally{hurt=H0;scene.add=S0;setL(0);}
    const d=ev('dart'),tg=d.map(x=>x.e);
    ok('M3: three orbs circle the ball and every second one darts at a foe nearby and bursts on it: 45%',ev('sats').length===1&&d.length>=2&&ev('sat').length===d.length&&tg.every(e=>e===A||e===B2||e===T)&&!hits(F,45).length,d.length+' darts');
    ok('M3: it goes after a foe it has not just hit',d.length>=2&&tg[0]!==tg[1],tg.map(e=>e===A?'A':e===B2?'B':'T').join(''));}
  /* ---- M4 Rolling Thunder ---- */
  {play();BLM.dbg=[];log=[];const added=track(),T=foe(spotD());let N,F,p1,p2,p3;wrapHurt();
    try{const t0=cast(T,4);run(.35+BLM.ringAt+.1);p1=ball();N=at(p1,1.5,0);F=at(p1,0,3.1);run(.5);p2=ball();run(1.6);p3=ball();run(2);}finally{hurt=H0;scene.add=S0;setL(0);}
    const flat=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
    ok('M4: halfway through it stops and gathers its charge',ev('charge').length===1&&flat(p1,p2)<.12,flat(p1,p2).toFixed(3));
    ok('M4: three rings burst out: 50% each to a foe 1.5 away, none to one 3.1 away',ev('ring').length===3&&hits(N,50).length===3&&!hits(F,50).length,hits(N,50).length+' '+hits(F,50).length);
    ok('M4: then it rolls on',flat(p2,p3)>.3,flat(p2,p3).toFixed(2));
    ok('M4: the rings fade and nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Tempest Incarnate ---- */
  {play();BLM.dbg=[];log=[];const added=track(),T=foe(spotD());const ring=[];let Far7,Out,c;wrapHurt();
    try{cast(T,5);run(.35+BLM.tmpAt-.3);c=ball();for(let i=0;i<5;i++){const a=i/5*6.28;ring.push(at(c,Math.cos(a)*(.5+i*.25),Math.sin(a)*(.5+i*.25)));}Far7=at(c,2.3,.3);Out=at(c,-3.2,0);
      run(.5);ring[0].zapT=10;ring[1].zapT=10;run(4);/* the last scars glow for 2.6s */}finally{hurt=H0;scene.add=S0;setL(0);}
    const cas=ev('cascade')[0]||{n:0},bolts=ev('bolt').map(x=>x.e),b2=ev('bolt2').map(x=>x.e);
    ok('M5: it trembles, breaks into a little storm and strikes the 6 nearest foes for 100% each',ev('tempest').length===1&&cas.n===6&&bolts.length===6&&ring.every(e=>bolts.includes(e))&&bolts.every(e=>hits(e,100).length===1),bolts.length+' '+ring.map(e=>hits(e,100).length));
    ok('M5: a 7th foe and one farther out are not struck',!bolts.includes(Far7)&&!bolts.includes(Out)&&!hits(Out,100).length,bolts.includes(Far7)+' '+bolts.includes(Out));
    ok('M5: the ones already Charged take a second bolt for 40%',b2.includes(ring[0])&&b2.includes(ring[1])&&b2.every(e=>bolts.includes(e)&&hits(e,40).length===1),b2.length);
    ok('M5: then it collapses in a flash, the ball is gone (no old pop) and nothing is left behind, the light handed back',ev('collapse').length===1&&BLM.last.gone&&smLeft(added)===0&&FXL.intensity<=.001,smLeft(added)+' '+FXL.intensity.toFixed(2));}
  /* ---- other casters, the real cast path ---- */
  {play();BLM.dbg=[];BLM.last=null;log=[];const T=foe(spotD());wrapHurt();try{setL(5);castBallLightning(heroU,T,100,{src:heroU,el:'lightning'});castBallLightning(heroU,T,100,smO({src:heroU,el:'lightning',smId:1}));run(6);}finally{hurt=H0;setL(0);}
    ok('casts that are not the hero\'s own mastered scroll stay the old Ball Lightning (35% zaps only)',!BLM.last&&!BLM.dbg.length&&log.filter(h=>h.e===T).every(h=>near(h.amt,35)),BLM.dbg.length);}
  {const e0=errs,added=track();try{for(let L=1;L<=5;L++){play();const d0=spotD(),T=foe(d0);for(let i=0;i<8;i++)foe(d0+(i-3)*.45,(i%2?.2:-.2),i===7?'raven':i===6?'knight':'soldier');cast(T,L);run(9);}}finally{scene.add=S0;setL(0);}
    ok('the real cast path at every mastery runs without errors, leaves nothing behind and hands the light back',errs===e0&&smLeft(added)===0&&FXL.intensity<=.001,(errs-e0)+' '+smLeft(added));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;BLM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
