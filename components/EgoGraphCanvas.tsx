"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Level = 1 | 2 | 3 | 4;

export type EgoNode = {
  id: string;
  name: string;
  level: Level; // 4 좋음, 3 무난, 2 번역필요, 1 주의
};

type Props = {
  centerName: string;
  centerSub?: string; // 예: ENFP
  nodes: EgoNode[]; // 최대 20 권장
  size?: number; // 정사각 캔버스 px
  ringCount?: 2 | 3;
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

/**
 * 링 분배:
 * - 3링: (4/3) / (2) / (1)
 * - 2링: (4/3) / (2/1)
 */
function mapToRings(nodes: EgoNode[], ringCount: 2 | 3) {
  const by = groupByLevel(nodes);
  if (ringCount === 3) return [[...by[4], ...by[3]], [...by[2]], [...by[1]]];
  return [[...by[4], ...by[3]], [...by[2], ...by[1]]];
}

/**
 * 링 안에서 라벨 겹침 체감 줄이는 가중 각도 배치
 */
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

type Placed = EgoNode & {
  x: number; // world 좌표(중심 기준)
  y: number;
  ringIndex: number;
  r: number;
};

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

export default function EgoGraphCanvas({
  centerName,
  centerSub,
  nodes,
  size = 520,
  ringCount = 3,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // pan/zoom state (world -> screen)
  const viewRef = useRef({
    // 화면 기준 오프셋(px)
    panX: 0,
    panY: 0,
    // world 스케일
    scale: 1,
  });

  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    // pinch
    pinching: false,
    startDist: 0,
    startScale: 1,
    // pinch center
    startMidX: 0,
    startMidY: 0,
  });

  const safeNodes = useMemo(() => clampNodes(nodes, 20), [nodes]);

  const placed: Placed[] = useMemo(() => {
    const rings = mapToRings(safeNodes, ringCount);

    // world 기준 링 반지름(=중앙에서 거리)
    const s = size;
    const base = s * 0.19;
    const step = s * 0.18;

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

  // ---- Render (Canvas) ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    // CSS size는 size, 실제 drawing buffer는 size*dpr
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // draw util
    const draw = () => {
      const { panX, panY, scale } = viewRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 배경
      // (그라데이션 흉내: 위/아래로 약간 다른 톤)
      ctx.fillStyle = "#F6FBFF";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#F4FFF9";
      ctx.fillRect(0, h * 0.45, w, h * 0.55);
      ctx.globalAlpha = 1;

      // 월드 -> 스크린 변환:
      // 화면 중심 + pan + scale*(world)
      const cx = w / 2 + panX * dpr;
      const cy = h / 2 + panY * dpr;

      const toScreen = (wx: number, wy: number) => ({
        x: cx + wx * scale * dpr,
        y: cy + wy * scale * dpr,
      });

      // 크기(스케일에 따라 시각적으로 같이 커지게)
      const centerR = size * 0.048 * scale * dpr;
      const nodeR = size * 0.07 * scale * dpr;

      // 링 가이드
      const ringsR = Array.from(new Set(placed.map((p) => p.r))).sort((a, b) => a - b);
      ctx.strokeStyle = "rgba(0,0,0,0.04)";
      ctx.lineWidth = 2 * dpr;
      ringsR.forEach((rr) => {
        const r = rr * scale * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 선
      placed.forEach((n) => {
        const p = toScreen(n.x, n.y);
        const isActive = activeId === n.id;
        const col = LEVEL_META[n.level].color;

        ctx.strokeStyle = col;
        ctx.globalAlpha = isActive ? 0.95 : 0.35;
        ctx.lineWidth = (isActive ? 5 : 3) * dpr;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // 중앙 노드
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 중앙 텍스트
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${Math.round(size * 0.04 * scale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
      ctx.fillText(centerName, cx, cy - 2 * dpr);

      if (centerSub) {
        ctx.fillStyle = "rgba(17,24,39,0.55)";
        ctx.font = `${Math.round(size * 0.028 * scale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillText(centerSub, cx, cy + centerR * 0.5);
      }

      // 주변 노드
      placed.forEach((n) => {
        const p = toScreen(n.x, n.y);
        const isActive = activeId === n.id;
        const meta = LEVEL_META[n.level];

        // 원
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = (isActive ? 6 : 4) * dpr;

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 작은 점(상단)
        ctx.fillStyle = "rgba(31,41,55,0.8)";
        ctx.beginPath();
        ctx.arc(p.x + nodeR * 0.62, p.y - nodeR * 0.62, nodeR * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // 이름(4글자 넘어가면 줄임)
        const label = n.name.length > 4 ? `${n.name.slice(0, 3)}…` : n.name;
        ctx.fillStyle = "#111827";
        ctx.font = `${Math.round(size * 0.032 * scale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillText(label, p.x, p.y + 0.5 * dpr);
      });

      // 하단 툴팁
      const active = activeId ? placed.find((p) => p.id === activeId) : null;
      if (active) {
        const boxW = size * 0.38 * dpr;
        const boxH = size * 0.09 * dpr;
        const x = w / 2 - boxW / 2;
        const y = h - size * 0.15 * dpr;

        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "rgba(0,0,0,0.10)";
        ctx.lineWidth = 2 * dpr;
        roundRect(ctx, x, y, boxW, boxH, 14 * dpr);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#111827";
        ctx.font = `${Math.round(size * 0.03 * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillText(
          `${active.name} · ${active.level} ${LEVEL_META[active.level].label}`,
          w / 2,
          y + boxH / 2
        );
      }
    };

    // 초기 스케일 살짝 키워서 “원이 작아” 문제 줄임
    viewRef.current.scale = 1;

    let raf = 0;
    const tick = () => {
      draw();
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(raf);
  }, [activeId, placed, centerName, centerSub, size]);

  // ---- Hit test (tap) ----
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

    const nodeR = size * 0.06 * scale * dpr;
    const hitR2 = (nodeR * 1.25) * (nodeR * 1.25);

    // screen 좌표로 변환해서 거리 체크
    for (const n of placed) {
      const px = cx + n.x * scale * dpr;
      const py = cy + n.y * scale * dpr;
      if (dist2(sx, sy, px, py) <= hitR2) return n.id;
    }
    return null;
  };

  // ---- Pointer events (pan + pinch) ----
  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const g = gestureRef.current;
    if (pointersRef.current.size === 1) {
      g.dragging = true;
      g.lastX = e.clientX;
      g.lastY = e.clientY;
    } else if (pointersRef.current.size === 2) {
      // pinch start
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      g.pinching = true;
      g.startDist = Math.hypot(dx, dy);
      g.startScale = viewRef.current.scale;
      g.startMidX = (pts[0].x + pts[1].x) / 2;
      g.startMidY = (pts[0].y + pts[1].y) / 2;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const g = gestureRef.current;

    // pinch
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);

      const ratio = dist / Math.max(1, g.startDist);
      const nextScale = Math.max(0.65, Math.min(2.2, g.startScale * ratio));

      // 핀치 중심을 기준으로 줌(고급: world 중심 보정)
      // 여기서는 체감 좋게 pan을 약간 보정해줌
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;

      const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();

      // 화면 중심 대비 이동량을 pan에 반영
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const beforeX = (midX - cx);
      const beforeY = (midY - cy);

      // scale 변화에 따른 pan 조절(핀치 위치가 “붙어있게”)
      const k = (nextScale / viewRef.current.scale) - 1;
      viewRef.current.panX -= beforeX * k;
      viewRef.current.panY -= beforeY * k;

      viewRef.current.scale = nextScale;
      return;
    }

    // drag pan
    if (g.dragging) {
      const dx = e.clientX - g.lastX;
      const dy = e.clientY - g.lastY;
      g.lastX = e.clientX;
      g.lastY = e.clientY;
      viewRef.current.panX += dx;
      viewRef.current.panY += dy;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);

    const g = gestureRef.current;
    if (pointersRef.current.size === 0) {
      g.dragging = false;
      g.pinching = false;
    } else if (pointersRef.current.size === 1) {
      // pinch 끝나고 1개 남으면 다시 drag 모드
      const pt = Array.from(pointersRef.current.values())[0];
      g.dragging = true;
      g.pinching = false;
      g.lastX = pt.x;
      g.lastY = pt.y;
    }
  };

  // tap (클릭)
  const onClick = (e: React.MouseEvent) => {
    // 드래그 후 클릭 오작동을 줄이려면 threshold도 넣을 수 있음(필요하면 말해줘)
    const id = hitTest(e.clientX, e.clientY);
    setActiveId((prev) => (prev === id ? null : id));
  };

  // wheel zoom (데스크탑)
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.06 : 0.94;
    const next = Math.max(0.65, Math.min(2.2, viewRef.current.scale * factor));
    viewRef.current.scale = next;
  };

  return (
    <div style={{ width: size, maxWidth: "100%", touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        onWheel={onWheel}
        style={{
          width: size,
          height: size,
          borderRadius: 18,
          display: "block",
          background: "transparent",
        }}
      />
    </div>
  );
}