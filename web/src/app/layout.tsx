import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeScript } from "@/features/toggle-theme";
import { AnalyticsScript } from "@/shared/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dev Digest — 매일 하나, 깊게 읽는 프론트엔드",
  description: "매일 아침 프론트엔드 소식 하나를 깊게 정리합니다",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" data-theme="light" data-size="default" data-font="pretendard">
      <head>
        <ThemeScript />
        <AnalyticsScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
