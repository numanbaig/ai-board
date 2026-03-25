import type { SimulationSpec } from "./simulation-schema";

function orbitEarthSun(): SimulationSpec {
  return {
    title: "Earth goes around the Sun",
    backdrop: { type: "space-dark" },
    explanationSteps: [
      "The Sun is a huge star at the center of our neighborhood in space.",
      "Earth is a planet that travels in a big loop called an orbit.",
      "Gravity pulls Earth toward the Sun, but Earth is also moving sideways.",
      "That mix makes Earth go around instead of falling straight in—like a ball on a string!",
      "Try dragging blocks or ask another question to explore more.",
    ],
    blocks: [
      {
        id: "sun-1",
        type: "sun",
        x: 50,
        y: 45,
        width: 72,
        height: 72,
        label: "Sun",
        animation: { type: "pulse", minScale: 1, maxScale: 1.06, durationSec: 2.5 },
        zIndex: 2,
        groupId: "demo-solar",
      },
      {
        id: "orbit-1",
        type: "orbit-path",
        x: 50,
        y: 45,
        width: 220,
        height: 220,
        props: { color: "rgba(99,102,241,0.35)" },
        zIndex: 0,
        groupId: "demo-solar",
      },
      {
        id: "earth-1",
        type: "planet",
        x: 50,
        y: 45,
        width: 36,
        height: 36,
        label: "Earth",
        props: { color: "#3b82f6" },
        animation: { type: "orbit", radiusPx: 110, durationSec: 14 },
        zIndex: 3,
        groupId: "demo-solar",
      },
      {
        id: "arrow-1",
        type: "velocity-arrow",
        x: 62,
        y: 38,
        width: 56,
        height: 20,
        label: "motion",
        props: { angleDeg: 75 },
        zIndex: 4,
        groupId: "demo-solar",
      },
    ],
  };
}

function fractionsDemo(): SimulationSpec {
  return {
    title: "Fractions are pieces of a whole",
    explanationSteps: [
      "A fraction tells us about parts of one whole thing.",
      "The bottom number is how many equal slices the whole is cut into.",
      "The top number is how many slices we are talking about.",
      "Tap and explore on the canvas—you can add more blocks from the left!",
    ],
    blocks: [
      {
        id: "pie-1",
        type: "fraction-pie",
        x: 38,
        y: 42,
        width: 160,
        height: 160,
        props: { numerator: 1, denominator: 4, color: "#f472b6" },
        zIndex: 2,
        groupId: "demo-frac",
      },
      {
        id: "nl-1",
        type: "number-line",
        x: 50,
        y: 78,
        width: 280,
        height: 48,
        props: { min: 0, max: 1, mark: 0.25 },
        zIndex: 1,
        groupId: "demo-frac",
      },
    ],
  };
}

function gravityDemo(): SimulationSpec {
  return {
    title: "Gravity pulls things down",
    explanationSteps: [
      "Earth pulls everything toward its center—that pull is called gravity.",
      "When you let go, things fall because gravity tugs them downward.",
      "Heavy and light things both fall; air can slow some objects down.",
      "Use sliders on the canvas when you add them to play with ideas!",
    ],
    blocks: [
      {
        id: "g-1",
        type: "gravity-indicator",
        x: 50,
        y: 18,
        width: 48,
        height: 64,
        zIndex: 2,
        groupId: "demo-gravity",
      },
      {
        id: "ball-1",
        type: "falling-object",
        x: 52,
        y: 32,
        width: 40,
        height: 40,
        props: { color: "#fbbf24" },
        animation: { type: "fall", heightPx: 180, durationSec: 2.2 },
        zIndex: 3,
        groupId: "demo-gravity",
      },
      {
        id: "mass-1",
        type: "mass-slider",
        x: 22,
        y: 72,
        width: 200,
        height: 56,
        zIndex: 4,
        groupId: "demo-gravity",
      },
    ],
  };
}

function additionOnNumberLineDemo(): SimulationSpec {
  return {
    title: "Adding on the number line",
    backdrop: { type: "plain" },
    explanationSteps: [
      "We start at 0 on the number line.",
      "The first hop adds 2 — we land on 2.",
      "The second hop adds 2 more — we land on 4.",
      "So 2 + 2 equals 4!",
    ],
    blocks: [
      {
        id: "frame-add-demo",
        type: "concept-frame",
        x: 50,
        y: 50,
        width: 400,
        height: 300,
        props: { title: "Adding", showFromStep: 0 },
        zIndex: 0,
        groupId: "demo-add-line",
      },
      {
        id: "note-q-demo",
        type: "text-note",
        x: 50,
        y: 30,
        width: 200,
        height: 76,
        props: { text: "Let's add 2 + 2!", fontSize: 14, showFromStep: 0 },
        zIndex: 2,
        groupId: "demo-add-line",
      },
      {
        id: "nl-add-demo",
        type: "number-line",
        x: 50,
        y: 52,
        width: 300,
        height: 64,
        props: { min: 0, max: 6, start: 0, hops: [2, 2], showFromStep: 1 },
        label: "Hop by hop",
        zIndex: 2,
        groupId: "demo-add-line",
      },
      {
        id: "note-ans-demo",
        type: "text-note",
        x: 50,
        y: 76,
        width: 180,
        height: 68,
        props: { text: "2 + 2 = 4!", fontSize: 15, showFromStep: 3 },
        zIndex: 2,
        groupId: "demo-add-line",
      },
    ],
  };
}

function anglesDemo(): SimulationSpec {
  return {
    title: "Angles measure turns",
    explanationSteps: [
      "An angle is how much one line is turned compared to another.",
      "We measure turns in degrees—like slices of a circular pizza.",
      "A right angle is a square corner: 90 degrees.",
      "Watch the arm spin on the protractor to see degrees grow!",
    ],
    blocks: [
      {
        id: "prot-1",
        type: "protractor",
        x: 48,
        y: 48,
        width: 200,
        height: 120,
        zIndex: 1,
        groupId: "demo-angles",
      },
      {
        id: "arm-1",
        type: "angle-arm",
        x: 48,
        y: 48,
        width: 120,
        height: 8,
        props: { degrees: 45 },
        animation: { type: "rotate", durationSec: 10 },
        zIndex: 3,
        groupId: "demo-angles",
      },
    ],
  };
}

function windConvectionDemo(): SimulationSpec {
  return {
    title: "Whoosh! How wind blows",
    backdrop: { type: "sky-ground", horizon: 0.62 },
    explanationSteps: [
      "The Sun warms the ground and the air near it—that warm air is lighter and rises up.",
      "Cooler air nearby is heavier, so it sinks down closer to the ground.",
      "Air moves sideways from high to low spots to fill the space—that moving air is wind.",
      "Try dragging the whole lesson together: it is one connected story on the board.",
    ],
    blocks: [
      {
        id: "wind-frame",
        type: "concept-frame",
        x: 50,
        y: 52,
        width: 420,
        height: 320,
        props: { title: "Wind cycle", showFromStep: 0 },
        zIndex: 0,
        groupId: "demo-wind",
      },
      {
        id: "sun-rays",
        type: "radiation-burst",
        x: 50,
        y: 22,
        width: 72,
        height: 72,
        props: { count: 10, color: "#fbbf24", showFromStep: 0 },
        label: "Sun heats",
        zIndex: 2,
        groupId: "demo-wind",
      },
      {
        id: "warm-blob",
        type: "gradient-blob",
        x: 38,
        y: 38,
        width: 100,
        height: 88,
        props: { tone: "hot", regionLabel: "Warm air", showFromStep: 1 },
        zIndex: 2,
        groupId: "demo-wind",
      },
      {
        id: "cool-blob",
        type: "gradient-blob",
        x: 62,
        y: 38,
        width: 100,
        height: 88,
        props: { tone: "cold", regionLabel: "Cool air", showFromStep: 2 },
        zIndex: 2,
        groupId: "demo-wind",
      },
      {
        id: "rise-arrow",
        type: "velocity-arrow",
        x: 38,
        y: 28,
        width: 36,
        height: 28,
        props: { angleDeg: -90, showFromStep: 1 },
        label: "Rises",
        zIndex: 3,
        groupId: "demo-wind",
      },
      {
        id: "sink-arrow",
        type: "velocity-arrow",
        x: 62,
        y: 48,
        width: 36,
        height: 28,
        props: { angleDeg: 90, showFromStep: 2 },
        label: "Sinks",
        zIndex: 3,
        groupId: "demo-wind",
      },
      {
        id: "wind-wave",
        type: "wave-strip",
        x: 50,
        y: 62,
        width: 200,
        height: 36,
        props: { direction: "right", color: "#38bdf8", showFromStep: 3 },
        zIndex: 2,
        groupId: "demo-wind",
      },
      {
        id: "wind-flow",
        type: "flow-ribbon",
        x: 50,
        y: 72,
        width: 260,
        height: 56,
        props: { color: "#6366f1", showFromStep: 3 },
        label: "Wind along ground",
        zIndex: 2,
        groupId: "demo-wind",
      },
      {
        id: "wind-note",
        type: "text-note",
        x: 50,
        y: 88,
        width: 260,
        height: 72,
        props: {
          text: "Cool air moves to replace rising warm air—that push is wind!",
          fontSize: 12,
          showFromStep: 3,
        },
        zIndex: 3,
        groupId: "demo-wind",
      },
    ],
  };
}

export function demoSimulationForQuestion(q: string): SimulationSpec {
  const s = q.toLowerCase().replace(/\s/g, "");
  if (/\d+\+\d+/.test(s) || s.includes("2+2")) {
    return additionOnNumberLineDemo();
  }
  const sLoose = q.toLowerCase();
  if (
    sLoose.includes("wind") ||
    sLoose.includes("blow") ||
    sLoose.includes("breeze") ||
    sLoose.includes("convection") ||
    (sLoose.includes("weather") && sLoose.includes("air"))
  ) {
    return windConvectionDemo();
  }
  if (
    sLoose.includes("fraction") ||
    sLoose.includes("pie") ||
    sLoose.includes("part")
  ) {
    return fractionsDemo();
  }
  if (sLoose.includes("gravity") || sLoose.includes("fall")) {
    return gravityDemo();
  }
  if (
    sLoose.includes("angle") ||
    sLoose.includes("degree") ||
    sLoose.includes("protractor")
  ) {
    return anglesDemo();
  }
  if (
    sLoose.includes("earth") ||
    sLoose.includes("sun") ||
    sLoose.includes("orbit") ||
    sLoose.includes("solar")
  ) {
    return orbitEarthSun();
  }
  return orbitEarthSun();
}
