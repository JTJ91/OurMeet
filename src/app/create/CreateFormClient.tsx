"use client";

import { useRef, useState } from "react";
import { createGroupAction } from "@/app/actions/group";

function isValidMbti(mbti: string) {
  return /^[EI][NS][TF][JP]$/.test(mbti);
}

export default function CreateFormClient() {
  const [mbtiError, setMbtiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 진짜 잠금 (렌더 틈 방지)
  const lockedRef = useRef(false);

  return (
    <form
      action={async (fd: FormData) => {
        await createGroupAction(fd); // 성공 시 redirect
      }}
      className={[
        "space-y-4",
        isSubmitting ? "pointer-events-none" : "",
      ].join(" ")}
      onSubmit={(e) => {
        if (lockedRef.current) {
          e.preventDefault();
          return;
        }

        const form = e.currentTarget;
        const mbtiEl = form.elements.namedItem("mbti") as HTMLInputElement | null;
        if (!mbtiEl) return;

        const mbti = (mbtiEl.value || "").trim().toUpperCase();

        // ✅ MBTI 검증 실패면 잠그지 않음
        if (!isValidMbti(mbti)) {
          e.preventDefault();
          setMbtiError("MBTI 형식이 올바르지 않아요. 예) ENFP");
          mbtiEl.focus();
          return;
        }

        setMbtiError(null);
        mbtiEl.value = mbti;

        // ✅ 여기서부터 진짜 제출 → 즉시 잠금
        lockedRef.current = true;
        setIsSubmitting(true);

        // ✅ 렌더 기다리지 않고 버튼 즉시 비활성화
        const native = e.nativeEvent as SubmitEvent;
        const submitter = native.submitter as HTMLButtonElement | null;
        if (submitter) submitter.disabled = true;

        form.setAttribute("aria-busy", "true");
      }}
    >
      {/* 모임 이름 */}
      <label className="block">
        <div className="text-sm font-semibold text-slate-800">모임 이름</div>
        <input
          name="groupName"
          placeholder="예) 회사 동기 모임"
          required
          maxLength={30}
          disabled={isSubmitting}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)] disabled:opacity-60"
          onChange={(e) => {
            e.currentTarget.value = e.currentTarget.value.trimStart();
          }}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 내 별명 */}
        <label className="block">
          <div className="text-sm font-semibold text-slate-800">내 별명</div>
          <input
            name="nickname"
            placeholder="예) 태주"
            required
            maxLength={3}
            disabled={isSubmitting}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)] disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
            }}
            onChange={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/\s/g, "")
                .slice(0, 3);
            }}
          />
          <p className="mt-2 text-[12px] text-slate-500">
            공백 없이 최대 3글자
          </p>
        </label>

        {/* 내 MBTI */}
        <label className="block">
          <div className="text-sm font-semibold text-slate-800">내 MBTI</div>
          <input
            name="mbti"
            placeholder="예) ENFP"
            required
            maxLength={4}
            disabled={isSubmitting}
            aria-invalid={!!mbtiError}
            className={[
              "mt-2 w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm uppercase outline-none placeholder:text-slate-400 disabled:opacity-60",
              mbtiError
                ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]"
                : "border-black/10 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)]",
            ].join(" ")}
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
            }}
            onChange={(e) => {
              const v = e.currentTarget.value
                .replace(/\s/g, "")
                .toUpperCase()
                .replace(/[^EINSFTJP]/g, "")
                .slice(0, 4);

              e.currentTarget.value = v;

              if (v.length === 4) {
                setMbtiError(isValidMbti(v) ? null : "MBTI 형식이 올바르지 않아요. 예) ENFP");
              } else {
                setMbtiError(null);
              }
            }}
          />

          {mbtiError ? (
            <p className="mt-2 text-[12px] font-semibold text-red-500">
              {mbtiError}
            </p>
          ) : (
            <p className="mt-2 text-[12px] text-slate-500">
              대소문자 상관없어요. (enfp / ENFP 모두 OK)
            </p>
          )}
        </label>
      </div>

      <input type="hidden" name="maxMembers" value="10" />

      <button
        type="submit"
        disabled={isSubmitting}
        className={[
          "mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99]",
          isSubmitting
            ? "bg-slate-300"
            : "bg-[#1E88E5] hover:brightness-95",
        ].join(" ")}
      >
        {isSubmitting ? "생성중…" : "모임 만들기"}
      </button>
    </form>
  );
}
