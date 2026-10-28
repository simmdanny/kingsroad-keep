(function(){
/* Voidfall's masteries (v430). Run on the dev page: __kk.ev(await (await fetch('/tests/vfm-test.js')).text())
   returns [name, ok, detail] rows. A pack stands around the cast point and the game is stepped (update + updFx, so lifts and stuns run);
   hurt is wrapped to log the amount each hit is called with. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();paused=false;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.voidfall=SM_XP[L-1];else delete meta.smast.voidfall;};
const foe=(d,o)=>{o=o||{};spawnEnemy({type:o.type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=o.off||0;e.spd=.0001;e.maxHp=e.hp=1e9;e.armor=0;e.res={};e.shield=0;if(o.boss)e.boss=true;moveEnemy(e,0);return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),vfm:!!(o&&o.vfm),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>VFM.dbg.filter(d=>d.ev===n);
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
/* a pack of 7 round a point on the road; the point is where the cast lands (the densest spot) */
const D0=()=>Math.min(14,ROUTES[0].len*.45);
const pack=()=>{const d=D0(),F=[];for(let i=0;i<7;i++)F.push(foe(d+(i-3)*.28,{off:(i%3-1)*.2}));return F;};
const cast=(L,list,P)=>{setL(L);castScrollNow('voidfall',heroU,tStats(heroU),list||enemies.filter(e=>!e.dead),P||100,{src:heroU,bane:0,el:'dark',anc:false,spell:'voidfall'});};
const pt=d=>{const p=posAt(d,ROUTES[0]);return{x:p[0],z:p[1]};};
try{
  ok('the five masteries: Gravity Well, Hard Landing, Shattered Orbit, Hollow, Event Horizon',SM_D.voidfall.map(x=>x.n).join('|')==='Gravity Well|Hard Landing|Shattered Orbit|Hollow|Event Horizon',SM_D.voidfall.map(x=>x.n).join('|'));
  ok('the numbers on the cards are the ones in the code (1.5 tiles; 60% / 30%; 25%; 25% for 5s; 150% / 30%)',/1\.5 tiles/.test(smDesc('voidfall',0))&&/60%/.test(smDesc('voidfall',1))&&/30%/.test(smDesc('voidfall',1))&&/25%/.test(smDesc('voidfall',2))&&/25%/.test(smDesc('voidfall',3))&&/5s/.test(smDesc('voidfall',3))&&/150%/.test(smDesc('voidfall',4))&&/30%/.test(smDesc('voidfall',4))
    &&VFM.wellMax===1.5&&VFM.land===.6&&VFM.landS===.3&&VFM.orb===.25&&VFM.hol===.25&&VFM.holT===5&&VFM.crush===1.5&&VFM.crushN===.3&&SMA.voidfall.every(x=>x===1));
  ok('the old masteries are gone (no hit or cast hooks)',!SMF.voidfall.hit&&!SMF.voidfall.cast);
  /* ---- Mastery 0 ---- */
  {play();VFM.dbg=[];log=[];const F=pack();const added=track();wrapHurt();try{cast(0);run(7);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('Mastery 0: the old Voidfall (800% impact, 300% wave) and no mastery at all',!VFM.dbg.length&&log.some(h=>near(h.amt,800))&&log.some(h=>near(h.amt,300))&&!log.some(h=>h.smx),log.length);}
  /* ---- M1 Gravity Well ---- */
  {play();VFM.dbg=[];log=[];const F=pack(),d=D0(),A=foe(d+2.6),B=foe(d+3.2,{boss:true}),C=foe(d-2.6);const a0=A.dist,b0=B.dist,c0=C.dist;wrapHurt();let pc;
    try{cast(1,F);const c=ev('cast')[0];pc=c;run(2.2);}finally{hurt=H0;setL(0);}
    const dA=a0-A.dist,dB=b0-B.dist,dC=c0-C.dist;
    ok('M1: a foe that walked past the point is dragged back toward it (up to 1.5 tiles)',dA>.5&&dA<=1.5+1e-6,dA.toFixed(2));
    ok('M1: a boss a third of that at most',dB>0&&dB<=.5+1e-6,dB.toFixed(2));
    ok('M1: a foe still coming is not pushed back',Math.abs(dC)<.01,dC);
    ok('M1: the drag spends no Resolve (no one turns Unstoppable)',!(A.rsv>0)&&!(A.unstopT>0)&&!(B.unstopT>0),A.rsv);
    ok('M1: no damage of its own; the drag is logged',!log.some(h=>h.vfm)&&ev('well')[0]&&ev('well')[0].pull>.5,ev('well')[0]&&ev('well')[0].pull);}
  /* ---- M2 Hard Landing ---- */
  {play();VFM.dbg=[];log=[];const F=pack();wrapHurt();try{cast(2,F);run(6);}finally{hurt=H0;setL(0);}const n=ev('lift')[0].n,ld=ev('land');
    ok('M2: every foe the pillar threw up lands hard, once',n>=5&&ld.length===n&&new Set(ld.map(d=>d.e)).size===n,n+' lifted, '+ld.length+' landed');
    ok('M2: 60% to the foe that lands',ld.every(d=>log.some(h=>h.e===d.e&&h.vfm&&near(h.amt,60))));
    ok('M2: and 30% to the foes beside it',log.filter(h=>h.vfm&&near(h.amt,30)).length>=n,log.filter(h=>h.vfm&&near(h.amt,30)).length);
    ok('M2: only after the lift ends (no landing while still in the air)',ld.every(d=>d.t>=ev('lift')[0].t+.2));}
  /* ---- M3 Shattered Orbit ---- */
  {play();VFM.dbg=[];log=[];const F=pack();wrapHurt();try{cast(3,F);run(4);}finally{hurt=H0;setL(0);}const o=ev('orbit')[0],sp=log.filter(h=>h.vfm&&near(h.amt,25));
    ok('M3: the orbiting shards tear free at the top of the flight (5 a lifted foe)',o&&o.n===5*ev('lift')[0].n&&near(o.t-ev('lift')[0].t,VFM.orbAt-.07,.08),o&&o.n);
    ok('M3: each spears another foe for 25%',sp.length===o.n,sp.length+' of '+o.n);}
  /* ---- M4 Hollow ---- */
  {play();VFM.dbg=[];log=[];const F=pack();wrapHurt();try{cast(4,F);run(2.6);const hl=ev('hollow');
      ok('M4: every foe the pillar strikes is Hollowed',hl.length===ev('lift')[0].n&&hl.length>=5,hl.length);
      const A=hl[0].e,B=hl[1].e;H0(A,400,'magic',{src:null});run(5);const rA=ev('release').find(d=>d.e===A),rB=ev('release').find(d=>d.e===B);
      ok('M4: when it ends the hollow gives back a quarter of what the foe took from anything else',rA&&rB&&near(rA.amt-rB.amt,100,.01),rA&&rB&&(rA.amt-rB.amt).toFixed(1));
      ok('M4: given back as one hit (the void collapsing on it), capped at 300%',log.some(h=>h.e===A&&h.vfm&&near(h.amt,rA.amt,1e-6))&&rA.amt<=300+1e-6,rA&&rA.amt.toFixed(1));
      ok('M4: its own hits do not feed it (Hard Landing, the spears)',!VFM.dbg.some(d=>d.ev==='release'&&d.amt>300));}finally{hurt=H0;setL(0);}}
  /* ---- M5 Event Horizon ---- */
  {play();VFM.dbg=[];log=[];const F=pack();const added=track();wrapHurt();let hy=0;
    try{cast(5,F);run(2.09+.9);hy=Math.min(...ev("lift").length?F.filter(e=>!e.dead&&e.liftT>0).map(e=>e.liftH):[0]);run(8);}finally{hurt=H0;scene.add=S0;setL(0);}
    const cr=ev('crush')[0],n=ev('lift')[0].n;
    ok('M5: the second sphere holds the lifted foes up high',hy>1.2,hy.toFixed(2));
    ok('M5: then implodes: 150% + 30% for every other foe it holds',cr&&cr.n===n&&near(cr.dmg,100*(1.5+.3*Math.min(8,n-1)))&&log.filter(h=>h.vfm&&near(h.amt,cr.dmg)).length===n,cr&&cr.dmg);
    ok('M5: and drops them, so they land (Hard Landing after the implosion)',ev('land').length===n&&ev('land').every(d=>d.t>cr.t),ev('land').length);
    ok('M5: all its pieces are gone afterwards',smLeft(added)===0,smLeft(added));}
  /* ---- rendering, no errors ---- */
  {play();let err=null;try{const F=pack();cast(5,F);for(let i=0;i<70;i++){run(.05);if(i%10===0){anim(.05,time);renderer.render(scene,camera);}}}catch(e){err=e.message;}finally{setL(0);}
    ok('a full Mastery 5 cast renders without errors',!err&&!errs,err||errs);}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v430'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{hurt=H0;scene.add=S0;console.error=ce;VFM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
