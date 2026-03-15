import { formatDigestDate } from "../src/utils/date.js";

export function getRecipients(): string[] {
  const raw = process.env.DIGEST_RECIPIENTS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function getSubject(date?: Date): string {
  return `📬 Dev Digest — ${formatDigestDate(date)}`;
}

export const EMAIL_FROM = "Dev Digest <onboarding@resend.dev>";
