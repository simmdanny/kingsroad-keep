(function(){
/* v479 elite looks by modifier: eliteDress builds each modifier through ELD[affix](C), animates through ELA and emits in-game particles through ELP;
   armour uses ARMOR_D[type] when a unit has its own design, else the class template. Run on the dev page: __kk.ev(await (await fetch('/tests/elb-test.js')).text()). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
try{
  meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  ok('one builder per modifier that has gear, one animator for the ribbons and the bubble, particles for regen and swift',
    ['armored','swift','regen','shielded'].every(k=>typeof ELD[k]==='function')&&typeof ELA.swift==='function'&&typeof ELA.shielded==='function'&&typeof ELP.regen==='function'&&typeof ELP.swift==='function',
    Object.keys(ELD).join()+' / '+Object.keys(ELA).join()+' / '+Object.keys(ELP).join());
  /* every troop and boss can wear every modifier it may roll, in game and in the Bestiary */
  const types=GAL_UNITS.filter(t=>EN[t]),bad=[];let n=0;
  for(const t of types)for(const a of Object.keys(AFFIX)){if((t==='knight'||t==='monk')&&a==='armored')continue;
    try{spawnEnemy({type:t,v:0,elite:[a],invOK:true},120);const e=enemies[enemies.length-1];n++;if(!e.elites||e.elites[0]!==a)bad.push(t+':'+a+' not elite');
      if(e.eliteFx){animElite(e,.05);animElite(e,.05);}if(a==='shielded'&&!(e.bubble&&e.bubble.parent))bad.push(t+': no bubble');}catch(err){bad.push(t+':'+a+' '+err.message);}clean();}
  ok('every unit in the Bestiary takes every modifier without an error ('+types.length+' units)',!bad.length&&n>50,bad.slice(0,6).join('; ')+' n='+n);
  /* a unit with its own armour design uses it, and gets the unit's variant */
  {let got=null;ARMOR_D.soldier=C=>{got={type:C.type,v:C.variant,g:!!C.g,B:!!C.B};C.plate(.1,.1,.1,0,.3,0);};
   spawnEnemy({type:'soldier',v:1,elite:['armored']},10);const e=enemies[enemies.length-1];delete ARMOR_D.soldier;
   ok('a unit with its own armour design uses it (ARMOR_D[type]) and is told its variant',got&&got.type==='soldier'&&got.v===e.variant&&got.g&&got.B,JSON.stringify(got)+' variant '+e.variant);clean();
   spawnEnemy({type:'soldier',v:1,elite:['armored']},10);const e2=enemies[enemies.length-1];let plates=0;e2.b.traverse(o=>{if(o.isMesh&&o.material===EM_METAL)plates++;});
   ok('without one, the class template (armorClass) still dresses it',plates>=4,plates+' steel pieces');clean();}
  /* the marker ring under an elite */
  {spawnEnemy({type:'peasant',v:0,elite:['swift','regen']},40);const e=enemies[enemies.length-1];
   ok('each modifier puts its marker under the foe (eliteRing)',e.aura&&e.aura2&&e.aura.parent===e.g&&e.aura2.parent===e.g,'');clean();}
  /* the Bestiary cycle */
  {const bad2=[];for(const t of ['peasant','soldier','rider','raven','ram','wolf','knight','ogre','dragon'].filter(t=>EN[t])){try{openGallery();openVar(t);for(let i=0;i<ELITE_CYCLE.length;i++){galElite(true);GV.items.forEach(it=>{if(it.fx)animEliteFx(it.fx,1,.05,false,null);});}closeVar(true);closeGallery();}catch(err){bad2.push(t+' '+err.message);try{closeGallery();}catch(e){}}}
   ok('the Bestiary shows every modifier on every troop without an error',!bad2.length,bad2.join('; '));}
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=oe;try{clean();state='menu';paused=false;clearWorld();meta.arena=a0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
