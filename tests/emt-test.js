(function(){
/* Wrath of the Ember Titan's masteries (v452). Run on the dev page: __kk.ev(await (await fetch('/tests/emt-test.js')).text()) returns [name, ok, detail] rows.
   A long straight stretch of road (map 12) with a line of foes standing on it; the game is stepped (update and updFx), hurt is wrapped to
   log the amount each hit is called with (the scroll's power is 100: the blade deals 2200, the tip 1000, a geyser 300, a burn tick 50), and
   the titan's model is caught as it is built, so where it stood and which way it faced give the blade's zone and the tip's circle exactly.
   EMT.dbg logs the masteries' events. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,TM0=myTitanModel,FT0=nsFireTrail;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
let T=null;myTitanModel=function(){const r=TM0.apply(this,arguments);T=r;return r;};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(12);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0];let best=0,bl=0;for(let d=0;d<R.len-4;d+=.25){let l=0;const A=posAt(d,R);for(let e=d+1;e<R.len;e+=.5){const B=posAt(e,R);let dev=0;for(let k=1;k<8;k++){const p=posAt(d+(e-d)*k/8,R),t=k/8;dev=Math.max(dev,Math.hypot(p[0]-(A[0]+(B[0]-A[0])*t),p[1]-(A[1]+(B[1]-A[1])*t)));}if(dev>.08)break;l=e-d;}if(l>bl){bl=l;best=d;}}
  const d0=best+4,A=posAt(d0,R);let hc=null,hb=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),dd=(q.x-A[0])**2+(q.z-A[1])**2;if(dd>1.5&&dd<hb){hb=dd;hc=[c,r];}}
  spawnHero(hc[0],hc[1]);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='playing';paused=false;speed=0;worldSlow=1;slowT=0;camShake=0;return{R,d0,bl};}
function foe(R,d,off,hp){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d;e.off=off||0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.shield=0;e.spd=0;moveEnemy(e,0);return e;}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.embertitan=SM_XP[L-1];else delete meta.smast.embertitan;};
const oF=()=>({src:heroU,bane:0,el:'fire',anc:false,spell:'embertitan'});
const cast=L=>{setL(L);castScrollNow('embertitan',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oF());};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>EMT.dbg.filter(d=>d.ev===n);
const hits=(e,amt,o)=>log.filter(h=>h.e===e&&near(h.amt,amt)&&(!o||o.dot==null||h.dot===o.dot));
const leftL=added=>added.filter(o=>{if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}),left=added=>leftL(added).length;
/* (the map's own ripples on its ponds, terTick's, come and go all the time: they are not the cast's) */
const track=()=>{const added=[];scene.add=function(...a){if(!/terTick|terRipple/.test(String(new Error().stack)))added.push(...a);return S0.apply(this,a);};return added;};
/* where the titan stood and faced (caught as it was built: the cast places it before the first step) */
const geo=()=>{const a=T.g.rotation.y;return{px:T.g.position.x,pz:T.g.position.z,fx:Math.sin(a),fz:Math.cos(a)};};
const zone=(g,e,b1)=>{const ex=e.x-g.px,ez=e.z-g.pz,al=ex*g.fx+ez*g.fz,lat=Math.abs(ex*g.fz-ez*g.fx);return al>1.8&&al<b1&&lat<.95;};
const alOf=(g,e)=>(e.x-g.px)*g.fx+(e.z-g.pz)*g.fz;
const inTip=(g,e,d,r)=>(e.x-(g.px+g.fx*d))**2+(e.z-(g.pz+g.fz*d))**2<r*r;
/* a line of foes along the straight road (every 0.3 tiles over 9 tiles) */
const stage=()=>{const G=go(),L=[];for(let i=0;i<30;i++)L.push(foe(G.R,G.d0+i*.3,(i%3-1)*.15));return{G,L};};
/* one cast at mastery L on a fresh stage, stepped s seconds; the hurt log and the stun each foe had just after the blow. Once the titan has
   picked its spot, two of the foes that will be under the blade (1.8-6.9) become bosses */
const boss2=(S,g)=>{const u=S.L.filter(e=>zone(g,e,6.9));for(const i of [1,u.length-2])if(u[i])u[i].boss=true;};
const trial=(L,s)=>{const S=stage();EMT.dbg=[];log=[];T=null;wrapHurt();const t0=time;let stun=null,tb=null;const added=track();
  try{cast(L);const g=geo();boss2(S,g);for(let i=0;i<Math.round((s||12)/.05);i++){run(.05);if(!stun&&log.some(h=>near(h.amt,EMT.blade*100)||near(h.amt,2200))){stun=S.L.map(e=>e.stunT||0);tb=time;}}S.g=g;}finally{hurt=H0;scene.add=S0;setL(0);}
  S.t0=t0;S.stun=stun;S.tb=tb;S.added=added;S.log=log.slice();return S;};
try{
  /* a first cast at Mastery 5 that is not checked: the game's shared pools and helpers (made the first time something uses them, and kept)
     are made here, so "nothing is left behind" below sees only what a cast leaves */
  {const S=stage();cast(5);run(12);setL(0);}
  /* ---- the card ---- */
  ok('the five masteries: Molten Edge, Deeper Fissure, Furnace Heart, Titan\'s Weight, The Road Splits (v452)',SM_D.embertitan.map(x=>x.n).join('|')==='Molten Edge|Deeper Fissure|Furnace Heart|Titan\'s Weight|The Road Splits',SM_D.embertitan.map(x=>x.n).join('|'));
  const dsc=[0,1,2,3,4].map(i=>smDesc('embertitan',i));
  ok('the numbers on the card are the ones in the code (2450% / 0.6; 14 / 5.5s / 55%; 1300% / 3.5; 1.2s / 0.4s; 30%)',/2450%/.test(dsc[0])&&/0\.6 tiles/.test(dsc[0])&&/14 tiles/.test(dsc[1])&&/5\.5s/.test(dsc[1])&&/55%/.test(dsc[1])&&/1300%/.test(dsc[2])&&/3\.5 tiles/.test(dsc[2])&&/1\.2s/.test(dsc[3])&&/0\.4s/.test(dsc[3])&&/30%/.test(dsc[4])
    &&EMT.blade===24.5&&EMT.reach===.6&&EMT.fiss===14&&EMT.burn===5.5&&EMT.trail===.55&&EMT.tip===13&&EMT.tipR===3.5&&EMT.stun===1.2&&EMT.bstun===.4&&EMT.split===.3,dsc.join(' / '));
  ok('the old masteries are gone (no hit hooks); calibrated with hidden factors',!SMF.embertitan.hit&&!SMF.embertitan.cast&&SMA.embertitan.every(x=>x===1)&&SMG.embertitan.length===5&&SMG.embertitan.every(x=>x>=.8&&x<1.3),SMG.embertitan.join());
  /* ---- Mastery 0 ---- */
  {const S=trial(0,11),g=S.g,F=S.L;const bl=F.filter(e=>zone(g,e,6.9)),tp=F.filter(e=>inTip(g,e,6.1,3));
    ok('Mastery 0: the blade strikes exactly the foes in its zone (1.8-6.9 along it, 0.95 across) for 2200%',bl.length>=6&&F.every(e=>hits(e,2200,{dot:false}).length===(bl.includes(e)?1:0)),bl.length+' under the blade');
    ok('Mastery 0: the tip exactly the foes within 3 of the point 6.1 along it, for 1000%',tp.length>=4&&F.every(e=>hits(e,1000,{dot:false}).length===(tp.includes(e)?1:0)),tp.length+' at the tip');
    ok('Mastery 0: foes under the blade stunned 0.6s, bosses not at all',S.stun&&F.every((e,i)=>!bl.includes(e)||(e.boss?S.stun[i]===0:near(S.stun[i],.6,.12))),S.stun&&bl.map(e=>S.stun[F.indexOf(e)].toFixed(2)).join(','));
    const gy3=F.filter(e=>hits(e,300,{dot:false}).length),bt=S.log.filter(h=>h.dot&&near(h.amt,50)),last=bt.length?Math.max(...bt.map(h=>h.t))-S.tb:0;
    ok('Mastery 0: geysers 300% once per foe, the burn 50% a tick for 4.3s after the blow',gy3.length>=6&&F.every(e=>hits(e,300,{dot:false}).length<=1)&&last>3.4&&last<=4.35,gy3.length+' geysered, last tick '+last.toFixed(2));
    ok('Mastery 0: no mastery events, nothing else (no 2450/1300/390)',!EMT.dbg.length&&!S.log.some(h=>near(h.amt,2450)||near(h.amt,1300)||near(h.amt,390)));
    ok('Mastery 0: nothing is left behind',left(S.added)===0,leftL(S.added).map(o=>o.type+':'+(o.name||'')+':'+(o.geometry&&o.geometry.type)).slice(0,6).join(' '));}
  /* the fissure's seams face the sky now (drawn as before, their quads faced the ground and the camera never saw them) */
  {const S=stage();T=null;setL(0);const b=new Set(NS_OWN);cast(0);run(3.2);const sm=[...NS_OWN].filter(o=>!b.has(o)&&o.isMesh&&o.geometry&&o.geometry.index&&o.material.polygonOffset);let up=0,n=0;
    for(const o of sm){const g=o.geometry,p=g.attributes.position,I=g.index;if(I.count<3)continue;const A=new THREE.Vector3().fromBufferAttribute(p,I.getX(0)),B=new THREE.Vector3().fromBufferAttribute(p,I.getX(1)),C=new THREE.Vector3().fromBufferAttribute(p,I.getX(2));
      const nn=new THREE.Vector3().subVectors(C,B).cross(new THREE.Vector3().subVectors(A,B));n++;if(nn.y>0)up++;}run(9);
    ok('the fissure\'s seams face the sky at every mastery, Mastery 0 too (they were drawn facing the ground)',n>=2&&up>=2,up+'/'+n+' seam meshes face up (the crater cracks shared with other spells are left as they were)');}
  /* ---- M1 Molten Edge ---- */
  {const S=trial(1,11),g=S.g,F=S.L;const bl=F.filter(e=>zone(g,e,7.5)),far=bl.filter(e=>alOf(g,e)>6.9),tp=F.filter(e=>inTip(g,e,6.7,3));const c=ev('cast')[0];
    ok('M1: the blade strikes 2450% and reaches 0.6 further: exactly the foes 1.8-7.5 along it',bl.length>=6&&F.every(e=>hits(e,2450,{dot:false}).length===(bl.includes(e)?1:0))&&!S.log.some(h=>near(h.amt,2200)),bl.length+' under it');
    ok('M1: including foes past the old reach (6.9-7.5), which the titan now counts when it picks its spot',far.length>=1&&far.every(e=>hits(e,2450).length===1),far.length+' past 6.9');
    ok('M1: the tip lands as much further on (1000% within 3 of 6.7 along it)',F.every(e=>hits(e,1000,{dot:false}).length===(tp.includes(e)?1:0)),tp.length);
    ok('M1: the sword is drawn 12% longer, its rims white-hot',T&&T.blades.every(m=>near(m.scale.z,1.12))&&T.rim.material!==T.hotM&&c&&near(c.X.SWING,2.97));
    ok('M1: no other change (geysers 300%, stun 0.6s, burn 4.3s)',S.log.some(h=>near(h.amt,300))&&S.stun&&bl.filter(e=>!e.boss).every(e=>near(S.stun[F.indexOf(e)],.6,.12))&&c&&c.X.BURN===undefined);}
  /* ---- M2 Deeper Fissure ---- */
  {const B=trial(2,12);const ge=ev('geyser'),dT=(()=>{const R=B.G.R;let bd=1e9,bd0=0;for(let d=0;d<R.len;d+=.02){const p=posAt(d,R),q=(p[0]-B.g.px)**2+(p[1]-B.g.pz)**2;if(q<bd){bd=q;bd0=d;}}return bd0;})();
    const ds=ge.map(x=>x.d),span=Math.max(...ds.map(d=>Math.abs(d-dT))),bt=B.log.filter(h=>h.dot&&near(h.amt,50)),last=bt.length?Math.max(...bt.map(h=>h.t))-B.tb:0;
    ok('M2: the fissure runs 14 tiles from the titan (11.5 before): its last geyser 13.5-14 along the road',span>13.4&&span<=14.01,span.toFixed(2)+' ('+ge.length+' geysers)');
    ok('M2: it burns 5.5s after the blow (4.3s before), 50% a tick',last>4.4&&last<=5.55&&bt.every(h=>near(h.amt,50)),last.toFixed(2));
    ok('M2: the cast lives as much longer (the seams fade after the burn)',ev('end').length===1&&near(ev('end')[0].t-ev('cast')[0].t,9.8,.02),ev('end').length&&(ev('end')[0].t-ev('cast')[0].t).toFixed(2));
    let n=0,g=0;nsFireTrail=function(){n++;return FT0.apply(this,arguments);};try{for(let i=0;i<3;i++){const S=stage();EMT.dbg=[];cast(2);run(11);g+=ev('geyser').length;}}finally{nsFireTrail=FT0;setL(0);}
    ok('M2: about 55% of its geysers leave fire on the road (35% before)',g>60&&n/g>.42&&n/g<.68,n+' of '+g);}
  /* ---- M3 Furnace Heart ---- */
  {const S=trial(3,11),g=S.g,F=S.L;const tp=F.filter(e=>inTip(g,e,6.7,3.5)),t3=F.filter(e=>inTip(g,e,6.7,3));
    ok('M3: the tip strikes 1300% within 3.5 tiles (1000% within 3 before)',tp.length>t3.length&&F.every(e=>hits(e,1300,{dot:false}).length===(tp.includes(e)?1:0))&&!S.log.some(h=>near(h.amt,1000)),tp.length+' (3 tiles: '+t3.length+')');}
  /* ---- M4 Titan's Weight ---- */
  {const a=trial(3,4),b=trial(4,4),g=b.g,F=b.L,bl=F.filter(e=>zone(g,e,7.5)),bo=bl.filter(e=>e.boss),fo=bl.filter(e=>!e.boss);
    ok('M4: foes under the blade are stunned 1.2s (0.6 before)',fo.length>=4&&b.stun&&fo.every(e=>near(b.stun[F.indexOf(e)],1.2,.06))&&a.stun&&a.L.filter(e=>zone(a.g,e,7.5)&&!e.boss).every(e=>near(a.stun[a.L.indexOf(e)],.6,.06)),b.stun&&fo.map(e=>b.stun[F.indexOf(e)].toFixed(2)).join(','));
    ok('M4: and bosses 0.4s (not at all before)',bo.length>=1&&bo.every(e=>near(b.stun[F.indexOf(e)],.4,.06))&&a.L.filter(e=>zone(a.g,e,7.5)&&e.boss).every(e=>a.stun[a.L.indexOf(e)]===0),bo.length+' bosses: '+bo.map(e=>b.stun[F.indexOf(e)].toFixed(2)).join(','));
    ok('M4: foes off the blade are not stunned',F.filter(e=>!bl.includes(e)).every(e=>!(b.stun[F.indexOf(e)]>0)));}
  /* ---- M5 The Road Splits ---- */
  {const S=trial(5,12),F=S.L,bw=ev('blow')[0],ge=ev('geyser'),hit=F.filter(e=>hits(e,390,{dot:false}).length);
    ok('M5: the whole fissure tears open as the sword lands: every geyser bursts in that same moment',bw&&ge.length>=25&&ge.every(x=>x.t===bw.t),ge.length+' geysers, '+(bw&&ge.filter(x=>x.t!==bw.t).length)+' later');
    ok('M5: 30% harder: 390% once per foe they catch',hit.length>=6&&F.every(e=>hits(e,390,{dot:false}).length<=1)&&!S.log.some(h=>near(h.amt,300))&&ge.reduce((n,x)=>n+x.H.length,0)===hit.length,hit.length);
    ok('M5: Masteries 1-4 ride it (2450%, 1300% within 3.5, stun 1.2s, the fissure 14 tiles and 5.5s)',S.log.some(h=>near(h.amt,2450))&&S.log.some(h=>near(h.amt,1300))&&S.stun&&S.stun.some(v=>near(v,1.2,.06))&&ev('cast')[0].X.FISS===14&&ev('cast')[0].X.BURN===5.5);
    const bt=S.log.filter(h=>h.dot&&near(h.amt,50));ok('M5: the burn covers the whole fissure from the first tick',bt.length&&Math.min(...bt.map(h=>h.t))-bw.t<.06,bt.length&&(Math.min(...bt.map(h=>h.t))-bw.t).toFixed(2));
    ok('M5: nothing is left behind',left(S.added)===0,left(S.added));}
  {const S=trial(4,11);ok('M5 needs Mastery 5 (at 4 the fissure grows as before)',new Set(ev('geyser').map(x=>x.t)).size>5);}
  /* ---- the rest ---- */
  {const S=stage();EMT.dbg=[];log=[];setL(5);wrapHurt();T=null;try{NSP.embertitan(heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'fire',spell:'embertitan'});run(11);}finally{hurt=H0;setL(0);}
    const g=geo(),bl=S.L.filter(e=>zone(g,e,6.9));ok('casts that are not a mastered scroll cast are the old cast',!EMT.dbg.length&&bl.length>=6&&S.L.every(e=>hits(e,2200,{dot:false}).length===(bl.includes(e)?1:0)));}
  {const S=stage();setL(2);EMT.busy=0;cast(2);const b=EMT.busy-time;run(11);setL(0);ok('the mastery preview waits for the titan (it outlives its cineLock)',near(b,9.8,.01)&&SMPV_BUSY.some(f=>String(f).indexOf('EMT.busy')>=0)&&!SMPV_BUSY.some(f=>{try{return String(f).indexOf('EMT.busy')>=0&&f();}catch(e){return true;}}),b.toFixed(2));}
  {const e0=errs;for(let L=0;L<=5;L++){const S=stage();S.L.forEach(e=>{e.maxHp=e.hp=1500;});heroU.scd={};heroU.gcd=0;setL(L);meta.spells.embertitan=meta.spells.embertitan||{lvl:1,hero:null};fireScroll(heroU,'embertitan',heroStats(),S.L.slice());run(13);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;myTitanModel=TM0;nsFireTrail=FT0;EMT.dbg=null;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
