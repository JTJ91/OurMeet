"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

type Props = {
  locale: string;
};

export default function HomePageIntlClient({ locale }: Props) {
  const t = useTranslations("landing");
  const base = locale === "ko" ? "" : `/${locale}`;
  const isKo = locale === "ko";

  if (isKo) {
    return (
      <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
        <div className="mx-auto w-full max-w-[980px] px-6 py-12 sm:py-16">
          <section className="text-center">
            <p className="text-sm font-extrabold tracking-wide text-[#1E88E5]">
              {t("brandPrefix")}
              <span className="ml-1">{t("brandAccent")}</span>
            </p>
            <h1 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-4xl">
              MBTI 인지기능 기반 모임 궁합 분석 서비스
            </h1>
            <p className="mx-auto mt-4 max-w-[760px] text-sm leading-7 text-slate-600 sm:text-base">
              모임 안에서 어떤 조합이 잘 맞고, 어디서 충돌이 생기는지 흐름으로 확인할 수 있도록 설계된 관계 분석
              서비스입니다.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`${base}/mbti`}
                target="_self"
                className="inline-flex items-center justify-center rounded-full bg-[#1E88E5] px-6 py-3 text-sm font-extrabold text-white transition hover:opacity-95"
              >
                모임 시작하기
              </Link>
              <Link
                href={`${base}/mbti-test`}
                target="_self"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50"
              >
                내 MBTI 검사하기
              </Link>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-200/70 bg-white/85 p-6 text-left shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-black/5 sm:p-8">
            <div className="space-y-5 text-[15px] leading-8 text-slate-700">
              <h2 className="text-xl font-black text-slate-900">MBTI 인지기능 기반 모임 궁합 분석 서비스</h2>

              <p>
                모임랭킹은 <span className="font-extrabold text-[#1E88E5]">단순한 MBTI 궁합 점수 계산기</span>가
                아닙니다. 각자의 성향을 외향(E)·내향(I), 감각(S)·직관(N), 사고(T)·감정(F), 판단(J)·인식(P) 네 가지
                축으로만 나누는 것이 아니라, <span className="font-bold text-slate-900">인지기능 흐름</span>과{" "}
                <span className="font-bold text-slate-900">대화 방향</span>,{" "}
                <span className="font-bold text-slate-900">의사결정 속도</span>,{" "}
                <span className="font-bold text-slate-900">역할 균형</span>을 함께 분석하여 실제 모임에서{" "}
                <span className="font-extrabold text-[#1E88E5]">체감할 수 있는 케미</span>를 시각적으로 보여주는
                서비스입니다.
              </p>

              <p>
                친구 모임, 회사 팀 프로젝트, 동호회, 게임 파티, 스터디 그룹 등{" "}
                <span className="font-extrabold text-[#1E88E5]">다양한 모임 유형</span>에 따라 성향 조합은 다르게
                작용합니다. 누군가는 분위기를 이끌고, 누군가는 방향을 정리하며, 또 다른 누군가는 갈등을 완충합니다.
                모임랭킹은 이러한 <span className="font-bold text-slate-900">상호작용 패턴</span>을{" "}
                <span className="font-bold text-slate-900">데이터 기반</span>으로 정리하여, 우리 모임 안에서 누가
                누구와 잘 맞는지 <span className="font-extrabold text-[#1E88E5]">흐름</span>으로 확인할 수 있도록
                돕습니다.
              </p>

              <p>
                검사 결과는 단순한 재미 요소를 넘어, <span className="font-bold text-slate-900">대화 충돌</span>이 왜
                발생하는지, <span className="font-bold text-slate-900">의견 결정</span>이 왜 오래 걸리는지, 특정 조합에서{" "}
                <span className="font-bold text-slate-900">에너지</span>가 왜 상승하거나 소모되는지를 이해하는 데 활용할
                수 있습니다. MBTI 인지기능을 기반으로 한 <span className="font-extrabold text-[#1E88E5]">관계 분석</span>
                을 통해 <span className="font-bold text-slate-900">팀워크</span>를 개선하고,{" "}
                <span className="font-bold text-slate-900">모임 분위기</span>를 건강하게 조정하는 것이 이 서비스의
                목적입니다.
              </p>

              <p>
                <span className="font-extrabold text-[#1E88E5]">로그인 없이</span> 간편하게 참여할 수 있으며,{" "}
                <span className="font-bold text-slate-900">링크 하나</span>로 모임을 생성하고 구성원들이 각자의 MBTI를
                입력하면 <span className="font-bold text-slate-900">자동으로 분석 결과</span>가 생성됩니다.{" "}
                <span className="font-extrabold text-[#1E88E5]">복잡한 가입 절차 없이</span> 누구나 사용할 수 있도록
                설계되었습니다.
              </p>
            </div>

            <h3 className="mt-7 text-base font-black text-slate-900">이런 분들에게 추천합니다</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-slate-700">
              <li>
                모임 안에서 <span className="font-extrabold text-[#1E88E5]">케미</span>가 궁금한 분
              </li>
              <li>
                팀 프로젝트에서 <span className="font-bold text-slate-900">역할 균형</span>을 알고 싶은 분
              </li>
              <li>
                MBTI 인지기능 기반 <span className="font-extrabold text-[#1E88E5]">관계 분석</span>을 경험해보고 싶은 분
              </li>
              <li>
                친구, 연인, 동료와의 <span className="font-bold text-slate-900">대화 패턴</span>을 이해하고 싶은 분
              </li>
            </ul>
          </section>

          <p className="mt-10 text-center text-[12px] font-medium text-slate-400">{t("footer")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mbti-shell flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <div className="text-4xl font-black tracking-tight sm:text-5xl">
          <span>
            {t("brandPrefix")}
            <span className="text-[#1E88E5]">{t("brandAccent")}</span>
          </span>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="h-[2px] w-12 rounded-full bg-[#1E88E5]/40" />
        </div>

        <h1 className="mt-8 max-w-[620px] text-xl font-extrabold leading-relaxed text-slate-800 sm:text-2xl">
          {t("headlinePrefix")} <span className="text-[#1E88E5]">{t("headlineAccent")}</span>
          <br className="hidden sm:block" />
          {t("headlineSuffix")}
        </h1>

        <p className="mt-6 max-w-[640px] text-[15px] leading-8 text-slate-600">
          {t("descriptionLead")} <span className="font-semibold text-slate-900">{t("descriptionDirection")}</span>,{" "}
          <span className="font-semibold text-slate-900">{t("descriptionSpeed")}</span>,{" "}
          <span className="font-semibold text-slate-900">{t("descriptionBalance")}</span> {t("descriptionBridge")}
          <br className="hidden sm:block" />
          {t("descriptionTailLead")} <span className="font-semibold text-[#1E88E5]">{t("descriptionRank")}</span>{" "}
          {t("descriptionTailAnd")} <span className="font-semibold text-[#1E88E5]">{t("descriptionGraph")}</span>
          {t("descriptionTailEnd")}
        </p>

        <p className="mt-6 max-w-[600px] text-[14px] leading-7 text-slate-500">{t("description2")}</p>

        <div className="mt-12 flex w-full max-w-[500px] flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href={`${base}/mbti`}
            target="_self"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#1E88E5] px-6 py-3 text-sm font-extrabold text-white transition hover:opacity-95"
          >
            {t("startMbti")}
          </Link>
        </div>

        <div className="mt-10 text-[12px] font-medium text-slate-400">{t("footer")}</div>
      </div>
    </main>
  );
}
