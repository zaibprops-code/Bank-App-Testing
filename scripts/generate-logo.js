// Generates a placeholder circular logo at assets/logo.png.
// Replace assets/logo.png with your own logo any time — no code change needed.
const sharp = require('sharp');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'logo.png');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="248" fill="#FFFFFF"/>
  <circle cx="256" cy="256" r="248" fill="none" stroke="#5E2A7E" stroke-width="14"/>
  <g fill="#5E2A7E">
    <polygon points="256,128 148,208 364,208"/>
    <rect x="150" y="208" width="212" height="24" rx="5"/>
    <rect x="172" y="242" width="28" height="112" rx="5"/>
    <rect x="242" y="242" width="28" height="112" rx="5"/>
    <rect x="312" y="242" width="28" height="112" rx="5"/>
    <rect x="158" y="360" width="196" height="24" rx="6"/>
    <rect x="140" y="392" width="232" height="20" rx="8"/>
  </g>
</svg>`;

sharp(Buffer.from(svg)).png().toFile(OUT).then(() => {
  console.log('Generated assets/logo.png');
}).catch((e) => { console.error(e); process.exit(1); });
