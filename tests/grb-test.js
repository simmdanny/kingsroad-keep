(function(){
if(typeof grbErupt!=='function')return JSON.stringify([['Graveburst mastery rework is not in this build: skipped',true,'']]);
/* Graveburst's masteries, redesigned by Simon: the texts, the base burst left as it was, Gravequake's fissures, The Unburied's sweep, The Open
   Pit's spikes, Ribcage Prison's cage and collapse, Hand of the Underworld's seize, drag and seal, and every mastery casting clean and tidying
   up. Each mastery is measured on its own (the others switched off for that check). Run on the dev page:
   __kk.ev(await (await fetch('/tests/grb-test.js')).text()) returns [name, ok, detail] rows. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,i,hp,off)=>{const R=ROUTES[0];spawnEnemy({type:i%4?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=off==null?0:off;e.spd=.0001;e.maxHp=hp;e.hp=hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const SMX=typeof SM_XP!=='undefined'?SM_XP:MAST_XP;const setL=L=>{meta.smast={};if(L)meta.smast.graveburst=SMX[L-1];};
const oF=()=>({src:heroU,bane:0,el:'dark',anc:false,spell:'graveburst'});
const cast=(list,P)=>{castScrollNow('graveburst',heroU,tStats(heroU),list,P||100,oF());worldSlow=1;slowT=0;};
const id=meta.equipped,AU=typeof AURA!=='undefined'&&AURA[id],boom0=AU&&AU.boom;if(AU)AU.boom=0;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
const keep={grbQuake,grbUnburied,grbPit,grbCage,grbHands};const noop=()=>{};
const only=k=>{grbQuake=k==='q'?keep.grbQuake:noop;grbUnburied=k==='u'?keep.grbUnburied:noop;grbPit=k==='p'?keep.grbPit:noop;grbCage=k==='c'?keep.grbCage:noop;grbHands=k==='h'?keep.grbHands:noop;};
const restore=()=>{grbQuake=keep.grbQuake;grbUnburied=keep.grbUnburied;grbPit=keep.grbPit;grbCage=keep.grbCage;grbHands=keep.grbHands;};
const dmg=e=>e.maxHp-e.hp;
try{
  /* ---- texts ---- */
  {const D=SM_D.graveburst,t=[0,1,2,3,4].map(i=>smDesc('graveburst',i));
   ok('Simon\'s five masteries, by name',D.map(p=>p.n).join(',')==='Gravequake,The Unburied,The Open Pit,Ribcage Prison,Hand of the Underworld',D.map(p=>p.n).join(','));
   ok('the texts carry his numbers',/45%/.test(t[0])&&/100%/.test(t[1])&&/35%/.test(t[2])&&/4s/.test(t[2])&&/70%/.test(t[3])&&/1\.5s/.test(t[3])&&/100%/.test(t[4])&&!t.some(x=>/\{/.test(x)),t[3]);
   ok('his own numbers (SM.free), no damage factor',SM.free&&SM.free.graveburst&&SMG.graveburst.every(v=>v===1)&&SMA.graveburst.every(v=>v===1));
   ok('the patch notes and the changelog tell of it',(NOTES_V!=='masteries-1'||/Graveburst masteries, redesigned/.test(NOTES_HTML))&&CLOG.some(c=>c.t==='Graveburst masteries, redesigned'));}
  /* ---- the base burst is untouched ---- */
  {const base=L=>{only('');play();setL(L);const bd=near(),e=foe(bd,0,1e6);cast([e]);run(1.5);const r=dmg(e);clean();return r;};const b0=base(0),b1=base(1);
   ok('the grave still bursts for 260% after 1.15s, mastered or not',Math.abs(b0-260)<1&&Math.abs(b1-260)<1,b0+' / '+b1);}
  /* ---- 1 Gravequake ---- */
  {const q=L=>{only('q');play();setL(L);const bd=near(),e=foe(bd,0,1e6),f=foe(bd+2,1,1e6),b=foe(bd-2.2,2,1e6),far=foe(bd+4,3,1e6);cast([e]);run(2);const r={f:dmg(f),b:dmg(b),far:dmg(far)};run(2);r.f2=dmg(f);clean();return r;};
   const q0=q(0),q1=q(1);ok('Gravequake: fissures race along the road both ways and strike foes 2 tiles out for 45%',q0.f===0&&q0.b===0&&Math.abs(q1.f-45)<.5&&Math.abs(q1.b-45)<.5,JSON.stringify(q1));
   ok('once each, and only as far as they run',q1.f2===q1.f&&q1.far===0,JSON.stringify(q1));}
  /* ---- 2 The Unburied ---- */
  {const u=L=>{only('u');play();setL(L);const bd=near(),e=foe(bd,0,1e6),n1=foe(bd+1.5,1,1e6),n2=foe(bd-1.4,2,1e6),fl=foe(bd+1.3,3,1e6,.4),far=foe(bd+2.6,1,1e6);fl.fly=true;moveEnemy(fl,0);
     let G=null;const k0=grbUnburied;grbUnburied=function(g){G=g;return k0.apply(this,arguments);};cast([e]);run(1.4);const pre=dmg(n1);run(2);grbUnburied=k0;const r={pre,n1:dmg(n1),n2:dmg(n2),fl:dmg(fl),far:dmg(far),got:!!G};clean();return r;};
   const u1=u(1),u2=u(2);ok('The Unburied: the warrior rises and its sweep strikes every foe around it for 100%, flyers too',u1.n1===0&&!u1.got&&u2.got&&u2.pre===0&&Math.abs(u2.n1-100)<.5&&Math.abs(u2.n2-100)<.5&&u2.fl>=100-.5,JSON.stringify(u2));
   ok('but not beyond its reach',u2.far===0,u2.far);}
  /* ---- 3 The Open Pit ---- */
  {const p=L=>{only('p');play();setL(L);const bd=near(),e=foe(bd,0,1e6),w=foe(bd+.35,1,1e6),out=foe(bd+1.6,2,1e6);cast([e]);run(1.3);const e0=dmg(e),w0=dmg(w);run(1.2);put(w,bd+1.8);run(4);const r={e:dmg(e)-e0,w:dmg(w)-w0,out:dmg(out)};clean();return r;};
   function put(x,d){x.dist=d;moveEnemy(x,0);}
   const p2=p(2),p3=p(3);ok('The Open Pit: spikes keep thrusting up under a foe standing in the grave, 35% a time, about once a second for 4s',p2.e===0&&Math.abs(p3.e-140)<1,JSON.stringify(p3));
   ok('a foe that walks out is spared after it leaves, and none reach outside',p3.w>=35-.5&&p3.w<=70+.5&&p3.out===0,JSON.stringify(p3));}
  /* ---- 4 Ribcage Prison ---- */
  {const c=L=>{only('c');play();setL(L);const bd=near(),e=foe(bd,0,1e6),t=foe(bd+.45,1,1e6),bw=foe(bd+.6,2,1e6,-.3),bs=foe(bd-.2,3,1e6,.3);bw.boss=true;bs.boss=true;
     cast([e]);run(1.25);t.spd=.8;bw.spd=.8;const cx=e.x,cz=e.z,t0=dmg(t),bs0=dmg(bs);let tmax=0,bmax=0;for(let i=0;i<26;i++){run(.05);tmax=Math.max(tmax,Math.hypot(t.x-cx,t.z-cz));bmax=Math.max(bmax,Math.hypot(bw.x-cx,bw.z-cz));}
     run(.6);const r={tmax:+tmax.toFixed(2),bmax:+bmax.toFixed(2),t:dmg(t)-t0,bs:dmg(bs)-bs0};clean();return r;};
   const c3=c(3),c4=c(4);ok('Ribcage Prison: a ground foe caged inside cannot walk out for 1.5s; a boss walks on',c3.tmax>1.25&&c4.tmax<1.15&&c4.bmax>1.25,JSON.stringify({c3,c4}));
   ok('then the ribs shatter: 70% to the foes inside, 35% to a boss',Math.abs(c4.t-70)<.5&&Math.abs(c4.bs-35)<.5&&c3.t===0,JSON.stringify(c4));}
  /* ---- 5 Hand of the Underworld ---- */
  {const h=L=>{only('h');play();setL(L);const bd=near(),e=foe(bd,0,1e6),a=foe(bd+.6,1,1e6),b=foe(bd-.6,2,1e6),far=foe(bd+2.2,3,1e6);b.boss=true;cast([e]);run(1.15+2.7);
     const cx=e.x,cz=e.z,d0=Math.hypot(a.x-cx,a.z-cz),a0=dmg(a),b0=dmg(b);run(.6);run(.2);const mid={sunk:a.b?a.y-a.b.position.y:0,stun:a.stunT>0,bstun:b.stunT>0,d:Math.hypot(a.x-cx,a.z-cz),d0};run(1);
     const r={a:dmg(a)-a0,b:dmg(b)-b0,far:dmg(far),mid};clean();return r;};
   const h4=h(4),h5=h(5);
   ok('Hand of the Underworld: the hands seize the foes in the abyss (100%) and the grave slams shut on them (100%), bosses too',h4.a===0&&Math.abs(h5.a-200)<1&&Math.abs(h5.b-200)<1&&h5.far===0,JSON.stringify({a:h5.a,b:h5.b,far:h5.far}));
   ok('a seized foe is held and dragged under toward the middle on the chains; a boss is not',h5.mid.stun&&h5.mid.sunk>.15&&h5.mid.d<h5.mid.d0-.2&&!h5.mid.bstun,JSON.stringify(h5.mid));}
  restore();
  /* ---- every mastery, on a walking crowd ---- */
  {const bad=[],left=[];for(let L=1;L<=5;L++){play();setL(L);const bd=near();for(let i=0;i<10;i++){const e=foe(bd+.3*(i-4.5),i,i%3?2000:300,(i%3-1)*.2);e.spd=.5;if(i===7)e.boss=true;}
     const added=[];scene.add=function(...q){added.push(...q);return S0.apply(this,q);};const e0=errs;
     for(let c=0;c<3;c++){cast(enemies.filter(x=>!x.dead));run(SPELLS_S.graveburst.cd);}run(10);scene.add=S0;
     if(errs>e0)bad.push(L);const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});if(st.length)left.push(L+':'+st.length);}
   ok('every mastery casts on a walking crowd without errors',!bad.length,bad.join(','));ok('and leaves nothing behind',!left.length,left.join(' '));}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{restore();if(AU)AU.boom=boom0;console.error=ce;scene.add=S0;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
