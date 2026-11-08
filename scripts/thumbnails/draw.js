// Modern flat thumbnail renderer: muted pastels, no outlines, faceless figures,
// geometric backdrop, no text. Builds a 1200x675 SVG string from a scene spec;
// generate.js rasterizes it with a headless browser.
'use strict';

const W = 1200;
const H = 675;
const NAVY = '#2f3b52';
const SKINS = ['#f2d5c4', '#e8bfa6', '#d9a888'];

const PALETTES = [
  { bg: '#f5f0ea', shapes: ['#e9d8c8', '#c9d8cf', '#efc9c3'], accent: '#d98f86' }, // sand / sage / rose
  { bg: '#eef2f5', shapes: ['#c8d6e5', '#e3dcef', '#f3e1d2'], accent: '#7f9cc0' }, // powder blue / lilac
  { bg: '#f3f1ec', shapes: ['#d6e2d3', '#efe0c6', '#cfd9e6'], accent: '#8fb39a' }, // sage / butter
  { bg: '#f6efef', shapes: ['#efd2d4', '#d9d2ea', '#e6e2d6'], accent: '#c98b9b' }, // dusty rose
  { bg: '#eef3f1', shapes: ['#cfe3dd', '#f0d9cc', '#d7dcea'], accent: '#6fa59a' }, // mint / clay
  { bg: '#f4f1f7', shapes: ['#ddd4ec', '#cfe0e8', '#f1dcd2'], accent: '#9b8cc4' }, // lavender
];

const C = {
  rose: '#e8a9a6', blush: '#f2c9c4', sage: '#a9c4ae', mint: '#bfdcd2', sky: '#a9c1dc', powder: '#cbd9ea',
  lilac: '#c7bce3', sand: '#e7d6c1', butter: '#f0d9a0', clay: '#d9a48a', cream: '#fbf8f3', white: '#ffffff',
  stone: '#d7d4cf', slate: '#8a97ab', navy: NAVY, wood: '#d8b892', woodDark: '#b89270', coral: '#e59a8c',
  teal: '#7fb3b0', glass: '#e4eef6',
};

// --- helpers ---------------------------------------------------------------
function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h;
}
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  const r = f(n >> 16), gg = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((r << 16) | (gg << 8) | b).toString(16).padStart(6, '0');
}
const g = (x, y, s, body) => `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
const ln = (w, color = NAVY, extra = '') => `fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}`;

// --- figures -----------------------------------------------------------------
// Faceless, ~6 heads tall. Feet at (0,0); about 330 units tall at scale 1.
const FIG = {
  elder: { top: C.lilac, bottom: '#6d7891', hair: '#e9e6e1', style: 'bun', skin: 0 },
  carer: { top: C.mint, bottom: NAVY, hair: '#4a3b36', style: 'bob', skin: 1, apron: true },
  nurse: { top: C.blush, bottom: '#5d6f8c', hair: '#3b302d', style: 'bob', skin: 0 },
  doctor: { top: C.white, bottom: '#4f5d78', hair: '#3a3331', style: 'short', skin: 1, coat: true },
  emt: { top: '#9fb7d1', bottom: NAVY, hair: '#2f2a28', style: 'cap', skin: 0 },
  student: { top: C.sky, bottom: '#3f4a63', hair: '#2f2a2f', style: 'short', skin: 0 },
  youth: { top: C.butter, bottom: '#56627d', hair: '#5a4552', style: 'long', skin: 1 },
  coach: { top: C.sand, bottom: NAVY, hair: '#4b3f3a', style: 'short', skin: 2 },
};

function figure(type, x, y, s = 1, opt = {}) {
  const f = FIG[type];
  const skin = SKINS[f.skin];
  const top = f.top;
  const topD = shade(top, -0.12);
  const flip = opt.flip ? -1 : 1;
  let p = '';
  // legs
  p += `<path d="M-16 -150 L-20 -8 M16 -150 L22 -8" ${ln(26, f.bottom)}/>`;
  p += `<path d="M-34 -2 h24 M12 -2 h26" ${ln(12, shade(f.bottom, -0.25))}/>`;
  // back arm
  const armBack = opt.wave ? 'M30 -250 Q70 -300 64 -350' : opt.reach ? 'M30 -250 Q86 -244 112 -262' : 'M30 -250 Q44 -200 40 -160';
  p += `<path d="${armBack}" ${ln(20, topD)}/>`;
  const hb = opt.wave ? [64, -352] : opt.reach ? [114, -264] : [40, -158];
  p += `<circle cx="${hb[0]}" cy="${hb[1]}" r="10" fill="${skin}"/>`;
  // torso
  p += `<path d="M-38 -262 Q-46 -200 -40 -140 L40 -140 Q46 -200 38 -262 Q0 -276 -38 -262Z" fill="${top}"/>`;
  if (f.coat) p += `<path d="M-40 -140 L-44 -110 L44 -110 L40 -140Z" fill="${top}"/><path d="M0 -264 L-12 -224 M0 -264 L12 -224" ${ln(3, '#c7ced8')}/><path d="M-20 -236 Q-28 -196 -8 -186" ${ln(3, C.teal)}/>`;
  if (f.apron) p += `<path d="M-26 -230 h52 l-4 86 h-44Z" fill="${C.cream}" opacity="0.9"/>`;
  // front arm
  const armFront = 'M-30 -250 Q-46 -200 -40 -160';
  p += `<path d="${armFront}" ${ln(20, topD)}/><circle cx="-40" cy="-158" r="10" fill="${skin}"/>`;
  // neck & head
  p += `<rect x="-8" y="-284" width="16" height="22" rx="6" fill="${shade(skin, -0.08)}"/>`;
  const hy = -310;
  if (f.style === 'long') p += `<path d="M-30 ${hy - 4} Q-36 ${hy + 50} -26 ${hy + 54} L26 ${hy + 54} Q36 ${hy + 50} 30 ${hy - 4}Z" fill="${f.hair}"/>`;
  p += `<circle cx="0" cy="${hy}" r="28" fill="${skin}"/>`;
  if (f.style === 'bun') p += `<circle cx="-4" cy="${hy - 32}" r="13" fill="${f.hair}"/><path d="M-29 ${hy - 2} Q-30 ${hy - 32} 0 ${hy - 32} Q30 ${hy - 32} 29 ${hy - 4} Q16 ${hy - 20} -8 ${hy - 18} Q-22 ${hy - 14} -29 ${hy - 2}Z" fill="${f.hair}"/>`;
  else if (f.style === 'bob' || f.style === 'long') p += `<path d="M-31 ${hy + 12} Q-34 ${hy - 34} 0 ${hy - 33} Q34 ${hy - 34} 31 ${hy + 12} L24 ${hy + 12} Q22 ${hy - 14} 4 ${hy - 18} Q-18 ${hy - 14} -22 ${hy + 12}Z" fill="${f.hair}"/>`;
  else if (f.style === 'cap') p += `<path d="M-29 ${hy - 4} Q-29 ${hy - 34} 0 ${hy - 34} Q29 ${hy - 34} 29 ${hy - 4}Z" fill="${NAVY}"/><path d="M14 ${hy - 6} h30" ${ln(7, NAVY)}/>`;
  else p += `<path d="M-29 ${hy - 2} Q-30 ${hy - 33} 0 ${hy - 33} Q30 ${hy - 33} 29 ${hy - 4} Q12 ${hy - 20} -10 ${hy - 16} Q-22 ${hy - 12} -29 ${hy - 2}Z" fill="${f.hair}"/>`;
  if (opt.vr) p += `<rect x="-26" y="${hy - 12}" width="52" height="24" rx="9" fill="${NAVY}"/><rect x="-18" y="${hy - 6}" width="36" height="11" rx="4" fill="${C.lilac}"/><path d="M-26 ${hy - 2} H-30 M26 ${hy - 2} H30" ${ln(5, NAVY)}/>`;
  if (opt.cane) p += `<path d="M-46 -158 L-56 0" ${ln(6, C.woodDark)}/>`;
  return g(x, y, s, `<g transform="scale(${flip} 1)">${p}</g>`);
}

// --- props (centered near 0,0; ~220 units) ------------------------------------
// Flat shapes, tone-on-tone details, navy only for small accents.
const PROP = {
  monitor: (a) => `<rect x="-120" y="-96" width="240" height="160" rx="14" fill="${NAVY}"/><rect x="-106" y="-82" width="212" height="132" rx="8" fill="${shade(a, 0.45)}"/>
    <circle cx="0" cy="-18" r="30" fill="${C.white}" opacity="0.9"/><path d="M-9 -32 L15 -18 L-9 -4Z" fill="${a}"/>
    <rect x="-86" y="26" width="172" height="6" rx="3" fill="${C.white}" opacity="0.7"/><rect x="-86" y="26" width="70" height="6" rx="3" fill="${a}"/>
    <rect x="-8" y="64" width="16" height="36" fill="${C.slate}"/><rect x="-60" y="96" width="120" height="12" rx="6" fill="${C.slate}"/>`,
  laptop: (a) => `<rect x="-110" y="-86" width="220" height="140" rx="10" fill="${NAVY}"/><rect x="-98" y="-74" width="196" height="116" rx="6" fill="${shade(a, 0.5)}"/>
    <circle cx="-34" cy="-26" r="16" fill="${C.sand}"/><path d="M-58 22 Q-34 -6 -10 22Z" fill="${a}"/><circle cx="34" cy="-26" r="16" fill="${C.blush}"/><path d="M10 22 Q34 -6 58 22Z" fill="${C.sage}"/>
    <path d="M-136 54 H136 L120 74 H-120Z" fill="${C.stone}"/>`,
  camera: (a) => `<rect x="-90" y="-56" width="140" height="100" rx="16" fill="${a}"/><path d="M50 -26 L104 -52 V40 L50 16Z" fill="${shade(a, -0.15)}"/>
    <circle cx="-22" cy="-6" r="34" fill="${C.cream}"/><circle cx="-22" cy="-6" r="18" fill="${NAVY}"/><circle cx="-14" cy="-14" r="5" fill="${C.white}"/>
    <circle cx="-70" cy="-38" r="6" fill="${C.coral}"/><path d="M-20 44 L-46 112 M-20 44 L6 112 M-20 44 V112" ${ln(6, C.slate)}/>`,
  phone: (a) => `<rect x="-62" y="-110" width="124" height="220" rx="22" fill="${NAVY}"/><rect x="-52" y="-96" width="104" height="186" rx="12" fill="${C.cream}"/>
    <rect x="-40" y="-76" width="56" height="22" rx="11" fill="${shade(a, 0.35)}"/><rect x="-12" y="-42" width="52" height="22" rx="11" fill="${a}"/><rect x="-40" y="-8" width="64" height="22" rx="11" fill="${shade(a, 0.35)}"/>
    <rect x="-4" y="26" width="44" height="22" rx="11" fill="${a}"/>`,
  bubbles: (a) => `<path d="M-120 -70 h124 a24 24 0 0 1 24 24 v40 a24 24 0 0 1 -24 24 h-72 l-30 24 v-24 h-22 a24 24 0 0 1 -24 -24 v-40 a24 24 0 0 1 24 -24Z" fill="${C.white}"/>
    <rect x="-100" y="-46" width="90" height="10" rx="5" fill="${C.stone}"/><rect x="-100" y="-26" width="60" height="10" rx="5" fill="${C.stone}"/>
    <path d="M0 26 h100 a22 22 0 0 1 22 22 v34 a22 22 0 0 1 -22 22 h-8 v24 l-30 -24 h-62 a22 22 0 0 1 -22 -22 v-34 a22 22 0 0 1 22 -22Z" fill="${a}"/>
    <rect x="20" y="50" width="76" height="10" rx="5" fill="${C.white}" opacity="0.8"/><rect x="20" y="70" width="46" height="10" rx="5" fill="${C.white}" opacity="0.8"/>`,
  thought: (a) => `<circle cx="-56" cy="-20" r="50" fill="${C.blush}"/><circle cx="26" cy="-50" r="56" fill="${C.powder}"/><circle cx="84" cy="10" r="42" fill="${C.butter}" opacity="0.9"/><circle cx="0" cy="34" r="46" fill="${C.mint}" opacity="0.9"/>
    <circle cx="-62" cy="96" r="12" fill="${C.white}"/><circle cx="-84" cy="122" r="7" fill="${C.white}"/>`,
  brain: (a) => `<path d="M-96 10 Q-116 -54 -62 -78 Q-40 -116 0 -96 Q40 -118 68 -80 Q118 -60 100 0 Q116 46 68 66 Q32 94 0 74 Q-38 96 -68 66 Q-114 52 -96 10Z" fill="${C.blush}"/>
    <path d="M0 -94 Q-14 -10 0 72 M-60 -40 Q-30 -30 -42 0 M50 -48 Q24 -20 52 8 M-64 32 Q-36 22 -24 42 M30 42 Q52 26 72 38" ${ln(6, shade(C.blush, -0.15))}/>`,
  graph: (a) => {
    const n = [[-100, -54], [0, -96], [94, -44], [-66, 66], [44, 56], [110, 76], [-10, -6]];
    const e = [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [4, 5], [2, 5], [0, 3], [1, 2]];
    const cols = [C.blush, C.powder, C.butter, C.mint, C.lilac, C.sand, a];
    return e.map(([i, j]) => `<line x1="${n[i][0]}" y1="${n[i][1]}" x2="${n[j][0]}" y2="${n[j][1]}" ${ln(3, C.slate)}/>`).join('') +
      n.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 6 ? 30 : 18}" fill="${cols[i]}"/>`).join('') + `<circle cx="-10" cy="-6" r="10" fill="${C.white}"/>`;
  },
  bot: (a) => `<path d="M0 -128 v-20" ${ln(4, C.slate)}/><circle cx="0" cy="-152" r="8" fill="${a}"/>
    <rect x="-80" y="-128" width="160" height="116" rx="36" fill="${C.cream}"/><rect x="-62" y="-108" width="124" height="76" rx="26" fill="${NAVY}"/>
    <rect x="-36" y="-80" width="18" height="18" rx="9" fill="${shade(a, 0.4)}"/><rect x="18" y="-80" width="18" height="18" rx="9" fill="${shade(a, 0.4)}"/>
    <rect x="-56" y="0" width="112" height="86" rx="28" fill="${shade(a, 0.35)}"/><rect x="-30" y="26" width="60" height="8" rx="4" fill="${C.white}" opacity="0.7"/><rect x="-30" y="44" width="40" height="8" rx="4" fill="${C.white}" opacity="0.7"/>`,
  heart: (a) => `<path d="M0 70 C-90 10 -100 -60 -50 -76 C-22 -86 -4 -66 0 -50 C4 -66 22 -86 50 -76 C100 -60 90 10 0 70Z" fill="${C.rose}"/>`,
  ecg: (a) => `<rect x="-130" y="-86" width="260" height="170" rx="18" fill="${NAVY}"/><rect x="-114" y="-70" width="228" height="120" rx="10" fill="#3c4a66"/>
    <path d="M-104 -4 h44 l14 -38 l22 76 l18 -64 l12 26 h84" ${ln(6, C.mint)}/><circle cx="-92" cy="68" r="6" fill="${C.mint}"/><circle cx="-70" cy="68" r="6" fill="${C.butter}"/><rect x="40" y="62" width="70" height="10" rx="5" fill="#56647f"/>`,
  ambulance: () => `<path d="M-140 34 V-56 Q-140 -72 -124 -72 H44 Q60 -72 68 -58 L106 -12 Q126 -8 126 14 V34Z" fill="${C.white}"/>
    <path d="M64 -56 L98 -14 H48 V-56Z" fill="${C.glass}"/><rect x="-140" y="-8" width="266" height="14" fill="${C.coral}"/>
    <rect x="-80" y="-56" width="12" height="40" rx="3" fill="${C.coral}"/><rect x="-94" y="-42" width="40" height="12" rx="3" fill="${C.coral}"/>
    <rect x="-44" y="-90" width="44" height="18" rx="6" fill="${C.sky}"/>
    <circle cx="-80" cy="38" r="26" fill="${NAVY}"/><circle cx="-80" cy="38" r="10" fill="${C.stone}"/><circle cx="70" cy="38" r="26" fill="${NAVY}"/><circle cx="70" cy="38" r="10" fill="${C.stone}"/>`,
  map: (a) => {
    let p = `<path d="M-170 -104 L-56 -84 L56 -114 L170 -90 L170 104 L56 82 L-56 110 L-170 88Z" fill="${C.cream}"/>`;
    p += `<path d="M-56 -84 L-56 110 L56 82 L56 -114Z" fill="${shade(C.cream, -0.04)}"/>`;
    for (let i = -140; i <= 140; i += 40) p += `<path d="M${i} -96 V96" ${ln(1.5, C.stone)}/>`;
    for (let j = -70; j <= 70; j += 35) p += `<path d="M-160 ${j} H160" ${ln(1.5, C.stone)}/>`;
    p += `<circle cx="-76" cy="-6" r="48" fill="${C.rose}" opacity="0.35"/><circle cx="64" cy="30" r="60" fill="${a}" opacity="0.35"/><circle cx="16" cy="-46" r="32" fill="${C.butter}" opacity="0.5"/>`;
    const pin = (x, y, f) => `<path d="M${x} ${y} C${x - 22} ${y - 26} ${x - 20} ${y - 50} ${x} ${y - 50} C${x + 20} ${y - 50} ${x + 22} ${y - 26} ${x} ${y}Z" fill="${f}"/><circle cx="${x}" cy="${y - 32}" r="7" fill="${C.white}"/>`;
    return p + pin(-76, -4, C.coral) + pin(64, 32, NAVY) + pin(16, -44, a);
  },
  hospital: (a) => `<rect x="-120" y="-84" width="240" height="188" rx="8" fill="${C.cream}"/><rect x="-50" y="-140" width="100" height="64" rx="8" fill="${C.white}"/>
    <rect x="-6" y="-130" width="12" height="44" rx="3" fill="${C.coral}"/><rect x="-22" y="-114" width="44" height="12" rx="3" fill="${C.coral}"/>
    ${[-92, -36, 20, 76].map((x) => [-56, -4].map((y) => `<rect x="${x}" y="${y}" width="16" height="34" rx="3" fill="${shade(a, 0.2)}"/>`).join('')).join('')}
    <rect x="-28" y="54" width="56" height="50" rx="4" fill="${shade(a, -0.05)}"/>`,
  house: (a) => `<path d="M-120 -6 L0 -116 L120 -6Z" fill="${a}"/><rect x="-96" y="-12" width="192" height="116" fill="${C.cream}"/>
    <rect x="-66" y="16" width="50" height="44" rx="4" fill="${C.glass}"/><rect x="24" y="36" width="44" height="68" rx="4" fill="${shade(a, 0.25)}"/><circle cx="-41" cy="38" r="9" fill="${C.butter}"/>`,
  tent: (a) => `<path d="M-150 84 L0 -104 L150 84Z" fill="${C.cream}"/><path d="M0 -104 L-44 84 H44Z" fill="${shade(a, 0.2)}"/>
    <rect x="-106" y="-4" width="48" height="48" rx="6" fill="${C.white}"/><rect x="-88" y="4" width="12" height="32" rx="3" fill="${C.coral}"/><rect x="-98" y="14" width="32" height="12" rx="3" fill="${C.coral}"/>`,
  bed: (a) => `<rect x="-160" y="-8" width="320" height="56" rx="12" fill="${C.cream}"/><rect x="-160" y="-88" width="22" height="160" rx="6" fill="${C.woodDark}"/>
    <rect x="138" y="-44" width="22" height="116" rx="6" fill="${C.woodDark}"/><rect x="-128" y="-40" width="84" height="32" rx="14" fill="${C.white}"/>
    <path d="M-34 -8 Q60 -48 134 -8Z" fill="${a}"/>`,
  pillow: (a) => {
    let p = `<path d="M-130 -44 Q0 -86 130 -44 Q150 0 130 44 Q0 86 -130 44 Q-150 0 -130 -44Z" fill="${C.white}"/>`;
    for (let i = -100; i <= 100; i += 25) p += `<path d="M${i} -54 Q${i + 18} 0 ${i} 54" ${ln(2.5, a)}/>`;
    for (let j = -36; j <= 36; j += 18) p += `<path d="M-118 ${j} H118" ${ln(2.5, a)} opacity="0.6"/>`;
    return p;
  },
  ivstand: (a) => `<path d="M0 -160 V120 M-54 120 H54 M-44 -160 H44" ${ln(7, C.slate)}/>
    <rect x="-34" y="-160" width="44" height="76" rx="14" fill="${C.glass}"/><rect x="-30" y="-118" width="36" height="30" rx="10" fill="${C.sky}"/>
    <path d="M-12 -84 Q-22 -20 30 4" ${ln(3, C.teal)}/><rect x="-76" y="12" width="152" height="74" rx="12" fill="${C.wood}"/>
    <path d="M-56 34 h112 M-56 58 h112" ${ln(3, C.woodDark)}/>`,
  controller: (a) => `<path d="M-130 -20 Q-130 -64 -82 -64 H82 Q130 -64 130 -20 L146 42 Q154 86 110 86 Q84 86 68 54 H-68 Q-84 86 -110 86 Q-154 86 -146 42Z" fill="${NAVY}"/>
    <path d="M-86 -22 v44 M-108 0 h44" ${ln(12, C.slate)}/><circle cx="70" cy="-14" r="13" fill="${C.butter}"/><circle cx="102" cy="14" r="13" fill="${C.coral}"/><circle cx="40" cy="14" r="13" fill="${C.mint}"/>`,
  rhythm: (a) => `<rect x="-160" y="-96" width="320" height="196" rx="18" fill="${NAVY}"/>
    ${[-105, -35, 35, 105].map((x, i) => `<path d="M${x} -84 V60" ${ln(2, '#46557a')}/><circle cx="${x}" cy="62" r="22" fill="none" stroke="${[C.rose, C.sky, C.butter, C.mint][i]}" stroke-width="5"/>`).join('')}
    <circle cx="-35" cy="-6" r="16" fill="${C.sky}"/><circle cx="105" cy="-46" r="16" fill="${C.mint}"/><circle cx="-105" cy="20" r="16" fill="${C.rose}"/><circle cx="35" cy="-60" r="16" fill="${C.butter}"/>`,
  footprints: (a) => {
    const f = (x, y, r, c, m) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${m} 1)"><path d="M0 -34 C16 -34 20 -14 16 4 C13 18 6 26 -2 26 C-12 26 -16 14 -16 0 C-16 -18 -12 -34 0 -34Z" fill="${c}"/><ellipse cx="0" cy="44" rx="11" ry="14" fill="${c}"/></g>`;
    return f(-110, 80, 14, shade(a, 0.25), -1) + f(-50, 30, 18, a, 1) + f(16, -4, 14, shade(a, 0.25), -1) + f(80, -54, 18, a, 1);
  },
  sensor: (a) => `<circle cx="0" cy="44" r="26" fill="${NAVY}"/><circle cx="0" cy="44" r="10" fill="${a}"/>
    <path d="M-42 6 Q0 -30 42 6" ${ln(8, a)}/><path d="M-74 -24 Q0 -88 74 -24" ${ln(8, a)} opacity="0.7"/><path d="M-106 -54 Q0 -144 106 -54" ${ln(8, a)} opacity="0.4"/>`,
  gantry: (a) => `<circle cx="0" cy="-24" r="118" fill="${C.cream}"/><circle cx="0" cy="-24" r="66" fill="${shade(a, 0.3)}"/><circle cx="0" cy="-24" r="34" fill="${C.white}" opacity="0.7"/>
    <rect x="-180" y="8" width="320" height="26" rx="10" fill="${C.white}"/><rect x="-86" y="34" width="32" height="74" rx="6" fill="${C.stone}"/>`,
  skeleton: (a) => {
    const pts = [[0, -114], [0, -72], [-42, -62], [42, -62], [-62, -20], [62, -20], [0, -10], [-26, 42], [26, 42], [-32, 94], [32, 94]];
    const e = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [1, 6], [6, 7], [6, 8], [7, 9], [8, 10]];
    return e.map(([i, j]) => `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}" ${ln(5, a)}/>`).join('') +
      pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${NAVY}"/>`).join('');
  },
  trophy: (a) => `<path d="M-74 -116 H74 V-54 Q74 12 0 22 Q-74 12 -74 -54Z" fill="${C.butter}"/><path d="M0 -116 H74 V-54 Q74 12 0 22Z" fill="${shade(C.butter, -0.08)}"/>
    <path d="M-74 -94 Q-122 -94 -112 -52 Q-102 -22 -66 -26 M74 -94 Q122 -94 112 -52 Q102 -22 66 -26" ${ln(9, C.butter)}/>
    <rect x="-16" y="22" width="32" height="40" fill="${shade(C.butter, -0.08)}"/><rect x="-64" y="62" width="128" height="34" rx="6" fill="${NAVY}"/>`,
  medal: (a) => `<path d="M-50 -136 L-12 -44 H-36 L-74 -136Z" fill="${C.sky}"/><path d="M50 -136 L12 -44 H36 L74 -136Z" fill="${C.rose}"/>
    <circle cx="0" cy="12" r="62" fill="${C.butter}"/><circle cx="0" cy="12" r="40" fill="${shade(C.butter, -0.1)}"/>`,
  lightbulb: (a) => `<path d="M0 -116 C-64 -116 -88 -46 -52 -6 Q-36 12 -34 42 H34 Q36 12 52 -6 C88 -46 64 -116 0 -116Z" fill="${C.butter}"/>
    <rect x="-34" y="42" width="68" height="18" rx="5" fill="${C.slate}"/><rect x="-28" y="62" width="56" height="16" rx="5" fill="${C.slate}"/>
    <path d="M-16 4 Q0 -40 16 4" ${ln(4, C.clay)}/>
    ${[-150, -120, -60, -30].map((r) => `<path d="M0 -150 v-22" transform="rotate(${r + 90} 0 -46)" ${ln(6, C.butter)}/>`).join('')}`,
  gears: (a) => {
    const gear = (x, y, r, f) => {
      let t = '';
      for (let i = 0; i < 8; i++) t += `<rect x="${-r * 0.2}" y="${-r - 16}" width="${r * 0.4}" height="30" rx="5" transform="rotate(${i * 45})" fill="${f}"/>`;
      return `<g transform="translate(${x} ${y})">${t}<circle r="${r}" fill="${f}"/><circle r="${r * 0.36}" fill="${C.cream}"/></g>`;
    };
    return gear(-40, 12, 58, a) + gear(66, -50, 38, NAVY);
  },
  books: (a) => `<rect x="-110" y="22" width="220" height="40" rx="6" fill="${C.sky}"/><rect x="-94" y="-20" width="190" height="40" rx="6" fill="${C.blush}"/>
    <rect x="-78" y="-62" width="160" height="40" rx="6" fill="${C.sage}"/><rect x="-110" y="34" width="220" height="6" fill="${C.white}" opacity="0.6"/>
    <rect x="-94" y="-8" width="190" height="6" fill="${C.white}" opacity="0.6"/><rect x="-78" y="-50" width="160" height="6" fill="${C.white}" opacity="0.6"/>`,
  globe: (a) => `<circle r="104" fill="${C.powder}"/><path d="M-62 -62 Q-20 -84 -10 -42 Q-42 -20 -32 10 Q-72 22 -88 -20Z M20 -94 Q62 -72 52 -42 Q84 -10 72 30 Q42 20 32 -10 Q10 -42 20 -94Z M-20 42 Q20 30 32 72 Q0 94 -32 82Z" fill="${C.sage}"/>
    <ellipse rx="104" ry="38" ${ln(2, C.white)} opacity="0.7"/><path d="M0 -104 V104" ${ln(2, C.white)} opacity="0.7"/>`,
  puzzle: (a) => `<path d="M-100 -100 H-20 Q-30 -130 0 -130 Q30 -130 20 -100 H100 V-20 Q130 -30 130 0 Q130 30 100 20 V100 H20 Q30 70 0 70 Q-30 70 -20 100 H-100 V20 Q-70 30 -70 0 Q-70 -30 -100 -20Z" fill="${a}"/>
    <path d="M0 -100 V-20 H100 V20 H0 V100 M-100 0 H0" fill="none" stroke="${C.white}" stroke-width="4" opacity="0.7"/>`,
  hands: (a) => `<path d="M-130 44 Q-120 -30 -54 -22 Q-22 -18 -12 10 L-12 74 Q-64 96 -130 44Z" fill="${SKINS[1]}"/><path d="M130 44 Q120 -30 54 -22 Q22 -18 12 10 L12 74 Q64 96 130 44Z" fill="${SKINS[0]}"/>
    <path d="M0 -10 C-52 -52 -56 -104 -26 -114 C-10 -118 -2 -106 0 -96 C2 -106 10 -118 26 -114 C56 -104 52 -52 0 -10Z" fill="${C.rose}"/>`,
  tooth: (a) => `<path d="M-62 -72 Q-92 -72 -88 -30 Q-82 20 -62 82 Q-52 102 -38 82 L-16 32 Q0 22 16 32 L38 82 Q52 102 62 82 Q82 20 88 -30 Q92 -72 62 -72 Q32 -72 0 -58 Q-32 -72 -62 -72Z" fill="${C.white}"/>
    <path d="M0 -58 Q32 -72 62 -72 Q92 -72 88 -30 Q82 20 62 82 Q52 102 38 82 L16 32 Q8 26 0 26Z" fill="${shade(C.white, -0.06)}"/>
    <path d="M106 -104 L66 40" ${ln(12, a)}/><rect x="90" y="-138" width="30" height="42" rx="6" transform="rotate(16 105 -117)" fill="${C.white}"/>`,
  dome: (a) => `<path d="M-160 64 A160 160 0 0 1 160 64Z" fill="${C.cream}"/>
    <path d="M-106 64 A106 160 0 0 1 106 64 M-44 64 A44 160 0 0 1 44 64 M-150 12 Q0 -22 150 12 M-118 -52 Q0 -78 118 -52" ${ln(2.5, a)}/>
    <circle cx="64" cy="-30" r="14" fill="${C.butter}"/><circle cx="-74" cy="-8" r="10" fill="${C.rose}"/>`,
  podium: (a) => `<path d="M-94 -40 H94 L74 116 H-74Z" fill="${C.wood}"/><path d="M0 -40 H94 L74 116 H0Z" fill="${shade(C.wood, -0.08)}"/><rect x="-110" y="-62" width="220" height="26" rx="6" fill="${C.woodDark}"/>
    <circle cx="0" cy="34" r="20" fill="${a}"/><path d="M44 -62 Q62 -112 32 -134" ${ln(5, C.slate)}/><rect x="16" y="-156" width="30" height="40" rx="15" fill="${NAVY}"/>`,
  mic: (a) => `<rect x="-32" y="-116" width="64" height="100" rx="32" fill="${NAVY}"/><path d="M-54 -52 Q-54 12 0 12 Q54 12 54 -52" ${ln(8, C.slate)}/><path d="M0 12 V84 M-42 84 H42" ${ln(8, C.slate)}/>`,
  clipboard: (a) => `<rect x="-86" y="-106" width="172" height="222" rx="12" fill="${C.wood}"/><rect x="-68" y="-86" width="136" height="186" rx="6" fill="${C.white}"/>
    <rect x="-36" y="-120" width="72" height="30" rx="8" fill="${C.slate}"/>
    ${[-56, -16, 24, 64].map((y, i) => `<rect x="-50" y="${y - 9}" width="18" height="18" rx="4" fill="${[C.rose, a, C.butter, C.mint][i]}"/><rect x="-22" y="${y - 5}" width="${[72, 56, 66, 44][i]}" height="10" rx="5" fill="${C.stone}"/>`).join('')}`,
  chart: (a) => `<rect x="-140" y="-106" width="280" height="200" rx="14" fill="${C.white}"/>
    <rect x="-104" y="2" width="36" height="62" rx="4" fill="${C.blush}"/><rect x="-50" y="-40" width="36" height="104" rx="4" fill="${a}"/><rect x="4" y="-18" width="36" height="82" rx="4" fill="${C.butter}"/><rect x="58" y="-66" width="36" height="130" rx="4" fill="${C.sage}"/>
    <path d="M-108 -32 L-44 -72 L20 -52 L86 -88" ${ln(4, NAVY)}/><circle cx="86" cy="-88" r="6" fill="${NAVY}"/>`,
  radar: (a) => {
    const ring = (r) => Array.from({ length: 6 }, (_, i) => { const t = (Math.PI / 3) * i - Math.PI / 2; return `${(Math.cos(t) * r).toFixed(1)},${(Math.sin(t) * r).toFixed(1)}`; }).join(' ');
    const vals = [92, 60, 82, 52, 72, 86];
    const poly = vals.map((v, i) => { const t = (Math.PI / 3) * i - Math.PI / 2; return `${(Math.cos(t) * v).toFixed(1)},${(Math.sin(t) * v).toFixed(1)}`; }).join(' ');
    return `<polygon points="${ring(116)}" fill="${C.white}"/><polygon points="${ring(76)}" ${ln(2, C.stone)}/><polygon points="${ring(38)}" ${ln(2, C.stone)}/>
      <polygon points="${poly}" fill="${a}" opacity="0.75"/>`;
  },
  weather: (a) => `<circle cx="-50" cy="-44" r="48" fill="${C.butter}"/>
    <path d="M-40 44 Q-50 -6 0 -8 Q22 -50 66 -30 Q114 -30 114 14 Q132 42 100 58 H-20 Q-50 58 -40 44Z" fill="${C.white}"/>
    <path d="M10 84 q-8 14 0 18 q8 -4 0 -18 M50 90 q-8 14 0 18 q8 -4 0 -18" fill="${C.sky}"/>`,
  city: (a) => `<rect x="-160" y="-40" width="72" height="144" fill="${C.powder}"/><rect x="-82" y="-104" width="84" height="208" fill="${C.cream}"/>
    <rect x="10" y="-62" width="72" height="166" fill="${shade(a, 0.2)}"/><rect x="90" y="-12" width="66" height="116" fill="${C.sage}"/>
    ${[[-140, -10], [-112, 30], [-62, -80], [-30, -40], [-62, 0], [30, -30], [30, 20], [108, 20]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="22" rx="2" fill="${C.white}" opacity="0.8"/>`).join('')}`,
  magnifier: (a) => `<circle cx="-20" cy="-20" r="64" fill="${C.glass}"/><circle cx="-20" cy="-20" r="64" ${ln(12, NAVY)}/><path d="M28 28 L92 92" ${ln(20, NAVY)}/>`,
  signpost: (a) => `<rect x="-6" y="-124" width="12" height="236" rx="4" fill="${C.woodDark}"/>
    <path d="M-10 -104 H92 L120 -80 L92 -56 H-10Z" fill="${C.sage}"/><path d="M10 -34 H-92 L-120 -10 L-92 14 H10Z" fill="${C.blush}"/>`,
  mirror: (a) => `<ellipse cx="0" cy="-22" rx="82" ry="104" fill="${C.woodDark}"/><ellipse cx="0" cy="-22" rx="66" ry="88" fill="${C.glass}"/>
    <path d="M-30 -76 Q-10 -96 12 -86" ${ln(6, C.white)}/><path d="M0 82 V112 M-42 112 H42" ${ln(8, C.woodDark)}/>`,
  tree: (a) => `<rect x="-10" y="0" width="20" height="96" rx="6" fill="${C.woodDark}"/><circle cx="-40" cy="-20" r="52" fill="${C.sage}"/><circle cx="40" cy="-30" r="52" fill="${shade(C.sage, -0.08)}"/><circle cx="0" cy="-84" r="58" fill="${shade(C.sage, 0.1)}"/>`,
  rocket: (a) => `<path d="M0 -136 Q62 -84 52 32 H-52 Q-62 -84 0 -136Z" fill="${C.white}"/><path d="M0 -136 Q62 -84 52 32 H0Z" fill="${shade(C.white, -0.06)}"/><circle cx="0" cy="-52" r="22" fill="${a}"/>
    <path d="M-52 0 L-90 52 L-52 42Z M52 0 L90 52 L52 42Z" fill="${NAVY}"/><path d="M-26 36 Q0 116 26 36Z" fill="${C.clay}"/>`,
  poster: (a) => `<path d="M-62 124 L-20 62 M62 124 L20 62" ${ln(7, C.slate)}/><rect x="-106" y="-124" width="212" height="196" rx="8" fill="${C.white}"/>
    <rect x="-86" y="-104" width="172" height="58" rx="4" fill="${shade(a, 0.3)}"/><circle cx="-44" cy="2" r="26" fill="${C.blush}"/><rect x="0" y="-20" width="74" height="12" rx="6" fill="${C.stone}"/><rect x="0" y="4" width="52" height="12" rx="6" fill="${C.stone}"/>
    <rect x="-86" y="40" width="172" height="12" rx="6" fill="${C.stone}"/>`,
  journal: (a) => `<rect x="-90" y="-124" width="176" height="236" rx="8" fill="${a}"/><rect x="-90" y="-124" width="24" height="236" rx="6" fill="${shade(a, -0.15)}"/>
    <rect x="-40" y="-82" width="100" height="72" rx="6" fill="${C.white}" opacity="0.85"/><circle cx="10" cy="-46" r="18" fill="${C.butter}"/><rect x="-40" y="20" width="92" height="10" rx="5" fill="${C.white}" opacity="0.7"/>`,
};

// --- geometric accents ---------------------------------------------------------
const ACCENT = {
  dots: (c) => { let p = ''; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) p += `<circle cx="${i * 18}" cy="${j * 18}" r="3" fill="${c}"/>`; return p; },
  ring: (c) => `<circle r="34" ${ln(3, c)}/>`,
  plus: (c) => `<path d="M0 -14 V14 M-14 0 H14" ${ln(4, c)}/>`,
  wave: (c) => `<path d="M-50 0 q12.5 -14 25 0 t25 0 t25 0 t25 0" ${ln(4, c)}/>`,
  arc: (c) => `<path d="M-40 20 A40 40 0 0 1 40 20" ${ln(4, c)}/>`,
  disc: (c) => `<circle r="14" fill="${c}"/>`,
};

// --- composition ---------------------------------------------------------------
const PROP_SIZE = { pillow: 1.05, map: 1.15, dome: 1.05 };
// Props that stand on the floor: distance from origin to the prop's bottom edge.
const GROUNDED = { ambulance: 64, bot: 86, trophy: 96, hospital: 104, house: 104, tent: 84, bed: 72, ivstand: 120,
  podium: 116, mic: 84, tree: 96, signpost: 112, mirror: 112, city: 104, dome: 64, gantry: 108, monitor: 108, camera: 112, poster: 124 };

// Lay out props and figures; returns SVG markup.
function subjects(spec, { FLOOR, left, a, shadows = true, figures = true, propZoneOverride, propScale = 1 }) {
  let s = '';
  const chars = figures ? spec.chars || [] : [];
  const props = spec.props || [];
  const nC = chars.length;
  const nP = props.length;
  const charZone = nP === 0 ? [360, 840] : left ? [150, 150 + nC * 170] : [W - 150 - nC * 170, W - 150];
  const propZone = propZoneOverride || (nC === 0 ? [240, 960] : left ? [charZone[1] + 60, W - 90] : [90, charZone[0] - 60]);
  props.forEach((pr, i) => {
    const name = typeof pr === 'string' ? pr : pr.name;
    const span = (propZone[1] - propZone[0]) / nP;
    const x = propZone[0] + span * (i + 0.5);
    const big = i === 0 ? 1.1 : 0.88;
    const sc = Math.min(1.3 * propScale, (span / 270) * propScale) * big * (PROP_SIZE[name] || 1);
    const y = (typeof pr === 'object' && pr.y) || (GROUNDED[name] != null ? Math.round(FLOOR - GROUNDED[name] * sc) : (i % 2 === 0 ? 330 : 280));
    if (shadows && GROUNDED[name] != null) s += `<ellipse cx="${Math.round(x)}" cy="${FLOOR + 4}" rx="${Math.round(120 * sc)}" ry="10" fill="${NAVY}" opacity="0.08"/>`;
    s += g(Math.round(x), y, sc.toFixed(2), PROP[name](a));
  });
  chars.forEach((ch, i) => {
    const [type, ...mods] = ch.split(':');
    const span = (charZone[1] - charZone[0]) / nC;
    const x = charZone[0] + span * (i + 0.5);
    const opt = {};
    mods.forEach((m) => { opt[m] = true; });
    if (nC > 1 && i % 2 === 1) opt.flip = !opt.flip;
    const sc = nC >= 3 ? 1.08 : 1.2;
    if (shadows) s += `<ellipse cx="${Math.round(x)}" cy="${FLOOR + 4}" rx="${Math.round(52 * sc)}" ry="9" fill="${NAVY}" opacity="0.1"/>`;
    s += figure(type, Math.round(x), FLOOR, sc, opt);
  });
  return s;
}

function accents(spec, r, cols, list = ['dots', 'plus', 'wave', 'disc', 'ring']) {
  const spots = [[90, 90], [1080, 80], [560, 60], [1110, 330], [70, 380], [760, 140]];
  let s = '';
  list.slice(0, 5).forEach((k, i) => {
    const [x, y] = spots[(i + hash(spec.id)) % spots.length];
    s += `<g transform="translate(${x} ${y}) rotate(${Math.round((r() - 0.5) * 20)})" opacity="${k === 'dots' ? 0.45 : 0.75}">${ACCENT[k](cols[i % cols.length])}</g>`;
  });
  return s;
}

// Duotone (risograph-like) filter: maps luminance to navy -> accent -> light.
function duotone(a, bg) {
  const tone = [NAVY, NAVY, a, a, shade(a, 0.45), shade(bg, 0.4)];
  const ch = (k) => tone.map((t) => (parseInt(t.slice(1 + k * 2, 3 + k * 2), 16) / 255).toFixed(3)).join(' ');
  return `<filter id="duo" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncR type="table" tableValues="${ch(0)}"/><feFuncG type="table" tableValues="${ch(1)}"/><feFuncB type="table" tableValues="${ch(2)}"/></feComponentTransfer></filter>`;
}

// Styles: flat (default), line, mono, linemono (line art + duotone), minimal, glass
function scene(spec) {
  const style = spec.style || 'flat';
  const r = rng(hash(spec.id));
  const pal = PALETTES[spec.palette != null ? spec.palette : hash(spec.id) % PALETTES.length];
  const a = pal.accent;
  const [s1, s2, s3] = pal.shapes;
  const FLOOR = 560;
  const left = spec.side ? spec.side === 'left' : hash(spec.id) % 2 === 0;
  const cx = left ? 330 + r() * 60 : 870 - r() * 60;
  let s = '';
  let defs = '';

  if (style === 'flat' || style === 'mono') {
    s += `<rect width="${W}" height="${H}" fill="${pal.bg}"/>`;
    s += `<circle cx="${Math.round(cx)}" cy="${Math.round(260 + r() * 40)}" r="${Math.round(230 + r() * 30)}" fill="${s1}"/>`;
    const ax = left ? 820 + r() * 80 : 300 - r() * 80;
    s += `<path d="M${Math.round(ax - 150)} ${FLOOR} V300 A150 150 0 0 1 ${Math.round(ax + 150)} 300 V${FLOOR}Z" fill="${s2}"/>`;
    s += `<rect x="${Math.round(r() * 900 + 60)}" y="${Math.round(60 + r() * 60)}" width="${Math.round(140 + r() * 80)}" height="${Math.round(90 + r() * 50)}" rx="18" fill="${s3}" opacity="0.8"/>`;
    s += `<circle cx="${Math.round(cx + (left ? 200 : -200))}" cy="${Math.round(120 + r() * 60)}" r="${Math.round(70 + r() * 30)}" ${ln(2, NAVY)} opacity="0.35"/>`;
    s += `<rect x="0" y="${FLOOR}" width="${W}" height="${H - FLOOR}" fill="${shade(pal.bg, -0.03)}"/>`;
    s += `<path d="M60 ${FLOOR} H${W - 60}" ${ln(3, NAVY)}/>`;
    s += accents(spec, r, [NAVY, a, shade(s1, -0.2)]);
    s += subjects(spec, { FLOOR, left, a });
    if (style === 'mono') {
      defs += duotone(a, pal.bg);
      s = `<g filter="url(#duo)">${s}</g>`;
    }
  } else if (style === 'line' || style === 'linemono') {
    s += `<rect width="${W}" height="${H}" fill="${shade(pal.bg, 0.5)}"/>`;
    s += `<circle cx="${Math.round(cx)}" cy="300" r="250" fill="${s1}" opacity="0.7"/>`;
    s += `<rect x="${left ? 700 : 120}" y="150" width="380" height="300" rx="150" fill="${s2}" opacity="0.6"/>`;
    s += `<path d="M60 ${FLOOR} H${W - 60}" ${ln(3, NAVY)}/>`;
    s += accents(spec, r, [NAVY], ['plus', 'ring', 'wave', 'plus', 'dots']);
    s += `<g style="stroke:${NAVY};stroke-width:3.5;stroke-linejoin:round;stroke-linecap:round">${subjects(spec, { FLOOR, left, a, shadows: false })}</g>`;
    if (style === 'linemono') {
      defs += duotone(a, pal.bg);
      s = `<g filter="url(#duo)">${s}</g>`;
    }
  } else if (style === 'minimal') {
    s += `<rect width="${W}" height="${H}" fill="${pal.bg}"/>`;
    s += `<circle cx="600" cy="338" r="250" fill="${s1}"/>`;
    s += `<circle cx="${600 + 250 * Math.cos(-0.6)}" cy="${338 + 250 * Math.sin(-0.6)}" r="44" fill="${a}"/>`;
    s += `<circle cx="600" cy="338" r="300" ${ln(2, NAVY)} opacity="0.25"/>`;
    s += accents(spec, r, [NAVY, a], ['dots', 'plus', 'dots', 'plus']);
    const props = (spec.props || []).slice(0, 2);
    s += subjects({ ...spec, props }, { FLOOR: 470, left, a, figures: false, shadows: false, propZoneOverride: props.length > 1 ? [330, 870] : [450, 750], propScale: 1.2 });
  } else if (style === 'glass') {
    defs += `<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
      <linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(s1, 0.3)}"/><stop offset="1" stop-color="${shade(s2, 0.3)}"/></linearGradient>`;
    s += `<rect width="${W}" height="${H}" fill="url(#bgg)"/>`;
    s += `<g filter="url(#blur)"><circle cx="${Math.round(cx)}" cy="200" r="230" fill="${s1}"/><circle cx="${Math.round(W - cx)}" cy="480" r="260" fill="${s2}"/><circle cx="600" cy="300" r="150" fill="${a}" opacity="0.6"/></g>`;
    s += `<rect x="80" y="70" width="1040" height="535" rx="40" fill="#ffffff" opacity="0.38" stroke="#ffffff" stroke-width="2"/>`;
    s += `<path d="M120 ${FLOOR} H${W - 120}" ${ln(2, NAVY)} opacity="0.4"/>`;
    s += subjects(spec, { FLOOR, left, a });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs>${s}</svg>`;
}

module.exports = { scene, W, H, PROP, FIG, ACCENT };
