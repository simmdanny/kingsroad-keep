(function(){
/* Arena checks (the realm update + Arena 3): boss swap, Frostvale and Greywind Tundra boards and foes, the Greywind gusts, the wave 200 victory,
   runs that know their arena, travel, the Bestiary biome cycle, old saves; since v295 each land's own lore props and breaking stones for 1000 gold; since v296 the cold lands' ice and slow bonus; since v298 up to three tundra gates.
   Run on the dev page: __kk.ev(await (await fetch('/tests/arena-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),yaw0=CAM.yaw;
const go=(a,sd)=>{lsSet(KR,null);meta.arenas.snow=1;meta.arenas.tundra=1;meta.seenA.snow=1;meta.seenA.tundra=1;meta.mapIntro=0;meta.arena=a;state='menu';clearWorld();buildMap(sd||777);MAP.fresh=true;};
const play=(a,sd)=>{go(a,sd);newGame(1);paused=true;auto=0;};
/* the screen point of a world position, for real taps */
const scr=v=>{camera.updateMatrixWorld();const q=v.clone().project(camera),b=renderer.domElement.getBoundingClientRect();return [b.left+(q.x+1)/2*b.width,b.top+(1-q.y)/2*b.height];};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
try{
  go('plains');
  ok('wave 200 boss is the Ophanim',bossFor(200).type==='ophanim',bossFor(200).type);
  ok('waves 250 to 450 are the Wyrmfiend',[250,300,350,400,450].every(w=>bossFor(w).type==='wyrmf'));
  ok('the late rotation has the Ophanim where the Wyrmfiend was',bossFor(270).type==='ophanim'&&bossFor(390).type==='ophanim',bossFor(270).type+'/'+bossFor(390).type);
  ok('wave 500 is still the Seraphim',bossFor(500).type==='seraph');
  ok('wave 200 keeps its health budget',Math.abs(bossFor(200).hpMul*EN.ophanim.hp-23000*1.2)<1);
  /* boards */
  go('plains');const pc=new THREE.Color();TILES.getColorAt(0,pc);const pl=pc.clone();ok('plains board',ARENA_BUILT==='plains'&&pl.g>pl.r,pl.getHexString());
  ok('plains light is the old light',DC_D.k.getHex()===0x8fb4cf,DC_D.k.getHexString());
  go('snow');TILES.getColorAt(0,pc);ok('Frostvale board: snow tiles',ARENA_BUILT==='snow'&&pc.r>.55&&pc.b>pc.r,pc.getHexString());
  ok('Frostvale light',DC_D.k.getHex()===0xa3b6c9,DC_D.k.getHexString());
  {let tops=0,rocks=0,inst=0;TERRAIN.traverse(o=>{if(o.isInstancedMesh&&o!==TILES)inst++;if(o.isMesh&&o.material&&o.material.userData){if(o.material.userData.snowTop)tops++;if(o.material.userData.snow)rocks++;}});
    ok('snow on trees, roofs and rocks without extra meshes',tops>20&&rocks>0&&inst===2,tops+' tops, '+rocks+' rocks, '+inst+' instanced');}
  {const pv=arenaPV();ok('home preview uses the snow palette',pv.snow===true&&pv.g0==='#eaf0f3');}
  /* the Greywind Tundra board */
  ok('the tundra is Arena 3 and playable',ARENAS.tundra.no===3&&!ARENAS.tundra.soon);
  go('tundra');{const lum=c=>.3*c.r+.59*c.g+.11*c.b,free=[],road=[];let i=0;for(let r=0;r<H;r++)for(let c=0;c<W;c++,i++){if(grid[r][c]===0||grid[r][c]===1){TILES.getColorAt(i,pc);(grid[r][c]?road:free).push(pc.clone());}}
    const lf=free.map(lum),lr=road.map(lum),mf=lf.reduce((a,b)=>a+b,0)/lf.length,mr=lr.reduce((a,b)=>a+b,0)/lr.length,dev=Math.max(...lf.map(v=>Math.abs(v/mf-1)));
    ok('tundra board: a muted rust-red moss carpet, mid-dark',ARENA_BUILT==='tundra'&&free.every(c=>c.r>c.g*1.4&&c.r>c.b*1.4)&&mf>.2&&mf<.42,free[0].getHexString()+' L '+mf.toFixed(2));
    ok('buildable tiles are uniform (within 5% brightness per tile)',dev<=.05,(dev*100).toFixed(1)+'%');
    ok('the road is clearly lighter grey gravel',mr>mf*1.6&&road.every(c=>Math.abs(c.r-c.b)<.06),mr.toFixed(2)+' vs '+mf.toFixed(2));}
  ok('tundra light: a low warm sun under a pale blue sky',DC_D.k.getHex()===TUN_LIGHT[0].k&&DC_D.s.r>DC_D.s.b&&DC_D.k.b>DC_D.k.r,DC_D.s.getHexString()+' / '+DC_D.k.getHexString());
  {anim(.016,1);const o=DAYC.off,d=sun.position.clone().sub(sun.target.position);ok('the sun sits half as high in the tundra (long shadows)',Math.abs(d.y/d.length()-(o.y*.5)/new THREE.Vector3(o.x,o.y*.5,o.z).length())<.01,(d.y/d.length()).toFixed(3));}
  {let inst=0,tags=[],wind=0,lich=0,rockCol=true,snowy=0,peb=0,pebHid=0;TERRAIN.traverse(o=>{if(o.isInstancedMesh&&o!==TILES){inst++;tags.push(o.userData.tun);}if(o.userData.tunWind)wind++;
      if(o.isMesh&&o.material&&o.material.userData){if(o.material.userData.lichen&&!o.isInstancedMesh&&o.parent===TERRAIN){lich++;if(!TUN_ROCK.has(o.material.color.getHex()))rockCol=false;}if(o.visible&&(o.material.userData.snowTop||o.material.userData.snow))snowy++;}
      if(o.isMesh&&o.parent===TERRAIN&&o.material&&o.material.color&&TUN_HIDE.has(o.material.color.getHex())){peb++;if(!o.visible)pebHid++;}});
    let lore=0;for(const L of LORE)L.g.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.snow)lore++;});
    ok('decoration as 6 instanced meshes, no wind streaks',inst===6&&wind===0&&['edge','tuft','shrub','rock','spruce','berg'].every(t=>tags.includes(t)),inst+' instanced: '+tags.join(','));
    ok('granite rocks with lichen that keep their colour (spells still find them)',lich>0&&rockCol,lich);ok('no snow anywhere in the tundra',snowy===0&&lore===0,snowy+' / '+lore);
    ok('pebbles and grass tufts are gone from the board',peb>0&&pebHid===peb,pebHid+'/'+peb);
    ok('the tiles wear the tundra ground shader',!!TILES.material.userData.tun);}
  {const near=(c,r)=>[[1,0],[-1,0],[0,1],[0,-1],[0,0]].some(([dc,dr])=>{const a=r+dr,b=c+dc;return a>=0&&b>=0&&a<H&&b<W&&grid[a][b]===1;});const fr=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(grid[r][c]===0)fr.push(1);
    ok('inside the grid only rare details, never on or beside the road',TUND.inner.length<=fr.length*.1&&TUND.inner.every(([c,r])=>grid[r][c]===0&&!near(c,r)),TUND.inner.length+' of '+fr.length+' free tiles');
    const pathEdges=(()=>{let n=0;for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(grid[r][c]===1)for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=r+dr,b=c+dc;if(a>=0&&b>=0&&a<H&&b<W&&grid[a][b]!==1)n++;}return n;})();
    ok('low shrubs soften both edges of the road',TUND.edges>=pathEdges*2&&TUND.edges<=pathEdges*3&&pathEdges>20,TUND.edges+' shrubs on '+pathEdges+' edges');
    {let lane=0;const m=new THREE.Matrix4(),v=new THREE.Vector3();TERRAIN.traverse(o=>{if(o.userData.tun!=='edge')return;for(let j=0;j<o.count;j++){o.getMatrixAt(j,m);v.setFromMatrixPosition(m);const c=Math.round(v.x/TS+OX),r=Math.round(v.z/TS+OZ);
        if(r>=0&&c>=0&&r<H&&c<W&&grid[r][c]===1){const q=tw(c,r);if(Math.max(Math.abs(v.x-q.x),Math.abs(v.z-q.z))<.4)lane++;}}});ok('the edge shrubs keep clear of the foes lane',lane===0,lane);}
    const zTop=tw(0,0).z-.55,zBot=tw(0,H-1).z+.55;let inside=0,total=0,wet=0,bergLand=0;TERRAIN.traverse(o=>{if(!o.isInstancedMesh||!['shrub','rock','spruce','berg'].includes(o.userData.tun))return;const m=new THREE.Matrix4(),v=new THREE.Vector3();
      for(let j=0;j<o.count;j++){o.getMatrixAt(j,m);v.setFromMatrixPosition(m);total++;if(Math.abs(v.x)<W/2+.2&&v.z>zTop&&v.z<zBot)inside++;if(o.userData.tun==='berg'){if(v.x>tunShore(v.z))bergLand++;}else if(v.x<tunShore(v.z))wet++;}});
    ok('shrubs, granite, spruce and icebergs all sit outside the grid',total>800&&inside===0,inside+' inside of '+total);
    ok('the sea lies off the left edge: icebergs in it, nothing else',wet===0&&bergLand===0&&tunShore(0)<-(W/2+1),wet+' on the water, '+bergLand+' bergs ashore');
    let outerVis=0;TERRAIN.children.forEach(o=>{if(o.isGroup&&o.position.y===-1.6&&o.children.length===3&&!o.userData.keep&&o.visible)outerVis++;});ok('the old trees around the board give way to the border',outerVis===0,outerVis);}
  {const keys=Object.keys(TREEM);ok('every board tree is still a tree (they can be cut)',keys.length===TREES.length&&keys.every(k=>TREEM[k].parent&&!TREEM[k].userData.tunShrub),keys.length+'/'+TREES.length);}
  {let hid=0,parts=0;for(const L of LORE)L.g.traverse(o=>{if(o.isMesh){parts++;if(!o.visible)hid++;}});
    ok('the tundra has its own lore props, kept whole (made clean, so the tidy pass leaves them alone)',LORE.length>0&&LORE.every(L=>L.g.userData.bio&&LORE_SETS.tundra.includes(L.k))&&hid===0,LORE.map(L=>L.k).join(',')+'; '+hid+' of '+parts+' hidden');}
  {const pv=arenaPV();ok('home preview uses the tundra palette',pv===TUN_PV&&pv.g0==='#7a3a30'&&!pv.snow);}
  ok('foes get a darker shadow in the tundra',blobMat.opacity>.45,blobMat.opacity);
  {newGame(1);paused=true;const q=(()=>{for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(heroTileOk(meta.equipped,c,r))return{c,r};return null;})();if(q&&spawnHero(q.c,q.r)){tundraAtmos(.016);const hb=TUND.hb;ok('the hero gets a shadow disc on the red ground',hb&&hb.visible&&Math.abs(hb.position.x-heroU.g.position.x)<1e-6,hb&&hb.visible);}
    else ok('the hero gets a shadow disc on the red ground',true,'no hero tile');state='menu';tundraAtmos(.016);ok('the hero disc hides outside a run',!TUND.hb||!TUND.hb.visible);clean();}
  {CAM.zoom=1;applyCam();const f1=scene.fog.far;ok('less haze in the tundra',f1>(CAM.base*2.6+14)*1.5,f1.toFixed(1));}
  {newGame(1);paused=true;gold+=1e4;const k=Object.keys(TUND.deco)[0];if(k){const[c,r]=k.split(',').map(Number),[im,j]=TUND.deco[k][0];
      placeTower('archer',c,r);const m=new THREE.Matrix4(),sv=new THREE.Vector3(),q=new THREE.Quaternion(),pv=new THREE.Vector3();im.getMatrixAt(j,m);m.decompose(pv,q,sv);
      ok('a tower hides the faint detail on its tile',sv.x===0&&!TUND.deco[k],sv.x);clean();state='menu';}else ok('a tower hides the faint detail on its tile',true,'no detail on this map');}
  {go('tundra');newGame(1);paused=true;startPlacing('archer');tundraAtmos(.016);const on=!!(TUND.grid&&TUND.grid.visible),segs=TUND.grid?TUND.grid.geometry.attributes.position.count/2:0;let free=0;for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(grid[r][c]===0)free++;
    cancelPlacing();tundraAtmos(.016);ok('the tile grid shows only while placing',on&&segs===free*4&&!TUND.grid.visible,segs+' lines for '+free+' free tiles');clean();state='menu';}
  /* weather */
  {go('tundra');newGame(1);paused=false;const w0=meta.weather,cnt=w=>{meta.weather=w;PSN.list.length=0;TUNW.acc=0;for(let i=0;i<40;i++)tundraAtmos(.05);return PSN.list.length;};delete meta.weather;updWeatherBtn();
    ok('weather starts on low',wxLevel()==='low'&&$('#bWeather').textContent==='Low');const off=cnt('off'),lo=cnt('low'),hi=cnt('high');
    ok('the drifting leaves follow the weather setting: off, low, high',off===0&&lo>12&&hi>lo*2,off+' / '+lo+' / '+hi);
    {cnt('high');const zT=tw(0,0).z-.55,zB=tw(0,H-1).z+.55;let over=0;for(const q of PSN.list){if(Math.abs(q.x)<W/2+.4)over++;}ok('leaves only drift outside the grid, never over the board',PSN.list.length>0&&over===0,over+' of '+PSN.list.length);}
    const fv=w=>{meta.weather=w;go('snow');PSN.list.length=0;SNOWF.acc=0;for(let i=0;i<20;i++)snowAtmos(.05);return PSN.list.length;};const fo=fv('off'),fl=fv('low'),fh=fv('high');
    ok('Frostvale snow follows it too (low is the old amount)',fo===0&&Math.abs(fl-(meta.spaceCalm?40:75))<=2&&fh>fl,fo+' / '+fl+' / '+fh);
    meta.weather='low';$('#bWeather').click();const a=wxLevel();$('#bWeather').click();const b=wxLevel();$('#bWeather').click();ok('the weather button cycles low, high, off',a==='high'&&b==='off'&&wxLevel()==='low',a+','+b+','+wxLevel());
    meta.weather=w0;updWeatherBtn();clean();state='menu';}
  /* stats and looks */
  const sample=(a,type,w,v)=>{go(a);newGame(1);paused=true;lives=1e9;let best=null;for(let i=0;i<8;i++){spawnEnemy({type,v},w);const e=enemies[enemies.length-1];if(!e.gem&&!e.scroll&&(!best||e.maxHp<best.maxHp))best=e;}
    let snowMats=0,tunMats=0;best.g.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData){if(o.material.userData.snow)snowMats++;if(o.material.userData.tun)tunMats++;}});
    const r={hp:best.maxHp,spd:best.spd,snow:!!best.snow,tun:!!best.tun,mats:snowMats,tmats:tunMats,collar:best.b.children.length,gear:best.b.children.some(c=>c.userData.tunGear),e:best};clean();state='menu';return r;};
  const p1=sample('plains','soldier',60,1),s1=sample('snow','soldier',60,1),t1=sample('tundra','soldier',60,1);
  ok('troops: +15% health in Frostvale',Math.abs(s1.hp/p1.hp-1.15)<.001,(s1.hp/p1.hp).toFixed(4));
  ok('troops: +10% speed in Frostvale',Math.abs(s1.spd/p1.spd-1.1)<.001,(s1.spd/p1.spd).toFixed(4));
  ok('troops wear the snow in Frostvale only',s1.snow&&s1.mats>0&&!p1.snow&&p1.mats===0&&t1.mats===0,s1.mats+' / '+p1.mats+' / '+t1.mats);
  ok('troops get a fur collar',s1.collar===p1.collar+1,s1.collar+' vs '+p1.collar);
  ok('troops: +20% health in the tundra',Math.abs(t1.hp/p1.hp-1.2)<.001,(t1.hp/p1.hp).toFixed(4));
  ok('troops: normal speed in the tundra (between gusts)',Math.abs(t1.spd/p1.spd-1)<.001,(t1.spd/p1.spd).toFixed(4));
  ok('troops wear the tundra there only',t1.tun&&t1.tmats>0&&!p1.tun&&p1.tmats===0&&s1.tmats===0,t1.tmats+' / '+p1.tmats+' / '+s1.tmats);
  ok('tundra troops get a fur mantle',t1.gear&&t1.collar===p1.collar+1&&!p1.gear,t1.collar+' vs '+p1.collar);
  const p2=sample('plains','ogre',60,1),s2=sample('snow','ogre',60,1),t2=sample('tundra','ogre',60,1);
  ok('bosses: +25% health in Frostvale',Math.abs(s2.hp/p2.hp-1.25)<.001,(s2.hp/p2.hp).toFixed(4));
  ok('bosses: +10% speed in Frostvale',Math.abs(s2.spd/p2.spd-1.1)<.001,(s2.spd/p2.spd).toFixed(4));
  ok('bosses: +30% health in the tundra',Math.abs(t2.hp/p2.hp-1.3)<.001,(t2.hp/p2.hp).toFixed(4));
  ok('bosses: normal speed in the tundra',Math.abs(t2.spd/p2.spd-1)<.001,(t2.spd/p2.spd).toFixed(4));
  ok('tundra bosses wear the tundra and a ruff',t2.tmats>0&&t2.gear,t2.tmats);
  const s3=sample('snow','ophanim',200);ok('the Ophanim keeps its look in Frostvale',s3.mats===0&&s3.snow,s3.mats);
  const s4=sample('snow','seraph',500);ok('the Seraphim keeps its look in Frostvale',s4.mats===0,s4.mats);
  const t3=sample('tundra','ophanim',200),t4=sample('tundra','seraph',500);ok('the Ophanim and the Seraphim keep their look in the tundra (stats still apply)',t3.tmats===0&&t4.tmats===0&&!t3.gear&&t3.tun,t3.tmats+'/'+t4.tmats);
  ok('shared materials are never changed',!VCMAT.userData.snow&&!(M(0xaaa497).userData&&M(0xaaa497).userData.snow)&&!VCMAT.userData.tun&&!(M(0xaaa497).userData&&M(0xaaa497).userData.tun));
  {go('snow');newGame(1);paused=true;const types=Object.keys(EN);let bad=[];for(const t of types){try{spawnEnemy({type:t},60);}catch(e){bad.push(t+': '+e.message);}}ok('every foe type spawns in Frostvale',!bad.length&&enemies.length===types.length,bad.join('; ')||enemies.length);clean();state='menu';}
  {go('tundra');newGame(1);paused=true;const types=Object.keys(EN);let bad=[];for(const t of types){try{spawnEnemy({type:t},60);}catch(e){bad.push(t+': '+e.message);}}ok('every foe type spawns in the tundra',!bad.length&&enemies.length===types.length,bad.join('; ')||enemies.length);clean();state='menu';}
  /* the Greywind gusts */
  {go('tundra');newGame(1);paused=false;lives=1e9;ok('a fresh run waits 25 to 35 s for the first gust',GUST.t>=25&&GUST.t<=35&&GUST.n===0&&!GUST.on,GUST.t.toFixed(2));
    for(let i=0;i<20;i++)update(.5);ok('the wind holds while no wave is on the field',GUST.t>=25&&!GUST.warned,GUST.t.toFixed(2));
    spawnEnemy({type:'soldier',v:1},5);const e=enemies[enemies.length-1];e.maxHp=e.hp=1e12;e.spd=0;const t0=GUST.t;let tw=-1,ton=-1,toff=-1,T=0,nextT=0;
    for(let i=0;i<1600&&toff<0;i++){update(.025);T+=.025;if(tw<0&&GUST.warned)tw=T;if(ton<0&&GUST.on>0){ton=T;nextT=GUST.t;}if(ton>=0&&toff<0&&GUST.on<=0)toff=T;}
    ok('the first gust comes when its timer runs out',Math.abs(ton-t0)<.06,ton.toFixed(2)+' vs '+t0.toFixed(2));
    ok('a whistle and the Greywind sign warn 1.5 s before the gust',tw>0&&Math.abs(ton-tw-1.5)<.06,(ton-tw).toFixed(2));
    ok('a gust lasts 4 s',Math.abs(toff-ton-4)<.06,(toff-ton).toFixed(2));ok('the next gust is 25 to 35 s after the last one began',nextT>=25-.06&&nextT<=35,nextT.toFixed(2));
    ok('the first gust of a run is announced once',GUST.told===true&&GUST.n===1);
    GUST.on=2;GUST.k=1;const bo={tun:true,boss:true};ok('in a gust troops run 40% faster and bosses 20%',Math.abs(gustF(e)-1.4)<1e-9&&Math.abs(gustF(bo)-1.2)<1e-9,gustF(e)+' / '+gustF(bo));
    ok('foes from other lands never feel it',gustF({tun:false})===1&&gustF({})===1);
    e.spd=1;e.slowT=0;e.stunT=0;const d0=e.dist;for(let i=0;i<10;i++)moveEnemy(e,.05);const dG=e.dist-d0;GUST.k=0;GUST.on=0;const d1=e.dist;for(let i=0;i<10;i++)moveEnemy(e,.05);const dC=e.dist-d1;
    ok('the gust really moves them 40% further',Math.abs(dG/dC-1.4)<.001,(dG/dC).toFixed(4));
    const pill=()=>{const p=$('#tunPill');return p&&p.classList.contains('on')?(p.classList.contains('warn')?'warn':'gust')+':'+p.textContent:'';};GUST.on=0;GUST.k=0;GUST.warned=false;tundraAtmos(.25);const pC=pill();
    GUST.warned=true;for(let i=0;i<8;i++)tundraAtmos(.25);const gW=TUNW.g,pW=pill();GUST.on=TUN.dur;for(let i=0;i<8;i++)tundraAtmos(.25);const gG=TUNW.g,pG=pill();GUST.on=0;GUST.warned=false;for(let i=0;i<16;i++)tundraAtmos(.25);const pE=pill();
    ok('the wind rises for the warning and the gust, then calms',gW>.7&&gG>.95&&TUNW.g<.36&&TUNU.uWG.value===TUNW.g,[gW,gG,TUNW.g].map(v=>v.toFixed(2)).join(' / '));
    ok('the Greywind sign shows the warning and the gust, then hides',!pC&&/^warn:.*rising/.test(pW)&&/^gust:.*40%/.test(pG)&&!pE,[pC,pW,pG,pE].join(' | '));
    state='menu';tundraAtmos(.25);ok('the sign hides outside a run',!pill());state='playing';
    ok('the developer gust comes after its warning',gustNow()&&GUST.t===TUN.warn&&!GUST.warned);
    resetRun();ok('a new run starts the gust timer again',GUST.n===0&&GUST.t>=25&&GUST.t<=35&&!GUST.on&&!GUST.told);clean();state='menu';
    go('snow');ok('no developer gust outside the tundra',!gustNow());}
  /* the wave 200 victory */
  const toW200=a=>{go(a||'plains');meta.arenas={plains:1};meta.seenA={plains:1};meta.mapIntro=0;meta.wonA={};newGame(1);paused=false;lives=1e9;wave=199;nextQ=buildWave(200);callWave();
    for(let i=0;i<3000&&spawners.length;i++){update(.05);updFx(.05);}};
  toW200();ok('wave 200 is the Ophanim wave',wave===200&&enemies.some(e=>e.type==='ophanim'&&!e.dead));
  {const w0=wave;callWave();ok('wave 201 cannot be called while wave 200 is undecided',wave===w0&&waveLocked(),wave);}
  {const c0=meta.crowns;for(const e of enemies.slice())if(!e.dead)kill(e,null);for(let i=0;i<10;i++){update(.05);updFx(.05);}const v=$('#vict');
    ok('clearing wave 200 is the victory',V200&&v&&!v.hidden&&paused,v&&v.hidden);ok('the victory opens the new lands',meta.arenas.snow===1&&meta.arenas.tundra===1&&meta.mapIntro===1&&meta.wonA.plains===1);
    ok('the leave button shows the crowns',/\+\d/.test($('#vLeave').textContent),$('#vLeave').textContent);
    $('#vLeave').click();ok('leaving ends the run as a victory',state==='over'&&/Victory/.test(document.querySelector('#over .title h1').textContent)&&meta.crowns>c0,meta.crowns-c0);
    ok('the next game over is a normal one again',(()=>{newGame(1);lives=1;gameOver();return /fallen/.test(document.querySelector('#over .title h1').textContent);})());}
  toW200();for(const e of enemies.slice())if(!e.dead)kill(e,null);for(let i=0;i<10;i++){update(.05);updFx(.05);}
  $('#vStay').click();ok('fighting on resumes the game',!paused&&state==='playing'&&$('#vict').hidden);callWave();ok('after the victory wave 201 can start',wave===201,wave);
  ok('a run saved after the victory remembers it',serializeRun().v200===1&&serializeRun().arena==='plains');
  {const r=serializeRun();r.wave=200;resetRun();ok('a fresh run has not won yet',!V200);meta.arena='plains';loadRun(r);ok('loading it brings the victory back',V200===true&&!v200Lock());}
  {go('tundra');newGame(1);paused=false;lives=1e9;wave=199;nextQ=buildWave(200);callWave();for(let i=0;i<3000&&spawners.length;i++){update(.05);updFx(.05);}for(const e of enemies.slice())if(!e.dead)kill(e,null);for(let i=0;i<10;i++){update(.05);updFx(.05);}
    ok('winning wave 200 in the tundra',V200&&/Greywind Tundra is safe/.test($('#vSub').textContent)&&meta.wonA.tundra===1,$('#vSub').textContent);$('#vStay').click();clean();state='menu';}
  /* runs know their arena */
  go('snow');newGame(1);paused=true;callWave();{const r=lsGet(KR);ok('a Frostvale run is saved as Frostvale',r&&r.arena==='snow',r&&r.arena);
    state='menu';clearWorld();meta.arena='plains';buildMap(5);MAP.fresh=true;loadRun(r);ok('resuming it builds Frostvale again',meta.arena==='snow'&&ARENA_BUILT==='snow'&&state==='playing');}
  clean();go('tundra');newGame(1);paused=true;callWave();{const r=lsGet(KR);ok('a tundra run is saved as the tundra',r&&r.arena==='tundra',r&&r.arena);
    state='menu';clearWorld();meta.arena='plains';buildMap(5);MAP.fresh=true;loadRun(r);ok('resuming it builds the tundra again',meta.arena==='tundra'&&ARENA_BUILT==='tundra'&&state==='playing');}
  clean();{state='menu';clearWorld();const c0=meta.crowns;lsSet(KR,Object.assign(serializeRun(),{wave:30,cleared:29,startWave:1}));arenaGoNow('plains');ok('travelling ends the saved run and pays it out',!lsGet(KR)&&meta.crowns>c0&&meta.arena==='plains'&&ARENA_BUILT==='plains',meta.crowns-c0);}
  {const r=Object.assign({},JSON.parse(JSON.stringify(serializeRun())));delete r.arena;r.wave=5;state='menu';meta.arena='snow';loadRun(r);ok('an old run without an arena is a plains run',meta.arena==='plains'&&ARENA_BUILT==='plains');}
  /* travel to the tundra: the world map */
  {state='menu';lsSet(KR,null);clearWorld();meta.arena='plains';meta.arenas={plains:1,snow:1,tundra:1};meta.seenA={plains:1,snow:1};meta.mapIntro=1;buildMap(9);MAP.fresh=true;
    ok('the tundra waits on the map as a new land',wmapState('tundra')==='new',wmapState('tundra'));ok('the world map button shows a badge for it',arenaUnseen());
    meta.mapIntro=0;renderHome();ok('the badge stays until you travel there',!!document.querySelector('#bWorldMap .wmp-badge'));
    meta.mapIntro=1;wmapEl();wmapArrive('tundra',false);ok('arriving opens the tundra and ends the map intro',meta.arena==='tundra'&&ARENA_BUILT==='tundra'&&meta.seenA.tundra===1&&meta.mapIntro===0,meta.arena+' '+meta.mapIntro);
    ok('the plate names the gusts',/Greywind/.test(WMU.el.querySelector('.wmp-plate').textContent));closeWorldMap();
    ok('no badge once every land is seen',!arenaUnseen());renderHome();ok('the header says Arena 3, Greywind Tundra',/Arena 3/.test(document.querySelector('.arena-head .lbl').textContent)&&/Greywind Tundra/.test(document.querySelector('.arena-head b').textContent)&&document.querySelector('.arena-head').closest('.arena').classList.contains('tundra'));}
  /* the Bestiary: Plains > Frostvale > Tundra > Whitewaste > Deep Taiga (v356) > Stormcrag Highlands (v418) > Plains */
  {galSetBiome('plains');const b=$('#bGalBiome'),seq=[];for(let i=0;i<6;i++){b.click();seq.push(GAL_BIO+':'+b.textContent.replace('Biome: ',''));}
    const six=typeof highlandsBoard==='function';ok('the Bestiary biome switch cycles through the '+(six?'six':'five')+' lands',seq.slice(0,six?6:5).join(',')===(six?'snow:Frostvale,tundra:Tundra,whitewaste:Whitewaste,taiga:Taiga,highlands:Highlands,plains:Plains':'snow:Frostvale,tundra:Tundra,whitewaste:Whitewaste,taiga:Taiga,plains:Plains'),seq.join(','));
    galSetBiome(true);const c1=GAL_BIO;galSetBiome(false);ok('the old true/false switch still works',c1==='snow'&&GAL_BIO==='plains');
    GAL_BIO='tundra';const m=galSnowM(enemyModel('soldier',0),'soldier');let tm=0;m.b.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.tun)tm++;});GAL_BIO='plains';GAL_SNOW=false;
    ok('the tundra Bestiary shows tundra foes',tm>0&&m.b.children.some(c=>c.userData.tunGear),tm);}
  /* each land has its own findable props; the Plains keep theirs, placed exactly as before (recorded on v294) */
  {const snap={31:'grave@-8.180,-8.623,0.793,0.857;cart@3.311,1.473,1.586,1.011;statue@5.123,-2.762,1.670,1.221;letter@-4.006,-6.997,-1.681,1.081;burned@-7.115,-1.886,5.872,0.850;cart@7.338,-13.054,-3.078,1.244;weapons@6.843,4.557,3.142,1.277',
     4242:'camp@3.400,2.252,4.236,1.100;burned@-7.694,-3.049,0.092,1.010;cart@7.948,-9.445,1.555,0.864;statue@6.902,-12.139,0.800,1.212;camp@-5.287,7.620,3.600,1.118;cart@-7.172,-10.440,2.974,0.952',
     90001:'statue@-8.149,4.223,-1.599,1.228;weapons@7.175,-12.431,0.362,0.864;camp@-7.087,-11.000,4.619,1.206;burned@-4.040,7.121,4.554,1.095;camp@6.356,-8.478,1.397,0.905'};
    let same=true,why='';const gvS=MAP_GV;MAP_GV=3;for(const sd in snap){go('plains',+sd);const got=LORE.map(l=>l.k+'@'+l.x.toFixed(3)+','+l.z.toFixed(3)+','+l.rot.toFixed(3)+','+l.sc.toFixed(3)).join(';');if(got!==snap[sd]){same=false;why=sd+': '+got.slice(0,90);}}MAP_GV=gvS;
    ok('the Plains keep their old props on older boards, placed exactly as before',same,why);}
  for(const a of ['snow','tundra']){const set=LORE_SETS[a],seen=new Set();let own=true,rep=false,road=false,n=0;
    for(let sd=1;sd<=12;sd++){go(a,sd*97);n+=LORE.length;const ks=LORE.map(l=>l.k);ks.forEach(k=>seen.add(k));if(!ks.every(k=>set.includes(k)))own=false;if(new Set(ks).size<Math.min(ks.length,set.length))rep=true;
      for(const L of LORE){const c=Math.round(L.x/TS+OX),r=Math.round(L.z/TS+OZ);if(L.rd<LORE_RULE[L.k].mn-1e-6||(grid[r]&&grid[r][c]===1))road=true;}}
    ok(ARENAS[a].n+' has its own six props, and only those',own&&set.length===6&&seen.size===6,[...seen].join(','));
    ok(ARENAS[a].n+': every prop once before any repeats, none on the road',!rep&&!road&&n>=(MAP_GV>=4?36:48),n+' props on 12 boards');}
  {const bad=[];let cloth=0;for(const k of [...LORE_SETS.snow,...LORE_SETS.tundra]){const g=loreModel(k,5,{rd:1.5,sc:1});let n=0,shared=0;const bb=new THREE.Box3();g.updateMatrixWorld(true);
      g.traverse(o=>{if(!o.isMesh)return;n++;const m=o.material;if(m&&m.color&&m===M(m.color.getHex()))shared++;if(o.castShadow)bb.expandByObject(o);});const sz=bb.getSize(new THREE.Vector3());cloth+=g.userData.flaps.length;
      if(n<10||shared||sz.y>.95||Math.max(sz.x,sz.z)>2.2||!LORE_D[k]||LORE_D[k].t.length<3||!(LORE_SOLID[k]>=0))bad.push(k+':'+n+'/'+shared+'/'+sz.x.toFixed(2)+'x'+sz.y.toFixed(2)+'x'+sz.z.toFixed(2));}
    ok('the 12 new props: their own materials (no board recolours them), low and compact, three notes each',!bad.length&&cloth>=6,bad.join(' ')||cloth+' cloths sway');}
  {play('snow',777);const L=LORE[0];__kk.camXZ(L.x,L.z,.4);anim(.016,1);let mm=null;L.g.traverse(o=>{if(!mm&&o.isMesh&&o.castShadow&&o.visible)mm=o;});const t=scr(mm.getWorldPosition(new THREE.Vector3()));tap(t[0],t[1]);const el=$('#loreNote');
    ok('tapping a Frostvale prop shows its own note',!!el&&el.classList.contains('on')&&el.textContent.includes(LORE_D[L.k].n)&&LORE_D[L.k].t.includes(L.line)&&L.read,L.k+': '+(el?el.textContent.slice(0,60):'no note'));if(el)el.classList.remove('on');}
  {play('tundra',777);const R=BIO.rune;const g0=TUNW.g;TUNW.g=1;loreAnim(.016);const hi=R?R.emissiveIntensity:0;TUNW.g=.3;loreAnim(.016);const lo=R?R.emissiveIntensity:9;
    const f=LORE.flatMap(L=>L.g.userData.flaps||[])[0],r1=f?f.m.rotation[f.ax]:0;time+=.37;loreAnim(.016);const r2=f?f.m.rotation[f.ax]:0;
    TUNW.g=g0;ok('rune stones glow before and during a gust, cloth sways in the wind',!!R&&hi>1.1&&lo<.6&&!!f&&Math.abs(r2-r1)>.005,(R?hi.toFixed(2)+' / '+lo.toFixed(2):'no rune stone')+', cloth '+(r2-r1).toFixed(3));}
  /* stones: a tap on a board rock opens the window; 1000 gold breaks it and frees the tile; saved with the run */
  for(const a of ['plains','snow','tundra']){play(a,777);const ks=Object.keys(ROCKM);
    ok(ARENAS[a].n+': every board rock can be tapped (both of its stones found)',ks.length===ROCKS.length&&ks.length>0&&ks.every(k=>ROCKM[k].length===2&&ROCKM[k].every(m=>m.parent===TERRAIN)),ks.length+'/'+ROCKS.length);}
  {play('tundra',777);const k=Object.keys(ROCKM).find(k=>{const q=k.split(',').map(Number);return !TREEM[k]&&!(heroU&&heroU.c===q[0]&&heroU.r===q[1]);});const q=k.split(',').map(Number),ms=ROCKM[k].slice(),p=tw(q[0],q[1]);
    __kk.camXZ(p.x,p.z,.4);anim(.016,1);const t=scr(ms[0].getWorldPosition(new THREE.Vector3()));gold=600;tap(t[0],t[1]);let mo=$('#lmModal'),b=mo&&mo.querySelector('button[data-i="0"]');
    ok('tapping a rock opens the Break the stone window (Granite Boulder in the tundra, 1000 gold)',!!b&&mo.textContent.includes('Granite Boulder')&&b.textContent.includes('Break the stone')&&b.textContent.includes('1000 gold'),mo?mo.textContent.slice(0,80):'no window');
    ok('without 1000 gold the button is shut',!!b&&b.disabled&&b.textContent.includes('not enough gold'));closeLm();
    gold=1500;tap(t[0],t[1]);mo=$('#lmModal');b=mo&&mo.querySelector('button[data-i="0"]');if(b)b.click();for(let i=0;i<90;i++)updFx(.016);
    ok('breaking it costs 1000 gold and frees the tile',gold===500&&grid[q[1]][q[0]]===0&&!ROCKM[k]&&!ROCKS.some(r=>r[0]===q[0]&&r[1]===q[1])&&MAP.broke.includes(k),gold+' gold, tile '+grid[q[1]][q[0]]);
    ok('the stone is gone from the board',ms.every(m=>!m.parent));
    const sv=JSON.parse(JSON.stringify(serializeRun()));ok('broken stones are saved with the run',Array.isArray(sv.rocks)&&sv.rocks.includes(k),JSON.stringify(sv.rocks));
    loadRun(sv);ok('and stay broken when the run is loaded',ARENA_BUILT==='tundra'&&grid[q[1]][q[0]]===0&&!ROCKM[k]&&Object.keys(ROCKM).length===ROCKS.length&&MAP.broke.includes(k),Object.keys(ROCKM).length+'/'+ROCKS.length);
    paused=true;gold+=buildCost('archer');placeTower('archer',q[0],q[1]);ok('a tower can be built where the stone stood',typeof grid[q[1]][q[0]]==='object'&&grid[q[1]][q[0]]&&grid[q[1]][q[0]].type==='archer');
    const sv0=JSON.parse(JSON.stringify(sv));delete sv0.rocks;loadRun(sv0);ok('an older save without broken stones still loads with every rock',Object.keys(ROCKM).length===ROCKS.length&&ROCKM[k]&&grid[q[1]][q[0]]===2);}
  {play('snow',777);const k=Object.keys(ROCKM)[0],q=k.split(',').map(Number);rockOpen(q[0],q[1]);const mo=$('#lmModal');const okS=!!mo&&mo.textContent.includes('Frozen Boulder');closeLm();
    play('plains',777);const k2=Object.keys(ROCKM)[0],q2=k2.split(',').map(Number);rockOpen(q2[0],q2[1]);const m2=$('#lmModal');const okP=!!m2&&m2.textContent.includes('Old Boulder');closeLm();
    gold=1e4;breakRock(q2[0],q2[1]);for(let i=0;i<90;i++)updFx(.016);ok('each land names its stone (Frozen Boulder, Old Boulder) and stones break there too',okS&&okP&&grid[q2[1]][q2[0]]===0&&!ROCKM[k2]);}
  /* the cold lands favour ice: ice scrolls +20% (Frostvale) / +10% (tundra), every slow 15% stronger in both; the Plains as before */
  {const res={},mkF=()=>{spawnEnemy({type:'soldier',v:0},60);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=6;e.off=0;e.res=null;e.shield=0;e.hp=e.maxHp=1e9;moveEnemy(e,0);return e;};
    for(const a of ['plains','snow','tundra']){play(a,777);clean();const e=mkF();e.spd=0;const hit=o=>{const h=e.hp;hurt(e,100,'magic',Object.assign({noReact:true},o));return h-e.hp;};
      const fire=hit({src:heroU,el:'fire',spell:'emberbolt'});res[a]={ice:hit({src:heroU,el:'ice',spell:'frostshard'})/fire,tower:hit({src:{type:'frost'},el:'ice'})/fire,s7:landSlow(.7),s0:landSlow(0),s1:landSlow(.1),one:landSlow(1)};clean();}
    const f2=v=>v.toFixed(3);
    ok('ice scrolls deal 20% more damage in Frostvale, 10% more in the tundra, the same in the Plains',Math.abs(res.plains.ice-1)<1e-9&&Math.abs(res.snow.ice-1.2)<1e-9&&Math.abs(res.tundra.ice-1.1)<1e-9,f2(res.plains.ice)+' / '+f2(res.snow.ice)+' / '+f2(res.tundra.ice));
    ok('only scrolls: the frost tower bolts stay as they were',['plains','snow','tundra'].every(a=>Math.abs(res[a].tower-1)<1e-9),['plains','snow','tundra'].map(a=>f2(res[a].tower)).join(' / '));
    ok('slows are 15% stronger in both cold lands (a 30% slow becomes 34.5%), the Plains as before',Math.abs(res.plains.s7-.7)<1e-9&&Math.abs(res.snow.s7-.655)<1e-9&&Math.abs(res.tundra.s7-.655)<1e-9&&res.snow.one===1&&res.plains.s1===.1,f2(res.snow.s7)+' / '+f2(res.tundra.s7));
    ok('a stop stays a stop, and no slow drops a foe below 5% speed',res.snow.s0===0&&Math.abs(res.snow.s1-.05)<1e-9,res.snow.s0+' / '+res.snow.s1);
    for(const a of ['plains','tundra']){play(a,777);clean();if(typeof GUST!=='undefined')GUST.k=0;blizzT=0;NS_BLZ=0;DOM.f=1;PURG.f=1;CHRONO.on=false;CIT.on=false;const x=mkF(),y=mkF();for(const e of[x,y]){e.spd=1;e.chargeT=0;e.stunT=0;e.blockBy=null;e.fly=false;}y.slow=.3;y.slowT=5;const dx=x.dist,dy=y.dist;moveEnemy(x,.1);moveEnemy(y,.1);res[a].walk=(y.dist-dy)/(x.dist-dx);clean();}
    ok('on the road a 30% slowed foe walks at 65.5% speed in the tundra, 70% in the Plains',Math.abs(res.tundra.walk-.655)<.002&&Math.abs(res.plains.walk-.7)<.002,f2(res.tundra.walk)+' / '+f2(res.plains.walk));
    play('snow',777);clean();const pc=posAt(5,ROUTES[0]),cst={x:pc[0]+1.2,z:pc[1]+.6,topY:1.1,c:0,r:0,scd:{},isTest:true},st={range:3,dmg:100,spellP:100},dd=[];
    for(const tag of [true,false]){const e=mkF();e.spd=0;castScrollNow('frostshard',cst,st,[e],100,tag?{src:cst,el:'ice',spell:'frostshard'}:{src:cst,el:'ice'});for(let i=0;i<120;i++){update(.05);updFx(.05);}dd.push(1e9-e.hp);clean();}
    ok('a real Frost Shard cast in Frostvale hits 20% harder',dd[1]>0&&Math.abs(dd[0]/dd[1]-1.2)<.005,dd[0].toFixed(1)+' vs '+dd[1].toFixed(1));}
  {const wa=String(wmapArrive),gb=String(galSetBiome);ok('the lands say so: arrival window, Bestiary switch and patch notes',wa.includes('ice spells deal 20% more damage and every slow is 15% stronger')&&wa.includes('ice spells deal 10% more damage and every slow is 15% stronger')&&gb.includes('ice spells +20%, slows 15% stronger')&&gb.includes('ice spells +10%, slows 15% stronger')&&document.body.innerHTML.includes('The cold is on your side'));}
  /* the tundra can open up to three gates; the Plains keep one or two; tundra runs saved before keep their board */
  {const cnt=a=>{const c={1:0,2:0,3:0};let bad='';for(let sd=1;sd<=60;sd++){go(a,sd*131);c[MAP.gates.length]=(c[MAP.gates.length]||0)+1;
      if(ROUTES.length!==MAP.gates.length||MAP.routes.some(r=>r.length<26))bad='routes '+sd;
      if(!MAP.gates.every((g,i)=>MAP.gates.every((o,j)=>i===j||Math.abs(o.c-g.c)+Math.abs(o.r-g.r)>=9)))bad='close '+sd;}return{c,bad};};
    const t=cnt('tundra'),p=cnt('plains'),f=cnt('snow'),x=cnt('whitewaste');
    ok('tundra boards open two or three gates (v332), far apart, every road long enough',t.c[1]===0&&t.c[2]>0&&t.c[3]>0&&!t.bad,JSON.stringify(t.c)+' '+t.bad);
    ok('Frostvale boards always open two gates (v332)',f.c[2]===60&&!f.bad,JSON.stringify(f.c)+' '+f.bad);
    ok('Whitewaste boards always open three gates (v332)',x.c[3]===60&&!x.bad,JSON.stringify(x.c)+' '+x.bad);
    {const gvN=MAP_GV,a1=meta.arena;meta.arena='plains';let two=0;for(let sd=1;sd<=40&&!two;sd++){MAP_GV=5;const m=genMap(sd*313);if(m.gates.length===2)two=sd*313;}MAP_GV=gvN;
     play('plains',two);const sv=JSON.parse(JSON.stringify(serializeRun()));sv.gv=5;loadRun(sv);const g5=MAP.gates.length;sv.gv=gvN;loadRun(sv);const g6=MAP.gates.length;clean();meta.arena=a1;
     ok('a Kingsroad run saved before v333 keeps its two-gate board',!!two&&g5===2&&g6===1&&gvN>=6,two+': '+g5+' then '+g6);}
    ok('the Kingsroad always opens one gate (v333)',p.c[1]===60&&!p.bad,JSON.stringify(p.c));
    let s3=0;for(let sd=1;sd<200&&!s3;sd++){go('tundra',sd*131);if(MAP.gates.length===3)s3=sd*131;}
    play('tundra',s3);clean();const used=new Set();for(let i=0;i<6;i++){spawnEnemy({type:'soldier',v:0},60);used.add(enemies[enemies.length-1].route);}
    ok('on a three-gate board the foes come down all three roads',ROUTES.length===3&&used.size===3,used.size);clean();
    const GVN=MAP_GV;MAP_GV=0;go('tundra',s3);const old=JSON.stringify(MAP.gates);MAP_GV=GVN;play('tundra',s3);const sv=JSON.parse(JSON.stringify(serializeRun()));
    ok('new runs save their board version',sv.gv===GVN&&GVN>=3,sv.gv);delete sv.gv;loadRun(sv);
    ok('an older tundra save loads its old board',ARENA_BUILT==='tundra'&&JSON.stringify(MAP.gates)===old&&MAP_GV===GVN,MAP.gates.length+' gates, was '+JSON.parse(old).length);
    sv.gv=GVN;loadRun(sv);ok('and a new one its three-gate board',MAP.gates.length===3);clean();}
  /* developer mode: every land the game can unlock is open, and the real account's lands come back when it is turned off */
  {state='menu';lsSet(KR,null);meta.dev=false;delete meta.devSnap;meta.arenas={plains:1};meta.seenA={plains:1};meta.mapIntro=0;meta.arena='plains';clearWorld();buildMap(31);MAP.fresh=true;saveMeta();
    const base=JSON.stringify({a:meta.arenas,s:meta.seenA}),tb=$('#bTestAll');ok('a plain account has only the Plains',!meta.arenas.snow&&!meta.arenas.tundra&&wmapState('tundra')==='locked',wmapState('tundra'));
    tb.click();ok('developer mode opens every land the game can unlock',meta.dev&&Object.keys(ARENAS).filter(k=>!ARENAS[k].soon).every(k=>meta.arenas[k]===1),JSON.stringify(meta.arenas));
    ok('on the world map they wait as new lands (the first trip still breaks the lock)',wmapState('snow')==='new'&&wmapState('tundra')==='new',wmapState('snow')+'/'+wmapState('tundra'));
    arenaGoNow('tundra');ok('developer mode can travel to the tundra',meta.arena==='tundra'&&ARENA_BUILT==='tundra');
    ARENAS.__t={n:'Test',hd:'Test',no:9,site:'__t',soon:true};devLands();const soonShut=!meta.arenas.__t;delete ARENAS.__t;ok('lands still marked soon stay shut',soonShut);
    tb.click();ok('turning it off brings back the real lands',!meta.dev&&JSON.stringify({a:meta.arenas,s:meta.seenA})===base,JSON.stringify(meta.arenas));
    ok('and the keep goes back to where the real account stands',meta.arena==='plains'&&ARENA_BUILT==='plains',meta.arena+' / '+ARENA_BUILT);
    const m=migrateMeta({best:5,dev:true,arenas:{plains:1}});ok('an account already in developer mode gets the lands when it loads',m.arenas.snow===1&&m.arenas.tundra===1,JSON.stringify(m.arenas));
    const m2=migrateMeta({best:5,arenas:{plains:1}});ok('a normal account does not',!m2.arenas.snow&&!m2.arenas.tundra);}
  /* old saves */
  {const m=migrateMeta({best:230,cleared:229});ok('an old save past wave 200 gets the new lands and the map unlock',m.arenas.snow===1&&m.arenas.tundra===1&&m.mapIntro===1&&m.arena==='plains',JSON.stringify(m.arenas));}
  {const m=migrateMeta({best:120});ok('an old save below wave 200 does not',!m.arenas.snow&&!m.mapIntro&&m.bestA.plains===120);}
  {const m=migrateMeta({best:250,arena:'tundra',arenas:{plains:1,snow:1,tundra:1}});ok('an open tundra can be the current arena',m.arena==='tundra');}
  {const m=migrateMeta({best:50,arena:'tundra',arenas:{plains:1}});ok('a closed tundra cannot',m.arena==='plains');}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{state='menu';paused=false;clean();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);const v=$('#vict');if(v)v.hidden=true;CAM.yaw=yaw0;if(typeof galSetBiome==='function')galSetBiome('plains');
  if(WMU.el&&WMU.el.classList.contains('on'))closeWorldMap();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
