// Pastel, chibi-style thumbnail renderer (no text).
// Builds a 1200x675 SVG string from a scene spec; generate.js rasterizes it.
'use strict';

const W = 1200;
const H = 675;
const INK = '#6b5876';
const SKIN = '#ffe6d6';
const BLUSH = '#ffb3c1';
const SW = 5; // outline width

const PALETTES = [
  { bg: ['#fde2e4', '#e2ece9'], blob: '#fff1f3', ground: '#cfe8d5', accent: '#ffb5c2' },
  { bg: ['#e0f0ff', '#f3e8ff'], blob: '#f7fbff', ground: '#d6e7f7', accent: '#a8c8ff' },
  { bg: ['#fff4d6', '#ffe1e1'], blob: '#fffaf0', ground: '#ffe2b8', accent: '#ffc56e' },
  { bg: ['#e4f8ef', '#e6f0ff'], blob: '#f5fffa', ground: '#c7ecd9', accent: '#7fd6b0' },
  { bg: ['#f1e6ff', '#ffe6f2'], blob: '#fbf6ff', ground: '#e4d4f7', accent: '#c9a7f5' },
  { bg: ['#e3f6fb', '#fff0dc'], blob: '#f6fdff', ground: '#cdeaf2', accent: '#8fd3e8' },
  { bg: ['#fff0e6', '#e9f7e1'], blob: '#fff9f4', ground: '#dcefc8', accent: '#ffb38a' },
  { bg: ['#eaf0ff', '#e8fbf3'], blob: '#f7f9ff', ground: '#d5e0fa', accent: '#9fb4ff' },
];

const C = {
  pink: '#ffb5c2', rose: '#ff8fa3', peach: '#ffc9a8', orange: '#ffb26b', yellow: '#ffe28a',
  mint: '#a8e6cf', green: '#9ad9a8', teal: '#8fd3e8', sky: '#a8c8ff', blue: '#8fb0f0',
  lilac: '#c9b6f2', purple: '#b39ddb', cream: '#fff8ec', white: '#ffffff', gray: '#e6e1ea',
  wood: '#e6c39a', woodDark: '#c99a6b', red: '#ff9a9a', brown: '#b48a78', hair: '#8a6a5c',
  dark: '#5d4b66', glass: '#dff3ff',
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
const g = (x, y, s, body, extra = '') =>
  `<g transform="translate(${x} ${y}) scale(${s})" ${extra}>${body}</g>`;
const o = (fill, w = SW) => `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const line = (w = SW, color = INK) => `fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const face = (cx, cy, r = 1, mood = 'smile') => {
  const eyes = `<ellipse cx="${cx - 22 * r}" cy="${cy}" rx="${5.5 * r}" ry="${7 * r}" fill="${INK}"/>
    <ellipse cx="${cx + 22 * r}" cy="${cy}" rx="${5.5 * r}" ry="${7 * r}" fill="${INK}"/>
    <circle cx="${cx - 20 * r}" cy="${cy - 3 * r}" r="${2 * r}" fill="#fff"/>
    <circle cx="${cx + 24 * r}" cy="${cy - 3 * r}" r="${2 * r}" fill="#fff"/>`;
  const blush = `<ellipse cx="${cx - 38 * r}" cy="${cy + 16 * r}" rx="${11 * r}" ry="${7 * r}" fill="${BLUSH}" opacity="0.8"/>
    <ellipse cx="${cx + 38 * r}" cy="${cy + 16 * r}" rx="${11 * r}" ry="${7 * r}" fill="${BLUSH}" opacity="0.8"/>`;
  const mouth = mood === 'o'
    ? `<ellipse cx="${cx}" cy="${cy + 22 * r}" rx="${6 * r}" ry="${7 * r}" fill="${C.rose}" stroke="${INK}" stroke-width="${3 * r}"/>`
    : `<path d="M${cx - 9 * r} ${cy + 18 * r} Q${cx} ${cy + 28 * r} ${cx + 9 * r} ${cy + 18 * r}" ${line(3.5 * r)}/>`;
  return eyes + blush + mouth;
};

// --- characters ------------------------------------------------------------
// Feet at (0,0); about 290 units tall at scale 1.
const CHAR = {
  elder: { body: C.lilac, hair: '#f4f1f8', style: 'bun', glasses: true },
  carer: { body: C.mint, hair: C.hair, style: 'bob' },
  nurse: { body: C.pink, hair: '#7a5a50', style: 'bob', cap: true },
  doctor: { body: C.white, hair: '#6e5a52', style: 'short', coat: true },
  emt: { body: C.orange, hair: '#6e5a52', style: 'short', helmet: true },
  student: { body: C.sky, hair: '#5f4e58', style: 'short' },
  youth: { body: C.yellow, hair: '#9c7bb0', style: 'long' },
  coach: { body: C.peach, hair: '#7b5f52', style: 'short', glasses: true },
};

function character(type, x, y, s = 1, opt = {}) {
  const c = CHAR[type];
  const flip = opt.flip ? -1 : 1;
  const armL = opt.wave
    ? `<path d="M-52 -92 Q-95 -140 -88 -175" ${line(22, INK)}/><path d="M-52 -92 Q-95 -140 -88 -175" ${line(14, c.body)}/>`
    : `<path d="M-52 -92 Q-80 -60 -70 -36" ${line(22, INK)}/><path d="M-52 -92 Q-80 -60 -70 -36" ${line(14, c.body)}/>`;
  const armR = opt.reach
    ? `<path d="M52 -92 Q95 -96 112 -110" ${line(22, INK)}/><path d="M52 -92 Q95 -96 112 -110" ${line(14, c.body)}/><circle cx="114" cy="-111" r="12" ${o(SKIN, 4)}/>`
    : `<path d="M52 -92 Q80 -60 70 -36" ${line(22, INK)}/><path d="M52 -92 Q80 -60 70 -36" ${line(14, c.body)}/>`;
  let p = '';
  // legs & feet
  p += `<rect x="-34" y="-30" width="24" height="30" rx="10" ${o('#f7efe8', 4)}/>
        <rect x="10" y="-30" width="24" height="30" rx="10" ${o('#f7efe8', 4)}/>
        <ellipse cx="-24" cy="0" rx="22" ry="11" ${o(C.dark, 3)}/><ellipse cx="24" cy="0" rx="22" ry="11" ${o(C.dark, 3)}/>`;
  p += armL + armR;
  // body
  p += `<path d="M-50 -120 Q-60 -20 -46 -24 L46 -24 Q60 -20 50 -120 Q0 -140 -50 -120Z" ${o(c.body)}/>`;
  if (c.coat) p += `<path d="M0 -126 L-16 -96 M0 -126 L16 -96" ${line(4)}/><path d="M-30 -112 Q-40 -70 -14 -62" ${line(4, '#88b7c9')}/><circle cx="-12" cy="-60" r="7" ${o('#88b7c9', 3)}/>`;
  if (type === 'carer') p += `<path d="M-30 -96 L30 -96 L26 -40 L-26 -40Z" ${o('#ffffff', 4)}/><circle cx="0" cy="-70" r="7" fill="${C.pink}"/>`;
  // head
  const hy = -190;
  if (c.style === 'long') p += `<path d="M-74 ${hy} Q-82 ${hy + 90} -50 ${hy + 86} L50 ${hy + 86} Q82 ${hy + 90} 74 ${hy}Z" ${o(c.hair)}/>`;
  p += `<circle cx="0" cy="${hy}" r="74" ${o(SKIN)}/>`;
  if (c.style === 'bun') {
    p += `<circle cx="0" cy="${hy - 78}" r="26" ${o(c.hair)}/>`;
    p += `<path d="M-74 ${hy + 2} Q-78 ${hy - 70} 0 ${hy - 72} Q78 ${hy - 70} 74 ${hy + 2} Q52 ${hy - 36} 0 ${hy - 38} Q-52 ${hy - 36} -74 ${hy + 2}Z" ${o(c.hair)}/>`;
  } else if (c.style === 'bob' || c.style === 'long') {
    p += `<path d="M-78 ${hy + 24} Q-84 ${hy - 76} 0 ${hy - 78} Q84 ${hy - 76} 78 ${hy + 24} Q66 ${hy - 26} 20 ${hy - 34} Q0 ${hy - 14} -24 ${hy - 34} Q-66 ${hy - 26} -78 ${hy + 24}Z" ${o(c.hair)}/>`;
  } else {
    p += `<path d="M-74 ${hy} Q-80 ${hy - 78} 0 ${hy - 78} Q80 ${hy - 78} 74 ${hy} Q56 ${hy - 44} 10 ${hy - 46} Q-40 ${hy - 30} -74 ${hy}Z" ${o(c.hair)}/>`;
  }
  if (c.cap) p += `<path d="M-44 ${hy - 62} Q0 ${hy - 104} 44 ${hy - 62} L36 ${hy - 46} Q0 ${hy - 60} -36 ${hy - 46}Z" ${o('#ffffff', 4)}/>
      <path d="M0 ${hy - 82} v16 M-8 ${hy - 74} h16" ${line(4, C.rose)}/>`;
  if (c.helmet) p += `<path d="M-70 ${hy - 20} Q-70 ${hy - 88} 0 ${hy - 90} Q70 ${hy - 88} 70 ${hy - 20}Z" ${o(C.orange)}/><rect x="-78" y="${hy - 28}" width="156" height="14" rx="7" ${o('#ffffff', 4)}/>`;
  p += face(0, hy + 8, 1, opt.mood);
  if (c.glasses && !opt.vr) p += `<circle cx="-22" cy="${hy + 8}" r="17" ${line(3.5)}/><circle cx="22" cy="${hy + 8}" r="17" ${line(3.5)}/><path d="M-5 ${hy + 8} h10" ${line(3.5)}/>`;
  if (opt.vr) p += `<rect x="-62" y="${hy - 22}" width="124" height="54" rx="22" ${o(C.lilac)}/>
      <rect x="-50" y="${hy - 12}" width="100" height="34" rx="15" fill="#efe7ff" opacity="0.8"/>
      <path d="M-74 ${hy - 2} h-8 M74 ${hy - 2} h8" ${line(10)}/>
      <circle cx="-24" cy="${hy + 4}" r="5" fill="#fff"/><circle cx="30" cy="${hy + 2}" r="3" fill="#fff"/>`;
  return g(x, y, s, `<g transform="scale(${flip} 1)">${p}</g>`);
}

// --- props (centered at 0,0, roughly 200 units) -----------------------------
const PROP = {
  monitor: (a) => `<rect x="-110" y="-90" width="220" height="150" rx="22" ${o(C.cream)}/>
    <rect x="-92" y="-74" width="184" height="116" rx="14" fill="${a}" opacity="0.55"/>
    <path d="M-16 -40 L28 -16 L-16 8Z" ${o('#ffffff', 4)}/>
    <rect x="-70" y="22" width="140" height="10" rx="5" fill="#ffffff" opacity="0.9"/><rect x="-70" y="22" width="60" height="10" rx="5" fill="${C.rose}"/>
    <path d="M-20 60 L-30 96 M20 60 L30 96" ${line()}/><rect x="-56" y="92" width="112" height="16" rx="8" ${o(C.gray, 4)}/>`,
  laptop: (a) => `<rect x="-100" y="-80" width="200" height="130" rx="16" ${o(C.cream)}/><rect x="-84" y="-66" width="168" height="102" rx="10" fill="${a}" opacity="0.55"/>
    <circle cx="-30" cy="-16" r="18" ${o(SKIN, 3)}/><circle cx="30" cy="-16" r="18" ${o(SKIN, 3)}/><path d="M-48 16 Q-30 0 -12 16 M12 16 Q30 0 48 16" ${line(4)}/>
    <path d="M-130 50 L130 50 L112 76 L-112 76Z" ${o(C.gray)}/>`,
  camera: (a) => `<rect x="-80" y="-50" width="130" height="96" rx="22" ${o(a)}/><path d="M50 -24 L96 -48 L96 40 L50 18Z" ${o(C.cream)}/>
    <circle cx="-16" cy="-2" r="30" ${o('#ffffff')}/><circle cx="-16" cy="-2" r="14" fill="${C.dark}"/><circle cx="-10" cy="-8" r="5" fill="#fff"/>
    <circle cx="-62" cy="-34" r="6" fill="${C.rose}"/><path d="M-20 46 L-40 96 M-20 46 L0 96 M-20 46 L-20 96" ${line()}/>`,
  phone: (a) => `<rect x="-60" y="-100" width="120" height="200" rx="24" ${o(C.cream)}/><rect x="-46" y="-80" width="92" height="150" rx="12" fill="${a}" opacity="0.45"/>
    <rect x="-38" y="-68" width="56" height="26" rx="13" fill="#fff"/><rect x="-12" y="-32" width="50" height="26" rx="13" fill="${C.pink}"/><rect x="-38" y="4" width="62" height="26" rx="13" fill="#fff"/>
    <circle cx="0" cy="84" r="7" fill="${INK}" opacity="0.5"/>`,
  bubbles: (a) => `<path d="M-110 -70 h120 a26 26 0 0 1 26 26 v32 a26 26 0 0 1 -26 26 h-70 l-30 26 l4 -26 h-24 a26 26 0 0 1 -26 -26 v-32 a26 26 0 0 1 26 -26Z" ${o('#ffffff')}/>
    <circle cx="-66" cy="-28" r="9" fill="${a}"/><circle cx="-36" cy="-28" r="9" fill="${a}"/><circle cx="-6" cy="-28" r="9" fill="${a}"/>
    <path d="M10 22 h88 a24 24 0 0 1 24 24 v26 a24 24 0 0 1 -24 24 h-8 l4 24 l-30 -24 h-54 a24 24 0 0 1 -24 -24 v-26 a24 24 0 0 1 24 -24Z" ${o(C.pink)}/>
    <path d="M40 60 h50" ${line(6, '#ffffff')}/>`,
  thought: () => `<g><circle cx="-60" cy="-30" r="44" ${o(C.pink)}/><circle cx="20" cy="-56" r="50" ${o(C.sky)}/><circle cx="84" cy="-4" r="40" ${o(C.yellow)}/><circle cx="-6" cy="22" r="42" ${o(C.mint)}/>
    <path d="M-66 -34 l10 -10 M14 -60 a10 10 0 1 1 14 0 M78 -6 h14 M-14 22 l8 8 l14 -16" ${line(5)}/>
    <circle cx="-50" cy="74" r="12" ${o('#ffffff', 4)}/><circle cx="-72" cy="98" r="7" ${o('#ffffff', 4)}/></g>`,
  brain: () => `<path d="M-90 10 Q-110 -50 -60 -74 Q-40 -110 0 -90 Q40 -112 66 -76 Q112 -56 96 0 Q110 44 64 62 Q30 90 0 70 Q-36 92 -64 62 Q-108 50 -90 10Z" ${o(C.pink)}/>
    <path d="M0 -88 Q-14 -10 0 70 M-56 -40 Q-30 -30 -40 0 M48 -46 Q24 -20 50 8 M-62 30 Q-36 20 -24 40 M30 40 Q50 24 70 36" ${line(5)}/>
    ${face(0, -8, 0.7)}`,
  graph: (a) => {
    const n = [[-90, -50], [0, -90], [86, -40], [-60, 60], [40, 50], [100, 70], [-10, -10]];
    const e = [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [4, 5], [2, 5], [0, 3], [1, 2]];
    const cols = [C.pink, C.sky, C.yellow, C.mint, C.lilac, C.peach, a];
    return e.map(([i, j]) => `<line x1="${n[i][0]}" y1="${n[i][1]}" x2="${n[j][0]}" y2="${n[j][1]}" ${line(6)}/>`).join('') +
      n.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 6 ? 30 : 20}" ${o(cols[i])}/>`).join('') +
      `<circle cx="-16" cy="-16" r="4" fill="${INK}"/><circle cx="-4" cy="-16" r="4" fill="${INK}"/>`;
  },
  bot: (a) => `<path d="M0 -118 v-22" ${line(5)}/><circle cx="0" cy="-146" r="12" ${o(C.yellow, 4)}/>
    <rect x="-80" y="-118" width="160" height="120" rx="42" ${o('#ffffff')}/><rect x="-60" y="-96" width="120" height="74" rx="30" fill="${a}" opacity="0.5"/>
    <ellipse cx="-26" cy="-60" rx="9" ry="12" fill="${INK}"/><ellipse cx="26" cy="-60" rx="9" ry="12" fill="${INK}"/>
    <path d="M-12 -38 Q0 -30 12 -38" ${line(4)}/><ellipse cx="-52" cy="-40" rx="10" ry="6" fill="${BLUSH}"/><ellipse cx="52" cy="-40" rx="10" ry="6" fill="${BLUSH}"/>
    <rect x="-56" y="10" width="112" height="78" rx="30" ${o(C.cream)}/><circle cx="0" cy="48" r="14" fill="${C.pink}"/>
    <path d="M-60 34 Q-94 40 -96 70 M60 34 Q94 40 96 70" ${line(14, INK)}/><path d="M-60 34 Q-94 40 -96 70 M60 34 Q94 40 96 70" ${line(7, '#ffffff')}/>`,
  heart: () => `<path d="M0 70 C-90 10 -100 -60 -50 -76 C-22 -86 -4 -66 0 -50 C4 -66 22 -86 50 -76 C100 -60 90 10 0 70Z" ${o(C.rose)}/><ellipse cx="-44" cy="-42" rx="14" ry="9" fill="#fff" opacity="0.7"/>`,
  ecg: (a) => `<rect x="-120" y="-80" width="240" height="160" rx="26" ${o(C.cream)}/><rect x="-102" y="-62" width="204" height="110" rx="16" fill="${a}" opacity="0.4"/>
    <path d="M-92 -6 h40 l14 -36 l20 70 l18 -60 l12 26 h70" ${line(7, C.rose)}/><circle cx="-80" cy="64" r="7" fill="${C.green}"/><circle cx="-56" cy="64" r="7" fill="${C.yellow}"/>`,
  ambulance: () => `<path d="M-130 30 V-50 Q-130 -66 -114 -66 H40 Q56 -66 64 -52 L100 -10 Q120 -6 120 14 V30Z" ${o('#ffffff')}/>
    <path d="M60 -50 L92 -12 H44 V-50Z" ${o(C.glass, 4)}/><rect x="-100" y="-12" width="120" height="16" rx="8" fill="${C.rose}"/>
    <path d="M-58 -50 v32 M-74 -34 h32" ${line(9, C.rose)}/><rect x="-40" y="-86" width="40" height="20" rx="8" ${o(C.sky, 4)}/>
    <circle cx="-74" cy="36" r="24" ${o(C.dark)}/><circle cx="-74" cy="36" r="9" fill="${C.gray}"/><circle cx="66" cy="36" r="24" ${o(C.dark)}/><circle cx="66" cy="36" r="9" fill="${C.gray}"/>`,
  map: (a) => {
    let p = `<path d="M-160 -100 L-50 -80 L50 -110 L160 -86 L160 100 L50 78 L-50 106 L-160 84Z" ${o(C.cream)}/>`;
    p += `<path d="M-50 -80 V106 M50 -110 V78" ${line(4)} opacity="0.5"/>`;
    for (let i = -120; i <= 120; i += 60) p += `<path d="M${i} -90 V90" ${line(2)} opacity="0.25"/>`;
    for (let j = -60; j <= 60; j += 40) p += `<path d="M-150 ${j} H150" ${line(2)} opacity="0.25"/>`;
    p += `<circle cx="-70" cy="-10" r="44" fill="${C.rose}" opacity="0.35"/><circle cx="60" cy="30" r="56" fill="${a}" opacity="0.45"/><circle cx="20" cy="-40" r="30" fill="${C.yellow}" opacity="0.5"/>`;
    p += `<path d="M-70 -40 a22 22 0 1 1 0.1 0 Z" transform="translate(0 0)" fill="none"/>`;
    const pin = (x, y, f) => `<path d="M${x} ${y} C${x - 26} ${y - 30} ${x - 22} ${y - 56} ${x} ${y - 56} C${x + 22} ${y - 56} ${x + 26} ${y - 30} ${x} ${y}Z" ${o(f, 4)}/><circle cx="${x}" cy="${y - 36}" r="7" fill="#fff"/>`;
    return p + pin(-70, -6, C.rose) + pin(64, 30, C.blue) + pin(20, -40, C.orange);
  },
  hospital: () => `<rect x="-110" y="-80" width="220" height="180" rx="16" ${o(C.cream)}/><rect x="-46" y="-130" width="92" height="60" rx="12" ${o('#ffffff')}/>
    <path d="M0 -118 v36 M-18 -100 h36" ${line(10, C.rose)}/>
    ${[-70, -20, 30].map((x) => [-50, 0].map((y) => `<rect x="${x}" y="${y}" width="40" height="34" rx="8" ${o(C.glass, 4)}/>`).join('')).join('')}
    <path d="M-30 100 V56 Q0 36 30 56 V100" ${o(C.sky, 4)}/>`,
  house: (a) => `<path d="M-110 -10 L0 -110 L110 -10" ${o(a)}/><rect x="-90" y="-20" width="180" height="120" rx="12" ${o(C.cream)}/>
    <path d="M-110 -10 L0 -110 L110 -10 Z" ${o(a)}/><rect x="-60" y="10" width="46" height="40" rx="8" ${o(C.glass, 4)}/><path d="M24 100 V40 Q44 26 64 40 V100" ${o(C.peach, 4)}/>
    <circle cx="-37" cy="30" r="8" fill="${C.yellow}"/>`,
  tent: () => `<path d="M-140 80 L0 -100 L140 80Z" ${o(C.cream)}/><path d="M0 -100 L-40 80 H40Z" ${o(C.sky, 4)}/>
    <rect x="-100" y="-10" width="50" height="50" rx="10" ${o('#ffffff', 4)}/><path d="M-75 0 v30 M-90 15 h30" ${line(8, C.rose)}/><path d="M-160 80 H160" ${line()}/>`,
  bed: (a) => `<rect x="-150" y="-10" width="300" height="56" rx="18" ${o(C.cream)}/><rect x="-150" y="-80" width="24" height="150" rx="10" ${o(C.woodDark)}/>
    <rect x="126" y="-40" width="24" height="110" rx="10" ${o(C.woodDark)}/><rect x="-118" y="-40" width="80" height="34" rx="16" ${o('#ffffff', 4)}/>
    <path d="M-30 -14 Q60 -50 120 -14 Z" ${o(a, 4)}/>`,
  pillow: () => {
    let p = `<path d="M-120 -40 Q0 -80 120 -40 Q140 0 120 40 Q0 80 -120 40 Q-140 0 -120 -40Z" ${o('#ffffff')}/>`;
    for (let i = -90; i <= 90; i += 30) p += `<path d="M${i} -48 Q${i + 20} 0 ${i} 48" ${line(3, C.teal)}/>`;
    for (let j = -30; j <= 30; j += 20) p += `<path d="M-110 ${j} H110" ${line(3, C.teal)} opacity="0.6"/>`;
    return p;
  },
  ivstand: () => `<path d="M0 -150 V120 M-50 120 H50" ${line(8)}/><path d="M-40 -150 H40" ${line(8)}/>
    <rect x="-30" y="-150" width="40" height="70" rx="14" ${o(C.glass, 4)}/><rect x="-26" y="-110" width="32" height="26" rx="10" fill="${C.sky}" opacity="0.7"/>
    <path d="M-10 -80 Q-20 -20 30 0" ${line(4, C.teal)}/><rect x="-70" y="10" width="140" height="70" rx="16" ${o(C.wood)}/>
    <path d="M-50 30 h100 M-50 52 h100" ${line(3, C.woodDark)}/>`,
  controller: (a) => `<path d="M-120 -20 Q-120 -60 -76 -60 H76 Q120 -60 120 -20 L136 40 Q144 80 104 80 Q80 80 64 50 H-64 Q-80 80 -104 80 Q-144 80 -136 40Z" ${o(a)}/>
    <path d="M-80 -20 v40 M-100 0 h40" ${line(12, '#ffffff')}/><circle cx="66" cy="-14" r="13" ${o(C.yellow, 4)}/><circle cx="96" cy="12" r="13" ${o(C.pink, 4)}/><circle cx="40" cy="12" r="13" ${o(C.mint, 4)}/>`,
  rhythm: (a) => `<rect x="-150" y="-60" width="300" height="130" rx="30" ${o(C.cream)}/>
    ${[-100, -34, 32, 98].map((x, i) => `<circle cx="${x}" cy="40" r="22" ${o([C.pink, C.sky, C.yellow, C.mint][i], 4)}/>`).join('')}
    <circle cx="-34" cy="-20" r="16" fill="${a}" opacity="0.8"/><circle cx="98" cy="-36" r="16" fill="${C.pink}" opacity="0.8"/><circle cx="-100" cy="-10" r="16" fill="${C.yellow}" opacity="0.8"/>`,
  footprints: () => {
    const f = (x, y, r, c) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="0" rx="20" ry="30" ${o(c, 4)}/><circle cx="-12" cy="-40" r="6" ${o(c, 3)}/><circle cx="0" cy="-44" r="6" ${o(c, 3)}/><circle cx="12" cy="-40" r="6" ${o(c, 3)}/></g>`;
    return f(-110, 60, 70, C.peach) + f(-40, 10, 70, C.pink) + f(30, 50, 70, C.peach) + f(100, 0, 70, C.pink);
  },
  sensor: (a) => `<circle cx="0" cy="40" r="26" ${o(a)}/><circle cx="0" cy="40" r="9" fill="#fff"/>
    <path d="M-40 4 Q0 -30 40 4 M-70 -24 Q0 -84 70 -24 M-100 -52 Q0 -138 100 -52" ${line(8, INK)}/><path d="M-40 4 Q0 -30 40 4 M-70 -24 Q0 -84 70 -24 M-100 -52 Q0 -138 100 -52" ${line(4, a)}/>`,
  gantry: (a) => `<circle cx="0" cy="-20" r="110" ${o(C.cream)}/><circle cx="0" cy="-20" r="62" ${o(a)}/>
    <rect x="-170" y="10" width="300" height="28" rx="14" ${o(C.white)}/><rect x="-80" y="38" width="30" height="70" rx="8" ${o(C.gray, 4)}/>
    <circle cx="0" cy="-20" r="30" fill="#fff" opacity="0.6"/>`,
  skeleton: (a) => {
    const pts = [[0, -110], [0, -70], [-40, -60], [40, -60], [-60, -20], [60, -20], [0, -10], [-24, 40], [24, 40], [-30, 90], [30, 90]];
    const e = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [1, 6], [6, 7], [6, 8], [7, 9], [8, 10]];
    return e.map(([i, j]) => `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}" ${line(7, a)}/>`).join('') +
      pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" ${o('#ffffff', 4)}/>`).join('');
  },
  trophy: () => `<path d="M-70 -110 H70 V-50 Q70 10 0 20 Q-70 10 -70 -50Z" ${o(C.yellow)}/><path d="M-70 -90 Q-120 -90 -110 -50 Q-100 -20 -64 -24 M70 -90 Q120 -90 110 -50 Q100 -20 64 -24" ${line()}/>
    <rect x="-16" y="20" width="32" height="40" ${o(C.yellow, 4)}/><rect x="-60" y="60" width="120" height="36" rx="10" ${o(C.woodDark)}/>
    <path d="M0 -90 l10 22 l24 2 l-18 16 l6 24 l-22 -12 l-22 12 l6 -24 l-18 -16 l24 -2Z" fill="#fff" opacity="0.85"/>`,
  medal: () => `<path d="M-50 -130 L-10 -40 M50 -130 L10 -40" ${line(26, INK)}/><path d="M-50 -130 L-10 -40" ${line(18, C.sky)}/><path d="M50 -130 L10 -40" ${line(18, C.pink)}/>
    <circle cx="0" cy="10" r="60" ${o(C.yellow)}/><circle cx="0" cy="10" r="38" fill="#fff4c2"/><path d="M0 -14 l9 18 l20 2 l-15 13 l5 20 l-19 -10 l-19 10 l5 -20 l-15 -13 l20 -2Z" fill="${C.orange}"/>`,
  lightbulb: () => `<path d="M0 -110 C-62 -110 -84 -44 -50 -6 Q-34 12 -32 40 H32 Q34 12 50 -6 C84 -44 62 -110 0 -110Z" ${o(C.yellow)}/>
    <rect x="-32" y="40" width="64" height="20" rx="6" ${o(C.gray, 4)}/><rect x="-26" y="60" width="52" height="18" rx="6" ${o(C.gray, 4)}/>
    <path d="M-16 0 Q0 -40 16 0" ${line(4, C.orange)}/><ellipse cx="-30" cy="-70" rx="12" ry="20" fill="#fff" opacity="0.7"/>`,
  gears: (a) => {
    const gear = (x, y, r, f) => {
      let t = '';
      for (let i = 0; i < 8; i++) t += `<rect x="${-r * 0.18}" y="${-r - 16}" width="${r * 0.36}" height="30" rx="6" transform="rotate(${i * 45})" ${o(f, 4)}/>`;
      return `<g transform="translate(${x} ${y})">${t}<circle r="${r}" ${o(f)}/><circle r="${r * 0.35}" ${o('#ffffff', 4)}/></g>`;
    };
    return gear(-36, 10, 56, a) + gear(64, -46, 36, C.yellow);
  },
  books: () => `<rect x="-100" y="20" width="200" height="40" rx="10" ${o(C.sky)}/><rect x="-86" y="-20" width="176" height="40" rx="10" ${o(C.pink)}/>
    <rect x="-70" y="-60" width="150" height="40" rx="10" ${o(C.mint)}/><path d="M-80 40 h150 M-66 0 h130 M-50 -40 h104" ${line(3)} opacity="0.4"/>
    <path d="M40 -60 V-20 l14 -10 l14 10 V-60" ${o(C.yellow, 3)}/>`,
  globe: (a) => `<circle r="100" ${o(C.sky)}/><path d="M-60 -60 Q-20 -80 -10 -40 Q-40 -20 -30 10 Q-70 20 -84 -20Z M20 -90 Q60 -70 50 -40 Q80 -10 70 30 Q40 20 30 -10 Q10 -40 20 -90Z M-20 40 Q20 30 30 70 Q0 90 -30 80Z" ${o(C.green, 4)}/>
    <ellipse rx="100" ry="36" ${line(3)} opacity="0.4"/><path d="M0 -100 V100" ${line(3)} opacity="0.4"/>`,
  puzzle: (a) => `<path d="M-100 -100 H-20 Q-30 -130 0 -130 Q30 -130 20 -100 H100 V-20 Q130 -30 130 0 Q130 30 100 20 V100 H20 Q30 70 0 70 Q-30 70 -20 100 H-100 V20 Q-70 30 -70 0 Q-70 -30 -100 -20Z" ${o(a)}/>
    <path d="M0 -100 V100 M-100 0 H100" ${line(4)} opacity="0.35"/>`,
  hands: () => `<path d="M-120 40 Q-110 -30 -50 -20 Q-20 -16 -10 10 L-10 70 Q-60 90 -120 40Z" ${o(SKIN)}/><path d="M120 40 Q110 -30 50 -20 Q20 -16 10 10 L10 70 Q60 90 120 40Z" ${o(SKIN)}/>
    <path d="M0 -10 C-50 -50 -54 -100 -24 -110 C-10 -114 -2 -102 0 -92 C2 -102 10 -114 24 -110 C54 -100 50 -50 0 -10Z" ${o(C.rose)}/>`,
  tooth: () => `<path d="M-60 -70 Q-90 -70 -86 -30 Q-80 20 -60 80 Q-50 100 -36 80 L-16 30 Q0 20 16 30 L36 80 Q50 100 60 80 Q80 20 86 -30 Q90 -70 60 -70 Q30 -70 0 -56 Q-30 -70 -60 -70Z" ${o('#ffffff')}/>
    ${face(0, -20, 0.6)}<path d="M100 -100 L60 40" ${line(14, INK)}/><path d="M100 -100 L60 40" ${line(8, C.sky)}/><rect x="86" y="-130" width="30" height="40" rx="8" transform="rotate(16 100 -110)" ${o('#ffffff', 4)}/>`,
  dome: (a) => `<path d="M-150 60 A150 150 0 0 1 150 60Z" ${o(C.cream)}/><path d="M-150 60 A150 150 0 0 1 150 60" ${line(4)}/>
    <path d="M-100 60 A100 150 0 0 1 100 60 M-40 60 A40 150 0 0 1 40 60 M-140 10 Q0 -20 140 10 M-110 -50 Q0 -74 110 -50" ${line(3, a)}/>
    <path d="M-160 60 H160" ${line()}/><circle cx="60" cy="-30" r="14" fill="${C.yellow}"/><circle cx="-70" cy="-10" r="10" fill="${C.pink}"/>`,
  podium: (a) => `<path d="M-90 -40 H90 L70 110 H-70Z" ${o(C.wood)}/><rect x="-104" y="-60" width="208" height="28" rx="10" ${o(C.woodDark)}/>
    <circle cx="0" cy="30" r="22" fill="${a}" opacity="0.9"/><path d="M40 -60 Q60 -110 30 -130" ${line(5)}/><rect x="16" y="-150" width="30" height="40" rx="15" ${o(C.gray, 4)}/>`,
  mic: () => `<rect x="-30" y="-110" width="60" height="96" rx="30" ${o(C.gray)}/><path d="M-30 -80 h60 M-30 -56 h60" ${line(3)} opacity="0.5"/>
    <path d="M-52 -50 Q-52 10 0 10 Q52 10 52 -50" ${line()}/><path d="M0 10 V80 M-40 80 H40" ${line(7)}/>`,
  clipboard: (a) => `<rect x="-80" y="-100" width="160" height="210" rx="18" ${o(C.wood)}/><rect x="-62" y="-80" width="124" height="176" rx="10" ${o('#ffffff', 4)}/>
    <rect x="-34" y="-114" width="68" height="30" rx="10" ${o(C.gray, 4)}/>
    ${[-50, -10, 30, 70].map((y, i) => `<circle cx="-40" cy="${y}" r="9" fill="${[C.pink, a, C.yellow, C.mint][i]}"/><rect x="-22" y="${y - 6}" width="${[70, 54, 64, 40][i]}" height="12" rx="6" fill="${C.gray}"/>`).join('')}`,
  chart: (a) => `<rect x="-130" y="-100" width="260" height="190" rx="22" ${o(C.cream)}/>
    <rect x="-96" y="0" width="36" height="60" rx="8" ${o(C.pink, 4)}/><rect x="-46" y="-40" width="36" height="100" rx="8" ${o(a, 4)}/><rect x="4" y="-20" width="36" height="80" rx="8" ${o(C.yellow, 4)}/><rect x="54" y="-64" width="36" height="124" rx="8" ${o(C.mint, 4)}/>
    <path d="M-100 -30 L-40 -70 L20 -50 L84 -84" ${line(5, C.rose)}/>`,
  radar: (a) => {
    const ring = (r) => Array.from({ length: 6 }, (_, i) => { const t = (Math.PI / 3) * i - Math.PI / 2; return `${Math.cos(t) * r},${Math.sin(t) * r}`; }).join(' ');
    const vals = [90, 60, 80, 50, 70, 85];
    const poly = vals.map((v, i) => { const t = (Math.PI / 3) * i - Math.PI / 2; return `${Math.cos(t) * v},${Math.sin(t) * v}`; }).join(' ');
    return `<polygon points="${ring(110)}" ${o(C.cream)}/><polygon points="${ring(70)}" ${line(3)} opacity="0.4"/><polygon points="${ring(35)}" ${line(3)} opacity="0.4"/>
      <polygon points="${poly}" fill="${a}" opacity="0.65" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  },
  weather: () => `<circle cx="-50" cy="-40" r="46" ${o(C.yellow)}/>${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<path d="M-50 -104 v-18" transform="rotate(${r} -50 -40)" ${line(6, C.orange)}/>`).join('')}
    <path d="M-40 40 Q-50 -10 0 -10 Q20 -50 64 -30 Q110 -30 110 14 Q130 40 100 56 H-20 Q-50 56 -40 40Z" ${o('#ffffff')}/>
    <path d="M10 80 q-8 14 0 18 q8 -4 0 -18 M50 86 q-8 14 0 18 q8 -4 0 -18" ${o(C.sky, 3)}/>`,
  city: (a) => `<rect x="-150" y="-40" width="70" height="140" rx="10" ${o(C.sky)}/><rect x="-74" y="-100" width="80" height="200" rx="10" ${o(C.cream)}/>
    <rect x="12" y="-60" width="70" height="160" rx="10" ${o(a)}/><rect x="88" y="-10" width="64" height="110" rx="10" ${o(C.mint)}/>
    ${[-130, -54, -24, 32, 108].map((x, i) => `<rect x="${x}" y="${[-10, -70, -20, -30, 20][i]}" width="20" height="20" rx="5" fill="#fff" opacity="0.85"/>`).join('')}
    <path d="M-170 100 H170" ${line()}/>`,
  magnifier: () => `<circle cx="-20" cy="-20" r="62" ${o(C.glass)}/><path d="M24 24 L90 90" ${line(24, INK)}/><path d="M24 24 L90 90" ${line(14, C.woodDark)}/>
    <ellipse cx="-44" cy="-44" rx="14" ry="20" fill="#fff" opacity="0.8" transform="rotate(-30 -44 -44)"/>`,
  signpost: () => `<path d="M0 -120 V110" ${line(12, INK)}/><path d="M0 -120 V110" ${line(6, C.woodDark)}/>
    <path d="M-10 -100 H90 L120 -76 L90 -52 H-10Z" ${o(C.mint)}/><path d="M10 -30 H-90 L-120 -6 L-90 18 H10Z" ${o(C.pink)}/><ellipse cx="0" cy="110" rx="60" ry="12" fill="${INK}" opacity="0.15"/>`,
  mirror: (a) => `<ellipse cx="0" cy="-20" rx="80" ry="100" ${o(C.woodDark)}/><ellipse cx="0" cy="-20" rx="62" ry="82" ${o(C.glass, 4)}/>
    <path d="M-30 -70 Q-10 -90 10 -80" ${line(6, '#ffffff')}/><path d="M0 80 V110 M-40 110 H40" ${line(8)}/>`,
  tree: () => `<rect x="-14" y="0" width="28" height="90" rx="10" ${o(C.woodDark)}/><circle cx="-40" cy="-20" r="50" ${o(C.green)}/><circle cx="40" cy="-30" r="50" ${o(C.green)}/><circle cx="0" cy="-80" r="56" ${o(C.green)}/>
    <circle cx="-20" cy="-60" r="8" fill="${C.pink}"/><circle cx="34" cy="-20" r="8" fill="${C.pink}"/>`,
  rocket: (a) => `<path d="M0 -130 Q60 -80 50 30 H-50 Q-60 -80 0 -130Z" ${o('#ffffff')}/><circle cx="0" cy="-50" r="22" ${o(a)}/>
    <path d="M-50 0 L-86 50 L-50 40Z M50 0 L86 50 L50 40Z" ${o(C.pink)}/><path d="M-26 34 Q0 110 26 34Z" ${o(C.orange)}/>`,
  poster: (a) => `<path d="M-60 120 L-20 60 M60 120 L20 60" ${line(8)}/><rect x="-100" y="-120" width="200" height="190" rx="16" ${o(C.cream)}/>
    <rect x="-80" y="-100" width="160" height="56" rx="10" fill="${a}" opacity="0.6"/><circle cx="-40" cy="0" r="26" fill="${C.pink}"/><rect x="0" y="-20" width="70" height="16" rx="8" fill="${C.gray}"/><rect x="0" y="8" width="50" height="16" rx="8" fill="${C.gray}"/>`,
  journal: (a) => `<rect x="-90" y="-120" width="170" height="230" rx="14" ${o(a)}/><rect x="-90" y="-120" width="26" height="230" rx="10" ${o(C.purple, 4)}/>
    <rect x="-40" y="-80" width="100" height="70" rx="10" fill="#fff" opacity="0.85"/><circle cx="10" cy="-45" r="18" fill="${C.yellow}"/><rect x="-40" y="20" width="90" height="12" rx="6" fill="#fff" opacity="0.7"/>`,
};

// --- floating decorations ---------------------------------------------------
const FLOAT = {
  heart: (c) => `<path d="M0 22 C-30 4 -32 -18 -16 -24 C-8 -27 -2 -21 0 -16 C2 -21 8 -27 16 -24 C32 -18 30 4 0 22Z" ${o(c || C.rose, 4)}/>`,
  sparkle: (c) => `<path d="M0 -26 Q4 -4 26 0 Q4 4 0 26 Q-4 4 -26 0 Q-4 -4 0 -26Z" fill="${c || C.yellow}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  note: (c) => `<path d="M-6 16 V-22 L22 -28 V8" ${line(5)}/><ellipse cx="-14" cy="16" rx="11" ry="8" ${o(c || C.pink, 4)}/><ellipse cx="14" cy="10" rx="11" ry="8" ${o(c || C.pink, 4)}/>`,
  bubble: (c) => `<path d="M-30 -20 h60 a14 14 0 0 1 14 14 v14 a14 14 0 0 1 -14 14 h-36 l-14 12 l2 -12 h-12 a14 14 0 0 1 -14 -14 v-14 a14 14 0 0 1 14 -14Z" ${o(c || '#ffffff', 4)}/><circle cx="-14" cy="1" r="4" fill="${INK}"/><circle cx="0" cy="1" r="4" fill="${INK}"/><circle cx="14" cy="1" r="4" fill="${INK}"/>`,
  drop: (c) => `<path d="M0 -24 Q18 0 14 10 Q8 24 0 24 Q-8 24 -14 10 Q-18 0 0 -24Z" ${o(c || C.sky, 4)}/>`,
  cloud: (c) => `<path d="M-40 16 Q-50 -10 -22 -12 Q-14 -32 10 -24 Q30 -36 40 -14 Q56 -8 48 12 Q46 20 36 20 H-30 Q-40 20 -40 16Z" ${o(c || '#ffffff', 4)}/>`,
  flower: (c) => `${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-14" rx="10" ry="14" transform="rotate(${r})" ${o(c || C.pink, 3)}/>`).join('')}<circle r="9" ${o(C.yellow, 3)}/>`,
  butterfly: (c) => `<path d="M0 0 Q-30 -36 -36 -10 Q-40 10 0 0 Q-30 30 -14 32 Q0 30 0 0 Q30 -36 36 -10 Q40 10 0 0 Q30 30 14 32 Q0 30 0 0Z" ${o(c || C.lilac, 3)}/>`,
  star: (c) => `<path d="M0 -24 l7 14 l16 2 l-12 11 l3 16 l-14 -8 l-14 8 l3 -16 l-12 -11 l16 -2Z" ${o(c || C.yellow, 3)}/>`,
  wifi: (c) => `<path d="M-30 0 Q0 -26 30 0 M-16 12 Q0 -2 16 12" ${line(6, c || C.teal)}/><circle cx="0" cy="24" r="6" fill="${c || C.teal}"/>`,
  smile: (c) => `<circle r="24" ${o(c || C.yellow, 4)}/>${face(0, -2, 0.36)}`,
  sad: (c) => `<circle r="24" ${o(c || C.sky, 4)}/><circle cx="-8" cy="-4" r="3" fill="${INK}"/><circle cx="8" cy="-4" r="3" fill="${INK}"/><path d="M-8 12 Q0 4 8 12" ${line(3)}/>`,
  leaf: (c) => `<path d="M-20 20 Q-20 -20 24 -24 Q22 18 -20 20Z" ${o(c || C.green, 3)}/><path d="M-20 20 L10 -10" ${line(3)}/>`,
};

// --- scene composition -------------------------------------------------------
const PROP_SIZE = { pillow: 1.1, map: 1.2, bed: 1.0, ambulance: 1.0, city: 1.0, dome: 1.1, gantry: 1.0 };
// Props that stand on the ground: value = distance from origin to the prop's bottom edge.
const GROUNDED = { ambulance: 60, bot: 88, trophy: 96, hospital: 100, house: 100, tent: 80, bed: 70, ivstand: 120,
  podium: 110, mic: 80, tree: 90, signpost: 110, mirror: 110, city: 100, dome: 60, gantry: 108, monitor: 108, camera: 96, poster: 120 };

function scene(spec) {
  const r = rng(hash(spec.id));
  const pal = PALETTES[spec.palette != null ? spec.palette : hash(spec.id) % PALETTES.length];
  const a = pal.accent;
  let s = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal.bg[0]}"/><stop offset="1" stop-color="${pal.bg[1]}"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  // soft blobs
  for (let i = 0; i < 6; i++) {
    s += `<circle cx="${Math.round(r() * W)}" cy="${Math.round(r() * H * 0.7)}" r="${Math.round(60 + r() * 140)}" fill="${pal.blob}" opacity="${(0.35 + r() * 0.35).toFixed(2)}"/>`;
  }
  // tiny dots
  for (let i = 0; i < 18; i++) {
    s += `<circle cx="${Math.round(r() * W)}" cy="${Math.round(r() * H * 0.75)}" r="${Math.round(3 + r() * 5)}" fill="#ffffff" opacity="0.8"/>`;
  }
  // ground
  s += `<ellipse cx="600" cy="${H + 150}" rx="820" ry="280" fill="${pal.ground}"/>`;
  s += `<ellipse cx="600" cy="${H + 150}" rx="820" ry="280" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.6"/>`;

  const chars = spec.chars || [];
  const props = spec.props || [];
  const GY = 590; // ground line for feet
  const shadow = (x, w) => `<ellipse cx="${x}" cy="${GY + 6}" rx="${w}" ry="16" fill="${INK}" opacity="0.12"/>`;

  // layout: characters on one side, props on the other, alternating by hash
  const left = spec.side ? spec.side === 'left' : hash(spec.id) % 2 === 0;
  const nC = chars.length;
  const nP = props.length;
  const charZone = nP === 0 ? [300, 900] : left ? [170, 170 + nC * 230] : [W - 170 - nC * 230, W - 170];
  const propZone = nC === 0 ? [250, 950] : left ? [charZone[1] + 40, W - 90] : [90, charZone[0] - 40];

  const parts = [];
  props.forEach((pr, i) => {
    const name = typeof pr === 'string' ? pr : pr.name;
    const span = (propZone[1] - propZone[0]) / nP;
    const x = propZone[0] + span * (i + 0.5);
    const big = i === 0 ? 1.15 : 0.9;
    const sc = Math.min(1.35, span / 260) * big * (PROP_SIZE[name] || 1);
    const y = (typeof pr === 'object' && pr.y) || (GROUNDED[name] != null ? Math.round(GY - GROUNDED[name] * sc) : (i % 2 === 0 ? 360 : 300));
    parts.push({ z: 1, svg: g(Math.round(x), y, sc.toFixed(2), PROP[name](a)) });
  });
  chars.forEach((ch, i) => {
    const [type, ...mods] = ch.split(':');
    const span = (charZone[1] - charZone[0]) / nC;
    const x = charZone[0] + span * (i + 0.5);
    const opt = {};
    mods.forEach((m) => { opt[m] = true; });
    if (!('flip' in opt) && nC > 1 && i % 2 === 1) opt.flip = true;
    const sc = nC >= 3 ? 0.95 : 1.12;
    parts.push({ z: 2, svg: shadow(x, 70 * sc) + character(type, Math.round(x), GY, sc, opt) });
  });
  parts.sort((p, q) => p.z - q.z).forEach((p) => { s += p.svg; });

  // floating decorations along the top
  const floats = spec.float || ['sparkle', 'heart'];
  const slots = [[120, 110], [330, 80], [560, 120], [780, 70], [1010, 110], [1110, 250], [80, 300]];
  floats.concat(['sparkle', 'sparkle']).slice(0, 6).forEach((f, i) => {
    const [x, y] = slots[(i + (hash(spec.id) % 3)) % slots.length];
    const sc = 1 + r() * 0.6;
    const rot = Math.round((r() - 0.5) * 30);
    s += `<g transform="translate(${x + Math.round((r() - 0.5) * 40)} ${y + Math.round((r() - 0.5) * 30)}) rotate(${rot}) scale(${sc.toFixed(2)})">${FLOAT[f]()}</g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s}</svg>`;
}

module.exports = { scene, W, H, PROP, FLOAT, CHAR };
