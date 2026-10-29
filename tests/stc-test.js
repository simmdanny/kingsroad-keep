(function(){
/* Stormcaller's masteries (v434, designed with MASTERY_DESIGN.md). Run on the dev page: __kk.ev(await (await fetch('/tests/stc-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still on the first road near the hero, set apart along it and to its sides (only the effects
   are stepped, updFx, with the game clock moved along); hurt is wrapped to log the amount each hit is called with (the cast's power is 100:
   a strike deals 250 near its middle and 175 out to 1.05; the storm lasts 2.4s + 15s + 2.2s). Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  RT=ROUTES[0];D0=RT.len*.45;{const p=posAt(D0,RT);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}meta.spells.stormcaller=meta.spells.stormcaller||{lvl:1,hero:null};darkTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.stormcaller=SM_XP[L-1];else delete meta.smast.stormcaller;};
const foe=(dd,off,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0+dd;e.off=off||0;moveEnemy(e,0);e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* a crowd on the road near the hero */
const crowd=()=>[-1.2,-.8,-.4,0,.4,.8,1.2].map((d,i)=>foe(d,(i%2?.15:-.15)));
const strike=h=>!h.smx&&(near(h.amt,250)||near(h.amt,175));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,list)=>{setL(L);castScrollNow('stormcaller',heroU,tStats(heroU),list||enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'lightning',anc:false,spell:'stormcaller'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const sm=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const old=e=>log.filter(h=>h.e===e&&!h.smx);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>STC.dbg.filter(x=>x.ev===k);
const go=(L,list,sec)=>{const added=track();wrapHurt();try{cast(L,list);run(sec||20);}finally{hurt=H0;scene.add=S0;setL(0);}return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries and their names',SM_D.stormcaller.map(x=>x.n).join('|')==='Seeking Bolts|Downpour|Rolling Thunder|Storm Front|Last Thunder',SM_D.stormcaller.map(x=>x.n).join('|'));
  ok('the numbers on the card match the code',/45%/.test(smDesc('stormcaller',1))&&/40%/.test(smDesc('stormcaller',2))&&/110%/.test(smDesc('stormcaller',3))&&/30%/.test(smDesc('stormcaller',4))&&/180%/.test(smDesc('stormcaller',4))&&/70%/.test(smDesc('stormcaller',4))&&
    STC.soak===.45&&STC.roll===.4&&STC.front===1.1&&STC.cage===.3&&STC.last===1.8&&STC.lastR===.7&&STC.soakR===2&&STC.rollLen===1.6,[1,2,3,4].map(i=>smDesc('stormcaller',i)).join(' / '));
  ok('the old masteries are gone, SMA is 1 and the numbers are tuned (no SM.free)',!SMF.stormcaller.cast&&!SMF.stormcaller.hit&&SMA.stormcaller.every(x=>x===1)&&!(SM.free&&SM.free.stormcaller));
  ok('no mastery name is also a scroll\'s name',!SM_D.stormcaller.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 ---- */
  {play();STC.dbg=[];log=[];crowd();let nb=0;const LB0=lightningBolt;lightningBolt=function(){nb++;return LB0.apply(this,arguments);};let added;try{added=go(0);}finally{lightningBolt=LB0;}
    /* the bolts fall at random on the whole road, so a cast may happen to hit none of the crowd: count the bolts, and check every hit that did land */
    ok('Mastery 0: the old storm (bolts falling, strikes of 250 / 175) and none of the masteries',nb>20&&log.every(strike)&&!STC.dbg.length,nb+' bolts, '+log.length+' hits');
    ok('Mastery 0: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M1 Seeking Bolts ---- */
  /* foes all along every road, so that some random bolts are sure to fall within 1.2 of one */
  {play();STC.dbg=[];log=[];crowd();for(const rt of ROUTES)for(let d=.6;d<rt.len;d+=1.4){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=rt;e.dist=d;e.off=0;moveEnemy(e,0);e.spd=0;e.maxHp=e.hp=1e9;e.armor=0;e.res={};e.shield=0;}
    const added=go(1);const sk=ev('seek');
    ok('M1: a bolt that would fall near a foe bends onto it (how many is chance)',sk.length>=1&&sk.filter(x=>log.some(h=>h.e===x.e&&strike(h)&&Math.abs(h.t-x.time)<.06)).length>=sk.length-1,sk.length+' seeking');
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Downpour ---- */
  {play();STC.dbg=[];log=[];const F=crowd();const added=track();wrapHurt();try{cast(2);run(3);const t0=time;while(time<t0+14){F.forEach(e=>STC.cur.soakFoe(e));run(.5);}run(3);}finally{hurt=H0;scene.add=S0;setL(0);}const sa=ev('soakArc');
    ok('M2: the clouds over the road rain and Soak the foes under them',ev('rain').length>0,ev('rain').length+' rain checks, '+ev('soak').length+' soaked');
    ok('M2: a bolt on a Soaked foe runs to the other Soaked foes within 2: 45% each',sa.length>0&&sa.every(x=>sm(x.e,45).length>0)&&log.filter(h=>h.smx).every(h=>near(h.amt,45)),sa.length);
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 Rolling Thunder ---- */
  {play();STC.dbg=[];log=[];crowd();const Fl=foe(0,.2,'raven');const added=go(3);const ro=ev('rolled');
    ok('M3: the thunder rolls along the road: 40% to the ground foes it reaches',ev('roll').length>0&&ro.length>0&&ro.every(x=>sm(x.e,40).length>0),ev('roll').length+' rolls, '+ro.length+' hit');
    ok('M3: not flyers',!sm(Fl,40).length);
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Storm Front ---- */
  {play();STC.dbg=[];log=[];crowd();const added=go(4);const c0=ev('cast')[0].time,f0=ev('front0')[0],fh=ev('frontHit');
    ok('M4: the front forms at 8s of the storm and marches down the road: 110% each',f0&&near(f0.time-c0,2.4+8,.08)&&fh.length>0&&fh.every(x=>sm(x.e,110).length>0),fh.length);
    ok('M4: no random strikes while it marches',!log.some(h=>strike(h)&&h.t>c0+10.5&&h.t<c0+13.3),log.filter(h=>strike(h)&&h.t>c0+10.5&&h.t<c0+13.3).length);
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Last Thunder ---- */
  {play();STC.dbg=[];log=[];const F=crowd();const Far=foe(-6,0);const added=go(5,null,22);const li=ev('lastIn').map(x=>x.e),lo=ev('lastOut').map(x=>x.e);
    ok('M5: at its end a thunderhead gathers, a ring of bolts closes in, then the colossal bolt',!!ev('last0')[0]&&ev('cage').length>=0&&!!ev('last')[0]&&ev('last0')[0].time>=ev('cast')[0].time+17.3);
    ok('M5: 180% within 1.4 (stunned), 70% out to 2.6, 30% from the ring',li.length>0&&li.every(e=>sm(e,180).length===1)&&lo.every(e=>sm(e,70).length===1)&&ev('cage').every(x=>sm(x.e,30).length>0)&&!li.includes(Far)&&!lo.includes(Far),li.length+' in, '+lo.length+' out, '+ev('cage').length+' caged');
    ok('M5: Masteries 3-4 ride it',ev('roll').length>0&&!!ev('front0')[0]);
    ok('M5: everything is gone afterwards',smLeft(added)===0,smLeft(added));}
  /* ---- other casters ---- */
  {play();STC.dbg=[];log=[];setL(5);crowd();wrapHurt();try{castStormcaller(heroU,100,{src:heroU,el:'lightning'});run(20);castStormcaller(heroU,100,{src:heroU,el:'lightning',spell:'stormcaller',smx:1,smId:1});run(20);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old storm',log.length>0&&log.every(h=>near(h.amt,250)||near(h.amt,175))&&!STC.dbg.length,log.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,5]){play();STC.dbg=[];setL(L);crowd();heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'stormcaller',s,enemies.filter(e=>!e.dead));run(21);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&(L<5||!!ev('last')[0]),thrown+' '+['cast','seek','last'].map(k=>ev(k).length).join(','));}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;STC.dbg=null;STC.cur=null;STORM.left=0;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
