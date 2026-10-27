(function(){
if(typeof hxSpark!=='function')return [['Hexspark masteries are not in this build: skipped',true,'']];
/* Hexspark's masteries as Simon redesigned them: Splinters (obsidian shards, 20%), Overcharge (the hero's spark charges 1s and bursts for 130%,
   splash too; echo sparks keep the quick fuse), Twin Spark (a comet, then a spark for 50%), Black Nova (the burst Hexes for 4s; a Hexed foe that
   dies explodes for 40% within 0.9), Hexstorm (every 3rd cast, black lightning and sparks on 2 more foes for 60%). Run on the dev page:
   __kk.ev(await (await fetch('/tests/hxm-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,hp,off)=>{const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=off||0;e.spd=.0001;e.maxHp=e.hp=hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.hexspark=SM_XP[L-1];else delete meta.smast.hexspark;};
const oF=()=>({src:heroU,bane:0,el:'dark',anc:false,spell:'hexspark'});
const cast=(L,list,P)=>{setL(L);castScrollNow('hexspark',heroU,tStats(heroU),list,P||100,oF());};
const lost=e=>e.maxHp-e.hp;const D=140;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
/* (files session, v386) as in tests/smast-test.js: the probe pinned to the middle of the road, and the hero's aura boom (Monarch: a random
   blast on kills near him) off, or a kill near the hero can add a no-spell 92.6 to the Black Nova check */
const BOOM={};for(const k in AURA)if(AURA[k]&&AURA[k].boom){BOOM[k]=AURA[k].boom;AURA[k].boom=0;}
try{
  play();meta.smast={};SM.cnt.hexspark=0;
  ok('the five masteries are Simon’s',SM_D.hexspark.map(p=>p.n).join()==='Splinters,Overcharge,Twin Spark,Black Nova,Hexstorm'&&/1s/.test(SM_D.hexspark[1].d)&&/130%/.test(SM_D.hexspark[1].d)&&SM_D.hexspark.every((p,i)=>!/\{/.test(smDesc('hexspark',i))),SM_D.hexspark.map(p=>p.n).join());
  /* ---- Mastery 0: the old spark, exactly ---- */
  {const bd=near(),e=foe(bd,1e6);let used=0;const o0=HXS.old;HXS.old=function(){used++;return o0.apply(this,arguments);};try{cast(0,[e]);run(.4);const h0=lost(e);run(.2);ok('Mastery 0: the old spark, 140% after 0.45s',used===1&&h0===0&&Math.abs(lost(e)-D)<.5,used+' / '+lost(e));}finally{HXS.old=o0;}clean();}
  /* ---- M1: two shards for 20% each to the nearest foes ---- */
  {const bd=near(),e=foe(bd,1e6),a=foe(bd+1.1,1e6),b=foe(bd-1.1,1e6),far=foe(bd+3,1e6);cast(1,[e]);run(1.2);
    ok('Splinters: two shards, 20% each, to the foes nearby',Math.abs(lost(a)-D*.2*SMA.hexspark[0])<.5&&Math.abs(lost(b)-D*.2*SMA.hexspark[0])<.5&&lost(far)===0&&Math.abs(lost(e)-D)<.5,[lost(e),lost(a),lost(b),lost(far)].map(v=>v.toFixed(1)).join(' / '));clean();}
  /* ---- M2: 1s charge, then 130% (the splash too) ---- */
  {const bd=near(),e=foe(bd,1e6),s=foe(bd+.25,1e6);cast(2,[e]);run(.9);const h0=lost(e);run(.3);
    ok('Overcharge: nothing for a second, then the burst for 130%',h0===0&&Math.abs(lost(e)-D*1.3)<.5,h0+' then '+lost(e).toFixed(1));ok('and its splash is 130% too',Math.abs(lost(s)-D*1.3*.35)<.5,lost(s).toFixed(1));clean();}
  /* ---- M3: the twin spark, 50%, on its quick fuse ---- */
  {const bd=near(),e=foe(bd,1e6),q=foe(bd+1.4,1e6);cast(3,[e]);run(1.25);const t0=lost(q);run(.8);
    const x3=D*.2*SMA.hexspark[0]+D*.5*SMA.hexspark[2];ok('Twin Spark: a comet, then a spark for 50% (and Splinters’ shard) on the next foe',t0===0&&Math.abs(lost(q)-x3)<.6,t0+' then '+lost(q).toFixed(1)+' (expected '+x3.toFixed(1)+')');clean();}
  /* ---- M4: Hexed for 4s; a Hexed foe that dies explodes for 40% within 0.9 ---- */
  {const bd=near(),e=foe(bd,1e6),n=foe(bd+.5,1e6),f=foe(bd+2.2,1e6);cast(4,[e]);run(2.5);const hx=e.hxHexT>time,n0=lost(n),f0=lost(f);e.hp=1;hurt(e,10,'magic',{src:heroU,el:'dark'});run(.5);
    ok('Black Nova: the burst Hexes the foe',hx,e.hxHexT);ok('and when it dies it explodes for 40% around it',e.dead&&Math.abs(lost(n)-n0-D*.4*SMA.hexspark[3])<.6&&lost(f)===f0,(lost(n)-n0).toFixed(1)+' (expected '+(D*.4*SMA.hexspark[3]).toFixed(1)+') / far '+(lost(f)-f0).toFixed(1));clean();}
  /* ---- M5: three foes far apart (no shards, twins or splash between them): whichever foe the spark picks, a cast deals one burst (130%)
     and every 3rd cast adds 2 sparks for 60% ---- */
  {const bd=near(),F=[foe(bd,1e6),foe(bd+3,1e6),foe(bd-3,1e6)],gap=Math.min(...[[0,1],[0,2],[1,2]].map(([a,b])=>Math.hypot(F[a].x-F[b].x,F[a].z-F[b].z)));SM.cnt.hexspark=0;const r=[];
    for(let i=0;i<3;i++){const h=F.reduce((t,q)=>t+lost(q),0);cast(5,F);run(3);r.push(F.reduce((t,q)=>t+lost(q),0)-h);}
    const b=D*1.3,x=b+2*D*.6*SMA.hexspark[4];
    ok('Hexstorm: the 3rd cast adds black lightning and 2 sparks for 60% each',gap>2.1&&Math.abs(r[0]-b)<.6&&Math.abs(r[1]-b)<.6&&Math.abs(r[2]-x)<1,r.map(v=>v.toFixed(1)).join(' / ')+' (expected '+b.toFixed(1)+' twice, then '+x.toFixed(1)+'; foes '+gap.toFixed(2)+' apart)');clean();}
  /* ---- the ring fix: a ring starts small (no full-size flash on its first frame) ---- */
  {const n0=scene.children.length;ringFx(0,.1,0,.5,0xffffff,.3);const m=scene.children[scene.children.length-1];ok('a ring starts at its first size, not full size',scene.children.length===n0+1&&Math.abs(m.scale.x-.15)<1e-6,m.scale.x);run(.5);}
  /* ---- every mastery casts clean and leaves nothing ---- */
  {const left=[],e0=errs;for(let L=1;L<=5;L++){play();SM.cnt.hexspark=0;const bd=near(),F=[];for(let i=0;i<8;i++)F.push(foe(bd+.3*(i-3.5),i%3?3000:300));const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};
      for(let c=0;c<4;c++){cast(L,enemies.filter(x=>!x.dead));run(4);}run(6);scene.add=S0;const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});
      if(st.length)left.push('M'+L+':'+st.length);clean();}
    ok('every mastery leaves nothing behind',!left.length,left.join(' '));ok('and casts without errors',errs===e0,errs-e0);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{for(const k in BOOM)AURA[k].boom=BOOM[k];scene.add=S0;console.error=ce;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
