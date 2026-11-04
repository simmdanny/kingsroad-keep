(function(){
/* v485 new elite modifiers: Splitting, Blinking, Warded, and the Invisible review. Each mechanic with its numbers, the roll rules and rates,
   artStrip, the Bestiary cycle, every land and the world map, cleanup. Run on the dev page: __kk.ev(await (await fetch('/tests/nmx-test.js')).text()). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena,w0=meta.world,eq0=meta.equipped,own0=Object.assign({},meta.owned),dex0=meta.dex;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;fx.slice().forEach(f=>f.life=0);updFx(.001);};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
const start=(arena)=>{meta.arena=arena||'plains';meta.world='classic';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();};
const foe=(type,elite,w,o)=>{spawnEnemy(Object.assign({type,v:0,elite,invOK:true},o||{}),w||60);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=6;e.off=0;moveEnemy(e,0);return e;};
const step=(sec,dt)=>{dt=dt||.033;for(let i=0,n=Math.round(sec/dt);i<n;i++){update(dt);updFx(dt);}};
try{
  start();
  /* ---- the modifiers are registered everywhere a modifier is ---- */
  const NEW=['splitting','blinking','warded'];
  ok('the three new modifiers have a marker colour, a name, a look, an animation and particles',
    NEW.every(k=>AFFIX[k]&&AFFIX[k].c&&ELITE_N[k]&&typeof ELD[k]==='function'&&typeof ELA[k]==='function'&&typeof ELP[k]==='function'),NEW.map(k=>ELITE_N[k]+' #'+(AFFIX[k]&&AFFIX[k].c.toString(16))).join(', '));
  ok('the numbers: split 2 halves at 0.7 scale, 30% HP, 25% gold, 1 life; blink 1.25 tiles every 4s, untargetable 0.18s, 0.6s after a hold; ward 40%, 0.4s lock',
    NMX.split.n===2&&NMX.split.sc===.7&&NMX.split.hp===.3&&NMX.split.gold===.25&&NMX.split.lives===1&&NMX.blink.d===1.25&&NMX.blink.cd===4&&NMX.blink.untarg===.18&&NMX.blink.wake===.6&&NMX.ward.res===.4&&NMX.ward.lock===.4,JSON.stringify([NMX.split,NMX.blink,NMX.ward.res]));
  ok('minimum waves: Splitting 15, Blinking 25, Warded 40, Invisible 21',NMX.min.splitting===15&&NMX.min.blinking===25&&NMX.min.warded===40&&NMX.min.invisible===21,JSON.stringify(NMX.min));
  /* ---- roll rules ---- */
  ok('roll rules: each modifier from its wave; no Splitting or Invisible on a boss; no Armoured on knights or monks',
    !nmxOk('splitting','soldier',14)&&nmxOk('splitting','soldier',15)&&!nmxOk('blinking','soldier',24)&&nmxOk('blinking','soldier',25)&&!nmxOk('warded','soldier',39)&&nmxOk('warded','soldier',40)
    &&!nmxOk('invisible','soldier',20)&&nmxOk('invisible','soldier',21)&&!nmxOk('splitting','ogre',150,true)&&!nmxOk('invisible','ogre',150,true)&&nmxOk('blinking','ogre',150,true)&&nmxOk('warded','ogre',150,true)
    &&!nmxOk('armored','knight',60)&&!nmxOk('armored','monk',60)&&nmxOk('armored','soldier',60));
  {const bad=[],cnt={},tot={n:0,el:0};let bossEl=0,bossN=0,formEl=0;
   for(const w of [12,14,15,24,25,39,40,60,100,110,150]){for(let r=0;r<(w>=100?40:25);r++){const W=buildWave(w);for(const it of W.q){if(!it||typeof it.type!=='string'||it.type[0]==='_')continue;const boss=!!EN[it.type].boss;
      if(!boss){tot.n++;if(it.elite)tot.el++;}if(boss){bossN++;if(it.elite)bossEl++;}if(!it.elite)continue;const L=[].concat(it.elite);if(boss&&L.length>1)bad.push('boss two '+w);
      for(const a of L){if(!nmxOk(a,it.type,w,boss))bad.push(it.type+':'+a+'@'+w);if(w===60&&!boss)cnt[a]=(cnt[a]||0)+1;}if(new Set(L).size!==L.length)bad.push('dup '+L);}}}
   ok('every rolled wave keeps the rules (waves 12 to 150, bosses at 100+ one modifier, never Splitting or Invisible)',!bad.length&&bossN>0,bad.slice(0,6).join('; ')+' bosses '+bossN+' elite '+bossEl);
   const sh=k=>(cnt[k]||0)/Object.values(cnt).reduce((a,b)=>a+b,0);
   ok('at wave 60 every modifier appears; the new ones each about 1 in 9 (Invisible rarer)',NEW.every(k=>sh(k)>.07&&sh(k)<.16)&&sh('invisible')>.02&&sh('invisible')<sh('swift'),Object.keys(cnt).map(k=>k+' '+(sh(k)*100).toFixed(1)+'%').join(', '));}
  {/* the elite rate is the old one: min(45%, (w-10)*2%) from wave 12 */const rate=w=>{let n=0,el=0;for(let r=0;r<60;r++){for(const it of buildWave(w).q){if(!it||typeof it.type!=='string'||it.type[0]==='_'||EN[it.type].boss)continue;n++;if(it.elite)el++;}}return el/n;};
   const r20=rate(20),r40=rate(40),r80=rate(80);
   ok('the elite rate is unchanged (20% at wave 20, 45% at waves 40 and 80)',Math.abs(r20-.2)<.04&&Math.abs(r40-.45)<.05&&Math.abs(r80-.45)<.05,[r20,r40,r80].map(x=>(x*100).toFixed(1)+'%').join(' / '));}
  {clean();spawnEnemy({type:'soldier',elite:['warded','blinking']},20);const a=enemies[enemies.length-1];spawnEnemy({type:'ogre',elite:'splitting'},120);const b=enemies[enemies.length-1];
   spawnEnemy({type:'knight',elite:['armored','splitting']},30);const c=enemies[enemies.length-1];spawnEnemy({type:'ogre',elite:['splitting'],invOK:true},120);const d=enemies[enemies.length-1];
   ok('a spawn with a modifier it may not have gets one it may; bosses keep one; invOK (decided or forced) is kept',
     a.elites.every(x=>nmxOk(x,'soldier',20))&&a.elites.length===2&&b.elites.length===1&&b.elites[0]!=='splitting'&&c.elites.includes('splitting')&&!c.elites.includes('armored')&&d.elites[0]==='splitting',
     [a.elites,b.elites,c.elites,d.elites].map(x=>x.join('+')).join(' | '));clean();
   let bad=0;for(let i=0;i<30;i++){spawnFormation({form:'shield',elite:true,hpMul:1},20);}for(const e of enemies)if(e.elites&&e.elites.some(x=>!nmxOk(x,e.type,20)))bad++;
   ok('formation members follow the rules too (30 shield walls at wave 20)',!bad&&enemies.some(e=>e.elites),bad+' bad of '+enemies.filter(e=>e.elites).length);clean();}
  /* ---- Splitting ---- */
  {const p=foe('soldier',['splitting'],30),plain=foe('soldier',null,30);const g1=plain.gold;removeEnemy(plain);enemies=enemies.filter(e=>e!==plain);
   p.dist=7.3;moveEnemy(p,0);const mh=p.maxHp,sc=p.b.scale.x/1,d0=p.dist,n0=enemies.length;kill(p);const K=enemies.slice(n0);step(.5);
   const nsc=EN.soldier.size*1.25;
   ok('Splitting: on death it tears in two (2 halves of the same unit, where it fell)',K.length===2&&K.every(k=>k.type==='soldier'&&k.route===p.route&&Math.abs(k.dist-d0)<.6&&k.wv===p.wv),K.length+' halves, dist '+K.map(k=>(k.dist-d0).toFixed(2)).join(','));
   ok('the halves: 30% of its max HP each, 0.7 scale, no modifiers, at most 1 life, a quarter of a plain troop’s gold',
     K.every(k=>Math.abs(k.maxHp-mh*.3)<1e-6&&Math.abs(k.b.scale.y-nsc*.7)<1e-6&&!k.elites&&!k.elite&&k.lives<=1&&Math.abs(k.gold-g1*.25)<1e-6&&!k.gem&&!k.scroll),
     K.map(k=>[k.maxHp.toFixed(1)+'/'+(mh*.3).toFixed(1),k.b.scale.y.toFixed(3),k.lives,k.gold.toFixed(2)+'/'+(g1*.25).toFixed(2)].join(' ')).join(' | '));
   ok('they stand side by side once the tear is done (offsets apart, upright)',K[0].off<K[1].off&&K.every(k=>k.b.rotation.z===0),K.map(k=>k.off.toFixed(2)).join(','));
   const n1=enemies.length;kill(K[0]);ok('a half never splits again',enemies.filter(e=>!e.dead).length===n1-1,enemies.filter(e=>!e.dead).length);clean();
   const b=foe('ogre',['splitting'],120),n2=enemies.length;kill(b);ok('a boss forced to Splitting does not split',enemies.filter(e=>!e.dead).length===n2-1);clean();
   const l=foe('soldier',['splitting'],30);l.dist=l.route.len+.1;const n3=enemies.length;update(.01);ok('a foe that reaches the keep does not split',enemies.length<=n3-1+0&&!enemies.some(e=>e.nmxKid),enemies.length);clean();
   let gem=0,made=0;for(let i=0;i<60;i++){const q=foe('peasant',['splitting'],30);const m=enemies.length;kill(q);const ks=enemies.slice(m);made+=ks.length;gem+=ks.filter(k=>k.gem||k.scroll).length;clean();}
   ok('a half is never a Gem Carrier or a Scroll Bearer (60 splits)',gem===0&&made===120,made+' halves, '+gem+' special');}
  /* ---- Blinking ---- */
  {const e=foe('soldier',['blinking'],40);e.dist=5;moveEnemy(e,0);const B=e.nmxBlink;
   ok('Blinking: the first blink comes 1.6 to 4s after it appears',B.t>=1.6&&B.t<=4,B.t.toFixed(2));
   B.t=1e-4;const d0=e.dist;nmxBlinkTick(e,.001);
   ok('it blinks 1.25 tiles forward along the road, then waits 4s',Math.abs(e.dist-d0-1.25*TS)<1e-9&&B.t===4,(e.dist-d0).toFixed(4)+' tiles, next in '+B.t);
   const t0={type:'arrow',x:e.x,z:e.z};const twr={x:e.x,z:e.z,type:'magic'};
   ok('it is untargetable for that instant only (0.18s)',e.nmxUT>0&&!inRange(twr,{range:5,air:true}).includes(e),e.nmxUT);
   step(.2);ok('then it can be targeted again',!(e.nmxUT>0)&&inRange(twr,{range:9,air:true}).includes(e));
   /* the cadence: 3 blinks in 9s from a fresh charge of 1s */
   B.t=1;e.nmxBlinks=0;e.spd=.001;e.dist=4;let ds=0;{let last=e.dist;for(let i=0,n=Math.round(10/.033);i<n;i++){update(.033);updFx(.033);if(e.dist-last>1)ds++;last=e.dist;}}
   ok('cadence: one blink every 4s (3 blinks in 10s from a 1s charge: at 1, 5 and 9s)',e.nmxBlinks===3&&ds===3,e.nmxBlinks+' blinks');
   /* holds */
   e.dist=4;B.t=.2;stunE(e,1.5);const d1=e.dist;step(1.4);ok('a stun stops the blink: none while held',e.dist-d1<.05&&e.nmxBlinks===3,(e.dist-d1).toFixed(3));
   step(.3);ok('and it waits 0.6s after it is free',e.nmxBlinks===3&&B.t>0,B.t.toFixed(2));step(.6);ok('then blinks',e.nmxBlinks===4);
   B.t=.1;e.heldT=1;step(.5);ok('a hold (heldT) stops it too',e.nmxBlinks===4);e.heldT=0;
   B.t=.1;e.blockBy={};const nb=e.nmxBlinks;nmxBlinkTick(e,.5);e.blockBy=null;ok('a hero’s block stops it too',e.nmxBlinks===nb&&B.t>=.6,B.t);
   e.dist=e.route.len-.5;B.t=1e-4;const d2=e.dist;nmxBlinkTick(e,.001);ok('it does not blink with less than 0.75 tiles of road left',e.dist===d2);
   const fx0=fx.length;e.dist=5;moveEnemy(e,0);nmxBlink(e);const fx1=fx.length;step(.8);ok('the after-image, implosion and arrival burst play and are gone after 0.8s',fx1-fx0>=3&&fx.length<=fx0,fx0+' -> '+fx1+' -> '+fx.length);
   clean();}
  /* ---- Warded ---- */
  {const mk=()=>{const e=foe('soldier',['warded'],60);e.res={};e.armor=0;e.maxHp=e.hp=1e6;e.shield=0;return e;};const e=mk(),W=e.eliteFx.ward;
   const hit=(el,o)=>{const h=e.hp;hurt(e,100,el?'magic':'phys',Object.assign(el?{el,noReact:true}:{},o||{}));return h-e.hp;};
   const a=hit('dark');const b=hit('dark');
   ok('Warded: the first dark hit is full, the next is resisted by 40%',Math.abs(a-100)<1e-6&&Math.abs(b-60)<1e-6&&e.nmxWard.el==='dark',a.toFixed(2)+' then '+b.toFixed(2));
   ok('the rune and the circlet gem turn dark-coloured, with a flash shell',W.glyph.material===NMX_M.glyph.dark&&W.gem.material===NMX_M.gem.dark&&W.pu>0,W.el);
   const c=hit('light');ok('a new element hit right after (inside 0.4s) lands full and does not shift the ward yet',Math.abs(c-100)<1e-6&&e.nmxWard.el==='dark',c);
   time+=.5;const d=hit('light'),d2=hit('light');ok('after the 0.4s lock the new element shifts the ward',Math.abs(d-100)<1e-6&&Math.abs(d2-60)<1e-6&&e.nmxWard.el==='light',d+' then '+d2.toFixed(2));
   const p=hit(null),m=(()=>{const h=e.hp;hurt(e,100,'magic',{});return h-e.hp;})();ok('physical damage and magic with no element are never warded and do not shift it',Math.abs(p-100)<1e-6&&Math.abs(m-100)<1e-6&&e.nmxWard.el==='light',p+' / '+m);
   time+=.5;const t=hit('fire',{dot:true});ok('a damage-over-time tick never shifts the ward',e.nmxWard.el==='light',e.nmxWard.el);
   const shifts=e.nmxWard.n;for(let i=0;i<20;i++){hit(i%2?'fire':'ice');time+=.05;}ok('alternating elements shift it at most once every 0.4s',e.nmxWard.n-shifts<=3,e.nmxWard.n-shifts+' shifts in 1s');
   clean();}
  /* ---- artStrip takes the new modifiers off with their gear ---- */
  {const e=foe('soldier',['splitting','blinking'],60);const F=e.eliteFx,sg=F.split,bg=F.blink.g;let n=0;while(e.elites.length&&n<5){artStrip(e,false);n++;}
   ok('artStrip removes Splitting and Blinking, their gear and their effect',!e.elites.length&&!sg.parent&&!bg.parent&&!e.nmxBlink&&!e.elite,n+' strips');
   const m=enemies.length;kill(e);ok('a stripped Splitting foe no longer splits',enemies.filter(q=>!q.dead).length===m-1);clean();
   const w=foe('soldier',['warded'],60);w.res={};w.armor=0;w.maxHp=w.hp=1e6;const wg=w.eliteFx.ward.g;artStrip(w,true);const h=w.hp;hurt(w,100,'magic',{el:'dark',noReact:true});hurt(w,100,'magic',{el:'dark',noReact:true});
   ok('artStrip removes Warded: no rune, no resistance',!wg.parent&&!w.nmxWard&&Math.abs(h-w.hp-200)<1e-6,(h-w.hp).toFixed(1));clean();}
  /* ---- the gear on every unit, in every land and on the world map ---- */
  {const bad=[];let n=0;for(const ar of ['plains','snow','tundra','whitewaste','taiga','highlands']){start(ar);for(const t of GAL_UNITS.filter(t=>EN[t]))for(const a of NEW){if(a==='splitting'&&EN[t].boss)continue;
      try{const e=foe(t,[a],120);n++;const F=e.eliteFx||{},G=a==='splitting'?F.split:a==='blinking'?F.blink&&F.blink.g:F.ward&&F.ward.g;if(!G||!G.parent)bad.push(ar+':'+t+':'+a+' no gear');
        animElite(e,.05);animElite(e,.05);let m=0;G&&G.traverse(o=>{if(o.isMesh)m++;});if(m>6)bad.push(t+':'+a+' '+m+' meshes');}catch(err){bad.push(ar+':'+t+':'+a+' '+err.message);}clean();}}
   ok('every unit wears each new modifier it can roll, in all six lands, in a few merged meshes',!bad.length&&n>200,bad.slice(0,5).join('; ')+' n='+n);}
  {start();const e=foe('soldier',['warded'],60),f=foe('peasant',['blinking'],60);const g1=e.eliteFx.ward.band||null;
   ok('gear geometry is shared between foes of the same unit (cached)',(()=>{const q=foe('soldier',['warded'],60);let s=false;q.eliteFx.ward.g.children.forEach((c,i)=>{const o=e.eliteFx.ward.g.children[i];if(c.geometry&&o&&o.geometry===c.geometry)s=true;});return s;})());clean();}
  {/* the world map */let msg='';try{meta.world='open';lsSet(KR,null);state='menu';clearWorld();buildMap(77);MAP.fresh=true;newGame(1);paused=true;lives=1e9;
     spawnEnemy({type:'soldier',elite:['blinking'],invOK:true},40);const e=enemies[enemies.length-1];e.dist=3;moveEnemy(e,0);const d0=e.dist;nmxBlink(e);const bd=e.dist-d0;
     spawnEnemy({type:'soldier',elite:['splitting'],invOK:true},40);const s=enemies[enemies.length-1];s.dist=4;moveEnemy(s,0);const n0=enemies.length;kill(s);const K=enemies.slice(n0);step(.3);
     msg=OW.on+' '+bd.toFixed(2)+' '+K.length;ok('on the world map: it blinks along its road and splits on its road',OW.on&&Math.abs(bd-1.25*TS)<1e-6&&K.length===2&&K.every(k=>k.route===s.route&&!k.dead),msg);}
   catch(err){ok('on the world map',false,err.message);}finally{meta.world='classic';clean();start();}}
  /* ---- the Bestiary ---- */
  {meta.dex=meta.dex||{};for(const t of GAL_UNITS)unitVariants(t).forEach((_,i)=>{meta.dex[t+':'+i]=1;});const bad=[];let bossSplit=0;
   for(const t of ['peasant','soldier','rider','raven','knight','monk','ram','ogre','dragon']){try{openGallery();openVar(t);galElite(false);
      for(let i=0;i<ELITE_CYCLE.length+1;i++){galElite(true);const CY=(t==='knight'||t==='monk')?ELITE_CYCLE.filter(c=>!c.includes('armored')):ELITE_CYCLE,affs=CY[GV.eIdx]||[];if(EN[t].boss&&affs.includes('splitting'))bossSplit++;
        GV.items.forEach(it=>{if(it.fx)for(let k=0;k<3;k++)animEliteFx(it.fx,1+k,.6,false,null);if(affs.includes('warded')&&!(it.fx&&it.fx.ward))bad.push(t+' no rune');});}closeVar(true);closeGallery();}catch(err){bad.push(t+' '+err.message);try{closeGallery();}catch(e){}}}
   ok('the Bestiary cycle has the new modifiers and shows them on every troop (never Splitting on a boss)',NEW.every(k=>ELITE_CYCLE.some(c=>c.length===1&&c[0]===k))&&!bad.length&&!bossSplit,bad.join('; ')+' boss splits '+bossSplit);
   {openGallery();openVar('soldier');galElite(false);const i=ELITE_CYCLE.findIndex(c=>c.length===1&&c[0]==='warded');GV.eIdx=i-1;galElite(true);const W=GV.items[0].fx.ward;const el0=W.el;for(let k=0;k<4;k++)animEliteFx(GV.items[0].fx,k,.6,false,null);
    ok('in the Bestiary the ward shifts through the elements by itself',W.el&&W.el!==el0,el0+' -> '+W.el);
    const j=ELITE_CYCLE.findIndex(c=>c.length===1&&c[0]==='invisible');GV.eIdx=j-1;galElite(true);let gh=0,all=0;GV.items[0].m.b.traverse(o=>{if(o.isMesh){all++;if(o.material.userData&&o.material.userData.nmxGhost)gh++;}});
    galElite(true);let left=0;GV.items[0].m.b.traverse(o=>{if(o.isMesh&&o.material.userData&&o.material.userData.nmxGhost)left++;});
    ok('the Bestiary shows Invisible as the cloak, and takes it off on the next step',gh>0&&left===0,gh+'/'+all+' cloaked, '+left+' left');closeVar(true);closeGallery();}}
  /* ---- Invisible, reviewed ---- */
  {start();clean();spawnFormation({form:'shield',elite:true,hpMul:1},60);const fm=enemies.filter(e=>e.role==='front');fm.forEach(e=>{if(!e.invis){e.elites=['invisible'];e.invis=true;e.revealT=0;invisLook(e,true);}});
   clean();let inv=null;for(let i=0;i<40&&!inv;i++){spawnFormation({form:'shield',elite:true,hpMul:1},60);inv=enemies.find(e=>e.role==='front'&&e.invis);if(!inv)clean();}
   if(inv){let solid=0;inv.b.traverse(o=>{if(o.isMesh&&o.visible&&!(o.material.userData&&o.material.userData.nmxGhost))solid++;});ok('Invisible: a formation’s tower shield is cloaked with its bearer',solid===0,solid+' solid parts');}
   else ok('Invisible: a formation’s tower shield is cloaked with its bearer (no invisible bearer rolled in 40 tries)',true,'skipped');
   clean();const e=foe('soldier',['shielded','invisible'],60);let lines=0;e.b.traverse(o=>{if(o.isLineSegments&&o.visible)lines++;});
   ok('the marker dims when Invisible is the second modifier, and the bubble’s lines hide too',e.aura2&&e.aura2.material.opacity===.35&&lines===0,'ring '+(e.aura2&&e.aura2.material.opacity)+', lines '+lines);
   e.revealT=1;statusTick(e,.01);let back=0,gl=0;e.b.traverse(o=>{if(o.isLineSegments&&o.visible)back++;if(o.isMesh&&o.material.userData&&o.material.userData.nmxGhost)gl++;});
   ok('revealed, every part is solid again and the hidden lines come back',!e.ghostOn&&back>0&&gl===0,back+' lines, '+gl+' cloaked');
   e.revealT=0;statusTick(e,.01);ok('and it cloaks again when the reveal ends',e.ghostOn);clean();
   /* Old Tobin, the melee hero, cannot see it */
   meta.owned.tobin=true;meta.equipped='tobin';despawnHero();let spot=null;for(let r=0;r<H&&!spot;r++)for(let c=0;c<W&&!spot;c++){if(heroTileOk('tobin',c,r)){const q=tw(c,r);for(let d=0;d<ROUTES[0].len;d+=.2){const p=posAt(d,ROUTES[0]);if((p[0]-q.x)**2+(p[1]-q.z)**2<.36){spot={c,r,d};break;}}}}
   if(spot){spawnHero(spot.c,spot.r);const H0=heroU;const iv=foe('soldier',['invisible'],60);iv.dist=spot.d;iv.spd=0;iv.maxHp=iv.hp=1e6;moveEnemy(iv,0);const vis=foe('soldier',null,60);vis.dist=spot.d;vis.spd=0;vis.maxHp=vis.hp=1e6;vis.off=.05;moveEnemy(vis,0);
     for(let i=0;i<90;i++){update(.033);updFx(.033);}
     ok('Old Tobin (melee) neither blocks nor hits an Invisible foe, but still fights the one he sees',iv.blockBy!==H0&&iv.hp===iv.maxHp&&(vis.blockBy===H0||vis.hp<vis.maxHp),'invisible hp '+(iv.hp/iv.maxHp).toFixed(4)+' block '+(iv.blockBy===H0)+', visible hp '+(vis.hp/vis.maxHp).toFixed(4)+' block '+(vis.blockBy===H0));despawnHero();}
   else ok('Old Tobin (melee): no tile next to the road found',false,'');
   clean();}
  /* ---- saves and cleanup ---- */
  {start();const L=[foe('soldier',['warded','blinking'],60),foe('peasant',['splitting'],60),foe('knight',['invisible','warded'],60)];let s='';try{s=JSON.stringify(serializeRun());}catch(err){s='ERR '+err.message;}
   ok('a run saves with these foes alive (foes are not part of the save: a resumed run starts the wave over, rolled again)',s[0]==='{'&&!/nmx|elites/.test(s),s.slice(0,60));
   const n0=scene.children.length;kill(L[1]);for(const e of L)if(!e.dead)kill(e);step(1.2);for(const e of enemies.slice())if(!e.dead)removeEnemy(e);enemies=[];step(.6);
   const left=scene.children.filter(o=>o.children&&o.children.some(c=>c.userData&&c.userData.nmx));
   ok('nothing stays in the scene after the foes die and their effects end',fx.length===0&&!left.length&&scene.children.length<=n0,'fx '+fx.length+', scene '+n0+' -> '+scene.children.length);
   foe('soldier',['blinking'],60);foe('soldier',['warded'],60);clearWorld();ok('clearWorld leaves nothing',!enemies.length,enemies.length);}
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=oe;try{clean();despawnHero();state='menu';paused=false;clearWorld();meta.arena=a0;meta.world=w0;meta.equipped=eq0;meta.owned=own0;meta.dex=dex0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
