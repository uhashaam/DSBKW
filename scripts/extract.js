const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const sourceDir = 'E:\\DSBKW';
const targetFile = 'E:\\DSBKW\\scripts\\data.json';

const excludeDirs = new Set([
    'category', 'page', 'author', 'search', 'tools', 'com', 'social', 'bridge', 'b2b',
    'wp-admin', 'wp-content', 'wp-includes', 'next-app', 'scripts', 'comments'
]);

const data = [];

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (excludeDirs.has(entry.name)) continue;
            walk(path.join(dir, entry.name));
        } else if (entry.isFile() && entry.name === 'index.html') {
            const filePath = path.join(dir, entry.name);
            processFile(filePath, dir);
        }
    }
}

function processFile(filePath, dir) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(html);

        const isHome = filePath === path.join(sourceDir, 'index.html');
        if (isHome) return;

        const title = $('h1.entry-title').text().trim() || $('title').text().replace(' - 电商百科网', '').trim();
        
        let categories = [];
        $('meta[property="article:section"]').each((i, el) => {
            const content = $(el).attr('content');
            if (content) {
                // Sometime multiple categories are comma separated
                categories = categories.concat(content.split(',').map(s => s.trim()));
            }
        });

        const featuredImage = $('.post-thumb-img-content img').attr('src') || $('meta[property="og:image"]').attr('content');
        const publishedTime = $('meta[property="article:published_time"]').attr('content');
        const contentHtml = $('.entry-content').html();
        
        if (!contentHtml) return; // Not an article page

        const slug = path.basename(dir);

        data.push({
            slug,
            title,
            categories: [...new Set(categories)],
            featuredImage,
            publishedTime,
            content: formatContent(contentHtml.trim())
        });
    } catch (e) {
        console.error(`Error processing ${filePath}:`, e.message);
    }
}

function formatContent(content) {
    if (!content) return '';
    let clean = content.trim();
    
    const isSingleP = (clean.startsWith('<p class="wp-block-paragraph">') && clean.endsWith('</p>')) || 
                    (clean.startsWith('<p>') && clean.endsWith('</p>'));
                    
    if (isSingleP) {
        if (clean.startsWith('<p class="wp-block-paragraph">')) {
            clean = clean.substring('<p class="wp-block-paragraph">'.length, clean.length - '</p>'.length);
        } else {
            clean = clean.substring('<p>'.length, clean.length - '</p>'.length);
        }
    }
    
    const lines = clean.split(/<br\s*\/?>/gi);
    const headingRegex = /^([一二三四五六七八九十百]+、|【[^】]+】|相关阅读：|相关文章：|第[一二三四五六七八九十百]+、)/;
    
    const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        if (/^<[a-z0-9]+/i.test(trimmed) && !trimmed.startsWith('<a>') && !trimmed.startsWith('<strong>')) {
            return trimmed;
        }
        
        if (headingRegex.test(trimmed)) {
            let hText = trimmed.replace(/^<strong>([\s\S]*?)<\/strong>$/, '$1');
            return `<h2>${hText}</h2>`;
        }
        
        return `<p>${trimmed}</p>`;
    }).filter(Boolean);
    
    return formattedLines.join('\n');
}

console.log('Starting extraction...');
walk(sourceDir);
fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
console.log(`Extracted ${data.length} posts to ${targetFile}`);
