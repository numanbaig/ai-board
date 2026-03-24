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
