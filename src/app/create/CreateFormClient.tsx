"use client";

import { useState } from "react";
import { createGroupAction } from "@/app/actions/group";

function isValidMbti(mbti: string) {
  return /^[EI][NS][TF][JP]$/.test(mbti);
}

export default function CreateFormClient() {
  const [mbtiError, setMbtiError] = useState<string | null>(null);

  return (
    <form
      action={createGroupAction}
      className="space-y-4"
      onSubmit={(e) => {
        const form = e.currentTarget;
        const mbtiEl = form.elements.namedItem("mbti") as HTMLInputElement | null;
        if (!mbtiEl) return;

        const mbti = (mbtiEl.value || "").trim().toUpperCase();

        // ✅ 제출 직전에 최종 검증
        if (!isValidMbti(mbti)) {
          e.preventDefault();
          setMbtiError("MBTI 형식이 올바르지 않아요. 예) ENFP");
          mbtiEl.focus();
          return;
        }

        setMbtiError(null);
        mbtiEl.value = mbti; // 서버로도 정규화된 값 전달
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
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)]"
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
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)]"
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
            }}
            onChange={(e) => {
              e.currentTarget.value = e.currentTarget.value
                .replace(/\s/g, "")
                .slice(0, 3);
            }}
          />
          <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
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
            inputMode="text"
            autoCapitalize="characters"
            aria-invalid={!!mbtiError}
            className={[
              "mt-2 w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm uppercase outline-none placeholder:text-slate-400",
              mbtiError
                ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]"
                : "border-black/10 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)]",
            ].join(" ")}
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
            }}
            onChange={(e) => {
              // 입력 중에는 형태만 정리 (검증은 submit에서 최종)
              const v = e.currentTarget.value
                .replace(/\s/g, "")
                .toUpperCase()
                .replace(/[^EINSFTJP]/g, "")
                .slice(0, 4);

              e.currentTarget.value = v;

              // ✅ 4글자면 바로 검사해서 즉시 피드백도 가능
              if (v.length === 4) {
                setMbtiError(isValidMbti(v) ? null : "MBTI 형식이 올바르지 않아요. 예) ENFP");
              } else {
                setMbtiError(null);
              }
            }}
            onBlur={(e) => {
              const v = (e.currentTarget.value || "").trim().toUpperCase();
              if (v.length === 4 && !isValidMbti(v)) {
                setMbtiError("MBTI 형식이 올바르지 않아요. 예) ENFP");
              }
            }}
          />

          {mbtiError ? (
            <p className="mt-2 text-[12px] font-semibold text-red-500">
              {mbtiError}
            </p>
          ) : (
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
              대소문자 상관없어요. (enfp / ENFP 모두 OK)
            </p>
          )}
        </label>
      </div>

      {/* maxMembers 안내 */}
      <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
        <div className="text-sm font-semibold text-slate-800">최대 인원</div>
        <p className="mt-1 text-sm text-slate-600">
          기본 <b className="text-slate-800">10명</b> · (추후 광고 시청 시{" "}
          <b className="text-slate-800">20명</b>으로 확장)
        </p>
        <input type="hidden" name="maxMembers" value="10" />
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-2xl bg-[#1E88E5] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:scale-[0.99]"
      >
        모임 만들기
      </button>
    </form>
  );
}
