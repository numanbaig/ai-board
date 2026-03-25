"use client";

import { useCallback, useRef, useState } from "react";
import type { SimulationSpec } from "@/lib/scispark/simulation-schema";
import { normalizeSimulationSpec } from "@/lib/scispark/spec-normalize";
import { AIPanel } from "./AIPanel";
import { ConceptPromptBar } from "./ConceptPromptBar";
import type { PromptSendOptions } from "./prompt-options";
import {
  SimulationCanvas,
  type SimulationCanvasHandle,
} from "./SimulationCanvas";

type ChatLine = { role: "user" | "assistant"; text: string };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function SciSparkShell() {
  const stageApiRef = useRef<SimulationCanvasHandle>(null);
  const [scene, setScene] = useState<SimulationSpec | null>(null);
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [lastMeta, setLastMeta] = useState<{
    usedDemo: boolean;
    provider: string | null;
  } | null>(null);

  const removeAiStroke = useCallback((id: string) => {
    setScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        aiStrokes: prev.aiStrokes.filter((s) => s.id !== id),
      };
    });
  }, []);

  const clearAiBoard = useCallback(() => {
    setScene({
      title: "Whiteboard",
      explanationSteps: ["Ask a question below to draw a new lesson."],
      aiStrokes: [],
      notePanels: [],
      backdrop: { type: "plain" },
    });
    setActiveStep(0);
  }, []);

  const handleSend = useCallback(
    async (text: string, options?: PromptSendOptions) => {
      const addToBoard = Boolean(options?.addToBoard && scene);
      setMessages((m) => [...m, { role: "user", text }]);
      setLoading(true);
      try {
        const historyForApi = messages.slice(-8).map((x) => ({
          role: x.role,
          content: x.text,
        }));
        const res = await fetch("/api/scispark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: historyForApi,
            intent: addToBoard ? "extend" : "replace",
            existingSpec: addToBoard ? scene : undefined,
          }),
        });
        const data = (await res.json()) as {
          spec?: SimulationSpec;
          error?: string;
          hint?: string;
          meta?: {
            usedDemo: boolean;
            provider: string | null;
            warning?: string;
          };
        };
        if (!res.ok) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: `Oops: ${data.error ?? "Something went wrong."}${data.hint ? ` — ${data.hint}` : ""}`,
            },
          ]);
          return;
        }
        if (data.spec) {
          setScene(normalizeSimulationSpec(data.spec));
          setActiveStep(0);
          setLastMeta(
            data.meta ?? {
              usedDemo: false,
              provider: null,
            },
          );
          const first = data.spec.explanationSteps[0] ?? data.spec.title;
          const reply = data.meta?.warning
            ? `${data.meta.warning}\n\n${first}`
            : first;
          setMessages((m) => [...m, { role: "assistant", text: reply }]);
        }
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: "Network error. Try again in a moment." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, scene],
  );

  const clearEverything = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear the whole session — board, chat, and your pen marks?")
    ) {
      return;
    }
    setScene(null);
    setMessages([]);
    setActiveStep(0);
    setLastMeta(null);
    requestAnimationFrame(() => {
      stageApiRef.current?.clearUserSketches();
    });
  }, []);

  const title = scene?.title ?? "Whiteboard";
  const aiStrokes = scene?.aiStrokes ?? [];
  const notePanels = scene?.notePanels ?? [];
  const steps = scene?.explanationSteps ?? [];
  const highlight =
    steps.length > 0 ? steps[clamp(activeStep, 0, steps.length - 1)] : "";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-2">
            <SimulationCanvas
              ref={stageApiRef}
              title={title}
              aiStrokes={aiStrokes}
              notePanels={notePanels}
              activeStep={activeStep}
              backdrop={scene?.backdrop}
              onRemoveAiStroke={removeAiStroke}
              onClearAiBoard={scene ? clearAiBoard : undefined}
            />
            <AIPanel
              messages={messages}
              onSend={(t, o) => handleSend(t, o)}
              loading={loading}
              activeStep={activeStep}
              totalSteps={steps.length}
              onStepChange={setActiveStep}
              lastMeta={lastMeta}
              showComposer={false}
              onClearSession={clearEverything}
            />
          </div>
          <ConceptPromptBar onSend={handleSend} loading={loading} hasBoard={!!scene} />
        </div>
        {highlight && (
          <div className="shrink-0 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-center text-xs font-semibold leading-snug text-slate-800 shadow-sm line-clamp-2">
            {highlight}
          </div>
        )}
      </div>
    </div>
  );
}
