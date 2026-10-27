(function(){
/* The Whitewaste (v326): Arena 4. Unlock, the board, its foes, the rising dead, Hollowmaw and the Rimebound Lich, landmarks, props, the chest,
   rewards and the Bestiary. Run on the dev page: __kk.ev(await (await fetch('/tests/whitewaste-test.js')).text()) returns [name, ok, detail] rows.
   Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const go=(a,sd)=>{lsSet(KR,null);meta.arenas.snow=1;meta.arenas.tundra=1;meta.arenas.whitewaste=1;meta.seenA.snow=1;meta.seenA.tundra=1;meta.seenA.whitewaste=1;meta.mapIntro=0;meta.arena=a;state='menu';clearWorld();buildMap(sd||777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;for(const t of towers)if(t.iceT>0)msbThaw(t);};
const run=(s)=>{for(let i=0;i<s/.05;i++){update(.05);updFx(.05);}};
const lum=c=>c.r*.3+c.g*.59+c.b*.11;
try{
  /* the land and how it opens */
  ok('the Whitewaste is Arena 4 on the world map',ARENAS.whitewaste&&ARENAS.whitewaste.no===4&&SITE_ARENA.whitewaste==='whitewaste'&&WMP.sites.whitewaste);
  {const m=arenaFix({arena:'plains',arenas:{plains:1,snow:1,tundra:1},seenA:{plains:1},wonA:{plains:1,snow:1},bestA:{}});ok('an account that has won Frostvale finds the Whitewaste open',!!m.arenas.whitewaste);
   const m2=arenaFix({arena:'plains',arenas:{plains:1,snow:1,tundra:1},seenA:{plains:1},wonA:{plains:1},bestA:{}});ok('an account that has won only the Plains does not',!m2.arenas.whitewaste);}
  {go('snow');meta.arenas.whitewaste=0;meta.wonA={plains:1};V200=false;state='playing';wave=200;arenaWin();const vl=$('#vLands');
   ok('winning wave 200 in Frostvale opens the Whitewaste and says so',meta.arenas.whitewaste===1&&!!vl&&/Whitewaste/.test(vl.textContent));const v=$('#vict');if(v)v.hidden=true;V200=false;paused=true;}
  {go('whitewaste');V200=false;state='playing';wave=200;arenaWin();ok('winning wave 200 here: the Lich falls',/Rimebound Lich/.test(($('#vSub')||{}).textContent||''));const v=$('#vict');if(v)v.hidden=true;V200=false;paused=true;}
  ok('the trip from the Plains runs by the roads through Frostvale or the tundra',(()=>{if(!WMP.paths)wmpPaint();const p=wmpVia('plains','whitewaste');return Array.isArray(p)&&p.length>4;})());
  /* the board */
  go('whitewaste',31);
  ok('the board is built for the Whitewaste',arenaNow()==='whitewaste'&&ARENA_BUILT==='whitewaste');
  {let road=null,snow=null;const c=new THREE.Color();for(let r=0;r<H&&(!road||!snow);r++)for(let k=0;k<W;k++){TILES.getColorAt(r*W+k,c);if(grid[r][k]===1&&!road)road=lum(c);if(grid[r][k]===0&&!snow)snow=lum(c);}
   ok('a dark ice road on white snow (readable at a glance)',road<.35&&snow>.75,road.toFixed(2)+' / '+snow.toFixed(2));}
  {const tags={};TERRAIN.children.forEach(o=>{if(o.userData&&o.userData.ww)tags[o.userData.ww]=(tags[o.userData.ww]||0)+o.count;});ok('ice spires, ridges, dead trees, pillars, blue ice and the ice wall around it',['spire','ridge','tree','pillar','ice','cliff'].every(k=>tags[k]>0),JSON.stringify(tags));}
  ok('the land has its own light, preview and terrain names',arenaPV()===WW_PV&&terPal()===TERP.whitewaste&&TERP.whitewaste.n.hi==='Ice ridge');
  ok('ice spells +15% and slows 15% stronger here',landEl()&&landEl().ice===1.15&&landEl().slow===1.15);
  ok('gems pay 75% more',ARENA_REWARD.whitewaste.gem===1.75&&arenaReward().gem===1.75);
  {let n3=0;for(let i=0;i<200;i++)if(gateN(rnd())===3)n3++;ok('always three enemy gates (v332)',n3===200,n3+' of 200');}
  /* foes */
  {clean();spawnEnemy({type:'soldier',v:0},10);const a=enemies[enemies.length-1];const ha=a.maxHp/(a.gem?1.2:1);clean();meta.arena='plains';spawnEnemy({type:'soldier',v:0},10);const b=enemies[enemies.length-1];const hb=b.maxHp/(b.gem?1.2:1);clean();meta.arena='whitewaste';/* a gem carrier (2%) has 20% more */
   ok('troops have 25% more health',Math.abs(ha/hb-1.25)<.01,(ha/hb).toFixed(3)+' ('+ha.toFixed(1)+' / '+hb.toFixed(1)+')');ok('and wear the rime of the waste',a.ww);}
  {clean();const bt=Object.keys(EN).find(k=>EN[k].boss&&!MSB_T.has(k)&&k!=='ophanim'&&k!=='seraph');spawnEnemy({type:bt,v:0},50);const a=enemies[enemies.length-1],ha=a.maxHp;clean();meta.arena='plains';spawnEnemy({type:bt,v:0},50);const hb=enemies[enemies.length-1].maxHp;clean();meta.arena='whitewaste';
   ok('bosses have 40% more health, and the cap agrees',Math.abs(ha/hb-1.4)<.01&&Math.abs(bossHpAt(bossFor(50),50)/(()=>{meta.arena='plains';const v=bossHpAt(bossFor(50),50);meta.arena='whitewaste';return v;})()-1.4)<.01,(ha/hb).toFixed(3));}
  /* the rising dead */
  {clean();WWR.calm=0;state='playing';spawnEnemy({type:'soldier',v:0},20);const keep=enemies[0];keep.spd=0;riseNow();run(1);wwPillSync();ok('a warning first: the sign, the cracks and the glow',WWR.warned&&!!WWR.fx&&!!WWR.spot&&($('#wwPill')||{}).classList&&$('#wwPill').classList.contains('on'));
   const sp=WWR.spot;run(1.2);const R=enemies.filter(e=>e.risen);ok('then the dead claw out of the snow beside the road',R.length===riseCount()&&R.every(e=>e.route===sp.rt&&Math.abs(e.dist-sp.d)<2),R.length+' risen');
   ok('they rise mid-road, not at a gate',R.every(e=>e.dist>1.5));ok('70% of a wave foe’s health, half its gold',R.every(e=>e.maxHp<keep.maxHp*.75&&e.ww));
   const d0=R.map(e=>e.dist);run(.1);ok('while they rise they stand in place, sunk in the snow',R.some(e=>e.emT>0)&&R.every((e,i)=>e.emT>0?Math.abs(e.dist-d0[i])<1e-6:true)&&R.some(e=>e.g.position.y<-.05));
   run(1.2);ok('then they walk',R.every(e=>e.emT<=0)&&R.some((e,i)=>e.dist>d0[i]+.01));
   ok('the next rising comes 35 to 50 s later',WWR.t>=WW.gap0*.5&&WWR.t<=WW.gap1,WWR.t.toFixed(1));}
  {clean();WWR.calm=0;state='playing';spawnEnemy({type:'soldier',v:0},20);enemies[0].spd=0;WWR.t=99;run(.5);const t0=WWR.t;clean();run(.5);ok('the dead only stir while a wave is on the field',WWR.t===t0);}
  {wwCalm(3);ok('a calm keeps them down for three waves',WWR.calm===3&&!WWR.fx);lmWaveClear(5);ok('counted down by cleared waves',WWR.calm===2);const o=serializeRun();ok('the calm is saved with the run',o.wwr&&o.wwr.c===2);WWR.calm=0;}
  /* landmarks and props */
  ok('six landmarks and six props of its own',MK_SETS.whitewaste.length===6&&LORE_SETS.whitewaste.length===6&&loreKeys([]).every(k=>LORE_SETS.whitewaste.includes(k))&&lmKeys().every(k=>MK_SETS.whitewaste.includes(k)));
  {let bad=[];for(const k of MK_SETS.whitewaste){try{const P=lmModel(k);if(!P||!P.g||P.g.children.length<4)bad.push(k);}catch(e){bad.push(k+':'+e.message);}}for(const k of LORE_SETS.whitewaste){try{const g=loreModel(k,5,{rd:1.5,sc:1});if(!g||g.children.length<3)bad.push(k);}catch(e){bad.push(k+':'+e.message);}}
   ok('every landmark and prop builds',!bad.length,bad.join(','));}
  {clean();const L={k:'beacon',st:null,x:0,z:0,P:lmModel('beacon'),c:0,r:0};const opt=lmOptions(L);LMS.push(L);gold+=500;opt[0].f();ok('a lit beacon keeps the dead down within 4 tiles',L.st==='lit'&&wwNoRise(1,1)&&!wwNoRise(5,0));LMS.splice(LMS.indexOf(L),1);}
  {clean();const L={k:'tomb',st:null,x:0,z:0,P:lmModel('tomb'),c:0,r:0};LMS.push(L);gold+=500;const o=lmOptions(L);o[1].f();ok('sealing the tomb calms the dead for three waves',WWR.calm===3&&L.st==='sealed');WWR.calm=0;LMS.splice(LMS.indexOf(L),1);
   const L2={k:'tomb',st:null,x:0,z:0,P:lmModel('tomb'),c:0,r:0};LMS.push(L2);const g0=meta.gems;lmOptions(L2)[0].f();ok('looting it pays, and the dead rise twice as often for three waves',meta.gems>g0&&WWR.loot===3&&L2.st==='looted');WWR.loot=0;LMS.splice(LMS.indexOf(L2),1);}
  {clean();state='playing';spawnEnemy({type:'soldier',v:0},20);const e=enemies[0];e.spd=0;const L={k:'outpost',st:'manned',x:e.x+1,z:e.z,P:lmModel('outpost'),c:0,r:0};LMS.push(L);const h0=e.hp;run(.2);ok('the repaired ballista shoots foes near the outpost',e.hp<h0);LMS.splice(LMS.indexOf(L),1);clean();}
  {meta.arena='whitewaste';const m=chestModel();ok('the chest is bound in ice',m&&m.g&&m.g.userData.land==='snow');}
  /* the milestone bosses */
  ok('Hollowmaw guards wave 100, the Rimebound Lich wave 200',bossFor(100).type==='hollowmaw'&&bossFor(100).milestone==='whitewaste100'&&bossFor(200).type==='rimelich'&&bossFor(200).milestone==='whitewaste200');
  {clean();state='playing';wave=100;const B=bossFor(100);spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul,ms:B.milestone},100);const e=enemies[enemies.length-1];e.dist=4;moveEnemy(e,0);run(.1);
   ok('Hollowmaw arrives with its body behind it on the road',e.ms==='whitewaste100'&&e.hmS&&e.hmS.length===7&&e.hmS.every(s=>s.parent===scene));
   e.msT=0;run(.2);const tw0={x:e.x,z:e.z,type:'archer',c:0,r:0};ok('it dives under the snow, where towers and heroes cannot target it',e.burrow&&!inRange(tw0,{range:6,air:true}).includes(e));
   run(3.2);ok('then it bursts out again',!e.burrow&&inRange(tw0,{range:6,air:true}).includes(e));
   const S=e.hmS;removeEnemy(e);ok('its body goes with it',!e.hmS&&S.every(s=>!s.parent));clean();}
  {clean();state='playing';wave=200;const B=bossFor(200);spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul,ms:B.milestone},200);const e=enemies[enemies.length-1];e.dist=6;moveEnemy(e,0);e.spd=0;
   e.lrT=0;run(.1);ok('the Lich raises the frozen dead around it',enemies.filter(q=>q.risen).length>=4);
   e.hp=e.maxHp*.45;run(.1);ok('at half health it hides in a phylactery of ice and raises more',e.msVeil===1&&e.shield>0&&!!e.bubble&&enemies.filter(q=>q.risen).length>=10);
   WWR.calm=0;e.shield=0;hurt(e,e.hp*3+10,'magic',{src:null});ok('when it falls the dead lie still for three waves',e.dead&&WWR.calm===3);WWR.calm=0;worldSlow=1;slowT=0;clean();}
  /* the Bestiary */
  ok('both bosses have their place in the Bestiary',['hollowmaw','rimelich'].every(t=>GAL_LIST.some(q=>q[0]===t)&&ENEMY_VARIANTS[t]&&EN_NOTE[t]));
  {galSetBiome('whitewaste');const b=$('#bGalBiome');ok('the Bestiary shows the Whitewaste variants',GAL_BIO==='whitewaste'&&(!b||/Whitewaste/.test(b.textContent)));galSetBiome('plains');}
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{try{worldSlow=1;slowT=0;WWR.calm=0;WWR.loot=0;state='menu';paused=false;clean();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);const c=$('#msbCard');if(c)c.classList.remove('on');const v=$('#vict');if(v)v.hidden=true;V200=false;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
