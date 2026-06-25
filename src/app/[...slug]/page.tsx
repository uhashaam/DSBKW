import { getPosts, getPostBySlug, getSettings } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string[] }>;
}

// Generate static params for all Chinese and English posts
export async function generateStaticParams() {
  const posts = await getPosts();
  const params: Array<{ slug: string[] }> = [];

  for (const post of posts) {
    const zhSlug =
      typeof post.slug === "string" ? post.slug.trim() : "";
    if (!zhSlug) continue;

    // Chinese version route params (root slug)
    params.push({
      slug: [zhSlug],
    });

    // English version route params (nested /en/slug_en)
    // If an English translation is missing, the EN page will safely fall back to Chinese.
    const enSlug =
      typeof post.slug_en === "string" && post.slug_en.trim()
        ? post.slug_en.trim()
        : zhSlug;
    params.push({
      slug: ["en", enSlug],
    });
  }

  // Fallback to prevent export-time error if posts are empty/missing during build
  if (params.length === 0) {
    params.push({ slug: ["__placeholder__"] });
  }

  return params;
}

// RankMath SEO Pro Metadata compiler
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const isEn = slug[0] === 'en';
  const postSlug = isEn ? slug.slice(1).join('/') : slug.join('/');
  const lang = isEn ? 'en' : 'zh';
  
  const post = await getPostBySlug(postSlug, lang);
  const settings = await getSettings();

  if (!post) {
    return { title: '404 - Not Found' };
  }

  const sep = settings.seo_separator || '-';
  const siteName = isEn ? settings.siteName_en : settings.siteName_zh;
  const postTitle = isEn ? (post.title_en || post.title) : post.title;
  const cleanContent = (isEn ? (post.content_en || post.content) : post.content) || '';
  const excerpt = cleanContent.replace(/<[^>]*>/g, '').substring(0, 150).trim() + '...';

  // Chinese default SEO Title / Desc
  let seoTitle = post.seo?.seoTitle || '%title% %sep% %sitename%';
  let seoDesc = post.seo?.seoDescription || '%excerpt%';

  // English custom SEO Title / Desc override
  if (isEn) {
    seoTitle = post.seo?.seoTitle_en || '%title% %sep% %sitename%';
    seoDesc = post.seo?.seoDescription_en || '%excerpt%';
  }

  const compiledTitle = seoTitle
    .replace(/%title%/g, postTitle)
    .replace(/%sep%/g, sep)
    .replace(/%sitename%/g, siteName);

  const compiledDesc = seoDesc
    .replace(/%excerpt%/g, excerpt)
    .replace(/%title%/g, postTitle)
    .replace(/%sep%/g, sep)
    .replace(/%sitename%/g, siteName);

  return {
    title: compiledTitle,
    description: compiledDesc,
    alternates: {
      canonical: post.seo?.canonical || undefined,
    },
    robots: post.seo?.robots || 'index, follow',
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const isEn = slug[0] === 'en';
  const postSlug = isEn ? slug.slice(1).join('/') : slug.join('/');
  const lang = isEn ? 'en' : 'zh';

  const post = await getPostBySlug(postSlug, lang);
  const settings = await getSettings();

  if (!post) {
    notFound();
  }

  // Localized variables
  const postTitle = isEn ? (post.title_en || post.title) : post.title;
  const postContent = (isEn ? (post.content_en || post.content) : post.content) || '';
  const postCategories = isEn ? (post.categories_en || ['News']) : post.categories;
  const defaultImage = "/wp-content/uploads/2024/08/20240813-161115.png";

  // Injected Schema Data (Rankmath style)
  const schemaType = post.seo?.schemaType || 'Article';
  let jsonLd = null;

  if (schemaType === 'Article') {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": postTitle,
      "image": [
        post.featuredImage || defaultImage
      ],
      "datePublished": post.publishedTime || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": "dsbkw",
        "url": "https://dsbkw.com/"
      }
    };
  } else if (schemaType === 'FAQ') {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": postTitle,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": postContent.replace(/<[^>]*>/g, '').substring(0, 300)
          }
        }
      ]
    };
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      
      {/* Schema Insertion */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* hreflang SEO cross-linking alternates */}
      <link rel="alternate" hrefLang="zh-Hans" href={`https://dsbkw.com/${post.slug}/`} />
      {post.title_en && post.content_en && (
        <link rel="alternate" hrefLang="en" href={`https://dsbkw.com/en/${post.slug_en || post.slug}/`} />
      )}

      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <nav className="text-sm text-gray-500 flex items-center space-x-2">
          <Link href={isEn ? '/en/' : '/'} className="hover:text-orange-600">
            {isEn ? 'Home' : '首页'}
          </Link>
          <span>›</span>
          <span className="text-gray-900">{postCategories[0]}</span>
          <span>›</span>
          <span className="text-gray-400 truncate max-w-[240px]">{isEn ? 'Article' : '正文'}</span>
        </nav>

        {/* Article Body */}
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-10 space-y-8">
          <header className="space-y-4 border-b pb-6">
            <div className="flex flex-wrap gap-2">
              {postCategories.map((c) => (
                <span key={c} className="bg-orange-550/10 text-orange-600 text-xs font-bold px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                  {c}
                </span>
              ))}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {postTitle}
            </h1>

            <div className="flex items-center text-xs text-gray-500 space-x-4">
              {post.publishedTime && (
                <time dateTime={post.publishedTime} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {new Date(post.publishedTime).toLocaleDateString(isEn ? "en-US" : "zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                dsbkw
              </span>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border">
              <img
                src={post.featuredImage || defaultImage}
                alt={postTitle}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Dynamic HTML Content Injection */}
          <div
            className="prose prose-slate prose-orange max-w-none text-slate-800 leading-relaxed font-sans text-sm md:text-base prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-orange-600 prose-a:font-semibold hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: postContent }}
          />
        </article>

      </div>
    </div>
  );
}
