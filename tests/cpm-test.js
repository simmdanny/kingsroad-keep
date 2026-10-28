(function(){
/* Spatial Compression's masteries (v432). Run on the dev page: __kk.ev(await (await fetch('/tests/cpm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add,B0=cfmBoom;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{if(SDP.cmp&&SDP.cmp.end)SDP.cmp.end(true);meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.compress=SM_XP[L-1];else delete meta.smast.compress;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=4;d<R.len-4;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>CPM.dbg.filter(d=>d.ev===n);
const MEV=['band','sat','implode','star'];
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const knot=(n,gap)=>{const d0=spotD(),F=[];for(let i=0;i<n;i++)F.push(foe(d0+(i-(n>>1))*(gap||.3),(i%3-1)*.15));return F;};
const cast=(L,c)=>{setL(L);castScrollNow('compress',heroU,tStats(heroU),[c],100,{src:heroU,bane:0,el:'light',anc:false,spell:'compress'});return SDP.cmp;};
const REL=CPM.DUR+CPM.HOLD+.08,END=REL+1.6;
try{
  ok('the five masteries: Gathering Pull, Contraction Bands, Satellite Snaps, Implosion, Pressed Star',SM_D.compress.map(x=>x.n).join('|')==='Gathering Pull|Contraction Bands|Satellite Snaps|Implosion|Pressed Star',SM_D.compress.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (100%, 200%, 50%, 200%)',/100%/.test(smDesc('compress',1))&&/200%/.test(smDesc('compress',2))&&/50%/.test(smDesc('compress',3))&&/200%/.test(smDesc('compress',4))
    &&CPM.pull===.3&&CPM.bd===1&&CPM.bdCd===1&&CPM.sat===2&&CPM.im===.5&&CPM.imR===.5&&CPM.imN===3&&CPM.st===2&&CPM.stR===1.6);
  ok('the old masteries are gone (no hooks), calibrated on the Legendary ladder with hidden factors (not SM.free)',!SMF.compress.hit&&!SMF.compress.cast&&SMA.compress.every(x=>x===1)&&SMG.compress.length===5&&SMG.compress.every(x=>x>=1&&x<1.3)&&!(SM.free&&SM.free.compress),SMG.compress.join());
  ok('it stays a developer-mode scroll (Legendary is not opened)',!SM_OPEN.includes('legendary'));
  /* ---- Mastery 0 ---- */
  {play();CPM.dbg=[];log=[];const F=knot(7);let nb=0;cfmBoom=function(){nb++;return B0.apply(this,arguments);};wrapHurt();let C;try{C=cast(0,F[3]);run(END);}finally{hurt=H0;cfmBoom=B0;setL(0);}
    const sn=ev('snap')[0],In=F.filter(e=>cpmLoc(C,e.x,e.z)<=1.08);
    ok('Mastery 0: the squeeze snaps back with 500% to every foe inside',sn&&In.length>=5&&In.every(e=>log.some(h=>h.e===e&&!h.smx&&near(h.amt,500))),In.length);
    ok('Mastery 0: the release now bursts in 3D on top of the warp',nb>=1&&near(sn.t-ev('snap')[0].t,0),nb);
    ok('Mastery 0: no masteries',!log.some(h=>h.smx)&&!CPM.dbg.some(d=>MEV.includes(d.ev)));}
  /* ---- M1 Gathering Pull ---- */
  {play();CPM.dbg=[];const F=knot(9,.35);let C;C=cast(1,F[4]);const q=nsRouteNear(C.x,C.z),d0=F.map(e=>e.dist);run(5);setL(0);
    const moved=F.map((e,i)=>e.dist-d0[i]),inside=F.map(e=>cpmLoc(C,e.x,e.z)<1);
    ok('M1: foes inside drift toward the middle of the squeeze',F.every((e,i)=>!inside[i]||Math.abs(d0[i]-q.d)<.1||(d0[i]<q.d?moved[i]>.05:moved[i]<-.05)),moved.map(x=>x.toFixed(2)).join(' '));
    ok('M1: never past the middle, and at most 0.3 tiles a second',F.every((e,i)=>Math.abs(moved[i])<=CPM.pull*5+.01&&(d0[i]<q.d?e.dist<=q.d+.06:e.dist>=q.d-.06)));
    ok('M1: no damage of its own',!CPM.dbg.some(d=>MEV.includes(d.ev)));}
  /* ---- M2 Contraction Bands ---- */
  {let tries=0;for(;tries<4;tries++){play();CPM.dbg=[];log=[];const F=knot(9,.35);wrapHurt();try{cast(2,F[4]);run(END);}finally{hurt=H0;setL(0);}if(ev('band').length)break;}const bd=ev('band');   /* the bands run in random directions: a cast may miss the knot */
    ok('M2: the bands crush the foes they roll over for 100%',bd.length>0&&bd.every(d=>log.some(h=>h.e===d.e&&h.smx&&near(h.amt,100)&&near(h.t,d.t,.01))),bd.length);
    const byE=new Map();bd.forEach(d=>{const a=byE.get(d.e)||[];a.push(d.t);byE.set(d.e,a);});
    ok('M2: at most once a second for each foe',[...byE.values()].every(a=>a.every((t,i)=>!i||t-a[i-1]>=CPM.bdCd-1e-6)));}
  /* ---- M3 Satellite Snaps ---- */
  {play();CPM.dbg=[];log=[];const F=knot(15,.4);wrapHurt();let C;try{C=cast(3,F[7]);run(END);}finally{hurt=H0;setL(0);}const st=ev('sat'),sn=ev('snap')[0];
    ok('M3: both satellites snap 0.6s before the main release',st.length===2&&st.every(d=>near(sn.t-d.t,.6,.15)),st.map(d=>(sn.t-d.t).toFixed(2)).join());
    ok('M3: each at its own centre, 200% to the foes within its reach',st.every((d,i)=>near(d.x,C.sat[i].x)&&d.L.every(e=>Math.hypot(e.x-d.x,e.z-d.z)<d.R&&log.some(h=>h.e===e&&h.smx&&near(h.amt,200)&&near(h.t,d.t,.01)))),st.map(d=>d.L.length).join());}
  /* ---- M4 Implosion ---- */
  {play();CPM.dbg=[];log=[];const F=knot(7,.25);wrapHurt();let C;try{C=cast(4,F[3]);run(END);}finally{hurt=H0;setL(0);}const im=ev('implode')[0];
    ok('M4: at the snap each packed foe takes 50% for every other foe within 0.5 (up to 3)',im&&im.L.length>0&&im.L.every(q=>{const n=Math.min(3,F.filter(o=>o!==q.e&&cpmLoc(C,o.x,o.z)<=1.08&&(o.x-q.e.x)**2+(o.z-q.e.z)**2<CPM.imR*CPM.imR).length);return q.n===n&&log.some(h=>h.e===q.e&&h.smx&&near(h.amt,50*n));}),im&&im.L.map(q=>q.n).join(''));
    ok('M4: at the moment of the snap',near(im.t,ev('snap')[0].t,.01));}
  /* ---- M5 Pressed Star ---- */
  {play();CPM.dbg=[];log=[];const F=knot(9,.3);const added=track();wrapHurt();let C;try{C=cast(5,F[4]);run(END);const st=ev('star')[0],sn=ev('snap')[0];
      ok('M5: the star bursts 0.45s after the snap',st&&near(st.t-sn.t,.45,.15),st&&(st.t-sn.t).toFixed(2));
      ok('M5: 200% to every foe within 1.6 of the centre',st&&st.L.length>0&&st.L.every(e=>Math.hypot(e.x-st.x,e.z-st.z)<CPM.stR&&log.some(h=>h.e===e&&h.smx&&near(h.amt,200)&&near(h.t,st.t,.01)))&&F.filter(e=>Math.hypot(e.x-st.x,e.z-st.z)<CPM.stR-.01).every(e=>st.L.includes(e)),st&&st.L.length);
      run(3);ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();CPM.dbg=[];const F=knot(5);cast(4,F[2]);run(END);setL(0);ok('M5 needs Mastery 5',!ev('star').length);}
  /* ---- the rest ---- */
  {play();CPM.dbg=[];const F=knot(5);setL(5);castCompress(heroU,F[2],100,{src:heroU,el:'light',spell:'compress'});run(END);setL(0);
    ok('casts that are not a mastered scroll cast get no masteries (only the new 3D release)',ev('snap').length===1&&!CPM.dbg.some(d=>MEV.includes(d.ev)));}
  {play();CPM.dbg=[];const F=knot(5);cast(5,F[2]);run(3);cast(5,F[2]);run(END);setL(0);ok('a second squeeze ends the first cleanly (one release, one star)',ev('snap').length===1&&ev('star').length===1,ev('snap').length+'/'+ev('star').length);}
  {const e0=errs;for(let L=1;L<=5;L++){play();const F=knot(8);F.forEach(e=>{e.maxHp=e.hp=150;});cast(L,F[4]);run(END+1);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;cfmBoom=B0;CPM.dbg=null;try{if(SDP.cmp&&SDP.cmp.end)SDP.cmp.end(true);clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
