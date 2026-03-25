/**
 * Maps common model mistakes to values accepted by simulationSpecSchema
 * before Zod parse. Strips legacy "blocks" from older prompts.
 */

const VALID_BACKDROP = new Set(["plain", "sky-ground", "space-dark"]);

const BACKDROP_ALIASES: Record<string, { type: string; horizon?: number }> = {
  "sky-ground-night": { type: "sky-ground", horizon: 0.55 },
  underwater: { type: "sky-ground", horizon: 0.78 },
  "body-interior": { type: "plain" },
  "circuit-board": { type: "plain" },
  "terrain-cross-section": { type: "sky-ground", horizon: 0.68 },
};

function coerceBackdrop(b: unknown): unknown {
  if (b === undefined || b === null) return { type: "plain" };
  if (typeof b !== "object" || Array.isArray(b)) return { type: "plain" };
  const o = b as Record<string, unknown>;
  const t = o.type;
  if (typeof t !== "string") return { type: "plain" };

  if (VALID_BACKDROP.has(t)) {
    return b;
  }

  const alias = BACKDROP_ALIASES[t];
  if (alias) {
    return {
      ...o,
      type: alias.type,
      ...(alias.horizon !== undefined && o.horizon === undefined
        ? { horizon: alias.horizon }
        : {}),
    };
  }

  return { type: "plain" };
}

function coerceStrokePoint(p: unknown): { x: number; y: number } | null {
  if (!p || typeof p !== "object" || Array.isArray(p)) return null;
  const o = p as Record<string, unknown>;
  const x = typeof o.x === "number" ? o.x : Number(o.x);
  const y = typeof o.y === "number" ? o.y : Number(o.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function coerceAiStrokes(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  const out: unknown[] = [];
  for (const s of raw) {
    if (!s || typeof s !== "object" || Array.isArray(s)) continue;
    const o = { ...(s as Record<string, unknown>) };
    const pts = Array.isArray(o.points) ? o.points : [];
    const points = pts.map(coerceStrokePoint).filter(Boolean) as { x: number; y: number }[];
    if (points.length < 2) continue;
    o.points = points;
    if (typeof o.id !== "string" || !o.id) {
      o.id = `stroke-${out.length}-${Date.now()}`;
    }
    out.push(o);
  }
  return out;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function coerceNotePanels(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  const out: unknown[] = [];
  for (const n of raw) {
    if (!n || typeof n !== "object" || Array.isArray(n)) continue;
    const o = { ...(n as Record<string, unknown>) };
    if (typeof o.id !== "string" || !o.id) {
      o.id = `note-${out.length}-${Date.now()}`;
    }

    const xi = typeof o.x === "number" ? o.x : Number(o.x);
    const yi = typeof o.y === "number" ? o.y : Number(o.y);
    if (Number.isFinite(xi)) o.x = clamp(xi, 0, 100);
    if (Number.isFinite(yi)) o.y = clamp(yi, 0, 100);

    const si = typeof o.stepIndex === "number" ? o.stepIndex : Number(o.stepIndex);
    if (Number.isFinite(si)) {
      o.stepIndex = Math.max(0, Math.floor(si));
    }

    const mw = o.maxWidthPct;
    if (mw !== undefined && mw !== null) {
      const v = typeof mw === "number" ? mw : Number(mw);
      if (Number.isFinite(v)) {
        o.maxWidthPct = clamp(v, 20, 95);
      } else {
        delete o.maxWidthPct;
      }
    }

    const wd = o.width;
    if (wd !== undefined && wd !== null) {
      const v = typeof wd === "number" ? wd : Number(wd);
      if (Number.isFinite(v)) {
        o.width = clamp(v, 10, 100);
      } else {
        delete o.width;
      }
    }

    out.push(o);
  }
  return out;
}

export function coerceRawSimulationJson(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const spec = { ...(raw as Record<string, unknown>) };

  delete spec.blocks;

  if ("backdrop" in spec) {
    spec.backdrop = coerceBackdrop(spec.backdrop);
  }

  spec.aiStrokes = coerceAiStrokes(spec.aiStrokes);
  spec.notePanels = coerceNotePanels(spec.notePanels ?? spec.notes);

  if (!Array.isArray(spec.explanationSteps) || spec.explanationSteps.length === 0) {
    spec.explanationSteps = ["The teacher is drawing this idea step by step."];
  }

  if (typeof spec.title !== "string" || !spec.title.trim()) {
    spec.title = "Lesson";
  }

  return spec;
}
