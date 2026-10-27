(function(){
if(typeof flmCast!=='function')return JSON.stringify([['Flame Lash mastery rework is not in this build: skipped',true,'']]);
/* Flame Lash's reworked masteries: the texts, an unmastered cast left to castFlameLash, a mastered cast drawing its own whip with the same
   crack damage, Long Lash's extra tile, Searing's burn and its flames, Blazing Trail (35% harder hits, 5s burn, a trail of fire as it sweeps),
   Fire Snake's flames and serpent, Inferno Cross's second whip and explosion, and every mastery casting clean and tidying up.
   Run on the dev page: __kk.ev(await (await fetch('/tests/flm-test.js')).text()) returns [name, ok, detail] rows. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i,hp,off)=>{const R=ROUTES[0];spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=off==null?0:off;e.spd=.0001;e.maxHp=hp;e.hp=hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const SMX=typeof SM_XP!=='undefined'?SM_XP:MAST_XP;const setL=L=>{meta.smast={};if(L)meta.smast.flamelash=SMX[L-1];};
const oF=()=>({src:heroU,bane:0,el:'fire',anc:false,spell:'flamelash'});
const cast=(list,P)=>{castScrollNow('flamelash',heroU,tStats(heroU),list,P||100,oF());worldSlow=1;slowT=0;};
const id=meta.equipped,AU=typeof AURA!=='undefined'&&AURA[id],boom0=AU&&AU.boom;if(AU)AU.boom=0;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
const keep={flmCast,flmLash,flmSnake,flmBoom,flmBurnFx,smZone,nsDecal};
const restore=()=>{flmCast=keep.flmCast;flmLash=keep.flmLash;flmSnake=keep.flmSnake;flmBoom=keep.flmBoom;flmBurnFx=keep.flmBurnFx;smZone=keep.smZone;nsDecal=keep.nsDecal;};
try{
  /* ---- texts ---- */
  {const D=SM_D.flamelash,t=[0,1,2,3,4].map(i=>smDesc('flamelash',i));
   ok('Long Lash, Searing, Fire Snake and Inferno Cross stay; Blazing Trail is new',D.map(p=>p.n).join(',')==='Long Lash,Searing,Blazing Trail,Fire Snake,Inferno Cross',D.map(p=>p.n).join(','));
   ok('the texts carry their numbers',t.every(x=>!/\{/.test(x))&&/35% harder/.test(t[2])&&/5s/.test(t[2])&&/\d+%/.test(t[0])&&/\d+%/.test(t[4]),t[2]);
   ok('the patch notes and the changelog tell of it',/Flame Lash masteries, reworked/.test(NOTES_HTML)&&CLOG.some(c=>c.t==='Flame Lash masteries, reworked'));}
  /* ---- who draws the whip, and the crack damage ---- */
  {let n=0;flmCast=function(){n++;return keep.flmCast.apply(this,arguments);};const dmgAt=L=>{play();setL(L);const bd=near(),e=foe(bd,0,1e6);cast([e]);run(.45);return 1e6-e.hp;};
   const d0=dmgAt(0),n0=n,d1=dmgAt(1);restore();
   ok('an unmastered cast is left to the old whip; a mastered one draws its own',n0===0&&n===1,n0+' / '+n);
   ok('with the same crack damage (80%)',d0>=80&&Math.abs(d1/d0-1)<.02,d0.toFixed(1)+' / '+d1.toFixed(1));clean();}
  /* ---- Long Lash ---- */
  {const extHit=L=>{play();setL(L);const bd=near(),e=foe(bd,0,1e6);let cc=null;flmCast=function(c){cc=c;return keep.flmCast.apply(this,arguments);};cast([e]);restore();
     const F=cc&&cc.flm;let x=null;if(F){const dir=Math.sign(F.dB-F.dA)||1;x=foe(F.dB+dir*.6,1,1e6);}else{const s=s6Route(e),dir=1;x=foe(s.d+1.7,1,1e6);}run(1);const r=1e6-x.hp;clean();return r;};
   const h0=extHit(0),h1=extHit(1),want=100*1.2*.3*SMA.flamelash[0];
   ok('Long Lash: the whip runs a tile past its tip and hits there for its share',h0===0&&Math.abs(h1-want)<want*.05,h0.toFixed(1)+' / '+h1.toFixed(1)+' (want '+want.toFixed(1)+')');}
  /* ---- Searing ---- */
  {play();setL(2);let fxn=0;flmBurnFx=function(){fxn++;return keep.flmBurnFx.apply(this,arguments);};const bd=near(),e=foe(bd,0,1e6),f=foe(bd+.3,1,1e6);cast([e,f]);run(.45);restore();
   ok('Searing: foes it hits burn 3s, and burn visibly',e.burn&&e.burn.t>2.8&&e.burn.t<=3.01&&e.burn.dps>=100*1.2*.12*SMA.flamelash[1]-1e-6&&fxn===2&&e.flmB&&fx.includes(e.flmB),(e.burn&&e.burn.t.toFixed(2))+' '+fxn);
   run(3.2);ok('and the flames go out with the burn',!e.flmB||!fx.includes(e.flmB));clean();}
  /* ---- Blazing Trail ---- */
  {const hit=L=>{play();setL(L);const bd=near(),e=foe(bd,0,1e6);cast([e]);run(.42);const d=1e6-e.hp,b=e.burn&&e.burn.t;clean();return[d,b];};
   const h2=hit(2),h3=hit(3);ok('Blazing Trail: the lash hits 35% harder',Math.abs(h3[0]/h2[0]-1.35)<.04,h2[0].toFixed(1)+' -> '+h3[0].toFixed(1));
   ok('and its burn lasts 5s',h3[1]>4.9&&h3[1]<=5.01,h3[1]);
   const decals=L=>{play();setL(L);const bd=near(),e=foe(bd,0,1e6);let n=0;cast([e]);run(.12);nsDecal=function(){n++;return keep.nsDecal.apply(this,arguments);};run(.27);restore();run(2.5);clean();return n;};
   const t2=decals(2),t3=decals(3);ok('and it leaves a trail of fire as it sweeps',t3>=t2+3,t2+' -> '+t3);}
  /* ---- Fire Snake ---- */
  {play();setL(4);let z=0,sn=0;smZone=function(){z++;return keep.smZone.apply(this,arguments);};flmSnake=function(){sn++;return keep.flmSnake.apply(this,arguments);};const bd=near(),e=foe(bd,0,1e6);cast([e]);run(.6);restore();
   ok('Fire Snake: the same 5 flames along the line, with a serpent through them',z===5&&sn===1,z+' / '+sn);run(3.5);clean();}
  /* ---- Inferno Cross ---- */
  {play();setL(5);let lashes=0,booms=0,bd0=0;flmLash=function(){lashes++;return keep.flmLash.apply(this,arguments);};flmBoom=function(c,x,z,d){booms++;bd0=d;return keep.flmBoom.apply(this,arguments);};
   const bd=near(),e=foe(bd,0,1e6),side=foe(bd,1,1e6,.75);cast([e]);run(1.3);restore();const want=100*1.2*.25*SMA.flamelash[4];
   ok('Inferno Cross: a second whip cracks across the first and the crossing explodes',lashes===2&&booms===1&&Math.abs(bd0-want)<1e-6,lashes+' lashes, '+booms+' boom');
   ok('for its share to foes around the crossing',Math.abs((1e6-side.hp)-want)<want*.05,(1e6-side.hp).toFixed(1)+' (want '+want.toFixed(1)+')');run(3);clean();}
  /* ---- every mastery: clean casts, nothing left behind ---- */
  {const bad=[],left=[];for(let L=1;L<=5;L++){play();setL(L);SM.cnt.flamelash=0;const bd=near();for(let i=0;i<10;i++)foe(bd+.3*(i-4.5),i,i%3?3000:150,(i%3-1)*.2);const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};
     const e0=errs;for(let n=0;n<4;n++){cast(enemies.filter(x=>!x.dead));run(7);}run(8);scene.add=S0;if(errs>e0)bad.push(L);
     const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});if(st.length)left.push(L+':'+st.length);clean();}
   ok('every mastery casts without errors',!bad.length,bad.join(','));ok('and leaves nothing behind',!left.length,left.join(' '));}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;scene.add=S0;restore();if(AU)AU.boom=boom0;
  try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
