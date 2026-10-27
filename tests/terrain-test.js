(function(){
/* Terrain checks (v308): generation rules on many boards in every land, the effects, saves, the tooltips and the developer toggle.
   Run on the dev page: __kk.ev(await (await fetch('/tests/terrain-test.js')).text()) returns [name, ok, detail] rows.
   Puts the arena, account and board back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);
const a0=meta.arena,ar0=JSON.stringify(meta.arenas||{}),dev0=meta.dev,off0=meta.terOff,g0=meta.gems;
const key=q=>q[0]+','+q[1],isRoad=(c,r)=>c>=0&&r>=0&&c<W&&r<H&&grid[r][c]===1,n4=[[1,0],[-1,0],[0,1],[0,-1]];
const fresh=(a,seed)=>{meta.arena=a;lsSet(KR,null);state='menu';clearWorld();buildMap(seed);MAP.fresh=true;};
try{
  meta.arenas=Object.assign({},meta.arenas,{snow:1,tundra:1});meta.terOff=false;
  /* ---- generation ---- */
  for(const a of ['plains','snow','tundra']){const bad=[];let nH=0,nU=0,nM=0,boards=0,gateMin=99;
    for(let s=1;s<=40;s++){fresh(a,5000+s*7717);boards++;const T=MAP.ter;if(!T){bad.push(s+': no terrain');continue;}
      nH+=T.hi.length;nU+=T.ruins.length;nM+=T.marsh.length;
      if(T.hi.length<2||T.hi.length>4)bad.push(s+': '+T.hi.length+' hills');
      if(T.ruins.length>4)bad.push(s+': '+T.ruins.length+' ruins');
      if(a!=='tundra'?(T.marsh.length<1||T.marsh.length>3||T.marsh.some(p=>p.length<3||p.length>5)):T.marsh.length>0)bad.push(s+': marsh '+T.marsh.map(p=>p.length));
      for(const[c,r]of T.hi){if(grid[r][c]!==0)bad.push(s+': hill not buildable');if(!n4.some(([x,y])=>isRoad(c+x,r+y)))bad.push(s+': hill off the road');}
      const gz=new Set();MAP.routes.forEach(rt=>rt.slice(0,6).forEach(q=>gz.add(key(q))));
      for(const q of T.ruins){const[c,r]=q;if(grid[r][c]!==2)bad.push(s+': ruin buildable');if(!n4.some(([x,y])=>isRoad(c+x,r+y)))bad.push(s+': ruin off the road');
        if([[0,0]].concat(n4).some(([x,y])=>gz.has((c+x)+','+(r+y))))bad.push(s+': ruin by a gate');
        if(T.ruins.some(o=>o!==q&&Math.abs(o[0]-c)<=1&&Math.abs(o[1]-r)<=1))bad.push(s+': ruins touch');}
      for(const p of T.marsh)for(const[c,r]of p){if(grid[r][c]!==1)bad.push(s+': marsh off the road');
        for(const rt of MAP.routes){const i=rt.findIndex(q=>q[0]===c&&q[1]===r);if(i>=0&&(i<6||i>=rt.length-4))bad.push(s+': marsh by a gate or the keep');}}
      /* fairness: each gate keeps 12 free spots (or all it had) within Archer range of its first 6 road tiles; no 8-tile stretch loses more than 2 */
      const ru=new Set(T.ruins.map(key));MAP.routes.forEach(rt=>{const seg=rt.slice(0,6);let n=0,nb=0;for(let r=0;r<H;r++)for(let c=0;c<W;c++){const inR=seg.some(([x,y])=>Math.hypot(x-c,y-r)<=2.7);if(!inR)continue;if(grid[r][c]===0)n++;if(grid[r][c]===0||ru.has(c+','+r))nb++;}
        gateMin=Math.min(gateMin,n);if(n<Math.min(12,nb))bad.push(s+': gate left with '+n);
        for(let i=0;i+8<=rt.length;i++){const hit=new Set();for(let j=i;j<i+8;j++)for(const[x,y]of n4){const k=(rt[j][0]+x)+','+(rt[j][1]+y);if(ru.has(k))hit.add(k);}if(hit.size>2)bad.push(s+': stretch lost '+hit.size);}});}
    ok(a+': 40 boards follow every rule',!bad.length,bad.slice(0,4).join(' | ')||(`hills ${(nH/boards).toFixed(1)}, ruins ${(nU/boards).toFixed(1)}, marsh patches ${(nM/boards).toFixed(1)} a board; fewest free gate spots ${gateMin}`));
    ok(a+': ruins average at least 2 a board',nU/boards>=2,(nU/boards).toFixed(2));}
  /* v312: marsh only on the Kingsroad, also when a run saved elsewhere carries marsh cells */
  {fresh('tundra',777);const rd=MAP.routes[0][10],ix=rd[1]*W+rd[0];TER_LOAD={h:[],u:[],m:[[ix]]};try{fresh('tundra',777);}finally{TER_LOAD=null;}const tun=TER.marsh.length;
    fresh('plains',777);const rd2=MAP.routes[0][10],ix2=rd2[1]*W+rd2[0];TER_LOAD={h:[],u:[],m:[[ix2]]};try{fresh('plains',777);}finally{TER_LOAD=null;}
    ok('no marsh or snow drifts in the Greywind Tundra, even in a saved run',tun===0&&TER.marsh.length===1&&TER.meshes.length>=3,tun+' / '+TER.marsh.length);}
  /* two marsh patches that touch are drawn as one bog: one group, and water right across the seam between them */
  {fresh('plains',777);const rt=MAP.routes[0],A=rt[12],B=rt[13];TER_LOAD={h:[],u:[],m:[[A[1]*W+A[0]],[B[1]*W+B[0]]]};try{fresh('plains',777);}finally{TER_LOAD=null;}
    const pa=tw(A[0],A[1]),pb=tw(B[0],B[1]),mx=(pa.x+pb.x)/2,mz=(pa.z+pb.z)/2,wm=TER.meshes.find(m=>m.material&&m.material.polygonOffset&&m.material.polygonOffsetFactor===-2);
    let near=false;if(wm){const P=wm.geometry.attributes.position;for(let i=0;i<P.count&&!near;i++)if(Math.hypot(P.getX(i)-mx,P.getZ(i)-mz)<.12)near=true;}
    ok('marsh tiles that touch join into one seamless bog',TER.marsh.length===2&&terMarshGroups().length===1&&near,TER.marsh.length+' patches, '+terMarshGroups().length+' bog');}
  /* v313: in Frostvale the marsh stretches are thick snow: 15% slower, bosses and Unstoppable foes 7.5%, flyers not at all */
  {fresh('snow',777);const q=TER.marsh[0][1],p=tw(q[0],q[1]),e0={x:p.x,z:p.z,fly:false,boss:false,unstopT:0};
    ok('Frostvale: thick snow, foes 15% slower',TER.marsh.length>0&&Math.abs(terSlow(e0,1,1)-.85)<1e-9,terSlow(e0,1,1));
    ok('Frostvale: bosses and Unstoppable foes 7.5% slower in thick snow',Math.abs(terSlow(Object.assign({},e0,{boss:true}),1,1)-.925)<1e-9&&Math.abs(terSlow(Object.assign({},e0,{unstopT:3}),1,1)-.925)<1e-9);
    ok('Frostvale: flyers pass over the snow',terSlow(Object.assign({},e0,{fly:true}),1,1)===1);
    ok('Frostvale: tapping it says Thick snow',terTipText(2)[0]==='Thick snow');
    ok('Frostvale: the drift is one raised snow surface, no bog water',TER.meshes.some(m=>m.material===TER_SNM)&&!TER.meshes.some(m=>TER_MM&&m.material===TER_MM.water));}
  {fresh('plains',777);const g=TER.meshes.filter(m=>m.material&&m.material.polygonOffset);ok('the Kingsroad marsh has its blended ground and water layers',g.length===2&&g.every(m=>m.geometry.attributes.position.count>30),g.map(m=>m.geometry.attributes.position.count/3).join(','));}
  {fresh('plains',777);const A=JSON.stringify(MAP.ter),tr=JSON.stringify([TREES,ROCKS,MAP.chests.map(q=>[q.c,q.r]),MAP.lms.map(q=>[q.k,q.c,q.r]),MAP.lore.map(q=>[q.k,q.x.toFixed(3),q.z.toFixed(3)])]);
    fresh('plains',777);ok('the same seed gives the same terrain',JSON.stringify(MAP.ter)===A);
    TER_LOAD=0;try{fresh('plains',777);}finally{TER_LOAD=null;}
    ok('without terrain the board is the same otherwise (trees, rocks, chests, landmarks, lore)',!TER.on&&JSON.stringify([TREES,ROCKS,MAP.chests.map(q=>[q.c,q.r]),MAP.lms.map(q=>[q.k,q.c,q.r]),MAP.lore.map(q=>[q.k,q.x.toFixed(3),q.z.toFixed(3)])])===tr);}
  /* ---- effects ---- */
  fresh('plains',777);newGame(1);paused=true;auto=0;lives=1e9;gold=1e7;
  {const h=TER.hi[0],n=(()=>{for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(grid[r][c]===0&&!terHiCell(c,r)&&n4.some(([x,y])=>isRoad(c+x,r+y)))return[c,r];})();
    const t1=placeTower('archer',h[0],h[1]),t2=placeTower('archer',n[0],n[1]);
    ok('high ground: +15% range',Math.abs(tStats(t1).range/tStats(t2).range-1.15)<1e-9,tStats(t1).range.toFixed(3)+' vs '+tStats(t2).range.toFixed(3));
    ok('high ground: the building stands on the hill',Math.abs(t1.g.position.y-TER.lift)<1e-6&&t2.g.position.y===0,t1.g.position.y);
    ok('high ground: the range stat shows it',/9650/.test(statLabel(t1,'range',tStats(t1))[1])&&!/9650/.test(statLabel(t2,'range',tStats(t2))[1]));
    selectTower(t1);ok('high ground: the gold band shows on the range ring',TER.band&&TER.band.visible&&rangeRing.visible);selectTower(t2);ok('elsewhere: no gold band',TER.band&&!TER.band.visible);closeSheet();
    t1.type='ballista';t1.parts.height=40;const big=tStats(t1).range;TER.on=false;const base=tStats(t1).range;TER.on=true;t1.type='archer';t1.parts.height=0;ok('high ground goes past the range cap',big>7.5+1e-6&&Math.abs(big/base-1.15)<1e-9,base.toFixed(3)+' -> '+big.toFixed(3));
    placing={type:'archer'};const u=TER.ruins[0];ok('ruins: nothing can be built there',u&&!placeValid(u[0],u[1]));{const h2=TER.hi[1];ok('high ground: an empty one is a build spot',h2&&placeValid(h2[0],h2[1]));}placing=null;
    const m=TER.marsh[0][1],mp=tw(m[0],m[1]),off=(()=>{for(const rt of MAP.routes)for(const q of rt.slice(6,-4))if(!terKind(q[0],q[1]))return tw(q[0],q[1]);})();
    const fe=(o)=>Object.assign({x:mp.x,z:mp.z,fly:false,boss:false,unstopT:0},o||{});
    ok('marsh: troops 25% slower',Math.abs(terSlow(fe(),1,1)-.75)<1e-9,terSlow(fe(),1,1));
    ok('marsh: bosses 12.5% slower',Math.abs(terSlow(fe({boss:true}),1,1)-.875)<1e-9);
    ok('marsh: Unstoppable foes 12.5% slower',Math.abs(terSlow(fe({unstopT:2}),1,1)-.875)<1e-9);
    ok('marsh: flyers pass over',terSlow(fe({fly:true}),1,1)===1);
    ok('off the marsh: no slow',terSlow(fe({x:off.x,z:off.z}),1,1)===1);
    ok('plains: Frost Spire 65% + marsh = 74% slow (under the cap)',Math.abs(terSlow(fe(),.35,1)-.2625)<1e-9,terSlow(fe(),.35,1));
    ok('plains: Frost Spire + Blizzard + marsh stops at 75%',Math.abs(terSlow(fe(),.35*.5,1)-.25)<1e-9,terSlow(fe(),.35*.5,1));
    ok('legendary effects still go past the cap',Math.abs(terSlow(fe(),.35*.5,.5)-.125)<1e-9,terSlow(fe(),.35*.5,.5));
    ok('no marsh, under the cap: exactly as before',Math.abs(terSlow(fe({x:off.x,z:off.z}),.6,.85)-landSlow(.6*.85))<1e-12);
    /* a real foe walking: same speed on and off the marsh but for the 25% */
    for(const e of enemies.slice())removeEnemy(e);enemies=[];spawnEnemy({type:'soldier'},5);const e=enemies[enemies.length-1];
    const rt=ROUTES.find(R=>R.cells.some(c=>c[0]===m[0]&&c[1]===m[1]));let dm=0,bd=1e9;for(let d=0;d<rt.len;d+=.02){const s=posAt(d,rt),q=(s[0]-mp.x)**2+(s[1]-mp.z)**2;if(q<bd){bd=q;dm=d;}}
    const step=(d)=>{e.route=rt;e.dist=d;e.slowT=0;e.stunT=0;moveEnemy(e,0);const d0=e.dist;moveEnemy(e,.02);return e.dist-d0;};
    let dOff=dm;for(let d=dm-1.5;d>1;d-=.25){const s=posAt(d,rt),c=Math.round(s[0]/TS+OX),r=Math.round(s[1]/TS+OZ);if(!terKind(c,r)&&!n4.some(([x,y])=>terKind(c+x,r+y)===2)){dOff=d;break;}}
    const sOn=step(dm),sOff=step(dOff);ok('a foe really wades 25% slower',Math.abs(sOn/sOff-.75)<.02,(sOn/sOff).toFixed(3));removeEnemy(e);enemies=[];
    /* tooltips */
    const tipFor=(q)=>{terTap(q[0],q[1],300,400);const el=document.getElementById('terTip');return el&&!el.hidden?el.textContent:'';};
    ok('tapping high ground explains it',/Grassy hill.*high ground.*\+15% range/.test(tipFor(h)),tipFor(h).slice(0,60));
    ok('tapping marsh explains it',/Green marsh.*marsh.*25% slower/.test(tipFor(m)));
    ok('tapping ruins explains it',/Stone ruins.*ruins.*Nothing can be built/.test(tipFor(u)));
    ok('a plain tile has no tooltip',!terTap(n[0],n[1],1,1));terTipHide();
    /* saves */
    const R1=serializeRun(),cells=JSON.stringify(R1.ter);ok('the run saves its terrain',R1.ter&&R1.ter.h.length===TER.hi.length&&R1.ter.u.length===TER.ruins.length);
    loadRun(JSON.parse(JSON.stringify(R1)));ok('loading the run brings the same terrain back',TER.on&&JSON.stringify(serializeRun().ter)===cells);
    {const A=towers.find(t=>t.c===h[0]&&t.r===h[1]),B=towers.find(t=>t.c===n[0]&&t.r===n[1]);ok('the building on high ground comes back with its bonus',A&&B&&Math.abs(tStats(A).range/tStats(B).range-1.15)<1e-9&&Math.abs(A.g.position.y-TER.lift)<1e-6);}
    const R0=JSON.parse(JSON.stringify(R1));delete R0.ter;loadRun(R0);ok('a run saved before terrain keeps its board without terrain',!TER.on&&!TER.meshes.length&&grid[u[1]][u[0]]===0);
    /* developer toggle */
    loadRun(JSON.parse(JSON.stringify(R1)));meta.dev=true;devAct('ter');ok('developer: terrain off now',!TER.on&&meta.terOff===true&&grid[u[1]][u[0]]===0&&!TER.meshes.length);
    state='menu';clearWorld();buildMap(778);ok('developer: new boards come without terrain',!TER.on);newGame(1);paused=true;devAct('ter');ok('developer: terrain on again',TER.on&&meta.terOff===false&&TER.meshes.length>0);
    meta.dev=false;meta.terOff=true;state='menu';clearWorld();buildMap(779);ok('with developer mode off, a left-over switch is ignored',TER.on);gameOver();}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{TER_LOAD=null;meta.dev=dev0;meta.terOff=off0;meta.gems=g0;meta.arena=a0;meta.arenas=JSON.parse(ar0);saveMeta();placing=null;lsSet(KR,null);state='menu';clearWorld();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}
return JSON.stringify(out);})()
