import type { SimulationBlock } from "@/lib/scispark/simulation-schema";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Uniform visual scale for one block (used alone or for every member of a group). */
export function scaleBlockDimensions(
  b: SimulationBlock,
  factor: number,
): SimulationBlock {
  const baseW = b.width ?? 72;
  const baseH = b.height ?? 64;
  let next: SimulationBlock = {
    ...b,
    width: clamp(Math.round(baseW * factor), 20, 420),
    height: clamp(Math.round(baseH * factor), 16, 360),
  };

  const anim = next.animation;
  if (anim?.type === "orbit" && anim.radiusPx != null) {
    next = {
      ...next,
      animation: {
        ...anim,
        radiusPx: clamp(Math.round(anim.radiusPx * factor), 16, 260),
      },
    };
  }
  if (anim?.type === "fall" && anim.heightPx != null) {
    next = {
      ...next,
      animation: {
        ...anim,
        heightPx: clamp(Math.round(anim.heightPx * factor), 40, 420),
      },
    };
  }

  if (next.type === "text-note") {
    const fs = (next.props?.fontSize as number | undefined) ?? 14;
    next = {
      ...next,
      props: {
        ...next.props,
        fontSize: clamp(Math.round(fs * factor), 10, 40),
      },
    };
  }

  return next;
}
