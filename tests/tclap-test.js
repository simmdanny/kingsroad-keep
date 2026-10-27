(function(){
/* v375: Thunderclap's masteries as Simon designed them. Every level's damage is checked exactly on foes placed at set distances from the strike
   (struck foe, core 0.2, ring 0.7, the new outer edge 1.13, outside 1.35; a lone foe at 1.8 for the chain, one at 2.6 out of its reach), then the
   real cast path, the visuals growing with the level, cleanup, and no errors. Run on the dev page:
   __kk.ev(await (await fetch('/tests/tclap-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR);
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;};
const play=()=>{meta.arena='plains';meta.dev=true;meta.scrAuto=false;lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;clean();
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}if(meta.arts&&meta.arts.eq)meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;if(typeof asEl==='function')asEl();state='playing';};
const fx_=sec=>{for(let i=0;i<Math.round(sec/.02);i++)updFx(.02);};/* effects only: the foes stay exactly where they were put */
const SMX=typeof SM_XP!=='undefined'?SM_XP:MAST_XP,setL=L=>{meta.smast=meta.smast||{};if(L)meta.smast.thunderclap=SMX[L-1];else delete meta.smast.thunderclap;};
const o0=()=>({src:heroU,bane:0,el:'lightning',anc:false,spell:'thunderclap'});
let X0=0,Z0=0;
const put=(dx,dz)=>{spawnEnemy({type:'soldier',v:0},20);const e=enemies[enemies.length-1];e.spd=0;e.maxHp=1e9;e.hp=1e9;e.armor=0;e.res={};e.shield=0;e.x=X0+dx;e.z=Z0+dz;e.y=gy(e.x,e.z);if(e.g)e.g.position.set(e.x,e.y,e.z);return e;};
/* every hurt on the test foes, by foe (the amount the scroll asked for, before marks and other bonuses) */
let rec=null;const h0=hurt;hurt=function(e,amt,kind,o){if(rec&&o&&o.spell==='thunderclap'){const l=rec.get(e)||[];l.push({a:amt,sm:!!o.smx});rec.set(e,l);}return h0.apply(this,arguments);};
const sum=e=>(rec.get(e)||[]).reduce((s,h)=>s+h.a,0),near=(a,b)=>Math.abs(a-b)<1e-6;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};const S0=scene.add;
try{
  play();meta.smast={};X0=heroU.x+2.2;Z0=heroU.z;
  /* ---- the masteries ---- */
  const D=SM_D.thunderclap;
  ok("Thunderclap's five masteries are Simon's",D&&D.length===5&&D[0].n==='Rolling Thunder'&&/\{15\}/.test(D[0].d)&&/\{45\}/.test(D[1].d)&&/\{35\}/.test(D[2].d)&&/\{50\}/.test(D[3].d)&&D[4].n==='Thunderhead',D&&D.map(x=>x.n).join(', '));
  ok('his numbers are kept (no scaling); a small hidden damage factor at each mastery tops it up to the ladder (v379)',SMA.thunderclap.every(v=>v===1)&&SMG.thunderclap.length===5&&SMG.thunderclap.every(v=>v>=1&&v<1.3)&&[1,2,3,4,5].every(L=>{setL(L);const p=smP('thunderclap');setL(0);return p===SMG.thunderclap[L-1];}),SMG.thunderclap.join(' / '));
  /* ---- the blast at every level (P 100) ---- */
  const P=100,exp=[];
  for(let L=0;L<=5;L++){play();clean();X0=heroU.x+2.2;Z0=heroU.z;const e=put(0,0),core=put(.2,0),ring=put(0,.7),edge=put(-1.13,0),outF=put(0,-1.35);
    rec=new Map();TCL.dbg=[];s6Clap(X0,Z0,gy(X0,Z0),e,P,o0(),new THREE.Vector3(X0+.7,gy(X0,Z0)+2.1,Z0),L);const now={e:sum(e),core:sum(core),ring:sum(ring),edge:sum(edge),out:sum(outF)};
    fx_(1);const late={e:sum(e),core:sum(core),ring:sum(ring),edge:sum(edge),out:sum(outF)};exp.push([L,now,late]);
    const ext=L>=2?45:L>=1?15:0,af=L>=3?1.35:1,ch=L>=4?65:0;
    ok('Mastery '+L+': the struck foe and the core take 130%'+(L>=3?' and the afterstrike 35% more':''),near(now.e,130)&&near(late.e,130*af)&&near(now.core,130)&&near(late.core,130*af),JSON.stringify(late));
    ok('Mastery '+L+': the ring takes 45%'+(L>=1?', the new outer edge '+ext+'%':' and nothing reaches 1.13'),near(late.ring,45*af+ch)&&near(now.edge,ext)&&near(late.edge,ext*af)&&near(late.out,0),'ring '+late.ring.toFixed(2)+' edge '+late.edge.toFixed(2)+' out '+late.out);
    if(L>=4)ok('Mastery '+L+': the chain takes the nearest foe at least 0.55 away (the ring foe, not the one beside it) for 65% (50% of 130%)',near(late.ring-now.ring-45*.35,65)&&TCL.dbg.some(d=>d.ev==='chain'&&d.e===ring));
    ok('Mastery '+L+': the edge foes are Charged too',L<1||edge.zapT>0);}
  /* ---- the chain reaches a lone foe, races there (not instant), and never past 2.4 tiles ---- */
  {play();clean();X0=heroU.x+2.2;Z0=heroU.z;const e=put(0,0),b=put(1.8,0);rec=new Map();TCL.dbg=[];s6Clap(X0,Z0,gy(X0,Z0),e,P,o0(),new THREE.Vector3(X0+.7,gy(X0,Z0)+2.1,Z0),4);
    const at0=sum(b);fx_(.06);const at1=sum(b);fx_(1);ok('Mastery 4: the lightning races to a foe 1.8 tiles away and strikes it for 65%',at0===0&&at1===0&&near(sum(b),65),at0+' / '+at1+' / '+sum(b));
    clean();const e2=put(0,0),far=put(2.6,0);rec=new Map();s6Clap(X0,Z0,gy(X0,Z0),e2,P,o0(),new THREE.Vector3(X0+.7,gy(X0,Z0)+2.1,Z0),5);fx_(1);ok('but not to a foe 2.6 tiles away',sum(far)===0);
    clean();const e3=put(0,0);rec=new Map();s6Clap(X0,Z0,gy(X0,Z0),e3,P,o0(),new THREE.Vector3(X0+.7,gy(X0,Z0)+2.1,Z0),5);fx_(1);ok('and alone on the field the bolt strikes its foe and nothing else',near(sum(e3),130*1.35));
    clean();const e4=put(0,0),only=put(.25,0);rec=new Map();s6Clap(X0,Z0,gy(X0,Z0),e4,P,o0(),new THREE.Vector3(X0+.7,gy(X0,Z0)+2.1,Z0),4);fx_(1);ok('with only a foe right beside it, the chain takes that one',near(sum(only),130*1.35+65));}
  /* ---- the real cast reads the mastery level ---- */
  {const got=[];for(let L=0;L<=5;L++){play();clean();X0=heroU.x+2.2;Z0=heroU.z;setL(L);SM.cnt.thunderclap=0;const e=put(0,0);put(.6,0);TCL.dbg=[];rec=new Map();
      castScrollNow('thunderclap',heroU,tStats(heroU),[e],100*smP('thunderclap'),o0());fx_(1.4);const s=TCL.dbg.find(d=>d.ev==='strike');got.push(s?s.L:'-');setL(0);}
    ok('a real cast strikes at the mastery the scroll has reached',got.join()==='0,1,2,3,4,5',got.join());}
  /* ---- the visuals grow with the level ---- */
  {const n=[];for(const L of [0,1,2,3,4,5]){play();clean();X0=heroU.x+2.2;Z0=heroU.z;const e=put(0,0);put(.6,0);put(-.5,.4);let c=0;scene.add=function(...a){c+=a.length;return S0.apply(this,a);};
      s6Clap(X0,Z0,gy(X0,Z0),e,100,o0(),new THREE.Vector3(X0+.7,gy(X0,Z0)+2.1,Z0),L);fx_(1.4);scene.add=S0;n.push(c);}
    ok('every mastery adds to the look (the strike draws more at each level)',n[1]>n[0]&&n[2]>n[1]&&n[3]>n[2]&&n[4]>n[3]&&n[5]>n[4]+8,n.join(' < '));
    ok('the bolt looks stronger at Mastery 2, 4 and 5',TCL_V[2]>TCL_V[1]&&TCL_V[4]>TCL_V[3]&&TCL_V[5]>TCL_V[4]);}
  /* ---- it tidies up ---- */
  {play();clean();X0=heroU.x+2.2;Z0=heroU.z;setL(5);const e=put(0,0);put(.5,0);put(1.6,.3);fx_(.5);const before=scene.children.length;castScrollNow('thunderclap',heroU,tStats(heroU),[e],100,o0());fx_(.6);const mid=scene.children.length;fx_(4);
    ok('Mastery 5 leaves nothing behind',scene.children.length<=before&&mid>before+10,before+' > '+mid+' > '+scene.children.length);setL(0);}
  /* ---- under the lightning set (its colours) ---- */
  {play();clean();X0=heroU.x+2.2;Z0=heroU.z;setL(5);meta.arts=meta.arts||{own:{},eq:{},pend:[]};const ids=ARTS.filter(a=>a.el==='lightning').slice(0,3).map(a=>a.id);ids.forEach(id=>meta.arts.own[id]=1);meta.arts.eq[heroU.hero]=ids;ART_V++;AS.k=null;asEl();asTick(.001);
    const e=put(0,0);put(1.5,0);const e0=errs;rec=new Map();castScrollNow('thunderclap',heroU,tStats(heroU),[e],100,o0());fx_(2);ok('under the lightning set it casts clean',AS.el==='lightning'&&errs===e0&&sum(e)>0);
    meta.arts.eq[heroU.hero]=[null,null,null];ART_V++;AS.k=null;asEl();setL(0);}
  ok('no errors',errs===0,errs);
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{hurt=h0;rec=null;TCL.dbg=null;scene.add=S0;console.error=ce;resetCine();state='menu';paused=false;clean();clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);ART_V++;AS.k=null;if(typeof asEl==='function')asEl();buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){out.push(['restore',false,e.message]);}}
return JSON.stringify(out);})()
