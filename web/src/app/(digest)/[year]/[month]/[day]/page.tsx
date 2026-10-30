import { listArchives } from "@/entities/archive";
import { DailyDigestView } from "@/views/daily-digest";

export const dynamic = "force-static";

export function generateStaticParams() {
  return listArchives().map((a) => {
    const [year, month, day] = a.date.split("-");
    return { year, month, day };
  });
}

interface PageProps {
  params: Promise<{ year: string; month: string; day: string }>;
}

export default async function DailyDigestPage({ params }: PageProps) {
  const { year, month, day } = await params;
  return <DailyDigestView year={year} month={month} day={day} />;
}
