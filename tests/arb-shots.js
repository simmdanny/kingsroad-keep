/* v483 Armoured boss sheets. With `python3 -m http.server PORT` running in the project folder:
     KK_PORT=PORT node tests/arb-shots.js close <types,comma> <out.jpg> [t1,t2]   plain against armoured, front and back, at two moments of the animation
     KK_PORT=PORT node tests/arb-shots.js part <types> <out.jpg>                   close-ups of the moving parts (wings, heads, tail, legs) mid-animation
     KK_PORT=PORT node tests/arb-shots.js game <types> <out.jpg>                   in game at CAM.zoom 1, plain and armoured on the road
     KK_PORT=PORT node tests/arb-shots.js gal <types> <out.jpg>                    the Bestiary page, elite button on Armoured
   Every render is read back with toDataURL inside the same evaluate (page.screenshot can time out under swiftshader). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const PORT = process.env.KK_PORT || 8771, local = path.join(__dirname, '..', 'node_modules', 'three', 'build', 'three.min.js');
const [mode, typesArg, out, extra] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  if (fs.existsSync(local)) {
    await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(local) }));
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  }
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://localhost:${PORT}/src/kingsroad-keep.html`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.__kk && typeof THREE !== 'undefined', null, { timeout: 60000 });
  const types = typesArg.split(',');
  const url = await page.evaluate(([mode, types, extra, solo]) => __kk.ev(`(${function (mode, types, extra, extra2) {
    const V = s => s.split(':'), T = types.map(s => { const [t, v] = V(s); return { t, v: v == null ? 0 : +v }; });
    const clean = () => { for (const e of enemies.slice()) removeEnemy(e); enemies = []; spawners.length = 0; pendingWaves.length = 0; };
    meta.arena = meta.arena || 'plains'; state = 'menu'; clearWorld(); buildMap(31); MAP.fresh = true; newGame(1); paused = false; auto = 0; lives = 1e9; clean();
    const nm = (q) => (ENEMY_VARIANTS[q.t] && ENEMY_VARIANTS[q.t][q.v] ? ENEMY_VARIANTS[q.t][q.v].n : EN[q.t].nm);
    const spawn = (q, arm, d) => { spawnEnemy({ type: q.t, v: q.v, elite: arm ? ['armored'] : null, invOK: true }, 120); const e = enemies[enemies.length - 1]; e.dist = d; e.spd = Math.max(e.spd, .5); return e; };
    const step = (n, dt) => { for (let i = 0; i < n; i++) { update(dt); for (const e of enemies) { e.hp = e.maxHp; } } };
    const S = 500;
    if (mode === 'close' || mode === 'part') {
      const ts = new THREE.Scene(); ts.background = new THREE.Color(0x8a98a6); ts.add(new THREE.HemisphereLight(0xffffff, 0x665544, .95)); const dl = new THREE.DirectionalLight(0xffffff, .8); dl.position.set(-2, 4, 3); ts.add(dl);
      const gr = new THREE.Mesh(new THREE.CircleGeometry(4, 24), new THREE.MeshLambertMaterial({ color: 0x6a7064 })); gr.rotation.x = -Math.PI / 2; ts.add(gr);
      const cam = new THREE.PerspectiveCamera(30, 1, .05, 60);
      const ex = (extra || '').split(',').filter(Boolean).map(Number), tsteps = ex.length ? ex : [0, 17];
      const cells = [];
      for (const q of T) {
        const ep = spawn(q, false, 2), ea = spawn(q, true, 2.2);
        const shots = mode === 'close' ? [[ep, .6, 0, 'plain'], [ea, .6, 0, 'armoured'], [ea, 3.5, 0, 'armoured back'], [ea, 1.57, 1, 'armoured side, later']]
          : [[ea, .5, 0, 'p0'], [ea, 2.4, 0, 'p1'], [ea, 1.3, 1, 'p2'], [ea, -.9, 1, 'p3']];
        let cur = -1;
        for (const [e, yaw, ti, lab] of shots) {
          if (ti !== cur) { step(ti ? tsteps[1] : (tsteps[0] || 1), 1 / 30); cur = ti; }
          if ((extra2==='solo')) e.b.traverse(o => { if (o.isMesh && !o.userData.arb && !(o.parent && o.parent.userData && o.parent.userData.arbg)) o.visible = false; }); const p = e.g.parent, pos = e.g.position.clone(), ry = e.g.rotation.y; p.remove(e.g); ts.add(e.g); e.g.position.set(0, 0, 0); e.g.rotation.y = 0; e.b.position.y = Math.max(0, e.b.position.y - (e.y || 0)) + (e.fly ? .3 : 0); e.g.updateMatrixWorld(true);
          const bb = new THREE.Box3(); e.b.traverse(o => { if (o.isMesh && o.visible && !(o.material && o.material.transparent)) bb.expandByObject(o); }); const c = bb.getCenter(new THREE.Vector3()); let r = Math.max(.3, bb.getSize(new THREE.Vector3()).length() * (mode === 'part' ? .3 : .5));
          let tgt = c;
          let lab2 = lab;
          if (mode === 'part') { const m = ARB_M.get(e.b) || {}, L = m.limbs || {}, W = n => n && n.getWorldPosition(new THREE.Vector3());
            const opts = [['head', (m.heads && m.heads[0]) || L.hd || null], ['wing', m.wings && m.wings[0]], ['tail', m.tail && m.tail[2]], ['leg', (L.legs && L.legs[1] && L.legs[1].p) || L.legL || (L.quad && L.quad.FL)], ['arm', (L.arms && L.arms[0] && L.arms[0].p) || L.armR], ['body', (L.snake && L.snake[3]) || null], ['wing2', m.wings && m.wings[3]], ['ring', m.spin && m.spin[m.spin.length - 1] && m.spin[m.spin.length - 1].o]].filter(x => x[1]);
            const pick = opts[shots.findIndex(x => x[3] === lab) % Math.max(1, opts.length)]; if (pick) { tgt = W(pick[1]); lab2 = pick[0] + (ti ? ' mid-anim' : ''); } }
          if (mode === 'part') r = Math.max(.12, r * .55);
          cam.position.set(tgt.x + Math.sin(yaw) * r * 2.6, tgt.y + r * .9, tgt.z + Math.cos(yaw) * r * 2.6); cam.lookAt(tgt);
          renderer.setRenderTarget(null); const sz = renderer.getSize(new THREE.Vector2()); renderer.setSize(S, S, false); renderer.render(ts, cam);
          const im = renderer.domElement.toDataURL('image/png'); renderer.setSize(sz.x, sz.y, false);
          ts.remove(e.g); p.add(e.g); e.g.position.copy(pos); e.g.rotation.y = ry; cells.push({ im, lab: nm(q) + ' - ' + lab2 });
        }
        clean();
      }
      return { cells, S, cols: 2 };
    }
    if (mode === 'game') {
      const cells = [];
      for (const q of T) {
        for (const arm of [false, true]) { clean(); const e = spawn(q, arm, 4); step(20, 1 / 30); CAM.zoom = 1; if (typeof applyCam === 'function') applyCam(); CAM.px = e.x - camTarget.x; CAM.pz = e.z - camTarget.z; applyCam(); for (let i = 0; i < 3; i++) { update(1 / 30); updFx(1 / 30); anim && 0; } renderer.render(scene, camera);
          cells.push({ im: renderer.domElement.toDataURL('image/jpeg', .85), lab: nm(q) + (arm ? ' - armoured' : ' - plain') + ' (zoom 1)', crop: true, ex: e.x, ez: e.z, ey: e.y + e.hitY * .5 }); }
      }
      clean(); return { cells, S: 0, cols: 2 };
    }
    if (mode === 'gal') {
      const cells = []; const dx0 = meta.dex; meta.dex = new Proxy({}, { get: () => 1 }); openGallery();
      for (const q of T) { openVar(q.t); for (let i = 0; i < q.v; i++) varStep(1); CAM.px = GV.idx * 1.9; applyCam(); for (const k of [0, 1]) { if (k) galElite(true); else galElite(false); for (const it of GV.items) { if (it.m.wings) it.m.wings.forEach((w, j) => w.rotation.z = (j % 2 ? -1 : 1) * .3); } renderer.render(scene, camera); cells.push({ im: renderer.domElement.toDataURL('image/jpeg', .85), lab: nm(q) + ' - Bestiary ' + (k ? 'Armoured' : 'plain'), full: true }); } closeVar(); }
      closeGallery(); meta.dex = dx0; return { cells, S: 0, cols: 2 };
    }
  }})(${JSON.stringify(mode)},${JSON.stringify(types)},${JSON.stringify(extra || '')},${JSON.stringify(solo)})`), [mode, types, extra, process.env.SOLO?'solo':'']);
  /* compose the sheet in the page (a 2d canvas) */
  const jpg = await page.evaluate(async (R) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
    const ims = []; for (const c of R.cells) ims.push(await load(c.im));
    let W = R.S, H = R.S; if (!W) { W = 640; H = 450; }
    const cv = document.createElement('canvas'); const rows = Math.ceil(ims.length / R.cols); cv.width = W * R.cols; cv.height = H * rows; const g = cv.getContext('2d');
    ims.forEach((im, i) => { const x = (i % R.cols) * W, y = Math.floor(i / R.cols) * H; if (R.S) g.drawImage(im, x, y, W, H); else if (R.cells[i].full) { g.drawImage(im, im.width * .1, 0, im.width * .8, im.height * .8, x, y, W, H); } else { const sw = im.width * .5, sh = im.height * .5; g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, W, H); }
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x, y, W, 20); g.fillStyle = '#fff'; g.font = 'bold 13px sans-serif'; g.fillText(R.cells[i].lab, x + 6, y + 15); g.strokeStyle = '#222'; g.strokeRect(x, y, W, H); });
    return cv.toDataURL('image/jpeg', .88);
  }, url);
  fs.writeFileSync(out, Buffer.from(jpg.split(',')[1], 'base64'));
  if (errors.length) console.log('page errors: ' + errors.slice(0, 5).join(' | '));
  console.log('wrote ' + out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(2); });
