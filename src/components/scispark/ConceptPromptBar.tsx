"use client";

import { FormEvent, useState } from "react";

type Props = {
  onSend: (text: string) => void;
  loading: boolean;
};

export function ConceptPromptBar({ onSend, loading }: Props) {
  const [input, setInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || loading) return;
    setInput("");
    onSend(t);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full shrink-0 gap-2 rounded-2xl border-2 border-white/80 bg-gradient-to-r from-indigo-50/95 via-white/95 to-fuchsia-50/95 p-2 shadow-md backdrop-blur-sm sm:rounded-3xl sm:border-[3px] sm:p-2.5"
    >
      <label className="sr-only" htmlFor="concept-prompt-input">
        Type any concept or question
      </label>
      <input
        id="concept-prompt-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type any concept…"
        className="min-w-0 flex-1 rounded-xl border-2 border-violet-100 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-inner outline-none ring-violet-400 placeholder:text-slate-400 focus:border-violet-300 focus:ring-2"
        disabled={loading}
        maxLength={2000}
        aria-label="Type any concept or question"
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="shrink-0 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-400 px-5 py-2 text-sm font-black text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ask
      </button>
    </form>
  );
}
