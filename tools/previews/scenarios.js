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
//   zoom   camera distance (1 = the old preview's)   fw  how far the camera leans from the hero to the pack (0..1)   look  where the pack is then
//   len    a fixed clip length (s), else it ends when the scroll's effects are done
//   probe  must be true at the end, or the next seed is tried (chance-based masteries)      note  the caption under the clip
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
const DEF = { hero: 'aldric', st: STAGE, spd: .32, hp: 12, castAt: .6, fw: .6, look: 1.2, zoom: .56, pack: PACK, trail: [], note: '' };
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
    2: { casts: [.6, 1.8], spy: ['lbBeam'], probe: 'PVR.ev.lbBeam>0', note: 'Two bolts in a row: the second light hit on the marked foe calls down the beam.' },
    5: { cnt: 3, spy: ['lbSunBurst'], probe: 'PVR.ev.lbSunBurst>0', note: 'This is the 4th bolt: a small sun.' } },
  wither: {
    base: { trail: TRAIL },
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
    4: { pack: withFly(-.3), note: 'The wall of dark energy strikes flyers too.' },
    5: { zoom: .64 } },
  beam: { 2: { zoom: .62 }, 3: { zoom: .62 }, 4: { zoom: .6 }, 5: { zoom: .64 } },
  grasp: { 5: { zoom: .62 } },
  lantern: {
    4: { pack: ONES(2), spy: ['slmSoul'], probe: 'PVR.ev.slmSoul>0', note: 'Two foes have 1 HP: the lantern kills them and gathers their souls for a stronger beam.' } },
  graveburst: { base: { trail: TRAIL }, 5: { zoom: .64 } },
  rimebloom: {
    base: { trail: TRAIL },
    3: { also: [{ k: 'frostshard', at: 1.9 }], spy: ['rbmShatter'], probe: 'PVR.ev.rbmShatter>0', note: 'A Frost Shard follows the bloom and shatters a Brittle foe.' } },
  balllightning: {},
  sunflare: { 5: { zoom: .6 } },
  catchflame: {
    base: { pack: BIG },
    2: { pack: BIG.map((p, j) => j === 0 ? Object.assign({}, p, ONE()) : p), spy: ['cfmBackdraftFx'], probe: 'PVR.ev.cfmBackdraftFx>0', note: 'The marked foe has 1 HP: it dies burning and erupts.' },
    5: { pack: BIG, spy: ['cfmErupt'], probe: 'PVR.ev.cfmErupt>0', note: 'Eleven foes, so the fire can reach its tenth.' } },
  firewall: {
    base: { trail: TRAIL },
    4: { spy: ['wofBlast'], probe: 'PVR.ev.wofBlast>0', note: 'Six foes cross the wall, so it releases its blast.' },
    5: { zoom: .6 } },
  bramble: { base: { trail: TRAIL } },
  /* ---- Rare ---- */
  deflect: { base: { zoom: .64 } },
  riftfang: { 4: { pack: withFly(-.3), note: 'The blackglass spears hit flyers too.' } },
  stormcloud: {
    base: { pack: swap(5, TOUGH({ tag: 'Strongest' })), zoom: .62, note: 'One cloud gathers over the leading foe, one over the strongest (the ram).' },
    2: { pack: swap(5, TOUGH({ tag: 'Strongest' })).concat([FLY({ at: .1, off: 0 })]), spy: ['scmFork'], probe: 'PVR.ev.scmFork>0' },
    3: { spy: ['scmClap'], probe: 'PVR.ev.scmClap>0' },
    4: { spy: ['scmLink'], probe: 'PVR.ev.scmLink>0' },
    5: { spy: ['scmFinale'], probe: 'PVR.ev.scmFinale>0' } },
  verdict: {
    2: { trail: TRAIL, note: 'Foes behind the pack cross the scar.' },
    5: { pack: withFly(-.2), note: 'The second beam hits flyers too.' } },
  icetomb: { base: { pack: swap(2, TOUGH({ tag: 'Strongest' })), note: 'The ram is the strongest foe: the tomb always takes the strongest.' } },
  geyser: { base: { zoom: .62, trail: TRAIL } },
  crows: {},
  firetornado: { base: { zoom: .62 } },
  frostwolves: { 5: { pack: swap(2, TOUGH({ tag: 'Strongest' })), note: 'At the end both wolves leap at the strongest foe, the ram.' } },
  roots: {},
};

exports.crf = 33;
exports.scrolls = () => ['hexspark', 'lightbolt', 'wither', 'emberbolt', 'gravebind', 'frostshard', 'staticspark', 'cinders', 'flamelash', 'thunderclap', 'thornwhip',
  'darkpulse', 'beam', 'grasp', 'lantern', 'graveburst', 'rimebloom', 'balllightning', 'sunflare', 'catchflame', 'firewall', 'bramble',
  'deflect', 'riftfang', 'stormcloud', 'verdict', 'icetomb', 'geyser', 'crows', 'firetornado', 'frostwolves', 'roots'];
exports.get = (k, L) => { const s = S[k] || {}; return Object.assign({}, DEF, s.base || {}, s[L] || {}); };
exports.S = S; exports.TAG = TAG;
