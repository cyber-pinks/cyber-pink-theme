// img-compressor/scripts/pipeline/convert-svg-to-png.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const INPUT_DIR = "images/color-samples";
const OUTPUT_DIR = "images/color-samples";

async function convertSvgToPng(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const outputPath = path.join(
    OUTPUT_DIR,
    file.replace(".svg", ".png")
  );

  console.log(`Converting: ${inputPath} → ${outputPath}`);

  await sharp(inputPath)
    .png({ quality: 100 })
    .toFile(outputPath);

  console.log(`✔ Done: ${outputPath}`);
}

async function main() {
  const files = fs.readdirSync(INPUT_DIR);

  const svgs = files.filter((f) => f.endsWith(".svg"));

  if (svgs.length === 0) {
    console.log("No SVG files found.");
    return;
  }

  for (const svg of svgs) {
    await convertSvgToPng(svg);
  }

  console.log("All SVGs converted to PNG.");
}

main();
