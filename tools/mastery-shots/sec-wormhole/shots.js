// Wormhole contact sheet: node shots.js <level> <name> <zoom> <t1,...> [focus A|B|mid] [n] [spd] [map]
// A column of n foes (0.72 apart, walking spd tiles/s) on ROUTES[0] of board <map> (plains), the lead at 24; cast through castScrollNow.
// env: CROP (default .6), DX/DZ camera offsets, BOSS=1 (the 3rd foe a boss), ROAD2=1 (board 777 v5 two roads; some foes on road 2 near mouth A)
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'wh' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '.4,.9,2.4,2.8,3.2,5,8.7,8.9,9.2').split(',').map(Number), focus = process.argv[6] || 'A', n = +(process.argv[7] || 16), spd = +(process.argv[8] || 1), map = +(process.argv[9] || 31);
  const dx = +(process.env.DX || 0), dz = +(process.env.DZ || 0), boss = +(process.env.BOSS || 0), road2 = +(process.env.ROAD2 || 0);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;meta.spaceCalm=false;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  await page.evaluate(async () => __kk.ev(await (await fetch('/tests/visual-shots.js')).text()));
  const urls = await page.evaluate(async ([L, zoom, times, focus, n, spd, map, dx, dz, boss, road2]) => {
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.wormhole=SM_XP[${L - 1}]` : 'delete meta.smast.wormhole'};if(typeof WHM!=='undefined')WHM.dbg=[];'ok'`);
    __kk.ev(`lsSet(KR,null);meta.arena='plains';state='menu';clearWorld();{const g0=MAP_GV;if(${road2})MAP_GV=5;try{buildMap(${road2?777:map});}finally{MAP_GV=g0;}}MAP.fresh=true;newGame(1);'ok'`); __vis.setup(n);
    __kk.ev(`{const R=ROUTES[${road2}?1:0],d0=${road2}?37:24;__vis.L.forEach((e,i)=>{e.gem=0;e.scroll=0;e.spd=${spd};e.route=R;e.dist=d0-i*.72;e.off=(i%3-1)*.22;if(${boss}&&i===2){e.boss=true;e.g.scale.multiplyScalar(1.6);}moveEnemy(e,0);});}'ok'`);
    /* (ROAD2: the column walks road 2 of board 777 (version 5), where it has joined road 1; foes of road 1 walk among them, into the first mouth) */
    if (road2) __kk.ev(`{for(let i=0;i<5;i++){spawnEnemy({type:'knight',v:0},1);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=ROUTES[0];e.dist=37+2.6-13-4.2+i*.75;e.off=-.32;e.maxHp=e.hp=1e9;e.spd=${spd};e.res={};moveEnemy(e,0);__vis.L.push(e);}}'ok'`);
    __kk.ev("heroU.ko=0;state='playing';paused=false;speed=1;worldSlow=1;'ok'"); __vis.step(.05);
    __kk.ev(`{const lead=__vis.L[0],R=lead.route,dIn=Math.min(R.len-.6,lead.dist+lead.spd*1.2+1.4),dOut=Math.max(.4,dIn-13),pA=posAt(dIn,R),pB=posAt(dOut,R);
      const c='${focus}'==='B'?pB:'${focus}'==='mid'?[(pA[0]+pB[0])/2,(pA[1]+pB[1])/2]:pA;__kk.camXZ(c[0]+${dx},c[1]+${dz},${zoom});scene.updateMatrixWorld(true);
      castScrollNow('wormhole',heroU,heroStats(),enemies.filter(e=>!e.dead),100*smP('wormhole'),{src:heroU,bane:0,el:'dark',anc:false,spell:'wormhole'});}'ok'`);
    const snap = () => __kk.ev("anim(.001,performance.now()/1000);renderer.render(scene,camera);renderer.domElement.toDataURL('image/jpeg',.85)");
    let tp = 0; const out = [];
    for (const t of times) { __vis.step(t - tp); tp = t; out.push(snap()); }
    return out;
  }, [L, zoom, times, focus, n, spd, map, dx, dz, boss, road2]);
  const sheet = await page.evaluate(async ([urls, times, L, CROP]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, CR = CROP, cw = Math.round(W0 * CR), ch = Math.round(H0 * Math.min(1, CR * 1.1)), cols = 3, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, Math.max(0, (H0 - ch) / 2 - H0 * .04), cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 120, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, +(process.env.CROP || .6)]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("typeof WHM!=='undefined'&&WHM.dbg?JSON.stringify(WHM.dbg.reduce((a,d)=>{a[d.ev]=(a[d.ev]||0)+1;return a;},{})):'-'");
  console.log(name + '.jpg', dbg, await ev("String(window.__r2||'')"), errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
