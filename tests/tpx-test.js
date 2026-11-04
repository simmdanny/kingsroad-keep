(function(){
/* v477: the Primordial Tempest seen from above (Simon: "make the primordial tempest 10x better", its visuals). A storm deck of spiral cloud
   over the board with a clear eye that frames the hero, lit by the strikes; a wind and rain sheet; strike flares and scorches; the hero's core
   of light; the storm gathers, spins up at the crown, winds tight before the last thunder and blows out at the fall. Looks only.
   Run on the dev page: __kk.ev(await (await fetch('/tests/tpx-test.js')).text()). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const go=L=>{lsSet(KR,null);meta.smast=meta.smast||{};if(L)meta.smast.tempest=SM_XP[L-1];else delete meta.smast.tempest;meta.dev=true;meta.arena='plains';meta.scrAuto=false;meta.spaceCalm=false;
  state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);auto=0;lives=1e9;spawners.length=0;nextQ=null;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);state='playing';paused=false;speed=0;worldSlow=1;slowT=0;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];for(let i=0;i<10;i++){spawnEnemy({type:i%2?'knight':'soldier',v:0},60);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=6+i*.8;e.off=0;e.hp=e.maxHp=1e7;e.armor=0;e.res={};e.spd=.3;e.gold=0;moveEnemy(e,0);}};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);anim(.05,time);}};
const runTo=T=>{const lv=ANC.live.tempest;if(lv&&lv.T<T)run(T-lv.T+.001);};
const cast=()=>{const t=heroU,s=heroStats();castScrollNow('tempest',t,s,sortTargets(t,enemies.filter(e=>!e.dead)),s.dmg,{src:t,el:'lightning',anc:true,spell:'tempest'});worldSlow=1;slowT=0;};
const inScene=o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;};
try{
  ok('looks only: the hurricane draws on no random of the game and hurts no foe',typeof tpxBuild==='function'&&!/\brnd\(|hurt\(|stunE\(|lives/.test(String(tpxBuild)));
  go(0);ok('no storm deck before the cast',!TPX.on);cast();const S=TPX.on;
  ok('the cast raises the storm deck, the wind sheet and the hero\'s core, in the storm\'s own group',S&&[S.deck,S.sheet,S.core].every(m=>m&&inScene(m)),S&&S.deck&&S.deck.parent&&S.deck.parent.type);
  runTo(.2);const a0=S.deckU.uA.value,e0=S.deckU.uEye.value;
  runTo(3);const a1=S.deckU.uA.value,e1=S.deckU.uEye.value;
  ok('the deck gathers: it fades in and its eye closes in round the hero',a0<.05&&a1>.8&&e0>e1+2,a0.toFixed(2)+' -> '+a1.toFixed(2)+', eye '+e0.toFixed(1)+' -> '+e1.toFixed(1));
  {const H=heroU,cp=camera.position,Y=S.deck.position.y,hy=H.g.position.y+.4,k=(Y-cp.y)/(hy-cp.y),x=cp.x+(H.x-cp.x)*k,z=cp.z+(H.z-cp.z)*k,C=S.deckU.uC.value;
   ok('the eye frames the hero: its centre is where the camera sees the hero through the deck',Math.hypot(C.x-x,C.y-z)<.05,Math.hypot(C.x-x,C.y-z).toFixed(3));}
  ok('the crown bolt lifts the hero into a core of light',S.core.visible&&S.core.material.opacity>.3,S.core.material.opacity.toFixed(2));
  {const r0=S.deckU.uRot.value;runTo(4);const sp0=S.deckU.uRot.value-r0;runTo(8);const n0=S.strikes,f0=S.flashes;runTo(12);
   ok('every bolt that lands lights the deck and leaves a flare and a scorch',S.strikes>n0&&S.flashes>f0,(S.strikes-n0)+' strikes from 8s to 12s');
   const tw0=S.deckU.uTw.value,r1=S.deckU.uRot.value;run(1);const sp1=S.deckU.uRot.value-r1;
   runTo(TPST.FIN+.7);const tw1=S.deckU.uTw.value,r2=S.deckU.uRot.value;run(1);const sp2=S.deckU.uRot.value-r2;
   ok('before the last thunder the spiral winds tight and spins faster',tw1>tw0+.4&&sp2>sp1*1.8,'twist '+tw0.toFixed(2)+' -> '+tw1.toFixed(2)+', spin '+sp1.toFixed(2)+' -> '+sp2.toFixed(2)+' a second');}
  runTo(18.6);ok('at the fall the storm blows out and clears',S.deckU.uBlow.value>.6&&S.deckU.uA.value<.3,'blow '+S.deckU.uBlow.value.toFixed(2)+', alpha '+S.deckU.uA.value.toFixed(2));
  run(4);ok('and when the storm is over its deck is gone',!TPX.on&&!inScene(S.deck)&&!inScene(S.sheet));
  /* the masteries grow it: the arms reach across the whole board at Mastery 2 */
  {go(0);cast();runTo(4);const o0=TPX.on.deckU.uOut.value;run(20);go(5);cast();runTo(4);const o5=TPX.on.deckU.uOut.value;
   ok('the masteries grow it: the full hurricane reaches across the whole board',o5>o0+4,o0+' -> '+o5);run(20);}
  {let err=null;try{go(0);cast();for(const T of [1,3,6,10,15.8,17.2,18.4]){runTo(T);renderer.render(scene,camera);}run(4);}catch(e){err=e.message;}ok('it renders through a whole cast without errors',!err&&!errs,err||errs);}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v477'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;try{state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
