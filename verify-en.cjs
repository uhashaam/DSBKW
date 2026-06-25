const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(process.cwd(), '..', 'scripts', 'data.json');
const REPORT_JSON_PATH = path.join(process.cwd(), 'missing-en.report.json');
const REPORT_TXT_PATH = path.join(process.cwd(), 'missing-en.report.txt');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const posts = readJSON(DATA_PATH);

  let missingAny = 0;
  let missingTitle = 0;
  let missingContent = 0;
  let missingSlug = 0;
  let missingCats = 0;

  const examples = [];
  const missingList = [];

  for (let i = 0; i < posts.length; i += 1) {
    const p = posts[i];
    const mt = !p.title_en;
    const mc = !p.content_en;
    const ms = !p.slug_en;
    const mcat = !p.categories_en;

    if (mt) missingTitle += 1;
    if (mc) missingContent += 1;
    if (ms) missingSlug += 1;
    if (mcat) missingCats += 1;

    if (mt || mc || ms || mcat) {
      missingAny += 1;
      missingList.push({
        index: i,
        slug: p.slug,
        title: p.title,
        missing: {
          title_en: mt,
          content_en: mc,
          slug_en: ms,
          categories_en: mcat
        }
      });
      if (examples.length < 20) {
        examples.push({
          slug: p.slug,
          title: p.title,
          missing: {
            title_en: mt,
            content_en: mc,
            slug_en: ms,
            categories_en: mcat
          }
        });
      }
    }
  }

  const summary = {
    total: posts.length,
    missingAny,
    missingTitle,
    missingContent,
    missingSlug,
    missingCats,
    examples
  };

  missingList.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans'));
  fs.writeFileSync(
    REPORT_JSON_PATH,
    JSON.stringify({ ...summary, missingList }, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    REPORT_TXT_PATH,
    missingList.map((m) => `${m.index}\t${m.slug}\t${m.title}`).join('\n'),
    'utf8'
  );

  console.log(JSON.stringify(summary, null, 2));
}

main();
