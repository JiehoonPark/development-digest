import type { ReactNode } from "react";

import { AppShell, ShellKeyboard } from "@/widgets/app-shell";
import { CmdKProvider } from "@/widgets/cmdk-palette";
import { Sidebar } from "@/widgets/sidebar";

/** 기존 기사 나열형 다이제스트 영역(사이드바 + ⌘K) */
export default function DigestLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppShell sidebar={<Sidebar />}>{children}</AppShell>
      <CmdKProvider />
      <ShellKeyboard />
    </>
  );
}
