(function(){
/* Boards at ground level (v427): in every land the board sits on the ground, the ground around it wears the tiles' colours and texture (no tiles),
   the low-ground scenery is lifted to it, the road still enters through the gates, the tundra keeps its sea.
   Run on the dev page: __kk.ev(await (await fetch('/tests/ground-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const LANDS=['plains','snow','tundra','whitewaste','taiga','highlands'];
const go=(a,sd)=>{lsSet(KR,null);for(const k of LANDS)meta.arenas[k]=1;meta.mapIntro=0;meta.arena=a;state='menu';clearWorld();buildMap(sd||31);MAP.fresh=true;};
const down=(x,z)=>{const rc=new THREE.Raycaster(new THREE.Vector3(x,5,z),new THREE.Vector3(0,-1,0));TERRAIN.updateMatrixWorld(true);const h=rc.intersectObjects([TILES,GLD.ground].filter(Boolean),false);return h.length?h[0]:null;};
const lum=c=>c.r*.3+c.g*.59+c.b*.11;
try{
  for(const a of LANDS){go(a);const G=GLD.ground,bad=[];
    if(!G||G.parent!==TERRAIN||!G.visible)bad.push('no ground');
    const old=TERRAIN.children.filter(o=>o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters&&o.geometry.parameters.width>=400);if(old.some(o=>o.visible))bad.push('old low ground still shown');
    if(G&&Math.abs(G.position.y)>.01)bad.push('ground at '+G.position.y);
    /* the board's tiles show through the hole, the ground everywhere around it */
    const c0=tw(Math.floor(W/2),Math.floor(H/2)),h1=down(c0.x,c0.z);if(!h1||h1.object!==TILES)bad.push('board centre not tiles');
    const h2=down(W/2+3,0),h3=down(0,tw(0,H-1).z+3),h4=down(-W/2-6,-6);if(![h2,h3,h4].every(h=>h&&h.object===G&&Math.abs(h.point.y)<.01))bad.push('ground missing outside');
    const lead=(MAP.lead||[])[0];if(lead){const p=tw(lead[0],lead[1]),h=down(p.x,p.z);if(!h||h.object!==TILES)bad.push('lead road covered');}
    /* nothing of the scenery left down on the old low ground */
    let low=0;const m4=new THREE.Matrix4(),v=new THREE.Vector3();TERRAIN.children.forEach(o=>{if(!o.visible||o.userData.glBase||o===TILES)return;if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m4);v.setFromMatrixPosition(m4);const s=m4.elements[0]**2+m4.elements[1]**2+m4.elements[2]**2;if(s>1e-8&&v.y<-.6)low++;}}else if(o.position.y<-.6)low++;});if(low)bad.push(low+' things still on the low ground');
    /* the ground matches the tiles: same mean colour */
    if(G){const c=new THREE.Color();let L=0,n=0;for(let r=0;r<H;r++)for(let q=0;q<W;q++){if(grid[r][q]===1)continue;TILES.getColorAt(r*W+q,c);L+=lum(c);n++;}const gl=lum(G.material.color),tl=L/n;if(Math.abs(gl/tl-1)>.03)bad.push('colour '+gl.toFixed(3)+' vs tiles '+tl.toFixed(3));
      if(G.material.onBeforeCompile===THREE.Material.prototype.onBeforeCompile)bad.push('no texture shader');}
    ok(a+': the board sits on the ground and the ground around it looks like its tiles',!bad.length,bad.join(', '));}
  {go('tundra');const k=GLD.ground.material.customProgramCacheKey();ok('the tundra keeps its sea (the ground shader paints it)',/tundra/.test(k)&&String(glGroundMat).includes('TUN_SHORE_GLSL'));}
  {go('taiga');let err=null;try{newGame(1);paused=true;state='playing';spawnEnemy({type:'soldier',v:0},20);TGP.calm=0;packNow();for(let i=0;i<20;i++){update(.05);updFx(.05);}}catch(e){err=e.message;}
   const eyes=TGP.fx?TGP.fx.eyes:[];ok('the wolf pack\'s eyes glow at the treeline, on the ground (not under it)',!err&&eyes.length&&eyes.every(e=>e.position.y>.9&&e.position.y<2),err||eyes.map(e=>e.position.y.toFixed(2)).join(','));
   for(const e of enemies.slice())removeEnemy(e);enemies=[];packFxOff();state='menu';}
  {let err=null;try{for(const a of LANDS){go(a,77);anim(.05,1);renderer.render(scene,camera);}}catch(e){err=e.message;}ok('every land renders with its new ground',!err,err);}
  {let err=null;try{go('plains');for(let s=1;s<=10;s++){clearWorld();buildMap(s*131);if(!GLD.ground||GLD.ground.parent!==TERRAIN)throw new Error('seed '+s);}}catch(e){err=e.message;}ok('ten more boards each get their ground and hole',!err,err);}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v427'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{try{state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
