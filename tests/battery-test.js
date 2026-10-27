(function(){
/* Battery saver (meta.battery): at most 30 fps (about 12 in the menus and while paused, 30 again after input), game time kept, pixel ratio 1,
   shadows off, the low-power chip asked for next start; with it off every tick, the pixel ratio, the shadows and the step limit are as before.
   Run on the dev page: __kk.ev(await (await fetch('/tests/battery-test.js')).text()) returns [name, ok, detail] rows. Feeds batGate and the
   frame wrapper made-up tick times (requestAnimationFrame and the old frame are stubbed meanwhile), and puts everything back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);
const b0=meta.battery,sh0=meta.shadows,st0=state,pz0=paused,dpr0=Object.getOwnPropertyDescriptor(window,'devicePixelRatio'),raf0=window.requestAnimationFrame,f0=BAT.frame0,woke0=BAT.woke;
const setDpr=v=>Object.defineProperty(window,'devicePixelRatio',{value:v,configurable:true,writable:true});
const T0=performance.now()+1e7;/* far ahead of any real tick or input */
const ticks=(hz,ms)=>{BAT.t0=-1e9;let n=0;for(let i=0;i*1000/hz<ms;i++)if(batGate(T0+i*1000/hz))n++;return n;};
const play=()=>{state='playing';paused=false;},set=on=>{meta.battery=on;batApply();};
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  /* ---- off: nothing changes ---- */
  set(false);play();
  ok('off: every tick of a 60, 120 and 144 Hz screen draws',ticks(60,1000)===60&&ticks(120,1000)===120&&ticks(144,1000)===144,[ticks(60,1000),ticks(120,1000),ticks(144,1000)]);
  state='menu';ok('off: the menus draw every tick too',ticks(60,1000)===60&&ticks(120,1000)===120);
  state='playing';paused=true;ok('off: and so does the pause screen',ticks(60,1000)===60);play();
  ok('off: the step limit is .05 s everywhere',batDt()===.05&&(state='menu',batDt()===.05));play();
  setDpr(2);batApply();ok('off: pixel ratio min(devicePixelRatio, 2) on a 2x screen',renderer.getPixelRatio()===2&&bsPR()===2,renderer.getPixelRatio());
  setDpr(3);ok('off: and 2 on a 3x one',bsPR()===2);setDpr(2);
  meta.shadows=true;applyShadows();ok('off: shadows follow the Shadows option (on)',renderer.shadowMap.enabled===true&&sun.castShadow===true&&$('#bShadows').textContent==='On');
  meta.shadows=false;applyShadows();ok('off: shadows follow the Shadows option (off)',renderer.shadowMap.enabled===false&&sun.castShadow===false&&$('#bShadows').textContent==='Off');
  meta.shadows=true;applyShadows();
  ok('off: the high-performance chip is asked for',bsPP()==='high-performance');
  ok('the old frame is kept whole, with only its step limit read from the setting',/requestAnimationFrame\(frame\)/.test(String(BAT.frame0))&&/Math\.min\(batDt\(\),\(now-last\)\/1000\)/.test(String(BAT.frame0))&&/renderer\.render\(scene,camera\)/.test(String(BAT.frame0)));
  /* ---- the wrapper: skipped ticks do nothing and only re-request; drawn ones get every millisecond ---- */
  let calls=[],rafs=0;window.requestAnimationFrame=()=>{rafs++;return 0;};BAT.frame0=now=>{calls.push(now);};
  BAT.t0=-1e9;for(let i=0;i<60;i++)frame(T0+i*1000/60);
  ok('off: the wrapper hands all 60 ticks to the old frame and adds no request of its own',calls.length===60&&rafs===0,calls.length+' / '+rafs);
  set(true);play();calls=[];rafs=0;BAT.t0=-1e9;const hz=60,N=120;for(let i=0;i<N;i++)frame(T0+i*1000/hz);
  const gaps=calls.slice(1).map((t,i)=>t-calls[i]);
  ok('on: 2 s of a 60 Hz screen draws 60 frames, the skipped ticks only re-request',calls.length===60&&rafs===60,calls.length+' / '+rafs);
  ok('on: no step is longer than the .05 s limit, so no game time is lost',Math.max(...gaps)<=50&&Math.abs(calls[calls.length-1]-calls[0]-gaps.reduce((a,b)=>a+b,0))<1e-6,Math.max(...gaps).toFixed(1)+' ms');
  calls=[];rafs=0;BAT.t0=-1e9;for(let i=0;i<240;i++)frame(T0+i*1000/120);
  const g2=calls.slice(1).map((t,i)=>t-calls[i]);ok('on: 2 s of a 120 Hz screen draws 60 frames too, steps 25-42 ms',calls.length===60&&Math.min(...g2)>=25&&Math.max(...g2)<=42,calls.length+' '+Math.min(...g2).toFixed(1)+'-'+Math.max(...g2).toFixed(1));
  window.requestAnimationFrame=raf0;BAT.frame0=f0;
  /* ---- on: the cap ---- */
  ok('on: about 30 fps on 60, 90, 120 and 144 Hz screens',[60,90,120,144].every(h=>{const n=ticks(h,3000)/3;return n>=29&&n<=30.4;}),[60,90,120,144].map(h=>(ticks(h,3000)/3).toFixed(1)).join(' '));
  ok('on: a slow device that only reaches 24 fps draws every tick',ticks(24,2000)===48);
  BAT.woke=-1e9;state='menu';ok('on: about 12 fps in the menus',Math.abs(ticks(60,3000)/3-12)<=.7&&Math.abs(ticks(120,3000)/3-12)<=.7,(ticks(60,3000)/3).toFixed(1)+' '+(ticks(120,3000)/3).toFixed(1));
  state='over';ok('on: and on the game-over screen',Math.abs(ticks(60,3000)/3-12)<=.7);
  state='playing';paused=true;ok('on: and while paused',Math.abs(ticks(60,3000)/3-12)<=.7);
  BAT.woke=T0+1e9;ok('on: 30 again in the menus or paused right after input',Math.abs(ticks(60,3000)/3-30)<=.7,(ticks(60,3000)/3).toFixed(1));BAT.woke=-1e9;
  ok('on: the step limit is .1 s in the menus and paused, .05 in battle',batDt()===.1&&(state='menu',batDt()===.1)&&(play(),batDt()===.05));
  const w0=performance.now();window.dispatchEvent(new PointerEvent('pointerdown'));ok('a touch or click wakes it for about 1.2 s',BAT.woke>=w0+1100&&BAT.woke<=performance.now()+1300);BAT.woke=woke0;
  /* ---- on: pixel ratio and shadows ---- */
  setDpr(2);set(false);set(true);const ds=renderer.getDrawingBufferSize(new THREE.Vector2()),cw=renderer.domElement.width;
  ok('on: pixel ratio 1 on a 2x screen, and the canvas is drawn at its CSS size',renderer.getPixelRatio()===1&&bsPR()===1&&ds.x===cw&&Math.abs(cw-innerWidth)<=1,renderer.getPixelRatio()+' '+ds.x+'x'+ds.y+' / '+innerWidth);
  ok('on: the particles are rescaled for it',Math.abs(PSA.mat.uniforms.uScale.value-renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360)))<1e-3);
  ok('on: the hero preview and artifact room follow when they exist',[HPV,AR].every(R=>!R||!R.r||R.r.getPixelRatio()===1),[HPV,AR].map(R=>R&&R.r?R.r.getPixelRatio():'-').join(' '));
  ok('on: shadows off although the Shadows option is on',meta.shadows===true&&shOn()===false&&renderer.shadowMap.enabled===false&&sun.castShadow===false&&$('#bShadows').textContent==='Off');
  $('#bShadows').click();ok('on: tapping Shadows leaves them off and keeps the option',meta.shadows===true&&renderer.shadowMap.enabled===false);
  ok('on: the low-power chip is asked for (from the next start)',bsPP()==='low-power');
  set(false);ok('off again: pixel ratio 2 and shadows back',renderer.getPixelRatio()===2&&renderer.shadowMap.enabled===true&&sun.castShadow===true&&$('#bShadows').textContent==='On');
  /* ---- the setting itself ---- */
  meta.battery=true;ok('switching accounts keeps it',[...document.scripts].some(sc=>/function acctEnter\(m,run\)\{const keep=\{shadows:meta\.shadows,battery:meta\.battery,/.test(sc.textContent)));
  ok('a changed setting is applied on the next tick (an account switch or an imported save)',(()=>{window.requestAnimationFrame=()=>0;BAT.frame0=()=>{};frame(T0+5e6);window.requestAnimationFrame=raf0;BAT.frame0=f0;return BAT.on===true&&renderer.getPixelRatio()===1;})());
  meta.battery=false;$('#bBattery').click();ok('the More tab toggle turns it on and saves it',meta.battery===true&&(lsGet(KM)||{}).battery===true&&$('#bBattery').textContent==='On'&&renderer.getPixelRatio()===1);
  $('#bBattery').click();ok('and off',meta.battery===false&&$('#bBattery').textContent==='Off'&&renderer.getPixelRatio()===2);
  openSettings();const sp=$('#setPop'),row=[...sp.querySelectorAll('[data-set]')].find(b=>/Battery saver/.test(b.parentElement.textContent)),shRow=[...sp.querySelectorAll('[data-set]')].find(b=>/Shadows/.test(b.parentElement.textContent));
  ok('the Settings window has a Battery saver row right after Shadows',!!row&&!!shRow&&+row.dataset.set===+shRow.dataset.set+1&&row.textContent==='Off',row&&row.textContent);
  row.click();const row2=[...$('#setPop').querySelectorAll('[data-set]')].find(b=>/Battery saver/.test(b.parentElement.textContent)),sh2=[...$('#setPop').querySelectorAll('[data-set]')].find(b=>/Shadows/.test(b.parentElement.textContent));
  ok('its button turns it on, and the Shadows row then reads Off',meta.battery===true&&row2.textContent==='On'&&sh2.textContent==='Off');
  row2.click();ok('and off again',meta.battery===false);$('#setPop').classList.remove('on');
  ok('the More tab row sits right after Shadows',$('#bShadows').closest('.box').nextElementSibling===$('#bBattery').closest('.box'));
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;window.requestAnimationFrame=raf0;BAT.frame0=f0;BAT.woke=woke0;BAT.t0=-1e9;
  if(dpr0)Object.defineProperty(window,'devicePixelRatio',dpr0);else delete window.devicePixelRatio;
  meta.shadows=sh0;meta.battery=b0;state=st0;paused=pz0;batApply();applyShadows();saveMeta();}
return JSON.stringify(out);})()
