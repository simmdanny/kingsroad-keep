(async function(){
/* v496: the Primordial Tempest spins like a tornado and looks cleaner (Simon: "the storm on primordial tempest should spin in the direction a
   tornado spins and be more clean"). Each layer is drawn alone into a small target, two frames apart, at the game camera; the frames are
   unrolled round the layer's centre on screen and cross-correlated round the circle, so the turn is measured as the player sees it
   (counterclockwise positive, degrees a second). The arms' handedness is the same correlation from one ring to the next one out.
   The lightning, streaks, debris, dust, rain and the hero's smoke are followed by their positions projected to the screen.
   Run on the dev page: await __kk.ev(await (await fetch('/tests/ttn-test.js')).text()). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const RW=480,RH=338,rt=new THREE.WebGLRenderTarget(RW,RH);
const setup=Lv=>{lsSet(KR,null);meta.mapIntro=0;meta.arena='plains';meta.dev=true;meta.shake=false;meta.scrAuto=false;meta.spaceCalm=false;meta.smast=meta.smast||{};
  if(Lv)meta.smast.tempest=SM_XP[Lv-1];else delete meta.smast.tempest;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;spawners.length=0;nextQ=null;
  const R=ROUTES[0],mid=R.len*.5,p=posAt(mid,R);let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),d=(q.x-p[0])**2+(q.z-p[1])**2;if(d>1.2&&d<bd){bd=d;best=[c,r];}}
  spawnHero(best[0],best[1]);for(const e of enemies.slice())removeEnemy(e);enemies=[];
  for(let i=0;i<12;i++){spawnEnemy({type:i%2?'knight':'soldier',v:0},30);const e=enemies[enemies.length-1];e.route=R;e.dist=mid-6+i*1.05;e.off=(i%3-1)*.22;e.hp=e.maxHp=1e7;e.spd=.35;e.gold=0;moveEnemy(e,0);}
  state='playing';paused=false;speed=0;worldSlow=1;slowT=0;window.__fz=true;const pv=posAt(mid,R);CAM.px=pv[0]-camTarget.x;CAM.pz=pv[1]-camTarget.z;CAM.zoom=1;applyCam();
  step(.1);const t=heroU,had=!!meta.spells.tempest;if(!had)meta.spells.tempest={lvl:1,own:1};t.scd={};t.gcd=0;const s=heroStats(),L=sortTargets(t,inRange(t,s));
  fireScroll(t,'tempest',s,L.length?L:enemies.filter(e=>!e.dead));if(!had)delete meta.spells.tempest;};
function step(sec){const n=Math.round(sec/.033);for(let i=0;i<n;i++){camShake=0;update(.033*worldSlow);updFx(.033);anim(.033,performance.now()/1000);}camShake=0;}
const scr=(x,y,z)=>{camera.aspect=RW/RH;camera.updateProjectionMatrix();const v=new THREE.Vector3(x,y,z).project(camera);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();return [(v.x+1)/2*RW,(1-v.y)/2*RH];};
function shot(objs){const keep=new Set();for(const o of objs)o.traverse(q=>keep.add(q));const saved=[];
  scene.traverse(q=>{if((q.isMesh||q.isPoints||q.isLine||q.isSprite)&&!keep.has(q)){saved.push([q,q.visible]);q.visible=false;}});
  const bg=scene.background,fg=scene.fog;scene.background=new THREE.Color(0x808080);scene.fog=null;const asp=camera.aspect;camera.aspect=RW/RH;camera.updateProjectionMatrix();
  renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,camera);const px=new Uint8Array(RW*RH*4);renderer.readRenderTargetPixels(rt,0,0,RW,RH,px);renderer.setRenderTarget(null);
  camera.aspect=asp;camera.updateProjectionMatrix();scene.background=bg;scene.fog=fg;for(const [q,v] of saved)q.visible=v;
  const S=new Float32Array(RW*RH);for(let y=0;y<RH;y++)for(let x=0;x<RW;x++){const i=((RH-1-y)*RW+x)*4;S[y*RW+x]=Math.abs(px[i]-128)+Math.abs(px[i+1]-128)+Math.abs(px[i+2]-128);}return S;}
function polar(S,cx,cy,r0,r1,nR,nT){const P=[];for(let k=0;k<nR;k++){const r=r0+(r1-r0)*(k+.5)/nR,row=new Float32Array(nT);let m=0,n=0;
    for(let j=0;j<nT;j++){const th=j/nT*Math.PI*2,xi=Math.round(cx+Math.cos(th)*r),yi=Math.round(cy-Math.sin(th)*r);if(xi<0||yi<0||xi>=RW||yi>=RH){row[j]=NaN;continue;}row[j]=S[yi*RW+xi];m+=row[j];n++;}
    m/=Math.max(1,n);for(let j=0;j<nT;j++)row[j]=isNaN(row[j])?0:row[j]-m;P.push(row);}return P;}
function xc(A,B,K){const nT=A[0].length;let best=-1e18,bk=0;const C=[];for(let k=-K;k<=K;k++){let s=0;for(let i=0;i<A.length;i++){const a=A[i],b=B[i];for(let j=0;j<nT;j++)s+=a[j]*b[(j+k+nT)%nT];}C.push(s);if(s>best){best=s;bk=k;}}
  const i=bk+K;let sub=bk;if(i>0&&i<C.length-1){const y0=C[i-1],y1=C[i],y2=C[i+1],d=y0-2*y1+y2;if(d<0)sub=bk+.5*(y0-y2)/d;}let e=0;for(const a of A)for(const v of a)e+=v*v;return {deg:sub*360/nT,peak:best/(e||1)};}
/* a layer's turn on screen (degrees a second, counterclockwise positive) over rings r0..r1 pixels round world point c */
function spin(objs,c,r0,r1,dt){const p=scr(...c),A=shot(objs);step(dt);const q=scr(...c),B=shot(objs);const x=xc(polar(A,p[0],p[1],r0,r1,8,540),polar(B,q[0],q[1],r0,r1,8,540),45);return {dps:x.deg/dt,peak:x.peak};}
/* its arms: the turn from each ring to the next one out (negative: outward along an arm turns clockwise, the arms trail a counterclockwise spin) */
function hand(objs,c,r0,r1){const p=scr(...c),P=polar(shot(objs),p[0],p[1],r0,r1,12,540);let s=0;for(let i=0;i+1<P.length;i++)s+=xc([P[i]],[P[i+1]],30).deg;return s/(P.length-1);}
/* counterclockwise on screen: the screen turn from a to b round the centre c (y up) */
const turn=(c,a,b)=>{const ax=a[0]-c[0],ay=c[1]-a[1],bx=b[0]-c[0],by=c[1]-b[1];return Math.atan2(ax*by-ay*bx,ax*bx+ay*by);};
const f1=v=>v.toFixed(1);
try{
  ok('registries: the deck of v496, the clouds\' orbit, the dropped layers',typeof ttnDeckFS==='function'&&typeof TPX.orb==='function'&&TTN&&TTN.drop.length===4);
  ok('the changelog tells of it',CLOG.length&&CLOG[0].v==='v496'||CLOG.some(c=>c.v==='v496'));
  const LOG={};
  for(const Lv of [0,3,5]){setup(Lv);step(7);const E=TPE.on,X=TPX.on,hp=heroU.g.position,hero=[heroU.x,hp.y+.4,heroU.z],w2=[E.hx,E.G0+2,E.hz],g=[E.hx,E.G0,E.hz];
    const R={deck:spin([X.deck],hero,95,165,.4),clouds:spin(X.clouds.map(c=>c.me),hero,70,165,.4),puffs:null,face:spin([E.wface],w2,45,100,.4),outflow:spin([E.outflow],g,60,165,.4)};
    /* the billows (each spins and sways on its own, so they are followed one by one: where the shader draws each, projected to the screen) */
    {const c=scr(...w2),P0=E.puffs.map((q,i)=>{const o=E.puff(i,{});return [o.x,o.y,o.z];}).map(v=>scr(...v));step(.2);let ccw=0,sum=0;
      E.puffs.forEach((q,i)=>{const o=E.puff(i,{}),t=turn(c,P0[i],scr(o.x,o.y,o.z));if(t>0)ccw++;sum+=t;});R.puffs={dps:sum/E.NP*180/Math.PI/.2,peak:1,ccw:ccw/E.NP};}
    LOG['M'+Lv]=Object.entries(R).map(([k,v])=>k+' '+f1(v.dps)).join(', ');
    ok('M'+Lv+': the storm deck, its storm clouds, the eye wall\'s billows and its inner face all turn counterclockwise on screen',['deck','clouds','puffs','face'].every(k=>R[k].dps>4&&R[k].peak>.15)&&R.puffs.ccw>.97,LOG['M'+Lv]+' deg/s');
    ok('M'+Lv+': the eye wall turns faster than the deck and the clouds out round it (faster closer to the eye)',R.puffs.dps>R.deck.dps&&R.puffs.dps>R.clouds.dps,f1(R.puffs.dps)+' > '+f1(R.deck.dps)+', '+f1(R.clouds.dps));
    ok('M'+Lv+': the outflow high above turns the other way (anticyclonic), and stays faint',R.outflow.dps<-1&&E.outflow.material.uniforms.uA.value<.13,f1(R.outflow.dps)+' deg/s, alpha '+E.outflow.material.uniforms.uA.value.toFixed(3));
    const hd=hand([X.deck],hero,85,215);ok('M'+Lv+': the deck\'s arms trail the spin (outward along an arm turns clockwise)',hd<-1.5,f1(hd)+' deg a ring outward');
    /* the lightning racing round, the wind streaks, the dust, the rain and the hero's smoke: their screen positions frame to frame */
    {const c=scr(...w2);let n=0,ccw=0;for(let k=0;k<12;k++){const A=E.arcs.filter(q=>q.on).map(q=>[q,q.t,scr(E.hx+Math.sin(q.a)*q.r*E.spread,E.G0+q.y,E.hz+Math.cos(q.a)*q.r*E.spread)]);
        const S2=E.streaks.filter(q=>q.t>0).map(q=>[q,q.t,scr(E.hx+Math.sin(q.a)*q.r,E.G0+q.h,E.hz+Math.cos(q.a)*q.r)]);step(.05);
        for(const [q,t0,p] of A)if(q.on&&q.t>t0){n++;if(turn(c,p,scr(E.hx+Math.sin(q.a)*q.r*E.spread,E.G0+q.y,E.hz+Math.cos(q.a)*q.r*E.spread))>0)ccw++;}
        for(const [q,t0,p] of S2)if(q.t>t0){n++;if(turn(c,p,scr(E.hx+Math.sin(q.a)*q.r,E.G0+q.h,E.hz+Math.cos(q.a)*q.r))>0)ccw++;}}
      ok('M'+Lv+': the lightning racing round the wall and the wind streaks turn counterclockwise on screen',n>20&&ccw===n,ccw+' of '+n);}
    {const c=scr(E.hx,E.G0,E.hz);let n=0,ccw=0;const api=E.api;for(let i=0;i<48;i++){const a=i/48*Math.PI*2,r=2.5,d={x:E.hx+Math.sin(a)*r,z:E.hz+Math.cos(a)*r};api.swirl(d,0,0);
        if(turn(c,scr(d.x,E.G0,d.z),scr(d.x+d.wx*.02,E.G0,d.z+d.wz*.02))>0)ccw++;n++;
        const q=api.aura({x:E.hx,y:E.G0,z:E.hz});if(turn(c,scr(q.x,E.G0,q.z),scr(q.x+q.vx*.02,E.G0,q.z+q.vz*.02))>0)ccw++;n++;
        /* the dust: swept round at angle a (tpEye's own velocity there) */
        const vt=1,vx=Math.cos(a)*vt-Math.sin(a)*.4,vz=-Math.sin(a)*vt-Math.cos(a)*.4;if(turn(c,scr(d.x,E.G0,d.z),scr(d.x+vx*.02,E.G0,d.z+vz*.02))>0)ccw++;n++;}
      ok('M'+Lv+': the rain, the dust and the hero\'s smoke are drawn round counterclockwise',ccw===n,ccw+' of '+n);}
    if(Lv>=4||Lv===5){/* M4+: the debris, moved by its shader: angle a0+uRot*k */const c=scr(E.hx,E.G0+1,E.hz),u=E.clouds.material.uniforms.uRot.value;let ccw=0;
      for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=3,P=b=>scr(E.hx+Math.sin(b)*r,E.G0+1,E.hz+Math.cos(b)*r);if(turn(c,P(a+u),P(a+u+.05))>0)ccw++;}
      ok('M'+Lv+': the debris whirls round counterclockwise',ccw===24&&E.root.children.some(o=>o.renderOrder===-2&&o.geometry.isInstancedBufferGeometry),ccw+' of 24');}
    /* cleaner: the layers that crossed the arms are gone from the scene, the eye is calm and clear, no white-out */
    {const gone=[X.sheet,E.bandMesh,E.rbMesh,E.caMesh,E.curtains];let shadow=0;E.root.traverse(o=>{if(o.isMesh&&o.renderOrder===29&&o.material.uniforms&&o.material.uniforms.uF&&o.geometry.parameters&&o.geometry.parameters.width>20)shadow++;});
      ok('M'+Lv+': fewer layers: the wind sheet, the ground cloud shadows, the rain bands, the cloud arms, the curtains and the cloud bands are not drawn',gone.every(o=>!o.parent)&&!shadow&&[X.deck,E.clouds,E.wface,E.outflow].every(o=>o.parent));
      const p=scr(...hero),S=shot([X.deck]);let m=0,n=0;for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){m+=S[Math.round(p[1]+y)*RW+Math.round(p[0]+x)];n++;}
      ok('M'+Lv+': a calm, clear eye round the hero (no deck cloud over it; the wall is cut away on the camera\'s side, tpeye)',m/n<6,(m/n).toFixed(2));
      const Sd=shot([X.deck]);let hi=0;for(const v of Sd)if(v>hi)hi=v;ok('M'+Lv+': the deck stays see-through (it never covers the board)',X.deckU.uA.value>.5&&hi<300,'max change '+hi.toFixed(0)+' of 765');}
    /* cheaper: the Tempest's own draw calls (only its group drawn), and again with the dropped layers put back for one frame */
    {const root=E.root,calls=()=>{const saved=[];scene.traverse(q=>{if(q.isMesh||q.isPoints||q.isLine||q.isSprite){let p=q,inR=false;while(p){if(p===root){inR=true;break;}p=p.parent;}if(!inR){saved.push([q,q.visible]);q.visible=false;}}});
        renderer.info.autoReset=false;renderer.info.reset();renderer.render(scene,camera);const c=renderer.info.render.calls;renderer.info.autoReset=true;for(const [q,v] of saved)q.visible=v;return c;};
      const now=calls(),D=X.dropped||[];for(const o of D){root.add(o);o.visible=true;}const was=calls();for(const o of D){root.remove(o);o.visible=false;}
      ok('M'+Lv+': cheaper: the Tempest draws in 6 fewer calls (the wind sheet, the ground cloud shadows, the rain bands, the cloud arms, the curtains, the cloud bands)',was-now===6&&D.length===6,now+' calls, '+was+' with them');}
    {let err=null;try{for(const T of [12,16.2,17.5,19]){step(T-(ANC.live.tempest?ANC.live.tempest.T:T));anim(.016,performance.now()/1000);renderer.render(scene,camera);}step(2);}catch(e){err=e.message;}
      ok('M'+Lv+': it renders through the rest of the cast and ends cleanly',!err&&!TPE.on&&!TPX.on,err||'');}
    resetCine();updFx(.05);}
  /* the storm clouds' orbit: counterclockwise (their angle runs atan2(z,x), z toward the camera), faster close in */
  ok('the storm clouds over the eye wall orbit counterclockwise, faster close in',TPX.orb({r:3})<0&&TPX.orb({r:3})<TPX.orb({r:6}),TPX.orb({r:3}).toFixed(2)+' / '+TPX.orb({r:6}).toFixed(2));
  ok('no errors along the way',!errs,errs);
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;rt.dispose();try{resetCine();window.__fz=false;state='menu';paused=false;speed=1;worldSlow=1;slowT=0;CAM.zoom=1;for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return JSON.stringify(out);})()
