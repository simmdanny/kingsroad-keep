(function(){
/* The Eldritch Tree's masteries (v462). Run on the dev page: __kk.ev(await (await fetch('/tests/etm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road 0.3 tiles apart (some just past the old reach of 1.35 from where an eruption bursts, some past the new 1.65);
   the game is stepped (update and updFx), hurt is wrapped to log the amount each hit is called with (the scroll's power is 100: an eruption
   strikes 400, the drink is a share of max health of 1e6 (1%: 10000, 2%: 20000; a boss 0.4%: 4000, 0.7%: 7000), the bloom 900, or 1100 times
   its bonus), stunE is wrapped to log every hold. Every mastered cast logs its events (ETM.dbg: each eruption, where it burst and whom it
   struck, each foe swallowed and sunk, the bloom and how many foes the roots drank from), so who should be struck, held and swallowed, and how
   hard, is checked exactly. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,ST0=stunE;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
const T=()=>ANC.live.firsttree?ANC.live.firsttree.T:-1,runTo=t=>{for(let i=0;i<900&&ANC.live.firsttree&&T()<t;i++)run(.05);},runOut=()=>{for(let i=0;i<900&&ANC.live.firsttree;i++)run(.05);run(1.5);};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=100;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(camTarget.x,camTarget.z,1);scene.updateMatrixWorld(true);}
/* (no gem or scroll carriers: a carrier twinkles, and the twinkles still alive when a trial ends would count as left behind) */
function foe(d,i,hp){const R=ROUTES[0];spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.5,d));e.off=(i%3-1)*.2;
  e.hp=e.maxHp=1e6;if(hp!=null)e.hp=hp;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
/* a crowd of n along the road, 0.3 tiles apart */
/* or spread along the whole road, so an eruption always has fresh foes to burst under */
const spread=n=>{go();const R=ROUTES[0],F=[];for(let i=0;i<n;i++)F.push(foe(.5+i*(R.len-1)/n,i));return F;};
const stage=(n,f)=>{go();const R=ROUTES[0],F=[];for(let i=0;i<(n||16);i++)F.push(foe(R.len*.45+(i-(n||16)/2)*.3,i,f?f(i):null));return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.firsttree=SM_XP[L-1];else delete meta.smast.firsttree;};
const oA=()=>({src:heroU,bane:0,el:'nature',anc:true,spell:'firsttree'});
const cast=L=>{setL(L);castScrollNow('firsttree',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oA());worldSlow=1;slowT=0;};
let log=[],holds=[];const wrap=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,t:time,T:T()});return H0.apply(this,arguments);};stunE=function(e,sec){const g=ST0.apply(this,arguments);holds.push({e,sec,g,after:e.stunT||0,t:time,T:T()});return g;};};
const unwrap=()=>{hurt=H0;stunE=ST0;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>ETM.dbg.filter(d=>d.ev===n);
const hits=(e,amt)=>log.filter(h=>h.e===e&&near(h.amt,amt));
/* (a foe's own Resolve ring is the foe's, the batched health bars are the game's, the ripples of the board's water the terrain's) */
const left=added=>added.filter(o=>{if(enemies.some(e=>e.rsvRing===o)||typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(typeof PFB!=='undefined'&&PFB.m&&Object.values(PFB.m).includes(o))return false;
  if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const rootOf=added=>added.find(o=>o.isGroup&&o.children.length>40);
const erus=root=>root.children.filter(g=>g.isGroup&&g.children.some(c=>c.geometry&&c.geometry.type==='RingGeometry'));
const veinOf=root=>{let v=null;root.traverse(o=>{if(!v&&o.isMesh&&o.material&&o.material.uniforms&&o.material.uniforms.uD)v=o;});return v;};
const nRoots=root=>root.children.filter(m=>m.isMesh&&m.material&&m.material.uniforms&&m.material.uniforms.uR0&&m.material.uniforms.uR0.value!==.12).length;
const flowers=root=>root.children.filter(m=>m.isMesh&&!m.isInstancedMesh&&m.geometry&&m.geometry.type==='IcosahedronGeometry').length;
const inst=root=>root.children.filter(m=>m.isInstancedMesh);
const tot=F=>F.map(e=>log.filter(h=>h.e===e).reduce((a,h)=>a+h.amt,0));
const dbgX=()=>({log:d=>{d.t=time;ETM.dbg.push(d);}});
try{
  /* ---- the card ---- */
  const NM=SM_D.firsttree.map(x=>x.n);
  ok('the five masteries: Long Roots, Thirst, Restless Roots, Swallowed, The World in Bloom (v462)',NM.join('|')==='Long Roots|Thirst|Restless Roots|Swallowed|The World in Bloom',NM.join('|'));
  {const other=[];for(const k in SM_D)if(k!=='firsttree')for(const m of SM_D[k])other.push(m.n);if(typeof MAST_D!=='undefined')for(const k in MAST_D)for(const m of MAST_D[k]||[])if(m&&m.n)other.push(m.n);
    for(const k in SPELLS_S)other.push(SPELLS_S[k].n);for(const c of COMBOS)other.push(c.n);const dup=NM.filter(n=>other.includes(n));
    ok('their names are used by no other scroll, mastery or synergy',!dup.length,dup.join(', '));}
  {const d=i=>smDesc('firsttree',i);
    ok('the numbers on the card are the ones in the code (1.65, 8 spikes; 2% / 0.7%; 0.45s, 3s; 20%; 1100%, 3%, 45%)',
      /1\.65 tiles/.test(d(0))&&/8 root spikes/.test(d(0))&&/2% of each foe/.test(d(1))&&/0\.7%/.test(d(1))&&/every 0\.45s/.test(d(2))&&/after 3s/.test(d(2))&&/Unstoppable/.test(d(2))&&/under 20%/.test(d(3))&&/1100%/.test(d(4))&&/3% more/.test(d(4))&&/45%/.test(d(4))
      &&ETM.reach===1.65&&ETM.drink===.02&&ETM.drinkB===.007&&ETM.gap===.45&&ETM.lock===3&&ETM.swallow===.2&&ETM.bloom===11&&ETM.bloomPer===.03&&ETM.bloomMax===.45,d(4));}
  ok('no add-on hooks; calibrated with hidden factors',!SMF.firsttree.hit&&!SMF.firsttree.cast&&SMA.firsttree.every(x=>x===1)&&SMG.firsttree.length===5&&SMG.firsttree.every(x=>x>=.9&&x<1.2),SMG.firsttree.join());
  ok('the defaults table is the old Tree (1.35 reach, 1% / 0.4% drink, every 0.6s, 4s apart, a 900% bloom, 6 spikes, 6 motes, 130 blossom meshes, 1700 particles)',
    TRD.reach===1.35&&TRD.drink===.01&&TRD.drinkB===.004&&TRD.gap===.6&&TRD.lock===4&&!TRD.spare&&!TRD.swallow&&TRD.bloom===9&&!TRD.bloomPer&&!TRD.bloomMax&&TRD.spikes===6&&TRD.spikeH===1&&TRD.motes===6
    &&!TRD.draught&&TRD.veinX===''&&TRD.veinR===.045&&!TRD.flw&&!TRD.flwG&&TRD.waveK===1&&TRD.waveH===1&&TRD.waveS===1&&!TRD.surge&&TRD.pool===1700);
  /* ---- Mastery 0 ---- */
  let tot0=null;
  {const F=stage();F[15].boss=true;ETM.dbg=[];log=[];holds=[];wrap();try{setL(0);castFirstTree(heroU,100,oA(),dbgX());worldSlow=1;slowT=0;runOut();}finally{unwrap();}tot0=tot(F);
    const E=ev('erupt'),B=F[15];
    ok('the defaults: eruptions of 400% within 1.35 of where they burst, each foe struck at most once every 4s',E.length>=6&&E.every(d=>d.hits.every(e=>(e.x-d.x)**2+(e.z-d.z)**2<=1.35*1.35+1e-9))&&F.every(e=>{const t=log.filter(h=>h.e===e&&near(h.amt,400)).map(h=>h.t);return t.every((x,i)=>!i||x-t[i-1]>=4-1e-6);}),E.length+' eruptions');
    ok('the defaults: each strike drinks 1% of max health (a boss 0.4%) and holds 1.2s (a boss 0.4s); the bloom strikes 900% once on every foe',
      F.every(e=>{const s=log.filter(h=>h.e===e&&near(h.amt,400)).length,dk=log.filter(h=>h.e===e&&near(h.amt,e.boss?4000:10000)).length;return s>=3&&dk===s&&hits(e,900).length===1;})&&holds.filter(h=>h.T<20).every(h=>h.sec===(h.e.boss?.4:1.2)),
      hits(F[0],400).length+' strikes');}
  {const F=stage();F[15].boss=true;ETM.dbg=[];log=[];const added=track();let veinFS='',sp=0,fl=0,nr=0;wrap();try{cast(0);runTo(8);const r=rootOf(added);veinFS=veinOf(r).material.fragmentShader;sp=erus(r)[0].children.length;nr=nRoots(r);runTo(21);fl=flowers(r);runOut();}finally{unwrap();scene.add=S0;}
    const t=tot(F);
    ok('Mastery 0: exactly the old Tree (every foe takes what it took from the defaults with a log)',t.every((v,i)=>near(v,tot0[i],1e-9)),t.slice(0,4).map(v=>v.toFixed(0)).join(','));
    ok('Mastery 0: no mastery events, 6 spikes and a ring an eruption, the old vein shader, 10 blossom meshes on each root',!ETM.dbg.length&&sp===7&&!/veinX/.test(veinFS)&&fl===10*nr&&nr>=9,sp+' / '+fl+' blossoms on '+nr+' roots');
    ok('Mastery 0: the keep gains 3 lives; nothing is left behind',lives===103&&left(added)===0&&!ANC.live.firsttree&&!ANC.on&&!Object.keys(ANC.fs).length,lives+' '+left(added));}
  /* ---- M1 Long Roots ---- */
  {const F=stage();ETM.dbg=[];log=[];const added=track();let G=null;wrap();try{cast(1);runTo(8);G=erus(rootOf(added));runOut();}finally{unwrap();scene.add=S0;setL(0);}
    const E=ev('erupt'),d2=E.flatMap(d=>d.hits.map(e=>(e.x-d.x)**2+(e.z-d.z)**2));
    ok('M1: eruptions reach 1.65 tiles (1.35 before): foes between 1.35 and 1.65 are struck, none further',d2.length&&d2.every(x=>x<=1.65*1.65+1e-9)&&d2.some(x=>x>1.35*1.35+1e-6),Math.sqrt(Math.max(...d2)).toFixed(3));
    ok('M1: still 400% a strike and a 1% drink',log.every(h=>near(h.amt,400)||near(h.amt,10000)||near(h.amt,100*9)));
    const g=G[0],sp=g.children.filter(c=>c.geometry&&c.geometry.type==='TubeGeometry'),rg=g.children.find(c=>c.geometry.type==='RingGeometry');
    ok('M1: 8 root spikes (6 before), a fifth taller, set out and ringed for the wider reach',sp.length===8&&sp.every(s=>near(s.scale.y,s.scale.x*1.2,1e-9)&&near(Math.hypot(s.position.x,s.position.z),.62*1.65/1.35,1e-6))&&near(rg.geometry.parameters.outerRadius,1.4*1.65/1.35,1e-9),sp.length+' spikes');
    ok('M1: nothing is left behind',left(added)===0&&!ANC.live.firsttree,left(added));}
  /* ---- M2 Thirst ---- */
  {const F=stage();F[15].boss=true;ETM.dbg=[];log=[];const added=track();let V=null,uD=null,motes=0;wrap();try{cast(2);runTo(9);V=veinOf(rootOf(added));uD=V.material.uniforms.uD.value.toArray();runOut();}finally{unwrap();scene.add=S0;setL(0);}
    const B=F[15],o=ev('opts')[0];
    ok('M2: the roots drink 2% of max health (1% before; a boss 0.7%, 0.4% before), each strike still 400%',F.every(e=>{const s=hits(e,400).length;return s>=3&&hits(e,e.boss?7000:20000).length===s;})&&!log.some(h=>near(h.amt,10000)||near(h.amt,4000)),hits(B,7000).length+' boss draughts');
    ok('M2: twice the motes of life (12 a foe), the sap veins flash with each draught (their own shader, bolder veins), each draught logged',o&&o.X.motes===12&&o.X.draught===1&&/veinX/.test(V.material.fragmentShader)&&V.geometry.parameters.radius===.06&&uD.filter(x=>x>0).length>=2&&ev('erupt').every(d=>d.n>0),uD.map(x=>x.toFixed(1)).join(','));}
  /* ---- M3 Restless Roots ---- */
  let n0=0,n3=0;
  {const F=spread(30);ETM.dbg=[];try{castFirstTree(heroU,100,oA(),dbgX());worldSlow=1;slowT=0;runOut();}finally{}n0=ev('erupt').length;}
  {const F=spread(30);ETM.dbg=[];try{cast(3);runOut();}finally{setL(0);}n3=ev('erupt').length;}
  {const F=stage(30);ETM.dbg=[];log=[];holds=[];let un=0;wrap();try{cast(3);for(let i=0;i<600&&ANC.live.firsttree&&T()<20;i++){run(.05);for(const e of F)if(e.unstopT>0)un++;}runOut();}finally{unwrap();setL(0);}
    const E=ev('erupt'),gp=E.map(d=>d.t).map((t,i,a)=>i?t-a[i-1]:9).slice(1);
    ok('M3: the roots burst every 0.45s (0.6s before): with fresh foes always at hand, about 31 eruptions instead of 24',gp.every(g=>g>=.45-1e-6)&&Math.min(...gp)<.55&&n0>=22&&n0<=26&&n3>=29&&n3<=35,n0+' > '+n3+' eruptions, gaps from '+Math.min(...gp).toFixed(2));
    const re=F.flatMap(e=>{const t=hits(e,400).map(h=>h.t);return t.slice(1).map((x,i)=>x-t[i]);});
    ok('M3: the same foe may be struck again after 3s (4s before), never sooner',re.length&&re.every(x=>x>=3-1e-6)&&re.some(x=>x<4-1e-6),Math.min(...re).toFixed(2));
    const bl=holds.filter(h=>h.T>=20&&h.sec===1.5);
    ok('M3: the roots never make a foe Unstoppable, so the bloom holds every foe its full 1.5s',!un&&bl.length===30&&bl.every(h=>h.after>1.5-1e-6),un+' unstoppable samples, bloom holds '+bl.map(h=>h.after.toFixed(1)).slice(0,5).join(','));}
  {const F=stage(30);holds=[];let un=0;wrap();try{cast(2);for(let i=0;i<600&&ANC.live.firsttree&&T()<20;i++){run(.05);for(const e of F)if(e.unstopT>0)un++;}runOut();}finally{unwrap();setL(0);}
    ok('(at Mastery 2 the roots still spend foes\' Resolve as before: they break free and the bloom holds them less)',un>0&&holds.filter(h=>h.T>=20&&h.sec===1.5).some(h=>h.after<1.5-1e-6),un);}
  /* ---- M4 Swallowed ---- */
  {/* every third foe at 21% (the strike and a 2% drink leave it under 20%), one at 50%, a boss at 10% */
    const F=stage(16,i=>i%3===0?2.1e5:null);F[1].hp=5e5;F[2].boss=true;F[2].hp=1e5;ETM.dbg=[];log=[];const added=track();let mid=null;wrap();
    try{cast(4);for(let i=0;i<600&&ANC.live.firsttree&&T()<20;i++){run(.05);const s=ev('swallow');if(!mid&&s.length&&time-s[0].t>=.75){const e=s[0].e;mid={dead:e.dead,y:e.g.position.y,burrow:e.burrow,stun:e.stunT,swal:e.swal};}}runOut();}finally{unwrap();scene.add=S0;setL(0);}
    const S=ev('swallow'),K=ev('sunk'),want=F.filter((e,i)=>i%3===0&&!e.boss);
    ok('M4: every foe the roots leave under 20% is dragged under, and only those (not the foe at 50%, not the boss)',S.length===want.length&&want.every(e=>S.some(d=>d.e===e))&&S.every(d=>d.hp<.2)&&!S.some(d=>d.e===F[1]||d.e===F[2])&&!F[1].dead&&!F[2].dead,S.length+' of '+want.length);
    ok('M4: each sinks with the spikes and dies 0.9s later, held and passed over by towers while it sinks, its health bar hidden',mid&&!mid.dead&&mid.y<-.1&&mid.burrow===1&&mid.stun>0&&mid.swal===1&&K.length===S.length&&K.every(d=>{const s=S.find(q=>q.e===d.e);return d.e.dead&&d.t-s.t>.8&&d.t-s.t<1;}),mid&&JSON.stringify(mid));
    ok('M4: nothing is left behind; no foe is left burrowed or hidden',left(added)===0&&!ANC.live.firsttree&&enemies.every(e=>e.dead||(!e.burrow&&!e.swal)),left(added));}
  {const F=stage(16,i=>i%3===0?2.1e5:null);ETM.dbg=[];try{cast(3);runOut();}finally{setL(0);}ok('M4 needs Mastery 4 (at Mastery 3 no foe is swallowed)',!ev('swallow').length&&F.filter((e,i)=>i%3===0).every(e=>!e.dead));}
  /* ---- M5 The World in Bloom ---- */
  {const F=stage(12);ETM.dbg=[];log=[];const added=track();let im=null,nr=0,fl=-1,uK=0,uE=0,cols=0,R5=null;wrap();
    try{cast(5);runTo(19.9);uK=veinOf(rootOf(added)).material.uniforms.uK.value;runTo(20.3);const r=rootOf(added);R5=r;uE=veinOf(r).material.uniforms.uE.value;im=inst(r);nr=nRoots(r);fl=flowers(r);cols=im[0]&&im[0].instanceColor?im[0].instanceColor.count:0;runOut();}finally{unwrap();scene.add=S0;setL(0);}
    const b=ev('bloom')[0],k=1+Math.min(.45,.03*12);
    ok('M5: the bloom strikes 1100% (900% before), 3% more for every foe the roots drank from: 12 foes, 36% more, once on every foe',b&&b.n===12&&near(b.k,k)&&F.every(e=>hits(e,1100*k).length===1)&&!log.some(h=>near(h.amt,900)),b&&(b.n+' foes x'+b.k.toFixed(2)));
    ok('M5: twice the blossoms (20 on each root, 10 before) in one instanced draw, in the old three colours; no blossom meshes',im.length===1&&im[0].count===20*nr&&cols===20*nr&&fl===0,im.length&&im[0].count+' on '+nr+' roots');
    ok('M5: the veins glow brighter for every foe drunk, and the sap surges up the trunk as it blooms; a thicker wave of pollen',uK>1.6&&uK<=1.8+1e-9&&uE>.5&&ev('opts')[0].X.waveK===2&&ev('opts')[0].X.surge===1,uK.toFixed(2)+' / '+uE.toFixed(2));
    ok('M5: Masteries 1-4 ride it (1.65 reach, a 2% drink, every 0.45s, Swallowed), still 3 lives',(()=>{const X=ev('opts')[0].X;return X.reach===1.65&&X.drink===.02&&X.gap===.45&&X.spare===1&&X.swallow===.2;})()&&lives===103,lives);
    ok('M5: nothing is left behind (the blossoms\' instanced mesh goes with it)',left(added)===0&&!ANC.live.firsttree&&!ANC.on&&!Object.keys(ANC.fs).length&&R5&&!R5.parent,left(added));}
  {const F=stage(24);ETM.dbg=[];log=[];wrap();try{cast(5);runOut();}finally{unwrap();setL(0);}const b=ev('bloom')[0];
    ok('M5: the bonus stops at 45% (24 foes drunk: 1100% x 1.45)',b&&b.n===24&&near(b.k,1.45)&&F.every(e=>hits(e,1100*1.45).length===1),b&&b.n);}
  {const F=stage(12);ETM.dbg=[];log=[];wrap();try{cast(4);runOut();}finally{unwrap();setL(0);}ok('M5 needs Mastery 5 (at Mastery 4 a 900% bloom, no bonus)',F.every(e=>hits(e,900).length===1)&&ev('bloom')[0].k===1);}
  /* ---- the rest ---- */
  {const F=stage(12);ETM.dbg=[];log=[];wrap();try{cast(5);runTo(6);const lv=ANC.live.firsttree,T0=lv.T;ok('while a mastered Tree stands, Wrath of Gaia still finds it (the World Root)',!!(ANC&&ANC.live&&ANC.live.firsttree));
      setL(0);castScrollNow('firsttree',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oA());worldSlow=1;slowT=0;
      ok('casting it again while it stands extends it, keeping its masteries',ANC.live.firsttree===lv&&lv.T<T0&&near(lv.T,4.5,1e-3),T0.toFixed(2)+'>'+lv.T.toFixed(2));runOut();}finally{unwrap();setL(0);}
    ok('the extended Tree still blooms with its masteries (the first cast\'s options rule)',ev('opts').length===1&&ev('bloom').length===1&&F.every(e=>hits(e,1100*ev('bloom')[0].k).length===1));}
  {const F=stage(12);ETM.dbg=[];log=[];setL(5);wrap();try{NSP.firsttree(heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'nature',spell:'firsttree'});worldSlow=1;slowT=0;runOut();}finally{unwrap();setL(0);}
    ok('casts that are not a mastered scroll cast are the old Tree',!ETM.dbg.length&&F.every(e=>hits(e,900).length===1&&hits(e,10000).length>=3));}
  {const e0=errs;const bad=[];for(let L=1;L<=5;L++){const F=stage(12,()=>300);heroU.scd={};heroU.gcd=0;setL(L);meta.spells.firsttree=meta.spells.firsttree||{lvl:1,hero:null};ETM.dbg=[];fireScroll(heroU,'firsttree',heroStats(),F.slice());
      for(let i=0;i<200&&!ANC.live.firsttree;i++)run(.05);worldSlow=1;slowT=0;runOut();const o=ev('opts')[0];if(!o||o.L!==L||F.some(e=>!e.dead))bad.push(L+':'+(o?o.L:'-')+'/'+F.filter(e=>!e.dead).length);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive, every foe dies) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;stunE=ST0;scene.add=S0;ETM.dbg=null;window.__fz=false;try{resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;worldSlow=1;slowT=0;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);ancUnfilter();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
