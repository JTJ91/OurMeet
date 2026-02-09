"use client";

import { useRef, useState } from "react";
import { joinGroupAction } from "@/app/actions/members";

function isValidMbti(mbti: string) {
  return /^[EI][NS][TF][JP]$/.test(mbti);
}

export default function JoinFormClient({
  groupId,
  isFull,
}: {
  groupId: string;
  isFull: boolean;
}) {
  const [mbtiError, setMbtiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 렌더 틈까지 커버하는 “진짜 잠금”
  const lockedRef = useRef(false);

  return (
    <form
      action={async (fd: FormData) => {
        // ✅ 여기서는 그냥 서버액션 호출만
        // (성공하면 redirect로 이동)
        await joinGroupAction(fd);
      }}
      className={["mt-5 space-y-4", isSubmitting ? "pointer-events-none" : ""].join(" ")}
      onSubmit={(e) => {
        // 이미 잠겼으면 즉시 차단
        if (isFull || lockedRef.current) {
          e.preventDefault();
          return;
        }

        const form = e.currentTarget;

        const nickEl = form.elements.namedItem("nickname") as HTMLInputElement | null;
        const mbtiEl = form.elements.namedItem("mbti") as HTMLInputElement | null;
        if (!nickEl || !mbtiEl) return;

        // ✅ 정규화
        nickEl.value = (nickEl.value || "").replace(/\s/g, "").slice(0, 3);
        const mbti = (mbtiEl.value || "").replace(/\s/g, "").toUpperCase().slice(0, 4);
        mbtiEl.value = mbti;

        // ✅ 검증 실패면 제출 막고(잠금 X)
        if (!isValidMbti(mbti)) {
          e.preventDefault();
          setMbtiError("MBTI 형식이 올바르지 않아요. 예) ENFP");
          mbtiEl.focus();
          return;
        }

        setMbtiError(null);

        // ✅ 여기부터 “진짜 제출” → 즉시 잠금
        lockedRef.current = true;
        setIsSubmitting(true);

        // ✅ 가장 중요: “제출 버튼” DOM을 즉시 disabled (렌더 기다릴 필요 없음)
        const native = e.nativeEvent as SubmitEvent;
        const submitter = native.submitter as HTMLButtonElement | null;
        if (submitter) submitter.disabled = true;

        // 폼 전체도 busy 표시(선택)
        form.setAttribute("aria-busy", "true");
      }}
    >
      <input type="hidden" name="groupId" value={groupId} />

      {/* 별명 */}
      <label className="block">
        <div className="text-sm font-bold text-slate-800">내 별명</div>
        <input
          name="nickname"
          required
          maxLength={3}
          placeholder="예) 태주"
          disabled={isFull || isSubmitting}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[#1E88E5]/50 disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === " ") e.preventDefault();
          }}
          onChange={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\s/g, "").slice(0, 3);
          }}
        />
        <p className="mt-1 text-[11px] text-slate-500">공백 없이 최대 3글자</p>
      </label>

      {/* MBTI */}
      <label className="block">
        <div className="text-sm font-bold text-slate-800">MBTI</div>
        <input
          name="mbti"
          required
          maxLength={4}
          placeholder="예) ENFP"
          disabled={isFull || isSubmitting}
          aria-invalid={!!mbtiError}
          className={[
            "mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm uppercase outline-none disabled:opacity-60",
            mbtiError ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-[#1E88E5]/50",
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
          onBlur={(e) => {
            const v = (e.currentTarget.value || "").replace(/\s/g, "").toUpperCase();
            if (v.length === 4 && !isValidMbti(v)) {
              setMbtiError("MBTI 형식이 올바르지 않아요. 예) ENFP");
            }
          }}
        />

        {mbtiError ? (
          <p className="mt-1 text-[11px] font-semibold text-red-500">{mbtiError}</p>
        ) : (
          <p className="mt-1 text-[11px] text-slate-500">ENFP 형식, 공백 없이 4글자</p>
        )}
      </label>

      <button
        type="submit"
        disabled={isFull || isSubmitting}
        className={[
          "w-full rounded-2xl px-4 py-4 text-sm font-extrabold text-white transition-all duration-200 active:scale-[0.98]",
          isFull || isSubmitting ? "bg-slate-300" : "bg-[#1E88E5] hover:bg-[#1E88E5]/90",
        ].join(" ")}
      >
        {isFull ? "정원이 가득 찼어요" : isSubmitting ? "참여중…" : "🫶 모임에 참가하기"}
      </button>
    </form>
  );
}
