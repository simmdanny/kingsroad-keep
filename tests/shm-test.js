(function(){
/* Spatial Shatter's masteries (v457). Run on the dev page: __kk.ev(await (await fetch('/tests/shm-test.js')).text()) returns [name, ok, detail] rows.
   A pack of foes stands on the road near the hero (all well inside the region: it reaches at least six tiles from its centre, which lies 2.6
   tiles up-screen of the densest foe); the game is stepped (update and updFx), hurt is wrapped to log the amount each hit is called with (the
   scroll's power is 100: the break deals 800, 940 mastered, a falling shard 250). Every mastered cast logs its region (SHM.dbg: loc, the
   centre, the twist's angle, its root), the break, each hold, each foe that breaks apart and each large shard that lands, so who should be
   struck, held or slowed is checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
let TC=0;const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);TC+=.05;}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;   /* (no Sun Disc recasts: the artifacts are put back afterwards) */
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(camTarget.x,camTarget.z,.6);scene.updateMatrixWorld(true);}
/* the road point nearest the hero (more than 1.2 tiles off), as the ladder picks it */
function mid(){const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;}
function foe(d,off,hp){const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.2,d));e.off=off||0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
/* twelve foes 0.3 apart along the road (3.3 tiles: all inside), and two far up and down the road (inside or not, loc says) */
const stage=hp=>{go();const d0=mid(),F=[];for(let i=0;i<12;i++)F.push(foe(d0+(i-5.5)*.3,(i%3-1)*.2,hp));const Far=[foe(.3,0,hp),foe(ROUTES[0].len-.3,0,hp)];return{F,Far,A:F.concat(Far)};};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.shatter=SM_XP[L-1];else delete meta.smast.shatter;};
const oS=x=>Object.assign({src:heroU,bane:0,el:'light',anc:false,spell:'shatter'},x||{});
const cast=(L,x)=>{setL(L);TC=0;castScrollNow('shatter',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oS(x));};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,sp:!!(o&&o.spell),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>SHM.dbg.filter(d=>d.ev===n);
const hits=(e,amt)=>log.filter(h=>h.e===e&&near(h.amt,amt));
/* (the terrain's pool of ripple rings round wading foes grows as it needs and stays: not the spell's) */
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const shards=root=>root?root.children.filter(m=>m.isMesh&&m.material&&m.material.uniforms&&m.material.uniforms.uRest):[];
/* a shard's hang (Absolute Stillness): the frames it spends hanging (its own hang timer running down), whether it moved meanwhile, and
   whether it hangs at the highest point of its flight */
const hangs=(P,s)=>{const q=P.get(s)||{n:0,moved:false,k:null,top:0,y:-1};P.set(s,q);const m=s.m.position;q.top=Math.max(q.top,m.y);
  if(s.hang>0&&s.hang<.25-1e-9){const k=m.x+','+m.y+','+m.z;if(q.k!==null&&k!==q.k)q.moved=true;q.k=k;q.y=m.y;q.n++;}};
const thick=root=>shards(root).map(m=>{m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;return b.max.y-b.min.y;});
/* the region's own test (the cast's loc), from a cast logged with a defaults XO or from SHM.dbg */
const inside=(c,e,u)=>c.loc(e.x,e.z)<(u||1);
/* a shard's outline where it lies: its corners carried by the mesh's own transform (independent of shUnder's inverse) */
function under(s,e,m){s.m.updateMatrixWorld(true);const M=s.m.matrixWorld,P=s.poly.map(p=>new THREE.Vector3(p[0]-s.cx,0,p[1]-s.cz).applyMatrix4(M));
  let ins=false,d2=1e9;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a.z>e.z)!==(b.z>e.z)&&e.x<(b.x-a.x)*(e.z-a.z)/(b.z-a.z)+a.x)ins=!ins;
    const ex=b.x-a.x,ez=b.z-a.z,l2=ex*ex+ez*ez||1,u=Math.max(0,Math.min(1,((e.x-a.x)*ex+(e.z-a.z)*ez)/l2)),qx=a.x+ex*u-e.x,qz=a.z+ez*u-e.z;d2=Math.min(d2,qx*qx+qz*qz);}return ins||d2<m*m;}
try{
  /* ---- the card ---- */
  ok('the five masteries: Heavier Space, Absolute Stillness, Torsion, Clean Break, The World Falls (v457)',SM_D.shatter.map(x=>x.n).join('|')==='Heavier Space|Absolute Stillness|Torsion|Clean Break|The World Falls',SM_D.shatter.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (940%; 1.2s / 0.5s; a quarter further, 50%; 25%; twice its height, 250%)',
    /940%/.test(smDesc('shatter',0))&&/800% before/.test(smDesc('shatter',0))&&/1\.2s/.test(smDesc('shatter',1))&&/0\.5s/.test(smDesc('shatter',1))&&/Resolve/.test(smDesc('shatter',1))
    &&/quarter further/.test(smDesc('shatter',2))&&/50%/.test(smDesc('shatter',2))&&/25%/.test(smDesc('shatter',3))&&/not bosses/.test(smDesc('shatter',3))&&/twice its height/.test(smDesc('shatter',4))&&/250%/.test(smDesc('shatter',4))
    &&SHM.K===9.4&&SHM.hold===1.2&&SHM.holdB===.5&&SHM.slow===.5&&near(SHM.twist,Math.PI/2)&&SHM.exec===.25&&SHM.rain===2.5,smDesc('shatter',0));
  ok('the old masteries are gone (no Glass Echo, Starlit Cracks, Falling Space, Prism Halo or Mirror World hooks); calibrated with hidden factors',!SMF.shatter.hit&&!SMF.shatter.cast&&SMA.shatter.every(x=>x===1)&&SMG.shatter.length===5&&SMG.shatter.every(x=>x>=.9&&x<1.25),SMG.shatter.join());
  ok('the defaults table is the old cast (800%, shards 0.05-0.14 thick, at most 3 flashes a frame, no hold, slow, finish or rain)',
    SHD.K===8&&SHD.thick===.05&&SHD.thickR===.09&&SHD.flashN===3&&SHD.thud===.04&&SHD.dust===1&&SHD.rise===1&&SHD.out===1&&!SHD.hold&&!SHD.slow&&!SHD.twist&&!SHD.exec&&!SHD.rain&&!SHD.hang&&!SHD.chroma&&!SHD.rim&&SHD.cleanN===12&&!SHD.lift);
  /* ---- Mastery 0 ---- */
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage();run(.5);
  /* the defaults given as options (only a log added) are the same cast: 800% to every foe inside, once, nothing else */
  {const S=stage();SHM.dbg=[];log=[];const added=track();let c=null,slow=0,st=0,fs='',th=[];wrapHurt();
    let In=[];try{setL(0);TC=0;castShatter(heroU,densest(S.F),100,oS(),{log:d=>{d.t=time;SHM.dbg.push(d);}});c=ev('cast')[0];In=S.A.filter(e=>inside(c,e));
      for(let i=0;i<160;i++){run(.05);if(TC>3&&TC<5.5)for(const e of S.A)slow=Math.max(slow,e.slow||0);if(!th.length&&TC>5.8){th=thick(c.root);fs=shards(c.root)[0].material.fragmentShader;}if(ev('break').length&&!st)st=Math.max(...S.F.map(e=>e.stunT));}run(6);}finally{hurt=H0;scene.add=S0;}
    const Out=S.A.filter(e=>!In.includes(e));
    ok('the defaults: 800% to every foe inside, once (the pack all inside), none outside, nothing else',S.F.every(e=>inside(c,e))&&In.every(e=>hits(e,800).length===1)&&Out.every(e=>!log.some(h=>h.e===e))&&log.length===In.length,In.length+' in, '+Out.length+' out, '+log.length+' hits');
    ok('the defaults: the old shards (0.05-0.14 thick, the old shader with its split and rim zeroed), no slow, the old hold (under 0.4s)',th.length>150&&Math.min(...th)>=.05-1e-6&&Math.max(...th)<=.14+1e-6&&/vec2 o=vec2\(0\.\);/.test(fs)&&/\*0\.;/.test(fs)&&!/float eg/.test(fs)&&slow===0&&st>0&&st<=.4,th.length+' shards '+Math.min(...th).toFixed(3)+'-'+Math.max(...th).toFixed(3)+' slow '+slow+' stun '+st);
    ok('the defaults: the twist turns 5.6-7.2 rad, as before; nothing left behind',c.maxAng>=5.6&&c.maxAng<=7.2&&left(added)===0&&SGL.n===0&&!SDP.sw,c.maxAng.toFixed(2)+' '+left(added));}
  {const S=stage(1e4);S.F[0].hp=3000;S.F[1].boss=true;S.F[1].hp=2000;SHM.dbg=[];log=[];let slow=0,st=0;wrapHurt();
    try{cast(0);for(let i=0;i<160;i++){run(.05);if(TC>3&&TC<5.5)for(const e of S.F)slow=Math.max(slow,e.slow||0);if(log.length&&!st)st=Math.max(...S.F.map(e=>e.stunT));}run(6);}finally{hurt=H0;}
    ok('Mastery 0: the old break (800% to every foe in the pack, once), no mastery events',S.F.every(e=>hits(e,800).length===1)&&!log.some(h=>near(h.amt,940)||near(h.amt,250))&&!SHM.dbg.length,S.F.map(e=>hits(e,800).length).join(''));
    ok('Mastery 0: no slow in the twist, the old hold after the break, a foe left at 22% stands',slow===0&&st>0&&st<=.4&&!S.F[0].dead&&!S.F[1].dead,slow+' '+st.toFixed(2)+' '+S.F[0].hp);}
  /* ---- M1 Heavier Space ---- */
  {const S=stage();SHM.dbg=[];log=[];let th=[],fs='',In=[];wrapHurt();try{cast(1);In=S.A.filter(e=>inside(ev('cast')[0],e));for(let i=0;i<160;i++){run(.05);if(!th.length&&TC>5.8){const r=ev('cast')[0].root;th=thick(r);fs=shards(r)[0].material.fragmentShader;}}run(6);}finally{hurt=H0;setL(0);}
    const c=ev('cast')[0];
    ok('M1: the break strikes 940% (800% before), every foe inside, once',In.length>=12&&In.every(e=>hits(e,940).length===1&&!hits(e,800).length)&&log.length===In.length,In.length+' in, '+log.length+' hits');
    ok('M1: the shards are cut thicker (0.09-0.2), their coloured edges and rim light switched on',th.length>150&&Math.min(...th)>=.09-1e-6&&Math.max(...th)<=.2+1e-6&&/float eg/.test(fs)&&/col\+=vec3/.test(fs)&&c.D.chroma>0&&c.D.rim>0,Math.min(...th).toFixed(3)+'-'+Math.max(...th).toFixed(3));
    ok('M1: nothing else (no hold, slow, finish, rain; the old twist)',!c.D.hold&&!c.D.slow&&!c.D.exec&&!c.D.rain&&!c.D.twist&&!ev('hold').length&&!ev('land').length);}
  /* ---- M2 Absolute Stillness ---- */
  {const S=stage(),B=S.F[3],Rs=S.F[7];B.boss=true;SHM.dbg=[];log=[];const P=new Map();let br=-1,d0=null,d1=null,d2=null,rs=false;
    try{cast(2);for(let i=0;i<200;i++){run(.05);
        if(br<0&&ev('break').length){br=TC;d0=S.F.map(e=>e.dist);for(const e of S.F)e.spd=.6;}
        if(br<0&&TC>6&&!rs){rs=true;Rs.rsv=RSV.cap-.2;Rs.rsvT=0;}
        if(br>=0){for(const s of ev('break')[0].S)hangs(P,s);
          if(d1==null&&TC-br>=1.05)d1=S.F.map(e=>e.dist);if(d2==null&&TC-br>=1.5)d2=S.F.map(e=>e.dist);}}}finally{setL(0);}
    const H=ev('hold'),hB=H.find(d=>d.e===B),hR=H.find(d=>d.e===Rs),hN=H.filter(d=>d.e!==B&&d.e!==Rs);
    ok('M2: every foe is held 1.2s after the break (stunE: the base hold and what is left of the freeze count toward it)',hN.length>=10&&hN.length===H.length-2&&hN.every(d=>near(d.stunT,1.2,1e-6)),hN.map(d=>d.stunT.toFixed(2)).join(','));
    ok('M2: a boss 0.5s; Resolve applies (a foe with 0.2s of Resolve left gets 0.2s more)',hB&&near(hB.stunT,.5,1e-6)&&hR&&near(hR.add,.2,1e-3),(hB&&hB.stunT.toFixed(3))+' / '+(hR&&hR.add.toFixed(3)));
    ok('M2: they stand still through it and walk on after it (the boss and the foe short of Resolve sooner)',d0&&d1&&d2&&S.F.every((e,i)=>e===B||e===Rs?d1[i]>d0[i]:d1[i]===d0[i]&&d2[i]>d1[i]),d0&&d1&&S.F.map((e,i)=>(d1[i]-d0[i]).toFixed(2)).join(','));
    const Sh=ev('break')[0].S,good=Sh.filter(s=>{const q=P.get(s);return s.landed&&s.hang<=0&&q&&q.n>=4&&q.n<=5&&!q.moved&&q.y>=q.top-1e-9;}).length;
    ok('M2: every shard hangs perfectly still a quarter second at the top of its flight, then falls and lands',Sh.length>150&&good===Sh.length,good+'/'+Sh.length);}
  {const S=stage();SHM.dbg=[];const P=new Map();try{cast(1);for(let i=0;i<200;i++){run(.05);if(ev('break').length)for(const s of ev('break')[0].S)hangs(P,s);}}finally{setL(0);}
    ok('M2 needs Mastery 2 (at Mastery 1 no hold, and no shard hangs)',!ev('hold').length&&ev('break')[0].S.every(s=>s.hang===0&&!P.get(s).n));}
  /* ---- M3 Torsion ---- */
  {const S=stage();SHM.dbg=[];let bad=0,mx=0,pre=0,smp=0,post=0,outS=0;let c=null;
    try{cast(3);c=ev('cast')[0];for(let i=0;i<200;i++){run(.05);const T=TC;
        for(const e of S.A){const s=e.slowT>0?e.slow:0;if(!inside(c,e,1.05)){outS=Math.max(outS,s);continue;}
          if(T<2.94)pre=Math.max(pre,s);else if(T>2.96&&T<5.6){const v=.5*shSpd((T-2.95)/2.7);smp++;if(Math.abs(s-v)>2e-3)bad++;mx=Math.max(mx,s);}else if(T>5.95&&T<6.4)post=Math.max(post,s);}}}finally{setL(0);}
    const nOut=S.A.filter(e=>!inside(c,e,1.05)).length;
    ok('M3: foes inside are slowed as the twist turns, following its speed curve, 50% at its fastest',smp>500&&!bad&&near(mx,.5,1e-9),smp+' samples, '+bad+' off, peak '+mx);
    ok('M3: no slow before the twist, none left after it (the freeze holds them), none outside the region',pre===0&&post===0&&outS===0,pre+' '+post+' '+outS+' ('+nOut+' outside)');
    ok('M3: the twist turns a quarter turn further (5.6-7.2 rad and a quarter turn), and motes swirling with it drawn over the warp (the base cast\'s are smeared away by it)',c.maxAng>=5.6+Math.PI/2-1e-9&&c.maxAng<=7.2+Math.PI/2+1e-9&&c.D.fx===shmFx&&c.root.children.some(o=>o.isPoints&&o.layers.mask===2),c.maxAng.toFixed(2));}
  {const S=stage();S.F[2].slow=.7;S.F[2].slowT=9;SHM.dbg=[];let lo=1;try{cast(3);for(let i=0;i<110;i++){run(.05);if(TC>3)lo=Math.min(lo,S.F[2].slow);}}finally{setL(0);}
    ok('M3: a stronger slow from elsewhere is kept',near(lo,.7,1e-9),lo);}
  /* ---- M4 Clean Break ---- */
  {const S=stage(1e4),A=S.F[2],Bb=S.F[5],Cb=S.F[8];A.hp=3000;Bb.hp=3800;Cb.boss=true;Cb.hp=2000;SHM.dbg=[];log=[];const added=track();let over=0;wrapHurt();
    try{cast(4);for(let i=0;i<160;i++){run(.05);if(ev('clean').length&&!over)over=added.filter(o=>o.parent===scene&&o.layers.mask===2&&o.material&&o.material.depthTest===false).length;}run(6);}finally{hurt=H0;scene.add=S0;setL(0);}
    const cl=ev('clean'),c=ev('cast')[0];
    ok('M4: a foe the break leaves under 25% breaks apart with it',A.dead&&cl.length===1&&cl[0].e===A&&hits(A,940).length===1,cl.length+' '+A.hp);
    ok('M4: not one left at 29%, nor a boss at 12%',!Bb.dead&&!Cb.dead&&Bb.hp<Bb.maxHp*.3,Bb.hp+' '+Cb.hp);
    ok('M4: its burst flares bigger (30 pieces, 12 before), and a flare and glass chips are drawn over the sheet (the shards\' own pass); nothing is left behind',c.D.cleanN===30&&c.D.cleanR===.9&&over>=5&&left(added)===0,over+' over the sheet, '+left(added)+' left');}
  {const S=stage(1e4),A=S.F[2];A.hp=3000;SHM.dbg=[];try{cast(3);run(14);}finally{setL(0);}
    ok('M4 needs Mastery 4 (at Mastery 3 a foe left at 21% stands)',!A.dead&&!ev('clean').length,A.hp);}
  /* ---- M5 The World Falls ---- */
  {const Sq=[[0,0],[1,0],[1,1],[0,1]];ok('M5: under a shard: inside its outline, or within a foe\'s half-width (0.28) of it',shUnder(Sq,.5,.5,.28)&&shUnder(Sq,1.2,.5,.28)&&shUnder(Sq,.5,-.27,.28)&&!shUnder(Sq,1.3,.5,.28)&&!shUnder(Sq,1.25,1.25,.28)&&shUnder(Sq,1.15,1.15,.28)&&!shUnder(Sq,-.5,.5,0));}
  {const S=stage();SHM.dbg=[];log=[];const added=track();let top=0,br=-1,c=null,bad=[],hiA=0,hiN=0;wrapHurt();
    try{cast(5);c=ev('cast')[0];for(let i=0;i<300;i++){run(.05);if(br<0&&ev('break').length)br=TC;if(br>=0)for(const m of shards(c.root)){top=Math.max(top,m.position.y);if(m.position.y>2.6){hiN++;hiA=Math.max(hiA,m.material.uniforms.uA.value);}}
        /* (checked the moment it lands: nothing has moved since; foes struck by an earlier shard are not struck again) */
        {const prev=new Set();for(const d of ev('land')){if(!d.ck){d.ck=1;for(const e of S.A){if(e.dead||prev.has(e))continue;if(under(d.s,e,.28)!==d.H.includes(e))bad.push(S.A.indexOf(e)+'@'+d.s.ar.toFixed(2));}}for(const e of d.H)prev.add(e);}}}}finally{hurt=H0;scene.add=S0;setL(0);}
    const L=ev('land'),Hs=new Set(L.flatMap(d=>d.H)),b=ev('break')[0];
    ok('M5: every large shard that lands strikes the foes under it (its outline where it lies), and only those',L.length>40&&!bad.length&&L.every(d=>d.s.ar>=SHM.rainA),L.length+' landings '+bad.slice(0,6).join(' '));
    ok('M5: 250% once each, to some of the pack',Hs.size>=3&&[...Hs].every(e=>hits(e,250).length===1)&&log.filter(h=>near(h.amt,250)).length===Hs.size,Hs.size+' foes struck');
    ok('M5: Masteries 1-4 ride it (940%, the hold, the slow, the finish)',S.F.every(e=>hits(e,940).length===1)&&c.D.hold===1.2&&c.D.slow===.5&&c.D.exec===.25);
    ok('M5: a piece lifted high lets the live field show through it (half see-through at 1.1 tiles over the sheet), so the foes are not buried',hiN>20&&hiA<=.62,hiN+' samples, at most '+hiA.toFixed(2));
    ok('M5: the sheet bursts up twice as high: the highest shards climb to about 3 tiles, twice the sheet\'s 1.5 (1.6 at most before)',top>2.7&&top<3.05,top.toFixed(2));
    ok('M5: it stays inside the old timeline: every shard lands before the fade (2.2s after the break) and the cast ends 3.6s after it',L.every(d=>d.t-b.t<2.2)&&left(added)===0&&SGL.n===0&&!SDP.sw,(Math.max(...L.map(d=>d.t-b.t))).toFixed(2)+'s, '+left(added)+' left');}
  {const S=stage();SHM.dbg=[];log=[];let top=0,br=-1,c=null;wrapHurt();try{cast(4);c=ev('cast')[0];for(let i=0;i<300;i++){run(.05);if(br<0&&ev('break').length)br=TC;if(br>=0)for(const m of shards(c.root))top=Math.max(top,m.position.y);}}finally{hurt=H0;setL(0);}
    ok('M5 needs Mastery 5 (at Mastery 4 no shard strikes, and they rise as before)',!ev('land').length&&!log.some(h=>near(h.amt,250))&&top<1.62,top.toFixed(2));}
  /* ---- the rest ---- */
  {const S=stage();SHM.dbg=[];log=[];setL(5);wrapHurt();try{castScrollNow('shatter',heroU,heroStats(),S.F.slice(),100,oS({smx:true}));run(14);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast (an echo) are the old cast',!SHM.dbg.length&&S.F.every(e=>hits(e,800).length===1)&&!log.some(h=>near(h.amt,250)));}
  {const e0=errs;const bad=[];for(let L=0;L<=5;L++){go();setL(0);meta.spells.shatter=meta.spells.shatter||{lvl:1,hero:null};const hp=scrollPow(heroU,'shatter',heroStats(),meta.spells.shatter.lvl||1)*7;const S=stage(hp);heroU.scd={};heroU.gcd=0;setL(L);meta.spells.shatter=meta.spells.shatter||{lvl:1,hero:null};SHM.dbg=[];fireScroll(heroU,'shatter',heroStats(),S.F.slice());run(14);
      const o=ev('opts')[0];if((L?!o||o.L!==L:!!o)||S.F.some(e=>!e.dead))bad.push(L+':'+(o?o.L:'-')+'/'+S.F.filter(e=>!e.dead).length);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive, every foe in the pack dies: 7 times the scroll\'s power each) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;SHM.dbg=null;window.__fz=false;try{resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
