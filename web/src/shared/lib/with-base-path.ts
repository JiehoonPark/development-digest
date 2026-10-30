/** 사이트 내부 정적 파일 경로에 배포 basePath 를 붙인다. 외부 URL 은 그대로 둔다. */
export function withBasePath(src: string): string {
  const isExternal = /^https?:\/\//.test(src);
  if (isExternal || !src.startsWith("/")) return src;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
}
