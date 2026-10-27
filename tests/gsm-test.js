(function(){
/* Grasping Shadows' masteries as Simon designed them (gsm_b.js). Run on the dev page: __kk.ev(await (await fetch('/tests/gsm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;for(const e of enemies){if(e.stunT>0)e.stunT=Math.max(0,e.stunT-.05);if(e.slowT>0)e.slowT=Math.max(0,e.slowT-.05);}}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.grasp=SM_XP[L-1];else delete meta.smast.grasp;};
/* the road spot nearest the hero (more than 1.2 away) as a road distance */
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
/* a foe on the road at distance d (sideways off), standing still */
const foe=(d,off,type,boss)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=1;/* never walks (only the effects are stepped); speed 1 so a push costs Resolve as for a normal foe */e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;if(boss)e.boss=true;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot)});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('grasp',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'dark',anc:false,spell:'grasp'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,amt));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.grasp.map(x=>x.n).join('|')==='Shackled Souls|Shadow Snare|The Grasping Circle|Dragged Below|Hand of the Abyss',SM_D.grasp.map(x=>x.n).join('|'));
  ok('and his numbers: 2s chains, 65%, 35%, 1s and 130%, 150% and 100%',/2s/.test(smDesc('grasp',0))&&/65%/.test(smDesc('grasp',1))&&/35%/.test(smDesc('grasp',2))&&/1s/.test(smDesc('grasp',3))&&/130%/.test(smDesc('grasp',3))&&/150%/.test(smDesc('grasp',4))&&/100%/.test(smDesc('grasp',4))&&GSM.sn===.65&&GSM.ci===.35&&GSM.db===1.3&&GSM.abClose===1.5&&GSM.abSlam===1);
  ok('the old masteries are gone (only the grab note), every factor at least 1',typeof SMF.grasp.hit==='function'&&!SMF.grasp.cast&&SMA.grasp.every(x=>x===1)&&SMG.grasp.every(x=>x>=1)&&SM.free&&!!SM.free.grasp);
  /* ---- Mastery 0 ---- */
  {play();GSM.dbg=[];log=[];const d0=spotD(),T=foe(d0),A=foe(d0+.4);wrapHurt();try{cast(T,0);run(4);}finally{hurt=H0;setL(0);}
    const g=log.filter(h=>(h.e===T||h.e===A)&&!h.smx);ok('Mastery 0: the old grab (80% to each foe in the rune) and none of the masteries',g.length===2&&g.every(h=>near(h.amt,80))&&!GSM.dbg.length&&!log.some(h=>h.smx),g.map(h=>h.amt)+' '+GSM.dbg.length);}
  /* ---- M1 Shackled Souls ---- */
  {play();GSM.dbg=[];log=[];const d0=spotD(),T=foe(d0),A=foe(d0+.35),B=foe(d0-.35),F=foe(d0+3);const added=track();wrapHurt();
    try{cast(T,1);run(GSM.rel+.15);
      ok('M1: when the hands let go, chains bind the grabbed foes standing together for 2s',[T,A,B].every(e=>e.gsL&&near(e.gsL.until-time,GSM.chainT-.15,.03)&&e.gsL.mates.length===2)&&!F.gsL,[T,A,B].map(e=>e.gsL?e.gsL.mates.length:'-').join(','));
      const dA=A.dist,dT=T.dist,dF=F.dist,u=pushE(B,.4);
      ok('M1: pushing the rearmost one back tugs the chained foes ahead of it toward it by half as much; others stay',u>0&&near(dA-A.dist,u*GSM.tug,1e-6)&&near(dT-T.dist,u*GSM.tug,1e-6)&&F.dist===dF,(dA-A.dist).toFixed(3)+' '+(dT-T.dist).toFixed(3)+' of '+u.toFixed(3));
      const dB=B.dist;pushE(A,.3);ok('M1: a chained foe is never tugged forward past the one that moved',B.dist===dB);
      run(2.1);const dA2=A.dist;pushE(B,.3);ok('M1: after the 2s the chains are gone: no tug',A.dist===dA2&&!(T.gsL&&T.gsL.until>time));
      run(1);ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();const e=foe(spotD()),q=foe(spotD()+.5),d=q.dist;pushE(e,.3);ok('M1: pushE is unchanged for foes without chains',q.dist===d&&near(spotD()-e.dist,.3,1e-6));}
  /* ---- M2 Shadow Snare ---- */
  {play();GSM.dbg=[];log=[];const d0=spotD(),T=foe(d0),Ah=foe(d0+1.6),Bh=foe(d0-1.6),Far=foe(d0+3),Fl=foe(d0+1.2,0,'raven');Fl.fly=true;const added=track();wrapHurt();
    const dA=Ah.dist;try{cast(T,2);run(4);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M2: the foes nearby the hands missed take 65% once',hits(Ah,65).length===1&&hits(Bh,65).length===1,hits(Ah,65).length+' '+hits(Bh,65).length);
    ok('M2: the one past the rune is dragged back toward it (at most 0.6), the one before it is only seized',dA-Ah.dist>0&&dA-Ah.dist<=GSM.snDrag+1e-9&&Ah.dist>d0&&GSM.dbg.some(x=>x.ev==='snare'&&x.e===Bh&&!x.pulled),(dA-Ah.dist).toFixed(3));
    ok('M2: grabbed foes, flyers and foes beyond 2.4 tiles are not seized',!hits(T,65).length&&!hits(Fl,65).length&&!hits(Far,65).length);ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 The Grasping Circle ---- */
  {play();GSM.dbg=[];log=[];const d0=spotD(),T=foe(d0),F=[];for(const dd of [-1.3,-1,-.7,.7,1,1.3])F.push(foe(d0+dd,(F.length%2?.15:-.15)));const added=track();wrapHurt();const d1=F.map(e=>e.dist);
    try{cast(T,3);run(4.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    const hc=F.map(e=>hits(e,35).length),moved=F.map((e,i)=>+(d1[i]-e.dist).toFixed(3));
    ok('M3: the ring of hands touches foes round the rune for 35%, each at most once',hc.some(n=>n>0)&&hc.every(n=>n<=1)&&log.filter(h=>h.smx&&near(h.amt,35)).length===hc.reduce((a,b)=>a+b,0),hc.join(','));
    ok('M3: a touched foe past the rune is nudged back toward it (at most 0.25); none is moved forward',GSM.dbg.filter(x=>x.ev==='circle'&&x.pulled).every(x=>x.pulled<=GSM.ciNudge+1e-9)&&moved.every(m=>m>=-1e-9),moved.join(','));ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Dragged Below ---- */
  {play();GSM.dbg=[];log=[];const d0=spotD(),T=foe(d0),A=foe(d0+.4);const added=track();wrapHurt();let under=null;
    try{cast(T,4);run(GSM.rel+.7);under={b:T.burrow,v:T.g.visible,s:T.stunT>0};run(1.6);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M4: the cast\'s target is dragged under the road: hidden, held, and towers skip it',GSM.dbg.some(x=>x.ev==='below'&&x.e===T)&&under.b===1&&under.v===false&&under.s,JSON.stringify(under));
    ok('M4: thrown back after 1s for 130%, standing on the road again',hits(T,130).length===1&&GSM.dbg.some(x=>x.ev==='surface')&&!T.burrow&&T.g.visible&&T.g.position.y===0,hits(T,130).length);
    ok('M4: only one foe is dragged',!hits(A,130).length);run(1);ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();GSM.dbg=[];log=[];const d0=spotD(),Bs=foe(d0,0,'ogre',true);wrapHurt();try{cast(Bs,4);run(3);}finally{hurt=H0;setL(0);}
    ok('M4: a boss resists and takes a heavy slam for 130% instead',GSM.dbg.some(x=>x.ev==='slam'&&x.e===Bs)&&!GSM.dbg.some(x=>x.ev==='below')&&hits(Bs,130).length===1);}
  {play();GSM.dbg=[];log=[];const d0=spotD(),T=foe(d0);stunE(T,5);T.stunT=0;wrapHurt();try{cast(T,4);run(3);}finally{hurt=H0;setL(0);}
    ok('M4: a foe whose Resolve is spent is not dragged below; it is slammed',GSM.dbg.some(x=>x.ev==='slam'&&x.e===T)&&!GSM.dbg.some(x=>x.ev==='below'));}
  {play();GSM.dbg=[];log=[];const d0=spotD(),T=foe(d0),A=foe(d0+.5);wrapHurt();try{cast(T,4);run(GSM.rel+.6);T.hp=1;H0(T,10,'magic',{});run(1.5);}finally{hurt=H0;setL(0);}
    ok('M4: if it dies under the road, a dark burst hits the foes round the spot for 130% instead',T.dead&&GSM.dbg.some(x=>x.ev==='burst')&&hits(A,130).length===1);}
  /* ---- M5 Hand of the Abyss ---- */
  {play();GSM.dbg=[];log=[];const d0=spotD(),T=foe(d0),A=foe(d0+1.2),Bs=foe(d0-1.1,0,'ogre',true),Fl=foe(d0+.8,0,'raven'),O=foe(d0+2.6);Fl.fly=true;const added=track();wrapHurt();let up=null;
    try{cast(T,5);run(2.75+.2+.8+.25);up={A:A.g.position.y,B:Bs.g.position.y};run(3);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M5: the colossal hand closes on every foe within 2 tiles for 150% (flyers and bosses too), not beyond',[T,A,Bs,Fl].every(e=>hits(e,150).length===1)&&!hits(O,150).length,[T,A,Bs,Fl,O].map(e=>hits(e,150).length).join(','));
    ok('M5: it lifts the ground foes that are not bosses; a boss stays down',up.A>.2&&up.B===0&&GSM.dbg.some(x=>x.ev==='lift'&&x.e===A)&&!GSM.dbg.some(x=>x.ev==='lift'&&x.e===Bs),JSON.stringify(up));
    ok('M5: then it plunges for 100% more on everything inside',[T,A,Bs,Fl].every(e=>hits(e,100).length===1)&&!hits(O,100).length);
    ok('M5: everyone stands on the road again and nothing is left behind',[T,A,Bs].every(e=>e.g.position.y===0)&&smLeft(added)===0,smLeft(added));}
  /* ---- other casters, the real cast path ---- */
  {play();GSM.dbg=[];log=[];const T=foe(spotD());wrapHurt();try{setL(5);castGrasp(heroU,T,100,{src:heroU,el:'dark'});castGrasp(heroU,T,100,smO({src:heroU,el:'dark',smId:1}));run(4);}finally{hurt=H0;setL(0);}
    ok('casts that are not the hero\'s own mastered scroll stay the old Grasping Shadows (only the 80% grab)',!GSM.dbg.length&&log.filter(h=>h.e===T).every(h=>near(h.amt,80)),GSM.dbg.length+' '+log.filter(h=>h.e===T).map(h=>h.amt).join(','));}
  {const e0=errs;for(let L=1;L<=5;L++){play();const d0=spotD(),T=foe(d0);for(let i=0;i<7;i++)foe(d0+(i-3)*.45,(i%2?.2:-.2),i===6?'raven':i===5?'knight':'soldier');cast(T,L);run(6);}setL(0);
    ok('the real cast path at every mastery runs without errors, nobody left hidden or lifted',errs===e0&&enemies.every(e=>!e.burrow&&(!e.g||e.g.visible)),errs-e0);}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;GSM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
