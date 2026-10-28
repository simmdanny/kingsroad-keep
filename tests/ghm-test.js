(function(){
/* Grim Harvest's masteries (v431). Run on the dev page: __kk.ev(await (await fetch('/tests/ghm-test.js')).text())
   returns [name, ok, detail] rows. A pack stands on the road and the game is stepped (update + updFx); hurt is wrapped to log the amount
   each hit is called with. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;GHM_BT.clear();};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();paused=false;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}};
const setL=(L,k)=>{k=k||'harvest';meta.smast=meta.smast||{};if(L)meta.smast[k]=SM_XP[L-1];else delete meta.smast[k];};
const foe=(d,o)=>{o=o||{};spawnEnemy({type:o.type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=o.off||0;e.spd=.0001;e.maxHp=o.max||1e9;e.hp=o.hp||e.maxHp;e.armor=0;e.res={};e.shield=0;if(o.boss)e.boss=true;moveEnemy(e,0);return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),ghm:!!(o&&o.ghm),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>GHM.dbg.filter(d=>d.ev===n);
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const D0=()=>Math.min(14,ROUTES[0].len*.45);
/* the mark (the most health) leads; six more stand round it */
const pack=o=>{o=o||{};const d=D0(),F=[foe(d,{max:2e9})];for(let i=0;i<6;i++)F.push(foe(d-(i+1)*.3,{off:(i%3-1)*.2}));return F;};
const cast=(L,P)=>{setL(L);castScrollNow('harvest',heroU,tStats(heroU),enemies.filter(e=>!e.dead),P||100,{src:heroU,bane:0,el:'dark',anc:false,spell:'harvest'});};
try{
  ok('the five masteries: Culling Edge, Soul Swarm, Creeping Wither, Borrowed Time, Final Toll',SM_D.harvest.map(x=>x.n).join('|')==='Culling Edge|Soul Swarm|Creeping Wither|Borrowed Time|Final Toll',SM_D.harvest.map(x=>x.n).join('|'));
  ok('the numbers on the cards are the ones in the code (15% / 25%; 40%; 60%; 4% up to 10; 1.3s, 300%, 6 x 60%)',/15%/.test(smDesc('harvest',0))&&/25%/.test(smDesc('harvest',0))&&/40%/.test(smDesc('harvest',1))&&/60%/.test(smDesc('harvest',2))&&/4%/.test(smDesc('harvest',3))&&/10 souls/.test(smDesc('harvest',3))&&/1\.3s/.test(smDesc('harvest',4))&&/300%/.test(smDesc('harvest',4))&&/6 shards/.test(smDesc('harvest',4))&&/60%/.test(smDesc('harvest',4))
    &&GHM.cull===.15&&GHM.cullB===.25&&GHM.swarm===.4&&GHM.btMax===10&&GHM.bt===.04&&GHM.toll===3&&GHM.tollS===.6&&GHM.tollN===6&&GHM.tollHold===1.3&&SMA.harvest.every(x=>x===1));
  /* ---- Mastery 0 ---- */
  {play();GHM.dbg=[];log=[];pack();wrapHurt();try{cast(0);run(6);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the old harvest (600%, then 300%) and no mastery at all',!GHM.dbg.length&&log.some(h=>near(h.amt,600))&&log.some(h=>near(h.amt,300))&&!log.some(h=>h.ghm),log.length);}
  /* ---- M1 Culling Edge ---- */
  {play();GHM.dbg=[];log=[];const F=pack(),low=foe(D0()-.5,{max:4000,hp:1000}),high=foe(D0()-.7,{max:4000,hp:4000,off:.2}),B=foe(D0()-.9,{boss:true,off:-.2});wrapHurt();try{cast(1);run(2);}finally{hurt=H0;setL(0);}
    const cu=ev('cull');
    ok('M1: a foe the scythe leaves under 15% is reaped outright',low.dead&&cu.some(d=>d.e===low),cu.length+' culled');
    ok('M1: a foe it leaves above 15% lives',!high.dead&&!cu.some(d=>d.e===high),high.hp);
    ok('M1: a boss is never culled, it takes 25% more from the scythe instead',!B.dead&&log.some(h=>h.e===B&&h.ghm&&near(h.amt,150)),log.filter(h=>h.e===B).map(h=>h.amt).join(','));}
  /* ---- M2 Soul Swarm ---- */
  {play();GHM.dbg=[];log=[];const F=pack();wrapHurt();try{cast(2);run(2);const n1=log.filter(h=>!h.smx&&near(h.amt,600)).length;run(1.5);const sw=ev('swarm')[0],sh=log.filter(h=>h.ghm&&near(h.amt,40));
      ok('M2: one soul circles the reaper for every foe the first sweep reaps (up to 8)',sw&&sw.n===Math.min(8,n1)&&n1>=3,sw&&sw.n+' of '+n1);
      ok('M2: on the backhand each one strikes a foe for 40%',sh.length===sw.n,sh.length);
      ok('M2: they strike after the backhand starts, not before',sh.every(h=>h.t>=ev('swarm')[0].t));}finally{hurt=H0;setL(0);}}
  /* ---- M3 Creeping Wither ---- */
  {play();GHM.dbg=[];log=[];const F=pack();wrapHurt();try{cast(3);run(2.2);
      const W=F.filter(e=>!e.dead&&e.wither&&e.wither.t>0);ok('M3: the reaped foes are withering in his clouds',W.length>=3,W.length);
      W.forEach(e=>{e.hp=20;});run(2);const cr=ev('creep');
      ok('M3: each that dies withering bursts into a new cloud where it falls',cr.length===Math.min(GHM.cMax,W.filter(e=>e.dead).length)&&cr.length>=3,cr.length+' of '+W.filter(e=>e.dead).length);
      ok('M3: the new clouds wither the foes in them too (60% a second)',(()=>{const f2=foe(D0()-1,{off:0});const x=cr[0];f2.x=x.x;f2.z=x.z;run(1.2);return f2.wither&&f2.wither.t>0&&near(f2.wither.dps,60);})());}finally{hurt=H0;setL(0);}
    {play();GHM.dbg=[];const F=pack();for(let i=0;i<10;i++)foe(D0()-.2-i*.15,{off:(i%3-1)*.25});try{cast(3);run(2.2);enemies.forEach(e=>{if(!e.dead&&e.wither&&e.wither.t>0)e.hp=20;});run(3);}finally{setL(0);}
      ok('M3: at most 6 new clouds a cast',ev('creep').length<=6&&ev('creep').length>=5,ev('creep').length);}}
  /* ---- M4 Borrowed Time ---- */
  {play();GHM.dbg=[];log=[];const F=pack();try{cast(4);run(4.5);}finally{setL(0);}const bw=ev('borrow'),B=GHM_BT.get(heroU),n=B?B.n:0;
    ok('M4: each soul that reaches the hero stays with it (up to 10)',n>=3&&n<=10&&bw.length>=n,n);
    log=[];wrapHurt();try{castScrollNow('hexspark',heroU,tStats(heroU),enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'dark',anc:false,spell:'hexspark'});run(.6);}finally{hurt=H0;}
    const sp=ev('spend');ok('M4: the next other scroll is 4% stronger for each soul, and spends them',sp.length===1&&sp[0].k==='hexspark'&&near(sp[0].v,.04*n)&&!GHM_BT.get(heroU),sp[0]&&sp[0].v);
    ok('M4: its hits carry the souls\' power',log.some(h=>h.amt>100*(1+.04*n)*.99&&!h.smx)||log.some(h=>near(h.amt,100*(1+.04*n))),log.slice(0,3).map(h=>h.amt.toFixed(1)).join(','));
    try{castScrollNow('hexspark',heroU,tStats(heroU),enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'dark',anc:false,spell:'hexspark'});}catch(e){}
    ok('M4: and only that one',ev('spend').length===1);}
  /* ---- M5 Final Toll ---- */
  {play();GHM.dbg=[];log=[];const F=pack(),M=F[0];const added=track();wrapHurt();let st=0;try{cast(5);run(3.6);st=M.stunT;run(4);}finally{hurt=H0;scene.add=S0;setL(0);}
    const tl=ev('toll')[0],tr=ev('tear')[0];
    ok('M5: the hand rises under his mark and holds it',tl&&tl.e===M&&tl.held>0&&st>0,tl&&tl.held);
    ok('M5: then tears its soul out: 300%',log.some(h=>h.e===M&&h.ghm&&near(h.amt,300)));
    ok('M5: and the soul bursts into 6 shards, 60% each',tr&&tr.n===6&&log.filter(h=>h.ghm&&near(h.amt,60)).length===6,tr&&tr.n);
    const kept=[...GHM_BT.values()].map(B=>B.g),left=smLeft(added.filter(o=>!kept.includes(o)));ok('M5: all its pieces are gone afterwards (but the souls waiting on the hero)',left===0,left);}
  {play();GHM.dbg=[];const F=pack();F[0].hp=1;try{cast(5);run(5);}finally{setL(0);}
    ok('M5: if the mark dies first, the hand comes for the strongest foe left in reach',ev('toll')[0]&&ev('toll')[0].e!==F[0]&&!ev('toll')[0].e.fake,ev('toll').length);}
  /* ---- rendering, no errors ---- */
  {play();let err=null;try{pack();cast(5);for(let i=0;i<110;i++){run(.05);if(i%10===0){anim(.05,time);renderer.render(scene,camera);}}}catch(e){err=e.message;}finally{setL(0);}
    ok('a full Mastery 5 cast renders without errors',!err&&!errs,err||errs);}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v431'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{hurt=H0;scene.add=S0;console.error=ce;GHM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
