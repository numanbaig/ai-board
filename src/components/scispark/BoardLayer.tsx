"use client";

import { useDndMonitor } from "@dnd-kit/core";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { BoardTool, Stroke, StrokePoint } from "./board-types";
import { BOARD_COLORS, BOARD_WIDTHS } from "./board-types";

type Props = {
  /** When false, blocks on the stage should ignore pointer (drawing mode). */
  onInteractionLockChange: (locked: boolean) => void;
  /** Mount whiteboard toolbar here so it is not scaled with the stage (e.g. sibling of #STAGE_ID). */
  toolbarPortalHost: HTMLElement | null;
};

function normPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): StrokePoint {
  return {
    x: (clientX - rect.left) / rect.width,
    y: (clientY - rect.top) / rect.height,
  };
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  cw: number,
  ch: number,
) {
  const pts = stroke.points;
  if (pts.length === 0) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.lineWidth;

  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else if (stroke.tool === "highlighter") {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = stroke.color;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color;
  }

  ctx.beginPath();
  ctx.moveTo(pts[0].x * cw, pts[0].y * ch);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x * cw, pts[i].y * ch);
  }
  ctx.stroke();
  ctx.restore();
}

export function BoardLayer({
  onInteractionLockChange,
  toolbarPortalHost,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draftRef = useRef<Stroke | null>(null);

  const [tool, setTool] = useState<BoardTool>("select");
  const [color, setColor] = useState<string>(BOARD_COLORS[0].hex);
  const [lineWidth, setLineWidth] = useState<number>(BOARD_WIDTHS[1].px);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [past, setPast] = useState<Stroke[][]>([]);
  const [future, setFuture] = useState<Stroke[][]>([]);
  const [dndDragging, setDndDragging] = useState(false);

  const toolbarId = useId();

  useDndMonitor({
    onDragStart() {
      setDndDragging(true);
    },
    onDragEnd() {
      setDndDragging(false);
    },
    onDragCancel() {
      setDndDragging(false);
    },
  });

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx || w < 1 || h < 1) return;

    const dpr = window.devicePixelRatio || 1;
    if (
      canvas.width !== Math.floor(w * dpr) ||
      canvas.height !== Math.floor(h * dpr)
    ) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    for (const s of strokes) {
      drawStroke(ctx, s, w, h);
    }
    const d = draftRef.current;
    if (d) {
      drawStroke(ctx, d, w, h);
    }
  }, [strokes]);

  useEffect(() => {
    onInteractionLockChange(tool !== "select");
  }, [tool, onInteractionLockChange]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      redraw();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setFuture((f) => [strokes, ...f]);
    setPast((p) => p.slice(0, -1));
    setStrokes(prev);
  }, [past, strokes]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setPast((p) => [...p, strokes]);
    setFuture((f) => f.slice(1));
    setStrokes(next);
  }, [future, strokes]);

  const clearBoard = useCallback(() => {
    if (strokes.length === 0) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear all board marks?")
    ) {
      return;
    }
    setPast((p) => [...p, strokes]);
    setFuture([]);
    setStrokes([]);
  }, [strokes]);

  const drawing = tool !== "select";
  const canvasInteractive = drawing && !dndDragging;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canvasInteractive || !canvasRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const p = normPoint(e.clientX, e.clientY, rect);
    const id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    draftRef.current = {
      id,
      tool: tool === "eraser" ? "eraser" : tool === "highlighter" ? "highlighter" : "pen",
      color,
      lineWidth: tool === "highlighter" ? Math.max(lineWidth, 12) : lineWidth,
      points: [p],
    };
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draftRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const p = normPoint(e.clientX, e.clientY, rect);
    draftRef.current.points.push(p);
    redraw();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draftRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const done = draftRef.current;
    draftRef.current = null;
    if (done.points.length < 2) {
      redraw();
      return;
    }
    setStrokes((prev) => {
      setPast((p) => [...p, prev]);
      setFuture([]);
      return [...prev, done];
    });
  };

  const toolbarUi = (
    <div
      data-scispark-board-chrome
      className="pointer-events-auto flex max-w-[min(100%,28rem)] flex-col items-center gap-1.5"
      role="toolbar"
      aria-label="Board tools"
      aria-labelledby={toolbarId}
    >
      <span id={toolbarId} className="sr-only">
        Whiteboard: pick a tool, then draw on the stage
      </span>
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border-2 border-indigo-200/90 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
        <ToolBtn
          active={tool === "select"}
          onClick={() => setTool("select")}
          title="Move blocks"
          ariaPressed={tool === "select"}
        >
          <span className="text-base" aria-hidden>
            ✋
          </span>
          <span className="sr-only">Select and move</span>
        </ToolBtn>
        <ToolBtn
          active={tool === "pen"}
          onClick={() => setTool("pen")}
          title="Pen"
          ariaPressed={tool === "pen"}
        >
          <span className="text-base" aria-hidden>
            ✏️
          </span>
        </ToolBtn>
        <ToolBtn
          active={tool === "highlighter"}
          onClick={() => setTool("highlighter")}
          title="Highlighter"
          ariaPressed={tool === "highlighter"}
        >
          <span className="text-base" aria-hidden>
            🖍️
          </span>
        </ToolBtn>
        <ToolBtn
          active={tool === "eraser"}
          onClick={() => setTool("eraser")}
          title="Eraser"
          ariaPressed={tool === "eraser"}
        >
          <span className="text-base" aria-hidden>
            🧽
          </span>
        </ToolBtn>

        <span className="mx-0.5 h-6 w-px bg-indigo-200" aria-hidden />

        <button
          type="button"
          onClick={undo}
          disabled={past.length === 0}
          className="rounded-xl px-2 py-1 text-xs font-bold text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="Undo"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={future.length === 0}
          className="rounded-xl px-2 py-1 text-xs font-bold text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="Redo"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={clearBoard}
          disabled={strokes.length === 0}
          className="rounded-xl px-2 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
          title="Clear board"
        >
          Clear
        </button>
      </div>

      {drawing && tool !== "eraser" && (
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-violet-200 bg-white/90 px-2 py-1 shadow-md">
          {BOARD_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              className={`h-7 w-7 rounded-full border-2 shadow-sm transition hover:scale-110 ${
                color === c.hex ? "border-indigo-600 ring-2 ring-indigo-300" : "border-white"
              }`}
              style={{ backgroundColor: c.hex }}
              onClick={() => setColor(c.hex)}
              aria-label={`Color ${c.label}`}
            />
          ))}
        </div>
      )}

      {drawing && (
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-md">
          <span className="sr-only">Line thickness</span>
          {BOARD_WIDTHS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setLineWidth(w.px)}
              className={`rounded-lg px-2 py-0.5 ${
                lineWidth === w.px
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              aria-pressed={lineWidth === w.px}
            >
              {w.id === "s" ? "Thin" : w.id === "m" ? "Med" : "Thick"}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        ref={wrapRef}
        className={`pointer-events-none absolute inset-0 z-[8] ${
          canvasInteractive ? "cursor-crosshair touch-none" : ""
        }`}
        aria-hidden={!drawing}
      >
        <canvas
          ref={canvasRef}
          data-board-drawing-active={canvasInteractive ? "" : undefined}
          className={`absolute inset-0 block h-full w-full ${
            canvasInteractive ? "pointer-events-auto" : "pointer-events-none"
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      {toolbarPortalHost
        ? createPortal(toolbarUi, toolbarPortalHost)
        : null}
    </>
  );
}

function ToolBtn({
  active,
  onClick,
  title,
  children,
  ariaPressed,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
  ariaPressed: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={ariaPressed}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 text-sm transition ${
        active
          ? "border-amber-400 bg-amber-100 shadow-inner"
          : "border-transparent bg-slate-50 hover:bg-violet-50"
      }`}
    >
      {children}
    </button>
  );
}
