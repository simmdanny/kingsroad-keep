(function(){
/* v364: the Primordial Tempest as a true eye of the storm (looks only): clouds wheeling and swaying round the hero, lightning circling it on the winds,
   wind streaks, rain and smoke drawn into the spin. v465: a hurricane (Simon: "yes upgrade the base tempest storm too"): a towering wall about 5 tiles
   high, its inner face leaning out (a stadium), cut away on the camera's side; spiral rain bands and cloud arms; a faint outflow. The shaders move the
   clouds, so the checks read where they are drawn through E.puff(i). The Tempest's own mastery is pinned to none. Run on the dev page: __kk.ev(await (await fetch('/tests/tpeye-test.js')).text()).
   Puts the account back afterwards. Needs a real viewport (a hidden Browser pane is 0x0: give the tab a size first). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const go=a=>{lsSet(KR,null);meta.smast=meta.smast||{};delete meta.smast.tempest;meta.arena=a||'plains';meta.scrAuto=false;meta.spaceCalm=false;state='menu';clearWorld();{const gv=MAP_GV;MAP_GV=5;try{buildMap(777);}finally{MAP_GV=gv;}}MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;};
const foes=n=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];for(let i=0;i<n;i++){spawnEnemy({type:i%2?'knight':'soldier',v:0},60);const e=enemies[enemies.length-1];e.route=ROUTES[i%ROUTES.length];e.dist=4+i*.9;e.off=0;e.hp=e.maxHp=1e6;e.armor=0;e.res={};e.spd=.5;moveEnemy(e,0);}};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}};
const runTo=T=>{const lv=ANC.live.tempest;if(lv&&lv.T<T)run(T-lv.T+.001);};
const cast=()=>{const t=heroU,s=heroStats();heroU.anim={k:'tempest',t:0,d:ANIM_D.tempest};castScrollNow('tempest',t,s,sortTargets(t,enemies.filter(e=>!e.dead)),s.dmg,{src:t,el:'lightning',anc:true,spell:'tempest'});worldSlow=1;slowT=0;};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
try{
  ok('registries: tpEye, tpRib, the cloud atlas, TPE',typeof tpEye==='function'&&typeof tpRib==='function'&&typeof tpEyeTex==='function'&&TPE&&tpEyeTex().image.width===512);
  ok('patch note and changelog entry',(NOTES_V!=='masteries-1'||NOTES_HTML.includes('the eye of the storm'))&&CLOG.some(u=>u.t==='The eye of the storm'&&/^v36\d$/.test(u.v)));
  go();foes(8);ok('no eye before the cast',!TPE.on);cast();const E=TPE.on;
  ok('casting the Tempest raises the eye (v465: a hurricane: the wall, its inner face, cloud bands, rain bands, cloud arms, rain curtains, the outflow)',E&&E.api&&E.puffs.length===E.NP&&E.NP>=250&&[E.clouds,E.wface,E.bandMesh,E.rbMesh,E.caMesh,E.curtains,E.outflow].every(m=>m&&m.parent===E.root),E&&E.NP);
  const H=heroU,hx=E.hx,hz=E.hz,G0=E.G0,NP=E.NP,P=i=>E.puff(i,{});
  ok('round the hero',Math.hypot(H.x-hx,H.z-hz)<1e-6);
  ok('the base storm has no mastery pieces (no debris, no crawlers, no strikes)',!E.crawlers.length&&!E.strikes.length&&E.D===TPD);
  runTo(.1);const far0=Math.max(...E.puffs.map((q,i)=>P(i).r));
  runTo(2.2);const cw1=E.cw;runTo(3);{const Q=E.puffs.map((q,i)=>P(i));let vis=0,rMin=9,rMax=0,yMin=9,yMax=-9;for(const q of Q){if(q.al>.02)vis++;rMin=Math.min(rMin,q.r);rMax=Math.max(rMax,q.r);yMin=Math.min(yMin,q.y-G0);yMax=Math.max(yMax,q.y-G0);}
    ok('the clouds gather from further out',far0>rMax*1.4,far0.toFixed(2)+' > '+rMax.toFixed(2));
    ok('translucent clouds wall the hero in',vis>=NP*.85&&Math.max(...Q.map(q=>q.al))<.4,vis+' of '+NP+' seen, max alpha '+Math.max(...Q.map(q=>q.al)).toFixed(2));
    ok('the eye round the hero stays clear, the wall reaches out about 6 tiles',rMin>1.25&&rMax<6.5,rMin.toFixed(2)+' .. '+rMax.toFixed(2));
    ok('a towering wall: from the ground to about 5 tiles, far over the floating hero',yMin>0&&yMin<.5&&yMax>4.4&&yMax<5.6&&yMax>(H.g.position.y-G0)+2,yMin.toFixed(2)+' .. '+yMax.toFixed(2)+' (hero '+(H.g.position.y-G0).toFixed(2)+')');
    const lo=Q.filter(q=>q.h<1),hi=Q.filter(q=>q.h>3.5),av=L=>L.reduce((s,q)=>s+q.r,0)/L.length;
    ok('its inner face leans out as it rises (a stadium seen from above)',av(hi)>av(lo)+.8,av(lo).toFixed(2)+' -> '+av(hi).toFixed(2));
    const yaw=Math.atan2(camera.position.x-hx,camera.position.z-hz);
    ok("the wall is cut away on the camera's side (the far and side walls stay), so it never buries the hero",E.cut>.8&&E.cutAt(yaw,2.5)<.25&&E.cutAt(yaw+Math.PI,2.5)>.99&&E.cutAt(yaw+Math.PI/2,2.5)>.9&&E.cutAt(yaw,.1)>.95,E.cutAt(yaw,2.5).toFixed(2)+' / '+E.cutAt(yaw+Math.PI/2,2.5).toFixed(2));}
  {const p0=E.puffs.map((q,i)=>Math.atan2(P(i).x-hx,P(i).z-hz));run(.3);
    const d=E.puffs.map((q,i)=>wrap(Math.atan2(P(i).x-hx,P(i).z-hz)-p0[i]));
    ok('it wheels round counterclockwise seen from above',d.every(x=>x>0),Math.min(...d).toFixed(3));
    const ri=E.puffs.map(q=>q.rb+E.SL*q.h),inn=d.filter((x,i)=>ri[i]<2.4),out2=d.filter((x,i)=>ri[i]>4),av=L=>L.reduce((s,x)=>s+x,0)/L.length;
    ok('faster close in than out at the edge',inn.length>10&&out2.length>10&&av(inn)>av(out2)*1.3,av(inn).toFixed(3)+' vs '+av(out2).toFixed(3));
    const r1=E.puffs.map((q,i)=>P(i).r);run(.6);const sw=E.puffs.map((q,i)=>Math.abs(P(i).r-r1[i]));ok('and sways in and out',Math.max(...sw)>.05,Math.max(...sw).toFixed(3));}
  ok('the winds gust at the crown bolt',E.cw>cw1*1.15,cw1.toFixed(2)+' > '+E.cw.toFixed(2));
  {const s0=E.spawned,b0=E.bolts;let seen=0,adv=0,inBand=true,bad='';for(let k=0;k<60;k++){const before=E.arcs.filter(q=>q.on).map(q=>[q,q.a]);run(.05);
      for(const [q,a] of before)if(q.on){seen++;if(q.a>a)adv++;const r=q.r;if(r<E.rIn(q.y)-.05||r>E.rIn(q.y)+E.TH+.05||q.y<.3||q.y>E.WH){inBand=false;bad=r.toFixed(2)+'@'+q.y.toFixed(2);}}}
    ok('lightning circles the hero (arcs keep coming)',E.spawned-s0>=8,(E.spawned-s0)+' arcs in 3s');
    ok('each arc races round the same way',seen>10&&adv===seen,adv+' / '+seen);
    ok('through the cloud wall',inBand,bad);
    ok('now and then a bolt jumps from cloud to cloud',E.bolts-b0>=2,(E.bolts-b0)+' bolts');
    {let lit=0;for(let k=0;k<20&&!lit;k++){run(.05);lit=E.puffs.filter((q,i)=>P(i).g>.2).length;}ok('the lightning lights the clouds from inside',lit>0,lit);}}
  ok('pale wind streaks whip round',E.streaks.filter(q=>q.t>0).length>=30);
  {const r0=E.rot;run(.2);ok('arms of cloud sweep round the inner face of the wall',E.bands.length===TPD.bands&&E.rot>r0&&E.bands.every(q=>q.r>=E.R0&&q.r<=E.R0+E.TH&&q.h>.5));}
  ok('a few spiral rain bands reach out across the ground (about 8 tiles), with cloud arms over them',E.NAR===3&&E.ROUT===8&&Math.abs(E.reach-8)<.01&&E.armA>.3&&E.armA<.7,E.NAR+' bands to '+E.ROUT+', reach '+E.reach.toFixed(2));
  ok('a faint outflow wheels high above the wall',E.outflow.position.y-G0>E.WH&&E.outA>0&&E.outA<.15,(E.outflow.position.y-G0).toFixed(2)+' high, '+E.outA.toFixed(3));
  {const api=E.api,d={x:hx+2,z:hz};api.swirl(d,0,0);const c={x:hx+.05,z:hz};api.swirl(c,0,0);const f={x:hx+8,z:hz};api.swirl(f,.7,.35);
    ok('rain is whipped round the eye (counterclockwise), calm in the eye, the plain wind far off',d.wz<-1.5&&Math.abs(d.wx)<Math.abs(d.wz)*.4&&Math.hypot(c.wx,c.wz)<.5&&f.wx===.7&&f.wz===.35,d.wx.toFixed(2)+','+d.wz.toFixed(2));
    let tang=0,rad=0;for(let i=0;i<200;i++){const q=api.aura({x:hx,y:2,z:hz});const rx=q.x-hx,rz=q.z-hz,r=Math.hypot(rx,rz);tang+=(q.vx*rz-q.vz*rx)/r;rad+=(q.vx*rx+q.vz*rz)/r;}
    ok("the hero's smoke is drawn into the spin",tang/200>.7&&Math.abs(rad/200)<tang/200*.6,(tang/200).toFixed(2)+' / '+(rad/200).toFixed(2));}
  {let err=null;try{anim(.016,performance.now()/1000);renderer.render(scene,camera);}catch(x){err=x.message;}ok('it renders',!err,err);}
  {const t0=performance.now();for(let i=0;i<100;i++)E.api.step(8,.016,100+i*.016,heroU.g.position,0,0);const ms=(performance.now()-t0)/100;ok('cheap: under 1 ms a frame',ms<1,ms.toFixed(3)+' ms');}
  runTo(12);const cwM=E.cw;runTo(16.2);ok('the winds howl before the last thunder',E.cw>cwM*1.3,cwM.toFixed(2)+' > '+E.cw.toFixed(2));
  runTo(17.2);const rF=E.puffs.reduce((s,q,i)=>s+P(i).r,0);runTo(18.4);ok('after the fall the clouds are blown apart',E.puffs.reduce((s,q,i)=>s+P(i).r,0)>rF*1.3);
  run(3);ok('it ends with the domain and takes everything away',!TPE.on&&!ANC.live.tempest&&!E.root.parent);
  go();foes(4);cast();runTo(6);const E2=TPE.on;resetCine();updFx(.05);updFx(.05);ok('a reset mid-cast takes the eye away',!TPE.on&&E2&&!E2.root.parent);
  /* the storm's light stays violet under the lightning set (only its effects take the set's colours) */
  {go();foes(4);meta.dev=true;meta.arts=meta.arts||{own:{},eq:{},pend:[]};const ids=ARTS.filter(x=>x.el==='lightning').slice(0,3).map(x=>x.id);ids.forEach(id=>meta.arts.own[id]=1);meta.arts.eq[heroU.hero]=ids;ART_V++;AS.k=null;asEl();asTick(.001);
    const had=!!meta.spells.tempest;if(!had)meta.spells.tempest={lvl:1,own:1};heroU.scd={};heroU.gcd=0;fireScroll(heroU,'tempest',heroStats(),[]);if(!had)delete meta.spells.tempest;for(let i=0;i<40&&!ANC.live.tempest;i++)run(.05);worldSlow=1;slowT=0;runTo(6);
    /* v420: its own lightning whitens the light for a moment (toward 0xf0e8ff, by up to .7 / .6), so a check landing on a flash used to fail at random;
       the colour must be the violet, or the violet on its way to that white, never the set's colours */
    const onLine=(c,a,w,mx)=>{const A=new THREE.Color(a),W=new THREE.Color(w),k=(c.r-A.r)/(W.r-A.r),P=A.clone().lerp(W,k);return k>-.01&&k<mx+.01&&Math.abs(P.g-c.g)<.004&&Math.abs(P.b-c.b)<.004;};
    const L=ANC.L.tempest;ok("under the lightning set the storm's light stays violet",AS.el==='lightning'&&L&&onLine(L.hc,0x8c74e0,0xf0e8ff,.7)&&onLine(L.sc,0xa880ff,0xf0e8ff,.6)&&TPE.on,L&&L.hc.getHexString()+' '+L.sc.getHexString());
    resetCine();meta.arts.eq[heroU.hero]=[];ART_V++;AS.k=null;asEl();}
  for(const a of['snow','tundra','whitewaste','taiga']){go(a);foes(4);let err=null;try{cast();runTo(5);anim(.016,performance.now()/1000);renderer.render(scene,camera);runTo(19);run(1);}catch(x){err=x.message;}ok('eye of the storm in '+a,!err&&!TPE.on,err);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{resetCine();window.__fz=false;speed=1;worldSlow=1;slowT=0;state='menu';paused=false;for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;asEl();lsSet(KR,r0);ancUnfilter();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
