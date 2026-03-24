import {
  getAnthropicKey,
  getGeminiKey,
  getOpenAiKey,
  getSciSparkAiModel,
  getSciSparkAiProvider,
} from "../config";
import type { AiProvider, AiProviderId } from "../types";
import { createAnthropicProvider } from "./anthropic";
import { createGeminiProvider } from "./gemini";
import { createOpenAiProvider } from "./openai";

export type ResolvedAi = {
  provider: AiProvider;
  model?: string;
};

export function createSciSparkAiProvider(): ResolvedAi | null {
  const id: AiProviderId = getSciSparkAiProvider();
  const model = getSciSparkAiModel();

  if (id === "openai") {
    const key = getOpenAiKey();
    if (!key) return null;
    return { provider: createOpenAiProvider(key, model), model: model ?? "gpt-4o-mini" };
  }
  if (id === "anthropic") {
    const key = getAnthropicKey();
    if (!key) return null;
    return {
      provider: createAnthropicProvider(key, model),
      model: model ?? "claude-3-5-haiku-20241022",
    };
  }
  const key = getGeminiKey();
  if (!key) return null;
  return {
    provider: createGeminiProvider(key, model),
    model: model ?? "gemini-2.5-flash",
  };
}
