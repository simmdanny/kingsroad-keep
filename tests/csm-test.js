(function(){
/* Constellation's masteries (v470). Run on the dev page: __kk.ev(await (await fetch('/tests/csm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand on the road round the point nearest the hero (a few walk, where a row says so); the game is stepped (update and updFx, 0.05s a
   step) and hurt is wrapped to log every amount Constellation strikes for (the cast's power is 100: a lance strikes 1000, 1100 from Mastery 1).
   What each figure should strike is worked out here from the foes' places with the spell's own rules (the strongest within reach of the
   densest foe, chained nearest first; a lance on each, its splash round it, the lines between the impacts), and compared foe by foe with what
   it struck. Every mastered cast logs its options, each figure, each hold, each fall, each burn, the second figure and each figure's end
   (CSM.dbg). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,RF0=ringFx,NL0=nsLance,CI0=csImpact;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const DT=.05,run=s=>{for(let i=0;i<Math.round(s/DT);i++){heroU&&(heroU.cd=1e9);update(DT);updFx(DT);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;darkTarget=0;vigTarget=0;__kk.camXZ(camTarget.x,camTarget.z,1);scene.updateMatrixWorld(true);}
/* the road point nearest the hero (more than 1.2 tiles off) */
function mid(){const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;}
/* (no gem or scroll carriers: a carrier twinkles every 0.18s, and the twinkles still alive when a trial ends would count as left behind) */
function foe(d,hp,off,spd){const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.2,d));e.off=off||0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.shield=0;e.spd=spd||0;moveEnemy(e,0);return e;}
/* n foes gap apart round the middle, the k-th a little stronger than the one before (so who is strongest is known) */
let D0=0;const stage=(n,gap,offs,spd)=>{go();D0=mid();const F=[];for(let i=0;i<n;i++)F.push(foe(D0+(i-(n-1)/2)*gap,1e7+i*1e3,offs?offs[i%offs.length]:0,spd));return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.constellation=SM_XP[L-1];else delete meta.smast.constellation;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'light',anc:true,spell:'constellation'},x||{});
const cast=(L,list,x)=>{setL(L);castScrollNow('constellation',heroU,heroStats(),list||enemies.filter(e=>!e.dead),100,oC(x));};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){if(o&&o.spell==='constellation')log.push({e,amt,t:time});return H0.apply(this,arguments);};};
/* (the impacts' flat rings: ringFx at 0.08 high, 1 wide; the mastered cast's own flourish under the hero is a ring too) */
let rings=0,lances=[],cols=[];const wrapFx=()=>{rings=0;lances=[];cols=[];ringFx=function(x,y,z,r){if(y===.08&&r===1)rings++;return RF0.apply(this,arguments);};nsLance=function(x0,y0,z0,tx,tz,w){lances.push(w||1);return NL0.apply(this,arguments);};csImpact=function(x,z,R){cols.push(R);return CI0.apply(this,arguments);};};
const unwrap=()=>{hurt=H0;scene.add=S0;ringFx=RF0;nsLance=NL0;csImpact=CI0;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-9)*Math.max(1,Math.abs(b));
const ev=n=>CSM.dbg.filter(d=>d.ev===n);
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const dbgX=x=>Object.assign({log:d=>{d.t=time;CSM.dbg.push(d);}},x||{});
/* what one figure strikes, from the foes' places now (D: its numbers, P: its power) */
function expectFig(list,D,P){const pool=enemies.filter(e=>!e.dead&&!e.fake),cand=list.filter(e=>!e.fake&&!e.dead),c=cand.length?densest(cand):densest(pool);
  const T=pool.filter(e=>(e.x-c.x)**2+(e.z-c.z)**2<D.R*D.R).sort((a,b)=>nsStrong(b)-nsStrong(a)).slice(0,D.N);
  const ord=[T[0]],rest=T.slice(1);while(rest.length){const l=ord[ord.length-1];let bi=0,bd=1e9;rest.forEach((e,i)=>{const d=(e.x-l.x)**2+(e.z-l.z)**2;if(d<bd){bd=d;bi=i;}});ord.push(rest.splice(bi,1)[0]);}
  const tot=new Map(),add=(e,v)=>tot.set(e,(tot.get(e)||0)+v);let burnt=0;
  for(const e of ord){add(e,P*D.lance);for(const q of pool)if(q!==e&&(q.x-e.x)**2+(q.z-e.z)**2<D.spl*D.spl)add(q,P*D.splK);}
  for(const q of pool){let b=false;for(let i=0;i<ord.length-1;i++)if(nsSegDist(q.x,q.z,ord[i].x,ord[i].z,ord[i+1].x,ord[i+1].z)<D.lineW)b=true;if(b){add(q,P*D.line);burnt++;}}
  return{tot,ord,burnt,n:ord.length+[...tot.keys()].length};}
/* the logged strikes summed foe by foe against what was expected; the foes whose totals differ */
const diff=(L,tot)=>{const got=new Map();for(const h of L)got.set(h.e,(got.get(h.e)||0)+h.amt);const bad=[];for(const [e,v] of tot)if(!near(got.get(e)||0,v,1e-9))bad.push(enemies.indexOf(e)+':'+(got.get(e)||0).toFixed(1)+'/'+v.toFixed(1));for(const [e,v] of got)if(!tot.has(e))bad.push(enemies.indexOf(e)+':'+v.toFixed(1)+'/0');return bad;};
const M0D={N:7,R:9,lance:10,spl:.6,splK:.6,line:2,lineW:.55},mD=L=>Object.assign({},M0D,L>=1?{lance:11,spl:.8}:{},L>=2?{N:8,R:10}:{},L>=3?{line:2.5,lineW:.75}:{});
const OFFS=[0,.3,-.3,.62,0,-.62,.15,-.15,.7,0,-.4,.4];
try{
  /* ---- the card ---- */
  ok('the five masteries: Brighter Stars, A Larger Figure, Burning Lines, Fixed Stars, The Sky Falls Twice (v470)',SM_D.constellation.map(x=>x.n).join('|')==='Brighter Stars|A Larger Figure|Burning Lines|Fixed Stars|The Sky Falls Twice',SM_D.constellation.map(x=>x.n).join('|'));
  const d=i=>smDesc('constellation',i);
  ok('the numbers on the card are the ones in the code (1100%, 0.8 tiles; 8 stars, 10 tiles; 250%, 0.75 tiles, 2s; held, bosses slowed 50%; a second fall at 12%)',
    /1100%/.test(d(0))&&/1000% before/.test(d(0))&&/0\.8 tiles/.test(d(0))&&/0\.6 before/.test(d(0))&&/8 strongest/.test(d(1))&&/7 before/.test(d(1))&&/10 tiles/.test(d(1))&&/9 before/.test(d(1))
    &&/250%/.test(d(2))&&/200% before/.test(d(2))&&/0\.75 tiles/.test(d(2))&&/0\.55 before/.test(d(2))&&/2s/.test(d(2))&&/slowed 50%/.test(d(3))&&/12%/.test(d(4))
    &&CSM.lance===11&&CSM.spl===.8&&CSM.N===8&&CSM.R===10&&CSM.line===2.5&&CSM.lineW===.75&&CSM.alight===2&&CSM.bossSlow===.5&&CSM.twice===.12&&CSM.twTs===.6,d(4));
  ok('no hooks of their own (the masteries live in the cast); calibrated with hidden factors',!SMF.constellation.hit&&!SMF.constellation.cast&&SMA.constellation.every(x=>x===1)&&SMG.constellation.length===5&&SMG.constellation.every(x=>x>=.9&&x<=1.1),SMG.constellation.join());
  ok('no mastered cast strikes weaker than Mastery 0 (a lance 1100% times the factor, at least 1000%; the lines 250% times it, at least 200%)',SMG.constellation.every(g=>11*g>=10)&&SMG.constellation.slice(2).every(g=>2.5*g>=2),SMG.constellation.map(g=>(11*g).toFixed(2)).join());
  ok('the defaults table is the old cast (7 stars within 9 tiles; 1000%, 60% within 0.6; the lines 200% within 0.55, at once; no hold, no second figure; the old looks)',
    CSL.N===7&&CSL.R===9&&CSL.lance===10&&CSL.spl===.6&&CSL.splK===.6&&CSL.line===2&&CSL.lineW===.55&&!CSL.alight&&!CSL.late&&!CSL.hold&&!CSL.twice&&CSL.ts===1&&!CSL.second&&CSL.starK===1&&!CSL.white&&CSL.flK===1&&CSL.lanceW===1&&!CSL.col&&!CSL.streak&&!CSL.pulse&&!CSL.log);
  /* (a first step of the world builds a few pieces of the board that stay; they are not the spell's) */
  stage(3,.5);run(.5);
  /* ---- Mastery 0 ---- */
  let M0log=null;
  {const F=stage(12,.5,OFFS);CSM.dbg=[];log=[];const added=track();wrapFx();wrapHurt();let E=null;
    try{E=expectFig(F,M0D,100);cast(0,F.slice());run(6);}finally{unwrap();}
    M0log=log.map(h=>[F.indexOf(h.e),h.amt,+(h.t-log[0].t).toFixed(3)]);
    const bad=diff(log,E.tot);
    ok('Mastery 0: 7 lances of 1000% on the 7 strongest, 60% round each within 0.6, 200% once to every foe within 0.55 of a line, foe by foe',E.ord.length===7&&log.filter(h=>h.amt===1000).length===7&&!bad.length,bad.slice(0,4).join(' ')+' '+log.length+' strikes');
    ok('Mastery 0: flat rings at the impacts (7), no columns, the old lances; no mastery events; nothing left behind',
      rings===7&&!cols.length&&lances.length===7&&lances.every(w=>w===1)&&!CSM.dbg.length&&left(added)===0,'rings '+rings+' columns '+cols.length+' left '+left(added));}
  /* the defaults given as options (only a log added) are the same cast, strike for strike */
  {const F=stage(12,.5,OFFS);CSM.dbg=[];log=[];const added=track();let c=null,ends=[];try{setL(0);wrapHurt();castConstellation(heroU,F.slice(),100,oC(),dbgX());c=ev('cast')[0];run(6);}finally{unwrap();}
    const L2=log.map(h=>[F.indexOf(h.e),h.amt,+(h.t-log[0].t).toFixed(3)]),fa=ev('fall');
    ok('the defaults as options: the same strikes, foe by foe and frame by frame, as Mastery 0',JSON.stringify(L2)===JSON.stringify(M0log),L2.length+' / '+M0log.length);
    ok('the defaults: 7 stars kindled from 0.15s, one every 0.14s; they fall from 2.2s, one every 0.06s; the figure ends at 5s; nothing left behind',
      c&&c.N===7&&c.stars.every((s,i)=>near(s.born,.15+i*.14))&&fa.length===7&&fa.every((f,i)=>f.T>=2.2+i*.06-1e-9&&f.T<2.2+i*.06+DT+1e-6)&&ev('end').length===1&&ev('end')[0].T>=5-1e-9&&ev('end')[0].T<5+DT+1e-6&&!ev('hold').length&&!ev('twice').length&&left(added)===0,
      fa.map(f=>f.T.toFixed(2)).join(',')+' end '+(ev('end')[0]&&ev('end')[0].T.toFixed(2)));}
  /* ---- M1 Brighter Stars ---- */
  {const F=stage(12,.5,OFFS);CSM.dbg=[];log=[];const added=track();wrapFx();wrapHurt();let E=null,sc=[],c=null,fg=null,col=null;
    try{E=expectFig(F,mD(1),100);cast(1,F.slice());c=ev('cast')[0];run(1.5);sc=c.stars.map(s=>s.g.scale.x);fg=c.stars[0].fl.children[0].geometry.parameters;col=[c.stars[0].g.children[0].material.color.getHex(),c.stars[0].h.material.color.getHex()];
      run(.85);const cm=added.filter(o=>o.isGroup&&o.children.length===2&&o.children[0].geometry===csColGeo());col.push(cm.length,cm.length&&cm[0].children[1].geometry===csWallGeo());run(4);}finally{unwrap();}
    const bad=diff(log,E.tot),X=ev('opts')[0].X;
    ok('M1: each lance strikes 1100% (1000% before) and 60% to the foes within 0.8 of its foe (0.6 before), foe by foe',log.filter(h=>h.amt===1100).length===7&&!log.some(h=>h.amt===1000)&&!bad.length,bad.slice(0,4).join(' '));
    /* (at 1.5s every star has kindled and none is glowing up yet: Mastery 0's stars are drawn at 1, these at 1.25) */
    ok('M1: the stars a quarter larger and whiter (a white core, a whiter halo), the flares longer (0.68, 0.62 before), the lances half again as thick',sc.every(x=>near(x,1.25,1e-6))&&col[0]===0xffffff&&col[1]===0x6c98ff&&near(fg.width,.62*1.1,1e-9)&&lances.length===7&&lances.every(w=>w===1.5),sc[0].toFixed(3)+' flare '+fg.width.toFixed(3)+' '+lances.join());
    ok('M1: every impact a rising column of light in a low wall racing out to 0.8 (7), no flat rings; nothing left behind',cols.length===7&&cols.every(r=>r===.8)&&rings===0&&col[2]>=1&&col[3]===true&&left(added)===0,'columns '+cols.length+' in the scene '+col[2]+' rings '+rings+' left '+left(added));
    ok('M1: nothing else (7 stars, the old lines and reach, no hold, no second figure)',c.N===7&&!X.N&&!X.line&&!X.hold&&!X.twice&&!ev('hold').length&&!ev('twice').length);}
  /* ---- M2 A Larger Figure ---- */
  {const G=[1,2].map(L=>{const F=stage(12,.5,OFFS),c0=densest(F),R=ROUTES[0];let fd=-1,fq=0;for(let dd=0;dd<R.len;dd+=.05){const p=posAt(dd,R),q=Math.hypot(p[0]-c0.x,p[1]-c0.z);if(q>9.25&&q<9.75){fd=dd;fq=q;break;}}
      const far=fd>=0?foe(fd,9e7):null;CSM.dbg=[];log=[];let E=null,c=null;wrapHurt();try{E=expectFig(F,mD(L),100);cast(L,F.concat(far?[far]:[]));c=ev('cast')[0];run(6);}finally{unwrap();}
      return{fq,far,c,E,bad:diff(log,E.tot),lines:c?c.stars.length-1:0};});
    ok('M2: (a strongest foe stands 9.25-9.75 tiles from the densest foe)',G[0].far&&G[1].far,G[0].fq.toFixed(2));
    ok('M2: the figure reaches it (within 10 tiles); at Mastery 1 it does not (within 9)',G[1].c.T.includes(G[1].far)&&!G[0].c.T.includes(G[0].far),'M1 '+G[0].c.T.includes(G[0].far)+' M2 '+G[1].c.T.includes(G[1].far));
    ok('M2: 8 stars and 7 lines (7 and 6 before), kindled the same way (one every 0.14s), each striking as expected',G[1].c.N===8&&G[0].c.N===7&&G[1].lines===7&&G[1].c.stars.every((s,i)=>near(s.born,.15+i*.14))&&!G[1].bad.length&&!G[0].bad.length,G[1].bad.slice(0,3).join(' ')+' | '+G[0].bad.slice(0,3).join(' '));}
  /* ---- M3 Burning Lines ---- */
  /* (one weak foe more, placed 0.6-0.7 off the nearest line: the old reach misses it, the wider one does not) */
  {const G=[2,3].map(L=>{const F=stage(12,.5,OFFS),X=foe(ROUTES[0].len-.3,1e6,0);let xo=null;{const o=expectFig(F,mD(2),100).ord;
        for(let k=0;k<F.length-1&&xo==null;k++)for(let off=-1;off<=1;off+=.01){X.dist=(F[k].dist+F[k+1].dist)/2;X.off=off;moveEnemy(X,0);let m=1e9;for(let i=0;i<o.length-1;i++)m=Math.min(m,nsSegDist(X.x,X.z,o[i].x,o[i].z,o[i+1].x,o[i+1].z));if(m>.6&&m<.7){xo=m;break;}}}
      CSM.dbg=[];log=[];const added=track();let E=null,st=[],bands=0,a19=-1,a21=-1;wrapHurt();
      try{E=expectFig(F.concat([X]),mD(L),100);cast(L,F.slice());const t0=time;while(!ev('burn').length&&time-t0<4)run(.05);st=added.filter(o=>o.isMesh&&o.renderOrder===3);bands=st.reduce((n,m)=>n+m.children.filter(c=>c.material&&c.material.fragmentShader===CS_BAND_FS).length,0);
        const alive=()=>st.filter(m=>m.parent).length;run(1.85);a19=alive();run(.25);a21=alive();run(3);}finally{unwrap();}
      return{E,X,xo,xb:log.some(h=>h.e===X&&h.amt===100*mD(L).line),bad:diff(log,E.tot),burn:ev('burn'),st,bands,a19,a21,left:left(added)};});
    ok('M3: the lines strike 250% (200% before) to every foe within 0.75 of them (0.55 before), once each, foe by foe',!G[1].bad.length&&!G[0].bad.length&&G[1].burn.every(b=>!b.late)&&new Set(G[1].burn.map(b=>b.e)).size===G[1].burn.length,G[1].bad.slice(0,4).join(' '));
    ok('M3: wider: a foe 0.6-0.7 off the nearest line burns now and did not before',G[0].xo!=null&&G[1].xb&&!G[0].xb&&G[1].burn.length===G[1].E.burnt&&G[1].E.burnt===G[0].E.burnt+1,(G[0].xo!=null?G[0].xo.toFixed(2)+' off':'not placed')+'; M2 '+G[0].E.burnt+' burnt, M3 '+G[1].E.burnt);
    ok('M3: the streaks stay alight 2s (1.3s before), a band of light rising off each',G[1].st.length===7&&G[1].bands===7&&G[1].a19===7&&G[1].a21===0&&G[0].bands===0&&G[0].a19===0,'M3 '+G[1].st.length+' streaks, '+G[1].bands+' bands, '+G[1].a19+' alight at 1.9s, '+G[1].a21+' at 2.1s; M2 '+G[0].a19+' at 1.9s');
    ok('M3: nothing left behind',G[0].left===0&&G[1].left===0,G[0].left+'/'+G[1].left);}
  /* stepping onto a burning line */
  {const F=stage(8,.5),X=[0,1,2,3].map(i=>foe(ROUTES[0].len-.3,1e6,0));CSM.dbg=[];log=[];const sd=e=>{const m=Math.round(F.length/2);e.dist=(F[m-1].dist+F[m].dist)/2;};let T0=0;wrapHurt();
    try{cast(3,F.slice());run(2.8);T0=ev('burn')[0].t;
      /* X1 steps onto a line about 1.2s after they burn; X2 only at about 2.5s, when they are out */
      run(.45);sd(X[2]);X[2].off=.95;moveEnemy(X[2],0);sd(X[3]);X[3].off=.95;moveEnemy(X[3],0);run(.05);
      /* X3 crosses a line in one step (0.95 one side to 0.95 the other: neither end within 0.75); X4 steps further off the same side */
      X[2].off=-.95;X[3].off=1.6;run(.05);run(.45);sd(X[0]);moveEnemy(X[0],0);run(.1);run(1.2);sd(X[1]);moveEnemy(X[1],0);run(.3);
      /* the foe burnt at 1s steps off and back on: not again */
      X[0].off=1.6;run(.1);X[0].off=0;run(.1);}finally{unwrap();setL(0);}
    const b=ev('burn'),lb=b.filter(x=>x.late),hx=i=>log.filter(h=>h.e===X[i]);
    ok('M3: a foe stepping onto a line while it burns is burnt (250%), once',lb.some(x=>x.e===X[0])&&hx(0).length===1&&near(hx(0)[0].amt,250)&&hx(0)[0].t-T0>.9&&hx(0)[0].t-T0<1.4,hx(0).map(h=>h.amt+'@'+(h.t-T0).toFixed(2)).join());
    ok('M3: not once the lines are out (after 2s)',!hx(1).length&&!lb.some(x=>x.e===X[1]),hx(1).length);
    ok('M3: a foe carried across a line in one long step is burnt (its path is checked in steps of 0.15 tiles); one stepping away from it is not',hx(2).length===1&&near(hx(2)[0].amt,250)&&!hx(3).length,'crossed '+hx(2).length+', stepped away '+hx(3).length);
    ok('M3: a foe the lines burnt at once is not burnt again',F.every(e=>log.filter(h=>h.e===e&&h.amt===250).length<=1)&&b.filter(x=>!x.late).length>=6,b.filter(x=>!x.late).length+' at once, '+lb.length+' later');}
  /* ---- M4 Fixed Stars ---- */
  {const G=[3,4].map(L=>{const F=stage(8,1,null,.5),B=F[7];B.boss=true;CSM.dbg=[];log=[];let c=null,dk=[],hs=[];wrapHurt();
      /* (each foe's place on the road when its star kindles and when it falls) */
      try{cast(L,F.slice());c=ev('cast')[0];const st=c.stars;const at=new Map(),fd=new Map();for(let i=0;i<60;i++){run(.05);const T=time-c.t;for(const s of st){if(!at.has(s)&&T>=s.born)at.set(s,{d:s.e.dist,t:T});if(!fd.has(s)&&ev('fall').some(q=>q.i===s.i))fd.set(s,s.e.dist);}if(i===30)hs=st.map(s=>[s.h.scale.x,s.h.material,s.e.boss]);}
        const fa=ev('fall');for(const s of st){const f=fa.find(q=>q.i===s.i),a=at.get(s);dk.push({e:s.e,i:s.i,boss:!!s.e.boss,dd:fd.get(s)-a.d,dt:f.T-a.t,fallD:s.e.dist});}run(.4);for(const q of dk)q.after=q.e.dist-q.fallD;}finally{unwrap();setL(0);}
      return{c,dk,hs,hold:ev('hold')};});
    const [g3,g4]=G,nb=g4.dk.filter(q=>!q.boss),bo=g4.dk.find(q=>q.boss);
    ok('M4: every non-boss foe under a star stands still from its kindling until its star falls (about 1.5-2s), then walks on',nb.length===7&&nb.every(q=>Math.abs(q.dd)<1e-9&&q.dt>1.4&&q.dt<2.15&&q.after>.05),nb.map(q=>q.dd.toFixed(3)+'/'+q.dt.toFixed(2)).join(' '));
    ok('M4: held as long as its star takes to fall (stunT set directly: fall time - kindling + 0.05)',g4.hold.length===8&&g4.hold.filter(h=>!h.boss).every(h=>near(h.sec,2.2+h.i*.06-h.T+.05,1e-6)),g4.hold.map(h=>h.sec.toFixed(2)).join());
    ok('M4: the boss is not held but slowed 50%: it walks half as far meanwhile',bo&&bo.dd>0&&near(bo.dd,.5*.5*bo.dt,.15)&&g4.hold.find(h=>h.boss),bo&&(bo.dd.toFixed(3)+' tiles in '+bo.dt.toFixed(2)+'s'));
    ok('M4: at Mastery 3 the foes walk on under their stars',g3.dk.every(q=>q.dd>.3)&&!g3.hold.length,g3.dk.map(q=>q.dd.toFixed(2)).join());
    ok('M4: the halo tightens and pulses over a held foe (its own brighter halo), a little less over the slowed boss',g4.hs.filter(h=>!h[2]).every(h=>h[0]<.8&&h[0]>.5&&h[1]===g4.hs.find(x=>!x[2])[1])&&g4.hs.filter(h=>h[2]).every(h=>h[0]>.75&&h[0]<.93&&h[1]!==g4.hs.find(x=>!x[2])[1])&&g3.hs.every(h=>h[0]===1),g4.hs.map(h=>h[0].toFixed(2)).join());}
  /* ---- M5 The Sky Falls Twice ---- */
  {const F=stage(9,.5,OFFS),top=F[8];CSM.dbg=[];log=[];const added=track();let E1=null,E2=null,tw=null,dk=[],busy=[],ends=[];wrapHurt();const busyF=SMPV_BUSY.find(f=>String(f).indexOf('csFig')>=0)||(()=>false);
    try{E1=expectFig(F,mD(5),100);cast(5,F.slice());const t0=time;
      /* the strongest foe falls just after the first figure (before the second kindles) */
      while(!ev('burn').length&&time-t0<4)run(.05);removeEnemy(top);run(.05);
      while(!ev('twice').length&&time-t0<5)run(.05);E2=expectFig(F,mD(5),12);
      for(let i=0;i<100;i++){run(.05);if(i%10===9){dk.push(+darkTarget.toFixed(3));busy.push(busyF()?1:0);}}}finally{unwrap();setL(0);}
    const C=ev('cast'),c1=C[0],c2=C[1],w=ev('twice')[0],b1=ev('burn').filter(b=>b.T<2.9&&b.t<w.t),fall2=ev('fall').filter(f=>f.t>w.t),E=ev('end'),L1=log.filter(h=>h.t<w.t),L2=log.filter(h=>h.t>w.t);
    ok('M5: the first figure as at Mastery 4 (8 lances of 1100%, foe by foe)',!diff(L1,E1.tot).length&&L1.filter(h=>h.amt===1100).length===8,diff(L1,E1.tot).slice(0,3).join(' '));
    ok('M5: 0.25s after its lines burn, the figure kindles again (a second one, and only one)',C.length===2&&!c1.second&&c2.second&&w&&near(w.t-ev('burn')[0].t,.25,.21),C.length+' figures, '+(w&&(w.t-ev('burn')[0].t).toFixed(2))+'s after the burn');
    ok('M5: over the strongest foes still standing (the fallen strongest is not among them; the next one is)',top.dead&&!c2.T.includes(top)&&c2.T.includes(F[0])&&!c1.T.includes(F[0])&&c2.N===8,c2.N+' stars');
    ok('M5: drawn faster (kindled one every 0.084s from 0.09s, falling from 1.32s, one every 0.036s)',c2.stars.every((s,i)=>near(s.born,(.15+i*.14)*.6))&&fall2.length===8&&fall2.every((f,i)=>f.T>=1.32+i*.036-1e-9&&f.T<1.32+i*.036+DT+1e-9),fall2.map(f=>f.T.toFixed(2)).join(','));
    ok('M5: and falls at 12% of the power (lances 132, splash 7.2, lines 30), foe by foe',!diff(L2,E2.tot).length&&L2.filter(h=>near(h.amt,132)).length===8&&L2.length>8,diff(L2,E2.tot).slice(0,3).join(' ')+' '+L2.length);
    ok('M5: the sky stays dark between the two figures and clears after the second',dk[0]===.45&&dk[1]===.45&&dk[dk.length-1]===0,dk.join(','));
    /* (the cast's cineLock covers 4s from its start and 2.4s from the second figure's: it runs past both, so the preview waits for it) */
    ok('M5: the cast outlives its cineLock and the mastery preview waits for it (SMPV_BUSY) until the second figure ends',E.length===2&&E[1].second&&E[1].t-c1.t>Math.max(4,w.t-c1.t+2.4)+.5&&busy.slice(0,5).every(x=>x===1)&&busy[busy.length-1]===0,(E[1]&&(E[1].t-c1.t).toFixed(2))+'s, busy '+busy.join(''));
    ok('M5: nothing left behind',left(added)===0,left(added));}
  {const F=stage(1,.5);CSM.dbg=[];log=[];wrapHurt();try{cast(5,F.slice());run(8);}finally{unwrap();setL(0);}
    ok('M5: on a lone foe, a star and then a second star: 1100% and 132%',ev('cast').length===2&&ev('cast').every(c=>c.N===1)&&log.length===2&&near(log[0].amt,1100)&&near(log[1].amt,132),log.map(h=>h.amt).join());}
  {const F=stage(1,.5);F[0].hp=F[0].maxHp=50;CSM.dbg=[];log=[];let dk=0;wrapHurt();try{cast(5,F.slice());run(5);dk=darkTarget;run(1);}finally{unwrap();setL(0);}
    ok('M5: with no foe left standing there is no second figure, and the sky clears as before',ev('cast').length===1&&!ev('twice').length&&dk<.2&&darkTarget===0,ev('cast').length+' figure, dark '+dk.toFixed(2));}
  /* ---- the rest ---- */
  {const F=stage(12,.5,OFFS);CSM.dbg=[];log=[];setL(5);wrapHurt();let E=null;try{E=expectFig(F,M0D,100);castScrollNow('constellation',heroU,heroStats(),F.slice(),100,oC({smx:true}));run(7);}finally{unwrap();setL(0);}
    ok('casts that are not a mastered scroll cast (an echo) are the old cast',!CSM.dbg.length&&!diff(log,E.tot).length&&log.filter(h=>h.amt===1000).length===7,log.length);}
  {const e0=errs;const bad=[];for(let L=0;L<=5;L++){const F=stage(9,.5,OFFS);meta.spells.constellation=meta.spells.constellation||{lvl:1,hero:null};setL(L);const lv=meta.spells.constellation.lvl||1,P=scrollPow(heroU,'constellation',tStats(heroU),lv);
      heroU.scd={};heroU.gcd=0;CSM.dbg=[];log=[];wrapHurt();try{fireScroll(heroU,'constellation',heroStats(),F.slice());run(12);}finally{hurt=H0;}
      const o=ev('opts')[0],mx=Math.max(...log.map(h=>h.amt)),nl=log.filter(h=>near(h.amt,P*(L?11:10))).length;if((L?!o||o.L!==L:!!o)||!near(mx,P*(L?11:10))||nl!==(L>=2?8:7)||(L===5)!==(ev('cast').length===2))bad.push(L+':'+(o?o.L:'-')+'/'+(P/100).toFixed(3)+'/'+nl);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive; each lance strikes 1000% or 1100% of the power with the factor; 7 or 8 of them; a second figure at Mastery 5) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;unwrap();CSM.dbg=null;window.__fz=false;try{for(const f of fx.slice())f.life=0;updFx(.01);resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;darkTarget=0;vigTarget=0;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
