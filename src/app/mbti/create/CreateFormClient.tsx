"use client";

import { useEffect, useRef, useState } from "react";
import { createGroupAction } from "@/app/mbti/actions/group";
import { upsertSavedGroup } from "@/app/lib/mbti/groupHistory";
import { useRouter } from "next/navigation";
import MbtiTestModal from "@/app/components/mbtiTest/MbtiTestModal8";
import { useSearchParams } from "next/navigation";


function isValidMbti(mbti: string) {
  return /^[EI][NS][TF][JP]$/.test(mbti);
}

export default function CreateFormClient() {
  const [mbtiError, setMbtiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockedRef = useRef(false);
  const router = useRouter();

  const [testOpen, setTestOpen] = useState(false);
  const mbtiInputRef = useRef<HTMLInputElement | null>(null);

  const sp = useSearchParams();

  const mbtiFromTest = (sp.get("mbti") ?? "").trim().toUpperCase();
  
  // ✅ /mbti/create?mbti=ENFP 로 들어오면 자동 입력
  useEffect(() => {
    const raw = (sp.get("mbti") || "")
      .replace(/\s/g, "")
      .toUpperCase()
      .replace(/[^EINSFTJP]/g, "")
      .slice(0, 4);

    if (!raw) return;

    if (mbtiInputRef.current) {
      mbtiInputRef.current.value = raw;
      // UX: 들어오자마자 포커스 줄 필요 없으면 지워도 됨
      // mbtiInputRef.current.focus();
    }

    setMbtiError(raw.length === 4 && !isValidMbti(raw) ? "MBTI 형식이 올바르지 않아요. 예) ENFP" : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  return (
    <form
      action={async (fd: FormData) => {
        try {
          const result = await createGroupAction(fd);
          
          upsertSavedGroup({
            id: result.groupId,
            name: result.groupName,
            myMemberId: result.memberId,
            myNickname: String(fd.get("nickname") || ""),
            myMbti: String(fd.get("mbti") || "").toUpperCase(),
          });

          const base = "/mbti";
          router.replace(`${base}/g/${result.groupId}?center=${result.memberId}`);
        } catch (err: any) {
          alert(err?.message ?? "모임 생성 중 문제가 발생했어요.");
          lockedRef.current = false;
          setIsSubmitting(false);
        }
      }}
      className={["mt-5 space-y-4", isSubmitting ? "pointer-events-none" : ""].join(" ")}
      onSubmit={(e) => {
        if (lockedRef.current) {
          e.preventDefault();
          return;
        }

        const form = e.currentTarget;
        const groupEl = form.elements.namedItem("groupName") as HTMLInputElement | null;
        const nickEl = form.elements.namedItem("nickname") as HTMLInputElement | null;
        const mbtiEl = form.elements.namedItem("mbti") as HTMLInputElement | null;
        if (!groupEl || !nickEl || !mbtiEl) return;

        groupEl.value = groupEl.value.trim();
        nickEl.value = nickEl.value.replace(/\s/g, "").slice(0, 3);
        const mbti = mbtiEl.value.replace(/\s/g, "").toUpperCase().slice(0, 4);
        mbtiEl.value = mbti;

        if (!isValidMbti(mbti)) {
          e.preventDefault();
          setMbtiError("MBTI 형식이 올바르지 않아요. 예) ENFP");
          mbtiEl.focus();
          return;
        }

        setMbtiError(null);
        lockedRef.current = true;
        setIsSubmitting(true);

        const native = e.nativeEvent as SubmitEvent;
        const submitter = native.submitter as HTMLButtonElement | null;
        if (submitter) submitter.disabled = true;

        form.setAttribute("aria-busy", "true");
      }}
    >
      {/* 모임 이름 */}
      <label className="block">
        <div className="text-sm font-bold text-slate-800">모임 이름</div>
        <input
          name="groupName"
          required
          placeholder="예) 회사 동기 모임"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[16px] outline-none focus:border-[#1E88E5]/50 disabled:opacity-60"
        />
      </label>

      {/* 별명 */}
      <label className="block">
        <div className="text-sm font-bold text-slate-800">내 별명</div>
        <input
          name="nickname"
          required
          maxLength={3}
          placeholder="예) 태주"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[16px] outline-none focus:border-[#1E88E5]/50 disabled:opacity-60"
        />
        <p className="mt-1 text-[11px] text-slate-500">공백 없이 최대 3글자</p>
      </label>

      {/* MBTI */}
      <label className="block">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800">MBTI</div>

        <button
          type="button"
          onClick={() => setTestOpen(true)}
          className="
            mbti-primary-btn
            inline-flex items-center justify-center
            rounded-full
            px-4 py-2
            text-[12px] font-black text-white
            ring-1 ring-[#1E88E5]/20
            transition-all duration-200
            active:scale-[0.97]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          MBTI 간단 검사
        </button>

        </div>

        <input
          ref={mbtiInputRef}
          name="mbti"
          required
          maxLength={4}
          placeholder="예) ENFP"
          disabled={isSubmitting}
          aria-invalid={!!mbtiError}
          defaultValue={mbtiFromTest}
          className={[
            "mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-[16px] uppercase outline-none disabled:opacity-60",
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


      {/* 결정 스타일 */}
      <fieldset className="block">
        <legend className="text-sm font-bold text-slate-800">결정 스타일</legend>
        <p className="mt-1 text-[11px] text-slate-500">
          모임에서 “결론 내릴 때” 무엇을 더 우선하나요?
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input type="radio" name="judge" value="LOGIC" defaultChecked className="peer sr-only" />
            <div
              className="
                h-14 rounded-2xl bg-white px-4 ring-1 ring-black/10
                flex flex-col items-center justify-center gap-0.5
                text-center
                peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50
                peer-checked:bg-[#1E88E5]/[0.06]
              "
            >
              <div className="text-[13px] font-extrabold text-slate-800">🔍 근거·효율</div>
              <div className="text-[11px] text-slate-500">팩트/논리로 정리</div>
            </div>
          </label>

          <label className="cursor-pointer">
            <input type="radio" name="judge" value="PEOPLE" className="peer sr-only" />
            <div
              className="
                h-14 rounded-2xl bg-white px-4 ring-1 ring-black/10
                flex flex-col items-center justify-center gap-0.5
                text-center
                peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50
                peer-checked:bg-[#1E88E5]/[0.06]
              "
            >
              <div className="text-[13px] font-extrabold text-slate-800">🤝 공감·분위기</div>
              <div className="text-[11px] text-slate-500">사람/감정도 고려</div>
            </div>
          </label>
        </div>
      </fieldset>

      {/* 정보 선호 */}
      <fieldset className="block">
        <legend className="text-sm font-bold text-slate-800">정보 선호</legend>
        <p className="mt-1 text-[11px] text-slate-500">
          얘기할 때 어떤 정보가 더 편한가요?
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input type="radio" name="info" value="IDEA" defaultChecked className="peer sr-only" />
            <div
              className="
                h-14 rounded-2xl bg-white px-4 ring-1 ring-black/10
                flex flex-col items-center justify-center gap-0.5
                text-center
                peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50
                peer-checked:bg-[#1E88E5]/[0.06]
              "
            >
              <div className="text-[13px] font-extrabold text-slate-800">💡 아이디어</div>
              <div className="text-[11px] text-slate-500">의미/가능성 위주</div>
            </div>
          </label>

          <label className="cursor-pointer">
            <input type="radio" name="info" value="FACT" className="peer sr-only" />
            <div
              className="
                h-14 rounded-2xl bg-white px-4 ring-1 ring-black/10
                flex flex-col items-center justify-center gap-0.5
                text-center
                peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50
                peer-checked:bg-[#1E88E5]/[0.06]
              "
            >
              <div className="text-[13px] font-extrabold text-slate-800">📌 현실·사실</div>
              <div className="text-[11px] text-slate-500">경험/데이터 선호</div>
            </div>
          </label>
        </div>
      </fieldset>


      <button
        type="submit"
        disabled={isSubmitting}
        className={[
          "w-full rounded-2xl mt-4 px-4 py-4 text-sm font-extrabold text-white transition-all duration-200 active:scale-[0.98]",
          isSubmitting ? "bg-slate-300 shadow-none" : "mbti-primary-btn",
        ].join(" ")}
      >
        {isSubmitting ? "생성중…" : "모임 만들기"}
      </button>

      <MbtiTestModal
        open={testOpen}
        onClose={() => setTestOpen(false)}
        onComplete={(r) => {
          const v = (r.type || "").toUpperCase();
          if (mbtiInputRef.current) {
            mbtiInputRef.current.value = v;
            mbtiInputRef.current.focus();
          }
          setMbtiError(isValidMbti(v) ? null : "MBTI 형식이 올바르지 않아요. 예) ENFP");
          setTestOpen(false);
        }}
        context="create"
      />
    </form>
  );
}
