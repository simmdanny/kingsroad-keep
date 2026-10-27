(function(){
/* Scroll damage sim (files session, 2026-10-26; Simon: Soul Lantern and Ball Lightning "accumulate SO MUCH damage, more than majority of
   legendary and epic and rare scrolls"). A bot (the balance-sim.js bot) plays a run to cfg.maxW with ONE scroll on the hero, cast
   automatically. Lives are endless, so every run reaches the same wave against the same waves. It reports that scroll's damage from the
   run's own meter (RSTAT.heroBy: health actually taken off foes, no overkill), its casts, and checkpoints every 25 waves.
   Load on a dev page: __kk.ev(await (await fetch('/tests/scroll-dmg-sim.js')).text()); __sds.queue([{name,scroll,maxW,seed,slvl}]);
   call __sds.step(9000) until it returns done:true; results in __sds.res. No masteries (meta.smast {}), scroll level cfg.slvl (1). */
const D=window.__sds={q:[],res:[],cur:null};
const BUILD=['archer','frost','archer','cannon','archer','mage','frost','archer','cannon','mage','archer','ballista'];
function spotsFor(n){const cand=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;let k=0;
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,c2=c+dc;if(rr>=0&&rr<H&&c2>=0&&c2<W&&grid[rr][c2]===1)k++;}if(k)cand.push([c,r,k+r*.15]);}
  cand.sort((a,b)=>b[2]-a[2]);const picked=[];for(const q of cand){if(picked.length>=n)break;if(picked.every(p=>Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])>=3))picked.push(q);}return picked;}
{const c0=castScrollNow;castScrollNow=function(k,t,s,list,P,o){if(D.cur&&t&&t===heroU&&o&&!o.smx&&!o.echo){D.cur.casts++;D.cur.P+=P;}return c0.apply(this,arguments);};}
function init(cfg){
  meta.dev=true;meta.smast={};meta.scrAuto=true;meta.arena='plains';
  meta.unl=meta.unl||{};meta.enh=meta.enh||{};for(const k in TD){meta.unl[k]=true;meta.enh[k]=3;}refreshTorder();
  const hid=cfg.hero||'robin';meta.owned=meta.owned||{};meta.owned[hid]=true;meta.equipped=hid;meta.heroes[hid]={lvl:cfg.heroLvl||12,xp:0,perks:{},pending:[]};
  if(meta.arts&&meta.arts.eq)meta.arts.eq[hid]=[null,null,null];
  for(const k in meta.spells)if(meta.spells[k].hero)meta.spells[k].hero=null;
  meta.spells[cfg.scroll]={lvl:cfg.slvl||1,hero:hid};for(const k of cfg.with||[])meta.spells[k]={lvl:cfg.slvl||1,hero:hid};   /* cfg.with: other scrolls on the same hero */
  buildMap(cfg.seed!=null?cfg.seed:31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;RSTAT=null;
  const b=cfg.build||BUILD,sp=spotsFor(b.length);
  D.cur={cfg,spots:sp.map((q,i)=>[b[i],q[0],q[1]]),i:0,phase:'build',waveT:0,casts:0,P:0,cp:{},t0:performance.now()};}
function buildPhase(){const C=D.cur;
  while(C.i<C.spots.length&&gold>=buildCost(C.spots[C.i][0])){const[ty,c,r]=C.spots[C.i];if(typeCount(ty)<maxOf(ty)){placeTower(ty,c,r);gold-=buildCost(ty);}C.i++;}
  if(!heroU){let q=null,bn=-1;const id=meta.equipped;
    for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(!heroTileOk(id,c,r))continue;let n=0;for(let r2=Math.max(0,r-3);r2<=Math.min(H-1,r+3);r2++)for(let c2=Math.max(0,c-3);c2<=Math.min(W-1,c+3);c2++)if(grid[r2][c2]===1&&(r2-r)**2+(c2-c)**2<=6.5)n++;
      if(n>bn){bn=n;q={c,r};}}
    if(q)spawnHero(q.c,q.r);}
  HEROES.forEach(h=>{while(hs(h.id).pending.length)chooseBless(h.id,0);});
  for(let g=0;g<400;g++){let best=null,bk=null;for(const t of towers){for(const[k]of PARTS[t.type]){if(!best||partCost(t,k)<partCost(best,bk)){best=t;bk=k;}}}
    if(!best||gold<partCost(best,bk)||(C.i<C.spots.length&&gold-partCost(best,bk)<buildCost(C.spots[C.i][0])&&rnd()<.5))break;
    gold-=partCost(best,bk);best.invested+=partCost(best,bk);best.parts[bk]++;}
  if(wave>0&&wave%25===0&&!C.cp[wave]){const S=RSTAT||{heroBy:{},total:0};C.cp[wave]={dmg:Math.round(S.heroBy[C.cfg.scroll]||0),total:Math.round(S.total),casts:C.casts};}
  callWave();C.phase='fight';C.waveT=0;}
function fightStep(dt){const C=D.cur;lives=1e9;
  update(dt);updFx(dt);C.waveT+=dt;if(heroU&&heroU.rig)animHero(heroU,dt,time);
  if(cineLock>0)cineLock-=dt;
  if((!enemies.length&&!spawners.length)||C.waveT>120)C.phase='build';}
function finish(){const C=D.cur,S=RSTAT||{heroBy:{},total:0},k=C.cfg.scroll,d=S.heroBy[k]||0;
  D.res.push({name:C.cfg.name||k,scroll:k,r:SPELLS_S[k].r,cd:SPELLS_S[k].cd,wave,dmg:Math.round(d),total:Math.round(S.total),share:S.total?Math.round(1000*d/S.total)/10:0,
    casts:C.casts,perCast:C.casts?Math.round(d/C.casts):0,avgP:C.casts?Math.round(C.P/C.casts):0,cp:C.cp,secs:Math.round((performance.now()-C.t0)/1000)});
  D.cur=null;}
D.queue=list=>{for(const c of list)D.q.push(c);return D.q.length;};
D.step=(ms)=>{const t0=performance.now();
  while(performance.now()-t0<ms){
    if(!D.cur){if(!D.q.length)return{done:true,res:D.res};init(D.q.shift());}
    const C=D.cur;
    if(state!=='playing'||wave>=C.cfg.maxW&&C.phase==='build'){finish();continue;}
    if(C.phase==='build')buildPhase();else for(let k=0;k<20&&C.phase==='fight'&&state==='playing';k++)fightStep(.05);}
  const C=D.cur;return{done:false,left:D.q.length,cur:C?C.cfg.scroll+' w'+wave:null,res:D.res.length};};
return 'scroll damage sim loaded';})()
