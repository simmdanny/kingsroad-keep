// Abyssal Genesis contact sheet: node shots.js <level> <name> <zoom> <t1,...> [focus hero|dense|view] [seed] [cols]
const { open } = require('../harness');
const fs = require('fs');
const DIR = __dirname + '/';
(async () => {
  const L = +(process.argv[2] || 0), name = process.argv[3] || 'abm' + L, zoom = +(process.argv[4] || 1);
  const times = (process.argv[5] || '1,3,5,8,12,14,20.3,20.8,22').split(','), focus = process.argv[6] || 'view', seed = +(process.argv[7] || 31), cols = +(process.argv[8] || 3);
  const crop = +(process.env.CROP || .62);
  const { browser, page, ev, errors } = await open({ width: 1280, height: 800 });
  await ev("meta.notesSeen=NOTES_V;meta.dev=true;saveMeta();document.querySelector('#notesPop')&&document.querySelector('#notesPop').classList.remove('on');'ok'");
  const urls = await page.evaluate(async ([L, zoom, times, focus, seed, crowd]) => {
    const r = __kk.ev(`(()=>{lsSet(KR,null);meta.arena='plains';meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(${seed});MAP.fresh=true;newGame(1);auto=0;lives=1e9;
      meta.owned.aldric=true;meta.equipped='aldric';const q=heroTileNear('aldric',innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;
      for(const e of enemies.slice())removeEnemy(e);enemies=[];state='playing';paused=false;speed=1;window.__fz=true;worldSlow=1;slowT=0;
      meta.smast=meta.smast||{};${L ? `meta.smast.abyss=SM_XP[${L - 1}]` : 'delete meta.smast.abyss'};
      const T=['soldier','knight','rider','peasant','monk'];window.__F=[];
      const cx=camTarget.x,cz=camTarget.z,inv=[];for(const R of ROUTES)for(let d=.5;d<R.len-.5;d+=.25){const p=posAt(d,R);if(Math.abs(p[0]-cx)<7.5&&Math.abs(p[1]-cz)<6.5)inv.push([R,d]);}
      const NF=${crowd};if(NF&&inv.length)for(let i=0;i<NF;i++){const[R,d]=inv[Math.floor(i*inv.length/NF)];spawnEnemy({type:T[i%5],v:0},60);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d+(i%2)*.08;e.off=(i%3-1)*.22;e.hp=e.maxHp=4e8;e.spd=.5;e.res={};moveEnemy(e,0);__F.push(e);}
      if(!NF)for(const R of ROUTES){for(let i=0;i<34;i++){spawnEnemy({type:T[i%5],v:0},60);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.min(R.len-.5,1+i*R.len/36+(i%2)*.1);e.off=(i%3-1)*.22;e.hp=e.maxHp=4e8;e.spd=.5;e.res={};moveEnemy(e,0);__F.push(e);}}
      const fc=${JSON.stringify(focus)};const d=densest(__F);const c=fc==='hero'?heroU:fc==='dense'?d:{x:camTarget.x,z:camTarget.z};__kk.camXZ(c.x,c.z,${zoom});scene.updateMatrixWorld(true);
      meta.spells.abyss=meta.spells.abyss||{lvl:1,hero:'aldric'};heroU.scd={};heroU.gcd=0;window.ABM_DBG=typeof ABM!=='undefined'?(ABM.dbg=[]):null;
      fireScroll(heroU,'abyss',heroStats(),sortTargets(heroU,__F.slice()));return enemies.length;})()`);
    const out = [];
    __kk.ev(`window.__st=s=>{const n=Math.round(s/.033);for(let i=0;i<n;i++){heroU.cd=1e9;update(.033);updFx(.033);if(heroU&&heroU.rig)animHero(heroU,.033,time);anim(.033,time);}for(const e of enemies)updBar(e);};for(let i=0;i<200&&!ANC.live.abyss;i++)__st(.033);'ok'`);
    __kk.ev(`window.__cam0={x:camTarget.x+CAM.px,z:camTarget.z+CAM.pz,zm:CAM.zoom};'ok'`);
    for (const t of times) { const [tt, fz] = String(t).split('@'); __kk.ev(`for(let i=0;i<2000&&ANC.live.abyss&&ANC.live.abyss.T<${+tt};i++)__st(.033);worldSlow=1;slowT=0;'ok'`);
      if (fz) { const [f, z] = fz.split(':'); __kk.ev(`(()=>{const f=${JSON.stringify(f)},zm=${+(z || 1)};let c=null;const D=typeof ABM!=='undefined'&&ABM.dbg||[];
        if(f==='hero')c=heroU;else if(f==='rise'){const r=D.filter(d=>d.ev==='rise').pop();c=r?{x:r.x,z:r.z}:null;}else if(f==='dense')c=densest(enemies.filter(e=>!e.dead));
        else if(f==='bite'){const r=D.filter(d=>d.ev==='bite').pop();c=r?r.e:null;}else if(f==='view')c={x:__cam0.x,z:__cam0.z};else if(f==='eld'){const r=D.find(d=>d.ev==='elder');c=r?{x:r.lev.pos.x,z:r.lev.pos.z}:null;}
        else if(f.startsWith('xz'))c={x:+f.split('_')[1],z:+f.split('_')[2]};
        if(c){__kk.camXZ(c.x,c.z,zm);scene.updateMatrixWorld(true);}})();'ok'`); }
      out.push(__kk.snap()); }
    return out;
  }, [L, zoom, times, focus, seed, +(process.env.CROWD || 0)]);
  const sheet = await page.evaluate(async ([urls, times, L, crop, cols]) => {
    const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
    const W0 = imgs[0].naturalWidth, H0 = imgs[0].naturalHeight, cw = Math.round(W0 * crop), ch = Math.round(H0 * crop), rows = Math.ceil(imgs.length / cols);
    const cv = document.createElement('canvas'); cv.width = cw * cols; cv.height = ch * rows; const g = cv.getContext('2d');
    imgs.forEach((im, i) => { const dx = (i % cols) * cw, dy = Math.floor(i / cols) * ch; g.drawImage(im, (W0 - cw) / 2, (H0 - ch) / 2, cw, ch, dx, dy, cw, ch); g.strokeStyle = '#000'; g.lineWidth = 2; g.strokeRect(dx, dy, cw, ch); g.fillStyle = '#000a'; g.fillRect(dx, dy, 110, 20); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText('M' + L + ' ' + times[i] + 's', dx + 5, dy + 14); });
    return cv.toDataURL('image/jpeg', .85);
  }, [urls, times, L, crop, cols]);
  fs.writeFileSync(DIR + name + '.jpg', Buffer.from(sheet.split(',')[1], 'base64'));
  const dbg = await ev("typeof ABM!=='undefined'&&ABM.dbg?JSON.stringify(ABM.dbg.filter(d=>d.ev!=='drown'&&d.ev!=='wave').map(d=>d.ev+(d.ev==='lunge'?d.i:'')+'@'+(d.t-ABM.dbg[0].t).toFixed(1)).join(' ')).slice(0,900):'-'");
  console.log(DIR + name + '.jpg', dbg, errors.filter(e => !/ERR_FAILED/.test(e)).join(' | ') || 'no errors');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
