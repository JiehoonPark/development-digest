/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/development-digest" : "";

// GA4 Measurement ID.
// 이 값은 모든 방문자 HTML 에 어차피 박히는 공개 식별자라 코드에 넣어도 비밀이 아님.
// 다른 환경(테스트 속성 등)에서 override 하려면 빌드 시 `NEXT_PUBLIC_GA_MEASUREMENT_ID` env 지정.
// 빈 값이면 AnalyticsScript 가 아무것도 렌더하지 않음 (→ GA 비활성).
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-2SP8W5JRJY";

const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: GA_MEASUREMENT_ID,
  },
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
};

export default nextConfig;
