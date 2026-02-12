"use client";

import { useRef, useState } from "react";
import { createGroupAction } from "@/app/mbti/actions/group";
import { upsertSavedGroup } from "@/app/lib/mbti/groupHistory";
import { useRouter } from "next/navigation";

function isValidMbti(mbti: string) {
  return /^[EI][NS][TF][JP]$/.test(mbti);
}

export default function CreateFormClient() {
  const [mbtiError, setMbtiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockedRef = useRef(false);
  const router = useRouter();

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

          router.replace(`/g/${result.groupId}?center=${result.memberId}`);
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
        <div className="text-sm font-bold text-slate-800">MBTI</div>
        <input
          name="mbti"
          required
          maxLength={4}
          placeholder="예) ENFP"
          disabled={isSubmitting}
          aria-invalid={!!mbtiError}
          className={[
            "mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-[16px] uppercase outline-none disabled:opacity-60",
            mbtiError ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-[#1E88E5]/50",
          ].join(" ")}
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
          isSubmitting ? "bg-slate-300" : "bg-[#1E88E5] hover:bg-[#1E88E5]/90",
        ].join(" ")}
      >
        {isSubmitting ? "생성중…" : "모임 만들기"}
      </button>
    </form>
  );
}
