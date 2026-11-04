(function(){
/* v483 Armoured bosses: every boss that can be Armoured has its own design (ARMOR_D[type], one cached kit per boss, the ogre one per variant), each
   piece sits on the moving part it belongs to (wing, neck and head, jaw, tail segment, leg, arm, wheel, wing flap...), moves with it, fits it, and
   leaves with the dress. Run on the dev page: __kk.ev(await (await fetch('/tests/arb-test.js')).text()). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
const BOSSES=['ogre','kikimora','dragon','dragon2','dragon2a','dragon3','dragon3a','wyrm','golem','golem2','beast','arachne','colossus','dreadk','voidk','wyrm2','wyrm2a','ophanim','seraph','wyrmf'];
/* the moving parts each boss's armour must ride (from the model the boss was built with) */
const moving=(t,m)=>{const L=m.limbs||{},P=[];
  if(m.heads){P.push(...m.heads,...(m.jaws||[]),...m.tail,...m.wings);}
  else if(L.spider){P.push(...L.legs.map(q=>q.p),...L.arms.map(a=>a.p));if(t==='arachne')P.push(L.arms[0].p.parent);}
  else if(L.quad)P.push(L.quad.FL,L.quad.FR,L.quad.BL,L.quad.BR);
  else if(L.snake){P.push(...L.snake,L.hd,L.jaw,...(L.legs||[]),...(L.wings||[]).map(w=>w.o));}
  else if(L.armL)P.push(L.armL,L.armR,L.legL,L.legR);
  if(t==='ophanim'||t==='seraph')P.push(...m.wings,...m.spin.map(q=>q.o).filter(o=>o.children.some(c=>c.geometry&&c.geometry.type==='TorusGeometry')));
  return P;};
const armOf=e=>{const D=e.b.children.find(o=>ARB.att.has(o));return D?{D,info:ARB.att.get(D)}:null;};
const pieces=e=>{const L=[];e.b.traverse(o=>{if(o.isMesh&&o.userData.arb)L.push(o);});return L;};
try{
  meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  ok('every boss that can be Armoured has a design of its own (ARMOR_D)',BOSSES.every(t=>typeof ARMOR_D[t]==='function'&&EN[t]&&EN[t].boss),BOSSES.filter(t=>typeof ARMOR_D[t]!=='function').join());
  const rows=[],bad=[],kits=new Set(),stat={};
  for(const t of BOSSES){const vs=t==='ogre'?[0,1,2,3,4]:[0];for(const v of vs){
    spawnEnemy({type:t,v,elite:['armored'],invOK:true},120);const e=enemies[enemies.length-1],m=ARB_M.get(e.b),A=armOf(e),P=pieces(e);
    if(!A){bad.push(t+':'+v+' no armour of its own');clean();continue;}
    const key=Object.keys(ARB.kits).find(k=>{const K=ARB.kits[k];return P.length&&Object.values(K).some(L=>L.some(q=>q.geo===P[0].geometry));});kits.add(key);
    /* every moving part carries armour */
    const mv=moving(t,m),bare=mv.filter(p=>!p.children.some(c=>c.userData.arb));if(bare.length)bad.push(t+':'+v+' '+bare.length+'/'+mv.length+' moving parts bare');
    /* each piece fits the part it is on: its box (in the part's space) overlaps the part's own geometry */
    let far=0;const bp=new THREE.Box3(),ba=new THREE.Box3(),mx=new THREE.Matrix4();
    for(const q of P){const par=q.parent===A.D?e.b:q.parent;bp.makeEmpty();
      par.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(par.matrixWorld).invert();
      par.traverse(o=>{if(o.isMesh&&!o.userData.arb&&o.geometry&&o.visible&&!(o.material&&o.material.transparent)){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();ba.copy(o.geometry.boundingBox).applyMatrix4(mx.multiplyMatrices(inv,o.matrixWorld));bp.union(ba);}});
      if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();ba.copy(q.geometry.boundingBox).applyMatrix4(mx.multiplyMatrices(inv,q.matrixWorld));
      if(!bp.isEmpty()&&!ba.intersectsBox(bp.clone().expandByScalar(.03)))far++;}
    if(far)bad.push(t+':'+v+' '+far+' pieces off their part');
    /* the pieces ride their parts through the animation: same parent, same local transform, and the parts really moved */
    const loc=P.map(q=>({q,p:q.parent,m:q.matrix.clone()})),w0=mv.map(p=>p.getWorldQuaternion(new THREE.Quaternion()));
    paused=false;for(let i=0;i<25;i++)update(1/30);paused=true;e.hp=e.maxHp;
    const moved=mv.filter((p,i)=>p.getWorldQuaternion(new THREE.Quaternion()).angleTo(w0[i])>1e-4).length,kept=loc.every(o=>o.q.parent===o.p&&o.q.matrix.equals(o.m));
    if(!kept)bad.push(t+':'+v+' a piece moved off its part');
    stat[t+(t==='ogre'?v:'')]={pieces:P.length,parts:new Set(P.map(q=>q.parent)).size,moving:mv.length,moved,tri:ARB.stat[key]&&ARB.stat[key].tri};
    if(mv.length&&!moved)bad.push(t+':'+v+' no part moved');
    clean();}}
  ok('each boss wears its own design on every moving part, each piece fits the part it sits on and rides it through the animation',!bad.length,bad.slice(0,8).join('; '));
  ok('one kit per boss: 23 designs for the 20 bosses (the ogre four: Brute, Chieftain, Scarred, and the Brute set with the Gem Carrier crown left bare)',kits.size===23&&!kits.has(undefined),[...kits].join());
  out.push(['numbers per boss',true,Object.entries(stat).map(([k,s])=>k+' '+s.pieces+' meshes on '+s.parts+' parts, '+s.tri+' tris').join('; ')]);
  ok('a boss with armour never draws more than 40 extra meshes',Object.values(stat).every(s=>s.pieces<=40),Object.entries(stat).filter(([k,s])=>s.pieces>40).map(([k,s])=>k+' '+s.pieces).join());
  /* shared: two Armoured dragons share every geometry and material, and no new material is made per foe */
  {spawnEnemy({type:'dragon3',elite:['armored'],invOK:true},120);spawnEnemy({type:'dragon3',elite:['armored'],invOK:true},120);const[a,b]=enemies.slice(-2),pa=pieces(a),pb=pieces(b);
   const mats=new Set([...pa,...pb].map(q=>q.material));ok('geometry is cached per boss and materials are shared (no per-foe allocation)',pa.length===pb.length&&pa.every((q,i)=>q.geometry===pb[i].geometry)&&[...mats].every(m=>Object.values(ARB_MATS).includes(m)),pa.length+' / '+pb.length+' meshes, '+mats.size+' materials');
   /* cleanup in game */
   removeEnemy(a);ok('a removed foe takes its armour with it (nothing left in the scene)',!a.g.parent&&pieces(a).every(q=>{let o=q;while(o.parent)o=o.parent;return o!==scene;}),'');clean();}
  /* non-bosses and other units keep the class template; the a-forms still get something new on top of their own plates */
  {spawnEnemy({type:'soldier',v:1,elite:['armored']},10);const e=enemies[enemies.length-1];ok('troops without a design keep the class template',!armOf(e)&&pieces(e).length===0,'');clean();
   const n={};for(const t of ['dragon2','dragon2a','dragon3','dragon3a','wyrm2','wyrm2a']){spawnEnemy({type:t,elite:['armored'],invOK:true},120);const e2=enemies[enemies.length-1];n[t]=pieces(e2).filter(q=>q.material===ARB_GILD).length;clean();}
   ok('the already-armoured forms get gilded plating over their own plates',n.dragon2a>=10&&n.dragon3a>=10&&n.wyrm2a>=9,JSON.stringify(n));}
  /* Bestiary: toggling the elite look on and off leaves no piece on the model's bones */
  {const bad2=[];for(const t of BOSSES){try{openGallery();openVar(t);for(let i=0;i<ELITE_CYCLE.length*2;i++){galElite(true);GV.items.forEach(it=>{if(it.fx)animEliteFx(it.fx,1,.05,false,null);});
        const arm=ELITE_CYCLE[GV.eIdx].includes('armored');GV.items.forEach(it=>{let n=0;it.m.g.traverse(o=>{if(o.userData.arb)n++;});if(arm?n===0:n>0)bad2.push(t+' '+ELITE_CYCLE[GV.eIdx].join('+')+' '+n);});}
      closeVar(true);closeGallery();}catch(err){bad2.push(t+' '+err.message);try{closeGallery();}catch(e){}}}
   ok('the Bestiary shows and takes off every boss armour on every variant (elite button), nothing left on the bones',!bad2.length,bad2.slice(0,5).join('; '));}
  /* milestone bosses never get a modifier; ordinary bosses can from wave 100 */
  {let ms=0,el=0,nb=0;const ar=Object.keys(MSB_AT);for(const a of ar){meta.arena=a;state='menu';clearWorld();buildMap(31);MAP.fresh=true;
     for(const w of Object.keys(MSB_AT[a]).map(Number))for(let k=0;k<12;k++){const W=buildWave(w),B=W.q.find(x=>x.ms);if(B){ms++;if(B.elite)el++;}}}
   meta.arena='plains';state='menu';clearWorld();buildMap(31);MAP.fresh=true;for(let k=0;k<30;k++){const W=buildWave(110),B=W.q[W.q.length-1];if(B.elite)nb++;}
   ok('milestone bosses never carry a modifier (every land, both waves), other bosses from wave 100 still can',ms>=ar.length*2*12&&el===0&&nb>0,ms+' milestone waves, '+el+' with a modifier; '+nb+'/30 wave-110 bosses elite');}
  /* the lands that dress foes after the elite gear (snow, tundra, white waste, taiga, highlands) */
  {const bad3=[];for(const a of ['snow','tundra','whitewaste','taiga','highlands'].filter(a=>ARENAS[a])){try{meta.arena=a;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;lives=1e9;clean();
      for(const t of ['dragon','golem2','arachne','wyrmf','ogre','seraph']){spawnEnemy({type:t,elite:['armored'],invOK:true},120);const e=enemies[enemies.length-1];if(!armOf(e)&&pieces(e).length===0)bad3.push(a+':'+t+' lost its armour');paused=false;update(1/30);update(1/30);paused=true;}
      clean();clearWorld();const left=[];scene.traverse(o=>{if(o.userData&&o.userData.arb)left.push(o);});if(left.length)bad3.push(a+': '+left.length+' pieces left after clearWorld');}catch(err){bad3.push(a+' '+err.message);}}
   ok('Armoured bosses keep their armour on the snow, tundra, white waste, taiga and highlands lands, and the run ending clears it',!bad3.length,bad3.slice(0,5).join('; '));}
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=oe;try{clean();state='menu';paused=false;clearWorld();meta.arena=a0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
