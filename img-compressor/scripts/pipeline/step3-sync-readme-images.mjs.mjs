/*
Copyright (c) 2026 1abcdefggs (takaer)
Licensed under the MIT License
See LICENSE file in the project root for full license information
*/

import fs from 'fs/promises';
import path from 'path';
import { extractHeadings } from './step1-extract-headings.mjs';

const README_PATH = path.join(process.cwd(), 'README.md');
const SCREENSHOT_ROOT = path.join(process.cwd(), 'screenshots');

async function getImagesForDir(dirName) {
  const dirPath = path.join(SCREENSHOT_ROOT, dirName);

  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort();
  } catch {
    return [];
  }
}

function removeExistingImages(readme, heading, level) {
 const escapedTitle = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingRegex = new RegExp(
    `^(#{${level}}\\s+${escapedTitle})[\\s\\S]*?(?=^#{1,3}\\s+|$)`,'m');

  const match = readme.match(headingRegex);
  if (!match) return readme;

  const block = match[0];

  const cleaned = block.replace(/!\[.*?\]\(screenshots\/.*?\)/g,'');

  return readme.replace(block, cleaned);
}

async function main() {
  const headings = await extractHeadings();
  let readme = await fs.readFile(README_PATH, 'utf-8');

  for (const h of headings) {
    const images = await getImagesForDir(h.dirName);
    if (images.length === 0) continue;

    readme = removeExistingImages(readme, h.title, h.level);

    const markdownImages = images
      .map(img => `![${h.title}](screenshots/${h.dirName}/${img})`)
      .join('\n');

const escapedTitle = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const headingRegex = new RegExp(`^(#{${h.level}}\\s+${escapedTitle})`, 'm');

    readme = readme.replace(
      headingRegex,
      `$1\n\n${markdownImages}\n`
    );
  }

  await fs.writeFile(README_PATH, readme, 'utf-8');
  console.log('README updated with latest images (replaced old ones).');
}

main();
