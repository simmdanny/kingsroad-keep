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
    1: { note: 'The fold always reaches 8 tiles back: the foes that reach it walk out far up the road.' },
    2: { note: 'Each foe the fold sends back is sheared where it goes in and where it comes out.' },
    3: { spd: 1.7, len: 10.2, note: 'Fast foes, so they go round the 8-tile loop more than once: each lap hurts more.' },
    4: { towers: [{ t: 'archer', at: -5 }, { t: 'archer', at: -1, side: -1 }], note: 'Archer towers shoot the foes the fold sent back: they take more from everything for 3s.' },
    5: { len: null, cap: 11.8, probe: "LPM.dbg.some(d=>d.ev==='snap')", note: 'The fold holds 10 seconds; when it lets go the looped road snaps back.' } },
  judgment: {
    2: { also: [{ k: 'lightbolt', at: 1.5 }], note: 'A Light Bolt follows: light scrolls hit the Condemned foes harder.' },
    3: { pack: swap(5, TOUGH({ tag: 'Strongest' })), note: 'The ram is the strongest foe in reach: the second line goes for it.' },
    4: { pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { hp: 40, frac: .2, tag: 'Low HP', tc: TAG.hp1 }) : p), note: 'Three foes are under a quarter of their health: the line hits them harder and they fall.' },
    5: { pack: swap(2, TOUGH({ tag: 'Strongest' })), note: 'A pillar of light falls on the strongest foe it pierced, the ram.' } },
  cataclysm: {
    base: { dbg: 'CCM' },
    1: { pack: swap(4, TOUGH()), note: 'The ram is the toughest foe inside the rune: a pillar rises right under it.' },
    4: { towers: [{ t: 'archer', at: .4 }, { t: 'cannon', at: -1.2, side: -1 }], len: 7, note: 'An archer tower and a cannon hit the Sundered foes harder.' },
    5: { pack: swap(4, TOUGH()).concat([TOUGH({ t: 'knight', hp: 34, at: 2.3, off: .1, tag: 'Tough' })]), probe: "CCM.dbg.some(d=>d.ev==='wb')", note: 'The pillars spin up and slam down on the toughest foes nearby.' } },
  phoenix: {
    base: { dbg: 'PHM' },
    1: { pack: BIG, note: 'Eleven foes: each one it strikes makes it bigger and hotter.' },
    2: { note: 'As it climbs away a front of flame races back along its river of fire.' },
    3: { pack: swap(3, TOUGH()), probe: "PHM.dbg.some(d=>d.ev==='feather')", note: 'Its burst becomes burning feathers that dart at the foes it struck, the toughest (the ram) first.' },
    4: { probe: "PHM.dbg.some(d=>d.ev==='pyre')", note: 'Its fire erupts on foes that are already burning.' },
    5: { probe: "PHM.dbg.some(d=>d.ev==='reborn')", note: 'Reborn from a pyre, larger and golden, it skims the road and dives where the foes are thickest.' } },
  comet: {
    base: { dbg: 'FCM' },
    1: { spd: .8, note: 'The pack walks briskly: the comet steers onto where it will be.' },
    2: { trail: TRAIL, note: 'Foes still marching in under its tail.' },
    4: { towers: [{ t: 'frost', at: .2 }], len: 7, probe: "FCM.dbg.some(d=>d.ev==='fault')", note: 'A Frost Spire’s ice shatters the fractured foes.' },
    5: { pack: PACK.concat([TOUGH({ at: 2.6, off: 0 })]), probe: "FCM.dbg.some(d=>d.ev==='rebound')", note: 'The heart bursts out of the crater and smashes into the toughest foe nearby, the ram.' } },
  wyrm: {
    base: { dbg: 'WYM' },
    2: { pack: PACK.slice(0, 3).concat(PACK.slice(3).map(p => Object.assign({}, p, { at: p.at - 2.4 }))), note: 'Two knots of foes with empty road between: it lingers in each and darts across the gap.' },
    3: { pack: swap(2, TOUGH()), probe: "WYM.dbg.some(d=>d.ev==='squeeze')", note: 'It seizes the toughest foe near its head, the ram, and squeezes it.' },
    4: { probe: "WYM.dbg.some(d=>d.ev==='ground')", note: 'Each lash leaves a charge mark; its strike grounds through every marked foe.' } },
  prism: {
    base: { dbg: 'PRM' },
    2: { spd: .55, note: 'The pack walks on: the prism drifts after it.' },
    4: { probe: "PRM.dbg.some(d=>d.ev==='full')", note: 'Foes swept by all six colours burst with them.' } },
  treant: {
    /* the oak walks for 10s (it is not an effect the recorder counts): every clip holds it */
    base: { dbg: 'TRM', minLen: 9.5, zmin: .66 },
    2: { spd: .55, note: 'The foes walk into the oak and are held against its bark.' },
    3: { trail: [{ t: 'soldier', at: -3.1, off: .1 }, { t: 'peasant', at: -3.4, off: -.15 }, { t: 'soldier', at: -3.7, off: .05 }, { t: 'knight', at: -4.0, off: -.05 }], probe: "TRM.dbg.some(d=>d.ev==='boulder'||d.ev==='hurl')", note: 'A second knot of foes further back: every third slam it hurls a boulder at it.' },
    4: { also: [{ k: 'roots', at: .25 }], probe: "TRM.dbg.some(d=>d.ev==='sap')", note: 'Entangling Roots first: the foes are Overgrown, and the oak drains them and grows.' },
    5: { cap: 12.5, probe: "TRM.dbg.some(d=>d.ev==='timber')", note: 'At the end of its 10 seconds it topples forward along the road.' } },
  compress: {
    base: { dbg: 'CPM', cap: 10.5 },
    1: { pack: PACK.map(p => Object.assign({}, p, { at: p.at * 2.3, off: p.off * 1.6 })), note: 'The foes are spread out: the squeeze draws them together.' },
    3: { probe: "CPM.dbg.some(d=>d.ev==='sat')", note: 'Its two smaller squeezes snap first.' },
    5: { probe: "CPM.dbg.some(d=>d.ev==='star')", note: 'A star of pressed light bursts after the snap.' } },
  voidfall: {
    base: { dbg: 'VFM', sky: 4 },
    1: { spd: .65, pack: PACK.concat([{ t: 'soldier', at: 1.0, off: .1 }, { t: 'peasant', at: 1.35, off: -.12 }]), probe: "VFM.dbg.some(d=>d.ev==='well')", note: 'The front of the pack has walked past the impact: the sphere drags it back.' },
    4: { towers: [{ t: 'archer', at: 0 }, { t: 'archer', at: -1.5, side: -1 }], probe: "VFM.dbg.some(d=>d.ev==='release')", note: 'Archer towers shoot the Hollowed foes; the void gives a share back at once when it ends.' },
    5: { probe: "VFM.dbg.some(d=>d.ev==='crush')", note: 'A second sphere holds the lifted foes in the air, then implodes.' } },
  stormcaller: {
    /* the storm covers the whole map: the view follows the foes it hits */
    base: { dbg: 'STC', follow: 'hits', zmax: .9, pack: BIG },
    1: { probe: "STC.dbg.some(d=>d.ev==='seek')", note: 'Bolts that would land near a foe bend onto it.' },
    2: { probe: "STC.dbg.some(d=>d.ev==='soakArc')", note: 'Its clouds rain: a bolt on a Soaked foe runs through the water to the others.' },
    3: { probe: "STC.dbg.some(d=>d.ev==='roll')", note: 'The thunder of each strike rolls along the road.' },
    4: { trail: TRAIL, from: 7.3, cap: 4.6, probe: "STC.dbg.some(d=>d.ev==='frontHit')", note: 'The clip joins the storm at 7s: from 8s to 11s it marches down the road as a front of bolts.' },
    5: { from: 13.6, cap: 5.4, probe: "STC.dbg.some(d=>d.ev==='last')", note: 'The clip joins the storm near its end: its clouds draw into one thunderhead for a last colossal bolt.' } },
  chronostasis: {
    base: { dbg: 'CTM', cap: 11.6 },
    1: { len: 4.6, probe: "CTM.dbg.some(d=>d.ev==='rewind')", note: 'As time breaks every foe inside is wound back along the road.' },
    2: { len: 6.2, probe: "CTM.dbg.some(d=>d.ev==='hand')", note: 'A great clock hand sweeps the field every 2 seconds.' },
    3: { from: 6.6, cap: 5.4, probe: "CTM.dbg.some(d=>d.ev==='echo')", note: 'The clip joins the field late: as time catches up the echoes rush back into their foes.' },
    4: { len: 6.6, towers: [{ t: 'archer', at: .3 }, { t: 'archer', at: -1.2, side: -1 }], probe: "CTM.dbg.some(d=>d.ev==='haste')", note: 'Archer towers that reach into the field shoot 30% faster.' },
    5: { from: 8.2, cap: 5.2, probe: "CTM.dbg.some(d=>d.ev==='second')", note: 'The clip joins near the end: the collapse, then its ghost collapses again.' } },
  skyfall: { base: { dbg: 'SKM' }, 3: { probe: "SKM.dbg.some(d=>d.ev==='rico')" }, 5: { probe: "SKM.dbg.some(d=>d.ev==='ext')" } },
  glacialrift: {
    base: { dbg: 'GRM', follow: 'hits' },
    1: { enter: [{ t: 'soldier', at: -3.0, off: .1, spd: 1.5, time: 3.0 }, { t: 'peasant', at: -3.4, off: -.15, spd: 1.5, time: 3.0 }, { t: 'soldier', at: -3.8, off: .05, spd: 1.5, time: 3.0 }],
      probe: "GRM.dbg.some(d=>d.ev==='statue')", note: 'The frozen foes stand as ice statues; foes walking up behind them are stopped until they thaw.' },
    2: { probe: "GRM.dbg.some(d=>d.ev==='push')", note: 'The wave drags each foe a tile back up the road.' },
    3: { probe: "GRM.dbg.some(d=>d.ev==='calve')", note: 'Slabs of ice break off the ridge and crash onto the road.' },
    4: { pack: PACK.concat([FLY({ at: -.3 })]), trail: [{ t: 'soldier', at: -8.6, off: .1 }, { t: 'peasant', at: -9.0, off: -.12 }], probe: "GRM.dbg.some(d=>d.ev==='cold')", note: 'Rime gathers on every foe in the blizzard, even far behind the rift, until it freezes solid.' },
    5: { probe: "GRM.dbg.some(d=>d.ev==='slam')", note: 'As the ridge shatters the rift tears open and its fangs slam shut.' } },
  harvest: {
    base: { dbg: 'GHM' },
    1: { pack: PACK.map((p, j) => j % 2 ? Object.assign({}, p, { hp: 40, frac: .2, tag: 'Low HP', tc: TAG.hp1 }) : p), probe: "GHM.dbg.some(d=>d.ev==='cull')", note: 'Three foes are low on health: the scythe leaves them under 15% and they are reaped outright.' },
    2: { pack: ONES(3), probe: "GHM.dbg.some(d=>d.ev==='swarm')", note: 'Three foes have 1 HP: the first sweep reaps them and their souls hurl out on the backhand.' },
    3: { pack: PACK.map((p, j) => j % 2 ? Object.assign({}, p, { hp: 40, frac: .32, tag: 'Low HP', tc: TAG.hp1 }) : p), probe: "GHM.dbg.some(d=>d.ev==='creep')", note: 'Low-health foes die withering, and burst into new clouds of Wither.' },
    4: { pack: ONES(3), also: [{ k: 'darkpulse', at: 4.4 }], probe: "GHM.dbg.some(d=>d.ev==='spend')", note: 'The souls stay with the hero; the next scroll (a Dark Pulse) takes them and is stronger.' },
    5: { pack: swap(2, TOUGH({ tag: 'Strongest' })), probe: "GHM.dbg.some(d=>d.ev==='toll')", note: 'A skeletal hand rises under the strongest foe, the ram, and tears its soul out.' } },
  dslash: {
    4: { pack: PACK.map((p, j) => j < 3 ? Object.assign({}, p, { hp: 40, frac: .25, tag: 'Low HP', tc: TAG.hp1 }) : p), note: 'Three foes are under 30% of their health: the cut hits them harder.' } },
  bloom: {
    base: { dbg: 'HYB' },
    1: { pack: PACK.slice(0, 4).concat([{ t: 'soldier', at: 2.9, off: .1, spd: .45 }, { t: 'peasant', at: 3.3, off: -.12, spd: .45 }, { t: 'soldier', at: -3.0, off: .05, spd: .45 }, { t: 'knight', at: -3.4, off: -.1, spd: .45 }]),
      probe: "HYB.dbg.some(d=>d.ev==='lure')", note: 'Foes past the flower turn back to it; foes behind it hurry on.' },
    2: { towers: [{ t: 'archer', at: .3 }], probe: "HYB.dbg.some(d=>d.ev==='share')", note: 'An archer tower shoots a bound foe: a quarter of each arrow runs along the vines.' },
    3: { probe: "HYB.dbg.some(d=>d.ev==='petal')", note: '16 razor petals whirl out of the burst and slice into the foes.' },
    4: { spd: .6, probe: "HYB.dbg.some(d=>d.ev==='haze')", note: 'The pack walks on through the pollen: the cloud drifts with it.' },
    5: { pack: PACK.concat([{ t: 'soldier', at: 2.6, off: .1 }, { t: 'peasant', at: -2.8, off: -.1 }]), probe: "HYB.dbg.some(d=>d.ev==='sprout')", note: 'The flower goes to seed: seeds drift onto the foes and sprout small blooms.' } },
};

exports.crf = 33;
exports.scrolls = () => ['hexspark', 'lightbolt', 'wither', 'emberbolt', 'gravebind', 'frostshard', 'staticspark', 'cinders', 'flamelash', 'thunderclap', 'thornwhip',
  'darkpulse', 'beam', 'grasp', 'lantern', 'graveburst', 'rimebloom', 'balllightning', 'sunflare', 'catchflame', 'firewall', 'bramble',
  'deflect', 'riftfang', 'stormcloud', 'verdict', 'icetomb', 'geyser', 'crows', 'firetornado', 'frostwolves', 'roots'];
/* v439: the Epic and Legendary scrolls (their masteries are in developer mode); `node record.js epic legendary` records them all */
exports.epic = () => ['loop', 'judgment', 'cataclysm', 'phoenix', 'comet', 'wyrm', 'prism', 'treant'];
exports.legendary = () => ['compress', 'voidfall', 'stormcaller', 'chronostasis', 'skyfall', 'glacialrift', 'harvest', 'dslash', 'bloom'];
const EL = new Set(exports.epic().concat(exports.legendary()));
exports.get = (k, L) => { const s = S[k] || {}; return Object.assign({}, DEF, EL.has(k) ? { hp: 30 } : {}, s.base || {}, s[L] || {}); };
exports.S = S; exports.TAG = TAG;
