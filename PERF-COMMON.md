## Shared rules for the optimisation workers v492-v496 (read all of it)
Kingsroad Keep (repo simmdanny/kingsroad-keep) is a single-file browser tower defence by Simon (use they/them). Simon asked for "a very very big optimalization update". Five workers run in parallel, each on its own branch and area. The integrator is session session_01MxMDcKBZKdtnVWPQtTdWV5 (send_message to it, or "@parent"); it merges, you never do.

### Setup
- `git fetch origin perf-base && git checkout -B <your branch> origin/perf-base`. perf-base is v491: the current test build plus `tools/bench/bench.js`, the shared benchmark. Read the README section "The frame benchmark (v491)".
- The game is `src/kingsroad-keep.html`: about 37k lines, many very long. Use `grep -n ... | cut -c1-300` and `sed -n a,bp`.
  - `python3 build.py` writes `dist/kingsroad-keep.html`, which must stay pure ASCII (`LC_ALL=C grep -c -P '[^\x00-\x7F]' dist/kingsroad-keep.html` prints 0).
- **Tests:**
  - Start the server as its own statement: `python3 -m http.server PORT -d "$PWD" >/dev/null 2>&1 &`, then `SV=$!`. Run `KK_PORT=PORT node tests/headless.js <suites>` (no names = the full suite, about 40 min), then `kill $SV`.
  - Run `npm i --no-save three@0.128.0` if `node_modules/three` is missing.
  - Never `pkill -f` a pattern from your own command line, and never kill processes by name: kill your own PIDs only.
  - Known flaky suites: wither, lpm, smsets (alone), sets (statistical rows), stc, smast. Rerun one alone before worrying.
- **Benchmark:** `KK_PORT=PORT node tools/bench/bench.js <late|spells|crowd|taiga> --steps 450 [--profile p.json]`.
  - Run it before and after each change, and keep a table of results.
  - Under swiftshader, render time is the CPU cost of WebGL calls, so draw calls, uniform uploads and shader compiles dominate. Report draw calls, the breakdown, compiles during the run and JS p95/p99 as the main numbers, with render ms as supporting evidence.
- **Your test:** a new `tests/<abbr>-test.js` in the style of `tests/perf-test.js` (an IIFE returning `JSON.stringify` of `[name, ok, detail]` rows that puts everything back).
  - Register its name at the END of the suite list in `tests/run-all.js`.
  - Put its detector at the FRONT of the build-detector chain: `typeof <a function unique to your module>==='function'?'vNNN':`.
- **Code placement:**
  - Put your module right before `/* ================= Performance (v446)`, after the existing modules, as ONE block with a header comment: Simon's request, what you measured, what you changed, before/after numbers.
  - Change existing behaviour with wrappers or by reassigning functions from your module. Edit shared base lines only where there is no other way, and keep those edits small: five branches must merge.
- **Docs:**
  - A CLOG entry at the TOP of `const CLOG=[`, in plain player-facing words: `{t:'...',d:'6 Nov',v:'vNNN',li:[...]}`.
  - A README section appended at the end, `## <Title> (vNNN)`, with the before/after table. README.md uses CRLF: append in Python bytes mode, converting \n to \r\n.

### Rules for optimisation work (strict)
- **The game must look and play exactly the same.** Only performance changes.
  - Pixel-compare before and after renders in every land (plains, snow/Frostvale, tundra, Whitewaste, taiga, highlands) and on the world map; `tests/perf-test.js` shows how.
  - Every existing test must still pass.
  - Visual quality may change only where your brief allows it (the adaptive quality tiers), and only below the top tier.
- Simon's standing rules still apply: "NO LOW EFFORT EFFECTS ARE ACCEPTABLE" and "make no mistakes".
  - Never touch `SM_OPEN`, never merge into main or any other branch, never open pull requests.
  - Nothing may obstruct the view.
- **Measure first.** Find the real cost with the benchmark and the CPU profile, then fix it, then prove it. List every change with its measured gain. Don't make changes you can't measure.
- **Cleanup still matters:** merged or instanced geometry must be freed when its owners go (watch `renderer.info.memory` over a long run), and nothing may leak into the scene.
- **Stay in your area** (your brief names it). If you find a big win outside it, report it instead of doing it.

### Visual review (required)
- **Script:** Playwright is preinstalled: `chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})`. Route the cdnjs three.js URL to node_modules as `tests/headless.js` does. Capture `renderer.domElement.toDataURL()` right after rendering.
- **Check:** render the same seeded scenes before and after your change, compute pixel differences, and LOOK at the before/after pairs.
- **Publish:** push the sheets and the diff images to an orphan branch `sheets/<your branch>`, holding only images.

### Finish
- Build and run the ASCII check. Run your suite, the related suites (perf, tidy, and whatever covers your area), then the full suite once, saving its output.
- Commit "vNNN: ...", ending with the attribution lines your session's system reminder gives. No model names anywhere else.
- Push: `git push -u origin <branch>`, retrying with backoff.
  - Push WIP at checkpoints: idle containers are reclaimed.
  - Stay in your turn while long runs go (time-bounded waits).
- Report to the integrator with send_message:
  - what you changed and the before/after benchmark table for late, spells and crowd;
  - your tests and the full-suite line;
  - the sheets;
  - anything risky or left undone.
