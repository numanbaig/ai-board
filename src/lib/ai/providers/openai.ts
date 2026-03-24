import type {
  AiCompletionParams,
  AiCompletionResult,
  AiProvider,
} from "../types";

export function createOpenAiProvider(apiKey: string, defaultModel?: string): AiProvider {
  const model = defaultModel ?? "gpt-4o-mini";
  return {
    id: "openai",
    async complete({ system, messages }: AiCompletionParams): Promise<AiCompletionResult> {
      const body = {
        model,
        temperature: 0.4,
        response_format: { type: "json_object" as const },
        messages: [{ role: "system" as const, content: system }, ...messages],
      };
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${err}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content ?? "";
      return { text };
    },
  };
}
