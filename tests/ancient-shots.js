(function(){
/* Ancient domain sheets. Load on the dev page: __kk.ev(await (await fetch('/tests/ancient-shots.js')).text())
   await __an.sheet(name,k,[t,...],{arena,cols}) starts a run (towers by the road, a column of sturdy foes on it, the hero), casts scroll k with the hero,
   steps the game to each time t (seconds after the cast) and renders one frame per time into one sheet, POSTed to python _backup/shot_srv.py 8766. */
window.__an={
 setup(a){__tun.go(a||'plains');__kk.heroAuto(innerWidth/2,innerHeight*.45);const m=__tun.units();
  /* a second column further up the road, so the whole view has foes */
  for(let i=0;i<10;i++){spawnEnemy({type:['soldier','knight','rider','peasant','monk'][i%5],v:0},60);const e=enemies[enemies.length-1];e.route=ROUTES[i%ROUTES.length];e.dist=3+i*1.6;e.off=(i%3-1)*.22;moveEnemy(e,0);}
  for(const e of enemies){e.hp=e.maxHp=4e5;e.spd=e.spd||.6;}
  state='playing';paused=false;speed=1;window.__fz=true;lives=1e9;return m;},
 step(sec){const n=Math.round(sec/.033);for(let i=0;i<n;i++){update(.033);updFx(.033);anim(.033,performance.now()/1000);}},
 async sheet(name,k,times,o){o=o||{};const m=this.setup(o.arena);if(o.cam)eval(o.cam);
  const src=renderer.domElement,cols=o.cols||3,cw=Math.round(src.width*.5),ch=Math.round(src.height*.5),rows=Math.ceil(times.length/cols);
  const cv=document.createElement('canvas');cv.width=cw*cols;cv.height=ch*rows;const g=cv.getContext('2d');
  heroU.anim={k,t:0,d:ANIM_D[k]};castSN0(k);let T=0;const info=[];
  try{for(let i=0;i<times.length;i++){this.step(times[i]-T);T=times[i];anim(.016,performance.now()/1000);renderer.render(scene,camera);
      g.drawImage(src,0,0,src.width,src.height,(i%cols)*cw,Math.floor(i/cols)*ch,cw,ch);g.fillStyle='#fff';g.font='bold 15px sans-serif';g.fillText(k+' t='+times[i],(i%cols)*cw+8,Math.floor(i/cols)*ch+20);
      info.push({t:times[i],fx:fx.length,on:ANC.on,f:+ancF(null).toFixed(2),hp:enemies.filter(e=>!e.dead).map(e=>Math.round(100*e.hp/e.maxHp)).slice(0,4).join('/')});}}
  finally{window.__fz=false;speed=1;}
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.85)});return {st:r.status,info};}};
return 'ancient shots loaded';})()
