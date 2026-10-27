(function(){
/* Nature (v355): the element and Overgrown, the six nature scrolls and the Eldritch Tree, the six nature artifacts, the Evergreen set, the nine
   new synergies and the screens. Run on the dev page: __kk.ev(await (await fetch('/tests/nature-test.js')).text()) returns [name, ok, detail]
   rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;NAT.zones.length=0;NAT.pollen.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}};
const run=sec=>{paused=false;for(let i=0;i<sec/.05;i++){if(heroU)heroU.cd=1e9;update(.05);updFx(.05);}paused=true;};
const equip=ids=>{meta.arts=meta.arts||{own:{},eq:{},pend:[]};for(const id of ids)if(id)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids.slice(0,3);ART_V++;AS.k=null;asEl();asTick(.001);};
const crowd=(n,hp,o)=>{o=o||{};const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:o.type||'soldier',v:0},20);const e0=enemies[enemies.length-1];
  for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>(o.min||1)){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);
  const L=[];for(let i=0;i<n;i++){spawnEnemy({type:o.type||(i%3?'soldier':'knight'),v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdist+(o.sp||.18)*(i-(n-1)/2);e.off=0;e.spd=.0001;e.maxHp=e.hp=hp||1e7;e.armor=0;e.res={};e.shield=0;moveEnemy(e,0);L.push(e);}return L;};
const SO=k=>({src:heroU,el:'nature',spell:k||'thornwhip',bane:0});
const NS=['thornwhip','bramble','roots','treant','bloom','gaia'],NA=['oakleaf','briarband','seedpouch','druidtorc','verdantchalice','wildheart'];
const cast=(k,L)=>{meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};heroU.scd={};heroU.gcd=0;castScrollNow(k,heroU,tStats(heroU),L.slice(),100,{src:heroU,el:'nature',spell:k,bane:0});};
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  /* ---- the element ---- */
  ok('Nature is an element',!!ELEM.nature&&ELEM.nature.n==='Nature');
  ok('one nature scroll at every rarity but Ancient',['common','uncommon','rare','epic','legendary','mythic'].every((r,i)=>SPELLS_S[NS[i]].r===r&&SPELL_EL[NS[i]]==='nature'),NS.map(k=>SPELLS_S[k].r).join(','));
  ok('the Eldritch Tree is nature now',SPELL_EL.firsttree==='nature'&&SPELLS_S.firsttree.r==='ancient');
  ok('every nature scroll is complete (list, text, art, cast, animation)',NS.every(k=>SCROLL_IDS.includes(k)&&SPELL_FX[k]&&SIG[k]&&SPI[k]&&NSP[k]&&ANIM_D[k]&&POSES[k]));
  ok('the scroll list stays in rarity order',SCROLL_IDS.every((k,i)=>!i||RB[SPELLS_S[SCROLL_IDS[i-1]].r].i<=RB[SPELLS_S[k].r].i));
  play();{spawnEnemy({type:'ram',v:0},20);const r=enemies[enemies.length-1];spawnEnemy({type:'golem',v:0},20);const g=enemies[enemies.length-1];
    ok('foes have nature weaknesses and strengths',r.res&&r.res.nature>1&&g.res&&g.res.nature<1,(r.res&&r.res.nature)+' / '+(g.res&&g.res.nature));clean();}
  /* ---- Overgrown ---- */
  {const L=crowd(2,1e6,{min:1.5,sp:2});const [a,b]=L;ovgApply(a,4);run(.2);ok('Overgrown slows the foe 20%',a.slow>=.2&&a.ovgT>3);
    const ha=a.hp,hb=b.hp;hurt(a,100,'magic',{src:heroU,el:'nature'});hurt(b,100,'magic',{src:heroU,el:'nature'});ok('and nature hits it 10% harder',Math.abs((ha-a.hp)/(hb-b.hp)-1.1)<.01,((ha-a.hp)/(hb-b.hp)).toFixed(3));clean();}
  /* ---- the scrolls ---- */
  {const L=crowd(3,1e6);cast('thornwhip',L);run(.4);ok('Thorn Whip lashes one foe and leaves it Overgrown',L[0].hp<1e6&&L[0].ovgT>0&&L[1].hp===1e6,(1e6-L[0].hp).toFixed(0));clean();}
  {const L=crowd(6,1e6);cast('bramble',L);run(1.5);ok('Bramble Patch slows, cuts and overgrows the foes in it',L.filter(e=>e.hp<1e6&&e.slow>=.35&&e.ovgT>0).length>=4);run(6);const h=L.map(e=>e.hp);run(1);ok('and withers after 6s',L.every((e,i)=>e.hp===h[i]));clean();}
  {const L=crowd(7,1e6);cast('roots',L);ok('Entangling Roots holds up to five foes',L.filter(e=>e.heldT>0&&e.stunT>0).length===5,L.filter(e=>e.heldT>0).length);run(2);clean();}
  {const L=crowd(6,1e6,{sp:.25});cast('treant',L);run(5);ok('the Oakheart Treant slams the foes and overgrows them',L.filter(e=>e.hp<1e6&&e.ovgT>0).length>=3,L.filter(e=>e.hp<1e6).length);run(6);clean();}
  {const L=crowd(6,1e6,{sp:.3});cast('bloom',L);run(1);ok('the Bloom holds the foes while it opens',L.filter(e=>e.heldT>0).length>=4);run(1.2);
    ok('then bursts on them and leaves its pollen',L.every(e=>e.hp<1e6&&e.ovgT>0)&&NAT.pollen.length===1);const h=L.map(e=>e.hp);run(1);ok('the pollen keeps hurting',L.some((e,i)=>e.hp<h[i]));clean();}
  {const L=crowd(6,1e6,{sp:.5});lives=Math.max(1,keepMax()-3);const l0=lives;cast('gaia',L);run(4.5);ok('Wrath of Gaia: the forest tears up through the foes on the road',L.every(e=>e.hp<1e6),L.filter(e=>e.hp<1e6).length);
    run(1.5);ok('then strikes every foe, overgrows them and mends the keep 2 lives',L.every(e=>e.ovgT>4)&&lives===l0+2,lives-l0);run(1.5);clean();lives=1e9;}
  /* ---- the artifacts ---- */
  ok('six nature artifacts, one per rarity',NA.every((id,i)=>ART_BY[id]&&ART_BY[id].el==='nature'&&ART_BY[id].r===ART_RAR[i]&&ART_G[id]&&ART_LVD[id]));
  {equip(['oakleaf',null,null]);const L=crowd(2,1e6,{min:1.5,sp:2});const h0=L[0].hp,h1=L[1].hp;hurt(L[0],100,'magic',SO());equip([null,null,null]);hurt(L[1],100,'magic',SO());
    ok('Oakleaf Charm: +10% nature damage',Math.abs((h0-L[0].hp)/(h1-L[1].hp)-1.1)<.01,((h0-L[0].hp)/(h1-L[1].hp)).toFixed(3));clean();}
  {equip(['briarband',null,null]);const e=crowd(1,1e6,{min:1.5})[0];hurt(e,10,'magic',SO());ok('Briar Band: nature hits overgrow',e.ovgT>2.5);clean();}
  {equip(['druidtorc',null,null]);const e=crowd(1,1e6,{min:1.5})[0];for(let i=0;i<40;i++)stunE(e,2);e.stunT=0;e.rsv=0;e.rsvT=0;e.unstopT=0;ovgApply(e,3);hurt(e,10,'magic',SO());ok('Druid’s Torc: nature roots an Overgrown foe',e.stunT>0||e.torcT===time,e.stunT);clean();}
  {equip(['seedpouch',null,null]);const L=crowd(2,1e6,{sp:.2});L[0].hp=5;hurt(L[0],100,'magic',SO());ok('Pouch of Wild Seeds: a nature kill grows a thorn bush',L[0].dead&&NAT.zones.some(z=>z.kind==='bush'));const h=L[1].hp;run(1.1);ok('that cuts foes walking into it',L[1].hp<h&&L[1].slow>=.3);clean();}
  {equip(['verdantchalice',null,null]);const L=crowd(3,1e6);lives=keepMax()-2;const l0=lives;cast('thornwhip',L);const l1=lives;cast('thornwhip',L);ok('Verdant Chalice: casting a nature scroll mends 1 life, then waits its cooldown',l1===l0+1&&lives===l1,(l1-l0)+','+(lives-l1));lives=1e9;run(.5);clean();}
  {equip(['wildheart',null,null]);const L=crowd(4,1e6,{sp:.3});NAT.hwT=-9;const h=L.map(e=>e.hp);hurt(L[1],10,'magic',SO());ok('Heart of the Wildwood: vines strike 2 more foes nearby',L.filter((e,i)=>i!==1&&e.hp<h[i]).length===2);run(.6);clean();}
  /* ---- the Evergreen set ---- */
  {equip(['oakleaf','briarband','seedpouch']);ok('three nature artifacts make the Evergreen set',AS.el==='nature');const L=crowd(2,1e6,{min:1.5,sp:2});const h0=L[0].hp;hurt(L[0],100,'magic',SO());
    equip(['oakleaf',null,null]);const h1=L[1].hp;hurt(L[1],100,'magic',SO());ok('Evergreen: nature scrolls hit 20% harder',Math.abs((h0-L[0].hp)/(h1-L[1].hp)-1.2)<.02,((h0-L[0].hp)/(h1-L[1].hp)).toFixed(3));clean();
    equip(['oakleaf','druidtorc','wildheart']);const M=crowd(2,1e6,{sp:.2});NAT.hwT=time;hurt(M[1],10,'magic',SO());ok('Evergreen: every nature hit overgrows',M[1].ovgT>3);ovgApply(M[0],3);M[0].hp=5;NAT.hwT=time;hurt(M[0],100,'magic',SO());
    ok('an Overgrown foe that dies bursts into a thicket',M[0].dead&&NAT.zones.some(z=>z.kind==='thicket'));clean();
    lives=keepMax()-1;NAT.kills=29;const N=crowd(1,1e6)[0];N.hp=5;hurt(N,100,'magic',SO());ok('every 30th nature kill mends the keep',lives===keepMax());lives=1e9;clean();equip([null,null,null]);}
  /* ---- the synergies ---- */
  ok('nine new synergies in the Cookbook',['brushfire','frostbloom','grounded','sunbloom','rotbloom','deeproots','wardenoak','pollenblast','worldroot'].every(k=>COMBO_BY[k]&&COMBOS.includes(COMBO_BY[k])));
  const fired=k=>!!(meta.combos&&meta.combos[k]);meta.combos={};
  {const L=crowd(3,1e6,{sp:.3});ovgApply(L[1],3);const h=L[1].hp;hurt(L[1],100,'magic',{src:heroU,el:'fire'});ok('Brushfire: fire burns the vines away, harder, and spreads',fired('brushfire')&&L[1].ovgT<=0&&L[0].burn&&L[2].burn,(h-L[1].hp).toFixed(0));clean();}
  {const e=crowd(1,1e6,{min:1.5})[0];ovgApply(e,3);e.stunT=0;hurt(e,10,'magic',{src:heroU,el:'ice'});ok('Frostbloom: ice freezes the vines',fired('frostbloom')&&e.stunT>0);clean();}
  {const L=crowd(3,1e6,{sp:.4});L.forEach(e=>ovgApply(e,3));const h=L.map(e=>e.hp);hurt(L[1],100,'magic',{src:heroU,el:'lightning'});ok('Grounded: lightning runs down the vines',fired('grounded')&&L[0].hp<h[0]&&L[2].hp<h[2]);clean();}
  {const L=crowd(2,1e6,{min:1.5,sp:2});ovgApply(L[0],3);const h0=L[0].hp,h1=L[1].hp;hurt(L[0],100,'magic',{src:heroU,el:'light'});hurt(L[1],100,'magic',{src:heroU,el:'light'});ok('Sunbloom: light on vines hits 30% harder',fired('sunbloom')&&Math.abs((h0-L[0].hp)/(h1-L[1].hp)-1.3)<.02);clean();}
  {const L=crowd(2,1e6,{min:1.5,sp:2});L[0].wither={t:1,dps:1,o:{src:heroU,el:'dark',dot:true}};const h0=L[0].hp,h1=L[1].hp;hurt(L[0],100,'magic',SO());hurt(L[1],100,'magic',SO());
    ok('Rotbloom: nature on a withered foe, +40% and the wither lasts',fired('rotbloom')&&L[0].wither.t>=3&&Math.abs((h0-L[0].hp)/(h1-L[1].hp)-1.4)<.02);clean();}
  {const L=crowd(2,1e6,{min:1.5,sp:2});L[0].heldT=2;const h0=L[0].hp,h1=L[1].hp;hurt(L[0],100,'magic',SO());hurt(L[1],100,'magic',SO());ok('Deep Roots: nature on a held foe, +40%',fired('deeproots')&&Math.abs((h0-L[0].hp)/(h1-L[1].hp)-1.4)<.02);
    const h2=L[0].hp;hurt(L[0],100,'magic',Object.assign(SO('firsttree'),{anc:true}));ok('but not for Ancient scrolls',Math.abs((h2-L[0].hp)-(h1-L[1].hp))<.5);clean();}
  {const L=crowd(5,1e6,{sp:.25});L.forEach(e=>ovgApply(e,9));cast('treant',L);run(4);ok('Warden Oak: the Treant roots Overgrown foes',fired('wardenoak'));run(7);clean();}
  {const L=crowd(5,1e6,{sp:.3});cast('bloom',L);run(2.2);const h=L.map(e=>e.hp);hurt(L[2],10,'magic',{src:heroU,el:'lightning'});ok('Pollen Blast: lightning sets the pollen off',fired('pollenblast')&&L.filter((e,i)=>h[i]-e.hp>100).length>=4&&NAT.pollen.every(c=>c.lit||c.until<=time));run(1.2);clean();}
  {ANC.live.firsttree=true;const L=crowd(3,1e6,{sp:.5});lives=1e9;cast('gaia',L);ANC.live.firsttree=false;ok('World Root: Gaia with the Eldritch Tree standing',fired('worldroot'));run(7);clean();}
  /* ---- the screens ---- */
  {state='menu';showOverlay('menu');try{goTab('heroes');}catch(e){}artTab('arts');const ch=document.querySelector('#avFilters [data-af="nature"]');ok('the artifact screen has a Nature filter',!!ch);
    if(ch){ch.click();const cards=document.querySelectorAll('#artView .av-card');ok('and it shows the six nature artifacts',cards.length===6,cards.length);}
    const bx=document.getElementById('asBox');ok('the sets box lists Evergreen',!!bx&&/Evergreen/.test(bx.textContent)&&bx.querySelectorAll('.as-row').length===6);
    ART_FIL='all';artTab('heroes');try{goTab('battle');}catch(e){}}
  {meta.combos={brushfire:1,worldroot:1};let html='';try{goTab('spells');}catch(e){}if(typeof renderCookbook==='function'){try{renderCookbook();}catch(e){}}const ck=document.getElementById('cookList');html=ck?ck.textContent:'';
    ok('the Cookbook shows the new synergies',/Brushfire/.test(html)&&/World Root/.test(html),html.length);try{goTab('battle');}catch(e){}}
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();ART_V++;AS.k=null;lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
