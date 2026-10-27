(function(){
/* Piercing Judgment / Piercing Verdict, the v357 look. Run on the dev page: __kk.ev(await (await fetch('/tests/verdict-test.js')).text()) returns [name, ok, detail] rows.
   The new cast against the old one (JV.old) on the same foes: the same foes hit, the same damage and executes, at the same moment; walking foes too.
   Then the look: everything cleaned up, the palm light handed back, no shader compiled at the moment of the shot, the poses, the Pale Verdict beam.
   Puts the account back afterwards. Needs a real viewport (a hidden Browser pane is 0x0: give the tab a size first). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),cj0=castJudgment;
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};   /* the hero holds its own attacks */
function go(){lsSet(KR,null);meta.arena='plains';meta.scrAuto=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;fx.slice().forEach(f=>{f.life=0;});updFx(.001);FXL.intensity=0;}
const caster=()=>{const p=posAt(5,ROUTES[0]);return{x:p[0]+1.2,z:p[1]+.6,topY:1.1,c:0,r:0,scd:{},isTest:true};};
/* a column of foes on the road, a few beside it, two weak ones (the Judgment finishes off foes left under 15%) */
function crowd(walk){const R=ROUTES[0],L=[];for(let i=0;i<14;i++){spawnEnemy({type:['soldier','knight','rider'][i%3],v:0},1);const e=enemies[enemies.length-1];e.route=R;e.dist=(walk?3.6:5.5)+i*(walk?.18:.45);e.off=(i%4-1.5)*.3;
    e.maxHp=e.hp=1e9;e.armor=0;e.res={};e.shield=0;e.spd=walk?.9:0;if(!walk&&(i===6||i===10)){e.maxHp=1e4;e.hp=1600;}moveEnemy(e,0);L.push(e);}return L;}
const P=100,O=k=>({src:null,el:'light',spell:k});
/* one cast, by the old or the new code: damage before the shot, just after it, and at the end */
/* the effects a scroll's own code made (by name on the call stack): random world effects during the trial do not count */
function track(re){const mine=[],a0=addFx;addFx=function(){const e=a0.apply(this,arguments);if(re.test(String(new Error().stack)))mine.push(e);return e;};return{mine,stop:()=>{addFx=a0;}};}
function trial(fn,big){go();const L=crowd(false),t=caster(),o=O(big?'judgment':'verdict');o.src=t;const FIRE=big?1.2:.6,tk=track(fn===jvCast?/jv(Cast|Flash|Hole)/:/castJudgment|jdgFlashWhite|jdgHole/);
  const h0=L.map(e=>e.hp);try{fn(t,P*(big?7:3.75),o,3,big);run(FIRE-.06);const pre=L.filter((e,i)=>e.hp<h0[i]).length;run(.15);
  const hit=L.map((e,i)=>e.hp<h0[i]||e.dead?i:-1).filter(i=>i>=0),dmg=L.map((e,i)=>Math.round(e.dead?-1:h0[i]-e.hp)),dead=L.map((e,i)=>e.dead?i:-1).filter(i=>i>=0);run(3);return{pre,hit,dmg,dead,made:tk.mine.length,fx:tk.mine.filter(e=>fx.includes(e)).length};}finally{tk.stop();}}
/* walking foes; with 0.17 s steps the circle re-aims every frame (the re-aim chance is 6 per second), so both casts are deterministic */
function walk(fn,big,d0,n){go();const L=crowd(true).slice(0,n),t=caster(),o=O(big?'judgment':'verdict');o.src=t;enemies.filter(e=>!L.includes(e)).forEach(e=>removeEnemy(e));enemies=enemies.filter(e=>L.includes(e));
  L.forEach((e,i)=>{e.dist=d0+i*.18;moveEnemy(e,0);});fn(t,P*(big?7:3.75),o,3,big);for(let i=0;i<60;i++){heroU&&(heroU.cd=1e9);update(.17);updFx(.17);}return Math.round(L.reduce((s,e)=>s+(e.maxHp-Math.max(0,e.hp)),0));}
try{
  ok('the new cast is in place, the old one kept for comparison',castJudgment===jvCast&&asBeam===jvAsBeam&&JV.old&&typeof JV.old.castJudgment==='function'&&JV.old.castJudgment!==jvCast);
  for(const big of [true,false]){const nm=big?'Judgment':'Verdict';
    const A=trial(JV.old.castJudgment,big),B=trial(jvCast,big);
    ok(nm+': nothing is hit before the shot',A.pre===0&&B.pre===0,A.pre+' / '+B.pre);
    ok(nm+': the same foes are hit as before',B.hit.length>2&&A.hit.join()===B.hit.join(),'old '+A.hit.join()+' new '+B.hit.join());
    ok(nm+': for the same damage',A.dmg.join()===B.dmg.join(),B.dmg.filter(x=>x).slice(0,4).join());
    ok(nm+(big?': the same weak foes are finished off':': no foe is finished off'),A.dead.join()===B.dead.join()&&(big?B.dead.length===2:B.dead.length===0),'old '+A.dead.join()+' new '+B.dead.join());
    ok(nm+': every effect it made is gone by the end',B.made>3&&B.fx===0,B.fx+' of '+B.made+' left (old '+A.fx+' of '+A.made+')');
    {const W=[[3.6,8],[2.6,8],[5,8],[3,12],[4,1]],a=W.map(([d,n])=>walk(JV.old.castJudgment,big,d,n)),b=W.map(([d,n])=>walk(jvCast,big,d,n));
      ok(nm+': walking foes take the same damage, in five layouts',a.every(x=>x>0)&&a.join()===b.join(),'old '+a.join()+' new '+b.join());}}
  /* the look: drawn through the renderer, frame by frame */
  {go();const L=crowd(false),t=caster(),o=O('judgment');o.src=t;L.forEach(e=>{e.maxHp=e.hp=1e9;});const p0=renderer.info.programs.length,tk=track(/jv(Cast|Flash|Hole)/);let err=null,p1=0,p2=0,lit=0,lmax=0;
    try{jvCast(t,P*7,o,3,true);for(let i=0;i<60;i++){run(.05);anim(.016,performance.now()/1000);renderer.render(scene,camera);if(i===1)p1=renderer.info.programs.length;if(i>=20&&i<=30)lmax=Math.max(lmax,FXL.intensity);}
      p2=renderer.info.programs.length;lit=FXL.intensity;}catch(x){err=x.message;}finally{tk.stop();}
    ok('Judgment renders frame by frame without errors',!err,err);
    ok('no shader is compiled at the moment of the shot (all are ready by the second frame)',p2===p1,'programs '+p0+' > '+p1+' > '+p2);
    ok('the palm light rises and is handed back dark',lmax>.2&&lmax<1.5&&lit===0,lmax.toFixed(2)+' / '+lit);
    const left=tk.mine.filter(e=>fx.includes(e)||(e.o&&e.o.parent)).length;ok('everything it drew is gone from the scene',tk.mine.length>3&&left===0,left+' of '+tk.mine.length);}
  {go();const t=caster(),o=O('verdict');o.src=t;FXL.intensity=2.5;let err=null,i0=0;try{jvCast(t,P*3.75,o,3,false);run(.3);i0=FXL.intensity;run(2.4);}catch(x){err=x.message;}
    ok('a light another spell is using is left alone',!err&&i0===2.5&&FXL.intensity===2.5,err||i0+' '+FXL.intensity);FXL.intensity=0;}
  /* poses */
  {const pj=[0,.3,.6,.7,.72,.75,.9,1].map(k=>POSES.judgment(k)),pv=[0,.3,.44,.46,.5,.8,1].map(k=>POSES.verdict(k));
    ok('the poses stay finite and settle back to rest',[...pj,...pv].every(q=>Object.values(q).every(Number.isFinite))&&Object.values(POSES.judgment(1)).every(v=>Math.abs(v)<1e-9)&&Object.values(POSES.verdict(1)).every(v=>Math.abs(v)<1e-9));
    ok('the Judgment recoils at the shot (k .72-.75) and braces just before it',POSES.judgment(.745).lx>POSES.judgment(.69).lx+.4&&POSES.judgment(.69).bx>POSES.judgment(.5).bx,POSES.judgment(.745).lx.toFixed(2)+' '+POSES.judgment(.69).lx.toFixed(2));}
  /* v360: every jdgFlashWhite caller (Dimensional Slash's split) gets the body-only flash; skipped on builds before v360 */
  if(typeof JV.oldFlash==='function'){go();spawnEnemy({type:'knight',v:0,elite:['swift']},1);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=6;e.spd=0;moveEnemy(e,0);const k0=e.g.parent.children.length;let err=null,gh=null,soft=0,body=0;
    try{jdgFlashWhite(e,1);gh=e.g.parent.children[e.g.parent.children.length-1];run(.1);
      const om=[],cm=[];e.g.traverse(o=>{if(o.isMesh)om.push(o);});gh.traverse(o=>{if(o.isMesh)cm.push(o);});
      om.forEach((o,i)=>{const m=Array.isArray(o.material)?o.material[0]:o.material,sf=(m.transparent&&m.opacity<.98)||m.blending===THREE.AdditiveBlending||m.depthWrite===false;if(!cm[i])return;if(sf&&cm[i].visible)soft++;if(!sf&&o.visible&&cm[i].visible)body++;});run(.5);}catch(x){err=x.message;}
    ok('Dimensional Slash flashes only the body (the shadow and aura ring stay hidden)',!err&&jdgFlashWhite===jvFlash&&gh&&gh!==e.g&&soft===0&&body>3&&e.g.parent.children.length===k0,err||('soft parts shown '+soft+', body parts '+body));}
  /* the Pale Verdict set's beam */
  {go();const n0=fx.length;let err=null,n1=0;try{asBeam({x:-3,z:0},{x:3,z:0},.4,true);asBeam({x:0,z:-3},{x:0,z:3},.4,false);run(.1);n1=fx.length;run(1.2);}catch(x){err=x.message;}
    ok('the Pale Verdict beam opens and fades away',!err&&n1>=n0+2&&fx.length===n0,err||(n0+' > '+n1+' > '+fx.length));}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{castJudgment=cj0;window.__fz=false;speed=1;worldSlow=1;slowT=0;FXL.intensity=0;state='menu';paused=false;for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);
    buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
