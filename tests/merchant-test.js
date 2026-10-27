(function(){
/* Wandering merchant checks. Load on the dev page: __kk.ev(await (await fetch('/tests/merchant-test.js')).text())
   __wm.start(seed): new run on a fixed map (paused, frames stepped by hand, so it works with the Browser pane hidden)
   __wm.arrive(): forces a visit; __wm.step(sec): steps his animation; __wm.checks(): logic checks, returns a list of [name, ok, detail]
   await __wm.sheet(name,[t...],{zoom,focus:'wagon'|'stall',cols}) renders moments of a visit into one image and POSTs it to
   python _backup/shot_srv.py 8766 (written to _backup/shots/<name>.jpg). Times are seconds since the previous call. */
window.__wm={
 T:0,
 start(seed){buildMap(seed||7);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;meta.scrAuto=false;this.T=0;return{state,gates:MAP.gates.map(g=>g.side)};},
 arrive(bm){WM.bmForce=!!bm;const ok=wmArrive(true);return ok?{c:WM.c,r:WM.r,dir:WM.dir,L:+WM.drv.L.toFixed(1),stock:WM.stock.map(q=>q.k+':'+SPELLS_S[q.k].r+':'+q.p)}:null;},
 step(sec,dt){dt=dt||.033;const n=Math.round(sec/dt);for(let i=0;i<n;i++){this.T+=dt;anim(dt,this.T);updFx(dt);}},
 until(st,max){let t=0;while(WM.st!==st&&t<(max||40)){this.step(.1);t+=.1;}return +t.toFixed(1);},
 focus(f){if(f==='wagon'&&WM.wagon&&WM.root)return WM.wagon.g.position;return{x:WM.cx,z:WM.cz+.2};},
 async sheet(name,times,o){o=o||{};const urls=[],sts=[];for(const t of times){this.step(t);if(o.pre)o.pre();const f=this.focus(o.focus);__kk.camXZ(f.x+(o.dx||0),f.z+(o.dz||0),o.zoom||.25);scene.updateMatrixWorld(true);urls.push(__kk.snap());sts.push(WM.st);}
  const imgs=await Promise.all(urls.map(u=>new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.src=u;})));const W0=imgs[0].naturalWidth,H0=imgs[0].naturalHeight,cw=Math.round(W0*(o.crop||.6)),ch=Math.round(H0*(o.crop||.6)*.62),cols=o.cols||3,rows=Math.ceil(imgs.length/cols);
  const cv=document.createElement('canvas');cv.width=cw*cols;cv.height=ch*rows;const g=cv.getContext('2d');let acc=0;
  imgs.forEach((im,i)=>{acc+=times[i];const dx=(i%cols)*cw,dy=Math.floor(i/cols)*ch;g.drawImage(im,(W0-cw)/2,(H0-ch)/2,cw,ch,dx,dy,cw,ch);g.strokeStyle='#000';g.lineWidth=2;g.strokeRect(dx,dy,cw,ch);g.fillStyle='#000a';g.fillRect(dx,dy,170,20);g.fillStyle='#fff';g.font='13px sans-serif';g.fillText(name+' +'+acc.toFixed(1)+'s '+sts[i],dx+5,dy+14);});
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.9)});return await r.text();},
 tiles(v){let n=0;for(let r=WM.r;r<WM.r+3;r++)for(let c=WM.c;c<WM.c+3;c++)if(grid[r][c]===v)n++;return n;},
 checks(){const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':d]);const g0=meta.gems,sp0=JSON.stringify(meta.spells);
  try{
   this.start(11);ok('fresh run: no merchant',!WM.on&&!WM.root);
   const a=this.arrive();ok('arrives on a fixed map',!!a,JSON.stringify(a));if(!a)return out;
   ok('4 scrolls in stock',WM.stock.length===4,WM.stock.length);ok('no unique / special-only scrolls',WM.stock.every(q=>SPELLS_S[q.k].r!=='unique'&&q.k!=='singularity'&&q.k!=='pulsar'));
   ok('stock sorted by rarity',WM.stock.every((q,i)=>!i||RB[SPELLS_S[q.k].r].i>=RB[SPELLS_S[WM.stock[i-1].k].r].i));
   ok('prices follow rarity',WM.stock.every(q=>q.p===WM_PRICE[SPELLS_S[q.k].r]));
   ok('patch tiles blocked while he is there',this.tiles(2)===9,this.tiles(2));
   const tIn=this.until('setup');ok('drives to his patch',WM.st==='setup',tIn+'s');
   const pw=wmParkW();ok('parks on the patch',Math.hypot(WM.wagon.g.position.x-pw.x,WM.wagon.g.position.z-pw.z)<.05);
   const tSet=this.until('open');ok('sets up the stall',WM.st==='open',tSet+'s');
   ok('tap on his tile opens the shop',(()=>{const p=tw(WM.c+1,WM.r+1);wmPick(new THREE.Raycaster(new THREE.Vector3(p.x,10,p.z),new THREE.Vector3(0,-1,0)),p);return wmShopOpen();})());
   ok('shop shows 4 cards',document.querySelectorAll('#lmModal .wm-card').length===4);
   /* buy: not enough gems, then enough (two taps) */
   meta.gems=0;wmOpen();let b=document.querySelector('#lmModal [data-buy="0"]');ok('buy disabled without gems',b&&b.disabled);
   const k0=WM.stock[0].k;delete meta.spells[k0];meta.gems=WM.stock[0].p+5;wmOpen();b=document.querySelector('#lmModal [data-buy="0"]');b.click();
   ok('first tap only arms',!WM.stock[0].s&&/Tap again/.test(document.querySelector('#lmModal [data-buy="0"]').textContent));
   document.querySelector('#lmModal [data-buy="0"]').click();ok('second tap buys',WM.stock[0].s===1&&!!meta.spells[k0]&&meta.gems===5,meta.gems);
   ok('sold card shown',document.querySelector('#lmModal .wm-card').classList.contains('sold'));
   /* an owned scroll adds a level instead of turning into scraps */
   const k1=WM.stock[1].k;meta.spells[k1]={lvl:2,hero:null};const sc0=meta.scraps;meta.gems=1e6;ok('owned copy direct buy',wmBuy(1)&&meta.spells[k1].lvl===3&&meta.scraps===sc0,meta.spells[k1].lvl);
   closeLm();
   /* save + load keeps him, his stock and what was sold */
   const sv=serializeRun();ok('saved with the run',sv.wm&&Array.isArray(sv.wm.stock)&&sv.wm.stock.length===4,JSON.stringify(sv.wm));
   loadRun(JSON.parse(JSON.stringify(sv)));paused=true;ok('restored after load',WM.on&&WM.st==='open'&&WM.stock.length===4&&WM.stock[0].s===1&&WM.stock[1].s===1&&WM.c===sv.wm.c&&WM.r===sv.wm.r);
   ok('tiles blocked after load',this.tiles(2)===9);
   const old=JSON.parse(JSON.stringify(sv));delete old.wm;loadRun(old);paused=true;ok('old save without merchant loads',state==='playing'&&!WM.on&&WM.next===WM_FROM&&this.tiles(2)===0);
   loadRun(JSON.parse(JSON.stringify(sv)));paused=true;
   /* v336: stays 2 minutes of real time once open; cleared waves no longer count */
   for(let i=1;i<=6;i++)lmWaveClear(wave+i);ok('cleared waves do not send him away',WM.st==='open',WM.st);
   ok('a second merchant cannot come while he is here',!wmArrive(true)&&WM.on&&WM.c===sv.wm.c&&WM.r===sv.wm.r);
   {const l0=WM.left;this.step(3);ok('his clock runs on real time: 2 minutes',WM_STAY_S===120&&Math.abs(l0-WM.left-3)<.2,l0.toFixed(1)+' -> '+WM.left.toFixed(1));}
   ok('the shop shows the time left',(wmOpen(),/He packs up in \d:\d\d/.test(document.querySelector('#lmModal .wm-foot').textContent)));
   WM.left=.5;this.step(1);ok('the time runs out while the shop is open: he waits',WM.st==='open');closeLm();this.step(.2);ok('and packs up once it is closed',WM.st==='pack'||WM.st==='out');
   ok('next visit pushed back',WM.next===wave+WM_GAP,WM.next);
   this.until('out',5);ok('drives off',WM.st==='out'&&this.tiles(2)===0&&!!WM.drv);
   const tOut=this.until('',30);ok('gone after driving out',!WM.on&&!WM.root,tOut+'s');
   ok('save after he left has no stock',!serializeRun().wm.stock);
   /* v336: a sped-up game (waves clearing while he drives in) no longer sends him away before he sets up */
   this.start(11);this.arrive();for(let i=1;i<=8;i++)lmWaveClear(wave+i);this.until('open');this.step(1);ok('fast waves while he drives in: he still sets up and stays open',WM.st==='open'&&WM.left>110,WM.st+' '+(WM.left||0).toFixed(0));
   {const sv2=serializeRun();ok('his time left is saved with the run',sv2.wm.left>0&&sv2.wm.left<=120,sv2.wm.left);WM.left=40;const sv3=JSON.parse(JSON.stringify(serializeRun()));loadRun(sv3);paused=true;ok('and comes back after a load',WM.on&&Math.abs(WM.left-40)<1,WM.left);}
   /* sold out: leaves once the shop is closed */
   this.start(11);this.arrive();this.until('open');meta.gems=1e7;WM.stock.forEach((q,i)=>wmBuy(i));wmOpen();this.step(3);ok('waits while the shop is open',WM.st==='open');
   closeLm();this.step(2.5);ok('sold out: packs up',WM.st==='pack'||WM.st==='out');
   /* boxed in: vanishes */
   this.start(11);this.arrive();this.until('open');const held=[];for(let r=WM.r-1;r<=WM.r+3;r++)for(let c=WM.c-1;c<=WM.c+3;c++)if(r>=0&&c>=0&&r<H&&c<W&&!wmIn(c,r)&&(grid[r][c]===0||grid[r][c]===1)){held.push([c,r,grid[r][c]]);grid[r][c]=2;}
   wmLeave();this.until('out',5);ok('boxed in: no route',WM.st==='out'&&!WM.drv);this.step(1);ok('boxed in: vanishes',!WM.root&&!WM.on);held.forEach(([c,r,v])=>grid[r][c]=v);
   /* arrival odds: a flat 1% after each cleared wave from wave 3 (0.5% from v284 to v302) (a little lower measured: no rolls while he is there or just left) */
   {const real=wmArrive;let visits=0,early=0,n=2000;wmArrive=function(){WM.on=true;WM.st='open';WM.stay=WM_STAY;visits++;if(wave<WM_FROM)early++;return true;};
    for(let k=0;k<n;k++){WM.on=false;WM.st='';WM.next=WM_FROM;WM.miss=0;for(let w=1;w<=100;w++){wave=w;wmWave(w);if(WM.on){WM.on=false;WM.st='';WM.next=w+WM_GAP;}}}
    wmArrive=real;const rate=visits/(n*98);ok('about 1% per cleared wave',rate>.0078&&rate<.0112&&!early,(rate*100).toFixed(3)+'% per wave');}
   /* stock rolls: rarities across many rolls */
   {const c={};for(let i=0;i<500;i++)wmStock().forEach(q=>{const r=SPELLS_S[q.k].r;c[r]=(c[r]||0)+1;});ok('stock rarity mix',c.common>c.rare&&c.rare>(c.legendary||0),JSON.stringify(c));}
   /* v329 the black market: one visit in four, two artifacts rolled on the drop table, a fortune in gems */
   {const ar0=JSON.stringify(meta.arts);try{
    ok('black market: 25% of visits, Simon prices 1000/2000/4000/8000/15000/30000',WM_BM_CH===.25&&ART_RAR.map(r=>WM_BM_PRICE[r]).join()==='1000,2000,4000,8000,15000,30000');
    ok('the rarity table is the one of the next 100th wave',wmBmRow(0)===ART_DROP[0]&&wmBmRow(99)===ART_DROP[0]&&wmBmRow(100)===ART_DROP[1]&&wmBmRow(250)===ART_DROP[2]&&wmBmRow(5000)===ART_DROP[4]);
    {const c={};let n=0;for(let i=0;i<3000;i++)wmBmStock(50).forEach(q=>{const r=ART_BY[q.id].r;c[r]=(c[r]||0)+1;n++;});const sh=r=>(c[r]||0)/n;
     ok('rarities follow the wave 100 drop chances (30/30/20/12/6/2)',Math.abs(sh('common')-.3)<.03&&Math.abs(sh('rare')-.2)<.03&&Math.abs(sh('mythic')-.02)<.012,JSON.stringify(c));}
    {const keep={};ART_RAR.forEach(r=>keep[ARTS.find(a=>a.r===r).id]=1);meta.arts.own={};ARTS.forEach(a=>{if(!keep[a.id])meta.arts.own[a.id]=1;});let bad=0;
     for(let i=0;i<300;i++){const st=wmBmStock(150),seen={};st.forEach(q=>{const r=ART_BY[q.id].r;if(!seen[r]&&!keep[q.id])bad++;seen[r]=1;});if(st.length!==2||st[0].id===st[1].id)bad++;}
     ok('two different artifacts, one you do not have before one you do',!bad,bad+' bad');}
    {let n=0,b=0;for(let k=0;k<300;k++){wmDrop(true);WM.bmForce=null;if(wmArrive(true)){n++;if(WM.bm)b++;}}wmDrop(true);const r=b/Math.max(1,n);ok('about one visit in four brings it',n>250&&r>.17&&r<.33,b+'/'+n);}
    this.start(11);this.arrive(true);this.until('open');
    ok('a forced visit opens it: two artifacts at their price, the crate on his stall',!!WM.bm&&WM.bm.length===2&&WM.bm.every(q=>q.p===WM_BM_PRICE[ART_BY[q.id].r])&&!!WM.bmProp&&WM.bmProp.q.parent===WM.stall.g);
    wmOpen();ok('the shop shows the black market under the scrolls',document.querySelectorAll('#lmModal .wm-bm .wm-card').length===2&&document.querySelectorAll('#lmModal .wm-card').length===6&&/Black Market/.test(document.querySelector('#lmModal').textContent));
    meta.arts.own={};meta.arts.pend=[];meta.gems=0;wmOpen();ok('without the gems it cannot be bought',document.querySelector('#lmModal [data-bm="0"]').disabled&&!wmBmBuy(0));
    const id0=WM.bm[0].id,p0=WM.bm[0].p;meta.gems=p0+7;wmOpen();document.querySelector('#lmModal [data-bm="0"]').click();ok('first tap only arms',!WM.bm[0].s&&/Tap again/.test(document.querySelector('#lmModal [data-bm="0"]').textContent));
    document.querySelector('#lmModal [data-bm="0"]').click();ok('second tap buys: the gems go, the artifact is yours',WM.bm[0].s===1&&meta.gems===7&&artOwned(id0),meta.gems);
    {const ov=document.getElementById('artOffer');ok('the reveal card says it was bought at the black market',!!ov&&/Bought at the black market/.test(ov.textContent));if(ov)ov.querySelector('[data-aok]').click();}
    WM.stock.forEach(q=>q.s=1);ok('scrolls sold out, black market not: he stays',!wmSoldOut());
    const sv=serializeRun();ok('it is saved with the run',!!sv.wm.bm&&sv.wm.bm.length===2&&sv.wm.bm[0][2]===1);
    closeLm();loadRun(JSON.parse(JSON.stringify(sv)));paused=true;ok('and comes back after a load',WM.on&&!!WM.bm&&WM.bm.length===2&&WM.bm[0].s===1&&!WM.bm[1].s&&!!WM.bmProp&&!WM.leave);
    const id1=WM.bm[1].id;meta.arts.own[id1]=1;const sc0=meta.arts.scrap||0;meta.gems=1e6;ok('one you already have turns into scraps',wmBmBuy(1)&&meta.arts.scrap===sc0+(ART_SCRAP[ART_BY[id1].r]||1));
    {const o=document.getElementById('artOffer');if(o)o.remove();}ok('everything sold: he packs up',wmSoldOut()&&WM.leave);
    this.start(11);this.arrive(false);ok('a visit without it has no black market',!WM.bm&&!WM.bmProp&&!serializeRun().wm.bm);
   }finally{{const o=document.getElementById('artOffer');if(o)o.remove();}meta.arts=JSON.parse(ar0);ART_V++;}}
   /* new runs and new maps drop him */
   this.start(11);this.arrive();newGame(1);paused=true;ok('new run drops him',!WM.on&&!WM.root);
  }catch(e){ok('exception',false,String(e&&e.stack||e).slice(0,300));}
  finally{meta.gems=g0;meta.spells=JSON.parse(sp0);saveMeta();closeLm();}
  return out;}};
return 'merchant test loaded';})()
