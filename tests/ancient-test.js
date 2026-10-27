(function(){
/* v301/v302: a mythic scroll (the Aeon Dial) and two ancient domains (Abyssal Genesis with the hero on its anchor, the Eldritch Tree, never on a road).
   Run on the dev page: __kk.ev(await (await fetch('/tests/ancient-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),K=['abyss','aeon','firsttree'];
/* the spell checks run on board 777 at board version 5 (two roads), the layout they were written for; v333 gives the Kingsroad one road */
const go=a=>{lsSet(KR,null);meta.arena=a||'plains';state='menu';clearWorld();{const gv=MAP_GV;MAP_GV=5;try{buildMap(777);}finally{MAP_GV=gv;}}MAP.fresh=true;newGame(1);auto=0;lives=1e9;const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;};
const foes=(n,hp,boss)=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];const L=[];for(let i=0;i<n;i++){spawnEnemy({type:i%2?'knight':'soldier',v:0},60);const e=enemies[enemies.length-1];e.route=ROUTES[i%ROUTES.length];e.dist=4+i*.9;e.off=0;
  e.hp=e.maxHp=hp||1e6;e.armor=0;e.res={};e.spd=.5;moveEnemy(e,0);L.push(e);}return L;};
const run=s=>{for(let i=0;i<s/.05;i++){update(.05);updFx(.05);}};
const cast=k=>{heroU.anim={k,t:0,d:ANIM_D[k]};const n=scene.children.length;castSN0(k);return scene.children.length>n?scene.children[scene.children.length-1]:null;};
const towerBy=()=>{let best=null,bd=1e9;const e=enemies[0];for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const p=tw(c,r),d=(p.x-e.x)**2+(p.z-e.z)**2;if(d<bd&&d>1){bd=d;best=[c,r];}}gold+=buildCost('archer');placeTower('archer',best[0],best[1]);return towers[towers.length-1];};
try{
  /* ---- registries ---- */
  ok('Abyssal Genesis and the Eldritch Tree are ancient, the Aeon Dial is mythic',SPELLS_S.abyss.r==='ancient'&&SPELLS_S.aeon.r==='mythic'&&SPELLS_S.firsttree.r==='ancient');
  ok('the tree is called the Eldritch Tree everywhere',SPELLS_S.firsttree.n==='The Eldritch Tree'&&!/First Tree/.test(SPELLS_S.firsttree.d+SPELL_FX.firsttree+NOTES_HTML));
  ok('all three are global scrolls with their own text',K.every(k=>SPELLS_S[k].global&&SPELLS_S[k].d.length>150&&SPELL_FX[k].length>80));
  ok('all three are in the scroll list, which stays sorted by rarity',K.every(k=>SCROLL_IDS.includes(k))&&SCROLL_IDS.every((k,i)=>!i||RB[SPELLS_S[SCROLL_IDS[i-1]].r].i<=RB[SPELLS_S[k].r].i));
  ok('elements: ice, light, nature (the Eldritch Tree is nature since v355)',SPELL_EL.abyss==='ice'&&SPELL_EL.aeon==='light'&&SPELL_EL.firsttree==='nature');
  ok('each has a hero pose, an icon, scroll art and a cast',K.every(k=>ANIM_D[k]>15&&typeof POSES[k]==='function'&&SIG[k]&&SPI[k]&&typeof NSP[k]==='function'));
  ok('the poses run start to end without NaN',K.every(k=>[0,.1,.5,.9,1].every(f=>Object.values(POSES[k](f)).every(v=>isFinite(v)))));
  /* ---- Abyssal Genesis ---- */
  go();let L=foes(8);const rootA=cast('abyss');
  {const c=$('#ancCard');ok('ancient: the OLDER THAN TIME card, time stops, parchment',c&&c.classList.contains('on')&&c.textContent.includes('OLDER THAN TIME')&&/sepia/.test(renderer.domElement.style.filter)&&worldSlow<.1);}
  worldSlow=1;slowT=0;
  ok('the domain is live',ANC.on&&ANC.live.abyss&&ANC.top==='abyss');
  {const H=heroU,x0=H.x,z0=H.z;run(2);ok('the hero sits on the anchor, high above the field',ANC.seat&&ANC.seat.H===H&&H.g.position.y>2.3&&H.sitA>.95&&Math.abs(H.g.position.x-x0)<1e-6,H.g.position.y.toFixed(2)+' sit '+H.sitA.toFixed(2));
    ok('while seated it keeps casting and stays put',heroCasting(H));H.dest={x:x0+2,z:z0};run(1);ok('a move order is ignored while it sits',H.x===x0&&H.z===z0&&!H.dest);
    {const a=root=>root&&root.children.some(c=>c.isGroup&&c.children.some(q=>q.isGroup&&q.children.length>40));ok('the anchor, its chain and the sea life are in the scene',a(rootA),rootA&&rootA.children.length);}}
  run(2);ok('60% slow on every foe once the sea is up',Math.abs(ancF(L[0])-.4)<.02,ancF(L[0]).toFixed(3));
  {const h=L.map(e=>e.hp);run(2);ok('every foe drowns',L.every((e,i)=>e.dead||e.hp<h[i]));}
  ok('the light turns to the deep sea',ANC.L.abyss&&ANC.L.abyss.k>.9);
  {let err=null;try{anim(.016,performance.now()/1000);renderer.render(scene,camera);}catch(x){err=x.message;}ok('it renders mid-cast',!err,err);}
  {const live=ANC.live.abyss,T0=live.T;cast('abyss');ok('casting it again while it runs extends it',ANC.live.abyss===live&&live.T<=Math.max(4.5,T0)&&live.T<=T0+1e-6,T0.toFixed(1)+'>'+live.T.toFixed(1));}
  {const T=ANC.live.abyss.T;run(20-T+.1);let units=0;const hit=new Set(),pe=pushE;pushE=function(e,u){const r=pe(e,u);if(r>0){units+=r;hit.add(e);}return r;};try{run(2.4);}finally{pushE=pe;}
    ok('the backwash sweeps the foes back (within their stun budget)',hit.size>=L.length/2&&units>L.length*.5,hit.size+' foes, '+units.toFixed(1)+' tiles');}
  ok('the hero jumps down after the backwash',!ANC.seat&&Math.abs(heroU.g.position.y-gy(heroU.x,heroU.z))<1e-3&&heroU.sitA<.5,heroU.g.position.y.toFixed(2));
  run(3);ok('it ends cleanly: no domain left, no slow, its objects gone',rootA&&!ANC.on&&!Object.keys(ANC.fs).length&&!ANC.live.abyss&&ancF(L[0])===1&&!rootA.parent);
  anim(.016,performance.now()/1000);ok('the day light is back',hemi.color.equals(HEMI_C0)&&sun.position.clone().sub(sun.target.position).distanceTo(DAYC.off)<1e-3);
  /* ---- the Aeon Dial ---- */
  go();L=foes(8);const tw0=towerBy();const r0t=tStats(tw0).rate;cast('aeon');
  run(2);ok('the dial is still winding: towers not faster yet',Math.abs(tStats(tw0).rate/r0t-1)<1e-6);
  run(2);ok('while it turns, towers strike 20% faster',Math.abs(tStats(tw0).rate/r0t-1.2)<1e-3,(tStats(tw0).rate/r0t).toFixed(3));
  run(3.4);ok('one full sweep ages every foe it passes',L.filter(e=>!e.dead).every(e=>e.ageS>0),L.map(e=>e.ageS||0).join(','));
  ok('aged foes are slower',L.every(e=>e.dead||ancF(e)<1));
  ok('each sweep hits for 350% (v340)',[...document.scripts].some(q=>q.textContent.includes("hurt(e,PW*3.5,'magic',o)"))&&/350%/.test(SPELL_FX.aeon));
  {const c=document.getElementById('ancCard'),b=document.getElementById('bottom');ok('its cast card sits under the tower panel (v340)',!!c&&!!b&&+getComputedStyle(c).zIndex<+getComputedStyle(b).zIndex,c&&getComputedStyle(c).zIndex);}
  run(6.6);ok('ageing stops at 40%',L.every(e=>e.dead||(e.ageS<=.4+1e-9)),Math.max(...L.map(e=>e.ageS||0)));
  {const B=L[0],F=L[1];B.boss=true;B.hp=B.maxHp*.15;F.hp=F.maxHp*.15;const T=ANC.live.aeon.T;run(AEON_ACT[1]-T+.2);
    ok('midnight: a weak foe crumbles to dust, a boss does not',F.dead&&!B.dead,F.dead+'/'+B.dead);B.boss=false;
    ok('midnight clears the ageing',L.every(e=>!e.ageS));}
  ok('towers are back to their own speed',Math.abs(tStats(tw0).rate/r0t-1)<1e-6);
  run(4);ok('the dial ends cleanly',!ANC.on&&!ANC.live.aeon&&!Object.keys(ANC.fs).length);
  /* ---- the First Tree ---- */
  go();L=foes(8);lives=100;{const c0=$('#ancCard');if(c0)c0.classList.remove('on');}cast('firsttree');
  {const c=$('#ancCard');ok('ancient: the OLDER THAN TIME card, time stops, the world turns to parchment',c&&c.textContent.includes('OLDER THAN TIME')&&/sepia/.test(renderer.domElement.style.filter)&&worldSlow<.1);}
  run(5.5);ok('roots tangle every road: 30% slow',Math.abs(ancF(L[0])-.7)<.02,ancF(L[0]).toFixed(3));
  {const h=L.map(e=>e.hp);run(1.3);ok('the roots burst under the foes, bind and drink them',L.some((e,i)=>e.hp<h[i]&&e.stunT>0),L.map(e=>(e.stunT||0).toFixed(1)).join(','));}
  {const T=ANC.live.firsttree.T;run(20-T+.2);ok('it blooms and mends the keep: +3 lives',lives===103,lives);}
  run(3.5);ok('the Tree ends cleanly',!ANC.on&&!ANC.live.firsttree&&!Object.keys(ANC.fs).length);
  /* ---- the Eldritch Tree never stands on a road, wherever the player is looking ---- */
  {const bad=[];let n=0;const FOOT=2.3;for(const a of['plains','snow','tundra'])for(const sd of[777,4242,90210]){lsSet(KR,null);meta.arena=a;state='menu';clearWorld();buildMap(sd);MAP.fresh=true;newGame(1);auto=0;
      const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);state='playing';paused=false;speed=0;window.__fz=true;
      for(const pz of[-10,-4,2,8])for(const px of[-4,0,4]){__kk.camXZ(px,pz,.5);const r=cast('firsttree');n++;const tr=r&&r.children.find(c=>c.isGroup&&c.children[0]&&c.children[0].material&&c.children[0].material.vertexColors);
        if(!tr){bad.push(a+sd+':no trunk');resetCine();updFx(.05);continue;}const x=tr.position.x,z=tr.position.z;
        for(let rr=0;rr<H;rr++)for(let c=0;c<W;c++){if(grid[rr][c]!==1)continue;const p=tw(c,rr),dx=Math.max(0,Math.abs(p.x-x)-.5),dz=Math.max(0,Math.abs(p.z-z)-.5);if(dx*dx+dz*dz<FOOT*FOOT-1e-6)bad.push(a+sd+' '+x.toFixed(1)+','+z.toFixed(1));}
        resetCine();updFx(.05);}}
    ok('the Eldritch Tree never stands on a road ('+n+' casts over 9 boards and 12 views)',!bad.length,bad.slice(0,4).join(' | '));}
  /* ---- all three at once, then a reset mid-cast ---- */
  go();L=foes(8);const R3=[cast('abyss'),cast('aeon'),cast('firsttree')];run(6);
  ok('three domains can run together; the newest takes the light',ANC.live.abyss&&ANC.live.aeon&&ANC.live.firsttree&&ANC.top==='firsttree');
  ok('their slows stack',Math.abs(ancF(L[0])/(L[0].ageS?1-L[0].ageS:1)-.4*.7)<.03,ancF(L[0]).toFixed(3));
  {let err=null;try{anim(.016,performance.now()/1000);renderer.render(scene,camera);}catch(x){err=x.message;}ok('all three render together',!err,err);}
  resetCine();updFx(.05);updFx(.05);ok('a reset mid-cast takes everything away',!ANC.on&&!Object.keys(ANC.fs).length&&!Object.keys(ANC.L).length&&R3.every(r=>r&&!r.parent)&&!renderer.domElement.style.filter);
  ok('and the ageing goes with it',L.every(e=>!e.ageS));
  /* ---- each land ---- */
  for(const a of['snow','tundra']){go(a);foes(6);let err=null;try{for(const k of K)cast(k);run(8);anim(.016,performance.now()/1000);renderer.render(scene,camera);run(18);}catch(x){err=x.message;}ok('all three cast and end in '+a,!err&&!ANC.on,err);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{resetCine();window.__fz=false;speed=1;worldSlow=1;slowT=0;state='menu';paused=false;for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ancUnfilter();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
