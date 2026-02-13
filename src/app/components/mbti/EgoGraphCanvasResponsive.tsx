import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { flushSync } from "react-dom";
import { getCompatScore } from "@/app/lib/mbti/mbtiCompat";

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
  centerSub?: string; // ✅ 지금은 여기(센터 MBTI로 쓰는 중)
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
  bend: number
) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
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

  const sorted = [...items].sort((a, b) =>
    b.level !== a.level ? b.level - a.level : a.name.localeCompare(b.name)
  );

  const N = sorted.length;
  const twoPi = Math.PI * 2;

  const avoidTop = 0.45;
  const baseRot = startAngle + avoidTop;

  const presetAngles = (n: number) => {
    if (n === 1) return [Math.PI / 4];
    if (n === 2) return [0, Math.PI];
    if (n === 3) return [0, (twoPi / 3) * 1, (twoPi / 3) * 2];
    if (n === 4) return [0, Math.PI / 2, Math.PI, (Math.PI / 2) * 3];
    return null;
  };

  const preset = presetAngles(N);
  const out: Array<EgoNode & { x: number; y: number; angle: number }> = [];

  if (preset) {
    for (let i = 0; i < N; i++) {
      const ang = baseRot + preset[i];
      out.push({ ...sorted[i], angle: ang, x: Math.cos(ang) * radius, y: Math.sin(ang) * radius });
    }
    return out;
  }

  const step = twoPi / N;
  const halfStep = step / 2;

  for (let i = 0; i < N; i++) {
    const ang = baseRot + halfStep + i * step;
    out.push({ ...sorted[i], angle: ang, x: Math.cos(ang) * radius, y: Math.sin(ang) * radius });
  }

  return out;
}

type Placed = EgoNode & { x: number; y: number; ringIndex: number; r: number };

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

/** ✅ 한 줄 요약(점수) */
function oneLineMessage(score?: number, color?: string) {
  const s = Number.isFinite(Number(score)) ? Number(score) : 0;
  const highlight = (text: string) => <span style={{ color, fontWeight: 800 }}>{text}</span>;

  if (s >= 76) return <>이건 거의 {highlight("찰떡 라인")}이에요. 굳이 애쓰지 않아도 맞아요.</>;
  if (s >= 74) return <>상위권 케미. {highlight("같이 있을수록 편해지는 타입")}이에요.</>;
  if (s >= 72) return <>리듬이 자연스러워요. {highlight("말이 잘 통하는 조합")}이에요.</>;
  if (s >= 70) return <>기본 합이 좋아요. {highlight("갈등이 오래 가지 않아요")}.</>;
  if (s >= 66) return <>무난하게 잘 맞아요. {highlight("같이 있어도 부담이 적어요")}.</>;
  if (s >= 62) return <>괜찮은 조합이에요. {highlight("속도 차이만 조절하면")} 더 좋아요.</>;
  if (s >= 58) return <>나쁘지 않지만 {highlight("결이 조금 달라요")}.</>;
  if (s >= 54) return <>여기부터는 {highlight("조율이 관건")}이에요.</>;
  if (s >= 50) return <>서로 다르다는 게 {highlight("확실히 체감되는 조합")}이에요.</>;
  if (s >= 46) return <>대화하다가 {highlight("물음표가 자주 생길 수 있어요")}.</>;
  if (s >= 44) return <>가끔은 {highlight("왜 이렇게까지 다르지?")} 싶을 수 있어요.</>;
  if (s >= 42) return <>그냥 두면 {highlight("각자 말만 하게 될 확률")}이 높아요.</>;
  return <>솔직히 말하면 {highlight("충돌 확률 높은 조합")}이에요.</>;
}

type MsgBucket = "AUTO" | "HIGH" | "GOOD" | "OK" | "TUNE" | "LANG" | "HARD";

function scoreToBucket(score?: number): MsgBucket {
  const s = Number.isFinite(Number(score)) ? Number(score) : 0;
  if (s >= 76) return "AUTO";
  if (s >= 72) return "HIGH";
  if (s >= 66) return "GOOD";
  if (s >= 58) return "OK";
  if (s >= 50) return "TUNE";
  if (s >= 44) return "LANG";
  return "HARD";
}

type Fn = "Ni" | "Ne" | "Si" | "Se" | "Ti" | "Te" | "Fi" | "Fe";
type Stack = [Fn, Fn, Fn, Fn];

const STACK: Record<string, Stack> = {
  INTJ: ["Ni", "Te", "Fi", "Se"],
  ENTJ: ["Te", "Ni", "Se", "Fi"],
  INTP: ["Ti", "Ne", "Si", "Fe"],
  ENTP: ["Ne", "Ti", "Fe", "Si"],
  INFJ: ["Ni", "Fe", "Ti", "Se"],
  ENFJ: ["Fe", "Ni", "Se", "Ti"],
  INFP: ["Fi", "Ne", "Si", "Te"],
  ENFP: ["Ne", "Fi", "Te", "Si"],
  ISTJ: ["Si", "Te", "Fi", "Ne"],
  ESTJ: ["Te", "Si", "Ne", "Fi"],
  ISFJ: ["Si", "Fe", "Ti", "Ne"],
  ESFJ: ["Fe", "Si", "Ne", "Ti"],
  ISTP: ["Ti", "Se", "Ni", "Fe"],
  ESTP: ["Se", "Ti", "Fe", "Ni"],
  ISFP: ["Fi", "Se", "Ni", "Te"],
  ESFP: ["Se", "Fi", "Te", "Ni"],
};

function normMbti(m?: string) {
  const t = (m || "").trim().toUpperCase();
  return STACK[t] ? t : null;
}

function fnName(f: Fn) {
  switch (f) {
    case "Se":
      return "현장감(지금)";
    case "Si":
      return "경험/기억";
    case "Ne":
      return "아이디어/확장";
    case "Ni":
      return "의미/흐름";
    case "Te":
      return "결정/정리";
    case "Ti":
      return "논리/분석";
    case "Fe":
      return "분위기/배려";
    case "Fi":
      return "가치/진심";
  }
}

function oppositeAxis(f: Fn): Fn {
  switch (f) {
    case "Se":
      return "Ni";
    case "Ni":
      return "Se";
    case "Si":
      return "Ne";
    case "Ne":
      return "Si";
    case "Te":
      return "Fi";
    case "Fi":
      return "Te";
    case "Ti":
      return "Fe";
    case "Fe":
      return "Ti";
  }
}

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function analyzePair(aMbti: string, bMbti: string) {
  const a = STACK[aMbti];
  const b = STACK[bMbti];

  const aTop = a[0],
    bTop = b[0];
  const aAux = a[1],
    bAux = b[1];

  const aSet = new Set(a);
  const bSet = new Set(b);

  const shared = [...aSet].filter((x) => bSet.has(x)) as Fn[];

  const clash: Fn[] = [];
  const pairs: [Fn, Fn][] = [
    [aTop, bTop],
    [aTop, bAux],
    [aAux, bTop],
  ];
  for (const [x, y] of pairs) {
    if (oppositeAxis(x) === y) clash.push(x);
    if (oppositeAxis(y) === x) clash.push(y);
  }

  const clashUniq = Array.from(new Set(clash)) as Fn[];

  return { aTop, bTop, aAux, bAux, shared, clash: clashUniq };
}

function bucketSituation(bucket: MsgBucket) {
  switch (bucket) {
    case "AUTO":
      return ["말이 잘 이어지는 날", "굳이 설명이 필요 없는 흐름", "대화가 자연스럽게 굴러감"];
    case "HIGH":
      return ["리듬이 잘 맞음", "주고받는 속도가 비슷함", "호흡이 편한 편"];
    case "GOOD":
      return ["무난하게 굴러감", "피로도가 낮은 편", "각자 역할이 잡히기 쉬움"];
    case "OK":
      return ["주제에 따라 체감 차이", "관심 축이 엇갈릴 때 있음", "해석이 달라질 때 있음"];
    case "TUNE":
      return ["전제 공유가 필요", "결정 기준이 다름", "확인 질문이 중요"];
    case "LANG":
      return ["번역이 필요한 구간", "대화 톤이 엇갈릴 수 있음", "속도 조절이 필요"];
    case "HARD":
      return ["오해 방지 모드", "짧고 명확하게 가는 게 안전", "오늘은 힘 빼는 게 좋음"];
  }
}

function makeCognitiveMessage(
  centerMbtiRaw: string | undefined,
  otherMbtiRaw: string | undefined,
  score: number | undefined
) {
  const aMbti = normMbti(centerMbtiRaw);
  const bMbti = normMbti(otherMbtiRaw);
  if (!aMbti || !bMbti) return null;

  const bucket = scoreToBucket(score);
  const info = analyzePair(aMbti, bMbti);

  const seed = hashSeed(`${aMbti}_${bMbti}_${bucket}`);
  const scene = pick(bucketSituation(bucket), seed);

  const sharedTop = info.shared.length ? pick(info.shared, seed + 7) : null;
  const clashTop = info.clash.length ? pick(info.clash, seed + 13) : null;

  const sharedLine = sharedTop
    ? pick(
        [
          `공통분모는 ${fnName(sharedTop)}예요. 포인트만 맞으면 생각보다 금방 가까워져요.`,
          `${fnName(sharedTop)} 쪽은 합이 좋아요. 여기서 신뢰가 빨리 쌓여요.`,
          `둘 다 ${fnName(sharedTop)} 감각이 있어서, 한 번 맞으면 ‘아, 통한다’가 빨라요.`,
        ],
        seed + 21
      )
    : pick(
        [
          "공통분모가 얇은 편이라, 처음엔 서로를 ‘해석’하는 시간이 필요해요.",
          "초반엔 결이 달라 보이지만, 패턴만 잡히면 생각보다 편해질 수 있어요.",
        ],
        seed + 21
      );

  const clashLine = (() => {
    if (!clashTop) {
      return pick(
        [
          `${scene}. 큰 충돌은 아니지만, 속도/우선순위가 엇갈릴 때만 조율하면 좋아요.`,
          `${scene}. 포인트는 ‘해석 확인’이에요. 같은 말도 다르게 들릴 수 있어요.`,
        ],
        seed + 37
      );
    }

    const axis = fnName(clashTop);

    if (bucket === "AUTO" || bucket === "HIGH") {
      return pick(
        [
          `${scene}. ${axis} 방식은 다를 수 있는데, 오히려 서로 보완이 잘 돼요.`,
          `${scene}. 특히 ${axis}에서 역할이 나뉘면서 팀플처럼 굴러가요.`,
          `${scene}. ${axis} 결이 달라도, 기본 합이 좋아서 금방 맞춰져요.`,
        ],
        seed + 37
      );
    }

    if (bucket === "LANG" || bucket === "HARD") {
      return pick(
        [
          `${scene}. ${axis}에서 ‘친절의 기준’이 달라요. 그냥 두면 서로 서운해지기 쉬워요.`,
          `${scene}. 특히 ${axis}에서 엇갈리면 “내 말이 그렇게 들려?”가 나올 수 있어요.`,
          `${scene}. ${axis} 축이 갈려서, 한쪽은 빠르게 결론을 원하고 다른 쪽은 납득을 원해요.`,
        ],
        seed + 37
      );
    }

    return pick(
      [
        `${scene}. ${axis}에서 방식이 갈라져요. 결론 전에 전제만 맞추면 충돌이 확 줄어요.`,
        `${scene}. ${axis} 축이 달라서, 한쪽은 “바로 하자”, 다른 쪽는 “납득이 먼저”로 갈릴 수 있어요.`,
        `${scene}. 특히 ${axis}에서 조율이 필요해요. 한 문장만 더해도 체감이 달라져요.`,
      ],
      seed + 37
    );
  })();

  return pick([`${sharedLine} ${clashLine}`, `${clashLine} ${sharedLine}`], seed + 55);
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

      <div className="flex items-baseline gap-2 tabular-nums">
        <span className="text-base font-extrabold tracking-tight" style={{ color }}>
          {v.toFixed(2)}
        </span>
        <span className="text-xs font-semibold text-slate-400">점</span>
      </div>
    </div>
  );
}

function EgoGraphCanvasResponsiveInner({
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

  // ✅ UI에 필요한 상태만 React state로 유지
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focusLevel, setFocusLevel] = useState<Level | null>(null);

  // ✅ hover는 draw만 트리거(React re-render 방지)
  const hoverIdRef = useRef<string | null>(null);

  // ✅ 캔버스/좌표 캐시 (hitTest 최적화)
  const geomRef = useRef({
    rect: { left: 0, top: 0, width: 1, height: 1 },
    scaleX: 1,
    scaleY: 1,
    dpr: 1,
    fitScale: 1,
    cx: 0,
    cy: 0,
    hitR2: 0,
    // screen positions for hit-test
    pts: [] as Array<{ id: string; x: number; y: number }>,
  });

  // ✅ RAF로 draw 합치기
  const rafRef = useRef<number | null>(null);
  const drawQueuedRef = useRef(false);

  const safeNodes = useMemo(() => clampNodes(nodes, 20), [nodes]);

  const size = useMemo(() => {
    const raw = Math.floor(wrapW);
    if (raw > 768) return Math.min(900, raw);
    return Math.max(280, Math.min(420, raw));
  }, [wrapW]);

  const height = Math.floor(size * aspect);

  const placed: Placed[] = useMemo(() => {
    const few = safeNodes.length <= 4;
    const rings = few ? [safeNodes] : mapToRings(safeNodes, ringCount);

    const n = safeNodes.length;
    const t = Math.max(0, Math.min(1, (n - 3) / 9));
    const spread = 0.72 + 0.28 * t;

    const base = size * 0.19 * spread;
    const step = size * 0.18 * spread;

    const ringR = few
      ? [base + step * 0.9]
      : ringCount === 3
      ? [base, base + step, base + step * 2]
      : [base, base + step * 1.4];

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

  const ringsR = useMemo(
    () => Array.from(new Set(placed.map((p) => p.r))).sort((a, b) => a - b),
    [placed]
  );

  // ✅ placed 기준 fitScale 계산 (placed 변화시에만)
  const contentFitRef = useRef({ nodeR_world: 0, margin_world: 0, contentR_world: 1 });
  useEffect(() => {
    const nodeR_world = size * 0.048;
    const margin_world = size * 0.06;
    let maxDist = 0;
    for (const n of placed) {
      const d = Math.hypot(n.x, n.y);
      if (d > maxDist) maxDist = d;
    }
    contentFitRef.current = {
      nodeR_world,
      margin_world,
      contentR_world: maxDist + nodeR_world + margin_world,
    };
  }, [placed, size]);

  const computeFitScale = (canvasWpx: number, canvasHpx: number, dpr: number) => {
    const availR_px = Math.min(canvasWpx, canvasHpx) / 2 / dpr;
    const s = availR_px / Math.max(1, contentFitRef.current.contentR_world);
    return Math.min(1, Math.max(0.5, s));
  };

  const requestDraw = () => {
    if (drawQueuedRef.current) return;
    drawQueuedRef.current = true;
    rafRef.current = window.requestAnimationFrame(() => {
      drawQueuedRef.current = false;
      draw();
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { dpr, fitScale, cx, cy } = geomRef.current;

    const w = canvas.width;
    const h = canvas.height;

    // ✅ clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // ✅ 배경(라이트)
    const bg = ctx.createRadialGradient(
      w / 2,
      h / 2,
      10 * dpr,
      w / 2,
      h / 2,
      Math.min(w, h) * 0.55
    );
    bg.addColorStop(0, "rgba(255,255,255,1)");
    bg.addColorStop(1, "rgba(248,250,252,1)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const toScreen = (wx: number, wy: number) => ({
      x: cx + wx * fitScale * dpr,
      y: cy + wy * fitScale * dpr,
    });

    const centerR = size * 0.07 * fitScale * dpr;
    const nodeR = size * 0.058 * fitScale * dpr;

    // ✅ hover는 ref에서 읽기
    const hoverId = hoverIdRef.current;

    const isFocused = (lv: Level) => (focusLevel ? lv === focusLevel : true);
    const hasFocus = focusLevel !== null;

    // ✅ 링 가이드
    ringsR.forEach((rr, idx) => {
      const rpx = rr * fitScale * dpr;
      ctx.save();
      ctx.strokeStyle = idx === 0 ? "rgba(15,23,42,0.06)" : "rgba(15,23,42,0.045)";
      ctx.lineWidth = 1.4 * dpr;
      ctx.setLineDash([6 * dpr, 10 * dpr]);
      ctx.lineDashOffset = idx * 2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // ✅ 라인(노드 연결) — gradient 생성 비용 줄이려면 단색+alpha로도 충분함
    // 지금은 기존 느낌 유지하되, focus/hover에서만 진하게.
    const orderedForLines =
      activeId === null
        ? placed
        : [
            ...placed.filter((n) => n.id !== activeId),
            ...placed.filter((n) => n.id === activeId),
          ];

    orderedForLines.forEach((n) => {
      const p = toScreen(n.x, n.y);
      const isActive = activeId === n.id;
      const isHover = hoverId === n.id;

      const col = LEVEL_META[n.level].color;
      const focused = isFocused(n.level);

      const alpha = isActive ? 1 : hasFocus ? (focused ? 0.92 : 0.05) : 0.3;
      const baseLW = isActive ? 5.8 : isHover ? 5.0 : hasFocus ? (focused ? 4.2 : 2.0) : 3.0;

      // ✅ gradient는 유지하되, alpha 낮을 때는 단색으로 가볍게(작은 최적화)
      const useGrad = alpha > 0.25;
      const stroke = useGrad
        ? (() => {
            const g = ctx.createLinearGradient(cx, cy, p.x, p.y);
            g.addColorStop(0, hexToRgba(col, Math.min(0.55, alpha)));
            g.addColorStop(1, hexToRgba(col, Math.min(0.95, alpha)));
            return g;
          })()
        : hexToRgba(col, alpha);

      ctx.save();
      ctx.strokeStyle = stroke as any;
      ctx.globalAlpha = 1;
      ctx.lineWidth = baseLW * dpr;
      ctx.lineCap = "round";

      if (n.level <= 2) ctx.setLineDash([7 * dpr, 10 * dpr]);
      else ctx.setLineDash([]);

      const bend = isActive ? 0.18 : 0.12;
      drawCurvedLine(ctx, cx, cy, p.x, p.y, bend);
      ctx.restore();
    });

    // ✅ 중앙(입체감)
    drawSoftShadowCircle(ctx, cx, cy, centerR, "#FFFFFF", "rgba(15,23,42,0.18)", 18 * dpr, 6 * dpr);

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

    // ✅ 노드 + hitTest용 screen 좌표 캐시
    const pts: Array<{ id: string; x: number; y: number }> = [];

    placed.forEach((n) => {
      const p = toScreen(n.x, n.y);
      pts.push({ id: n.id, x: p.x, y: p.y });

      const isActive = activeId === n.id;
      const isHover = hoverId === n.id;
      const meta = LEVEL_META[n.level];

      const dim = (focusLevel && !isFocused(n.level)) || (activeId && !isActive);
      const scale = isActive ? 1.35 : isHover ? 1.08 : 1.0;
      const r = nodeR * scale;

      if (isActive) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 1.25, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(meta.color, 0.12);
        ctx.fill();
        ctx.restore();
      }

      ctx.globalAlpha = activeId ? (isActive ? 1 : 0.35) : 1;

      // ✅ 그림자 비용: dim이면 blur 낮추기(미세 최적화)
      const shadowBlur = (isActive ? 16 : isHover ? 14 : dim ? 8 : 12) * dpr;
      const shadowColor = dim ? "rgba(15,23,42,0.05)" : "rgba(15,23,42,0.14)";
      const shadowOffsetY = (isActive ? 6 : 4) * dpr;

      drawSoftShadowCircle(ctx, p.x, p.y, r, "#FFFFFF", shadowColor, shadowBlur, shadowOffsetY);

      ctx.save();
      ctx.globalAlpha = dim ? 0.12 : 0.18;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(p.x - r * 0.25, p.y - r * 0.25, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = dim ? hexToRgba(meta.color, 0.22) : meta.color;
      ctx.lineWidth = (isActive ? 6 : isHover ? 5 : 4) * dpr;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const label = n.name.length > 4 ? `${n.name.slice(0, 3)}…` : n.name;
      const textScale = isActive ? 1.2 : isHover ? 1.05 : 1;
      const fontWeight = isActive ? 700 : 600;

      ctx.fillStyle = activeId
        ? isActive
          ? "#0F172A"
          : "rgba(15,23,42,0.35)"
        : dim
        ? "rgba(15,23,42,0.40)"
        : "#0F172A";

      ctx.font = `${fontWeight} ${Math.round(size * 0.032 * fitScale * dpr * textScale)}px ui-sans-serif, system-ui, -apple-system`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, p.x, p.y + 0.5 * dpr);
    });

    // ✅ hitTest 캐시 갱신
    geomRef.current.pts = pts;

    // ✅ hit radius 캐시: 실제 노드 반지름 기반으로 (빈공간 클릭 오판 줄이기)
    const hitR = nodeR * 1.08; // 1.05~1.15 사이 취향(작을수록 빈공간 잘 잡힘)
    geomRef.current.hitR2 = hitR * hitR;

    ctx.globalAlpha = 1;
  };

  // ✅ 1) 캔버스 버퍼/스케일 업데이트: size/height 변할 때만
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    // CSS 크기
    canvas.style.width = "100%";
    canvas.style.height = `${height}px`;
    const rect = canvas.getBoundingClientRect();

    const cssW = Math.round(rect.width);
    const cssH = Math.round(rect.height);

    // CSS 정수 고정
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    // buffer
    const bufW = Math.round(cssW * dpr);
    const bufH = Math.round(cssH * dpr);
    canvas.width = bufW;
    canvas.height = bufH;

    // geom cache
    const fitScale = computeFitScale(canvas.width, canvas.height, dpr);

    geomRef.current.rect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    geomRef.current.scaleX = canvas.width / rect.width;
    geomRef.current.scaleY = canvas.height / rect.height;
    geomRef.current.dpr = dpr;
    geomRef.current.fitScale = fitScale;
    geomRef.current.cx = canvas.width / 2;
    geomRef.current.cy = canvas.height / 2;

    requestDraw();

    // cleanup raf
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      drawQueuedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, size, placed]); // placed 변화도 fitScale 영향을 줄 수 있음

  // ✅ 2) draw 트리거: state 변화(hover 제외)
  useEffect(() => {
    requestDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, focusLevel, centerName, centerSub, ringsR]);

  // ✅ rect는 스크롤로도 변하니 포인터 이벤트에서 최신화(가벼운 수준)
  const refreshRect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    geomRef.current.rect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    geomRef.current.scaleX = canvas.width / rect.width;
    geomRef.current.scaleY = canvas.height / rect.height;
  };

  const hitTest = (clientX: number, clientY: number) => {
    const g = geomRef.current;
    const sx = (clientX - g.rect.left) * g.scaleX;
    const sy = (clientY - g.rect.top) * g.scaleY;

    const hitR2 = g.hitR2 || 0;
    const pts = g.pts;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (dist2(sx, sy, p.x, p.y) <= hitR2) return p.id;
    }
    return null;
  };

  const onClick = (e: React.MouseEvent) => {
    refreshRect();
    const id = hitTest(e.clientX, e.clientY);

    // ✅ 빈공간 클릭 = 즉시 해제
    if (!id) {
      flushSync(() => {
        setActiveId(null);
        setFocusLevel(null);
      });

      hoverIdRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = "default";

      draw(); // ✅ 이제 최신 state로 즉시 draw 됨
      return;
    }

    // ✅ 노드 클릭: 토글(next를 먼저 계산해서 동기 반영)
    const next = (activeId === id) ? null : id;

    flushSync(() => {
      setActiveId(next);
    });

    if (next === null) {
      hoverIdRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = "default";
    }

    draw();        // ✅ 클릭 즉시 커짐/작아짐 반영
    requestDraw(); // ✅ 혹시 잔여 RAF가 있으면 안전하게 한 번 더
  };




  const onMouseMove = (e: React.MouseEvent) => {
    refreshRect();
    const id = hitTest(e.clientX, e.clientY);

    // activeId가 null이고, hover만 커지는 게 싫으면:
    if (activeId === null && id !== null) {
      // hover를 유지할지 말지는 취향
    }

    if (hoverIdRef.current !== id) {
      hoverIdRef.current = id;
      requestDraw();
    }

    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = id ? "pointer" : "default";
  };

  const onMouseLeave = () => {
    if (hoverIdRef.current !== null) {
      hoverIdRef.current = null;
      requestDraw();
    }
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = "default";
  };

  const activeNode = useMemo(
    () => (activeId ? placed.find((p) => p.id === activeId) : null),
    [activeId, placed]
  );

  const scoreNum =
    activeNode && Number.isFinite(Number(activeNode.score)) ? Number(activeNode.score) : null;

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <canvas
        ref={canvasRef}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ width: "100%", height: `${height}px`, display: "block", touchAction: "manipulation" }}
      />

      {!activeId && (
        <div className="mt-4 mb-1 text-center text-[12px] font-semibold text-slate-600">
          이름을 눌러 관계를 확인해보세요
          <div className="mt-1 text-[11px] font-semibold text-slate-500">
            카드에서 ‘센터로 보기’를 누르면 기준이 바뀌어요
          </div>
        </div>
      )}

      {activeNode && (
        <div className="sticky bottom-2 z-10 mt-2 px-2">
          <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur-md">
            <div
              className="h-[2px] w-full"
              style={{
                background: `linear-gradient(90deg, ${LEVEL_META[activeNode.level].color}55, rgba(255,255,255,0))`,
              }}
            />

            <div className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-900 truncate">{activeNode.name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-600">{activeNode.mbti}</span>
                </div>

                {onCenterChange && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(null);
                        setFocusLevel(null);

                        React.startTransition(() => {
                          onCenterChange(activeNode.id);
                        });
                      }}
                      className={[
                        "inline-flex items-center gap-1.5",
                        "rounded-full border border-slate-200 bg-slate-50",
                        "px-2.5 py-1 text-[11px] font-bold text-slate-700",
                        "shadow-sm transition hover:bg-slate-100 hover:text-slate-900",
                        "active:scale-[0.98]",
                      ].join(" ")}
                      aria-label="이 사람을 센터로 보기"
                    >
                      <span className="text-[12px]">🎯</span>
                      센터로 보기
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-2 flex w-full items-center gap-3">
                <span
                  className="shrink-0 text-sm font-extrabold"
                  style={{ color: LEVEL_META[activeNode.level].color }}
                >
                  {LEVEL_META[activeNode.level].label}
                </span>

                {scoreNum != null && (
                  <ScoreBar value={scoreNum} color={LEVEL_META[activeNode.level].color} level={activeNode.level} />
                )}
              </div>

              <div className="mt-2 text-xs font-medium text-slate-600">
                {oneLineMessage(activeNode.score, LEVEL_META[activeNode.level].color)}
              </div>

              {(() => {
                const msg = makeCognitiveMessage(centerSub, activeNode.mbti, activeNode.score);
                if (!msg) return null;
                return <div className="mt-1 text-xs font-medium text-slate-500">{msg}</div>;
              })()}
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
                onClick={() => {
                  setActiveId(null);
                  setFocusLevel((prev) => (prev === lv ? null : lv));
                }}
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ring-1",
                  isOn
                    ? "bg-white text-slate-900 ring-black/10"
                    : "bg-transparent text-slate-600 ring-transparent hover:bg-black/[0.03]",
                ].join(" ")}
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

const areEqual = (prev: Props, next: Props) => {
  return (
    prev.groupName === next.groupName &&
    prev.memberCount === next.memberCount &&
    prev.centerName === next.centerName &&
    prev.centerSub === next.centerSub &&
    prev.nodes === next.nodes && // ✅ 핵심: nodes 참조가 같으면 캔버스 리렌더 스킵
    prev.ringCount === next.ringCount &&
    prev.maxSize === next.maxSize &&
    prev.minSize === next.minSize &&
    prev.aspect === next.aspect &&
    prev.showLegend === next.showLegend &&
    prev.onCenterChange === next.onCenterChange
  );
};

export default memo(EgoGraphCanvasResponsiveInner, areEqual);
