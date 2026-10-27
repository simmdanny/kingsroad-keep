(function(){
/* Scroll mastery calibration (v366). For a scroll k and mastery L, measures what the masteries' own effects add (the calibrated damage factor
   SMG is not applied: it lives in fireScroll and this casts through castScrollNow) on three crowds, at P 100, casts one cooldown apart
   (12, or fewer for long cooldowns: about 100 s of casting, at least 4):
   pack  = 12 foes standing on the road (4000 max health, they never die),
   walk  = 8 foes walking past at 0.7 (they never die; each one walks back to the start once it is 4.6 tiles past, beyond any wall; the
           scroll is cast at those in the hero's reach),
   churn = 10 foes of 600 health standing on the road, each replaced the moment it dies (on-death masteries count),
   one   = a single foe that never dies.
   Damage counts the health they lose (or 600 for each death). Usage on the dev page:
   (0,eval)(await (await fetch('/tests/smast-cal.js')).text()); __smc.one('hexspark') -> {L0:{pack,churn,one},...}; __smc.done() puts the account back. */
const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
/* the road spot nearest the hero, found by a probe on the middle of the road (spawnEnemy's random sideways step moved the crowd by up to a tile) */
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i,hp,keep)=>{const R=ROUTES[0];spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=(i%3-1)*.2;e.spd=.0001;e.maxHp=keep?4000:hp;e.hp=keep?1e9:hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);e.calI=i;e.calD=d;return e;};
/* the equipped hero's aura explosion (the Monarch's random 15% for each foe slain near him) is off, and his level and XP go back afterwards */
function measure(k,L,mode){const id=meta.equipped,A=AURA[id],b0=A&&A.boom,h0=JSON.stringify(hs(id));if(A)A.boom=0;
  try{return measure0(k,L,mode);}finally{if(A)A.boom=b0;meta.heroes[id]=JSON.parse(h0);}}
function measure0(k,L,mode){play();meta.smast={};if(L)meta.smast[k]=MAST_XP[L-1];const S=SPELLS_S[k];meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};const lv0=meta.spells[k].lvl;meta.spells[k].lvl=1;
  SM.cnt[k]=0;const bd=near(),walk=mode==='walk',n=mode==='pack'?12:mode==='churn'?10:walk?8:1,keep=mode!=='churn',F=[];for(let i=0;i<n;i++)F.push(foe(walk?bd-2.6-.35*i:bd+.3*(i-(n-1)/2),i,600,keep));
  if(walk)for(const e of F){e.spd=.7;}
  let dmg=0;const step=sec=>{for(let i=0;i<sec/.05;i++){heroU.cd=1e9;update(.05);updFx(.05);if(walk)for(const e of F)if(!e.dead&&e.dist>bd+4.6){e.dist=bd-2.6;moveEnemy(e,0);}if(mode==='churn')for(let j=0;j<F.length;j++){const e=F[j];if(e.dead||e.hp<=0){dmg+=600;removeEnemy(e);F[j]=foe(e.calD,e.calI,600,false);}}}};
  const NC=Math.max(4,Math.min(12,Math.round(100/S.cd)));paused=false;for(let c=0;c<NC;c++){const RR=(tStats(heroU).range||3)+.5,inR=walk?F.filter(e=>!e.dead&&(e.x-heroU.x)**2+(e.z-heroU.z)**2<RR*RR):[],list=inR.length?inR:F.filter(e=>!e.dead);castScrollNow(k,heroU,tStats(heroU),list,100,{src:heroU,bane:0,el:SPELL_EL[k],anc:S.r==='ancient'||S.r==='unique',spell:k});worldSlow=1;slowT=0;step(S.cd);}
  step(8);paused=true;for(const e of F)if(!e.dead)dmg+=keep?1e9-e.hp:e.maxHp-e.hp;meta.spells[k].lvl=lv0;return Math.round(dmg/NC);}
function one(k,modes,reps){reps=reps||2;const out={};for(let L=0;L<=5;L++){out['L'+L]={};for(const m of(modes||['pack','churn','one'])){let v=0;for(let i=0;i<reps;i++)v+=measure(k,L,m);out['L'+L][m]=Math.round(v/reps);}}return out;}
function done(){try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
window.__smc={one,measure,done};return 'ok';})()
