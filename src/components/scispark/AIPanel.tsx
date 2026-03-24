"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatLine = { role: "user" | "assistant"; text: string };

type Props = {
  messages: ChatLine[];
  onSend: (text: string) => void;
  loading: boolean;
  activeStep: number;
  totalSteps: number;
  onStepChange: (n: number) => void;
  lastMeta: { usedDemo: boolean; provider: string | null } | null;
};

export function AIPanel({
  messages,
  onSend,
  loading,
  activeStep,
  totalSteps,
  onStepChange,
  lastMeta,
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
    onSend(t);
  }

  return (
    <aside className="flex max-h-[min(340px,36dvh)] min-h-0 w-full shrink-0 flex-col rounded-2xl border-2 border-white/70 bg-gradient-to-b from-white/90 to-violet-50/90 p-2 shadow-lg backdrop-blur-md lg:max-h-full lg:w-[280px] lg:rounded-3xl lg:border-[3px] lg:p-2.5 xl:w-[300px]">
      <header className="shrink-0 border-b border-violet-100 pb-1.5">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-fuchsia-600">
          Teacher
        </p>
        <h2 className="text-sm font-black text-slate-900">Ask &amp; explore</h2>
        {lastMeta && (
          <p className="mt-1 text-[10px] font-medium text-slate-500">
            {lastMeta.usedDemo
              ? "Demo mode (add API keys for live AI)."
              : `Powered by ${lastMeta.provider ?? "AI"}.`}
          </p>
        )}
      </header>

      {totalSteps > 0 && (
        <div className="mt-1.5 shrink-0 rounded-xl border border-violet-100 bg-white/80 p-1.5 shadow-inner">
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
            Story step
          </p>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={Math.min(activeStep, totalSteps - 1)}
              onChange={(e) => onStepChange(Number(e.target.value))}
              className="flex-1 accent-violet-600"
              aria-label="Explanation step"
            />
            <span className="w-10 text-center text-xs font-black text-violet-900">
              {activeStep + 1}/{totalSteps}
            </span>
          </div>
        </div>
      )}

      <div className="mt-1.5 min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain rounded-xl border border-slate-100 bg-slate-50/80 p-1.5 lg:max-h-none">
        {messages.length === 0 && (
          <p className="p-1.5 text-xs font-medium text-slate-600">
            Try: &quot;How does Earth go around the Sun?&quot; or &quot;Show me
            fractions with a pie.&quot;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[95%] rounded-xl px-2.5 py-1.5 text-xs leading-snug shadow-sm sm:text-sm ${
              m.role === "user"
                ? "ml-auto bg-gradient-to-br from-sky-500 to-indigo-600 font-semibold text-white"
                : "mr-auto border border-violet-100 bg-white font-medium text-slate-800"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="mr-auto rounded-2xl border border-dashed border-violet-200 bg-white px-3 py-2 text-sm font-medium text-violet-700">
            Building your scene…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-1.5 flex h-10 shrink-0 gap-1.5 border-t border-violet-100/90 pt-1.5 sm:h-11"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you wonder?"
          className="min-w-0 flex-1 rounded-xl border-2 border-violet-100 bg-white px-2.5 text-xs font-medium text-slate-900 shadow-inner outline-none ring-violet-400 placeholder:text-slate-400 focus:border-violet-300 focus:ring-2 sm:text-sm"
          disabled={loading}
          maxLength={2000}
          aria-label="Your question"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-full shrink-0 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-400 px-3 text-xs font-black text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
        >
          Go
        </button>
      </form>
    </aside>
  );
}
