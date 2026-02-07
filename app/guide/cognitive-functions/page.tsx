/*
사용자용(비개발자용) 안내 페이지
- MBTI ‘인지기능’이 무엇인지, 왜 케미(관계) 분석에 도움이 되는지 쉽게 설명
- 수학/공식/코드 느낌 제거, 예시와 쉬운 비유 중심
- 메인 화면과 비슷한 파스텔 톤 카드 UI 유지

Next.js App Router 기준
1) 새 페이지: app/guide/cognitive-functions/page.tsx
2) 메인 바로가기: app/page.tsx에 링크(칩/버튼) 추가
*/

// ============================================================
// 1) 새 페이지 생성: app/guide/cognitive-functions/page.tsx
// ============================================================

export const metadata = {
  title: "인지기능이 뭐예요? | 모임랭크",
  description: "MBTI 설명을 넘어, 인지기능으로 모임 케미를 보는 이유와 해석법을 쉽게 안내합니다.",
};

export default function CognitiveFunctionsGuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-sky-50 to-emerald-50 text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
        {/* 헤더 */}
        <header className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
            <div className="relative">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                인지기능이 뭐예요?
                </h1>

                <p className="mt-4 text-sm leading-7 text-slate-700">
                MBTI의 네 글자(ENFP, ISTJ 등)는 성향을 간단히 보여주는 분류예요.
                하지만 <span className="font-semibold text-[#1E88E5]">인지기능</span>은  
                우리가 <span className="font-semibold text-[#1E88E5]">어떻게 보고</span>,
                <span className="font-semibold text-[#1E88E5]"> 어떻게 생각하고</span>,
                <span className="font-semibold text-[#1E88E5]"> 어떻게 결정하는지</span>를 설명하는
                <span className="font-semibold text-slate-900">‘생각의 습관’</span>이에요.
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-700">
                예를 들어,
                어떤 사람은 <b className="text-slate-900">아이디어와 가능성</b>을 먼저 보고,
                어떤 사람은 <b className="text-slate-900">현실과 디테일</b>을 먼저 봐요.
                또 어떤 사람은 <b className="text-slate-900">논리와 효율</b>을,
                어떤 사람은 <b className="text-slate-900">가치와 감정</b>을 기준으로 결정하죠.
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-700">
                모임랭크는 이런 <span className="font-semibold text-[#1E88E5]">생각의 방식(인지기능)</span>이
                서로 얼마나 잘 맞는지를 바탕으로
                <span className="font-semibold text-[#1E88E5]">관계 케미 점수</span>를 보여줘요.
                </p>
            </div>
        </header>




        <section className="mt-8 space-y-6">
          {/* 1. 인지기능 한 줄 정의 */}
          <Card title="인지기능 = ‘자주 쓰는 생각 방식’" badge="1분 요약">
            <p className="text-sm leading-6 text-slate-700">
              인지기능은 말 그대로 <b>정보를 받아들이고</b>(어떻게 보고), <b>판단하고</b>(어떻게 결정하는지) 같은
              사람의 ‘기본 운전 방식’을 뜻해요.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Mini title="정보를 보는 방식" desc="예) 큰 그림·가능성 vs 사실·디테일" />
              <Mini title="결정하는 방식" desc="예) 논리·효율 vs 가치·감정" />
            </div>
          </Card>

          {/* 2. 왜 MBTI 4글자보다 도움이 되나 */}
          <Card title="왜 ‘네 글자’만 보는 것보다 좋아요?" badge="왜 중요?">
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>
                같은 MBTI라도 대화 상황/역할에 따라 느낌이 달라요. 인지기능은 <b>자주 쓰는 패턴</b>을 더 구체적으로 보여줘요.
              </li>
              <li>
                “충돌”도 단순히 안 맞는 게 아니라, <b>어떤 지점에서</b> 어긋나는지(속도/기준/관심사)를 설명하기 쉬워요.
              </li>
              <li>
                팀플·회식·단톡방에서 ‘왜 저 말이 서운했지?’ 같은 포인트를 <b>조금 더 안전하게</b> 이해하게 도와줘요.
              </li>
            </ul>
          </Card>

          {/* 3. 인지기능 스택(1~4) */}
          <Card title="인지기능 스택이란?" badge="핵심 개념">
            <p className="text-sm leading-6 text-slate-700">
              사람마다 자주 쓰는 기능이 ‘우선순위’처럼 정리되어 있어요. 이걸 <b>스택(1~4순위)</b>이라고 불러요.
            </p>
            <div className="mt-4 rounded-2xl bg-black/5 p-4 text-sm leading-6 text-slate-700">
              <b>비유로 보면</b>:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><b>1순위</b>: 자동으로 튀어나오는 주력(내 기본 말투/시선)</li>
                <li><b>2순위</b>: 비교적 편하게 쓰는 보조(협업/대화에서 자주 등장)</li>
                <li><b>3순위</b>: 상황 따라 쓰는 서브(컨디션 좋을 때 빛남)</li>
                <li><b>4순위</b>: 스트레스 받을 때 취약한 부분(건드리면 예민해질 수 있음)</li>
              </ul>
            </div>
          </Card>

          {/* 4. 모임랭크는 케미를 어떻게 보나요 */}
          <Card title="모임랭크는 ‘케미’를 이렇게 해석해요" badge="설명">
            <div className="grid gap-3 sm:grid-cols-2">
              <Mini title="① 대화 속도(리듬)" desc="말이 술술 이어지는지, 자주 끊기는지" />
              <Mini title="② 결정 기준" desc="효율/논리 vs 가치/마음 중 무엇을 더 중시하는지" />
              <Mini title="③ 관심 포인트" desc="가능성/아이디어 vs 현재/현실 같은 관점 차이" />
              <Mini title="④ 스트레스 포인트" desc="서로 예민해지는 트리거가 겹치는지" />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              ※ 결과는 ‘성격 판정’이 아니라, 모임에서 생길 수 있는 대화 흐름을 재미로 가볍게 보는 용도예요.
            </p>
          </Card>

          <Card title="케미 점수는 어떻게 계산되나요?" badge="쉽게 설명">
            <p className="text-sm leading-7 text-slate-700">
                모임랭크는 각 MBTI 유형이 자주 사용하는 인지기능의 조합을 비교해요.
                쉽게 말해, <b>생각의 리듬</b>이 잘 맞는지 보는 거예요.
            </p>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <div>
                ✔ <b>대화가 자연스럽게 이어지는지</b>  
                (관점과 관심사가 비슷한지)
                </div>
                <div>
                ✔ <b>결정 기준이 크게 충돌하지 않는지</b>  
                (논리 중심 vs 감정 중심 등)
                </div>
                <div>
                ✔ <b>서로 예민해지는 지점이 겹치지 않는지</b>
                </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
                이런 요소들을 종합해 점수를 계산하고,
                결과를 5단계 케미 등급으로 보여줘요.
            </p>
          </Card>


          {/* 5. 5단계 등급 */}
          <Card title="케미 등급은 이렇게 해석해요" badge="읽는 법">
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
                <li><b className="text-[#1E88E5]">찰떡궁합</b> → 대화가 잘 통하고 에너지가 잘 맞아요.</li>
                <li><b className="text-[#00C853]">합좋은편</b> → 전반적으로 무난하고 편한 조합이에요.</li>
                <li><b className="text-[#FDD835]">그럭저럭</b> → 상황에 따라 달라질 수 있어요.</li>
                <li><b className="text-[#FB8C00]">조율필요</b> → 서로 이해하려는 노력이 필요해요.</li>
                <li><b className="text-[#D50000]">한계임박</b> → 오해가 생기기 쉬운 조합이에요.</li>
            </ul>
          </Card>


          {/* 6. 읽는 법 */}
          <Card title="이렇게 읽으면 더 재밌어요" badge="팁">
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>
                <b>‘한계임박’</b>이 떠도 “절대 안 맞는다”가 아니라, <b>지금 방식 그대로면</b> 오해가 생기기 쉬운 조합이라고 보면 돼요.
              </li>
              <li>
                <b>‘조율필요’</b>는 룰/역할을 정하면 오히려 팀플이 잘 되는 경우도 많아요.
              </li>
              <li>
                결과가 애매하면, 단톡에서 <b>말투/속도/결정 기준</b>만 살짝 맞춰도 체감이 확 달라져요.
              </li>
            </ul>
          </Card>

          {/* 7. FAQ */}
          <Card title="자주 묻는 질문" badge="FAQ">
            <div className="space-y-3 text-sm leading-6 text-slate-700">
              <details className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer font-semibold text-slate-900">인지기능은 과학인가요?</summary>
                <p className="mt-2 text-slate-600">
                  성격을 완벽히 증명하는 과학이라기보다, 대화/협업에서 느끼는 차이를 설명하는 <b>프레임</b>에 가까워요.
                  모임랭크도 재미와 참고용으로만 사용해 주세요.
                </p>
              </details>
              <details className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer font-semibold text-slate-900">같은 MBTI인데도 케미가 다른데요?</summary>
                <p className="mt-2 text-slate-600">
                  친밀도, 역할, 컨디션, 대화 주제에 따라 많이 달라져요. 그래서 결과는 ‘절대값’이 아니라 ‘경향’으로 보는 게 좋아요.
                </p>
              </details>
              <details className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer font-semibold text-slate-900">결과가 마음에 안 들면요?</summary>
                <p className="mt-2 text-slate-600">
                  너무 진지하게 보지 말고, “우리가 어디서 오해가 날 수 있을까?” 정도로만 활용해 주세요.
                </p>
              </details>
            </div>
          </Card>

          {/* 하단 CTA */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="/" className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                메인으로
            </a>
            <a href="/" className="flex-1 rounded-full bg-[#1E88E5] px-6 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-[#1E88E5]/90">
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
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Mini({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="text-sm font-extrabold text-slate-900">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-600">{desc}</div>
    </div>
  );
}

function LevelChip({ label, color, hint }: { label: string; color: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3 text-center shadow-sm">
      <div className="mx-auto h-2 w-2 rounded-full" style={{ background: color }} />
      <div className="mt-2 text-sm font-extrabold" style={{ color }}>
        {label}
      </div>
      <div className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</div>
    </div>
  );
}
