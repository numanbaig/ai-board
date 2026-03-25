import type { AiStroke, NotePanel, SimulationSpec } from "./simulation-schema";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function clampStroke(s: AiStroke): AiStroke {
  const points = s.points.map((p) => ({
    x: clamp01(p.x),
    y: clamp01(p.y),
  }));
  const stepIndex =
    s.stepIndex === undefined || Number.isNaN(s.stepIndex)
      ? 0
      : Math.max(0, Math.floor(s.stepIndex));
  return {
    ...s,
    points,
    stepIndex,
    lineWidth:
      s.lineWidth !== undefined && Number.isFinite(s.lineWidth)
        ? Math.min(48, Math.max(0.5, s.lineWidth))
        : 3,
    color: s.color?.trim() || "#1e293b",
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
