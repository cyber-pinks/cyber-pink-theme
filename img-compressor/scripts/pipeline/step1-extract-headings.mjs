/*
Copyright (c) 2026 1abcdefggs (takaer)
Licensed under the MIT License
See LICENSE file in the project root for full license information
*/

import fs from 'fs/promises';
import path from 'path';

const README_PATH = path.join(process.cwd(), 'README.md');

const HEADING_REGEX = /^(#{1,3})\s+(.*)$/gm;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-')  
    .trim();
}

function cleanHeading(rawTitle) {
  return rawTitle.replace(/^◤\s*/, '').trim();
}

async function extractHeadings() {
  const content = await fs.readFile(README_PATH, 'utf-8');

  const headings = [];
  let match;

  while ((match = HEADING_REGEX.exec(content)) !== null) {
    const level = match[1].length;
const rawTitle = match[2].trim();
const title = cleanHeading(rawTitle);
    const slug = slugify(title);
    const dirName = `h${level}-${slug}`;

    headings.push({
      level,
      title,
      slug,
      dirName
    });
  }

  return headings;
}

async function main() {
  const headings = await extractHeadings();

  console.log('Extracted headings with directory names:\n');
  headings.forEach(h => {
    console.log(`H${h.level}: ${h.title}  →  ${h.dirName}`);
  });
}

main();

export { extractHeadings}
