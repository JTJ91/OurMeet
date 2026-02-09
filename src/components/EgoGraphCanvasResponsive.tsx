"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Level = 1 | 2 | 3 | 4 | 5;

export type EgoNode = {
  id: string;
  name: string;
  mbti: string;
  level: Level;
  score?: number;
};

type Props = {
  groupName?: string;
  memberCount?: number;
  centerName: string;
  centerSub?: string;
  nodes: EgoNode[];
  ringCount?: 2 | 3;
  maxSize?: number;
  minSize?: number;
  aspect?: number;
  showLegend?: boolean;
  onCenterChange?: (id: string) => void;
};

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  5: { label: "찰떡궁합", color: "#1E88E5" },
  4: { label: "합좋은편", color: "#00C853" },
  3: { label: "그럭저럭", color: "#FDD835" },
  2: { label: "조율필요", color: "#FB8C00" },
  1: { label: "한계임박", color: "#D50000" },
};


function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const v = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function drawSoftShadowCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
  shadowColor: string,
  shadowBlur: number,
  shadowOffsetY = 0
) {
  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = shadowOffsetY;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCurvedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bend: number // 0.10 ~ 0.22 추천
) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // 수직 벡터
  const nx = -dy;
  const ny = dx;
  const len = Math.hypot(nx, ny) || 1;
  const cx = mx + (nx / len) * (Math.hypot(dx, dy) * bend);
  const cy = my + (ny / len) * (Math.hypot(dx, dy) * bend);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();
}

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

  // (정렬은 유지)
  const sorted = [...items].sort((a, b) =>
    b.level !== a.level ? b.level - a.level : a.name.localeCompare(b.name)
  );

  const N = sorted.length;
  const twoPi = Math.PI * 2;

  // ✅ 위쪽(-π/2) 피하기 + 링별로 약간씩 다른 회전
  const avoidTop = 0.45; // 20~35도 정도
  const baseRot = startAngle + avoidTop;

  // ✅ N이 적을 때는 강제로 퍼뜨리기(몰림 방지 핵심)
  const presetAngles = (n: number) => {
    if (n === 1) return [Math.PI / 4]; // 대각선
    if (n === 2) return [0, Math.PI]; // 정반대
    if (n === 3) return [0, (twoPi / 3) * 1, (twoPi / 3) * 2]; // 120도
    if (n === 4) return [0, Math.PI / 2, Math.PI, (Math.PI / 2) * 3]; // 90도
    return null;
  };

  const preset = presetAngles(N);

  const out: Array<EgoNode & { x: number; y: number; angle: number }> = [];

  if (preset) {
    // ✅ 소수 인원: 무조건 분산 배치
    for (let i = 0; i < N; i++) {
      const ang = baseRot + preset[i];
      out.push({
        ...sorted[i],
        angle: ang,
        x: Math.cos(ang) * radius,
        y: Math.sin(ang) * radius,
      });
    }
    return out;
  }

  // ✅ 일반 케이스: 균등 + 약간의 흔들림(정렬감 감소)
  const step = twoPi / N;
  const halfStep = step / 2;

  for (let i = 0; i < N; i++) {
    const ang = baseRot + halfStep + i * step;
    out.push({
      ...sorted[i],
      angle: ang,
      x: Math.cos(ang) * radius,
      y: Math.sin(ang) * radius,
    });
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

function oneLineMessage(score?: number, color?: string) {
  const s = Number.isFinite(Number(score)) ? Number(score) : 0;

  const highlight = (text: string) => (
    <span style={{ color: color, fontWeight: 700 }}>{text}</span>
  );

  if (s >= 90)
    return (
      <>
        거의 <b>운명급</b>이에요. {highlight("찰떡 케미")}가 자연스럽게 터져요.
      </>
    );

  if (s >= 80)
    return (
      <>
        템포가 잘 맞는 편이에요. 같이 있으면 {highlight("흐름이 부드러워요")}.
      </>
    );

  if (s >= 70)
    return (
      <>
        기본 궁합은 좋아요. {highlight("포인트만 맞추면")} 더 탄탄해져요.
      </>
    );

  if (s >= 60)
    return (
      <>
        무난한 케미예요. 상황에 따라 {highlight("온도차")}가 살짝 생길 수 있어요.
      </>
    );

  if (s >= 50)
    return (
      <>
        차이가 느껴질 수 있어요. {highlight("룰만 정해두면")} 훨씬 편해져요.
      </>
    );

  if (s >= 40)
    return (
      <>
        조율이 필요한 조합이에요. 먼저 {highlight("기준을 맞추는 것")}이 중요해요.
      </>
    );

  if (s >= 30)
    return (
      <>
        생각보다 {highlight("부딪힘")}이 있을 수 있어요. 기대치를 낮추면 편해요.
      </>
    );

  if (s >= 20)
    return (
      <>
        에너지가 다를 수 있어요. {highlight("거리 조절")}이 핵심이에요.
      </>
    );

  return (
    <>
      꽤 도전적인 조합이에요. {highlight("노력과 배려")}가 많이 필요해요.
    </>
  );
}


function ScoreBar({
  value,
  color,
  level,
}: {
  value: number;
  color: string;
  level: 1 | 2 | 3 | 4 | 5;
}) {
  const v = Math.max(0, Math.min(100, value));

  const rgba = (hex: string, a: number) => {
    const h = hex.replace("#", "");
    const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${a})`;
  };

  const fill = `linear-gradient(90deg, ${rgba(color, 0.8)}, ${rgba(color, 1)})`;

  return (
    <div className="flex w-full items-center gap-4">
      {/* 게이지 */}
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${v}%`,
            background: fill,
            boxShadow: `0 0 8px ${rgba(color, 0.2)}`,
          }}
        />
      </div>

      {/* ✨ 있어보이는 점수 텍스트 */}
      <div className="flex items-baseline gap-1 tabular-nums">
        <span
          className="text-base font-extrabold tracking-tight"
          style={{ color: color }}
        >
          {Math.round(v)}
        </span>
        <span className="text-xs font-medium text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
}


export default function EgoGraphCanvasResponsive({
  groupName,
  memberCount,
  centerName,
  centerSub,
  nodes,
  ringCount = 3,
  maxSize = 760,
  minSize = 280,
  aspect = 1,
  showLegend = true,
  onCenterChange,
}: Props) {
  const { ref: wrapRef, w: wrapW } = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  // ✅ 범례 강조(필터): null이면 전체 동일 강도
  const [focusLevel, setFocusLevel] = useState<Level | null>(null);

  const safeNodes = useMemo(() => clampNodes(nodes, 20), [nodes]);

  const TOP_UI = 44; // px (원하면 40~52 사이로 조절)

  const size = useMemo(() => {
    const raw = Math.floor(wrapW);

    if (raw > 768) {
      return Math.min(900, raw);   // PC에서는 900까지 허용
    }

    return Math.max(280, Math.min(420, raw)); // 모바일은 기존 유지
  }, [wrapW]);

    const graphH = Math.floor(size * aspect);
    const height = graphH;

    const placed: Placed[] = useMemo(() => {
      // ✅ 인원 적으면(<=4) 레벨링 무시하고 한 링에 몰아서 배치(몰림 방지)
      const few = safeNodes.length <= 4;

      const rings = few ? [safeNodes] : mapToRings(safeNodes, ringCount);

      // ✅ 인원수에 따라 링 "퍼짐" 자동 조절 (기존 유지)
      const n = safeNodes.length;
      const t = Math.max(0, Math.min(1, (n - 3) / 9));
      const spread = 0.72 + 0.28 * t;

      const base = size * 0.19 * spread;
      const step = size * 0.18 * spread;

      // ✅ few면 링 1개만 쓰고, 반지름은 "중간 링" 정도로 고정
      const ringR = few
        ? [base + step * 0.9]
        : ringCount === 3
          ? [base, base + step, base + step * 2]
          : [base, base + step * 1.4];

      // ✅ few면 시작각도도 1개만
      const starts = few
        ? [-Math.PI / 2]
        : ringCount === 3
          ? [-Math.PI / 2, -Math.PI / 2 + 0.4, -Math.PI / 2 + 0.15]
          : [-Math.PI / 2, -Math.PI / 2 + 0.25];

      const all: Placed[] = [];
      rings.forEach((items, idx) => {
        const p = layoutOnRing(items, ringR[idx], starts[idx]);
        p.forEach((node) => all.push({ ...node, ringIndex: idx, r: ringR[idx] }));
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

      // ✅ 은은한 배경 그라데이션
      const bg = ctx.createRadialGradient(w / 2, h / 2, 10 * dpr, w / 2, h / 2, Math.min(w, h) * 0.55);
      bg.addColorStop(0, "rgba(255,255,255,1)");
      bg.addColorStop(1, "rgba(248,250,252,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2; 

      const toScreen = (wx: number, wy: number) => ({ x: cx + wx * fitScale * dpr, y: cy + wy * fitScale * dpr });

      const centerR = size * 0.07 * fitScale * dpr;
      const nodeR = size * 0.058 * fitScale * dpr;

      // 링 가이드
      const ringsR = Array.from(new Set(placed.map((p) => p.r))).sort((a, b) => a - b);
      // ✅ 링 가이드(더 얇고 은은, 점선 느낌)
      ringsR.forEach((rr, idx) => {
        const rpx = rr * fitScale * dpr;
      
        ctx.save();
        ctx.strokeStyle = idx === 0 ? "rgba(15,23,42,0.06)" : "rgba(15,23,42,0.045)";
        ctx.lineWidth = 1.4 * dpr;
        ctx.setLineDash([6 * dpr, 10 * dpr]); // 점선
        ctx.lineDashOffset = idx * 2 * dpr;
      
        ctx.beginPath();
        ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 선
      // ✅ focusLevel일 때 나머지 흐리게
      const isFocused = (lv: Level) => (focusLevel ? lv === focusLevel : true);
      
      // 선(곡선 + 그라데이션)
      const sortedNodes = [
        ...placed.filter(n => n.id !== activeId),
        ...placed.filter(n => n.id === activeId),
      ];

      sortedNodes.forEach((n) => {
        const p = toScreen(n.x, n.y);
        const isActive = activeId === n.id;
        const isHover = hoverId === n.id;
      
        const col = LEVEL_META[n.level].color;
        const focused = isFocused(n.level);
        const hasFocus = focusLevel !== null;
      
        const alpha = isActive ? 1 : hasFocus ? (focused ? 0.92 : 0.05) : 0.30;
        const baseLW = isActive ? 5.8 : isHover ? 5.0 : hasFocus ? (focused ? 4.2 : 2.0) : 3.0;
      
        // 중앙 -> 바깥으로 갈수록 투명해지는 그라데이션
        const grad = ctx.createLinearGradient(cx, cy, p.x, p.y);
        grad.addColorStop(0, hexToRgba(col, Math.min(0.55, alpha)));
        grad.addColorStop(1, hexToRgba(col, Math.min(0.95, alpha)));
      
        ctx.save();
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 1; // grad 자체에 alpha를 넣었으니 1로 두는 게 깔끔
        ctx.lineWidth = baseLW * dpr;
        ctx.lineCap = "round";
      
        // 레벨 낮을수록 살짝 점선 느낌(조율/한계)
        if (n.level <= 2) ctx.setLineDash([7 * dpr, 10 * dpr]);
        else ctx.setLineDash([]);
      
        // 곡률: 많을수록 더 휘어짐
        const bend = isActive ? 0.18 : 0.12;
        drawCurvedLine(ctx, cx, cy, p.x, p.y, bend);
      
        ctx.restore();
      });

      // 중앙(입체감)
      drawSoftShadowCircle(ctx, cx, cy, centerR, "#FFFFFF", "rgba(15,23,42,0.18)", 18 * dpr, 6 * dpr);
      
      // 테두리
      ctx.strokeStyle = "rgba(15,23,42,0.10)";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.stroke();
      
      // 중앙 텍스트
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#0F172A";
      ctx.font = `${Math.round(size * 0.042 * fitScale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
      ctx.fillText(centerName, cx, cy - 2 * dpr);
      
      if (centerSub) {
        ctx.fillStyle = "rgba(15,23,42,0.55)";
        ctx.font = `${Math.round(size * 0.028 * fitScale * dpr)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillText(centerSub, cx, cy + centerR * 0.55);
      }

      // 노드(입체감 + hover)
      placed.forEach((n) => {
        const p = toScreen(n.x, n.y);
        const isActive = activeId === n.id;
        const isHover = hoverId === n.id;
        const meta = LEVEL_META[n.level];
      
        const dim =
        (focusLevel && !isFocused(n.level)) ||
        (activeId && !isActive);
      
        const scale = isActive ? 1.35 : isHover ? 1.08 : 1.0;
        const r = nodeR * scale;
      
        // ✅ 선택 시 부드러운 강조 링
        if (isActive) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 1.25, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(meta.color, 0.12);
          ctx.fill();
          ctx.restore();
        }

        ctx.globalAlpha = activeId
        ? isActive
          ? 1
          : 0.35
        : 1;

        // 바디(그림자)
        drawSoftShadowCircle(
          ctx,
          p.x,
          p.y,
          r,
          "#FFFFFF",
          dim ? "rgba(15,23,42,0.05)" : "rgba(15,23,42,0.14)",
          (isActive ? 16 : isHover ? 14 : 12) * dpr,
          (isActive ? 6 : 4) * dpr
        );
      
        // 하이라이트(살짝 광택 느낌)
        ctx.save();
        ctx.globalAlpha = dim ? 0.12 : 0.18;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(p.x - r * 0.25, p.y - r * 0.25, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      
        // 테두리
        ctx.save();
        ctx.strokeStyle = dim ? hexToRgba(meta.color, 0.22) : meta.color;
        ctx.lineWidth = (isActive ? 6 : isHover ? 5 : 4) * dpr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      
        // 이름
        const label = n.name.length > 4 ? `${n.name.slice(0, 3)}…` : n.name;

        const textScale = isActive ? 1.2 : isHover ? 1.05 : 1;

        // 선택 시 더 진하게
        const fontWeight = isActive ? 700 : 600;

        ctx.fillStyle = activeId
          ? isActive
            ? "#0F172A"
            : "rgba(15,23,42,0.35)"
          : dim
          ? "rgba(15,23,42,0.40)"
          : "#0F172A";

        ctx.font = `${fontWeight} ${Math.round(
          size * 0.032 * fitScale * dpr * textScale
        )}px ui-sans-serif, system-ui, -apple-system`;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, p.x, p.y + 0.5 * dpr);

      });

      // 툴팁
      // const active = activeId ? placed.find((p) => p.id === activeId) : null;
      // if (active) {
      //   const meta = LEVEL_META[active.level];
      //   const baseText = `${active.name} (${active.mbti}) · `;
      //   const levelText = meta.label;

      //   const fontSize = Math.round(size * 0.032 * dpr);
      //   const paddingX = 18 * dpr;
      //   const paddingY = 12 * dpr;
      //   const radius = 20 * dpr;

      //   ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui`;
      //   const fullText = baseText + levelText;
      //   const textWidth = ctx.measureText(fullText).width;

      //   const boxW = textWidth + paddingX * 2;
      //   const boxH = fontSize + paddingY * 2;

      //   const x = (w - boxW) / 2;
      //   const y = h - boxH - 24 * dpr;

      //   ctx.beginPath();
      //   if ("roundRect" in ctx) (ctx as any).roundRect(x, y, boxW, boxH, radius);
      //   else roundRect(ctx, x, y, boxW, boxH, radius);
      //   ctx.fillStyle = "rgba(255,255,255,0.95)";
      //   ctx.fill();
      //   ctx.strokeStyle = "rgba(0,0,0,0.08)";
      //   ctx.stroke();

      //   const centerX = w / 2;
      //   const textY = y + boxH / 2;

      //   ctx.textBaseline = "middle";
      //   ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui`;
      //   const totalWidth = ctx.measureText(fullText).width;
      //   let startX = centerX - totalWidth / 2;

      //   ctx.textAlign = "left";
      //   ctx.fillStyle = "#111827";
      //   ctx.fillText(baseText, startX, textY);
      //   startX += ctx.measureText(baseText).width;

      //   ctx.font = `800 ${fontSize}px ui-sans-serif, system-ui`;
      //   ctx.fillStyle = meta.color;
      //   ctx.fillText(levelText, startX, textY);
      // }
    };

    draw();
    ctx.globalAlpha = 1;

  }, [activeId, hoverId, placed, centerName, centerSub, size, height, focusLevel]);

  
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

  const onMouseMove = (e: React.MouseEvent) => {
  const id = hitTest(e.clientX, e.clientY);
  setHoverId(id);

  // 캔버스 커서 변경(이게 체감 큼)
  const canvas = canvasRef.current;
  if (canvas) canvas.style.cursor = id ? "pointer" : "default";
};

const onMouseLeave = () => {
  setHoverId(null);
  const canvas = canvasRef.current;
  if (canvas) canvas.style.cursor = "default";
};

  const activeNode = useMemo(() => (activeId ? placed.find((p) => p.id === activeId) : null), [activeId, placed]);
  const scoreNum =
  activeNode && Number.isFinite(Number(activeNode.score))
    ? Math.round(Number(activeNode.score))
    : null;

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <canvas
          ref={canvasRef}
          onClick={onClick}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={{ width: "100%", height: `${height}px`, display: "block", touchAction: "manipulation" }}
        />

      {/* ✅ 관계도 안내 메시지 (캔버스 아래, 범례 위) */}
      {!activeId && (
        <div className="mt-4 mb-1 text-center text-[12px] font-semibold text-slate-400">
          이름을 눌러 관계를 확인해보세요
        </div>
      )}  
      
      {activeNode && (
        <div className="sticky bottom-2 z-10 mt-2 px-2">
          <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur-md">
            {/* ✅ 얇은 하이라이트 라인 */}
            <div
              className="h-[2px] w-full"
              style={{
                background: `linear-gradient(90deg, ${LEVEL_META[activeNode.level].color}55, rgba(255,255,255,0))`,
              }}
            />

            <div className="p-3">
              {/* 1줄: 별명 MBTI   센터로가기 */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-900 truncate">
                    {activeNode.name}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-600">
                    {activeNode.mbti}
                  </span>
                </div>

                {onCenterChange && (
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-4"
                    onClick={() => {
                      onCenterChange(activeNode.id);
                      setActiveId(null);
                      setFocusLevel(null);
                    }}
                  >
                    센터로 설정
                  </button>
                )}
              </div>

              {/* 2줄: 관계(조율필요) + 가로 게이지 */}
              <div className="mt-2 flex w-full items-center gap-3">
                <span
                  className="shrink-0 text-sm font-extrabold"
                  style={{ color: LEVEL_META[activeNode.level].color }}
                >
                  {LEVEL_META[activeNode.level].label}
                </span>

                {scoreNum != null && (
                  <ScoreBar
                    value={scoreNum}
                    color={LEVEL_META[activeNode.level].color}
                    level={activeNode.level}
                  />
                )}
              </div>


              {/* 3줄: 메시지 */}
              <div className="mt-2 text-xs font-medium text-slate-600">
                {oneLineMessage(activeNode.score, LEVEL_META[activeNode.level].color)}
              </div>
            </div>

          </div>
        </div>
      )}

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
