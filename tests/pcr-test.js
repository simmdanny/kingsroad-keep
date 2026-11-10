(function(){
/* Crowds at scale (v494): run on the dev page, __kk.ev(await (await fetch('/tests/pcr-test.js')).text()) returns a promise of [name, ok, detail] rows.
   - draw calls: a crowd of elites (every modifier) costs a fraction of a draw call per foe;
   - the picture: the same frame rendered with the pool and instances, then with every foe given back its own meshes, differs in almost no pixel;
     cloaked (Invisible), pale and material-swapping pieces draw themselves; a body clone (afterimage) is visible;
   - cleanup: spawning and removing hundreds of foes leaves no geometry, texture, slot or scene object behind, the pools empty out;
   - no growth: the per-frame lists stay the same size over many frames;
   - the same fight: one seeded fight (rnd seeded, three.js ids on their own stream) played in two hidden copies of the game, one with v494
     turned off (window.__pcrOff) and one with it on, gives the same kills, gold, damage and foe positions.
   Puts the account and the board back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
let errs=0,err1='';const ce=console.error;console.error=function(){errs++;if(!err1)err1=Array.from(arguments).map(a=>a&&a.stack||String(a)).join(' ').slice(0,300);return ce.apply(console,arguments);};
const gl=renderer.getContext();
const shot=()=>{renderer.render(scene,camera);const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);return{px,calls:renderer.info.render.calls,n:w*h};};
const diff=(A,B)=>{let n=0,mx=0;for(let i=0;i<A.px.length;i+=4){const d=Math.max(Math.abs(A.px[i]-B.px[i]),Math.abs(A.px[i+1]-B.px[i+1]),Math.abs(A.px[i+2]-B.px[i+2]));if(d>8)n++;if(d>mx)mx=d;}return{n,mx};};
const AFF=['armored','swift','regen','shielded','giant','invisible','blinking','warded','splitting'].filter(a=>AFFIX[a]);
const board=(land)=>{lsSet(KR,null);meta.arenas[land]=1;meta.arena=land;meta.mapIntro=0;state='menu';clearWorld();buildMap(77);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
/* a crowd standing along the road: the foes of wave 140 (its own elites and formations), spread out */
const crowd=(n,elites)=>{const W=buildWave(140);for(const q of W.q){if(enemies.length>=n)break;try{if(q.type==='__form')spawnFormation(q,140);else if(q.type!=='__pause')spawnEnemy(elites&&!EN[q.type].boss?Object.assign({},q,{elite:[AFF[enemies.length%AFF.length]].concat(enemies.length%4?[]:[AFF[(enemies.length+3)%AFF.length]]),invOK:true}):q,140);}catch(err){}}
  const L=enemies.slice();L.forEach((e,i)=>{const R=e.route||ROUTES[0];e.dist=R.len*(.06+.86*(i/L.length));moveEnemy(e,0);});for(const e of enemies)updBar(e);anim(.001,1);};
const release=()=>{for(const R of [...PCR.recs])pcrRelease(R);};
const rebake=()=>{for(const e of enemies)if(!e.pcr)pcrBake(e);};
const run=async()=>{
  ok('the crowd module is on (float vertex textures)',PCR.on&&pcrReady(),PCR.on+' '+PCR_OK);
  /* draw calls per foe */
  /* a fight's crowd: wave 140 arriving for 12 seconds (as tools/bench/bench.js crowd), the foes where they walked to */
  board('plains');{state='playing';paused=false;const bw=()=>{const W=buildWave(140);spawners.push({t:0,q:W.q.slice(),w:140});};bw();
    for(let i=0;i<720;i++){if(enemies.length<160&&spawners.length<2)bw();for(const sp of spawners)sp.t=Math.min(sp.t,.12);update(1/60);updFx(1/60);if(i%30===0){for(const e of enemies)updBar(e);anim(1/60,i/60);shot();}}
    state='menu';paused=true;spawners.length=0;for(const e of enemies)updBar(e);anim(.001,1);shot();const c=PCR.count(),el=enemies.filter(e=>e.elites).length;
    ok(enemies.length+' foes of wave 140 ('+el+' elites) cost under 1.2 draw calls a foe',c.perFoe<1.2,JSON.stringify(c));
    ok('every foe is baked',enemies.every(e=>e.pcr),enemies.filter(e=>!e.pcr).length+' not baked');}
  board('plains');crowd(120,true);{shot();const c=PCR.count();release();const d=PCR.count();rebake();shot();ok('a packed crowd where every foe is an elite (every modifier): less than half the draw calls of single meshes',c.perFoe<d.perFoe*.5,c.perFoe.toFixed(2)+' vs '+d.perFoe.toFixed(2)+' a foe');}
  /* the same picture, plains and the other lands */
  for(const land of ['plains','snow','tundra','whitewaste','taiga','highlands']){board(land);crowd(100,land==='plains');anim(.001,1);shot();const A=shot();release();const B=shot();const d=diff(A,B);rebake();
    ok(land+': the crowd looks the same pooled and as single meshes',d.n<A.n*.0003,d.n+' pixels differ by more than 8 (max '+d.mx+'), calls '+A.calls+' vs '+B.calls);}
  /* pieces that change their look draw themselves */
  board('plains');crowd(30);shot();{const onS=q=>q.pcr&&q.pcr.vis;const e=enemies.find(q=>onS(q)&&q.elites&&q.elites.includes('invisible')&&q.ghostOn)||enemies.find(onS);
    if(e&&!e.ghostOn)invisLook(e,true);shot();const on=e.pcr?e.pcr.parts.filter(p=>p.on).length:0;let ghost=0;e.b.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.nmxGhost&&o.layers.mask!==0)ghost++;});
    ok('a cloaked foe\'s pieces draw themselves (ghost material, not the pool)',on===0&&ghost>0,'pooled '+on+', ghost meshes drawn '+ghost);
    invisLook(e,false);if(e.pcr)e.pcr.ck=0;shot();ok('uncloaked, it goes back to the pool (at the next recount, about a second)',e.pcr&&e.pcr.parts.some(p=>p.on),e.pcr&&e.pcr.parts.filter(p=>p.on).length);
    const f=enemies.find(q=>q!==e&&onS(q)&&q.pcr.parts.some(p=>p.on&&p.o.material.emissive)),p=f.pcr.parts.find(p=>p.on&&p.o.material.emissive),m=p.o,mat=m.material,ei=mat.emissiveIntensity;mat.emissiveIntensity=ei+.5;mat.emissive.r+=.01;shot();
    const T=PCR.texA,b=p.slot*36+24;ok('a material that animates is followed: the pool shows its new glow',p.on&&Math.abs(T[b+4]-mat.emissive.r*mat.emissiveIntensity)<1e-6,T[b+4]+' vs '+mat.emissive.r*mat.emissiveIntensity);
    mat.emissiveIntensity=ei;mat.emissive.r-=.01;const g=new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:.5}),m0=m.material;m.material=g;shot();const fell=!p.on&&m.layers.mask!==0;m.material=m0;shot();
    ok('a piece given a see-through material draws itself, and goes back after',fell&&p.on,fell+' '+p.on);g.dispose();
    const cl=f.b.clone();let hid=0;cl.traverse(o=>{if(o.isMesh&&o.layers.mask===0)hid++;});ok('a clone of a pooled body (afterimage) is fully visible',hid===0,hid+' hidden');}
  /* cleanup: many foes in and out */
  {board('plains');shot();const mine=()=>Object.values(PCR.pools).length+Object.values(PCR.BK).reduce((a,B)=>a+B.list.length,0)+Object.keys(PCR.shard).length;const mineS=()=>scene.children.filter(o=>/^pcr/.test(o.name)).length,G=[];const g0=mine(),c0=mineS(),s0=PCR.slotHW;
    for(let k=0;k<4;k++){crowd(100);shot();G.push(enemies.map(e=>e.g));for(const e of enemies.slice())removeEnemy(e);enemies=[];shot();}
    const g1=mine(),c1=mineS(),s1=PCR.slotHW;
    crowd(100);shot();for(const e of enemies.slice())removeEnemy(e);enemies=[];shot();
    ok('foes in and out: the pools and batches do not grow (meshes of v494), one matrix texture',mine()<=g1+2&&PCR.tex&&PCR.texA.length===PCR.W*PCR.H*4,'v494 meshes '+g0+' -> '+g1+' -> '+mine()+', texture '+PCR.W+'x'+PCR.H);
    ok('no records left, the pools are empty',PCR.recs.size===0&&Object.values(PCR.pools).every(P=>P.ihw===0&&P.vhw===0),PCR.recs.size);
    ok('matrix slots are reused (no growth over 5 crowds)',PCR.slotHW===s1,s0+' -> '+s1+' -> '+PCR.slotHW);
    ok('no scene objects pile up: v494\'s own stay few, no removed foe stays in the scene',mineS()<=c1+2&&G.every(L=>L.every(g=>!g.parent)),c0+' -> '+c1+' -> '+mineS());}
  /* no growth over frames: a fight with shards and sparkles */
  {board('plains');crowd(60);paused=false;state='playing';let L0=null;for(let i=0;i<400;i++){update(1/60);updFx(1/60);for(const e of enemies)updBar(e);anim(1/60,i/60);if(i%4===0)shot();if(i===200)L0=[PCR.seq.length,PCR.bat.length,PCR.mats.size];}
    for(let i=0;i<30;i++)burst(0,.5,0,0xff8040,8);sparkle(0,.5,0,0xffd060);shot();const ns=Object.values(PCR.shard).reduce((a,S)=>a+S.list.length,0);
    ok('shards drawn as instances',ns>0&&Object.values(PCR.shard).some(S=>S.I.mesh.visible&&S.I.n===S.list.length),ns);
    for(let i=0;i<120;i++){updFx(1/60);}shot();ok('spent shards leave the instances',Object.values(PCR.shard).every(S=>S.list.length===0),Object.values(PCR.shard).map(S=>S.list.length).join());
    ok('the per-frame lists do not grow',PCR.seq.length<=L0[0]+64&&PCR.bat.length<=L0[1]+64&&PCR.mats.size<=L0[2]+64,JSON.stringify([L0,[PCR.seq.length,PCR.bat.length,PCR.mats.size]]));
    paused=true;state='menu';}
  /* the same fight, with and without v494 */
  {const src=await (await fetch('/src/kingsroad-keep.html?'+Date.now())).text();
    const patch=(off)=>{let b=src;b=b.replace('const rnd=Math.random;','const rnd=window.__rndA||Math.random;').split('Math.random()').join('__rndC()').split('((body.geometry&&body.geometry.uuid)||body.children.length)').join('((body.geometry&&body.geometry.attributes.position.count)||body.children.length)');
      const init='<script>(()=>{let s=777,s2=99991,s3=31337;window.__rndA=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};window.__rndC=()=>{s3=(s3*16807)%2147483647;return (s3-1)/2147483646;};Math.random=()=>{s2=(s2*48271)%2147483647;return (s2-1)/2147483646;};'+
        'window.requestAnimationFrame=()=>0;Storage.prototype.setItem=function(){};Storage.prototype.removeItem=function(){};Storage.prototype.clear=function(){};'+(off?'window.__pcrOff=1;':'')+'})();<\/script>';
      return init+b;};
    const fight=`(()=>{meta.notesSeen=NOTES_V;meta.arena='plains';state='menu';clearWorld();buildMap(77);MAP.fresh=true;newGame(1);auto=0;lives=1e9;paused=false;speed=1;
      for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);if(!heroU)spawnHero(q.c,q.r);
      const T=Object.keys(TD).filter(k=>!TD[k].hero&&k!=='mine'&&k!=='windmill'&&k!=='merchant'&&k!=='bell');const sp=[];
      for(let r=2;r<H-2&&sp.length<20;r++)for(let c=1;c<W-1&&sp.length<20;c++){if(grid[r][c]!==0)continue;if(sp.some(([c2,r2])=>Math.abs(c2-c)+Math.abs(r2-r)<3))continue;
        for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]])if(grid[r+dr]&&grid[r+dr][c+dc]===1){sp.push([c,r]);break;}}
      {const se=spawnEnemy;spawnEnemy=function(){const n0=enemies.length,r=se.apply(this,arguments);for(let i=n0;i<enemies.length;i++){const e=enemies[i];e.maxHp*=.0002;e.hp=e.maxHp;}return r;};}
      let dmg=0;{const h0=hurt;hurt=function(e,amt){const b=e&&!e.dead?e.hp:0;const r=h0.apply(this,arguments);if(e&&b)dmg+=b-Math.max(0,e.hp);return r;};}
      gold=1e9;sp.forEach((p,i)=>{try{const t=placeTower(T[i%T.length],p[0],p[1]);buildTowerMesh(t);}catch(e){}});
      wave=140;const bw=()=>{const W=buildWave(wave);spawners.push({t:0,q:W.q.slice(),w:wave});};bw();const g0=gold,k0=kills;
      for(let i=0;i<900;i++){if(enemies.length<160&&spawners.length<2)bw();for(const s of spawners)s.t=Math.min(s.t,.12);update(1/60);updFx(1/60);for(const e of enemies)updBar(e);anim(1/60,i/60);if(i%10===0)renderer.render(scene,camera);}
      let hs=0,ds=0;for(const e of enemies){hs+=e.hp;ds+=e.dist;}
      return JSON.stringify({kills:kills-k0,gold:+(gold-g0).toFixed(3),dmg:+dmg.toFixed(3),alive:enemies.length,hp:+hs.toFixed(3),dist:+ds.toFixed(4),pcr:typeof PCR!=='undefined'&&PCR.on&&PCR.recs.size>0});})()`;
    const play=(off)=>new Promise(res=>{const f=document.createElement('iframe');f.style.cssText='position:fixed;left:-2000px;top:0;width:800px;height:500px;border:0;';f.srcdoc=patch(off);document.body.appendChild(f);let t=0;
      const iv=setInterval(()=>{t++;let w=null;try{w=f.contentWindow;}catch(e){}if(w&&w.__kk&&w.THREE){clearInterval(iv);let r=null;try{r=JSON.parse(w.__kk.ev(fight));}catch(e){r={err:String(e)};}f.remove();res(r);}else if(t>600){clearInterval(iv);f.remove();res({err:'timeout'});}},100);});
    const A=await play(true),B=await play(false);const keys=['kills','gold','dmg','alive','hp','dist'];
    ok('a seeded fight with v494 off: kills, gold, damage',!A.err&&A.dmg>0,JSON.stringify(A));
    ok('the same fight with v494 on gives the same kills, gold, damage, foes, health and positions',!B.err&&B.pcr&&keys.every(k=>A[k]===B[k]),JSON.stringify(B));}
};
return (async()=>{try{await run();}catch(e){ok('no exception',false,e.stack||e);}
  finally{console.error=ce;try{state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){ok('restore',false,e);}}
  ok('no errors logged',errs===0,errs+' '+err1);return JSON.stringify(out);})();
})()
