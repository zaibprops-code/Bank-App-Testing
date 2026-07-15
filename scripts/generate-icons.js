// Generates the app icon / adaptive icon / splash / favicon PNGs from inline SVG.
// Run with: node scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

// A generic white "bank building" emblem centered in a 1024 canvas.
// scale = fraction of canvas the emblem occupies; used for the adaptive
// foreground so the symbol stays inside Android's circular safe zone.
function bankEmblem(cx, cy, s) {
  // s is half-width of the building footprint
  const roofApexY = cy - s * 1.05;
  const roofBaseY = cy - s * 0.42;
  const colTop = cy - s * 0.28;
  const colBot = cy + s * 0.5;
  const baseY = cy + s * 0.5;
  const left = cx - s;
  const right = cx + s;
  // 4 columns
  const colW = s * 0.24;
  const span = (right - left) - colW;
  const cols = [0, 1, 2, 3]
    .map((i) => {
      const x = left + colW * 0.4 + (span - colW * 0.8) * (i / 3);
      return `<rect x="${x.toFixed(1)}" y="${colTop.toFixed(1)}" width="${colW.toFixed(1)}" height="${(colBot - colTop).toFixed(1)}" rx="6"/>`;
    })
    .join('');
  return `
    <g fill="#FFFFFF">
      <polygon points="${cx},${roofApexY} ${(left - s * 0.12).toFixed(1)},${roofBaseY} ${(right + s * 0.12).toFixed(1)},${roofBaseY}"/>
      <rect x="${(left - s * 0.02).toFixed(1)}" y="${roofBaseY.toFixed(1)}" width="${(right - left + s * 0.04).toFixed(1)}" height="${(s * 0.16).toFixed(1)}" rx="6"/>
      ${cols}
      <rect x="${(left - s * 0.12).toFixed(1)}" y="${baseY.toFixed(1)}" width="${(right - left + s * 0.24).toFixed(1)}" height="${(s * 0.16).toFixed(1)}" rx="8"/>
      <rect x="${(left - s * 0.26).toFixed(1)}" y="${(baseY + s * 0.2).toFixed(1)}" width="${(right - left + s * 0.52).toFixed(1)}" height="${(s * 0.14).toFixed(1)}" rx="8"/>
    </g>`;
}

const bgGradient = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6D2E8F"/>
      <stop offset="1" stop-color="#4A1E6E"/>
    </linearGradient>
  </defs>`;

// Full app icon: purple gradient background + emblem
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bgGradient}
  <rect width="1024" height="1024" fill="url(#g)"/>
  ${bankEmblem(512, 520, 300)}
</svg>`;

// Adaptive foreground: transparent bg, smaller emblem (safe zone)
const adaptiveSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bankEmblem(512, 512, 230)}
</svg>`;

// Splash: purple background + emblem
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bgGradient}
  <rect width="1024" height="1024" fill="url(#g)"/>
  ${bankEmblem(512, 512, 250)}
</svg>`;

async function run() {
  await sharp(Buffer.from(iconSvg)).png().toFile(path.join(OUT, 'icon.png'));
  await sharp(Buffer.from(adaptiveSvg)).png().toFile(path.join(OUT, 'adaptive-icon.png'));
  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(OUT, 'splash.png'));
  await sharp(Buffer.from(iconSvg)).resize(48, 48).png().toFile(path.join(OUT, 'favicon.png'));
  console.log('Generated icon.png, adaptive-icon.png, splash.png, favicon.png');
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
