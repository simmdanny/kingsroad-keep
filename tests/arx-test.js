(function(){
/* v482 Armoured, one design per troop: ARMOR_D.peasant/.soldier/.rider/.raven/.ram/.wolf build each variant's own armour (never the class template),
   the static armour merges into at most 2 cached meshes, the pieces on moving parts are parented to those pivots and stay attached through a walk cycle,
   geometries are built once per (type, variant, body mesh) and shared, nothing is left behind, and it runs on every arena.
   Run on the dev page: __kk.ev(await (await fetch('/tests/arx-test.js')).text()). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena,dex0=meta.dex;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
const NV={peasant:PEASANT_VARIANTS.length,soldier:5,rider:5,raven:5,ram:5};
const LIMBS={peasant:['armL','armR','legL','legR'],soldier:['armL','armR','legL','legR'],rider:['legFL','legFR','legBL','legBR'],raven:['wingL','wingR'],ram:['wh0','wh1','wh2','wh3'],wolf:['hd','legFL','legBR']};
const start=a=>{meta.arena=a;lsSet(KR,null);state='menu';clearWorld();buildMap(482);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();};
const dressOf=e=>e.b.children.find(c=>c.userData&&c.userData.arx);
const spawnA=(type,v,alpha)=>{if(type==='wolf')TGP.alpha=!!alpha;spawnEnemy({type,v,elite:['armored']},30);TGP.alpha=false;const e=enemies[enemies.length-1];e.hp=e.maxHp=1e9;return e;};
try{
  meta.arenas=meta.arenas||{};['snow','tundra','whitewaste','taiga','highlands'].forEach(k=>meta.arenas[k]=1);
  ok('each of the six troops has a design of its own',['peasant','soldier','rider','raven','ram','wolf'].every(t=>typeof ARMOR_D[t]==='function'),Object.keys(ARMOR_D).join());
  /* every unit and variant, in the Plains and with the Highlands kits, wears its own design: tagged, no class-template steel, limb pieces on the right pivots */
  for(const ar of['plains','highlands']){start(ar);const bad=[];let n=0;
    for(const t in NV)for(let v=0;v<NV[t];v++){const e=spawnA(t,v),D=dressOf(e);n++;
      if(!D||D.userData.arx.type!==t){bad.push(t+v+' no design');continue;}if(!D.userData.arx.key.startsWith(t+':'+e.variant+':'))bad.push(t+v+' wrong key '+D.userData.arx.key);
      let tpl=0;e.b.traverse(o=>{if(o.isMesh&&(o.material===EM_METAL||o.material===EM_DARK||o.material===EM_RIVET)&&!o.userData.arx)tpl++;});if(tpl)bad.push(t+v+' has '+tpl+' template pieces');
      const st=D.children.filter(o=>o.userData.arx==='body').length;if(st<1||st>2)bad.push(t+v+' static meshes '+st);
      const L=e.b.userData.arxL||{};const on=LIMBS[t].filter(k=>L[k]&&L[k].children.some(o=>o.userData.arx===k));if(on.length<LIMBS[t].length-(t==='peasant'&&(v===5)?4:t==='peasant'?2:0))bad.push(t+v+' limbs '+on.join('/'));
      if(Math.abs(e.armor-(EN[t].armor+.25))>1e-6&&e.armor<.85)bad.push(t+v+' armour '+e.armor);}
    start('taiga');for(const al of[0,1]){const e=spawnA('wolf',0,al),D=dressOf(e);n++;if(!D||D.userData.arx.key!=='wolf:'+al)bad.push('wolf'+al+' '+(D&&D.userData.arx.key));const L=e.b.userData.arxL;if(!L||!LIMBS.wolf.every(k=>L[k]&&L[k].children.some(o=>o.userData.arx===k)))bad.push('wolf'+al+' limbs');}
    ok(`every variant wears its own design (${ar} kits, ${n} units incl. both wolves): tagged, no class-template pieces, 1-2 static meshes, pieces on its moving parts, +0.25 armour`,!bad.length&&n>=30,bad.slice(0,6).join('; '));clean();}
  /* the designs differ: per type the variants build different geometry, and the highland kits get their own fit */
  {start('plains');const sig={};for(const t in NV)for(let v=0;v<NV[t];v++){const m=t==='peasant'?peasantModel(v):unitModel(t,v),D=eliteDress(t,['armored'],m.b.children[0],m.variant);m.b.add(D.g);let n=0;
     m.b.traverse(o=>{if(o.isMesh&&o.userData.arx){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=3)n+=Math.abs(p.getX(i))+Math.abs(p.getY(i))*2+Math.abs(p.getZ(i))*3;}});sig[t+v]=n.toFixed(3);m.b.remove(D.g);}
   const dup=[];for(const t in NV){const s=new Set();for(let v=0;v<NV[t];v++)s.add(sig[t+v]);if(s.size<NV[t])dup.push(t+':'+[...Array(NV[t]).keys()].map(v=>sig[t+v]).join('/'));}
   ok('within each troop every variant is a different build (its armour geometry differs)',!dup.length,dup.join('; ')||Object.entries(sig).slice(0,6).map(x=>x.join('=')).join(' '));clean();}
  /* caching: the same (type, variant) reuses the geometries and builds nothing new; foes share the two materials */
  {start('plains');const e1=spawnA('soldier',1),b0=ARX_STATS.builds,e2=spawnA('soldier',1),e3=spawnA('rider',2),b1=ARX_STATS.builds,e4=spawnA('rider',2);
   const g=e=>{const a=[];dressOf(e).children.forEach(o=>{if(o.userData.arx)a.push(o.geometry);});Object.values(e.b.userData.arxL).forEach(p=>p.children.forEach(o=>{if(o.userData.arx)a.push(o.geometry);}));return a;};
   const A=g(e1),B=g(e2),Cg=g(e3),Dg=g(e4),mats=new Set();[e1,e2,e3,e4].forEach(e=>e.b.traverse(o=>{if(o.isMesh&&o.userData.arx)mats.add(o.material);}));
   ok('a second foe of the same variant builds nothing and shares every geometry',b0===ARX_STATS.builds-0&&ARX_STATS.builds===b1&&A.length===B.length&&A.every((x,i)=>x===B[i])&&Cg.every((x,i)=>x===Dg[i]),`builds ${b0}->${b1} pieces ${A.length}/${Cg.length}`);
   ok('all armour uses the two shared materials',mats.size===2&&mats.has(ARX_MET)&&mats.has(ARX_SOFT),mats.size);
   let per=0;dressOf(e1).children.forEach(o=>{if(o.userData.arx)per++;});per+=e1.b.userData.arxL&&Object.values(e1.b.userData.arxL).reduce((s,p)=>s+p.children.filter(o=>o.userData.arx).length,0);
   ok('a soldier\'s armour costs at most 10 meshes (2 static + up to 2 per limb)',per<=10&&per>=5,per);clean();}
  /* attachment: over a walk cycle each piece keeps its place on its pivot, and the pivots really move */
  {start('plains');const bad=[];let moved=0,checked=0;const P=new THREE.Vector3(),Q=new THREE.Vector3();
   const foes=[['peasant',2],['soldier',0],['rider',1],['raven',2],['ram',0],['wolf',0]].map(([t,v])=>{const e=spawnA(t,v);e.spd=1;return e;});
   const track=foes.map(e=>{const L=e.b.userData.arxL,ps=[];for(const k in L){const p=L[k];if(!p)continue;p.children.forEach(o=>{if(o.userData.arx){o.geometry.computeBoundingBox();const c=new THREE.Vector3();o.geometry.boundingBox.getCenter(c);ps.push({o,p,c,q0:p.quaternion.clone(),loc:o.position.clone()});}});}return{e,ps,D:dressOf(e)};});
   state='playing';paused=false;
   for(let s=0;s<40;s++){update(.033);for(const T of track){T.e.hp=T.e.maxHp;T.e.b.updateMatrixWorld(true);for(const x of T.ps){checked++;P.copy(x.c).applyMatrix4(x.o.matrixWorld);Q.copy(x.c).add(x.loc).applyMatrix4(x.p.matrixWorld);if(P.distanceTo(Q)>1e-5||x.o.parent!==x.p)bad.push(T.e.type+':'+x.o.userData.arx);if(x.p.quaternion.angleTo(x.q0)>.05)x.moved=1;}
     if(T.D.parent!==T.e.b)bad.push(T.e.type+' dress off the body');}}
   for(const T of track)for(const x of T.ps)if(x.moved)moved++;const tot=track.reduce((s,T)=>s+T.ps.length,0);
   ok('over a walk cycle every piece on a moving part stays on its pivot (arms, legs, horse legs, wings, wheels, the wolf\'s head)',!bad.length&&checked>500,`${checked} samples; ${bad.slice(0,4).join(', ')}`);
   ok('and those pivots really turn while they walk',moved>=tot*.8,`${moved}/${tot} pieces swung`);paused=true;state='menu';clean();}
  /* cleanup: a dead foe takes all of it; a Bestiary dress taken off takes its limb pieces too */
  {start('plains');const e=spawnA('soldier',2),L=e.b.userData.arxL;removeEnemy(e);let left=0;scene.traverse(o=>{if(o.isMesh&&o.userData.arx)left++;});
   ok('removeEnemy leaves no armour in the scene',left===0&&!e.g.parent,left);
   const e2=spawnA('peasant',0);clearWorld();let left2=0;scene.traverse(o=>{if(o.isMesh&&o.userData.arx)left2++;});ok('clearWorld leaves no armour in the scene',left2===0,left2);enemies=[];
   meta.dex=Object.assign({},meta.dex||{});for(const t of['soldier','rider','raven','ram','peasant','wolf'])for(let i=0;i<8;i++)meta.dex[t+':'+i]=1;
   const bad=[];for(const t of['peasant','soldier','rider','raven','ram','wolf']){openGallery();openVar(t);let mx=0;for(let i=0;i<ELITE_CYCLE.length*2;i++){galElite(true);let n=0;GV.g.traverse(o=>{if(o.isMesh&&o.userData.arx)n++;});const arm=ELITE_CYCLE[GV.eIdx].includes('armored');if(!arm&&n)bad.push(t+' '+n+' left after '+ELITE_CYCLE[GV.eIdx]);if(arm)mx=Math.max(mx,n);}
     let n2=0;GV.g.traverse(o=>{if(o.isMesh&&o.userData.arx)n2++;});if(mx===0)bad.push(t+' never armoured');closeVar(true);closeGallery();}
   ok('the Bestiary cycle puts the armour on and takes every piece off again (limb pieces too)',!bad.length,bad.slice(0,4).join('; '));meta.dex=dex0;}
  /* an artefact that strips Armoured takes the armour off */
  {start('plains');const e=spawnA('soldier',0);e.elites=['armored'];artStrip(e,false);let vis=0;e.b.traverse(o=>{if(o.isMesh&&o.userData.arx&&o.visible)vis++;});ok('stripping Armoured off a foe hides its armour',vis===0,vis);clean();}
  /* the rule stays: knights and monks never roll Armoured */
  {let bad=0;for(let i=0;i<300;i++)for(const t of['knight','monk']){const r=rollElite(60,t);if((Array.isArray(r)?r:[r]).includes('armored'))bad++;}ok('knights and monks still never roll Armoured',bad===0,bad);}
  /* every arena, with its own gear on top (snow, tundra, white waste, taiga, highlands) */
  {const bad=[];for(const ar of['plains','snow','tundra','whitewaste','taiga','highlands']){try{start(ar);for(const t of Object.keys(NV).concat(ar==='taiga'?['wolf']:[]))for(let v=0;v<(NV[t]||1);v+=2){const e=spawnA(t,v);if(!dressOf(e))bad.push(ar+' '+t+v);}
      state='playing';paused=false;for(let s=0;s<10;s++){update(.033);anim(.033,s*.033);for(const e of enemies)e.hp=e.maxHp;}renderer.render(scene,camera);paused=true;state='menu';clean();}catch(err){bad.push(ar+' '+err.message);}}
   ok('armoured troops walk and render on every arena without an error',!bad.length,bad.slice(0,5).join('; '));}
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=oe;try{clean();meta.dex=dex0;state='menu';paused=false;clearWorld();meta.arena=a0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
