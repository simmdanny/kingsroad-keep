(function(){
/* Scrolls batch 6 checks (v316, v317): the seven new scrolls are registered everywhere a scroll needs to be, each one hurts a walking pack, their
   special rules hold (charge, spread cap and real flames, wall slow, chill, the prism's lance), the three withdrawn ones are gone and refunded,
   and leaving a run mid-cast takes everything they added off the board.
   Run on the dev page: __kk.ev(await (await fetch('/tests/scrolls6-test.js')).text()) returns [name, ok, detail] rows. Puts the board back afterwards. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);const m0=JSON.stringify(meta),a0=meta.arena;
const IDS=['flamelash','thunderclap','catchflame','firewall','firetornado','frostwolves','prism'],GONE=['dragonbreath','volcano','tempestspire'];
const caster=()=>{const p=posAt(5,ROUTES[0]);return{x:p[0]+1.2,z:p[1]+.6,topY:1.1,c:0,r:0,scd:{},isTest:true};};
const clean=()=>{for(const e of enemies.slice())removeEnemy(e);enemies=[];spawners.length=0;fx.slice().forEach(f=>{f.life=0;});updFx(.001);};
const reset=()=>{if(state!=='playing')newGame(1);paused=true;auto=0;lives=1e9;meta.scrAuto=false;clean();NSUN.length=0;CLOUD.left=0;STORM.left=0;S6FZ.length=0;};
const foes=(n,d0,spd)=>{const L=[];for(let i=0;i<n;i++){spawnEnemy({type:'soldier'},1);const e=enemies[enemies.length-1];e.route=ROUTES[0];e.dist=d0+i*.18;e.off=(i%3-1)*.25;e.maxHp=e.hp=1e9;e.spd=spd||0;e.res={};e.armor=0;e.shield=0;moveEnemy(e,0);L.push(e);}return L.sort((a,b)=>b.dist-a.dist);};
const run=sec=>{for(let i=0;i<sec/.05;i++){update(.05);updFx(.05);}};
const cast=(k,t,L)=>castScrollNow(k,t,{range:3,dmg:100,spellP:100},L,100,{src:t,el:SPELL_EL[k],spell:k});
const dealt=L=>L.reduce((s,e)=>s+(e.maxHp-Math.max(0,e.hp)),0);
try{
  meta.arena='plains';lsSet(KR,null);state='menu';clearWorld();buildMap(31);MAP.fresh=true;
  /* registration */
  {const miss=[];for(const k of IDS){if(!SPELLS_S[k])miss.push(k+' data');if(!SPELL_EL[k])miss.push(k+' element');if(!NSP[k])miss.push(k+' cast');if(!SPI[k])miss.push(k+' art');if(!ANIM_D[k])miss.push(k+' anim');if(!POSES[k])miss.push(k+' pose');if(!SIG[k])miss.push(k+' sigil');if(!SPELL_FX[k])miss.push(k+' effect text');if(!SCROLL_IDS.includes(k))miss.push(k+' list');}
    ok('every new scroll is registered everywhere',!miss.length,miss.join(', '));
    const per={};IDS.forEach(k=>{per[SPELLS_S[k].r]=(per[SPELLS_S[k].r]||0)+1;});ok('two each of common, uncommon and rare, one epic',per.common===2&&per.uncommon===2&&per.rare===2&&per.epic===1&&!per.legendary,JSON.stringify(per));
    ok('four of them are fire',IDS.filter(k=>SPELL_EL[k]==='fire').length===4);
    ok('Wildfire and Firestorm are in the Cookbook, Lightning Rod is gone',['wildfire','firestorm'].every(id=>COMBO_BY[id]&&COMBOS.includes(COMBO_BY[id]))&&!COMBO_BY.lightningrod&&!COMBOS.some(c=>c.id==='lightningrod'));
    ok('the withdrawn scrolls are gone everywhere',GONE.every(k=>!SPELLS_S[k]&&!NSP[k]&&!SPELL_FX[k]&&!SIG[k]&&!POSES[k]&&!SCROLL_IDS.includes(k)));
    {const m={spells:{dragonbreath:{lvl:3,hero:'aldric'},volcano:{lvl:1,hero:null},frostshard:{lvl:2,hero:null}},scraps:5,combos:{lightningrod:1,overload:1}};s6Withdraw(m);
      ok('a save holding a withdrawn scroll gets its scraps back (upgrades included)',!m.spells.dragonbreath&&!m.spells.volcano&&m.spells.frostshard&&m.scraps===5+(6+12*3)+9&&!m.combos.lightningrod&&m.combos.overload,m.scraps);}}
  /* every one of them hurts a walking pack, without errors */
  {const bad=[];let err=null;for(const k of IDS){reset();const L=foes(8,3.6,.9);try{cast(k,caster(),L);run(11);}catch(x){err=k+': '+x.message;}const d=dealt(L);if(!(d>100))bad.push(k+' '+Math.round(d));}
    ok('each new scroll hurts a walking pack',!bad.length&&!err,err||bad.join(', '));}
  /* Thunderclap charges what it hits */
  {reset();const L=foes(4,8);cast('thunderclap',caster(),[L[0]],);run(.6);ok('Thunderclap leaves the foes it hits Charged',L.filter(e=>e.zapT>0).length>=3,L.map(e=>(e.zapT||0).toFixed(1)).join(','));}
  /* Catch Flame: spreads, but to ten foes at most */
  {reset();const L=foes(16,6);const n0=NS_OWN.size;cast('catchflame',caster(),[L[0]],);run(2.5);const fl=NS_OWN.size-n0;run(3.5);const lit=L.filter(e=>e.maxHp>e.hp).length;ok('Catch Flame spreads from foe to foe, ten at most',lit>=6&&lit<=10,lit+' of 16 burned');
    ok('burning foes are wrapped in real flames',fl>=3,fl+' flame groups at 2.5s');run(6);ok('the flames go out afterwards',NS_OWN.size<=n0,NS_OWN.size-n0+' left');}
  /* Wall of Fire slows the foes inside it */
  {reset();const L=foes(1,6,.9);cast('firewall',caster(),L);let slowed=false;for(let i=0;i<120;i++){run(.05);if(L[0].slowT>0&&L[0].slow>=.25)slowed=true;}ok('Wall of Fire burns and slows foes walking through it',slowed&&L[0].maxHp>L[0].hp);}
  /* Frost Wolves chill what they bite */
  {reset();const L=foes(3,6);cast('frostwolves',caster(),L);let chilled=false;for(let i=0;i<80;i++){run(.05);if(L.some(e=>e.chillT>0))chilled=true;}ok('Frost Wolves bite and chill',chilled&&dealt(L)>0);}
  /* Prism of Dawn: the beams sweep the pack, then the lance strikes everything near the prism */
  {reset();const L=foes(6,8);const hits=new Map();const h0=hurt;hurt=function(e,a,k,o){if(o&&o.spell==='prism')hits.set(e,(hits.get(e)||0)+1);return h0.apply(this,arguments);};
    try{cast('prism',caster(),L);run(4.3);const mid=[...hits.values()].reduce((a,b)=>a+b,0);run(1.2);const all=[...hits.values()].reduce((a,b)=>a+b,0);
      ok('Prism of Dawn: the beams sweep over the pack again and again',mid>=L.length*3,mid+' beam hits');ok('then the lance of light strikes',all>mid,all-mid+' lance hits');}finally{hurt=h0;}}
  /* leaving mid-cast leaves nothing behind */
  {reset();const base=scene.children.length;const L=foes(8,6);const t=caster();for(const k of IDS)cast(k,t,L);run(2.2);const mid=scene.children.length;state='menu';clearWorld();buildMap(31);MAP.fresh=true;
    newGame(1);paused=true;run(.1);const after=scene.children.length;ok('leaving a run mid-cast clears every new scroll off the board',after<=base+3&&!S6FZ.length,base+' before, '+mid+' mid-cast, '+after+' after');}
}catch(e){ok('no errors',false,e.message+' '+(e.stack||'').split('\n')[1]);}
finally{try{clean();state='menu';paused=false;clearWorld();meta=migrateMeta(JSON.parse(m0));meta.arena=a0;saveMeta();lsSet(KR,null);buildMap(Math.floor(Math.random()*1e9));MAP.fresh=true;showOverlay('menu');}catch(e){}}
return JSON.stringify(out);})()
