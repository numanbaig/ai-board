import type { AiCompletionParams } from "../types";
import { createGeminiProvider } from "./gemini";

/** Current API model ids (1.5 / bare "gemini-1.5-flash" often return 404 on v1beta). */
const FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
] as const;

function isRetriableGeminiError(message: string): boolean {
  return (
    /\b404\b/.test(message) ||
    /NOT_FOUND/i.test(message) ||
    /\b429\b/.test(message) ||
    /RESOURCE_EXHAUSTED/i.test(message) ||
    /quota exceeded/i.test(message)
  );
}

/**
 * Tries the configured model first, then stable alternates on 404 / quota errors.
 */
export async function completeGeminiWithFallback(
  apiKey: string,
  configuredModel: string | undefined,
  params: AiCompletionParams,
): Promise<{ text: string; warning?: string }> {
  const primary = (configuredModel?.trim() || FALLBACK_CHAIN[0])!;
  const chain = [
    primary,
    ...FALLBACK_CHAIN.filter((m) => m !== primary),
  ];

  let lastErr: Error | null = null;

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    try {
      const provider = createGeminiProvider(apiKey, model);
      const { text } = await provider.complete(params);
      const warning =
        i > 0
          ? `Gemini model "${primary}" was unavailable or rate-limited; used "${model}" instead.`
          : undefined;
      return { text, warning };
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      const retriable = isRetriableGeminiError(lastErr.message);
      if (!retriable || i === chain.length - 1) {
        throw lastErr;
      }
    }
  }

  throw lastErr ?? new Error("Gemini request failed");
}
