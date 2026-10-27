(function(){
/* Dimensional Slash (legendary, dark). Run on the dev page: __kk.ev(await (await fetch('/tests/dslash-test.js')).text()) returns [name, ok, detail] rows.
   Puts the account back afterwards. Needs a real viewport (a hidden Browser pane is 0x0: give the tab a size first). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),P=100,TD=DSL.TDMG*P,SP=DSL.SPLIT*P;
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
const lost=e=>e.maxHp-e.hp;
/* a long, nearly straight stretch of the road, and the hero on a free tile in line with its start */
function go(a,seed){lsSet(KR,null);meta.arenas=meta.arenas||{};meta.arenas.snow=meta.arenas.tundra=meta.arenas.whitewaste=1;meta.seenA=meta.seenA||{};meta.seenA.snow=meta.seenA.tundra=meta.seenA.whitewaste=1;meta.mapIntro=0;
  meta.arena=a||'plains';meta.scrAuto=false;meta.spaceCalm=false;state='menu';clearWorld();buildMap(seed||777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0];let best=null;for(let d=1;d<R.len-6;d+=.25){const A=posAt(d,R),B=posAt(d+5,R);let dev=0;for(let k=1;k<10;k++){const p=posAt(d+k*.5,R),t2=k/10,cx=A[0]+(B[0]-A[0])*t2,cz=A[1]+(B[1]-A[1])*t2;dev=Math.max(dev,Math.hypot(p[0]-cx,p[1]-cz));}
    if(dev<.08){best=d;break;}}
  const d0=best==null?2:best,A=posAt(d0,R),B=posAt(d0+5,R),ux=(B[0]-A[0])/5,uz=(B[1]-A[1])/5;
  let hc=null,hb=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),tx=A[0]-ux*1.6,tz=A[1]-uz*1.6,dd=(q.x-tx)**2+(q.z-tz)**2;if(dd<hb){hb=dd;hc=[c,r];}}
  spawnHero(hc[0],hc[1]);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;return{R,d0};}
function foe(R,d,type,o){spawnEnemy(Object.assign({type:type||'soldier',v:0},o||{}),20);const e=enemies[enemies.length-1];e.route=R;e.dist=d;e.off=0;e.hp=e.maxHp=1e7;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
const cast=(list)=>NSP.dslash(heroU,heroStats(),list||enemies.filter(e=>!e.dead),P,{src:heroU,el:'dark',spell:'dslash'});
const onLine=(h,e)=>dslOnLine(e,heroU.x,heroU.z,Math.sin(h.ang),Math.cos(h.ang),h.L,DSL.W);
try{
  /* ---- registries ---- */
  const S=SPELLS_S.dslash;
  ok('Dimensional Slash is a legendary dark scroll with its own text',S&&S.r==='legendary'&&SPELL_EL.dslash==='dark'&&S.cd===45&&S.d.length>200&&/1200%/.test(SPELL_FX.dslash));
  ok('it is in the scroll list, which stays sorted by rarity',SCROLL_IDS.includes('dslash')&&SCROLL_IDS.every((k,i)=>!i||RB[SPELLS_S[SCROLL_IDS[i-1]].r].i<=RB[SPELLS_S[k].r].i));
  ok('it has a pose, an icon, scroll art and a cast',ANIM_D.dslash===2.6&&typeof POSES.dslash==='function'&&SIG.dslash&&SPI.dslash&&typeof NSP.dslash==='function');
  ok('the pose runs start to end without NaN',[0,.05,.3,.44,.5,.7,.9,1].every(f=>Object.values(POSES.dslash(f)).every(v=>isFinite(v))));
  ok('the hero is held for the whole draw and cut (castLock 2.3s)',castLock('dslash')===2.3);
  ok("Aevorian's space-bending bonus covers it",TSP.has('dslash'));
  ok('patch note and changelog entry',(NOTES_V==='bosses-1'?NOTES_HTML.includes('Dimensional Slash'):true)&&CLOG.some(u=>u.t==='Dimensional Slash'&&u.v==='v352'));
  /* ---- the cut ---- */
  let G=go('plains');const L=[];for(let i=0;i<9;i++)L.push(foe(G.R,G.d0+i*.55));const off=foe(G.R,Math.min(G.R.len-1,G.d0+11),'soldier');
  const sh=foe(G.R,G.d0+2.2,'knight',{elite:['shielded']});sh.shield=sh.maxShield=4e5;
  const boss=(()=>{spawnEnemy({type:'ogre',v:0},20);const e=enemies[enemies.length-1];e.route=G.R;e.dist=G.d0+3.3;e.off=0;e.hp=e.maxHp=1e8;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;})();
  const inv=foe(G.R,G.d0+1.1);inv.invis=true;inv.revealT=0;
  const n0=SDP.n,W0=heroU.rig&&heroU.rig.W&&heroU.rig.W.o;let h=cast();const root=scene.children[scene.children.length-1];
  ok('the hero takes the iai stance and faces the cut',heroU.anim&&heroU.anim.k==='dslash'&&Math.abs(Math.atan2(Math.sin(heroU.faceA-h.ang),Math.cos(heroU.faceA-h.ang)))<1e-6);
  run(.6);ok('the hero holds a blade of dark magic (its own weapon put away)',!W0||W0.visible===false);ok('...and keeps casting',heroCasting(heroU));
  run(.75);ok('the held beat: nothing is hurt yet',enemies.every(e=>e.hp===e.maxHp),enemies.map(lost).join(','));
  /* best line by brute force over every direction */
  {let bc=0;for(let i=0;i<720;i++){const a=i/720*Math.PI*2,ux=Math.sin(a),uz=Math.cos(a),LL=dslLen(heroU.x,heroU.z,ux,uz);let c=0;for(const e of enemies)if(!e.dead&&dslOnLine(e,heroU.x,heroU.z,ux,uz,LL,DSL.W))c+=e.boss?3:1;bc=Math.max(bc,c);}
    let mc=0;for(const e of enemies)if(onLine(h,e))mc+=e.boss?3:1;ok('it aims along the line through the most foes',mc===bc&&mc>=6,mc+' of a possible '+bc);}
  ok('the cut runs to the edge of the board',h.L>6,h.L.toFixed(1));
  ok('the warp of space is on',SDP.n===n0+1&&SDP.sl&&SDP.sl.some(q=>q&&q.dsl));
  const onL=enemies.filter(e=>onLine(h,e)),offL=enemies.filter(e=>!onLine(h,e));
  run(.1);/* T 1.45: the split and the first rift tick */
  ok('space splits: every foe on the line takes 1200% (plus the first rift tick)',onL.filter(e=>e!==sh).every(e=>Math.abs(lost(e)-(SP+TD))<1e-6),onL.map(e=>Math.round(lost(e))).join(','));
  ok('foes off the line are untouched',offL.every(e=>lost(e)===0)&&offL.includes(off),offL.length);
  ok('shields are cut away first, the full hit lands',onL.includes(sh)&&sh.shield===0&&Math.abs(lost(sh)-(SP+TD))<1e-6&&!sh.bubble,lost(sh)+' / '+sh.shield);
  ok('a boss on the line is struck too',onL.includes(boss)&&Math.abs(lost(boss)-(SP+TD))<1e-6);
  ok('an invisible foe on the line is cut and revealed',onL.includes(inv)&&lost(inv)>0&&inv.revealT>0);
  ok('the rift slows what is inside by 45%',onL.every(e=>e.slowT>0&&e.slow>=.45-1e-9));
  {const b=onL.map(lost);run(1);const d=onL.map((e,i)=>lost(e)-b[i]);ok('the rift deals 180% per second (a tick of 45% every 0.25s)',d.every(x=>x===d[0])&&Math.abs(d[0]/TD-Math.round(d[0]/TD))<1e-6&&Math.round(d[0]/TD)>=3&&Math.round(d[0]/TD)<=5,d.map(x=>(x/TD).toFixed(2)).join(','));}
  /* a foe that walks into the rift later */
  {let dd=null;for(let d=.5;d<G.R.len;d+=.1){const p=posAt(d,G.R),fk={x:p[0],z:p[1]};if(dslOnLine(fk,heroU.x,heroU.z,Math.sin(h.ang),Math.cos(h.ang),h.L,DSL.W)&&!enemies.some(e=>Math.abs((e.dist||0)-d)<.3)){dd=d;break;}}
    if(dd!=null){off.dist=dd;moveEnemy(off,0);run(.5);ok('a foe that walks into the rift is slowed and shredded',off.slowT>0&&lost(off)>=2*TD-1e-6,lost(off));}else ok('a foe that walks into the rift is slowed and shredded',false,'no free spot on the line');}
  {/* the pose clock only runs in the render loop: set it to where it would be */const A=heroU.anim;run(1);let held=null,free=null;if(A&&A.k==='dslash'){heroU.anim=A;A.t=.3+1.9;held=heroCasting(heroU);A.t=.3+2.1;free=!heroCasting(heroU);heroU.anim=null;}
    ok('the hero is held through the cut and free right after it',held&&free,held+'/'+free);}
  {run(Math.max(0,DSL.T_SPLIT+DSL.RIFT+.2-h.T));const b=onL.map(lost);run(1);ok('the rift seals after 6 seconds: no more damage',onL.every((e,i)=>lost(e)===b[i]));}
  run(1.2);ok('it ends cleanly: nothing left behind, the warp is off, the weapon is back',!root.parent&&SDP.n===n0&&!(SDP.sl||[]).some(q=>q&&q.dsl)&&(!W0||W0.visible)&&!renderer.domElement.style.filter);
  /* ---- the impact frame and the Calm space-bending setting ---- */
  {go('plains');const R=ROUTES[0];for(let i=0;i<5;i++)foe(R,4+i*.5);cast();run(1.45);const f1=renderer.domElement.style.filter;renderer.domElement.style.filter='';resetCine();updFx(.05);
    ok('the split flips the picture to its negative for an instant',/invert/.test(f1),f1);
    go('plains');for(let i=0;i<5;i++)foe(ROUTES[0],4+i*.5);meta.spaceCalm=true;const hh=cast();run(1.45);const f2=renderer.domElement.style.filter;for(let i=0;i<60;i++)spaceStep(.05);run(.05);const amp=(SDP.sl||[]).filter(q=>q&&q.dsl).map(q=>q.amp2)[0]||0;
    ok('Calm space-bending scrolls: no negative frame, a gentle warp',!/invert/.test(f2)&&SPACE_K<.2&&amp>0&&amp<=.44*SPACE_K+1e-6,f2+' K '+SPACE_K.toFixed(2)+' amp '+amp.toFixed(3));for(let i=0;i<60;i++){meta.spaceCalm=false;spaceStep(.05);}meta.spaceCalm=false;resetCine();updFx(.05);}
  /* ---- a reset in the middle of the cast ---- */
  {G=go('plains');for(let i=0;i<6;i++)foe(G.R,G.d0+i*.5);const n1=SDP.n,W1=heroU.rig&&heroU.rig.W&&heroU.rig.W.o;cast();const r2=scene.children[scene.children.length-1];run(2);resetCine();updFx(.05);updFx(.05);
    ok('a reset mid-cast takes everything away',!r2.parent&&SDP.n===n1&&!(SDP.sl||[]).some(q=>q&&q.dsl)&&(!W1||W1.visible)&&!renderer.domElement.style.filter);}
  /* ---- the real cast path: banner, one second, then the cut; the damage report counts it ---- */
  {G=go('plains');const F=[];for(let i=0;i<6;i++)F.push(foe(G.R,G.d0+i*.5));RSTAT=newStat();heroU.scd=heroU.scd||{};meta.spells=meta.spells||{};meta.spells.dslash={lvl:1,hero:heroU.hero};const s2=heroStats(),l2=sortTargets(heroU,F);
    let err=null;try{fireScroll(heroU,'dslash',s2,l2.length?l2:F);run(.9);}catch(x){err=x.message;}const before=F.every(e=>e.hp===e.maxHp);run(1.7);
    ok('cast through the normal path: one second of banner, then the cut lands',!err&&before&&F.some(e=>lost(e)>0),err||F.map(e=>Math.round(lost(e))).join(','));
    ok('its cooldown starts',heroU.scd.dslash>30,heroU.scd.dslash);ok('the damage report counts it',RSTAT.heroBy&&RSTAT.heroBy.dslash>0,JSON.stringify(RSTAT.heroBy||{}));resetCine();updFx(.05);}
  /* ---- every land ---- */
  for(const a of['plains','snow','tundra','whitewaste']){if(!ARENAS[a])continue;let err=null;try{G=go(a);for(let i=0;i<6;i++)foe(G.R,G.d0+i*.5);cast();run(1.5);anim(.016,performance.now()/1000);if(SDP.n>0)sdpRender();else renderer.render(scene,camera);run(7.2);}catch(x){err=x.message;}
    ok('casts, renders and ends in '+a,!err&&SDP.n===0,err||('SDP.n '+SDP.n));}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{resetCine();window.__fz=false;speed=1;worldSlow=1;slowT=0;state='menu';paused=false;renderer.domElement.style.filter='';for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
