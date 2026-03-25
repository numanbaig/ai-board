import { SciSparkShell } from "@/components/scispark/SciSparkShell";

export default function Home() {
  return (
    <main className="flex h-dvh max-h-dvh min-h-0 flex-col gap-1 overflow-hidden px-2 pb-2 pt-1 sm:px-3">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/60 pb-1">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="font-display text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            Understand
          </h1>
          <span className="hidden truncate text-[10px] font-medium text-slate-500 sm:inline sm:max-w-[min(280px,40vw)]">
            AI whiteboard — ask, watch it draw, step through the lesson
          </span>
        </div>
      </header>
      <SciSparkShell />
    </main>
  );
}
