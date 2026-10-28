(function(){
/* Murder of Crows' masteries as Simon designed them (v411). Run on the dev page: __kk.ev(await (await fetch('/tests/crm-test.js')).text())
   returns [name, ok, detail] rows. The hero stands 0.7 beside the middle of the first road and foes stand on it near the hero (only the
   effects are stepped, updFx, with the game clock moved along); hurt is wrapped to log the amount each hit is called with (the cast's power
   is 100, so a peck is 8). The crows choose their foes at random, so the rows check the rules on what the log shows. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  RT=ROUTES[0];D0=RT.len*.45;{const p=posAt(D0,RT);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}meta.spells.crows=meta.spells.crows||{lvl:1,hero:null};darkTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.crows=SM_XP[L-1];else delete meta.smast.crows;};
const foe=(dd,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0+dd;e.off=0;moveEnemy(e,0);e.spd=1;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
const crowd=()=>[-1.2,-.8,-.4,0,.4,.8,1.2].map(d=>foe(d));
const hr=e=>Math.hypot(e.x-heroU.x,e.z-heroU.z);
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time});return H0.apply(this,arguments);};};
const cast=L=>{setL(L);castScrollNow('crows',heroU,tStats(heroU),enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'dark',anc:false,spell:'crows'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>CRM.dbg.filter(x=>x.ev===k);
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.crows.map(x=>x.n).join('|')==='Ravenous Beaks|Omen Circles|Unkindness|Black Gale|The Last Omen',SM_D.crows.map(x=>x.n).join('|'));
  ok('and his numbers: 8%, 35% and 20%, 8%, 40%, 8%',/8%/.test(smDesc('crows',0))&&/35%/.test(smDesc('crows',1))&&/20%/.test(smDesc('crows',1))&&/8%/.test(smDesc('crows',2))&&/40%/.test(smDesc('crows',3))&&/8%/.test(smDesc('crows',4))&&
    CRM.dbl===.08&&CRM.om===.35&&CRM.omN===.2&&CRM.un===.08&&CRM.gl===.4&&CRM.lp===.08&&CRM.every===5&&CRM.omCd===1.2);
  ok('the old masteries are gone, the factors are 1, Simon\'s numbers are kept (SM.free)',!SMF.crows.cast&&!SMF.crows.hit&&SMA.crows.every(x=>x===1)&&SMG.crows.every(x=>x===1)&&SM.free&&!!SM.free.crows);
  ok('no mastery name is also a scroll\'s name',!SM_D.crows.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 ---- */
  {play();CRM.dbg=[];log=[];const F=crowd();const own=NS_OWN.size;wrapHurt();try{cast(0);run(7.4);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the old flock (pecks of 8%) and none of the masteries',log.length>20&&log.every(h=>near(h.amt,8)&&!h.smx)&&!CRM.dbg.length&&NS_OWN.size===own,log.length+' '+CRM.dbg.length);}
  /* ---- M1 Ravenous Beaks ---- */
  {play();CRM.dbg=[];log=[];crowd();const own=NS_OWN.size;const added=track();wrapHurt();try{cast(1);run(7.4);}finally{hurt=H0;scene.add=S0;setL(0);}
    const dbl=ev('double');let bad=0;/* the double follows the flock's 5th, 10th... peck, by the same crow */{let c=0;const due=[];for(const x of CRM.dbg){if(x.ev==='peck'){c++;if(c%5===0)due.push(x.b);}}bad=dbl.filter(x=>!due.includes(x.b)).length;if(dbl.length>due.length)bad++;}
    ok('M1: every fifth peck of the flock, that crow double-pecks',dbl.length>0&&bad===0,dbl.length+' doubles, '+bad+' out of turn');
    ok('M1: the second peck deals 8% more to the same foe',dbl.every(x=>log.some(h=>h.e===x.e&&h.smx&&near(h.amt,8))));
    ok('M1: the crows and their feathers are gone afterwards',smLeft(added)===0&&NS_OWN.size===own,smLeft(added)+' '+(NS_OWN.size-own));}
  /* ---- M2 Omen Circles ---- */
  {play();CRM.dbg=[];log=[];const F=crowd(),Far=foe(7);const added=track();wrapHurt();try{cast(2);run(7.4);}finally{hurt=H0;scene.add=S0;setL(0);}
    const om=ev('omen'),bu=ev('burst');let cd=true;const last=new Map();for(const x of bu){if(last.has(x.e)&&x.time-last.get(x.e)<CRM.omCd-1e-6)cd=false;last.set(x.e,x.time);}
    ok('M2: rings form round foes three crows circle, and bursts follow',om.length>0&&om.every(x=>x.n>=3)&&bu.length>0,om.length+' rings, '+bu.length+' bursts');
    ok('M2: a burst deals 35% to its foe and 20% to the foes within 1.1',bu.every(x=>log.some(h=>h.e===x.e&&h.smx&&near(h.amt,35)))&&ev('burstN').every(x=>Math.hypot(x.e.x-x.src.x,x.e.z-x.src.z)<=CRM.omR+1e-6&&x.e!==x.src)&&ev('burstN').length>0);
    ok('M2: once per foe every 1.2s',cd);
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 Unkindness ---- */
  {play();CRM.dbg=[];log=[];crowd();const added=track();wrapHurt();try{cast(3);run(7.4);}finally{hurt=H0;scene.add=S0;setL(0);}
    const calls=ev('call'),sh=ev('syncHit'),callers=calls.map(x=>x.b),mates=new Set(calls.flatMap(x=>x.mates));const per={};for(const x of sh)per[x.b]=(per[x.b]||0)+1;
    ok('M3: crows caw and call two others, each crow at most once',calls.length>0&&calls.every(x=>x.mates.length===2&&!x.mates.includes(x.b))&&new Set(callers).size===callers.length,calls.length+' calls');
    ok('M3: only called crows strike the bonus 8%, once per call',sh.length>0&&sh.every(x=>mates.has(x.b))&&Object.keys(per).every(b=>per[b]<=calls.filter(c=>c.mates.includes(+b)).length)&&sh.every(x=>log.some(h=>h.e===x.e&&h.smx&&near(h.amt,8))),sh.length+' bonus pecks');
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Black Gale ---- */
  {play();CRM.dbg=[];log=[];const F=crowd(),Far=foe(7);const added=track();wrapHurt();try{cast(4);run(7.4);}finally{hurt=H0;scene.add=S0;setL(0);}
    const g0=ev('gale0'),gh=ev('galeHit');const inR=F.filter(e=>hr(e)<=CRM.RANGE);
    ok('M4: the flock sweeps out four times, a second apart',g0.length===4&&g0.every((x,i)=>i===0||near(x.time-g0[i-1].time,1,.08)),g0.map(x=>x.time.toFixed(2)).join(','));
    ok('M4: each sweep deals 40% once to every foe in reach, none beyond',[1,2,3,4].every(i=>inR.every(e=>gh.filter(x=>x.i===i&&x.e===e).length===1))&&!gh.some(x=>x.e===Far)&&hits(F[3],40,true).length===4,inR.length+' in reach; '+hits(F[3],40,true).length);
    ok('M4: the crows keep pecking between the sweeps',ev('peck').length>20,ev('peck').length);
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 The Last Omen ---- */
  {play();CRM.dbg=[];log=[];crowd();const own=NS_OWN.size;const added=track();wrapHurt();let dk=0;try{cast(5);run(5.5);for(let i=0;i<20;i++){run(.05);dk=Math.max(dk,darkTarget);}run(3.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    const fp=ev('fpeck'),per={};for(const x of fp)per[x.b]=(per[x.b]||0)+1;const firsts=new Map();const seen=new Set();for(const x of fp){if(seen.has(x.b))continue;seen.add(x.b);firsts.set(x.e,(firsts.get(x.e)||0)+1);}
    const want=[...firsts].filter(([e,n])=>n>=3).map(([e])=>e),sg=ev('sigil').map(x=>x.e);
    ok('M5: the flock rises at 5s and dives in waves',!!ev('rise')[0]&&near(ev('rise')[0].time-ev('cast')[0].time,5,.06)&&fp.length>20,fp.length+' final pecks');
    ok('M5: each crow pecks at most three times (8% each), then bursts into feathers',Object.values(per).every(n=>n<=3)&&Object.keys(per).filter(b=>per[b]===3).every(b=>ev('fburst').some(x=>x.b===+b))&&fp.every(x=>log.some(h=>h.e===x.e&&h.smx&&near(h.amt,8))));
    ok('M5: foes hit by three or more crows are marked by the raven sigil, the others not',want.length>0&&want.every(e=>sg.includes(e))&&sg.every(e=>want.includes(e)),want.length+' marked');
    ok('M5: Masteries 1-4 ride it',ev('double').length>0&&ev('omen').length>0&&ev('call').length>0&&ev('gale0').length===4,['double','omen','call','gale0'].map(k=>ev(k).length).join(','));
    ok('M5: the haze darkens the board a little and the light comes back; the crows and everything else are gone',dk>.05&&darkTarget===0&&smLeft(added)===0&&NS_OWN.size===own,dk.toFixed(2)+' '+smLeft(added)+' '+(NS_OWN.size-own));}
  /* ---- other casters ---- */
  {play();CRM.dbg=[];log=[];setL(5);crowd();wrapHurt();try{castCrows(heroU,enemies.slice(),100,{src:heroU,el:'dark'});castCrows(heroU,enemies.slice(),100,{src:heroU,el:'dark',spell:'crows',smx:1,smId:1});run(7.4);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old flock',log.length>20&&log.every(h=>near(h.amt,8))&&!CRM.dbg.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();CRM.dbg=[];setL(L);crowd();heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'crows',s,enemies.filter(e=>!e.dead));run(9.5);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&ev('peck').length>0&&(L<5||ev('fpeck').length>0),thrown+' '+['cast','peck','fpeck'].map(k=>ev(k).length).join(','));}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;CRM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
