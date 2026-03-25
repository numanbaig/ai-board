import type { AiStroke, NotePanel, SimulationSpec } from "./simulation-schema";

function stroke(
  id: string,
  points: { x: number; y: number }[],
  stepIndex: number,
  color = "#1e293b",
  lineWidth = 3,
): AiStroke {
  return { id, points, stepIndex, color, lineWidth };
}

function note(
  id: string,
  stepIndex: number,
  text: string,
  x: number,
  y: number,
  maxWidthPct = 40,
): NotePanel {
  return { id, stepIndex, text, x, y, maxWidthPct };
}

function waterCycleDemo(): SimulationSpec {
  return {
    title: "The water cycle",
    backdrop: { type: "sky-ground", horizon: 0.58 },
    explanationSteps: [
      "The sun warms lakes and oceans; water sits on the ground and in pools.",
      "Heat turns some water into invisible vapor—it rises into the air. That is evaporation.",
      "Cool air high up makes vapor bunch into tiny droplets—we see them as clouds.",
      "When droplets grow heavy, they fall as rain or snow, and water collects again.",
    ],
    aiStrokes: [
      stroke(
        "w-pond",
        [
          { x: 0.12, y: 0.82 },
          { x: 0.22, y: 0.78 },
          { x: 0.38, y: 0.8 },
          { x: 0.48, y: 0.84 },
          { x: 0.55, y: 0.82 },
        ],
        0,
        "#2563eb",
        4,
      ),
      stroke(
        "w-sun",
        circleLike(0.78, 0.14, 0.055, 14),
        0,
        "#ea580c",
        3,
      ),
      stroke(
        "w-ray1",
        [
          { x: 0.72, y: 0.2 },
          { x: 0.62, y: 0.32 },
        ],
        0,
        "#f97316",
        2,
      ),
      stroke(
        "w-ray2",
        [
          { x: 0.78, y: 0.22 },
          { x: 0.68, y: 0.38 },
        ],
        0,
        "#f97316",
        2,
      ),
      stroke(
        "w-evap",
        [
          { x: 0.35, y: 0.72 },
          { x: 0.36, y: 0.58 },
          { x: 0.34, y: 0.44 },
          { x: 0.38, y: 0.32 },
        ],
        1,
        "#64748b",
        3,
      ),
      stroke(
        "w-evap2",
        [
          { x: 0.42, y: 0.7 },
          { x: 0.44, y: 0.52 },
          { x: 0.42, y: 0.36 },
        ],
        1,
        "#94a3b8",
        2.5,
      ),
      stroke(
        "w-cloud",
        cloudOutline(0.48, 0.22),
        2,
        "#475569",
        3,
      ),
      stroke(
        "w-rain1",
        [
          { x: 0.42, y: 0.35 },
          { x: 0.4, y: 0.55 },
        ],
        3,
        "#2563eb",
        2,
      ),
      stroke(
        "w-rain2",
        [
          { x: 0.5, y: 0.34 },
          { x: 0.48, y: 0.58 },
        ],
        3,
        "#2563eb",
        2,
      ),
      stroke(
        "w-rain3",
        [
          { x: 0.56, y: 0.36 },
          { x: 0.54, y: 0.56 },
        ],
        3,
        "#2563eb",
        2,
      ),
      stroke(
        "w-arrow-down",
        [
          { x: 0.88, y: 0.5 },
          { x: 0.88, y: 0.72 },
        ],
        3,
        "#1e293b",
        2.5,
      ),
    ],
    notePanels: [
      note("n0", 0, "Sun heats water", 6, 8),
      note("n1", 1, "Evaporation: water becomes vapor", 6, 72),
      note("n2", 2, "Clouds form up high", 58, 8),
      note("n3", 3, "Precipitation returns water", 52, 68),
    ],
  };
}

function circleLike(cx: number, cy: number, r: number, segs: number) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function cloudOutline(cx: number, cy: number) {
  const bumps = [
    { dx: -0.1, dy: 0.02, r: 0.06 },
    { dx: -0.04, dy: -0.02, r: 0.055 },
    { dx: 0.04, dy: -0.015, r: 0.06 },
    { dx: 0.1, dy: 0.02, r: 0.05 },
  ];
  const pts: { x: number; y: number }[] = [];
  for (const b of bumps) {
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI;
      pts.push({
        x: cx + b.dx + b.r * Math.cos(a),
        y: cy + b.dy + b.r * Math.sin(a) * 0.55,
      });
    }
  }
  return pts;
}

function orbitDemo(): SimulationSpec {
  return {
    title: "Earth orbits the Sun",
    backdrop: { type: "space-dark" },
    explanationSteps: [
      "The Sun sits at the center of our solar system.",
      "Earth travels along a huge path called an orbit.",
      "Gravity pulls Earth toward the Sun while speed keeps it curving around.",
    ],
    aiStrokes: [
      stroke("o-sun", circleLike(0.5, 0.45, 0.06, 16), 0, "#fbbf24", 4),
      stroke(
        "o-orbit",
        circleLike(0.5, 0.45, 0.22, 48),
        1,
        "rgba(148,163,184,0.55)",
        2,
      ),
      stroke("o-earth", circleLike(0.72, 0.45, 0.025, 12), 1, "#38bdf8", 3),
      stroke(
        "o-motion",
        [
          { x: 0.74, y: 0.42 },
          { x: 0.78, y: 0.4 },
          { x: 0.82, y: 0.38 },
        ],
        2,
        "#94a3b8",
        2.5,
      ),
    ],
    notePanels: [
      note("on0", 0, "The Sun", 8, 10),
      note("on1", 1, "Earth follows its orbit", 62, 12),
      note("on2", 2, "Orbit = balance of pull and speed", 8, 72),
    ],
  };
}

function gravityDemo(): SimulationSpec {
  return {
    title: "Gravity pulls down",
    backdrop: { type: "plain" },
    explanationSteps: [
      "We draw the ground as a line.",
      "A ball sits above the ground.",
      "Gravity pulls it straight down—things fall toward Earth.",
    ],
    aiStrokes: [
      stroke(
        "g-ground",
        [
          { x: 0.1, y: 0.78 },
          { x: 0.9, y: 0.78 },
        ],
        0,
        "#334155",
        4,
      ),
      stroke("g-ball", circleLike(0.55, 0.35, 0.04, 14), 1, "#ca8a04", 3),
      stroke(
        "g-pull",
        [
          { x: 0.55, y: 0.42 },
          { x: 0.55, y: 0.62 },
        ],
        2,
        "#dc2626",
        3,
      ),
      stroke(
        "g-pull-head",
        [
          { x: 0.52, y: 0.58 },
          { x: 0.55, y: 0.62 },
          { x: 0.58, y: 0.58 },
        ],
        2,
        "#dc2626",
        3,
      ),
    ],
    notePanels: [
      note("gn0", 0, "Ground", 8, 82),
      note("gn1", 1, "Ball here", 62, 22),
      note("gn2", 2, "Gravity ↓", 62, 48),
    ],
  };
}

function additionDemo(): SimulationSpec {
  return {
    title: "Adding on a line",
    backdrop: { type: "plain" },
    explanationSteps: [
      "A number line helps us add step by step.",
      "Start at 0, hop by 2, then hop by 2 again.",
      "You land on 4 — so 2 + 2 = 4.",
    ],
    aiStrokes: [
      stroke(
        "a-line",
        [
          { x: 0.15, y: 0.55 },
          { x: 0.85, y: 0.55 },
        ],
        0,
        "#1e293b",
        3,
      ),
      stroke(
        "a-tick0",
        [
          { x: 0.25, y: 0.52 },
          { x: 0.25, y: 0.58 },
        ],
        0,
        "#1e293b",
        2,
      ),
      stroke(
        "a-tick2",
        [
          { x: 0.45, y: 0.52 },
          { x: 0.45, y: 0.58 },
        ],
        0,
        "#1e293b",
        2,
      ),
      stroke(
        "a-tick4",
        [
          { x: 0.65, y: 0.52 },
          { x: 0.65, y: 0.58 },
        ],
        0,
        "#1e293b",
        2,
      ),
      stroke(
        "a-hop1",
        [
          { x: 0.25, y: 0.38 },
          { x: 0.35, y: 0.32 },
          { x: 0.45, y: 0.38 },
        ],
        1,
        "#7c3aed",
        2.5,
      ),
      stroke(
        "a-hop2",
        [
          { x: 0.45, y: 0.38 },
          { x: 0.55, y: 0.32 },
          { x: 0.65, y: 0.38 },
        ],
        2,
        "#7c3aed",
        2.5,
      ),
    ],
    notePanels: [
      note("an0", 0, "Number line", 8, 12),
      note("an1", 1, "First +2", 8, 72),
      note("an2", 2, "Second +2 → 4", 52, 72),
    ],
  };
}

export function demoSimulationForQuestion(q: string): SimulationSpec {
  const s = q.toLowerCase().replace(/\s/g, "");
  if (/\d+\+\d+/.test(s) || s.includes("2+2")) {
    return additionDemo();
  }
  const sLoose = q.toLowerCase();
  if (
    sLoose.includes("water") ||
    sLoose.includes("rain") ||
    sLoose.includes("evaporat") ||
    sLoose.includes("cloud") ||
    sLoose.includes("precipit")
  ) {
    return waterCycleDemo();
  }
  if (
    sLoose.includes("gravity") ||
    (sLoose.includes("fall") && !sLoose.includes("water"))
  ) {
    return gravityDemo();
  }
  if (
    sLoose.includes("earth") ||
    sLoose.includes("sun") ||
    sLoose.includes("orbit") ||
    sLoose.includes("solar")
  ) {
    return orbitDemo();
  }
  return waterCycleDemo();
}
