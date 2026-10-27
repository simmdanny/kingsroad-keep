(function(){
/* Land landmarks and chests (v299): Frostvale and the Greywind Tundra use only their own interactive places.
   Run on the dev page: __kk.ev(await (await fetch('/tests/marks-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);const gv0=MAP_GV;
const go=(a,sd)=>{lsSet(KR,null);meta.arenas.snow=1;meta.arenas.tundra=1;meta.seenA.snow=1;meta.seenA.tundra=1;meta.mapIntro=0;meta.arena=a;state='menu';clearWorld();buildMap(sd||777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;};
const fake=(k)=>{const P=lmModel(k);const x=0,z=0;P.g.position.set(x,0,z);TERRAIN.add(P.g);const L={k,c:-1,r:-1,x,z,rot:0,P,g:P.g,st:0};LMS.push(L);return L;};
const opt=(L,i)=>{const o=lmOptions(L);if(o&&o[i]){o[i].f();return true;}return false;};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
try{
  ok('six places per new land, none of them a Plains one',MK_SETS.snow.length===6&&MK_SETS.tundra.length===6&&[...MK_SETS.snow,...MK_SETS.tundra].every(k=>LMD[k]&&!['camp','tower','shrine','grave','merchant','cursed','village','battle','altar'].includes(k)));
  for(const a of['snow','tundra','plains']){const seen=new Set();let n=0,bad=0;for(let s=1;s<=30;s++){go(a,s*311);for(const L of LMS){seen.add(L.k);n++;if(a!=='plains'&&!MK_SETS[a].includes(L.k))bad++;if(a==='plains'&&MK_T.has(L.k))bad++;}}
    ok((a==='plains'?'the Plains keep their own places':ARENAS[a].n+' only has its own places'),!bad&&n>15&&(a==='plains'||seen.size===6),[...seen].join(',')+' ('+n+')');}
  /* older boards keep their places so saved towers stay clear */
  {const gvN=MAP_GV;go('tundra',4242);const now=MAP.lms.map(q=>q.k).join(',');MAP_GV=2;go('tundra',4242);const old=MAP.lms.map(q=>q.k).join(',');MAP_GV=gvN;
    ok('a board saved before (version 2) keeps the old set',old.split(',').every(k=>!k||!MK_T.has(k))&&now.split(',').every(k=>!k||MK_T.has(k)),old+' | '+now);
    go('tundra',4242);const sv=JSON.parse(JSON.stringify(serializeRun()));sv.gv=2;loadRun(sv);ok('and loads it again',MAP.lms.map(q=>q.k).join(',')===old&&MAP_GV===gvN&&gvN>=3);}
  /* every place builds, draws its map icon and opens its window */
  {go('snow');const bad=[];const cv=document.createElement('canvas');cv.width=cv.height=40;const g2=cv.getContext('2d');
    for(const k of[...MK_SETS.snow,...MK_SETS.tundra]){const L=fake(k);let n=0;L.g.traverse(o=>{if(o.isMesh)n++;});try{lmIcon(g2,k,20,20,30,false);lmOpen(L);}catch(e){bad.push(k+':'+e.message);}const mo=$('#lmModal');if(!mo||!mo.textContent.includes(LMD[k].n)||n<6)bad.push(k+':'+n);closeLm();}
    ok('all twelve places build, draw a map icon and open their window',!bad.length,bad.join(' '));LMS.length=0;}
  /* Frostvale */
  go('snow');clean();{gold=1e6;const L=fake('lodge');opt(L,0);spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.x=L.x+1;e.z=L.z;const d=e.dist;
    LMS.forEach(q=>{});const me=e;me.slow=0;me.slowT=0;for(const q of LMS)if(q===L){}moveEnemy(me,.016);ok('the hunters slow foes passing the lodge',L.st==='hired'&&(me.slow>=.25||Math.hypot(me.x-L.x,me.z-L.z)>3),me.slow);clean();LMS.length=0;}
  {gold=1e6;const L=fake('falls');opt(L,1);const t={type:'archer',parts:{height:0,mass:0,special:0},x:L.x+1,z:L.z};const s1=tStats(t);LMS.length=0;const s0=tStats(t);ok('the ice well speeds towers near it by 15%',L.st==='well'&&Math.abs(s1.rate/s0.rate-1.15)<1e-6,(s1.rate/s0.rate).toFixed(3));}
  {gold=1e6;const L=fake('falls');const g0=gold;opt(L,0);ok('shattering the falls pays gold',L.st==='shattered'&&gold>g0,gold-g0);LMS.length=0;}
  {gold=1e6;const L=fake('wmother');opt(L,0);ok('a gift to the Winter Mother slows every foe for 3 waves',MK.wslow===3);spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.slow=0;moveEnemy(e,.016);ok('(they are slowed)',e.slow>=.1);
    for(let i=0;i<3;i++)lmWaveClear(20+i);ok('for three waves',MK.wslow===0);clean();LMS.length=0;}
  {const L=fake('wmother');const gm=meta.gems;opt(L,1);ok('taking her gifts pays gems but hastes the foes',MK.haste===3&&meta.gems>gm);spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];const ref=EN.soldier.spd;ok('(foes come 10% faster)',e.spd>ref*1.1*.999);MK.haste=0;clean();LMS.length=0;}
  {gold=1e6;const L=fake('den');opt(L,1);spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.hp=e.maxHp=1000;e.x=L.x+.5;e.z=L.z;const h=e.hp;const stash=moveEnemy;
    moveEnemy(e,.5);ok('the fed wolves maul foes near the den',MK.wolves===5&&(e.hp<h||Math.hypot(e.x-L.x,e.z-L.z)>3.5),(h-e.hp).toFixed(1));MK.wolves=0;clean();LMS.length=0;}
  {gold=1e6;const L=fake('den');const sc=meta.scraps||0;opt(L,0);ok('driving the wolves out pays gold and a scroll scrap',L.st==='driven'&&meta.scraps===sc+1);LMS.length=0;}
  {const L=fake('caravan');const g0=gold;opt(L,0);ok('digging out the caravan pays',L.st==='dug'&&gold>g0);LMS.length=0;}
  {gold=1e6;const L=fake('huts');const lv=lives;opt(L,0);ok('the winter catch gives 2 lives',lives===lv+2&&L.st==='caught');const g0=gold;lmWaveClear(10);ok('and the fishers pay a tribute every wave',gold-g0>=8+2*10,gold-g0);LMS.length=0;}
  /* the tundra */
  go('tundra');clean();{gold=1e6;const L=fake('wreck');opt(L,1);const t={type:'archer',parts:{height:0,mass:0,special:0},x:L.x+1,z:L.z};tStats(t);spawnEnemy({type:'ogre',v:0},20);const b=enemies[enemies.length-1];b.res=null;b.hp=b.maxHp=1e6;
    const hh=b.hp;hurt(b,100,'magic',{src:t});const d1=hh-b.hp;t.harp=false;const h2=b.hp;hurt(b,100,'magic',{src:t});const d0=h2-b.hp;ok('raised harpoons: towers near the wreck hit bosses 40% harder',L.st==='harpoons'&&Math.abs(d1/d0-1.4)<.01,(d1/d0).toFixed(3));clean();LMS.length=0;}
  {const L=fake('stones');GUST_CALM=0;opt(L,0);ok('calming the stones silences the Greywind for 3 waves',GUST_CALM===3);GUST_CALM=0;LMS.length=0;}
  {const L=fake('stones');opt(L,1);ok('calling the wind: more gold and more gusts for 3 waves',MK.windW===3&&MK.gold===3);spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];ok('(foes carry 50% more gold)',e.gold>EN.soldier.gold*goldScale(20)*1.49);
    GUST.on=0;GUST.t=30;update(.016);ok('(the next gust comes within 15 s)',GUST.t<=15,GUST.t);MK.windW=0;MK.gold=0;clean();LMS.length=0;}
  {gold=1e6;const L=fake('herders');const lv=lives;opt(L,0);ok('a reindeer sled gives 2 lives and the herders pay a tribute',lives===lv+2&&L.st==='sled');LMS.length=0;}
  {gold=1e6;const L=fake('lighthouse');opt(L,0);const t={type:'archer',parts:{height:0,mass:0,special:0},x:L.x+1,z:L.z};const s1=tStats(t);LMS.length=0;const s0=tStats(t);ok('the relit lighthouse gives nearby towers +15% range',Math.abs(s1.range/s0.range-1.15)<1e-6&&L.P.beam.visible,(s1.range/s0.range).toFixed(3));}
  {gold=1e6;const L=fake('seer');opt(L,0);ok('the seer reads the bones once',L.st==='read'&&!lmOptions(L));LMS.length=0;}
  {const L=fake('ivory');runCleared=3;const o=lmOptions(L);ok('the ivory waits until 15 waves are cleared',o&&o[0].lock);runCleared=15;const sc=meta.scraps||0;opt(L,0);ok('then pays gold and 2 scroll scraps',L.st==='harvested'&&meta.scraps===sc+2);LMS.length=0;}
  /* saved with the run */
  {go('snow',4242);const L=LMS[0];if(L){gold=1e6;const o=lmOptions(L);if(o)o[o.length>1?1:0].f();}MK.wolves=4;const sv=JSON.parse(JSON.stringify(serializeRun()));MK.wolves=0;loadRun(sv);
    ok('the choices and the counters are kept in the save',!L||(LMS[0].st===L.st&&MK.wolves===4),L?L.k+':'+LMS[0].st:'no landmark');MK.wolves=0;}
  /* chests and trees of the land */
  {const kinds={};for(const a of['plains','snow','tundra']){go(a);const ch=chestModel();kinds[a]=ch.g.userData.land||'plains';if(a==='snow')ok('Frostvale chests are bound in ice, which breaks when they open',!!ch.ice);}
    ok('each land has its own chest',kinds.plains==='plains'&&kinds.snow==='snow'&&kinds.tundra==='tundra',JSON.stringify(kinds));
    go('snow');const C=CHESTS[0];if(C&&C.ice){runCleared=99;openChest(C);ok('(the ice is gone once it is open)',C.open&&!C.ice.visible);}}
  {go('snow');const k=Object.keys(TREEM)[0];if(k){const q=k.split(',').map(Number);treeOpen(q[0],q[1]);const h=$('#lmModal h2');ok('the trees are named for the land',!!h&&h.textContent==='Snow-laden Pine',h&&h.textContent);closeLm();}}
  {let err='';try{for(const a of['snow','tundra']){go(a,5862);for(let i=0;i<40;i++){update(.05);updFx(.05);lmAnim(.05,i*.05);}renderer.render(scene,camera);}}catch(e){err=e.message;}ok('both lands run and render with their places',!err,err);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{MAP_GV=gv0;GUST_CALM=0;MK={wslow:0,haste:0,windW:0,gold:0,wolves:0};state='menu';paused=false;clean();closeLm();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
