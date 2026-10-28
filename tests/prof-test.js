(function(){
/* v406 (Simon): profiles. The portrait at the top left of the home screen, the two portraits rendered from the game's own models (the
   Knight and the Mage), the profile (rename the account, pick a portrait, the records and the Hall ranks), the name shared with
   More > Accounts, and the profile staying out of developer mode's way. Run on the dev page:
   __kk.ev(await (await fetch('/tests/prof-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),c0=lsGet(LB.ck),L0={url:LB.url,data:LB.data,at:LB.at};
const pop=()=>document.getElementById('profPop'),txt=()=>pop()?pop().textContent:'';
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  meta.dev=false;meta.prof={};meta.lb={};LB.url='';LB.data=null;lsSet(LB.ck,null);state='menu';showOverlay('menu');renderHome();
  /* ---- the portraits ---- */
  ok('two portraits: the Knight and the Mage',PROF.icons.map(d=>d.id).join()==='knight,mage'&&PROF.icons.map(d=>d.n).join()==='Knight,Mage');
  ok('both are rendered from the game\'s own models when the game opens',PROF.icons.every(d=>/^data:image\/png;base64,/.test(PROF.pics[d.id]||'')&&PROF.pics[d.id].length>3000),PROF.icons.map(d=>(PROF.pics[d.id]||'').length).join(' / '));
  {const cv=document.createElement('canvas');cv.width=cv.height=8;const im=new Image();im.src=PROF.pics.knight;
    ok('and are not blank',(()=>{try{const g=cv.getContext('2d');g.drawImage(im,0,0,8,8);return [...g.getImageData(0,0,8,8).data].some((v,i)=>i%4===3&&v>0);}catch(e){return true;}})());}
  ok('the Knight until one is chosen',profIcon()==='knight'&&meta.prof.icon==='knight');
  /* ---- the button at the top left ---- */
  const b=document.getElementById('bProf'),top=document.querySelector('#home .home-top'),res=top.querySelector('.res');
  ok('a round portrait sits at the top left of the home screen',!!b&&b.parentElement===top&&b.getBoundingClientRect().left<res.getBoundingClientRect().left&&b.getBoundingClientRect().left<40,b&&Math.round(b.getBoundingClientRect().left));
  ok('it does not cover the crowns, gems or scraps',[...top.querySelectorAll('.res')].every(r=>r.getBoundingClientRect().left>=b.getBoundingClientRect().right));
  ok('it shows your portrait',!!b.querySelector('.pf-face[data-pf="knight"] img'));
  b.click();ok('tapping it opens your profile',!!pop()&&pop().classList.contains('on'));
  /* ---- the profile ---- */
  meta.acct={id:'atest',n:'Account 1'};meta.bestA={plains:57,snow:12};meta.arenas.snow=1;meta.best=57;meta.kills=1234;meta.crowns=777;profDraw();
  ok('your name and portrait at the top',pop().querySelector('.pf-name span').textContent==='Account 1'&&!!pop().querySelector('.pf-big .pf-face[data-pf="knight"]'));
  ok('your records: best wave, foes slain, crowns, scrolls',/57\s*Best wave/.test(txt())&&/1234\s*Foes slain/.test(txt())&&/777\s*Crowns/.test(txt())&&/Scrolls/.test(txt()));
  ok('and the best wave on every open land',/Kingsroad Plains\s*Wave 57/.test(txt())&&/Frostvale\s*Wave 12/.test(txt()));
  ok('not in the Hall yet',/Not in the Hall of Champions yet/.test(txt()));
  /* ---- picking a portrait ---- */
  pop().querySelector('.pf-pic[data-pic="mage"]').click();
  ok('picking the Mage: chosen, saved, and the card marks it',meta.prof.icon==='mage'&&lsGet(KM).prof.icon==='mage'&&pop().querySelector('.pf-pic.on').dataset.pic==='mage');
  ok('the big portrait and the one at the top left change with it',!!pop().querySelector('.pf-big .pf-face[data-pf="mage"]')&&!!document.querySelector('#bProf .pf-face[data-pf="mage"]'));
  profSetIcon('dragon');ok('a portrait that does not exist is ignored',meta.prof.icon==='mage');
  /* ---- renaming ---- */
  pop().querySelector('#pfEdit').click();const inp=()=>document.getElementById('pfName');
  ok('tapping the name opens it for editing',!!inp()&&inp().value==='Account 1');
  inp().value='   ';document.getElementById('pfSave').click();ok('an empty name is refused',acctId().n==='Account 1'&&inp().classList.contains('bad'));
  inp().value='  Sir <Simon>  of   the Kingsroad Keep ';document.getElementById('pfSave').click();
  ok('a new name is cleaned (no markup, single spaces, 20 letters) and saved',acctId().n==='Sir Simon of the Kin'&&lsGet(KM).acct.n==='Sir Simon of the Kin',acctId().n);
  ok('the profile shows it',pop().querySelector('.pf-name span').textContent==='Sir Simon of the Kin'&&!inp());
  ok('it is the account\'s name: More > Accounts shows it too',document.getElementById('acctRename').value==='Sir Simon of the Kin');
  {const ar=document.getElementById('acctRename');ar.value='Simon';ar.dispatchEvent(new Event('change'));
    ok('and renaming it there shows in the profile',acctId().n==='Simon'&&pop().querySelector('.pf-name span').textContent==='Simon');}
  pop().querySelector('#pfEdit').click();inp().value='Nope';document.getElementById('pfCancel').click();ok('cancel keeps the old name',acctId().n==='Simon'&&!inp());
  /* ---- the Hall ---- */
  document.getElementById('pfHall').click();
  ok('the Hall of Champions button opens the Hall',!!document.getElementById('lbPop')&&document.getElementById('lbPop').classList.contains('on'));
  lbClose();
  {const me=lbMe();me.on=true;LB.data={plains:{[me.id]:{n:'Simon',w:57,t:1,i:'mage'},x:{n:'Tom',w:90,t:1,i:'knight'}},snow:{[me.id]:{n:'Simon',w:12,t:1,i:'mage'}}};profOpen();
    ok('in the Hall: your rank on each land',/In the Hall of Champions/.test(txt())&&/Kingsroad Plains\s*Wave 57\s*#2/.test(txt())&&/Frostvale\s*Wave 12\s*#1/.test(txt()),txt().replace(/\s+/g,' ').slice(0,300));}
  profClose();
  /* ---- the account ---- */
  ok('developer mode leaves the profile alone',!('prof' in DEV_KEYS)&&!('acct' in DEV_KEYS));
  ok('the portrait stays with the account through a save',migrateMeta(JSON.parse(JSON.stringify(meta))).prof.icon==='mage');
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{for(const id of ['profPop','lbPop']){const o=document.getElementById(id);if(o)o.remove();}Object.assign(LB,L0);lsSet(LB.ck,c0);
  state='menu';paused=false;meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);showOverlay('menu');renderHome();renderAccounts();}catch(e){}}
return JSON.stringify(out);})()
