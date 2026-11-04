(function(){
/* v484 Regenerating variants, the Shielded bubble, 3D elite markers. Run on the dev page: __kk.ev(await (await fetch('/tests/rgx-test.js')).text()). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;fx.forEach(f=>scene.remove(f.o));fx.length=0;};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
const start=ar=>{meta.arena=ar||'plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();towers.forEach(t=>{scene.remove(t.g);});towers=[];};
const spawn=(type,el,w)=>{spawnEnemy({type,v:0,elite:el,invOK:true},w||40);const e=enemies[enemies.length-1];e.spd=0;return e;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
try{
  start();
  ok('the module is there: five regeneration looks, the shield and the marker',typeof rgxSurf==='function'&&typeof shxShatter==='function'&&typeof mkxGeo==='function'&&RGX.V.length===5,RGX.V.map(v=>v.n).join(', '));
  /* every look on every unit, troops and bosses */
  {const types=GAL_UNITS.filter(t=>EN[t]),bad=[];let n=0;
   for(const t of types)for(let v=0;v<5;v++){try{RGX.pick=v;const e=spawn(t,['regen'],120);RGX.pick=null;const R=e.eliteFx&&e.eliteFx.rg;n++;
       if(!R||R.v!==v)bad.push(t+':'+v+' no look');else{const parts=R.objs.filter(o=>o.parent).length;if(parts<1||(!R.glow.length&&!R.dyn.length&&!R.ring))bad.push(t+':'+v+' '+parts+' parts');
         for(const o of R.objs){let p=o;while(p&&p!==e.g)p=p.parent;if(p!==e.g){bad.push(t+':'+v+' piece off the foe');break;}}}
       for(let k=0;k<4;k++)update(.05);}catch(err){bad.push(t+':'+v+' '+err.message);}finally{RGX.pick=null;}clean();}
   ok('each of the five looks dresses every unit, troops and bosses, and is fixed to the foe ('+types.length+' units)',!bad.length&&n>=types.length*5,bad.slice(0,6).join('; ')+' n='+n);}
  /* the look is picked per foe from its spawn: varied, and the same again in a new run */
  {const seq=()=>{start();const L=[];for(let i=0;i<20;i++){const e=spawn(i%2?'soldier':'peasant',['regen']);L.push(e.eliteFx.rg.v);}clean();return L;};const A=seq(),B=seq();
   ok('the look is chosen per foe from its spawn (all five appear in 20 foes, and a new run repeats it)',new Set(A).size===5&&A.join()===B.join(),A.join(''));}
  /* the heal is unchanged, fire and burns stop it for 2 s */
  start();
  {const e=spawn('soldier',['regen']);e.maxHp=1000;e.hp=500;e.shield=0;const h0=e.hp;update(.1);
   ok('the heal is unchanged: 2.5% of max health a second (25 hp in 1 s on 1000)',near(e.hp-h0,2.5,1e-9)&&e.regen===.025,(e.hp-h0).toFixed(6)+' in 0.1 s');
   hurt(e,10,'magic',{el:'fire'});const h1=e.hp;let healed=-1;for(let i=1;i<=30;i++){update(.1);if(healed<0&&e.hp>h1+1e-9)healed=i;}
   ok('a fire hit stops it for exactly 2 s (no heal in the next 20 steps of 0.1 s, the 21st heals 2.5)',healed===21&&near(e.hp-h1,2.5*10,1e-6),'first heal on step '+healed+', +'+(e.hp-h1).toFixed(3)+' over 3 s');
   e.hp=500;e.rgSup=0;applyBurn(e,1e-6,1,{el:'fire'});const h2=e.hp;let first=-1;for(let i=1;i<=40;i++){update(.1);if(first<0&&e.hp>h2+1e-3)first=i;}
   ok('a burn stops it while it burns and for 2 s after (a 1 s burn: the first heal on step 31)',first===31,'first heal on step '+first);
   e.hp=500;e.rgSup=0;hurt(e,5,'phys',{});const h3=e.hp;update(.1);ok('other damage does not stop it',near(e.hp-h3,2.5,1e-9),(e.hp-h3).toFixed(4));clean();}
  {const e=spawn('peasant',null);e.maxHp=1000;e.hp=400;e.regen=.025;update(.1);const a=e.hp-400;hurt(e,1,'magic',{el:'fire'});const h=e.hp;update(.1);
   ok('Starfall regeneration (no modifier) still heals, and fire stops it too',near(a,2.5,1e-9)&&e.hp===h,'+'+a.toFixed(3)+' then '+(e.hp-h));clean();}
  {const e=spawn('peasant',['regen']);e.maxHp=1000;e.hp=500;e.regen=0;e.elites=[];update(.1);ok('a stripped Regenerating (regen 0) does not heal',e.hp===500,e.hp);clean();}
  /* the healing shows: pulses while hurt, none at full health; the look sears under fire */
  {const e=spawn('soldier',['regen']);e.hp=e.maxHp*.5;for(let i=0;i<40;i++)update(.05);const R=e.eliteFx.rg,p=R.pulses||0;
   const f=spawn('soldier',['regen']);for(let i=0;i<40;i++)update(.05);const q=f.eliteFx.rg.pulses||0;
   ok('the heal pulses over the body while it heals (2 s at half health) and not at full health',p>=1&&q===0,p+' / '+q);
   hurt(e,1,'magic',{el:'fire'});for(let i=0;i<8;i++)update(.05);ok('under fire the look sears (sear > 0.9)',R.sear>.9,R.sear.toFixed(2));
   for(let i=0;i<70;i++)update(.05);ok('and recovers after the 2 s',R.sear<.2,R.sear.toFixed(2));clean();}
  /* the shield: fitted, ripples, cracks, shatter and clean-up */
  {const e=spawn('rider',['shielded']),X=e.eliteFx.shx;ok('the bubble is fitted to the model (an ellipsoid round its bounds)',X&&e.bubble===X.g&&X.g.scale.y!==X.g.scale.x,X&&X.g.scale.toArray().map(v=>v.toFixed(2)).join('x'));
   const f0=fx.length;hurt(e,e.maxShield*.1,'magic',{src:{x:e.x+3,z:e.z}});const s=X.rip.find(r=>r.age===0);update(.05);
   ok('a hit ripples the bubble on the side it came from',!!s&&s.m.visible&&new THREE.Vector3(0,0,1).applyQuaternion(s.m.quaternion).dot(X.g.worldToLocal(new THREE.Vector3(e.x+3,.7,e.z)).normalize())>.9,'');
   for(let i=0;i<12;i++)update(.05);ok('the ripple ends',X.rip.every(r=>!r.m.visible),'');
   hurt(e,e.maxShield*.5,'magic',{});update(.02);ok('cracks show under 50%',X.c1.visible&&!X.c2.visible,'');
   hurt(e,e.maxShield,'magic',{});const n1=fx.length-f0;ok('the break shatters the bubble into shards (and removes it)',X.broken&&!e.bubble&&!X.g.parent&&n1>=20,n1+' fx');
   for(let i=0;i<40;i++)updFx(.05);ok('the shards are gone within 2 s',fx.length<=f0,fx.length+' left');clean();}
  {const e=spawn('soldier',['shielded']),X=e.eliteFx.shx,f0=fx.length;e.shield=0;e.bubble.parent.remove(e.bubble);e.bubble=null;e.eliteFx.shield=null;update(.05);
   ok('a bubble taken away by another path (the split, a strip) shatters too',X.broken&&fx.length>f0,'');clean();}
  {const e=spawn('soldier',['shielded']);hurt(e,e.shield+e.hp+10,'magic',{});ok('a hit that breaks the shield and kills shatters it and the foe is gone',e.dead&&e.eliteFx.shx.broken,'');for(let i=0;i<40;i++)updFx(.05);clean();}
  /* the markers keep the aura API */
  {const a=spawn('peasant',['swift','regen']),b=spawn('soldier',['swift']);
   ok('the marker is a 3D band (shared geometry) on the foe, the second one outside the first',a.aura&&a.aura2&&a.aura.geometry===b.aura.geometry&&a.aura.parent===a.g&&a.aura2.geometry!==a.aura.geometry&&mkxGeo('swift',0).boundingSphere.radius<mkxGeo('regen',1).boundingSphere.radius,'');
   a.aura.material.opacity=.35;a.aura2.visible=false;a.aura.scale.setScalar(2);update(.05);
   ok('.material.opacity, .visible and .scale work on it, and its glow follows the opacity',b.aura.material.opacity===.85&&a.aura.userData.mkx.h.material.opacity<.25&&a.aura.scale.x===2,a.aura.userData.mkx.h.material.opacity.toFixed(2));
   const m1=a.aura2.material,h1=a.aura.userData.mkx.h.material;let disp=0;m1.addEventListener('dispose',()=>disp++);h1.addEventListener('dispose',()=>disp++);removeEnemy(a);ok('removing the foe disposes its own marker materials',disp===2,disp);clean();}
  /* nothing stays behind */
  {start();const n0=scene.children.length;for(const t of ['peasant','dragon','golem','ogre'])for(const el of [['regen'],['shielded'],['regen','shielded']])spawn(t,el,120);for(let i=0;i<30;i++){update(.05);updFx(.05);}
   for(const e of enemies.slice()){hurt(e,e.hp+(e.shield||0)+1e9,'magic',{});}for(let i=0;i<40;i++)updFx(.05);clean();ok('nothing stays in the scene after the foes die',scene.children.length===n0,scene.children.length+' vs '+n0);}
  /* other lands dress it after the elite gear */
  {const bad=[];for(const ar of ['snow','tundra','whitewaste','taiga','highlands']){try{start(ar);for(const t of ['soldier','rider','ogre'])for(const el of [['regen'],['shielded']]){const e=spawn(t,el,110);for(let i=0;i<5;i++)update(.05);if(el[0]==='shielded'&&!(e.bubble&&e.bubble.children[0].material===SHX.mat))bad.push(ar+' '+t+' bubble restyled');}}catch(err){bad.push(ar+' '+err.message);}clean();}
   ok('on the snow, tundra, white waste, taiga and highlands the looks are built and the bubble keeps its shader',!bad.length,bad.join('; '));}
  /* the Bestiary */
  {const bad=[];try{openGallery();openVar('soldier');let seen=[];for(let i=0;i<ELITE_CYCLE.length+6;i++){galElite(true);const t=$('#gvElite').textContent;const m=t.match(/Regenerating \(([^)]+)\)/);if(m)seen.push(m[1]);GV.items.forEach(it=>{if(it.fx)animEliteFx(it.fx,1+i,.05,false,null);});}
     closeVar(true);closeGallery();ok('the Bestiary label names the look, the button steps through all five, and the tip tells the counterplay',new Set(seen).size===5&&$('#gvElite')!==null,seen.join(','));}catch(err){bad.push(err.message);try{closeGallery();}catch(e){}}
   ok('the Bestiary has no errors',!bad.length,bad.join('; '));}
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=oe;RGX.pick=null;try{clean();state='menu';paused=false;clearWorld();meta.arena=a0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
