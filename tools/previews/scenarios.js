// The stage for every recorded scroll mastery preview (v428). tools/previews/record.js plays each one in the real game.
// Simon: "if a mastery says something like "on kill effect" ... spawn one or two enemies and one will be the targeted one that will spawn
// with 1hp so the ability kills him" and "if a mastery says something like "targets the toughest enemy" you need to spawn a ram or just a
// tougher enemy so its distinct which one is being targeted".
//
// A stage: the hero (Aldric) beside the road and a pack of foes walking down it; the scroll is cast when the pack reaches the hero's reach.
//   pack   foes in the pack: {t: type, at: tiles ahead of the pack's middle, off: across the road, hp: x the hero's spell power ('1' = 1 HP),
//          tag: a label over it, tc: the label's colour, target: true = the scroll's first target, elite: 'armored', spd}
//   trail  foes further back that walk into the area later (at < 0)
//   spd    walking speed of the foes          hp  their health (x spell power) unless set
//   castAt when the scroll is cast (s)         casts  [times] to cast it more than once       also  [{k, at}] another scroll cast after it
//   cnt    the scroll's cast counter before the first cast (2 = the next cast is the 3rd)
//   framing is automatic: a run without pictures logs where foes are hit; the camera frames them and the hero (zmin/zmax/zk/margin/cz tune it)
//   len    a fixed clip length (s), else it ends when the scroll's effects are done
//   probe  must be true at the end, or the next seed is tried (chance-based masteries)      note  the caption under the clip
// v439 (the tracking camera, record.js camPath): the view follows the action through the clip instead of holding one framing.
//   track  false = the old still framing        follow 'hits' = follow only the foes it hits (a storm all over the map)
//   sky    effects higher than this (tiles) are not followed (default 2.4)       from  start the clip at this time (s), not at the cast
//   cap    the longest clip (s, default 9.5)    towers [{t, at, side}] towers by the road (at: tiles from the pack's middle)
//   focus  {ev, before, after}: the clip is the window around the first time its module logs ev (found in the run without pictures)
//   tick   a script run every frame after the cast (stage hands: steering a cloud over the pack)   enter  foes that walk in later
//   foes also take frac: their health as a fraction of the full (for "under a quarter of their health")
const TAG = { hp1: '#ff6a5a', tough: '#ffcf5a', fly: '#8fd8ff', mark: '#d7a6ff' };
const ONE = (o) => Object.assign({ t: 'soldier', hp: '1', tag: '1 HP', tc: TAG.hp1, target: true }, o);
const TOUGH = (o) => Object.assign({ t: 'ram', hp: 40, tag: 'Toughest', tc: TAG.tough }, o);
const FLY = (o) => Object.assign({ t: 'raven', tag: 'Flying', tc: TAG.fly }, o);
const PACK = [
  { t: 'soldier', at: .32, off: -.14 }, { t: 'peasant', at: .08, off: .17 }, { t: 'soldier', at: -.18, off: -.04 },
  { t: 'soldier', at: -.44, off: .19 }, { t: 'peasant', at: -.68, off: -.17 }, { t: 'knight', at: -.94, off: .05 }];
const TRAIL = [{ t: 'soldier', at: -2.3, off: .1 }, { t: 'peasant', at: -2.65, off: -.15 }, { t: 'soldier', at: -3.0, off: .05 }];
/* the stage (found by searching map seeds for a straight stretch of road running across the view with a hero tile in front of it) */
const STAGE = process.env.PV_STAGE ? JSON.parse(process.env.PV_STAGE) : { seed: 98, ri: 0, d: 31.35, c: 8, r: 16 };
const DEF = { hero: 'aldric', st: STAGE, spd: .32, hp: 12, castAt: .6, fw: .7, look: 1.2, zoom: .5, pack: PACK, trail: [], note: '' };
/* the pack with one foe swapped for another (i: index into PACK) */
const swap = (i, f) => PACK.map((p, j) => j === i ? Object.assign({ at: p.at, off: p.off }, f) : p);

const ONES = n => PACK.map((p, j) => j < n ? Object.assign({}, p, { hp: '1', tag: '1 HP', tc: TAG.hp1, target: !j }) : p);
const LOW = (hp, o) => Object.assign({ t: 'soldier', hp, target: true, tag: 'Low HP', tc: TAG.hp1 }, o);
const BIG = PACK.concat([{ t: 'soldier', at: -1.2, off: -.12 }, { t: 'peasant', at: -1.45, off: .16 }, { t: 'soldier', at: -1.7, off: -.03 }, { t: 'peasant', at: -1.95, off: .12 }, { t: 'soldier', at: -2.2, off: -.15 }]);
const withFly = (at, off) => PACK.concat([FLY({ at: at == null ? -.3 : at, off: off || 0 })]);
const S = {
  /* ---- Common ---- */
  hexspark: {
    4: { pack: swap(0, LOW(2.6)), only: true, casts: [.6, 2.0], spy: ['hxNova'], probe: 'PVR.ev.hxNova>0', note: 'The marked foe survives the first spark, Hexed. The second spark kills it, and it bursts in a violet nova.' },
    5: { cnt: 2, note: 'This is the 3rd cast, so black lightning strikes two more foes.' } },
  lightbolt: {
    /* the Mark of Dawn rings stay 5s after the bolt: the clips end with the action */
    2: { casts: [.6, 1.8], len: 4.0, spy: ['lbBeam'], probe: 'PVR.ev.lbBeam>0', note: 'Two bolts in a row: the second light hit on the marked foe calls down the beam.' },
    3: { len: 3.2 }, 4: { len: 3.2 },
    5: { cnt: 3, len: 3.4, spy: ['lbSunBurst'], probe: 'PVR.ev.lbSunBurst>0', note: 'This is the 4th bolt: a small sun.' } },
  wither: {
    /* the withering is drawn on the foes, not as effects: hold the clip for its 5 seconds */
    base: { trail: TRAIL, minLen: 5.6 },
    3: { pack: swap(0, LOW(1.3)), spy: ['wthSpread'], probe: 'PVR.ev.wthSpread>0', note: 'The marked foe withers away, and its wither passes to a foe nearby.' } },
  emberbolt: {
    4: { trail: TRAIL, note: 'Foes behind the pack walk over the burning tile.' },
    5: { pack: swap(0, ONE({ elite: 'armored', tag: '1 HP \u00b7 Armoured' })), trail: TRAIL, spy: ['ebMolten'], probe: 'PVR.ev.ebMolten>0', note: 'The marked foe is Armoured and has 1 HP: the Fire Bolt kills it and it leaves molten steel.' } },
  gravebind: {},
  frostshard: {
    4: { spy: ['fshFreeze'], probe: 'PVR.ev.fshFreeze>0', tries: 12, note: 'Each hit has a 25% chance to freeze its foe solid; here one does.' },
    5: { cnt: 2, spy: ['fshLance'], probe: 'PVR.ev.fshLance>0', note: 'This is the 3rd cast: a great lance of ice drives through the line.' } },
  staticspark: {
    2: { pack: ONES(3), spy: ['sskRemnant'], probe: 'PVR.ev.sskRemnant>0', note: 'Three foes have 1 HP: the spark kills them and leaves sparks on the ground.' },
    3: { spy: ['sskCharge'], probe: 'PVR.ev.sskCharge>0', tries: 12, note: 'Each leap has a 25% chance to stun: the one that will stun charges violet first.' },
    4: { pack: ONES(3), spy: ['sskBurst'], probe: 'PVR.ev.sskBurst>0', tries: 16, note: 'Three foes have 1 HP; a foe the spark kills has a 35% chance to explode, and here one does.' } },
  cinders: {
    base: { trail: TRAIL },
    2: { trail: TRAIL.concat([FLY({ at: -2.0, off: 0 })]), note: 'A raven flies over the smoke.' } },
  flamelash: {},
  thunderclap: {},
  thornwhip: {
    4: { trail: TRAIL },
    5: { pack: swap(2, TOUGH()), spy: ['twInfect'], probe: 'PVR.ev.twInfect>0', note: 'The ram is the toughest foe nearby: the rose whip goes for it.' } },
  /* ---- Uncommon ---- */
  darkpulse: {
    /* the pulse rolls out from the hero: the view takes in the hero and its ring */
    base: { cx: .45, zk: 1.18 },
    4: { pack: withFly(-.3), note: 'The wall of dark energy strikes flyers too.' } },
  beam: {},
  grasp: {},
  lantern: {
    4: { pack: ONES(2), spy: ['slmSoul'], probe: 'PVR.ev.slmSoul>0', note: 'Two foes have 1 HP: the lantern kills them and gathers their souls for a stronger beam.' } },
  graveburst: { base: { trail: TRAIL } },
  rimebloom: {
    base: { trail: TRAIL },
    3: { also: [{ k: 'frostshard', at: 1.9 }], spy: ['rbmShatter'], probe: 'PVR.ev.rbmShatter>0', note: 'A Frost Shard follows the bloom and shatters a Brittle foe.' } },
  balllightning: {},
  sunflare: {},
  catchflame: {
    base: { pack: BIG },
    2: { pack: BIG.map((p, j) => j === 0 ? Object.assign({}, p, ONE()) : p), spy: ['cfmBackdraftFx'], probe: 'PVR.ev.cfmBackdraftFx>0', note: 'The marked foe has 1 HP: it dies burning and erupts.' },
    5: { pack: BIG, spy: ['cfmErupt'], probe: 'PVR.ev.cfmErupt>0', note: 'Eleven foes, so the fire can reach its tenth.' } },
  firewall: {
    /* the wall rises ahead of the leading foe: the pack starts further back so it is not on the hero, and walks through it */
    base: { trail: TRAIL, ahead: 3.0, spd: .5 },
    4: { spd: .6, trail: [{ t: 'soldier', at: -1.4, off: .1 }, { t: 'peasant', at: -1.7, off: -.15 }, { t: 'soldier', at: -2.0, off: .05 }], spy: ['wofBlast'], probe: 'PVR.ev.wofBlast>0', note: 'Six foes cross the wall, so it releases its blast.' },
    5: {} },
  bramble: { base: { trail: TRAIL } },
  /* ---- Rare ---- */
  deflect: { base: {} },
  riftfang: { 4: { pack: withFly(-.3), note: 'The blackglass spears hit flyers too.' } },
  stormcloud: {
    /* the clouds hang high over the road: the view leans up to keep them in */
    base: { pack: swap(5, TOUGH({ tag: 'Strongest' })), cz: -1.5, zk: 1.35, zmax: .95, note: 'One cloud gathers over the leading foe, one over the strongest (the ram).' },
    2: { pack: swap(5, TOUGH({ tag: 'Strongest' })).concat([FLY({ at: .1, off: 0 })]), spy: ['scmFork'], probe: 'PVR.ev.scmFork>0' },
    3: { spy: ['scmClap'], probe: 'PVR.ev.scmClap>0' },
    4: { spy: ['scmLink'], probe: 'PVR.ev.scmLink>0' },
    5: { spy: ['scmFinale'], probe: 'PVR.ev.scmFinale>0' } },
  verdict: {
    2: { trail: TRAIL, note: 'Foes behind the pack cross the scar.' },
    5: { pack: withFly(-.2), note: 'The second beam hits flyers too.' } },
  icetomb: { base: { pack: swap(2, TOUGH({ tag: 'Strongest' })), note: 'The ram is the strongest foe: the tomb always takes the strongest.' } },
  geyser: { base: { trail: TRAIL } },
  crows: {},
  /* a tall funnel drifting back along the road: a wider view, leaning up and back */
  firetornado: { base: { cz: -.35, cx: -.35, zk: 1.15 } },
  frostwolves: { 5: { pack: swap(2, TOUGH({ tag: 'Strongest' })), note: 'At the end both wolves leap at the strongest foe, the ram.' } },
  roots: {},
  /* ======== Epic and Legendary (v439, developer mode): recorded with the tracking camera. Their foes are tougher (hp 30) so the pack
     lives through the long casts and the later masteries still find it; each module's dbg log names the moments in the recorder's line ======== */
  loop: {
    /* the fold sends the foes that reach it back up the road: they walk briskly, and the view follows them round */
    base: { dbg: 'LPM', spd: 1.0, follow: 'foes', len: 7, zmax: 1.05 },
    1: { probe: "LPM.dbg.some(d=>d.ev==='hop'&&d.rev>0)", note: 'Foes the fold sends back come out turned around and walk the wrong way for a moment, a U-turn of light circling them.' },
    2: { note: 'Each foe the fold sends back is sheared where it goes in and where it comes out.' },
    3: { spd: 1.7, len: 10.2, note: 'Fast foes, so they go round the 8-tile loop more than once: each lap hurts more.' },
    4: { towers: [{ t: 'archer', at: -5 }, { t: 'archer', at: -1, side: -1 }], note: 'Archer towers shoot the foes the fold sent back: they take more from everything for 3s.' },
    5: { len: null, cap: 11.8, probe: "LPM.dbg.some(d=>d.ev==='snap')", note: 'The fold holds 10 seconds; when it lets go the looped road snaps back.' } },
  /* v447 (Fern's volley): foes further back give the extra lines something the first one missed */
  judgment: {
    base: { dbg: 'JDM', trail: TRAIL },
    1: { probe: "JDM.dbg.some(d=>d.ev==='line'&&d.kind==='follow'&&d.L.length>0)", note: 'The circle snaps back to a point and fires a second line through the foes the first one missed.' },
    2: { note: 'Every line strikes harder, pierces wider and burns brighter.' },
    3: { probe: "JDM.dbg.filter(d=>d.ev==='line'&&d.kind==='volley'&&d.L.length>0).length>=2", note: 'Three more circles open in a fan behind the hand and fire one after another.' },
    4: { pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { hp: 40, frac: .4, tag: 'Worn down', tc: TAG.hp1 }) : p), probe: "JDM.dbg.some(d=>d.ev==='exec')", note: 'Three foes are worn down: the line leaves them under a quarter of their health, and finishes them off.' },
    /* a wide view held through the cast and set half a tile toward the hero: the camera frames the foes the lines hit, and the arc of
       circles behind the hero is more than 2.5 tiles from all of them (it would count as a sideshow and drift off the right edge) */
    5: { zmin: 1, zmax: 1.1, cx: .5, probe: "JDM.dbg.filter(d=>d.ev==='line'&&d.kind==='barrage'&&d.L.length>0).length>=6", note: 'Ten circles fill the air behind the hero and fire in turn: fifteen lines in one cast.' } },
  cataclysm: {
    base: { dbg: 'CCM' },
    1: { spd: .45, probe: "CCM.dbg.some(d=>d.ev==='fence')", note: 'Seven standing stones rise in a ring at the rune\u2019s edge: the foes walking through are fenced in until the sky falls.' },
    4: { towers: [{ t: 'archer', at: .4 }, { t: 'cannon', at: -1.2, side: -1 }], len: 7, probe: "CCM.dbg.some(d=>d.ev==='shrap')", note: 'The foes the collapse hits are studded with obsidian: each tower hit knocks a shard into the foe beside it.' },
    5: { pack: swap(4, TOUGH()).concat([TOUGH({ t: 'knight', hp: 34, at: 2.3, off: .1, tag: 'Tough' })]), probe: "CCM.dbg.some(d=>d.ev==='wb')", note: 'The pillars spin up and slam down on the toughest foes nearby.' } },
  phoenix: {
    base: { dbg: 'PHM' },
    1: { pack: BIG, probe: "PHM.dbg.some(d=>d.ev==='white')", note: 'Eleven foes: its fifth strike sets it white-hot, a third bigger, and it burns hotter from then on.' },
    2: { note: 'As it climbs away a front of flame races back along its river of fire.' },
    3: { pack: swap(3, TOUGH()), probe: "PHM.dbg.some(d=>d.ev==='feather')", note: 'Its burst becomes burning feathers that dart at the foes it struck, the toughest (the ram) first.' },
    4: { probe: "PHM.dbg.some(d=>d.ev==='pyre')", note: 'Its fire erupts on foes that are already burning.' },
    /* four foes low enough to fall to the feathers soon after the burst, two whole ones for the firebirds to dive at */
    5: { pack: PACK.map((p, j) => j < 4 ? Object.assign({}, p, { hp: 30, frac: .22, tag: 'Low HP', tc: TAG.hp1 }) : p), cap: 10.5, probe: "PHM.dbg.filter(d=>d.ev==='firebird'&&d.hit).length>=2", note: 'Its death burst rains ashes on the foes it struck: each that dies is reborn as a firebird that dives at the next.' } },
  comet: {
    base: { dbg: 'FCM' },
    1: { spd: .8, note: 'The pack walks briskly: the comet steers onto where it will be.' },
    2: { trail: TRAIL, note: 'Foes still marching in under its tail.' },
    4: { towers: [{ t: 'frost', at: .2 }], len: 7, probe: "FCM.dbg.some(d=>d.ev==='fault')", note: 'A Frost Spire’s ice shatters the fractured foes.' },
    5: { pack: PACK.concat([TOUGH({ at: 2.6, off: 0 })]), probe: "FCM.dbg.some(d=>d.ev==='rebound')", note: 'The heart bursts out of the crater and smashes into the toughest foe nearby, the ram.' } },
  wyrm: {
    base: { dbg: 'WYM' },
    2: { probe: "WYM.dbg.some(d=>d.ev==='snap')", note: 'As it weaves, its head lunges and snaps shut on the foes within reach.' },
    3: { pack: swap(2, TOUGH()), probe: "WYM.dbg.some(d=>d.ev==='squeeze')", note: 'It seizes the toughest foe near its head, the ram, and squeezes it.' },
    4: { probe: "WYM.dbg.some(d=>d.ev==='grounded')", note: 'Each lash rings its foe with lightning; its strike forks to every ringed foe.' } },
  prism: {
    base: { dbg: 'PRM' },
    2: { pack: swap(3, TOUGH()), probe: "PRM.dbg.some(d=>d.ev==='lock')", note: 'A seventh, white sunbeam locks onto the toughest foe, the ram, and burns hotter the longer it holds.' },
    3: { probe: "PRM.dbg.some(d=>d.ev==='toll')", note: 'The folding beams set the foes ringing like bells: the lance\u2019s power runs through them into the foes beside them.' },
    4: { probe: "PRM.dbg.some(d=>d.ev==='full')", note: 'Foes swept by all six colours burst with them.' } },
  treant: {
    /* the oak walks for 10s (it is not an effect the recorder counts): every clip holds it */
    base: { dbg: 'TRM', minLen: 9.5, zmin: .66 },
    2: { spd: .55, probe: "TRM.dbg.some(d=>d.ev==='ram')", note: 'The foes walk into the oak: it lowers its trunk and charges through them, throwing them to the sides of the road.' },
    3: { trail: [{ t: 'soldier', at: -3.1, off: .1 }, { t: 'peasant', at: -3.4, off: -.15 }, { t: 'soldier', at: -3.7, off: .05 }, { t: 'knight', at: -4.0, off: -.05 }], probe: "TRM.dbg.some(d=>d.ev==='boulder'||d.ev==='hurl')", note: 'A second knot of foes further back: every third slam it hurls a boulder at it.' },
    4: { also: [{ k: 'roots', at: .25 }], probe: "TRM.dbg.some(d=>d.ev==='grove')", note: 'Entangling Roots first: each Overgrown foe it slams adds a growth ring; at four, its next slam is a Grove Slam.' },
    5: { cap: 12.5, probe: "TRM.dbg.some(d=>d.ev==='timber')", note: 'At the end of its 10 seconds it topples forward along the road.' } },
  compress: {
    base: { dbg: 'CPM', cap: 11.3 },
    1: { pack: PACK.map(p => Object.assign({}, p, { at: p.at * 2.3, off: p.off * 1.6 })), note: 'The foes are spread out: the squeeze draws them together.' },
    3: { probe: "CPM.dbg.some(d=>d.ev==='sat')", note: 'Its two smaller squeezes snap first.' },
    5: { probe: "CPM.dbg.some(d=>d.ev==='star')", note: 'A star of pressed light bursts after the snap.' } },
  voidfall: {
    base: { dbg: 'VFM', sky: 4 },
    1: { spd: .65, pack: PACK.concat([{ t: 'soldier', at: 1.0, off: .1 }, { t: 'peasant', at: 1.35, off: -.12 }]), probe: "VFM.dbg.some(d=>d.ev==='well')", note: 'The front of the pack has walked past the impact: the sphere drags it back.' },
    4: { towers: [{ t: 'archer', at: 0 }, { t: 'archer', at: -1.5, side: -1 }], probe: "VFM.dbg.some(d=>d.ev==='release')", note: 'Archer towers shoot the Hollowed foes; the void gives a share back at once when it ends.' },
    5: { probe: "VFM.dbg.some(d=>d.ev==='crush')", note: 'A second sphere holds the lifted foes in the air, then implodes.' } },
  stormcaller: {
    /* the storm covers the whole map for 15s: the view follows the foes it hits; its late moments are clips centred on them (focus) */
    base: { dbg: 'STC', follow: 'hits', zmax: .9, pack: BIG },
    1: { probe: "STC.dbg.some(d=>d.ev==='seek')", note: 'Bolts that would land near a foe bend onto it.' },
    /* its clouds rain only where one drifts over a road: one is drawn over the pack (the cast's own cloud, steered on the stage) */
    2: { cap: 19.5, tries: 14, pre: "PVR.stcG=null;if(!window.__pvStc){window.__pvStc=1;const s0=stcStart;stcStart=function(o,K){PVR.stcK=K;return s0.apply(this,arguments);};}PVR.stcK=null;",
      tick: "{const K=PVR.stcK,al=PVR.foes.filter(e=>!e.dead);if(K&&K.clouds&&K.clouds.length&&al.length){let cx=0,cz=0;for(const e of al){cx+=e.x;cz+=e.z;}cx/=al.length;cz/=al.length;if(!PVR.stcG){let b=null,bd=1e9;for(const g of K.clouds){const u=g.userData,d=(u.x-cx)**2+(u.z-cz)**2;if(d<bd){bd=d;b=g;}}PVR.stcG=b;}const g=PVR.stcG,u=g.userData;u.x+=(cx-g.position.x)*.08;u.z+=(cz-g.position.z)*.08;}}",
      probe: "STC.dbg.some(d=>d.ev==='soakArc')", focus: { ev: 'soakArc', before: 3, after: 2.5 }, note: 'A cloud rains on the pack and Soaks it: a bolt on a Soaked foe runs through the water to the others.' },
    3: { probe: "STC.dbg.some(d=>d.ev==='roll')", note: 'The thunder of each strike rolls along the road.' },
    4: { trail: TRAIL, cap: 19.5, probe: "STC.dbg.some(d=>d.ev==='frontHit')", focus: { ev: 'front0', before: 1, after: 4 }, note: 'From 8s to 11s of the storm it marches down the road toward the keep as a front of bolts (the clip joins it there).' },
    5: { cap: 22, probe: "STC.dbg.some(d=>d.ev==='last')", focus: { ev: 'last0', before: 1, after: 5 }, note: 'As the storm ends its clouds draw into one thunderhead for a last colossal bolt (the clip joins it there).' } },
  chronostasis: {
    /* the field holds 10s after it forms; the collapse and what follows are clips centred on it (focus) */
    base: { dbg: 'CTM', cap: 13.5 },
    1: { len: 4.6, probe: "CTM.dbg.some(d=>d.ev==='rewind')", note: 'As time breaks every foe inside is wound back along the road.' },
    2: { len: 6.2, probe: "CTM.dbg.some(d=>d.ev==='hand')", note: 'A great clock hand sweeps the field every 2 seconds.' },
    3: { cap: 16, probe: "CTM.dbg.some(d=>d.ev==='echo')", focus: { ev: 'collapse', before: 3.5, after: 2 }, note: 'As time catches up the echoes rush back into their foes (the clip joins the field near its end).' },
    4: { len: 6.6, towers: [{ t: 'archer', at: .3 }, { t: 'archer', at: -1.2, side: -1 }], probe: "CTM.dbg.some(d=>d.ev==='haste')", note: 'Archer towers that reach into the field shoot 30% faster.' },
    5: { cap: 17, probe: "CTM.dbg.some(d=>d.ev==='second')", focus: { ev: 'collapse', before: 1.5, after: 3.4 }, note: 'The collapse, then a ghost of the field collapses again (the clip joins the field near its end).' } },
  skyfall: { base: { dbg: 'SKM' }, 3: { probe: "SKM.dbg.some(d=>d.ev==='rico')" }, 5: { probe: "SKM.dbg.some(d=>d.ev==='ext')" } },
  glacialrift: {
    base: { dbg: 'GRM', follow: 'hits', zmin: .7, zmax: .95 },
    /* foes walk up just after the ridge shatters (about 5.3s: the cast is 1.6s, the shatter 3.7s after it), close behind the statues */
    1: { enter: [{ t: 'soldier', at: -1.85, off: .1, spd: 1.3, time: 5.45 }, { t: 'peasant', at: -2.2, off: -.15, spd: 1.3, time: 5.45 }, { t: 'soldier', at: -2.55, off: .05, spd: 1.3, time: 5.45 }],
      probe: "GRM.dbg.some(d=>d.ev==='statue')", note: 'The frozen foes stand as ice statues; foes walking up behind them are stopped until they thaw.' },
    2: { probe: "GRM.dbg.some(d=>d.ev==='push')", note: 'The wave drags each foe a tile back up the road.' },
    3: { probe: "GRM.dbg.some(d=>d.ev==='calve')", note: 'Slabs of ice break off the ridge and crash onto the road.' },
    4: { pack: PACK.concat([FLY({ at: -.3 })]), trail: [{ t: 'soldier', at: -8.6, off: .1 }, { t: 'peasant', at: -9.0, off: -.12 }], probe: "GRM.dbg.some(d=>d.ev==='cold')", note: 'Rime gathers on every foe in the blizzard, even far behind the rift, until it freezes solid.' },
    5: { probe: "GRM.dbg.some(d=>d.ev==='slam')", note: 'As the ridge shatters the rift tears open and its fangs slam shut.' } },
  harvest: {
    /* the reaper is a giant: the view stands back */
    base: { dbg: 'GHM', zmin: .68 },
    1: { pack: PACK.map((p, j) => j % 2 ? Object.assign({}, p, { hp: 40, frac: .2, tag: 'Low HP', tc: TAG.hp1 }) : p), probe: "GHM.dbg.some(d=>d.ev==='cull')", note: 'Three foes are low on health: the scythe leaves them under 15% and they are reaped outright.' },
    2: { pack: ONES(3), probe: "GHM.dbg.some(d=>d.ev==='swarm')", note: 'Three foes have 1 HP: the first sweep reaps them and their souls hurl out on the backhand.' },
    3: { pack: PACK.map((p, j) => j % 2 ? Object.assign({}, p, { hp: 40, frac: .32, tag: 'Low HP', tc: TAG.hp1 }) : p), probe: "GHM.dbg.some(d=>d.ev==='creep')", note: 'Low-health foes die withering, and burst into new clouds of Wither.' },
    4: { pack: ONES(3), also: [{ k: 'darkpulse', at: 6.4 }], cap: 9.5, probe: "GHM.dbg.some(d=>d.ev==='spend')", note: 'The souls stay with the hero; the next scroll (a Dark Pulse) takes them and is stronger.' },
    5: { pack: swap(2, TOUGH({ tag: 'Strongest' })), probe: "GHM.dbg.some(d=>d.ev==='toll')", note: 'A skeletal hand rises under the strongest foe, the ram, and tears its soul out.' } },
  /* v448 (the same cut, deeper): one cut at every mastery; the clips run to the seal (minLen: in the stilled moment the world runs at a
     twelfth of its speed and the count of effects can fall to where it was before the cast, which would end a clip there) */
  dslash: {
    base: { dbg: 'DSM', cap: 10.5, minLen: 9.6 },
    1: { pack: PACK.concat([{ t: 'soldier', at: .2, off: .66 }, { t: 'peasant', at: -.5, off: -.66 }]), probe: "DSM.dbg.some(d=>d.ev==='split'&&d.L.length>=7)", note: 'The edge burns white and the cut runs wider: the foes beside the road are struck too.' },
    2: { cap: 11.5, minLen: 11, note: 'The tear opens wider and darker, stays open longer and shreds harder.' },
    3: { cap: 12, minLen: 11.4, probe: "DSM.dbg.some(d=>d.ev==='hold'&&d.L.length>0)&&DSM.dbg.some(d=>d.ev==='split')", note: 'The world stands still a beat longer: the foes on the line are held until space splits, and it splits harder.' },
    4: { cap: 12, minLen: 11.4, pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { hp: 40, frac: .55, tag: 'Worn down', tc: TAG.hp1 }) : p), probe: "DSM.dbg.some(d=>d.ev==='sever')", note: 'Three foes are worn down: the split leaves them under 20% of their health, and cuts them down.' },
    /* foes tough enough to live through the split and the rift, so some are still inside when it snaps shut; the hero and the pack stay
       framed throughout (between the cast and the cut almost nothing moves, and a single mote off the blade would steer the view away) */
    5: { cap: 12.5, minLen: 11.6, trackHero: true, pack: PACK.map(p => Object.assign({}, p, { hp: 70 })), probe: "DSM.dbg.some(d=>d.ev==='seal'&&d.L.length>0)", note: 'The tear yawns open along the whole line, and when it seals it snaps shut on everything inside it.' } },
  bloom: {
    base: { dbg: 'HYB' },
    1: { pack: PACK.slice(0, 4).concat([{ t: 'soldier', at: 2.9, off: .1, spd: .45 }, { t: 'peasant', at: 3.3, off: -.12, spd: .45 }, { t: 'soldier', at: -3.0, off: .05, spd: .45 }, { t: 'knight', at: -3.4, off: -.1, spd: .45 }]),
      probe: "HYB.dbg.some(d=>d.ev==='lure')", note: 'Foes past the flower turn back to it; foes behind it hurry on.' },
    2: { towers: [{ t: 'archer', at: .3 }], probe: "HYB.dbg.some(d=>d.ev==='share')", note: 'An archer tower shoots a bound foe: a quarter of each arrow runs along the vines.' },
    3: { probe: "HYB.dbg.some(d=>d.ev==='petal')", note: '16 razor petals whirl out of the burst and slice into the foes.' },
    4: { spd: .6, probe: "HYB.dbg.some(d=>d.ev==='haze')", note: 'The pack walks on through the pollen: the cloud drifts with it.' },
    5: { pack: PACK.concat([{ t: 'soldier', at: 2.6, off: .1 }, { t: 'peasant', at: -2.8, off: -.1 }]), probe: "HYB.dbg.some(d=>d.ev==='sprout')", note: 'The flower goes to seed: seeds drift onto the foes and sprout small blooms.' } },

  /* ======== Mythic, Ancient and Secret (v475, developer mode): the tracking camera again. Their foes are tougher still (hp 60) and the
     battle runs unpaused (live: the Ancient domains only run then). The longest casts (15-25s) are shown as a window round the moment each
     mastery is about (from/len, or focus on the first time its module logs that moment) ======== */
  eclipse: {
    base: { dbg: 'ECM', cap: 13.2, sky: 3.2, zmax: .95, probe: "ECM.dbg.some(d=>d.ev==='shatter')" },
    0: { probe: null },
    1: { note: 'The star beams strike harder and wider, and burst up in starfire where they land.' },
    2: { note: 'The heavy gold beams fall far more often.' },
    3: { note: 'A star every 0.0625s: about 35 beams from a brighter sky.' },
    4: { pack: BIG, note: 'Eleven foes: each star picks a foe no star has struck yet and lands on it.' },
    5: { trail: TRAIL, note: 'The sun breaks: the shatter strikes every foe on the map, the ones further back too.' } },
  embertitan: {
    base: { dbg: 'EMT', cap: 12.5, zmax: 1, probe: "EMT.dbg.some(d=>d.ev==='blow')" },
    0: { probe: null },
    1: { note: 'The greatsword is longer and white-hot.' },
    2: { trail: [{ t: 'soldier', at: -4, off: .1 }, { t: 'peasant', at: -6, off: -.12 }, { t: 'soldier', at: -8, off: .05 }], follow: 'hits', note: 'Foes far back up the road: the fissure tears 14 tiles down it and burns longer.' },
    3: { note: 'The blast at the blade’s tip strikes harder and wider.' },
    4: { pack: swap(2, { t: 'ogre', hp: 120, tag: 'Boss', tc: TAG.tough }), note: 'Foes under the blade are stunned 1.2s; the boss (an Ogre) 0.4s.' },
    5: { trail: TRAIL, note: 'The whole fissure tears open as the sword lands: every geyser bursts at once.' } },
  eternalwinter: {
    base: { dbg: 'EWM', cap: 10.5, zmin: 1.05, zmax: 1.2, sky: 1.2, probe: "EWM.dbg.some(d=>d.ev==='shatter')" },
    0: { probe: null },
    1: { note: 'The frost strikes harder as it reaches each foe, and leaves larger ice.' },
    2: { note: 'The Heart gathers itself longer: the foes stay frozen, then slowed, longer.' },
    3: { probe: "EWM.dbg.some(d=>d.ev==='shard')", note: 'When the Heart bursts, six shards fly at the nearest foes.' },
    4: { pack: swap(2, { t: 'ogre', hp: 120, tag: 'Boss', tc: TAG.tough }), note: 'The boss (an Ogre) stays frozen until the wave reaches it.' },
    5: { probe: "EWM.dbg.some(d=>d.ev==='plates')", note: 'The shatter wave strikes 1500%: the ice sheet bursts up as it breaks.' } },
  aeon: {
    /* the dial turns for about 20s: the clips are windows of it */
    base: { zmin: .78, zmax: 1.05, dbg: 'AEM', from: 1.2, len: 13.2, cap: 13, probe: "AEM.dbg.some(d=>d.ev==='pass')" },
    0: { probe: null, note: 'The dial forms and its great hand starts to turn (the first 12 seconds of the cast).' },
    1: { note: 'Each pass of the great hand takes 2% of a foe’s max health.' },
    2: { note: 'Each pass ages the foes slower, up to 50%.' },
    3: { probe: "AEM.dbg.filter(d=>d.ev==='turn').length>=3", note: 'The hand turns every 2.56s: more sweeps before midnight.' },
    4: { towers: [{ t: 'archer', at: .3 }, { t: 'archer', at: -1.2, side: -1 }], probe: "AEM.dbg.some(d=>d.ev==='glint')", note: 'Archer towers fight 30% faster while the dial turns, glinting gold as the hand passes.' },
    5: { from: null, len: null, cap: 26, pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { frac: .45, tag: 'Worn down', tc: TAG.hp1 }) : p), probe: "AEM.dbg.some(d=>d.ev==='stroke')", focus: { ev: 'stroke', before: 2.5, after: 4.5 }, note: 'Midnight tolls twelve times (the clip joins the dial at midnight); foes left under 25% crumble.' } },
  gaia: {
    base: { dbg: 'WGM', cap: 11, probe: "WGM.dbg.some(d=>d.ev==='strike')" },
    0: { probe: null },
    1: { note: 'Each tree tears up harder and reaches further.' },
    2: { note: 'Foes a tree strikes are pinned longer, roots splaying from every trunk.' },
    3: { trail: [{ t: 'soldier', at: -1.6, off: .1 }, { t: 'peasant', at: -1.9, off: -.15 }, { t: 'soldier', at: -2.2, off: .05 }], spd: .5, note: 'Foes behind the pack walk into the standing trees and are struck and pinned too.' },
    4: { note: 'The keep mends 3 lives; a green column rises at the keep.' },
    5: { probe: "WGM.dbg.some(d=>d.ev==='drag')", note: 'Every tree sheds its leaves, and as the forest sinks it drags its foes down.' } },
  seraphlance: {
    base: { dbg: 'SRL', cap: 9, sky: 3.2, probe: "SRL.dbg.some(d=>d.ev==='impact')" },
    0: { probe: null },
    1: { pack: swap(2, TOUGH()), note: 'The great lance is forged longer and brighter.' },
    2: { trail: TRAIL, note: 'It lands like a falling star: a 4-tile blast.' },
    3: { pack: BIG, note: 'Nine lances leave the wings after the great one.' },
    4: { note: 'The lances stay standing in their foes and hold them.' },
    5: { pack: BIG, note: 'Every lance from the wings strikes like a lesser great lance.' } },
  shatter: {
    base: { dbg: 'SHM', cap: 13, probe: "SHM.dbg.some(d=>d.ev==='break')" },
    0: { probe: null },
    1: { note: 'The break strikes harder; thicker shards with coloured edges.' },
    2: { probe: "SHM.dbg.some(d=>d.ev==='hold')", note: 'Foes stay held 1.2s after the break; the shards hang still at the top of their flight.' },
    3: { spd: .6, probe: "SHM.dbg.some(d=>d.ev==='twist')", note: 'The twist turns further and drags at the foes inside.' },
    4: { pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { frac: .3, tag: 'Worn down', tc: TAG.hp1 }) : p), probe: "SHM.dbg.some(d=>d.ev==='clean')", note: 'Three foes are worn down: the break leaves them under 25%, and they break apart with it.' },
    5: { probe: "SHM.dbg.some(d=>d.ev==='land')", note: 'The sheet of shards bursts up and rains back down on the foes.' } },
  vael: {
    base: { dbg: 'VTM', cap: 13.5, sky: 3.5, zmax: .95, probe: "VTM.dbg.some(d=>d.ev==='final')" },
    0: { probe: null },
    1: { note: 'The storm grows wilder faster: some 26 strikes.' },
    2: { pack: BIG, probe: "VTM.dbg.some(d=>d.ev==='arcs')", note: 'Every strike that lands arcs on into one or two foes nearby.' },
    3: { pack: BIG, note: 'Every foe in the storm joins the network, and it tears harder at them.' },
    4: { spd: .6, probe: "VTM.dbg.some(d=>d.ev==='recentre')", note: 'The pack walks on: the storm re-centres and glides after it.' },
    5: { cap: 16, trail: TRAIL, note: 'The final strike hits 1260% within 3.2 tiles; the crater stays live longer.' } },
  abyss: {
    /* the sea stands about 20s: windows of it */
    base: { zmin: .78, zmax: 1.05, dbg: 'ABM', hp: 200, from: 1.2, len: 14, cap: 13.5, sky: 3, probe: "ABM.dbg.some(d=>d.ev==='bite')" },
    0: { probe: null, note: 'The sea rises over the field and its leviathans hunt (the first 13 seconds of the cast).' },
    1: { note: 'Foes drown faster: streams of bubbles rise off every one.' },
    2: { spd: .5, note: 'The pack walks on: the sea slows it 70%.' },
    3: { note: 'The leviathans lunge more often, bite harder and reach further.' },
    4: { probe: "ABM.dbg.some(d=>d.ev==='bite')", note: 'A foe a leviathan bites drowns 50% faster, a column of bubbles rising from it.' },
    5: { from: null, len: null, cap: 26, probe: "ABM.dbg.some(d=>d.ev==='rise')", focus: { ev: 'rise', before: 1.5, after: 8 }, note: 'Halfway through the eldest leviathan bursts up out of the deep and joins the hunt (the clip joins it there).' } },
  citadel: {
    base: { zmin: .78, zmax: 1.05, dbg: 'CIM', hp: 120, from: 1.2, len: 14, cap: 13.5, probe: "CIM.dbg.some(d=>d.ev==='cut')" },
    0: { probe: null, note: 'The domain rises and its cuts begin (the first 13 seconds of the cast).' },
    1: { pack: PACK.map(p => Object.assign({}, p, { at: p.at * 2.4, off: p.off * 1.5 })), note: 'The foes are spread out: the domain reaches 6 tiles.' },
    2: { note: 'Each cut strikes harder, and harder in its wake.' },
    3: { spd: .6, note: 'The pack walks on: inside the domain it crawls.' },
    4: { note: 'Each cut aims at the foe nearest the keep no cut has struck yet, and throws it back.' },
    5: { from: null, len: null, cap: 24, probe: "CIM.dbg.some(d=>d.ev==='snap')", focus: { ev: 'snap', before: 2.5, after: 3.5 }, note: 'The final fracture tears across the domain (the clip joins it near its end).' } },
  expanse: {
    base: { zmin: .78, zmax: 1.05, dbg: 'IVM', hp: 120, from: 1.2, len: 14, cap: 13.5, probe: "IVM.dbg.some(d=>d.ev==='cut')" },
    0: { probe: null, note: 'The void swallows the land and its cuts begin (the first 13 seconds of the cast).' },
    1: { note: 'Every cut strikes harder, with wider, whiter strokes.' },
    2: { pack: BIG, note: 'Eleven foes: more cuts a second.' },
    3: { spd: .6, note: 'The pack walks on: in the void it crawls at 15%.' },
    4: { len: 15, pack: PACK.map((p, j) => j < 4 ? Object.assign({}, p, { frac: .25, tag: 'Worn down', tc: TAG.hp1 }) : p), probe: "IVM.dbg.some(d=>d.ev==='erase')", note: 'Four foes are worn down: a cut leaves them under 15%, and they are erased.' },
    5: { hp: 400, from: null, len: null, cap: 30, probe: "IVM.dbg.some(d=>d.ev==='great')", focus: { ev: 'great', before: 1.5, after: 5 }, note: 'In the last 3 seconds great screen-wide cuts, then one last cut on every foe as reality returns (the clip joins it there).' } },
  firsttree: {
    base: { zmin: .78, zmax: 1.05, dbg: 'ETM', hp: 120, from: 1.2, len: 14, cap: 13.5, probe: "ETM.dbg.some(d=>d.ev==='erupt')" },
    0: { probe: null, note: 'The tree rises and its roots begin to burst (the first 13 seconds of the cast).' },
    1: { note: 'Each eruption reaches further, with more root spikes.' },
    2: { note: 'The roots drink twice as much; motes of life fly to the trunk.' },
    3: { note: 'The roots burst more often and strike the same foe again sooner.' },
    4: { len: 16, pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { frac: .3, tag: 'Worn down', tc: TAG.hp1 }) : p), probe: "ETM.dbg.some(d=>d.ev==='swallow')", note: 'Three foes are worn down: the roots leave them under 20% and drag them under the earth.' },
    5: { from: null, len: null, cap: 30, probe: "ETM.dbg.some(d=>d.ev==='bloom')", focus: { ev: 'bloom', before: 2.5, after: 4 }, note: 'The world in bloom: the bloom strikes harder for every foe the roots drank from (the clip joins it there).' } },
  never: {
    base: { zmin: .78, zmax: 1.05, dbg: 'NVM', hp: 120, cap: 13.5, from: 1.2, len: 14, sky: 3, probe: "NVM.dbg.some(d=>d.ev==='star')" },
    0: { probe: null },
    1: { note: 'A shooting star every 0.36s, splashing wider.' },
    2: { note: 'Time stands still longer, and the foes held in it take 50% more.' },
    3: { probe: "NVM.dbg.filter(d=>d.ev==='lash').length>=3", note: 'Four stars lash more often, over a wider square.' },
    4: { spd: .6, towers: [{ t: 'archer', at: .3 }, { t: 'archer', at: -1.2, side: -1 }], note: 'Foes move 50% slower, and the archer towers attack 35% faster.' },
    5: { from: null, len: null, cap: 24, probe: "NVM.dbg.some(d=>d.ev==='great')", focus: { ev: 'fin', before: 2, after: 4 }, note: 'The last fall: the great stars land for real (the clip joins it there).' } },
  tempest: {
    base: { dbg: 'TPM', hp: 150, from: 1.2, len: 14, cap: 13.5, sky: 3.5, zmax: 1, probe: "TPM.dbg.some(d=>d.ev==='volley')" },
    0: { probe: null, note: 'The hurricane forms round the hero, its eye wall rising (the first 13 seconds of the cast).' },
    1: { probe: "TPM.dbg.some(d=>d.ev==='crown')", note: 'The crown bolt strikes every foe on the field and leaves them Charged.' },
    2: { pack: BIG, note: 'Every volley locks onto one more foe.' },
    3: { probe: "TPM.dbg.some(d=>d.ev==='leap')", note: 'Each precise strike leaps on further and harder.' },
    4: { probe: "TPM.dbg.some(d=>d.ev==='wall')", note: 'The lightning racing round the eye wall strikes the foes it passes.' },
    5: { from: null, len: null, cap: 24, trail: TRAIL, probe: "TPM.dbg.some(d=>d.ev==='fin')", focus: { ev: 'fin', before: 2, after: 3.5 }, note: 'The last thunder, and the hero’s fall rolls out over the whole field (the clip joins it there).' } },
  purgatory: {
    base: { zmin: .78, zmax: 1.05, dbg: 'PGM', hp: 120, from: 1.2, len: 14, cap: 13.5, probe: "PGM.dbg.some(d=>d.ev==='cut')" },
    0: { probe: null, note: 'The judgment gathers round the hero and its cuts begin (the first 13 seconds of the cast).' },
    1: { pack: PACK.map(p => Object.assign({}, p, { at: p.at * 2.2 })), note: 'The foes are spread along the road: the judgment reaches further.' },
    2: { from: 9.5, len: 20, cap: 11, note: 'The last stage begins at 13s and cuts faster (the clip joins it there).' },
    3: { probe: "PGM.dbg.some(d=>d.ev==='stare')", from: 6.5, len: 18.5, note: 'The six eyes stare: foes where they look are cut as if they stood close to the hero.' },
    4: { from: null, len: null, cap: 24, pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { frac: .35, tag: 'Worn down', tc: TAG.hp1 }) : p), probe: "PGM.dbg.some(d=>d.ev==='exec')", focus: { ev: 'exec', before: 3, after: 4 }, note: 'Three foes are worn down: a cut that leaves them under 8% cuts them down.' },
    5: { from: null, len: null, cap: 26, probe: "PGM.dbg.some(d=>d.ev==='last')", focus: { ev: 'last', before: 3, after: 3.5 }, note: 'The silence holds, then every foe takes one last cut (the clip joins it there).' } },
  bloodneedles: {
    base: { dbg: 'BNM', cap: 12, probe: "BNM.dbg.some(d=>d.ev==='hit')" },
    0: { probe: null },
    1: { note: 'Each needle strikes harder: longer, with brighter tips and trails.' },
    2: { spd: .6, note: 'The pack walks on: the needles fly faster and turn tighter, so few arrive late.' },
    3: { pack: swap(2, TOUGH()), note: 'A needle striking a foe already pierced strikes harder for every needle in it.' },
    4: { pack: [ONE({ at: 0 })], enter: [{ t: 'soldier', at: .3, off: .1, time: 2.9 }, { t: 'peasant', at: 0, off: -.1, time: 3.2 }, { t: 'soldier', at: -.3, off: .05, time: 3.5 }], probe: "BNM.dbg.some(d=>d.ev==='wait')", note: 'One foe with 1 HP: the first needle kills it, the rest wait glowing in the orbit, and fly at the foes that come next.' },
    5: { pack: swap(2, TOUGH({ tag: 'Strongest' })), probe: "BNM.dbg.some(d=>d.ev==='halo')", note: 'The orbit fills to 12 and, after 24 have flown, looses all at once at the strongest foe (the ram).' } },
  bloodeye: {
    base: { dbg: 'BEY', cap: 13.5, sky: 3.5, probe: "BEY.dbg.some(d=>d.ev==='lash')" },
    0: { probe: null },
    1: { pack: BIG, note: 'Eleven foes: the eye brands 7 within 10 tiles.' },
    2: { note: 'Branded foes take 40% more from everything, for 10s.' },
    3: { note: 'The blood lightning lashes every brand 7 times.' },
    4: { pack: BIG.map((p, j) => j < 3 ? Object.assign({}, p, { frac: .08, tag: 'Low HP', tc: TAG.hp1 }) : p), probe: "BEY.dbg.some(d=>d.ev==='move')", note: 'Three foes are low on health: when a branded foe dies the gaze swings to the strongest unbranded one.' },
    5: { probe: "BEY.dbg.some(d=>d.ev==='last')", note: 'Before the lids close, one great lash strikes every brand at once.' } },
  moonfall: {
    base: { dbg: 'MFM', cap: 12.5, sky: 4, probe: "MFM.dbg.some(d=>d.ev==='impact')" },
    0: { probe: null },
    1: { pack: PACK.map(p => Object.assign({}, p, { at: p.at * 2, off: p.off * 1.6 })), note: 'The foes are spread out: the fuller moon’s impact reaches 4.6 tiles.' },
    2: { trail: TRAIL, note: 'The crater of molten blood spreads wider and burns longer; foes behind walk into it.' },
    3: { pack: PACK.concat([{ t: 'soldier', at: 2.8, off: .1 }, { t: 'peasant', at: -3.2, off: -.1 }]), probe: "MFM.dbg.some(d=>d.ev==='shard')", note: 'The moon’s 16 shards are thrown at the foes round the crater.' },
    4: { spd: .7, probe: "MFM.dbg.some(d=>d.ev==='slow')", note: 'The pack walks on: under the falling moon’s shadow it slows.' },
    5: { trail: [{ t: 'soldier', at: -5, off: .1 }, { t: 'peasant', at: -6.5, off: -.12 }, { t: 'soldier', at: -8, off: .05 }], probe: "MFM.dbg.some(d=>d.ev==='wave')", note: 'Moonbreaker: a wave of blood rolls out to 10.6 tiles and strikes the foes further back.' } },
  constellation: {
    base: { dbg: 'CSM', cap: 9.5, sky: 3.5, probe: "CSM.dbg.some(d=>d.ev==='fall')" },
    0: { probe: null },
    1: { note: 'The stars burn larger and fall as thicker lances.' },
    2: { pack: BIG, note: 'Eleven foes: the figure kindles over the 8 strongest.' },
    3: { trail: TRAIL, note: 'The lines burn wider and stay alight: foes behind walk onto them.' },
    4: { spd: .55, probe: "CSM.dbg.some(d=>d.ev==='hold')", note: 'The pack walks on: each foe under a star is held there until it falls.' },
    5: { cap: 11, probe: "CSM.dbg.some(d=>d.ev==='twice')", note: 'When the lines have burnt the figure kindles again and falls a second time.' } },
  bloodcurse: {
    base: { dbg: 'BCM', hp: 160, cap: 15.5, zmax: 1, probe: "BCM.dbg.some(d=>d.ev==='erupt')" },
    0: { probe: null },
    1: { pack: PACK.map(p => Object.assign({}, p, { at: p.at * 2, off: p.off * 1.6 })), note: 'The opening blast reaches 5 tiles.' },
    2: { note: 'Every eruption strikes harder, its columns taller and hotter.' },
    3: { note: 'Each stage of the escalation grows the eruptions 18%.' },
    4: { note: 'Each greater scroll the curse seals on the hero makes every eruption stronger.' },
    5: { probe: "BCM.dbg.some(d=>d.ev==='plunge')", note: 'The final eruption is half again as large, and the blast after it strikes 1500%.' } },
  pulsar: {
    /* the star burns about 15s, then implodes: windows of it */
    base: { dbg: 'PSM', hp: 120, from: 1.2, len: 12.5, cap: 12, probe: "PSM.dbg.some(d=>d.ev==='hit')" },
    0: { probe: null, note: 'The neutron star rises and its beam sweeps its ring (the first 11 seconds of the cast).' },
    1: { note: 'Every beam hit strikes harder; the beams burn thicker.' },
    2: { note: 'Every phase comes sooner and the star spins faster.' },
    3: { note: 'The second beam tips down and sweeps a second, smaller ring.' },
    4: { spd: .5, probe: "PSM.dbg.some(d=>d.ev==='sear')", note: 'The pack walks on over the burnt ground: it sears them.' },
    5: { from: null, len: null, cap: 24, probe: "PSM.dbg.some(d=>d.ev==='blast')", focus: { ev: 'imp', before: 2.5, after: 4 }, note: 'Supernova: the implosion draws the rings in, and the blast reaches 8.5 tiles (the clip joins it there).' } },
  singularity: {
    base: { dbg: 'SGM', hp: 120, cap: 16.5, sky: 3.5, zmax: 1, probe: "SGM.dbg.some(d=>d.ev==='grip')" },
    0: { probe: null },
    1: { note: 'The hole takes hold sooner and holds longer, drawn larger.' },
    2: { note: 'The drain tears harder at the pinned foes.' },
    3: { pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { frac: .2, tag: 'Low HP', tc: TAG.hp1 }) : p), probe: "SGM.dbg.some(d=>d.ev==='feed')", note: 'Three foes are low on health: each that dies while pinned feeds the hole.' },
    4: { probe: "SGM.dbg.some(d=>d.ev==='rock')", note: 'Rocks tear up from beneath every pinned foe, one a second.' },
    5: { trail: TRAIL, probe: "SGM.dbg.some(d=>d.ev==='collapse')", note: 'The collapse strikes every foe on the map for 500%.' } },
  wormhole: {
    base: { dbg: 'WHM', cap: 14, zmax: 1.05, follow: 'foes', probe: "WHM.dbg.some(d=>d.ev==='cross')" },
    0: { probe: null },
    1: { pack: PACK.map((p, j) => j % 2 ? Object.assign({}, p, { off: p.off + (p.off > 0 ? .5 : -.5) }) : p), note: 'Foes at the road’s edges: the first wormhole yawns wider and draws in every foe within 1.6 tiles.' },
    2: { trail: TRAIL, note: 'The wormholes stay open longer, so the foes further back walk in too.' },
    3: { note: 'Every foe that goes through is struck and thrown 16 tiles back.' },
    4: { pack: swap(2, { t: 'ogre', hp: 120, tag: 'Boss', tc: TAG.tough }), probe: "WHM.dbg.some(d=>d.ev==='cross'&&d.boss)", note: 'The boss (an Ogre) goes through too, and comes out 5 tiles back, slowed.' },
    5: { pack: PACK.slice(0, 3), trail: [{ t: 'soldier', at: -3.6, off: .1, spd: .12 }, { t: 'peasant', at: -3.9, off: -.15, spd: .12 }], probe: "WHM.dbg.some(d=>d.ev==='last')", note: 'Slow foes still short of the mouth as it closes: it swallows them, then both wormholes collapse.' } },
};

exports.crf = 26;
exports.scrolls = () => ['hexspark', 'lightbolt', 'wither', 'emberbolt', 'gravebind', 'frostshard', 'staticspark', 'cinders', 'flamelash', 'thunderclap', 'thornwhip',
  'darkpulse', 'beam', 'grasp', 'lantern', 'graveburst', 'rimebloom', 'balllightning', 'sunflare', 'catchflame', 'firewall', 'bramble',
  'deflect', 'riftfang', 'stormcloud', 'verdict', 'icetomb', 'geyser', 'crows', 'firetornado', 'frostwolves', 'roots'];
/* v439: the Epic and Legendary scrolls (their masteries are in developer mode); `node record.js epic legendary` records them all */
exports.epic = () => ['loop', 'judgment', 'cataclysm', 'phoenix', 'comet', 'wyrm', 'prism', 'treant'];
exports.legendary = () => ['compress', 'voidfall', 'stormcaller', 'chronostasis', 'skyfall', 'glacialrift', 'harvest', 'dslash', 'bloom'];
/* v475: the Mythic, Ancient and Secret scrolls (developer mode too); `node record.js mythic ancient secret` records them all */
exports.mythic = () => ['eclipse', 'embertitan', 'eternalwinter', 'aeon', 'gaia', 'seraphlance', 'shatter', 'vael'];
exports.ancient = () => ['abyss', 'citadel', 'expanse', 'firsttree', 'never', 'tempest', 'purgatory'];
exports.secret = () => ['bloodneedles', 'bloodeye', 'moonfall', 'constellation', 'bloodcurse', 'pulsar', 'singularity', 'wormhole'];
const EL = new Set(exports.epic().concat(exports.legendary()));
const HI = new Set(exports.mythic().concat(exports.ancient(), exports.secret()));
exports.get = (k, L) => { const s = S[k] || {}; return Object.assign({}, DEF, EL.has(k) ? { hp: 30 } : {}, HI.has(k) ? { hp: 60, cap: 14, live: true, crf: 29 } : {}, s.base || {}, s[L] || {}); };
exports.S = S; exports.TAG = TAG;
