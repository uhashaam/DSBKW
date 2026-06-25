import titleCacheEnData from '../../.translate-cache.en.json';
import settingsData from './settings.json';
import parsedPosts from '../../scripts/data.json';

export interface SEOData {
  focusKeyword?: string;
  focusKeyword_en?: string;
  seoTitle?: string;
  seoTitle_en?: string;
  seoDescription?: string;
  seoDescription_en?: string;
  canonical?: string;
  robots?: string;
  schemaType?: 'Article' | 'FAQ' | 'None';
}

export interface Article {
  slug: string; // Chinese slug (e.g. URL encoded title)
  title: string; // Chinese title
  categories: string[]; // Chinese categories
  featuredImage: string | null;
  publishedTime: string | null;
  content: string; // Chinese HTML content
  
  // English translation fields
  slug_en?: string;
  title_en?: string;
  categories_en?: string[];
  content_en?: string;
  
  // Rankmath SEO fields
  seo?: SEOData;
}

export interface ToolItem {
  id: string;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  url: string;
  icon: string;
  rating: number;
  users_zh: string;
  users_en: string;
  banner?: string;
}

export interface ToolCategory {
  id: string;
  title_zh: string;
  title_en: string;
  tools: ToolItem[];
}

export interface SiteSettings {
  siteName_zh: string;
  siteName_en: string;
  siteDescription_zh: string;
  siteDescription_en: string;
  seo_separator: string;
  seo_title_template: string;
  seo_description_template: string;
  languages: string[];
  defaultLanguage: string;
  wechatContact: string;
  partners: Array<{ name: string; link: string }>;
  toolCategories: ToolCategory[];
}

let postsCache: Article[] | null = null;
let settingsCache: SiteSettings | null = null;
let titleCacheEn: Record<string, string> | null = null;

function getTitleCacheEn(): Record<string, string> {
  return titleCacheEnData as Record<string, string>;
}

const zhToEnCategoryMap: Record<string, string> = {
  '京东': 'Jingdong',
  '拼多多': 'Pinduoduo',
  '淘宝天猫': 'Taobao Tmall',
  '电商资讯': 'E-Commerce News',
  '直播带货': 'Live Streaming',
  '跨境电商': 'Cross-Border',
  '电商百科': 'E-Commerce Wiki',
  '工具大全': 'Tools Directory',
  '外贸必备工具': 'Global Trade Tools',
  '国外设计媒体': 'Design Media',
  '搜索引擎': 'Search Engines',
  'B2B平台': 'B2B Platforms',
};

// Clean caches - useful when admin changes values
export function clearCaches() {
  postsCache = null;
  settingsCache = null;
  titleCacheEn = null;
}

export async function getSettings(): Promise<SiteSettings> {
  return settingsData as SiteSettings;
}

export async function getPosts(): Promise<Article[]> {
  if (postsCache) return postsCache;
  
  try {
    // Apply safe EN fallbacks (so EN pages can render even if some fields are missing)
    const titleCache = getTitleCacheEn();
    postsCache = (parsedPosts as Article[]).map((post) => {
      const title_en = post.title_en || titleCache[post.title];
      const categories_en =
        post.categories_en && post.categories_en.length > 0
          ? post.categories_en
          : (post.categories || []).map((c) => zhToEnCategoryMap[c] || c);

      return {
        ...post,
        title_en,
        categories_en,
      };
    });
    
    // Sort by publishedTime descending
    postsCache?.sort((a, b) => {
      const dateA = a.publishedTime ? new Date(a.publishedTime).getTime() : 0;
      const dateB = b.publishedTime ? new Date(b.publishedTime).getTime() : 0;
      return dateB - dateA;
    });
    
    return postsCache || [];
  } catch (error) {
    console.error("Failed to process posts", error);
    return [];
  }
}

export async function getPostBySlug(slug: string, lang: 'zh' | 'en' = 'zh'): Promise<Article | undefined> {
  const posts = await getPosts();
  const decoded = decodeURIComponent(slug);
  
  return posts.find((p) => {
    if (lang === 'en') {
      return (
        p.slug_en === slug || 
        p.slug_en === decoded || 
        p.slug === slug || 
        p.slug === decoded
      );
    } else {
      return (
        p.slug === slug || 
        p.slug === decoded
      );
    }
  });
}

export async function getPostsByCategory(categorySlug: string, lang: 'zh' | 'en' = 'zh'): Promise<Article[]> {
  const posts = await getPosts();
  
  // Basic mapping of slugs to category names found in data
  const categoryMap: Record<string, string> = {
    'jingdong': '京东',
    'pdd': '拼多多',
    'taobao': '淘宝天猫',
    'ask': '电商资讯',
    'video': '直播带货',
    'bridge': '跨境电商',
    'baike': '电商百科',
    'tools': '工具大全',
    'com': '外贸必备工具',
    'social': '国外设计媒体',
    'search': '搜索引擎',
    'b2b': 'B2B平台',
  };
  
  const categoryMapEn: Record<string, string> = {
    'jingdong': 'Jingdong',
    'pdd': 'Pinduoduo',
    'taobao': 'Taobao Tmall',
    'ask': 'E-Commerce News',
    'video': 'Live Streaming',
    'bridge': 'Cross-Border',
    'baike': 'E-Commerce Wiki',
    'tools': 'Tools Directory',
    'com': 'Global Trade Tools',
    'social': 'Design Media',
    'search': 'Search Engines',
    'b2b': 'B2B Platforms',
  };
  
  if (lang === 'en') {
    const targetCategory = categoryMapEn[categorySlug] || categorySlug;
    const targetCategoryZh = categoryMap[categorySlug];
    return posts.filter((p) => {
      const catsEn = p.categories_en && p.categories_en.length > 0
        ? p.categories_en
        : (p.categories || []).map((c) => zhToEnCategoryMap[c] || c);

      const matchEn = catsEn.some(
        (c) => c.toLowerCase() === targetCategory.toLowerCase()
      );
      const matchZh = targetCategoryZh ? (p.categories || []).includes(targetCategoryZh) : false;

      return matchEn || matchZh;
    });
  } else {
    const targetCategory = categoryMap[categorySlug];
    if (!targetCategory) return [];
    return posts.filter((p) => p.categories.includes(targetCategory));
  }
}
