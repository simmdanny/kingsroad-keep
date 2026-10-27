(function(){
/* Basic Beam's masteries as Simon designed them (v403). Run on the dev page: __kk.ev(await (await fetch('/tests/bem-test.js')).text())
   returns [name, ok, detail] rows. The beam is cast from the hero at a target 1.5 tiles east of it, so it runs along +x; foes are put where
   the test wants them and stand still (only the effects are stepped, updFx, with the game clock moved along), and hurt is wrapped to log the
   amount each hit is called with, so the numbers are checked exactly (the cast's power is 100, so the beam is 225). Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  meta.spells.beam=meta.spells.beam||{lvl:1,hero:null};flashA=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.beam=SM_XP[L-1];else delete meta.smast.beam;};
const len=()=>tStats(heroU).range+1.5;
/* a foe at (dx, dz) from the hero, standing still */
const foe=(dx,dz,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=1;e.off=0;moveEnemy(e,0);e.x=heroU.x+dx;e.z=heroU.z+dz;e.y=0;e.spd=1;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
const fly=(dx,dz)=>{const e=foe(dx,dz,'raven');e.fly=true;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx)});return H0.apply(this,arguments);};};
const cast=(L,T)=>{setL(L);castScrollNow('beam',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'light',anc:false,spell:'beam'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>BEM.dbg.filter(x=>x.ev===k);
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.beam.map(x=>x.n).join('|')==='Shatterlight|Prism Split|Lightbound Mirrors|Heaven\'s Verdict|Absolute Radiance',SM_D.beam.map(x=>x.n).join('|'));
  ok('and his numbers: 35%, 65%, 75%, 100%, 150%',/35%/.test(smDesc('beam',0))&&/65%/.test(smDesc('beam',1))&&/75%/.test(smDesc('beam',2))&&/100%/.test(smDesc('beam',3))&&/150%/.test(smDesc('beam',4))&&BEM.sh===.35&&BEM.pr===.65&&BEM.mi===.75&&BEM.hv===1&&BEM.ra===1.5);
  ok('the old masteries are gone (only the beam\'s hit hook), the factors are 1, Simon\'s numbers are kept (SM.free)',typeof SMF.beam.hit==='function'&&!SMF.beam.cast&&SMA.beam.every(x=>x===1)&&SMG.beam.every(x=>x===1)&&SM.free&&!!SM.free.beam);
  ok('no mastery name is also a scroll\'s name',!SM_D.beam.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 ---- */
  {play();BEM.dbg=[];log=[];const T=foe(1.5,0),A=foe(.8,.1),F=foe(1,.8);wrapHurt();try{cast(0,T);run(2);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the old beam (225% to each foe on its line, once) and none of the masteries',hits(T,225,false).length===1&&hits(A,225,false).length===1&&!log.some(h=>h.e===F)&&!BEM.dbg.length&&!log.some(h=>h.smx),log.map(h=>h.amt).join(','));}
  /* ---- M1 Shatterlight ---- */
  {play();BEM.dbg=[];log=[];const T=foe(1.5,0),A=foe(1,0),B=foe(1.8,0),C=foe(1,.6),D=foe(1,1.5),Fl=fly(1,-.55);const added=track();wrapHurt();
    try{cast(1,T);run(2);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M1: every foe the beam strikes splinters shards, once each',[T,A,B].every(e=>ev('shatter').filter(x=>x.e===e).length===1)&&ev('shatter').length===3,ev('shatter').length);
    ok('M1: a shard deals 35% to each other foe within 0.95 of a struck one (flyers too): here two struck foes are near each',[C,Fl,A,B].every(e=>hits(e,35,true).length===2),[C,Fl,A,B].map(e=>hits(e,35,true).length).join(','));
    ok('M1: foes further away take none, and no foe shards itself',!hits(D,35).length&&!ev('shard').some(x=>x.e===x.src));
    ok('M1: the beam itself still deals its 225% once',[T,A,B].every(e=>hits(e,225,false).length===1));
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Prism Split ---- */
  {play();BEM.dbg=[];log=[];const Ln=len(),T=foe(1.5,0),P1=foe(Ln+1,0),P2=foe(Ln+2,0),Q=foe(Ln,1.6),Rb=foe(Ln-1.5,0);const added=track();wrapHurt();
    try{cast(2,T);run(2.2);}finally{hurt=H0;scene.add=S0;setL(0);}
    const p0=ev('prism0')[0],pf=ev('prism')[0];
    ok('M2: the prism forms at the beam\'s end and fires three beams after the beam has fired',!!p0&&p0.dirs.length===3&&!!pf&&pf.t>BEM.TF,p0&&p0.dirs.map(a=>a.toFixed(2)).join(','));
    ok('M2: they are aimed at the foes: 65% to each foe they pierce, once per beam',hits(P1,65,true).length===1&&hits(P2,65,true).length===1&&hits(Q,65,true).length===1,[P1,P2,Q].map(e=>hits(e,65,true).length).join(','));
    ok('M2: never back toward the hero',!hits(Rb,65).length);
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 Lightbound Mirrors ---- */
  {play();BEM.dbg=[];log=[];const Ln=len(),T=foe(1.5,0),G=BEM.miAt.map((u,i)=>{const x=Ln*u,z=(i%2?1:-1)*2;return[foe(x,z),foe(x+.15,z+.12)];});const added=track();wrapHurt();
    try{cast(3,T);run(2.2);}finally{hurt=H0;scene.add=S0;setL(0);}
    const m0=ev('mirrors0')[0],mh=ev('mirrorHits')[0],tg=m0?m0.T:[];
    ok('M3: three mirrors along the beam, each aimed at a different group',!!m0&&m0.M.length===3&&tg.every(q=>q)&&new Set(tg.map(q=>q.e)).size===3,tg.map(q=>q?q.x.toFixed(1)+','+q.z.toFixed(1):'-').join(' '));
    ok('M3: they fire after the beam: 75% to the foes on each reflected beam',!!mh&&ev('mirrors')[0].t>BEM.TF&&G.every(g=>g.some(e=>hits(e,75,true).length>=1))&&log.filter(h=>h.smx&&near(h.amt,75)).length===mh.hits.length,G.map(g=>g.map(e=>hits(e,75,true).length).join('+')).join(' '));
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Heaven's Verdict ---- */
  {play();BEM.dbg=[];log=[];const T=foe(1.5,0),A=foe(.9,0),F=foe(1,.9);const added=track();wrapHurt();
    try{cast(4,T);run(.5);A.x+=1.2;A.z+=1.2;run(2.8);}finally{hurt=H0;scene.add=S0;setL(0);}
    const v=ev('verdict')[0];
    ok('M4: the column crashes down after the halo has gathered',!!v&&v.t>BEM.TF+.5,v&&v.t.toFixed(2));
    ok('M4: 100% to every foe the beam hit, once, even one that has moved off the line',hits(T,100,true).length===1&&hits(A,100,true).length===1,[T,A].map(e=>hits(e,100,true).length).join(','));
    ok('M4: foes the beam missed take none',!hits(F,100).length);
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Absolute Radiance ---- */
  {play();BEM.dbg=[];log=[];const Ln=len(),T=foe(1.5,0),A=foe(Ln*.6,0),W=foe(Ln*.5,.7),O=foe(Ln*.5,1.3),Fl=fly(Ln*.3,0);const added=track();wrapHurt();let early=null,flMax=0;
    try{cast(5,T);run(.5);early=log.length;for(let i=0;i<30;i++){run(.05);flMax=Math.max(flMax,flashA);}run(2.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    const f=ev('fire')[0],sb=ev('starburst')[0];
    ok('M5: the star charges first; the beam fires only after it',early===0&&ev('star0').length===1&&!!f&&ev('star').length===1,early);
    ok('M5: the beam still deals its normal 225%',[T,A,Fl].every(e=>hits(e,225,false).length===1));
    ok('M5: the blade deals 150% once to each foe within 0.95 of the path (flyers too), not beyond',[T,A,W,Fl].every(e=>hits(e,150,true).length===1)&&!hits(O,150).length,[T,A,W,Fl,O].map(e=>hits(e,150,true).length).join(','));
    ok('M5: the screen is washed white, and a starburst blooms at the end',flMax>.3&&!!sb,flMax.toFixed(2));
    ok('M5: Masteries 1-4 ride it',ev('shatter').length>=3&&!!ev('prism')[0]&&!!ev('mirrors')[0]&&!!ev('verdict')[0]);
    ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- other casters ---- */
  {play();BEM.dbg=[];log=[];setL(5);const T=foe(1.5,0);wrapHurt();try{castBeam(heroU,T,len(),225,{src:heroU,el:'light'});castBeam(heroU,T,len(),225,{src:heroU,el:'light',spell:'beam',smx:1,smId:1});run(2);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old beam',hits(T,225).length===2&&!BEM.dbg.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();BEM.dbg=[];setL(L);const T=foe(1.5,0);foe(1,0);heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'beam',s,[T]);run(3);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&ev('fire').length===1&&(L<5||ev('starburst').length===1),thrown);}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;BEM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;flashA=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
