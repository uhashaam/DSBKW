const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');

const allowedExtensions = new Set([
  '.html',
  '.css',
  '.js',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.woff',
  '.woff2',
  '.ico',
  '.xml',
  '.xsl'
]);

function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      cleanDirectory(fullPath);
      // If directory is empty now, delete it
      if (fs.readdirSync(fullPath).length === 0) {
        fs.rmdirSync(fullPath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      const isRobotsTxt = file.toLowerCase() === 'robots.txt';

      // Keep only allowed extensions, and only robots.txt among .txt files
      const shouldKeep = allowedExtensions.has(ext) || (ext === '.txt' && isRobotsTxt);

      if (!shouldKeep) {
        fs.unlinkSync(fullPath);
      }
    }
  }
}

console.log('Cleaning up output directory...');
const startTime = Date.now();
cleanDirectory(outDir);
console.log(`Cleanup completed in ${Date.now() - startTime}ms`);
