(function(){
/* Skyfall's masteries (v435, designed with MASTERY_DESIGN.md). Run on the dev page: __kk.ev(await (await fetch('/tests/skm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still on the first road near the hero, set apart along it and to its sides (only the effects
   are stepped, updFx, with the game clock moved along); hurt is wrapped to log the amount each hit is called with (the cast's power is 100:
   a meteor deals 90 within 1, the giant 420 within 2 (and burns)). Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  RT=ROUTES[0];D0=RT.len*.45;{const p=posAt(D0,RT);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}meta.spells.skyfall=meta.spells.skyfall||{lvl:1,hero:null};darkTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.skyfall=SM_XP[L-1];else delete meta.smast.skyfall;};
const foe=(dd,off,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0+dd;e.off=off||0;moveEnemy(e,0);e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* a crowd on the road ahead of the hero */
const crowd=()=>[-1.2,-.8,-.4,0,.4,.8,1.2].map((d,i)=>foe(d,(i%2?.15:-.15)));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,list)=>{setL(L);castScrollNow('skyfall',heroU,tStats(heroU),list||enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'fire',anc:false,spell:'skyfall'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const sm=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const old=e=>log.filter(h=>h.e===e&&!h.smx);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>SKM.dbg.filter(x=>x.ev===k);
const go=(L,list,sec)=>{const added=track();wrapHurt();try{cast(L,list);run(sec||8);}finally{hurt=H0;scene.add=S0;setL(0);}return added;};
const hitA=h=>!h.smx&&!h.dot;
try{
  /* ---- the card ---- */
  ok('the five masteries and their names',SM_D.skyfall.map(x=>x.n).join('|')==='Ember Rain|Crescendo|Ricochet|Shockfall|Extinction',SM_D.skyfall.map(x=>x.n).join('|'));
  ok('the numbers on the card match the code',/15%/.test(smDesc('skyfall',0))&&/15%/.test(smDesc('skyfall',1))&&/50%/.test(smDesc('skyfall',2))&&/150%/.test(smDesc('skyfall',4))&&/100%/.test(smDesc('skyfall',4))&&SKM.ember===.15&&SKM.cresc===.15&&SKM.rico===.5&&SKM.ext===1.5&&SKM.extR===1&&SKM.stun===.35&&SKM.extOut===3.5,[0,1,2,4].map(i=>smDesc('skyfall',i)).join(' / '));
  ok('the old masteries are gone, SMA is 1 and the numbers are tuned (no SM.free)',!SMF.skyfall.cast&&!SMF.skyfall.hit&&SMA.skyfall.every(x=>x===1)&&!(SM.free&&SM.free.skyfall));
  ok('no mastery name is also a scroll\'s name',!SM_D.skyfall.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 and the 3D impacts ---- */
  {play();SKM.dbg=[];log=[];crowd();const added=go(0);const am=log.filter(hitA).map(h=>h.amt);
    ok('Mastery 0: the old barrage (meteors of 90, a giant of 420) and none of the masteries',am.some(v=>near(v,90))&&am.some(v=>near(v,420))&&log.every(h=>!h.smx)&&am.every(v=>near(v,90)||near(v,420))&&SKM.dbg.every(x=>x.ev==='boom'),am.length);
    ok('every impact bursts in 3D fire (skmBoom), nine meteors and the giant',ev('boom').length===10,ev('boom').length);
    ok('Mastery 0: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M1 Ember Rain ---- */
  {play();SKM.dbg=[];log=[];crowd();const added=go(1);const em=ev('ember');
    ok('M1: embers from the burning sky land on foes near the barrage: 15% and Burning',em.length>3&&em.every(x=>sm(x.e,15).length>0),em.length+' embers');
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Crescendo ---- */
  {play();SKM.dbg=[];log=[];crowd();const added=go(2);const am=[...new Set(log.filter(hitA).map(h=>+h.amt.toFixed(1)))].sort((a,b)=>a-b);const steps=am.filter(v=>v<400&&Math.abs((v-90)/13.5-Math.round((v-90)/13.5))<1e-3);
    ok('M2: each meteor hits 15% harder than the one before (90, 103.5, 117 ... up to 198)',steps.length>=4&&Math.max(...steps)<=198+1e-6&&steps.includes(90),am.join(','));
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 Ricochet ---- */
  {play();SKM.dbg=[];log=[];crowd();const added=go(3);const r=ev('rico');
    ok('M3: each meteor bounces on and crashes again: 50% within 0.8',ev('rico0').length===9&&r.length>0&&r.every(x=>sm(x.e,50).length>0),ev('rico0').length+' bounces, '+r.length+' hit');
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Shockfall ---- */
  {play();SKM.dbg=[];log=[];crowd();let st=0;const added=track();wrapHurt();try{cast(4);for(let i=0;i<160;i++){run(.05);for(const x of ev('shock'))st=Math.max(st,x.e.stunT||0);}}finally{hurt=H0;scene.add=S0;setL(0);}const sh=ev('shock');
    ok('M4: the impacts knock the foes near them flat (stunned)',sh.length>0&&st>0,sh.length+' knocked, '+st.toFixed(2));
    ok('M4: the giant knocks them down for longer',sh.some(x=>x.sec===.8)&&sh.some(x=>x.sec===.35));
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Extinction ---- */
  {play();SKM.dbg=[];log=[];const F=crowd();const O1=foe(2.6,.2),O2=foe(-2.8,-.2),Far=foe(6,0);const added=go(5);const ei=ev('extIn').map(x=>x.e),eo=ev('extOut').map(x=>x.e);
    ok('M5: the giant\'s heart bursts up after its crash',!!ev('ext0')[0]&&!!ev('ext')[0]&&near(ev('ext')[0].time-ev('ext0')[0].time,.25,.08));
    ok('M5: 150% more within 2, 100% to foes from 2 to 3.5 as the ring reaches them, none further',ei.length>0&&ei.every(e=>sm(e,150).length===1)&&eo.length>0&&eo.every(e=>sm(e,100).length===1)&&!ei.includes(Far)&&!eo.includes(Far),ei.length+' in, '+eo.length+' out');
    ok('M5: Masteries 1-4 ride it',ev('ember').length>0&&ev('rico0').length===9&&ev('shock').length>0);
    ok('M5: everything is gone afterwards',smLeft(added)===0,smLeft(added));}
  /* ---- other casters ---- */
  {play();SKM.dbg=[];log=[];setL(5);crowd();wrapHurt();try{castSkyfall(heroU,enemies.slice(),100,{src:heroU,el:'fire'});run(8);castSkyfall(heroU,enemies.slice(),100,{src:heroU,el:'fire',spell:'skyfall',smx:1,smId:1});run(8);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old barrage',log.filter(hitA).length>0&&log.filter(hitA).every(h=>near(h.amt,90)||near(h.amt,420))&&SKM.dbg.every(x=>x.ev==='boom'),log.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();SKM.dbg=[];setL(L);crowd();heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'skyfall',s,enemies.filter(e=>!e.dead));run(9);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&!!ev('ember')[0]&&(L<3||ev('rico0').length===9)&&(L<5||!!ev('ext')[0]),thrown+' '+['cast','ember','rico0','ext'].map(k=>ev(k).length).join(','));}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;SKM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
