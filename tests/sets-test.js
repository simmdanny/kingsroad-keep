(function(){
/* Artifact sets (v351): three artifacts of one element on the hero. Checks the colour remap, every set's mechanics, the screens, that the shared
   material caches stay clean and that a battle without the set puts kept materials back. Then the sweep: every lightning, fire, ice and light
   scroll is cast with its set on, and every material, mesh or particle in the set's colour range made outside the set context while it plays is
   counted as a leak (AS.dbg). Run on the dev page: __kk.ev(await (await fetch('/tests/sets-test.js')).text()) returns [name, ok, detail] rows.
   Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;projs.slice().forEach(p=>{scene.remove(p.m);});projs.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const run=sec=>{for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}};
const BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);
const equip=ids=>{meta.arts=meta.arts||{own:{},eq:{},pend:[]};for(const id of ids)if(id)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids.slice(0,3);ART_V++;AS.k=null;asEl();asTick(.001);};
const setEl=el=>{play();equip(BY[el].slice(0,3));return AS.el;};
/* n foes on the road nearest the hero */
const crowd=(n,hp,o)=>{o=o||{};const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>(o.min||1)){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);
  const L=[];for(let i=0;i<n;i++){spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdist+(o.sp||.18)*(i-(n-1)/2);e.off=0;e.spd=.0001;e.maxHp=e.hp=hp||1e7;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);L.push(e);}return L;};
/* not scroll visuals: the terrain's marsh ripples, the Resolve break puff, the sparkle on foes carrying a gem or scroll */
const AS_DBG_SKIP=/terRipple|terTick|rsvBreakFx|sparkle<update/;
const SO=(el,k)=>({src:heroU,el,spell:k||'x',bane:0});
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const ONLY=window.__asOnly||'',MECH=!ONLY||ONLY==='mech',SWEEP=ONLY==='mech'?[]:ONLY?[ONLY]:['lightning','fire','ice','light'];
try{if(MECH){
  /* ---- the remap ---- */
  {const H=c=>c.toString(16).padStart(6,'0'),hsl=c=>{const r=(c>>16&255)/255,g=(c>>8&255)/255,b=(c&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0;const d=mx-mn;if(d>0){h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}return{h,L:(mx+mn)/2,s:d};};
    const lt=hsl(asHex('lightning',0xbfd8ff)),lp=hsl(asHex('lightning',0x9a40ff)),fi=hsl(asHex('fire',0xff7a2a)),ic=hsl(asHex('ice',0x8fdcff)),iw=hsl(asHex('ice',0xffffff)),li=hsl(asHex('light',0xffe27a));
    ok('remap: lightning blue turns dark red',(lt.h<.04||lt.h>.96)&&lt.L<.45,H(asHex('lightning',0xbfd8ff)));ok('remap: lightning purple turns dark purple-black',lp.h>.7&&lp.h<.85&&lp.L<.25,H(asHex('lightning',0x9a40ff)));
    ok('remap: fire orange turns dark red-black',(fi.h<.04||fi.h>.96)&&fi.L<.34,H(asHex('fire',0xff7a2a)));ok('remap: ice blue turns dark blue, ice white stays white',ic.h>.58&&ic.h<.66&&ic.L<.42&&iw.L>.9,H(asHex('ice',0x8fdcff))+' '+H(asHex('ice',0xffffff)));
    ok('remap: light gold turns pale grey',li.s<.08&&li.L>.6,H(asHex('light',0xffe27a)));ok('remap: grey smoke and dark colours are left alone',['lightning','fire','ice'].every(el=>asHex(el,0x3a3030)===0x3a3030),'');
    let idem=true;for(const el of ['lightning','fire','ice','light'])for(let i=0;i<400;i++){const c=Math.floor(Math.random()*0xffffff),a=asHex(el,c),b=asHex(el,a);if(Math.abs((a>>16&255)-(b>>16&255))>1||Math.abs((a>>8&255)-(b>>8&255))>1||Math.abs((a&255)-(b&255))>1){idem=false;break;}}
    ok('remap: doing it twice changes nothing',idem);ok('dark has no colour change',asHex('dark',0x9a5aff)===0x9a5aff);}
  /* ---- which set ---- */
  play();ok('test hero in battle',!!heroU,heroU&&heroU.hero);
  equip(BY.fire.slice(0,3));ok('three fire artifacts make the fire set',AS.el==='fire');
  equip([BY.fire[0],BY.fire[1],BY.ice[0]]);ok('two fire and an ice make no set',AS.el===null);
  equip(BY.dark.slice(0,2).concat([null]));ok('two artifacts make no set',AS.el===null);
  /* ---- lightning (no Conductor's Ring: its leaps would muddy the numbers) ---- */
  play();equip(['coppercoil','staticcharm','tempestheart']);
  {const L=crowd(1,1e6,{min:1.5});const e=L[0];const h=e.hp;hurt(e,100,'magic',SO('lightning','vael'));const d1=h-e.hp;e.shockT=0;AS.el=null;const h2=e.hp;hurt(e,100,'magic',SO('lightning','vael'));const d0=h2-e.hp;AS.k=null;asEl();
    ok('Crimson Storm: lightning scrolls hit 25% harder',Math.abs(d1/d0-1.25)<.01,(d1/d0).toFixed(3));clean();}
  {const L=crowd(3,1e6,{sp:.3});const a=L[1];hurt(a,100,'magic',SO('lightning','vael'));ok('a lightning hit leaves the foe Shocked',a.shockT>4);const h=L.map(e=>e.hp);
    hurt(a,100,'magic',SO('lightning','vael'));ok('the next lightning hit blasts it and the foes around it',L[0].hp<h[0]&&L[2].hp<h[2]&&a.shockT===0,L.map((e,i)=>(h[i]-e.hp).toFixed(0)).join(','));
    const b0=h[0]-L[0].hp,b2=h[2]-L[2].hp;ok('the blast is 45% of the hit',Math.abs(b0-125*.45)<1&&Math.abs(b2-125*.45)<1,b0.toFixed(1)+' '+b2.toFixed(1));hurt(a,100,'magic',SO('lightning','vael'));ok('and the hit after that shocks it again',a.shockT>4);
    const h3=L[0].hp;hurt(a,100,'magic',{src:heroU,el:'lightning'});ok('a tower or the hero’s own lightning does nothing to it',L[0].hp===h3&&a.shockT>4);clean();}
  /* ---- fire ---- */
  setEl('fire');
  {const L=crowd(2,1e6,{sp:.1});hurt(L[0],100,'magic',SO('fire','emberbolt'));ok('Blackfire: a fire hit scorches the ground under the foe',AS.bg.length===1);
    L[1].burn=null;paused=false;run(.3);paused=true;ok('a foe walking on scorched ground burns',L[1].burn&&L[1].burn.t>0&&L[1].burn.o.syn);
    L[1].fly=true;L[1].burn=null;L[1].wither=null;paused=false;run(.3);paused=true;ok('a flyer above it withers in the smoke instead',L[1].wither&&L[1].wither.t>0&&!(L[1].burn&&L[1].burn.t>0));L[1].fly=false;
    AS.bg.length=0;paused=false;run(.3);paused=true;clean();}
  {const L=crowd(1,1e6,{min:1.5});const e=L[0];const h=e.hp,R=1;splashAt(e.x+R*1.1,e.z,R,10,'magic',SO('fire','geyser'),true);const in1=e.hp<h;const h2=e.hp;AS.el=null;splashAt(e.x+R*1.1,e.z,R,10,'magic',SO('fire','geyser'),true);const in0=e.hp<h2;AS.k=null;asEl();
    ok('fire blasts reach 15% further',in1&&!in0);AS.bg.length=0;clean();}
  /* ---- ice ---- */
  setEl('ice');
  {const L=crowd(2,1e6,{sp:.5});const [a,b]=L;asRun(()=>stunE(a,1));ok('Deep Winter: a foe frozen by an ice scroll counts as frozen',a.frzT>0);a.stunT=a.frzT=3.5;
    const f0=b.frzT||0;stunE(b,.3);ok('a freeze from anything else does not',!(b.frzT>f0));b.stunT=0;
    for(let i=0;i<40;i++)stunE(b,2);const rsvGone=stunE(b,1)===0;b.stunT=0;
    paused=false;run(.4);paused=true;ok('foes near it walk 50% slower',b.slow>=.5,b.slow);let mx=0,at=-1;paused=false;for(let i=0;i<24;i++){run(.1);if(b.hfDone&&at<0)at=(i+1)*.1+.4;if(b.hfDone)mx=Math.max(mx,b.stunT||0);}paused=true;
    ok('1.2s in the chill: Heavy Frost freezes it for 1s, even with its Resolve spent',b.hfDone&&mx>.85&&rsvGone&&at>1.1&&at<1.7,'at '+at.toFixed(1)+'s, stun '+mx.toFixed(2)+', rsvGone '+rsvGone);
    b.hfA=0;b.stunT=0;paused=false;run(2.3);paused=true;ok('Heavy Frost strikes a foe only once',!(b.stunT>.5));clean();}
  /* ---- dark ---- */
  setEl('dark');
  {const L=crowd(2,1e6,{sp:.1});hurt(L[0],100,'magic',SO('dark','wither'));ok('Grave Runes: a dark hit leaves dark mist',AS.mist.length===1);L[1].wither=null;paused=false;run(.3);paused=true;
    ok('a foe in the mist withers',L[1].wither&&L[1].wither.t>0);AS.mist.length=0;clean();}
  {const L=crowd(1,1e6,{min:1.5});const e=L[0];let n=0;const N=900;for(let i=0;i<N;i++){asClear();e.lastEl='dark';e.dead=true;asKill(e);n+=AS.runes.length;}for(const r of AS.runes)scene.remove(r.g);asClear();e.dead=false;
    ok('a dark kill leaves a rune 33% of the time',Math.abs(n/N-.33)<.05,(n/N).toFixed(3));e.lastEl='fire';e.dead=true;asKill(e);ok('a kill by anything else leaves none',AS.runes.length===0);e.dead=false;clean();}
  for(const k of AS_RUNES){const area=k==='blast'||k==='bolt',L=crowd(area?3:1,1e6,{sp:.25});const e=L[area?1:0];if(k==='bound'){for(let i=0;i<40;i++)stunE(e,2);e.stunT=0;}const h=L.map(q=>q.hp);
    asRuneDrop(e.x,e.z);const r=AS.runes[AS.runes.length-1];if(r){r.k=k;}paused=false;run(.15);paused=true;const gone=!AS.runes.includes(r);
    const nh=L.filter((q,i)=>q.hp<h[i]-1).length,eff=k==='wither'?e.wither&&e.wither.t>3:k==='poison'?e.asPsn&&e.asPsn.t>3:k==='blast'?nh===3:k==='bolt'?nh>=2:e.stunT>.3;
    ok('rune '+AS_RN[k]+': the next foe on it gets its curse',gone&&eff,'gone '+gone);asClear();clean();}
  /* ---- light ---- */
  setEl('light');
  {const L=crowd(1,1e6,{min:1.5});const e=L[0];hurt(e,10,'magic',SO('light','lightbolt'));ok('Pale Verdict: a light hit marks the foe',e.lmT>5);
    const v0=asVerdict;let nv=0,nj=0;asVerdict=(q,big)=>{if(big)nj++;else nv++;return 0;};const N=4000;try{for(let i=0;i<N;i++){e.lmT=1;e.dead=true;asKill(e);}}finally{asVerdict=v0;}e.dead=false;
    ok('a marked foe that dies fires a verdict 15% of the time, a third of them Judgements',Math.abs((nv+nj)/N-.15)<.02&&Math.abs(nj/N-.05)<.012,'verdict '+(nv/N).toFixed(3)+' judgement '+(nj/N).toFixed(3));
    e.lmT=0;e.dead=true;nv=0;asVerdict=(q,big)=>{nv++;return 0;};try{for(let i=0;i<300;i++)asKill(e);}finally{asVerdict=v0;}e.dead=false;ok('an unmarked foe fires none',nv===0);clean();}
  {const C=crowd(1,1e6,{min:1.5})[0];const ring=[];for(let i=0;i<24;i++){spawnEnemy({type:'soldier',v:0},20);const q=enemies[enemies.length-1];const a=i/24*6.2832,d=.8+(i%3)*.7;q.route=C.route;q.dist=C.dist;moveEnemy(q,0);q.x=C.x+Math.cos(a)*d;q.z=C.z+Math.sin(a)*d;q.spd=.0001;q.maxHp=q.hp=1e7;q.armor=0;q.res={};q.shield=0;q.weakT=0;ring.push(q);}
    const h=ring.map(q=>q.hp);const n1=asVerdict(C,false);const hit=ring.filter((q,i)=>q.hp<h[i]).length;ok('a Piercing Verdict pierces every foe on its line',n1>=1&&hit===n1,n1+' on the line, '+hit+' hurt');
    const n2=asVerdict(C,true);ok('a Piercing Judgement hits wider and Weakens',n2>=n1-1&&ring.some(q=>q.weakT>0),n2);paused=false;run(1);paused=true;clean();}
  {const L=crowd(3,1e6,{sp:.6});const [a,b,c]=L;b.boss=true;a.hp=a.maxHp*.3;b.hp=b.maxHp*.25;c.hp=c.maxHp*.9;asPact(a);asPact(b);asPact(c);
    ok('Blood Pact fells a foe left below 30% health',a.dead);ok('but not a boss: it bleeds and is drained',!b.dead&&b.asBld&&b.hp<b.maxHp*.25,(b.hp/b.maxHp).toFixed(3));
    ok('a healthy foe is drained 10% and bleeds',!c.dead&&Math.abs(c.hp/c.maxHp-.8)<.005&&c.asBld,(c.hp/c.maxHp).toFixed(3));b.boss=false;
    const p0=asPact;let np=0;asPact=()=>{np++;};const N=6000;try{for(let i=0;i<N;i++){c.bpT=-9;hurt(c,1,'magic',SO('light','lightbolt'));}}finally{asPact=p0;}ok('1% of light hits are a Blood Pact',Math.abs(np/N-.01)<.005,(np/N).toFixed(4));clean();}
  /* ---- the screens ---- */
  {setEl('fire');const hid=heroU.hero;state='menu';showOverlay('menu');ART_HERO=hid;try{goTab('heroes');}catch(e){}artTab('arts');const bx=document.getElementById('asBox');const rows=bx?bx.querySelectorAll('.as-row'):[];const on=bx&&bx.querySelector('.as-row.on');
    ok('Heroes > Artifacts shows every set',rows.length===AS_ELS.length&&AS_ELS.length===6,rows.length);ok('and the hero’s set is marked active',!!on&&/Blackfire/.test(on.textContent)&&/ACTIVE/.test(on.textContent));artTab('heroes');
    play();equip(BY.fire.slice(0,3));state='playing';artPeekOpen();const pk=document.querySelector('#artPeek .as-peek');ok('the in-game artifact card shows the set bonus',!!pk&&/Blackfire/.test(pk.textContent));const ov=document.getElementById('artPeek');if(ov)ov.remove();paused=true;
    APK.sig='';artHudSync();const hud=document.getElementById('artHud');ok('the artifact badge glows with the set',!!hud&&hud.classList.contains('as-on'));}
  /* ---- caches stay clean, kept materials come back ---- */
  setEl('ice');
  {const h1=asRun(()=>haloMat(0x8fdcff)),h2=haloMat(0x8fdcff);ok('haloMat inside the set gives a recoloured copy, the cache keeps the original',h1!==h2&&h1.color.getHex()!==0x8fdcff&&h2.color.getHex()===0x8fdcff,h1.color.getHexString()+' '+h2.color.getHexString());
    const m1=asRun(()=>M(0x8fdcff)),m2=M(0x8fdcff);ok('M() likewise',m1!==m2&&m2.color.getHex()===0x8fdcff);
    const ms=asRun(()=>new THREE.Mesh(nsIceGeos()[0],NS_ICE));ok('a shared ice material on a set mesh is swapped, the original untouched',ms.material!==NS_ICE&&NS_ICE.color.getHex()===0xcfeeff&&ms.material.color.getHex()!==0xcfeeff);
    const kept=asRun(()=>new THREE.MeshBasicMaterial({color:0x8fdcff,transparent:true,blending:THREE.AdditiveBlending}));ok('a material made in the set context is recoloured, and its glow turns normal',kept.color.getHex()!==0x8fdcff&&kept.blending===THREE.NormalBlending);
    kept.color.setHex(0x9fd8ff);ok('and stays recoloured when its colour is set again',kept.color.getHex()!==0x9fd8ff);
    const sh=asRun(()=>new THREE.ShaderMaterial({vertexShader:'void main(){gl_Position=vec4(0.);}',fragmentShader:'void main(){gl_FragColor=vec4(1.);}',blending:THREE.AdditiveBlending}));ok('shader materials get the remap in their fragment shader',/asMap\(/.test(sh.fragmentShader)&&sh.blending===THREE.NormalBlending);
    equip([BY.ice[0],BY.fire[0],BY.dark[0]]);ok('a battle without the set puts kept materials back',kept.color.getHex()===0x8fdcff&&kept.blending===THREE.AdditiveBlending&&!/asMap\(/.test(sh.fragmentShader));
    const c=new THREE.Color(0x8fdcff);ok('outside a set nothing is recoloured',c.getHex()===0x8fdcff&&new THREE.MeshBasicMaterial({color:0x8fdcff}).color.getHex()===0x8fdcff);}
  }
  /* ---- the sweep: every scroll of a recoloured set, cast with the set on ---- */
  const SW={};
  for(const el of SWEEP){setEl(el);const ks=Object.keys(SPELL_EL).filter(k=>SPELL_EL[k]===el&&SPELLS_S[k]);
    for(const k of ks){clean();for(const f of fx.slice()){f.life=0;}updFx(.01);meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};const L=crowd(8,1e7);const e0=errs,r0n=AS.regN,sw0=AS.sw.size;
      AS.dbg={n:0,inN:0,L:[],sig:{},skip:AS_DBG_SKIP};heroU.scd={};heroU.gcd=0;try{fireScroll(heroU,k,tStats(heroU),L.slice());}catch(err){console.error(err);}paused=false;run(9);paused=true;const D=AS.dbg;AS.dbg=null;
      SW[k]={el,sig:D.sig,leak:D.n,ctx:(AS.regN-r0n)+(AS.sw.size-sw0)+D.inN,hurt:L.filter(e=>e.hp<e.maxHp).length,err:errs-e0,L:D.L.slice(0,3)};}}
  if(SWEEP.length){const leaky=Object.entries(SW).filter(([k,v])=>v.leak>0);
  ok('sweep: every scroll was cast and drew in the set context',Object.values(SW).every(v=>v.ctx>0),Object.entries(SW).filter(([k,v])=>!(v.ctx>0)).map(([k])=>k).join(','));
  ok('sweep: no scroll draws in its old colours with the set on',!leaky.length,leaky.map(([k,v])=>k+':'+v.leak+' '+v.L.join(' || ')).join(' ;; '));
  ok('sweep: no errors',Object.values(SW).every(v=>v.err===0),Object.entries(SW).filter(([k,v])=>v.err).map(([k])=>k).join(','));
  window.__asSweep=SW;}
  ok('no errors in the whole run',errs===0,errs);
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;AS.dbg=null;try{clean();asClear();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
