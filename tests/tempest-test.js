(function(){
/* v359: the Primordial Tempest (ancient lightning domain, precise strikes) and its synergy, the Gathering Storm.
   Run on the dev page: __kk.ev(await (await fetch('/tests/tempest-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards.
   Needs a real viewport (a hidden Browser pane is 0x0: give the tab a size first). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),hurt0=hurt;
/* board 777 at board version 5 (two roads), like the other ancient checks */
const go=a=>{lsSet(KR,null);meta.arenas=meta.arenas||{};['snow','tundra','whitewaste','taiga'].forEach(k=>meta.arenas[k]=1);meta.seenA=meta.seenA||{};['snow','tundra','whitewaste','taiga'].forEach(k=>meta.seenA[k]=1);meta.mapIntro=0;
  meta.arena=a||'plains';meta.scrAuto=false;meta.spaceCalm=false;state='menu';clearWorld();{const gv=MAP_GV;MAP_GV=5;try{buildMap(777);}finally{MAP_GV=gv;}}MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;};
const foe=(i,o)=>{spawnEnemy(Object.assign({type:i%2?'knight':'soldier',v:0},o||{}),60);const e=enemies[enemies.length-1];e.route=ROUTES[i%ROUTES.length];e.dist=4+i*.9;e.off=0;e.hp=e.maxHp=1e6;e.armor=0;e.res={};e.spd=.5;moveEnemy(e,0);return e;};
const foes=n=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];const L=[];for(let i=0;i<n;i++)L.push(foe(i));return L;};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}};
const runTo=T=>{const lv=ANC.live.tempest;if(lv&&lv.T<T)run(T-lv.T+.001);};
/* like castSN0, but the hits carry the scroll's name as fireScroll's do (the Gathering Storm and the arc spy look for it) */
const castK=k=>{const t=heroU,s=heroStats(),L=sortTargets(t,enemies.filter(e=>!e.dead));castScrollNow(k,t,s,L,s.dmg,{src:t,el:SPELL_EL[k],anc:SPELLS_S[k].r==='ancient',spell:k});};
const cast=k=>{heroU.anim={k,t:0,d:ANIM_D[k]};const n=scene.children.length;castK(k);return scene.children.length>n?scene.children[scene.children.length-1]:null;};
const P=()=>heroStats().dmg;/* castK casts at the hero's damage */
const lost=e=>e.maxHp-Math.max(0,e.hp);
try{
  /* ---- registries ---- */
  const S=SPELLS_S.tempest;
  ok('the Primordial Tempest is an ancient lightning domain with its own text',S&&S.n==='The Primordial Tempest'&&S.r==='ancient'&&SPELL_EL.tempest==='lightning'&&S.cd===160&&S.global&&S.d.length>300&&/450%/.test(SPELL_FX.tempest)&&/1000%/.test(SPELL_FX.tempest));
  ok('it is in the scroll list, which stays sorted by rarity',SCROLL_IDS.includes('tempest')&&SCROLL_IDS.every((k,i)=>!i||RB[SPELLS_S[SCROLL_IDS[i-1]].r].i<=RB[SPELLS_S[k].r].i));
  ok('it has a pose, an icon, scroll art, a cast and an epithet for the ancient card',ANIM_D.tempest>17&&typeof POSES.tempest==='function'&&SIG.tempest&&SPI.tempest&&typeof NSP.tempest==='function'&&/first sky/.test(ANC_EP.tempest));
  ok('the pose runs start to end without NaN',[0,.05,.12,.2,.5,.8,.82,.85,.9,1].every(f=>Object.values(POSES.tempest(f)).every(v=>isFinite(v))));
  ok('patch note (bosses-1) and changelog entry',(NOTES_V==='bosses-1'?NOTES_HTML.includes('Primordial Tempest')&&NOTES_HTML.includes('Gathering Storm'):true)&&CLOG.some(u=>u.t==='The Primordial Tempest'&&u.v==='v359'));
  {const C=COMBO_BY.gatherstorm;ok('the Gathering Storm is in the Cookbook: the Tempest + any lightning hit',C&&C.ing[0].s==='tempest'&&C.ing[1].e==='lightning'&&COMBOS.includes(C)&&C.d.includes('1.5s'));}
  /* ---- the domain ---- */
  go();const L=foes(10);const boss=L[3];boss.boss=true;boss.hp=boss.maxHp=5e6;const inv=L[6];inv.invis=true;inv.revealT=0;
  const rs=L[8],twin=L[9];rs.res={lightning:.25};rs.route=twin.route=ROUTES[0];rs.dist=twin.dist=2.2;rs.off=-.3;twin.off=.3;moveEnemy(rs,0);moveEnemy(twin,0);
  {const c0=$('#ancCard');if(c0)c0.classList.remove('on');}TPST.dbg=[];const H=heroU,x0=H.x,z0=H.z;const root=cast('tempest');
  {const c=$('#ancCard');ok('ancient: the OLDER THAN TIME card, time stops, parchment',c&&c.classList.contains('on')&&c.textContent.includes('OLDER THAN TIME')&&c.textContent.includes('Primordial Tempest')&&/sepia/.test(renderer.domElement.style.filter)&&worldSlow<.1);}
  worldSlow=1;slowT=0;
  ok('the domain is live and takes the light',ANC.on&&ANC.live.tempest&&ANC.top==='tempest'&&TPST.live===ANC.live.tempest);
  run(1.5);ok('while the storm gathers the hero stands and keeps casting',heroCasting(H)&&Math.abs(H.g.position.y-gy(H.x,H.z))<.05);
  H.dest={x:x0+2,z:z0};run(.5);ok('a move order is ignored',H.x===x0&&H.z===z0&&!H.dest);
  runTo(3.85);/* the crown discharge has rolled over the board; the first precise bolt lands at 3.9 */
  {const g0=gy(H.x,H.z);ok('the crown bolt lifts the hero into the eye of the storm',H.g.position.y-g0>1.2&&ANC.lift&&ANC.lift.H===H,(H.g.position.y-g0).toFixed(2));
    const yaw=Math.atan2(camera.position.x-x0,camera.position.z-z0);ok('it faces the camera',Math.abs(Math.atan2(Math.sin(H.faceA-yaw),Math.cos(H.faceA-yaw)))<1e-6);}
  ok('the discharge reached every foe (200%) and left it Charged',L.every(e=>lost(e)>0&&e.zapT>0),L.map(e=>Math.round(lost(e))).join(','));
  ok('it ignores resistances (a foe that resists lightning loses as much as its twin)',Math.abs(lost(rs)-lost(twin))<1e-6&&lost(rs)>0,Math.round(lost(rs))+' / '+Math.round(lost(twin)));
  ok('invisible foes are seen by the storm',inv.revealT>0);
  ok('every foe is 25% slower',Math.abs(ancF(L[0])-.75)<.02,ancF(L[0]).toFixed(3));
  ok('the light turns violet and dark',ANC.L.tempest&&ANC.L.tempest.k>.9);
  /* precise strikes */
  {let ret=0,lead=0;for(let i=0;i<30&&!(ret&&lead);i++){run(.05);root.traverse(o=>{if(!o.visible)return;if(o.isMesh&&o.material&&o.material.map===tpTex('ret'))ret++;if(o.isLine&&!o.isLineSegments&&o.parent===root)lead++;});}
    ok('a volley shows rune reticles closing on its foes and leaders feeling their way down',ret>0&&lead>0,ret+' / '+lead);}
  runTo(5.2);{const reg=TPST.dbg.filter(d=>!d.fin&&!d.called);ok('the first volley takes the boss first',reg.length>0&&reg[0].e===boss,reg.slice(0,3).map(d=>L.indexOf(d.e)).join(','));}
  {let err=null;try{anim(.016,performance.now()/1000);renderer.render(scene,camera);}catch(x){err=x.message;}ok('it renders mid-cast',!err,err);}
  {const live=ANC.live.tempest,T0=live.T;cast('tempest');ok('casting it again while it rages winds it back',ANC.live.tempest===live&&live.T<=Math.max(4.5,T0)+1e-6,T0.toFixed(1)+' > '+live.T.toFixed(1));}
  let arcs=0;hurt=function(e,a,k,o){if(o&&o.spell==='tempest'&&Math.abs(a-P()*4.5*.35)<1e-6)arcs++;return hurt0.apply(this,arguments);};
  try{runTo(15.4);}finally{hurt=hurt0;}
  {const reg=TPST.dbg.filter(d=>!d.fin&&!d.called),seen=new Set(reg.map(d=>d.e));
    ok('every bolt lands on its foe (none astray, none on bare ground)',reg.length>0&&reg.every(d=>d.d>=0&&d.d<.1),'max '+Math.max(...reg.map(d=>d.d)).toFixed(3)+' of '+reg.length);
    ok('the volleys reach every foe, and grow (many strikes)',seen.size===L.length&&reg.length>=30,seen.size+' foes, '+reg.length+' strikes');
    const per=e=>reg.filter(d=>d.e===e).length,avg=L.filter(e=>e!==boss).reduce((s,e)=>s+per(e),0)/(L.length-1);
    ok('the boss draws the most bolts',per(boss)>=avg,per(boss)+' vs '+avg.toFixed(1));
    ok('each strike is 450% (and the arc 35%)',reg.every(d=>Math.abs(d.dmg-P()*4.5)<1e-6)&&arcs>0,arcs+' arcs');}
  /* the last thunder */
  const al=L.filter(e=>!e.dead);runTo(17.05);
  {const F=TPST.dbg.filter(d=>d.fin);ok('the last thunder strikes every foe on the field (1000%)',al.every(e=>F.some(d=>d.e===e))&&F.every(d=>Math.abs(d.dmg-P()*10)<1e-6),F.length+' of '+al.length);}
  run(.6);{const a0=H.anim;H.anim=null;const free=!heroCasting(H);H.anim=a0;ok('the hero comes down on the last bolt and is free again',Math.abs(H.g.position.y-gy(H.x,H.z))<1e-3&&!ANC.lift&&free,H.g.position.y.toFixed(3));}
  run(3.5);ok('it ends cleanly: no domain, no slow, its objects gone',!ANC.on&&!ANC.live.tempest&&!Object.keys(ANC.fs).length&&!TPST.live&&!TPST.call&&ancF(L[0])===1&&root&&!root.parent);
  anim(.016,performance.now()/1000);ok('the day light is back',hemi.color.equals(HEMI_C0));
  TPST.dbg=null;
  /* ---- the Gathering Storm ---- */
  go();const L2=foes(8);const had=Object.assign({},meta.combos||{});meta.combos=meta.combos||{};delete meta.combos.gatherstorm;TPST.dbg=[];cast('tempest');runTo(5);
  ok("a lightning scroll may break another spell's casting lock while the storm rages",synergyOpen('vael')&&!synergyOpen('frostshard'));
  {const live=ANC.live.tempest,T0=live.T;castK('frostshard');ok('a scroll of another element does not feed it',Math.abs(live.T-T0)<1e-9&&TPST.ext===0);
    castK('staticspark');ok('a lightning scroll feeds it: 1.5s longer, and the synergy is discovered',Math.abs(T0-live.T-1.5)<1e-6&&Math.abs(TPST.ext-1.5)<1e-9&&meta.combos.gatherstorm===1,(T0-live.T).toFixed(2));
    run(1.2);const C=TPST.dbg.filter(d=>d.called);ok('foes its lightning hit are marked and struck by precise bolts (200%)',C.length>=2&&C.every(d=>d.d>=0&&d.d<.1&&Math.abs(d.dmg-P()*2)<1e-6),C.length);
    for(let i=0;i<4;i++){castK('staticspark');run(.1);}ok('it can be fed up to 4.5s more',Math.abs(TPST.ext-4.5)<1e-6,TPST.ext);
    run(2.5);const C2=TPST.dbg.filter(d=>d.called),per=new Map();C2.forEach(d=>per.set(d.e,(per.get(d.e)||[]).concat(d.Tm)));
    ok('each foe is called at most once every 2s',[...per.values()].every(ts=>ts.every((t,i)=>!i||t-ts[i-1]>=2-1e-6)));}
  resetCine();updFx(.05);updFx(.05);run(.05);ok('a reset mid-cast takes everything away',!ANC.on&&!ANC.live.tempest&&!ANC.lift&&!TPST.live&&!renderer.domElement.style.filter&&Math.abs(heroU.g.position.y-gy(heroU.x,heroU.z))<.2);
  ok('...and the synergy is closed again',!synergyOpen('vael')||enemies.some(e=>!e.dead&&e.heldT>0));
  meta.combos=Object.assign(had,{gatherstorm:meta.combos.gatherstorm});TPST.dbg=null;
  /* ---- Calm space-bending scrolls also calms the storm's flashes and shake ---- */
  go();foes(4);meta.spaceCalm=true;cast('tempest');for(let i=0;i<40;i++){run(.05);anim(.05,performance.now()/1000);}ok('with Calm space-bending on, its flashes and shake are calmed',SPACE_K<.3,SPACE_K.toFixed(2));
  resetCine();updFx(.05);meta.spaceCalm=false;for(let i=0;i<40;i++)anim(.05,performance.now()/1000);
  /* ---- every land ---- */
  for(const a of['snow','tundra','whitewaste','taiga']){go(a);foes(6);let err=null;try{cast('tempest');run(8);anim(.016,performance.now()/1000);renderer.render(scene,camera);run(13);}catch(x){err=x.message;}ok('it casts and ends in '+a,!err&&!ANC.on&&!ANC.lift,err);}
  /* ---- power: walk-style at P 100, foes of 20000 health walking at 0.9 (game unpaused, 22s). Measured 2026-10-25: Tempest 43k pack / 7.1k one,
     Abyssal Genesis 54-60k / 6.9-8k, the Eldritch Tree 26k / 3.3k, Infinite Void 64k / 20k (kills it), the Aeon Dial (mythic) 29k / 3.2k ---- */
  {const m=(n)=>{go();for(const e of enemies.slice())removeEnemy(e);enemies=[];const Q=[];for(let i=0;i<n;i++){spawnEnemy({type:'soldier'},1);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=3.6+i*.18;e.off=(i%3-1)*.25;e.maxHp=e.hp=20000;e.spd=.9;e.res={};e.armor=0;e.shield=0;moveEnemy(e,0);Q.push(e);}
      const t={x:posAt(5,ROUTES[0])[0]+1.2,z:posAt(5,ROUTES[0])[1]+.6,topY:1.1,c:0,r:0,scd:{},isTest:true};castScrollNow('tempest',t,{range:3,dmg:100,spellP:100},Q,100,{src:t,el:'lightning',spell:'tempest',anc:true});
      worldSlow=1;slowT=0;run(22);return Q.reduce((s,e)=>s+lost(e),0);};
    const one=m(1),pack=m(8);ok('its power sits in the ancient band (between the Eldritch Tree and Abyssal Genesis)',one>4500&&one<9500&&pack>32000&&pack<58000,Math.round(one)+' one / '+Math.round(pack)+' pack');}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{hurt=hurt0;TPST.dbg=null;resetCine();window.__fz=false;speed=1;worldSlow=1;slowT=0;state='menu';paused=false;for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ancUnfilter();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
