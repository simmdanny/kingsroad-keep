(function(){
/* Lance of the Seraph's masteries (v456). Run on the dev page: __kk.ev(await (await fetch('/tests/srl-test.js')).text()) returns [name, ok, detail] rows.
   A long straight stretch of road (map 12) with foes standing on it at known distances from the mark (the strongest of them); the game is
   stepped (update and updFx), hurt is wrapped to log the amount each hit is called with (the scroll's power is 100: the great lance deals
   3500, its blast 800, a lance from the wings 1200 and 250 around it), and SRL.dbg logs the masteries' events (the impact and each lance, with
   the hold each applied). Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),H0=hurt,S0=scene.add;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const run=s=>{for(let i=0;i<Math.round(s/.05);i++){heroU&&(heroU.cd=1e9);update(.05);updFx(.05);}};
function go(){lsSet(KR,null);meta.arena='plains';meta.dev=true;meta.scrAuto=false;meta.mapIntro=0;state='menu';clearWorld();buildMap(12);MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const R=ROUTES[0];let best=0,bl=0;for(let d=0;d<R.len-4;d+=.25){let l=0;const A=posAt(d,R);for(let e=d+1;e<R.len;e+=.5){const B=posAt(e,R);let dev=0;for(let k=1;k<8;k++){const p=posAt(d+(e-d)*k/8,R),t=k/8;dev=Math.max(dev,Math.hypot(p[0]-(A[0]+(B[0]-A[0])*t),p[1]-(A[1]+(B[1]-A[1])*t)));}if(dev>.08)break;l=e-d;}if(l>bl){bl=l;best=d;}}
  const d0=best+bl/2,A=posAt(d0,R);let hc=null,hb=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const q=tw(c,r),dd=(q.x-A[0])**2+(q.z-A[1])**2;if(dd>1.5&&dd<hb){hb=dd;hc=[c,r];}}
  spawnHero(hc[0],hc[1]);heroU.cd=1e9;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='playing';paused=false;speed=0;worldSlow=1;slowT=0;camShake=0;return{R,d0,bl};}
function foe(R,d,hp){spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.gem=0;e.scroll=0;e.route=R;e.dist=d;e.off=0;e.hp=1e9;e.maxHp=hp;e.armor=0;e.res={};e.shield=0;e.spd=0;moveEnemy(e,0);return e;}
const setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.seraphlance=SM_XP[L-1];else delete meta.smast.seraphlance;};
const oF=()=>({src:heroU,bane:0,el:'light',anc:false,spell:'seraphlance'});
const cast=(L,list)=>{setL(L);castScrollNow('seraphlance',heroU,heroStats(),list||enemies.filter(e=>!e.dead),100,oF());};
let log=[];const wrapHurt=()=>{hurt=function(e,amt,kind,o){log.push({e,amt,t:time});return H0.apply(this,arguments);};};
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
const ev=n=>(SRL.dbg||[]).filter(d=>d.ev===n);
const hits=(e,amt,L)=>(L||log).filter(h=>h.e===e&&near(h.amt,amt)).length;
const leftL=added=>added.filter(o=>{let q=o;while(q&&q!==scene)q=q.parent;return q===scene;}),left=added=>leftL(added).length;
/* (the map's own ripples on its ponds, terTick's, come and go all the time: they are not the cast's) */
const track=()=>{const added=[];scene.add=function(...a){if(!/terTick|terRipple/.test(String(new Error().stack)))added.push(...a);return S0.apply(this,a);};return added;};
/* foes along the straight road, at these distances from the mark (in the middle): within 3.2 tiles of it, between 3.2 and 4, past 4 (all within
   10). Their max health sets who is strongest: the mark first, then the order of OFF (so the lances' targets are known) */
const OFF=[-2.1,2.1,-4.6,5.6,-.45,.45,-1.2,1.2,-3.6,3.6,-2.8,2.8,-6.5,6.5];
const stage=(n)=>{const G=go(),m=foe(G.R,G.d0,5e7),L=[m];OFF.slice(0,n==null?OFF.length:n).forEach((o,i)=>L.push(foe(G.R,G.d0+o,4e7-i*1e6)));return{G,m,L};};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
/* one cast at mastery L on a fresh stage, stepped s seconds: the hurt log and the largest stun each foe had */
const trial=(L,s,o)=>{o=o||{};const S=stage(o.n);if(o.boss)S.m.boss=true;SRL.dbg=[];log=[];wrapHurt();const added=track();const stun=new Map(),seen=new Set(),at=[];
  try{cast(L,o.list?o.list(S):null);for(let i=0;i<Math.round((s||7)/.05);i++){run(.05);for(const e of S.L)stun.set(e,Math.max(stun.get(e)||0,e.stunT||0));
    for(const d of SRL.dbg)if(!seen.has(d)){seen.add(d);if(d.ev==='impact'||d.ev==='lance'){const e=d.ev==='impact'?d.hm:d.tg;at.push({d,stun:e?e.stunT||0:0,inScene:d.g?d.g.parent===scene:null});}}}}
  finally{hurt=H0;scene.add=S0;setL(0);}
  S.stun=stun;S.at=at;S.added=added;S.log=log.slice();S.dbg=(SRL.dbg||[]).slice();return S;};
/* what a cast should do, worked out from where the foes stand: the mark (the strongest), the foes within R of it, the n strongest others
   (the lances' targets, the list repeating when there are fewer), and how often each foe is struck within SR of a lance's target */
const expect=(S,R,n,SR)=>{const m=S.m,bl=S.L.filter(e=>dist(e,m)<R),oth=S.L.filter(e=>e!==m&&dist(e,m)<10).sort((a,b)=>nsStrong(b)-nsStrong(a)).slice(0,n),tg=[];
  for(let i=0;i<n;i++)if(oth.length)tg.push(oth[i%oth.length]);const sp=new Map();for(const t of tg)for(const e of S.L)if(e!==t&&dist(e,t)<SR)sp.set(e,(sp.get(e)||0)+1);return{bl,tg,sp};};
/* every hit of the cast exactly: main to the mark once, blast to exactly bl, small to each target as often as it is targeted, spl as often as
   each foe stands near a target */
const exact=(S,X,main,blast,small,spl)=>{const bad=[];for(const e of S.L){const nT=X.tg.filter(t=>t===e).length,nS=X.sp.get(e)||0;
    const want=[[main,e===S.m?1:0],[blast,X.bl.includes(e)?1:0],[small,nT],[spl,nS]];const c={};for(const [a,n] of want)c[a]=(c[a]||0)+n;
    for(const a in c){const got=hits(e,+a,S.log);if(got!==c[a])bad.push(S.L.indexOf(e)+':'+a+'x'+got+'/'+c[a]);}}
  const amts=new Set([main,blast,small,spl]);const other=S.log.filter(h=>![...amts].some(a=>near(h.amt,a)));if(other.length)bad.push('other: '+other.slice(0,4).map(h=>h.amt).join(','));return bad;};
try{
  /* a first cast at Mastery 5 that is not checked: the game's shared pools and helpers (made the first time something uses them, and kept)
     are made here, so "nothing is left behind" below sees only what a cast leaves */
  {stage();cast(5);run(7);setL(0);}
  /* ---- the card ---- */
  ok('the five masteries: Star-Forged Lance, Falling Star, Host of Lances, Pinned by Light, Wrath of the Host (v456)',SM_D.seraphlance.map(x=>x.n).join('|')==='Star-Forged Lance|Falling Star|Host of Lances|Pinned by Light|Wrath of the Host',SM_D.seraphlance.map(x=>x.n).join('|'));
  const dsc=[0,1,2,3,4].map(i=>smDesc('seraphlance',i));
  ok('the numbers on the card are the ones in the code (4200%; 4 tiles / 900%; nine; 1.5s / 0.5s; 1500% / 350%)',/4200%/.test(dsc[0])&&/4 tiles/.test(dsc[1])&&/900%/.test(dsc[1])&&/Nine lances/.test(dsc[2])&&/1\.5s/.test(dsc[3])&&/0\.5s/.test(dsc[3])&&/Resolve/.test(dsc[3])&&/1500%/.test(dsc[4])&&/350%/.test(dsc[4])
    &&SRL.main===42&&SRL.blr===4&&SRL.blast===9&&SRL.n===9&&SRL.hold===1.5&&SRL.shold===.5&&SRL.small===15&&SRL.spl===3.5,dsc.join(' / '));
  ok('the old masteries are gone (no hooks); calibrated with hidden factors near 1',!SMF.seraphlance.hit&&!SMF.seraphlance.cast&&SMA.seraphlance.every(x=>x===1)&&SMG.seraphlance.length===5&&SMG.seraphlance.every(x=>x>=.9&&x<=1.1),SMG.seraphlance.join());
  ok('the defaults table is the old cast (3500% / 800% within 3.2, six lances of 1200% and 250% within 0.8, no hold, 6s)',SLD.MAIN===35&&SLD.BLAST===8&&SLD.BLR===3.2&&SLD.N===6&&SLD.SMALL===12&&SLD.SPL===2.5&&SLD.SPLR===.8&&SLD.HOLD===0&&SLD.SHOLD===0&&SLD.LIFE===6&&SLD.LN===3.4&&SLD.LW===1.25&&SLD.COL===.6&&SLD.PILR===2.4&&SLD.PILH===4.5&&SLD.RUNE===2.6);
  /* ---- Mastery 0 ---- */
  {const S=trial(0),X=expect(S,3.2,6,.8),b=exact(S,X,3500,800,1200,250);
    ok('Mastery 0: 3500% to the mark, 800% to exactly the foes within 3.2, 1200% to each of the six next strongest, 250% within 0.8 of each',!b.length&&X.bl.length>=8&&X.bl.length<S.L.length&&X.tg.length===6&&S.log.length>15,b.join(' ')||(X.bl.length+' in the blast, '+S.log.length+' hits'));
    ok('Mastery 0: no holds, no mastery events',S.L.every(e=>!(S.stun.get(e)>0))&&!S.dbg.length);
    ok('Mastery 0: nothing is left behind',left(S.added)===0,leftL(S.added).map(o=>o.type+':'+(o.geometry&&o.geometry.type)).slice(0,6).join(' '));}
  /* ---- M1 Star-Forged Lance ---- */
  {const S=trial(1),X=expect(S,3.2,6,.8),b=exact(S,X,4200,800,1200,250),c=S.dbg.find(d=>d.ev==='cast');
    ok('M1: the great lance strikes 4200% (3500% before); nothing else changes',!b.length&&!S.log.some(h=>near(h.amt,3500)),b.join(' '));
    ok('M1: the lance drawn longer and wider (4.1 by 1.5), the column of light wider (0.75)',c&&c.X.LN===4.1&&c.X.LW===1.5&&c.X.COL===.75&&c.X.N===undefined,c&&JSON.stringify(c.X));}
  /* ---- M2 Falling Star ---- */
  {const S=trial(2),X=expect(S,4,6,.8),b=exact(S,X,4200,900,1200,250),far=X.bl.filter(e=>dist(e,S.m)>3.2),c=S.dbg.find(d=>d.ev==='cast');
    ok('M2: the blast reaches 4 tiles and strikes 900% (3.2 and 800% before): exactly the foes within 4',!b.length&&!S.log.some(h=>near(h.amt,800)),b.join(' '));
    ok('M2: foes 3.2-4 tiles from the mark are in it now',far.length>=2&&far.every(e=>hits(e,900,S.log)===1),far.length);
    ok('M2: the ring of pillars wider and taller (3.2, 6), the rune larger (3.3)',c&&c.X.PILR===3.2&&c.X.PILH===6&&c.X.RUNE===3.3&&c.X.BLR===4);}
  /* ---- M3 Host of Lances ---- */
  {const S=trial(3),X=expect(S,4,9,.8),b=exact(S,X,4200,900,1200,250),L=S.dbg.filter(d=>d.ev==='lance');
    ok('M3: nine lances (six before): 1200% to each of the nine next strongest, 250% around each',!b.length&&X.tg.length===9&&L.length===9&&new Set(X.tg).size===9,b.join(' ')||L.length);
    ok('M3: the three more leave the wing tips',L.filter(d=>d.org).length===3&&L.filter(d=>d.org).every(d=>d.i>=6)&&L.filter(d=>d.org).some(d=>Math.abs(d.org[0])>3.5),L.map(d=>d.i+(d.org?'@'+d.org.join('/'):'')).join(' '));
    const T=trial(3,7,{n:4}),Y=expect(T,4,9,.8),b2=exact(T,Y,4200,900,1200,250);
    ok('M3: with fewer foes the list repeats (four foes: the nine fall on them in turn)',!b2.length&&Y.tg.length===9&&new Set(Y.tg).size===4,b2.join(' '));}
  /* ---- M4 Pinned by Light ---- */
  {const S=trial(4),X=expect(S,4,9,.8),b=exact(S,X,4200,900,1200,250),im=S.at.find(a=>a.d.ev==='impact'),ls=S.at.filter(a=>a.d.ev==='lance');
    ok('M4: the great lance holds its foe 1.5s',im&&im.d.hm===S.m&&near(im.d.hold,1.5)&&near(im.stun,1.5,.02),im&&(im.d.hold+' / '+im.stun));
    ok('M4: each lance holds its foe 0.5s',ls.length===9&&ls.every(a=>near(a.d.hold,.5)&&near(a.stun,.5,.02)),ls.map(a=>a.d.hold.toFixed(2)).join(','));
    const held=new Set([S.m,...X.tg]);ok('M4: only those: the foes the blast and the strikes around them reach are not held',S.L.filter(e=>!held.has(e)).every(e=>!(S.stun.get(e)>0))&&S.L.filter(e=>!held.has(e)).length>=4);
    ok('M4: no damage changes',!b.length,b.join(' '));
    ok('M4: each lance stays standing in its foe while it holds it, then goes',ls.every(a=>a.inScene===true),ls.map(a=>a.inScene).join(','));
    /* a lance standing: in the scene while it holds, gone after */
    {const T=stage();SRL.dbg=[];setL(4);cast(4);let first=null,st=[];for(let i=0;i<140;i++){run(.05);const l=SRL.dbg.find(d=>d.ev==='lance');if(l&&!first)first={g:l.g,t:time};if(first){const k=time-first.t;st.push([k,first.g.parent===scene]);}}setL(0);
      const inAt=k=>{const q=st.find(x=>x[0]>=k-1e-6);return q&&q[1];};
      ok('M4: a lance stands 0.5s in its foe and is gone 0.25s later (it vanished as it landed before)',inAt(.1)===true&&inAt(.45)===true&&inAt(.85)===false,st.filter((x,i)=>i%3===0).slice(0,8).map(x=>x[0].toFixed(2)+':'+x[1]).join(' '));}
    const B=trial(4,7,{boss:true}),bi=B.at.find(a=>a.d.ev==='impact');
    ok('M4: Resolve applies: a boss is held less (its Resolve, 0.6s)',bi&&bi.d.hm===B.m&&near(bi.d.hold,RSV.capB,.01)&&bi.d.hold<1.5,bi&&bi.d.hold);
    ok('M4: nothing is left behind',left(S.added)===0,left(S.added));
    {const T=trial(3);ok('M4 needs Mastery 4 (at 3 nothing is held)',T.L.every(e=>!(T.stun.get(e)>0))&&T.at.filter(a=>a.d.ev==='lance').every(a=>a.inScene===false));}}
  /* ---- M5 Wrath of the Host ---- */
  {const S=trial(5),X=expect(S,4,9,.8),b=exact(S,X,4200,900,1500,350),c=S.dbg.find(d=>d.ev==='cast');
    ok('M5: every lance strikes 1500% (1200% before) and 350% around it (250% before)',!b.length&&!S.log.some(h=>near(h.amt,1200)||near(h.amt,250)),b.join(' '));
    ok('M5: Masteries 1-4 ride it (4200%, 900% within 4, nine lances, the holds)',S.log.some(h=>near(h.amt,4200))&&X.bl.filter(e=>dist(e,S.m)>3.2).every(e=>hits(e,900,S.log)===1)&&S.dbg.filter(d=>d.ev==='lance').length===9&&near(S.at.find(a=>a.d.ev==='impact').d.hold,1.5));
    ok('M5: the lances larger, their beams taller (2.2 by 1.05; 11 tall)',c&&c.X.SLN===2.2&&c.X.SLW===1.05&&c.X.BMH===11);
    ok('M5: nothing is left behind',left(S.added)===0,leftL(S.added).map(o=>o.type+':'+(o.geometry&&o.geometry.type)).slice(0,6).join(' '));}
  /* ---- the rest ---- */
  {const S=stage();SRL.dbg=[];log=[];setL(5);wrapHurt();try{NSP.seraphlance(heroU,heroStats(),enemies.filter(e=>!e.dead),100,{src:heroU,el:'light',spell:'seraphlance'});run(7);}finally{hurt=H0;setL(0);}
    const X=expect(S,3.2,6,.8),b=exact(Object.assign(S,{log:log.slice()}),X,3500,800,1200,250);ok('casts that are not a mastered scroll cast are the old cast',!SRL.dbg.length&&!b.length,b.join(' '));}
  {stage();setL(5);SRL.busy=0;cast(5);const b=SRL.busy-time;run(7);setL(0);ok('the mastery preview waits for the seraph to rise away (it outlives its cineLock)',near(b,6,.01)&&SMPV_BUSY.some(f=>String(f).indexOf('SRL.busy')>=0)&&!SMPV_BUSY.some(f=>{try{return String(f).indexOf('SRL.busy')>=0&&f();}catch(e){return true;}}),b.toFixed(2));}
  {const e0=errs,Ls=[];for(let L=0;L<=5;L++){const S=stage();S.L.forEach(e=>{e.maxHp=e.hp=1500+S.L.indexOf(e);});heroU.scd={};heroU.gcd=0;setL(L);meta.spells.seraphlance=meta.spells.seraphlance||{lvl:1,hero:null};SRL.dbg=[];
      fireScroll(heroU,'seraphlance',heroStats(),S.L.slice());run(8);const c=SRL.dbg.find(d=>d.ev==='cast');Ls.push(c?c.L:0);}setL(0);
    ok('the real cast path at every mastery (with deaths) runs without errors',errs===e0&&Ls.join()==='0,1,2,3,4,5',(errs-e0)+' errors, masteries '+Ls.join());}
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;hurt=H0;scene.add=S0;SRL.dbg=null;try{for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;speed=1;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
