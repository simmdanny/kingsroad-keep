(function(){
/* Graphics quality, HUD writes, memory and load (v495). Run on the dev page:
   __kk.ev(await (await fetch('/tests/pql-test.js')).text()) returns [name, ok, detail] rows. Covers the Graphics tiers (High exactly the
   settings and picture of before), Auto stepping down and up on simulated slow and fast frames without flicker, the setting persisting
   (also across an account switch), DOM writes only on change, no growth when the same wave is played again and again, and the lazy start.
   Puts the account, the setting and the renderer back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),st0=state,pz0=paused;
const G0={auto:GQ.auto,hold:Object.assign({},GQ.hold),back:Object.assign({},GQ.back),chg:GQ.chg,last:GQ.last,upAt:GQ.upAt,upTo:GQ.upTo,log:GQ.log.slice()};
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const gl=renderer.getContext();
const shot=()=>{anim(.001,1);renderer.render(scene,camera);const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);return{px,w,h};};
const same=(A,B)=>{if(A.w!==B.w||A.h!==B.h)return -1;let d=0;for(let i=0;i<A.px.length;i++)if(A.px[i]!==B.px[i])d++;return d;};
const board=a=>{let s=4242;const rnd0=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
  try{lsSet(KR,null);meta.arenas[a]=1;meta.arena=a;meta.mapIntro=0;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;gold+=1e7;
    const types=['archer','cannon','mage','frost','ballista','storm'];let n=0;for(let r=2;r<H-2&&n<6;r+=3)for(let c=1;c<W-1&&n<6;c+=3)if(grid[r][c]===0){try{placeTower(types[n%6],c,r,{});n++;}catch(e){}}}finally{Math.random=rnd0;}};
const feed=(ms,dt,work)=>{let t=GQ.last+dt;const end=GQ.last+ms;while(t<=end){gqFeed(dt,work,t);t+=dt;}};
const autoReset=lvl=>{meta.gfx='auto';GQ.auto=lvl;GQ.hold={};GQ.back={};GQ.chg=-1e9;GQ.upAt=-1e9;GQ.upTo=-1;GQ.slow=GQ.fast=0;GQ.ws.length=GQ.ww.length=0;GQ.wt0=-1;GQ.log=[];GQ.last=1e6;gqApply();};
try{
  /* ---- the tiers ---- */
  board('plains');meta.shadows=true;meta.battery=false;applyShadows();
  setGfx('high');
  ok('High: the pixel ratio is the one of before (the screen\'s, at most 2)',renderer.getPixelRatio()===bsPR0(),renderer.getPixelRatio()+' vs '+bsPR0());
  ok('High: the board\'s shadow map is 1024 as before',sun.shadow.mapSize.x===1024,sun.shadow.mapSize.x);
  {const F=gqFarList();ok('High: the scenery round the board casts its shadows as before',F.length>0&&F.every(o=>o.castShadow===o.userData.gqCast&&o.castShadow),F.length+' far casters');
    ok('the far scenery is all off the board (the trees round it and the dressing)',F.every(o=>o.isInstancedMesh||(()=>{let p=o;while(p&&p.parent!==TERRAIN)p=p.parent;return p&&(p.userData.ot||p.userData.glOuter);})()));}
  {const n0=PSN.list.length;for(let i=0;i<30;i++)emit(0,{x:0,y:-50,z:0,life:.01});ok('High: every particle is made',PSN.list.length-n0===30,PSN.list.length-n0);PSN.list.length=n0;}
  const A=shot();
  /* High against the renderer as it was before v495 (the same calls the old code made), drawn again */
  renderer.setPixelRatio(bsPR0());psScale();const B=shot();
  ok('High: the picture is the one the old settings draw, pixel for pixel',same(A,B)===0,same(A,B)+' bytes differ');
  setGfx('medium');const Md=shot();
  ok('Medium: fewer pixels (75%) and the 512 shadow map',Md.w<A.w&&Math.abs(Md.w/A.w-.75)<.02&&sun.shadow.mapSize.x===512,A.w+'x'+A.h+' -> '+Md.w+'x'+Md.h+', shadow '+sun.shadow.mapSize.x);
  {const far=gqFarList().filter(o=>o.castShadow).length;ok('Medium: the far scenery still casts shadows',far>0,far);}
  setGfx('low');const Lw=shot();
  {const far=gqFarList().filter(o=>o.castShadow).length;let near=0;TERRAIN.traverse(o=>{if(o.isMesh&&o.castShadow)near++;});
    ok('Low: fewer pixels still (55%), no shadows from the far scenery, the board\'s own still cast',Lw.w<Md.w&&far===0&&near>0,Lw.w+'x'+Lw.h+', far casters '+far+', others '+near);}
  {const n0=PSN.list.length;for(let i=0;i<30;i++)emit(0,{x:0,y:-50,z:0,life:.01});ok('Low: a third fewer particles',PSN.list.length-n0===20,PSN.list.length-n0);PSN.list.length=n0;}
  setGfx('high');const A2=shot();ok('back to High: the same picture again',same(A,A2)===0,same(A,A2));
  ok('High after Low: shadow map 1024 and the far scenery shadows back',sun.shadow.mapSize.x===1024&&gqFarList().every(o=>o.castShadow));
  /* a new board keeps the tier (the far scenery is rebuilt) */
  setGfx('low');board('snow');{const F=gqFarList(),far=F.filter(o=>o.castShadow).length;ok('a new board keeps the tier (Low, no far shadows, 512)',F.length>0&&far===0&&sun.shadow.mapSize.x===512&&renderer.getPixelRatio()<bsPR0(),F.length+' / '+far+' '+sun.shadow.mapSize.x);}
  setGfx('high');
  /* the cap: a big screen at twice the pixels is drawn under about 4.2 million pixels except on High */
  {const iw=Object.getOwnPropertyDescriptor(window,'innerWidth'),ih=Object.getOwnPropertyDescriptor(window,'innerHeight'),dp=Object.getOwnPropertyDescriptor(window,'devicePixelRatio');
    try{Object.defineProperty(window,'innerWidth',{value:2560,configurable:true});Object.defineProperty(window,'innerHeight',{value:1440,configurable:true});Object.defineProperty(window,'devicePixelRatio',{value:3,configurable:true});
      meta.gfx='high';const h=bsPR();meta.gfx='auto';GQ.auto=0;const a0=bsPR();GQ.auto=1;const a1=bsPR();meta.gfx='medium';const md=bsPR();
      ok('the pixel ratio cap: High and Auto\'s top level keep 2 on a 3x 2560x1440 screen (as before); a lower level stays under 4.2 million pixels before its scale',h===2&&a0===2&&2560*1440*(a1/.85)**2<=4.21e6&&Math.abs(md/a1-.75/.85)<1e-9,'high '+h+', auto top '+a0+', auto level 1 '+a1.toFixed(3)+', medium '+md.toFixed(3));
      Object.defineProperty(window,'innerWidth',{value:390,configurable:true});Object.defineProperty(window,'innerHeight',{value:844,configurable:true});
      meta.gfx='auto';GQ.auto=0;ok('a phone reporting 3 is drawn at 2 on Auto\'s top level (as before)',bsPR()===2,bsPR());}
    finally{if(iw)Object.defineProperty(window,'innerWidth',iw);else delete window.innerWidth;if(ih)Object.defineProperty(window,'innerHeight',ih);else delete window.innerHeight;if(dp)Object.defineProperty(window,'devicePixelRatio',dp);else delete window.devicePixelRatio;meta.gfx='high';}}
  /* ---- Auto ---- */
  autoReset(0);const pr0=renderer.getPixelRatio();
  feed(2100,25,8);ok('Auto: one slow 2 s window (40 fps) does not step yet',GQ.auto===0,GQ.auto);
  feed(2100,25,8);ok('Auto: a second slow window steps down one level',GQ.auto===1,GQ.auto);
  ok('Auto: the first step is the resolution (85%), nothing else',Math.abs(renderer.getPixelRatio()-pr0*.85)<1e-6&&sun.shadow.mapSize.x===1024,renderer.getPixelRatio());
  feed(30000,18,8);ok('Auto: frames between the thresholds (55 fps) never move it (hysteresis)',GQ.auto===1,GQ.auto+' '+GQ.log.length+' moves');
  feed(7000,16.7,3);ok('Auto: fast frames do not step up before 8 s',GQ.auto===1,GQ.auto);
  feed(5000,16.7,3);ok('Auto: steady fast frames with room to spare step back up',GQ.auto===0,GQ.auto);
  feed(2600,25,8);feed(4300,25,8);ok('Auto: too slow again right after stepping up: down again',GQ.auto===1,GQ.auto);
  ok('Auto: and that level is held back (no flicker)',(GQ.hold[0]||0)>GQ.last,'hold for '+Math.round(((GQ.hold[0]||0)-GQ.last)/1000)+' s');
  {const n=GQ.log.length;feed(20000,16.7,3);ok('Auto: fast frames during the hold do not step up',GQ.auto===1&&GQ.log.length===n,GQ.auto);
    for(let i=0;i<60&&GQ.auto!==0;i++)feed(500,16.7,3);ok('Auto: after the hold it tries again',GQ.auto===0,GQ.auto);}
  {feed(2600,25,8);feed(4300,25,8);const h2=(GQ.hold[0]||0)-GQ.last;ok('Auto: a second failure holds it twice as long',GQ.auto===1&&h2>45000,Math.round(h2/1000)+' s');}
  {autoReset(0);let moves=0;for(let i=0;i<20;i++){const n=GQ.log.length;feed(2000,i%2?25:16.7,i%2?8:3);moves+=GQ.log.length-n;}ok('Auto: alternating slow and fast windows: at most one move in 40 s',moves<=1,moves);}
  autoReset(0);feed(2100,50,20);ok('Auto: very slow frames (20 fps) step down after one window',GQ.auto===1,GQ.auto);
  autoReset(0);feed(1000,25,8);gqFeed(3000,8,GQ.last+3000);feed(1500,25,8);ok('Auto: a stall (a tab switch) starts the window again',GQ.auto===0,GQ.auto);
  autoReset(0);feed(9000,700,600);ok('Auto: a very slow device (under 2 fps) still steps down',GQ.auto>=1,GQ.auto);
  autoReset(0);for(let i=0;i<6;i++){feed(5000,40,20);}ok('Auto: on a slow device it walks down the ladder, one level at a time',GQ.auto===GQ.L.length-1&&GQ.log.every((x,i)=>i===0||x[1]===GQ.log[i-1][1]+1),GQ.log.map(x=>x[1]).join(','));
  ok('Auto: its level is kept for the next start (meta.gfxAuto)',meta.gfxAuto===GQ.auto,meta.gfxAuto);
  {autoReset(3);meta.battery=true;feed(4300,36,10);ok('Auto with the battery saver: 28 fps frames are fine (its target is 30)',GQ.auto===3,GQ.auto);meta.battery=false;batApply();}
  setGfx('high');{const a=GQ.auto;feed(5000,60,30);ok('High never moves on its own',GQ.auto===a&&renderer.getPixelRatio()===bsPR0(),GQ.auto+' '+renderer.getPixelRatio());}
  /* the frame hook feeds only drawn battle frames (requestAnimationFrame is held so the calls start no second loop) */
  {const f0=gqFeed,raf=window.requestAnimationFrame,st=state,pz=paused;const seen=[];gqFeed=function(dt){seen.push(dt);};window.requestAnimationFrame=()=>0;
    try{const t=performance.now();state='menu';frame(t);frame(t+16);const nMenu=seen.length;state='playing';paused=false;$('#home').hidden=true;frame(t+32);frame(t+48);frame(t+64);
      ok('frames in the menus are not measured, battle frames are',nMenu===0&&seen.length===2&&Math.abs(seen[0]-16)<1e-6,nMenu+' / '+seen.join(','));}
    finally{gqFeed=f0;window.requestAnimationFrame=raf;state=st;paused=pz;}}
  /* ---- persisting ---- */
  setGfx('medium');ok('the setting is saved with the account (meta.gfx)',(lsGet(KM)||{}).gfx==='medium',(lsGet(KM)||{}).gfx);
  {const b=$('#bGfx');ok('the More tab row shows it',b&&b.textContent==='Medium',b&&b.textContent);b.click();ok('tapping it moves to the next choice (Low)',meta.gfx==='low'&&b.textContent==='Low',meta.gfx);}
  {state='menu';const m=JSON.parse(JSON.stringify(meta));m.gfx='high';m.gfxAuto=0;acctEnter(m,lsGet(KR));ok('switching account keeps the device\'s Graphics setting',meta.gfx==='low'&&renderer.getPixelRatio()<bsPR0(),meta.gfx);}
  {openSettings();const o=$('#setPop'),r=o&&o.querySelector('#gqRow');ok('the PC Settings window has the Graphics choice',!!r&&r.querySelectorAll('[data-gfx]').length===4);
    const b=r&&r.querySelector('[data-gfx="high"]');if(b)b.click();ok('choosing High there sets it',meta.gfx==='high');
    o.querySelector('[data-set="3"]').click();ok('the row is still there after the window repaints',!!o.querySelector('#gqRow'));o.querySelector('[data-set="3"]').click();o.classList.remove('on');}
  {const wasDev=meta.dev;devOpen();const p=$('#devPanel');ok('the developer panel shows the setting and the level',!!(p&&p.querySelector('#dvGfx')&&/Quality/.test(p.querySelector('#dvGfx').textContent)));devClose();}
  setGfx('high');
  /* ---- DOM writes only on change ---- */
  {board('plains');paused=false;state='playing';const recs=[];const mo=new MutationObserver(L=>recs.push(...L));
    const bar=$('#bar'),sl=$('#scrList'),fab=$('#fabBuild'),vf=$('#vfxFlash'),vv=$('#vfxVig');
    updSpells();updScrollBar();updPlaceUI(1);vfxSync();updHud(true);
    for(const el of [bar,sl,fab,vf,vv,$('#placeUI')].filter(Boolean))mo.observe(el,{subtree:true,childList:true,characterData:true,attributes:true});
    for(let i=0;i<5;i++){updSpells();updScrollBar();updPlaceUI(1+i);vfxSync();updHud();}
    const R=mo.takeRecords().concat(recs);mo.disconnect();
    ok('nothing changed: the spell bar, scroll bar, build button and overlays are not written at all',R.length===0,R.length+' writes: '+R.slice(0,4).map(r=>r.type+' '+(r.attributeName||'')+' '+(r.target.id||r.target.className||r.target.nodeName)).join(', '));
    flashA=.5;flashCol='#fff';vfxSync();ok('a change is still written (the flash)',vf.style.opacity==='0.5'||+vf.style.opacity===.5*SPACE_K,vf.style.opacity);flashA=0;vfxSync();ok('and written back',+vf.style.opacity===0);
    fab.hidden=true;ok('hidden still works through the guard (true)',fab.hidden===true&&fab.hasAttribute('hidden'));fab.hidden=false;ok('hidden still works through the guard (false)',fab.hidden===false&&!fab.hasAttribute('hidden'));
    const t=document.querySelector('#bar .spell .t');if(t){t.textContent='7';ok('countdown text still changes through the guard',t.textContent==='7');t.textContent='';}
    /* the HUD rails read the layout at the end of the frame, after its writes */
    let ran=0;const m0f=DW.pend.length;DW.inFrame=true;try{mpgSync();artHudSync();}finally{DW.inFrame=false;}ok('during a frame the rails wait for the end of the frame',DW.pend.length===m0f+2,DW.pend.length);
    const P=DW.pend.splice(0);for(const f of P)f();ran=P.length;ok('outside a frame they run at once (tests, menus)',ran===2&&DW.pend.length===0);
    {const gb=Element.prototype.getBoundingClientRect;let reads=0,writesAfter=0,wrote=false;Element.prototype.getBoundingClientRect=function(){reads++;if(wrote)writesAfter++;return gb.call(this);};
      const tc=DW.TC.set;try{uiT=1;DW.inFrame=true;$('#vGold').textContent='x';wrote=true;updHud();ok('a frame\'s HUD tick reads no layout between its writes',reads===0,reads+' reads');}finally{DW.inFrame=false;Element.prototype.getBoundingClientRect=gb;DW.pend.splice(0).forEach(f=>f());}}
    paused=true;}
  /* ---- memory: the same wave played again and again does not grow ---- */
  {setGfx('low');board('plains');paused=false;state='playing';lives=1e9;gold=1e9;const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);if(!heroU)spawnHero(q.c,q.r);
    const SP=['eclipse','firestorm','tempest','wither'].filter(k=>SPELLS_S[k]);let ci=0;
    const round=()=>{wave=119;const WV=buildWave(120);wave=120;spawners.push({t:0,q:WV.q.slice(),w:120});
      for(let s=0;s<80&&(enemies.length||spawners.length);s++){for(let i=0;i<10;i++){lives=1e9;for(const sp of spawners)sp.t=Math.min(sp.t,.1);update(.033);updFx(.033);}
        if(s%3===0&&heroU&&SP.length){const k=SP[ci++%SP.length];try{meta.spells[k]=meta.spells[k]||{lvl:1,own:1};heroU.scd={};heroU.gcd=0;const L=sortTargets(heroU,enemies.filter(e=>!e.dead));if(L.length)fireScroll(heroU,k,heroStats(),L);/* like the game's own casts: none at an empty road */}catch(e){}}
        for(const e of enemies)updBar(e);anim(.033,time);if(s%4===0)renderer.render(scene,camera);for(const e of enemies.slice())if(!e.dead&&e.dist>2)hurt(e,1e12,'magic',{src:heroU});}
      for(let i=0;i<300||fx.length&&i<1500;i++){update(.05);updFx(.05);}anim(.05,time);renderer.render(scene,camera);pfSweep();if(MEM.on)memSweep();
      let n=0;scene.traverse(()=>n++);return{geos:renderer.info.memory.geometries,tex:renderer.info.memory.textures,kids:scene.children.length,objs:n,fx:fx.length};};
    round();const a=round();round();const b=round();
    ok('the same wave (with Eclipse of the Damned) twice more: geometries do not grow',b.geos<=a.geos+25,a.geos+' -> '+b.geos);
    ok('textures do not grow',b.tex<=a.tex,a.tex+' -> '+b.tex);
    ok('nothing is left in the scene once the effects are over',b.kids<=a.kids&&b.fx===0,a.kids+'/'+a.objs+' -> '+b.kids+'/'+b.objs+', effects running '+b.fx);
    MEM.on=false;let c;try{c=round();}finally{MEM.on=true;}memSweep();
    ok('control: without the sweep the same round leaves geometries behind (what v495 fixes)',c.geos>b.geos+40,b.geos+' -> '+c.geos+' without the sweep');
    paused=true;setGfx('high');}
  /* ---- the start ---- */
  {const nav=performance.getEntriesByType('navigation')[0];ok('the start drew no thumbnail before the game was ready (they wait in a queue)',TH.atStart&&TH.atStart.made===0&&TH.atStart.queued===ALL_T.length+HEROES.length,
    JSON.stringify(TH.atStart)+'; DOMContentLoaded here '+(nav?Math.round(nav.domContentLoadedEventEnd):'?')+' ms (measured headless, alone: 3.35 s before v495, 2.90 s after)');}
  ok('the menu background is a blob (encoded off the main thread)',/url\("?blob:/.test($('#home').style.backgroundImage),$('#home').style.backgroundImage.slice(0,80));
  {const k=ALL_T[3],d=Object.getOwnPropertyDescriptor(thumbs,k);thmAll();const v=thumbs[k];delete thumbs[k];TH.q.push(['t',k]);thmLazy(thumbs,'t',k);const w=thumbs[k];
    ok('a thumbnail made on first use is the same picture as one made at once',typeof v==='string'&&v.startsWith('data:image/png')&&v===w,(v||'').length+' / '+(w||'').length);}
  ok('every tower and hero has its thumbnail and silhouette',ALL_T.every(k=>/^data:image/.test(thumbs[k]))&&HEROES.every(h=>/^data:image/.test(hthumbs[h.id])&&/^data:image/.test(hsil[h.id])));
  ok('no errors logged',errs===0,errs);
}catch(e){ok('suite ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;meta=JSON.parse(m0);saveMeta();lsSet(KR,r0);Object.assign(GQ,{auto:G0.auto,hold:G0.hold,back:G0.back,chg:G0.chg,last:G0.last,upAt:G0.upAt,upTo:G0.upTo,log:G0.log});GQ.slow=GQ.fast=0;GQ.ws.length=GQ.ww.length=0;GQ.wt0=-1;
  batApply();applyShadows();paused=pz0;state='menu';clearWorld();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;gqApply();updGfxBtn();fit();if(st0!=='playing')state=st0;}
return JSON.stringify(out);})()
