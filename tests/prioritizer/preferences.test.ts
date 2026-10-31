import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDigestPreferences, parseDigestPreferences } from "../../config/preferences.js";

const tempDirs: string[] = [];
afterEach(() => {
  vi.unstubAllEnvs();
  tempDirs.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true }));
});

describe("개인화 설정", () => {
  it("저장소 기본 설정은 개인화 전 동작과 같다", () => {
    expect(getDigestPreferences()).toEqual({
      preferredKeywords: [],
      excludedKeywords: [],
      excludedSourceIds: [],
      maxCandidates: 50,
    });
  });

  it("지정한 파일을 호출할 때마다 다시 읽는다", () => {
    const dir = mkdtempSync(join(tmpdir(), "digest-prefs-"));
    tempDirs.push(dir);
    const path = join(dir, "preferences.json");
    vi.stubEnv("DIGEST_PREFERENCES_PATH", path);
    writeFileSync(path, JSON.stringify({ preferredKeywords: ["React"] }));
    expect(getDigestPreferences().preferredKeywords).toEqual(["React"]);
    writeFileSync(path, JSON.stringify({ preferredKeywords: ["CSS"] }));
    expect(getDigestPreferences().preferredKeywords).toEqual(["CSS"]);
  });

  it("파일이 없으면 기본값으로 숨기지 않고 실패한다", () => {
    vi.stubEnv("DIGEST_PREFERENCES_PATH", "/nonexistent/digest-preferences.json");
    expect(() => getDigestPreferences()).toThrow("개인화 설정");
  });

  it("키워드 공백·빈 값·대소문자 중복을 정리한다", () => {
    const result = parseDigestPreferences({ preferredKeywords: [" React ", "react", "", " TypeScript"] });
    expect(result.preferredKeywords).toEqual(["React", "TypeScript"]);
  });

  it("잘못된 숫자와 모르는 키를 거부한다", () => {
    for (const input of [{ maxCandidates: 0 }, { maxPerSource: 1.5 }, { preferredKeyword: [] }]) {
      expect(() => parseDigestPreferences(input)).toThrow();
    }
  });
});
