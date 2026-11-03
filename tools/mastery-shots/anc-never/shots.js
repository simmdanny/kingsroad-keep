// Never-Never Land contact sheet: node shots.js <levels e.g. 0,5> <name> <zoom> <T1,T2,...> <focus: hero|dense|mid> [crop] [n foes]
// rows = levels, columns = domain times (NVR.S.T). Frames are stepped by hand.
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const Ls = (process.argv[2] || '0,5').split(',').map(Number), name = process.argv[3] || 'nv', zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '3.3,5.3,17.6').split(',').map(Number), focus = process.argv[6] || 'mid', crop = +(process.argv[7] || .7), nf = +(process.argv[8] || 14);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;meta.sfx=false;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const rows = [];
  for (const L of Ls) {
    const urls = await page.evaluate(async ([L, zoom, times, focus, nf]) => {
      __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.never=SM_XP[${L - 1}]` : 'delete meta.smast.never'};NVM.dbg=[];'ok'`);
      __vis.setup(nf);
      __kk.ev(`for(const e of __vis.L){e.gem=0;e.scroll=0;}{const d=densest(__vis.L),fc=${JSON.stringify(focus)};const c=fc==='hero'?heroU:fc==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:d;__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`);
      __vis.step(.1);
      __kk.ev(`state='playing';paused=false;heroU.anim={k:'never',t:0,d:ANIM_D.never};castScrollNow('never',heroU,heroStats(),sortTargets(heroU,__vis.L.slice()),heroStats().dmg,{src:heroU,el:'light',anc:true,spell:'never'});worldSlow=1;slowT=0;'ok'`);
      const out = [];
      for (const t of times) { let n = 0; while (__kk.ev('NVR.S?NVR.S.T:99') < t - 1e-6 && n++ < 3000) __vis.step(.033); out.push(__kk.snap()); }
      { let n = 0; while (__kk.ev('!!ANC.live.never') && n++ < 2000) __vis.step(.1); __vis.step(1); } return out;
    }, [L, zoom, times, focus, nf]);
    rows.push(urls);
  }
  const sheet = await page.evaluate(async ([rows, times, Ls, crop]) => {
    const R = await Promise.all(rows.map(u => Promise.all(u.map(x => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = x; })))));
    const W0 = R[0][0].naturalWidth, H0 = R[0][0].naturalHeight, cw = Math.round(W0 * crop), ch = Math.round(H0 * crop), cols = times.length;
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * R.length; const g = cv.getContext('2d');
    R.forEach((imgs, j) => imgs.forEach((im, i) => { const dx = i * cw, dy = j * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 110, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + Ls[j] + ' T' + times[i], dx + 5, dy + 14); }));
    return cv.toDataURL('image/jpeg', .86);
  }, [rows, times, Ls, crop]);
  fs.writeFileSync(__dirname + '/' + name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify((NVM.dbg||[]).map(d=>d.ev).join(' ').slice(0,300))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
