(function(){
/* The Primordial Tempest's masteries (v465). Run on the dev page: __kk.ev(await (await fetch('/tests/tpm-test.js')).text()) returns [name, ok, detail] rows.
   Foes stand still on the road beside the hero; the game is stepped (update and updFx), hurt is wrapped to log the amount of each hit and the storm's
   time (the scroll's power is 100: the crown 200, a strike 450, its leap 157.5, the last thunder 1000, the fall 300). Every mastered storm logs its
   events (TPM.dbg: its options, each volley with its foes, each crown, leap, wall, last-thunder and fall hit), so the counts and reaches are checked
   exactly. Puts the account back. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
const T=()=>ANC.live.tempest?ANC.live.tempest.T:-1,runTo=t=>{for(let i=0;i<900&&ANC.live.tempest&&T()<t;i++)run(.05);};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.spaceCalm=false;meta.mapIntro=0;state='menu';clearWorld();{const gv=MAP_GV;MAP_GV=5;try{buildMap(777);}finally{MAP_GV=gv;}}MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];
  state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;__kk.camXZ(heroU.x,heroU.z,1);scene.updateMatrixWorld(true);}
/* the road spot nearest the hero (more than 1.2 away), as the ladder finds it */
function nearD(R){let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];e0.off=0;
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1.2){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);return bdist;}
function foe(R,d,i,hp){spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=Math.max(.2,Math.min(R.len-.5,d));e.off=0;e.hp=e.maxHp=hp||1e6;e.armor=0;e.res={};e.shield=0;e.spd=0;moveEnemy(e,0);return e;}
/* twelve (or n) foes along the road round the spot nearest the hero (0.3 apart), and one far down the road */
function stage(hp,far,n){go();n=n||12;const R=ROUTES[0],bd=nearD(R),F=[];for(let i=0;i<n;i++)F.push(foe(R,bd+.3*(i-(n-1)/2),i,hp));if(far){let fd=bd,fq=null;for(let d=0;d<R.len;d+=.5){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=d;e.off=0;moveEnemy(e,0);const q=Math.hypot(e.x-heroU.x,e.z-heroU.z);removeEnemy(e);enemies=enemies.filter(z=>!z.dead);if(q>7&&q<9){fd=d;fq=q;break;}}F.far=foe(R,fd,1,hp);F.farD=fq;}return F;}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.tempest=SM_XP[L-1];else delete meta.smast.tempest;};
const oT=()=>({src:heroU,bane:0,el:'lightning',anc:true,spell:'tempest'});
const cast=L=>{setL(L);castScrollNow('tempest',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oT());worldSlow=1;slowT=0;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,sp:!!(o&&o.spell),T:T()});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>TPM.dbg.filter(d=>d.ev===n);
const hits=(e,amt,lo,hi)=>log.filter(h=>h.e===e&&h.sp&&near(h.amt,amt)&&(lo==null||h.T>=lo)&&(hi==null||h.T<=hi));
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const left=added=>added.filter(o=>{if(o.userData&&o.userData.pfBar)return false;if(o.userData&&(o.userData.pcrPool||o.userData.pcrBucket))return false;let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const lift=()=>heroU.g.position.y-gy(heroU.x,heroU.z);
/* one whole storm at mastery L: hurt logged, the hero's height and the foes' Charged seen on the way */
function storm(L,F,o){o=o||{};TPM.dbg=[];log=[];const added=track();const S={};wrapHurt();
  try{cast(L);S.live=ANC.live.tempest;S.E=TPE.on;runTo(3.2);S.zap=Math.max(...F.map(e=>e.zapT||0));runTo(8);S.lift=lift();S.WH=S.E&&S.E.WH;S.ROUT=S.E&&S.E.ROUT;S.NAR=S.E&&S.E.NAR;S.TH=S.E&&S.E.TH;
    if(o.mid)o.mid(S);runTo(19.9);run(1.5);
    /* (a foe still Charged crackles: that is the status's own spark, not the storm's; it is let run out before counting) */
    for(const e of enemies)e.zapT=0;run(.6);}finally{hurt=H0;scene.add=S0;setL(0);}
  S.left=left(added);S.gone=!ANC.live.tempest&&!ANC.on&&!TPE.on;return S;}
try{
  /* ---- the card ---- */
  ok('the five masteries: Crown of Thunder, The Storm Chooses, Leaping Bolts, The Eye Wall, Hurricane (v465)',SM_D.tempest.map(x=>x.n).join('|')==='Crown of Thunder|The Storm Chooses|Leaping Bolts|The Eye Wall|Hurricane',SM_D.tempest.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (300%, 6s; 3 rising to 8; 50%, 3 tiles; 80%, 0.6s; 1300%, 300% to every foe)',
    /300%/.test(smDesc('tempest',0))&&/6s/.test(smDesc('tempest',0))&&/3 rising to 8/.test(smDesc('tempest',1))&&/50%/.test(smDesc('tempest',2))&&/3 tiles/.test(smDesc('tempest',2))
    &&/80%/.test(smDesc('tempest',3))&&/0\.6s/.test(smDesc('tempest',3))&&/1300%/.test(smDesc('tempest',4))&&/300% to every foe/.test(smDesc('tempest',4))
    &&TPM.crown===3&&TPM.ch===6&&TPM.vN0===3&&TPM.vMax===8&&TPM.leap===.5&&TPM.leapR===3&&TPM.wall===.8&&TPM.wallCd===.6&&TPM.fin===13&&TPM.fall===3);
  ok('its own masteries (no hooks); calibrated with hidden factors on the Ancient half-step ladder, weighed pack .6 / one .4',SMF.tempest.m===1&&!SMF.tempest.hit&&!SMF.tempest.cast&&SMA.tempest.every(x=>x===1)&&SMG.tempest.length===5&&SMG.tempest.every(x=>x>=.9&&x<1.15)&&SMW.tempest.pack===.6&&SMW.tempest.one===.4
    &&[1,2,3,4,5].map(L=>smTarget('tempest',L).toFixed(3)).join()==='1.078,1.162,1.226,1.302,1.350',SMG.tempest.join());
  ok('the defaults table is the old storm (200%, 4s, 2 to 7, 35% within 2.2, no wall strikes, 1000%, 300% within 2.6, 18 ground bolts 2.5-6) and the v465 hurricane',
    TPD.crownK===2&&TPD.chT===4&&TPD.vN0===2&&TPD.vMax===7&&TPD.leapK===.35&&TPD.leapR===2.2&&TPD.leapW===.6&&!TPD.wallK&&TPD.finK===10&&TPD.finW===1.9&&TPD.fallK===3&&!TPD.fallAll&&TPD.fallR===2.6&&TPD.fallN===18&&TPD.fallLo===2.5&&TPD.fallHi===6
    &&TPD.lift===2.2&&TPD.wallH===5&&!TPD.crawl&&!TPD.debris&&!TPD.hur&&!TPD.bandAll);
  /* ---- Mastery 0 ---- */
  {const F=stage();TPM.dbg=[];wrapHurt();log=[];try{setL(0);castTempest(heroU,100,oT(),{log:d=>{d.t=time;TPM.dbg.push(d);}});runTo(19.9);run(1.5);}finally{hurt=H0;}
    const V=ev('volley');ok('the defaults as options are the old volleys (2 rising to 7 foes)',V.length>=10&&V.every(v=>v.n===Math.min(7,2+Math.floor(v.vi/2))&&v.L.length<=v.n)&&V.some(v=>v.n===7),V.map(v=>v.n).join(','));}
  {const F=stage();const S=storm(0,F),L1=log.slice();
    const reg=TPST.dbg;
    ok('Mastery 0: the crown 200% to every foe, Charged 4s; the hero lifted to 2.2 (v465, 1.55 before), the wall about 5 tall',F.every(e=>hits(e,200,2.3,4.5).length===1)&&S.zap>3&&S.zap<=4+1e-9&&near(S.lift,2.2,.03)&&S.WH===5,F.map(e=>hits(e,200,2.3,4.5).length).join('')+' '+S.zap.toFixed(2)+' '+S.lift.toFixed(2));
    ok('Mastery 0: strikes of 450% leaping on for 35%, the last thunder 1000% to every foe, the fall 300% within 2.6 tiles only',
      F.some(e=>hits(e,450).length>=3)&&F.some(e=>hits(e,157.5).length>0)&&F.every(e=>hits(e,1000,16).length===1)&&F.every(e=>hits(e,300,16.8).length===(Math.hypot(e.x-heroU.x,e.z-heroU.z)<2.6?1:0))&&!L1.some(h=>h.sp&&(near(h.amt,80)||near(h.amt,225)||near(h.amt,1300))),
      F.map(e=>hits(e,300,16.8).length).join(''));
    ok('Mastery 0: no mastery events, nothing left behind',!TPM.dbg.length&&S.left===0&&S.gone,S.left);}
  /* ---- M1 Crown of Thunder ---- */
  {const F=stage();const S=storm(1,F),o=ev('opts')[0];
    ok('M1: the crown bolt strikes every foe for 300% (200% before)',F.every(e=>hits(e,300,2.3,4.5).length===1&&!hits(e,200,2.3,4.5).length)&&ev('crown').length===F.length&&ev('crown').every(d=>near(d.dmg,300)),ev('crown').length);
    ok('M1: they stay Charged for 6s (4s before)',S.zap>5&&S.zap<=6+1e-9,S.zap.toFixed(2));
    ok('M1: the hero is lifted higher (2.8), the eye wall rises taller (6.2); the volleys as before',near(S.lift,2.8,.03)&&S.WH===6.2&&ev('volley').every(v=>v.n===Math.min(7,2+Math.floor(v.vi/2))),S.lift.toFixed(2)+' '+S.WH);
    ok('M1: nothing left behind',S.left===0&&S.gone,S.left);}
  /* ---- M2 The Storm Chooses ---- */
  /* (twenty foes: the last volleys' foes are still locked when the next volley comes) */
  {const F=stage(0,false,20);const S=storm(2,F),V=ev('volley');
    ok('M2: one more foe in every volley, 3 rising to 8 (2 to 7 before)',V.length>=10&&V.every(v=>v.n===Math.min(8,3+Math.floor(v.vi/2))&&v.L.length<=v.n)&&V[0].L.length===3&&V.some(v=>v.L.length===8),V.map(v=>v.L.length).join(','));
    ok('M2: spiral rain bands across the whole field (4 bands to 22 tiles; 3 to 8 before), the wall thicker',S.NAR===4&&S.ROUT>=22&&S.TH>1.75*1.2,S.NAR+' '+S.ROUT+' '+S.TH);
    ok('M2: nothing left behind',S.left===0&&S.gone,S.left);}
  /* ---- M3 Leaping Bolts ---- */
  {const F=stage();const S=storm(3,F),Lp=ev('leap');
    ok('M3: each strike leaps on for 50% (35% before), within 3 tiles, on a thicker bolt; lightning crawls between the rain bands',Lp.length>5&&Lp.every(d=>near(d.dmg,225)&&d.d<=3+1e-9)&&F.some(e=>hits(e,225).length)&&!log.some(h=>h.sp&&near(h.amt,157.5))&&ev('opts')[0].X.leapW===.85&&S.E.crawls>0,Lp.length+' leaps, '+S.E.crawls+' crawls');
    ok('M3: nothing left behind',S.left===0&&S.gone,S.left);}
  /* the reach: foes 2.6 apart (none nearer) leap at Mastery 3, not at Mastery 0 */
  /* (on a straight stretch of the road: three foes 2.6 apart along it, none nearer each other than 2.35) */
  {const leaps=L=>{go();const R=ROUTES[0];let F=[],md=0;for(let d0=1;d0<R.len-6;d0+=.5){for(const e of F)removeEnemy(e);enemies=enemies.filter(e=>!e.dead);F=[0,1,2].map(i=>foe(R,d0+2.6*i,i));md=9;for(const a of F)for(const b of F)if(a!==b)md=Math.min(md,Math.hypot(a.x-b.x,a.z-b.z));if(md>2.35&&md<2.9)break;}
      TPM.dbg=[];log=[];wrapHurt();try{cast(L);runTo(15.4);}finally{hurt=H0;setL(0);}const n=log.filter(h=>h.sp&&(near(h.amt,157.5)||near(h.amt,225))).length;resetCine();updFx(.05);return[n,md];};
    const [n0,md]=leaps(0),[n3]=leaps(3);ok('M3: the bolt leaps up to 3 tiles (foes 2.6 apart: no leap at Mastery 0, leaps at Mastery 3)',md>2.25&&md<3&&n0===0&&n3>3,'apart '+md.toFixed(2)+': '+n0+' / '+n3);}
  /* ---- M4 The Eye Wall ---- */
  {const F=stage();const S=storm(4,F),W=ev('wall'),per=new Map();W.forEach(d=>per.set(d.e,(per.get(d.e)||[]).concat(d.Tm)));
    const RR=S.E.RW+S.E.SL*3.2+1.5,ds=W.map(d=>Math.hypot(d.e.x-S.E.hx,d.e.z-S.E.hz));
    ok('M4: the arcs racing round the hero through the wall strike the foes they pass, for 80%',W.length>=10&&per.size>=3&&W.every(d=>near(d.dmg,80))&&W.length===log.filter(h=>h.sp&&near(h.amt,80)).length,W.length+' strikes on '+per.size+' foes');
    ok('M4: each foe at most once every 0.6s, and only near the hero',[...per.values()].every(ts=>ts.every((t,i)=>!i||t-ts[i-1]>=.6-1e-6))&&Math.max(...ds)<RR,Math.max(...ds).toFixed(2)+' < '+RR.toFixed(2));
    ok('M4: the arcs flare where they strike (a bolt drops to the foe), debris whirls in the wind',S.E.hits===W.length&&S.E.strikes.length>0&&S.E.D.debris===1);
    ok('M4: nothing left behind',S.left===0&&S.gone,S.left);}
  {const F=stage();storm(3,F);ok('M4 needs Mastery 4 (no wall strikes at Mastery 3)',!ev('wall').length&&!log.some(h=>h.sp&&near(h.amt,80)));}
  /* (every foe's Charge taken away mid-storm: the first foe the wall strikes, and nothing else struck in that step, is Charged 6s at once) */
  {const F=stage();const S=storm(4,F,{mid:S=>{for(const e of F)e.zapT=0;let f=null;for(let i=0;i<200&&!f;i++){const n0=ev('wall').length,l0=log.length;run(.05);
      for(const w of ev('wall').slice(n0))if(!w.e.dead&&!log.slice(l0).some(h=>h.e===w.e&&h.sp&&!near(h.amt,80))){f=w;S.wz=w.e.zapT;break;}}}});
    ok('M4: a foe the wall strikes is Charged (6s with Crown of Thunder)',S.wz>5.9&&S.wz<=6,S.wz);}
  /* ---- M5 Hurricane ---- */
  {const F=stage(0,true),far=F.far,all=F.concat([far]);const S=storm(5,all),Fw=ev('fallwave');
    ok('M5: the last thunder strikes every foe for 1300% (1000% before)',all.every(e=>hits(e,1300,16).length===1)&&!log.some(h=>h.sp&&near(h.amt,1000))&&ev('fin')[0]&&near(ev('fin')[0].dmg,1300),all.map(e=>hits(e,1300,16).length).join(''));
    ok("M5: the hero's fall rolls out over the whole field: 300% to every foe, the far one too ("+(F.farD||0).toFixed(1)+' tiles off)',F.farD>7&&Fw.length===all.length&&all.every(e=>hits(e,300,16.8).length===1)&&Fw.some(d=>d.e===far)&&!ev('fall').length,Fw.length+' of '+all.length);
    const o=ev('opts')[0].X;
    ok('M5: the full hurricane (the hero high in its eye, the wall towering, the outflow across the sky); wider last bolts, the fall\'s bolts across the field',near(S.lift,4,.04)&&S.WH===10.5&&o.finW===2.4&&o.fallN===28&&o.fallLo===4&&o.fallHi===10&&o.outflow>1&&o.hur===1,S.lift.toFixed(2)+' '+S.WH);
    ok('M5: Masteries 1-4 ride it (300% crown, 3 to 8 foes a volley, 50% leaps, wall strikes)',all.every(e=>hits(e,300,2.3,4.5).length===1)&&ev('volley').every(v=>v.n===Math.min(8,3+Math.floor(v.vi/2)))&&ev('leap').every(d=>near(d.dmg,225))&&ev('wall').length>0);
    ok('M5: nothing left behind',S.left===0&&S.gone,S.left);}
  {const F=stage(0,true);storm(4,F.concat([F.far]));ok('M5 needs Mastery 5 (at Mastery 4: 1000%, and the fall only within 2.6 tiles)',!ev('fallwave').length&&hits(F.far,1000,16).length===1&&!hits(F.far,300,16.8).length);}
  /* ---- the eye stays cheap with its masteries ---- */
  {const F=stage();cast(5);for(let i=0;i<8;i++)F.push(foe(ROUTES[0],F[0].dist+.25*i,i));runTo(8);const E=TPE.on;E.foes=enemies.filter(e=>!e.dead);
    const t0=performance.now();for(let i=0;i<100;i++)E.api.step(8,.016,100+i*.016,heroU.g.position,0,0);const ms=(performance.now()-t0)/100;
    let err=null;try{anim(.016,performance.now()/1000);renderer.render(scene,camera);}catch(x){err=x.message;}
    ok('the full hurricane stays cheap: its eye under 1 ms a frame (with the wall looking for foes), and it renders',ms<1&&!err,ms.toFixed(3)+' ms '+(err||''));setL(0);resetCine();updFx(.05);updFx(.05);}
  /* ---- the rest ---- */
  {const F=stage();TPM.dbg=[];log=[];wrapHurt();try{cast(5);run(6);const lv=ANC.live.tempest,T0=lv.T;setL(0);castScrollNow('tempest',heroU,heroStats(),enemies.filter(e=>!e.dead),100,oT());
      ok('casting it again while it rages winds it back, keeping its masteries',ANC.live.tempest===lv&&lv.T<T0,T0.toFixed(2)+' > '+lv.T.toFixed(2));runTo(19.9);run(1.5);}finally{hurt=H0;setL(0);}
    ok('the wound-back storm still strikes 1300% at the end (the first cast\'s options rule)',ev('opts').length===1&&F.every(e=>hits(e,1300,16).length===1)&&!log.some(h=>h.sp&&near(h.amt,1000)));}
  {const F=stage();TPM.dbg=[];log=[];setL(5);wrapHurt();try{NSP.tempest(heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'lightning',spell:'tempest'});runTo(19.9);run(1.5);}finally{hurt=H0;setL(0);}
    ok('casts that are not a mastered scroll cast are the old storm',!TPM.dbg.length&&F.every(e=>hits(e,1000,16).length===1&&hits(e,200,2.3,4.5).length===1));}
  {const e0=errs;const bad=[];for(let L=1;L<=5;L++){const F=stage(300);heroU.scd={};heroU.gcd=0;setL(L);meta.spells.tempest=meta.spells.tempest||{lvl:1,hero:null};TPM.dbg=[];fireScroll(heroU,'tempest',heroStats(),F.slice());
      for(let i=0;i<60&&!ANC.live.tempest;i++)run(.05);worldSlow=1;slowT=0;runTo(19.9);run(1.5);const o=ev('opts')[0];if(!o||o.L!==L||F.some(e=>!e.dead)||ANC.live.tempest)bad.push(L+':'+(o?o.L:'-')+'/'+F.filter(e=>!e.dead).length);}setL(0);
    ok('the real cast path at every mastery (the masteries arrive, every foe dies) runs without errors',errs===e0&&!bad.length,(errs-e0)+' errors '+bad.join(','));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;TPM.dbg=null;window.__fz=false;try{resetCine();CAM.px=0;CAM.pz=0;CAM.zoom=1;applyCam();for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);ancUnfilter();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
