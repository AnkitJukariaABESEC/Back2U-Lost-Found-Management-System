import fs from 'fs';
import zlib from 'zlib';

function createSolidPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    // CRC
    let c = 0xffffffff;
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      let v = n;
      for (let k = 0; k < 8; k++) {
        v = (v & 1) ? (0xedb88320 ^ (v >>> 1)) : (v >>> 1);
      }
      crcTable[n] = v;
    }
    for (let i = 4; i < 8 + len; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    buf.writeInt32BE((c ^ 0xffffffff) | 0, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      // Create a nice rounded icon with purple bg (#371B7A) and orange accent center
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width * 0.46;
      const innerRadius = width * 0.16;

      if (dist <= innerRadius) {
        // Orange center (#EA580C)
        rawData[offset++] = 0xea;
        rawData[offset++] = 0x58;
        rawData[offset++] = 0x0c;
        rawData[offset++] = 0xff;
      } else if (dist <= radius) {
        // Deep purple (#371B7A)
        rawData[offset++] = 0x37;
        rawData[offset++] = 0x1b;
        rawData[offset++] = 0x7a;
        rawData[offset++] = 0xff;
      } else {
        // Transparent or soft fade
        rawData[offset++] = 0x37;
        rawData[offset++] = 0x1b;
        rawData[offset++] = 0x7a;
        rawData[offset++] = 0x00;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const png192 = createSolidPng(192, 192, 55, 27, 122);
fs.writeFileSync('public/pwa-192.png', png192);

const png512 = createSolidPng(512, 512, 55, 27, 122);
fs.writeFileSync('public/pwa-512.png', png512);

console.log('Successfully generated public/pwa-192.png and public/pwa-512.png');
