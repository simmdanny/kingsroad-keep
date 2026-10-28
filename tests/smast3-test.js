(function(){
/* The Rare scrolls' masteries (v370; made by tests/gen-smast-test.py from smast2-test.js): their ladder (SM_LAD.rare), its power labels, every
   Rare at every mastery casting clean and tidying up, and its power at Mastery 3 (Epic) and 5 (almost Legendary). Run on the dev page:
   __kk.ev(await (await fetch('/tests/smast3-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
/* the road spot nearest the hero. The probe walks the middle of the road: spawnEnemy gives every foe a random sideways step, and that moved
   the whole test crowd by up to a tile from run to run */
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i,hp,keep)=>{const R=ROUTES[0];spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=(i%3-1)*.2;e.spd=.0001;e.maxHp=keep?4000:hp;e.hp=keep?1e9:hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);e.calI=i;e.calD=d;return e;};
const setL=(k,L)=>{meta.smast=meta.smast||{};if(L)meta.smast[k]=SM_XP[L-1];else delete meta.smast[k];};
const oF=k=>({src:heroU,bane:0,el:SPELL_EL[k],anc:false,spell:k});
/* a measure leaves the hero's own luck out: the equipped hero's aura explosion (the Monarch's, a 15% Math.random roll for each foe slain
   near him, which can chain through the churn crowd) is off, and his level and XP go back afterwards (the kills levelled him up, so later
   measures exploded harder) */
function power(k,mode,casts){const id=meta.equipped,A=AURA[id],b0=A&&A.boom,h0=JSON.stringify(hs(id));if(A)A.boom=0;
  try{return power0(k,mode,casts);}finally{if(A)A.boom=b0;meta.heroes[id]=JSON.parse(h0);}}
function power0(k,mode,casts){play();const S=SPELLS_S[k];meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};const lv0=meta.spells[k].lvl;meta.spells[k].lvl=1;SM.cnt[k]=0;
  const bd=near(),walk=mode==='walk',n=mode==='pack'?12:mode==='churn'?10:walk?8:1,keep=mode!=='churn',F=[];for(let i=0;i<n;i++)F.push(foe(walk?bd-2.6-.35*i:bd+.3*(i-(n-1)/2),i,600,keep));if(walk)for(const e of F)e.spd=.7;let dmg=0;
  const step=sec=>{for(let i=0;i<sec/.05;i++){heroU.cd=1e9;update(.05);updFx(.05);if(walk)for(const e of F)if(!e.dead&&e.dist>bd+4.6){e.dist=bd-2.6;moveEnemy(e,0);}
    if(mode==='churn')for(let j=0;j<F.length;j++){const e=F[j];if(e.dead||e.hp<=0){dmg+=600;removeEnemy(e);F[j]=foe(e.calD,e.calI,600,false);}}}};
  paused=false;for(let c=0;c<casts;c++){const RR=(tStats(heroU).range||3)+.5,inR=walk?F.filter(e=>!e.dead&&(e.x-heroU.x)**2+(e.z-heroU.z)**2<RR*RR):[];castScrollNow(k,heroU,tStats(heroU),inR.length?inR:F.filter(e=>!e.dead),100*smP(k),oF(k));worldSlow=1;slowT=0;step(S.cd);}step(8);paused=true;
  for(const e of F)if(!e.dead)dmg+=keep?1e9-e.hp:e.maxHp-e.hp;meta.spells[k].lvl=lv0;return dmg/casts;}
const UNC=SCROLL_IDS.filter(k=>SPELLS_S[k].r==='rare');
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
try{
  play();meta.smast={};
  ok('every Rare scroll has 5 masteries, calibrated',UNC.length>0&&UNC.every(k=>SM_D[k]&&SM_D[k].length===5&&SMF[k]&&SMA[k]&&SMG[k]&&SMG[k].length===5),UNC.filter(k=>!(SM_D[k]&&SMG[k])).join(','));
  ok('Simon\'s ladder for the Rares: Mastery 3 is an Epic, Mastery 5 almost a Legendary',SM_LAD.rare.join(',')==='0,0.3,0.7,1,1.4,1.85'&&Math.abs(smTarget('riftfang',3)-SM_STEP)<1e-9&&smTarget('riftfang',5)<SM_STEP*SM_STEP&&smTarget('riftfang',5)>smTarget('riftfang',4),SM_LAD.rare.join(','));
  ok('the Commons keep their ladder',Math.abs(smTarget('hexspark',2)-SM_STEP)<1e-9&&Math.abs(smTarget('hexspark',5)-SM_STEP*SM_STEP)<1e-9);
  ok('the card says it in his words',['a stronger Rare','approaching Epic','Epic power','above Epic','almost Legendary'].every((t,i)=>smPowerLabel('riftfang',i+1)===t)&&/Rare/.test(smPowerLabel('hexspark',5)));
  ok('the texts carry their calibrated numbers',UNC.every(k=>SM_D[k].every((p,i)=>!/\{/.test(smDesc(k,i)))));
  /* ---- every Rare at every mastery ---- */
  {const bad=[],left=[];for(const k of UNC)for(let L=1;L<=5;L++){play();setL(k,L);SM.cnt[k]=0;const bd=near();for(let i=0;i<10;i++){const e=foe(bd+.3*(i-4.5),i,i%3?2000:300,false);if(k==='firewall'){e.spd=.6;e.dist-=2;moveEnemy(e,0);}}
      const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};const e0=errs;
      for(let c=0;c<3;c++){const al=enemies.filter(x=>!x.dead);if(!al.length&&!SPELLS_S[k].global)break;castScrollNow(k,heroU,tStats(heroU),al,100*smP(k),oF(k));run(SPELLS_S[k].cd);}run(10);scene.add=S0;
      if(errs>e0)bad.push(k+L);const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});if(st.length)left.push(k+L+':'+st.length);setL(k,0);}
    ok('every Rare scroll casts at every mastery without errors',!bad.length,bad.join(','));ok('and leaves nothing behind when it ends',!left.length,left.join(' '));}
  /* ---- the ladder (one run of 12 casts, so a wide margin) ---- */
  /* the Wall of Fire is left out: on walking foes one run swings from 0.9x to 1.8x (where the wall lands against the walkers); it was
     calibrated on 3 runs (tests/smast-cal.js) */
  {const res={},off=[];for(const k of UNC.filter(k=>![].includes(k))){const W=SMW[k]||{pack:.4,churn:.35,one:.25},pw=L=>{setL(k,L);const v={};for(const m in W){const R=['riftfang'].includes(k)?3:1;let q=0;for(let i=0;i<R;i++)q+=power(k,m,Math.max(4,Math.min(12,Math.round(100/SPELLS_S[k].cd))));v[m]=q/R;}setL(k,0);return v;};
      const b=pw(0),r=[3,5].map(L=>{const v=pw(L);let f=0;for(const m in W)f+=W[m]*v[m]/Math.max(1,b[m]);return f;});res[k]=r.map(v=>+v.toFixed(2));
      /* the noisy ones (riftfang: one run swings with how the foes happen to stand, e.g. how many a piercing shard lines up) are measured
         on 3 runs and only have to come out clearly stronger */
      /* a scroll on its designer's own numbers (SM.free) only has to reach 3/4 of the ladder, as in smast-test and smast2-test */
      if(SM.free&&SM.free[k]?(r[0]<.75*smTarget(k,3)||r[1]<.75*smTarget(k,5)):['riftfang'].includes(k)?(r[0]<1.05||r[1]<1.15):(Math.abs(r[0]/smTarget(k,3)-1)>.35||Math.abs(r[1]/smTarget(k,5)-1)>.35))off.push(k);}
    ok('Mastery 3 lands near an Epic and Mastery 5 near a Legendary (within 35%; noisy ones clearly stronger)',!off.length,'targets '+smTarget('riftfang',3).toFixed(2)+'/'+smTarget('riftfang',5).toFixed(2)+' '+JSON.stringify(res));}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;scene.add=S0;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
