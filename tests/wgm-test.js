(function(){
/* Wrath of Gaia's masteries (v455). Run on the dev page: __kk.ev(await (await fetch('/tests/wgm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road (or far off it, to walk in later); the game is stepped (update and updFx), and hurt and stunE are wrapped to log
   the amount and the hold each call asks for (the scroll's power is 100: a tree strikes 500, 650 with Heartwood; the shed 300, 375 with Return
   to the Earth; the drag 150). natTree is wrapped to note where each tree rises, so which foe a tree can reach is checked exactly (the foes
   stand still). A foe "out of the forest's reach" stands 60 tiles off its road (its lane offset) until it is put back on the road. Every mastered forest logs its events (WGM.dbg: each strike, stand, drag, the shed and the finale). Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,ST0=stunE,NT0=natTree;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{paused=false;for(let i=0;i<Math.round(s/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;NAT.zones.length=0;NAT.pollen.length=0;};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(meta.arts&&meta.arts.eq&&heroU)meta.arts.eq[heroU.hero]=[null,null,null];if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;ART_V++;AS.k=null;if(typeof asEl==='function')asEl();}
function foe(d,o){o=o||{};const R=ROUTES[o.rt||0];spawnEnemy({type:o.type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.3,Math.min(R.len-.3,d));e.off=o.off||0;e.ox=o.ox||0;e.oz=0;
  e.spd=0;e.hp=e.maxHp=o.hp||1e7;e.armor=0;e.res={};e.shield=0;if(o.boss)e.boss=true;if(o.fly)e.fly=true;moveEnemy(e,0);return e;}
/* a crowd spread along the first road, a little off its centre either side */
const crowd=(n,o)=>{const R=ROUTES[0],F=[];for(let i=0;i<n;i++)F.push(foe(1.5+i*(R.len-3)/n,Object.assign({off:((i%5)-2)*.12},o||{})));return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.gaia=SM_XP[L-1];else delete meta.smast.gaia;};
const oG=()=>({src:heroU,bane:0,el:'nature',anc:false,spell:'gaia'});
const cast=L=>{setL(L);meta.spells.gaia=meta.spells.gaia||{lvl:1,hero:null};castScrollNow('gaia',heroU,tStats(heroU),enemies.filter(e=>!e.dead),100,oG());};
let log=[],holds=[],SP=null;
const wrap=()=>{log=[];holds=[];hurt=function(e,amt,kind,o){log.push({e,amt,sp:!!(o&&o.spell==='gaia'),t:time});return H0.apply(this,arguments);};stunE=function(e,sec){holds.push({e,sec,t:time});return ST0.apply(this,arguments);};
  SP=[];natTree=function(x,z,s){const g=NT0.apply(this,arguments);SP.push({x,z,s,g});return g;};};
const unwrap=()=>{hurt=H0;stunE=ST0;natTree=NT0;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>(WGM.dbg||[]).filter(d=>d.ev===n);
const hits=(e,amt)=>log.filter(h=>h.e===e&&h.sp&&near(h.amt,amt));
const md=e=>{let m=1e9;for(const q of SP)m=Math.min(m,(e.x-q.x)**2+(e.z-q.z)**2);return Math.sqrt(m);};
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const left=added=>added.filter(o=>{if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const drew=()=>{renderer.render(scene,camera);return renderer.info.render.calls;};
try{
  /* ---- the card ---- */
  ok('the five masteries: Heartwood, Rooted Fast, The Forest Stands, The Keep Drinks Deep, Return to the Earth (v455)',SM_D.gaia.map(x=>x.n).join('|')==='Heartwood|Rooted Fast|The Forest Stands|The Keep Drinks Deep|Return to the Earth',SM_D.gaia.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (650%, 1.05 tiles; 1.6s / 0.6s, Held 2.1s; 3 lives; 375%, 150%, 0.5s)',
    /650%/.test(smDesc('gaia',0))&&/1\.05 tiles/.test(smDesc('gaia',0))&&/1\.6s/.test(smDesc('gaia',1))&&/0\.6s/.test(smDesc('gaia',1))&&/2\.1s/.test(smDesc('gaia',1))&&/3 lives/.test(smDesc('gaia',3))
    &&/375%/.test(smDesc('gaia',4))&&/150%/.test(smDesc('gaia',4))&&/0\.5s/.test(smDesc('gaia',4))
    &&WGM.strike===6.5&&WGM.reach===1.05&&WGM.pin===1.6&&WGM.pinB===.6&&WGM.held===2.1&&WGM.mend===3&&WGM.fin===3.75&&WGM.drag===1.5&&WGM.dragPin===.5);
  ok('the old masteries are gone (no Thorned Bark, Pollen Storm, Blossoms, Strangling Roots or Heart of the Forest hooks); calibrated with hidden factors',
    !SMF.gaia.hit&&!SMF.gaia.cast&&SMA.gaia.every(x=>x===1)&&SMG.gaia.length===5&&SMG.gaia.every(x=>x>=.9&&x<=1.1),SMG.gaia.join());
  /* ---- Mastery 0 ---- */
  /* the forest's own defaults, given as options (only a hook that notes the spots), are the same cast */
  {go();const F=crowd(14).concat([foe(9,{off:.98}),foe(14,{off:-1.02}),foe(20,{off:.95}),foe(6,{off:60})]);F[3].boss=true;lives=Math.max(1,keepMax()-5);const l0=lives;wrap();
    try{setL(0);castGaia(heroU,100,oG(),{fx:()=>({})});run(7.5);}finally{unwrap();}
    const st=F.filter(e=>hits(e,500).length),far=F.filter(e=>md(e)>.9);
    ok('the defaults: a tree strikes every foe within 0.9 tiles of it, once (500%), and no other',F.every(e=>hits(e,500).length===(md(e)<=.9?1:0))&&far.length>=2,st.length+' struck, '+far.length+' out of reach');
    ok('the defaults: every foe takes the shed once (300%), the keep mends 2',F.every(e=>hits(e,300).length===1)&&lives===l0+2&&!log.some(h=>near(h.amt,650)||near(h.amt,375)||near(h.amt,150)),lives-l0);
    ok('the defaults: pinned 1s (a boss 0.4s), Resolve applying (stunE)',holds.length===st.length&&holds.every(h=>near(h.sec,h.e.boss?.4:1)),holds.map(h=>h.sec).join(','));}
  {go();const F=crowd(14).concat([foe(9,{off:.98}),foe(14,{off:-1.02})]);lives=Math.max(1,keepMax()-5);const l0=lives;WGM.dbg=[];wrap();let mxH=0;
    try{cast(0);for(let i=0;i<150;i++){run(.05);for(const e of F)mxH=Math.max(mxH,e.heldT||0);}}finally{unwrap();}
    ok('Mastery 0: the old forest (500% to the foes within 0.9 tiles, once; 300% to every foe; Held 1.5s; the keep mends 2)',F.every(e=>hits(e,500).length===(md(e)<=.9?1:0)&&hits(e,300).length===1)&&lives===l0+2&&near(mxH,1.5,.05),mxH.toFixed(2)+' '+(lives-l0));
    ok('Mastery 0: no mastery events',!WGM.dbg.length);}
  /* ---- M1 Heartwood ---- */
  {go();const F=crowd(14).concat(Array.from({length:18},(_,i)=>foe(3+i*1.05,{off:(i%2?1:-1)*(.93+(i%4)*.035)})),[foe(6,{off:60})]);WGM.dbg=[];wrap();try{cast(1);run(7.5);}finally{unwrap();setL(0);}
    const mid=F.filter(e=>md(e)>.9&&md(e)<=1.05),S=ev('strike');
    ok('M1: each tree strikes for 650% the foes within 1.05 tiles of it (0.9 before), once',F.every(e=>hits(e,650).length===(md(e)<=1.05?1:0))&&!log.some(h=>near(h.amt,500))&&mid.length>=1&&mid.every(e=>hits(e,650).length===1),
      mid.length+' between 0.9 and 1.05 tiles; '+S.length+' strikes');
    ok('M1: every strike comes from a tree within reach',S.length&&S.every(d=>(d.e.x-d.q.x)**2+(d.e.z-d.q.z)**2<=1.05*1.05+1e-9));
    const X=ev('opts')[0].X;ok('M1: the trees pop up harder and the earth bursts wider (no taller trees)',X.ovP>GAIAD.ovP&&X.bC>GAIAD.bC&&X.bH>1&&X.bN>GAIAD.bN&&X.motes>GAIAD.motes&&!X.roots&&SP.every(q=>q.s<=1.3+1e-9));
    ok('M1: no other change (pinned 1s, the shed 300%, the keep mends 2, no foe struck walking in)',holds.every(h=>near(h.sec,1))&&F.every(e=>hits(e,300).length===1)&&!ev('stand').length&&ev('fin')[0].n===F.length);}
  /* ---- M2 Rooted Fast ---- */
  {go();const F=crowd(12);F[2].boss=true;F[7].boss=true;WGM.dbg=[];wrap();let mxH=0;try{cast(2);for(let i=0;i<150;i++){run(.05);for(const e of F)mxH=Math.max(mxH,e.heldT||0);}}finally{unwrap();setL(0);}
    ok('M2: foes are pinned 1.6s, bosses 0.6s (1s and 0.4s before), through stunE (Resolve applies)',holds.length===F.length&&holds.every(h=>near(h.sec,h.e.boss?.6:1.6)),holds.map(h=>h.sec).join(','));
    ok('M2: and Held 2.1s (1.5s before)',near(mxH,2.1,.05),mxH.toFixed(2));
    {const X=ev('opts')[0].X,F2=nfxKit(),roots=R=>{const n=[];for(let i=0;i<40;i++){const g=nfxTreeRaw(heroU.x,heroU.z,1,R);n.push(g.children.filter(m=>m.geometry===F2.coneS).length);}return n;},a=roots(null),b=roots(X.roots);
     ok('M2: five thick roots splay from every trunk, birches too (three thin ones before, none on a birch), the ground darker (0.75)',X.roots&&X.roots.n===5&&X.roots.sx>1.2&&X.roots.sy>1&&a.every(n=>n===3||n===0)&&a.includes(0)&&b.every(n=>n===5)&&X.decal===.75,a.join('')+' -> '+b.join(''));
     const g=natTree(heroU.x,heroU.z,1,X.roots),one=g.children.length===1&&!!g.children[0].geometry.attributes.color;scene.remove(g);g.userData.geo.dispose();ok('M2: and each tree is still one vertex-coloured mesh',one);}}
  /* ---- M3 The Forest Stands ---- */
  {go();const F=crowd(10),W=foe(12,{off:60}),W2=foe(17,{off:60}),Z=foe(15,{off:60}),U=F[3];F.push(W,W2,Z);WGM.dbg=[];wrap();let popS=0;
    try{cast(3);run(4.4);ok('M3: the foes out of the forest\'s reach stood untouched while it rose',!hits(W,650).length&&!hits(W2,650).length&&!hits(Z,650).length&&hits(U,650).length===1);
      const t0=time;W.off=0;moveEnemy(W,0);U.dist=Math.min(ROUTES[0].len-1,U.dist+6);moveEnemy(U,0);run(.1);
      const s=ev('stand').find(d=>d.e===W);if(s&&s.q.g)popS=s.q.g.scale.x/s.q.s;
      ok('M3: a foe that walks into a standing tree\'s reach is struck by it: the same 650% and 1.6s pin',s&&hits(W,650).length===1&&holds.some(h=>h.e===W&&near(h.sec,1.6)&&h.t>=t0),s?(s.e.x-s.q.x).toFixed(2)+','+(s.e.z-s.q.z).toFixed(2):'none');
      ok('M3: that tree replays its rise pop (it swells past its size)',popS>1.02,popS.toFixed(3));
      ok('M3: once per foe: a foe struck as the forest rose is not struck again by another tree',hits(U,650).length===1&&!ev('stand').some(d=>d.e===U));
      run(1.3);Z.off=0;moveEnemy(Z,0);run(.3);
      ok('M3: until it sheds: a foe walking in after the leaves fall is not struck',!hits(Z,650).length&&!ev('stand').some(d=>d.e===Z));
      W2.off=0;moveEnemy(W2,0);run(.2);ok('M3: (nor one walking in as the forest sinks)',!hits(W2,650).length);run(2);}finally{unwrap();setL(0);}
    ok('M3: the leaves fall twice as thick (a leaf every 0.06s, 0.12s before)',ev('opts')[0].X.leafT===.06&&GAIAD.leafT===.12);}
  {go();const F=crowd(8),W=foe(12,{off:60});WGM.dbg=[];wrap();try{cast(2);run(4.4);W.off=0;moveEnemy(W,0);run(.4);}finally{unwrap();setL(0);}run(3);
    ok('M3 needs Mastery 3 (at Mastery 2 a foe walking in is not struck)',!hits(W,650).length&&!ev('stand').length);}
  /* ---- M4 The Keep Drinks Deep ---- */
  {go();crowd(6);lives=Math.max(1,keepMax()-6);const l0=lives;WGM.dbg=[];const added=track();let col=null;wrap();try{cast(4);col=added.find(o=>o.isMesh&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.height===12);run(7.5);}finally{unwrap();scene.add=S0;setL(0);}
    ok('M4: the keep mends 3 lives (2 before)',lives===l0+3&&ev('fin')[0].mend===3,lives-l0);
    ok('M4: the green column at the keep rises twice as tall (12, 6 before), fading toward its top',!!col&&!!col.geometry.attributes.color&&col.material.vertexColors===true);}
  {go();crowd(6);lives=Math.max(1,keepMax()-6);const l0=lives;cast(3);run(7.5);setL(0);ok('M4 needs Mastery 4 (2 lives at Mastery 3)',lives===l0+2,lives-l0);}
  /* ---- M5 Return to the Earth ---- */
  {go();const F=crowd(14),B=F[4],Y=F[9],far=foe(8,{off:60});B.boss=true;Y.fly=true;F.push(far);WGM.dbg=[];const added=track();let sunk=null,ims=null,cM5=0;wrap();
    try{cast(5);run(5.7);const fe=ev('fin')[0];run(.3);ims=added.filter(o=>o.isGroup).flatMap(o=>o.children.filter(c=>c.isInstancedMesh));cM5=drew();run(.25);
      sunk=SP.every(q=>q.g.position.y<=gy(q.x,q.z)-1.8*q.s+1e-6);run(6);
      const sh=ev('shed')[0],D=ev('drag');
      ok('M5: every tree sheds (every second tree before), five leaves each',sh&&sh.trees===sh.of&&sh.trees===SP.length&&sh.n===5*sh.trees,sh?sh.trees+' of '+sh.of+' trees, '+sh.n+' leaves':'none');
      ok('M5: the shed strikes every foe for 375% (300% before), once',F.every(e=>hits(e,375).length===1)&&!log.some(h=>near(h.amt,300))&&fe&&fe.n===F.length);
      ok('M5: as the forest sinks each tree drags the ground foes in its reach down with it: 150%, once per foe',F.filter(e=>e!==Y&&e!==far).every(e=>hits(e,150).length===1)&&D.length===F.length-2&&D.every(d=>(d.e.x-d.q.x)**2+(d.e.z-d.q.z)**2<=1.05*1.05+1e-9),D.length);
      ok('M5: not a flyer, nor a foe out of the forest\'s reach',!hits(Y,150).length&&!hits(far,150).length&&hits(far,375).length===1);
      const dh=holds.filter(h=>h.t>=fe.t+.1);ok('M5: the drag pins 0.5s (a boss 0.2s) through stunE',dh.length===F.length-2&&dh.every(h=>near(h.sec,h.e.boss?.2:.5)),dh.map(h=>h.sec).join(','));
      ok('M5: the drag comes as the forest sinks (0.15s after the shed)',D.length&&D.every(d=>near(d.t-fe.t,.15,.06)),D.length?(D[0].t-fe.t).toFixed(2):'');
      const leaves=ims.filter(m=>m.geometry===natKit().leafG||m.geometry===natKit().petG).reduce((a,m)=>a+m.count,0),earth=ims.filter(m=>m.geometry===nfxKit().moundG);
      ok('M5: the storm of leaves and the burst of earth at every trunk are drawn in batches (a few instanced meshes for the whole forest)',ims.length<=8&&leaves===sh.n&&earth.length===3&&earth.some(m=>m.count===sh.trees)&&earth.every(m=>m.count>=sh.trees),
        ims.length+' batches, '+leaves+' leaves, earth '+earth.map(m=>m.count).join('/'));
      ok('M5: the forest sinks heavier and faster: all the way under by 0.6s after the shed (0.9s and part way before)',sunk===true);}finally{unwrap();scene.add=S0;setL(0);}
    ok('M5: Masteries 1-4 ride it (650% strikes within 1.05 tiles, 1.6s pins, the walking-in strike, 3 lives)',ev('opts')[0].X.STRIKE===6.5&&ev('opts')[0].X.REACH===1.05&&ev('opts')[0].X.STUN===1.6&&ev('opts')[0].X.stand===1&&ev('opts')[0].X.MEND===3&&F.filter(e=>md(e)<=1.05).every(e=>hits(e,650).length===1));
    ok('M5: nothing is left behind',left(added)===0,left(added)+' of '+added.length);}
  {go();const F=crowd(10);WGM.dbg=[];wrap();try{cast(4);run(8);}finally{unwrap();setL(0);}
    ok('M5 needs Mastery 5 (at Mastery 4: every second tree sheds, 300%, no drag)',!ev('drag').length&&F.every(e=>hits(e,300).length===1&&!hits(e,150).length&&!hits(e,375).length));}
  /* ---- World Root, other casters, the cost ---- */
  {go();const F=crowd(8);WGM.dbg=[];ANC.live.firsttree=true;wrap();try{cast(5);}finally{ANC.live.firsttree=false;}try{run(7.5);}finally{unwrap();setL(0);}
    ok('World Root still doubles every strike, the shed and the drag (1300%, 750%, 300%)',F.every(e=>hits(e,750).length===1&&hits(e,300).length===1&&hits(e,1300).length===(md(e)<=1.05?1:0))&&F.some(e=>hits(e,1300).length),F.filter(e=>hits(e,1300).length).length);}
  {go();const F=crowd(8);WGM.dbg=[];setL(5);wrap();try{NSP.gaia(heroU,tStats(heroU),enemies.filter(e=>!e.dead),100,{src:heroU,el:'nature',spell:'gaia'});run(7.5);}finally{unwrap();setL(0);}
    ok('casts that are not a mastered scroll cast are the old forest',!WGM.dbg.length&&F.every(e=>hits(e,300).length===1&&hits(e,500).length===(md(e)<=.9?1:0)));}
  /* the draw calls: at the natfx check (1.6s after the cast) and as the forest sheds (the storm is batched, so Mastery 5 costs less there) */
  {const calls={};for(const L of [0,5]){go();crowd(8);run(.2);const c0=drew();setL(L);cast(L);run(1.6);const a=drew()-c0;run(4.1);const b=drew()-c0;run(3);setL(0);calls['M'+L]=[a,b];}
    ok('the draw calls stay in natfx\'s budget at Mastery 5 (at most 170 at 1.6s), and the shed costs fewer at Mastery 5 than at Mastery 0',calls.M5[0]<=170&&calls.M5[1]<calls.M0[1],JSON.stringify(calls));}
  {const e0=errs,bad=[];for(let L=1;L<=5;L++){go();const F=crowd(10,{hp:60});heroU.scd={};heroU.gcd=0;setL(L);meta.spells.gaia=meta.spells.gaia||{lvl:1,hero:null};WGM.dbg=[];state='playing';
      fireScroll(heroU,'gaia',tStats(heroU),F.slice());run(9);const o=ev('opts')[0];if(!o||o.L!==L||F.some(e=>!e.dead))bad.push(L+':'+(o?o.L:'-')+'/'+F.filter(e=>!e.dead).length);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive, every foe dies) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;unwrap();scene.add=S0;WGM.dbg=null;try{ANC.live.firsttree=false;resetCine();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
