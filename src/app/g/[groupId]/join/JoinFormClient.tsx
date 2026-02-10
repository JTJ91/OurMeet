"use client";

import { useRef, useState } from "react";
import { joinGroupAction } from "@/app/actions/members";
import { upsertSavedGroup } from "@/lib/groupHistory";

import { useRouter } from "next/navigation";

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
  const router = useRouter();

  return (
    <form
        action={async (fd: FormData) => {
          try {
            const result = await joinGroupAction(fd);

            upsertSavedGroup({
              id: result.groupId,
              name: result.groupName,
              myMemberId: result.memberId,
              myNickname: String(fd.get("nickname") || ""),
              myMbti: String(fd.get("mbti") || "").toUpperCase(),
            });

            // ✅ 성공 시 이동
            router.replace(`/g/${result.groupId}?center=${result.memberId}`);
            router.refresh();
          } catch (err: any) {
            // ✅ 에러 처리
            alert(err?.message ?? "참가 중 문제가 발생했어요.");

            // 🔓 잠금 해제
            lockedRef.current = false;
            setIsSubmitting(false);
          }
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
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[16px] outline-none focus:border-[#1E88E5]/50 disabled:opacity-60"
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

      {/* ✅ 추가 입력 1: 판단 기준 (T/F 보정) */}
        <fieldset className="block">
          <legend className="text-sm font-bold text-slate-800">판단 기준</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="judge"
                value="LOGIC"
                defaultChecked
                disabled={isFull || isSubmitting}
                className="peer sr-only"
              />
              <div
                className="
                  h-12 rounded-2xl bg-white px-4
                  ring-1 ring-black/10
                  flex items-center justify-center
                  text-[13px] font-extrabold text-slate-700
                  peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50
                  peer-checked:bg-white
                  hover:bg-white
                  disabled:opacity-60
                "
              >
                🔢 논리·효율·근거
              </div>
            </label>

            <label className="cursor-pointer">
              <input
                type="radio"
                name="judge"
                value="PEOPLE"
                disabled={isFull || isSubmitting}
                className="peer sr-only"
              />
              <div
                className="
                  h-12 rounded-2xl bg-white px-4
                  ring-1 ring-black/10
                  flex items-center justify-center
                  text-[13px] font-extrabold text-slate-700
                  peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50
                  peer-checked:bg-white
                  hover:bg-white
                  disabled:opacity-60
                "
              >
                💬 사람·분위기·감정
              </div>
            </label>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">같은 MBTI여도 판단 습관이 달라질 수 있어요.</p>
        </fieldset>

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
        disabled={isFull || isSubmitting}
        className={[
          "w-full rounded-2xl mt-4 px-4 py-4 text-sm font-extrabold text-white transition-all duration-200 active:scale-[0.98]",
          isFull || isSubmitting ? "bg-slate-300" : "bg-[#1E88E5] hover:bg-[#1E88E5]/90",
        ].join(" ")}
      >
        {isFull ? "정원이 가득 찼어요" : isSubmitting ? "참여중…" : "🫶 모임에 참가하기"}
      </button>
    </form>
  );
}
