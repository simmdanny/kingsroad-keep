// Wrath of Gaia (v455) contact sheet: node shots.js <level> <name> <zoom> <t1,...> <focus> [walkAt] [crop]
// focus: dense | keep | hero | mid | x,z ; walkAt: seconds after fireScroll at which 6 foes standing far off the road walk back onto it
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'g' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '1.3,2,3.2,5.2,6.65,6.85,7.05,7.3,7.7').split(',').map(Number), focus = process.argv[6] || 'dense', walkAt = +(process.argv[7] || 0), crop = +(process.argv[8] || 0);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;meta.shake=false;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, fcs, walkAt]) => {
    __kk.ev(`lsSet(KR,null);meta.arena='plains';state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);meta.smast=meta.smast||{};${L ? `meta.smast.gaia=SM_XP[${L - 1}]` : 'delete meta.smast.gaia'};WGM.dbg=[];lives=Math.max(1,keepMax()-6);'ok'`);
    __vis.setup(12);
    __kk.ev(`{const R=ROUTES[0];__vis.W=[];for(let i=0;i<6;i++){spawnEnemy({type:i%2?'soldier':'peasant'},1);const e=enemies[enemies.length-1];e.route=R;e.dist=4+i*1.7;e.off=60;e.maxHp=e.hp=1e9;e.spd=0;e.res={};e.gem=0;e.scroll=0;moveEnemy(e,0);__vis.W.push(e);}}`);
    __kk.ev(`{const d=densest(__vis.L),fc=${JSON.stringify(fcs)};let c;if(fc==='hero')c=heroU;else if(fc==='keep')c=tw(MAP.cc,H-1.4);else if(fc==='walker'){const p=posAt(4+2*1.7,ROUTES[0]);c={x:p[0],z:p[1]};}else if(fc==='mid')c={x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2};else if(fc.includes(','))c={x:+fc.split(',')[0],z:+fc.split(',')[1]};else c=d;__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`);
    __vis.step(.1); __vis.cast('gaia');
    let tp = 0, walked = false; const out = [];
    for (const t of times) {
      if (walkAt && !walked && t > walkAt) { __vis.step(walkAt - tp); tp = walkAt; walked = true; __kk.ev("__vis.W.forEach((e,i)=>{e.off=(i%3-1)*.2;moveEnemy(e,0);});'ok'"); }
      __vis.step(t - tp); tp = t; out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, focus, walkAt]);
  const sheet = await page.evaluate(async ([urls, times, L, crop]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = crop ? Math.round(W0 * .55) : W0 / 2, ch = crop ? Math.round(H0 * .62) : H0 / 2, cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; if (crop) g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2 - H0 * .04, cw, ch, dx, dy, cw, ch); else g.drawImage(im, 0, 0, W0, H0, dx, dy, cw, ch);
      g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 110, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .86);
  }, [urls, times, L, crop]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify((WGM.dbg||[]).reduce((a,d)=>{a[d.ev]=(a[d.ev]||0)+1;return a;},{}))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
