(async function(){
/* v406 (Simon): the friends leaderboard, the Hall of Champions. Runs against a fake Firebase (LB.fetch swapped for an in-memory database
   that answers GET and PATCH on /lb.json the way the real REST API does, server timestamps included), so it needs no network: the trophy
   and the Hall, joining with a clean name, sending the best wave of every land, the podium and the list (ties to whoever was first,
   broken entries left out, names shown as text), a tab per land, a new best during a run going up by itself (not in developer mode),
   the toast for passing a friend, the offline board, renaming and leaving. Run on the dev page:
   await __kk.ev(await (await fetch('/tests/lb-test.js')).text()) returns [name, ok, detail] rows. Puts the account back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),r0=lsGet(KR),c0=lsGet(LB.ck);
const L0={url:LB.url,fetch:LB.fetch,gap:LB.gap,data:LB.data,at:LB.at,err:LB.err};
const DB={lb:{}},calls=[];let offline=false;
const fake=async(u,o)=>{calls.push([o.method,u]);if(offline)throw new TypeError('Failed to fetch');
  if(!/\/lb\.json$/.test(u))return{ok:false,status:404,json:async()=>null};
  if(o.method==='GET')return{ok:true,status:200,json:async()=>JSON.parse(JSON.stringify(DB.lb))};
  if(o.method==='PATCH'){const b=JSON.parse(o.body);for(const p in b){const [k,id]=p.split('/'),v=b[p];
      if(v===null){if(DB.lb[k])delete DB.lb[k][id];}else{(DB.lb[k]=DB.lb[k]||{})[id]=Object.assign({},v,{t:v.t&&v.t['.sv']==='timestamp'?Date.now():v.t});}}
    return{ok:true,status:200,json:async()=>b};}
  return{ok:false,status:405,json:async()=>null};};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const settle=async()=>{await wait(15);for(let i=0;i<60&&(LB.busy||LB.load);i++)await wait(10);await wait(15);};
const pop=()=>document.getElementById('lbPop'),txt=()=>pop()?pop().textContent:'';
const pod=()=>[...pop().querySelectorAll('.lb-p')].map(p=>p.querySelector('.lb-pn').textContent).join('|');
let errs=0;const ce=console.error;console.error=function(){errs++;return ce.apply(console,arguments);};
try{
  meta.dev=false;meta.lb={};LB.data=null;LB.at=0;LB.err='';lsSet(LB.ck,null);LB.url='';lsSet(KR,null);state='menu';meta.arena='plains';showOverlay('menu');
  /* ---- the trophy and the Hall ---- */
  const b=lbBtn();ok('a trophy button sits on the land card of the Battle tab',!!b&&!!b.closest('[data-tab="battle"] .arena'));
  b.click();ok('it opens the Hall of Champions',!!pop()&&pop().classList.contains('on')&&/Hall of Champions/.test(txt()));
  ok('with no database yet it says the Hall is not open',/not open yet/.test(txt())&&!calls.length);
  pop().querySelector('.lb-x').click();await wait(260);ok('the close button closes it',!pop());
  /* ---- joining ---- */
  LB.url='https://fake-hall.example';LB.fetch=fake;LB.gap=0;
  meta.bestA={plains:57,snow:12};meta.best=57;meta.acct={id:'atest',n:'Account 1'};
  lbOpen();await settle();const inp=()=>document.getElementById('lbName');
  ok('first time: a form to carve your name in ("Account 1" is not offered as the name)',!!inp()&&inp().value==='');
  ok('nothing is sent before joining',!calls.some(c=>c[0]==='PATCH'));
  document.getElementById('lbJoin').click();await settle();ok('an empty name is refused',!lbMe().n&&inp().classList.contains('bad'));
  inp().value='  <Sir>  Simon the Very Long Named Knight ';document.getElementById('lbJoin').click();await settle();await settle();
  const me=lbMe();
  ok('the name is cleaned: no markup, single spaces, at most 20 letters',me.n==='Sir Simon the Very L',me.n);
  ok('joining sends the best wave of every land you have one on',!!DB.lb.plains&&DB.lb.plains[me.id]&&DB.lb.plains[me.id].w===57&&DB.lb.snow[me.id].w===12&&!(DB.lb.tundra&&DB.lb.tundra[me.id]),JSON.stringify(DB.lb));
  ok('with the database\'s own time',typeof DB.lb.plains[me.id].t==='number'&&Math.abs(DB.lb.plains[me.id].t-Date.now())<5000);
  ok('alone on the board you hold the top of the podium',!!pop().querySelector('.lb-p.p1.me')&&pod()==='Open seat|Sir Simon the Very L|Open seat',pod());
  /* ---- friends on the board ---- */
  const T=Date.now();Object.assign(DB.lb.plains,{f1:{n:'Tom',w:120,t:T-2*86400e3},f2:{n:'Ana',w:57,t:T+60e3},f3:{n:'<b>Bob</b>',w:30,t:T-5e3},f4:{n:'Eve',w:12,t:T-7e3},
    bad1:{n:'',w:999,t:T},bad2:{n:'Lots',w:'many',t:T},'bad/3':{n:'Path',w:5}});DB.lb.snow.f1={n:'Tom',w:40,t:T};
  document.getElementById('lbRefresh').click();await settle();
  ok('the podium, left to right: 2nd, 1st, 3rd (a tie goes to whoever reached it first)',pod()==='Sir Simon the Very L|Tom|Ana',pod());
  const rows=[...pop().querySelectorAll('.lb-row')];
  ok('everyone else below it, ranked from 4',rows.length===2&&rows[0].querySelector('.lb-r').textContent==='4'&&/Bob/.test(rows[0].textContent)&&/Eve/.test(rows[1].textContent),rows.map(r=>r.textContent.replace(/\s+/g,' ')).join(' ; '));
  ok('names are shown as text, never as markup',!pop().querySelector('.lb-rn b')&&/bBob\/b/.test(rows[0].textContent));
  ok('broken entries are left out',!/999|Lots|Path/.test(txt()));
  ok('your own pillar glows',!!pop().querySelector('.lb-p.p2.me')&&!pop().querySelector('.lb-row.me'));
  ok('the footer gives your rank',/#2 of 5/.test(pop().querySelector('.lb-you').textContent),pop().querySelector('.lb-you').textContent);
  ok('and so does the trophy',document.querySelector('#bHall em').textContent==='#2'&&!document.querySelector('#bHall em').hidden);
  {const tb=[...pop().querySelectorAll('.lb-tab')];ok('a tab for every land, with how many are on it',tb.length===lbLands().length&&pop().querySelector('.lb-tab[data-lb="plains"] small').textContent==='5'&&pop().querySelector('.lb-tab.on').dataset.lb==='plains');}
  pop().querySelector('.lb-tab[data-lb="snow"]').click();
  ok('another land has its own board',pop().querySelector('.lb-tab.on').dataset.lb==='snow'&&pod()==='Sir Simon the Very L|Tom|Open seat',pod());
  pop().querySelector('.lb-tab[data-lb="tundra"]').click();ok('an empty land invites you to take the first seat',/No champions in Greywind Tundra yet/.test(txt()));
  lbClose();await wait(260);
  /* ---- a new best during a run ---- */
  clearWorld();buildMap(777);MAP.fresh=true;newGame(1);paused=true;auto=0;lives=1e9;
  wave=57;nextQ=null;callWave();await wait(30);await settle();
  ok('a new best wave in a run goes up by itself',meta.bestA.plains===58&&DB.lb.plains[me.id].w===58,meta.bestA.plains+' / '+DB.lb.plains[me.id].w);
  meta.dev=true;wave=58;nextQ=null;callWave();await wait(30);await settle();
  ok('runs in developer mode never count',DB.lb.plains[me.id].w===58,DB.lb.plains[me.id].w);
  meta.dev=false;meta.bestA.plains=58;
  /* ---- passing a friend ---- */
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;
  meta.bestA.plains=130;lives=0;gameOver();await wait(30);await settle();await wait(30);
  ok('when the keep falls the record goes up, and passing a friend shows a toast',DB.lb.plains[me.id].w===130&&/you passed Tom in Kingsroad! Now #1\./.test(toastBox.textContent),toastBox.textContent);
  renderHome();ok('at #1 the trophy glows',document.querySelector('#bHall').classList.contains('top')&&document.querySelector('#bHall em').textContent==='#1');
  state='menu';showOverlay('menu');
  /* ---- offline ---- */
  offline=true;lbOpen('plains');await settle();
  ok('offline: the last board is still shown, marked as offline',/Offline: the board as it was/.test(txt())&&pop().querySelectorAll('.lb-p').length===3&&/Sir Simon/.test(pop().querySelector('.lb-p.p1').textContent));
  LB.data=null;lsSet(LB.ck,null);document.getElementById('lbRefresh')&&document.getElementById('lbRefresh').click();await settle();
  ok('with nothing saved it says it could not reach the Hall',/Could not reach the Hall/.test(txt())&&!!document.getElementById('lbRetry'));
  offline=false;document.getElementById('lbRetry').click();await settle();ok('and comes back when you try again',pop().querySelectorAll('.lb-p').length===3&&!/Offline/.test(txt()));
  /* ---- renaming and leaving ---- */
  document.getElementById('lbRename').click();ok('rename opens the name form with your name in it',!!inp()&&inp().value==='Sir Simon the Very L');
  inp().value='Simon';document.getElementById('lbJoin').click();await settle();await settle();
  ok('a new name goes up on every land',me.n==='Simon'&&DB.lb.plains[me.id].n==='Simon'&&DB.lb.snow[me.id].n==='Simon');
  document.getElementById('lbRename').click();document.getElementById('lbLeave').click();await settle();await settle();
  ok('leaving the Hall takes you off every land',!DB.lb.plains[me.id]&&!DB.lb.snow[me.id]&&me.n===''&&!!inp(),JSON.stringify(DB.lb.plains[me.id]||null));
  lbClose();await wait(260);
  /* ---- the account ---- */
  ok('the board id stays with the account: kept by the save, untouched by developer mode',!('lb' in DEV_KEYS)&&migrateMeta(JSON.parse(JSON.stringify(meta))).lb.id===me.id);
  ok('no errors',errs===0,errs);
}catch(e){ok('exception',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{console.error=ce;try{if(LB.timer){clearTimeout(LB.timer);LB.timer=0;}const o=pop();if(o)o.remove();Object.assign(LB,L0);lsSet(LB.ck,c0);
  for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));saveMeta();lsSet(KR,r0);
  buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');lbBadge();}catch(e){}}
return JSON.stringify(out);})()
