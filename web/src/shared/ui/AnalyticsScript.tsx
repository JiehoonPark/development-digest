import Script from "next/script";

/**
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID` env 가 있을 때만 GA4 스니펫을 inject.
 * 서버 렌더이므로 유저 인터랙션 없이도 `<head>` 에 안정적으로 박힘.
 */
export function AnalyticsScript() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${id}');`}
      </Script>
    </>
  );
}
