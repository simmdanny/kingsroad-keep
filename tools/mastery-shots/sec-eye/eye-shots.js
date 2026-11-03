// Eye of the Blood Moon (v467) contact sheet: node eye-shots.js <level> <name> <zoom> <t1,...> <focus> <killAt> <crop>
// Times are seconds after fireScroll (the Eye opens 1s later). killAt: seconds at which two branded foes die (The Gaze Moves On).
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'eye' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '1.9,2.75,3.3,3.9,4.6,5.1,5.5,7,11').split(',').map(Number), killAt = +(process.argv[7] || 0), crop = +(process.argv[8] || .55);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, fcs, killAt]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.bloodeye=SM_XP[${L - 1}]` : 'delete meta.smast.bloodeye'};BEY.dbg=[];'ok'`);
    __kk.ev("lsSet(KR,null);meta.arena='plains';state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);'ok'");__vis.setup(12); __kk.ev(`__vis.L.forEach((e,i)=>{e.gem=0;e.scroll=0;if(i%4===0){e.maxHp=2e9;}});{const d=densest(__vis.L),fc=${JSON.stringify(fcs)};const c=fc==='hero'?heroU:fc==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:fc==='eye'?{x:d.x,z:d.z-1.6}:d;__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`); __vis.step(.1); __vis.cast('bloodeye');
    let tp = 0; const out = []; let killed = false;
    for (const t of times) {
      if (killAt && !killed && t > killAt) { __vis.step(killAt - tp); tp = killAt; killed = true; __kk.ev("enemies.filter(e=>!e.dead&&e.eyeT>time).slice(0,2).forEach(e=>hurt(e,1e13,'magic',{src:heroU}));'ok'"); }
      __vis.step(t - tp); tp = t; out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, process.argv[6] || 'eye', killAt]);
  const sheet = await page.evaluate(async ([urls, times, L, crop]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * crop), ch = Math.round(H0 * crop * 1.05), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2 - H0 * .06, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, crop]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify((BEY.dbg||[]).map(d=>d.ev+'@'+(d.t-BEY.dbg[0].t).toFixed(2)).join(' '))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
