(function(){
/* v480 five new formations (Peasant Mob, Raven Murder, Holy Procession, Pike Phalanx, Knight's Wedge) and the Formations page of the Bestiary.
   Run on the dev page: __kk.ev(await (await fetch('/tests/fm5-test.js')).text()). */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const r0=lsGet(KR),a0=meta.arena,w0=meta.world,ns0=meta.notesSeen;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;pendingWaves.length=0;};
const err0=[];const oe=console.error;console.error=function(){err0.push([].join.call(arguments,' '));return oe.apply(this,arguments);};
const near=(a,b,t)=>Math.abs(a-b)<=(t||1e-6);
const spawn=(id,w,el)=>{const G=spawnFormation({form:id,hpMul:1,elite:!!el},w||30);return G;};
const NEW=['mob','murder','procession','phalanx','wedge'];
try{
  meta.arena='plains';meta.world='classic';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();FM5.log=[];
  ok('five new formations, nine in all, each with a name, a description, a toast and a first wave',NEW.every(k=>FORMS[k]&&FORMS[k].n&&FORMS[k].d&&FORMS[k].toast&&FORMS[k].min>0)&&Object.keys(FORMS).length===9&&FM5_ORDER.length===9,
    NEW.map(k=>k+':'+FORMS[k].min).join(' '));
  /* layouts and roles */
  {const L={};for(const k of NEW)L[k]=formLayout(k,30);const roles=k=>L[k].map(r=>r[3]).join(',');
   ok('Peasant Mob: 10 peasants at wave 30 (9 before wave 12), all of them mob',L.mob.length===10&&formLayout('mob',8).length===9&&L.mob.every(r=>r[0]==='peasant'&&r[3]==='mob'),roles('mob'));
   ok('Raven Murder: a lead and 7 ravens in a V (4 left, 3 right, each rank further back)',L.murder.length===8&&L.murder[0][3]==='alpha'&&L.murder.filter(r=>r[3]==='wing').length===7&&L.murder.filter(r=>r[1]<0).length===4&&L.murder.filter(r=>r[1]>0).length===3&&L.murder.slice(1).every(r=>r[2]<L.murder[0][2]&&r[0]==='raven'),roles('murder'));
   ok('Holy Procession: 3 wardens, the reliquary bearer and 2 chanting monks',L.procession.length===6&&L.procession.filter(r=>r[3]==='warden'&&r[0]==='soldier').length===3&&L.procession.filter(r=>r[3]==='chant'&&r[0]==='monk').length===2&&L.procession.some(r=>r[3]==='relic'&&r[0]==='monk'),roles('procession'));
   ok('Pike Phalanx: a 3x3 block of soldiers in three ranks',L.phalanx.length===9&&[0,1,2].every(k=>L.phalanx.filter(r=>r[3]==='pike'+k).length===3)&&L.phalanx.every(r=>r[0]==='soldier'),roles('phalanx'));
   ok('Knight\'s Wedge: a tip ahead of 4 flank knights',L.wedge.length===5&&L.wedge[0][3]==='tip'&&L.wedge.slice(1).every(r=>r[3]==='flank'&&r[2]<L.wedge[0][2])&&L.wedge.every(r=>r[0]==='knight'),roles('wedge'));}
  /* spawning: shared route, speed, gear */
  {const bad=[];for(const k of NEW){clean();const G=spawn(k,30);if(!G||!G.fm5||G.members.length!==formLayout(k,30).length)bad.push(k+' members');if(new Set(G.members.map(m=>m.route)).size!==1)bad.push(k+' route');
     if(new Set(G.members.map(m=>m.spd.toFixed(5))).size!==1)bad.push(k+' speed');if(FM5.live.indexOf(G)<0)bad.push(k+' live');}
   ok('each spawns its members on one route at one shared pace and is tracked',!bad.length,bad.join('; '));clean();}
  {const G=spawn('mob',30);const M=G.members;ok('every mob member raises a burning torch (its own, or the torchbearer\'s)',M.every(m=>m.fmFlame&&m.fmFlame.parent),M.map(m=>m.variant).join(','));
   ok('mob members never wear a tier above the wave (wave 8: tier 1 only)',(()=>{clean();const g=spawn('mob',8);return g.members.every(m=>tierOf('peasant',m.variant)===0);})(),'');clean();}
  {const G=spawn('murder',30),A=G.lead,W1=G.members[1];ok('the lead raven is a crested blood raven, 18% bigger, and the V ravens are drawn at 0.8',A.role==='alpha'&&A.variant===2&&A.fmRib&&near(A.b.scale.x,EN.raven.size*1.25*1.18,1e-4)&&near(W1.b.scale.x,EN.raven.size*1.25*.8,1e-4),A.b.scale.x.toFixed(3)+' '+W1.b.scale.x.toFixed(3));
   ok('a line of light joins the V (one mesh in the scene)',G.rib&&G.rib.parent===scene,'');clean();}
  {const G=spawn('procession',30),B=G.relic;const ref=(()=>{spawnEnemy({type:'monk',v:0},30);const e=enemies[enemies.length-1];const r=[e.maxHp,e.gold];removeEnemy(e);enemies.pop();return r;})();
   ok('the bearer holds the reliquary over his head and has 1.6x HP and gold',B.fmRelic&&B.fmHalo&&near(B.maxHp,ref[0]*1.6,1e-6)&&near(B.gold,ref[1]*1.6,1e-6),B.maxHp.toFixed(1)+' vs '+ref[0].toFixed(1));
   ok('the chanting monks swing censers and do not cast their own heals',G.members.filter(m=>m.role==='chant').every(m=>m.fmCenser&&m.healT>1e6)&&B.healT>1e6,'');
   ok('a pool of light lies under the reliquary',G.pool&&G.pool.parent===scene&&near(G.pool.position.x,B.x,1e-6),'');clean();}
  {const G=spawn('phalanx',30);ok('pikemen level their pikes by rank (front -0.06, middle 0.52, rear 1.2 rad) and hold',G.members.every(m=>m.fmPike&&m.fmHold&&near(m.fmPike.rotation.x,-[-.06,.52,1.2][+m.role[4]],1e-9)),'');clean();}
  {const G=spawn('wedge',30);const T=G.tip;let tg=0,fg=0;T.b.traverse(o=>{if(o.geometry===FM5.geo.tipGear)tg++;});G.members.forEach(m=>m.b.traverse(o=>{if(o.geometry===FM5.geo.flankGear)fg++;}));
   ok('the tip wears a gilded crown, a crimson plume and cloak; the flanks wear plumes; a chevron lies under the tip',tg===1&&fg===4&&G.chev&&G.chev.parent===scene,tg+' '+fg);clean();}
  /* Peasant Mob: the frenzy */
  {const G=spawn('mob',30),M=G.members,v=M[0].fmSpd;FM5.log=[];kill(M[0]);
   ok('a slain mob member makes the rest 5% faster',G.stacks===1&&M.slice(1).every(m=>near(m.spd,v*1.05,1e-9)),M[1].spd/v);
   for(let i=1;i<8;i++)kill(M[i]);ok('the frenzy stops at +30% (6 deaths)',G.stacks===6&&near(M[8].spd,v*1.3,1e-9)&&FM5.log.filter(l=>l.ev==='frenzy').length===6,(M[8].spd/v).toFixed(3));
   ok('a mob member that leaks (removed, not slain) does not feed the frenzy',(()=>{clean();const g=spawn('mob',30);removeEnemy(g.members[0]);return g.stacks===0;})(),'');clean();}
  /* Raven Murder: shared hits, then the scatter */
  {const G=spawn('murder',30),W=G.members.filter(m=>m.role==='wing'),A=G.lead;G.members.forEach(m=>{m.armor=0;m.res={};m.maxHp=m.hp=1e4;});
   const h0=G.members.map(m=>m.hp);hurt(W[0],100,'magic',{});const d=G.members.map((m,i)=>h0[i]-m.hp);
   ok('while the lead lives, a hit on a V raven is shared: it takes 40%, the other six 10% each, the lead nothing',near(d[1],40,1e-6)&&d.slice(2).every(x=>near(x,10,1e-6))&&d[0]===0,d.map(x=>x.toFixed(1)).join(' '));
   const ha=A.hp;hurt(A,100,'magic',{});ok('the lead takes its own hits in full',near(ha-A.hp,100,1e-6),ha-A.hp);
   const v=W[0].fmSpd;FM5.log=[];kill(A);ok('the lead falls: the flock scatters (45% slower for 1.6s), the line goes out',G.scattered&&W.every(m=>near(m.spd,v*.55,1e-9)&&m.fmScT===1.6)&&!G.rib.visible&&FM5.log.some(l=>l.ev==='scatter'),W[0].spd/v);
   const h1=W.map(m=>m.hp);hurt(W[0],100,'magic',{});ok('after the scatter hits are no longer shared',near(h1[0]-W[0].hp,100,1e-6)&&W.slice(1).every((m,i)=>m.hp===h1[i+1]),'');
   for(let i=0;i<60;i++)update(1/30);ok('after 1.6s each raven flies at its pace again, off to the side',W.every(m=>m.dead||near(m.spd,v,1e-9))&&W.every(m=>m.dead||Math.abs(m.off)>.3),W.map(m=>m.off.toFixed(2)).join(' '));clean();}
  /* Holy Procession: the healing light */
  {const G=spawn('procession',30),B=G.relic;for(let i=0;i<3;i++)update(1/30);const W=G.members.find(m=>m.role==='warden');
   spawnEnemy({type:'soldier'},30);const far=enemies[enemies.length-1];far.dist=B.dist+6;moveEnemy(far,0);
   spawnEnemy({type:'ogre'},30);const boss=enemies[enemies.length-1];boss.route=B.route;boss.dist=B.dist;boss.off=B.off+.3;moveEnemy(boss,0);
   for(const e of [W,far,boss,B])e.hp=e.maxHp*.5;G.healT=1e-4;const hw=W.hp,hf=far.hp,hb=boss.hp,hB=B.hp;update(.001);
   ok('every 0.5s a foe in the light heals 1.5% of its max HP (3% a second)',near(W.hp-hw,W.maxHp*.015,1e-6)&&near(G.healT,.5,.002),((W.hp-hw)/W.maxHp*100).toFixed(2)+'%');
   ok('foes outside the light, bosses and the bearer are not healed',far.hp===hf&&boss.hp===hb&&near(B.hp,hB,1e-9),'');
   FM5.log=[];kill(B);G.healT=1e-4;const h2=W.hp;update(.001);ok('the bearer falls: the reliquary drops, the light goes out and the healing ends',G.relic===null&&!G.pool.visible&&W.hp===h2&&FM5.log.some(l=>l.ev==='relic'),'');clean();}
  /* Pike Phalanx: holds while 5 stand */
  {const G=spawn('phalanx',30),M=G.members;for(let i=0;i<3;i++)update(1/30);FM5.log=[];
   const d0=M[4].dist;const u=pushE(M[4],.5);ok('while it holds the block cannot be pushed back',u===0&&M[4].dist===d0&&FM5.log.some(l=>l.ev==='pushBlocked'),u);
   const e=M[4],run=(sl,hold)=>{e.fmHold=hold;e.slow=sl;e.slowT=5;e.stunT=0;const a=e.dist;moveEnemy(e,.1);const r=e.dist-a;e.dist=a;return r;};
   const a=run(.5,true),b=run(.25,false),c=run(.5,false);e.fmHold=true;e.slow=0;e.slowT=0;
   ok('slows on it are halved (a 50% slow moves it as a 25% slow would)',near(a,b,1e-9)&&a>c,(a/c).toFixed(3));
   kill(M[0]);kill(M[1]);kill(M[2]);kill(M[3]);ok('with 5 standing it still holds',!G.broken&&M[5].fmHold,'');
   kill(M[5]);ok('below 5 it breaks: pikes go up, no more hold',G.broken&&M.every(m=>!m.fmHold)&&FM5.log.some(l=>l.ev==='break'),'');
   for(let i=0;i<40;i++)update(1/30);ok('after the break the pikes stand upright and push-backs work again',M.filter(m=>!m.dead).every(m=>m.fmPike.rotation.x<-1.2)&&pushE(M[6],.2)>0,M[6].fmPike.rotation.x.toFixed(2));clean();}
  /* Knight's Wedge: the tip, then the charge */
  {const G=spawn('wedge',30),T=G.tip,F=G.members.filter(m=>m.role==='flank');G.members.forEach(m=>{m.armor=0;m.res={};m.maxHp=m.hp=1e4;});
   let h=T.hp;hurt(T,100,'magic',{});const a=h-T.hp;h=F[0].hp;hurt(F[0],100,'magic',{});const b=h-F[0].hp;
   ok('while the wedge holds the tip takes 60% less damage',near(a,40,1e-6)&&near(b,100,1e-6),a+' / '+b);
   kill(F[0]);kill(F[1]);ok('with 2 flank knights standing it still holds',G.holds,'');kill(F[2]);h=T.hp;hurt(T,100,'magic',{});
   ok('below 2 flanks the wedge breaks and the tip takes full damage',!G.holds&&near(h-T.hp,100,1e-6),h-T.hp);clean();
   const G2=spawn('wedge',30);FM5.log=[];kill(G2.tip);ok('when the tip falls the rest charge for 3s',G2.members.filter(m=>!m.dead).every(m=>m.chargeT===3)&&FM5.log.some(l=>l.ev==='charge'),'');clean();}
  /* rates */
  {const rate=(w)=>__kk.formStats(w,600),A=rate(10),B=rate(20),C=rate(35);
   ok('formations per wave are as before: 0.35 under wave 25, 0.85 from wave 30',near(A.perWave,.35,.07)&&near(B.perWave,.35,.07)&&near(C.perWave,.85,.1),A.perWave+' '+B.perWave+' '+C.perWave);
   ok('the pick is even among the open formations (all nine from wave 25)',Object.keys(C.c).length===9&&Object.values(C.c).every(n=>n>C.perWave*600/9*.6),JSON.stringify(C.c));
   ok('nothing opens before its wave (wave 10: shield, charge, mob, murder)',Object.keys(A.c).sort().join()==='charge,mob,murder,shield',Object.keys(A.c).join());}
  /* elites inside formations, every arena, the overworld */
  {const bad=[];let el=0;for(let r=0;r<6;r++)for(const k of NEW){try{clean();const G=spawn(k,40,true);el+=G.members.filter(m=>m.elites).length;for(let i=0;i<4;i++){update(1/30);anim(1/30,time);}
      if(k==='mob'&&!G.members.every(m=>m.fmFlame))bad.push('mob flames');if(k==='phalanx'&&!G.members.every(m=>m.fmPike))bad.push('pikes');}catch(err){bad.push(k+' '+err.message);}}
   ok('formations take elites (35% of members) and keep their gear',!bad.length&&el>20,bad.slice(0,4).join('; ')+' elites='+el);clean();}
  {const bad=[];for(const ar of['snow','tundra','whitewaste','taiga','highlands']){if(!ARENAS[ar])continue;try{meta.arena=ar;state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;lives=1e9;clean();
      for(const k of NEW){const G=spawn(k,40,true);for(let i=0;i<4;i++){update(1/30);anim(1/30,time);}if(!G.members.every(m=>m.g.parent===scene))bad.push(ar+' '+k);}clean();}catch(err){bad.push(ar+' '+err.message);}}
   meta.arena='plains';ok('every arena takes every new formation (with elites) without an error',!bad.length,bad.join('; '));}
  {let msg='';try{meta.world='open';state='menu';clearWorld();buildMap(31);newGame(1);paused=true;lives=1e9;clean();let n=0;
     for(const k of NEW){const G=spawn(k,40);for(let i=0;i<6;i++)update(1/30);n+=G.members.filter(m=>isFinite(m.x)&&isFinite(m.y)).length;if(G.pool&&!isFinite(G.pool.position.y))msg+=' pool';}clean();msg+=' n='+n;
     ok('on the world map (OW.on) every new formation marches',OW.on&&n===8+6+9+5+10&&!/pool/.test(msg),msg+' OW='+OW.on);}
   catch(err){ok('on the world map every new formation marches',false,err.message);}
   meta.world='classic';state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;lives=1e9;clean();}
  /* cleanup */
  {const objs=[];for(const k of NEW){const G=spawn(k,30);objs.push(...G.objs);}const n=FM5.live.length;clearWorld();
   ok('clearWorld leaves nothing of the formations behind (V lines, light pools, chevrons)',n===5&&FM5.live.length===0&&objs.every(o=>!o.parent),n+' live before');
   state='menu';buildMap(31);MAP.fresh=true;newGame(1);paused=true;lives=1e9;clean();
   const G=spawn('wedge',30),C=G.chev;for(const m of G.members.slice())kill(m);ok('a formation that is wiped out is dropped at once',G.dropped&&!C.parent&&FM5.live.indexOf(G)<0,'');
   const toasts=document.querySelectorAll('.toast').length;const G2=spawn('murder',30);FM5.log=[];clearWorld();ok('clearWorld does not fire the formation moments (no scatter)',!FM5.log.some(l=>l.ev==='scatter'),'');
   state='menu';buildMap(31);MAP.fresh=true;newGame(1);paused=true;lives=1e9;clean();}
  /* the Formations page */
  {meta.notesSeen=NOTES_V;openGallery();const n0=scene.children.length;$('#bGalForms').click();
   ok('the Formations button opens a page of nine dioramas',GV&&GV.fm5&&GV.items.length===9&&CAM.gal==='var'&&$('#galTitle').textContent==='Formations'&&!$('#galVar').hidden,GV&&GV.items.length);
   let models=0;GV.items.forEach(it=>it.ms.forEach(q=>{if(q.m.b)models++;}));ok('each diorama uses the real unit models ('+models+')',models===FM5_ORDER.reduce((a,k)=>a+formLayout(k,25).length,0),'');
   ok('the first shows its name, wave and what it does',$('#gvName').textContent==='Shield Wall'&&/From wave 6/.test($('#gvDesc').textContent)&&$('#gvElite').style.display==='none',$('#gvDesc').textContent);
   for(let i=0;i<8;i++)varStep(1);galFrame(performance.now()/1000);galFrame(performance.now()/1000+.05);
   ok('the arrows step through all nine (the last is the Siege Column, from wave 25)',GV.idx===8&&$('#gvName').textContent==='Siege Column'&&/From wave 25/.test($('#gvDesc').textContent)&&$('#gvNext').disabled,'');
   varStep(-2);ok('the Pike Phalanx page',$('#gvName').textContent==='Pike Phalanx'&&/From wave 18/.test($('#gvDesc').textContent),'');
   const r0_=GV.rot[0];galFrame(performance.now()/1000+.3);ok('the dioramas turn slowly',GV.rot[0]>r0_,'');
   const mats=[];GV.items.forEach(it=>{for(const o of[it.rib,it.pool,it.chev])if(o)mats.push(o.material);});
   $('#bGalBack').click();ok('Back returns to the Bestiary and removes the page',!GV&&CAM.gal==='grid'&&scene.children.length===n0&&!$('#galLabels').hidden,scene.children.length+' vs '+n0);
   $('#bGalForms').click();openVar('soldier');ok('opening a unit from the Formations page closes it, and the Elite button is back',GV&&!GV.fm5&&GV.type==='soldier'&&$('#gvElite').style.display==='','');
   $('#bGalForms').click();varStep(1);varStep(1);galSetBiome('snow');ok('changing the biome keeps the Formations page open on the same diorama',GV&&GV.fm5&&GV.idx===2&&$('#gvName').textContent==='Peasant Mob','');galSetBiome('plains');
   closeGallery();ok('closing the Bestiary from the page leaves nothing behind',!GV&&scene.children.length===n0&&!CAM.gal,scene.children.length+' vs '+n0);}
  ok('no console errors',!err0.length,err0.slice(0,3).join(' | '));
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=oe;FM5.log=null;try{if(CAM.gal)closeGallery();clean();state='menu';paused=false;clearWorld();meta.arena=a0;meta.world=w0;meta.notesSeen=ns0;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
