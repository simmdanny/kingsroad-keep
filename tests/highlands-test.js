(function(){
/* The Stormcrag Highlands (v418): Arena 6. Unlock, the board, the people of the hills (every troop and variant, walking, gems, scrolls, elites),
   withered bosses, the haar, the Grey Man and the Cailleach, landmarks, props, the chest, rewards and the Bestiary.
   Run on the dev page: __kk.ev(await (await fetch('/tests/highlands-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const go=(a,sd)=>{lsSet(KR,null);for(const k of['snow','tundra','whitewaste','taiga','highlands']){meta.arenas[k]=1;meta.seenA[k]=1;}meta.mapIntro=0;meta.arena=a;state='menu';clearWorld();buildMap(sd||777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;for(const t of towers){if(t.iceT>0)msbThaw(t);t.hlDread=0;}};
const run=(s)=>{for(let i=0;i<s/.05;i++){update(.05);updFx(.05);}};
const lum=c=>c.r*.3+c.g*.59+c.b*.11;
const hpOf=(a,type,w)=>{const a0=meta.arena;meta.arena=a;clean();spawnEnemy({type,v:0},w);const e=enemies[enemies.length-1];const h=e.maxHp/(e.gem?1.2:1),s=e.spd/(e.gem?1.15:1);clean();meta.arena=a0;return{h,s};};
const last=()=>enemies[enemies.length-1];
const HUM=['peasant','soldier','knight','monk'];
try{
  /* the land and how it opens */
  ok('the Stormcrag Highlands are Arena 6 on the world map',ARENAS.highlands&&ARENAS.highlands.no===6&&SITE_ARENA.highlands==='highlands'&&WMP.sites.highlands&&arenaNow.toString().includes('highlands'));
  {const m=arenaFix({arena:'plains',arenas:{plains:1,snow:1,tundra:1,whitewaste:1,taiga:1},seenA:{plains:1},wonA:{plains:1,whitewaste:1,taiga:1},bestA:{}});ok('an account that has won the Deep Taiga finds the Highlands open',!!m.arenas.highlands);
   const m2=arenaFix({arena:'plains',arenas:{plains:1,snow:1,tundra:1,whitewaste:1,taiga:1},seenA:{plains:1},wonA:{plains:1,whitewaste:1},bestA:{}});ok('an account that has not won the Deep Taiga does not',!m2.arenas.highlands);}
  {go('taiga');meta.arenas.highlands=0;meta.wonA={plains:1,snow:1,whitewaste:1};V200=false;state='playing';wave=200;arenaWin();const vl=$('#vLands');
   ok('winning wave 200 in the Deep Taiga opens the Highlands and says so',meta.arenas.highlands===1&&meta.seenA.highlands===0&&!!vl&&/Stormcrag Highlands/.test(vl.textContent));const v=$('#vict');if(v)v.hidden=true;V200=false;paused=true;}
  {go('whitewaste');meta.arenas.highlands=0;V200=false;state='playing';wave=200;arenaWin();ok('winning the Whitewaste does not open it',!meta.arenas.highlands);const v=$('#vict');if(v)v.hidden=true;V200=false;paused=true;}
  {go('highlands');V200=false;state='playing';wave=200;arenaWin();ok('winning wave 200 here: the Cailleach falls',/Cailleach/.test(($('#vSub')||{}).textContent||''));const v=$('#vict');if(v)v.hidden=true;V200=false;paused=true;}
  ok('the locked land on the world map says how to open it',String(wmapTap).includes('Win wave 200 in the Deep Taiga to open the Stormcrag Highlands.'));
  ok('the arrival plate tells of the haar',String(wmapArrive).includes("to==='highlands'")&&String(wmapArrive).includes('haar'));
  ok('the trip runs along the roads, also from the plains and the taiga',(()=>{if(!WMP.paths)wmpPaint();const L=['plains','tundra','taiga','whitewaste'].map(f=>WMP.paths[f+'>highlands']||wmpVia(f,'highlands'));return L.every(p=>Array.isArray(p)&&p.length>3);})());
  {const a=JSON.parse(JSON.stringify(meta));arenaUnlockDev();ok('the developer unlock opens it too',meta.arenas.highlands===1&&meta.seenA.highlands===0);meta.arenas=a.arenas;meta.seenA=a.seenA;}
  {go('highlands');renderHome&&renderHome();const hd=document.querySelector('.arena-head');ok('the header says Arena 6 and wears the land\'s colours',!!hd&&/Arena 6/.test(hd.querySelector('.lbl').textContent)&&hd.closest('.arena').classList.contains('highlands'));}
  /* the board */
  go('highlands',31);
  ok('the board is built for the Highlands',arenaNow()==='highlands'&&ARENA_BUILT==='highlands');
  {let road=null,moor=null;const c=new THREE.Color();for(let r=0;r<H&&(road==null||moor==null);r++)for(let k=0;k<W;k++){TILES.getColorAt(r*W+k,c);if(grid[r][k]===1&&road==null)road=lum(c);if(grid[r][k]===0&&moor==null)moor=lum(c);}
   ok('a light gravel road on dark moor (readable at a glance)',road>moor*1.5&&road>.45&&moor<.4,road.toFixed(2)+' / '+moor.toFixed(2));}
  {const tags={};TERRAIN.children.forEach(o=>{if(o.userData&&o.userData.hl)tags[o.userData.hl]=(tags[o.userData.hl]||0)+(o.count||1);});
   ok('tors, heather, bracken, gorse, pines, boulders, dry-stone walls, cairns, bens, sheep, cattle and mist around it',['tor','heather','bracken','gorse','pine','rock','wall','cairn','ben','sheep','cow','mist','edge'].every(k=>tags[k]>0)&&tags.heather>300&&tags.wall>40,JSON.stringify(tags));}
  {const xE=W/2+.2,zTop=tw(0,0).z-.55,zBot=tw(0,H-1).z+.55,m=new THREE.Matrix4(),p=new THREE.Vector3();let bad=0;
   TERRAIN.children.forEach(o=>{if(!o.isInstancedMesh||!['tor','pine','ben','wall','cairn'].includes(o.userData.hl))return;for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);p.setFromMatrixPosition(m);if(Math.abs(p.x)<xE+.3&&p.z>zTop-.3&&p.z<zBot+.3)bad++;if(p.z>zBot+.4&&o.userData.hl!=='wall')bad++;}});
   ok('nothing tall on the board or in front of it',!bad,bad);}
  ok('the land has its own light, preview and terrain names',arenaPV()===HL_PV&&terPal()===TERP.highlands&&TERP.highlands.n.m==='Peat hag');
  ok('peat hags can form on the board',terMarshLand());
  ok('lightning spells +20% here; ice spells and slows unchanged',landEl()&&landEl().lightning===1.2&&landEl().ice===1&&landEl().slow===1&&landSlow(.7)===.7);
  ok('gems pay 2.5 times, rare scrolls a little more often than in the taiga',ARENA_REWARD.highlands.gem===2.5&&arenaReward().gem===2.5&&ARENA_REWARD.highlands.rar>ARENA_REWARD.taiga.rar);
  {let n3=0;for(let i=0;i<200;i++)if(gateN(rnd())===3)n3++;ok('always three enemy gates',n3===200,n3+' of 200');}
  /* tougher foes */
  {const a=hpOf('highlands','soldier',10),b=hpOf('plains','soldier',10);ok('troops have 35% more health and run 5% faster',Math.abs(a.h/b.h-1.35)<.01&&Math.abs(a.s/b.s-1.05)<.01,(a.h/b.h).toFixed(3)+' / '+(a.s/b.s).toFixed(3));}
  {const bt=Object.keys(EN).find(k=>EN[k].boss&&!MSB_T.has(k)&&k!=='ophanim'&&k!=='seraph'),a=hpOf('highlands',bt,50),b=hpOf('plains',bt,50);
   const cap=()=>{const a0=meta.arena;meta.arena='plains';const v=bossHpAt(bossFor(50),50);meta.arena=a0;return v;};
   ok('bosses have 60% more health (not faster), and the cap agrees',Math.abs(a.h/b.h-1.6)<.01&&Math.abs(a.s/b.s-1)<.01&&Math.abs(bossHpAt(bossFor(50),50)/cap()-1.6)<.01,(a.h/b.h).toFixed(3));}
  /* the people of the hills: every troop and every variant has its own model up here */
  {clean();const bad=[];const struct=m=>{const L=m.limbs;return [!!m.wings,L?Object.keys(L).sort().join('/'):'-',L&&L.quad?Object.keys(L.quad).join(''):'',L&&L.wheels?L.wheels.length:0].join('|');};
   for(const t of ['peasant','soldier','knight','monk','rider','raven','ram']){const n=t==='peasant'?8:5;for(let v=0;v<n;v++){HLX.n++;let hm;try{hm=t==='peasant'?peasantModel(v,0x3aa8ff):unitModel(t,v,0x3aa8ff,1);}finally{HLX.n--;}
     const pm=t==='peasant'?peasantModel(v,0x3aa8ff):unitModel(t,v,0x3aa8ff,1),hg=hm.b.children[0].geometry,pg=pm.b.children[0].geometry;
     if(hg===pg||hg.attributes.position.count===pg.attributes.position.count)bad.push(t+v+':same');if(struct(hm)!==struct(pm))bad.push(t+v+':rig '+struct(hm)+' vs '+struct(pm));if(!!hm.gem!==!!pm.gem)bad.push(t+v+':special');if(!!hm.flame!==!!pm.flame)bad.push(t+v+':flame');}}
   ok('every troop and every variant (38 models) has its own Highlands model, on the same rig as everywhere else',!bad.length,bad.join(', '));}
  {clean();spawnEnemy({type:'soldier',v:0},20);const e=last();ok('a spawn up here wears the Highlands model',e.hl&&e.b.children[0].geometry===HL_UNIT_CACHE.soldier0.geos.body);clean();
   meta.arena='plains';spawnEnemy({type:'soldier',v:0},20);const p=last();ok('but not in the other lands',!p.hl&&p.b.children[0].geometry!==HL_UNIT_CACHE.soldier0.geos.body);clean();meta.arena='highlands';
   const k=enemyModel('knight',0);ok('and not outside a spawn (the knight profile icon keeps its plate)',k.b.children[0].geometry!==HL_UNIT_CACHE.knight0.geos.body);}
  {clean();state='playing';const moved=[];for(const[t,v]of[['peasant',3],['soldier',2],['knight',1],['monk',0],['rider',1],['ram',2],['raven',0]]){spawnEnemy({type:t,v},20);const e=last();e.route=ROUTES[0];e.dist=2;moveEnemy(e,0);}
   const L0=enemies.map(e=>{const L=e.limbs;return L?(L.legL?L.legL.rotation.x:L.quad?L.quad.FL.rotation.x:L.wheels?L.wheels[0].rotation.x:0):e.wings?e.wings[0].rotation.z:0;}),d0=enemies.map(e=>e.dist);run(.37);
   const L1=enemies.map(e=>{const L=e.limbs;return L?(L.legL?L.legL.rotation.x:L.quad?L.quad.FL.rotation.x:L.wheels?L.wheels[0].rotation.x:0):e.wings?e.wings[0].rotation.z:0;});
   ok('they walk, ride, roll and fly like everywhere else (legs, hooves, wheels, wings)',enemies.every((e,i)=>Math.abs(L1[i]-L0[i])>.01&&e.dist>d0[i]+.1),enemies.map((e,i)=>e.type+':'+(L1[i]-L0[i]).toFixed(2)).join(' '));
   const e=enemies[1],h0=e.hp;hurt(e,10,'magic',{src:null});ok('they take hits',e.hp<h0);const n0=enemies.length;kill(e,null);run(1.5);ok('and die',e.dead&&enemies.length<n0);clean();}
  {clean();forceGem=true;spawnEnemy({type:'soldier'},20);forceGem=false;const e=last();ok('a Gem Carrier up here is the chief\'s man with the gilded targe',e.gem&&e.gemMesh&&e.b.children[0].geometry===HL_UNIT_CACHE.soldier3.geos.body);
   forceGem=true;spawnEnemy({type:'peasant'},20);forceGem=false;const p=last();ok('and the peasant\'s is the drover with the storm lantern',p.gem&&p.gemMesh&&p.b.children[0].geometry===HL_PEAS_CACHE[6].geos.body);clean();
   forceScroll=true;spawnEnemy({type:'peasant'},20);forceScroll=false;const s=last();ok('a Scroll Bearer up here is the seanchaidh',s.scroll&&s.b.children[0].geometry===HL_PEAS_CACHE[7].geos.body);clean();
   spawnEnemy({type:'knight',v:0,elite:['swift','shielded']},20);const k=last();ok('elites wear their affix dress over the Highland clothes',k.elites&&k.eliteFx&&k.b.children[0].geometry===HL_UNIT_CACHE.knight0.geos.body);clean();}
  {clean();spawnEnemy({type:'ogre',v:0},30);const e=last();let w=0,all=0;e.b.traverse(o=>{if(o.isMesh&&o.material&&!Array.isArray(o.material)&&o.material.isMeshPhongMaterial){all++;if(o.material.userData.hlw)w++;}});
   ok('every boss that climbs up here is withered (cracked, drained, rimed)',e.hl&&w>0&&w>=all*.8,w+' / '+all);clean();spawnEnemy({type:'soldier',v:0},30);const s=last();let ws=0;s.b.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.hlw)ws++;});ok('but the troops are not',!ws);clean();}
  /* the haar */
  const place=n=>{if(towers.length>=n)return;const R=ROUTES[0];for(let d=3;d<R.len-2&&towers.length<n;d+=.7){const p=posAt(d,R);for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(towers.length>=n)break;if(grid[r][c]!==0)continue;const q=tw(c,r);if((q.x-p[0])**2+(q.z-p[1])**2<1.6&&!towers.some(t=>t.c===c&&t.r===r)){gold+=1e5;placeTower('archer',c,r);}}}};
  {clean();state='playing';wave=40;spawnEnemy({type:'soldier',v:0},20);last().spd=0;HLH.calm=0;haarNow();run(1);hlPillSync();
   ok('a warning first: the moan, the sign, a fog bank gathering at the edge of the board',HLH.warned&&!HLH.on&&!!HLH.fx&&$('#hlPill')&&$('#hlPill').classList.contains('warn')&&Math.abs(HLH.f)>W/2);
   run(1.8);ok('then the haar rolls in',HLH.on&&!!HLH.fx);const f0=HLH.f;run(1);ok('and moves across the board on the wind',Math.abs(HLH.f-f0)>.8&&Math.sign(HLH.f-f0)===HLH.dir,(HLH.f-f0).toFixed(2));
   place(3);const T=towers[0],r1=(()=>{const f=HLH.f;HLH.f=-99;const r=tStats(T).range;HLH.f=f;return r;})();HLH.f=T.x+HLH.dir*2;const r2=tStats(T).range;
   ok('towers inside the fog see 70% as far',hlInFog(T)&&Math.abs(r2/r1-.7)<.01,(r2/r1).toFixed(3));HLH.f=T.x-HLH.dir*3;ok('and see normally once it has passed',!hlInFog(T)&&Math.abs(tStats(T).range/r1-1)<.01);
   HLH.f=T.x+HLH.dir*2;const L={k:'firecairn',st:'beaconlit',x:T.x+1,z:T.z,P:lmModel('firecairn'),c:0,r:0};LMS.push(L);ok('a lit beacon keeps the fog off the towers within 4 tiles',!hlInFog(T)&&Math.abs(tStats(T).range/r1-1)<.01);LMS.splice(LMS.indexOf(L),1);
   HLH.f=T.x+HLH.dir*2;run(.5);let rings=HLH.rings.filter(r=>r.parent===scene).length;ok('a pale ring marks every tower the fog has blinded',rings>=1,rings);
   run(30);ok('it rolls off the far side and clears',!HLH.on&&!HLH.fx);ok('the next haar comes 32 to 44 s later',HLH.t>=HL.gap0*.2&&HLH.t<=HL.gap1,HLH.t.toFixed(1));clean();}
  {clean();HLH.calm=0;state='playing';spawnEnemy({type:'soldier',v:0},20);last().spd=0;HLH.t=99;run(.5);const t0=HLH.t;clean();run(.5);ok('the haar only comes while a wave is on the field',HLH.t===t0);}
  {hlCalm(3);ok('a calm keeps it away for three waves',HLH.calm===3&&!HLH.fx);lmWaveClear(5);ok('counted down by cleared waves',HLH.calm===2);const o=serializeRun();ok('the calm is saved with the run',o.hlh&&o.hlh.c===2);HLH.calm=0;}
  ok('the developer menu can call the haar',(()=>{const src=[...document.scripts].map(q=>q.textContent).join('');return src.includes("B('haar','Fog'")&&src.includes("a==='haar'");})());
  {clean();spawnEnemy({type:'knight',v:0},20);const k=last();k.armor=0;k.res={};k.hp=k.maxHp=1e6;hurt(k,100,'magic',{el:'lightning',spell:'stormcloud',src:null});const d1=1e6-k.hp;k.hp=1e6;hurt(k,100,'magic',{el:'lightning',src:null});const d2=1e6-k.hp;clean();
   ok('lightning spells strike 20% harder here',d2>0&&Math.abs(d1/d2-1.2)<.01,(d1/d2).toFixed(3));}
  /* landmarks and props */
  ok('six landmarks and six props of its own',MK_SETS.highlands.length===6&&LORE_SETS.highlands.length===6&&loreKeys([]).every(k=>LORE_SETS.highlands.includes(k))&&lmKeys().every(k=>MK_SETS.highlands.includes(k)));
  {const others=Object.keys(MK_SETS).filter(k=>k!=='highlands').flatMap(k=>MK_SETS[k]).concat(LM_KEYS||[]),props=Object.keys(LORE_SETS).filter(k=>k!=='highlands').flatMap(k=>LORE_SETS[k]).concat(LORE_KEYS||[]);
   ok('none shared with the other lands',MK_SETS.highlands.every(k=>!others.includes(k))&&LORE_SETS.highlands.every(k=>!props.includes(k)));}
  {let bad=[];for(const k of MK_SETS.highlands){try{const P=lmModel(k);if(!P||!P.g||P.g.children.length<4)bad.push(k);}catch(e){bad.push(k+':'+e.message);}}for(const k of LORE_SETS.highlands){try{const g=loreModel(k,5,{rd:1.5,sc:1});if(!g||g.children.length<3)bad.push(k);}catch(e){bad.push(k+':'+e.message);}}
   ok('every landmark and prop builds',!bad.length,bad.join(','));}
  const nearD=(t,R)=>{let b=0,bd=1e9;for(let d=0;d<R.len;d+=.05){const p=posAt(d,R),q=(p[0]-t.x)**2+(p[1]-t.z)**2;if(q<bd){bd=q;b=d;}}return b;};
  const LM=(k,st,x,z)=>{const L={k,st:st||null,x:x||0,z:z||0,P:lmModel(k),c:0,r:0};LMS.push(L);return L;},unLM=L=>LMS.splice(LMS.indexOf(L),1);
  {clean();const L=LM('brahan');gold+=500;const l0=lives;lmOptions(L)[0].f();ok("the seer's charm gives three lives",lives===l0+3&&L.st==='charmed');unLM(L);
   const L2=LM('brahan');lmOptions(L2)[1].f();const dm=(x,z)=>{spawnEnemy({type:'knight',v:0},20);const k=last();k.armor=0;k.hp=k.maxHp=1e6;k.x=x;k.z=z;hurt(k,100,'magic',{src:null});const d=1e6-k.hp;clean();return d;};const a=dm(.5,.5),b=dm(9,9);
   ok('the second sight: foes near the bothy take 15% more damage',Math.abs(a/b-1.15)<.01,(a/b).toFixed(3));unLM(L2);clean();}
  {clean();const L=LM('still');gold+=500;lmOptions(L)[1].f();const g0=gold;lmWaveClear(20);ok('the still pays after every cleared wave',L.st==='distilling'&&gold>=g0+40+60,gold-g0);unLM(L);}
  {clean();place(3);const T=towers[0],s1=tStats(T).rate;const L=LM('standing','stonewoken',T.x+.5,T.z);const s2=tStats(T).rate;ok('the woken stones: towers near them attack 10% faster',s1>0&&Math.abs(s2/s1-1.1)<.01,(s2/s1).toFixed(3));unLM(L);}
  {clean();state='playing';spawnEnemy({type:'rider',v:0},20);const e=last();e.spd=0;e.hp=e.maxHp=1e6;e.armor=0;const L=LM('broch','manned',e.x+1,e.z);const h0=e.hp;run(.2);const d=h0-e.hp;ok('the garrisoned broch pelts foes near it, riders for double',d>=(22+Math.max(1,wave)*3.5)*1.6,d.toFixed(0));unLM(L);clean();}
  {clean();place(3);const T=towers[0];const L=LM('clootie','clootied',T.x+.5,T.z);msbFreeze(T,2,'ice');const i0=T.iceT;towerUpdate(T,.1);const fast=i0-T.iceT;msbThaw(T);T.iceImm=0;unLM(L);msbFreeze(T,2,'ice');const i1=T.iceT;towerUpdate(T,.1);const slow=i1-T.iceT;msbThaw(T);T.iceImm=0;
   ok('a rag on the clootie well: towers near it shake off frost twice as fast',Math.abs(fast/slow-2)<.05,(fast/slow).toFixed(2));}
  {meta.arena='highlands';const m=chestModel();ok('the chest has a tartan strap and a sprig of heather',m&&m.g&&m.g.userData.land==='highlands');}
  /* the milestone bosses */
  ok('the Grey Man guards wave 100, the Cailleach wave 200',bossFor(100).type==='greyman'&&bossFor(100).milestone==='highlands100'&&bossFor(200).type==='cailleach'&&bossFor(200).milestone==='highlands200');
  {clean();state='playing';wave=100;place(4);HLH.calm=9;const B=bossFor(100);spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul,ms:B.milestone},100);const e=last();const T0=towers[0];e.route=ROUTES[0];e.dist=nearD(T0,e.route);moveEnemy(e,0);e.spd=0;e.hwT=99;
   const r0=tStats(T0).rate;e.hdT=0;run(.1);ok('the Grey Man lifts his head and the towers near him are seized by dread',e.g.userData.look>0&&(T0.hlDread||0)>time&&HLDR.length>0);ok('they attack at half speed',Math.abs(tStats(T0).rate/r0-.5)<.01,(tStats(T0).rate/r0).toFixed(3));
   run(4.5);ok('until the dread passes',!((T0.hlDread||0)>time)&&Math.abs(tStats(T0).rate/r0-1)<.01);
   e.spd=.0001;e.hdT=99;const d0=e.dist;e.hwT=0;run(.1);ok('he steps into the mist: gone, and nothing can target him',e.burrow===1&&!e.b.visible&&!inRange({x:e.x,z:e.z,type:'archer',c:0,r:0},{range:6,air:true}).includes(e));
   run(1.6);ok('then he comes out of it further down the road',!e.burrow&&e.b.visible&&e.dist>d0+1.1,(e.dist-d0).toFixed(2));
   HLH.calm=0;e.hp=e.maxHp*.45;run(.1);ok('at half health the haar answers him: fog over the board and a cold shroud',e.msVeil===1&&e.shield>0&&!!e.bubble&&HLH.on&&!!HLH.fx);hlFogOff();HLH.on=false;clean();}
  {clean();state='playing';wave=200;place(4);HLH.calm=9;const B=bossFor(200);spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul,ms:B.milestone},200);const e=last();const T0=towers[0];e.route=ROUTES[0];e.dist=nearD(T0,e.route);moveEnemy(e,0);e.spd=0;e.cwT=99;
   e.csT=0;run(.1);ok('the Cailleach reaches into her creel',e.g.userData.throw>0);run(.6);ok('and boulders fly at the towers',HLST.length>0&&HLST.every(S=>S.m.parent===scene));run(1.6);
   ok('a tower hit is crushed under the stone for a while',towers.some(t=>t.iceT>0&&t.iceM&&t.iceM.userData.hlSeize==='stone')&&!HLST.length);
   for(const t of towers)if(t.iceT>0)msbThaw(t);for(const t of towers)t.iceImm=0;e.csT=99;spawnEnemy({type:'soldier',v:0},200);const s=last();s.route=e.route;s.dist=e.dist+.4;s.spd=0;moveEnemy(s,0);const sh0=s.shield||0;
   e.cwT=0;run(.6);ok('her staff of winter: a ring of ice crystals bursts out',HLIC.length>0&&HLIC[0].sp.length>8);ok('the towers in it freeze and the foes in it are shielded in frost',towers.some(t=>t.iceT>0&&t.iceM&&!t.iceM.userData.hlSeize)&&(s.shield||0)>sh0+s.maxHp*.07);
   run(3.2);ok('the ice shatters and is gone',!HLIC.length);for(const t of towers)if(t.iceT>0)msbThaw(t);removeEnemy(s);enemies=enemies.filter(q=>q!==s);
   e.cwT=99;e.csT=99;e.armor=0;e.res={};e.shield=0;e.hp=e.maxHp*.45;run(.1);ok('at half health she kneels to drink from the well of youth',e.hlDrink>0&&!!e.hlWell&&e.hlWell.g.parent===scene);
   const dd=e.dist,h1=e.hp;run(1);ok('she stands at the well and heals',Math.abs(e.dist-dd)<1e-6&&e.hp>h1,((e.hp-h1)/e.maxHp*100).toFixed(1)+'%');
   {const h=e.hp;hurt(e,1000,'magic',{src:null});const a=h-e.hp;e.hlDrink=0;const h2=e.hp;hurt(e,1000,'magic',{src:null});const b=h2-e.hp;e.hlDrink=2;ok('and takes 50% more damage while she drinks',Math.abs(a/b-1.5)<.02,(a/b).toFixed(3));}
   hurt(e,e.maxHp*.12,'magic',{src:null});run(.1);ok('hit her hard and the well runs dry: she staggers',!(e.hlDrink>0)&&e.stunT>0&&!e.hlWell);
   e.hp=e.maxHp*.45;e.hlDrank=0;run(.1);const h3=e.hp;run(4.2);ok('left alone she drinks her fill (about 16% of her health) and rises',!(e.hlDrink>0)&&(e.hp-h3)/e.maxHp>.13&&(e.hp-h3)/e.maxHp<.19,((e.hp-h3)/e.maxHp*100).toFixed(1)+'%');
   HLH.calm=0;e.shield=0;hurt(e,e.hp*3+10,'magic',{src:null});ok('when she falls the haar keeps away for three waves',e.dead&&HLH.calm===3);HLH.calm=0;worldSlow=1;slowT=0;clean();}
  {for(const t of towers)if(t.iceT>0)msbThaw(t);run(3);ok('the stones let go again and every effect is gone',towers.every(t=>!(t.iceT>0)&&!t.iceM)&&!HLST.length&&!HLIC.length&&!HLDR.length);}
  /* the Bestiary */
  ok('both bosses have their place in the Bestiary, their stories and their milestone cards',['greyman','cailleach'].every(t=>GAL_UNITS.includes(t)&&GAL_LIST.some(q=>q[0]===t)&&ENEMY_VARIANTS[t][0].d.length>80&&EN_NOTE[t]&&MSB_INFO[t]));
  ok('every Highland variant has a name and its words',Object.keys(HL_VARS).every(t=>HL_VARS[t].length===(t==='peasant'?8:5)&&HL_VARS[t].every(v=>v.n&&v.d.length>40)));
  {const d0=meta.dex;meta.dex=Object.assign({},d0,{'soldier:0':1});openGallery&&openGallery();galSetBiome('highlands');const b=$('#bGalBiome');ok('the Bestiary biome switch reaches the Highlands',GAL_BIO==='highlands'&&(!b||/Highlands/.test(b.textContent)));
   const it=GAL.items.find(q=>q.type==='peasant');ok('and shows the people of the hills',!!it&&it.m.b.children[0].geometry===HL_PEAS_CACHE[0].geos.body);
   openVar('soldier');ok('with their own names and words',/Highland Spearman/.test($('#gvName').textContent)&&/Highland variant/.test($('#gvDesc').textContent));ok('every variant on the pedestals is a Highland one',GV.items.every((q,i)=>q.m.b.children[0].geometry===HL_UNIT_CACHE['soldier'+i].geos.body));
   closeVar(true);galSetBiome('plains');meta.dex=d0;if(typeof closeGallery==='function')closeGallery();}
  ok('the changelog tells of it',CLOG.some(c=>c.t==='The Stormcrag Highlands'&&c.v==='v418'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{try{worldSlow=1;slowT=0;HLH.calm=0;hlFogOff();HLH.on=false;state='menu';paused=false;clean();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);const c=$('#msbCard');if(c)c.classList.remove('on');const v=$('#vict');if(v)v.hidden=true;V200=false;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
