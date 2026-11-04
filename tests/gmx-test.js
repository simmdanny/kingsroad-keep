(function(){
/* v476 gold-building masteries: the Gold Mine, the Windmill and the Merchant's Post earn 1 XP for every MAST_GOLD gold they make (their wave
   income with its share of interest, the Merchant's Post's bounty, their mastery payouts), no longer MAST_SUP a wave; the Bell Tower keeps it.
   Run on the dev page: __kk.ev(await (await fetch('/tests/gmx-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,G0=gold;
const near=(a,b)=>Math.abs(a-b)<1e-6*Math.max(1,Math.abs(b));
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;};
const play=()=>{meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();};
const spots=n=>{const o=[];for(let r=3;r<H-2&&o.length<n;r++)for(let c=1;c<W-1&&o.length<n;c++){if(grid[r][c]!==0)continue;if(o.some(([c2,r2])=>Math.abs(c2-c)+Math.abs(r2-r)<3))continue;
    for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]])if(grid[r+dr]&&grid[r+dr][c+dc]===1){o.push([c,r]);break;}}return o;};
const put=(k,s)=>{const t=placeTower(k,s[0],s[1]);buildTowerMesh(t);return t;};
const earnedOf=k=>towers.filter(t=>t.type===k).reduce((a,t)=>a+(t.earned||0),0);
/* a foe standing still on the road where it comes nearest t (far: farthest from it) */
const foeAt=(t,hp,far)=>{spawnEnemy({type:'soldier',v:0},10);const e=enemies[enemies.length-1];const R=ROUTES[0];let bd=far?-1:1e9,bdist=0;
  for(let d=0;d<R.len;d+=.1){e.route=R;e.dist=d;moveEnemy(e,0);const q=(e.x-t.x)**2+(e.z-t.z)**2;if(far?q>bd:q<bd){bd=q;bdist=d;}}
  e.route=R;e.dist=bdist;e.off=0;e.spd=0;e.maxHp=e.hp=hp||10;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
/* the hero lands the blow: a kill by a building would give it kill XP as well */
const slay=e=>hurt(e,1e6,'phys',{src:heroU});
try{
  ok('the gold buildings are the Gold Mine, the Windmill and the Merchant\u2019s Post; the Bell Tower is a support building but makes no gold',
    GOLD_T.join()==='mine,windmill,merchant'&&GOLD_T.every(k=>SUPPORT_T.includes(k))&&SUPPORT_T.includes('bell')&&!GOLD_T.includes('bell'),GOLD_T.join()+' / '+SUPPORT_T.join());
  ok('1 XP for every '+MAST_GOLD+' gold',MAST_GOLD===10,MAST_GOLD);
  play();meta.mast={};const S=spots(6);const mine=put('mine',S[0]),mill=put('windmill',S[1]),post=put('merchant',S[2]),bell=put('bell',S[3]);
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;
  GMX.dbg=[];
  /* the wave call pays each its income: that is its XP */
  {const inc={mine:tStats(mine).income,windmill:tStats(mill).income,merchant:tStats(post).income};gold=0;callWave();clean();
   ok('a wave call: each gold building earns its income / '+MAST_GOLD+' in XP',GOLD_T.every(k=>inc[k]>0&&near(mastXp(k),inc[k]/MAST_GOLD)&&near(earnedOf(k),inc[k])),
     GOLD_T.map(k=>k+' '+inc[k].toFixed(1)+' gold, '+mastXp(k).toFixed(2)+' XP').join('; '));
   ok('logged as wave pay',GMX.dbg.length===3&&GMX.dbg.every(d=>d.how==='wave'));}
  /* the interest share counts too */
  {mine.parts.mass=6;const s=tStats(mine);const x0=mastXp('mine'),e0=mine.earned;gold=4000;callWave();clean();const d=mine.earned-e0;
   ok('its share of interest counts: the mine with a vault earns more than its income, and all of it is XP',s.interest>0&&d>s.income+1&&near(mastXp('mine')-x0,d/MAST_GOLD),
     'income '+s.income.toFixed(1)+', interest '+(s.interest*100).toFixed(1)+'%, made '+d.toFixed(1)+', XP +'+(mastXp('mine')-x0).toFixed(2));}
  /* a cleared wave: the bell keeps its flat XP, the gold buildings get none of it */
  {const xb=mastXp('bell'),xg=GOLD_T.map(mastXp);lmWaveClear(wave);
   ok('a cleared wave: the Bell Tower still earns '+MAST_SUP+' XP, the gold buildings no flat XP',near(mastXp('bell')-xb,MAST_SUP)&&GOLD_T.every((k,i)=>near(mastXp(k),xg[i])),
     'bell +'+(mastXp('bell')-xb)+', gold '+GOLD_T.map((k,i)=>'+'+(mastXp(k)-xg[i]).toFixed(2)).join(' '));}
  /* the Merchant's Post's bounty */
  {const x0=mastXp('merchant'),e0=post.earned,g0=gold;const e=foeAt(post,5);slay(e);const d=post.earned-e0;
   ok('a foe slain in the post\u2019s range: its extra gold is the post\u2019s XP',e.dead&&d>0&&near(mastXp('merchant')-x0,d/MAST_GOLD)&&GMX.dbg.some(q=>q.how==='bounty'),
     'bounty '+d.toFixed(2)+' gold, XP +'+(mastXp('merchant')-x0).toFixed(3));clean();}
  {const x0=mastXp('merchant'),e0=post.earned;const e=foeAt(post,5,true);const R=TD.merchant.range*1.5,out_=(e.x-post.x)**2+(e.z-post.z)**2>R*R;slay(e);
   ok('a foe slain out of the post\u2019s range: no bounty, no XP',out_&&e.dead&&post.earned===e0&&mastXp('merchant')===x0,Math.hypot(e.x-post.x,e.z-post.z).toFixed(1)+' tiles off');clean();}
  /* mastery payouts */
  {meta.mast.mine=MAST_XP[3];const x0=mastXp('mine'),e0=mine.earned;lmWaveClear(10);const d=mine.earned-e0;
   ok('Mastery 4: the 10th-wave Mother Lode pays, and its gold is XP',d>=Math.round(tStats(mine).income*2)-1&&near(mastXp('mine')-x0,d/MAST_GOLD)&&GMX.dbg.some(q=>q.how==='payout'&&q.k==='mine'),
     'paid '+d+' gold, XP +'+(mastXp('mine')-x0).toFixed(2));}
  /* a resumed run's tally is never counted again */
  {mill.earned=50000;const x0=mastXp('windmill');gold=0;callWave();clean();const d=mill.earned-50000;
   ok('a tally restored from a save is not counted again: only the new income is',d>0&&d<500&&near(mastXp('windmill')-x0,d/MAST_GOLD),'made '+d.toFixed(1)+', XP +'+(mastXp('windmill')-x0).toFixed(2));mill.earned-=50000;}
  /* nothing outside play */
  {const x0=mastXp('mine');state='menu';mxPay(mine,500);state='playing';
   ok('no XP outside a run',mastXp('mine')===x0);mine.earned-=500;}
  /* every gold the buildings made, and nothing else, became XP */
  {meta.mast.mine=0;const S2=spots(6);const m2=put('mine',S2[4]);const x={};for(const k of GOLD_T)x[k]=mastXp(k);for(const t of towers)if(GOLD_T.includes(t.type))t.mx0=t.earned||0;
   for(let i=0;i<5;i++){gold=1500;callWave();clean();lmWaveClear(wave);}
   const made=k=>towers.filter(t=>t.type===k).reduce((a,t)=>a+(t.earned||0)-t.mx0,0);
   ok('over five waves each type\u2019s XP is exactly the gold its buildings made / '+MAST_GOLD+' (two mines count together)',GOLD_T.every(k=>made(k)>0&&near(mastXp(k)-x[k],made(k)/MAST_GOLD)),
     GOLD_T.map(k=>k+' '+made(k).toFixed(0)+' gold, +'+(mastXp(k)-x[k]).toFixed(1)+' XP').join('; '));}
  /* fighting towers are unchanged */
  {const S3=spots(6);const a=put('archer',S3[5]);const x0=mastXp('archer');const e=foeAt(a,5);hurt(e,1e6,'phys',{src:a});
   ok('a fighting tower still earns its kill XP',near(mastXp('archer')-x0,MAST_KILL),mastXp('archer')-x0);clean();}
  /* the card says so */
  {const txt=k=>{mastOpen(k);const o=document.getElementById('mastModal');const s=o?o.querySelector('.mst-how').textContent:'';if(o)o.remove();return s;};
   const tm=txt('mine'),tp=txt('merchant'),tb=txt('bell');
   ok('the mastery card: gold buildings grow with the gold they make, 1 XP per '+MAST_GOLD+' gold; only the post names its bounty',
     /grow with the gold/.test(tm)&&new RegExp('1 XP for every '+MAST_GOLD+' gold').test(tm)&&!/stands through|slays/.test(tm)&&!/slain in its range/.test(tm)&&/slain in its range/.test(tp),tm);
   ok('the Bell Tower\u2019s card is unchanged',new RegExp(MAST_SUP+' XP for every wave it stands through').test(tb),tb);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{GMX.dbg=null;const o=document.getElementById('mastModal');if(o)o.remove();clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);gold=G0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
