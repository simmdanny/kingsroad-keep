// Primordial Tempest contact sheet: node tp-shots.js <L> <name> <zoom> <t1,...> [focus hero|boss|mid] [cols] [crop]
const { open } = require('../harness');
const fs = require('fs');
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'tp' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '1,2.6,4,8,12,15.9,16.95,17.6').split(',').map(Number), focus = process.argv[6] || 'hero', cols = +(process.argv[7] || 4), crop = +(process.argv[8] || .8);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  const HIDE=(process.env.HIDE||'').split(',').filter(Boolean);
  const res = await page.evaluate(async ([L, zoom, times, focus, HIDE]) => {
    __kk.ev(`window.__T={
 setup(a,seed){lsSet(KR,null);meta.mapIntro=0;meta.arena=a||'plains';state='menu';clearWorld();buildMap(seed||777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0],mid=R.len*.5,p=posAt(mid,R);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),d=(q.x-p[0])**2+(q.z-p[1])**2;if(d>1.2&&d<bd){bd=d;best=[c,r];}}
  spawnHero(best[0],best[1]);for(const e of enemies.slice())removeEnemy(e);enemies=[];
  const T=['soldier','knight','rider','peasant','soldier','knight'];for(let i=0;i<22;i++){spawnEnemy({type:T[i%6],v:0},30);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=mid-9+i*.85;e.off=(i%3-1)*.22;e.hp=e.maxHp=1e7;e.spd=.35;moveEnemy(e,0);}
  if(ROUTES[1])for(let i=0;i<6;i++){spawnEnemy({type:T[i%6],v:0},30);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=ROUTES[1];e.dist=ROUTES[1].len*.45+i*1.1;e.hp=e.maxHp=1e7;e.spd=.35;moveEnemy(e,0);}
  {spawnEnemy({type:'knight',v:0,elite:['shielded']},30);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=mid+2.2;e.hp=e.maxHp=1e7;e.shield=5e6;e.maxShield=5e6;e.spd=.35;moveEnemy(e,0);}
  {spawnEnemy({type:'ogre',v:0},30);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=mid-3.1;e.boss=true;e.hp=e.maxHp=5e7;e.spd=.3;moveEnemy(e,0);this.boss=e;}
  state='playing';paused=false;speed=0;window.__fz=true;heroU.cd=1e9;return heroU;},
 step(sec){const n=Math.round(sec/.0167);for(let i=0;i<n;i++){if(heroU)heroU.cd=1e9;update(.0167*worldSlow);updFx(.0167);anim(.0167,performance.now()/1000);}for(const e of enemies)if(typeof updBar==='function')updBar(e);},
 frame(){anim(.001,performance.now()/1000);if(typeof SDP!=='undefined'&&SDP.n>0)sdpRender();else renderer.render(scene,camera);return renderer.domElement.toDataURL('image/jpeg',.88);},
 cast(k){const t=heroU;meta.spells[k]=meta.spells[k]||{lvl:1,own:1};t.scd={};t.gcd=0;const s=heroStats(),L=sortTargets(t,inRange(t,s));fireScroll(t,k,s,L.length?L:enemies.filter(e=>!e.dead));}};'ok'`);
    window.__HIDE=HIDE;
    __kk.ev(`meta.smast=meta.smast||{};${L ? `meta.smast.tempest=SM_XP[${L - 1}]` : 'delete meta.smast.tempest'};'ok'`);
    const r = __kk.ev(`(()=>{const zoom=${zoom},times=${JSON.stringify(times)},focus=${JSON.stringify(focus)};__T.setup();
    const foc = () => { const f = focus === 'boss' ? __T.boss : heroU; const dz = focus === 'mid' ? -1.5 : .4; CAM.px = f.x - camTarget.x; CAM.pz = f.z - camTarget.z + dz; CAM.zoom = zoom; applyCam(); };
    foc(); __T.step(.1); __T.cast('tempest');
    let w = 0; while (!ANC.live.tempest && w < 200) { __T.step(.05); w++; }
    const T0 = () => ANC.live.tempest ? ANC.live.tempest.T : 99;
    const urls = [], info = [];
    for (const t of times) { while (ANC.live.tempest && T0() < t) __T.step(.0167); if (!ANC.live.tempest && t > 19) __T.step(.5); worldSlow = 1; if(window.__HIDE&&TPE.on)for(const k of window.__HIDE)if(TPE.on[k])TPE.on[k].visible=false; urls.push(__T.frame()); info.push({ t, fx: fx.length, lift: (heroU.g.position.y - gy(heroU.x, heroU.z)).toFixed(2), flash: (flashA * SPACE_K).toFixed(2) }); }
    window.__TR={urls,info,wait:w};return 1;})()`);
    const { urls, info, w } = window.__TR;
    return { urls, info, wait: window.__TR.wait };
  }, [L, zoom, times, focus, HIDE]);
  const sheet = await page.evaluate(async ([urls, times, L, cols, crop, info]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * crop), ch = Math.round(H0 * crop), rows = Math.ceil(imgs.length / cols), s = .5;
    const cv = document.createElement('canvas'); cv.width = cw * cols * s; cv.height = ch * rows * s; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw * s, dy = Math.floor(i / cols) * ch * s; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, dy, cw * s, ch * s);
      const fa = +info[i].flash; if (fa > .01) { g.globalAlpha = Math.min(1, fa); g.fillStyle = '#e8d8ff'; g.fillRect(dx, dy, cw * s, ch * s); g.globalAlpha = 1; }
      g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw * s, ch * s); g.fillStyle = '#000a'; g.fillRect(dx, dy, 130, 18); g.fillStyle = '#fff'; g.font = '12px sans-serif'; g.fillText('M' + L + ' t=' + times[i] + ' y' + info[i].lift, dx + 4, dy + 13); });
    return cv.toDataURL('image/jpeg', .86);
  }, [res.urls, times, L, cols, crop, res.info]);
  fs.writeFileSync(name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  if (process.env.FULL) res.urls.forEach((u, i) => fs.writeFileSync(name + '-' + i + '.jpg', Buffer.from(u.split(',')[1], 'base64')));
  console.log(name + '.jpg', JSON.stringify(res.info), 'wait', res.wait, errors.filter(e => !/ERR_FAILED|Failed to load resource/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
