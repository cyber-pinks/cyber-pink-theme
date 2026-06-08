/*
Copyright (c) 2026 1abcdefggs (takaer)
Licensed under the MIT License
See LICENSE file in the project root for full license information
*/

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMO_DIR = path.join(__dirname, '..', '..', '..', 'images', 'screenshots');

const TARGET_WIDTH = 400;

async function resizePromoImages() {
  try {
    const files = await fs.readdir(PROMO_DIR);
    const targets = files.filter(f => /(pink|cyan)\.webp$/i.test(f));

    console.log(`Found ${targets.length} promo images to resize`);

    for (const file of targets) {
      const inputPath = path.join(PROMO_DIR, file);
      const outputPath = inputPath;

      const metadata = await sharp(inputPath).metadata();
      console.log(`\nProcessing: ${file}`);
      console.log(`  Original: ${metadata.width}x${metadata.height}`);

      const buffer = await sharp(inputPath)
        .resize(TARGET_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer();

      await fs.writeFile(outputPath, buffer);

      const newMeta = await sharp(outputPath).metadata();
      console.log(`  Resized:  ${newMeta.width}x${newMeta.height}`);
    }

    console.log('\n✓ Promo images resized successfully');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

resizePromoImages();
