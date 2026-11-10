(function(){
/* The Aeon Dial's masteries (v454). Run on the dev page: __kk.ev(await (await fetch('/tests/aem-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road around the dial; the game is stepped (update and updFx), hurt is wrapped to log the amount each hit is called with
   (the scroll's power is 100: a pass deals 350 and a share of max health, midnight 1000, a stroke of the toll 95). Every mastered dial logs its
   events (AEM.dbg: its centre, each pass, glint and stroke), so which foe the hand passes, and when, is checked exactly. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
const T=()=>ANC.live.aeon?ANC.live.aeon.T:-1,runTo=t=>{for(let i=0;i<800&&ANC.live.aeon&&T()<t;i++)run(.05);};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(camTarget.x,camTarget.z,.6);scene.updateMatrixWorld(true);}
function foe(i,hp){const R=ROUTES[0];spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.min(R.len-1,1.5+i*(R.len-3)/12);e.off=0;e.hp=e.maxHp=hp||1e6;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
const stage=(hp)=>{go();const F=[];for(let i=0;i<12;i++)F.push(foe(i,hp));return F;};
const towerBy=e=>{let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const p=tw(c,r),d=(p.x-e.x)**2+(p.z-e.z)**2;if(d<bd&&d>1){bd=d;best=[c,r];}}gold+=buildCost('archer');placeTower('archer',best[0],best[1]);return towers[towers.length-1];};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.aeon=SM_XP[L-1];else delete meta.smast.aeon;};
const oA=()=>({src:heroU,bane:0,el:'light',anc:false,spell:'aeon'});
const cast=L=>{setL(L);castScrollNow('aeon',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oA());};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,sp:!!(o&&o.spell),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>AEM.dbg.filter(d=>d.ev===n);
const hits=(e,amt,sp)=>log.filter(h=>h.e===e&&near(h.amt,amt)&&(sp==null||h.sp===sp));
const left=added=>added.filter(o=>{if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
/* how many times the hand passes a foe: its clock angle from the centre, one pass per turn, except in the hand's first and last frame's
   sliver (the first frame only notes where the hand is; the last stops a frame short of midnight) */
const ang=(e,O)=>{const a=Math.atan2(e.x-O.x,O.z-e.z);return a<0?a+Math.PI*2:a;};
const edge=(e,O)=>{const a=ang(e,O);return a<.16||a>Math.PI*2-.16;};
try{
  /* ---- the card ---- */
  ok('the five masteries: The Toll of Years, Deep Age, Quickening, Borrowed Years, Twelve Strokes (v454)',SM_D.aeon.map(x=>x.n).join('|')==='The Toll of Years|Deep Age|Quickening|Borrowed Years|Twelve Strokes',SM_D.aeon.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (2% / 0.5%; 12.5% up to 50%; 2.56s; 30%; twelve over 2.2s, 95% each, 1140%, under 25%)',
    /2% of a foe/.test(smDesc('aeon',0))&&/0\.5%/.test(smDesc('aeon',0))&&/12\.5%/.test(smDesc('aeon',1))&&/50%/.test(smDesc('aeon',1))&&/2\.56s/.test(smDesc('aeon',2))&&/30%/.test(smDesc('aeon',3))
    &&/twelve times over 2\.2s/.test(smDesc('aeon',4))&&/95%/.test(smDesc('aeon',4))&&/1140%/.test(smDesc('aeon',4))&&/25%/.test(smDesc('aeon',4))
    &&AEM.mhp===.02&&AEM.mhpB===.005&&AEM.age===.125&&AEM.ageMax===.5&&AEM.PER===2.56&&AEM.tower===1.3&&AEM.tollN===12&&AEM.tollT===2.2&&AEM.tollK===.95&&AEM.tollC===.25&&near(AEM.tollN*AEM.tollK,11.4));
  ok('the old masteries are gone (no Weathered, Sands, Shards, Heavy Hours or Thirteenth Hour hooks); calibrated with hidden factors',!SMF.aeon.hit&&!SMF.aeon.cast&&SMA.aeon.every(x=>x===1)&&SMG.aeon.length===5&&SMG.aeon.every(x=>x>=.9&&x<1.2),SMG.aeon.join());
  ok('Quickening keeps the same midnight: five turns where there were four',near(12.8/AEM.PER,5)&&near((AEON_ACT[1]-AEON_ACT[0])/AEOD.PER,4));
  /* ---- Mastery 0 ---- */
  /* the dial's own defaults given as options (only a log added) are the same cast: the same passes, the same hits */
  let O0=null;
  {const F=stage();AEM.dbg=[];log=[];wrapHurt();try{setL(0);castAeon(heroU,100,oA(),{log:d=>{d.t=time;AEM.dbg.push(d);}});run(21);}finally{hurt=H0;}
    const c=ev('cast')[0];O0=c&&c.O;const P=new Map();for(const d of ev('pass'))P.set(d.e,(P.get(d.e)||0)+1);
    const exp=F.map(e=>edge(e,O0)?null:4);
    ok('the defaults: four passes of every foe (350% + 1% of its max health each), one 1000% midnight',c&&F.every((e,i)=>exp[i]==null?(P.get(e)>=3&&P.get(e)<=4):P.get(e)===4)&&F.every(e=>hits(e,350,true).length===P.get(e)&&hits(e,1e4,false).length===P.get(e)&&hits(e,1000,true).length===1),F.map(e=>P.get(e)).join(','));
    {const D=c.D;ok('the defaults table is the old dial (3.2s, 1% / 0.3%, 10% to 40%, towers 20%, one strike)',D.PER===3.2&&D.mhp===.01&&D.mhpB===.003&&D.age===.1&&D.ageMax===.4&&D.tower===1.2&&!D.toll&&!D.glint&&!D.fx);}
    ok('no mastery events on a cast without a level',!ev('opts').length);}
  {const F=stage(),B=F[5];B.boss=true;AEM.dbg=[];log=[];let mx=0;const tw0=towerBy(F[3]),r0t=tStats(tw0).rate;let rk=null;wrapHurt();try{cast(0);for(let i=0;i<440;i++){run(.05);for(const e of F)mx=Math.max(mx,e.ageS||0);if(rk==null&&T()>5)rk=tStats(tw0).rate/r0t;}}finally{hurt=H0;}
    const n350=F.map(e=>hits(e,350,true).length);
    ok('Mastery 0: the old dial (350% a pass, 1% of max health, 0.3% for a boss, four turns, one 1000% midnight)',F.every((e,i)=>(edge(e,O0)?n350[i]>=3:n350[i]===4)&&hits(e,1000,true).length===1&&hits(e,e.boss?3000:1e4,false).length===n350[i]),n350.join(','));
    ok('Mastery 0: ageing stops at 40%, towers 20% faster, no toll, no mastery events',near(mx,.4)&&near(rk,1.2,1e-3)&&!log.some(h=>near(h.amt,95))&&!AEM.dbg.length,mx+' '+rk);}
  /* ---- M1 The Toll of Years ---- */
  {const F=stage(),B=F[5];B.boss=true;AEM.dbg=[];log=[];wrapHurt();try{cast(1);run(21);}finally{hurt=H0;setL(0);}
    const c=ev('cast')[0],O=c&&c.O,P=new Map();for(const d of ev('pass'))P.set(d.e,(P.get(d.e)||0)+1);
    ok('M1: each pass takes 2% of a foe\'s max health (0.5% of a boss\'s), with its 350%',F.every(e=>P.get(e)>=3&&hits(e,e.boss?5000:2e4,false).length===P.get(e)&&hits(e,350,true).length===P.get(e))&&!log.some(h=>!h.sp&&near(h.amt,1e4)),F.map(e=>P.get(e)).join(','));
    ok('M1: the trail runs longer and brighter, more gold dust off each foe passed',c&&c.D.trail>AEOD.trail&&c.D.trailB>AEOD.trailB&&c.D.beam>AEOD.beam&&c.D.dustN>AEOD.dustN&&c.D.dustS>1);
    ok('M1: no other change (four turns, ageing to 40%, one 1000% midnight)',c.D.PER===3.2&&c.D.ageMax===.4&&!c.D.toll&&F.every(e=>hits(e,1000,true).length===1)&&ev('pass').every(d=>d.age<=.4+1e-9));}
  /* ---- M2 Deep Age ---- */
  {const F=stage();AEM.dbg=[];let mx=0,sl=1;wrapHurt();try{cast(2);for(let i=0;i<440;i++){run(.05);for(const e of F)mx=Math.max(mx,e.ageS||0);if(T()>16.2&&T()<16.3)sl=Math.min(sl,ancF(F[4]));}}finally{hurt=H0;setL(0);}
    const c=ev('cast')[0],a4=ev('pass').filter(d=>d.e===F[4]).map(d=>+d.age.toFixed(4));
    ok('M2: each pass ages a foe 12.5% slower, up to 50% (10%, up to 40% before)',near(mx,.5)&&(a4.join()==='0.125,0.25,0.375,0.5'||edge(F[4],c.O)),a4.join());
    ok('M2: an aged foe moves at half its speed',near(sl,.5,1e-6)||edge(F[4],c.O),sl);
    ok('M2: aged foes shed thicker, paler dust; midnight still clears the ageing',c.D.ageDust&&F.every(e=>!e.ageS));}
  /* ---- M3 Quickening ---- */
  {const F=stage();AEM.dbg=[];log=[];wrapHurt();try{cast(3);run(21);}finally{hurt=H0;setL(0);}
    const c=ev('cast')[0],O=c.O,P=new Map();for(const d of ev('pass'))P.set(d.e,(P.get(d.e)||0)+1);
    const gaps=[];for(const e of F){const t=ev('pass').filter(d=>d.e===e).map(d=>d.t);for(let i=1;i<t.length;i++)gaps.push(t[i]-t[i-1]);}
    ok('M3: five sweeps before the same midnight (one more than before)',F.every(e=>edge(e,O)?P.get(e)>=4&&P.get(e)<=5:P.get(e)===5)&&F.every(e=>hits(e,350,true).length===P.get(e))&&ev('turn').length===4,F.map(e=>P.get(e)).join(','));
    ok('M3: the hand turns every 2.56s',gaps.length&&gaps.every(g=>Math.abs(g-2.56)<.06),gaps.slice(0,4).map(g=>g.toFixed(2)).join(','));
    {const m=ev('stroke').length;ok('M3: midnight comes at the same time, one 1000% strike; gears and runes spin faster',!m&&F.every(e=>hits(e,1000,true).length===1)&&c.D.gearK>1);}}
  /* ---- M4 Borrowed Years ---- */
  {const F=stage();const tw0=towerBy(F[3]),r0t=tStats(tw0).rate;AEM.dbg=[];const added=track();let r4=null,r1=null;try{cast(4);runTo(5);r4=tStats(tw0).rate/r0t;runTo(16.5);r1=tStats(tw0).rate/r0t;run(6);}finally{scene.add=S0;setL(0);}
    const g=ev('glint').filter(d=>d.tw===tw0);
    ok('M4: towers fight 30% faster while the dial turns (20% before), and at their own speed after midnight',near(r4,1.3,1e-3)&&near(r1,1,1e-6),r4+' / '+r1);
    ok('M4: a tower glints as the hand passes over it, once a turn',g.length>=3&&g.length<=4,g.length);
    ok('M4: nothing is left behind',left(added)===0&&!ANC.live.aeon,left(added));}
  {go();const F=[];for(let i=0;i<12;i++)F.push(foe(i));const tw0=towerBy(F[3]),r0t=tStats(tw0).rate;let r3=null;AEM.dbg=[];cast(3);runTo(5);r3=tStats(tw0).rate/r0t;run(18);setL(0);
    ok('M4 needs Mastery 4 (20% at Mastery 3, no glint)',near(r3,1.2,1e-3)&&!ev('glint').length,r3);}
  /* ---- M5 Twelve Strokes ---- */
  /* (the foes whose health is set just before midnight are ones the hand has already passed for the last time) */
  const mid=(F,O)=>F.filter(e=>{const a=ang(e,O);return a>.3&&a<5.3;});
  {const F=stage();AEM.dbg=[];log=[];const added=track();let live=null;wrapHurt();
    try{cast(5);live=ANC.live.aeon;const M=mid(F,ev('cast')[0].O),A=M[0],Bf=M[1],C=M[2],Bo=M[3];Bo.boss=true;runTo(16.1);A.hp=A.maxHp*.24;Bf.hp=250400;C.hp=C.maxHp*.3;Bo.hp=Bo.maxHp*.1;log=[];runTo(20);
      ok('M5: the dial holds through the toll (it ends 2.2s later than before)',ANC.live.aeon===live&&T()>=20,T().toFixed(2));run(5);
    const S=ev('stroke'),st=S.map(d=>d.t-S[0].t);
    ok('M5: midnight tolls twelve times over 2.2s',S.length===12&&st.every((v,i)=>Math.abs(v-i*.2)<.06)&&S[11].last&&!S[10].last&&S.every(d=>d.L.length>=F.length-2),st.map(v=>v.toFixed(2)).join(','));
    ok('M5: each stroke strikes every foe for 95% (1140% in all), no 1000% strike',F.filter(e=>e!==A&&e!==Bf).every(e=>hits(e,95,true).length===12)&&!log.some(h=>near(h.amt,1000)),hits(C,95,true).length);
    const cr=ev('crumble'),cs=cr.map(d=>F.indexOf(d.e)+'@'+d.i).join(' ');
    ok('M5: a foe under 25% crumbles at the first stroke',A.dead&&cr.some(d=>d.e===A&&d.i===0),cs);
    ok('M5: every stroke crumbles: a foe just over 25% crumbles at a later stroke, once the strokes bring it under',Bf.dead&&cr.some(d=>d.e===Bf&&d.i>0&&d.i<11),cs);
    ok('M5: not one well above it (30%), nor a boss (10%)',!C.dead&&!Bo.dead&&cr.length===2,cs);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M5: Masteries 1-4 ride it (2% passes, ageing to 50%, five turns, towers 30%)',ev('cast')[0].D.mhp===.02&&ev('cast')[0].D.ageMax===.5&&ev('turn').length===4&&ev('cast')[0].D.tower===1.3);
    ok('M5: nothing is left behind',left(added)===0&&!ANC.live.aeon&&!ANC.on,left(added));}
  {const F=stage();AEM.dbg=[];log=[];let A=null;wrapHurt();try{cast(4);A=mid(F,ev('cast')[0].O)[0];runTo(16.1);A.hp=A.maxHp*.24;runTo(16.6);run(6);}finally{hurt=H0;setL(0);}
    ok('M5 needs Mastery 5 (at Mastery 4: one 1000% strike, a foe at 24% stands)',!ev('stroke').length&&A&&!A.dead&&F.every(e=>hits(e,1000,true).length===1));}
  /* ---- the rest ---- */
  {const F=stage();AEM.dbg=[];log=[];wrapHurt();try{cast(5);run(6);const lv=ANC.live.aeon,T0=lv.T;setL(0);castScrollNow('aeon',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oA());
      ok('casting it again while it runs winds it back, keeping its masteries',ANC.live.aeon===lv&&lv.T<T0&&near(lv.T,4.5,1e-3),T0.toFixed(2)+'>'+lv.T.toFixed(2));run(26);}finally{hurt=H0;setL(0);}
    ok('the wound-back dial still tolls twelve strokes (the first cast\'s options rule)',ev('stroke').length===12&&ev('cast').length===1&&!log.some(h=>near(h.amt,1000)));}
  {const F=stage();AEM.dbg=[];log=[];setL(5);wrapHurt();try{NSP.aeon(heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'light',spell:'aeon'});run(21);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast are the old dial',!AEM.dbg.length&&F.every(e=>hits(e,1000,true).length===1&&hits(e,1e4,false).length>=3));}
  {const e0=errs;const bad=[];for(let L=1;L<=5;L++){const F=stage(300);heroU.scd={};heroU.gcd=0;setL(L);meta.spells.aeon=meta.spells.aeon||{lvl:1,hero:null};AEM.dbg=[];fireScroll(heroU,'aeon',heroStats(),F.slice());run(25);
      const o=ev('opts')[0];if(!o||o.L!==L||F.some(e=>!e.dead))bad.push(L+':'+(o?o.L:'-')+'/'+F.filter(e=>!e.dead).length);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive, every foe dies) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;AEM.dbg=null;window.__fz=false;try{resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);ancUnfilter();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
