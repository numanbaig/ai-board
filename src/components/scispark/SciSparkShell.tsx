"use client";

import {
  DndContext,
  type CollisionDetection,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";
import { useCallback, useRef, useState } from "react";
import type {
  SimulationBlock,
  SimulationSpec,
} from "@/lib/scispark/simulation-schema";
import { BLOCK_CATEGORIES } from "@/lib/scispark/block-catalog";
import { scaleBlockDimensions } from "@/lib/scispark/block-scale";
import { normalizeSimulationSpec } from "@/lib/scispark/spec-normalize";
import { AIPanel } from "./AIPanel";
import { ConceptPromptBar } from "./ConceptPromptBar";
import { BlockPalette } from "./BlockPalette";
import {
  STAGE_ID,
  SimulationCanvas,
  type SimulationCanvasHandle,
} from "./SimulationCanvas";

type ChatLine = { role: "user" | "assistant"; text: string };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Prefer pointer-inside droppables so the stage wins over nested draggables. */
const scisparkCollision: CollisionDetection = (args) => {
  const byPointer = pointerWithin(args);
  if (byPointer.length > 0) {
    return byPointer;
  }
  return rectIntersection(args);
};

const DEFAULT_BLOCK_SIZE: Record<string, [number, number]> = {
  "orbit-path": [180, 180],
  "number-line": [240, 64],
  "text-note": [200, 100],
  "concept-frame": [340, 220],
  "wave-strip": [200, 44],
  "flow-ribbon": [240, 72],
  "gradient-blob": [130, 110],
  "radiation-burst": [96, 96],
  "spring-link": [120, 40],
  "chain-steps": [220, 48],
  "dot-swarm": [150, 110],
  "grid-lattice": [130, 130],
  "flow-tube": [220, 40],
  "barrier-wall": [22, 130],
  protractor: [200, 100],
  "shape-block": [112, 80],
};

function defaultBlockForType(type: string, x: number, y: number): SimulationBlock {
  const cat = BLOCK_CATEGORIES.flatMap((c) => c.blocks).find((b) => b.type === type);
  const anim = cat?.defaultAnimation;
  const [dw, dh] = DEFAULT_BLOCK_SIZE[type] ?? [72, 64];
  const base: SimulationBlock = {
    id: `user-${type}-${Date.now()}`,
    type,
    x: clamp(x, 4, 96),
    y: clamp(y, 8, 92),
    width: dw,
    height: dh,
    ...(type === "concept-frame" ? { zIndex: 0 } : {}),
    props:
      type === "text-note"
        ? {
            text: "Tap to write…",
            fontSize: 14,
            ...(cat?.defaultProps ?? {}),
          }
        : cat?.defaultProps,
    animation:
      anim?.type === "orbit"
        ? { type: "orbit", radiusPx: anim.radiusPx ?? 70, durationSec: anim.durationSec ?? 10 }
        : anim?.type === "rotate"
          ? { type: "rotate", durationSec: anim.durationSec ?? 8 }
          : anim?.type === "fall"
            ? { type: "fall", heightPx: 140, durationSec: anim.durationSec ?? 2 }
            : anim?.type === "pulse"
              ? {
                  type: "pulse",
                  minScale: 1,
                  maxScale: 1.08,
                  durationSec: anim.durationSec ?? 2,
                }
              : undefined,
  };
  return base;
}

export function SciSparkShell() {
  const stageApiRef = useRef<SimulationCanvasHandle>(null);
  const [scene, setScene] = useState<SimulationSpec | null>(null);
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [lastMeta, setLastMeta] = useState<{
    usedDemo: boolean;
    provider: string | null;
  } | null>(null);
  const [dragType, setDragType] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith("palette:")) {
      setDragType(id.slice("palette:".length));
    } else {
      setDragType(null);
    }
  }, []);

  const patchBlock = useCallback((id: string, patch: Partial<SimulationBlock>) => {
    setScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map((b) => {
          if (b.id !== id) return b;
          const mergedProps =
            patch.props !== undefined
              ? { ...(b.props ?? {}), ...patch.props }
              : b.props;
          const { props: _p, ...rest } = patch;
          return { ...b, ...rest, props: mergedProps };
        }),
      };
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setScene((prev) => {
      if (!prev) return prev;
      return { ...prev, blocks: prev.blocks.filter((b) => b.id !== id) };
    });
  }, []);

  const removeGroup = useCallback((groupId: string) => {
    setScene((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.filter((b) => b.groupId !== groupId),
      };
    });
  }, []);

  const scaleSelection = useCallback((id: string, factor: number) => {
    setScene((prev) => {
      if (!prev) return prev;
      const sel = prev.blocks.find((b) => b.id === id);
      if (!sel) return prev;
      const members = sel.groupId
        ? prev.blocks.filter((b) => b.groupId === sel.groupId)
        : [sel];
      const ids = new Set(members.map((b) => b.id));
      return {
        ...prev,
        blocks: prev.blocks.map((b) =>
          ids.has(b.id) ? scaleBlockDimensions(b, factor) : b,
        ),
      };
    });
  }, []);

  const addTextNoteAt = useCallback((xPct: number, yPct: number) => {
    const id = `user-text-note-${Date.now()}`;
    const nb = { ...defaultBlockForType("text-note", xPct, yPct), id };
    setScene((prev) => {
      const base =
        prev ??
        ({
          title: "My experiment",
          explanationSteps: ["You added a note on the board!"],
          blocks: [],
        } as SimulationSpec);
      return { ...base, blocks: [...base.blocks, nb] };
    });
    setActiveStep(0);
    requestAnimationFrame(() => {
      stageApiRef.current?.selectBlock(id);
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta, over } = event;
    setDragType(null);
    const rect = stageApiRef.current?.getBounds() ?? null;
    if (!rect) return;

    const data = active.data.current as
      | { kind: "palette"; blockType: string }
      | { kind: "canvas"; blockId: string }
      | undefined;

    if (data?.kind === "palette" && over?.id === STAGE_ID) {
      const start = getEventCoordinates(event.activatorEvent);
      if (!start) return;
      const endX = start.x + delta.x;
      const endY = start.y + delta.y;
      const x = ((endX - rect.left) / rect.width) * 100;
      const y = ((endY - rect.top) / rect.height) * 100;
      const nb = defaultBlockForType(data.blockType, x, y);
      setScene((prev) => {
        const base =
          prev ??
          ({
            title: "My experiment",
            explanationSteps: ["You placed a new block on the stage!"],
            blocks: [],
          } as SimulationSpec);
        return { ...base, blocks: [...base.blocks, nb] };
      });
      setActiveStep(0);
      return;
    }

    if (data?.kind === "canvas") {
      const stillOnStage =
        over?.id === STAGE_ID ||
        (event.collisions?.some((c) => c.id === STAGE_ID) ?? false) ||
        over == null;

      if (!stillOnStage) {
        return;
      }

      const bid = data.blockId;
      const dxPct = (delta.x / rect.width) * 100;
      const dyPct = (delta.y / rect.height) * 100;
      if (dxPct === 0 && dyPct === 0) {
        return;
      }

      setScene((prev) => {
        if (!prev) return prev;
        const moved = prev.blocks.find((b) => b.id === bid);
        const gid = moved?.groupId;
        const shift = (b: (typeof prev.blocks)[0]) => ({
          ...b,
          x: clamp(b.x + dxPct, 2, 98),
          y: clamp(b.y + dyPct, 2, 98),
        });
        return {
          ...prev,
          blocks: prev.blocks.map((b) => {
            if (gid) {
              return b.groupId === gid ? shift(b) : b;
            }
            return b.id === bid ? shift(b) : b;
          }),
        };
      });
    }
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      setMessages((m) => [...m, { role: "user", text }]);
      setLoading(true);
      try {
        const historyForApi = messages.slice(-8).map((x) => ({
          role: x.role,
          content: x.text,
        }));
        const res = await fetch("/api/scispark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: historyForApi,
          }),
        });
        const data = (await res.json()) as {
          spec?: SimulationSpec;
          error?: string;
          hint?: string;
          meta?: {
            usedDemo: boolean;
            provider: string | null;
            warning?: string;
          };
        };
        if (!res.ok) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: `Oops: ${data.error ?? "Something went wrong."}${data.hint ? ` — ${data.hint}` : ""}`,
            },
          ]);
          return;
        }
        if (data.spec) {
          setScene(normalizeSimulationSpec(data.spec));
          setActiveStep(0);
          setLastMeta(
            data.meta ?? {
              usedDemo: false,
              provider: null,
            },
          );
          const first = data.spec.explanationSteps[0] ?? data.spec.title;
          const reply = data.meta?.warning
            ? `${data.meta.warning}\n\n${first}`
            : first;
          setMessages((m) => [...m, { role: "assistant", text: reply }]);
        }
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: "Network error. Try again in a moment." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages],
  );

  const title = scene?.title ?? "SciSpark Stage";
  const blocks = scene?.blocks ?? [];
  const steps = scene?.explanationSteps ?? [];
  const highlight =
    steps.length > 0 ? steps[clamp(activeStep, 0, steps.length - 1)] : "";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={scisparkCollision}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <div className="relative flex min-h-0 min-w-0 flex-1 gap-2">
            <div
              className={`flex shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-out ${
                paletteOpen ? "w-[min(252px,82vw)]" : "w-0"
              }`}
              aria-hidden={!paletteOpen}
            >
              <div className="flex h-full min-h-0 w-[min(252px,82vw)] flex-col">
                <BlockPalette
                  onClose={() => setPaletteOpen(false)}
                  onAddTextNote={() => addTextNoteAt(50, 45)}
                />
              </div>
            </div>

            {!paletteOpen && (
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-xl border border-l-0 border-indigo-200/90 bg-white/95 py-2.5 pl-1 pr-2 text-[10px] font-black uppercase tracking-wide text-indigo-800 shadow-md backdrop-blur-sm hover:bg-violet-50"
                title="Open blocks"
              >
                Blocks ▶
              </button>
            )}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-2">
                <SimulationCanvas
                  ref={stageApiRef}
                  title={title}
                  blocks={blocks}
                  activeStep={activeStep}
                  backdrop={scene?.backdrop}
                  onOpenPalette={() => setPaletteOpen(true)}
                  paletteOpen={paletteOpen}
                  onPatchBlock={patchBlock}
                  onRemoveBlock={removeBlock}
                  onRemoveGroup={removeGroup}
                  onScaleSelection={scaleSelection}
                  onAddTextNoteAt={addTextNoteAt}
                />
                <AIPanel
                  messages={messages}
                  onSend={handleSend}
                  loading={loading}
                  activeStep={activeStep}
                  totalSteps={steps.length}
                  onStepChange={setActiveStep}
                  lastMeta={lastMeta}
                  showComposer={false}
                />
              </div>
              <ConceptPromptBar onSend={handleSend} loading={loading} />
            </div>
          </div>
          {highlight && (
            <div className="shrink-0 rounded-xl border border-amber-200/90 bg-amber-50/95 px-3 py-1.5 text-center text-xs font-bold leading-snug text-amber-950 shadow-sm line-clamp-2">
              {highlight}
            </div>
          )}
        </div>
        <DragOverlay dropAnimation={null}>
          {dragType ? (
            <div className="rounded-xl border-2 border-amber-300 bg-white px-3 py-2 text-xs font-black capitalize shadow-lg">
              {dragType.replace(/-/g, " ")}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
