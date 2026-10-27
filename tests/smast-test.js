(function(){
/* Scroll masteries (v366): XP per cast (cooldown x rarity rate), levels, the power factor in fireScroll, marks and on-death hooks, every Common
   scroll at every mastery (casts clean, cleans up, and its power lands on the rarity ladder), the UI (scroll page bar, mastery card, pips) and
   the developer buttons. Run on the dev page: __kk.ev(await (await fetch('/tests/smast-test.js')).text()) returns [name, ok, detail] rows.
   Puts the account back afterwards. */
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
const SMX=typeof SM_XP!=='undefined'?SM_XP:MAST_XP;/* the scroll thresholds (SM_XP since v367) */
const setL=(k,L)=>{meta.smast=meta.smast||{};if(L)meta.smast[k]=SMX[L-1];else delete meta.smast[k];};
const oF=k=>({src:heroU,bane:0,el:SPELL_EL[k],anc:false,spell:k});
/* the power of a scroll at its current mastery: like tests/smast-cal.js, with the power factor fireScroll would give it. It leaves the
   hero's own luck out: the equipped hero's aura explosion (the Monarch's, a 15% Math.random roll for each foe slain near him, which can
   chain through the churn crowd) is off, and his level and XP go back afterwards (the kills levelled him up, so later measures exploded
   harder) */
function power(k,mode){const id=meta.equipped,A=AURA[id],b0=A&&A.boom,h0=JSON.stringify(hs(id));if(A)A.boom=0;
  try{return power0(k,mode);}finally{if(A)A.boom=b0;meta.heroes[id]=JSON.parse(h0);}}
function power0(k,mode){play();const S=SPELLS_S[k];meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};const lv0=meta.spells[k].lvl;meta.spells[k].lvl=1;SM.cnt[k]=0;
  const bd=near(),n=mode==='pack'?12:mode==='churn'?10:1,keep=mode!=='churn',F=[];for(let i=0;i<n;i++)F.push(foe(bd+.3*(i-(n-1)/2),i,600,keep));let dmg=0;
  const step=sec=>{for(let i=0;i<sec/.05;i++){heroU.cd=1e9;update(.05);updFx(.05);if(mode==='churn')for(let j=0;j<F.length;j++){const e=F[j];if(e.dead||e.hp<=0){dmg+=600;removeEnemy(e);F[j]=foe(e.calD,e.calI,600,false);}}}};
  paused=false;for(let c=0;c<12;c++){castScrollNow(k,heroU,tStats(heroU),F.filter(e=>!e.dead),100*smP(k),oF(k));worldSlow=1;slowT=0;step(S.cd);}step(8);paused=true;
  for(const e of F)if(!e.dead)dmg+=keep?1e9-e.hp:e.maxHp-e.hp;meta.spells[k].lvl=lv0;return dmg/12;}
const COMMON=SCROLL_IDS.filter(k=>SPELLS_S[k].r==='common');
/* a scroll whose masteries are not written yet (the later rarities come in later releases) */
const NOM=SCROLL_IDS.find(k=>!SM_D[k]);
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
try{
  play();meta.smast={};
  /* ---- XP and levels ---- */
  ok('every Common scroll has 5 masteries, calibrated',COMMON.length===11&&COMMON.every(k=>SM_D[k]&&SM_D[k].length===5&&SMF[k]&&SMA[k]&&SMG[k]&&SMG[k].length===5),COMMON.filter(k=>!(SM_D[k]&&SMG[k])).join(','));
  ok('the levels follow the scroll thresholds',smLv('hexspark')===0&&(setL('hexspark',3),smLv('hexspark')===3)&&(meta.smast.hexspark=SMX[4]-1,smLv('hexspark')===4)&&(setL('hexspark',5),smLv('hexspark')===5));
  ok('rarer scrolls earn XP more slowly',smRate('hexspark')===1&&smRate('darkpulse')<1&&smRate('riftfang')<smRate('darkpulse')&&smRate('citadel')<smRate('gaia')&&Math.abs(smRate('citadel')-.53)<.01,
    ['hexspark','darkpulse','riftfang','loop','compress','gaia','citadel','pulsar'].map(k=>smRate(k)).join(' '));
  meta.smast={};{const L=foe(near(),0,1e6,true),x0=smXp('hexspark');meta.spells.hexspark=meta.spells.hexspark||{lvl:1,hero:null};heroU.scd={};heroU.gcd=0;state='playing';fireScroll(heroU,'hexspark',tStats(heroU),[L]);
    const x1=smXp('hexspark');heroU.scd={};heroU.gcd=0;fireScroll(heroU,'riftfang',tStats(heroU),[L]);
    ok('a cast gives XP equal to its cooldown times its rarity rate',Math.abs(x1-x0-SPELLS_S.hexspark.cd)<1e-6&&Math.abs(smXp('riftfang')-SPELLS_S.riftfang.cd*smRate('riftfang'))<1e-6,(x1-x0)+' / '+smXp('riftfang'));
    state='menu';const x2=smXp('hexspark');heroU.scd={};heroU.gcd=0;fireScroll(heroU,'hexspark',tStats(heroU),[L]);ok('no XP outside a run',smXp('hexspark')===x2);state='playing';
    meta.smast.hexspark=SMX[0]-1;heroU.scd={};heroU.gcd=0;const t0=document.querySelectorAll('.toast').length;fireScroll(heroU,'hexspark',tStats(heroU),[L]);
    ok('crossing a threshold levels it up with a toast',smLv('hexspark')===1&&[...document.querySelectorAll('.toast')].some(t=>/Scroll Mastery 1/.test(t.textContent)),smLv('hexspark'));
    run(2);clean();}
  /* ---- the power factor ---- */
  {let seen=null;const c0=castScrollNow;castScrollNow=function(k,t,s,list,P,o){if(k==='frostshard'&&!seen)seen=P;return c0.apply(this,arguments);};const L=[foe(near(),0,1e6,true)];
    const cast=()=>{seen=null;heroU.scd={};heroU.gcd=0;fireScroll(heroU,'frostshard',tStats(heroU),L);return seen;};meta.spells.frostshard=meta.spells.frostshard||{lvl:1,hero:null};
    setL('frostshard',0);const p0=cast();setL('frostshard',3);const p3=cast();setL('frostshard',0);castScrollNow=c0;
    ok('fireScroll casts a mastered scroll with its power factor',p0>0&&Math.abs(p3/p0-SMG.frostshard[2])<1e-6,p0+' -> '+p3);
    ok('scrolls whose masteries are not written yet get no factor',!NOM||((setL(NOM,5),smP(NOM)===1)&&(setL(NOM,0),true)),NOM||'every scroll has masteries');run(2);clean();}
  /* ---- marks and on-death hooks ---- */
  {const L=[foe(near(),0,1e6,true),foe(near()+.4,1,1e6,true)],e=L[0];smMark(e,'dark',4,.2);const h0=e.hp;hurt(e,100,'magic',{el:'dark'});const d1=h0-e.hp,h1=e.hp;hurt(e,100,'magic',{el:'fire'});const d2=h1-e.hp;
    ok('a mark makes its element hit harder, only its element',Math.abs(d1/d2-1.2)<.02,d1.toFixed(1)+' vs '+d2.toFixed(1));
    let fired=0;const q=L[1];q.hp=10;q.maxHp=10;smOnDie(q,3,()=>fired++);hurt(q,50,'magic',{el:'fire',src:heroU});ok('an on-death hook fires when the foe dies',q.dead&&fired===1,fired);clean();}
  /* ---- every Common at every mastery: casts clean and tidies up (only the masteries' own objects, tagged userData.sm: dying foes drop loot) ---- */
  {const bad=[],left=[];for(const k of COMMON)for(let L=1;L<=5;L++){play();setL(k,L);SM.cnt[k]=0;const bd=near(),F=[];for(let i=0;i<10;i++)F.push(foe(bd+.3*(i-4.5),i,i%3?2000:300,false));
      const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};const e0=errs;
      for(let c=0;c<5;c++){castScrollNow(k,heroU,tStats(heroU),enemies.filter(x=>!x.dead),100*smP(k),oF(k));run(SPELLS_S[k].cd);}run(10);scene.add=S0;
      if(errs>e0)bad.push(k+L);const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});if(st.length)left.push(k+L+':'+st.length);setL(k,0);}
    ok('every Common scroll casts at every mastery without errors',!bad.length,bad.join(','));ok('and leaves nothing behind when it ends',!left.length,left.join(' '));}
  /* ---- the rarity ladder: each Common at Mastery 2 is like an Uncommon, at Mastery 5 like a Rare (one run, so a wide margin) ---- */
  {const W={pack:.4,churn:.35,one:.25},res={},off=[];for(const k of COMMON){const pw=L=>{setL(k,L);let f=0;const v={};for(const m in W)v[m]=power(k,m);setL(k,0);return v;};
      const b=pw(0),r=[2,5].map(L=>{const v=pw(L);let f=0;for(const m in W)f+=W[m]*v[m]/Math.max(1,b[m]);return f;});res[k]=r.map(v=>+v.toFixed(2));
      /* a scroll on Simon's own numbers (its module lists it in SM.free, e.g. Thorn Whip in v378, Ember Bolt in v384) may sit above the
         ladder: at Mastery 2 and Mastery 5 it only has to reach 3/4 of the target */
      const free=typeof SM!=='undefined'&&SM.free&&SM.free[k];
      if((free?r[0]<smTarget(k,2)*.75:Math.abs(r[0]/smTarget(k,2)-1)>.25)||(free?r[1]<smTarget(k,5)*.75:Math.abs(r[1]/smTarget(k,5)-1)>.25))off.push(k);}
    ok('Mastery 2 lands near the next rarity and Mastery 5 two rarities up (within 25%; Simon\'s own designs at least 3/4 of them)',!off.length,'targets '+smTarget('hexspark',2).toFixed(2)+'/'+smTarget('hexspark',5).toFixed(2)+' '+JSON.stringify(res));}
  /* ---- UI ---- */
  {play();state='menu';meta.smast={};setL('hexspark',2);meta.spells.hexspark=meta.spells.hexspark||{lvl:1,hero:null};showOverlay('menu');try{goTab('spells');}catch(e){}spSel='hexspark';renderSpells();
    const btn=document.querySelector('#sdBot .sm-btn');ok('the scroll page shows its mastery bar and the next mastery',!!btn&&/Mastery 2/.test(btn.textContent)&&/Twin Spark/.test(btn.textContent),btn&&btn.textContent.slice(0,80));
    ok('the scroll card shows its mastery pips',document.querySelectorAll('.sc[data-sp="hexspark"] .sm-pips i').length===2);
    smOpen('hexspark');const md=document.getElementById('smModal'),rows=md?md.querySelectorAll('.mst-lvl'):[];
    ok('the mastery card lists all 5 with their numbers and power',rows.length===5&&md.querySelectorAll('.mst-lvl.on').length===2&&!/\{/.test(md.textContent)&&/like a Rare scroll/.test(md.textContent)&&/Rarer scrolls take longer/.test(md.textContent),md&&md.textContent.slice(0,120));
    if(md)md.remove();if(NOM){setL(NOM,0);meta.spells[NOM]=meta.spells[NOM]||{lvl:1,hero:null};spSel=NOM;renderSpells();}const b2=NOM?document.querySelector('#sdBot .sm-btn'):null;
    ok('a scroll without masteries yet says they come later',!NOM||(!!b2&&/later update/.test(b2.textContent)),NOM||'every scroll has masteries');
    const fmt5=SM_D.hexspark.map((p,i)=>smDesc('hexspark',i));ok('the texts carry the calibrated numbers',fmt5.every(t=>!/\{/.test(t))&&/\d+%/.test(fmt5[0]),fmt5[0]);}
  /* ---- developer buttons ---- */
  {devAct('smst5');const all=SCROLL_IDS.every(k=>smLv(k)===5);devAct('smst0');ok('developer Max all and Reset work on every scroll',all&&SCROLL_IDS.every(k=>smLv(k)===0));
   ok('developer mode keeps the real masteries aside',!!DEV_KEYS.smast&&typeof DEV_KEYS.smast==='object');}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;scene.add=S0;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
