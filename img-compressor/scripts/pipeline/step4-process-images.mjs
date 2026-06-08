/*
Copyright (c) 2026 1abcdefggs (takaer)
Licensed under the MIT License
See LICENSE file in the project root for full license information
*/

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const SCREENSHOT_ROOT = path.join(process.cwd(), 'screenshots');
const MAX_WIDTH = 1600;
const QUALITY = 80;

async function getAllScreenshotDirs() {
  const dirs = await fs.readdir(SCREENSHOT_ROOT);
  return dirs.filter(d => d.startsWith('h1-') || d.startsWith('h2-') || d.startsWith('h3-'));
}

async function resizeAndConvert(dirName) {
  const dirPath = path.join(SCREENSHOT_ROOT, dirName);
  const files = await fs.readdir(dirPath);

  const images = files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

  if (images.length === 0) return;

  console.log(`\nProcessing: ${dirName}`);

  let index = 1;

  for (const file of images) {
    const inputPath = path.join(dirPath, file);
    const outputName = String(index).padStart(2, '0') + '.webp';
    const outputPath = path.join(dirPath, outputName);

    const img = sharp(inputPath);
    const metadata = await img.metadata();

    let pipeline = img;

    if (metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH });
    }

    await pipeline.webp({ quality: QUALITY }).toFile(outputPath);

    console.log(`✔ ${file} → ${outputName}`);

    index++;
  }

  for (const file of images) {
    await fs.unlink(path.join(dirPath, file));
  }
}

async function main() {
  const dirs = await getAllScreenshotDirs();

  for (const dir of dirs) {
    await resizeAndConvert(dir);
  }

  console.log('\nAll images resized & converted to WebP.');
}

main();
