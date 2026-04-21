import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeScript } from "@/features/toggle-theme";
import { AnalyticsScript } from "@/shared/ui";
import { AppShell, ShellKeyboard } from "@/widgets/app-shell";
import { CmdKProvider } from "@/widgets/cmdk-palette";
import { Sidebar } from "@/widgets/sidebar";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dev Digest — FE 데일리 리포트",
  description: "AI가 큐레이션한 프론트엔드 개발 뉴스",
};

export default function RootLayout({
  children,
  panel,
}: {
  children: ReactNode;
  panel: ReactNode;
}) {
  return (
    <html lang="ko" data-theme="light" data-size="default" data-font="pretendard">
      <head>
        <ThemeScript />
        <AnalyticsScript />
      </head>
      <body>
        <AppShell sidebar={<Sidebar />} panel={panel}>
          {children}
        </AppShell>
        <CmdKProvider />
        <ShellKeyboard />
      </body>
    </html>
  );
}
