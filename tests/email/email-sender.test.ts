import { afterEach, beforeEach, expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

import { sendDigestEmail } from "../../src/email/email-sender.js";

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "test-email-id" }, error: null });
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-04T10:00:00Z"));
  vi.stubEnv("DIGEST_RECIPIENTS", "b@example.com, a@example.com");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

it("같은 날짜·수신자·본문 재시도에는 같은 idempotency key 를 보낸다(수신자 순서 무관)", async () => {
  await sendDigestEmail("<html>same digest</html>");
  vi.stubEnv("DIGEST_RECIPIENTS", "a@example.com,b@example.com");
  await sendDigestEmail("<html>same digest</html>");

  const [first, second] = send.mock.calls;
  expect(first[1]?.idempotencyKey).toMatch(/^dev-digest-[a-f0-9]{64}$/);
  expect(second).toEqual(first);
});

it("본문·수신자·날짜가 다르면 다른 키", async () => {
  await sendDigestEmail("one");
  await sendDigestEmail("two");
  vi.stubEnv("DIGEST_RECIPIENTS", "new@example.com");
  await sendDigestEmail("two");
  vi.setSystemTime(new Date("2026-10-05T10:00:00Z"));
  await sendDigestEmail("two");

  expect(new Set(send.mock.calls.map((call) => call[1]?.idempotencyKey)).size).toBe(4);
});

it.each([
  { data: null, error: null },
  { data: null, error: { message: "failed" } },
])("성공 ID 가 없거나 API 오류면 성공으로 처리하지 않는다", async (response) => {
  send.mockResolvedValue(response);
  await expect(sendDigestEmail("content")).rejects.toThrow();
});
