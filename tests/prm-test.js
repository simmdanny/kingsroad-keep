(function(){
/* Prism of Dawn's masteries (v425, designed with MASTERY_DESIGN.md). Run on the dev page: __kk.ev(await (await fetch('/tests/prm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still on the first road near the hero, set apart along it and to its sides (only the effects
   are stepped, updFx, with the game clock moved along); hurt is wrapped to log the amount each hit is called with (the cast's power is 100:
   a beam's pass deals 45, the lance 180). Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  RT=ROUTES[0];D0=RT.len*.45;{const p=posAt(D0,RT);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}meta.spells.prism=meta.spells.prism||{lvl:1,hero:null};darkTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.prism=SM_XP[L-1];else delete meta.smast.prism;};
const foe=(dd,off,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0+dd;e.off=off||0;moveEnemy(e,0);e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* a crowd on the road ahead of the hero */
const crowd=()=>[-1.2,-.8,-.4,0,.4,.8,1.2].map((d,i)=>foe(d,(i%2?.15:-.15)));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,list)=>{setL(L);castScrollNow('prism',heroU,tStats(heroU),list||enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'light',anc:false,spell:'prism'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const sm=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const old=e=>log.filter(h=>h.e===e&&!h.smx);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>PRM.dbg.filter(x=>x.ev===k);
const go=(L,list,sec)=>{const added=track();wrapHurt();try{cast(L,list);run(sec||7);}finally{hurt=H0;scene.add=S0;setL(0);}return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries and their names',SM_D.prism.map(x=>x.n).join('|')==='Spectrum|Heliotrope|Resonant Fold|Full Spectrum|Sunrise',SM_D.prism.map(x=>x.n).join('|'));
  ok('the numbers on the card match the code',/20%/.test(smDesc('prism',0))&&/120%/.test(smDesc('prism',3))&&/140%/.test(smDesc('prism',4))&&/15%/.test(smDesc('prism',4))&&PRM.burn===.2&&PRM.burnCd===1.2&&PRM.full===1.2&&PRM.sun===1.4&&PRM.sunT===.15&&/10%/.test(smDesc('prism',1))&&/40%/.test(smDesc('prism',1))&&/50%/.test(smDesc('prism',2))&&PRM.helio===.1&&PRM.helioMax===.4&&PRM.helioRamp===2&&PRM.res===.5&&PRM.resR===1,[0,1,2,3,4].map(i=>smDesc('prism',i)).join(' / '));
  ok('the old masteries are gone, SMA is 1 and the numbers are tuned (no SM.free)',!SMF.prism.cast&&!SMF.prism.hit&&SMA.prism.every(x=>x===1)&&!(SM.free&&SM.free.prism));
  ok('no mastery name is also a scroll\'s name',!SM_D.prism.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 and the 3D nova ---- */
  {play();PRM.dbg=[];log=[];crowd();let sw=0;const S0w=shockwave;shockwave=function(){sw++;return S0w.apply(this,arguments);};let added;try{added=go(0);}finally{shockwave=S0w;}
    ok('Mastery 0: the old prism (passes of 45, a lance of 180) and none of the masteries',log.some(h=>near(h.amt,45))&&log.some(h=>near(h.amt,180))&&log.every(h=>!h.smx&&(near(h.amt,45)||near(h.amt,180)))&&PRM.dbg.every(x=>x.ev==='nova'),log.length);
    ok('the lance\'s rainbow bursts in 3D (prmNova), with no flat shockwave',ev('nova').length===1&&sw===0,ev('nova').length+' '+sw);
    ok('Mastery 0: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M1 Spectrum ---- */
  {play();PRM.dbg=[];log=[];crowd();let fl=0;const F0=nsFlare;nsFlare=function(){fl++;return F0.apply(this,arguments);};let added;try{added=go(1);}finally{nsFlare=F0;}const b=ev('burn');
    ok('M1: only the warm beams (red, orange, gold) set foes alight',b.length>0&&b.every(x=>x.i<3),b.length+' burns');
    ok('M1: the cool beams flare the burn (the Flare combo)',fl>0,fl+' flares');
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Heliotrope ---- */
  {play();PRM.dbg=[];log=[];const F=crowd();F[5].maxHp=F[5].hp=2e9;const added=go(2);const lk=ev('lock'),hl=ev('helio'),c0=ev('cast')[0].time;
    ok('M2: the white sunbeam locks onto the toughest foe under the wheel',lk.length===1&&lk[0].e===F[5],lk.length+' locks');
    ok('M2: and burns it every 0.25s, hotter the longer it holds: 10% a second rising to 40%',hl.length>=10&&hl.every((x,k)=>x.e===F[5]&&(!k||x.rate>=hl[k-1].rate-1e-9))&&near(hl[0].rate,.1+.3*.125,.01)&&near(hl[hl.length-1].rate,.4)&&hl.every(x=>sm(F[5],100*x.rate*.25).length>=1),hl.length+' ticks, '+hl.map(x=>x.rate.toFixed(2)).join(','));
    ok('M2: only while the wheel turns',hl.every(x=>x.time-c0>1.05&&x.time-c0<4.45));
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();PRM.dbg=[];log=[];const F=crowd();F[5].maxHp=F[5].hp=2e9;F[2].maxHp=F[2].hp=1.5e9;const added=track();wrapHurt();
    try{cast(2);run(2.5);H0(F[5],1e12,'magic',{src:heroU});run(4.5);}finally{hurt=H0;scene.add=S0;setL(0);}const lk=ev('lock'),hl=ev('helio').filter(x=>x.e===F[2]);
    ok('M2: when its foe dies it relocks on the next toughest, starting cool again',lk.length===2&&lk[1].e===F[2]&&hl.length>0&&near(hl[0].rate,.1+.3*.125,.01),lk.map(x=>F.indexOf(x.e)).join());}
  /* ---- M3 Resonant Fold ---- */
  {play();PRM.dbg=[];log=[];const F=crowd();const added=go(3);const rg=ev('ring'),tl=ev('toll'),c0=ev('cast')[0].time,lance=ev('nova')[0];
    ok('M3: only the folding beams set foes ringing (from 4s), each foe once',rg.length>0&&rg.every(x=>x.time-c0>=3.95)&&new Set(rg.map(x=>x.e)).size===rg.length,rg.length);
    ok('M3: when the lance lands, every ringing foe tolls',lance&&tl.length===rg.filter(x=>!x.e.dead).length&&tl.every(x=>x.time>=lance.time),tl.length+' tolls');
    const hitN=new Set(tl.flatMap(x=>x.L));
    ok('M3: its power runs into the foes beside each (within 1 tile): 50% each, once a foe',hitN.size>0&&[...hitN].every(e=>sm(e,50).length===1)&&tl.every(x=>x.L.every(q=>q!==x.e&&Math.hypot(q.x-x.e.x,q.z-x.e.z)<=PRM.resR+1e-6)),hitN.size+' foes');
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();PRM.dbg=[];log=[];crowd();go(2);ok('M3 needs Mastery 3',!ev('ring').length&&!ev('toll').length);}
  /* ---- M4 Full Spectrum ---- */
  {play();PRM.dbg=[];log=[];crowd();const added=go(4);const fu=ev('full');
    ok('M4: foes swept by all six colours burst for 120%, once each',fu.length>0&&fu.every(x=>sm(x.e,120).length===1&&log.filter(h=>h.e===x.e&&!h.smx&&near(h.amt,45)).length>=6),fu.length+' bursts');
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Sunrise ---- */
  {play();PRM.dbg=[];log=[];crowd();const added=go(5,null,8);const sh=ev('sunHit').map(x=>x.e),tk=ev('sunTick');
    ok('M5: the light rises, then the pillar comes down',!!ev('sunrise0')[0]&&!!ev('sunrise')[0]&&near(ev('sunrise')[0].time-ev('sunrise0')[0].time,.35,.1));
    ok('M5: 140% more as it lands, then 15% every 0.3s inside (up to four)',sh.length>0&&sh.every(e=>sm(e,140).length===1)&&tk.length>0&&enemies.every(e=>sm(e,15).length<=4),sh.length+' hit, '+tk.length+' ticks');
    ok('M5: Masteries 1-4 ride it',ev('burn').length>0&&ev('helio').length>0&&ev('ring').length>0&&ev('full').length>0);
    ok('M5: everything is gone afterwards',smLeft(added)===0,smLeft(added));}
  /* ---- other casters ---- */
  {play();PRM.dbg=[];log=[];setL(5);crowd();wrapHurt();try{castPrism(heroU,enemies[3],100,{src:heroU,el:'light'});run(6);castPrism(heroU,enemies[3],100,{src:heroU,el:'light',spell:'prism',smx:1,smId:1});run(6);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old prism',log.length>0&&log.every(h=>near(h.amt,45)||near(h.amt,180))&&PRM.dbg.every(x=>x.ev==='nova'),log.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();PRM.dbg=[];setL(L);crowd();heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'prism',s,enemies.filter(e=>!e.dead));run(8);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&!!ev('burn')[0]&&(L<3||!!ev('ring')[0])&&(L<5||!!ev('sunrise')[0]),thrown+' '+['cast','burn','ring','sunrise'].map(k=>ev(k).length).join(','));}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;PRM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
