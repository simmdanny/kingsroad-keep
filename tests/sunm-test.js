(function(){
/* Sunflare's masteries as Simon designed them (sunm_b.js). Run on the dev page: __kk.ev(await (await fetch('/tests/sunm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still where they are put (only the effects are stepped, updFx), and hurt is wrapped to log the
   amount each hit is called with (before armour, auras or artifacts), so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++)updFx(.05);};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.sunflare=SM_XP[L-1];else delete meta.smast.sunflare;};
/* the road spot nearest the hero (more than 1.2 away), and its road direction */
const spot=()=>{const R=ROUTES[0];let bd=1e9,bp=null;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bp=p;}}return bp;};
const foe=(x,z,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.x=x;e.z=z;e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot)});return H0.apply(this,arguments);};};
const cast=(T,o)=>castScrollNow('sunflare',heroU,tStats(heroU),[T],100,Object.assign({src:heroU,bane:0,el:'light',anc:false,spell:'sunflare'},o||{}));
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
/* one cast at mastery L on a target T at the road spot, with extra foes at offsets (along the road u, across it v); returns what happened */
function shot(L,extra,secs){play();setL(L);SNF.dbg=[];log=[];const p=spot(),ang=p[2],u=[Math.sin(ang),Math.cos(ang)],v=[Math.cos(ang),-Math.sin(ang)]/* along the road and across it: a segment's angle is atan2(dx,dz) */;
  const T=foe(p[0],p[1]),F=(extra||[]).map(q=>foe(p[0]+u[0]*q[0]+v[0]*q[1],p[1]+u[1]*q[0]+v[1]*q[1],q[2]));
  const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};wrapHurt();
  try{cast(T);let t=0,fxl=0;const step=n=>{for(let i=0;i<n;i++){updFx(.05);t+=.05;if(t>1.1&&t<1.3)fxl=Math.max(fxl,FXL.intensity);}};step(Math.round((secs||8)/.05));
    const imp=log.find(h=>h.e===T&&!h.smx&&!h.dot);const left=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;});
    return {T,F,u,v,p,S:imp?imp.amt:null,log:log.slice(),dbg:SNF.dbg.slice(),fxl,fxlEnd:FXL.intensity,left:left.length};}
  finally{hurt=H0;scene.add=S0;SNF.dbg=null;setL(0);}}
const sm=(r,e)=>r.log.filter(h=>h.e===e&&h.smx);
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.sunflare.map(x=>x.n).join('|')==='Solar Radiance|Halo of Dawn|Solar Afterimage|Zenith|Heaven’s Gate',SM_D.sunflare.map(x=>x.n).join('|'));
  ok('and his numbers: 15% more, 40% power, 35% each (the ring 10%, the gate 10% a second)',/15% more/.test(smDesc('sunflare',0))&&/10%/.test(smDesc('sunflare',1))&&/40% power/.test(smDesc('sunflare',2))&&/35%/.test(smDesc('sunflare',3))&&/10%/.test(smDesc('sunflare',4))&&SNF.boost===1.15&&SNF.ghost===.4&&SNF.zen===.35,SM_D.sunflare.map((x,i)=>smDesc('sunflare',i).match(/\d+%/)).join(' '));
  ok('the old masteries are gone (no hit or cast hooks), every factor at least 1',!SMF.sunflare.hit&&!SMF.sunflare.cast&&SMA.sunflare.every(x=>x===1)&&SMG.sunflare.length===5&&SMG.sunflare.every(x=>x>=1)&&SM.free&&!!SM.free.sunflare);
  /* ---- Mastery 0 is the old Sunflare ---- */
  const r0_=shot(0,[[2,0]]);
  ok('Mastery 0: the old cast, 240% of its power, no corona, no light, no mastery hits',near(r0_.S,240)&&!r0_.dbg.length&&!r0_.log.some(h=>h.smx)&&r0_.fxl===0,r0_.S+' '+r0_.dbg.length);
  /* ---- M1 Solar Radiance ---- */
  const r1=shot(1,[[2,0]]);
  ok('M1: the impact is 15% stronger',near(r1.S,r0_.S*1.15),r1.S+' vs '+r0_.S);
  ok('M1: the sun wears its corona, and lights the board as it falls',r1.dbg.some(d=>d.ev==='dress')&&r1.fxl>.5,'light '+r1.fxl.toFixed(2));
  ok('M1: no other mastery yet, and the light is handed back afterwards',!r1.log.some(h=>h.smx)&&r1.fxlEnd===0&&!SNFL.on,r1.fxlEnd);
  /* ---- M2 Halo of Dawn ---- */
  const r2=shot(2,[[0,2],[-1.6,-1.4],[0,3.2],[1,.6,'raven']]);const [a2,b2,c2,f2]=r2.F;
  ok('M2: the ring hits a foe out at 2 tiles and one at 2.1, each once, for 10% of the strike',sm(r2,a2).length===1&&near(sm(r2,a2)[0].amt,.1*r2.S)&&sm(r2,b2).length===1,sm(r2,a2).map(h=>h.amt.toFixed(2))+' / '+(.1*r2.S).toFixed(2));
  ok('M2: but not one beyond its reach (3.2 tiles)',sm(r2,c2).length===0);
  ok('M2: it hits the target and flying foes too',sm(r2,r2.T).length===1&&sm(r2,f2).length===1);
  /* ---- M3 Solar Afterimage ---- */
  const r3=shot(3,[[.6,.3],[0,2]]);const [a3,b3]=r3.F;const e3=r3.dbg.find(d=>d.ev==='echo');
  ok('M3: the afterimage collapses into a second flash that repeats the strike at 40% on the foes in its reach',!!e3&&sm(r3,a3).filter(h=>near(h.amt,.4*r3.S)).length===1&&sm(r3,r3.T).filter(h=>near(h.amt,.4*r3.S)).length===1,e3&&e3.n);
  ok('M3: a foe outside the flash only gets the ring',sm(r3,b3).length===1&&near(sm(r3,b3)[0].amt,.1*r3.S));
  /* ---- M4 Zenith ---- */
  const r4=shot(4,[[1.25,0],[-1.25,0],[0,.95],[0,-.95],[.75,.6]]);const z0=r4.dbg.find(d=>d.ev==='zenith0');
  const geo=z0&&z0.pts.map(q=>{const dx=q[0]-r4.p[0],dz=q[1]-r4.p[1],L=Math.hypot(dx,dz);return{L,al:Math.abs((dx*r4.u[0]+dz*r4.u[1])/L)};});
  ok('M4: four beams in a cross lined up with the road (1.25 along it, 0.95 across)',!!geo&&near(geo[0].L,1.25,1e-3)&&near(geo[1].L,1.25,1e-3)&&near(geo[2].L,.95,1e-3)&&near(geo[3].L,.95,1e-3)&&geo[0].al>.999&&geo[1].al>.999&&geo[2].al<.001&&geo[3].al<.001,geo&&geo.map(g=>g.L.toFixed(2)+'/'+g.al.toFixed(2)).join(' '));
  const zh=e=>sm(r4,e).filter(h=>near(h.amt,.35*r4.S));
  ok('M4: the foe under each beam takes 35% of the strike, once',r4.F.slice(0,4).every(e=>zh(e).length===1),r4.F.slice(0,4).map(e=>zh(e).length).join(''));
  ok('M4: a foe between the beams and the target in the middle are not hit by them',zh(r4.F[4]).length===0&&zh(r4.T).length===0,zh(r4.F[4]).length+' '+zh(r4.T).length);
  /* ---- M5 Heaven's Gate ---- */
  const r5=shot(5,[[.7,0],[0,1.6]],9);const [a5,b5]=r5.F;const gh=e=>sm(r5,e).filter(h=>near(h.amt,.1*r5.S*.25));
  ok('M5: the pillar burns a foe inside it 12 times over the 3s, 2.5% of the strike a tick (10% a second)',gh(a5).length===12&&gh(r5.T).length===12,gh(a5).length+' '+gh(r5.T).length);
  ok('M5: a foe just outside the pillar (1.6 tiles) is not burned',gh(b5).length===0);
  {const ts=r5.dbg.filter(d=>d.ev==='gate'&&d.e===a5).map(d=>d.tick);ok('M5: the ticks are counted, 1 to 12, none twice',ts.join(',')==='1,2,3,4,5,6,7,8,9,10,11,12',ts.join(','));}
  /* ---- clean-up, the light, other casters ---- */
  ok('every mastery leaves nothing behind and hands the light back',[r0_,r1,r2,r3,r4,r5].every(r=>r.left===0&&r.fxlEnd===0),[r0_,r1,r2,r3,r4,r5].map(r=>r.left+'/'+r.fxlEnd).join(' '));
  {play();setL(5);SNF.dbg=[];log=[];const p=spot(),T=foe(p[0],p[1]);wrapHurt();try{castSunflare(heroU,T,100,{src:heroU,el:'light'});castSunflare(heroU,T,100,smO({src:heroU,el:'light',smId:1}));run(4);}finally{hurt=H0;setL(0);}
    ok('casts that are not the hero\'s own mastered scroll (a building, an echo) stay the old Sunflare',!SNF.dbg.length&&log.filter(h=>h.e===T&&!h.dot).every(h=>near(h.amt,240)),SNF.dbg.length+' '+log.filter(h=>h.e===T).map(h=>h.amt).join(','));SNF.dbg=null;}
  {const e0=errs;for(let L=1;L<=5;L++){play();setL(L);const p=spot();const T=foe(p[0],p[1]);for(let i=0;i<6;i++)foe(p[0]+(i-3)*.4,p[1]+(i%2?.3:-.3),i===5?'raven':'knight');cast(T);run(7);}setL(0);
    ok('the real cast path at every mastery runs without errors',errs===e0,errs-e0);}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;SNF.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
