(function(){
/* Glacial Rift's masteries (v436, designed with Simon's framework, MASTERY_DESIGN.md). Run on the dev page:
   __kk.ev(await (await fetch('/tests/grm-test.js')).text()) returns [name, ok, detail] rows. Power 100: the wave deals 550 and the shatter
   400. The rift runs from 1.2 tiles ahead of the first foe of the list back 8.5 tiles; its wave rises at 0.9s, the ridge shatters at 3.7s.
   hurt is wrapped to log each hit; GRM.dbg logs the masteries' events. Foes walk only where a row steps the game (update). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
/* update moves the clock itself, so a walking row does not add to it */
let walk=false;const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){if(walk)update(.05);else time+=.05;updFx(.05);}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.glacialrift=SM_XP[L-1];else delete meta.smast.glacialrift;};
const RT=()=>ROUTES[0];let D=0,T0=0;
const foe=(d,type,hp,spd)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT();e.dist=d;e.off=0;e.spd=spd||0;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;e.regen=0;moveEnemy(e,0);return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time-T0});return H0.apply(this,arguments);};};
const near=(a,b,t)=>Math.abs(a-b)<=(t||1e-6)*Math.max(1,Math.abs(b));
const setup=()=>{play();walk=false;const R=RT();D=Math.min(R.len-3,Math.max(10,R.len*.55));};
const cast=(L,list)=>{setL(L);T0=time;GRM.dbg=[];castScrollNow('glacialrift',heroU,tStats(heroU),list,100,{src:heroU,bane:0,el:'ice',anc:false,spell:'glacialrift'});};
const ev=(k,f)=>GRM.dbg.filter(x=>x.ev===k&&(!f||f(x)));
const mine=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const base=(e,amt)=>log.filter(h=>h.e===e&&!h.smx&&near(h.amt,amt));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries and their names',SM_D.glacialrift.map(x=>x.n).join('|')==='Frozen Sentinels|Undertow|Calving|Deep Cold|Glacial Maw',SM_D.glacialrift.map(x=>x.n).join('|'));
  const T=i=>smDesc('glacialrift',i);
  ok('and their numbers: 1.5s; 45%; 130%; 2s, 0.6s, 120%; 1s, 350%',/1\.5s/.test(T(0))&&/45%/.test(T(1))&&/130%/.test(T(2))&&/2s/.test(T(3))&&/0\.6s/.test(T(3))&&/120%/.test(T(3))&&/1s/.test(T(4))&&/350%/.test(T(4)),[0,1,2,3,4].map(T).join(' / '));
  ok('the old hooks are gone (the masteries live in the rift itself)',SMF.glacialrift&&!SMF.glacialrift.hit&&!SMF.glacialrift.cast);
  wrapHurt();
  /* ---- Mastery 0: the old rift ---- */
  {setup();const A=foe(D),B=foe(D-3);log=[];cast(0,[A,B]);run(4.6);
    ok('Mastery 0: the wave and the shatter as before (550 then 400), and no mastery at all',base(A,550).length===1&&base(A,400).length===1&&base(B,550).length===1&&!log.some(h=>h.smx)&&GRM.dbg.length===0,log.map(h=>Math.round(h.amt)).join(','));}
  /* ---- M1 Frozen Sentinels ---- */
  {setup();const A=foe(D),boss0=foe(D-2,'ogre');log=[];cast(1,[A,boss0]);run(3.6);
    ok('M1: a foe the wave froze is still frozen (and held) just before the shatter',A.stunT>0&&!ev('statue').length,A.stunT&&A.stunT.toFixed(2));
    run(.2);const st=ev('statue',x=>x.e===A).length===1;ok('M1: as the ridge shatters it is left standing as an ice statue (a boss is not)',st&&!ev('statue',x=>x.e===boss0).length&&A.stunT>1.2,A.stunT&&A.stunT.toFixed(2));
    /* a foe walking up from behind stops at the statue; a boss walks on past it */
    walk=true;const C=foe(A.dist-1.2,'soldier',1e9,1.2),B2=foe(A.dist-.75,'ogre',1e9,1.2);B2.off=.1;run(1);
    ok('M1: a ground foe walking up behind the statue cannot pass it',C.dist<=A.dist-GRM.gap+1e-6&&C.dist>A.dist-GRM.gap-.2,(A.dist-C.dist).toFixed(2)+' behind');
    ok('M1: a boss pushes through (past where the statue stops the others)',B2.dist>A.dist-GRM.gap+.1,(B2.dist-A.dist).toFixed(2));
    run(1.2);ok('M1: when the statue thaws the foe behind walks on',C.dist>A.dist-GRM.gap+.05,(C.dist-A.dist).toFixed(2));walk=false;}
  /* ---- M2 Undertow ---- */
  {setup();const A=foe(D),F=foe(D-1,'raven'),B=foe(D-2.5,'ogre');const dA=A.dist,dB=B.dist;log=[];cast(2,[A,F,B]);run(1.4);
    ok('M2: the wave drags a ground foe a tile back up the road and grinds it for 45%',near(A.dist,dA-GRM.push,.02)&&mine(A,45).length===1,(dA-A.dist).toFixed(2));
    ok('M2: not a flyer or a boss',!mine(F,45).length&&!mine(B,45).length&&near(B.dist,dB,.001),ev('push').length);}
  /* ---- M3 Calving ---- */
  {setup();const L=[];for(let i=0;i<7;i++)L.push(foe(D-i*1));log=[];cast(3,L);run(3.6);const cv=ev('calve');
    ok('M3: while the ridge stands slabs calve off it and crash onto the road',cv.length>=4&&cv.every(x=>x.t-T0>1.1&&x.t-T0<3.7),cv.length+' slabs');
    ok('M3: 130% to the foes under a slab (it topples at the foe it was calved for)',L.some(e=>mine(e,130).length>0),L.map(e=>mine(e,130).length).join(''));}
  /* ---- M4 Deep Cold ---- */
  {setup();const A=foe(D),far=foe(Math.min(RT().len-.3,D+5)),fly=foe(Math.max(.5,D-12),'raven');log=[];cast(4,[A,far,fly]);run(2.8);
    ok('M4: rime gathers on every foe out in the blizzard, even far from the rift (not frozen yet at 1.9s in it)',!ev('cold',x=>x.e===far).length,far.stunT);
    run(.4);const c=ev('cold',x=>x.e===far)[0];ok('M4: after 2s in it the foe freezes solid',!!c&&c.t-T0>2.75&&c.t-T0<3.15&&far.stunT>0,c&&(c.t-T0).toFixed(2));
    ok('M4: flyers too',ev('cold',x=>x.e===fly).length===1);run(1);
    ok('M4: as it thaws the ice cracks off it for 120%, once',mine(far,120).length===1&&ev('cold',x=>x.e===far).length===1,mine(far,120).length);}
  /* ---- M5 Glacial Maw ---- */
  {setup();const A=foe(D),B=foe(D-2),O=foe(D-4,'ogre');A.off=.25;log=[];cast(5,[A,B,O]);run(3.8);
    ok('M5: the maw does not open at the shatter itself, but just after',!ev('maw').length);run(.3);
    const m=ev('maw')[0];ok('M5: then it tears open along the stretch, and its foes are held (a boss is not)',!!m&&m.n===3&&A.stunT>.5&&B.stunT>.5&&!(O.stunT>.5),m&&m.n);
    run(.4);ok('M5: they are dragged over the crevasse',Math.abs(A.off)<.02,A.off.toFixed(3));
    run(1);ok('M5: the fangs slam shut: 350% to each',ev('slam').length===1&&mine(A,350).length===1&&mine(B,350).length===1&&mine(O,350).length===1,[A,B,O].map(e=>mine(e,350).length).join(''));}
  /* ---- nothing left behind ---- */
  {const left=[],e0=errs;for(let L=1;L<=5;L++){setup();const F=[];for(let i=0;i<6;i++)F.push(foe(D-i*1.2,i%3?'soldier':'knight'));F.push(foe(Math.min(RT().len-.3,D+6)));const added=track();
      cast(L,F);run(8.5);scene.add=S0;const n=smLeft(added),crust=enemies.some(e=>e.g&&e.g.children.some(c=>c.children&&c.children.some(m=>m.material===GRM_CRUST)));if(n||crust)left.push('M'+L+':'+n+(crust?'+crust':''));}
    ok('every mastery leaves nothing behind (statues, slabs, crust, the maw)',!left.length,left.join(' '));ok('and runs without errors',errs===e0,errs-e0);}
}catch(e){ok('threw',false,e.stack);}
finally{console.error=ce;hurt=H0;scene.add=S0;walk=false;GRM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
