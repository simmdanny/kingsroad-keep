(function(){
/* v490 Invisible stays invisible: a foe that is Invisible and Regenerating (or Warded) keeps every piece cloaked while its looks animate, and is
   solid all over again when revealed. Run on the dev page: __kk.ev(await (await fetch('/tests/nrc-test.js')).text()). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;};
const solid=e=>{const L=[];e.b.traverse(o=>{if(o.isMesh&&o.visible&&!(o.material&&o.material.userData&&o.material.userData.nmxGhost))L.push(o);});return L;};
const step=(e,n)=>{for(let i=0;i<n;i++){time+=.05;animElite(e,.05);}};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
try{
  meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  for(const [types,ex] of [[['soldier','peasant','rider','raven','ram','ogre'],['regen','invisible']],[['soldier','rider','knight'],['warded','invisible']],[['soldier','peasant'],['regen','warded']]]){
    for(const t of types){const affs=ex.includes('invisible')?ex:ex.concat('invisible');
      for(let v=0;v<5;v++){const L=[];try{RGX.pick=v;spawnEnemy({type:t,v:0,elite:affs.slice(0,2),invOK:true},60);}finally{RGX.pick=null;}
        const e=enemies[enemies.length-1];if(!e.ghostOn){e.elites=affs.slice(0,2).concat(['invisible']);e.invis=true;e.revealT=0;invisLook(e,true);}
        const at0=solid(e).length;step(e,30);hurt(e,1,'magic',{el:'fire'});time+=.5;hurt(e,1,'magic',{el:'ice'});step(e,10);const at1=solid(e).length;
        if(at0||at1)L.push(t+':'+affs.join('+')+':v'+v+' '+at0+'/'+at1);
        e.revealT=1;statusTick(e,.01);const back=solid(e).length;let ghosts=0;e.b.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.nmxGhost)ghosts++;});
        if(e.ghostOn||ghosts)L.push(t+':v'+v+' not revealed ('+ghosts+' cloaked)');
        if(L.length)out.push(['  '+L.join('; '),false,'']);clean();if(!affs.includes('regen'))break;}}}
  const bad=out.filter(r=>r[0].startsWith('  '));out.length=0;
  ok('an Invisible foe that is also Regenerating or Warded keeps every piece cloaked while its looks animate, and is solid again when revealed',!bad.length,bad.slice(0,6).map(r=>r[0].trim()).join(' | '));
  /* a formation's shield bearer, the case that showed it */
  {let tries=0,hit=0,badN=0;for(;tries<80&&hit<6;tries++){clean();spawnFormation({form:'shield',elite:true,hpMul:1},60);for(const e of enemies.filter(q=>q.role==='front'&&q.invis&&q.elites.includes('regen'))){hit++;step(e,10);if(solid(e).length)badN++;}}
   ok('a Regenerating, Invisible shield-wall bearer is cloaked with its shield and regrowth ('+hit+' found)',badN===0,badN+' with solid parts');clean();}
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=oe;try{clean();state='menu';paused=false;clearWorld();meta.arena=a0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
