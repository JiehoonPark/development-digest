const SLUG_MAX_LENGTH = 80;

export function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .trim()
    // 한국어 자모/음절은 유지
    .replace(/[^\w\s\uAC00-\uD7AF\u3131-\u3163-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug.length > SLUG_MAX_LENGTH) {
    slug = slug.slice(0, SLUG_MAX_LENGTH).replace(/-[^-]*$/, "");
  }

  return slug || "untitled";
}

export function uniqueSlug(title: string, existingSlugs: Set<string>): string {
  const base = generateSlug(title);
  if (!existingSlugs.has(base)) {
    existingSlugs.add(base);
    return base;
  }

  let counter = 2;
  while (existingSlugs.has(`${base}-${counter}`)) {
    counter++;
  }

  const unique = `${base}-${counter}`;
  existingSlugs.add(unique);
  return unique;
}
