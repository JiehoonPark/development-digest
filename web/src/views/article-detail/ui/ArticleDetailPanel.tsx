import { getArchive } from "@/entities/archive";
import { getDisplayTitle } from "@/entities/article";
import { getCategoryMeta } from "@/entities/category";
import { LabelBadge } from "@/entities/label";
import { PropertyPanel } from "@/widgets/property-panel";
import { formatEngagement } from "@/shared/lib";
import type { ArchiveItem } from "@/shared/config";

interface ArticleDetailPanelProps {
  year: string;
  month: string;
  day: string;
  slug: string;
}

export function ArticleDetailPanel({ year, month, day, slug }: ArticleDetailPanelProps) {
  const date = `${year}-${month}-${day}`;
  const archive = getArchive(date);
  const item = archive?.sections
    .flatMap((s) => s.items)
    .find((i) => i.slug === slug);

  if (!item || !archive) return <PropertyPanel groups={[]} />;

  return (
    <PropertyPanel
      groups={[
        {
          title: "Properties",
          rows: [
            { key: "제목", value: getDisplayTitle(item) },
            { key: "날짜", value: date },
            { key: "출처", value: item.sourceName },
            { key: "카테고리", value: renderCategory(item.category) },
            ...(item.labels?.length
              ? [{ key: "라벨", value: renderLabels(item.labels) }]
              : []),
            ...(item.engagement
              ? [{ key: "Engagement", value: `⬆ ${formatEngagement(item.engagement)}` }]
              : []),
            ...(item.contentType === "video"
              ? [{ key: "유형", value: "🎬 Video" }]
              : []),
          ],
        },
      ]}
    />
  );
}

function renderCategory(category: string) {
  const meta = getCategoryMeta(category);
  return (
    <>
      <span>{meta.emoji}</span>
      <span>{meta.title}</span>
    </>
  );
}

function renderLabels(labels: ArchiveItem["labels"]) {
  return (
    <>
      {(labels ?? []).map((l) => (
        <LabelBadge key={l} label={l} />
      ))}
    </>
  );
}
