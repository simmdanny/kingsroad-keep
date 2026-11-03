// Eclipse of the Damned (v451) contact sheet: node shots.js <level> <name> <zoom> <t1,...> <focus: board|dense|x,z> [crop] [cols]
// times are seconds after the cast itself (fireScroll's 1s delay is stepped first). A crowd: three clusters of foes along the road.
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'ecl' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '2.5,4.2,5.0,5.4,6.0,6.6,7.5,7.9,8.6').split(',').map(Number), fcs = process.argv[6] || 'board', crop = +(process.argv[7] || .62), cols = +(process.argv[8] || 3);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  await page.evaluate(n => { window.__ncl = n; }, +(process.env.NCL || 3));
  const urls = await page.evaluate(async ([L, zoom, times, fcs]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.eclipse=SM_XP[${L - 1}]` : 'delete meta.smast.eclipse'};ECM.dbg=[];'ok'`);
    __kk.ev("meta.arena='plains';state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);'ok'");__vis.setup(+(window.__ncl||3)*6);
    __kk.ev(`{const R=ROUTES[0];__vis.L.forEach((e,i)=>{const c=Math.floor(i/6),j=i%6;e.dist=R.len*((window.__ncl||3)===1?[.5]:[.3,.5,.72])[c]+j*.28;e.off=(j%3-1)*.24;e.gem=0;e.scroll=0;moveEnemy(e,0);});
      const d=densest(__vis.L),fc=${JSON.stringify(fcs)};let c;if(fc==='board')c={x:0,z:-.5};else if(fc==='dense')c=d;else if(fc[0]==='c')c=__vis.L[(+fc[1])*6+2];else{const q=fc.split(':').map(Number);c={x:q[0],z:q[1]};}__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`);
    __vis.step(.1); __vis.cast('eclipse'); __vis.step(1.0);
    let tp = 0; const out = [];
    for (const t of times) { __vis.step(t - tp); tp = t; out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, fcs]);
  const sheet = await page.evaluate(async ([urls, times, L, crop, cols]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * crop), ch = Math.round(H0 * crop), rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 110, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, crop, cols]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify((ECM.dbg||[]).reduce((a,d)=>{a[d.ev]=(a[d.ev]||0)+1;return a;},{}))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
