// M4 glint close-up: node glintshot.js <level> <name> <zoom> <dt1,...>   (camera on the first tower the hand passes after T=6)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +process.argv[2], name = process.argv[3], zoom = +(process.argv[4] || .3), dts = (process.argv[5] || '.03,.12,.25,.45').split(',').map(Number);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, dts]) => {
    __kk.ev(`meta.smast=meta.smast||{};meta.smast.aeon=SM_XP[${L - 1}];AEM.dbg=[];'ok'`);
    __vis.setup(9); for (const e of __vis.L) { e.gem = 0; e.scroll = 0; }
    __kk.ev(`{const R=ROUTES[0];let n=0;for(let d=3;d<R.len-2&&n<6;d+=R.len/7){const p=posAt(d,R);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),dd=(q.x-p[0])**2+(q.z-p[1])**2;if(dd<bd&&dd>.8){bd=dd;best=[c,r];}}if(best){gold+=buildCost('archer');placeTower(['archer','mage','cannon'][n%3],best[0],best[1]);n++;}}
      const d=densest(__vis.L);__kk.camXZ(d.x,d.z,.5);scene.updateMatrixWorld(true);paused=false;speed=1;window.__fz=true;lives=1e9;}`);
    __vis.step(.1); __vis.cast('aeon'); __vis.step(7);
    let k = 0; const n0 = __kk.ev("AEM.dbg.filter(d=>d.ev==='glint').length"); while (__kk.ev("AEM.dbg.filter(d=>d.ev==='glint').length") === n0 && k++ < 200) __vis.step(.033);
    __kk.ev(`{const g=AEM.dbg.filter(d=>d.ev==='glint').pop().tw;__kk.camXZ(g.x,g.z,${zoom});scene.updateMatrixWorld(true);}`);
    const out = []; let tp = 0; for (const d of dts) { __vis.step(d - tp); tp = d; out.push(__kk.snap()); }
    __kk.ev('window.__fz=false;0'); return out;
  }, [L, zoom, dts]);
  const sheet = await page.evaluate(async ([urls, dts, L]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * .5), ch = Math.round(H0 * .6), cols = imgs.length;
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = i * cw; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, 0, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, 0, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, 0, 140, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' glint+' + dts[i] + 's', dx + 5, 14); });
    return cv.toDataURL('image/jpeg', .88);
  }, [urls, dts, L]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  console.log(name + '.jpg', errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
