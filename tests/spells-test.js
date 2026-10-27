(function(){
/* Spell test: casts scrolls at a fixed power (P = 100) on unkillable test foes and reports damage per cast and per second of cooldown,
   then triggers every new synergy and checks it fired. Run via __kk.ev on the dev build:
   __kk.ev(await (await fetch('/tests/spells-test.js')).text()); then __st.damage(['frostshard',...]) and __st.combos(). */
const S=window.__st={};
const caster=()=>{const p=posAt(5,ROUTES[0]);return{x:p[0]+1.2,z:p[1]+.6,topY:1.1,c:0,r:0,scd:{},isTest:true};};
function reset(){if(state!=='playing'){newGame(1);}paused=true;auto=0;lives=1e9;meta.scrAuto=false;for(const e of enemies)removeEnemy(e);enemies=[];spawners.length=0;
  fx.slice().forEach(f=>{f.life=0;});updFx(.001);NSUN.length=0;CLOUD.left=0;STORM.left=0;}   // leftover effects from an earlier cast must not touch the next test
function foes(n,hp,d0){const L=[];for(let i=0;i<n;i++){spawnEnemy({type:'soldier'},1);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d0+i*.18;e.off=(i%3-1)*.25;e.maxHp=e.hp=hp;e.spd=0;e.res={};e.armor=0;e.shield=0;moveEnemy(e,0);L.push(e);}return L.sort((a,b)=>b.dist-a.dist);}
function run(sec){for(let i=0;i<sec/.05;i++){update(.05);updFx(.05);}}
function cast(k,t,list,P,o){o=o||{src:t,el:SPELL_EL[k],spell:k};castScrollNow(k,t,{range:3,dmg:P,spellP:P},list,P,o);}
S.damage=(keys,n)=>{const out=[];for(const k of keys){const row={k,r:SPELLS_S[k].r,cd:SPELLS_S[k].cd};for(const [lab,cnt] of [['one',1],['pack',8]]){reset();const L=foes(cnt,1e9,8);const t=caster();
      try{cast(k,t,L,100);run(9);}catch(err){row.err=err.message;}const dmg=L.reduce((s,e)=>s+(e.maxHp-Math.max(0,e.hp)),0);row[lab]=Math.round(dmg);row[lab+'/s']=+(dmg/SPELLS_S[k].cd).toFixed(1);}
    out.push(row);}reset();return out;};
/* same, but the test foes walk the road at speed 0.9 (zones, delayed strikes and lead aim count properly); averaged over reps casts */
S.walk=(keys,reps)=>{reps=reps||3;const out=[];for(const k of keys){const row={k,r:SPELLS_S[k].r,cd:SPELLS_S[k].cd};for(const [lab,cnt] of [['one',1],['pack',8]]){let tot=0;
      for(let i=0;i<reps;i++){reset();const L=foes(cnt,1e9,3.6);L.forEach(e=>{e.spd=.9;});const t=caster();try{cast(k,t,L,100);run(10);}catch(err){row.err=err.message;}tot+=L.reduce((s,e)=>s+(e.maxHp-Math.max(0,e.hp)),0);}
      row[lab]=Math.round(tot/reps);}out.push(row);}reset();return out;};
S.combos=()=>{const res={},had=Object.assign({},meta.combos||{});meta.combos={};const t=caster();
  const tryC=(id,setup)=>{reset();try{setup();run(6);}catch(err){res[id]='ERR '+err.message;return;}res[id]=meta.combos[id]?'fired':'NOT fired';};
  tryC('shatterfrost',()=>{const L=foes(4,1e6,8);const a=L[0];a.maxHp=1e6;a.hp=10;a.chillT=3;S._sh=L;cast('frostshard',t,[a],100);});
  res.shatterDmg=Math.round(S._sh.slice(1).reduce((s,e)=>s+(e.maxHp-e.hp),0));
  tryC('overload',()=>{const L=foes(3,1e9,8);L[0].zapT=4;cast('emberbolt',t,[L[0]],100);});
  tryC('conductor',()=>{const L=foes(5,1e9,8);L[0].heldT=4;cast('staticspark',t,[L[0]],100);});
  tryC('flashpoint',()=>{const L=foes(3,1e9,8);applyBurn(L[0],50,3,{src:t,el:'fire'});cast('lightbolt',t,[L[0]],100);});
  tryC('frostbite',()=>{const L=foes(2,1e9,8);cast('wither',t,L,100);addFx(new THREE.Group(),1,null,()=>{L.forEach(e=>e.chillT=5);});});
  tryC('supercell',()=>{const L=foes(4,1e9,8);CLOUD.left=5;cast('balllightning',t,L,100);});
  tryC('sunfire',()=>{const L=foes(4,1e9,8);cast('sunflare',t,L,100);addFx(new THREE.Group(),1.5,null,()=>cast('cinders',t,L,100));});
  tryC('ashenflock',()=>{const L=foes(4,1e9,6.5);L.forEach(e=>applyBurn(e,50,8,{src:t,el:'fire'}));cast('crows',t,L,100);});
  tryC('absolutezero',()=>{const L=foes(4,1e9,8);cast('icetomb',t,L,100);addFx(new THREE.Group(),.6,null,()=>cast('comet',t,L,100));});
  /* batch 6 (v316, Lightning Rod withdrawn in v317) */
  tryC('wildfire',()=>{const L=foes(5,1e9,8);L.slice(1).forEach(e=>e.zapT=6);cast('catchflame',t,[L[0]],100);});
  tryC('firestorm',()=>{const L=foes(4,1e9,8);cast('firewall',t,L,100);addFx(new THREE.Group(),.2,null,()=>cast('firetornado',t,L,100));});
  meta.combos=Object.assign(had,meta.combos);reset();return res;};
return 'spells test loaded';})()
