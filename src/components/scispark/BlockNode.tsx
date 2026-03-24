"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SimulationBlock } from "@/lib/scispark/simulation-schema";

type Props = {
  block: SimulationBlock;
  /** When true, position is (0,0) inside a positioned parent (e.g. draggable wrapper). */
  embedded?: boolean;
  onPatchBlock?: (id: string, patch: Partial<SimulationBlock>) => void;
};

function pct(n: number): string {
  return `${n}%`;
}

function TextNoteEditor({
  block,
  onPatchBlock,
}: {
  block: SimulationBlock;
  onPatchBlock?: (id: string, patch: Partial<SimulationBlock>) => void;
}) {
  const props = block.props ?? {};
  const initial = (props.text as string) ?? "";
  const fontSize = (props.fontSize as number) ?? 14;
  const [text, setText] = useState(initial);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText((block.props?.text as string) ?? "");
  }, [block.id, block.props?.text]);

  const flush = useCallback(
    (value: string) => {
      if (!onPatchBlock) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onPatchBlock(block.id, {
          props: { ...block.props, text: value },
        });
      }, 350);
    },
    [block.id, block.props, onPatchBlock],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  return (
    <textarea
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        flush(v);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      spellCheck={false}
      className="box-border h-full w-full resize-none rounded-lg border-2 border-amber-300/90 bg-gradient-to-br from-amber-100 to-yellow-50 p-2 text-left font-sans leading-snug text-amber-950 shadow-md outline-none ring-amber-200/80 focus:border-amber-500 focus:ring-2"
      style={{ fontSize }}
      aria-label="Note text"
    />
  );
}

export function BlockNode({
  block,
  embedded = false,
  onPatchBlock,
}: Props) {
  const w = block.width ?? 64;
  const h = block.height ?? 64;
  const z = block.zIndex ?? 1;
  const props = block.props ?? {};
  const anim = block.animation ?? { type: "none" as const };

  const baseStyle: CSSProperties = {
    position: "absolute",
    left: embedded ? 0 : pct(block.x),
    top: embedded ? 0 : pct(block.y),
    width: w,
    height: h,
    zIndex: z,
    transform: embedded ? undefined : "translate(-50%, -50%)",
    pointerEvents: "auto",
  };

  const labelEl =
    block.label != null && block.label !== "" ? (
      <span className="absolute -bottom-6 left-1/2 z-10 max-w-[140px] -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-center text-[10px] font-bold text-slate-700 shadow-sm">
        {block.label}
      </span>
    ) : null;

  switch (block.type) {
    case "sun":
      return (
        <motion.div
          style={baseStyle}
          className="rounded-full bg-gradient-to-br from-amber-200 via-yellow-300 to-orange-400 shadow-[0_0_24px_rgba(251,191,36,0.85)] ring-2 ring-amber-100"
          animate={
            anim.type === "pulse"
              ? {
                  scale: [
                    anim.minScale ?? 1,
                    anim.maxScale ?? 1.08,
                    anim.minScale ?? 1,
                  ],
                }
              : {}
          }
          transition={{
            duration: anim.type === "pulse" ? anim.durationSec ?? 2 : 0,
            repeat: anim.type === "pulse" ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          {labelEl}
        </motion.div>
      );

    case "planet":
    case "moon": {
      const color =
        (props.color as string) ??
        (block.type === "moon" ? "#cbd5e1" : "#60a5fa");
      const inner = (
        <div
          className="h-full w-full rounded-full shadow-md ring-2 ring-white/50"
          style={{
            background: `radial-gradient(circle at 30% 30%, #fff6, ${color})`,
          }}
        />
      );
      if (anim.type === "orbit") {
        const r = anim.radiusPx ?? 80;
        const dur = anim.durationSec ?? 12;
        return (
          <div style={{ ...baseStyle, width: 0, height: 0, overflow: "visible" }}>
            <motion.div
              className="flex items-center justify-center"
              style={{ width: 0, height: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: dur, ease: "linear" }}
            >
              <div style={{ transform: `translateX(${r}px)` }}>
                <div style={{ width: w, height: h }} className="relative">
                  {inner}
                  {labelEl}
                </div>
              </div>
            </motion.div>
          </div>
        );
      }
      return (
        <div style={baseStyle} className="relative">
          {inner}
          {labelEl}
        </div>
      );
    }

    case "star":
      return (
        <div
          style={baseStyle}
          className="flex items-center justify-center text-3xl drop-shadow-md"
        >
          ✨
          {labelEl}
        </div>
      );

    case "orbit-path": {
      const c = (props.color as string) ?? "rgba(99,102,241,0.4)";
      const size = Math.max(w, h);
      return (
        <div
          style={{
            ...baseStyle,
            width: size,
            height: size,
            borderRadius: "50%",
            border: `3px dashed ${c}`,
            background: "transparent",
            boxShadow: `inset 0 0 20px ${c}`,
          }}
        >
          {labelEl}
        </div>
      );
    }

    case "velocity-arrow": {
      const angle = (props.angleDeg as number) ?? 0;
      return (
        <div
          style={{
            ...baseStyle,
            width: w,
            height: h,
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          }}
          className="flex items-center"
        >
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 shadow-md" />
          <div className="h-0 w-0 border-y-8 border-y-transparent border-l-[14px] border-l-indigo-600" />
          {labelEl}
        </div>
      );
    }

    case "gravity-indicator":
      return (
        <div
          style={baseStyle}
          className="flex flex-col items-center justify-start gap-1 text-4xl"
        >
          <span>⬇️</span>
          <span className="rounded-md bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            gravity
          </span>
          {labelEl}
        </div>
      );

    case "falling-object": {
      const color = (props.color as string) ?? "#34d399";
      const heightPx = anim.type === "fall" ? anim.heightPx ?? 160 : 120;
      const dur = anim.type === "fall" ? anim.durationSec ?? 2 : 2;
      return (
        <div style={{ ...baseStyle, height: heightPx + h }} className="relative">
          <motion.div
            className="absolute left-1/2 top-0"
            style={{ width: w, height: h, x: "-50%" }}
            animate={anim.type === "fall" ? { y: [0, heightPx] } : {}}
            transition={{
              repeat: anim.type === "fall" ? Infinity : 0,
              duration: dur,
              ease: "easeIn",
            }}
          >
            <div
              className="h-full w-full rounded-full shadow-lg ring-2 ring-white/70"
              style={{
                background: `radial-gradient(circle at 30% 25%, #fff8, ${color})`,
              }}
            />
          </motion.div>
          {labelEl}
        </div>
      );
    }

    case "mass-slider":
      return (
        <div
          style={baseStyle}
          className="rounded-2xl border-2 border-amber-200 bg-amber-50/95 p-2 shadow-inner"
        >
          <div className="text-[10px] font-bold text-amber-900">Mass</div>
          <input
            type="range"
            min={1}
            max={10}
            defaultValue={5}
            className="w-full accent-amber-600"
            aria-label="Mass"
          />
          {labelEl}
        </div>
      );

    case "circle-shape":
      return (
        <div
          style={{
            ...baseStyle,
            background: (props.color as string) ?? "#38bdf8",
            borderRadius: "50%",
            opacity: 0.9,
          }}
          className="shadow-md ring-2 ring-white"
        >
          {labelEl}
        </div>
      );

    case "triangle-shape":
      return (
        <div style={baseStyle} className="flex items-center justify-center">
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${w / 2}px solid transparent`,
              borderRight: `${w / 2}px solid transparent`,
              borderBottom: `${h}px solid ${(props.color as string) ?? "#a78bfa"}`,
              filter: "drop-shadow(0 4px 6px rgb(0 0 0 / 0.15))",
            }}
          />
          {labelEl}
        </div>
      );

    case "protractor":
      return (
        <div style={baseStyle} className="relative flex items-end justify-center">
          <svg width={w} height={h} viewBox="0 0 200 100" className="overflow-visible">
            <path
              d="M 10 100 A 90 90 0 0 1 190 100 Z"
              fill="rgba(255,255,255,0.85)"
              stroke="#6366f1"
              strokeWidth="4"
            />
            {Array.from({ length: 19 }).map((_, i) => {
              const deg = i * 10;
              const rad = ((deg - 90) * Math.PI) / 180;
              const x1 = 100 + 82 * Math.cos(rad);
              const y1 = 100 + 82 * Math.sin(rad);
              const x2 = 100 + 72 * Math.cos(rad);
              const y2 = 100 + 72 * Math.sin(rad);
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#6366f1"
                  strokeWidth={deg % 30 === 0 ? 2 : 1}
                />
              );
            })}
            <text x="96" y="58" fontSize="12" fill="#4338ca" fontWeight="bold">
              °
            </text>
          </svg>
          {labelEl}
        </div>
      );

    case "angle-arm": {
      const dur = anim.type === "rotate" ? anim.durationSec ?? 8 : 8;
      return (
        <div style={{ ...baseStyle, width: w * 2, height: h * 2 }}>
          <motion.div
            className="absolute left-1/2 top-1/2 h-2 w-1/2 origin-left rounded-full bg-gradient-to-r from-pink-500 to-orange-400 shadow-md"
            style={{ marginTop: -4 }}
            animate={anim.type === "rotate" ? { rotate: [0, 360] } : {}}
            transition={{
              repeat: anim.type === "rotate" ? Infinity : 0,
              duration: dur,
              ease: "linear",
            }}
          />
          <div className="absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4 rounded-full bg-indigo-600 ring-2 ring-white" />
          {labelEl}
        </div>
      );
    }

    case "counter":
      return (
        <div
          style={baseStyle}
          className="flex items-center justify-center rounded-2xl bg-violet-600 font-mono text-2xl font-black text-white shadow-lg ring-4 ring-violet-200"
        >
          {(props.value as number) ?? 42}
          {labelEl}
        </div>
      );

    case "number-line": {
      const min = (props.min as number) ?? 0;
      const max = (props.max as number) ?? 10;
      const span = max - min || 1;
      const pad = 8;
      const innerW = Math.max(1, w - 2 * pad);
      const cy = h / 2;
      const toX = (v: number) => pad + ((v - min) / span) * innerW;

      const rawHops = props.hops;
      const hops =
        Array.isArray(rawHops) && rawHops.length > 0
          ? rawHops.filter(
              (n): n is number =>
                typeof n === "number" && Number.isFinite(n) && n >= 0,
            )
          : [];

      if (hops.length === 0) {
        const mark = (props.mark as number) ?? 5;
        const t = (mark - min) / span;
        return (
          <div style={{ ...baseStyle, width: w, height: h }} className="relative">
            <div className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-300" />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500 ring-2 ring-white shadow"
              style={{ left: `${pad + t * innerW}px` }}
            />
            <span className="absolute -bottom-4 left-2 text-[9px] font-bold text-slate-500">
              {min}
            </span>
            <span className="absolute -bottom-4 right-2 text-[9px] font-bold text-slate-500">
              {max}
            </span>
            {labelEl}
          </div>
        );
      }

      const start = (props.start as number) ?? min;
      const positions: number[] = [start];
      for (const hop of hops) {
        positions.push(positions[positions.length - 1] + hop);
      }
      const endValue = positions[positions.length - 1];
      const hopColors = ["#0ea5e9", "#10b981", "#8b5cf6", "#f97316"];

      const intFrom = Math.ceil(min);
      const intTo = Math.floor(max);
      const tickInts: number[] = [];
      for (let n = intFrom; n <= intTo; n++) tickInts.push(n);

      return (
        <div
          style={{ ...baseStyle, width: w, height: h }}
          className="relative overflow-visible"
        >
          <div className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
          {tickInts.map((n) => (
            <div
              key={n}
              className="absolute top-1/2 w-px -translate-x-1/2 bg-slate-400"
              style={{
                left: `${toX(n)}px`,
                height: 10,
                marginTop: -5,
              }}
            />
          ))}
          {hops.map((_, i) => {
            const from = positions[i]!;
            const to = positions[i + 1]!;
            const x1 = toX(from);
            const x2 = toX(to);
            const left = Math.min(x1, x2);
            const width = Math.abs(x2 - x1);
            return (
              <div
                key={`seg-${i}`}
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full opacity-90"
                style={{
                  left,
                  width,
                  background: hopColors[i % hopColors.length],
                }}
              />
            );
          })}
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={w}
            height={h}
            aria-hidden
          >
            {hops.map((_, i) => {
              const x1 = toX(positions[i]!);
              const x2 = toX(positions[i + 1]!);
              const mid = (x1 + x2) / 2;
              const arcH = Math.min(22, h * 0.35);
              return (
                <path
                  key={`arc-${i}`}
                  d={`M ${x1} ${cy} Q ${mid} ${cy - arcH} ${x2} ${cy}`}
                  fill="none"
                  stroke={hopColors[i % hopColors.length]}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div
            className="absolute top-1/2 z-[1] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700 ring-2 ring-white shadow"
            style={{ left: `${toX(start)}px` }}
            title="Start"
          />
          <div
            className="absolute top-1/2 z-[2] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-emerald-600 bg-white shadow-md ring-2 ring-emerald-200"
            style={{ left: `${toX(endValue)}px` }}
            title={`Result: ${endValue}`}
          />
          <span className="absolute -bottom-4 left-2 text-[9px] font-bold text-slate-500">
            {min}
          </span>
          <span className="absolute -bottom-4 right-2 text-[9px] font-bold text-slate-500">
            {max}
          </span>
          {labelEl}
        </div>
      );
    }

    case "concept-frame": {
      const title = (props.title as string) ?? "";
      return (
        <div
          style={{
            ...baseStyle,
            width: w,
            height: h,
            borderRadius: 18,
            border: "3px dashed rgba(99,102,241,0.5)",
            background: "rgba(238,242,255,0.45)",
            boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.12)",
          }}
          className="relative box-border"
        >
          {title ? (
            <span className="absolute -top-2.5 left-3 z-[1] rounded-full bg-indigo-600 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
              {title}
            </span>
          ) : null}
        </div>
      );
    }

    case "wave-strip": {
      const dir = (props.direction as string) === "left" ? -1 : 1;
      const color = (props.color as string) ?? "#38bdf8";
      const amp = Math.min(h * 0.32, 18);
      const waves = 4;
      let d = "";
      const steps = 48;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = t * w;
        const y = h / 2 + Math.sin(t * waves * Math.PI * 2) * amp;
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
      return (
        <div
          style={{ ...baseStyle, width: w, height: h }}
          className="relative overflow-hidden rounded-lg bg-sky-50/30"
        >
          <motion.div
            className="absolute inset-0"
            animate={{ x: [0, dir * 14, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width={w} height={h} className="block" aria-hidden>
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.95}
              />
            </svg>
          </motion.div>
          {labelEl}
        </div>
      );
    }

    case "flow-ribbon": {
      const color = (props.color as string) ?? "#6366f1";
      const y0 = h * 0.55;
      const path = `M 4 ${y0} Q ${w * 0.5} ${h * 0.12} ${w - 4} ${y0}`;
      return (
        <div style={{ ...baseStyle, width: w, height: h }} className="relative">
          <svg width={w} height={h} className="overflow-visible" aria-hidden>
            <defs>
              <marker
                id={`arr-${block.id}`}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill={color} />
              </marker>
            </defs>
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={4}
              strokeLinecap="round"
              markerEnd={`url(#arr-${block.id})`}
              opacity={0.9}
            />
          </svg>
          {labelEl}
        </div>
      );
    }

    case "gradient-blob": {
      const tone = (props.tone as string) ?? "neutral";
      const regionLabel =
        (props.regionLabel as string) || (props.label as string) || "";
      const fills: Record<string, string> = {
        hot: "radial-gradient(ellipse at 40% 35%, rgba(251,191,36,0.95), rgba(249,115,22,0.55), rgba(254,215,170,0.35))",
        cold:
          "radial-gradient(ellipse at 40% 35%, rgba(125,211,252,0.9), rgba(59,130,246,0.5), rgba(224,231,255,0.35))",
        neutral:
          "radial-gradient(ellipse at 50% 40%, rgba(203,213,225,0.85), rgba(148,163,184,0.4), rgba(241,245,249,0.3))",
      };
      const bg = fills[tone] ?? fills.neutral;
      return (
        <div
          style={{
            ...baseStyle,
            width: w,
            height: h,
            borderRadius: "45%",
            background: bg,
            border: "2px solid rgba(255,255,255,0.5)",
            boxShadow: "inset 0 0 20px rgba(255,255,255,0.25)",
          }}
          className="relative flex items-center justify-center"
        >
          {regionLabel ? (
            <span className="px-2 text-center text-[11px] font-black uppercase tracking-wide text-slate-800 drop-shadow-sm">
              {regionLabel}
            </span>
          ) : null}
          {labelEl}
        </div>
      );
    }

    case "radiation-burst": {
      const count = Math.min(24, Math.max(4, (props.count as number) ?? 12));
      const color = (props.color as string) ?? "#fbbf24";
      const cx = w / 2;
      const cy = h / 2;
      const r0 = Math.min(w, h) * 0.12;
      const r1 = Math.min(w, h) * 0.48;
      const lines: ReactNode[] = [];
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const x1 = cx + Math.cos(ang) * r0;
        const y1 = cy + Math.sin(ang) * r0;
        const x2 = cx + Math.cos(ang) * r1;
        const y2 = cy + Math.sin(ang) * r1;
        lines.push(
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.85}
          />,
        );
      }
      return (
        <div style={{ ...baseStyle, width: w, height: h }} className="relative">
          <svg width={w} height={h} aria-hidden>
            {lines}
            <circle
              cx={cx}
              cy={cy}
              r={r0 * 0.9}
              fill="rgba(255,255,255,0.9)"
              stroke={color}
              strokeWidth={2}
            />
          </svg>
          {labelEl}
        </div>
      );
    }

    case "spring-link": {
      const color = (props.color as string) ?? "#64748b";
      const zig = 5;
      const mid = h / 2;
      let d = `M 2 ${mid}`;
      const seg = 8;
      for (let x = 2; x < w - 2; x += seg) {
        d += ` l ${seg / 2} ${-zig} l ${seg / 2} ${zig}`;
      }
      return (
        <div style={{ ...baseStyle, width: w, height: h }} className="relative">
          <svg width={w} height={h} aria-hidden>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {labelEl}
        </div>
      );
    }

    case "chain-steps": {
      const steps = Array.isArray(props.steps)
        ? (props.steps as string[])
        : ["1", "2", "3"];
      const n = Math.min(5, Math.max(2, steps.length));
      const slice = steps.slice(0, n);
      return (
        <div
          style={{ ...baseStyle, width: w, height: h }}
          className="flex items-center justify-center gap-1"
        >
          {slice.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="flex h-9 min-w-[2rem] items-center justify-center rounded-full border-2 border-indigo-400 bg-indigo-50 px-2 text-xs font-black text-indigo-900 shadow-sm">
                {s}
              </div>
              {i < slice.length - 1 ? (
                <span className="text-indigo-400" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          ))}
          {labelEl}
        </div>
      );
    }

    case "dot-swarm": {
      const density = Math.min(48, Math.max(8, (props.density as number) ?? 24));
      const color = (props.color as string) ?? "#94a3b8";
      const dots = Array.from({ length: density }, (_, i) => {
        const rx = ((i * 17) % 100) / 100;
        const ry = ((i * 31) % 100) / 100;
        return { x: 4 + rx * (w - 8), y: 4 + ry * (h - 8), d: i * 0.08 };
      });
      return (
        <div
          style={{ ...baseStyle, width: w, height: h }}
          className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/40"
        >
          <svg width={w} height={h} aria-hidden>
            {dots.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={2.2}
                fill={color}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: [0.35, 1, 0.35], cy: [p.y - 3, p.y + 3, p.y - 3] }}
                transition={{
                  duration: 2 + p.d,
                  repeat: Infinity,
                  delay: p.d,
                  ease: "easeInOut",
                }}
              />
            ))}
          </svg>
          {labelEl}
        </div>
      );
    }

    case "grid-lattice": {
      const cell = Math.max(8, (props.cellPx as number) ?? 14);
      const linesH: ReactNode[] = [];
      const linesV: ReactNode[] = [];
      for (let x = 0; x <= w; x += cell) {
        linesV.push(
          <line
            key={`v-${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={h}
            stroke="rgba(99,102,241,0.2)"
            strokeWidth={1}
          />,
        );
      }
      for (let y = 0; y <= h; y += cell) {
        linesH.push(
          <line
            key={`h-${y}`}
            x1={0}
            y1={y}
            x2={w}
            y2={y}
            stroke="rgba(99,102,241,0.2)"
            strokeWidth={1}
          />,
        );
      }
      return (
        <div
          style={{ ...baseStyle, width: w, height: h }}
          className="relative rounded-lg bg-indigo-50/40"
        >
          <svg width={w} height={h} aria-hidden>
            {linesH}
            {linesV}
          </svg>
          {labelEl}
        </div>
      );
    }

    case "flow-tube": {
      const color = (props.color as string) ?? "#cbd5e1";
      return (
        <div
          style={{
            ...baseStyle,
            width: w,
            height: h,
            borderRadius: 9999,
            background: `linear-gradient(180deg, ${color}, #94a3b8)`,
            border: "3px solid rgba(255,255,255,0.85)",
            boxShadow: "inset 0 2px 8px rgba(255,255,255,0.5), 0 4px 12px rgb(0 0 0 / 0.08)",
          }}
          className="relative"
        >
          {labelEl}
        </div>
      );
    }

    case "barrier-wall": {
      const vert = (props.orientation as string) !== "horizontal";
      return (
        <div
          style={{
            ...baseStyle,
            width: vert ? Math.max(12, w * 0.25) : w,
            height: vert ? h : Math.max(12, h * 0.25),
            borderRadius: 6,
            background:
              "linear-gradient(90deg, rgba(71,85,105,0.85), rgba(148,163,184,0.75))",
            boxShadow: "2px 2px 8px rgb(0 0 0 / 0.12)",
          }}
          className="relative border border-slate-600/30"
        >
          {labelEl}
        </div>
      );
    }

    case "fraction-pie": {
      const num = (props.numerator as number) ?? 1;
      const den = Math.max(1, (props.denominator as number) ?? 4);
      const slice = 360 / den;
      const filled = slice * num;
      const color = (props.color as string) ?? "#f472b6";
      return (
        <div
          style={{
            ...baseStyle,
            width: w,
            height: h,
            borderRadius: "50%",
            background: `conic-gradient(${color} 0deg ${filled}deg, #e2e8f0 ${filled}deg 360deg)`,
            boxShadow: "inset 0 0 0 4px white, 0 8px 20px rgb(0 0 0 / 0.12)",
          }}
          className="flex items-center justify-center"
        >
          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-black text-pink-600 shadow">
            {num}/{den}
          </span>
          {labelEl}
        </div>
      );
    }

    case "bar-graph": {
      const bars = (props.bars as number[]) ?? [3, 7, 5, 8];
      const maxB = Math.max(...bars, 1);
      return (
        <div
          style={{ ...baseStyle, width: w, height: h }}
          className="flex items-end justify-center gap-1 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-md"
        >
          {bars.map((v, i) => (
            <motion.div
              key={i}
              className="w-4 rounded-t-md bg-gradient-to-t from-indigo-600 to-sky-400"
              initial={{ height: 0 }}
              animate={{ height: `${(v / maxB) * (h - 16)}px` }}
              transition={{ type: "spring", delay: i * 0.05 }}
            />
          ))}
          {labelEl}
        </div>
      );
    }

    case "thermometer":
      return (
        <div style={baseStyle} className="flex flex-col items-center gap-1 text-3xl">
          🌡️
          <div className="h-16 w-3 rounded-full border-2 border-rose-300 bg-gradient-to-t from-sky-300 via-amber-200 to-rose-500" />
          {labelEl}
        </div>
      );

    case "magnet":
      return (
        <div
          style={baseStyle}
          className="flex rotate-12 items-center gap-0 text-4xl drop-shadow-lg"
        >
          <span>🧲</span>
          {labelEl}
        </div>
      );

    case "light-ray":
      return (
        <div style={baseStyle} className="flex items-center gap-1">
          <span className="text-2xl">💡</span>
          <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-transparent opacity-90 shadow-[0_0_12px_rgba(250,204,21,0.9)]" />
          {labelEl}
        </div>
      );

    case "droplet":
      return (
        <div style={baseStyle} className="text-4xl drop-shadow-md">
          💧
          {labelEl}
        </div>
      );

    case "clock-face":
      return (
        <div
          style={baseStyle}
          className="flex items-center justify-center rounded-full border-4 border-slate-700 bg-white text-3xl shadow-lg"
        >
          🕐
          {labelEl}
        </div>
      );

    case "speed-control":
      return (
        <div
          style={baseStyle}
          className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/95 p-2 shadow-inner"
        >
          <div className="text-[10px] font-bold text-indigo-900">Speed</div>
          <input
            type="range"
            min={1}
            max={100}
            defaultValue={50}
            className="w-full accent-indigo-600"
            aria-label="Speed"
          />
          {labelEl}
        </div>
      );

    case "text-note":
      return (
        <div style={baseStyle} className="relative">
          <TextNoteEditor block={block} onPatchBlock={onPatchBlock} />
          {labelEl}
        </div>
      );

    default:
      return (
        <div
          style={baseStyle}
          className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/80 text-[10px] font-bold text-slate-500"
        >
          {block.type}
          {labelEl}
        </div>
      );
  }
}
