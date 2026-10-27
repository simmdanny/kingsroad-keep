(function(){
/* Frost Shard's masteries as Simon designed them: the card texts and his numbers, Mastery 0 is the old shard, 4 splinters of 15% of the shard's
   damage (any without a foe hit the ground), the deep chill (50% slow instead of 30%, with frost round the feet), Frostbite (ice +15% for 4s,
   other elements unchanged, pale skin that goes back), the sharper shard and its 25% freeze (0.8s, bosses 0.3s, none while Resolve is spent), the
   Shard Lance on every 3rd cast (the line of the most foes, the shard's damage to each foe on it, splinters at the end), clean-up, and the power
   on the Common ladder. Run on the dev page: __kk.ev(await (await fetch('/tests/fsh-test.js')).text()) returns [name, ok, detail] rows. Puts
   the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,off)=>{const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=off||0;e.spd=.0001;e.maxHp=4000;e.hp=1e9;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.frostshard=SM_XP[L-1];else delete meta.smast.frostshard;};
const oF=()=>({src:heroU,bane:0,el:'ice',anc:false,spell:'frostshard'});
const cast=(list,P)=>castScrollNow('frostshard',heroU,tStats(heroU),list,P||100,oF());
const smLeft=()=>scene.children.filter(o=>o.userData&&o.userData.sm).length;
/* the Frost Shard's own hits by kind: the shard or lance ('hit'), the splinters ('spl') */
let H=null;const H0=hurt;const id0=meta.equipped,A0=AURA[id0],b0=A0&&A0.boom,h0=JSON.stringify(hs(id0));
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  if(A0)A0.boom=0;   /* the Monarch's random aura explosion would add hits of its own */
  hurt=function(e,amt,kind,o){if(H&&o&&o.spell==='frostshard'){const k=o.smx?'spl':'hit';(H[k]=H[k]||[]).push([e,Math.round(amt*10)/10]);}return H0.apply(this,arguments);};
  /* ---- the card ---- */
  ok('the card: Splinters, Deep Chill, Frostbite, Glacial Edge, Shard Lance',SM_D.frostshard.map(x=>x.n).join(',')==='Splinters,Deep Chill,Frostbite,Glacial Edge,Shard Lance');
  const T=[0,1,2,3,4].map(i=>smDesc('frostshard',i));
  ok('Simon\'s numbers on the card: 4 splinters of 15%, chilled 20% more (50% instead of 30%), ice +15%, a 25% freeze of 0.8s (bosses 0.3s), every 3rd cast a lance',
    /4 splinters/.test(T[0])&&/15%/.test(T[0])&&/20% more/.test(T[1])&&/50% instead of 30%/.test(T[1])&&/15% more/.test(T[2])&&/pale/.test(T[2])&&/25% chance/.test(T[3])&&/0\.8s/.test(T[3])&&/0\.3s/.test(T[3])&&/Resolve/.test(T[3])&&/3rd cast/.test(T[4]),T.join(' | '));
  /* ---- Mastery 0: the old shard ---- */
  play();setL(0);SM.cnt.frostshard=0;let bd=near(),A=foe(bd),B=foe(bd+.5),C=foe(bd-.5);H={};paused=false;cast([A]);run(1.6);
  ok('Mastery 0 is the old shard: 160% to its foe, a 30% slow, no splinters, no Frostbite',(H.hit||[]).length===1&&H.hit[0][0]===A&&H.hit[0][1]===160&&!(H.spl||[]).length&&A.slow===.3&&!(A.smMk&&A.smMk.ice),JSON.stringify({h:(H.hit||[]).map(x=>x[1]),s:(H.spl||[]).length,slow:A.slow}));
  /* ---- Mastery 1: 4 splinters ---- */
  play();setL(1);SM.cnt.frostshard=0;bd=near();A=foe(bd);const N=[foe(bd+.35),foe(bd-.35),foe(bd+.7),foe(bd-.7),foe(bd+1.05)];H={};cast([A]);run(1.6);
  const sp=H.spl||[];ok('Mastery 1: the shard bursts into 4 splinters, each 15% of its damage (24), into 4 different foes nearby, never its own foe',
    sp.length===4&&sp.every(x=>x[1]===24)&&new Set(sp.map(x=>x[0])).size===4&&sp.every(x=>x[0]!==A),JSON.stringify(sp.map(x=>[N.indexOf(x[0]),x[1]])));
  ok('the 4 it picks are the nearest',sp.every(x=>N.indexOf(x[0])<4&&N.indexOf(x[0])>=0),JSON.stringify(sp.map(x=>N.indexOf(x[0]))));
  play();setL(1);SM.cnt.frostshard=0;bd=near();A=foe(bd);B=foe(bd+.4);H={};cast([A]);run(1.6);
  ok('with one foe nearby only one splinter hits (the other 3 shatter on the ground)',(H.spl||[]).length===1&&H.spl[0][0]===B&&H.spl[0][1]===24,JSON.stringify((H.spl||[]).map(x=>x[1])));
  /* ---- Mastery 2: the deep chill ---- */
  play();setL(2);SM.cnt.frostshard=0;bd=near();A=foe(bd);H={};cast([A]);run(.9);
  ok('Mastery 2: its foe is slowed 50% (30% + 20%) for 1.5s',Math.abs(A.slow-.5)<1e-9&&A.slowT>.9&&A.slowT<=1.5,A.slow+' / '+(A.slowT&&A.slowT.toFixed(2)));
  ok('frost crawls round its feet while it is slowed',!!(A.fshCh&&A.fshCh.live)&&smLeft()>0);
  run(2.2);ok('and melts away when the chill ends',!(A.fshCh&&A.fshCh.live),JSON.stringify(A.fshCh));
  /* ---- Mastery 3: Frostbite ---- */
  play();setL(3);SM.cnt.frostshard=0;bd=near();A=foe(bd);B=foe(bd+3);const mats0=[];A.b.traverse(o=>{if(o.isMesh)mats0.push([o,o.material]);});H={};cast([A]);run(.9);
  const mk=A.smMk&&A.smMk.ice;ok('Mastery 3: its foe is Frostbitten for 4s: ice scrolls deal 15% more to it',!!mk&&Math.abs(mk.v-.15)<1e-9&&mk.until-time>2.8&&mk.until-time<=4,mk&&JSON.stringify({v:mk.v,left:+(mk.until-time).toFixed(2)}));
  /* (a dark hit as the other element: fire on a chilled foe is the Thermal synergy, x1.5) */
  {const h1=A.hp;H0(A,100,'magic',{el:'ice',src:heroU});const di=h1-A.hp,h2=A.hp;H0(A,100,'magic',{el:'dark',src:heroU});const df=h2-A.hp,h3=B.hp;H0(B,100,'magic',{el:'ice',src:heroU});const dB=h3-B.hp;
    ok('an ice hit on it deals 115, a dark hit 100, an ice hit on a foe without Frostbite 100',Math.abs(di-115)<.01&&Math.abs(df-100)<.01&&Math.abs(dB-100)<.01,[di,df,dB].map(v=>v.toFixed(1)).join(' / '));}
  {const pale=A.fshPL||[],tint=new THREE.Color(0xe8f6ff),dist=c=>Math.abs(c.r-tint.r)+Math.abs(c.g-tint.g)+Math.abs(c.b-tint.b),pm=new Set(FSH_PM.values());let bOwn=true;B.b.traverse(o=>{if(o.isMesh&&pm.has(o.material))bOwn=false;});
    ok('its skin turns pale (its own materials swapped for paler ones; the foe beside it, with the same materials, untouched)',pale.length>0&&pale.every(([o,m,p])=>o.material===p&&p!==m&&dist(p.color)<dist(m.color)+1e-6)&&!B.fshPL&&bOwn,pale.length+' meshes');}
  ok('a snowflake turns slowly over it',!!(A.fshFb&&A.fshFb.live));
  run(3.8);ok('after 4s the Frostbite ends: its skin is back to its own materials exactly',!A.fshPL&&mats0.every(([o,m])=>o.material===m)&&!(A.fshFb&&A.fshFb.live)&&!(A.smMk.ice.until>time),mats0.length);
  /* ---- Mastery 4: the sharper shard and the freeze ---- */
  play();setL(4);SM.cnt.frostshard=0;bd=near();A=foe(bd);let flew=0;{const f0=fshShard;fshShard=function(){flew++;return f0.apply(this,arguments);};cast([A]);run(1.6);fshShard=f0;}
  ok('Mastery 4: the shard flies as the new sharper shard and still hits for 160%',flew===1&&(H.hit||[]).some(x=>x[0]===A&&x[1]===160));
  {const c={k:'frostshard',L:4,P:100,o:oF(),lance:true,spl:1,a:[1,1,1,1,1]};const roll=(n,mk)=>{let fz=0,durs=[];for(let i=0;i<n;i++){const e=foe(bd+(i%7)*.2);mk&&mk(e);e.stunT=0;SMF.frostshard.hit(c,e);if(e.stunT>0){fz++;durs.push(e.stunT);}removeEnemy(e);}enemies=enemies.filter(e=>!e.dead);return{fz,durs};};
    const a=roll(400),r=a.fz/400;ok('a foe it hits freezes solid 25% of the time (400 hits: 18-32%)',r>.18&&r<.32,(r*100).toFixed(1)+'%');
    ok('for 0.8s',a.durs.length>0&&a.durs.every(d=>Math.abs(d-.8)<1e-6),a.durs.slice(0,4).join(','));
    const b=roll(200,e=>{e.boss=true;});ok('bosses for 0.3s',b.durs.length>0&&b.durs.every(d=>Math.abs(d-.3)<1e-6),b.fz+' frozen: '+b.durs.slice(0,4).join(','));
    const u=roll(200,e=>{e.unstopT=5;});ok('Resolve applies: a foe whose Resolve is spent is not frozen',u.fz===0,u.fz);
    run(1.5);}
  /* ---- Mastery 5: the Shard Lance ---- */
  play();setL(5);SM.cnt.frostshard=0;bd=near();const P5=[];for(let i=0;i<9;i++)P5.push(foe(bd+.3*(i-4)));A=P5[4];
  const plan=[];for(let n=1;n<=6;n++){H={};const lance0=fshLance;let lc=0;fshLance=function(){lc++;return lance0.apply(this,arguments);};
    const s=heroU,hx0=s.x,hz0=s.z,tp=tpos2(A);let aim=null;{const dx=tp.x-hx0,dz=tp.z-hz0,dl=Math.hypot(dx,dz)||1;aim=jdgAim(hx0+dx/dl*.35,hz0+dz/dl*.35,FSH.len,tStats(heroU).range||3.9,heroU);}
    cast([A]);run(2.4);fshLance=lance0;plan.push({n,lance:lc,hits:(H.hit||[]).map(x=>[P5.indexOf(x[0]),x[1]]),spl:(H.spl||[]).length,aim});}
  ok('Mastery 5: casts 3 and 6 are Shard Lances, the others shards',plan.map(p=>p.lance).join('')==='001001',plan.map(p=>p.lance).join(''));
  /* (the hits as cast: Frostbite's 15% is added inside hurt, checked above) */
  const L3=plan[2],L1=plan[0];ok('a shard hits one foe; the lance pierces several, each once: the first it reaches for the shard\'s damage (160), every one after it '+Math.round(FSH.lance*100)+'% of that',
    L1.hits.length===1&&L3.hits.length>=3&&L3.hits[0][1]===160&&L3.hits.slice(1).every(x=>Math.abs(x[1]-160*FSH.lance)<.06)&&new Set(L3.hits.map(x=>x[0])).size===L3.hits.length,JSON.stringify({shard:L1.hits,lance:L3.hits}));
  {const ux=L3.aim?L3.aim.ux:0,uz=L3.aim?L3.aim.uz:0,hx=heroU.x+ux*.4,hz=heroU.z+uz*.4,exp=P5.map((q,i)=>{const qx=q.x-hx,qz=q.z-hz,pr=qx*ux+qz*uz,lat=Math.abs(-qx*uz+qz*ux);return pr>-.2&&pr<=FSH.len+.1&&lat<=FSH.w?i:-1;}).filter(i=>i>=0).sort((a,b)=>a-b);
    ok('it drives along the line of the most foes and hits exactly the foes on that line',!!L3.aim&&JSON.stringify(L3.hits.map(x=>x[0]).sort((a,b)=>a-b))===JSON.stringify(exp),JSON.stringify({got:L3.hits.map(x=>x[0]).sort((a,b)=>a-b),exp}));}
  ok('it shatters just past the last foe on its line, into the 4 splinters among them',L3.spl>=1&&L3.spl<=4,L3.spl);
  ok('every foe the lance pierces is Frostbitten too',P5.filter((q,i)=>L3.hits.some(x=>x[0]===i)).every(q=>!q.dead&&q.smMk&&q.smMk.ice&&q.fshFb));
  /* ---- every level casts clean and leaves nothing behind ---- */
  {const bad=[],left=[];for(let L=0;L<=5;L++){play();setL(L);SM.cnt.frostshard=0;const b2=near(),F=[];for(let i=0;i<10;i++){const e=foe(b2+.3*(i-4.5),(i%3-1)*.2);e.hp=e.maxHp=i%3?2000:300;F.push(e);}const e0=errs;
      for(let c=0;c<6;c++){const al=enemies.filter(x=>!x.dead);if(!al.length)break;cast(al.slice(0,1));run(SPELLS_S.frostshard.cd);}run(6);
      if(errs>e0)bad.push(L);const n=smLeft(),pl=enemies.filter(e=>e.fshPL).length;if(n||pl)left.push(L+':'+n+'/'+pl);}
    ok('every mastery casts without errors',!bad.length,bad.join(','));ok('and leaves nothing behind (no effects, no pale materials)',!left.length,left.join(' '));}
  /* ---- the power on the Common ladder (the test's own crowds, as in smast-test) ---- */
  {const power=(mode)=>{play();SM.cnt.frostshard=0;const b2=near(),n=mode==='pack'?12:mode==='churn'?10:1,keep=mode!=='churn',F=[];
      for(let i=0;i<n;i++){spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=Math.max(.2,b2+.3*(i-(n-1)/2));e.off=(i%3-1)*.2;e.spd=.0001;e.maxHp=keep?4000:600;e.hp=keep?1e9:600;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);e.calI=i;e.calD=e.dist;F.push(e);}
      let dmg=0;const S=SPELLS_S.frostshard;const step=sec=>{for(let i=0;i<sec/.05;i++){heroU.cd=1e9;update(.05);updFx(.05);if(mode==='churn')for(let j=0;j<F.length;j++){const e=F[j];if(e.dead||e.hp<=0){dmg+=600;removeEnemy(e);
        spawnEnemy({type:e.calI%4?'soldier':'knight',v:0},20);const q=enemies[enemies.length-1];q.route=ROUTES[0];q.dist=e.calD;q.off=(e.calI%3-1)*.2;q.spd=.0001;q.maxHp=600;q.hp=600;q.armor=0;q.res={};q.shield=0;moveEnemy(q,0);q.calI=e.calI;q.calD=e.calD;F[j]=q;}}}};
      paused=false;for(let c=0;c<12;c++){castScrollNow('frostshard',heroU,tStats(heroU),F.filter(e=>!e.dead),100*smP('frostshard'),oF());worldSlow=1;slowT=0;step(S.cd);}step(8);paused=true;
      for(const e of F)if(!e.dead)dmg+=keep?1e9-e.hp:e.maxHp-e.hp;return dmg/12;};
    const W={pack:.4,churn:.35,one:.25},pw=L=>{setL(L);const v={};for(const m in W){v[m]=power(m);meta.heroes[id0]=JSON.parse(h0);}return v;};const b=pw(0),r=[];
    for(let L=1;L<=5;L++){const v=pw(L);let f=0;for(const m in W)f+=W[m]*v[m]/Math.max(1,b[m]);r.push(+f.toFixed(2));}
    ok('power on the ladder: never lower than the mastery before (readings vs the Common targets)',r.every((v,i)=>!i||v>=r[i-1]-.03),r.join(' / ')+' against '+[1,2,3,4,5].map(L=>smTarget('frostshard',L).toFixed(2)).join(' / '));}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;if(A0)A0.boom=b0;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
