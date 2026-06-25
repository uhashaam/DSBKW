const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(process.cwd(), '..', 'scripts', 'data.json');
const CACHE_PATH = path.join(process.cwd(), '.translate-cache.en.json');

const SOURCE_LANG = 'zh-CN';
const TARGET_LANG = 'en';

const MAX_BATCH_ENCODED = 1800;
const SPLIT_MARKER = '\n<|SPLIT|>\n';

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeWhitespace(s) {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

function slugify(input) {
  const s = (input ?? '')
    .toLowerCase()
    .replace(/['\"“”‘’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'post';
}

function ensureUniqueSlug(base, taken) {
  let slug = base;
  let i = 2;
  while (taken.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  taken.add(slug);
  return slug;
}

function encodedLen(s) {
  return encodeURIComponent(s).length;
}

function splitByEncoded(input, maxEncoded) {
  const parts = [];
  let start = 0;
  let currentLen = 0;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const nextLen = currentLen + encodedLen(ch);
    if (nextLen > maxEncoded && i > start) {
      parts.push(input.slice(start, i));
      start = i;
      currentLen = 0;
      continue;
    }
    currentLen = nextLen;
  }

  if (start < input.length) parts.push(input.slice(start));
  return parts.length ? parts : [''];
}

function safeSplitByLines(html) {
  const prepared = String(html ?? '').replace(/>(?=<)/g, '>\n');
  const lines = prepared.split('\n');
  if (lines.length > 1) return lines;
  return [prepared];
}

function chunkStrings(parts, maxEncoded) {
  const chunks = [];
  let current = [];
  let currentLen = 0;
  const markerLen = encodedLen(SPLIT_MARKER);

  for (const part of parts) {
    const partLen = encodedLen(part);

    if (partLen > maxEncoded) {
      if (current.length) {
        chunks.push(current);
        current = [];
        currentLen = 0;
      }
      const hard = splitByEncoded(part, maxEncoded);
      for (const h of hard) chunks.push([h]);
      continue;
    }

    const nextLen = currentLen + partLen + (current.length ? markerLen : 0);
    if (nextLen > maxEncoded && current.length) {
      chunks.push(current);
      current = [part];
      currentLen = partLen;
      continue;
    }

    current.push(part);
    currentLen = nextLen;
  }

  if (current.length) chunks.push(current);
  return chunks;
}

async function fetchGoogleTranslate(q, sl, tl) {
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t` +
    `&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Translate HTTP ${res.status} ${res.statusText} ${text}`.trim());
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  const segments = Array.isArray(json?.[0]) ? json[0] : [];
  return segments.map((s) => s?.[0] ?? '').join('');
}

async function translateWithRetry(q, sl, tl, state) {
  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      const now = Date.now();
      const wait = Math.max(0, (state.nextAllowedAt ?? 0) - now);
      if (wait) await sleep(wait);

      const out = await fetchGoogleTranslate(q, sl, tl);
      state.nextAllowedAt = Date.now() + (state.delayMs ?? 0);
      return out;
    } catch (e) {
      const status = e?.status;
      const retryable = status === 429 || (typeof status === 'number' && status >= 500);
      if (!retryable || attempt >= 6) throw e;

      const backoff = Math.min(15000, 500 * Math.pow(2, attempt - 1));
      state.delayMs = Math.min(2000, Math.max(state.delayMs ?? 0, 150) + 100);
      state.nextAllowedAt = Date.now() + backoff;
      await sleep(backoff);
    }
  }
}

async function batchTranslate(parts, sl, tl, cache, state) {
  const normParts = parts.map((p) => p ?? '');
  const results = new Array(normParts.length);
  const missing = [];

  for (let i = 0; i < normParts.length; i += 1) {
    const key = normalizeWhitespace(normParts[i]);
    if (key && key.length <= 220 && cache[key]) {
      results[i] = cache[key];
    } else {
      missing.push({ i, text: normParts[i], key });
    }
  }

  if (!missing.length) return results;

  const chunks = chunkStrings(missing.map((m) => m.text), MAX_BATCH_ENCODED);
  let cursor = 0;

  for (const chunk of chunks) {
    const combined = chunk.join(SPLIT_MARKER);
    const translated = await translateWithRetry(combined, sl, tl, state);
    const split = translated.split(SPLIT_MARKER);

    for (let j = 0; j < chunk.length; j += 1) {
      const item = missing[cursor + j];
      const value = split[j] ?? '';
      results[item.i] = value;
      if (item.key && item.key.length <= 220) {
        cache[item.key] = value;
      }
    }

    cursor += chunk.length;
  }

  return results;
}

async function translateHtml(html, cache, state) {
  const lines = safeSplitByLines(html);
  const translatedLines = [];

  const chunks = chunkStrings(lines, MAX_BATCH_ENCODED);
  for (const chunk of chunks) {
    const combined = chunk.join(SPLIT_MARKER);
    const translated = await translateWithRetry(combined, SOURCE_LANG, TARGET_LANG, state);
    const split = translated.split(SPLIT_MARKER);
    for (let i = 0; i < chunk.length; i += 1) {
      translatedLines.push(split[i] ?? '');
    }
  }

  return translatedLines.join('\n');
}

function mapCategoryEn(c) {
  const map = {
    '电商百科': 'E-Commerce Wiki',
    '淘宝天猫': 'Taobao Tmall',
    '京东': 'Jingdong',
    '拼多多': 'Pinduoduo',
    '跨境电商': 'Cross-Border',
    '电商资讯': 'E-Commerce News',
    '直播带货': 'Live Streaming'
  };
  return map[c];
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const startArg = args.find((a) => a.startsWith('--start='));

  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const start = startArg ? Number(startArg.split('=')[1]) : 0;

  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Missing data.json at ${DATA_PATH}`);
  }

  const posts = readJSON(DATA_PATH);
  const cache = fs.existsSync(CACHE_PATH) ? readJSON(CACHE_PATH) : {};

  const takenSlugs = new Set();
  for (const p of posts) {
    if (p.slug_en) takenSlugs.add(p.slug_en);
  }

  const state = { delayMs: 120, nextAllowedAt: 0 };

  let processed = 0;
  let updated = 0;
  let skipped = 0;

  for (let idx = start; idx < posts.length; idx += 1) {
    if (limit != null && processed >= limit) break;
    processed += 1;

    const post = posts[idx];
    const needsTitle = !post.title_en;
    const needsContent = !post.content_en;
    const needsCats = !post.categories_en;
    const needsSlug = !post.slug_en;
    const needsSeoTitle = post.seo?.seoTitle && !post.seo?.seoTitle_en;
    const needsSeoDesc = post.seo?.seoDescription && !post.seo?.seoDescription_en;
    const needsFocusKeyword = post.seo?.focusKeyword && !post.seo?.focusKeyword_en;

    if (
      !needsTitle &&
      !needsContent &&
      !needsCats &&
      !needsSlug &&
      !needsSeoTitle &&
      !needsSeoDesc &&
      !needsFocusKeyword
    ) {
      skipped += 1;
      continue;
    }

    const metaToTranslate = [];
    const metaIndex = {};

    if (needsTitle) {
      metaIndex.title = metaToTranslate.length;
      metaToTranslate.push(String(post.title ?? ''));
    }

    if (needsSeoTitle) {
      metaIndex.seoTitle = metaToTranslate.length;
      metaToTranslate.push(String(post.seo.seoTitle ?? ''));
    }

    if (needsSeoDesc) {
      metaIndex.seoDesc = metaToTranslate.length;
      metaToTranslate.push(String(post.seo.seoDescription ?? ''));
    }

    if (needsFocusKeyword) {
      metaIndex.focusKeyword = metaToTranslate.length;
      metaToTranslate.push(String(post.seo.focusKeyword ?? ''));
    }

    let translatedMeta = [];
    if (metaToTranslate.length) {
      translatedMeta = await batchTranslate(metaToTranslate, SOURCE_LANG, TARGET_LANG, cache, state);
    }

    const next = { ...post };

    if (needsTitle) {
      next.title_en = translatedMeta[metaIndex.title] ?? '';
    }

    if (needsSlug) {
      const base = slugify(next.title_en || post.title_en || post.title);
      next.slug_en = ensureUniqueSlug(base, takenSlugs);
    } else {
      takenSlugs.add(next.slug_en);
    }

    if (needsCats) {
      const categories = Array.isArray(post.categories) ? post.categories : [];
      const prepared = categories.map((c) => mapCategoryEn(c) ?? c);
      const toTranslate = prepared.filter((c) => /[^\x00-\x7F]/.test(c));
      let translated = [];
      if (toTranslate.length) {
        translated = await batchTranslate(toTranslate, SOURCE_LANG, TARGET_LANG, cache, state);
      }
      let ti = 0;
      next.categories_en = prepared.map((c) => {
        if (/[^\x00-\x7F]/.test(c)) {
          const out = translated[ti] ?? '';
          ti += 1;
          return out;
        }
        return c;
      });
    }

    if (needsSeoTitle) {
      next.seo = { ...(post.seo || {}) };
      next.seo.seoTitle_en = translatedMeta[metaIndex.seoTitle] ?? '';
    }

    if (needsSeoDesc) {
      next.seo = { ...(next.seo || post.seo || {}) };
      next.seo.seoDescription_en = translatedMeta[metaIndex.seoDesc] ?? '';
    }

    if (needsFocusKeyword) {
      next.seo = { ...(next.seo || post.seo || {}) };
      next.seo.focusKeyword_en = translatedMeta[metaIndex.focusKeyword] ?? '';
    }

    if (needsContent) {
      next.content_en = await translateHtml(String(post.content ?? ''), cache, state);
    }

    posts[idx] = next;
    updated += 1;

    if (updated % 10 === 0 && !dryRun) {
      writeJSON(DATA_PATH, posts);
      writeJSON(CACHE_PATH, cache);
    }

    if (updated % 25 === 0) {
      console.log(`Progress: updated ${updated}, skipped ${skipped}, index ${idx + 1}/${posts.length}`);
    }
  }

  if (!dryRun) {
    writeJSON(DATA_PATH, posts);
    writeJSON(CACHE_PATH, cache);
  }

  console.log(`Done. updated=${updated}, skipped=${skipped}, processed=${processed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
