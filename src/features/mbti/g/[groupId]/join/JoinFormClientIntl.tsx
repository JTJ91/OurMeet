"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { joinGroupAction } from "@/features/mbti/actions/members";
import { upsertSavedGroup } from "@/lib/mbti/groupHistory";
import MbtiTestSelectModal from "@/features/mbti/components/MbtiTestSelectModal";
import { sanitizeNicknameInput } from "@/features/mbti/lib/nickname";
import { animalMetaOf, type AnimalLocale } from "@/lib/mbti/animalMeta";
import {
  clampStrength,
  normalizeConflictStyle,
  normalizeEnergyLevel,
  toLegacyInfoStyle,
  toLegacyJudgeStyle,
  type ConflictStyle,
  type EnergyLevel,
} from "@/lib/mbti/memberPrefs";
import {
  DEFAULT_AXIS_PERCENTS,
  prefillAxisPercentFromMbti,
  toMbtiFromAxisPercent,
  toStrengthFromPercent,
  type AxisPercentState,
} from "@/lib/mbti/axisPercent";

type Props = {
  locale: string;
  groupId: string;
  isFull: boolean;
};

const TRAIT_COLOR: Record<string, string> = {
  E: "#FF6B6B",
  I: "#4D96FF",
  N: "#9B59B6",
  S: "#2ECC71",
  T: "#F39C12",
  F: "#E84393",
  J: "#2D3436",
  P: "#16A085",
};

function isValidMbti(mbti: string) {
  return /^[EI][NS][TF][JP]$/.test(mbti);
}

function localeBase(locale: string) {
  return locale === "ko" ? "" : `/${locale}`;
}

function sanitizeMbtiInput(value: string) {
  return value
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/[^EINSFTJP]/g, "")
    .slice(0, 4);
}

function nicknameHintByLocale(locale: string) {
  if (locale === "en") return "No spaces. Up to 6 English chars or 3 Korean/Japanese chars.";
  if (locale === "ja") return "空白なし。英字は最大6文字、韓国語・日本語は最大3文字。";
  return "공백 없이 한글/일본어 3자, 영어 6자";
}

function parsePercentQuery(value: string | null) {
  if (value == null) return null;
  const raw = value.trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return clampStrength(n);
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(30, 136, 229, ${alpha})`;
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function fullAxisPercentFromMbti(mbtiRaw: string): AxisPercentState {
  const mbti = (mbtiRaw || "").trim().toUpperCase();
  return {
    ePercent: mbti[0] === "E" ? 100 : 0,
    nPercent: mbti[1] === "N" ? 100 : 0,
    tPercent: mbti[2] === "T" ? 100 : 0,
    jPercent: mbti[3] === "J" ? 100 : 0,
  };
}

export default function JoinFormClientIntl({ locale, groupId, isFull }: Props) {
  const t = useTranslations("join.form");
  const tc = useTranslations("create.form");
  const [mbtiError, setMbtiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testSelectOpen, setTestSelectOpen] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState(false);

  const lockedRef = useRef(false);
  const router = useRouter();
  const sp = useSearchParams();
  const mbtiFromTest = sanitizeMbtiInput(sp.get("mbti") ?? "");
  const queryAxis = {
    ePercent: parsePercentQuery(sp.get("ePercent")),
    nPercent: parsePercentQuery(sp.get("nPercent")),
    tPercent: parsePercentQuery(sp.get("tPercent")),
    jPercent: parsePercentQuery(sp.get("jPercent")),
  };
  const axisFromTest: AxisPercentState | null =
    queryAxis.ePercent != null &&
    queryAxis.nPercent != null &&
    queryAxis.tPercent != null &&
    queryAxis.jPercent != null
      ? {
          ePercent: queryAxis.ePercent,
          nPercent: queryAxis.nPercent,
          tPercent: queryAxis.tPercent,
          jPercent: queryAxis.jPercent,
        }
      : null;
  const initialMbti =
    isValidMbti(mbtiFromTest) ? mbtiFromTest : axisFromTest ? toMbtiFromAxisPercent(axisFromTest) : "";

  const base = localeBase(locale);
  const nicknameHint = nicknameHintByLocale(locale);

  const [mbtiValue, setMbtiValue] = useState<string>(initialMbti);
  const [mbtiSource, setMbtiSource] = useState<"manual" | "auto">(axisFromTest ? "auto" : "manual");
  const [didTouchPercent, setDidTouchPercent] = useState(false);
  const [percents, setPercents] = useState<AxisPercentState>(() =>
    axisFromTest
      ? axisFromTest
      : isValidMbti(initialMbti)
        ? prefillAxisPercentFromMbti(initialMbti)
        : { ...DEFAULT_AXIS_PERCENTS }
  );
  const percentsRef = useRef<AxisPercentState>(percents);

  const [conflictStyle, setConflictStyle] = useState<ConflictStyle | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);

  useEffect(() => {
    percentsRef.current = percents;
  }, [percents]);

  const strengths = useMemo(() => {
    return toStrengthFromPercent({
      nPercent: percents.nPercent,
      tPercent: percents.tPercent,
    });
  }, [percents.nPercent, percents.tPercent]);

  const legacyJudgeStyle = toLegacyJudgeStyle(strengths);
  const legacyInfoStyle = toLegacyInfoStyle(strengths);

  const conflictOptions = useMemo(
    () =>
      [
        {
          value: "DIRECT" as const,
          label: tc("optional.conflict.direct.label"),
          desc: tc("optional.conflict.direct.desc"),
        },
        {
          value: "AVOID" as const,
          label: tc("optional.conflict.avoid.label"),
          desc: tc("optional.conflict.avoid.desc"),
        },
        {
          value: "MEDIATE" as const,
          label: tc("optional.conflict.mediate.label"),
          desc: tc("optional.conflict.mediate.desc"),
        },
        {
          value: "BURST" as const,
          label: tc("optional.conflict.burst.label"),
          desc: tc("optional.conflict.burst.desc"),
        },
      ] as const,
    [tc]
  );

  const energyOptions = useMemo(
    () =>
      [
        {
          value: "LOW" as const,
          label: tc("optional.energy.low.label"),
          time: tc("optional.energy.low.time"),
          desc: tc("optional.energy.low.desc"),
        },
        {
          value: "MID" as const,
          label: tc("optional.energy.mid.label"),
          time: tc("optional.energy.mid.time"),
          desc: tc("optional.energy.mid.desc"),
        },
        {
          value: "HIGH" as const,
          label: tc("optional.energy.high.label"),
          time: tc("optional.energy.high.time"),
          desc: tc("optional.energy.high.desc"),
        },
      ] as const,
    [tc]
  );

  const selectedConflict = conflictOptions.find((opt) => opt.value === conflictStyle) ?? null;
  const selectedEnergy = energyOptions.find((opt) => opt.value === energy) ?? null;
  const activeLocale: AnimalLocale = locale === "en" || locale === "ja" ? locale : "ko";
  const selectedAnimal = useMemo(() => animalMetaOf(mbtiValue), [mbtiValue]);

  const canSubmit = isValidMbti(mbtiValue) && !isSubmitting && !isFull;
  const conflictInterpretation = selectedConflict
    ? conflictStyle === "DIRECT"
      ? tc("optional.conflict.interpret.direct")
      : conflictStyle === "AVOID"
        ? tc("optional.conflict.interpret.avoid")
        : conflictStyle === "MEDIATE"
          ? tc("optional.conflict.interpret.mediate")
          : tc("optional.conflict.interpret.burst")
    : null;
  const energyInterpretation = selectedEnergy
    ? energy === "LOW"
      ? tc("optional.energy.interpret.low")
      : energy === "MID"
        ? tc("optional.energy.interpret.mid")
        : tc("optional.energy.interpret.high")
    : null;

  const applyMbtiFromPercent = useCallback((sourcePercents?: AxisPercentState) => {
    const percentsToUse = sourcePercents ?? percentsRef.current;
    setMbtiValue((prev) => {
      const next = toMbtiFromAxisPercent({
        ...percentsToUse,
        prevMbti: prev,
      });
      return isValidMbti(next) ? next : prev;
    });
    setMbtiSource("auto");
    setMbtiError(null);
  }, []);

  function moveToTest(kind: "quick" | "full") {
    setTestSelectOpen(false);
    const targetPath = kind === "quick" ? "/mbti-test/quick" : "/mbti-test";
    const qs = new URLSearchParams({
      from: "join",
      groupId,
      returnTo: `${base}/mbti/g/${encodeURIComponent(groupId)}/join`,
    });
    router.push(`${base}${targetPath}?${qs.toString()}`);
  }

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
          router.replace(`${base}/mbti/g/${result.groupId}?center=${result.memberId}`);
          router.refresh();
        } catch (err: unknown) {
          const message =
            typeof err === "object" && err !== null && "message" in err
              ? String((err as { message?: unknown }).message ?? t("errors.joinFailed"))
              : t("errors.joinFailed");
          alert(message);
          lockedRef.current = false;
          setIsSubmitting(false);
        }
      }}
      className={["mt-5 space-y-4", isSubmitting ? "pointer-events-none" : ""].join(" ")}
      onSubmit={(e) => {
        if (isFull || lockedRef.current) {
          e.preventDefault();
          return;
        }

        const form = e.currentTarget;
        const nickEl = form.elements.namedItem("nickname") as HTMLInputElement | null;
        const mbtiEl = form.elements.namedItem("mbti") as HTMLInputElement | null;
        if (!nickEl || !mbtiEl) return;

        nickEl.value = sanitizeNicknameInput(nickEl.value || "");
        const mbti = sanitizeMbtiInput(mbtiEl.value || "");
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
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="locale" value={locale} />

      <label className="block">
        <div className="text-sm font-bold text-slate-800">{t("nickname.label")}</div>
        <input
          name="nickname"
          required
          maxLength={6}
          placeholder={t("nickname.placeholder")}
          disabled={isFull || isSubmitting}
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

      <div className="block">
        <div className="flex items-start justify-between">
          <div className="text-sm font-bold text-slate-800">MBTI</div>
          <button
            type="button"
            disabled={isFull || isSubmitting}
            onClick={() => setTestSelectOpen(true)}
            className="mbti-primary-btn inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px] font-black text-white ring-1 ring-[#1E88E5]/20 transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("mbti.quickTest")}
          </button>
        </div>

        <input
          id="join-mbti"
          name="mbti"
          required
          maxLength={4}
          placeholder={t("mbti.placeholder")}
          disabled={isFull || isSubmitting}
          aria-invalid={!!mbtiError}
          value={mbtiValue}
          className={[
            "mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-[16px] uppercase outline-none disabled:opacity-60",
            mbtiError ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-[#1E88E5]/50",
          ].join(" ")}
          onKeyDown={(e) => {
            if (e.key === " ") e.preventDefault();
          }}
          onChange={(e) => {
            const v = sanitizeMbtiInput(e.currentTarget.value);
            e.currentTarget.value = v;
            setMbtiValue(v);
            setMbtiSource("manual");

            if (v.length === 4 && isValidMbti(v)) {
              const full = fullAxisPercentFromMbti(v);
              percentsRef.current = full;
              setPercents(full);
            }

            if (v.length === 4) setMbtiError(isValidMbti(v) ? null : t("mbti.invalid"));
            else setMbtiError(null);
          }}
          onBlur={(e) => {
            const v = sanitizeMbtiInput(e.currentTarget.value || "");
            if (v.length === 4 && !isValidMbti(v)) setMbtiError(t("mbti.invalid"));
          }}
        />

        {mbtiError ? (
          <p className="mt-1 text-[11px] font-semibold text-red-500">{mbtiError}</p>
        ) : (
          <p className="mt-1 text-[11px] text-slate-500">{t("mbti.hint")}</p>
        )}
      </div>

      {selectedAnimal ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3 ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <Image
              key={`${mbtiValue}-animal`}
              src={selectedAnimal.imageSrc}
              alt={`${mbtiValue} ${selectedAnimal.name[activeLocale]}`}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 shrink-0 rounded-xl border border-slate-200/80 bg-white object-cover"
            />
            <div className="min-w-0">
              <div className="text-sm font-black text-slate-900">
                {selectedAnimal.emoji} {mbtiValue} · {selectedAnimal.name[activeLocale]}
              </div>
              <div className="mt-1 text-[12px] leading-relaxed text-slate-600">
                {selectedAnimal.reason[activeLocale]}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <fieldset className="rounded-2xl border border-black/10 bg-white p-3">
        <legend className="px-1 text-sm font-extrabold text-slate-900">{tc("percent.title")}</legend>
        <p className="mb-1.5 text-[10px] font-semibold text-[#1E88E5]">{tc("mbti.testPrefillHint")}</p>

        <div className="mt-1 grid grid-cols-2 gap-1.5">
          {(
            [
              {
                key: "ePercent",
                label: tc("percent.energy"),
                left: "E",
                right: "I",
              },
              {
                key: "nPercent",
                label: tc("percent.info"),
                left: "N",
                right: "S",
              },
              {
                key: "tPercent",
                label: tc("percent.judge"),
                left: "T",
                right: "F",
              },
              {
                key: "jPercent",
                label: tc("percent.style"),
                left: "J",
                right: "P",
              },
            ] as const
          ).map((row) => {
            const value = percents[row.key];
            const rightValue = 100 - value;
            const delta = value - 50;
            const leanLeft = delta >= 0;
            const diff = Math.round(Math.abs(delta));
            const halfFill = Math.min(100, diff * 2);
            const winner = value >= rightValue ? row.left : row.right;
            const isLeftWin = winner === row.left;
            const isRightWin = winner === row.right;
            const color = TRAIT_COLOR[winner] ?? "#1E88E5";
            return (
              <div
                key={row.key}
                className="mbti-card-soft rounded-xl p-1.5 ring-1 ring-black/10"
                style={{ backgroundColor: hexToRgba(color, 0.04) }}
              >
                <div className="mb-0.5 pl-0.5 text-[9px] font-extrabold tracking-tight text-slate-500">{row.label}</div>
                <div className="grid grid-cols-[48px_1fr_48px] items-center">
                  <div className="text-left">
                    <div className="inline-flex items-end gap-1">
                      <span
                        className={["leading-none text-[14px] font-black", isLeftWin ? "" : "opacity-40"].join(" ")}
                        style={{ color: TRAIT_COLOR[row.left] }}
                      >
                        {row.left}
                      </span>
                      <span
                        className={[
                          "tabular-nums text-[9px] font-black",
                          isLeftWin ? "text-slate-900" : "text-slate-400",
                        ].join(" ")}
                      >
                        {value}%
                      </span>
                    </div>
                  </div>

                  <div />

                  <div className="text-right">
                    <div className="inline-flex items-end gap-1">
                      <span
                        className={[
                          "tabular-nums text-[9px] font-black",
                          isRightWin ? "text-slate-900" : "text-slate-400",
                        ].join(" ")}
                      >
                        {rightValue}%
                      </span>
                      <span
                        className={["leading-none text-[14px] font-black", isRightWin ? "" : "opacity-40"].join(" ")}
                        style={{ color: TRAIT_COLOR[row.right] }}
                      >
                        {row.right}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-black/5">
                  <div className="absolute inset-0 flex">
                    <div className="relative h-full w-1/2 overflow-hidden">
                      <div
                        className="absolute right-0 top-0 h-full rounded-l-full transition-[width] duration-300"
                        style={{ width: `${leanLeft ? halfFill : 0}%`, backgroundColor: color }}
                      />
                    </div>

                    <div className="relative h-full w-1/2 overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-r-full transition-[width] duration-300"
                        style={{ width: `${leanLeft ? 0 : halfFill}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-400/70" />
                </div>

                <div className="mt-0.5">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={value}
                    disabled={isFull || isSubmitting}
                    onChange={(e) => {
                      const next = clampStrength(e.currentTarget.value);
                      setDidTouchPercent(true);
                      setPercents((prev) => {
                        const nextState = { ...prev, [row.key]: next };
                        percentsRef.current = nextState;
                        return nextState;
                      });
                    }}
                    onPointerUp={() => applyMbtiFromPercent()}
                    onMouseUp={() => applyMbtiFromPercent()}
                    onTouchEnd={() => applyMbtiFromPercent()}
                    onBlur={() => applyMbtiFromPercent()}
                    onKeyUp={(e) => {
                      if (
                        e.key === "ArrowLeft" ||
                        e.key === "ArrowRight" ||
                        e.key === "ArrowUp" ||
                        e.key === "ArrowDown" ||
                        e.key === "Home" ||
                        e.key === "End" ||
                        e.key === "PageUp" ||
                        e.key === "PageDown"
                      ) {
                        applyMbtiFromPercent();
                      }
                    }}
                    style={{ accentColor: color }}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200/90 [direction:rtl] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-50 to-blue-50 px-3 py-2.5">
        <p className="text-[11px] font-extrabold text-sky-700">{tc("optional.title")}</p>
        <p className="mt-0.5 text-[11px] text-sky-900/80">{tc("optional.desc")}</p>
      </div>

      <details
        className="rounded-2xl border border-slate-200 bg-white/90 shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
        open={optionalOpen}
        onToggle={(e) => setOptionalOpen((e.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-3">
          <span className="text-sm font-extrabold text-slate-900">{tc("optional.title")}</span>
          <span className="text-[11px] font-bold text-slate-500">{optionalOpen ? tc("optional.fold") : tc("optional.open")}</span>
        </summary>

        <div className="border-t border-black/5 px-4 pb-4 pt-3">
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 items-center justify-center rounded-full bg-rose-100 px-2 text-[11px] font-black text-rose-700">
                Conflict
              </span>
              <div className="text-sm font-bold text-slate-800">{tc("optional.conflict.title")}</div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{tc("optional.conflict.help")}</p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {conflictOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isFull || isSubmitting}
                  onClick={() =>
                    setConflictStyle((prev) => (prev === opt.value ? null : normalizeConflictStyle(opt.value)))
                  }
                  className={[
                    "min-h-14 rounded-2xl border px-3 py-2 text-center transition-all",
                    conflictStyle === opt.value
                      ? "border-rose-300 bg-gradient-to-b from-rose-50 to-white shadow-[0_4px_10px_rgba(244,63,94,0.12)] ring-2 ring-rose-300/40"
                      : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/40",
                    isFull || isSubmitting ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="text-[12px] font-extrabold text-slate-800">{opt.label}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-slate-500">{opt.desc}</div>
                </button>
              ))}
            </div>

            <p className="mt-2 text-[11px] font-semibold text-slate-600">
              {!selectedConflict ? tc("optional.conflict.none") : ""}
            </p>
            {conflictInterpretation ? (
              <div className="mt-2 rounded-xl border border-rose-200/80 bg-rose-50/70 px-2.5 py-2 text-[11px] font-semibold text-rose-900/90">
                {conflictInterpretation}
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 items-center justify-center rounded-full bg-amber-100 px-2 text-[11px] font-black text-amber-700">
                Energy
              </span>
              <div className="text-sm font-bold text-slate-800">{tc("optional.energy.title")}</div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{tc("optional.energy.help")}</p>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {energyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isFull || isSubmitting}
                  onClick={() => setEnergy((prev) => (prev === opt.value ? null : normalizeEnergyLevel(opt.value)))}
                  className={[
                    "min-h-[64px] rounded-2xl border px-2 py-2 text-[12px] font-extrabold transition-all",
                    energy === opt.value
                      ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white text-slate-800 shadow-[0_4px_10px_rgba(245,158,11,0.16)] ring-2 ring-amber-300/40"
                      : "border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/40",
                    isFull || isSubmitting ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  <span className="block whitespace-normal text-center leading-tight break-words">{opt.label}</span>
                  <span className="mt-0.5 block whitespace-normal text-center text-[10px] font-semibold text-slate-500 leading-tight break-words">
                    {opt.time}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-2 text-[11px] font-semibold text-slate-600">
              {!selectedEnergy ? tc("optional.energy.none") : ""}
            </p>
            {energyInterpretation ? (
              <div className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-2.5 py-2 text-[11px] font-semibold text-amber-900/90">
                {energyInterpretation}
              </div>
            ) : null}
          </div>
        </div>
      </details>

      <input type="hidden" name="judge" value={legacyJudgeStyle} />
      <input type="hidden" name="info" value={legacyInfoStyle} />

      <input type="hidden" name="ePercent" value={clampStrength(percents.ePercent)} />
      <input type="hidden" name="nPercent" value={clampStrength(percents.nPercent)} />
      <input type="hidden" name="tPercent" value={clampStrength(percents.tPercent)} />
      <input type="hidden" name="jPercent" value={clampStrength(percents.jPercent)} />

      <input type="hidden" name="ideaStrength" value={strengths.ideaStrength} />
      <input type="hidden" name="factStrength" value={strengths.factStrength} />
      <input type="hidden" name="logicStrength" value={strengths.logicStrength} />
      <input type="hidden" name="peopleStrength" value={strengths.peopleStrength} />

      <input type="hidden" name="conflictStyle" value={conflictStyle ?? ""} />
      <input type="hidden" name="energy" value={energy ?? ""} />
      <input type="hidden" name="conflictExplicit" value={conflictStyle ? "1" : "0"} />
      <input type="hidden" name="energyExplicit" value={energy ? "1" : "0"} />
      <input type="hidden" name="didTouchPercent" value={didTouchPercent ? "1" : "0"} />
      <input type="hidden" name="mbtiSource" value={mbtiSource} />

      <button
        type="submit"
        disabled={!canSubmit}
        className={[
          "w-full rounded-2xl mt-4 px-4 py-4 text-sm font-extrabold text-white transition-all duration-200 active:scale-[0.98]",
          !canSubmit ? "bg-slate-300 shadow-none cursor-not-allowed" : "mbti-primary-btn",
        ].join(" ")}
      >
        {isFull ? t("submit.full") : isSubmitting ? t("submit.joining") : `🫶 ${t("submit.join")}`}
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
