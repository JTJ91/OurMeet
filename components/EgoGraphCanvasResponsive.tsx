"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Level = 1 | 2 | 3 | 4 | 5;

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

  maxSize?: number;
  minSize?: number;
  aspect?: number;
};

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  5: { label: "찰떡궁합", color: "#1E88E5" }, // (네가 바꾼 룰: 5=파랑)
  4: { label: "합좋은편", color: "#00C853" }, // 4=초록
  3: { label: "그럭저럭", color: "#FDD835" },
  2: { label: "조율필요", color: "#FB8C00" },
  1: { label: "한계임박", color: "#D50000" },
};

function clampNodes(nodes: EgoNode[], max = 20) {
  return nodes.length <= max ? nodes : nodes.slice(0, max);
}

function groupByLevel(nodes: EgoNode[]) {
  const g: Record<Level, EgoNode[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  nodes.forEach((n) => g[n.level].push(n));
  return g;
}

function mapToRings(nodes: EgoNode[], ringCount: 2 | 3) {
  const by = groupByLevel(nodes);

  if (ringCount === 3) {
    return [
      [...by[5], ...by[4]],
      [...by[3]],
      [...by[2], ...by[1]],
    ];
  }
  return [[...by[5], ...by[4], ...by[3]], [...by[2], ...by[1]]];
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setW(cr.width);
    });
    ro.observe(el);

    const rect = el.getBoundingClientRect();
    setW(rect.width);

    return () => ro.disconnect();
  }, []);

  return { ref, w };
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

  const safeNodes = useMemo(() => clampNodes(nodes, 20), [nodes]);

  const size = useMemo(() => {
    const raw = Math.floor(wrapW || maxSize);
    return Math.max(minSize, Math.min(maxSize, raw));
  }, [wrapW, maxSize, minSize]);

  const height = Math.floor(size * aspect);

  const placed: Placed[] = useMemo(() => {
    const rings = mapToRings(safeNodes, ringCount);

    const base = size * 0.19;
    const step = size * 0.18;
    const ringR =
      ringCount === 3
        ? [base, base + step, base + step * 2]
        : [base, base + step * 1.4];

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

  // ✅ “바깥 노드까지 딱 들어오게” 자동 스케일 계산
  const getFitScale = (canvasWpx: number, canvasHpx: number, dpr: number) => {
    // 노드 반지름(월드 기준)을 먼저 계산
    const nodeR_world = size * 0.048; // draw에서 scale*dpr로 곱해지는 값의 "scale 이전" 기준
    const margin_world = size * 0.06; // 여백 (너무 꽉차지 않게)

    // 가장 멀리 있는 점까지의 거리(월드)
    let maxDist = 0;
    for (const n of placed) {
      const dist = Math.hypot(n.x, n.y);
      if (dist > maxDist) maxDist = dist;
    }

    // 콘텐츠가 차지해야 하는 월드 반지름
    const contentR_world = maxDist + nodeR_world + margin_world;

    // 화면에 허용되는 스크린 반지름(px)
    const availR_px = (Math.min(canvasWpx, canvasHpx) / 2) / dpr;

    // scale = (스크린 허용 반지름) / (월드 반지름)
    const s = availR_px / Math.max(1, contentR_world);

    // 너무 커지지 않게(원하면 1.0 상한 제거 가능)
    return Math.min(1, Math.max(0.5, s));
  };

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

    const fitScale = getFitScale(canvas.width, canvas.height, dpr);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 배경
      ctx.fillStyle = "#ffffffb3";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#ffffffb3";
      ctx.fillRect(0, h * 0.45, w, h * 0.55);
      ctx.globalAlpha = 1;

      // ✅ 항상 중앙 고정 (panX/panY 없음)
      const cx = w / 2;
      const cy = h / 2;

      const toScreen = (wx: number, wy: number) => ({
        x: cx + wx * fitScale * dpr,
        y: cy + wy * fitScale * dpr,
      });

      const centerR = size * 0.07 * fitScale * dpr;
      const nodeR = size * 0.048 * fitScale * dpr;

      // 링 가이드
      const ringsR = Array.from(new Set(placed.map((p) => p.r))).sort((a, b) => a - b);
      ctx.strokeStyle = "rgba(0,0,0,0.04)";
      ctx.lineWidth = 2 * dpr;
      ringsR.forEach((rr) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rr * fitScale * dpr, 0, Math.PI * 2);
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
      ctx.font = `${Math.round(size * 0.04 * fitScale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
      ctx.fillText(centerName, cx, cy - 2 * dpr);

      if (centerSub) {
        ctx.fillStyle = "rgba(17,24,39,0.55)";
        ctx.font = `${Math.round(size * 0.028 * fitScale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
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

        const label = n.name.length > 4 ? `${n.name.slice(0, 3)}…` : n.name;
        ctx.fillStyle = "#111827";
        ctx.font = `${Math.round(size * 0.032 * fitScale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
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

    // ✅ 굳이 RAF 무한루프 필요 없어서(배터리/성능) 한 번만 그려도 충분
    draw();
  }, [activeId, placed, centerName, centerSub, size, height]);

  // hit test (fitScale 기준)
  const hitTest = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    const sx = (clientX - rect.left) * dpr;
    const sy = (clientY - rect.top) * dpr;

    const fitScale = getFitScale(canvas.width, canvas.height, dpr);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const nodeR = size * 0.048 * fitScale * dpr;
    const hitR2 = (nodeR * 1.3) * (nodeR * 1.3);

    for (const n of placed) {
      const px = cx + n.x * fitScale * dpr;
      const py = cy + n.y * fitScale * dpr;
      if (dist2(sx, sy, px, py) <= hitR2) return n.id;
    }
    return null;
  };

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
        onClick={onClick}
        style={{
          width: "100%",
          height: `${height}px`,
          borderRadius: 18,
          display: "block",
          // ✅ 팬/줌 안 쓰니까 굳이 none 필요 없지만, 모바일 더블탭/스크롤 오작동 방지용으로 유지 가능
          touchAction: "manipulation",
        }}
      />
    </div>
  );
}
