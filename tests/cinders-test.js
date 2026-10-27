(function(){
/* v385: Cinder Scatter's masteries as Simon designed them. A cinder is landed at a set spot with a ground foe on it, a ground foe 1.2 away and a
   flying foe over it, at every mastery: the old landing, the scorched ground (7% a second, ground foes only), the smoke on flying foes (40% slower,
   1% of max health a second, only while over it), the burst as it burns out (only near it), the real cast (6 cinders, 8 from Mastery 3, the
   fiery flight from Mastery 4), Firestorm still seeing the cinders, cleanup and the fire set. Run on the dev page:
   __kk.ev(await (await fetch('/tests/cinders-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=false;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
/* the update loop puts every foe back on its road spot, so placed foes are pinned again after it */
const pin=()=>{for(const e of enemies)if(!e.dead&&e.px!=null){e.x=e.px;e.z=e.pz;if(e.g)e.g.position.x=e.x,e.g.position.z=e.z;}};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);pin();updFx(.05);}};
const SMX=typeof SM_XP!=='undefined'?SM_XP:MAST_XP,setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.cinders=SMX[L-1];else delete meta.smast.cinders;};
const oL=L=>{const o={src:heroU,bane:0,el:'fire',anc:false,spell:'cinders'};if(L){const id=++SM.id;SM.ctx.set(id,{k:'cinders',L,id,t0:time,n:1,P:100,o});o.smId=id;}return o;};
let X0=0,Z0=0;
const put=(dx,dz,type,hp)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.spd=0;e.maxHp=hp||1e9;e.hp=e.maxHp;e.armor=0;e.res={};e.shield=0;e.x=e.px=X0+dx;e.z=e.pz=Z0+dz;e.dist=5;if(!e.fly)e.y=gy(e.x,e.z);return e;};
let rec=null;const h0=hurt;hurt=function(e,amt,kind,o){if(rec&&o&&o.spell==='cinders'){const l=rec.get(e)||[];l.push({a:amt,sm:!!o.smx,dot:!!o.dot,T:time});rec.set(e,l);}return h0.apply(this,arguments);};
const sum=(e,f)=>(rec.get(e)||[]).filter(f||(()=>true)).reduce((s,h)=>s+h.a,0),near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
const lay=()=>{play();clean();const R=ROUTES[0],p=posAt(R.len*.5,R);X0=p[0];Z0=p[1];return{g:put(0,0),far:put(1.2,0),air:put(0,0,'raven',10000)};};
try{
  const D=SM_D.cinders;
  ok("Cinder Scatter's five masteries are Simon's",D&&D.length===5&&/\{7\}/.test(D[0].d)&&/40%/.test(D[1].d)&&/1% of their max health/.test(D[1].d)&&/2 more cinders/.test(D[2].d)&&D[4].n==='Inferno Scatter'&&/shockwave/.test(D[4].d),D&&D.map(x=>x.n).join(', '));
  ok('his numbers are kept (no scaling), the masteries live in the cinders (no add-on hooks), and a small hidden damage factor tops each level up to the ladder',SMA.cinders.every(v=>v===1)&&!SMF.cinders.cast&&!SMF.cinders.hit&&SMG.cinders.length===5&&SMG.cinders.every(v=>v>=1&&v<1.3)&&CD_K.burst===.2,SMG.cinders.join(' / '));
  const res={};
  for(let L=0;L<=5;L++){const F=lay();rec=new Map();CD.dbg=[];nsCinderLand(X0,Z0,100,oL(L));run(1.6);const midSlow=F.air.slow;run(2.6);const after=F.air.slow;
    res[L]={g:Math.round(sum(F.g)),far:Math.round(sum(F.far)),air:Math.round(sum(F.air))};
    const sc=sum(F.g,h=>h.sm&&h.dot),sa=sum(F.air,h=>h.sm),bu=sum(F.g,h=>h.sm&&!h.dot);
    ok('Mastery '+L+': the old landing still hits the foe on it for 35% and sets it alight',near(sum(F.g,h=>!h.sm&&Math.abs(h.a-35)<1e-6),35)&&sum(F.g,h=>!h.sm&&h.a<35)>0);
    ok('Mastery '+L+(L>=1?': the scorched ground burns the ground foe on it for 7% a second (3.5s), not the one 1.2 away':': no scorched ground'),L>=1?near(sc,24.5,1.8)&&sum(F.far)===0:sc===0,sc.toFixed(2));
    ok('Mastery '+L+(L>=2?': the smoke slows the flying foe over it 40% and takes 1% of its max health a second; the slow ends with the smoke':': the flying foe is untouched (the cinders never touch air)'),L>=2?near(midSlow,.4)&&!(after>0)&&near(sa,350,26):sa===0&&!(midSlow>0),sa.toFixed(1)+' / '+midSlow+' / '+after);
    ok('Mastery '+L+(L>=5?': as it burns out it erupts for 20% on the foe near it (not 1.2 away), with a fiery shockwave':': no burst'),L>=5?near(bu,20)&&CD.dbg.some(d=>d.ev==='burst'&&d.n===1)&&sum(F.far)===0:bu===0,bu);}
  ok('damage by level (ground foe on it / 1.2 away / flying foe over it)',true,JSON.stringify(res));
  /* ---- the real cast: 6 cinders, 8 from Mastery 3; they fly trailing fire from Mastery 4 ---- */
  {const got=[];let flies=0;const f0=cdFly;cdFly=function(){flies++;return f0.apply(this,arguments);};
    for(let L=0;L<=5;L++){const F=lay();setL(L);SM.cnt.cinders=0;CD.dbg=[];rec=new Map();flies=0;castScrollNow('cinders',heroU,tStats(heroU),[F.g],100*smP('cinders'),oL(0));run(1.4);
      got.push(CD.dbg.filter(d=>d.ev==='land').length+'/'+flies);setL(0);run(3);}
    cdFly=f0;ok('a real cast lands 6 mastered cinders, 8 from Mastery 3, flying in fire from Mastery 4 (lands/fiery flights by level)',got.join()==='0/0,6/0,6/0,8/0,8/8,8/8',got.join());}
  /* ---- Firestorm still sees the cinders ---- */
  {const F=lay();setL(5);const n0=S6FZ.length;castScrollNow('cinders',heroU,tStats(heroU),[F.g],100,oL(0));run(1.4);const lands=CD.dbg?0:0;ok('Firestorm still sees every cinder as burning ground',S6FZ.length-n0>=8&&S6FZ.slice(n0).every(q=>s6FireAt(q.x,q.z,.05)),S6FZ.length-n0);setL(0);run(3);}
  /* ---- the look climbs with the mastery ---- */
  {const n=[];for(let L=1;L<=5;L++){const F=lay();CD.dbg=[];nsCinderLand(X0,Z0,100,oL(L));const d=CD.dbg.find(q=>q.ev==='land');n.push(d?d.parts:0);run(4.3);}
    ok('the cinder itself grows richer: a scorch from Mastery 1, glowing coals and a glow from 4, more coals at 5 (parts by Mastery 1..5)',n.join()==='1,1,1,5,6',n.join(' / '));}
  /* ---- it tidies up ---- */
  {const F=lay();run(.3);const B0=new Set(scene.children);rec=new Map();setL(5);castScrollNow('cinders',heroU,tStats(heroU),[F.g],100,oL(0));run(1.5);const mid=scene.children.length;run(7.5);
    /* foes' health bars and models, and the terrain's pooled water ripples, are not the spell's */
    const own=new Set(typeof TER!=='undefined'&&TER.rip?TER.rip:[]);for(const q of enemies){if(q.bar)own.add(q.bar);if(q.g)own.add(q.g);}const extra=scene.children.filter(o=>!B0.has(o)&&!own.has(o));
    ok('Mastery 5 leaves nothing behind',!extra.length&&mid>B0.size+8,B0.size+' > '+mid+' > '+scene.children.length+' (new, not a foe bar or model: '+extra.length+')');setL(0);}
  /* ---- under the fire set (Blackfire) ---- */
  {const F=lay();meta.arts=meta.arts||{own:{},eq:{},pend:[]};const ids=ARTS.filter(a=>a.el==='fire').slice(0,3).map(a=>a.id);ids.forEach(id=>meta.arts.own[id]=1);meta.arts.eq[heroU.hero]=ids;ART_V++;AS.k=null;asEl();asTick(.001);
    setL(5);const e0=errs;rec=new Map();castScrollNow('cinders',heroU,tStats(heroU),[F.g],100,oL(0));run(4.5);ok('under the fire set it casts clean',AS.el==='fire'&&errs===e0&&sum(F.g)>0);
    meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;asEl();setL(0);}
  ok('no errors',errs===0,errs);
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{hurt=h0;rec=null;CD.dbg=null;scene.add=S0;console.error=ce;resetCine();state='menu';paused=false;clean();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;if(typeof asEl==='function')asEl();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
