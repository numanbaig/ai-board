import type { AiProviderId } from "./types";

const PROVIDERS: AiProviderId[] = ["openai", "anthropic", "gemini"];

function normalizeProvider(value: string | undefined): AiProviderId {
  const v = (value ?? "openai").toLowerCase().trim();
  if (PROVIDERS.includes(v as AiProviderId)) return v as AiProviderId;
  return "openai";
}

export function getSciSparkAiProvider(): AiProviderId {
  return normalizeProvider(process.env.SCI_SPARK_AI_PROVIDER);
}

export function getSciSparkAiModel(): string | undefined {
  const m = process.env.SCI_SPARK_AI_MODEL?.trim();
  return m || undefined;
}

export function getOpenAiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim();
}

export function getAnthropicKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY?.trim();
}

export function getGeminiKey(): string | undefined {
  return process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
}
