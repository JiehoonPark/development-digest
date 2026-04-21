import { listArchives } from "@/entities/archive";
import { ArticleDetailPanel } from "@/views/article-detail";

export const dynamic = "force-static";

export function generateStaticParams() {
  const params: Array<{ year: string; month: string; day: string; slug: string }> = [];
  for (const archive of listArchives()) {
    const [year, month, day] = archive.date.split("-");
    for (const section of archive.sections) {
      for (const item of section.items) {
        params.push({ year, month, day, slug: item.slug });
      }
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ year: string; month: string; day: string; slug: string }>;
}

export default async function ArticleDetailPanelPage({ params }: PageProps) {
  const { year, month, day, slug } = await params;
  return <ArticleDetailPanel year={year} month={month} day={day} slug={slug} />;
}
