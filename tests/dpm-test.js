(function(){
/* Dark Pulse's masteries as Simon designed them (v400). Run on the dev page: __kk.ev(await (await fetch('/tests/dpm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly (the cast's power is 100, so the
   pulse is 60). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();
  /* the hero stands 0.7 beside the middle of the first road, so the pulse reaches along it both ways */
  R=ROUTES[0];{const p=posAt(R.len*.45,R);heroU.x=p[0]+Math.cos(p[2])*.7;heroU.z=p[1]-Math.sin(p[2])*.7;}
  meta.spells.darkpulse=meta.spells.darkpulse||{lvl:1,hero:null};darkTarget=0;vigTarget=0;};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;for(const e of enemies){if(e.stunT>0)e.stunT=Math.max(0,e.stunT-.05);if(e.slowT>0)e.slowT=Math.max(0,e.slowT-.05);if(e.heldT>0)e.heldT=Math.max(0,e.heldT-.05);}}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.darkpulse=SM_XP[L-1];else delete meta.smast.darkpulse;};
let R=null;const hx=()=>heroU.x,hz=()=>heroU.z,Rr=()=>tStats(heroU).range*.85;
/* the road distance nearest the hero, and road distances whose point is r from the hero (before = toward the road's start) */
const hd=()=>{let bd=1e9,b=0;for(let d=0;d<R.len;d+=.02){const p=posAt(d,R),q=Math.hypot(p[0]-hx(),p[1]-hz());if(q<bd){bd=q;b=d;}}return b;};
const atR=(r,before)=>{const h=hd();let bd=1e9,b=null;for(let d=0;d<R.len;d+=.02){if(before?d>h:d<h)continue;const p=posAt(d,R),q=Math.abs(Math.hypot(p[0]-hx(),p[1]-hz())-r);if(q<bd){bd=q;b=d;}}return bd<.05?b:null;};
/* a foe on the road at distance d (sideways off), standing still */
const foe=(d,off,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=1;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;return e;};
const fly=(d)=>{const e=foe(d,0,'raven');e.fly=true;return e;};
const hr=e=>Math.hypot(e.x-hx(),e.z-hz());
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot)});return H0.apply(this,arguments);};};
const cast=L=>{setL(L);castScrollNow('darkpulse',heroU,tStats(heroU),enemies.filter(e=>!e.dead),100,{src:heroU,bane:0,el:'dark',anc:false,spell:'darkpulse'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const ev=k=>DPM.dbg.filter(x=>x.ev===k);
try{
  /* ---- the card ---- */
  ok('the five masteries carry Simon\'s names',SM_D.darkpulse.map(x=>x.n).join('|')==='Void Resonance|Echo Pulse|Rupture Wave|Black Sun|Event Horizon',SM_D.darkpulse.map(x=>x.n).join('|'));
  ok('and his numbers: 25%, 45%, 40%, 50%, 150% (and the implosion\'s 30%)',/25%/.test(smDesc('darkpulse',0))&&/45%/.test(smDesc('darkpulse',1))&&/40%/.test(smDesc('darkpulse',2))&&/50%/.test(smDesc('darkpulse',3))&&/150%/.test(smDesc('darkpulse',4))&&/30%/.test(smDesc('darkpulse',4))&&
    DPM.res===.25&&DPM.echo===.45&&DPM.rup===.4&&DPM.sun===.5&&DPM.eh===1.5&&DPM.ehImp===.3);
  ok('the old masteries are gone (only the ring\'s hit hook), the factors are set, Simon\'s numbers are kept (SM.free)',typeof SMF.darkpulse.hit==='function'&&!SMF.darkpulse.cast&&SMA.darkpulse.every(x=>x===1)&&SMG.darkpulse.every(x=>x>=1)&&SM.free&&!!SM.free.darkpulse);
  ok('no mastery name is also a scroll\'s name',!SM_D.darkpulse.some(x=>Object.values(SPELLS_S).some(s=>s.n===x.n)));
  /* ---- Mastery 0 ---- */
  {play();DPM.dbg=[];log=[];const r=Rr(),A=foe(atR(r*.5,false)),B=foe(atR(r*.5,true)),F=foe(atR(r+.6,false));wrapHurt();try{cast(0);run(3);}finally{hurt=H0;setL(0);}
    ok('Mastery 0: the old pulse (60% to each foe it reaches, once) and none of the masteries',hits(A,60,false).length===1&&hits(B,60,false).length===1&&!log.some(h=>h.e===F)&&!DPM.dbg.length&&!log.some(h=>h.smx),log.map(h=>h.amt).join(',')+' '+DPM.dbg.length);}
  /* ---- M1 Void Resonance ---- */
  {play();DPM.dbg=[];log=[];const r=Rr(),d=atR(r*.55,false),A=foe(d),B=foe(d+.3),C=foe(atR(r*.55,true)),Fl=fly(d+.15);const added=track();wrapHurt();
    try{cast(1);run(3);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M1: every foe the ring strikes releases a ripple (flyers too)',[A,B,C,Fl].every(e=>ev('res').some(x=>x.e===e)),ev('res').length);
    ok('M1: the ripple deals 25% to the foes around the struck one (here A and B and the raven over them: two each)',hits(A,25,true).length===2&&hits(B,25,true).length===2&&hits(Fl,25,true).length===2,[A,B,Fl].map(e=>hits(e,25,true).length).join(','));
    ok('M1: a foe alone takes none, and no ripple hurts the foe it came from',hits(C,25,true).length===0&&!ev('resHit').some(x=>x.e===x.src));
    ok('M1: the ring itself still deals its 60% once to each',[A,B,C,Fl].every(e=>hits(e,60,false).length===1));
    ok('M1: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M2 Echo Pulse ---- */
  {play();DPM.dbg=[];log=[];const r=Rr(),A=foe(atR(r*.4,false)),B=foe(atR(r*.9,true)),Fl=fly(atR(r*.7,false)),F=foe(atR(r+.6,false));const added=track();wrapHurt();
    try{cast(2);run(3.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    const e0=ev('echo0')[0];
    ok('M2: the echo bursts after the ring has reached its full size',!!e0&&e0.t>DPM.CH+DPM.WV,e0&&e0.t.toFixed(2));
    ok('M2: it deals 45% of the ring\'s damage (27%) once to every foe it reaches, flyers too',[A,B,Fl].every(e=>hits(e,27,true).length===1),[A,B,Fl].map(e=>hits(e,27,true).length).join(','));
    ok('M2: it reaches as far as the ring and no further',!hits(F,27).length&&Math.max(...ev('echo').map(x=>x.r))<=.2+r+1e-6);
    ok('M2: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M3 Rupture Wave ---- */
  {play();DPM.dbg=[];log=[];const r=Rr(),RM=.2+r,rs=DPM.rupAt.map(u=>RM*u),F=rs.map((x,i)=>foe(atR(x,i%2===0))),Mid=foe(atR((rs[0]+rs[1])/2,false)),Fl=fly(atR(rs[1],true));const added=track();wrapHurt();
    try{cast(3);run(3);}finally{hurt=H0;scene.add=S0;setL(0);}
    const ru=ev('rupture');
    ok('M3: three eruptions behind the front, at 34%, 63% and 92% of its reach, one after another',ru.length===3&&ru.every((x,i)=>near(x.r,rs[i],1e-6))&&ru.map(x=>x.i).join()==='0,1,2',ru.map(x=>x.r.toFixed(2)).join(','));
    ok('M3: each deals 40% to the ground foes on its line',F.every((e,i)=>hits(e,40,true).length===1&&ru[i].hit.includes(e)),F.map(e=>hits(e,40,true).length).join(','));
    ok('M3: foes between the lines and flyers are not hit',!hits(Mid,40).length&&!hits(Fl,40).length,hr(Mid).toFixed(2));
    ok('M3: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Black Sun ---- */
  {play();DPM.dbg=[];log=[];const r=Rr(),A=foe(atR(r*.3,false)),B=foe(atR(r*.95,true)),Fl=fly(atR(r*.6,false)),F=foe(atR(r+.6,false));const added=track();wrapHurt();let sunOk=false;
    try{cast(4);run(.3);sunOk=ev('sun').length===1;run(3.5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('M4: the charge orb is dressed as a black sun',sunOk);
    ok('M4: the wall deals 50% more to every foe the ring reaches, once, flyers too',[A,B,Fl].every(e=>hits(e,50,true).length===1&&hits(e,60,false).length===1)&&!hits(F,50).length,[A,B,Fl].map(e=>hits(e,50,true).length).join(','));
    ok('M4: the wall fractures into shards when the ring is done',ev('fracture').length===1);
    ok('M4: nothing is left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M5 Event Horizon ---- */
  {play();DPM.dbg=[];log=[];const r=Rr(),RM=.2+r*DPM.ehW,h=hd(),P=foe(atR(r*.6,false)),Bf=foe(atR(r*.6,true)),W=foe(atR((.2+r+RM)/2,true)),Fl=fly(atR(r*.4,false)),F=foe(atR(RM+.5,false));
    const added=track();wrapHurt();const dP=P.dist,dB=Bf.dist;let mid=null,dkMax=0;
    try{cast(5);for(let i=0;i<24;i++){run(.05);dkMax=Math.max(dkMax,darkTarget);}mid={P:P.dist,B:Bf.dist,stB:Bf.stunT};run(4);}finally{hurt=H0;scene.add=S0;setL(0);}
    const rel=ev('release')[0];
    ok('M5: the old pulse is not cast: no 60% hit',!log.some(h=>near(h.amt,60)));
    ok('M5: the area darkens while the sphere charges, and the light comes back',dkMax>.2&&darkTarget===0&&vigTarget===0,dkMax.toFixed(2)+' '+darkTarget);
    ok('M5: the implosion deals 30% to every foe within the normal reach (flyers too), not beyond',[P,Bf,Fl].every(e=>hits(e,30,true).length===1)&&!hits(W,30).length&&!hits(F,30).length,[P,Bf,Fl,W].map(e=>hits(e,30,true).length).join(','));
    ok('M5: a ground foe already past the hero is drawn back toward it (at most 0.35), one before it is seized, not moved',mid&&dP-mid.P>0&&dP-mid.P<=DPM.ehPull+1e-9&&mid.P>h&&mid.B===dB&&mid.stB>0,mid&&((dP-mid.P).toFixed(3)+' '+mid.stB.toFixed(2)));
    ok('M5: the colossal ring is released after the implosion',!!rel&&rel.t>=DPM.ehT0-1e-6,rel&&rel.t.toFixed(2));
    ok('M5: it deals 150% once to every foe it reaches, 30% further than the old pulse (flyers too), not beyond',[P,Bf,W,Fl].every(e=>hits(e,150,false).length===1)&&!log.some(h=>h.e===F&&!h.smx),[P,Bf,W,Fl].map(e=>hits(e,150,false).length).join(','));
    ok('M5: it knocks foes back as the pulse does',W.dist<atR((.2+r+RM)/2,true)-.3,(atR((.2+r+RM)/2,true)-W.dist).toFixed(3));
    ok('M5: Masteries 1-4 ride it: the echo is 45% of 150%, the wall 50%, three ruptures',[P,W].every(e=>hits(e,67.5,true).length===1&&hits(e,50,true).length===1)&&ev('rupture').length===3&&ev('res').length>=4);
    ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}
  {play();DPM.dbg=[];log=[];const r=Rr(),Hd=foe(atR(r*.5,false));Hd.heldT=5;const d=Hd.dist;wrapHurt();try{cast(5);run(3.5);}finally{hurt=H0;setL(0);}
    ok('M5: a held foe is neither drawn nor pushed and takes double instead (Torn Asunder)',hits(Hd,300,false).length===1&&Math.abs(Hd.dist-d)<1e-9,hits(Hd,300,false).length+' '+(Hd.dist-d).toFixed(3));}
  /* ---- other casters ---- */
  {play();DPM.dbg=[];log=[];setL(5);const r=Rr(),A=foe(atR(r*.5,false));wrapHurt();try{castDarkPulse(heroU,r,60,{src:heroU,el:'dark'});castDarkPulse(heroU,r,60,{src:heroU,el:'dark',spell:'darkpulse',smx:1,smId:1});run(3);}finally{hurt=H0;setL(0);}
    ok('other casters and mastery echoes are the old pulse',hits(A,60).length===2&&!DPM.dbg.length);}
  /* ---- the real cast path ---- */
  for(const L of [1,3,5]){play();DPM.dbg=[];setL(L);const r=Rr();foe(atR(r*.5,false));foe(atR(r*.7,true));heroU.scd={};heroU.gcd=0;const s=tStats(heroU);let thrown='';
    try{fireScroll(heroU,'darkpulse',s,enemies.filter(e=>!e.dead));run(3.5);}catch(err){thrown=err.message;}finally{setL(0);}
    ok('the real cast path at Mastery '+L,!thrown&&ev('cast').some(x=>x.L===L)&&(L<5||ev('release').length===1),thrown);}
  ok('no errors were logged',errs===0,errs);
}catch(err){ok('the suite ran',false,err.stack);}
finally{hurt=H0;scene.add=S0;console.error=ce;DPM.dbg=null;clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;darkTarget=0;vigTarget=0;buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
