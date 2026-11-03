// Shared helper for the mastery contact-sheet scripts: opens the game page in headless Chromium.
// Where cdnjs is blocked, Three.js r128 is served from the repo's node_modules (`npm i --no-save three@0.128.0`), as tests/headless.js does;
// Google Fonts are skipped then, so text falls back to other fonts.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const LOCAL = path.join(__dirname, '..', '..', 'node_modules', 'three', 'build', 'three.min.js');
exports.open = async (viewport = { width: 1280, height: 900 }, opts = {}) => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: opts.dpr || 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  if (fs.existsSync(LOCAL)) {
    const THREE_JS = fs.readFileSync(LOCAL);
    await ctx.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', r => r.fulfill({ contentType: 'application/javascript', body: THREE_JS }));
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  }
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('http://localhost:' + (process.env.KK_PORT || 8771) + '/src/' + (process.env.PAGE || 'kingsroad-keep.html') + (opts.query || ''), { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.__kk && typeof THREE !== 'undefined', null, { timeout: 60000 });
  const ev = code => page.evaluate(c => __kk.ev(c), code);
  return { browser, page, ev, errors };
};
