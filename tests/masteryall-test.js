(function(){
/* Masteries for every building (v347+): each building in BATCH has five upgrades, its Mastery 5 stats differ from Mastery 0 where the
   masteries say so, and a 20 s fight at Mastery 5 against a crowd hurts foes, fires its timed ability and throws no errors.
   Plus a few checks of single masteries. Run on the dev page: __kk.ev(await (await fetch('/tests/masteryall-test.js')).text()) returns
   [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;projs.slice().forEach(p=>{scene.remove(p.m);});projs.length=0;};
const play=()=>{meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();};
const spot=()=>{for(let r=4;r<H-3;r++)for(let c=1;c<W-1;c++){if(grid[r][c]!==0)continue;for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]])if(grid[r+dr]&&grid[r+dr][c+dc]===1)return[c,r];}return null;};
/* foes on the road at about `want` tiles from the tower */
const crowd=(t,n,want,hp)=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.abs(Math.hypot(e0.x-t.x,e0.z-t.z)-want);if(q<bd){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);
  const L=[];for(let i=0;i<n;i++){spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdist-.6+i*.18;e.off=(i%2?.12:-.12);e.spd=.0001;e.maxHp=e.hp=hp||1e7;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);L.push(e);}return L;};
const run=sec=>{for(let i=0;i<sec/.05;i++){update(.05);updFx(.05);}};
const BATCH={catapult:{want:2.4,cap:'mxV',st:s=>s.splash},lantern:{want:1.4,cap:'mxV',st:s=>s.burn},snare:{want:1.3,cap:'mxV',st:s=>s.root},storm:{want:1.4,cap:'mxV',st:s=>s.chain},
  alchemist:{want:1.4,cap:'mxV',st:s=>s.splash},obelisk:{want:1.4,cap:'mxV',st:s=>s.rampT},
  trebuchet:{want:3,cap:'mxV',st:s=>s.dmg},ranger:{want:2,cap:'mxV',st:s=>s.range},rune:{want:1.4,cap:'mxV',st:s=>s.runes},graveyard:{want:1.3,cap:'mxV',st:s=>s.hands},spear:{want:1.6,cap:'mxV',st:s=>s.pierce},drum:{want:1.3,cap:'mxV',st:s=>s.rate},
  altar:{want:1.4,cap:'mxV',st:s=>s.pct},mirror:{want:1.4,cap:'mxV',st:s=>s.bounces},plague:{want:1.4,cap:'mxV',st:s=>s.dps},grove:{want:1.4,cap:'mxV',st:s=>s.root},shrine:{want:1.4,cap:'mxV',st:s=>s.judgeR},void:{want:1.4,cap:'mxV',st:s=>s.back},flame:{want:1.4,cap:'mxV',st:s=>s.range}};
if(MAST_D.bell)BATCH.bell={want:1.3,cap:'mxV',st:s=>s.daze};
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  for(const k in BATCH){const B=BATCH[k];ok(k+': five masteries',MAST_D[k]&&MAST_D[k].length===5&&MAST_D[k].every(p=>p.n&&p.d));
    play();const sp=spot(),t=placeTower(k,sp[0],sp[1]);buildTowerMesh(t);
    meta.mast={[k]:0};const v0=B.st(tStats(t));meta.mast={[k]:1e9};const v5=B.st(tStats(t));ok(k+': Mastery 5 changes its stats',v0!==v5,v0+' -> '+v5);
    const L=crowd(t,8,B.want);const e0=errs;t.cd=0;paused=false;run(20);paused=true;const hurt_=L.filter(e=>e.hp<e.maxHp).length;
    ok(k+': a 20s fight at Mastery 5 hurts the crowd, uses its timed ability, and throws nothing',hurt_>=4&&t[B.cap]!=null&&errs===e0,hurt_+' hurt, ability '+(t[B.cap]!=null)+', errors '+(errs-e0));clean();}
  /* single masteries */
  play();
  {const sp=spot(),t=placeTower('catapult',sp[0],sp[1]);meta.mast={catapult:1e9};const L=crowd(t,3,2.4);const e=L[0],d0=e.dist;hurt(e,10,'siege',{src:t});ok('Catapult Aftershock: a hit knocks the foe back',e.dist<d0-.05,(d0-e.dist).toFixed(2));
   ok('Catapult Molten Core: and sets it burning',e.burn&&e.burn.t>0);t.cd=1e9;t.mxV=time;let n=0;const sa=splashAt;splashAt=function(){n++;return sa.apply(this,arguments);};try{MX.splash.catapult(e.x,e.z,1,100,'siege',{src:t},t,5);run(1.5);}finally{splashAt=sa;}
   ok('Catapult Shatterstone: 3 fragments land',n===3,n);clean();}
  {const sp=spot(),t=placeTower('lantern',sp[0],sp[1]);meta.mast={lantern:1e9};const L=crowd(t,1,1.4,10);const e=L[0];e.gold=10;e.burn={t:2,dps:1,o:{src:t},pt:0};const g0=gold;hurt(e,100,'magic',{src:t,el:'fire'});
   ok('Lantern Soul Harvest: a burning foe it kills pays 50% more',e.dead&&gold-g0>0,(gold-g0).toFixed(1));clean();}
  {const sp=spot(),t=placeTower('snare',sp[0],sp[1]);meta.mast={snare:1e9};const L=crowd(t,2,1.3,1e6);const e=L[0];hurt(e,1,'phys',{src:t});ok('Snare Tangle: a netted foe is Weakened',e.weakT>0);
   const b=L[1];b.hp=5;b.gold=10;b.snT=time;const g0=gold;hurt(b,100,'phys',{src:null});const g1=gold-g0;meta.mast={snare:0};const c2=crowd(t,1,1.3,5)[0];c2.gold=10;c2.snT=time;const g2=gold;hurt(c2,100,'phys',{src:null});
   ok('Snare Hunter’s Prize: a netted foe pays 25% more, whoever kills it',Math.abs(g1/(gold-g2)-1.25)<.02,(g1).toFixed(1)+' vs '+(gold-g2).toFixed(1));clean();}
  {const sp=spot(),t=placeTower('storm',sp[0],sp[1]);meta.mast={storm:1e9};const L=crowd(t,4,1.4,1e6);const a=L[0];hurt(a,1,'magic',{src:t,el:'lightning'});ok('Storm Static Field: struck foes slow 15%',a.slow>=.15&&a.slowT>1);
   const v=crowd(t,1,1.4,5)[0];v.route=L[1].route;v.dist=L[1].dist;v.off=L[1].off;moveEnemy(v,0);const h=L.map(e=>e.hp);hurt(v,100,'magic',{src:t,el:'lightning'});ok('Storm Ball Lightning: a kill hits the 3 nearest',L.filter((e,i)=>e.hp<h[i]).length===3);clean();}
  {const sp=spot(),t=placeTower('alchemist',sp[0],sp[1]);meta.mast={alchemist:1e9};const L=crowd(t,3,1.4,1e6);const e=L[0];const h=L.map(q=>q.hp);hurt(e,1,'magic',{src:t,el:'fire'});hurt(e,1,'magic',{src:t,el:'ice'});
   ok('Alchemist Catalyst: two potions within 4s make it explode on everyone around',L.every((q,i)=>q.hp<h[i]-1));
   let n=0;const tk=SX.alchemist.tick;t.mxN=0;const sh=shoot;shoot=function(){n++;return sh.apply(this,arguments);};try{for(let i=0;i<4;i++){t.cd=0;SX.alchemist.tick(t,tStats(t),L,.05);}}finally{shoot=sh;}
   ok('Alchemist Double Batch: 5 flasks for 4 throws',n===5,n);clean();}
  {const sp=spot(),t=placeTower('obelisk',sp[0],sp[1]);meta.mast={obelisk:1e9};const L=crowd(t,3,1.4,1e6);const e=L[0];hurt(e,10,'magic',{src:t});ok('Obelisk Searing Beam: its hit sets the target burning',e.burn&&e.burn.t>0);
   meta.mast={obelisk:0};const s0=tStats(t).rampT;meta.mast={obelisk:1e9};ok('Obelisk Quick Focus: 30% faster focus',Math.abs(s0/tStats(t).rampT-1.3)<1e-6);clean();}
  /* batch 2 (v348) */
  {const sp=spot(),t=placeTower('trebuchet',sp[0],sp[1]);meta.mast={trebuchet:1e9};const e=crowd(t,1,3,1e6)[0];e.stunT=0;hurt(e,10,'siege',{src:t});ok('Trebuchet Stunning Impact: a hit dazes the foe',e.stunT>0);clean();}
  {const sp=spot(),t=placeTower('ranger',sp[0],sp[1]);meta.mast={ranger:1e9};const e=crowd(t,1,2,1e6)[0];hurt(e,10,'phys',{src:t});ok('Ranger Poisoned Tips: a hit poisons',e.burn&&e.burn.t>0);
   meta.mast={ranger:0};const f0=tStats(t).flyX;meta.mast={ranger:1e9};ok('Ranger Hawk Talons: +50% on flyers',Math.abs(tStats(t).flyX-f0-.5)<1e-9);clean();}
  {const sp=spot(),t=placeTower('rune',sp[0],sp[1]);meta.mast={rune:1e9};t.mxV=time;paused=false;run(4);paused=true;const n=(t.runeL||[]).length;const L=crowd(t,3,1.4,1e6);const h=L.map(e=>e.hp);
   const n0=(t.runeL||[]).length;t.mxV=null;MX.tick.rune(t,.05,5);ok('Rune Glyph of Ruin: every carved rune detonates at once',n0>0&&(t.runeL||[]).length===0,n0+' runes');clean();}
  {const sp=spot(),t=placeTower('graveyard',sp[0],sp[1]);meta.mast={graveyard:1e9};const e=crowd(t,1,1.3,1e6)[0];hurt(e,1,'magic',{src:t,el:'dark'});ok('Graveyard Grave Chill: struck foes slow 25%',e.slow>=.25);clean();}
  {const sp=spot(),t=placeTower('spear',sp[0],sp[1]);meta.mast={spear:1e9};const L=crowd(t,2,1.6,1e6);L[0].stunT=0;t.mxP=null;hurt(L[0],10,'pierce',{src:t});hurt(L[1],10,'pierce',{src:t});
   ok('Spear Impale: the first foe of a throw is pinned, not the next',L[0].stunT>0&&!(L[1].stunT>0));ok('Spear Barbed Wounds: skewered foes bleed',L[0].burn&&L[0].burn.t>0);clean();}
  {const sp=spot(),t=placeTower('drum',sp[0],sp[1]);meta.mast={drum:1e9};const L=crowd(t,3,1.3,1e6);const s=tStats(t);t.mxB=0;const dm=[];for(let i=0;i<5;i++){const h=L[0].hp;t.cd=0;SX.drum.tick(t,s,L,.05);dm.push(h-L[0].hp);}
   ok('Drum Thunder Beat: the 5th beat hits far harder',dm[4]>dm[0]*2,dm.map(x=>x.toFixed(0)).join(','));
   const a=placeTower('archer',sp[0]+(grid[sp[1]][sp[0]+1]===0?1:-1),sp[1]);const r0=a?tStats(a).rate:0;t.mxV=null;MX.tick.drum(t,.05,5);ok('Drum Battle Hymn: towers in its range attack 25% faster for a while',!a||Math.abs(tStats(a).rate/r0-1.25)<1e-6,a?(tStats(a).rate/r0).toFixed(3):'no spot');clean();}
  /* batch 3 (v349) */
  {const sp=spot(),t=placeTower('altar',sp[0],sp[1]);meta.mast={altar:1e9};const L=crowd(t,3,1.4,1e6);hurt(L[0],10,'magic',{src:t,el:'dark'});ok('Altar Hemorrhage: a drained foe bleeds',L[0].burn&&L[0].burn.t>0);
   const v=crowd(t,1,1.4,5)[0];v.route=L[1].route;v.dist=L[1].dist;v.off=L[1].off;moveEnemy(v,0);const h=L.map(e=>e.hp);hurt(v,100,'magic',{src:t,el:'dark'});ok('Altar Sanguine Burst: a kill bursts on the foes around',L.some((e,i)=>e.hp<h[i]));clean();}
  {const sp=spot(),t=placeTower('mirror',sp[0],sp[1]);meta.mast={mirror:1e9};const L=crowd(t,3,1.4,1e6);const h=L.map(e=>e.hp);t.mxP=null;hurt(L[0],100,'magic',{src:t,el:'light'});
   ok('Mirror Prism Split: the first hit splits into 2 more beams',L.slice(1).filter((e,i)=>e.hp<h[i+1]).length===2);clean();}
  {const sp=spot(),t=placeTower('plague',sp[0],sp[1]);meta.mast={plague:1e9};const L=crowd(t,3,1.4,1e6);t.sick=[{e:L[0],left:6}];t.mxR=null;t.mxV=time;MX.tick.plague(t,.05,5);ok('Plague Rot: infected foes are Weakened',L[0].weakT>0&&!(L[1].weakT>0));
   t.mxV=null;MX.tick.plague(t,.05,5);ok('Plague Pandemic: every foe in range is infected at once',L.every(e=>t.sick.some(q=>q.e===e)),t.sick.length);clean();}
  {const sp=spot(),t=placeTower('grove',sp[0],sp[1]);meta.mast={grove:1e9};const e=crowd(t,1,1.4,1e6)[0];hurt(e,10,'magic',{src:t});ok('Grove Thorn Bleed: a seized foe bleeds',e.burn&&e.burn.t>0);clean();}
  {const sp=spot(),t=placeTower('shrine',sp[0],sp[1]);meta.mast={shrine:1e9};const L=crowd(t,6,1.4,1e6);t.cd=1e9;const h=L.map(e=>e.hp);t.mxV=null;MX.tick.shrine(t,.05,5);paused=false;run(1);paused=true;
   ok('Shrine Divine Wrath: pillars strike and judge the strongest',t.mxV!=null&&L.filter((e,i)=>e.hp<h[i]).length>=4&&L.filter(e=>e.vuln>=tStats(t).vuln-1e-9).length>=4);clean();}
  {const sp=spot(),t=placeTower('void',sp[0],sp[1]);meta.mast={void:1e9};const L=crowd(t,3,1.4,1e6);hurt(L[0],10,'magic',{src:t,el:'dark'});ok('Void Touch: a dragged foe is Weakened',L[0].weakT>0);
   t.cd=1e9;const h=L.map(e=>e.hp);L.forEach(e=>e.stunT=0);t.mxV=null;MX.tick.void(t,.05,5);const held=L.filter(e=>e.stunT>0).length;paused=false;run(1.6);paused=true;
   ok('Void Singularity: holds the crowd, then collapses on it',held>=2&&L.filter((e,i)=>e.hp<h[i]).length>=2,held+' held');clean();}
  {const sp=spot(),t=placeTower('flame',sp[0],sp[1]);meta.mast={flame:1e9};const L=crowd(t,3,1.4,1e6);hurt(L[0],1,'magic',{src:t,el:'fire'});ok('Flame Smoke: foes it hits slow 15%',L[0].slow>=.15);
   const v=crowd(t,1,1.4,5)[0];v.route=L[1].route;v.dist=L[1].dist;v.off=L[1].off;moveEnemy(v,0);v.burn={t:2,dps:1,o:{src:t,dot:true},pt:0};const h=L.map(e=>e.hp);hurt(v,100,'magic',{src:t,el:'fire'});ok('Flame Ember Burst: a burning foe it kills explodes',v.dead&&L.some((e,i)=>e.hp<h[i]));clean();}
  /* batch 4 (v350), the support buildings */
  if(MAST_D.bell){HYMN.length=0;MXZ.length=0;const nbr=sp=>[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].map(([dc,dr])=>[sp[0]+dc,sp[1]+dr]).find(([c,r])=>grid[r]&&grid[r][c]===0);
   {const sp=spot(),t=placeTower('bell',sp[0],sp[1]);meta.mast={bell:1e9};const e=crowd(t,1,1.3,1e6)[0];e.shield=100;hurt(e,1,'magic',{src:t});ok('Bell Shattering Toll: a toll tears 25% of a shield away (after the toll itself hits it)',e.shield>73&&e.shield<=75,e.shield);
    const nb=nbr(sp),a=nb&&placeTower('archer',nb[0],nb[1]);ok('bell test: an archer stands next to the bell',!!a);
    if(a){a.cd=1e9;meta.mast={bell:MAST_XP[1]};const r2=tStats(a).rate;meta.mast={bell:MAST_XP[2]};const r3=tStats(a).rate;ok('Bell Rousing Toll: towers in its aura attack 5% faster',Math.abs(r3/r2-1.05)<1e-6,(r3/r2).toFixed(4));
     meta.mast={bell:0};const R0=auraR(t);meta.mast={bell:MAST_XP[1]};ok('Bell Wide Peal: its aura reaches 15% further',Math.abs(auraR(t)/R0-1.15)<1e-6,(auraR(t)/R0).toFixed(3));
     meta.mast={bell:1e9};const q0=tStats(a).rate;t.cd=1e9;t.mxV=null;MX.tick.bell(t,.05,5);ok('Bell Great Peal: towers in range attack 40% faster for a while',Math.abs(tStats(a).rate/q0-1.4)<1e-6,(tStats(a).rate/q0).toFixed(3));
     ok('Great Peal dazes the foes in range',e.stunT>0);paused=false;run(4.2);paused=true;ok('and the peal fades after 4s',Math.abs(tStats(a).rate/q0-1)<1e-6,(tStats(a).rate/q0).toFixed(3));}clean();}
   {const sp=spot(),t=placeTower('mine',sp[0],sp[1]);meta.mast={mine:0};const s0=tStats(t);meta.mast={mine:1e9};const s5=tStats(t);ok('Mine: Richer Veins and Royal Treasury dig 43% more gold',Math.abs(s5.income/s0.income-1.43)<1e-6,(s5.income/s0.income).toFixed(3));
    ok('Mine Deep Vault: +0.5% interest',Math.abs(s5.interest-s0.interest-.005)<1e-9);const inc=Math.round(s5.income),rush=x=>x===0||Math.abs(x-inc)<=1;
    lmWaveClear(10);const d10=MXPAY.n;lmWaveClear(25);const d25=MXPAY.n;let d7=[];const tq=toast;toast=()=>{};try{for(let i=0;i<80;i++){lmWaveClear(7);d7.push(MXPAY.n);}}finally{toast=tq;}
    ok('Mine Mother Lode: wave 10 pays triple',rush(d10-Math.round(s5.income*2)),d10+' (income '+inc+')');ok('Mine Royal Treasury: wave 25 pays ten times',rush(d25-Math.round(s5.income*9)),d25);
    ok('Mine Gold Rush: an ordinary wave now and then pays again',d7.every(rush)&&d7.some(x=>x>0),d7.filter(x=>x>0).length+"/80");clean();}
   {const sp=spot(),t=placeTower('windmill',sp[0],sp[1]);const nb=nbr(sp),a=nb&&placeTower('archer',nb[0],nb[1]);ok('windmill test: an archer stands next to the windmill',!!a);
    if(a){a.cd=1e9;meta.mast={windmill:MAST_XP[0]};const d1=tStats(a).dmg;meta.mast={windmill:MAST_XP[1]};const d2=tStats(a).dmg;ok('Windmill Fresh Bread: towers in its range deal 5% more',Math.abs(d2/d1-1.05)<1e-6,(d2/d1).toFixed(4));
     const R2=auraR(t);meta.mast={windmill:MAST_XP[2]};ok('Windmill Wider Fields: its bread reaches 15% further',Math.abs(auraR(t)/R2-1.15)<1e-6);
     meta.mast={windmill:1e9};crowd(t,1,1.5,1e6);const q0=tStats(a).dmg;t.mxV=null;paused=false;lmAnim(.05,0);paused=true;ok('Windmill Feast: towers in range deal 30% more for a while',Math.abs(tStats(a).dmg/q0-1.3)<1e-6,(tStats(a).dmg/q0).toFixed(3));
     lmWaveClear(10);ok('Windmill Harvest Festival: wave 10 pays triple',Math.abs(MXPAY.n-Math.round(tStats(t).income*2))<=1,MXPAY.n);}clean();}
   {const sp=spot(),t=placeTower('merchant',sp[0],sp[1]);const e=crowd(t,1,1.4,1e6)[0];meta.mast={merchant:0};const m0=merchMul(e);meta.mast={merchant:MAST_XP[1]};const m2=merchMul(e);meta.mast={merchant:1e9};const m5=merchMul(e);
    ok('Merchant Bounty Hunters, then Golden Caravan: +10%, then +25% gold from foes slain in range',m0>1&&Math.abs(m2-m0-.1)<1e-9&&Math.abs(m5-m0-.25)<1e-9,m0.toFixed(2)+' '+m2.toFixed(2)+' '+m5.toFixed(2));
    meta.mast={merchant:0};const i0=tStats(t).income;meta.mast={merchant:1e9};ok('Merchant: Better Deals and Trade Route earn 26.5% more',Math.abs(tStats(t).income/i0-1.265)<1e-6,(tStats(t).income/i0).toFixed(3));
    lmWaveClear(25);ok('Merchant Golden Caravan: wave 25 pays ten times',Math.abs(MXPAY.n-Math.round(tStats(t).income*9))<=1,MXPAY.n);clean();}
   ok('every building has its five masteries',Object.keys(TD).every(k=>MAST_D[k]&&MAST_D[k].length===5),Object.keys(TD).filter(k=>!MAST_D[k]).join(','));}
  {state='menu';showOverlay('menu');const mn=document.getElementById('moreNotes'),b=document.getElementById('bMoreNotes');ok('More: the patch notes are folded with View more',!!mn&&mn.classList.contains('mn-fold')&&!!b&&b.textContent==='View more');
   b.click();ok('View more opens them, Show less folds them',mn.classList.contains('mn-open')&&b.textContent==='Show less'&&(b.click(),!mn.classList.contains('mn-open')));play();}
  ok('no errors in the whole run',errs===0,errs);
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
