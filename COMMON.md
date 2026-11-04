## Shared rules for the six elite/formation workers (read all of it)
Kingsroad Keep (repo simmdanny/kingsroad-keep) is a single-file browser tower defence by Simon (use they/them). Six workers run in parallel on the elite modifiers and formations, each on its own branch. The integrator is session session_01MxMDcKBZKdtnVWPQtTdWV5 (send_message to it, or "@parent" if it created you). It merges the branches; you never do.

### Setup
- `git fetch origin elite-base && git checkout -B <your branch> origin/elite-base`. elite-base (v479) is test-everything plus a refactor: each modifier's look is its own function. See `const ELD={}` in src/kingsroad-keep.html and the README section "Elite looks, one builder per modifier (v479)".
  - `ELD[affix](C)` builds the gear, with `C={type,variant,affs,B,g,fx,fz,tw,plate,rivets,body}`.
  - `ARMOR_D[type](C)` holds per-unit armour; `armorClass(C)` is the old class template.
  - `ELA[affix](fx,t,dt,moving,e)` animates; `e` is null in the Bestiary.
  - `ELP[affix](e,fx,dt)` emits in-game particles, and `eliteRing(a,i)` makes the marker under the foe.
- The game is `src/kingsroad-keep.html`: about 35k lines, many of them very long. Use `grep -n ... | cut -c1-300` and `sed -n a,bp`; never dump whole lines.
  - `python3 build.py` writes `dist/kingsroad-keep.html`, which must stay pure ASCII: `LC_ALL=C grep -c -P '[^\x00-\x7F]' dist/kingsroad-keep.html` must print 0.
  - Write non-ASCII as \u escapes inside JS strings.
- **Tests:**
  - Start the server as its own statement: `python3 -m http.server PORT -d "$PWD" >/dev/null 2>&1 &`, then `SV=$!`. Run `KK_PORT=PORT node tests/headless.js <suite> ...`, then `kill $SV`.
  - With no suite names it runs the full suite, about 15 minutes. `ALL=1` prints the passing rows too.
  - If `node_modules/three` is missing, run `npm i --no-save three@0.128.0`; cdnjs is blocked.
  - Never `pkill -f` a pattern that appears in your own command line.
  - Known flaky suites: wither, smsets (alone), dev, bmprev. Rerun one alone before worrying.
- **Your test file:** follow the style of `tests/elb-test.js` and `tests/gmx-test.js`: an IIFE returning `JSON.stringify` of `[name, ok, detail]` rows that puts the account and world back afterwards.
  - Register it in `tests/run-all.js`: put its name at the END of the suite list.
  - Add its detector at the FRONT of the build-detector chain: `typeof <a function unique to your module>==='function'?'vNNN':`.
- **Code placement:**
  - Put your module right before `/* ================= Performance (v446)` as ONE block, with a header comment: Simon's request quoted, your design, your numbers.
  - Change looks by assigning `ELD.*`, `ELA.*`, `ELP.*` and `ARMOR_D.*` from your module, and change game functions with wrappers: `{const x=fn;fn=function(){...x.apply(this,arguments)...};}`. Edit shared base lines only where you must, because six branches have to merge.
  - Run gameplay on game time (`update`, `addFx`), never `setTimeout`.
- **Docs:**
  - Add a CLOG entry at the TOP of `const CLOG=[` in plain, player-facing words: `{t:'...',d:'4 Nov',v:'vNNN',li:[...]}`.
  - Append a README section at the end: `## <Title> (vNNN)`. README.md uses CRLF line endings, so append in Python bytes mode, converting \n to \r\n.

### Simon's standing rules
- "NO LOW EFFORT EFFECTS ARE ACCEPTABLE" and "make no mistakes".
- **Effects:**
  - They must be 3D "even if just a little bit", and must never obstruct the view: never hide foes or the road, no white-outs, nothing big and opaque over the board.
  - Judge them at the normal game camera (CAM.zoom=1) with a crowd, not only close up.
- **Never** touch `SM_OPEN`; the Epic, Legendary, Mythic, Ancient and Secret masteries stay developer-mode only. Never merge into main or any other branch, and never open pull requests.
- **Performance:** elites come in numbers.
  - Share geometries and materials across foes through module-level caches, and merge static gear into few meshes.
  - No per-frame allocations, no per-foe lights. Watch draw calls (`renderer.info`).
- **Cleanup:** nothing you add may stay in the scene after a foe dies, is removed, or the run ends (`removeEnemy`, `clearWorld`). Dispose only what is not shared.
- Elites also appear on the snow, tundra, white waste, taiga and highlands arenas. Those add their own gear after the elite dress (`snowify`, `tunGear`, `tgGear`, `hlDress`...), and some arenas swap unit models. Check that your work still fits there.

### Visual review (required, the most important part)
- **Script:** write a screenshot script with Playwright. It is preinstalled: `require('playwright')`, `chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})`. Route the cdnjs three.js URL to node_modules as `tests/headless.js` does.
  - After rendering, capture `renderer.domElement.toDataURL('image/jpeg')` inside the same evaluate. `page.screenshot` can time out under swiftshader.
  - **Bestiary:** `openGallery(); openVar(type);` then `galElite(true)` steps through `ELITE_CYCLE`; `varStep(1)` changes the variant. Also take close-ups.
  - **In game:** `newGame(1)`, `spawnEnemy({type,v,elite:[...]},wave)` on the road, then step `update(dt)`, `updFx(dt)` and `anim(dt,t)`, at CAM.zoom 1 and close.
- **LOOK at every sheet** (open the image) and compare it with the old look. Iterate until it is genuinely good: it fits the model, moves with it, reads clearly at game zoom, and looks made by hand for that unit.
- Push your final contact sheets (before/after jpgs) to a separate orphan branch, `sheets/<your branch>`, holding only images, so the integrator can review them.

### Finish
- Build and run the ASCII check. Run your suite and the related existing suites, then the full suite once, saving its output to a file.
- Commit with a message like "vNNN: ...". End it with the attribution lines your session's system reminder gives (Co-Authored-By and Claude-Session). Put no model name anywhere else.
- Push: `git push -u origin <branch>`, retrying with backoff on network errors.
  - Push WIP at checkpoints: idle containers are reclaimed and background processes die.
  - Stay in your turn while long runs go (time-bounded wait loops); don't go idle with a run in flight.
- Report to the integrator with send_message:
  - what you built, per unit or feature, with its numbers;
  - the tests and their results, including the full-suite line;
  - the sheets branch and its file names;
  - anything left undone or doubtful.
