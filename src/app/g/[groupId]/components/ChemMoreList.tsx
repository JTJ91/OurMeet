"use client";

import { useMemo, useState } from "react";

type PairRow = {
  aId: string; aName: string; aMbti: string;
  bId: string; bName: string; bMbti: string;
  score: number;
};

export default function ChemMoreList({
  t,
  list,
  picksLength,
}: {
  t: "STABLE" | "COMPLEMENT" | "SPARK" | "EXPLODE";
  list: PairRow[];
  picksLength: number;
}) {
  const [open, setOpen] = useState(false);

  const rest = useMemo(() => {
    const sorted = [...list].sort((a, b) =>
      t === "EXPLODE" ? a.score - b.score : b.score - a.score
    );
    return sorted.slice(picksLength);
  }, [list, picksLength, t]);

  const moreCount = Math.max(0, list.length - picksLength);
  if (moreCount === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          mt-2 inline-flex items-center gap-1
          rounded-full
          bg-white/70
          px-3 py-1
          text-[11px] font-extrabold text-slate-600
          ring-1 ring-black/5
          hover:bg-white
          active:scale-95
          transition
        "
      >
        <span>+{moreCount}조합 더 있음</span>
        <span className="text-slate-400">▼</span>
      </button>
    );
  }


  return (
    <div className="mt-2 space-y-2">
      <div className="overflow-hidden rounded-xl bg-white/60 ring-1 ring-black/5">
        <ul className="max-h-56 overflow-auto divide-y divide-black/5">
          {rest.map((p, idx) => (
            <li
              key={`more-${t}-${p.aId}-${p.bId}`}
              className="flex items-center gap-2 px-3 py-2"
              title={`${p.aMbti} × ${p.bMbti}`}
            >
              <span className="w-4 shrink-0 text-[11px] font-extrabold text-slate-400">
                {picksLength + idx + 1}
              </span>

              <span className="truncate text-xs font-extrabold text-slate-900">
                {p.aName} × {p.bName}
              </span>

              <span className="ml-auto shrink-0 text-[11px] font-bold text-slate-500">
                {p.aMbti}/{p.bMbti}
              </span>

              {/* ✅ 점수 표시는 없음 */}
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ 접기는 맨 아래, 정상 동작 */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="
          mx-auto mt-1 inline-flex items-center gap-1
          rounded-full
          bg-white/60
          px-4 py-1.5
          text-[11px] font-extrabold text-slate-500
          ring-1 ring-black/5
          hover:bg-white
          active:scale-95
          transition
        "
      >
        <span>접기</span>
        <span className="text-slate-400">▲</span>
      </button>

    </div>
  );
}
