(function(){
/* v481 Swift ribbons as cloth (world-space verlet chains) and the Giant review.
   Run on the dev page: __kk.ev(await (await fetch('/tests/swx-test.js')).text()) returns [name, ok, detail] rows. Puts the account and world back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
const step=(sec,dt)=>{dt=dt||1/60;const n=Math.round(sec/dt);for(let i=0;i<n;i++){update(dt);updFx(dt);}};
const foe=(type,affs,dist,v)=>{spawnEnemy({type,v:v||0,elite:affs},40);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=dist;e.off=0;moveEnemy(e,0);return e;};
/* the tip of each ribbon relative to its tie, in world space */
const tips=c=>{const N=SWX.N,o=[];for(let r=0;r<c.R;r++){const b=r*(N+1)*3,t=b+N*3;o.push({dx:c.P[t]-c.P[b],dy:c.P[t+1]-c.P[b+1],dz:c.P[t+2]-c.P[b+2],L:c.S[r].L});}return o;};
try{
  meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  const R=ROUTES[0],S=R.segs;
  ok('the old rigid flap is gone: each Swift foe gets one cloth mesh of verlet ribbons',typeof swxStep==='function'&&typeof ELD.swift==='function'&&typeof ELA.swift==='function'&&SWX.N>=4,'N='+SWX.N);
  /* the old rotation pointed a hanging ribbon to the model's front: check the forward axis the game uses */
  {const e=foe('soldier',null,S[0].len*.5);const a=e.g.rotation.y,f=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),a),seg=S[0];
   const d=new THREE.Vector3(seg.bx-seg.ax,0,seg.bz-seg.az).normalize();const old=new THREE.Vector3(0,-1,0).applyAxisAngle(new THREE.Vector3(1,0,0),-1.4);
   ok('the model faces +z (so the old rotation.x=-1.15-.25 swung a hanging ribbon to the front, z='+old.z.toFixed(2)+')',f.dot(d)>.99&&old.z>.5,'dot '+f.dot(d).toFixed(3));clean();}
  /* trailing opposite to the motion on every heading of the road, and after a corner */
  {const bad=[];let n=0;const seen=new Set();
   for(let i=0;i<S.length;i++){const s=S[i];if(s.len<1.6)continue;const k=Math.round(s.ang*4);if(seen.has(k))continue;seen.add(k);
     const e=foe('soldier',['swift'],s.start+.2);step(1.1);const c=e.eliteFx.cloth,v=c.v,sp=Math.hypot(v.x,v.z);
     const ux=v.x/sp,uz=v.z/sp,hd=Math.atan2(ux,uz);for(const q of tips(c)){n++;const along=(q.dx*ux+q.dz*uz)/Math.hypot(q.dx,q.dy,q.dz);if(along>-.5)bad.push('seg '+i+' heading '+hd.toFixed(2)+' along '+along.toFixed(2));}clean();}
   ok('a running foe\u2019s ribbon tips trail behind it on every heading ('+seen.size+' headings, '+n+' ribbons)',!bad.length&&seen.size>=2,bad.slice(0,4).join('; '));}
  {let ci=1;while(ci<S.length&&Math.abs(Math.atan2(Math.sin(S[ci].ang-S[ci-1].ang),Math.cos(S[ci].ang-S[ci-1].ang)))<.6)ci++;
   if(ci<S.length){const e=foe('soldier',['swift'],S[ci].start-.9);const rows=[];let bad=0;
     for(let k=0;k<14;k++){step(.1);const c=e.eliteFx.cloth,v=c.v,sp=Math.hypot(v.x,v.z)||1;const T=tips(c);const al=T.map(q=>(q.dx*v.x+q.dz*v.z)/sp/Math.hypot(q.dx,q.dy,q.dz));rows.push(Math.max(...al).toFixed(2));if(k>=9&&Math.max(...al)>-.4)bad++;}
     ok('turning a road corner, the ribbons swing round and trail behind the new heading',!bad,'max along-velocity by 0.1 s: '+rows.join(' '));
     /* during the turn, the tips swing outward: they lag on the old heading (outside of the curve) */
     clean();}else ok('a road corner to test',false,'none');}
  /* full speed streams back and slightly up; stopped and stunned hang */
  {const e=foe('rider',['swift'],S[0].start+.2);step(1.2);const c=e.eliteFx.cloth;const T=tips(c).map(q=>Math.atan2(Math.hypot(q.dx,q.dz),-q.dy)*180/Math.PI);
   ok('at full speed the ribbons stream out back (from the vertical: '+T.map(a=>a.toFixed(0)).join(', ')+' deg)',Math.min(...T)>55,'');
   e.stunT=6;step(2.5);const H=tips(c).map(q=>Math.atan2(Math.hypot(q.dx,q.dz),-q.dy)*180/Math.PI);
   ok('stunned (stopped) they hang and settle ('+H.map(a=>a.toFixed(0)).join(', ')+' deg)',Math.max(...H)<22,'');
   e.stunT=0;e.slowT=5;e.slow=.5;step(1.5);const Hs=tips(c).map(q=>Math.atan2(Math.hypot(q.dx,q.dz),-q.dy)*180/Math.PI);
   ok('slowed to half speed they stream less ('+Hs.map(a=>a.toFixed(0)).join(', ')+' deg)',Math.max(...Hs)<Math.min(...T)&&Math.min(...Hs)>15,'');
   /* the flutter is a wave: the tips move frame to frame while the foe runs */
   e.slowT=0;e.slow=0;step(.8);const p0=Array.from(c.P);step(.1);let mv=0;for(let i=0;i<p0.length;i++)mv=Math.max(mv,Math.abs(c.P[i]-p0[i]));ok('the ribbons flutter while running (nodes move between frames)',mv>.01,mv.toFixed(3));clean();}
  /* every unit that can be Swift dresses without errors, in game and in the Bestiary */
  {const types=GAL_UNITS.filter(t=>EN[t]);const bad=[];let n=0;const LS=S.reduce((a,b)=>b.len>a.len?b:a,S[0]);
   for(const t of types){try{const e=foe(t,['swift'],LS.start+.1);step(.7);const c=e.eliteFx&&e.eliteFx.cloth;n++;
       if(!c||c.R<2||c.mesh.parent!==e.eliteFx.cloth.rg||!c.rg.parent)bad.push(t+' no cloth');else if(![...c.P,...c.pos].every(Number.isFinite))bad.push(t+' NaN');
       else{const T=tips(c),v=c.v,sp=Math.hypot(v.x,v.z)||1;const al=T.map(q=>(q.dx*v.x+q.dz*v.z)/sp/Math.hypot(q.dx,q.dy,q.dz));if(Math.max(...al)>0)bad.push(t+' a ribbon points forward '+Math.max(...al).toFixed(2));}}catch(err){bad.push(t+' '+err.message);}clean();}
   ok('every Bestiary unit wears Swift ribbons that trail behind it ('+n+' units)',!bad.length&&n>20,bad.slice(0,6).join('; '));
   const bad2=[];for(const t of types){try{openGallery();openVar(t);let t2=1;for(let i=0;i<ELITE_CYCLE.length;i++){galElite(true);for(let k=0;k<20;k++){t2+=.05;GV.items.forEach(it=>{if(it.fx)animEliteFx(it.fx,t2,.05,false,null);});}}
       const it=GV.items[0];const CY=(t==='knight'||t==='monk')?ELITE_CYCLE.filter(c=>!c.includes('armored')):ELITE_CYCLE;GV.eIdx=CY.findIndex(c=>c.join()==='swift')-1;galElite(true);if(!(it.fx&&it.fx.cloth))bad2.push(t+' no cloth in the Bestiary');else{const c=it.fx.cloth;for(let k=0;k<60;k++){t2+=.05;animEliteFx(it.fx,t2,.05,false,null);}if(!c.P.every(Number.isFinite))bad2.push(t+' NaN');}
       closeVar(true);}catch(err){bad2.push(t+' '+err.message);}}
   try{closeGallery&&closeGallery();}catch(e){}
   ok('the Bestiary dresses every unit with Swift and the breeze keeps the ribbons finite',!bad2.length,bad2.slice(0,5).join('; '));}
  /* the Bestiary breeze swings them and turning the model swings them again */
  {openGallery();openVar('peasant');const CY=ELITE_CYCLE;GV.eIdx=CY.findIndex(c=>c.join()==='swift')-1;galElite(true);const it=GV.items[0],c=it.fx.cloth;let t=1;
   for(let k=0;k<120;k++){t+=1/60;galFrame(t);}const a=tips(c).map(q=>Math.atan2(Math.hypot(q.dx,q.dz),-q.dy)*180/Math.PI);
   const p0=Array.from(c.P);GV.rot[0]=2.5;for(let k=0;k<20;k++){t+=1/60;galFrame(t);}let mv=0;for(let i=0;i<p0.length;i++)mv=Math.max(mv,Math.abs(c.P[i]-p0[i]));
   ok('in the Bestiary the ribbons lift in a gentle breeze ('+a.map(x=>x.toFixed(0)).join(', ')+' deg) and swing when the model turns',Math.min(...a)>10&&Math.max(...a)<75&&mv>.02,'moved '+mv.toFixed(3));closeVar(true);try{closeGallery();}catch(e){}}
  /* cleanup and pooling */
  {clean();const L0=SWX.live.size;const E=[];for(let i=0;i<12;i++)E.push(foe(['peasant','soldier','rider','raven','ram','wolf'][i%6],['swift'],2+i*.4));step(.3);
   ok('each Swift foe adds one cloth to the live set',SWX.live.size===L0+12,SWX.live.size-L0);
   const m=E[0].eliteFx.cloth.mesh;removeEnemy(E[0]);ok('removeEnemy takes the ribbons off and back to the pool',!m.parent&&SWX.live.size===L0+11&&!E[0].eliteFx.cloth,'');
   /* no allocation per frame: stepping every cloth 600 times makes no geometry, mesh or object, keeps the same buffers, and the JS heap stays flat */
   const live=[...SWX.live],pos=E[1].eliteFx.cloth.pos,gid0=new THREE.BufferGeometry().id,oid0=new THREE.Object3D().id;let t=time;
   for(let k=0;k<100;k++){t+=1/60;for(const c of live)swxStep(c,1/60,t,null);}const h0=performance.memory?performance.memory.usedJSHeapSize:0;
   for(let k=0;k<600;k++){t+=1/60;for(const c of live)swxStep(c,1/60,t,null);}const h1=performance.memory?performance.memory.usedJSHeapSize:0;
   const gid1=new THREE.BufferGeometry().id,oid1=new THREE.Object3D().id;
   ok('no allocation per frame: '+live.length+' cloths x 600 steps make no geometry or object, keep their buffers (heap '+((h1-h0)/1024).toFixed(0)+' KB)',gid1-gid0===1&&oid1-oid0===1&&E[1].eliteFx.cloth.pos===pos&&(!h0||h1-h0<400*1024),'ids '+(gid1-gid0)+' '+(oid1-oid0));
   const before=SWX.live.size;clearWorld();ok('clearWorld (run end) takes every ribbon off',SWX.live.size===before-11&&enemies.length===0,SWX.live.size);
   newGame(1);paused=true;lives=1e9;clean();const p1=Object.values(SWX.pool).reduce((a,l)=>a+l.length,0);for(let i=0;i<6;i++)foe('soldier',['swift'],2+i*.4);const p2=Object.values(SWX.pool).reduce((a,l)=>a+l.length,0);
   ok('a new wave reuses pooled ribbons instead of making new ones',p1-p2===6,p1+' -> '+p2);
   const e=enemies[0],c=e.eliteFx.cloth,ri=c.geo.index;ok('ribbon index buffers are shared by every foe with the same ribbon count, one draw call per foe',enemies[1].eliteFx.cloth.geo.index===ri&&e.eliteFx.cloth.mesh.isMesh,'');
   clean();openGallery();openVar('soldier');const l1=SWX.live.size;for(let i=0;i<ELITE_CYCLE.length*2;i++)galElite(true);const l2=SWX.live.size;closeVar(true);
   ok('cycling the Bestiary dress and closing it leaves no ribbons behind',SWX.live.size===l1&&l2<=l1+GV_N(),l1+' '+l2+' '+SWX.live.size);try{closeGallery();}catch(e){}}
  /* the Artificer's strip */
  {clean();const e=foe('soldier',['swift'],3);step(.2);const n0=e.b.children.length;let got=false;for(let k=0;k<20&&!got;k++){if(artStrip(e,false))got=!e.elites.includes('swift');}
   ok('stripping Swift takes off its ribbons and headband and stops the dust',got&&!e.eliteFx.cloth&&!e.eliteFx.swift&&(e.eliteFx.band||[]).every(o=>!o.parent),'');clean();}
  /* dust is kicked backward, none for flyers */
  {clean();const e=foe('soldier',['swift'],S[0].start+.2);step(.8);const n0=PSN.list.length;for(let k=0;k<60;k++)ELP.swift(e,e.eliteFx,.05);const P=PSN.list.slice(n0),v=e.eliteFx.cloth.v;
   const back=P.filter(p=>p.vx*v.x+p.vz*v.z<0).length;ok('the dust from a running Swift foe is kicked backward ('+back+'/'+P.length+')',P.length>5&&back/P.length>.9,'');clean();
   const r=foe('raven',['swift'],S[0].start+.2);step(.8);ok('flyers raise no dust',r.eliteFx.dust===0,'');clean();}
  /* Giant */
  {clean();const n=foe('soldier',null,3),g=foe('soldier',['giant'],4);const sn=n.b.scale.y,sg=g.b.scale.y;
   ok('Giant: 1.5x the model, 1.12x wider, 1.5x the hit height, one more life',Math.abs(sg/sn-1.5)<1e-6&&Math.abs(g.b.scale.x/sg-1.12)<1e-6&&Math.abs(g.hitY/n.hitY-1.5)<1e-6&&g.lives===n.lives+1,(sg/sn).toFixed(2)+' '+(g.hitY/n.hitY).toFixed(2));
   const blob=q=>q.g.children.find(o=>o.geometry===blobGeo);ok('the shadow blob and marker ring scale with the giant',Math.abs(blob(g).scale.x/blob(n).scale.x-1.5)<1e-6&&Math.abs(g.aura.scale.x/sn-1.5)<1e-6,'');
   /* the health bar sits the same share of the height above both */
   ok('the health bar sits over the giant\u2019s head (bar height grows with the model)',Math.abs((g.hitY)/(n.hitY)-sg/sn)<1e-6,'');
   const hy=g.hitY,lv=g.lives,b0=blob(g).scale.x,a0=g.aura.scale.x;let got=false;for(let k=0;k<5&&!got;k++)got=artStrip(g,false)&&!g.elites.includes('giant');
   ok('stripping Giant gives back the width, hit height, extra life, shadow blob and marker ring',got&&Math.abs(g.b.scale.x-g.b.scale.y)<1e-6&&Math.abs(g.b.scale.y-sn)<1e-6&&Math.abs(g.hitY-n.hitY)<1e-6&&g.lives===lv-1&&Math.abs(blob(g).scale.x-b0/1.5)<1e-6&&Math.abs(g.aura.scale.x-a0/1.5)<1e-6,
     'scale '+g.b.scale.x.toFixed(3)+'/'+g.b.scale.y.toFixed(3)+' hitY '+g.hitY.toFixed(2)+' lives '+g.lives);clean();
   let st=0;const gs=gntStep;gntStep=function(){st++;return gs.apply(this,arguments);};const w=foe('ogre',['giant'],3);step(2);gntStep=gs;
   ok('a walking giant has heavy footfalls ('+(st/2).toFixed(1)+' a second) with a ground ring',st>=2&&w.gRing,'');const rg=w.gRing;
   w.stunT=3;st=0;gntStep=function(){st++;return gs.apply(this,arguments);};step(1);gntStep=gs;ok('no footfalls while stunned',st===0,st);
   removeEnemy(w);enemies=enemies.filter(q=>!q.dead);ok('the ground ring goes when the giant is removed',!rg.parent,'');
   const r=foe('raven',['giant'],3);st=0;gntStep=function(){st++;return gs.apply(this,arguments);};step(1);gntStep=gs;ok('flying giants make no footfalls',st===0,'');clean();
   openGallery();openVar('soldier');GV.eIdx=ELITE_CYCLE.findIndex(c=>c.join()==='giant')-1;galElite(true);const s=GV.items[0].m.b.scale;ok('the Bestiary shows Giant at 1.3 (fits the stand), 1.12x wider',Math.abs(s.y-1.3)<1e-6&&Math.abs(s.x/s.y-1.12)<1e-6,s.y);closeVar(true);try{closeGallery();}catch(e){}}
  /* the arenas: ribbons survive the arena dress */
  {const bad=[];for(const ar of ['snow','tundra','whitewaste','taiga','highlands']){try{meta.arena=ar;meta.arenas=meta.arenas||{};meta.arenas[ar]=1;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;lives=1e9;clean();
      const e=foe('soldier',['swift'],3);step(.4);const c=e.eliteFx.cloth;if(!c||!c.mesh.parent||!c.P.every(Number.isFinite))bad.push(ar);}catch(err){bad.push(ar+' '+err.message);}}
   ok('Swift ribbons work on the snow, tundra, white waste, taiga and highlands arenas',!bad.length,bad.join('; '));clean();
   meta.arena='plains';state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;lives=1e9;clean();const e=foe('soldier',['swift'],3);ok('a pooled ribbon from a snowy arena comes back with the plain cloth',e.eliteFx.cloth.mesh.material===SWX.mat,'');clean();}
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=oe;try{if(GV)closeVar(true);clean();state='menu';paused=false;clearWorld();meta.arena=a0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
function GV_N(){return 9;}
return JSON.stringify(out);})()
