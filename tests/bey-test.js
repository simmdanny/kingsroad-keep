(function(){
/* Eye of the Blood Moon's masteries (v467). Run on the dev page: __kk.ev(await (await fetch('/tests/bey-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand on the road every half tile for up to 12 tiles either side of the point nearest the hero, with known, distinct health, so who
   the gaze brands (the strongest within its reach of where it looks) is known; the game is stepped (update and updFx), and hurt is wrapped
   to log the amount each hit is called with and the health it actually took (the scroll's power is 100: a lash is called with 150, or 140
   at Lashing Storm, and a brand makes its foe lose 1.35 times that, or 1.4 at Bloodshot Brand; The Last Look is called with 200). Every
   mastered cast logs its eye, its brands, each lash and who it struck, each fallen brand and where the gaze moved on, and The Last Look
   (BEY.dbg), so each mastery is checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,ARC0=nsArc;
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
function foe(d,hp){const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.2,d));e.off=0;e.hp=e.maxHp=hp;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);e.k0=e.g.children.length;return e;}
/* foes every half tile for w tiles either side; each has its own health (1e7 + 1000 x its place), so the strongest are known */
const stage=w=>{go();const d0=mid(),F=[];w=w||7;let i=0;for(let d=-w;d<=w+.001;d+=.5)F.push(foe(d0+d,1e7+1000*(i++)));return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.bloodeye=SM_XP[L-1];else delete meta.smast.bloodeye;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'dark',anc:true,spell:'bloodeye'},x||{});
const cast=(L,x)=>{setL(L);castScrollNow('bloodeye',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oC(x));};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){const h=e&&!e.dead?e.hp:null;const r=H0.apply(this,arguments);log.push({e,amt,t:time,spell:o&&o.spell,lost:h==null?0:h-Math.max(0,e.hp)});return r;};};
let arcs=[];const wrapArc=()=>{nsArc=function(A,B,o){arcs.push({A:A.clone(),B:B.clone(),w:o&&o.w,br:o&&o.br,t:time});return ARC0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>BEY.dbg.filter(d=>d.ev===n);
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const dbgX=x=>Object.assign({log:d=>{d.t=time;BEY.dbg.push(d);}},x||{});
/* who the gaze should brand: the N strongest (by nsStrong) among the foes alive at the cast within R tiles of where it looks */
const want=(F,c,R,N)=>F.filter(e=>!e.dead&&(e.x-c.x)**2+(e.z-c.z)**2<R*R).sort((a,b)=>nsStrong(b)-nsStrong(a)).slice(0,N);
const same=(A,B)=>A.length===B.length&&A.every(e=>B.includes(e));
/* the lashes as the hurt log saw them (a lash is every brand struck with amt at the same moment) */
const lashT=amt=>[...new Set(log.filter(h=>h.spell==='bloodeye'&&near(h.amt,amt)).map(h=>h.t))].sort((a,b)=>a-b);
/* the brand marks on a foe (they ride on its model): what its model gained since it was made */
const marksOn=e=>({length:e.g.children.length-e.k0});
const mainFx=()=>fx.find(q=>q.max===8.4&&q.fn);
/* how far the rune reaches: its farthest vertex from its centre (its rings are drawn a jittered width outward from their radius, plus a
   small wobble: 0.95 to about 1.09 times the radius it is built with) */
const runeR=g=>{let r=0;g.traverse(m=>{const P=m.geometry&&m.geometry.attributes.position;if(P)for(let i=0;i<P.count;i++)r=Math.max(r,Math.hypot(P.getX(i),P.getY(i),P.getZ(i)));});return r;};
/* one whole cast stepped frame by frame from now; samples the eye's size, the iris's light and the marks; ends when the cast's fx is gone */
function watch(o,maxT,tBase){const W={eyeMax:0,emis:[],fxEnd:null,mk:[]};const t0=tBase==null?time:tBase,f=mainFx();
  for(let i=0;i<Math.round((maxT||20)/.05);i++){run(.05);const T=time-t0;if(W.fxEnd!=null)break;if(o&&o.E){W.eyeMax=Math.max(W.eyeMax,o.E.g.scale.x);W.emis.push([T,o.E.ball.material.emissiveIntensity]);}
    if(o&&o.marks)W.mk.push([T,o.marks.length,o.marks.map(m=>m.g.scale.x)]);if(W.fxEnd==null&&f&&!fx.includes(f))W.fxEnd=T;}
  return W;}
try{
  /* ---- the card ---- */
  ok('the five masteries: Wider Gaze, Bloodshot Brand, Lashing Storm, The Gaze Moves On, The Last Look (v467)',SM_D.bloodeye.map(x=>x.n).join('|')==='Wider Gaze|Bloodshot Brand|Lashing Storm|The Gaze Moves On|The Last Look',SM_D.bloodeye.map(x=>x.n).join('|'));
  const d=i=>smDesc('bloodeye',i);
  ok('the numbers on the card are the ones in the code (7 foes in 10 tiles; 40% for 10s; every 0.34s, 7 times, 140%; up to 6 more; 200%)',
    /7 foes/.test(d(0))&&/6 before/.test(d(0))&&/10 tiles/.test(d(0))&&/8 before/.test(d(0))&&/40%/.test(d(1))&&/35% before/.test(d(1))&&/10s/.test(d(1))&&/8s before/.test(d(1))
    &&/0\.34s/.test(d(2))&&/7 times/.test(d(2))&&/6 before/.test(d(2))&&/140%/.test(d(2))&&/150% before/.test(d(2))&&/up to 6 more/.test(d(3))&&/200%/.test(d(4))&&/renewing each brand/.test(d(4))
    &&BEY.R===10&&BEY.N===7&&BEY.mul===1.4&&BEY.dur===10&&BEY.iv===.34&&BEY.n===7&&BEY.lash===1.4&&BEY.moveN===6&&BEY.last===2,d(1)+' / '+d(2)+' / '+d(4));
  ok('no hooks of their own (the masteries live in the cast); calibrated with hidden factors',!SMF.bloodeye.hit&&!SMF.bloodeye.cast&&!SMF.bloodeye.pre&&SMA.bloodeye.every(x=>x===1)&&SMG.bloodeye.length===5&&SMG.bloodeye.every(x=>x>=.88&&x<=1.1),SMG.bloodeye.join());
  ok('the defaults table is the old cast (6 foes within 8 tiles, 35% for 8s; 6 lashes of 150% every 0.4s, width 1.3, 2 branches; no moving on, no last look; the eye 1.2, the rune 1.6; the old brand colours)',
    BED.R===8&&BED.N===6&&BED.dur===8&&BED.mul===1.35&&BED.iv===.4&&BED.n===6&&BED.lash===1.5&&BED.w===1.3&&BED.br===2&&!BED.moveN&&!BED.last&&BED.eyeS===1.2&&BED.wan===1&&BED.runeR===1.6&&BED.mkS===1&&!BED.mkC&&!BED.mkH&&BED.pulse===.25&&!BED.hold&&!BED.log);
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage();run(.5);
  /* ---- Mastery 0: the old cast ---- */
  let M0=null;
  {const F=stage(12),c=densest(F);for(const e of F){const q=(e.x-c.x)**2+(e.z-c.z)**2;if(q>=64&&q<100)e.maxHp=e.hp=3e7+e.maxHp;else if(q>=100)e.maxHp=e.hp=5e7+e.maxHp;}
    const W8=want(F,c,8,6),ring0=F.filter(e=>{const q=(e.x-c.x)**2+(e.z-c.z)**2;return q>=64&&q<100;}),k0=F.map(e=>e.g.children.length);BEY.dbg=[];log=[];arcs=[];const added=track();wrapHurt();wrapArc();let tb=null,fxEnd=null,mk84=null,brandAt84=null,t0=0;
    try{cast(0);const f=mainFx();t0=time;for(let i=0;i<400;i++){run(.05);if(tb==null&&W8.some(e=>e.eyeT>time))tb=time;if(mk84==null&&!fx.includes(f)){fxEnd=time-t0;mk84=W8.map(e=>marksOn(e).length);brandAt84=W8.every(e=>e.eyeT>time);}if(time-t0>11)break;}}
    finally{hurt=H0;scene.add=S0;nsArc=ARC0;}
    const B=F.filter(e=>e.eyeM),T=lashT(150);M0={T,tb,t0,c,B,lost:B.map(e=>log.filter(h=>h.e===e&&h.spell==='bloodeye').reduce((s,h)=>s+h.lost,0))};
    ok('Mastery 0: no mastery options (the plain cast)',!ev('cast').length&&!ev('open').length,BEY.dbg.length);
    ok('Mastery 0: it brands the 6 strongest foes within 8 tiles of where it looks (stronger ones 8-10 tiles off are left), for 8s, at x1.35',same(B,W8)&&W8.every(e=>near(e.eyeT,tb+8,1e-9)&&e.eyeM===1.35)&&ring0.length>0&&ring0.every(e=>!e.eyeM),B.length+' branded, '+ring0.length+' strong ones 8-10 tiles off');
    ok('Mastery 0: 6 lashes, from 1.6s, at least 0.4s apart and all before 4s, each striking every brand 150%, which takes 202.5 off it',T.length===6&&T.every((t,i)=>!i||t-T[i-1]>=.4-1e-9&&t-T[i-1]<=.45+1e-9)&&T.every(t=>log.filter(h=>h.t===t&&h.spell==='bloodeye').length===6&&W8.every(e=>log.some(h=>h.t===t&&h.e===e&&near(h.amt,150)&&near(h.lost,202.5))))&&log.filter(h=>h.spell==='bloodeye').length===36,T.map(t=>(t-T[0]).toFixed(2)).join(','));
    ok('Mastery 0: the bolts are width 1.3 with 2 branches, from the eye down to each brand',arcs.length===36&&arcs.every(a=>a.w===1.3&&a.br===2&&a.A.y>a.B.y),arcs.length);
    ok('Mastery 0: as before, the cast ends at 8.4s and takes its brand marks with it while the brands still hold (until 9.6s)',near(fxEnd,8.4,.01)&&brandAt84&&mk84.every(n=>n===0),fxEnd+' '+mk84.join(','));
    ok('Mastery 0: nothing left behind (no objects in the scene, no marks on the foes)',left(added)===0&&F.every((e,i)=>e.g.children.length===k0[i]),left(added));}
  /* the brand strikes for everything: another source's hit on a branded foe takes x1.35, on others x1 */
  {const F=stage();cast(0);run(1.75);const b=F.find(e=>e.eyeT>time),u=F.find(e=>!(e.eyeT>time));const hb=b.hp,hu=u.hp;hurt(b,100,'magic',{});hurt(u,100,'magic',{});
    ok('Mastery 0: a branded foe takes 35% more from everything else too (100 from another source takes 135; an unbranded foe 100)',near(hb-b.hp,135)&&near(hu-u.hp,100),(hb-b.hp)+' / '+(hu-u.hp));run(9);}
  /* the defaults given as options (only a log added) are the same cast */
  {const F=stage(12),c=densest(F);for(const e of F){const q=(e.x-c.x)**2+(e.z-c.z)**2;if(q>=64&&q<100)e.maxHp=e.hp=3e7+e.maxHp;else if(q>=100)e.maxHp=e.hp=5e7+e.maxHp;}
    BEY.dbg=[];log=[];wrapHurt();let W=null;const t0=time;try{setL(0);castBloodEye(heroU,F.slice(),100,oC(),dbgX());W=watch(ev('open')[0],11);}finally{hurt=H0;}
    const B=F.filter(e=>e.eyeM),T=lashT(150),lost=B.map(e=>log.filter(h=>h.e===e&&h.spell==='bloodeye').reduce((s,h)=>s+h.lost,0));
    ok('the defaults with only a log are the old cast: the same aim, brands, lash moments and damage as Mastery 0',M0&&near(ev('brand')[0].cx,M0.c.x)&&B.length===M0.B.length&&T.length===M0.T.length&&T.every((t,i)=>near(t-t0,M0.T[i]-M0.t0,1e-6))&&lost.every((v,i)=>near(v,M0.lost[i])),T.length+' lashes, '+lost.join(','));
    ok('the defaults: the eye grows to 1.2 and the cast ends at 8.4s',near(W.eyeMax,1.2,1e-6)&&near(W.fxEnd,8.4,.01),W.eyeMax+' '+W.fxEnd);
    M0.runeW=runeR(ev('open')[0].rune);}
  /* ---- Mastery 1: Wider Gaze ---- */
  {const F=stage(12),c=densest(F);for(const e of F){const q=(e.x-c.x)**2+(e.z-c.z)**2;if(q>=64&&q<100)e.maxHp=e.hp=3e7+e.maxHp;else if(q>=100)e.maxHp=e.hp=5e7+e.maxHp;}
    const W10=want(F,c,10,7),ring=F.filter(e=>{const q=(e.x-c.x)**2+(e.z-c.z)**2;return q>=64&&q<100;});BEY.dbg=[];log=[];const added=track();wrapHurt();let W=null,tb=null;
    try{cast(1);const o=ev('open')[0];o.marks=ev('marks')[0].marks;const t0=time;W={eyeMax:0,mk:[]};for(let i=0;i<300;i++){run(.05);W.eyeMax=Math.max(W.eyeMax,o.E.g.scale.x);if(tb==null&&ev('brand').length)tb=time;if(tb!=null)W.mk.push([time-tb,W10.map(e=>marksOn(e).length)]);}}finally{hurt=H0;scene.add=S0;}
    const X=ev('cast')[0].X,B=ev('brand')[0].L,rw=runeR(ev('open')[0].rune);
    ok('Mastery 1: it brands the 7 strongest within 10 tiles: the strong foes 8-10 tiles off now among them, those past 10 still not',ring.length>=1&&same(B,W10)&&ring.some(e=>B.includes(e))&&B.every(e=>(e.x-c.x)**2+(e.z-c.z)**2<100)&&!F.some(e=>(e.x-c.x)**2+(e.z-c.z)**2>=100&&e.eyeM),B.length+' branded, '+ring.length+' in the 8-10 ring');
    ok('Mastery 1: the brand is still 35% for 8s; the lashes still 6 of 150%',B.every(e=>e.eyeM===1.35&&near(e.eyeT,tb+8,1e-9))&&lashT(150).length===6&&ev('lash').length===6);
    ok('Mastery 1: the eye a tenth larger (1.32), its gaze sweeping wider (x1.3), a larger rune (1.85)',near(W.eyeMax,1.32,1e-6)&&X.eyeS===1.32&&X.wan===1.3&&X.runeR===1.85&&ev('open')[0].D.runeR===1.85&&rw/1.85>.95&&rw/1.85<1.12&&M0.runeW/1.6>.95&&M0.runeW/1.6<1.12&&rw/M0.runeW>1.04,W.eyeMax+' rune '+rw.toFixed(3)+' (Mastery 0: '+M0.runeW.toFixed(3)+')');
    const k79=W.mk.find(q=>q[0]>=7.9),k81=W.mk.find(q=>q[0]>=8.1);
    ok('Mastery 1: the brand marks last as long as the brands do (to 8s after branding, past the old 8.4s cast), then go',k79&&k79[1].every(n=>n===1)&&k81&&k81[1].every(n=>n===0),k79&&k79[1].join(''));
    ok('Mastery 1: nothing left behind',left(added)===0&&F.every(e=>!marksOn(e).length),left(added));}
  /* ---- Mastery 2: Bloodshot Brand ---- */
  {const F=stage();BEY.dbg=[];log=[];const added=track();wrapHurt();let tb=null,o=null,sz=null,pulse=[1,1],eg85=null;const hit={};
    try{cast(2);o=ev('open')[0];const MK=ev('marks')[0].marks,t0=time;for(let i=0;i<300;i++){run(.05);if(tb==null&&ev('brand').length){tb=time;}if(!eg85&&time-t0>=8.5)eg85=[!!o.E.g.parent,!!o.rune.parent,MK.length,darkTarget,vigTarget];
        if(tb!=null&&MK.length){const g=MK[0].g;if(!sz)sz=g.children.map(m=>[m.geometry.parameters.radius,m.material.color.getHex(),m.material.blending,m.material.opacity]);const s1=g.children[1].scale.x;pulse=[Math.min(pulse[0],s1),Math.max(pulse[1],s1)];}
        const T=tb==null?-1:time-tb;for(const [k,at] of [['a',9.8],['b',10.15]])if(!hit[k]&&T>=at){const b=ev('brand')[0].L[0],u=F.find(e=>!ev('brand')[0].L.includes(e));const hb=b.hp,hu=u.hp;H0(b,100,'magic',{});H0(u,100,'magic',{});hit[k]=[hb-b.hp,hu-u.hp,marksOn(b).length];}}}
    finally{hurt=H0;scene.add=S0;}
    const B=ev('brand')[0].L;
    ok('Mastery 2: branded foes take 40% more for 10s',B.length===7&&B.every(e=>e.eyeM===1.4&&near(e.eyeT,tb+10,1e-9)),B.map(e=>e.eyeM).join(','));
    ok('Mastery 2: each lash (still 150%) takes 210 off a brand',lashT(150).length===6&&log.filter(h=>h.spell==='bloodeye').every(h=>near(h.lost,210)),[...new Set(log.filter(h=>h.spell==='bloodeye').map(h=>h.lost))].join(','));
    ok('Mastery 2: for everything else too: 100 takes 140 off a brand at 9.8s and 100 at 10.15s (an unbranded foe 100 both times)',hit.a&&near(hit.a[0],140)&&near(hit.a[1],100)&&hit.b&&near(hit.b[0],100)&&near(hit.b[1],100),JSON.stringify(hit));
    ok('Mastery 2: the brand marks stay all 10s and go with the brand',hit.a&&hit.a[2]===1&&hit.b&&hit.b[2]===0&&F.every(e=>!marksOn(e).length));
    /* (the radii within 1%: ico() shares its geometries by radius to 3 decimals, so another spell's 0.1676 can serve for 0.168) */
    ok('Mastery 2: brands drawn bigger (x1.2) in deeper reds, with a dark red glow round them, pulsing harder (x0.55-1.45)',sz&&near(sz[0][0],.06,.01)&&sz[0][1]===0xff1028&&near(sz[1][0],.168,.01)&&sz[1][1]===0xd8061c&&sz[1][2]===THREE.AdditiveBlending&&sz[2]&&near(sz[2][0],.192,.01)&&sz[2][1]===0x7a000e&&sz[2][2]===THREE.NormalBlending&&pulse[0]<.6&&pulse[1]>1.4,JSON.stringify(sz)+' '+pulse.map(v=>v.toFixed(2)));
    ok('Mastery 2: the eye, its rune and the darkness end at 8.4s as before (the brands still on); the cast itself once its brands are gone; nothing left behind',eg85&&!eg85[0]&&!eg85[1]&&eg85[2]===7&&eg85[3]===0&&eg85[4]===0&&left(added)===0&&!mainFx()&&!o.E.g.parent&&!o.rune.parent,JSON.stringify(eg85)+' '+left(added));}
  /* ---- Mastery 3: Lashing Storm ---- */
  {const F=stage();BEY.dbg=[];log=[];arcs=[];wrapHurt();wrapArc();const t0=time;try{cast(3);run(14);}finally{hurt=H0;nsArc=ARC0;}
    const T=lashT(140),B=ev('brand')[0].L,L=ev('lash');
    ok('Mastery 3: 7 lashes (6 before), at least 0.34s apart, all before 4s into the cast',T.length===7&&L.length===7&&T.every((t,i)=>!i||t-T[i-1]>=.34-1e-9&&t-T[i-1]<=.35+1e-9)&&T[6]-t0<4+1e-9,T.map(t=>(t-t0).toFixed(2)).join(','));
    ok('Mastery 3: each strikes every brand 140% (150% before), which takes 196 off it',T.every(t=>B.every(e=>log.some(h=>h.t===t&&h.e===e&&near(h.amt,140)&&near(h.lost,196))))&&log.filter(h=>h.spell==='bloodeye').length===49&&!log.some(h=>near(h.amt,150)),log.filter(h=>h.spell==='bloodeye').length);
    ok('Mastery 3: thicker bolts (width 1.6, 1.3 before) with three branches (two before)',arcs.length===49&&arcs.every(a=>a.w===1.6&&a.br===3),arcs.length);
    ok('Mastery 3: no moving on and no last look yet',!ev('fall').length&&!ev('last').length);}
  /* (Mastery 3: a brand that dies is not replaced) */
  {const F=stage();BEY.dbg=[];cast(3);run(1.75);const b=ev('brand')[0].L[0];hurt(b,1e13,'magic',{});run(.1);
    ok('Mastery 3: a brand that dies is not replaced',b.dead&&!ev('fall').length&&!ev('move').length&&F.filter(e=>!e.dead&&e.eyeT>time).length===6);run(12);}
  /* ---- Mastery 4: The Gaze Moves On ---- */
  {const F=stage(12);BEY.dbg=[];log=[];const added=track();wrapHurt();let c=null;const exp=[],kills=[],grow=[];
    try{cast(4);const t0=time,MK=ev('marks')[0].marks;run(1.75);c={x:ev('brand')[0].cx,z:ev('brand')[0].cz};
      /* every 0.15s a brand dies: the gaze should swing to the strongest unbranded foe still alive in reach, six times, then no more */
      for(let k=0;k<7;k++){const b=MK.find(m=>!m.e.dead&&!m.sw)||MK.find(m=>!m.e.dead);hurt(b.e,1e13,'magic',{});kills.push(b.e);
        const W=enemies.filter(e=>!e.dead&&!(e.eyeT>time)&&(e.x-c.x)**2+(e.z-c.z)**2<100).sort((a,b)=>nsStrong(b)-nsStrong(a))[0];exp.push(k<6?W:null);
        for(let i=0;i<3;i++){run(.05);const m=ev('move')[k];if(m)grow.push([time-m.t,m.m.g.scale.x]);}}
      /* after the lids begin to close (4.1s) a fallen brand is not replaced */
      run(Math.max(0,4.15-(time-t0)));const late=MK.find(m=>!m.e.dead);hurt(late.e,1e13,'magic',{});kills.push(late.e);run(.1);run(12);}finally{hurt=H0;scene.add=S0;}
    const Fa=ev('fall'),Mo=ev('move');
    ok('Mastery 4: each of the first six brands to die passes the gaze to the strongest unbranded foe in reach (10 tiles)',Mo.length===6&&Mo.every((m,i)=>m.e===exp[i]&&m.from===kills[i]&&m.n===i+1)&&Mo.every(m=>(m.e.x-c.x)**2+(m.e.z-c.z)**2<100),Mo.map(m=>Math.round(m.e.maxHp/1000)).join(','));
    ok('Mastery 4: the seventh is not replaced (up to 6 more), nor one that dies after the lids begin to close',Fa.length===8&&!Fa[6].to&&!Fa[7].to&&Fa[7].tt>=4.1,Fa.map(f=>f.to?'+':'-').join('')+' '+Fa[7].tt.toFixed(2));
    ok('Mastery 4: a new brand holds 10s at x1.4 like the first ones, and the lashes after it strike it too',Mo.every(m=>m.e.eyeM===1.4&&near(m.e.eyeT,m.t+10,1e-9)&&log.some(h=>h.e===m.e&&h.t>m.t&&h.spell==='bloodeye'&&near(h.amt,140))));
    ok('Mastery 4: the gaze beam swings to it and its mark grows in over 0.3s (from nothing to full)',grow.length>=12&&grow.some(g=>g[1]<.5)&&Mo.every(m=>m.m.sw&&m.m.sw.hit),grow.slice(0,3).map(g=>g[1].toFixed(2)).join(','));
    ok('Mastery 4: nothing left behind',left(added)===0&&F.every(e=>!marksOn(e).length),left(added));}
  /* ---- Mastery 5: The Last Look ---- */
  {const F=stage(12);BEY.dbg=[];log=[];arcs=[];const added=track();wrapHurt();wrapArc();let W=null,t0=null,mv=null;
    try{cast(5);t0=time;const o=ev('open')[0];o.marks=ev('marks')[0].marks;run(2.1);const b=o.marks[0].e;hurt(b,1e13,'magic',{});W=watch(o,20,t0);mv=ev('move')[0];}finally{hurt=H0;scene.add=S0;nsArc=ARC0;}
    const La=ev('last'),la=La[0],B=la?la.H:[],at=la?la.t:0,lt=at-t0,bigA=arcs.filter(a=>a.t===at);
    ok('Mastery 5: once, just before the lids close (4s), one great lash strikes every brand 200% at once, the one the gaze moved to too',La.length===1&&lt>=4-1e-9&&lt<4.1&&B.length===7&&mv&&B.includes(mv.e)&&B.every(e=>log.some(h=>h.e===e&&h.t===at&&near(h.amt,200)&&near(h.lost,280)))&&log.filter(h=>h.t===at&&h.spell==='bloodeye').length===7,lt.toFixed(2)+' '+B.length);
    ok('Mastery 5: it renews each brand (10s from then)',B.every(e=>near(e.eyeT,at+10,1e-9)));
    ok('Mastery 5: the same blood lightning, twice as thick (3.2), from every brand up to the eye',bigA.length===7&&bigA.every(a=>a.w===3.2&&a.br===3&&a.A.y<a.B.y),bigA.map(a=>a.w).join(','));
    const em=W.emis,pk=em.reduce((m,q)=>q[1]>m[1]?q:m,[0,0]),aft=em.find(q=>q[0]>=4.6);
    ok('Mastery 5: the iris flares into it (its light from 0.5 up to 1.6 at the strike) and settles again',near(pk[1],1.6,.02)&&Math.abs(pk[0]-lt)<.06&&em.filter(q=>q[0]<3.5).every(q=>near(q[1],.5))&&aft&&near(aft[1],.5),pk.map(v=>v.toFixed(2)).join('@'));
    const mkAt=T=>{const q=W.mk.find(q=>q[0]>=T);return q?q[1]:-1;};
    ok('Mastery 5: the renewed brands keep their marks until they run out (14s), and the cast then ends',mkAt(13.8)===7&&W.mk.some(q=>q[1]===0)&&W.fxEnd!=null&&W.fxEnd>=13.9&&W.fxEnd<14.3,mkAt(13.8)+' '+W.fxEnd);
    ok('Mastery 5: nothing left behind',left(added)===0&&F.every(e=>!marksOn(e).length),left(added));}
  /* ---- echoes and other casters cast the old spell ---- */
  {const F=stage(12);BEY.dbg=[];log=[];wrapHurt();try{cast(5,{smx:1});run(11);}finally{hurt=H0;}
    const B=F.filter(e=>e.eyeM);ok('an echo (o.smx) at Mastery 5 casts the old spell (6 brands at x1.35, 6 lashes of 150%, no last look)',!ev('cast').length&&B.length===6&&B.every(e=>e.eyeM===1.35)&&lashT(150).length===6&&!log.some(h=>near(h.amt,200)),B.length);}
  /* ---- the real path: fireScroll at every mastery (Secret casts arrive a second later), with the mastery's factor ---- */
  {const R=[];for(let L=0;L<=5;L++){const F=stage();setL(L);meta.spells.bloodeye=meta.spells.bloodeye||{lvl:1,hero:null};meta.spells.bloodeye.lvl=1;heroU.scd={};heroU.gcd=0;BEY.dbg=[];log=[];wrapHurt();
      let P=0;try{const s=tStats(heroU);P=scrollPow(heroU,'bloodeye',s,1);fireScroll(heroU,'bloodeye',s,sortTargets(heroU,F.slice()));run(5);}finally{hurt=H0;}
      const lash=L>=3?1.4:1.5,H=log.filter(h=>h.spell==='bloodeye'&&near(h.amt,P*lash,1e-9)),C=ev('cast')[0];
      R.push([L,H.length>=6*(L?7:6),L?C&&C.L===L:!C,near(P/scrollPow(heroU,'bloodeye',tStats(heroU),1),1,1e-9),L?near(smP('bloodeye'),SMG.bloodeye[L-1]):smP('bloodeye')===1]);run(12);}
    ok('the real fireScroll path at every mastery: the cast arrives with its mastery and its factor, and every lash strikes P x its share',R.every(r=>r[1]&&r[2]&&r[3]&&r[4]),JSON.stringify(R));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n').slice(0,3).join(' | '));}
finally{console.error=ce;hurt=H0;scene.add=S0;nsArc=ARC0;BEY.dbg=null;window.__fz=false;
  try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
