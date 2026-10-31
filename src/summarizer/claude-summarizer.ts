import Anthropic from "@anthropic-ai/sdk";
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("summarizer");

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

export async function askClaude(
  systemPrompt: string,
  userContent: string,
  model = "claude-haiku-4-5-20251001",
  maxTokens = 4096
): Promise<string> {
  const anthropic = getClient();

  log.info(
    { model, inputLength: userContent.length },
    "Claude API 호출"
  );

  try {
    // 지시문은 system 에, 신뢰할 수 없는 원문은 user 데이터로 분리한다.
    // 한 메시지에 섞으면 원문 속 문장이 지시문과 같은 무게로 읽힌다.
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    log.info(
      {
        stopReason: message.stop_reason,
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
      "Claude API 응답"
    );

    return readCompleteText(message, maxTokens);
  } catch (error: unknown) {
    const apiError = error as { status?: number; message?: string; error?: { error?: { message?: string } } };
    log.error(
      { status: apiError.status, errorMessage: apiError.message ?? apiError.error?.error?.message },
      "Claude API 호출 실패"
    );
    if (apiError.status === 400 && apiError.error?.error?.message?.includes("credit balance")) {
      throw new Error(
        "Anthropic API 크레딧이 부족합니다. https://console.anthropic.com/settings/billing 에서 크레딧을 충전하세요."
      );
    }
    throw error;
  }
}

/** 긴 글 생성용 — 스트리밍으로 받는다. 잘림·거절 처리는 askClaude 와 같다 */
export async function askClaudeComplete(
  systemPrompt: string,
  userContent: string,
  model: string,
  maxTokens: number
): Promise<string> {
  // 긴 출력은 비스트리밍 호출이 SDK 의 10분 제한 검사에 걸리므로 스트림으로 받아 마지막 메시지만 쓴다
  const message = await getClient()
    .messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    })
    .finalMessage();

  log.info(
    { model, stopReason: message.stop_reason, inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens },
    "Claude API 응답"
  );
  return readCompleteText(message, maxTokens);
}

/**
 * 잘리거나 거절된 응답은 성공으로 넘기지 않는다.
 * 잘린 요약·거절 문구("I cannot…")도 비어 있지 않은 텍스트라 그대로 두면 정상 결과처럼 발행된다.
 */
function readCompleteText(
  message: { stop_reason: string | null; content: Array<{ type: string; text?: string }> },
  maxTokens: number
): string {
  // 구형 SDK 타입에 없는 값(refusal)도 런타임에서는 올 수 있어 문자열로 비교한다
  const stopReason = String(message.stop_reason);
  if (stopReason === "max_tokens") throw new Error(`응답이 max_tokens(${maxTokens})에서 잘렸습니다`);
  if (stopReason === "refusal") throw new Error("모델이 응답을 거절했습니다 (refusal)");

  const text = message.content.find((block) => block.type === "text")?.text ?? "";
  if (text.trim().length === 0) throw new Error("빈 응답");
  return text;
}

export function parseJsonResponse<T>(raw: string): T {
  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) ?? raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!jsonMatch) {
    log.error({ raw: raw.slice(0, 500) }, "JSON 블록을 찾을 수 없음");
    throw new Error("JSON 파싱 실패: JSON 블록을 찾을 수 없음");
  }
  return JSON.parse(jsonMatch[1]);
}
