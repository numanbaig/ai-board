"use client";

import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { SimulationBlock } from "@/lib/scispark/simulation-schema";
import { BoardLayer } from "./BoardLayer";
import { BlockNode } from "./BlockNode";
import { SelectedBlockToolbar } from "./SelectedBlockToolbar";

export const STAGE_ID = "scispark-stage";

const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2.75;
const ZOOM_STEP = 0.1;

function clampZoom(n: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(n * 10) / 10));
}

export type SimulationCanvasHandle = {
  getBounds: () => DOMRect | null;
  /** Focus selection on a block (e.g. after adding a text note). */
  selectBlock: (id: string) => void;
};

function clampPct(n: number) {
  return Math.min(98, Math.max(2, n));
}

type Props = {
  title: string;
  blocks: SimulationBlock[];
  onOpenPalette?: () => void;
  paletteOpen?: boolean;
  onPatchBlock?: (id: string, patch: Partial<SimulationBlock>) => void;
  onRemoveBlock?: (id: string) => void;
  onRemoveGroup?: (groupId: string) => void;
  onScaleSelection?: (id: string, factor: number) => void;
  /** Add a notebook-style text note at board coordinates (percent of stage). */
  onAddTextNoteAt?: (xPct: number, yPct: number) => void;
};

function DraggablePlacedBlock({
  block,
  isSelected,
  onSelectBlock,
  onPatchBlock,
}: {
  block: SimulationBlock;
  isSelected: boolean;
  onSelectBlock: (id: string) => void;
  onPatchBlock?: (id: string, patch: Partial<SimulationBlock>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `canvas:${block.id}`,
      data: { kind: "canvas" as const, blockId: block.id },
    });

  const dragTransform = transform ? CSS.Translate.toString(transform) : "";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-board-block
      onPointerDownCapture={() => onSelectBlock(block.id)}
      className={`absolute touch-none rounded-sm ${isDragging ? "z-[60]" : ""} ${
        isSelected ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent" : ""
      }`}
      style={{
        left: `${block.x}%`,
        top: `${block.y}%`,
        width: 0,
        height: 0,
        transform: `translate(-50%, -50%)${dragTransform ? ` ${dragTransform}` : ""}`,
        zIndex: (block.zIndex ?? 1) + (isDragging ? 40 : 0),
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <BlockNode block={block} embedded onPatchBlock={onPatchBlock} />
    </div>
  );
}

export const SimulationCanvas = forwardRef<SimulationCanvasHandle, Props>(
  function SimulationCanvas(
    {
      title,
      blocks,
      onOpenPalette,
      paletteOpen = true,
      onPatchBlock,
      onRemoveBlock,
      onRemoveGroup,
      onScaleSelection,
      onAddTextNoteAt,
    },
    ref,
  ) {
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [boardLocksBlocks, setBoardLocksBlocks] = useState(false);
    const [boardZoom, setBoardZoom] = useState(1);
    const stageRef = useRef<HTMLDivElement>(null);
    const zoomViewportRef = useRef<HTMLDivElement>(null);
    const [boardToolbarHost, setBoardToolbarHost] =
      useState<HTMLDivElement | null>(null);
    const { setNodeRef, isOver } = useDroppable({
      id: STAGE_ID,
      data: { kind: "stage" as const },
    });

    const setRefs = useCallback(
      (el: HTMLDivElement | null) => {
        setNodeRef(el);
        stageRef.current = el;
      },
      [setNodeRef],
    );

    useImperativeHandle(
      ref,
      () => ({
        getBounds: () => stageRef.current?.getBoundingClientRect() ?? null,
        selectBlock: (id: string) => setSelectedBlockId(id),
      }),
      [],
    );

    useEffect(() => {
      if (
        selectedBlockId &&
        !blocks.some((b) => b.id === selectedBlockId)
      ) {
        setSelectedBlockId(null);
      }
    }, [blocks, selectedBlockId]);

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedBlockId(null);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

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
    const selectedBlock =
      selectedBlockId != null
        ? (blocks.find((b) => b.id === selectedBlockId) ?? null)
        : null;

    return (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border-2 border-white/70 bg-gradient-to-br from-sky-100 via-indigo-50 to-fuchsia-100 p-2 shadow-inner sm:rounded-3xl sm:border-[3px] sm:p-2.5">
        <header className="mb-1 flex shrink-0 items-center justify-between gap-2 px-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            {!paletteOpen && onOpenPalette && (
              <button
                type="button"
                onClick={onOpenPalette}
                className="shrink-0 rounded-lg border border-indigo-200 bg-white/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-indigo-700 shadow-sm hover:bg-violet-50"
                title="Open block palette"
              >
                Blocks
              </button>
            )}
            {onAddTextNoteAt && (
              <button
                type="button"
                onClick={() => onAddTextNoteAt(50, 45)}
                className="shrink-0 rounded-lg border border-amber-300 bg-amber-50/95 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-950 shadow-sm hover:bg-amber-100"
                title="Add a writable note at the center of the board"
              >
                Write note
              </button>
            )}
            <h2 className="truncate text-sm font-black tracking-tight text-indigo-950 sm:text-base">
              {title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex items-center gap-0.5 rounded-lg border border-indigo-200/90 bg-white/90 p-0.5 shadow-sm">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-black text-indigo-800 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Zoom out"
                title="Zoom out"
                disabled={boardZoom <= ZOOM_MIN + 0.01}
                onClick={() =>
                  setBoardZoom((prev) => clampZoom(prev - ZOOM_STEP))
                }
              >
                −
              </button>
              <span className="min-w-[2.75rem] text-center text-[10px] font-black tabular-nums text-indigo-900">
                {Math.round(boardZoom * 100)}%
              </span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-black text-indigo-800 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-indigo-600 hover:bg-violet-100"
                title="Reset zoom (100%)"
                aria-label="Reset zoom to one hundred percent"
                onClick={() => setBoardZoom(1)}
              >
                1:1
              </button>
            </div>
            <span className="hidden rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm sm:inline">
              Board
            </span>
          </div>
        </header>
        {selectedBlock && onScaleSelection && onRemoveBlock && (
          <SelectedBlockToolbar
            block={selectedBlock}
            onSmaller={() => onScaleSelection(selectedBlock.id, 0.9)}
            onLarger={() => onScaleSelection(selectedBlock.id, 1.1)}
            onDelete={() => {
              onRemoveBlock(selectedBlock.id);
              setSelectedBlockId(null);
            }}
            onDeleteGroup={
              selectedBlock.groupId && onRemoveGroup
                ? () => {
                    if (
                      typeof window !== "undefined" &&
                      !window.confirm(
                        "Remove the whole grouped scene? This deletes every block in that group.",
                      )
                    ) {
                      return;
                    }
                    onRemoveGroup(selectedBlock.groupId!);
                    setSelectedBlockId(null);
                  }
                : undefined
            }
          />
        )}
        <div
          ref={zoomViewportRef}
          title="Ctrl or ⌘ + scroll wheel to zoom"
          className={`relative min-h-0 flex-1 overflow-auto rounded-xl border-2 border-dashed border-indigo-200/80 bg-slate-200/40 ${
            isOver ? "ring-2 ring-amber-300/80 sm:ring-4" : ""
          }`}
        >
          <div
            id={STAGE_ID}
            ref={setRefs}
            onPointerDownCapture={(e) => {
              const t = e.target as HTMLElement;
              if (t.closest("[data-board-block]")) return;
              setSelectedBlockId(null);
            }}
            onDoubleClick={(e) => {
              if (!onAddTextNoteAt) return;
              const el = e.target as HTMLElement;
              if (el.closest("[data-board-block]")) return;
              if (el.closest("[data-scispark-board-chrome]")) return;
              if (el.closest("[data-board-drawing-active]")) return;
              const rect = stageRef.current?.getBoundingClientRect();
              if (!rect?.width || !rect.height) return;
              const xPct = clampPct(
                ((e.clientX - rect.left) / rect.width) * 100,
              );
              const yPct = clampPct(
                ((e.clientY - rect.top) / rect.height) * 100,
              );
              onAddTextNoteAt(xPct, yPct);
            }}
            className="relative bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(224,231,255,0.9),transparent_50%),linear-gradient(160deg,#eef2ff,#fdf4ff)]"
            style={{
              width: invPct,
              height: invPct,
              minHeight: "100%",
              transform: `scale(${z})`,
              transformOrigin: "top left",
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(99,102,241,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div
              className={
                boardLocksBlocks
                  ? "pointer-events-none absolute inset-0 z-[1]"
                  : "absolute inset-0 z-[1]"
              }
            >
              {blocks.map((b) => (
                <DraggablePlacedBlock
                  key={b.id}
                  block={b}
                  isSelected={b.id === selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onPatchBlock={onPatchBlock}
                />
              ))}
            </div>
            <BoardLayer
              onInteractionLockChange={setBoardLocksBlocks}
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
