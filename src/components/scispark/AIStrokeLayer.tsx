"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { AiStroke, NotePanel } from "@/lib/scispark/simulation-schema";

const VB = 100;

function toPathD(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const [p0, ...rest] = points;
  let d = `M ${p0.x * VB} ${p0.y * VB}`;
  for (const p of rest) {
    d += ` L ${p.x * VB} ${p.y * VB}`;
  }
  return d;
}

function pathLen01(points: { x: number; y: number }[]): number {
  let L = 0;
  for (let i = 1; i < points.length; i++) {
    L += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
  }
  return L * VB;
}

function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const ab2 = abx * abx + aby * aby;
  if (ab2 < 1e-12) return Math.hypot(px - ax, py - ay);
  let t = (apx * abx + apy * aby) / ab2;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * abx;
  const qy = ay + t * aby;
  return Math.hypot(px - qx, py - qy);
}

function distToPolyline01(
  px: number,
  py: number,
  points: { x: number; y: number }[],
): number {
  let m = Infinity;
  for (let i = 1; i < points.length; i++) {
    const d = distToSegment(
      px,
      py,
      points[i - 1].x,
      points[i - 1].y,
      points[i].x,
      points[i].y,
    );
    m = Math.min(m, d);
  }
  return m;
}

type Props = {
  strokes: AiStroke[];
  notePanels: NotePanel[];
  activeStep: number;
  selectedStrokeId: string | null;
  onSelectStroke: (id: string | null) => void;
  drawingLocksBoard: boolean;
};

export function AIStrokeLayer({
  strokes,
  notePanels,
  activeStep,
  selectedStrokeId,
  onSelectStroke,
  drawingLocksBoard,
}: Props) {
  const visibleNotes = useMemo(
    () =>
      (notePanels ?? []).filter((n) => n.stepIndex <= activeStep),
    [notePanels, activeStep],
  );

  const visibleStrokes = useMemo(
    () => strokes.filter((s) => (s.stepIndex ?? 0) <= activeStep),
    [strokes, activeStep],
  );

  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drawingLocksBoard) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const hitPx = 14 / Math.min(rect.width, rect.height);
    let best: { id: string; d: number } | null = null;
    for (const s of visibleStrokes) {
      const d = distToPolyline01(px, py, s.points);
      if (d < hitPx && (!best || d < best.d)) {
        best = { id: s.id, d };
      }
    }
    if (best) {
      onSelectStroke(best.id);
    } else {
      onSelectStroke(null);
    }
  };

  return (
    <>
      <svg
        className="absolute inset-0 z-[5] h-full w-full"
        viewBox={`0 0 ${VB} ${VB}`}
        preserveAspectRatio="none"
        onPointerDown={handleSvgPointerDown}
        style={{
          pointerEvents: drawingLocksBoard ? "none" : "auto",
          touchAction: drawingLocksBoard ? "none" : "manipulation",
        }}
        aria-hidden
      >
        {visibleStrokes.map((s) => {
          const d = toPathD(s.points);
          const len = pathLen01(s.points);
          const dur = Math.min(2.4, 0.35 + len * 0.018);
          const sw = Math.max(
            0.25,
            ((s.lineWidth ?? 3) / 600) * VB * 1.2,
          );
          const unlocked = (s.stepIndex ?? 0) <= activeStep;
          return (
            <motion.path
              key={s.id}
              d={d}
              fill="none"
              stroke={s.color ?? "#1e293b"}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={{
                pathLength: unlocked ? 1 : 0,
                opacity: unlocked ? 1 : 0,
              }}
              transition={{ duration: dur, ease: "easeOut" }}
              style={{
                filter:
                  selectedStrokeId === s.id
                    ? "drop-shadow(0 0 3px rgba(245,158,11,0.95))"
                    : undefined,
              }}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 z-[6]">
        {visibleNotes.map((n) => (
          <div
            key={n.id}
            className="board-note absolute max-h-[40%] overflow-y-auto rounded-lg border border-slate-200/90 bg-white/92 px-2.5 py-1.5 text-left shadow-md backdrop-blur-sm"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              transform: "translate(-50%, -50%)",
              maxWidth: n.maxWidthPct != null ? `${n.maxWidthPct}%` : "38%",
              width: n.width != null ? `${n.width}%` : undefined,
            }}
          >
            <p className="font-board-note text-sm font-medium leading-snug text-slate-800">
              {n.text}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
