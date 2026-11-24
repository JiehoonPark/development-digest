import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeScript } from "@/features/toggle-theme";
import { SITE } from "@/shared/config";
import { AnalyticsScript } from "@/shared/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.tagline,
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
