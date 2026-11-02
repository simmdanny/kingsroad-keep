(function(){
/* The power a scroll is cast with in play (v450). Run on the dev page: __kk.ev(await (await fetch('/tests/smpow-test.js')).text()) returns
   [name, ok, detail] rows. fireScroll works a cast's power out with scrollPow: spell power, the scroll's level, the Aevorian's bonus and the
   mastery's factor smP, once. Epic and greater scrolls are cast a moment later (a delayed effect); before v450 that second sum left smP out,
   so no Epic+ mastery got its factor in play. castScrollNow is swapped for a recorder (nothing is cast) and the world is stepped until the
   delayed casts arrive. Developer mode is on (Epic+ masteries are behind it). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),C0=castScrollNow;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
const near=(a,b)=>Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));
let rec=[],F=null;
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0],A=posAt(R.len*.5,R);let hc=null,hb=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),dd=(q.x-A[0])**2+(q.z-A[1])**2;if(dd>1.2&&dd<hb){hb=dd;hc=[c,r];}}
  spawnHero(hc[0],hc[1]);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;
  spawnEnemy({type:'soldier',v:0},20);F=enemies[enemies.length-1];F.gem=0;F.scroll=0;F.route=R;F.dist=R.len*.5;F.off=0;F.spd=0;F.hp=F.maxHp=1e9;moveEnemy(F,0);}
const setL=(k,L)=>{meta.smast=meta.smast||{};if(L)meta.smast[k]=SM_XP[L-1];else delete meta.smast[k];};
/* one cast of k at mastery L (scroll level lv) through fireScroll; returns the powers castScrollNow was called with, and what it should be */
function fire(k,L,lv){setL(k,L);meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};meta.spells[k].lvl=lv||1;heroU.scd={};heroU.gcd=0;rec=[];
  const s=tStats(heroU),f=smP(k),base=(s.spellP||s.dmg)*(1+.05*((lv||1)-1))*tsd(heroU,k);fireScroll(heroU,k,s,[F]);const now=rec.length;run(1.6);
  const got=rec.filter(r=>r.k===k).map(r=>r.P);return{got,now,f,base,want:base*f};}
try{
  go();castScrollNow=function(k,t,s,list,P,o){rec.push({k,P});};
  /* fireScroll is wrapped (the mastery XP), so its own text is read from the page */
  const src=[...document.scripts].map(x=>x.text).join('\n'),fs=src.slice(src.indexOf('function fireScroll('),src.indexOf('function fireScroll(')+3000);
  ok('both of fireScroll\'s paths work the power out with scrollPow (the delayed one no longer has its own sum)',typeof scrollPow==='function'&&fs.includes('scrollPow(t,k,s,lv)')&&fs.includes('scrollPow(t,k,s2,lv)')&&!/s2\.spellP\|\|s2\.dmg/.test(fs),fs.length);
  /* a Common to Rare scroll with masteries is cast at once: its factor, once */
  const lowK=Object.keys(SM_D).find(k=>SPELLS_S[k]&&RB[SPELLS_S[k].r].i<3&&SMG[k]&&Math.abs(SMG[k][2]-1)>.01);
  {const r=fire(lowK,3);ok('a '+SPELLS_S[lowK].r+' scroll ('+lowK+', Mastery 3) is cast at once with its factor, once',r.now===1&&r.got.length===1&&near(r.got[0],r.want)&&!near(r.got[0],r.want*r.f),r.got.map(x=>x.toFixed(2))+' want '+r.want.toFixed(2)+' (factor '+r.f+')');}
  /* Epic and greater: the delayed cast now carries the factor */
  for(const [k,L,lv] of [['judgment',3,1],['dslash',5,1],['judgment',4,3]]){const r=fire(k,L,lv);const R0=SPELLS_S[k].r;
    ok('a delayed '+R0+' cast ('+k+', Mastery '+L+', scroll level '+lv+') arrives with its mastery\'s factor ('+r.f+'), once',r.now===0&&r.got.length===1&&Math.abs(r.f-1)>.01&&near(r.got[0],r.want),r.got.map(x=>x.toFixed(2))+' want '+r.want.toFixed(2)+' (without it '+r.base.toFixed(2)+')');}
  /* a Mythic with a hidden factor too */
  const myK=Object.keys(SM_D).find(k=>SPELLS_S[k]&&SPELLS_S[k].r==='mythic'&&SMG[k]&&Math.abs(SMG[k][1]-1)>.01);
  if(myK){const r=fire(myK,2);ok('a delayed Mythic cast ('+myK+', Mastery 2) arrives with its factor ('+r.f+')',r.got.length===1&&near(r.got[0],r.want),r.got.map(x=>x.toFixed(2))+' want '+r.want.toFixed(2));}
  else ok('a Mythic with a hidden factor to check',false,'none found');
  /* without a mastery nothing changes */
  {const r=fire('judgment',0);ok('at Mastery 0 an Epic cast\'s power is as before (factor 1)',r.f===1&&r.got.length===1&&near(r.got[0],r.base),r.got.map(x=>x.toFixed(2))+' want '+r.base.toFixed(2));}
  /* outside developer mode Epic+ masteries stay shut: no factor */
  {meta.dev=false;const r=fire('judgment',3);meta.dev=true;ok('outside developer mode an Epic mastery still counts for nothing (factor 1)',r.f===1&&r.got.length===1&&near(r.got[0],r.base),r.got.map(x=>x.toFixed(2))+' want '+r.base.toFixed(2));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;castScrollNow=C0;window.__fz=false;try{for(const k of ['judgment','dslash'])setL(k,0);for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
