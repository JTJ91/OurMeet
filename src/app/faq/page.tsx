import Link from "next/link";

export const metadata = {
  title: "자주 묻는 질문 | 모임랭크",
  description:
    "모임랭크를 쓰면서 많이 물어보는 질문들을 한 번에 정리했어요. 케미 점수, 케미 타입, 역할 추천, 개인정보 등.",
};

export default function FAQPage() {
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

        {/* 헤더 */}
        <header className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            자주 묻는 질문(FAQ)
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            모임랭크는 “재미 + 이해”를 위한 도구예요. 케미 점수/타입, 모임 역할
            추천, 결과 해석 방법을 자주 묻는 질문 형태로 모아뒀어요.
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            빠르게 요약하면{" "}
            <span className="font-semibold text-[#1E88E5]">
              “서로의 생각 방식이 자연스럽게 이어지는지”
            </span>
            를 보는 서비스예요.
          </p>
        </header>

        <section className="mt-8 space-y-6">
          {/* 1 */}
          <Card title="Q. 모임랭크는 정확히 뭐 하는 서비스인가요?">
            <p className="text-sm leading-7 text-slate-700">
              모임랭크는 모임 구성원의 MBTI를 바탕으로,
              <b className="text-slate-900"> 관계도(그래프)·케미 점수·역할</b>을
              보기 좋게 정리해주는 서비스예요.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>✔ 누가 누구랑 잘 맞는지(케미 랭킹)</div>
              <div>✔ 모임 분위기가 어떤 흐름인지(요약/타입)</div>
              <div>✔ 누가 어떤 역할에 강한지(역할 추천)</div>
            </div>
          </Card>

          {/* 2 */}
          <Card title="Q. 케미 점수는 MBTI 네 글자만 비교하나요?">
            <p className="text-sm leading-7 text-slate-700">
              아니요. 단순히 E/I, N/S 같은 글자만 맞춰보는 방식이 아니라,
              <span className="font-semibold text-[#1E88E5]">
                {" "}
                인지기능(생각 습관)
              </span>
              의 조합을 참고해 점수를 만들어요.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              그래서 같은 MBTI라도 “대화 주제/상황/역할”에 따라 체감이 달라질 수
              있어요.
            </p>

            <div className="mt-5">
              <a
                href="/guide/cognitive-functions"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 hover:bg-slate-50"
              >
                인지기능 설명 페이지 보기 →
              </a>
            </div>
          </Card>

          {/* 3 */}
          <Card title="Q. 케미 점수가 높으면 무조건 ‘베스트 프렌드’인가요?">
            <p className="text-sm leading-7 text-slate-700">
              꼭 그렇진 않아요. 점수는{" "}
              <b className="text-slate-900">“갈등이 적고 굴러가기 쉬운 조합”</b>
              에 가깝고,
              <b className="text-slate-900"> 친밀도</b>나{" "}
              <b className="text-slate-900">좋고 싫음</b>을 판정하는 값은 아니에요.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              점수가 낮아도 서로 “규칙/역할/말투”만 맞추면 오히려 더 오래 가는
              경우도 많아요.
            </p>
          </Card>

          {/* 4 */}
          <Card title="Q. 케미 랭킹의 ‘최고/최악’은 뭐 기준이에요?">
            <p className="text-sm leading-7 text-slate-700">
              모임 내 모든 2인 조합을 만들고,
              <b className="text-slate-900"> 점수 기준으로 상위/하위</b>를 뽑아요.
              그래서 멤버가 늘면 조합도 늘고 랭킹도 더 풍부해져요.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              참고로 “최악”은 비난이 아니라,
              <span className="font-semibold text-slate-900">
                {" "}
                조율 포인트가 많을 가능성이 큰 조합
              </span>
              이라는 뜻이에요.
            </p>
          </Card>

          {/* 5 */}
          <Card title="Q. 케미 타입(안정형/보완형/스파크/폭발형)은 뭘 의미해요?">
            <div className="space-y-3 text-sm leading-7 text-slate-700">
              <div>
                <b className="text-slate-900">🌊 안정형</b> — 템포만 맞추면
                편안하게 오래 가는 타입
              </div>
              <div>
                <b className="text-slate-900">🧩 보완형</b> — 역할 분담이 잘 되면
                효율이 확 올라가는 타입
              </div>
              <div>
                <b className="text-slate-900">⚡ 스파크형</b> — 재밌고 빠른데,
                전제/말투에서 오해가 생길 수 있는 타입
              </div>
              <div>
                <b className="text-slate-900">🧨 폭발형</b> — 피곤한 날엔
                대화 규칙이 없으면 감정 소모가 커질 수 있는 타입
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
              모임랭크는 타입별로 “대표 조합”을 점수 기준으로 골라 보여줘서,
              어떤 케이스가 많은지 한눈에 보기 쉬워요.
            </p>
          </Card>

          {/* 6 */}
          <Card title="Q. ‘모임 역할 추천’은 어떻게 정해요?">
            <p className="text-sm leading-7 text-slate-700">
              멤버들의 MBTI를 바탕으로{" "}
              <b className="text-slate-900">전략·분위기·실행·정리·중재</b> 같은
              역할 성향을 간단한 규칙으로 추정해요.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              “이 사람이 무조건 이 역할”이라기보다,
              <b className="text-slate-900"> 이 모임에서 그 역할이 자연스럽게</b>{" "}
              누가 맡기 쉬운지에 가까워요.
            </p>
          </Card>

          {/* 7 */}
          <Card title="Q. MBTI를 입력하지 않으면 어떻게 되나요?">
            <p className="text-sm leading-7 text-slate-700">
              MBTI가 없으면 일부 분석(케미 점수/타입, 분포)이 제한돼요.
              <b className="text-slate-900"> 최소 2명</b>이 입력하면 케미 랭킹과
              타입 분류가 동작해요.
            </p>
          </Card>

          {/* 8 */}
          <Card title="Q. 결과가 마음에 안 들면 바꿀 수 있어요?">
            <p className="text-sm leading-7 text-slate-700">
              MBTI를 수정하면 결과는 즉시 다시 계산돼요.
              그리고 모임은 “사람 + 상황”이니까,
              결과는 <b className="text-slate-900">참고용</b>으로만 봐주세요.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              오히려 점수가 애매한 구간이 “대화 규칙만 세우면 확 좋아지는”
              구간인 경우가 많아요.
            </p>
          </Card>

          {/* 9 */}
          <Card title="Q. 개인정보는 안전한가요?">
            <p className="text-sm leading-7 text-slate-700">
              모임랭크는 분석을 위해 <b className="text-slate-900">별명</b>과{" "}
              <b className="text-slate-900">MBTI</b>만 사용하도록 설계하는 걸
              권장해요.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              실제 이름/연락처 같은 민감정보는 입력하지 않는 걸 추천해요.
            </p>
          </Card>

          {/* 10 */}
          <Card title="Q. 점수나 타입은 ‘정답’인가요?">
            <p className="text-sm leading-7 text-slate-700">
              정답이 아니에요. 사람을 판정하려는 게 아니라,
              <b className="text-slate-900"> 오해가 생기는 포인트</b>와{" "}
              <b className="text-slate-900">잘 굴러가는 포인트</b>를 빠르게
              파악하려는 목적이에요.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              점수가 낮게 나와도 “대화 속도/결정 기준/말투”를 맞추면 충분히
              좋아질 수 있어요.
            </p>
          </Card>

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
