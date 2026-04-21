import { countArchiveItems, getArchive } from "@/entities/archive";
import { getCategoryMeta } from "@/entities/category";
import { PropertyPanel } from "@/widgets/property-panel";

interface DailyDigestPanelProps {
  year: string;
  month: string;
  day: string;
}

export function DailyDigestPanel({ year, month, day }: DailyDigestPanelProps) {
  const archive = getArchive(`${year}-${month}-${day}`);
  if (!archive) return <PropertyPanel groups={[]} />;

  const total = countArchiveItems(archive);
  const categories = archive.sections.map((s) => {
    const meta = getCategoryMeta(s.category);
    return `${meta.emoji} ${meta.title} (${s.items.length})`;
  });

  return (
    <PropertyPanel
      groups={[
        {
          title: "Properties",
          rows: [
            { key: "날짜", value: archive.date },
            { key: "아티클", value: `${total}개` },
            { key: "섹션", value: `${archive.sections.length}개` },
            { key: "카테고리", value: <div>{categories.map((c) => <div key={c}>{c}</div>)}</div> },
          ],
        },
      ]}
    />
  );
}
