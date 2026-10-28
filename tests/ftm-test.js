(function(){
/* Fire Tornado's masteries as Simon designed them (v414). Run on the dev page:
   __kk.ev(await (await fetch('/tests/ftm-test.js')).text()) returns [name, ok, detail] rows. Foes stand where they are put (only the
   effects are stepped, updFx, with the game clock moved along), and hurt is wrapped to log the amount, the time and whether it is the
   mastery's (power 100: a fire tick is 30, the collapse 120). The tornado rises 1.3 down the road from the leading foe and drifts back up
   it at 0.72 a second (at(t) is where it stands t seconds in), so foes are put along its path, or beside it, by road distance and a
   sideways offset. FTM.dbg logs the masteries' events. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.firetornado=SM_XP[L-1];else delete meta.smast.firetornado;};
const RT=()=>ROUTES[0];let D=0,T0=0;
/* a point on the road: d along it, off across it */
const pt=(d,off)=>{const p=posAt(d,RT());return{x:p[0]+Math.cos(p[2])*(off||0),z:p[1]-Math.sin(p[2])*(off||0)};};
const foe=(d,off,type,hp)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT();e.dist=d;e.off=0;moveEnemy(e,0);e.spd=0;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;
  const p=pt(d,off);e.x=p.x;e.z=p.z;if(e.g){e.g.position.x=p.x;e.g.position.z=p.z;}return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time-T0});return H0.apply(this,arguments);};};
const near=(a,b)=>Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b));
/* the leading foe at D: the tornado rises at D+1.3 and drifts back towards it */
/* on the longest straight stretch of the road, so 'beside it' stays beside it all along the tornado's path */
const setup=()=>{play();const sg=RT().segs.reduce((a,b)=>b.len>a.len?b:a);D=sg.start+Math.min(sg.len-1.4,3.3);return foe(D,0);};
const at=t=>D+1.3-.72*t;
const cast=(L,lead,o)=>{setL(L);T0=time;castScrollNow('firetornado',heroU,tStats(heroU),[lead],100,Object.assign({src:heroU,bane:0,el:'fire',anc:false,spell:'firetornado'},o||{}));return FTM.last;};
const ev=(k,f)=>FTM.dbg.filter(x=>x.ev===k&&(!f||f(x)));
const mine=(e,amt)=>log.filter(h=>h.e===e&&h.smx&&(amt==null||near(h.amt,amt)));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
try{
  /* ---- the card, the texts ---- */
  ok('the five masteries carry Simon\'s names',SM_D.firetornado.map(x=>x.n).join('|')==='Molten Orbit|Infernal Vortex|Trail of Ruin|Ring of Ruin|Eye of the Inferno',SM_D.firetornado.map(x=>x.n).join('|'));
  const T=i=>smDesc('firetornado',i);
  ok('and his numbers: 45%, 2 tiles, three; 0.4, 25%, 0.6s, 60%; four, 2.5s, 25%, 0.5s; 70%, 0.6s, 1.35, 100%; 180%, 1.5, 0.5s, 60%',
    /twelve/.test(T(0))&&/45%/.test(T(0))&&/2 tiles/.test(T(0))&&/three/.test(T(0))&&/0\.4 tiles/.test(T(1))&&/25%/.test(T(1))&&/0\.6s/.test(T(1))&&/60%/.test(T(1))
    &&/four/.test(T(2))&&/2\.5s/.test(T(2))&&/25%/.test(T(2))&&/0\.5s/.test(T(2))&&/70%/.test(T(3))&&/0\.6s/.test(T(3))&&/1\.35/.test(T(3))&&/100%/.test(T(3))
    &&/180%/.test(T(4))&&/1\.5 tiles/.test(T(4))&&/0\.5s/.test(T(4))&&/60%/.test(T(4))
    &&FTM.rock===.45&&FTM.rockR===2&&FTM.rockMax===3&&FTM.rockN===12&&FTM.core===.25&&FTM.coreR===.4&&FTM.coreT===.6&&FTM.flare===.6&&FTM.trail===.25&&FTM.trailN===4&&FTM.trailT===2.5&&FTM.trailTick===.5
    &&FTM.ring===.7&&FTM.ringR===1.35&&FTM.ringTick===.6&&FTM.ringIn===1&&FTM.eye===1.8&&FTM.eyeR===1.5&&FTM.mark===.6&&FTM.markT===.5);
  ok('the old masteries are gone, every factor at least 1, his numbers kept',!SMF.firetornado.cast&&!SMF.firetornado.hit&&SMA.firetornado.every(x=>x===1)&&SMG.firetornado.every(x=>x>=1)&&SM.free&&!!SM.free.firetornado);
  /* ---- Mastery 0: the old tornado ---- */
  {const lead=setup();foe(D-.6,0);FTM.dbg=[];FTM.last=null;log=[];const added=track();wrapHurt();
    try{cast(0,lead);run(6);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('Mastery 0: the old tornado (30 a fire tick, 120 at the collapse) and none of the masteries',!FTM.last&&!FTM.dbg.length&&!log.some(h=>h.smx)&&log.length>0&&log.every(h=>near(h.amt,30)||near(h.amt,120)),log.length);
    ok('and it leaves nothing behind',smLeft(added)===0);}
  /* ---- M1 Molten Orbit ---- */
  {const lead=setup();const line=[lead];for(let i=1;i<6;i++)line.push(foe(D-i*.4,(i%2?.25:-.25)));const far=foe(D-1,2.6),bird=foe(D,.6,'raven');
    FTM.dbg=[];log=[];const added=track();wrapHurt();let S;try{S=cast(1,lead);run(6.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    const L=ev('launch'),R=ev('rock'),per=new Map();for(const x of L)per.set(x.e,(per.get(x.e)||0)+1);
    ok('M1: rocks break out one by one (no more than twelve a cast), each 45% where it strikes',L.length>=6&&L.length<=12&&R.length>0&&R.every(x=>near(x.amt,45))&&mine(far).length===0,L.length+' launched, '+R.length+' struck');
    ok('M1: they go for foes within 2 tiles of the tornado, three at most on one foe (flyers too)',L.every(x=>x.d<2+1e-6)&&[...per.values()].every(n=>n<=3)&&!per.has(far),[...per.values()].join(',')+(per.has(bird)?' (the raven too)':''));
    const gaps=L.slice(1).map((x,i)=>x.t-L[i].t);
    ok('M1: one at a time, and every rock flies back into the vortex before the end',gaps.every(g=>g>=FTM.rockGap-.051)&&ev('home').length===L.length&&S.K.deb.every(b=>!b.out),ev('home').length+' home of '+L.length);
    ok('M1: and it leaves nothing behind',smLeft(added)===0);}
  /* ---- M2 Infernal Vortex ---- */
  {const lead=setup();const A=foe(D-.3,0),B=foe(D-.5,.65),E=foe(at(4)+.02,0);FTM.dbg=[];log=[];const added=track();wrapHurt();let S,hmax=0,h0=null;
    try{S=cast(2,lead);for(let i=0;i<130;i++){run(.05);hmax=Math.max(hmax,S.heat);if(S.core&&h0==null&&i>12)h0=S.core.hm.opacity;}}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M2: a foe at the heart (within 0.4) takes 25% more on each fire tick',mine(A,25).length>=2&&ev('core').every(x=>near(x.amt,25)),mine(A,25).length+' on the foe in its path');
    ok('M2: one beside it, inside the tornado but not at the heart, takes none of it (only the tornado\'s own 30s)',!ev('core').some(x=>x.e===B)&&log.some(h=>h.e===B&&!h.smx&&near(h.amt,30)));
    const fl=ev('flare');
    ok('M2: a foe held at the heart 0.6s takes a 60% burst once when it breaks free',fl.filter(x=>x.e===A).length===1&&fl.every(x=>near(x.amt,60)&&x.held>=.6-1e-6)&&!fl.some(x=>x.e===B),fl.map(x=>x.held.toFixed(2)).join(','));
    const fe=fl.find(x=>x.e===E),col=ev('collapse')[0];
    ok('M2: and one still held there when it collapses gets its burst then',!!fe&&!!col&&Math.abs(fe.t-col.t)<1e-6,fe?'at '+(fe.t-T0).toFixed(2):'none');
    ok('M2: the core heats up as it burns (and cools)',hmax>=.3&&S.heat<hmax,hmax.toFixed(2)+' at most');
    ok('M2: and it leaves nothing behind',smLeft(added)===0);}
  /* ---- M3 Trail of Ruin ---- */
  {const lead=setup();const n0=NS_OWN.size,f0=S6FZ.length,on=foe(at(.5)+.08,0),bird=foe(at(.5)+.08,0,'raven'),off=foe(at(.5),.7);FTM.dbg=[];log=[];const added=track();wrapHurt();let fire=false,S;
    try{S=cast(3,lead);for(let i=0;i<150;i++){run(.05);for(const p of ev('patch'))if(s6FireAt(pt((p.dA+p.dB)/2).x,pt((p.dA+p.dB)/2).z,.05))fire=true;}}finally{hurt=H0;scene.add=S0;setL(0);}
    const P=ev('patch'),tr=ev('trail');
    ok('M3: four strips of burning ground, each on the stretch of road it has just crossed, end to end',P.length===4&&P.every((p,i)=>p.dB>p.dA&&(i===0||Math.abs(p.dB-P[i-1].dA-.05)<1e-6))&&P[0].dB>at(.9),P.map(p=>p.dA.toFixed(2)+'-'+p.dB.toFixed(2)).join(' '));
    const by=i=>tr.filter(x=>x.e===on&&x.i===i).map(x=>x.t-T0),th=by(0),sp=[0,1,2,3].every(i=>by(i).slice(1).every((t,j)=>t-by(i)[j]>.5-.051));
    ok('M3: a foe standing on one takes 25% every 0.5s while it burns (2.5s); each strip hurts it once a 0.5s at most',th.length===5&&th.slice(1).every((t,i)=>Math.abs(t-th[i]-.5)<.051)&&sp&&tr.every(x=>near(x.amt,25)),th.map(t=>t.toFixed(2)).join(','));
    ok('M3: a flyer over it, or a foe beside it, takes none',!tr.some(x=>x.e===bird||x.e===off));
    ok('M3: they are no burning ground for Firestorm, and they leave nothing behind',!fire&&S6FZ.length===f0&&smLeft(added)===0&&NS_OWN.size===n0,NS_OWN.size+' / '+n0);}
  /* ---- M4 Ring of Ruin ---- */
  {const lead=setup();const F1=foe(at(3.2),1.15),F2=foe(at(3.2),1.75);FTM.dbg=[];log=[];const added=track();wrapHurt();let S,tilt=0,th=[];
    /* how fast one of the funnel's rocks goes round, before the last second and in it */
    try{S=cast(4,lead);for(let i=0;i<140;i++){run(.05);const t=time-T0;if(S.ring){tilt=Math.max(tilt,Math.abs(S.ring.T.rotation.x),Math.abs(S.ring.T.rotation.z),Math.abs(S.ring.R.rotation.x),Math.abs(S.ring.R.rotation.z));
      const q=S.ring.C.find(c=>c.b);for(const at of [2.75,2.95,3.3,3.5])if(Math.abs(t-at)<.026)th.push(q.th);}}}finally{hurt=H0;scene.add=S0;setL(0);}
    const w1=th.length===4?(th[1]-th[0])/.2:0,w2=th.length===4?(th[3]-th[2])/.2:0;
    const rg=ev('ring')[0],tk=ev('ringTick');
    ok('M4: halfway through its life the rocks drop into the ring',!!rg&&Math.abs(rg.t-T0-FTM.ringAt)<.06&&S.K.deb.every(b=>b.ring),rg?(rg.t-T0).toFixed(2):'none');
    ok('M4: it flares every 0.6s: 70% to each foe within 1.35, once a flare',tk.length>=3&&tk.slice(1).every((x,i)=>Math.abs(x.t-tk[i].t-.6)<.051)&&mine(F1,70).length===tk.length&&ev('ringHit').every(x=>near(x.amt,70))&&!ev('ringHit').some(x=>x.e===F2),tk.length+' flares, '+mine(F1,70).length+' on the foe at 1.15: '+tk.map(x=>Math.hypot(F1.x-x.x,F1.z-x.z).toFixed(2)).join(','));
    ok('M4: it stays flat round the funnel (no spinning like a coin) and whirls faster in its last second',tilt===0&&w1>0&&w2>w1*1.8,'tilt '+tilt.toFixed(2)+', '+w1.toFixed(1)+' then '+w2.toFixed(1)+' rad/s');
    ok('M4: then it is pulled into the collapse for 100% more to foes within 1.35',mine(F1,100).length===1&&ev('ringIn').every(x=>near(x.amt,100))&&!ev('ringIn').some(x=>x.e===F2),mine(F1,100).length+' on the foe at 1.15');
    ok('M4: the rocks are flung out of the collapse, and it leaves nothing behind',S.K.deb.every(b=>b.out)&&smLeft(added)===0);}
  /* ---- M5 Eye of the Inferno ---- */
  {const lead=setup();const c4=at(4),M1=foe(c4,1.3),M2=foe(c4,1.7),bird=foe(c4,.8,'raven'),gone=foe(at(6.3),0);FTM.dbg=[];log=[];const added=track();wrapHurt();let S,spin=1,pin=0,vis=true,squeeze=9;
    try{S=cast(5,lead);for(let i=0;i<120;i++){run(.05);const t=time-T0;if(t>3.6&&t<3.98){spin=Math.min(spin,S.spin);pin=Math.max(pin,S.pin);squeeze=Math.min(squeeze,S.K.g.scale.x/S.K.g.scale.y);}if(t>4.05)vis=vis&&!S.K.g.visible;}}finally{hurt=H0;scene.add=S0;setL(0);}
    const mk=ev('mark').map(x=>x.e),eh=ev('eyeHit'),mh=ev('markHit');
    ok('M5: in its last 0.5s the funnel spins the other way, narrows and draws its rocks in, and is gone with the blast',spin<-1&&pin>.5&&squeeze<.75&&vis&&ev('inhale').length===1,spin.toFixed(2)+' '+squeeze.toFixed(2));
    ok('M5: foes in its pull (1.45) in those last 0.5s are marked, flyers and foes outside it are not',mk.includes(M1)&&!mk.includes(M2)&&!mk.includes(bird)&&!mk.includes(gone)&&ev('mark').every(x=>x.t-T0>=3.5-.051),[M1,M2,bird,gone,lead].map(e=>mk.includes(e)?1:0).join(''));
    ok('M5: the blast: 180% to all within 1.5 (flyers too), none beyond',eh.every(x=>near(x.amt,180))&&mine(M1,180).length===1&&mine(bird,180).length===1&&mine(M2,180).length===0&&mine(gone).length===0,[M1,M2,bird,gone].map(e=>mine(e,180).length+'/'+mine(e).length).join(' '));
    ok('M5: and 60% more, once, to each marked foe',mh.length===mk.length&&mh.every(x=>near(x.amt,60))&&mine(M1,60).length===1&&mine(bird,60).length===0&&mine(M2,60).length===0,mh.length+' of '+mk.length);
    ok('M5: and it leaves nothing behind',smLeft(added)===0);}
  /* ---- Firestorm stays apart ---- */
  {const lead=setup();foe(D-.4,0);FTM.dbg=[];log=[];wrapHurt();let S;
    try{castScrollNow('firewall',heroU,tStats(heroU),[lead],100,{src:heroU,bane:0,el:'fire',anc:false,spell:'firewall'});run(.1);S=cast(5,lead);run(6);}finally{hurt=H0;setL(0);}
    const base=log.filter(h=>!h.smx&&h.t>0),fs=base.some(h=>near(h.amt,45));
    ok('Firestorm still makes it burn 50% hotter (45 a tick), but not the masteries\' hits',fs&&log.filter(h=>h.smx&&h.t>0).every(h=>[45,25,60,70,100,180].some(v=>near(h.amt,v)))&&ev('core').every(x=>near(x.amt,25))&&ev('eyeHit').every(x=>near(x.amt,180)),fs?'':'no Firestorm');}
  ok('no errors',errs===0,errs);
}catch(err){ok('threw',false,err&&err.stack);}
finally{console.error=ce;hurt=H0;scene.add=S0;FTM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
