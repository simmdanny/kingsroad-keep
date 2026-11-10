(function(){
/* Blood Needles' masteries (v466). Run on the dev page: __kk.ev(await (await fetch('/tests/bnm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road every half tile either side of the point nearest the hero; the game is stepped (update and updFx, 0.05s a
   step unless a row says otherwise) and hurt is wrapped to log every amount the needles strike for (the scroll's power is 100, so a needle
   strikes 125% of the hero's attack: heroStats().dmg x 1.25). Every mastered cast logs its orbit, each needle as it leaves (its mark, the
   time, whether it was the halo's), each strike (its amount and how many needles of the swarm were already in the foe), the needles that
   expire, the wait and the halo (BNM.dbg), so who is struck, when and how hard is checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,SP0=sprayP;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
let DT=.05;const run=s=>{for(let i=0;i<Math.round(s/DT);i++){heroU&&(heroU.cd=1e9);update(DT);updFx(DT);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(camTarget.x,camTarget.z,1);scene.updateMatrixWorld(true);}
/* the road point nearest the hero (more than 1.2 tiles off), as the ladder picks it */
function mid(){const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;}
/* (no gem or scroll carriers: a carrier twinkles every 0.18s, and the twinkles still alive when a trial ends would count as left behind) */
function foe(d,hp){const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.2,d));e.off=0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.shield=0;e.spd=0;moveEnemy(e,0);return e;}
const stage=(w,hp)=>{go();const d0=mid(),F=[];for(let d=-w;d<=w+.001;d+=.5)F.push(foe(d0+d,hp));return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.bloodneedles=SM_XP[L-1];else delete meta.smast.bloodneedles;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'dark',anc:true,spell:'bloodneedles'},x||{});
const cast=(L,x)=>{setL(L);castScrollNow('bloodneedles',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oC(x));};
/* a needle's strike (125% of the hero's attack at power 100) and the hunt's reach, as castScrollNow2 gives them */
const D0=()=>{const s=heroStats();return s.dmg*1.25*100/(s.spellP||s.dmg);},R0=()=>Math.sqrt(1.6)*(heroStats().range+1);
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){if(o&&o.spell==='bloodneedles')log.push({e,amt,t:time});return H0.apply(this,arguments);};};
let spl=[];const wrapSpray=()=>{sprayP=function(addv,x,y,z,n,o){spl.push({addv,n,c:o.c,s:o.s});return SP0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-9)*Math.max(1,Math.abs(b));
const ev=n=>BNM.dbg.filter(d=>d.ev===n);
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const dbgX=x=>Object.assign({log:d=>{d.t=time;BNM.dbg.push(d);}},x||{});
const dist=e=>Math.hypot(e.x-heroU.x,e.z-heroU.z);
const mean=a=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length);
/* the k-th strike of this swarm on each foe (k from 0): base x (1 + min(cap, per x k)) */
const rampOk=(base,per,cap)=>{const by=new Map(),bad=[];for(const h of log){const k=by.get(h.e)||0;by.set(h.e,k+1);const want=base*(1+Math.min(cap,per*k));if(!near(h.amt,want,1e-9))bad.push(k+':'+h.amt.toFixed(3)+'/'+want.toFixed(3));}return bad;};
/* move the foes to the road point farthest from the hero (out of every reach), and back */
const away=F=>{const R=ROUTES[0];let bd=0,bdist=0;for(let d=0;d<R.len;d+=.5){const q=posAt(d,R),dd=(q[0]-heroU.x)**2+(q[1]-heroU.z)**2;if(dd>bd){bd=dd;bdist=d;}}for(const e of F){e.bnD=e.dist;e.dist=bdist;moveEnemy(e,0);}return Math.sqrt(bd);};
const back=F=>{for(const e of F){e.dist=e.bnD;moveEnemy(e,0);}};
/* the flying needles a cast put in the scene (a spine, its two ends and its tip) and their trails */
const flyers=added=>added.filter(o=>o.isGroup&&o.children.length===4&&o.children[3].geometry===ico(.012,0));
const trails=added=>added.filter(o=>o.isMesh&&o.frustumCulled===false&&o.geometry&&o.geometry.index&&o.material&&o.material.color&&!o.material.isShaderMaterial);
try{
  /* ---- the card ---- */
  ok('the five masteries: Barbed Points, Bloodhound, Bloodletting, Patient Swarm, Crimson Halo (v466)',SM_D.bloodneedles.map(x=>x.n).join('|')==='Barbed Points|Bloodhound|Bloodletting|Patient Swarm|Crimson Halo',SM_D.bloodneedles.map(x=>x.n).join('|'));
  const d=i=>smDesc('bloodneedles',i);
  ok('the numbers on the card are the ones in the code (135%; 25% faster, a quarter further; 2% a needle up to 20%; 1.5s; 12 needles, 24 one by one, 36 in all)',
    /135%/.test(d(0))&&/125% before/.test(d(0))&&/25% faster/.test(d(1))&&/quarter further/.test(d(1))&&/ 2% harder/.test(d(2))&&/up to 20%/.test(d(2))&&/1\.5s/.test(d(3))&&/12 needles/.test(d(4))&&/8 before/.test(d(4))&&/24 /.test(d(4))&&/36 needles in all/.test(d(4))&&/32 before/.test(d(4))
    &&BNM.atk===1.35&&BNM.spd===1.25&&BNM.turn===2&&BNM.reach===1.25&&BNM.let===.02&&BNM.letMax===.2&&BNM.wait===1.5&&BNM.N===12&&BNM.SH===24&&BNM.F1===3.35&&BNM.haloT===3.85,d(2)+' / '+d(4));
  ok('no hooks of their own (the masteries live in the cast); calibrated with hidden factors',!SMF.bloodneedles.hit&&!SMF.bloodneedles.cast&&SMA.bloodneedles.every(x=>x===1)&&SMG.bloodneedles.length===5&&SMG.bloodneedles.every(x=>x>=.9&&x<1.25),SMG.bloodneedles.join());
  ok('the defaults table is the old cast (125%; the old flight, reach and orbit of 8; 32 needles by 4.35s; nothing waits; no halo; the old looks)',
    BND.K===1&&BND.spd===1&&BND.turn===1&&BND.reach===1&&BND.let===0&&BND.wait===0&&BND.N===8&&BND.SH===32&&BND.F1===4.35&&!BND.halo&&BND.len===1&&BND.sheen===.3&&!BND.tip&&BND.trail===14&&BND.trailW===.05&&BND.trailA===.55&&BND.trailC===0xb01020
    &&BND.swoop===1&&BND.swoopA===.9&&!BND.spray&&!BND.glow&&!BND.blur&&!BND.spin&&!BND.wSpin&&!BND.blurSpin&&BND.smoke===1&&BND.smokeS===1&&!BND.log);
  ok('the flight is flown in steps of at most 0.02s: a frame at 50 fps and up is still one step, as before v466',BND.sub===.02&&1/60<=BND.sub&&1/50<=BND.sub+1e-12);
  /* ---- Mastery 0 ---- */
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage(3);run(.5);
  /* the defaults given as options (only a log added) are the same cast */
  {const F=stage(3);BNM.dbg=[];log=[];const added=track();let c=null,sc=[],rootIn=[];wrapHurt();
    try{setL(0);castBloodNeedles(heroU,D0(),oC(),heroStats().range+1,dbgX());c=ev('cast')[0];for(let i=0;i<200;i++){run(.05);if(i===40)sc=c.nd.map(n=>[n.g.scale.x,n.g.scale.z,Math.hypot(n.g.position.x,n.g.position.z)]);if(i===95||i===101)rootIn.push(!!c.root.parent);}}finally{hurt=H0;scene.add=S0;}
    const fi=ev('fire'),bad=fi.filter((f,n)=>!(f.T>=.35+n/8-1e-6&&f.T<=.35+n/8+DT+1e-6)).map(f=>f.T.toFixed(2));
    ok('the defaults: an orbit of 8 needles at 0.72, drawn at their own length',c&&c.nd.length===8&&c.N===8&&sc.every(q=>near(q[0],q[1])&&near(q[2],.72,1e-6)),sc.slice(0,2).join(' '));
    ok('the defaults: 32 needles, one every 1/8 s from 0.35s, the last before 4.35s, none at once',fi.length===32&&!bad.length&&fi[31].T<4.35&&!fi.some(f=>f.halo),fi.length+' '+bad.slice(0,4).join(','));
    ok('the defaults: every needle strikes its mark once, 125% of the hero\'s attack, and none is lost',log.length===32&&log.every(h=>near(h.amt,D0()))&&ev('hit').length===32&&!ev('lost').length&&new Set(ev('hit').map(h=>h.id)).size===32,log.length+' strikes, '+ev('lost').length+' lost');
    ok('the defaults: no needle waits and there is no halo; the orbit is gone at 4.9s',!ev('wait').length&&!ev('halo').length&&rootIn[0]===true&&rootIn[1]===false,rootIn.join());
    ok('the defaults: nothing left behind',left(added)===0,left(added)+' left');}
  {const F=stage(3);BNM.dbg=[];log=[];const added=track();wrapHurt();try{cast(0);run(10);}finally{hurt=H0;scene.add=S0;}
    ok('Mastery 0: the old cast (32 strikes of 125% of the hero\'s attack, no mastery events, nothing left behind)',!BNM.dbg.length&&log.length===32&&log.every(h=>near(h.amt,D0()))&&left(added)===0,log.length+' strikes '+left(added)+' left');}
  /* the flight at any frame rate: before v466 a long step flew a needle past its mark, and most then circled it until they expired */
  {const G=[[.05,{sub:0}],[.05,{}],[1/60,{}]].map(([dt,x])=>{DT=dt;const F=stage(3);BNM.dbg=[];log=[];wrapHurt();try{setL(0);castBloodNeedles(heroU,D0(),oC(),heroStats().range+1,dbgX(x));run(9);}finally{hurt=H0;DT=.05;}
      return{hit:ev('hit').length,lost:ev('lost').length,age:mean(ev('hit').map(h=>h.age)),n:log.length};});
    ok('the flight at any frame rate: flown in one long step (20 fps or 1x at 3x speed, as before v466) most needles expire unstruck',G[0].lost>=8&&G[0].hit+G[0].lost===32,G[0].hit+' struck, '+G[0].lost+' lost');
    ok('now all 32 strike at 20 fps as at 60 fps, after the same circling hunt (most strike after 1.5s or more on average)',G[1].hit===32&&G[1].n===32&&!G[1].lost&&G[2].hit===32&&!G[2].lost&&G[1].age>1.3&&G[2].age>1.3,'20 fps '+G[1].age.toFixed(2)+'s, 60 fps '+G[2].age.toFixed(2)+'s');}
  /* ---- M1 Barbed Points ---- */
  {const F=stage(3);BNM.dbg=[];log=[];const added=track();let c=null,sc=null,sh=0,fl=[];wrapHurt();try{cast(1);c=ev('cast')[0];run(1.5);sc=c.nd.map(n=>n.g.scale.z/n.g.scale.x);sh=c.nd[0].g.children[0].material.opacity;fl=flyers(added).map(p=>[p.scale.z,p.children[3].scale.x]);run(8);}finally{hurt=H0;scene.add=S0;setL(0);}
    const X=ev('opts')[0].X,tr=trails(added);
    ok('M1: every needle strikes 135% of the hero\'s attack (125% before), 32 of them',log.length===32&&log.every(h=>near(h.amt,D0()*1.08)),log.length+' '+(log[0]&&(log[0].amt/D0()).toFixed(4)));
    ok('M1: the needles drawn a fifth longer (in the orbit and in flight), with a brighter sheen (0.45, 0.3 before) and tips half again as large',sc.every(q=>near(q,1.2,1e-6))&&near(sh,.45)&&fl.length>=5&&fl.every(q=>q[0]===1.2&&q[1]===1.5),sc[0].toFixed(3)+' sheen '+sh+' '+fl.length+' flying');
    ok('M1: longer trails (18 points, 14 before)',tr.length===32&&tr.every(m=>m.geometry.attributes.position.count===36)&&X.trail===18,tr.length+' trails');
    ok('M1: nothing else (the old reach, no wait, no halo, the old orbit), nothing left behind',ev('fire').every(f=>dist(f.e)<=R0()+1e-6)&&c.nd.length===8&&!ev('wait').length&&!ev('halo').length&&!X.spd&&!X.let&&left(added)===0,left(added)+' left');}
  /* ---- M2 Bloodhound ---- */
  {const G=[1,2].map(L=>{const F=stage(10);BNM.dbg=[];log=[];const added=track();wrapHurt();try{cast(L);run(9);}finally{hurt=H0;scene.add=S0;setL(0);}
      return{fd:ev('fire').map(f=>dist(f.e)),age:mean(ev('hit').map(h=>h.age)),hit:ev('hit').length,n:log.length,amt:log.every(h=>near(h.amt,D0()*1.08)),tr:trails(added),X:ev('opts')[0].X};});
    const r=R0();
    ok('M2: the needles hunt a quarter further (foes between the old reach and 1.25 times it are struck, none beyond; at Mastery 1 none past the old reach)',G[0].fd.every(x=>x<=r+1e-6)&&G[1].fd.some(x=>x>r+.05)&&G[1].fd.every(x=>x<=r*1.25+1e-6),'reach '+r.toFixed(2)+', M1 farthest '+Math.max(...G[0].fd).toFixed(2)+', M2 '+Math.max(...G[1].fd).toFixed(2));
    ok('M2: they fly 25% faster and turn twice as tight, so they strike far sooner (on average under 0.6 times Mastery 1\'s flight)',G[1].X.spd===1.25&&G[1].X.turn===2&&G[1].hit===32&&G[1].age<G[0].age*.6,'M1 '+G[0].age.toFixed(2)+'s, M2 '+G[1].age.toFixed(2)+'s');
    ok('M2: longer, brighter trails (22 points, a brighter red at 0.68) and a sharper swoop; still 135% a needle',G[1].tr.length===32&&G[1].tr.every(m=>m.geometry.attributes.position.count===44&&m.material.color.getHex()===0xc8142a)&&G[1].X.trailA===.68&&G[1].X.swoop===1.25&&G[1].amt&&G[1].n===32,G[1].tr.length+' trails');}
  /* ---- M3 Bloodletting ---- */
  {const F=stage(0);BNM.dbg=[];log=[];spl=[];wrapHurt();wrapSpray();let L1=null;try{cast(3);run(9);L1=log.slice();log=[];cast(3);run(9);}finally{hurt=H0;sprayP=SP0;setL(0);}
    const b=D0()*1.08,bad=rampOk(b,.02,.2),L2=log;log=L1;const bad1=rampOk(b,.02,.2);
    ok('M3: on a lone foe, the k-th needle of the swarm strikes 2% harder for every needle already in it, up to 20% (from the 11th)',L1.length===32&&!bad1.length&&near(L1[0].amt,b)&&near(L1[10].amt,b*1.2)&&near(L1[31].amt,b*1.2)&&near(L1[5].amt,b*1.1),bad1.slice(0,4).join(' '));
    ok('M3: a new swarm starts again from its first needle',L2.length===32&&near(L2[0].amt,b)&&near(L2[31].amt,b*1.2),L2.length&&(L2[0].amt/b).toFixed(3));
    const sp=spl.filter((s,i)=>s.addv===1),dk=spl.filter(s=>s.addv===0);
    ok('M3: the hit spray thickens and darkens as they pile in (9 red and 5 dark sparks at first, 16 and 14 once ten are in)',sp.length===64&&sp[0].n===9&&dk[0].n===5&&sp[10].n===16&&dk[10].n===14&&sp[10].c===0xc0101e&&sp[0].c===0xff3040,sp.slice(0,12).map(s=>s.n).join(','));}
  {const F=stage(3);BNM.dbg=[];log=[];wrapHurt();try{cast(3);run(9);}finally{hurt=H0;setL(0);}
    const bad=rampOk(D0()*1.08,.02,.2);ok('M3: in a pack every foe\'s strikes ramp the same way, foe by foe (the needles still spread by the life left)',log.length===32&&!bad.length&&new Set(log.map(h=>h.e)).size===F.length,bad.slice(0,4).join(' '));}
  /* ---- M4 Patient Swarm ---- */
  {const G=[3,4].map(L=>{const F=stage(3);BNM.dbg=[];log=[];let c=null,far=0,glow=0,wa=null;wrapHurt();try{cast(L);c=ev('cast')[0];run(.3);far=away(F);run(1.4);glow=c.nd.filter(n=>n.w&&n.w.visible).length;wa=c.nd[0].w?c.nd[0].w.material.opacity:0;run(.3);back(F);run(9);}finally{hurt=H0;setL(0);}
      return{far,glow,wa,fi:ev('fire'),hit:ev('hit').length,lost:ev('lost').length,wait:ev('wait'),n:log.length};});
    /* (by 2s the hunt owes 14 needles: they rush out at about 32 a second while the hunt goes on at 8, so by 2.7s it has caught up with its old pace) */
    const r=R0()*1.25,late=G[1].fi.filter(f=>f.T>2),first=late.length?late[0].T:0,by=T=>G[1].fi.filter(f=>f.T<=T+1e-6).length;
    ok('M4: (the foes are moved out of every reach for 1.7s, from 0.3s to 2s)',G[0].far>r+.5,'farthest '+G[0].far.toFixed(2)+' reach '+r.toFixed(2));
    ok('M4: no needle leaves while no foe is in reach; they wait in the orbit, glowing',G[1].fi.every(f=>f.T<.3||f.T>2)&&G[1].wait.length===1&&G[1].glow===8&&G[1].wa>.2,G[1].glow+' glowing, '+G[1].wait.length+' wait');
    ok('M4: when the foes come back the waiting needles fly at once (about 32 a second) and all 32 strike',G[1].fi.length===32&&G[1].hit===32&&G[1].n===32&&first<2.1&&by(2.25)>=8&&by(2.25)<=12&&by(2.7)>=Math.floor((2.7-.35)*8)+1,'first '+first.toFixed(2)+'s; by 2.25s '+by(2.25)+', by 2.7s '+by(2.7));
    ok('M4: at Mastery 3 those needles are lost (the hunt skips them)',G[0].fi.length<=20&&G[0].fi.every(f=>f.T<.3||f.T>2),G[0].fi.length+' left the orbit');}
  {const G=[5.2,6.2].map(tb=>{const F=stage(3);BNM.dbg=[];log=[];const added=track();let c=null,inAt=[],dsp=[],ends=[];wrapHurt();
      try{cast(4);c=ev('cast')[0];const bM=c.nd[0].g.children[1].material,sM=c.nd[0].g.children[0].material;bM.addEventListener('dispose',()=>dsp.push(time));sM.addEventListener('dispose',()=>dsp.push(time));
        run(.3);away(F);run(tb-.3);back(F);for(let i=0;i<220;i++){run(.05);inAt.push(!!c.root.parent);}}finally{hurt=H0;scene.add=S0;setL(0);}
      const t0=ev('cast')[0].t;return{fi:ev('fire'),t0,dsp,end:Math.max(...ev('hit').map(h=>h.t),...ev('lost').map(h=>h.t)),rootT:tb+.05*inAt.indexOf(false),left:left(added)};});
    const a=G[0].fi.filter(f=>f.T>5),b=G[1].fi.filter(f=>f.T>1);
    ok('M4: needles wait up to 1.5s after the hunt\'s end (4.35s): foes back at 5.2s draw the waiting needles until 5.85s, and no later',a.length>=10&&a.every(f=>f.T<5.85+DT+1e-9)&&a[0].T<5.3,a.length+' flew, '+(a[0]?a[0].T.toFixed(2):'-')+'-'+(a.length?a[a.length-1].T.toFixed(2):'-'));
    ok('M4: foes back only at 6.2s draw none; the orbit fades out by 6.5s and nothing is left behind',!b.length&&G[1].rootT<=6.55&&G[0].left===0&&G[1].left===0,'orbit gone by '+G[1].rootT.toFixed(2)+'s, left '+G[0].left+'/'+G[1].left);
    ok('M4: the needles\' shared body and sheen are freed only after the last needle is gone',G[0].dsp.length===2&&G[0].dsp.every(t=>t>=G[0].end)&&G[1].dsp.length===2,G[0].dsp.map(t=>(t-G[0].t0).toFixed(2)).join(',')+' last needle '+(G[0].end-G[0].t0).toFixed(2));}
  /* ---- M5 Crimson Halo ---- */
  {const F=stage(3),B=F[3];B.hp=B.maxHp=5e7;BNM.dbg=[];log=[];const added=track();let c=null,orb=null,rt=[],bl=[],nd=0;wrapHurt();
    try{cast(5);c=ev('cast')[0];orb=c.nd[0].g.parent;const bm=orb.children.find(m=>m.isMesh&&m.material&&m.material.fragmentShader===BN_BLUR_FS);nd=c.nd.length;
      for(let i=0;i<120;i++){const r0=orb.rotation.y;run(.05);rt.push((orb.rotation.y-r0)/.05);bl.push(bm?bm.material.uniforms.uA.value:-1);}run(6);}finally{hurt=H0;scene.add=S0;setL(0);}
    const fi=ev('fire'),one=fi.filter(f=>!f.halo),hf=fi.filter(f=>f.halo),H=ev('halo')[0];
    ok('M5: the orbit fills to 12 needles (8 before)',nd===12&&c.N===12,nd);
    ok('M5: 24 needles leave one by one by 3.35s, at the hunt\'s old pace (one every 1/8 s)',one.length===24&&one.every((f,n)=>f.T>=.35+n/8-1e-6&&f.T<=.35+n/8+DT+1e-6),one.length);
    ok('M5: at 3.85s every needle still circling (12) looses at once at the strongest foe',H&&H.n===12&&H.T>=3.85-1e-6&&H.T<=3.85+DT+1e-6&&hf.length===12&&hf.every(f=>f.e===B&&f.T===H.T),H&&(H.n+' at '+H.T.toFixed(2)+' on the strongest: '+hf.every(f=>f.e===B)));
    ok('M5: 36 needles in all strike (32 before), each by Bloodletting\'s ramp',log.length===36&&!rampOk(D0()*1.08,.02,.2).length&&log.filter(h=>h.e===B).length>=12,log.length);
    const spinHunt=mean(rt.slice(30,50)),spinWind=Math.max(...rt.slice(68,77)),blHunt=mean(bl.slice(30,50)),blWind=Math.max(...bl.slice(68,77)),blAfter=bl[82];
    ok('M5: the orbit spins faster, and to a blur as the halo gathers (its streaks of light brightest just before it looses, gone just after)',spinHunt>5&&spinWind>12&&blHunt>.2&&blHunt<.4&&blWind>.85&&blAfter<.25,'spin '+spinHunt.toFixed(1)+' / '+spinWind.toFixed(1)+' rad/s, blur '+blHunt.toFixed(2)+' / '+blWind.toFixed(2)+' / '+blAfter.toFixed(2));
    ok('M5: thicker blood smoke; Masteries 1-4 ride it; nothing left behind',ev('opts')[0].X.smoke===1.8&&ev('opts')[0].X.smokeS===1.25&&ev('opts')[0].X.wait===1.5&&ev('opts')[0].X.turn===2&&left(added)===0,left(added)+' left');}
  /* the halo waits for prey too (Mastery 4) */
  {const F=stage(3);BNM.dbg=[];log=[];let c=null,gl=0;wrapHurt();try{cast(5);c=ev('cast')[0];run(3);away(F);run(1.4);gl=c.nd.filter(n=>n.w&&n.w.visible).length;run(.2);back(F);run(8);}finally{hurt=H0;setL(0);}
    const H=ev('halo')[0];
    ok('M5: with no foe in reach the circling needles wait for one, glowing, and loose as one comes (before 5.35s), all 12 of them',H&&H.T>4.6&&H.T<5.1&&H.n===12&&gl===12&&ev('fire').length===36&&log.length===36,H&&(H.n+' at '+H.T.toFixed(2)+', '+gl+' glowing, '+log.length+' strikes'));}
  /* ---- the rest ---- */
  {const F=stage(3);BNM.dbg=[];log=[];setL(5);wrapHurt();try{castScrollNow('bloodneedles',heroU,heroStats(),F.slice(),100,oC({smx:true}));run(10);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast (an echo) are the old cast',!BNM.dbg.length&&log.length===32&&log.every(h=>near(h.amt,D0())),log.length);}
  {const e0=errs;const bad=[];for(let L=0;L<=5;L++){const F=stage(3);meta.spells.bloodneedles=meta.spells.bloodneedles||{lvl:1,hero:null};setL(L);const lv=meta.spells.bloodneedles.lvl||1,s=tStats(heroU),P=scrollPow(heroU,'bloodneedles',s,lv),n0=s.dmg*1.25*P/(s.spellP||s.dmg)*(L?1.08:1);
      heroU.scd={};heroU.gcd=0;BNM.dbg=[];log=[];wrapHurt();try{fireScroll(heroU,'bloodneedles',heroStats(),F.slice());run(12);}finally{hurt=H0;}
      const o=ev('opts')[0],mn=Math.min(...log.map(h=>h.amt));if((L?!o||o.L!==L:!!o)||!near(mn,n0,1e-9)||log.length!==(L===5?36:32))bad.push(L+':'+(o?o.L:'-')+'/'+(P/100).toFixed(3)+'/'+log.length);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive; a needle strikes 125% or 135% of the hero\'s attack with the factor; 32 or 36 strikes) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;sprayP=SP0;BNM.dbg=null;window.__fz=false;try{for(const f of fx.slice())f.life=0;updFx(.01);resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
