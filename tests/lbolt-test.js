(function(){
/* The Light Bolt's masteries redone to Simon's specs (v377): the card texts and numbers (trail 20%, beam 20%, Prism Split 25%, Sunpierce 50%,
   the sun as before), the Mark of Dawn (the next light hit, and only a light hit that is not the marking one or a damage tick, calls one
   beam; the bolt that consumes a mark leaves a new one; it lasts 5s), the 2 prism motes, the lance into the foe behind, the sun on every 4th
   bolt (corona in flight, burst on landing), and clean-up. Run on the dev page: __kk.ev(await (await fetch('/tests/lbolt-test.js')).text())
   returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i)=>{const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=0;e.spd=.0001;e.maxHp=4000;e.hp=1e9;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.lightbolt=SM_XP[L-1];else delete meta.smast.lightbolt;};
const oF=k=>({src:heroU,bane:0,el:SPELL_EL[k],anc:false,spell:k});
/* counts the Light Bolt's own hits by kind: the bolt, the beam, the add-ons */
let H=null;const H0=hurt;
const cast=(list,P)=>castScrollNow('lightbolt',heroU,tStats(heroU),list,P||100,oF('lightbolt'));
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
try{
  hurt=function(e,amt,kind,o){if(H&&o&&o.spell==='lightbolt'){const k=o.smLBeam?'beam':o.smx?'add':'bolt';(H[k]=H[k]||[]).push([e,Math.round(amt)]);}return H0.apply(this,arguments);};
  /* ---- the card ---- */
  ok('the card: Radiant Trail, Mark of Dawn, Prism Split, Sunpierce, Dawnbreaker',SM_D.lightbolt.map(x=>x.n).join(',')==='Radiant Trail,Mark of Dawn,Prism Split,Sunpierce,Dawnbreaker');
  const T=[0,1,2,3,4].map(i=>smDesc('lightbolt',i));
  ok('Simon\'s numbers: trail 20%, beam 20%, Prism Split 25% (was 20%), Sunpierce 50%, the sun as before (50% more, a 30% burst)',/20%/.test(T[0])&&/20%/.test(T[1])&&/25% each/.test(T[2])&&/50%/.test(T[3])&&/50% more/.test(T[4])&&/30% around/.test(T[4]),T.join(' | '));
  /* ---- Mark of Dawn ---- */
  play();setL(2);SM.cnt.lightbolt=0;let bd=near();const A=foe(bd,0);paused=false;H={};
  cast([A]);run(1.2);
  ok('Mastery 2: the bolt marks the foe it strikes and the marking hit calls no beam',!!A.smLB&&!A.smLB.done&&!(H.beam||[]).length,JSON.stringify({m:!!A.smLB,b:(H.beam||[]).length}));
  const mk=scene.children.filter(o=>o.userData&&o.userData.sm).length;ok('and a gold halo of light hangs over it',mk>=1,mk);
  hurt(A,10,'magic',{src:heroU,el:'fire',spell:'emberbolt'});hurt(A,10,'magic',{src:heroU,el:'light',spell:'sunflare',dot:true});run(.3);
  ok('a fire hit or a light damage tick does not call the beam',!!A.smLB&&!(H.beam||[]).length);
  hurt(A,10,'magic',{src:heroU,el:'light',spell:'sunflare'});run(.3);
  ok('the next light hit (another light scroll) calls one tiny beam, for 20% of the bolt',(H.beam||[]).length===1&&H.beam[0][0]===A&&Math.abs(H.beam[0][1]-36)<=2&&!A.smLB,JSON.stringify((H.beam||[]).map(x=>x[1])));
  H={};cast([A]);run(1.2);cast([A]);run(1.2);
  ok('a second bolt consumes the first one\'s mark (a beam) and leaves a new mark',(H.beam||[]).length===1&&!!A.smLB&&!A.smLB.done,JSON.stringify({b:(H.beam||[]).length,m:!!A.smLB}));
  run(5.5);ok('the mark fades after 5s',!A.smLB||A.smLB.until<=time);
  /* ---- Prism Split, Sunpierce, the sun ---- */
  play();setL(5);SM.cnt.lightbolt=0;bd=near();const L=[0,1,2].map(i=>foe(bd-.35*i,i));const lead=L[0];H={};
  cast([lead]);run(1.5);
  const adds=(H.add||[]).map(x=>x[1]),b1=(H.bolt||[])[0];
  ok('Mastery 3: 2 prism motes strike foes nearby for 25% each',adds.filter(v=>Math.abs(v-45)<=2).length>=2,JSON.stringify(adds));
  ok('Mastery 4: a lance of light hits the foe just behind for 50%',(H.add||[]).some(x=>x[0]===L[1]&&Math.abs(x[1]-90)<=2),JSON.stringify((H.add||[]).map(x=>[L.indexOf(x[0]),x[1]])));
  H={};for(let i=0;i<3;i++){cast([lead]);run(.12);if(i===2){const c=[...SM.ctx.values()].pop();ok('Mastery 5: the 4th bolt flies as a small sun (a corona in flight)',c&&c.k==='lightbolt'&&c.n===4&&c.sun===true,c&&c.n);}run(1.4);}
  ok('and lands in a burst: the sun\'s extra damage on the target',(H.add||[]).some(x=>x[0]===lead&&Math.abs(x[1]-Math.round(180*.6*.8))<=2),JSON.stringify((H.add||[]).filter(x=>x[0]===lead).map(x=>x[1])));
  /* ---- clean-up ---- */
  const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};play();setL(5);SM.cnt.lightbolt=0;bd=near();const F=[0,1,2,3,4,5].map(i=>foe(bd-.3*i,i));paused=false;
  for(let i=0;i<8;i++){cast(F.filter(e=>!e.dead));run(3.5);}run(8);scene.add=S0;
  const left=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});
  ok('every trail, halo, beam, mote, lance and sun is gone after the fight',!left.length,left.length);
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{hurt=H0;console.error=ce;scene.add=S0;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
