(function(){
/* v489 (Simon: "yes add the grey screen fix too"): the shared warp pass (sdpInit's SDP.mat) is made outside an artifact set's colour context,
   so a light set no longer turns the screen grey after a space spell. Each space spell is cast for real (castScrollNow) inside a light set's
   colour context with the pass not yet made. Run on the dev page: __kk.ev(await (await fetch('/tests/sdpx-test.js')).text()). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);anim(.05,time);}};
const go=()=>{lsSet(KR,null);meta.dev=true;meta.smast={};meta.arena='plains';meta.scrAuto=false;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);auto=0;lives=1e9;spawners.length=0;nextQ=null;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);state='playing';paused=false;speed=0;worldSlow=1;slowT=0;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];for(let i=0;i<8;i++){spawnEnemy({type:'soldier',v:0},60);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=8+i*.6;e.off=0;e.hp=e.maxHp=1e7;e.spd=.3;e.gold=0;moveEnemy(e,0);}};
const light=on=>{const BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);const ids=BY.light.slice(0,3);meta.arts=meta.arts||{own:{},eq:{},pend:[]};
  if(on){for(const id of ids)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids;}else meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;asEl();};
try{
  const K=['deflect','shatter','compress','loop','dslash'].filter(k=>SPELLS_S[k]);
  ok('the five space spells are there',K.length===5,K.join(','));
  for(const k of K){go();light(true);const e0=errs;if(SDP.mat){SDP.mat.dispose();SDP.mat=null;}let fs='',dfm=false,err=null;
    try{meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};const t=heroU,s=heroStats();asRun(()=>castScrollNow(k,t,s,sortTargets(t,enemies.filter(e=>!e.dead)),s.dmg,{src:t,bane:0,el:SPELL_EL[k],anc:false,spell:k}));
      run(1.5);if(SDP.mat){fs=SDP.mat.fragmentShader;dfm=!!SDP.mat.userData.dfm;}renderer.render(scene,camera);run(8);}catch(e){err=e.message;}finally{light(false);}
    ok(SPELLS_S[k].n+' with three light artifacts: the warp pass keeps the world\'s colours (no grey screen), still patched for Spatial Deflection',fs&&fs.indexOf('asMap(')<0&&dfm&&!err&&errs===e0,(fs?(fs.indexOf('asMap(')<0?'clean':'recoloured'):'no pass')+', dfm '+dfm+(err?', '+err:'')+', '+(errs-e0)+' errors');}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v489'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;try{state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
