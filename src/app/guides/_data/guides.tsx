import React from "react";
import { Card } from "../_components/GuideLayout";

export type Guide = {
  slug: string;
  title: string;
  description: string;
  keywords?: string[];
  component: React.ReactNode;
};


const AdPlaceholder = () => (
  <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 text-center text-xs text-slate-500">
    (광고 영역) — 추후 Google AdSense / 쿠팡 파트너스 배치 위치
  </div>
);


export const GUIDES: Guide[] = [
  {
    slug: "what-is-chem",
    title: "모임 케미란 무엇인가?",
    description:
      "‘잘 맞는다’는 감이 아니라, 대화 흐름·결정 속도·역할 분담이 자연스럽게 굴러가는 상태를 뜻해요.",
    keywords: ["MBTI", "케미", "모임", "팀워크", "인지기능"],
    component: (
        <>
            <Card title="모임 케미란 무엇인가?">
            <p className="text-sm leading-7 text-slate-700">
                모임 케미는 단순히 “성격이 잘 맞는다”가 아니라,
                <b className="text-slate-900"> 대화가 자연스럽게 이어지고, 결론이 나고, 역할이 돌아가는 상태</b>를 말해요.
                같은 목표를 가진 모임이라도 생각 방식(인지기능)이 엇갈리면,
                회의가 길어지고 피로도가 쌓이기 쉽습니다.
            </p>

            <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">한 문장 정의</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                케미 = <b className="text-slate-900">“정보를 보는 방식 + 결정을 내리는 방식”</b>이 서로 잘 이어져서,
                <b className="text-slate-900"> 덜 싸우고 더 빨리 굴러가는 정도</b>
                </p>
            </div>
            </Card>

            <Card title="모임에서 케미가 무너지면 보이는 신호 7가지">
            <ul className="space-y-2 text-sm leading-7 text-slate-700">
                <li>✔ 회의는 했는데, 끝나고 나면 “그래서 뭐 하기로 했지?”가 남는다</li>
                <li>✔ 같은 말(요지/근거/감정)이 반복된다</li>
                <li>✔ 의견은 많은데 선택이 안 되고, 결정이 미뤄진다</li>
                <li>✔ 사소한 말투/표현에서 분위기가 급격히 식는다</li>
                <li>✔ “너는 왜 그렇게까지 따져?” vs “너는 왜 근거가 없어?”가 반복된다</li>
                <li>✔ 실행은 하는데 방향이 자주 바뀌고, 기록이 남지 않는다</li>
                <li>✔ 모임이 끝나면 결과보다 피로가 먼저 남는다</li>
            </ul>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                이런 현상은 성격 문제가 아니라,
                <b className="text-slate-900"> ‘사고 구조가 서로 맞물리지 않는 상태’</b>에서 자주 생겨요.
            </p>
            </Card>

            <Card title="좋은 케미가 있는 모임의 특징 5가지">
            <ul className="space-y-2 text-sm leading-7 text-slate-700">
                <li>✔ 말이 겹치지 않고, 누가 이어받아도 흐름이 끊기지 않는다</li>
                <li>✔ ‘아이디어 → 정리 → 결정 → 실행’이 자연히 분업된다</li>
                <li>✔ 갈등이 생겨도 “오해였네”로 수습되는 속도가 빠르다</li>
                <li>✔ 회의가 길어져도, 결론 문장이 남는다</li>
                <li>✔ 모임 이후 “찝찝함”보다 “진행감”이 남는다</li>
            </ul>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">대화</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                    요지/근거/감정이 자연스럽게 분리되어, 서로 “틀린 말”로 듣지 않아요.
                </p>
                </div>
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">결정</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                    선택 기준이 공유되고, 마지막에 “결론 문장”이 남습니다.
                </p>
                </div>
            </div>
            </Card>

            <Card title="모임랭크의 케미 점수는 무엇을 반영하나요?">
            <p className="text-sm leading-7 text-slate-700">
                점수는 “같다/다르다”가 아니라,
                <b className="text-slate-900"> 대화 흐름·결정 기준·역할 분담·갈등 포인트</b>를 종합해요.
                특히 모임랭크는 MBTI 네 글자를 그대로 비교하기보다,
                <b className="text-slate-900"> 인지기능(생각 습관)의 조합</b>이 어떻게 만나느냐를 중심으로 봅니다.
            </p>

            <div className="mt-4 space-y-3 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">점수가 높아지는 경우</div>
                <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                <li>✔ 한쪽이 요지를 잡고, 한쪽이 근거/디테일을 채운다</li>
                <li>✔ 논리와 공감이 “순서”만 잘 맞춰도 이어진다</li>
                <li>✔ 결론형과 탐색형이 단계(아이디어/결정)를 분리해 운영한다</li>
                </ul>
            </div>

            <div className="mt-3 space-y-3 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">점수가 낮아지는 경우</div>
                <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                <li>✔ 같은 기준을 강하게 밀어붙여 주도권 싸움이 난다</li>
                <li>✔ ‘요지/근거/감정’ 중 서로 중요하게 보는 축이 계속 어긋난다</li>
                <li>✔ 피곤한 날에 말투/표현이 바로 오해로 번역된다</li>
                </ul>
            </div>
            </Card>

            <Card title="케미는 ‘사람 평가’가 아니라 ‘운영 힌트’예요">
            <p className="text-sm leading-7 text-slate-700">
                점수가 낮다고 “안 맞는 사람”이라는 뜻이 아니에요.
                다만 지금 방식 그대로 두면,
                <b className="text-slate-900"> 오해가 생길 확률이 높은 구간</b>이 있다는 의미에 가깝습니다.
            </p>

            <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">추천 운영법(가장 효과 좋은 3개)</div>
                <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-700">
                <li>
                    ✔ <b className="text-slate-900">단계 선언</b>:
                    “아이디어 단계/결정 단계”를 먼저 말하면 충돌이 확 줄어요.
                </li>
                <li>
                    ✔ <b className="text-slate-900">기준 공개</b>:
                    “나는 지금 OO 기준으로 보고 있어” 한 문장만 해도 오해가 줄어요.
                </li>
                <li>
                    ✔ <b className="text-slate-900">결론 문장 1개</b>:
                    끝날 때 “오늘 결론은 ___”만 남기면 다음이 달라집니다.
                </li>
                </ul>
            </div>
            </Card>

            <Card title="자주 묻는 질문 (FAQ)">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">Q. MBTI가 같으면 무조건 잘 맞나요?</b>
                <p className="mt-1">
                    아닙니다. 같은 유형이라도 <b className="text-slate-900">같은 축을 강하게 밀면</b> 충돌이 날 수 있어요.
                    케미는 “같음”보다 <b className="text-slate-900">맞물림(역할 분담)</b>에서 좋아지는 경우가 많습니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 점수가 낮으면 관계를 피해야 하나요?</b>
                <p className="mt-1">
                    피해야 한다는 뜻이 아니라, <b className="text-slate-900">운영 장치가 필요</b>하다는 의미에 더 가깝습니다.
                    (단계 선언/기준 공개/결론 문장 같은 룰이 특히 효과적이에요.)
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 평균 점수가 높으면 무조건 좋은 모임인가요?</b>
                <p className="mt-1">
                    평균보다 중요한 건 <b className="text-slate-900">최저점 관리</b>예요.
                    최악 1~2 조합이 자주 부딪히는 구조면 체감이 급격히 나빠질 수 있습니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 케미 점수는 시간이 지나면 바뀌나요?</b>
                <p className="mt-1">
                    사람의 관계는 변하지만, 이 점수는 <b className="text-slate-900">사고 방식의 구조적 궁합</b>을 보므로
                    큰 틀은 비슷하게 유지됩니다. 대신 운영(룰/역할/분위기)이 바뀌면 체감은 크게 달라질 수 있어요.
                </p>
                </div>
            </div>
            </Card>

            <Card title="다음으로 보면 좋은 가이드">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                href="/guides/no-conclusion"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    왜 우리 모임은 자꾸 결론이 안 날까? (TJ 부족)
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    결론이 안 나는 모임의 구조적 원인과 처방 3가지
                </p>
                </a>

                <a
                href="/guides/cognitive-clash"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    MBTI 인지기능이 모임에서 충돌하는 순간
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    큰그림/디테일, 효율/감정 충돌을 줄이는 말하기 룰
                </p>
                </a>
            </div>

            </Card>
        </>
        ),

  },

  {
    slug: "no-conclusion",
    title: "왜 우리 모임은 자꾸 결론이 안 날까? (TJ 부족)",
    description:
      "회의가 길어지는 건 게으름이 아니라 ‘결정 방식’의 구성 문제일 수 있어요. 해결은 의외로 간단합니다.",
    keywords: ["결론", "회의", "TJ", "정리", "결정"],
    component: (
        <>
            <Card title="왜 우리 모임은 자꾸 결론이 안 날까? (TJ 부족)">
            <p className="text-sm leading-7 text-slate-700">
                결론이 안 나는 모임은 의외로 “의견이 없어서”가 아니라,
                <b className="text-slate-900"> 정리·판단·결정 역할이 비어 있어서</b> 멈추는 경우가 많아요.
                특히 TJ 성향(특히 T+J)이 약하면 회의가 풍부해질수록 “선택”이 더 어려워집니다.
            </p>

            <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">한 문장 핵심</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                결론이 안 나는 이유 = <b className="text-slate-900">결정 기준이 공유되지 않은 상태에서 옵션만 늘어나는 구조</b>
                </p>
            </div>
            </Card>

            <Card title="결론이 안 나는 모임에서 자주 보이는 신호 9가지">
            <ul className="space-y-2 text-sm leading-7 text-slate-700">
                <li>✔ “다 좋은데…”로 끝나고 선택이 없다</li>
                <li>✔ 옵션이 줄지 않고 계속 추가된다</li>
                <li>✔ 회의가 끝나도 다음 액션이 비어 있다</li>
                <li>✔ “그건 별로야”는 많은데 “그럼 이걸로”가 없다</li>
                <li>✔ 결정 직전에 다시 처음으로 돌아간다</li>
                <li>✔ 기준이 사람마다 달라서 대화가 평행선이 된다</li>
                <li>✔ 기록이 없어서 다음에 같은 회의를 또 한다</li>
                <li>✔ 누가 정리하려 하면 “너무 단정 짓지 마”가 나온다</li>
                <li>✔ 결국 ‘제일 말 센 사람’ 의견으로 마감된다</li>
            </ul>
            </Card>

            <Card title="TJ가 부족하면 생기는 구조적 문제">
            <p className="text-sm leading-7 text-slate-700">
                TJ(특히 T+J)는 모임에서 자주
                <b className="text-slate-900"> 기준을 세우고, 선택지를 줄이고, 결론 문장을 만드는 기능</b>을 담당합니다.
                이 축이 약하면 모임은 “합의”는 되는데 “결정”이 안 나는 패턴으로 가요.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">많이 나오는 말</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                    “좀 더 얘기해보자”, “결정은 다음에”, “일단 보류”
                </p>
                </div>
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">실제 문제</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                    대화가 부족한 게 아니라 <b className="text-slate-900">수렴 규칙이 없는 것</b>
                </p>
                </div>
            </div>
            </Card>

            <Card title="원인 3가지: 결론이 안 나는 모임의 숨은 구조">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">① 기준이 없다</b><br />
                “가성비/퀄리티/속도/분위기” 중 무엇이 우선인지 공유되지 않으면,
                모두가 맞는 말을 하고도 결론이 안 나요.
                </div>
                <div>
                <b className="text-slate-900">② 옵션이 줄지 않는다</b><br />
                탐색(아이디어) 단계가 길어지고, 수렴(선택) 단계로 못 넘어갑니다.
                </div>
                <div>
                <b className="text-slate-900">③ 결론 문장이 없다</b><br />
                “오늘은 A로 간다” 같은 문장이 남지 않으면,
                다음 모임에서 같은 논의를 다시 하게 됩니다.
                </div>
            </div>
            </Card>

            <Card title="바로 먹히는 처방 5가지 (TJ가 없어도 굴러가게)">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">1) 기준 1줄을 먼저 정하기</b><br />
                “오늘은 퀄리티 우선”, “이번엔 비용 상한 10만”, “속도 우선”처럼
                <b className="text-slate-900"> 기준 한 줄</b>이 있으면 결론이 나기 시작해요.
                </div>

                <div>
                <b className="text-slate-900">2) 타임박스 + A/B 고정</b><br />
                10분 토론 후 “A/B 중 택1”로 강제 수렴.
                옵션을 늘리는 대신 줄이는 규칙을 넣습니다.
                </div>

                <div>
                <b className="text-slate-900">3) ‘정리 담당’을 사람 말고 역할로 지정</b><br />
                “오늘은 OO가 결론 문장 1개로 마감”처럼 라운드제로 운영하면
                특정인에게 부담이 몰리지 않아요.
                </div>

                <div>
                <b className="text-slate-900">4) 결론 3갈래 템플릿</b><br />
                회의 말미에 무조건 아래 중 하나로 분류합니다:
                <div className="mt-2 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                    <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                    <li>✔ <b className="text-slate-900">결정</b>: “A로 한다”</li>
                    <li>✔ <b className="text-slate-900">보류</b>: “정보가 부족해 다음에” + 필요한 정보 1개</li>
                    <li>✔ <b className="text-slate-900">실험</b>: “작게 해보고 다음에 판단” + 기간/기준</li>
                    </ul>
                </div>
                </div>

                <div>
                <b className="text-slate-900">5) 기록은 ‘회의록’ 말고 ‘결론 3줄’</b><br />
                긴 회의록이 아니라,
                <b className="text-slate-900">결론 1줄 + 다음 액션 2개</b>만 남겨도 다음이 달라져요.
                </div>
            </div>
            </Card>

            <Card title="30초 자가진단: 우리 모임은 뭐가 비어있을까?">
            <div className="space-y-3 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">체크</div>
                <ul className="mt-2 space-y-1.5">
                    <li>☐ 결정 기준이 회의 시작에 공유된다</li>
                    <li>☐ 옵션을 줄이는 규칙이 있다(A/B, 상한, 우선순위)</li>
                    <li>☐ 결론 문장이 남는다(“오늘은 A”)</li>
                    <li>☐ 다음 액션이 최소 1개는 확정된다</li>
                    <li>☐ 보류일 경우 “필요한 정보 1개”가 정해진다</li>
                </ul>
                </div>

                <p className="text-sm leading-7 text-slate-700">
                2개 이하라면, 분위기 문제가 아니라 <b className="text-slate-900">수렴 프로세스</b>가 부족할 확률이 높아요.
                </p>
            </div>
            </Card>

            <Card title="자주 묻는 질문 (FAQ)">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">Q. TJ가 없으면 무조건 결론이 안 나나요?</b>
                <p className="mt-1">
                    꼭 그렇진 않아요. <b className="text-slate-900">사람 대신 룰</b>로 TJ 역할을 대신하면 됩니다.
                    (기준 1줄, A/B 고정, 결론 3갈래 템플릿이 특히 효과적이에요.)
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 결론을 내리면 누군가가 손해 보는 느낌이 들어요.</b>
                <p className="mt-1">
                    그럴 땐 “결정” 대신 <b className="text-slate-900">실험</b>으로 바꾸세요.
                    “2주만 해보고 기준으로 판단”처럼 임시 결론이면 부담이 확 줄어요.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 회의가 길어질 때 가장 빠른 한 방은 뭔가요?</b>
                <p className="mt-1">
                    <b className="text-slate-900">“오늘 기준이 뭐야?”</b> 한 문장입니다.
                    기준이 정해지면 옵션이 갑자기 줄어요.
                </p>
                </div>
            </div>
            </Card>

            <Card title="다음으로 보면 좋은 가이드">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                href="/guides/too-many-exec"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    실행형이 많으면 생기는 5가지 현상
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    빠른 모임을 ‘성과’로 바꾸는 스위치 2개
                </p>
                </a>

                <a
                href="/guides/beyond-average"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    모임 평균 점수보다 중요한 것
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    평균보다 강한 변수: 최저점·역할·갈등 루틴
                </p>
                </a>
            </div>
            </Card>

        </>
        ),

  },

  {
    slug: "too-many-exec",
    title: "실행형이 많으면 생기는 5가지 현상",
    description:
      "빠르고 재밌지만, 방향이 없으면 ‘열심히 하다가 엇갈리는’ 일이 생겨요. 실행력이 강한 모임을 더 잘 굴리는 법.",
    keywords: ["실행형", "속도", "즉흥", "P", "S"],
    component: (
        <>
            <Card title="실행형이 많으면 생기는 5가지 현상">
            <p className="text-sm leading-7 text-slate-700">
                실행형이 많은 모임은 시작이 빠르고 에너지가 좋아요.
                “일단 해보자”가 자연스럽게 나오고, 분위기도 잘 살아납니다.
                다만 방향·기록·수렴이 약하면 <b className="text-slate-900">열심히 하는데도 결과가 엇갈리는 모임</b>이 되기 쉬워요.
            </p>

            <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">한 문장 핵심</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                실행형 모임의 문제는 ‘속도’가 아니라, <b className="text-slate-900">속도가 쌓일 구조(목표·기록·우선순위)</b>가 없는 겁니다.
                </p>
            </div>
            </Card>

            <Card title="먼저 장점부터: 실행형 모임이 강한 이유">
            <ul className="space-y-2 text-sm leading-7 text-slate-700">
                <li>✔ 시작이 빠르다 (회의보다 행동)</li>
                <li>✔ 분위기/텐션이 산다 (지루할 틈이 적다)</li>
                <li>✔ 실행이 ‘즉시’ 나온다 (오늘 당장 할 일이 생긴다)</li>
                <li>✔ 작은 성취가 자주 쌓인다 (사기 유지에 유리)</li>
            </ul>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                그래서 실행형이 많은 모임은 <b className="text-slate-900">재미·추진력</b> 측면에서 이미 상위권이에요.
                문제는 이 에너지가 “성과”로 연결되느냐입니다.
            </p>
            </Card>

            <Card title="그런데 같이 오는 5가지 현상 (진짜 자주 나옵니다)">
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-7 text-slate-700">
                <li>
                <b className="text-slate-900">방향이 자주 바뀐다</b> — 재밌는 쪽으로 핸들이 꺾이면서 목표가 흔들림
                </li>
                <li>
                <b className="text-slate-900">기록이 없다</b> — “분명 뭘 했는데…” 남는 게 없음
                </li>
                <li>
                <b className="text-slate-900">중간 점검이 없다</b> — 끝나고 나서 “왜 이랬지?”가 나옴
                </li>
                <li>
                <b className="text-slate-900">우선순위가 흐릿하다</b> — 할 일은 많은데 지금 뭐부터인지 불명확
                </li>
                <li>
                <b className="text-slate-900">오해도 빨리 생긴다</b> — 말이 짧아지고 속도가 빨라지면 해석이 갈림
                </li>
            </ol>
            </Card>

            <Card title="왜 이런 일이 생길까? 실행형 모임의 ‘구조적 빈칸’">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">① 목표가 ‘하나’로 고정되지 않는다</b><br />
                실행력이 강하면 하고 싶은 게 많아져요. 그런데 목표가 여러 개면 실행도 여러 갈래로 흩어집니다.
                </div>
                <div>
                <b className="text-slate-900">② 결과물이 ‘문장’으로 남지 않는다</b><br />
                기록이 없으면 다음 모임에서 같은 얘기를 다시 하고, 결국 “열심히 했는데 제자리”가 됩니다.
                </div>
                <div>
                <b className="text-slate-900">③ 수렴(선택) 단계가 생략된다</b><br />
                “좋아! 하자!”는 빠른데, “그래서 뭘 안 하고 뭘 할지”가 빠집니다.
                </div>
            </div>
            </Card>

            <Card title="실행력을 성과로 바꾸는 스위치 3개">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">1) 이번 주 목표 1개 고정</b><br />
                즉흥은 유지해도 좋아요. 대신 <b className="text-slate-900">‘이번 주 목표는 하나’</b>만 고정하세요.
                목표가 하나면 실행이 흩어지지 않습니다.
                </div>

                <div>
                <b className="text-slate-900">2) 기록은 회의록이 아니라 ‘결론 3줄’</b><br />
                긴 문서 말고 아래만 남기면 됩니다:
                <div className="mt-2 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                    <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                    <li>✔ 오늘 결론 1줄</li>
                    <li>✔ 다음 액션 2개 (담당/기한 포함)</li>
                    <li>✔ 다음 모임에서 확인할 1개</li>
                    </ul>
                </div>
                </div>

                <div>
                <b className="text-slate-900">3) 10분마다 ‘점검 체크포인트’ 넣기</b><br />
                속도가 빠를수록 중간 점검이 고급입니다.
                “지금 목표랑 맞아?” 한 문장만 있어도 핸들 꺾임이 줄어요.
                </div>
            </div>
            </Card>

            <Card title="바로 써먹는 운영 템플릿 (실행형 모임 전용)">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">모임 시작 2분</div>
                <p className="mt-1">
                    <b className="text-slate-900">“오늘/이번 주 목표 1개”</b>를 문장으로 고정한다.
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">중간 10분마다</div>
                <p className="mt-1">
                    <b className="text-slate-900">“지금 이게 목표랑 연결돼?”</b>만 확인한다.
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">마감 3분</div>
                <p className="mt-1">
                    <b className="text-slate-900">결론 1줄 + 액션 2개</b>만 남기고 종료한다.
                </p>
                </div>
            </div>
            </Card>

            <Card title="30초 자가진단: 우리 모임은 ‘속도’가 아니라 ‘구조’가 있나?">
            <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                <li>☐ 목표가 1개로 고정된다</li>
                <li>☐ 모임이 끝나면 결론 문장이 남는다</li>
                <li>☐ 다음 액션에 담당/기한이 붙는다</li>
                <li>☐ 중간 점검(10분 체크)이 있다</li>
                <li>☐ 즉흥 아이디어는 “다음 후보”로 분리 저장된다</li>
                </ul>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                2개 이하라면, 실행력은 충분한데 <b className="text-slate-900">쌓이는 구조가 아직 없는 상태</b>일 가능성이 높아요.
            </p>
            </Card>

            <Card title="자주 묻는 질문 (FAQ)">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">Q. 실행형이 많으면 무조건 산만해지나요?</b>
                <p className="mt-1">
                    아니요. 실행형은 오히려 <b className="text-slate-900">목표 1개만 고정하면</b> 가장 빠르게 성과를 냅니다.
                    산만함은 실행형의 성격이 아니라 구조 부재에서 나와요.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 기록 담당을 두면 모임이 딱딱해져요.</b>
                <p className="mt-1">
                    그래서 회의록이 아니라 <b className="text-slate-900">결론 3줄</b>만 남기자고 하는 거예요.
                    1분이면 끝나고, 부담도 적습니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 즉흥 아이디어가 모임의 재미인데, 줄이면 재미가 죽지 않나요?</b>
                <p className="mt-1">
                    줄이는 게 아니라 <b className="text-slate-900">보관</b>하세요.
                    “다음 후보 리스트”로 분리해두면 재미도 살고, 목표도 지켜집니다.
                </p>
                </div>
            </div>
            </Card>

            <Card title="다음으로 보면 좋은 가이드">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                href="/guides/no-conclusion"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    왜 우리 모임은 자꾸 결론이 안 날까? (TJ 부족)
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    결론이 안 나는 건 ‘분위기’가 아니라 ‘수렴 역할’ 문제
                </p>
                </a>

                <a
                href="/guides/beyond-average"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    모임 평균 점수보다 중요한 것
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    평균보다 강한 변수: 최저점·역할·갈등 루틴
                </p>
                </a>
            </div>

            </Card>
        
        </>
        ),

  },

  {
    slug: "explode-safe",
    title: "폭발형 케미를 안전하게 쓰는 법",
    description:
      "텐션이 높은 조합은 잘만 쓰면 ‘기획 폭발’인데, 방치하면 ‘말투 폭발’이에요. 안전장치만 달면 됩니다.",
    keywords: ["폭발형", "갈등", "말투", "커뮤니케이션", "조율"],
    component: (
        <>
            <Card title="폭발형 케미를 안전하게 쓰는 법">
            <p className="text-sm leading-7 text-slate-700">
                ‘폭발형’은 나쁜 조합이라기보다, <b className="text-slate-900">서로 건드리는 버튼이 겹치기 쉬운 조합</b>이에요.
                잘만 다루면 기획도 빠르고 결과물도 강한데, 방치하면 “말투” 하나로 분위기가 갈라집니다.
            </p>

            <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">한 문장 핵심</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                폭발형은 감정으로 풀면 꼬이고, <b className="text-slate-900">룰(프로세스)로 풀면 가장 빨리 안정</b>됩니다.
                </p>
            </div>
            </Card>

            <Card title="폭발형이 생기는 이유: ‘말의 내용’이 아니라 ‘말의 구조’가 다름">
            <p className="text-sm leading-7 text-slate-700">
                폭발형은 보통 “내가 틀렸어?”가 아니라
                <b className="text-slate-900"> ‘지금 네가 어떤 기준으로 말하는지’</b>를 못 맞추면서 생겨요.
                같은 주제를 두고도 서로 다른 전제/속도/표현 방식으로 대화하니까
                상대는 “답답하다/차갑다/피곤하다”로 해석하기 쉽습니다.
            </p>

            <div className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                <div>✔ 전제가 다르면: 같은 말도 다른 의미로 들림</div>
                <div>✔ 속도가 다르면: 한쪽은 “왜 아직도?” 다른 쪽은 “왜 벌써?”</div>
                <div>✔ 표현이 다르면: 한쪽은 “팩트” 다른 쪽은 “공격”으로 받아들임</div>
            </div>
            </Card>

            <Card title="폭발형의 장점: 사실 ‘고성능 조합’일 때가 많아요">
            <p className="text-sm leading-7 text-slate-700">
                폭발형은 텐션이 높고 기준이 강해서, 합만 맞으면 <b className="text-slate-900">성과가 빠르고 뚜렷</b>합니다.
                특히 기획/의사결정/피드백이 필요한 상황에서 “밀도 있는 대화”가 가능해요.
            </p>

            <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                <li>✔ 서로 약점을 바로 찌른다 → 개선 속도가 빠름</li>
                <li>✔ 에너지가 높다 → 추진력이 생김</li>
                <li>✔ 기준이 분명하다 → 결과물이 날카로워짐</li>
            </ul>
            </Card>

            <Card title="폭발형이 ‘폭발’로 가는 4가지 트리거">
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-7 text-slate-700">
                <li>
                <b className="text-slate-900">전제 불일치</b> — 서로 다른 문제를 풀고 있는데 같은 문제라고 착각
                </li>
                <li>
                <b className="text-slate-900">용어 모호</b> — “빨리”, “대충”, “그냥” 같은 단어가 각자 다르게 해석됨
                </li>
                <li>
                <b className="text-slate-900">피드백 대상 혼동</b> — 결과물 평가가 사람 평가로 들리는 순간
                </li>
                <li>
                <b className="text-slate-900">마감/피곤 누적</b> — 에너지가 떨어진 날엔 평소 말투도 공격으로 들림
                </li>
            </ol>
            </Card>

            <Card title="안전장치 6가지 (이거만 해도 급발진 확 줄어요)">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">1) 전제 확인 한 문장</b><br />
                “지금 네 말은 A가 맞다는 가정이지?”  
                전제가 맞으면 절반은 해결됩니다.
                </div>

                <div>
                <b className="text-slate-900">2) 단계 선언</b><br />
                “지금은 아이디어 단계 / 지금은 결정 단계”  
                단계만 구분해도 말싸움이 줄어요.
                </div>

                <div>
                <b className="text-slate-900">3) 용어를 숫자/기준으로</b><br />
                “빨리” → “오늘 18시까지”, “대충” → “필수 3개만”
                </div>

                <div>
                <b className="text-slate-900">4) 피드백은 ‘사람’ 말고 ‘대상’</b><br />
                “너 왜 그래” 대신 “이 문장/이 일정/이 구조가 왜 문제인지”로 고정
                </div>

                <div>
                <b className="text-slate-900">5) 10분마다 수렴 체크</b><br />
                “결론/보류/다음 액션” 3갈래로 쪼개면 불필요한 에너지 소모가 줄어요.
                </div>

                <div>
                <b className="text-slate-900">6) 감정 온도계 한 번</b><br />
                “지금 말이 세게 들렸으면 미안, 의도는 결과물 얘기야.”  
                이 한 문장이 모임을 살립니다.
                </div>
            </div>
            </Card>

            <Card title="폭발형 모임 전용 운영 룰 (그대로 복붙해서 쓰기)">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">룰 1: 반박 전에 요약</div>
                <p className="mt-1">
                    “네 말 요약하면 A 맞지?” → “내 관점은 B야” 순서로만 말하기
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">룰 2: 기준을 먼저 공개</div>
                <p className="mt-1">
                    “나는 지금 <b className="text-slate-900">효율/리스크/사용자</b> 기준으로 말할게”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">룰 3: 결론 문장 1개로 마감</div>
                <p className="mt-1">
                    “오늘 결론: OO 한다 / 보류한다 / 다음에 OO 확인” 중 하나로 끝내기
                </p>
                </div>
            </div>
            </Card>

            <Card title="폭발을 막는 ‘금지어’ & ‘대체 문장’ (효과 진짜 큼)">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">금지어: “그게 말이 돼?”</div>
                <p className="mt-1">
                    대체: “그 접근의 전제가 뭐야? 전제부터 맞추자.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">금지어: “왜 그렇게 예민해?”</div>
                <p className="mt-1">
                    대체: “내 말이 세게 들렸을 수 있어. 의도는 공격이 아니라 확인이야.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">금지어: “그냥 해”</div>
                <p className="mt-1">
                    대체: “필수 3개만 먼저 하고, 나머진 다음 라운드에서 보자.”
                </p>
                </div>
            </div>
            </Card>

            <Card title="30초 체크리스트: 지금 우리 모임은 안전장치가 있나?">
            <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                <li>☐ 반박 전에 요약을 한다</li>
                <li>☐ 기준을 먼저 말한다</li>
                <li>☐ “빨리/대충” 같은 단어를 숫자로 바꾼다</li>
                <li>☐ 피드백은 사람 말고 결과물에만 한다</li>
                <li>☐ 10분마다 결론/보류/액션으로 수렴한다</li>
                </ul>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                2개 이하라면 폭발형이 “원래 그런 조합”이 아니라,
                <b className="text-slate-900">운영 장치가 아직 없는 상태</b>일 가능성이 큽니다.
            </p>
            </Card>

            <Card title="자주 묻는 질문 (FAQ)">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">Q. 폭발형이면 그냥 거리 두는 게 맞나요?</b>
                <p className="mt-1">
                    꼭 그렇진 않아요. 폭발형은 룰만 잡히면 <b className="text-slate-900">성과가 가장 빠르게 나는 조합</b>이기도 해요.
                    “사람을 바꾸기”보다 “대화 구조를 바꾸기”가 훨씬 쉽습니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 말투가 세진다는 건 누구 잘못인가요?</b>
                <p className="mt-1">
                    대부분 “누가 나빠서”가 아니라 “속도/전제/기준이 엇갈려서” 그래요.
                    폭발형은 특히 <b className="text-slate-900">전제 확인</b>이 가장 큰 해법입니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 룰을 만들면 딱딱해지지 않나요?</b>
                <p className="mt-1">
                    오히려 반대예요. 폭발형은 감정으로 풀면 딱딱해지고,
                    <b className="text-slate-900">룰로 풀면 마음이 편해져서</b> 대화가 부드러워집니다.
                </p>
                </div>
            </div>
            </Card>

            <Card title="다음으로 보면 좋은 가이드">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                href="/guides/cognitive-clash"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    MBTI 인지기능이 모임에서 충돌하는 순간
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    갈등 포인트 4종 + 대화 스킬
                </p>
                </a>

                <a
                href="/guides/no-conclusion"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    왜 우리 모임은 자꾸 결론이 안 날까? (TJ 부족)
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    수렴/결정 역할 공백을 메우는 방법
                </p>
                </a>
            </div>

            </Card>

        </>
        ),

  },

  {
    slug: "too-many-strategy",
    title: "전략형이 너무 많으면 벌어지는 일",
    description:
      "아이디어는 넘치는데 실행이 늦어지는 모임. 전략형 강점은 살리면서 속도를 올리는 방법.",
    keywords: ["전략형", "아이디어", "회의", "결정", "실행"],
    component: (
        <>
            <Card title="전략형이 너무 많으면 벌어지는 일">
            <p className="text-sm leading-7 text-slate-700">
                전략형(큰그림/가능성/구조 설계)에 강한 사람이 많으면
                모임이 “똑똑한데 느린” 상태가 되기 쉬워요.
                아이디어 품질은 높은데, <b className="text-slate-900">결정·실행 페이즈로 넘어가는 스위치</b>가 약해지는 거죠.
            </p>

            <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">한 문장 핵심</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                전략형 과다는 “의견이 많아서”가 아니라,
                <b className="text-slate-900"> 검토/최적화 페이즈가 끝나지 않아서</b> 느려집니다.
                </p>
            </div>
            </Card>

            <Card title="전략형 많은 모임의 장점부터 (이건 진짜 강점이에요)">
            <p className="text-sm leading-7 text-slate-700">
                전략형이 많으면 모임의 퀄리티 바닥이 높아져요.
                반례·리스크·구조가 빨리 나오고, “대충”으로 끝나는 걸 싫어해서 결과물이 좋아지는 편입니다.
            </p>

            <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                <li>✔ 허술한 계획이 초반에 걸러짐</li>
                <li>✔ 리스크를 미리 본다 (사고 방지)</li>
                <li>✔ 구조화가 빨라서 ‘설명’이 잘 된다</li>
                <li>✔ 더 나은 옵션이 자주 나온다</li>
            </ul>
            </Card>

            <Card title="그런데 이렇게 ‘고급 문제’가 같이 옵니다">
            <p className="text-sm leading-7 text-slate-700">
                문제는 능력이 아니라 <b className="text-slate-900">운영 구조</b>예요.
                전략형이 많으면 회의가 자연스럽게 “검토 모드”로 들어가고,
                검토가 길어질수록 실행은 늦어집니다.
            </p>

            <ol className="mt-4 list-decimal pl-5 space-y-2 text-sm leading-7 text-slate-700">
                <li><b className="text-slate-900">반례가 너무 빨리 나온다</b> → 시도 자체가 늦어짐</li>
                <li><b className="text-slate-900">최적해를 찾느라 결론이 밀린다</b> → “좀 더 보자”가 반복</li>
                <li><b className="text-slate-900">기준이 많다</b> → 모두를 만족시키려다 아무도 결정 못함</li>
                <li><b className="text-slate-900">대화가 ‘설계’에서 끝난다</b> → 실행 항목이 비어 있음</li>
                <li><b className="text-slate-900">피로가 쌓인다</b> → 회의 후 “뭔가 했는데 남는 게 없음”</li>
            </ol>
            </Card>

            <Card title="전략형 과다의 진짜 원인: ‘페이즈가 섞여서’ 느립니다">
            <p className="text-sm leading-7 text-slate-700">
                전략형 모임은 보통 이 3가지가 섞여서 동시에 벌어져요.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">탐색</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    아이디어를 넓히는 단계
                </p>
                </div>
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">수렴</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    기준으로 줄이고 고르는 단계
                </p>
                </div>
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">실행</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    작게라도 움직여서 검증하는 단계
                </p>
                </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                이 세 단계가 섞이면 “아이디어 내다 반례 들고, 반례 보다가 다시 아이디어 내고”가 반복돼요.
                그래서 해결은 사람 설득이 아니라 <b className="text-slate-900">단계 분리</b>입니다.
            </p>
            </Card>

            <Card title="바로 먹히는 처방: ‘10-10-10 페이즈 분리’">
            <p className="text-sm leading-7 text-slate-700">
                전략형이 많을수록 오히려 간단한 룰이 강합니다.
                아래 30분 템플릿을 그대로 쓰면 체감이 커요.
            </p>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">① 탐색 10분</div>
                <p className="mt-1">
                    “가능한 옵션을 늘리는 시간” — 반례/비판 금지, 어떤 아이디어든 OK
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">② 수렴 10분</div>
                <p className="mt-1">
                    “기준 1개로 줄이는 시간” — 예: 비용/속도/리스크/사용자 중 딱 1개
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">③ 실행 10분</div>
                <p className="mt-1">
                    “오늘 가능한 1개만” — 완성 말고 검증(초안/테스트/샘플)로 끝내기
                </p>
                </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                이 방식의 핵심은 “최적해”가 아니라
                <b className="text-slate-900">최소 실행으로 빨리 검증</b>하는 거예요.
            </p>
            </Card>

            <Card title="전략형 모임을 빠르게 만드는 ‘스위치 3개’">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">1) 기준을 ‘하나만’ 고정</b><br />
                전략형은 기준이 많을수록 끝이 없습니다. 오늘은 딱 하나만.
                </div>

                <div>
                <b className="text-slate-900">2) ‘결정문’ 강제</b><br />
                회의 끝에 “오늘 결론 한 문장”이 없으면, 사실 회의가 끝난 게 아니에요.
                </div>

                <div>
                <b className="text-slate-900">3) 실험 단위를 작게</b><br />
                “완성”을 목표로 잡으면 느려집니다. “검증”을 목표로 잡으면 빨라져요.
                </div>
            </div>
            </Card>

            <Card title="금지어 & 대체 문장 (전략형 모임에서 특히 중요)">
            <div className="space-y-4 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">금지어: “좀 더 생각해보자”</div>
                <p className="mt-1">대체: “결정 기준 1개만 정하고, A/B로 줄이자.”</p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">금지어: “그건 아닌데…”</div>
                <p className="mt-1">대체: “반례는 맞아. 대신 오늘은 ‘검증 가능한 1개’만 하자.”</p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">금지어: “최적해로 가자”</div>
                <p className="mt-1">대체: “이번 라운드는 ‘충분히 좋은 해’로 가고, 다음 라운드에서 고치자.”</p>
                </div>
            </div>
            </Card>

            <Card title="30초 체크리스트: 우리 모임이 ‘전략형 과다’ 상태인가?">
            <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                <li>☐ 회의에서 반례/리스크가 너무 빨리 나온다</li>
                <li>☐ 선택지가 줄지 않고 계속 늘어난다</li>
                <li>☐ 회의 후 “결론 한 문장”이 없다</li>
                <li>☐ 실행보다 ‘설명/설계’가 더 길다</li>
                <li>☐ 다음 액션이 사람에게 할당되지 않는다</li>
                </ul>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                3개 이상이라면, 사람 문제가 아니라
                <b className="text-slate-900">운영 단계(탐색/수렴/실행) 분리가 필요한 상태</b>일 확률이 높아요.
            </p>
            </Card>

            <Card title="자주 묻는 질문 (FAQ)">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">Q. 전략형이 많으면 무조건 느려지나요?</b>
                <p className="mt-1">
                    아니요. 페이즈만 분리하면 오히려 <b className="text-slate-900">퀄리티와 속도를 동시에</b> 가져갈 수 있어요.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 반례 제시가 많아서 분위기가 딱딱해요.</b>
                <p className="mt-1">
                    탐색 단계에서는 반례 금지(아이디어 확장), 수렴 단계에서만 반례 허용으로 룰을 나누면 체감이 큽니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 결국 누가 결정해야 하나요?</b>
                <p className="mt-1">
                    “사람”을 고정하기보다 “오늘의 결론 담당”을 라운드제로 돌리면 공정하고 빠릅니다.
                </p>
                </div>
            </div>
            </Card>

            <Card title="다음으로 보면 좋은 가이드">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                href="/guides/too-many-exec"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    실행형이 많으면 생기는 5가지 현상
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    속도는 빠른데 방향이 흔들릴 때
                </p>
                </a>

                <a
                href="/guides/no-conclusion"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    왜 우리 모임은 자꾸 결론이 안 날까? (TJ 부족)
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    결정 역할 공백을 메우는 처방
                </p>
                </a>
            </div>

            </Card>

        </>
        ),

  },

  {
    slug: "cognitive-clash",
    title: "MBTI 인지기능이 모임에서 충돌하는 순간",
    description:
      "갈등은 성격이 나빠서가 아니라, ‘정보를 보는 방식/결정 기준’이 달라서 생겨요. 충돌 포인트만 알면 해결이 쉽습니다.",
    keywords: ["인지기능", "충돌", "갈등", "대화", "MBTI"],
    component: (
        <>
            <Card title="MBTI 인지기능이 모임에서 충돌하는 순간">
            <p className="text-sm leading-7 text-slate-700">
                모임에서의 갈등은 보통 “성격이 안 맞아서”가 아니라,
                <b className="text-slate-900"> 정보를 처리하는 방식과 결정 기준(인지기능)이 달라서</b> 생깁니다.
                같은 회의를 해도 누군가는 “핵심이 뭐야?”를 찾고,
                누군가는 “근거가 부족한데?”를 먼저 느껴요.
            </p>

            <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">한 문장 핵심</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                충돌은 말의 내용보다 <b className="text-slate-900">말이 만들어지는 구조</b>에서 납니다.
                </p>
            </div>
            </Card>

            <Card title="인지기능 충돌은 ‘의견 차이’가 아니라 ‘입력값 차이’예요">
            <p className="text-sm leading-7 text-slate-700">
                같은 주제를 말해도 사람마다 머릿속에 들어오는 입력값이 달라요.
                그래서 누군가에겐 “당연한 결론”이, 다른 누군가에겐 “근거 없는 점프”처럼 들릴 수 있습니다.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">정보를 보는 방식</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    큰 그림/가능성(N) vs 사실/디테일(S)
                </p>
                </div>
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">결정 기준</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    논리/효율(T) vs 가치/관계(F)
                </p>
                </div>
            </div>
            </Card>

            <Card title="모임에서 자주 터지는 충돌 4종 (실제 체감 포인트)">
            <ol className="mt-2 list-decimal pl-5 space-y-3 text-sm leading-7 text-slate-700">
                <li>
                <b className="text-slate-900">큰그림 vs 디테일</b><br />
                “요지는?”(N) ↔ “근거는?”(S)
                <div className="mt-1 text-xs text-slate-500">
                    증상: 한쪽은 ‘장황하다’고 느끼고, 다른쪽은 ‘뇌피셜’이라고 느껴요.
                </div>
                </li>
                <li>
                <b className="text-slate-900">효율 vs 감정</b><br />
                “그래서 더 낫냐?”(T) ↔ “그 말이 상처야”(F)
                <div className="mt-1 text-xs text-slate-500">
                    증상: 한쪽은 ‘예민하다’고 느끼고, 다른쪽은 ‘차갑다’고 느껴요.
                </div>
                </li>
                <li>
                <b className="text-slate-900">결정형 vs 탐색형</b><br />
                “정하자”(J) ↔ “조금 더 보자”(P)
                <div className="mt-1 text-xs text-slate-500">
                    증상: 한쪽은 ‘질질 끈다’고 느끼고, 다른쪽은 ‘너무 성급하다’고 느껴요.
                </div>
                </li>
                <li>
                <b className="text-slate-900">속도 차이</b><br />
                바로 결론 내는 사람 ↔ 충분히 소화하는 사람
                <div className="mt-1 text-xs text-slate-500">
                    증상: 한쪽은 ‘답답하다’, 다른쪽은 ‘몰아붙인다’고 느껴요.
                </div>
                </li>
            </ol>
            </Card>

            <Card title="충돌을 줄이는 핵심 원리: ‘기준’과 ‘단계’를 먼저 공개하세요">
            <p className="text-sm leading-7 text-slate-700">
                인지기능 충돌은 서로를 설득해서 해결되지 않습니다.
                대신, 대화를 시작할 때 <b className="text-slate-900">내가 지금 무엇을 기준으로 말하는지</b>를 먼저 공개하면
                오해가 크게 줄어요.
            </p>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">① 기준 공개</div>
                <p className="mt-1">
                    “나는 지금 <b className="text-slate-900">리스크</b> 기준으로 말할게.”
                    / “나는 지금 <b className="text-slate-900">분위기</b> 기준으로 말할게.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">② 단계 선언</div>
                <p className="mt-1">
                    “지금은 아이디어 단계야(탐색).”
                    / “이제 A/B로 줄이는 단계야(수렴).”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">③ 요약 확인</div>
                <p className="mt-1">
                    “네 말 요약하면 A 맞지?” — 이 한 줄이 ‘급싸’를 줄여요.
                </p>
                </div>
            </div>
            </Card>

            <Card title="상황별 ‘대체 문장’ 템플릿 (바로 복붙해서 써요)">
            <div className="space-y-3 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    큰그림(N)이 디테일(S) 요구에 막힐 때
                </div>
                <p className="mt-1">
                    “좋아. 요지는 이거고, <b className="text-slate-900">근거 2개만</b> 붙여볼게.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    디테일(S)이 큰그림(N)에 답답함을 느낄 때
                </div>
                <p className="mt-1">
                    “디테일 들어가기 전에 <b className="text-slate-900">결론 1줄</b>만 먼저 잡자.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    효율(T) 말이 차갑게 들릴 수 있을 때
                </div>
                <p className="mt-1">
                    “사람이 아니라 결과물 기준으로 말할게. <b className="text-slate-900">지금 더 나은 선택</b>을 찾자는 뜻이야.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    감정(F) 말이 ‘비논리’로 들릴 수 있을 때
                </div>
                <p className="mt-1">
                    “논리 반박이 아니라, <b className="text-slate-900">운영 리스크(사람 피로도)</b> 얘기야.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    J vs P 충돌(정하자 vs 더 보자)
                </div>
                <p className="mt-1">
                    “<b className="text-slate-900">오늘은 A/B까지만</b> 줄이고, 최종 결정은 내일 하자.”
                </p>
                </div>
            </div>
            </Card>

            <Card title="모임 운영 팁: 인지기능 충돌은 ‘룰’로 해결하는 게 가장 빠릅니다">
            <p className="text-sm leading-7 text-slate-700">
                텐션이 올라갈수록 설득은 잘 안 먹혀요.
                대신 <b className="text-slate-900">프로세스(룰)</b>를 걸면, 감정 소모 없이 정리됩니다.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">룰 1: 결론문 강제</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    회의 끝에 “오늘 결론 한 문장 + 다음 액션 3개” 없으면 종료 X
                </p>
                </div>
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">룰 2: 단계 분리</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    탐색(아이디어) ↔ 수렴(A/B) ↔ 실행(검증) 섞지 않기
                </p>
                </div>
            </div>

            <div className="mt-3 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">룰 3: 전제 확인</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                “지금 전제는 A 맞지?”를 습관화하면, 싸움의 60%가 사라져요.
                </p>
            </div>
            </Card>

            <Card title="30초 체크리스트: 지금 우리 모임은 ‘인지기능 충돌’ 상태인가?">
            <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                <li>☐ 같은 얘기를 반복하는데 서로 “못 알아듣는다” 느낌이 든다</li>
                <li>☐ ‘논리’와 ‘기분’이 자꾸 섞여서 싸운다</li>
                <li>☐ 결정 속도 차이로 누군가는 답답하고 누군가는 압박을 느낀다</li>
                <li>☐ 반박이 많아지고 말투가 예민해진다</li>
                <li>☐ 회의 후 “남는 감정”이 있다</li>
                </ul>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                3개 이상이면 사람 탓하기 전에,
                <b className="text-slate-900">기준 공개 + 단계 선언</b>부터 적용해보는 게 제일 빠릅니다.
            </p>
            </Card>

            <Card title="자주 묻는 질문 (FAQ)">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">Q. 인지기능 충돌이면 결국 안 맞는 건가요?</b>
                <p className="mt-1">
                    아니요. 충돌은 “조율 포인트가 명확하다”는 뜻이기도 해요.
                    룰만 잡히면 오히려 <b className="text-slate-900">보완 관계</b>로 강해질 수 있습니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 한 명이 계속 차갑게 말하는데요?</b>
                <p className="mt-1">
                    “감정”으로 받기 전에 “기준”을 물어보세요.
                    “지금 효율 기준이야?”라고 확인하면, 공격으로 느껴질 확률이 줄어요.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 반대로 너무 돌려 말해서 답답해요.</b>
                <p className="mt-1">
                    결론형 문장을 요청하면 됩니다.
                    “좋아. 지금 말의 결론을 <b className="text-slate-900">한 문장</b>으로만 부탁해.”
                </p>
                </div>
            </div>
            </Card>

            <Card title="다음으로 보면 좋은 가이드">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                href="/guides/explode-safe"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    폭발형 케미를 안전하게 쓰는 법
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    텐션이 높은 조합을 룰로 안정화
                </p>
                </a>

                <a
                href="/guides/no-conclusion"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    왜 우리 모임은 자꾸 결론이 안 날까? (TJ 부족)
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    결정 역할 공백을 메우는 처방
                </p>
                </a>
            </div>

            </Card>
        </>
        ),

  },

  {
    slug: "no-vibe",
    title: "분위기 담당이 사라졌을 때",
    description:
      "갑자기 모임이 딱딱해지고 말이 줄어드는 순간이 있어요. ‘분위기 담당’은 사람이 아니라 기능입니다.",
    keywords: ["분위기", "소통", "공감", "침묵", "F"],
    component: (
        <>
            <Card title="분위기 담당이 사라졌을 때">
            <p className="text-sm leading-7 text-slate-700">
                모임이 갑자기 딱딱해지고 말이 줄어드는 순간이 있어요.
                보통 “사이가 나빠졌다”라고 생각하지만, 실제로는
                <b className="text-slate-900"> 모임 운영에서 ‘공감/완충/리액션’ 기능이 비어버린 상태</b>인 경우가 많습니다.
            </p>

            <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">한 문장 핵심</div>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                분위기는 “사람”이 아니라 <b className="text-slate-900">기능</b>이에요. 기능은 시스템으로 복구할 수 있습니다.
                </p>
            </div>
            </Card>

            <Card title="분위기가 사라졌다는 신호 6가지 (모임이 ‘일’처럼 느껴질 때)">
            <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-700">
                <li>✔ 말할 땐 많은데, 끝나고 찝찝함이 남는다</li>
                <li>✔ 반박이 ‘내용’이 아니라 ‘태도/말투’로 들리기 시작한다</li>
                <li>✔ 농담이 사라지고 대화가 바로 결론/지적 쪽으로만 간다</li>
                <li>✔ 누군가 말하면 다른 사람들이 “정답 채점” 모드로 반응한다</li>
                <li>✔ 조용한 사람이 늘어난다 (에너지 아끼기 모드)</li>
                <li>✔ 회의/대화 후 “내가 굳이…” 느낌이 커진다</li>
            </ul>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                이건 대개 성격 문제가 아니라,
                <b className="text-slate-900"> 리액션·완충·정서적 안전감</b>이 약해졌다는 뜻이에요.
            </p>
            </Card>

            <Card title="왜 이런 일이 생길까요? (인지기능 관점으로 보면 단순해져요)">
            <p className="text-sm leading-7 text-slate-700">
                모임은 ‘결정’만으로 굴러가지 않습니다.
                결정은 빨라도, 그 과정에서 <b className="text-slate-900">사람이 소모</b>되면 오래 못 가요.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">T 성향이 강할 때</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    “팩트/효율”이 빠른 대신,
                    표현이 짧아져서 <b className="text-slate-900">정서적 완충</b>이 빠질 수 있어요.
                </p>
                </div>
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">J 성향이 강할 때</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    결론이 빨라지는 대신,
                    “의견 말하는 과정”이 줄어서 <b className="text-slate-900">참여감</b>이 떨어질 수 있어요.
                </p>
                </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                요약하면, 분위기 담당이 없으면 모임이 “정답 찾기 게임”처럼 굴러가고,
                그때부터 말이 줄어드는 사람이 생깁니다.
            </p>
            </Card>

            <Card title="분위기 담당이 없어도 모임이 고급스럽게 굴러가는 ‘복구 스위치 4개’">
            <p className="text-sm leading-7 text-slate-700">
                분위기를 살리는 방법은 “더 웃겨보기”가 아니에요.
                <b className="text-slate-900"> 운영 규칙을 아주 조금만 바꾸면</b> 자동으로 살아납니다.
            </p>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">① 1문장 체크인 (시작 30초)</div>
                <p className="mt-1">
                    “오늘 컨디션 한 단어”만 공유해요. (예: “피곤”, “여유”, “예민”)
                    <br />
                    <span className="text-xs text-slate-500">
                    이게 정서적 안전감을 확 올립니다.
                    </span>
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">② 반박 전 ‘좋은 점 1개’ 규칙</div>
                <p className="mt-1">
                    “근데…” 하기 전에 “좋은 점 하나”를 먼저 말하기.
                    <br />
                    <span className="text-xs text-slate-500">
                    설득력이 떨어지는 게 아니라, 오히려 반박이 더 잘 먹힙니다.
                    </span>
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">③ 피드백 대상을 ‘사람’에서 ‘문장’으로</div>
                <p className="mt-1">
                    “너는 왜…” 대신 “이 문장/이 일정/이 조건”을 기준으로 말하기.
                    <br />
                    <span className="text-xs text-slate-500">
                    분위기 깨지는 싸움의 80%가 이걸로 예방됩니다.
                    </span>
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-900">④ 마감은 ‘결론 1줄 + 다음 액션 3개’</div>
                <p className="mt-1">
                    회의가 길어질수록 피로가 쌓여서 분위기가 죽어요.
                    딱 3줄로 마감하면 다음 만남이 편해집니다.
                </p>
                </div>
            </div>
            </Card>

            <Card title="상황별 ‘대체 문장’ (말투 때문에 분위기 깨질 때 바로 쓰는 문장)">
            <div className="space-y-3 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    너무 직설적으로 들릴까 봐 걱정될 때
                </div>
                <p className="mt-1">
                    “사람 얘기가 아니라 <b className="text-slate-900">결과물 기준</b>으로 말해볼게.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    상대가 예민하게 반응할 때
                </div>
                <p className="mt-1">
                    “내 의도는 공격이 아니라 <b className="text-slate-900">리스크 줄이기</b>야. 네 말 요약하면 A 맞지?”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    침묵이 길어질 때 (참여감 떨어질 때)
                </div>
                <p className="mt-1">
                    “각자 <b className="text-slate-900">한 문장</b>만 말해볼래? 찬성/반대 말고 ‘우려 1개’만.”
                </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-xs font-extrabold text-slate-800">
                    분위기 살리려다 억지 유머가 될 것 같을 때
                </div>
                <p className="mt-1">
                    유머 대신 “좋은 점 1개”가 더 고급입니다. <b className="text-slate-900">진짜로</b>요.
                </p>
                </div>
            </div>
            </Card>

            <Card title="30초 체크리스트: 지금 우리 모임은 ‘분위기 기능 공백’인가?">
            <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
                <li>☐ 의견은 있는데 말하기가 귀찮아졌다</li>
                <li>☐ 회의가 끝나면 감정이 남는다</li>
                <li>☐ 대화가 “맞고 틀림”으로만 굴러간다</li>
                <li>☐ 누군가의 말투가 계속 거슬린다</li>
                <li>☐ 농담이 사라졌다</li>
                </ul>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
                3개 이상이면, 분위기 담당을 찾기보다
                <b className="text-slate-900"> ‘체크인 + 좋은 점 1개 + 결과물 피드백’</b> 룰을 먼저 넣는 게 빠릅니다.
            </p>
            </Card>

            <Card title="자주 묻는 질문 (FAQ)">
            <div className="space-y-5 text-sm leading-7 text-slate-700">
                <div>
                <b className="text-slate-900">Q. 분위기 담당은 꼭 F 유형이 해야 하나요?</b>
                <p className="mt-1">
                    아니요. 분위기 담당은 유형이 아니라 <b className="text-slate-900">기능</b>이에요.
                    룰로 만들면 누가 해도 됩니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 분위기 살리려고 하면 가볍게 보일까 봐 싫어요.</b>
                <p className="mt-1">
                    분위기는 가벼움이 아니라 <b className="text-slate-900">심리적 안전감</b>이에요.
                    체크인/요약/좋은 점 한 줄은 오히려 더 프로페셔널합니다.
                </p>
                </div>

                <div>
                <b className="text-slate-900">Q. 말이 줄어든 사람을 어떻게 다시 끌어오죠?</b>
                <p className="mt-1">
                    “의견 줘” 대신, 질문을 바꾸세요.
                    “찬반 말고 <b className="text-slate-900">우려 1개</b>만”처럼 부담을 낮추면 다시 말이 나옵니다.
                </p>
                </div>
            </div>
            </Card>

            <Card title="다음으로 보면 좋은 가이드">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                href="/guides/cognitive-clash"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    MBTI 인지기능이 모임에서 충돌하는 순간
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    오해가 생기는 구조를 먼저 이해하기
                </p>
                </a>

                <a
                href="/guides/beyond-average"
                className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
                >
                <div className="text-xs font-extrabold text-slate-900">
                    모임 평균 점수보다 중요한 것
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                    최저점 관리 + 역할 + 룰이 핵심
                </p>
                </a>
            </div>
            </Card>
        </>
        ),

  },

  {
    slug: "beyond-average",
    title: "모임 평균 점수보다 중요한 것",
    description:
      "평균이 높아도 힘든 모임이 있고, 평균이 낮아도 잘 굴러가는 모임이 있어요. 진짜 변수는 따로 있습니다.",
    keywords: ["평균", "팀워크", "리더", "역할", "규칙"],
    component: (
  <>
    <Card title="모임 평균 점수보다 중요한 것">
      <p className="text-sm leading-7 text-slate-700">
        평균 점수가 높으면 “편한 날”이 많아지는 건 맞아요.
        그런데 모임이 오래 굴러가느냐는 점수보다
        <b className="text-slate-900"> 운영 구조(역할·룰·결정 방식)</b>에 더 크게 좌우됩니다.
      </p>

      <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
        <div className="text-xs font-extrabold text-slate-800">한 문장 핵심</div>
        <p className="mt-1 text-sm leading-7 text-slate-700">
          평균은 참고고, 승부는 <b className="text-slate-900">최저점 관리 + 결정 구조 + 갈등 수습 루틴</b>입니다.
        </p>
      </div>
    </Card>

    <Card title="평균 점수의 함정: ‘좋은 날’과 ‘좋은 모임’은 다를 수 있어요">
      <p className="text-sm leading-7 text-slate-700">
        평균이 높아도 힘든 모임이 있고, 평균이 낮아도 잘 굴러가는 모임이 있어요.
        이유는 간단해요. 모임 운영에서 체감 피로도는
        <b className="text-slate-900"> ‘몇 번이냐’보다 ‘얼마나 크게 한 번 터지냐’</b>에 더 민감합니다.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">평균이 높은데 힘든 모임</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            대부분은 괜찮은데, <b className="text-slate-900">최악 1~2조합</b>이 자주 부딪혀서 분위기를 깨는 구조.
          </p>
        </div>
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">평균이 낮은데 잘 굴러가는 모임</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            조율이 필요한 조합이 있어도, <b className="text-slate-900">룰/역할/수습 루틴</b>이 있어서 큰 사고가 안 나는 구조.
          </p>
        </div>
      </div>
    </Card>

    <Card title="진짜 중요한 지표 1: 최저점(바닥 점수) 조합이 ‘구조적으로’ 자주 붙는가">
      <p className="text-sm leading-7 text-slate-700">
        모임을 힘들게 만드는 건 보통 “낮은 점수” 그 자체가 아니라,
        <b className="text-slate-900">낮은 점수 조합이 중요한 순간마다 마주치는 구조</b>예요.
      </p>

      <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
        <div className="text-xs font-extrabold text-slate-900">예시</div>
        <p className="mt-1 text-sm leading-7 text-slate-700">
          “결정해야 하는 타이밍”마다 항상 같은 두 사람이 붙는다 → 평균이 높아도 모임 체감은 낮아집니다.
        </p>
      </div>

      <div className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
        <div>✔ 최악 조합이 ‘결정/돈/일정’ 같은 민감 주제를 자주 다루나요?</div>
        <div>✔ 최악 조합이 ‘발언권’이 큰 위치에 있나요?</div>
        <div>✔ 충돌이 나면 수습하는 사람이 있나요?</div>
      </div>
    </Card>

    <Card title="진짜 중요한 지표 2: 결정 구조가 있는가 (결론이 안 나는 모임의 핵심)">
      <p className="text-sm leading-7 text-slate-700">
        평균이 높아도 모임이 지치는 대표 이유는
        <b className="text-slate-900"> ‘결정 방식이 정해져 있지 않아서’</b>예요.
        사람 성향 문제가 아니라, 프로세스 문제입니다.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">결정 구조가 없을 때</div>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-700">
            <li>• 옵션은 늘고, 선택은 안 됨</li>
            <li>• 회의는 길고, 액션은 없음</li>
            <li>• “다음에 다시”가 쌓임</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">결정 구조가 있을 때</div>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-700">
            <li>• 기준이 먼저 정해짐</li>
            <li>• A/B로 좁혀짐</li>
            <li>• “결론 1줄 + 액션 3개”로 마감</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
        <div className="text-xs font-extrabold text-slate-900">바로 적용되는 룰</div>
        <p className="mt-1 text-sm leading-7 text-slate-700">
          “기준 1줄 → A/B로 축소 → 결론 1줄 + 액션 3개”
          이 3단계만 있어도 평균 점수 체감이 확 올라가요.
        </p>
      </div>
    </Card>

    <Card title="진짜 중요한 지표 3: 갈등 해결 루틴이 있는가 (싸움이 아니라 ‘수습’이 핵심)">
      <p className="text-sm leading-7 text-slate-700">
        갈등은 0으로 만들 수 없어요.
        대신 <b className="text-slate-900">갈등이 길어지는 걸 막는 루틴</b>은 만들 수 있습니다.
        평균이 높은 모임이 무너지는 건 보통 “갈등” 때문이 아니라
        <b className="text-slate-900">갈등을 방치하는 습관</b> 때문이에요.
      </p>

      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">① 전제 맞추기</div>
          <p className="mt-1">
            “네 말은 A가 맞다는 가정이지?” — 전제가 다르면 대화가 평행선입니다.
          </p>
        </div>
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">② 피드백 대상 바꾸기</div>
          <p className="mt-1">
            사람 말고 결과물로: “너 왜 그래” → “이 문장/일정/조건”
          </p>
        </div>
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">③ 3갈래 마감</div>
          <p className="mt-1">
            “결론 / 보류 / 다음 액션” — 끝을 정하면 감정이 덜 남습니다.
          </p>
        </div>
      </div>
    </Card>

    <Card title="모임 운영을 ‘고급 팀’으로 만드는 3가지 습관">
      <div className="space-y-3 text-sm leading-7 text-slate-700">
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">① 역할을 사람에게 고정하지 않기</div>
          <p className="mt-1">
            “정리 담당/기록 담당/중재 담당”은 사람 고정이 아니라
            <b className="text-slate-900"> 라운드제로 돌리면</b> 피로가 줄어요.
          </p>
        </div>

        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">② 최저점 조합을 ‘구조적으로’ 떨어뜨리기</div>
          <p className="mt-1">
            최악 조합이 같은 주제를 계속 맡지 않게 분산하거나,
            중재/정리 역할을 끼워서 마찰을 줄입니다.
          </p>
        </div>

        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-900">③ 회의는 짧게, 마감은 명확하게</div>
          <p className="mt-1">
            “결론 1줄 + 액션 3개”만 지켜도 다음 모임 분위기가 달라집니다.
          </p>
        </div>
      </div>
    </Card>

    <Card title="30초 체크리스트: 우리 모임은 평균 말고 무엇을 먼저 봐야 할까?">
      <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
        <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
          <li>☐ 최악 조합이 중요한 결정에 자주 등장한다</li>
          <li>☐ 결론이 “사람”에 달려 있고, 구조가 없다</li>
          <li>☐ 갈등이 나면 수습 방식이 정해져 있지 않다</li>
          <li>☐ 회의 후 “감정”이 남는 날이 잦다</li>
          <li>☐ 기록/정리/중재 기능이 자주 비어 있다</li>
        </ul>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">
        2개 이상이면 평균 점수보다 먼저
        <b className="text-slate-900"> 역할 + 결정 구조 + 수습 루틴</b>을 세팅하는 게 효과가 큽니다.
      </p>
    </Card>

    <Card title="자주 묻는 질문 (FAQ)">
      <div className="space-y-5 text-sm leading-7 text-slate-700">
        <div>
          <b className="text-slate-900">Q. 평균이 낮으면 모임이 무조건 힘든가요?</b>
          <p className="mt-1">
            아니요. 평균이 낮아도 <b className="text-slate-900">룰/역할/수습</b>이 있으면 훨씬 편해질 수 있어요.
          </p>
        </div>

        <div>
          <b className="text-slate-900">Q. 평균이 높은데도 자꾸 싸워요.</b>
          <p className="mt-1">
            보통은 <b className="text-slate-900">최저점 조합이 구조적으로 자주 붙거나</b>,
            결정/피드백 방식이 사람 중심이라 갈등이 커지는 경우가 많아요.
          </p>
        </div>

        <div>
          <b className="text-slate-900">Q. 그럼 점수는 의미가 없나요?</b>
          <p className="mt-1">
            점수는 “날씨”처럼 참고할 가치가 있어요.
            다만 모임을 굴리는 건 “기후” — 즉 <b className="text-slate-900">운영 구조</b>가 더 중요합니다.
          </p>
        </div>
      </div>
    </Card>

    <Card title="다음으로 보면 좋은 가이드">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="/guides/no-conclusion"
          className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
        >
          <div className="text-xs font-extrabold text-slate-900">
            왜 우리 모임은 자꾸 결론이 안 날까? (TJ 부족)
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            결정 구조를 만드는 가장 빠른 방법
          </p>
        </a>

        <a
          href="/guides/cognitive-clash"
          className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80"
        >
          <div className="text-xs font-extrabold text-slate-900">
            MBTI 인지기능이 모임에서 충돌하는 순간
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            오해가 생기는 구조를 먼저 이해하기
          </p>
        </a>
      </div>
    </Card>
  </>
),

  },
];

const norm = (s: string) => decodeURIComponent(s).trim().toLowerCase();

export function getGuide(slug: string) {
  const key = norm(slug);
  return GUIDES.find((g) => norm(g.slug) === key) ?? null;
}
