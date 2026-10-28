(function(){
/* Hundred-Year Bloom's masteries (v437, designed with Simon's framework, MASTERY_DESIGN.md). Run on the dev page:
   __kk.ev(await (await fetch('/tests/hyb-test.js')).text()) returns [name, ok, detail] rows. Power 100: the burst deals 700 at 1.8s and
   the pollen 12.5 every 0.25s for 5s. The flower opens on the densest foe of the list (radius 2.2). hurt is wrapped to log each hit;
   HYB.dbg logs the masteries' events. Foes walk (and the pollen ticks) only where a row steps the game (update). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add,B0=cfmBoom;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
/* update moves the clock itself, so a walking row does not add to it */
let walk=false;const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){if(walk){heroU.cd=1e9;update(.05);}else time+=.05;updFx(.05);}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.bloom=SM_XP[L-1];else delete meta.smast.bloom;};
const RT=()=>ROUTES[0];let D=0,T0=0;
const foe=(d,type,hp,spd)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT();e.dist=d;e.off=0;e.spd=spd||0;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;e.regen=0;moveEnemy(e,0);return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time-T0});return H0.apply(this,arguments);};};
let booms=[];cfmBoom=function(x,y,z,S,o){booms.push(o&&o.pal);return B0.apply(this,arguments);};
const near=(a,b,t)=>Math.abs(a-b)<=(t||1e-6)*Math.max(1,Math.abs(b));
const setup=()=>{play();walk=false;const R=RT();D=Math.min(R.len-7,Math.max(10,R.len*.5));};
const cast=(L,list)=>{setL(L);T0=time;HYB.dbg=[];booms=[];castScrollNow('bloom',heroU,tStats(heroU),list,100,{src:heroU,bane:0,el:'nature',anc:false,spell:'bloom'});};
const ev=(k,f)=>HYB.dbg.filter(x=>x.ev===k&&(!f||f(x)));
const mine=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const base=(e,amt)=>log.filter(h=>h.e===e&&!h.smx&&near(h.amt,amt));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const pack=()=>[foe(D),foe(D+.4),foe(D-.4)];
try{
  /* ---- the card ---- */
  ok('the five masteries and their names',SM_D.bloom.map(x=>x.n).join('|')==='Scent of Nectar|Vine Lattice|Petal Storm|Golden Haze|A Hundred Years in a Breath',SM_D.bloom.map(x=>x.n).join('|'));
  const T=i=>smDesc('bloom',i);
  ok('and their numbers: 3.5 tiles; 25%, 3s; 16, 80%, 3; 30%, 40%; 10, 0.6s, 50%',/3\.5 tiles/.test(T(0))&&/25%/.test(T(1))&&/3s/.test(T(1))&&/16/.test(T(2))&&/80%/.test(T(2))&&/at most 3/.test(T(2))&&/30%/.test(T(3))&&/40%/.test(T(3))&&/10 glowing/.test(T(4))&&/0\.6s/.test(T(4))&&/50%/.test(T(4)),[0,1,2,3,4].map(T).join(' / '));
  ok('the old hooks are gone (the masteries live in the flower itself)',SMF.bloom&&!SMF.bloom.hit&&!SMF.bloom.cast);
  wrapHurt();
  /* ---- Mastery 0: the old bloom, its burst a cloud of pollen ---- */
  {setup();const P=pack();log=[];cast(0,P);run(2);
    ok('Mastery 0: the burst as before (700 to each) and no mastery at all',P.every(e=>base(e,700).length===1)&&!log.some(h=>h.smx)&&HYB.dbg.length===0,log.map(h=>Math.round(h.amt)).join(','));
    ok('the explosion rule: the burst billows up as a golden cloud of pollen (cfmBoom, the pollen palette), with no mastery too',booms.includes('pollen')&&!!CFM_PAL.pollen,booms.join(','));
    walk=true;run(1);walk=false;ok('Mastery 0: its pollen chokes for 12.5 every 0.25s',P.every(e=>base(e,12.5).length>=3),base(P[0],12.5).length);}
  /* ---- M1 Scent of Nectar ---- */
  {setup();const P=pack(),B=foe(D+2.9,'soldier',1e9,.5),C=foe(D+6,'soldier',1e9,.5),c0=C.dist;walk=true;log=[];cast(1,P.concat([B,C]));run(1.4);
    ok('M1: a foe up to 3.5 tiles past the flower turns back up the road to it',ev('lure',x=>x.e===B).length===1&&B.dist<D+2.9-.8&&B.dist>D+1.2,(B.dist-D).toFixed(2));
    ok('M1: a foe farther out walks on',!ev('lure',x=>x.e===C).length&&C.dist>c0+.3,(C.dist-c0).toFixed(2));walk=false;}
  {setup();const P=pack(),O=foe(D+2.9,'ogre',1e9,.5);walk=true;log=[];cast(1,P.concat([O]));run(1.4);
    ok('M1: a boss is drawn at half the pace',ev('lure',x=>x.e===O).length===1&&O.dist<D+2.9-.3&&O.dist>D+2.9-.9,(D+2.9-O.dist).toFixed(2));walk=false;}
  /* ---- M2 Vine Lattice ---- */
  {setup();const P=pack(),[A,B,C]=P;log=[];cast(2,P);run(1);
    ok('M2: the vines bind every foe the bloom holds to each other',ev('bind').length===3&&P.every(e=>HYB_BOUND.has(e)),ev('bind').length);
    let b0=B.hp,c0=C.hp;hurt(A,100,'phys',{src:heroU});
    ok('M2: 25% of a hit on one from anything else runs along the vines to the others',near(b0-B.hp,25,.01)&&near(c0-C.hp,25,.01)&&ev('share').length===1,(b0-B.hp)+' '+(c0-C.hp));
    b0=B.hp;hurt(A,100,'magic',{src:heroU,spell:'bloom',el:'nature'});ok('M2: the bloom\'s own hits do not run',B.hp===b0);
    run(1.2+2.4);b0=B.hp;hurt(A,100,'phys',{src:heroU});ok('M2: the vines still hold just under 3s after the burst',near(b0-B.hp,25,.01));
    run(.6);b0=B.hp;hurt(A,100,'phys',{src:heroU});ok('M2: and are gone after',B.hp===b0&&!P.some(e=>HYB_BOUND.has(e)),b0-B.hp);}
  /* ---- M3 Petal Storm ---- */
  {setup();const P=pack().concat([foe(D+1)]),far=foe(D+5);log=[];cast(3,P.concat([far]));run(3.3);const n=P.map(e=>mine(e,80).length);
    ok('M3: the burst throws 16 razor petals that slice into the foes near it for 80% each, at most 3 on a foe',ev('storm').length===1&&n.reduce((a,b)=>a+b,0)===12&&n.every(x=>x===3),n.join(''));
    ok('M3: not one farther than 3.2 tiles',!mine(far,80).length);}
  /* ---- M4 Golden Haze ---- */
  {setup();const P=[foe(D,'soldier',1e9,.6),foe(D+.4,'soldier',1e9,.6),foe(D-.4,'soldier',1e9,.6)];walk=true;log=[];cast(4,P);run(1.9);
    const cl=NAT.pollen[NAT.pollen.length-1],x0=cl&&cl.x,z0=cl&&cl.z;
    ok('M4: the pollen cloud is 30% wider and 40% thicker (17.5 every 0.25s)',!!cl&&near(cl.R,2.2*1.05*1.3,.001)&&ev('haze').length===1,cl&&cl.R.toFixed(2));
    run(3);const A=P[0],moved=Math.hypot(cl.x-x0,cl.z-z0);
    ok('M4: it drifts down the road with the foes in it, and they choke for all of it',moved>.4&&(A.x-cl.x)**2+(A.z-cl.z)**2<=cl.R*cl.R&&base(A,17.5).length>=12,moved.toFixed(2)+' / '+base(A,17.5).length+' ticks '+base(A,17.5).map(h=>h.t.toFixed(2)).join(','));
    ok('M4: they are left Overgrown while they breathe it',A.ovgT>0,A.ovgT&&A.ovgT.toFixed(2));walk=false;}
  /* ---- M5 A Hundred Years in a Breath ---- */
  {setup();const P=[foe(D),foe(D+1.5),foe(D-1.5)],O=foe(D+3,'ogre');log=[];cast(5,P.concat([O]));run(2.3);
    ok('M5: the seed head does not ripen before the flower has burst',!ev('seedhead').length);run(.8);
    const s=ev('seeds')[0];ok('M5: then it rises out of the fading flower and bursts into 10 seeds, one on each foe within 5 tiles',!!ev('seedhead').length&&!!s&&s.n===10&&s.on===4,s&&s.on);
    run(3);ok('M5: each seed sprouts a small bloom that bursts for 50%',ev('sprout').length===10&&P.concat([O]).every(e=>mine(e,50).length>=1),[...P,O].map(e=>mine(e,50).length).join(''));
    ok('M5: the sprouts grab the foes around them first (a boss is not grabbed)',P.every(e=>ev('grab',x=>x.e===e).length>=1)&&!ev('grab',x=>x.e===O).length,P.map(e=>ev('grab',x=>x.e===e).length).join(''));}
  /* ---- nothing left behind ---- */
  {const left=[],e0=errs;for(let L=1;L<=5;L++){setup();const F=[];for(let i=0;i<6;i++)F.push(foe(D-1.5+i*.6,i%3?'soldier':'knight'));F.push(foe(D+3));const added=track();
      cast(L,F);run(9);scene.add=S0;const n=smLeft(added);if(n)left.push('M'+L+':'+n);}
    ok('every mastery leaves nothing behind (vines, petals, seeds, sprouts, the scent)',!left.length&&HYB_BOUND.size===0,left.join(' ')+' bound '+HYB_BOUND.size);ok('and runs without errors',errs===e0,errs-e0);}
}catch(e){ok('threw',false,e.stack);}
finally{console.error=ce;hurt=H0;cfmBoom=B0;scene.add=S0;walk=false;HYB.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
