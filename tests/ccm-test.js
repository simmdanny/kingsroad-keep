(function(){
/* Cataclysm's masteries (v423). Run on the dev page: __kk.ev(await (await fetch('/tests/ccm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add,F0=flash;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.cataclysm=SM_XP[L-1];else delete meta.smast.cataclysm;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=3;d<R.len-3;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>CCM.dbg.filter(d=>d.ev===n);
const MEV=['shard','wb','stone','fence','held','breach','knock','shrap'];
const walk=sec=>{for(let i=0;i<Math.round(sec/.05);i++){for(const e of enemies)if(!e.dead)moveEnemy(e,.05);updFx(.05);time+=.05;}};
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
/* a knot of foes on the road (the toughest at the far end), cast at the middle one */
const knot=(n,gap)=>{const d0=spotD(),F=[];for(let i=0;i<n;i++)F.push(foe(d0+(i-(n>>1))*(gap||.35),(i%3-1)*.2,1e9-i*1e6));return F;};
const cast=(L,c)=>{setL(L);castScrollNow('cataclysm',heroU,tStats(heroU),[c],100,{src:heroU,bane:0,el:'dark',anc:false,spell:'cataclysm'});};
const END=5;
try{
  ok('the five masteries: Standing Stones, Falling Sky, Obsidian Chains, Shrapnel, World Breaker (v442)',SM_D.cataclysm.map(x=>x.n).join('|')==='Standing Stones|Falling Sky|Obsidian Chains|Shrapnel|World Breaker',SM_D.cataclysm.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (70%, 5s / 1.5 tiles / 20% / 4, 35%)',/70%/.test(smDesc('cataclysm',1))&&/5s/.test(smDesc('cataclysm',3))&&/1\.5 tiles/.test(smDesc('cataclysm',3))&&/20%/.test(smDesc('cataclysm',3))&&/up to 4/.test(smDesc('cataclysm',3))&&/35%/.test(smDesc('cataclysm',4))
    &&CCM.ring===.95&&CCM.fs===.7&&CCM.fsN===4&&CCM.fsR===.5&&CCM.ch===.9&&CCM.sh===.2&&CCM.shN===4&&CCM.shR===1.5&&CCM.shT===5&&CCM.wb===.35&&CCM.wbR===.75&&CCM.wbReach===4.5);
  ok('the old masteries are gone (no hooks), calibrated on the Epic ladder with hidden factors (not SM.free)',!SMF.cataclysm.hit&&!SMF.cataclysm.cast&&SMA.cataclysm.every(x=>x===1)&&SMG.cataclysm.length===5&&SMG.cataclysm.every(x=>x>=1&&x<1.35)&&!(SM.free&&SM.free.cataclysm),SMG.cataclysm.join());
  /* ---- Mastery 0 ---- */
  {play();CCM.dbg=[];log=[];const F=knot(7);let nf=0;flash=function(){nf++;return F0.apply(this,arguments);};wrapHurt();try{cast(0,F[3]);run(END);}finally{hurt=H0;flash=F0;setL(0);}
    const pl=ev('pillar'),cl=ev('collapse')[0],c=ev('cast')[0];
    ok('Mastery 0: eight pillars (200% each to foes on them) and the collapse',pl.length===8&&pl.every(d=>d.L.every(e=>log.some(h=>h.e===e&&!h.smx&&near(h.amt,200)&&near(h.t,d.t,.01))))&&cl&&cl.L.length===7,pl.length);
    ok('Mastery 0: the collapse deals 300% falling to half at the edge',cl.L.every(q=>{const d=Math.hypot(q.e.x-c.x,q.e.z-c.z);return log.some(h=>h.e===q.e&&!h.smx&&near(h.amt,300*(1-d/3.9*.5)));}));
    ok('Mastery 0: no masteries (no mastery hits or events, no chains, no ring, no shards)',!log.some(h=>h.smx)&&!CCM.dbg.some(d=>MEV.includes(d.ev))&&pl.every(d=>!d.ch.length&&!d.ring)&&F.every(e=>!e.ccmSh));
    ok('Mastery 0: no flat flashes (the pillars and the collapse burst in 3D)',nf===0,nf);}
  /* ---- M1 Standing Stones ---- */
  {play();CCM.dbg=[];log=[];const F=knot(7);const added=track();wrapHurt();try{cast(1,F[3]);run(END);}finally{hurt=H0;scene.add=S0;setL(0);}const pl=ev('pillar'),c=ev('cast')[0],rg=ev('stone');
    ok('M1: seven standing stones rise in a ring at the rune\'s edge; the eight pillars rise inside as before',rg.length===7&&rg.every(d=>near(Math.hypot(d.x-c.x,d.z-c.z),1.9*CCM.ring,.01))&&pl.length===8&&pl.every(d=>Math.hypot(d.x-c.x,d.z-c.z)<1.9*.86),rg.map(d=>Math.hypot(d.x-c.x,d.z-c.z).toFixed(2)).join());
    ok('M1: the stones deal no damage (only the pillars and the collapse hit)',!log.some(h=>h.smx));
    run(3);ok('M1: the stones are gone after the collapse',smLeft(added)===0,smLeft(added));
    ok('M1: early, as the ground cracks (all up within 0.9s), and the ring is even',rg.every(d=>d.t-c.t<.92)&&rg.every((d,k)=>{const a=Math.atan2(d.z-c.z,d.x-c.x),b=Math.atan2(rg[(k+1)%7].z-c.z,rg[(k+1)%7].x-c.x);let q=b-a;while(q<0)q+=6.2832;return near(q,6.2832/7,.02);}),rg.map(d=>(d.t-c.t).toFixed(2)).join());}
  {play();CCM.dbg=[];const F=knot(7);F.forEach(e=>{e.spd=.5;});const B=foe(F[3].dist+.6,.25),Fl=foe(F[3].dist+.6,-.2),U=foe(F[3].dist+.8,.2);B.boss=true;B.spd=.8;Fl.fly=true;Fl.spd=.8;U.spd=.8;U.unstopT=30;
    cast(1,F[3]);walk(2.2);setL(0);const fe=ev('fence')[0],c=ev('cast')[0],FR=1.9*CCM.ring,hd=ev('held');
    ok('M1: when the ring closes, the ground foes inside it are fenced in (not a boss, not a flyer)',fe&&F.every(e=>fe.L.includes(e))&&!fe.L.includes(B)&&!fe.L.includes(Fl),fe&&fe.L.length);
    ok('M1: a foe that reaches the stones is held there until the collapse (Resolve applies)',hd.length>0&&hd.every(d=>d.e.stunT>0||d.e.dead)&&F.every(e=>Math.hypot(e.x-c.x,e.z-c.z)<FR+.05),hd.length+' held');
    ok('M1: a foe with no Resolve left breaks out; the boss and the flyer walk out',fe&&fe.L.includes(U)&&ev('breach').some(d=>d.e===U)&&Math.hypot(U.x-c.x,U.z-c.z)>FR&&Math.hypot(B.x-c.x,B.z-c.z)>FR&&Math.hypot(Fl.x-c.x,Fl.z-c.z)>FR,[Math.hypot(U.x-c.x,U.z-c.z),Math.hypot(B.x-c.x,B.z-c.z)].map(v=>v.toFixed(2)).join());}
  {play();CCM.dbg=[];const F=knot(5);F.forEach(e=>{e.spd=1.2;});cast(0,F[2]);walk(2.2);setL(0);const c=ev('cast')[0];ok('Mastery 0: no fence (the front foes walk out of the rune)',!ev('fence').length&&F.some(e=>Math.hypot(e.x-c.x,e.z-c.z)>1.9));}
  /* ---- M2 Falling Sky ---- */
  {play();CCM.dbg=[];log=[];const F=knot(7);wrapHurt();try{cast(2,F[3]);run(END);}finally{hurt=H0;setL(0);}const sh=ev('shard'),cl=ev('collapse')[0];
    ok('M2: four shards fall while the rune charges, before the collapse',sh.length===4&&sh.every(d=>d.t<cl.t),sh.length);
    ok('M2: onto four different foes',new Set(sh.map(d=>d.e)).size===4);
    ok('M2: 70% to each foe within 0.5 of where it lands',sh.every(d=>d.L.length&&d.L.every(e=>Math.hypot(e.x-d.x,e.z-d.z)<CCM.fsR&&log.some(h=>h.e===e&&h.smx&&near(h.amt,70)&&near(h.t,d.t,.01)))),sh.map(d=>d.L.length).join());}
  /* ---- M3 Obsidian Chains ---- */
  {play();CCM.dbg=[];log=[];const F=knot(7),Fl=foe(F[3].dist+.1,.1);Fl.fly=true;wrapHurt();let st=null;try{cast(3,F[3]);run(1.7);st=F.map(e=>e.stunT||0);run(END-1.7);}finally{hurt=H0;setL(0);}
    const pl=ev('pillar'),ch=new Set(pl.flatMap(d=>d.ch)),cl=ev('collapse')[0],c=ev('cast')[0];
    ok('M3: a rising pillar chains the ground foes within 0.9 of it',ch.size>0&&pl.every(d=>d.ch.every(e=>Math.hypot(e.x-d.x,e.z-d.z)<CCM.ch)),ch.size);
    ok('M3: never a flyer',!ch.has(Fl));
    ok('M3: chained foes are held until the collapse',F.every((e,i)=>!ch.has(e)||st[i]>0));
    ok('M3: and the collapse hits them at full strength (300%), the rest with the falloff',cl.L.every(q=>q.full===ch.has(q.e))&&cl.L.filter(q=>q.full).every(q=>log.some(h=>h.e===q.e&&!h.smx&&near(h.amt,300))));}
  /* ---- M4 Shrapnel ---- */
  {play();CCM.dbg=[];log=[];const F=knot(5),Lone=foe(F[2].dist+4);const TT={src:{type:Object.keys(TD)[0]}};cast(4,F[2]);run(2.6);setL(0);const cl=ev('collapse')[0];
    ok('M4: foes the collapse hits are studded with obsidian for 5s (four shards)',cl&&cl.L.every(q=>q.e.ccmSh&&q.e.ccmSh.until>time+4.3&&q.e.ccmSh.n===0&&q.e.ccmSh.vis.length===4),cl&&cl.L.length);
    const e=F[2],nb=enemies.filter(q=>q!==e&&!q.dead).sort((a,b)=>Math.hypot(a.x-e.x,a.z-e.z)-Math.hypot(b.x-e.x,b.z-e.z))[0];wrapHurt();
    try{hurt(e,100,'phys',TT);run(.3);const k1=ev('knock'),s1=ev('shrap');
      ok('M4: a tower hit knocks a shard into the nearest other foe within 1.5 tiles: 20%',k1.length===1&&k1[0].tg===nb&&s1.length===1&&s1[0].hit&&log.some(h=>h.e===nb&&h.smx&&near(h.amt,20)),k1.length+' '+s1.length);
      hurt(e,100,'phys',{src:heroU,el:'fire'});run(.3);ok('M4: so does the hero\'s own attack',ev('knock').length===2);
      hurt(e,100,'magic',{src:heroU,el:'dark',spell:'cataclysm'});hurt(e,100,'magic',{src:TT.src,dot:true});hurt(e,100,'magic',{src:heroU,smx:1});run(.3);
      ok('M4: a scroll, a burn or a mastery hit knocks none',ev('knock').length===2);
      for(let i=0;i<4;i++)hurt(e,100,'phys',TT);run(.3);ok('M4: up to 4 a foe',ev('knock').filter(d=>d.e===e).length===4&&e.ccmSh.n===4);
      const q=Lone;q.ccmSh=null;ccmStud(q,20,{src:heroU,spell:'cataclysm'});hurt(q,100,'phys',TT);run(.3);ok('M4: with no foe within 1.5 tiles the shard stays in',!ev('knock').some(d=>d.e===q)&&q.ccmSh.n===0);
      run(5);hurt(F[1],100,'phys',TT);run(.3);ok('M4: and only for 5s',!ev('knock').some(d=>d.e===F[1]&&d.t>time-1));}finally{hurt=H0;}}
  /* ---- M5 World Breaker ---- */
  {play();CCM.dbg=[];log=[];const F=knot(10,.3),Far=foe(F[5].dist+6);const added=track();wrapHurt();
    try{cast(5,F[5]);run(END);const wb=ev('wb'),pl=ev('pillar'),c=ev('cast')[0],pool=F.concat([Far]).filter(e=>Math.hypot(e.x-c.x,e.z-c.z)<CCM.wbReach).sort((a,b)=>b.maxHp-a.maxHp).slice(0,8);
      ok('M5: every pillar that rose comes back down',wb.length===pl.length&&wb.length===8,wb.length);
      ok('M5: onto the toughest foes within 4.5 tiles, a different one each',new Set(wb.map(d=>d.e)).size===wb.length&&wb.every(d=>pool.includes(d.e))&&(Math.hypot(Far.x-c.x,Far.z-c.z)<CCM.wbReach||!wb.some(d=>d.e===Far)),wb.map(d=>F.indexOf(d.e)).join());
      ok('M5: one after another, 0.12s apart',wb.every((d,i)=>!i||near(d.t-wb[i-1].t,.12,.6)),wb.map(d=>d.t.toFixed(2)).join());
      ok('M5: 35% to each foe within 0.75 of where each lands',wb.every(d=>d.L.includes(d.e)&&d.L.every(e=>log.some(h=>h.e===e&&h.smx&&near(h.amt,35)&&near(h.t,d.t,.01)))));
      run(3);ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();CCM.dbg=[];const F=knot(5);cast(4,F[2]);run(END);setL(0);ok('M5 needs Mastery 5',!ev('wb').length);}
  /* ---- the rest ---- */
  {play();CCM.dbg=[];const F=knot(5);setL(5);castCataclysm(heroU,F[2],100,{src:heroU,el:'dark',spell:'cataclysm'});run(END);setL(0);
    ok('casts that are not a mastered scroll cast get no masteries (only the new 3D bursts)',ev('pillar').length===8&&!CCM.dbg.some(d=>MEV.includes(d.ev))&&ev('pillar').every(d=>!d.ch.length&&!d.ring));}
  {const e0=errs;for(let L=1;L<=5;L++){play();const F=knot(8);F.forEach(e=>{e.maxHp=e.hp=150;});cast(L,F[4]);run(END+1);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;flash=F0;CCM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
