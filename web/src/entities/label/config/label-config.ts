export const KNOWN_LABELS = [
  "frontend",
  "backend",
  "typescript",
  "devops",
  "ai",
  "career",
  "general",
] as const;

export type KnownLabel = (typeof KNOWN_LABELS)[number];

export function isKnownLabel(label: string): label is KnownLabel {
  return (KNOWN_LABELS as readonly string[]).includes(label);
}
