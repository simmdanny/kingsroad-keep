(function(){
/* Bosses (v440): each boss model's still parts merged by material (pfeBoss). Run on the dev page:
   __kk.ev(await (await fetch('/tests/pfboss-test.js')).text()) returns [name, ok, detail] rows. Every boss is spawned twice at the same
   place, once with merging off and once on, posed the same and rendered alone in a close-up at several moments (and in its ability poses):
   the same picture with fewer draw calls. Then every boss walks a real road past towers with merging off, with its abilities and its
   low-health turns, and no part that moved or changed is one that merging would have folded away. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),on0=PF.on,cam0={p:camera.position.clone(),q:camera.quaternion.clone()};
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const BOSSES=Object.keys(EN).filter(k=>EN[k].boss),gl=renderer.getContext();
const board=(a,towersToo)=>{PF.on=true;lsSet(KR,null);meta.arenas[a]=1;meta.arena=a;meta.mapIntro=0;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;gold+=1e7;
  if(!towersToo)return;const cand=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;let n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<H&&cc>=0&&cc<W&&grid[rr][cc]===1)n++;}if(n)cand.push([c,r,n]);}
  cand.sort((x,y)=>y[2]-x[2]||x[1]-y[1]||x[0]-y[0]);const pick=[];for(const q of cand){if(pick.length>=10)break;if(pick.every(p=>Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])>=2))pick.push(q);}
  pick.forEach(q=>{placing={type:'archer'};try{placeTower('archer',q[0],q[1],{});}catch(e){}});placing=null;};
const spawn=(t,pf,ms)=>{PF.on=pf;spawnEnemy({type:t,v:0,ms:ms?1:0},200);PF.on=true;const e=enemies[enemies.length-1];e.phase=0;e.off=0;return e;};
const meshes=g=>{let n=0;g.traverse(o=>{if(o.isMesh&&o.visible)n++;});return n;};
/* the foe alone in a close-up framed on `ref` (the unmerged twin, so both shots use the same camera): everything else hidden, lights kept */
const shot=(e,ref)=>{const vis=[];for(const o of scene.children){if(o===e.g||o.isLight)continue;vis.push([o,o.visible]);o.visible=false;}
  (ref||e).g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject((ref||e).g),c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3()).length();
  camera.position.set(c.x+sz*.55,c.y+sz*.35,c.z+sz*.75);camera.lookAt(c);camera.updateProjectionMatrix();e.g.updateMatrixWorld(true);renderer.render(scene,camera);
  const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);const calls=renderer.info.render.calls;
  for(const [o,v] of vis)o.visible=v;let lit=0;for(let i=0;i<px.length;i+=4)if(px[i+3])lit++;return{px,calls,n:w*h,lit};};
const diff=(A,B)=>{let d=0;for(let i=0;i<A.px.length;i+=4){if(Math.abs(A.px[i]-B.px[i])+Math.abs(A.px[i+1]-B.px[i+1])+Math.abs(A.px[i+2]-B.px[i+2])+Math.abs(A.px[i+3]-B.px[i+3])>48)d++;}return d;};
let camG=null;const UDK=['cast','stomp','rear','curl','roar','sleep','trumpet','big'];
try{
  /* 1) the same picture, fewer draw calls: every boss at four moments, the last in its ability pose */
  {board('plains');camG={p:camera.position.clone(),q:camera.quaternion.clone()};meta.shadows=true;applyShadows();const bad=[],noFewer=[],rows=[],wl=[];let calls0=0,calls1=0;
    for(const t of BOSSES){const A=spawn(t,false),B=spawn(t,true);B.route=A.route;A.dist=B.dist=2.5;time=0;moveEnemy(A,0);moveEnemy(B,0);let worst=0,ca=0,cb=0,lit=0;
      for(const [T,ud] of [[.4,0],[1.9,0],[3.7,0],[4.3,1]]){while(time<T-1e-9){time+=.05;moveEnemy(A,.05);moveEnemy(B,.05);}
        for(const k of UDK)for(const e of [A,B])e.g.userData[k]=ud?1:0;if(ud){moveEnemy(A,0);moveEnemy(B,0);}
        B.g.visible=false;const a=shot(A);B.g.visible=true;A.g.visible=false;const b=shot(B,A);A.g.visible=true;const d=diff(a,b);worst=Math.max(worst,d/Math.max(1,a.lit));ca=a.calls;cb=b.calls;lit=a.lit;}
      for(const k of UDK)for(const e of [A,B])delete e.g.userData[k];
      wl.push([t,worst]);if(worst>.002)bad.push(t+':'+(worst*100).toFixed(2)+'%');if(!(cb<ca)&&meshes(A.g)>meshes(B.g))noFewer.push(t);calls0+=ca;calls1+=cb;rows.push(t+' '+ca+'->'+cb);
      removeEnemy(A);removeEnemy(B);enemies.length=0;}
    ok('every boss looks the same with its parts merged (close-up, four moments, ability poses)',!bad.length,bad.join(' ')||'all within 0.2% of the boss\'s pixels; the most: '+wl.sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>x[0]+' '+(x[1]*100).toFixed(3)+'%').join(', '));
    ok('every boss that merged anything takes fewer draw calls',!noFewer.length,noFewer.join(' '));
    ok('the bosses together: at most half the draw calls',calls1<=calls0*.5,calls0+' -> '+calls1+' ('+rows.join(', ')+')');
    const big=t=>{const r=rows.find(x=>x.startsWith(t+' '));return r?r.split(' ')[1].split('->').map(Number):[0,0];};
    ok('the Seraphim and the Ophanim: at most 30% of their draw calls',big('seraph')[1]<=big('seraph')[0]*.3&&big('ophanim')[1]<=big('ophanim')[0]*.3,big('seraph').join('->')+', '+big('ophanim').join('->'));}
  /* 2) in a real game with merging off, no part that moves or changes on its own (tick, wings, abilities, low-health turns, the Void
     Knight's revival) is one merging folds away. The plan's paths address the same parts in a model built with merging off. */
  {board('plains',true);state='playing';paused=false;const bad=[];let checked=0,moved=0;
    for(const t of BOSSES){PF.on=true;enemyModel(t,0);const plan=PFE.plan.get(t+'|0');if(!plan){bad.push(t+': no plan');continue;}
      const e=spawn(t,false,MSB_T.has(t));e.maxHp=e.hp=1e9;moveEnemy(e,0);const nodes=[];e.g.traverse(o=>nodes.push(o));const s0=nodes.map(pfeSnap),ch=new Set();
      const cmp=()=>{for(let i=0;i<nodes.length;i++){if(ch.has(nodes[i]))continue;const a=s0[i],b=pfeSnap(nodes[i]);if(a.length!==b.length||a.some((x,j)=>x!==b[j]&&!(typeof x==='number'&&Math.abs(x-b[j])<1e-6)))ch.add(nodes[i]);}};
      for(let i=0;i<640&&!e.dead;i++){if(i===160)e.hp=e.maxHp*.6;if(i===240){e.hp=e.maxHp*.45;e.stunT=1;}if(i===320){e.hp=e.maxHp*.2;e.chargeT=2;}if(i===400&&t==='voidk')REVIVE_FX(e);if(i===480)e.slowT=2,e.slow=.5;
        if(e.dist>pathLen*.8)e.dist=1;time+=.05;moveEnemy(e,.05);if(i%2)cmp();}
      for(const o of ch)if(o.isMesh)moved++;
      for(const S of plan.sets){const A=pfeAt(e.g,S.path);for(const p of S.parts){let o=pfeAt(e.g,p);checked++;while(o&&o!==A){if(ch.has(o)){bad.push(t+':'+p.join('.'));break;}o=o.parent;}}}
      removeEnemy(e);enemies.length=0;}
    ok('in a real game no boss part that moves or changes is merged away (abilities, low health, stuns, the revival)',!bad.length&&checked>500,bad.slice(0,12).join(' ')||checked+' merged parts checked, '+moved+' moving meshes all kept');
    state='menu';paused=true;}
  /* 3) the plan and merged geometry are made once per boss type: a second spawn reuses them and is quick */
  {board('plains');PFE.plan.delete('seraph|0');const t0=performance.now();const A=spawn('seraph',true);const t1=performance.now();const B=spawn('seraph',true);const t2=performance.now();
    const gA=new Set(),gB=[];A.g.traverse(o=>{if(o.userData.pfBatch)gA.add(o.geometry);});B.g.traverse(o=>{if(o.userData.pfBatch)gB.push(o.geometry);});
    ok('a second Seraphim shares the first one\'s merged geometry',gB.length>10&&gB.every(g=>gA.has(g)),gB.length+' merged meshes');
    ok('and spawning it again is quick (the plan is cached)',t2-t1<Math.max(25,(t1-t0)*.6),(t1-t0).toFixed(1)+' ms first, '+(t2-t1).toFixed(1)+' ms again');
    let shared=true;for(const m of PF.made)if(gA.has(m.geometry))shared=false;ok('cached geometry is never freed by the sweep (other bosses still use it)',shared);
    removeEnemy(A);removeEnemy(B);enemies.length=0;}
  /* 4) the parts a boss is driven by stay its own: the model's references, an elite boss's dress and the body part it measures */
  {board('plains');let okR=true,where='';for(const t of BOSSES){PF.on=true;const m=enemyModel(t,0),R=pfeRefs(m);for(const o of R){let q=o;while(q&&q!==m.g)q=q.parent;if(q!==m.g&&o!==m.g){okR=false;where=t;}}}
    ok('every part a boss model points at (wings, tail, jaws, spin, limbs, refs) is still in the model',okR,where);
    PF.on=false;const m0=enemyModel('colossus',0);PF.on=true;const m1=enemyModel('colossus',0);
    ok('the body part eliteDress measures is not merged',m1.b.children[0]&&!m1.b.children[0].userData.pfBatch&&m1.b.children[0].geometry===m0.b.children[0].geometry);
    const e=(spawnEnemy({type:'colossus',v:0,elite:['armored']},200),enemies[enemies.length-1]);ok('an elite boss is dressed as before',!!e.elites&&e.b.children.length>m1.b.children.length);removeEnemy(e);enemies.length=0;}
  /* 5) the snowy lands recolour merged parts like the others (the snow shader works in world space) */
  {board('snow');meta.shadows=true;applyShadows();const bad=[];for(const t of ['colossus','wyrmf','dreadk']){const A=spawn(t,false),B=spawn(t,true);B.route=A.route;A.dist=B.dist=2.5;time=1;moveEnemy(A,0);moveEnemy(B,0);
      B.g.visible=false;const a=shot(A);B.g.visible=true;A.g.visible=false;const b=shot(B,A);A.g.visible=true;const d=diff(a,b)/Math.max(1,a.lit);if(d>.002||!(b.calls<a.calls))bad.push(t+':'+(d*100).toFixed(2)+'% '+a.calls+'->'+b.calls);removeEnemy(A);removeEnemy(B);enemies.length=0;}
    ok('in Frostvale a snowy boss looks the same merged, with fewer draw calls',!bad.length,bad.join(' '));}
  /* 6) a whole frame: a ten-tower board with the Seraphim on it, and a running game with a boss */
  {board('plains',true);meta.shadows=true;applyShadows();const fr=pf=>{const e=spawn('seraph',pf);e.dist=pathLen*.45;moveEnemy(e,0);anim(.001,1);renderer.render(scene,camera);const c=renderer.info.render.calls;removeEnemy(e);enemies.length=0;return c;};
    camera.position.copy(camG.p);camera.quaternion.copy(camG.q);camera.updateProjectionMatrix();anim(.001,1);renderer.render(scene,camera);const cb=renderer.info.render.calls,c0=fr(false),c1=fr(true);
    ok('a ten-tower board with the Seraphim on screen takes far fewer draw calls',c0>cb+300&&c1<c0-250,'board alone '+cb+', with the Seraphim '+c0+' -> '+c1);
    let err=null;try{board('plains');state='playing';paused=false;spawnEnemy({type:'mossback',v:0,ms:1},200);for(let i=0;i<40;i++){update(.05);updFx(.05);anim(.05,i*.05);}renderer.render(scene,camera);}catch(x){err=x.message;}
    ok('a game with a boss runs and renders with merging on, without errors',!err&&!errs,err||errs);}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v440'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;PF.on=on0;try{state='menu';paused=false;enemies.length=0;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);camera.position.copy(cam0.p);camera.quaternion.copy(cam0.q);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
