import { getPostsByCategory } from "@/lib/data";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import Link from "next/link";

interface CategoryArchiveProps {
  slug: string;
  pageNumber: number;
  lang: 'zh' | 'en';
}

export default async function CategoryArchive({ slug, pageNumber, lang }: CategoryArchiveProps) {
  const posts = await getPostsByCategory(slug, lang);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(posts.length / itemsPerPage) || 1;
  
  // Slice posts for the current page
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const paginatedPosts = posts.slice(startIndex, startIndex + itemsPerPage);

  const categoryNames: Record<string, string> = {
    'jingdong': '京东',
    'pdd': '拼多多',
    'taobao': '淘宝天猫',
    'ask': '电商资讯',
    'video': '直播带货',
    'bridge': '跨境电商',
    'baike': '电商百科',
    'tools': '工具大全',
  };

  const categoryNamesEn: Record<string, string> = {
    'jingdong': 'Jingdong',
    'pdd': 'Pinduoduo',
    'taobao': 'Taobao Tmall',
    'ask': 'E-Commerce News',
    'video': 'Live Streaming',
    'bridge': 'Cross-Border',
    'baike': 'E-Commerce Wiki',
    'tools': 'Tools Directory',
  };

  const categoryName = lang === 'en' 
    ? (categoryNamesEn[slug] || slug) 
    : (categoryNames[slug] || slug);

  // Link generation helper
  const getPageLink = (page: number) => {
    const langPrefix = lang === 'en' ? '/en' : '';
    if (page === 1) {
      return `${langPrefix}/category/${slug}/`;
    }
    return `${langPrefix}/category/${slug}/page/${page}/`;
  };

  // Generate pages list to display (with ellipsis)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 10;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);
      
      const leftBound = Math.max(2, pageNumber - 3);
      const rightBound = Math.min(totalPages - 1, pageNumber + 3);
      
      if (leftBound > 2) {
        pages.push('...');
      }
      
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }
      
      if (rightBound < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <CategoryNav currentSlug={slug} lang={lang} />

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {categoryName}
            </h1>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {posts.length} {lang === 'en' ? 'articles' : '篇内容'}
            </span>
          </div>

          {paginatedPosts.length === 0 ? (
            <div className="py-20 text-center text-gray-500 text-sm">
              {lang === 'en' ? 'No articles found in this category.' : '暂无内容'}
            </div>
          ) : (
            <>
              {/* Grid of 3 columns as requested */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPosts.map((post) => {
                  const displayPost = lang === 'en' ? {
                    ...post,
                    title: post.title_en || post.title,
                    slug: `en/${post.slug_en || post.slug}`,
                    categories: post.categories_en || post.categories
                  } : post;
                  
                  return (
                    <ArticleCard key={post.slug} article={displayPost} />
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-8 border-t">
                  {pageNumber > 1 ? (
                    <Link
                      href={getPageLink(pageNumber - 1)}
                      className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700 font-semibold"
                    >
                      {lang === 'en' ? 'Previous' : '上一页'}
                    </Link>
                  ) : (
                    <span className="px-4 py-2 border rounded-lg text-sm bg-gray-50 text-gray-300 font-semibold cursor-not-allowed">
                      {lang === 'en' ? 'Previous' : '上一页'}
                    </span>
                  )}

                  {getPageNumbers().map((page, i) => {
                    if (page === '...') {
                      return (
                        <span
                          key={`dots-${i}`}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold"
                        >
                          ...
                        </span>
                      );
                    }
                    const isActive = page === pageNumber;
                    return (
                      <Link
                        key={page}
                        href={getPageLink(page as number)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-lg text-sm font-bold transition-all ${
                          isActive
                            ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </Link>
                    );
                  })}

                  {pageNumber < totalPages ? (
                    <Link
                      href={getPageLink(pageNumber + 1)}
                      className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700 font-semibold"
                    >
                      {lang === 'en' ? 'Next' : '下一页'}
                    </Link>
                  ) : (
                    <span className="px-4 py-2 border rounded-lg text-sm bg-gray-50 text-gray-300 font-semibold cursor-not-allowed">
                      {lang === 'en' ? 'Next' : '下一页'}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
