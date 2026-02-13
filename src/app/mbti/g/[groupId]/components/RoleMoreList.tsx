"use client";

import { useMemo, useState } from "react";

type RoleMember = {
  name: string;
  mbti: string;
  fit: number;
};

export default function RoleMoreList({
  roleKey,
  members,
  shown = 5,
}: {
  roleKey: string;          // key 안정성용 (STRATEGY/VIBE 등)
  members: RoleMember[];    // 이미 정렬된 리스트 전달해도 되고, 여기서 정렬해도 됨
  shown?: number;           // 기본 5명
}) {
  const [open, setOpen] = useState(false);

  const total = members.length;
  const moreCount = Math.max(0, total - shown);
  if (moreCount === 0) return null;

  const rest = useMemo(() => members.slice(shown), [members, shown]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          mt-2 inline-flex items-center gap-1
          rounded-full border border-slate-200/70 bg-white/88
          px-3 py-1
          text-[11px] font-extrabold text-slate-600
          shadow-[0_4px_12px_rgba(15,23,42,0.04)]
          hover:bg-white
          active:scale-95
          transition
        "
      >
        <span>+{moreCount}명 더 있음</span>
        <span className="text-slate-400">▼</span>
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/88">
        <ul className="max-h-56 overflow-auto divide-y divide-black/5">
          {rest.map((m, idx) => (
            <li
              key={`role-more-${roleKey}-${m.name}-${m.mbti}-${idx}`}
              className="flex items-center justify-between px-3 py-2"
              title={`적합도 ${m.fit}`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="w-4 shrink-0 text-[11px] font-extrabold text-slate-400">
                  {shown + idx + 1}
                </span>

                <span className="truncate text-xs font-extrabold text-slate-900">
                  {m.name}
                </span>

                <span className="text-slate-300">·</span>

                <span className="shrink-0 text-xs font-extrabold text-slate-600">
                  {m.mbti}
                </span>
              </div>

              {/* ✅ 여기서는 왕관/칭호 없이 깔끔하게 */}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="
          mx-auto inline-flex items-center gap-1
          rounded-full border border-slate-200/70 bg-white/88
          px-4 py-1.5
          text-[11px] font-extrabold text-slate-500
          shadow-[0_4px_12px_rgba(15,23,42,0.04)]
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
