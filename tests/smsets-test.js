(function(){
/* v372: scrolls with masteries draw in the artifact set's colours too. The mastery hooks used to run outside the set's colour context, so the
   cast flourish and the add-ons kept the scroll's own colours. Every scroll of a recoloured set (lightning, fire, ice, light) is cast at
   Mastery 5 with the set on, as the sets-test.js sweep does, and must draw nothing in its old colours (AS.dbg). Run on the dev page:
   __kk.ev(await (await fetch('/tests/smsets-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;projs.slice().forEach(p=>{scene.remove(p.m);});projs.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const run=sec=>{for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}};
const BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);
const equip=ids=>{meta.arts=meta.arts||{own:{},eq:{},pend:[]};for(const id of ids)if(id)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids.slice(0,3);ART_V++;AS.k=null;asEl();asTick(.001);};
const crowd=(n,hp)=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);
  const L=[];for(let i=0;i<n;i++){spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdist+.18*(i-(n-1)/2);e.off=0;e.spd=.0001;e.maxHp=e.hp=hp||1e7;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);L.push(e);}return L;};
const AS_DBG_SKIP=/terRipple|terTick|rsvBreakFx|sparkle<update/;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  const SW={};
  for(const el of ['lightning','fire','ice','light']){play();equip(BY[el].slice(0,3));const ks=SCROLL_IDS.filter(k=>SPELL_EL[k]===el&&SM_D[k]);meta.smast={};for(const k of ks)meta.smast[k]=SM_XP[4];
    for(const k of ks){clean();for(const f of fx.slice())f.life=0;updFx(.01);meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};const L=crowd(8,1e7),e0=errs;
      AS.dbg={n:0,inN:0,L:[],sig:{},skip:AS_DBG_SKIP};heroU.scd={};heroU.gcd=0;try{fireScroll(heroU,k,tStats(heroU),L.slice());}catch(err){console.error(err);}paused=false;run(9);paused=true;const D=AS.dbg;AS.dbg=null;
      SW[k]={leak:D.n,L:D.L.slice(0,2),lv:smLv(k),err:errs-e0};}}
  const ks=Object.keys(SW),leaky=ks.filter(k=>SW[k].leak>0);
  ok('every mastered scroll of a recoloured set was cast at Mastery 5',ks.length>=20&&ks.every(k=>SW[k].lv===5),ks.length+' '+ks.filter(k=>SW[k].lv!==5).join(','));
  ok('and none draws in its old colours with the set on (mastery hooks run in the set context)',!leaky.length,leaky.map(k=>k+':'+SW[k].leak+' '+SW[k].L.join(' || ')).join(' ;; '));
  ok('no errors',errs===0&&ks.every(k=>!SW[k].err),errs+' '+ks.filter(k=>SW[k].err).join(','));
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;AS.dbg=null;try{clean();asClear();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
