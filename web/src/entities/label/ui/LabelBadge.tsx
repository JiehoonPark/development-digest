import { isKnownLabel, type KnownLabel } from "../config/label-config";
import styles from "./LabelBadge.module.css";

interface LabelBadgeProps {
  label: string;
}

const CLASS_MAP: Record<KnownLabel, string> = {
  frontend: styles.frontend,
  backend: styles.backend,
  typescript: styles.typescript,
  devops: styles.devops,
  ai: styles.ai,
  career: styles.career,
  general: styles.general,
};

export function LabelBadge({ label }: LabelBadgeProps) {
  const tone = isKnownLabel(label) ? CLASS_MAP[label] : styles.general;
  return <span className={`${styles.badge} ${tone}`}>{label}</span>;
}
