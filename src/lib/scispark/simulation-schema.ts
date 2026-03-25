import { z } from "zod";

/** Normalized 0–1 coordinates within the stage (left→right, top→bottom). */
export const strokePointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const aiStrokeSchema = z.object({
  id: z.string(),
  points: z.array(strokePointSchema).min(2),
  /** Visual width; interpreted in the renderer relative to stage size (~2–12 typical). */
  lineWidth: z.number().positive().max(48).optional(),
  color: z.string().optional(),
  /** 0-based; stroke appears when explanation step >= this index. */
  stepIndex: z.number().int().min(0).optional(),
});

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
