(function(){
/* Artifacts checks (v318): data, sockets and their unlocks, which artifacts are in play, the damage rules, the Invisible modifier and the Weakened
   status, the kill effects, the recasts, the every-100-waves drop and its rarity table, save repair and the Artifacts screen.
   Run on the dev page: __kk.ev(await (await fetch('/tests/artifacts-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;fx.slice().forEach(f=>{f.life=0;});updFx(.001);};
const play=()=>{meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;meta.scrAuto=false;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const foe=(d,hp,type)=>{spawnEnemy({type:type||'soldier'},5);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=0;e.maxHp=e.hp=hp||1e6;e.spd=0;e.res={};e.armor=0;e.shield=0;moveEnemy(e,0);return e;};
const setArts=L=>{meta.arts.eq[heroU.hero]=L.concat([null,null,null]).slice(0,3);L.forEach(k=>{if(k)meta.arts.own[k]=1;});ART_V++;};
const run=sec=>{for(let i=0;i<sec/.05;i++){update(.05);updFx(.05);}};
try{
  meta.dev=false;meta.arts={own:{},eq:{},pend:[]};meta.wonA={};
  /* data */
  {const per={};ARTS.forEach(a=>{const k=a.el+'/'+a.r;per[k]=(per[k]||0)+1;});
    ok('one artifact per element at each rarity, Common to Mythic (six elements since v355)',ARTS.length===36&&Object.keys(per).length===36&&['fire','ice','lightning','light','dark','nature'].every(el=>ART_RAR.every(r=>per[el+'/'+r]===1)),ARTS.length);
    ok('every artifact has a glyph, an effect and a lore line',ARTS.every(a=>ART_G[a.id]&&a.d&&a.l&&a.n));
    ok('the drop table rows each add up to 100%',ART_DROP.length===5&&ART_DROP.every(r=>r.reduce((x,y)=>x+y,0)===100));}
  /* sockets */
  ok('one socket from the start',artSlots()===1);meta.wonA.snow=1;ok('the second opens with wave 200 in Frostvale',artSlots()===2);meta.wonA.tundra=1;ok('the third with wave 200 in the Greywind Tundra',artSlots()===3);
  meta.wonA={tundra:1};ok('each land opens one socket',artSlots()===2);meta.wonA={};
  play();const H=heroU.hero,other=HEROES.find(h=>h.id!==H).id;meta.owned[other]=true;
  meta.arts.own.emberchip=1;meta.arts.own.frostpearl=1;
  ok('a locked socket takes nothing',!artPut('frostpearl',H,1)&&!artEq(H)[1]);
  ok('an artifact goes into an open socket',artPut('emberchip',H,0)&&artEq(H)[0]==='emberchip'&&artOn('emberchip'));
  ok('one artifact, one hero: placing it on another takes it off the first',artPut('emberchip',other,0)&&artEq(other)[0]==='emberchip'&&!artEq(H).includes('emberchip')&&!artOn('emberchip'));
  ok('only the battle hero’s artifacts are in play',!artActive().has('emberchip'));
  meta.arts.eq={};meta.arts.eq[H]=[null,'emberchip',null];ART_V++;ok('a socket that is not open does not count',!artOn('emberchip'));
  meta.wonA.snow=1;meta.wonA.tundra=1;
  /* damage rules */
  {clean();setArts(['emberchip','rimeband']);const a=foe(6),b=foe(6.6);hurt(a,100,'true',{src:heroU,el:'fire',spell:'t'});hurt(b,100,'true',{src:heroU,el:'ice',spell:'t'});
    const da=a.maxHp-a.hp,db=b.maxHp-b.hp;ok('Ember Chip: +10% fire damage, nothing for other elements',Math.abs(da-110)<.5&&Math.abs(db-100)<.5,da.toFixed(1)+' / '+db.toFixed(1));
    const c=foe(7.2),c2=foe(7.4);c.chillT=3;c2.chillT=3;hurt(c,100,'true',{src:heroU,el:'light',spell:'t',noReact:true});hurt(c2,100,'true',{src:null});ok('Rime Band: chilled foes take 15% more from the hero’s spells, nothing more from other hits (v325)',Math.abs(c.maxHp-c.hp-115)<.5&&Math.abs(c2.maxHp-c2.hp-100)<.5,(c.maxHp-c.hp).toFixed(1)+' / '+(c2.maxHp-c2.hp).toFixed(1));
    const w=foe(7.8);artWeaken(w,4);hurt(w,100,'true',{src:null});ok('Weakened: 15% more damage taken',Math.abs(w.maxHp-w.hp-115)<.5,(w.maxHp-w.hp).toFixed(1));
    run(.1);ok('Weakened: 15% slower while it lasts',w.slow>=.15&&w.slowT>0);run(4.2);ok('Weakened wears off',!(w.weakT>0));}
  /* Invisible */
  {clean();setArts([]);const e=foe(6);e.elites=['invisible'];e.invis=true;e.revealT=0;invisLook(e,true);
    const near=(type)=>{const p=tw(0,0);return{type,x:e.x+.5,z:e.z+.3,c:0,r:0};};
    ok('an Archer Tower cannot target an Invisible foe',!inRange(near('archer'),{range:3,air:true}).includes(e));
    ok('nor can a cannon, a ballista or a spear',['cannon','ballista','spear'].every(t=>!inRange(near(t),{range:3,air:true}).includes(e)));
    ok('a Wizard Tower can',inRange(near('mage'),{range:3,air:true}).includes(e));
    e.revealT=2;ok('a revealed foe can be targeted by anything',inRange(near('archer'),{range:3,air:true}).includes(e));e.revealT=0;
    ok('the Invisible foe looks like a ghost',e.ghostOn&&e.ghostL.length>0&&e.ghostL.every(([m])=>m.material.transparent&&m.material.opacity<.3));
    setArts(['choirbell']);hurt(e,1,'magic',{src:heroU,el:'light',spell:'t'});ok('Choir Bell: light reveals and weakens it',e.revealT>3&&e.weakT>3);statusTick(e,.05);ok('revealed, it looks solid again',!e.ghostOn);
    clean();setArts([]);const e2=foe(6);e2.elites=['invisible'];e2.invis=true;e2.revealT=0;const tb={type:'bell',x:e2.x+.6,z:e2.z,c:0,r:0,parts:{mass:0,height:0,special:0}};towers.push(tb);ART_BELL=-9;comboTick(.05);towers.splice(towers.indexOf(tb),1);
    ok('a Bell Tower’s toll reveals Invisible foes around it',e2.revealT>0);}
  {clean();let early=0,boss=0;for(let i=0;i<40;i++){spawnEnemy({type:'soldier',elite:'invisible'},12);if((enemies[enemies.length-1].elites||[]).includes('invisible'))early++;}
    const bt=Object.keys(EN).find(k=>EN[k].boss);for(let i=0;i<10;i++){spawnEnemy({type:bt,elite:'invisible'},120);if((enemies[enemies.length-1].elites||[]).includes('invisible'))boss++;}clean();
    let late=0;for(let i=0;i<60;i++){spawnEnemy({type:'soldier',elite:'invisible'},60);if((enemies[enemies.length-1].elites||[]).includes('invisible'))late++;}clean();
    ok('Invisible never comes before wave 21 or on a boss (v340)',!early&&!boss,early+' early, '+boss+' bosses');ok('after wave 20 it is kept rarer than the rest',late>15&&late<50,late+' of 60 kept');
    let w20=0,w21=0;for(let i=0;i<60;i++){spawnEnemy({type:'soldier',elite:'invisible'},20);if((enemies[enemies.length-1].elites||[]).includes('invisible'))w20++;spawnEnemy({type:'soldier',elite:'invisible'},21);if((enemies[enemies.length-1].elites||[]).includes('invisible'))w21++;}clean();
    ok('none at wave 20, some from wave 21 (v340)',!w20&&w21>10,w20+' / '+w21);}
  /* kill effects */
  {clean();setArts(['gravepact']);const e=foe(6,10);e.gold=10;const g0=gold;hurt(e,100,'magic',{src:heroU,el:'dark',spell:'t'});const dg=gold-g0;
    const e2=foe(6,10);e2.gold=10;const g1=gold;hurt(e2,100,'magic',{src:heroU,el:'fire',spell:'t'});const fg=gold-g1;ok('Grave Pact: dark kills drop double gold, other kills do not',fg>0&&Math.abs(dg/fg-2)<.01,dg.toFixed(1)+' vs '+fg.toFixed(1));}
  {clean();setArts(['shattershard','cinderheart']);const a=foe(6,10),b=foe(6.3),c=foe(6.6);a.chillT=3;applyBurn(a,1,5,{src:null});hurt(a,100,'magic',{src:heroU,el:'ice',spell:'t'});
    ok('Shatter Shard and Cinder Heart hurt the foes beside a chilled, burning foe that dies',b.hp<b.maxHp&&c.hp<c.maxHp);}
  {clean();setArts(['cinderheart','shattershard']);const L=[];for(let i=0;i<12;i++){const e=foe(6+i*.08,1000);e.hp=5;e.chillT=3;applyBurn(e,1,5,{src:null});L.push(e);}const k0=kills,g0=gold;hurt(L[0],100,'magic',{src:heroU,el:'fire',spell:'t'});run(.5);
    ok('a chain of blasts kills each foe only once (v319); blasts do not set off more blasts (v325)',kills-k0>=2&&kills-k0<=12&&L.every(e=>e.dead||e.hp>0),(kills-k0)+' kills of 12');}
  {clean();setArts(['winterking']);const a=foe(6,10);foe(6.4);hurt(a,100,'magic',{src:heroU,el:'ice',spell:'t'});ok('Heart of the Winter King: an ice kill leaves a statue',ART_N.statue===1);run(3);ok('the statue shatters after 2.5s',ART_N.statue===0);}
  {clean();setArts(['shadelantern']);const a=foe(6,10),b=foe(5);hurt(a,100,'magic',{src:heroU,el:'dark',spell:'t'});ok('Shade Lantern: a dark kill raises a shade',ART_N.shade===1);run(2.5);ok('the shade strikes the foes it passes',b.hp<b.maxHp);}
  {clean();setArts(['plaguemark']);const a=foe(6,10),b=foe(6.5);a.wither={t:3,dps:5,o:{}};hurt(a,100,'magic',{src:heroU,el:'fire',spell:'t'});ok('Plague Mark: the wither leaps on when its foe dies',b.wither&&b.wither.t>0);ok('Plague Mark: and leaves that foe Weakened (v322)',b.weakT>0);}
  /* v322 balance */
  {clean();setArts(['conductorring']);const a=foe(6),b=foe(6.5);for(let i=0;i<300;i++)hurt(a,100,'true',{src:heroU,el:'lightning',spell:'t'});const d=b.maxHp-b.hp,n=d/35;
    ok('Conductor’s Ring: about a third of lightning hits leap, for 35% of the hit (v322)',n>=70&&n<=140&&Math.abs(n-Math.round(n))<.01,n.toFixed(1)+' leaps of 300');}
  {clean();setArts(['emberchip']);const a=foe(6),b=foe(6.5),c=foe(7),d=foe(7.5);hurt(a,100,'true',{src:heroU,el:'fire',spell:'t'});hurt(b,100,'true',{src:heroU,el:'fire'});hurt(c,100,'true',{src:{type:'catapult'},el:'fire'});hurt(d,100,'true',ART_O('fire'));
    ok('artifacts act only on the hero’s spells: not its own attacks, towers or their own blasts (v325)',Math.abs(a.maxHp-a.hp-110)<.5&&Math.abs(b.maxHp-b.hp-100)<.5&&Math.abs(c.maxHp-c.hp-100)<.5&&Math.abs(d.maxHp-d.hp-100)<.5,[a,b,c,d].map(q=>(q.maxHp-q.hp).toFixed(0)).join(' '));
    clean();setArts(['gravepact']);const e=foe(6,10);e.gold=10;const g0=gold;hurt(e,100,'magic',{src:heroU,el:'dark'});const dg=gold-g0;const e2=foe(6,10);e2.gold=10;const g1=gold;hurt(e2,100,'magic',{src:heroU,el:'dark',spell:'t'});const sg=gold-g1;
    ok('a kill by the hero’s own attack sets off no kill effect, a spell kill does',Math.abs(sg/dg-2)<.01,dg.toFixed(1)+' vs '+sg.toFixed(1));}
  {clean();setArts(['winterking']);const a=foe(6);hurt(a,100,'true',{src:heroU,el:'ice',spell:'t'});ok('Heart of the Winter King: +15% ice damage (v322)',Math.abs(a.maxHp-a.hp-115)<.5,(a.maxHp-a.hp).toFixed(1));
    clean();const k=foe(6,10),b=foe(6.4);hurt(k,100,'magic',{src:heroU,el:'ice',spell:'t'});const h0=b.maxHp-b.hp;run(3);ok('the statue shatters for 300% of your hero’s power around it',(b.maxHp-b.hp)-h0>=artP()*3*.95,((b.maxHp-b.hp)-h0).toFixed(0)+' vs '+(artP()*3).toFixed(0));}
  {clean();setArts(['wintersgrip']);const a=foe(6),L=[foe(6.2),foe(6.4),foe(6.6),foe(6.8)];a.chillT=3;hurt(a,100,'true',{src:heroU,el:'ice',spell:'t'});const hit=L.filter(q=>Math.abs(q.maxHp-q.hp-25)<.5).length;
    ok('Winter’s Grip: an ice hit on a chilled foe bursts 25% of it into up to 3 foes around (v322)',hit===3&&L.filter(q=>q.chillT>0).length>=3,hit+' hit');}
  {clean();setArts(['glacierrune']);ART_GLA=-9;const a=foe(6);hurt(a,100,'true',{src:heroU,el:'ice',spell:'t'});const h0=a.maxHp-a.hp;for(let i=0;i<2;i++){ART_GT=-9;comboTick(.05);}
    ok('Glacier Rune: the frozen ground hurts foes standing on it (v322)',(a.maxHp-a.hp)-h0>=artP()*.08*2*.95,((a.maxHp-a.hp)-h0).toFixed(1));}
  {clean();setArts(['hexednail']);const a=foe(6);let n=0;for(let i=0;i<300;i++){a.weakT=0;hurt(a,1,'true',{src:heroU,el:'dark',spell:'t'});if(a.weakT>0)n++;}ok('Hexed Nail: about a fifth of dark hits leave the foe Weakened (v322)',n>=35&&n<=95,n+' of 300');}
  {clean();let early=0,kept=0,tot=0,boss=0;for(let k=0;k<40;k++){const W=buildWave(20);W.q.forEach(it=>{if(it.elite&&[].concat(it.elite).includes('invisible'))early++;});}
    for(let k=0;k<40;k++){const W=buildWave(120);W.q.forEach(it=>{if(!it.elite||typeof it.type!=='string'||it.type[0]==='_')return;const inv=[].concat(it.elite).includes('invisible');if(inv){tot++;if(it.invOK)kept++;if(EN[it.type]&&EN[it.type].boss)boss++;}});}
    ok('Invisible is rolled with the wave: never before wave 21 or on a boss, and marked when kept (v322, v340)',!early&&!boss&&tot>0&&kept===tot,early+' early, '+boss+' bosses, '+kept+'/'+tot+' marked');
    let inv=0;for(let i=0;i<20;i++){spawnEnemy({type:'soldier',elite:'invisible',invOK:true},60);if(enemies[enemies.length-1].invis)inv++;}clean();ok('a foe rolled Invisible with its wave always comes Invisible',inv===20,inv+' of 20');
    ok('the next-wave preview no longer counts Invisible foes (v340)',!/invisible/.test(waveSummary({q:[{type:'soldier',elite:'invisible',invOK:true},{type:'soldier',elite:['swift','invisible'],invOK:true},{type:'soldier'}]})));
    const msgs=[],t0=toast;toast=(m,c)=>msgs.push(m);try{INVW.run=0;artInvWarn(2);artInvWarn(3);}finally{toast=t0;}
    ok('they are announced once a run, with how to see them, and never counted again (v340)',msgs.length===2&&/starting to appear/.test(msgs[0])&&/cannot see them/.test(msgs[1]),msgs.join(' / '));
    ok('a new run announces them again',(newGame(1),paused=true,INVW.run===0));play();
    ok('the Bestiary shows the Invisible modifier',ELITE_CYCLE.some(c=>c.length===1&&c[0]==='invisible'));}
  {clean();setArts(['abysseye']);const a=foe(6,10);artUndead(a);ok('Eye of the Abyss raises an undead soldier',ART_N.undead===1);clean();}
  /* recasts */
  {clean();setArts(['tempestheart']);const L=[foe(6),foe(6.3)];meta.spells.staticspark=meta.spells.staticspark||{lvl:1,hero:null};let n=0;const c0=castScrollNow2;castScrollNow2=function(k){if(k==='staticspark')n++;return c0.apply(this,arguments);};
    try{ART_TH=0;for(let i=0;i<5;i++)castScrollNow('staticspark',heroU,heroStats(),L,100,{src:heroU,el:'lightning',spell:'staticspark'});run(1);}finally{castScrollNow2=c0;}ok('Tempest Heart: the 5th lightning scroll is cast twice',n===6,n+' casts');}
  /* drops */
  {meta.arts.own={};const c=[0,0,0,0,0,0];for(let i=0;i<2000;i++){const r=artRoll(100);c[ART_RAR.indexOf(ART_BY[r[0]].r)]++;}
    const near=(i,p)=>Math.abs(c[i]/2000*100-p)<4;ok('wave 100 rolls follow the table (30/30/20/12/6/2)',near(0,30)&&near(1,30)&&near(2,20)&&near(3,12),c.map(x=>(x/20).toFixed(0)+'%').join(' '));
    const c5=[0,0,0,0,0,0];for(let i=0;i<2000;i++){const r=artRoll(700);c5[ART_RAR.indexOf(ART_BY[r[0]].r)]++;}ok('from wave 500 on: no Commons or Uncommons, a quarter Mythic',!c5[0]&&!c5[1]&&Math.abs(c5[5]/20-25)<4,c5.map(x=>(x/20).toFixed(0)+'%').join(' '));
    ARTS.forEach(a=>meta.arts.own[a.id]=1);const r=artRoll(100);ok('a drop is one artifact, and it can be one you already have (v324)',r.length===1&&!!ART_BY[r[0]]);meta.arts.own={};
    meta.arts.pend=[];lmWaveClear(150);ok('no artifact on wave 150',!meta.arts.pend.length);lmWaveClear(100);const P0=meta.arts.pend[0];
    ok('wave 100 gives one artifact, yours at once',meta.arts.pend.length===1&&P0&&P0.g===1&&!!ART_BY[P0.id]&&artOwned(P0.id)&&!P0.dup);
    meta.arts.pend=[];ARTS.forEach(a=>meta.arts.own[a.id]=1);meta.arts.scrap=0;artDrop(200);const P1=meta.arts.pend[0];
    ok('a duplicate turns into artifact scraps by rarity (v324)',P1&&P1.dup&&P1.sc===ART_SCRAP[ART_BY[P1.id].r]&&meta.arts.scrap===P1.sc,P1&&(P1.id+' '+P1.sc));
    {const o=document.getElementById('artOffer');if(o)o.remove();}/* a card left from the drops above */
    meta.arts.own={};meta.arts.pend=[];meta.equipped=H;meta.arts.eq={};meta.arts.pend.push(artGrant(100,'frostpearl'));state='menu';artOfferShow();const ov=document.getElementById('artOffer');
    ok('the drop goes into a free socket of the battle hero',artOwned('frostpearl')&&artEq(H)[0]==='frostpearl');
    ok('one card shows it, with nothing to choose',!!ov&&ov.querySelectorAll('.ao1-card').length===1&&!ov.querySelector('[data-pick]')&&/Frost Pearl/.test(ov.textContent));
    ov.querySelector('[data-aok]').click();ok('collecting closes the card',!meta.arts.pend.length&&!document.getElementById('artOffer'));
    {const o=document.getElementById('artOffer');if(o)o.remove();}meta.arts.own={};meta.arts.pend=[{w:100,o:['emberchip','frostpearl','sunstone']}];artOfferShow();const got=['emberchip','frostpearl','sunstone'].filter(k=>artOwned(k));const ov2=document.getElementById('artOffer');
    ok('an offer of three saved before v324 gives one of them at random',got.length===1&&!!ov2&&ov2.querySelectorAll('.ao1-card').length===1,got.join());if(ov2)ov2.querySelector('[data-aok]').click();
    meta.arts.scrap=7;state='menu';showOverlay('menu');goTab('heroes');artTab('arts');ok('the Artifacts tab shows the scraps',/7 SCRAP/.test(document.getElementById('archCount').textContent));artTab('heroes');}
  /* crafting (v327) */
  {ok('duplicates give 1/2/4/8/15/35 scraps, crafting costs 10/30/60/115/250/600',ART_RAR.map(r=>ART_SCRAP[r]).join()==='1,2,4,8,15,35'&&ART_RAR.map(r=>ART_CRAFT[r]).join()==='10,30,60,115,250,600');
   {const o=document.getElementById('artOffer');if(o)o.remove();}
   meta.arts.own={};meta.arts.pend=[];meta.arts.eq={};meta.equipped=H;meta.arts.scrap=50;state='menu';ok('not enough scraps: nothing happens',!artCraft('glacierrune')&&!artOwned('glacierrune')&&meta.arts.scrap===50);
   meta.arts.scrap=130;ok('crafting takes the scraps and gives the artifact, into a free socket',artCraft('glacierrune')&&artOwned('glacierrune')&&meta.arts.scrap===15&&artEq(H)[0]==='glacierrune');
   const ov=document.getElementById('artOffer');ok('a card says it was crafted',!!ov&&/Artifact crafted/.test(ov.textContent)&&/Glacier Rune/.test(ov.textContent));if(ov)ov.querySelector('[data-aok]').click();
   ok('an artifact you have cannot be crafted again',!artCraft('glacierrune')&&meta.arts.scrap===15);
   showOverlay('menu');goTab('heroes');artTab('arts');ART_FIL='all';renderArts();const unk=document.querySelectorAll('#artView .av-card.unk .av-craft');ok('the missing artifacts show what they cost to craft',unk.length===ARTS.length-1,unk.length);
   artModal('thunderking');const cb=document.querySelector('#amCard [data-craft]');ok('the card of a missing artifact offers to craft it',!!cb&&cb.disabled&&/600/.test(document.getElementById('amCard').textContent));artModal(null);artTab('heroes');}
  /* levels (v328) */
  {ok('every artifact has five levels',ARTS.every(a=>ART_LVD[a.id]&&ART_LVD[a.id].v.length===5)&&Object.keys(ART_UP).every(r=>ART_UP[r].length===4));
   meta.arts.own={emberchip:1,thunderking:1,conductorring:1,gravepact:1};meta.arts.lv={};meta.arts.scrap=30;
   ok('level 1 to start, and the text is the old one',artLv('emberchip')===1&&/\+10% fire damage/.test((artLvDesc(),ART_BY.emberchip.d)));
   let n=0;while(artUpgrade('emberchip'))n++;ok('a Common climbs to level 5 for 3+5+8+10 scraps, and no further',n===4&&artLv('emberchip')===5&&meta.arts.scrap===4,n+' upgrades, '+meta.arts.scrap+' left');
   ok('its text follows the level',/\+25% fire damage/.test(ART_BY.emberchip.d));
   ok('not enough scraps, or not yours: no upgrade',!artUpgrade('thunderking')&&!artUpgrade('frostpearl'));
   clean();setArts(['emberchip']);const a=foe(6);hurt(a,100,'true',{src:heroU,el:'fire',spell:'t'});ok('level 5 Ember Chip: +25% fire damage',Math.abs(a.maxHp-a.hp-125)<.5,(a.maxHp-a.hp).toFixed(1));
   meta.arts.lv.thunderking=3;let bolts=0;const sb=artSkyBolt;artSkyBolt=function(){bolts++;};try{clean();setArts(['thunderking']);const b=foe(6);ART_BOLT=-9;hurt(b,100,'true',{src:heroU,el:'lightning',spell:'t'});}finally{artSkyBolt=sb;}
   ok('level 3 Crown of the Thunder King calls 4 bolts',bolts===4&&/calls 4 more bolts/.test((artLvDesc(),ART_BY.thunderking.d)),bolts+' bolts');
   meta.arts.lv.conductorring=5;clean();setArts(['conductorring']);const c=foe(6),L=[foe(6.3),foe(6.6),foe(6.9),foe(7.2)];artConduct(c,100,tpos2(c));const hit=L.filter(q=>Math.abs(q.maxHp-q.hp-50)<.5).length;
   ok('level 5 Conductor’s Ring leaps to 3 foes for 50%',hit===3,hit+' hit');
   const gp=lv=>{meta.arts.lv.gravepact=lv;clean();setArts(['gravepact']);const g=foe(6,10);g.gold=10;const g0=gold;hurt(g,100,'magic',{src:heroU,el:'dark',spell:'t'});return gold-g0;};const gp1=gp(1),gp5=gp(5);ok('level 5 Grave Pact: triple gold (double at level 1)',gp1>0&&Math.abs(gp5/gp1-1.5)<.01,gp1.toFixed(1)+' / '+gp5.toFixed(1));
   const m=artFix({arts:{own:{},eq:{},pend:[],lv:{emberchip:9,nope:2,frostpearl:0}}});ok('levels are kept between 1 and 5 in a save',m.arts.lv.emberchip===5&&!('nope' in m.arts.lv)&&m.arts.lv.frostpearl===1);
   {const o=document.getElementById('artOffer');if(o)o.remove();}meta.arts.lv={thunderking:3};meta.arts.scrap=450;state='menu';showOverlay('menu');goTab('heroes');artTab('arts');ART_FIL='all';renderArts();
   const card=document.querySelector('#artView .av-card[data-art="thunderking"] .av-lv');ok('the collection shows the level',!!card&&card.textContent==='Lv 3');
   artModal('thunderking');const mc=document.getElementById('amCard');ok('the card shows the level, what the next brings and the upgrade',/Level 3/.test(mc.textContent)&&/calls 5 more bolts/.test(mc.textContent)&&!!mc.querySelector('[data-up]')&&/450/.test(mc.textContent));
   mc.querySelector('[data-up]').click();ok('upgrading from the card',artLv('thunderking')===4&&meta.arts.scrap===0&&/Level 4/.test(document.getElementById('amCard').textContent));artModal(null);artTab('heroes');meta.arts.lv={};}
  /* v335 Dawn Feather: mends the keep, +5 max lives a level */
  {const v0=ART_LVD.dawnfeather.v,eq0=JSON.stringify(meta.arts.eq),eqH=meta.equipped;try{
   ok('Dawn Feather levels: 4..8% chance, once a wave (twice at 5), +5..+25 max lives',JSON.stringify(v0)==='[[0.04,1,5],[0.05,1,10],[0.06,1,15],[0.07,1,20],[0.08,2,25]]'&&/max lives/.test((artLvDesc(),ART_BY.dawnfeather.d)));
   meta.arts.lv={};meta.equipped=H;meta.arts.eq[H]=[null,null,null];ok('without it the keep has 20 lives',keepMax()===20);
   setArts(['dawnfeather']);ok('level 1: 25 max lives',keepMax()===25);meta.arts.lv.dawnfeather=5;ok('level 5: 45 max lives',keepMax()===45);
   ART_LVD.dawnfeather.v=v0.map(q=>[1,q[1],q[2]]);meta.arts.lv.dawnfeather=1;clean();setArts(['dawnfeather']);lives=10;wave=37;DAWN.w=-1;
   const a=foe(6,10);hurt(a,100,'magic',{src:heroU,el:'light',spell:'t'});ok('a light spell kill mends the keep for 1 life',lives===11,lives);
   const b=foe(6,10);hurt(b,100,'magic',{src:heroU,el:'light',spell:'t'});ok('only once a wave at level 1',lives===11,lives);
   wave=38;const c=foe(6,10);hurt(c,100,'magic',{src:heroU,el:'fire',spell:'t'});ok('not on a fire kill',lives===11,lives);
   meta.arts.lv.dawnfeather=5;ART_V++;wave=39;for(let i=0;i<4;i++){const q=foe(6,10);hurt(q,100,'magic',{src:heroU,el:'light',spell:'t'});}ok('twice a wave at level 5',lives===13,lives);
   lives=45;wave=40;{const q=foe(6,10);hurt(q,100,'magic',{src:heroU,el:'light',spell:'t'});}ok('never above the max',lives===45,lives);
   meta.arts.lv.dawnfeather=2;ART_V++;ok('a run with it starts with the extra lives (30 at level 2)',(newGame(1),paused=true,lives===30),lives);
  }finally{ART_LVD.dawnfeather.v=v0;meta.arts.eq=JSON.parse(eq0);meta.equipped=eqH;meta.arts.lv={};ART_V++;clean();play();}}
  /* v341: your artifacts in battle, to look at only */
  {const eq0=JSON.stringify(meta.arts.eq),own0=JSON.stringify(meta.arts.own),lv0=JSON.stringify(meta.arts.lv||{});try{
   play();meta.arts.own=Object.assign({},meta.arts.own,{thunderking:1,emberchip:1});meta.arts.lv={thunderking:3};meta.arts.eq[heroU.hero]=['thunderking','emberchip',null];ART_V++;APK.sig='';updHud();
   const hb=document.getElementById('artHud');ok('in a run, the equipped artifacts show under the top buttons with their level',!!hb&&hb.querySelectorAll('.ah-i').length===2&&/3/.test(hb.textContent));
   hb.click();const pk=document.getElementById('artPeek');ok('tapping them opens a card with their names, levels and powers, and the game pauses',!!pk&&/Crown of the Thunder King/.test(pk.textContent)&&/Level 3/.test(pk.textContent)&&/calls 4 more bolts/.test(pk.textContent)&&/Socket 3: empty/.test(pk.textContent)&&paused===true);
   ok('nothing can be changed there: only Close',!!pk&&[...pk.querySelectorAll('button')].every(b=>b.dataset.apx));if(pk)pk.querySelector('[data-apx]').click();ok('and it closes',!document.getElementById('artPeek'));
   sel=heroU;refreshSheet(true);const row=document.querySelector('#sheet .apk-row');ok('the hero sheet has an Artifacts row with them',!!row&&row.querySelectorAll('.apk-mi').length===2);sel=null;if(typeof closeSheet==='function')closeSheet();
   meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;updHud();ok('with nothing equipped there are no icons',!document.getElementById('artHud'));
   meta.arts.eq[heroU.hero]=['thunderking',null,null];ART_V++;updHud();state='menu';showOverlay('menu');ok('and none in the menu',!document.getElementById('artHud'));
  }finally{meta.arts.eq=JSON.parse(eq0);meta.arts.own=JSON.parse(own0);meta.arts.lv=JSON.parse(lv0);ART_V++;{const o=document.getElementById('artPeek');if(o)o.remove();}play();}}
  /* saves */
  {const m=artFix({arts:{own:{emberchip:1},eq:{robin:['emberchip','nope','frostpearl'],x:7},pend:'bad'}});ok('a damaged save is repaired (scraps too)',artFix({arts:{scrap:'x'}}).arts.scrap===0&&m.arts.eq.robin[0]==='emberchip'&&m.arts.eq.robin[1]===null&&m.arts.eq.robin[2]===null&&Array.isArray(m.arts.pend)&&Array.isArray(m.arts.eq.x));
    ok('an old save gets an empty collection',(()=>{const m2=migrateMeta({});return m2.arts&&m2.arts.own&&Object.keys(m2.arts.own).length===0;})());ok('developer mode puts the real collection back when it is switched off',!!DEV_KEYS.arts);}
  /* the screen */
  {meta.arts.own={};meta.arts.own.emberchip=1;meta.arts.own.frostpearl=1;state='menu';showOverlay('menu');goTab('heroes');archSel=H;ART_HERO=H;artTab('arts');const v=document.getElementById('artView');
    ok('Heroes / Artifacts switch: the Artifacts view shows',v&&!v.hidden&&document.getElementById('heroDetail').style.display==='none');
    ok('it lists every artifact, hiding the powers of those not found',v.querySelectorAll('.av-card').length===ARTS.length&&v.querySelectorAll('.av-card.unk').length===ARTS.length-2&&/hidden until it is found/.test(v.textContent));
    ok('the chamber: three sockets under a shaft of light, above a pedestal (v320)',v.querySelectorAll('.avc .avc-s').length===3&&!!v.querySelector('.avc-light')&&!!v.querySelector('.avc-ped'));
    meta.wonA={};renderArts();const L=v.querySelectorAll('.avc-s.locked');ok('locked sockets hang in chains with a padlock',L.length===2&&L[0].querySelectorAll('rect').length>=17);
    ok('locked sockets say how to open them',/Win wave 200 in Frostvale/.test(L[0].getAttribute('aria-label'))&&/Greywind Tundra/.test(L[1].getAttribute('aria-label')));
    L[0].click();const tp=v.querySelector('.avc-tip');ok('tapping a locked socket tells you what opens it',!!tp&&!tp.hidden&&/Frostvale/.test(tp.textContent));
    if(typeof artRoom==='function'){const R=artRoom();ok('the chamber is a 3D room: altar, floating sockets, the canvas inside the chamber (v321)',!!R&&R.ok&&v.querySelector('.avc.avc3 .avr-cv')===R.cv&&R.S.length===3);
      ok('the 3D sockets follow the hero: one open, two locked',R.S.map(x=>x.st).join()===(artEq(H)[0]?'full':'empty')+',locked,locked');
      ok('locked sockets are wrapped in chains staked to the altar, with a padlock',R.S[1].links>=60&&!!R.S[1].lock&&R.S[2].links>=60&&R.S[1].anc.children.length===4);
      ok('tapping a locked socket rattles its chains',R.S[1].shk>0);
      meta.wonA={snow:1,tundra:1};renderArts();ok('opening the sockets takes the chains off',R.S.every(x=>x.st!=='locked')&&!R.S[1].lock&&R.S[1].anc.children.length===0);meta.wonA={};renderArts();
      const fr=R.frames;arFrame(.016);ok('the room draws without errors',R.frames===fr+(R.cv.clientWidth?1:0));}
    artTab('heroes');ok('back to Heroes',v.hidden&&document.getElementById('heroDetail').style.display!=='none');renderHeroDetail();ok('the hero card shows its artifact sockets',/Artifacts/.test(document.getElementById('hdBot').textContent));}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{const ov=document.getElementById('artOffer');if(ov)ov.remove();ART_TAB='heroes';ART_MODAL=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
