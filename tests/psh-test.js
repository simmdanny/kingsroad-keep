(function(){
/* v493: no shader compiles in battle. Run on the dev page: __kk.ev(await (await fetch('/tests/psh-test.js')).text()) returns (a promise of)
   [name, ok, detail] rows. A scripted fight on a wave-120 board casts scrolls of every rarity (Common to Secret) twice, then plays a "fresh
   session": every kept program no material uses is dropped, the noted recipes are warmed (pshWarmNow, as idle time does after load), and the
   same scrolls are cast again. No program may be compiled during that fight, programs are reused, and nothing is left behind.
   Steps compile the whole scene (renderer.compile, stricter than a render: it reaches culled objects too) and render every 8th step. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),rnd0=Math.random;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const SCR=['hexspark','frostshard','darkpulse','rimebloom','riftfang','icetomb','judgment','comet',
  'voidfall','skyfall','vael','eclipse','citadel','purgatory','pulsar','wormhole'].filter(k=>SPELLS_S[k]);
const mem=()=>[renderer.info.memory.geometries,renderer.info.memory.textures];
let n=0;const step=k=>{let mx=0;for(let i=0;i<k;i++){const P=performance,t0=P.now();lives=1e9;if(enemies.length<30&&spawners.length<2){const W=buildWave(wave);spawners.push({t:0,q:W.q.slice(),w:wave});}
  for(const sp of spawners)sp.t=Math.min(sp.t,.12);update(1/60);updFx(1/60);for(const e of enemies)updBar(e);anim(1/60,t0/1000);
  if(++n%8===0)renderer.render(scene,camera);else renderer.compile(scene,camera);mx=Math.max(mx,P.now()-t0);}return mx;};
const cast=k=>{meta.spells[k]=meta.spells[k]||{lvl:1,own:1};heroU.scd={};heroU.gcd=0;const L=sortTargets(heroU,enemies.filter(e=>!e.dead));try{fireScroll(heroU,k,heroStats(),L);return true;}catch(e){return e.message;}};
const settle=()=>{for(let i=0;i<40&&fx.length>12;i++)step(30);step(60);};
const run=async()=>{
  let s=4242;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
  window.__fz=true;meta.notesSeen=NOTES_V;meta.sfx=false;meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(77);MAP.fresh=true;newGame(1);auto=0;lives=1e9;paused=false;speed=1;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;{const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);if(!heroU)spawnHero(q.c,q.r);}
  gold=1e9;const T=['archer','cannon','mage','frost','ballista','storm'];let placed=0;
  for(let r=2;r<H-2&&placed<6;r++)for(let c=1;c<W-1&&placed<6;c++){if(grid[r][c]!==0||!(grid[r+1]&&grid[r+1][c]===1))continue;try{placeTower(T[placed%T.length],c,r);placed++;c+=3;}catch(e){}}
  wave=120;step(90);
  ok('shader checks are off outside developer mode, on in it',renderer.debug.checkShaderErrors===false&&(meta.dev=true,renderer.debug.checkShaderErrors===true)&&(meta.dev=false,true));
  /* round 1: every scroll's first casts; round 2: the same again, all programs must be reused */
  const bad=[];for(const k of SCR){const r=cast(k);if(r!==true)bad.push(k+':'+r);step(45);}settle();
  ok('every scroll casts in the scripted fight',!bad.length,bad.join(' '));
  const b1=PSH.built,p1=renderer.info.programs.length,mem1=mem();let mx2=0;for(const k of SCR){cast(k);mx2=Math.max(mx2,step(45));}settle();
  ok('second casts of '+SCR.length+' scrolls compile no program (programs are reused)',PSH.built===b1&&renderer.info.programs.length===p1,(PSH.built-b1)+' built, programs '+p1+' > '+renderer.info.programs.length);
  const mem2=mem();
  ok('recipes were noted for the programs the casts built',PSH.rec.size>=20,PSH.rec.size+' recipes');
  /* a fresh session: drop every program no material uses, warm the recipes, fight again */
  let drop=0;for(const p of PSH.pins.slice())if(p.usedTimes===1){pshUnpin(p);drop++;}
  const mw0=mem(),t0=performance.now(),w=pshWarmNow(),tw=performance.now()-t0,mw1=mem();
  ok('warming uploads nothing and keeps no geometry or texture (renderer.info.memory)',mw1[0]===mw0[0]&&mw1[1]===mw0[1],mw0+' > '+mw1);
  ok('the noted recipes warm back into the same programs (three.js cache key)',w.n>0&&w.ok>=w.n*.97,w.ok+'/'+w.n+' match, '+drop+' dropped first, '+PSH.stale+' stale, '+Math.round(tw)+' ms');
  const mid0=PSH.mid,b3=PSH.built;let mx3=0;const late=[];for(const k of SCR){const b=PSH.built;cast(k);mx3=Math.max(mx3,step(45));if(PSH.built>b)late.push(k);}settle();
  const mem3=mem();ok('no shader program is compiled during the fight after warming (first casts of every rarity)',PSH.mid===mid0&&PSH.built===b3,(PSH.built-b3)+' built'+(late.length?' by '+late.join(',')+' '+JSON.stringify(PSH.log.slice(-(PSH.built-b3))):'')+'; max step '+Math.round(mx3)+' ms vs '+Math.round(mx2)+' on second casts');
  ok('the fight leaves no more behind than the same casts did before (renderer.info.memory)',mem3[0]-mw1[0]<=Math.max(8,(mem2[0]-mem1[0])*1.25+8)&&mem3[1]-mw1[1]<=Math.max(1,mem2[1]-mem1[1]+1),'round 2 '+mem1+' > '+mem2+', round 3 '+mw1+' > '+mem3);
  ok('the kept programs stay bounded',PSH.pins.length<=PSH.max,PSH.pins.length+' / '+PSH.max);
  /* a broken shader is still reported, later and without a stall */
  {const e0=errs;const sc=new THREE.Scene(),m=new THREE.ShaderMaterial({vertexShader:'void main(){gl_Position=vec4(position,1.);}',fragmentShader:'void main(){gl_FragColor=vec4(nope);}'});
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),m));const lg=console.error;let msg='';console.error=function(){msg=msg||String(arguments[0]);errs++;};
    try{renderer.compile(sc,camera);}catch(e){}await new Promise(r=>setTimeout(r,1500));console.error=lg;
    ok('a broken shader is still reported in the console (deferred check)',errs>e0&&/shader error/.test(msg),msg.slice(0,60));m.dispose();
    for(const p of PSH.pins.slice())if(p.usedTimes===1&&p.program&&!renderer.getContext().getProgramParameter(p.program,renderer.getContext().LINK_STATUS))pshUnpin(p);}
  /* the browser store keeps the recipes */
  {await new Promise(r=>setTimeout(r,3400));const L=await pshDbOpen().then(db=>new Promise(res=>{const q=db.transaction('r').objectStore('r').get('all');q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([]);})).catch(()=>[]);
    ok('the recipes are kept in the browser store (IndexedDB)',L.length>=20&&L.some(x=>PSH.rec.has(x.h)),L.length+' stored');
    ok('the save in localStorage is untouched by them',!Object.keys(localStorage).some(k=>/shader|psh/i.test(k)));}
};
const back=()=>{Math.random=rnd0;console.error=ce;for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;state='menu';clearWorld();
  Object.assign(meta,JSON.parse(m0));lsSet(KR,r0);saveMeta();buildMap(Math.floor(rnd0()*1e9));MAP.fresh=true;};
return run().catch(e=>ok('the test ran',false,e.stack||e.message)).then(()=>{back();ok('no console errors (besides the broken test shader)',errs<=1,errs);return JSON.stringify(out);});
})()
