"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Level = 1 | 2 | 3 | 4 | 5;

export type EgoNode = {
  id: string;
  name: string;
  mbti: string;
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
  showLegend?: boolean;
};

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  5: { label: "찰떡궁합", color: "#1E88E5" },
  4: { label: "합좋은편", color: "#00C853" },
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
  if (ringCount === 3) return [[...by[5], ...by[4]], [...by[3]], [...by[2], ...by[1]]];
  return [[...by[5], ...by[4], ...by[3]], [...by[2], ...by[1]]];
}

function layoutOnRing(items: EgoNode[], radius: number, startAngle: number) {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => (b.level !== a.level ? b.level - a.level : a.name.localeCompare(b.name)));
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
    out.push({ ...sorted[i], angle: mid, x: Math.cos(mid) * radius, y: Math.sin(mid) * radius });
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
  maxSize = 760,
  minSize = 280,
  aspect = 1,
  showLegend = true,
}: Props) {
  const { ref: wrapRef, w: wrapW } = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  // ✅ 범례 강조(필터): null이면 전체 동일 강도
  const [focusLevel, setFocusLevel] = useState<Level | null>(null);

  const safeNodes = useMemo(() => clampNodes(nodes, 20), [nodes]);

  const size = useMemo(() => {
  const raw = Math.floor(wrapW);

  if (raw > 768) {
    return Math.min(900, raw);   // PC에서는 900까지 허용
  }

  return Math.max(280, Math.min(420, raw)); // 모바일은 기존 유지
}, [wrapW]);

  const height = Math.floor(size * aspect);

  const placed: Placed[] = useMemo(() => {
    const rings = mapToRings(safeNodes, ringCount);
    const base = size * 0.19;
    const step = size * 0.18;
    const ringR = ringCount === 3 ? [base, base + step, base + step * 2] : [base, base + step * 1.4];
    const starts = ringCount === 3 ? [-Math.PI / 2, -Math.PI / 2 + 0.4, -Math.PI / 2 + 0.15] : [-Math.PI / 2, -Math.PI / 2 + 0.25];
    const all: Placed[] = [];
    rings.forEach((items, idx) => {
      const p = layoutOnRing(items, ringR[idx], starts[idx]);
      p.forEach((n) => all.push({ ...n, ringIndex: idx, r: ringR[idx] }));
    });
    return all;
  }, [safeNodes, ringCount, size]);

  // ✅ “바깥 노드까지 딱 들어오게” 자동 스케일 (전체 placed 기준 유지)
  const getFitScale = (canvasWpx: number, canvasHpx: number, dpr: number) => {
    const nodeR_world = size * 0.048;
    const margin_world = size * 0.06;
    let maxDist = 0;
    for (const n of placed) {
      const dist = Math.hypot(n.x, n.y);
      if (dist > maxDist) maxDist = dist;
    }
    const contentR_world = maxDist + nodeR_world + margin_world;
    const availR_px = Math.min(canvasWpx, canvasHpx) / 2 / dpr;
    const s = availR_px / Math.max(1, contentR_world);
    return Math.min(1, Math.max(0.5, s));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    canvas.style.width = "100%";
    canvas.style.height = `${height}px`;

    // ✅ 실제 표시 크기를 가져온 뒤 "정수 px"로 고정
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.round(rect.width);
    const cssH = Math.round(rect.height);

    // ✅ CSS 크기를 정수로 강제(미세 스케일링 방지)
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    // ✅ 내부 버퍼는 css * dpr로 정확히 맞춤
    const bufW = Math.round(cssW * dpr);
    const bufH = Math.round(cssH * dpr);

    canvas.width = bufW;
    canvas.height = bufH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fitScale = getFitScale(canvas.width, canvas.height, dpr);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // hint (top-center)
      if (!activeId) {
        const msg = "이름을 클릭해보세요";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `600 ${Math.round(size * 0.028 * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        const padX = 10 * dpr;
        const textW = ctx.measureText(msg).width;
        const boxW = textW + padX * 2;
        const boxH = Math.round(size * 0.05 * dpr);
        const x = w / 2 - boxW / 2;
        const y = 14 * dpr;
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.lineWidth = 1.2 * dpr;
        roundRect(ctx, x, y, boxW, boxH, 999 * dpr);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(17,24,39,0.55)";
        ctx.fillText(msg, w / 2, y + boxH / 2);
      }

      const cx = w / 2;
      const cy = h / 2;
      const toScreen = (wx: number, wy: number) => ({ x: cx + wx * fitScale * dpr, y: cy + wy * fitScale * dpr });

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

      // ✅ focusLevel일 때 나머지 흐리게
      const isFocused = (lv: Level) => (focusLevel ? lv === focusLevel : true);

      // 선
      placed.forEach((n) => {
        const p = toScreen(n.x, n.y);
        const isActive = activeId === n.id;
        const col = LEVEL_META[n.level].color;

        const focused = isFocused(n.level);
        const hasFocus = focusLevel !== null;

        // ✅ 범례 선택 시: 해당 레벨은 강하게, 나머지는 매우 연하게
        const alpha = isActive ? 1 : hasFocus ? (focused ? 0.95 : 0.05) : 0.32;
        const lw = isActive ? 5.6 : hasFocus ? (focused ? 4.4 : 2.0) : 3.0;

        ctx.strokeStyle = col;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = lw * dpr;

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

        const dim = focusLevel && !isFocused(n.level);
        const strokeAlpha = dim ? 0.22 : 1;
        const fillAlpha = dim ? 0.78 : 1;

        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = meta.color;
        ctx.globalAlpha = strokeAlpha;
        ctx.lineWidth = (isActive ? 6 : 4) * dpr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        const label = n.name.length > 4 ? `${n.name.slice(0, 3)}…` : n.name;
        ctx.fillStyle = dim ? "rgba(17,24,39,0.45)" : "#111827";
        ctx.font = `${Math.round(size * 0.032 * fitScale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillText(label, p.x, p.y + 0.5 * dpr);
      });

      // 툴팁
      const active = activeId ? placed.find((p) => p.id === activeId) : null;
      if (active) {
        const meta = LEVEL_META[active.level];
        const baseText = `${active.name} (${active.mbti}) · `;
        const levelText = meta.label;

        const fontSize = Math.round(size * 0.032 * dpr);
        const paddingX = 18 * dpr;
        const paddingY = 12 * dpr;
        const radius = 20 * dpr;

        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui`;
        const fullText = baseText + levelText;
        const textWidth = ctx.measureText(fullText).width;

        const boxW = textWidth + paddingX * 2;
        const boxH = fontSize + paddingY * 2;

        const x = (w - boxW) / 2;
        const y = h - boxH - 24 * dpr;

        ctx.beginPath();
        if ("roundRect" in ctx) (ctx as any).roundRect(x, y, boxW, boxH, radius);
        else roundRect(ctx, x, y, boxW, boxH, radius);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.stroke();

        const centerX = w / 2;
        const textY = y + boxH / 2;

        ctx.textBaseline = "middle";
        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui`;
        const totalWidth = ctx.measureText(fullText).width;
        let startX = centerX - totalWidth / 2;

        ctx.textAlign = "left";
        ctx.fillStyle = "#111827";
        ctx.fillText(baseText, startX, textY);
        startX += ctx.measureText(baseText).width;

        ctx.font = `800 ${fontSize}px ui-sans-serif, system-ui`;
        ctx.fillStyle = meta.color;
        ctx.fillText(levelText, startX, textY);
      }
    };

    draw();
  }, [activeId, placed, centerName, centerSub, size, height, focusLevel]);

  const hitTest = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const sx = (clientX - rect.left) * scaleX;
    const sy = (clientY - rect.top) * scaleY;

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
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
    <div ref={wrapRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} onClick={onClick} style={{ width: "100%", height: `${height}px`, display: "block", touchAction: "manipulation" }} />
      {showLegend && (
        <div className="mt-3 pb-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
          {([5, 4, 3, 2, 1] as const).map((lv) => {
            const isOn = focusLevel === lv;
            const c = LEVEL_META[lv].color;
            return (
              <button
                key={lv}
                type="button"
                onClick={() => { setActiveId(null); setFocusLevel((prev) => (prev === lv ? null : lv)); }}
                className={["inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ring-1", isOn ? "bg-white text-slate-900 ring-black/10" : "bg-transparent text-slate-600 ring-transparent hover:bg-black/[0.03]"].join(" ")}
                style={isOn ? { boxShadow: `0 0 0 2px ${c}22 inset` } : undefined}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                <span>{LEVEL_META[lv].label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
