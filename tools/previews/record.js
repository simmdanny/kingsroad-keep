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
const path = require('path'), path_ = path, fs = require('fs'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = process.env.PV_OUT || path.join(ROOT, 'previews');
const SC = require('./scenarios');
const W = 480, H = 320, FPS = 30, PRE = .4, CAP = 9.5, TAIL = .45, MINLEN = 3;

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
P.step=(dt,render)=>{P.T+=dt;if(window.__rcLog)window.__rcLog.push(window.__rc);if(window.__stkOn!=null){if(P.si>=(window.__stkFrom||0)&&P.si<=(window.__stkFrom||0)+2)window.__stk=window.__stk||{};else if(window.__stk){window.__stkKeep=window.__stk;window.__stk=null;}}for(const f of (P.enter||[]))if(!f.done&&P.T>=f.time){f.done=true;P.add(f,P.d0+(f.at||0)).pvTrail=1;}update(dt*worldSlow);if(!window.__fz)updFx(dt);for(const e of enemies)updBar(e);anim(dt,P.T);
  if(P.s&&P.s.tick&&P.casts>0)try{eval(P.s.tick);}catch(e){}
  /* stamp the module's new events with the recorder's own clock (the game's runs slower in its slow-motion moments) */
  if(P.s&&P.s.dbg)try{const a=eval(P.s.dbg+'.dbg');if(a){for(let i=P.dbgN;i<a.length;i++)a[i].__T=P.T;P.dbgN=a.length;}}catch(e){}
  if(P.trk&&P.casts>0)P.trkFrame();if(P.path){const c=P.path[Math.min(P.si,P.path.length-1)];if(c)P.cam=c;}P.si++;
  try{bmAtmos(dt);sfAtmos(dt);}catch(e){}if(typeof AURA_RING!=='undefined'&&AURA_RING)AURA_RING.visible=false;P.tagTick(dt);P.camSet();
  if(!render)return'';
  if(typeof LENS!=='undefined'&&LENS.on)lensRender();else if(typeof DOM!=='undefined'&&DOM.post&&DOM.post.on)DOM.post.render();else if(typeof SDP!=='undefined'&&SDP.n>0)sdpRender();else renderer.render(scene,camera);
  if(typeof SGL!=='undefined'&&SGL.n>0)sglPass();
  return renderer.domElement.toDataURL('image/jpeg',.94);};
P.camSet=()=>{const c=P.cam;if(!c)return;camera.position.set(c.x,c.y+6.4*c.z,c.zz+4.6*c.z);camera.up.set(0,1,0);camera.lookAt(c.x,c.y,c.zz-.25*c.z);camera.updateMatrixWorld();};
/* spies: count calls of a game function by name (once per page), so a clip can prove its mastery's moment happened */
/* the damage the marked target takes (for tuning a low-HP target that must survive one hit and die to the next) */
P.hit=[];P.hx=[];{const h0=hurt;if(!h0.__pv){const w=function(e,amt,kind,o){const R=window.PVR;if(R&&e){if(e.pvT)R.hit.push([+R.T.toFixed(2),Math.round(amt),Math.round(e.hp)]);if(e.smpv&&R.casts>0&&R.hx.length<4000){const h=Math.max(0,Math.min(3.5,(e.y||0)-gy(e.x,e.z)));R.hx.push([+e.x.toFixed(2),+(e.z-.76*h).toFixed(2),+R.T.toFixed(3),o&&o.dot?1:0]);}}return h0.apply(this,arguments);};w.__pv=1;hurt=w;}}
P.ev={};P.spy=(fn,key)=>{key=key||fn;let f;try{f=eval(fn);}catch(e){return;}if(typeof f!=='function'||f.__pv)return;const w=function(){P.ev[key]=(P.ev[key]||0)+1;return f.apply(this,arguments);};w.__pv=1;eval(fn+'=w');};
/* the stage: a straight stretch of road running across the view, the hero standing in front of it, foes placed by hand and the scroll cast
   by the recorder (st: {seed, ri, d, c, r}: the map, the route, the spot on it facing the hero, the hero's tile) */
P.setup=(k,L,s)=>{P.clearTags();P.T=0;P.ev={};P.hit=[];P.hx=[];P.packAt=null;P.trk=null;P.path=null;P.si=0;P.fx0=null;meta.owned=meta.owned||{};meta.owned[s.hero]=true;meta.equipped=s.hero;const st=s.st;
  meta.dev=true;meta.sfx=false;meta.scrAuto=false;meta.shake=false;meta.arena='plains';meta.smast={};if(L>0)meta.smast[k]=SM_XP[L-1];meta.spells={};meta.spells[k]={lvl:1,hero:null};
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;SMPV.on=false;
  state='menu';clearWorld();buildMap(st.seed);MAP.fresh=true;newGame(1);paused=true;auto=0;speed=1;lives=1e9;spawners.length=0;nextQ=null;
  try{if(typeof showOverlay==='function')showOverlay(null);}catch(e){}
  if(heroU)despawnHero();spawnHero(st.c,st.r);if(!heroU)throw new Error('no hero');
  heroU.cd=1e9;heroU.scd={};heroU.gcd=0;SM.cnt[k]=s.cnt||0;
  const Pw=tStats(heroU).spellP||tStats(heroU).dmg||100;P.Pw=Pw;P.k=k;P.L=L;P.s=s;P.foes=[];P.casts=0;
  const rt=ROUTES[st.ri],d0=st.d-(s.ahead==null?1.9:s.ahead);
  const add=(f,dd)=>{spawnEnemy({type:f.t||'soldier',v:f.v==null?0:f.v,elite:f.elite},20);const e=enemies[enemies.length-1];e.route=rt;e.dist=Math.max(.05,dd);e.off=f.off||0;
    e.spd=f.spd==null?s.spd:f.spd;e.maxHp=e.hp=f.hp==null?Pw*s.hp:f.hp==='1'?1:Pw*f.hp;if(f.frac)e.hp=e.maxHp*f.frac;e.armor=f.armor||0;e.res={};e.shield=0;e.smpv=1;e.gold=0;e.xp=0;e.regen=0;
    if(f.elite==='armored')e.armor=.35;if(f.fly!=null)e.fly=f.fly;moveEnemy(e,0);if(f.tag)P.tag(e,f.tag,f.tc||'#ffd070');e.pvT=!!f.target;P.foes.push(e);return e;};
  /* the pack is placed where it will be at the moment of the cast */
  for(const f of s.pack)add(f,d0-s.spd*s.castAt+(f.at||0));
  for(const f of (s.trail||[]))add(f,d0-s.spd*s.castAt+(f.at||0)).pvTrail=1;
  /* towers beside the road (for masteries that work with buildings): the free tile nearest a spot on the road (at: tiles from the pack's
     middle at the cast, side: which side, +1 or -1) */
  for(const T of (s.towers||[])){const q=posAt(Math.max(.05,d0+(T.at||0)),rt),a=q[2],sd=(T.side||1)*1.3,px=q[0]+Math.cos(a)*sd,pz=q[1]-Math.sin(a)*sd;let best=null,bd=1e9;
    for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0||(c===s.st.c&&r===s.st.r))continue;const p=tw(c,r),d=(p.x-px)**2+(p.z-pz)**2;if(d<bd){bd=d;best=[c,r];}}
    if(best){const tt=placeTower(T.t||'archer',best[0],best[1],T.data);tt.cd=T.cd==null?.3:T.cd;}}
  /* the camera holds still on the hero and where the pack will be when the scroll lands */
  const pc=posAt(Math.max(.05,d0+s.spd*(s.look==null?.6:s.look)),rt),fwz=s.fwz==null?1:s.fwz,fx=heroU.x*(1-s.fw)+pc[0]*s.fw,fz=heroU.z*(1-fwz)+pc[1]*fwz;
  P.cam={x:fx+(s.cx||0),zz:fz+(s.cz==null?.12:s.cz),y:gy(fx,fz),z:s.zoom};P.camSet();
  P.add=add;P.d0=d0-s.spd*s.castAt;P.enter=(s.enter||[]).map(f=>Object.assign({done:false},f));P.towersAt=towers.map(t=>[t.x,t.z]);
  P.tm0=time;P.dbgN=0;if(s.dbg)try{eval(s.dbg+'.dbg=[]');}catch(e){}
  for(const sp of (s.spy||[]))P.spy(sp);if(s.pre)eval(s.pre);return{Pw,n:P.foes.length};};
/* what the clip's mastery logged (its module's dbg events, and the spies), for the recorder's line and the manifest */
P.evSum=()=>{const c={};try{if(P.s.dbg)for(const d of (eval(P.s.dbg+'.dbg')||[]))c[d.ev]=(c[d.ev]||0)+1;}catch(e){}for(const k in P.ev)c[k]=P.ev[k];return c;};
/* when each of them first happened (s from the start of the stage, the recorder's clock), for placing a clip's window */
P.evAt=()=>{const c={};try{if(P.s.dbg)for(const d of (eval(P.s.dbg+'.dbg')||[])){if(d.__T!=null&&c[d.ev]==null)c[d.ev]=+d.__T.toFixed(2);}}catch(e){}return c;};
P.targets=()=>{let l=enemies.filter(e=>!e.dead&&!e.fake);l.sort((a,b)=>(b.pvT?1e3:0)-(a.pvT?1e3:0)||b.dist-a.dist);if(P.s&&P.s.only&&l[0]&&l[0].pvT)l=[l[0]];return l;};
P.cast=(k2)=>{const k=k2||P.k,H=heroU;H.scd={};H.gcd=0;if(!meta.spells[k])meta.spells[k]={lvl:1,hero:null};const l=P.targets();P.lastT=l[0]&&l[0].pvT;if(!P.casts){P.packAt=P.foes.filter(e=>!e.dead&&!e.pvTrail).map(e=>[e.x,e.z]);P.fx0=new Set(fx);}fireScroll(H,k,tStats(H),l);P.casts++;};
P.fxN=()=>fx.length;
/* the camera framing the hero and every place a foe was hit (from a run without pictures, the same as the recorded one: the random is seeded) */
P.frame=(s)=>{const pts=P.hx.concat(P.packAt||[]);pts.push([heroU.x,heroU.z]);let x0=1e9,x1=-1e9;for(const [x] of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);}
  /* the road stays across the middle of the view (effects rise up the screen, labels sit over the foes); left to right it frames every hit */
  const rz=posAt(s.st.d,ROUTES[s.st.ri])[1],cz=rz+(s.cz==null?.15:s.cz),cx=(x0+x1)/2+(s.cx||0);let hd=0;for(const [,z] of pts)hd=Math.max(hd,Math.abs(z-cz));
  const hw=(x1-x0)/2+(s.margin==null?.85:s.margin);hd+=.6;
  const z=Math.max(s.zmin||.5,Math.min(s.zmax||.8,Math.max(hw/4.5,hd/3.6)*(s.zk||1)));return{x:cx,zz:cz,y:gy(cx,cz),z};};
P.useCam=c=>{P.cam=c;P.camSet();};
/* v439, the tracking camera (Simon: "if the pheonix has a explode animation and it runs of screen the previews should track it to always
   display what is said in the description"): a run without pictures logs, every frame after the cast, where the action is: each effect the
   cast made that is still on the board (a flying one counted where it shows on the screen: further up the road by its height) and, with
   their times, the foes it hits. The recorder makes a smooth camera path out of it (record.js camPath) that the recorded run follows. */
P.trkOn=()=>{P.trk=[];};
{const V=new THREE.Vector3(),B=new THREE.Box3(),BS=new THREE.Vector3(),seen=new WeakMap();
 /* an effect counts as action while it is new (0.8s), moving or growing; one that only lingers (a burning river, a cloud) counts as weak,
    and one high in the sky (a phoenix climbing away, a meteor far up) not at all */
 P.trkFrame=()=>{const pts=[];let n=0;for(const e of fx){if(P.fx0&&P.fx0.has(e))continue;const o=e.o;if(!o||!o.parent||o.visible===false)continue;if(++n>90)break;
   o.updateWorldMatrix(true,false);o.getWorldPosition(V);
   if(Math.abs(V.x)+Math.abs(V.z)<1e-3){if(!o.children.length&&!o.geometry)continue;B.setFromObject(o);if(B.isEmpty())continue;B.getSize(BS);if(BS.x>7||BS.z>7)continue;B.getCenter(V);}
   if(!isFinite(V.x)||!isFinite(V.z)||Math.abs(V.x)>60||Math.abs(V.z)>60)continue;const h=Math.max(0,V.y-gy(V.x,V.z));if(h>(P.s.sky||2.4))continue;
   let q=seen.get(o);const sc=o.scale.x;if(!q){q={t:P.T,x:V.x,z:V.z,y:V.y,s:sc};seen.set(o,q);}
   const live=P.T-q.t<.8||Math.abs(V.x-q.x)+Math.abs(V.z-q.z)+Math.abs(V.y-q.y)>.015||Math.abs(sc-q.s)>.004;q.x=V.x;q.z=V.z;q.y=V.y;q.s=sc;
   pts.push([+V.x.toFixed(2),+(V.z-.76*Math.min(h,3.5)).toFixed(2),live?1:0]);}
  /* following the foes it hits: between hits the living foes keep the view (weak points) */
  if(P.s.follow==='hits')for(const e of P.foes)if(!e.dead&&e.g&&e.g.parent)pts.push([+e.x.toFixed(2),+e.z.toFixed(2),0]);
  if(P.s.follow==='foes')for(const e of P.foes){if(e.dead||!e.g||!e.g.parent)continue;let q=seen.get(e);if(!q){q={x:e.x,z:e.z};seen.set(e,q);}
    if(Math.abs(e.x-q.x)+Math.abs(e.z-q.z)>.02)pts.push([+e.x.toFixed(2),+e.z.toFixed(2),1]);q.x=e.x;q.z=e.z;}
  P.trk.push([+P.T.toFixed(3),pts]);};}
P.trkData=()=>JSON.stringify({trk:P.trk||[],hx:P.hx,towers:P.towersAt||[],hero:[heroU.x,heroU.z],pack:P.packAt||[],si:P.si,cam:P.cam,rz:posAt(P.s.st.d,ROUTES[P.s.st.ri])[1]});
P.useCamPath=a=>{P.path=a.map(c=>({x:c.x,zz:c.zz,y:gy(c.x,c.zz),z:c.z}));P.cam=P.path[0];P.camSet();};
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
  /* a seeded random from the very start: the game keeps its own copy of Math.random (const rnd) for everything it decides. Once it has
     loaded, Math.random itself becomes a second seeded stream, so what three.js draws for the ids of new objects (whose number depends on
     the camera: what is drawn, what is compiled) and the purely visual Math.random calls can never shift the game's own (v439: the
     recorded run is then the very run the tracking camera was planned on) */
  await ctx.addInitScript(() => { const mk = n => { let s = n | 0; return function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
    let A = mk(1), B = mk(7); window.__rc = 0; const gameR = function () { window.__rc++; if (window.__stk) { const l = (new Error().stack || '').split('\n')[2] || ''; const m = l.match(/at (\S+)/); const kk = m ? m[1] : '?'; window.__stk[kk] = (window.__stk[kk] || 0) + 1; } return A(); };
    Math.random = gameR; window.__split = () => { Math.random = function () { return B(); }; }; window.__seed = n => { A = mk(n); B = mk((n * 7919) ^ 0x5bd1e995); }; });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto('http://localhost:8771/src/kingsroad-keep.html', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__kk && typeof THREE !== 'undefined', null, { timeout: 90000 });
  const ev = c => page.evaluate(c => __kk.ev(c), c);
  await page.evaluate(() => window.__split());
  /* stop the game's own frame loop: the recorder steps it */
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await new Promise(r => setTimeout(r, 300));
  await ev("meta.notesSeen=NOTES_V;meta.sfx=false;meta.dev=true;saveMeta();document.querySelectorAll('.overlay').forEach(e=>e.classList.remove('on'));'ok'");
  await ev(STAGE);
  return { page, ev, errors, ctx, warm: new Set() };
}

/* v439: the tracking camera's path, one camera per frame, from what a run without pictures logged (PVR.trkFrame). Each frame keeps in view
   what is happening around it: before the cast and just after it the hero and the pack; then the foes hit from 0.3s before to 0.8s after,
   and the cast's effects from 0.1s before to 0.6s after (a flying one where it shows on the screen). A foe only burning or bleeding
   counts only when nothing else is going on, so the view leaves a burning pack to follow a phoenix. When it all does not fit in the widest
   view, the view keeps what comes next (the action's way ahead). Smoothed: the zoom opens a little ahead of time and closes slowly, and
   the middle glides (two passes of a 0.6s average). Following the foes themselves (a fold that sends them 8 tiles back) keeps every one of
   them: a jump is the point there. */
function camPath(D, s, castT, dt) {
  const n = D.si, out = [], margin = s.margin == null ? .85 : s.margin, zmin = s.zmin || .5, zmax = s.zmax || .8, zk = s.zk || 1, bz = s.cz == null ? .15 : s.cz;
  const fit = pts => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); }
    const hw = (x1 - x0) / 2 + margin, hd = (z1 - z0) / 2 + .6; return { x: (x0 + x1) / 2 + (s.cx || 0), zz: (z0 + z1) / 2 + bz, z: Math.max(hw / 4.5, hd / 3.6) * zk }; };
  const raw = []; let pc = null;
  for (let i = 0; i < n; i++) {
    const t = (i + 1) * dt, now = [], next = [], weak = [];
    if (t < castT + .7 || s.trackHero) { now.push(D.hero); for (const p of D.pack) now.push(p); }
    for (const p of (D.towers || [])) now.push(p);
    for (const h of D.hx) { if (h[3]) { if (h[2] >= t - 1 && h[2] <= t + 1) weak.push(h); continue; } if (h[2] >= t - .3 && h[2] <= t + .8) (h[2] > t ? next : now).push(h); }
    for (const [T, P] of D.trk) if (T >= t - .1 && T <= t + .6) for (const p of P) { if (!p[2]) { weak.push([p[0], p[1], T]); continue; } if (s.follow !== 'hits') (T > t ? next : now).push([p[0], p[1], T, 'f']); }
    /* while foes are being hit (burning too), an effect more than 2.5 tiles from all of them is a sideshow (a mote drifting off the hero) */
    const anc = D.hx.filter(h => h[2] >= t - 1.5 && h[2] <= t + 1.5);
    if (anc.length && s.follow !== 'foes') { const far = p => p[3] === 'f' && !anc.some(h => (h[0] - p[0]) ** 2 + (h[1] - p[1]) ** 2 <= 6.25);
      for (const a of [now, next]) for (let j = a.length - 1; j >= 0; j--) if (far(a[j])) a.splice(j, 1); }
    let pts = now.concat(next); if (!pts.length) pts = weak;
    /* with no foe struck outright, only effects, foes that are burning stay in view beside them */
    else if (!pts.some(p => p.length === 4 && p[3] === 0) && weak.some(p => p.length === 4)) { const wh = weak.filter(p => p.length === 4); pts = pts.concat(wh); now.push(...wh); }
    /* the action moves on from where it was: a point more than 5 tiles from the last frame's middle is a blip somewhere else */
    if (pc && s.follow !== 'foes') { const nearPc = p => (p[0] - pc[0]) ** 2 + (p[1] - pc[1]) ** 2 <= 25; pts = pts.filter(nearPc); for (const a of [now, next]) for (let j = a.length - 1; j >= 0; j--) if (!nearPc(a[j])) a.splice(j, 1); }
    /* a stray far from the rest (an ember flung across the map) does not pull the view: points further than 5 tiles from the middle of
       the action (the median) are dropped */
    if (pts.length > 2 && s.follow !== 'foes') { const md = a => { const b = a.slice().sort((p, q) => p - q); return b[b.length >> 1]; }, mx = md(pts.map(p => p[0])), mz = md(pts.map(p => p[1]));
      const kept = pts.filter(p => (p[0] - mx) ** 2 + (p[1] - mz) ** 2 <= 25); if (kept.length) { const ks = new Set(kept); for (const a of [now, next]) for (let j = a.length - 1; j >= 0; j--) if (!ks.has(a[j])) a.splice(j, 1); pts = kept; } }
    if (!pts.length) { raw.push(null); continue; }
    let f = fit(pts); if (f.z * 1 > zmax * 1.02 && next.length) { const g = fit(next.concat(now.filter(p => p[2] != null && p[2] >= t - .1))); if (g.z < f.z) f = g; }
    raw.push(f); pc = [f.x - (s.cx || 0), f.zz - bz];
  }
  /* gaps take their neighbours' view; before anything at all, the static framing */
  let last = null; for (let i = 0; i < n; i++) { if (raw[i]) last = raw[i]; else raw[i] = last; }
  last = null; for (let i = n - 1; i >= 0; i--) { if (raw[i]) last = raw[i]; else raw[i] = last; }
  if (!raw[0]) return null;
  const cl = z => Math.max(zmin, Math.min(zmax, z));
  let zs = raw.map((r, i) => { let m = 0; for (let j = Math.max(0, i - 8); j <= Math.min(n - 1, i + 15); j++) m = Math.max(m, raw[j].z); return cl(m); });
  const avg = (a, w) => a.map((_, i) => { let sum = 0, c = 0; for (let j = Math.max(0, i - w); j <= Math.min(a.length - 1, i + w); j++) { sum += a[j]; c++; } return sum / c; });
  zs = avg(avg(zs, 9), 9); let xs = avg(avg(raw.map(r => r.x), 9), 9), ys = avg(avg(raw.map(r => r.zz), 9), 9);
  for (let i = 0; i < n; i++) out.push({ x: +xs[i].toFixed(3), zz: +ys[i].toFixed(3), z: +zs[i].toFixed(3) });
  return out;
}

/* one clip: returns {ok, frames, len, probe} */
async function recordClip(P, k, L, frameDir, seed, cam, s0) {
  const s = s0 || SC.get(k, L), dry = !cam;
  await P.page.evaluate(n => window.__seed(n), seed);
  await P.ev(`PVR.setup(${JSON.stringify(k)},${L},${JSON.stringify(s)});'ok'`);
  if (dry && s.track !== false) await P.ev('PVR.trkOn()');
  if (process.env.PV_RC) await P.ev('window.__rcLog=[];window.__stkOn=1;window.__stk=null;window.__stkKeep=null;window.__stkFrom='+(+process.env.PV_RC||0)+';0');
  if (Array.isArray(cam)) await P.ev(`PVR.useCamPath(${JSON.stringify(cam)});'ok'`);
  else if (cam && cam !== true) await P.ev(`PVR.useCam(${JSON.stringify(cam)});'ok'`);
  if (!dry) { fs.rmSync(frameDir, { recursive: true, force: true }); fs.mkdirSync(frameDir, { recursive: true }); }
  const dt = 1 / FPS; let t = 0, n = 0, base = null, quiet = 0, castT = s.castAt, casts = (s.casts || [s.castAt]).slice(), also = (s.also || []).slice(), last = Math.max(...casts, ...also.map(a => a.at));
  const t0 = s.from != null ? s.from : Math.max(0, castT - PRE), cap = s.cap || CAP;
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
      if (s.len ? t >= s.len : ((quiet >= TAIL && t - t0 >= (s.minLen || MINLEN)) || t - t0 >= cap)) break;
    }
  }
  const probe = s.probe ? await P.ev(`!!(${s.probe})`) : true, evs = JSON.parse(await P.ev('JSON.stringify(PVR.evSum())')), evAt = JSON.parse(await P.ev('JSON.stringify(PVR.evAt())'));
  let frame = dry && !s.fixedCam ? JSON.parse(await P.ev(`JSON.stringify(PVR.frame(${JSON.stringify(s)}))`)) : null;
  if (dry && !s.fixedCam && s.track !== false) { const D = JSON.parse(await P.ev('PVR.trkData()')), path = camPath(D, s, castT, dt); if (path) frame = path;
    if (process.env.PV_TRK) fs.writeFileSync(path_.join(process.env.PV_TRK, k + '-' + L + '.json'), JSON.stringify({ D, path, castT })); }
  if (process.env.PV_EVAL) console.log('    eval:', await P.ev(process.env.PV_EVAL));
  if (process.env.PV_RC) console.log('    callers', await P.ev('JSON.stringify(window.__stkKeep||window.__stk||{})'));
  if (process.env.PV_RC) { const a = JSON.parse(await P.ev('JSON.stringify(window.__rcLog||[])')); (global.__rcRuns = global.__rcRuns || []).push(a); const R = global.__rcRuns; if (R.length >= 2) { const x = R[R.length - 2], y = R[R.length - 1]; let i = 0; while (i < Math.min(x.length, y.length) && x[i] - x[0] === y[i] - y[0]) i++; console.log('    rnd calls first differ at step', i, 'of', Math.min(x.length, y.length), 'T', ((i + 1) / FPS).toFixed(2)); } }
  if (process.env.PV_DEBUG) console.log('   ', k, L, 'first at', await P.ev('JSON.stringify(PVR.evAt())'), 'Pw', await P.ev('Math.round(PVR.Pw)'), 'events', await P.ev('JSON.stringify(PVR.ev)'), 'casts', await P.ev('PVR.casts'), 'target hits', await P.ev('JSON.stringify(PVR.hit.slice(0,14))'), 'dead', await P.ev('PVR.foes.filter(e=>e.dead).length'));
  return { frames: n, len: n / FPS, probe, cam: frame || true, dry, evs, evAt };
}

function encode(frameDir, out) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frameDir, '%04d.jpg'), '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(SC.crf || 30),
    '-pix_fmt', 'yuv420p', '-profile:v', 'main', '-movflags', '+faststart', '-an', out]);
}
function sheet(frameDir, n, out) {
  const pick = 9, step = Math.max(1, Math.floor(n / pick));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frameDir, '%04d.jpg'), '-vf', `select='not(mod(n\\,${step}))',scale=320:-1,tile=3x3`, '-frames:v', '1', '-q:v', '3', out]);
}

exports.camPath = camPath;
/* only when run itself (loading it, from a test, records nothing) */
if (require.main === module) (async () => {
  const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i < 0 ? null : args.splice(i, 2)[1]; }, flag = k => { const i = args.indexOf(k); if (i < 0) return false; args.splice(i, 1); return true; };
  const jobsN = +(opt('--jobs') || 4), keep = flag('--keep'), sheets = flag('--sheet');
  fs.mkdirSync(OUT, { recursive: true });
  const all = SC.scrolls(); let list = [];
  if (!args.length) for (const k of all) for (let L = 0; L <= 5; L++) list.push([k, L]);
  else for (const a0 of args) for (const a of (SC[a0] ? SC[a0]() : [a0])) { const [k, l] = a.split(':'); if (l == null) for (let L = 0; L <= 5; L++) list.push([k, L]); else list.push([k, +l]); }
  const manPath = path.join(OUT, 'manifest.json'), man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : { v: 1, w: W, h: H, fps: FPS, clips: {} };
  const queue = list.slice(), fails = []; let done = 0; const t00 = Date.now();
  async function worker(wi) {
    const browser = await launch(); let P = await openPage(browser);
    while (queue.length) {
      const [k, L] = queue.shift(), id = `${k}-${L}`, fd = path.join(OUT, '_frames', id), s = SC.get(k, L);
      /* v439: every clip on a fresh page, so nothing one cast leaves behind (a space warp, a trail) is in the next */
      if (P.used) { try { await P.ctx.close(); } catch (_) { } P = await openPage(browser); } P.used = true;
      let r = null, seed = s.seed || 1;
      try {
        /* a run without pictures picks the seed (the mastery's moment must happen) and the framing; then the clip is recorded with them */
        /* a first cast in a page builds what the game caches (textures, geometry), drawing on the random as it does: a warm-up run first,
           so the run the camera is planned on and the recorded one start from the same page */
        if (!P.warm.has(id)) { await recordClip(P, k, L, fd, seed, null); P.warm.add(id); }
        let d = null;
        for (let tries = 0; tries < (s.tries || 6); tries++, seed++) { d = await recordClip(P, k, L, fd, seed, null); if (d.probe) break; }
        if (!d.probe) seed--;
        /* a clip centred on a moment (focus: {ev, before, after}): the run without pictures found when it first happens; the clip is that
           window of the very same run (the camera path covers the whole run) */
        let sr = null; if (s.focus && d.evAt && d.evAt[s.focus.ev] != null) { const f = d.evAt[s.focus.ev]; sr = Object.assign({}, s, { from: Math.max(0, f - (s.focus.before || 2)), len: f + (s.focus.after || 3) }); }
        r = await recordClip(P, k, L, fd, seed, d.cam, sr);
        /* the recorded run must be the run the camera was planned on: the same moments at the same times */
        const drift = Object.keys(d.evAt || {}).filter(e => r.evAt && r.evAt[e] != null && Math.abs(r.evAt[e] - d.evAt[e]) > .05);
        if (drift.length) console.log(`   ${id}: the recorded run drifted from the planned one (${drift.slice(0, 4).map(e => e + ' ' + d.evAt[e] + '->' + r.evAt[e]).join(', ')})`);
        encode(fd, path.join(OUT, id + '.mp4'));
        if (sheets) { fs.mkdirSync(path.join(OUT, '_sheets'), { recursive: true }); sheet(fd, r.frames, path.join(OUT, '_sheets', id + '.jpg')); }
        const sz = fs.statSync(path.join(OUT, id + '.mp4')).size;
        man.clips[id] = { k, L, len: +r.len.toFixed(2), seed, bytes: sz, note: s.note || '' };
        if (Object.keys(r.evs || {}).length) man.clips[id].ev = r.evs;
        if (!r.probe) fails.push(id + ' (its probe never came true: ' + s.probe + ')');
        if (!keep) fs.rmSync(fd, { recursive: true, force: true });
        console.log(`[${++done}/${list.length}] ${id} ${r.len.toFixed(1)}s ${(sz / 1024).toFixed(0)} KB seed ${seed}${r.probe ? '' : ' PROBE FAILED'}${Object.keys(r.evs || {}).length ? ' ' + JSON.stringify(r.evs) : ''}${P.errors.length ? ' errors: ' + P.errors.splice(0).slice(0, 2).join(' | ') : ''}`);
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
