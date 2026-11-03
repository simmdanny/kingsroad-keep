(function(){
/* Eternal Winter's masteries (v453). Run on the dev page: __kk.ev(await (await fetch('/tests/ewm-test.js')).text()) returns [name, ok, detail] rows.
   A pack of foes on the road near the hero, one of them a boss (none a gem or scroll carrier: a carrier twinkles and would count as left
   behind); the game is stepped (update and updFx, 0.05s), hurt is wrapped to log every hit (the scroll's power is 100: the frost strikes
   200, the shatter 1200), and each foe's hold and slow are read the frame the frost reaches it (the cast sets them after its hurt). The
   frost reaches a foe at the same distance the wave later does, so a foe held "until the wave" is held from its frost hit to its shatter
   hit plus 0.05s. EWM.dbg logs the masteries' events. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,F0=nsFreezeFoe;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;state='playing';paused=false;speed=0;worldSlow=1;slowT=0;
  const R=ROUTES[0];let bd=1e9,bdist=4;for(let d=1;d<R.len-6;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}return{R,d0:bdist};}
function foe(R,d,off,hp){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,d);e.off=off||0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.shield=0;e.spd=0;moveEnemy(e,0);return e;}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.eternalwinter=SM_XP[L-1];else delete meta.smast.eternalwinter;};
const oF=()=>({src:heroU,bane:0,el:'ice',anc:false,spell:'eternalwinter'});
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>EWM.dbg.filter(d=>d.ev===n);
/* (the shared frost floor, the terrain's pooled water ripples, which a falling splinter can start, and a foe spawned mid-cast stay by design) */
const leftL=added=>added.filter(o=>{if(o===MY_FROST||(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))||enemies.some(e=>e.g===o))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}),left=added=>leftL(added).length;
const desc=o=>(o.type||'?')+':'+(o.geometry&&o.geometry.type||'')+':'+(o.material&&o.material.color?o.material.color.getHexString():'')+':'+(o.children?o.children.length+'['+o.children.map(c=>(c.type||'')+'/'+(c.geometry&&c.geometry.type||'')).join(',')+']':0)+(o.userData?':'+Object.keys(o.userData).join('.'):'');
/* nine foes along the road and a boss among them */
const stage=()=>{const G=go(),L=[];for(let i=0;i<9;i++)L.push(foe(G.R,G.d0-2+i*.45,(i%3-1)*.2));const B=foe(G.R,G.d0+.1,.3);B.boss=true;return{G,L,B,F:L.concat([B])};};
/* one cast at mastery L (castScrollNow, or NSP for a plain cast with no mastery context): the hits, each foe's hold and slow as the
   frost reaches it, the floor's and the aurora's state, and what is left behind */
function trial(L,o){o=o||{};const S=stage();EWM.dbg=[];setL(L);const log=[],added=[],H=new Map(),cine=[];let frontF=null,filt='',vis=[],ice=[];
  hurt=function(e,amt,kind,oo){log.push({e,amt,smx:!!(oo&&oo.smx),t:time});return H0.apply(this,arguments);};
  scene.add=function(...a){added.push(...a);return S0.apply(this,a);};
  nsFreezeFoe=function(e,hold,list){const r=F0.apply(this,arguments);if(list.length)ice.push({e,z:list[list.length-1]});return r;};
  const t0=time;try{
    if(o.plain)NSP.eternalwinter(heroU,heroStats(),S.F.slice(),100,{src:heroU,el:'ice',spell:'eternalwinter'});else castScrollNow('eternalwinter',heroU,heroStats(),S.F.slice(),100,oF());
    cine.push(cineLock);frontF=MY_FROST.material.uniforms.uF.value;let late=null;
    for(let i=0;i<Math.round((o.secs||10)/.05);i++){const n0=log.length;run(.05);const tt=time-t0;
      for(const h of log.slice(n0))if(!h.smx&&(near(h.amt,200)||near(h.amt,320))&&!H.has(h.e))H.set(h.e,{hold:h.e.stunT,slow:h.e.slowT,tf:h.t-t0});
      if(o.late&&!late&&tt>=o.late){late=foe(S.G.R,S.G.d0+.4,-.3);late.boss=true;S.late=late;}
      if(Math.abs(tt-4)<.026){filt=$('#myAurora')?$('#myAurora').style.filter:'';}
      if(Math.abs(tt-o.visAt[0])<.026||Math.abs(tt-o.visAt[1])<.026)vis.push(MY_FROST.visible);}
  }finally{hurt=H0;scene.add=S0;nsFreezeFoe=F0;setL(0);}
  const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&near(h.amt,amt)&&h.smx===!!smx),tOf=(e,amt)=>{const h=log.find(h=>h.e===e&&near(h.amt,amt)&&!h.smx);return h?h.t-t0:null;};
  return{S,log,H,hits,tOf,cine:cine[0],frontF,filt,vis,ice,left:left(added),leftD:leftL(added).slice(0,6).map(desc).join(' '),floorOff:!MY_FROST.visible,aurOff:!$('#myAurora')||$('#myAurora').style.display==='none',filtEnd:$('#myAurora')?$('#myAurora').style.filter:''};}
/* a foe held until the wave: from its frost hit to its shatter hit, plus 0.05s (within a frame) */
const untilWave=(T,e,shat)=>{const h=T.H.get(e),ts=T.tOf(e,shat);return h&&ts!=null&&Math.abs(h.hold-(ts-h.tf+.05))<=.051;};
try{
  /* ---- the card ---- */
  ok('the five masteries: Biting Frost, The Long Freeze, Shards of the Heart, Winter\'s Hold, The Heart Breaks (v453)',SM_D.eternalwinter.map(x=>x.n).join('|')==='Biting Frost|The Long Freeze|Shards of the Heart|Winter\'s Hold|The Heart Breaks',SM_D.eternalwinter.map(x=>x.n).join('|'));
  {const own=SM_D.eternalwinter.map(x=>x.n),other=[];for(const k in SM_D)if(k!=='eternalwinter')for(const m of SM_D[k])other.push(m.n);const sc=SCROLL_IDS.map(k=>SPELLS_S[k].n);
    const sy=(typeof COMBOS!=='undefined'?COMBOS:[]).map(x=>x.n);
    ok('no name is a scroll\'s, another mastery\'s or a synergy\'s (the old Deep Cold is also a Glacial Rift mastery; Absolute Zero is a synergy)',own.every(n=>!other.includes(n)&&!sc.includes(n)&&!sy.includes(n))&&sy.includes('Absolute Zero'),own.filter(n=>other.includes(n)||sc.includes(n)||sy.includes(n)).join(','));}
  ok('the numbers on the card are the ones in the code (320%; 0.6s / 2.5s; 6 shards, 100%; 2.4s; 1500%)',/320%/.test(smDesc('eternalwinter',0))&&/200%/.test(smDesc('eternalwinter',0))&&/0\.6s/.test(smDesc('eternalwinter',1))&&/2\.5s/.test(smDesc('eternalwinter',1))&&/\b6\b/.test(smDesc('eternalwinter',2))&&/100%/.test(smDesc('eternalwinter',2))&&/2\.4s/.test(smDesc('eternalwinter',3))&&/1\.2s/.test(smDesc('eternalwinter',3))&&/1500%/.test(smDesc('eternalwinter',4))
    &&EWM.frost===3.2&&EWM.gath===.6&&EWM.slowT===2.5&&EWM.aimN===6&&EWM.aim===1&&EWM.boss===2.4&&EWM.shat===15&&EWL.FROST===2&&EWL.SHAT===12&&EWL.SH===4.5&&EWL.BOSS===1.2);
  ok('the old masteries are gone (no brittleness, snowfall, spires, frostbite or echo hooks); calibrated with hidden factors',!SMF.eternalwinter.hit&&!SMF.eternalwinter.cast&&SMA.eternalwinter.every(x=>x===1)&&SMG.eternalwinter.length===5&&SMG.eternalwinter.every(x=>x>=.8&&x<1.3),SMG.eternalwinter.join());
  /* ---- Mastery 0 ---- */
  {const T=trial(0,{visAt:[6.7,6.95]}),{S}=T;
    ok('Mastery 0: every foe takes 200% from the frost and 1200% from the shatter, once each, nothing else',S.F.every(e=>T.hits(e,200).length===1&&T.hits(e,1200).length===1)&&T.log.length===2*S.F.length,T.log.length);
    ok('Mastery 0: foes are held until the wave reaches them, slowed 1.5s after; the boss is held 1.2s',S.L.every(e=>untilWave(T,e,1200)&&near(T.H.get(e).slow,T.H.get(e).hold+1.5,1e-9))&&near(T.H.get(S.B).hold,1.2)&&near(T.H.get(S.B).slow,2.7),S.L.map(e=>T.H.get(e)&&T.H.get(e).hold.toFixed(2)).join(','));
    ok('Mastery 0: the burst at 4.5s (the first shatter hit within 0.3s of it), the cinematic lock 5.8s, the floor gone at 6.8s, no bright cracks, no mastery events',
      (()=>{const ts=Math.min(...S.F.map(e=>T.tOf(e,1200)));return ts>=4.5&&ts<4.8;})()&&near(T.cine,5.8)&&T.vis.join()==='true,false'&&T.frontF===0&&T.filt===''&&!EWM.dbg.length,T.cine+' '+T.vis.join());
    ok('Mastery 0: the ice on a frozen foe is the plain block',T.ice.length===S.F.length&&T.ice.every(q=>q.z.g.children.length===5&&!q.z.n));
    ok('Mastery 0: nothing is left behind (the floor and the aurora put away)',T.left===0&&T.floorOff&&T.aurOff&&T.filtEnd==='',T.left+' '+T.leftD);}
  /* ---- M1 Biting Frost ---- */
  let M1=null;
  {const T=M1=trial(1,{visAt:[6.7,6.95]}),{S}=T;
    ok('M1: the frost strikes 320% (200% before); the shatter is still 1200%',S.F.every(e=>T.hits(e,320).length===1&&T.hits(e,1200).length===1&&!T.hits(e,200).length)&&T.log.length===2*S.F.length);
    ok('M1: the ice is larger (x1.18) with longer spikes (x1.7)',T.ice.length===S.F.length&&T.ice.every(q=>{const e=q.e,h=(e.hitY||.4)/(e.g.scale.y||1)*1.3,b=q.z.g.children[0];return near(b.scale.x,h*.95*1.18,1e-6)&&q.z.g.children.slice(1,5).every(m=>m.scale.y>h*.25*1.18*1.7*.99);}));
    ok('M1: the cracks behind the frost\'s front light up (the floor\'s uF)',T.frontF===1);
    ok('M1: no other change (holds, slows, timing, boss 1.2s)',S.L.every(e=>untilWave(T,e,1200)&&near(T.H.get(e).slow,T.H.get(e).hold+1.5,1e-9))&&near(T.H.get(S.B).hold,1.2)&&near(T.cine,5.8)&&!ev('aim').length);
    ok('M1: nothing is left behind',T.left===0&&T.floorOff&&T.aurOff,T.left+' '+T.leftD);}
  /* ---- M2 The Long Freeze ---- */
  {const T=trial(2,{visAt:[7.3,7.55]}),{S}=T;
    const ts=Math.min(...S.F.map(e=>T.tOf(e,1200))),ts1=Math.min(...M1.S.F.map(e=>M1.tOf(e,1200)));
    ok('M2: the Heart gathers 0.6s longer: the burst comes at 5.1s (4.5 before)',ts>=5.1&&ts<5.4&&near(ts-ts1,.6,.08),ts.toFixed(2)+' / '+ts1.toFixed(2));
    ok('M2: so the foes are held until the wave, 0.6s longer than at Mastery 1',S.L.every(e=>untilWave(T,e,1200))&&S.L.every((e,i)=>near(T.H.get(e).hold-M1.H.get(M1.S.L[i]).hold,.6,.1)),S.L.map((e,i)=>(T.H.get(e).hold-M1.H.get(M1.S.L[i]).hold).toFixed(2)).join(','));
    ok('M2: and stay slowed 2.5s after (1.5 before); the boss still 1.2s',S.F.every(e=>near(T.H.get(e).slow,T.H.get(e).hold+2.5,1e-9))&&near(T.H.get(S.B).hold,1.2));
    ok('M2: the whole end comes 0.6s later: the cinematic lock 6.4s, the floor gone at 7.4s',near(T.cine,6.4)&&T.vis.join()==='true,false',T.cine+' '+T.vis.join());
    ok('M2: the rays reach further (11x, 7.5 before) and the aurora burns brighter',ev('cast')[0].X.rayK===11&&/brightness\(1\.3\)/.test(T.filt)&&T.filtEnd==='',T.filt);
    ok('M2: Biting Frost rides it; no shards yet',S.F.every(e=>T.hits(e,320).length===1)&&!ev('aim').length&&!T.log.some(h=>h.smx));
    ok('M2: nothing is left behind',T.left===0&&T.floorOff&&T.aurOff,T.left);}
  /* ---- M3 Shards of the Heart ---- */
  {const T=trial(3,{visAt:[7.3,7.55]}),{S}=T,a=ev('aim')[0],sh=ev('shard');
    const want=a?S.F.slice().sort((p,q)=>((p.x-a.hx)**2+(p.z-a.hz)**2)-((q.x-a.hx)**2+(q.z-a.hz)**2)).slice(0,6):[];
    ok('M3: as the Heart bursts, 6 of its shards fly at the 6 nearest foes (one each)',a&&a.L.length===6&&want.every(e=>a.L.includes(e))&&new Set(a.L).size===6,a&&a.L.length);
    ok('M3: each strikes its foe for 100% where it lands, the rest of the foes none',want.every(e=>T.hits(e,100,true).length===1)&&S.F.filter(e=>!want.includes(e)).every(e=>!T.log.some(h=>h.e===e&&h.smx))&&sh.length===6&&sh.every(d=>d.hit));
    ok('M3: they land within about a second of the burst',sh.every(d=>d.t>a.t&&d.t-a.t<1.25),sh.map(d=>(d.t-a.t).toFixed(2)).join(','));
    ok('M3: nothing is left behind (shards, trails)',T.left===0&&T.floorOff,T.left);}
  {const G=go(),A=[foe(G.R,G.d0,0),foe(G.R,G.d0+.5,0)];EWM.dbg=[];setL(3);const log=[];hurt=function(e,amt,k,o){log.push({e,amt,smx:!!(o&&o.smx)});return H0.apply(this,arguments);};
    try{castScrollNow('eternalwinter',heroU,heroStats(),A.slice(),100,oF());run(9);}finally{hurt=H0;setL(0);}
    ok('M3: with only 2 foes, 2 shards fly (never two at one foe)',ev('aim')[0]&&ev('aim')[0].L.length===2&&A.every(e=>log.filter(h=>h.e===e&&h.smx&&near(h.amt,100)).length===1));}
  /* ---- M4 Winter's Hold ---- */
  {const T=trial(4,{visAt:[7.3,7.55],late:4.6}),{S}=T,hb=T.H.get(S.B),hl=S.late&&T.H.get(S.late);
    const hw=hb?T.tOf(S.B,1200)-hb.tf+.05:0;
    ok('M4: a boss stays frozen until the wave reaches it too, up to 2.4s (1.2 before)',hb&&near(hb.hold,Math.min(2.4,Math.max(1.2,hw)),.051)&&hb.hold>2.3&&near(hb.slow,hb.hold+2.5,1e-9),hb&&hb.hold.toFixed(2)+' wave '+hw.toFixed(2));
    ok('M4: never less than before: a boss the frost reaches late (the wave due sooner) is still held 1.2s',hl&&near(hl.hold,1.2)&&T.tOf(S.late,1200)!=null&&T.tOf(S.late,1200)-hl.tf<1.1,hl&&hl.hold.toFixed(2));
    ok('M4: in thicker ice (a second shell, crystals at its foot; more splinters when it thaws); the other foes\' ice as at Mastery 1',(()=>{const q=T.ice.find(q=>q.e===S.B),o=T.ice.filter(q=>!q.e.boss);return q&&q.z.g.children.length===13&&q.z.n===9&&o.every(q=>q.z.g.children.length===5&&q.z.n===5);})());
    ok('M4: the other foes are held as before (until the wave)',S.L.every(e=>untilWave(T,e,1200)));
    ok('M4: nothing is left behind',T.left===0&&T.floorOff,T.left+' '+T.leftD);}
  {const T=trial(3,{visAt:[7.3,7.55]});ok('M4 needs Mastery 4 (the boss held 1.2s at Mastery 3)',near(T.H.get(T.S.B).hold,1.2));}
  /* ---- M5 The Heart Breaks ---- */
  {const T=trial(5,{visAt:[7.3,7.55]}),{S}=T,pl=ev('plates')[0];
    ok('M5: the shatter wave strikes 1500% (1200% before)',S.F.every(e=>T.hits(e,1500).length===1&&!T.hits(e,1200).length));
    ok('M5: the ice sheet bursts up as the wave breaks it (plates of ice)',pl&&pl.n>40,pl&&pl.n);
    ok('M5: all the burst\'s shards are larger (x1.25)',ev('cast')[0].X.shardK===1.25);
    ok('M5: Masteries 1-4 ride it (320% frost, the long freeze, 6 shards, the boss held 2.4s)',S.F.every(e=>T.hits(e,320).length===1)&&ev('aim')[0].L.length===6&&ev('shard').length===6&&near(T.H.get(S.B).hold,2.4,.051)&&near(T.cine,6.4)&&S.L.every(e=>untilWave(T,e,1500)));
    ok('M5: nothing is left behind (the plates, the floor, the aurora)',T.left===0&&T.floorOff&&T.aurOff&&T.filtEnd==='',T.left);}
  {const T=trial(4,{visAt:[7.3,7.55]});ok('M5 needs Mastery 5',!ev('plates').length&&T.S.F.every(e=>T.hits(e,1200).length===1));}
  /* ---- the rest ---- */
  {setL(5);const T=trial(0,{plain:true,visAt:[6.7,6.95]});
    ok('casts that are not a mastered scroll cast are the old cast (Mastery 5 on the account)',!EWM.dbg.length&&T.S.F.every(e=>T.hits(e,200).length===1&&T.hits(e,1200).length===1)&&near(T.H.get(T.S.B).hold,1.2)&&near(T.cine,5.8));}
  /* only this scroll's own wait is checked: other scrolls' waits (another suite's last cast in the same page) may still be on */
  {const c0=cineLock,v0=MY_FROST.visible;cineLock=0;MY_FROST.visible=true;const a=smPvBusy();
    const own=SMPV_BUSY.filter(f=>{try{MY_FROST.visible=true;const x=!!f();MY_FROST.visible=false;const y=!!f();return x&&!y;}catch(e){return false;}});MY_FROST.visible=v0;cineLock=c0;
    ok('the mastery preview waits for the cast to end, its fade too (the floor is shared)',a&&own.length===1,a+' '+own.length);}
  {const e0=errs;for(let L=1;L<=5;L++){const S=stage();S.F.forEach((e,i)=>{e.maxHp=e.hp=i%2?2000:300;});heroU.scd={};heroU.gcd=0;setL(L);meta.spells.eternalwinter=meta.spells.eternalwinter||{lvl:1,hero:null};fireScroll(heroU,'eternalwinter',heroStats(),S.F.slice());run(13);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors and tidies up',errs===e0&&!MY_FROST.visible,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;nsFreezeFoe=F0;EWM.dbg=null;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
