(function(){
/* Developer-mode mastery previews (v367): the page's original markup is kept (KK_SRCP) and turned into a preview page that cannot save, the
   mastery card opens a preview panel in developer mode (since v374 also outside it, for what you have), the arena logic (smPvStart / smPvTick: foes walking past, the scroll cast on a
   loop at that mastery, the close camera) run here in the main page, and the scroll masteries' own thresholds (SM_XP). The preview frame
   itself loads asynchronously, so it is not loaded here. Run on the dev page: __kk.ev(await (await fetch('/tests/smprev-test.js')).text()).
   Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,dev0=meta.dev;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  /* ---- the preview page ---- */
  const P=window.KK_SRCP;ok('the original markup is kept at load',!!P&&/<head/i.test(P.head)&&/id="stage"/.test(P.body)&&!!P.me&&/function smPvStart\(/.test(P.me.textContent),P&&(P.head.length+'/'+P.body.length));
  const src=smPvSrc()||'',SC='scr'+'ipt';
  ok('the preview page sets the preview flag and turns off every save before anything runs',src.indexOf('window.SMPREV=1')>0&&src.indexOf('Storage.prototype.setItem=function(){}')>0&&src.indexOf('window.SMPREV=1')<src.indexOf('<'+SC+'>'+P.me.textContent.slice(0,40)));
  ok('and carries the whole game script, closed properly',src.endsWith('</'+SC+'></body></html>')&&src.indexOf(P.me.textContent)>0,src.length);
  /* ---- the mastery card ---- */
  meta.dev=false;meta.smast={};meta.spells.hexspark=meta.spells.hexspark||{lvl:1,hero:null};smOpen('hexspark');let md=document.getElementById('smModal');
  /* v374: outside developer mode only what you have opens a preview (tests/pvown-test.js has the rest) */
  ok('without developer mode an owned scroll with no mastery previews only its picture',!!md&&!md.querySelector('.mst-lvl[data-smpv]')&&!!md.querySelector('.sm-art[data-smpv="0"]'));if(md)md.remove();
  /* v428: published scrolls (Common to Rare) play recorded clips (tests/pvc-test.js); the live preview is for the others. Since v439 every
     scroll with masteries has clips (Epic and Legendary too), so the Comet's are put aside here to show the live preview of a scroll without */
  md.remove();const LK='comet';meta.spells[LK]=meta.spells[LK]||{lvl:1,hero:null};const pvKeep={};
  if(typeof PVC!=='undefined'&&PVC.man&&PVC.man.clips)for(let L=0;L<=5;L++){pvKeep[L]=PVC.man.clips[LK+'-'+L];delete PVC.man.clips[LK+'-'+L];}
  meta.dev=true;smOpen(LK);md=document.getElementById('smModal');const rows=md.querySelectorAll('.mst-lvl[data-smpv]');
  ok('in developer mode every mastery and the picture open a preview',rows.length===5&&[...rows].map(r=>r.dataset.smpv).join('')==='12345'&&md.querySelector('.sm-art[data-smpv="0"]')&&!!md.querySelector('.smpv-hint'));
  rows[2].dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));const box=document.getElementById('smPv'),fr=box&&box.querySelector('iframe');
  ok('hovering a mastery of a scroll without clips shows the live panel with its name and loads the preview page',!!box&&!box.hidden&&/Mastery 3/.test(box.textContent)&&box.textContent.indexOf(SM_D[LK][2].n)>=0&&!!fr&&fr.srcdoc.length>1e6,box&&box.textContent.slice(0,80));
  const r=box.getBoundingClientRect();ok('the panel stays on the screen',r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,[r.left,r.top,r.right,r.bottom].map(Math.round).join(','));
  md.querySelector('.mst-how').dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));ok('moving off the masteries hides it',box.hidden);
  md.remove();smPvDrop();ok('dropping the preview removes its page',!SMPW.fr&&!document.querySelector('#smPv iframe'));
  if(typeof PVC!=='undefined'&&PVC.man&&PVC.man.clips)for(let L=0;L<=5;L++)if(pvKeep[L])PVC.man.clips[LK+'-'+L]=pvKeep[L];
  /* ---- the arena, run here ---- */
  const started=smPvStart('hexspark',3);ok('the preview arena starts at that mastery',started&&SMPV.on&&smLv('hexspark')===3&&state==='playing'&&!!heroU);
  let maxF=0,t=performance.now()/1000;for(let i=0;i<200;i++){update(.05);updFx(.05);t+=.05;anim(.05,t);maxF=Math.max(maxF,enemies.filter(e=>!e.dead&&e.smpv).length);}
  ok('foes keep walking past and the scroll is cast on a loop',maxF>=4&&maxF<=8&&SM.cnt.hexspark>=2,maxF+' foes, '+SM.cnt.hexspark+' casts');
  ok('the foes leave the arena instead of reaching the keep',enemies.every(e=>e.dead||e.dist<=SMPV.d+3.6)&&lives>=1e8);
  const cd=Math.hypot(camera.position.x-heroU.x,camera.position.z-heroU.z);ok('the camera holds close on the hero',cd<8&&camera.position.y<gy(heroU.x,heroU.z)+9,cd.toFixed(2));
  smPvStop();ok('stopping clears it',!SMPV.on&&enemies.length===0);
  /* ---- thresholds ---- */
  ok('scroll masteries have their own thresholds',SM_XP.join(',')==='2000,8000,24000,60000,140000');
  {const keep=MAST_XP.slice();MAST_XP[0]=10;meta.smast={hexspark:500};const l=smLv('hexspark');MAST_XP[0]=keep[0];ok('a building threshold change does not move them',l===0,l);}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{smPvDrop();SMPV.on=false;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;meta.dev=dev0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
