(function(){
/* Tidy board checks (v314, board version 4): woods in groves, stones in outcrops, a clear tile along the roads, fewer story props, Frostvale's drifts
   against the woods and the edges, and saved runs keeping the board they were made with.
   Run on the dev page: __kk.ev(await (await fetch('/tests/tidy-test.js')).text()) returns [name, ok, detail] rows.
   Puts the arena, account and board back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);
const a0=meta.arena,ar0=JSON.stringify(meta.arenas||{}),gv0=MAP_GV,dOk0=tidyDriftOk;
const isRoad=(c,r)=>c>=0&&r>=0&&c<W&&r<H&&grid[r][c]===1;
const byRoad=(c,r)=>{for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if(isRoad(c+x,r+y))return true;return false;};
const fresh=(a,seed,gv)=>{meta.arena=a;lsSet(KR,null);state='menu';clearWorld();MAP_GV=gv||gv0;buildMap(seed);MAP_GV=gv0;MAP.fresh=true;};
/* 8-connected groups of tiles */
const groups=L=>{const S=new Set(L.map(q=>q[0]+','+q[1])),seen=new Set(),G=[];for(const q of L){const k=q[0]+','+q[1];if(seen.has(k))continue;let n=0;const st=[q];seen.add(k);
  while(st.length){const[c,r]=st.pop();n++;for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){const k2=(c+x)+','+(r+y);if(S.has(k2)&&!seen.has(k2)){seen.add(k2);st.push([c+x,r+y]);}}}G.push(n);}return G;};
/* free tiles touching the road: the build spots a player looks at first */
const roadSpots=()=>{let n=0;for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(grid[r][c]===0&&byRoad(c,r))n++;return n;};
let drifts=null;
try{
  meta.arenas=Object.assign({},meta.arenas,{snow:1,tundra:1});
  tidyDriftOk=function(c,r){const v=dOk0.apply(this,arguments);if(v&&drifts)drifts.push([c,r]);return v;};
  ok('new boards are the current board version (4 or later)',(fresh('plains',314),MAP.gv===gv0&&MAP_GV===gv0&&gv0>=4),MAP.gv);
  for(const a of ['plains','snow','tundra']){const bad=[];let nT=0,nR=0,nL=0,nGr=0,lone=0,sp4=0,sp3=0,nD=0,boards=0;
    for(let s=1;s<=30;s++){const seed=9100+s*6151;
      fresh(a,seed,3);sp3+=roadSpots();
      drifts=[];fresh(a,seed,4);boards++;sp4+=roadSpots();
      nT+=TREES.length;nR+=ROCKS.length;nL+=LORE.length;
      for(const[c,r]of TREES.concat(ROCKS)){if(grid[r][c]!==2)bad.push(s+': tree or rock on an open tile');if(byRoad(c,r))bad.push(s+': tree or rock by the road at '+c+','+r);}
      const g=groups(TREES);nGr+=g.length;lone+=g.filter(n=>n===1).length;
      if(g.length>6)bad.push(s+': '+g.length+' tree groups');
      const gR=groups(ROCKS);if(gR.length>3)bad.push(s+': '+gR.length+' rock groups');if(ROCKS.length>12)bad.push(s+': '+ROCKS.length+' rocks');
      if(LORE.length>4)bad.push(s+': '+LORE.length+' story props');
      if(a==='snow'){nD+=drifts.length;if(drifts.length>10)bad.push(s+': '+drifts.length+' drifts');
        for(const[c,r]of drifts){if(byRoad(c,r))bad.push(s+': drift by the road');if(!(c<=1||c>=W-2||TREES.some(q=>Math.abs(q[0]-c)<=1&&Math.abs(q[1]-r)<=1)))bad.push(s+': drift in the open');}}
      else if(drifts.length)bad.push(s+': drifts outside Frostvale');}
    drifts=null;
    ok(a+': '+boards+' boards keep woods, stones and props tidy',!bad.length,bad.slice(0,4).join('; ')||('trees '+(nT/boards).toFixed(1)+', rocks '+(nR/boards).toFixed(1)+', props '+(nL/boards).toFixed(1)+', groves '+(nGr/boards).toFixed(1)));
    ok(a+': trees stand in groves (at most 1 lone tree in 10)',lone/Math.max(1,nT)<=.1,lone+' lone of '+nT);
    ok(a+': more open build spots along the road than before',sp4>=sp3,(sp4/boards).toFixed(1)+' vs '+(sp3/boards).toFixed(1));
    if(a==='snow')ok('snow: about 10 drifts a board instead of 26',nD/boards>=5&&nD/boards<=10,(nD/boards).toFixed(1));}
  /* the same seed gives the same board */
  fresh('plains',4242);const t1=JSON.stringify([TREES,ROCKS]);fresh('plains',4242);ok('the same seed gives the same tidy board',JSON.stringify([TREES,ROCKS])===t1);
  /* saved runs: a board version 3 run rebuilds the old layout, a version 4 run the new one, and new boards stay version 4 after */
  fresh('plains',4242,3);const old=JSON.stringify([TREES,ROCKS]);ok('the old rule still makes the old board',old!==t1);
  fresh('plains',4242);newGame(1);paused=true;const R1=serializeRun();ok('the run saves the current board version',R1.gv===gv0,R1.gv);
  const R3=JSON.parse(JSON.stringify(R1));R3.gv=3;R3.cut=[];R3.rocks=[];loadRun(R3);ok('a run saved before v314 gets its old board back',JSON.stringify([TREES,ROCKS])===old&&MAP.gv===3);
  ok('after loading it, new boards are the current version again',MAP_GV===gv0);
  loadRun(JSON.parse(JSON.stringify(R1)));ok('a v314 run gets its tidy board back',JSON.stringify([TREES,ROCKS])===t1&&MAP.gv===gv0);gameOver();
  /* v315 natural groves: trees off their tile centres, never stacked, saplings ride with their tree, stones still found and broken */
  {let off=0,n=0,close=0,kids=0,stray=0;const pos=[];
    for(let s=1;s<=10;s++){fresh(s%2?'plains':'tundra',300+s*911);pos.length=0;
      for(const k in TREEM){const m=TREEM[k],[c,r]=k.split(',').map(Number),p=tw(c,r);const dx=m.position.x-p.x,dz=m.position.z-p.z;off+=Math.hypot(dx,dz);n++;if(Math.abs(dx)>.5*TS||Math.abs(dz)>.5*TS)stray++;
        m.updateMatrixWorld(true);pos.push([m.position.x,m.position.z,m.scale.x]);m.children.forEach(ch=>{if(ch.isGroup){kids++;const w=new THREE.Vector3();ch.getWorldPosition(w);pos.push([w.x,w.z,ch.scale.x*m.scale.x]);}});}
      for(let i=0;i<pos.length;i++)for(let j=i+1;j<pos.length;j++){const A=pos[i],B=pos[j];if(Math.hypot(A[0]-B[0],A[1]-B[1])<.14*(A[2]+B[2]))close++;}}
    ok('trees stand off the middle of their tiles, inside them',off/n>.12&&!stray,'mean offset '+(off/n).toFixed(2)+', outside '+stray);
    ok('no two trees stand on top of each other',!close,close);
    ok('some grove trees have a sapling',kids>=10,kids);
    fresh('plains',4242);const rk=ROCKS.length,ix=Object.keys(ROCKM).length,q=ROCKS[0];ok('every stone is found for breaking',rk>0&&ix===rk,ix+' of '+rk);
    if(q){const L=ROCKM[q[0]+','+q[1]].slice();breakRock(q[0],q[1],true);ok('breaking a stone takes its pieces away',L.length===2&&L.every(m=>!m.parent)&&grid[q[1]][q[0]]===0);}
    fresh('plains',4242);const k0=Object.keys(TREEM).find(k=>TREEM[k].children.some(ch=>ch.isGroup));if(k0){const m=TREEM[k0],[c,r]=k0.split(',').map(Number);cutTree(c,r,true);ok('cutting a tree takes its sapling too',!m.parent&&!TREEM[k0]);}}
  /* cost, against the old rule on the same seeds (a hidden page runs slowly, so no fixed limit) */
  {const tm=gv=>{const t0=performance.now();for(let s=0;s<8;s++)fresh('plains',700+s,gv);return (performance.now()-t0)/8;};tm(4);const m3=Math.min(tm(3),tm(3)),m4=Math.min(tm(4),tm(4));
    ok('a tidy board builds as fast as an old one',m4<=m3*1.2+3,m4.toFixed(1)+' vs '+m3.toFixed(1)+' ms');}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{tidyDriftOk=dOk0;MAP_GV=gv0;meta.arena=a0;meta.arenas=JSON.parse(ar0);saveMeta();placing=null;lsSet(KR,null);state='menu';clearWorld();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
