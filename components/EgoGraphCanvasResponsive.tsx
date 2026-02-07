"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Level = 1 | 2 | 3 | 4;

export type EgoNode = {
  id: string;
  name: string;
  level: Level;
};

type Props = {
  centerName: string;
  centerSub?: string;
  nodes: EgoNode[];
  ringCount?: 2 | 3;

  /** 반응형 크기 제어 */
  maxSize?: number;      // 기본 420
  minSize?: number;      // 기본 280
  aspect?: number;       // 정사각=1, 0.9면 약간 납작
}; 

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  4: { label: "좋음", color: "#2ECC71" },
  3: { label: "무난", color: "#66D9C1" },
  2: { label: "번역필요", color: "#F4B740" },
  1: { label: "주의", color: "#FF6B8A" },
};

function clampNodes(nodes: EgoNode[], max = 20) {
  return nodes.length <= max ? nodes : nodes.slice(0, max);
}

function groupByLevel(nodes: EgoNode[]) {
  const g: Record<Level, EgoNode[]> = { 1: [], 2: [], 3: [], 4: [] };
  nodes.forEach((n) => g[n.level].push(n));
  return g;
}

function mapToRings(nodes: EgoNode[], ringCount: 2 | 3) {
  const by = groupByLevel(nodes);
  if (ringCount === 3) return [[...by[4], ...by[3]], [...by[2]], [...by[1]]];
  return [[...by[4], ...by[3]], [...by[2], ...by[1]]];
}

function layoutOnRing(items: EgoNode[], radius: number, startAngle: number) {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return a.name.localeCompare(b.name);
  });

  const weights = sorted.map((n) => {
    const len = n.name.length;
    return Math.min(1.8, Math.max(1, 0.85 + len * 0.12));
  });
  const totalW = weights.reduce((a, b) => a + b, 0);
  const twoPi = Math.PI * 2;

  const crowdBoost = Math.min(0.35, sorted.length * 0.012);
  const gaps = weights.map((w) => (w / totalW) * twoPi);

  let a = startAngle;
  const out: Array<EgoNode & { x: number; y: number; angle: number }> = [];
  for (let i = 0; i < sorted.length; i++) {
    const delta = gaps[i] * (1 - crowdBoost);
    const mid = a + delta / 2;
    out.push({
      ...sorted[i],
      angle: mid,
      x: Math.cos(mid) * radius,
      y: Math.sin(mid) * radius,
    });
    a += delta;
  }
  return out;
}

type Placed = EgoNode & { x: number; y: number; ringIndex: number; r: number };

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function dist2(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/** 컨테이너 크기 측정 (ResizeObserver) */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setW(cr.width);
      setH(cr.height);
    });
    ro.observe(el);
    // initial
    const rect = el.getBoundingClientRect();
    setW(rect.width);
    setH(rect.height);

    return () => ro.disconnect();
  }, []);

  return { ref, w, h };
}

export default function EgoGraphCanvasResponsive({
  centerName,
  centerSub,
  nodes,
  ringCount = 3,
  maxSize = 420,
  minSize = 280,
  aspect = 1,
}: Props) {
  const { ref: wrapRef, w: wrapW } = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);

  // pan/zoom
  const viewRef = useRef({ panX: 0, panY: 0, scale: 1 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    startDist: 0,
    startScale: 1,
    startMidX: 0,
    startMidY: 0,
  });

  const safeNodes = useMemo(() => clampNodes(nodes, 20), [nodes]);

  // 반응형 size 결정: 컨테이너 폭을 기준으로 min~max 사이로 clamp
  const size = useMemo(() => {
    const raw = Math.floor(wrapW || maxSize);
    const clamped = Math.max(minSize, Math.min(maxSize, raw));
    return clamped;
  }, [wrapW, maxSize, minSize]);

  const height = Math.floor(size * aspect);

  const placed: Placed[] = useMemo(() => {
    const rings = mapToRings(safeNodes, ringCount);

    const base = size * 0.19;
    const step = size * 0.18;
    const ringR = ringCount === 3 ? [base, base + step, base + step * 2] : [base, base + step * 1.4];
    const starts =
      ringCount === 3
        ? [-Math.PI / 2, -Math.PI / 2 + 0.4, -Math.PI / 2 + 0.15]
        : [-Math.PI / 2, -Math.PI / 2 + 0.25];

    const all: Placed[] = [];
    rings.forEach((items, idx) => {
      const p = layoutOnRing(items, ringR[idx], starts[idx]);
      p.forEach((n) => all.push({ ...n, ringIndex: idx, r: ringR[idx] }));
    });
    return all;
  }, [safeNodes, ringCount, size]);

  // 렌더 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    canvas.style.width = "100%";
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 리사이즈 때마다 보기 좋은 기본값으로 살짝 리셋(과한 확대/이동 방지)
    viewRef.current.panX = 0;
    viewRef.current.panY = 0;
    viewRef.current.scale = 1;

    const draw = () => {
      const { panX, panY, scale } = viewRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 배경
      ctx.fillStyle = "#F6FBFF";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#F4FFF9";
      ctx.fillRect(0, h * 0.45, w, h * 0.55);
      ctx.globalAlpha = 1;

      const cx = w / 2 + panX * dpr;
      const cy = h / 2 + panY * dpr;

      const toScreen = (wx: number, wy: number) => ({
        x: cx + wx * scale * dpr,
        y: cy + wy * scale * dpr,
      });

      // 원 크기(조금 더 작게: “너무 커” 방지)
      const centerR = size * 0.07 * scale * dpr;
      const nodeR = size * 0.048 * scale * dpr;

      // 링 가이드
      const ringsR = Array.from(new Set(placed.map((p) => p.r))).sort((a, b) => a - b);
      ctx.strokeStyle = "rgba(0,0,0,0.04)";
      ctx.lineWidth = 2 * dpr;
      ringsR.forEach((rr) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rr * scale * dpr, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 선
      placed.forEach((n) => {
        const p = toScreen(n.x, n.y);
        const isActive = activeId === n.id;
        const col = LEVEL_META[n.level].color;

        ctx.strokeStyle = col;
        ctx.globalAlpha = isActive ? 0.95 : 0.30;
        ctx.lineWidth = (isActive ? 5 : 3) * dpr;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // 중앙
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#111827";
      ctx.font = `${Math.round(size * 0.04 * scale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
      ctx.fillText(centerName, cx, cy - 2 * dpr);

      if (centerSub) {
        ctx.fillStyle = "rgba(17,24,39,0.55)";
        ctx.font = `${Math.round(size * 0.028 * scale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillText(centerSub, cx, cy + centerR * 0.55);
      }

      // 노드
      placed.forEach((n) => {
        const p = toScreen(n.x, n.y);
        const isActive = activeId === n.id;
        const meta = LEVEL_META[n.level];

        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = (isActive ? 6 : 4) * dpr;

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 라벨
        const label = n.name.length > 4 ? `${n.name.slice(0, 3)}…` : n.name;
        ctx.fillStyle = "#111827";
        ctx.font = `${Math.round(size * 0.032 * scale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillText(label, p.x, p.y + 0.5 * dpr);
      });

      // 툴팁
      const active = activeId ? placed.find((p) => p.id === activeId) : null;
      if (active) {
        const boxW = size * 0.42 * dpr;
        const boxH = size * 0.095 * dpr;
        const x = w / 2 - boxW / 2;
        const y = h - size * 0.14 * dpr;

        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "rgba(0,0,0,0.10)";
        ctx.lineWidth = 2 * dpr;
        roundRect(ctx, x, y, boxW, boxH, 14 * dpr);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#111827";
        ctx.font = `${Math.round(size * 0.03 * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillText(`${active.name} · ${active.level} ${LEVEL_META[active.level].label}`, w / 2, y + boxH / 2);
      }
    };

    let raf = 0;
    const tick = () => {
      draw();
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(raf);
  }, [activeId, placed, centerName, centerSub, size, height]);

  // hit test
  const hitTest = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    const sx = (clientX - rect.left) * dpr;
    const sy = (clientY - rect.top) * dpr;

    const { panX, panY, scale } = viewRef.current;
    const cx = canvas.width / 2 + panX * dpr;
    const cy = canvas.height / 2 + panY * dpr;

    const nodeR = size * 0.048 * scale * dpr;
    const hitR2 = (nodeR * 1.3) * (nodeR * 1.3);

    for (const n of placed) {
      const px = cx + n.x * scale * dpr;
      const py = cy + n.y * scale * dpr;
      if (dist2(sx, sy, px, py) <= hitR2) return n.id;
    }
    return null;
  };

  // pointer handlers
  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 1손: 드래그, 2손: 핀치
    if (pointersRef.current.size === 1) {
      gestureRef.current.dragging = true;
      gestureRef.current.lastX = e.clientX;
      gestureRef.current.lastY = e.clientY;
    } else if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      gestureRef.current.startDist = Math.hypot(dx, dy);
      gestureRef.current.startScale = viewRef.current.scale;
      gestureRef.current.startMidX = (pts[0].x + pts[1].x) / 2;
      gestureRef.current.startMidY = (pts[0].y + pts[1].y) / 2;
      gestureRef.current.dragging = false;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // pinch
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);

      const ratio = dist / Math.max(1, gestureRef.current.startDist);
      const nextScale = Math.max(0.75, Math.min(2.2, gestureRef.current.startScale * ratio));

      // 핀치 중심 기준으로 pan 보정(손가락 위치가 덜 튐)
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const beforeX = midX - cx;
      const beforeY = midY - cy;

      const k = nextScale / viewRef.current.scale - 1;
      viewRef.current.panX -= beforeX * k;
      viewRef.current.panY -= beforeY * k;

      viewRef.current.scale = nextScale;
      return;
    }

    // drag pan
    if (gestureRef.current.dragging) {
      const dx = e.clientX - gestureRef.current.lastX;
      const dy = e.clientY - gestureRef.current.lastY;
      gestureRef.current.lastX = e.clientX;
      gestureRef.current.lastY = e.clientY;
      viewRef.current.panX += dx;
      viewRef.current.panY += dy;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size === 1) {
      const pt = Array.from(pointersRef.current.values())[0];
      gestureRef.current.dragging = true;
      gestureRef.current.lastX = pt.x;
      gestureRef.current.lastY = pt.y;
    } else if (pointersRef.current.size === 0) {
      gestureRef.current.dragging = false;
    }
  };

  // 클릭(탭)
  const onClick = (e: React.MouseEvent) => {
    const id = hitTest(e.clientX, e.clientY);
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        maxWidth: maxSize,
        minWidth: minSize,
        margin: "0 auto",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        style={{
          width: "100%",
          height: `${height}px`,
          borderRadius: 18,
          display: "block",
          touchAction: "none",
        }}
      />
    </div>
  );
}