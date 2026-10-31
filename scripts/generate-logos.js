const fs = require('fs');

function parsePdfStream(streamContent) {
  const lines = streamContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  let out = [];
  let currentGroupOpen = false;
  let currentColor = '#ffffff';
  let currentFillRule = 'nonzero';
  let pathD = '';
  
  function flushPath() {
    if (pathD.trim()) {
      out.push(`  <path d="${pathD.trim()}" fill="${currentColor}" fill-rule="${currentFillRule}" />`);
      pathD = '';
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tokens = line.split(/\s+/);
    const op = tokens[tokens.length - 1];

    if (op === 'q') {
      flushPath();
    } else if (op === 'Q') {
      flushPath();
      if (currentGroupOpen) {
        out.push('</g>');
        currentGroupOpen = false;
      }
      currentColor = '#ffffff';
    } else if (op === 'cm') {
      flushPath();
      const [a, b, c, d, e, f] = tokens.slice(0, 6).map(Number);
      out.push(`<g transform="matrix(${a} ${b} ${c} ${d} ${e} ${f})">`);
      currentGroupOpen = true;
    } else if (op === 'scn') {
      flushPath();
      if (tokens.length >= 4) {
        const r = Math.round(Number(tokens[0]) * 255);
        const g = Math.round(Number(tokens[1]) * 255);
        const b = Math.round(Number(tokens[2]) * 255);
        currentColor = `rgb(${r},${g},${b})`;
      } else if (tokens[0] === '/P1') {
        currentColor = 'url(#starGradient)';
      }
    } else if (op === 'm') {
      const x = Number(tokens[0]);
      const y = Number(tokens[1]);
      pathD += ` M ${x.toFixed(3)} ${y.toFixed(3)}`;
    } else if (op === 'l') {
      const x = Number(tokens[0]);
      const y = Number(tokens[1]);
      pathD += ` L ${x.toFixed(3)} ${y.toFixed(3)}`;
    } else if (op === 'c') {
      const x1 = Number(tokens[0]), y1 = Number(tokens[1]);
      const x2 = Number(tokens[2]), y2 = Number(tokens[3]);
      const x3 = Number(tokens[4]), y3 = Number(tokens[5]);
      pathD += ` C ${x1.toFixed(3)} ${y1.toFixed(3)}, ${x2.toFixed(3)} ${y2.toFixed(3)}, ${x3.toFixed(3)} ${y3.toFixed(3)}`;
    } else if (op === 'h') {
      pathD += ' Z';
    } else if (op === 'f' || op === 'F') {
      currentFillRule = 'nonzero';
      flushPath();
    } else if (op === 'f*') {
      currentFillRule = 'evenodd';
      flushPath();
    } else if (op === 'Do') {
      if (tokens[0] === '/X1') {
        out.push('  <use href="#xobject-x1" opacity="0.08" />');
      }
    }
  }
  flushPath();
  return out.join('\n');
}

const s3 = fs.readFileSync('stream_3_decompressed.txt', 'utf8');
const s27 = fs.readFileSync('stream_27_decompressed.txt', 'utf8');

// Separate emblem lines and text lines in stream 27
const s27Lines = s27.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
// Emblem is lines up to line 265 (where the text transform begins)
const textStartIndex = s27Lines.findIndex(l => l.includes('586.000000 267.298828 cm'));
console.log('Text starts at line index:', textStartIndex);

const emblemLines = s27Lines.slice(0, textStartIndex - 1); // exclude the 'q' before text transform
const textLines = s27Lines.slice(textStartIndex - 1); // from 'q' to end

const s3Svg = parsePdfStream(s3);
const emblemContentSvg = parsePdfStream(emblemLines.join('\n'));
const textContentSvg = parsePdfStream(textLines.join('\n'));

// Generate white text version by replacing the text color with white
const textContentWhiteSvg = textContentSvg.replace(/fill="rgb\(12,71,55\)"/g, 'fill="#FFFFFF"');

// 1. Full logo (Dark text for light backgrounds)
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1766 586" width="100%" height="100%">
  <defs>
    <linearGradient id="starGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0C4737" />
      <stop offset="50%" stop-color="#145241" />
      <stop offset="100%" stop-color="#216B57" />
    </linearGradient>
    <g id="xobject-x1">
${s3Svg}
    </g>
  </defs>
  <g transform="translate(0, 586) scale(1, -1)">
${emblemContentSvg}
${textContentSvg}
  </g>
</svg>`;

// 2. Full logo (White text for dark backgrounds)
const fullLogoWhiteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1766 586" width="100%" height="100%">
  <defs>
    <linearGradient id="starGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0C4737" />
      <stop offset="50%" stop-color="#145241" />
      <stop offset="100%" stop-color="#216B57" />
    </linearGradient>
    <g id="xobject-x1">
${s3Svg}
    </g>
  </defs>
  <g transform="translate(0, 586) scale(1, -1)">
${emblemContentSvg}
${textContentWhiteSvg}
  </g>
</svg>`;

// 3. Emblem only: 534 x 534 square
// In PDF, star is at x in [0, 534], y in [26, 560].
// In inverted SVG: y_svg = 586 - y_pdf.
// For y_pdf = 560 -> y_svg = 26. For y_pdf = 26 -> y_svg = 560.
// So with viewBox="0 26 534 534", it is a perfect square enclosing the 8-pointed star!
const emblemOnlySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 26 534 534" width="100%" height="100%">
  <defs>
    <linearGradient id="starGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0C4737" />
      <stop offset="50%" stop-color="#145241" />
      <stop offset="100%" stop-color="#216B57" />
    </linearGradient>
    <g id="xobject-x1">
${s3Svg}
    </g>
  </defs>
  <g transform="translate(0, 586) scale(1, -1)">
${emblemContentSvg}
  </g>
</svg>`;

fs.writeFileSync('d:/masjidweb-phase2/masjidweb/public/logo.svg', fullLogoSvg);
fs.writeFileSync('d:/masjidweb-phase2/masjidweb/public/logo-white.svg', fullLogoWhiteSvg);
fs.writeFileSync('d:/masjidweb-phase2/masjidweb/public/logo-emblem.svg', emblemOnlySvg);
console.log('Successfully wrote logo.svg, logo-white.svg, logo-emblem.svg');
