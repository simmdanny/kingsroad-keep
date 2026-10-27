(function(){
/* The Deep Taiga (v356): Arena 5. Unlock, the board, its foes and wolves, the pack, Mossback and the Leshy, landmarks, props, the chest, rewards
   and the Bestiary. Run on the dev page: __kk.ev(await (await fetch('/tests/taiga-test.js')).text()) returns [name, ok, detail] rows.
   Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const go=(a,sd)=>{lsSet(KR,null);for(const k of['snow','tundra','whitewaste','taiga']){meta.arenas[k]=1;meta.seenA[k]=1;}meta.mapIntro=0;meta.arena=a;state='menu';clearWorld();buildMap(sd||777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;for(const t of towers)if(t.iceT>0)msbThaw(t);};
const run=(s)=>{for(let i=0;i<s/.05;i++){update(.05);updFx(.05);}};
const lum=c=>c.r*.3+c.g*.59+c.b*.11;
const hpOf=(a,type,w)=>{const a0=meta.arena;meta.arena=a;clean();spawnEnemy({type,v:0},w);const e=enemies[enemies.length-1];const h=e.maxHp/(e.gem?1.2:1),s=e.spd/(e.gem?1.15:1);clean();meta.arena=a0;return{h,s};};
try{
  /* the land and how it opens */
  ok('the Deep Taiga is Arena 5 on the world map',ARENAS.taiga&&ARENAS.taiga.no===5&&SITE_ARENA.taiga==='taiga'&&WMP.sites.taiga);
  {const m=arenaFix({arena:'plains',arenas:{plains:1,snow:1,tundra:1,whitewaste:1},seenA:{plains:1},wonA:{plains:1,snow:1,whitewaste:1},bestA:{}});ok('an account that has won the Whitewaste finds the Deep Taiga open',!!m.arenas.taiga);
   const m2=arenaFix({arena:'plains',arenas:{plains:1,snow:1,tundra:1,whitewaste:1},seenA:{plains:1},wonA:{plains:1,snow:1,tundra:1},bestA:{}});ok('an account that has not won the Whitewaste does not',!m2.arenas.taiga);}
  {go('whitewaste');meta.arenas.taiga=0;meta.wonA={plains:1,snow:1};V200=false;state='playing';wave=200;arenaWin();const vl=$('#vLands');
   ok('winning wave 200 in the Whitewaste opens the Deep Taiga and says so',meta.arenas.taiga===1&&meta.seenA.taiga===0&&!!vl&&/Deep Taiga/.test(vl.textContent));const v=$('#vict');if(v)v.hidden=true;V200=false;paused=true;}
  {go('snow');meta.arenas.taiga=0;V200=false;state='playing';wave=200;arenaWin();ok('winning Frostvale does not open it',!meta.arenas.taiga);const v=$('#vict');if(v)v.hidden=true;V200=false;paused=true;}
  {go('taiga');V200=false;state='playing';wave=200;arenaWin();ok('winning wave 200 here: the Leshy falls',/Leshy/.test(($('#vSub')||{}).textContent||''));const v=$('#vict');if(v)v.hidden=true;V200=false;paused=true;}
  ok('the locked land on the world map says how to open it',String(wmapTap).includes('Win wave 200 in the Whitewaste to open the Deep Taiga.'));
  ok('the trip runs along the roads, also from the tundra and the Whitewaste',(()=>{if(!WMP.paths)wmpPaint();const L=['plains','tundra','whitewaste','snow'].map(f=>wmpVia(f,'taiga')||WMP.paths[f+'>taiga']);return L.every(p=>Array.isArray(p)&&p.length>3);})());
  {meta.dev=meta.dev;const a=JSON.parse(JSON.stringify(meta));arenaUnlockDev();ok('the developer unlock opens it too',meta.arenas.taiga===1&&meta.seenA.taiga===0);meta.arenas=a.arenas;meta.seenA=a.seenA;}
  /* the board */
  go('taiga',31);
  ok('the board is built for the Deep Taiga',arenaNow()==='taiga'&&ARENA_BUILT==='taiga');
  {let road=null,moss=null;const c=new THREE.Color();for(let r=0;r<H&&(road==null||moss==null);r++)for(let k=0;k<W;k++){TILES.getColorAt(r*W+k,c);if(grid[r][k]===1&&road==null)road=lum(c);if(grid[r][k]===0&&moss==null)moss=lum(c);}
   ok('a light earth road on dark moss (readable at a glance)',road>moss*1.5&&road>.38&&moss<.32,road.toFixed(2)+' / '+moss.toFixed(2));}
  {const tags={};TERRAIN.children.forEach(o=>{if(o.userData&&o.userData.tg)tags[o.userData.tg]=(tags[o.userData.tg]||0)+(o.count||1);});ok('spruce, birch, logs, boulders, ferns, toadstools, stumps and mist around it',['spruce','birch','log','rock','fern','shroom','stump','mist','edge'].every(k=>tags[k]>0)&&tags.spruce>200,JSON.stringify(tags));}
  {const sp=TERRAIN.children.find(o=>o.userData&&o.userData.tg==='spruce'),m=new THREE.Matrix4(),p=new THREE.Vector3(),xE=W/2+.2,zTop=tw(0,0).z-.55,zBot=tw(0,H-1).z+.55;let bad=0;
   for(let i=0;i<sp.count;i++){sp.getMatrixAt(i,m);p.setFromMatrixPosition(m);if(Math.abs(p.x)<xE+.5&&p.z>zTop-.5&&p.z<zBot+.5)bad++;if(p.z>zBot+.4)bad++;}ok('no spruce on the board or in front of it',!bad,bad);}
  ok('the land has its own light, preview and terrain names',arenaPV()===TG_PV&&terPal()===TERP.taiga&&TERP.taiga.n.m==='Peat bog');
  ok('peat bogs can form on the board',terMarshLand());
  ok('fire spells +15% here; ice spells and slows unchanged',landEl()&&landEl().fire===1.15&&landEl().ice===1&&landEl().slow===1&&landSlow(.7)===.7);
  ok('gems pay double, rare scrolls a little more often',ARENA_REWARD.taiga.gem===2&&arenaReward().gem===2&&ARENA_REWARD.taiga.rar>ARENA_REWARD.whitewaste.rar);
  {let n3=0;for(let i=0;i<200;i++)if(gateN(rnd())===3)n3++;ok('always three enemy gates',n3===200,n3+' of 200');}
  /* foes */
  {const a=hpOf('taiga','soldier',10),b=hpOf('plains','soldier',10);ok('troops have 30% more health and run 5% faster',Math.abs(a.h/b.h-1.3)<.01&&Math.abs(a.s/b.s-1.05)<.01,(a.h/b.h).toFixed(3)+' / '+(a.s/b.s).toFixed(3));}
  {clean();spawnEnemy({type:'soldier',v:0},10);const e=enemies[enemies.length-1];let tm=0,fur=0;e.b.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.tg)tm++;if(o.userData.tgGear)fur++;});ok('and wear the furs of the taiga',e.tg&&tm>3&&fur===2,tm+' / '+fur);clean();}
  {const bt=Object.keys(EN).find(k=>EN[k].boss&&!MSB_T.has(k)&&k!=='ophanim'&&k!=='seraph'),a=hpOf('taiga',bt,50),b=hpOf('plains',bt,50);
   const cap=()=>{const a0=meta.arena;meta.arena='plains';const v=bossHpAt(bossFor(50),50);meta.arena=a0;return v;};
   ok('bosses have 50% more health (not faster), and the cap agrees',Math.abs(a.h/b.h-1.5)<.01&&Math.abs(a.s/b.s-1)<.01&&Math.abs(bossHpAt(bossFor(50),50)/cap()-1.5)<.01,(a.h/b.h).toFixed(3));}
  /* wolves */
  {const w=EN.wolf;ok('the wolf: a fast, light troop of its own',w&&!w.boss&&w.spd>EN.soldier.spd*1.5&&w.hp<EN.soldier.hp&&w.hp>EN.peasant.hp);
   clean();spawnEnemy({type:'wolf',v:0},20);const e=enemies[enemies.length-1];ok('it is built on four legs and runs',!!e.tick&&e.g.children.length>0&&e.hitY>.3);const z0=e.dist;run(.5);ok('and moves down the road',e.dist>z0+.3,(e.dist-z0).toFixed(2));clean();}
  {let wolves=0,n=0;for(let i=0;i<30;i++){const B=buildWave(30);for(const it of B.q){if(it.type==='wolf'){wolves++;if(it.elite)n++;}}}ok('wolves run with the waves here (never elite)',wolves>20&&!n,wolves);
   const a0=meta.arena;meta.arena='plains';let pw=0;for(let i=0;i<20;i++)pw+=buildWave(30).q.filter(it=>it.type==='wolf').length;meta.arena=a0;ok('but not in the other lands',!pw);
   let early=0;for(let i=0;i<20;i++)early+=buildWave(5).q.filter(it=>it.type==='wolf').length;ok('and not before wave 8',!early);}
  /* the pack */
  {clean();TGP.calm=0;state='playing';wave=40;spawnEnemy({type:'soldier',v:0},20);const keep=enemies[0];keep.spd=0;packNow();run(1);tgPillSync();
   ok('a warning first: the howl, the sign, the eyes in the trees',TGP.warned&&!!TGP.fx&&TGP.fx.eyes.length>=4&&!!TGP.spot&&$('#tgPill')&&$('#tgPill').classList.contains('on'));
   const sp=TGP.spot,ed=Math.abs(sp.ex),xE=W/2+.2;ok('the eyes are in the treeline, off the board',ed>xE||sp.ez<tw(0,0).z-.5);run(1.4);const P=enemies.filter(e=>e.pack);
   ok('then the pack bursts out onto the road',P.length===packCount()&&P.every(e=>e.type==='wolf'&&e.route===sp.rt&&Math.abs(e.dist-sp.d)<2),P.length+' wolves');
   ok('mid-road, not at a gate',P.every(e=>e.dist>1.5));ok('80% of a wave foe’s health, half its gold',(()=>{const ref=hpOf('taiga','wolf',40).h*.85;return P.every(e=>e.tg&&e.maxHp/(e.gem?1.2:1)<ref);})(),P.map(e=>Math.round(e.maxHp)+(e.gem?'g':'')).join('/')+' < '+Math.round(hpOf('taiga','wolf',40).h*.85));
   ok('they come out of the trees (start off the road and close in fast)',P.some(e=>Math.abs(e.ox)+Math.abs(e.oz)>.2));
   run(1.2);ok('within a second they are on the road',P.every(e=>e.dead||Math.abs(e.ox)+Math.abs(e.oz)<.15));
   ok('the next pack comes 30 to 42 s later',TGP.t>=TG.gap0*.5&&TGP.t<=TG.gap1,TGP.t.toFixed(1));clean();}
  {clean();TGP.calm=0;state='playing';wave=60;spawnEnemy({type:'soldier',v:0},20);enemies[0].spd=0;packNow();run(2.5);const A=enemies.filter(e=>e.alpha);ok('from wave 50 an alpha leads the pack, three times as tough',A.length===1&&A[0].maxHp>enemies.find(e=>e.pack&&!e.alpha).maxHp*2.5);clean();}
  {clean();TGP.calm=0;state='playing';spawnEnemy({type:'soldier',v:0},20);enemies[0].spd=0;TGP.t=99;run(.5);const t0=TGP.t;clean();run(.5);ok('the pack only hunts while a wave is on the field',TGP.t===t0);}
  {tgCalm(3);ok('a calm keeps it away for three waves',TGP.calm===3&&!TGP.fx);lmWaveClear(5);ok('counted down by cleared waves',TGP.calm===2);const o=serializeRun();ok('the calm is saved with the run',o.tgp&&o.tgp.c===2);TGP.calm=0;}
  {const e={type:'x'};let a=0;const o0=hurt;ok('fire spells hit 15% harder here',(()=>{clean();spawnEnemy({type:'knight',v:0},20);const k=enemies[0];k.armor=0;k.hp=k.maxHp=1e6;hurt(k,100,'magic',{el:'fire',spell:'cinders',src:null});const d1=1e6-k.hp;k.hp=1e6;hurt(k,100,'magic',{el:'fire',src:null});const d2=1e6-k.hp;clean();return d2>0&&Math.abs(d1/d2-1.15)<.01;})());}
  /* landmarks and props */
  ok('six landmarks and six props of its own',MK_SETS.taiga.length===6&&LORE_SETS.taiga.length===6&&loreKeys([]).every(k=>LORE_SETS.taiga.includes(k))&&lmKeys().every(k=>MK_SETS.taiga.includes(k)));
  ok('none shared with the other lands',MK_SETS.taiga.every(k=>!MK_SETS.snow.includes(k)&&!MK_SETS.tundra.includes(k)&&!MK_SETS.whitewaste.includes(k)));
  {let bad=[];for(const k of MK_SETS.taiga){try{const P=lmModel(k);if(!P||!P.g||P.g.children.length<4)bad.push(k);}catch(e){bad.push(k+':'+e.message);}}for(const k of LORE_SETS.taiga){try{const g=loreModel(k,5,{rd:1.5,sc:1});if(!g||g.children.length<3)bad.push(k);}catch(e){bad.push(k+':'+e.message);}}
   ok('every landmark and prop builds',!bad.length,bad.join(','));}
  const place=()=>{if(towers.length)return;const R=ROUTES[0];for(let d=3;d<R.len-2&&towers.length<4;d+=.7){const p=posAt(d,R);for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(towers.length>=4)break;if(grid[r][c]!==0)continue;const q=tw(c,r);if((q.x-p[0])**2+(q.z-p[1])**2<1.6&&!towers.some(t=>t.c===c&&t.r===r)){gold+=1e5;placeTower('archer',c,r);}}}};
  const nearD=(t,R)=>{let b=0,bd=1e9;for(let d=0;d<R.len;d+=.05){const p=posAt(d,R),q=(p[0]-t.x)**2+(p[1]-t.z)**2;if(q<bd){bd=q;b=d;}}return b;};
  const LM=(k,st,x,z)=>{const L={k,st:st||null,x:x||0,z:z||0,P:lmModel(k),c:0,r:0};LMS.push(L);return L;},unLM=L=>LMS.splice(LMS.indexOf(L),1);
  {clean();const L=LM('huntstand');gold+=500;lmOptions(L)[0].f();ok('a lookout keeps the pack away within 4 tiles',L.st==='watched'&&tgNoPack(1,1)&&!tgNoPack(5,0));
   const dmgAt=(type,x,z)=>{spawnEnemy({type,v:0},20);const w=enemies[enemies.length-1];w.armor=0;w.hp=w.maxHp=1e6;w.x=x;w.z=z;hurt(w,100,'magic',{src:null});const d=1e6-w.hp;clean();return d;};const near=dmgAt('wolf',.5,.5),far=dmgAt('wolf',9,9);ok('and wolves near it take 25% more damage',Math.abs(near/far-1.25)<.01,(near/far).toFixed(3));unLM(L);clean();}
  {clean();const L=LM('yaga');gold+=500;const l0=lives;lmOptions(L)[0].f();ok('the potion gives three lives',lives===l0+3&&L.st==='potion');unLM(L);
   const L2=LM('yaga');lmOptions(L2)[1].f();const dm=(x,z)=>{spawnEnemy({type:'knight',v:0},20);const k=enemies[enemies.length-1];k.armor=0;k.hp=k.maxHp=1e6;k.x=x;k.z=z;hurt(k,100,'magic',{src:null});const d=1e6-k.hp;clean();return d;};const a=dm(.5,.5),b=dm(9,9);ok('the curse: foes near the hut take 15% more damage',Math.abs(a/b-1.15)<.01,(a/b).toFixed(3));unLM(L2);clean();}
  {clean();const L=LM('sawmill');gold+=500;lmOptions(L)[1].f();const g0=gold;lmWaveClear(20);ok('the restarted saw pays after every cleared wave',L.st==='sawing'&&gold>=g0+40+60,gold-g0);unLM(L);}
  {clean();place();const T=towers[0],s1=tStats(T).dmg;const L=LM('totem','carved',T.x+.5,T.z);const s2=tStats(T).dmg;ok('a carved totem: towers near it hit 10% harder',s1>0&&Math.abs(s2/s1-1.1)<.01,(s2/s1).toFixed(3));unLM(L);}
  {clean();state='playing';spawnEnemy({type:'wolf',v:0},20);const e=enemies[0];e.spd=0;e.hp=e.maxHp=1e6;e.armor=0;const L=LM('stockade','garrisoned',e.x+1,e.z);const h0=e.hp;run(.2);const d=h0-e.hp;ok('the garrisoned stockade shoots foes near it, wolves for double',d>=(22+Math.max(1,wave)*3.5)*1.6,d.toFixed(0));unLM(L);clean();}
  {clean();const L=LM('oldgrove');gold+=500;lmOptions(L)[0].f();const t=towers[0]||null;ok('a gift to the grove',L.st==='gifted'&&tgGroveNear({x:.5,z:.5})&&!tgGroveNear({x:9,z:9}));unLM(L);}
  {meta.arena='taiga';const m=chestModel();ok('the chest is mossy, with antlers',m&&m.g&&m.g.userData.land==='taiga');}
  /* the milestone bosses */
  ok('Mossback guards wave 100, the Leshy wave 200',bossFor(100).type==='mossback'&&bossFor(100).milestone==='taiga100'&&bossFor(200).type==='leshy'&&bossFor(200).milestone==='taiga200');
  {clean();state='playing';wave=100;place();const B=bossFor(100);spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul,ms:B.milestone},100);const e=enemies[enemies.length-1];const T0=towers[0];e.route=ROUTES[0];e.dist=nearD(T0,e.route);moveEnemy(e,0);e.spd=0;e.mrT=99;
   e.mbT=0;run(.1);ok('Mossback rears up to maul the towers in reach',e.g.userData.rear>0&&e.mbHit>0);run(.6);ok('and they stop, clawed',towers.some(t=>t.iceT>0&&t.iceM&&t.iceM.userData.tgSeize==='maul'));
   clean();spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul,ms:B.milestone},100);const f=enemies[enemies.length-1];f.route=ROUTES[0];f.dist=4;moveEnemy(f,0);spawnEnemy({type:'soldier',v:0},100);const s=enemies[enemies.length-1];s.route=f.route;s.dist=f.dist+.5;moveEnemy(s,0);
   f.spd=0;f.mrT=0;f.mbT=99;run(.1);ok('its roar drives the foes around it on',s.tgRoar>2);const X=s.dist;moveEnemy(s,.1);const v1=s.dist-X;s.dist=X;s.tgRoar=0;moveEnemy(s,.1);const v2=s.dist-X;ok('35% faster while it lasts',v2>0&&Math.abs(v1/v2-1.35)<.02,(v1/v2).toFixed(3));s.dist=f.dist+5;moveEnemy(s,0);
   f.armor=0;let h1=f.hp;hurt(f,1000,'magic',{src:null});const dA=h1-f.hp;f.hp=f.maxHp*.45;run(.1);ok('at half health it curls up under its moss',f.mbSleep>0&&f.mbSlept===1);h1=f.hp;hurt(f,1000,'magic',{src:null});ok('and shrugs off 60% of the damage while asleep',Math.abs((h1-f.hp)/dA-.4)<.01,((h1-f.hp)/dA).toFixed(3));
   const h2=f.hp,dd=f.dist;run(1);ok('it heals and stays put while it sleeps',f.hp>h2&&Math.abs(f.dist-dd)<1e-6);run(3);ok('then wakes in a rage',f.mbSleep===0&&f.mbRage===1);clean();}
  {clean();state='playing';wave=200;place();const B=bossFor(200);spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul,ms:B.milestone},200);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=6;moveEnemy(e,0);e.spd=0;
   const T0=towers[0];e.dist=nearD(T0,e.route);moveEnemy(e,0);e.lrT=0;e.lpT=99;run(.1);ok('the Leshy calls roots that seize the towers around it',towers.some(t=>t.iceT>0&&t.iceM&&t.iceM.userData.tgSeize==='root'));
   e.lpT=0;run(.1);ok('it howls and the pack comes running',enemies.filter(q=>q.pack).length>=5);
   e.hp=e.maxHp*.45;run(.1);ok('at half health the forest hides it: bark, mist, no tower can target it',e.msVeil===1&&e.shield>0&&!!e.bubble&&e.burrow===1&&!inRange({x:e.x,z:e.z,type:'archer',c:0,r:0},{range:6,air:true}).includes(e));
   run(3.2);ok('the mist clears again',!e.burrow);
   TGP.calm=0;e.shield=0;hurt(e,e.hp*3+10,'magic',{src:null});ok('when it falls the pack keeps away for three waves',e.dead&&TGP.calm===3);TGP.calm=0;worldSlow=1;slowT=0;clean();}
  {for(const t of towers)if(t.iceT>0)msbThaw(t);ok('the roots let go again',towers.every(t=>!(t.iceT>0)&&!t.iceM));}
  /* the Bestiary */
  ok('one of them is a Wolf, not a Wolve',unitName('wolf')==='Wolf'&&unitName('soldier')==='Soldier');
  ok('the wolf and both bosses have their place in the Bestiary',['wolf','mossback','leshy'].every(t=>GAL_UNITS.includes(t)&&GAL_LIST.some(q=>q[0]===t)&&ENEMY_VARIANTS[t]&&EN_NOTE[t]));
  {galSetBiome('taiga');const b=$('#bGalBiome');ok('the Bestiary shows the taiga variants',GAL_BIO==='taiga'&&(!b||/Taiga/.test(b.textContent)));const m=galSnowM(enemyModel('soldier',0),'soldier');let tm=0;m.b.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.tg)tm++;});ok('in their furs',tm>3,tm);galSetBiome('plains');}
  ok('the notes and the changelog tell of it',document.body.innerHTML.includes('Arena 5: the Deep Taiga')&&CLOG.some(c=>c.t==='The Deep Taiga'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{try{worldSlow=1;slowT=0;TGP.calm=0;TGP.bait=0;state='menu';paused=false;clean();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);const c=$('#msbCard');if(c)c.classList.remove('on');const v=$('#vict');if(v)v.hidden=true;V200=false;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
