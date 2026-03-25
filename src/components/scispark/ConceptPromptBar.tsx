"use client";

import { FormEvent, useState } from "react";
import type { PromptSendOptions } from "./prompt-options";

type Props = {
  onSend: (text: string, options?: PromptSendOptions) => void;
  loading: boolean;
  hasBoard: boolean;
};

export function ConceptPromptBar({ onSend, loading, hasBoard }: Props) {
  const [input, setInput] = useState("");
  const [addToBoard, setAddToBoard] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || loading) return;
    setInput("");
    onSend(t, { addToBoard: hasBoard && addToBoard });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full shrink-0 flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-sm sm:rounded-3xl sm:p-2.5"
    >
      <div className="flex w-full flex-wrap items-center gap-3 sm:gap-4">
        <label className="sr-only" htmlFor="concept-prompt-input">
          Type any concept or question
        </label>
        <input
          id="concept-prompt-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything — e.g. How does photosynthesis work?"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-inner outline-none ring-slate-400 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2"
          disabled={loading}
          maxLength={2000}
          aria-label="Type any concept or question"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask
        </button>
      </div>
      {hasBoard && (
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={addToBoard}
            onChange={(e) => setAddToBoard(e.target.checked)}
            className="size-4 rounded border-slate-300 accent-slate-900"
            disabled={loading}
          />
          Add to current board (extend drawing instead of replacing)
        </label>
      )}
    </form>
  );
}
