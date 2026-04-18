"use client";

import { useState, useTransition } from "react";

interface ConfirmButtonProps {
  label: string;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown>;
  className?: string;
}

export function ConfirmButton({
  label,
  confirmLabel = "Confirm?",
  onConfirm,
  className = "text-xs text-text-muted hover:text-accent-warm transition-colors shrink-0 disabled:opacity-50",
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return null;

  if (confirming) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() =>
            startTransition(async () => {
              await onConfirm();
              setDone(true);
            })
          }
          disabled={isPending}
          className="text-xs text-accent-warm hover:text-foreground transition-colors disabled:opacity-50"
        >
          {isPending ? "Working..." : confirmLabel}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-text-muted"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className={className}>
      {label}
    </button>
  );
}
