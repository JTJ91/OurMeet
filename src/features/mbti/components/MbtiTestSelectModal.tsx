"use client";

type Props = {
  open: boolean;
  locale?: string;
  onClose: () => void;
  onSelectQuick: () => void;
  onSelectFull: () => void;
};

type Locale = "ko" | "en" | "ja";

const UI_TEXT: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    quickTitle: string;
    quickDesc: string;
    fullTitle: string;
    fullDesc: string;
    close: string;
  }
> = {
  ko: {
    title: "MBTI 검사 선택",
    subtitle: "원하는 검사 버전을 선택하세요.",
    quickTitle: "간단 검사 (8문항)",
    quickDesc: "빠르게 결과를 확인해요.",
    fullTitle: "정밀 검사 (60문항)",
    fullDesc: "더 자세하게 성향을 분석해요.",
    close: "닫기",
  },
  en: {
    title: "Choose MBTI Test",
    subtitle: "Select the test version you want.",
    quickTitle: "Quick Test (8 questions)",
    quickDesc: "Get your result fast.",
    fullTitle: "Full Test (60 questions)",
    fullDesc: "Get a more detailed analysis.",
    close: "Close",
  },
  ja: {
    title: "MBTI診断を選択",
    subtitle: "希望する診断バージョンを選んでください。",
    quickTitle: "簡単テスト (8問)",
    quickDesc: "すばやく結果を確認できます。",
    fullTitle: "精密テスト (60問)",
    fullDesc: "より詳しく傾向を分析します。",
    close: "閉じる",
  },
};

function normalizeLocale(locale?: string): Locale {
  if (locale === "en" || locale === "ja") return locale;
  return "ko";
}

export default function MbtiTestSelectModal({
  open,
  locale,
  onClose,
  onSelectQuick,
  onSelectFull,
}: Props) {
  if (!open) return null;
  const ui = UI_TEXT[normalizeLocale(locale)];

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{ui.title}</h2>
            <p className="mt-1 text-xs text-slate-600">{ui.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-black/10 hover:bg-slate-50"
          >
            {ui.close}
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={onSelectQuick}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
          >
            <div className="text-sm font-extrabold text-slate-900">{ui.quickTitle}</div>
            <div className="mt-1 text-xs text-slate-600">{ui.quickDesc}</div>
          </button>

          <button
            type="button"
            onClick={onSelectFull}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
          >
            <div className="text-sm font-extrabold text-slate-900">{ui.fullTitle}</div>
            <div className="mt-1 text-xs text-slate-600">{ui.fullDesc}</div>
          </button>
        </div>
      </div>
    </div>
  );
}

