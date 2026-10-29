const TRACKING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "ref"];

/**
 * 같은 글을 가리키는 URL 을 하나의 키로 맞춘다.
 * hash·추적 파라미터·끝 슬래시를 제거한다. URL 이 아니면 원문을 그대로 쓴다.
 */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const param of TRACKING_PARAMS) u.searchParams.delete(param);
    return u.toString().replace(/\/+$/, "");
  } catch {
    return url;
  }
}
