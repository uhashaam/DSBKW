import { redirect } from "next/navigation";
import CategoryArchive from "@/components/CategoryArchive";

export async function generateStaticParams() {
  const categories = [
    { slug: "jingdong" },
    { slug: "pdd" },
    { slug: "taobao" },
    { slug: "ask" },
    { slug: "video" },
    { slug: "bridge" },
    { slug: "baike" },
    { slug: "tools" },
  ];
  return categories.map((c) => ({
    slug: c.slug,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // These are top-level post pages on the main website (e.g. /social/), not category archives.
  if (["com", "social", "search", "b2b"].includes(slug)) {
    redirect(`/${slug}/`);
  }
  return <CategoryArchive slug={slug} pageNumber={1} lang="zh" />;
}
