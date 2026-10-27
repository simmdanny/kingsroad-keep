(function(){
if(typeof castNever!=='function')return [['Never-Never Land is not in this build (v361): skipped',true,'']];
/* Never-Never Land (v361): an ancient light domain after Yuno's Star x Wind spirit magic. Registries, the opening (card, Sylph, the dome), the time
   stop and the slow, more damage taken, faster towers, shooting stars on the foes nearest the keep, the whip of four stars, the finale, cleanup,
   refresh and a mid-cast reset, and its power next to the other ancients. Run on the dev page: __kk.ev(await (await fetch('/tests/never-test.js')).text())
   returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),K=NVR;
const go=()=>{lsSet(KR,null);meta.arena='plains';state='menu';clearWorld();{const gv=MAP_GV;MAP_GV=5;try{buildMap(777);}finally{MAP_GV=gv;}}MAP.fresh=true;newGame(1);auto=0;lives=1e9;
  const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);state='playing';paused=false;speed=0;window.__fz=true;worldSlow=1;slowT=0;};
const foes=(n,o)=>{o=o||{};for(const e of enemies.slice())removeEnemy(e);enemies=[];const L=[];for(let i=0;i<n;i++){spawnEnemy({type:o.boss&&!i?'golem':(i%2?'knight':'soldier'),v:0},60);const e=enemies[enemies.length-1];
  e.route=ROUTES[i%ROUTES.length];e.dist=(o.d0||4)+i*(o.sp||.5);e.off=0;e.hp=e.maxHp=o.hp||1e8;e.armor=0;e.res={};e.spd=.5;e.shield=0;moveEnemy(e,0);L.push(e);}return L;};
const run=s=>{for(let i=0;i<s/.05;i++){update(.05);updFx(.05);}};
const cast=()=>{heroU.anim={k:'never',t:0,d:ANIM_D.never};castSN0('never');worldSlow=1;slowT=0;};
const runTo=T=>{let n=0;while(NVR.S&&NVR.S.T<T&&n++<2000){update(.05);updFx(.05);}};
const errs0=[];const ce=console.error;let errs=0;console.error=function(){errs++;errs0.push([].slice.call(arguments).join(' ').slice(0,200));return ce.apply(console,arguments);};
try{
  /* ---- registries ---- */
  const S0=SPELLS_S.never;
  ok('Never-Never Land is an ancient light scroll, a global domain, cooldown 160s',S0&&S0.n==='Never-Never Land'&&S0.r==='ancient'&&SPELL_EL.never==='light'&&S0.global&&S0.cd===160);
  ok('its own text, effects and epithet',S0.d.length>300&&SPELL_FX.never.length>120&&ANC_EP.never&&/time/i.test(SPELL_FX.never));
  ok('in the scroll list, which stays sorted by rarity',SCROLL_IDS.includes('never')&&SCROLL_IDS.every((k,i)=>!i||RB[SPELLS_S[SCROLL_IDS[i-1]].r].i<=RB[SPELLS_S[k].r].i));
  ok('a hero pose, an icon, scroll art and a cast',ANIM_D.never>20&&typeof POSES.never==='function'&&SIG.never&&SPI.never&&typeof NSP.never==='function');
  ok('the pose runs start to end without NaN',[0,.05,.1,.3,.5,.8,.85,.9,1].every(f=>Object.values(POSES.never(f)).every(v=>isFinite(v))));
  ok('the notes and the changelog tell of it',document.body.innerHTML.includes('Never-Never Land')&&CLOG.some(c=>c.t==='Never-Never Land'));
  /* ---- the opening ---- */
  go();let L=foes(8);const n0=scene.children.length;cast();
  {const c=$('#ancCard');ok('ancient opening: the OLDER THAN TIME card with its name, time stops, parchment',c&&c.classList.contains('on')&&c.textContent.includes('OLDER THAN TIME')&&c.textContent.includes('Never-Never Land')&&/sepia/.test(renderer.domElement.style.filter));}
  worldSlow=1;slowT=0;
  ok('the domain is live and on top',ANC.on&&ANC.live.never&&ANC.top==='never'&&NVR.S&&NVR.S.R>=7);
  const root=scene.children[scene.children.length-1];
  runTo(1.2);{let wings=0,pts=0;root.traverse(o=>{if(o.isMesh&&o.material&&o.material.uniforms&&o.material.uniforms.uT&&o.geometry.type==='PlaneGeometry')wings++;if(o.isPoints)pts+=o.geometry.attributes.position.count;});
   ok('Sylph spreads four wings over the hero',wings>=4);ok('the dome holds a sky of stars (and the constellations)',pts>=1500,pts);}
  runTo(2.9);ok('the night falls (the domain takes the light)',ANC.L.never&&ANC.L.never.k>.8&&ANC.L.never.hemi<.4);
  /* ---- time stands still, then crawls ---- */
  {const e=L[0],d0=e.dist;runTo(K.ACT0+.3);const d1=e.dist;run(1);ok('time stands still for every foe',Math.abs(e.dist-d1)<1e-6&&ancF(e)===0,(e.dist-d1).toFixed(4));
   ok('bosses still crawl at a quarter of their speed',Math.abs(ancF({boss:true})-K.stopB)<1e-9);
   runTo(K.ACT0+K.STOP+.3);ok('then foes move 40% slower, bosses 20%',Math.abs(ancF(e)-.6)<1e-9&&Math.abs(ancF({boss:true})-.8)<1e-9,ancF(e));}
  /* ---- more damage taken, faster towers ---- */
  {const e=L[1];const h=e.hp;const a=hurt(e,100,'magic',{src:null});ok('every foe takes 25% more damage from everything',Math.abs((h-e.hp)-125)<.5,(h-e.hp).toFixed(1));}
  {let best=null,bd=1e9;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(grid[r][c]!==0)continue;const p=tw(c,r),d=(p.x-L[0].x)**2+(p.z-L[0].z)**2;if(d<bd&&d>1){bd=d;best=[c,r];}}
   gold+=buildCost('archer');placeTower('archer',best[0],best[1]);const T0=towers[towers.length-1];const r1=tStats(T0).rate;const S=NVR.S;NVR.S=null;const r0=tStats(T0).rate;NVR.S=S;
   ok('towers attack 25% faster',Math.abs(r1/r0-1.25)<1e-6,(r1/r0).toFixed(3));}
  /* ---- shooting stars on the foes nearest the keep ---- */
  {const hp=L.map(e=>e.hp);runTo(K.ACT0+K.STOP+3.4);const hit=L.map((e,i)=>hp[i]-e.hp);const prog=L.map(e=>e.dist/e.route.len);
   const lead=L.slice().sort((a,b)=>b.dist/b.route.len-a.dist/a.route.len).slice(0,6),rest=L.filter(e=>!lead.includes(e));
   ok('shooting stars keep falling (several foes hit in 3.4s)',hit.filter(x=>x>0).length>=4,hit.map(x=>Math.round(x)).join('/'));
   ok('they choose the foes nearest the keep',lead.reduce((a,e)=>a+(hp[L.indexOf(e)]-e.hp),0)>rest.reduce((a,e)=>a+(hp[L.indexOf(e)]-e.hp),0));}
  /* ---- the whip of four stars ---- */
  {go();const C=foes(6,{d0:6,sp:.25});cast();worldSlow=1;slowT=0;runTo(K.ACT0+1.79);const hp=C.map(e=>e.hp);runTo(K.ACT0+1.8+.62);
   const dm=C.map((e,i)=>hp[i]-e.hp),P=heroStats().dmg;ok('four stars link round the thickest crowd and lash it (500%)',dm.filter(x=>x>=P*K.lash*1.2).length>=3,dm.map(x=>Math.round(x/P*100)+'%').join(' '));
   ok('and hold it for a moment',C.filter(e=>e.stunT>0).length>=3);}
  /* ---- the finale ---- */
  {runTo(K.END+.9);const hp=enemies.filter(e=>!e.dead).map(e=>e.hp);const A=enemies.filter(e=>!e.dead);runTo(K.END+1.2);const P=heroStats().dmg;
   ok('at the end every star falls: 1000% to every foe',A.every((e,i)=>hp[i]-e.hp>=P*K.fin*1.2),A.map((e,i)=>Math.round((hp[i]-e.hp)/P*100)+'%').slice(0,4).join(' '));}
  /* ---- the end ---- */
  {const r=root;run(6);ok('the dome folds away and everything is cleaned up',!ANC.live.never&&NVR.S===null&&ANC.fs.never===undefined&&!r.parent&&ancF(enemies[0])===1);
   const e=enemies.find(q=>!q.dead);const h=e.hp;hurt(e,100,'magic',{src:null});ok('no more damage taken once it is over',Math.abs((h-e.hp)-100)<.5);}
  /* ---- refresh and a mid-cast reset ---- */
  {go();foes(4);cast();worldSlow=1;slowT=0;runTo(9);const T1=NVR.S.T;cast();worldSlow=1;slowT=0;run(.05);ok('casting it again while it is up winds it back',NVR.S&&NVR.S.T<T1-3&&ANC.live.never,NVR.S&&NVR.S.T.toFixed(2));
   const r=scene.children[scene.children.length-1];resetRun&&resetRun();clearWorld();ok('a new run clears it',!ANC.live.never&&NVR.S===null);}
  /* ---- v362: it turns violet only when a dark scroll is cast inside it ---- */
  if(typeof nvpStart==='function'){go();foes(6);cast();worldSlow=1;slowT=0;runTo(5);const S=NVR.S;let mats=0;S.root.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{if(m.userData&&m.userData.nvp)mats++;});});
   ok('every material of the domain can turn purple (compiled in at the cast)',mats>=10&&NVP.u.value===0&&!NVP.on,mats);
   meta.spells.cinders=meta.spells.cinders||{lvl:1,hero:null};castSN0('cinders');run(.5);ok('a fire scroll cast inside does not turn it purple',!NVP.on&&NVP.u.value===0);
   meta.spells.hexspark=meta.spells.hexspark||{lvl:1,hero:null};castSN0('hexspark');run(1.6);const hc={};ANC.L.never.hc.getHSL(hc);
   ok('a dark scroll cast inside turns the whole sky violet',NVP.on&&NVP.u.value>.99&&hc.h>.69&&hc.h<.88,NVP.u.value.toFixed(2)+' h '+hc.h.toFixed(2));
   run(16);ok('and it ends with the domain (the next one starts in its own colours)',!ANC.live.never&&!NVP.on&&NVP.u.value===0);}
  /* ---- v365: an artifact set leaves the domain's night alone (the light set used to turn it grey) ---- */
  if(typeof NVP_NIGHT!=='undefined'){const BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);const eq=ids=>{meta.arts=meta.arts||{own:{},eq:{},pend:[]};for(const id of ids)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids.slice(0,3);ART_V++;AS.k=null;asEl();asTick(.001);};
   const bad=[];let vio=null;for(const el of ['light','lightning','dark','fire','ice','nature']){if(!BY[el]||BY[el].length<3)continue;go();foes(4);eq(BY[el].slice(0,3));cast();worldSlow=1;slowT=0;runTo(5);const L=ANC.L.never;
     for(const q in NVP_NIGHT)if(L[q].getHex()!==NVP_NIGHT[q])bad.push(el+' '+q+' #'+L[q].getHexString());
     if(el==='light'){meta.spells.hexspark=meta.spells.hexspark||{lvl:1,hero:null};heroU.scd={};heroU.gcd=0;castSN0('hexspark');run(1.6);const h={},g={};L.hc.getHSL(h);L.hg.getHSL(g);vio=[h.h,h.s,g.h,g.s];}
     run(20);eq([]);}
   ok('under every artifact set the night keeps its own colours',bad.length===0,bad.join(', ')||'all six');
   ok('and under the light set a dark cast still turns the sky violet',vio&&vio[0]>.69&&vio[0]<.88&&vio[1]>.3&&vio[2]>.69&&vio[2]<.88&&vio[3]>.3,vio&&vio.map(v=>v.toFixed(2)).join(' '));}
  /* ---- power next to the other ancients (foes with 40x the hero's power in health, so the max-health parts weigh as in a late game) ---- */
  {const res={};for(const k of['never','firsttree','abyss']){go();const P0=heroStats().dmg;const F=foes(8,{hp:40*P0});for(const e of F)e.hp=1e9;heroU.anim={k,t:0,d:ANIM_D[k]};castSN0(k);worldSlow=1;slowT=0;run(26);
     res[k]=F.reduce((a,e)=>a+(1e9-e.hp),0)/P0/SPELLS_S[k].cd;for(const e of enemies.slice())removeEnemy(e);enemies=[];}
   ok('its damage per second of cooldown sits among the ancients (between the Eldritch Tree and Abyssal Genesis, give or take 15%)',res.never>=res.firsttree*.95&&res.never<=res.abyss*1.15,JSON.stringify(Object.fromEntries(Object.entries(res).map(([k,v])=>[k,+v.toFixed(2)]))));}
  ok('no errors',errs===0,errs0.slice(-3).join(' / '));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;try{worldSlow=1;slowT=0;window.__fz=false;speed=1;for(const e of enemies.slice())removeEnemy(e);enemies=[];state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ancUnfilter();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
