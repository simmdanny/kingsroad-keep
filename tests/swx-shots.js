(function(){
/* v481 visual check for the Swift ribbons and the Giant modifier. Load on the dev page: __kk.ev(await (await fetch('/tests/swx-shots.js')).text()).
   __sw.go(arena) starts a run on a fixed board; __sw.foe(type,affs,dist,off) puts a foe on the first road; __sw.run(sec) steps the game (update, updFx, anim);
   __sw.look(x,y,z,tx,ty,tz) points the camera by hand (side views), __sw.game(x,z,zoom) uses the normal game camera;
   __sw.shot(label) grabs the frame; __sw.sheet(cols) packs the grabbed frames into one jpg data URL (with labels) and clears the list.
   __sw.gal(type,affs,rot) shows the Bestiary page of that unit wearing those modifiers, turned to rot. */
const S=window.__sw={F:[],
 go(a){lsSet(KR,null);for(const k of ['snow','tundra','whitewaste','taiga','highlands'])if(meta.arenas)meta.arenas[k]=1;meta.mapIntro=0;meta.notesSeen=NOTES_V;meta.arena=a||'plains';state='menu';clearWorld();
  buildMap(777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;gold=1e6;meta.dayT=500;this.clean();return ARENA_BUILT;},
 clean(){for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;},
 foe(type,affs,dist,off,v){spawnEnemy({type,v:v||0,elite:affs&&affs.length?affs:null},40);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=dist;e.off=off||0;moveEnemy(e,0);return e;},
 run(sec,dt){dt=dt||1/60;const n=Math.round(sec/dt);for(let i=0;i<n;i++){update(dt);updFx(dt);anim(dt,time);}},
 game(x,z,zm){CAM.yaw=0;__kk.camXZ(x,z,zm);},
 look(x,y,z,tx,ty,tz){this.cam=[x,y,z,tx,ty,tz];},
 side(e,D,h,da){const a=e.g.rotation.y+(da||0),s=e.b.scale.y,y=e.y+e.hitY*.5;this.look(e.x+Math.cos(a)*D*s,y+(h||.25)*s,e.z-Math.sin(a)*D*s,e.x,y,e.z);},
 put(){if(this.cam){const c=this.cam;camera.position.set(c[0],c[1],c[2]);camera.lookAt(c[3],c[4],c[5]);camera.updateMatrixWorld();}},
 shot(label){anim(0.0001,time);this.put();renderer.render(scene,camera);const src=renderer.domElement,c=document.createElement('canvas');c.width=src.width/2;c.height=src.height/2;const g=c.getContext('2d');
  g.drawImage(src,0,0,c.width,c.height);g.font='bold 15px sans-serif';g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,c.width,22);g.fillStyle='#fff';g.fillText(label||'',6,16);this.F.push(c);this.cam=null;},
 sheet(cols){cols=cols||3;const w=this.F[0].width,h=this.F[0].height,rows=Math.ceil(this.F.length/cols),c=document.createElement('canvas');c.width=w*cols;c.height=h*rows;const g=c.getContext('2d');g.fillStyle='#222';g.fillRect(0,0,c.width,c.height);
  this.F.forEach((f,i)=>g.drawImage(f,(i%cols)*w,Math.floor(i/cols)*h));this.F=[];return c.toDataURL('image/jpeg',.82);},
 gal(type,affs,rot,v){meta.dex=meta.dex||{};for(let i=0;i<12;i++)meta.dex[type+':'+i]=1;if(!GAL||!GV||GV.type!==type){openGallery();openVar(type);}if(v!=null){GV.idx=v;galVarUI();}
  const CY=(type==='knight'||type==='monk')?ELITE_CYCLE.filter(c=>!c.includes('armored')):ELITE_CYCLE;const k=CY.findIndex(c=>c.join()===affs.join());GV.eIdx=(k-1+CY.length)%CY.length;galElite(true);
  GV.rot=GV.rot.map(()=>rot||0);GV.items.forEach(it=>it.m.b.rotation.y=rot||0);let t=performance.now()/1000;for(let i=0;i<90;i++){t+=1/60;galFrame(t);}CAM.px=GV.idx*1.9;applyCam();}
};return 'ok';})()
