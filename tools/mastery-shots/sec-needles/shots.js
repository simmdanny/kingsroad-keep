// Blood Needles contact sheet: node shots.js <levels e.g. 0,1,5> <name> <zoom> <t1,...> <focus hero|mid|dense> <nFoes> [dt]
// one row per level, one column per moment (seconds after fireScroll; the Secret cast arrives 1 s later)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const Ls = (process.argv[2] || '0,5').split(',').map(Number), name = process.argv[3] || 'bn', zoom = +(process.argv[4] || .35);
  const times = (process.argv[5] || '1.6,2.4,3.4,4.3,4.8,5.2').split(',').map(Number), focus = process.argv[6] || 'mid', nF = +(process.argv[7] || 9), DT = +(process.argv[8] || 1 / 60), EVS = JSON.parse(process.argv[9] || '[]');
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const rows = [];
  for (const L of Ls) {
    const urls = await page.evaluate(async ([L, zoom, times, fcs, nF, DT, EVS]) => {
      __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.bloodneedles=SM_XP[${L - 1}]` : 'delete meta.smast.bloodneedles'};BNM.dbg=[];'ok'`);
      __vis.setup(nF);
      __kk.ev(`for(const e of __vis.L){e.gem=0;e.scroll=0;}window.__bnStep=sec=>{const n=Math.round(sec/${DT});for(let i=0;i<n;i++){update(${DT});updFx(${DT});if(heroU&&heroU.rig)animHero(heroU,${DT},time);anim(${DT},time);}for(const e of enemies)updBar(e);};
        {const d=densest(__vis.L),fc=${JSON.stringify(fcs)};const c=fc==='hero'?heroU:fc==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:d;__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}'ok'`);
      __bnStep(.1); __vis.cast('bloodneedles');
      let tp = 0; const out = [];
      const evs = EVS.slice(); const til = t => { while (evs.length && evs[0][0] <= t) { const [te, code] = evs.shift(); __bnStep(te - tp); tp = te; __kk.ev(code); } __bnStep(t - tp); tp = t; };
      for (const t of times) { til(t); out.push(__kk.snap()); }
      __bnStep(6); return out;
    }, [L, zoom, times, focus, nF, DT, EVS]);
    rows.push({ L, urls });
  }
  const sheet = await page.evaluate(async ([rows, times]) => {
    const all = await Promise.all(rows.map(r => Promise.all(r.urls.map(u => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.src = u; })))));
    const W0 = all[0][0].naturalWidth, H0 = all[0][0].naturalHeight, cw = Math.round(W0 * .5), ch = Math.round(H0 * .56), cols = times.length;
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows.length; const g = cv.getContext('2d');
    all.forEach((imgs, r) => imgs.forEach((im, i) => { const dx = i * cw, dy = r * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2 - H0 * .02, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 110, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + rows[r].L + ' ' + times[i] + 's', dx + 5, dy + 14); }));
    return cv.toDataURL('image/jpeg', .86);
  }, [rows, times]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  console.log(name + '.jpg', errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
