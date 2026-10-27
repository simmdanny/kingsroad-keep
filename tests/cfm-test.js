(function(){
/* Catch Flame's masteries as Simon designed them (v401). Run on the dev page: __kk.ev(await (await fetch('/tests/cfm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.catchflame=SM_XP[L-1];else delete meta.smast.catchflame;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* n foes in a row along the road, gap apart, the middle one first */
const row=(n,gap,hp)=>{const d0=spotD(),F=[];for(let i=0;i<n;i++)F.push(foe(d0+(i-Math.floor(n/2))*gap,0,hp));return F;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot)});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('catchflame',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'fire',anc:false,spell:'catchflame'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&!h.dot&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const ev=n=>CFM.dbg.filter(d=>d.ev===n);
const d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.catchflame.map(x=>x.n).join('|')==='Kindling|Backdraft|Forking Flames|Firestorm|Living Inferno',SM_D.catchflame.map(x=>x.n).join('|'));
  ok('and his numbers: 25%, 70%, every third leap, 45%, 180%',/25%/.test(smDesc('catchflame',0))&&/70%/.test(smDesc('catchflame',1))&&/third/.test(smDesc('catchflame',2))&&/45%/.test(smDesc('catchflame',3))&&/180%/.test(smDesc('catchflame',4))&&CFM.kin===.25&&CFM.bd===.7&&CFM.forkEvery===3&&CFM.fs===.45&&CFM.inf===1.8&&CFM.infMin===5&&CFM.win===6);
  ok('the old masteries are gone (no hooks), every factor at least 1, his numbers',!SMF.catchflame.hit&&!SMF.catchflame.cast&&SMA.catchflame.every(x=>x===1)&&SMG.catchflame.length===5&&SMG.catchflame.every(x=>x>=1)&&SM.free&&!!SM.free.catchflame);
  /* ---- Mastery 0 ---- */
  {play();CFM.dbg=[];log=[];const F=row(5,.45),T=F[2];wrapHurt();try{cast(T,0);run(5);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the old cast (the seed 100%, then 60% leaps) and none of the masteries',hits(T,100,false).length===1&&F.filter(e=>e!==T).every(e=>hits(e,60,false).length===1)&&!CFM.dbg.length&&!log.some(h=>h.smx),CFM.dbg.length+' '+log.filter(h=>!h.dot).map(h=>h.amt).join(','));}
  /* ---- M1 Kindling ---- */
  {play();CFM.dbg=[];log=[];const F=row(9,.45),T=F[4];wrapHurt();try{cast(T,1);run(1.6);}finally{hurt=H0;}
    const E=F.filter(e=>hits(e,25,true).length);
    ok('M1: when the seed lands, the first foe spits 3 embers at the nearest unlit foes: 25% each',E.length===3&&E.every(e=>hits(e,25,true).length===1&&d2(e,T)<1)&&ev('kindle').length===1&&ev('ember').length===3,E.map(e=>d2(e,T).toFixed(2)).join(','));
    ok('M1: the seed and the leaps keep their own numbers',hits(T,100,false).length===1&&log.some(h=>!h.smx&&!h.dot&&near(h.amt,60)));
    ok('M1: the embers only hurt; the chain still lights those foes itself',CFM.dbg.filter(d=>d.ev==='ignite'&&d.how==='ember').length===0);
    run(5);setL(0);ok('M1: nothing else (no backdraft, fork, vortex or inferno)',!ev('backdraft').length&&!ev('fork').length&&!ev('vortex').length&&!ev('inferno').length);}
  {play();CFM.dbg=[];const T=foe(spotD());cast(T,1);run(2);setL(0);ok('M1: with no foe nearby the seed still erupts, no embers',ev('kindle').length===1&&ev('kindle')[0].n===0&&!ev('ember').length);}
  /* ---- M2 Backdraft ---- */
  {play();CFM.dbg=[];log=[];const F=row(9,.45),T=F[4];T.maxHp=T.hp=50;const near5=F.filter(e=>e!==T&&d2(e,T)<CFM.bdR);wrapHurt();
    try{cast(T,2);run(.56+CFM.bdIn+.12);}finally{hurt=H0;}
    ok('M2: the seed kills its foe: it still bursts (Backdraft) where it fell',T.dead&&ev('backdraft').length===1&&ev('backdraft')[0].e===T);
    ok('M2: the burst hits 70% to every foe within 1.25',near5.length>0&&near5.every(e=>hits(e,70,true).length===1)&&F.filter(e=>d2(e,T)>=CFM.bdR+.05).every(e=>!hits(e,70,true).length),near5.length);
    run(.6);const bi=CFM.dbg.filter(d=>d.ev==='ignite'&&d.how==='backdraft').map(d=>d.e);
    ok('M2: fragments light the unlit foes it hit',bi.length===near5.length&&near5.every(e=>bi.includes(e)),bi.length+'/'+near5.length);
    run(5);const ig=ev('ignite');ok('M2: and the fire spreads on from them, still at most ten',ig.length>1+bi.length&&ig.length<=10,ig.length);setL(0);}
  {play();CFM.dbg=[];const F=row(5,.45,1e9),T=F[2];cast(T,2);run(6);kill(F[1]);run(1);setL(0);
    ok('M2: a lit foe that dies after its fire is out does not burst',!ev('backdraft').length);}
  {play();CFM.dbg=[];const F=row(5,.45),T=F[2];T.maxHp=T.hp=50;cast(T,1);run(3);setL(0);ok('M2 needs Mastery 2',T.dead&&!ev('backdraft').length);}
  /* ---- M3 Forking Flames ---- */
  {play();CFM.dbg=[];log=[];const F=row(16,.45),T=F[8];wrapHurt();try{cast(T,3);run(7);}finally{hurt=H0;}const c=[...SM.ctx.values()].pop(),fk=ev('fork'),fi=CFM.dbg.filter(d=>d.ev==='ignite'&&d.how==='fork');
    ok('M3: every third leap splits into two fireballs on two different foes',fk.length>=1&&fk.every(d=>d.q1!==d.q2)&&c.cf&&Math.floor(c.cf.sp/3)>=fk.length,fk.length+' forks, '+(c.cf&&c.cf.sp)+' leaps');
    ok('M3: both strike for the normal leap damage (60%) and light their foe',fi.length===fk.length*2&&fk.every(d=>hits(d.q1,60,false).length===1&&hits(d.q2,60,false).length===1));
    ok('M3: both count toward the ten',ev('ignite').length===10&&c.cf.n===10,ev('ignite').length);setL(0);}
  {play();CFM.dbg=[];const F=row(16,.45),T=F[8];cast(T,2);run(7);setL(0);ok('M3 needs Mastery 3',!ev('fork').length&&ev('ignite').length===10);}
  /* ---- M4 Firestorm ---- */
  {play();CFM.dbg=[];log=[];const F=row(16,.45),T=F[8];wrapHurt();try{cast(T,4);run(7);}finally{hurt=H0;}const vx=ev('vortex'),vh=ev('vortexHit');
    ok('M4: a foe that passes the fire on gets a vortex, once per foe',vx.length>=2&&new Set(vx.map(d=>d.e)).size===vx.length,vx.length);
    ok('M4: each vortex hits 45% to the foes within 0.95 of its foe',vh.length===vx.length&&vh.every(d=>d.L.length>0&&d.L.every(e=>d2(e,d.e)<CFM.fsR+.05)&&d.L.every(e=>hits(e,45,true).length>=1)),vh.map(d=>d.n).join(','));
    ok('M4: the sources are foes that leapt the fire on',vx.every(d=>CFM.dbg.some(x=>x.ev==='ignite'&&x.e===d.e)));setL(0);}
  {play();CFM.dbg=[];const F=row(16,.45),T=F[8];cast(T,3);run(7);setL(0);ok('M4 needs Mastery 4',!ev('vortex').length);}
  /* ---- M5 Living Inferno ---- */
  {play();CFM.dbg=[];log=[];const F=row(16,.45),T=F[8],Fl=foe(spotD()+.2,.3);Fl.fly=true;const added=track();wrapHurt();
    try{cast(T,5);run(4.5);const st=ev('infernoStart');
      ok('M5: when the tenth foe catches fire, the Living Inferno starts, once',st.length===1&&st[0].why==='ten'&&st[0].n===10,st.map(d=>d.why+':'+d.n).join());
      const inf=ev('inferno')[0];run(CFM.infBoom+.2);const ih=ev('infernoHit');
      ok('M5: it explodes after 2.1s for 180% to every foe within 2.1 of the burning foes\' middle, flyers too',ih.length===1&&ih[0].L.length>0&&ih[0].L.every(e=>hits(e,180,true).length===1&&Math.hypot(e.x-inf.x,e.z-inf.z)<CFM.infR+.01)&&enemies.filter(e=>!e.dead&&Math.hypot(e.x-inf.x,e.z-inf.z)<CFM.infR-.01).every(e=>ih[0].L.includes(e))&&(Math.hypot(Fl.x-inf.x,Fl.z-inf.z)>=CFM.infR||ih[0].L.includes(Fl)),ih.length&&ih[0].n);
      run(6);ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();CFM.dbg=[];const F=row(6,.45),T=F[3];cast(T,5);run(5.5);const s0=ev('infernoStart').length;run(1.2);const st=ev('infernoStart');setL(0);
    ok('M5: if the chain stops short, the inferno comes when the 6s window ends (here 6 caught fire)',s0===0&&st.length===1&&st[0].why==='window'&&st[0].n===6,st.map(d=>d.why+':'+d.n).join());}
  {play();CFM.dbg=[];const F=row(4,.45),T=F[2];cast(T,5);run(9);setL(0);ok('M5: fewer than five lit, no inferno',!ev('infernoStart').length&&ev('ignite').length===4,ev('ignite').length);}
  {play();CFM.dbg=[];const F=row(16,.45),T=F[8];cast(T,4);run(9);setL(0);ok('M5 needs Mastery 5',!ev('inferno').length);}
  /* ---- the rest ---- */
  {play();CFM.dbg=[];const F=row(5,.45),T=F[2];setL(5);castCatchFlame(heroU,T,100,{src:heroU,el:'fire',spell:'catchflame'});run(6);setL(0);
    ok('casts that are not a mastered scroll cast stay the old Catch Flame',!CFM.dbg.length);}
  {const e0=errs,n0=NS_OWN.size;for(let L=1;L<=5;L++){play();const F=row(14,.4,300),T=F[7];F[3].zapT=6;F[10].zapT=6;cast(T,L);run(12);}setL(0);
    ok('the real cast path at every mastery (deaths, Wildfire) runs without errors, and frees its trails and cracks',errs===e0&&NS_OWN.size<=n0,(errs-e0)+' errors, '+(NS_OWN.size-n0)+' left');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;CFM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
