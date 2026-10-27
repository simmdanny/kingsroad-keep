(function(){
if(typeof wofCast!=='function')return JSON.stringify([['Wall of Fire mastery rework is not in this build: skipped',true,'']]);
/* Wall of Fire's masteries, redesigned by Simon: the texts, an unmastered cast left to castFireWall, a mastered cast raising its own wall
   with the same first-touch hit, Scorching Passage's longer burn, Flashpoint's flare, Trail of Embers' burning ground, Blazing Perdition's
   feeding and blast, Ring of Damnation (the ring, Fear, its critical strikes, the closing strike, the ring of embers), and every mastery
   casting clean and tidying up. Run on the dev page: __kk.ev(await (await fetch('/tests/wof-test.js')).text()) returns [name, ok, detail]
   rows. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i,hp,off)=>{const R=ROUTES[0];spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=off==null?0:off;e.spd=.0001;e.maxHp=hp;e.hp=hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const put=(e,d)=>{e.dist=d;moveEnemy(e,0);};
const SMX=typeof SM_XP!=='undefined'?SM_XP:MAST_XP;const setL=L=>{meta.smast={};if(L)meta.smast.firewall=SMX[L-1];};
const oF=()=>({src:heroU,bane:0,el:'fire',anc:false,spell:'firewall'});
let last=null;const cast=(list,P)=>{last=null;castScrollNow('firewall',heroU,tStats(heroU),list,P||100,oF());worldSlow=1;slowT=0;return last;};
const id=meta.equipped,AU=typeof AURA!=='undefined'&&AURA[id],boom0=AU&&AU.boom;if(AU)AU.boom=0;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
const keep={wofCast,wofFlare,wofBlast,wofClose};
wofCast=function(c){const r=keep.wofCast.apply(this,arguments);last=c;return r;};
const restore=()=>{wofCast=keep.wofCast;wofFlare=keep.wofFlare;wofBlast=keep.wofBlast;wofClose=keep.wofClose;};
const a=SMA.firewall;
try{
  /* ---- texts ---- */
  {const D=SM_D.firewall,t=[0,1,2,3,4].map(i=>smDesc('firewall',i));
   ok('Simon\'s five masteries, by name',D.map(p=>p.n).join(',')==='Scorching Passage,Flashpoint,Trail of Embers,Blazing Perdition,Ring of Damnation',D.map(p=>p.n).join(','));
   ok('the texts carry their numbers',t.every(x=>!/\{/.test(x))&&/2 seconds/.test(t[0])&&/\d+%/.test(t[1])&&/3s/.test(t[2])&&/6 foes/.test(t[3])&&/50% slower/.test(t[4])&&/15%/.test(t[4])&&/double/.test(t[4]),t[4]);
   ok('the patch notes and the changelog tell of it',/Wall of Fire masteries, redesigned/.test(NOTES_HTML)&&/Feared/.test(NOTES_HTML)&&CLOG.some(c=>c.t==='Wall of Fire masteries, redesigned'));}
  /* ---- who raises the wall, and its first touch ---- */
  {let n=0;const w0=wofCast;wofCast=function(){n++;return w0.apply(this,arguments);};
   const touch=L=>{play();setL(L);const bd=near(),e=foe(bd,0,1e6),x=foe(bd+1.5,1,1e6);cast([e]);run(.35);const r=1e6-x.hp;clean();return r;};
   const d0=touch(0),n0=n,d1=touch(1);wofCast=w0;
   ok('an unmastered cast is left to the old wall; a mastered one raises its own',n0===0&&n===1,n0+' / '+n);
   ok('with the same first touch (80%)',d0>=80&&d0<90&&Math.abs(d1/d0-1)<.03,d0.toFixed(1)+' / '+d1.toFixed(1));}
  /* ---- Scorching Passage ---- */
  {const left=L=>{play();setL(L);const bd=near(),e=foe(bd,0,1e6),x=foe(bd+1.5,1,1e6);cast([e]);run(1);put(x,bd+3);run(.1);const r=x.burn?x.burn.t:0;clean();return r;};
   const b0=left(0),b1=left(1);ok('Scorching Passage: foes burn 5s after leaving the wall (3s without)',b0>2.6&&b0<=3.01&&b1>4.6&&b1<=5.01,b0.toFixed(2)+' / '+b1.toFixed(2));}
  /* ---- Flashpoint ---- */
  {const flare=L=>{play();setL(L);let fl=0;wofFlare=function(){fl++;return keep.wofFlare.apply(this,arguments);};const bd=near(),e=foe(bd,0,1e6),x=foe(bd+1.5,1,1e6),y=foe(bd+1.95,2,1e6);
     cast([e]);run(.5);const hy=1e6-y.hp;put(x,bd+3);run(.4);put(x,bd+1.5);run(.4);const hy2=1e6-y.hp;wofFlare=keep.wofFlare;clean();return{fl,hy,hy2};};
   const f1=flare(1),f2=flare(2),want=100*.25*a[1];
   ok('Flashpoint: the first touch flares, hurting the foe and those around it',f1.fl===0&&f1.hy===0&&f2.fl===1&&Math.abs(f2.hy-want)<want*.05,JSON.stringify(f1)+' '+JSON.stringify(f2)+' want '+want.toFixed(1));
   ok('only the first time a foe crosses',f2.fl===1&&Math.abs(f2.hy2-f2.hy)<1e-6,f2.hy.toFixed(2)+' -> '+f2.hy2.toFixed(2));}
  /* ---- Trail of Embers ---- */
  {const emb=L=>{play();setL(L);const bd=near(),e=foe(bd,0,1e6);const W=cast([e]);run(5.5);const z=foe(bd+1.5,1,1e6,.1),far=foe(bd+2.4,2,1e6);run(1);const h1=1e6-z.hp,hf=1e6-far.hp;run(2.5);const h2=1e6-z.hp;clean();return{h1,hf,h2,coal:!!W};};
   const e2=emb(2),e3=emb(3),want=100*.3*a[2];
   ok('Trail of Embers: burning ground along the wall for 3s after it dies down',e2.h1===0&&Math.abs(e3.h1-want)<want*.12&&e3.hf===0,e2.h1.toFixed(1)+' / '+e3.h1.toFixed(1)+' (want '+want.toFixed(1)+', off it '+e3.hf+')');
   ok('and then it cools',e3.h2>=e3.h1&&e3.h2<want*3.3,e3.h2.toFixed(1));}
  /* ---- Blazing Perdition ---- */
  {const feed=(L,n,boss)=>{play();setL(L);let bl=0;wofBlast=function(){bl++;return keep.wofBlast.apply(this,arguments);};const bd=near(),e=foe(bd,0,1e6),F=[];
     for(let i=0;i<n;i++){const q=foe(bd+1.5,i+1,1e6,(i%3-1)*.25);if(boss)q.boss=true;F.push(q);}const far=foe(bd+2.55,9,1e6);
     const W=cast([e]);run(.6);const r={bl,I:W&&W.wof?W.wof.I:0,feeds:W&&W.wof?W.wof.feeds:0,far:1e6-far.hp,dps:F[0].burn?F[0].burn.dps:0};run(2);r.bl2=bl;wofBlast=keep.wofBlast;clean();return r;};
   const p3=feed(3,6),p4a=feed(4,3),p4=feed(4,6),pb=feed(4,2,true),want=100*.8*a[3];
   ok('Blazing Perdition: each foe that crosses feeds the wall, burning hotter',p3.feeds===0&&p4a.feeds===3&&p4a.I===1&&Math.abs(p4a.dps-30)<.01,JSON.stringify(p4a));
   ok('six crossings release one blast of fire, hurting foes 1 tile away',p3.bl===0&&p4a.bl===0&&p4a.far===0&&p4.bl===1&&p4.bl2===1&&Math.abs(p4.far-want)<want*.05,p4.far.toFixed(1)+' (want '+want.toFixed(1)+')');
   ok('a boss feeds it three times',pb.feeds===6&&pb.bl===1,JSON.stringify(pb));}
  /* ---- Ring of Damnation ---- */
  {play();setL(4);const bd=near(),e=foe(bd,0,1e6);const W4=cast([e]);run(1.3);const fe4=e.wofF>time;clean();
   play();setL(5);let cl=0;wofClose=function(){cl++;return keep.wofClose.apply(this,arguments);};const b5=near(),lead=foe(b5,0,1e6),outF=foe(b5-4.2,1,1e6),C=cast([lead]),W=C&&C.wof;
   run(.5);const shut0=W.closed,s0=W.G.s;run(.8);const G=W.G,ox=G.cx+G.bx*G.RR,oz=G.cz+G.bz*G.RR,shape=W.pts.every(p=>Math.abs(Math.hypot(p.x-ox,p.z-oz)-G.RR)<.06);
   ok('Ring of Damnation: the wall stands straight, then bends and snaps shut into a ring around the foes behind it',!fe4&&!shut0&&s0===0&&W.closed&&cl===1&&shape&&Math.hypot(lead.x-ox,lead.z-oz)<G.RR,'r '+G.RR.toFixed(2)+' lead '+Math.hypot(lead.x-ox,lead.z-oz).toFixed(2));
   ok('foes inside are Feared: 50% slower for 3s; foes outside are not',lead.wofF>time&&lead.wofF-time<=3.01&&lead.slow>=.5&&lead.slowT>2.5&&!(outF.wofF>time)&&lead.wofFx&&fx.includes(lead.wofFx),(lead.wofF-time).toFixed(2)+' slow '+lead.slow);
   const h0=1e6-lead.hp,o0=1e6-outF.hp;run(4.4-1.3);const h1=1e6-lead.hp;run(.8);const h2=1e6-lead.hp,o2=1e6-outF.hp,str=h2-h1,want=100*1.5*a[4];
   ok('at the end the ring closes in: a heavy strike on the foes inside it, none outside',W.boomed&&(Math.abs(str-want)<want*.05||Math.abs(str-2*want)<want*.1)&&o2===o0,str.toFixed(1)+' (want '+want.toFixed(1)+' or a critical double)');
   ok('the embers lie where the ring stood',W.spts.length>30&&W.spts.every(p=>Math.abs(Math.hypot(p.x-ox,p.z-oz)-G.RR)<.06));
   restore();run(1);ok('Fear wears off after 3s',!(lead.wofF>time)&&!(lead.slow>=.5)&&!fx.includes(lead.wofFx),lead.slow);clean();}
  /* ---- Fear's critical strikes ---- */
  {play();const bd=near(),e=foe(bd,0,1e9);e.wofF=time+999;let dbl=0,dot=0;for(let i=0;i<600;i++){const h=e.hp;hurt(e,10,'magic',{el:'fire'});if(h-e.hp>15)dbl++;const h2=e.hp;hurt(e,10,'magic',{el:'fire',dot:true});if(h2-e.hp>15)dot++;}
   const f=foe(bd+.5,1,1e9);let nf=0;for(let i=0;i<300;i++){const h=f.hp;hurt(f,10,'magic',{el:'fire'});if(h-f.hp>15)nf++;}e.wofF=0;run(.4);
   ok('a Feared foe takes a critical double hit about 15% of the time',dbl>=55&&dbl<=125,dbl+'/600');ok('but not from damage over time, and an unfeared foe never does',dot===0&&nf===0,dot+' / '+nf);clean();}
  /* ---- every mastery, on a walking crowd ---- */
  {const bad=[],left=[];for(let L=1;L<=5;L++){play();setL(L);const bd=near();for(let i=0;i<10;i++){const e=foe(bd-2+.3*(i-4.5),i,i%3?2000:300,(i%3-1)*.2);e.spd=.6;}
     const added=[];scene.add=function(...q){added.push(...q);return S0.apply(this,q);};const e0=errs;
     for(let c=0;c<3;c++){cast(enemies.filter(x=>!x.dead));run(SPELLS_S.firewall.cd);}run(10);scene.add=S0;
     if(errs>e0)bad.push(L);const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});if(st.length)left.push(L+':'+st.length);}
   ok('every mastery casts on a walking crowd without errors',!bad.length,bad.join(','));ok('and leaves nothing behind',!left.length,left.join(' '));}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{restore();if(AU)AU.boom=boom0;console.error=ce;scene.add=S0;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
