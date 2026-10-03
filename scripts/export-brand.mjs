import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Optional argument: directory containing sharp. Only needed when re-exporting assets.
const require = process.argv[2]
  ? createRequire(path.resolve(process.argv[2], 'package.json'))
  : createRequire(import.meta.url);
const sharp = require('sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'public', 'brand');
const logo = await fs.readFile(path.join(directory, 'logo.svg'), 'utf8');
const icon = await fs.readFile(path.join(directory, 'icon.svg'));

function embedLogo(prefix, x, y, size) {
  return logo.replace('<svg ', `<svg x="${x}" y="${y}" width="${size}" height="${size}" `)
    .replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^\)]+)\)/g, (_, id) => `url(#${prefix}-${id})`);
}

// Deterministic, sparse stars: the same export produces the same composition.
const stars = Array.from({ length: 72 }, (_, i) => {
  const x = 30 + ((i * 137.508) % 1140);
  const y = 24 + ((i * 83.217) % 582);
  const radius = i % 9 === 0 ? 1.7 : 0.8;
  const color = i % 4 === 0 ? '#ff8eab' : '#e8d2b0';
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="${color}" opacity="${i % 9 === 0 ? '.5' : '.2'}"/>`;
}).join('');

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="background" x2="1" y2="1"><stop stop-color="#0b0911"/><stop offset="1" stop-color="#120914"/></linearGradient>
    <radialGradient id="ambient"><stop stop-color="#62182f" stop-opacity=".72"/><stop offset="1" stop-color="#62182f" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <ellipse cx="925" cy="315" rx="470" ry="420" fill="url(#ambient)"/>
  ${stars}
  <rect x="24.5" y="24.5" width="1151" height="581" rx="22" fill="none" stroke="#e6c280" stroke-opacity=".15"/>
  ${embedLogo('small', 80, 65, 52)}
  <text x="150" y="85" fill="#fff0ed" font-family="Georgia, serif" font-size="17" letter-spacing="2">TUI &amp; SAIMAI</text>
  <text x="150" y="108" fill="#ff9cb7" font-family="Arial, sans-serif" font-size="10" letter-spacing="2.8">CELESTIAL VALENTINE 2026</text>
  <text x="84" y="225" fill="#e6c280" font-family="Arial, sans-serif" font-size="13" letter-spacing="4">FOREVER &amp; ALWAYS</text>
  <text x="80" y="318" fill="#fff0ed" font-family="Leelawadee UI, Tahoma, sans-serif" font-size="64" font-weight="bold">ตุ้ย &amp; สายไหม</text>
  <text x="84" y="370" fill="#d7b9c5" font-family="Leelawadee UI, Tahoma, sans-serif" font-size="25">16 ความทรงจำ หนึ่งหัวใจ</text>
  <path d="M84 419H150" stroke="#d6b174" stroke-width="1.5"/>
  <text x="84" y="474" fill="#ffb9cc" font-family="Georgia, serif" font-size="20" font-style="italic">Happy Valentine’s Day</text>
  <text x="84" y="550" fill="#97818f" font-family="Leelawadee UI, Tahoma, sans-serif" font-size="14">แด่คนพิเศษที่สุดของหัวใจ</text>
  ${embedLogo('large', 747, 142, 352)}
</svg>`;

await fs.writeFile(path.join(directory, 'og.svg'), og);
await sharp(Buffer.from(og)).png().toFile(path.join(directory, 'og.png'));
await sharp(Buffer.from(logo)).resize(512, 512).png().toFile(path.join(directory, 'logo.png'));
await Promise.all([192, 512].map(size => sharp(icon).resize(size, size).png()
  .toFile(path.join(directory, `icon-${size}.png`))));
await sharp(icon).resize(180, 180).png().toFile(path.join(directory, 'apple-touch-icon.png'));

// ICO directory with embedded PNG images for modern browsers and Windows.
const sizes = [16, 32, 48, 64];
const images = await Promise.all(sizes.map(size => sharp(icon).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((image, i) => {
  const entry = 6 + i * 16;
  header[entry] = sizes[i];
  header[entry + 1] = sizes[i];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await fs.writeFile(path.join(root, 'public', 'favicon.ico'), Buffer.concat([header, ...images]));
console.log('Exported logo, browser/home-screen icons, and 1200 × 630 OG image.');
