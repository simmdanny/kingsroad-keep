(async function(){
/* v428 (Simon: "the previes needs to be recorded not happened in realtime when clicked"). Run on the dev page:
   await __kk.ev(await (await fetch('/tests/pvc-test.js')).text()) returns [name, ok, detail] rows.
   Every published scroll mastery (Common, Uncommon, Rare; no mastery and Masteries 1-5) has a recorded clip in previews/ (made by
   tools/previews/record.js); the mastery card plays it in the new panel at once, without starting the live preview's second copy of the
   game; tabs switch clips; masteries you have not reached stay locked outside developer mode; scrolls without clips keep the live preview;
   the clips come from previews/ (the dev page) or GitHub (the published game) and a card fetches its scroll's clips; offline keeps the live
   preview. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta);let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const sp0=JSON.stringify(meta.spells||{}),dev0=meta.dev;
const OPEN=SCROLL_IDS.filter(k=>SM_OPEN.includes(SPELLS_S[k].r));
const close=()=>{const md=$('#smModal');if(md)md.remove();try{smPvDrop();}catch(e){}};
try{
  PVC.man=null;PVC.load=null;pvcMan();if(PVC.load)await PVC.load;const M=PVC.man;
  ok('the clip list is there',!!(M&&M.clips),M&&Object.keys(M.clips).length);
  const miss=[];for(const k of OPEN)for(let L=0;L<=5;L++)if(!pvcHas(k,L))miss.push(k+'-'+L);
  ok('every published scroll has a clip for no mastery and each of its 5 masteries ('+OPEN.length+' scrolls)',OPEN.length>=32&&!miss.length,miss.slice(0,8).join(' '));
  {const gone=[];await Promise.all(Object.keys(M.clips).map(async id=>{const r=await fetch('../previews/'+id+'.mp4',{method:'HEAD'});if(!r.ok)gone.push(id);}));ok('and every clip file exists',!gone.length,gone.join(' '));}
  ok('a clip for an Epic scroll is not there (it keeps the live preview)',!pvcHas('comet',1));
  /* v438: the clips of the scrolls the player owns are fetched into memory in the background */
  {meta.spells.cinders=meta.spells.cinders||{lvl:1,hero:null};for(const L of [0,1,2,3,4,5]){const id='cinders-'+L;if(PVC.urls[id])URL.revokeObjectURL(PVC.urls[id]);delete PVC.urls[id];delete PVC.got[id];}
    PVC.warm=0;pvcWarm();const want=PVC.warmN.filter(id=>/^cinders-/.test(id)).length;for(let i=0;i<60&&!['cinders-0'].every(id=>PVC.urls[id]);i++)await wait(100);
    ok('the clips of every scroll the player owns are fetched into memory in the background',want>=1&&/^blob:/.test(PVC.urls['cinders-0']||''),want+' queued; '+(PVC.urls['cinders-0']||'none'));}
  /* the card in developer mode: hovering a mastery plays its clip, without the live preview's frame */
  meta.dev=true;meta.spells.hexspark=meta.spells.hexspark||{lvl:1,hero:null};close();smOpen('hexspark');
  const md=$('#smModal'),rows=md.querySelectorAll('.mst-lvl');rows[3].dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await wait(150);
  const b=PVC.el,v=b&&b.querySelector('video');{for(let i=0;i<40&&!/^blob:/.test(v.getAttribute('src')||'');i++)await wait(100);}
  ok('hovering Mastery 4 opens the panel with its clip, played from memory (v438)',b&&!b.hidden&&PVC.k==='hexspark'&&PVC.L===4&&(v.getAttribute('src')||'')===pvcUrl('hexspark',4)&&/^blob:/.test(v.getAttribute('src')||''),v&&v.getAttribute('src'));
  ok('without starting a second copy of the game (no preview frame)',!document.querySelector('.smpv-fr')&&!(SMPW.el&&!SMPW.el.hidden));
  ok('it shows the mastery, its text and what the clip sets up',/Mastery IV/.test(b.querySelector('.pvc-ttl b').textContent)&&b.querySelector('.pvc-d').textContent===smDesc('hexspark',3)&&!b.querySelector('.pvc-note').hidden,b.querySelector('.pvc-ttl b').textContent);
  {let t=0;for(let i=0;i<40&&!(v.readyState>=2&&v.currentTime>0);i++){await wait(100);t+=100;}ok('the clip plays at once (no loading)',v.readyState>=2&&v.currentTime>0&&!v.paused,'ready '+v.readyState+' after '+t+' ms');}
  const tabs=b.querySelectorAll('.pvc-tabs button');ok('six tabs: no mastery and Masteries I-V, the shown one lit',tabs.length===6&&tabs[4].classList.contains('on')&&[...tabs].every(x=>!x.disabled));
  tabs[1].click();{for(let i=0;i<40&&!/^blob:/.test(pvcUrl('hexspark',1)||'');i++)await wait(100);}await wait(30);ok('a tab switches the clip and pins the panel',PVC.L===1&&v.getAttribute('src')===pvcUrl('hexspark',1)&&PVC.pin,v.getAttribute('src'));
  /* v438: a clip not in memory yet is never streamed: the panel shows it is loading, then plays it from memory */
  {const id='hexspark-2';if(PVC.urls[id])URL.revokeObjectURL(PVC.urls[id]);delete PVC.urls[id];delete PVC.got[id];pvcShow('hexspark',2,null);const s0=v.getAttribute('src')||'',w0=b.classList.contains('pvc-wait');
    for(let i=0;i<40&&!/^blob:/.test(v.getAttribute('src')||'');i++)await wait(100);
    ok('a clip not in memory yet waits for its download (a loading ring), never streams, then plays from memory',w0&&!/^https?:|\.mp4$/.test(s0)&&/^blob:/.test(v.getAttribute('src')||'')&&!b.classList.contains('pvc-wait'),JSON.stringify([w0,s0,v.getAttribute('src')]));}
  pvcShow('hexspark',1,null);await wait(50);
  md.querySelector('.mst-head').dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await wait(320);ok('a pinned panel stays open when the pointer leaves the masteries',!b.hidden);
  b.querySelector('.pvc-x').click();ok('the close button closes it',b.hidden&&!PVC.pin);
  rows[1].dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await wait(60);md.querySelector('.mst-head').dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await wait(320);
  ok('an unpinned panel closes when the pointer leaves the masteries',b.hidden);
  rows[2].click();await wait(60);ok('a click (a tap) pins it open',!b.hidden&&PVC.pin&&PVC.L===3);rows[2].click();await wait(60);ok('a second click on the same mastery closes it',b.hidden);
  md.querySelector('.sm-art').dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await wait(60);ok('the scroll’s picture shows it with no mastery',!b.hidden&&PVC.L===0&&b.querySelector('.pvc-d').textContent===SPELLS_S.hexspark.d);
  close();await wait(30);ok('closing the card closes the panel',b.hidden);
  /* outside developer mode only the masteries reached can be watched */
  meta.dev=false;meta.smast=meta.smast||{};const sm0=meta.smast.hexspark;meta.smast.hexspark=SM_XP[1];smOpen('hexspark');{const md2=$('#smModal'),r2=md2.querySelectorAll('.mst-lvl');
    r2[1].dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await wait(60);const tb=b.querySelectorAll('.pvc-tabs button');
    ok('outside developer mode: Mastery 2 reached plays, and the tabs past it are locked',!b.hidden&&PVC.L===2&&!tb[2].disabled&&tb[3].disabled&&tb[5].disabled);
    pvcHide(true);r2[3].dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));await wait(60);ok('and an unreached mastery shows nothing',b.hidden);}
  if(sm0===undefined)delete meta.smast.hexspark;else meta.smast.hexspark=sm0;close();meta.dev=true;
  /* a scroll without clips keeps the live preview (its frame is not built here: smPvFrame answers nothing) */
  {const f0=smPvFrame;smPvFrame=()=>null;try{smPvShow('comet',1,null);ok('a scroll without clips (Epic, developer mode) keeps the live preview',b.hidden&&SMPW.el&&!SMPW.el.hidden);smPvHide();
    smPvShow('lantern',1,null,'tower');ok('a building keeps the live preview, even one that shares its key with a scroll (lantern)',pvcHas('lantern',1)&&b.hidden&&SMPW.el&&!SMPW.el.hidden&&SMPW.want&&SMPW.want.kind==='tower');}finally{smPvFrame=f0;smPvHide();}}
  /* where the clips come from: the dev page reads previews/ beside it; opening a card fetches that scroll's clips so they play from memory */
  ok('the dev page reads the clips from previews/ beside it (the published game: jsDelivr, then GitHub)',PVC.base==='../previews/'&&PVC_SRC.length===3&&/jsdelivr\.net\/gh\/simmdanny\/kingsroad-keep@main\/previews\/$/.test(PVC_SRC[1]));
  {for(let L=0;L<=5;L++){const id='thornwhip-'+L;if(PVC.urls[id]){URL.revokeObjectURL(PVC.urls[id]);delete PVC.urls[id];}delete PVC.got[id];}
    meta.spells.thornwhip=meta.spells.thornwhip||{lvl:1,hero:null};smOpen('thornwhip');await Promise.all([0,1,2,3,4,5].map(L=>PVC.got['thornwhip-'+L]));
    ok('opening a scroll\u2019s mastery card fetches its clips, so they play from memory',[0,1,2,3,4,5].every(L=>/^blob:/.test(pvcUrl('thornwhip',L)||'')),pvcUrl('thornwhip',5));close();}
  {const keep={man:PVC.man,load:PVC.load,base:PVC.base};PVC.man=null;PVC.load=null;const f0=window.fetch;window.fetch=()=>Promise.reject(new Error('offline'));
    try{pvcMan();await PVC.load;ok('offline (no clip list) the masteries keep the live preview',!pvcHas('hexspark',1)&&PVC.man===null);}finally{window.fetch=f0;PVC.man=keep.man;PVC.load=keep.load;PVC.base=keep.base;}}
  /* v438 (Simon: "still laggy"): nothing else draws while a clip plays: the map is not drawn behind the menus (they cover it), the menu
     previews under a playing clip wait, and the live preview's copy of the game sleeps while no live preview is showing */
  {const h0=$('#home').hidden;$('#home').hidden=false;const hw=hideWorld();$('#home').hidden=true;const pl=hideWorld();$('#home').hidden=h0;
    pvcShow('hexspark',1,null);let dp=0;const d0=drawPreview;drawPreview=function(){dp++;return d0.apply(this,arguments);};const t0=curTab;curTab='battle';const hh=$('#home').hidden;$('#home').hidden=false;
    await wait(300);drawPreview=d0;curTab=t0;$('#home').hidden=hh;pvcHide(true);
    ok('the map is not drawn behind the menus (they cover it), and drawn in battle',hw&&!pl,JSON.stringify([hw,pl]));
    ok('the battle tab’s map preview waits while a clip plays over it',dp===0,dp+' draws');}
  {const r=await (await fetch(location.href)).text();const n=(r.match(/if\(SMPV\.mode&&!SMPV\.on\)\{last=now;return;\}/g)||[]).length;
    ok('the live preview’s copy of the game sleeps while no live preview shows',n===1&&SMPV.mode===false,n);}
  ok('no errors',errs===0,errs);
}catch(e){ok('threw',false,e.stack);}
finally{console.error=ce;try{close();pvcHide(true);}catch(e){}meta=migrateMeta(JSON.parse(m0));meta.dev=dev0;saveMeta();}
return JSON.stringify(out);})()
