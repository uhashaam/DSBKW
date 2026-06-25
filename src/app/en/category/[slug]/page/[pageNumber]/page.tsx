import { getPostsByCategory } from "@/lib/data";
import CategoryArchive from "@/components/CategoryArchive";

export async function generateStaticParams() {
  const categories = ["jingdong", "pdd", "taobao", "ask", "video", "bridge", "baike"];
  const params: Array<{ slug: string; pageNumber: string }> = [];

  for (const slug of categories) {
    const posts = await getPostsByCategory(slug, 'en');
    const totalPages = Math.ceil(posts.length / 15);
    for (let page = 2; page <= totalPages; page++) {
      params.push({
        slug,
        pageNumber: String(page),
      });
    }
  }

  // Fallback to prevent build error if there are no English posts / pages > 1 yet
  if (params.length === 0) {
    params.push({
      slug: "jingdong",
      pageNumber: "2",
    });
  }

  return params;
}

export default async function EnglishCategoryPaginationPage({
  params,
}: {
  params: Promise<{ slug: string; pageNumber: string }>;
}) {
  const { slug, pageNumber } = await params;
  return (
    <CategoryArchive
      slug={slug}
      pageNumber={parseInt(pageNumber) || 1}
      lang="en"
    />
  );
}
