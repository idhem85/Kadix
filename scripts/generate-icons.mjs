import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = resolve(root, 'public/favicon.svg');
const outputDir = resolve(root, 'public/icons');

// Ensure output dir exists
mkdirSync(outputDir, { recursive: true });

// Read SVG
const svgBuffer = readFileSync(svgPath);

console.log('🔄 Generating PWA icons from favicon.svg...\n');

async function generate() {
  for (const size of sizes) {
    const outputPath = resolve(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(outputPath);
      
      const stats = (await import('fs')).statSync(outputPath);
      console.log(`  ✅ ${size}x${size}  — ${(stats.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`  ❌ ${size}x${size}  — ${err.message}`);
    }
  }
  
  console.log('\n✨ Done!');
}

generate().catch(console.error);
