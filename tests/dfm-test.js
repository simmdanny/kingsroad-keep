(function(){
/* Spatial Deflection's masteries as Simon designed them (v407). Run on the dev page: __kk.ev(await (await fetch('/tests/dfm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with (the cast's power is 100, so the snap is 250). Times are counted
   from the zone's start (the crystal's flight comes first). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
let RT=null,D0=0;
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  meta.spells.deflect=meta.spells.deflect||{lvl:1,hero:null};RT=ROUTES[0];D0=RT.len*.5;darkTarget=0;flashA=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;for(const e of enemies){if(e.stunT>0)e.stunT=Math.max(0,e.stunT-.05);if(e.slowT>0)e.slowT=Math.max(0,e.slowT-.05);}}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.deflect=SM_XP[L-1];else delete meta.smast.deflect;};
/* a foe on the road at distance d from the middle of the first route, standing still */
const foe=(dd,type,boss)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=RT;e.dist=D0+dd;e.off=0;moveEnemy(e,0);e.spd=1;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;if(boss)e.boss=true;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx)});return H0.apply(this,arguments);};};
/* cast on the foe at the middle (it is the densest), then step until the zone has formed */
const cast=(L,T)=>{setL(L);castScrollNow('deflect',heroU,tStats(heroU),[T],100,{src:heroU,bane:0,el:'light',anc:false,spell:'deflect'});let n=0;while(!SDP.z.some(z=>z&&z.x===T.x&&z.z===T.z)&&n++<40)run(.05);};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>DFM.dbg.filter(x=>x.ev===k);
const settled=()=>!DFM.ecS&&!DFM.fdS&&DFM.rw.every(q=>!q)&&!(SDP.sl||[]).some(Boolean)&&!(SDP.pl||[]).some(Boolean)&&!SDP.z.some(Boolean)&&SDP.n===0;
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.deflect.map(x=>x.n).join('|')==='Fractured Perspective|Echoes of Elsewhere|Folded Space|The Impossible Prison|Paradox Collapse',SM_D.deflect.map(x=>x.n).join('|'));
  ok('and his numbers: 35%, 50%, 75%, 100%, 60% and 150%',/35%/.test(smDesc('deflect',0))&&/50%/.test(smDesc('deflect',1))&&/75%/.test(smDesc('deflect',2))&&/100%/.test(smDesc('deflect',3))&&/60%/.test(smDesc('deflect',4))&&/150%/.test(smDesc('deflect',4))&&
    DFM.fr===.35&&DFM.ec===.5&&DFM.fo===.75&&DFM.pr===1&&DFM.px===.6&&DFM.pz===1.5);
  ok('the old masteries are gone, the factors are 1, Simon\'s numbers are kept (SM.free)',!SMF.deflect.cast&&!SMF.deflect.hit&&SMA.deflect.every(x=>x===1)&&SMG.deflect.every(x=>x===1)&&SM.free&&!!SM.free.deflect);
  ok('no mastery name is also a scroll\'s name',!SM_D.deflect.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  {sdpInit();const fs=SDP.mat.fragmentShader;ok('the warp pass is extended: ghost copies, the fold field and smooth ripples',!!SDP.mat.uniforms.uEc&&!!SDP.mat.uniforms.uFd&&!!SDP.mat.uniforms.uRw&&/uEc\.z>0\./.test(fs)&&/uFd\.z>0\./.test(fs)&&/uRw\[i\]/.test(fs));}
  /* ---- Mastery 0 ---- */
  {play();DFM.dbg=[];log=[];const T=foe(0),A=foe(1),F=foe(4);wrapHurt();try{cast(0,T);run(8.5);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the old snap (250% to each foe inside, once) and none of the masteries',hits(T,250,false).length===1&&hits(A,250,false).length===1&&!log.some(h=>h.e===F)&&!DFM.dbg.length&&!log.some(h=>h.smx),log.map(h=>h.amt).join(','));}
  /* ---- M1 Fractured Perspective ---- */
  {play();DFM.dbg=[];log=[];const T=foe(0),A=foe(1.2),B=foe(-1.5),F=foe(4);const added=track();wrapHurt();let pre=0,slOn=false,plOn=false;
    try{cast(1,T);run(DFM.SNAP-.1);pre=log.filter(h=>h.smx).length;run(.3);slOn=(SDP.sl||[]).some(Boolean);plOn=(SDP.pl||[]).some(Boolean);run(2.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M1: the fracture starts at the snap, not before',pre===0&&ev('fracture').length===1);
    ok('M1: its cracks bend the world along them and twist the ground beneath the foes they reach',slOn&&plOn);
    ok('M1: 35% once to every foe inside, none outside',[T,A,B].every(e=>hits(e,35,true).length===1)&&!hits(F,35).length,[T,A,B].map(e=>hits(e,35,true).length).join(','));
    ok('M1: nothing is left behind, the warp pass is handed back',smLeft(added)===0&&settled(),smLeft(added)+' '+SDP.n);}
  /* ---- M2 Echoes of Elsewhere ---- */
  {play();DFM.dbg=[];log=[];const T=foe(0),A=foe(1),Late=foe(5);const added=track();wrapHurt();let early=null,mid=null;
    try{cast(2,T);run(4.6);early=DFM.ecS?DFM.ecS.a1:0;run(1.5);mid=DFM.ecS?{a1:DFM.ecS.a1,a2:DFM.ecS.a2,o:Math.hypot(DFM.ecS.o1x,DFM.ecS.o1z)}:null;run(DFM.SNAP+.12-6.1);
      Late.dist=D0+.5;moveEnemy(Late,0);run(2.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M2: the copies appear only in the last two seconds, offset and translucent',early===0&&!!mid&&mid.a1>.3&&mid.a2>.3&&mid.o>.3,JSON.stringify(mid));
    ok('M2: they collapse in turn after the snap',ev('collapse').map(x=>x.i).join()==='0,1');
    ok('M2: 50% to each foe inside, from one copy only; a foe that came in later is caught by the second',[T,A].every(e=>hits(e,50,true).length===1)&&ev('echoHit').filter(x=>x.e===T||x.e===A).every(x=>x.i===0)&&hits(Late,50,true).length===1&&ev('echoHit').some(x=>x.e===Late&&x.i===1),[T,A,Late].map(e=>hits(e,50,true).length).join(','));
    ok('M2: nothing is left behind, the warp pass is handed back',smLeft(added)===0&&settled(),smLeft(added)+' '+SDP.n);}
  /* ---- M3 Folded Space ---- */
  {play();DFM.dbg=[];log=[];const T=foe(0),P=foe(1.3),Bf=foe(-1.3),Bs=foe(1.1,'ogre',true);const added=track();wrapHurt();const dP=P.dist,dB=Bf.dist,dS=Bs.dist;let before=null,during=null;
    try{cast(3,T);run(DFM.foT-.2);before={f:!!DFM.fdS,d:P.dist};run(2);during={c:DFM.fdS?DFM.fdS.crease:0,d:P.dist,b:Bf.dist,s:Bs.dist,sl:Bf.slowT};run(DFM.SNAP-DFM.foT-1.8+.2);run(2.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M3: the fold starts halfway through',!before.f&&before.d===dP&&during.c>.8,JSON.stringify(during));
    ok('M3: a ground foe past the centre is drawn back toward it; one before it is slowed, not moved; a boss is not moved',during.d<dP&&during.d>=D0-1e-9&&during.b===dB&&during.sl>0&&during.s===dS,(dP-during.d).toFixed(3));
    ok('M3: at the snap 75% to every foe inside (the boss too)',[T,P,Bf,Bs].every(e=>hits(e,75,true).length===1),[T,P,Bf,Bs].map(e=>hits(e,75,true).length).join(','));
    ok('M3: nothing is left behind, the warp pass is handed back',smLeft(added)===0&&settled(),smLeft(added)+' '+SDP.n);}
  /* ---- M4 The Impossible Prison ---- */
  {play();DFM.dbg=[];log=[];const T=foe(0),A=foe(-1.4),F=foe(4);const added=track();wrapHurt();let pre=0;
    try{cast(4,T);run(DFM.SNAP-.1);pre=hits(T,100).length;run(2.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M4: the prison rises, and shatters only at the snap',ev('prison0').length===1&&pre===0&&ev('prison').length===1);
    ok('M4: 100% to every foe inside, none outside',[T,A].every(e=>hits(e,100,true).length===1)&&!hits(F,100).length);
    ok('M4: nothing is left behind, the warp pass is handed back',smLeft(added)===0&&settled(),smLeft(added)+' '+SDP.n);}
  /* ---- M5 Paradox Collapse ---- */
  {play();DFM.dbg=[];log=[];const T=foe(0),P=foe(1.6),Bs=foe(1.2,'ogre',true),Fl=foe(-.8,'raven');Fl.fly=true;const W=foe(3.1);const added=track();wrapHurt();const dP=P.dist,dS=Bs.dist;let mid=null,dk=0;
    try{cast(5,T);run(DFM.pxT+.1);for(let i=0;i<12;i++){run(.05);dk=Math.max(dk,darkTarget);}mid={d:P.dist,s:Bs.dist,pinch:DFM.fdS?DFM.fdS.pinch:0};run(DFM.pxRes-DFM.pxT-.7+.2);run(1.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    const rup=ev('rupture')[0],res=ev('restore')[0];
    ok('M5: the zone collapses toward a point and draws the foes in (not bosses)',mid.pinch>1&&mid.d<dP&&mid.s===dS&&ev('pull').length>0,JSON.stringify(mid));
    ok('M5: it ruptures, then restores, in that order',!!rup&&!!res&&DFM.dbg.indexOf(rup)<DFM.dbg.indexOf(res));
    ok('M5: the rings deal 60% once to each foe they reach (flyers too)',[T,P,Bs,Fl].every(e=>hits(e,60,true).length===1),[T,P,Bs,Fl].map(e=>hits(e,60,true).length).join(','));
    ok('M5: the restoration deals 150% to every foe still in the zone; a foe outside it takes none',[T,P,Bs,Fl].every(e=>hits(e,150,true).length===1)&&!hits(W,150).length,[T,P,Bs,Fl,W].map(e=>hits(e,150,true).length).join(','));
    ok('M5: Masteries 1-4 ride it',ev('fracture').length===1&&ev('collapse').length===2&&ev('unfold').length===1&&ev('prison').length===1);
    ok('M5: the board\'s light comes back, nothing is left behind, the warp pass is handed back',darkTarget===0&&smLeft(added)===0&&settled(),darkTarget+' '+smLeft(added)+' '+SDP.n);}
  /* ---- other casters ---- */
  {play();DFM.dbg=[];log=[];setL(5);const T=foe(0);wrapHurt();try{castDeflectZone(heroU,{x:T.x,z:T.z},100,{src:heroU,el:'light'});castDeflectZone(heroU,{x:T.x+.01,z:T.z},100,{src:heroU,el:'light',spell:'deflect',smx:1,smId:1});run(8.5);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old spell',hits(T,250).length===2&&!DFM.dbg.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();DFM.dbg=[];setL(L);const T=foe(0);foe(.6);heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'deflect',s,[T]);run(10);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&(L<5||ev('restore').length===1)&&settled(),thrown+' '+SDP.n);}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;DFM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;flashA=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
