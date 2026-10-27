(function(){
/* v398 (Simon): tap an equipped spell chip (scrollHtml: the battle hero's sheet, the hero roster) and a mastery panel opens right under the
   chips: the scroll's mastery bar and its five masteries; a tap on a mastery shows what it does. Run on the dev page:
   __kk.ev(await (await fetch('/tests/spm-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),a0=meta.arena;
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  meta.dev=false;const id=HEROES.find(h=>h.scrolls&&!h.light&&!h.dark).id;meta.equipped=id;
  const CO=SCROLL_IDS.filter(k=>SPELLS_S[k].r==='common'&&SM_D[k]),A=CO[0],B=CO[1],RA=SCROLL_IDS.find(k=>SPELLS_S[k].r==='rare');
  for(const k of SCROLL_IDS)if(meta.spells[k]&&meta.spells[k].hero===id)meta.spells[k].hero=null;
  for(const k of [A,B,RA])meta.spells[k]={lvl:1,hero:id};meta.smast={};meta.smast[A]=SM_XP[1]+3000;
  meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;newGame(1);paused=true;auto=0;
  if(!heroU){const q=heroTileNear(meta.equipped,innerWidth/2,innerHeight*.45);spawnHero(q.c,q.r);}
  SPM.k=null;SPM.i=-1;selectTower(heroU);refreshSheet(true);
  const Q=s=>sheet.querySelector(s),QA=s=>[...sheet.querySelectorAll(s)];
  ok('the battle hero sheet lists each equipped spell as a button chip',QA('button.chip.spl[data-spm]').map(b=>b.dataset.spm).sort().join()===[A,B,RA].sort().join(),QA('[data-spm]').map(b=>b.dataset.spm).join());
  ok('no panel until a chip is tapped',!Q('.spm'));
  Q(`[data-spm="${A}"]`).click();let p=Q('.spm');
  ok('tapping a chip opens the panel right under the chips row',p&&p.dataset.spmk===A&&p.previousElementSibling&&p.previousElementSibling.classList.contains('chips'));
  ok('the chip shows it is open, the others do not',Q(`[data-spm="${A}"]`).classList.contains('on')&&!Q(`[data-spm="${B}"]`).classList.contains('on'));
  ok('the panel shows the scroll name, its mastery level and its XP bar',p&&p.textContent.includes(SPELLS_S[A].n)&&p.querySelector('.mst')&&p.querySelector('.mst b').textContent==='Mastery 2'&&p.textContent.includes(fmt(SM_XP[2])),p&&p.querySelector('.mst')&&p.querySelector('.mst').textContent);
  const rows=p?[...p.querySelectorAll('[data-spml]')]:[];
  ok('five mastery rows, by name, the first two unlocked, the third marked next',rows.length===5&&rows.every((r,i)=>r.textContent.includes(SM_D[A][i].n))&&rows.filter(r=>r.classList.contains('on')).length===2&&rows[2].textContent.includes('Next'),rows.map(r=>r.className).join());
  ok('no mastery text shows before one is tapped, a hint says to tap',p&&!p.querySelector('.spm-d')&&p.querySelector('.spm-hint'));
  rows[2].click();p=Q('.spm');let d=p&&p.querySelector('.spm-d');
  ok('tapping a mastery shows what it does under it',d&&d.previousElementSibling.dataset.spml==='2'&&d.textContent.includes(smDesc(A,2))&&d.textContent.includes(smPowerLabel(A,3)),d&&d.textContent);
  ok('a locked mastery says how much XP it still needs',d&&d.textContent.includes(fmt(SM_XP[2]-meta.smast[A])+' more XP'));
  p.querySelector('[data-spml="0"]').click();p=Q('.spm');d=p.querySelectorAll('.spm-d');
  ok('one mastery open at a time; an unlocked one says so',d.length===1&&d[0].previousElementSibling.dataset.spml==='0'&&d[0].textContent.includes('Unlocked'));
  p.querySelector('[data-spml="0"]').click();ok('tapping it again folds it',!Q('.spm .spm-d'));
  Q('[data-spml="3"]').click();refreshSheet(true);
  ok('the sheet re-rendering keeps the panel and the open mastery',Q('.spm')&&Q('.spm').dataset.spmk===A&&Q('.spm-d')&&Q('.spm-d').previousElementSibling.dataset.spml==='3');
  meta.smast[A]=SM_XP[2]+10;spmTick();p=Q('.spm');
  ok('the panel follows XP earned during the run',p.querySelector('.mst b').textContent==='Mastery 3'&&p.querySelectorAll('[data-spml].on').length===3,p.querySelector('.mst b').textContent);
  Q(`[data-spm="${B}"]`).click();p=Q('.spm');
  ok('tapping another chip switches the panel to that scroll',QA('.spm').length===1&&p.dataset.spmk===B&&!p.querySelector('.spm-d')&&Q(`[data-spm="${B}"]`).classList.contains('on')&&!Q(`[data-spm="${A}"]`).classList.contains('on'));
  Q(`[data-spm="${B}"]`).click();ok('tapping the open chip closes it',!Q('.spm')&&SPM.k===null&&!Q('.chip.spl.on'));
  Q(`[data-spm="${RA}"]`).click();p=Q('.spm');
  ok('a scroll without masteries yet says so in one line, no bar or rows',p&&p.querySelector('.spm-none')&&!p.querySelector('.mst')&&!p.querySelector('[data-spml]'),p&&p.textContent);
  p.querySelector('[data-spmx]').click();ok('the x closes it',!Q('.spm')&&SPM.k===null);
  Q(`[data-spm="${A}"]`).click();closeSheet();ok('closing the sheet forgets the open panel',SPM.k===null);
  selectTower(heroU);refreshSheet(true);ok('reopening the sheet starts closed',!Q('.spm'));
  SPM.k=A;SPM.i=-1;const h=scrollHtml(id),other=HEROES.find(x=>x.id!==id&&x.scrolls).id,h2=scrollHtml(other);
  ok('the panel goes only under the hero that has the scroll',h.includes('class="spm"')&&!h2.includes('class="spm"'));
  meta.dev=true;SPM.k=RA;const hd=scrollHtml(id);meta.dev=false;
  ok('developer mode shows every rarity’s masteries',hd.includes('data-spml="4"'));
  SPM.k=null;
  ok('no console errors',errs===0,errs);
}catch(e){ok('ran without throwing',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{SPM.k=null;SPM.i=-1;closeSheet();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,r0);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');try{goTab('battle');}catch(e){}}catch(e){}}
return JSON.stringify(out);})()
