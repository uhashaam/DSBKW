/**
 * Extract articles from E:\DSBKW HTML directories into data.json
 * Each article directory contains an index.html with meta tags for title, description,
 * category, published time, and featured image.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');  // E:\DSBKW
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'data.json');

// Directories/files to skip (not article directories)
const SKIP_DIRS = new Set([
  'next-app', 'wp-content', 'wp-includes', 'page', 'category', 'author',
  'search', 'scripts', 'tools', 'social', 'com', 'b2b', 'bridge',
  '.git', 'node_modules', 'out', '.next', '.uploads'
]);

const SKIP_FILES = new Set([
  'index.html', 'robots.txt', 'sitemap.xml', 'sitemap_index.xml',
  'main-sitemap.xsl', 'category-sitemap.xml', 'page-sitemap.xml',
  '.gitignore', 'README.md', 'AGENTS.md', 'CLAUDE.md'
]);

function extractMetaContent(html, property, isName = false) {
  const attr = isName ? 'name' : 'property';
  // Try both quote styles
  const regex = new RegExp(`<meta\\s+${attr}=["']${property}["']\\s+content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  if (match) return match[1];
  
  // Try reversed attribute order
  const regex2 = new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+${attr}=["']${property}["']`, 'i');
  const match2 = html.match(regex2);
  return match2 ? match2[1] : null;
}

function extractTitle(html) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    let title = titleMatch[1];
    // Remove site name suffix like " - 电商百科网"
    title = title.replace(/\s*[-–—]\s*电商百科网\s*$/, '');
    // Decode HTML entities
    title = title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'");
    return title.trim();
  }
  return null;
}

function extractArticleContent(html) {
  // Try to extract the main article body content
  // Look for entry-content div
  const entryContentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<footer|<\/article|<div[^>]*class="[^"]*(?:post-navigation|comments|ast-single-related))/i);
  if (entryContentMatch) {
    return entryContentMatch[1].trim();
  }
  
  // Fallback: try simpler extraction
  const simpleMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (simpleMatch) {
    return simpleMatch[1].trim();
  }
  
  return '';
}

function processArticleDir(dirName) {
  const dirPath = path.join(ROOT_DIR, dirName);
  const indexPath = path.join(dirPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) return null;
  
  let html;
  try {
    html = fs.readFileSync(indexPath, 'utf8');
  } catch (e) {
    console.error(`  Error reading ${indexPath}:`, e.message);
    return null;
  }
  
  // Extract metadata from HTML meta tags
  const title = extractTitle(html) || dirName;
  const description = extractMetaContent(html, 'description', true) || 
                      extractMetaContent(html, 'og:description') || '';
  const category = extractMetaContent(html, 'article:section') || '电商资讯';
  const publishedTime = extractMetaContent(html, 'article:published_time') || null;
  const featuredImage = extractMetaContent(html, 'og:image') || null;
  const slug = encodeURIComponent(dirName);
  
  // Extract main content (just a summary - full content is too large)
  // Use the meta description as a brief content snippet
  const content = `<p>${description}</p>`;
  
  return {
    slug: dirName,
    title: title,
    categories: [category],
    featuredImage: featuredImage,
    publishedTime: publishedTime,
    content: content,
    seo: {
      focusKeyword: '',
      seoTitle: '%title% %sep% %sitename%',
      seoDescription: description,
      canonical: `/${encodeURIComponent(dirName)}/`,
      robots: 'index, follow',
      schemaType: 'Article'
    }
  };
}

function main() {
  console.log('Extracting articles from:', ROOT_DIR);
  console.log('Output file:', OUTPUT_FILE);
  
  // Get all directories in root
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const articleDirs = entries.filter(entry => {
    if (!entry.isDirectory()) return false;
    if (SKIP_DIRS.has(entry.name)) return false;
    if (entry.name.startsWith('.')) return false;
    // Check if it has an index.html (it's an article)
    const indexPath = path.join(ROOT_DIR, entry.name, 'index.html');
    return fs.existsSync(indexPath);
  });
  
  console.log(`Found ${articleDirs.length} article directories`);
  
  const articles = [];
  let processed = 0;
  let errors = 0;
  
  for (const dir of articleDirs) {
    const article = processArticleDir(dir.name);
    if (article) {
      articles.push(article);
      processed++;
    } else {
      errors++;
    }
    
    if (processed % 100 === 0) {
      console.log(`  Processed ${processed} articles...`);
    }
  }
  
  // Sort by published time (newest first)
  articles.sort((a, b) => {
    const dateA = a.publishedTime ? new Date(a.publishedTime).getTime() : 0;
    const dateB = b.publishedTime ? new Date(b.publishedTime).getTime() : 0;
    return dateB - dateA;
  });
  
  // Write output
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf8');
  
  console.log(`\nDone!`);
  console.log(`  Total extracted: ${articles.length}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Output: ${OUTPUT_FILE}`);
  console.log(`  File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
}

main();
