export type BoardTool = "select" | "pen" | "highlighter" | "eraser";

export type StrokePoint = { x: number; y: number };

export type Stroke = {
  id: string;
  tool: "pen" | "highlighter" | "eraser";
  color: string;
  lineWidth: number;
  points: StrokePoint[];
};

export const BOARD_COLORS = [
  { id: "ink", hex: "#1e1b4b", label: "Ink" },
  { id: "blue", hex: "#2563eb", label: "Blue" },
  { id: "red", hex: "#dc2626", label: "Red" },
  { id: "green", hex: "#16a34a", label: "Green" },
  { id: "amber", hex: "#d97706", label: "Orange" },
] as const;

export const BOARD_WIDTHS = [
  { id: "s", px: 2 },
  { id: "m", px: 4 },
  { id: "l", px: 8 },
] as const;

/** Default pen ink — same for user strokes and AI-generated strokes. */
export const DEFAULT_PEN_COLOR_HEX = BOARD_COLORS[0].hex;

/** Default pen thickness (Med) — matches BoardLayer initial line width. */
export const DEFAULT_PEN_WIDTH_PX = BOARD_WIDTHS[1].px;

const PEN_PX_MIN = BOARD_WIDTHS[0].px;
const PEN_PX_MAX = BOARD_WIDTHS[2].px;

/** Clamp to the same pixel range as the in-app pen tool. */
export function clampPenWidthPx(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PEN_WIDTH_PX;
  return Math.min(PEN_PX_MAX, Math.max(PEN_PX_MIN, Math.round(n)));
}

/** Snap arbitrary model output to Thin / Med / Thick (2, 4, or 8 px). */
export function snapPenWidthPx(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PEN_WIDTH_PX;
  const allowed = BOARD_WIDTHS.map((w) => w.px);
  const rounded = Math.round(n);
  return allowed.reduce((best, v) =>
    Math.abs(v - rounded) < Math.abs(best - rounded) ? v : best,
  allowed[1]);
}
