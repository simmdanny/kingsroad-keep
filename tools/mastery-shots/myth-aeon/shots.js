// The Aeon Dial contact sheet: node shots.js <level> <name> <zoom> <t1,...> [focus] [cols]
// times are seconds after fireScroll (a Mythic arrives 1s later; dial T = t-1). focus: dense|hero|mid|x,z
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'aeon' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '3,6,10,16,17.4,17.8,18.4,19,19.6').split(',').map(Number), fcs = process.argv[6] || 'dense', cols = +(process.argv[7] || 3);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, fcs, process_env_CR]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.aeon=SM_XP[${L - 1}]` : 'delete meta.smast.aeon'};if(typeof AEM!=='undefined')AEM.dbg=[];'ok'`);
    __vis.setup(9);
    /* a crowd spread down the road, a few towers beside it */
    __kk.ev(`{const R=ROUTES[0];for(let i=0;i<22;i++){spawnEnemy({type:['soldier','knight','rider','peasant','monk'][i%5],v:0},1);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=2+i*(R.len-4)/22;e.off=(i%3-1)*.24;e.maxHp=e.hp=1e9;e.spd=0;e.res={};moveEnemy(e,0);__vis.L.push(e);}
      for(const e of __vis.L){e.gem=0;e.scroll=0;}
      let n=0;for(let d=3;d<R.len-2&&n<6;d+=R.len/7){const p=posAt(d,R);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),dd=(q.x-p[0])**2+(q.z-p[1])**2;if(dd<bd&&dd>.8){bd=dd;best=[c,r];}}if(best){gold+=buildCost('archer');placeTower(['archer','mage','cannon'][n%3]||'archer',best[0],best[1]);n++;}}}`);
    __kk.ev(`{const d=densest(__vis.L),fc=${JSON.stringify(fcs)};let c=fc==='hero'?heroU:fc==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:fc==='dense'?d:{x:+fc.split(',')[0],z:+fc.split(',')[1]};if(${zoom}>=.99)c={x:camTarget.x,z:camTarget.z};__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`);
    __kk.ev('paused=false;speed=1;window.__fz=true;lives=1e9;0'); __vis.step(.1); __vis.cast('aeon');
    let tp = 0; const out = [];
    if (process_env_CR) { __vis.step(16.9); tp = 16.9; __kk.ev('for(const e of __vis.L)e.hp=e.maxHp*.22;0'); }
    for (const t of times) { __vis.step(t - tp); tp = t; out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, fcs, !!process.env.CR]);
  const sheet = await page.evaluate(async ([urls, times, L, cols]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * .5), ch = Math.round(H0 * .5), rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, 0, 0, W0, H0, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' T=' + (times[i] - 1).toFixed(1), dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, cols]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("typeof AEM!=='undefined'&&AEM.dbg?JSON.stringify(AEM.dbg.map(d=>d.ev).reduce((a,k)=>(a[k]=(a[k]||0)+1,a),{})):'-'");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await ev('window.__fz=false;0');await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
