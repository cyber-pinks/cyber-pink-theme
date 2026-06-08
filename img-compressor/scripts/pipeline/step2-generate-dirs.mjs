/*
Copyright (c) 2026 1abcdefggs (takaer)
Licensed under the MIT License
See LICENSE file in the project root for full license information
*/

import fs from 'fs/promises';
import path from 'path';
import { extractHeadings } from './step1-extract-headings.mjs';

const SCREENSHOT_ROOT = path.join(process.cwd(), 'screenshots');

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error('Directory creation failed:', err);
  }
}

async function main() {
  const headings = await extractHeadings();

  console.log('Creating screenshot directories:\n');

  for (const h of headings) {
    const dirPath = path.join(SCREENSHOT_ROOT, h.dirName);
    await ensureDir(dirPath);
    console.log(`✔ ${dirPath}`);
  }

  console.log('\nAll directories created.');
}

main();

export { extractHeadings };

