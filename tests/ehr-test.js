(function(){
/* The six elemental specialists (v449). Run on the dev page: __kk.ev(await (await fetch('/tests/ehr-test.js')).text())
   returns [name, ok, detail] rows. Each hero is recruited, equipped and spawned; its bolts are fired at foes standing on the road and the
   projectiles stepped (updProjs) until they land, with hurt wrapped to log each hit. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const IDS=['sylvara','isolde','ignatia','corvin','vesper','seraphine'],ELS={sylvara:'nature',isolde:'ice',ignatia:'fire',corvin:'dark',vesper:'lightning',seraphine:'light'};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;projs.forEach(p=>scene.remove(p.m));projs.length=0;};
const play=id=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);meta.owned=meta.owned||{};meta.owned[id]=true;meta.equipped=id;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(heroU&&heroU.hero!==id)despawnHero();if(!heroU){const q=heroTileNear(id,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[id]=[null,null,null];ART_V++;state='playing';};
const foe=(x,z,hp)=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=0;d<R.len;d+=.05){const p=posAt(d,R),q=Math.hypot(p[0]-x,p[1]-z);if(q<bd){bd=q;bdd=d;}}
  spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdd;e.off=0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
/* a knot of foes on the road within the hero's reach */
const knot=n=>{const R=ROUTES[0],s=heroStats();let bd=1e9,bdd=0;for(let d=0;d<R.len;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<s.range*.7&&q>.8&&q<bd){bd=q;bdd=d;}}
  const F=[];for(let i=0;i<n;i++){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdd+i*.35;e.off=0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=1e9;e.armor=0;e.res={};e.shield=0;e.slow=0;e.slowT=0;F.push(e);}return F;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,el:o&&o.el,dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const fire=(tgt,n)=>{const s=heroStats();for(let i=0;i<(n||1);i++){heroFire('staff',tgt,s);for(let k=0;k<60&&projs.length;k++){updProjs(.05);updFx(.05);time+=.05;}}return s;};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
try{
  const H=IDS.map(id=>HB[id]);
  ok('six new heroes, one for each element',H.every(Boolean)&&new Set(H.map(h=>h.elem)).size===6&&IDS.every(id=>HB[id].elem===ELS[id]),H.map(h=>h&&h.elem).join());
  ok('4-star spellcasters that cast scrolls (6 slots)',H.every(h=>h.stars===4&&h.cl==='mage'&&h.mage&&h.scrolls&&slotsFor(h.id)===6));
  ok('priced by power, each different, between Elowen and Thaddeus',H.every(h=>h.price>HB.elowen.price&&h.price<HB.thaddeus.price&&h.pow>HB.elowen.pow&&h.pow<HB.thaddeus.pow)&&new Set(H.map(h=>h.price)).size===6
    &&H.slice().sort((a,b)=>a.pow-b.pow).every((h,i,A)=>!i||h.price>A[i-1].price),H.map(h=>h.price+'/'+h.pow).join(' '));
  ok('each has an aura, a talent, a thumbnail and its own model (with a staff to animate)',H.every(h=>AURA[h.id]&&AURA[h.id].d&&h.tn&&h.td&&hthumbs[h.id]&&hthumbs[h.id].length>500)&&H.every(h=>{const m=heroModel(h.id);let n=0;m.traverse(o=>{if(o.isMesh)n++;});return n>40;}));
  ok('their element shows on the cards (a coloured chip) and in their colour',H.every(h=>ehChip(h).includes(EH.nm[h.elem])&&heroCol(h)===EH.css[h.elem]));
  ok('other heroes are unchanged (no element, no chip)',HEROES.filter(h=>!h.elem).every(h=>!ehChip(h))&&HEROES.length===21);
  /* ---- Element Mastery ---- */
  ok('Element Mastery: their own element\'s scrolls deal +30% and recharge 10% faster',IDS.every(id=>{const t={hero:id},k=Object.keys(SPELLS_S).find(q=>SPELL_EL[q]===ELS[id]),k2=Object.keys(SPELLS_S).find(q=>SPELL_EL[q]&&SPELL_EL[q]!==ELS[id]);
    return k&&near(tsd(t,k),1.3)&&near(tsc(t,k),.9)&&tsd(t,k2)===1&&tsc(t,k2)===1;}));
  ok('and not for other heroes (Aevorian keeps his own)',tsd({hero:'elowen'},'catchflame')===1&&tsd({hero:'aevorian'},'catchflame')===1);
  {play('ignatia');meta.spells=meta.spells||{};meta.spells.catchflame=meta.spells.catchflame||{lvl:1};meta.spells.comet=meta.spells.comet||{lvl:1};const F=knot(2),s=heroStats();
    heroU.scd={};fireScroll(heroU,'catchflame',s,F);const cdF=heroU.scd.catchflame,S1=SPELLS_S.catchflame,lv=meta.spells.catchflame.lvl||1,exp=Math.max(S1.minCd||0,S1.cd*Math.pow(.95,lv-1)*MM.spell*.9);
    ok('Ignatia\'s Catch Flame comes back 10% sooner',near(cdF,exp,.001),cdF.toFixed(2)+' vs '+exp.toFixed(2));}
  /* ---- their bolts ---- */
  const bolt=id=>{EH.dbg=[];log=[];play(id);const F=knot(4);wrapHurt();let s;try{s=fire(F[0]);}finally{hurt=H0;}return{F,s,b:EH.dbg.filter(d=>d.ev==='bolt')};};
  ok('every specialist shoots an orb of their element (not the violet bolt)',IDS.every(id=>{play(id);const F=knot(1),n=projs.length;heroFire('staff',F[0],heroStats());const p=projs[projs.length-1];const r=p&&p.kind==='eh_'+ELS[id];clean();return r;}));
  for(const id of IDS){const el=ELS[id],{F,s,b}=bolt(id),d=b[0];
    ok(HB[id].n+': the bolt hits as '+el,d&&log.some(h=>h.e===F[0]&&h.el===el&&!h.dot&&near(h.amt,s.dmg)),d&&log.length);}
  {const {F,s,b}=bolt('ignatia');ok('fire: the bolt sets the foe burning (25% of the hit a second for 2.5s)',b[0].burn&&F[0].burn&&near(F[0].burn.dps,s.dmg*EH.burn,1e-6)&&F[0].burn.t>2);}
  {const {F,b}=bolt('isolde');ok('ice: the bolt chills it 30% slower for 1.5s',b[0].chill&&F[0].slow>=.3&&F[0].slowT>=1.4);}
  {const {F,s,b}=bolt('vesper');ok('lightning: the bolt chains to 2 more foes than a mage\'s',b[0].chain.length===Math.min(3,s.chain+EH.chain),b[0].chain.length+' of '+(s.chain+EH.chain));}
  {const {F,b}=bolt('corvin');ok('dark: the bolt withers the foe (30% a second for 3s)',b[0].wither&&F[0].wither&&F[0].wither.t>2.5&&F[0].wither.o.el==='dark');}
  {EH.dbg=[];play('sylvara');const F=knot(1);for(let i=0;i<40;i++){F[0].stunT=0;if(F[0].rsv)F[0].rsv=0;fire(F[0],1);}   /* the clock does not run here: free the foe before each bolt */
    const b=EH.dbg.filter(d=>d.ev==='bolt'),r=b.filter(d=>d.root).length;
    ok('nature: about one bolt in five roots the foe',b.length===40&&r>=2&&r<=18,r+' of '+b.length);}
  {EH.dbg=[];log=[];play('seraphine');const F=knot(3);wrapHurt();let s;try{s=fire(F[0],12);}finally{hurt=H0;}const b=EH.dbg.filter(d=>d.ev==='bolt'),fl=b.map((d,i)=>d.flare?i+1:0).filter(Boolean);
    ok('light: every 6th bolt flares, 100% to foes within 0.9',fl.length===2&&fl.every(n=>n%6===0)&&b.filter(d=>d.flare).every(d=>d.flare.length>0&&d.flare.every(e=>Math.hypot(e.x-d.e.x,e.z-d.e.z)<EH.flareR)),fl.join());}
  {play('elowen');const F=knot(1);heroFire('staff',F[0],heroStats());const p=projs[projs.length-1];ok('Elowen still shoots her violet bolt',p&&p.kind==='bolt');clean();}
  {const e0=errs;for(const id of IDS){play(id);const F=knot(5);for(let i=0;i<30;i++){update(.05);updFx(.05);}}ok('each specialist fights in the real game loop without errors',errs===e0,(errs-e0)+' errors');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;EH.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);if(heroU)despawnHero();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
