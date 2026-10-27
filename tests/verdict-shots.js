(function(){
/* Piercing Judgment / Piercing Verdict frame sheets. Load on a dev page: __kk.ev(await (await fetch('/tests/verdict-shots.js')).text())
   await __vd.sheet(name,'judgment'|'verdict',[t...],{arena,seed,close,cols,crop}) starts a run (hero beside the road, a column of sturdy foes on it),
   casts the scroll through fireScroll (so the hero's pose plays), steps the game to each time t (seconds after the cast), renders each frame
   through the game's own path and POSTs the sheet to the shot server (python _backup/shot_srv.py 8766). Frames are cropped to the centre. */
window.__vd={
 setup(a,seed){lsSet(KR,null);meta.mapIntro=0;meta.arena=a||'plains';state='menu';clearWorld();buildMap(seed||777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0],mid=R.len*.55,p=posAt(mid,R);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),d=(q.x-p[0])**2+(q.z-p[1])**2;if(d>1.2&&d<bd){bd=d;best=[c,r];}}
  spawnHero(best[0],best[1]);for(const e of enemies.slice())removeEnemy(e);enemies=[];
  for(let i=0;i<12;i++){spawnEnemy({type:['soldier','knight','rider','peasant'][i%4],v:0},30);const e=enemies[enemies.length-1];e.route=R;e.dist=mid-5+i*.85;e.off=(i%3-1)*.22;e.hp=e.maxHp=1e7;e.spd=.35;moveEnemy(e,0);}
  {spawnEnemy({type:'knight',v:0,elite:['shielded']},30);const e=enemies[enemies.length-1];e.route=R;e.dist=mid+1.2;e.hp=e.maxHp=1e7;e.shield=5e6;e.maxShield=5e6;e.spd=.35;moveEnemy(e,0);}
  state='playing';paused=false;speed=0;window.__fz=true;
  const pv=posAt(mid,R);CAM.px=pv[0]-camTarget.x;CAM.pz=pv[1]-camTarget.z;CAM.zoom=.62;applyCam();return heroU;},
 step(sec){const n=Math.round(sec/.0167);for(let i=0;i<n;i++){update(.0167*worldSlow);updFx(.0167);anim(.0167,performance.now()/1000);}},
 frame(){anim(.001,performance.now()/1000);if(SDP.n>0)sdpRender();else renderer.render(scene,camera);},
 cast(k){const t=heroU,had=!!meta.spells[k];if(!had)meta.spells[k]={lvl:1,own:1};t.scd={};t.gcd=0;const s=heroStats(),L=sortTargets(t,inRange(t,s));
  fireScroll(t,k,s,L.length?L:enemies.filter(e=>!e.dead));if(!had)delete meta.spells[k];},
 async sheet(name,k,times,o){o=o||{};this.setup(o.arena,o.seed);let eq0=null;
  if(o.set){/* o.set: an element; its first three artifacts are equipped for the sheet, then the hero's own are put back */
    meta.arts=meta.arts||{own:{},eq:{},pend:[]};eq0=[heroU.hero,(meta.arts.eq[heroU.hero]||[]).slice(),Object.assign({},meta.arts.own),meta.dev];meta.dev=true;const ids=ARTS.filter(a=>a.el===o.set).slice(0,3).map(a=>a.id);
    ids.forEach(id=>meta.arts.own[id]=1);meta.arts.eq[heroU.hero]=ids;ART_V++;AS.k=null;asEl();asTick(.001);if(AS.el!==o.set)throw new Error('the '+o.set+' set did not come on');}if(o.close){CAM.px=heroU.x-camTarget.x+(o.dx||0);CAM.pz=heroU.z-camTarget.z+(o.dz==null?.6:o.dz);CAM.zoom=o.close;applyCam();}
  const src=renderer.domElement,cols=o.cols||4,crop=o.crop||.75,cw=Math.round(src.width*crop*.5),ch=Math.round(src.height*crop*.5),rows=Math.ceil(times.length/cols);
  const cv=document.createElement('canvas');cv.width=cw*cols;cv.height=ch*rows;const g=cv.getContext('2d');
  this.step(.1);this.cast(k);let T=0;const info=[];
  try{for(let i=0;i<times.length;i++){this.step(times[i]-T);T=times[i];this.frame();
      const W0=src.width,H0=src.height,sw=W0*crop,sh=H0*crop,dx=(i%cols)*cw,dy=Math.floor(i/cols)*ch;g.drawImage(src,(W0-sw)/2,(H0-sh)/2,sw,sh,dx,dy,cw,ch);
      const fa=flashA*SPACE_K;if(fa>.01){g.globalAlpha=Math.min(1,fa);g.fillStyle=flashCol;g.fillRect(dx,dy,cw,ch);g.globalAlpha=1;}
      g.fillStyle='#000a';g.fillRect(dx,dy,190,20);g.fillStyle='#fff';g.font='bold 13px sans-serif';g.fillText(k+' t='+times[i]+(o.tag?' '+o.tag:''),dx+6,dy+14);
      info.push({t:times[i],fx:fx.length,hit:enemies.filter(e=>!e.dead&&e.hp<e.maxHp).length});}}
  finally{window.__fz=false;speed=1;if(eq0){meta.arts.eq[eq0[0]]=eq0[1];meta.arts.own=eq0[2];meta.dev=eq0[3];ART_V++;AS.k=null;asEl();asTick(.001);}}
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.88)});return {st:r.status,info};}};
return 'verdict shots loaded';})()
