// Lance of the Seraph contact sheet: node shots.js <level> <name> <zoom> <t1,...> [n foes] [crop] [dx,dz] [boss]
// times are seconds after the cast itself (fireScroll's 1 s delay is stepped first)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'srl' + L, zoom = +(process.argv[4] || .45);
  const times = (process.argv[5] || '.5,1.2,1.85,2.05,2.15,2.35,2.7,3.1,3.6').split(',').map(Number), n = +(process.argv[6] || 14), crop = +(process.argv[7] || .62);
  const off = (process.argv[8] || '0,0').split(',').map(Number), boss = process.argv[9] === '1';
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  await ev('window.__SP='+(process.env.SP||0)+';\'ok\'');
  const urls = await page.evaluate(async ([L, zoom, times, n, off, boss]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.seraphlance=SM_XP[${L - 1}]` : 'delete meta.smast.seraphlance'};if(typeof SRL!=='undefined')SRL.dbg=[];'ok'`);
    __kk.ev("meta.arena='plains';state='menu';clearWorld();buildMap(+(window.__MAPSEED||31));MAP.fresh=true;'ok'");__vis.setup(n);
    __kk.ev(`__vis.L.forEach((e,i)=>{e.gem=0;e.scroll=0;if(+(window.__SP||0)){e.dist=7+i*(+window.__SP);e.off=(i%3-1)*.3;moveEnemy(e,0);}e.maxHp=e.hp=1e9+((i*7)%${n})*1e7;});${boss ? '__vis.L[Math.floor(__vis.L.length/2)].boss=true;' : ''}if(!window.__slW){window.__slW=castSeraphLance;castSeraphLance=function(){window.__slT=time;return window.__slW.apply(this,arguments);};}window.__slT=null;
      {const d=densest(__vis.L);__kk.camXZ(d.x+${off[0]},d.z+${off[1]},${zoom});scene.updateMatrixWorld(true);}'ok'`);
    __vis.step(.1); __vis.cast('seraphlance');
    for (let i = 0; i < 80 && __kk.ev('window.__slT') == null; i++) __vis.step(.033);
    let tp = 0; const out = [];
    for (const t of times) { __vis.step(t - tp); tp = t; __kk.ev('darkAmt=darkTarget;{const da=darkAmt*(typeof SPACE_K!=="undefined"?SPACE_K:1);hemi.intensity=.58*DAYC.hm*(1-.82*da);sun.intensity=.8*DAYC.sm*(1-.9*da);}'); out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, n, off, boss]);
  const sheet = await page.evaluate(async ([urls, times, L, crop]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * crop), ch = Math.round(H0 * crop), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2 - H0 * .06, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, crop]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("typeof SRL!=='undefined'&&SRL.dbg?JSON.stringify(SRL.dbg.map(d=>d.ev+'@'+(d.t-window.__slT).toFixed(2)).join(' ')):''");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
