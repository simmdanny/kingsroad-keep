/* v482 screenshot sheets for the per-unit Armoured designs (run: python3 -m http.server 8771 &; node tests/arx-shots.js OUTDIR [mode])
   mode 'close' (default): per type, each variant as plain / armoured front / back / walking, close up, in Plains and Highlands kits.
   mode 'game': in-game crowds at CAM.zoom 1 and zoomed in. mode 'gal': the Bestiary variant row with galElite. */
const { chromium } = require('playwright');const fs=require('fs'),path=require('path');
const PORT=process.env.KK_PORT||8771,OUT=process.argv[2]||'.',MODE=process.argv[3]||'close',ONLY=process.argv[4]||'';
const local=path.join(__dirname,'..','node_modules','three','build','three.min.js');
(async()=>{const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(local)}));
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(`http://localhost:${PORT}/src/kingsroad-keep.html`,{waitUntil:'load',timeout:90000});
  await page.waitForFunction(()=>window.__kk&&typeof THREE!=='undefined',null,{timeout:60000});
  const save=(n,d)=>{fs.writeFileSync(path.join(OUT,n),Buffer.from(d.split(',')[1],'base64'));console.log('wrote',n);};
  if(MODE==='close'){
    const types=(ONLY||'peasant,soldier,rider,raven,ram,wolf').split(',');
    for(const hl of [0,1])for(const type of types){if(hl&&type==='wolf')continue;
      const d=await page.evaluate(([type,hl])=>__kk.ev(`(function(){const type='${type}',HL=${hl};
        const sc=new THREE.Scene();sc.background=new THREE.Color(0x6a7480);sc.add(new THREE.HemisphereLight(0xdfe8ff,0x4a4030,.75));const dl=new THREE.DirectionalLight(0xfff2dc,.85);dl.position.set(2,4,3);sc.add(dl);
        const gr=new THREE.Mesh(new THREE.CircleGeometry(2,24),new THREE.MeshLambertMaterial({color:0x5a5040}));gr.rotation.x=-Math.PI/2;sc.add(gr);
        const cam=new THREE.PerspectiveCamera(28,1,.01,50);const CW=300,CH=300;
        const nv=type==='peasant'?PEASANT_VARIANTS.length:type==='wolf'?2:UNIT_VARIANTS[type].length;
        const cols=[['plain',0.5,0],['arm',0.5,0],['arm',2.6,0],['arm',-1.2,1]];
        const cv=document.createElement('canvas');cv.width=CW*cols.length;cv.height=CH*nv;const c2=cv.getContext('2d');
        const W0=renderer.domElement.width,H0=renderer.domElement.height,pr=renderer.getPixelRatio();renderer.setPixelRatio(1);renderer.setSize(CW,CH,false);
        if(HL)HLX.n++;
        try{for(let v=0;v<nv;v++)cols.forEach(([kind,yaw,walk],ci)=>{
          if(type==='wolf')TGP.alpha=v===1;
          const m=type==='peasant'?peasantModel(v):type==='wolf'?enemyModel('wolf'):unitModel(type,v);TGP.alpha=false;
          if(kind==='arm'){const D=eliteDress(type,['armored'],m.b.children[0],m.variant);m.b.add(D.g);}
          if(type==='wolf'&&v===1)m.b.scale.multiplyScalar(1.35);
          m.g.rotation.y=yaw;sc.add(m.g);
          const L=m.limbs;if(walk){if(L&&L.armL){L.legL.rotation.x=.6;L.legR.rotation.x=-.6;L.armL.rotation.x=L.base[1].rx-.45;L.armR.rotation.x=L.base[0].rx+.2;}
            if(L&&L.quad){L.quad.FL.rotation.x=.55;L.quad.BR.rotation.x=.55;L.quad.FR.rotation.x=-.55;L.quad.BL.rotation.x=-.55;}
            if(m.wings)m.wings.forEach((w,i)=>w.rotation.z=(i%2?-1:1)*.55);if(m.tick)m.tick(.3,1.2,0);}
          const h=m.h||.5,ty=type==='raven'?.0:h*.5,dist=type==='ram'?2.0:type==='rider'?1.55:type==='raven'?.8:type==='wolf'?(v===1?1.9:1.4):1.05;
          cam.position.set(0,ty+dist*(type==='raven'?.75:.35),dist);cam.lookAt(0,ty,0);if(type==='raven'){m.g.position.y=.12;cam.lookAt(0,.12,0);}
          renderer.render(sc,cam);c2.drawImage(renderer.domElement,ci*CW,v*CH);sc.remove(m.g);
          c2.fillStyle='#fff';c2.font='13px sans-serif';c2.fillText((HL?'HL ':'')+type+' v'+v+' '+kind+(walk?' walk':''),ci*CW+6,v*CH+16);});}
        finally{if(HL)HLX.n--;renderer.setPixelRatio(pr);renderer.setSize(window.innerWidth,window.innerHeight);}
        return cv.toDataURL('image/jpeg',.88);})()`),[type,hl]);
      save(`close-${hl?'hl-':''}${type}.jpg`,d);}
  }

  if(MODE==='game'){const arenas=(ONLY||'plains,highlands,taiga,snow').split(',');
    for(const ar of arenas){const types=['peasant','soldier','rider','raven','ram'].concat(ar==='taiga'?['wolf']:[]);
      for(const type of types){const d=await page.evaluate(([ar,type])=>__kk.ev(`(function(){const ar='${ar}',type='${type}';
        lsSet(KR,null);meta.arenas=meta.arenas||{};['snow','tundra','whitewaste','taiga','highlands'].forEach(k=>meta.arenas[k]=1);meta.seenA=meta.seenA||{};['snow','tundra','whitewaste','taiga','highlands'].forEach(k=>meta.seenA[k]=1);meta.mapIntro=0;
        meta.arena=ar;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;
        const R=ROUTES[0],mid=R.len*.5,nv=type==='peasant'?8:type==='wolf'?2:5;
        for(let v=0;v<nv;v++)for(const a of[0,1]){if(type==='wolf')TGP.alpha=v===1;spawnEnemy({type,v:type==='wolf'?0:v,elite:a?['armored']:null},20);TGP.alpha=false;const e=enemies[enemies.length-1];
          if(type==='wolf'&&v===1){e.b.scale.multiplyScalar(1.35);}e.route=R;e.dist=mid-(nv-1)*.3+v*.6;e.off=a?.2:-.2;e.hp=e.maxHp=1e7;e.spd=.3;moveEnemy(e,0);}
        state='playing';paused=false;speed=1;
        for(let i=0;i<20;i++){for(const e of enemies){e.hp=e.maxHp;}update(.033);updFx(.033);anim(.033,i*.033);}
        const pv=posAt(mid,R),cv=document.createElement('canvas');cv.width=1280;cv.height=1800;const c2=cv.getContext('2d');
        const shot=(zoom,y,h)=>{CAM.px=pv[0]-camTarget.x;CAM.pz=pv[1]-camTarget.z;CAM.zoom=zoom;applyCam();anim(.001,1);renderer.render(scene,camera);const W=renderer.domElement.width,H=renderer.domElement.height;c2.drawImage(renderer.domElement,0,0,W,H,0,y,1280,h);};
        shot(1,0,900);shot(.35,900,900);
        c2.fillStyle='#fff';c2.font='16px sans-serif';c2.fillText(ar+' '+type+' zoom 1 (armoured row = ring markers)',10,20);c2.fillText('zoom .35',10,920);
        state='menu';return cv.toDataURL('image/jpeg',.85);})()`),[ar,type]);
        save(`game-${ar}-${type}.jpg`,d);}}}
  if(MODE==='gal'){const types=(ONLY||'peasant,soldier,rider,raven,ram,wolf').split(',');
    for(const type of types){const d=await page.evaluate(type=>__kk.ev(`(function(){const type='${type}';meta.dex=meta.dex||{};for(let i=0;i<10;i++)meta.dex[type+':'+i]=1;
      state='menu';openGallery();openVar(type);const n=GV.L.length,cv=document.createElement('canvas');cv.width=1280;cv.height=900*Math.min(n,3);const c2=cv.getContext('2d');
      const one=(idx,affs,y)=>{GV.idx=idx;galVarUI();CAM.px=idx*1.9;applyCam();if(affs){while(GV.eIdx!==1)galElite(true);}else galElite(false);galFrame(1);galFrame(1.05);renderer.render(scene,camera);c2.drawImage(renderer.domElement,0,0,renderer.domElement.width,renderer.domElement.height,0,y,1280,900);};
      const out=[];for(let idx=0;idx<n;idx++){cv.height=900;one(idx,0,0);const a=cv.toDataURL('image/jpeg',.8);one(idx,1,0);out.push([a,cv.toDataURL('image/jpeg',.8)]);}
      closeVar(true);closeGallery();return JSON.stringify(out);})()`),type);
      const L=JSON.parse(d);L.forEach(([a,b],i)=>{save(`gal-${type}-v${i}-plain.jpg`,a);save(`gal-${type}-v${i}-arm.jpg`,b);});}}
  if(errs.length)console.log('page errors',errs.join(' | '));
  await browser.close();})().catch(e=>{console.error(e);process.exit(2);});
