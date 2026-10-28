(function(){
/* Thunder Wyrm's masteries (v424, designed with MASTERY_DESIGN.md). Run on the dev page: __kk.ev(await (await fetch('/tests/wym-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still on the first road near the hero, set apart along it and to its sides (only the effects
   are stepped, updFx, with the game clock moved along); hurt is wrapped to log the amount each hit is called with (the cast's power is 100:
   a lash deals 120, the strike 400). Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  RT=ROUTES[0];D0=RT.len*.45;{const p=posAt(D0,RT);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}meta.spells.wyrm=meta.spells.wyrm||{lvl:1,hero:null};darkTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.wyrm=SM_XP[L-1];else delete meta.smast.wyrm;};
const foe=(dd,off,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0+dd;e.off=off||0;moveEnemy(e,0);e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* a crowd on the road ahead of the hero */
const crowd=()=>[-1.2,-.8,-.4,0,.4,.8,1.2].map((d,i)=>foe(d,(i%2?.15:-.15)));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,list)=>{setL(L);castScrollNow('wyrm',heroU,tStats(heroU),list||enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'lightning',anc:false,spell:'wyrm'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const sm=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const old=e=>log.filter(h=>h.e===e&&!h.smx);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>WYM.dbg.filter(x=>x.ev===k);
const go=(L,list,sec)=>{const added=track();wrapHurt();try{cast(L,list);run(sec||7);}finally{hurt=H0;scene.add=S0;setL(0);}return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries and their names',SM_D.wyrm.map(x=>x.n).join('|')==='Crackling Coils|Hunter’s Weave|Constrict|Grounding Strike|Thunderhead',SM_D.wyrm.map(x=>x.n).join('|'));
  ok('the numbers on the card match the code',/35%/.test(smDesc('wyrm',0))&&/50%/.test(smDesc('wyrm',2))&&/35%/.test(smDesc('wyrm',3))&&/250%/.test(smDesc('wyrm',4))&&/120%/.test(smDesc('wyrm',4))&&WYM.coil===.35&&WYM.squeeze===.5&&WYM.ground===.35&&WYM.th===2.5&&WYM.thR===1.2&&WYM.groundR===4&&WYM.coilR===.6,[0,2,3,4].map(i=>smDesc('wyrm',i)).join(' / '));
  ok('the old masteries are gone, SMA is 1 and the numbers are tuned (no SM.free)',!SMF.wyrm.cast&&!SMF.wyrm.hit&&SMA.wyrm.every(x=>x===1)&&!(SM.free&&SM.free.wyrm));
  ok('no mastery name is also a scroll\'s name',!SM_D.wyrm.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 and the 3D bursts ---- */
  {play();WYM.dbg=[];log=[];const F=crowd();let sw=0;const S0w=shockwave;shockwave=function(){sw++;return S0w.apply(this,arguments);};let added;try{added=go(0);}finally{shockwave=S0w;}
    ok('Mastery 0: the old wyrm (lashes of 120, a strike of 400) and none of the masteries',log.some(h=>near(h.amt,120))&&log.some(h=>near(h.amt,400))&&log.every(h=>!h.smx&&(near(h.amt,120)||near(h.amt,400)))&&WYM.dbg.every(x=>x.ev==='burst'),log.length);
    ok('the dive and the strike burst in 3D (wymBurst), with no flat shockwave',ev('burst').length===2&&near(ev('burst')[0].S,.55)&&near(ev('burst')[1].S,1.3)&&sw===0,ev('burst').length+' '+sw);
    ok('Mastery 0: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M1 Crackling Coils ---- */
  {play();WYM.dbg=[];log=[];const F=crowd();const added=go(1);const ca=ev('coilArc');let cd=true;const last=new Map();for(const x of ca){if(last.has(x.e)&&x.time-last.get(x.e)<WYM.coilCd-1e-6)cd=false;last.set(x.e,x.time);}
    ok('M1: the arcs between its coils leap to foes near its body: 35% each',ca.length>0&&ca.every(x=>sm(x.e,35).length>0)&&log.filter(h=>h.smx).every(h=>near(h.amt,35)),ca.length+' arcs');
    ok('M1: a foe at most every 0.4s',cd);
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Hunter's Weave: more lashes on the same crowd ---- */
  {const lashes=L=>{play();WYM.dbg=[];log=[];crowd();go(L);return log.filter(h=>!h.smx&&near(h.amt,120)).length;};let a=0,b=0;for(let i=0;i<2;i++){a+=lashes(0);b+=lashes(2);}
    ok('M2: it lingers in the pack and sways toward its prey, so it lashes more of the same crowd',b>a,a+' lashes at Mastery 0, '+b+' at Mastery 2 (2 casts each)');}
  /* ---- M3 Constrict ---- */
  {play();WYM.dbg=[];log=[];const F=crowd();F[3].maxHp=F[3].hp=2e9;let st=0;const added=track();wrapHurt();try{cast(3);for(let i=0;i<140;i++){run(.05);if(ev('coil').length&&!st)st=ev('coil')[0].e.stunT||0;}}finally{hurt=H0;scene.add=S0;setL(0);}
    const c=ev('coil'),q=ev('squeeze');
    ok('M3: once a cast it seizes a foe near its head, the toughest there',c.length===1&&c[0].e===F[3],c.length+' '+(c[0]&&c[0].e===F[3]));
    ok('M3: held (stunned) and squeezed three times for 50%',st>0&&q.length===3&&sm(c[0].e,50).length===3,st.toFixed(2)+' '+q.length);
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Grounding Strike ---- */
  {play();WYM.dbg=[];log=[];const F=crowd();const Ch=foe(0,1.9);Ch.zapT=9;const Far=foe(6,1.9);const added=go(4);
    const lashN=e=>Math.min(3,log.filter(h=>h.e===e&&!h.smx&&near(h.amt,120)).length),g=ev('grounded');
    ok('M4: the strike grounds through the foes it lashed: 35% per lash (up to 3; a foe only Charged, by its coils or anything else, once)',g.length>0&&g.filter(x=>x.e!==Ch).every(x=>x.n===(lashN(x.e)||1)&&sm(x.e,35*x.n).length===1),g.map(x=>x.n+'/'+lashN(x.e)).join(','));
    ok('M4: a foe Charged by something else counts once; foes beyond 4 tiles are spared',sm(Ch,35).length===1&&!sm(Far).length,sm(Ch).map(h=>h.amt).join(',')+' | '+sm(Far).length);
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Thunderhead ---- */
  {play();WYM.dbg=[];log=[];const F=crowd();const added=go(5);const ti=ev('thIn').map(x=>x.e),to=ev('thOut').map(x=>x.e);
    ok('M5: it rears up, winds into a crown and falls as a column',!!ev('rear5')[0]&&!!ev('thunderhead')[0]&&ev('rear5')[0].time<ev('thunderhead')[0].time);
    ok('M5: 250% more within 1.3 and 120% out to 2.2',ti.length>0&&ti.every(e=>sm(e,250).length===1)&&to.every(e=>sm(e,120).length===1)&&!F.some(e=>ti.includes(e)&&to.includes(e)),ti.length+' in, '+to.length+' out');
    ok('M5: Masteries 1-4 ride it',ev('coilArc').length>0&&ev('coil').length===1&&!!ev('ground')[0]);
    ok('M5: everything is gone afterwards',smLeft(added)===0,smLeft(added));}
  /* ---- other casters ---- */
  {play();WYM.dbg=[];log=[];setL(5);crowd();wrapHurt();try{castWyrm(heroU,enemies.slice(),100,{src:heroU,el:'lightning'});run(7);castWyrm(heroU,enemies.slice(),100,{src:heroU,el:'lightning',spell:'wyrm',smx:1,smId:1});run(7);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old wyrm',log.length>0&&log.every(h=>near(h.amt,120)||near(h.amt,400))&&WYM.dbg.every(x=>x.ev==='burst'),log.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();WYM.dbg=[];setL(L);crowd();heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'wyrm',s,enemies.filter(e=>!e.dead));run(8);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&!!ev('coilArc')[0]&&(L<3||!!ev('coil')[0])&&(L<5||!!ev('thunderhead')[0]),thrown+' '+['cast','coilArc','coil','thunderhead'].map(k=>ev(k).length).join(','));}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;WYM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
