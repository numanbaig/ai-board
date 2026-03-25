/**
 * Maps common model mistakes to values accepted by simulationSpecSchema
 * before Zod parse (prompt/schema drift, hallucinated enum values).
 */

const VALID_BACKDROP = new Set(["plain", "sky-ground", "space-dark"]);

const BACKDROP_ALIASES: Record<string, { type: string; horizon?: number }> = {
  "sky-ground-night": { type: "sky-ground", horizon: 0.55 },
  underwater: { type: "sky-ground", horizon: 0.78 },
  "body-interior": { type: "plain" },
  "circuit-board": { type: "plain" },
  "terrain-cross-section": { type: "sky-ground", horizon: 0.68 },
};

const VALID_ANIMATION = new Set(["none", "orbit", "rotate", "pulse", "fall"]);

/** Treat as gentle vertical-ish motion → pulse. */
const ANIM_TO_PULSE = new Set([
  "float",
  "drift",
  "bob",
  "bounce",
  "wiggle",
  "shake",
  "hover",
]);

function coerceBackdrop(b: unknown): unknown {
  if (b === undefined || b === null) return b;
  if (typeof b !== "object" || Array.isArray(b)) return { type: "plain" };
  const o = b as Record<string, unknown>;
  const t = o.type;
  if (typeof t !== "string") return { type: "plain" };

  if (VALID_BACKDROP.has(t)) {
    return b;
  }

  const alias = BACKDROP_ALIASES[t];
  if (alias) {
    return {
      ...o,
      type: alias.type,
      ...(alias.horizon !== undefined && o.horizon === undefined
        ? { horizon: alias.horizon }
        : {}),
    };
  }

  return { type: "plain" };
}

function coerceAnimation(a: unknown): unknown {
  if (a === undefined || a === null) return undefined;
  if (typeof a !== "object" || Array.isArray(a)) return undefined;
  const o = a as Record<string, unknown>;
  const t = o.type;
  if (typeof t !== "string") return undefined;

  if (VALID_ANIMATION.has(t)) {
    return a;
  }

  if (ANIM_TO_PULSE.has(t)) {
    return {
      type: "pulse",
      minScale: 0.94,
      maxScale: 1.06,
      durationSec: typeof o.durationSec === "number" ? o.durationSec : 2.5,
    };
  }

  return undefined;
}

export function coerceRawSimulationJson(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const spec = { ...(raw as Record<string, unknown>) };

  if ("backdrop" in spec) {
    spec.backdrop = coerceBackdrop(spec.backdrop);
  }

  if (Array.isArray(spec.blocks)) {
    spec.blocks = spec.blocks.map((block: unknown) => {
      if (!block || typeof block !== "object" || Array.isArray(block)) return block;
      const b = { ...(block as Record<string, unknown>) };
      if ("animation" in b) {
        const next = coerceAnimation(b.animation);
        if (next === undefined) delete b.animation;
        else b.animation = next;
      }
      return b;
    });
  }

  return spec;
}
