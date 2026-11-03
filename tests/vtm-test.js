(function(){
/* Vael'Thoruun's masteries (v458). Run on the dev page: __kk.ev(await (await fetch('/tests/vtm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand (or walk) on a straight stretch of road; the game is stepped (update and updFx). vHit (every strike, arc and blast of the storm)
   is wrapped to note where it struck, how far, for how much and which foes stood in its reach at that moment, and hurt to log what each of
   them took (the scroll's power is 100: a strike 150, an arc 82.5, the network 60 a tick, the final strike 900, the crater 25), so the
   foes every hit should strike, and for how much, are checked exactly at every mastery, Mastery 0 too (which logs nothing). The storm's own
   events (VTM.dbg) give its bursts, arcs, network and re-centring. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,V0=vHit,Z0=zap,E0=emit,DB0=VTM.dbg,TH0=ART_TH;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
let onStep=null;const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);if(onStep)onStep();}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;cineLock=0;
  /* a straight stretch of road 6 tiles long with 9 more ahead (for the walkers), nearest the hero */
  const R=ROUTES[0];let d0=null,bd=1e9;for(let d=1;d<R.len-16;d+=.25){const A=posAt(d,R),B=posAt(d+6,R);let dev=0;for(let k=1;k<12;k++){const p=posAt(d+k*.5,R),t2=k/12;dev=Math.max(dev,Math.hypot(p[0]-(A[0]+(B[0]-A[0])*t2),p[1]-(A[1]+(B[1]-A[1])*t2)));}
    if(dev<.06){const m=posAt(d+3,R),q=Math.hypot(m[0]-heroU.x,m[1]-heroU.z);if(q<bd){bd=q;d0=d;}}}
  return{R,d0:d0==null?2:d0};}
function foe(R,d,off,hp){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d;e.off=off||0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
/* fourteen foes 0.4 apart (all inside the storm's area, more than the old network's ten), or eight walkers 0.35 apart */
const stage=walk=>{const G=go(),F=[];if(walk)for(let i=0;i<8;i++){const e=foe(G.R,G.d0+i*.35,(i%3-1)*.12);e.spd=.7;F.push(e);}else for(let i=0;i<14;i++)F.push(foe(G.R,G.d0+.4+i*.4,(i%3-1)*.15));return{G,F};};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.vael=SM_XP[L-1];else delete meta.smast.vael;};
const oV=()=>({src:heroU,bane:0,el:'lightning',anc:false,spell:'vael'});
const cast=L=>{setL(L);castScrollNow('vael',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oV());};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
/* the logs: vHit calls (VL) with the foes in reach and what each took; every other hurt of the storm (HL); its zaps from the staff tip and
   the sparks it emits there; and per step the light, the area glow, the apex star and the storm's flag */
let VL=[],HL=[],cur=null,zaps=[],tipE=0,t0=0;
const wrap=()=>{VL=[];HL=[];zaps=[];tipE=0;cur=null;t0=time;
  vHit=function(x,z,R,dmg,o,kb){const rec={t:time-t0,x,z,R,dmg,kb,want:enemies.filter(e=>!e.dead&&Math.hypot(e.x-x,e.z-z)<=R+(e.boss?.3:0)).map(e=>({e,d:Math.hypot(e.x-x,e.z-z),dist:e.dist})),got:[]};VL.push(rec);
    const pc=cur;cur=rec;try{return V0.apply(this,arguments);}finally{cur=pc;rec.after=rec.want.map(w=>w.e.dist);}};
  hurt=function(e,amt,kind,o){if(o&&o.spell==='vael'){if(cur)cur.got.push({e,amt});else HL.push({e,amt,t:time-t0});}return H0.apply(this,arguments);};
  zap=function(a){zaps.push(time-t0);return Z0.apply(this,arguments);};
  emit=function(addv,o){if(o&&o.drag===2.2&&o.c===0xffffff&&o.s2===0&&o.s>=.06&&o.s<.1101)tipE++;return E0.apply(this,arguments);};};
const unwrap=()=>{vHit=V0;hurt=H0;zap=Z0;emit=E0;onStep=null;};
/* a vHit struck exactly the foes in its reach, each for dmg (0.65 of it beyond 45% of the reach), and knocked them back by kb */
const vExact=(v,kb)=>v.got.length===v.want.length&&v.want.every((w,i)=>{const g=v.got.filter(q=>q.e===w.e);return g.length===1&&near(g[0].amt,v.dmg*(w.d<v.R*.45?1:.65))&&
  (!kb||w.e.boss||near(v.after[i],Math.max(0,w.dist-kb*(1-w.d/(v.R+.01))),1e-9));});
const kind=v=>v.R===1.6&&near(v.dmg,400)?'open':near(v.dmg,150)?'strike':near(v.dmg,60)?'wild':v.R===.4?'arc':v.R===.5?'erupt':v.R===.9?'sky':v.dmg>=899?'final':'?';
const of=k=>VL.filter(v=>kind(v)===k);
const ev=n=>(VTM.dbg||[]).filter(d=>d.ev===n);
/* (the ripples where foes wade are a pool the terrain keeps: the first foes in water make it) */
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
/* the storm's own meshes among what was added: the area glow (scale 3.2 x 2.6) and the apex star (Judgment's star texture) */
const findMesh=(added,f)=>{let r=null;for(const o of added)if(o.traverse)o.traverse(q=>{if(!r&&q.isMesh&&f(q))r=q;});return r;};
/* the storm's log, noting at each arcing strike how many foes it could arc into and how far its arcs ran, as the network forms the foes in
   the storm's area, at the final strike where the foe it follows stands, and at each crater tick the foes in its reach */
const mkDbg=L=>{const A=[],aR=L>=2?2.2:1.8;A.push=function(d){if(d.ev==='arcs'){d.avail=enemies.filter(e=>!e.dead&&e!==d.e&&Math.hypot(e.x-d.x,e.z-d.z)<aR).length;d.toD=d.to.map(e=>Math.hypot(e.x-d.x,e.z-d.z));}
  if(d.ev==='net')d.inA=enemies.filter(e=>!e.dead&&Math.hypot(e.x-d.x,e.z-d.z)<3.8);
  if(d.ev==='final'){const r=this.slice().reverse().find(q=>q.ev==='recentre'||q.ev==='reanchor');if(r)d.an=r.e;}
  if(d.ev==='crater')d.pos=enemies.filter(e=>!e.dead&&Math.hypot(e.x-d.x,e.z-d.z)<2.4);return Array.prototype.push.call(this,d);};return A;};
/* one storm, watched step by step */
function watch(L,walk,sec,hook){const S=stage(walk);VTM.dbg=mkDbg(L);wrap();const added=track();const W={S,added,tint:[],on:[],glow:[],apex:[],rot:0};
  try{cast(L);let k=0,glow=null,apex=null;onStep=()=>{k++;const T=k*.05;if(hook)hook(T,S,W,apex);W.tint.push([T,VAEL.tint]);W.on.push([T,VAEL.on]);
      if(!glow)glow=findMesh(added,q=>near(q.scale.x,3.2*2.6,1e-9));if(!apex)apex=findMesh(added,q=>q.material&&q.material.map===jdgTex('star'));
      if(glow)W.glow.push([T,glow.position.x,glow.position.z]);if(apex)W.apex.push([T,apex.scale.x,apex.position.x,apex.position.z]);
      if(T>6&&T<8.1)for(const o of added)if(o.isGroup&&o.parent===scene&&Math.abs(o.quaternion.w)<1-1e-6)W.rot++;};
    run(sec||14);}finally{unwrap();scene.add=S0;}
  W.left=left(added);W.end=(W.on.find(q=>q[1]===0)||[0])[0];return W;}
/* every vHit of the storm exact (and the final strike's knockback) */
const allExact=kb=>VL.filter(v=>!vExact(v,kind(v)==='final'?kb:0)).length;
/* the network's ticks: each foe in a tick took dmg once at that moment */
const ticksExact=dmg=>{const T=[...new Set(HL.filter(h=>near(h.amt,dmg)&&h.t>5.9&&h.t<8.05).map(h=>h.t))];return T.map(t=>HL.filter(h=>h.t===t&&near(h.amt,dmg)).map(h=>h.e));};
/* the bursts' strikes: each burst brings about q of them (max(1, round(q x 0.6..1.5))) */
const burstsOK=(B,Q)=>B.every((w,i)=>w[2]>=Math.max(1,Math.round(.6*Q[i]))&&w[2]<=Math.round(1.5*Q[i]-1e-9));
try{
  /* ---- the card ---- */
  ok('the five masteries: Wilder Storm, Living Current, The Great Circuit, The Storm Follows, Wrath of the Ancient Sky (v458)',SM_D.vael.map(x=>x.n).join('|')==='Wilder Storm|Living Current|The Great Circuit|The Storm Follows|Wrath of the Ancient Sky',SM_D.vael.map(x=>x.n).join('|'));
  {const D=i=>smDesc('vael',i);
    ok('the numbers on the card are the ones in the code (3, 5, 7, 10; 1-2 within 2.2, 60%; 75%; 1.5 tiles a second, half a tile; 1260%, 3.2 tiles, 1.4, 4.5s)',
      /3, 5, 7 and 10/.test(D(0))&&/2, 4, 6 and 9/.test(D(0))&&/1-2 foes within 2\.2 tiles/.test(D(1))&&/60%/.test(D(1))&&/55%/.test(D(1))&&/75%/.test(D(2))&&/60%/.test(D(2))&&/at most 10/.test(D(2))&&/four links/.test(D(2))&&/1\.5 tiles a second/.test(D(3))&&/half a tile/.test(D(3))
      &&/1260%/.test(D(4))&&/900%/.test(D(4))&&/3\.2 tiles/.test(D(4))&&/1\.4/.test(D(4))&&/4\.5s/.test(D(4))&&/2\.6s/.test(D(4))
      &&VTM.win.join()==='3,5,7,10'&&VTM.arcN===2&&VTM.arcR===2.2&&VTM.arcK===.6&&VTM.links===4&&VTM.netK===.75&&VTM.followV===1.5&&VTM.followDZ===.5&&VTM.finK===12.6&&VTM.finR===3.2&&VTM.finKb===1.4&&VTM.crater===4.5,[0,1,2,3,4].map(D).join(' / '));}
  ok('the old masteries are gone (no charge, crown, static field, ball lightning or lattice hooks); calibrated with hidden factors',!SMF.vael.hit&&!SMF.vael.cast&&SMA.vael.every(x=>x===1)&&SMG.vael.length===5&&SMG.vael.every(x=>x>=.9&&x<=1.1),SMG.vael.join());
  ok('the storm\'s own numbers (VAELD) are the old ones: bursts of 2, 4, 6, 9; 40% arc into 1-2 within 1.8 for 55%; 10 foes, 3 links, 60%; 900% within 2.6, knockback 1.1; a 2.6s crater',
    JSON.stringify(VAELD)==='{"WIN":[2,4,6,9],"arcP":0.4,"arcN":2,"arcR":1.8,"arcK":0.55,"netMax":10,"netLinks":3,"netK":0.6,"netCap":0,"follow":0,"followV":1.5,"followDZ":0.5,"finK":9,"finR":2.6,"finKb":1.1,"crater":2.6,"tipZ":8,"tipSp":0,"tintK":0.18,"tintMax":0.6,"tintUp":0.06,"arcW":0.55,"arcBr":1,"arcSp":6,"arcFl":0,"netW":1.05,"apexK":1.8,"finW":5.5,"finBr":9,"craterS":1,"log":null}',JSON.stringify(VAELD));
  /* ---- Mastery 0 ---- */
  const W0=watch(0);const vl0=VL,hl0=HL,z0=zaps.filter(t=>t>2&&t<8).length,e0=tipE;
  {const st=of('strike'),op=of('open'),fi=of('final'),ar=of('arc'),tk=ticksExact(60),un=new Set(tk.flat()),cr=HL.filter(h=>near(h.amt,25));
    ok('Mastery 0: no mastery events; every hit of the storm strikes exactly the foes in its reach (0.65 beyond 45% of it)',!VTM.dbg.length&&VL.length>20&&!allExact(1.1),VL.length+' hits, '+allExact(1.1)+' not exact');
    ok('Mastery 0: the opening bolt 400% within 1.6 (knockback 0.25), 12-31 strikes at 150%, arcs 82.5% within 0.4 of a foe',op.length===1&&vExact(op[0],.25)&&st.length>=12&&st.length<=31&&ar.every(v=>near(v.dmg,82.5)),st.length+' strikes, '+ar.length+' arcs');
    ok('Mastery 0: the network tears at no more than 10 foes, each once a tick for 60%',tk.length>=3&&tk.every(L=>L.length===new Set(L).size&&L.length<=10)&&un.size<=10&&un.size>=6,tk.map(L=>L.length).join(',')+' ('+un.size+' foes)');
    ok('Mastery 0: the final strike 900% within 2.6, knockback 1.1; the crater 25% for 2.6s, and the storm ends at 10.6s',fi.length===1&&near(fi[0].dmg,900)&&fi[0].R===2.6&&fi[0].kb===1.1&&vExact(fi[0],1.1)&&cr.length&&Math.max(...cr.map(h=>h.t))-fi[0].t<=2.6&&Math.max(...cr.map(h=>h.t))-fi[0].t>2.2&&near(W0.end,10.6,.006),
      (fi[0]&&fi[0].want.length)+' foes, crater '+(cr.length?(Math.max(...cr.map(h=>h.t))-fi[0].t).toFixed(2):'-')+'s, ends '+W0.end.toFixed(2));
    ok('Mastery 0: nothing is left behind and the light comes back',W0.left===0&&VAEL.on===0&&VAEL.tint===0&&hemi.color.equals(HEMI_C0),W0.left);}
  /* ---- M1 Wilder Storm ---- */
  {let bad=0,eq=0,n=0,z1=0,e1=0;const T1=[];for(let c=0;c<2;c++){const W=watch(1);const B=ev('bursts')[0].W;n+=B.reduce((s,w)=>s+w[2],0);if(!burstsOK(B,[3,5,7,10]))bad++;if(of('strike').length===B.reduce((s,w)=>s+w[2],0))eq++;
      z1+=zaps.filter(t=>t>2&&t<8).length;e1+=tipE;T1.push(W);}
    ok('M1: the four bursts bring 3, 5, 7 and 10 strikes (each max(1, round(q x 0.6-1.5)), 2, 4, 6 and 9 before), every one of them striking',!bad&&eq===2,n+' strikes in 2 casts');
    const W1=T1[0],floor1=T=>.18+.075*(T-1),floor0=T=>.18+.06*(T-1),mid=W=>W.tint.filter(q=>q[0]>2.3&&q[0]<5.9);
    ok('M1: the purple deepens faster: never below .18 + .075 a second (.06 before), up to 0.66 a strike (0.6)',mid(W1).every(q=>q[1]>=floor1(q[0])-1e-6)&&mid(W1).every(q=>q[1]<=.66+1e-9)&&mid(W0).every(q=>q[1]<=.6+1e-9)&&mid(W0).some(q=>q[1]<floor1(q[0])-.01)&&mid(W0).every(q=>q[1]>=floor0(q[0])-1e-6),
      'M0 min over floor '+Math.min(...mid(W0).map(q=>q[1]-floor1(q[0]))).toFixed(3));
    ok('M1: more sparks at the staff tip (none before) and twice the zaps',e0===0&&e1>200&&z1>1.3*z0*2,e0+' / '+e1+' sparks, '+z0+' / '+(z1/2).toFixed(0)+' zaps a cast');
    ok('M1: nothing else changes (arcs 82.5%, the network 60%, the final 900%) and nothing is left behind',T1.every(W=>W.left===0)&&of('arc').every(v=>near(v.dmg,82.5))&&of('final').every(v=>near(v.dmg,900)&&v.R===2.6),T1.map(W=>W.left).join());}
  /* ---- M2 Living Current ---- */
  {const W=watch(2);const S=ev('strike').filter(d=>d.e),A=ev('arcs'),ar=of('arc'),sent=A.reduce((s,a)=>s+a.to.length,0);
    ok('M2: every strike that lands on a foe arcs on (4 in 10 before), into 1-2 foes',S.length>=8&&A.length===S.length&&A.every(a=>a.chain>=1&&a.chain<=2&&a.to.length===Math.min(a.chain,a.avail)),S.length+' strikes on foes, '+A.length+' arcing');
    ok('M2: within 2.2 tiles of the strike (1.8 before), never the foe struck',A.every(a=>a.to.every((e,i)=>e!==a.e&&a.toD[i]<2.2))&&A.some(a=>a.toD.some(d=>d>1.8)),A.length);
    ok('M2: each arc strikes 90% (60% of the strike, 55% before) within 0.4 of its foe, exactly',ar.length===sent&&ar.every(v=>near(v.dmg,90)&&vExact(v)),ar.length+' arcs of '+sent);
    const X=ev('opts')[0].X;ok('M2: the arcs are drawn thicker (0.8, 0.55 before), with two branches, brighter sparks and a flash; nothing is left behind',X.arcW===.8&&X.arcBr===2&&X.arcSp===10&&X.arcFl>0&&W.left===0,W.left);}
  /* ---- M3 The Great Circuit ---- */
  {const W2=watch(2);const N2=ev('net')[0],tk2=ticksExact(60),ax2=Math.max(...W2.apex.map(q=>q[1]));
    const W=watch(3);const N=ev('net')[0],tk=ticksExact(75),un=new Set(tk.flat()),T=ev('tick'),ax=Math.max(...W.apex.map(q=>q[1]));
    const inA=N.inA;
    ok('M3: every foe in the storm\'s area joins the network (at most 10 before)',N.foes.length===inA.length&&inA.length>10&&N2.foes.length===10,N2.foes.length+' / '+N.foes.length+' of '+inA.length);
    ok('M3: four links from a node (3 before; at most 64 drawn, every foe linked to its nearest first)',N.links.every(d=>d<=4)&&N.links.some(d=>d===4)&&N.deg.slice(0,N.foes.length).every(d=>d>=1)&&N.edges<=Math.max(64,N.n)&&N2.links.every(d=>d<=3)&&N2.links.some(d=>d===3),N.links.join('')+' '+N.edges+' links');
    ok('M3: every tick tears at each foe joined once for 75% (60% before), and all of them are joined',T.length>=3&&T.every(q=>near(q.dmg,75))&&tk.length===T.filter(q=>q.L.length).length&&tk.every((L,i)=>L.length===new Set(L).size)&&un.size===inA.length&&tk2.every(L=>L.length<=10),tk.map(L=>L.length).join(','));
    ok('M3: a bigger apex star (2.6 at its peak, 2.2 before)',ax>=2.6-.01&&ax<=2.9+1e-6&&ax2>=2.2-.01&&ax2<=2.5+1e-6,ax2.toFixed(2)+' / '+ax.toFixed(2));
    ok('M3: nothing is left behind',W.left===0,W.left);}
  /* ---- M4 The Storm Follows ---- */
  {const W3=watch(3,true);const f3=of('final')[0],o3=W3.glow[0];const W3b=watch(3,true),f3b=of('final')[0],W4b=watch(4,true),f4b=of('final')[0];
    const W=watch(4,true);const f=of('final')[0],RC=ev('recentre'),B=ev('bursts')[0].W,o=W.glow[0],g=W.glow;let vmax=0;for(let i=1;i<g.length;i++)vmax=Math.max(vmax,Math.hypot(g[i][1]-g[i-1][1],g[i][2]-g[i-1][2])/.05);
    const an=ev('final')[0].an;
    ok('M4: the storm re-centres at each burst and at 6s',RC.length===5&&RC.every((r,i)=>Math.abs(r.T-(i<4?B[i][0]:6))<.06)&&RC.every(r=>r.e),RC.map(r=>r.T.toFixed(2)).join(','));
    ok('M4: it glides after the thickest foes at up to 1.5 tiles a second, keeping within half a tile of them (it stays put before)',vmax<=1.5+1e-6&&vmax>.5&&Math.hypot(f.x-o[1],f.z-o[2])>.4&&W3.glow.every(q=>q[1]===o3[1]&&q[2]===o3[2]),'up to '+vmax.toFixed(2)+' tiles/s, '+Math.hypot(f.x-o[1],f.z-o[2]).toFixed(2)+' tiles in all');
    ok('M4: so the walking pack stays inside it: the final strike falls within half a tile of the foe it follows and takes most of the pack (more than without)',f.want.length>=5&&f4b.want.length>=5&&an&&f.want.some(w=>w.e===an&&w.d<=.5+.2)&&f3.want.length+f3b.want.length<f.want.length+f4b.want.length,'M3 '+f3.want.length+'+'+f3b.want.length+', M4 '+f.want.length+'+'+f4b.want.length+' of 8 (two casts each)');
    const ap6=W.apex.filter(q=>q[0]>6.15&&q[0]<8),apMv=ap6.length?Math.hypot(ap6[ap6.length-1][2]-ap6[0][2],ap6[ap6.length-1][3]-ap6[0][3]):0;
    ok('M4: the area glow and the apex star glide with it, and the bolts climbing to the star turn to keep reaching it',W.apex.filter(q=>q[0]>6.2&&q[0]<7.95).every(q=>{const gg=g.find(r=>r[0]===q[0]);return gg&&near(q[2],gg[1],1e-9)&&near(q[3],gg[2],1e-9);})&&(apMv<1e-6||W.rot>0)&&W3.rot===0,'the star moved '+apMv.toFixed(2)+', '+W.rot+' bolt frames turned');
    ok('M4: nothing is left behind',W.left===0,W.left);}
  /* the pack is moved 2.5 tiles up the road just before the network forms: the star must glide while the bolts climb to it */
  /* (a bolt's first ribbon ends, between its last two vertices, exactly where the bolt was aimed: turned, it must end at the star) */
  {let J=0,hit=0,miss=0;const end=new THREE.Vector3(),q=new THREE.Vector3();const W=watch(4,false,14,(T,S,W,apex)=>{if(!J&&T>5.9){J=1;for(const e of S.F){e.dist+=2.5;moveEnemy(e,0);}}
      if(T>6.5&&T<7.9&&apex)for(const o of W.added){if(!o.isGroup||o.parent!==scene||Math.abs(o.quaternion.w)>=1-1e-6)continue;const m=o.children[0]&&o.children[0].children[0],P=m&&m.geometry&&m.geometry.attributes.position;if(!P)continue;
        const n=P.count;end.set((P.getX(n-1)+P.getX(n-2))/2,(P.getY(n-1)+P.getY(n-2))/2,(P.getZ(n-1)+P.getZ(n-2))/2);o.updateMatrixWorld(true);end.applyMatrix4(o.matrixWorld);if(end.distanceTo(apex.getWorldPosition(q))<1e-3)hit++;else miss++;}});const g=W.glow,ap=W.apex.filter(q=>q[0]>6.15&&q[0]<8),mv=Math.hypot(ap[ap.length-1][2]-ap[0][2],ap[ap.length-1][3]-ap[0][3]);
    ok('M4: when the foes move off as the network forms, the star glides after them and the bolts climbing to it turn with it',mv>1&&W.rot>20&&ap.every(q=>{const gg=g.find(r=>r[0]===q[0]);return gg&&near(q[2],gg[1],1e-9)&&near(q[3],gg[2],1e-9);})&&hit>20&&!miss&&W.left===0,'the star moved '+mv.toFixed(2)+', '+W.rot+' bolt frames turned, '+hit+' ending at the star, '+miss+' not');}
  /* ---- M5 Wrath of the Ancient Sky ---- */
  {const W=watch(5);const f=of('final')[0],cr=ev('crater'),X=ev('opts')[0].X,ax=Math.max(...W.apex.map(q=>q[1]));let disc=null;for(const o of W.added)if(o.isGroup)o.children.forEach(q=>{if(q.isMesh&&near(q.scale.x,5.2*1.25,1e-9))disc=q;});
    ok('M5: the final strike hits 1260% (900% before) within 3.2 tiles (2.6), exactly',f&&near(f.dmg,1260)&&f.R===3.2&&vExact(f,1.4)&&f.want.some(w=>w.d>2.6),f&&f.want.length+' foes, '+f.want.filter(w=>w.d>2.6).length+' beyond the old reach');
    ok('M5: and hurls the foes back by up to 1.4 tiles (1.1 before)',f&&f.kb===1.4&&f.want.some((w,i)=>w.dist-f.after[i]>1.1),f&&Math.max(...f.want.map((w,i)=>w.dist-f.after[i])).toFixed(2));
    {const ct=HL.filter(h=>near(h.amt,25)),last=Math.max(...ct.map(h=>h.t))-f.t;
      ok('M5: the crater stays live 4.5s (2.6 before): 25% every 0.3s within 2.4 tiles',last>4.1&&last<=4.5&&cr.length>=12&&cr.every(c=>{const L=ct.filter(h=>near(h.t,c.t-t0,1e-9)).map(h=>h.e);return L.length===c.pos.length&&c.pos.every(e=>L.includes(e));}),cr.length+' ticks over '+last.toFixed(2)+'s');}
    ok('M5: the storm ends with the crater (12.5s), the light back',near(W.end,12.5,.006)&&VAEL.on===0&&VAEL.tint===0&&hemi.color.equals(HEMI_C0),W.end.toFixed(2));
    ok('M5: a larger apex star (3 at its peak), a wider final bolt (7, 5.5 before) with 12 branches (9), a larger crater disc and crack nets',ax>=3-.01&&ax<=3.3+1e-6&&X.finW===7&&X.finBr===12&&X.craterS===1.25&&!!disc,ax.toFixed(2));
    ok('M5: nothing is left behind',W.left===0,W.left);}
  /* ---- the rest ---- */
  {stage();VTM.dbg=[];setL(5);wrap();try{castVael(heroU,100,oV(),enemies.filter(e=>!e.dead));run(11.5);}finally{unwrap();setL(0);}const f=of('final');
    ok('casts that are not a mastered scroll cast are the old storm',!VTM.dbg.length&&f.length===1&&near(f[0].dmg,900)&&f[0].R===2.6&&of('arc').every(v=>near(v.dmg,82.5))&&ticksExact(60).every(L=>L.length<=10)&&VAEL.on===0,VTM.dbg.length);}
  {const S=stage();VTM.dbg=[];setL(5);meta.arts.eq[heroU.hero]=['tempestheart',null,null];meta.arts.own.tempestheart=1;ART_V++;ART_TH=4;const added=track();let on2=0;
    try{cast(5);onStep=()=>{on2=Math.max(on2,VAEL.on);};run(15);}finally{unwrap();scene.add=S0;meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;setL(0);}
    ok('Tempest Heart: the recast is a second mastered storm over the first, and both end clean',ev('opts').length===2&&ev('end').length===2&&on2===2&&VAEL.on===0&&VAEL.tint===0&&hemi.color.equals(HEMI_C0)&&left(added)===0,ev('opts').length+' storms, '+left(added)+' left');}
  {const e0=errs,lv=[];for(let L=0;L<=5;L++){const S=stage();S.F.forEach(e=>{e.maxHp=e.hp=2500;});heroU.scd={};heroU.gcd=0;setL(L);VTM.dbg=[];meta.spells.vael=meta.spells.vael||{lvl:1,hero:null};fireScroll(heroU,'vael',heroStats(),S.F.slice());run(15);
      const c=ev('opts')[0];lv.push(c?c.L:0);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors, each at its own mastery',errs===e0&&lv.join()==='0,1,2,3,4,5',(errs-e0)+' errors, levels '+lv.join());}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;unwrap();scene.add=S0;VTM.dbg=DB0;ART_TH=TH0;window.__fz=false;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
