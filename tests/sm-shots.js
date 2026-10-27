(function(){
/* Scroll mastery frame sheets: one row per mastery level, the same moments after the cast in every row. Load on a dev page:
   __kk.ev(await (await fetch('/tests/sm-shots.js')).text()); await __sms.sheet(name,k,[levels],[t...],{close,cols,crop,seed,arena,set,dx,dz,spread})
   Each row starts a fresh run with a little crowd on the road beside the hero (the target in the middle), sets the scroll's mastery, casts it on the
   target through castScrollNow (so t is exact), steps the game to each t, renders through the game's own path and POSTs the sheet to the shot server
   (localhost:8766). The scroll mastery XP is put back afterwards. */
window.__sms={
 setup(o){lsSet(KR,null);meta.mapIntro=0;meta.arena=o.arena||'plains';state='menu';clearWorld();buildMap(o.seed||777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0],mid=R.len*.5,p=posAt(mid,R);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),d=(q.x-p[0])**2+(q.z-p[1])**2;if(d>2.2&&d<bd){bd=d;best=[c,r];}}
  spawnHero(best[0],best[1]);for(const e of enemies.slice())removeEnemy(e);enemies=[];
  const T=['soldier','knight','rider','peasant','soldier','knight','soldier'],off=o.spread||[-1.13,-.62,-.22,0,.42,.95,1.55];let tgt=null;
  off.forEach((d,i)=>{spawnEnemy({type:T[i%T.length],v:0},30);const e=enemies[enemies.length-1];e.route=R;e.dist=mid+d;e.off=(i%3-1)*.12;e.hp=e.maxHp=1e7;e.armor=0;e.res={};e.spd=.08;moveEnemy(e,0);if(d===0)tgt=e;});
  state='playing';paused=false;speed=0;window.__fz=true;this.tgt=tgt;return tgt;},
 step(sec){const n=Math.round(sec/.0167);for(let i=0;i<n;i++){update(.0167*worldSlow);updFx(.0167);anim(.0167,performance.now()/1000);}},
 frame(){anim(.001,performance.now()/1000);if(typeof SDP!=='undefined'&&SDP.n>0)sdpRender();else renderer.render(scene,camera);},
 async sheet(name,k,levels,times,o){o=o||{};const X=typeof SM_XP!=='undefined'?SM_XP:MAST_XP,sm0=JSON.stringify(meta.smast||{}),src=renderer.domElement,cols=times.length,crop=o.crop||.55;
  const cw=Math.round(src.width*crop*.5),ch=Math.round(src.height*crop*.5),cv=document.createElement('canvas');cv.width=cw*cols;cv.height=ch*levels.length;const g=cv.getContext('2d');const info=[];
  try{for(let r=0;r<levels.length;r++){const L=levels[r],e=this.setup(o);meta.smast=meta.smast||{};if(L)meta.smast[k]=X[L-1];else delete meta.smast[k];
      CAM.px=e.x-camTarget.x+(o.dx||0);CAM.pz=e.z-camTarget.z+(o.dz==null?.3:o.dz);CAM.zoom=o.close||.42;applyCam();
      let eq0=null;if(o.set){meta.arts=meta.arts||{own:{},eq:{},pend:[]};eq0=[(meta.arts.eq[heroU.hero]||[]).slice(),Object.assign({},meta.arts.own)];const ids=ARTS.filter(a=>a.el===o.set).slice(0,3).map(a=>a.id);ids.forEach(id=>meta.arts.own[id]=1);meta.arts.eq[heroU.hero]=ids;ART_V++;AS.k=null;asEl();asTick(.001);}
      this.step(.1);const s=heroStats();castScrollNow(k,heroU,s,[e],s.dmg*smP(k),{src:heroU,el:SPELL_EL[k],anc:false,spell:k});let T=0;
      for(let i=0;i<times.length;i++){this.step(times[i]-T);T=times[i];this.frame();const W0=src.width,H0=src.height,sw=W0*crop,sh=H0*crop,dx=i*cw,dy=r*ch;g.drawImage(src,(W0-sw)/2,(H0-sh)/2,sw,sh,dx,dy,cw,ch);
        const fa=flashA*(typeof SPACE_K!=='undefined'?SPACE_K:1);if(fa>.01){g.globalAlpha=Math.min(1,fa);g.fillStyle=flashCol;g.fillRect(dx,dy,cw,ch);g.globalAlpha=1;}
        g.fillStyle='#000a';g.fillRect(dx,dy,186,20);g.fillStyle='#fff';g.font='bold 13px sans-serif';g.fillText(SPELLS_S[k].n+' M'+L+' t='+times[i]+(o.tag?' '+o.tag:''),dx+6,dy+14);info.push({L,t:times[i],fx:fx.length});}
      if(eq0){meta.arts.eq[heroU.hero]=eq0[0];meta.arts.own=eq0[1];ART_V++;AS.k=null;asEl();}resetCine();updFx(.05);}}
  finally{meta.smast=JSON.parse(sm0);window.__fz=false;speed=1;}
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.88)});return {st:r.status,info};}};
return 'sm shots loaded';})()
