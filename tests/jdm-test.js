(function(){
/* Piercing Judgment's masteries (v447). Run on the dev page: __kk.ev(await (await fetch('/tests/jdm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand where they are put, on rays out from the hero (only the effects are stepped, updFx, with the
   game clock moved along), and hurt is wrapped to log the amount each hit is called with (the scroll's power is 100: the Judgment's own line
   deals 700). Every line logs where it ran (JDM.dbg), so which foes it should pierce is checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';heroU.faceA=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.judgment=SM_XP[L-1];else delete meta.smast.judgment;};
/* a foe standing at (x,z) */
const foeAt=(x,z,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=1;moveEnemy(e,0);e.spd=0;e.x=x;e.z=z;e.y=gy(x,z);e.g.position.set(x,0,z);e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* foes on a ray from the hero's hand (where the Judgment aims from) at angle a (radians), at these distances, and off it by off */
const ray=(a,ds,off,hp)=>{const hv=jdgHand(heroU,new THREE.Vector3());return ds.map(d=>foeAt(hv.x+Math.sin(a)*d+Math.cos(a)*(off||0),hv.z+Math.cos(a)*d-Math.sin(a)*(off||0),hp));};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,lead)=>{setL(L);castScrollNow('judgment',heroU,tStats(heroU),[lead],100,{src:heroU,bane:0,el:'light',anc:false,spell:'judgment'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>JDM.dbg.filter(d=>d.ev===n);const lines=k=>ev('line').filter(d=>!k||d.kind===k);
/* the foes a logged line should pierce: on its path (from 0.2 behind its circle to 32 tiles on), within its width (bosses 0.25 more) */
const onLine=(d,e)=>{const px=e.x-d.cp.x,pz=e.z-d.cp.z,pr=px*d.dir.x+pz*d.dir.z;if(pr<-.2||pr>32)return false;const cx=px-d.dir.x*pr,cz=pz-d.dir.z*pr,w=d.w+(e.boss?.25:0);return cx*cx+cz*cz<=w*w;};
const off=(d,e)=>{const px=e.x-d.cp.x,pz=e.z-d.cp.z,pr=px*d.dir.x+pz*d.dir.z;return Math.hypot(px-d.dir.x*pr,pz-d.dir.z*pr);};
const exact=(d,F)=>F.every(e=>onLine(d,e)===d.L.includes(e));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&!h.dot&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const smLeft=added=>added.filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
/* two groups: five foes on one ray (the Judgment's line), three on another 70 degrees round */
const groups=()=>{const A=ray(.3,[1.6,2,2.4,2.8,3.2]),B=ray(.3+1.22,[1.8,2.3,2.8]);return{A,B,F:A.concat(B)};};
try{
  /* ---- the card ---- */
  ok('the five masteries: Follow-Up, Honed Line, Volley, Executioner, Barrage (v447)',SM_D.judgment.map(x=>x.n).join('|')==='Follow-Up|Honed Line|Volley|Executioner|Barrage',SM_D.judgment.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (50%, 5%, 35%, 25%, ten / 1.5s / 25%)',/50%/.test(smDesc('judgment',0))&&/5%/.test(smDesc('judgment',1))&&/Three/.test(smDesc('judgment',2))&&/35%/.test(smDesc('judgment',2))&&/25%/.test(smDesc('judgment',3))&&/ten/.test(smDesc('judgment',4))&&/1\.5s/.test(smDesc('judgment',4))&&/25%/.test(smDesc('judgment',4))
    &&JDM.follow===.5&&JDM.hone===.05&&JDM.volley===.35&&JDM.volleyN===3&&JDM.exec===.25&&JDM.exec0===.15&&JDM.barrage===.25&&JDM.barrageN===10&&JDM.barrageT===1.5);
  ok('the old masteries are gone (no burn, mark, afterimage or pillar hooks); calibrated on the Epic ladder with hidden factors',!SMF.judgment.hit&&!SMF.judgment.cast&&SMF.judgment.m===7&&SMA.judgment.every(x=>x===1)&&SMG.judgment.length===5&&SMG.judgment.every(x=>x>=.8&&x<1.25),SMG.judgment.join());
  /* ---- Mastery 0 ---- */
  {play();JDM.dbg=[];log=[];const G=groups();wrapHurt();try{cast(0,G.A[0]);run(5);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: one line, 700% to each foe on it, the rest untouched',G.A.every(e=>hits(e,700,false).length===1)&&G.B.every(e=>!log.some(h=>h.e===e))&&!log.some(h=>h.smx),log.length+' hits');
    ok('Mastery 0: no mastery events',!JDM.dbg.length);}
  /* ---- M1 Follow-Up ---- */
  {play();JDM.dbg=[];log=[];const G=groups();const added=track();wrapHurt();try{cast(1,G.A[0]);run(5);}finally{hurt=H0;scene.add=S0;setL(0);}const m=lines('main')[0],f=lines('follow');
    ok('M1: the Judgment\'s line as before (the five on the first ray, 700% each)',m&&G.A.every(e=>m.L.includes(e)&&hits(e,700,false).length===1)&&exact(m,G.F),m&&m.L.length);
    ok('M1: then a second line, through the foes the first one missed: 50% each',f.length===1&&G.B.every(e=>f[0].L.includes(e)&&hits(e,50,true).length===1)&&exact(f[0],G.F)&&f[0].t>m.t,f.length&&f[0].L.length);
    ok('M1: only those two lines',ev('line').length===2);
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Honed Line ---- */
  {play();JDM.dbg=[];log=[];const G=groups();wrapHurt();try{cast(2,G.A[0]);run(5);}finally{hurt=H0;setL(0);}const m=lines('main')[0],f=lines('follow')[0];
    ok('M2: the Judgment\'s line strikes 5% harder (735%), the follow-up too (52.5%)',m&&G.A.every(e=>hits(e,735,false).length===1)&&f&&G.B.every(e=>hits(e,52.5,true).length===1));
    ok('M2: every line pierces wider: 0.56 tiles off its path (0.48 before), 0.42 for the smaller lines (0.34)',near(m.w,.56)&&near(f.w,.42)&&exact(m,G.F)&&exact(f,G.F),[m.w,f.w].join());}
  {play();JDM.dbg=[];const G=groups();cast(1,G.A[0]);run(5);setL(0);const m=lines('main')[0],f=lines('follow')[0];
    ok('M2 needs Mastery 2 (Mastery 1: 0.48 and 0.34, 700%)',near(m.w,.48)&&near(f.w,.34));}
  {/* the width itself: a line fired along a fixed aim, with foes 0.55 and 0.7 off its path */
    const trial=w=>{play();const R=tStats(heroU).range,ux=Math.sin(.3),uz=Math.cos(.3),cx=heroU.x+ux*.75,cz=heroU.z+uz*.75,at=(d,o2)=>foeAt(cx+ux*d+uz*o2,cz+uz*d-ux*o2);
      const In=at(2,0),A=at(2.4,.52),B=at(2.8,-.62);let H=null;JDM_OLD(heroU,100,{src:heroU,el:'light',spell:'judgment'},R,true,{w,aim:()=>({ux,uz,tg:null}),onFire:L=>{H=L;}});run(3);return{H,In,A,B};};
    const a=trial(.48),b=trial(.56);
    ok('M2\'s width: a line 0.56 wide pierces a foe 0.52 off its path (not one 0.62 off); at 0.48 it does not',a.H&&b.H&&a.H.includes(a.In)&&!a.H.includes(a.A)&&b.H.includes(b.A)&&!b.H.includes(b.B),[a.H&&a.H.length,b.H&&b.H.length].join());}
  /* ---- M3 Volley ---- */
  {play();JDM.dbg=[];log=[];const G=groups(),Cc=ray(.3-1.22,[1.9,2.4]),Dd=ray(.3+2.5,[1.7,2.2]);const all=G.F.concat(Cc,Dd);wrapHurt();try{cast(3,G.A[0]);run(6);}finally{hurt=H0;setL(0);}const v=lines('volley');
    ok('M3: three more lines, one after another, after the follow-up',v.length===3&&v.every((d,i)=>!i||d.t>v[i-1].t)&&v[0].t>lines('follow')[0].t,v.length);
    ok('M3: each through the foes the lines before pierced least: the two rays no line had reached yet are taken',v.some(d=>Cc.every(e=>d.L.includes(e)))&&v.some(d=>Dd.every(e=>d.L.includes(e))),v.map(d=>d.L.length).join());
    ok('M3: each line exactly the foes on its path, 36.75% each (35% honed)',v.every(d=>exact(d,all)&&d.L.every(e=>log.some(h=>h.e===e&&h.smx&&near(h.amt,36.75)&&near(h.t,d.t,.06)))));}
  /* ---- M4 Executioner ---- */
  {const trial=L=>{play();JDM.dbg=[];log=[];const A=ray(.3,[1.6,2,2.4,2.8,3.2]);A[1].hp=A[1].maxHp*.2;A[3].hp=A[3].maxHp*.12;A[4].boss=true;A[4].hp=A[4].maxHp*.05;wrapHurt();try{cast(L,A[0]);run(5);}finally{hurt=H0;setL(0);}
      return{d20:A[1].dead,d12:A[3].dead,boss:A[4].dead,ex:ev('exec').map(d=>A.indexOf(d.e))};};
    const a=trial(3),b=trial(4);
    ok('M4: a foe left under 25% is finished off by the line (a foe at 20%); not at Mastery 3',b.d20&&!a.d20,[a.d20,b.d20].join());
    ok('M4: under 15% as before (a foe at 12%), at either mastery',a.d12&&b.d12);
    ok('M4: never a boss (one at 5%)',!a.boss&&!b.boss);
    ok('M4: logged as executions',b.ex.includes(1)&&b.ex.includes(3)&&!b.ex.includes(4),b.ex.join());}
  /* ---- M5 Barrage ---- */
  {play();JDM.dbg=[];log=[];const G=groups(),Cc=ray(.3-1.22,[1.9,2.4]);const added=track();wrapHurt();try{cast(5,G.A[0]);run(7);}finally{hurt=H0;scene.add=S0;setL(0);}const br=lines('barrage'),c0=ev('cast')[0].t;
    ok('M5: ten more lines over 1.5s, after the volley',br.length===10&&br.every((d,i)=>!i||d.t>=br[i-1].t)&&br[9].t-br[0].t>1.2&&br[9].t-br[0].t<1.6&&br[0].t>lines('volley')[2].t,br.length+' '+(br.length?(br[9].t-br[0].t).toFixed(2):''));
    ok('M5: 15 lines in all (the Judgment\'s, the follow-up, three in the volley, ten in the barrage)',ev('line').length===15,ev('line').length);
    ok('M5: each barrage line at foes still standing, exactly those on its path: 26.25% each (25% honed)',br.every(d=>d.L.length>0&&exact(d,G.F.concat(Cc))&&d.L.every(e=>log.some(h=>h.e===e&&h.smx&&near(h.amt,26.25)&&near(h.t,d.t,.06)))));
    ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();JDM.dbg=[];const G=groups();cast(4,G.A[0]);run(7);setL(0);ok('M5 needs Mastery 5',!lines('barrage').length&&lines('volley').length===3);}
  /* ---- the rest ---- */
  {play();JDM.dbg=[];log=[];const G=groups();setL(5);wrapHurt();try{castJudgment(heroU,700,{src:heroU,el:'light',spell:'judgment'},tStats(heroU).range,true);run(5);castJudgment(heroU,375,{src:heroU,el:'light',spell:'verdict'},tStats(heroU).range,false);run(5);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast (and the Verdict) are the old line: no extra lines',!JDM.dbg.length&&G.A.every(e=>hits(e,700,false).length===1),JDM.dbg.length);}
  {const e0=errs;for(let L=1;L<=5;L++){play();const G=groups();G.F.forEach(e=>{e.maxHp=e.hp=300;});heroU.scd={};heroU.gcd=0;setL(L);meta.spells.judgment=meta.spells.judgment||{lvl:1,hero:null};fireScroll(heroU,'judgment',tStats(heroU),G.F.slice());run(7);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;JDM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
