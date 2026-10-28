(function(){
/* Entangling Roots' masteries as Simon designed them (v416). Run on the dev page: __kk.ev(await (await fetch('/tests/rtm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still on the first road near the hero, set apart along it and to its sides (only the effects
   are stepped, updFx, with the game clock moved along); hurt is wrapped to log the amount each hit is called with (the cast's power is 100:
   the roots deal 170 to each prisoner). Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  RT=ROUTES[0];D0=RT.len*.45;{const p=posAt(D0,RT);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}meta.spells.roots=meta.spells.roots||{lvl:1,hero:null};darkTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.roots=SM_XP[L-1];else delete meta.smast.roots;};
const foe=(dd,off,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0+dd;e.off=off||0;moveEnemy(e,0);e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* five prisoners spread out round the middle */
const five=()=>[[0,0],[.9,.5],[-.8,-.5],[1.7,-.4],[-1.6,.4]].map(([d,o])=>foe(d,o));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,list)=>{setL(L);castScrollNow('roots',heroU,tStats(heroU),list||enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'nature',anc:false,spell:'roots'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const sm=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const old=e=>log.filter(h=>h.e===e&&!h.smx);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>RTM.dbg.filter(x=>x.ev===k);
const go=(L,list,sec)=>{const added=track();wrapHurt();try{cast(L,list);run(sec||5.5);}finally{hurt=H0;scene.add=S0;setL(0);}return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.roots.map(x=>x.n).join('|')==='Thornbound|Root Network|Verdant Reclamation|Earth\'s Reprisal|Heart of the Wildwood',SM_D.roots.map(x=>x.n).join('|'));
  ok('and his numbers: 100%/150%, 55%, 35%, 130%/40%, 180%/100%',/100%/.test(smDesc('roots',0))&&/150%/.test(smDesc('roots',0))&&/55%/.test(smDesc('roots',1))&&/35%/.test(smDesc('roots',2))&&/130%/.test(smDesc('roots',3))&&/40%/.test(smDesc('roots',3))&&
    /180%/.test(smDesc('roots',4))&&/100%/.test(smDesc('roots',4))&&RTM.tb===1&&RTM.tbO===1.5&&RTM.nw===.55&&RTM.nwP[1]-RTM.nwP[0]===.7&&RTM.nwO===.5&&RTM.vr===.35&&RTM.vrS===.25&&RTM.vrL===3&&
    RTM.er===1.3&&RTM.erW===.4&&RTM.hw===1.8&&RTM.hwO===1&&RTM.hwR===1.5&&RTM.hwOv===3);
  ok('the old masteries are gone, the factors are 1, Simon\'s numbers are kept (SM.free)',!SMF.roots.cast&&!SMF.roots.hit&&SMA.roots.every(x=>x===1)&&SMG.roots.every(x=>x===1)&&SM.free&&!!SM.free.roots);
  ok('no mastery name is also a scroll\'s name',!SM_D.roots.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 ---- */
  {play();RTM.dbg=[];log=[];const F=five();go(0);
    ok('Mastery 0: the old roots (170 to each of five) and none of the masteries',F.every(e=>old(e).length===1&&near(old(e)[0].amt,170))&&!log.some(h=>h.smx)&&!RTM.dbg.length,log.length+' '+RTM.dbg.length);}
  /* ---- M1 Thornbound ---- */
  {play();RTM.dbg=[];log=[];const F=five();ovgApply(F[1],9);const added=go(1);const th=ev('thorn');
    ok('M1: the roots still deal 170 and hold',F.every(e=>old(e).some(h=>near(h.amt,170))));
    ok('M1: the thorns stab as the roots let go (1.4s): 100% to each prisoner',th.length===5&&th.every(x=>near(x.time-ev('cast')[0].time,RTM.tbT+.08,.06))&&[0,2,3,4].every(i=>sm(F[i],100).length===1&&sm(F[i]).length===1),th.length);
    ok('M1: 150% instead to a foe Overgrown before the cast',sm(F[1],150).length===1&&sm(F[1]).length===1,sm(F[1]).map(h=>h.amt).join(','));
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Root Network ---- */
  {play();RTM.dbg=[];log=[];const F=five();let ov=0;const added=track();wrapHurt();try{cast(2);run(1);F.forEach(e=>e.ovgT=0);run(.9);ov=Math.min(...F.map(e=>e.ovgT));run(3.6);}finally{hurt=H0;scene.add=S0;setL(0);}
    const st=ev('struggle');
    ok('M2: roots join the five (four links) and one prisoner struggles twice, 0.7s apart',ev('net')[0]&&ev('net')[0].edges===4&&st.length===2&&near(st[1].time-st[0].time,.7,.06),(ev('net')[0]||{}).edges+' '+st.length);
    ok('M2: each pulse deals 55% to every prisoner, twice in all',F.every(e=>sm(e,55).length===2&&sm(e).length===3),F.map(e=>sm(e).map(h=>h.amt.toFixed(1)+'@'+(h.t-log[0].t).toFixed(2)).join('/')).join(' ; '));
    ok('M2: the light reaches the struggling one first, the far ones later',(()=>{const p0=ev('pulse').filter(x=>x.pi===0);return p0[0].e===st[0].e&&p0.every(x=>x.time>=p0[0].time-1e-9);})());
    ok('M2: the pulses keep them Overgrown (0.5s) but add no hold',near(ov,.5)&&ev('pulse').length===10,ov.toFixed(2));
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();RTM.dbg=[];log=[];const e=foe(0,0);go(2);
    ok('M2: a lone prisoner has no network',!ev('net').length&&!sm(e,55).length,sm(e).map(h=>h.amt).join(',')+' '+ev('net').length);}
  /* ---- M3 Verdant Reclamation ---- */
  {play();RTM.dbg=[];log=[];const A=foe(0,0),B=foe(.3,0),C=foe(1.8,0),Fl=foe(-.1,.1,'raven'),Out=foe(.75,.6);const added=go(3,[A,B,C],6);
    const ticks=e=>log.filter(h=>h.e===e&&h.dot&&near(h.amt,17.5)).length;
    ok('M3: the patches bloom as the roots let go (1.6s), one under each prisoner',ev('patch0')[0]&&ev('patch0')[0].n===3&&near(ev('patch0')[0].time-ev('cast')[0].time,RTM.vrAt,.06));
    ok('M3: 35% a second (17.5 every 0.5s) for 3s to the ground foes on them',ticks(C)===6,ticks(C));
    ok('M3: overlapping patches do not stack',ticks(A)===6&&ticks(B)===6,ticks(A)+' '+ticks(B));
    ok('M3: flyers and foes off the patches are spared',ticks(Fl)===0&&ticks(Out)===0);
    ok('M3: those on them are slowed 25%',C.slow>=.25);
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Earth's Reprisal ---- */
  {play();RTM.dbg=[];log=[];const A=foe(0,0),B=foe(1.4,0),Bo=foe(-1.4,0);Bo.boss=true;const N=foe(.6,.3),Fl=foe(-.5,.2,'raven'),Far=foe(.2,1.4);const added=go(4,[A,B,Bo],5.5);
    ok('M4: a great root bursts under each prisoner at 1.45s: 130%',[A,B,Bo].every(e=>sm(e,130).length===1)&&ev('reprisal').every(x=>near(x.time-ev('cast')[0].time,RTM.erAt,.06)));
    ok('M4: the others are thrown up, a boss is not',ev('lift').length===2&&ev('lift').some(x=>x.e===A)&&ev('lift').some(x=>x.e===B)&&!ev('lift').some(x=>x.e===Bo)&&A.liftD===.9,ev('lift').length);
    ok('M4: the earth wave deals 40% to ground foes within 0.9 of a prisoner (not flyers, not the prisoners)',sm(N,40).length>=1&&!sm(Fl).length&&!sm(Far).length&&[A,B,Bo].every(e=>!sm(e,40).length),[sm(N,40).length,sm(Fl).length,sm(Far).length].join(','));
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Heart of the Wildwood ---- */
  {play();RTM.dbg=[];log=[];const F=five(),O=foe(2.6,.3),Fl=foe(.4,-.6,'raven'),Far=foe(4,0);let oF=0,oO=0;const added=track();wrapHurt();
    try{cast(5,F.slice());run(1.25);oF=F[2].ovgT;oO=O.ovgT;run(4.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M5: the rune wakes at 0.35s and the roots erupt at 1.15s',!!ev('rune')[0]&&ev('erupt')[0]&&near(ev('erupt')[0].time-ev('cast')[0].time,RTM.hwAt,.08));
    ok('M5: 180% more to each prisoner',F.every(e=>sm(e,180).length===1),F.map(e=>sm(e,180).length).join(','));
    ok('M5: 100% to other foes within 1.5 of a prisoner, flyers too, none further',sm(O,100).length===1&&sm(Fl,100).length===1&&!log.some(h=>h.e===Far),[sm(O,100).length,sm(Fl,100).length,log.filter(h=>h.e===Far).length].join(','));
    ok('M5: everything it hits gets 3s more Overgrown',oO>2.9&&oF>3.5,oO.toFixed(2)+' '+oF.toFixed(2));
    ok('M5: Masteries 1-4 ride it',ev('thorn').length===5&&ev('struggle').length===2&&!!ev('patch0')[0]&&ev('reprisal').length===5);
    ok('M5: everything is gone afterwards',smLeft(added)===0,smLeft(added));}
  /* ---- other casters ---- */
  {play();RTM.dbg=[];log=[];setL(5);const F=five();wrapHurt();try{castRoots(heroU,enemies.slice(),100,{src:heroU,el:'nature'});run(3);castRoots(heroU,enemies.slice(),100,{src:heroU,el:'nature',spell:'roots',smx:1,smId:1});run(3);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old roots',log.length===10&&log.every(h=>near(h.amt,170))&&!RTM.dbg.length,log.map(h=>h.amt).join(','));}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();RTM.dbg=[];setL(L);five();heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'roots',s,enemies.filter(e=>!e.dead));run(6);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&!!ev('thorn')[0]&&(L<3||!!ev('patch0')[0])&&(L<5||!!ev('erupt')[0]),thrown+' '+['cast','thorn','patch0','erupt'].map(k=>ev(k).length).join(','));}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;RTM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
