(function(){
/* Lightning Cloud's masteries as Simon designed them (v412), and the see-through cloud. Run on the dev page:
   __kk.ev(await (await fetch('/tests/scm-test.js')).text()) returns [name, ok, detail] rows. Foes stand where they are put (only the
   effects are stepped, updFx, with the game clock moved along), and hurt is wrapped to log the amount and the time of each hit (power 100:
   a strike is 100 within its inner reach, 70 at its edge). The strikes land at random under each cloud, so the mastery rules are checked
   against SCM.dbg's log of every strike (where, how many it hit, whether it sought its quarry or was a Thunderclap). The cast's clouds
   are SCM.last.G.clouds (their centres K.cx, K.cz), so foes can be put under them. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena,H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(typeof STORM!=='undefined')STORM.left=0;if(typeof CLOUD!=='undefined')CLOUD.left=0;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();};
const run=sec=>{for(let i=0;i<Math.round(sec/.05);i++){updFx(.05);time+=.05;}};
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.stormcloud=SM_XP[L-1];else delete meta.smast.stormcloud;};
const R0=()=>ROUTES[0];let D0=0;
const spot=()=>{const R=R0();let bd=1e9;for(let d=6;d<R.len-4;d+=.1){const p=posAt(d,R),q=Math.hypot(p[0]-heroU.x,p[1]-heroU.z);if(q<bd&&q>1.2){bd=q;D0=d;}}};
const foe=(d,hp,type)=>{spawnEnemy({type:type||'soldier',v:0},20);const e=enemies[enemies.length-1];e.route=R0();e.dist=d;e.off=0;moveEnemy(e,0);e.spd=0;e.maxHp=e.hp=hp||1e9;e.armor=0;e.res={};e.shield=0;return e;};
const put=(e,x,z)=>{e.x=x;e.z=z;if(e.g){e.g.position.x=x;e.g.position.z=z;}return e;};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,smx:!!(o&&o.smx),t:time});return H0.apply(this,arguments);};};
/* the leading foe (first in the list) and a tough one 3.5 tiles back: the two clouds land apart */
const cast=(L,lead,tough)=>{setL(L);castScrollNow('stormcloud',heroU,tStats(heroU),[lead,tough],100,{src:heroU,bane:0,el:'lightning',anc:false,spell:'stormcloud'});return time;};
const near=(a,b)=>Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(b));
const ev=(k,f)=>SCM.dbg.filter(x=>x.ev===k&&(!f||f(x)));
const clouds=()=>SCM.last?SCM.last.G.clouds:[];
const smLeft=added=>added.filter(o=>o.userData&&o.userData.sm).filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}).length;
const track=()=>{const added=[];scene.add=function(...a){added.push(...a);return S0.apply(this,a);};return added;};
const setup=()=>{play();spot();const lead=foe(D0+1),tough=foe(D0-2.5,9e9,'knight');return{lead,tough};};
/* a cloud's own events (each logs its index, ci: 0 the leading foe's cloud, 1 the other) */
const of=(ci,k)=>SCM.dbg.filter(d=>d.ci===ci&&(!k||d.ev===k));
try{
  /* ---- the card, the texts, the cloud ---- */
  ok('the five masteries carry Simon\'s names',SM_D.stormcloud.map(x=>x.n).join('|')==='Stormseeker|Forked Tempest|Supercharged Skies|Stormlink|Wrath of the Heavens',SM_D.stormcloud.map(x=>x.n).join('|'));
  ok('and his numbers: 40% to 85%; every fourth, 45%; five, 175% and 70%; 0.8s, 90%, 1.2s; three, 160% and 70%',/40%/.test(smDesc('stormcloud',0))&&/85%/.test(smDesc('stormcloud',0))&&/fourth/.test(smDesc('stormcloud',1))&&/45%/.test(smDesc('stormcloud',1))
    &&/five/.test(smDesc('stormcloud',2))&&/175%/.test(smDesc('stormcloud',2))&&/70%/.test(smDesc('stormcloud',2))&&/0\.8s/.test(smDesc('stormcloud',3))&&/90%/.test(smDesc('stormcloud',3))&&/1\.2s/.test(smDesc('stormcloud',3))
    &&/three/.test(smDesc('stormcloud',4))&&/160%/.test(smDesc('stormcloud',4))&&SCM.fork===.45&&SCM.forkEvery===4&&SCM.clap===.75&&SCM.clapEvery===5&&SCM.link===.9&&SCM.linkT===.8&&SCM.linkGap===1.2&&SCM.fin===1.6&&SCM.finOut===.7);
  ok('the old masteries are gone, every factor at least 1, his numbers kept',!SMF.stormcloud.cast&&!SMF.stormcloud.hit&&SMA.stormcloud.every(x=>x===1)&&SMG.stormcloud.every(x=>x>=1)&&SM.free&&!!SM.free.stormcloud);
  /* ---- Mastery 0: the old cloud, see-through ---- */
  {const {lead,tough}=setup();SCM.dbg=[];SCM.last=null;log=[];const added=track();wrapHurt();let ops=[];
    try{cast(0,lead,tough);run(2);scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshPhongMaterial&&o.material.transparent&&o.material.emissive&&o.material.emissive.getHex()===0x3a5a9a)ops.push(o.material.opacity);});run(5);}finally{hurt=H0;scene.add=S0;setL(0);}
    ok('Mastery 0: the old cloud (100 or 70 a strike, no hooks) and none of the masteries',!SCM.last&&!SCM.dbg.length&&!log.some(h=>h.smx)&&log.length>0&&log.every(h=>near(h.amt,100)||near(h.amt,70)),log.length);
    ok('the cloud is see-through now, masteries or not (like Stormcaller\'s)',CLOUD.op<.7&&ops.length>0&&ops.every(v=>v<=CLOUD.op+1e-6)&&Math.max(...ops)>CLOUD.op*.8,ops.length+' '+(ops.length?Math.max(...ops).toFixed(2):''));
    ok('and it leaves nothing behind',smLeft(added)===0);}
  /* ---- M1 Stormseeker: a tough foe under a cloud draws the strikes ---- */
  {let hitL0=0,nL0=0,hitL1=0,nL1=0,badSeek=0,badReset=0,seeks=0;
    for(const L of [0,1,0,1,0,1]){const {lead,tough}=setup();SCM.dbg=[];log=[];wrapHurt();
      try{setL(L);const t0=time;cast(L,lead,tough);/* the cloud over the lead: its foe stands at the cloud's centre, 0.7 off it */
        if(L){const S=clouds()[0];put(lead,S.K.cx+.7,S.K.cz);}else{const p=posAt(Math.min(R0().len-.5,lead.dist+.7),R0());put(lead,p[0]+.7,p[1]);}run(6.5);}finally{hurt=H0;setL(0);}
      const hits=log.filter(h=>h.e===lead&&!h.smx).length;
      if(L){hitL1+=hits;let streak=0,miss=0;/* replay the rule on the first cloud's strikes */
        for(const d of of(0,'strike')){nL1++;if(d.seek){seeks++;if(!streak)badSeek++;}if(d.hits){streak++;miss=0;}else if(++miss>=2){streak=0;miss=0;}}}
      else{hitL0+=hits;nL0+=log.filter(h=>h.e===tough||h.e===lead).length?1:1;}}
    ok('M1: a cloud whose strikes find a foe keeps striking it: the foe under it is hit far more often than at Mastery 0',hitL1>hitL0*1.5,'hits on it: '+hitL0+' at M0, '+hitL1+' at M1');
    ok('M1: strikes only seek after a hit, and two misses in a row start it over',seeks>0&&badSeek===0,seeks+' seeking strikes, '+badSeek+' without a hit before');}
  /* ---- M2 Forked Tempest ---- */
  {const {lead,tough}=setup();SCM.dbg=[];log=[];const added=track();let ring=[];wrapHurt();
    try{cast(2,lead,tough);const S=clouds()[0];for(let i=0;i<6;i++){const a=i/6*6.28,r=.6+(i%2)*.7;ring.push(put(foe(5,1e9,i===3?'raven':'soldier'),S.K.cx+Math.cos(a)*r,S.K.cz+Math.sin(a)*r));}put(lead,S.K.cx,S.K.cz);run(7);}finally{hurt=H0;scene.add=S0;setL(0);}
    const mine=of(0).filter(d=>d.ev==='strike'||d.ev==='split');
    const splitsAfter=mine.map((d,i)=>d.ev==='split'?mine[i-1]&&mine[i-1].n:null).filter(x=>x!=null);
    ok('M2: every fourth strike of a cloud splits',splitsAfter.length>=2&&splitsAfter.every(n=>n%4===0),splitsAfter.join(','));
    const forks=ev('fork');const bySplit=new Map();for(const f of forks){const k=f.ci+'/'+f.sp;(bySplit.get(k)||bySplit.set(k,[]).get(k)).push(f.e);}
    ok('M2: two forks a split, 45% each, never the same foe twice in one split',forks.length>=4&&forks.every(f=>near(f.amt,45))&&[...bySplit.values()].every(l=>l.length<=2&&new Set(l).size===l.length),forks.length+' forks');
    ok('M2: nothing left behind',smLeft(added)===0,smLeft(added));}
  {const {lead,tough}=setup();SCM.dbg=[];log=[];let Fl,Gr,Far;wrapHurt();
    try{cast(2,lead,tough);const S=clouds()[0];run(.3);clean();const x=S.K.cx,z=S.K.cz;Fl=put(foe(5,1e9,'raven'),x+.6,z);Gr=put(foe(5),x-.9,z);Far=put(foe(5),x,z+2.6);SCM.dbg=[];scmFork(S,x,z,[]);run(.3);}finally{hurt=H0;setL(0);}
    ok('M2: a split\'s forks reach a flyer and a ground foe nearby, not one out of reach',ev('fork',f=>f.e===Fl).length===1&&ev('fork',f=>f.e===Gr).length===1&&!ev('fork',f=>f.e===Far).length,ev('fork').map(f=>f.e===Fl?'flyer':f.e===Gr?'ground':'far').join(','));run(7);}
  /* ---- M3 Supercharged Skies ---- */
  {const {lead,tough}=setup();SCM.dbg=[];log=[];const added=track();wrapHurt();
    try{cast(3,lead,tough);const S=clouds()[0];for(let i=0;i<10;i++){const a=i*2.4,r=Math.sqrt(i/10)*S.K.R*.8;put(foe(5),S.K.cx+Math.cos(a)*r,S.K.cz+Math.sin(a)*r);}run(7);}finally{hurt=H0;scene.add=S0;setL(0);}
    const claps=of(0,'strike').filter(d=>d.clap).map(d=>d.n);
    ok('M3: five strikes charge the cloud and the sixth is a Thunderclap, then again',claps.length>=2&&claps[0]===6&&claps[1]===12,claps.join(','));
    const ch=ev('clapHit');ok('M3: a Thunderclap adds 75% to the foes in its inner reach (175% in all) and nothing at its edge (still 70%)',ch.length>0&&ch.every(h=>near(h.amt,75)&&log.some(l=>l.e===h.e&&!l.smx&&near(l.amt,100)&&Math.abs(l.t-h.t)<1e-6)),ch.length);
    ok('M3: nothing left behind',smLeft(added)===0,smLeft(added));}
  /* ---- M4 Stormlink ---- */
  {const {lead,tough}=setup();SCM.dbg=[];log=[];const added=track();let On,Fl,Off,C1,C2;wrapHurt();
    try{cast(4,lead,tough);[C1,C2]=clouds();const a={x:C1.K.cx,z:C1.K.cz},b={x:C2.K.cx,z:C2.K.cz};
      On=put(foe(5),(a.x+b.x)/2,(a.z+b.z)/2);Fl=put(foe(5,1e9,'raven'),a.x+(b.x-a.x)*.3,a.z+(b.z-a.z)*.3);const d=Math.hypot(b.x-a.x,b.z-a.z),nx=(b.z-a.z)/d,nz=-(b.x-a.x)/d;
      Off=put(foe(5),(a.x+b.x)/2+nx*1.2,(a.z+b.z)/2+nz*1.2);put(lead,a.x+nx*2,a.z+nz*2);put(tough,b.x-nx*2,b.z-nz*2);run(7);}finally{hurt=H0;scene.add=S0;setL(0);}
    const links=ev('link').map(x=>x.t-ev('cloud')[0].t);
    ok('M4: while both clouds rage, lightning links them again and again (from 1.2s, every 1.6s)',links.length>=3&&Math.abs(links[0]-SCM.linkFirst)<.06&&links.every((t,i)=>!i||Math.abs(t-links[i-1]-SCM.linkEvery)<.06),links.map(t=>t.toFixed(2)).join(','));
    const hOn=ev('linkHit',h=>h.e===On).map(h=>h.t);
    ok('M4: 90% to a foe it crosses, a flyer too, once per link (at most every 1.2s)',hOn.length===links.length&&ev('linkHit').every(h=>near(h.amt,90))&&ev('linkHit',h=>h.e===Fl).length===links.length&&hOn.every((t,i)=>!i||t-hOn[i-1]>=SCM.linkGap-1e-6),hOn.length+' / '+links.length);
    ok('M4: nothing to a foe beside it',!ev('linkHit',h=>h.e===Off).length);
    ok('M4: it ends with the clouds, nothing left behind',smLeft(added)===0,smLeft(added));}
  {const {lead,tough}=setup();SCM.dbg=[];log=[];wrapHurt();try{cast(4,lead,tough);const [C1,C2]=clouds();C2.end();run(3);}finally{hurt=H0;setL(0);}
    ok('M4: if one cloud ends first there is no link',!ev('link').length,ev('link').length);run(4);}
  /* ---- M5 Wrath of the Heavens ---- */
  {const {lead,tough}=setup();SCM.dbg=[];log=[];const added=track();let C1,C2;wrapHurt();
    /* a tight grid of foes over each cloud's area, so every bolt has one at its centre */
    try{cast(5,lead,tough);[C1,C2]=clouds();for(const C of [C1,C2])for(let gx=-4;gx<=4;gx++)for(let gz=-4;gz<=4;gz++){if(Math.hypot(gx,gz)*.3>C.K.R)continue;put(foe(5),C.K.cx+gx*.3,C.K.cz+gz*.3);}run(8);}finally{hurt=H0;scene.add=S0;setL(0);}
    const t0=ev('cloud')[0].t,ks=[of(0),of(1)];
    const DUR=C1.K.DUR;
    ok('M5: the normal strikes stop before the end',ks.every(l=>l.filter(d=>d.ev==='strike').every(d=>d.t-t0<DUR-SCM.finAt+.05)),ks.map(l=>Math.max(...l.filter(d=>d.ev==='strike').map(d=>d.t-t0)).toFixed(2)).join(' '));
    const fb=ev('finBolt'),fins=[of(0,'finBolt'),of(1,'finBolt')];
    ok('M5: each cloud compresses and lets loose three bolts, the last the greatest',ev('compress').length===2&&fb.length===6&&fb.filter(f=>f.big).length===2,fb.length+' bolts');
    ok('M5: on separate spots in its own area',fins.every((l,c)=>{const C=[C1,C2][c];return l.length===3&&l.every(f=>Math.hypot(f.x-C.K.cx,f.z-C.K.cz)<=C.K.R*.85+1e-6)&&l.every((f,i)=>l.every((g,j)=>i===j||Math.hypot(f.x-g.x,f.z-g.z)>.55-1e-6));}),fins.map(l=>l.length).join(' '));
    {const fh=ev('finHit'),bad=fh.filter(h=>{const b=fb.filter(f=>Math.abs(f.t-h.t)<1e-6).map(f=>Math.hypot(h.e.x-f.x,h.e.z-f.z));const d=Math.min(...b);return !(d<.55*.4?near(h.amt,160):near(h.amt,70));});
      ok('M5: 160% within a bolt\'s inner reach, 70% out to its edge',fh.length>0&&!bad.length&&fh.some(h=>near(h.amt,160))&&fh.some(h=>near(h.amt,70)),fh.length+' hits, '+bad.length+' off');}
    ok('M5: the second cloud a beat after the first',fins[0].length&&fins[1].length&&Math.min(...fins[1].map(f=>f.t))>=Math.min(...fins[0].map(f=>f.t))+.1);
    ok('M5: the clouds end, nothing is left behind and the light is handed back',ev('end').length===2&&smLeft(added)===0&&FXL.intensity<=.001,smLeft(added)+' '+FXL.intensity.toFixed(2));}
  /* ---- other casters ---- */
  {const {lead}=setup();SCM.dbg=[];SCM.last=null;log=[];wrapHurt();try{setL(5);castStormCloud(heroU,lead,100,{src:heroU,el:'lightning'});castStormCloud(heroU,lead,100,smO({src:heroU,el:'lightning',smId:1}));run(7);}finally{hurt=H0;setL(0);}
    ok('clouds that are not the hero\'s own mastered scroll stay the old cloud',!SCM.last&&!SCM.dbg.length,SCM.dbg.length);}
  {const e0=errs,added=track();try{for(let L=1;L<=5;L++){const {lead,tough}=setup();for(let i=0;i<6;i++)foe(D0+.5-i*.6,1e6,i===2?'raven':i===4?'knight':'soldier');cast(L,lead,tough);run(8);}}finally{scene.add=S0;setL(0);}
    ok('the real cast path at every mastery runs without errors, leaves nothing behind and hands the light back',errs===e0&&smLeft(added)===0&&FXL.intensity<=.001,(errs-e0)+' '+smLeft(added));}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;SCM.dbg=null;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
