(function(){
if(typeof ebBolt!=='function')return [['Ember Bolt masteries are not in this build: skipped',true,'']];
/* Ember Bolt's masteries as Simon redesigned them: Kindling (its own 25%/s flame for 3s, stacking with the usual burn), Ember Spray (5 embers,
   20% each), Blazing Rune (bigger bolt, 0.1s stun, 45% blast within 0.75), Scorched Ground (a burning tile, 30% burn), Fire Bolt (150%, molten
   steel from Armoured foes it kills: 4% max health once per foe, bosses 1%, 20% slow). Run on the dev page:
   __kk.ev(await (await fetch('/tests/emb-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,hp,off)=>{const R=ROUTES[0];spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=off||0;e.spd=.0001;e.maxHp=e.hp=hp;e.armor=0;e.res={};e.shield=0;e.elite=null;moveEnemy(e,0);return e;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.emberbolt=SM_XP[L-1];else delete meta.smast.emberbolt;};
const oF=()=>({src:heroU,bane:0,el:'fire',anc:false,spell:'emberbolt'});
const cast=(L,list,P)=>{setL(L);castScrollNow('emberbolt',heroU,tStats(heroU),list,P||100,oF());};
const lost=e=>e.maxHp-e.hp;const D=110;
/* steps until the target first loses health (the bolt lands) */
const land=(e,max)=>{for(let i=0;i<(max||60);i++){run(.05);if(lost(e)>0)return true;}return false;};
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add,H0=hurt,SE=stunE,MO=ebMolten;
try{
  play();meta.smast={};
  ok('the five masteries are Simon’s',SM_D.emberbolt.map(p=>p.n).join()==='Kindling,Ember Spray,Blazing Rune,Scorched Ground,Fire Bolt'&&/0\.1s/.test(SM_D.emberbolt[2].d)&&/150%/.test(SM_D.emberbolt[4].d)&&/4%/.test(SM_D.emberbolt[4].d)&&SM_D.emberbolt.every((p,i)=>!/\{/.test(smDesc('emberbolt',i)))&&SM.free&&SM.free.emberbolt,SM_D.emberbolt.map(p=>p.n).join());
  ok('patch notes (masteries-1) and changelog',NOTES_V==='masteries-1'&&NOTES_HTML.includes('Ember Bolt masteries, reworked')&&CLOG.some(u=>u.t==='Ember Bolt masteries reworked'),NOTES_V);
  /* ---- Mastery 0: the old bolt, exactly ---- */
  {const bd=near(),e=foe(bd,1e6);let used=0;const o0=EBM.old;EBM.old=function(){used++;return o0.apply(this,arguments);};try{cast(0,[e]);const l=land(e);ok('Mastery 0: the old bolt, 110% on landing',used===1&&l&&Math.abs(lost(e)-D)<.5,used+' / '+lost(e));}finally{EBM.old=o0;}clean();}
  /* ---- M1: its own flame, 25% of the hit each second for 3s, on top of the usual burn ---- */
  {const r=[];for(const L of [0,1]){play();const bd=near(),e=foe(bd,1e6);cast(L,[e]);land(e);run(4);r.push(lost(e));clean();}
    ok('Kindling: its own 25%/s flame for 3s on top of the usual burn (+75% of the hit)',Math.abs(r[1]-r[0]-D*.75)<.6,r.map(v=>v.toFixed(1)).join(' -> ')+' (+'+(r[1]-r[0]).toFixed(1)+', expected +'+(D*.75).toFixed(1)+')');}
  /* ---- M2: 5 embers to the 5 nearest foes within 1.6 ---- */
  {play();const bd=near(),e=foe(bd,1e6),N=[.45,-.45,.85,-.85,1.1,-1.5].map(d=>foe(bd+d,1e6)),far=foe(bd+2.6,1e6);cast(2,[e]);land(e);run(1.2);
    const by=N.map(q=>({q,d:Math.hypot(q.x-e.x,q.z-e.z),l:lost(q)})).sort((a,b)=>a.d-b.d),hit=by.slice(0,5).every(x=>Math.abs(x.l-D*.2)<.5),sixth=by[5].l===0;
    ok('Ember Spray: 5 embers, 20% each, to the 5 nearest foes',hit&&sixth&&lost(far)===0,by.map(x=>x.d.toFixed(2)+':'+x.l.toFixed(1)).join(' ')+' / far '+lost(far));clean();}
  /* ---- M3: 0.1s stun and a 45% blast within 0.75 ---- */
  {play();const st=[];stunE=function(e,s){st.push(s);return SE.apply(this,arguments);};try{const bd=near(),e=foe(bd,1e6),a=foe(bd+.5,1e6),b=foe(bd-.5,1e6),m=foe(bd+1.1,1e6),far=foe(bd+2.6,1e6);cast(3,[e]);land(e);run(1.2);
      const x2=D*.2+D*.45;ok('Blazing Rune: the hit stuns 0.1s',st.length===1&&st[0]===.1,JSON.stringify(st));
      ok('and blasts the foes within 0.75 for 45% (embers on top)',Math.abs(lost(a)-x2)<.6&&Math.abs(lost(b)-x2)<.6&&Math.abs(lost(m)-D*.2)<.6&&lost(far)===0,[a,b,m,far].map(q=>lost(q).toFixed(1)).join(' / ')+' (expected '+x2.toFixed(1)+', '+(D*.2).toFixed(1)+', 0)');}finally{stunE=SE;}clean();}
  /* ---- M4: a burning tile: a foe stepping on it catches fire (30%/s) ---- */
  {play();const bd=near(),e=foe(bd,1e6);cast(4,[e]);land(e);run(.3);const q=foe(bd,1e6),q2=foe(bd+1.2,1e6);run(.3);const f1=q.burn&&Math.abs(q.burn.dps-30)<.01&&!q2.burn;run(4);const q3=foe(bd,1e6);run(.4);
    ok('Scorched Ground: a foe on the tile catches fire (30% a second), one beside it does not',f1,q.burn&&q.burn.dps);ok('and it burns out after 3.5s',!q3.burn,q3.burn&&q3.burn.dps);clean();}
  /* ---- M5: 150% and molten steel from Armoured foes it kills ---- */
  {play();const bd=near(),e=foe(bd,1e6);cast(5,[e]);land(e);ok('Fire Bolt: hits for 150%',Math.abs(lost(e)-D*1.5)<.5,lost(e).toFixed(1));clean();}
  {play();let pools=0;ebMolten=function(){pools++;return MO.apply(this,arguments);};const H=new Map();hurt=function(e,a){if(H.has(e))H.get(e).push(a);return H0.apply(this,arguments);};
    try{const bd=near(),plain=foe(bd+2.4,50);cast(5,[plain]);land(plain);run(.3);const p0=pools;clean();
      const e=foe(bd,50);e.elite='armored';cast(5,[e]);land(e);run(.3);const p1=pools;
      const q=foe(bd,1000),b=foe(bd,1000);b.boss=true;H.set(q,[]);H.set(b,[]);run(.25);const sl=q.slow>=.2&&q.slowT>0;run(1.2);
      const n4=H.get(q).filter(a=>Math.abs(a-40)<1e-6).length,n1=H.get(b).filter(a=>Math.abs(a-10)<1e-6).length;
      ok('Fire Bolt: a plain foe it kills leaves nothing; an Armoured one leaves molten steel',p0===0&&p1===1&&e.dead,p0+' / '+p1);
      ok('molten steel: 4% of max health once per foe (bosses 1%), 20% slow',n4===1&&n1===1&&sl&&!H.get(b).some(a=>Math.abs(a-40)<1e-6),n4+' / '+n1+' / slow '+sl);
      run(3.5);const z=foe(bd,1000);H.set(z,[]);run(.4);ok('and it cools away after 4s',!H.get(z).some(a=>Math.abs(a-40)<1e-6),H.get(z).join());}
    finally{ebMolten=MO;hurt=H0;}clean();}
  /* ---- every mastery casts clean and leaves nothing ---- */
  {const left=[],e0=errs;for(let L=1;L<=5;L++){play();const bd=near(),F=[];for(let i=0;i<8;i++){const q=foe(bd+.3*(i-3.5),i%3?3000:200);if(i%4===0)q.elite='armored';F.push(q);}const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};
      for(let c=0;c<4;c++){cast(L,enemies.filter(x=>!x.dead));run(3);}run(7);scene.add=S0;const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});
      if(st.length)left.push('M'+L+':'+st.length);clean();}
    ok('every mastery leaves nothing behind',!left.length,left.join(' '));ok('and casts without errors',errs===e0,errs-e0);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{scene.add=S0;hurt=H0;stunE=SE;ebMolten=MO;console.error=ce;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
