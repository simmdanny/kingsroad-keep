(function(){
/* Curse of the Blood Moon's masteries (v469). Run on the dev page: __kk.ev(await (await fetch('/tests/bcm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road at known distances from the hero (inside the opening blast's 4.4 tiles, between 4.4 and 5, and beyond 5); the
   game is stepped (update and updFx) and hurt is wrapped to log the amount and element of each hit (the scroll's power is 100: the blast 600 +
   600, an eruption 150 x its size, the final blast 1000). bmErupt, bmFireMat, bmBolt, bmRing and crackNet are wrapped to note what each
   eruption and the finale are made with, so Mastery 0 is checked as the old curse and every mastery's numbers exactly. Blood Price is checked
   with greater scrolls equipped on the hero on purpose (the dev hero has none). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,ER0=bmErupt,FM0=bmFireMat,BB0=bmBolt,RG0=bmRing,CN0=crackNet,DB0=BCM.dbg;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-9)*Math.max(1,Math.abs(b));
const GS=Object.keys(SPELLS_S).filter(q=>q!=='bloodcurse'&&q!=='bloodneedles'&&RB[SPELLS_S[q].r].i>=2&&RB[SPELLS_S[q].r].i<=4);
const LOW=Object.keys(SPELLS_S).filter(q=>RB[SPELLS_S[q].r].i<2);
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  for(const k in meta.spells)if(meta.spells[k].hero===heroU.hero)meta.spells[k].hero=null;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;cineLock=0;CURSE.on=false;}
/* a foe on the road standing r tiles from the hero (the first such spot along the road), still, with huge health */
function foeAt(r,hp){const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.off=0;e.armor=0;e.res={};e.shield=0;e.spd=0;
  let best=null,bd=1e9;for(let d=.2;d<R.len-.2;d+=.01){e.dist=d;moveEnemy(e,0);const q=Math.abs(Math.hypot(e.x-heroU.x,e.z-heroU.z)-r);if(q<bd){bd=q;best=d;}}
  e.dist=best;moveEnemy(e,0);e.hp=e.maxHp=hp||1e9;e.r0=Math.hypot(e.x-heroU.x,e.z-heroU.z);e.d0=e.dist;return e;}
const RS=[1.6,2.4,3.1,3.8,4.25,4.6,4.85,5.3,6.2,7.4];
const stage=hp=>{go();return RS.map(r=>foeAt(r,hp));};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.bloodcurse=SM_XP[L-1];else delete meta.smast.bloodcurse;};
const oC=()=>({src:heroU,bane:0,el:'fire',anc:true,spell:'bloodcurse'});
const cast=L=>{setL(L);castScrollNow('bloodcurse',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oC());};
const equip=ks=>{for(const k of ks)meta.spells[k]={lvl:1,hero:heroU.hero};};
let log=[],ers=[],fms=[],bolts=[],rings=[],cracks=[];
const wrap=()=>{log=[];ers=[];fms=[];bolts=[];rings=[];cracks=[];
  hurt=function(e,amt,kind,o){if(o&&o.spell==='bloodcurse')log.push({e,amt,el:o.el,t:time,x:e.x,z:e.z});return H0.apply(this,arguments);};
  bmErupt=function(x,z,size,dmg,o,warn,root,X){ers.push({x,z,size,dmg,X,t:time});return ER0.apply(this,arguments);};
  bmFireMat=function(seed,hot){fms.push(hot);return FM0.apply(this,arguments);};
  bmBolt=function(A,B,w,life,br,hot){bolts.push(hot);return BB0.apply(this,arguments);};
  bmRing=function(x,z,R){rings.push(R);return RG0.apply(this,arguments);};
  crackNet=function(x,z,R,n){cracks.push([R,n]);return CN0.apply(this,arguments);};};
const unwrap=()=>{hurt=H0;bmErupt=ER0;bmFireMat=FM0;bmBolt=BB0;bmRing=RG0;crackNet=CN0;};
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=n=>(BCM.dbg||[]).filter(d=>d.ev===n);
/* one whole cast at mastery L: the hits, the eruptions, what is left behind */
function trial(L,pre,mid){const F=stage();if(pre)pre(F);BCM.dbg=[];wrap();const added=track();let lock=0,dist5=null,pos5=null,midR=null;const t0=time;
  try{cast(L);lock=cineLock;run(5);dist5=F.map(e=>e.dist);pos5=F.map(e=>[e.x,e.z]);if(mid)midR=mid(F);run(10.5);}finally{unwrap();scene.add=S0;}
  const fin=ers.reduce((a,b)=>b.size>(a?a.size:0)?b:a,null);
  return{F,t0,lock,dist5,pos5,midR,fin,left:left(added),on:CURSE.on,log:log.slice(),ers:ers.slice(),fms:fms.slice(),bolts:bolts.slice(),rings:rings.slice(),cracks:cracks.slice(),dbg:(BCM.dbg||[]).slice()};}
const blastHits=(R,F,amtF,amtD)=>{const t=R.log.length?R.log[0].t:0,B=R.log.filter(h=>h.t===t);
  const want=F.filter(e=>e.r0<=R.blR),gotF=B.filter(h=>h.el==='fire'&&near(h.amt,amtF)),gotD=B.filter(h=>h.el==='dark'&&near(h.amt,amtD));
  return{n:want.length,ok:want.length===gotF.length&&want.length===gotD.length&&want.every(e=>gotF.some(h=>h.e===e)&&gotD.some(h=>h.e===e))&&B.length===2*want.length};};
/* the eruptions' strikes: every one dmg = k x size (and nothing else: the finale's too) */
const strikes=(R,k)=>R.ers.length>=100&&R.ers.every(q=>near(q.dmg,k*(q.X&&q.X.rk?q.size*q.X.rk:q.size)));
/* the final blast: every foe within r of the final eruption's centre (as they stood then) takes amt, nobody else */
function finalHits(R,r,amt){const H=R.log.filter(h=>near(h.amt,amt));if(!R.fin)return{ok:false};const want=R.F.filter(e=>{const h=R.log.find(q=>q.e===e&&near(q.amt,amt));const x=h?h.x:e.x,z=h?h.z:e.z;return Math.hypot(x-R.fin.x,z-R.fin.z)<=r;});
  return{n:want.length,got:H.length,ok:want.length>0&&H.length===want.length&&want.every(e=>H.some(h=>h.e===e))};}
try{
  /* ---- the card ---- */
  ok('the five masteries: Wider Seal, Hotter Blood, Rising Fury, Blood Price, The Great Eruption (v469)',SM_D.bloodcurse.map(x=>x.n).join('|')==='Wider Seal|Hotter Blood|Rising Fury|Blood Price|The Great Eruption',SM_D.bloodcurse.map(x=>x.n).join('|'));
  const dd=i=>smDesc('bloodcurse',i);
  ok('the numbers on the card are the ones in the code (5 tiles, 650% + 650%; 10%; 18%; 4% up to 3; 1500% within 4.2 tiles)',
    /5 tiles/.test(dd(0))&&/650% fire and 650% dark/.test(dd(0))&&/15% longer/.test(dd(0))&&/10% harder/.test(dd(1))&&/18%/.test(dd(2))&&/4% harder/.test(dd(3))&&/up to 3/.test(dd(3))&&/1500%/.test(dd(4))&&/4\.2 tiles/.test(dd(4))
    &&BCM.blR===5&&BCM.bl===6.5&&BCM.hot===.1&&BCM.esc===.18&&BCM.pr===.04&&BCM.prN===3&&BCM.finK===1.5&&BCM.finB===15&&BCM.finR===4.2,[0,1,2,3,4].map(dd).join(' / '));
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v469'&&/Blood Price/.test(c.li.join(' '))));
  ok('the masteries live in the cast (no hooks); calibrated with hidden factors',!SMF.bloodcurse.hit&&!SMF.bloodcurse.cast&&SMA.bloodcurse.every(x=>x===1)&&SMG.bloodcurse.length===5&&SMG.bloodcurse.every(x=>x>=.85&&x<1.15),SMG.bloodcurse.join());
  ok('the cast\'s own numbers (BCD) are the old ones: 4.4 tiles, 600% + 600%, 150% eruptions growing 12% a stage, a 1000% final blast within 2.8',
    JSON.stringify(BCD)==='{"blR":4.4,"blF":6,"blD":6,"blK":1,"spk":1,"eK":1,"esc":0.12,"spinS":0.6,"starP":0,"seal":0,"pr":0,"prL":0,"prS":0,"finK":1,"finV":0,"finB":10,"finR":2.8,"plunge":0,"crK":1,"ex":null,"log":null}',JSON.stringify(BCD));
  /* ---- Mastery 0 ---- */
  let R0=null;
  {const R=R0=trial(0);R.blR=4.4;const b=blastHits(R,R.F,600,600),f=finalHits(R,2.8,1000),fin=R.fin;
    ok('Mastery 0: no mastery events; every eruption is the old one (no options), about 160 of them',!R.dbg.length&&R.ers.every(q=>q.X==null)&&R.ers.length>=100&&R.ers.length<=220,R.ers.length+' eruptions');
    ok('Mastery 0: the opening blast strikes every foe within 4.4 tiles for 600% fire and 600% dark, and no one beyond',b.ok&&b.n>=4&&R.F.some(e=>e.r0>4.4),JSON.stringify(b)+' at '+R.F.map(e=>e.r0.toFixed(2)).join(','));
    ok('Mastery 0: and throws each non-boss back along the road 0.6 x (1 - d / 4.4)',R.F.every((e,i)=>near(R.dist5[i],e.r0<=4.4?Math.max(0,e.d0-.6*(1-e.r0/4.4)):e.d0,1e-6)),R.F.map((e,i)=>(e.d0-R.dist5[i]).toFixed(3)).join(','));
    ok('Mastery 0: every eruption strikes 150% x its size, its columns and bolts the old ones (uHot 0 / 0.55 / 1)',strikes(R,150)&&R.fms.every(h=>h===0||h===.55||h===1)&&R.bolts.every(h=>h===undefined),R.ers.length);
    ok('Mastery 0: the final eruption is 3.4 x 1.36 (4.62) across; the final blast strikes every foe within 2.8 tiles of it for 1000%',fin&&near(fin.size,3.4*1.36)&&f.ok,fin&&fin.size.toFixed(3)+' '+JSON.stringify(f));
    ok('Mastery 0: its rings (5 and 3) and cracks (1.4, 9 branches) are the old ones',R.rings.includes(5)&&R.rings.includes(3)&&R.cracks.some(c=>c[0]===1.4&&c[1]===9),R.rings.join()+' '+JSON.stringify(R.cracks));
    ok('Mastery 0: the ritual holds the stage 14s and nothing is left behind',R.lock===14&&R.left===0&&!R.on,R.lock+' '+R.left);}
  /* ---- M1 Wider Seal ---- */
  {const R=trial(1);R.blR=5;const b=blastHits(R,R.F,650,650),C=ev('cast')[0],D=C&&C.D;
    ok('M1: the opening blast reaches 5 tiles: every foe within 5 takes 650% fire and 650% dark (the two between 4.4 and 5 too), no one beyond',b.ok&&R.F.some(e=>e.r0>4.4&&e.r0<=5)&&R.F.some(e=>e.r0>5),JSON.stringify(b));
    ok('M1: each non-boss is thrown back 0.6 x (1 - d / 5)',R.F.every((e,i)=>near(R.dist5[i],e.r0<=5?Math.max(0,e.d0-.6*(1-e.r0/5)):e.d0,1e-6)),R.F.map((e,i)=>(e.d0-R.dist5[i]).toFixed(3)).join(','));
    ok('M1: the dome, waves and rings are drawn 5 / 4.4 as wide, and the 24 blade spikes are 15% longer',D&&near(D.blK,5/4.4)&&D.spk===1.15&&C.spk.length===24&&C.spk.every(q=>{q.dm.geometry.computeBoundingBox();return near(q.dm.geometry.boundingBox.max.x,q.len,1e-5)&&q.len/1.15>=1.1*.7-1e-9&&q.len/1.15<=2.2*1.35+1e-9;})&&R.rings.some(r=>near(r,2*5/4.4)),C&&C.spk.map(q=>q.len.toFixed(2)).join(','));
    ok('M1: nothing else changes (eruptions 150% x size, the final blast 1000% within 2.8)',strikes(R,150)&&finalHits(R,2.8,1000).ok,R.ers.length);
    ok('M1: nothing is left behind',R.left===0&&!R.on,R.left);}
  /* ---- M2 Hotter Blood ---- */
  let R2=null;
  {const R=R2=trial(2);const C=ev('cast')[0];
    ok('M2: every eruption strikes 10% harder: 165% x its size (its red lightning 40% of that), the finale\'s too',strikes(R,165)&&R.log.filter(h=>h.el==='lightning').length>50&&R.log.filter(h=>h.el==='lightning').every(h=>R.ers.some(q=>near(h.amt,q.dmg*.4))),R.ers.length);
    ok('M2: its fire columns rise a tenth taller and burn hotter (uHot 0.15 / 0.9 / 1.45), the red lightning inside brighter',R.ers.every(q=>q.X&&q.X.h===1.1&&q.X.bolt===.35)&&R.fms.length>=300&&R.fms.every(h=>near(h,.15)||near(h,.9)||near(h,1.45))&&R.bolts.filter(h=>h===.35).length>=200,R.fms.length+' columns, '+R.bolts.length+' bolts');
    ok('M2: an eruption allocates no more than before: its shards, bolts and boom are counted at the size it would have without the masteries',R.ers.every(q=>q.X&&near(q.X.cs,q.size)),'');
    ok('M2: nothing is left behind',R.left===0,R.left);}
  /* ---- M3 Rising Fury ---- */
  let R3=null;
  {const spin=()=>{const C=ev('cast')[0];let s=null;const T=C.T();const r0=C.ring1.rotation.y;run(.05);s=(C.ring1.rotation.y-r0)/.05/.12;return s;};
    const starRange=()=>{const C=ev('cast')[0];let lo=1e9,hi=-1e9;for(let i=0;i<48;i++){run(.05);const x=C.star.scale.x;lo=Math.min(lo,x);hi=Math.max(hi,x);}return hi-lo;};
    const meas=L=>{stage();BCM.dbg=[];wrap();let s1=0,s3=0,sr=0;try{cast(L);run(5);s1=spin();run(8-5.05);sr=starRange();run(11-8-2.4);s3=spin();run(5);}finally{unwrap();}return{s1,s3,sr,ers:ers.slice(),dbg:BCM.dbg.slice()};};
    const a=meas(2),b=meas(3);R3=b;const E3=b.dbg.filter(d=>d.ev==='erupt'),stg=T=>T<4.6?0:T<7.6?1:T<10.6?2:3;
    ok('M3: each stage grows the eruptions 18% (12% before): the last stage\'s are 1.54 times their size (1.36 before), the finale too',E3.length>=100&&E3.every(d=>d.st===stg(d.T)&&near(d.sz,d.size*(1+.18*d.st)))&&a.dbg.filter(d=>d.ev==='erupt').every(d=>near(d.sz,d.size*(1+.12*d.st))),E3.length+' eruptions, stages '+[0,1,2,3].map(s=>E3.filter(d=>d.st===s).length).join('/'));
    ok('M3: and strike with their size (165% x size), still counted for their meshes at the old size',E3.every(d=>near(d.d,165*d.sz)&&near(d.X.cs,d.size*(1+.12*d.st))),'');
    ok('M3: the seal\'s rings spin faster each stage (stage 1: 2 times their base speed, 1.6 before; stage 3: 4 times, 2.8 before)',near(b.s1,2,1e-6)&&near(b.s3,4,1e-6)&&near(a.s1,1.6,1e-6)&&near(a.s3,2.8,1e-6),[a.s1,a.s3,b.s1,b.s3].map(x=>x.toFixed(3)).join(' / '));
    ok('M3: the crest\'s star pulses harder each stage (in the third its size swings more than twice as far)',b.sr>a.sr*2&&a.sr>0,a.sr.toFixed(3)+' / '+b.sr.toFixed(3));}
  /* ---- M4 Blood Price ---- */
  {const ctx=n=>bcmOpts({L:4,a:[1,1,1,1,1],t:heroU}).seal;go();
    const n0=ctx();equip(GS.slice(0,1));const n1=ctx();equip(GS.slice(1,3));const n3=ctx();equip(GS.slice(3,6));const n6=ctx();
    go();equip(LOW.slice(0,3));equip(['bloodneedles']);const nL=ctx();meta.spells[GS[0]]={lvl:1,hero:'nobody'};const nO=ctx();
    ok('M4: the curse counts the greater scrolls it seals on its caster (Rare and up), up to 3: none, 1, 3, 3 of 6; the Needles, Common and Uncommon ones and other heroes\' scrolls do not count',n0===0&&n1===1&&n3===3&&n6===3&&nL===0&&nO===0,[n0,n1,n3,n6,nL,nO].join());
    const R=trial(4,()=>equip(GS.slice(0,3)),()=>GS.slice(0,3).map(k=>cursedSeal(k)));const C=ev('cast')[0],O=ev('opts')[0];
    ok('M4: with 3 sealed every eruption strikes 12% harder: 165% x 1.12 = 184.8% x its size',O&&O.X.seal===3&&strikes(R,165*1.12),O&&O.X.seal);
    ok('M4: and those scrolls are sealed while it burns (the price)',R.midR&&R.midR.every(x=>x)&&!cursedSeal(GS[0]),R.midR&&R.midR.join());
    {let bl=true,st=true;const T=C.T();C.crestB.forEach(q=>{if(!near(q.holder.scale.x,(.82+.18*Math.sin(T*2.2+q.ph))*1.24,1e-6))bl=false;});if(!near(C.star2.scale.x,1.3)||!near(C.starM.color.g,(0x2a/255)*1.3,1e-6)||!near(C.starM.color.r,1.3,1e-6))st=false;
      ok('M4: the crest\'s 20 blades are 8% longer for each sealed scroll (1.24 times) and its star 10% larger and brighter for each (1.3)',C&&C.crestB.length===20&&bl&&st&&near(C.bladeK,1.24)&&near(C.starK,1.3),C&&C.starM.color.getHexString());}
    {stage();equip(GS.slice(0,3));BCM.dbg=[];wrap();try{cast(3);run(.1);}finally{unwrap();}const C3=ev('cast')[0];run(15);
      ok('M4: below Mastery 4 the sealed scrolls feed nothing (Mastery 3: no price, the crest as before)',C3&&C3.eK===1.1&&C3.bladeK===1&&C3.starK===1,C3&&C3.eK);}
    ok('M4: nothing is left behind',R.left===0,R.left);}
  /* ---- M5 The Great Eruption ---- */
  {const R=trial(5);const P=ev('plunge')[0],Ld=ev('land')[0],Fi=ev('final')[0],E=R.dbg.filter(d=>d.ev==='erupt'&&d.fin),fin=R.fin,szF=3.4*1.54*1.5,svF=3.4*1.54*1.12;
    const hitF=R.log.filter(h=>h.el==='fire'&&near(h.amt,165*szF)),inF=R.F.filter((e,i)=>Math.hypot(R.pos5[i][0]-fin.x,R.pos5[i][1]-fin.z)<=.62*szF);
    ok('M5: the final eruption is half again as large (3.4 x 1.54 x 1.5 = 7.85 across) and strikes with that size (165% x 7.85)',E.length===1&&near(E[0].sz,szF)&&near(E[0].d,165*szF)&&fin&&near(fin.size*fin.X.rk,szF),E.length&&E[0].sz.toFixed(3));
    ok('M5: its strike reaches 0.62 x 7.85 = 4.9 tiles, though it is drawn only 1.12 times its stage\'s size (5.86) so it does not swallow the view',fin&&near(fin.size,svF)&&near(fin.X.rk,1.5/1.12)&&inF.length>=1&&hitF.length===inF.length&&inF.every(e=>hitF.some(h=>h.e===e))&&R.F.some((e,i)=>{const r=Math.hypot(R.pos5[i][0]-fin.x,R.pos5[i][1]-fin.z);return r>.62*3.4*1.54*1.12&&r<=.62*szF;}),hitF.length+' hit of '+inF.length+' within reach');
    const f=finalHits(R,4.2,1500);
    ok('M5: the blast after it is half again as hard and wide: 1500% to every foe within 4.2 tiles (1000% within 2.8 before), no one beyond',f.ok&&Fi&&Fi.R===4.2&&Fi.B===15,JSON.stringify(f));
    ok('M5: the crest\'s star plunges from the crest down its shaft into the final eruption, landing as it bursts (0.35s)',P&&Ld&&near(Ld.T-P.T,.35,.2)&&P.S.y>2&&near(P.Q.x,fin.x-heroU.x,1e-6)&&near(P.Q.z,fin.z-heroU.z,1e-6),P&&(Ld.T-P.T).toFixed(2));
    ok('M5: a wider web of cracks (2.1 tiles, 14 branches; 1.4 and 9 before) and wider rings (7.5 and 4.5)',R.cracks.some(c=>near(c[0],2.1)&&c[1]===14)&&R.rings.some(r=>near(r,7.5))&&R.rings.some(r=>near(r,4.5)),JSON.stringify(R.cracks));
    ok('M5: no more eruptions than before (the masteries make them larger, never more): '+R.ers.length+' (Mastery 0: '+R0.ers.length+')',R.ers.length>=100&&R.ers.length<=220,'');
    ok('M5: the ritual keeps its length (14s) and nothing is left behind (the plunging star and its shaft are freed)',R.lock===14&&R.left===0&&!R.on,R.left);}
  /* ---- the rest ---- */
  {stage();setL(5);BCM.dbg=[];wrap();try{castBloodCurse(heroU,100,oC());run(15);}finally{unwrap();setL(0);}
    ok('casts that are not a mastered scroll cast are the old curse',!BCM.dbg.length&&ers.length>=100&&ers.every(q=>q.X==null&&near(q.dmg,150*q.size))&&log.filter(h=>near(h.amt,1000)).length>0,ers.length);}
  {const e0=errs,lv=[];for(let L=0;L<=5;L++){const F=stage(2500);heroU.scd={};heroU.gcd=0;setL(L);BCM.dbg=[];meta.spells.bloodcurse=meta.spells.bloodcurse||{lvl:1,hero:null};fireScroll(heroU,'bloodcurse',heroStats(),F.slice());run(16);
      const c=ev('opts')[0];lv.push(c?c.L:0);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors, each at its own mastery',errs===e0&&lv.join()==='0,1,2,3,4,5',(errs-e0)+' errors, levels '+lv.join());}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;unwrap();scene.add=S0;BCM.dbg=DB0;window.__fz=false;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;cineLock=0;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
