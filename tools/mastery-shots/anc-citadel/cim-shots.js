// Citadel of Orders (v460) contact sheet: node cim-shots.js <level> <name> <zoom> <t1,...> <focus> <spd> [n]
// times are seconds after fireScroll (an Ancient cast starts 1s later). Frames are drawn through the game's own render path (the space pass).
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 5), name = process.argv[3] || 'cim' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '2.2,4.8,7,11,13.6,14.9,15.5,15.9,16.6').split(',').map(Number), spd = +(process.argv[7] || .5), n = +(process.argv[8] || 14);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 }, { seed: +(process.env.SEED || 12345) });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;meta.spaceCalm=false;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, fcs, spd, n]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.citadel=SM_XP[${L - 1}]` : 'delete meta.smast.citadel'};CIM.dbg=[];'ok'`);
    __kk.ev("lsSet(KR,null);meta.arena='plains';state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);'ok'");__vis.setup(n); __kk.ev(`for(const e of __vis.L){e.gem=0;e.scroll=0;e.spd=${spd};}{const d=densest(__vis.L),fc=${JSON.stringify(fcs)};const c=fc==='hero'?heroU:fc==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:d;__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`);
    __vis.step(.1); __vis.cast('citadel');
    const snap = () => __kk.ev("anim(.001,performance.now()/1000);if(SDP.n>0)sdpRender();else renderer.render(scene,camera);renderer.domElement.toDataURL('image/jpeg',.85)");
    let tp = 0; const out = [];
    for (const t of times) { __vis.step(t - tp); tp = t; out.push(snap()); }
    return out;
  }, [L, zoom, times, process.argv[6] || 'hero', spd, n]);
  const sheet = await page.evaluate(async ([urls, times, L, CROP]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, CR = CROP, cw = Math.round(W0 * CR), ch = Math.round(H0 * Math.min(1, CR * 1.1)), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, Math.max(0, (H0 - ch) / 2 - H0 * .04), cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, +(process.env.CROP || .6)]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify(CIM.dbg.map(d=>d.ev+'@'+(d.t-CIM.dbg[0].t).toFixed(2)).join(' '))");
  console.log(name + '.jpg', dbg.slice(0, 300), errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
