"use client";

import React, { useMemo, useState } from "react";

type Person = { id: string; name: string; mbti: string };

// ✅ 예시 데이터 (12명)
const DEMO_PEOPLE: Person[] = [
  { id: "p1", name: "태주", mbti: "ENTJ" },
  { id: "p2", name: "서안", mbti: "INFP" },
  { id: "p3", name: "민지", mbti: "ENFP" },
  { id: "p4", name: "준호", mbti: "ISTJ" },
  { id: "p5", name: "하린", mbti: "INFJ" },
  { id: "p6", name: "도윤", mbti: "ESTP" },
  { id: "p7", name: "유진", mbti: "ISFJ" },
  { id: "p8", name: "지훈", mbti: "INTP" },
  { id: "p9", name: "수아", mbti: "ESFJ" },
  { id: "p10", name: "현우", mbti: "ENFJ" },
  { id: "p11", name: "나영", mbti: "ISTP" },
  { id: "p12", name: "다혜", mbti: "ESFP" },
];

// ✅ 예시 궁합 단계(1~4) 생성: (실제론 너의 인지기능 점수 결과로 대체)
function demoLevel(aId: string, bId: string) {
  const a = parseInt(aId.replace("p", ""), 10);
  const b = parseInt(bId.replace("p", ""), 10);
  if (a === b) return 0;
  return ((a * 7 + b * 3 + 11) % 4) + 1; // 1~4
}

// 단계별 선/노드 스타일
function edgeStroke(level: number) {
  switch (level) {
    case 4:
      return "rgba(16,185,129,0.85)"; // emerald
    case 3:
      return "rgba(16,185,129,0.45)";
    case 2:
      return "rgba(245,158,11,0.55)"; // amber
    case 1:
      return "rgba(244,63,94,0.55)"; // rose
    default:
      return "rgba(148,163,184,0.25)"; // slate
  }
}
function edgeWidth(level: number) {
  switch (level) {
    case 4:
      return 3.2;
    case 3:
      return 2.4;
    case 2:
      return 2.0;
    case 1:
      return 1.8;
    default:
      return 1.2;
  }
}
function nodeRing(level: number) {
  switch (level) {
    case 4:
      return "rgba(16,185,129,0.45)";
    case 3:
      return "rgba(16,185,129,0.25)";
    case 2:
      return "rgba(245,158,11,0.25)";
    case 1:
      return "rgba(244,63,94,0.25)";
    default:
      return "rgba(148,163,184,0.20)";
  }
}

export default function EgoGraphPreview() {
  const [centerId, setCenterId] = useState(DEMO_PEOPLE[0].id);

  const center = useMemo(
    () => DEMO_PEOPLE.find((p) => p.id === centerId)!,
    [centerId]
  );

  // 중심 제외한 나머지 11명
  const others = useMemo(() => {
    return DEMO_PEOPLE.filter((p) => p.id !== centerId);
  }, [centerId]);

  // 좌표 계산 (원형 배치 + 단계에 따라 거리 조절)
  const layout = useMemo(() => {
    const W = 420;
    const H = 320;
    const cx = W / 2;
    const cy = H / 2;

    // 단계별 반지름(4가 가장 가까움)
    const R = {
      4: 120,
      3: 150,
      2: 175,
      1: 200,
    } as const;

    const pts = others.map((p, idx) => {
      const level = demoLevel(centerId, p.id);
      const angle = (Math.PI * 2 * idx) / others.length - Math.PI / 2;
      const r = R[level as 1 | 2 | 3 | 4] ?? 92;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return { ...p, level, x, y };
    });

    return { W, H, cx, cy, pts };
  }, [centerId, others]);

  // TOP3 / 주의(1단계) 요약
  const summary = useMemo(() => {
    const sorted = [...layout.pts].sort((a, b) => b.level - a.level);
    const top = sorted.filter((x) => x.level >= 3).slice(0, 3);
    const warn = sorted.filter((x) => x.level === 1).slice(0, 2);
    return { top, warn };
  }, [layout.pts]);

  return (
    <div className="mt-6 rounded-3xl bg-white/75 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-black/5">
            관계도 미리보기
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {center.name} 기준으로 한눈에 보는 케미
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            중앙 인물을 기준으로 궁합 단계(1~4)에 따라 거리/선이 달라져요.
          </p>
        </div>

        {/* 기준 인물 선택 */}
        <div className="shrink-0">
          <label className="text-xs text-slate-500">기준 선택</label>
          <select
            value={centerId}
            onChange={(e) => setCenterId(e.target.value)}
            className="mt-1 w-[140px] rounded-xl bg-white px-3 py-2 text-sm text-slate-800 ring-1 ring-black/10 focus:outline-none"
          >
            {DEMO_PEOPLE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mbti})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 그래프 영역 */}
      <div className="mt-5 rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 p-4 ring-1 ring-black/5">
        <svg
          viewBox={`0 0 ${layout.W} ${layout.H}`}
          className="w-full h-[360px]"
          role="img"
          aria-label="이름 기준 관계도"
        >
          {/* 중심 노드 */}
          <g>
            <circle
              cx={layout.cx}
              cy={layout.cy}
              r="30"
              fill="white"
              stroke="rgba(15,23,42,0.12)"
              strokeWidth="2"
            />
            <text
              x={layout.cx}
              y={layout.cy - 2}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(15,23,42,0.95)"
              fontFamily="ui-sans-serif, system-ui"
              fontWeight="700"
            >
              {center.name}
            </text>
            <text
              x={layout.cx}
              y={layout.cy + 12}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(15,23,42,0.55)"
              fontFamily="ui-sans-serif, system-ui"
            >
              {center.mbti}
            </text>
          </g>

          {/* 엣지(선) */}
          {layout.pts.map((p) => (
            <line
              key={`edge-${p.id}`}
              x1={layout.cx}
              y1={layout.cy}
              x2={p.x}
              y2={p.y}
              stroke={edgeStroke(p.level)}
              strokeWidth={edgeWidth(p.level)}
              strokeLinecap="round"
            />
          ))}

          {/* 주변 노드 */}
          {layout.pts.map((p) => (
            <g key={`node-${p.id}`}
               className="cursor-pointer transition-transform duration-200 hover:scale-110"
               style={{ transformOrigin: `${p.x}px ${p.y}px` }
            }>
              <circle
                cx={p.x}
                cy={p.y}
                r="22"
                fill="white"
                stroke={nodeRing(p.level)}
                strokeWidth="5"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="22"
                fill="transparent"
                stroke="rgba(15,23,42,0.10)"
                strokeWidth="1.2"
              />
              <text
                x={p.x}
                y={p.y + 3}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(15,23,42,0.9)"
                fontFamily="ui-sans-serif, system-ui"
                fontWeight="600"
              >
                {p.name}
              </text>

              {/* 작은 단계 뱃지 */}
              <g>
                <circle
                  cx={p.x + 20}
                  cy={p.y - 20}
                  r="9"
                  fill="rgba(15,23,42,0.85)"
                />
                <text
                  x={p.x + 12}
                  y={p.y - 9}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fontFamily="ui-sans-serif, system-ui"
                  fontWeight="700"
                >
                  {p.level}
                </text>
              </g>
            </g>
          ))}
        </svg>

        {/* 단계 레전드 */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
            4 좋음
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700/80">
            3 무난
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
            2 번역필요
          </span>
          <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">
            1 주의
          </span>
        </div>
      </div>

      {/* 요약 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
          <div className="text-sm font-semibold texttext-slate-900 font-semibold text-slate-900">
            👍 잘 맞는 편 (TOP)
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {summary.top.length ? (
              summary.top.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-100"
                >
                  {p.name} · {p.level}단계
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">
                아직 뚜렷한 TOP가 없어요
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
          <div className="text-sm font-semibold text-slate-900">
            ⚠️ 번역/주의 포인트
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {summary.warn.length ? (
              summary.warn.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700 ring-1 ring-rose-100"
                >
                  {p.name} · {p.level}단계
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">
                큰 주의 상대는 없어요
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        ※ 예시 화면이에요. 실제 서비스에서는 MBTI 입력값으로 계산된 결과가 표시됩니다.
      </p>
    </div>
  );
}
