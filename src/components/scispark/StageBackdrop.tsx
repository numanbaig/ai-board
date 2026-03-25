"use client";

import type { SceneBackdrop } from "@/lib/scispark/simulation-schema";

type Props = {
  backdrop: SceneBackdrop;
};

export function StageBackdrop({ backdrop }: Props) {
  if (backdrop.type === "plain") {
    return null;
  }

  if (backdrop.type === "space-dark") {
    return (
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 50% 20%, #1e1b4b 0%, #0f172a 45%, #020617 100%)",
          }}
        />
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: i % 4 === 0 ? 2 : 1,
              height: i % 4 === 0 ? 2 : 1,
              opacity: 0.35 + (i % 5) * 0.1,
              left: `${((i * 37) % 100)}%`,
              top: `${((i * 53) % 85)}%`,
            }}
          />
        ))}
      </div>
    );
  }

  const horizon = backdrop.horizon ?? 0.62;
  const horizonPct = `${horizon * 100}%`;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: horizonPct,
          background:
            "linear-gradient(180deg, #bae6fd 0%, #e0f2fe 35%, #f0f9ff 100%)",
        }}
      />
      <div
        className="absolute h-6 w-16 rounded-full bg-white/70 blur-[1px]"
        style={{ left: "8%", top: "12%" }}
      />
      <div
        className="absolute h-5 w-20 rounded-full bg-white/60 blur-[1px]"
        style={{ right: "12%", top: "18%" }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: horizonPct,
          background:
            "linear-gradient(90deg, #b45309 0%, #d97706 22%, #4ade80 55%, #16a34a 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: `calc(${horizonPct} - 8px)`,
          height: 16,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.15), transparent)",
        }}
      />
    </div>
  );
}
