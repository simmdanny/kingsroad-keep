(function(){
/* Milestone bosses (v299): waves 100 and 200 of Frostvale and the Greywind Tundra.
   Run on the dev page: __kk.ev(await (await fetch('/tests/boss-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const go=(a,sd)=>{lsSet(KR,null);meta.arenas.snow=1;meta.arenas.tundra=1;meta.seenA.snow=1;meta.seenA.tundra=1;meta.mapIntro=0;meta.arena=a;state='menu';clearWorld();buildMap(sd||777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;for(const t of towers)if(t.iceT>0)msbThaw(t);};
const spawnB=(k,ms,w)=>{wave=w;spawnEnemy({type:k,v:0,hpMul:1,ms},w);const e=enemies[enemies.length-1];e.dist=8;moveEnemy(e,0);return e;};
const towerNear=(e,k)=>{let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const p=tw(c,r),d=(p.x-e.x)**2+(p.z-e.z)**2;if(d<bd){bd=d;best=[c,r];}}gold+=buildCost(k||'archer');placeTower(k||'archer',best[0],best[1]);return towers[towers.length-1];};
const run=(s)=>{for(let i=0;i<s/.05;i++){update(.05);updFx(.05);}};
try{
  /* who comes when */
  go('plains');ok('the Plains keep the Pale Elder at 100 and the Ophanim at 200',bossFor(100).type==='wyrm'&&bossFor(200).type==='ophanim'&&!bossFor(200).milestone);
  go('snow');ok('Frostvale: the Aurora Drake at 100, the Winter King at 200',bossFor(100).type==='auroradrake'&&bossFor(200).type==='winterking'&&bossFor(100).milestone==='snow100',bossFor(100).type+'/'+bossFor(200).type);
  ok('other boss waves are unchanged there',bossFor(90).type==='dragon3a'&&bossFor(150).type==='colossus');
  go('tundra');ok('the tundra: Irontusk at 100, the Greywind Roc at 200',bossFor(100).type==='irontusk'&&bossFor(200).type==='greywindroc',bossFor(100).type+'/'+bossFor(200).type);
  {const W=buildWave(100),b=W.q.find(q=>q.ms);ok('wave 100 carries the milestone boss, never an elite',W.boss&&b&&b.type==='irontusk'&&b.ms==='tundra100'&&!b.elite&&W.bossName==='Irontusk',W.bossName);}
  ok('the new bosses are in the Bestiary list with their stories',['auroradrake','winterking','irontusk','greywindroc'].every(k=>GAL_UNITS.includes(k)&&ENEMY_VARIANTS[k][0].d.length>60&&EN_NOTE[k]));
  ok('they wear their own looks (no snow or tundra re-skin)',['auroradrake','winterking','irontusk','greywindroc'].every(k=>!snowOk(k))&&snowOk('dragon'));
  /* the arrival: a title card and the bar */
  go('snow');clean();{const e=spawnB('auroradrake','snow100',100);const c=$('#msbCard');loreAnim(.016);const bar=$('#msbBar');
    ok('it arrives with a title card naming it and the wave',!!c&&c.classList.contains('on')&&c.textContent.includes('The Aurora Drake')&&c.textContent.includes('WAVE 100'),c?c.textContent.slice(0,60):'no card');
    ok('a health bar with its name at the top while it lives',!!bar&&!bar.hidden&&bar.textContent.includes('THE AURORA DRAKE'),bar?bar.textContent:'no bar');
    /* abilities: the breath freezes nearby towers, which stop firing, then thaw */
    const t=towerNear(e);e.msT=0;e.spd=0;moveEnemy(e,.016);ok('its breath freezes a tower near it',t.iceT>0&&!!t.iceM,t.iceT);
    const cd0=t.cd;towerUpdate(t,.5);ok('a frozen tower does not act',t.cd===cd0);run(3);ok('then it thaws and cannot be frozen again at once',!(t.iceT>0)&&!t.iceM&&t.iceImm>time);
    e.hp=e.maxHp*.45;moveEnemy(e,.016);ok('wounded, it wraps itself in an aurora shield',e.msVeil===1&&e.shield>0&&!!e.bubble);
    const g0=meta.gems,c0=meta.crowns,sp0=JSON.stringify(meta.spells)+'|'+meta.scraps;delete (meta.msb||{}).snow100;e.shield=0;hurt(e,e.hp*2+10,'magic',{src:null});
    ok('slain: slow motion and a milestone card',e.dead&&worldSlow<1&&slowT>0,worldSlow+' / '+slowT);
    ok('the first kill pays 75 gems and 75 crowns, no scroll, and wins the trophy (v323)',meta.gems-g0>=75&&meta.gems-g0<150&&meta.crowns===c0+75&&JSON.stringify(meta.spells)+'|'+meta.scraps===sp0&&meta.msb.snow100===1,(meta.gems-g0)+' gems, '+(meta.crowns-c0)+' crowns');
    run(1);const c2=$('#msbCard');ok('the milestone card names the fallen boss',!!c2&&c2.textContent.includes('is slain'),c2?c2.textContent.slice(0,80):'');
    loreAnim(.016);ok('the bar goes once it is gone',!$('#msbBar')||$('#msbBar').hidden);
    const g1=meta.gems,cr1=meta.crowns;const e2=spawnB('auroradrake','snow100',100);hurt(e2,e2.hp*3+10,'magic',{src:null});ok('a second kill pays a smaller reward and no crowns',meta.gems-g1===40&&meta.crowns===cr1&&meta.msb.snow100===2,(meta.gems-g1)+' gems');
    {delete meta.msb.snow200;const g2=meta.gems,c2=meta.crowns,R=msbReward({ms:'snow200'});ok('the first wave-200 kill pays 150 gems and 200 crowns and no scroll (v323)',meta.gems-g2===150&&meta.crowns-c2===200&&!R.lines.some(l=>/scroll/i.test(l)),(meta.gems-g2)+' gems, '+(meta.crowns-c2)+' crowns');}
    worldSlow=1;slowT=0;clean();}
  /* the Winter King: the stomp freezes up to three towers, and twice he calls his court */
  go('snow');clean();{const e=spawnB('winterking','snow200',200);e.spd=0;const t=towerNear(e);e.msT=0;moveEnemy(e,.016);ok('his stomp is wound up (he stops and raises the hammer)',e.g.userData.stomp>0&&e.stunT>0);
    for(const q of towers)q.iceT=0;const n0=enemies.length;e.hp=e.maxHp*.6;moveEnemy(e,.016);ok('at two thirds of his health he calls three knights',enemies.length-n0===3&&enemies.slice(-3).every(q=>q.type==='knight'),enemies.length-n0);
    e.hp=e.maxHp*.3;moveEnemy(e,.016);ok('and again at one third',enemies.length-n0===6);clean();}
  /* Irontusk: charges with each gust, sheds its plates when wounded */
  go('tundra');clean();{const e=spawnB('irontusk','tundra100',100);const o=spawnB('soldier',null,100);o.route=e.route;o.dist=e.dist+.3;moveEnemy(o,0);GUST.on=0;moveEnemy(e,.016);GUST.on=TUN.dur;e.chargeT=0;moveEnemy(e,.016);
    ok('a Greywind gust sends Irontusk charging, and the foes beside it',e.chargeT>1.5&&o.chargeT>.5,e.chargeT.toFixed(2)+' / '+(o.chargeT||0).toFixed(2));GUST.on=0;
    const a0=e.armor;e.hp=e.maxHp*.45;moveEnemy(e,.016);ok('wounded, its iron plates crack off (less armour)',e.msPl===1&&e.armor<a0-.2&&e.refs&&e.refs.plates&&!e.refs.plates.visible,a0+' > '+e.armor);clean();}
  /* the Greywind Roc: gusts far more often while it lives, stuns towers, and its death silences the wind */
  go('tundra');clean();{const e=spawnB('greywindroc','tundra200',200);e.spd=0;GUST.on=0;GUST.t=30;moveEnemy(e,.016);ok('while the Roc lives the gusts come every 12 s at most',GUST.t<=12,GUST.t);
    const t=towerNear(e);e.msT=0;moveEnemy(e,.016);ok('its lightning stuns a tower',t.iceT>0&&t.iceT<=1.5);
    hurt(e,e.hp*3+10,'magic',{src:null});ok('slain, the Greywind falls silent for five waves',GUST_CALM===5);
    GUST.t=0;GUST.on=0;gustTick(1);ok('no gust while it is silent',GUST.on===0);
    for(let i=0;i<5;i++)lmWaveClear(201+i);ok('it stirs again after five waves',GUST_CALM===0);
    GUST_CALM=3;const sv=JSON.parse(JSON.stringify(serializeRun()));ok('the silence is saved with the run',sv.gcalm===3);GUST_CALM=0;worldSlow=1;slowT=0;clean();}
  /* the Kingsroad's own milestones pay a first-kill reward too (v327) */
  {go('plains');clean();delete (meta.msb||{}).plains100;state='playing';const B=bossFor(100);spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul},100);const e=enemies[enemies.length-1];e.dist=8;moveEnemy(e,0);
   const g0=meta.gems,c0=meta.crowns;e.shield=0;hurt(e,e.hp*3+10,'magic',{src:null});ok('the Pale Elder, first slain on the Kingsroad: 75 gems and 75 crowns',e.dead&&meta.gems-g0>=75&&meta.crowns-c0===75&&meta.msb.plains100===1,(meta.gems-g0)+' gems, '+(meta.crowns-c0)+' crowns');
   spawnEnemy({type:B.type,v:B.v,hpMul:B.hpMul},100);const e2=enemies[enemies.length-1];e2.dist=8;moveEnemy(e2,0);const g1=meta.gems,c1=meta.crowns;e2.shield=0;hurt(e2,e2.hp*3+10,'magic',{src:null});
   ok('slain again: no milestone reward',e2.dead&&meta.crowns===c1&&meta.gems-g1<75&&meta.msb.plains100===2,(meta.gems-g1)+' gems');
   delete meta.msb.plains200;const g2=meta.gems,c2=meta.crowns;ok('the Ophanim at wave 200: 150 gems and 200 crowns',plainsBossReward({wv:200,type:'ophanim'})&&meta.gems-g2===150&&meta.crowns-c2===200);worldSlow=1;slowT=0;clean();}
  /* the victory screen names the right boss */
  {const src=[...document.scripts].map(q=>q.textContent).join('');ok('the victory screen names the Winter King and the Roc',src.includes('The Winter King falls')&&src.includes('The Greywind Roc falls'));}
  /* the Bestiary: a page of their own, built, each in its slot and fitted to its pedestal (v300) */
  {const L=GAL_LIST.filter(q=>MSB_T.has(q[0]));const gal=buildGallery();const it=gal.items.filter(q=>MSB_T.has(q.type));let fit=true;for(const q of it){q.m.g.updateMatrixWorld(true);const sz=new THREE.Box3().setFromObject(q.m.g).getSize(new THREE.Vector3());if(Math.max(sz.x,sz.z)>2.15)fit=false;}scene.remove(gal.g);$('#galLabels').innerHTML='';
    const nMs=typeof highlandsBoard==='function'?10:8;ok('the milestone bosses have their places in the Bestiary (a fifth page; six since the Whitewaste; the taiga wolf and two bosses on a sixth since v356; the Highlands pair below them since v418)',L.length===nMs&&it.length===nMs&&galPages()===6&&L.every(q=>q[1]>GALX+4*GAL_PAGE_W-4)&&['mossback','leshy'].every(t=>L.find(q=>q[0]===t)[1]>GALX+5*GAL_PAGE_W-4),L.map(q=>q[0]).join(','));ok('and fit their pedestals',fit);}
  /* the world map: soft weights, sites still in their own land, glyphs mingling near borders (v300) */
  {let sum=true;for(let i=0;i<40;i++){const w=wmpBioSoft(rnd(),rnd());let t=0;for(const k in w)t+=w[k];if(Math.abs(t-1)>1e-4)sum=false;}ok('the soft biome weights add up',sum);
    ok('every keep still stands in its own land',Object.keys(WMP.sites).every(k=>{const S=WMP.sites[k],w=wmpBioSoft(S.u,S.v),top=wmpTop(S.u,S.v);return w[top]>.8;}));
    let mixed=0,n=0;for(let i=0;i<4000;i++){const u=.1+rnd()*.8,v=.1+rnd()*.8;const w=wmpBioSoft(u,v),vals=Object.values(w).sort((a,b)=>b-a);if(vals[0]<.7){n++;if(wmpBioPick(u,v,rnd())!==wmpTop(u,v))mixed++;}}
    ok('near the borders glyphs from the neighbouring land mingle in',n>100&&mixed>n*.15,mixed+' of '+n);}
  /* all four render and fight without errors */
  {let err='';try{for(const[l,k,w]of[['snow','auroradrake',100],['snow','winterking',200],['tundra','irontusk',100],['tundra','greywindroc',200]]){go(l);clean();towerNear({x:0,z:0},'cannon');const e=spawnB(k,l+w,w);towers.forEach(t=>t.cd=0);run(4);renderer.render(scene,camera);}}catch(x){err=x.message;}
    ok('each boss walks, fights and renders without errors',!err,err);}
  /* v305: the left wings are true mirror images of the right ones (they used to be turned half round, feathers in front) */
  for(const k of['greywindroc','auroradrake']){const m=enemyModel(k,0);if(m.tick)m.tick(.7,.6,0);m.g.updateMatrixWorld(true);let bad=0,n=0;const W=[];m.b.traverse(o=>{if(o.isGroup&&o.children[0]&&o.children[0].isGroup&&o.children[0].children.length>5&&o.parent===m.b)W.push(o);});
    for(let i=0;i+1<W.length;i+=2){const A=new THREE.Box3().setFromObject(W[i]),B=new THREE.Box3().setFromObject(W[i+1]);n++;if(Math.abs(A.min.z-B.min.z)>.01||Math.abs(A.max.z-B.max.z)>.01||Math.abs(A.min.x+B.max.x)>.01)bad++;}
    ok('the '+EN[k].nm.toLowerCase()+' spreads its wings as mirror images',n>0&&!bad,n+' pairs, '+bad+' wrong');}
  /* v305: developer mode opens the whole Bestiary, these bosses included, and gives the real one back */
  {const d0=JSON.stringify(meta.dex||{}),dv=meta.dev,sn=meta.devSnap;meta.dev=false;delete meta.devSnap;meta.dex={};meta.dev=true;devEnable();const all=dexCount()===dexTotal()&&['auroradrake','winterking','irontusk','greywindroc'].every(t=>dexType(t));
    meta.dev=false;devDisable();const back=!Object.keys(meta.dex||{}).length;meta.dex=JSON.parse(d0);meta.dev=dv;if(sn)meta.devSnap=sn;ok('developer mode unlocks the whole Bestiary, the milestone bosses too, and gives it back',all&&back);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{worldSlow=1;slowT=0;GUST_CALM=0;state='menu';paused=false;clean();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);const c=$('#msbCard');if(c)c.classList.remove('on');buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
