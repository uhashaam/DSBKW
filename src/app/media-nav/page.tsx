import Link from "next/link";
import { sections } from "./platforms";

export const metadata = {
  title: "自媒体导航",
  description: "主流自媒体平台导航：社交、视频、文章、音频平台一站式入口。",
};

function getTypeStyle(type: string) {
  const map: Record<string, string> = {
    图文: "bg-sky-50 text-sky-700 border-sky-100",
    短内容: "bg-orange-50 text-orange-700 border-orange-100",
    综合: "bg-slate-50 text-slate-700 border-slate-200",
    种草: "bg-pink-50 text-pink-700 border-pink-100",
    文艺: "bg-emerald-50 text-emerald-700 border-emerald-100",
    问答: "bg-violet-50 text-violet-700 border-violet-100",
    短视频: "bg-orange-50 text-orange-700 border-orange-100",
    长视频: "bg-sky-50 text-sky-700 border-sky-100",
    中视频: "bg-amber-50 text-amber-700 border-amber-100",
    资讯: "bg-slate-50 text-slate-700 border-slate-200",
    音频: "bg-indigo-50 text-indigo-700 border-indigo-100",
    广播: "bg-emerald-50 text-emerald-700 border-emerald-100",
    音乐: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    播客: "bg-cyan-50 text-cyan-700 border-cyan-100",
    有声书: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return map[type] || "bg-slate-50 text-slate-700 border-slate-200";
}

export default function MediaNavigationPage() {
  return (
    <div id="top" className="bg-slate-50 min-h-screen">
      <section className="bg-gradient-to-r from-orange-600 to-amber-500 text-white">
        <div className="container mx-auto px-4 py-14 md:py-20 max-w-7xl">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            自媒体导航
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/90 max-w-3xl leading-relaxed">
            一站式获取主流自媒体平台入口与定位，快速找到适合你的内容发布渠道。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center rounded-full bg-white/95 text-orange-700 px-4 py-2 text-xs md:text-sm font-bold hover:bg-white transition-colors"
              >
                {s.title}
              </a>
            ))}
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-black/15 text-white px-4 py-2 text-xs md:text-sm font-bold hover:bg-black/20 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 md:py-14 max-w-7xl space-y-12">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-3">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {section.title}
                </h2>
                <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                  {section.items.length} 个平台
                </span>
              </div>
              <a
                href="#top"
                className="text-xs font-bold text-gray-500 hover:text-orange-600"
              >
                回到顶部
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <div
                  key={`${section.id}-${item.name}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-500/25 transition-all overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.icon ? (
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg border border-gray-100 bg-white object-contain p-1"
                          />
                        ) : null}
                        <h3 className="text-lg font-extrabold text-slate-900 truncate">
                          {item.name}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${getTypeStyle(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-4">
                      {item.desc}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500 font-semibold">
                        {item.users}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-extrabold text-orange-600 hover:text-orange-700"
                      >
                        注册入口 →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
