// scripts/split-data.js
// Split public/data.json into smaller chunk files (~500KB each) to stay within Cloudflare size limits.
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', 'public', 'data.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const CHUNK_SIZE = 500 * 1024; // 500KB per chunk (approx, based on JSON string size)

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function splitData() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('Input data.json not found at', INPUT_FILE);
    process.exit(1);
  }
  const raw = fs.readFileSync(INPUT_FILE, 'utf8');
  const items = JSON.parse(raw);
  ensureDir(OUTPUT_DIR);
  let chunkIndex = 1;
  let currentChunk = [];
  let currentSize = 0;
  const writeChunk = (chunk, idx) => {
    const outPath = path.join(OUTPUT_DIR, `page-${idx}.json`);
    fs.writeFileSync(outPath, JSON.stringify(chunk, null, 2), 'utf8');
    console.log(`Wrote ${outPath} (${chunk.length} items)`);
  };
  items.forEach((item) => {
    const itemStr = JSON.stringify(item);
    // +1 for comma when serializing array, approximate size
    const itemSize = Buffer.byteLength(itemStr, 'utf8') + 1;
    if (currentSize + itemSize > CHUNK_SIZE && currentChunk.length > 0) {
      writeChunk(currentChunk, chunkIndex);
      chunkIndex++;
      currentChunk = [];
      currentSize = 0;
    }
    currentChunk.push(item);
    currentSize += itemSize;
  });
  if (currentChunk.length) {
    writeChunk(currentChunk, chunkIndex);
  }
  // Write an index file listing chunk filenames for client loading
  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  const chunkFiles = [];
  for (let i = 1; i <= chunkIndex; i++) {
    chunkFiles.push(`page-${i}.json`);
  }
  fs.writeFileSync(indexPath, JSON.stringify(chunkFiles, null, 2), 'utf8');
  console.log('Created index file with', chunkFiles.length, 'chunks');
}

splitData();
