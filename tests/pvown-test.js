(function(){
/* v374 (Simon): "when not in dev mode you can see the preview but only of items and masteries you already have". Outside developer mode a
   mastery card opens previews only for a scroll you own or a building you have unlocked (its picture) and for the masteries already reached;
   developer mode still shows all five. Run on the dev page: __kk.ev(await (await fetch('/tests/pvown-test.js')).text()) returns
   [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),dev0=meta.dev;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
const rowsOf=md=>[...md.querySelectorAll('.mst-lvl')].map(r=>r.dataset.smpv||'-').join('');
const close=()=>{smPvHide();for(const id of ['smModal','mastModal']){const m=document.getElementById(id);if(m)m.remove();}};
try{
  /* ---- scrolls ---- */
  meta.dev=false;meta.smast={};meta.spells.hexspark=meta.spells.hexspark||{lvl:1,hero:null};
  smOpen('hexspark');let md=document.getElementById('smModal');
  ok('an owned scroll with no mastery: its picture opens a preview, no mastery does',!!md&&!!md.querySelector('.sm-art[data-smpv="0"]')&&rowsOf(md)==='-----',md&&rowsOf(md));
  ok('and the hint speaks to the player, not the developer',!!md&&/you have reached/.test((md.querySelector('.smpv-hint')||{}).textContent||'')&&!/Developer/.test((md.querySelector('.smpv-hint')||{}).textContent||''));close();
  meta.smast.hexspark=SM_XP[1];smOpen('hexspark');md=document.getElementById('smModal');
  ok('at Mastery 2 the first two masteries open a preview, the rest say what it takes',rowsOf(md)==='12---'&&/Reach Mastery 3/.test(md.querySelectorAll('.mst-lvl')[2].title||''),rowsOf(md));
  const row3=md.querySelectorAll('.mst-lvl')[2];smPvShow('hexspark',3,row3);const box=document.getElementById('smPv');
  ok('a mastery not yet reached does not open the panel, even when asked directly',(!box||box.hidden)&&!SMPW.want);
  smPvShow('hexspark',2,md.querySelectorAll('.mst-lvl')[1]);
  ok('a reached one opens it, for that scroll at that mastery',!!SMPW.el&&!SMPW.el.hidden&&SMPW.want&&SMPW.want.k==='hexspark'&&SMPW.want.L===2&&/Mastery 2/.test(SMPW.el.querySelector('b').textContent),SMPW.want&&JSON.stringify(SMPW.want));close();smPvDrop();
  const nk=SCROLL_IDS.find(k=>SM_D[k]&&!meta.spells[k]);
  if(nk){smPvShow(nk,0,null);ok('a scroll you do not own shows nothing',(!SMPW.el||SMPW.el.hidden)&&!SMPW.want&&!smPvCan('scroll',nk,0),nk);}
  else ok('a scroll you do not own shows nothing',!smPvCan('scroll','__none__',0),'(the account owns every scroll; checked a made-up one)');
  /* ---- buildings ---- */
  const T0=JSON.stringify(meta.mast||{}),U0=JSON.stringify(meta.unl||{});meta.mast=meta.mast||{};const ak=BASE_UNL.find(k=>MAST_D[k])||'archer';
  meta.mast[ak]=MAST_XP[2];mastOpen(ak);md=document.getElementById('mastModal');
  ok('an unlocked building at Mastery 3: its picture and the first three masteries open a preview',!!md&&!!md.querySelector('.mst-head img[data-smpv="0"]')&&rowsOf(md)==='123--',ak+' '+(md&&rowsOf(md)));
  smPvShow(ak,4,md.querySelectorAll('.mst-lvl')[3],'tower');ok('Mastery 4 stays closed',(!SMPW.el||SMPW.el.hidden)&&!SMPW.want);
  smPvShow(ak,3,md.querySelectorAll('.mst-lvl')[2],'tower');ok('Mastery 3 opens',!!SMPW.want&&SMPW.want.kind==='tower'&&SMPW.want.L===3);close();smPvDrop();
  const lk=ALL_T.find(k=>MAST_D[k]&&!BASE_UNL.includes(k));if(lk){meta.unl=meta.unl||{};delete meta.unl[lk];meta.mast[lk]=MAST_XP[4];
    ok('a locked building shows nothing, whatever its mastery XP',!smPvCan('tower',lk,0)&&!smPvCan('tower',lk,1),lk);}
  meta.mast=JSON.parse(T0);meta.unl=JSON.parse(U0);
  /* ---- developer mode is unchanged ---- */
  meta.dev=true;meta.smast={};smOpen('hexspark');md=document.getElementById('smModal');
  ok('developer mode still opens all five and the picture, whatever the mastery',rowsOf(md)==='12345'&&!!md.querySelector('.sm-art[data-smpv="0"]')&&/Developer mode/.test(md.querySelector('.smpv-hint').textContent),rowsOf(md));close();
  ok('the preview page can be built outside developer mode too',(meta.dev=false,!!smPvSrc()));
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{close();smPvDrop();meta=migrateMeta(JSON.parse(m0));meta.dev=dev0;saveMeta();lsSet(KR,r0);}catch(e){}}
return JSON.stringify(out);})()
