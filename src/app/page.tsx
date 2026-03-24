import { SciSparkShell } from "@/components/scispark/SciSparkShell";

export default function Home() {
  return (
    <main className="flex h-dvh max-h-dvh min-h-0 flex-col gap-1 overflow-hidden px-2 pb-2 pt-1 sm:px-3">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-violet-200/40 pb-1">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="font-display bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-base font-black tracking-tight text-transparent sm:text-lg">
            SciSpark
          </h1>
          <span className="hidden truncate text-[10px] font-semibold text-slate-500 sm:inline sm:max-w-[min(280px,40vw)]">
            Visual science &amp; math board
          </span>
        </div>
      </header>
      <SciSparkShell />
    </main>
  );
}
