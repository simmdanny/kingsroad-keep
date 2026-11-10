(function(){
/* The Citadel of Orders' looks (v478). Run on the dev page: __kk.ev(await (await fetch('/tests/cvx-test.js')).text()) returns [name, ok, detail] rows.
   A looks-only rebuild: the domain's sigil and dome, crystal pillars, the Monarch's crown and halo, the cuts' wounds of void and stars, clock rings on
   slowed foes and the final fracture. Checked here: each new piece is built and really shows from the game's camera (each is rendered with and
   without it: the picture must change), the numbers and hits are the old ones at Mastery 0 and at Mastery 5 (every strike, throw, slow and the
   crawl, as cim-test checks them), nothing is left behind (scene and GPU memory), the board is not washed out (the mean light of the frame and its
   white pixels, against the frame before the cast, at the normal zoom and close up), the draw calls stay sane, and a light-set cast makes the
   shared space pass outside the set's colour context. Foes stand on the road every half tile either side of the point nearest the hero (as in
   cim-test); the scroll's power is 100. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,PR0=renderer.getPixelRatio();
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
/* (a guard: the suite never hangs; past 5 minutes it stops and says where) */
const T00=performance.now();let stg='start';const TL=[],S=n=>{stg=n;TL.push(n+' '+((performance.now()-T00)/1000).toFixed(0)+'s');},guard=()=>{if(performance.now()-T00>300000)throw new Error('over 5 minutes, at '+stg+' ('+TL.join(', ')+')');};
const run=s=>{guard();for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(heroU.x,heroU.z,1);scene.updateMatrixWorld(true);}
function mid(){const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;}
function foe(d,hp){const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.2,d));e.off=0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
const stage=(w)=>{go();const d0=mid(),F=[];w=w||7;for(let d=-w;d<=w+.001;d+=.5)F.push(foe(d0+d));return F;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.citadel=SM_XP[L-1];else delete meta.smast.citadel;};
const oC=x=>Object.assign({src:heroU,bane:0,el:'light',anc:true,spell:'citadel'},x||{});
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>CIM.dbg.filter(d=>d.ev===n),vx=n=>CVX.dbg.filter(d=>d.ev===n);
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const segD=(px,pz,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1,s=Math.max(0,Math.min(1,((px-ax)*dx+(pz-az)*dz)/L2));return Math.hypot(px-(ax+dx*s),pz-(az+dz*s));};
const amounts=()=>[...new Set(log.map(h=>Math.round(h.amt*1e6)/1e6))].sort((a,b)=>a-b);
/* the old rules (as cim-test): each cut strikes its mark K1 and the foes in its wake K2 as it lands; the fracture K1 within 2 tiles of its main
   crack and K2 elsewhere in the domain, each thrown back */
function cutsOk(K1,K2){const C=ev('cut'),bad=[];let n1=0,n2=0;for(const c of C){const at=log.filter(h=>h.t===c.t);
    for(const e of c.H){const want=e===c.e?K1:K2;if(!at.some(h=>h.e===e&&near(h.amt,want)))bad.push((e===c.e?'mark':'wake')+'@'+c.t.toFixed(2));if(e===c.e)n1++;else n2++;}}
  return{n:C.length,ok:C.length>=12&&!bad.length&&log.filter(h=>near(h.amt,K1)).length===n1&&log.filter(h=>near(h.amt,K2)).length===n2,bad};}
function snapOk(K1,K2,push,R){const s=ev('snap')[0];if(!s)return{ok:false};const bad=[],c=ev('cast')[0];let a=0;
  s.L.forEach((e,i)=>{const [x,z,d0]=s.xz[i],want=segD(x,z,s.ax,s.az,s.bx,s.bz)<2?K1:K2;if(want===K1)a++;if(!log.some(h=>h.e===e&&h.t===s.t&&near(h.amt,want)))bad.push('hit'+i);
    const th=d0-s.d1[i];if(e.boss?th!==0:!near(th,Math.min(push,d0),1e-9))bad.push('throw'+i);if((x-c.x)**2+(z-c.z)**2>R*R*1.15+1e-9)bad.push('out'+i);});
  return{ok:!bad.length&&a>0&&log.filter(h=>h.t===s.t&&(near(h.amt,K1)||near(h.amt,K2))).length===s.L.length,bad,len:Math.hypot(s.bx-s.ax,s.bz-s.az)};}
const kAt=(T,cw,ce)=>T<3?1-(1-cw)*SMS(T,2,3):cw-(cw-ce)*SMS(T,12.8,13.25);
/* a whole cast, stepped (its T from the cast's log): the crawl and the slow after the opening strike */
function watch(c){const W={kp:[],slow:null};for(let i=0;i<400;i++){run(.05);const T=c.T();W.kp.push([T,CIT.k,CIT.pf,CIT.on]);if(!W.slow&&ev('act').length)W.slow=ev('act')[0].L.map(e=>e.slowT);if(T>=17)break;}run(1);return W;}
const crawlOk=(W,cw,ce)=>{let n=0,bad=0;for(const [T,k,pf,on] of W.kp){if(T<2.05||T>14.4||!on)continue;n++;if(!near(k,kAt(T,cw,ce),1e-9)||!near(pf,Math.max(.15,kAt(T,.5,.1)),1e-9))bad++;}return n>200&&!bad;};
/* pictures: the frame as the game draws it (through the space pass while it runs), its mean light and white pixels, and how many pixels two differ in */
const gl=renderer.getContext();
const shot=()=>{guard();anim(.001,time);if(SDP.n>0)sdpRender();else renderer.render(scene,camera);const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);return px;};
const lum=px=>{let s=0,n=0,hi=0;for(let i=0;i<px.length;i+=16){s+=.2126*px[i]+.7152*px[i+1]+.0722*px[i+2];n++;if(px[i]>235&&px[i+1]>235&&px[i+2]>200)hi++;}return{Y:s/n,hi:hi/n};};
const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=8)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>30)n++;return n*2;};
/* how much a piece changes the picture: drawn with it, then without it */
const shows=objs=>{const A=shot(),vis=objs.map(o=>o.visible);objs.forEach(o=>o.visible=false);const B=shot();objs.forEach((o,i)=>o.visible=vis[i]);return diff(A,B);};
/* (pictures are drawn at half the pixel ratio, to keep the suite quick in a software renderer: pixel counts are of the smaller picture) */
const closeCam=()=>{__kk.camXZ(heroU.x,heroU.z,.5);scene.updateMatrixWorld(true);},normCam=()=>{__kk.camXZ(heroU.x,heroU.z,1);scene.updateMatrixWorld(true);};
try{
  renderer.setPixelRatio(PR0*.5);
  ok('the looks are in the build (v478): cvxLooks, the sigil, the crystal, the wound and the fracture shaders',typeof cvxLooks==='function'&&typeof cvxNumTex==='function'&&/uNum/.test(CVX_SIG_FS)&&/cvVoid/.test(CVX_WND_FS)&&/cvVoid/.test(CVX_CRK_FS)&&/rb/.test(CVX_CRY_FS));
  /* (a first cast, drawn once, makes what stays for good: the space pass's target, the hours' texture, the afterimages' slices) */
  S('warm');{const F=stage();run(.5);castCitadel(heroU,densest(F),100,oC(),null);run(5);normCam();S('warm shot');shot();S('warm run');run(14);}
  S('M0 looks');
  /* ---- Mastery 0: every piece, from the game's camera ---- */
  {const F=stage(),sdp0=SDP.n,added=track();CIM.dbg=[];CVX.dbg=[];log=[];wrapHurt();const I0=lum(shot());let c=null,V=null,P={},Lw={},calls=0,mem0=null,mem1=null,base=0;
    const cnt=()=>{renderer.info.autoReset=false;renderer.info.reset();shot();const n=renderer.info.render.calls;renderer.info.autoReset=true;return n;};
    try{setL(0);normCam();base=cnt();mem0=[renderer.info.memory.geometries,renderer.info.memory.textures];
      castCitadel(heroU,densest(F),100,oC(),{log:d=>{d.t=time;CIM.dbg.push(d);}});c=ev('cast')[0];V=vx('looks')[0].V.dbg();
      /* the domain spread, the pillars up, the opening strike landed */
      run(4.6);S('M0 shows');P.sigil=shows([V.sig]);P.pillars=shows([V.cry.m,V.shell.m]);P.crown=shows([V.crown,V.halo]);P.rings=shows([V.frg.m]);P.dome=shows([V.dome]);Lw.mid=lum(shot());calls=cnt();
      closeCam();Lw.close=lum(shot());normCam();
      /* a cut in flight: its wound */
      S('M0 wound');let wn=0;for(let i=0;i<60&&!wn;i++){run(.05);const w=V.wounds.find(w=>w.m.visible&&w.s&&w.s.state==='go'&&w.s.age-w.s.pre>.12);if(w){wn=shows([w.m]);P.woundOpen=w.u.uOpen.value;}}P.wound=wn;
      /* the fracture, open */
      S('M0 to fracture');while(c.T()<13.55+.6)run(.05);S('M0 fracture');P.crack=V.fr?shows([V.fr.crack]):0;P.crackShards=V.fr?V.fr.hang.length+V.fr.plates.length:0;Lw.fin=lum(shot());
      while(c.T()<14.45+.06)run(.05);Lw.snap=lum(shot());P.shock=V.fr&&V.fr.wall.visible?shows([V.fr.wall,V.fr.sring]):0;
      run(4);mem1=[renderer.info.memory.geometries,renderer.info.memory.textures];}finally{hurt=H0;scene.add=S0;}
    ok('Mastery 0: the sigil on the ground shows from the game camera (every pixel it changes counted)',P.sigil>5000,P.sigil);
    ok('Mastery 0: the crystal pillars show, and so do the dome over the reach, the Monarch\'s crown and halo, and the clock rings at the foes\' feet',P.pillars>800&&P.dome>100&&P.crown>40&&P.rings>40,'pillars '+P.pillars+', dome '+P.dome+', crown '+P.crown+', rings '+P.rings);
    ok('Mastery 0: a cut opens into a wound that shows as it flies',P.wound>200&&P.woundOpen>.05,P.wound+' px, half width '+(P.woundOpen||0).toFixed(3));
    ok('Mastery 0: the final order tears a fracture that shows (a crack with shards on it), then snaps shut with a shockwave that shows',P.crack>1200&&P.crackShards>=15&&P.shock>700&&vx('order').length===1&&vx('snap').length===1,'crack '+P.crack+', shards '+P.crackShards+', shock '+P.shock);
    ok('Mastery 0: the looks follow the cast (a wound for every cut given a slot, each sealed as it lands; the opening strike; foes thrown back leave a streak)',vx('cut').length>=12&&vx('seal').length>=vx('cut').length&&vx('act').length===1&&vx('thrown').length>=8,vx('cut').length+' cuts, '+vx('seal').length+' seals, '+vx('thrown').length+' throws');
    const dY=k=>(Lw[k].Y-I0.Y)/I0.Y;
    ok('Mastery 0: the board is not washed out at the normal zoom (the frame at most 12% lighter than before the cast, under 1.5% white)',dY('mid')<.12&&Lw.mid.hi<.015&&dY('fin')<.15&&Lw.fin.hi<.02,'+'+(dY('mid')*100).toFixed(1)+'% '+(Lw.mid.hi*100).toFixed(2)+'% white; at the fracture +'+(dY('fin')*100).toFixed(1)+'%');
    ok('Mastery 0: nor close up (zoom 0.5: at most 25% lighter, under 2% white), and the snap is a flash, not a white-out (under 5% white)',Lw.close.hi<.02&&(Lw.close.Y-I0.Y)/I0.Y<.25&&Lw.snap.hi<.05,'close +'+(((Lw.close.Y-I0.Y)/I0.Y)*100).toFixed(1)+'%, snap '+(Lw.snap.hi*100).toFixed(2)+'% white');
    ok('Mastery 0: the draw calls stay sane (at most 70 more than the board alone)',calls-base<=70,base+' -> '+calls);
    ok('Mastery 0: nothing left behind (the domain gone, its space pass and crawl reset; geometries and textures back as they were)',left(added)===0&&!CIT.on&&CIT.k===1&&CIT.pf===1&&SDP.n===sdp0&&!SDP.pl.length&&mem1[0]<=mem0[0]&&mem1[1]<=mem0[1]+2,left(added)+' left, memory '+mem0.join('/')+' -> '+mem1.join('/'));}
  S('M0 numbers');
  /* ---- the numbers: Mastery 0 is the old cast ---- */
  {const F=stage(),P0=F.map(e=>[e.x,e.z]);CIM.dbg=[];CVX.dbg=[];log=[];let W=null,c=null;wrapHurt();
    try{setL(0);castCitadel(heroU,densest(F),100,oC(),{log:d=>{d.t=time;CIM.dbg.push(d);}});c=ev('cast')[0];W=watch(c);}finally{hurt=H0;}
    const In=F.filter((e,i)=>(P0[i][0]-c.x)**2+(P0[i][1]-c.z)**2<=c.R*c.R),A=ev('act')[0],C=cutsOk(200,100),Sn=snapOk(800,400,.55,5.2);
    ok('the numbers at Mastery 0: the opening strike 150% to every foe within 5.2 tiles and only those, slowed 60% for 2.5s',A&&In.length>=10&&A.L.length===In.length&&log.filter(h=>near(h.amt,150)).length===In.length&&W.slow.every(s=>near(s,2.5,1e-9)),In.length+' inside');
    ok('the numbers at Mastery 0: every cut 200% on its mark and 100% in its wake, thrown back 0.25; the fracture 800% near its crack and 400% elsewhere, thrown back 0.55, over R x1.85',C.ok&&Sn.ok&&near(Sn.len,5.2*1.85,1e-9)&&ev('cut').every(q=>near(q.d0-q.d1,Math.min(.25,q.d0),1e-9)),C.n+' cuts '+(C.bad||[]).slice(0,3).join(' ')+' '+(Sn.bad||[]).slice(0,3).join(' '));
    ok('the numbers at Mastery 0: the crawl (50% down to 10%, shots inside at least 15%) and only the old strikes (150, 200, 100, 800, 400, the waves\' 4)',crawlOk(W,.5,.1)&&amounts().every(a=>[4,100,150,200,400,800].includes(a)),amounts().join(','));}
  S('M5');
  /* ---- Mastery 5: the numbers, and its own looks ---- */
  {const F=stage(),B=F[13];B.boss=true;const sdp0=SDP.n,added=track();CIM.dbg=[];CVX.dbg=[];log=[];let W=null,c=null,V=null,P={};wrapHurt();
    try{setL(5);castCitadel(heroU,densest(F),100,oC(),cimOpts({L:5,a:[1,1,1,1,1]}));c=ev('cast')[0];V=vx('looks')[0].V.dbg();normCam();
      for(let i=0;i<400;i++){run(.05);const T=c.T();if(P.strip==null&&T>5){const s=c.root.children.find(m=>m.isMesh&&m.material&&m.material.uniforms&&m.material.uniforms.uA&&m.visible&&m.material.uniforms.uA.value>.75&&m.material.fragmentShader===CIM_STRIP_FS);if(s)P.strip=shows([s]);}
        if(!P.mark&&V.frg.m.count&&T>4){const a=V.frg.a.array;for(let j=0;j<V.frg.m.count;j++)if(a[j*4+2]>.6)P.mark=1;}
        if(P.crack==null&&T>13.55+.6&&V.fr){P.crack=shows([V.fr.crack]);P.len=V.fr.f.L;P.sh=V.fr.hang.length+V.fr.plates.length;}if(T>=17)break;}run(1);}finally{hurt=H0;scene.add=S0;setL(0);}
    const C=cutsOk(240,120),Sn=snapOk(1200,600,1,6);
    ok('the numbers at Mastery 5: cuts 240% and 120%, the Edict\'s throws (0.6, never out of the domain), the fracture 1200% and 600% over R x2.2, thrown 1 (not a boss), the crawl 40% down to 5%',C.ok&&Sn.ok&&near(Sn.len,6*2.2,1e-9)&&ev('snap')[0].L.includes(B)&&ev('cut').some(q=>near(q.d0-q.d1,.6,1e-9)),C.n+' cuts '+(C.bad||[]).slice(0,3).join(' ')+' '+(Sn.bad||[]).slice(0,3).join(' '));
    ok('Mastery 5\'s looks: the seam of each cut shows as a blade of light over its wound (Keener Orders), the mark of each order closes on its foe (Edict)',P.strip>80&&P.mark===1,'seam '+P.strip+' px, mark '+(P.mark||0));
    ok('Mastery 5\'s looks: a longer fracture (13.2 tiles) with more shards on it, that shows',P.crack>1200&&near(P.len,13.2,1e-9)&&P.sh>=20,P.crack+' px, '+P.sh+' shards');
    ok('Mastery 5: nothing left behind',left(added)===0&&!CIT.on&&SDP.n===sdp0,left(added)+' left');}
  S('fireScroll');
  /* ---- the real cast path, at Mastery 0 and 5 ---- */
  {const e0=errs,bad=[];for(const L of [0,5]){const F=stage();meta.spells.citadel=meta.spells.citadel||{lvl:1,hero:null};setL(L);heroU.scd={};heroU.gcd=0;CIM.dbg=[];CVX.dbg=[];
      fireScroll(heroU,'citadel',heroStats(),F.slice());run(20);if(vx('looks').length!==1||vx('snap').length!==1||(L?!ev('opts').length:ev('opts').length))bad.push(L);}setL(0);
    ok('the real cast path (fireScroll) at Mastery 0 and 5 builds the looks and runs to the snap without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  S('light set');
  /* ---- a light set (Pale Verdict): the shared space pass is made outside the set's colour context ---- */
  {const F=stage(),BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);const ids=BY.light.slice(0,3);meta.arts=meta.arts||{own:{},eq:{},pend:[]};for(const id of ids)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids;ART_V++;AS.k=null;asEl();
    const e0=errs,old=SDP.mat;if(old){old.dispose();SDP.mat=null;}let fs='',dfm=false,pale=false;
    try{CVX.dbg=[];asRun(()=>castCitadel(heroU,densest(F),100,oC(),null));fs=SDP.mat.fragmentShader;dfm=!!SDP.mat.userData.dfm;const V=vx('looks')[0].V.dbg();pale=V.sig.material.fragmentShader.indexOf('asMap(')>=0;run(19);}
    finally{meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;}
    ok('a light-set cast: the space pass is not recoloured (the world keeps its colours) and Spatial Deflection still patches it; the Citadel\'s own pieces are',fs.indexOf('asMap(')<0&&dfm&&pale&&errs===e0,(fs.indexOf('asMap(')<0?'clean':'recoloured')+', dfm '+dfm+', sigil pale '+pale+', '+(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{renderer.setPixelRatio(PR0);}catch(e){}hurt=H0;scene.add=S0;CIM.dbg=null;CVX.dbg=null;window.__fz=false;try{for(const f of fx.slice())f.life=0;updFx(.01);resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
