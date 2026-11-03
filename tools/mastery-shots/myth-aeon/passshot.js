// close-up right after the hand passes one foe: node passshot.js <level> <name> <zoom> <afterT> <dt1,dt2,...>
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +process.argv[2], name = process.argv[3], zoom = +(process.argv[4] || .15), after = +(process.argv[5] || 12), dts = (process.argv[6] || '.03,.25,.5,.9').split(',').map(Number);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, after, dts, FI]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.aeon=SM_XP[${L - 1}]` : 'delete meta.smast.aeon'};'ok'`);
    __vis.setup(9); for (const e of __vis.L) { e.gem = 0; e.scroll = 0; }
    __kk.ev(`{const R=ROUTES[0];for(let i=0;i<22;i++){spawnEnemy({type:['soldier','knight','rider','peasant','monk'][i%5],v:0},1);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=2+i*(R.len-4)/22;e.off=(i%3-1)*.24;e.maxHp=e.hp=1e9;e.spd=0;e.res={};moveEnemy(e,0);__vis.L.push(e);}}`);
    __kk.ev(`{const d0=densest(__vis.L);__kk.camXZ(d0.x,d0.z,.5);scene.updateMatrixWorld(true);window.__foc=${FI}>=0?__vis.L[${FI}]:(__vis.L.filter(e=>{const q=Math.hypot(e.x-d0.x,e.z-d0.z);return q>2.4&&q<4.2;})[0]||__vis.L[0]);scene.updateMatrixWorld(true);paused=false;speed=1;window.__fz=true;lives=1e9;window.__pt=[];const H0=hurt;window.__H0=H0;hurt=function(e,a,k,o){if(e===__foc&&o&&o.spell==='aeon')__pt.push(time);return H0.apply(this,arguments);};}`);
    __vis.step(.1); __vis.cast('aeon'); const t0 = __kk.ev('time');
    __vis.step(after + 1); __kk.ev(`__kk.camXZ(__foc.x,__foc.z,${zoom});scene.updateMatrixWorld(true);`); const n0 = __kk.ev('__pt.length'); let k = 0; while (__kk.ev('__pt.length') === n0 && k++ < 120) __vis.step(.033);
    const out = []; let tp = 0; for (const d of dts) { __vis.step(d - tp); tp = d; out.push(__kk.snap()); }
    __kk.ev('hurt=__H0;window.__fz=false;0'); return out;
  }, [L, zoom, after, dts, +(process.env.FI || 0)]);
  const sheet = await page.evaluate(async ([urls, dts, L]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * .5), ch = Math.round(H0 * .55), cols = imgs.length;
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = i * cw; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, 0, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, 0, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, 0, 140, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' pass+' + dts[i] + 's', dx + 5, 14); });
    return cv.toDataURL('image/jpeg', .88);
  }, [urls, dts, L]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  console.log(name + '.jpg', errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
