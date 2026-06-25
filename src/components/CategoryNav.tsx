import Link from "next/link";

type Lang = "zh" | "en";

const categoriesZh = [
  { name: "全部", slug: "" },
  { name: "京东", slug: "jingdong" },
  { name: "拼多多", slug: "pdd" },
  { name: "淘宝天猫", slug: "taobao" },
  { name: "电商资讯", slug: "ask" },
  { name: "直播带货", slug: "video" },
  { name: "跨境电商", slug: "bridge" },
  { name: "电商百科", slug: "baike" },
  { name: "工具大全", slug: "tools" },
];

const categoriesEn = [
  { name: "All", slug: "" },
  { name: "Jingdong", slug: "jingdong" },
  { name: "Pinduoduo", slug: "pdd" },
  { name: "Taobao Tmall", slug: "taobao" },
  { name: "E-Commerce News", slug: "ask" },
  { name: "Live Streaming", slug: "video" },
  { name: "Cross-Border", slug: "bridge" },
  { name: "E-Commerce Wiki", slug: "baike" },
  { name: "Tools Directory", slug: "tools" },
];

export default function CategoryNav({
  currentSlug,
  lang = "zh",
}: {
  currentSlug?: string;
  lang?: Lang;
}) {
  const categories = lang === "en" ? categoriesEn : categoriesZh;
  const prefix = lang === "en" ? "/en" : "";

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((cat) => {
        const isActive = currentSlug === cat.slug || (!currentSlug && cat.slug === "");
        return (
          <Link
            key={cat.slug}
            href={cat.slug ? `${prefix}/category/${cat.slug}/` : `${prefix}/`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--color-brand-primary)] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
