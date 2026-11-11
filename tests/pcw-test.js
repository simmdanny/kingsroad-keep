(function(){
/* v497 (upd-48): the crowd pool's shaders (v494) are v493 seeds, built in idle time before the first fight instead of in the middle of it.
   Run on the dev page: __kk.ev(await (await fetch('/tests/pcw-test.js')).text()) returns [name, ok, detail] rows. Checks the six seeds are
   there (four of them on an instanced mesh, as they are drawn), that once warmed the real v494 materials on their real kind of mesh build
   no program of their own, and that foes baked into the pool and drawn on the board build none either. Puts the board back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
const progs=renderer.info.programs,push0=progs.push;let pcrBuilt=0;
try{
  meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!PCR.on){ok('v494 is on (window.__pcrOff is not set)',false);}
  else{
    const S=pshSeed(),P=S.filter(x=>/^seed:pcr/.test(x.h));
    ok('the six pool and batch shaders are seeds',P.length===6,P.length+' of '+S.length+' seeds');
    ok('the four batched ones are warmed on an instanced mesh',P.filter(x=>x.r&&x.r.o&&x.r.o.i).length===4,P.map(x=>x.h).join(' '));
    for(const x of P)pshWarmSeed(x);
    /* the very materials v494 makes, on the mesh kind it draws them with, in the same stand-in light setup */
    const ws=pshStage(pshSig()),F=[[()=>pcrMakeMat('phong',true,{},true),false,'pool'],[()=>pcrMakeMat('phong',true,{},true,true),false,'pool, smooth'],
      [PCR_MKMAT,true,'markers'],[PCR_MHMAT,true,'glows'],[pcrBlobMat,true,'shadow blobs'],[()=>pcrMakeMat('phong',false,{},false),true,'shards']];
    const miss=[];
    for(const [f,inst,nm] of F){const m=f(),ob=inst?new THREE.InstancedMesh(pshGeo(false),m,1):new THREE.Mesh(pshGeo(false),m),n0=PSH.built,b0=PSH.busy;PSH.busy=true;
      try{ws.add(ob);renderer.compile(ws,camera);}finally{PSH.busy=b0;ws.remove(ob);m.dispose();if(inst&&ob.dispose)ob.dispose();}if(PSH.built>n0)miss.push(nm);}
    ok('once warmed, the real v494 materials find their programs built',!miss.length,miss.length?'built again: '+miss.join(', '):'all six');
    /* foes baked into the pool and drawn on the board */
    progs.push=function(){const r=push0.apply(this,arguments);const m=PSH.cur;if(m&&m.userData&&m.userData.pcr)pcrBuilt++;return r;};
    for(const t of ['soldier','peasant','rider','knight','ogre','raven'])for(let i=0;i<3;i++)spawnEnemy({type:t,v:0},40+i*3);
    for(const e of enemies){try{pcrBake(e);}catch(_){}}
    for(let i=0;i<4;i++){anim(.016,i*.016);renderer.render(scene,camera);}
    const baked=enemies.filter(e=>e.pcr).length;
    ok('foes are drawn from the pool',baked>0,baked+' of '+enemies.length+' baked');
    ok('drawing them builds no v494 program',pcrBuilt===0,pcrBuilt+' built');
  }
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{progs.push=push0;console.error=oe;try{clean();state='menu';paused=false;clearWorld();meta.arena=a0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
