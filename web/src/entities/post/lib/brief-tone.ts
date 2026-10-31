/** 짧은 소식 라벨 → 칩 색 역할. 보안은 경고색, 업데이트/후속은 보조색, 나머지는 기본(Primary) */
export type BriefTone = "alert" | "update" | "default";

const ALERT_LABELS = new Set(["보안"]);
const UPDATE_LABELS = new Set(["업데이트", "후속"]);

export function getBriefTone(label: string): BriefTone {
  if (ALERT_LABELS.has(label)) return "alert";
  if (UPDATE_LABELS.has(label)) return "update";
  return "default";
}
