(function(){
/* Eclipse of the Damned's masteries (v451). Run on the dev page: __kk.ev(await (await fetch('/tests/ecm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand on the road, most inside the ritual circle (held) and a few outside it; the game is stepped (update and updFx) and hurt is wrapped to
   log the amount each hit is called with (the scroll's power is 100: a star beam 150, a heavy gold one 225, the shatter 1000). Every beam's impact
   calls shockwave (1.2 for a beam, 2 for a gold one), which is wrapped to note where it landed and where every foe stood at that moment, so the
   foes each beam should strike are checked exactly at every mastery (Mastery 0 too, which logs nothing). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add,SW0=shockwave,EB0=ecmBurst,DB0=ECM.dbg;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
const G={x:0,z:-.5},GR=6.6,inC=(x,z)=>(x-G.x)**2+(z-G.z)**2<GR*GR;
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}heroU.cd=1e9;if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;darkTarget=0;darkAmt=0;cineLock=0;
  /* a stretch of road near the circle's heart, and the first stretch outside the circle */
  const R=ROUTES[0];let din=null,dout=null,bi=1e9;for(let d=1;d<R.len-6;d+=.25){const p=posAt(d,R),q=posAt(d+4.2,R),r2=(p[0]-G.x)**2+(p[1]-G.z)**2;
    if(inC(p[0],p[1])&&inC(q[0],q[1])&&r2<bi){bi=r2;din=d;}}
  for(let d=.5;d<R.len-3;d+=.25){let all=true;for(let k=0;k<=4;k++){const p=posAt(d+k*.6,R);if((p[0]-G.x)**2+(p[1]-G.z)**2<(GR+1)**2)all=false;}if(all){dout=d;break;}}
  return{R,din,dout};}
function foe(R,d,off,hp){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d;e.off=off||0;e.hp=e.maxHp=hp||1e7;e.armor=0;e.res={};e.spd=0;moveEnemy(e,0);return e;}
/* eight foes 0.6 apart on the road inside the circle (a beam of 0.55 does not reach a neighbour, one of 0.6+ does) and four outside it */
const stage=walk=>{const S=go(),I=[],O=[];for(let i=0;i<8;i++)I.push(foe(S.R,S.din+i*.6,0));if(S.dout!=null)for(let i=0;i<4;i++){const e=foe(S.R,S.dout+i*.6,0);if(walk)e.spd=1.6;O.push(e);}return{S,I,O,F:I.concat(O)};};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.eclipse=SM_XP[L-1];else delete meta.smast.eclipse;};
const oE=()=>({src:heroU,bane:0,el:'dark',anc:false,spell:'eclipse'});
const cast=L=>{setL(L);castScrollNow('eclipse',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oE());};
let log=[],imp=[],bursts=0;
const wrap=()=>{log=[];imp=[];bursts=0;
  hurt=function(e,amt,kind,o){if(o&&o.spell==='eclipse')log.push({e,amt,t:time,smx:!!o.smx});return H0.apply(this,arguments);};
  shockwave=function(x,z,R){if(R===1.2||R===2)imp.push({t:time,x,z,heavy:R===2,pos:enemies.filter(q=>!q.dead).map(q=>[q,q.x,q.z])});return SW0.apply(this,arguments);};
  ecmBurst=function(){bursts++;return EB0.apply(this,arguments);};};
const unwrap=()=>{hurt=H0;shockwave=SW0;ecmBurst=EB0;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>(ECM.dbg||[]).filter(d=>d.ev===n);
/* every beam struck exactly the foes within its reach (r, the gold ones rh) of where it landed, for amt (gold amtH), and nothing else */
const beamsExact=(r,rh,amt,amtH)=>{let bad=0;const used=new Set();for(const b of imp){const R=b.heavy?rh:r,A=b.heavy?amtH:amt,want=b.pos.filter(p=>(p[1]-b.x)**2+(p[2]-b.z)**2<R*R).map(p=>p[0]),
    got=log.filter(h=>h.t===b.t&&near(h.amt,A));got.forEach(h=>used.add(h));if(want.length!==got.length||!want.every(e=>got.some(h=>h.e===e)))bad++;}return{bad,n:imp.length,stray:log.filter(h=>!used.has(h)&&h.amt<900).length};};
/* (the ripples where foes wade are a pool the terrain keeps: the first foes in water make it) */
const left=added=>added.filter(o=>{if(typeof TER!=='undefined'&&TER.rip&&TER.rip.includes(o))return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const reach=(r)=>imp.some(b=>!b.heavy&&b.pos.some(p=>{const d=Math.hypot(p[1]-b.x,p[2]-b.z);return d>.555&&d<r&&log.some(h=>h.t===b.t&&h.e===p[0]);}));
try{
  /* ---- the card ---- */
  ok('the five masteries: Starfire, Greater Stars, Falling Sky, None Escape, The Sun Breaks (v451)',SM_D.eclipse.map(x=>x.n).join('|')==='Starfire|Greater Stars|Falling Sky|None Escape|The Sun Breaks',SM_D.eclipse.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (12%, 0.6 / 0.9 tiles; 30% gold; a star every 0.0625s, 400 stars; 1200%, 90 shards)',
    /12%/.test(smDesc('eclipse',0))&&/0\.6 tiles/.test(smDesc('eclipse',0))&&/0\.9\b/.test(smDesc('eclipse',0))&&/30%/.test(smDesc('eclipse',1))&&/18%/.test(smDesc('eclipse',1))&&/0\.0625s/.test(smDesc('eclipse',2))&&/400/.test(smDesc('eclipse',2))&&/1200%/.test(smDesc('eclipse',4))&&/90/.test(smDesc('eclipse',4))
    &&ECM.beam===.12&&ECM.R===.6&&ECM.RH===.9&&ECM.heavy===.3&&ECM.gap===.0625&&ECM.ns===400&&ECM.aim===.75&&ECM.shat===12&&ECM.shards===90,SM_D.eclipse.map((x,i)=>smDesc('eclipse',i)).join(' / '));
  ok('the old masteries are gone (no mark, corona, hands, dying stars or second sunset hooks); calibrated with hidden factors',!SMF.eclipse.hit&&!SMF.eclipse.cast&&SMA.eclipse.every(x=>x===1)&&SMG.eclipse.length===5&&SMG.eclipse.every(x=>x>=.8&&x<1.2),SMG.eclipse.join());
  ok('the cast\'s own numbers (ECLD) are the old ones: 150% beams, 18% gold at 1.5x, 0.55 / 0.85, a star every 0.07s, 320 stars, 1000%, 60 shards',
    JSON.stringify(ECLD)==='{"BEAM":1.5,"HEAVY":0.18,"HEAVYK":1.5,"R":0.55,"RH":0.85,"GAP":0.07,"NS":320,"SHAT":10,"SHARDS":60,"SHARDK":1,"thick":1,"coreW":0.45,"tint":0,"starA":1,"waveA":1}',JSON.stringify(ECLD));
  /* ---- Mastery 0 ---- */
  {const S=stage();ECM.dbg=[];wrap();const added=track();try{cast(0);run(13);}finally{unwrap();scene.add=S0;}const x=beamsExact(.55,.85,150,225);
    ok('Mastery 0: about 32 star beams (one every 0.07s from 4.75s to 6.95s), no mastery events, no starfire',imp.length>=31&&imp.length<=33&&!ECM.dbg.length&&bursts===0,imp.length+' beams');
    ok('Mastery 0: every beam strikes exactly the foes within 0.55 of where it lands (a gold one 0.85) for 150% (225%)',x.n>=31&&!x.bad&&!x.stray,JSON.stringify(x));
    ok('Mastery 0: the shatter strikes every foe once for 1000%',S.F.every(e=>log.filter(h=>h.e===e&&near(h.amt,1000)).length===1)&&log.every(h=>[150,225,1000].some(a=>near(h.amt,a))),S.F.length+' foes');
    ok('Mastery 0: nothing is left behind',left(added)===0&&darkTarget===0,left(added));}
  /* ---- M1 Starfire ---- */
  {let x=null,X=null,R1=false;const added=[];for(let k=0;k<3&&!R1;k++){const S=stage();ECM.dbg=[];wrap();const a=track();try{cast(1);run(13);}finally{unwrap();scene.add=S0;}added.push(...a);
      x=beamsExact(.6,.9,168,252);X=ev('cast')[0]&&ev('cast')[0].X;R1=reach(.6);if(x.bad||x.stray)break;}
    ok('M1: every beam strikes 12% harder (168%, a gold one 252%), exactly the foes within 0.6 of where it lands (a gold one 0.9)',x.n>=31&&!x.bad&&!x.stray,JSON.stringify(x));
    ok('M1: the wider reach takes a foe standing 0.55-0.6 from the impact (a neighbour on the road)',R1);
    ok('M1: every impact bursts up in starfire (3D), and the beams are drawn thicker with whiter cores',bursts===imp.length&&X&&X.thick===1.25&&X.coreW>ECLD.coreW,bursts+'/'+imp.length);
    ok('M1: no other change (about 32 beams, 18% gold, the shatter 1000%)',imp.length>=31&&imp.length<=33&&X&&X.HEAVY==null&&X.GAP==null&&X.SHAT==null&&log.filter(h=>h.amt>=900).every(h=>near(h.amt,1000)),imp.length);
    ok('M1: nothing is left behind (the starfire balls are freed)',left(added)===0,left(added));}
  /* ---- M2 Greater Stars ---- */
  {const share=L=>{let n=0,h=0,amts=true;for(let c=0;c<5;c++){stage();ECM.dbg=[];wrap();try{cast(L);run(12);}finally{unwrap();}n+=imp.length;h+=imp.filter(b=>b.heavy).length;const x=beamsExact(.6,.9,168,252);if(x.bad||x.stray)amts=false;}return{n,h,f:h/n,amts};};
    const a=share(1),b=share(2);
    ok('M2: the heavy gold beams fall 30% of the time (18% before): measured over 5 casts each',b.f>.19&&b.f<.42&&a.f>.07&&a.f<.3,(a.f*100).toFixed(0)+'% / '+(b.f*100).toFixed(0)+'% of '+a.n+' / '+b.n);
    ok('M2: still 252% and 0.9 wide (Starfire), every beam exact',b.amts&&a.amts);}
  /* ---- M3 Falling Sky ---- */
  {const trial=L=>{const S=stage();ECM.dbg=[];wrap();const added=track();let t0=time,uA=0;try{cast(L);for(let i=0;i<260;i++){run(.05);for(const o of added)if(o.traverse)o.traverse(q=>{if(q.isPoints&&q.geometry.attributes.position.count>=320&&q.material.uniforms)uA=Math.max(uA,q.material.uniforms.uA.value);});}}finally{unwrap();scene.add=S0;}
      let ns=0;for(const o of added)if(o.traverse)o.traverse(q=>{if(q.isPoints&&q.geometry.attributes.position.count>=320)ns=q.geometry.attributes.position.count;});
      const bt=ev('beam').map(d=>d.t-t0);return{n:imp.length,ns,uA,first:Math.min(...bt),last:Math.max(...bt),x:beamsExact(.6,.9,168,252)};};
    const a=trial(2),b=trial(3);
    ok('M3: a star falls every 0.0625s: about 35 beams instead of 32, in the same window (4.75s to 6.95s)',b.n>=34&&b.n<=36&&a.n>=31&&a.n<=33&&b.first>=4.75&&b.last<6.96,a.n+' / '+b.n+' beams, '+b.first.toFixed(2)+'-'+b.last.toFixed(2)+'s');
    ok('M3: the sky holds 400 stars (320 before), twinkling 1.3 times as bright while they wait',b.ns===400&&a.ns===320&&near(b.uA,1.3,.01)&&near(a.uA,1,.01),a.ns+'/'+b.ns+' '+a.uA.toFixed(2)+'/'+b.uA.toFixed(2));
    ok('M3: every beam exact',!b.x.bad&&!b.x.stray,JSON.stringify(b.x));}
  /* ---- M4 None Escape ---- */
  {const S=stage(true);ECM.dbg=[];const hit=new Map(),claim=new Map(),bad=[];let aimed=0,aimedI=0,free=0,onFoe=0,lockBad=0,follow=0,followBad=0;const pick=new Map();
    const sc=e=>(hit.get(e)||0)+(claim.get(e)||0);
    ECM.dbg.push=function(d){
      if(d.ev==='beam'){if(d.e){aimed++;if(S.I.includes(d.e))aimedI++;const m=Math.min(...enemies.filter(q=>!q.dead).map(sc));if(sc(d.e)!==m)bad.push(d.n);claim.set(d.e,(claim.get(d.e)||0)+1);pick.set(d,{x:d.e.x,z:d.e.z});}else free++;}
      if(d.ev==='hit'){if(d.e){claim.set(d.e,(claim.get(d.e)||0)-1);const dd=Math.hypot(d.e.x-d.x,d.e.z-d.z);if(dd<.02&&d.L.includes(d.e))onFoe++;else lockBad++;
          const b=this.find(q=>q.ev==='beam'&&q.e===d.e&&pick.has(q)&&!q.done);if(b){b.done=1;const p=pick.get(b),moved=Math.hypot(d.e.x-p.x,d.e.z-p.z);if(moved>.3){follow++;if(Math.abs(Math.hypot(d.x-p.x,d.z-p.z)-moved)>.02)followBad++;}}}
        for(const e of d.L)hit.set(e,(hit.get(e)||0)+1);}
      return Array.prototype.push.call(this,d);};
    wrap();try{cast(4);run(13);}finally{unwrap();}const x=beamsExact(.6,.9,168,252);
    ok('M4: every star that falls on a foe picks one no star has struck yet, then the least struck (a foe a falling star is locked on counts as struck)',aimed>=20&&!bad.length,aimed+' aimed, '+bad.length+' not the least struck');
    ok('M4: the rest still fall anywhere on the ritual ground (about a quarter)',free>=3&&free/(aimed+free)<.45,free+' of '+(aimed+free));
    ok('M4: each lands right on its foe without scatter and strikes it, its sigil locked on the foe until the beam strikes',aimed>=20&&onFoe===aimed&&!lockBad,onFoe+'/'+aimed);
    ok('M4: a star locked on a walking foe (or one the circle drags in) follows it (lands where the foe went, not where it was)',follow>=2&&!followBad,follow+' followed, '+followBad+' left behind');
    ok('M4: none escape: every foe is struck, the ones outside the circle too',S.F.every(e=>log.some(h=>h.e===e&&h.amt<900)),S.F.filter(e=>!log.some(h=>h.e===e&&h.amt<900)).length+' missed');
    ok('M4: every beam exact (Starfire, Greater Stars and Falling Sky ride it: 168% / 252%, about 35 beams)',!x.bad&&!x.stray&&imp.length>=34&&imp.length<=36,JSON.stringify(x));}
  /* ---- M5 The Sun Breaks ---- */
  {const trial=L=>{const S=stage();ECM.dbg=[];wrap();const added=track();let shards=0,wA=0,wFS='',lock=0,sc0=9,sc1=0;try{cast(L);lock=cineLock;for(let i=0;i<260;i++){run(.05);
        for(const o of added)if(o.traverse)o.traverse(q=>{if(q.isMesh&&q.material&&q.material.type==='MeshPhongMaterial'&&q.children[0]&&q.children[0].isLineSegments){const Q=q.parent.children.filter(c=>c.isMesh&&c.material===q.material);if(Q.length>shards){shards=Q.length;sc0=Math.min(...Q.map(c=>c.scale.x));sc1=Math.max(...Q.map(c=>c.scale.x));}}
          if(q.isMesh&&q.material&&q.material.uniforms&&q.material.uniforms.uR&&q.material.uniforms.uA){wA=Math.max(wA,q.material.uniforms.uA.value);wFS=q.material.fragmentShader;}});}}finally{unwrap();scene.add=S0;}
      return{S,shards,sc0,sc1,wA,wFS,left:left(added),dark:darkTarget,lock,sh:S.F.map(e=>log.filter(h=>h.e===e&&h.amt>=900).map(h=>h.amt))};};
    const a=trial(4),b=trial(5);
    ok('M5: the shatter strikes every foe on the map once for 1200% (1000% before)',b.sh.every(v=>v.length===1&&near(v[0],1200))&&a.sh.every(v=>v.length===1&&near(v[0],1000)),b.sh.map(v=>v.join('+')).join(','));
    ok('M5: the sun breaks into 90 glass shards (60 before), 1.3 times as large (0.39-1.43 across, 0.3-1.1 before)',b.shards===90&&a.shards===60&&a.sc0>=.3-1e-6&&a.sc1<=1.1+1e-6&&b.sc0>=.39-1e-6&&b.sc1<=1.43+1e-6&&b.sc1>1.1,a.shards+' / '+b.shards+' '+a.sc0.toFixed(2)+'-'+a.sc1.toFixed(2)+' / '+b.sc0.toFixed(2)+'-'+b.sc1.toFixed(2));
    ok('M5: a darker, deeper wave rolls across the map (its band wider, 1.2 times as dark)',near(b.wA,1.2,.01)&&near(a.wA,1,.01)&&/f-0?\.3,f,r/.test(b.wFS)&&/f-\.22,f,r/.test(a.wFS),a.wA.toFixed(2)+'/'+b.wA.toFixed(2));
    ok('M5: the rite keeps its length (cineLock 11.5s) and its darkness lifts at the end',near(b.lock,11.5)&&b.dark===0&&darkTarget===0,b.lock+' '+b.dark);
    ok('M5: nothing is left behind',b.left===0&&a.left===0,a.left+'/'+b.left);}
  /* ---- the rest ---- */
  {stage();ECM.dbg=[];setL(5);wrap();try{castEclipse(heroU,100,oE());run(13);}finally{unwrap();setL(0);}const x=beamsExact(.55,.85,150,225);
    ok('casts that are not a mastered scroll cast are the old rite',!ECM.dbg.length&&bursts===0&&!x.bad&&!x.stray&&imp.length>=31&&imp.length<=33&&log.filter(h=>h.amt>=900).every(h=>near(h.amt,1000)),JSON.stringify(x));}
  {const e0=errs,lv=[];for(let L=0;L<=5;L++){const S=stage();S.F.forEach(e=>{e.maxHp=e.hp=2500;});heroU.scd={};heroU.gcd=0;setL(L);ECM.dbg=[];meta.spells.eclipse=meta.spells.eclipse||{lvl:1,hero:null};fireScroll(heroU,'eclipse',heroStats(),S.F.slice());run(14);
      const c=ev('cast')[0];lv.push(c?c.L:0);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors, each at its own mastery',errs===e0&&lv.join()==='0,1,2,3,4,5',(errs-e0)+' errors, levels '+lv.join());}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;unwrap();scene.add=S0;ECM.dbg=DB0;window.__fz=false;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
