(function(){
if(typeof twLash!=='function')return [['Thorn Whip masteries v378 are not in this build: skipped',true,'']];
/* Thorn Whip's masteries as Simon redesigned them (v378): Barbs bleeds 20% over 3s with blood, Double Lash hits the same foe again for 35% of
   the hit, Rose Snare roots every whip hit for 0.4s (bosses 0.2s, Resolve), Briar Patch keeps its numbers, Rose Blight drains 1% of max health
   every 0.25s for 5s (bosses a quarter) through roses rooted on the toughest foe's own body. Run on the dev page:
   __kk.ev(await (await fetch('/tests/twm-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;if(typeof NAT!=='undefined'){NAT.zones.length=0;NAT.pollen.length=0;}};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{paused=false;for(let i=0;i<Math.round(sec/.05);i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const near=()=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;};
const foe=(d,hp,type,o)=>{const R=ROUTES[0];spawnEnemy(Object.assign({type:type||'soldier',v:0},o||{}),20);const e=enemies[enemies.length-1];e.route=R;e.dist=Math.max(.2,d);e.off=0;e.spd=.0001;e.maxHp=e.hp=hp;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);return e;};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.thornwhip=SM_XP[L-1];else delete meta.smast.thornwhip;};
const oF=()=>({src:heroU,bane:0,el:'nature',anc:false,spell:'thornwhip'});
const cast=(L,list,P)=>{setL(L);SM.cnt.thornwhip=0;castScrollNow('thornwhip',heroU,tStats(heroU),list,P||100,oF());};
const roses=e=>{let n=0;(e.b||e.g).traverse(o=>{if(o.userData&&o.userData.sm&&o.userData.open)n++;});return n;};
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
try{
  play();meta.smast={};
  ok('the five masteries are Simon’s, with his numbers',SM_D.thornwhip.map(p=>p.n).join()==='Barbs,Double Lash,Rose Snare,Briar Patch,Rose Blight'&&/\{35\}% of the hit/.test(SM_D.thornwhip[1].d)&&/0\.4s \(bosses 0\.2s/.test(SM_D.thornwhip[2].d)
    &&/1% of its health every 0\.25s for 5s/.test(SM_D.thornwhip[4].d)&&SMA.thornwhip.join()==='1,1,1,0.84,1'&&!!(SM.free&&SM.free.thornwhip),SM_D.thornwhip.map(p=>p.n).join());
  ok('the mastery card shows them without placeholders',SM_D.thornwhip.every((p,i)=>!/\{/.test(smDesc('thornwhip',i)))&&/35%/.test(smDesc('thornwhip',1)),smDesc('thornwhip',1));
  const D=150;   /* the whip's hit at P 100 */
  /* ---- M0: one hit of 150% and Overgrown, nothing else ---- */
  {const bd=near(),e=foe(bd,1e6);cast(0,[e]);run(.3);const h1=1e6-e.hp;run(3.5);ok('Mastery 0: one lash of 150%, nothing more',Math.abs(h1-D)<.5&&Math.abs(1e6-e.hp-D)<.5&&e.ovgT>0,(1e6-e.hp).toFixed(1));clean();}
  /* ---- M1: the bleed, 20% of the hit over 3s (nature hits an Overgrown foe 10% harder), and blood on the ground ---- */
  {const bd=near(),e=foe(bd,1e6);const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};cast(1,[e]);run(.3);const h1=e.hp;run(3.4);scene.add=S0;const bl=h1-e.hp;
    ok('Barbs: the foe bleeds 20% of the hit over 3s',Math.abs(bl-D*.2*1.1)<1,bl.toFixed(2)+' (expected '+(D*.2*1.1).toFixed(2)+')');
    const splats=added.filter(o=>o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x6a0814).length;ok('and it bleeds: splats of blood on the ground',splats>=4,splats);clean();}
  /* ---- M2: a second lash on the same foe for 35% of the hit ---- */
  {const bd=near(),e=foe(bd,1e6),q=foe(bd+.6,1e6);cast(2,[e,q]);run(.3);const h1=e.hp;run(.4);const d2=h1-e.hp;
    ok('Double Lash: the vine hits the same foe again for 35% of the hit',Math.abs(d2-D*.35*1.1)<1&&q.hp===1e6,d2.toFixed(2)+' (expected '+(D*.35*1.1).toFixed(2)+'), the other foe '+(1e6-q.hp));clean();}
  /* ---- M3: every whip hit roots for 0.4s, bosses 0.2s ---- */
  {const bd=near(),e=foe(bd,1e6);cast(3,[e]);run(.25);const s1=e.stunT;run(.25);const s2=e.stunT;
    ok('Rose Snare: the first lash roots the foe for 0.4s, the second lash roots it again',s1>.3&&s1<=.4+1e-6&&s2>.2,s1.toFixed(3)+' / '+s2.toFixed(3));clean();
    const b=foe(near(),1e7,'ogre');cast(3,[b]);run(.25);ok('a boss is rooted for 0.2s',b.boss&&b.stunT>.12&&b.stunT<=.2+1e-6,b.stunT.toFixed(3));clean();}
  /* ---- M4: the patch keeps its numbers ---- */
  {const bd=near(),e=foe(bd,1e6);setL(4);cast(4,[e]);run(.3);const sl=e.slow;run(3.4);clean();
    ok('Briar Patch: foes in it are 30% slower',Math.abs(sl-.3)<1e-6,sl);}
  /* ---- M5: Rose Blight ---- */
  {const bd=near(),e=foe(bd,1e6),f=foe(bd+.6,5e6),g=foe(bd-.6,2e6);let picked=null;const ri=twInfect;twInfect=function(c,q){picked=q;return ri.apply(this,arguments);};
    try{cast(5,[e,f,g]);run(1.3);}finally{twInfect=ri;}
    ok('Rose Blight slashes the toughest foe nearby',picked===f,picked&&picked.maxHp);ok('and roots roses on its body (on the parts of its own model)',roses(f)>=3,roses(f));run(6);
    ok('which are gone when it ends',roses(f)===0&&!(f.twInf&&f.twInf.ticks>0),roses(f));clean();}
  {const bd=near(),e=foe(bd,1e6),c={o:oF()};twInfect(c,e);run(2.6);const half=1e6-e.hp;run(3);const all=1e6-e.hp;
    ok('the drain: 1% of max health every 0.25s',Math.abs(half-1e6*.01*10)<1e6*.0101,half);ok('for 5s: 20% in all',Math.abs(all-2e5)<1,all);clean();
    const b=foe(near(),4e6,'ogre');b.res={};twInfect(c,b);run(5.6);ok('a boss takes a quarter: 0.25% a tick, 5% in all',Math.abs((4e6-b.hp)-2e5)<1,4e6-b.hp);clean();
    const q=foe(near(),1e6);twInfect(c,q);run(3);twInfect(c,q);run(5.6);ok('a second infection refreshes the first instead of doubling it',Math.abs((1e6-q.hp)-1e6*.01*(12+20))<1e6*.0105,1e6-q.hp);clean();}
  /* ---- every body: roses on the parts of the model, whatever the foe ---- */
  {const bad=[];for(const ty of Object.keys(EN)){if(EN[ty].fly)continue;play();const e=foe(near(),1e9,ty);twInfect({o:oF()},e);run(1);const n=roses(e);
      const bx=new THREE.Box3();(e.b||e.g).updateWorldMatrix(true,true);(e.b||e.g).traverse(o=>{if(o.isMesh&&!(o.userData&&o.userData.sm)&&!(o.parent&&o.parent.userData&&o.parent.userData.sm))bx.expandByObject(o);});bx.expandByScalar(.15);
      let off=0;(e.b||e.g).traverse(o=>{if(o.userData&&o.userData.sm&&o.userData.open){const v=new THREE.Vector3();o.getWorldPosition(v);if(!bx.containsPoint(v))off++;}});   /* on the body: inside its own bounds */
      if(n<2||off)bad.push(ty+':'+n+'/'+off);run(5);clean();}
    ok('every ground foe gets roses on its own body, none floating off it',!bad.length,bad.join(' '));}
  /* ---- a flyer: rooted, no coil on the ground ---- */
  {play();const r=foe(near(),1e6,'raven');r.res={};const got=twSnare(r);ok('a flyer is held but grows no coil from the ground',got>0&&!scene.children.some(o=>o.userData&&o.userData.sm&&o.position.distanceTo(new THREE.Vector3(r.x,o.position.y,r.z))<.01),got);run(1);clean();}
  /* ---- the patch notes: a new batch (masteries-1) with only what came after Never-Never Land; the changelog keeps everything ---- */
  ok('a brand new patch notes batch, from after Never-Never Land',NOTES_V==='masteries-1'&&/Thorn Whip masteries, reworked/.test(NOTES_HTML)&&/Artifact sets stay with their element/.test(NOTES_HTML)
    &&!/Never-Never Land<\/h3>/.test(NOTES_HTML)&&!/Dimensional Slash<\/h3>/.test(NOTES_HTML)&&!/The Deep Taiga<\/h3>/.test(NOTES_HTML)&&CLOG.some(c=>/Never-Never Land/.test(c.t))&&CLOG.some(c=>c.t==='Thorn Whip masteries reworked'),NOTES_V);
  /* ---- developer mode: a + beside every mastery not reached yet ---- */
  {play();state='menu';meta.spells.thornwhip=meta.spells.thornwhip||{lvl:1,hero:null};meta.smast={};meta.mast={};meta.dev=true;smOpen('thornwhip');let md=document.getElementById('smModal');const n0=md.querySelectorAll('.mst-add').length;
    md.querySelectorAll('.mst-add')[2].click();md=document.getElementById('smModal');const n1=md?md.querySelectorAll('.mst-add').length:-1;
    ok('developer mode: a + beside each mastery not reached; it adds it',n0===5&&smLv('thornwhip')===3&&n1===2&&md.querySelectorAll('.mst-lvl.on').length===3,n0+' > '+smLv('thornwhip')+', '+n1+' left');if(md)md.remove();
    mastOpen('archer');let mm=document.getElementById('mastModal');const b0=mm.querySelectorAll('.mst-add').length;mm.querySelector('.mst-add').click();ok('and in a building mastery card',b0===5&&mastLv('archer')===1,b0+' > '+mastLv('archer'));mm=document.getElementById('mastModal');if(mm)mm.remove();
    meta.dev=false;meta.smast={};smOpen('thornwhip');md=document.getElementById('smModal');ok('never outside developer mode',md&&md.querySelectorAll('.mst-add').length===0);if(md)md.remove();meta.dev=true;meta.mast={};}
  /* ---- every mastery casts clean and leaves nothing ---- */
  {const left=[],e0=errs;for(let L=1;L<=5;L++){play();const bd=near(),F=[];for(let i=0;i<8;i++)F.push(foe(bd+.3*(i-3.5),i%3?3000:400));const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};
      for(let c=0;c<4;c++){cast(L,enemies.filter(x=>!x.dead));run(4);}run(9);scene.add=S0;const st=added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let p=o;while(p&&p!==scene)p=p.parent;return p===scene;});
      let bodies=0;for(const q of enemies)bodies+=roses(q);if(st.length||bodies)left.push('M'+L+':'+st.length+'+'+bodies);clean();}
    ok('every mastery leaves nothing behind (scene and bodies)',!left.length,left.join(' '));ok('and casts without errors',errs===e0,errs-e0);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{scene.add=S0;console.error=ce;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
