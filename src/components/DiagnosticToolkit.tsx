import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface DiagnosticToolkitProps {
  initialTab?: "loan" | "score" | "rent";
  onSelectPost?: (postId: string) => void;
  isStandalonePage?: boolean;
  onBack?: () => void;
}

export const DiagnosticToolkit: React.FC<DiagnosticToolkitProps> = ({
  initialTab = "loan",
  isStandalonePage = false,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<"loan" | "score" | "rent">(initialTab);

  // 1. 대출 계산기 상태
  const [annualIncome, setAnnualIncome] = useState<number>(6000); // 만원
  const [otherDebtInterest, setOtherDebtInterest] = useState<number>(200); // 만원
  const [propertyValue, setPropertyValue] = useState<number>(70000); // 만원 (7억)
  const [loanTerm, setLoanTerm] = useState<number>(30); // 30년
  const [interestRate, setInterestRate] = useState<number>(3.8); // 연 3.8%
  const [ltvLimit, setLtvLimit] = useState<number>(80); // 80%
  const [applyStressDsr, setApplyStressDsr] = useState<boolean>(true); // 스트레스 DSR 3단계 반영 여부

  // 2. 청약 가점 상태
  const [homelessYears, setHomelessYears] = useState<number>(5); // 0~15년
  const [dependents, setDependents] = useState<number>(2); // 0~6명 이상
  const [bankbookYears, setBankbookYears] = useState<number>(7); // 0~15년

  // 3. 전세 안전도 상태
  const [marketPrice, setMarketPrice] = useState<number>(50000); // 매매 시세 5억
  const [depositAmount, setDepositAmount] = useState<number>(38000); // 전세 보증금 3.8억
  const [seniorMortgage, setSeniorMortgage] = useState<number>(5000); // 선순위 근저당 5000만

  // --- 1. 대출 한도 계산 로직 (스트레스 DSR 3단계 반영) ---
  const loanResult = useMemo(() => {
    // 1) LTV 상한액 (만원)
    const ltvMax = Math.round(propertyValue * (ltvLimit / 100));

    // 2) 스트레스 가산 금리 (3단계 수도권 기준 약 1.2% 가산)
    const effectiveRate = (interestRate + (applyStressDsr ? 1.2 : 0)) / 100;
    const monthlyRate = effectiveRate / 12;
    const totalMonths = loanTerm * 12;

    // 연간 가용 DSR 원리금 (DSR 40% 한도 기준)
    const maxAnnualDsrPayment = annualIncome * 0.4 - otherDebtInterest;
    if (maxAnnualDsrPayment <= 0) {
      return {
        finalAmount: 0,
        ltvMax,
        dsrMax: 0,
        monthlyPayment: 0,
        bindingConstraint: "기타 대출 과다로 DSR 한도 초과",
        stressDsrApplied: applyStressDsr,
        effectiveRate: (effectiveRate * 100).toFixed(2)
      };
    }

    const maxMonthlyPayment = maxAnnualDsrPayment / 12;

    // 원리금균등상환 역산: P = M * ((1+r)^n - 1) / (r*(1+r)^n)
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const dsrMax = Math.round((maxMonthlyPayment * (factor - 1)) / (monthlyRate * factor));

    // 최종 대출 가능액: MIN(LTV, DSR)
    const finalAmount = Math.max(0, Math.min(ltvMax, dsrMax));
    
    // 실제 적용 금리 기준 월 예상 상환액
    const baseMonthlyRate = (interestRate / 100) / 12;
    const baseFactor = Math.pow(1 + baseMonthlyRate, totalMonths);
    const actualMonthlyPayment = finalAmount > 0 
      ? Math.round((finalAmount * baseMonthlyRate * baseFactor) / (baseFactor - 1))
      : 0;

    const bindingConstraint = finalAmount === ltvMax ? "LTV 한도 제한" : "DSR 40% 상환능력 제한";

    return {
      finalAmount,
      ltvMax,
      dsrMax,
      monthlyPayment: actualMonthlyPayment,
      bindingConstraint,
      stressDsrApplied: applyStressDsr,
      effectiveRate: (effectiveRate * 100).toFixed(2)
    };
  }, [annualIncome, otherDebtInterest, propertyValue, loanTerm, interestRate, ltvLimit, applyStressDsr]);

  // --- 2. 청약 가점 계산 로직 (84점 만점) ---
  const scoreResult = useMemo(() => {
    // 1) 무주택 기간: 최대 32점 (15년 이상 32점, 1년마다 2점씩, 미만 2점)
    let homelessScore = 0;
    if (homelessYears === 0) homelessScore = 2; // 1년 미만
    else if (homelessYears >= 15) homelessScore = 32;
    else homelessScore = (homelessYears + 1) * 2;

    // 2) 부양가족 수: 최대 35점 (0명 5점, 1명 10점, 2명 15점, 3명 20점, 4명 25점, 5명 30점, 6명 이상 35점)
    const dependentsScore = Math.min(35, (dependents + 1) * 5);

    // 3) 청약통장 가입기간: 최대 17점 (6개월 미만 1점, 1년 미만 2점, 이후 1년당 1점씩 가산, 15년 이상 17점)
    let bankbookScore = 0;
    if (bankbookYears === 0) bankbookScore = 1;
    else if (bankbookYears >= 15) bankbookScore = 17;
    else bankbookScore = bankbookYears + 2;

    const totalScore = homelessScore + dependentsScore + bankbookScore;

    let tier = "";
    let tierColor = "";
    let advice = "";

    if (totalScore >= 70) {
      tier = "최상위권 (서울 핵심지·강남3구 당첨 안정권)";
      tierColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      advice = "서울 선호 단지 및 수도권 규제지역 주요 민영아파트 일반공급 당첨 가능성이 매우 높습니다. 분양가상한제 적용 단지를 적극 노려보세요.";
    } else if (totalScore >= 58) {
      tier = "상위권 (서울 인기권 및 수도권 유망단지 경합권)";
      tierColor = "text-blue-700 bg-blue-50 border-blue-200";
      advice = "서울 84㎡ 미만 타입 및 수도권 1급지 당첨권에 근접합니다. 비선호 타입이나 추첨제 30~50% 배정 물량과 병행 지원을 권장합니다.";
    } else if (totalScore >= 42) {
      tier = "중위권 (수도권 외곽·공공분양 일반공급 타깃)";
      tierColor = "text-amber-700 bg-amber-50 border-amber-200";
      advice = "가점제 단독으로는 서울 핵심지 진입이 어렵습니다. 신혼부부·생애최초 특별공급 자격을 먼저 점검하시고, 85㎡ 초과 추첨제 비율 높은 단지를 노리십시오.";
    } else {
      tier = "입문·도전권 (특별공급 및 추첨제 중심 전략 필수)";
      tierColor = "text-rose-700 bg-rose-50 border-rose-200";
      advice = "가점제보다는 신생아·신혼부부 특공, 청약통장 납입인정금액 기준 공공분양, 또는 100% 추첨제 물량을 정밀 타깃팅해야 승산이 있습니다.";
    }

    return {
      homelessScore,
      dependentsScore,
      bankbookScore,
      totalScore,
      tier,
      tierColor,
      advice
    };
  }, [homelessYears, dependents, bankbookYears]);

  // --- 3. 전세 안전도 계산 로직 ---
  const rentResult = useMemo(() => {
    // 깡통전세 위험도: (선순위 근저당 + 전세보증금) / 매매시세 * 100
    const totalRiskDebt = seniorMortgage + depositAmount;
    const debtRatio = marketPrice > 0 ? (totalRiskDebt / marketPrice) * 100 : 0;
    const jeonseRatio = marketPrice > 0 ? (depositAmount / marketPrice) * 100 : 0;

    // HUG 보증보험 안전 기준: 공시가격 126% 기준 (시세의 대략 70~80% 수준)
    const isHugSafe = jeonseRatio <= 75 && debtRatio <= 80;

    let riskLevel = "";
    let riskBadge = "";
    let recommendation = "";

    if (debtRatio > 85 || jeonseRatio > 80) {
      riskLevel = "고위험 (깡통전세 경보)";
      riskBadge = "bg-rose-100 text-rose-800 border-rose-200";
      recommendation = "매매가 대비 보증금 비율이 지나치게 높습니다. 임대차 만기 시 역전세나 경매 배당 부족으로 보증금을 온전히 돌려받지 못할 위험이 큽니다. HUG 보증보험 가입 불가가 예상되므로 계약을 재고하거나 보증금을 대폭 낮추고 월세로 전환하십시오.";
    } else if (debtRatio > 70 || jeonseRatio > 70) {
      riskLevel = "주의 (안전장치 확보 필수)";
      riskBadge = "bg-amber-100 text-amber-800 border-amber-200";
      recommendation = "전세가율 70%대로 통상적인 안전 한계선에 걸쳐 있습니다. 반드시 'HUG/HF 전세보증금 반환보증 가입 불가 시 계약 무효 및 계약금 전액 반환' 특약을 계약서에 명시하고 가입 여부를 사전 확인하십시오.";
    } else {
      riskLevel = "양호 (권리 안전 구간)";
      riskBadge = "bg-emerald-100 text-emerald-800 border-emerald-200";
      recommendation = "매매시세 대비 보증금과 선순위 채권 합계가 70% 이하로 안정적입니다. 계약 당일 전입신고 및 확정일자를 갖추고 보증보험에 가입하면 안전하게 보증금을 지킬 수 있습니다.";
    }

    return {
      debtRatio: Math.round(debtRatio),
      jeonseRatio: Math.round(jeonseRatio),
      isHugSafe,
      riskLevel,
      riskBadge,
      recommendation
    };
  }, [marketPrice, depositAmount, seniorMortgage]);

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs ${isStandalonePage ? "max-w-5xl mx-auto my-8" : ""}`}>
      {/* 툴킷 상단 헤더 */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              2026 개정 주거금융 반영
            </span>
            <span className="text-slate-400 text-xs font-mono">
              실무 자가진단 엔진 v2.6
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            스마트 주거 자가진단 센터
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            내 소득과 자산으로 가능한 실질 주택대출 한도와 청약 가점을 1분 만에 진단해보세요.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>금융위·국토부 공식 기준 적용</span>
        </div>
      </div>

      {/* 탭 네비게이터 */}
      <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("loan")}
          className={`flex-1 min-w-[130px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "loan"
              ? "bg-white text-emerald-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          DSR/LTV 대출 한도
        </button>
        <button
          onClick={() => setActiveTab("score")}
          className={`flex-1 min-w-[130px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "score"
              ? "bg-white text-emerald-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          청약 가점(84점 만점)
        </button>
        <button
          onClick={() => setActiveTab("rent")}
          className={`flex-1 min-w-[130px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "rent"
              ? "bg-white text-emerald-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          전세 안전도 (보증보험)
        </button>
      </div>

      {/* 탭 1: 대출 한도 계산기 */}
      {activeTab === "loan" && (
        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 연 소득 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  부부 합산 연 소득
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {annualIncome.toLocaleString()}만 원
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="25000"
                step="500"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>2,000만</span>
                <span>1억</span>
                <span>2.5억</span>
              </div>
            </div>

            {/* 기타 대출 연이자 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  기타 대출(신용/차량) 연간 원리금 부담
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {otherDebtInterest.toLocaleString()}만 원
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={otherDebtInterest}
                onChange={(e) => setOtherDebtInterest(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0원 (부채 없음)</span>
                <span>1,500만</span>
                <span>3,000만</span>
              </div>
            </div>

            {/* 주택 평가 가치 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  매수 희망 주택 매매가 (시세)
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {(propertyValue / 10000).toFixed(1)}억 원 ({propertyValue.toLocaleString()}만 원)
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="2500"
                value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1억</span>
                <span>9억 (특례 기준선)</span>
                <span>20억</span>
              </div>
            </div>

            {/* 상환 조건 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  대출 상환 기간 & 금리
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {loanTerm}년형 / 연 {interestRate}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-blue-600"
                >
                  <option value={10}>10년 만기</option>
                  <option value={20}>20년 만기</option>
                  <option value={30}>30년 만기 (권장)</option>
                  <option value={40}>40년 최장 상환</option>
                </select>
                <select
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-blue-600"
                >
                  <option value={2.5}>연 2.5% (신생아/디딤돌 우대)</option>
                  <option value={3.2}>연 3.2% (주택도시기금 표준)</option>
                  <option value={3.8}>연 3.8% (시중은행 고정형)</option>
                  <option value={4.5}>연 4.5% (시중은행 변동형)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 규제 옵션 바 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                LTV 기준
              </span>
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="ltv"
                  checked={ltvLimit === 80}
                  onChange={() => setLtvLimit(80)}
                  className="accent-blue-600"
                />
                <span className="font-medium text-slate-700">생애최초 구입 (80%)</span>
              </label>
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="ltv"
                  checked={ltvLimit === 70}
                  onChange={() => setLtvLimit(70)}
                  className="accent-blue-600"
                />
                <span className="font-medium text-slate-700">무주택 일반 (70%)</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={applyStressDsr}
                  onChange={(e) => setApplyStressDsr(e.target.checked)}
                  className="accent-blue-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800">
                  2026 스트레스 DSR 3단계 가산(+1.2%) 적용
                </span>
              </label>
            </div>
          </div>

          {/* 계산 결과 리포트 */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 rounded-3xl p-6 sm:p-8 border border-blue-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-200/60">
              <div>
                <p className="text-xs font-bold text-blue-700 tracking-wide">
                  최대 안전 조달 대출액 (LTV &amp; DSR 40% 종합)
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
                    {loanResult.finalAmount === 0
                      ? "대출 불가"
                      : `${(loanResult.finalAmount / 10000).toFixed(2)}억 원`}
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    ({loanResult.finalAmount.toLocaleString()}만 원)
                  </span>
                </div>
              </div>

              <div className="bg-white px-4 py-3 rounded-2xl border border-blue-200 shadow-2xs text-right">
                <span className="text-[11px] text-slate-500 block">월 예상 상환액 (원리금균등)</span>
                <span className="text-lg font-extrabold text-blue-600 font-mono">
                  월 약 {loanResult.monthlyPayment.toLocaleString()}만 원
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/80 p-4 rounded-2xl border border-blue-100">
                <span className="text-slate-500 block mb-1">LTV 한계선 ({ltvLimit}%)</span>
                <span className="font-extrabold font-mono text-slate-800 text-sm">
                  {(loanResult.ltvMax / 10000).toFixed(2)}억 원
                </span>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl border border-blue-100">
                <span className="text-slate-500 block mb-1">DSR 40% 한계선 (스트레스 반영)</span>
                <span className="font-extrabold font-mono text-slate-800 text-sm">
                  {(loanResult.dsrMax / 10000).toFixed(2)}억 원
                </span>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl border border-blue-100">
                <span className="text-slate-500 block mb-1">결정 제약 요건</span>
                <span className="font-extrabold text-blue-700 text-sm">
                  {loanResult.bindingConstraint}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              ※ 본 계산 결과는 금융위원회 스트레스 DSR 및 은행업감독규정 기준을 준용한 모의 진단이며, 개인별 신용점수 및 은행별 심사 가이드라인에 따라 실제 한도는 변동될 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* 탭 2: 청약 가점 계산기 */}
      {activeTab === "score" && (
        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1) 무주택 기간 */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">1. 무주택 기간</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                  {scoreResult.homelessScore}점 / 32점
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                만 30세 이상 또는 혼인신고일부터 기산 (최대 15년 이상 32점)
              </p>
              <select
                value={homelessYears}
                onChange={(e) => setHomelessYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-blue-600"
              >
                <option value={0}>1년 미만 (2점)</option>
                <option value={1}>1년 이상 ~ 2년 미만 (4점)</option>
                <option value={3}>3년 이상 ~ 4년 미만 (8점)</option>
                <option value={5}>5년 이상 ~ 6년 미만 (12점)</option>
                <option value={7}>7년 이상 ~ 8년 미만 (16점)</option>
                <option value={10}>10년 이상 ~ 11년 미만 (22점)</option>
                <option value={12}>12년 이상 ~ 13년 미만 (26점)</option>
                <option value={15}>15년 이상 (만점 32점)</option>
              </select>
            </div>

            {/* 2) 부양가족 수 */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">2. 부양가족 수</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                  {scoreResult.dependentsScore}점 / 35점
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                본인 제외 배우자 및 직계존비속 3년 이상 주민등록등재
              </p>
              <select
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-blue-600"
              >
                <option value={0}>0명 (본인 단독: 5점)</option>
                <option value={1}>1명 (10점)</option>
                <option value={2}>2명 (15점)</option>
                <option value={3}>3명 (20점)</option>
                <option value={4}>4명 (25점)</option>
                <option value={5}>5명 (30점)</option>
                <option value={6}>6명 이상 (만점 35점)</option>
              </select>
            </div>

            {/* 3) 청약통장 가입기간 */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">3. 청약통장 가입기간</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                  {scoreResult.bankbookScore}점 / 17점
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                가입일부터 입주자모집공고일까지 (최대 15년 이상 17점)
              </p>
              <select
                value={bankbookYears}
                onChange={(e) => setBankbookYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-blue-600"
              >
                <option value={0}>6개월 미만 (1점)</option>
                <option value={1}>1년 이상 ~ 2년 미만 (3점)</option>
                <option value={3}>3년 이상 ~ 4년 미만 (5점)</option>
                <option value={5}>5년 이상 ~ 6년 미만 (7점)</option>
                <option value={7}>7년 이상 ~ 8년 미만 (9점)</option>
                <option value={10}>10년 이상 ~ 11년 미만 (12점)</option>
                <option value={12}>12년 이상 ~ 13년 미만 (14점)</option>
                <option value={15}>15년 이상 (만점 17점)</option>
              </select>
            </div>
          </div>

          {/* 가점 종합 진단 카드 */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs text-blue-400 font-bold block mb-1">
                  총 청약 가점 결과 (84점 만점 기준)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black font-display text-white">
                    {scoreResult.totalScore}
                  </span>
                  <span className="text-slate-400 font-bold text-base">/ 84점</span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end">
                <span className="text-xs text-slate-400 mb-1">판정 등급</span>
                <span className="text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">
                  {scoreResult.tier}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>하우징허브 청약 전략 조언</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {scoreResult.advice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 탭 3: 전세 안전도 계산기 */}
      {activeTab === "rent" && (
        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 매매 시세 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  해당 주택 매매 시세 (KB/실거래)
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {(marketPrice / 10000).toFixed(1)}억 원
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="150000"
                step="2000"
                value={marketPrice}
                onChange={(e) => setMarketPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1억</span>
                <span>7.5억</span>
                <span>15억</span>
              </div>
            </div>

            {/* 희망 전세 보증금 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  희망 전세 보증금
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {(depositAmount / 10000).toFixed(1)}억 원
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="120000"
                step="1000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>5,000만</span>
                <span>6억</span>
                <span>12억</span>
              </div>
            </div>

            {/* 선순위 채권(근저당) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  등기부상 선순위 근저당권 (을구)
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {seniorMortgage.toLocaleString()}만 원
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={seniorMortgage}
                onChange={(e) => setSeniorMortgage(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0원 (무융자 권장)</span>
                <span>2.5억</span>
                <span>5억</span>
              </div>
            </div>
          </div>

          {/* 전세 위험도 진단 결과 */}
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1">
                  전세가율 및 부채 비율
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    전세가율 {rentResult.jeonseRatio}%
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    (총 부채율 {rentResult.debtRatio}%)
                  </span>
                </div>
              </div>

              <div>
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${rentResult.riskBadge}`}>
                  {rentResult.riskLevel}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>보증금 반환 안전도 평가 &amp; 실무 조언</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {rentResult.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
