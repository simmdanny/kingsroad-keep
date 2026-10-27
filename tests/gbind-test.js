(function(){
/* v381: Gravebind's masteries as Simon designed them. Foes are placed at set distances from the bound foe (beside it 0.6, ring 0.9, edge 1.1,
   outside 1.6) and every level is checked: the old bind at Mastery 0, the after-slow, the withering darkness (only while inside), the second
   chain coiling round a foe sized to its model (a loop low down on a boss), the hold and the area slow on the wider rune, the eruption and the
   three extra chains; then the real cast path, cleanup and the dark set. Run on the dev page:
   __kk.ev(await (await fetch('/tests/gbind-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=false;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
/* the update loop puts every foe back on its road spot, so the placed foes are pinned again after it (before the effects look at them) */
const pin=()=>{for(const e of enemies)if(!e.dead&&e.px!=null){e.x=e.px;e.z=e.pz;e.y=gy(e.x,e.z);if(e.g)e.g.position.set(e.x,e.y,e.z);}};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);pin();updFx(.05);}};
const SMX=typeof SM_XP!=='undefined'?SM_XP:MAST_XP,setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.gravebind=SMX[L-1];else delete meta.smast.gravebind;};
const o0=()=>({src:heroU,bane:0,el:'dark',anc:false,spell:'gravebind'});
let X0=0,Z0=0;
/* (files session, v388) no gem or scroll carriers: their sparkle (sparkle<update) adds untagged meshes the clean-up check would count */
const put=(dx,dz,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;e.x=e.px=X0+dx;e.z=e.pz=Z0+dz;e.y=gy(e.x,e.z);e.dist=5;if(e.g)e.g.position.set(e.x,e.y,e.z);return e;};
let rec=null;const h0=hurt;hurt=function(e,amt,kind,o){if(rec&&o&&o.spell==='gravebind'){const l=rec.get(e)||[];l.push({a:amt,sm:!!o.smx,dot:!!o.dot,T:time});rec.set(e,l);}return h0.apply(this,arguments);};
const sum=(e,f)=>(rec.get(e)||[]).filter(f||(()=>true)).reduce((s,h)=>s+h.a,0),near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
const lay=()=>{play();clean();X0=heroU.x+2.4;Z0=heroU.z;return{e:put(0,0),nb:put(.6,0),ring:put(0,.9),edge:put(-1.1,0),out:put(0,-1.6)};};
try{
  /* ---- the masteries ---- */
  const D=SM_D.gravebind;
  ok("Gravebind's five masteries are Simon's",D&&D.length===5&&D[0].n==='Heavy Chains'&&/\{40\}/.test(D[1].d)&&/\{12\}/.test(D[1].d)&&/wither/.test(D[1].d)&&/coils/.test(D[2].d)&&/60%/.test(D[2].d)&&/0\.6s/.test(D[3].d)&&/25% more/.test(D[3].d)&&/3 more foes/.test(D[4].d),D&&D.map(x=>x.n).join(', '));
  ok('his numbers are kept (no scaling), the masteries live in the cast (no add-on hooks), and a small hidden damage factor tops each level up to the ladder',SMA.gravebind.every(v=>v===1)&&!SMF.gravebind.hit&&!SMF.gravebind.cast&&SMG.gravebind.length===5&&SMG.gravebind.every(v=>v>=1&&v<1.3)&&GB_K.wither===.12,SMG.gravebind.join(' / '));
  /* ---- Mastery 0: the old Gravebind ---- */
  {const F=lay();rec=new Map();GB.dbg=[];castGravebind(heroU,F.e,100,o0());run(.95);const at=sum(F.e,h=>h.a>=119),sl=F.e.slow;run(3.2);
    ok('Mastery 0 is the old Gravebind (120% at the bind, 40% a second for 3s, 45% slower)',near(at,120,.01)&&near(sl,.45)&&near(sum(F.e),240,2.5)&&!GB.dbg.length&&sum(F.nb)===0,at.toFixed(1)+' then '+sum(F.e).toFixed(1));}
  /* ---- every level, from the cast at P 100 ---- */
  const res={};
  for(let L=1;L<=5;L++){const F=lay();rec=new Map();GB.dbg=[];gbCast(heroU,F.e,100,o0(),L);run(.95);
    const s0={e:F.e.slow,nb:F.nb.slow,ring:F.ring.slow,edge:F.edge.slow,out:F.out.slow,stun:F.e.stunT};run(1.2);const lashed=GB.dbg.find(d=>d.ev==='lashed');const mid={nb:F.nb.slow,nbT:F.nb.slowT};
    run(2.1);const after=F.e.slow;run(3);res[L]={e:sum(F.e),nb:sum(F.nb),ring:sum(F.ring),edge:sum(F.edge),out:sum(F.out)};
    ok('Mastery '+L+': the bind still hits for 120% and drains 40% a second',near(sum(F.e,h=>!h.sm&&!h.dot&&h.a>=119),120,.01)&&near(sum(F.e,h=>!h.sm&&h.a<119),120,2.5),sum(F.e,h=>!h.sm&&h.a<119).toFixed(1));
    ok('Mastery '+L+': Heavy Chains, 25% slower once the 3s bind is over',near(after,.25)&&GB.dbg.some(d=>d.ev==='after'),after);
    if(L>=2){const dr=sum(F.e,h=>h.sm&&h.dot),wi=GB.dbg.filter(d=>d.ev==='wither');
      ok('Mastery '+L+': Grave Drain 40% over 2s, and the foes around it in the darkness wither (the one beside it; not the ring, not the bound foe itself)',near(dr,40,.01)&&!wi.some(d=>d.e===F.e)&&wi.some(d=>d.e===F.nb)&&!wi.some(d=>d.e===F.ring||d.e===F.out),dr.toFixed(1));
      if(L===2)ok('Mastery 2: so the ring foe (outside the darkness) takes nothing: no Spreading Chains from the bound foe',sum(F.ring)===0,sum(F.ring).toFixed(1));}
    if(L>=3)ok('Mastery '+L+': the second chain coils round the foe beside it: 50% and 60% slower for 2s',lashed&&lashed.e===F.nb&&near(sum(F.nb,h=>h.sm&&!h.dot&&Math.abs(h.a-50)<1e-6),50)&&near(mid.nb,.6),(lashed?'lashed':'-')+' '+mid.nb);
    if(L>=4){ok('Mastery '+L+': the bound foe is held in place 0.6s',s0.stun>.5&&s0.stun<=.6,s0.stun);
      ok('Mastery '+L+': every foe on the wider rune is 25% slower still (the bound foe 45%+25%), the edge (1.1) and beyond are not',near(s0.e,.7)&&near(s0.ring,.25)&&!(s0.out>0),JSON.stringify(s0));}
    if(L>=5){const ch=GB.dbg.filter(d=>d.ev==='chained').map(d=>d.e);
      ok('Mastery 5: the greater rune (1.15) erupts for 10% on every foe on it, and its chains bind 3 more for 10% each',GB.dbg.some(d=>d.ev==='erupt')&&ch.length===3&&ch.includes(F.nb)&&ch.includes(F.ring)&&ch.includes(F.edge)&&near(sum(F.edge,h=>h.sm&&!h.dot),20)&&sum(F.out)===0,'edge '+sum(F.edge).toFixed(1));}}
  ok('damage per foe by level (e / beside / ring / edge / out)',true,JSON.stringify(Object.fromEntries(Object.entries(res).map(([k,v])=>[k,[v.e,v.nb,v.ring,v.edge,v.out].map(x=>Math.round(x))]))));
  /* ---- the withering stops once a foe leaves the darkness ---- */
  {const F=lay();rec=new Map();GB.dbg=[];gbCast(heroU,F.e,100,o0(),2);run(1.3);const w1=F.nb.wither&&F.nb.wither.t>0;F.nb.px+=2.5;F.nb.pz+=1.5;pin();run(1.2);
    const n=GB.dbg.filter(d=>d.ev==='wither'&&d.e===F.nb&&d.T>time-.9).length;ok('a foe that steps out of the darkness stops withering',w1&&!(F.nb.wither&&F.nb.wither.t>0)&&n===0,w1+' / '+n);}
  /* ---- the second chain fits the model: just outside a soldier, a loop low down round a boss ---- */
  {const F=lay();const big=put(.7,.3,'ogre');big.boss=true;rec=new Map();GB.dbg=[];removeEnemy(F.nb);removeEnemy(F.ring);enemies=enemies.filter(q=>!q.dead);
    gbCast(heroU,F.e,100,o0(),3);run(1.5);const ls=GB.dbg.find(d=>d.ev==='lash'),fb=gbFit(big);
    ok('round a boss the chain is a loop low down (under a third of its height), just outside its body',ls&&ls.e===big&&ls.coil.r>=fb.r*.8&&ls.coil.yb<=fb.y0+fb.h*.31&&ls.coil.turns<1.5,ls&&JSON.stringify({r:+ls.coil.r.toFixed(2),fr:+fb.r.toFixed(2),yb:+ls.coil.yb.toFixed(2),h:+fb.h.toFixed(2)}));
    clean();const s=put(0,0),q=put(.6,0);gbCast(heroU,s,100,o0(),3);GB.dbg=[];run(1.5);const fs=gbFit(q),C=gbCoil(q,fs);
    ok('round a soldier it coils from its legs to its chest, just outside it',C.r>=fs.r*.8&&C.yb>fs.y0+fs.h*.6&&C.yb<fs.y0+fs.h*.9&&C.turns>2,JSON.stringify({r:+C.r.toFixed(2),fr:+fs.r.toFixed(2),ya:+C.ya.toFixed(2),yb:+C.yb.toFixed(2),h:+fs.h.toFixed(2)}));}
  /* ---- the real cast reads the mastery level ---- */
  {const got=[];for(let L=0;L<=5;L++){const F=lay();setL(L);SM.cnt.gravebind=0;GB.dbg=[];rec=new Map();castScrollNow('gravebind',heroU,tStats(heroU),[F.e],100*smP('gravebind'),o0());run(1.2);
      const b=GB.dbg.find(d=>d.ev==='bind');got.push(b?b.L:0);setL(0);}
    ok('a real cast binds at the mastery the scroll has reached (0 = the old cast)',got.join()==='0,1,2,3,4,5',got.join());}
  /* ---- it tidies up ---- */
  {const F=lay();run(.3);const B0=new Set(scene.children),before=scene.children.length;rec=new Map();gbCast(heroU,F.e,100,o0(),5);run(1.2);const mid=scene.children.length;run(7);
    /* foes get a health bar in the scene the first time they are hurt: those (and the foes' own models) are not the spell's */
    const own=new Set();for(const q of enemies){if(q.bar)own.add(q.bar);if(q.g)own.add(q.g);}const extra=scene.children.filter(o=>!B0.has(o)&&!own.has(o));
    const left=scene.children.filter(o=>o.userData&&o.userData.sm).length;ok('Mastery 5 leaves nothing behind',!extra.length&&mid>before+3&&!left,before+' > '+mid+' > '+scene.children.length+' (new, not a foe bar or model: '+extra.length+' '+extra.map(o=>o.type+'/'+(o.geometry?o.geometry.type:'')+'/'+(o.material?o.material.type:'')+'/'+JSON.stringify(o.userData).slice(0,40)).join(' ')+', tagged left '+left+')');}
  /* ---- under the dark set (Grave Runes) ---- */
  {const F=lay();meta.arts=meta.arts||{own:{},eq:{},pend:[]};const ids=ARTS.filter(a=>a.el==='dark').slice(0,3).map(a=>a.id);ids.forEach(id=>meta.arts.own[id]=1);meta.arts.eq[heroU.hero]=ids;ART_V++;AS.k=null;asEl();asTick(.001);
    setL(5);const e0=errs;rec=new Map();castScrollNow('gravebind',heroU,tStats(heroU),[F.e],100,o0());run(3);ok('under the dark set it casts clean',AS.el==='dark'&&errs===e0&&sum(F.e)>0);
    meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;asEl();setL(0);}
  ok('no errors',errs===0,errs);
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{hurt=h0;rec=null;GB.dbg=null;scene.add=S0;console.error=ce;resetCine();state='menu';paused=false;clean();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;if(typeof asEl==='function')asEl();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
