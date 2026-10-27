(function(){
/* Dark artifact set frame sheets (v356): the same scrolls cast without a set and with the dark set (Grave Runes), side by side.
   Load on the dev page: __kk.ev(await (await fetch('/tests/asdark-shots.js')).text()), then await __adk.sheet(name,[scroll ids],t)
   (t = seconds after the cast for the frame). Each row is one scroll: left without a set, right with the dark set. POSTs to the shot server 8766. */
const BY={};for(const a of ARTS)(BY[a.el]=BY[a.el]||[]).push(a.id);
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;projs.slice().forEach(p=>{scene.remove(p.m);});projs.length=0;for(const f of fx.slice())f.life=0;updFx(.01);};
window.__adk={
 setup(dark){meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}
  meta.arts=meta.arts||{own:{},eq:{},pend:[]};const ids=dark?BY.dark.slice(0,3):[];for(const id of ids)meta.arts.own[id]=1;meta.arts.eq[heroU.hero]=ids;ART_V++;AS.k=null;asEl();asTick(.001);
  const R=ROUTES[0];let bd=1e9,bdist=0;spawnEnemy({type:'soldier',v:0},20);const e0=enemies[enemies.length-1];for(let d=0;d<R.len;d+=.1){e0.route=R;e0.dist=d;moveEnemy(e0,0);const q=Math.hypot(e0.x-heroU.x,e0.z-heroU.z);if(q<bd&&q>1){bd=q;bdist=d;}}removeEnemy(e0);enemies=enemies.filter(e=>!e.dead);
  const L=[];for(let i=0;i<8;i++){spawnEnemy({type:i%3?'soldier':'knight',v:0},20);const e=enemies[enemies.length-1];e.route=R;e.dist=bdist+.2*(i-3.5);e.off=0;e.spd=.0001;e.maxHp=e.hp=1e7;e.armor=0;e.shield=0;moveEnemy(e,0);L.push(e);}
  const cx=(heroU.x+L[4].x)/2,cz=(heroU.z+L[4].z)/2;CAM.px=cx-camTarget.x;CAM.pz=cz-camTarget.z;CAM.zoom=.55;applyCam();return L;},
 step(sec){for(let i=0;i<Math.round(sec/.033);i++){if(heroU)heroU.cd=1e9;update(.033);updFx(.033);anim(.033,performance.now()/1000);}},
 async sheet(name,ks,t){const src=renderer.domElement,cw=Math.round(src.width*.5),ch=Math.round(src.height*.5),cv=document.createElement('canvas');cv.width=cw*2;cv.height=ch*ks.length;const g=cv.getContext('2d');
  const a0=JSON.stringify(meta.arts||{});state='playing';
  try{ks.forEach((k,row)=>{[false,true].forEach((dark,col)=>{const L=this.setup(dark);state='playing';meta.spells[k]=meta.spells[k]||{lvl:1,hero:null};heroU.scd={};heroU.gcd=0;
    fireScroll(heroU,k,tStats(heroU),L.slice());paused=false;this.step(t);paused=true;anim(.001,performance.now()/1000);renderer.render(scene,camera);
    g.drawImage(src,0,0,src.width,src.height,col*cw,row*ch,cw,ch);g.fillStyle='#fff';g.font='bold 15px sans-serif';g.fillText(k+(dark?' - dark set':''),col*cw+8,row*ch+20);});});}
  finally{meta.arts=JSON.parse(a0);ART_V++;AS.k=null;asEl();clean();state='menu';paused=false;}
  const r=await fetch('http://localhost:8766/save?name='+name,{method:'POST',body:cv.toDataURL('image/jpeg',.86)});return r.status;}};
return 'asdark shots loaded';})()
