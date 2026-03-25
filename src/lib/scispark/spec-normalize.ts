import type { SimulationBlock, SimulationSpec } from "./simulation-schema";

const XY_EPS = 0.01;
const MIN_ORBIT_RADIUS_PX = 24;
const MAX_ORBIT_RADIUS_PX = 140;
const DEFAULT_ORBIT_DURATION_SEC = 13;
const FALLBACK_ORBIT_RADIUS_PX = 90;

function sameCluster(a: SimulationBlock, b: SimulationBlock): boolean {
  return a.groupId === b.groupId;
}

function samePosition(a: SimulationBlock, b: SimulationBlock): boolean {
  return (
    Math.abs(a.x - b.x) < XY_EPS && Math.abs(a.y - b.y) < XY_EPS
  );
}

/**
 * Prefer a sun that shares groupId with `body`. If none (common model mistake:
 * sun has groupId, planet omits it or uses another), fall back to the only sun
 * in the spec for planet/orbit-path so orbit repair still runs.
 */
function findSunForBody(
  blocks: SimulationBlock[],
  body: SimulationBlock,
): SimulationBlock | undefined {
  const strict = blocks.find(
    (s) => s.type === "sun" && sameCluster(s, body),
  );
  if (strict) return strict;

  const suns = blocks.filter((s) => s.type === "sun");
  if (suns.length !== 1) return undefined;

  if (body.type === "planet" || body.type === "orbit-path") {
    return suns[0];
  }
  return undefined;
}

function orbitPathHalfSize(
  blocks: SimulationBlock[],
  anchor: SimulationBlock,
  sun: SimulationBlock,
): number | null {
  const path =
    blocks.find(
      (b) =>
        b.type === "orbit-path" &&
        sameCluster(b, anchor) &&
        samePosition(b, anchor),
    ) ??
    blocks.find(
      (b) => b.type === "orbit-path" && samePosition(b, sun),
    );
  if (!path) return null;
  const w = path.width ?? 220;
  const h = path.height ?? 220;
  return Math.min(w, h) / 2;
}

function clampOrbitRadius(r: number): number {
  return Math.min(
    MAX_ORBIT_RADIUS_PX,
    Math.max(MIN_ORBIT_RADIUS_PX, Math.round(r)),
  );
}

function canonicalizeBlockTypes(blocks: SimulationBlock[]): SimulationBlock[] {
  return blocks.map((b) => ({
    ...b,
    type: b.type.trim().toLowerCase(),
  }));
}

/**
 * Aligns orbit-path + planet/moon with the sun, fixes missing or zero orbit
 * radius, and tolerates mismatched groupId between sun and planet.
 */
export function normalizeSimulationSpec(spec: SimulationSpec): SimulationSpec {
  const blocks = canonicalizeBlockTypes(spec.blocks.map((b) => ({ ...b })));

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type !== "orbit-path") continue;
    const sun = findSunForBody(blocks, b);
    if (!sun || samePosition(sun, b)) continue;
    blocks[i] = {
      ...b,
      x: sun.x,
      y: sun.y,
      ...(sameCluster(sun, b) ? {} : { groupId: sun.groupId ?? b.groupId }),
    };
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type !== "planet" && b.type !== "moon") continue;

    const sun = findSunForBody(blocks, b);
    if (!sun) continue;

    let centered: SimulationBlock = samePosition(sun, b)
      ? b
      : { ...b, x: sun.x, y: sun.y };
    if (!sameCluster(sun, b)) {
      centered = {
        ...centered,
        groupId: sun.groupId ?? centered.groupId,
      };
    }

    const halfPath = orbitPathHalfSize(blocks, centered, sun);
    const pw = centered.width ?? 36;
    const ph = centered.height ?? 36;
    const planetHalf = Math.min(pw, ph) / 2;

    let derivedR: number;
    if (halfPath != null) {
      derivedR = clampOrbitRadius(halfPath - planetHalf);
    } else {
      derivedR = FALLBACK_ORBIT_RADIUS_PX;
    }

    const anim = centered.animation;
    if (!anim || anim.type !== "orbit") {
      blocks[i] = {
        ...centered,
        animation: {
          type: "orbit",
          radiusPx: derivedR,
          durationSec: DEFAULT_ORBIT_DURATION_SEC,
        },
      };
      continue;
    }

    const r = anim.radiusPx;
    if (r == null || r < MIN_ORBIT_RADIUS_PX) {
      blocks[i] = {
        ...centered,
        animation: {
          type: "orbit",
          radiusPx: derivedR,
          durationSec: anim.durationSec ?? DEFAULT_ORBIT_DURATION_SEC,
        },
      };
    } else {
      blocks[i] = centered;
    }
  }

  return { ...spec, blocks };
}
