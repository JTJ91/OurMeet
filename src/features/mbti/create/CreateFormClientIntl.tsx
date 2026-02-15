"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createGroupAction } from "@/features/mbti/actions/group";
import { upsertSavedGroup } from "@/lib/mbti/groupHistory";
import MbtiTestModal from "@/features/mbti/components/MbtiTestModal8";
import { sanitizeNicknameInput } from "@/features/mbti/lib/nickname";

type Props = {
  locale: string;
};

function isValidMbti(mbti: string) {
  return /^[EI][NS][TF][JP]$/.test(mbti);
}

function localeBase(locale: string) {
  return locale === "ko" ? "" : `/${locale}`;
}

function nicknameHintByLocale(locale: string) {
  if (locale === "en") return "No spaces. Up to 6 English chars or 3 Korean/Japanese chars.";
  if (locale === "ja") return "空白なし。英字は最大6文字、韓国語・日本語は最大3文字。";
  return "공백 없이 한글/일본어 3자, 영어 6자";
}

export default function CreateFormClientIntl({ locale }: Props) {
  const t = useTranslations("create.form");
  const [mbtiError, setMbtiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  const lockedRef = useRef(false);
  const mbtiInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const mbtiFromTest = (sp.get("mbti") ?? "").trim().toUpperCase();
  const base = localeBase(locale);
  const nicknameHint = nicknameHintByLocale(locale);

  useEffect(() => {
    const raw = (sp.get("mbti") || "")
      .replace(/\s/g, "")
      .toUpperCase()
      .replace(/[^EINSFTJP]/g, "")
      .slice(0, 4);

    if (!raw) return;
    if (mbtiInputRef.current) mbtiInputRef.current.value = raw;
    setMbtiError(raw.length === 4 && !isValidMbti(raw) ? t("mbti.invalid") : null);
  }, [sp, t]);

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

          router.replace(`${base}/mbti/g/${result.groupId}?center=${result.memberId}`);
        } catch (err: any) {
          alert(err?.message ?? t("errors.createFailed"));
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
        nickEl.value = sanitizeNicknameInput(nickEl.value || "");
        const mbti = mbtiEl.value.replace(/\s/g, "").toUpperCase().slice(0, 4);
        mbtiEl.value = mbti;

        if (!isValidMbti(mbti)) {
          e.preventDefault();
          setMbtiError(t("mbti.invalid"));
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
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        if ((e.nativeEvent as KeyboardEvent).isComposing) return;
        e.preventDefault();
      }}
    >
      <input type="hidden" name="locale" value={locale} />

      <label className="block">
        <div className="text-sm font-bold text-slate-800">{t("groupName.label")}</div>
        <input
          name="groupName"
          required
          placeholder={t("groupName.placeholder")}
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[16px] outline-none focus:border-[#1E88E5]/50 disabled:opacity-60"
        />
      </label>

      <label className="block">
        <div className="text-sm font-bold text-slate-800">{t("nickname.label")}</div>
        <input
          name="nickname"
          required
          maxLength={6}
          placeholder={t("nickname.placeholder")}
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[16px] outline-none focus:border-[#1E88E5]/50 disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === " ") e.preventDefault();
          }}
          onChange={(e) => {
            e.currentTarget.value = sanitizeNicknameInput(e.currentTarget.value);
          }}
        />
        <p className="mt-1 text-[11px] text-slate-500">{nicknameHint}</p>
      </label>

      <label className="block">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800">MBTI</div>
          <button
            type="button"
            onClick={() => setTestOpen(true)}
            className="mbti-primary-btn inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px] font-black text-white ring-1 ring-[#1E88E5]/20 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("mbti.quickTest")}
          </button>
        </div>

        <input
          ref={mbtiInputRef}
          name="mbti"
          required
          maxLength={4}
          placeholder={t("mbti.placeholder")}
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
            if (v.length === 4) setMbtiError(isValidMbti(v) ? null : t("mbti.invalid"));
            else setMbtiError(null);
          }}
          onBlur={(e) => {
            const v = (e.currentTarget.value || "").replace(/\s/g, "").toUpperCase();
            if (v.length === 4 && !isValidMbti(v)) setMbtiError(t("mbti.invalid"));
          }}
        />

        {mbtiError ? (
          <p className="mt-1 text-[11px] font-semibold text-red-500">{mbtiError}</p>
        ) : (
          <p className="mt-1 text-[11px] text-slate-500">{t("mbti.hint")}</p>
        )}
      </label>

      <fieldset className="block">
        <legend className="text-sm font-bold text-slate-800">{t("judge.legend")}</legend>
        <p className="mt-1 text-[11px] text-slate-500">{t("judge.help")}</p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input type="radio" name="judge" value="LOGIC" defaultChecked className="peer sr-only" />
            <div className="h-14 rounded-2xl bg-white px-4 ring-1 ring-black/10 flex flex-col items-center justify-center gap-0.5 text-center peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50 peer-checked:bg-[#1E88E5]/[0.06]">
              <div className="text-[13px] font-extrabold text-slate-800">
                <span aria-hidden="true">🔍 </span>
                {t("judge.logic.title")}
              </div>
              <div className="text-[11px] text-slate-500">{t("judge.logic.desc")}</div>
            </div>
          </label>

          <label className="cursor-pointer">
            <input type="radio" name="judge" value="PEOPLE" className="peer sr-only" />
            <div className="h-14 rounded-2xl bg-white px-4 ring-1 ring-black/10 flex flex-col items-center justify-center gap-0.5 text-center peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50 peer-checked:bg-[#1E88E5]/[0.06]">
              <div className="text-[13px] font-extrabold text-slate-800">
                <span aria-hidden="true">🤝 </span>
                {t("judge.people.title")}
              </div>
              <div className="text-[11px] text-slate-500">{t("judge.people.desc")}</div>
            </div>
          </label>
        </div>
      </fieldset>

      <fieldset className="block">
        <legend className="text-sm font-bold text-slate-800">{t("info.legend")}</legend>
        <p className="mt-1 text-[11px] text-slate-500">{t("info.help")}</p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input type="radio" name="info" value="IDEA" defaultChecked className="peer sr-only" />
            <div className="h-14 rounded-2xl bg-white px-4 ring-1 ring-black/10 flex flex-col items-center justify-center gap-0.5 text-center peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50 peer-checked:bg-[#1E88E5]/[0.06]">
              <div className="text-[13px] font-extrabold text-slate-800">
                <span aria-hidden="true">💡 </span>
                {t("info.idea.title")}
              </div>
              <div className="text-[11px] text-slate-500">{t("info.idea.desc")}</div>
            </div>
          </label>

          <label className="cursor-pointer">
            <input type="radio" name="info" value="FACT" className="peer sr-only" />
            <div className="h-14 rounded-2xl bg-white px-4 ring-1 ring-black/10 flex flex-col items-center justify-center gap-0.5 text-center peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50 peer-checked:bg-[#1E88E5]/[0.06]">
              <div className="text-[13px] font-extrabold text-slate-800">
                <span aria-hidden="true">📌 </span>
                {t("info.fact.title")}
              </div>
              <div className="text-[11px] text-slate-500">{t("info.fact.desc")}</div>
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
        {isSubmitting ? t("submit.creating") : t("submit.create")}
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
          setMbtiError(isValidMbti(v) ? null : t("mbti.invalid"));
          setTestOpen(false);
        }}
        locale={locale}
        context="create"
      />
    </form>
  );
}
