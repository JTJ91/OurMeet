import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { flushSync } from "react-dom";

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
  pairAverageScore?: number | null;
  ringCount?: 2 | 3;
  maxSize?: number;
  minSize?: number;
  aspect?: number;
  showLegend?: boolean;
  onCenterChange?: (id: string) => void;
};

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  5: { label: "\uCC30\uB5A1\uAD81\uD569", color: "#1E88E5" },
  4: { label: "\uD569\uC88B\uC740\uD3B8", color: "#00C853" },
  3: { label: "\uADF8\uB7ED\uC800\uB7ED", color: "#FDD835" },
  2: { label: "\uC870\uC728\uD544\uC694", color: "#FB8C00" },
  1: { label: "\uD55C\uACC4\uC784\uBC15", color: "#D50000" },
};

const MBTI_ANIMAL: Record<string, string> = {
  INTJ: "🦉",
  INTP: "🐙",
  ENTJ: "🦁",
  ENTP: "🦊",
  INFJ: "🦌",
  INFP: "🐰",
  ENFJ: "🐬",
  ENFP: "🦜",
  ISTJ: "🐘",
  ISFJ: "🐶",
  ESTJ: "🦬",
  ESFJ: "🐼",
  ISTP: "🐺",
  ISFP: "🦦",
  ESTP: "🐯",
  ESFP: "🐹",
};

function animalOf(mbti?: string) {
  const key = (mbti || "").trim().toUpperCase();
  return MBTI_ANIMAL[key] || "🐾";
}

function animalIconSrc(mbti?: string) {
  const key = (mbti || "").trim().toUpperCase();
  if (!/^[EI][NS][TF][JP]$/.test(key)) return null;
  return `/mbti-animals/${key}.png`;
}

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
  fill: string | CanvasGradient | CanvasPattern,
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

function drawPremiumNodeCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  baseColor: string,
  isActive: boolean,
  isHover: boolean,
  dim: boolean
) {
  // Soft tinted fill that matches compatibility color.
  ctx.save();
  ctx.fillStyle = dim ? hexToRgba(baseColor, 0.08) : hexToRgba(baseColor, isActive ? 0.2 : 0.14);
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r - Math.max(1.2, r * 0.12)), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const shadowBlur = isActive ? 10 : isHover ? 8 : dim ? 3 : 6;
  const shadowColor = dim ? "rgba(15,23,42,0.05)" : "rgba(15,23,42,0.1)";
  const shadowOffsetY = isActive ? 2.5 : 1.5;
  drawSoftShadowCircle(ctx, x, y, r, "rgba(255,255,255,0.001)", shadowColor, shadowBlur, shadowOffsetY);

  // Strong, clean compatibility-colored ring.
  ctx.save();
  const ringW = Math.max(2.4, r * (isActive ? 0.18 : isHover ? 0.16 : 0.145));
  const ringR = Math.max(0, r - ringW / 2);
  ctx.strokeStyle = dim ? hexToRgba(baseColor, 0.5) : hexToRgba(baseColor, isActive ? 0.98 : 0.92);
  ctx.lineWidth = ringW;
  ctx.beginPath();
  ctx.arc(x, y, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (!dim) {
    ctx.save();
    ctx.strokeStyle = hexToRgba(baseColor, isActive ? 0.32 : 0.25);
    ctx.lineWidth = Math.max(1, ringW * 0.48);
    ctx.beginPath();
    ctx.arc(x, y, r + ringW * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
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

function layoutSunflower(nodes: EgoNode[], size: number) {
  if (!nodes.length) return [] as Array<EgoNode & { x: number; y: number; angle: number; ringIndex: number; r: number }>;

  const sorted = [...nodes].sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    const as = Number(a.score);
    const bs = Number(b.score);
    if (Number.isFinite(bs) && Number.isFinite(as) && bs !== as) return bs - as;
    return a.name.localeCompare(b.name);
  });

  const n = sorted.length;
  const golden = Math.PI * (3 - Math.sqrt(5)); // ~2.399963
  const start = -Math.PI / 2 + 0.35;

  const minR = size * 0.32;
  const maxR = size * 0.78;
  const span = Math.max(1, n - 1);

  const denseT = Math.max(0, Math.min(1, (n - 10) / 10));
  const nodeScale = 1 - 0.18 * denseT;
  const estNodeR = size * 0.089 * nodeScale;
  const estLabelGap = Math.max(10, estNodeR * 0.55);
  const estLineGap = Math.max(10, estNodeR * 0.5);

  const out = sorted.map((node, i) => {
    const t = i / span;
    const levelBias = (5 - node.level) * 0.045; // lower compatibility sits slightly farther out
    const rRaw = minR + (maxR - minR) * Math.sqrt(t);
    const r = Math.min(maxR, Math.max(minR, rRaw * (1 + levelBias)));
    const angle = start + i * golden + node.level * 0.06;
    const ringIndex = t < 0.34 ? 0 : t < 0.67 ? 1 : 2;

    return {
      ...node,
      angle,
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      ringIndex,
      r,
    };
  });

  const nodeLabel = (name: string) => (name.length > 5 ? `${name.slice(0, 4)}...` : name);
  const estLabelWidth = (node: { name: string; mbti: string }) => {
    const name = nodeLabel(node.name);
    const mbti = (node.mbti || "").trim().toUpperCase();
    const nameFont = Math.max(11, estNodeR * 0.42);
    const mbtiFont = Math.max(9, estNodeR * 0.3);
    const nameW = Math.max(16, name.length * nameFont * 0.62);
    const mbtiW = Math.max(12, mbti.length * mbtiFont * 0.62);
    return Math.max(nameW, mbtiW) + estNodeR * 0.5;
  };

  const boxOf = (p: { x: number; y: number; name: string; mbti: string }) => {
    const w = estLabelWidth(p);
    const top = p.y - estNodeR;
    const bottom = p.y + estNodeR + estLabelGap + estLineGap + estNodeR * 0.16;
    return {
      left: p.x - w / 2,
      right: p.x + w / 2,
      top,
      bottom,
    };
  };

  const overlapAabb = (
    a: { left: number; right: number; top: number; bottom: number },
    b: { left: number; right: number; top: number; bottom: number }
  ) => {
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ox <= 0 || oy <= 0) return null;
    return { ox, oy };
  };

  for (let iter = 0; iter < 180; iter++) {
    let moved = false;

    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i];
        const b = out[j];
        const ov = overlapAabb(boxOf(a), boxOf(b));
        if (!ov) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        let ux = dx / len;
        let uy = dy / len;
        if (Math.abs(ux) < 0.08 && Math.abs(uy) < 0.08) {
          ux = Math.cos((i + j) * 1.7);
          uy = Math.sin((i + j) * 1.7);
        }

        // Push by overlap amount + a small margin.
        const push = (Math.max(ov.ox, ov.oy) + 4) * 0.18;
        a.x -= ux * push;
        a.y -= uy * push;
        b.x += ux * push;
        b.y += uy * push;
        moved = true;
      }
    }

    for (let i = 0; i < out.length; i++) {
      const p = out[i];
      const d = Math.hypot(p.x, p.y) || 1;
      const t = i / span;
      const targetRaw = minR + (maxR - minR) * Math.sqrt(t);
      const target = Math.min(maxR, Math.max(minR, targetRaw * (1 + (5 - p.level) * 0.045)));
      const clamped = Math.min(maxR, Math.max(minR, d));
      const ndx = p.x / d;
      const ndy = p.y / d;
      const relaxed = clamped * 0.88 + target * 0.12;
      p.x = ndx * relaxed;
      p.y = ndy * relaxed;
      p.r = relaxed;
      p.angle = Math.atan2(p.y, p.x);
    }

    if (!moved) break;
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

/** ????�??�약(?�수) */
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

function scoreToLevel(score: number): Level {
  if (score >= 72) return 5;
  if (score >= 66) return 4;
  if (score >= 58) return 3;
  if (score >= 50) return 2;
  return 1;
}

function avgBandLabel(score: number) {
  if (score >= 72) return "상위권";
  if (score >= 66) return "양호";
  if (score >= 58) return "보통";
  if (score >= 50) return "조율 필요";
  return "낮음";
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
          `공통분모는 ${fnName(sharedTop)}예요. 포인트만 맞으면 금방 가까워져요.`,
          `${fnName(sharedTop)} 쪽 합이 좋아서 신뢰가 빨리 쌓여요.`,
        ],
        seed + 21
      )
    : pick(
        [
          "공통분모가 얇은 편이라 초반에는 서로를 해석하는 시간이 필요해요.",
          "처음엔 결이 달라 보여도 패턴이 잡히면 편해질 수 있어요.",
        ],
        seed + 21
      );

  const clashLine = (() => {
    if (!clashTop) {
      return pick(
        [
          `${scene}. 큰 충돌보다는 속도와 우선순위만 맞추면 좋아요.`,
          `${scene}. 같은 말도 다르게 들릴 수 있어서 해석 확인이 중요해요.`,
        ],
        seed + 37
      );
    }

    const axis = fnName(clashTop);

    if (bucket === "AUTO" || bucket === "HIGH") {
      return pick(
        [
          `${scene}. ${axis} 방식이 달라도 오히려 보완이 잘 돼요.`,
          `${scene}. ${axis}에서 역할이 나뉘면서 팀플처럼 굴러가요.`,
        ],
        seed + 37
      );
    }

    if (bucket === "LANG" || bucket === "HARD") {
      return pick(
        [
          `${scene}. ${axis}에서 친절의 기준이 달라 서운함이 생기기 쉬워요.`,
          `${scene}. ${axis} 축이 갈려서 한쪽은 결론, 다른 쪽은 납득을 원할 수 있어요.`,
        ],
        seed + 37
      );
    }

    return pick(
      [
        `${scene}. ${axis}에서 방식이 갈라져요. 결론 전에 전제만 맞추면 충돌이 줄어요.`,
        `${scene}. ${axis} 조율이 핵심이에요. 한 문장 더 설명하면 체감이 달라져요.`,
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
  pairAverageScore = null,
  ringCount = 3,
  maxSize = 760,
  minSize = 280,
  aspect = 1,
  showLegend = true,
  onCenterChange,
}: Props) {
  const { ref: wrapRef, w: wrapW } = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ??UI???�요???�태�?React state�??��?
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focusLevel, setFocusLevel] = useState<Level | null>(null);

  // ??hover??draw�??�리�?React re-render 방�?)
  const hoverIdRef = useRef<string | null>(null);

  // ??캔버??좌표 캐시 (hitTest 최적??
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

  // ??RAF�?draw ?�치�?
  const rafRef = useRef<number | null>(null);
  const drawQueuedRef = useRef(false);
  const iconCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const frozenDemoAvgRef = useRef<number | null>(null);

  const safeNodes = useMemo(() => clampNodes(nodes, 20), [nodes]);
  const memberSignature = useMemo(
    () => safeNodes.map((n) => n.id).sort().join("|"),
    [safeNodes]
  );
  const demoAvgScore = useMemo(() => {
    const scores = safeNodes
      .map((n) => Number(n.score))
      .filter((s) => Number.isFinite(s));
    if (!scores.length) return null;
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }, [safeNodes]);
  useEffect(() => {
    if (pairAverageScore != null) return;
    frozenDemoAvgRef.current = demoAvgScore;
  }, [memberSignature, pairAverageScore, demoAvgScore]);

  const avgScore = pairAverageScore ?? frozenDemoAvgRef.current ?? demoAvgScore;
  const avgLevel = avgScore == null ? null : scoreToLevel(avgScore);
  const avgColor = avgLevel ? LEVEL_META[avgLevel].color : "#94A3B8";
  const avgPercent = avgScore == null ? 0 : Math.max(0, Math.min(100, avgScore));
  const avgBand = avgScore == null ? "데이터 없음" : avgBandLabel(avgScore);

  const size = useMemo(() => {
    const raw = Math.floor(wrapW);
    if (raw > 768) return Math.min(900, raw);
    return Math.max(280, Math.min(420, raw));
  }, [wrapW]);

  const height = Math.floor(size * aspect);

  const placed: Placed[] = useMemo(() => layoutSunflower(safeNodes, size), [safeNodes, size]);

  const ringsR = useMemo(
    () => {
      if (!placed.length) return [] as number[];
      const radii = placed.map((p) => Math.hypot(p.x, p.y)).sort((a, b) => a - b);
      const at = (q: number) => radii[Math.max(0, Math.min(radii.length - 1, Math.floor((radii.length - 1) * q)))];
      return Array.from(new Set([at(0.3), at(0.62), at(1)])).filter((v) => Number.isFinite(v));
    },
    [placed]
  );

  // Fit content size in world coordinates (includes labels), derived from current member layout.
  const contentFit = useMemo(() => {
    const n = placed.length;
    const denseT = Math.max(0, Math.min(1, (n - 10) / 10));
    const nodeScale = 1 - 0.03 * denseT;
    const nodeR_world = size * 0.082 * nodeScale;
    const labelWorld = Math.max(size * 0.08, nodeR_world * 1.2);
    const margin_world = size * 0.06;
    let maxDist = 0;
    for (const n of placed) {
      const d = Math.hypot(n.x, n.y);
      if (d > maxDist) maxDist = d;
    }
    return {
      nodeR_world,
      margin_world,
      contentR_world: maxDist + nodeR_world + labelWorld + margin_world,
    };
  }, [placed, size]);

  const computeFitScale = (canvasWpx: number, canvasHpx: number, dpr: number) => {
    const availR_px = Math.min(canvasWpx, canvasHpx) / 2 / dpr;
    const s = availR_px / Math.max(1, contentFit.contentR_world);
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

  useEffect(() => {
    const keys = Array.from(
      new Set(
        [
          ...safeNodes.map((n) => (n.mbti || "").trim().toUpperCase()),
          (centerSub || "").trim().toUpperCase(),
        ]
          .filter((m) => /^[EI][NS][TF][JP]$/.test(m))
      )
    );

    keys.forEach((mbti) => {
      if (iconCacheRef.current[mbti]) return;
      const src = animalIconSrc(mbti);
      if (!src) return;

      const img = new Image();
      img.decoding = "async";
      img.onload = () => requestDraw();
      img.src = src;
      iconCacheRef.current[mbti] = img;
    });
  }, [safeNodes, centerSub]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { dpr, cx, cy } = geomRef.current;
    const fitScale = computeFitScale(canvas.width, canvas.height, dpr);
    geomRef.current.fitScale = fitScale;

    const w = canvas.width;
    const h = canvas.height;

    // ??clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, w, h);

    // ??배경(?�이??
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
      y: graphCy + wy * fitScale * dpr,
    });

    const denseT = Math.max(0, Math.min(1, (placed.length - 10) / 10));
    const nodeScale = 1 - 0.18 * denseT;
    const nodeR = size * 0.089 * nodeScale * fitScale * dpr;
    const centerR = nodeR * 1.04;
    let graphCy = cy;

    // Keep node + label bounds inside canvas vertically.
    const fitVertically = () => {
      const pad = Math.max(8 * dpr, nodeR * 0.35);
      let minTop = Infinity;
      let maxBottom = -Infinity;

      for (const n of placed) {
        const sy = graphCy + n.y * fitScale * dpr;
        const r = nodeR;
        const nameY = sy + r + Math.max(10 * dpr, r * 0.55);
        const mbtiY = nameY + Math.max(10 * dpr, r * 0.5);
        const top = sy - r;
        const bottom = mbtiY + Math.max(8 * dpr, r * 0.2);
        if (top < minTop) minTop = top;
        if (bottom > maxBottom) maxBottom = bottom;
      }

      if (minTop !== Infinity) {
        if (minTop < pad) graphCy += pad - minTop;
        if (maxBottom > h - pad) graphCy -= maxBottom - (h - pad);
      }
    };

    fitVertically();
    fitVertically();

    // ??hover??ref?�서 ?�기
    const hoverId = hoverIdRef.current;

    const isFocused = (lv: Level) => (focusLevel ? lv === focusLevel : true);
    const hasFocus = focusLevel !== null;

    // ??�?가?�드
    ringsR.forEach((rr, idx) => {
      const rpx = rr * fitScale * dpr;
      ctx.save();
      ctx.strokeStyle = idx === 0 ? "rgba(15,23,42,0.06)" : "rgba(15,23,42,0.045)";
      ctx.lineWidth = 1.4 * dpr;
      ctx.setLineDash([6 * dpr, 10 * dpr]);
      ctx.lineDashOffset = idx * 2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, graphCy, rpx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // ???�인(?�드 ?�결) ??gradient ?�성 비용 줄이?�면 ?�색+alpha로도 충분??
    // 지금�? 기존 ?�낌 ?��??�되, focus/hover?�서�?진하�?
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

      const alpha = hasFocus ? (focused ? 0.94 : 0.12) : 0.48;
      const baseLW = isHover ? 5.0 : hasFocus ? (focused ? 4.4 : 2.4) : 3.6;

      // ??gradient???��??�되, alpha ??�� ?�는 ?�색?�로 가볍게(?��? 최적??
      const useGrad = alpha > 0.18;
      const stroke: string | CanvasGradient = useGrad
        ? (() => {
            const g = ctx.createLinearGradient(cx, graphCy, p.x, p.y);
            g.addColorStop(0, hexToRgba(col, Math.min(0.55, alpha)));
            g.addColorStop(1, hexToRgba(col, Math.min(0.95, alpha)));
            return g;
          })()
        : hexToRgba(col, alpha);

      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.globalAlpha = 1;
      ctx.lineWidth = baseLW * dpr;
      ctx.lineCap = "round";

      if (n.level <= 2) ctx.setLineDash([7 * dpr, 10 * dpr]);
      else ctx.setLineDash([]);

      const dx = p.x - cx;
      const dy = p.y - graphCy;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const endScale = 1.0;
      const endR = nodeR * endScale;
      const pad = 2.5 * dpr;
      const x1 = cx + ux * (centerR + pad);
      const y1 = graphCy + uy * (centerR + pad);
      const x2 = p.x - ux * (endR + pad);
      const y2 = p.y - uy * (endR + pad);

      const bend = 0.12;
      drawCurvedLine(ctx, x1, y1, x2, y2, bend);
      ctx.restore();
    });

    // Center node: draw in the same visual language as surrounding nodes.
    drawPremiumNodeCircle(ctx, cx, graphCy, centerR, "#94A3B8", false, false, false);

    const centerMbtiKey = (centerSub || "").trim().toUpperCase();
    const centerIcon = iconCacheRef.current[centerMbtiKey];
    const centerIconR = centerR * 0.9;
    const centerIconY = graphCy;

    if (centerIcon && centerIcon.complete && centerIcon.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, centerIconY, centerIconR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(centerIcon, cx - centerIconR, centerIconY - centerIconR, centerIconR * 2, centerIconR * 2);
      ctx.fillStyle = hexToRgba("#94A3B8", 0.08);
      ctx.beginPath();
      ctx.arc(cx, centerIconY, centerIconR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = "#0F172A";
      ctx.font = `${Math.round(centerR * 1.25)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(animalOf(centerSub), cx, centerIconY);
    }

    ctx.save();
    const centerNameY = graphCy + centerR + Math.max(10 * dpr, centerR * 0.55);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#0F172A";
    ctx.font = `700 ${Math.max(11, Math.round(centerR * 0.42))}px ui-sans-serif, system-ui, -apple-system`;
    ctx.fillText(centerName, cx, centerNameY);

    if (centerSub) {
      ctx.fillStyle = "rgba(15,23,42,0.62)";
      ctx.font = `700 ${Math.max(9, Math.round(centerR * 0.3))}px ui-sans-serif, system-ui, -apple-system`;
      ctx.fillText(centerSub.toUpperCase(), cx, centerNameY + Math.max(10 * dpr, centerR * 0.5));
    }
    ctx.restore();

    const pts: Array<{ id: string; x: number; y: number }> = [];

    placed.forEach((n) => {
      const p = toScreen(n.x, n.y);
      pts.push({ id: n.id, x: p.x, y: p.y });

      const isActive = activeId === n.id;
      const isHover = hoverId === n.id;
      const meta = LEVEL_META[n.level];
      const focused = isFocused(n.level);

      const dim = (focusLevel && !isFocused(n.level)) || (activeId && !isActive);
      const scale = 1.0;
      const r = nodeR * scale;

      const nodeAlpha = activeId ? (isActive ? 1 : 0.6) : hasFocus ? (focused ? 1 : 0.22) : 1;
      ctx.globalAlpha = nodeAlpha;

      drawPremiumNodeCircle(
        ctx,
        p.x,
        p.y,
        r,
        meta.color,
        false,
        isHover,
        !!dim
      );

      const label = n.name.length > 5 ? `${n.name.slice(0, 4)}...` : n.name;
      const mbtiKey = (n.mbti || "").trim().toUpperCase();
      const iconImg = iconCacheRef.current[mbtiKey];
      const iconR = r * 0.9;

      if (iconImg && iconImg.complete && iconImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, iconR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(iconImg, p.x - iconR, p.y - iconR, iconR * 2, iconR * 2);
        ctx.fillStyle = dim ? hexToRgba(meta.color, 0.08) : hexToRgba(meta.color, isActive ? 0.14 : 0.11);
        ctx.beginPath();
        ctx.arc(p.x, p.y, iconR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        const emoji = animalOf(n.mbti);
        ctx.fillStyle = dim ? "rgba(15,23,42,0.35)" : "#0F172A";
        ctx.font = `${Math.round(r * 0.9)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, p.x, p.y + 0.5 * dpr);
      }

      // Name + MBTI under node
      ctx.save();
      const nameY = p.y + r + Math.max(10 * dpr, r * 0.55);

      ctx.fillStyle = activeId
        ? isActive
          ? "#0F172A"
          : "rgba(15,23,42,0.38)"
        : hasFocus
        ? focused
          ? "#0F172A"
          : "rgba(15,23,42,0.28)"
        : dim
        ? "rgba(15,23,42,0.45)"
        : "#0F172A";
      ctx.font = `${isActive ? 700 : 650} ${Math.max(11, Math.round(r * 0.42))}px ui-sans-serif, system-ui, -apple-system`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, p.x, nameY);
      ctx.fillStyle = dim ? "rgba(15,23,42,0.42)" : "rgba(15,23,42,0.62)";
      if (!activeId && hasFocus && !focused) {
        ctx.fillStyle = "rgba(15,23,42,0.3)";
      }
      ctx.font = `700 ${Math.max(9, Math.round(r * 0.3))}px ui-sans-serif, system-ui, -apple-system`;
      ctx.fillText(mbtiKey, p.x, nameY + Math.max(10 * dpr, r * 0.5));
      ctx.restore();
    });

    // ??hitTest 캐시 갱신
    geomRef.current.pts = pts;

    // ??hit radius 캐시: ?�제 ?�드 반�?�?기반?�로 (빈공�??�릭 ?�판 줄이�?
    const hitR = nodeR * 1.08; // 1.05~1.15 ?�이 취향(?�을?�록 빈공�????�힘)
    geomRef.current.hitR2 = hitR * hitR;

    ctx.globalAlpha = 1;
  };

  // ??1) 캔버??버퍼/?��????�데?�트: size/height 변???�만
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    // CSS ?�기
    canvas.style.width = "100%";
    canvas.style.height = `${height}px`;
    const rect = canvas.getBoundingClientRect();

    const cssW = Math.round(rect.width);
    const cssH = Math.round(rect.height);

    // CSS ?�수 고정
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
  }, [height, size, placed]); // placed 변?�도 fitScale ?�향??�????�음

  // ??2) draw ?�리�? state 변??hover ?�외)
  useEffect(() => {
    requestDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, focusLevel, centerName, centerSub, ringsR]);

  // ??rect???�크롤로??변?�니 ?�인???�벤?�에??최신??가벼운 ?��?)
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

    // ??빈공�??�릭 = 즉시 ?�제
    if (!id) {
      flushSync(() => {
        setActiveId(null);
        setFocusLevel(null);
      });

      hoverIdRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = "default";

      draw(); // ???�제 최신 state�?즉시 draw ??
      return;
    }

    // ???�드 ?�릭: ?��?(next�?먼�? 계산?�서 ?�기 반영)
    const next = (activeId === id) ? null : id;

    flushSync(() => {
      setActiveId(next);
    });

    if (next === null) {
      hoverIdRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = "default";
    }

    draw();        // ???�릭 즉시 커짐/?�아�?반영
    requestDraw(); // ???�시 ?�여 RAF가 ?�으�??�전?�게 ??�???
  };




  const onMouseMove = (e: React.MouseEvent) => {
    refreshRect();
    const id = hitTest(e.clientX, e.clientY);

    // activeId가 null?�고, hover�?커�???�??�으�?
    if (activeId === null && id !== null) {
      // hover�??��??��? 말�???취향
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
      <div className="bg-[rgb(248,250,252)] py-1">
        <div className="mx-auto w-full max-w-[260px] px-1">
          <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold tracking-wide text-slate-500">
            우리 모임 평균 점수
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: avgColor }}>
            {avgScore == null ? "-" : `${avgScore.toFixed(2)}점`}
          </span>
        </div>

        <div className="mt-1.5 relative h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${avgPercent}%`,
              background: `linear-gradient(90deg, ${hexToRgba(avgColor, 0.75)}, ${hexToRgba(avgColor, 1)})`,
              boxShadow: `0 0 10px ${hexToRgba(avgColor, 0.22)}`,
            }}
          />
        </div>

        <div className="mt-1 text-center text-[11px] font-semibold" style={{ color: avgColor }}>
          {avgBand}
        </div>
        </div>
      </div>

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
                  <span className="text-slate-300">|</span>
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
    prev.nodes === next.nodes && // ???�심: nodes 참조가 같으�?캔버??리렌???�킵
    prev.pairAverageScore === next.pairAverageScore &&
    prev.ringCount === next.ringCount &&
    prev.maxSize === next.maxSize &&
    prev.minSize === next.minSize &&
    prev.aspect === next.aspect &&
    prev.showLegend === next.showLegend &&
    prev.onCenterChange === next.onCenterChange
  );
};

export default memo(EgoGraphCanvasResponsiveInner, areEqual);
