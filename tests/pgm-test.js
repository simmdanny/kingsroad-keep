(function(){
/* Crimson Purgatory's masteries (v464). Run on the dev page: __kk.ev(await (await fetch('/tests/pgm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road every half tile for 7 tiles either side of the point nearest the hero (more for the last cut), so they stand
   from about 1.2 to 7 tiles from him; the game is stepped (update and updFx), hurt is wrapped to log the amount each hit is called with
   (the scroll's power is 100: a cut deals 65 x (1 + 2.2 x closeness), closeness k = exp(-distance to the hero / 2.8), plus 0.5% of max HP
   x k when k > 0.2). Every mastered cast logs its domain (PGM.dbg: its numbers, the eyes, the pooled blades), every cut (its foe, its
   closeness, its strike, whether a stare gave it, whether it executes, the foe's health after it), each stare, each execution and the last
   cut. A model steps the cut rates frame by frame exactly as the cast does (the stages, the stares, the silence), so how many cuts each foe
   should take, and how hard, is checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
/* (the equipped hero's aura explosion, a random roll on each kill near him, is off: the executions kill) */
const AU=AURA[meta.equipped],AB=AU&&AU.boom;if(AU)AU.boom=0;
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
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.purgatory=SM_XP[L-1];else delete meta.smast.purgatory;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'dark',anc:true,spell:'purgatory'},x||{});
const cast=(L,x)=>{setL(L);castScrollNow('purgatory',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oC(x));};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,t:time,sp:o&&o.spell});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>PGM.dbg.filter(d=>d.ev===n);
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const dbgX=x=>Object.assign({log:d=>{d.t=time;PGM.dbg.push(d);}},x||{});
const kOf=(e,f,hx,hz)=>Math.exp(-Math.hypot(e.x-(hx==null?heroU.x:hx),e.z-(hz==null?heroU.z:hz))/f);
/* the cut model, frame by frame as the cast steps it (T in 0.05 steps): each foe's expected number of cuts (E) and the share a stare gave it (S),
   for the cast's own numbers D and where the eyes look (these foes stand still and never die, so it is the densest foe throughout) */
function model(D,F,look){const E=new Map(F.map(e=>[e,0])),S=new Map(F.map(e=>[e,0])),fa=[7,D.focus2,D.JUDG+.2,16.9],sR2=D.stareR*D.stareR,win=[];let T=0,fi=0,fT=0,col=false;
  for(let n=0;n<800&&!col;n++){T+=.05;const sil=T>=D.END-D.sil&&T<D.END;if(fi<fa.length&&T>=fa[fi]){fi++;fT=1.3;}let fNow=false;if(fT>0){fT-=.05;fNow=true;}
    if(fNow&&!sil)win.push(T);
    if(T>=3+.6&&!sil&&!(D.last&&T>=D.END)){const b=T<7?D.b0:T<D.JUDG?D.b1:D.b2;for(const e of F){let k=kOf(e,D.fall),st=false;if(D.stare&&fNow&&k<D.stareK&&(e.x-look.x)**2+(e.z-look.z)**2<=sR2){k=D.stareK;st=true;}const r=.05*(b*(.35+2.8*k));E.set(e,E.get(e)+r);if(st)S.set(e,S.get(e)+r);}}
    if(T>=D.END)col=true;}
  return{E,S,win};}
/* every cut against the model: its count per foe (within one: each foe's count starts at a random fraction), its closeness and strike, and its
   hurts (the strike and, when k > 0.2, 0.5% of max HP x k), nothing else struck */
function cutsOk(D,F,P){const C=ev('cut'),look=densest(F),M=model(D,F,look),bad=[];let worst=0;
  for(const e of F){const n=C.filter(c=>c.e===e).length,x=M.E.get(e);worst=Math.max(worst,Math.abs(n-x));if(!(Math.abs(n-x)<1))bad.push('count '+n+'/'+x.toFixed(2));}
  let used=new Set(),nh=0;for(const c of C){const k0=kOf(c.e,D.fall,c.hx,c.hz),kw=c.st?D.stareK:k0;if(!near(c.k,kw,1e-9))bad.push('k '+c.k.toFixed(4)+'/'+kw.toFixed(4));if(!near(c.dm,P*.65*(1+2.2*kw),1e-9))bad.push('dm '+c.dm);
    const h=log.find(q=>!used.has(q)&&q.e===c.e&&q.t===c.t&&near(q.amt,c.dm,1e-9));if(h){used.add(h);nh++;}else bad.push('no hurt');
    if(kw>.2){const h2=log.find(q=>!used.has(q)&&q.e===c.e&&q.t===c.t&&near(q.amt,c.e.maxHp*.005*kw,1e-9));if(h2){used.add(h2);nh++;}else bad.push('no max-HP hurt');}}
  const other=log.filter(q=>!used.has(q));return{ok:C.length>40&&!bad.length&&!other.length,n:C.length,bad,worst,other:other.length,M,look};}
/* one whole cast, stepped: PURG.f each frame, the eyes' openness and the domain's time */
function watch(c,sec){const W={f:[],lid:[],pose:null};for(let i=0;i<Math.round(sec/.05);i++){run(.05);const T=c.T();W.f.push([T,PURG.f]);W.lid.push([T,Math.max(...c.EYES.map(E=>E.lidBox.scale.y)),Math.min(...c.EYES.map(E=>E.pupil.scale.x))]);}W.pose=Object.assign({},PURG.pose);return W;}
const slowOk=(W,D)=>{const bad=[];for(const [T,f] of W.f){if(T>D.END+1)break;const sil=T>=D.END-D.sil&&T<D.END,want=sil?0:T>=3&&T<D.END?.5:1;if(f!==want)bad.push(T.toFixed(2)+':'+f);}return bad;};
const amounts=()=>[...new Set(log.map(h=>Math.round(h.amt*1e6)/1e6))].sort((a,b)=>a-b);
try{
  /* ---- the card ---- */
  ok('the five masteries: Closer Still, Swifter Judgment, The Watching Eyes, Execution, The Last Judgment (v464)',SM_D.purgatory.map(x=>x.n).join('|')==='Closer Still|Swifter Judgment|The Watching Eyes|Execution|The Last Judgment',SM_D.purgatory.map(x=>x.n).join('|'));
  const d=i=>smDesc('purgatory',i);
  ok('the numbers on the card are the ones in the code (3 tiles; 13s, 7%; 1.5 and 2.75 tiles; 8% up to 20%; 0.8s, 150% up to 480%)',
    /3 tiles/.test(d(0))&&/2\.8 before/.test(d(0))&&/13s/.test(d(1))&&/14s before/.test(d(1))&&/7% faster/.test(d(1))&&/1\.5 tiles/.test(d(2))&&/2\.75 tiles/.test(d(2))&&/8%/.test(d(3))&&/20%/.test(d(3))&&/not bosses/.test(d(3))
    &&/0\.8s/.test(d(4))&&/0\.32s before/.test(d(4))&&/150%/.test(d(4))&&/480%/.test(d(4))
    &&PGM.fall===3&&PGM.judg===13&&PGM.b2===1.6&&near(PGM.b2/1.5,1.07,.01)&&PGM.stareR===1.5&&PGM.stareD===2.75&&PGM.ex0===.08&&PGM.exK===.12&&near(.08+.12,.2)&&PGM.sil===.8&&PGM.last===1.5&&near(1.5*3.2,4.8),d(1)+' / '+d(4));
  ok('no hooks of their own (the masteries live in the cast); calibrated with hidden factors',!SMF.purgatory.hit&&!SMF.purgatory.cast&&SMA.purgatory.every(x=>x===1)&&SMG.purgatory.length===5&&SMG.purgatory.every(x=>x>=.9&&x<=1.1),SMG.purgatory.join());
  ok('the defaults table is the old cast (2.8 tiles; stages at 0.45, 0.8 and 1.5 from 14s; the second stare at 11.2s; a 0.32s silence ending at 17.5s; no stares, executions or last cut; the old aura)',
    PURGD.fall===2.8&&PURGD.JUDG===14&&PURGD.END===17.5&&PURGD.sil===.32&&PURGD.b0===.45&&PURGD.b1===.8&&PURGD.b2===1.5&&PURGD.focus2===11.2&&!PURGD.stare&&!PURGD.exK&&!PURGD.ex0&&!PURGD.last&&PURGD.auraK===1&&PURGD.glowR===1.7&&PURGD.swell===.06&&!PURGD.flareK&&!PURGD.wide&&!PURGD.bladeN);
  /* ---- Mastery 0 ---- */
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage();run(.5);
  /* the defaults given as options (only a log added) are the same cast */
  {const F=stage();PGM.dbg=[];log=[];const added=track();let W=null,c=null;wrapHurt();
    try{setL(0);castPurgatory(heroU,100,oC(),dbgX());c=ev('cast')[0];W=watch(c,21);}finally{hurt=H0;scene.add=S0;}
    const K=cutsOk(PURGD,F,100),C=ev('cut');
    ok('the defaults: each foe is cut at 0.45 x (0.35 + 2.8k) a second from 3.6s, 0.8x from 7s and 1.5x from 14s until the silence, k by its distance to the hero over 2.8 tiles',K.ok,K.n+' cuts, worst count off by '+K.worst.toFixed(2)+' '+K.bad.slice(0,4).join(' '));
    ok('the defaults: every cut strikes 65% x (1 + 2.2k), plus 0.5% of max HP x k when k > 0.2; nothing else is struck',K.ok&&!K.other,K.other+' other hurts');
    ok('the defaults: no stares give a cut, no executions, no last cut',!C.some(q=>q.st||q.ex)&&!ev('exec').length&&!ev('last').length&&ev('stare').length===4&&ev('stare').map(s=>s.T).every((T,i)=>T>=[7,11.2,14.2,16.9][i]&&T<[7,11.2,14.2,16.9][i]+.051),ev('stare').map(s=>s.T.toFixed(2)).join(','));
    ok('the defaults: no cut in the silence (17.18-17.5s) or after it; foes slowed to half from 3s, held still in the silence, free after',!C.some(q=>q.T>=17.18-1e-9&&q.T<17.5)&&!C.some(q=>q.T>=17.55)&&!slowOk(W,PURGD).length,slowOk(W,PURGD).slice(0,4).join(' '));
    const glow=[];c.root.traverse(m=>{if(m.geometry&&m.geometry.type==='CircleGeometry'&&m.geometry.parameters.segments===28)glow.push(m.geometry.parameters.radius);});
    ok('the defaults: the old aura (its glow 1.7 tiles), the old eyes, no pooled blades; the hero\'s judgment pose from 15s to 18.5s of its gesture',near(glow[0],1.7)&&!c.BP&&!c.XG&&c.D.swell===.06&&W.lid.every(([T,y])=>y<=1+1e-9)&&W.pose.j===15&&W.pose.e===18.5,glow.join()+' pose '+JSON.stringify(W.pose));
    ok('the defaults: nothing left behind (the domain, its tint and vignette gone, the world\'s speed and light handed back)',left(added)===0&&!c.tint.isConnected&&!c.vig.isConnected&&!PURG.on&&PURG.f===1&&!PURG.live,left(added)+' left');}
  {const F=stage();PGM.dbg=[];log=[];wrapHurt();try{cast(0);run(21);}finally{hurt=H0;}
    const by=e=>log.filter(h=>h.e===e&&!near(h.amt,e.maxHp*.005*kOf(e,2.8),1e-9)),M=model(PURGD,F,densest(F)),bad=[];
    for(const e of F){const H=by(e),k=kOf(e,2.8);if(!H.every(h=>near(h.amt,65*(1+2.2*k),1e-9)))bad.push('dm');if(!(Math.abs(H.length-M.E.get(e))<1))bad.push(H.length+'/'+M.E.get(e).toFixed(2));}
    ok('Mastery 0: the old cast (every foe cut as before by its distance to the hero over 2.8 tiles), no mastery events',!PGM.dbg.length&&!bad.length&&log.length>40,log.length+' hurts '+bad.slice(0,4).join(' '));}
  /* ---- M1 Closer Still ---- */
  {const F=stage();PGM.dbg=[];log=[];let c=null,W=null;wrapHurt();try{cast(1);c=ev('cast')[0];W=watch(c,21);}finally{hurt=H0;setL(0);}
    const K=cutsOk(c.D,F,100);
    ok('M1: closeness falls off over 3 tiles (2.8 before): every foe is cut more often and harder by it, as the model says',c.D.fall===3&&K.ok,K.n+' cuts, worst '+K.worst.toFixed(2)+' '+K.bad.slice(0,4).join(' '));
    const F3=F.filter(e=>{const q=Math.hypot(e.x-heroU.x,e.z-heroU.z);return q>2.8&&q<4.2;}),g=e=>{const a=kOf(e,2.8),b=kOf(e,3);return (.35+2.8*b)*(1+2.2*b)/((.35+2.8*a)*(1+2.2*a));};
    ok('M1: about 10% more to a foe 3-4 tiles away (rate x strike)',F3.length>0&&F3.every(e=>g(e)>1.08&&g(e)<1.11),F3.map(e=>g(e).toFixed(3)).join(','));
    const glow=[];c.root.traverse(m=>{if(m.geometry&&m.geometry.type==='CircleGeometry'&&m.geometry.parameters.segments===28)glow.push(m.geometry.parameters.radius);});
    ok('M1: the aura reaches further (its rings, shards, pulses and cracks x3/2.8, its glow 2 tiles: 1.7 before)',near(c.D.auraK,3/2.8)&&near(glow[0],2),glow.join());
    ok('M1: nothing else (the old stages, silence and slow; no stares, executions or last cut)',!ev('cut').some(q=>q.st||q.ex)&&!ev('last').length&&!slowOk(W,c.D).length&&c.D.JUDG===14&&c.D.END===17.5);}
  /* ---- M2 Swifter Judgment ---- */
  {const F=stage();PGM.dbg=[];log=[];let c=null,W=null;wrapHurt();try{cast(2);c=ev('cast')[0];W=watch(c,21);}finally{hurt=H0;setL(0);}
    const K=cutsOk(c.D,F,100),C=ev('cut'),fast=e=>C.filter(q=>q.e===e&&q.T>=13.05&&q.T<17.18).length;
    ok('M2: the last stage begins at 13s (14s before) and cuts 1.6 x (0.35 + 2.8k) a second (1.5 before), as the model says',c.D.JUDG===13&&c.D.b2===1.6&&K.ok,K.n+' cuts, worst '+K.worst.toFixed(2)+' '+K.bad.slice(0,4).join(' '));
    const hi=F.slice().sort((a,b)=>kOf(b,3)-kOf(a,3))[0],x=1.6*(.35+2.8*kOf(hi,3))*(17.18-13);
    ok('M2: the nearest foe takes the last stage\'s cuts from 13s',Math.abs(fast(hi)-x)<2.2,fast(hi)+' cuts from 13s to 17.18s, about '+x.toFixed(1));
    ok('M2: the stares follow the stages (7s, 10.6s, 13.2s, 16.9s); the eyes swell more in the last stage (x0.09, 0.06 before); the hero\'s judgment pose from 14s',ev('stare').map(s=>s.T).every((T,i)=>T>=[7,10.6,13.2,16.9][i]&&T<[7,10.6,13.2,16.9][i]+.051)&&c.D.swell===.09&&W.pose.j===14&&W.pose.e===18.5,ev('stare').map(s=>s.T.toFixed(2)).join(',')+' '+JSON.stringify(W.pose));
    ok('M2: the rest as Mastery 1 (3 tiles; the old silence and slow; no stares, executions or last cut)',c.D.fall===3&&!C.some(q=>q.st||q.ex)&&!ev('last').length&&!slowOk(W,c.D).length);}
  /* ---- M3 The Watching Eyes ---- */
  {const F=stage();PGM.dbg=[];log=[];let c=null,fl=[];wrapHurt();try{cast(3);c=ev('cast')[0];for(let i=0;i<420;i++){const n0=ev('stare').length;run(.05);if(ev('stare').length>n0)fl.push(Math.min(...c.EYES.map(E=>E.flare)));}run(1);}finally{hurt=H0;setL(0);}
    const K=cutsOk(c.D,F,100),C=ev('cut'),S=C.filter(q=>q.st),look=K.look,kS=Math.exp(-2.75/3);
    ok('M3: while the eyes stare, foes within 1.5 tiles of where they look are cut as if they stood 2.75 tiles from the hero (closeness exp(-2.75/3)), as the model says',near(c.D.stareK,kS,1e-12)&&K.ok&&S.length>0,K.n+' cuts, '+S.length+' given by a stare, worst '+K.worst.toFixed(2)+' '+K.bad.slice(0,4).join(' '));
    const win=K.M.win,inW=T=>win.some(w=>Math.abs(w-T)<.026);
    ok('M3: only in the four stares, only near where they look (the densest foe), only foes further than 2.75 tiles, never in the silence (the frame the world returns in still cuts, as before)',S.every(q=>inW(q.T)&&!(q.T>=17.18-1e-9&&q.T<17.5)&&(q.e.x-look.x)**2+(q.e.z-look.z)**2<=2.25+1e-9&&kOf(q.e,3)<kS)&&S.some(q=>q.T<8.3)&&S.some(q=>q.T>13.2&&q.T<14.6),S.length+' stare cuts, from '+(S.length?S[0].T.toFixed(2):'-'));
    const far=F.filter(e=>K.M.S.get(e)>0);
    ok('M3: those foes take more cuts in the stares (each one within one cut of the model)',far.length>0&&far.every(e=>Math.abs(C.filter(q=>q.e===e).length-K.M.E.get(e))<1),far.length+' foes near the gaze');
    ok('M3: the eyes flare at each stare (all six), and their links',fl.length===4&&fl.every(f=>f>.9)&&c.D.flareK===.5,fl.map(f=>f.toFixed(2)).join(','));
    ok('M3: the rest as Mastery 2 (13s, 1.6x; no executions or last cut)',c.D.JUDG===13&&c.D.b2===1.6&&!C.some(q=>q.ex)&&!ev('last').length);}
  /* ---- M4 Execution ---- */
  {const F=stage(1e4),B=F[3];B.boss=true;F.forEach((e,i)=>{e.hp=e.maxHp*(.1+.01*i);});B.hp=B.maxHp*.05;PGM.dbg=[];log=[];let c=null,bpN=[],xg=0;wrapHurt();
    try{cast(4);c=ev('cast')[0];for(let i=0;i<420;i++){const n0=ev('exec').length;run(.05);if(ev('exec').length>n0){xg=Math.max(xg,c.XG.L.filter(g=>g.m.visible).length);}}run(1);}finally{hurt=H0;setL(0);}
    const C=ev('cut'),X=ev('exec'),bad=[];
    for(const q of C){if(q.dead)continue;const want=!q.e.boss&&q.hp<q.e.maxHp*(.08+.12*q.k);if(!!q.ex!==want)bad.push(q.T.toFixed(2)+' '+(q.hp/q.e.maxHp).toFixed(3)+' k'+q.k.toFixed(2));}
    const exOk=X.every(x=>{const q=C.find(c=>c.e===x.e&&c.ex&&c.t===x.t);return q&&near(x.hp0,q.hp)&&x.dead&&x.e.dead&&!x.e.boss;});
    ok('M4: a cut that leaves a non-boss foe under 8% + 12% x closeness of its health (20% beside the hero) cuts it down, and only then',X.length>=5&&!bad.length&&exOk&&new Set(X.map(x=>x.e)).size===X.length,X.length+' executions, k '+X.map(x=>x.k.toFixed(2)).slice(0,8).join(',')+' '+bad.slice(0,4).join(' '));
    ok('M4: a boss is never cut down (it dies only to the cuts)',!X.some(x=>x.e===B)&&C.some(q=>q.e===B&&!q.dead&&q.hp<q.e.maxHp*.08),B.dead?'dead to the cuts':'alive');
    ok('M4: its crossing blade flares larger (a wide cross and a lingering trail from the pooled blades: no geometry made for it), its scorch flares red-hot',c.BP&&c.BP.N===48&&X.every(x=>x.noX===false)&&c.BP.n===3*X.length&&xg>0&&c.XG.L.length===10,'pool '+(c.BP&&c.BP.N)+', '+(c.BP&&c.BP.n)+' blades, '+xg+' glows at once');
    ok('M4: the rest as Mastery 3 (3 tiles, 13s, the stares; no last cut)',c.D.fall===3&&c.D.JUDG===13&&c.D.stare===1&&!ev('last').length);}
  /* ---- M5 The Last Judgment ---- */
  {const F=stage(0,12),B=F[5];B.boss=true;PGM.dbg=[];log=[];const added=track();let c=null,W=null;wrapHurt();
    try{cast(5);c=ev('cast')[0];W=watch(c,22);}finally{hurt=H0;scene.add=S0;setL(0);}
    const La=ev('last')[0],C=ev('cut'),E=17.18+.8;
    ok('M5: the silence holds 0.8s (17.18-17.98s, 0.32s before): no cuts in it or after it (the frame it breaks in holds only the last cut), every foe held still (bosses too), the world free after',La&&near(c.D.END,E,1e-12)&&c.D.sil===.8&&!C.some(q=>q.T>=17.18-1e-9)&&!slowOk(W,c.D).length&&W.f.some(([T,f])=>T>17.9&&T<E&&f===0),slowOk(W,c.D).slice(0,4).join(' '));
    const sorted=F.slice().sort((a,b)=>Math.hypot(a.x-heroU.x,a.z-heroU.z)-Math.hypot(b.x-heroU.x,b.z-heroU.z));
    const lastOk=La&&La.T>=E&&La.T<E+.051&&La.H.length===F.length&&La.H.every((h,i)=>h.e===sorted[i]&&near(h.k,kOf(h.e,3),1e-9)&&near(h.dm,150*(1+2.2*h.k),1e-9)&&log.some(q=>q.e===h.e&&q.t===La.t&&near(q.amt,h.dm,1e-9)));
    ok('M5: then every foe takes one last cut, 150% x (1 + 2.2 x closeness): 150% far away, up to 480% beside the hero (a boss too)',lastOk&&La.H.some(h=>h.e===B),La?La.H.length+' foes, '+La.H[0].dm.toFixed(1)+' to the nearest, '+La.H[La.H.length-1].dm.toFixed(1)+' to the furthest':'none');
    ok('M5: blades cross on the forty nearest (two each, from the pooled blades), sparks burst on the rest',F.length>40&&La.n===40&&c.BP.N===128&&c.BP.n===80,F.length+' foes, '+La.n+' crosses, '+c.BP.n+' blades');
    const wide=W.lid.filter(([T])=>T>=E&&T<E+.7),pre=W.lid.filter(([T])=>T<E);
    ok('M5: the six eyes open wide for it (their lids up to 1.45 open, 1 before; the pupils narrow), then close',wide.some(([T,y])=>y>1.3)&&pre.every(([T,y])=>y<=1+1e-9)&&wide.some(([T,y,p])=>p<.6),'lids '+Math.max(...wide.map(w=>w[1])).toFixed(2)+', pupils '+Math.min(...wide.map(w=>w[2])).toFixed(2));
    ok('M5: the hero\'s judgment pose holds to the end of the silence (18.98s of the gesture); Masteries 1-4 ride it; nothing left behind',near(W.pose.e,E+1,1e-12)&&W.pose.j===14&&c.D.fall===3&&c.D.JUDG===13&&c.D.stare===1&&c.D.exK===.12&&left(added)===0&&!c.tint.isConnected&&!PURG.on&&PURG.f===1&&!PURG.live,left(added)+' left');}
  /* the last cut cuts down the foes it leaves low enough (Execution rides it) */
  {const F=stage(),B=F[2];B.boss=true;PGM.dbg=[];log=[];let c=null;wrapHurt();
    try{cast(5);c=ev('cast')[0];while(c.T()<17.6)run(.05);F.forEach(e=>{e.hp=e.maxHp*.1;});run(3);}finally{hurt=H0;setL(0);}
    const La=ev('last')[0],X=ev('exec').filter(x=>x.t===La.t),A=La?La.H.filter(h=>!h.dead):[],want=A.filter(h=>!h.e.boss&&h.hp<h.e.maxHp*(.08+.12*h.k)),far=A.filter(h=>h.k<.16);
    ok('M5: the last cut cuts down every non-boss foe it leaves under 8% + 12% x closeness, and only those (from 10% health: those within about 5.4 tiles)',La&&La.H.length===F.length&&want.length>0&&A.every(h=>h.ex===want.includes(h))&&A.every(h=>near(h.hp,h.e.maxHp*.1-h.dm,1e-9))&&X.length===want.length&&want.every(h=>X.some(x=>x.e===h.e&&x.e.dead))&&!X.some(x=>x.e===B)&&far.every(h=>!h.ex),X.length+' of '+(La?La.H.length:0)+' cut down, '+far.length+' too far');}
  /* ---- the rest ---- */
  {const F=stage();PGM.dbg=[];log=[];setL(5);wrapHurt();try{castScrollNow('purgatory',heroU,heroStats(),F.slice(),100,oC({smx:true}));run(21);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast (an echo) are the old cast',!PGM.dbg.length&&log.length>40&&F.every(e=>log.filter(h=>h.e===e).every(h=>near(h.amt,65*(1+2.2*kOf(e,2.8)),1e-9)||near(h.amt,e.maxHp*.005*kOf(e,2.8),1e-9))),log.length+' hurts');}
  {const e0=errs;const bad=[];for(let L=0;L<=5;L++){const F=stage();meta.spells.purgatory=meta.spells.purgatory||{lvl:1,hero:null};setL(L);const lv=meta.spells.purgatory.lvl||1,P=scrollPow(heroU,'purgatory',tStats(heroU),lv),f=L?3:2.8;heroU.scd={};heroU.gcd=0;PGM.dbg=[];log=[];wrapHurt();
      try{fireScroll(heroU,'purgatory',heroStats(),F.slice());run(23);}finally{hurt=H0;}
      const o=ev('opts')[0],first=log.find(h=>h.sp==='purgatory');if((L?!o||o.L!==L:!!o)||!first||!near(first.amt,P*.65*(1+2.2*kOf(first.e,f)),1e-9)||(L===5&&!ev('last').length))bad.push(L+':'+(o?o.L:'-')+'/'+(P/100).toFixed(3));}setL(0);
    ok('the real cast path at every mastery (the masteries arrive; a cut is 65% x (1 + 2.2k) of the scroll\'s power with its factor) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{if(AU)AU.boom=AB;console.error=ce;hurt=H0;scene.add=S0;PGM.dbg=null;window.__fz=false;try{for(const f of fx.slice())f.life=0;updFx(.01);resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
