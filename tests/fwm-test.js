(function(){
/* Frost Wolves' masteries as Simon designed them (v415). Run on the dev page: __kk.ev(await (await fetch('/tests/fwm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.frostwolves=SM_XP[L-1];else delete meta.smast.frostwolves;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,list)=>{setL(L);castScrollNow('frostwolves',heroU,tStats(heroU),list||enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'ice',anc:false,spell:'frostwolves'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&!h.dot&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const ev=n=>FWM.dbg.filter(d=>d.ev===n);
const MEV=['trail','howl','howlHit','rk','rkHit'];
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const END=()=>FWM.T0+FWM.HUNT+1.6;
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.frostwolves.map(x=>x.n).join('|')==='Razor Fangs|Flanking Instinct|Winter’s Trail|Howl of the North|Ragnarok Pack',SM_D.frostwolves.map(x=>x.n).join('|'));
  ok('and his numbers: 60% / 40%, 45%, 35%, 75% / 50%, 100% / 100%',/60%/.test(smDesc('frostwolves',0))&&/40%/.test(smDesc('frostwolves',0))&&/45%/.test(smDesc('frostwolves',1))&&/35%/.test(smDesc('frostwolves',2))&&/75%/.test(smDesc('frostwolves',3))&&/50%/.test(smDesc('frostwolves',3))&&/100%/.test(smDesc('frostwolves',4))
    &&FWM.rf===.6&&FWM.rfShat===.4&&FWM.fl===.45&&FWM.flEvery===2&&FWM.tr===.35&&FWM.trCd===.6&&FWM.trSlow===.2&&FWM.hw===.75&&FWM.hwR===1.4&&FWM.hwSlow===.35&&FWM.hwFirst===.5&&FWM.rk===1&&FWM.rkShat===1&&FWM.rkR===1.1&&FWM.rkGap===.25);
  ok('the old masteries are gone (no hooks), every factor at least 1, his numbers',!SMF.frostwolves.hit&&!SMF.frostwolves.cast&&SMA.frostwolves.every(x=>x===1)&&SMG.frostwolves.length===5&&SMG.frostwolves.every(x=>x>=1)&&SM.free&&!!SM.free.frostwolves);
  /* ---- Mastery 0 ---- */
  {play();FWM.dbg=[];log=[];const T=foe(spotD());wrapHurt();try{cast(0);run(END());}finally{hurt=H0;setL(0);}const b=ev('bite'),sh=ev('shatter');
    ok('Mastery 0: the same hunt (28% bites) and shatters (60% within 0.8), now with frost bursts, no masteries',b.length>=8&&hits(T,28,false).length===b.length&&sh.length===2&&sh.every(d=>d.L.includes(T))&&hits(T,60,false).length===2&&!log.some(h=>h.smx)&&!b.some(d=>d.rf||d.fl||d.hw)&&!FWM.dbg.some(d=>MEV.includes(d.ev)),b.length+' bites');}
  /* ---- M1 Razor Fangs ---- */
  {play();FWM.dbg=[];log=[];const d0=spotD(),A=foe(d0),B=foe(d0+1.6);wrapHurt();try{cast(1);run(END());}finally{hurt=H0;setL(0);}const b=ev('bite');
    const ok3=[0,1].every(w=>{let q=null,n=0;return b.filter(d=>d.w===w).every(d=>{if(d.e===q)n++;else{q=d.e;n=1;}return d.rf===(n%3===0);});});
    ok('M1: every 3rd bite in a row on the same foe (a new foe starts again) deals 60% more',ok3&&b.some(d=>d.rf),b.map(d=>d.w+(d.rf?'R':'')).join(' '));
    ok('M1: the 60% hits match the counted bites',[A,B].every(e=>hits(e,60,true).length===b.filter(d=>d.rf&&d.e===e).length));
    const cnt=(w,e)=>b.filter(d=>d.w===w&&d.e===e).length,sh=ev('shatter');
    ok('M1: a wolf\'s shatter deals 40% more to the foes it bit 3 times or more',sh.every(d=>d.L.every(e=>(cnt(d.w,e)>=3)===log.some(h=>h.e===e&&h.smx&&near(h.amt,40)&&near(h.t,d.t,.01))))&&sh.some(d=>d.L.some(e=>cnt(d.w,e)>=3)),sh.map(d=>d.L.map(e=>cnt(d.w,e)).join('/')).join(' '));
    ok('M1: nothing else (no flanking, trail, howl or Ragnarok)',!b.some(d=>d.fl||d.hw)&&!ev('trail').length&&!ev('howl').length&&!ev('rk').length);}
  /* ---- M2 Flanking Instinct ---- */
  {play();FWM.dbg=[];log=[];const d0=spotD(),T=foe(d0),U=foe(d0+.9);wrapHurt();try{cast(2,[T,U]);run(END());}finally{hurt=H0;setL(0);}const b=ev('bite');
    const both=b.filter(d=>d.e===T),w0=new Set(both.map(d=>d.w));
    ok('M2: both wolves hunt a foe that can take more than one bite',w0.size===2,[...w0].join());
    let n=0,okF=true;for(const d of b){if(d.e!==T){n=0;continue;}n++;if(d.fl!==(n%2===0))okF=false;}
    ok('M2: every 2nd bite between them deals 45% more',okF&&hits(T,45,true).length===b.filter(d=>d.fl).length&&b.some(d=>d.fl),b.filter(d=>d.e===T).map(d=>d.w+(d.fl?'F':'')).join(' '));}
  {play();FWM.dbg=[];const d0=spotD(),A=foe(d0,0,20),B=foe(d0+.9,0,20),Cc=foe(d0+1.8,0,20);cast(2);run(END());setL(0);
    ok('M2: never on foes one bite kills: no flanking',!ev('bite').some(d=>d.fl),ev('bite').length+' bites');}
  {play();FWM.dbg=[];const T=foe(spotD());cast(1);run(END());setL(0);ok('M2 needs Mastery 2',!ev('bite').some(d=>d.fl));}
  /* ---- M3 Winter's Trail ---- */
  {play();FWM.dbg=[];log=[];const d0=spotD(),F=[];for(let i=0;i<8;i++)F.push(foe(d0+(i-3)*.6,0,90));const Fl=foe(d0+.3,.2);Fl.fly=true;Fl.maxHp=Fl.hp=1e9;wrapHurt();try{cast(3);run(END());}finally{hurt=H0;setL(0);}const tr=ev('trail'),th=tr.filter(d=>d.L.length);
    ok('M3: running wolves leave sigils that burst into crystals',tr.length>=2,tr.length);
    ok('M3: 35% to ground foes within 0.32 (never flyers), each at most once every 0.6s',th.every(d=>d.L.every(e=>!e.fly&&Math.hypot(e.x-d.x,e.z-d.z)<=FWM.trR+1e-6))&&F.every(e=>{const t=log.filter(h=>h.e===e&&h.smx&&near(h.amt,35)).map(h=>h.t);return t.every((x,i)=>!i||x-t[i-1]>=FWM.trCd-1e-6);})&&!hits(Fl,35,true).length,th.length+' bursts hit');}
  {play();FWM.dbg=[];const d0=spotD();for(let i=0;i<6;i++)foe(d0+(i-3)*.6,0,90);cast(2);run(END());setL(0);ok('M3 needs Mastery 3',!ev('trail').length);}
  /* ---- M4 Howl of the North ---- */
  {play();FWM.dbg=[];log=[];const hx=heroU.x,hz=heroU.z,R=ROUTES[0],d0=spotD(),T=foe(d0),Fl=foe(d0+.2,.2);Fl.fly=true;const far=foe(d0+4);wrapHurt();try{cast(4);run(END());}finally{hurt=H0;setL(0);}
    const hw=ev('howl')[0],hh=ev('howlHit')[0],b=ev('bite');
    ok('M4: the wolves howl a second time when the first howl ends',hw&&near(hw.t-(ev('howl')[0].t),0)&&hh,hw&&hh&&(hh.t-hw.t).toFixed(2));
    ok('M4: the wave hits every foe within 1.4 of the hero for 75% (flyers too), not beyond',hh.L.every(e=>Math.hypot(e.x-hx,e.z-hz)<=FWM.hwR+1e-6&&hits(e,75,true).length===1)&&enemies.filter(e=>!e.dead&&Math.hypot(e.x-hx,e.z-hz)<FWM.hwR-.01).every(e=>hh.L.includes(e))&&!hh.L.includes(far)&&(Math.hypot(Fl.x-hx,Fl.z-hz)>=FWM.hwR||hh.L.includes(Fl)),hh.L.length);
    const fb=[0,1].map(w=>b.filter(d=>d.w===w&&hh.L.includes(d.e)));
    ok('M4: each wolf\'s first bite on a howled foe deals 50% more, and only the first',fb.every(L=>{const seen=new Set();return L.every(d=>{const f=!seen.has(d.e);seen.add(d.e);return d.hw===f;});})&&b.some(d=>d.hw),fb.map(L=>L.map(d=>d.hw?'H':'.').join('')).join(' | '));
    ok('M4: the hunt starts 0.45s later',b.length&&b[0].t-hw.t>FWM.hwT-.05,b.length&&(b[0].t-hw.t).toFixed(2));}
  /* ---- M5 Ragnarok Pack ---- */
  {play();FWM.dbg=[];log=[];const d0=spotD(),A=foe(d0),B=foe(d0+.9),Big=foe(d0+1.6);A.maxHp=A.hp=5e8;B.maxHp=B.hp=6e8;const added=track();wrapHurt();
    try{cast(5);run(END()+1.2);const rk=ev('rk'),rh=ev('rkHit'),sh=ev('shatter');
      ok('M5: at the end both wolves turn on the strongest foe within reach',rk.length===2&&rk.every(d=>d.e===Big),rk.map(d=>d.e===Big).join());
      ok('M5: each leap deals 100% to its target',rh.length===2&&hits(Big,100,true).length===2,rh.length);
      ok('M5: they shatter 0.25s apart, each 100% within 1.1 (a foe in both takes both)',sh.length===2&&sh.every(d=>d.rk)&&near(sh[1].t-sh[0].t,FWM.rkGap,.25)&&sh.every(d=>d.L.every(e=>Math.hypot(e.x-d.x,e.z-d.z)<=FWM.rkR+1e-6))&&hits(Big,100,false).length===2,sh.length===2&&(sh[1].t-sh[0].t).toFixed(2));
      run(3);ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();FWM.dbg=[];const T=foe(spotD());cast(4);run(END());setL(0);ok('M5 needs Mastery 5',!ev('rk').length&&ev('shatter').every(d=>!d.rk));}
  /* ---- the rest ---- */
  {play();FWM.dbg=[];const T=foe(spotD());setL(5);castFrostWolves(heroU,[T],100,{src:heroU,el:'ice',spell:'frostwolves'});run(END());setL(0);
    ok('casts that are not a mastered scroll cast get no masteries (only the new frost bursts)',ev('bite').length&&!ev('bite').some(d=>d.rf||d.fl||d.hw)&&!FWM.dbg.some(d=>MEV.includes(d.ev)));}
  {const e0=errs,n0=NS_OWN.size;for(let L=1;L<=5;L++){play();const d0=spotD();for(let i=0;i<8;i++)foe(d0+(i-4)*.5,0,150);cast(L);run(END()+1);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors and frees its wolves, rune and trails',errs===e0&&NS_OWN.size<=n0,(errs-e0)+' errors, '+(NS_OWN.size-n0)+' left');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;FWM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
