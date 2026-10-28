(function(){
/* v397 (Simon): see your mastery progress during a run. The button under the top bar (#mpgHud) opens #liveMast, a live panel listing the
   buildings on the board and the hero's scrolls that earn mastery, with the XP earned this run (RSTAT.mx, saved with the run). Run on the dev
   page: __kk.ev(await (await fetch('/tests/mpg-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,si0=scrollItems;
const play=()=>{meta.arena='plains';meta.dev=false;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const spot=(n)=>{for(let r=0;r<H;r++)for(let c=0;c<W;c++){placing={type:'archer'};const v=grid[r][c]===0&&placeValid(c,r);placing=null;if(v&&!n--)return{c,r};}return null;};
const panel=()=>document.getElementById('liveMast'),btn=()=>document.getElementById('mpgHud'),open=()=>!!panel()&&!panel().hidden;
const row=k=>panel()&&panel().querySelector(`[data-mpg="${k}"]`);
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  play();state='playing';meta.mast={archer:1000,cannon:1990};meta.smast={hexspark:500};gold=1e9;
  const UN=SCROLL_IDS.find(k=>SPELLS_S[k].r==='epic'&&SM_D[k]);/* v405, v417: Uncommon and Rare scrolls earn now, so an Epic is the one that does not */for(const k of ['hexspark',UN])meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};
  ok('a new run starts with no mastery XP earned',!RSTAT.mx||(!Object.keys(mpgRun().b).length&&!Object.keys(mpgRun().s).length));
  /* ---- XP earned this run ---- */
  mastGain('archer',500);mastGain('cannon',20);smGain('hexspark',42.5,heroU);smGain(UN,30,heroU);
  ok('building XP is counted for the run and the account',mpgRun().b.archer===500&&meta.mast.archer===1500&&mpgRun().b.cannon===20,JSON.stringify(mpgRun().b));
  ok('scroll XP is counted, only for scrolls that earn it (Common, Uncommon and Rare outside developer mode)',mpgRun().s.hexspark===42.5&&!(UN in mpgRun().s),JSON.stringify(mpgRun().s));
  state='menu';mastGain('archer',99);state='playing';ok('no XP and nothing counted outside a run',mpgRun().b.archer===500&&meta.mast.archer===1500);
  ok('levels reached this run are counted (the cannon passed Mastery 1)',mpgUps()===1,mpgUps());
  /* ---- the button ---- */
  updHud(true);const hb=document.getElementById('hud').getBoundingClientRect();
  ok('the mastery button shows during a run, under the top bar',!!btn()&&btn().getBoundingClientRect().top>=hb.bottom,btn()&&btn().style.top);
  ok('it shows the levels reached this run',btn()&&btn().querySelector('b')&&btn().querySelector('b').textContent==='1');
  {const ah=document.getElementById('artHud');ok('it sits under the artifacts, when they show',!ah||btn().getBoundingClientRect().top>=ah.getBoundingClientRect().bottom);}
  /* ---- the panel ---- */
  const s1=spot(0),s2=spot(3);placeTower('archer',s1.c,s1.r);placeTower('frost',s2.c,s2.r);
  scrollItems=()=>[{k:'hexspark',t:heroU},{k:UN,t:heroU}];
  btn().click();ok('tapping it opens the panel',open()&&btn().classList.contains('on'));
  ok('every building on the board is listed, and one that earned XP this run',!!row('b:archer')&&!!row('b:frost')&&!!row('b:cannon'),[...panel().querySelectorAll('[data-mpg]')].map(r=>r.dataset.mpg).join(','));
  ok('most XP this run first',panel().querySelector('[data-mpg]').dataset.mpg==='b:archer');
  ok('the hero\'s Common scroll is listed, the Epic one is named as not earning yet',!!row('s:hexspark')&&!row('s:'+UN)&&panel().textContent.includes(SPELLS_S[UN].n+': masteries for scrolls above '+smOpenTop())&&smOpenTop()==='Rare');
  {const r=row('b:archer'),seg=r.querySelectorAll('.mpg-bar i');
    ok('a row shows the XP this run, the level and the progress',/\+500 XP this run/.test(r.textContent)&&/Mastery 0/.test(r.textContent)&&/1500 \/ 2000 XP/.test(r.textContent),r.textContent);
    ok('the bar: earlier XP, then this run\'s part glowing (50% + 25%)',seg.length===2&&seg[0].style.width==='50%'&&seg[1].style.width==='25%'&&seg[1].classList.contains('mpg-new'),[...seg].map(i=>i.style.width).join(' + '));
    ok('and the next upgrade',r.textContent.includes('Next: '+MAST_D.archer[0].n));}
  ok('a level reached this run is called out',/Mastery 1 reached this run!/.test(row('b:cannon').textContent)&&!/reached this run/.test(row('b:archer').textContent));
  ok('a building with no XP yet this run says so',/No XP yet this run/.test(row('b:frost').textContent));
  ok('scroll rows: decimals kept for small amounts',/\+42.5 XP this run/.test(row('s:hexspark').textContent)&&/542 \/ 2000 XP/.test(row('s:hexspark').textContent),row('s:hexspark').querySelector('.mpg-main').textContent);
  mastGain('frost',4);mpgRender();ok('it stays live while open',/\+4 XP this run/.test(row('b:frost').textContent));
  /* ---- cards and the damage panel ---- */
  paused=false;row('b:archer').click();const mm=document.getElementById('mastModal');
  ok('a row opens that building\'s mastery card, and the run pauses',!!mm&&paused===true);
  if(mm)mm.querySelector('[data-mx]').click();ok('closing it resumes the run',!document.getElementById('mastModal')&&paused===false);
  row('s:hexspark').click();const sm=document.getElementById('smModal');ok('a scroll row opens its scroll mastery card',!!sm);if(sm)sm.querySelector('[data-smx]').click();paused=true;
  liveDmgToggle(true);ok('opening the damage panel closes the mastery panel',!open()&&liveDmgOpen()&&!btn().classList.contains('on'));
  mpgToggle(true);ok('and the other way round',open()&&!liveDmgOpen());
  {const p=panel().getBoundingClientRect(),b=btn().getBoundingClientRect();ok('the panel opens beside the buttons, not over them',p.right<=b.left,Math.round(p.right)+' vs '+Math.round(b.left));}
  panel().querySelector('[data-mpgx]').click();ok('its close button closes it',!open());
  /* ---- saved with the run ---- */
  saveRun();const sv=lsGet(KR);ok('the XP earned this run is saved with the run',sv&&sv.rstat&&sv.rstat.mx&&sv.rstat.mx.b.archer===500&&sv.rstat.mx.s.hexspark===42.5);
  RSTAT=newStat();loadRun(sv);ok('and comes back when the run is resumed',mpgRun().b.archer===500&&mpgRun().s.hexspark===42.5,JSON.stringify(RSTAT.mx));
  newGame(1);ok('a new run starts again from nothing',!Object.keys(mpgRun().b).length&&!Object.keys(mpgRun().s).length);
  /* ---- leaving the run ---- */
  mpgToggle(true);state='menu';clearWorld();showOverlay('menu');mpgSync();
  ok('back in the menu, the button and the panel are gone',!btn()&&!open());
  ok('and the panel does not open there',mpgToggle(true)===false&&!open());
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;scrollItems=si0;try{for(const id of ['mastModal','smModal'])document.getElementById(id)&&document.getElementById(id).remove();if(liveDmgOpen())liveDmgToggle(false);
  for(const e of enemies.slice())removeEnemy(e);state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');mpgSync();}catch(e){}}
return JSON.stringify(out);})()
