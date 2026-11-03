// Spatial Shatter contact sheet: node shots.js <level> <name> <zoom> <t1,...> <focus> [n foes] [cols]
// times are seconds after the cast itself starts (fireScroll's Mythic delay of 1s is stepped first)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'shm' + L, zoom = +(process.argv[4] || .6);
  const times = (process.argv[5] || '1,2,4,5.9,6.3,6.5,6.7,7,7.5').split(',').map(Number), nF = +(process.argv[7] || 16), cols = +(process.argv[8] || 3);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, fcs, nF]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.shatter=SM_XP[${L - 1}]` : 'delete meta.smast.shatter'};if(typeof SHM!=='undefined')SHM.dbg=[];'ok'`);
    __vis.setup(nF); __kk.ev(`{const R=ROUTES[0],e0=__vis.L[0];let bd=1e9,bdist=0;for(let d=0;d<R.len;d+=.1){e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-camTarget.x,e0.z-camTarget.z+1);if(q<bd){bd=q;bdist=d;}}__vis.L.forEach((e,i)=>{e.gem=0;e.scroll=0;e.dist=bdist-1.6+i*3.2/__vis.L.length;e.off=(i%3-1)*.26;moveEnemy(e,0);});}{const d=densest(__vis.L),fc=${JSON.stringify(fcs)};const c=fc==='hero'?heroU:fc==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:fc==='board'?camTarget:d;__kk.camXZ(c.x,c.z-(fc==='board'?0:1.2),${zoom});scene.updateMatrixWorld(true);}`); __kk.ev(`window.__rnd=()=>{anim(.001,performance.now()/1000);if(SDP.n>0)sdpRender();else renderer.render(scene,camera);if(SGL.n>0)sglPass();};window.__st=sec=>{const n=Math.round(sec/.033);for(let i=0;i<n;i++){update(.033);updFx(.033);if(heroU&&heroU.rig)animHero(heroU,.033,time);anim(.033,time);if(SHF.want)__rnd();}for(const e of enemies)updBar(e);};'ok'`);
    __kk.ev('__st(.1)'); __vis.cast('shatter'); __kk.ev('__st(1.0)');
    let tp = 0; const out = [];
    for (const t of times) { __kk.ev('__st('+(t - tp)+')'); tp = t; out.push(__kk.ev('__rnd();renderer.domElement.toDataURL("image/jpeg",.85)')); }
    __kk.ev('__st(5)'); return out;
  }, [L, zoom, times, process.argv[6] || 'dense', nF]);
  const sheet = await page.evaluate(async ([urls, times, L, cols]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * .5), ch = Math.round(H0 * .5), rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, 0, 0, W0, H0, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 110, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .86);
  }, [urls, times, L, cols]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("typeof SHM!=='undefined'&&SHM.dbg?JSON.stringify(SHM.dbg.map(d=>d.ev+'@'+(d.t-SHM.dbg[0].t).toFixed(2)).join(' ')):''");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
