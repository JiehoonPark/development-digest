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
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\n---\n\n${userContent}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const result = textBlock?.text ?? "";

    log.info(
      {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
      "Claude API 응답"
    );

    return result;
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

export function parseJsonResponse<T>(raw: string): T {
  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) ?? raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!jsonMatch) {
    throw new Error("JSON 파싱 실패: JSON 블록을 찾을 수 없음");
  }
  return JSON.parse(jsonMatch[1]);
}
