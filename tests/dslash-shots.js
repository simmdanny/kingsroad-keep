(function(){
/* Dimensional Slash frame sheets. Load on the dev page: __kk.ev(await (await fetch('/tests/dslash-shots.js')).text())
   await __ds.sheet(name,[t...],{arena,cols,close}) starts a run (hero beside the road, a column of sturdy foes on it), casts the scroll at P 100,
   steps the game to each time t (seconds after the cast) and renders each frame through the game's own warp pass (so the space split shows),
   flipped to the negative for frames where the impact frame is on; POSTs the sheet to python _backup/shot_srv.py 8766. */
window.__ds={
 setup(a,seed){lsSet(KR,null);meta.arenas=meta.arenas||{};meta.arenas.snow=meta.arenas.tundra=meta.arenas.whitewaste=1;meta.seenA=meta.seenA||{};meta.seenA.snow=meta.seenA.tundra=meta.seenA.whitewaste=1;meta.mapIntro=0;
  meta.arena=a||'plains';state='menu';clearWorld();buildMap(seed||777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0],mid=R.len*.62,p=posAt(mid,R);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),d=(q.x-p[0])**2+(q.z-p[1])**2;if(d>1.2&&d<bd){bd=d;best=[c,r];}}
  spawnHero(best[0],best[1]);for(const e of enemies.slice())removeEnemy(e);enemies=[];
  for(let i=0;i<12;i++){spawnEnemy({type:['soldier','knight','rider','peasant'][i%4],v:0},30);const e=enemies[enemies.length-1];e.route=R;e.dist=mid-5+i*.85;e.off=(i%3-1)*.22;e.hp=e.maxHp=1e7;e.spd=.35;moveEnemy(e,0);}
  {spawnEnemy({type:'knight',v:0,elite:['shielded']},30);const e=enemies[enemies.length-1];e.route=R;e.dist=mid+1.2;e.hp=e.maxHp=1e7;e.shield=5e6;e.maxShield=5e6;e.spd=.35;moveEnemy(e,0);}
  state='playing';paused=false;speed=0;window.__fz=true;
  const pv=posAt(mid,R);CAM.px=pv[0]-camTarget.x;CAM.pz=pv[1]-camTarget.z;CAM.zoom=.62;applyCam();return heroU;},
 step(sec){const n=Math.round(sec/.033);for(let i=0;i<n;i++){update(.033);updFx(.033);anim(.033,performance.now()/1000);}},
 frame(){anim(.001,performance.now()/1000);if(SDP.n>0)sdpRender();else renderer.render(scene,camera);},
 async sheet(name,times,o){o=o||{};this.setup(o.arena,o.seed);if(o.close){CAM.px=heroU.x-camTarget.x;CAM.pz=heroU.z-camTarget.z+.6;CAM.zoom=o.close;applyCam();}
  const src=renderer.domElement,cols=o.cols||3,cw=Math.round(src.width*.5),ch=Math.round(src.height*.5),rows=Math.ceil(times.length/cols);
  const cv=document.createElement('canvas');cv.width=cw*cols;cv.height=ch*rows;const g=cv.getContext('2d');
  const t=heroU,s=heroStats(),L=sortTargets(t,enemies.filter(e=>!e.dead));NSP.dslash(t,s,L.length?L:enemies.slice(),100,{src:t,el:'dark',spell:'dslash'});
  let T=0;const info=[];
  try{for(let i=0;i<times.length;i++){this.step(times[i]-T);T=times[i];this.frame();const inv=(src.style.filter||'').indexOf('invert(1)')===0;
      g.filter=inv?'invert(1) grayscale(1) contrast(1.7)':'none';g.drawImage(src,0,0,src.width,src.height,(i%cols)*cw,Math.floor(i/cols)*ch,cw,ch);g.filter='none';if(inv)src.style.filter='';/* the real game clears it after 95ms of real time */
      g.fillStyle='#fff';g.font='bold 15px sans-serif';g.fillText('t='+times[i]+(inv?' (impact frame)':''),(i%cols)*cw+8,Math.floor(i/cols)*ch+20);
      info.push({t:times[i],sdp:SDP.n,fx:fx.length,hp:enemies.filter(e=>!e.dead).map(e=>Math.round(100-100*e.hp/e.maxHp)).join('/')});}}
  finally{window.__fz=false;speed=1;renderer.domElement.style.filter='';}
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.86)});return {st:r.status,info};}};
return 'dslash shots loaded';})()
