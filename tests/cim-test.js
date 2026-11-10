(function(){
/* Citadel of Orders' masteries (v460). Run on the dev page: __kk.ev(await (await fetch('/tests/cim-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand on the road every half tile for 7 tiles either side of the point nearest the hero, so some are inside the domain, some just
   outside it (5.2-6 tiles) and some far out; the game is stepped (update and updFx), hurt is wrapped to log the amount each hit is called with
   (the scroll's power is 100: the opening strike deals 150, a cut 200 to its mark and 100 in its wake, the fracture 800 near its main crack
   and 400 elsewhere, a wave 4). Every mastered cast logs its domain (CIM.dbg: its centre, reach, pillars and afterimages), the opening strike,
   each cut's aim and its landing (its mark, the foes it struck, its throw and its quake) and the fracture (its crack, the foes it struck and
   where they stood), so who should be struck, and how hard, is checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(camTarget.x,camTarget.z,1);scene.updateMatrixWorld(true);}
/* the road point nearest the hero (more than 1.2 tiles off), as the ladder picks it */
function mid(){const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;}
/* (no gem or scroll carriers: a carrier twinkles every 0.18s, and the twinkles still alive when a trial ends would count as left behind) */
function foe(d,hp){const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.2,d));e.off=0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
const stage=(hp,w)=>{go();const d0=mid(),F=[];w=w||7;for(let d=-w;d<=w+.001;d+=.5)F.push(foe(d0+d,hp));return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.citadel=SM_XP[L-1];else delete meta.smast.citadel;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'light',anc:true,spell:'citadel'},x||{});
const cast=(L,x)=>{setL(L);castScrollNow('citadel',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oC(x));};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>CIM.dbg.filter(d=>d.ev===n);
const hits=(e,amt)=>log.filter(h=>h.e===e&&near(h.amt,amt));
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const dbgX=()=>({log:d=>{d.t=time;CIM.dbg.push(d);}});
const segD=(px,pz,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1,s=Math.max(0,Math.min(1,((px-ax)*dx+(pz-az)*dz)/L2));return Math.hypot(px-(ax+dx*s),pz-(az+dz*s));};
const toKeep=e=>(e.route||ROUTES[0]).len-e.dist;
/* the cast's own strips (one per cut, made with it): how many frames one was shown, and in which shader */
const strips=root=>root.children.filter(m=>m.isMesh&&m.material&&m.material.isShaderMaterial&&m.material.uniforms&&m.material.uniforms.uA&&m.geometry&&m.geometry.type==='PlaneGeometry');
/* one whole cast, stepped: samples of the crawl (T, CIT.k, CIT.pf), the slow right after the opening strike, the strips and the afterimages */
function watch(c,F){const W={kp:[],slow:null,stripOn:0,stripFS:new Set(),ghMax:0,ghNew:0,ghBeat:0,beat:-1};let prevV=new Set();
  for(let i=0;i<400;i++){run(.05);const T=c.T();W.kp.push([T,CIT.k,CIT.pf,CIT.on]);if(!W.slow&&ev('act').length)W.slow=ev('act')[0].L.map(e=>e.slowT);
    for(const m of strips(c.root))if(m.visible){W.stripOn++;W.stripFS.add(m.material.fragmentShader);}
    const V=new Set(c.ghosts.filter(g=>g.m.visible).map(g=>g.m));W.ghMax=Math.max(W.ghMax,V.size);let nw=0;for(const m of V)if(!prevV.has(m))nw++;prevV=V;
    const b=Math.floor((T+1e-9)/.2);if(b!==W.beat){W.beat=b;W.ghBeat=0;}W.ghBeat+=nw;W.ghNew=Math.max(W.ghNew,W.ghBeat);if(T>=17)break;}
  run(1);return W;}
/* the crawl as it should be: foes inside move at crawl, from the domain's start, falling to end just before the final order; tower and hero
   shots keep the old curve (CIT.pf) */
const kAt=(T,cw,ce)=>T<3?1-(1-cw)*SMS(T,2,3):cw-(cw-ce)*SMS(T,12.8,13.25);
const crawlOk=(W,cw,ce)=>{let n=0,bad=[];for(const [T,k,pf,on] of W.kp){if(T<2.05||T>14.4||!on)continue;n++;const kb=kAt(T,.5,.1);if(!near(k,kAt(T,cw,ce),1e-9)||!near(pf,Math.max(.15,kb),1e-9))bad.push(T.toFixed(2)+':'+k.toFixed(3)+'/'+pf.toFixed(3));}return{n,bad};};
/* the cuts: each one's mark takes K1, every other foe it struck K2, all at the moment it lands */
function cutsOk(K1,K2){const C=ev('cut'),bad=[];let n1=0,n2=0;for(const c of C){const at=log.filter(h=>h.t===c.t);
    for(const e of c.H){const want=e===c.e?K1:K2;if(!at.some(h=>h.e===e&&near(h.amt,want)))bad.push((e===c.e?'mark':'wake')+'@'+c.t.toFixed(2));if(e===c.e)n1++;else n2++;}}
  const all1=log.filter(h=>near(h.amt,K1)).length,all2=log.filter(h=>near(h.amt,K2)).length;return{n:C.length,bad,n1,n2,ok:C.length>=12&&!bad.length&&all1===n1&&all2===n2};}
/* the fracture: K1 within 2 tiles of its main crack, K2 elsewhere in the domain (where they stood as it snapped), each thrown back */
function snapOk(K1,K2,push,R){const s=ev('snap')[0];if(!s)return{ok:false,why:'no snap'};const bad=[];let a=0,b=0;
  s.L.forEach((e,i)=>{const [x,z,d0]=s.xz[i],dd=segD(x,z,s.ax,s.az,s.bx,s.bz),want=dd<2?K1:K2;if(want===K1)a++;else b++;if(!log.some(h=>h.e===e&&h.t===s.t&&near(h.amt,want)))bad.push('hit'+i);
    const th=d0-s.d1[i];if(e.boss?th!==0:!near(th,Math.min(push,d0),1e-9))bad.push('throw'+i+':'+th.toFixed(3));if((x-ev('cast')[0].x)**2+(z-ev('cast')[0].z)**2>R*R*1.15+1e-9)bad.push('out'+i);});
  const n=log.filter(h=>h.t===s.t&&(near(h.amt,K1)||near(h.amt,K2))).length;return{ok:!bad.length&&n===s.L.length&&a>0,bad,a,b,s,len:Math.hypot(s.bx-s.ax,s.bz-s.az)};}
const amounts=()=>[...new Set(log.map(h=>Math.round(h.amt*1e6)/1e6))].sort((a,b)=>a-b);
try{
  /* ---- the card ---- */
  ok('the five masteries: Wider Dominion, Keener Orders, Time Crawls, Edict, The Final Order (v460)',SM_D.citadel.map(x=>x.n).join('|')==='Wider Dominion|Keener Orders|Time Crawls|Edict|The Final Order',SM_D.citadel.map(x=>x.n).join('|'));
  const d=i=>smDesc('citadel',i);
  ok('the numbers on the card are the ones in the code (6 tiles; 240% and 120%; 40%, 5%, 4s; 0.6 tiles; 1200%, 600%, 1 tile)',
    /6 tiles/.test(d(0))&&/5\.2 before/.test(d(0))&&/240%/.test(d(1))&&/200% before/.test(d(1))&&/120%/.test(d(1))&&/100% before/.test(d(1))&&/40%/.test(d(2))&&/50% before/.test(d(2))&&/5%/.test(d(2))&&/4s/.test(d(2))&&/2\.5s before/.test(d(2))
    &&/0\.6 tiles/.test(d(3))&&/0\.25 before/.test(d(3))&&/not bosses/.test(d(3))&&/1200%/.test(d(4))&&/600%/.test(d(4))&&/800% and 400% before/.test(d(4))&&/1 tile back/.test(d(4))&&/0\.55 before/.test(d(4))
    &&CIM.R===6&&CIM.cut===2.4&&CIM.wake===1.2&&CIM.crawl===.4&&CIM.crawlEnd===.05&&CIM.actSl===4&&CIM.push===.6&&CIM.fin===12&&CIM.fin2===6&&CIM.finL===2.2&&CIM.finPush===1,d(1)+' / '+d(4));
  ok('no hooks of their own (the masteries live in the cast); calibrated with hidden factors',!SMF.citadel.hit&&!SMF.citadel.cast&&SMA.citadel.every(x=>x===1)&&SMG.citadel.length===5&&SMG.citadel.every(x=>x>=.9&&x<1.25),SMG.citadel.join());
  ok('the defaults table is the old cast (5.2 tiles; 200% and 100%, thrown 0.25; 50% down to 10%, a 2.5s slow; 14 afterimages; 800% and 400% over R x1.85, thrown 0.55)',
    CITD.R===5.2&&CITD.cutK===2&&CITD.wakeK===1&&CITD.push===.25&&CITD.crawl===.5&&CITD.crawlEnd===.1&&CITD.actSl===2.5&&CITD.ghostN===14&&CITD.ghostMax===4&&CITD.ghostL===.4&&CITD.ghostA===.3&&CITD.ghostC===0xffe2a0
    &&!CITD.edict&&!CITD.strip&&!CITD.stripFS&&CITD.finK===8&&CITD.finK2===4&&CITD.finL===1.85&&CITD.brW===.3&&CITD.brAmp===.8&&CITD.finPush===.55&&CITD.pH===1&&CITD.uI===1&&CITD.bAmp===1&&CITD.qAmp===1&&CITD.qR===1&&CITD.colK===1);
  /* ---- Mastery 0 ---- */
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage();run(.5);
  /* the defaults given as options (only a log added) are the same cast */
  {const F=stage(),P0=F.map(e=>[e.x,e.z]);CIM.dbg=[];log=[];const sdp0=SDP.n,added=track();let W=null,c=null;wrapHurt();
    try{setL(0);castCitadel(heroU,densest(F),100,oC(),dbgX());c=ev('cast')[0];W=watch(c,F);}finally{hurt=H0;scene.add=S0;}
    const In=F.filter((e,i)=>(P0[i][0]-c.x)**2+(P0[i][1]-c.z)**2<=c.R*c.R),A=ev('act')[0];
    ok('the defaults: a domain of 5.2 tiles, 10-12 pillars 7-11.5 tall, 14 afterimages',c.R===5.2&&c.pil.length>=6&&c.pil.length<=12&&c.pil.every(p=>p.H>=7&&p.H<=11.5)&&c.ghosts.length===14,c.pil.length+' pillars '+c.pil.map(p=>p.H.toFixed(1)).join(','));
    /* (the foes stand still until the first cut lands, after the opening strike: they stand where they stood at the cast) */
    ok('the defaults: the opening strike, 150% once to every foe inside and only those, slowed 60% for 2.5s',A&&In.length>=10&&In.length<F.length&&A.L.length===In.length&&In.every(e=>A.L.includes(e)&&log.some(h=>h.e===e&&h.t===A.t&&near(h.amt,150)))&&log.filter(h=>near(h.amt,150)).length===In.length&&W.slow.every(s=>near(s,2.5,1e-9)),In.length+' inside of '+F.length);
    const C=cutsOk(200,100);ok('the defaults: every cut strikes its mark 200% and the foes in its wake 100%, as it lands',C.ok,C.n+' cuts, '+C.n1+' marks, '+C.n2+' in wakes '+C.bad.slice(0,4).join(' '));
    const cu=ev('cut');ok('the defaults: a cut throws its mark back 0.25 and bends space as before (depth 0.55-0.85, a quake of 2.6-3.4 tiles, 0.45-0.75 deep)',cu.every(q=>near(q.d0-q.d1,Math.min(.25,q.d0),1e-9)&&q.amp>=.55&&q.amp<=.85+1e-9&&q.qR>=2.6&&q.qR<=3.4+1e-9&&q.qA>=.45&&q.qA<=.75+1e-9),cu.map(q=>(q.d0-q.d1).toFixed(2)).join(','));
    const Sn=snapOk(800,400,.55,5.2);ok('the defaults: the fracture strikes 800% within 2 tiles of its main crack, 400% elsewhere in the domain, and throws them back 0.55; the crack is R x1.85, its branches 0.3 wide',Sn.ok&&near(Sn.len,5.2*1.85,1e-9)&&Sn.s.slots.length===3&&Sn.s.slots.slice(1).every(q=>q.w===.3&&q.amp===.8),Sn.a+' near, '+Sn.b+' at the edges, length '+(Sn.len||0).toFixed(2)+' '+(Sn.bad||[]).slice(0,4).join(' '));
    const K=crawlOk(W,.5,.1);ok('the defaults: foes inside crawl at 50%, down to 10% before the final order; shots inside follow it (at least 15%)',K.n>200&&!K.bad.length,K.n+' samples '+K.bad.slice(0,4).join(' '));
    ok('the defaults: only the old strikes (150, 200, 100, 800, 400 and the waves\' 4), the seam of a cut never shown',amounts().every(a=>[4,100,150,200,400,800].includes(a))&&W.stripOn===0,amounts().join(',')+' strips '+W.stripOn);
    ok('the defaults: nothing left behind (the domain, its space pass and its crawl all gone)',left(added)===0&&!CIT.on&&CIT.k===1&&CIT.pf===1&&SDP.n===sdp0&&!SDP.pl.length,left(added)+' left, SDP.n '+SDP.n+'/'+sdp0);}
  {const F=stage();CIM.dbg=[];log=[];let c0=null;wrapHurt();const P0=F.map(e=>[e.x,e.z]);try{cast(0);for(let i=0;i<380;i++)run(.05);}finally{hurt=H0;}
    const h=heroU,In=F.filter((e,i)=>(P0[i][0]-h.x)**2+(P0[i][1]-h.z)**2<=5.2*5.2);
    ok('Mastery 0: the old cast (150% to the foes within 5.2 tiles, the old strikes only), no mastery events',!CIM.dbg.length&&In.every(e=>hits(e,150).length===1)&&log.filter(q=>near(q.amt,150)).length===In.length&&amounts().every(a=>[4,100,150,200,400,800].includes(a))&&log.some(q=>near(q.amt,800)),In.length+' inside, '+amounts().join(','));}
  /* ---- M1 Wider Dominion ---- */
  {const F=stage(0,10),P0=F.map(e=>[e.x,e.z]);CIM.dbg=[];log=[];let W=null,c=null,gl=null,R1=0;wrapHurt();try{cast(1);c=ev('cast')[0];for(let i=0;i<120;i++){run(.05);R1=Math.max(R1,CIT.R);}gl=c.root.children.filter(m=>m.isMesh&&m.material&&m.material.map&&!m.material.isShaderMaterial).map(m=>m.scale.x);W=watch(c,F);}finally{hurt=H0;setL(0);}
    const r2=e=>{const i=F.indexOf(e);return(P0[i][0]-c.x)**2+(P0[i][1]-c.z)**2;},In=F.filter(e=>r2(e)<=36),band=In.filter(e=>r2(e)>5.2*5.2),A=ev('act')[0];
    ok('M1: the domain reaches 6 tiles (5.2 before), and the crawl follows it (CIT.R)',c.R===6&&R1===6&&c.D.R===6,c.R+' '+R1);
    ok('M1: the opening strike reaches every foe within 6 tiles, those between 5.2 and 6 too, and only those',A&&band.length>0&&In.length<F.length&&A.L.length===In.length&&In.every(e=>hits(e,150).length===1)&&log.filter(h=>near(h.amt,150)).length===In.length,In.length+' inside of '+F.length+', '+band.length+' of them past 5.2');
    ok('M1: pillars a fifth taller (8.4-13.8) and brighter (x1.15), still at most 12; the gold glow and haze widen with the ring',c.pil.length>=1&&c.pil.length<=12&&c.pil.every(p=>p.H>=8.4-1e-9&&p.H<=13.8+1e-9)&&c.D.uI===1.15&&gl.some(s=>near(s,6*2.55,1e-6))&&gl.some(s=>near(s,6*3.4,1e-6)),c.pil.map(p=>p.H.toFixed(1)).join(',')+' glow '+gl.map(s=>s.toFixed(2)).join(','));
    const C=cutsOk(200,100),Sn=snapOk(800,400,.55,6);ok('M1: nothing else (the old cuts and throws, the old crawl, the old fracture over its larger domain, the seam unshown)',C.ok&&Sn.ok&&near(Sn.len,6*1.85,1e-9)&&!crawlOk(W,.5,.1).bad.length&&W.stripOn===0&&ev('cut').every(q=>near(q.d0-q.d1,Math.min(.25,q.d0),1e-9)),C.bad.slice(0,3).join(' ')+' '+(Sn.bad||[]).slice(0,3).join(' '));}
  /* ---- M2 Keener Orders ---- */
  {const F=stage();CIM.dbg=[];log=[];let W=null,c=null;wrapHurt();try{cast(2);c=ev('cast')[0];W=watch(c,F);}finally{hurt=H0;setL(0);}
    const C=cutsOk(240,120),cu=ev('cut');
    ok('M2: every cut strikes its mark 240% (200% before) and every foe in its wake 120% (100% before), as it lands',C.ok,C.n+' cuts, '+C.n1+' marks, '+C.n2+' in wakes '+C.bad.slice(0,4).join(' '));
    ok('M2: its wound bends space 1.3 times deeper (0.72-1.11) and its quake is 1.3 times deeper (0.59-0.98), the same size',cu.every(q=>q.amp>=.55*1.3-1e-9&&q.amp<=.85*1.3+1e-9&&q.qA>=.45*1.3-1e-9&&q.qA<=.75*1.3+1e-9&&q.qR>=2.6&&q.qR<=3.4+1e-9),cu.map(q=>q.amp.toFixed(2)).slice(0,6).join(','));
    ok('M2: the seam of each cut is shown while it flies (never before), with its white-hot core',W.stripOn>20&&W.stripFS.size===1&&W.stripFS.has(CIM_STRIP_FS)&&CIM_STRIP_FS!==CIT_STRIP_FS,W.stripOn+' frames');
    ok('M2: the rest as Mastery 1 (6 tiles, the old fracture and crawl)',c.R===6&&snapOk(800,400,.55,6).ok&&!crawlOk(W,.5,.1).bad.length);}
  /* ---- M3 Time Crawls ---- */
  {const F=stage();CIM.dbg=[];log=[];let W=null,c=null;wrapHurt();try{cast(3);c=ev('cast')[0];W=watch(c,F);}finally{hurt=H0;setL(0);}
    const K=crawlOk(W,.4,.05);
    ok('M3: foes inside move at 40% (50% before), down to 5% before the final order (10% before)',K.n>200&&!K.bad.length,K.n+' samples '+K.bad.slice(0,4).join(' '));
    ok('M3: tower and hero shots inside keep the old curve (CIT.pf: 50%, down to 15%), not slowed more',W.kp.filter(([T,k,pf,on])=>on&&T>4&&T<12).every(([T,k,pf])=>near(pf,.5,1e-9)&&near(k,.4,1e-9))&&W.kp.some(([T,k,pf,on])=>on&&near(pf,.15,1e-9)&&near(k,.05,1e-9)));
    ok('M3: the opening slow lasts 4s (2.5s before)',W.slow&&W.slow.length>=10&&W.slow.every(s=>near(s,4,1e-9)),W.slow&&W.slow.slice(0,4).join(','));
    ok('M3: twice the afterimages (28, 14 before), in brighter gold, living 0.6s (0.4s)',c.ghosts.length===28&&c.ghosts.every(g=>g.m.material.color.getHex()===0xffd877)&&c.D.ghostL===.6&&c.D.ghostA===.42&&c.D.ghostMax===8,c.ghosts.length);
    ok('M3: the rest as Mastery 2 (240% cuts, the old throws and fracture)',cutsOk(240,120).ok&&snapOk(800,400,.55,6).ok&&ev('cut').every(q=>near(q.d0-q.d1,Math.min(.25,q.d0),1e-9)));}
  /* afterimages need foes on the move: the same crowd walking */
  {const G=[0,3].map(L=>{const F=stage();for(const e of F)e.spd=1;CIM.dbg=[];let W=null;try{setL(L);castCitadel(heroU,densest(F),100,oC(),L?cimOpts({L,a:[1,1,1,1,1]}):dbgX());W=watch(ev('cast')[0],F);}finally{setL(0);}return W;});
    ok('M3: walking foes leave up to 8 afterimages a beat (4 before) and more stand at once than the old pool could hold',G[0].ghNew<=4&&G[0].ghMax<=14&&G[1].ghNew>4&&G[1].ghNew<=8&&G[1].ghMax>14&&G[1].ghMax<=28,'M0 '+G[0].ghNew+'/'+G[0].ghMax+', M3 '+G[1].ghNew+'/'+G[1].ghMax);}
  /* ---- M4 Edict ---- */
  {const F=stage(),B=F[16];B.boss=true;CIM.dbg=[];log=[];let c=null;wrapHurt();try{cast(4);c=ev('cast')[0];run(19);}finally{hurt=H0;setL(0);}
    const Am=ev('aim'),cu=ev('cut');let st=new Set(),bad=[];
    for(const a of Am){let U=a.L.filter(e=>!st.has(e));if(!U.length){st.clear();U=a.L;}let best=U[0];for(const e of U)if(a.K[a.L.indexOf(e)]<a.K[a.L.indexOf(best)])best=e;if(a.e!==best)bad.push(a.t.toFixed(2));st.add(a.e);}
    const marks=new Set(Am.map(a=>a.e)),In=ev('act')[0].L;
    ok('M4: each cut aims at the foe nearest the keep that no cut has aimed at yet (once all have been, the orders start again from the front)',Am.length>=12&&!bad.length&&marks.size>=Math.min(In.length,Am.length)-1,Am.length+' cuts, '+marks.size+' marks of '+In.length+' inside '+bad.slice(0,4).join(' '));
    const Rr=c.R*c.R*.94,inR=d=>{const w=posAt(d,ROUTES[0]);return(w[0]-c.x)**2+(w[1]-c.z)**2<=Rr;};const tb=[];
    for(const q of cu){if(q.e.boss){if(q.d1!==q.d0)tb.push('boss');continue;}const p=q.d0-q.d1;if(!(near(p,Math.min(.6,q.d0),1e-9)||(p<.6&&inR(q.d1)&&!inR(q.d1-.05))||(p<1e-6&&!inR(q.d0-.05))))tb.push(p.toFixed(3));}
    ok('M4: it throws its mark 0.6 tiles back (0.25 before), never out of the domain; a boss is not thrown',cu.length>=12&&!tb.length&&cu.some(q=>near(q.d0-q.d1,.6,1e-9)),cu.map(q=>(q.d0-q.d1).toFixed(2)).join(',')+' '+tb.join(' '));
    ok('M4: a larger quake of space on its mark (3.6-4.8 tiles, 2.6-3.4 before)',cu.every(q=>q.qR>=2.6*1.4-1e-9&&q.qR<=3.4*1.4+1e-9),cu.map(q=>q.qR.toFixed(1)).slice(0,6).join(','));
    ok('M4: the rest as Mastery 3 (240% cuts, the old fracture)',cutsOk(240,120).ok&&snapOk(800,400,.55,6).ok);}
  /* ---- M5 The Final Order ---- */
  {const F=stage(),B=F[13];B.boss=true;CIM.dbg=[];log=[];const sdp0=SDP.n,added=track();let c=null,col=0;wrapHurt();try{cast(5);c=ev('cast')[0];run(19);}finally{hurt=H0;scene.add=S0;setL(0);}
    const Sn=snapOk(1200,600,1,6);
    ok('M5: the fracture strikes 1200% within 2 tiles of its main crack (800% before) and 600% elsewhere in the domain (400% before), once each',Sn.ok,Sn.a+' near, '+Sn.b+' at the edges '+(Sn.bad||[]).slice(0,4).join(' '));
    ok('M5: it throws them 1 tile back (0.55 before; not a boss)',Sn.ok&&Sn.s.L.includes(B));
    ok('M5: its main crack is longer (R x2.2, 1.85 before), its branches wider (0.45, 0.3 before) and deeper (1.1, 0.8 before); still one fracture',near(Sn.len,6*2.2,1e-9)&&Sn.s.slots.length===3&&Sn.s.slots.slice(1).every(q=>q.w===.45&&q.amp===1.1)&&ev('snap').length===1,(Sn.len||0).toFixed(2));
    ok('M5: the pillars rise into a brighter column (x1.5); Masteries 1-4 ride it; nothing left behind',c.D.colK===1.5&&c.R===6&&c.D.cutK===2.4&&c.D.crawl===.4&&c.D.edict===1&&cutsOk(240,120).ok&&left(added)===0&&!CIT.on&&SDP.n===sdp0,left(added)+' left');}
  /* ---- the rest ---- */
  {const F=stage();CIM.dbg=[];log=[];setL(5);wrapHurt();try{castScrollNow('citadel',heroU,heroStats(),F.slice(),100,oC({smx:true}));run(19);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast (an echo) are the old cast',!CIM.dbg.length&&amounts().every(a=>[4,100,150,200,400,800].includes(a))&&log.some(h=>near(h.amt,800)),amounts().join(','));}
  {const e0=errs;const bad=[];for(let L=0;L<=5;L++){const F=stage();meta.spells.citadel=meta.spells.citadel||{lvl:1,hero:null};setL(L);const lv=meta.spells.citadel.lvl||1,P=scrollPow(heroU,'citadel',tStats(heroU),lv);heroU.scd={};heroU.gcd=0;CIM.dbg=[];log=[];wrapHurt();
      try{fireScroll(heroU,'citadel',heroStats(),F.slice());run(20);}finally{hurt=H0;}
      const o=ev('opts')[0];if((L?!o||o.L!==L||!ev('snap').length:!!o)||!log.some(h=>near(h.amt,1.5*P,1e-9)))bad.push(L+':'+(o?o.L:'-')+'/'+(P/100).toFixed(3));}setL(0);
    ok('the real cast path at every mastery (the masteries arrive; the opening strike is 150% of the scroll\'s power with its factor) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;CIM.dbg=null;window.__fz=false;try{for(const f of fx.slice())f.life=0;updFx(.01);resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
