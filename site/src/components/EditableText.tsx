"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { useAdmin } from "./AdminProvider";
import { saveTextOverride } from "@/lib/actions";
import { usePathname } from "next/navigation";

interface EditableTextProps {
  entity: string;
  entityId: string;
  field: string;
  value: string;
  multiline?: boolean;
  className?: string;
  as?: "p" | "span" | "h1" | "h2" | "h3";
}

export function EditableText({
  entity,
  entityId,
  field,
  value,
  multiline = false,
  className = "",
  as: Tag = "span",
}: EditableTextProps) {
  const isAdmin = useAdmin();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Update text if value prop changes (after revalidation)
  useEffect(() => {
    if (!editing) setText(value);
  }, [value, editing]);

  if (!isAdmin) {
    return <Tag className={className}>{text}</Tag>;
  }

  const handleSave = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await saveTextOverride(entity, entityId, field, text, pathname);
      if (result && "error" in result) {
        setError(result.error ?? "Save failed");
        return;
      }
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }, [entity, entityId, field, text, pathname, startTransition]);

  const handleCancel = useCallback(() => {
    setText(value);
    setError(null);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleCancel, handleSave, multiline]
  );

  if (editing) {
    return (
      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className={`w-full bg-surface border border-accent/40 rounded px-2 py-1 text-foreground focus:outline-none focus:border-accent resize-y ${className}`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full bg-surface border border-accent/40 rounded px-2 py-1 text-foreground focus:outline-none focus:border-accent ${className}`}
          />
        )}
        <div className="flex gap-2 mt-1 items-center">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-xs px-2 py-1 bg-foreground text-background rounded hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="text-xs px-2 py-1 text-text-muted hover:text-foreground"
          >
            Cancel
          </button>
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      </div>
    );
  }

  return (
    <Tag
      className={`${className} cursor-pointer border border-transparent hover:border-accent/30 hover:bg-accent/5 rounded px-1 -mx-1 transition-all duration-200`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {text}
      {saved && (
        <span className="ml-2 text-xs text-accent">Saved</span>
      )}
    </Tag>
  );
}
