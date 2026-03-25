import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSimulationFromQuestion } from "@/lib/ai/engine";
import type { ChatMessage } from "@/lib/ai/types";
import { getSciSparkAiProvider } from "@/lib/ai/config";
import {
  getAnthropicKey,
  getGeminiKey,
  getOpenAiKey,
} from "@/lib/ai/config";
import { simulationSpecSchema } from "@/lib/scispark/simulation-schema";
import { normalizeSimulationSpec } from "@/lib/scispark/spec-normalize";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .optional(),
  intent: z.enum(["replace", "extend"]).optional(),
  existingSpec: simulationSpecSchema.nullable().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { message, history, intent, existingSpec: rawExisting } = parsed.data;
  const chatHistory = (history ?? []) as ChatMessage[];

  const existingSpec =
    rawExisting != null ? normalizeSimulationSpec(rawExisting) : null;
  const wantsExtend = intent === "extend" && existingSpec != null;

  const result = await generateSimulationFromQuestion(message, chatHistory, {
    intent: wantsExtend ? "extend" : "replace",
    existingSpec: wantsExtend ? existingSpec : null,
  });

  if (!result.ok) {
    const id = getSciSparkAiProvider();
    const keyForActive =
      id === "openai"
        ? getOpenAiKey()
        : id === "anthropic"
          ? getAnthropicKey()
          : getGeminiKey();

    return NextResponse.json(
      {
        error: result.error,
        hint: keyForActive
          ? "Check SCI_SPARK_AI_MODEL, network, and API quotas."
          : "No API key for the active provider. Add the matching env var, or omit keys to use built-in demos.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    spec: result.spec,
    meta: {
      usedDemo: result.usedDemo,
      provider: result.provider ?? null,
      activeProviderConfig: getSciSparkAiProvider(),
      warning: result.warning,
    },
  });
}
