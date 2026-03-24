"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_CATEGORIES } from "@/lib/scispark/block-catalog";

function PaletteItem({
  type,
  label,
  emoji,
}: {
  type: string;
  label: string;
  emoji: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette:${type}`,
      data: { kind: "palette" as const, blockType: type },
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`flex w-full items-center gap-2 rounded-xl border-2 border-white/80 bg-white/90 px-2 py-1.5 text-left shadow-sm transition hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
        isDragging ? "z-50 opacity-70 ring-2 ring-amber-400" : ""
      }`}
    >
      <span className="text-lg" aria-hidden>
        {emoji}
      </span>
      <span className="text-[11px] font-bold text-slate-800">{label}</span>
    </button>
  );
}

type Props = {
  onClose?: () => void;
  /** Add a centered writable note without dragging from the palette. */
  onAddTextNote?: () => void;
};

export function BlockPalette({ onClose, onAddTextNote }: Props) {
  return (
    <aside className="flex h-full min-h-0 w-full max-w-[252px] flex-col gap-2 rounded-2xl border-2 border-white/70 bg-white/50 p-2 shadow-lg backdrop-blur-md">
      <div className="flex shrink-0 items-start justify-between gap-1 border-b border-violet-100/80 pb-1.5">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-violet-600">
            Blocks
          </p>
          <h2 className="text-sm font-black text-slate-900">Palette</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm hover:bg-slate-50"
            title="Hide palette"
            aria-label="Close blocks drawer"
          >
            ✕
          </button>
        )}
      </div>
      {onAddTextNote && (
        <button
          type="button"
          onClick={onAddTextNote}
          className="shrink-0 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-2.5 py-2 text-left shadow-sm transition hover:from-amber-100 hover:to-yellow-100"
        >
          <span className="text-[10px] font-black uppercase tracking-wide text-amber-900">
            Write on the board
          </span>
          <span className="mt-0.5 block text-[10px] font-medium text-amber-950/90">
            Adds a note you can type in (also: double-click empty board in hand
            mode)
          </span>
        </button>
      )}
      <p className="shrink-0 text-[10px] font-medium leading-snug text-slate-600">
        Drag blocks onto the stage, or use Write on the board / Write note.
      </p>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5 pb-1">
        {BLOCK_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <div
              className={`mb-1.5 rounded-md bg-gradient-to-r ${cat.color} px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm`}
            >
              {cat.title}
            </div>
            <div className="flex flex-col gap-1">
              {cat.blocks.map((b) => (
                <PaletteItem
                  key={b.type}
                  type={b.type}
                  label={b.label}
                  emoji={b.emoji}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
