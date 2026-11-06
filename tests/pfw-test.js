(function(){
/* The static world and the towers (v492): the live batcher. Run on the dev page:
   __kk.ev(await (await fetch('/tests/pfw-test.js')).text()) returns [name, ok, detail] rows. Each land's board (with twenty towers) is
   rendered with the batcher off, then merged and rendered again: the same picture, with the draw calls and shadow casters counted by owner.
   Then the things that move, change or go: a turning head, a tower moved, upgraded and sold, a scorched and a cut tree, a recoloured
   material, an opened chest, the Infinite Void and a running wave (each compared with the batcher off at the same moment), rays and clicks,
   and the merged geometry freed over many boards. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),on0=PFW.on;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const LANDS=['plains','snow','tundra','whitewaste','taiga','highlands'];
const TT=Object.keys(TD).filter(k=>!TD[k].hero&&k!=='mine'&&k!=='windmill'&&k!=='merchant'&&k!=='bell');
let seed=1;const rnd0=Math.random;
const board=(a,n,sd)=>{seed=sd||77;Math.random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};PFW.on=true;lsSet(KR,null);for(const k of LANDS){meta.arenas[k]=1;if(meta.seenA)meta.seenA[k]=1;}meta.mapIntro=0;meta.arena=a;
  state='menu';clearWorld();buildMap(sd||77);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;gold=1e9;const sp=[];
  for(let r=2;r<H-2&&sp.length<n;r++)for(let c=1;c<W-1&&sp.length<n;c++){if(grid[r][c]!==0)continue;if(sp.some(([c2,r2])=>Math.abs(c2-c)+Math.abs(r2-r)<3))continue;
    for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]])if(grid[r+dr]&&grid[r+dr][c+dc]===1){sp.push([c,r]);break;}}
  sp.forEach((p,i)=>{try{placeTower(TT[i%TT.length],p[0],p[1]);}catch(e){}});meta.shadows=true;applyShadows();};
const gl=renderer.getContext();
const shot=noAnim=>{if(!noAnim)anim(.001,1);renderer.render(scene,camera);const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);return{px,calls:renderer.info.render.calls,n:w*h};};
const diff=(A,B)=>{let d48=0,d0=0;for(let i=0;i<A.px.length;i+=4){const d=Math.abs(A.px[i]-B.px[i])+Math.abs(A.px[i+1]-B.px[i+1])+Math.abs(A.px[i+2]-B.px[i+2]);if(d)d0++;if(d>48)d48++;}return{d48,d0,n:A.n};};
const same=D=>D.d48<=D.n*.0002;   /* 0.02% (about 200 pixels): run-to-run noise of the animated glows is a few pixels */
/* the same moment with the batcher off (every part drawn on its own, as before v492) and on (merged, everything still baked) */
/* a change made while everything is merged: the frame right after it, against the batcher off */
const chg=(fn,noAnim)=>{PFW.on=true;pfwBakeNow();fn();const B=shot(noAnim);PFW.on=false;const A=shot(noAnim);PFW.on=true;return Object.assign(diff(A,B),{a:A.calls,b:B.calls});};
const offOn=(noAnim)=>{PFW.on=false;const A=shot(noAnim);PFW.on=true;pfwBakeNow();const B=shot(noAnim);return Object.assign(diff(A,B),{a:A.calls,b:B.calls});};
/* what the renderer draws, by owner (a mesh counts when it and every group above it are shown and its layer is one the camera draws) */
const draws=()=>{const own=new Map();for(const e of enemies)if(e.g)own.set(e.g,'foes');for(const t of towers)if(t.g)own.set(t.g,'towers');if(heroU&&heroU.g)own.set(heroU.g,'hero');if(TERRAIN)own.set(TERRAIN,'terrain');
  const B={},S={};const vis=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};
  scene.traverse(o=>{if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)||!vis(o)||!(o.layers.mask&3))return;let p=o,k='other';
    if(o.userData.pfw)k=o.userData.pfw[0]==='T'?'terrain':'towers';else while(p){if(own.has(p)){k=own.get(p);break;}p=p.parent;}B[k]=(B[k]||0)+1;if(o.castShadow)S[k]=(S[k]||0)+1;});return{B,S};};
const baked=g=>{let n=0,a=0;g.traverse(o=>{const it=PFW.items.get(o);if(it){a++;if(it.baked)n++;}});return[n,a];};
const renders=n=>{for(let i=0;i<n;i++){anim(1/60,1+i/60);renderer.render(scene,camera);}};
try{
  ok('the batcher is loaded (pfwSync) and on by default',typeof pfwSync==='function'&&on0===true);
  /* 1) every land: the same picture, the terrain in under 40 draws, a tower in 4 or fewer, half the shadow casters or fewer */
  const rowsL=[];
  for(const a of LANDS){board(a,20);renders(2);PFW.on=false;const A=shot(),dA=draws();PFW.on=true;pfwBakeNow();const B=shot(),dB=draws();const D=diff(A,B);
    const nT=towers.length,cA=(dA.S.terrain||0)+(dA.S.towers||0),cB=(dB.S.terrain||0)+(dB.S.towers||0);
    rowsL.push(a+': terrain '+(dA.B.terrain||0)+'->'+(dB.B.terrain||0)+', towers '+(dA.B.towers||0)+'->'+(dB.B.towers||0)+', casters '+cA+'->'+cB+', calls '+A.calls+'->'+B.calls);
    ok(a+': the board looks the same merged',same(D),D.d48+' pixels differ by more than 48, '+D.d0+' by any amount, of '+D.n);
    ok(a+': the terrain is under 40 draws',(dB.B.terrain||0)<40,(dA.B.terrain||0)+' -> '+(dB.B.terrain||0));
    ok(a+': a tower is 4 draws or fewer',nT>=15&&(dB.B.towers||0)<=4*nT,nT+' towers: '+(dA.B.towers||0)+' -> '+(dB.B.towers||0)+' draws ('+((dB.B.towers||0)/nT).toFixed(2)+' a tower)');
    ok(a+': at most half the shadow casters',cB<=cA/2,cA+' -> '+cB);
    ok(a+': fewer draw calls in all (both passes)',B.calls<A.calls*.6,A.calls+' -> '+B.calls);}
  ok('summary by land',true,rowsL.join(' ; '));
  /* 2) the world map: the batcher stands aside in the open world and when there is no board */
  {board('plains',6);pfwBakeNow();const n0=PFW.buckets.size;const T0=TERRAIN;TERRAIN=null;renderer.render(scene,camera);let hid=0;scene.traverse(o=>{if(o.layers.mask===PFW.HIDE)hid++;});TERRAIN=T0;
    ok('with no board (the world map, the open world) nothing stays merged or hidden',n0>0&&PFW.buckets.size===0&&hid===0,n0+' batches -> '+PFW.buckets.size+', '+hid+' hidden');}
  /* 3) towers: clicks, the turning head, moving, upgrading, selling */
  {board('plains',20);pfwBakeNow();const t=towers.find(q=>q.rot&&q.head&&q.head!==q.g)||towers[0];const [bn,ba]=baked(t.g);ok('a tower\'s still parts are merged',bn>0,bn+' of '+ba+' parts');
    t.g.updateMatrixWorld(true);const rc=new THREE.Raycaster(new THREE.Vector3(t.x,6,t.z),new THREE.Vector3(0,-1,0));const h=rc.intersectObject(t.g,true);
    ok('a ray down onto a merged tower hits it (its own parts are still there for rays)',h.length&&h[0].object.userData.tower===t,h.length);
    const hs=new THREE.Raycaster(new THREE.Vector3(t.x,6,t.z),new THREE.Vector3(0,-1,0)).intersectObjects(scene.children,true);ok('rays never hit a merged mesh (clicks find the tower, not the batch)',hs.length&&!hs.some(x=>x.object.userData.pfw),hs.length);
    {const r=new THREE.Raycaster();r.setFromCamera(new THREE.Vector2(0,0),camera);const m0=r.layers.mask;r.intersectObjects(scene.children,true);ok('a raycaster\'s own layers are left as they were',r.layers.mask===m0);}
    let live=0;let D=chg(()=>{t.head.rotation.y+=1;});PFW.on=true;pfwBakeNow();t.head.rotation.y+=.5;renderer.render(scene,camera);t.head.traverse(o=>{const it=PFW.items.get(o);if(it&&!it.baked)live++;});
    ok('a turning head is drawn on its own the frame it turns (the same picture as without the batcher)',same(D)&&live>0,D.d48+' pixels, '+live+' parts on their own');
    D=chg(()=>{t.g.position.x+=.37;});ok('a moved tower looks the same (drawn on its own, then merged again in its new place)',same(D),D.d48+' pixels');
    renderer.render(scene,camera);const st0=PFW.stat.inplace;renders(40);pfwBakeNow();const [mb]=baked(t.g);PFW.on=false;const A=shot();PFW.on=true;pfwBakeNow();const B=shot();const D3=diff(A,B);
    ok('a tower still for a moment goes back into the batch, in its new place',mb>0&&same(D3)&&PFW.stat.inplace>=st0,mb+' parts merged, '+D3.d48+' pixels, '+(PFW.stat.inplace-st0)+' put back in place');
    t.g.position.x-=.37;
    const g0=t.g;D=chg(()=>{t.parts.height=(t.parts.height||0)+1;buildTowerMesh(t);});const D4=offOn();const [ub]=baked(t.g);let oldLive=0;g0.traverse(o=>{if(o.layers.mask===PFW.HIDE)oldLive++;});
    ok('an upgraded (rebuilt) tower is merged again and looks the same',t.g!==g0&&ub>0&&same(D)&&same(D4)&&!PFW.items.has([...g0.children][0]),ub+' parts merged, '+D.d48+' pixels');
    ok('the old model\'s parts are given back their own layers',oldLive===0,oldLive);
    const s=towers[3];D=chg(()=>{gold+=s.invested*.7;scene.remove(s.g);structClean(s);grid[s.r][s.c]=0;towers.splice(towers.indexOf(s),1);});renderer.render(scene,camera);PFW.scanDue=true;renderer.render(scene,camera);let left=0;for(const it of PFW.items.values()){let q=it.o;while(q&&q!==s.g)q=q.parent;if(q)left++;}
    ok('a sold tower is gone from the picture at once, and from the batcher',same(D)&&left===0,D.d48+' pixels, '+left+' parts still watched');}
  /* 4) board trees: clicks, scorching (each tree its own materials for a while), cutting */
  {board('plains',4);pfwBakeNow();const k=Object.keys(TREEM)[0],g=TREEM[k];const [tb]=baked(g);ok('a board tree is merged',tb>0,tb);
    g.updateMatrixWorld(true);const p=new THREE.Vector3();g.getWorldPosition(p);const rc=new THREE.Raycaster(new THREE.Vector3(p.x,4,p.z),new THREE.Vector3(0,-1,0));const h=rc.intersectObjects(Object.values(TREEM),true);
    let hit=null;if(h.length){let q=h[0].object;while(q&&q!==g)q=q.parent;hit=q;}ok('a ray finds a merged board tree (it can still be clicked and cleared)',hit===g,h.length);
    const L=[];let D=chg(()=>g.traverse(m=>{if(m.isMesh){const c=m.material.clone();L.push([m,m.material]);m.material=c;c.color.setRGB(.07,.06,.055);if(c.emissive)c.emissive.setRGB(.5,.2,.02);}}));let lv=0;g.traverse(o=>{const it=PFW.items.get(o);if(it&&!it.baked)lv++;});ok('a scorched tree (its own burning materials) is drawn on its own and looks the same',same(D)&&lv===L.length,D.d48+' pixels, '+lv+' parts on their own');
    L.forEach(([m,o])=>m.material=o);renders(40);PFW.on=false;const A=shot();PFW.on=true;pfwBakeNow();const B=shot();D=diff(A,B);const [tb2]=baked(g);ok('when it recovers it goes back into the batch',tb2>0&&same(D),tb2+' parts, '+D.d48+' pixels');
    const [c,r]=k.split(',').map(Number);D=chg(()=>cutTree(c,r,true));let w=0;for(const it of PFW.items.values()){let q=it.o;while(q&&q!==g)q=q.parent;if(q&&it.baked)w++;}
    ok('a cut tree disappears at once',same(D)&&w===0,D.d48+' pixels');}
  /* 5) a recoloured material (lands recolour their shared materials): the merged colour gives way to the material itself */
  {board('plains',8);pfwBakeNow();const m=M(0x6b4a2b);const c0=m.color.getHex();let D=chg(()=>m.color.setHex(0xc04020));const D2=chg(()=>m.color.setHex(0x30a0e0));const D3=offOn();m.color.setHex(c0);
    const r=PFW.mats.get(m);ok('a shared material recoloured during play shows its new colour everywhere',same(D)&&same(D2)&&same(D3)&&r&&r.anim,D.d48+'/'+D2.d48+'/'+D3.d48+' pixels');}
  /* 6) chests: the lid opens; landmarks and lore props animate their own parts */
  {board('plains',4);pfwBakeNow();const C=(CHESTS||[])[0];if(C){const D=chg(()=>{C.open=true;C.t=0;for(let i=0;i<12;i++){anim(.05,1+i*.05);renderer.render(scene,camera);}},true);ok('a chest opening looks the same',same(D),D.d48+' pixels');}
    else ok('a chest opening looks the same (no chest on this board)',true);}
  /* 7) the Infinite Void dissolves the land (its own materials on every part) and gives it back */
  {board('plains',6);const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);if(!heroU)spawnHero(q.c,q.r);pfwBakeNow();
    for(let i=0;i<20;i++){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.dist=3+i*.4;moveEnemy(e,0);}
    let err=null,D=null,D2=null,pk=0;try{castScrollNow('expanse',heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'light',anc:true,spell:'expanse'});
      for(let i=0;i<90;i++){updFx(1/30);anim(1/30,2+i/30);renderer.render(scene,camera);}D=offOn(true);
      for(let i=0;i<900;i++){updFx(1/30);if(i%10===0){anim(1/30,5+i/30);renderer.render(scene,camera);}}renders(40);pfwBakeNow();for(const it of PFW.items.values())if(it.baked&&it.dom==='T')pk++;D2=offOn(true);}catch(e){err=e.message;}
    ok('the Infinite Void dissolves the merged land the same way, and the land is merged again after',!err&&D&&same(D)&&D2&&same(D2)&&pk>0,err||(D.d48+'/'+D2.d48+' pixels, '+pk+' parts merged after'));}
  /* 8) a running wave in every land: compared with the batcher off at the same moments */
  {const bad=[];for(const a of LANDS){board(a,12);const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);if(!heroU)spawnHero(q.c,q.r);paused=false;state='playing';wave=40;spawners.push({t:0,q:buildWave(wave).q.slice(),w:wave});
      for(let i=0;i<150;i++){update(1/30);updFx(1/30);for(const e of enemies)updBar(e);anim(1/30,1+i/30);renderer.render(scene,camera);if(i%50===49){const D=offOn(true);if(!same(D))bad.push(a+'@'+i+':'+D.d48);}}paused=true;}
    ok('a running wave (towers turning and firing, foes, land effects) looks the same in every land',!bad.length,bad.join(' ')||'6 lands x 3 moments');}
  /* 9) memory: the merged geometry is freed with its board, nothing piles up in the scene */
  {const g=[],k=[];for(let i=0;i<6;i++){board(LANDS[i%LANDS.length],10,100+i);renders(3);pfwBakeNow();renderer.render(scene,camera);g.push(renderer.info.memory.geometries);k.push(PFW.grp.children.length);}
    let stale=0;for(const B of PFW.buckets.values())for(const it of B.members){let q=it.o;while(q&&q.parent)q=q.parent;if(q!==scene)stale++;}
    ok('boards come and go without the merged geometry piling up',g[5]<=g[1]*1.25&&stale===0,'geometries '+g.join(',')+'; batches '+k.join(','));
    ok('one merged mesh per batch, all in one group',PFW.grp.parent===scene&&PFW.grp.children.length===[...PFW.buckets.values()].filter(B=>B.mesh).length,PFW.grp.children.length);}
  /* 10) off is off */
  {board('plains',6);pfwBakeNow();PFW.on=false;renderer.render(scene,camera);let hid=0;scene.traverse(o=>{if(o.layers.mask===PFW.HIDE)hid++;});ok('switched off, every part is drawn on its own again',hid===0&&PFW.grp.children.length===0,hid);PFW.on=true;}
  {let err=null;try{board('plains',8);paused=false;state='playing';for(let i=0;i<30;i++){update(.05);updFx(.05);anim(.05,i*.05);renderer.render(scene,camera);}}catch(e){err=e.message;}
    ok('a game runs and renders with the batcher on, without errors',!err&&!errs,err||errs);}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v492'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;Math.random=rnd0;PFW.on=on0;try{state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();applyShadows();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return JSON.stringify(out);})()
