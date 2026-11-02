(function(){
/* Arena surroundings (v449): every land dresses the band round its board. Run on the dev page:
   __kk.ev(await (await fetch('/tests/ars-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const LANDS=['plains','snow','tundra','whitewaste','taiga','highlands'];
const go=(a,sd)=>{lsSet(KR,null);for(const k of LANDS)meta.arenas[k]=1;meta.arena=a;meta.mapIntro=0;state='menu';clearWorld();buildMap(sd||31);MAP.fresh=true;};
const m4=new THREE.Matrix4(),v=new THREE.Vector3();
const each=(fn)=>{for(const m of ARS.meshes)for(let i=0;i<m.count;i++){m.getMatrixAt(i,m4);v.setFromMatrixPosition(m4);fn(m,i,v.x,v.z);}};
try{
  for(const a of LANDS){go(a);const K=ARS_KITS[a],bad=[];
    if(ARS.land!==a)bad.push('land '+ARS.land);
    if(ARS.meshes.length!==K.kinds.length)bad.push(ARS.meshes.length+' kinds of '+K.kinds.length);
    let n=0,onBoard=0,inSea=0,onLead=0;const lead=new Set((MAP.lead||[]).map(([c,r])=>c+','+r));
    each((m,i,x,z)=>{n++;if(arsOut(x,z)<.3)onBoard++;if(ARS.sea&&x<ARS.sea(z))inSea++;const c=Math.round(x+OX),r=Math.round(z+OZ);if(lead.has(c+','+r))onLead++;});
    if(n<1500)bad.push('only '+n+' props');if(onBoard)bad.push(onBoard+' on the board');if(inSea)bad.push(inSea+' in the sea');if(onLead)bad.push(onLead+' on the lead road');
    if(!ARS.meshes.every(m=>m.parent===TERRAIN&&m.isInstancedMesh&&m.material.vertexColors))bad.push('not instanced in the terrain');
    const G=GLD.ground;if(!G||!/\|as/.test(G.material.customProgramCacheKey()))bad.push('ground does not read the map');
    ok(a+': the land round the board is dressed ('+K.kinds.map(k=>k.k).join(', ')+'), none of it on the board, the lead roads or the sea',!bad.length,bad.join('; ')||n+' props');}
  /* the plains and snow's old outer forest makes way; the highlands' old pebble heather too */
  {go('plains');ok('plains: the old scattered outer trees are hidden, the woods replace them',TERRAIN.children.filter(o=>o.userData.ot).every(o=>!o.visible));
   go('highlands');ok('highlands: the old heather pebbles are hidden, the new clumps replace them',TERRAIN.children.filter(o=>o.userData.hl==='heather').every(o=>!o.visible)&&ARS.stat.heather>500,ARS.stat.heather);}
  /* the same board dresses the same way; a new board does not pile up */
  {go('plains',77);const A=[];each((m,i,x,z)=>{if(i<3)A.push(x.toFixed(3)+','+z.toFixed(3));});go('plains',77);const B=[];each((m,i,x,z)=>{if(i<3)B.push(x.toFixed(3)+','+z.toFixed(3));});
   ok('the same board is dressed the same way every time',A.join('|')===B.join('|'));
   ok('rebuilding leaves one set of props (nothing piles up)',TERRAIN.children.filter(o=>o.userData.as).length===ARS_KITS.plains.kinds.length);}
  /* trees gather in woods: the ground under them is darker in the map */
  {go('plains');const t=ARS.meshes[0];let dark=0,c=0;for(let i=0;i<Math.min(60,t.count);i++){t.getMatrixAt(i,m4);v.setFromMatrixPosition(m4);const E=ARS_EXT,n=E.n,q=(Math.floor((v.z-E.z0)/(E.z1-E.z0)*n)*n+Math.floor((v.x-E.x0)/(E.x1-E.x0)*n))*4;c++;if(ARS.D[q]>60)dark++;}
   ok('the ground darkens under the trees (their canopy is stamped into the map)',dark>c*.8,dark+' of '+c);}
  /* cost: a few draw calls; the plants sway */
  {go('plains');newGame(1);paused=true;anim(.01,1);meta.shadows=false;applyShadows();renderer.render(scene,camera);const on=renderer.info.render.calls;ARS.meshes.forEach(m=>m.visible=false);renderer.render(scene,camera);const off=renderer.info.render.calls;ARS.meshes.forEach(m=>m.visible=true);
   ok('the whole dressing is one draw call a kind',on-off<=ARS_KITS.plains.kinds.length,(on-off)+' for '+ARS_KITS.plains.kinds.length+' kinds');
   const t0=ARS.T.value;anim(.05,12.5);ok('the wind clock ticks (plants sway)',ARS.T.value!==t0&&ARS.meshes.some(m=>/as0\.[1-9]/.test(m.material.customProgramCacheKey())));}
  {let err=null;try{for(const a of LANDS){go(a,5);newGame(1);anim(.05,1);renderer.render(scene,camera);}}catch(e){err=e.message;}ok('every land renders with its dressing, without errors',!err&&!errs,err||errs);}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v449'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
finally{console.error=ce;try{state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);applyShadows();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,String(e)]);}}
return out;})()
