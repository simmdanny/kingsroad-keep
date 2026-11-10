(function(){
/* Moonfall's masteries (v468). Run on the dev page: __kk.ev(await (await fetch('/tests/mfm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand on the road of map 12: a tight knot of seven in the middle (the densest group, so the moon lands on it: they stand still, so
   it is not led) and a line of foes every 0.4 tiles 12 tiles either way along the road; the game is stepped (update and updFx), hurt is
   wrapped to log the amount each hit is called with (the scroll's power is 100: the impact deals 2600, a crater tick 60), nsDecal and
   nsSeamFx are wrapped to see where the moon lands and what the crater draws. MFM.dbg logs the masteries' events. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,ND0=nsDecal,SF0=nsSeamFx;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(12);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0],d0=R.len/2,A=posAt(Math.max(.5,d0-14),R);let hc=null,hb=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),dd=(q.x-A[0])**2+(q.z-A[1])**2;if(dd>1.5&&dd<hb){hb=dd;hc=[c,r];}}
  spawnHero(hc[0],hc[1]);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='playing';paused=false;speed=0;worldSlow=1;slowT=0;camShake=0;return{R,d0};}
function foe(R,d,off,hp){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d;e.off=off||0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.shield=0;e.spd=0;moveEnemy(e,0);return e;}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.moonfall=SM_XP[L-1];else delete meta.smast.moonfall;};
const oF=()=>({src:heroU,bane:0,el:'fire',anc:false,spell:'moonfall'});
const cast=L=>{setL(L);castScrollNow('moonfall',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oF());};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>MFM.dbg.filter(d=>d.ev===n);
const hits=(e,amt,o)=>log.filter(h=>h.e===e&&near(h.amt,amt)&&(!o||o.dot==null||h.dot===o.dot));
const leftL=added=>added.filter(o=>{if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}),left=added=>leftL(added).length;
const track=()=>{const added=[];scene.add=function(...a){if(!/terTick|terRipple/.test(String(new Error().stack)))added.push(...a);return S0.apply(this,a);};return added;};
/* the stage: the knot (7) in the middle, a line every 0.4 tiles 12 tiles either way, and, on request, a boss, an Unstoppable foe and a flyer
   in the knot */
const stage=x=>{x=x||{};const G=go(),R=G.R,d0=G.d0,F=[];for(let i=0;i<7;i++)F.push(foe(R,d0+(i-3)*.1,(i%3-1)*.12));
  for(let i=-30;i<=30;i++){const d=d0+i*.4;if(Math.abs(i)<2||d<.5||d>R.len-.5)continue;F.push(foe(R,d,((i+30)%3-1)*.15));}
  const S={G,F};if(x.special){S.B=F[1];S.B.boss=true;S.U=F[5];S.U.unstopT=60;S.Fl=foe(R,d0+.2,.1);S.Fl.fly=true;F.push(S.Fl);}return S;};
const dOf=(e,c)=>Math.hypot(e.x-c.x,e.z-c.z);
/* one cast at mastery L on a fresh stage, stepped s seconds: the hurt log, where it landed (the shadow, the first decal it lays), the decals and
   seams it drew, each foe's stun just after the impact, and each foe's slow at the times asked for (seconds after the cast) */
const trial=(L,s,x)=>{x=x||{};const S=stage(x);MFM.dbg=[];log=[];wrapHurt();const dec=[],sea=[];nsDecal=function(px,pz,r){dec.push({x:px,z:pz,r,t:time});return ND0.apply(this,arguments);};
  nsSeamFx=function(){sea.push([...arguments]);return SF0.apply(this,arguments);};const added=track(),t0=time,slows={},bn=new Set(NS_OWN);let stun=null,ti=null,moon=null;
  if(x.walk)x.walk(S);
  try{cast(L);moon=[...NS_OWN].find(o=>!bn.has(o)&&o.isGroup);const n=Math.round((s||12)/.05);for(let i=0;i<n;i++){run(.05);const tt=time-t0;
      if(!stun&&log.some(h=>!h.dot&&(near(h.amt,2600)||near(h.amt,3120)))){stun=S.F.map(e=>e.stunT||0);ti=time;}
      for(const at of x.slowAt||[])if(!slows[at]&&tt>=at-1e-6)slows[at]=S.F.map(e=>e.slowT>0?e.slow:0);
      if(x.each)x.each(S,tt);}}
  finally{hurt=H0;scene.add=S0;nsDecal=ND0;nsSeamFx=SF0;setL(0);}
  Object.assign(S,{t0,stun,ti,slows,added,dec,sea,moon,log:log.slice(),c:dec[0]});return S;};
const amt=(S,e,a,dot)=>S.log.filter(h=>h.e===e&&near(h.amt,a)&&h.dot===!!dot);
try{
  /* a first cast at Mastery 5 that is not checked: the game's shared pools and helpers (made the first time something uses them, and kept)
     are made here, so "nothing is left behind" below sees only what a cast leaves */
  {stage();cast(5);run(12);setL(0);}
  /* ---- the card ---- */
  ok('the five masteries: Fuller Moon, Molten Crater, Shattered Moon, Under Its Shadow, Moonbreaker (v468)',SM_D.moonfall.map(x=>x.n).join('|')==='Fuller Moon|Molten Crater|Shattered Moon|Under Its Shadow|Moonbreaker',SM_D.moonfall.map(x=>x.n).join('|'));
  const dsc=[0,1,2,3,4].map(i=>smDesc('moonfall',i));
  ok('the numbers on the card are the ones in the code (4.6; 3 / 7s / 65%; 16 / 0.5 / 80%; 60%; 20% / 10.6 / 300%)',/4\.6 tiles/.test(dsc[0])&&/3 tiles/.test(dsc[1])&&/7s/.test(dsc[1])&&/65%/.test(dsc[1])&&/16 shards/.test(dsc[2])&&/0\.5 tiles/.test(dsc[2])&&/80%/.test(dsc[2])&&/60%/.test(dsc[3])&&/20%/.test(dsc[4])&&/10\.6 tiles/.test(dsc[4])&&/300%/.test(dsc[4])
    &&MFM.R===4.6&&MFM.pr===3&&MFM.burn===7&&MFM.tick===.65&&MFM.seams===16&&MFM.shard===.8&&MFM.shardR===.5&&MFM.slow===.6&&MFM.hard===.2&&MFM.wave===3&&near(MFM.R*MFL.WAVE_R,10.58,.001),dsc.join(' / '));
  ok('no hit hooks; calibrated with hidden factors',!SMF.moonfall.hit&&!SMF.moonfall.cast&&SMA.moonfall.every(x=>x===1)&&SMG.moonfall.length===5&&SMG.moonfall.every(x=>x>=.9&&x<1.25),SMG.moonfall.join());
  /* ---- Mastery 0 ---- */
  {const S=trial(0,10,{special:true}),F=S.F,c=S.c,G=F.filter(e=>!e.fly);const imp=F.filter(e=>dOf(e,c)<4.2),cr=F.filter(e=>dOf(e,c)<2.6),sure=(e,R)=>Math.abs(dOf(e,c)-R)>.02;
    ok('Mastery 0: the moon lands on the knot (not led: it stands still), its shadow 3.6 and red glow 3.1 wide',c&&dOf(F[3],c)<.35&&near(S.dec[0].r,3.6)&&near(S.dec[1].r,3.1),c&&dOf(F[3],c).toFixed(2));
    ok('Mastery 0: the impact strikes exactly the foes within 4.2 tiles, flyers too, once each for 2600%',imp.length>=15&&imp.includes(S.Fl)&&F.filter(e=>sure(e,4.2)).every(e=>amt(S,e,2600).length===(imp.includes(e)?1:0)),imp.length+' hit');
    ok('Mastery 0: stunned 1.4s (bosses 0.5s), set directly: an Unstoppable foe is stunned as well (Resolve is bypassed by design)',S.stun&&near(S.stun[F.indexOf(S.U)],1.4,.04)&&near(S.stun[F.indexOf(S.B)],.5,.04)&&imp.filter(e=>e!==S.B).every(e=>near(S.stun[F.indexOf(e)],1.4,.04))&&F.filter(e=>!imp.includes(e)&&sure(e,4.2)).every(e=>!(S.stun[F.indexOf(e)]>0)),S.stun&&[S.stun[F.indexOf(S.U)],S.stun[F.indexOf(S.B)]].map(v=>v.toFixed(2)).join(','));
    /* (a tick every 0.5s while it burns: 12 in play; stepped 0.05s at a time, the timer lands a step late, 11) */
    const tk=e=>amt(S,e,60,true).length,n0=tk(cr[0]),bt=S.log.filter(h=>h.dot).map(h=>h.t-S.ti),last=Math.max(...bt);
    ok('Mastery 0: the crater burns the foes within 2.6, flyers too, 60% a tick, a tick each 0.5s for 6s',cr.length>=8&&cr.includes(S.Fl)&&n0>=11&&n0<=12&&F.filter(e=>sure(e,2.6)).every(e=>tk(e)===(cr.includes(e)?n0:0))&&last>5.4&&last<6,n0+' ticks each, the last '+last.toFixed(2)+'s after the impact');
    ok('Mastery 0: no mastery events, nothing else (no 80%, 300%, 65%, 3120%)',!MFM.dbg.length&&!S.log.some(h=>near(h.amt,80)||near(h.amt,300)||near(h.amt,65)||near(h.amt,3120))&&S.log.every(h=>near(h.amt,2600)||near(h.amt,60)));
    ok('Mastery 0: nobody is slowed (the slow is Mastery 4\'s)',!Object.keys(S.slows).length&&G.every(e=>!(e.slow>0)));
    ok('Mastery 0: the crater\'s 12 cracks are drawn facing the sky (they were drawn facing the ground and never seen), within three quarters of the crater\'s radius',S.sea.length===1&&S.sea[0][3]===12&&near(S.sea[0][2],2.6*.75)&&S.sea[0][8]&&S.sea[0][8].up===true,S.sea.length&&S.sea[0].slice(2,4).join(','));
    ok('Mastery 0: nothing is left behind',left(S.added)===0,leftL(S.added).map(o=>o.type+':'+(o.geometry&&o.geometry.type)).slice(0,6).join(' '));}
  /* the cracks face up for Moonfall, and stay as they were for every other spell (nsSeamFx without options) */
  {const face=up=>{const b=new Set(NS_OWN);nsSeamFx(0,0,2,6,0xff3a20,0x2a0204,.05,1,up?{up:true}:undefined);const sm=[...NS_OWN].filter(o=>!b.has(o)&&o.isMesh&&o.geometry&&o.geometry.index);let n=0,u=0;
      for(const o of sm){const p=o.geometry.attributes.position,I=o.geometry.index;const A=new THREE.Vector3().fromBufferAttribute(p,I.getX(0)),B=new THREE.Vector3().fromBufferAttribute(p,I.getX(1)),C=new THREE.Vector3().fromBufferAttribute(p,I.getX(2));
        n++;if(new THREE.Vector3().subVectors(C,B).cross(new THREE.Vector3().subVectors(A,B)).y>0)u++;}run(1.2);return u+'/'+n;};stage();
    const a=face(true),b=face(false);ok('the crater cracks face the sky only where asked (o.up): other spells sharing nsSeamFx are unchanged',a==='2/2'&&b==='0/2',a+' with up, '+b+' without');}
  /* ---- M1 Fuller Moon ---- */
  {const S=trial(1,4),F=S.F,c=S.c,sure=e=>Math.abs(dOf(e,c)-4.6)>.02;const imp=F.filter(e=>dOf(e,c)<4.6),far=imp.filter(e=>dOf(e,c)>4.2);
    ok('M1: the impact reaches 4.6 tiles (4.2 before): exactly the foes within it, 2600% each',far.length>=2&&F.filter(sure).every(e=>amt(S,e,2600).length===(imp.includes(e)?1:0)),imp.length+' hit, '+far.length+' past 4.2');
    ok('M1: the moon a tenth larger (2.64), its shadow and glow widened with the impact (3.94, 3.4), a brighter corona',S.moon&&near(S.moon.scale.x,2.64,.001)&&near(S.dec[0].r,3.6*4.6/4.2,.001)&&near(S.dec[1].r,3.1*4.6/4.2,.001)&&ev('cast')[0].X.COR===.34,S.moon&&S.moon.scale.x);
    ok('M1: no other change (stun 1.4s, the crater 60% within 2.6)',S.stun&&imp.every(e=>near(S.stun[F.indexOf(e)],1.4,.04))&&S.log.some(h=>h.dot&&near(h.amt,60))&&!S.log.some(h=>near(h.amt,65)||near(h.amt,80)));}
  /* ---- M2 Molten Crater ---- */
  {const S=trial(2,11),F=S.F,c=S.c,sure=e=>Math.abs(dOf(e,c)-3)>.02;const cr=F.filter(e=>dOf(e,c)<3),out2=cr.filter(e=>dOf(e,c)>2.6),tk=e=>amt(S,e,65,true).length,n2=tk(cr[0]),last=Math.max(...S.log.filter(h=>h.dot).map(h=>h.t))-S.ti;
    ok('M2: the crater is 3 tiles wide (2.6 before), 65% a tick (60% before), for 7s (6s before): two ticks more',out2.length>=2&&n2>=13&&n2<=14&&F.filter(sure).every(e=>tk(e)===(cr.includes(e)?n2:0))&&!S.log.some(h=>near(h.amt,60))&&last>6.4&&last<7,n2+' ticks each, the last '+last.toFixed(2)+'s after the impact');
    ok('M2: 16 cracks (12 before), a little further out, wider and brighter, facing the sky, lasting as much longer; the crater drawn 3 wide',S.sea.length===1&&S.sea[0][3]===16&&near(S.sea[0][2],3*.8)&&S.sea[0][8].up&&S.sea[0][8].k>.4&&near(S.sea[0][7],7.2)&&S.dec.filter(d=>near(d.r,3)).length===1,S.sea.length&&S.sea[0].slice(2,4).join(','));
    ok('M2: the cast lives as much longer (10.2s)',ev('end').length===1&&near(ev('end')[0].t-ev('cast')[0].t,10.2,.01),ev('end').length&&(ev('end')[0].t-ev('cast')[0].t).toFixed(2));}
  /* ---- M3 Shattered Moon ---- */
  {const S=trial(3,6),F=S.F,c=S.c,sh=ev('shard'),aim=ev('aim')[0],hit=sh.filter(d=>d.q),a80=S.log.filter(h=>near(h.amt,80));
    const nearest=d=>{let b=null,bd=.25;for(const e of F){if(e.dead)continue;const q=(e.x-d.x)**2+(e.z-d.z)**2;if(q<bd){bd=q;b=e;}}return b;};
    ok('M3: all 16 shards are thrown at foes (one each), the foes the impact did not reach first',aim&&aim.n===16&&sh.length===16&&new Set(sh.map(d=>d.aim)).size===16&&sh.every(d=>d.aim&&dOf(d.aim,c)>=4.6&&dOf(d.aim,c)<=8.5),aim&&aim.n+' aimed, '+sh.filter(d=>d.aim&&dOf(d.aim,c)>=4.6).length+' past the impact');
    ok('M3: each shard strikes the nearest foe within 0.5 tiles of where it lands, 80%, and nothing else',sh.every(d=>d.q===nearest(d))&&a80.length===hit.length&&hit.every(d=>S.log.some(h=>h.e===d.q&&near(h.amt,80)&&Math.abs(h.t-d.t)<1e-9)),hit.length+' strikes');
    ok('M3: they land where they were sent: on their foe',sh.filter(d=>d.q&&d.q===d.aim).length>=14,sh.map(d=>Math.hypot(d.x-d.goal.x,d.z-d.goal.z).toFixed(2)).join(','));
    ok('M3: Masteries 1-2 ride it (4.6, the crater 65%)',S.log.some(h=>h.dot&&near(h.amt,65))&&F.filter(e=>dOf(e,c)>4.25&&dOf(e,c)<4.58).every(e=>amt(S,e,2600).length===1));}
  /* a lone foe: its one shard falls back onto it */
  {const G=go(),e=foe(G.R,G.d0,0);MFM.dbg=[];log=[];wrapHurt();try{cast(3);run(5);}finally{hurt=H0;setL(0);}const sh=ev('shard');
    ok('M3: a lone foe at the heart of the impact gets one shard back (the rest fly wide)',sh.filter(d=>d.q===e).length===1&&log.filter(h=>near(h.amt,80)).length===1,sh.filter(d=>d.q).length);}
  /* ---- M4 Under Its Shadow ---- */
  {const S=trial(4,10.5,{special:true,slowAt:[1.2,1.7,2.55]}),F=S.F,c=S.c,R=3.6*4.6/4.2,inS=F.filter(e=>!e.fly&&dOf(e,c)<R-.02),outS=F.filter(e=>dOf(e,c)>R+.02),v=(at,e)=>S.slows[at]&&S.slows[at][F.indexOf(e)];
    const k=1.2/2.6,ex=.6*Math.min(1,k*k/((1.6/2.6)**2));
    ok('M4: ground foes under the falling moon\'s shadow are slowed, harder as it darkens ('+ex.toFixed(2)+' at 1.2s), 60% in its last second',inS.length>=10&&inS.every(e=>near(v(1.2,e),ex,.02)&&near(v(1.7,e),.6,.001)&&near(v(2.55,e),.6,.001)),inS.length+' under it: '+[1.2,1.7,2.55].map(t=>v(t,inS[0])).map(x=>x&&x.toFixed(3)).join(','));
    ok('M4: an Unstoppable foe is slowed too (a slow, not a hold)',near(v(1.7,S.U),.6,.001));
    ok('M4: flyers and foes outside the shadow are not',!(v(1.7,S.Fl)>0)&&outS.length>=20&&outS.every(e=>!(v(1.7,e)>0)));
    const se=ev('slow')[0];ok('M4: the log keeps each foe at its most slowed (60%)',se&&se.S.length>=inS.length&&inS.every(e=>se.S.some(([q,x])=>q===e&&near(x,.6))),se&&se.S.length);}
  {/* walking foes on a clear road: the shadow holds them back in its last second (each against how far it would walk there: the ground
     itself can slow, terSlow) */
    const G=go(),K=[];for(let i=0;i<7;i++)K.push(foe(G.R,G.d0+(i-3)*.1,(i%3-1)*.12));const Wk=[foe(G.R,G.d0+1.2,.3),foe(G.R,G.d0+6,.3)];Wk.forEach(e=>{e.spd=1;});MFM.dbg=[];const t0=time;
    const dec=[];nsDecal=function(px,pz){dec.push({x:px,z:pz});return ND0.apply(this,arguments);};try{cast(4);}finally{nsDecal=ND0;}const c=dec[0],mv=[0,0],free=[0,0],r=[1e9,0];
    try{for(let i=0;i<54;i++){const tt=time-t0+.05,on=tt>1.6+1e-6&&tt<2.55,d=Wk.map(e=>e.dist);if(on)Wk.forEach((e,j)=>{free[j]+=.05*e.spd*terSlow(e,1,1)*gustF(e);});run(.05);
      if(on)Wk.forEach((e,j)=>{mv[j]+=e.dist-d[j];const q=dOf(e,c);r[j]=j?Math.min(r[j]||1e9,q):Math.max(r[j]>1e8?0:r[j],q);});}}finally{setL(0);}
    const k0=mv[0]/free[0],k1=mv[1]/free[1];
    ok('M4: a walking foe under the shadow covers 40% of the ground it would in its last second (one outside: all of it)',r[0]<3.9&&r[1]>4.5&&free[0]>.5&&near(k0,.4,.02)&&near(k1,1,.02),k0.toFixed(3)+' / '+k1.toFixed(3));}
  /* ---- M5 Moonbreaker ---- */
  {const S=trial(5,6,{special:true}),F=S.F,c=S.c,WR=4.6*2.3,G=F.filter(e=>!e.fly),wv=ev('wave'),w=e=>amt(S,e,300).length,sure=e=>Math.abs(dOf(e,c)-WR)>.02;
    ok('M5: the impact strikes 20% harder: 3120% within 4.6',F.filter(e=>Math.abs(dOf(e,c)-4.6)>.02).every(e=>amt(S,e,3120).length===(dOf(e,c)<4.6?1:0))&&!S.log.some(h=>near(h.amt,2600)));
    ok('M5: the blood wave strikes every ground foe it passes, out to 10.6 tiles, once each, 300%; not flyers',G.filter(e=>dOf(e,c)<WR).length>=35&&G.filter(sure).every(e=>w(e)===(dOf(e,c)<WR?1:0))&&w(S.Fl)===0&&G.some(e=>dOf(e,c)>9.7&&dOf(e,c)<WR&&w(e)===1),G.filter(e=>w(e)).length+' struck, the furthest '+Math.max(...G.filter(e=>w(e)).map(e=>dOf(e,c))).toFixed(2));
    const T=wv.map(d=>({d:d.d,t:d.t-S.ti})).sort((a,b)=>a.d-b.d);let mono=true;for(let i=1;i<T.length;i++)if(T[i].t<T[i-1].t-1e-9)mono=false;
    ok('M5: as it passes them: the further a foe, the later it is struck, all within its 1.9s',mono&&T.length&&T[T.length-1].t<=1.9+1e-6&&T[T.length-1].t>T[0].t+.5,T.length&&T.map(x=>x.d.toFixed(1)+'@'+x.t.toFixed(2)).filter((x,i)=>i%6===0).join(' '));
    ok('M5: Masteries 1-4 ride it (the crater 65%, 80% shards)',S.log.some(h=>h.dot&&near(h.amt,65))&&S.log.some(h=>near(h.amt,80))&&ev('cast')[0].X.SLOW===.6);}
  {const S=trial(5,11);ok('M5: nothing is left behind (the wave of blood is gone with it)',left(S.added)===0,leftL(S.added).map(o=>o.type+':'+(o.geometry&&o.geometry.type)).slice(0,6).join(' '));}
  {const S=trial(4,6);ok('M5 needs Mastery 5 (at 4: no wave, 2600%)',!ev('wave').length&&S.log.some(h=>near(h.amt,2600))&&!S.log.some(h=>near(h.amt,300)||near(h.amt,3120)));}
  /* ---- the rest ---- */
  {const S=stage();MFM.dbg=[];log=[];setL(5);wrapHurt();const dec=[];nsDecal=function(px,pz){dec.push({x:px,z:pz});return ND0.apply(this,arguments);};
    try{NSP.moonfall(heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'fire',spell:'moonfall'});}finally{nsDecal=ND0;}try{run(9);}finally{hurt=H0;setL(0);}
    const c=dec[0],imp=S.F.filter(e=>dOf(e,c)<4.2);ok('casts that are not a mastered scroll cast are the old cast',!MFM.dbg.length&&imp.length>=15&&S.F.filter(e=>Math.abs(dOf(e,c)-4.2)>.02).every(e=>log.filter(h=>h.e===e&&near(h.amt,2600)).length===(imp.includes(e)?1:0))&&!log.some(h=>near(h.amt,80)||near(h.amt,300)));}
  {stage();setL(2);MFM.busy=0;cast(2);const b=MFM.busy-time;run(11);setL(0);ok('the mastery preview waits for the crater to cool (the cast outlives its cineLock)',near(b,10.2,.01)&&SMPV_BUSY.some(f=>String(f).indexOf('MFM.busy')>=0)&&!SMPV_BUSY.some(f=>{try{return String(f).indexOf('MFM.busy')>=0&&f();}catch(e){return true;}}),b.toFixed(2));}
  {const e0=errs;for(let L=0;L<=5;L++){const S=stage();S.F.forEach((e,i)=>{e.maxHp=e.hp=i%2?2500:1e5;e.spd=.6;});heroU.scd={};heroU.gcd=0;setL(L);meta.spells.moonfall=meta.spells.moonfall||{lvl:1,hero:null};fireScroll(heroU,'moonfall',heroStats(),S.F.slice());run(14);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;nsDecal=ND0;nsSeamFx=SF0;MFM.dbg=null;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
