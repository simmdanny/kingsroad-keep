// Constellation (v470) contact sheet: node shots.js <level> <name> <zoom> <t1,...> [n foes] [walk]
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'cs' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '.6,1.5,2.1,2.3,2.5,2.8,3.3,4.3,5.2').split(',').map(Number), N = +(process.argv[6] || 16), walk = +(process.argv[7] || 0);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, N, walk]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.constellation=SM_XP[${L - 1}]` : 'delete meta.smast.constellation'};CSM.dbg=[];'ok'`);
    __kk.ev("lsSet(KR,null);meta.arena='plains';meta.mapIntro=0;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);'ok'");__vis.setup(1); __kk.ev(`{for(const e of enemies.slice())removeEnemy(e);enemies=[];const L=[];for(let i=0;i<${N};i++){const big=i%5===2;spawnEnemy({type:big?'knight':i%3?'soldier':'peasant'},1);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=ROUTES[0];e.dist=6.2+i*.42;e.off=((i*7)%5/5-.4)*.5;e.maxHp=e.hp=1e9*(big?3:1)+i;e.spd=${walk}?.5:0;e.res={};moveEnemy(e,0);L.push(e);}__vis.L=L.sort((a,b)=>b.dist-a.dist);
      const d=densest(__vis.L);__kk.camXZ(d.x,d.z,${zoom});scene.updateMatrixWorld(true);}`); __vis.step(.1);
    __kk.ev("meta.spells.constellation=meta.spells.constellation||{lvl:1,hero:'aldric'};castScrollNow('constellation',heroU,heroStats(),__vis.L.slice(),100,{src:heroU,bane:0,el:'light',anc:true,spell:'constellation'});'ok'");
    let tp = 0; const out = [];
    for (const t of times) { __vis.step(t - tp); tp = t; out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, N, walk]);
  const sheet = await page.evaluate(async ([urls, times, L, zoom]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * .6), ch = Math.round(H0 * .66), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2 - H0 * .04, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 150, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' z' + zoom + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, zoom]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify((CSM.dbg||[]).filter(d=>d.ev!=='hold'&&d.ev!=='burn').map(d=>d.ev+'@'+(d.t-CSM.dbg[0].t).toFixed(2)).join(' '))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
