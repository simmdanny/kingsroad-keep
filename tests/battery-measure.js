/* Battery measurement harness (Battery saver release; not in run-all). Load on the dev page: (0,eval)(await (await fetch('/tests/battery-measure.js')).text());
   __bm.setup(wave) starts a run (newGame) with 10 towers next to the road and the hero, and calls that wave + 1;
   await __bm.run({hz,secs,warm}) takes the game's requestAnimationFrame over with a virtual display of hz ticks a second, paced in real time
   (a hidden pane fires no requestAnimationFrame at all, so it starts the loop by hand), and times every frame that does work: GPU time
   (EXT_disjoint_timer_query_webgl2 around the whole frame) and CPU time; returns fps, ms per frame and ms per second of play.
   For a phone-sized 2x canvas use the Browser pane's resize_window 430x860 and reload. Keep each call under the 45 s tool limit. */
window.__bm={
  setup(wv){return __kk.ev(`(()=>{newGame(1);gold+=1e7;const types=['archer','cannon','mage','frost','ballista','storm','catapult','lantern','alchemist','obelisk'].filter(k=>unlocked(k)||true);
    let placed=0;const cand=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<H&&cc>=0&&cc<W&&grid[rr][cc]===1)n++;}if(n)cand.push([c,r,n]);}
    cand.sort((a,b)=>b[2]-a[2]||a[1]-b[1]||a[0]-b[0]);const pick=[];for(const q of cand){if(pick.length>=10)break;if(pick.every(p=>Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])>=2))pick.push(q);}
    pick.forEach((q,i)=>{const ty=types[i%types.length];placing={type:ty};try{if(placeTower(ty,q[0],q[1],{}))placed++;}catch(e){}});placing=null;
    if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}
    wave=${wv|0};callWave();return 'placed '+placed+' hero '+(heroU?meta.equipped:'-')+' wave '+wave+' state '+state;})()`);},
  async run(o){o=Object.assign({hz:60,secs:5,warm:1},o||{});const gl=__kk.ev('renderer.getContext()'),ex=gl.getExtension('EXT_disjoint_timer_query_webgl2');
    const hasBat=__kk.ev("typeof BAT!=='undefined'");let cb=null;const raf0=window.requestAnimationFrame;window.requestAnimationFrame=f=>{cb=f;return 1;};
    await new Promise(r=>setTimeout(r,60));if(!cb)cb=__kk.ev('frame');/* a hidden pane fires no requestAnimationFrame at all: start the loop by hand */
    const rec={cpu:[],q:[],calls:[],tris:[]};let measuring=false;
    window.__bmWrap=F0=>function(now){if(!measuring)return F0(now);const q=gl.createQuery();gl.beginQuery(ex.TIME_ELAPSED_EXT,q);const c0=performance.now();F0(now);const c1=performance.now();gl.endQuery(ex.TIME_ELAPSED_EXT);
      rec.q.push(q);rec.cpu.push(c1-c0);const inf=__kk.ev('renderer.info.render');rec.calls.push(inf.calls);rec.tris.push(inf.triangles);};
    if(hasBat)__kk.ev('window.__bmF0=BAT.frame0;BAT.frame0=__bmWrap(BAT.frame0)');else __kk.ev('window.__bmF0=frame;frame=__bmWrap(frame)');
    const iv=1000/o.hz,start=performance.now(),total=Math.round((o.warm+o.secs)*o.hz),warmN=Math.round(o.warm*o.hz);let ticks=0,err=null;
    for(let i=0;i<total;i++){const tgt=start+i*iv;let d=tgt-performance.now();if(d>1)await new Promise(r=>setTimeout(r,d-.5));while(performance.now()<tgt){}
      if(i===warmN)measuring=true;const f=cb;cb=null;if(!f){err='loop lost at tick '+i;break;}try{f(tgt);}catch(e){err=e.message;break;}if(measuring)ticks++;}
    measuring=false;if(hasBat)__kk.ev('BAT.frame0=window.__bmF0');else __kk.ev('frame=window.__bmF0');window.requestAnimationFrame=raf0;if(cb)raf0(cb);
    let gpu=[],disj=false;for(let k=0;k<200;k++){await new Promise(r=>setTimeout(r,20));if(rec.q.every(q=>gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)))break;}
    disj=!!gl.getParameter(ex.GPU_DISJOINT_EXT);for(const q of rec.q){gpu.push(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)?gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6:NaN);gl.deleteQuery(q);}
    const sum=a=>a.reduce((x,y)=>x+y,0),avg=a=>a.length?sum(a)/a.length:0,med=a=>{const b=a.filter(x=>!isNaN(x)).sort((x,y)=>x-y);return b.length?b[b.length>>1]:NaN;};
    const n=rec.cpu.length,secs=ticks/o.hz;
    return {err,disjoint:disj,hz:o.hz,secs:+secs.toFixed(2),ticks,frames:n,fps:+(n/secs).toFixed(1),gpuMsPerFrame:+avg(gpu.filter(x=>!isNaN(x))).toFixed(2),gpuMedian:+med(gpu).toFixed(2),
      gpuMsPerSec:+(sum(gpu.filter(x=>!isNaN(x)))/secs).toFixed(1),cpuMsPerFrame:+avg(rec.cpu).toFixed(2),cpuMsPerSec:+(sum(rec.cpu)/secs).toFixed(1),
      drawCalls:Math.round(avg(rec.calls)),triangles:Math.round(avg(rec.tris)),buf:__kk.ev('(()=>{const v=renderer.getDrawingBufferSize(new THREE.Vector2());return v.x+"x"+v.y})()'),
      pr:__kk.ev('renderer.getPixelRatio()'),shadows:__kk.ev('renderer.shadowMap.enabled'),state:__kk.ev('state+(paused?" paused":"")'),foes:__kk.ev('enemies.length'),wave:__kk.ev('wave')};}};
'ok'
