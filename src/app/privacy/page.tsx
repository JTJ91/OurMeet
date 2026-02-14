import type { Metadata } from "next";
import BackNavButton from "@/app/components/BackNavButton";
import { alternatesForPath } from "@/i18n/metadata";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 모임랭크",
  description:
    "모임랭크(이하 '서비스')의 개인정보 처리에 관한 기준과 이용자의 권리를 안내합니다.",
  alternates: alternatesForPath("/privacy"),
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mbti-shell pb-16 pt-10">
        {/* Top left back */}
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <BackNavButton
            label="뒤로가기"
            icon="←"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          />
        </div>

        {/* 헤더 */}
        <header className="mbti-card-frame rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            개인정보처리방침
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            모임랭크(이하 “서비스”)는 이용자의 개인정보를 소중히 다루며,
            관련 법령을 준수합니다. 이 방침은 서비스 이용 과정에서 어떤 정보가
            수집·이용되는지, 그리고 이용자가 어떤 권리를 가지는지 안내합니다.
          </p>

          <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
            <p className="text-xs leading-6 text-slate-600">
              <b className="text-slate-900">시행일:</b> 2026-01-01
              <br />
              <b className="text-slate-900">문의:</b>{" "}
              <span className="font-semibold text-[#1E88E5]">
                taejuwork@gmail.com
              </span>
            </p>
          </div>
        </header>

        <section className="mt-8 space-y-6">
          <Card title="1. 수집하는 개인정보 항목">
            <p className="text-sm leading-7 text-slate-700">
              서비스는 기능 제공을 위해 최소한의 정보를 수집합니다.
            </p>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div>
                ✔ <b>필수(서비스 제공)</b>: 닉네임, MBTI, 모임 참여
                정보(초대 링크/그룹 ID 등 서비스 이용에 필요한 식별값)
              </div>
              <div>
                ✔ <b>자동 수집(로그)</b>: 접속 기록, IP 주소, 브라우저/기기 정보,
                쿠키, 방문/이용 기록(오류 기록 포함)
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
              <b className="text-slate-900">주의:</b> 서비스는 주민등록번호,
              민감정보(건강/정치/종교 등) 등 불필요한 정보는 수집하지 않습니다.
              이용자도 입력하지 않도록 유의해주세요.
            </p>
          </Card>

          <Card title="2. 개인정보 수집 및 이용 목적">
            <ul className="space-y-3 text-sm leading-7 text-slate-700">
              <li>• 모임 생성/참여, 관계도·케미 리포트 등 핵심 기능 제공</li>
              <li>• 이용자 식별, 부정 이용 방지, 서비스 안정성 확보</li>
              <li>• 고객 문의 대응 및 공지 전달(문의자가 연락처를 제공한 경우)</li>
              <li>• 서비스 품질 개선, 통계 분석(익명/가명 처리 또는 집계 형태)</li>
              <li>• 광고 노출 및 성과 측정(향후 애드센스/파트너스 등 적용 시)</li>
            </ul>
          </Card>

          <Card title="3. 보유 및 이용 기간">
            <p className="text-sm leading-7 text-slate-700">
              개인정보는 원칙적으로 <b>목적 달성 시 지체 없이 파기</b>합니다.
              단, 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관할 수 있습니다.
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>✔ 모임/회원 데이터: 서비스 제공 기간 또는 이용자 삭제 요청 시까지</div>
              <div>✔ 접속 로그/오류 기록: 보안/안정성 확보를 위해 일정 기간 보관 후 파기</div>
            </div>
          </Card>

          <Card title="4. 개인정보의 제3자 제공">
            <p className="text-sm leading-7 text-slate-700">
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 법령에 근거가 있거나 이용자가 사전에 동의한 경우에 한하여 제공할 수 있습니다.
            </p>

            <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
              <p className="text-sm leading-7 text-slate-700">
                <b>광고 파트너 관련:</b> 향후 Google AdSense, 쿠팡 파트너스 등
                외부 광고/제휴 프로그램을 적용할 수 있으며, 이 경우 쿠키/광고 식별자 등을
                통해 <b>광고 노출 및 성과 측정</b>이 이루어질 수 있습니다.
              </p>
            </div>
          </Card>

          <Card title="5. 개인정보 처리 위탁">
            <p className="text-sm leading-7 text-slate-700">
              서비스는 안정적인 운영을 위해 일부 업무를 외부 업체에 위탁할 수 있습니다.
              위탁 시 개인정보 보호를 위한 계약 및 관리·감독을 수행합니다.
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>• (예) 호스팅/인프라: Vercel, Cloudflare, DB 제공업체 등</div>
              <div>• (예) 분석: Google Analytics 등(도입 시)</div>
              <div>• (예) 광고: Google AdSense, 쿠팡 파트너스 등(도입 시)</div>
            </div>
          </Card>

          <Card title="6. 쿠키(Cookie) 및 온라인 식별자">
            <p className="text-sm leading-7 text-slate-700">
              서비스는 이용자에게 더 나은 경험을 제공하고, 통계·광고 성과 측정을 위해
              쿠키 및 유사 기술을 사용할 수 있습니다.
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>✔ 필수 쿠키: 로그인/세션 유지, 보안 등</div>
              <div>✔ 분석 쿠키: 방문/이용 통계, 오류 분석</div>
              <div>✔ 광고 쿠키: 맞춤형 광고 제공 및 성과 측정(도입 시)</div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.
              단, 일부 기능이 제한될 수 있습니다.
            </p>
          </Card>

          <Card title="7. 이용자의 권리와 행사 방법">
            <p className="text-sm leading-7 text-slate-700">
              이용자는 언제든지 본인의 개인정보에 대해 열람, 정정, 삭제,
              처리 정지 등을 요청할 수 있습니다.
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>• 서비스 내 기능이 제공되는 경우: 설정/관리 메뉴에서 직접 처리</div>
              <div>• 그 외: 운영자 문의 채널로 요청</div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
              요청 시 본인 확인 절차가 진행될 수 있으며, 법령상 보관 의무가 있는 정보는
              즉시 삭제가 제한될 수 있습니다.
            </p>
          </Card>

          <Card title="8. 개인정보의 파기 절차 및 방법">
            <p className="text-sm leading-7 text-slate-700">
              개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우,
              지체 없이 파기합니다.
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>• 전자적 파일: 복구 불가능한 방법으로 영구 삭제</div>
              <div>• 출력물: 분쇄 또는 소각</div>
            </div>
          </Card>

          <Card title="9. 개인정보 보호를 위한 조치">
            <ul className="space-y-3 text-sm leading-7 text-slate-700">
              <li>• 접근 권한 최소화 및 권한 관리</li>
              <li>• 보안 업데이트 및 취약점 점검</li>
              <li>• 암호화(가능한 경우) 및 안전한 통신(HTTPS) 적용</li>
              <li>• 이상 징후 모니터링 및 로그 관리</li>
            </ul>
          </Card>

          <Card title="10. 아동의 개인정보">
            <p className="text-sm leading-7 text-slate-700">
              서비스는 아동의 개인정보를 별도로 수집하지 않으며,
              법정대리인 동의가 필요한 경우 관련 법령을 준수합니다.
            </p>
          </Card>

          <Card title="11. 방침의 변경">
            <p className="text-sm leading-7 text-slate-700">
              개인정보처리방침의 내용이 변경될 경우 서비스 내 공지 등을 통해
              사전 안내합니다. 중요한 변경 사항은 추가 동의 절차가 필요할 수 있습니다.
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
    <div className="mbti-card-frame rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
