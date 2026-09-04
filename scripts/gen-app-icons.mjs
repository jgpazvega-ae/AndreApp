// Genera los íconos de la PWA (192/512/maskable-512/apple-touch-icon)
// componiendo la mascota real sobre un fondo degradado de marca.
// Sin dependencias externas: decodificador/codificador PNG + resize
// bilineal + composición alfa, todo hecho a mano.
import { deflateSync, inflateSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
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

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("No es un PNG válido");
  let offset = 8;
  let width = 0,
    height = 0,
    bitDepth = 0,
    colorType = 0,
    interlace = 0;
  const idatParts = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idatParts.push(data);
    }
    offset += 8 + len + 4;
  }
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error(`Formato no soportado: bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace}`);
  }
  const raw = inflateSync(Buffer.concat(idatParts));
  const bpp = 4;
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filterType = raw[y * (stride + 1)];
    const srcStart = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const filt = raw[srcStart + x];
      const a = x >= bpp ? pixels[y * stride + x - bpp] : 0;
      const b = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? pixels[(y - 1) * stride + x - bpp] : 0;
      let recon;
      switch (filterType) {
        case 0:
          recon = filt;
          break;
        case 1:
          recon = filt + a;
          break;
        case 2:
          recon = filt + b;
          break;
        case 3:
          recon = filt + Math.floor((a + b) / 2);
          break;
        case 4:
          recon = filt + paeth(a, b, c);
          break;
        default:
          throw new Error(`Filtro PNG desconocido: ${filterType}`);
      }
      pixels[y * stride + x] = recon & 0xff;
    }
  }
  return { width, height, pixels };
}

function encodePng(width, height, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const ihdr = chunk("IHDR", ihdrData);
  const stride = width * 4;
  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + stride)] = 0;
    pixels.copy(raw, y * (1 + stride) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk("IDAT", deflateSync(raw, { level: 9 }));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

/** Resize bilineal de un buffer RGBA8. */
function resizeBilinear(src, srcW, srcH, dstW, dstH) {
  const dst = Buffer.alloc(dstW * dstH * 4);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;
  for (let dy = 0; dy < dstH; dy++) {
    const sy = (dy + 0.5) * yRatio - 0.5;
    const y0 = Math.max(0, Math.floor(sy));
    const y1 = Math.min(srcH - 1, y0 + 1);
    const wy = sy - y0;
    for (let dx = 0; dx < dstW; dx++) {
      const sx = (dx + 0.5) * xRatio - 0.5;
      const x0 = Math.max(0, Math.floor(sx));
      const x1 = Math.min(srcW - 1, x0 + 1);
      const wx = sx - x0;
      for (let ch = 0; ch < 4; ch++) {
        const p00 = src[(y0 * srcW + x0) * 4 + ch];
        const p10 = src[(y0 * srcW + x1) * 4 + ch];
        const p01 = src[(y1 * srcW + x0) * 4 + ch];
        const p11 = src[(y1 * srcW + x1) * 4 + ch];
        const top = p00 * (1 - wx) + p10 * wx;
        const bottom = p01 * (1 - wx) + p11 * wx;
        dst[(dy * dstW + dx) * 4 + ch] = Math.round(top * (1 - wy) + bottom * wy);
      }
    }
  }
  return dst;
}

/** Compone `src` sobre `dst` (alpha-over) en la posición (offsetX, offsetY). */
function compositeOver(dst, dstW, dstH, src, srcW, srcH, offsetX, offsetY) {
  for (let y = 0; y < srcH; y++) {
    const dy = y + offsetY;
    if (dy < 0 || dy >= dstH) continue;
    for (let x = 0; x < srcW; x++) {
      const dx = x + offsetX;
      if (dx < 0 || dx >= dstW) continue;
      const si = (y * srcW + x) * 4;
      const di = (dy * dstW + dx) * 4;
      const srcA = src[si + 3] / 255;
      if (srcA <= 0) continue;
      const dstA = dst[di + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      for (let ch = 0; ch < 3; ch++) {
        const srcC = src[si + ch];
        const dstC = dst[di + ch];
        dst[di + ch] = outA > 0 ? Math.round((srcC * srcA + dstC * dstA * (1 - srcA)) / outA) : 0;
      }
      dst[di + 3] = Math.round(outA * 255);
    }
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeBackground(size, [fromHex, toHex]) {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  const bg = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * size); // degradado diagonal
      const i = (y * size + x) * 4;
      bg[i] = Math.round(from[0] + (to[0] - from[0]) * t);
      bg[i + 1] = Math.round(from[1] + (to[1] - from[1]) * t);
      bg[i + 2] = Math.round(from[2] + (to[2] - from[2]) * t);
      bg[i + 3] = 255;
    }
  }
  return bg;
}

function makeIcon(size, mascot, { paddingFraction, roundedCorner = false } = {}) {
  const bg = makeBackground(size, ["#FFC46B", "#E0912A"]);

  const box = Math.round(size * (1 - paddingFraction * 2));
  const scale = Math.min(box / mascot.width, box / mascot.height);
  const drawW = Math.round(mascot.width * scale);
  const drawH = Math.round(mascot.height * scale);
  const resized = resizeBilinear(mascot.pixels, mascot.width, mascot.height, drawW, drawH);

  const offsetX = Math.round((size - drawW) / 2);
  const offsetY = Math.round((size - drawH) / 2) + Math.round(size * 0.03); // ligera bajada óptica

  compositeOver(bg, size, size, resized, drawW, drawH, offsetX, offsetY);

  if (roundedCorner) {
    const radius = size * 0.22;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cx = x < radius ? radius : x > size - radius ? size - radius : x;
        const cy = y < radius ? radius : y > size - radius ? size - radius : y;
        const dist = Math.hypot(x - cx, y - cy);
        if ((x < radius || x > size - radius) && (y < radius || y > size - radius) && dist > radius) {
          bg[(y * size + x) * 4 + 3] = 0;
        }
      }
    }
  }

  return encodePng(size, size, bg);
}

const mascotPath = new URL("../apps/web/public/illustrations/mascot.png", import.meta.url);
const mascot = decodePng(readFileSync(mascotPath));

const outDir = new URL("../apps/web/public/icons/", import.meta.url);

const targets = [
  { file: "icon-192.png", size: 192, paddingFraction: 0.1 },
  { file: "icon-512.png", size: 512, paddingFraction: 0.1 },
  { file: "icon-maskable-512.png", size: 512, paddingFraction: 0.19 },
  { file: "apple-touch-icon.png", size: 180, paddingFraction: 0.09 },
];

for (const t of targets) {
  const buf = makeIcon(t.size, mascot, { paddingFraction: t.paddingFraction });
  writeFileSync(new URL(t.file, outDir), buf);
  console.log(`Generado ${t.file} (${t.size}x${t.size})`);
}
