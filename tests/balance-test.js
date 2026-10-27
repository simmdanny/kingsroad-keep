(function(){
/* v303/v306: bosses carry at most one modifier (an elite affix from wave 100; no gem, omen, Starfall or landmark change); no other foe has more than half a boss's health; the merchant comes on 1% of waves.
   Run on the dev page: __kk.ev(await (await fetch('/tests/balance-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const go=a=>{lsSet(KR,null);meta.arenas.snow=1;meta.arenas.tundra=1;meta.seenA.snow=1;meta.seenA.tundra=1;meta.mapIntro=0;meta.arena=a;state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;};
const one=(o,w)=>{spawnEnemy(o,w);const e=enemies[enemies.length-1];const r={maxHp:e.maxHp,hp:e.hp,spd:e.spd,armor:e.armor,regen:e.regen||0,elites:e.elites||null,gem:!!e.gem,shield:e.shield||0,boss:e.boss,capped:!!e.capped,lives:e.lives};removeEnemy(e);enemies.splice(enemies.indexOf(e),1);return r;};
const near=(a,b)=>Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b));
try{
  /* v338: Ice Tomb takes the strongest foe on the field, whatever the hero targets */
  {go('plains');if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}const H=heroU,t0=H.target;H.target='first';
   const mk=(type,d,hp,boss)=>{spawnEnemy({type},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=0;moveEnemy(e,0);if(hp)e.hp=e.maxHp=hp;if(boss)e.boss=true;return e;};
   for(const e of enemies.slice())removeEnemy(e);enemies=[];
   const L=ROUTES[0].len,near=mk('peasant',L*.6,100),far=mk('knight',2,5000);far.hp=1200;
   ok('Ice Tomb: the toughest unit beats a fresh weak one, even wounded and out of the hero’s range',iceTombPick(H,[near])===far,(iceTombPick(H,[near])||{}).type);
   const b=mk('soldier',3,800,true);ok('Ice Tomb: a boss comes first',iceTombPick(H,[near])===b);
   const k2=mk('knight',4,5000);ok('Ice Tomb: between two of the same, the one with more health left',(()=>{removeEnemy(b);return iceTombPick(H,[near])===k2;})());
   {let got=null;const c0=castIceTomb;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];const a=mk('peasant',L*.6,100),z=mk('knight',2,9000);castIceTomb(H,[a],1,{src:H,el:'ice',spell:'icetomb'});for(let i=0;i<24;i++)updFx(.05);got=(z.heldT>0||z.stunT>0||z.tomb)?'knight':(a.heldT>0||a.stunT>0||a.tomb)?'peasant':'none';}catch(e){got='err '+e.message;}
    ok('a real cast with the hero aiming at the first foe entombs the strongest one',got==='knight',got);}
   H.target=t0;for(const e of enemies.slice())removeEnemy(e);enemies=[];}
  /* v334: every Damage level gives 1.5 points less (+26.5% / +23.7% / +18.3%) */
  {const r=(a,b)=>massMul(b)/massMul(a),near=(x,y)=>Math.abs(x-y)<1e-9;ok('tower Damage levels: +26.5% (1-10), +23.7% (11-18), +18.3% (19+)',near(massMul(1),1.265)&&near(r(9,10),1.265)&&near(r(10,11),1.237)&&near(r(17,18),1.237)&&near(r(18,19),1.183)&&near(r(49,50),1.183),[r(0,1),r(10,11),r(49,50)].map(x=>x.toFixed(3)).join(' '));
   const t={type:'archer',parts:{height:0,mass:0,special:0}},d0=tStats(t).dmg;t.parts.mass=30;ok('a tower at Damage 30 hits about 31% softer than before v334',near(tStats(t).dmg/d0,massMul(30))&&Math.abs(massMul(30)/(Math.pow(1.28,10)*Math.pow(1.252,8)*Math.pow(1.198,12))-.694)<.01,(massMul(30)/(Math.pow(1.28,10)*Math.pow(1.252,8)*Math.pow(1.198,12))).toFixed(3));}

  go('plains');
  /* ---- v306: a boss carries at most one modifier: from wave 100, about half of them, never two, never a milestone boss ---- */
  {let two=0,one1=0,n=0,early=0;for(let w=100;w<=300;w+=10)for(let k=0;k<20;k++){const W=buildWave(w),b=W.q[W.q.length-1];n++;if(Array.isArray(b.elite))two++;else if(b.elite)one1++;}
    for(let w=10;w<100;w+=10)for(let k=0;k<20;k++){const W=buildWave(w);if(W.q[W.q.length-1].elite)early++;}
    ok('from wave 100 about half the bosses roll one modifier, never two ('+n+' boss waves)',!two&&one1>n*.35&&one1<n*.65,one1+'/'+n);ok('no boss before wave 100 has one',!early,early);}
  {let ms=0;for(const a of['snow','tundra']){go(a);for(let k=0;k<30;k++)for(const w of[100,200]){const W=buildWave(w),b=W.q[W.q.length-1];if(b.ms&&b.elite)ms++;}}go('plains');ok('milestone bosses never have one',!ms,ms);}
  /* ---- spawning: a boss keeps only its first affix, and nothing else touches it ---- */
  const B=bossFor(120),base=one({type:B.type,v:B.v,hpMul:B.hpMul},120);
  {const r=one({type:B.type,v:B.v,hpMul:B.hpMul,elite:['swift','regen']},120);ok('a boss handed two affixes keeps only the first (Swift, not Regenerating)',r.elites&&r.elites.length===1&&r.elites[0]==='swift'&&near(r.spd,base.spd*1.4)&&!r.regen&&near(r.maxHp,base.maxHp*1.8),JSON.stringify([r.elites,r.spd/base.spd,r.regen]));}
  {const r=one({type:B.type,v:B.v,hpMul:B.hpMul,elite:['giant','armored','shielded']},120);ok('a Giant boss stays just Giant (no armour, no shield on top)',r.elites&&r.elites.length===1&&r.elites[0]==='giant'&&near(r.armor,base.armor)&&!r.shield&&near(r.maxHp,base.maxHp*1.8*2.2));}
  {const r1=one({type:B.type,v:B.v,hpMul:B.hpMul,mo:'haste'},120),r2=one({type:B.type,v:B.v,hpMul:B.hpMul,mo:'iron'},120);ok('Ill Omens (Hastened, Ironclad) leave bosses alone',near(r1.spd,base.spd)&&near(r2.armor,base.armor));}
  {forceGem=true;let r;try{r=one({type:B.type,v:B.v,hpMul:B.hpMul},120);}finally{forceGem=false;}ok('a boss is never a gem carrier',!r.gem&&near(r.spd,base.spd)&&near(r.maxHp,base.maxHp));}
  {const s0=SF.until,w0=wave,st=state;SF.until=999;wave=120;state='playing';let r,f;try{r=one({type:B.type,v:B.v,hpMul:B.hpMul},120);f=one({type:'soldier',v:0},120);}finally{SF.until=s0;wave=w0;state=st;}
    ok('the Starfall leaves bosses alone (still slows and heals the rest)',near(r.spd,base.spd)&&!r.regen&&f.regen>0,r.regen+'/'+f.regen);}
  {const h0=MK.haste;MK.haste=3;let r;try{r=one({type:B.type,v:B.v,hpMul:B.hpMul},120);}finally{MK.haste=h0;}ok('a landmark curse that hastens foes leaves bosses alone',near(r.spd,base.spd));}
  {const plain=o=>{for(let i=0;i<30;i++){const x=one(o,120);if(!x.gem)return x;}return one(o,120);}/* a 2% gem carrier is faster: skip those */
    const r=plain({type:'knight',v:0,elite:['swift']}),p=plain({type:'knight',v:0});ok('ordinary foes still get their affixes',r.elites&&r.elites[0]==='swift'&&Math.abs(r.spd/p.spd-1.4)<1e-6,(r.spd/p.spd).toFixed(3));}
  /* ---- nothing outgrows a boss ---- */
  {let worst=0,at='',checked=0,bossErr=0;for(const a of['plains','snow','tundra']){go(a);for(let w=25;w<=220;w+=5){const cap=nonBossCap(w),w0=Math.max(10,Math.floor(w/10)*10),w1=Math.max(10,Math.ceil(w/10)*10);
      for(const BB of[bossFor(w0),bossFor(w1)]){const real=one({type:BB.type,v:BB.v,hpMul:BB.hpMul},w).maxHp,calc=bossHpAt(BB,w);if(Math.abs(real-calc)>real*1e-6)bossErr++;}
      const weak=Math.min(one({type:bossFor(w0).type,v:bossFor(w0).v,hpMul:bossFor(w0).hpMul},w).maxHp,one({type:bossFor(w1).type,v:bossFor(w1).v,hpMul:bossFor(w1).hpMul},w).maxHp);
      for(const el of[['giant','armored'],['giant','shielded'],['giant','regen']])for(const v of[0,1,2]){const r=one({type:'ram',v,elite:el,hpMul:1.6},w);checked++;const q=(r.maxHp+r.shield)/weak;if(q>worst){worst=q;at=a+' w'+w+' '+el.join('+')+' v'+v;}}}}
    ok('the boss health the cap uses matches a real boss of that wave',!bossErr,bossErr);
    ok('no giant armoured (or shielded) ram reaches half a boss ('+checked+' rams, three lands, waves 25-220)',worst<=.5+1e-9,worst.toFixed(3)+' at '+at);}
  {go('plains');const r=one({type:'ram',v:0,elite:['giant','armored']},25),p=one({type:'ram',v:0},25),bw=Math.min(bossHpAt(bossFor(20),25),bossHpAt(bossFor(30),25));
    ok('at wave 25 the giant armoured ram is capped below the ogre',r.capped&&r.maxHp<bw*.51&&r.hp===r.maxHp,Math.round(r.maxHp)+' vs boss '+Math.round(bw));
    ok('a plain ram is not touched',!p.capped);}
  {const r=one({type:'soldier',v:0},60);ok('ordinary foes keep their health',!r.capped);}
  /* ---- the merchant ---- */
  ok('the merchant comes on 1% of waves',WM_CH===.01&&WM_CAP===.01);
  {let n=0;const N=200000;for(let i=0;i<N;i++)if(rnd()<Math.min(WM_CAP,WM_CH+WM_PITY*0))n++;ok('...which is about 1 in 100 rolls',Math.abs(n/N-.01)<.0015,(n/N*100).toFixed(2)+'%');}
  ok('brand new patch notes for it (bosses-1), holding only this update',(NOTES_V==='bosses-1'?NOTES_HTML.includes('at most one modifier')&&NOTES_HTML.includes('1% chance'):CLOG.length>0)&&!NOTES_HTML.includes('Abyssal'));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{state='menu';paused=false;for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
