// Generates a placeholder circular logo at assets/logo.png.
// Replace assets/logo.png with your own logo any time — no code change needed.
const sharp = require('sharp');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'logo.png');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6D2E8F"/>
      <stop offset="1" stop-color="#4A1E6E"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="248" fill="url(#g)"/>
  <circle cx="256" cy="256" r="248" fill="none" stroke="#FFFFFF" stroke-width="10" opacity="0.5"/>
  <g fill="#FFFFFF">
    <polygon points="256,120 140,205 372,205"/>
    <rect x="142" y="205" width="228" height="26" rx="5"/>
    <rect x="165" y="240" width="30" height="120" rx="5"/>
    <rect x="225" y="240" width="30" height="120" rx="5"/>
    <rect x="285" y="240" width="30" height="120" rx="5"/>
    <rect x="345" y="240" width="0" height="120" rx="5"/>
    <rect x="150" y="366" width="212" height="26" rx="6"/>
    <rect x="132" y="398" width="248" height="22" rx="8"/>
  </g>
</svg>`;

sharp(Buffer.from(svg)).png().toFile(OUT).then(() => {
  console.log('Generated assets/logo.png');
}).catch((e) => { console.error(e); process.exit(1); });
