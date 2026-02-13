import Link from "next/link";

export default function GuideNotFound() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mbti-shell pb-16 pt-10">
        <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h1 className="text-xl font-extrabold">가이드를 찾을 수 없어요</h1>
          <p className="mt-3 text-sm text-slate-700">주소가 잘못되었거나 글이 이동되었을 수 있어요.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/guides" className="rounded-full bg-[#1E88E5] px-5 py-2 text-sm font-semibold text-white">
              가이드 목록
            </Link>
            <Link href="/" className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700">
              메인으로
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
