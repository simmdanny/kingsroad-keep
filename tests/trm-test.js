(function(){
/* Oakheart Treant's masteries (v426, designed with MASTERY_DESIGN.md). Run on the dev page: __kk.ev(await (await fetch('/tests/trm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand still on the first road near the hero, set apart along it and to its sides (only the effects
   are stepped, updFx, with the game clock moved along); hurt is wrapped to log the amount each hit is called with (the cast's power is 100:
   a slam deals 240 within 1.25; the treant rises where the hero stands and walks up the road toward the foes). Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  RT=ROUTES[0];D0=RT.len*.45;{const p=posAt(D0,RT);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}meta.spells.treant=meta.spells.treant||{lvl:1,hero:null};darkTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.treant=SM_XP[L-1];else delete meta.smast.treant;};
const foe=(dd,off,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0+dd;e.off=off||0;moveEnemy(e,0);e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* a crowd up the road from the hero, where the treant walks */
const crowd=()=>[-1.4,-1.7,-2,-2.3,-2.6].map((d,i)=>foe(d,(i%2?.15:-.15)));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,list)=>{setL(L);castScrollNow('treant',heroU,tStats(heroU),list||enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'nature',anc:false,spell:'treant'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const sm=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const old=e=>log.filter(h=>h.e===e&&!h.smx);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>TRM.dbg.filter(x=>x.ev===k);
const go=(L,list,sec)=>{const added=track();wrapHurt();try{cast(L,list);run(sec||11);}finally{hurt=H0;scene.add=S0;setL(0);}return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries and their names',SM_D.treant.map(x=>x.n).join('|')==='Heavy Tread|Battering Trunk|Uprooted Boulder|Growth Rings|Timber!',SM_D.treant.map(x=>x.n).join('|'));
  ok('the numbers on the card match the code',/15%/.test(smDesc('treant',0))&&/160%/.test(smDesc('treant',2))&&/60%/.test(smDesc('treant',1))&&/1\.5 tiles/.test(smDesc('treant',1))&&/120%/.test(smDesc('treant',3))&&/2\.2 tiles/.test(smDesc('treant',3))&&/0\.8s/.test(smDesc('treant',3))&&/300%/.test(smDesc('treant',4))&&TRM.tread===.15&&TRM.hurl===1.6&&TRM.ram===.6&&TRM.ramN===3&&TRM.ramDist===1.5&&TRM.ringN===4&&TRM.grove===1.2&&TRM.groveR===2.2&&TRM.groveHold===.8&&TRM.timber===3&&TRM.hurlMax===4.5,[0,1,2,3,4].map(i=>smDesc('treant',i)).join(' / '));
  ok('the old masteries are gone, SMA is 1 and the numbers are tuned (no SM.free)',!SMF.treant.cast&&!SMF.treant.hit&&SMA.treant.every(x=>x===1)&&!(SM.free&&SM.free.treant));
  ok('no mastery name is also a scroll\'s name',!SM_D.treant.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 and the 3D slam ---- */
  {play();TRM.dbg=[];log=[];crowd();let sw=0;const S0w=shockwave;shockwave=function(){sw++;return S0w.apply(this,arguments);};let added;try{added=go(0);}finally{shockwave=S0w;}
    const slams=new Set(log.filter(h=>near(h.amt,240)).map(h=>h.t.toFixed(2))).size;
    ok('Mastery 0: the old treant (slams of 240) and none of the masteries',slams>0&&log.every(h=>!h.smx)&&TRM.dbg.every(x=>x.ev==='quake'),slams+' slams, '+log.length+' hits');
    ok('every slam bursts in 3D (trmQuake; slams that miss burst too), with no flat shockwave',ev('quake').length>=slams&&slams>0&&sw===0,ev('quake').length+' '+sw);
    ok('Mastery 0: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M1 Heavy Tread ---- */
  {play();TRM.dbg=[];log=[];crowd();const Fl=foe(-1.5,.2,'raven');const added=go(1);const tr=ev('tread');
    ok('M1: its steps shake the road: 15% to ground foes within 1',tr.length>0&&log.filter(h=>h.smx).every(h=>near(h.amt,15))&&sm(tr[0].e,15).length>0,tr.length+' treads');
    ok('M1: flyers feel nothing',!sm(Fl).length);
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Battering Trunk ---- */
  {play();TRM.dbg=[];log=[];const F=crowd(),Bo=foe(-2.15,0);Bo.boss=true;Bo.maxHp=Bo.hp=1e12;const added=go(2);const ch=ev('charge'),rm=ev('ram'),c0=ev('cast')[0].time;
    ok('M2: with 3 or more ground foes close in front of it, it charges',ch.length>0&&ch.every(x=>x.n>=3),ch.map(x=>x.n+'@'+(x.time-c0).toFixed(2)).join(' '));
    ok('M2: 60% to each foe it runs through',rm.length>=3&&rm.every(x=>sm(x.e,60).length>=1)&&log.filter(h=>h.smx&&!near(h.amt,15)).every(h=>near(h.amt,60)||near(h.amt,160)),rm.length+' rammed');
    ok('M2: they are thrown to the side of the road; a boss holds its ground',rm.filter(x=>!x.boss).every(x=>near(Math.abs(x.e.off),TRM.ramSide,.02))&&rm.some(x=>x.e===Bo)&&near(Bo.off||0,0),rm.map(x=>(x.e.off||0).toFixed(2)).join(','));
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();TRM.dbg=[];log=[];foe(-1.4,0);foe(-1.8,.1);go(2);ok('M2: two foes are not enough to charge',!ev('charge').length);}
  {play();TRM.dbg=[];log=[];crowd();go(1);ok('M2 needs Mastery 2',!ev('charge').length&&!ev('ram').length);}
  /* ---- M3 Uprooted Boulder ---- */
  {play();TRM.dbg=[];log=[];crowd();const far=[-5,-5.2,-5.4].map(d=>foe(d,0));const added=go(3);const hu=ev('hurl'),bo=ev('boulder');
    ok('M3: every third slam hurls a boulder at foes 1.4 to 4.5 tiles away',hu.length>0&&ev('quake').length>=3,hu.length+' boulders, '+ev('quake').length+' quakes');
    ok('M3: 160% within 1 of where it lands',bo.length>0&&bo.every(x=>sm(x.e,160).length>=1),bo.length);
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Growth Rings ---- */
  {play();TRM.dbg=[];log=[];const F=crowd();F.forEach(e=>ovgApply(e,9));const added=go(4);const rg=ev('ring'),gv=ev('grove'),g0=ev('grove0')[0];
    ok('M4: each Overgrown foe its slam hits adds a ring, up to 4',rg.length>=4&&rg.slice(0,4).every((x,i)=>x.n===i+1)&&rg.every(x=>x.n<=4),rg.map(x=>x.n).join(''));
    ok('M4: at 4 rings the next slam is a Grove Slam',gv.length>=1&&g0&&rg.filter(x=>x.time<g0.time).length>=4&&rg.filter(x=>x.time<g0.time).slice(-1)[0].n===4,gv.length+' grove slams');
    ok('M4: roots hold the ground foes within 2.2 tiles: 120% each',gv[0]&&gv[0].L.length>0&&gv[0].L.every(e=>sm(e,120).length>=1),gv[0]&&gv[0].L.length);
    ok('M4: then the rings are spent and grow again from one',rg.filter(x=>g0&&x.time>g0.time).every((x,i)=>x.n===i+1),rg.filter(x=>g0&&x.time>g0.time).map(x=>x.n).join(''));
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();TRM.dbg=[];log=[];const F=crowd();F.forEach(e=>ovgApply(e,9));let st=new Map();const added=track();wrapHurt();
    try{cast(4);for(let i=0;i<220;i++){run(.05);for(const x of ev('grove'))for(const e of x.L)if(!st.has(e))st.set(e,e.stunT||0);}}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M4: the Grove Slam holds them (Resolve applies)',st.size>0&&[...st.values()].every(v=>v>0),[...st.values()].map(v=>v.toFixed(2)).join(','));}
  /* ---- M5 Timber! ---- */
  {play();TRM.dbg=[];log=[];crowd();const added=track();wrapHurt();let F=null;try{cast(5);run(8.5);const g=TRM.lastG,yaw=g.rotation.y,dx=-Math.sin(yaw),dz=-Math.cos(yaw);const mk=(u,v)=>{const e=foe(0,0);e.x=g.position.x+dx*u+dz*v;e.z=g.position.z+dz*u-dx*v;return e;};
      F={on:[mk(1,0),mk(2,.1)],off:mk(1.2,1.4)};F.on.forEach(e=>e.ovgT=0);run(3);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M5: it creaks and falls forward at the end',!!ev('creak')[0]&&!!ev('timber')[0]&&ev('timber')[0].time>ev('creak')[0].time);
    ok('M5: 300% to every foe under its length, and they are Overgrown; one beside it is spared',F.on.every(e=>sm(e,300).length===1&&e.ovgT>0)&&!sm(F.off).length,F.on.map(e=>sm(e).map(h=>h.amt).join('/')).join(' ; ')+' | '+sm(F.off).length);
    ok('M5: everything is gone afterwards',smLeft(added)===0,smLeft(added));}
  /* ---- other casters ---- */
  {play();TRM.dbg=[];log=[];setL(5);crowd();wrapHurt();try{castTreant(heroU,100,{src:heroU,el:'nature'});run(11);castTreant(heroU,100,{src:heroU,el:'nature',spell:'treant',smx:1,smId:1});run(11);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old treant',log.length>0&&log.every(h=>near(h.amt,240))&&TRM.dbg.every(x=>x.ev==='quake'),log.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();TRM.dbg=[];setL(L);crowd();heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'treant',s,enemies.filter(e=>!e.dead));run(11.5);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&!!ev('tread')[0]&&(L<5||!!ev('timber')[0]),thrown+' '+['cast','tread','hurl','timber'].map(k=>ev(k).length).join(','));}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;TRM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
