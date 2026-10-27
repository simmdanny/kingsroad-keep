(function(){
/* Boss sheets. Load on the dev page: __kk.ev(await (await fetch('/tests/boss-shots.js')).text())
   await __bs.sheet(name,types,{size,cols,t,views}) renders each foe model at its in-game size (EN[type].size) from the given views
   (yaw angles in radians; default a 3/4 front view and a side view), the animation frozen at time t, labelled, POSTed to python _backup/shot_srv.py 8766. */
window.__bs={
 async sheet(name,types,o){o=o||{};const S=o.size||260,views=o.views||[.6,1.57],cells=[];for(const k of types)for(const v of views)cells.push([k,v]);const cols=o.cols||views.length*2;
  const rows=Math.ceil(cells.length/cols),cv=document.createElement('canvas');cv.width=S*cols;cv.height=S*rows;const c2=cv.getContext('2d');
  const ts=new THREE.Scene();ts.background=new THREE.Color(o.bg||0x8a98a6);ts.add(new THREE.HemisphereLight(0xffffff,0x665544,.95));const dl=new THREE.DirectionalLight(0xffffff,.75);dl.position.set(-2,4,3);ts.add(dl);
  const gr=new THREE.Mesh(new THREE.CircleGeometry(3,24),new THREE.MeshLambertMaterial({color:0x6a7064}));gr.rotation.x=-Math.PI/2;ts.add(gr);
  const cam=new THREE.PerspectiveCamera(30,1,.05,60);const sh=renderer.shadowMap.enabled;renderer.shadowMap.enabled=false;renderer.setPixelRatio(1);renderer.setSize(S,S,false);
  try{cells.forEach(([k,yaw],i)=>{const m=enemyModel(k,0);const sc=EN[k].size||1;m.b.scale.setScalar(sc);if(EN[k].fly)m.g.position.y=.5;if(m.tick)m.tick(o.t||1.3,.6,0);m.g.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(m.g),c=bb.getCenter(new THREE.Vector3()),r=Math.max(.4,bb.getSize(new THREE.Vector3()).length()*.62);
    cam.position.set(c.x+Math.sin(yaw)*r*2.6,c.y+r*1.1,c.z+Math.cos(yaw)*r*2.6);cam.lookAt(c);ts.add(m.g);renderer.render(ts,cam);c2.drawImage(renderer.domElement,(i%cols)*S,Math.floor(i/cols)*S,S,S);ts.remove(m.g);
    c2.fillStyle='#10161c';c2.font='bold 13px sans-serif';c2.fillText(EN[k].nm+'  '+bb.getSize(new THREE.Vector3()).toArray().map(v=>v.toFixed(2)).join('x'),(i%cols)*S+6,Math.floor(i/cols)*S+16);});}
  finally{renderer.shadowMap.enabled=sh;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));fit();}
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.88)});return r.status;}};
return 'boss shots loaded';})()
