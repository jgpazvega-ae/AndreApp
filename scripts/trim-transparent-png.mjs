// Recorta el margen transparente de un PNG RGBA de 8 bits (sin interlace)
// a la caja delimitadora real del contenido, con un pequeño padding.
// Sin dependencias externas — decodificador/codificador PNG mínimo.
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
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
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
    throw new Error(`Formato no soportado por este trimmer: bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace} (se espera RGBA8 sin interlace)`);
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
        case 0: recon = filt; break;
        case 1: recon = filt + a; break;
        case 2: recon = filt + b; break;
        case 3: recon = filt + Math.floor((a + b) / 2); break;
        case 4: recon = filt + paeth(a, b, c); break;
        default: throw new Error(`Tipo de filtro PNG desconocido: ${filterType}`);
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

function trim(inputPath, outputPath, { padding = 24, alphaThreshold = 10 } = {}) {
  const { width, height, pixels } = decodePng(readFileSync(inputPath));
  const stride = width * 4;

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[y * stride + x * 4 + 3];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) throw new Error(`${inputPath}: no se encontró contenido opaco (¿PNG totalmente transparente?)`);

  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const cropped = Buffer.alloc(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    const srcOffset = (minY + y) * stride + minX * 4;
    const dstOffset = y * cropW * 4;
    pixels.copy(cropped, dstOffset, srcOffset, srcOffset + cropW * 4);
  }

  writeFileSync(outputPath, encodePng(cropW, cropH, cropped));
  console.log(`${inputPath} -> ${outputPath}: ${width}x${height} -> ${cropW}x${cropH}`);
}

const [, , inputPath, outputPath, paddingArg] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Uso: node trim-transparent-png.mjs <entrada.png> <salida.png> [padding]");
  process.exit(1);
}
trim(inputPath, outputPath, { padding: paddingArg ? Number(paddingArg) : 24 });
