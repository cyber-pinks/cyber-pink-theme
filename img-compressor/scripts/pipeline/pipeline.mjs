/*
Copyright (c) 2026 1abcdefggs (takaer)
Licensed under the MIT License
See LICENSE file in the project root for full license information
*/

import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// get Directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// STEP path
const STEP1 = path.join(__dirname, 'step1-extract-headings.mjs');
const STEP2 = path.join(__dirname, 'step2-generate-dirs.mjs');
const STEP3 = path.join(__dirname, 'step3-sync-readme-images.mjs');
const STEP4 = path.join(__dirname, 'step4-process-images.mjs');

// Node.js runs
function runStep(stepPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [stepPath], { stdio: 'inherit' });

    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`STEP failed: ${stepPath}`));
    });
  });
}

async function main() {
  console.log('\n🚀 Running full pipeline...\n');

  console.log('STEP1: Extract headings');
  await runStep(STEP1);

  console.log('\nSTEP2: Generate screenshot directories');
  await runStep(STEP2);

  console.log('\nSTEP4: Resize & convert images');
  await runStep(STEP4);

  console.log('\nSTEP3: Update README with latest images');
  await runStep(STEP3);

  console.log('\n🎉 Pipeline completed successfully!\n');
}

main().catch(err => {
  console.error('\n❌ Pipeline failed:', err);
  process.exit(1);
});
