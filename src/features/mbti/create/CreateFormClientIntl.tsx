"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createGroupAction } from "@/features/mbti/actions/group";
import { upsertSavedGroup } from "@/lib/mbti/groupHistory";
import MbtiTestSelectModal from "@/features/mbti/components/MbtiTestSelectModal";
import { sanitizeNicknameInput } from "@/features/mbti/lib/nickname";
import {
  DEFAULT_MEMBER_STRENGTHS,
  clampStrength,
  normalizeConflictStyle,
  normalizeEnergyLevel,
  prefillStrengthsFromMbti,
  toLegacyInfoStyle,
  toLegacyJudgeStyle,
  type ConflictStyle,
  type EnergyLevel,
  type MemberStrengths,
} from "@/lib/mbti/memberPrefs";

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
  const [testSelectOpen, setTestSelectOpen] = useState(false);

  const lockedRef = useRef(false);
  const mbtiInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const mbtiFromTest = (sp.get("mbti") ?? "").trim().toUpperCase();
  const base = localeBase(locale);
  const nicknameHint = nicknameHintByLocale(locale);
  const [strengths, setStrengths] = useState<MemberStrengths>(() =>
    isValidMbti(mbtiFromTest) ? prefillStrengthsFromMbti(mbtiFromTest) : { ...DEFAULT_MEMBER_STRENGTHS }
  );
  const [strengthTouched, setStrengthTouched] = useState(false);
  const [conflictStyle, setConflictStyle] = useState<ConflictStyle>("MEDIATE");
  const [energy, setEnergy] = useState<EnergyLevel>("MID");

  const legacyJudgeStyle = toLegacyJudgeStyle(strengths);
  const legacyInfoStyle = toLegacyInfoStyle(strengths);

  function moveToTest(kind: "quick" | "full") {
    setTestSelectOpen(false);
    const targetPath = kind === "quick" ? "/mbti-test/quick" : "/mbti-test";
    const qs = new URLSearchParams({
      from: "create",
      returnTo: `${base}/mbti/create`,
    });
    router.push(`${base}${targetPath}?${qs.toString()}`);
  }

  useEffect(() => {
    const raw = (sp.get("mbti") || "")
      .replace(/\s/g, "")
      .toUpperCase()
      .replace(/[^EINSFTJP]/g, "")
      .slice(0, 4);

    if (!raw) return;
    if (mbtiInputRef.current) mbtiInputRef.current.value = raw;
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

          router.replace(`${base}/mbti/g/${result.groupId}?center=${result.memberId}`);
        } catch (err: unknown) {
          const message =
            typeof err === "object" && err !== null && "message" in err
              ? String((err as { message?: unknown }).message ?? t("errors.createFailed"))
              : t("errors.createFailed");
          alert(message);
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
            disabled={isSubmitting}
            onClick={() => setTestSelectOpen(true)}
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
            if (v.length === 4 && isValidMbti(v) && !strengthTouched) {
              setStrengths(prefillStrengthsFromMbti(v));
            }
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
        <legend className="text-sm font-bold text-slate-800">{t("prefs.strength.legend")}</legend>
        <p className="mt-1 text-[11px] text-slate-500">{t("prefs.strength.help")}</p>

        <div className="mt-2 space-y-3 rounded-2xl border border-black/10 bg-white p-3">
          {(
            [
              { key: "ideaStrength", label: t("prefs.strength.idea"), color: "bg-violet-500" },
              { key: "factStrength", label: t("prefs.strength.fact"), color: "bg-emerald-500" },
              { key: "logicStrength", label: t("prefs.strength.logic"), color: "bg-amber-500" },
              { key: "peopleStrength", label: t("prefs.strength.people"), color: "bg-rose-500" },
            ] as const
          ).map((row) => (
            <label key={row.key} className="block">
              <div className="mb-1 flex items-center justify-between text-[12px] font-bold text-slate-700">
                <span>{row.label}</span>
                <span>{strengths[row.key]}%</span>
              </div>
              <input
                type="range"
                name={row.key}
                min={0}
                max={100}
                step={1}
                value={strengths[row.key]}
                onChange={(e) => {
                  const nextValue = clampStrength(e.currentTarget.value);
                  setStrengthTouched(true);
                  setStrengths((prev) => ({ ...prev, [row.key]: nextValue }));
                }}
                className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1E88E5]"
              />
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                <div className={`h-1.5 rounded-full ${row.color}`} style={{ width: `${strengths[row.key]}%` }} />
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="block">
        <legend className="text-sm font-bold text-slate-800">{t("prefs.conflict.legend")}</legend>
        <p className="mt-1 text-[11px] text-slate-500">{t("prefs.conflict.help")}</p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              { value: "DIRECT", title: t("prefs.conflict.direct.title"), desc: t("prefs.conflict.direct.desc") },
              { value: "AVOID", title: t("prefs.conflict.avoid.title"), desc: t("prefs.conflict.avoid.desc") },
              { value: "MEDIATE", title: t("prefs.conflict.mediate.title"), desc: t("prefs.conflict.mediate.desc") },
              { value: "BURST", title: t("prefs.conflict.burst.title"), desc: t("prefs.conflict.burst.desc") },
            ] as const
          ).map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="conflictStyle"
                value={opt.value}
                checked={conflictStyle === opt.value}
                onChange={(e) => setConflictStyle(normalizeConflictStyle(e.currentTarget.value))}
                className="peer sr-only"
              />
              <div className="min-h-14 rounded-2xl bg-white px-3 py-2 ring-1 ring-black/10 text-center peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50 peer-checked:bg-[#1E88E5]/[0.06]">
                <div className="text-[12px] font-extrabold text-slate-800">{opt.title}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-slate-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="block">
        <legend className="text-sm font-bold text-slate-800">{t("prefs.energy.legend")}</legend>
        <p className="mt-1 text-[11px] text-slate-500">{t("prefs.energy.help")}</p>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              { value: "LOW", label: t("prefs.energy.low") },
              { value: "MID", label: t("prefs.energy.mid") },
              { value: "HIGH", label: t("prefs.energy.high") },
            ] as const
          ).map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="energy"
                value={opt.value}
                checked={energy === opt.value}
                onChange={(e) => setEnergy(normalizeEnergyLevel(e.currentTarget.value))}
                className="peer sr-only"
              />
              <div className="h-11 rounded-2xl bg-white px-3 ring-1 ring-black/10 text-[12px] font-extrabold text-slate-700 flex items-center justify-center peer-checked:ring-2 peer-checked:ring-[#1E88E5]/50 peer-checked:bg-[#1E88E5]/[0.06]">
                {opt.label}
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <input type="hidden" name="judge" value={legacyJudgeStyle} />
      <input type="hidden" name="info" value={legacyInfoStyle} />

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

      <MbtiTestSelectModal
        open={testSelectOpen}
        locale={locale}
        onClose={() => setTestSelectOpen(false)}
        onSelectQuick={() => moveToTest("quick")}
        onSelectFull={() => moveToTest("full")}
      />
    </form>
  );
}
