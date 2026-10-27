(function(){
/* Materials past gilded marble (v298): Runed obsidian at mass 30, Dragonstone at 40, Celestial crystal at 50.
   Run on the dev page: __kk.ev(await (await fetch('/tests/mass-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const types=ALL_T.filter(k=>k!=='mine');
const scan=(k,m)=>{const r=towerModel(k,{height:0,mass:m,special:0},null);let mx=0,plate=false,bad=0,n=0;r.g.traverse(o=>{if(!o.isMesh)return;n++;const t=o.material;if(t&&t.userData&&t.userData.mx){mx++;if(o.geometry===box(.86,.08,.86))plate=true;}
  if(t&&t.color&&!(t.color.r<=1&&t.color.g<=1&&t.color.b<=1))bad++;});return{r,mx,plate,bad,n};};
const errs=[],ce=console.error;
try{
  ok('seven materials, the three new ones last',MASS_NAMES.length===7&&MASS_NAMES.slice(3).join(',')==='Gilded marble,Runed obsidian,Dragonstone,Celestial crystal',MASS_NAMES.join(','));
  ok('Runed obsidian at mass 30, Dragonstone at 40, Celestial crystal at 50',[19,20,29,30,39,40,49,50,80].map(massX).join('')==='233445566',[19,20,29,30,39,40,49,50,80].map(massX).join(''));
  ok('the build itself stays the tier-3 build (massTier still tops out at 3)',massTier(50)===3&&massTier(30)===3);
  {const none=types.filter(k=>scan(k,20).mx>0);ok('gilded marble (mass 20) is unchanged',!none.length,none.join(','));}
  for(const m of[30,40,50]){const X=massX(m),miss=[],noPlate=[],bad=[];for(const k of types){const s=scan(k,m);if(s.mx<3)miss.push(k+':'+s.mx);if(!s.plate)noPlate.push(k);if(s.bad)bad.push(k);}
    ok(MASS_NAMES[X]+': every building (but the mine) is dressed in it, base plate too',!miss.length&&!noPlate.length&&!bad.length,(miss.join(' ')||'')+(noPlate.length?' no plate: '+noPlate.join(','):'')+(bad.length?' bad colour: '+bad.join(','):''));}
  {const s=scan('mine',50);ok('the mine keeps its own look (its mass is the ore vein)',s.mx===0);}
  {const L=k=>{const c=new THREE.Color(k);return .3*c.r+.59*c.g+.11*c.b;},pal=[0x9d978c,0xb7af9f,0x6f6c78,0xe8e2d4];const a=mxCol(30,pal),b=mxCol(40,pal),c=mxCol(50,pal),cc=new THREE.Color(c);
    const ca=new THREE.Color(a),cb=new THREE.Color(b);ok('v309 colours: deep indigo obsidian, oxblood dragonstone, pale moonstone-blue crystal',L(a)<.35&&ca.b>ca.r&&ca.b>ca.g&&L(b)<.4&&cb.r>cb.g*1.5&&cb.r>cb.b*1.5&&L(c)>.7&&cc.b>cc.r&&cc.b>cc.g,[a,b,c].map(h=>h.toString(16)).join(' '));}
  {const tiers=new Set();let shaded=false;for(const m of[30,40,50])for(const k of['archer','bell'])scan(k,m).r.g.traverse(o=>{if(o.isMesh&&o.material.userData&&o.material.userData.mx){tiers.add(o.material.userData.mx);if(!o.material.flatShading||String(o.material.onBeforeCompile).length>16)shaded=true;}});
    ok('v309: flat-shaded stone like the lower tiers (no surface shader), one material set per tier',[4,5,6].every(q=>tiers.has(q))&&tiers.size===3&&!shaded,[...tiers].join(','));}
  /* every building in every new material compiles and renders */
  {console.error=(...a)=>{errs.push(a.join(' ').slice(0,160));ce.apply(console,a);};const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x665544,.9));let i=0;
    for(const m of[30,40,50])for(const k of types){const r=towerModel(k,{height:0,mass:m,special:0},null);r.g.position.set((i%9)*1.1-4.4,0,Math.floor(i/9)*1.1-4);sc.add(r.g);i++;}
    const cam=new THREE.PerspectiveCamera(40,1,.1,60);cam.position.set(0,9,9);cam.lookAt(0,0,0);renderer.render(sc,cam);console.error=ce;
    ok('all 81 buildings render with the new materials without shader errors',!errs.length,errs[0]||i);}
  {const T=[4,5,6].map(X=>MX_TRIMMAT[X]());ok('v309: each material has its own softly glowing trim',new Set(T.map(t=>t.color.getHex())).size===3&&T.every(t=>t.emissiveIntensity>0&&t.emissiveIntensity<.6),T.map(t=>t.color.getHexString()).join(' '));}
  /* in a run: the upgrade window names the material, the toast announces it */
  {lsSet(KR,null);state='menu';clearWorld();buildMap(777);MAP.fresh=true;newGame(1);paused=true;let tc=null,tr=null;for(let r=0;r<H&&tc==null;r++)for(let c=0;c<W;c++)if(grid[r][c]===0){tc=c;tr=r;break;}
    gold+=buildCost('archer');placeTower('archer',tc,tr);const t=towers[towers.length-1];t.parts.mass=29;buildTowerMesh(t);
    const msgs=[];const tt=toast;toast=function(m){msgs.push(String(m));return tt.apply(this,arguments);};gold=1e12;upgradePart(t,'mass');toast=tt;
    let mx=0;t.g.traverse(o=>{if(o.isMesh&&o.material.userData&&o.material.userData.mx===4)mx++;});
    ok('upgrading mass 29 to 30 turns the tower to Runed obsidian and says so',t.parts.mass===30&&mx>3&&msgs.some(m=>m.includes('Runed obsidian')),msgs.join(' | '));
    selectTower(t);refreshSheet(true);const sh=$('#sheet');ok('the upgrade window names the material',!!sh&&sh.textContent.includes('Runed obsidian'));closeSheet();
    for(let i=0;i<20;i++)upgradePart(t,'mass');let m6=0;t.g.traverse(o=>{if(o.isMesh&&o.material.userData&&o.material.userData.mx===6)m6++;});ok('and at 50 it is Celestial crystal',t.parts.mass===50&&m6>3,t.parts.mass);
    let err='';try{spawnEnemy({type:'soldier',v:0},60);for(let i=0;i<40;i++){update(.05);updFx(.05);}renderer.render(scene,camera);}catch(e){err=e.message;}ok('and it fights without errors',!err,err);}
}catch(e){console.error=ce;ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{state='menu';paused=false;closeSheet();for(const e of enemies.slice())removeEnemy(e);enemies=[];clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
