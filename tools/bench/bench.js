// Kingsroad Keep frame benchmark (v491). Plays a fixed, seeded heavy scenario in headless Chromium and reports where each frame's time goes.
//   node tools/bench/bench.js [scenario] [--steps N] [--profile out.json] [--norender] [--gfx auto|high|medium|low] [--tiny] [--menu S]
// scenarios: late (wave 120, 20 towers, the hero, the wave's own foes kept at about 90 alive, elites and formations), spells (late + a big scroll
// cast every 2.5s, rotating Ancients, Mythics and Secrets), taiga (late on the Deep Taiga), crowd (late with 160 foes)
// Needs the dev server: python3 -m http.server PORT -d <repo> ; KK_PORT picks the port (default 8771). Prints one JSON line of results.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SC = args[0] && !args[0].startsWith('--') ? args[0] : 'late', STEPS = +(opt('--steps') || 900), PROF = opt('--profile'), NOREN = args.includes('--norender'), GFX = opt('--gfx'), TINY = args.includes('--tiny'), MENU = +(opt('--menu') || 0);
const PORT = process.env.KK_PORT || 8771, local = path.join(__dirname, '..', '..', 'node_modules', 'three', 'build', 'three.min.js');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  if (fs.existsSync(local)) { await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(local) })); await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); }
  const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  const tLoad0 = Date.now(); await page.goto(`http://localhost:${PORT}/src/kingsroad-keep.html`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__kk && typeof THREE !== 'undefined', null, { timeout: 120000 }); const loadMs = Date.now() - tLoad0;
  // --menu S waits S seconds in the menu first, as a player does: the idle time v493 uses to build shaders ahead of the fight
  if (MENU > 0) await page.waitForTimeout(MENU * 1000);
  const setup = await page.evaluate(sc => __kk.ev(`(()=>{const SC=${JSON.stringify(sc)};window.__fz=true;/* the game's own loop stops: only the bench's steps move the game (it used to run between steps, adding unmeasured updates, renders and foes) */window.requestAnimationFrame=function(){return 0;};meta.notesSeen=NOTES_V;const np=document.getElementById('notesPop');if(np)np.classList.remove('on');
    let s=12345;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
    meta.arena=SC==='taiga'?'taiga':'plains';lsSet(KR,null);state='menu';clearWorld();buildMap(77);MAP.fresh=true;newGame(1);auto=0;lives=1e9;paused=false;speed=1;
    for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;
    const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);if(!heroU)spawnHero(q.c,q.r);
    const T=Object.keys(TD).filter(k=>!TD[k].hero&&k!=='mine'&&k!=='windmill'&&k!=='merchant'&&k!=='bell');const sp=[];
    for(let r=2;r<H-2&&sp.length<20;r++)for(let c=1;c<W-1&&sp.length<20;c++){if(grid[r][c]!==0)continue;if(sp.some(([c2,r2])=>Math.abs(c2-c)+Math.abs(r2-r)<3))continue;
      for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]])if(grid[r+dr]&&grid[r+dr][c+dc]===1){sp.push([c,r]);break;}}
    {const se=spawnEnemy;spawnEnemy=function(){const n0=enemies.length,r=se.apply(this,arguments);for(let i=n0;i<enemies.length;i++){const e=enemies[i];e.maxHp*=window.__hpK||1;e.hp=e.maxHp;}return r;};}window.__hpK=SC==='crowd'?40:SC==='late'||SC==='spells'||SC==='taiga'?8:1;
    gold=1e9;sp.forEach((p,i)=>{try{const t=placeTower(T[i%T.length],p[0],p[1]);buildTowerMesh(t);}catch(e){}});
    wave=SC==='crowd'?140:120;window.__bw=()=>{const W=buildWave(wave);spawners.push({t:0,q:W.q.slice(),w:wave});};window.__bw();
    window.__cap=SC==='crowd'?160:90;window.__bwT=0;window.__SPELLS=['tempest','citadel','abyss','eclipse','singularity','purgatory','firestorm','wormhole'].filter(k=>SPELLS_S[k]);
    return {towers:towers.length,spots:sp.length,spells:window.__SPELLS.length};})()`), SC);
  // --gfx auto|high|medium|low pins the Graphics setting (v495); builds before v495 have none and report it
  const gfx = await page.evaluate(g => __kk.ev(`(()=>{if(typeof setGfx!=='function')return 'none (before v495)';${g ? `setGfx(${JSON.stringify(g)});` : ''}return gqLabel();})()`), GFX);
  // --tiny draws into a 192x120 canvas at pixel ratio 1: filling pixels costs next to nothing, so render ms is mostly the CPU's side of drawing
  if (TINY) await page.evaluate(() => __kk.ev('(()=>{renderer.setPixelRatio(1);renderer.setSize(192,120,false);return renderer.getSize(new THREE.Vector2()).toArray();})()'));
  // warm up 120 steps (shader compiles, pools), then measure
  const stepJs = `(()=>{const dt=1/60;const P=performance;const A=window.__A=window.__A||{n:0,upd:0,fx:0,anim:0,ren:0,max:0,calls:0,tris:0,foes:0,cast:0,heap0:0,heapMax:0,spikes:0};
    A.n++;const t0=P.now();if(enemies.length<window.__cap&&spawners.length<2)window.__bw();for(const sp of spawners)sp.t=Math.min(sp.t,.12);
    if(${SC === 'spells'}&&(A.n%150===0)&&heroU&&window.__SPELLS.length){const k=window.__SPELLS[(A.n/150|0)%window.__SPELLS.length];try{meta.spells[k]=meta.spells[k]||{lvl:1,own:1};heroU.scd={};heroU.gcd=0;const s=heroStats(),L=sortTargets(heroU,enemies.filter(e=>!e.dead));fireScroll(heroU,k,s,L);A.cast++;}catch(e){}}
    renderer.info.autoReset=false;renderer.info.reset();update(dt);const t1=P.now();updFx(dt);const t2=P.now();for(const e of enemies)updBar(e);anim(dt,t1/1000);const t3=P.now();
    if(!${NOREN}){if(LENS.on)lensRender();else if(DOM.post&&DOM.post.on)DOM.post.render();else if(SDP.n>0)sdpRender();else renderer.render(scene,camera);if(SGL.n>0)sglPass();}
    const t4=P.now();const IC=renderer.info.render.calls,IT=renderer.info.render.triangles;renderer.info.autoReset=true;return [t1-t0,t2-t1,t3-t2,t4-t3,IC,IT,enemies.length,(performance.memory?performance.memory.usedJSHeapSize:0)];})()`;
  for (let i = 0; i < 120; i++) await page.evaluate(c => __kk.ev(c), stepJs);
  const progs0 = await page.evaluate(() => __kk.ev('renderer.info.programs.length'));
  const breakdown = js => page.evaluate(c => __kk.ev(c), `(()=>{const own=new Map();for(const e of enemies)if(e.g)own.set(e.g,'foes');for(const t of towers)if(t.g)own.set(t.g,'towers');if(heroU&&heroU.g)own.set(heroU.g,'hero');
    if(typeof TERRAIN!=='undefined')own.set(TERRAIN,'terrain');if(typeof castle!=='undefined')own.set(castle,'keep');const B={},S={},cast={n:0};
    scene.traverseVisible(o=>{if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;if(!(o.layers.mask&1))return;/* (v492: hidden originals live on layer 30 only) */let p=o,k=null;while(p&&p!==scene){if(own.has(p)){k=own.get(p);break;}if(p.parent===scene)break;p=p.parent;}
      if(!k){k=p&&p.parent===scene?(p.name||(p.isPoints?'points':p.isInstancedMesh?'instanced':(p.type||'obj'))):'?';k='other:'+k;}const n=o.isInstancedMesh?1:1;B[k]=(B[k]||0)+n;if(o.castShadow){cast.n++;S[k]=(S[k]||0)+1;}});
    const top=Object.entries(B).sort((a,b)=>b[1]-a[1]);const other=top.filter(x=>x[0].startsWith('other:'));
    return {byOwner:Object.fromEntries(top.filter(x=>!x[0].startsWith('other:'))),otherTotal:other.reduce((a,x)=>a+x[1],0),otherTop:other.slice(0,12),shadowCasters:cast.n,shadowByOwner:S,
      lights:(()=>{let n=0;scene.traverse(o=>{if(o.isLight)n++;});return n;})(),shadowMap:renderer.shadowMap.enabled,pixelRatio:renderer.getPixelRatio(),size:[renderer.domElement.width,renderer.domElement.height]};})()`);
  const bd0 = await breakdown();
  let cdp = null; if (PROF) { cdp = await ctx.newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.startSampling', { samplingInterval: 32768 }); }
  const rows = []; for (let i = 0; i < STEPS; i++) rows.push(await page.evaluate(c => __kk.ev(c), stepJs));
  let prof = null, heapS = null; if (cdp) { prof = (await cdp.send('Profiler.stop')).profile; heapS = (await cdp.send('HeapProfiler.stopSampling')).profile; }
  const col = k => rows.map(r => r[k]), avg = a => a.reduce((x, y) => x + y, 0) / a.length, pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))]; };
  const tot = rows.map(r => r[0] + r[1] + r[2] + r[3]), js = rows.map(r => r[0] + r[1] + r[2]), heap = col(7);
  const casts = await page.evaluate(() => __kk.ev('(window.__A||{}).cast||0'));
  const out = { scenario: SC, gfx, tiny: TINY, menuS: MENU, casts, steps: STEPS, loadMs, setup, ms: { update: +avg(col(0)).toFixed(3), fx: +avg(col(1)).toFixed(3), anim: +avg(col(2)).toFixed(3), render: +avg(col(3)).toFixed(3), js: +avg(js).toFixed(3), total: +avg(tot).toFixed(3), jsP95: +pct(js, .95).toFixed(3), jsP99: +pct(js, .99).toFixed(3), jsMax: +Math.max(...js).toFixed(2) },
    draw: { calls: Math.round(avg(col(4))), callsMax: Math.max(...col(4)), tris: Math.round(avg(col(5))) }, foes: Math.round(avg(col(6))), heapMB: { start: +(heap[0] / 1e6).toFixed(1), end: +(heap[heap.length - 1] / 1e6).toFixed(1), max: +(Math.max(...heap) / 1e6).toFixed(1) },
    gpuMem: await page.evaluate(() => __kk.ev('(()=>{const m=renderer.info.memory;return {geos:m.geometries,tex:m.textures,progs:renderer.info.programs.length};})()')), errors: errors.slice(0, 5), progsDuringRun: (await page.evaluate(() => __kk.ev('renderer.info.programs.length'))) - progs0, breakdown: bd0 };
  if (prof) { // self time per function (top 40), and the biggest allocators (top 25)
    const self = new Map(), byId = new Map(prof.nodes.map(n => [n.id, n])), dts = prof.timeDeltas; const cnt = new Map(); prof.samples.forEach((id, i) => cnt.set(id, (cnt.get(id) || 0) + (dts[i] || 0)));
    for (const [id, us] of cnt) { const n = byId.get(id), f = n.callFrame, key = (f.functionName || '(anon)') + ' ' + (f.url ? f.url.split('/').pop() : '') + ':' + (f.lineNumber + 1); self.set(key, (self.get(key) || 0) + us); }
    const totalUs = [...self.values()].reduce((a, b) => a + b, 0); out.profileTop = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, us]) => [k, +(us / 1000).toFixed(1), +(100 * us / totalUs).toFixed(1)]);
    const al = new Map(); const walk = n => { const f = n.callFrame, key = (f.functionName || '(anon)') + ':' + (f.lineNumber + 1); al.set(key, (al.get(key) || 0) + n.selfSize); (n.children || []).forEach(walk); }; walk(heapS.head);
    out.allocTop = [...al.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, b]) => [k, +(b / 1e6).toFixed(2)]);
    fs.writeFileSync(PROF, JSON.stringify({ out, prof }, null, 0)); }
  console.log(JSON.stringify(out)); await browser.close();
})().catch(e => { console.error(e); process.exit(2); });
