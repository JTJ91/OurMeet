import Link from "next/link";

export default function GuideLayout({
  title,
  description,
  children,
  hideHeader = false,
  hideTopBack = false,
  hideCTA = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;

  hideHeader?: boolean;
  hideTopBack?: boolean;
  hideCTA?: boolean;
}) {
  return (
    <main className="mbti-page-bg">
      <div className="mbti-shell pb-16">
        {/* Back */}
        {!hideTopBack && (
          <div className="mbti-card-frame mb-4 flex items-center justify-between">
            <Link
              href="/guides"
              className="mbti-back-btn whitespace-nowrap"
            >
              <span aria-hidden>←</span>
              <span>가이드 목록</span>
            </Link>
          </div>
        )}

        <div id="top" />

        {/* Header */}
        {!hideHeader && (
          <header className="mbti-card mbti-card-frame p-6">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 text-sm leading-7 text-slate-700">
                {description}
              </p>
            )}
          </header>
        )}

        <section className="mt-8 space-y-6">{children}</section>

        {/* CTA */}
        {!hideCTA && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/guides"
              className="mbti-back-btn flex-1 justify-center whitespace-nowrap px-6 py-3 text-sm font-semibold"
            >
              가이드 목록
            </Link>
            <Link
              href="/"
              className="mbti-primary-btn flex-1 justify-center whitespace-nowrap px-6 py-3 text-sm font-semibold text-white"
            >
              모임 케미 보러가기 →
            </Link>
          </div>
        )}
      </div>
      
    </main>
  );
}

export function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mbti-card mbti-card-frame p-5">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
