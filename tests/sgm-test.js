(function(){
/* Singularity's masteries (v472). Run on the dev page: __kk.ev(await (await fetch('/tests/sgm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand on the road of map 31 near the hero (tough ones: 1e7 health, so the share of max health a frame is exact), with a boss, a flyer
   and a foe far down the road that walks (the pin is map-wide); light foes that die during the pin feed Accretion. The game is stepped
   (update and updFx, 0.05s), hurt is wrapped to log each amount it is called with (the scroll's power is 100: the drain is 15 a frame, the
   share of max health 1e7 x 5% x 0.05 = 25000), the hole's own shader uniforms are read while it lives, and SGM.dbg logs the masteries'
   events. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,SW0=shockwave,VW0=vfWave;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;state='playing';paused=false;speed=1;worldSlow=1;slowT=0;camShake=0;cineLock=0;
  const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}
  removeEnemy(e0);enemies=[];return{R,d0:bdist};}
function foe(R,d,hp,x){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d;e.off=0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.shield=0;e.spd=0;Object.assign(e,x||{});moveEnemy(e,0);return e;}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.singularity=SM_XP[L-1];else delete meta.smast.singularity;};
const oF=()=>({src:heroU,bane:0,el:'dark',anc:true,spell:'singularity'});
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-9)*Math.max(1,Math.abs(b));
const ev=n=>SGM.dbg.filter(d=>d.ev===n);
const leftL=added=>added.filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}),left=added=>leftL(added).length;
const hole=()=>{let m=null;scene.traverse(o=>{if(!m&&o.isMesh&&o.material&&o.material.fragmentShader===SG_BH_FS)m=o;});return m;};
const lights=()=>[hemi.color.getHex(),hemi.groundColor.getHex(),sun.color.getHex()].join(',');
/* Singularity's own preview-wait entries (SGL.n, and the module's SGM.busy), found by their text: other scrolls push theirs after it */
const MINE=SMPV_BUSY.filter(f=>/SGL\.n|SGM\.busy/.test(String(f))),mineBusy=()=>MINE.some(f=>f());
/* the stage: 6 tough foes by the hero, a boss and a flyer among them, a tough foe far down the road that walks, and (x.light) light foes */
const stage=x=>{x=x||{};const G=go(),R=G.R,d0=G.d0,F=[];for(let i=0;i<6;i++)F.push(foe(R,d0+(i-2.5)*.3));
  const S={G,F};S.B=foe(R,d0+.15,1e7,{boss:true});S.Fl=foe(R,d0-.15,1e7,{fly:true});S.W=foe(R,Math.min(R.len-6,d0+9),1e7);S.W.spd=1;S.T=F.slice();F.push(S.B,S.Fl,S.W);
  S.L=(x.light||[]).map((hp,i)=>foe(R,d0+(i%2?1:-1)*(1+.2*i),hp));F.push(...S.L);return S;};
/* one cast at mastery L on a fresh stage, stepped s seconds: the hurt log, what the cast left, the walker's path, the hole's uniforms at the
   times asked for (x.at), lights before and after */
const trial=(L,s,x)=>{x=x||{};const S=stage(x);SGM.dbg=[];const log=[];const sws=[],vws=[];
  hurt=function(e,amt,kind,o){log.push({e,amt,sp:!!(o&&o.spell),src:!!(o&&o.src),t:time-S.t0});return H0.apply(this,arguments);};
  shockwave=function(px,pz,r){sws.push(r);return SW0.apply(this,arguments);};vfWave=function(px,pz,sc){vws.push(sc);return VW0.apply(this,arguments);};
  const added=[];scene.add=function(...a){if(!/terTick|terRipple/.test(String(new Error().stack)))added.push(...a);return S0.apply(this,a);};
  const at={},walk=[],grav=[],busy=[];S.l0=lights();S.t0=time;
  try{setL(L);if(x.direct)castSingularity(heroU,100,oF());else castScrollNow('singularity',heroU,heroStats(),S.F.filter(e=>!e.dead),100,oF());
    const n=Math.round((s||14.5)/.05);for(let i=0;i<n;i++){run(.05);const tt=time-S.t0;walk.push([tt,S.W.dist]);grav.push([tt,GRAV.on]);
      if(i%20===10){cineLock=0;busy.push([tt,smPvBusy()&&MINE.every(f=>f())]);}
      for(const a of x.at||[])if(!at[a]&&tt>=a-1e-6){const h=hole();at[a]=h?Object.fromEntries(Object.entries(h.material.uniforms).filter(([k,v])=>typeof v.value==='number').map(([k,v])=>[k,v.value])):null;}
      if(x.each)x.each(S,tt);}}
  finally{hurt=H0;scene.add=S0;shockwave=SW0;vfWave=VW0;setL(0);}
  cineLock=0;Object.assign(S,{log,added,at,walk,grav,busy,sws,vws,l1:lights(),busyAfter:mineBusy(),sgl:SGL.n,gravOn:GRAV.on});return S;};
const of=(S,e,f)=>S.log.filter(h=>h.e===e&&(!f||f(h)));
const drainH=(S,e)=>of(S,e,h=>h.sp&&!near(h.amt,40)&&!near(h.amt,500)),mhpH=(S,e)=>of(S,e,h=>!h.sp&&h.src);
const span=a=>a.length?[Math.min(...a.map(h=>h.t)),Math.max(...a.map(h=>h.t))]:[NaN,NaN];
const pinned=S=>{const g=S.grav.filter(q=>q[1]);return g.length?[g[0][0],g[g.length-1][0]]:[NaN,NaN];};
const still=(S,a,b)=>{const w=S.walk.filter(q=>q[0]>=a&&q[0]<=b);return w.length>3&&w.every(q=>q[1]===w[0][1]);};
try{
  /* a first cast at Mastery 5 that is not checked: the game's shared pools and helpers (made the first time something uses them, and kept)
     are made here, so "nothing is left behind" below sees only what a cast leaves */
  {stage();setL(5);castScrollNow('singularity',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oF());run(15);setL(0);}
  /* ---- the card ---- */
  const nm=SM_D.singularity.map(x=>x.n);
  ok('the five masteries: Greater Mass, Tidal Drain, Accretion, Torn Earth, Last Light (v472)',nm.join('|')==='Greater Mass|Tidal Drain|Accretion|Torn Earth|Last Light',nm.join('|'));
  {const other=new Set();for(const k in SPELLS_S)other.add(SPELLS_S[k].n);for(const k in SM_D)if(k!=='singularity')for(const q of SM_D[k])other.add(q.n);for(const c of COMBOS)other.add(c.n);
    if(typeof ARTS!=='undefined')for(const a of ARTS)other.add(a.n);const clash=nm.filter(n=>other.has(n));
    ok('the names are used by no other scroll, mastery, synergy or artifact (not Voidfall\'s Gravity Well / Event Horizon, nor Spatial Compression\'s Implosion / Pressed Star)',!clash.length&&!nm.some(n=>/Gravity Well|Event Horizon|Implosion|Pressed Star/.test(n)),clash.join(','));}
  const dsc=[0,1,2,3,4].map(i=>smDesc('singularity',i));
  ok('the numbers on the card are the ones in the code (3.2s / 8.3s / 7.5s; 5.8% / 3.5%; 2.5% / 45%; one a second / 40%; 500% / 30%)',/3\.2s/.test(dsc[0])&&/8\.3s/.test(dsc[0])&&/7\.5s/.test(dsc[0])&&/5\.8%/.test(dsc[1])&&/3\.5%/.test(dsc[1])&&/2\.5%/.test(dsc[2])&&/45%/.test(dsc[2])&&/one a second/.test(dsc[3])&&/40%/.test(dsc[3])&&/500%/.test(dsc[4])&&/30%/.test(dsc[4])
    &&SGM.grip===3.2&&near(SGX.LIFE-2.3-SGM.grip,8.3)&&SGM.mhp===.058&&SGM.mhpb===.035&&SGM.acc===.025&&SGM.accMax===.45&&SGM.rockIv===1&&SGM.rock===.4&&SGM.coll===5&&SGM.collK===1.3&&SGM.size===1.15,dsc.join(' / '));
  ok('no hit hooks (the drain hits every foe every frame: the masteries live in the cast); calibrated with hidden factors near 1',!SMF.singularity.hit&&!SMF.singularity.cast&&!SMF.singularity.kill&&SMA.singularity.every(x=>x===1)&&SMG.singularity.length===5&&SMG.singularity.every(x=>x>=.9&&x<=1.1),SMG.singularity.join());
  ok('the scroll\'s own card is fixed: pinned and drained for 7.5 seconds (it said 11.5), on the scroll and in its short line',/drained for 7\.5 seconds/.test(SPELLS_S.singularity.d)&&!/11\.5/.test(SPELLS_S.singularity.d)&&/for 7\.5s/.test(SPELL_FX.singularity)&&!/11\.5/.test(SPELL_FX.singularity),SPELL_FX.singularity);
  ok('without options the cast keeps its old numbers (grip 4s, 300%/s, 5% / 3%, lensing sphere 14, disk 10.3, no heat, no rocks, no strike at the collapse)',SGX.GRIP===4&&SGX.DPS===3&&SGX.MHP===.05&&SGX.MHPB===.03&&SGX.SIZE===1&&SGX.RB===14&&SGX.ROUT===10.3&&SGX.RING===1&&SGX.DISK===1&&SGX.SPARK===10&&SGX.ACC===0&&SGX.ROCK===0&&SGX.COLL===0&&SGX.CON===0&&SGX.COLLK===1&&SGX.LIFE===13.8&&/\*\(1\.\+uHeat\)/.test(SG_BH_FS));
  /* ---- Mastery 0 ---- */
  {const S=trial(0,14.5,{at:[9,10.85,11.1]}),T=S.T,dr=drainH(S,T[0]),mh=mhpH(S,T[0]),[a,b]=span(dr),pn=pinned(S);
    ok('Mastery 0: every foe is pinned from 4s until the collapse at 11.5s (7.5s): the walker far down the road stands still',pn[0]>3.99&&pn[0]<4.06&&pn[1]>11.39&&pn[1]<11.5&&still(S,4.1,11.4)&&!still(S,1,3.9),pn.map(v=>v.toFixed(2)).join('-'));
    ok('Mastery 0: drained 300% a second (15 a frame at power 100) from 4s to 11.5s, every foe on the map, flyers, bosses and the walker too',dr.length>=148&&dr.length<=151&&a>3.99&&a<4.06&&b<11.5&&S.F.every(e=>drainH(S,e).length===dr.length&&drainH(S,e).every(h=>near(h.amt,15))),dr.length+' frames, '+a.toFixed(2)+'-'+b.toFixed(2));
    ok('Mastery 0: and 5% of max health a second (3% of a boss\'s), hits carrying only their source',mh.length===dr.length&&mh.every(h=>near(h.amt,25000))&&mhpH(S,S.B).every(h=>near(h.amt,15000))&&mhpH(S,S.B).length===dr.length&&mhpH(S,S.Fl).length===dr.length,mh.length+' hits of '+(mh[0]&&mh[0].amt));
    ok('Mastery 0: nothing else (no rocks, no strike at the collapse, no mastery events), the hole as before (sphere 14, disk 10.3, no heat)',S.log.every(h=>near(h.amt,15)||near(h.amt,25000)||near(h.amt,15000))&&!SGM.dbg.length&&S.at[9]&&S.at[9].uRb===14&&S.at[9].uRout===10.3&&S.at[9].uHeat===0,S.at[9]&&[S.at[9].uRb,S.at[9].uRout,S.at[9].uHeat].join(','));
    ok('Mastery 0: the contraction starts at 11.15s, as before (the hole holds its size at 11.1s)',S.at[10.85]&&S.at[11.1]&&near(S.at[11.1].uRs,S.at[10.85].uRs,1e-6),S.at[11.1]&&(S.at[11.1].uRs/S.at[10.85].uRs).toFixed(4));
    ok('Mastery 0: the collapse\'s shockwave 7.5 wide, its ground waves 9 and 14',S.sws.some(r=>near(r,7.5))&&S.vws.length===2&&near(S.vws[0],9)&&near(S.vws[1],14),S.sws.join(',')+' / '+S.vws.join(','));
    ok('Mastery 0: nothing is left behind; the lights are graded back exactly; the pin and the lensing pass are off',left(S.added)===0&&S.l1===S.l0&&S.sgl===0&&!S.gravOn,leftL(S.added).map(o=>o.type).slice(0,6).join(' ')+' lights '+S.l0+' -> '+S.l1);
    ok('Mastery 0: the mastery preview waits for it through the whole cast (smPvBusy, and both of its own entries: SGL.n and SGM.busy), and they let go after',MINE.length>=2&&S.busy.filter(q=>q[0]<13.7).every(q=>q[1])&&S.busy.length>=6&&!S.busyAfter,S.busy.map(q=>q[0].toFixed(1)+':'+(q[1]?1:0)).join(' '));
    S.m0=S;window.__sgm0=S;}
  /* ---- M1 Greater Mass ---- */
  {const S=trial(1,14.5,{at:[9]}),T=S.T,dr=drainH(S,T[0]),[a,b]=span(dr),pn=pinned(S),A=S.at[9],B=window.__sgm0.at[9];
    ok('M1: the grip takes hold at 3.2s (4 before): pinned and drained 8.3s (7.5s), 15 a frame and 5% a second as before',pn[0]>3.19&&pn[0]<3.26&&a>3.19&&a<3.26&&b<11.5&&dr.length>=164&&dr.length<=167&&dr.every(h=>near(h.amt,15))&&mhpH(S,T[0]).every(h=>near(h.amt,25000))&&still(S,3.3,11.4),dr.length+' frames from '+a.toFixed(2));
    ok('M1: the hole 15% larger (its horizon radius), the disk wider (10.8 horizon radii, 10.3 before), the ring of light 35% brighter',A&&B&&near(A.uRs/B.uRs,1.15,1e-6)&&A.uRout===10.8&&near(A.uRing/B.uRing,1.35,1e-6),A&&B&&(A.uRs/B.uRs).toFixed(4)+' '+(A.uRing/B.uRing).toFixed(3));
    ok('M1: its lensing sphere stays the size it was (12.17 horizon radii of the larger hole: 14 of the old), so the 170-step shader draws no more pixels',A&&B&&near(A.uRb,14/1.15,1e-9)&&near(A.uRb*A.uRs,B.uRb*B.uRs,1e-6),A&&A.uRb.toFixed(3));
    ok('M1: nothing else (no rocks, no strike at the collapse); nothing left behind; the lights put back',S.log.every(h=>near(h.amt,15)||near(h.amt,25000)||near(h.amt,15000))&&left(S.added)===0&&S.l1===S.l0&&ev('cast').length===1&&ev('grip').length===1&&ev('end').length===1);}
  /* ---- M2 Tidal Drain ---- */
  {const S=trial(2,14.5),T=S.T,mh=mhpH(S,T[0]),dr=drainH(S,T[0]);
    ok('M2: 5.8% of max health a second (5% before), 3.5% of a boss\'s (3% before); 300%/s as before',mh.length===dr.length&&mh.every(h=>near(h.amt,1e7*.058*.05))&&mhpH(S,S.B).every(h=>near(h.amt,1e7*.035*.05))&&dr.every(h=>near(h.amt,15)),mh[0]&&mh[0].amt);
    ok('M2: twice as many gold sparks off the pinned (20 a second, 10 before)',ev('cast')[0].X.SPARK===20&&SGX.SPARK===10);
    ok('M2: nothing left behind; the lights put back',left(S.added)===0&&S.l1===S.l0);}
  /* ---- M3 Accretion ---- */
  {const kill=(S,tt)=>{if(!S.kd&&tt>=7){S.kd=1;H0(S.T[5],1e12,'magic',{src:heroU});}};
    const S=trial(3,14.5,{light:[600,900,1200,1500],each:kill,at:[9]}),T=S.T,fd=ev('feed'),dr=drainH(S,T[0]),mh=mhpH(S,T[0]);
    const nAt=t=>fd.filter(d=>d.t-S.t0<t-1e-6).length;
    ok('M3: every foe that dies while pinned feeds the hole once, drained or not (4 light foes, one killed by something else)',fd.length===5&&S.L.every(e=>e.dead&&fd.filter(d=>d.e===e).length===1&&fd.find(d=>d.e===e).drained)&&fd.filter(d=>d.e===T[5]).length===1&&!fd.find(d=>d.e===T[5]).drained,fd.map(d=>(d.t-S.t0).toFixed(2)+(d.drained?'':'*')).join(' '));
    /* (a death in a frame feeds the drain from the next one: a light foe killed by the drain is fed at once, so the frame after it hits harder) */
    const k=dr.map(h=>Math.round((h.amt/15-1)/.025)),okk=dr.every((h,i)=>near(h.amt,15*(1+.025*k[i]),1e-9)&&k[i]>=0&&k[i]<=5&&(!i||k[i]>=k[i-1]));
    ok('M3: the drain grows 2.5% stronger for each: 15 a frame, then 15 x 1.025, 1.05 ... (both the 300%/s and the share of max health)',okk&&k[k.length-1]===5&&mh.every((h,i)=>near(h.amt,1e7*.058*.05*(1+.025*k[i]),1e-9)),[...new Set(k)].join(','));
    ok('M3: the disk heats and brightens as it feeds',S.at[9]&&S.at[9].uHeat>0,S.at[9]&&S.at[9].uHeat.toFixed(3));
    const C=trial(3,14.5,{light:Array.from({length:22},(_,i)=>150+i*20)}),dc=drainH(C,C.T[0]),last=dc[dc.length-1];
    ok('M3: up to 45% (22 foes fed, the drain no more than 1.45 times)',ev('feed').length===22&&near(last.amt,15*1.45)&&dc.every(h=>h.amt<=15*1.45+1e-9),ev('feed').length+' fed, '+last.amt.toFixed(3));
    ok('M3: nothing left behind; the lights put back',left(S.added)===0&&S.l1===S.l0&&left(C.added)===0);}
  /* ---- M4 Torn Earth ---- */
  {const S=trial(4,14.5),T=S.T,rk=e=>of(S,e,h=>h.sp&&near(h.amt,40)).map(h=>h.t),gap=a=>a.slice(1).map((t,i)=>t-a[i]);
    const all=S.F.map(rk),pins=pinned(S);
    ok('M4: a rock tears up from beneath every pinned foe once a second and strikes it as it rises, 40% each (8-9 in the 8.3s pin), flyers and bosses too',all.every(a=>a.length>=7&&a.length<=9)&&all.every(a=>gap(a).every(g=>g>.94&&g<1.06)),all.map(a=>a.length).join(','));
    ok('M4: the rocks strike only while the foes are pinned (from the grip, and none after the collapse)',all.every(a=>a[0]>=pins[0]+.27&&a[a.length-1]<11.5),all.map(a=>a[0].toFixed(2)).join(','));
    ok('M4: one rock event per strike; the rest as at Mastery 3 (5.8%, no strike at the collapse)',ev('rock').length===all.reduce((s,a)=>s+a.length,0)&&mhpH(S,T[0]).every(h=>near(h.amt,1e7*.058*.05))&&!S.log.some(h=>near(h.amt,500)));
    let edge=null;{const S2=stage();setL(4);castScrollNow('singularity',heroU,heroStats(),S2.F,100,oF());run(5);scene.traverse(o=>{if(!edge&&o.isInstancedMesh&&o.geometry.attributes.aHot)edge=o;});
      const hot=edge?[...edge.geometry.attributes.aHot.array].filter(v=>v>.5).length:0;ok('M4: the torn rocks are their own pool, their broken edges glowing as they tear up (aHot) and cooling as they fly',!!edge&&hot>0&&hot<edge.count,hot+' hot of '+(edge&&edge.count));run(10);setL(0);}
    ok('M4: nothing left behind (the rocks\' pool is freed); the lights put back',left(S.added)===0&&S.l1===S.l0,leftL(S.added).map(o=>o.type).slice(0,6).join(' '));}
  /* ---- M5 Last Light ---- */
  {const S=trial(5,14.5,{at:[10.85,11.1]}),st=S.F.map(e=>of(S,e,h=>h.sp&&near(h.amt,500)));
    ok('M5: the collapse strikes every foe on the map once, 500%: flyers, bosses and the foe far down the road too, as the hole breaks at 11.5s',st.every(a=>a.length===1&&a[0].t>=11.49&&a[0].t<11.56)&&ev('collapse').length===1&&ev('collapse')[0].H.length===S.F.length,st.map(a=>a.length).join(','));
    ok('M5: the hole draws in 0.15s longer before it breaks (from 11s, 11.15s before: it is already shrinking at 11.1s)',S.at[10.85]&&S.at[11.1]&&S.at[11.1].uRs<S.at[10.85].uRs*.98,S.at[11.1]&&(S.at[11.1].uRs/S.at[10.85].uRs).toFixed(3));
    ok('M5: its shockwave and ground waves 30% larger (9.75, 11.7 and 18.2)',S.sws.some(r=>near(r,9.75))&&S.vws.length===2&&near(S.vws[0],11.7)&&near(S.vws[1],18.2),S.sws.join(',')+' / '+S.vws.join(','));
    ok('M5: every mastery below it still at work (the grip at 3.2s, 5.8%, rocks)',pinned(S)[0]<3.26&&mhpH(S,S.T[0]).every(h=>near(h.amt,1e7*.058*.05))&&ev('rock').length>40);
    ok('M5: nothing left behind; the lights graded back exactly; the pin and lensing pass off; the preview waits for it, and not after',left(S.added)===0&&S.l1===S.l0&&S.sgl===0&&!S.gravOn&&S.busy.filter(q=>q[0]<13.7).every(q=>q[1])&&!S.busyAfter,leftL(S.added).map(o=>o.type).slice(0,6).join(' '));}
  /* ---- the collapse's burst cut short: a world cleared, or a game ended, 0.3s into it leaves nothing behind (before v472 its flare, rays and
     column stayed frozen in the scene: they hung on the scene itself, and their effect's end is skipped then) ---- */
  {const res=[];for(const L of [0,5])for(const how of ['clear','over']){stage();const added=[];scene.add=function(...a){if(!/terTick|terRipple/.test(String(new Error().stack)))added.push(...a);return S0.apply(this,a);};
      try{setL(L);castScrollNow('singularity',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oF());run(11.8);
        if(how==='clear')clearWorld();else{state='over';for(let i=0;i<60;i++)updFx(.05);state='playing';}}finally{scene.add=S0;setL(0);}
      res.push('M'+L+' '+how+': '+left(added));if(how==='over')clearWorld();}
    ok('the collapse\'s burst cut short (the world cleared, or the game ended, 0.3s into it) leaves nothing behind, at Mastery 0 and 5',res.every(r=>/: 0$/.test(r)),res.join(', '));}
  /* ---- other callers: a cast without the mastery hook (the developer cast map, echoes) is Mastery 0, whatever the account has ---- */
  {const S=trial(5,14.5,{direct:true}),T=S.T;ok('a direct castSingularity (no mastery context) casts Mastery 0 even at Mastery 5 on the account',!SGM.dbg.length&&pinned(S)[0]>3.99&&mhpH(S,T[0]).every(h=>near(h.amt,25000))&&!S.log.some(h=>near(h.amt,40)||near(h.amt,500)));}
  /* ---- the real path: fireScroll at every mastery (a Secret is cast a second later, with its power factor) ---- */
  {const res=[];for(let L=1;L<=5;L++){const S=stage();SGM.dbg=[];const log=[];hurt=function(e,amt,kind,o){if(o&&o.spell==='singularity'&&e===S.T[0])log.push(amt);return H0.apply(this,arguments);};
      try{setL(L);meta.spells.singularity=meta.spells.singularity||{lvl:1,hero:null};const st=heroStats(),lv=meta.spells.singularity.lvl||1,P=scrollPow(heroU,'singularity',st,lv);heroU.scd={};heroU.gcd=0;
        fireScroll(heroU,'singularity',st,S.F.filter(e=>!e.dead));run(.5);const early=ev('cast').length;run(5);const c=ev('cast')[0];
        res.push({L,ok:!early&&c&&c.L===L&&log.length>0&&near(log[0],P*3*.05,1e-9)&&near(smP('singularity'),SMG.singularity[L-1]),P:+P.toFixed(2)});run(10);}finally{hurt=H0;setL(0);}}
    ok('fireScroll at every mastery: the cast arrives a second later at its mastery, with the power factor (the drain is 3 x the cast\'s power a second)',res.every(r=>r.ok),res.map(r=>'M'+r.L+(r.ok?' ok':' FAIL')+' P'+r.P).join(', '));}
  /* ---- the mastery preview never casts a second Singularity over the first (two would grade the lights twice and leave them tinted) ---- */
  {go();const calls=[];const C0=castSingularity;castSingularity=function(){calls.push({t:time,n:SGL.n,l:lights()});return C0.apply(this,arguments);};
    /* (stepped without anim: the day cycle would tint the lights; cineLock counts down as anim does) */
    try{smPvStart('singularity',5);for(let i=0;i<Math.round(40/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);cineLock=Math.max(0,cineLock-.05);}smPvStop();paused=false;for(let i=0;i<Math.round(15/.05);i++){update(.05);updFx(.05);cineLock=Math.max(0,cineLock-.05);}}
    finally{castSingularity=C0;SMPV.on=false;}
    const gaps=calls.slice(1).map((c,i)=>c.t-calls[i].t);
    const lf=lights();ok('the mastery preview casts again only after the hole has closed (never two at once), and the lights come back exactly each time',calls.length>=2&&calls.every(c=>c.n===0&&c.l===calls[0].l)&&gaps.every(g=>g>=13.8-1e-6)&&lf===calls[0].l&&SGL.n===0,calls.length+' casts, '+gaps.map(g=>g.toFixed(2)).join(',')+'; SGL.n at each '+calls.map(c=>c.n).join(',')+'; lights '+calls.map(c=>c.l).join(' / ')+' -> '+lf);}
  ok('no console errors',errs===0,errs);
}catch(err){ok('the test ran to the end',false,err.message+' '+String(err.stack).slice(0,300));}
finally{hurt=H0;scene.add=S0;shockwave=SW0;vfWave=VW0;console.error=ce;delete window.__sgm0;SMPV.on=false;for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;SGM.dbg=null;
  state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
