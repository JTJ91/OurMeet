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
  const v = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16
  );
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
  if (ringCount === 3)
    return [[...by[5], ...by[4]], [...by[3]], [...by[2], ...by[1]]];
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

/** ✅ 한 줄 요약(점수) - 밈은 줄이고, 낮은 점수는 조금 더 팩폭 */
function oneLineMessage(score?: number, color?: string) {
  const s = Number.isFinite(Number(score)) ? Number(score) : 0;

  const highlight = (text: string) => (
    <span style={{ color, fontWeight: 800 }}>{text}</span>
  );

  if (s >= 76)
    return <>이건 거의 {highlight("찰떡 라인")}이에요. 굳이 애쓰지 않아도 맞아요.</>;

  if (s >= 74)
    return <>상위권 케미. {highlight("같이 있을수록 편해지는 타입")}이에요.</>;

  if (s >= 72)
    return <>리듬이 자연스러워요. {highlight("말이 잘 통하는 조합")}이에요.</>;

  if (s >= 70)
    return <>기본 합이 좋아요. {highlight("갈등이 오래 가지 않아요")}.</>;

  if (s >= 66)
    return <>무난하게 잘 맞아요. {highlight("같이 있어도 부담이 적어요")}.</>;

  if (s >= 62)
    return <>괜찮은 조합이에요. {highlight("속도 차이만 조절하면")} 더 좋아요.</>;

  if (s >= 58)
    return <>나쁘지 않지만 {highlight("결이 조금 달라요")}.</>;

  if (s >= 54)
    return <>여기부터는 {highlight("조율이 관건")}이에요.</>;

  if (s >= 50)
    return <>서로 다르다는 게 {highlight("확실히 체감되는 조합")}이에요.</>;

  if (s >= 46)
    return <>대화하다가 {highlight("물음표가 자주 생길 수 있어요")}.</>;

  if (s >= 44)
    return <>가끔은 {highlight("왜 이렇게까지 다르지?")} 싶을 수 있어요.</>;

  if (s >= 42)
    return <>그냥 두면 {highlight("각자 말만 하게 될 확률")}이 높아요.</>;

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
  // NT
  INTJ: ["Ni", "Te", "Fi", "Se"],
  ENTJ: ["Te", "Ni", "Se", "Fi"],
  INTP: ["Ti", "Ne", "Si", "Fe"],
  ENTP: ["Ne", "Ti", "Fe", "Si"],
  // NF
  INFJ: ["Ni", "Fe", "Ti", "Se"],
  ENFJ: ["Fe", "Ni", "Se", "Ti"],
  INFP: ["Fi", "Ne", "Si", "Te"],
  ENFP: ["Ne", "Fi", "Te", "Si"],
  // SJ
  ISTJ: ["Si", "Te", "Fi", "Ne"],
  ESTJ: ["Te", "Si", "Ne", "Fi"],
  ISFJ: ["Si", "Fe", "Ti", "Ne"],
  ESFJ: ["Fe", "Si", "Ne", "Ti"],
  // SP
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

function isPerception(f: Fn) {
  return f === "Se" || f === "Si" || f === "Ne" || f === "Ni";
}
function isJudging(f: Fn) {
  return !isPerception(f);
}

function oppositeAxis(f: Fn): Fn {
  // 같은 영역(P/J)에서 반대 축
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

  // “충돌 축” 후보: 서로가 서로의 반대축을 들고 있거나,
  // 상위 기능이 서로 반대축일 때(Se↔Ni, Si↔Ne, Te↔Fi, Ti↔Fe)
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

  return {
    aTop,
    bTop,
    aAux,
    bAux,
    shared,
    clash: clashUniq,
  };
}

/** ✅ 버킷별 "장면"을 더 자연스럽게(밈 줄이고, 설명 문장과 잘 붙게) */
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

/** ✅ 텍스트 톤을 oneLineMessage랑 맞추기(좋은 건 더 좋게, 낮은 건 더 날카롭게) */
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

  // ✅ 공통점(짧게, 긍정 톤 강화)
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

  // ✅ 차이점(버킷에 따라 공격/부드러움 조절)
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

    // OK / TUNE / GOOD
    return pick(
      [
        `${scene}. ${axis}에서 방식이 갈라져요. 결론 전에 전제만 맞추면 충돌이 확 줄어요.`,
        `${scene}. ${axis} 축이 달라서, 한쪽은 “바로 하자”, 다른 쪽은 “납득이 먼저”로 갈릴 수 있어요.`,
        `${scene}. 특히 ${axis}에서 조율이 필요해요. 한 문장만 더해도 체감이 달라져요.`,
      ],
      seed + 37
    );
  })();

  // ✅ 최종 조합: 2문장 이내(가독성)
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
    const num = parseInt(
      h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
      16
    );
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
      <div className="flex items-baseline gap-2 tabular-nums">
        <span className="text-base font-extrabold tracking-tight" style={{ color }}>
          {Math.round(v)}
        </span>
        <span className="text-xs font-semibold text-slate-400">점</span>
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

  const COACH_KEY = "om_center_coach_v1";
  const [showCenterCoach, setShowCenterCoach] = useState(false);


  const safeNodes = useMemo(() => clampNodes(nodes, 20), [nodes]);

  const TOP_UI = 44; // px (원하면 40~52 사이로 조절)

  const size = useMemo(() => {
    const raw = Math.floor(wrapW);

    if (raw > 768) {
      return Math.min(900, raw); // PC에서는 900까지 허용
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

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

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

      const cx = w / 2;
      const cy = h / 2;

      const toScreen = (wx: number, wy: number) => ({
        x: cx + wx * fitScale * dpr,
        y: cy + wy * fitScale * dpr,
      });

      const centerR = size * 0.07 * fitScale * dpr;
      const nodeR = size * 0.058 * fitScale * dpr;

      // 링 가이드
      const ringsR = Array.from(new Set(placed.map((p) => p.r))).sort((a, b) => a - b);
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

      const isFocused = (lv: Level) => (focusLevel ? lv === focusLevel : true);

      const sortedNodes = [
        ...placed.filter((n) => n.id !== activeId),
        ...placed.filter((n) => n.id === activeId),
      ];

      sortedNodes.forEach((n) => {
        const p = toScreen(n.x, n.y);
        const isActive = activeId === n.id;
        const isHover = hoverId === n.id;

        const col = LEVEL_META[n.level].color;
        const focused = isFocused(n.level);
        const hasFocus = focusLevel !== null;

        const alpha = isActive ? 1 : hasFocus ? (focused ? 0.92 : 0.05) : 0.3;
        const baseLW = isActive ? 5.8 : isHover ? 5.0 : hasFocus ? (focused ? 4.2 : 2.0) : 3.0;

        const grad = ctx.createLinearGradient(cx, cy, p.x, p.y);
        grad.addColorStop(0, hexToRgba(col, Math.min(0.55, alpha)));
        grad.addColorStop(1, hexToRgba(col, Math.min(0.95, alpha)));

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 1;
        ctx.lineWidth = baseLW * dpr;
        ctx.lineCap = "round";

        if (n.level <= 2) ctx.setLineDash([7 * dpr, 10 * dpr]);
        else ctx.setLineDash([]);

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

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const fitScale = getFitScale(canvas.width, canvas.height, dpr);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const nodeR = size * 0.048 * fitScale * dpr;
    const hitR2 = nodeR * 1.3 * (nodeR * 1.3);

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

    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = id ? "pointer" : "default";
  };

  const onMouseLeave = () => {
    setHoverId(null);
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = "default";
  };

  const activeNode = useMemo(
    () => (activeId ? placed.find((p) => p.id === activeId) : null),
    [activeId, placed]
  );

  useEffect(() => {
  if (!activeNode) return;
  if (!onCenterChange) return;

  try {
    const seen = localStorage.getItem(COACH_KEY);
    if (seen) return;

    setShowCenterCoach(true);

    const t = window.setTimeout(() => {
      setShowCenterCoach(false);
      localStorage.setItem(COACH_KEY, "1");
    }, 2200);

    return () => window.clearTimeout(t);
  } catch {
    // storage 막힌 환경이면 무시
  }
}, [activeNode, onCenterChange]);


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
          <div className="mx-auto w-full max-w-[340px] overflow-visible rounded-2xl border border-black/10 bg-white/90 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur-md">
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
                    {/* 코치마크(처음 1회) - 우측 칩에 붙임 */}
                    {showCenterCoach && (
                      <div className="pointer-events-none absolute -top-9 right-0 z-50">
                        <div className="rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-white shadow">
                          센터 바꾸기 👇
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(null);
                        setFocusLevel(null);
                        setShowCenterCoach(false);

                        React.startTransition(() => {
                          onCenterChange(activeNode.id);
                        });

                        try {
                          localStorage.setItem(COACH_KEY, "1");
                        } catch {}
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
                // ✅ centerSub를 센터 MBTI로 쓰는 중(ENFP 같은 값)
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
                  isOn ? "bg-white text-slate-900 ring-black/10" : "bg-transparent text-slate-600 ring-transparent hover:bg-black/[0.03]",
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
