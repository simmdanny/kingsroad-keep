(function(){
/* Basic Wither's masteries as Simon designed them: the card, Mastery 0 is the old mist (the foes under it wither at 0.9s, 55% a second for 5s,
   nothing after), Lingering Decay (the cloud stays 3.5s and withers foes that walk in), Grasp of Decay (15% slow inside; tendrils rooted on the
   foe's own body for every kind of foe, flyers and bosses too, let go when it leaves), Contagion (a withered foe that dies passes the wither on
   for 2.5s to the nearest foe, only from Mastery 3), Deepening Blight (2s in the cloud: the wither deals 25% more, black cracks on the body that
   go when it ends), The Wither Bloom (4 pulses of 25% on top of the wither, a 25% slow, only round the flower), clean-up at every mastery, and
   the power on the Common ladder. Run on the dev page: __kk.ev(await (await fetch('/tests/wither-test.js')).text()) returns [name, ok, detail]
   rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,type)=>{const R=ROUTES[0];spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=0;e.spd=.0001;e.maxHp=4000;e.hp=1e9;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.wither=SM_XP[L-1];else delete meta.smast.wither;};
const oF=()=>({src:heroU,bane:0,el:'dark',anc:false,spell:'wither'});
const cast=(list,P)=>castScrollNow('wither',heroU,tStats(heroU),list,P||100,oF());
const smLeft=()=>{let n=0;scene.traverse(o=>{if(o.userData&&o.userData.sm)n++;});return n;};
/* the Basic Wither's own damage: its ticks ('tick', per foe, summed) and its add-ons ('add', each hit) */
let H=null;const H0=hurt;const id0=meta.equipped,A0=AURA[id0],b0=A0&&A0.boom,h0=JSON.stringify(hs(id0));
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  if(A0)A0.boom=0;meta.combos={};   /* the Monarch's random aura explosion would kill foes of its own */
  hurt=function(e,amt,kind,o){if(H&&o&&o.spell==='wither'){if(o.smx)(H.add=H.add||[]).push([e,Math.round(amt*100)/100]);else{H.tick=H.tick||new Map();H.tick.set(e,(H.tick.get(e)||0)+amt);}}return H0.apply(this,arguments);};
  /* ---- the card ---- */
  ok('the card: Lingering Decay, Grasp of Decay, Contagion, Deepening Blight, The Wither Bloom',SM_D.wither.map(x=>x.n).join(',')==='Lingering Decay,Grasp of Decay,Contagion,Deepening Blight,The Wither Bloom');
  const T=[0,1,2,3,4].map(i=>smDesc('wither',i));
  ok('Simon\'s numbers on the card: a lingering cloud, 15% slower, half the wither passed on, 2s for 25% more, a flower pulsing every second for 25% and a 25% slow',
    /lingers/.test(T[0])&&/15% slower/.test(T[1])&&/half/.test(T[2])&&/2s/.test(T[3])&&/25% more/.test(T[3])&&/4s/.test(T[4])&&/25%/.test(T[4])&&/slowing the foes around it by 25%/.test(T[4]),T.join(' | '));
  /* ---- Mastery 0: the old mist ---- */
  play();setL(0);SM.cnt.wither=0;let bd=near(),A=foe(bd);H={};paused=false;cast([A]);run(.8);const w0=A.wither;run(.2);const w1=A.wither,t1=w1&&w1.t;let late=foe(bd);run(.6);
  ok('Mastery 0 is the old mist: its foe withers at 0.9s, 55% a second for 5s, and a foe that walks in after does not',!w0&&!!w1&&Math.abs(w1.dps-55)<1e-9&&Math.abs(t1-4.95)<.11&&!late.wither,JSON.stringify({w1:w1&&{dps:w1.dps,t:+t1.toFixed(2)},late:!!late.wither}));
  /* ---- Mastery 1: Lingering Decay ---- */
  play();setL(1);SM.cnt.wither=0;bd=near();A=foe(bd);H={};cast([A]);run(1.5);const B1=foe(bd+.3);run(.2);const b1=!!B1.wither;run(1.6);const B2=foe(bd-.3);run(.2);const b2=!!B2.wither;run(.5);const C1=foe(bd);run(.3);
  ok('Mastery 1: the cloud lingers 3.5s: foes that walk in at 1.5s and 3.3s wither (55% a second, 5s), one that walks in at 4s does not',b1&&b2&&B1.wither&&Math.abs(B1.wither.dps-55)<1e-9&&!C1.wither,JSON.stringify({b1,b2,c:!!C1.wither}));
  run(1.5);ok('and it has no slow, no tendrils (those are Mastery 2)',!(B1.slow>0)&&!B1.wthT);
  /* ---- Mastery 2: Grasp of Decay ---- */
  play();setL(2);SM.cnt.wither=0;bd=near();A=foe(bd);cast([A]);run(.6);
  ok('Mastery 2: foes inside the cloud are 15% slower',A.slow>=.15-1e-9&&A.slowT>0,A.slow);
  {const fit=[],types=['soldier','knight','rider','peasant'];const fl=Object.keys(EN).find(k=>EN[k].fly&&!EN[k].boss),bs=Object.keys(EN).find(k=>EN[k].boss&&!EN[k].fly);if(fl)types.push(fl);if(bs)types.push(bs);
    for(const ty of types){play();setL(2);SM.cnt.wither=0;const b2=near(),q=foe(b2,ty);cast([q]);run(1);const h=q.wthT;let r='none';
      if(h&&h.mesh){const P=h.mesh.geometry.attributes.position.array,box=new THREE.Box3().setFromObject(q.b).expandByScalar(.06),gyy=gy(q.x,q.z);let tips=0,roots=0;
        for(let t=0;t<h.n;t++){const tip=new THREE.Vector3(),root=new THREE.Vector3();for(let k=0;k<5;k++){const i=((t*13+12)*5+k)*3,j=((t*13)*5+k)*3;tip.x+=P[i]/5;tip.y+=P[i+1]/5;tip.z+=P[i+2]/5;root.x+=P[j]/5;root.y+=P[j+1]/5;root.z+=P[j+2]/5;}
          if(box.containsPoint(tip))tips++;if(Math.abs(root.y-gyy)<.08)roots++;}
        r=h.n+' tendrils, '+tips+' tips on the body, '+roots+' roots on the ground';fit.push([ty,h.n>=2&&tips===h.n&&roots===h.n,r]);}else fit.push([ty,false,r]);}
    ok('dark tendrils rise from the ground and cling to the foe\'s own body, for every kind of foe (flyer and boss too)',fit.every(x=>x[1]),fit.map(x=>x[0]+': '+x[2]).join(' ; '));}
  play();setL(2);SM.cnt.wither=0;bd=near();A=foe(bd);cast([A]);run(.8);A.dist=bd+3;moveEnemy(A,0);run(.6);
  ok('a foe that leaves the cloud is let go: the tendrils draw back and it is no longer slowed',(!A.wthT||A.wthT.done)&&!(A.slow>=.15&&A.slowT>.2),JSON.stringify({done:A.wthT&&A.wthT.done,slow:A.slow}));
  /* ---- Mastery 3: Contagion ---- */
  for(const L of [3,2]){play();setL(L);SM.cnt.wither=0;bd=near();A=foe(bd);const B=foe(bd+1.4),C=foe(bd+3.5);cast([A]);run(1.2);const wa=A.wither;H0(A,1e9,'magic',{src:heroU});run(.9);
    if(L===3)ok('Mastery 3: a withered foe that dies passes the wither on to the nearest foe (not the cloud\'s), for 2.5s at the same 55% a second',!!wa&&wa.wtC&&A.dead&&!!B.wither&&Math.abs(B.wither.dps-55)<1e-9&&B.wither.t>1.4&&B.wither.t<=2.5&&B.wither.wtC&&!C.wither,
      JSON.stringify({B:B.wither&&{t:+B.wither.t.toFixed(2),dps:B.wither.dps},C:!!C.wither}));
    else ok('not before Mastery 3',A.dead&&!B.wither);}
  /* ---- Mastery 4: Deepening Blight ---- */
  play();setL(4);SM.cnt.wither=0;bd=near();A=foe(bd);cast([A]);run(1.9);const pre=A.wither&&A.wither.dps;const late4=foe(bd+.2);run(.4);
  ok('Mastery 4: after 2s in the cloud its foe is Blighted: the wither deals 25% more (55 to 68.75 a second)',Math.abs(pre-55)<1e-9&&A.wither&&A.wither.wtB&&Math.abs(A.wither.dps-68.75)<1e-9,pre+' -> '+(A.wither&&A.wither.dps));
  {const K=(A.wthB&&A.wthB.K)||[],onBody=K.length>0&&K.every(c=>{let p=c.cg.parent;while(p&&p!==A.b)p=p.parent;return p===A.b;});
    ok('black cracks spread over its own body (rooted on its meshes)',onBody,K.length+' cracks');}
  run(1);ok('a foe that is in the cloud for only 1.4s is not Blighted',!!late4.wither&&!late4.wither.wtB);
  {H={};run(1);const got=H.tick&&H.tick.get(A)||0;ok('and its wither really ticks at 68.75 a second',Math.abs(got-68.75)<1,got.toFixed(2));}
  run(3.5);ok('the cracks go when the wither ends',!A.wither&&(A.wthB.K||[]).every(c=>!c.cg.parent));
  /* ---- Mastery 5: The Wither Bloom ---- */
  play();setL(5);SM.cnt.wither=0;bd=near();A=foe(bd);const N5=[foe(bd+.4),foe(bd-.4)],O5=foe(bd+2.6);H={};cast([A]);run(1.12);
  const sl=[A,...N5].map(q=>q.slow);run(4.5);
  const pulses=q=>(H.add||[]).filter(x=>x[0]===q);
  ok('Mastery 5: a black flower pulses 4 times, 25% each (25) to every foe round it, on top of the wither',[A,...N5].every(q=>pulses(q).length===4&&pulses(q).every(x=>x[1]===25))&&H.tick.get(A)>200,JSON.stringify([A,...N5].map(q=>pulses(q).map(x=>x[1]))));
  ok('and slows them by 25%',sl.every(v=>v>=.25-1e-9),sl.join(','));
  ok('a foe outside the flower is not hit by it',!pulses(O5).length);
  run(1.5);ok('the flower wilts away',!scene.children.some(o=>o.userData&&o.userData.sm));
  /* ---- every mastery casts clean and leaves nothing behind ---- */
  {const bad=[],left=[];for(let L=0;L<=5;L++){play();setL(L);SM.cnt.wither=0;const b2=near(),F=[];for(let i=0;i<10;i++){const e=foe(b2+.3*(i-4.5),i%4?'soldier':'knight');e.hp=e.maxHp=i%3?2000:300;F.push(e);}const e0=errs;
      for(let c=0;c<3;c++){const al=enemies.filter(x=>!x.dead);if(!al.length)break;cast(al.slice(0,1));run(SPELLS_S.wither.cd);}run(8);
      if(errs>e0)bad.push(L);const n=smLeft();if(n)left.push(L+':'+n);}
    ok('every mastery casts without errors',!bad.length,bad.join(','));ok('and leaves nothing behind (cloud, tendrils, cracks, flower)',!left.length,left.join(' '));}
  /* ---- the power on the Common ladder (the test's own crowds, as in smast-test) ---- */
  {const power=(mode)=>{play();SM.cnt.wither=0;const b2=near(),n=mode==='pack'?12:mode==='churn'?10:1,keep=mode!=='churn',F=[];
      const mk=(i,d)=>{spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=Math.max(.2,d);e.off=(i%3-1)*.2;e.spd=.0001;e.maxHp=keep?4000:600;e.hp=keep?1e9:600;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);e.calI=i;e.calD=d;return e;};
      for(let i=0;i<n;i++)F.push(mk(i,b2+.3*(i-(n-1)/2)));let dmg=0;const S=SPELLS_S.wither;
      const step=sec=>{for(let i=0;i<sec/.05;i++){heroU.cd=1e9;update(.05);updFx(.05);if(mode==='churn')for(let j=0;j<F.length;j++){const e=F[j];if(e.dead||e.hp<=0){dmg+=600;removeEnemy(e);F[j]=mk(e.calI,e.calD);}}}};
      paused=false;const NC=Math.max(4,Math.min(12,Math.round(100/S.cd)));for(let c=0;c<NC;c++){castScrollNow('wither',heroU,tStats(heroU),F.filter(e=>!e.dead),100*smP('wither'),oF());worldSlow=1;slowT=0;step(S.cd);}step(8);paused=true;
      for(const e of F)if(!e.dead)dmg+=keep?1e9-e.hp:e.maxHp-e.hp;return dmg/NC;};
    const W={pack:.4,churn:.35,one:.25},pw=L=>{setL(L);const v={};for(const m in W){v[m]=power(m);meta.heroes[id0]=JSON.parse(h0);}return v;};const b=pw(0),r=[];
    for(let L=1;L<=5;L++){const v=pw(L);let f=0;for(const m in W)f+=W[m]*v[m]/Math.max(1,b[m]);r.push(+f.toFixed(2));}
    ok('power on the ladder: never lower than the mastery before (readings vs the Common targets)',r.every((v,i)=>!i||v>=r[i-1]-.03),r.join(' / ')+' against '+[1,2,3,4,5].map(L=>smTarget('wither',L).toFixed(2)).join(' / '));}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;if(A0)A0.boom=b0;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
