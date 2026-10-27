(function(){
if(typeof sskOrb!=='function')return JSON.stringify([['Static Spark mastery rework is not in this build (before v376): skipped',true,'']]);
/* Static Spark's reworked masteries (v376): the texts, Longer Arc's two extra leaps, Static Remnants (ground sparks where a foe dies to the
   spark: 2% max health a second, bosses 0.8%, ground foes only, 3.5s, none below Mastery 2), Static Shock rolled before the leap (every stun
   comes with a charged, heavier leap), Thunder Burst (35% chance on a kill, 35% of the spark hit on that foe, to every foe around, flyers too,
   at most 6 a cast), the Spark Orb, and every mastery casting clean and tidying up. Run on the dev page:
   __kk.ev(await (await fetch('/tests/smss-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i,hp,off)=>{const R=ROUTES[0];spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=off==null?(i%3-1)*.2:off;e.spd=.0001;e.maxHp=hp;e.hp=hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const SMX=typeof SM_XP!=='undefined'?SM_XP:MAST_XP;const setL=L=>{meta.smast={};if(L)meta.smast.staticspark=SMX[L-1];};
const oF=()=>({src:heroU,bane:0,el:'lightning',anc:false,spell:'staticspark'});
const cast=(list,P)=>{castScrollNow('staticspark',heroU,tStats(heroU),list,P||100,oF());worldSlow=1;slowT=0;};
/* the Monarch's random aura explosion is off, as in the rarity tests */
const id=meta.equipped,AU=typeof AURA!=='undefined'&&AURA[id],boom0=AU&&AU.boom;if(AU)AU.boom=0;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
const keep={sskLeap,sskStun,sskCharge,sskBurst,sskOrb,sskOnKill,sskRemnant};
try{
  /* ---- texts ---- */
  {const D=SM_D.staticspark,t=[0,1,2,3,4].map(i=>smDesc('staticspark',i));
   ok('Longer Arc, Static Shock and Spark Orb stay; Static Remnants and Thunder Burst are new',D.map(p=>p.n).join(',')==='Longer Arc,Static Remnants,Static Shock,Thunder Burst,Spark Orb',D.map(p=>p.n).join(','));
   ok('the texts carry their numbers',t.every(x=>!/\{/.test(x))&&/2% of their max health a second \(bosses 0\.8%\)/.test(t[1])&&/3\.5s/.test(t[1])&&/35% chance/.test(t[3])&&/\d+% of the spark hit/.test(t[3]),t[1].slice(0,60)+' | '+t[3].slice(0,70));
   ok('the patch notes and the changelog tell of it',(NOTES_V!=='masteries-1'||/Static Spark masteries, reworked/.test(NOTES_HTML))&&CLOG.some(c=>c.t==='Static Spark masteries, reworked'));}
  /* ---- Longer Arc ---- */
  {play();setL(1);const bd=near(),F=[];for(let i=0;i<8;i++)F.push(foe(bd+.5*(i-1),i,1e6));cast(F.slice());run(2.5);const hit=F.filter(e=>e.hp<e.maxHp).length;
   ok('Longer Arc: the spark hits 4 foes and leaps 2 more times (6 in all)',hit===6,hit);clean();}
  /* ---- Static Remnants ---- */
  {play();setL(1);const bd=near();let F=[foe(bd,0,1)];for(let i=1;i<4;i++)F.push(foe(bd+3+i*.5,i,1e6));const n0=SSK.rem.filter(f=>f.life>0).length;cast(F.slice());run(.6);
   ok('below Mastery 2 a kill leaves no remnant',F[0].dead&&SSK.rem.filter(f=>f.life>0).length===n0);clean();
   play();setL(2);const bd2=near();F=[foe(bd2,0,1,0)];for(let i=1;i<4;i++)F.push(foe(bd2+3+i*.5,i,1e6));cast(F.slice());run(.5);const live=SSK.rem.filter(f=>f.life>0&&fx.includes(f));
   ok('at Mastery 2 a foe that dies to the spark leaves sparks on the ground',F[0].dead&&live.length===1,live.length);
   for(const e of F.slice(1))removeEnemy(e);enemies=enemies.filter(e=>!e.dead);
   const a=foe(bd2,0,1e4,0),b=foe(bd2,1,1e4,0),c=foe(bd2,2,1e4,0),far=foe(bd2+2.5,3,1e4,0);b.boss=true;c.fly=true;run(2);
   const pa=(1e4-a.hp)/1e4*100,pb=(1e4-b.hp)/1e4*100;
   ok('a foe standing on them takes 2% of its max health a second',Math.abs(pa-4)<.6,pa.toFixed(2)+'% in 2s');
   ok('a boss 0.8% a second',Math.abs(pb-1.6)<.3,pb.toFixed(2)+'% in 2s');
   ok('flyers and foes away from it take nothing',c.hp===1e4&&far.hp===1e4,(1e4-c.hp)+' / '+(1e4-far.hp));
   run(1.4);ok('the sparks last 3.5s',!live[0].life||live[0].life<=0||!fx.includes(live[0]),live[0].life);clean();}
  /* ---- Static Shock ---- */
  {play();setL(3);let leaps=0,emp=0,stuns=0,charges=0;sskLeap=function(c,A,B,e){leaps++;if(e)emp++;return keep.sskLeap.apply(this,arguments);};sskStun=function(){stuns++;return keep.sskStun.apply(this,arguments);};
   sskCharge=function(){charges++;return keep.sskCharge.apply(this,arguments);};
   const bd=near();const F=[];for(let i=0;i<8;i++)F.push(foe(bd+.5*(i-1),i,1e9));for(let n=0;n<60;n++){for(const e of F){e.stunT=0;e.rsv=0;e.unstopT=0;}cast(F.slice());run(1.6);}
   sskLeap=keep.sskLeap;sskStun=keep.sskStun;sskCharge=keep.sskCharge;
   /* 60 casts, about 360 leaps: a 25% roll lands within 12%..38% (more than 5 standard deviations either way) */
   ok('Static Shock stuns about 1 leap in 4',leaps>=300&&emp/leaps>.12&&emp/leaps<.38,emp+'/'+leaps);
   ok('every stun comes on a heavier leap, and every heavier leap was charged first',stuns===emp&&charges===emp,stuns+' stuns, '+emp+' heavy leaps, '+charges+' charges');clean();
   play();setL(2);let e2=0;sskLeap=function(c,A,B,e){if(e)e2++;return keep.sskLeap.apply(this,arguments);};const bd2=near(),G=[];for(let i=0;i<6;i++)G.push(foe(bd2+.5*(i-1),i,1e9));for(let n=0;n<8;n++){cast(G.slice());run(1.6);}
   sskLeap=keep.sskLeap;ok('below Mastery 3 no leap stuns',e2===0&&G.every(e=>!(e.stunT>0)),e2);clean();}
  /* ---- Thunder Burst ---- */
  {play();setL(4);const bd=near(),A=foe(bd,0,1e4,0),B=foe(bd+.4,1,1e4),Cf=foe(bd-.4,2,1e4),Far=foe(bd+3,3,1e4),S=foe(bd+.2,4,1e4);Cf.fly=true;
   const c={L:4,a:[1,1,1,1,1],P:100,id:-7,o:Object.assign(oF(),{smId:-7})};sskBurst(c,A.x,A.z,100,S);
   ok('a burst hits every foe around it for its damage, flyers too',Math.abs(1e4-A.hp-100)<1&&Math.abs(1e4-B.hp-100)<1&&Math.abs(1e4-Cf.hp-100)<1,[A,B,Cf].map(e=>Math.round(1e4-e.hp)).join('/'));
   ok('but not foes beyond it, nor the foe that burst',Far.hp===1e4&&S.hp===1e4);run(1);clean();
   play();setL(4);let kills=0,bursts=0,ratio=[],per=[];const seen=new Set();
   sskOnKill=function(c,e){if(e&&!seen.has(e)){seen.add(e);kills++;}return keep.sskOnKill.apply(this,arguments);};
   sskBurst=function(c,x,z,d,e){bursts++;per.push(c.id);if(e&&e.sskA)ratio.push(d/(.35*c.a[3]*e.sskA));return keep.sskBurst.apply(this,arguments);};
   const bd2=near();for(let n=0;n<25;n++){const F=[];for(let i=0;i<8;i++)F.push(foe(bd2+.45*(i-1),i,1));cast(F.slice());run(1.8);clean();}
   sskOnKill=keep.sskOnKill;sskBurst=keep.sskBurst;const cnt={};for(const q of per)cnt[q]=(cnt[q]||0)+1;
   ok('a foe the spark kills bursts about 1 time in 3 (35%)',kills>=80&&bursts/kills>.22&&bursts/kills<.5,bursts+'/'+kills);
   ok('for 35% of the spark hit on that foe',ratio.length>5&&ratio.every(r=>Math.abs(r-1)<1e-6),ratio.length+' checked');
   ok('at most 6 bursts a cast',Object.values(cnt).every(v=>v<=6),JSON.stringify(cnt).slice(0,80));
   play();setL(3);let b3=0;sskBurst=function(){b3++;return keep.sskBurst.apply(this,arguments);};const bd3=near();for(let n=0;n<6;n++){const F=[];for(let i=0;i<8;i++)F.push(foe(bd3+.45*(i-1),i,1));cast(F.slice());run(1.8);clean();}
   sskBurst=keep.sskBurst;ok('below Mastery 4 nothing bursts',b3===0,b3);}
  /* ---- Spark Orb ---- */
  {play();setL(5);let orbs=0,od=0;sskOrb=function(c,x,z,d){orbs++;od=d/(c.P*c.a[4]);return keep.sskOrb.apply(this,arguments);};const bd=near(),F=[];for(let i=0;i<6;i++)F.push(foe(bd+.5*(i-1),i,1e9));
   const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};cast(F.slice());run(1.6);scene.add=S0;sskOrb=keep.sskOrb;
   const orb=added.find(o=>o.userData&&o.userData.sm&&o.type==='Group'&&o.children.length>=8&&o.parent===scene);
   ok('at Mastery 5 an orb stays where the spark ends, zapping for 25%',orbs===1&&Math.abs(od-.25)<1e-6&&!!orb,orbs+' '+od);
   if(orb){run(3.2);ok('and is gone after 3s',!orb.parent);}clean();}
  /* ---- every mastery: clean casts, nothing left behind ---- */
  {const bad=[],left=[];for(let L=1;L<=5;L++){play();setL(L);SM.cnt.staticspark=0;const bd=near();for(let i=0;i<10;i++)foe(bd+.3*(i-4.5),i,i%3?2000:120);const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};
     const e0=errs;for(let n=0;n<5;n++){cast(enemies.filter(x=>!x.dead));run(3.5);}run(10);scene.add=S0;if(errs>e0)bad.push(L);
     const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});if(st.length)left.push(L+':'+st.length);clean();}
   ok('every mastery casts without errors',!bad.length,bad.join(','));ok('and leaves nothing behind',!left.length,left.join(' '));}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;scene.add=S0;sskLeap=keep.sskLeap;sskStun=keep.sskStun;sskCharge=keep.sskCharge;sskBurst=keep.sskBurst;sskOrb=keep.sskOrb;sskOnKill=keep.sskOnKill;sskRemnant=keep.sskRemnant;if(AU)AU.boom=boom0;
  try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
