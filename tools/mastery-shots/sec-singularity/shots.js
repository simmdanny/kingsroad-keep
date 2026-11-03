// Singularity (v472) contact sheet: node shots.js <level> <name> <zoom> <t1,...> [focus none|pack|hero] 
// Times are seconds after fireScroll (a Secret cast arrives 1s later: the hole's own time = t-1). Frames are page screenshots (the hole is
// drawn by sglPass in the page's own render). NF env: foes (default 30); every third is light and dies during the pin (spread over it), the
// rest are tough. CROP env: the share of the frame kept (default .62). DX/DZ env: camera offset. COLS env (3).
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const LV = String(process.argv[2] || '0').split(',').map(Number), name = process.argv[3] || 'sgm', zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '3.5,5.3,7,9.5,11.6,12.25,12.55,12.8,13.4').split(','), focus = process.argv[6] || 'none';
  const W = 1280, H = 800;
  const { browser, page, ev, errors } = await open({ width: W, height: H });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;meta.spaceCalm=false;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  const shots = [], labels = [];
  for (const L of LV) {
  await ev(`(function(){meta.smast=meta.smast||{};${L ? `meta.smast.singularity=SM_XP[${L - 1}]` : 'delete meta.smast.singularity'};SGM.dbg=[];
    lsSet(KR,null);meta.arena='plains';meta.scrAuto=false;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
    for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;
    if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
    state='playing';paused=false;window.__fz=true;meta.spells.singularity=meta.spells.singularity||{lvl:1,hero:null};
    const P=scrollPow(heroU,'singularity',heroStats(),1);
    const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;let bd=1e9,bdist=0;for(let d=0;d<R.len;d+=.1){e0.dist=d;e0.route=R;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=[];
    const F=[],NF=${+process.env.NF || 30};let li=0;
    for(let i=0;i<NF;i++){const d=bdist+${+process.env.OFFD || 0}-NF*.25+i*.5;if(d<.3||d>R.len-.3)continue;spawnEnemy({type:i%5===0?'knight':i%3?'soldier':'peasant',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d;e.off=(i%3-1)*.22;
      if(i%3===0){const tau=.5+(li++)*.6;e.maxHp=e.hp=P*3*tau/(1-.05*tau);}else{e.maxHp=e.hp=1e7;}e.res={};e.armor=0;e.spd=0;moveEnemy(e,0);F.push(e);}
    window.__F=F;
    const d=densest(F),f=${JSON.stringify(focus)};if(f!=='none'){const c=f==='pack'?d:heroU;__kk.camXZ(c.x+${+process.env.DX || 0},c.z+${+process.env.DZ || 0},${zoom});}else{CAM.px=0;CAM.pz=0;CAM.zoom=${zoom};applyCam();}scene.updateMatrixWorld(true);
    return 'ok';})()`);
  const step = s => ev(`(function(){const n=Math.round(${s}/.033);paused=false;for(let i=0;i<n;i++){heroU.cd=1e9;update(.033);updFx(.033);anim(.033,time);}for(const e of enemies)updBar(e);paused=true;return 'ok';})()`);
  await step(.1);
  await ev("heroU.scd={};heroU.gcd=0;fireScroll(heroU,'singularity',heroStats(),sortTargets(heroU,__F.filter(e=>!e.dead)).length?sortTargets(heroU,__F.filter(e=>!e.dead)):__F.slice());'ok'");
  let tp = 0;
  for (const ts of times) {
    const t = +ts; await step(t - tp); tp = t; labels.push('M' + L + ' ' + (t - 1).toFixed(2) + 's');
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    shots.push((await page.screenshot({ type: 'jpeg', quality: 85 })).toString('base64'));
  }
  }
  const CR=+(process.env.CROP || .62),COLS=+(process.env.COLS||(LV.length>1?times.length:3));
  const sheet = await page.evaluate(async ([shots, labels, L, CR, COLS]) => {
    const imgs = await Promise.all(shots.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = 'data:image/jpeg;base64,' + u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * CR), ch = Math.round(H0 * Math.min(1, CR * 1.05)), cols = COLS, rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, Math.max(0, (H0 - ch) / 2 - H0*.08), cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 130, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText(labels[i], dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [shots, labels, 0, CR, COLS]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("JSON.stringify(SGM.dbg.reduce((a,d)=>{a[d.ev]=(a[d.ev]||0)+1;return a;},{}))");
  console.log(name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
