(function(){
/* v388 (Simon): outside developer mode only the Common scrolls have masteries (the others earn no XP and have no level, effects, power bonus,
   bar or card; their saved XP is kept), developer mode keeps them all; and the Frost Spire earns mastery XP as an assist when a foe it chilled
   dies to anything else while still chilled. Run on the dev page: __kk.ev(await (await fetch('/tests/smgate-test.js')).text()) returns
   [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const foe=(e0)=>{const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=R.len*.5;e.spd=.0001;e.maxHp=e.hp=1e6;moveEnemy(e,0);Object.assign(e,e0||{});return e;};
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  /* ---- scrolls ---- */
  play();state='playing';const UN=SCROLL_IDS.find(k=>SPELLS_S[k].r==='uncommon'&&SM_D[k]),CO='hexspark',MY=SCROLL_IDS.find(k=>SPELLS_S[k].r==='mythic'&&SM_D[k]);
  meta.smast={};meta.smast[UN]=SM_XP[2];meta.smast[CO]=SM_XP[2];meta.smast[MY]=SM_XP[4];for(const k of [UN,CO,MY])meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};
  meta.dev=true;
  ok('developer mode: every scroll keeps its masteries',smLv(UN)===3&&smLv(CO)===3&&smLv(MY)===5,[smLv(UN),smLv(CO),smLv(MY)].join('/'));
  meta.dev=false;
  ok('playing normally: a Common scroll keeps its masteries',smLv(CO)===3,smLv(CO));
  ok('the other rarities have none: no level and no power bonus',smLv(UN)===0&&smLv(MY)===0&&smP(UN)===1&&smP(MY)===1,UN+' '+smLv(UN)+', '+MY+' '+smLv(MY));
  const x0=meta.smast[UN],c0=meta.smast[CO];smGain(UN,500,heroU);smGain(CO,500,heroU);
  ok('and earn no mastery XP, while a Common scroll still does',meta.smast[UN]===x0&&meta.smast[CO]===c0+500,(meta.smast[UN]-x0)+' / '+(meta.smast[CO]-c0));
  ok('their XP is kept for later',meta.smast[UN]===SM_XP[2]&&meta.smast[MY]===SM_XP[4]);
  {const n0=SM.ctx.size;const o={src:heroU,bane:0,el:SPELL_EL[UN],spell:UN};const e=foe();castScrollNow(UN,heroU,tStats(heroU),[e],100,o);
    ok('casting one runs no mastery hooks',SM.ctx.size===n0&&!o.smId,SM.ctx.size-n0);clean();}
  ok('no mastery bar on its scroll page',!/mst-btn/.test(smRow(UN))&&/mst-btn/.test(smRow(CO)));
  ok('no mastery pips on its card or button',smPips(UN)===''&&smPips(CO)!=='');
  smOpen(UN);ok('and its mastery card does not open',!document.getElementById('smModal'));{const m=document.getElementById('smModal');if(m)m.remove();}
  smOpen(CO);const md=document.getElementById('smModal');ok('a Common scroll\'s card still opens',!!md);if(md)md.remove();
  meta.dev=true;ok('back in developer mode they are all there again',smLv(UN)===3&&smLv(MY)===5);
  /* ---- Frost Spire assists ---- */
  play();state='playing';meta.mast={};gold=1e9;const sp=smPvSpot(),fz=placeTower('frost',sp.c,sp.r),s2=smPvSpot(sp),ar=placeTower('archer',s2.c,s2.r);
  const assist=(e0,by)=>{const e=foe(e0);e.chillBy=fz;const m0=meta.mast.frost||0;kill(e,by);return +((meta.mast.frost||0)-m0).toFixed(3);};
  ok('a chilled foe killed by another tower gives the Frost Spire kill XP (0.5)',assist({slowT:1},ar)===MAST_KILL,assist({slowT:1},ar));
  ok('an elite 1.5, a boss 15',assist({slowT:1,elite:true},ar)===3*MAST_KILL&&assist({slowT:1,boss:true},ar)===30*MAST_KILL);
  ok('the hero\'s kill counts too',assist({slowT:1},heroU)===MAST_KILL);
  ok('no assist once the chill has worn off',assist({slowT:0},ar)===0);
  ok('its own kill counts once, as a kill',assist({slowT:1},fz)===MAST_KILL);
  {const e=foe({slowT:1});e.chillBy=fz;const m0=meta.mast.frost||0;towers.splice(towers.indexOf(fz),1);kill(e,ar);towers.push(fz);ok('a sold Frost Spire gets nothing',(meta.mast.frost||0)===m0);}
  ok('the archer still gets its own kill XP',(meta.mast.archer||0)>0,meta.mast.archer);
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
