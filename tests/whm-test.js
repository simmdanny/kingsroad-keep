(function(){
/* Wormhole's masteries (v473). Run on the dev page: __kk.ev(await (await fetch('/tests/whm-test.js')).text()) returns [name, ok, detail] rows.
   Foes walk the road into the first mouth (board 31, or board 777 at board version 5 for two roads that join), with the marsh switched off so
   each walks exactly its speed and the hero knocked out (so it neither blocks nor fights them) unless a row says otherwise; the game is
   stepped (update and updFx, 0.05s a step) and hurt is wrapped to log every amount Wormhole strikes for (the cast's power is 100: a crossing
   strikes 400, 450 from Mastery 3). The mouths' places are worked out here with the spell's own rule (the lead foe's distance + its speed x 1.2
   + 1.4; the far one 13 tiles back, 16 from Mastery 3); every crossing is checked against where its foe stood and where it came out
   (moveEnemy is wrapped to see it land), and the collapse foe by foe against where the foes stood when it struck (shockwave is wrapped to
   see each mouth collapse). Every mastered cast logs its options, its mouths, each crossing (how, from where to where, on which road), each
   foe it would not throw forward, the last crossing, each collapse strike and its end (WHM.dbg). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,ME0=moveEnemy,SW0=shockwave,WB0=whBurst,WE0=whExit,TM0=terMarshF;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
let KO=true;const DT=.05,run=(s,each)=>{for(let i=0;i<Math.round(s/DT);i++){if(heroU){heroU.cd=1e9;if(KO)heroU.ko=1e9;}update(DT);updFx(DT);if(each)each();}};
/* (the collapse's debris chunks outlive the cast by a moment: let them land before looking for anything left behind) */
const settle=()=>run(2.5);
function go(two){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();{const g0=MAP_GV;if(two)MAP_GV=5;try{buildMap(two?777:31);}finally{MAP_GV=g0;}}MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;heroU.ko=0;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;darkTarget=0;vigTarget=0;__kk.camXZ(camTarget.x,camTarget.z,1);scene.updateMatrixWorld(true);}
/* (no gem or scroll carriers: a carrier twinkles every 0.18s, and the twinkles still alive when a trial ends would count as left behind) */
function foe(R,d,off,spd){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.2,d));e.off=off||0;e.hp=e.maxHp=1e7;e.armor=0;e.res={};e.shield=0;e.spd=spd==null?1:spd;moveEnemy(e,0);return e;}
/* a column of n foes walking the road into the first mouth, 0.72 tiles apart (a wave's spawn gap at 1 tile/s), the lead at d0 */
const OFFS=[0,.2,-.2];
function stage(o){o=o||{};go(o.two);const R=o.two?ROUTES[1]:ROUTES[0],F=[];for(let i=0;i<(o.n||14);i++)F.push(foe(R,(o.d0||(o.two?37:24))-i*.72,OFFS[i%3],o.spd));return F;}
/* the mouths, by the spell's own rule (the lead: the foe furthest along any road) */
function mouths(back){let lead=null;for(const e of enemies)if(!e.dead&&!e.fake&&e.dist!=null&&(!lead||e.dist>lead.dist))lead=e;const R=lead.route||ROUTES[0],dIn=Math.min(R.len-.6,lead.dist+(lead.spd||0)*1.2+1.4),dOut=Math.max(.4,dIn-back);
  return{lead,R,dIn,dOut,pI:posAt(dIn,R),pO:posAt(dOut,R)};}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.wormhole=SM_XP[L-1];else delete meta.smast.wormhole;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'dark',anc:true,spell:'wormhole'},x||{});
let T0=0;const cast=(L,list,x)=>{setL(L);T0=time;castScrollNow('wormhole',heroU,heroStats(),list||enemies.filter(e=>!e.dead),100,oC(x));};
/* the wrappers: every strike (where its foe stood), where each struck foe lands (its moveEnemy(e,0) right after), each mouth's collapse
   (with every foe's place then), each burst and each small far mouth */
let log=[],land=new Map(),pend=new Set(),sw=[],bursts=[],exits=[];
const wrap=()=>{log=[];land=new Map();pend=new Set();sw=[];bursts=[];exits=[];
  hurt=function(e,amt,kind,o){if(o&&o.spell==='wormhole'&&e&&!e.dead){log.push({e,amt,t:time,d:e.dist,rt:e.route||ROUTES[0],x:e.x,z:e.z});pend.add(e);}return H0.apply(this,arguments);};
  moveEnemy=function(e,dt){const r=ME0.apply(this,arguments);if(dt===0&&pend.has(e)){pend.delete(e);land.set(e,{d:e.dist,rt:e.route||ROUTES[0],blk:e.blockBy,t:time,x:e.x,z:e.z});}return r;};
  shockwave=function(x,z,R){sw.push({x,z,R,t:time,snap:enemies.filter(q=>!q.dead).map(q=>[q,q.x,q.z])});return SW0.apply(this,arguments);};
  whBurst=function(x,y,z,c,R){bursts.push({x,z,R,t:time});return WB0.apply(this,arguments);};
  whExit=function(x,y,z){exits.push({x,z,t:time});return WE0.apply(this,arguments);};};
const unwrap=()=>{hurt=H0;moveEnemy=ME0;shockwave=SW0;whBurst=WB0;whExit=WE0;scene.add=S0;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-9)*Math.max(1,Math.abs(b));
const ev=n=>WHM.dbg.filter(d=>d.ev===n);
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const dbgX=x=>Object.assign({log:d=>{d.t=time;WHM.dbg.push(d);}},x||{});
/* one cast's strikes split: the crossings (before the collapse) and the collapse (the frame of the first mouth's shockwave) */
const split=()=>{const tc=sw.length?sw[0].t:1e9;return{tc,cr:log.filter(h=>h.t<tc-1e-9),co:log.filter(h=>Math.abs(h.t-tc)<1e-9)};};
/* the collapse foe by foe: each mouth's strike on the foes within reach of it when it struck; the foes whose totals differ */
const collBad=(co,R,amt)=>{const want=new Map(),got=new Map();for(const s of sw.slice(0,2))for(const [q,x,z] of s.snap)if((x-s.x)**2+(z-s.z)**2<R*R)want.set(q,(want.get(q)||0)+amt);
  for(const h of co)got.set(h.e,(got.get(h.e)||0)+h.amt);const bad=[];for(const [q,v] of want)if(!near(got.get(q)||0,v))bad.push(enemies.indexOf(q)+':'+(got.get(q)||0)+'/'+v);for(const [q,v] of got)if(!want.has(q))bad.push(enemies.indexOf(q)+':'+v+'/0');return{bad,n:want.size};};
/* every crossing: struck once for amt where it stood, and landed (if it moved) within 0.15 of where it should, on the road it should, unblocked */
const crossBad=(cr,amt,M,dL)=>{const seen=new Set(),bad=[];for(const h of cr){if(seen.has(h.e))bad.push('twice '+enemies.indexOf(h.e));seen.add(h.e);if(!near(h.amt,amt))bad.push('amt '+h.amt);const L=land.get(h.e);
    if(L&&dL!=null&&(Math.abs(L.d-dL(h.e))>.15+1e-9||L.rt!==M.R||L.blk))bad.push('land '+enemies.indexOf(h.e)+' '+L.d.toFixed(2)+'/'+dL(h.e).toFixed(2));}return bad;};
const inWin=(h,M)=>h.rt===M.R&&h.d>=M.dIn-.05-1e-9&&h.d<=M.dIn+1.5+1e-9;
try{
  terMarshF=e=>1;
  /* ---- the card ---- */
  ok('the five masteries: Hungry Mouth, Held Open, Torn Through the Stars, No Weight Too Great, The Last Crossing (v473)',SM_D.wormhole.map(x=>x.n).join('|')==='Hungry Mouth|Held Open|Torn Through the Stars|No Weight Too Great|The Last Crossing',SM_D.wormhole.map(x=>x.n).join('|'));
  {const nm=SM_D.wormhole.map(x=>x.n),oth=[];for(const k in SM_D)if(k!=='wormhole')for(const x of SM_D[k])oth.push(x.n);for(const k in SPELLS_S)oth.push(SPELLS_S[k].n);const src=document.documentElement.innerHTML;
    ok('their names are their own (no scroll or other mastery is called so, and no synergy)',nm.every(n=>!oth.includes(n))&&nm.every(n=>src.split("n:'"+n+"'").length===2),nm.filter(n=>oth.includes(n)).join());}
  const d=i=>smDesc('wormhole',i);
  ok('the numbers on the card are the ones in the code (1.6 tiles, 30% wider; 10.5s; 450%, 16 tiles; bosses 5 tiles, slowed 50% 2s; 2.4 tiles, 350%)',
    /1\.6 tiles/.test(d(0))&&/30% wider/.test(d(0))&&/any road/.test(d(0))&&/10\.5s/.test(d(1))&&/9\.2s before/.test(d(1))&&/450%/.test(d(2))&&/400% before/.test(d(2))&&/16 tiles/.test(d(2))&&/13 before/.test(d(2))
    &&/5 tiles/.test(d(3))&&/50% for 2s/.test(d(3))&&/2\.4 tiles/.test(d(4))&&/350%/.test(d(4))&&/300% within 1\.6 before/.test(d(4))
    &&WHM.catchR===1.6&&WHM.LIFE===10.5&&WHM.hit===4.5&&WHM.back===16&&WHM.bossBack===5&&WHM.col===3.5&&WHM.colR===2.4&&WHM.lastR===2.4&&WHL.bossSlow===.5&&WHL.bossSlowT===2,d(4));
  ok('no hooks of their own (the masteries live in the cast); calibrated with hidden factors',!SMF.wormhole.hit&&!SMF.wormhole.cast&&SMA.wormhole.every(x=>x===1)&&SMG.wormhole.length===5&&SMG.wormhole.every(x=>x>=.9&&x<=1.1),SMG.wormhole.join());
  ok('no mastered cast strikes weaker than Mastery 0 (a crossing 400% or 450% times the factor, at least 400%; the last collapse 350% times it, at least 300%)',
    SMG.wormhole.every((g,i)=>(i>=2?4.5:4)*g>=4)&&3.5*SMG.wormhole[4]>=3,SMG.wormhole.map((g,i)=>((i>=2?4.5:4)*g).toFixed(2)).join());
  ok('the defaults table is the old cast (open 9.2s; 400%, 13 tiles back; 300% within 1.6; no reach off its road, bosses only slowed, no last crossing, no sweep; the old looks)',
    WHL.LIFE===9.2&&WHL.dec===9.8&&WHL.hit===4&&WHL.back===13&&WHL.col===3&&WHL.colR===1.6&&!WHL.catchR&&!WHL.bossBack&&!WHL.last&&!WHL.sweep&&WHL.mouthK===1&&WHL.swirl===1&&!WHL.colH&&!WHL.streak&&!WHL.burst&&!WHL.shudder&&!WHL.rush&&WHL.collK===1&&!WHL.log);
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage({n:3});run(.5);
  /* ---- Mastery 0 ---- */
  let M0cr=null;
  {const F=stage(),B=F[2];B.boss=true;const M=mouths(13);WHM.dbg=[];const added=track();wrap();let fx1=0;
    let bEnd=0;try{cast(0,F.slice());run(9.55);fx1=fx.filter(f=>f.whCast).length;run(.15);bEnd=B.dist;settle();}finally{unwrap();}
    const {tc,cr,co}=split(),bad=crossBad(cr.filter(h=>h.e!==B),400,M,()=>M.dOut),win=cr.every(h=>inWin(h,M)),first=cr[0],nb=cr.filter(h=>h.e!==B).length;
    M0cr=cr.map(h=>[enemies.indexOf(h.e),h.amt,+(h.t-T0).toFixed(3)]);
    ok('Mastery 0: every foe on the lead road reaching the first mouth (within it, up to 1.5 tiles in) takes 400% once and comes out of the far one 13 tiles back (within 0.15), on its road, unblocked',
      !bad.length&&win&&nb===8&&cr.length===9,bad.slice(0,4).join(' ')+' '+nb+' crossings, in the mouth '+win);
    ok('Mastery 0: the first goes through as the lead reaches the mouth; none after 8.75s',first&&first.e===M.lead&&first.d<M.dIn-.05+DT+1e-6&&cr.every(h=>h.t-T0<8.75+1e-6),first&&(first.d-M.dIn).toFixed(3));
    const cb=collBad(co,1.6,300);
    ok('Mastery 0: at 8.75s both mouths collapse, 300% to every foe within 1.6 of either, foe by foe',near(tc-T0,8.75,.01)&&sw.length===2&&Math.hypot(sw[0].x-M.pI[0],sw[0].z-M.pI[1])<1e-6&&Math.hypot(sw[1].x-M.pO[0],sw[1].z-M.pO[1])<1e-6&&sw.every(s=>s.R===1.8)&&!cb.bad.length&&cb.n>=2,
      (tc-T0).toFixed(2)+'s '+cb.n+' foes '+cb.bad.slice(0,3).join(' '));
    /* (the boss walks on from where it was struck: half its speed for 2s, then its own, to the end of the trial at 9.7s) */
    const bh=log.filter(h=>h.e===B&&h.t<tc),want=bh.length?bh[0].d+.5*2+(T0+9.7-bh[0].t-2):0;
    ok('Mastery 0: a boss is struck once and slowed 50% for 2s, not moved',bh.length===1&&!land.has(B)&&B.route===ROUTES[0]&&Math.abs(bEnd-want)<.1,bh.length+' strikes, at '+bEnd.toFixed(2)+'/'+want.toFixed(2));
    ok('Mastery 0: no mastery events, no comets or bursts; open 9.6s; nothing left behind',!WHM.dbg.length&&!bursts.length&&!exits.length&&fx1===1&&!fx.some(f=>f.whCast)&&left(added)===0,'left '+left(added));}
  /* the defaults given as options (only a log added) are the same cast */
  {const F=stage(),B=F[2];B.boss=true;WHM.dbg=[];const added=track();wrap();try{setL(0);T0=time;castWormhole(heroU,F.slice(),100,oC(),dbgX());run(9.7);settle();}finally{unwrap();}
    const {cr,co}=split(),L2=cr.map(h=>[enemies.indexOf(h.e),h.amt,+(h.t-T0).toFixed(3)]),cb=collBad(co,1.6,300);
    ok('the defaults as options: the same crossings, foe by foe and frame by frame, as Mastery 0, and the collapse by the same rule; nothing left behind',JSON.stringify(L2)===JSON.stringify(M0cr)&&!cb.bad.length&&ev('cast').length===1&&ev('end').length===1&&left(added)===0,
      L2.length+'/'+M0cr.length+' '+cb.bad.join(' '));}
  /* ---- M1 Hungry Mouth ---- */
  {const F=stage(),M=mouths(13);WHM.dbg=[];const added=track();wrap();let sA=0,sB=0;
    try{cast(1,F.slice());run(3);const G=added.filter(o=>o.isGroup&&o.children.length===6);if(G.length>=2){sA=G[0].scale.x;sB=G[1].scale.x;}run(7);settle();}finally{unwrap();setL(0);}
    const {cr}=split(),bad=crossBad(cr,400,M,()=>M.dOut),c0=ev('cross')[0],dist0=c0&&Math.hypot(log[0].x-M.pI[0],log[0].z-M.pI[1]);
    ok('M1: the first mouth draws in each foe as it comes within 1.6 tiles of it, before it reaches the mouth (400%, once, out of the far one)',c0&&c0.how==='hungry'&&c0.e===M.lead&&dist0<1.6&&log[0].d<M.dIn-.05&&!bad.length&&cr.length>9,
      (dist0||0).toFixed(3)+' tiles off, '+(log[0]?(M.dIn-log[0].d).toFixed(2):'-')+' before it on the road; '+cr.length+' crossings '+bad.slice(0,3).join(' '));
    ok('M1: the first mouth 30% wider than the far one, its shadow too',near(sA/sB,1.3,1e-6),(sA/sB).toFixed(3));
    ok('M1: nothing left behind',left(added)===0,left(added));}
  /* two roads: board 777 at board version 5, where road 2 has joined road 1; the column walks road 2, and foes of road 1 walk among them */
  {const G=[0,1].map(L=>{const F=stage({two:true}),R1=ROUTES[0],O=[0,1,2,3].map(i=>foe(R1,37+2.6-13-3.2+i*.75,-.3)),s0=O.map(e=>e.dist),bk=O[3];const M=mouths(13);
      WHM.dbg=[];const added=track();wrap();let after=null,bkc;
      /* (one of them is blocked by the hero as it goes through: its block set again every frame just before the spell's turn, until it goes) */
      try{cast(L,F.concat(O));for(let i=0;i<44;i++){heroU.cd=1e9;heroU.ko=1e9;update(DT);if(L&&bkc===undefined)bk.blockBy=heroU;updFx(DT);if(L&&bkc===undefined&&ev('cross').some(c=>c.e===bk))bkc=bk.blockBy;}
        after=O.map(e=>[e.route,e.dist]);run(1);var wk=O.map((e,i)=>{const a=after[i],p=posAt(e.dist,ROUTES[1]);return[e.dist-a[1],Math.hypot(e.x-(p[0]+Math.cos(p[2])*e.off),e.z-(p[1]-Math.sin(p[2])*e.off))];}),
          end=O.map(e=>[e.route,e.dist]);run(7);settle();}finally{unwrap();setL(0);}
      return{M,O,s0,end,wk,R0:ROUTES[0],R1:ROUTES[1],bkc,cr:ev('cross').filter(c=>O.includes(c.e)),hits:log.filter(h=>O.includes(h.e)),left:left(added)};});
    const [g0,g1]=G;
    ok('(two roads: road 2 runs on road 1 through the first mouth)',g0.M.R===g0.R1&&g1.M.R===g1.R1&&g0.R0!==g0.R1,g0.M.dIn.toFixed(1));
    ok('two roads, Mastery 0: foes of the other road walk straight through the first mouth, untouched, still on their road',!g0.hits.length&&g0.end.every((q,i)=>q[0]===g0.R0&&Math.abs(q[1]-g0.s0[i]-3.2)<.06)&&g0.end.some(q=>q[1]>g0.M.dIn-13+.5),g0.hits.length+' strikes');
    ok('two roads, M1: they are drawn in too (400% each, once) and come out of the far one on its road (route, place 13 back within 0.15, unblocked)',
      g1.cr.length===4&&g1.cr.every(c=>c.how==='hungry'&&c.r0===g1.R0&&c.r1===g1.R1&&Math.abs(c.d1-g1.M.dOut)<=.15+1e-9&&c.lost>10)&&g1.hits.length===4&&g1.hits.every(h=>h.amt===400)
      &&g1.end.every(q=>q[0]===g1.R1),g1.cr.map(c=>c.d1.toFixed(2)+'/'+c.lost.toFixed(1)).join(' '));
    ok('two roads, M1: a foe blocked by the hero is let go as it goes through',g1.bkc===null&&g1.cr.some(c=>c.e===g1.O[3]),String(g1.bkc));
    const wk=g1.wk;
    ok('two roads, M1: then they walk on along the far mouth\'s road',wk.every(w=>w[0]>.9&&w[0]<1.1&&w[1]<1e-6),wk.map(w=>w[0].toFixed(2)).join());
    ok('two roads, M1: nothing left behind',g0.left===0&&g1.left===0,g0.left+'/'+g1.left);}
  /* never thrown forward: a foe on a road with more of it left than the far mouth's, or on a road to somewhere else, is not drawn in */
  {const F=stage(),M=mouths(13),ux=1,R2=owMakeRoute([[M.pI[0]-2,M.pI[1]],[M.pI[0]+200,M.pI[1]]]),R3=owMakeRoute([[M.pI[0]-2,M.pI[1]+.4],[M.pI[0]+3,M.pI[1]+.4]],{village:{}});
    const X=foe(R2,1.2,0,0),Y=foe(R3,1.3,0,0);WHM.dbg=[];wrap();try{cast(1,F.slice());run(8.5);}finally{unwrap();setL(0);}
    const sk=ev('skip');
    ok('M1: a foe whose road has more of it left than the far mouth\'s (it would come out nearer the end) is not drawn in, nor one on a road to somewhere else; each noted once',
      !log.some(h=>h.e===X||h.e===Y)&&X.route===R2&&Y.route===R3&&near(X.dist,1.2)&&sk.filter(s=>s.e===X).length===1&&sk.filter(s=>s.e===Y).length===1,sk.length+' skipped');}
  /* the first mouth's reach is swept: a foe's way since the last frame, along its road in steps of at most 0.15 tiles */
  {const F=stage(),M=mouths(13),R2=owMakeRoute([[M.pI[0]-10,M.pI[1]+1.3],[M.pI[0]+10,M.pI[1]+1.3]]),R3=owMakeRoute([[M.pI[0]-10,M.pI[1]+1.8],[M.pI[0]+10,M.pI[1]+1.8]]);
    const X=foe(R2,10-1.15,0,0),Y=foe(R3,10-1.15,0,0),e0=[Math.hypot(X.x-M.pI[0],X.z-M.pI[1])];WHM.dbg=[];wrap();
    try{cast(1,F.slice());run(.6);X.dist=10+1.15;moveEnemy(X,0);Y.dist=10+1.15;moveEnemy(Y,0);e0.push(Math.hypot(X.x-M.pI[0],X.z-M.pI[1]));run(.05);}finally{unwrap();setL(0);}
    const cx=ev('cross').find(c=>c.e===X);
    ok('M1: a foe carried past the edge of the mouth\'s reach in one long frame (both ends 1.74 tiles off, its way 1.3 off) is drawn in; one 1.8 off is not',
      e0.every(x=>x>1.6)&&cx&&cx.how==='hungry'&&cx.r1===M.R&&!ev('cross').some(c=>c.e===Y)&&!log.some(h=>h.e===Y),e0.map(x=>x.toFixed(2)).join()+' '+(cx?cx.how:'-'));}
  /* the mouth itself is swept too (every mastered cast): a foe carried right over it in one long frame goes through */
  {const G=[0,1].map(sw1=>{const F=stage({n:1}),M=mouths(13),X=foe(ROUTES[0],M.dIn-3,0,0);WHM.dbg=[];wrap();
      try{setL(0);castWormhole(heroU,F.slice(),100,oC(),dbgX(sw1?{sweep:1}:{}));run(.6);X.dist=M.dIn-.5;moveEnemy(X,0);run(.05);X.dist=M.dIn+1.7;moveEnemy(X,0);run(.05);}finally{unwrap();}
      return{c:ev('cross').find(c=>c.e===X),h:log.filter(h=>h.e===X)};});
    ok('every mastered cast: a foe carried right over the first mouth in one long frame (from 0.5 before it to 1.7 in) goes through; the old cast misses it',
      G[1].c&&G[1].c.how==='swept'&&G[1].h.length===1&&!G[0].c&&!G[0].h.length&&whmOpts({L:1,a:[1,1,1,1,1]}).sweep===1,(G[1].c?G[1].c.how:'-')+' / '+(G[0].c?'caught':'missed'));}
  /* ---- M2 Held Open ---- */
  {const G=[1,2].map(L=>{const F=stage(),M=mouths(13);WHM.dbg=[];const added=track();wrap();let st=0,col=null,fxE=0;
      try{SPACE_T=0;cast(L,F.slice());st=SPACE_T;var t0=T0;run(1);for(const o of added)o.traverse&&o.traverse(m=>{if(m.isMesh&&m.geometry&&m.geometry.type==='CylinderGeometry'&&m.geometry.parameters.openEnded&&!col){m.geometry.computeBoundingBox();const b=m.geometry.boundingBox,c=m.geometry.attributes.color;col=[b.max.y-b.min.y,!!c,c?c.getX(0):-1,c?c.getX(c.count-1):-1,!!m.material.vertexColors];}});
        run(9.8);fxE=fx.filter(f=>f.whCast).length;run(.3);var fxN=fx.filter(f=>f.whCast).length;settle();}finally{unwrap();setL(0);}
      const {tc,cr}=split();return{t0,M,tc,cr,st,col,fxE,fxN,left:left(added),bad:crossBad(cr,400,M,()=>M.dOut)};});
    const [g1,g2]=G,late=g2.cr.filter(h=>h.t-g2.t0>8.75);
    ok('M2: the mouths stay open 10.5s: foes keep going through until 10.05s (at Mastery 1, none after 8.75s), then they collapse',near(g2.tc-g2.t0,10.05,.01)&&late.length>=2&&g2.cr.every(h=>h.t-g2.t0<10.05+1e-6)&&!g2.bad.length&&g1.cr.every(h=>h.t-g1.t0<8.75+1e-6)&&near(g1.tc-g1.t0,8.75,.01),
      late.length+' after 8.75s, collapse at '+(g2.tc-g2.t0).toFixed(2)+'s');
    ok('M2: the cast ends at 10.9s (9.6s before)',g2.fxE===1&&g2.fxN===0&&g2.left===0,g2.fxE+'/'+g2.fxN);
    ok('M2: the Calm space setting covers the longer opening (11.8s; 10.5s before)',near(g2.st,11.8,1e-6)&&near(g1.st,10.5,1e-6),g2.st.toFixed(2)+' / '+g1.st.toFixed(2));
    ok('M2: the columns of light rise taller (3.6 tiles, 2.4 before), fading out above the old height',g2.col&&near(g2.col[0],3.6,1e-6)&&g2.col[1]&&g2.col[4]&&g2.col[2]+g2.col[3]>.99&&Math.min(g2.col[2],g2.col[3])<1e-6&&g1.col&&near(g1.col[0],2.4,1e-6)&&!g1.col[1],JSON.stringify(g2.col)+' '+JSON.stringify(g1.col));}
  /* ---- M3 Torn Through the Stars ---- */
  {const G=[2,3].map(L=>{const F=stage(),B=F[2];B.boss=true;const M=mouths(L>=3?16:13);WHM.dbg=[];const added=track();wrap();const com=new Set();
      try{cast(L,F.slice());run(10.5,()=>{for(const o of added)if(o.isGroup&&o.parent)for(const c of o.children)if(c.isGroup&&c.children[0]&&c.children[0].material&&c.children[0].material.fragmentShader===WH_COM_FS)com.add(c);});settle();}finally{unwrap();setL(0);}
      const {cr,co}=split();return{M,B,cr,co,com:com.size,bur:bursts.slice(),left:left(added),bad:crossBad(cr.filter(h=>h.e!==B),L>=3?450:400,M,()=>M.dOut)};});
    const [g2,g3]=G,nb=g3.cr.filter(h=>h.e!==g3.B);
    ok('M3: every foe that goes through takes 450% (400% before) and comes out 16 tiles back (13 before), the far mouth there',!g3.bad.length&&!g2.bad.length&&nb.length>=10&&Math.hypot(sw[1].x-g3.M.pO[0],sw[1].z-g3.M.pO[1])<1e-6,g3.bad.slice(0,3).join(' ')+' '+nb.length);
    ok('M3: a comet of light runs the arc with each crossing, and a wall of light rises at each exit (none at Mastery 2)',g3.com===nb.length&&g3.bur.length===nb.length&&g3.bur.every((b,i)=>b.R===.75)&&!g2.com&&!g2.bur.length,g3.com+' comets, '+g3.bur.length+' bursts, '+nb.length+' crossings');
    const bh=g3.cr.filter(h=>h.e===g3.B);
    ok('M3: a boss is still only slowed, not moved (struck once)',bh.length===1&&!land.has(g3.B),bh.length);
    ok('M3: nothing left behind',g2.left===0&&g3.left===0,g2.left+'/'+g3.left);}
  /* ---- M4 No Weight Too Great ---- */
  {const F=stage(),B=F[2];B.boss=true;B.unstopT=8;B.rsv=RSV.capB;const M=mouths(16);WHM.dbg=[];const added=track();wrap();let A=null,dev=[],bl=null,bdist=[];
    try{cast(4,F.slice());A=added.find(o=>o.isGroup&&o.children.length===6&&Math.hypot(o.position.x-M.pI[0],o.position.z-M.pI[1])<1e-6);
      run(10.5,()=>{if(A)dev.push(Math.hypot(A.position.x-M.pI[0],A.position.z-M.pI[1]));if(land.has(B)&&!bl)bl={t:time,slow:B.slow,slowT:B.slowT};bdist.push(B.dist);});settle();}finally{unwrap();setL(0);}
    const bh=log.filter(h=>h.e===B&&h.amt===450),L=land.get(B),c=ev('cross').find(q=>q.e===B),i0=bl?Math.round((bl.t-T0)/DT)-1:0;
    ok('M4: a boss goes through too (450%, once), coming out 5 tiles behind the first mouth (within 0.15), on its road, unblocked, though it is Unstoppable',
      bh.length===1&&L&&Math.abs(L.d-(M.dIn-5))<=.15+1e-9&&L.rt===M.R&&!L.blk&&c&&c.boss,L&&(L.d-M.dIn).toFixed(2));
    ok('M4: still slowed 50% for 2s as it comes out',bl&&bl.slow===.5&&near(bl.slowT,2,1e-6),bl&&(bl.slow+'/'+bl.slowT));
    ok('M4: only once a cast: walking back into the mouth, it is not taken again',bh.length===1&&ev('cross').filter(q=>q.e===B).length===1&&Math.max(...bdist.slice(i0+1))>M.dIn-1.6,'reached '+Math.max(...bdist.slice(i0+1)).toFixed(2)+' / mouth '+M.dIn.toFixed(2));
    const after=dev.slice(i0+1,i0+12),late=dev.slice(i0+20,i0+40);
    ok('M4: the first mouth shudders as it goes through (a little, briefly), and a small far mouth flickers where it comes out',A&&after.some(x=>x>1e-4)&&after.every(x=>x<.1)&&late.every(x=>x<1e-9)&&exits.length===1&&L&&Math.hypot(exits[0].x-L.x,exits[0].z-L.z)<1e-6,
      after.map(x=>x.toFixed(3)).slice(0,5).join()+' exits '+exits.length);
    ok('M4: the other foes as before (450%, 16 tiles back), nothing left behind',!crossBad(log.filter(h=>h.e!==B&&h.t<split().tc),450,M,()=>M.dOut).length&&left(added)===0,left(added));}
  /* ---- M5 The Last Crossing ---- */
  {const F=stage({n:18}),M=mouths(16),Q=F[0];WHM.dbg=[];const added=track();wrap();const com=new Set();let wasS=null,qEnd=0;
    try{cast(5,F.slice());run(9.9,()=>{for(const o of added)if(o.isGroup&&o.parent)for(const c of o.children)if(c.isGroup&&c.children[0]&&c.children[0].material&&c.children[0].material.fragmentShader===WH_COM_FS)com.add(c);});
      /* the lead, sent long ago, stands back by the first mouth when it closes: it is not taken again */
      wasS=ev('cross').some(c=>c.e===Q);Q.dist=M.dIn-2.1;moveEnemy(Q,0);
      run(1.2,()=>{for(const o of added)if(o.isGroup&&o.parent)for(const c of o.children)if(c.isGroup&&c.children[0]&&c.children[0].material&&c.children[0].material.fragmentShader===WH_COM_FS)com.add(c);});qEnd=Q.dist;settle();}finally{unwrap();setL(0);}
    const {tc,cr,co}=split(),la=ev('cross').filter(c=>c.how==='last'),snapA=sw[0]?sw[0].snap:[],before=ev('cross').filter(c=>c.how!=='last'),lst=ev('last')[0];
    ok('M5: as the mouths close (10.05s), the first swallows the foes within 2.4 tiles of it not yet sent and throws them out of the far one (within 0.15), with no crossing strike of their own',
      lst&&near(tc-T0,10.05,.01)&&la.length>=1&&la.length===lst.n&&la.every(c=>Math.abs(c.d1-M.dOut)<=.15+1e-9&&c.r1===M.R&&!before.some(b=>b.e===c.e))&&!cr.some(h=>la.some(c=>c.e===h.e)),la.length+' swallowed');
    ok('M5: (every foe left within 2.4 of the first mouth when it closed was swallowed)',snapA.every(([q,x,z])=>(x-M.pI[0])**2+(z-M.pI[1])**2>=2.4*2.4||before.some(b=>b.e===q)||la.some(c=>c.e===q)),snapA.length);
    ok('M5: a foe sent before is not taken again, though it stands by the first mouth as it closes',wasS&&ev('cross').filter(c=>c.e===Q).length===1&&Q.route===M.R&&qEnd>M.dIn-2.5,String(wasS)+' '+qEnd.toFixed(2));
    const cb=collBad(co,2.4,350);
    ok('M5: then both collapse for 350% (300% before) within 2.4 tiles of either (1.6 before), foe by foe, the swallowed foes among them',!cb.bad.length&&la.every(c=>co.some(h=>h.e===c.e&&h.amt===350))&&sw.length===2&&sw.every(s=>near(s.R,2.7,1e-9)),cb.n+' foes '+cb.bad.slice(0,3).join(' '));
    ok('M5: a rush of streaks across the stars (a comet for each foe swallowed and five more) and a wall of light racing out to 2.4 at each mouth',com.size===before.length+la.length+5&&bursts.filter(b=>Math.abs(b.t-tc)<1e-9&&b.R===2.4).length===2,com.size+' comets, '+before.length+'+'+la.length+'+5');
    ok('M5: nothing left behind; the sky clears',left(added)===0&&darkTarget===0,left(added));}
  /* ---- the rest ---- */
  {const F=stage(),M=mouths(13);WHM.dbg=[];setL(5);wrap();try{T0=time;castScrollNow('wormhole',heroU,heroStats(),F.slice(),100,oC({smx:true}));run(9.7);}finally{unwrap();setL(0);}
    const {cr}=split();
    ok('casts that are not a mastered scroll cast (an echo) are the old cast',!WHM.dbg.length&&!crossBad(cr,400,M,()=>M.dOut).length&&cr.length===9,cr.length);}
  {const e0=errs;const bad=[];KO=false;for(let L=0;L<=5;L++){const F=stage();meta.spells.wormhole=meta.spells.wormhole||{lvl:1,hero:null};setL(L);const lv=meta.spells.wormhole.lvl||1,P=scrollPow(heroU,'wormhole',tStats(heroU),lv);
      heroU.scd={};heroU.gcd=0;WHM.dbg=[];log=[];hurt=function(e,amt,kind,o){if(o&&o.spell==='wormhole')log.push({e,amt});return H0.apply(this,arguments);};try{fireScroll(heroU,'wormhole',heroStats(),F.slice());run(12.5);}finally{hurt=H0;}
      const o=ev('opts')[0],k=L>=3?4.5:4,nl=log.filter(h=>near(h.amt,P*k)).length;if((L?!o||o.L!==L:!!o)||nl<5||(L===5)!==!!ev('last').length)bad.push(L+':'+(o?o.L:'-')+'/'+(P/100).toFixed(3)+'/'+nl);}setL(0);KO=true;
    ok('the real cast path at every mastery (the masteries arrive; each crossing strikes 400% or 450% of the power with the factor; the last crossing at Mastery 5) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  {const bf=SMPV_BUSY.find(f=>/whCast/.test(String(f)));let all='';const G=[0,2].map(L=>{const F=stage();const busy=[];try{cast(L,F.slice());for(let i=0;i<24;i++){run(.5);busy.push([cineLock>0?1:0,bf&&bf()?1:0]);if(i===9)all+=SMPV_BUSY.map(f=>{try{return f()?1:0;}catch(e){return 'E';}}).join('')+' ';}}finally{setL(0);}return busy;});
    /* (cineLock wears off in anim, which these steps leave out: the cast sets it to 3s, and the preview's own test is checked past that) */
    ok('the mastery preview waits for a Wormhole while it is open, past its cineLock (3s): 9.6s, 10.9s from Held Open',bf&&G.every((b,j)=>b[9][1]===1&&b[17][1]===1&&b[23][1]===0&&b[j?20:19][1]===(j?1:0)),G.map(b=>b.map(x=>x[1]).join('')).join(' / ')+' all at 5s: '+all);}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;unwrap();terMarshF=TM0;KO=true;WHM.dbg=null;window.__fz=false;try{if(heroU)heroU.ko=0;for(const f of fx.slice())f.life=0;updFx(.01);resetCine();SPACE_T=0;CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;darkTarget=0;vigTarget=0;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
