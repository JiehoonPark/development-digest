import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 10000,
    // tests/web 은 web/ 의 의존성(rehype 등)이 필요하다 — web 설치 뒤 CI 의 "Web" 단계에서 따로 돌린다
    exclude: ["**/node_modules/**", "tests/web/**"],
  },
});
