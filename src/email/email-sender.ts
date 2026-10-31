import { createHash } from "node:crypto";
import { Resend } from "resend";
import { getRecipients, getSubject, EMAIL_FROM } from "../../config/email.js";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("email");

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendDigestEmail(html: string): Promise<void> {
  const recipients = [...new Set(getRecipients())].sort();
  if (recipients.length === 0) {
    throw new Error("수신자 이메일이 설정되지 않았습니다. DIGEST_RECIPIENTS 환경변수를 확인하세요.");
  }

  const resend = getResend();
  const subject = getSubject();

  log.info({ recipients, subject }, "이메일 발송 시작");

  const payload = { from: EMAIL_FROM, to: recipients, subject, html };
  // 발송 직후 단계에서 실패해 워크플로를 다시 돌려도 같은 메일이 두 번 가지 않도록,
  // 같은 날짜·수신자·본문이면 같은 키를 보낸다. Resend 가 키 기준으로 중복 요청을 무시한다.
  const idempotencyKey = `dev-digest-${createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`;
  const { data, error } = await resend.emails.send(payload, { idempotencyKey });

  if (error) {
    throw new Error(`이메일 발송 실패: ${error.message}`);
  }
  if (!data?.id) {
    throw new Error("이메일 발송 결과에 성공 ID가 없습니다");
  }

  log.info({ id: data.id, recipients }, "이메일 발송 완료");
}

export async function sendTestEmail(html: string, to: string): Promise<void> {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject: `[TEST] ${getSubject()}`,
    html,
  });

  if (error) {
    throw new Error(`테스트 이메일 발송 실패: ${error.message}`);
  }

  log.info({ to }, "테스트 이메일 발송 완료");
}
