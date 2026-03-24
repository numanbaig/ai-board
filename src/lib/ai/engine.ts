import { getGeminiKey, getSciSparkAiModel } from "./config";
import { buildSciSparkSystemPrompt } from "./system-prompt";
import type { ChatMessage } from "./types";
import { createSciSparkAiProvider } from "./providers/factory";
import { completeGeminiWithFallback } from "./providers/gemini-fallback";
import {
  simulationSpecSchema,
  type SimulationSpec,
} from "@/lib/scispark/simulation-schema";
import { demoSimulationForQuestion } from "@/lib/scispark/demo-simulations";

function stripJsonFence(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return t.trim();
}

export type GenerateSimulationResult =
  | {
      ok: true;
      spec: SimulationSpec;
      usedDemo: boolean;
      provider?: string;
      warning?: string;
    }
  | { ok: false; error: string };

export async function generateSimulationFromQuestion(
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<GenerateSimulationResult> {
  const system = buildSciSparkSystemPrompt();
  const messages: ChatMessage[] = [
    ...history,
    { role: "user", content: userMessage },
  ];

  const resolved = createSciSparkAiProvider();
  if (!resolved) {
    const spec = demoSimulationForQuestion(userMessage);
    const parsed = simulationSpecSchema.safeParse(spec);
    if (!parsed.success) {
      return { ok: false, error: "Demo simulation failed validation." };
    }
    return { ok: true, spec: parsed.data, usedDemo: true };
  }

  try {
    let text: string;
    let extraWarning: string | undefined;

    if (resolved.provider.id === "gemini") {
      const key = getGeminiKey();
      if (!key) {
        return { ok: false, error: "Missing GOOGLE_AI_API_KEY or GEMINI_API_KEY." };
      }
      const r = await completeGeminiWithFallback(key, getSciSparkAiModel(), {
        system,
        messages,
      });
      text = r.text;
      extraWarning = r.warning;
    } else {
      text = (await resolved.provider.complete({ system, messages })).text;
    }

    const json = stripJsonFence(text);
    const raw = JSON.parse(json) as unknown;
    const parsed = simulationSpecSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: `Model JSON did not match schema: ${parsed.error.message}`,
      };
    }
    return {
      ok: true,
      spec: parsed.data,
      usedDemo: false,
      provider: resolved.provider.id,
      warning: extraWarning,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown AI error";
    const geminiExhausted =
      resolved.provider.id === "gemini" &&
      (/\b429\b/.test(msg) ||
        /RESOURCE_EXHAUSTED/i.test(msg) ||
        /quota exceeded/i.test(msg));

    if (geminiExhausted) {
      const spec = demoSimulationForQuestion(userMessage);
      const parsedDemo = simulationSpecSchema.safeParse(spec);
      if (parsedDemo.success) {
        return {
          ok: true,
          spec: parsedDemo.data,
          usedDemo: true,
          provider: "gemini",
          warning:
            "All tried Gemini models hit limits or errors. Showing a built-in demo — wait, check Google AI quota/billing, or set SCI_SPARK_AI_MODEL, then try again.",
        };
      }
    }

    return { ok: false, error: msg };
  }
}
