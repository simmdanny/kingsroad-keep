// Records the scroll mastery previews (v428, Simon: "the previews needs to be recorded not happened in realtime when clicked").
// Each clip is the real game, stepped frame by frame in headless Chromium with a seeded random, on a small stage set up for that
// mastery (tools/previews/scenarios.js: a 1 HP foe for on-kill masteries, a ram for "the toughest foe", and so on), encoded to
// previews/<scroll>-<level>.mp4 (H.264, plays everywhere). previews/manifest.json lists every clip with its caption.
//
//   node tools/previews/record.js                 every published scroll (Common, Uncommon, Rare), levels 0-5
//   node tools/previews/record.js hexspark:4 cinders   only these (a scroll alone means all its levels)
//   --jobs 4      browsers in parallel (default 4)      --keep   keep the PNG frames in previews/_frames
//   --sheet       also write a contact sheet per clip into previews/_sheets (for checking them by eye)
//
// Needs: the dev server (python3 -m http.server 8771 in the repo root), Playwright with Chromium, ffmpeg.
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = process.env.PV_OUT || path.join(ROOT, 'previews');
const SC = require('./scenarios');
const W = 1080, H = 720, FPS = 30, PRE = .4, CAP = 9.5, TAIL = .45, MINLEN = 3;

function chromium() { try { return require('playwright').chromium; } catch (e) { return require(path.join(ROOT, 'node_modules', 'playwright')).chromium; } }
const THREE_JS = fs.readFileSync(path.join(ROOT, 'node_modules', 'three', 'build', 'three.min.js'));

/* the stage, evaluated in the game's scope (window.PVR) */
const STAGE = String.raw`window.PVR=(()=>{
const P={tags:[],T:0,cam:null};
const ease=x=>x<0?0:x>1?1:x;
P.tag=(e,txt,col)=>{const cv=document.createElement('canvas');cv.width=512;cv.height=64;const g=cv.getContext('2d');g.font='bold 34px Arial, Helvetica, sans-serif';
  const w=Math.min(506,g.measureText(txt).width+34),x0=(512-w)/2;g.fillStyle='rgba(10,8,6,.78)';g.beginPath();g.roundRect(x0,8,w,48,24);g.fill();g.lineWidth=4;g.strokeStyle=col;g.stroke();
  g.fillStyle=col;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,256,33);const tx=new THREE.CanvasTexture(cv);
  const m=new THREE.SpriteMaterial({map:tx,depthTest:false,depthWrite:false,transparent:true}),s=new THREE.Sprite(m);s.scale.set(1.48,.185,1);s.renderOrder=60;scene.add(s);
  P.tags.push({e,s,m,tx,dead:0});};
P.tagTick=dt=>{for(const t of P.tags){const e=t.e;if(e.dead||!e.g||!e.g.parent)t.dead+=dt;const k=1-ease(t.dead/.5);t.m.opacity=k;t.s.visible=k>0;
  if(!t.dead||t.px==null){t.px=e.x;t.pz=e.z;t.py=(e.y||0)+(e.fly?1.25:.95)*(e.d&&e.d.size||1);}t.s.position.set(t.px,t.py+.12+.08*ease(t.dead/.5),t.pz);}};
P.clearTags=()=>{for(const t of P.tags){scene.remove(t.s);t.m.dispose();t.tx.dispose();}P.tags=[];};
/* one frame, as the game's own frame() does it */
P.step=(dt,render)=>{P.T+=dt;update(dt*worldSlow);if(!window.__fz)updFx(dt);for(const e of enemies)updBar(e);anim(dt,P.T);
  try{bmAtmos(dt);sfAtmos(dt);}catch(e){}if(typeof AURA_RING!=='undefined'&&AURA_RING)AURA_RING.visible=false;P.tagTick(dt);P.camSet();
  if(!render)return'';
  if(typeof LENS!=='undefined'&&LENS.on)lensRender();else if(typeof DOM!=='undefined'&&DOM.post&&DOM.post.on)DOM.post.render();else if(typeof SDP!=='undefined'&&SDP.n>0)sdpRender();else renderer.render(scene,camera);
  if(typeof SGL!=='undefined'&&SGL.n>0)sglPass();
  return renderer.domElement.toDataURL('image/jpeg',.94);};
P.camSet=()=>{const c=P.cam;if(!c)return;camera.position.set(c.x,c.y+6.4*c.z,c.zz+4.6*c.z);camera.up.set(0,1,0);camera.lookAt(c.x,c.y,c.zz-.25*c.z);camera.updateMatrixWorld();};
/* spies: count calls of a game function by name (once per page), so a clip can prove its mastery's moment happened */
/* the damage the marked target takes (for tuning a low-HP target that must survive one hit and die to the next) */
P.hit=[];P.hx=[];{const h0=hurt;if(!h0.__pv){const w=function(e,amt){const R=window.PVR;if(R&&e){if(e.pvT)R.hit.push([+R.T.toFixed(2),Math.round(amt),Math.round(e.hp)]);if(e.smpv&&R.casts>0&&R.hx.length<4000)R.hx.push([+e.x.toFixed(2),+e.z.toFixed(2)]);}return h0.apply(this,arguments);};w.__pv=1;hurt=w;}}
P.ev={};P.spy=(fn,key)=>{key=key||fn;let f;try{f=eval(fn);}catch(e){return;}if(typeof f!=='function'||f.__pv)return;const w=function(){P.ev[key]=(P.ev[key]||0)+1;return f.apply(this,arguments);};w.__pv=1;eval(fn+'=w');};
/* the stage: a straight stretch of road running across the view, the hero standing in front of it, foes placed by hand and the scroll cast
   by the recorder (st: {seed, ri, d, c, r}: the map, the route, the spot on it facing the hero, the hero's tile) */
P.setup=(k,L,s)=>{P.clearTags();P.T=0;P.ev={};P.hit=[];P.hx=[];P.packAt=null;meta.owned=meta.owned||{};meta.owned[s.hero]=true;meta.equipped=s.hero;const st=s.st;
  meta.dev=true;meta.sfx=false;meta.scrAuto=false;meta.shake=false;meta.arena='plains';meta.smast={};if(L>0)meta.smast[k]=SM_XP[L-1];meta.spells={};meta.spells[k]={lvl:1,hero:null};
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;SMPV.on=false;
  state='menu';clearWorld();buildMap(st.seed);MAP.fresh=true;newGame(1);paused=true;auto=0;speed=1;lives=1e9;spawners.length=0;nextQ=null;
  try{if(typeof showOverlay==='function')showOverlay(null);}catch(e){}
  if(heroU)despawnHero();spawnHero(st.c,st.r);if(!heroU)throw new Error('no hero');
  heroU.cd=1e9;heroU.scd={};heroU.gcd=0;SM.cnt[k]=s.cnt||0;
  const Pw=tStats(heroU).spellP||tStats(heroU).dmg||100;P.Pw=Pw;P.k=k;P.L=L;P.s=s;P.foes=[];P.casts=0;
  const rt=ROUTES[st.ri],d0=st.d-(s.ahead==null?1.9:s.ahead);
  const add=(f,dd)=>{spawnEnemy({type:f.t||'soldier',v:f.v==null?0:f.v,elite:f.elite},20);const e=enemies[enemies.length-1];e.route=rt;e.dist=Math.max(.05,dd);e.off=f.off||0;
    e.spd=f.spd==null?s.spd:f.spd;e.maxHp=e.hp=f.hp==null?Pw*s.hp:f.hp==='1'?1:Pw*f.hp;e.armor=f.armor||0;e.res={};e.shield=0;e.smpv=1;e.gold=0;e.xp=0;e.regen=0;
    if(f.elite==='armored')e.armor=.35;if(f.fly!=null)e.fly=f.fly;moveEnemy(e,0);if(f.tag)P.tag(e,f.tag,f.tc||'#ffd070');e.pvT=!!f.target;P.foes.push(e);return e;};
  /* the pack is placed where it will be at the moment of the cast */
  for(const f of s.pack)add(f,d0-s.spd*s.castAt+(f.at||0));
  for(const f of (s.trail||[]))add(f,d0-s.spd*s.castAt+(f.at||0)).pvTrail=1;
  /* the camera holds still on the hero and where the pack will be when the scroll lands */
  const pc=posAt(Math.max(.05,d0+s.spd*(s.look==null?.6:s.look)),rt),fwz=s.fwz==null?1:s.fwz,fx=heroU.x*(1-s.fw)+pc[0]*s.fw,fz=heroU.z*(1-fwz)+pc[1]*fwz;
  P.cam={x:fx+(s.cx||0),zz:fz+(s.cz==null?.12:s.cz),y:gy(fx,fz),z:s.zoom};P.camSet();
  for(const sp of (s.spy||[]))P.spy(sp);if(s.pre)eval(s.pre);return{Pw,n:P.foes.length};};
P.targets=()=>{let l=enemies.filter(e=>!e.dead&&!e.fake);l.sort((a,b)=>(b.pvT?1e3:0)-(a.pvT?1e3:0)||b.dist-a.dist);if(P.s&&P.s.only&&l[0]&&l[0].pvT)l=[l[0]];return l;};
P.cast=(k2)=>{const k=k2||P.k,H=heroU;H.scd={};H.gcd=0;if(!meta.spells[k])meta.spells[k]={lvl:1,hero:null};const l=P.targets();P.lastT=l[0]&&l[0].pvT;if(!P.casts)P.packAt=P.foes.filter(e=>!e.dead&&!e.pvTrail).map(e=>[e.x,e.z]);fireScroll(H,k,tStats(H),l);P.casts++;};
P.fxN=()=>fx.length;
/* the camera framing the hero and every place a foe was hit (from a run without pictures, the same as the recorded one: the random is seeded) */
P.frame=(s)=>{const pts=P.hx.concat(P.packAt||[]);pts.push([heroU.x,heroU.z]);let x0=1e9,x1=-1e9;for(const [x] of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);}
  /* the road stays across the middle of the view (effects rise up the screen, labels sit over the foes); left to right it frames every hit */
  const rz=posAt(s.st.d,ROUTES[s.st.ri])[1],cz=rz+(s.cz==null?.15:s.cz),cx=(x0+x1)/2+(s.cx||0);let hd=0;for(const [,z] of pts)hd=Math.max(hd,Math.abs(z-cz));
  const hw=(x1-x0)/2+(s.margin==null?.85:s.margin);hd+=.6;
  const z=Math.max(s.zmin||.5,Math.min(s.zmax||.8,Math.max(hw/4.5,hd/3.6)*(s.zk||1)));return{x:cx,zz:cz,y:gy(cx,cz),z};};
P.useCam=c=>{P.cam=c;P.camSet();};
return P;})();'ok'`;

async function launch() {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  return chromium().launch({ proxy, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
}
async function openPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await ctx.route(/three(\.min)?\.js$/, r => r.fulfill({ contentType: 'application/javascript', body: THREE_JS }));
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  /* a seeded random from the very start (the game keeps its own copy of Math.random, const rnd) */
  await ctx.addInitScript(() => { let s = 1; Math.random = function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; window.__seed = n => { s = n | 0; }; });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto('http://localhost:8771/src/kingsroad-keep.html', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__kk && typeof THREE !== 'undefined', null, { timeout: 90000 });
  const ev = c => page.evaluate(c => __kk.ev(c), c);
  /* stop the game's own frame loop: the recorder steps it */
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await new Promise(r => setTimeout(r, 300));
  await ev("meta.notesSeen=NOTES_V;meta.sfx=false;meta.dev=true;saveMeta();document.querySelectorAll('.overlay').forEach(e=>e.classList.remove('on'));'ok'");
  await ev(STAGE);
  return { page, ev, errors, ctx };
}

/* one clip: returns {ok, frames, len, probe} */
async function recordClip(P, k, L, frameDir, seed, cam) {
  const s = SC.get(k, L), dry = !cam;
  await P.page.evaluate(n => window.__seed(n), seed);
  await P.ev(`PVR.setup(${JSON.stringify(k)},${L},${JSON.stringify(s)});'ok'`);
  if (cam && cam !== true) await P.ev(`PVR.useCam(${JSON.stringify(cam)});'ok'`);
  if (!dry) { fs.rmSync(frameDir, { recursive: true, force: true }); fs.mkdirSync(frameDir, { recursive: true }); }
  const dt = 1 / FPS; let t = 0, n = 0, base = null, quiet = 0, castT = s.castAt, casts = (s.casts || [s.castAt]).slice(), also = (s.also || []).slice(), last = Math.max(...casts, ...also.map(a => a.at));
  const t0 = Math.max(0, castT - PRE);
  while (true) {
    for (const c of casts) if (c != null && t >= c - 1e-6 && t < c + dt - 1e-6) await P.ev('PVR.cast()');
    for (const a of also) if (t >= a.at - 1e-6 && t < a.at + dt - 1e-6) await P.ev(`PVR.cast(${JSON.stringify(a.k)})`);
    if (base == null && t >= castT - dt) base = await P.ev('PVR.fxN()');
    const rec = !dry && t >= t0 - 1e-6;
    const url = await P.ev(`PVR.step(${dt},${rec})`);
    if (rec && url) fs.writeFileSync(path.join(frameDir, String(n++).padStart(4, '0') + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
    t += dt;
    if (t > last + .3) {
      const f = await P.ev('PVR.fxN()');
      quiet = f <= (base || 0) ? quiet + dt : 0;
      if (s.len ? t >= s.len : ((quiet >= TAIL && t - t0 >= (s.minLen || MINLEN)) || t >= CAP)) break;
    }
  }
  const probe = s.probe ? await P.ev(`!!(${s.probe})`) : true;
  const frame = dry && !s.fixedCam ? await P.ev(`JSON.stringify(PVR.frame(${JSON.stringify(s)}))`) : null;
  if (process.env.PV_DEBUG) console.log('   ', k, L, 'Pw', await P.ev('Math.round(PVR.Pw)'), 'events', await P.ev('JSON.stringify(PVR.ev)'), 'casts', await P.ev('PVR.casts'), 'target hits', await P.ev('JSON.stringify(PVR.hit.slice(0,14))'), 'dead', await P.ev('PVR.foes.filter(e=>e.dead).length'));
  return { frames: n, len: n / FPS, probe, cam: frame ? JSON.parse(frame) : true, dry };
}

function encode(frameDir, out) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frameDir, '%04d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', String(SC.crf || 26),
    '-pix_fmt', 'yuv420p', '-profile:v', 'main', '-movflags', '+faststart', '-an', out]);
}
function sheet(frameDir, n, out) {
  const pick = 9, step = Math.max(1, Math.floor(n / pick));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frameDir, '%04d.jpg'), '-vf', `select='not(mod(n\\,${step}))',scale=320:-1,tile=3x3`, '-frames:v', '1', '-q:v', '3', out]);
}

(async () => {
  const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i < 0 ? null : args.splice(i, 2)[1]; }, flag = k => { const i = args.indexOf(k); if (i < 0) return false; args.splice(i, 1); return true; };
  const jobsN = +(opt('--jobs') || 4), keep = flag('--keep'), sheets = flag('--sheet');
  fs.mkdirSync(OUT, { recursive: true });
  const all = SC.scrolls(); let list = [];
  if (!args.length) for (const k of all) for (let L = 0; L <= 5; L++) list.push([k, L]);
  else for (const a of args) { const [k, l] = a.split(':'); if (l == null) for (let L = 0; L <= 5; L++) list.push([k, L]); else list.push([k, +l]); }
  const manPath = path.join(OUT, 'manifest.json'), man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : { v: 1, w: W, h: H, fps: FPS, clips: {} };
  const queue = list.slice(), fails = []; let done = 0; const t00 = Date.now();
  async function worker(wi) {
    const browser = await launch(); let P = await openPage(browser);
    while (queue.length) {
      const [k, L] = queue.shift(), id = `${k}-${L}`, fd = path.join(OUT, '_frames', id), s = SC.get(k, L);
      let r = null, seed = s.seed || 1;
      try {
        /* a run without pictures picks the seed (the mastery's moment must happen) and the framing; then the clip is recorded with them */
        let d = null;
        for (let tries = 0; tries < (s.tries || 6); tries++, seed++) { d = await recordClip(P, k, L, fd, seed, null); if (d.probe) break; }
        if (!d.probe) seed--;
        r = await recordClip(P, k, L, fd, seed, d.cam);
        encode(fd, path.join(OUT, id + '.mp4'));
        if (sheets) { fs.mkdirSync(path.join(OUT, '_sheets'), { recursive: true }); sheet(fd, r.frames, path.join(OUT, '_sheets', id + '.jpg')); }
        const sz = fs.statSync(path.join(OUT, id + '.mp4')).size;
        man.clips[id] = { k, L, len: +r.len.toFixed(2), seed, bytes: sz, note: s.note || '' };
        if (!r.probe) fails.push(id + ' (its probe never came true: ' + s.probe + ')');
        if (!keep) fs.rmSync(fd, { recursive: true, force: true });
        console.log(`[${++done}/${list.length}] ${id} ${r.len.toFixed(1)}s ${(sz / 1024).toFixed(0)} KB seed ${seed}${r.probe ? '' : ' PROBE FAILED'}${P.errors.length ? ' errors: ' + P.errors.splice(0).slice(0, 2).join(' | ') : ''}`);
      } catch (e) { fails.push(id + ': ' + (e.message || e)); console.log(`[${++done}/${list.length}] ${id} FAILED ${e.message || e}`); try { await P.ctx.close(); } catch (_) { } P = await openPage(browser); }
    }
    await browser.close();
  }
  await Promise.all(Array.from({ length: Math.min(jobsN, list.length) }, (_, i) => worker(i)));
  man.v = 1; man.w = W; man.h = H; man.fps = FPS; man.made = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(manPath, JSON.stringify(man, null, 1));
  if (!keep) fs.rmSync(path.join(OUT, '_frames'), { recursive: true, force: true });
  const tot = Object.values(man.clips).reduce((a, c) => a + c.bytes, 0);
  console.log(`done in ${((Date.now() - t00) / 60000).toFixed(1)} min; ${Object.keys(man.clips).length} clips, ${(tot / 1048576).toFixed(2)} MB`);
  if (fails.length) { console.log('FAILED:\n  ' + fails.join('\n  ')); process.exitCode = 1; }
})().catch(e => { console.error(e); process.exit(1); });
