// Simple script to generate minimal placeholder PNG icons for PWA
// Uses raw PNG encoding (no external dependencies)
// Run: node scripts/generate-icons.js

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '..', 'public', 'icons');

// Sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple PNG with a colored background and 'K' text
function createSimplePNG(size) {
  // We create a grayscale PNG since we can't embed fonts trivially
  // Color: sage #636c55
  const r = 99, g = 108, b = 85;
  
  // Minimal valid PNG: 8-bit grayscale with alpha, no text rendering
  const width = size;
  const height = size;
  const bitDepth = 8;
  const colorType = 2; // RGB
  
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);   // width
  ihdrData.writeUInt32BE(height, 4);  // height
  ihdrData[8] = bitDepth;             // bit depth
  ihdrData[9] = colorType;            // color type (RGB)
  ihdrData[10] = 0;                   // compression
  ihdrData[11] = 0;                   // filter
  ihdrData[12] = 0;                   // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT chunk - image data
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte (none)
    const radius = Math.min(width, height) * 0.42;
    const cx = width / 2;
    const cy = height / 2 + 2;
    
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      if (dist < radius) {
        // Fill color (sage green)
        rawData.push(r, g, b);
      } else {
        // Transparent-ish corners (rounded rect effect)
        const cornerRadius = width * 0.16;
        const inCornerTL = x < cornerRadius && y < cornerRadius;
        const inCornerTR = x > width - cornerRadius && y < cornerRadius;
        const inCornerBL = x < cornerRadius && y > height - cornerRadius;
        const inCornerBR = x > width - cornerRadius && y > height - cornerRadius;
        
        if (x < width && y < height &&
            x >= 0 && y >= 0 &&
            !(inCornerTL && Math.sqrt((x-cornerRadius)**2 + (y-cornerRadius)**2) > cornerRadius) &&
            !(inCornerTR && Math.sqrt((x-(width-cornerRadius))**2 + (y-cornerRadius)**2) > cornerRadius) &&
            !(inCornerBL && Math.sqrt((x-cornerRadius)**2 + (y-(height-cornerRadius))**2) > cornerRadius) &&
            !(inCornerBR && Math.sqrt((x-(width-cornerRadius))**2 + (y-(height-cornerRadius))**2) > cornerRadius)) {
          rawData.push(r, g, b);
        } else {
          rawData.push(245, 247, 244); // sage-50 background
        }
      }
    }
  }
  
  const buf = Buffer.from(rawData);
  
  // Compress with zlib
  const compressed = zlib.deflateSync(buf);
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation for PNG
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc >>>= 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
function main() {
  mkdirSync(iconsDir, { recursive: true });
  
  for (const size of sizes) {
    const png = createSimplePNG(size);
    const filePath = resolve(iconsDir, `icon-${size}x${size}.png`);
    writeFileSync(filePath, png);
    console.log(`✓ Generated ${size}x${size} icon (${png.length} bytes)`);
  }
  
  console.log('\nAll PWA icons generated successfully!');
}

main();
