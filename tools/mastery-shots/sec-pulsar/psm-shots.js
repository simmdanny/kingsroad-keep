// Pulsar (v471) contact sheet: node psm-shots.js <level> <name> <zoom> <t1,...> [focus: ring|star|hero] [pc json] [cols] [extra js before cast]
// Foes walk-free on the road (a stream of 26, 0.45 tiles apart); the star is placed by the game at Mastery 0 the first time (printed), or at pc.
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'psm' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '1,3,6,9,11.5,13.5,14.7,15.3,15.7,16.2,17.5,20').split(',').map(Number);
  const focus = process.argv[6] || 'ring', pc0 = process.argv[7] ? JSON.parse(process.argv[7]) : null, cols = +(process.argv[8] || 4), pre = process.argv[9] || '';
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const res = await page.evaluate(async ([L, zoom, times, focus, pc0, pre]) => {
    __kk.ev("meta.arena='plains';meta.scrAuto=false;state='menu';clearWorld();buildMap(777);MAP.fresh=true;'ok'");__vis.setup(1);
    __kk.ev(`for(const e of enemies.slice())removeEnemy(e);enemies=[];__vis.L=[];for(let i=0;i<26;i++){spawnEnemy({type:i%5===0?'knight':i%3?'soldier':'peasant'},1);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=ROUTES[0];e.dist=3+i*.45;e.off=((i*37)%7/7-.5)*.5;e.maxHp=e.hp=1e9;e.spd=0;e.res={};moveEnemy(e,0);__vis.L.push(e);}'ok'`);
    let PC = pc0;
    if (!PC) { __kk.ev(`window.__pc=null;castPulsar(heroU,100,{src:heroU,bane:0,el:'light',anc:true,spell:'pulsar'},{log:d=>{if(d.ev==='open')window.__pc=d.PC;}});for(const f of fx.slice())f.life=0;updFx(.001);resetCine();FXL.intensity=0;darkTarget=0;flashA=0;'ok'`); PC = __kk.ev('window.__pc'); }
    window.__PC = PC;
    __kk.ev(`{const pc=window.__PC,f=${JSON.stringify(focus)};const c=f==='hero'?heroU:{x:pc.x,z:pc.z+(f==='star'?-1.6:0)};__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);}`);
    __vis.step(.1); if (pre) __kk.ev(pre);
    __kk.ev(`PSM.dbg=[];{const X=${L}?psmOpts({L:${L},a:SMA.pulsar}):{};X.pc=window.__PC;X.log=psmLog;castPulsar(heroU,100,{src:heroU,bane:0,el:'light',anc:true,spell:'pulsar'},X);}'ok'`);
    let tp = 0; const out = [];
    for (const t of times) { __vis.step(t - tp); tp = t; out.push(__kk.snap()); }
    return { out, PC };
  }, [L, zoom, times, focus, pc0, pre]);
  const sheet = await page.evaluate(async ([urls, times, L, cols]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * .6), ch = Math.round(H0 * .66), rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 110, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [res.out, times, L, cols]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify((()=>{const c={};PSM.dbg.forEach(d=>{c[d.ev]=(c[d.ev]||0)+1;});return c;})())");
  console.log(name + '.jpg', JSON.stringify(res.PC), dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
