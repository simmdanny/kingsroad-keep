(function(){
/* Balance sim: a bot plays whole runs with a fixed build list and reports how far it gets and how much foes were locked.
   Load on a dev build (it has __kk): __kk.ev(await (await fetch('/tests/balance-sim.js')).text())
   then __bal.queue([{name,build,runs,maxW}]) and call __bal.step(9000) until it returns done:true; results in __bal.res.
   Same bot as __kk.bot: builds the list in order on road-side tiles spread >= 3 apart, always buys the cheapest part,
   equips Robin at level 12 (no scrolls), all structures unlocked with every Armory tier, calls the next wave when the
   field is clear or after 120 s. Lock% = share of foe-alive time spent stunned; Move% = road actually gained vs speed x time
   (slows, stuns and push-backs all lower it). */
const B=window.__bal={q:[],res:[],cur:null};
function spotsFor(n){const cand=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;let k=0;
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,c2=c+dc;if(rr>=0&&rr<H&&c2>=0&&c2<W&&grid[rr][c2]===1)k++;}if(k)cand.push([c,r,k+r*.15]);}
  cand.sort((a,b)=>b[2]-a[2]);const picked=[];for(const q of cand){if(picked.length>=n)break;if(picked.every(p=>Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])>=3))picked.push(q);}return picked;}
function init(cfg){
  meta.unl=meta.unl||{};meta.enh=meta.enh||{};for(const k in TD){meta.unl[k]=true;meta.enh[k]=3;}refreshTorder();
  const hid=cfg.hero||'robin';meta.owned=meta.owned||{};meta.owned[hid]=true;meta.equipped=hid;meta.heroes[hid]={lvl:cfg.heroLvl||12,xp:0,perks:{},pending:[]};
  for(const k in meta.spells)if(meta.spells[k].hero)meta.spells[k].hero=null;
  if(cfg.seed!=null){buildMap(cfg.seed);MAP.fresh=true;}newGame(1);paused=true;auto=0;
  const sp=spotsFor(cfg.build.length);
  B.cur={cfg,spots:sp.map((q,i)=>[cfg.build[i],q[0],q[1]]),i:0,phase:'build',waveT:0,
    st:{reg:{t:0,lock:0,prog:0,exp:0},boss:{t:0,lock:0,prog:0,exp:0}},lives0:lives,t0:performance.now()};
}
function buildPhase(){const C=B.cur;
  while(C.i<C.spots.length&&gold>=buildCost(C.spots[C.i][0])){const[ty,c,r]=C.spots[C.i];if(typeCount(ty)<maxOf(ty)){placeTower(ty,c,r);gold-=buildCost(ty);}C.i++;}
  if(!heroU){let q=null,bn=-1;const id=meta.equipped;   // the hero goes where it covers the most road
    for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(!heroTileOk(id,c,r))continue;let n=0;for(let r2=Math.max(0,r-3);r2<=Math.min(H-1,r+3);r2++)for(let c2=Math.max(0,c-3);c2<=Math.min(W-1,c+3);c2++)if(grid[r2][c2]===1&&(r2-r)**2+(c2-c)**2<=6.5)n++;
      if(n>bn){bn=n;q={c,r};}}
    if(q)spawnHero(q.c,q.r);}
  HEROES.forEach(h=>{while(hs(h.id).pending.length)chooseBless(h.id,0);});
  for(let g=0;g<400;g++){let best=null,bk=null;for(const t of towers){for(const[k]of PARTS[t.type]){if(!best||partCost(t,k)<partCost(best,bk)){best=t;bk=k;}}}
    if(!best||gold<partCost(best,bk)||(C.i<C.spots.length&&gold-partCost(best,bk)<buildCost(C.spots[C.i][0])&&rnd()<.5))break;
    gold-=partCost(best,bk);best.invested+=partCost(best,bk);best.parts[bk]++;}
  callWave();C.phase='fight';C.waveT=0;}
function fightStep(dt){const C=B.cur,S=C.st;
  for(const e of enemies){if(e.dead)continue;e._pd=e.dist;e._ps=e.stunT>0;}
  update(dt);updFx(dt);C.waveT+=dt;if(heroU&&heroU.rig)animHero(heroU,dt,time);   // hero attack timing lives in the render loop's animHero
  if(cineLock>0)cineLock-=dt;   // so does the great-spell lock (anim()); without this, epic+ scrolls never cast again in a sim
  for(const e of enemies){if(e.dead||e._pd==null)continue;const b=e.boss?S.boss:S.reg;b.t+=dt;if(e._ps)b.lock+=dt;b.prog+=e.dist-e._pd;b.exp+=(e.spd||0)*dt;}
  if((!enemies.length&&!spawners.length)||C.waveT>120)C.phase='build';}
function finish(){const C=B.cur,S=C.st,pc=(a,b)=>b>0?Math.round(1000*a/b)/10:null;
  B.res.push({name:C.cfg.name,wave,over:state!=='playing',lock:pc(S.reg.lock,S.reg.t),move:pc(S.reg.prog,S.reg.exp),bossLock:pc(S.boss.lock,S.boss.t),bossMove:pc(S.boss.prog,S.boss.exp),
    towers:towers.length,secs:Math.round((performance.now()-C.t0)/1000)});
  B.cur=null;}
/* Lane test: unkillable foes walk the whole road past a fixed set of buildings (no hero).
   cfg {name, towers:[[type,count],...], parts:{height,mass,special}, foes:[types], n, gap, w, boss}
   Reports avg / worst share of road time spent stunned, the longest unbroken stun, how much longer the walk took than at
   full speed (x), and the road lost to push-backs per foe. */
B.lane=cfg=>{meta.unl=meta.unl||{};meta.enh=meta.enh||{};for(const k in TD){meta.unl[k]=true;meta.enh[k]=3;}refreshTorder();meta.equipped=null;
  if(cfg.seed!=null){buildMap(cfg.seed);MAP.fresh=true;}newGame(1);paused=true;auto=0;lives=1e9;
  const list=[];for(const[ty,n]of cfg.towers)for(let i=0;i<n;i++)list.push(ty);
  spotsFor(list.length).forEach((q,i)=>{const t=placeTower(list[i],q[0],q[1]);t.parts=Object.assign({height:0,mass:0,special:0},cfg.parts);buildTowerMesh(t);});
  const mine=[],fin=[],dt=.05;let T=0,next=0;
  while(T<600&&fin.length<cfg.n&&state==='playing'){
    if(mine.length<cfg.n&&T>=next){spawnEnemy({type:cfg.foes[mine.length%cfg.foes.length]},cfg.w||30);const e=enemies[enemies.length-1];
      e.maxHp=e.hp=1e15;if(cfg.boss)e.boss=true;Object.assign(e,{_L:0,_T:0,_st:0,_mx:0,_dl:0,_len:(e.route||ROUTES[0]).len,_d0:e.dist,_sp:e.spd});mine.push(e);next+=cfg.gap;}
    for(const e of mine){if(e._done)continue;e._pd=e.dist;e._ps=e.stunT>0;}
    update(dt);updFx(dt);T+=dt;
    for(const e of mine){if(e._done)continue;e._T+=dt;if(e._ps){e._L+=dt;e._st+=dt;e._mx=Math.max(e._mx,e._st);}else e._st=0;if(e.dist<e._pd)e._dl+=e._pd-e.dist;
      if(e.dead||e.dist>=e._len-1){e._done=true;if(!e.dead)removeEnemy(e);fin.push(e);}}}
  const av=(a,f)=>a.length?a.reduce((s,e)=>s+f(e),0)/a.length:0,mx=f=>Math.max(0,...mine.map(f));
  const r={name:cfg.name,through:fin.filter(e=>!e.dead||e.dist>=e._len-1.01).length+'/'+cfg.n,lock:Math.round(100*av(mine,e=>e._L/Math.max(dt,e._T))),worst:Math.round(100*mx(e=>e._L/Math.max(dt,e._T))),
    longest:+mx(e=>e._mx).toFixed(1),walk:fin.length?+av(fin,e=>e._T/((e._len-1-e._d0)/Math.max(.05,e._sp))).toFixed(2):null,pushed:+av(mine,e=>e._dl).toFixed(1),secs:Math.round(T)};
  for(const e of enemies)removeEnemy(e);enemies=[];return r;};
/* Value test: each tower gets an equal gold budget (build + cheapest parts), placed where it covers the most road;
   a stream of normal foes (wave w) walks past; result = damage dealt (HP taken off foes) and share killed.
   cfg {name, towers:[type,...], budget, w, n, gap, foes} */
B.value=cfg=>{meta.unl=meta.unl||{};meta.enh=meta.enh||{};for(const k in TD){meta.unl[k]=true;meta.enh[k]=3;}refreshTorder();meta.equipped=null;
  if(cfg.seed!=null){buildMap(cfg.seed);MAP.fresh=true;}newGame(1);paused=true;auto=0;lives=1e9;const used=new Set();
  for(const ty of cfg.towers){let best=null,bn=-1;const R=TD[ty].range*1.2;
    for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0||used.has(c+','+r))continue;const p=tw(c,r);let n=0;
      for(let r2=Math.max(0,r-4);r2<=Math.min(H-1,r+4);r2++)for(let c2=Math.max(0,c-4);c2<=Math.min(W-1,c+4);c2++)if(grid[r2][c2]===1){const q=tw(c2,r2);if(Math.hypot(q.x-p.x,q.z-p.z)<=R)n++;}
      if(n>bn){bn=n;best=[c,r];}}
    used.add(best.join(','));const t=placeTower(ty,best[0],best[1]);let left=(cfg.budget||900)-buildCost(ty);
    for(let g=0;g<300;g++){let bk=null;for(const[k]of PARTS[ty])if(!bk||partCost(t,k)<partCost(t,bk))bk=k;const c=partCost(t,bk);if(c>left)break;left-=c;t.parts[bk]++;}buildTowerMesh(t);}
  const mine=[],dt=.05;let T=0,next=0;
  while(T<400&&state==='playing'){
    if(mine.length<cfg.n&&T>=next){spawnEnemy({type:cfg.foes[mine.length%cfg.foes.length]},cfg.w||20);const e=enemies[enemies.length-1];e._len=(e.route||ROUTES[0]).len;mine.push(e);next+=cfg.gap;}
    update(dt);updFx(dt);T+=dt;
    for(const e of mine){if(e._done)continue;if(e.dead){e._done=true;e._kill=!(e.dist>=e._len-1.01);}else if(e.dist>=e._len-1){e._done=true;e._hp=e.hp;removeEnemy(e);}}
    if(mine.length>=cfg.n&&mine.every(e=>e._done))break;}
  const dmg=mine.reduce((s,e)=>s+(e._kill?e.maxHp:e.maxHp-Math.max(0,e._hp!=null?e._hp:e.hp)),0),hp=mine.reduce((s,e)=>s+e.maxHp,0);
  const r={name:cfg.name,dmgPct:Math.round(1000*dmg/hp)/10,killed:mine.filter(e=>e._kill).length+'/'+cfg.n,parts:towers.map(t=>t.type+' '+t.parts.height+'/'+t.parts.mass+'/'+t.parts.special).join(', ')};
  for(const e of enemies)removeEnemy(e);enemies=[];return r;};
B.queue=list=>{for(const c of list)for(let r=0;r<(c.runs||1);r++)B.q.push(c);return B.q.length;};
B.step=(ms)=>{const t0=performance.now();
  while(performance.now()-t0<ms){
    if(!B.cur){if(!B.q.length)return{done:true,res:B.res};init(B.q.shift());}
    const C=B.cur;
    if(state!=='playing'||wave>=C.cfg.maxW&&C.phase==='build'){finish();continue;}
    if(C.phase==='build')buildPhase();else for(let k=0;k<20&&C.phase==='fight'&&state==='playing';k++)fightStep(.05);}
  const C=B.cur;return{done:false,left:B.q.length,cur:C?C.cfg.name+' w'+wave+' lives '+lives:null,res:B.res.length};};
B.summary=()=>{const g={};for(const r of B.res)(g[r.name]=g[r.name]||[]).push(r);const med=a=>{const s=a.filter(x=>x!=null).sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:null;};
  return Object.entries(g).map(([n,a])=>n+': waves '+a.map(r=>r.wave+(r.over?'':'+')).join(',')+' (median '+med(a.map(r=>r.wave))+') | lock '+med(a.map(r=>r.lock))+'% move '+med(a.map(r=>r.move))+'% | boss lock '+med(a.map(r=>r.bossLock))+'% boss move '+med(a.map(r=>r.bossMove))+'% | '+Math.round(a.reduce((s,r)=>s+r.secs,0)/a.length)+'s/run').join('\n');};
return 'balance sim loaded';})()
