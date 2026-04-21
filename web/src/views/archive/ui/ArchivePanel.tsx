import { countArchiveItems, listArchives } from "@/entities/archive";
import { PropertyPanel } from "@/widgets/property-panel";

export function ArchivePanel() {
  const archives = listArchives();
  if (archives.length === 0) return <PropertyPanel groups={[]} />;

  const total = archives.reduce((acc, a) => acc + countArchiveItems(a), 0);
  const first = archives[archives.length - 1]?.date;
  const last = archives[0]?.date;

  return (
    <PropertyPanel
      groups={[
        {
          title: "Statistics",
          rows: [
            { key: "다이제스트", value: `${archives.length}개` },
            { key: "전체 아티클", value: `${total}개` },
            { key: "첫 기록", value: first ?? "—" },
            { key: "최근 기록", value: last ?? "—" },
          ],
        },
      ]}
    />
  );
}
