import Link from "next/link";

export const metadata = {
  title: "이용약관 | 모임랭크",
  description:
    "모임랭크(모임 MBTI 케미/랭킹 서비스) 이용약관입니다. 광고/제휴 링크 고지, 면책, 서비스 운영 기준 등을 안내합니다.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
        {/* Top left back */}
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
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            이용약관
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            본 약관은 <b className="text-slate-900">모임랭크</b> 서비스 이용과 관련하여,
            이용자와 운영자 간의 권리·의무 및 책임사항 등을 규정합니다.
          </p>

          <p className="mt-4 text-xs leading-6 text-slate-500">
            최종 업데이트: 2026-02-09
          </p>
        </header>

        <section className="mt-8 space-y-6">
          <Card title="1. 서비스 소개">
            <p className="text-sm leading-7 text-slate-700">
              모임랭크는 모임에 참여한 멤버의 MBTI 입력값을 바탕으로
              관계/케미 점수, 랭킹, 분포, 역할 추천 등 “재미를 위한 참고 정보”를 제공합니다.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              서비스 결과는 개인의 성격·관계·능력을 단정하거나 판단하기 위한 목적이 아니며,
              실제 관계 의사결정의 유일한 근거로 사용하지 않는 것을 권장합니다.
            </p>
          </Card>

          <Card title="2. 이용자의 의무">
            <ul className="space-y-2 text-sm leading-7 text-slate-700">
              <li>• 타인의 명예를 훼손하거나 불쾌감을 주는 콘텐츠/닉네임을 사용하지 않습니다.</li>
              <li>• 서비스 운영을 방해하는 방식(과도한 요청, 자동화된 접근 등)을 사용하지 않습니다.</li>
              <li>• 허위 정보 입력으로 인해 발생하는 분쟁/손해에 대해 운영자는 책임을 지지 않습니다.</li>
            </ul>
          </Card>

          <Card title="3. 광고 및 제휴(어필리에이트) 고지">
            <p className="text-sm leading-7 text-slate-700">
              모임랭크는 서비스 운영을 위해 광고(예: Google AdSense) 또는
              제휴 링크(예: 쿠팡 파트너스 등)를 포함할 수 있습니다.
            </p>

            <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
              <div className="text-xs font-extrabold text-slate-900">
                예시 고지 문구(권장)
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                본 페이지에는 제휴 링크가 포함될 수 있으며,
                이용자가 링크를 통해 구매할 경우 운영자가 일정액의 수수료를 제공받을 수 있습니다.
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
              또한 광고 운영 정책상 <b className="text-slate-900">광고 클릭 유도</b> 또는
              <b className="text-slate-900">부정 클릭</b>은 금지될 수 있습니다.
              이용자는 광고를 “지원 목적”으로 클릭하거나 클릭을 요청/유도하는 행위를 하지 않습니다.{" "}
            </p>
          </Card>

          <Card title="4. 외부 링크 및 제3자 서비스">
            <p className="text-sm leading-7 text-slate-700">
              서비스에는 제3자가 제공하는 웹사이트/서비스로 연결되는 링크가 포함될 수 있습니다.
              외부 링크의 콘텐츠, 상품/서비스, 정책 및 거래는 해당 제공자의 책임이며,
              운영자는 이에 대해 보증하거나 책임지지 않습니다.
            </p>
          </Card>

          <Card title="5. 지적재산권">
            <p className="text-sm leading-7 text-slate-700">
              서비스에 포함된 UI, 문구, 구성, 로고 등 일체의 저작물에 대한 권리는
              운영자 또는 정당한 권리자에게 귀속됩니다.
              이용자는 서비스 이용 범위를 넘어 무단 복제/배포/2차 가공을 할 수 없습니다.
            </p>
          </Card>

          <Card title="6. 서비스 변경 및 중단">
            <p className="text-sm leading-7 text-slate-700">
              운영자는 서비스의 품질 개선, 정책 변경, 기술적 필요에 따라
              서비스의 일부 또는 전부를 변경/중단할 수 있습니다.
              중요한 변경이 있는 경우 합리적인 방법으로 안내합니다.
            </p>
          </Card>

          <Card title="7. 면책 및 책임 제한">
            <ul className="space-y-2 text-sm leading-7 text-slate-700">
              <li>• 서비스 결과는 참고용이며, 결과의 정확성/적합성에 대해 보증하지 않습니다.</li>
              <li>• 이용자 간 분쟁, 모임 내 갈등, 의사결정에 대한 결과는 이용자 책임입니다.</li>
              <li>• 천재지변, 통신장애, 제3자 서비스 장애 등 불가항력 사유로 인한 손해에 대해 책임지지 않습니다.</li>
            </ul>
          </Card>

          <Card title="8. 개인정보 및 문의">
            <p className="text-sm leading-7 text-slate-700">
              개인정보 처리에 관한 내용은 <b className="text-slate-900">개인정보처리방침</b>에서 안내합니다.
              문의는 서비스 내 안내된 채널을 통해 접수할 수 있습니다.
            </p>
          </Card>

          <Card title="9. 준거법 및 관할">
            <p className="text-sm leading-7 text-slate-700">
              본 약관은 대한민국 법령을 준거법으로 하며,
              서비스 이용과 관련한 분쟁은 민사소송법상 관할 법원에 제기합니다.
            </p>
          </Card>

          {/* CTA */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              메인으로
            </a>
            <a
              href="/create"
              className="flex-1 rounded-full bg-[#1E88E5] px-6 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-[#1E88E5]/90"
            >
              우리 모임 케미 보러가기 →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
