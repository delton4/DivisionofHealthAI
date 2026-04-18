"use client";

import { useState, useTransition } from "react";

interface RestoreRowProps {
  label: string;
  onRestore: () => Promise<unknown>;
}

export function RestoreRow({ label, onRestore }: RestoreRowProps) {
  const [isPending, startTransition] = useTransition();
  const [restored, setRestored] = useState(false);
  if (restored) return null;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-text-muted truncate">{label}</span>
      <button
        onClick={() =>
          startTransition(async () => {
            await onRestore();
            setRestored(true);
          })
        }
        disabled={isPending}
        className="text-xs text-accent hover:text-foreground transition-colors shrink-0 disabled:opacity-50"
      >
        {isPending ? "Restoring..." : "Restore"}
      </button>
    </div>
  );
}
