(function(){
/* The nature scrolls' new looks (v358): the shared kit, the tapered vertex-coloured vines, every scroll drawing its new parts and cleaning up after
   itself, the four kinds of Gaia tree, the Treant's face, and the dark set leaving them alone (v362; before v362 it turned them purple). The mechanics are nature-test's job.
   Run on the dev page: __kk.ev(await (await fetch('/tests/natfx-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;NAT.zones.length=0;NAT.pollen.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const equip=ids=>{meta.arts=meta.arts||{own:{},eq:{},pend:[]};for(const id of ids)if(id)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids.slice(0,3);ART_V++;AS.k=null;asEl();asTick(.001);};
const crowd=(n,hp)=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);
  const L=[];for(let i=0;i<n;i++){spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdist+.18*(i-(n-1)/2);e.off=0;e.spd=.0001;e.maxHp=e.hp=hp||1e7;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);L.push(e);}return L;};
const cast=(k,L)=>{meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};heroU.scd={};heroU.gcd=0;castScrollNow(k,heroU,tStats(heroU),L.slice(),100,{src:heroU,el:'nature',spell:k,bane:0});};
/* foes grow their own status rings on first use, so their models are left out of the count */
const meshes=()=>{const skip=new Set(enemies.map(e=>e.g));let n=0;const walk=o=>{if(skip.has(o))return;if(o.isInstancedMesh)n+=o.count;else if(o.isMesh||o.isPoints||o.isSprite)n++;for(const c of o.children)walk(c);};walk(scene);return n;};
const vcMeshes=()=>{const L=[];scene.traverse(o=>{if(o.isMesh&&o.visible&&o.geometry&&o.geometry.attributes.color&&o.material&&o.material.vertexColors)L.push(o);});return L;};
const NS=['thornwhip','bramble','roots','treant','bloom','gaia'];
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const nv0=natVine,S0=scene.add;
try{
  play();
  /* ---- the kit ---- */
  {const F=nfxKit();ok('the kit is built once and shared',F===nfxKit()&&!!F.petalG&&!!F.bigLeafG&&!!F.vc&&F.vc.vertexColors===true);
   const c=F.petalG.attributes.color.array,n=c.length/3,tip=[c[0],c[1],c[2]],base=[c[(n-1)*3],c[(n-1)*3+1],c[(n-1)*3+2]];
   ok('a petal is deep pink at its base and nearly white at its tip',base[0]>base[1]*1.6&&tip[1]>.85&&tip[2]>.85,base.map(v=>v.toFixed(2))+' -> '+tip.map(v=>v.toFixed(2)));}
  /* ---- the vines ---- */
  {const x=heroU.x,z=heroU.z,y=gy(x,z);const V=natVine([new THREE.Vector3(x,y,z),new THREE.Vector3(x+.5,y+.6,z),new THREE.Vector3(x+1,y+.2,z+.4)],.05,8,'vine',{leaves:3,flowers:1});
   const p=V.geo.attributes.position,c=V.geo.attributes.color,RS=6,rings=p.count/(RS+1),cen=i=>{let a=new THREE.Vector3();for(let j=0;j<=RS;j++)a.add(new THREE.Vector3().fromBufferAttribute(p,i*(RS+1)+j));return a.multiplyScalar(1/(RS+1));},
     rad=i=>new THREE.Vector3().fromBufferAttribute(p,i*(RS+1)).distanceTo(cen(i));
   ok('a vine tapers from root to tip',rad(rings-2)<rad(1)*.5,rad(1).toFixed(3)+' -> '+rad(rings-2).toFixed(3));
   const lum=i=>c.getX(i*(RS+1))+c.getY(i*(RS+1))+c.getZ(i*(RS+1));ok('and fades from dark at the root to bright at the tip',lum(rings-1)>lum(0)*1.8,lum(0).toFixed(2)+' -> '+lum(rings-1).toFixed(2));
   const inst=()=>{let all=0,on=0,ims=0;V.g.traverse(o=>{if(!o.isInstancedMesh)return;ims++;all+=o.count;const a=o.instanceMatrix.array;for(let i=0;i<o.count;i++)if(a[i*16]||a[i*16+1]||a[i*16+2])on++;});return{all,on,ims};};
   V.grow(0);const i0=inst();V.grow(1);const i1=inst();
   ok('it carries thorns, leaves and a flower that pop in as it grows',i1.all>=14&&i0.on===0&&i1.on===i1.all,i1.all+' parts, '+i0.on+' -> '+i1.on+' shown');
   ok('and draws them in batches, one per shape and colour',i1.ims<=6&&V.g.children.length<=8,i1.ims+' batches, '+V.g.children.length+' meshes');
   const R=natVine([new THREE.Vector3(x,y,z),new THREE.Vector3(x,y+.5,z+.5)],.05,0,natKit().root);const rc=R.geo.attributes.color;
   ok('roots are brown',rc.getX(rc.count-1)>rc.getZ(rc.count-1)*1.3,rc.getX(rc.count-1).toFixed(2)+','+rc.getY(rc.count-1).toFixed(2)+','+rc.getZ(rc.count-1).toFixed(2));
   V.geo.dispose();R.geo.dispose();}
  /* ---- every scroll draws its new parts and cleans up ---- */
  let made=0,gone=0;natVine=function(){const V=nv0.apply(this,arguments);made++;V.geo.addEventListener('dispose',()=>gone++);return V;};
  /* the objects a scroll adds to the scene; other systems come and go in a long test run, so only parts that look like nature count (kit materials, vertex colours, instanced parts) */
  const ours=()=>{const K=natKit(),F=nfxKit(),S=new Set();for(const B of [K,F])for(const v of Object.values(B)){if(v&&v.isMaterial)S.add(v);if(Array.isArray(v))v.forEach(m=>m&&m.isMaterial&&S.add(m));}return S;},
    natural=(o,S)=>{let f=false;o.traverse(q=>{if(q.isInstancedMesh||(q.isMesh&&((q.geometry&&q.geometry.attributes.color)||S.has(q.material))))f=true;});return f;},
    attached=o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;};
  const need={thornwhip:[12,1],bramble:[120,16],roots:[40,5],treant:[60,0],bloom:[50,0],gaia:[40,20]},peak={},calls={},drew=()=>{renderer.render(scene,camera);return renderer.info.render.calls;};
  for(const k of NS){play();equip([]);const L=crowd(8);run(.2);const m0b=meshes(),e0=errs,c0=drew(),added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};cast(k,L);run(k==='bloom'?1.3:k==='treant'||k==='gaia'?1.6:.7);const m1=meshes(),vc=vcMeshes().length;peak[k]=m1-m0b;calls[k]=drew()-c0;
    ok(k+': casts and draws its new look',errs===e0&&m1-m0b>=need[k][0]&&vc>=need[k][1],(m1-m0b)+' new parts, '+vc+' vertex-coloured');
    run(22);scene.add=S0;const m2=meshes(),S=ours(),left=added.filter(o=>attached(o)&&natural(o,S));
    ok(k+': everything is gone when it ends',!left.length&&errs===e0,added.length+' added, '+left.length+' left; parts '+m0b+' -> '+m1+' -> '+m2);}
  scene.add=S0;ok('every vine geometry is freed',made>0&&gone===made,gone+' of '+made);natVine=nv0;
  /* a board cleared in the middle of a scroll (a lost run, a new game) takes every part of it along */
  {const left=[];for(const k of NS){play();equip([]);const L=crowd(8);run(.2);const before=new Set();scene.traverse(o=>before.add(o));cast(k,L);run(k==='gaia'?2.5:1.3);clearWorld();
     let n=0;scene.traverse(o=>{if(!before.has(o)&&(o.isMesh||o.isPoints||o.isSprite))n++;});if(n)left.push(k+':'+n);}
   ok('a board cleared mid-cast leaves nothing of the scroll behind',!left.length,left.join(', '));}
  /* the renderer draws nothing in a hidden pane, so the budget is only checked when it drew */
  ok('no scroll adds more than 170 draw calls at its peak',Object.values(calls).every(v=>v<=170),JSON.stringify(calls)+' parts '+JSON.stringify(peak));
  /* ---- the Bloom ---- */
  {play();equip([]);const L=crowd(8);cast('bloom',L);run(.6);const F=nfxKit();let pet=0,leaf=0;scene.traverse(o=>{if(o.isMesh&&o.geometry===F.petalG)pet++;if(o.isMesh&&o.geometry===F.bigLeafG)leaf++;});
   ok('the Bloom opens 25 petals in three rings over 7 broad leaves',pet===25&&leaf===7,pet+' petals, '+leaf+' leaves');run(8);}
  /* ---- the Treant ---- */
  {const W=natTreantModel();let n=0;W.g.traverse(o=>{if(o.isMesh)n++;});
   ok('the Treant has a face (two glowing eyes), two arms and two legs',W.eyes.length===2&&W.arms.length===2&&W.legs.length===2&&n>=60,n+' parts');for(const q of W.geos)q.dispose();}
  /* ---- the Gaia forest ---- */
  {const kinds={pine:0,oak:0,birch:0,blossom:0},F=nfxKit(),K=natKit(),made=[];for(let i=0;i<60;i++){const g=natTree(heroU.x,heroU.z,1);made.push(g);kinds[g.userData.kind]++;}
   const one=made.every(g=>g.children.length===1&&g.children[0].geometry.attributes.color);for(const g of made){scene.remove(g);g.userData.geo.dispose();}
   ok('the Gaia forest mixes pines, oaks, birches and blossom trees',Object.values(kinds).every(v=>v>0),JSON.stringify(kinds));ok('each tree is one vertex-coloured mesh',one);}
  /* ---- the dark set (v362: sets colour only their own element, so nature scrolls keep their colours; v356-v361 turned them purple) ---- */
  {play();const BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);equip(BY.dark.slice(0,3));const on=typeof asLive==='function';const L=crowd(8);heroU.scd={};heroU.gcd=0;const F=nfxKit(),c0=Array.from(F.petalG.attributes.color.array);fireScroll(heroU,'bloom',tStats(heroU),L.slice());run(1.4);
   /* the set swaps in its own materials, so the Bloom's own petal is found by its shape */
   let pg=null;scene.traverse(o=>{const q=o.geometry;if(o.isMesh&&q&&q!==F.petalG&&q.attributes.color&&q.attributes.position.count===F.petalG.attributes.position.count&&!pg)pg=q;});
   const v362=typeof nvpStart==='function',rec=!!pg&&pg.attributes.color.array.some((v,i)=>Math.abs(v-c0[i])>.05),sh=F.petalG.attributes.color.array.every((v,i)=>v===c0[i]);
   let shN=0;scene.traverse(o=>{if(o.isMesh&&o.geometry===F.petalG)shN++;});if(v362)ok('with the dark set the Bloom keeps its own petals: they use the shared petal, no recoloured clone',on&&AS.el==='dark'&&!rec&&sh&&shN>=20,AS.el+' recoloured '+rec+', '+shN+' shared petals');
   else ok('with the dark set the Bloom\'s petals are recoloured, the shared petal is not',on&&AS.el==='dark'&&!!pg&&rec&&sh,AS.el+' '+!!pg);
   run(8);clean();heroU.scd={};heroU.gcd=0;fireScroll(heroU,'thornwhip',tStats(heroU),crowd(4));run(.4);const vs=vcMeshes().filter(m=>m.geometry.type==='TubeGeometry');
   const pur=m=>{const c=m.geometry.attributes.color,i=c.count-1;return c.getZ(i)>c.getY(i);};
   if(v362)ok('and the vines stay green',vs.length>0&&!vs.some(pur),vs.length+' vines');else ok('and the vines turn purple too',vs.length>0&&vs.every(pur),vs.length+' vines');run(6);equip([]);}
  /* the kit made during a dark-set cast keeps its own colours (the set recolours clones of it, never the shared parts) */
  {play();const BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);equip(BY.dark.slice(0,3));const k0=NFX.k;NFX.k=null;const K=asRun(()=>nfxKit());NFX.k=k0;
   const c=K.petalG.attributes.color.array,n=c.length/3;equip([]);
   ok('a kit first built in a dark-set cast keeps its pink petals and plain materials',c[(n-1)*3]>c[(n-1)*3+1]*1.6&&!(K.vc.userData&&(K.vc.userData.asOwn||K.vc.userData.adkTex))&&!(K.rose.userData&&K.rose.userData.asOwn),[c[(n-1)*3],c[(n-1)*3+1],c[(n-1)*3+2]].map(v=>v.toFixed(2))+' '+JSON.stringify(K.vc.userData));}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;natVine=nv0;scene.add=S0;try{clean();if(typeof asClear==='function')asClear();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
