(function(){
/* Crown tier and material sheets. Load on the dev page: __kk.ev(await (await fetch('/tests/crown-shots.js')).text())
   await __cw.sheet(name,types,[E...],{P,size,cols}) renders each building at each crown tier (meta.enh is set for the shot only, then put back);
   await __cw.mass(name,types,[20,30,40,50],{E,size,cols}) renders each building at each mass level (the material), at crown tier E (default 3).
   Armory thumbnail light, a camera that fits the building, labelled cells, one sheet POSTed to python _backup/shot_srv.py 8766 as <name>.jpg.
   P: the parts to build with (e.g. {height:12,mass:12,special:12}); size: cell size in pixels; cols: cells per row. */
window.__cw={
 async sheet(name,types,Es,o){o=o||{};const cells=[];for(const k of types)for(const E of Es)cells.push([k,E,o.P||{},['0','I','II','III','IV','V'][E]]);return this.cells(name,cells,o);},
 async mass(name,types,masses,o){o=o||{};const cells=[];for(const k of types)for(const m of masses)cells.push([k,o.E==null?3:o.E,{height:o.h||0,mass:m,special:o.s||0},MASS_NAMES[massX(m)]]);return this.cells(name,cells,o);},
 async cells(name,cells,o){const S=o.size||200,cols=o.cols||6;
  const rows=Math.ceil(cells.length/cols),cv=document.createElement('canvas');cv.width=S*cols;cv.height=S*rows;const c2=cv.getContext('2d');c2.fillStyle='#d8d0c0';c2.fillRect(0,0,cv.width,cv.height);
  const ts=new THREE.Scene();ts.background=new THREE.Color(o.bg||0xd8d0c0);ts.add(new THREE.HemisphereLight(0xffffff,0x665544,.9));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(-2,4,3);ts.add(dl);
  const cam=new THREE.PerspectiveCamera(30,1,.1,30);const sh=renderer.shadowMap.enabled;renderer.shadowMap.enabled=false;renderer.setPixelRatio(1);renderer.setSize(S,S,false);
  const e0=Object.assign({},meta.enh||{});
  try{cells.forEach(([k,E,P,lab],i)=>{meta.enh=Object.assign({},e0,{[k]:E});const m=towerModel(k,P,null);m.g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(m.g),h=Math.max(1.2,bb.max.y),f=h/1.2;
    cam.position.set(1.6*f,2.1*f,2.6*f);cam.lookAt(0,h*.45,0);ts.add(m.g);renderer.render(ts,cam);c2.drawImage(renderer.domElement,(i%cols)*S,Math.floor(i/cols)*S,S,S);ts.remove(m.g);
    c2.fillStyle='#2a1e14';c2.font='bold 13px sans-serif';c2.fillText(k+' '+lab,(i%cols)*S+6,Math.floor(i/cols)*S+16);});}
  finally{meta.enh=e0;renderer.shadowMap.enabled=sh;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));fit();}
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.88)});return r.status;}};
return 'crown shots loaded';})()
