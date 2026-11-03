// Vael'Thoruun (v458) contact sheet: node shots.js <level> <name> <zoom> <t1,...> <focus> <nFoes> <walkSpeed> <cols>
// times are seconds after fireScroll (the storm itself starts about 1 s later, after the hero's pose)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 5), name = process.argv[3] || 'vtm' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '1.8,2.15,3.6,5.2,6.6,7.5,8.6,9.15,9.5,10.5,11.5,12.5').split(',').map(Number);
  const focus = process.argv[6] || 'dense', nF = +(process.argv[7] || 16), walk = +(process.argv[8] || 0), cols = +(process.argv[9] || 3);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  if(process.env.JUMP)await page.evaluate(j=>{window.__jump=j;},+process.env.JUMP);
  const urls = await page.evaluate(async ([L, zoom, times, fcs, nF, walk]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.vael=SM_XP[${L - 1}]` : 'delete meta.smast.vael'};VTM.dbg=[];'ok'`);
    __vis.setup(nF); __kk.ev(`{__vis.L.forEach((e,i)=>{e.gem=0;e.scroll=0;e.dist=8.2+i*.26;e.off=((i*7)%5-2)*.14;moveEnemy(e,0);if(${walk})e.spd=${walk};});const d=densest(__vis.L),fc=${JSON.stringify(fcs)};const c=fc==='hero'?heroU:fc==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:d;__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`); __vis.step(.1); __kk.ev("window.__tf=time"); __vis.cast('vael');
    let tp = 0; const out = [];
    const J=+(window.__jump||0);let jd=false;for (const t of times) { if(J&&!jd&&t>J){__vis.step(J-tp);tp=J;jd=true;__kk.ev("__vis.L.forEach(e=>{e.dist+=2.5;moveEnemy(e,0);});'ok'");} __vis.step(t - tp); tp = t; out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, focus, nF, walk]);
  const sheet = await page.evaluate(async ([urls, times, L, cols]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * .62), ch = Math.round(H0 * .66), rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2 - H0 * .04, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 150, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's (T' + (times[i] - 1).toFixed(2) + ')', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, cols]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const off = await ev("VTM.dbg&&VTM.dbg[0]?(VTM.dbg[0].t-__tf).toFixed(2):'-'"); console.log('cast starts', off, 's after fireScroll');
  const dbg = await ev("JSON.stringify((VTM.dbg||[]).filter(d=>d.ev!=='strike'&&d.ev!=='crater'&&d.ev!=='tick'&&d.ev!=='arcs').map(d=>d.ev+'@'+(d.t-(VTM.dbg[0]||{t:0}).t).toFixed(2)).join(' '))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
