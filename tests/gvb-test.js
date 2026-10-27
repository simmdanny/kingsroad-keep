(function(){
/* Graveburst's masteries as Simon designed them (v399). Run on the dev page: __kk.ev(await (await fetch('/tests/gvb-test.js')).text())
   returns [name, ok, detail] rows. Foes stand where they are put (only the effects are stepped, updFx, with the game clock moved along; the
   foes in `walk` walk for real, moveEnemy), and hurt is wrapped to log the amount and the time of each hit, so the numbers are checked
   exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
let walk=[];
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;for(const e of enemies){if(walk.includes(e)){moveEnemy(e,.05);continue;}if(e.stunT>0)e.stunT=Math.max(0,e.stunT-.05);if(e.slowT>0)e.slowT=Math.max(0,e.slowT-.05);}}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.graveburst=SM_XP[L-1];else delete meta.smast.graveburst;};
/* the road spot nearest the hero (more than 1.2 away) with at least 3.2 of road both ways, as a road distance */
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=3.2;d<R.len-3.2;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
/* a foe on the road at distance d (sideways off), standing still */
const foe=(d,off,type,boss)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=1;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;if(boss)e.boss=true;return e;};
/* a foe put at a spot off the crater: u along the road (up it is +), v across it */
const at=(S,u,v,type,boss)=>{const e=foe(S.rd,0,type,boss);e.x=S.cx+S.ux*u+S.uz*v;e.z=S.cz+S.uz*u-S.ux*v;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time});return H0.apply(this,arguments);};};
const cast=(T,L)=>{setL(L);castScrollNow('graveburst',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'dark',anc:false,spell:'graveburst'});return time;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,t0,t1)=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,amt)&&(t0==null||(h.t>=t0&&h.t<=t1)));
const ev=(k,e)=>GVB.dbg.filter(x=>x.ev===k&&(e===undefined||x.e===e));
const S0f=()=>ev('cast')[0].S,dC=(e,S)=>Math.hypot(e.x-S.cx,e.z-S.cz);
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.graveburst.map(x=>x.n).join('|')==='Gravequake|The Unburied|The Open Pit|Ribcage Prison|Hand of the Underworld',SM_D.graveburst.map(x=>x.n).join('|'));
  ok('and his numbers: 45%, 100%, 4s and 35%, 1.5s and 70%, 100% and 100%',/45%/.test(smDesc('graveburst',0))&&/100%/.test(smDesc('graveburst',1))&&/4s/.test(smDesc('graveburst',2))&&/35%/.test(smDesc('graveburst',2))&&/1\.5s/.test(smDesc('graveburst',3))&&/70%/.test(smDesc('graveburst',3))&&(smDesc('graveburst',4).match(/100%/g)||[]).length===2
    &&GVB.fq===.45&&GVB.ub===1&&GVB.pit===.35&&GVB.pitT===4&&GVB.cg===.7&&GVB.cgT===1.5&&GVB.cgBoss===.5&&GVB.hd===1&&GVB.seal===1);
  ok('the old masteries are gone, every factor at least 1, his numbers kept',!SMF.graveburst.hit&&!SMF.graveburst.cast&&SMA.graveburst.every(x=>x===1)&&SMG.graveburst.every(x=>x>=1)&&SM.free&&!!SM.free.graveburst);
  /* ---- Mastery 0 ---- */
  {play();GVB.dbg=[];log=[];const d0=spotD(),T=foe(d0),A=foe(d0+.4);wrapHurt();try{cast(T,0);run(4);}finally{hurt=H0;setL(0);}
    const g=log.filter(h=>(h.e===T||h.e===A)&&!h.smx);ok('Mastery 0: the old burst (260% to each foe in it) and none of the masteries',g.length===2&&g.every(h=>near(h.amt,260))&&!GVB.dbg.length&&!log.some(h=>h.smx),g.map(h=>h.amt)+' '+GVB.dbg.length);}
  /* ---- M1 Gravequake ---- */
  {play();GVB.dbg=[];log=[];const added=track(),d0=spotD(),T=foe(d0),U=foe(d0-2),D=foe(d0+2),F=foe(d0+4.6),Fl=foe(d0-2,0,'raven');wrapHurt();try{cast(T,1);run(3.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M1: the fissures reach a foe up the road and one down it, beyond the burst: 45% once each',hits(U,45).length===1&&hits(D,45).length===1,[hits(U,45).length,hits(D,45).length]);
    ok('M1: none beyond the fissures (4.6 tiles away), none to a flyer',!hits(F,45).length&&!hits(Fl,45).length);
    ok('M1: the cracks crumble and leave nothing behind',ev('quake').length===1&&ev('quake')[0].n>20&&smLeft(added)===0,ev('quake').map(x=>x.n)+' '+smLeft(added));}
  /* ---- M2 The Unburied ---- */
  {play();GVB.dbg=[];log=[];const added=track(),T=foe(spotD());wrapHurt();let A,B,C,Fl,Far;
    try{cast(T,2);const S=S0f();A=at(S,1.4,0);B=at(S,-1.4,0);C=at(S,0,1.6);Fl=at(S,.9,0,'raven');Far=at(S,2.3,0);run(4);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M2: the warrior faces up the road and its blade passes over the foes round it: 100% once each, a flyer too',[A,C,Fl].every(e=>hits(e,100).length===1),[A,C,Fl].map(e=>hits(e,100).length));
    ok('M2: a wide arc, not a full circle: the foe right behind it is spared, and one out of reach',!hits(B,100).length&&!hits(Far,100).length);
    ok('M2: it rises, swings, breaks apart and leaves nothing behind',ev('unburied').length===1&&ev('sweep').length>=3&&smLeft(added)===0,smLeft(added));}
  /* ---- M3 The Open Pit ---- */
  {play();GVB.dbg=[];log=[];const added=track(),T=foe(spotD());wrapHurt();let In,M,Far,Fl,S;
    try{const t0=cast(T,3);S=S0f();In=at(S,0,.3);M=at(S,0,-.3);Far=at(S,1.6,0);Fl=at(S,.2,0,'raven');run(1.55);
      ok('M3: the first warning flashes under the foes standing in the pit',ev('warn').length===1&&ev('warn')[0].n>=3,ev('warn').map(x=>x.n));
      M.x=S.cx+S.ux*2.6;M.z=S.cz+S.uz*2.6;/* it walks out in time */run(4.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M3: four times in the pit\'s 4s, spikes: 35% each time to a foe that stays in it',ev('warn').length===4&&hits(In,35).length===4,ev('warn').length+' '+hits(In,35).length);
    ok('M3: a foe that walks out after the warning is spared, and one outside the crater and a flyer are never hit',!hits(M,35).length&&!hits(Far,35).length&&!hits(Fl,35).length,[hits(M,35).length,hits(Far,35).length,hits(Fl,35).length]);
    ok('M3: the pit closes and leaves nothing behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Ribcage Prison ---- */
  {play();GVB.dbg=[];log=[];walk=[];const added=track(),T=foe(spotD());wrapHurt();let W,Bo,U,Fl,O,S,t0,pos={};
    try{t0=cast(T,4);S=S0f();W=foe(T.dist+.5);Bo=foe(T.dist+.5,.2,'soldier',true);U=foe(T.dist+.5,-.2);U.unstopT=30;Fl=foe(T.dist,0,'raven');O=foe(T.dist+2.2);for(const e of [W,Bo,U])e.spd=.5;
      run(2.95);walk=[W,Bo,U];run(1.4);pos={W:dC(W,S),Bo:dC(Bo,S),U:dC(U,S)};walk=[];run(1.7);/* the pit (Mastery 3) is open until 5.65s */}finally{hurt=H0;scene.add=S0;setL(0);walk=[];}
    const cg=ev('cage')[0]||{caged:[]},R=GVB.cgR,tc=t0+GVB.del+GVB.cgT0+.3+GVB.cgT;
    ok('M4: the ribs close round the ground foes inside (not a boss, not a flyer)',cg.caged.includes(W)&&cg.caged.includes(T)&&cg.caged.includes(U)&&!cg.caged.includes(Bo)&&!cg.caged.includes(Fl),cg.caged.length);
    ok('M4: a foe walking out is stopped at the ribs (stunE, so Resolve applies) and stays inside',ev('bars',W).length>=1&&pos.W<=R*.95,pos.W&&pos.W.toFixed(2));
    ok('M4: a boss walks on through the ribs, and so does a foe Resolve has made Unstoppable',pos.Bo>R*.92&&pos.U>R*.92&&ev('escape',U).length===1,[pos.Bo,pos.U].map(v=>v&&v.toFixed(2)).join(' '));
    ok('M4: after 1.5s the cage splinters: 70% to everyone in it, the flyer too, half (35%) to the boss, nothing outside',[W,T,U,Fl].every(e=>hits(e,70,tc-.1,tc+.2).length===1)&&hits(Bo,35,tc-.1,tc+.2).length===1&&ev('collapse',Bo)[0].boss&&!hits(O,70).length,
      [W,T,U,Fl].map(e=>hits(e,70,tc-.1,tc+.2).length)+' boss '+hits(Bo,35,tc-.1,tc+.2).length);
    ok('M4: the bone falls and nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Hand of the Underworld ---- */
  {play();GVB.dbg=[];log=[];const added=track(),T=foe(spotD());wrapHurt();let G1,G2,Bo,Fl,O,t0,mid={};
    try{t0=cast(T,5);const S=S0f();G1=at(S,1,0);G2=at(S,-1.5,0);Bo=at(S,0,1.2,'soldier',true);Fl=at(S,.5,0,'raven');O=at(S,2.6,0);run(5.75);/* under the road between the plunge (5.6s) and the seal (5.9s) */
      mid={g1:G1.burrow===1&&G1.g.visible===false,g2:G2.burrow===1,bo:!Bo.burrow&&Bo.g.visible};run(1.05);}finally{hurt=H0;scene.add=S0;setL(0);}
    const ts=t0+GVB.del+GVB.uwT+GVB.uwHands+.8,tl=ts+.8;
    ok('M5: the hands seize every foe in the abyss for 100%, a boss and a flyer too, nothing outside',[T,G1,G2,Bo,Fl].every(e=>hits(e,100,ts-.1,ts+.1).length===1&&ev('grip',e).length===1)&&!hits(O,100).length,[T,G1,G2,Bo,Fl].map(e=>hits(e,100,ts-.1,ts+.1).length));
    ok('M5: the ground foes that are not bosses are dragged under on chains (hidden, towers skip them); a boss and a flyer are not',mid.g1&&mid.g2&&mid.bo&&ev('drag',G1).length===1&&!ev('drag',Bo).length&&!ev('drag',Fl).length,JSON.stringify(mid));
    ok('M5: then the grave slams shut for 100% more on everything in it',[T,G1,G2,Bo,Fl].every(e=>hits(e,100,tl-.1,tl+.1).length===1&&ev('sealhit',e).length===1)&&!hits(O,100).length,[T,G1,G2,Bo,Fl].map(e=>hits(e,100,tl-.1,tl+.1).length));
    ok('M5: everyone is back on the road and nothing is left behind',[T,G1,G2,Bo].every(e=>!e.burrow&&e.g.visible&&e.g.position.y===0)&&smLeft(added)===0,smLeft(added));
    const order=['quake','unburied','ribs','collapse0','seize','seal'].map(k=>GVB.dbg.findIndex(x=>x.ev===k));
    ok('M5: one after another: fissures, the warrior, the cage, its collapse, the hands, the seal',order.every((v,i)=>v>=0&&(!i||v>order[i-1])),order.join(','));}
  /* ---- other casters, the real cast path ---- */
  {play();GVB.dbg=[];log=[];const T=foe(spotD());wrapHurt();try{setL(5);castGraveburst(heroU,T,100,{src:heroU,el:'dark'});castGraveburst(heroU,T,100,smO({src:heroU,el:'dark',smId:1}));run(4);}finally{hurt=H0;setL(0);}
    ok('casts that are not the hero\'s own mastered scroll stay the old Graveburst (only the 260% burst)',!GVB.dbg.length&&log.filter(h=>h.e===T).every(h=>near(h.amt,260)),GVB.dbg.length+' '+log.filter(h=>h.e===T).map(h=>h.amt).join(','));}
  {const e0=errs,added=track();try{for(let L=1;L<=5;L++){play();const d0=spotD(),T=foe(d0);for(let i=0;i<7;i++)foe(d0+(i-3)*.45,(i%2?.2:-.2),i===6?'raven':i===5?'knight':'soldier');cast(T,L);run(7.5);}}finally{scene.add=S0;setL(0);}
    ok('the real cast path at every mastery runs without errors, nobody left hidden or sunk, nothing left behind',errs===e0&&enemies.every(e=>!e.burrow&&(!e.g||(e.g.visible&&e.g.position.y===0)))&&smLeft(added)===0,(errs-e0)+' '+smLeft(added));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;GVB.dbg=null;walk=[];try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
