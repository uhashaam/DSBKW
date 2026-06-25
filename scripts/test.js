const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const filePath = path.join('E:\\DSBKW\\10天破百万美金！品牌商家在速卖通加速爆单', 'index.html');
const html = fs.readFileSync(filePath, 'utf-8');
const $ = cheerio.load(html);

const title = $('h1.entry-title').text().trim();
const categories = [];
$('.cat-links a').each((i, el) => {
    categories.push($(el).text().trim());
});

const featuredImage = $('.post-thumb-img-content img').attr('src') || $('meta[property="og:image"]').attr('content');
const publishedTime = $('meta[property="article:published_time"]').attr('content');
const content = $('.entry-content').html();

console.log({ title, categories, featuredImage, publishedTime, contentLength: content ? content.length : 0 });
