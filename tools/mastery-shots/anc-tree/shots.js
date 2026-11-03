// Eldritch Tree (v462) contact sheet: node shots.js <level> <name> <zoom> <t1,...> <focus: hero|dense|tree|treefoot> [spd] [n]
// env: LOW=k (every k-th foe stands at 19% health, so the roots swallow it at Mastery 4+), CROP (default .6), DZ/DX camera offsets
// times are seconds after fireScroll. Frames are drawn through the game's own render path.
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 5), name = process.argv[3] || 'etm' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '3,6,9,12,20.5,21.5').split(',').map(Number), fcs = process.argv[6] || 'hero', spd = +(process.argv[7] || .3), n = +(process.argv[8] || 18);
  const low = +(process.env.LOW || 0), dx = +(process.env.DX || 0), dz = +(process.env.DZ || 0);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;meta.spaceCalm=false;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, fcs, spd, n, low, dx, dz]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.firsttree=SM_XP[${L - 1}]` : 'delete meta.smast.firsttree'};ETM.dbg=[];'ok'`);
    __kk.ev("lsSet(KR,null);meta.arena='plains';state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);'ok'"); __vis.setup(n);
    __kk.ev(`__vis.L.forEach((e,i)=>{e.gem=0;e.scroll=0;e.spd=${spd};e.dist=6+i*.45;e.off=(i%3-1)*.25;moveEnemy(e,0);if(${low}&&i%${low || 1}===0)e.hp=e.maxHp*.19;});{const d=densest(__vis.L),fc=${JSON.stringify(fcs)};const c=fc==='dense'?d:heroU;__kk.camXZ(c.x+${dx},c.z+${dz},${zoom});scene.updateMatrixWorld(true);}`);
    __kk.ev("state='playing';paused=false;speed=1;worldSlow=1;'ok'");__vis.step(.1); __vis.cast('firsttree');
    const snap = () => __kk.ev("anim(.001,performance.now()/1000);if(typeof SDP!=='undefined'&&SDP.n>0)sdpRender();else renderer.render(scene,camera);renderer.domElement.toDataURL('image/jpeg',.85)");
    const trunk = () => __kk.ev("(()=>{let t=null;scene.traverse(o=>{if(!t&&o.isGroup&&o.children[0]&&o.children[0].isMesh&&o.children[0].material&&o.children[0].material.vertexColors&&o.children[0].geometry.type==='CylinderGeometry')t=o;});return t?[t.position.x,t.position.z]:null;})()");
    let tp = 0; const out = [];let aimed=false;
    for (const t of times) { if(!aimed&&(fcs==='tree'||fcs==='treefoot')&&t>1.6){__vis.step(1.6-tp);tp=1.6;const p=trunk();if(p)__kk.ev(`__kk.camXZ(${p[0]}+${dx},${p[1]}+${fcs==='tree'?3.5:1.5}+${dz},${zoom});scene.updateMatrixWorld(true);`);aimed=true;}
      __vis.step(t - tp); tp = t; out.push(snap()); }
    return out;
  }, [L, zoom, times, fcs, spd, n, low, dx, dz]);
  const sheet = await page.evaluate(async ([urls, times, L, CROP]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, CR = CROP, cw = Math.round(W0 * CR), ch = Math.round(H0 * Math.min(1, CR * 1.1)), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, Math.max(0, (H0 - ch) / 2 - H0 * .04), cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, +(process.env.CROP || .6)]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify(ETM.dbg.reduce((a,d)=>{a[d.ev]=(a[d.ev]||0)+1;return a;},{}))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
