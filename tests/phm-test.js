(function(){
/* Rite of the Phoenix's masteries (v421). Run on the dev page: __kk.ev(await (await fetch('/tests/phm-test.js')).text())
   returns [name, ok, detail] rows. Foes stand on the road where they are put (only the effects are stepped, updFx, with the game clock moved
   along), and hurt is wrapped to log the amount each hit is called with, so the numbers are checked exactly. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add,B0=cfmBoom,F0=flash;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.phoenix=SM_XP[L-1];else delete meta.smast.phoenix;};
const spotD=()=>{const R=ROUTES[0];let bd=1e9,bdd=0;for(let d=4.5;d<R.len-2;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;bdd=d;}}return bdd;};
const foe=(d,off,hp)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d;e.off=off||0;moveEnemy(e,0);e.spd=.0001;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),dot:!!(o&&o.dot),t:time});return H0.apply(this,arguments);};};
const cast=(L,lead)=>{setL(L);castScrollNow('phoenix',heroU,tStats(heroU),[lead],100,{src:heroU,bane:0,el:'fire',anc:false,spell:'phoenix'});};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const hits=(e,amt,smx)=>log.filter(h=>h.e===e&&!h.dot&&(smx==null||h.smx===smx)&&near(h.amt,amt));
const ev=n=>PHM.dbg.filter(d=>d.ev===n);
const MEV=['white','flareStart','flare','feather','pyre','ashes','rekindle','firebird'];
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const END=9;
/* a column of n foes behind the lead (the phoenix skims back along the road from just ahead of the lead) */
const column=(n,gap,hp)=>{const d0=spotD(),F=[];for(let i=0;i<n;i++)F.push(foe(d0-i*(gap||.5),0,hp));return F;};
try{
  /* ---- the card ---- */
  ok('the five masteries: White-Hot, Wildfire River, Burning Plumage, Pyre, From the Ashes (v440)',SM_D.phoenix.map(x=>x.n).join('|')==='White-Hot|Wildfire River|Burning Plumage|Pyre|From the Ashes',SM_D.phoenix.map(x=>x.n).join('|'));
  ok('the numbers on the card are the ones in the code (5th, 40% / 50%, 60%, 50%, 10%, 4s / 60% / 6)',/5th/.test(smDesc('phoenix',0))&&/40%/.test(smDesc('phoenix',0))&&/50%/.test(smDesc('phoenix',0))&&/60%/.test(smDesc('phoenix',1))&&/50%/.test(smDesc('phoenix',2))&&/10%/.test(smDesc('phoenix',3))
    &&/4s/.test(smDesc('phoenix',4))&&/60%/.test(smDesc('phoenix',4))&&/up to 6/.test(smDesc('phoenix',4))
    &&PHM.whiteN===5&&PHM.white===.4&&PHM.riverHot===.5&&PHM.rv===.6&&PHM.ft===.5&&PHM.ftN===8&&PHM.py===.1&&PHM.pyR===.75&&PHM.ash===.6&&PHM.ashT===4&&PHM.ashN===6&&PHM.ashR===4);
  ok('the old masteries are gone (no hooks), calibrated on the Epic ladder with hidden factors (not SM.free)',!SMF.phoenix.hit&&!SMF.phoenix.cast&&SMA.phoenix.every(x=>x===1)&&SMG.phoenix.length===5&&SMG.phoenix.every(x=>x>=1&&x<1.25)&&!(SM.free&&SM.free.phoenix),SMG.phoenix.join());
  /* ---- Mastery 0 ---- */
  {play();PHM.dbg=[];log=[];const F=column(4);let nb=0,nf=0;cfmBoom=function(){nb++;return B0.apply(this,arguments);};flash=function(){nf++;return F0.apply(this,arguments);};wrapHurt();
    try{cast(0,F[0]);run(END);}finally{hurt=H0;cfmBoom=B0;flash=F0;setL(0);}const st=ev('strike');
    ok('Mastery 0: the same skim: each foe struck once for 350% and set burning, then the burst in the sky',st.length===4&&F.every(e=>hits(e,350,false).length===1&&st.filter(d=>d.e===e).length===1)&&ev('burst').length===1&&ev('born').length===1,st.length+' strikes');
    ok('Mastery 0: no masteries (no extra hits, no mastery events)',!log.some(h=>h.smx)&&!PHM.dbg.some(d=>MEV.includes(d.ev))&&st.every(d=>!d.hot));
    ok('Mastery 0: its birth, strikes and death burst are 3D fireballs, no flat flashes',nb>=st.length+2&&nf===0,nb+' fireballs, '+nf+' flashes');}
  /* ---- M1 White-Hot ---- */
  {play();PHM.dbg=[];log=[];const F=column(7,.45),FT=nsFireTrail,ft=[];nsFireTrail=function(x,z,P2){ft.push({P:P2,t:time});return FT.apply(this,arguments);};wrapHurt();
    try{cast(1,F[0]);run(END);}finally{hurt=H0;nsFireTrail=FT;setL(0);}const st=ev('strike'),wh=ev('white');
    ok('M1: its 5th strike sets it white-hot (once)',st.length===7&&wh.length===1&&wh[0].n===5&&near(wh[0].t,st[4].t,.01)&&st.every((d,i)=>d.hot===(i>=4)),st.map(d=>d.hot?1:0).join(''));
    ok('M1: from that strike on, each strike deals 40% more (350% x 40%, a mastery hit); none before',st.every((d,i)=>i<4?!log.some(h=>h.e===d.e&&h.smx):hits(d.e,350*.4,true).length===1));
    const pre=ft.filter(q=>q.t<wh[0].t-1e-6),post=ft.filter(q=>q.t>wh[0].t+1e-6);
    ok('M1: the river of fire it leaves burns 50% hotter once white-hot',pre.length>0&&post.length>0&&pre.every(q=>near(q.P,100))&&post.every(q=>near(q.P,150)),pre.length+' / '+post.length);
    ok('M1: nothing else (no river front, feathers, pyre or ashes)',!PHM.dbg.some(d=>MEV.includes(d.ev)&&d.ev!=='white'));}
  {play();PHM.dbg=[];log=[];const F=column(4,.45);wrapHurt();try{cast(1,F[0]);run(END);}finally{hurt=H0;setL(0);}
    ok('M1: four strikes are not enough',!ev('white').length&&!log.some(h=>h.smx));}
  /* ---- M2 Wildfire River ---- */
  {play();PHM.dbg=[];log=[];const F=column(3),Off=foe(F[1].dist-.25,.6),Fl=foe(F[2].dist-.25,0);Fl.fly=true;wrapHurt();try{cast(2,F[0]);run(END);}finally{hurt=H0;setL(0);}
    const fs=ev('flareStart')[0],fl=ev('flare')[0],st=ev('strike'),last=st[st.length-1];
    ok('M2: after it climbs away a front of flame runs back along the river',fs&&fl&&fl.t>fs.t&&fs.t>last.t,fs&&fl&&(fl.t-fs.t).toFixed(2)+'s');
    ok('M2: every ground foe on the river takes 60% once',F.every(e=>fl.L.includes(e)&&hits(e,60,true).length===1),fl&&fl.L.length);
    ok('M2: not flyers, nor a foe off the middle of the road (0.6 out), though the phoenix struck both',!fl.L.includes(Fl)&&!fl.L.includes(Off)&&!hits(Fl,60,true).length&&!hits(Off,60,true).length&&st.some(d=>d.e===Off)&&st.some(d=>d.e===Fl));
    ok('M2: the foes it passes burn again',F.every(e=>e.burn&&e.burn.t>0)||F.every(e=>log.some(h=>h.e===e&&h.dot&&h.t>fl.t)));}
  {play();PHM.dbg=[];const F=column(2);cast(1,F[0]);run(END);setL(0);ok('M2 needs Mastery 2',!ev('flareStart').length&&!ev('flare').length);}
  /* ---- M3 Burning Plumage ---- */
  {play();PHM.dbg=[];log=[];const F=column(3);F[0].maxHp=F[0].hp=5e8;F[2].maxHp=F[2].hp=7e8;wrapHurt();try{cast(3,F[0]);run(END);}finally{hurt=H0;setL(0);}const fe=ev('feather');
    ok('M3: with 3 foes struck, 6 feathers: two each (at most two a foe)',fe.length===6&&F.every(e=>fe.filter(d=>d.e===e&&d.hit).length===2),fe.length);
    ok('M3: each feather deals 50%',F.every(e=>hits(e,50,true).length===2));}
  {play();PHM.dbg=[];log=[];const F=column(10,.4);F.forEach((e,i)=>{e.maxHp=e.hp=1e8*(i+1);});wrapHurt();try{cast(3,F[0]);run(END);}finally{hurt=H0;setL(0);}const fe=ev('feather'),tg=fe.map(d=>d.e);
    ok('M3: with 10 struck, 8 feathers, one each, at the 8 toughest',fe.length===8&&new Set(tg).size===8&&!tg.includes(F[0])&&!tg.includes(F[1]),fe.length);}
  /* ---- M4 Pyre ---- */
  {play();PHM.dbg=[];log=[];const F=column(4,.5),N=foe(F[0].dist+.3,.2);applyBurn(F[0],1,9,{src:heroU,el:'fire'});wrapHurt();try{cast(4,F[0]);run(END);}finally{hurt=H0;setL(0);}
    const py=ev('pyre'),st=ev('strike'),p0=py.find(d=>d.e===F[0]);
    ok('M4: a foe already burning when struck erupts at the strike',p0&&st.find(d=>d.e===F[0]).wb&&near(p0.t,st.find(d=>d.e===F[0]).t,.01),p0&&p0.t);
    ok('M4: the eruption deals 10% to every foe within 0.75 tiles',p0&&p0.L.includes(N)&&p0.L.every(e=>Math.hypot(e.x-F[0].x,e.z-F[0].z)<PHM.pyR)&&enemies.filter(e=>!e.dead&&Math.hypot(e.x-F[0].x,e.z-F[0].z)<PHM.pyR-.01).every(e=>p0.L.includes(e)),p0&&p0.L.length);
    ok('M4: the others, set burning by its strikes, erupt when the river front reaches them',F.slice(1).every(e=>{const d=py.find(q=>q.e===e);return d&&d.t>=ev('flareStart')[0].t;}),py.length);
    ok('M4: each foe erupts once a cast',new Set(py.map(d=>d.e)).size===py.length);
    const tot=py.reduce((s,d)=>s+d.L.length,0);ok('M4: and the 10% hits add up',log.filter(h=>h.smx&&near(h.amt,10)).length===tot,tot);}
  {play();PHM.dbg=[];const F=column(3);applyBurn(F[0],1,9,{src:heroU,el:'fire'});cast(3,F[0]);run(END);setL(0);ok('M4 needs Mastery 4',!ev('pyre').length);}
  /* ---- M5 From the Ashes ---- */
  const kill=e=>H0(e,1e12,'magic',{src:heroU,el:'fire'});
  {play();PHM.dbg=[];log=[];const F=column(5,.5),Far=foe(F[0].dist+6);const added=track();wrapHurt();
    try{cast(5,F[0]);run(4.6);const as=ev('ashes')[0];
      ok('M5: the death burst leaves ashes on every foe it struck that still stands (and on no other)',as&&F.every(e=>as.L.includes(e))&&!as.L.includes(Far)&&near(as.t,ev('burst')[0].t,.01),as&&as.L.length);
      kill(F[2]);const rk=ev('rekindle');ok('M5: a foe that dies with ashes on it is reborn as a firebird',rk.length===1&&rk[0].e===F[2]);
      run(1);const fb=ev('firebird')[0],dd=e=>Math.hypot(e.x-F[2].x,e.z-F[2].z),nr=fb&&fb.e;
      ok('M5: it dives at the nearest foe for 60% (one of its two neighbours, half a tile away)',fb&&fb.hit&&(nr===F[1]||nr===F[3])&&enemies.every(e=>e.dead||e===F[2]||dd(e)>=dd(nr)-1e-6)&&hits(nr,60,true).filter(h=>h.t>rk[0].t).length===1&&fb.t-rk[0].t>.6&&fb.t-rk[0].t<.9,fb&&(fb.t-rk[0].t).toFixed(2)+'s');
      kill(Far);ok('M5: a foe it did not strike leaves no firebird',ev('rekindle').length===1);
      run(4);kill(F[4]);ok('M5: the ashes go cold after 4s',ev('rekindle').length===1);
      run(3);ok('M5: nothing is left behind',smLeft(added)===0,smLeft(added));}finally{hurt=H0;scene.add=S0;setL(0);}}
  {play();PHM.dbg=[];log=[];const F=column(1),A=F[0],B=foe(A.dist,1.25,50),C=foe(A.dist-1.2,1.25);wrapHurt();
    try{cast(5,A);run(4.6);const as=ev('ashes')[0];kill(A);run(2);const fb=ev('firebird');
      ok('M5: the firebird spreads the ashes: its foe, killed by the dive, is reborn in turn and dives at the next',as&&as.L.length===1&&fb.length===2&&fb[0].e===B&&B.dead&&ev('rekindle').map(d=>d.e).join()===[A,B].join()&&fb[1].e===C&&hits(C,60,true).length===1,fb.length+' firebirds');
      kill(C);ok('M5: and the foe it struck carries the ashes too',ev('rekindle').length===3);}finally{hurt=H0;setL(0);}}
  {play();PHM.dbg=[];const F=column(8,.5);cast(5,F[0]);run(4.6);F.forEach(kill);run(1.5);setL(0);
    ok('M5: up to 6 firebirds a cast',ev('ashes')[0].L.length===8&&ev('rekindle').length===6&&ev('firebird').length===6,ev('rekindle').length);}
  {play();PHM.dbg=[];const F=column(1);cast(5,F[0]);run(4.6);kill(F[0]);run(1);setL(0);const fb=ev('firebird')[0];
    ok('M5: with no foe within 4 tiles the firebird flies off (no hit)',fb&&!fb.hit&&!fb.e);}
  {play();PHM.dbg=[];const F=column(3);cast(4,F[0]);run(4.6);kill(F[1]);run(1);setL(0);ok('M5 needs Mastery 5',!ev('ashes').length&&!ev('rekindle').length&&!ev('firebird').length);}
  /* ---- the rest ---- */
  {play();PHM.dbg=[];const F=column(3);setL(5);castPhoenix(heroU,[F[0]],100,{src:heroU,el:'fire',spell:'phoenix'});run(END);setL(0);
    ok('casts that are not a mastered scroll cast get no masteries (only the new 3D fire)',ev('strike').length===3&&ev('strike').every(d=>!d.hot)&&!PHM.dbg.some(d=>MEV.includes(d.ev)));}
  {const e0=errs,n0=NS_OWN.size;for(let L=1;L<=5;L++){play();const F=column(8,.5,150);F.push(foe(F[0].dist+1,0,150));cast(L,F[0]);run(END+1);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors and frees what it owns',errs===e0&&NS_OWN.size<=n0,(errs-e0)+' errors, '+(NS_OWN.size-n0)+' left');}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;cfmBoom=B0;flash=F0;PHM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
