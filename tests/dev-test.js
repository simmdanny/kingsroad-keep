(function(){
/* Developer mode checks. Run on the dev page: __kk.ev(await (await fetch('/tests/dev-test.js')).text()) returns [name, ok, detail] rows.
   Puts the account back the way it was afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':d]);const m0=JSON.stringify(meta);
const act=a=>{const b=document.querySelector(`#devPanel [data-a="${a}"]`);if(!b)throw new Error('no button '+a);b.click();};
const pick=()=>{const o={};for(const k in DEV_KEYS)o[k]=meta[k]===undefined?null:meta[k];return JSON.stringify(o);};
try{
 const tb=$('#bTestAll');ok('menu button is Developer mode',/^Developer mode/.test(tb.textContent),tb.textContent);
 /* a known starting account: some currency, one scroll, hero and tower still locked */
 meta.dev=false;delete meta.devSnap;meta.gems=1234;meta.scraps=56;meta.crowns=78;const k0=SCROLL_IDS.find(k=>SPELLS_S[k].r==='epic');delete meta.spells[k0];
 const h0=HEROES.find(h=>h.id!=='robin'&&h.id!==meta.equipped).id;meta.owned[h0]=false;delete meta.heroes[h0];const t0='obelisk';meta.unl=meta.unl||{};delete meta.unl[t0];refreshTorder();
 meta.arts={own:{coppercoil:1},eq:{},pend:[],scrap:7,lv:{coppercoil:2}};HEROES.forEach(h=>artEq(h.id));ART_V++;saveMeta();
 const base=pick();showOverlay('menu');devSync();ok('off: no wrench in the menu',$('#bDev').hidden);
 tb.click();ok('tap turns it on',meta.dev===true&&/On:/.test($('#testAllSub').textContent));ok('account copied before anything changes',!!meta.devSnap&&meta.devSnap.gems===1234&&!meta.devSnap.spells[k0]);
 ok('gems, scraps and crowns unlimited',meta.gems===DEV_INF&&meta.scraps===DEV_INF&&meta.crowns===DEV_INF);
 ok('every scroll unlocked at level 1',SCROLL_IDS.every(k=>meta.spells[k])&&meta.spells[k0].lvl===1);
 ok('every hero unlocked at level 1',HEROES.every(h=>owns(h.id))&&hs(h0).lvl===1);ok('every tower unlocked',ALL_T.every(unlocked)&&TORDER.length===ALL_T.length,TORDER.length+'/'+ALL_T.length);
 ok('every artifact owned, unlimited artifact scraps',ARTS.every(a=>artOwned(a.id))&&meta.arts.scrap===DEV_INF,ARTS.filter(a=>artOwned(a.id)).length+'/'+ARTS.length);
 {const lv0=artLv('emberchip');artUpgrade('emberchip');ok('an upgrade goes through and the scraps stay unlimited',artLv('emberchip')===lv0+1&&meta.arts.scrap===DEV_INF,lv0+' -> '+artLv('emberchip'));
  showOverlay('menu');try{goTab('heroes');}catch(e){}artTab('arts');const ac=$('#archCount');ok('the artifact screen shows infinite scraps',!!ac&&ac.textContent.includes(DEV_INF_S)&&!/99999/.test(ac.textContent),ac&&ac.textContent);
  artModal('emberchip');const up=document.querySelector('#amCard .am-up');ok('the upgrade button says you have infinite scraps',!!up&&!up.disabled&&up.textContent.includes(DEV_INF_S)&&!/99999/.test(up.textContent),up&&up.textContent);artModal(null);artTab('heroes');try{goTab('battle');}catch(e){}}
 renderHome();ok('menu shows infinity',$('#tGems').textContent===DEV_INF_S&&$('#tScraps').textContent===DEV_INF_S&&$('#tCrowns').textContent===DEV_INF_S);
 ok('saved with the account',(lsGet(KM)||{}).dev===true&&!!(lsGet(KM)||{}).devSnap);
 meta.gems-=500;devSync();ok('spending gems refills',meta.gems===DEV_INF);
 buildMap(11);MAP.fresh=true;newGame(1);paused=true;devSync();ok('run gold unlimited',gold===DEV_INF);gold-=1e5;devSync();ok('spending gold refills',gold===DEV_INF);
 {const w0=wave;wave=(meta.cleared||0)+7;ok('5x speed on a wave not beaten yet',speedCap()===5,speedCap());wave=w0;}
 updHud(true);ok('top bar shows infinity',$('#vGold').textContent===DEV_INF_S&&$('#vGems').textContent===DEV_INF_S);
 ok('every tower in the build list',ALL_T.every(k=>TORDER.includes(k)));
 const b=$('#bDev'),q=$('#bQPause').getBoundingClientRect(),r=b.getBoundingClientRect();
 ok('wrench shows in a run',!b.hidden);ok('wrench sits under the pause button',Math.abs(r.left-q.left)<1&&r.top>=q.bottom&&r.top-q.bottom<12,JSON.stringify({q:[q.left,q.bottom],b:[r.left,r.top]}));
 b.click();ok('wrench opens the panel',DEV.open&&!$('#devPanel').hidden,document.querySelectorAll('#devPanel .dv-row').length+' rows');
 ok('no gold or gem buttons any more',!document.querySelector('#devPanel [data-a="g1"],#devPanel [data-a="gm"]'));
 act('bm1');ok('Blood Moon starts',bmActive()&&BM.until===wave+5,BM.until);act('sf1');ok('Starfall starts and ends the Blood Moon',sfActive()&&!bmActive()&&SF.until===wave+6);
 ok('badge counts the waves really left',$('#sfPill span').textContent==='6 waves left',$('#sfPill span').textContent);
 act('bm1');ok('Blood Moon ends the Starfall',bmActive()&&!sfActive());act('bm0');ok('Blood Moon ends',!bmActive()&&BM.until===0);act('sf1');act('sf0');ok('Starfall ends',!sfActive()&&SF.until===0);
 {act('bm1');for(let i=0;i<80;i++)bmAtmos(.05);const sky=document.getElementById('bmSky'),m=sky&&sky.querySelector('.bm-moon');
  ok('the Blood Moon is a blood storm: no moon, storm clouds and blood rain (v337)',!!sky&&(!m||getComputedStyle(m).display==='none')&&sky.querySelectorAll('.bm-cloud').length===2&&!!document.getElementById('bmRain')&&BMRN.drops.length>=160,BMRN.drops.length);
  ok('the blood floor ripples with the rain',String(bmGround().material.fragmentShader).includes('float rn=0.'));
  act('bm0');for(let i=0;i<200;i++)bmAtmos(.05);ok('the storm clears when it ends',BM.k<.01&&!BMRN.snd,BM.k.toFixed(3));}
 /* v342: tap an event's sign for a card of what it does */
 {act('bm1');const bp=document.getElementById('bmPill');ok('the event sign can be tapped',!!bp&&getComputedStyle(bp).pointerEvents!=='none');bp.click();let c=document.getElementById('evCard');
  ok('tapping the Blood Moon sign drops its card under it: effects, waves left, secret scrolls',!!c&&c.classList.contains('evc-bm')&&/secret/.test(c.textContent)&&/waves? left/.test(c.textContent)&&/Secret scrolls of the Blood Moon/.test(c.textContent)&&c.getBoundingClientRect().top>=bp.getBoundingClientRect().bottom);
  bp.click();ok('tapping it again closes it',!document.getElementById('evCard'));bp.click();act('bm0');ok('the card closes when the event ends',!document.getElementById('evCard'));
  act('sf1');const sp=document.getElementById('sfPill');sp.click();c=document.getElementById('evCard');ok('the Starfall card: regeneration, slower foes, more foes',!!c&&c.classList.contains('evc-sf')&&/2.5%/.test(c.textContent)&&/35% slower/.test(c.textContent)&&/15% more/.test(c.textContent));
  c.querySelector('[data-evx]').click();ok('and its x closes it',!document.getElementById('evCard'));act('sf0');}
 act('wm1');ok('merchant comes',WM.on&&WM.st==='in');act('wm0');ok('send away while arriving',WM.leave===true);
 {let t=0;while(WM.on&&t<30){anim(.1,t);t+=.1;}ok('he leaves after arriving',!WM.on,t.toFixed(1)+'s');}
 act('om:horde');ok('omen on the next wave',nextQ.moon&&nextQ.moon.id==='horde');act('om:horde');ok('tap again removes it',!nextQ.moon);
 const n0=enemies.length;act('sb:legendary');const sbE=enemies[enemies.length-1];ok('Scroll Bearer with the picked rarity',enemies.length===n0+1&&sbE.scroll&&sbE.scrollR==='legendary');
 act('gc');ok('Gem Carrier spawns',!!enemies[enemies.length-1].gem);ok('spawn flags reset',!forceScroll&&forceScrollR===null&&!forceGem);
 const l0=lives;act('lv');ok('lives',lives===l0+20);act('ka');update(.05);ok('defeat all foes',aliveN()===0);
 spellCd.meteor=9;act('cd');ok('recharge',spellCd.meteor===0);
 act('all');act('all');ok('cookbook unlock',COMBOS.every(c=>meta.combos&&meta.combos[c.id]));
 act('x');ok('close button',!DEV.open&&$('#devPanel').hidden);
 b.click();showOverlay('pause');devSync();ok('pause menu hides the wrench and the panel',b.hidden&&!DEV.open);showOverlay(null);devSync();ok('back in the run it shows again',!b.hidden);
 /* off: the real account comes back, the run keeps going with fair gold */
 tb.click();devSync();ok('turned off: wrench gone',meta.dev===false&&b.hidden);{const B=JSON.parse(base),A=JSON.parse(pick());ok('account back exactly as before',pick()===base,Object.keys(B).filter(k=>JSON.stringify(B[k])!==JSON.stringify(A[k])).map(k=>k+': '+(B[k]&&typeof B[k]==='object'?Object.keys(Object.assign({},B[k],A[k])).filter(j=>JSON.stringify(B[k][j])!==JSON.stringify((A[k]||{})[j])).map(j=>j+'='+JSON.stringify(B[k][j])+' VS '+JSON.stringify((A[k]||{})[j])).join(', '):JSON.stringify(B[k])+' VS '+JSON.stringify(A[k]))).join(' || '));}
 ok('artifacts, levels and scraps back as they were',Object.keys(meta.arts.own).join()==='coppercoil'&&meta.arts.scrap===7&&artLv('coppercoil')===2&&!artOwned('emberchip'));
 {const w0=wave;wave=(meta.cleared||0)+7;ok('turned off: new waves are capped at 2.5x again',speedCap()===2.5,speedCap());wave=w0;}
 ok('locked things locked again',!meta.spells[k0]&&!owns(h0)&&!unlocked(t0)&&!TORDER.includes(t0));ok('no copy left behind',!meta.devSnap);
 ok('run gold back to a fair amount',gold===startGold(Math.max(1,wave)),gold);renderHome();ok('menu shows real numbers',$('#tGems').textContent===fmt(1234));
}catch(e){ok('exception',false,String(e&&e.stack||e).slice(0,300));}
finally{const m=JSON.parse(m0);for(const k of Object.keys(meta))if(!(k in m))delete meta[k];Object.assign(meta,m);refreshTorder();saveMeta();devSub();devSync();closeLm();renderHome();}
return out;})()
