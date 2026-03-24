import type {
  AiCompletionParams,
  AiCompletionResult,
  AiProvider,
} from "../types";

export function createGeminiProvider(
  apiKey: string,
  defaultModel?: string,
): AiProvider {
  const model = defaultModel ?? "gemini-2.5-flash";
  return {
    id: "gemini",
    async complete({
      system,
      messages,
    }: AiCompletionParams): Promise<AiCompletionResult> {
      const contents = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model,
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini error ${res.status}: ${err}`);
      }
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return { text };
    },
  };
}
