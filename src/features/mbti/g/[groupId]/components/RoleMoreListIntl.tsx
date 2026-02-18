"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type RoleMember = {
  name: string;
  mbti: string;
  fit: number;
};

export default function RoleMoreListIntl({
  roleKey,
  members,
  shown = 5,
}: {
  roleKey: string;
  members: RoleMember[];
  shown?: number;
}) {
  const t = useTranslations("groupComponents.roleMoreList");
  const [open, setOpen] = useState(false);

  const total = members.length;
  const moreCount = Math.max(0, total - shown);
  const rest = useMemo(() => members.slice(shown), [members, shown]);
  if (moreCount === 0) return null;

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
        <span>{t("more", { count: moreCount })}</span>
        <span className="text-slate-400">›</span>
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
              title={t("fitTitle", { fit: m.fit })}
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="w-4 shrink-0 text-[11px] font-extrabold text-slate-400">{shown + idx + 1}</span>
                <span className="truncate text-xs font-extrabold text-slate-900">{m.name}</span>
                <span className="text-slate-300">·</span>
                <span className="shrink-0 text-xs font-extrabold text-slate-600">{m.mbti}</span>
              </div>
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
        <span>{t("collapse")}</span>
        <span className="text-slate-400">↑</span>
      </button>
    </div>
  );
}
