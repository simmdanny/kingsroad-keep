(function(){
/* Bramble Patch's masteries as Simon designed them (v402). Run on the dev page: __kk.ev(await (await fetch('/tests/bpm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand where they are put (only the effects are stepped, updFx, with the game clock moved along; the
   foes in `walk` walk for real, moveEnemy), and hurt is wrapped to log the amount and the time of each hit, so the numbers are checked
   exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
let walk=[];
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;for(const e of enemies){if(walk.includes(e)){moveEnemy(e,.05);continue;}if(e.stunT>0)e.stunT=Math.max(0,e.stunT-.05);if(e.slowT>0)e.slowT=Math.max(0,e.slowT-.05);if(e.heldT>0)e.heldT=Math.max(0,e.heldT-.05);}}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.bramble=SM_XP[L-1];else delete meta.smast.bramble;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=3.2;d<R.len-3.2;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,type,boss)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=1;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;if(boss)e.boss=true;return e;};
/* a foe put at a spot off the patch: u along the road (up it is +), v across it */
const dir=S=>{const a=posAt(clamp(S.rd-.3,0,S.rt.len),S.rt),b=posAt(clamp(S.rd+.3,0,S.rt.len),S.rt);let ux=a[0]-b[0],uz=a[1]-b[1];const l=Math.hypot(ux,uz)||1;return[ux/l,uz/l];};
const at=(S,u,v,type,boss)=>{const[ux,uz]=dir(S),e=foe(S.rd,0,type,boss);e.x=S.x+ux*u+uz*v;e.z=S.z+uz*u-ux*v;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('bramble',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'nature',anc:false,spell:'bramble'});return time;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,t0,t1)=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,amt)&&(t0==null||(h.t>=t0&&h.t<=t1)));
const ev=(k,e)=>BPM.dbg.filter(x=>x.ev===k&&(e===undefined||x.e===e));
const Sf=()=>ev('cast')[0].S;
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.bramble.map(x=>x.n).join('|')==='Barbed Thicket|Snaring Vines|Thornheart|Wall of Thorns|Garden of Ruin',SM_D.bramble.map(x=>x.n).join('|'));
  ok('and his numbers: 35%; 1s, 0.6s and 40%; 2s and 25%; 1s, 100% and 40%; 180% and 35%',/35%/.test(smDesc('bramble',0))&&/1s/.test(smDesc('bramble',1))&&/0\.6s/.test(smDesc('bramble',1))&&/40%/.test(smDesc('bramble',1))&&/2s/.test(smDesc('bramble',2))&&/25%/.test(smDesc('bramble',2))
    &&/1s/.test(smDesc('bramble',3))&&/100%/.test(smDesc('bramble',3))&&/40%/.test(smDesc('bramble',3))&&/180%/.test(smDesc('bramble',4))&&/35%/.test(smDesc('bramble',4))
    &&BPM.snap===.35&&BPM.snareT===1&&BPM.snareHold===.6&&BPM.snareBoss===.4&&BPM.heart===.25&&BPM.wall===1&&BPM.wallHold===1&&BPM.ruin===1.8&&BPM.ruinThorn===.35);
  ok('the old masteries are gone, every factor at least 1, his numbers kept',!SMF.bramble.cast&&!SMF.bramble.hit&&SMA.bramble.every(x=>x===1)&&SMG.bramble.every(x=>x>=1)&&SM.free&&!!SM.free.bramble);
  /* ---- Mastery 0 ---- */
  {play();BPM.dbg=[];log=[];const T=foe(spotD());wrapHurt();try{cast(T,0);run(7);}finally{hurt=H0;setL(0);}
    const g=log.filter(h=>h.e===T&&!h.smx);ok('Mastery 0: the old patch (45% a second in ticks) and none of the masteries',g.length>=20&&g.every(h=>near(h.amt,11.25)&&h.dot)&&!BPM.dbg.length&&!log.some(h=>h.smx),g.length+' ticks '+BPM.dbg.length);}
  /* ---- M1 Barbed Thicket ---- */
  {play();BPM.dbg=[];log=[];const added=track(),T=foe(spotD());wrapHurt();let A,O,Fl;try{cast(T,1);const S=Sf();A=at(S,0,.5);O=at(S,2,0);Fl=at(S,.2,0,'raven');run(7.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M1: every second the brambles snap shut on the foes in the patch: 35%, six times in its 6.4s',hits(T,35).length===6&&hits(A,35).length===6&&ev('snap').length===6,[hits(T,35).length,hits(A,35).length,ev('snap').length]);
    ok('M1: nothing to a foe outside the patch or a flyer over it',!hits(O,35).length&&!hits(Fl,35).length);
    ok('M1: the canes sink back and nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Snaring Vines ---- */
  {play();BPM.dbg=[];log=[];const added=track(),T=foe(spotD());wrapHurt();let A,Bo,U,W,Fl,mid={},w1,w2;
    try{cast(T,2);const S=Sf();A=at(S,0,.4);Bo=at(S,0,-.4,'soldier',true);U=at(S,.3,0);U.unstopT=30;W=at(S,2.2,0);Fl=at(S,.1,0,'raven');run(1.1);
      mid={A:A.stunT>0&&A.heldT>0,U:!(U.stunT>0)};run(.9);const[ux,uz]=dir(S);W.x=S.x+ux*.2;W.z=S.z+uz*.2;/* it walks in at 2s */run(.8);w1=ev('snare',W).length;run(.4);w2=ev('snare',W).length;run(3.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M2: after 1s in the patch the vines bind a foe for 0.6s (it counts as Held)',ev('snare',A).length===1&&near(ev('snare',A)[0].got,.6)&&mid.A,JSON.stringify(mid));
    ok('M2: a boss is not held: the vines cut its legs for 40%',ev('snareboss',Bo).length===1&&hits(Bo,40).length===1&&!ev('snare',Bo).length);
    ok('M2: Resolve applies (an Unstoppable foe is not held), and a flyer is never snared',ev('snare',U).length===1&&!(ev('snare',U)[0].got>0)&&mid.U&&!ev('snare',Fl).length);
    ok('M2: a foe that walks in later is snared 1s after it entered, and each foe only once a cast',w1===0&&w2===1&&ev('snare',A).length===1,w1+' '+w2);
    ok('M2: the vines snap into leaves and nothing is left behind',smLeft(added)===0&&!Bo.g.rotation.z,smLeft(added));}
  /* ---- M3 Thornheart ---- */
  {play();BPM.dbg=[];log=[];const added=track(),T=foe(spotD());wrapHurt();let A,O,Fl;try{cast(T,3);const S=Sf();A=at(S,.3,.3);O=at(S,1.8,0);Fl=at(S,-.2,0,'raven');run(7.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M3: the Thornheart blooms at 2, 4 and 6s and its needles hit each foe in the patch for 25% a volley',ev('heart').length===1&&ev('volley').length===3&&hits(A,25).length===3&&hits(T,25).length===3,[ev('volley').length,hits(A,25).length,hits(T,25).length]);
    ok('M3: no needle for a foe outside the brambles or a flyer',!hits(O,25).length&&!hits(Fl,25).length);
    ok('M3: the flower sinks back and nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Wall of Thorns ---- */
  {play();BPM.dbg=[];log=[];walk=[];const added=track(),T=foe(spotD());wrapHurt();let W,Bo,U,Pa,Fl,O,S,t0,wD,pos={};
    try{t0=cast(T,4);S=Sf();wD=S.rd+BPM.R*.85;W=foe(S.rd+.6);Bo=foe(S.rd+.6,.2,'soldier',true);U=foe(S.rd+.6,-.2);U.unstopT=30;Pa=foe(S.rd+1.3);Fl=foe(S.rd,0,'raven');O=foe(S.rd-2.2);for(const e of [W,Bo,U,Pa])e.spd=1;
      run(3.25);walk=[W,Bo,U,Pa];run(.9);pos={W:W.dist,Bo:Bo.dist,U:U.dist,Pa:Pa.dist};walk=[];run(3.5);/* the Thornheart (Mastery 3) stands until 6.75s and its last stray needles fall until 7.2s */}finally{hurt=H0;scene.add=S0;setL(0);walk=[];}
    const tc=t0+BPM.wallT+BPM.wallHold;
    ok('M4: halfway the wall rises across the road at the patch\'s keep-side edge, and a foe walking on is stopped at it',ev('wall').length===1&&ev('wallheld',W).length===1&&pos.W<=wD,pos.W&&(pos.W-wD).toFixed(2));
    ok('M4: a boss pushes through and is cut for 40%; a foe Resolve frees walks through; one already past it walks on',pos.Bo>wD&&ev('wallboss',Bo).length===1&&hits(Bo,40,t0+3.2,tc).length===1&&pos.U>wD&&ev('wallfree',U).length===1&&!ev('wallheld',Pa).length&&pos.Pa>S.rd+1.3+.5,
      [pos.Bo-wD,pos.U-wD].map(v=>v.toFixed(2)).join(' '));
    ok('M4: after 1s it collapses into the patch: 100% to the ground foes in it, nothing to a flyer or a foe outside',[W,T].every(e=>hits(e,100,tc-.1,tc+.2).length===1)&&!hits(Fl,100).length&&!hits(O,100).length,[W,T].map(e=>hits(e,100,tc-.1,tc+.2).length));
    ok('M4: the wall bursts apart and nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Garden of Ruin ---- */
  {play();BPM.dbg=[];log=[];const added=track(),T=foe(spotD());wrapHurt();let A,Bo,Fl,N,Far,t0,mid={};
    try{t0=cast(T,5);const S=Sf();A=at(S,0,.5);Bo=at(S,0,-.5,'soldier',true);Fl=at(S,.3,0,'raven');N=at(S,2.2,0);Far=at(S,3.6,0);run(BPM.ruinT+.95);/* it shuts at 6.3s on the effect's clock, a frame or two later on the game's */mid={A:A.stunT>0,Bo:!(Bo.stunT>0)};run(2.7);}finally{hurt=H0;scene.add=S0;setL(0);}
    const ts=t0+BPM.ruinT+.8,tb=ts+.6+.05;
    ok('M5: the colossal flower snaps shut on every foe in the patch for 180%, a boss and a flyer too',[T,A,Bo,Fl].every(e=>hits(e,180).length===1&&ev('chomp',e).length===1)&&!hits(N,180).length&&!hits(Far,180).length,[T,A,Bo,Fl].map(e=>hits(e,180).length));
    ok('M5: it holds the ground foes inside until it bursts (Resolve), not a boss',mid.A&&mid.Bo,JSON.stringify(mid));
    ok('M5: then it bursts and a thorn flies at each foe within 3 tiles for 35%, flyers too, none farther',[T,A,Bo,Fl,N].every(e=>hits(e,35,tb-.05,tb+.8).length===1&&ev('thorn',e).length===1)&&!hits(Far,35,tb-.05,tb+.8).length,[T,A,Bo,Fl,N].map(e=>hits(e,35,tb-.05,tb+.8).length));
    ok('M5: the roots sink and nothing is left behind',smLeft(added)===0,smLeft(added));
    const order=['snap','volley','wall','collapse','shut','burst'].map(k=>BPM.dbg.findIndex(x=>x.ev===k));
    ok('M5: in order: the snaps, the Thornheart, the wall, its collapse, the flower shutting and bursting',order.every((v,i)=>v>=0&&(!i||v>order[i-1])),order.join(','));}
  /* ---- other casters, the real cast path ---- */
  {play();BPM.dbg=[];log=[];const T=foe(spotD());wrapHurt();try{setL(5);castBramble(heroU,T,100,{src:heroU,el:'nature'});castBramble(heroU,T,100,smO({src:heroU,el:'nature',smId:1}));run(4);}finally{hurt=H0;setL(0);}
    ok('casts that are not the hero\'s own mastered scroll stay the old Bramble Patch (only its 11.25% ticks)',!BPM.dbg.length&&log.filter(h=>h.e===T).every(h=>near(h.amt,11.25)),BPM.dbg.length+' '+[...new Set(log.filter(h=>h.e===T).map(h=>h.amt))]);}
  {const e0=errs,added=track();try{for(let L=1;L<=5;L++){play();const d0=spotD(),T=foe(d0);for(let i=0;i<7;i++)foe(d0+(i-3)*.4,(i%2?.2:-.2),i===6?'raven':i===5?'knight':'soldier');cast(T,L);run(9.5);}}finally{scene.add=S0;setL(0);}
    ok('the real cast path at every mastery runs without errors and leaves nothing behind',errs===e0&&smLeft(added)===0&&enemies.every(e=>!e.g||!e.g.rotation.z),(errs-e0)+' '+smLeft(added));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;BPM.dbg=null;walk=[];try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
