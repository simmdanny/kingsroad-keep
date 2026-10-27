(function(){
/* Building mastery checks (v339): XP from kills (1 / elite 3 / boss 30, halved by MAST_KILL since v363) and from waves for support buildings, Mastery 1-5 from MAST_XP,
   the five Archer Tower upgrades, the pennant, saves, the Armory rows, the mastery card, the tower sheet and the developer buttons.
   Run on the dev page: __kk.ev(await (await fetch('/tests/mastery-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const KX=typeof MAST_KILL==='number'?MAST_KILL:1,XP=MAST_XP;   /* the build's own numbers: v363 halved kill XP and doubled the levels */const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();};
const spot=()=>{for(let r=4;r<H-3;r++)for(let c=1;c<W-1;c++){if(grid[r][c]!==0)continue;for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]])if(grid[r+dr]&&grid[r+dr][c+dc]===1)return[c,r];}return null;};
const near=(t,i,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];const R=ROUTES[0];let bd=1e9,bdist=0;for(let d=0;d<R.len;d+=.1){e.route=R;e.dist=d;moveEnemy(e,0);const q=(e.x-t.x)**2+(e.z-t.z)**2;if(q<bd){bd=q;bdist=d;}}
  e.route=R;e.dist=bdist+(i||0)*.3;e.off=0;e.spd=0;e.maxHp=e.hp=hp||1e6;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const run=sec=>{for(let i=0;i<sec/.05;i++){update(.05);updFx(.05);}};
try{
  /* levels */
  ok('Mastery 1-5 at '+XP.join(' / ')+' XP',XP.join()===(KX<1?'2000,8000,24000,60000,140000':'1000,4000,12000,30000,70000'));
  meta.mast={};ok('a fresh account: Mastery 0',mastLv('archer')===0);
  meta.mast={archer:XP[0]-1};const l0=mastLv('archer');meta.mast.archer=XP[0];const l1=mastLv('archer');meta.mast.archer=XP[4]-1;const l4=mastLv('archer');meta.mast.archer=1e9;
  ok('the levels follow the XP, and 5 is the max',l0===0&&l1===1&&l4===4&&mastLv('archer')===5,[l0,l1,l4,mastLv('archer')].join());
  ok('the archer has five upgrades',MAST_D.archer.length===5&&MAST_D.archer.every(p=>p.n&&p.d));
  /* XP from kills */
  play();meta.mast={};const sp=spot(),T=placeTower('archer',sp[0],sp[1]);buildTowerMesh(T);
  {const e=near(T,0,10);hurt(e,100,'phys',{src:T});ok('a kill by an archer tower: '+KX+' XP',mastXp('archer')===KX,mastXp('archer'));
   const el=near(T,1,10);el.elite='swift';hurt(el,100,'phys',{src:T});ok('an elite: '+3*KX+' XP',mastXp('archer')===4*KX,mastXp('archer'));
   const b=near(T,2,10);b.boss=true;hurt(b,100,'phys',{src:T});ok('a boss: '+30*KX+' XP',mastXp('archer')===34*KX,mastXp('archer'));
   if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}const h=near(T,3,10);hurt(h,100,'magic',{src:heroU});ok('a kill by the hero gives no building XP',mastXp('archer')===34*KX);
   const x0=mastXp('archer');const d=near(T,4,10);hurt(d,100,'phys',{src:T});hurt(d,100,'phys',{src:T});ok('a foe counts once',mastXp('archer')===x0+KX);}
  {const sb=spot();clean();const w0=mastXp('windmill');const wm=placeTower('windmill',sb[0]+2<W?sb[0]:sb[0],sb[1]+2<H?sb[1]+2:sb[1]);lmWaveClear(wave+1);
   ok('a support building earns '+MAST_SUP+' XP for every wave it stands through',!wm||mastXp('windmill')===w0+MAST_SUP,mastXp('windmill'));}
  /* a level up mid-run */
  {meta.mast={archer:XP[0]-KX};const toasts=[];const tt=toast;toast=function(m){toasts.push(m);return tt.apply(this,arguments);};try{const e=near(T,0,10);hurt(e,100,'phys',{src:T});}finally{toast=tt;}
   ok('reaching a level mid-run says so and flies the pennant',mastLv('archer')===1&&toasts.some(m=>/Archer Tower reached Mastery 1: Keen Eyes/.test(m))&&!!T.mflag,toasts.join(' | '));}
  /* the upgrades */
  meta.mast={archer:0};{const s=tStats(T);ok('Mastery 0: none of them',!(s.crit>0)&&!s.volley&&!s.apierce&&!s.mark&&!s.rain);}
  meta.mast={archer:1e9};{const s=tStats(T);ok('Mastery 5: Keen Eyes 10% crits, Volley every 8th shot, 40% pierce, a mark every 10s, a rain every 14s',Math.abs(s.crit-.1)<1e-9&&s.volley===8&&s.apierce===.4&&s.mark===10&&s.rain===14);}
  {const s=tStats(T);T.vol=0;const n=[];for(let i=0;i<8;i++)n.push(archVolley(T,s,[]));ok('Volley: every 8th shot fires 3 extra arrows',n.slice(0,7).every(v=>v===s.multi)&&n[7]===s.multi+3,n.join());}
  {clean();const s=tStats(T),a=near(T,0),b=near(T,1);archPierce({target:a,x:a.x,y:.5,z:a.z},100,{src:T});ok('Piercing Shafts: the foe behind takes the share',Math.abs(b.maxHp-b.hp-100)<.5&&a.hp===a.maxHp,(b.maxHp-b.hp).toFixed(1));}
  {clean();const s=tStats(T),e=near(T,0);T.markT=null;const r1=archMarkReady(T,s),r2=archMarkReady(T,s);archMark(e);ok('Hunter’s Mark: ready once every 10s, and the foe is Weakened for 4s',r1&&!r2&&e.weakT>=3.9,e.weakT);}
  {clean();const s=tStats(T),L=[near(T,0),near(T,1),near(T,2),near(T,3)];T.rainT=null;archRain(T,s,L,{src:T});const t0=T.rainT;run(2);const hit=L.filter(e=>e.hp<e.maxHp).length;
   ok('Rain of Arrows: falls on a crowd of 3 or more and hurts them',t0!=null&&hit>=2,hit+' of 4 hit');T.rainT=null;clean();const one=[near(T,0)];archRain(T,s,one,{src:T});ok('but not on a lone foe',T.rainT==null);}
  {clean();const e=near(T,0);T.cd=0;T.vol=0;T.markT=null;T.rainT=-1;paused=false;run(1.2);paused=true;ok('in a real fight the tower shoots and marks',e.hp<e.maxHp&&e.weakT>0,(e.maxHp-e.hp).toFixed(0));}
  /* v343: the Cannon Bastion's five */
  {play();const sc=spot(),C=placeTower('cannon',sc[0],sc[1]);buildTowerMesh(C);ok('the cannon has its five upgrades',MAST_D.cannon&&MAST_D.cannon.length===5&&MAST_D.cannon.every(p=>p.n&&p.d));
   meta.mast={cannon:0};{const s=tStats(C);ok('cannon Mastery 0: none of them',!s.shrap&&!s.ign&&!s.rico&&!s.cluster&&!s.siegeT);}
   meta.mast={cannon:1e9};const s=tStats(C);ok('cannon Mastery 5: shrapnel 25%, fire 10%/s, ricochet 40%, a cluster every 6th shot, a siege shell every 18s',s.shrap===.25&&s.ign===.1&&s.rico===.4&&s.cluster===6&&s.siegeT===18);
   const src={src:C};
   {clean();const a=near(C,0),b=near(C,0);b.dist=a.dist+s.splash*1.25;moveEnemy(b,0);const far=near(C,0);far.dist=a.dist+s.splash*3;moveEnemy(far,0);const d=Math.hypot(b.x-a.x,b.z-a.z);
    cannonAfter(C,Object.assign({},s,{ign:0,rico:0}),{x:a.x,y:.2,z:a.z,target:a},src,false);
    ok('Shrapnel: a foe just outside the blast takes 25%, one far away nothing',d>s.splash&&d<=s.splash*1.5?Math.abs(b.maxHp-b.hp-s.dmg*.25)<1:true,(b.maxHp-b.hp).toFixed(1)+' at '+d.toFixed(2));ok('and one far away nothing',far.hp===far.maxHp);}
   {clean();const a=near(C,0);cannonAfter(C,Object.assign({},s,{shrap:0,rico:0}),{x:a.x,y:.2,z:a.z,target:a},src,false);ok('Incendiary Powder: blasted foes burn for 3s at 10% of the hit',a.burn&&a.burn.t>=2.9&&Math.abs(a.burn.dps-s.dmg*.1)<1e-6);}
   {clean();C.cd=1e9;const a=near(C,0),b=near(C,0);b.dist=a.dist+1.5;moveEnemy(b,0);cannonAfter(C,Object.assign({},s,{shrap:0,ign:0}),{x:a.x,y:.2,z:a.z,target:a},src,false);run(1.5);
    ok('Ricochet: a second blast lands 1.5 tiles down the road for 40%',Math.abs(b.maxHp-b.hp-s.dmg*.4)<1&&a.hp===a.maxHp,(b.maxHp-b.hp).toFixed(1));}
   {C.cd=1e9;C.cl=0;const n=[];for(let i=0;i<6;i++)n.push(cannonCluster(C,s));ok('Cluster Shell: every 6th shot',n.slice(0,5).every(x=>!x)&&n[5]===true);
    clean();const a=near(C,0);let nb=0;const cb0=cnBlast;cnBlast=function(){nb++;return cb0.apply(this,arguments);};try{cannonAfter(C,Object.assign({},s,{shrap:0,ign:0,rico:0}),{x:a.x,y:.2,z:a.z,target:a},src,true);run(1.5);}finally{cnBlast=cb0;}
    ok('its 4 bomblets land around the target, each a small blast',nb===4,nb);}
   {clean();const L=[near(C,0),near(C,1),near(C,2),near(C,3)];C.sgT=null;const ok1=cannonSiege(C,s,L,src),ok2=cannonSiege(C,s,L,src);const d0=L.map(e=>e.dist);run(2);
    ok('Siege Shell: fires on a crowd, then waits 18s',ok1&&!ok2);ok('it hits the crowd for 300% and throws them back up the road',L.every(e=>e.maxHp-e.hp>=s.dmg*2.9)&&L.some((e,i)=>e.dist<d0[i]-.05),L.map(e=>(e.maxHp-e.hp).toFixed(0)).join(','));
    clean();C.sgT=null;ok('not on a lone foe',!cannonSiege(C,s,[near(C,0)],src));const b=near(C,0);b.boss=true;C.sgT=null;ok('but always on a boss',cannonSiege(C,s,[b],src));}
   {clean();meta.mast={cannon:0};const e=near(C,0,10);hurt(e,100,'siege',src);ok('cannon kills count for its mastery',mastXp('cannon')===KX);}
   meta.mast={cannon:1e9};{clean();const L=[near(C,0),near(C,1),near(C,2)];C.cd=0;C.sgT=null;C.cl=0;paused=false;run(2.5);paused=true;ok('in a real fight the bastion uses them',L.every(e=>e.hp<e.maxHp)&&C.sgT!=null&&L.some(e=>e.burn&&e.burn.t>0));}
   clean();}
  /* v344: the Wizard Tower's five */
  {play();const sm=spot(),M=placeTower('mage',sm[0],sm[1]);buildTowerMesh(M);M.cd=1e9;ok('the wizard has its five upgrades',MAST_D.mage&&MAST_D.mage.length===5&&MAST_D.mage.every(p=>p.n&&p.d));
   meta.mast={mage:0};{const s=tStats(M);ok('wizard Mastery 0: none of them',!s.sbreak&&!s.hex&&!s.fam&&!s.over&&!s.storm);mageFam(M,.1);ok('and no familiar',!M.fam);}
   meta.mast={mage:1e9};const s=tStats(M),o=mageO(M,s);ok('wizard Mastery 5: shieldbreaker, a 20% hex, a familiar at 50%, overload every 5th, a storm every 15s',s.sbreak===1&&s.hex===.2&&s.fam===.5&&s.over===5&&s.storm===15&&o.sb===1&&o.hex===.2);
   {clean();const e=near(M,0);e.shield=1000;e.maxShield=1000;hurt(e,100,'magic',o);ok('Shieldbreaker: a bolt tears 3x as much shield',Math.abs(1000-e.shield-300)<1,(1000-e.shield).toFixed(0));
    const v=near(M,1);v.invis=true;v.revealT=0;hurt(v,1,'magic',o);ok('and reveals an Invisible foe for 3s',v.revealT>=2.9);}
   {clean();const e=near(M,0);hurt(e,1,'magic',o);ok('Hex of Slowness: 20% slower for 1.5s',e.slow>=.2-1e-9&&e.slowT>=1.49);}
   {clean();const e=near(M,0);mageFam(M,.05);ok('Arcane Familiar: an orb circles the tower',!!M.fam&&M.fam.g.parent===M.g);const h0=e.hp;M.fam.cd=0;mageFam(M,.05);
    ok('and zaps a foe in range for 50% of a bolt',Math.abs(h0-e.hp-s.dmg*.5)<1&&M.fam.cd>1.5,(h0-e.hp).toFixed(1));meta.mast={mage:0};mageFam(M,.05);ok('it leaves when the mastery is gone',!M.fam);meta.mast={mage:1e9};}
   {M.shots=4;ok('Overload: not on the 4th bolt',!mageOver(M,s));M.shots=5;ok('but on the 5th',mageOver(M,s));}
   {clean();M.cd=0;M.shots=4;const a=near(M,0),b=near(M,1);const sv=Object.assign({},s);paused=false;run(1.2);paused=true;M.cd=1e9;
    ok('an overloaded bolt hits for 250% and its chain keeps the full strength',a.maxHp-a.hp>=s.dmg*2.5-1&&(s.chain<1||b.maxHp-b.hp>=s.dmg*2.5-1),(a.maxHp-a.hp).toFixed(0)+' / '+(b.maxHp-b.hp).toFixed(0));}
   {clean();const L=[near(M,0),near(M,1),near(M,2)];L[1].hp=L[1].maxHp=2e6;M.stT=null;const o1=mageStorm(M,s,L),o2=mageStorm(M,s,L);run(1);
    ok('Arcane Storm: strikes the strongest in range for 300%, then waits 15s',o1&&!o2&&L.every(e=>e.maxHp-e.hp>=s.dmg*3-1),L.map(e=>(e.maxHp-e.hp).toFixed(0)).join(','));
    clean();M.stT=null;ok('not on a lone foe',!mageStorm(M,s,[near(M,0)]));const b=near(M,0);b.boss=true;M.stT=null;ok('but on a boss',mageStorm(M,s,[b]));}
   {clean();meta.mast={mage:0};const e=near(M,0,10);hurt(e,100,'magic',{src:M,el:'lightning'});ok('wizard kills count for its mastery',mastXp('mage')===KX);}
   clean();}
  /* v345: the Frost Spire's five */
  {play();const sf=spot(),F=placeTower('frost',sf[0],sf[1]);buildTowerMesh(F);F.cd=1e9;ok('the frost spire has its five upgrades',MAST_D.frost&&MAST_D.frost.length===5&&MAST_D.frost.every(p=>p.n&&p.d));
   meta.mast={frost:0};{const s=tStats(F);ok('frost Mastery 0: none of them',!s.slowDur&&!s.spikes&&!s.dfreeze&&!s.fshat&&!s.blizT);}
   meta.mast={frost:1e9};const s=tStats(F);ok('frost Mastery 5: 3.2s slows, spikes 400%, a freeze after 4 pulses, shards 200%, a blizzard every 16s',s.slowDur===3.2&&s.spikes===4&&s.dfreeze===4&&s.fshat===2&&s.blizT===16);
   {clean();const e=near(F,0);F.cd=0;paused=false;run(.1);paused=true;F.cd=1e9;ok('Lingering Frost: a pulse slows for 3.2s',e.slowT>3,e.slowT.toFixed(2));}
   {clean();const L=[near(F,0),near(F,1),near(F,2)];const sv=Object.assign({},s,{dfreeze:0,blizT:0});frostAfter(F,sv,L);const hit=L.filter(e=>e.maxHp-e.hp>=s.dmg*4-1).length;ok('Ice Spikes: 2 foes take 400% of a pulse',hit===2,hit);run(1);}
   {clean();const e=near(F,0),sv=Object.assign({},s,{spikes:0,blizT:0});e.stunT=0;for(let i=0;i<3;i++)frostAfter(F,sv,[e]);const s3=e.stunT>0;frostAfter(F,sv,[e]);ok('Deep Freeze: frozen on the 4th pulse in a row, not before',!s3&&e.stunT>0,e.stunT.toFixed(2));run(1.5);
    const b=near(F,1);b.boss=true;b.stunT=0;for(let i=0;i<4;i++)frostAfter(F,sv,[b]);ok('bosses only 0.4s',b.stunT>0&&b.stunT<=.41,b.stunT.toFixed(2));}
   {clean();const a=near(F,0,10),L=[near(F,0),near(F,0),near(F,0)];a.chillBy=F;a.slowT=2;hurt(a,100,'magic',{src:F,el:'ice'});ok('Shatter: a chilled foe that dies hits 3 nearby for 200% of a pulse',a.dead&&L.every(e=>Math.abs(e.maxHp-e.hp-s.dmg*2)<1),L.map(e=>(e.maxHp-e.hp).toFixed(0)).join(','));
    const u=near(F,0,10),M=near(F,0);u.chillBy=null;hurt(u,100,'magic',{src:F,el:'ice'});ok('a foe it never chilled does not shatter',M.hp===M.maxHp);}
   {clean();const L=[near(F,0),near(F,1),near(F,2)];F.bzT=null;const sv=Object.assign({},s,{spikes:0,dfreeze:0});const o1=frostBlizzard(F,sv,L),o2=frostBlizzard(F,sv,L);run(2.1);
    ok('Blizzard: on a crowd, then waits 16s; foes in it are hurt every half second and slowed more',o1&&!o2&&L.every(e=>e.maxHp-e.hp>=s.dmg*.6*3-1)&&L.every(e=>e.slow>=Math.min(.75,s.slow+.25)-1e-9),L.map(e=>(e.maxHp-e.hp).toFixed(0)).join(','));
    clean();F.bzT=null;ok('not on a lone foe',!frostBlizzard(F,sv,[near(F,0)]));run(2.5);}
   {clean();meta.mast={frost:0};const e=near(F,0,10);hurt(e,100,'magic',{src:F,el:'ice'});ok('frost kills count for its mastery',mastXp('frost')===KX);}
   clean();}
  /* v346: the Ballista's five */
  {play();const sb=spot(),B=placeTower('ballista',sb[0],sb[1]);buildTowerMesh(B);B.cd=1e9;ok('the ballista has its five upgrades',MAST_D.ballista&&MAST_D.ballista.length===5&&MAST_D.ballista.every(p=>p.n&&p.d));
   meta.mast={ballista:0};const s0=tStats(B);ok('ballista Mastery 0: none of them',!s0.gslay&&!s0.pin&&!s0.boom&&!s0.impT);
   meta.mast={ballista:1e9};const s=tStats(B),src={src:B};ok('ballista Mastery 5: giant slayer 25%, crits +1x, pins, 60% bursts, an impaler every 15s',s.gslay===.25&&Math.abs(s.critX-s0.critX-1)<1e-9&&s.pin===1&&s.boom===.6&&s.impT===15);
   ok('Giant Slayer: 25% more on elites and bosses, not on others',baGS(s,{elite:'swift'})===1.25&&baGS(s,{boss:true})===1.25&&baGS(s,{})===1);
   {clean();const e=near(B,0);e.stunT=0;const d=baPin(e);ok('Pinning Bolt: pinned 0.6s',d>0&&e.stunT>=.59,e.stunT.toFixed(2));const b=near(B,1);b.boss=true;b.stunT=0;baPin(b);ok('bosses only 0.25s',b.stunT>0&&b.stunT<=.26);}
   {clean();const a=near(B,0),L=[near(B,0),near(B,0)];baBoom({x:a.x,y:.4,z:a.z},100,src,s);ok('Explosive Tips: 60% to every foe around the last one hit',[a].concat(L).every(e=>Math.abs(e.maxHp-e.hp-60)<1));}
   {clean();const L=[near(B,0),near(B,1),near(B,2)];B.imT=null;const o1=baImpale(B,s,L[0],src),o2=baImpale(B,s,L[0],src);run(1.2);const hit=L.filter(e=>e.maxHp-e.hp>=s.dmg*2.5-1).length;
    ok('Impaler: once every 15s, a harpoon through the target for 250%',o1&&!o2&&hit>=1,hit+' hit');}
   {clean();const L=[near(B,0),near(B,1),near(B,2)];B.cd=0;B.imT=-1;paused=false;run(1.5);paused=true;B.cd=1e9;ok('in a real fight the ballista shoots, pins and bursts',L.filter(e=>e.hp<e.maxHp).length>=2,L.map(e=>(e.maxHp-e.hp).toFixed(0)).join(','));}
   {clean();meta.mast={ballista:0};const e=near(B,0,10);hurt(e,100,'pierce',src);ok('ballista kills count for its mastery',mastXp('ballista')===KX);}
   clean();}
  /* the pennant */
  meta.mast={};buildTowerMesh(T);ok('no pennant at Mastery 0',!T.mflag);meta.mast={archer:XP[1]};buildTowerMesh(T);ok('a pennant once mastered, in the colour of its level',!!T.mflag&&T.mflag.userData.fl.material.color.getHex()===MAST_COL[1]);
  /* saves */
  {const m=migrateMeta(JSON.parse(JSON.stringify(Object.assign({},meta,{mast:{archer:'12',cannon:-5,mage:'x'}}))));ok('a damaged save is repaired',m.mast.archer===12&&!('cannon' in m.mast)&&!('mage' in m.mast));
   const m2=migrateMeta(JSON.parse(JSON.stringify(Object.assign({},meta,{mast:null}))));ok('an old save gets an empty mastery book',m2.mast&&typeof m2.mast==='object'&&!Object.keys(m2.mast).length);
   ok('developer mode puts the real masteries back when it is switched off',!!DEV_KEYS.mast);
   /* v363: saved XP doubled once per account, the developer stash too, so levels and progress stay */
   if(typeof mastX2==='function'){const o=JSON.parse(JSON.stringify(Object.assign({},meta,{mast:{archer:3000,cannon:70000,mage:999},devSnap:{mast:{frost:500}}})));delete o.mastX2;
     const lv0={archer:1,cannon:5,mage:0},m=migrateMeta(o);
     ok('v363: an older save gets its mastery XP doubled once, so every level stays',m.mastX2===1&&m.mast.archer===6000&&m.mast.cannon===140000&&m.mast.mage===1998&&m.devSnap.mast.frost===1000&&Object.keys(lv0).every(k=>{const x=m.mast[k];let l=0;while(l<5&&x>=XP[l])l++;return l===lv0[k];}),JSON.stringify(m.mast));
     const m2=migrateMeta(JSON.parse(JSON.stringify(m)));ok('v363: and only once',m2.mast.archer===6000&&m2.devSnap.mast.frost===1000);}}
  /* the screens */
  {meta.mast={archer:XP[1]+1200};const sv=sel;selectTower(T);refreshSheet(true);const sh=document.body.textContent;ok('the tower sheet shows the mastery and the crit chance',/Mastery 2/.test(sh)&&/Keen Eyes/.test(sh)&&/Volley/.test(sh)&&/Crit/.test(sh));sel=sv;if(typeof closeSheet==='function')closeSheet();}
  state='menu';clean();clearWorld();showOverlay('menu');goTab('shop');renderArmory();
  {const L=document.querySelectorAll('#shopList .mst-btn');const ar=document.querySelector('#shopList [data-mast="archer"]');ok('every unlocked building in the Armory shows its mastery',L.length===ALL_T.filter(k=>unlocked(k)).length&&!!ar&&/Mastery 2/.test(ar.textContent)&&/Piercing Shafts/.test(ar.textContent),L.length);
   ar.click();const mc=document.getElementById('mastModal');ok('tapping it opens the mastery card: five levels, two unlocked, what the rest need',!!mc&&mc.querySelectorAll('.mst-lvl').length===5&&mc.querySelectorAll('.mst-lvl.on').length===2&&mc.textContent.includes(fmt(XP[2]-XP[1]-1200)+' more XP'),mc&&mc.querySelectorAll('.mst-lvl.on').length);
   if(mc)mc.querySelector('[data-mx]').click();ok('and closes',!document.getElementById('mastModal'));
   {const nk=Object.keys(TD).find(k=>!MAST_D[k]);if(nk){mastOpen(nk);const c2=document.getElementById('mastModal');ok('a building without its upgrades yet says they are coming',!!c2&&/later update/.test(c2.textContent),nk);if(c2)c2.remove();}
    else ok('every building has its five masteries',Object.keys(TD).every(k=>MAST_D[k]&&MAST_D[k].length===5));}}
  /* developer */
  play();devAct('mst5');ok('developer: Max all',Object.keys(TD).every(k=>mastLv(k)===5));devAct('mst0');ok('developer: Reset',Object.keys(TD).every(k=>mastLv(k)===0));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{const o=document.getElementById('mastModal');if(o)o.remove();clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
