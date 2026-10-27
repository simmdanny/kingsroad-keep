(function(){
/* A scroll's real power at each mastery with its damage factor (like smast-test's power(): castScrollNow at 100 x smP), against the ladder.
   Set window.__smk = 'gravebind' (the scroll) and optionally window.__smreps (default 2) first. Not in run-all (about 20 s):
   window.__smk='gravebind'; __kk.ev(await (await fetch('/tests/sm-ladder.js')).text()) -> {M0:{F,T,g},...} */
const k=window.__smk||'thunderclap',reps=window.__smreps||2,m0=JSON.stringify(meta),r0=lsGet(KR);
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i,hp,keep)=>{const R=ROUTES[0];spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=(i%3-1)*.2;e.spd=.0001;e.maxHp=keep?4000:hp;e.hp=keep?1e9:hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);e.calI=i;e.calD=d;return e;};
const X=typeof SM_XP!=='undefined'?SM_XP:MAST_XP,setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast[k]=X[L-1];else delete meta.smast[k];};
const id=meta.equipped,A=AURA[id],b0=A&&A.boom;if(A)A.boom=0;
function power(mode){play();const S=SPELLS_S[k];SM.cnt[k]=0;const bd=near(),n=mode==='pack'?12:mode==='churn'?10:1,keep=mode!=='churn',F=[];for(let i=0;i<n;i++)F.push(foe(bd+.3*(i-(n-1)/2),i,600,keep));let dmg=0;
  const step=sec=>{for(let i=0;i<sec/.05;i++){heroU.cd=1e9;update(.05);updFx(.05);if(mode==='churn')for(let j=0;j<F.length;j++){const e=F[j];if(e.dead||e.hp<=0){dmg+=600;removeEnemy(e);F[j]=foe(e.calD,e.calI,600,false);}}}};
  paused=false;for(let c=0;c<12;c++){castScrollNow(k,heroU,tStats(heroU),F.filter(e=>!e.dead),100*smP(k),{src:heroU,bane:0,el:SPELL_EL[k],anc:false,spell:k});worldSlow=1;slowT=0;step(S.cd);}step(8);paused=true;
  for(const e of F)if(!e.dead)dmg+=keep?1e9-e.hp:e.maxHp-e.hp;return dmg/12;}
const W={pack:.4,churn:.35,one:.25},out={};let base=null;
try{for(let L=0;L<=5;L++){setL(L);const v={};for(const m in W){let s=0;for(let r=0;r<reps;r++)s+=power(m);v[m]=s/reps;}setL(0);if(!L)base=v;let f=0;for(const m in W)f+=W[m]*v[m]/base[m];out['M'+L]={F:+f.toFixed(3),T:+smTarget(k,L).toFixed(3),g:L?SMG[k][L-1]:1};}}
finally{if(A)A.boom=b0;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
