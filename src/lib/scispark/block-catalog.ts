export type BlockCategoryId =
  | "space"
  | "forces"
  | "geometry"
  | "numbers"
  | "layout"
  | "flow"
  | "notes"
  | "nature"
  | "time";

export type PaletteBlock = {
  type: string;
  label: string;
  emoji: string;
  hint: string;
  defaultProps?: Record<string, unknown>;
  defaultAnimation?: {
    type: "none" | "orbit" | "rotate" | "pulse" | "fall";
    radiusPx?: number;
    durationSec?: number;
  };
};

export type BlockCategory = {
  id: BlockCategoryId;
  title: string;
  color: string;
  blocks: PaletteBlock[];
};

export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    id: "space",
    title: "Space & Motion",
    color: "from-indigo-500 to-violet-600",
    blocks: [
      { type: "sun", label: "Sun", emoji: "☀️", hint: "Big star at the center" },
      { type: "planet", label: "Planet", emoji: "🪐", hint: "A world in space" },
      { type: "moon", label: "Moon", emoji: "🌙", hint: "Orbits planets" },
      { type: "star", label: "Star", emoji: "✨", hint: "Twinkly distant sun" },
      {
        type: "orbit-path",
        label: "Orbit",
        emoji: "⭕",
        hint: "Path around a center",
      },
      {
        type: "velocity-arrow",
        label: "Motion arrow",
        emoji: "➡️",
        hint: "Shows direction and speed",
      },
    ],
  },
  {
    id: "forces",
    title: "Forces",
    color: "from-rose-500 to-orange-500",
    blocks: [
      {
        type: "gravity-indicator",
        label: "Gravity pull",
        emoji: "⬇️",
        hint: "Things fall down",
      },
      {
        type: "falling-object",
        label: "Falling ball",
        emoji: "🎾",
        hint: "Drop with gravity",
        defaultAnimation: { type: "fall", durationSec: 2 },
      },
      {
        type: "mass-slider",
        label: "Mass slider",
        emoji: "⚖️",
        hint: "Heavy vs light",
      },
    ],
  },
  {
    id: "geometry",
    title: "Shapes & Geometry",
    color: "from-emerald-500 to-teal-500",
    blocks: [
      { type: "circle-shape", label: "Circle", emoji: "🔵", hint: "Round shape" },
      {
        type: "triangle-shape",
        label: "Triangle",
        emoji: "🔺",
        hint: "Three corners",
      },
      {
        type: "protractor",
        label: "Protractor",
        emoji: "📐",
        hint: "Measure angles",
        defaultAnimation: { type: "rotate", durationSec: 8 },
      },
      {
        type: "angle-arm",
        label: "Angle arm",
        emoji: "📏",
        hint: "Rotating angle demo",
        defaultAnimation: { type: "rotate", durationSec: 6 },
      },
    ],
  },
  {
    id: "numbers",
    title: "Numbers & Math",
    color: "from-sky-500 to-blue-600",
    blocks: [
      { type: "counter", label: "Counter", emoji: "🔢", hint: "Count up or down" },
      {
        type: "number-line",
        label: "Number line",
        emoji: "〰️",
        hint:
          "Numbers in order; for addition use props start, hops e.g. [2,2], min, max",
      },
      {
        type: "fraction-pie",
        label: "Fraction pie",
        emoji: "🥧",
        hint: "Parts of a whole",
      },
      {
        type: "bar-graph",
        label: "Bar graph",
        emoji: "📊",
        hint: "Compare amounts",
      },
    ],
  },
  {
    id: "layout",
    title: "Layout",
    color: "from-slate-500 to-slate-600",
    blocks: [
      {
        type: "concept-frame",
        label: "Lesson frame",
        emoji: "▢",
        hint:
          "Dashed focus area behind a lesson; use zIndex 0 and same groupId as other blocks",
        defaultProps: { title: "Lesson" },
      },
    ],
  },
  {
    id: "flow",
    title: "Flow & fields",
    color: "from-cyan-500 to-indigo-600",
    blocks: [
      {
        type: "wave-strip",
        label: "Waves",
        emoji: "〰️",
        hint: "Wind, water, sound; props direction left|right, color",
        defaultProps: { direction: "right", color: "#38bdf8" },
      },
      {
        type: "flow-ribbon",
        label: "Flow ribbon",
        emoji: "🌀",
        hint: "Curved path for air, rivers, current; props color",
        defaultProps: { color: "#6366f1" },
      },
      {
        type: "gradient-blob",
        label: "Warm/cool zone",
        emoji: "🌡️",
        hint: "Hot/cold/pressure region; props tone hot|cold|neutral, regionLabel",
        defaultProps: { tone: "hot", regionLabel: "" },
      },
      {
        type: "radiation-burst",
        label: "Radiation",
        emoji: "☀️",
        hint: "Rays from center; heat, light; props count, color",
        defaultProps: { count: 12, color: "#fbbf24" },
      },
      {
        type: "spring-link",
        label: "Spring",
        emoji: "〽️",
        hint: "Zigzag tension link between ideas",
        defaultProps: { color: "#64748b" },
      },
      {
        type: "chain-steps",
        label: "Step chain",
        emoji: "🔗",
        hint: "Numbered sequence; props steps array of short labels",
        defaultProps: { steps: ["1", "2", "3"] },
      },
      {
        type: "dot-swarm",
        label: "Dot swarm",
        emoji: "✦",
        hint: "Many particles; gas, crowd; props density 8-40, color",
        defaultProps: { density: 24, color: "#94a3b8" },
      },
      {
        type: "grid-lattice",
        label: "Grid lattice",
        emoji: "▦",
        hint: "Structure, crystal; props cellPx optional",
        defaultProps: { cellPx: 14 },
      },
      {
        type: "flow-tube",
        label: "Flow tube",
        emoji: "⬭",
        hint: "Pipe, vessel; props color",
        defaultProps: { color: "#cbd5e1" },
      },
      {
        type: "barrier-wall",
        label: "Barrier",
        emoji: "▮",
        hint: "Wall or membrane; props orientation vertical|horizontal",
        defaultProps: { orientation: "vertical" },
      },
    ],
  },
  {
    id: "notes",
    title: "Notes",
    color: "from-amber-400 to-yellow-500",
    blocks: [
      {
        type: "text-note",
        label: "Sticky note",
        emoji: "📝",
        hint: "Write ideas on the board",
        defaultProps: { text: "Tap to write…", fontSize: 14 },
      },
    ],
  },
  {
    id: "nature",
    title: "Nature & Science",
    color: "from-lime-500 to-green-600",
    blocks: [
      {
        type: "thermometer",
        label: "Thermometer",
        emoji: "🌡️",
        hint: "Hot and cold",
      },
      { type: "magnet", label: "Magnet", emoji: "🧲", hint: "Push and pull" },
      { type: "light-ray", label: "Light ray", emoji: "💡", hint: "Light travels" },
      { type: "droplet", label: "Water drop", emoji: "💧", hint: "Liquid bits" },
    ],
  },
  {
    id: "time",
    title: "Time",
    color: "from-amber-500 to-yellow-500",
    blocks: [
      { type: "clock-face", label: "Clock", emoji: "🕐", hint: "Tell time" },
      {
        type: "speed-control",
        label: "Speed dial",
        emoji: "⏩",
        hint: "Faster or slower",
      },
    ],
  },
];

export const ALLOWED_BLOCK_TYPES = new Set(
  BLOCK_CATEGORIES.flatMap((c) => c.blocks.map((b) => b.type)),
);

export function blockCatalogPromptFragment(): string {
  const lines = BLOCK_CATEGORIES.flatMap((cat) =>
    cat.blocks.map((b) => `- ${b.type}: ${b.hint} (${cat.title})`),
  );
  return lines.join("\n");
}
