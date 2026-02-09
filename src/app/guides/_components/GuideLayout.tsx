import Link from "next/link";

export default function GuideLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
        {/* Back */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <span aria-hidden>←</span>
            <span>메인으로</span>
          </Link>
        </div>

        {/* Header */}
        <header className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-4 text-sm leading-7 text-slate-700">{description}</p>
          )}
        </header>

        <section className="mt-8 space-y-6">{children}</section>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/guides"
            className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            가이드 목록
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-full bg-[#1E88E5] px-6 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-[#1E88E5]/90"
          >
            모임 케미 보러가기 →
          </Link>
        </div>
      </div>
    </main>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
