(function(){
/* Visual check helper for spell effects. Load on the dev build: __kk.ev(await (await fetch('/tests/visual-shots.js')).text())
   then await __save('frostshard',[.3,.5,.7,1],{zoom:.25,focus:'lead'}) renders 4 moments of one cast into a 2x2 sheet and POSTs it
   to a local saver (python _backup/shot_srv.py 8766, writes into _backup/shots/) as <name>.jpg. Works with the Browser pane hidden: frames are stepped and rendered by hand.
   focus: 'lead' (first foe), 'dense' (densest foe), 'hero', 'mid' (between hero and pack). Hero auto-casting is switched off. */
window.__vis={
 setup(n){if(state!=='playing')newGame(1);paused=true;auto=0;lives=1e9;meta.scrAuto=false;for(const e of enemies)removeEnemy(e);enemies=[];fx.slice().forEach(f=>{f.life=0;});updFx(.001);
  meta.owned.aldric=true;meta.equipped='aldric';if(!heroU||heroU.hero!=='aldric'){const p0=posAt(9,ROUTES[0]);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(!heroTileOk('aldric',c,r))continue;const q=tw(c,r),d=(q.x-p0[0])**2+(q.z-p0[1])**2;if(d<bd&&d>1.2){bd=d;best={c,r};}}spawnHero(best.c,best.r);}
  heroU.cd=1e9;const L=[];for(let i=0;i<(n||7);i++){spawnEnemy({type:i%3?'soldier':'peasant'},1);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=8.6+i*.22;e.off=(i%3-1)*.24;e.maxHp=e.hp=1e9;e.spd=0;e.res={};moveEnemy(e,0);L.push(e);}
  this.L=L.sort((a,b)=>b.dist-a.dist);return L.length;},
 cast(k){meta.spells[k]=meta.spells[k]||{lvl:1,hero:'aldric'};heroU.scd={};fireScroll(heroU,k,heroStats(),sortTargets(heroU,this.L.slice()));},
 step(sec){const n=Math.round(sec/.033);for(let i=0;i<n;i++){update(.033);updFx(.033);if(heroU&&heroU.rig)animHero(heroU,.033,time);anim(.033,time);}for(const e of enemies)updBar(e);}};
window.__save=async(k,times,o)=>{o=o||{};__vis.setup(o.n||7);const L=__vis.L,d=densest(L),f=o.focus||'mid',c=f==='lead'?L[0]:f==='hero'?heroU:f==='mid'?{x:(d.x+heroU.x)/2,z:(d.z+heroU.z)/2}:d;
  __kk.camXZ(c.x+(o.dx||0),c.z+(o.dz||0),o.zoom||.3);scene.updateMatrixWorld(true);__vis.step(.1);if(o.pre)o.pre();__vis.cast(k);let tp=0;const urls=[];
  for(const t of times){__vis.step(t-tp);tp=t;urls.push(__kk.snap());}
  const imgs=await Promise.all(urls.map(u=>new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.src=u;})));const W0=imgs[0].naturalWidth,H0=imgs[0].naturalHeight,cw=Math.round(W0*(o.crop||.6)),ch=Math.round(H0*(o.crop||.6)*.66);
  const cv=document.createElement('canvas');cv.width=cw*2;cv.height=ch*2;const g=cv.getContext('2d');
  imgs.forEach((im,i)=>{const dx=(i%2)*cw,dy=Math.floor(i/2)*ch;g.drawImage(im,(W0-cw)/2,(H0-ch)/2,cw,ch,dx,dy,cw,ch);g.strokeStyle='#000';g.lineWidth=2;g.strokeRect(dx,dy,cw,ch);g.fillStyle='#000a';g.fillRect(dx,dy,150,20);g.fillStyle='#fff';g.font='13px sans-serif';g.fillText(k+' '+times[i]+'s',dx+5,dy+14);});
  const r=await fetch('http://localhost:8766/save?name='+(o.name||k),{method:'POST',body:cv.toDataURL('image/jpeg',.9)});return await r.text();};
return 'visual shots loaded';})()
