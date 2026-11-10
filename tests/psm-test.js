(function(){
/* Pulsar's masteries (v471). Run on the dev page: __kk.ev(await (await fetch('/tests/psm-test.js')).text()) returns [name, ok, detail] rows.
   The star is placed by hand (castPulsar's pc): its ring's centre stands R tiles along the road from a chosen foe A, so the ring crosses the
   road through A (Both Poles' rows also put A on the inner ring). Foes stand still on the road; the game is stepped (update and updFx, 0.05s
   a step unless a row says otherwise) and hurt is wrapped to log every amount the cast strikes for, with its element (the scroll's power is
   100). The cast's own log (PSM.dbg) gives each beam hit (which beam, when, where the beam's ground spot was and how far it reached), each
   sear, the implosion and the blast, so who is struck, when and how hard is checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
/* (cineLock runs down in the frame's anim, as in play) */
let DT=.05;const run=s=>{const n=Math.round(s/DT);for(let i=0;i<n;i++){heroU&&(heroU.cd=1e9);update(DT);updFx(DT);if(cineLock>0)cineLock-=DT;}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(camTarget.x,camTarget.z,1);scene.updateMatrixWorld(true);}
const RT=()=>ROUTES[0];
/* (no gem or scroll carriers: a carrier twinkles every 0.18s, and the twinkles still alive when a trial ends would count as left behind) */
function foe(d){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=RT();e.dist=Math.max(.2,Math.min(RT().len-.2,d));e.off=0;e.hp=e.maxHp=1e9;e.armor=0;e.res={};e.shield=0;e.spd=0;moveEnemy(e,0);return e;}
/* the road point nearest the hero (more than 1.2 tiles off), as the ladder picks it */
function mid(){let bd=1e9,bdist=0;const e0=foe(0);for(let d=0;d<RT().len;d+=.1){e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;}
/* the ring of radius Rr through foe A: its centre k x Rr tiles along the road from A (k=1: the first ring crosses the road at A; k=.6: Both Poles' second one) */
function ringAt(A,Rr,k){const p=posAt(A.dist+.1,RT()),q=posAt(A.dist-.1,RT()),dx=p[0]-q[0],dz=p[1]-q[1],l=Math.hypot(dx,dz);return{x:A.x+dx/l*Rr*k,z:A.z+dz/l*Rr*k,radii:[Rr]};}
/* the road point whose distance from (x,z) is nearest r */
function roadAt(x,z,r){let bd=1e9,bdist=0;for(let d=.2;d<RT().len-.2;d+=.05){const q=posAt(d,RT()),e=Math.abs(Math.hypot(q[0]-x,q[1]-z)-r);if(e<bd){bd=e;bdist=d;}}return bdist;}
/* A on the ring; B on the road point farthest from the ring's centre */
function stage(k,Rr){go();const A=foe(mid()),pc=ringAt(A,Rr||3,k||1);let bd=0,bdist=0;for(let d=.2;d<RT().len-.2;d+=.25){const q=posAt(d,RT()),dd=Math.hypot(q[0]-pc.x,q[1]-pc.z);if(dd>bd){bd=dd;bdist=d;}}const B=foe(bdist);return{A,B,pc};}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.pulsar=SM_XP[L-1];else delete meta.smast.pulsar;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'light',anc:true,spell:'pulsar'},x||{});
/* a cast at mastery L (its options, as the module builds them) with the log and the placement */
const castL=(L,x)=>{const X=L?psmOpts({L,a:SMA.pulsar}):{};X.log=psmLog;castPulsar(heroU,100,oC(),Object.assign(X,x||{}));return ev('open')[ev('open').length-1];};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){if(o&&o.spell==='pulsar')log.push({e,amt,el:o.el,t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-9)*Math.max(1,Math.abs(b));
const ev=n=>PSM.dbg.filter(d=>d.ev===n);
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const dC=(e,O)=>Math.hypot(e.x-O.S0.x,e.z-O.S0.z);
/* every beam hit, each foe at most every 0.22s per beam (0.22s / the spin); every ground hit within its reach of the beam's ground spot */
const cdBad=(H,cd)=>{const by=new Map(),bad=[];for(const h of H){const L=by.get(h.e)||{};const p=L[h.b];if(p!==undefined&&h.T-p<(cd||.22)-1e-9)bad.push(h.T.toFixed(3)+'-'+p.toFixed(3));L[h.b]=h.T;by.set(h.e,L);}return bad;};
const reachBad=H=>H.filter(h=>h.on==='ground'&&Math.hypot(h.e.x-h.x,h.e.z-h.z)>h.r+(h.e.boss?.3:0)+1e-9).length;
/* each beam hit strikes amt fire then amt light (the hurt log holds them in order) */
const pairsOk=(amt)=>{const L=log.filter(h=>near(h.amt,amt));return L.length>0&&L.filter(h=>h.el==='fire').length===L.length/2&&L.filter(h=>h.el==='light').length===L.length/2;};
const others=()=>SMPV_BUSY.filter(f=>!/PSR\.n/.test(String(f))).every(f=>{try{return!f();}catch(e){return true;}});
try{
  /* ---- the card ---- */
  ok('the five masteries: Hard Radiation, Spin-Up, Both Poles, Scorched Ring, Supernova (v471)',SM_D.pulsar.map(x=>x.n).join('|')==='Hard Radiation|Spin-Up|Both Poles|Scorched Ring|Supernova',SM_D.pulsar.map(x=>x.n).join('|'));
  const d=i=>smDesc('pulsar',i);
  ok('the numbers on the card are the ones in the code (95% + 95%; 10% sooner, 5% faster; 60%, 20% + 20%; 2s, 15% every 0.5s; 0.6s, 650% + 650% out to 8.5 tiles)',
    /95% fire \+ 95% light/.test(d(0))&&/90% \+ 90% before/.test(d(0))&&/10% sooner/.test(d(1))&&/5% faster/.test(d(1))&&/strike, 5% more often/.test(d(1))&&/60% of the radius/.test(d(2))&&/half a turn behind/.test(d(2))&&/20% fire \+ 20% light/.test(d(2))
    &&/last 2s/.test(d(3))&&/15% fire every 0\.5s/.test(d(3))&&/0\.6s/.test(d(4))&&/650% fire \+ 650% light/.test(d(4))&&/8\.5 tiles/.test(d(4))&&/500% \+ 500% within 6\.5/.test(d(4))
    &&PSM.hit===.95&&PSM.rad===.04&&PSM.ph===.9&&PSM.spin===1.05&&PSM.b2===.6&&PSM.hit2===.2&&PSM.sear===.15&&PSM.IMP===.6&&PSM.blast===6.5&&PSM.blastR===8.5&&PSD.searAge===2&&PSD.searIv===.5,d(0)+' / '+d(4));
  ok('no hooks of their own (the masteries live in the cast); calibrated with hidden factors',!SMF.pulsar.hit&&!SMF.pulsar.cast&&SMA.pulsar.every(x=>x===1)&&SMG.pulsar.length===5&&SMG.pulsar.every(x=>x>=.9&&x<=1.1),SMG.pulsar.join());
  ok('the defaults table is the old cast (90% + 90% a hit, the old reach, phases and spin, the second beam at the sky, 900 burn quads, no sear, the old implosion and blast, the old looks)',
    PSD.hit===.9&&PSD.rad===0&&PSD.ph===1&&PSD.spin===1&&PSD.b2===0&&PSD.BN===900&&PSD.sear===0&&PSD.IMP===.35&&PSD.blast===5&&PSD.blastR===6.5&&PSD.lw===1&&!PSD.core&&!PSD.emb&&!PSD.pull&&PSD.nova===1&&!PSD.pc&&!PSD.log);
  ok('the sweep is flown in steps of at most 0.02s: a frame at 50 fps and up is one step, as before v471',PSD.sub===.02&&1/50<=PSD.sub+1e-12);
  /* ---- Mastery 0 ---- */
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage();run(.5);
  {const {A,B,pc}=stage();PSM.dbg=[];log=[];const added=track();let O=null,bz=null,lock0=0;wrapHurt();
    try{O=castL(0,{pc});lock0=cineLock;run(17.5);bz=[PSR.n,cineLock,smPvBusy(),others()];run(6.5);}finally{hurt=H0;scene.add=S0;}
    const H=ev('hit'),bl=ev('blast')[0];
    ok('the defaults: the star 3.3 above the ring\'s centre, 900 burn quads; cineLock 16.5s',O&&near(O.S0.y,3.3)&&near(O.S0.x,pc.x)&&near(O.S0.z,pc.z)&&O.BN===900&&O.bB.length===3600&&near(lock0,16.5),lock0);
    ok('the defaults: only the first beam strikes (the second points at the sky), every hit 90% fire + 90% light, on the foe on the ring',H.length>=25&&H.every(h=>h.b===0&&h.e===A)&&pairsOk(90)&&log.filter(h=>near(h.amt,90)).length===2*H.length,H.length+' hits');
    ok('the defaults: each foe at most every 0.22s per beam; every ground hit within the beam\'s reach of its ground spot',!cdBad(H).length&&!reachBad(H)&&H.some(h=>h.on==='ground'),cdBad(H).slice(0,3).join(' '));
    ok('the defaults: the blast at 15.35s, 500% fire + 500% light on the foes within 6.5 tiles, none further',bl&&bl.T>=15.35-1e-9&&bl.T<15.35+DT+1e-9&&bl.R0===6.5&&bl.H.includes(A)&&!bl.H.includes(B)&&dC(B,O)>9.6&&log.filter(h=>near(h.amt,500)&&h.e===A).length===2&&!log.some(h=>h.e===B),bl&&bl.T.toFixed(2)+' B at '+dC(B,O).toFixed(1));
    ok('the defaults: the preview waits for the star (one cast running, past its cineLock, and nothing else holds the preview), and no longer once it is gone',bz[0]===1&&bz[1]<=0&&bz[2]===true&&bz[3]===true&&PSR.n===0&&!smPvBusy(),bz.join(','));
    ok('the defaults: the cast lives 23.35s; nothing left behind, the shared light off',!O.root.parent&&left(added)===0&&FXL.intensity===0,left(added)+' left, light '+FXL.intensity);}
  {const {A,B}=stage();PSM.dbg=[];log=[];const added=track();wrapHurt();try{setL(0);castScrollNow('pulsar',heroU,heroStats(),[A,B],100,oC());run(24);}finally{hurt=H0;scene.add=S0;}
    ok('Mastery 0: the old cast (no mastery events; every amount 90% or 500%; nothing left behind)',!PSM.dbg.length&&log.length>0&&log.every(h=>near(h.amt,90)||near(h.amt,500))&&left(added)===0&&PSR.n===0,log.length+' strikes '+left(added)+' left');}
  /* the sweep at any frame rate: before v471 a long frame swept one chord across the ring, inside it, and skipped the foes on it */
  {const G=[[1/60,{}],[.1,{sub:0}],[.1,{}],[.05,{sub:0}],[.05,{}]].map(([dt,x])=>{DT=dt;const {A,pc}=stage();PSM.dbg=[];try{castL(0,Object.assign({pc},x));run(14);}finally{DT=.05;}return ev('hit').filter(h=>h.e===A).length;});
    ok('the sweep at any frame rate: in one long step (0.1s: 2x speed at 20 fps, 6x at 60 fps, as before v471) most passes miss the foe on the ring',G[1]<G[0]*.5&&G[3]<G[0]*.95,'60 fps '+G[0]+' hits, 0.1s '+G[1]+', 0.05s '+G[3]);
    ok('now the foe on the ring is struck as often at a 0.1s or 0.05s step as at 60 fps',Math.abs(G[2]-G[0])<=G[0]*.15&&Math.abs(G[4]-G[0])<=G[0]*.15,'60 fps '+G[0]+', 0.1s '+G[2]+', 0.05s '+G[4]);}
  /* ---- M1 Hard Radiation ---- */
  {const {A,pc}=stage();PSM.dbg=[];log=[];const added=track();let O=null,sc=[];wrapHurt();
    try{O=castL(1,{pc});for(let i=0;i<300;i++){run(.05);if(i%37===20)for(const B of O.beams)for(const G of B.groups)for(const me of G.layers){const th=(1+.6*O.ST.crit)*(1-.5*O.ST.conv);sc.push(me.scale.x/(me.userData.w*th*(me.scale.y*.09+.3)));}}run(10);}finally{hurt=H0;scene.add=S0;}
    const H=ev('hit'),gr=H.filter(h=>h.on==='ground'),far=gr.filter(h=>Math.hypot(h.e.x-h.x,h.e.z-h.z)>h.r-.04);
    ok('M1: every beam hit strikes 95% fire + 95% light (90% + 90% before)',H.length>=25&&pairsOk(95)&&log.filter(h=>near(h.amt,95)).length===2*H.length,H.length+' hits');
    ok('M1: it sears 0.04 tiles further off its path: ground hits as far as the new reach, some beyond the old one, none beyond the new',!reachBad(gr)&&far.length>0&&gr.filter(h=>h.T<14).every(h=>h.r>=.44+.04-1e-9&&h.r<=.824+.04+1e-9),far.length+' of '+gr.length+' beyond the old reach');
    ok('M1: the beams\' layers a fifth thicker, with a wider, brighter white core (0.07 wide, 0.045 before) and a whiter inner layer',sc.length>=36&&sc.every(x=>near(x,1.2,1e-6))&&O.LAY[0][2]===.07&&O.LAY[0][1]===1.3&&O.LAY[1][0]===0xa6e8ff&&O.beams[0].groups[0].layers[1].material.uniforms.uC.value.getHex()===0xa6e8ff,sc[0]&&sc[0].toFixed(4));
    ok('M1: nothing else (one ring, the old blast at 15.35s); nothing left behind',!H.some(h=>h.b)&&ev('blast')[0].R0===6.5&&near(ev('blast')[0].T,15.35,.004)&&O.D.ph===1&&!O.D.b2&&left(added)===0,left(added)+' left');}
  /* ---- M2 Spin-Up ---- */
  {const G=[1,2].map(L=>{const {A,pc}=stage();PSM.dbg=[];const S=[];let O=null,fl8=0,w10=0,ph14=0;try{O=castL(L,{pc});const w0=O.wArcs[0].m.rotation.z;for(let i=0;i<300;i++){run(.05);S.push(Object.assign({},O.ST));if(i===159)fl8=O.fldM.opacity;if(i===199)w10=O.wArcs[0].m.rotation.z-w0;if(i===279)ph14=O.ST.phi;}run(10);}finally{}
      return{S,fl8,w10,ph14,n:ev('hit').filter(h=>h.e===A).length,H:ev('hit').filter(h=>h.e===A&&h.b===0),O};});
    const p=PSM.ph,bad=G[1].S.filter(s=>!(near(s.ign,SMS(s.T,0,2*p))&&near(s.act,SMS(s.T,2*p,5*p))&&near(s.fr,SMS(s.T,5*p,10*p))&&near(s.crit,SMS(s.T,10*p,14*p))&&near(s.conv,SMS(s.T,14,15)))).length;
    ok('M2: every phase 10% sooner (ignition 0-1.8s, active 1.8-4.5s, frenzy 4.5-9s, critical 9-12.6s; 0-2, 2-5, 5-10, 10-14 before); the convergence still 14-15s',G[1].S.length===300&&!bad&&G[0].S.every(s=>near(s.crit,SMS(s.T,10,14))),bad+' frames off');
    const bad2=G[1].S.filter(s=>!near(s.omT,(3+4*s.ign+9*s.act+6*s.fr+10*s.crit)*(1-.75*s.conv)*PSM.spin)).length;
    ok('M2: the star spins 5% faster (its target spin x1.05)',!bad2&&G[0].S.every(s=>near(s.omT,(3+4*s.ign+9*s.act+6*s.fr+10*s.crit)*(1-.75*s.conv))),bad2);
    const gp=g=>{const T=g.H.map(h=>h.T);return T.slice(1).map((t,i)=>t-T[i]);},g1=gp(G[0]),g2=gp(G[1]);
    /* (the spin's random surges, rnd() unseeded, move the turns actually made by +-5%, so the tenth is checked on the target spin, omT, summed to 14s; the turns made only need to be more) */
    const tg=g=>g.S.slice(0,280).reduce((s,x)=>s+x.omT*.05,0);
    ok('M2: so its beams pass, and strike, more often: by 14s the star is driven a tenth further (target spin), and a beam may strike a foe again 0.21s on (0.22s / 1.05; 0.22s before)',tg(G[1])>tg(G[0])*1.1&&Math.min(...g2)>=.22/1.05-1e-9&&g2.some(x=>x<.22-1e-6)&&Math.min(...g1)>=.22-1e-9,'target turns '+(tg(G[0])/6.2832).toFixed(1)+' / '+(tg(G[1])/6.2832).toFixed(1)+', turns made '+(G[0].ph14/6.2832).toFixed(1)+' / '+(G[1].ph14/6.2832).toFixed(1)+', closest strikes '+Math.min(...g1).toFixed(3)+' / '+Math.min(...g2).toFixed(3)+', hits '+G[0].n+' / '+G[1].n);
    /* the wind arcs turn dt x sp x (2 + 0.55 om): by 10s, sp x (20 + 0.55 x the star's own turn), whatever its surges did */
    const arcK=g=>g.w10/(g.O.wArcs[0].sp*(20+.55*g.S[199].phi));
    ok('M2: the field loops brighten sooner (at 8s, 0.40 against 0.34) and the wind arcs whirl with the faster spin',G[1].fl8>G[0].fl8*1.12&&G.every(g=>Math.abs(arcK(g)-1)<.02)&&tg(G[1])>tg(G[0]),G[0].fl8.toFixed(3)+' / '+G[1].fl8.toFixed(3)+', arcs '+G[0].w10.toFixed(0)+' / '+G[1].w10.toFixed(0)+' rad, arcs to spin '+G.map(g=>arcK(g).toFixed(3)).join(' / '));}
  /* ---- M3 Both Poles ---- */
  {const {A,pc}=stage();PSM.dbg=[];log=[];const added=track();let O=null,az=[],gl=0;wrapHurt();
    /* (each beam's direction as the cast works it out: tipped by al (the second by al2) from the down axis Ax, at the spin angle phi (the second at phi + pi)) */
    const dir=(ph,a)=>O.Ax.clone().multiplyScalar(Math.cos(a)).addScaledVector(O.U1,Math.sin(a)*Math.cos(ph)).addScaledVector(O.U2,Math.sin(a)*Math.sin(ph)).normalize();let a2=[];
    const rr=[],r1=[];try{O=castL(3,{pc});for(let i=0;i<280;i++){run(.05);if(i>40&&i%10===0){const S=O.ST;az.push(Math.max(dir(S.phi,S.al).distanceTo(O.beams[0].pd),dir(S.phi+Math.PI,S.al2).distanceTo(O.beams[1].pd)));a2.push(Math.tan(S.al2)/Math.tan(S.al));}
      const G1=O.beams[1].glow,G0=O.beams[0].glow;if(G1.visible){gl++;rr.push(Math.hypot(G1.position.x-O.S0.x,G1.position.z-O.S0.z));}if(G0.visible)r1.push(Math.hypot(G0.position.x-O.S0.x,G0.position.z-O.S0.z));}run(10);}finally{hurt=H0;scene.add=S0;}
    let late=0,n2=0;for(let i=0;i<O.BN;i++){if(O.bK[i*4]>=2){n2++;if(O.bB[i*4]>14.1)late++;}}
    const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
    ok('M3: the second beam tips down and sweeps a second ring at 60% of the radius (its ground spot 1.8 tiles from the centre on average, the first one\'s 3; the rings never meet before the convergence), its glow on the ground',O.D.b2===.6&&gl>200&&r1.length>200&&Math.abs(mean(rr)-1.8)<.12&&Math.abs(mean(r1)-3)<.15&&Math.max(...rr)<Math.min(...r1)&&a2.every(x=>near(x,.6,1e-9)),'second '+Math.min(...rr).toFixed(2)+'-'+Math.max(...rr).toFixed(2)+' (mean '+mean(rr).toFixed(2)+'), first '+Math.min(...r1).toFixed(2)+'-'+Math.max(...r1).toFixed(2)+' (mean '+mean(r1).toFixed(2)+'), glow '+gl+' frames');
    ok('M3: half a turn behind the first (the second beam at the spin angle + pi, every frame sampled)',az.length>=20&&az.every(x=>x<1e-9),az.length+' frames, off by at most '+Math.max(...az).toExponential(1));
    ok('M3: the burn pool raised to 1500 quads; the second ring burns narrower and lighter, and not in the convergence (its spiral would fill the disc)',O.BN===1500&&O.bB.length===6000&&O.D.b2w===.7&&n2>50&&!late&&/k2=step/.test(O.bM.fragmentShader),n2+' second-ring quads, '+late+' late');
    ok('M3: nothing left behind',left(added)===0,left(added));}
  {const G=[2,3].map(L=>{const {A,pc}=stage(.6,4.4);PSM.dbg=[];log=[];wrapHurt();try{castL(L,{pc});run(24);}finally{hurt=H0;}return{A,H:ev('hit').filter(h=>h.e===A),L:log.filter(h=>h.e===A)};});
    const h3=G[1].H.filter(h=>h.T<14);
    ok('M3: a foe on the inner ring (0.6 of the radius, 2.64 of 4.4 tiles) is struck by the second beam all through the sweep, 20% fire + 20% light a hit; at Mastery 2 nothing touches it before the convergence',!G[0].H.some(h=>h.T<14)&&h3.length>=20&&h3.every(h=>h.b===1)&&!cdBad(G[1].H,.22/PSM.spin).length&&G[1].L.filter(h=>near(h.amt,20)).length===2*G[1].H.filter(h=>h.b===1).length,
      'M2 '+G[0].H.filter(h=>h.T<14).length+' hits before 14s, M3 '+h3.length);}
  /* ---- M4 Scorched Ring ---- */
  {const G=[3,4].map(L=>{const {A,B,pc}=stage();PSM.dbg=[];log=[];let O=null,offCell=0;wrapHurt();
      try{O=castL(L,{pc,log:d=>{psmLog(d);if(d.ev==='sear')for(const e of d.H){const cx=Math.floor(e.x*4),cz=Math.floor(e.z*4);let on=false;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const b=O.SG.get((cx+i+32768)*65536+cz+j+32768);if(b!==undefined&&d.T-b<=2+1e-9&&(e.boss||(!i&&!j)))on=true;}if(!on)offCell++;}}});run(24);}finally{hurt=H0;}
      return{A,B,O,S:ev('sear'),L:log.slice(),offCell};});
    const S=G[1].S,sa=S.filter(s=>s.H.includes(G[1].A)).map(s=>s.T),gaps=sa.slice(1).map((t,i)=>t-sa[i]),sl=G[1].L.filter(h=>near(h.amt,15));
    ok('M4: the foe on the ring is seared over and over, 15% fire a sear (none at Mastery 3)',!G[0].S.length&&!G[0].L.some(h=>near(h.amt,15))&&sa.length>=20&&sl.length>=sa.length&&sl.every(h=>h.el==='fire'),sa.length+' sears');
    ok('M4: at most every 0.5s (checked every 0.25s), and only on ground burnt in the last 2s',gaps.every(g=>g>=.5-1e-6)&&gaps.filter(g=>g<.55).length>=gaps.length*.6&&!G[1].offCell,'gaps '+[...new Set(gaps.map(g=>g.toFixed(2)))].join(',')+', '+G[1].offCell+' off fresh ground');
    ok('M4: the foe far from the ring is never seared, and the searing stops 2s after the last burn (the blast\'s, at 15.35s)',!S.some(s=>s.H.includes(G[1].B))&&S.length&&Math.max(...S.map(s=>s.T))<=15.35+2+.25+1e-9,S.length&&Math.max(...S.map(s=>s.T)).toFixed(2));
    ok('M4: fresh embers glow hotter and longer (the burn\'s shader at Mastery 4 only)',/float hot=/.test(G[1].O.bM.fragmentShader)&&!/float hot=/.test(G[0].O.bM.fragmentShader)&&/exp\(-age\*\.5\)/.test(G[1].O.bM.fragmentShader)&&/exp\(-age\*\.7\)/.test(G[0].O.bM.fragmentShader));}
  /* ---- M5 Supernova ---- */
  {const G=[4,5].map(L=>{const {A,B,pc}=stage();const C=foe(roadAt(pc.x,pc.z,7.5));PSM.dbg=[];log=[];const added=track();let O=null,lk=0,dP=0,uP=[],inAt=[];wrapHurt();
      try{O=castL(L,{pc});lk=cineLock;run(14.95);for(let i=0;i<70;i++){const n0=PSA.list.length,imp=ev('imp').length;run(.05);if(ev('imp').length>imp)dP=PSA.list.length-n0;uP.push(O.bM.uniforms.uP.value);}run(23.45-18.45);for(let i=0;i<6;i++){inAt.push(!!O.root.parent);run(.05);}run(1);}finally{hurt=H0;scene.add=S0;}
      return{A,B,C,O,lk,dP,uP,inAt,imp:ev('imp')[0],bl:ev('blast')[0],L:log.slice(),left:left(added)};});
    const [a,b]=G;
    ok('M5: (a foe stands on the road 7.5 tiles from the centre)',Math.abs(dC(b.C,b.O)-7.5)<.3,dC(b.C,b.O).toFixed(2));
    ok('M5: a longer implosion, 0.6s (0.35s before): the blast at 15.6s',a.bl&&near(a.bl.T,15.35,.004)&&b.imp&&b.imp.T>=15-1e-9&&b.imp.T<15+DT+1e-9&&b.imp.IMP===.6&&b.bl&&near(b.bl.T,15.6,.004)&&near(b.lk,16.75)&&near(a.lk,16.5),b.bl&&b.bl.T.toFixed(2));
    ok('M5: the blast strikes 650% fire + 650% light out to 8.5 tiles (500% + 500% within 6.5 before): the foe 7.5 tiles out is struck only at Mastery 5',b.bl.R0===8.5&&b.bl.H.includes(b.C)&&b.bl.H.includes(b.A)&&!b.bl.H.includes(b.B)&&!a.bl.H.includes(a.C)&&b.L.filter(h=>h.e===b.C&&near(h.amt,650)).length===2&&b.L.filter(h=>h.e===b.C).every(h=>near(h.amt,650)||near(h.amt,15))&&a.L.filter(h=>near(h.amt,500)&&h.e===a.A).length===2,b.bl.H.length+' struck');
    ok('M5: the implosion draws both burnt rings in (about 260 more motes stream into the star, the embers on the burnt ground fade into it and come back after the blast)',b.dP-a.dP>=200&&Math.max(...b.uP)===1&&b.uP[b.uP.length-1]<.2&&a.uP.every(x=>x===0)&&/uP/.test(b.O.bM.fragmentShader),'motes '+a.dP+' / '+b.dP+', embers dimmed to '+(1-Math.max(...b.uP)).toFixed(2));
    ok('M5: shells and rings a third wider; the cast lives 23.6s; nothing left behind',near(b.O.D.nova,4/3)&&b.inAt[0]===true&&b.inAt[4]===false&&!b.left&&!a.left&&PSR.n===0,b.inAt.join(',')+' left '+b.left);}
  /* ---- the rest ---- */
  {const {A,B}=stage();PSM.dbg=[];log=[];setL(5);wrapHurt();try{castScrollNow('pulsar',heroU,heroStats(),[A,B],100,oC({smx:true}));run(24);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast (an echo) are the old cast',!PSM.dbg.length&&log.length>0&&log.every(h=>near(h.amt,90)||near(h.amt,500)),log.length);}
  {const e0=errs;const bad=[];for(let L=0;L<=5;L++){const {A,B}=stage();meta.spells.pulsar=meta.spells.pulsar||{lvl:1,hero:null};setL(L);const lv=meta.spells.pulsar.lvl||1,P=scrollPow(heroU,'pulsar',tStats(heroU),lv);
      PSM.dbg=null;const X=L?psmOpts({L,a:SMA.pulsar}):PSD,ks=[X.hit||PSD.hit,X.b2?X.hit2:null,X.sear||null,X.blast||PSD.blast].filter(x=>x);
      heroU.scd={};heroU.gcd=0;PSM.dbg=[];log=[];wrapHurt();try{fireScroll(heroU,'pulsar',heroStats(),[A,B]);run(26);}finally{hurt=H0;}
      const c=ev('cast'),odd=log.filter(h=>!ks.some(k=>near(h.amt,P*k,1e-9)));if((L?c.length!==1||c[0].L!==L:c.length)||odd.length||!log.length||PSR.n)bad.push(L+':'+c.length+'/'+(P/100).toFixed(3)+'/'+odd.length+'/'+log.length);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive; every amount is the scroll\'s power with its factor times a hit, sear or blast of that mastery) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;PSM.dbg=null;window.__fz=false;try{for(const f of fx.slice())f.life=0;updFx(.01);resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
