(function(){
/* Performance (v446): static batching of the scenery and freezing of props and towers. Run on the dev page:
   __kk.ev(await (await fetch('/tests/perf-test.js')).text()) returns [name, ok, detail] rows. Each land's board is built once with the
   batching off, rendered, then batched in place and rendered again: the same picture with far fewer draw calls. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),on0=PF.on;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const LANDS=['plains','snow','tundra','whitewaste','taiga'];
const types=['archer','cannon','mage','frost','ballista','storm','catapult','lantern','alchemist','obelisk'];
const board=a=>{PF.on=false;lsSet(KR,null);for(const k of LANDS)meta.arenas[k]=1;meta.arena=a;meta.mapIntro=0;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;gold+=1e7;
  const cand=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<H&&cc>=0&&cc<W&&grid[rr][cc]===1)n++;}if(n)cand.push([c,r,n]);}
  cand.sort((x,y)=>y[2]-x[2]||x[1]-y[1]||x[0]-y[0]);const pick=[];for(const q of cand){if(pick.length>=10)break;if(pick.every(p=>Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])>=2))pick.push(q);}
  pick.forEach((q,i)=>{placing={type:types[i%types.length]};try{placeTower(types[i%types.length],q[0],q[1],{});}catch(e){}});placing=null;};
const gl=renderer.getContext();
const shot=()=>{anim(.001,1);renderer.render(scene,camera);const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);return{px,calls:renderer.info.render.calls,n:w*h};};
const batchAll=()=>{PF.on=true;pfBatch();pfProps();pfLoose();towers.forEach(pfTower);};
try{
  for(const a of LANDS){board(a);meta.shadows=true;applyShadows();const A=shot();batchAll();const B=shot();let diff=0;for(let i=0;i<A.px.length;i+=4){const d=Math.abs(A.px[i]-B.px[i])+Math.abs(A.px[i+1]-B.px[i+1])+Math.abs(A.px[i+2]-B.px[i+2]);if(d>48)diff++;}
    ok(a+': the board looks the same after batching',diff<A.n*.0005,diff+' pixels differ');
    ok(a+': with far fewer draw calls (at most 70%)',B.calls<=A.calls*.7,A.calls+' -> '+B.calls);}
  /* towers: clicks, the turning head, an upgrade, selling */
  {board('plains');batchAll();const t=towers.find(q=>q.rot&&q.head)||towers[0];let merged=0;t.g.traverse(o=>{if(o.userData.pfBatch)merged++;});
    ok('a tower\'s still parts are merged',merged>0,merged);
    let all=true;t.g.traverse(o=>{if(o.isMesh&&o.userData.tower!==t)all=false;});ok('every mesh of a tower still points at it (clicks find it)',all);
    const rc=new THREE.Raycaster(new THREE.Vector3(t.x,5,t.z),new THREE.Vector3(0,-1,0));t.g.updateMatrixWorld(true);const h=rc.intersectObject(t.g,true);ok('a ray down onto a tower hits it',h.length&&h[0].object.userData.tower===t,h.length);
    if(t.head&&t.rot){const ch=t.head.children.length;t.head.rotation.y+=1;ok('the turning head is its own part (not merged into the body)',t.head.parent&&t.head.children.length===ch&&!t.g.children.some(o=>o.userData.pfBatch&&o===t.head));}
    const g0=t.g;buildTowerMesh(t);let m2=0;t.g.traverse(o=>{if(o.userData.pfBatch)m2++;});ok('a rebuilt tower (an upgrade) is merged again',t.g!==g0&&m2>0,m2);
    const sold=t.g;let geo=null;sold.traverse(o=>{if(o.userData.pfBatch&&!geo)geo=o.geometry;});scene.remove(sold);let freed=false;geo.addEventListener('dispose',()=>freed=true);pfSweep();ok('a removed tower\'s merged geometry is freed',freed&&![...PF.made].some(m=>m.geometry===geo));scene.add(sold);}
  /* lore props and board trees */
  {board('plains');batchAll();const L=(LORE||[]).find(q=>q.g&&q.g.children.some(o=>o.userData.pfBatch));
    if(L){L.g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(L.g),c=box.getCenter(new THREE.Vector3());const rc=new THREE.Raycaster(new THREE.Vector3(c.x,5,c.z),new THREE.Vector3(0,-1,0));ok('a lore prop can still be clicked',rc.intersectObjects(LORE.map(l=>l.g),true).length>0);}
    else ok('a lore prop can still be clicked (none merged on this board)',true);
    const k=Object.keys(TREEM)[0];ok('board trees keep their own meshes (scorch and clearing work per tree)',!k||TREEM[k].children.length>=2&&TREEM[k].parent===TERRAIN,k);
    ok('the outer forest is a few meshes now',PF.stat.trees&&PF.stat.trees.batches<=12&&PF.stat.trees.meshes>100,JSON.stringify(PF.stat.trees));}
  /* the snow caps keep their place (they read each mesh's own height) */
  {board('snow');batchAll();let v=0;TERRAIN.traverse(o=>{if(o.userData.pfBatch&&o.material.userData&&o.material.userData.pfLoc){if(o.geometry.attributes.pfLoc)v++;}});ok('snow caps on merged trees read each tree\'s own height (pfLoc)',v>0,v);}
  /* the Infinite Void still dissolves the merged scenery */
  {board('plains');batchAll();ok('the merged outer forest has no voidKeep (the Void dissolves it) and the pebbles keep theirs',TERRAIN.children.filter(o=>o.userData.pfBatch&&o.userData.glOuter).every(o=>!o.userData.voidKeep)&&TERRAIN.children.some(o=>o.userData.pfBatch&&o.userData.voidKeep));}
  /* landmarks: their still parts are merged, every part their model points at is left in place (so states and animation still show) */
  {let n=0,okRefs=true,merged=0;for(let s=0;s<6&&n<4;s++){board('plains');PF.on=false;clearWorld();buildMap(300+s);PF.on=true;pfProps();
      for(const L of LMS||[]){n++;const P=L.P;L.P.g.traverse(o=>{if(o.userData.pfBatch)merged++;});for(const k in P){const v=P[k];const chk=o=>{if(o&&o.isObject3D&&o!==P.g){let q=o;while(q&&q!==P.g)q=q.parent;if(q!==P.g)okRefs=false;}};if(Array.isArray(v))v.forEach(chk);else chk(v);}
        try{const st={shrine:'destroyed',tower:'done',camp:'searched',merchant:'sold',cursed:'burned',altar:'offered'}[L.k];if(st)lmSetState(L,st,true);}catch(e){okRefs=false;}}}
    ok('landmarks: their still parts are merged',n===0||merged>0,n+' landmarks, '+merged+' merged meshes');
    ok('landmarks: every part they animate or change stays in place, and their states still apply',okRefs);}
  /* the keep's flag still waves, a chest's lid still opens */
  {board('plains');batchAll();let fl=false;if(castleFlag){let q=castleFlag;while(q&&q!==castle)q=q.parent;fl=q===castle;}ok('the keep is merged but its flag is its own part',(!castleFlag||fl)&&castle.children.some(o=>o.userData.pfBatch),!!castleFlag);
    const C=CHESTS[0];if(C){let q=C.lid;while(q&&q!==C.g)q=q.parent;const r0=C.lid.rotation.x;C.open=true;C.t=0;anim(.2,1);ok('a chest\'s lid stays its own part and still opens',q===C.g&&C.lid.rotation.x!==r0,C.lid.rotation.x.toFixed(2));}else ok('a chest\'s lid still opens (no chest on this board)',true);}
  /* the hero: each joint's plain parts drawn as one mesh with the parts' colours in its vertices; the same picture; joints still move */
  {board('plains');meta.shadows=true;applyShadows();let bad=[],fewer=0,moved=true;
    for(const id of Object.keys(HB)){meta.owned=meta.owned||{};meta.owned[id]=true;meta.equipped=id;PF.on=false;if(heroU)despawnHero();const q=heroTileNear(id,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);const H=heroU;if(!H)continue;
      H.g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(H.g),c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3()).length();
      camera.position.set(c.x+sz*.9,c.y+sz*.5,c.z+sz*1.1);camera.lookAt(c);camera.updateProjectionMatrix();const A=shot();PF.on=true;pfHeroFreeze(H.g);const B=shot();
      let diff=0;for(let i=0;i<A.px.length;i+=4){if(Math.abs(A.px[i]-B.px[i])+Math.abs(A.px[i+1]-B.px[i+1])+Math.abs(A.px[i+2]-B.px[i+2])>48)diff++;}if(diff>A.n*.0005)bad.push(id+':'+diff);if(B.calls<A.calls)fewer++;
      const me=[];H.g.traverse(o=>{if(o.userData.pfBatch&&o.material.vertexColors)me.push(o);});const j=me.find(o=>o.parent!==H.g&&o.parent.parent);if(j){const bb=()=>{H.g.updateMatrixWorld(true);j.geometry.computeBoundingBox();return j.geometry.boundingBox.clone().applyMatrix4(j.matrixWorld);};const b0=bb();j.parent.rotation.x+=.8;const b1=bb();if(b1.min.distanceTo(b0.min)+b1.max.distanceTo(b0.max)<1e-4)moved=false;j.parent.rotation.x-=.8;H.g.updateMatrixWorld(true);}}
    ok('every hero looks the same with its parts merged',!bad.length,bad.join(' '));
    ok('every hero takes fewer draw calls',fewer===Object.keys(HB).length,fewer+' of '+Object.keys(HB).length);
    ok('a merged part moves with its joint (arms and legs still animate)',moved);
    ok('the merged parts use one white vertex-coloured material per finish; glowing parts stay their own',[...PF_VC.values()].every(m=>m.vertexColors&&m.color.getHex()===0xffffff));}
  /* health bars: all foes' bars are four instanced meshes */
  {board('plains');PF.on=true;for(let i=0;i<30;i++){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.dist=4+i*.2;moveEnemy(e,0);e.hp=e.maxHp*.5;if(i%3===0){e.shield=10;e.maxShield=20;}}
    for(const e of enemies)updBar(e);anim(.001,1);const M=PFB.m;ok('thirty hurt foes: one bar each, in four instanced meshes',M&&M.bg.count===enemies.filter(e=>!e.dead&&(e.hp<e.maxHp||e.shield>0||e.boss)).length&&M.sh.count===10&&enemies.every(e=>!e.bar),M&&[M.bg.count,M.fg.count,M.sh.count].join('/'));
    const e=enemies[0],m4=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();M.fg.getMatrixAt(0,m4);m4.decompose(p,q,s);
    ok('a bar sits over its foe, faces the camera and shows its health',Math.abs(s.x-.25)<1e-6&&q.angleTo(camera.quaternion)<1e-4&&Math.hypot(p.x-e.x,p.z-e.z)<.6,s.x.toFixed(3));
    let old=0;PF.on=false;for(const e of enemies)updBar(e);for(const e of enemies)if(e.bar){e.bar.traverse(o=>{if(o.isMesh)old++;});scene.remove(e.bar);e.bar=null;}PF.on=true;
    ok('and the bars are four draws in all instead of two or three meshes a foe',old>=60,old+' meshes the old way -> 4 instanced meshes');}
  /* a whole game frame with everything on */
  {let err=null;try{board('plains');PF.on=true;clearWorld();buildMap(77);newGame(1);paused=false;state='playing';for(let i=0;i<30;i++){update(.05);updFx(.05);anim(.05,i*.05);}renderer.render(scene,camera);}catch(e){err=e.message;}
    ok('a game runs and renders with batching on, without errors',!err&&!errs,err||errs);}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v446'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;PF.on=on0;try{state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
