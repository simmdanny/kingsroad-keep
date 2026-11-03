// Moonfall (v468) contact sheet: node shots.js <level> <name> <zoom> <t1,...> [spd] [n] [map]
// times are seconds after the cast (castScrollNow, so the moon lands at 2.6 s). env: CROP (default .6), DX/DZ camera offsets, SET=fire (equip the fire set)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 5), name = process.argv[3] || 'mf' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '1.4,2.3,2.66,2.85,3.1,3.5,4.2,6,8.5').split(',').map(Number), spd = +(process.argv[6] || .3), n = +(process.argv[7] || 24), map = +(process.argv[8] || 777);
  const dx = +(process.env.DX || 0), dz = +(process.env.DZ || 0);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;meta.spaceCalm=false;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, spd, n, map, dx, dz]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.moonfall=SM_XP[${L - 1}]` : 'delete meta.smast.moonfall'};MFM.dbg=[];'ok'`);
    __kk.ev(`lsSet(KR,null);meta.arena='plains';state='menu';clearWorld();buildMap(${map});MAP.fresh=true;newGame(1);'ok'`); __vis.setup(n);
    __kk.ev(`__vis.L.forEach((e,i)=>{e.gem=0;e.scroll=0;e.spd=${spd};e.dist=5+i*.45;e.off=(i%3-1)*.25;moveEnemy(e,0);});{const d=nsLead(densest(__vis.L),2.6);__kk.camXZ(d.x+${dx},d.z+${dz},${zoom});scene.updateMatrixWorld(true);}`);
    __kk.ev("state='playing';paused=false;speed=1;worldSlow=1;'ok'"); __vis.step(.1);
    __kk.ev("{const b=new Set(scene.children);castScrollNow('moonfall',heroU,heroStats(),enemies.filter(e=>!e.dead),100*smP('moonfall'),{src:heroU,bane:0,el:'fire',anc:false,spell:'moonfall'});const d=scene.children.find(o=>!b.has(o)&&o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry');if(d){__kk.camXZ(d.position.x+"+dx+",d.position.z+"+dz+","+zoom+");scene.updateMatrixWorld(true);}}'ok'");
    const snap = () => __kk.ev("anim(.001,performance.now()/1000);if(typeof SDP!=='undefined'&&SDP.n>0)sdpRender();else renderer.render(scene,camera);renderer.domElement.toDataURL('image/jpeg',.85)");
    let tp = 0; const out = [];
    for (const t of times) { __vis.step(t - tp); tp = t; out.push(snap()); }
    return out;
  }, [L, zoom, times, spd, n, map, dx, dz]);
  const sheet = await page.evaluate(async ([urls, times, L, CROP]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, CR = CROP, cw = Math.round(W0 * CR), ch = Math.round(H0 * Math.min(1, CR * 1.1)), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, Math.max(0, (H0 - ch) / 2 - H0 * .04), cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, +(process.env.CROP || .6)]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify(MFM.dbg.reduce((a,d)=>{a[d.ev]=(a[d.ev]||0)+1;return a;},{}))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
