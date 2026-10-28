(function(){
/* Frostfall Comet's masteries (v419, designed with Simon's framework, MASTERY_DESIGN.md). Run on the dev page:
   __kk.ev(await (await fetch('/tests/fcm-test.js')).text()) returns [name, ok, detail] rows. Foes stand where they are put (only the
   effects are stepped, updFx, with the game clock moved along), and hurt is wrapped to log each hit (power 100: the impact is 600).
   The comet aims at the first foe of the list (its densest) as it will stand 1.45s later; FCM.dbg logs the masteries' events. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.comet=SM_XP[L-1];else delete meta.smast.comet;};
const RT=()=>ROUTES[0];let D=0,T0=0;
const pt=(d,off)=>{const p=posAt(d,RT());return{x:p[0]+Math.cos(p[2])*(off||0),z:p[1]-Math.sin(p[2])*(off||0)};};
const foe=(d,off,type,hp)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT();e.dist=d;e.off=0;moveEnemy(e,0);e.spd=0;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;
  const p=pt(d,off);e.x=p.x;e.z=p.z;if(e.g){e.g.position.x=p.x;e.g.position.z=p.z;}return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time-T0});return H0.apply(this,arguments);};};
const near=(a,b)=>Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b));
/* on the longest straight stretch of the road, well inside it */
const setup=()=>{play();const sg=RT().segs.reduce((a,b)=>b.len>a.len?b:a);D=sg.start+sg.len*.6;};
const cast=(L,list)=>{setL(L);T0=time;castScrollNow('comet',heroU,tStats(heroU),list,100,{src:heroU,bane:0,el:'ice',anc:false,spell:'comet'});return FCM.last;};
const ev=(k,f)=>FCM.dbg.filter(x=>x.ev===k&&(!f||f(x)));
const mine=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card ---- */
  ok('the five masteries and their names',SM_D.comet.map(x=>x.n).join('|')==='Comet’s Eye|Frostfall Tail|Crown of Spikes|Faultlines|Rebound',SM_D.comet.map(x=>x.n).join('|'));
  const T=i=>smDesc('comet',i);
  ok('and their numbers: 1.4 tiles; 50%; 80%, 0.5s; 4s, 100%, 0.4s, 50%; 4 tiles, 250%, 150%',/1\.4 tiles/.test(T(0))&&/50%/.test(T(1))&&/80%/.test(T(2))&&/0\.5s/.test(T(2))&&/4s/.test(T(3))&&/100%/.test(T(3))&&/0\.4s/.test(T(3))&&/50%/.test(T(3))
    &&/4 tiles/.test(T(4))&&/250%/.test(T(4))&&/150%/.test(T(4))&&FCM.eyeMax===1.4&&FCM.tail===.5&&FCM.spike===.8&&FCM.pin===.5&&FCM.faultT===4&&FCM.fault===1&&FCM.freeze===.4&&FCM.faultEnd===.5&&FCM.rebR===4&&FCM.reb===2.5&&FCM.reb2===1.5);
  ok('the old masteries are gone; the hidden factor brings it to the Epic ladder (every one at least 1)',!SMF.comet.cast&&!SMF.comet.hit&&SMA.comet.every(x=>x===1)&&SMG.comet.every(x=>x>=1)&&SMG.comet[4]>1);
  /* ---- Mastery 0 ---- */
  {setup();const a=foe(D,0),b=foe(D-.5,.2);FCM.dbg=[];FCM.last=null;log=[];const added=track();wrapHurt();
    try{cast(0,[a,b]);run(6);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('Mastery 0: the old comet (600 to each foe in the blast) and none of the masteries',!FCM.last&&!FCM.dbg.length&&log.length===2&&log.every(h=>near(h.amt,600)&&!h.smx),log.length);
    ok('and it leaves nothing behind',smLeft(added)===0);}
  /* ---- M1 Comet's Eye: a lone foe is aimed at, a knot of five waits 1.9 to 2.9 tiles back up the road ---- */
  const eyeRun=L=>{setup();const lone=foe(D,0),knot=[0,1,2,3,4].map(i=>foe(D-2.4+(i-2)*.25,(i%3-1)*.2));FCM.dbg=[];FCM.last=null;log=[];wrapHurt();
    try{cast(L,[lone]);run(2);}finally{hurt=H0;setL(0);}const hit=new Set(log.filter(h=>near(h.amt,600)).map(h=>h.e));return{hit:hit.size,knot:knot.filter(e=>hit.has(e)).length,im:ev('impact')[0]};};
  {const a=eyeRun(0),b=eyeRun(1);
    ok('M1: without the Eye the comet lands on its first aim (only the lone foe)',a.hit===1&&a.knot===0,a.hit);
    ok('M1: with it, it steers onto the knot as it falls (at most 1.4 tiles) and takes it in',b.hit>a.hit&&b.knot>=4&&b.im&&Math.hypot(b.im.dx,b.im.dz)<=1.4+1e-6&&Math.hypot(b.im.dx,b.im.dz)>.5,b.hit+' hit, moved '+(b.im?Math.hypot(b.im.dx,b.im.dz).toFixed(2):'-'));}
  {setup();const a=foe(D,0),b=foe(D+.3,.2);FCM.dbg=[];log=[];wrapHurt();try{cast(1,[a,b]);run(2);}finally{hurt=H0;setL(0);}const im=ev('impact')[0];
    ok('M1: and it does not wander off a target it already has right',im&&Math.hypot(im.dx,im.dz)<.4&&log.filter(h=>near(h.amt,600)).length===2,im&&Math.hypot(im.dx,im.dz).toFixed(2));}
  /* ---- M2 Frostfall Tail: it comes in low along the road and its tail falls on the foes marching in ---- */
  {setup();const tgt=foe(D,0),up=[1,1.8,2.6].map(k=>foe(D-k,0)),bird=foe(D-1.8,0,'raven'),off=foe(D-1.8,1.4);FCM.dbg=[];log=[];const added=track();wrapHurt();let S;
    try{S=cast(2,[tgt]);run(5);}finally{hurt=H0;scene.add=S0;setL(0);}
    const q=nsRouteNear(tgt.x,tgt.z),p=posAt(Math.max(0,q.d-FCM.tailLen),q.rt),sp=S.K.S;
    ok('M2: it comes in from up the road, low',Math.hypot(sp.x-p[0],sp.z-p[1])<.05&&Math.abs(sp.y-gy(p[0],p[1])-FCM.tailH)<.05);
    const tl=ev('tail');
    ok('M2: its tail falls on the foes marching in under its path: 50% each, once, and a chill',tl.length>=2&&tl.every(x=>near(x.amt,50))&&new Set(tl.map(x=>x.e)).size===tl.length&&up.filter(e=>tl.some(x=>x.e===e)).length>=2&&up.some(e=>e.slowT>0),tl.length+' foes');
    ok('M2: not on a flyer, nor on a foe well off the road',!tl.some(x=>x.e===bird||x.e===off));
    ok('M2: and it leaves nothing behind',smLeft(added)===0);}
  /* ---- M3 Crown of Spikes ---- */
  {setup();const F=[0,1,2,3].map(i=>foe(D+(i-1.5)*.4,(i%2?.2:-.2))),bird=foe(D,.3,'raven');FCM.dbg=[];log=[];const added=track();wrapHurt();let st=[];
    try{cast(3,[F[1]]);run(1.75);st=F.map(e=>e.stunT||0);run(4);}finally{hurt=H0;scene.add=S0;setL(0);}
    const im=ev('impale');
    ok('M3: a spike impales every ground foe in the blast: 80% each and pinned (Resolve applies)',im.length===4&&im.every(x=>near(x.amt,80))&&F.every(e=>im.some(x=>x.e===e))&&st.every(v=>v>0),im.length+' impaled');
    ok('M3: a flyer is above the spikes',!im.some(x=>x.e===bird)&&log.some(h=>h.e===bird&&near(h.amt,600)));
    ok('M3: and the spikes crumble away with the crown',smLeft(added)===0);}
  /* ---- M4 Faultlines ---- */
  {setup();const F=[0,1,2,3].map(i=>foe(D+(i-1.5)*.4,0));FCM.dbg=[];log=[];const added=track();wrapHurt();let flt=0,sh=[];
    try{cast(4,[F[1]]);run(1.8);flt=F.filter(e=>e.fcmF&&!e.fcmF.done).length;
      hurt(F[0],5,'magic',{src:heroU,el:'fire'});           /* not ice: nothing */
      hurt(F[1],5,'magic',{src:heroU,el:'ice'});            /* a Frost Spire's bolt (el ice): shatters */
      sh=ev('faultShatter').map(x=>x.e);run(5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M4: every foe the impact hits glows with fractures (the comet’s own spikes do not break them)',flt===4&&ev('fault').length===4,flt);
    ok('M4: the next ice hit from anything else shatters them: 100% and frozen; a fire hit does not',sh.length===1&&sh[0]===F[1]&&mine(F[1],100).length===1&&!ev('faultShatter').some(x=>x.e===F[0]),sh.length);
    const ge=ev('faultEnd');
    ok('M4: the others give way after 4s for 50%',ge.length===3&&ge.every(x=>near(x.amt,50)&&x.e!==F[1])&&ge.every(x=>Math.abs(x.t-ev('fault')[0].t-FCM.faultT)<.08),ge.length);
    ok('M4: and they leave nothing behind',smLeft(added)===0&&F.every(e=>!e.fcmF));}
  /* ---- M5 Rebound ---- */
  {setup();const F=[0,1,2].map(i=>foe(D+(i-1)*.45,0)),tough=foe(D+2.4,0,'knight',5e9),far=foe(D,4.6,'knight',9e9);FCM.dbg=[];log=[];const added=track();wrapHurt();
    try{cast(5,[F[1]]);run(8.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    const imp=ev('impact')[0],wk=ev('heartWakes')[0],rb=ev('rebound'),rh=ev('reboundHit');
    ok('M5: the heart wakes in the crater, then bursts out as the crown gives way',!!wk&&rb.length>=1&&Math.abs(wk.t-imp.t-FCM.rebGlow)<.08&&Math.abs(rb[0].t-imp.t-FCM.rebAt)<.08);
    ok('M5: it smashes into the toughest foe within 4 tiles for 250%, never one further off',rh.length===2&&rh[0].e===tough&&near(rh[0].amt,250)&&!rh.some(x=>x.e===far),rh.map(x=>x.amt).join(','));
    ok('M5: then bounces once more onto another for 150%, and is gone',rh[1]&&rh[1].e!==tough&&near(rh[1].amt,150)&&ev('heartGone').length===1);
    ok('M5: and it leaves nothing behind',smLeft(added)===0);}
  {setup();const a=foe(D,0);FCM.dbg=[];log=[];wrapHurt();try{cast(5,[a]);run(1.6);a.hp=0;a.dead=true;removeEnemy(a);run(4);}finally{hurt=H0;setL(0);}
    ok('M5: with nobody left to hit, the heart shatters in the crater',ev('heartGone').length===1&&!ev('reboundHit').length);}
  ok('no errors',errs===0,errs);
}catch(err){ok('threw',false,err&&err.stack);}
finally{console.error=ce;hurt=H0;scene.add=S0;FCM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
