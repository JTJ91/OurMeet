"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useEffect, useCallback, useState } from "react";



type Props = {
  locale: string;
};

type FeatureStatus = "LIVE" | "BETA" | "COMING";

type FeatureCard = {
  key: string;
  title: string;
  desc: string;
  status: FeatureStatus;
  href?: string;
  bullets: string[];
  preview?: React.ReactNode;
};

function StatusBadge({ status }: { status: FeatureStatus }) {
  const map: Record<FeatureStatus, { label: string; className: string }> = {
    LIVE: { label: "LIVE", className: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20" },
    BETA: { label: "BETA", className: "bg-amber-500/10 text-amber-700 ring-amber-600/20" },
    COMING: { label: "COMING", className: "bg-slate-500/10 text-slate-700 ring-slate-600/20" },
  };

  const m = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${m.className}`}>
      {m.label}
    </span>
  );
}

function CardShell({
  children,
  clickable,
}: {
  children: React.ReactNode;
  clickable?: boolean;
}) {
  return (
    <div
      className={[
        "group relative rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-black/5",
        clickable ? "transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function PreviewModal({
  open,
  onClose,
  title,
  src,
  closeLabel,
  closeAriaLabel,
  hintText,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  src: string;
  closeLabel: string;
  closeAriaLabel: string;
  hintText: string;
}) {
  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <button
        type="button"
        aria-label={closeAriaLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-[980px] overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] ring-1 ring-black/10">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-slate-900">{title}</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-extrabold text-slate-700 hover:bg-slate-50"
            >
              {closeLabel}
            </button>
          </div>

          <div className="relative bg-[#F5F9FF]">
            {/* 9:16-ish 높이. 필요하면 조절 */}
            <div className="h-[78vh] w-full">
              <iframe
                title={title}
                src={src}
                className="h-full w-full"
                // iframe 내부에서 같은 도메인이라면 더 많은 제어 가능
                // sandbox를 너무 강하게 걸면 next 링크/스크롤이 막힐 수 있어 최소만
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </div>

            {/* subtle bottom hint */}
            <div className="border-t border-slate-200/70 bg-white px-4 py-3 text-[12px] font-semibold text-slate-500">
              {hintText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function HomePageIntlClient({ locale }: Props) {
  const t = useTranslations("landing");
  const base = locale === "ko" ? "" : `/${locale}`;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");


  const openPreview = useCallback((title: string, href: string) => {
    setPreviewTitle(title);
    setPreviewSrc(href);
    setPreviewOpen(true);
  }, []);

  const features: FeatureCard[] = [
    {
      key: "mbti-cog-chem",
      title: t("feature.mbtiCogChem.title"),
      desc: t("feature.mbtiCogChem.desc"),
      status: "LIVE",
      href: `${base}/mbti`,
      bullets: [t("feature.mbtiCogChem.b1"), t("feature.mbtiCogChem.b2"), t("feature.mbtiCogChem.b3")],
      preview: <div />,
    },

    {
      key: "saju",
      title: t("feature.saju.title"),
      desc: t("feature.saju.desc"),
      status: "COMING",
      bullets: [t("feature.saju.b1"), t("feature.saju.b2"), t("feature.saju.b3")],
    },
  ];

  return ( 
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-16">
        {/* ===== Header / Hero ===== */}
        <section className="text-center">
          <div className="mb-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
              <span className="text-slate-900">{t("brandPrefix")}</span>
              <span className="ml-1 text-[#1E88E5]">{t("brandAccent")}</span>
            </h1>

            <p className="mt-2 text-sm font-extrabold tracking-wide text-slate-500">{t("tagline")}</p>
          </div>

          <h2 className="mt-6 text-xl sm:text-3xl font-black leading-tight text-slate-900">
            {t("platformHeadline1")} <span className="text-[#1E88E5]">{t("platformHeadlineAccent")}</span>
            <br className="hidden sm:block" />
            {t("platformHeadline2")}
          </h2>

          <p className="mx-auto mt-6 max-w-[860px] text-sm sm:text-base leading-7 text-slate-600">
            {t("platformDescription1")}
            <br className="hidden sm:block" />
            {t("platformDescription2")}
          </p>
        </section>

        {/* ===== Dashboard grid ===== */}
        <section className="mt-10">

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const clickable = !!f.href && f.status !== "COMING";
              const content = (
                <CardShell clickable={clickable}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-black text-slate-900">{f.title}</div>
                      <div className="mt-1 text-[13px] leading-6 text-slate-600">{f.desc}</div>
                    </div>
                    <StatusBadge status={f.status} />
                  </div>

                  <ul className="mt-4 space-y-1.5 text-[13px] leading-6 text-slate-700">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1E88E5]/50" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {f.preview}

                    <div className="mt-5 flex items-center justify-between gap-3">

                    <div className="flex w-full items-center justify-between">
                      <button
                        type="button"
                        disabled={!f.href || f.status === "COMING"}
                        onClick={() => openPreview(f.title, `${f.href}?preview=1`)}
                        className={[
                          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-extrabold ring-1 transition",
                          f.href && f.status !== "COMING"
                            ? "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                            : "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed",
                        ].join(" ")}
                      >
                        {t("preview")}
                      </button>

                      {f.href && f.status !== "COMING" ? (
                        <Link
                          href={f.href}
                          target="_self"
                          className="inline-flex items-center gap-1 rounded-full bg-[#1E88E5] px-3 py-1.5 text-[12px] font-extrabold text-white ring-1 ring-[#1E88E5]/20 transition hover:opacity-95"
                        >
                          {t("view")}
                          <span aria-hidden>→</span>
                        </Link>
                      ) : (
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-extrabold text-slate-500 ring-1 ring-slate-200">
                          {t("wait")}
                        </div>
                      )}
                    </div>
                  </div>

                </CardShell>
              );

               return <div key={f.key}>{content}</div>;
            })}
          </div>
        </section>

        <p className="mt-10 text-center text-[12px] font-medium text-slate-400">{t("footer")}</p>
      </div>

        <PreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={previewTitle}
          src={previewSrc}
          closeLabel={t("close")}
          closeAriaLabel={t("closeAria")}
          hintText={t("previewHint")}
        />       

    </main>
  );
}
