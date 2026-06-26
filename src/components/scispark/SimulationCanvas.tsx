"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { AiStroke, NotePanel, SceneBackdrop } from "@/lib/scispark/simulation-schema";
import { AIStrokeLayer } from "./AIStrokeLayer";
import { BoardLayer, type BoardLayerHandle } from "./BoardLayer";
import { StageBackdrop } from "./StageBackdrop";

export const STAGE_ID = "scispark-stage";

const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2.75;
const ZOOM_STEP = 0.1;

function clampZoom(n: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(n * 10) / 10));
}

export type SimulationCanvasHandle = {
  clearUserSketches: () => void;
};

type Props = {
  title: string;
  aiStrokes: AiStroke[];
  notePanels: NotePanel[];
  activeStep?: number;
  backdrop?: SceneBackdrop;
  onRemoveAiStroke?: (id: string) => void;
  onClearAiBoard?: () => void;
};

export const SimulationCanvas = forwardRef<SimulationCanvasHandle, Props>(
  function SimulationCanvas(
    {
      title,
      aiStrokes,
      notePanels,
      activeStep = 0,
      backdrop,
      onRemoveAiStroke,
      onClearAiBoard,
    },
    ref,
  ) {
    const [boardLocksBoard, setBoardLocksBoard] = useState(false);
    const [boardZoom, setBoardZoom] = useState(1);
    const zoomViewportRef = useRef<HTMLDivElement>(null);
    const boardLayerRef = useRef<BoardLayerHandle>(null);
    const [boardToolbarHost, setBoardToolbarHost] =
      useState<HTMLDivElement | null>(null);
    const [selectedStrokeId, setSelectedStrokeId] = useState<string | null>(
      null,
    );

    useImperativeHandle(
      ref,
      () => ({
        clearUserSketches: () => {
          boardLayerRef.current?.clearAll();
        },
      }),
      [],
    );

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedStrokeId(null);
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          selectedStrokeId &&
          onRemoveAiStroke &&
          !boardLocksBoard
        ) {
          const t = e.target as HTMLElement;
          if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
          e.preventDefault();
          onRemoveAiStroke(selectedStrokeId);
          setSelectedStrokeId(null);
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [selectedStrokeId, onRemoveAiStroke, boardLocksBoard]);

    useEffect(() => {
      const el = zoomViewportRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        setBoardZoom((z) =>
          clampZoom(z + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)),
        );
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }, []);

    const z = boardZoom;
    const invPct = `${(100 / z).toFixed(4)}%`;

    const removeSelected = useCallback(() => {
      if (selectedStrokeId && onRemoveAiStroke) {
        onRemoveAiStroke(selectedStrokeId);
        setSelectedStrokeId(null);
      }
    }, [selectedStrokeId, onRemoveAiStroke]);

    return (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm sm:rounded-3xl sm:p-2.5">
        <header className="mb-1 flex shrink-0 flex-wrap items-center justify-between gap-2 px-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base">
              {title}
            </h2>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {selectedStrokeId && onRemoveAiStroke && (
              <button
                type="button"
                onClick={removeSelected}
                className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-800 hover:bg-rose-100"
              >
                Remove line
              </button>
            )}
            {onClearAiBoard && (
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm(
                      "Clear the AI drawing and notes from the board?",
                    )
                  ) {
                    return;
                  }
                  setSelectedStrokeId(null);
                  onClearAiBoard();
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
              >
                Clear AI
              </button>
            )}
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Zoom out"
                title="Zoom out"
                disabled={boardZoom <= ZOOM_MIN + 0.01}
                onClick={() =>
                  setBoardZoom((prev) => clampZoom(prev - ZOOM_STEP))
                }
              >
                −
              </button>
              <span className="min-w-[2.75rem] text-center text-[10px] font-bold tabular-nums text-slate-800">
                {Math.round(boardZoom * 100)}%
              </span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Zoom in"
                title="Zoom in"
                disabled={boardZoom >= ZOOM_MAX - 0.01}
                onClick={() =>
                  setBoardZoom((prev) => clampZoom(prev + ZOOM_STEP))
                }
              >
                +
              </button>
              <button
                type="button"
                className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-100"
                title="Reset zoom (100%)"
                aria-label="Reset zoom to one hundred percent"
                onClick={() => setBoardZoom(1)}
              >
                1:1
              </button>
            </div>
          </div>
        </header>
        <div
          ref={zoomViewportRef}
          title="Ctrl or ⌘ + scroll wheel to zoom"
          className="relative min-h-[min(50dvh,520px)] min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200/90 bg-neutral-200/40"
        >
          <div
            id={STAGE_ID}
            className={
              backdrop && backdrop.type !== "plain"
                ? "relative isolate bg-slate-900/5"
                : "relative isolate bg-[#fafafa]"
            }
            style={{
              width: invPct,
              height: invPct,
              minHeight: "min(70dvh, 720px)",
              transform: `scale(${z})`,
              transformOrigin: "top left",
            }}
          >
            {backdrop ? <StageBackdrop backdrop={backdrop} /> : null}
            <div
              data-ai-stroke-hit
              className={`absolute inset-0 z-[4] ${boardLocksBoard ? "pointer-events-none" : ""}`}
            >
              <AIStrokeLayer
                strokes={aiStrokes}
                notePanels={notePanels}
                activeStep={activeStep}
                selectedStrokeId={selectedStrokeId}
                onSelectStroke={setSelectedStrokeId}
                drawingLocksBoard={boardLocksBoard}
              />
            </div>
            <BoardLayer
              ref={boardLayerRef}
              onInteractionLockChange={setBoardLocksBoard}
              toolbarPortalHost={boardToolbarHost}
            />
          </div>
          <div
            ref={setBoardToolbarHost}
            className="pointer-events-none absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 justify-center px-2"
          />
        </div>
      </section>
    );
  },
);
