// Genera íconos PNG de marcador de posición (sin dependencias externas)
// para el manifest de la PWA y el apple-touch-icon. Reemplazar con arte
// final antes de publicar (ver PLAN.md §13: identidad de marca pendiente).
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** pixelFn(x, y) -> [r, g, b, a] 0-255 */
function encodePng(width, height, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }
  const idat = chunk("IDAT", deflateSync(raw));
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Paleta cálida "kid-friendly" (placeholder de marca).
const BG = [255, 176, 59]; // naranja cálido
const CIRCLE = [255, 255, 255];
const ACCENT = [79, 70, 229]; // índigo (estrella)

function starPixel(x, y, cx, cy, outerR) {
  // Estrella simple de 5 puntas vía distancia angular (aprox, para placeholder).
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const spikes = 5;
  const innerR = outerR * 0.5;
  const t = ((angle + Math.PI * 2) % (Math.PI * 2)) / ((Math.PI * 2) / spikes);
  const frac = t - Math.floor(t);
  const edge = innerR + (outerR - innerR) * (1 - Math.abs(frac - 0.5) * 2);
  return r <= edge;
}

function makeIcon(size, { maskableSafe = false } = {}) {
  const cx = size / 2;
  const cy = size / 2;
  // Para maskable icons, dejar zona segura (~40% del radio) sin recortar contenido clave.
  const circleR = size * (maskableSafe ? 0.38 : 0.46);
  const starR = size * (maskableSafe ? 0.22 : 0.27);

  return encodePng(size, size, (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= circleR) {
      if (starPixel(x, y, cx, cy, starR)) return [...ACCENT, 255];
      return [...CIRCLE, 255];
    }
    return [...BG, 255];
  });
}

const outDir = new URL("../apps/web/public/icons/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-512.png", size: 512, maskableSafe: true },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  const buf = makeIcon(t.size, { maskableSafe: t.maskableSafe });
  writeFileSync(new URL(t.file, outDir), buf);
  console.log(`Generado ${t.file} (${t.size}x${t.size})`);
}
