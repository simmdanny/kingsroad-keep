/* Refines SMG with the masteries' multiplier actually applied (big scrolls do not scale linearly: a crowd they already wipe out
   cannot die faster, others cross kill thresholds). Same crowds and weights as the rarity tests. Run on a dev or lab page:
   (0,eval)(await (await fetch('/tests/smast-refine.js')).text()); __smr.F('glacialrift',3) -> power ratio at M1-M5 (3 runs each);
   __smr.fix('glacialrift',3) -> suggested SMG (current SMG times target / measured); __smr.done() puts the account back. */
window.__smr=__kk.ev(`(function(){
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
/* the road spot nearest the hero, found by a probe on the middle of the road (spawnEnemy's random sideways step moved the crowd by up to a tile) */
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i,hp,keep)=>{const R=ROUTES[0];spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=(i%3-1)*.2;e.spd=.0001;e.maxHp=keep?4000:hp;e.hp=keep?1e9:hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);e.calI=i;e.calD=d;return e;};
const setL=(k,L)=>{meta.smast=meta.smast||{};if(L)meta.smast[k]=SM_XP[L-1];else delete meta.smast[k];};
const oF=k=>({src:heroU,bane:0,el:SPELL_EL[k],anc:false,spell:k});
/* as the rarity tests: the equipped hero's aura explosion (the Monarch's random 15%) is off, and his level and XP go back afterwards */
function power(k,mode,casts){const id=meta.equipped,A=AURA[id],b0=A&&A.boom,h0=JSON.stringify(hs(id));if(A)A.boom=0;
  try{return power0(k,mode,casts);}finally{if(A)A.boom=b0;meta.heroes[id]=JSON.parse(h0);}}
function power0(k,mode,casts){play();const S=SPELLS_S[k];meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};const lv0=meta.spells[k].lvl;meta.spells[k].lvl=1;SM.cnt[k]=0;
  const bd=near(),walk=mode==='walk',n=mode==='pack'?12:mode==='churn'?10:walk?8:1,keep=mode!=='churn',F=[];for(let i=0;i<n;i++)F.push(foe(walk?bd-2.6-.35*i:bd+.3*(i-(n-1)/2),i,600,keep));if(walk)for(const e of F)e.spd=.7;let dmg=0;
  const step=sec=>{for(let i=0;i<sec/.05;i++){heroU.cd=1e9;update(.05);updFx(.05);if(walk)for(const e of F)if(!e.dead&&e.dist>bd+4.6){e.dist=bd-2.6;moveEnemy(e,0);}
    if(mode==='churn')for(let j=0;j<F.length;j++){const e=F[j];if(e.dead||e.hp<=0){dmg+=600;removeEnemy(e);F[j]=foe(e.calD,e.calI,600,false);}}}};
  paused=false;for(let c=0;c<casts;c++){const RR=(tStats(heroU).range||3)+.5,inR=walk?F.filter(e=>!e.dead&&(e.x-heroU.x)**2+(e.z-heroU.z)**2<RR*RR):[];castScrollNow(k,heroU,tStats(heroU),inR.length?inR:F.filter(e=>!e.dead),100*smP(k),oF(k));worldSlow=1;slowT=0;step(S.cd);}step(8);paused=true;
  for(const e of F)if(!e.dead)dmg+=keep?1e9-e.hp:e.maxHp-e.hp;meta.spells[k].lvl=lv0;return dmg/casts;}
const NC=k=>Math.max(4,Math.min(12,Math.round(100/SPELLS_S[k].cd)));
function F(k,reps){reps=reps||3;const W=SMW[k]||{pack:.4,churn:.35,one:.25},pw=L=>{setL(k,L);const v={};for(const m in W){let q=0;for(let i=0;i<reps;i++)q+=power(k,m,NC(k));v[m]=q/reps;}setL(k,0);return v;};
  const b=pw(0),r=[];for(let L=1;L<=5;L++){const v=pw(L);let f=0;for(const m in W)f+=W[m]*v[m]/Math.max(1,b[m]);r.push(+f.toFixed(3));}return r;}
function fix(k,reps){const f=F(k,reps),G=(SMG[k]||[1,1,1,1,1]).slice();return{F:f,T:[1,2,3,4,5].map(L=>+smTarget(k,L).toFixed(3)),G:G.map((g,i)=>Math.max(1,+(g*smTarget(k,i+1)/f[i]).toFixed(2)))};}
function done(){try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return{F,fix,done};})()`);
