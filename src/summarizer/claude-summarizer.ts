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
  model = "claude-haiku-4-5-20251001"
): Promise<string> {
  const anthropic = getClient();

  log.info(
    { model, inputLength: userContent.length },
    "Claude API 호출"
  );

  const message = await anthropic.messages.create({
    model,
    max_tokens: 4096,
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
}

export function parseJsonResponse<T>(raw: string): T {
  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) ?? raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!jsonMatch) {
    throw new Error("JSON 파싱 실패: JSON 블록을 찾을 수 없음");
  }
  return JSON.parse(jsonMatch[1]);
}
