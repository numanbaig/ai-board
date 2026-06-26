"use client";

import { motion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_PEN_COLOR_HEX,
  DEFAULT_PEN_WIDTH_PX,
} from "./board-types";
import { resolveStrokePoints } from "@/lib/scispark/marker-shape-points";
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
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidthPx, setSvgWidthPx] = useState(400);

  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setSvgWidthPx(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const strokeWidthUnits = (penPx: number) =>
    (penPx * VB) / Math.max(svgWidthPx, 1);

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
      const pts = resolveStrokePoints(s);
      const d = distToPolyline01(px, py, pts);
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
        ref={svgRef}
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
          const resolved = resolveStrokePoints(s);
          const d = toPathD(resolved);
          const len = pathLen01(resolved);
          const dur = Math.min(2.4, 0.35 + len * 0.018);
          const penPx = s.lineWidth ?? DEFAULT_PEN_WIDTH_PX;
          const sw = strokeWidthUnits(penPx);
          const unlocked = (s.stepIndex ?? 0) <= activeStep;
          return (
            <motion.path
              key={s.id}
              d={d}
              fill="none"
              stroke={s.color ?? DEFAULT_PEN_COLOR_HEX}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeLinejoin="round"
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
