import { getPosts, getSettings } from "@/lib/data";
import ArticleCard from "@/components/ArticleCard";
import CategoryNav from "@/components/CategoryNav";
import Image from "next/image";
import Link from "next/link";
import BannerSlider from "@/components/BannerSlider";

export default async function Home() {
  const posts = await getPosts();
  const settings = await getSettings();
  
  // Display only top 15 posts on the homepage for speed
  const latestPosts = posts.slice(0, 15);
  const featuredCategory =
    settings.toolCategories.find((c) => c.id === "featured") || settings.toolCategories[0];
  const featuredTools = featuredCategory?.tools?.slice(0, 4) || [];

  const bannerImages = [
    "/wp-content/uploads/2024/08/20240819-114709.png",
    "/wp-content/uploads/2024/08/20240817-094710.jpg",
    "/wp-content/uploads/2024/08/20240819-114720.png",
    "/wp-content/uploads/2026/03/hbllq.webp"
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Banner Carousel */}
      <div className="w-full bg-slate-900 overflow-hidden relative h-[25vh] md:h-[70vh] md:max-h-[700px] md:min-h-[500px]">
        <BannerSlider images={bannerImages} />
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl space-y-12">
        {/* Featured strip (below banner) */}
        {featuredTools.length > 0 && (
          <div className="-mt-16 md:-mt-20 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.url}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-500/25 transition-all overflow-hidden flex items-center gap-4 p-4"
                >
                  <div className="w-14 h-14 rounded-lg border border-gray-100 bg-white shadow-inner flex items-center justify-center shrink-0">
                    <img
                      src={tool.icon || "/wp-content/uploads/2024/08/20240813-161115.png"}
                      alt={tool.name_zh}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{tool.name_zh}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex text-amber-400 space-x-0.5 text-xs">
                        {Array.from({ length: tool.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold font-mono ml-2 truncate">
                        {tool.users_zh}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Intro */}
        <div className="text-center space-y-3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {settings.siteName_zh}
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {settings.siteDescription_zh}
          </p>
        </div>

        {/* Featured Tools Grid (Direct replication of Elementor layout) */}
        {settings.toolCategories.map((category) => (
          <div key={category.id} className="space-y-6">
            <div className="flex items-center space-x-3 border-l-4 border-orange-500 pl-3">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {category.title_zh}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.tools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-500/25 transition-all overflow-hidden flex flex-col group"
                >
                  {/* If tool has a custom banner, render it, else simple block */}
                  {tool.banner ? (
                    <div className="relative aspect-[3/1] bg-gray-100 overflow-hidden shrink-0 border-b">
                      <img
                        src={tool.banner || '/wp-content/uploads/2024/08/cate_1.jpg'}
                        alt="banner"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : null}

                  <div className="p-5 flex-1 flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-100 p-1 flex items-center justify-center shrink-0 shadow-inner">
                        <img
                          src={tool.icon || '/wp-content/uploads/2024/08/20240813-161115.png'}
                          alt={tool.name_zh}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate hover:text-orange-600 transition-colors">
                          <Link href={tool.url}>{tool.name_zh}</Link>
                        </h3>
                        <div className="flex items-center mt-1">
                          <div className="flex text-amber-400 space-x-0.5 text-xs">
                            {Array.from({ length: tool.rating }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold font-mono ml-2">
                            {tool.users_zh}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-2">
                      {tool.description_zh}
                    </p>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">
                        安全认证
                      </span>
                      <Link
                        href={tool.url}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center transition-colors"
                      >
                        立即使用
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1"><polyline points="9 18 15 12 9 6"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Categories Bar */}
        <div className="pt-8 border-t border-gray-200/60">
          <CategoryNav currentSlug="" lang="zh" />
        </div>

        {/* Latest posts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-l-4 border-orange-500 pl-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              最新内容
            </h2>
            <Link href="/category/ask/" className="text-xs font-bold text-gray-500 hover:text-orange-600 flex items-center">
              查看全部
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestPosts.map((post) => (
              <ArticleCard key={post.slug} article={post} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
