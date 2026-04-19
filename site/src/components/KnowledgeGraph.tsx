"use client";

import { useEffect, useRef, useState } from "react";
import type { Project, Researcher } from "@/lib/types";

/**
 * A live force-directed graph of the lab's researchers and projects.
 * No libraries — just a canvas and a tiny Verlet-ish spring simulation.
 *
 * Controls: drag nodes, pan the background, scroll/pinch to zoom,
 * hover to highlight neighbourhood. Clicking a node navigates.
 */

type NodeKind = "researcher" | "project";

interface GNode {
  id: string;
  kind: NodeKind;
  label: string;
  href: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
  degree: number;
  radius: number;
}

interface GEdge {
  source: string;
  target: string;
}

export function KnowledgeGraph({
  researchers,
  projects,
  className = "",
}: {
  researchers: Researcher[];
  projects: Project[];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<{
    nodes: GNode[];
    edges: GEdge[];
    nodeMap: Map<string, GNode>;
    hoverId: string | null;
    drag: { id: string; offX: number; offY: number } | null;
    pan: { x: number; y: number };
    scale: number;
    panning: { x: number; y: number } | null;
    mouse: { x: number; y: number };
  }>({
    nodes: [],
    edges: [],
    nodeMap: new Map(),
    hoverId: null,
    drag: null,
    pan: { x: 0, y: 0 },
    scale: 1,
    panning: null,
    mouse: { x: 0, y: 0 },
  });

  const [hoverLabel, setHoverLabel] = useState<{
    text: string;
    kind: NodeKind;
    x: number;
    y: number;
  } | null>(null);

  // ─── Build graph model ───────────────────────────────────
  useEffect(() => {
    const nodes: GNode[] = [];
    const edges: GEdge[] = [];
    const map = new Map<string, GNode>();

    const palette = {
      project: 240, // used as radius anchor
      researcher: 30,
    };

    projects.forEach((p, i) => {
      const angle = (i / Math.max(projects.length, 1)) * Math.PI * 2;
      const n: GNode = {
        id: `p:${p.id}`,
        kind: "project",
        label: p.name,
        href: `/research/${p.slug}`,
        x: Math.cos(angle) * 120,
        y: Math.sin(angle) * 120,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        degree: 0,
        radius: 14,
      };
      nodes.push(n);
      map.set(n.id, n);
    });

    researchers.forEach((r, i) => {
      const angle = (i / Math.max(researchers.length, 1)) * Math.PI * 2;
      const n: GNode = {
        id: `r:${r.id}`,
        kind: "researcher",
        label: r.name,
        href: `/team/${r.slug}`,
        x: Math.cos(angle) * 320 + (Math.random() - 0.5) * 40,
        y: Math.sin(angle) * 320 + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        degree: 0,
        radius: 4,
      };
      nodes.push(n);
      map.set(n.id, n);
    });

    // Edges: researcher → project (if researcher.projectIds contains project.id)
    researchers.forEach((r) => {
      r.projectIds.forEach((pid) => {
        if (map.has(`r:${r.id}`) && map.has(`p:${pid}`)) {
          edges.push({ source: `r:${r.id}`, target: `p:${pid}` });
          map.get(`r:${r.id}`)!.degree += 1;
          map.get(`p:${pid}`)!.degree += 1;
        }
      });
    });

    // Scale radii by degree (so heavy-hitters stand out).
    nodes.forEach((n) => {
      if (n.kind === "researcher") {
        n.radius = 3.5 + Math.min(n.degree * 0.6, 4);
      } else {
        n.radius = 12 + Math.min(n.degree * 0.3, 10);
      }
    });

    stateRef.current.nodes = nodes;
    stateRef.current.edges = edges;
    stateRef.current.nodeMap = map;

    // palette unused but kept for readability
    void palette;
  }, [researchers, projects]);

  // ─── Canvas + sim ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const state = stateRef.current;

    // Interactions ────────────────────────────────
    const screenToWorld = (sx: number, sy: number) => ({
      x: (sx - width / 2 - state.pan.x) / state.scale,
      y: (sy - height / 2 - state.pan.y) / state.scale,
    });

    const nodeAt = (wx: number, wy: number): GNode | null => {
      // Reverse so top-most (drawn last) wins.
      for (let i = state.nodes.length - 1; i >= 0; i--) {
        const n = state.nodes[i];
        const dx = wx - n.x;
        const dy = wy - n.y;
        const r = n.radius + 6 / state.scale;
        if (dx * dx + dy * dy <= r * r) return n;
      }
      return null;
    };

    const onPointerMove = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = ev.clientX - rect.left;
      const sy = ev.clientY - rect.top;
      state.mouse = { x: sx, y: sy };
      const { x: wx, y: wy } = screenToWorld(sx, sy);

      if (state.drag) {
        const dragging = state.nodeMap.get(state.drag.id);
        if (dragging) {
          dragging.fx = wx - state.drag.offX;
          dragging.fy = wy - state.drag.offY;
        }
        return;
      }
      if (state.panning) {
        state.pan.x += sx - state.panning.x;
        state.pan.y += sy - state.panning.y;
        state.panning = { x: sx, y: sy };
        return;
      }

      const hovered = nodeAt(wx, wy);
      state.hoverId = hovered?.id ?? null;
      canvas.style.cursor = hovered ? "pointer" : state.panning ? "grabbing" : "grab";
      if (hovered) {
        setHoverLabel({
          text: hovered.label,
          kind: hovered.kind,
          x: sx,
          y: sy,
        });
      } else {
        setHoverLabel(null);
      }
    };

    const onPointerDown = (ev: PointerEvent) => {
      canvas.setPointerCapture(ev.pointerId);
      const rect = canvas.getBoundingClientRect();
      const sx = ev.clientX - rect.left;
      const sy = ev.clientY - rect.top;
      const { x: wx, y: wy } = screenToWorld(sx, sy);
      const hit = nodeAt(wx, wy);
      if (hit) {
        state.drag = { id: hit.id, offX: wx - hit.x, offY: wy - hit.y };
        hit.fx = hit.x;
        hit.fy = hit.y;
      } else {
        state.panning = { x: sx, y: sy };
        canvas.style.cursor = "grabbing";
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      canvas.releasePointerCapture(ev.pointerId);
      if (state.drag) {
        const dragged = state.nodeMap.get(state.drag.id);
        const dx = ev.movementX;
        const dy = ev.movementY;
        // If the pointer barely moved, treat as a click → navigate.
        if (dragged && Math.abs(dx) < 2 && Math.abs(dy) < 2) {
          const rect = canvas.getBoundingClientRect();
          const { x: wx, y: wy } = screenToWorld(
            ev.clientX - rect.left,
            ev.clientY - rect.top,
          );
          const hit = nodeAt(wx, wy);
          if (hit && hit.id === dragged.id) {
            window.location.href = hit.href;
          }
        }
        if (dragged) {
          dragged.fx = null;
          dragged.fy = null;
        }
      }
      state.drag = null;
      state.panning = null;
      canvas.style.cursor = "grab";
    };

    const onPointerLeave = () => {
      state.drag = null;
      state.panning = null;
      state.hoverId = null;
      setHoverLabel(null);
      canvas.style.cursor = "grab";
    };

    const onWheel = (ev: WheelEvent) => {
      // Only zoom when pointer is over the canvas *and* shift/ctrl pressed
      // OR on devices where the gesture is clearly pinch-zoom.
      if (!ev.ctrlKey && !ev.metaKey && Math.abs(ev.deltaY) < 40) return;
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = ev.clientX - rect.left;
      const sy = ev.clientY - rect.top;
      const before = screenToWorld(sx, sy);
      const factor = Math.pow(1.0015, -ev.deltaY);
      state.scale = Math.min(3, Math.max(0.35, state.scale * factor));
      const after = screenToWorld(sx, sy);
      state.pan.x += (after.x - before.x) * state.scale;
      state.pan.y += (after.y - before.y) * state.scale;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointercancel", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.style.cursor = "grab";

    // Neighbour lookup for highlight ──────────────────
    const neighbourhood = (id: string): Set<string> => {
      const set = new Set<string>([id]);
      for (const e of state.edges) {
        if (e.source === id) set.add(e.target);
        else if (e.target === id) set.add(e.source);
      }
      return set;
    };

    // Simulation ────────────────────────────────────
    const tick = () => {
      const { nodes, edges, nodeMap } = state;
      const n = nodes.length;

      const centerStrength = 0.01;
      const repelStrength = 1400;
      const linkDistance = 80;
      const linkStrength = 0.06;
      const damping = 0.82;

      // Center gravity.
      for (let i = 0; i < n; i++) {
        const a = nodes[i];
        a.vx += -a.x * centerStrength;
        a.vy += -a.y * centerStrength;
      }

      // Repulsion (O(n^2) — fine for n<200).
      for (let i = 0; i < n; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < n; j++) {
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.01) {
            d2 = 0.01;
            dx = (Math.random() - 0.5) * 0.1;
            dy = (Math.random() - 0.5) * 0.1;
          }
          const d = Math.sqrt(d2);
          const f = repelStrength / d2;
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // Link springs.
      for (const e of edges) {
        const a = nodeMap.get(e.source);
        const b = nodeMap.get(e.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const diff = (d - linkDistance) * linkStrength;
        const fx = (dx / d) * diff;
        const fy = (dy / d) * diff;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // Integrate.
      for (let i = 0; i < n; i++) {
        const a = nodes[i];
        if (a.fx != null && a.fy != null) {
          a.x = a.fx;
          a.y = a.fy;
          a.vx = 0;
          a.vy = 0;
          continue;
        }
        a.vx *= damping;
        a.vy *= damping;
        // Clamp velocity.
        const cap = 12;
        if (a.vx > cap) a.vx = cap;
        if (a.vx < -cap) a.vx = -cap;
        if (a.vy > cap) a.vy = cap;
        if (a.vy < -cap) a.vy = -cap;
        a.x += a.vx;
        a.y += a.vy;
      }
    };

    const draw = () => {
      const { nodes, edges } = state;
      ctx.clearRect(0, 0, width, height);

      // Subtle grid that moves with the pan.
      ctx.save();
      ctx.strokeStyle = "rgba(237, 234, 229, 0.035)";
      ctx.lineWidth = 1;
      const spacing = 36 * state.scale;
      const ox = ((state.pan.x + width / 2) % spacing + spacing) % spacing;
      const oy = ((state.pan.y + height / 2) % spacing + spacing) % spacing;
      ctx.beginPath();
      for (let x = ox; x < width; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = oy; y < height; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(width / 2 + state.pan.x, height / 2 + state.pan.y);
      ctx.scale(state.scale, state.scale);

      const hoverSet = state.hoverId ? neighbourhood(state.hoverId) : null;

      // Edges.
      for (const e of edges) {
        const a = state.nodeMap.get(e.source);
        const b = state.nodeMap.get(e.target);
        if (!a || !b) continue;
        const highlighted =
          hoverSet && hoverSet.has(a.id) && hoverSet.has(b.id);
        ctx.strokeStyle = highlighted
          ? "rgba(240, 177, 90, 0.9)"
          : hoverSet
            ? "rgba(107, 102, 97, 0.12)"
            : "rgba(107, 102, 97, 0.32)";
        ctx.lineWidth = highlighted ? 1.4 : 0.7;
        ctx.beginPath();
        // Gentle curve — looks more organic than straight lines.
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / d;
        const ny = dx / d;
        const bend = Math.min(d * 0.08, 20);
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx + nx * bend, my + ny * bend, b.x, b.y);
        ctx.stroke();
      }

      // Nodes.
      for (const n of nodes) {
        const highlighted = hoverSet ? hoverSet.has(n.id) : false;
        const dim = hoverSet && !hoverSet.has(n.id);

        if (n.kind === "project") {
          const r = n.radius;
          // Halo.
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
          glow.addColorStop(0, "rgba(142, 227, 200, 0.28)");
          glow.addColorStop(1, "rgba(142, 227, 200, 0)");
          ctx.fillStyle = dim ? "rgba(142, 227, 200, 0.05)" : glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = dim
            ? "rgba(142, 227, 200, 0.25)"
            : highlighted
              ? "rgba(240, 177, 90, 1)"
              : "rgba(142, 227, 200, 0.92)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(14, 13, 12, 1)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Label for projects.
          ctx.fillStyle = dim
            ? "rgba(167, 161, 153, 0.3)"
            : "rgba(237, 234, 229, 0.9)";
          ctx.font = `500 11px var(--font-jetbrains-mono, ui-monospace), monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(n.label, n.x, n.y + r + 6);
        } else {
          ctx.fillStyle = dim
            ? "rgba(167, 161, 153, 0.2)"
            : highlighted
              ? "rgba(240, 177, 90, 1)"
              : "rgba(237, 234, 229, 0.92)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(14, 13, 12, 1)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const loop = () => {
      tick();
      draw();
      if (!reduceMotion) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    loop();

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointercancel", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} aria-label="Knowledge graph" role="img" />
      {hoverLabel && (
        <div
          className="pointer-events-none absolute z-10 px-3 py-2 bg-background/95 border border-border-strong backdrop-blur-sm"
          style={{
            left: hoverLabel.x + 14,
            top: hoverLabel.y + 14,
            transform: "translateZ(0)",
          }}
        >
          <span className="label-mono text-accent-pulse block">
            {hoverLabel.kind === "project" ? "Project" : "Researcher"}
          </span>
          <span className="font-display text-sm text-foreground block mt-0.5 max-w-xs">
            {hoverLabel.text}
          </span>
          <span className="label-mono text-text-dim block mt-1">
            Click to open →
          </span>
        </div>
      )}

      {/* Corner HUD */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
        <div className="label-mono text-text-dim">
          Network · R{researchers.length} · P{projects.length}
        </div>
        <div className="label-mono text-text-dim">
          Edges · {researchers.reduce((a, r) => a + r.projectIds.length, 0)}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="label-mono text-text-dim leading-relaxed">
          Drag nodes · Pan background · ⌘/Ctrl + scroll to zoom
        </div>
      </div>
      <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-4">
        <span className="flex items-center gap-1.5 label-mono text-text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-signal" />
          Project
        </span>
        <span className="flex items-center gap-1.5 label-mono text-text-muted">
          <span className="w-2 h-2 rounded-full bg-foreground" />
          Researcher
        </span>
      </div>
    </div>
  );
}
