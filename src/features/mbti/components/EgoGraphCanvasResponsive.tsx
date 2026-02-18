import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { flushSync } from "react-dom";
import { useTranslations } from "next-intl";

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

type HitTarget = {
  id: string;
  x: number;
  y: number;
  hitR2: number;
  labelLeft: number;
  labelRight: number;
  labelTop: number;
  labelBottom: number;
};

const LEVEL_META: Record<Level, { color: string }> = {
  5: { color: "#1E88E5" },
  4: { color: "#00C853" },
  3: { color: "#FDD835" },
  2: { color: "#FB8C00" },
  1: { color: "#D50000" },
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
type Translator = ReturnType<typeof useTranslations>;

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
function levelLabel(level: Level, t: Translator) {
  return t(`levels.${level}`);
}

function oneLineMessage(score: number | undefined, color: string | undefined, t: Translator) {
  const s = Number.isFinite(Number(score)) ? Number(score) : 0;
  const highlight = (text: string) => <span style={{ color, fontWeight: 800 }}>{text}</span>;
  const rich = (key: string) =>
    t.rich(`oneLine.${key}`, {
      h: (chunks) => highlight(String(chunks)),
    });

  if (s >= 76) return rich("s76");
  if (s >= 74) return rich("s74");
  if (s >= 72) return rich("s72");
  if (s >= 70) return rich("s70");
  if (s >= 66) return rich("s66");
  if (s >= 62) return rich("s62");
  if (s >= 58) return rich("s58");
  if (s >= 54) return rich("s54");
  if (s >= 50) return rich("s50");
  if (s >= 46) return rich("s46");
  if (s >= 44) return rich("s44");
  if (s >= 42) return rich("s42");
  return rich("base");
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

function avgBandLabel(score: number, t: Translator) {
  if (score >= 72) return t("avg.bands.high");
  if (score >= 66) return t("avg.bands.good");
  if (score >= 58) return t("avg.bands.normal");
  if (score >= 50) return t("avg.bands.tune");
  return t("avg.bands.low");
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

function fnName(f: Fn, t: Translator) {
  switch (f) {
    case "Se":
      return t("fnName.Se");
    case "Si":
      return t("fnName.Si");
    case "Ne":
      return t("fnName.Ne");
    case "Ni":
      return t("fnName.Ni");
    case "Te":
      return t("fnName.Te");
    case "Ti":
      return t("fnName.Ti");
    case "Fe":
      return t("fnName.Fe");
    case "Fi":
      return t("fnName.Fi");
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

function bucketSituation(bucket: MsgBucket, t: Translator) {
  switch (bucket) {
    case "AUTO":
      return [t("bucketSituation.AUTO.0"), t("bucketSituation.AUTO.1"), t("bucketSituation.AUTO.2")];
    case "HIGH":
      return [t("bucketSituation.HIGH.0"), t("bucketSituation.HIGH.1"), t("bucketSituation.HIGH.2")];
    case "GOOD":
      return [t("bucketSituation.GOOD.0"), t("bucketSituation.GOOD.1"), t("bucketSituation.GOOD.2")];
    case "OK":
      return [t("bucketSituation.OK.0"), t("bucketSituation.OK.1"), t("bucketSituation.OK.2")];
    case "TUNE":
      return [t("bucketSituation.TUNE.0"), t("bucketSituation.TUNE.1"), t("bucketSituation.TUNE.2")];
    case "LANG":
      return [t("bucketSituation.LANG.0"), t("bucketSituation.LANG.1"), t("bucketSituation.LANG.2")];
    case "HARD":
      return [t("bucketSituation.HARD.0"), t("bucketSituation.HARD.1"), t("bucketSituation.HARD.2")];
  }
}

function makeCognitiveMessage(
  centerMbtiRaw: string | undefined,
  otherMbtiRaw: string | undefined,
  score: number | undefined,
  t: Translator
) {
  const aMbti = normMbti(centerMbtiRaw);
  const bMbti = normMbti(otherMbtiRaw);
  if (!aMbti || !bMbti) return null;

  const bucket = scoreToBucket(score);
  const info = analyzePair(aMbti, bMbti);

  const seed = hashSeed(`${aMbti}_${bMbti}_${bucket}`);
  const scene = pick(bucketSituation(bucket, t), seed);

  const sharedTop = info.shared.length ? pick(info.shared, seed + 7) : null;
  const clashTop = info.clash.length ? pick(info.clash, seed + 13) : null;

  const sharedLine = sharedTop
    ? pick(
        [
          t("cognitive.shared.withFn.0", { fn: fnName(sharedTop, t) }),
          t("cognitive.shared.withFn.1", { fn: fnName(sharedTop, t) }),
        ],
        seed + 21
      )
    : pick(
        [
          t("cognitive.shared.withoutFn.0"),
          t("cognitive.shared.withoutFn.1"),
        ],
        seed + 21
      );

  const clashLine = (() => {
    if (!clashTop) {
      return pick(
        [
          t("cognitive.clash.noClash.0", { scene }),
          t("cognitive.clash.noClash.1", { scene }),
        ],
        seed + 37
      );
    }

    const axis = fnName(clashTop, t);

    if (bucket === "AUTO" || bucket === "HIGH") {
      return pick(
        [
          t("cognitive.clash.high.0", { scene, axis }),
          t("cognitive.clash.high.1", { scene, axis }),
        ],
        seed + 37
      );
    }

    if (bucket === "LANG" || bucket === "HARD") {
      return pick(
        [
          t("cognitive.clash.low.0", { scene, axis }),
          t("cognitive.clash.low.1", { scene, axis }),
        ],
        seed + 37
      );
    }

    return pick(
      [
        t("cognitive.clash.mid.0", { scene, axis }),
        t("cognitive.clash.mid.1", { scene, axis }),
      ],
      seed + 37
    );
  })();

  return pick([`${sharedLine} ${clashLine}`, `${clashLine} ${sharedLine}`], seed + 55);
}

function ScoreBar({
  value,
  color,
  t,
}: {
  value: number;
  color: string;
  t: Translator;
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
        <span className="text-xs font-semibold text-slate-400">{t("scoreUnit")}</span>
      </div>
    </div>
  );
}

function EgoGraphCanvasResponsiveInner({
  memberCount,
  centerName,
  centerSub,
  nodes,
  pairAverageScore = null,
  maxSize = 760,
  minSize = 280,
  aspect = 1,
  showLegend = true,
  onCenterChange,
}: Props) {
  const t = useTranslations("mbti.egoGraphCanvas");
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
    // screen positions for hit-test
    pts: [] as HitTarget[],
  });

  // ??RAF�?draw ?�치�?
  const rafRef = useRef<number | null>(null);
  const drawQueuedRef = useRef(false);
  const drawRef = useRef<() => void>(() => {});
  const bgFillRef = useRef<{ w: number; h: number; dpr: number; fill: CanvasGradient | string } | null>(null);
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
  const canShowAverage = (memberCount ?? safeNodes.length + 1) >= 2;
  const avgLevel = !canShowAverage || avgScore == null ? null : scoreToLevel(avgScore);
  const avgColor = avgLevel ? LEVEL_META[avgLevel].color : "#94A3B8";
  const avgPercent = !canShowAverage || avgScore == null ? 0 : Math.max(0, Math.min(100, avgScore));
  const avgBand = !canShowAverage
    ? t("avg.minMembers")
    : avgScore == null
    ? t("avg.noData")
    : avgBandLabel(avgScore, t);

  const size = useMemo(() => {
    const raw = Math.floor(wrapW);
    if (raw > 768) return Math.min(maxSize, raw);
    return Math.max(minSize, Math.min(420, raw));
  }, [wrapW, maxSize, minSize]);

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
      drawRef.current();
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
    const cachedBg = bgFillRef.current;
    let bgFill: CanvasGradient | string;
    if (cachedBg && cachedBg.w === w && cachedBg.h === h && cachedBg.dpr === dpr) {
      bgFill = cachedBg.fill;
    } else {
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
      bgFill = bg;
      bgFillRef.current = { w, h, dpr, fill: bgFill };
    }
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, w, h);

    const denseT = Math.max(0, Math.min(1, (placed.length - 10) / 10));
    const nodeScale = 1 - 0.18 * denseT;
    const nodeR = size * 0.089 * nodeScale * fitScale * dpr;
    const centerR = nodeR * 1.04;
    let graphCy = cy;
    const mobileTextBoost = size <= 430 ? 1.24 : 1;
    const graphTextScale = 1.5;

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

    const placedScreen = placed.map((n) => ({
      n,
      x: cx + n.x * fitScale * dpr,
      y: graphCy + n.y * fitScale * dpr,
    }));

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
    const drawEdge = (item: { n: Placed; x: number; y: number }) => {
      const { n, x, y } = item;
      const isActive = activeId === n.id;
      const isHover = hoverId === n.id;

      const col = LEVEL_META[n.level].color;
      const focused = isFocused(n.level);

      const alpha = hasFocus ? (focused ? 0.94 : 0.12) : 0.48;
      const baseLW = isHover ? 5.0 : hasFocus ? (focused ? 4.4 : 2.4) : 3.6;
      const isDashed = n.level <= 2;

      // Gradient is expensive; reserve it for active/hovered edge only.
      const useGrad = isActive || isHover;
      const stroke: string | CanvasGradient = useGrad
        ? (() => {
            const g = ctx.createLinearGradient(cx, graphCy, x, y);
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

      if (isDashed) ctx.setLineDash([7 * dpr, 10 * dpr]);
      else ctx.setLineDash([]);

      const dx = x - cx;
      const dy = y - graphCy;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const endScale = 1.0;
      const endR = nodeR * endScale;
      const pad = isDashed ? 0.25 * dpr : 2.5 * dpr;
      const x1 = cx + ux * (centerR + pad);
      const y1 = graphCy + uy * (centerR + pad);
      const x2 = x - ux * (endR + pad);
      const y2 = y - uy * (endR + pad);

      const bend = 0.12;
      drawCurvedLine(ctx, x1, y1, x2, y2, bend);
      ctx.restore();
    };

    if (activeId === null) {
      placedScreen.forEach(drawEdge);
    } else {
      placedScreen.forEach((item) => {
        if (item.n.id !== activeId) drawEdge(item);
      });
      const activeItem = placedScreen.find((item) => item.n.id === activeId);
      if (activeItem) drawEdge(activeItem);
    }

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
    const centerNameFontPx = Math.max(12, Math.round(centerR * 0.42 * mobileTextBoost * graphTextScale));
    ctx.fillStyle = "#0F172A";
    ctx.font = `700 ${centerNameFontPx}px ui-sans-serif, system-ui, -apple-system`;
    ctx.fillText(centerName, cx, centerNameY);

    if (centerSub) {
      const centerMbtiFontPx = Math.max(10, Math.round(centerR * 0.3 * mobileTextBoost * graphTextScale));
      const centerLineGap = Math.max(10 * dpr, centerNameFontPx * 0.7, centerMbtiFontPx * 1.05);
      ctx.fillStyle = "rgba(15,23,42,0.62)";
      ctx.font = `700 ${centerMbtiFontPx}px ui-sans-serif, system-ui, -apple-system`;
      ctx.fillText(centerSub.toUpperCase(), cx, centerNameY + centerLineGap);
    }
    ctx.restore();

    const pts: HitTarget[] = [];

    placedScreen.forEach(({ n, x, y }) => {
      const p = { x, y };

      const isActive = activeId === n.id;
      const isHover = hoverId === n.id;
      const meta = LEVEL_META[n.level];
      const focused = isFocused(n.level);

      const dim = (focusLevel && !isFocused(n.level)) || (activeId && !isActive);
      const scale = isActive ? 1.24 : 1.0;
      const r = nodeR * scale;

      const nodeAlpha = activeId ? (isActive ? 1 : 0.6) : hasFocus ? (focused ? 1 : 0.22) : 1;
      ctx.globalAlpha = nodeAlpha;

      drawPremiumNodeCircle(
        ctx,
        p.x,
        p.y,
        r,
        meta.color,
        isActive,
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
      const nameFontPx = Math.max(
        12,
        Math.round(r * 0.42 * mobileTextBoost * graphTextScale * (isActive ? 1.14 : 1))
      );
      ctx.font = `${isActive ? 700 : 650} ${nameFontPx}px ui-sans-serif, system-ui, -apple-system`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, p.x, nameY);
      ctx.fillStyle = dim ? "rgba(15,23,42,0.42)" : "rgba(15,23,42,0.62)";
      if (!activeId && hasFocus && !focused) {
        ctx.fillStyle = "rgba(15,23,42,0.3)";
      }
      const mbtiFontPx = Math.max(
        10,
        Math.round(r * 0.3 * mobileTextBoost * graphTextScale * (isActive ? 1.14 : 1))
      );
      const labelLineGap = Math.max(10 * dpr, nameFontPx * 0.7, mbtiFontPx * 1.05);
      ctx.font = `700 ${mbtiFontPx}px ui-sans-serif, system-ui, -apple-system`;
      ctx.fillText(mbtiKey, p.x, nameY + labelLineGap);

      const mbtiW = Math.max(10, mbtiKey.length * mbtiFontPx * 0.62);
      const nameW = Math.max(12, label.length * nameFontPx * 0.62);
      const labelHalfW = Math.max(nameW, mbtiW) / 2 + Math.max(8 * dpr, r * 0.22);
      const labelHalfH = Math.max(nameFontPx, mbtiFontPx) * 0.65;
      pts.push({
        id: n.id,
        x: p.x,
        y: p.y,
        hitR2: Math.pow(r * 1.08, 2),
        labelLeft: p.x - labelHalfW,
        labelRight: p.x + labelHalfW,
        labelTop: nameY - labelHalfH,
        labelBottom: nameY + labelLineGap + labelHalfH,
      });
      ctx.restore();
    });

    // ??hitTest 캐시 갱신
    geomRef.current.pts = pts;

    ctx.globalAlpha = 1;
  };
  drawRef.current = draw;

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

    const pts = g.pts;

    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      if (dist2(sx, sy, p.x, p.y) <= p.hitR2) return p.id;
      if (sx >= p.labelLeft && sx <= p.labelRight && sy >= p.labelTop && sy <= p.labelBottom) {
        return p.id;
      }
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
      requestDraw();
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
    requestDraw();
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
            {t("avg.title")}
          </span>
          {canShowAverage ? (
            <span className="text-sm font-bold tabular-nums" style={{ color: avgColor }}>
              {avgScore == null ? "-" : t("scoreWithUnit", { score: avgScore.toFixed(2) })}
            </span>
          ) : null}
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
          {t("guide.title")}
          <div className="mt-1 text-[11px] font-semibold text-slate-500">
            {t("guide.subtitle")}
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
                      aria-label={t("center.aria")}
                    >
                      <span className="text-[12px]">🎯</span>
                      {t("center.button")}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-2 flex w-full items-center gap-3">
                <span
                  className="shrink-0 text-sm font-extrabold"
                  style={{ color: LEVEL_META[activeNode.level].color }}
                >
                  {levelLabel(activeNode.level, t)}
                </span>

                {scoreNum != null && (
                  <ScoreBar value={scoreNum} color={LEVEL_META[activeNode.level].color} t={t} />
                )}
              </div>

              <div className="mt-2 text-xs font-medium text-slate-600">
                {oneLineMessage(activeNode.score, LEVEL_META[activeNode.level].color, t)}
              </div>

              {(() => {
                const msg = makeCognitiveMessage(centerSub, activeNode.mbti, activeNode.score, t);
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
                <span>{levelLabel(lv, t)}</span>
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
