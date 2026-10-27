(function(){
/* v354: Blood Moon rain falls in the world and splashes on the ground; the Greywind Tundra's new sea; the Infinite Void leaves only the
   road, the keep, gates, chests and the build grid. Run on the dev page: __kk.ev(await (await fetch('/tests/v354-test.js')).text())
   returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=a=>{meta.arena=a;meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const run=(t,bm)=>{paused=false;for(let i=0;i<t/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);if(bm)bmAtmos(.05);}paused=true;};
const domKey=m=>!!m&&!!m.customProgramCacheKey&&/kkDom/.test(String(m.customProgramCacheKey()));
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  /* ---- the blood rain ---- */
  play('plains');ok('the old random splashes are off',BMRN.splK===0);
  BM.until=wave+5;BM.k=1;run(1.5,true);
  ok('in a Blood Moon the rain falls in the world',!!BR3.ls&&BR3.ls.visible&&BR3.ls.parent===scene&&BR3.ls.count>=BR3.n*.9,BR3.ls&&BR3.ls.count);
  ok('drops land and splash',BR3.splN>50,BR3.splN);
  {const R=BR3.rings.filter(r=>r.m.visible);ok('every splash sits on the ground where it landed',R.length>0&&R.every(r=>Math.abs(r.m.position.y-.025-gy(r.m.position.x,r.m.position.z))<.08),R.length+' rings');}
  {const D=BR3.d,i=7,y0=D[i*6+1],g=D[i*6+4];ok('drops spawn above the ground they will hit',y0>=g-1e-6,(y0-g).toFixed(2));run(.1,true);const y1=D[i*6+1];ok('and fall',y1<y0||y1>y0+2,y0.toFixed(2)+' -> '+y1.toFixed(2));
   const ys=[];for(let j=0;j<20;j++)ys.push(D[j*6+1]);paused=true;bmAtmos(.05);let same=true;for(let j=0;j<20;j++)if(D[j*6+1]!==ys[j])same=false;ok('paused, the rain hangs still',same);}
  {const B=br3Box(),a=tw(0,0),b=tw(W-1,H-1);ok('the rain covers the whole board and beyond',B.x0<Math.min(a.x,b.x)&&B.x1>Math.max(a.x,b.x)&&B.z0<Math.min(a.z,b.z)&&B.z1>Math.max(a.z,b.z));}
  BM.until=0;for(let i=0;i<120;i++)bmAtmos(.1);ok('when the storm passes the rain stops',!BR3.ls.visible&&BR3.rings.every(r=>!r.m.visible),BM.k.toFixed(3));
  /* ---- the tundra sea ---- */
  play('tundra');{let berg=null,outer=null;TERRAIN.traverse(o=>{if(o.isInstancedMesh&&o.userData.tun==='berg')berg=o;if(o.material&&o.material.customProgramCacheKey&&String(o.material.customProgramCacheKey())==='kktunautumn4a')outer=o;});
    const nb=TUNB.uBerg.value.filter(v=>v.z>0).length;ok('every iceberg gets a foam ring',!!berg&&nb===Math.min(7,berg.count)&&nb>0,nb+' of '+(berg&&berg.count));
    ok('the ground around the board uses the new sea',!!outer);
    if(outer){const sh={uniforms:{},vertexShader:THREE.ShaderLib.phong.vertexShader,fragmentShader:THREE.ShaderLib.phong.fragmentShader};const e0=errs;outer.material.onBeforeCompile(sh);
      ok('the sea shader has depth, surf, iceberg foam and glints',/uBerg\[7\]/.test(sh.fragmentShader)&&/tuSeaW/.test(sh.fragmentShader)&&/float band=sin/.test(sh.fragmentShader)&&!/vec3 sea=vec3\(\.31,\.486,\.604\)/.test(sh.fragmentShader)&&errs===e0);}
    renderer.render(scene,camera);ok('and it compiles',errs===0,errs);}
  play('plains');ok('away from the tundra no iceberg rings are left',TUNB.uBerg.value.every(v=>v.z<0));
  /* ---- the Infinite Void ---- */
  for(const a of ['plains','snow','tundra','whitewaste'].concat(ARENAS.taiga?['taiga']:[])){play(a);/* v356: the Deep Taiga too */meta.spells.expanse=meta.spells.expanse||{lvl:1,hero:null};
    const keepL=[];TERRAIN.traverse(o=>{if(o.userData&&o.userData.voidKeep)keepL.push(o);});
    const kept=o=>{let p=o;while(p&&p!==TERRAIN){if(p.userData&&p.userData.voidKeep)return true;p=p.parent;}return false;};
    heroU.scd={};heroU.gcd=0;castScrollNow('expanse',heroU,tStats(heroU),[{x:heroU.x,z:heroU.z,y:0,hp:1e9,maxHp:1e9,dead:true,armor:0,res:{},fake:true}],100,{src:heroU,el:'light',spell:'expanse'});run(9);
    let left=[],keptOk=true,trees=0,treesGone=0,inst=0,instGone=0;
    TERRAIN.traverse(o=>{if(!o.isMesh||o===TILES)return;let vis=o.visible;let p=o.parent;while(vis&&p){if(!p.visible)vis=false;p=p.parent;}
      if(kept(o)){if(domKey(o.material))keptOk=false;return;}if(!vis)return;if(!domKey(o.material))left.push(o.type+(o.userData.tun||o.userData.ww||o.userData.tg||''));
      if(o.isInstancedMesh){inst++;if(domKey(o.material))instGone++;}});
    for(const k in TREEM){const m=TREEM[k];if(!m)continue;trees++;let all=true;m.traverse(q=>{if(q.isMesh&&q.visible&&!domKey(q.material))all=false;});if(all)treesGone++;}
    ok(a+': the void dissolves every tree, prop and the land around the board',!left.length&&treesGone===trees&&instGone===inst,left.length?left.slice(0,6).join(','):trees+' trees, '+inst+' instanced');
    ok(a+': the road, the keep, gates and chests stay',keptOk&&keepL.includes(castle)&&CHESTS.every(c=>keepL.includes(c.g))&&!domKey(castle.children.find(c=>c.isMesh)&&castle.children.find(c=>c.isMesh).material),keepL.length+' kept');
    run(20);let still=0;TERRAIN.traverse(o=>{if(o.isMesh&&domKey(o.material))still++;});ok(a+': when the void ends everything comes back',!DOM.on&&still===0,still);}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{BM.until=0;BM.k=0;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
