(function(){
/* Harder lands pay better: gem multipliers per arena, slightly rarer scrolls. Run on the dev page:
   __kk.ev(await (await fetch('/tests/rewards-test.js')).text()) returns [name, ok, detail] rows. Puts the arena and gems back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const a0=meta.arena,g0=meta.gems,ar0=JSON.stringify(meta.arenas||{});
const avg=(n,k)=>{let s=0;for(let i=0;i<k;i++)s+=arenaGems(n);return s/k;};
try{
  meta.arenas=Object.assign({},meta.arenas,{snow:1,tundra:1});
  /* v330: waves pay half the gems (rounded, at least 1); gem carriers stay at 2% of foes (Simon) */
  {let t=0;for(let w=1;w<=200;w++)t+=waveGems(w);ok('waves pay half: 1, 4, 17, 32 gems at waves 1, 10, 100, 200; 1350 over 200 waves (was 2600)',waveGems(1)===1&&waveGems(10)===4&&waveGems(100)===17&&waveGems(200)===32&&t===1350,t);
   ok('gem carriers unchanged: 1 foe in 50',typeof GEM_CARRIER_CH==='undefined'&&[...document.scripts].some(q=>q.textContent.includes('forceGem||rnd()<.02)')));}
  meta.arena='plains';ok('Plains: gems unchanged',arenaGems(7)===7&&arenaGems(1)===1&&arenaGemTag()==='');
  meta.arena='snow';{const m=avg(4,40000)/4;ok('Frostvale: gems x1.25 on average',Math.abs(m-1.25)<.01,m.toFixed(4));ok('Frostvale: whole numbers only',[...Array(200)].every(()=>Number.isInteger(arenaGems(3))));}
  ok('Frostvale: the toast says why',arenaGemTag().indexOf('Frostvale')>=0,arenaGemTag());
  meta.arena='tundra';{const m=avg(4,40000)/4;ok('Tundra: gems x1.5 on average',Math.abs(m-1.5)<.01,m.toFixed(4));}
  {const base=RAR.reduce((s,r)=>s+r.p,0);for(const a of ['plains','snow','tundra']){meta.arena=a;const sum=RAR.reduce((s,r)=>s+rarP(r),0);ok(a+': scroll odds add up to the same total',Math.abs(sum-base)<1e-12,sum.toFixed(9));}}
  meta.arena='plains';const base=RAR.map(r=>rarP(r));
  for(const [a,b] of [['snow',.04],['tundra',.08]]){meta.arena=a;const q=RAR.map(r=>rarP(r));
    ok(a+': every rarity above Common is '+Math.round(b*100)+'% more likely',RAR.every((r,i)=>i===0||r.id==='unique'||Math.abs(q[i]/base[i]-(1+b))<1e-9),q.map(v=>(v*100).toFixed(3)).join(' / '));
    ok(a+': Common gives it up',q[0]<base[0]&&q[0]>.6,(base[0]*100).toFixed(2)+'% -> '+(q[0]*100).toFixed(2)+'%');
    ok(a+': secret scrolls still never drop outside the events',q[RAR.length-1]===0);}
  {meta.arena='tundra';const N=300000,cnt={};for(let i=0;i<N;i++){const r=rollRarity();cnt[r.id]=(cnt[r.id]||0)+1;}const rare=(cnt.rare||0)/N,exp=rarP(RAR[2]);
    ok('Tundra: drops follow the new odds',Math.abs(rare/exp-1)<.03,(rare*100).toFixed(3)+'% vs '+(exp*100).toFixed(3)+'%');}
  {meta.arena='snow';const T=rarTilt(WM_RW),s0=WM_RW.reduce((s,q)=>s+q[1],0),s1=T.reduce((s,q)=>s+q[1],0);
    ok('the merchant stock: same rarities, same total, a little rarer',T.every((q,i)=>q[0]===WM_RW[i][0])&&Math.abs(s0-s1)<1e-9&&T[4][1]>WM_RW[4][1]&&T[0][1]<WM_RW[0][1],T.map(q=>q[1].toFixed(4)).join(' '));}
  meta.arena='plains';ok('Plains: the merchant stock is unchanged',rarTilt(WM_RW)===WM_RW);
  /* a real wave clear in Frostvale pays the bonus and says so */
  {meta.arena='snow';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);lives=1e9;paused=false;const got=[];const ag=addGems;addGems=function(n,msg){got.push([n,msg]);return ag.apply(this,arguments);};
    try{wave=9;nextQ=buildWave(10);callWave();for(let i=0;i<3000&&spawners.length;i++){update(.05);updFx(.05);}for(const e of enemies.slice())if(!e.dead)kill(e,null);for(let i=0;i<10;i++){update(.05);updFx(.05);}}finally{addGems=ag;}
    const w=got.find(q=>/Wave 10 cleared/.test(q[1])),base10=waveGems(10);
    ok('Frostvale: clearing wave 10 pays more gems',w&&(w[0]===Math.floor(base10*1.25)||w[0]===Math.ceil(base10*1.25)),w?w[0]+' vs '+base10+' ('+w[1]+')':'no payout');gameOver();}
}catch(e){ok('no errors',false,e.message);}
finally{meta.arena=a0;meta.arenas=JSON.parse(ar0);meta.gems=g0;saveMeta();state='menu';clearWorld();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
