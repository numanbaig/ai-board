import {
  DEFAULT_PEN_COLOR_HEX,
  DEFAULT_PEN_WIDTH_PX,
  snapPenWidthPx,
} from "@/components/scispark/board-types";
import type {
  AiStroke,
  AiStrokeShape,
  NotePanel,
  SimulationSpec,
} from "./simulation-schema";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function clampShape(sh: AiStrokeShape): AiStrokeShape {
  switch (sh.type) {
    case "circle":
      return {
        type: "circle",
        cx: clamp01(sh.cx),
        cy: clamp01(sh.cy),
        r: Math.min(1.5, Math.max(0.002, sh.r)),
      };
    case "ellipse":
      return {
        type: "ellipse",
        cx: clamp01(sh.cx),
        cy: clamp01(sh.cy),
        rx: Math.min(1, Math.max(0.002, sh.rx)),
        ry: Math.min(1, Math.max(0.002, sh.ry)),
        rotationDeg: sh.rotationDeg,
      };
    case "line":
    case "arrow":
      return {
        type: sh.type,
        x1: clamp01(sh.x1),
        y1: clamp01(sh.y1),
        x2: clamp01(sh.x2),
        y2: clamp01(sh.y2),
      };
    default: {
      const _exhaustive: never = sh;
      return _exhaustive;
    }
  }
}

function clampStroke(s: AiStroke): AiStroke {
  const points =
    s.points?.map((p) => ({
      x: clamp01(p.x),
      y: clamp01(p.y),
    })) ?? undefined;
  const shape = s.shape ? clampShape(s.shape) : undefined;
  const stepIndex =
    s.stepIndex === undefined || Number.isNaN(s.stepIndex)
      ? 0
      : Math.max(0, Math.floor(s.stepIndex));
  return {
    ...s,
    shape,
    points,
    stepIndex,
    lineWidth:
      s.lineWidth !== undefined && Number.isFinite(s.lineWidth)
        ? snapPenWidthPx(s.lineWidth)
        : DEFAULT_PEN_WIDTH_PX,
    color: s.color?.trim() || DEFAULT_PEN_COLOR_HEX,
  };
}

function clampNote(n: NotePanel): NotePanel {
  return {
    ...n,
    x: Math.min(100, Math.max(0, n.x)),
    y: Math.min(100, Math.max(0, n.y)),
    stepIndex: Math.max(0, Math.floor(n.stepIndex)),
    text: n.text.trim(),
    width: n.width !== undefined ? Math.min(100, Math.max(10, n.width)) : undefined,
    maxWidthPct:
      n.maxWidthPct !== undefined
        ? Math.min(95, Math.max(20, n.maxWidthPct))
        : undefined,
  };
}

/** Dedupe stroke ids (keep first). */
function dedupeStrokes(strokes: AiStroke[]): AiStroke[] {
  const seen = new Set<string>();
  const out: AiStroke[] = [];
  for (const s of strokes) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
  }
  return out;
}

function dedupeNotes(notes: NotePanel[]): NotePanel[] {
  const seen = new Set<string>();
  const out: NotePanel[] = [];
  for (const n of notes) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    out.push(n);
  }
  return out;
}

export function normalizeSimulationSpec(spec: SimulationSpec): SimulationSpec {
  const aiStrokes = dedupeStrokes(
    (spec.aiStrokes ?? []).map((s) => clampStroke({ ...s })),
  );
  const notePanels = dedupeNotes(
    (spec.notePanels ?? []).map((n) => clampNote({ ...n })),
  );
  return {
    ...spec,
    aiStrokes,
    notePanels,
  };
}
