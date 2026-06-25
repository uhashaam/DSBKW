import Link from "next/link";
import Image from "next/image";

export interface Article {
  slug: string;
  title: string;
  categories: string[];
  featuredImage: string | null;
  publishedTime: string | null;
  content: string;
}

export default function ArticleCard({ article }: { article: Article }) {
  const defaultImage = "/wp-content/uploads/2024/08/20240813-161115.png"; // Placeholder if no image
  const isEn = article.slug?.startsWith("en/");

  return (
    <Link href={`/${article.slug}/`} className="group block overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={article.featuredImage || defaultImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {article.categories && article.categories.length > 0 && (
          <div className="absolute left-3 top-3">
            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-primary)] rounded shadow-sm">
              {article.categories[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[var(--color-brand-primary)] transition-colors">
          {article.title}
        </h3>
        {article.publishedTime && (
          <p className="text-xs text-gray-500">
            {new Date(article.publishedTime).toLocaleDateString(isEn ? "en-US" : "zh-CN", {
              year: "numeric",
              month: isEn ? "long" : "short",
              day: "numeric",
            })}
          </p>
        )}
      </div>
    </Link>
  );
}
