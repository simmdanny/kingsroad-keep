# Mastery contact-sheet scripts (Mythic, Ancient, Secret)

Reference only, for recording the Mythic/Ancient/Secret preview clips (v475). These are the scripts each mastery builder used to check
their scroll by eye (v451-v473): they stage foes, set the camera, cast at a chosen mastery level and save one JPEG grid of frames.
They are not part of the game or the test suite, and nothing in `src/`, `dist/` or `tests/` uses them.

## Running one

1. Serve the repo root: `python3 -m http.server 8771 -d <repo>` (any port; pass it as `KK_PORT`).
2. Where cdnjs is blocked: `npm i --no-save three@0.128.0` in the repo root. `harness.js` then serves Three.js r128 from
   `node_modules` (as `tests/headless.js` does) and skips Google Fonts.
3. From the scroll's folder: `KK_PORT=8771 node shots.js <level> <name> <zoom> <t1,t2,...> [more]`. The arguments are in each
   script's first comment. `<name>.jpg` is written in the folder you run it from.

Most scripts take times in seconds after `fireScroll`. Mythic, Ancient and Secret casts arrive 1 s after it, so a spell's own time is t-1.
Each header says which convention that script uses. Environment knobs (`CROP`, `DX`/`DZ` camera offset, `SEED` map seed and the like) are
also listed in the headers.

## Folders

| Folder | Scroll | Version | Script(s) |
|---|---|---|---|
| myth-eclipse | Eclipse of the Damned | v451 | shots.js |
| myth-embertitan | Wrath of the Ember Titan | v452 | shots.js |
| myth-winter | Eternal Winter | v453 | ew-shots.js |
| myth-aeon | The Aeon Dial | v454 | shots.js, glintshot.js (M4 glint close-up), passshot.js (close-up as the hand passes a foe) |
| myth-gaia | Wrath of Gaia | v455 | shots.js |
| myth-seraph | Lance of the Seraph | v456 | shots.js |
| myth-shatter | Spatial Shatter | v457 | shots.js |
| myth-vael | Vael'Thoruun | v458 | shots.js |
| anc-abyss | Abyssal Genesis | v459 | shots.js |
| anc-citadel | Citadel of Orders | v460 | cim-shots.js, cim-shots-pre.js |
| (none) | Infinite Void | v461 | no script was kept |
| anc-tree | The Eldritch Tree | v462 | shots.js |
| anc-never | Never-Never Land | v463 | shots.js |
| anc-purgatory | Crimson Purgatory | v464 | pgm-shots.js |
| anc-tempest | The Primordial Tempest | v465 | tp-shots.js |
| sec-needles | Blood Needles | v466 | shots.js |
| sec-eye | Eye of the Blood Moon | v467 | eye-shots.js |
| sec-moonfall | Moonfall | v468 | shots.js |
| sec-curse | Curse of the Blood Moon | v469 | shots.js |
| sec-constellation | Constellation | v470 | shots.js |
| sec-pulsar | Pulsar | v471 | psm-shots.js |
| sec-singularity | Singularity | v472 | shots.js |
| sec-wormhole | Wormhole | v473 | shots.js |

## Things that matter when recording these spells

- **Long casts outlive `cineLock`,** and the mastery preview waits on `SMPV_BUSY` for them:

  | Spell | Length |
  |---|---|
  | Pulsar | about 23.4 s |
  | Infinite Void | 25.6 s |
  | Singularity | about 12.5 s |
  | Moonfall's crater | 10.2 s |
  | Wormhole | 9.2 s (10.9 s from Mastery 2) |

  Constellation's Mastery 5 falls twice.
- **`cineLock` and `SPACE_T` count down only in `anim()`.** A recorder that steps only `update`/`updFx` sees them frozen.
- **Wormhole:**
  - Standing foes never cross. Foes must walk the lead road into the first mouth.
  - Mastery 1 (Hungry Mouth) only shows where a second road passes near the mouth: board 777 at board version 5, where the roads merge.
- **Singularity:** Mastery 3 (Accretion) only shows when foes die while pinned, so put a few light foes in the pack.
- **Pulsar:**
  - Its ring always passes through its target foe, and the placement is random. The script prints the placement it used, so it can be reused at every level.
  - With its sweep fix, 0.05 s steps strike nearly as often as 60 fps (about 30 strikes on a foe on the ring against 32).
- **Infinite Void** dissolves the land round the board and restores it afterwards. Check that a clip starts with the land back.
- **Big finales fill most of the screen for 0.2-0.6 s at every level, Mastery 0 included.** These are Pulsar, Singularity and Curse of the Blood Moon. Normal zoom reads best.
- **The Tempest's hurricane** lifts the hero higher, so leave vertical room in the frame.
- **Lessons from the Epic/Legendary clips:**
  - Use `trackHero` for casts that drift.
  - Widen `zmin`/`zmax` or `cx` when the far filter drops rings (the judgment-5 issue).
