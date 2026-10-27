(function(){
/* Visual check helper for the arenas. Load on the dev page: __kk.ev(await (await fetch('/tests/tundra-shots.js')).text())
   __tun.go('tundra') builds that arena's board (seed 777) and starts a run; await __tun.sheet(name,[code,...],cols,{grey}) renders one frame per
   code snippet (each one sets up a view, e.g. "__kk.camXZ(0,0,1)") into one sheet and POSTs it to python _backup/shot_srv.py 8766 as <name>.jpg;
   with grey it also saves <name>-grey.jpg (greyscale and slightly blurred: the squint test).
   __tun.gust(k) holds a gust at strength k (0..1) for the frames; __tun.foes(types,d0) lines foes up on the road;
   __tun.units() places two towers by the road and a column of foes on it, and returns the camera spot for a close-up.
   __tun.V.day / .night / .units are the three standard views (full board by day, by night, units on the road). */
window.__tun={
 go(a,seed){lsSet(KR,null);meta.arenas.snow=1;meta.arenas.tundra=1;meta.seenA.snow=1;meta.seenA.tundra=1;meta.mapIntro=0;meta.notesSeen=NOTES_V;meta.arena=a;state='menu';clearWorld();
  buildMap(seed||777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;return ARENA_BUILT;},
 gust(k){if(typeof TUNW!=='undefined'){TUNW.g=.3+.7*k;if(TUNW.mat)TUNW.mat.uniforms.uG.value=TUNW.g;TUNU.uWG.value=TUNW.g;}if(typeof GUST!=='undefined'){GUST.k=k;GUST.on=k>0?TUN.dur/2:0;}},
 foes(types,d0){for(const e of enemies.slice())removeEnemy(e);enemies=[];const L=[];types.forEach((t,i)=>{spawnEnemy({type:t,v:0},60);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=(d0||6)+i*.7;e.off=(i%3-1)*.22;e.spd=0;moveEnemy(e,0);L.push(e);});return L;},
 units(){const d0=8,L=this.foes(['soldier','peasant','knight','rider','monk','soldier','peasant','rider','raven'],d0);const mid=posAt(d0+2.8,ROUTES[0]);
  let placed=towers.length;const cand=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;let nb=false;for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=r+dr,b=c+dc;if(a>=0&&a<H&&b>=0&&b<W&&grid[a][b]===1)nb=true;}
    if(!nb)continue;const p=tw(c,r);cand.push([(p.x-mid[0])**2+(p.z-mid[1])**2,c,r]);}
  cand.sort((a,b)=>a[0]-b[0]);for(const q of cand){if(placed>=2)break;try{gold+=buildCost(placed?'cannon':'archer');placeTower(placed?'cannon':'archer',q[1],q[2]);placed++;}catch(e){}}
  return [mid[0],mid[1]];},
 /* the land's own lore props, one per free spot away from the road (the board's own props are taken off); returns the spots for close-ups */
 props(a,seed){this.go(a,seed||777);for(const L of LORE)if(L.g.parent)L.g.parent.remove(L.g);LORE.length=0;const ks=LORE_SETS[a]||LORE_KEYS,spots=[];
  for(let r=2;r<H-4&&spots.length<ks.length;r++)for(let c=1;c<W-1&&spots.length<ks.length;c++){let free=true;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const v=grid[r+dr]&&grid[r+dr][c+dc];if(v!==0)free=false;}
    if(!free)continue;const p=tw(c,r);if(spots.some(q=>Math.hypot(q[0]-p.x,q[1]-p.z)<3))continue;spots.push([p.x,p.z]);}
  ks.forEach((k,i)=>{const s=spots[i];if(!s)return;const q={rd:1.5,sc:1.1};const g=loreModel(k,4321+i*7,q);g.position.set(s[0],0,s[1]);g.rotation.y=.4;g.scale.setScalar(q.sc);TERRAIN.add(g);
    LORE.push({k,x:s[0],z:s[1],g,sc:q.sc,read:true,gt:99,line:LORE_D[k].t[0]});});return spots;},
 /* the land's own landmarks (and chests) laid out over the middle of the board for close-ups; returns their spots */
 marks(a,seed){this.go(a,seed||777);for(const L of LMS)if(L.g.parent)L.g.parent.remove(L.g);LMS.length=0;const ks=(MK_SETS[a]||LM_KEYS.slice(0,6)),spots=[];
  ks.forEach((k,i)=>{const x=-4.2+(i%3)*4.2,z=-6+Math.floor(i/3)*4.6;const P=lmModel(k);P.g.position.set(x,0,z);P.g.rotation.y=.3;P.g.scale.setScalar(1.42);TERRAIN.add(P.g);LMS.push({k,c:-1,r:-1,x,z,rot:.3,P,g:P.g,st:0});spots.push([x,z]);});
  const ch=chestModel();ch.g.position.set(0,0,3);ch.g.scale.setScalar(1.45);TERRAIN.add(ch.g);spots.push([0,3]);return spots;},
 V:{day:"meta.dayT=500;anim(.016,1);__kk.camXZ(0,1.5,1.3);",night:"meta.dayT=1500;anim(.016,1);__kk.camXZ(0,1.5,1.3);",
   units:"meta.dayT=500;anim(.016,1);{const m=__tun.units();__kk.camXZ(m[0],m[1],.32);}",unitsN:"meta.dayT=1500;anim(.016,1);{const m=__tun.units();__kk.camXZ(m[0],m[1],.32);}"},
 async sheet(name,views,cols,o){cols=cols||2;o=o||{};const src=renderer.domElement,cw=Math.round(src.width*.5),ch=Math.round(src.height*.5),rows=Math.ceil(views.length/cols);
  const cv=document.createElement('canvas');cv.width=cw*cols;cv.height=ch*rows;const g=cv.getContext('2d');
  for(let i=0;i<views.length;i++){eval(views[i]);for(let k=0;k<3;k++){anim(.016,performance.now()/1000);if(typeof sfAtmos==='function')sfAtmos(.016);updFx(.016);}renderer.render(scene,camera);g.drawImage(src,0,0,src.width,src.height,(i%cols)*cw,Math.floor(i/cols)*ch,cw,ch);}
  const post=(n,c)=>fetch('http://localhost:8766/save?name='+n,{method:'POST',body:c.toDataURL('image/jpeg',.85)});let r=await post(name,cv);
  if(o.grey){const gc=document.createElement('canvas');gc.width=cv.width;gc.height=cv.height;const gx=gc.getContext('2d');gx.filter='grayscale(1) blur(2px)';gx.drawImage(cv,0,0);await post(name+'-grey',gc);}
  return r.status+' '+cv.width+'x'+cv.height;}};
return 'ok';})()
