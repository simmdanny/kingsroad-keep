(function(){
/* v420 (Simon's explosion rule: every explosion is 3D, the old ones too). Run on the dev page: __kk.ev(await (await fetch('/tests/xfx-test.js')).text())
   returns [name, ok, detail] rows. The flat helpers (shockwave, ringFx, myFireRing, ebFireRing) now raise a wall with height, flash is a soft ball
   of light, and the comet's blast is a frost cloud; this checks the walls are there, stand on the ground, have height, fade, and are gone afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const walls=a=>a.filter(o=>o.isMesh&&o.geometry===XFX.cyl);
const inScene=o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;};
try{play();const p=posAt(ROUTES[0].len*.5,ROUTES[0]),x=p[0],z=p[1],y=gy(x,z);
  {const A=track();let w=[],h0=0,h1=0,op0=0,op1=0,r0=0,r1=0;try{shockwave(x,z,1.4,0xffffff,.6);w=walls(A);run(.1);h0=w[0]&&w[0].scale.y;op0=w[0]&&w[0].material.opacity;r0=w[0]&&w[0].scale.x;run(.3);h1=w[0]&&w[0].scale.y;op1=w[0]&&w[0].material.opacity;r1=w[0]&&w[0].scale.x;run(.4);}finally{scene.add=S0;}
    ok('a shockwave raises a wall with it: standing on the ground, with height',w.length===1&&Math.abs(w[0].position.y-y-.02)<1e-6&&h0>.1,w.length+' '+(h0||0).toFixed(2));
    ok('the wall races out with the wave, sinking and fading as it goes',r1>r0&&h1<h0&&op1<op0,(r0||0).toFixed(2)+'>'+(r1||0).toFixed(2));
    ok('and it is gone when the wave is',w.every(o=>!inScene(o)));}
  {const A=track();try{shockwave(x,z,5,0xffffff,.6);}finally{scene.add=S0;}const w=walls(A),op=w[0]&&w[0].material.opacity;run(1);
    ok('a battlefield-wide wave keeps its wall faint (no bright ring round the screen)',w.length===1&&op<=.5*2.2/5+1e-6,op);}
  {const A=track();try{ringFx(x,y+.05,z,1,0x8fd8ff,.3);myFireRing(x,z,1.3,.6);ebFireRing(x,z,1,.5);}finally{scene.add=S0;}const w=walls(A);run(1);
    ok('rings of light and of fire rise too',w.length===3&&w.every(o=>!inScene(o)),w.length);}
  {XFX.off=true;const A=track();try{shockwave(x,z,1.4,0xffffff,.6);}finally{scene.add=S0;XFX.off=false;}run(1);ok('XFX.off turns the walls off (for comparisons)',walls(A).length===0);}
  {const A=track();try{xfxFrostBoom(x,y+.2,z,1,{n:4,t:6});}finally{scene.add=S0;}run(.25);const balls=A.filter(o=>o.isMesh&&o.geometry===MY_FBG);run(2);
    ok('a frost blast is clouds of frost with body (3D), and leaves nothing',balls.length>=1&&balls.every(o=>!inScene(o)),balls.length);}
  {const A=track();try{flash(x,y+.3,z,0x9fc8ff,1,.3);}finally{scene.add=S0;}const f=A.find(o=>o.isMesh&&o.material&&o.material.uniforms&&o.material.uniforms.uO),o0=f&&f.material.uniforms.uO.value;run(.15);const o1=f&&f.material.uniforms.uO.value;run(.3);
    ok('a flash is a soft ball of light (clear at its edge, not a hard disc) that fades and is gone',!!f&&f.material.isShaderMaterial&&/pow\(vF/.test(f.material.fragmentShader)&&o1<o0&&!inScene(f),o0+'>'+o1);}
  ok('no errors',errs===0,errs);
}catch(e){ok('threw',false,e.stack);}
finally{console.error=ce;scene.add=S0;XFX.off=false;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
