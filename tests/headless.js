/* Runs the test suites in headless Chromium, for a machine without the Browser pane (a cloud session, for one).
   From the project folder, with `python -m http.server 8771` running:
     node tests/headless.js           every suite through tests/run-all.js (about 8 minutes)
     node tests/headless.js mpg gsm   only these suites (tests/<name>-test.js, each returning [name, ok, detail] rows; ALL=1 prints passing rows too)
   Needs Playwright (require('playwright')). Where cdnjs is blocked, `npm i --no-save three@0.128.0` and Three.js r128 is served from
   node_modules instead (the same file); Google Fonts are skipped then, so screenshots fall back to other fonts. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const PORT = process.env.KK_PORT || 8771, local = path.join(__dirname, '..', 'node_modules', 'three', 'build', 'three.min.js');
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });   /* run-all wants 1280x900 (the dev panel check) */
  if (fs.existsSync(local)) {
    await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(local) }));
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  }
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://localhost:${PORT}/src/kingsroad-keep.html`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.__kk && typeof THREE !== 'undefined', null, { timeout: 60000 });
  const names = process.argv.slice(2);
  let failed = false;
  if (!names.length) {
    await page.evaluate(async () => { (0, eval)(await (await fetch('/tests/run-all.js')).text()); return __runAll(); });
    for (let shown = 0; ;) {
      await page.waitForTimeout(5000);
      const R = await page.evaluate(() => ({ done: __R.done, log: __R.log }));
      for (const l of R.log.slice(shown)) { console.log(l); if (/FAIL|ERROR/.test(l)) failed = true; }
      shown = R.log.length;
      if (R.done) break;
    }
  } else for (const n of names) {
    let L = await page.evaluate(async n => __kk.ev(await (await fetch(`/tests/${n}-test.js?${Date.now()}`)).text()), n);
    if (typeof L === 'string') L = JSON.parse(L);
    const bad = L.filter(x => !x[1]);
    if (bad.length) failed = true;
    console.log(`${n}: ${L.length - bad.length}/${L.length}`);
    for (const x of L) if (!x[1] || process.env.ALL) console.log(`  ${x[1] ? 'ok  ' : 'FAIL'} ${x[0]}${x[2] ? ' | ' + String(x[2]).replace(/\s+/g, ' ').trim() : ''}`);
  }
  if (errors.length) { failed = true; console.log('page errors: ' + errors.join(' | ')); }
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
