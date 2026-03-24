import { z } from "zod";

export const blockAnimationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({
    type: z.literal("orbit"),
    radiusPx: z.number().optional(),
    durationSec: z.number().optional(),
  }),
  z.object({
    type: z.literal("rotate"),
    durationSec: z.number().optional(),
  }),
  z.object({
    type: z.literal("pulse"),
    minScale: z.number().optional(),
    maxScale: z.number().optional(),
    durationSec: z.number().optional(),
  }),
  z.object({
    type: z.literal("fall"),
    heightPx: z.number().optional(),
    durationSec: z.number().optional(),
  }),
]);

export const simulationBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().optional(),
  height: z.number().optional(),
  label: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  animation: blockAnimationSchema.optional(),
  zIndex: z.number().optional(),
  /** Blocks with the same id move together when any one is dragged (e.g. solar system scene). */
  groupId: z.string().optional(),
});

export const simulationSpecSchema = z.object({
  title: z.string(),
  explanationSteps: z.array(z.string()).min(1),
  blocks: z.array(simulationBlockSchema),
});

export type BlockAnimation = z.infer<typeof blockAnimationSchema>;
export type SimulationBlock = z.infer<typeof simulationBlockSchema>;
export type SimulationSpec = z.infer<typeof simulationSpecSchema>;
