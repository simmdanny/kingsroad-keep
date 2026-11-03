// Ember Titan contact sheet: node shots.js <level> <name> <zoom> <t1,...> [crop] [n foes] [along]
// times are seconds after fireScroll (the Mythic cast lands 1s later); the camera centres on the titan's blade (along tiles out from it)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'et' + L, zoom = +(process.argv[4] || .6);
  const times = (process.argv[5] || '2.2,3.0,3.45,3.6,3.9,4.4,5.5,7,8.5').split(',').map(Number), crop = +(process.argv[6] || .55), nF = +(process.argv[7] || 14), along = +(process.argv[8] || 4.5);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  if (process.env.DS) await ev('window.__ds=1;1');
  if (process.env.OFF) await ev('window.__off=' + process.env.OFF + ';1');
  if (process.env.SEED) await ev('window.__seed=' + process.env.SEED + ';1');
  const urls = await page.evaluate(async ([L, zoom, times, nF, along]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.embertitan=SM_XP[${L - 1}]` : 'delete meta.smast.embertitan'};if(typeof EMT!=='undefined')EMT.dbg=[];'ok'`);
    __kk.ev("meta.arena='plains';meta.scrAuto=false;state='menu';clearWorld();buildMap(+(window.__seed||777));MAP.fresh=true;newGame(1);'ok'");__vis.setup(nF); __kk.ev(`{const R=ROUTES[0];let best=null,bl=0;for(let d=0;d<R.len-4;d+=.25){let l=0;const A=posAt(d,R);for(let e=d+1;e<R.len;e+=.5){const B=posAt(e,R);let dev=0;for(let k=1;k<8;k++){const p=posAt(d+(e-d)*k/8,R),t=k/8;dev=Math.max(dev,Math.hypot(p[0]-(A[0]+(B[0]-A[0])*t),p[1]-(A[1]+(B[1]-A[1])*t)));}if(dev>.08)break;l=e-d;}if(l>bl){bl=l;best=d;}}
      window.__st=[best,bl,R.len];__vis.L.forEach((e,i)=>{e.gem=0;e.scroll=0;e.dist=best+(window.__off!=null?window.__off:Math.min(bl-3.5,7.5))+i*.22;moveEnemy(e,0);});}const d=densest(__vis.L);__kk.camXZ(d.x,d.z,${zoom});scene.updateMatrixWorld(true);`); __vis.step(.1);
    __vis.cast('embertitan');
    let tp = 0; const out = [];
    __vis.step(1.1); tp = 1.1;
    __kk.ev(`{let g=null;for(const o of NS_OWN)if(o.isGroup)g=o;if(g){const a=g.rotation.y;__kk.camXZ(g.position.x+Math.sin(a)*${along},g.position.z+Math.cos(a)*${along},${zoom});}scene.updateMatrixWorld(true);}`);
    for (const t of times) { __vis.step(t - tp); tp = t; if (window.__ds) __kk.ev("for(const o of NS_OWN)if(o.isMesh&&o.material&&o.material.polygonOffset)o.material.side=THREE.DoubleSide;1"); out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, nF, along]);
  const sheet = await page.evaluate(async ([urls, times, L, crop]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * crop), ch = Math.round(H0 * crop * 1.1), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + (times[i] - 1).toFixed(2) + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, crop]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("typeof EMT!=='undefined'&&EMT.dbg?JSON.stringify(EMT.dbg.map(d=>d.ev+'@'+(d.t-EMT.dbg[0].t).toFixed(2)).join(' ')):'-'");
  console.log(name + '.jpg', await ev('JSON.stringify(window.__st)'), dbg, errors.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
