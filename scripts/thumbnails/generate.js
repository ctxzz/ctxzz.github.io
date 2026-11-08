// Render featured.png thumbnails for page bundles.
//
// Usage (from the repository root; Playwright with Chromium must be available):
//   node scripts/thumbnails/generate.js              # all bundles listed in specs.js without a featured image
//   node scripts/thumbnails/generate.js --force      # overwrite existing featured images
//   node scripts/thumbnails/generate.js omata2026jsai  # only the given bundles (always overwrites)
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { scene, W, H } = require('./draw');
const specs = require('./specs');

const STYLE = 'linemono';
const SECTIONS = ['content/publication', 'content/event', 'content/post'];
const root = path.resolve(__dirname, '../..');

function bundleDir(id) {
  for (const sec of SECTIONS) {
    const dir = path.join(root, sec, id);
    if (fs.existsSync(path.join(dir, 'index.md'))) return dir;
  }
  return null;
}

(async () => {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.filter((x) => !x.startsWith('--'));
  const ids = only.length ? only : Object.keys(specs);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  let done = 0;
  for (const id of ids) {
    const spec = specs[id];
    const dir = bundleDir(id);
    if (!spec || !dir) {
      console.warn(`skip ${id}: ${!spec ? 'no spec' : 'no page bundle'}`);
      continue;
    }
    const existing = fs.readdirSync(dir).find((f) => /featured/.test(f));
    if (existing && !force && !only.length) continue;
    await page.setContent(`<html><body style="margin:0">${scene({ id, style: STYLE, ...spec })}</body></html>`);
    await page.screenshot({ path: path.join(dir, 'featured.png'), clip: { x: 0, y: 0, width: W, height: H } });
    done += 1;
  }
  await browser.close();
  console.log(`rendered ${done} thumbnail(s)`);
})();
