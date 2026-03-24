import type {
  AiCompletionParams,
  AiCompletionResult,
  AiProvider,
} from "../types";

export function createAnthropicProvider(
  apiKey: string,
  defaultModel?: string,
): AiProvider {
  const model = defaultModel ?? "claude-3-5-haiku-20241022";
  return {
    id: "anthropic",
    async complete({
      system,
      messages,
    }: AiCompletionParams): Promise<AiCompletionResult> {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          temperature: 0.4,
          system,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic error ${res.status}: ${err}`);
      }
      const data = (await res.json()) as {
        content?: { type: string; text?: string }[];
      };
      const text =
        data.content?.find((c) => c.type === "text")?.text ?? "";
      return { text };
    },
  };
}
