"use client";

import type { SimulationBlock } from "@/lib/scispark/simulation-schema";

type Props = {
  block: SimulationBlock;
  onSmaller: () => void;
  onLarger: () => void;
  onDelete: () => void;
  onDeleteGroup?: () => void;
};

export function SelectedBlockToolbar({
  block,
  onSmaller,
  onLarger,
  onDelete,
  onDeleteGroup,
}: Props) {
  return (
    <div
      className="mb-1 flex flex-wrap items-center gap-1 rounded-xl border border-indigo-200/90 bg-white/95 px-2 py-1 shadow-md backdrop-blur-sm"
      role="toolbar"
      aria-label="Selected object tools"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="mr-1 max-w-[120px] truncate text-[10px] font-bold text-slate-600">
        {block.type.replace(/-/g, " ")}
      </span>
      <button
        type="button"
        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-800 hover:bg-slate-100"
        onClick={(e) => {
          e.stopPropagation();
          onSmaller();
        }}
        title="Smaller"
      >
        Size −
      </button>
      <button
        type="button"
        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-800 hover:bg-slate-100"
        onClick={(e) => {
          e.stopPropagation();
          onLarger();
        }}
        title="Larger"
      >
        Size +
      </button>
      <span className="mx-0.5 h-4 w-px bg-slate-200" aria-hidden />
      <button
        type="button"
        className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-800 hover:bg-rose-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Remove this object"
      >
        Remove
      </button>
      {onDeleteGroup && (
        <button
          type="button"
          className="rounded-lg border border-rose-300 bg-white px-2 py-0.5 text-[10px] font-black text-rose-900 hover:bg-rose-50"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteGroup();
          }}
          title="Remove the whole grouped scene"
        >
          Remove group
        </button>
      )}
    </div>
  );
}
