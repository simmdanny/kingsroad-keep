(function(){
/* Ice Tomb's masteries as Simon designed them (v413). Run on the dev page: __kk.ev(await (await fetch('/tests/itm-test.js')).text())
   returns [name, ok, detail] rows. The prisoner (the foe with the most health) stands on the first road near the hero and the other foes
   are set down at chosen distances from it (only the effects are stepped, updFx, with the game clock moved along); hurt is wrapped to log
   the amount each hit is called with (the cast's power is 100: the old tomb deals 400 to the prisoner and 150 to the foes within 1.2).
   The fissures branch at random, so their rows check the rules on what the log shows. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;NTOMB.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  RT=ROUTES[0];D0=RT.len*.45;{const p=posAt(D0,RT);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}meta.spells.icetomb=meta.spells.icetomb||{lvl:1,hero:null};darkTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.icetomb=SM_XP[L-1];else delete meta.smast.icetomb;};
const foe=(type,hp)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0;e.off=0;moveEnemy(e,0);e.spd=1;e.maxHp=hp||1e9;e.hp=e.maxHp;e.armor=0;e.res={};e.shield=0;return e;};
/* the prisoner, and foes set down at distance d from it (angle a) */
let PR=null;const prisoner=boss=>{PR=foe('soldier',2e9);if(boss)PR.boss=true;return PR;};
const at=(d,a,type)=>{const e=foe(type);e.x=PR.x+Math.cos(a||0)*d;e.z=PR.z+Math.sin(a||0)*d;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=L=>{setL(L);castScrollNow('icetomb',heroU,tStats(heroU),enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'ice',anc:false,spell:'icetomb'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const sm=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const old=e=>log.filter(h=>h.e===e&&!h.smx);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>ITM.dbg.filter(x=>x.ev===k);
const go=(L,sec)=>{const added=track();wrapHurt();try{cast(L);run(sec||4.5);}finally{hurt=H0;scene.add=S0;setL(0);}return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.icetomb.map(x=>x.n).join('|')==='Glacial Overgrowth|Heart of Winter|Shatterstorm|Permafrost Rupture|Absolute Cataclysm',SM_D.icetomb.map(x=>x.n).join('|'));
  ok('and his numbers: 75%, 20% to 120%, 90%, 100%, 200% / 225% / 30%',/75%/.test(smDesc('icetomb',0))&&/20%/.test(smDesc('icetomb',1))&&/120%/.test(smDesc('icetomb',1))&&/90%/.test(smDesc('icetomb',2))&&/100%/.test(smDesc('icetomb',3))&&
    /200%/.test(smDesc('icetomb',4))&&/225%/.test(smDesc('icetomb',4))&&/30%/.test(smDesc('icetomb',4))&&ITM.og===.75&&ITM.ogR===1.5&&ITM.hw===.2&&ITM.hwT===.25&&ITM.hwMax===1.2&&ITM.ss===.9&&ITM.ssR===1.8&&
    ITM.pf===1&&ITM.pfR===2&&ITM.pfSlow===.45&&ITM.ac===2&&ITM.acS===2.25&&ITM.acR===1.6&&ITM.acF===.3&&ITM.acFT===2);
  ok('the old masteries are gone, the factors are 1, Simon\'s numbers are kept (SM.free)',!SMF.icetomb.cast&&!SMF.icetomb.hit&&SMA.icetomb.every(x=>x===1)&&SMG.icetomb.every(x=>x===1)&&SM.free&&!!SM.free.icetomb);
  ok('no mastery name is also a scroll\'s name',!SM_D.icetomb.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 ---- */
  {play();ITM.dbg=[];log=[];prisoner();const A=at(1),B=at(1.4,2);go(0);
    ok('Mastery 0: the old tomb (400 to the prisoner, 150 within 1.2) and none of the masteries',old(PR).some(h=>near(h.amt,400))&&old(A).some(h=>near(h.amt,150))&&!log.some(h=>h.e===B)&&!log.some(h=>h.smx)&&!ITM.dbg.length,log.length+' '+ITM.dbg.length);}
  /* ---- M1 Glacial Overgrowth ---- */
  {play();ITM.dbg=[];log=[];prisoner();const A=at(1),B=at(1.4,2),C=at(1.6,4);let rs=0;const added=track();wrapHurt();
    try{cast(1);const root=NTOMB.length&&added.find(o=>o.isGroup&&Math.hypot(o.position.x-PR.x,o.position.z-PR.z)<.01);for(let i=0;i<36;i++){run(.05);if(root)rs=Math.max(rs,root.scale.y);}run(3);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M1: the old explosion still happens',old(PR).some(h=>near(h.amt,400))&&old(A).some(h=>near(h.amt,150))&&!!ev('boom')[0]);
    ok('M1: the prisoner takes 75% more',sm(PR,75).length===1&&sm(PR).length===1,sm(PR).map(h=>h.amt).join(','));
    ok('M1: the splash reaches 1.5 (150% at 1.4, nothing more within 1.2, nothing at 1.6)',sm(B,150).length===1&&!sm(A).length&&!log.some(h=>h.e===C),[sm(B).length,sm(A).length,log.filter(h=>h.e===C).length].join(','));
    ok('M1: the tomb grows taller',rs>1.25,rs.toFixed(2));
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Heart of Winter ---- */
  {play();ITM.dbg=[];log=[];prisoner();const added=go(2);const n=ev('heart').map(x=>x.n);
    ok('M2: the heart beats every 0.25s held, six times at most',n.join(',')==='1,2,3,4,5,6'&&ev('heart').every((x,i)=>near(x.time-ev('cast')[0].time,(i+1)*.25,.25)),n.join(','));
    ok('M2: the prisoner takes 75% + 120% (the full hold)',sm(PR,195).length===1&&sm(PR).length===1,sm(PR).map(h=>h.amt).join(','));
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();ITM.dbg=[];log=[];prisoner(true);go(2);const c=ev('cast')[0];
    ok('M2: a boss is held 1.15s and stores 80% in it',c&&near(c.hold,1.15)&&sm(PR,155).length===1,(c&&c.hold)+' '+sm(PR).map(h=>h.amt).join(','));}
  /* ---- M3 Shatterstorm ---- */
  {play();ITM.dbg=[];log=[];prisoner();const A=at(1),B=at(1.7,2),C=at(2,4),F=at(1.3,1,'raven');const added=go(3);const s0=ev('storm0')[0],s1=ev('storm')[0],b=ev('boom')[0];
    ok('M3: the fragments hang 0.2s after the explosion, then shoot out',b&&s0&&s1&&near(s0.time,b.time,.06)&&near(s1.time-s0.time,.2,.3));
    ok('M3: the ring deals 90% to the foes within 1.8 (flyers too), on top of the explosion',[PR,A,B,F].every(e=>sm(e,90).length===1)&&old(A).some(h=>near(h.amt,150))&&!log.some(h=>h.e===C),[PR,A,B,F,C].map(e=>sm(e,90).length).join(','));
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Permafrost Rupture ---- */
  {play();ITM.dbg=[];log=[];prisoner();const G=[];for(let i=0;i<10;i++)G.push(at(.5+i*.15,i*2.4));const Fl=[];for(let i=0;i<5;i++)Fl.push(at(.6+i*.2,i*1.3,'raven'));const Far=at(2.6,1);
    const added=go(4);const fh=ev('fissure').map(x=>x.e);
    ok('M4: fissures reach some of the ground foes',fh.length>0&&!!ev('fissure0')[0],fh.length+' of '+G.length);
    ok('M4: each deals 100% and slows by 45% for 2s',fh.every(e=>sm(e,100).length===1&&e.slow>=.45&&e.slowT>1.5-1e-6)&&log.filter(h=>h.smx&&near(h.amt,100)).length===fh.length,fh.map(e=>(e.slow||0).toFixed(2)).join(','));
    ok('M4: flyers and foes beyond 2 tiles are not hit by them',Fl.every(e=>e.fly&&!fh.includes(e)&&!sm(e,100).length)&&!fh.includes(Far));
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Absolute Cataclysm ---- */
  {play();ITM.dbg=[];log=[];prisoner();const A=at(1),B=at(1.5,2),C=at(1.75,4),own=NS_OWN.size;const added=go(5,5.5);const f=ev('field'),b=ev('boom')[0];
    ok('M5: the prisoner takes 75% + 120% + 200% more',sm(PR,395).length===1,sm(PR).map(h=>h.amt).join(','));
    ok('M5: the splash is 225% to 1.6 (75% more within 1.2, 225% beyond it)',sm(A,75).length===1&&sm(B,225).length===1&&!sm(C,225).length&&!sm(C,150).length,[sm(A).map(h=>h.amt),sm(B).map(h=>h.amt),sm(C).map(h=>h.amt)].join(' / '));
    const ft=log.filter(h=>h.e===B&&h.dot&&near(h.amt,7.5));
    ok('M5: the field ticks 30% a second (7.5 each 0.25s) for 2s to the foes inside 1.6, not beyond',ft.length===8&&!log.some(h=>h.e===C&&h.dot)&&f.every(x=>x.time-b.time<=2.05),ft.length+' ticks');
    ok('M5: the tomb compresses and turns white just before it bursts, then detonates',!!ev('cataclysm')[0]);
    ok('M5: Masteries 2-4 ride it',ev('heart').length===6&&!!ev('storm')[0]&&!!ev('fissure0')[0]);
    ok('M5: everything is gone afterwards',smLeft(added)===0&&NS_OWN.size===own,smLeft(added)+' '+(NS_OWN.size-own));}
  /* ---- the comet's Absolute Zero still triples it ---- */
  {play();ITM.dbg=[];log=[];prisoner();wrapHurt();try{cast(1);run(.6);const T=NTOMB[NTOMB.length-1];T.shatter(3);run(3);}finally{hurt=H0;setL(0);}
    ok('a comet-shattered tomb (x3) triples the masteries too',old(PR).some(h=>near(h.amt,1200))&&sm(PR,225).length===1,sm(PR).map(h=>h.amt).join(','));}
  /* ---- other casters ---- */
  {play();ITM.dbg=[];log=[];setL(5);prisoner();at(1.4);wrapHurt();try{castIceTomb(heroU,enemies.slice(),100,{src:heroU,el:'ice'});run(3.5);castIceTomb(heroU,enemies.filter(e=>!e.dead),100,{src:heroU,el:'ice',spell:'icetomb',smx:1,smId:1});run(3.5);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old tomb',log.length>0&&log.every(h=>near(h.amt,400)||near(h.amt,150))&&!ITM.dbg.length,log.map(h=>h.amt).join(','));}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();ITM.dbg=[];setL(L);prisoner();at(1);heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'icetomb',s,enemies.filter(e=>!e.dead));run(5.5);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&!!ev('boom')[0]&&(L<3||!!ev('storm')[0])&&(L<5||!!ev('cataclysm')[0]),thrown+' '+['cast','boom','storm','cataclysm'].map(k=>ev(k).length).join(','));}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;ITM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
