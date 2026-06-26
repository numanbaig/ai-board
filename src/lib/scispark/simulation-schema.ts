import { z } from "zod";

/** Normalized 0–1 coordinates within the stage (left→right, top→bottom). */
export const strokePointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/** Optional geometric hint; client draws with marker-style jitter like a hand trace. */
export const aiStrokeShapeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("circle"),
    cx: z.number(),
    cy: z.number(),
    r: z.number(),
  }),
  z.object({
    type: z.literal("ellipse"),
    cx: z.number(),
    cy: z.number(),
    rx: z.number(),
    ry: z.number(),
    rotationDeg: z.number().optional(),
  }),
  z.object({
    type: z.literal("line"),
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
  }),
  z.object({
    type: z.literal("arrow"),
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
  }),
]);

export type AiStrokeShape = z.infer<typeof aiStrokeShapeSchema>;

export const aiStrokeSchema = z
  .object({
    id: z.string(),
    /** Freehand polyline when not using `shape`. */
    points: z.array(strokePointSchema).optional(),
    /** Basic shape drawn with marker-like wobble; or omit and use `points` only for freehand. */
    shape: aiStrokeShapeSchema.optional(),
    /** Same units as the in-app pen: CSS px — use 2, 4, or 8 (thin / med / thick). */
    lineWidth: z.number().positive().max(16).optional(),
    color: z.string().optional(),
    /** 0-based; stroke appears when explanation step >= this index. */
    stepIndex: z.number().int().min(0).optional(),
  })
  .refine(
    (s) =>
      s.shape != null ||
      (Array.isArray(s.points) && s.points.length >= 2),
    { message: "Each aiStroke needs `shape` or at least 2 `points`." },
  );

export const notePanelSchema = z.object({
  id: z.string(),
  stepIndex: z.number().int().min(0),
  text: z.string().min(1),
  /** Percent of stage width (0–100), matches legacy board positioning. */
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(10).max(100).optional(),
  /** Clamped in spec-coerce; wide range so Zod still accepts edge cases after coercion. */
  maxWidthPct: z.number().min(8).max(95).optional(),
});

export const sceneBackdropSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("plain") }),
  z.object({
    type: z.literal("sky-ground"),
    horizon: z.number().min(0.4).max(0.85).optional(),
  }),
  z.object({ type: z.literal("space-dark") }),
]);

export const simulationSpecSchema = z.object({
  title: z.string(),
  explanationSteps: z.array(z.string()).min(1),
  aiStrokes: z.array(aiStrokeSchema),
  notePanels: z.array(notePanelSchema).optional(),
  backdrop: sceneBackdropSchema.optional(),
});

export type StrokePoint = z.infer<typeof strokePointSchema>;
export type AiStroke = z.infer<typeof aiStrokeSchema>;
export type NotePanel = z.infer<typeof notePanelSchema>;
export type SceneBackdrop = z.infer<typeof sceneBackdropSchema>;
export type SimulationSpec = z.infer<typeof simulationSpecSchema>;
