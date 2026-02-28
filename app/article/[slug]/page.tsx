// app/article/[slug]/page.tsx
import { Metadata } from "next";
import { ArticleContent } from "./_components/ArticleContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | Zenith`,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  return <ArticleContent slug={slug} />;
}
