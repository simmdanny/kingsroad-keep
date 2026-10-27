(function(){
/* Crown tiers IV and V (v297): every building has five crown tiers in the Armory, IV and V change its stats and its look.
   Run on the dev page: __kk.ev(await (await fetch('/tests/crown-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const withE=(k,E,f)=>{const e0=meta.enh;meta.enh=Object.assign({},e0||{},{[k]:E});try{return f();}finally{meta.enh=e0;}};
const st=(k,E,P)=>withE(k,E,()=>tStats({type:k,parts:Object.assign({height:0,mass:0,special:0},P||{}),c:0,r:0,x:0,z:0},null));
const near=(a,b,eps)=>Math.abs(a-b)<=(eps||1e-6)*Math.max(1,Math.abs(b));
try{
  /* the Armory list */
  ok('all 28 buildings have five crown tiers',ALL_T.length===28&&ALL_T.every(k=>ENH[k]&&ENH[k].length===5&&ENH[k].every(e=>e[0]&&e[1])),ALL_T.filter(k=>!ENH[k]||ENH[k].length!==5).join(','));
  {const names=ALL_T.flatMap(k=>ENH[k].slice(3).map(e=>e[0]));ok('the 56 new tier names are all different',new Set(names).size===56,names.length);}
  ok('tiers IV and V cost x6.5 and x10 the first tier, each dearer than the last',ALL_T.every(k=>{const c=[0,1,2,3,4].map(l=>enhCost(k,l));return c[3]===Math.round(c[0]*6.5)&&c[4]===Math.round(c[0]*10)&&c.every((v,i)=>!i||v>c[i-1]);}),ALL_T.map(k=>enhCost(k,3)+'/'+enhCost(k,4)).slice(0,3).join(' '));
  /* stats: tier IV and V change every building */
  const same=[],bad=[];
  for(const k of ALL_T){const a=JSON.stringify(st(k,3)),b=JSON.stringify(st(k,4)),c=JSON.stringify(st(k,5));if(a===b||b===c)same.push(k);}
  const sup=k=>{const e0=meta.enh;return{b:[3,4,5].map(E=>{meta.enh=Object.assign({},e0||{},{[k]:E});const fake={type:k,parts:{height:0,mass:0,special:0},x:0,z:0};const o={type:'archer',parts:{height:0,mass:0,special:0},x:0,z:0};
    const keep=towers.slice();towers.length=0;towers.push(fake,o);const s={rate:1,dmg:1};supportBuff(o,s);const R=auraR(fake);towers.length=0;towers.push(...keep);meta.enh=e0;return{rate:s.rate,dmg:s.dmg,R};})};};
  for(const k of['bell','drum','windmill']){const v=sup(k).b;if(!(v[0].rate!==v[2].rate||v[0].dmg!==v[2].dmg||v[0].R!==v[1].R))same.push(k+'(aura)');}
  ok('tiers IV and V change the stats of every building',same.filter(k=>!['bell','drum','windmill'].includes(k)||k.includes('aura')).length===0,same.join(','));
  /* the numbers, building by building */
  const R=(k,f)=>{const a=st(k,3),b=st(k,4),c=st(k,5);return f(a,b,c);};
  const chk=[
    ['archer: +20% damage, then +1 arrow and +10% speed',R('archer',(a,b,c)=>near(b.dmg,a.dmg*1.2)&&c.multi===a.multi+1&&near(c.rate,a.rate*1.1))],
    ['cannon: +20% damage, then +25% blast and +15% rate',R('cannon',(a,b,c)=>near(b.dmg,a.dmg*1.2)&&near(c.splash,a.splash*1.25)&&near(c.rate,a.rate*1.15))],
    ['mage: +15% damage and +10% range, then +1 chain and +15% damage',R('mage',(a,b,c)=>near(b.dmg,a.dmg*1.15)&&near(b.range,Math.min(8,a.range*1.1))&&c.chain===a.chain+1&&near(c.dmg,a.dmg*1.15*1.15))],
    ['frost: +15% damage and +6% slow (cap 70%), then +10% shatter and +10% range',R('frost',(a,b,c)=>near(b.dmg,a.dmg*1.15)&&near(b.slow,Math.min(.7,a.slow+.06))&&near(c.shatter,a.shatter+.1)&&near(c.range,Math.min(8,a.range*1.1)))],
    ['ballista: +20% damage, then +1 pierce and +10% crit',R('ballista',(a,b,c)=>near(b.dmg,a.dmg*1.2)&&c.pierce===a.pierce+1&&near(c.crit,Math.min(.85,a.crit+.1)))],
    ['mine: +20% income, then +25% income and +1% interest',R('mine',(a,b,c)=>near(b.income,a.income*1.2)&&near(c.income,a.income*1.5)&&near(c.interest,a.interest+.01))],
    ['lantern: +20% burn, then three bolts',R('lantern',(a,b,c)=>near(b.burn,a.burn*1.2)&&a.twin===2&&c.twin===3)],
    ['snare: +30% damage, then three targets',R('snare',(a,b,c)=>near(b.dmg,a.dmg*1.3)&&c.targets===3)],
    ['storm: +20% damage, then +2 chain',R('storm',(a,b,c)=>near(b.dmg,a.dmg*1.2)&&c.chain===a.chain+2)],
    ['obelisk: +20% damage, then +25% focus and 30% faster',R('obelisk',(a,b,c)=>near(b.dmg,a.dmg*1.2)&&near(c.rampMax,a.rampMax*1.25)&&near(c.rampT,a.rampT/1.3))],
    ['ranger: a fourth target at tier V',R('ranger',(a,b,c)=>a.targets===3&&c.targets===4)],
    ['graveyard: four hands, then spirits +40%',R('graveyard',(a,b,c)=>b.hands===a.hands+1&&near(c.spirit,b.spirit*1.4))],
    ['spear: +25% damage, then +2 pierce',R('spear',(a,b,c)=>near(b.dmg,a.dmg*1.25)&&c.pierce===a.pierce+2)],
    ['altar: one more sacrifice, then +20% drained',R('altar',(a,b,c)=>b.targets===a.targets+1&&near(c.pct,a.pct*1.2))],
    ['mirror: +20% damage, then six bounces',R('mirror',(a,b,c)=>near(b.dmg,a.dmg*1.2)&&a.bounces===4&&c.bounces===6)],
    ['plague: +30% plague, then three infected and a wider leap',R('plague',(a,b,c)=>near(b.dps,a.dps*1.3)&&c.targets===3&&near(c.leap,a.leap*1.2))],
    ['grove: +30% damage, then +2 roots',R('grove',(a,b,c)=>near(b.dmg,a.dmg*1.3)&&c.targets===a.targets+2)],
    ['shrine: +25% damage, then +40% judgement and a wider one',R('shrine',(a,b,c)=>near(b.dmg,a.dmg*1.25)&&c.vuln===.4&&near(c.judgeR,a.judgeR*1.2))],
    ['void gate: +25% damage, then pulls three foes',R('void',(a,b,c)=>near(b.dmg,a.dmg*1.25)&&c.targets===3)],
    ['flame shrine: +20% damage and +10% range, then +50% burn',R('flame',(a,b,c)=>near(b.dmg,a.dmg*1.2)&&near(c.burn,b.burn*1.5))],
    ['windmill: +25% income, then a +20% bread aura',R('windmill',(a,b,c)=>near(b.income,a.income*1.25)&&a.aura===15&&c.aura===20)],
    ['merchant: +30% income, then a +50% kill bonus',R('merchant',(a,b,c)=>near(b.income,a.income*1.3)&&a.bounty===40&&c.bounty===50)]];
  for(const[n,v]of chk)ok(n,v);
  {const b=sup('bell').b,d=sup('drum').b,w=sup('windmill').b;
    ok('bell: +10% aura range at IV, +30% speed at V',near(b[1].R,b[0].R*1.1)&&near(b[0].rate,1.25)&&near(b[2].rate,1.3),b.map(x=>x.rate.toFixed(2)+'@'+x.R.toFixed(2)).join(' '));
    ok('drum and windmill auras rise to +25% and +20% damage at V',near(d[0].dmg,1.2)&&near(d[2].dmg,1.25)&&near(w[0].dmg,1.15)&&near(w[2].dmg,1.2),d.map(x=>x.dmg.toFixed(2)).join('/')+' '+w.map(x=>x.dmg.toFixed(2)).join('/'));}
  {const e0=meta.enh;const run=E=>{meta.enh=Object.assign({},e0||{},{merchant:E});const keep=towers.slice();towers.length=0;towers.push({type:'merchant',parts:{height:0,mass:0,special:0},x:0,z:0});const m=merchMul({x:0,z:0});towers.length=0;towers.push(...keep);meta.enh=e0;return m;};
    ok('the merchant kill bonus pays +50% gold at tier V',near(run(3),1.4)&&near(run(5),1.5),run(3)+' / '+run(5));}
  ok('tier V never pushes a range past the cap of 8 (the windmill and merchant auras were uncapped before)',ALL_T.every(k=>{const a=st(k,3,{height:40}),c=st(k,5,{height:40});return !(c.range>Math.max(8,a.range)+1e-9);}));
  /* the looks */
  {const rows=[],bad=[];for(const k of ALL_T){const n=[3,4,5].map(E=>withE(k,E,()=>{const m=towerModel(k,{},null);let c=0,cr=0,nan=false;m.g.traverse(o=>{if(o.isMesh){c++;if(o.userData.cwCrown)cr++;const p=o.position;if(!isFinite(p.x+p.y+p.z))nan=true;}});
        m.g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(m.g);return{c,cr,nan,w:Math.max(-bb.min.x,bb.max.x,-bb.min.z,bb.max.z),h:bb.max.y};}));
      if(!(n[0].c<n[1].c&&n[1].c<n[2].c&&n[0].cr===0&&n[1].cr===0&&n[2].cr===1&&!n.some(q=>q.nan)&&n[2].w<.75&&n[2].h<2.6))bad.push(k+':'+n.map(q=>q.c+'/'+q.cr).join(',')+' w'+n[2].w.toFixed(2)+' h'+n[2].h.toFixed(2));rows.push(k+' +'+(n[1].c-n[0].c)+'/+'+(n[2].c-n[1].c));}
    ok('every building gains new pieces at IV and again at V, and a crown at V (none before)',!bad.length,bad.join(' ')||rows.slice(0,6).join(' '));}
  {const kinds=new Set();for(const k of ALL_T)withE(k,5,()=>{const m=towerModel(k,{},null);m.g.traverse(o=>{if(o.userData&&o.userData.cwCrown)kinds.add(o.userData.cwCrown);});});
    ok('crowns of gold, ghost, blood, void, ice, fire and plague',['gold','ghost','blood','void','ice','fire','plague'].every(q=>kinds.has(q)),[...kinds].join(','));}
  {let ok2=true;for(const k of ALL_T)withE(k,5,()=>{const m=towerModel(k,{height:14,mass:14,special:14},null);m.g.updateMatrixWorld(true);let top=0,cy=null;m.g.traverse(o=>{if(!o.isMesh)return;const b=new THREE.Box3().setFromObject(o);if(o.userData.cwCrown)cy=b.max.y;else if(o.castShadow)top=Math.max(top,b.max.y);});if(cy==null||cy<top*.55)ok2=false;});
    ok('with fully upgraded parts the crown still sits high on the building',ok2);}
  ok('the crown is one merged mesh per kind (one draw call)',(()=>{const a=cwCrown(new THREE.Group(),0,0,0,1),b=cwCrown(new THREE.Group(),0,0,0,1,'ice');return a.geometry===cwCrownGeo('gold')&&a.material===cwCrownMat('gold')&&b.geometry!==a.geometry;})());
  /* the Armory */
  {lsSet(KR,null);state='menu';meta.unl=Object.assign({},meta.unl,{storm:true});meta.enh=Object.assign({},meta.enh,{archer:3,storm:5});meta.crowns=1e6;renderArmory();
    const L=$('#shopList'),arch=L.querySelector('[data-enh="archer"]'),item=arch&&arch.closest('.arm-item'),pips=item?item.querySelectorAll('.arm-pips i'):[];
    ok('at tier III the Armory offers tier IV with its price and name',!!arch&&arch.textContent.includes(fmt(enhCost('archer',3)))&&item.textContent.includes('Next: Royal Fletchers'),arch?arch.textContent:'no button');
    ok('five pips, the last two royal',pips.length===5&&[...pips].filter(i=>i.classList.contains('roy')).length===2&&[...pips].filter(i=>i.classList.contains('on')).length===3,pips.length);
    const c0=meta.crowns;arch.click();ok('buying tier IV spends the crowns and raises the tier',enhOf('archer')===4&&meta.crowns===c0-enhCost('archer',3),enhOf('archer')+' / '+(c0-meta.crowns));
    renderArmory();const st5=[...$('#shopList').querySelectorAll('.arm-item')].find(e=>e.textContent.includes(TD.storm.name));ok('at tier V the building is fully enhanced',!!st5&&st5.textContent.includes('Fully enhanced')&&!st5.querySelector('[data-enh]'));
    const a2=$('#shopList').querySelector('[data-enh="archer"]');a2.click();ok('tier V can be bought after IV',enhOf('archer')===5);
    const c1=meta.crowns;$('#shopList').dispatchEvent(new MouseEvent('click',{bubbles:true}));ok('nothing past tier V',enhOf('archer')===5&&meta.crowns===c1);}
  {const m=migrateMeta({best:300,enh:{archer:5,cannon:4}});ok('tiers IV and V are kept in the save',m.enh.archer===5&&m.enh.cannon===4,JSON.stringify(m.enh));}
  /* in a run */
  {lsSet(KR,null);state='menu';clearWorld();buildMap(777);MAP.fresh=true;meta.enh=Object.assign({},meta.enh,{archer:5,frost:5,flame:5});newGame(1);paused=true;
    let placed=[];for(let r=0;r<H&&placed.length<3;r++)for(let c=0;c<W&&placed.length<3;c++){if(grid[r][c]!==0)continue;const k=['archer','frost','flame'][placed.length];if(!unlocked(k)){meta.unl=Object.assign({},meta.unl,{[k]:true});}gold+=buildCost(k);placeTower(k,c,r);placed.push(k);}
    let crowns=0;for(const t of towers)t.g.traverse(o=>{if(o.userData&&o.userData.cwCrown)crowns++;});ok('built in a run, tier V buildings wear their crowns',crowns===3,crowns);
    spawnEnemy({type:'soldier',v:0},60);let err='';try{for(let i=0;i<60;i++){update(.05);updFx(.05);}renderer.render(scene,camera);}catch(e){err=e.message;}ok('and they fight without errors',!err,err);}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{state='menu';paused=false;for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);makeThumbs();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
