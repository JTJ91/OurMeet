export default function GroupPageLoading() {
  return (
    <main className="mbti-page-bg pb-12">
      <div className="mbti-shell">
        <section className="mt-4">
          <div className="mbti-card-frame rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-8 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-slate-200" />
          </div>
        </section>

        <section className="mt-6">
          <div className="mbti-card-frame rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <div className="h-[360px] w-full animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </section>
      </div>
    </main>
  );
}
