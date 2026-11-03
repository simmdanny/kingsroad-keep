// Eternal Winter contact sheet: node ew-shots.js <level> <name> <zoom> <t1,...> <focus> [boss] [n]
// focus: dense | hero | mid | heart ; boss: 1 makes the 3rd foe a boss. SEED=map seed (31), FULLSHOT=1 takes page screenshots (DOM overlays: aurora, veil)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'ew' + L, zoom = +(process.argv[4] || .45);
  const times = (process.argv[5] || '0.6,1.3,1.75,2.4,3.4,4.3,4.6,4.85,5.3').split(',').map(Number), boss = +(process.argv[7] || 0), n = +(process.argv[8] || 12), seed = +(process.env.SEED || 31), PG = !!process.env.FULLSHOT;
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  await page.evaluate(async ([L, zoom, fcs, boss, n, seed, pre0]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.eternalwinter=SM_XP[${L - 1}]` : 'delete meta.smast.eternalwinter'};EWM.dbg=[];'ok'`);
    __kk.ev(`meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(${seed});MAP.fresh=true;newGame(1);'ok'`); __vis.setup(n);
    __kk.ev(`__vis.L.forEach(e=>{e.gem=0;e.scroll=0;});${boss===1 ? "{const e=__vis.L[2];e.boss=true;}" : boss===2 ? "{spawnEnemy({type:'ogre'},1);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=ROUTES[0];e.dist=__vis.L[__vis.L.length-1].dist-1.6;e.off=0;e.maxHp=e.hp=1e9;e.spd=0;e.res={};moveEnemy(e,0);__vis.B=e;}" : ''}{const d=densest(__vis.L),fc=${JSON.stringify(fcs)};const c=fc==='boss'?__vis.B:fc==='hero'?heroU:fc==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:fc==='heart'?myHeartSpot(d):d;__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`); __vis.step(.1);
    if (pre0) __kk.ev(pre0); __kk.ev("window.__t0=time;'ok'"); __vis.cast('eternalwinter');
    let pre = 0; while (pre < 4 && !__kk.ev('!!(MY_FROST&&MY_FROST.visible)')) { __vis.step(.033); pre += .033; } window.__pre = pre;
  }, [L, zoom, process.argv[6] || 'dense', boss, n, seed, process.env.PRE || '']);
  let tp = 0; const urls = [];
  for (const t of times) {
    await page.evaluate(dt => { __vis.step(dt); }, t - tp); tp = t;
    if (PG) { await page.evaluate(() => { __kk.snap(); }); urls.push('data:image/jpeg;base64,' + (await page.screenshot({ type: 'jpeg', quality: 85 })).toString('base64')); }
    else urls.push(await page.evaluate(() => __kk.snap()));
  }
  const sheet = await page.evaluate(async ([urls, times, L]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * .6), ch = Math.round(H0 * .66), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("EWM.dbg?JSON.stringify(EWM.dbg.map(d=>d.ev+'@'+(d.t-window.__t0).toFixed(2)).filter((x,i,a)=>a.indexOf(x)===i).join(' ')):'-'");
  console.log(name + '.jpg', 'pre', await page.evaluate(() => window.__pre), dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
