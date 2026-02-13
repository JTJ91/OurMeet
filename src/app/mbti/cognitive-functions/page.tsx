import BackNavButton from "@/app/components/BackNavButton";

export const metadata = {
  title: "케미 점수는 어떻게 계산되나요? | 모임랭크",
  description:
    "모임랭크는 MBTI 네 글자가 아니라, 인지기능(생각 방식)의 조합을 비교해 케미를 계산합니다.",
};

export default function CognitiveFunctionsGuidePage() {
  return (
    <main className="mbti-page-bg">
      <div className="mbti-shell w-full max-w-3xl pb-10">
        {/* Top left back */}
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <BackNavButton
            label="뒤로가기"
            icon="←"
            fallbackHref="/mbti"
            className="mbti-back-btn"
          />
        </div>
        
        {/* 헤더 */}
        <header className="mbti-card mbti-card-frame p-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            케미 점수는 어떻게 계산되나요?
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            모임랭크는 MBTI 네 글자를 그대로 비교하지 않아요.
            대신, 각 유형이 자주 쓰는{" "}
            <span className="font-semibold text-[#1E88E5]">
              ‘생각의 습관(인지기능)’
            </span>
            이 서로 어떻게 만나느냐를 비교해요.
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            쉽게 말하면,
            <b className="text-slate-900">
              “우리가 어떻게 보고, 생각하고, 결정하는지”
            </b>
            가 잘 이어지는지를 보는 거예요.
          </p>
        </header>

        <section className="mt-8 space-y-6">
          {/* 인지기능 설명 */}
          <Card title="인지기능이 뭐예요?">
            <p className="text-sm leading-6 text-slate-700">
              사람마다 정보를 보는 방식과 결정하는 방식이 달라요.
            </p>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div>
                ✔ 어떤 사람은 <b>가능성·아이디어</b>를 먼저 보고
              </div>
              <div>
                ✔ 어떤 사람은 <b>사실·디테일</b>을 먼저 봐요
              </div>
              <div>
                ✔ 어떤 사람은 <b>논리·효율</b>을 기준으로 판단하고
              </div>
              <div>
                ✔ 어떤 사람은 <b>가치·감정</b>을 더 중요하게 생각해요
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-700">
              이런 기본적인 사고 습관을 인지기능이라고 불러요.
            </p>
          </Card>

          {/* 계산 원리 */}
          <Card title="모임랭크는 이렇게 케미를 봐요">
            <div className="space-y-4 text-sm leading-6 text-slate-700">
              <div>
                <b>① 주로 쓰는 생각 방식이 충돌하는지</b>
                <br />
                둘 다 같은 기준을 강하게 밀어붙이면
                빠르게 결론은 나지만, 주도권 싸움이 생길 수 있어요.
              </div>

              <div>
                <b>② 서로 보완해주는 구조인지</b>
                <br />
                한 사람의 강점이 다른 사람의 약한 부분을 채워주면
                대화가 자연스럽게 이어져요.
              </div>

              <div>
                <b>③ 생각의 방향이 비슷한지</b>
                <br />
                큰 그림을 보는 사람끼리,
                현실을 보는 사람끼리,
                혹은 서로 다른 방향을 균형 있게 채워주는지 봐요.
              </div>

              <div>
                <b>④ 예민한 부분이 겹치는지</b>
                <br />
                스트레스 받을 때 건드려지는 부분이 비슷하면
                갈등이 생길 가능성이 커요.
              </div>
            </div>
          </Card>

          {/* 점수 설명 */}
          <Card title="그래서 점수가 달라져요">
            <p className="text-sm leading-7 text-slate-700">
              점수는 단순히 “성격이 같다/다르다”가 아니라,
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>✔ 대화 흐름이 자연스러운지</div>
              <div>✔ 역할 분담이 되는지</div>
              <div>✔ 생각이 자주 부딪히는지</div>
              <div>✔ 속도와 기준이 크게 어긋나는지</div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
              이런 요소들을 종합해서 계산해요.
              그래서 같은 MBTI라도 상황에 따라 체감이 달라질 수 있어요.
            </p>
          </Card>

          {/* 등급 설명 */}
          <Card title="케미 등급은 이렇게 읽어요">
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              <li>
                <b className="text-[#1E88E5]">찰떡궁합</b> → 서로의 강점이 잘
                이어지고 대화가 자연스럽게 흐르는 조합이에요.
              </li>
              <li>
                <b className="text-[#00C853]">합좋은편</b> → 전반적으로 편안하고
                무난한 관계예요.
              </li>
              <li>
                <b className="text-[#FDD835]">그럭저럭</b> → 상황에 따라 다르게
                느껴질 수 있어요.
              </li>
              <li>
                <b className="text-[#FB8C00]">조율필요</b> → 서로 이해하려는
                노력이 있으면 더 좋아질 수 있어요.
              </li>
              <li>
                <b className="text-[#D50000]">한계임박</b> → 생각 방식이 자주
                부딪힐 수 있어요. 거리 조절이나 역할 정리가 중요해요.
              </li>
            </ul>
          </Card>

          {/* 주의 */}
          <Card title="꼭 기억해 주세요">
            <p className="text-sm leading-7 text-slate-700">
              이 결과는 사람을 판단하기 위한 게 아니라,
              대화와 협업을 더 잘 이해하기 위한 참고용이에요.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              점수가 낮다고 “안 맞는 사람”이라는 뜻은 아니고,
              지금 방식 그대로 두면 오해가 생길 수 있다는 의미에 가까워요.
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
    <div className="mbti-card mbti-card-frame p-5">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
