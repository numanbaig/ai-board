"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import type { SimulationBlock } from "@/lib/scispark/simulation-schema";

type Anim = NonNullable<SimulationBlock["animation"]> | { type: "none" };

const KIND_ALIASES: Record<string, string> = {
  square: "rect",
  circle: "ellipse",
  "round-rect": "roundRect",
  roundedrect: "roundRect",
  "rounded-rect": "roundRect",
  rhombus: "diamond",
  coil: "coil",
  solenoid: "coil",
  spiral: "coil",
  sine: "wave",
  waveform: "wave",
  bolt: "zigzag",
  lightning: "zigzag",
};

function normalizeKind(raw: unknown): string {
  if (typeof raw !== "string") return "rect";
  const k = raw.trim().toLowerCase().replace(/\s+/g, "-");
  return KIND_ALIASES[k] ?? k;
}

type ShapeProps = {
  shapeKind?: unknown;
  kind?: unknown;
  fill?: unknown;
  stroke?: unknown;
  strokeWidth?: unknown;
  opacity?: unknown;
  rotationDeg?: unknown;
  dashed?: unknown;
  cornerRadius?: unknown;
  arcSweepDeg?: unknown;
};

function num(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function bool(v: unknown): boolean {
  return v === true || v === "true" || v === 1;
}

function ShapeSvg({
  kind,
  w,
  h,
  fill,
  stroke,
  sw,
  dashed,
  cornerRadius,
  arcSweepDeg,
}: {
  kind: string;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  sw: number;
  dashed: boolean;
  cornerRadius: number;
  arcSweepDeg: number;
}) {
  const dash = dashed ? "6 4" : undefined;
  const midY = h / 2;
  const sweep = Math.min(340, Math.max(30, arcSweepDeg));

  switch (kind) {
    case "ellipse":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <ellipse
            cx={w / 2}
            cy={h / 2}
            rx={Math.max(2, w / 2 - sw)}
            ry={Math.max(2, h / 2 - sw)}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            strokeDasharray={dash}
          />
        </svg>
      );

    case "roundRect": {
      const r = Math.min(cornerRadius, w / 4, h / 4);
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <rect
            x={sw / 2}
            y={sw / 2}
            width={w - sw}
            height={h - sw}
            rx={r}
            ry={r}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            strokeDasharray={dash}
          />
        </svg>
      );
    }

    case "triangle":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <polygon
            points={`${w / 2},${sw} ${w - sw},${h - sw} ${sw},${h - sw}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeDasharray={dash}
          />
        </svg>
      );

    case "diamond":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <polygon
            points={`${w / 2},${sw} ${w - sw},${h / 2} ${w / 2},${h - sw} ${sw},${h / 2}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeDasharray={dash}
          />
        </svg>
      );

    case "hexagon": {
      const cx = w / 2;
      const cy = h / 2;
      const rx = w / 2 - sw;
      const ry = h / 2 - sw;
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push(`${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`);
      }
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <polygon
            points={pts.join(" ")}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeDasharray={dash}
          />
        </svg>
      );
    }

    case "line":
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <line
            x1={sw}
            y1={midY}
            x2={w - sw}
            y2={midY}
            stroke={stroke}
            strokeWidth={Math.max(2, sw * 2)}
            strokeLinecap="round"
            strokeDasharray={dash}
          />
        </svg>
      );

    case "arrow": {
      const tip = w - sw * 2;
      const shaftW = tip - sw * 4;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <defs>
            <linearGradient id="shaft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.85} />
              <stop offset="100%" stopColor={stroke} />
            </linearGradient>
          </defs>
          <rect
            x={sw}
            y={midY - sw * 1.2}
            width={Math.max(4, shaftW)}
            height={sw * 2.4}
            rx={2}
            fill="url(#shaft)"
          />
          <polygon
            points={`${tip},${midY} ${w - sw},${midY - sw * 3} ${w - sw},${midY + sw * 3}`}
            fill={stroke}
          />
        </svg>
      );
    }

    case "arc": {
      const cx = w * 0.15;
      const cy = h * 0.85;
      const rx = Math.min(w, h) * 0.75;
      const ry = Math.min(w, h) * 0.55;
      const rad = (sweep * Math.PI) / 180;
      const x = cx + rx * Math.cos(-Math.PI / 2 + rad);
      const y = cy + ry * Math.sin(-Math.PI / 2 + rad);
      const large = sweep > 180 ? 1 : 0;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <path
            d={`M ${cx} ${cy - ry} A ${rx} ${ry} 0 ${large} 1 ${x} ${y}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={dash}
          />
        </svg>
      );
    }

    case "wave": {
      const steps = 24;
      const amp = Math.min(h, w) * 0.15;
      let d = `M ${sw} ${midY}`;
      for (let i = 1; i <= steps; i++) {
        const x = sw + ((w - sw * 2) * i) / steps;
        const y = midY + Math.sin((i / steps) * Math.PI * 3) * amp;
        d += ` L ${x} ${y}`;
      }
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dash}
          />
        </svg>
      );
    }

    case "zigzag": {
      const zig = 5;
      let d = `M ${sw} ${midY}`;
      let up = true;
      for (let x = sw + 8; x < w - sw; x += 10) {
        d += ` L ${x} ${midY + (up ? -zig : zig)}`;
        up = !up;
      }
      d += ` L ${w - sw} ${midY}`;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    case "coil": {
      const n = 6;
      const left = sw * 2;
      const right = w - sw * 2;
      const step = (right - left) / n;
      let d = `M ${left} ${midY}`;
      for (let i = 0; i < n; i++) {
        const x1 = left + step * i + step * 0.5;
        const x2 = left + step * (i + 1);
        const flip = i % 2 === 0 ? -h * 0.22 : h * 0.22;
        d += ` Q ${x1} ${midY + flip} ${x2} ${midY}`;
      }
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    case "star": {
      const cx = w / 2;
      const cy = h / 2;
      const outer = Math.min(w, h) / 2 - sw;
      const inner = outer * 0.45;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
      }
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <polygon
            points={pts.join(" ")}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    default:
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <rect
            x={sw / 2}
            y={sw / 2}
            width={w - sw}
            height={h - sw}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            strokeDasharray={dash}
          />
        </svg>
      );
  }
}

type Props = {
  baseStyle: CSSProperties;
  w: number;
  h: number;
  anim: Anim;
  labelEl: ReactNode;
  shapeProps: ShapeProps;
};

export function ShapeBlockView({ baseStyle, w, h, anim, labelEl, shapeProps }: Props) {
  const kind = normalizeKind(shapeProps.shapeKind ?? shapeProps.kind);
  const fill = str(shapeProps.fill, "rgba(148,163,184,0.25)");
  const stroke = str(shapeProps.stroke, "#475569");
  const sw = num(shapeProps.strokeWidth, 2.5);
  const opacity = num(shapeProps.opacity, 1);
  const rot = num(shapeProps.rotationDeg, 0);
  const dashed = bool(shapeProps.dashed);
  const cornerRadius = num(shapeProps.cornerRadius, 14);
  const arcSweepDeg = num(shapeProps.arcSweepDeg, 140);

  const inner = (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        opacity,
        transform: rot !== 0 ? `rotate(${rot}deg)` : undefined,
      }}
    >
      <ShapeSvg
        kind={kind}
        w={w}
        h={h}
        fill={fill}
        stroke={stroke}
        sw={sw}
        dashed={dashed}
        cornerRadius={cornerRadius}
        arcSweepDeg={arcSweepDeg}
      />
    </div>
  );

  const pulseAnim =
    anim.type === "pulse"
      ? {
          scale: [anim.minScale ?? 0.96, anim.maxScale ?? 1.06, anim.minScale ?? 0.96],
        }
      : {};
  const pulseDur = anim.type === "pulse" ? anim.durationSec ?? 2.2 : 0;

  if (anim.type === "pulse") {
    return (
      <motion.div
        style={baseStyle}
        className="relative"
        animate={pulseAnim}
        transition={{
          duration: pulseDur,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {inner}
        {labelEl}
      </motion.div>
    );
  }

  if (anim.type === "rotate") {
    const dur = anim.durationSec ?? 10;
    return (
      <motion.div
        style={baseStyle}
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
      >
        {inner}
        {labelEl}
      </motion.div>
    );
  }

  return (
    <div style={baseStyle} className="relative">
      {inner}
      {labelEl}
    </div>
  );
}

export function shapeBlockFromProps(blockProps: Record<string, unknown> | undefined): boolean {
  if (!blockProps) return false;
  if (blockProps.renderAs === "shape") return true;
  if (typeof blockProps.shapeKind === "string" && blockProps.shapeKind.length > 0) return true;
  if (typeof blockProps.kind === "string" && blockProps.kind.length > 0) return true;
  return false;
}
