import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
assert.ok(existsSync('node_modules/three'), 'three.js did not install');
const html = readFileSync('dist/index.html', 'utf8');
for (const text of ['<title>', 'Under Construction', 'og:title', '--uc-accent']) assert.ok(html.includes(text), `Missing ${text}`);
assert.ok(!html.includes('<!--@'), 'Unreplaced template placeholder');
const assets = ['avatar/construction-worker.glb', 'avatar/construction-worker.webp', 'fonts/black-ops-one-latin.woff2', 'fonts/OFL.txt', 'images/wallpaper/concrete-418.avif', 'images/wallpaper/caution-strip.webp', 'favicon.ico', 'apple-touch-icon.png'];
for (const asset of assets) {
  assert.ok(existsSync(`dist/${asset}`), `Missing ${asset}`);
  if (process.env.VERIFY_BASE_URL) assert.equal((await fetch(`${process.env.VERIFY_BASE_URL}/${asset}`)).status, 200, asset);
}
console.log('Construction dependency, static copy, metadata, theme and all required assets verified.');
