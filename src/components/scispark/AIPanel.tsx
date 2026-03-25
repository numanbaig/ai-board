"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { PromptSendOptions } from "./prompt-options";

type ChatLine = { role: "user" | "assistant"; text: string };

type Props = {
  messages: ChatLine[];
  onSend: (text: string, options?: PromptSendOptions) => void;
  loading: boolean;
  activeStep: number;
  totalSteps: number;
  onStepChange: (n: number) => void;
  lastMeta: { usedDemo: boolean; provider: string | null } | null;
  /** When false, main composer lives elsewhere (e.g. ConceptPromptBar). */
  showComposer?: boolean;
  onClearSession?: () => void;
};

export function AIPanel({
  messages,
  onSend,
  loading,
  activeStep,
  totalSteps,
  onStepChange,
  lastMeta,
  showComposer = true,
  onClearSession,
}: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || loading) return;
    setInput("");
    onSend(t, { addToBoard: false });
  }

  return (
    <aside className="flex max-h-[min(340px,36dvh)] min-h-0 w-full shrink-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm lg:max-h-full lg:w-[280px] lg:rounded-3xl lg:p-2.5 xl:w-[300px]">
      <header className="shrink-0 border-b border-slate-100 pb-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Teacher
            </p>
            <h2 className="text-sm font-bold text-slate-900">Chat</h2>
            {lastMeta && (
              <p className="mt-1 text-[10px] font-medium text-slate-500">
                {lastMeta.usedDemo
                  ? "Demo mode (add API keys for live AI)."
                  : `Powered by ${lastMeta.provider ?? "AI"}.`}
              </p>
            )}
          </div>
          {onClearSession && (
            <button
              type="button"
              onClick={onClearSession}
              className="shrink-0 rounded-lg border border-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-50"
            >
              New session
            </button>
          )}
        </div>
      </header>

      {totalSteps > 0 && (
        <div className="mt-1.5 shrink-0 rounded-xl border border-slate-100 bg-slate-50/90 p-1.5">
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">
            Lesson step
          </p>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={Math.min(activeStep, totalSteps - 1)}
              onChange={(e) => onStepChange(Number(e.target.value))}
              className="flex-1 accent-slate-800"
              aria-label="Explanation step"
            />
            <span className="w-10 text-center text-xs font-bold text-slate-900">
              {activeStep + 1}/{totalSteps}
            </span>
          </div>
        </div>
      )}

      <div className="mt-1.5 min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain rounded-xl border border-slate-100 bg-slate-50/80 p-1.5 lg:max-h-none">
        {messages.length === 0 && (
          <p className="p-1.5 text-xs font-medium text-slate-600">
            Try: &quot;Explain the water cycle&quot; or &quot;What is gravity?&quot;
            — the board will sketch and narrate step by step.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[95%] rounded-xl px-2.5 py-1.5 text-xs leading-snug shadow-sm sm:text-sm ${
              m.role === "user"
                ? "ml-auto bg-slate-800 font-semibold text-white"
                : "mr-auto border border-slate-100 bg-white font-medium text-slate-800"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="mr-auto rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
            Drawing on the board…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showComposer ? (
        <form
          onSubmit={handleSubmit}
          className="mt-1.5 flex h-10 shrink-0 gap-1.5 border-t border-slate-100 pt-1.5 sm:h-11"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What do you wonder?"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-900 shadow-inner outline-none ring-slate-400 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 sm:text-sm"
            disabled={loading}
            maxLength={2000}
            aria-label="Your question"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-full shrink-0 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            Go
          </button>
        </form>
      ) : (
        <p className="mt-1.5 shrink-0 border-t border-slate-100 pt-1.5 text-[10px] font-medium text-slate-500">
          Ask below the board — your chat history stays here.
        </p>
      )}
    </aside>
  );
}
