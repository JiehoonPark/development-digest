import { defineConfig } from "vitest/config";

/** web/ 코드의 단위 테스트. web/node_modules 를 설치한 뒤에 실행한다(npm run test:web) */
export default defineConfig({
  test: {
    globals: true,
    include: ["tests/web/**/*.test.ts"],
  },
});
