import type { AiStroke, AiStrokeShape } from "./simulation-schema";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Deterministic 0–1 pseudo-random from id + index (stable across renders). */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitter(seed: number, i: number, amp: number): number {
  const rnd = mulberry32(seed + i * 9973)();
  return (rnd - 0.5) * 2 * amp;
}

const DEFAULT_JITTER = 0.007;
const LINE_JITTER = 0.004;

export function markerPointsFromShape(shape: AiStrokeShape, strokeId: string): {
  x: number;
  y: number;
}[] {
  const seed = hashId(strokeId);
  const amp = DEFAULT_JITTER;

  if (shape.type === "circle") {
    const n = 40;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const x =
        shape.cx +
        Math.cos(t) * shape.r +
        jitter(seed, i, amp);
      const y =
        shape.cy +
        Math.sin(t) * shape.r +
        jitter(seed, i + 400, amp);
      pts.push({ x: clamp01(x), y: clamp01(y) });
    }
    return pts;
  }

  if (shape.type === "ellipse") {
    const rot = ((shape.rotationDeg ?? 0) * Math.PI) / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const n = 44;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const ex = Math.cos(t) * shape.rx;
      const ey = Math.sin(t) * shape.ry;
      const x =
        shape.cx + ex * cos - ey * sin + jitter(seed, i, amp);
      const y =
        shape.cy + ex * sin + ey * cos + jitter(seed, i + 400, amp);
      pts.push({ x: clamp01(x), y: clamp01(y) });
    }
    return pts;
  }

  if (shape.type === "line" || shape.type === "arrow") {
    const { x1, y1, x2, y2 } = shape;
    const steps = 10;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x =
        x1 + (x2 - x1) * u + jitter(seed, i, LINE_JITTER);
      const y =
        y1 + (y2 - y1) * u + jitter(seed, i + 200, LINE_JITTER);
      pts.push({ x: clamp01(x), y: clamp01(y) });
    }

    if (shape.type === "arrow") {
      const ang = Math.atan2(y2 - y1, x2 - x1);
      const headLen = 0.022;
      const spread = 0.55;
      const p1 = {
        x: clamp01(x2 + Math.cos(ang + Math.PI - spread) * headLen),
        y: clamp01(y2 + Math.sin(ang + Math.PI - spread) * headLen),
      };
      const p2 = {
        x: clamp01(x2 + Math.cos(ang + Math.PI + spread) * headLen),
        y: clamp01(y2 + Math.sin(ang + Math.PI + spread) * headLen),
      };
      pts.push({ x: x2, y: y2 }, p1, { x: x2, y: y2 }, p2);
    }

    return pts;
  }

  return [];
}

/** Resolved polyline for rendering and hit-testing (marker-wobbly shapes or raw freehand). */
export function resolveStrokePoints(stroke: AiStroke): { x: number; y: number }[] {
  if (stroke.shape) {
    return markerPointsFromShape(stroke.shape, stroke.id);
  }
  const pts = stroke.points;
  if (pts && pts.length >= 2) return pts;
  return [];
}
