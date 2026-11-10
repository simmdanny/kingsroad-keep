(function(){
/* Never-Never Land's masteries (v463). Run on the dev page: __kk.ev(await (await fetch('/tests/nvm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road every 0.55 tiles round the point nearest the hero (so a shooting star's splash of 0.5 tiles misses its
   neighbours and one of 0.6 reaches them); the game is stepped (update and updFx), hurt is wrapped to log the amount each hit is called
   with (the scroll's power is 100: a star 220 on its foe and 100 around it, a lash 500, the last fall 1000; the domain's own share of damage
   taken, 25%, is added below that wrapper and checked on its own). Every mastered cast logs its domain (NVM.dbg: its numbers, root and glint
   pool), every star where it lands (its foe and the foes it splashed), every lash as it snaps (its square, the foes it struck and where every
   foe stood, their holds), the finale's great stars and the last fall, so who should be struck, and how hard, is checked exactly.
   Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,MC0=THREE.Material.prototype.clone;
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
function foe(d,hp){const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.2,d));e.off=0;e.hp=e.maxHp=hp||1e8;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
const stage=(n,sp)=>{go();const d0=mid(),F=[];n=n||15;sp=sp||.55;for(let i=0;i<n;i++)F.push(foe(d0+(i-(n-1)/2)*sp));return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.never=SM_XP[L-1];else delete meta.smast.never;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'light',anc:true,spell:'never'},x||{});
const cast=(L,x)=>{setL(L);heroU.anim={k:'never',t:0,d:ANIM_D.never};castScrollNow('never',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oC(x));worldSlow=1;slowT=0;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>NVM.dbg.filter(d=>d.ev===n);
const dbgX=x=>Object.assign({log:d=>{d.t=time;NVM.dbg.push(d);}},x||{});
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
/* glint materials made (each base glint clones one; a mastered cast clones its pool once, at the cast) */
let gClones=0;const GLINT_SIG='float dg=exp(-abs(d.x-d.y)*45.)';const countClones=()=>{gClones=0;THREE.Material.prototype.clone=function(){if(this.fragmentShader&&this.fragmentShader.indexOf(GLINT_SIG)>=0)gClones++;return MC0.apply(this,arguments);};};
const amounts=()=>[...new Set(log.map(h=>Math.round(h.amt*1e6)/1e6))].sort((a,b)=>a-b);
const T=()=>NVR.S?NVR.S.T:99;
const runTo=t=>{let n=0;while(NVR.S&&NVR.S.T<t-1e-9&&n++<2000)run(.05);};
const runOut=()=>{let n=0;while(ANC.live.never&&n++<600)run(.05);run(.5);};
/* the parts of the domain, found by their materials */
const parts=c=>{const P={shots:[],ribbons:[]};c.root.traverse(o=>{const u=o.material&&o.material.uniforms;if(!u)return;if(o.isPoints&&u.uFall&&!P.stars)P.stars=o;if(u.uMer)P.dome=o;if(u.uSnap)P.ribbons.push(o);if(o.geometry&&o.geometry.type==='TubeGeometry')P.wind=o;});
  P.shots=c.root.children.filter(g=>g.isGroup&&g.children.length===3&&g.children[1].geometry&&g.children[1].geometry.parameters&&g.children[1].geometry.parameters.radius===.06);return P;};
/* one whole cast, stepped, with samples of the sky, the shots' sizes and the glints; at: [[T, fn], ...] run once each as the domain reaches T */
function watch(c,at){const W={uT:[],wT:[],wr:[],sky:[],mer:[],hd:new Set(),gs:new Set(),ribW:new Set(),swell:null};let P=parts(c);
  for(let i=0;i<500;i++){run(.05);const t=c.S.T;P=parts(c);for(const a of at||[])if(!a.done&&t>=a[0]-1e-9){a.done=1;a[1]();}if(P.stars)W.swell=P.stars.material.uniforms.uSwell.value;if(P.stars){W.uT.push([t,P.stars.material.uniforms.uT.value]);W.sky.push([t,P.stars.parent.rotation.y]);}if(P.wind){W.wT.push([t,P.wind.material.uniforms.uT.value]);W.wr.push([t,P.wind.rotation.y]);}
    if(P.dome)W.mer.push([t,P.dome.material.uniforms.uMer.value]);for(const g of P.shots)W.hd.add(Math.round(g.children[1].scale.x*1e4)/1e4);for(const G of c.GP)if(G.on)W.gs.add(G.size);
    for(const m of P.ribbons){const p=m.geometry.attributes.position.array;W.ribW.add(Math.round(Math.hypot(p[0]-p[3],p[2]-p[5])*1e4)/1e4);}
    if(!ANC.live.never)break;}
  return W;}
/* every star: its foe 220 (x k) at the moment it lands, every other foe within r of where it landed 100, and only those */
function starsOk(r,kS,kP){const S=ev('star'),bad=[];let n1=0,n2=0,far=0;for(const s of S){const at=log.filter(h=>h.t===s.t);
    if(!at.some(h=>h.e===s.e&&near(h.amt,kS)))bad.push('foe@'+s.t.toFixed(2));n1++;
    const want=enemies.filter(q=>!q.dead&&q!==s.e&&(q.x-s.x)**2+(q.z-s.z)**2<r*r);if(want.length!==s.H.length||want.some(q=>!s.H.includes(q)))bad.push('splash@'+s.t.toFixed(2));
    for(const q of s.H){n2++;if(!at.some(h=>h.e===q&&near(h.amt,kP)))bad.push('spl@'+s.t.toFixed(2));if((q.x-s.x)**2+(q.z-s.z)**2>.25)far++;}}
  return{n:S.length,n1,n2,far,bad,ok:!bad.length&&log.filter(h=>near(h.amt,kS)).length>=n1};}
/* every lash: 500 to the foes inside its rotated square (of half side h) as it snaps, and only those, each held */
function lashOk(h,kL,hold,holdB){const Q=ev('lash'),bad=[];for(const q of Q){if(!near(q.h,h,1e-9))bad.push('h'+q.h.toFixed(3));const c=Math.cos(-q.rot-Math.PI/4),sn=Math.sin(-q.rot-Math.PI/4);
    const want=q.XZ.filter(([e,x,z])=>{const dx=x-q.cx,dz=z-q.cz,u=dx*c-dz*sn,v=dx*sn+dz*c;return Math.abs(u)<=h&&Math.abs(v)<=h;}).map(a=>a[0]);
    if(want.length!==q.H.length||want.some(e=>!q.H.includes(e)))bad.push('set@'+q.T.toFixed(2));const at=log.filter(x=>x.t===q.t);for(const e of q.H)if(!at.some(x=>x.e===e&&near(x.amt,kL)))bad.push('amt@'+q.T.toFixed(2));}
  const q0=Q[0],st=q0?q0.H.map((e,i)=>[e.boss,q0.St[i]]):[];const holds=st.every(([b,s])=>near(s,b?holdB:hold,1e-9));
  return{n:Q.length,T:Q.map(q=>q.T.toFixed(2)).join(','),bad,holds,inside:Q.map(q=>q.H.length).join('/'),ok:!bad.length&&holds&&Q.every(q=>q.H.length>0)};}
const finOk=k=>{const f=ev('finHit')[0];if(!f)return{ok:false};const at=log.filter(h=>h.t===f.t);return{ok:f.A.length>0&&f.A.every(e=>at.some(h=>h.e===e&&near(h.amt,k))),n:f.A.length,f};};
/* the domain's own share of damage taken, the stillness and the crawl, at a moment of the cast */
const vulnAt=e=>{const h=e.hp;hurt(e,100,'magic',{src:null});return Math.round((h-e.hp)*1e4)/1e4;};
try{
  /* ---- the card ---- */
  ok('the five masteries: Falling Stars, The Stopped Hour, Lash of Stars, Sylph\'s Hour, Rain of Stars (v463)',SM_D.never.map(x=>x.n).join('|')==='Falling Stars|The Stopped Hour|Lash of Stars|Sylph\u2019s Hour|Rain of Stars',SM_D.never.map(x=>x.n).join('|'));
  const d=i=>smDesc('never',i);
  ok('the numbers on the card are the ones in the code (0.36s, 39, 0.6 tiles; 2.6s, 15%, 50%; 2.8s, 5 lashes, 0.8s; 50%, 25%, 35%; 1300%, 36, 220%)',
    /0\.36s/.test(d(0))&&/0\.45s before/.test(d(0))&&/39/.test(d(0))&&/0\.6 tiles/.test(d(0))&&/2\.6s/.test(d(1))&&/1\.8s before/.test(d(1))&&/15%/.test(d(1))&&/50%/.test(d(1))&&/25% before/.test(d(1))
    &&/2\.8s/.test(d(2))&&/3\.5s before/.test(d(2))&&/5 lashes/.test(d(2))&&/0\.8s/.test(d(2))&&/50% slower/.test(d(3))&&/40% before/.test(d(3))&&/25%/.test(d(3))&&/35% faster/.test(d(3))&&/1300%/.test(d(4))&&/1000% before/.test(d(4))&&/36/.test(d(4))&&/220%/.test(d(4))
    &&NVM.starP===.36&&NVM.splR===.6&&NVM.stop===2.6&&NVM.stopB===.15&&NVM.vulnS===1.5&&NVM.lashP===2.8&&NVM.lashR===1.6&&NVM.hold===.8&&NVM.slow===.5&&NVM.slowB===.25&&NVM.rate===1.35&&NVM.fin===13&&NVM.finStar===2.2&&NVM.finN===36,d(1)+' / '+d(4));
  ok('no hooks of their own (the masteries live in the cast); calibrated with hidden factors near 1',!SMF.never.hit&&!SMF.never.cast&&SMA.never.every(x=>x===1)&&SMG.never.length===5&&SMG.never.every(x=>x>=.9&&x<=1.1),SMG.never.join());
  ok('the defaults table is the old cast (stillness 1.8s, bosses 25%; 40% and 20% slower; 25% more taken; towers 25% faster; a star every 0.45s, 220% and 100% within 0.5; a lash every 3.5s over 1.35, 500%, held 0.6s; 1000% at the end; the great stars only a picture)',
    NVR.STOP===1.8&&NVR.stopB===.25&&NVR.slow===.4&&NVR.slowB===.2&&NVR.vuln===1.25&&NVR.rate===1.25&&NVR.starP===.45&&NVR.star===2.2&&NVR.spl===1&&NVR.splR===.5&&NVR.lashP===3.5&&NVR.lashR===1.35&&NVR.lash===5&&NVR.hold===.6&&NVR.holdB===.2&&NVR.fin===10
    &&!NVR.vulnS&&!NVR.finStar&&NVR.finN===18&&NVR.starS===1&&NVR.glS===1.6&&NVR.glB===2.4&&!NVR.stopFx&&NVR.lashW===.11&&NVR.lashSnap===1&&NVR.lashG===1.1&&NVR.skyW===.035&&NVR.flap===9&&NVR.swell===1.4&&!NVR.gPool&&!NVR.log);
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage();run(.5);
  /* ---- the defaults given as options (only a log added) are the same cast ---- */
  {const F=stage(),added=track();NVM.dbg=[];log=[];let W=null,c=null,v=[],f=[];countClones();wrapHurt();
    try{setL(0);castNever(heroU,100,oC(),dbgX());c=ev('cast')[0];const at=t=>[t,()=>{v.push(vulnAt(F[0]));f.push(ancF(F[0]),ancF({boss:true}));}];W=watch(c,[at(3.5),at(5)]);runOut();}
    finally{hurt=H0;scene.add=S0;THREE.Material.prototype.clone=MC0;}
    ok('the defaults: time stands still until 4.8s (bosses at 25%), then foes move 40% slower (bosses 20%), and take 25% more from everything throughout',c&&c.K.STOP===1.8&&f[0]===0&&near(f[1],.25)&&near(f[2],.6)&&near(f[3],.8)&&v[0]===125&&v[1]===125,f.map(x=>x.toFixed(2)).join(',')+' '+v.join(','));
    const St=starsOk(.5,220,100);ok('the defaults: about 31 shooting stars, each 220% on its foe and 100% to the foes within 0.5 tiles of where it lands, and only those',St.ok&&St.n>=30&&St.n<=32&&St.far===0,St.n+' stars, '+St.n2+' splashed '+St.bad.slice(0,4).join(' '));
    const La=lashOk(1.35/Math.SQRT2+.38,500,.6,.2);ok('the defaults: 4 lashes (as each snaps at 5.3, 8.8, 12.3, 15.8s), 500% to the foes inside the square of four stars round the thickest crowd, held 0.6s',La.ok&&La.n===4&&W.ribW.size===1&&W.ribW.has(.11),La.n+' lashes at '+La.T+', '+La.inside+' struck '+La.bad.slice(0,4).join(' ')+' width '+[...W.ribW].join(','));
    const Fi=finOk(1000);ok('the defaults: the last fall strikes every foe 1000%, and the great stars strike nothing',Fi.ok&&Fi.n===F.length&&!ev('great').length&&!ev('fin').length&&amounts().every(a=>[100,220,500,1000].includes(a)),Fi.n+' foes, '+amounts().join(','));
    ok('the defaults: the sky keeps its clock (the stars twinkle on through the stillness, the meridians never glow), the old sizes (shots x1, glints from a material each)',W.uT.filter(([t])=>t>3.1&&t<4.7).map(a=>a[1]).every((u,i,A)=>!i||u>A[i-1])&&W.mer.every(([t,m])=>m===0)&&[...W.hd].every(s=>s===1||s===1.6)&&!c.GP.length&&gClones>=30,'glint materials '+gClones+', shots '+[...W.hd].join(','));
    ok('the defaults: nothing left behind (the domain, its time and its share all gone)',left(added)===0&&!ANC.live.never&&NVR.S===null&&ANC.fs.never===undefined&&ancF(F[0])===1&&vulnAt(F[1])===100,left(added)+' left');}
  {const F=stage();NVM.dbg=[];log=[];wrapHurt();try{cast(0);runOut();}finally{hurt=H0;}
    ok('Mastery 0: the old cast (31 stars, 4 lashes, the last fall 1000%), no mastery events',!NVM.dbg.length&&amounts().every(a=>[100,220,500,1000].includes(a))&&log.filter(h=>h.amt===500).length>0&&log.filter(h=>h.amt===1000).length===F.length,amounts().join(','));}
  /* ---- M1 Falling Stars ---- */
  {const F=stage();NVM.dbg=[];log=[];let W=null,c=null;countClones();wrapHurt();try{cast(1);c=ev('cast')[0];W=watch(c);runOut();}finally{hurt=H0;THREE.Material.prototype.clone=MC0;setL(0);}
    const St=starsOk(.6,220,100);
    ok('M1: a shooting star every 0.36s (0.45s before): about 39 (31 before)',c.K.starP===.36&&St.n>=37&&St.n<=39,St.n+' stars');
    ok('M1: each 220% on its foe and 100% to every foe within 0.6 tiles of where it lands (0.5 before), and only those; its neighbours 0.55 away are struck now',St.ok&&St.far>0,St.n2+' splashed, '+St.far+' of them past 0.5 '+St.bad.slice(0,4).join(' '));
    ok('M1: heads, halos and tails a quarter larger (x1.25; the great stars as before, x1.6), a bigger glint where they strike (2.0, 1.6 before)',W.hd.has(1.25)&&[...W.hd].every(s=>s===1.25||s===1.6)&&W.gs.has(2)&&!W.gs.has(1.6),'shots '+[...W.hd].join(',')+' glints '+[...W.gs].join(','));
    ok('M1: the glints come from a pool of 32 made with the cast (no material made for each glint)',c.GP.length===32&&gClones===32,gClones+' glint materials');
    ok('M1: the rest as before (stillness 1.8s, 4 lashes, the last fall 1000%)',c.K.STOP===1.8&&lashOk(1.35/Math.SQRT2+.38,500,.6,.2).n===4&&finOk(1000).ok&&!ev('great').length);}
  /* ---- M2 The Stopped Hour ---- */
  {const F=stage();F[3].boss=true;NVM.dbg=[];log=[];let W=null,c=null,v=[],f=[];wrapHurt();
    try{cast(2);c=ev('cast')[0];const at=t=>[t,()=>{v.push(vulnAt(F[0]));f.push(ancF(F[0]),ancF(F[3]));}];W=watch(c,[at(3.5),at(5.45),at(5.75)]);runOut();}finally{hurt=H0;setL(0);}
    ok('M2: time stands still for 2.6s (1.8s before), bosses at 15% (25%), then the old crawl (40% and 20% slower)',f[0]===0&&near(f[1],.15)&&f[2]===0&&near(f[3],.15)&&near(f[4],.6)&&near(f[5],.8),f.map(x=>x.toFixed(2)).join(','));
    ok('M2: foes held in it take 50% more from everything (25% before), and 25% once time crawls',v[0]===150&&v[1]===150&&v[2]===125,v.join(','));
    const L0=ev('lash')[0];ok('M2: the first lash lands inside the stillness (it snaps at 5.3s, the stillness ends at 5.6s)',L0&&L0.T<5.6&&L0.T>5,L0&&L0.T.toFixed(2));
    const still=W.uT.filter(([t])=>t>3.06&&t<5.55),after=W.uT.filter(([t])=>t>5.7&&t<7),ws=W.wT.filter(([t])=>t>3.06&&t<5.55),wr=W.wr.filter(([t])=>t>3.06&&t<5.55);
    ok('M2: while it holds, the stars stop twinkling and Sylph\'s wind stands still (their clocks and the wind\'s turn stop), and go on after',still.length>40&&still.every(a=>a[1]===still[0][1])&&ws.every(a=>a[1]===ws[0][1])&&wr.every(a=>a[1]===wr[0][1])&&after.every((a,i)=>!i||a[1]>after[i-1][1]));
    const mer=t=>{let b=null;for(const m of W.mer)if(m[0]<=t+1e-9)b=m[1];return b;};
    ok('M2: the dome\'s meridians glow while it holds (from nothing before 3s, back to nothing after 6s)',mer(2.9)===0&&mer(3.6)>.4&&mer(5.2)>.3&&mer(6.1)===0,[2.9,3.6,5.2,6.1].map(t=>(mer(t)||0).toFixed(2)).join(','));
    ok('M2: the rest as Mastery 1 (39 stars, 0.6 splash, 4 lashes, 1000% at the end)',starsOk(.6,220,100).ok&&ev('star').length>=37&&ev('lash').length===4&&finOk(1000).ok);}
  /* ---- M3 Lash of Stars ---- */
  {const F=stage();F[7].boss=true;NVM.dbg=[];log=[];let W=null,c=null;wrapHurt();try{cast(3);c=ev('cast')[0];W=watch(c);runOut();}finally{hurt=H0;setL(0);}
    const La=lashOk(1.6/Math.SQRT2+.38,500,.8,.2),T5=ev('lash').map(q=>q.T);
    ok('M3: a lash every 2.8s (3.5s before): 5 lashes (4), snapping at 5.3, 8.1, 10.9, 13.7, 16.5s',La.n===5&&[5.3,8.1,10.9,13.7,16.5].every((t,i)=>Math.abs(T5[i]-t)<.08),La.n+' at '+La.T);
    ok('M3: each over a wider square (radius 1.6, 1.35 before), 500% to the foes inside it and only those, holding them 0.8s (0.6s; bosses 0.2s)',La.ok,La.inside+' struck '+La.bad.slice(0,4).join(' ')+(La.holds?'':' holds '+ev('lash')[0].St.join(',')));
    ok('M3: a wider ribbon (0.15, 0.11 before), a whiter snap (x1.5), larger glints at the corners (1.5, 1.1 before)',W.ribW.size===1&&W.ribW.has(.15)&&c.K.lashSnap===1.5&&W.gs.has(1.5)&&!W.gs.has(1.1),[...W.ribW].join(',')+' glints '+[...W.gs].join(','));
    ok('M3: the rest as Mastery 2 (stillness 2.6s, 39 stars, 1000% at the end)',c.K.STOP===2.6&&starsOk(.6,220,100).ok&&finOk(1000).ok);}
  /* ---- M4 Sylph's Hour ---- */
  {const F=stage();F[2].boss=true;let best=null,bd=1e9;for(let r=0;r<H;r++)for(let cc=0;cc<W;cc++){if(grid[r][cc]!==0)continue;const p=tw(cc,r),dd=(p.x-F[0].x)**2+(p.z-F[0].z)**2;if(dd<bd&&dd>1){bd=dd;best=[cc,r];}}
    gold+=buildCost('archer');placeTower('archer',best[0],best[1]);const Tw=towers[towers.length-1];const r0=tStats(Tw).rate;NVM.dbg=[];let c=null,f=[],rr=0,sk=[];
    try{cast(4);c=ev('cast')[0];runTo(7);f.push(ancF(F[0]),ancF(F[2]));rr=tStats(Tw).rate/r0;const P=parts(c);sk.push(P.stars.parent.rotation.y);run(1);sk.push(P.stars.parent.rotation.y);runOut();}finally{setL(0);}
    ok('M4: foes move 50% slower (40% before), bosses 25% (20% before)',near(f[0],.5)&&near(f[1],.75),f.map(x=>x.toFixed(3)).join(','));
    ok('M4: towers attack 35% faster (25% before)',near(rr,1.35,1e-9),rr.toFixed(4));
    ok('M4: the sky wheels faster (0.06 a second, 0.035 before) and Sylph\'s wings beat faster (13, 9 before)',near(sk[1]-sk[0],.06,1e-6)&&c.K.skyW===.06&&c.K.flap===13,(sk[1]-sk[0]).toFixed(4));
    ok('M4: the rest as Mastery 3 (2.6s stillness at 15%, 5 lashes)',c.K.STOP===2.6&&c.K.stopB===.15&&c.K.lashP===2.8);}
  /* ---- M5 Rain of Stars ---- */
  {const F=stage(24,.4),added=track();NVM.dbg=[];log=[];let c=null,W=null;wrapHurt();try{cast(5);c=ev('cast')[0];W=watch(c);runOut();}finally{hurt=H0;scene.add=S0;setL(0);}
    const Fi=finOk(1300),fn=ev('fin')[0],G=ev('great');
    ok('M5: the last fall strikes every foe 1300% (1000% before)',Fi.ok&&Fi.n===F.length,Fi.n);
    ok('M5: the great stars land for real: 36 at most (2 a foe; 24 foes), each 220% on its foe as it lands',fn&&fn.n===36&&G.length===36&&G.every(g=>g.hit&&log.some(h=>h.t===g.t&&h.e===g.e&&near(h.amt,220)))&&F.every(e=>G.filter(g=>g.e===e).length>=1),fn&&fn.n+' great stars, '+G.length+' landed');
    ok('M5: in game time, every one before the last strike (they fall from 17s and land by 18s)',fn&&G.every(g=>g.t<Fi.f.t)&&fn.gp<=.055,fn&&('spacing '+fn.gp.toFixed(3)));
    ok('M5: the falling stars swell larger (2.4x, 1.4x before), the great stars\' glints are bigger (3, 2.4 before)',W.swell===2.4&&c.K.glB===3,'swell '+W.swell);
    ok('M5: bigger glints seen (3), Masteries 1-4 ride it, nothing left behind',W.gs.has(3)&&c.K.starP===.36&&c.K.STOP===2.6&&c.K.lashP===2.8&&c.K.slow===.5&&left(added)===0&&!ANC.live.never&&NVR.S===null,left(added)+' left');}
  {const F=stage(5);NVM.dbg=[];log=[];wrapHurt();try{cast(5);runOut();}finally{hurt=H0;setL(0);}
    const fn=ev('fin')[0];ok('M5: with few foes, two great stars each (5 foes: 10)',fn&&fn.n===10&&ev('great').length===10,fn&&fn.n);}
  /* ---- the rest ---- */
  {const F=stage();NVM.dbg=[];setL(5);let S1=null,T1=0;try{cast(5);runTo(9);S1=NVR.S;T1=S1.T;cast(5);run(.05);}finally{setL(0);}
    ok('casting it again while it is up winds it back and keeps its masteries',NVR.S===S1&&S1.T<T1-3&&S1.K.finStar===2.2&&ev('cast').length===1,S1&&S1.T.toFixed(2));runOut();}
  {const F=stage();NVM.dbg=[];log=[];setL(5);wrapHurt();try{castScrollNow('never',heroU,heroStats(),F.slice(),100,oC({smx:true}));runOut();}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast (an echo) are the old cast',!NVM.dbg.length&&amounts().every(a=>[100,220,500,1000].includes(a))&&log.filter(h=>h.amt===1000).length===F.length,amounts().join(','));}
  {const F=stage();NVM.dbg=[];setL(5);let mats=0;try{cast(5);runTo(4);NVR.S.root.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{if(m.userData&&m.userData.nvp)mats++;});});runOut();}finally{setL(0);}
    const c=ev('cast')[0];ok('a mastered cast can still turn violet: its glint pool too',c&&c.GP.every(G=>G.m.material.userData&&G.m.material.userData.nvp)&&mats>=40,mats);}
  {const e0=errs;const bad=[];for(let L=0;L<=5;L++){const F=stage();meta.spells.never=meta.spells.never||{lvl:1,hero:null};setL(L);const lv=meta.spells.never.lvl||1,P=scrollPow(heroU,'never',tStats(heroU),lv);heroU.scd={};heroU.gcd=0;NVM.dbg=[];log=[];wrapHurt();
      try{fireScroll(heroU,'never',heroStats(),F.slice());run(1.5);runOut();}finally{hurt=H0;}
      const o=ev('opts')[0];if((L?!o||o.L!==L||!ev('finHit').length:!!o)||!log.some(h=>near(h.amt,2.2*P,1e-9)))bad.push(L+':'+(o?o.L:'-')+'/'+(P/100).toFixed(3));}setL(0);
    ok('the real cast path at every mastery (the masteries arrive; a star is 220% of the scroll\'s power with its factor) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;THREE.Material.prototype.clone=MC0;NVM.dbg=null;window.__fz=false;try{for(const f of fx.slice())f.life=0;updFx(.01);resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
