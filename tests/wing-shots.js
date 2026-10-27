(function(){
/* Wing check sheet: await __ws.sheet(name,['greywindroc','auroradrake'],[t...]) renders each model from straight above (as the game's steep camera
   sees it) and from the front, at the given animation times, and POSTs the sheet to python _backup/shot_srv.py 8766. */
window.__ws={
 async sheet(name,types,times,o){o=o||{};const S=o.size||300,cells=[];for(const k of types)for(const t of times)for(const v of['top','front'])cells.push([k,t,v]);const cols=times.length*2;
  const rows=Math.ceil(cells.length/cols),cv=document.createElement('canvas');cv.width=S*cols;cv.height=S*rows;const c2=cv.getContext('2d');
  const ts=new THREE.Scene();ts.background=new THREE.Color(0x8a98a6);ts.add(new THREE.HemisphereLight(0xffffff,0x665544,.95));const dl=new THREE.DirectionalLight(0xffffff,.75);dl.position.set(-2,4,3);ts.add(dl);
  const cam=new THREE.PerspectiveCamera(30,1,.05,60);const sh=renderer.shadowMap.enabled;renderer.shadowMap.enabled=false;renderer.setPixelRatio(1);renderer.setSize(S,S,false);
  try{cells.forEach(([k,t,v],i)=>{const m=enemyModel(k,0);m.b.scale.setScalar(EN[k].size||1);if(m.tick)m.tick(t,.6,0);m.g.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(m.g),c=bb.getCenter(new THREE.Vector3()),r=Math.max(.4,bb.getSize(new THREE.Vector3()).length()*.62);
    if(v==='top')cam.position.set(c.x,c.y+r*2.8,c.z+r*1.25);else cam.position.set(c.x,c.y+r*.5,c.z+r*2.8);cam.lookAt(c);ts.add(m.g);renderer.render(ts,cam);
    c2.drawImage(renderer.domElement,(i%cols)*S,Math.floor(i/cols)*S,S,S);ts.remove(m.g);c2.fillStyle='#10161c';c2.font='bold 13px sans-serif';c2.fillText(k+' '+v+' t='+t,(i%cols)*S+6,Math.floor(i/cols)*S+16);});}
  finally{renderer.shadowMap.enabled=sh;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));fit();}
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.88)});return r.status;}};
return 'wing shots loaded';})()
