import React from "react";
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  HeartHandshake, 
  ChevronLeft,
  Mail,
  ExternalLink
} from "lucide-react";
import { EDITORIAL_AUTHORS, EDITORIAL_STANDARDS } from "../data/editorialTeam";

interface LegalPagesProps {
  activeTab: "about" | "privacy" | "terms" | "disclaimer";
  onTabChange: (tab: "about" | "privacy" | "terms" | "disclaimer") => void;
  onBack?: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({
  activeTab,
  onTabChange,
  onBack
}) => {
  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      {/* 상단 헤더 & 뒤로가기 */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-slate-700 hover:text-blue-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>메인 홈으로 돌아가기</span>
        </button>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <span>하우징허브</span>
          <span>&gt;</span>
          <span className="text-blue-700 font-bold">
            {activeTab === "about" && "서비스 소개"}
            {activeTab === "privacy" && "개인정보처리방침"}
            {activeTab === "terms" && "이용약관"}
            {activeTab === "disclaimer" && "면책고지"}
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => onTabChange("about")}
          className={`flex-1 min-w-[120px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "about"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          🏛️ 서비스 소개 &amp; 발행원칙
        </button>
        <button
          onClick={() => onTabChange("privacy")}
          className={`flex-1 min-w-[120px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "privacy"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          🔒 개인정보처리방침
        </button>
        <button
          onClick={() => onTabChange("terms")}
          className={`flex-1 min-w-[120px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "terms"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          📄 이용약관
        </button>
        <button
          onClick={() => onTabChange("disclaimer")}
          className={`flex-1 min-w-[120px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "disclaimer"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          ⚖️ 면책고지
        </button>
      </div>

      {/* 탭 내용 영역 */}
      <div className="p-6 sm:p-10 space-y-8 text-slate-800 leading-relaxed text-sm">
        {/* 1. 서비스 소개 & 발행원칙 */}
        {activeTab === "about" && (
          <div className="space-y-8">
            <div className="border-b border-slate-200 pb-6">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 font-mono">
                ABOUT HOUSINGHUB
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3 font-display">
                하우징허브(HousingHub) 소개 및 콘텐츠 발행 헌장
              </h2>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                하우징허브는 신혼부부, 사회초년생, 무주택 실수요자가 복잡한 주거 정책과 주택금융 속에서 권익을 보호하고 올바른 주거 결정을 내릴 수 있도록 돕는 비영리 공익 지식 포털입니다.
              </p>
            </div>

            {/* 하우징허브 3대 발행 원칙 */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>하우징허브 3대 핵심 발행 원칙</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EDITORIAL_STANDARDS.map((std, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      0{i + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{std.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{std.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 전문 감수 편집위원단 */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>분야별 전문 편집위원단</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(EDITORIAL_AUTHORS).map(author => (
                  <div key={author.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                        {author.avatarChar}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{author.name}</h4>
                        <p className="text-[11px] text-blue-600 font-semibold">{author.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{author.specialty}</p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                      경력: {author.experience}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 공공 데이터 출처 및 제휴 관계 없음 선언 */}
            <section className="p-6 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-3">
              <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>독립성 및 비상업성 보증 선언</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                하우징허브는 특정 시공사, 분양대행사, 은행, 대출 중개업체로부터 일체의 대가성 원고료나 수수료를 수취하지 않습니다. 모든 가이드 내용은 국토교통부, 한국부동산원 청약홈, 법제처 국가법령정보센터, 주택도시보증공사(HUG)의 공시 자료를 객관적으로 분석하여 작성됩니다.
              </p>
            </section>

            {/* 블로그 운영 및 문의 정보 */}
            <section className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
              <h3 className="text-sm font-bold text-slate-900 mb-2">블로그 운영 및 문의 정보</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>블로그명: <strong>하우징허브 (HousingHub)</strong></div>
                <div>운영 주체: <strong>하우징허브 편집팀</strong></div>
                <div>공식 문의 이메일: <strong>apark12321@gmail.com</strong></div>
                <div>웹사이트 주소: <strong>https://zip9.kr</strong></div>
                <div className="sm:col-span-2 text-slate-500 pt-1">
                  운영 목적: 무주택자 및 청년, 신혼부부를 위한 공공 주거·청약·대출 실무 정보 제공
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. 개인정보처리방침 */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                개인정보처리방침 (Privacy Policy)
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">최종 개정일: 2026년 9월 1일</p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">1. 총칙 및 개인정보 수집 최소화 원칙</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                하우징허브(https://zip9.kr)는 별도의 회원가입 없이 누구나 무료로 열람할 수 있는 개방형 주거정보 포털입니다. 하우징허브는 이용자의 이름, 주민등록번호, 연락처 등 고유식별정보를 직접 수집하거나 데이터베이스에 저장하지 않습니다.
              </p>
            </section>

            <section className="space-y-2 bg-blue-50/60 p-5 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-950 text-sm">2. 구글 애드센스(Google AdSense) 및 광고 쿠키(Cookie) 운용</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                하우징허브는 웹사이트 운영 유지를 위해 구글(Google LLC)을 포함한 제3자 광고 사업자의 광고를 게재할 수 있습니다.
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1 mt-2">
                <li>Google을 비롯한 제3자 공급업체는 쿠키(Cookie)를 사용하여 이용자의 이전 웹사이트 방문 기록을 바탕으로 관련성 높은 맞춤형 광고를 제공합니다.</li>
                <li>광고 쿠키를 통해 수집된 정보에는 개인을 직접 특정할 수 있는 민감 정보는 포함되지 않습니다.</li>
                <li>이용자는 <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Google 광고 설정 페이지</a>에서 언제든지 맞춤형 광고 게재를 거부(Opt-out)할 수 있습니다.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">3. 쿠키 설정 거부 및 관리 방법</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                이용자는 웹 브라우저 상단의 [설정] &gt; [개인정보 및 보안] 메뉴를 통해 모든 쿠키의 허용, 쿠키 설치 시 확인 알림, 또는 모든 쿠키의 저장을 거부할 권리가 있습니다.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">4. 개인정보 보호책임자 및 문의처</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-mono">
                책임자: 상상아트 개인정보 관리팀 · 공식 이메일: apark12321@gmail.com
              </p>
            </section>
          </div>
        )}

        {/* 3. 이용약관 */}
        {activeTab === "terms" && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                서비스 이용약관 (Terms of Service)
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">최종 개정일: 2026년 9월 1일</p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">제1조 (목적)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                본 약관은 상상아트(이하 "회사")가 운영하는 하우징허브(zip9.kr) 웹사이트에서 제공하는 모든 주택청약, 임대차, 금융 관련 정보 및 자가진단 계산기 서비스의 이용 조건과 절차를 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">제2조 (정보의 제공 및 저작권)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                하우징허브에 게재된 모든 심층 분석 칼럼, 인포그래픽, 계산기 로직의 저작권은 회사에 귀속됩니다. 무단 전재, 크롤링을 통한 상업적 재배포는 엄격히 금지되며, 개인적인 학습 및 정보 공유 목적의 출처 표기 인용은 허용됩니다.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">제3조 (서비스 변경 및 중단)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                회사는 정부 정책 개정 또는 서버 점검 등의 사유로 사전 고지 없이 서비스 내용을 업데이트하거나 일시 중단할 수 있습니다.
              </p>
            </section>
          </div>
        )}

        {/* 4. 면책고지 */}
        {activeTab === "disclaimer" && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                정보이용 면책고지 (Legal Disclaimer)
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">최종 개정일: 2026년 9월 1일</p>
            </div>

            <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <h3 className="font-bold text-amber-950 text-sm">⚠️ 주거·금융 의사결정 시 법적 책임 고지</h3>
              <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed">
                하우징허브(zip9.kr)가 제공하는 모든 분석 리포트, 계산기 시뮬레이션 결과, 주거 가이드는 실수요자의 이해를 돕기 위한 <strong>참고용 학술·정보성 자료</strong>에 불과하며, 어떠한 경우에도 법률적 자문이나 금융기관의 대출 승인 확약으로 해석될 수 없습니다.
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">1. 청약 신청 전 필수 확인</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                실제 아파트 청약 접수 시에는 반드시 <strong>한국부동산원 청약홈(applyhome.co.kr)</strong>의 최종 입주자모집공고문 전문을 확인하고 '청약자격 사전관리' 서비스를 통해 부적격 여부를 최종 검증하시기 바랍니다.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">2. 대출 실행 전 필수 확인</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                주택담보대출 및 전세자금대출의 승인 한도와 적용 금리는 개인의 신용평점, 기존 부채 상환 이력, 취급 은행의 여신심사 규정에 따라 달라지므로, 매매·임대차 계약 체결 전 반드시 해당 금융기관 창구에서 직접 사전 상담을 받으셔야 합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">3. 손해배상 책임의 제한</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                하우징허브 및 운영사는 본 사이트에 수록된 정보의 완결성이나 정확성을 기하기 위해 최선을 다하고 있으나, 법령 개정 시차나 공고문 해석 차이로 인해 발생하는 직·간접적인 손해에 대해 법적 책임을 부담하지 않습니다.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
