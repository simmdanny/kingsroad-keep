(function(){
/* Infinite Void's masteries (v461). Run on the dev page: __kk.ev(await (await fetch('/tests/ivm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand (or walk) on the road; the game is stepped (update and updFx, 0.05s). hurt is wrapped to log what each foe took and from which
   part of a cut: the cut's share of the power (the cast's own options, the power is 100), its share of max health ({src} only) and an
   erasure (the cast's options with noReact). The domain's own events (IVM.dbg) say which cut each pair of hurts belongs to, so every cut is
   checked exactly at every mastery; Mastery 0 (which logs nothing) is checked by the amounts alone. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,DB0=IVM.dbg;
/* (the equipped hero's aura explosion, a chance roll for each foe slain near him, is off: its blasts would land between a cut's hurts) */
const AU=AURA[meta.equipped],AB0=AU&&AU.boom;if(AU)AU.boom=0;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
let onStep=null,TT=0,t0=0;const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);TT+=.05;if(onStep)onStep(TT-t0);}};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const END=24,ACT=4,G=L=>L?SMG.expanse[L-1]:1;
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;cineLock=0;resetCine();
  DOM.f=1;DOM.live=null;meta.smast=meta.smast||{};delete meta.smast.expanse;return ROUTES[0];}
function foe(R,d,hp){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d;e.off=0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
/* n foes 0.35 apart from 3 tiles along the road; low: that many of them (every second one) are left just above the erasure line; boss: the
   last of them is a boss (1: with as little health, 2: a sturdy one); walk: they walk at 0.7 */
const stage=(n,o)=>{o=o||{};const R=go(),F=[];for(let i=0;i<n;i++){const e=foe(R,3+i*.35);if(o.walk)e.spd=.7;F.push(e);}
  let k=0;if(o.low)for(let i=1;i<F.length&&k<o.low;i+=2,k++){F[i].maxHp=2000;F[i].hp=330;}
  if(o.boss){const b=F[F.length-1];b.boss=true;if(o.boss===1){b.maxHp=2000;b.hp=330;}}return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.expanse=SM_XP[L-1];else delete meta.smast.expanse;};
const oV=()=>({src:heroU,bane:0,el:'light',anc:true,spell:'expanse'});
let HL=[];
const wrap=()=>{HL=[];hurt=function(e,amt,kind,o){if(o&&o.spell==='expanse')HL.push({e,amt,k:o.noReact?'kill':'pw',t:TT-t0,max:e.maxHp,boss:!!e.boss});
  else if(o&&o.src===heroU&&!o.spell)HL.push({e,amt,k:'hp',t:TT-t0,max:e.maxHp,boss:!!e.boss});return H0.apply(this,arguments);};};
const unwrap=()=>{hurt=H0;onStep=null;};
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
/* the domain's log, noting where each event falls in the hurt log, and for a ground cut the foes within its reach of its line */
const segD=(e,a,b)=>{const ax=b[0]-a[0],az=b[1]-a[1],L2=ax*ax+az*az||1;let u=((e.x-a[0])*ax+(e.z-a[1])*az)/L2;u=Math.max(0,Math.min(1,u));return Math.hypot(a[0]+ax*u-e.x,a[1]+az*u-e.z);};
const mkDbg=()=>{const A=[];A.push=function(d){d.h=HL.length;d.T=TT-t0;if(d.ev==='cut'&&d.k==='ground')d.want=enemies.filter(e=>!e.dead&&e.g&&e.g.visible!==false&&segD(e,d.a,d.b)<d.rad);
  if(d.ev==='final')d.alive=enemies.filter(e=>!e.dead&&e.g&&e.g.visible!==false).length;return Array.prototype.push.call(this,d);};return A;};
const ev=n=>(IVM.dbg||[]).filter(d=>d.ev===n);
/* the domain's root group (the one holding its strokes) among what the cast added */
const rootOf=added=>added.find(o=>o.isGroup&&o.children.some(c=>c.isMesh&&c.material&&c.material.uniforms&&c.material.uniforms.uSky===undefined&&c.material.uniforms.uCo))||null;
const strokes=root=>root?root.children.filter(c=>c.isMesh&&c.material&&c.material.uniforms&&c.material.uniforms.uCo):[];
/* a stroke's width: half the distance between a pair of its vertices over the taper at that point (mkSlash's own shape) */
const widthOf=s=>{const P=s.geometry.attributes.position,U=s.geometry.attributes.aU;let best=0,w=0;for(let i=0;i<P.count/2;i++){const u=U.getX(i*2),f=.08+.92*Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,u*1.12-.02))),.65);
  if(f>best){best=f;w=Math.hypot(P.getX(i*2+1)-P.getX(i*2),P.getY(i*2+1)-P.getY(i*2),P.getZ(i*2+1)-P.getZ(i*2))/2/f;}}return +w.toFixed(4);};
/* the particle pool's live count (its draw range) */
const poolOf=root=>root?root.children.find(c=>c.isPoints&&c.geometry.attributes.aC&&c.geometry.attributes.aC.itemSize===4):null;
/* one domain, watched step by step: W.f (DOM.f at 10s), W.uco (stroke core exponents seen), W.wid (stroke widths), W.pool (live particles
   8-14s), W.pinch ([T, uPinch] near the end), W.ghost (the erased foes' state while they dissolve and after) */
function watch(L,F,o){o=o||{};IVM.dbg=mkDbg();wrap();const added=track();const W={F,uco:new Set(),wid:new Set(),pool:[],pinch:[],ghost:[],walk:[]};
  try{setL(L);castScrollNow('expanse',heroU,heroStats(),F.filter(e=>!e.dead),100,oV());t0=TT;let root=null;
    onStep=T=>{if(!root)root=rootOf(added);if(o.hook)o.hook(T,W);
      if(Math.abs(T-10)<.026)W.f=DOM.f;if(Math.abs(T-25.4)<.026)W.fEnd=DOM.f;
      if(root&&T>5&&T<20)for(const s of strokes(root)){W.uco.add(s.material.uniforms.uCo.value);if(s.scale.x===1)W.wid.add(widthOf(s));}
      if(root&&T>8&&T<14){const p=poolOf(root);if(p)W.pool.push(p.geometry.drawRange.count);}
      if(T>END-1&&T<END+.1)W.pinch.push([T,DOM.post?DOM.post.mat.uniforms.uPinch.value:0]);
      for(const d of ev('erase'))if(T-d.T<.8){let p=d.e.g;while(p&&p!==scene)p=p.parent;let keys=0,tot=0;d.e.g.traverse(q=>{if(q.isMesh&&q.visible){tot++;if(q.material.customProgramCacheKey&&q.material.customProgramCacheKey()==='kkErase')keys++;}});W.ghost.push({d,dt:T-d.T,inScene:!!p,keys,tot});}
      if(o.walkers&&Math.abs(T-8)<.026)W.walk[0]=F.map(e=>e.dist);if(o.walkers&&Math.abs(T-14)<.026)W.walk[1]=F.map(e=>e.dist);};
    run(o.sec||27);}finally{unwrap();scene.add=S0;setL(0);}
  W.left=left(added);W.on=DOM.on;return W;}
/* the cuts: each enemy cut's two hurts (its power share, then its max-health share) just before its event */
const enemyCuts=()=>ev('cut').filter(d=>d.k==='enemy').map(d=>{const a=HL[d.h-2],b=HL[d.h-1];return{d,a,b};});
const cutsExact=(L,K)=>enemyCuts().filter(({d,a,b})=>!(a&&b&&a.e===d.e&&b.e===d.e&&a.k==='pw'&&b.k==='hp'&&near(a.amt,K.en)&&near(b.amt,d.e.maxHp*(d.e.boss?K.hb:K.h)))).length;
const groundExact=(L,K)=>{const g=ev('cut').filter(d=>d.k==='ground');const by=new Map();for(const d of g){const key=d.a.join()+'|'+d.b.join();if(!by.has(key))by.set(key,[]);by.get(key).push(d);}let bad=0;
  for(const L2 of by.values()){const w=L2[0].want,hit=L2.map(d=>d.e);if(w.length!==hit.length||!w.every(e=>hit.includes(e)))bad++;
    for(const d of L2){const a=HL[d.h-2],b=HL[d.h-1];if(!(a&&b&&a.e===d.e&&b.e===d.e&&near(a.amt,K.gr)&&near(b.amt,d.e.maxHp*(d.e.boss?K.ghb:K.gh))&&d.rad===K.R))bad++;}}return{n:g.length,lines:by.size,bad};};
const amounts=k=>HL.filter(h=>h.k===k);
try{
  /* ---- the card ---- */
  ok('the five masteries: Blinding Edge, Ceaseless Cuts, The Void Holds, Erasure, Reality Returns (v461)',SM_D.expanse.map(x=>x.n).join('|')==='Blinding Edge|Ceaseless Cuts|The Void Holds|Erasure|Reality Returns',SM_D.expanse.map(x=>x.n).join('|'));
  {const D=i=>smDesc('expanse',i);
    ok('the numbers on the card are the ones in the code (88% + 2.2%, 1.1%, 66% within half a tile; 4.4 + 0.33 up to 11; 15%; 15%; every 0.8s, 300%)',
      /88%/.test(D(0))&&/2\.2%/.test(D(0))&&/1\.1%/.test(D(0))&&/81% \+ 2\.03%/.test(D(0))&&/1\.01%/.test(D(0))&&/66%/.test(D(0))&&/60%/.test(D(0))&&/half a tile/.test(D(0))&&/0\.42/.test(D(0))
      &&/4\.4/.test(D(1))&&/0\.33/.test(D(1))&&/up to 11/.test(D(1))&&/up to 10/.test(D(1))&&/15%/.test(D(2))&&/a fifth/.test(D(2))&&/15%/.test(D(3))&&/not bosses/.test(D(3))&&/0\.8s/.test(D(4))&&/300%/.test(D(4))&&/bosses too/.test(D(4))
      &&IVM.enK===.88&&IVM.enH===.022&&IVM.enHB===.011&&IVM.grK===.66&&IVM.grR===.5&&IVM.foc0===4.4&&IVM.focN===.33&&IVM.focM===6.6&&IVM.domF===.15&&IVM.erase===.15&&IVM.finK===3&&IVM.finGap===.8,[0,1,2,3,4].map(D).join(' / '));}
  ok('no generic hooks; calibrated with hidden factors (0.9 to 1.11), the first two none',!SMF.expanse.hit&&!SMF.expanse.cast&&SMA.expanse.every(x=>x===1)&&SMG.expanse.length===5&&SMG.expanse.every(x=>x>=.9&&x<=1.11)&&SMG.expanse[0]===1&&SMG.expanse[1]===1&&SMW.expanse&&SMW.expanse.pack===.6,SMG.expanse.join());
  ok('the domain\'s own numbers (EXD) are the old ones: 81% + 2.03% (bosses 1.01%), ground 60% + 1% within 0.42, 4 + 0.3 per foe up to 10, a fifth of their speed, a 0.35s pinch, nothing at the end',
    JSON.stringify(EXD)==='{"enK":0.81,"enH":0.0203,"enHB":0.0101,"grK":0.6,"grR":0.42,"grH":0.01,"grHB":0.005,"slW":1,"slCo":6,"foc0":4,"focN":0.3,"focM":6,"domF":0.2,"moteK":1,"erase":0,"eraseX":2,"finK":0,"finLead":0.12,"finGap":0,"finWin":3,"pinch":0.35,"colK":1,"log":null}',JSON.stringify(EXD));
  /* ---- Mastery 0 ---- */
  const W0=watch(0,stage(14,{low:4,boss:1}));const h0=HL.slice();
  {const pw=amounts('pw'),hp=amounts('hp'),low=W0.F.filter(e=>e.maxHp===2000&&!e.boss);
    ok('Mastery 0: no mastery events; every cut strikes 81% (60% on the ground) and 2.03% of max health (1%; bosses 1.01% and 0.5%)',!IVM.dbg.length&&pw.length>150&&pw.every(h=>near(h.amt,81)||near(h.amt,60))&&hp.every(h=>near(h.amt/h.max,h.boss?.0101:.0203)||near(h.amt/h.max,h.boss?.005:.01)),pw.length+' cuts, '+pw.filter(h=>near(h.amt,60)).length+' on the ground');
    /* the snap back is from the collapse (END) on: cuts are planned until END-0.45, but a burst queues up to 7 cuts 0.7s ahead and they land until
       the collapse clears the queue, so the last 0.45s may still be cut (rarely); from one frame after END nothing may strike */
    ok('Mastery 0: nobody is erased (no kill blows) and the snap back strikes nothing',!amounts('kill').length&&!h0.some(h=>h.t>END+.025&&h.t<END+1.6),h0.filter(h=>h.t>END+.025).length+' after the collapse, '+h0.filter(h=>h.t>END-.45&&h.t<=END+.025).length+' queued cuts landing in the last 0.45s');
    ok('Mastery 0: foes crawl at a fifth of their speed, at full speed again after; the strokes as before (core 6, widths 0.13 on foes)',near(W0.f,.2)&&W0.fEnd===1&&W0.uco.size===1&&W0.uco.has(6)&&W0.wid.has(.13)&&!W0.wid.has(.156),[W0.f,W0.fEnd,[...W0.uco].join(),[...W0.wid].sort().slice(0,8).join()].join(' / '));
    ok('Mastery 0: the pinch starts 0.35s before the snap; nothing is left behind and the domain is over',W0.pinch.filter(q=>q[0]<END-.36&&q[0]>END-.9).every(q=>q[1]===0)&&W0.pinch.some(q=>q[0]>END-.34&&q[1]>0)&&W0.left===0&&!W0.on,W0.left);}
  /* ---- M1 Blinding Edge ---- */
  const W1=watch(1,stage(14,{boss:2}),{hook:T=>{if(T>10&&T<10.5&&DOM.dbg)for(let i=0;i<3;i++)DOM.dbg.ground();}});   /* (30 more ground cuts at 10s, so some land on foes) */const c1=enemyCuts().filter(q=>q.d.src===1).length,K1={en:88,h:.022*G(1),hb:.011*G(1),gr:66,gh:.01*G(1),ghb:.005*G(1),R:.5};
  {const g=groundExact(1,K1);
    ok('M1: every cut on a foe strikes 88% (81% before) and 2.2% of its max health (2.03%; a boss 1.1%, 1.01% before), exactly',enemyCuts().length>150&&!cutsExact(1,K1)&&enemyCuts().some(q=>q.d.e.boss),enemyCuts().length+' cuts, '+cutsExact(1,K1)+' not exact');
    ok('M1: every ground cut strikes 66% (60% before) + 1% of max health, exactly the foes within half a tile of its line (0.42 before)',g.n>0&&!g.bad,g.n+' hits on '+g.lines+' lines, '+g.bad+' not exact');
    ok('M1: the strokes are a fifth wider (0.156 on foes, 0.13 before) with whiter cores (exponent 4, 6 before)',W1.uco.size===1&&W1.uco.has(4)&&W1.wid.has(.156)&&!W1.wid.has(.13),[...W1.uco].join()+' / '+[...W1.wid].sort().slice(0,8).join());
    ok('M1: nothing else changes (a fifth of their speed, nobody erased, no last cut) and nothing is left behind',near(W1.f,.2)&&!ev('erase').length&&!ev('final').length&&!ev('great').length&&W1.left===0&&!W1.on,W1.left);}
  /* ---- M2 Ceaseless Cuts ---- */
  {const W2=watch(2,stage(14));const c2=enemyCuts().filter(q=>q.d.src===1).length,e1=8.2*19.55,e2=(4.4+Math.min(6.6,14*.33))*19.55;
    ok('M2: the focused stream brings 4.4 + 0.33 a foe a second (4 + 0.3 before): '+e2.toFixed(0)+' cuts over the held domain (14 foes; '+e1.toFixed(0)+' before)',Math.abs(c2-e2)<=1.5&&Math.abs(c1-e1)<=1.5,c1+' / '+c2);
    ok('M2: every cut still exact (88% + 2.2%), nothing is left behind',!cutsExact(2,{en:88,h:.022*G(2),hb:.011*G(2)})&&W2.left===0,W2.left);
    const W2b=watch(2,stage(24));const c3=enemyCuts().filter(q=>q.d.src===1).length;
    ok('M2: up to 11 a second (10 before) with a crowd of 24',Math.abs(c3-11*19.55)<=1.5,c3+' (want '+(11*19.55).toFixed(0)+')');}
  /* ---- M3 The Void Holds ---- */
  {const Ww2=watch(2,stage(8,{walk:1}),{walkers:1});const Ww3=watch(3,stage(8,{walk:1}),{walkers:1});
    const mv=W=>W.walk[0]&&W.walk[1]?W.F.map((e,i)=>W.walk[1][i]-W.walk[0][i]):[],m2=mv(Ww2),m3=mv(Ww3),r=m3.reduce((s,v)=>s+v,0)/Math.max(1e-9,m2.reduce((s,v)=>s+v,0));
    ok('M3: every foe crawls at 15% of its speed (a fifth before): a walking pack covers three quarters of the ground',near(Ww3.f,.15)&&near(Ww2.f,.2)&&Ww3.fEnd===1&&m2.length===8&&m2.every(v=>v>0)&&Math.abs(r-.75)<.03,'DOM.f '+Ww2.f+' / '+Ww3.f+', ground covered x'+r.toFixed(3));
    const P2=watch(2,stage(14)),P3=watch(3,stage(14)),avg=W=>W.pool.reduce((s,v)=>s+v,0)/Math.max(1,W.pool.length),k=avg(P3)/avg(P2);
    ok('M3: the motes of dense space round the foes are 1.5x as thick and brighter (more light in the domain\'s particle pool)',ev('opts')[0].X.moteK===1.5&&k>1.15,avg(P2).toFixed(0)+' / '+avg(P3).toFixed(0)+' live (x'+k.toFixed(2)+')');
    const W3=watch(3,stage(14,{low:4,boss:1}));const lowAlive=W3.F.filter(e=>e.maxHp===2000&&!e.dead&&e.hp<300);
    ok('M3: nobody is erased yet (foes left under 15% live on) and nothing is left behind',!ev('erase').length&&!amounts('kill').length&&W3.left===0&&Ww3.left===0&&P3.left===0,lowAlive.length+' left under 15%');}
  /* ---- M4 Erasure ---- */
  {const W4=watch(4,stage(14,{low:6,boss:1}));const E=ev('erase'),low=W4.F.filter(e=>e.maxHp===2000&&!e.boss),boss=W4.F.find(e=>e.boss);
    ok('M4: every non-boss foe a cut leaves under 15% of its health is erased at once (a killing blow), each of them',E.length===low.length&&E.every(d=>!d.e.boss&&d.hp>0&&d.hp<.15*d.max&&d.e.dead&&HL[d.h-1]&&HL[d.h-1].k==='kill'&&HL[d.h-1].e===d.e)&&low.every(e=>e.dead),E.length+' erased of '+low.length);
    ok('M4: never a boss (it takes the boss share and lives on under 15%, or falls to the cuts)',!E.some(d=>d.e===boss)&&HL.filter(h=>h.e===boss&&h.k==='hp').every(h=>near(h.amt,2000*.011*G(4))||near(h.amt,2000*.005*G(4))),boss.dead?'the boss fell to the cuts':'the boss lives at '+boss.hp.toFixed(0));
    ok('M4: the erasing cut\'s cross of strokes is twice as large',E.length&&E.every(d=>d.xs.length===2&&d.xs.every(x=>x===2)),E.map(d=>d.xs.join('/')).join(' '));
    const gs=W4.ghost,during=gs.filter(g=>g.dt>.05&&g.dt<.5),after=gs.filter(g=>g.dt>.7);
    ok('M4: the erased foe dissolves behind the white-rimmed edge (its meshes wear the dissolve for about half a second), then it is gone and its materials are its own again',
      during.length&&during.every(g=>g.inScene&&g.keys>0&&g.keys===g.tot)&&after.length&&after.every(g=>!g.inScene&&g.keys===0),during.length+' frames dissolving, '+after.length+' after');
    ok('M4: nothing is left behind',W4.left===0&&!W4.on,W4.left);}
  /* ---- M5 Reality Returns ---- */
  {const W4b=watch(4,stage(14,{boss:2}));const p4=W4b.pinch,f4=amounts('pw').filter(h=>near(h.amt,300)).length;
    const W5=watch(5,stage(14,{boss:2}));const Gr=ev('great'),Fi=ev('final'),C=ev('collapse'),fh=amounts('pw').filter(h=>near(h.amt,300)),gc=enemyCuts().filter(q=>q.d.src===2);
    ok('M5: in the last 3 seconds a great screen-wide cut every 0.8s or so (0.68-0.92), from 21s until the stream ends at 23.55s',Gr.length>=3&&Gr.length<=4&&Math.abs(Gr[0].T-(END-3))<.06&&Gr.every((g,i)=>g.T<END-.45&&(!i||g.T-Gr[i-1].T>.65&&g.T-Gr[i-1].T<.97)),Gr.map(g=>g.T.toFixed(2)).join(','));
    ok('M5: each brings three cuts on game time (0.06, 0.11 and 0.16s after it), each exact',gc.length===Gr.length*3&&Gr.every(g=>[.06,.11,.16].every(dt=>gc.some(q=>Math.abs(q.d.T-g.T-dt)<.06)))&&!cutsExact(5,{en:88,h:.022*G(5),hb:.011*G(5)}),gc.length+' cuts');
    ok('M5: as reality returns one last cut strikes every foe for 300% (nothing before), bosses too, once each',Fi.length===1&&Math.abs(Fi[0].T-(END-.12))<.06&&Fi[0].n===Fi[0].alive&&Fi[0].n===14&&fh.length===14&&new Set(fh.map(h=>h.e)).size===14&&fh.some(h=>h.boss)&&!f4,Fi[0]&&Fi[0].T.toFixed(2)+'s, '+fh.length+' struck');
    ok('M5: a longer pinch (0.6s before the snap, 0.35 before) and a ripple and colour split 30% stronger (2.08, 3.9)',W5.pinch.some(q=>q[0]>END-.58&&q[0]<END-.36&&q[1]>0)&&p4.filter(q=>q[0]>END-.58&&q[0]<END-.36).every(q=>q[1]===0)&&C.length===1&&near(C[0].rip,2.08)&&near(C[0].ca,3.9),C[0]&&C[0].rip+' / '+C[0].ca);
    ok('M5: nothing is left behind and the domain ends on time',W5.left===0&&!W5.on&&W5.fEnd===1,W5.left);}
  /* ---- renewing, other casters, the real cast path ---- */
  {const F=stage(10);IVM.dbg=mkDbg();wrap();const added=track();let n=0;try{setL(5);castScrollNow('expanse',heroU,heroStats(),F,100,oV());t0=TT;run(10);castScrollNow('expanse',heroU,heroStats(),F,100,oV());run(22);}finally{unwrap();scene.add=S0;setL(0);}
    const Fi=ev('final');
    ok('a renewed mastered domain (cast again at 10s) cuts once, as the renewed domain ends (about 29.9s)',ev('snap').length===1&&Fi.length===1&&Math.abs(Fi[0].T-(10+END-.12-ACT-.01))<.08&&left(added)===0&&!DOM.on,Fi.map(d=>d.T.toFixed(2)).join(',')+', '+left(added)+' left');}
  {const F=stage(10);IVM.dbg=mkDbg();wrap();try{setL(5);castExpanse(heroU,100,{src:heroU,el:'light',spell:'expanse'});t0=TT;run(26);}finally{unwrap();setL(0);}
    ok('casts that are not a mastered scroll cast are the old domain',!IVM.dbg.length&&amounts('pw').every(h=>near(h.amt,81)||near(h.amt,60))&&!amounts('kill').length&&!DOM.on,IVM.dbg.length);}
  {const e0=errs,lv=[];for(let L=0;L<=5;L++){const F=stage(10,{low:3});F.forEach(e=>{if(e.maxHp!==2000)e.maxHp=e.hp=2500;});heroU.scd={};heroU.gcd=0;setL(L);IVM.dbg=[];meta.spells.expanse=meta.spells.expanse||{lvl:1,hero:null};
      fireScroll(heroU,'expanse',heroStats(),F.slice());run(28);const c=ev('opts')[0];lv.push(c?c.L:0);setL(0);}
    ok('the real cast path at every mastery (with deaths) runs without errors, each at its own mastery',errs===e0&&lv.join()==='0,1,2,3,4,5'&&!DOM.on,(errs-e0)+' errors, levels '+lv.join());}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;unwrap();scene.add=S0;IVM.dbg=DB0;if(AU)AU.boom=AB0;window.__fz=false;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];for(const f of fx.slice())f.life=0;updFx(.01);state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
