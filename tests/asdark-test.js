(function(){
/* The dark artifact set (v356, v362): its remap turns dark scrolls fully purple; since v362 it acts only on dark scrolls. The dark remap (JS and GLSL), the context for scrolls of every element while the dark set
   is on, the mechanics staying with dark hits, other sets unchanged, and a sweep: scrolls of every other element cast with the dark set on must draw
   in the context and leave nothing in their old colours (AS.dbg). Run on the dev page: __kk.ev(await (await fetch('/tests/asdark-test.js')).text())
   returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;projs.slice().forEach(p=>{scene.remove(p.m);});projs.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const run=sec=>{for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}};
const BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);
const equip=ids=>{meta.arts=meta.arts||{own:{},eq:{},pend:[]};for(const id of ids)if(id)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids.slice(0,3);ART_V++;AS.k=null;asEl();asTick(.001);};
const setEl=el=>{play();equip(BY[el].slice(0,3));return AS.el;};
const crowd=(n,hp)=>{const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);
  const L=[];for(let i=0;i<n;i++){spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdist+.18*(i-(n-1)/2);e.off=0;e.spd=.0001;e.maxHp=e.hp=hp||1e7;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);L.push(e);}return L;};
const hsl=(r,g,b)=>{const c=new THREE.Color(r,g,b),o={};c.getHSL(o);return o;};
const isPur=o=>o&&o.s>.12&&o.h>=.69&&o.h<=.88;
const errs0=[];const ce=console.error;let errs=0;console.error=function(){errs++;errs0.push([].slice.call(arguments).join(' ').slice(0,200));return ce.apply(console,arguments);};
try{
  /* the remap */
  {const T=[[1,.45,.1],[.55,.85,1],[.95,.9,.3],[.3,.8,.3],[.9,.1,.1],[.4,.6,1]],bad=[];for(const c of T){const o=asMapRGB('dark',...c);if(!o||!isPur(hsl(...o)))bad.push(c.join(','));}
   ok('fire, ice, light, nature, red and blue colours all turn purple',!bad.length,bad.join(' | '));}
  {const o=asMapRGB('dark',.97,.97,.97),h=o&&hsl(...o);ok('white turns pale lavender',h&&isPur(h)&&h.l>.75,h&&JSON.stringify(h));}
  ok('greys, smoke and black stay',!asMapRGB('dark',.5,.5,.5)&&!asMapRGB('dark',.1,.1,.1)&&!asMapRGB('dark',0,0,0));
  ok('purple stays as it is',!asMapRGB('dark',.6,.3,.95)&&!asMapRGB('dark',.45,.1,.7));
  {let bad=0;for(let i=0;i<300;i++){const c=[rnd(),rnd(),rnd()],o=asMapRGB('dark',...c);if(o&&asMapRGB('dark',...o))bad++;}ok('the remap is idempotent',!bad,bad);}
  {const h=asHex('dark',0xff8a3a),o=hsl((h>>16&255)/255,(h>>8&255)/255,(h&255)/255);ok('particle colours follow (asHex)',isPur(o),h.toString(16));}
  ok('the shader remap exists for the dark set',typeof AS_GL.dark==='string'&&/asMap/.test(AS_GL.dark));
  ok('the set card says so (dark scrolls only, v362)',/dark scrolls turn fully purple/.test(AS_D.dark.d[0]));
  ok('the notes and the changelog tell of it (v362: sets stay with their element)',document.body.innerHTML.includes('Artifact sets stay with their element')&&!document.body.innerHTML.includes('Grave Runes turn every scroll purple')&&CLOG.some(c=>c.t==='Artifact sets stay with their element'));
  /* the context and the mechanics */
  {setEl('dark');ok('the dark set is on',AS.el==='dark');const L=crowd(6,1e7);const r0n=AS.regN,sw0=AS.sw.size;meta.spells.cinders=meta.spells.cinders||{lvl:1,hero:null};heroU.scd={};heroU.gcd=0;
   fireScroll(heroU,'cinders',tStats(heroU),L.slice());paused=false;run(2);paused=true;ok('a fire scroll cast with the dark set keeps its own colours (v362: sets act only on their element)',(AS.regN-r0n)+(AS.sw.size-sw0)===0,(AS.regN-r0n)+(AS.sw.size-sw0));
   ok('but a fire hit leaves no dark mist (that stays with dark hits)',!AS.mist.length,AS.mist.length);clean();}
  {setEl('fire');const L=crowd(6,1e7);const r0n=AS.regN;meta.spells.frostshard=meta.spells.frostshard||{lvl:1,hero:null};heroU.scd={};heroU.gcd=0;
   fireScroll(heroU,'frostshard',tStats(heroU),L.slice());paused=false;run(2);paused=true;ok('other sets still colour only their own element (ice under the fire set stays ice)',AS.regN===r0n,AS.regN-r0n);clean();}
  {setEl('dark');let made=null;const c0=THREE.MeshBasicMaterial;asRun(()=>{made=new THREE.MeshBasicMaterial({color:0xff8a3a,transparent:true,blending:THREE.AdditiveBlending});});
   ok('purple glows stay additive',made.blending===THREE.AdditiveBlending&&isPur(hsl(made.color.r,made.color.g,made.color.b)));}
  {setEl('dark');const tex=new THREE.CanvasTexture(document.createElement('canvas'));let m=null;asRun(()=>{m=new THREE.MeshBasicMaterial({map:tex,color:0xffd060});});const had=!!(m.userData&&m.userData.adkTex);
   equip([]);asTick(.001);ok('a texture made with the dark set is remapped in its shader, and put back when the set comes off',had&&!m.userData.adkTex&&m.color.getHex()===0xffd060);tex.dispose();}
  /* the sweep (v362): dark scrolls with the dark set draw in its context and leave nothing in other colours; one scroll of every other element
     cast with the dark set draws nothing in the context at all */
  const SW={},SO={};const AS_DBG_SKIP=/terRipple|terTick|rsvBreakFx|sparkle<update/;const okK=k=>SPELLS_S[k]&&!(RB[SPELLS_S[k].r]&&RB[SPELLS_S[k].r].i>=7);
  const sweep=(k,into)=>{setEl('dark');clean();for(const f of fx.slice()){f.life=0;}updFx(.01);meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};const L=crowd(8,1e7);const e0=errs,r0n=AS.regN,sw0=AS.sw.size;
    AS.dbg={n:0,inN:0,L:[],sig:{},skip:AS_DBG_SKIP};heroU.scd={};heroU.gcd=0;try{fireScroll(heroU,k,tStats(heroU),L.slice());}catch(err){console.error(err);}paused=false;run(7);paused=true;const D=AS.dbg;AS.dbg=null;
    into[k]={leak:D.n,ctx:(AS.regN-r0n)+(AS.sw.size-sw0)+D.inN,err:errs-e0,L:D.L.slice(0,3)};};
  {const dk=Object.keys(SPELL_EL).filter(k=>SPELL_EL[k]==='dark'&&okK(k));for(const k of[dk[0],dk[Math.floor(dk.length/2)],dk[dk.length-1]].filter((k,i,a)=>a.indexOf(k)===i))sweep(k,SW);}
  for(const el of Object.keys(ELEM).filter(el=>el!=='dark')){const k=Object.keys(SPELL_EL).find(q=>SPELL_EL[q]===el&&okK(q));if(k)sweep(k,SO);}
  ok('sweep: dark scrolls with the dark set draw in its context',Object.keys(SW).length>=2&&Object.values(SW).every(v=>v.ctx>0),Object.entries(SW).map(([k,v])=>k+':'+v.ctx).join(','));
  {const leaky=Object.entries(SW).filter(([k,v])=>v.leak>0);ok('sweep: and leave nothing in other colours',!leaky.length,leaky.map(([k,v])=>k+':'+v.leak+' '+v.L.join(' || ')).join(' ;; '));}
  ok('sweep: scrolls of the other elements cast with the dark set keep their own colours',Object.keys(SO).length>=4&&Object.values(SO).every(v=>v.ctx===0),Object.entries(SO).map(([k,v])=>k+':'+v.ctx).join(','));
  ok('sweep: no errors',Object.values(SW).concat(Object.values(SO)).every(v=>v.err===0),errs0.slice(-2).join(' / '));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;AS.dbg=null;try{clean();if(typeof asClear==='function')asClear();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return out;})()
