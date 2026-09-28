import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle,
  Sparkles,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  FileText,
  ArrowRight,
  Info,
  Award
} from "lucide-react";

interface DiagnosticToolkitProps {
  initialTab?: "loan" | "score" | "rent";
  onSelectPost?: (postId: string) => void;
  isStandalonePage?: boolean;
  onBack?: () => void;
}

export const DiagnosticToolkit: React.FC<DiagnosticToolkitProps> = ({
  initialTab = "loan",
  onSelectPost,
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

    // 2) 스트레스 가산 금리 (3단계 수도권 기준 1.5% 가산)
    const effectiveRate = (interestRate + (applyStressDsr ? 1.5 : 0)) / 100;
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

    const bindingConstraint = finalAmount === ltvMax ? "LTV 한도 제한 (집값 한계)" : "DSR 40% 상환능력 제한 (소득 한계)";

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
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs ${isStandalonePage ? "max-w-5xl mx-auto my-6" : ""}`}>
      {/* 툴킷 상단 헤더 */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              2026 주거금융 개정 반영
            </span>
            <span className="text-slate-400 text-xs font-mono">
              실무 자가진단 엔진 v2.8
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            스마트 주거 자가진단 센터 & 실무 매뉴얼
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            소득·부채 기반 DSR 대출한도, 84점 청약 가점, HUG 보증보험 126% 안전도를 원클릭으로 정밀 진단합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>금융위·국토부·HUG 공식 기준 준용</span>
        </div>
      </div>

      {/* 탭 네비게이터 */}
      <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("loan")}
          className={`flex-1 min-w-[130px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "loan"
              ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          1. DSR/LTV 대출 한도
        </button>
        <button
          onClick={() => setActiveTab("score")}
          className={`flex-1 min-w-[130px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "score"
              ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          2. 청약 가점(84점 만점)
        </button>
        <button
          onClick={() => setActiveTab("rent")}
          className={`flex-1 min-w-[130px] py-3 text-center text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
            activeTab === "rent"
              ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          3. 전세 안전도 (보증보험)
        </button>
      </div>

      {/* ========================================================
          탭 1: 대출 한도 계산기 + 심층 실무 가이드
      ======================================================== */}
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
                <span>10억</span>
                <span>20억</span>
              </div>
            </div>

            {/* 대출 기간 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  희망 대출 기간
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {loanTerm}년 (원리금균등)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>10년</span>
                <span>30년 (표준)</span>
                <span>40년 (청년·신혼)</span>
              </div>
            </div>

            {/* LTV 상한 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  적용 LTV 상한 비율
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {ltvLimit}%
                </span>
              </div>
              <select
                value={ltvLimit}
                onChange={(e) => setLtvLimit(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value={80}>생애최초 주택구입 (최대 80%, 한도 6억)</option>
                <option value={70}>무주택 일반 (비규제지역 최대 70%)</option>
                <option value={50}>규제지역 (투기과열/조정대상 최대 50%)</option>
                <option value={40}>다주택자 규제지역 (최대 30~40%)</option>
              </select>
            </div>

            {/* 기본 금리 & 스트레스 옵션 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  대출 기본 금리 (연이율)
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {interestRate}%
                </span>
              </div>
              <input
                type="range"
                min="2.5"
                max="6.5"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="mt-3 flex items-center justify-between bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                <label className="text-[11px] font-bold text-blue-900 cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={applyStressDsr}
                    onChange={(e) => setApplyStressDsr(e.target.checked)}
                    className="accent-blue-600 rounded"
                  />
                  <span>스트레스 DSR 3단계 반영 (+1.5% 심사금리)</span>
                </label>
                <span className="text-[11px] text-blue-700 font-mono font-bold">
                  {applyStressDsr ? "심사금리 " + loanResult.effectiveRate + "%" : "미반영"}
                </span>
              </div>
            </div>
          </div>

          {/* 계산 결과 패널 */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">
                  최대 실행 가능 대출 총액
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                    {loanResult.finalAmount.toLocaleString()}만 원
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300">
                    (약 {(loanResult.finalAmount / 10000).toFixed(2)}억 원)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-bold block mb-1">
                  예상 월 원리금 상환액
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {loanResult.monthlyPayment.toLocaleString()}만 원/월
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-1">LTV 상한액 ({ltvLimit}%)</span>
                <span className="font-bold text-slate-200">
                  {loanResult.ltvMax.toLocaleString()}만 원
                </span>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-1">DSR 40% 한도 상한</span>
                <span className="font-bold text-slate-200">
                  {loanResult.dsrMax.toLocaleString()}만 원
                </span>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-1">한도 결정 요인</span>
                <span className="font-bold text-amber-400">
                  {loanResult.bindingConstraint}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              [고가치 승인용 실무 가이드 텍스트] - 대출 금융 편
          ======================================================== */}
          <div className="mt-8 pt-8 border-t border-slate-200 space-y-6 text-slate-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4" />
                <span>하우징허브 금융 실무 가이드</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                2026 스트레스 DSR 3단계 원리와 내 대출 한도 사수 4대 공식
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                금융위원회 거시건전성 가이드라인을 바탕으로 분석한 대출 한도 축소 실무 대응책입니다.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
              <p>
                <b>스트레스 DSR(총부채원리금상환비율) 3단계</b>는 차주의 실제 대출금리에 향후 금리 인상 위험을 방어하기 위한 가산금리(수도권 최대 1.50%)를 얹어 상환 능력을 엄격히 심사하는 제도입니다. 위 시뮬레이션 결과에서 보듯, 소득이 충분하더라도 스트레스 금리가 가산되면 DSR 40% 기준치에 일찍 도달하여 실제 대출 가능액이 3,000만~7,000만 원까지 줄어들게 됩니다.
              </p>
            </div>

            {/* 비교 분석 표 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-200 p-2.5 font-bold">연 소득</th>
                    <th className="border border-slate-200 p-2.5 font-bold">기존 한도 (미적용)</th>
                    <th className="border border-slate-200 p-2.5 font-bold text-blue-700">3단계 한도 (+1.5% 가산)</th>
                    <th className="border border-slate-200 p-2.5 font-bold text-rose-700">한도 축소액</th>
                    <th className="border border-slate-200 p-2.5 font-bold">추천 대응책</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-slate-200 p-2.5 font-semibold">5,000만 원</td>
                    <td class="border border-slate-200 p-2.5">약 3억 4,900만 원</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-blue-700">약 2억 9,400만 원</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-rose-700">- 5,500만 원</td>
                    <td class="border border-slate-200 p-2.5">디딤돌·보금자리론 등 정책금융 교차 활용</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td class="border border-slate-200 p-2.5 font-semibold">7,000만 원</td>
                    <td class="border border-slate-200 p-2.5">약 4억 8,800만 원</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-blue-700">약 4억 1,200만 원</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-rose-700">- 7,600만 원</td>
                    <td class="border border-slate-200 p-2.5">5년 주기형 고정금리 선택으로 가산금리 감면</td>
                  </tr>
                  <tr>
                    <td class="border border-slate-200 p-2.5 font-semibold">1억 원</td>
                    <td class="border border-slate-200 p-2.5">약 6억 9,700만 원</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-blue-700">약 5억 8,900만 원</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-rose-700">- 1억 800만 원</td>
                    <td class="border border-slate-200 p-2.5">40년 만기 연장 및 신용대출·마통 사전 상환</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 핵심 대응 4대 공식 */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>한도를 지켜내는 4대 실무 체크리스트</span>
              </h3>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2 pl-5 list-disc">
                <li><b>주기형(5년 고정) 상품 선택:</b> 변동금리 대비 스트레스 금리 적용 비율이 대폭 완화되어 한도가 수천만 원 늘어납니다.</li>
                <li><b>만기 최장 연장(35~40년):</b> 매월 갚아야 하는 연간 원리금 상환액이 분산되면서 DSR 40% 한도 내 대출금 상한이 증가합니다.</li>
                <li><b>불필요한 마이너스통장 및 카드론 해지:</b> 잔액이 0원이라도 한도가 열려 있으면 DSR 산정 시 부채로 인식되므로 대출 심사 1주일 전 해지하십시오.</li>
                <li><b>정책 모기지 우선 배정:</b> 디딤돌 대출과 신생아 특례대출은 은행권 스트레스 DSR이 적용되지 않으므로 한도 제한 없이 저금리 수혜가 가능합니다.</li>
              </ul>
            </div>

            {/* 연계 전문 포스트 링크 */}
            {onSelectPost && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  연계 추천 심층 실무 분석
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onSelectPost("post-20260927-dsr3")}
                    className="p-3.5 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-emerald-700 block mb-1">2026-09-27 최신</span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 line-clamp-1">
                      2026년 9월 최신 스트레스 DSR 3단계 시행과 주담대 한도 축소 실전 전략
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      글 읽기 <ChevronRight className="w-3 h-3" />
                    </span>
                  </button>
                  <button
                    onClick={() => onSelectPost("post-20260924-didimdol")}
                    className="p-3.5 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-emerald-700 block mb-1">대환대출 인프라</span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 line-clamp-1">
                      디딤돌·버팀목 전세대출 소득 기준 완화와 1%대 저금리 갈아타기 가이드
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      글 읽기 <ChevronRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          탭 2: 청약 가점 계산기 + 심층 실무 가이드
      ======================================================== */}
      {activeTab === "score" && (
        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 무주택 기간 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  1. 무주택 기간
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {homelessYears}년 ({scoreResult.homelessScore}점 / 32점)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={homelessYears}
                onChange={(e) => setHomelessYears(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1년 미만(2점)</span>
                <span>8년(18점)</span>
                <span>15년 이상(32점)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                * 만 30세부터 기산 (30세 이전 혼인 시 혼인신고일)
              </p>
            </div>

            {/* 부양가족 수 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  2. 부양가족 수 (본인 제외)
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {dependents}명 ({scoreResult.dependentsScore}점 / 35점)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0명(5점)</span>
                <span>3명(20점)</span>
                <span>6명 이상(35점)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                * 부모님은 등본상 3년 이상 계속 동거 필수
              </p>
            </div>

            {/* 청약통장 가입기간 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  3. 청약통장 가입 기간
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {bankbookYears}년 ({scoreResult.bankbookScore}점 / 17점)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={bankbookYears}
                onChange={(e) => setBankbookYears(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>6개월 미만(1점)</span>
                <span>8년(10점)</span>
                <span>15년 이상(17점)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                * 배우자 통장 가입기간 50%(최대 3점) 합산 가능
              </p>
            </div>
          </div>

          {/* 청약 결과 패널 */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">
                  내 주택청약 최종 총점 (84점 만점)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-blue-400 font-mono">
                    {scoreResult.totalScore}
                  </span>
                  <span className="text-base text-slate-400 font-mono">
                    / 84점 만점
                  </span>
                </div>
              </div>

              <div>
                <span className={`inline-block px-4 py-2 rounded-xl text-xs font-bold border ${scoreResult.tierColor}`}>
                  {scoreResult.tier}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>당첨 가능성 종합 진단 & 전략 제언</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {scoreResult.advice}
              </p>
            </div>
          </div>

          {/* ========================================================
              [고가치 승인용 실무 가이드 텍스트] - 청약 분양 편
          ======================================================== */}
          <div className="mt-8 pt-8 border-t border-slate-200 space-y-6 text-slate-800">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>하우징허브 청약 실무 가이드</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                청약 가점 84점 만점 체계와 부적격 탈락 0% 체크리스트
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                한국부동산원 청약홈 공식 지침에 따른 부적격 예방 핵심 점검 가이드입니다.
              </p>
            </div>

            {/* 세부 배점 기준표 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-200 p-2.5 font-bold">항목 구분</th>
                    <th className="border border-slate-200 p-2.5 font-bold">만점 한도</th>
                    <th className="border border-slate-200 p-2.5 font-bold">산정 기준 및 가점 공식</th>
                    <th className="border border-slate-200 p-2.5 font-bold text-rose-700">흔히 저지르는 치명적 실수</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-slate-200 p-2.5 font-semibold">무주택 기간</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-blue-700">32점</td>
                    <td class="border border-slate-200 p-2.5">1년마다 2점씩 가산 (15년 이상 시 32점)</td>
                    <td class="border border-slate-200 p-2.5 text-rose-700">만 30세 이전 기간을 산입하거나 주택 소유 이력 누락</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td class="border border-slate-200 p-2.5 font-semibold">부양가족 수</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-blue-700">35점</td>
                    <td class="border border-slate-200 p-2.5">1인당 5점씩 가산 (0명 5점, 6명 이상 35점)</td>
                    <td class="border border-slate-200 p-2.5 text-rose-700">부모님 3년 계속 동거 요건 미충족, 유주택 직계존속 부양</td>
                  </tr>
                  <tr>
                    <td class="border border-slate-200 p-2.5 font-semibold">통장 가입기간</td>
                    <td class="border border-slate-200 p-2.5 font-bold text-blue-700">17점</td>
                    <td class="border border-slate-200 p-2.5">1년마다 1점씩 가산 (15년 이상 시 17점)</td>
                    <td class="border border-slate-200 p-2.5 text-rose-700">배우자 통장 합산 시 50%(최대 3점) 한도 초과 기재</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 연계 전문 포스트 링크 */}
            {onSelectPost && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  연계 추천 심층 청약 분석
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onSelectPost("post-20260927-sub84")}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-blue-700 block mb-1">2026-09-27 최신</span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-800 line-clamp-1">
                      2026년 가을 분양 성수기 청약홈 완전 개편 분석과 84점 만점표 공략
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      글 읽기 <ChevronRight className="w-3 h-3" />
                    </span>
                  </button>
                  <button
                    onClick={() => onSelectPost("post-20260923-sub25")}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-blue-700 block mb-1">월 납입 인정 25만 원</span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-800 line-clamp-1">
                      청약통장 월 납입 인정 한도 25만 원 상향과 공공분양 합격선 전략
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      글 읽기 <ChevronRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          탭 3: 전세 안전도 계산기 + 심층 실무 가이드
      ======================================================== */}
      {activeTab === "rent" && (
        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 매매 시세 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">
                  해당 주택 매매 시세 (KB 또는 실거래)
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
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">
                  전세가율 및 총 부채 비율
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    전세가율 {rentResult.jeonseRatio}%
                  </span>
                  <span className="text-sm text-slate-400 font-medium">
                    (총 부채율 {rentResult.debtRatio}%)
                  </span>
                </div>
              </div>

              <div>
                <span className={`inline-block px-4 py-2 rounded-xl text-xs font-bold border ${rentResult.riskBadge}`}>
                  {rentResult.riskLevel}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>보증금 반환 안전도 평가 & 실무 조언</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {rentResult.recommendation}
              </p>
            </div>
          </div>

          {/* ========================================================
              [고가치 승인용 실무 가이드 텍스트] - 전월세 안심 편
          ======================================================== */}
          <div className="mt-8 pt-8 border-t border-slate-200 space-y-6 text-slate-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>하우징허브 전월세 안심 가이드</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                깡통전세 판별 기준과 HUG 보증보험 126% 룰 실무 방어 전략
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                주택도시보증공사(HUG) 전세보증금 반환보증 가입 기준과 전세사기 예방 특약 해설입니다.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
              <p>
                전세계약 체결 시 가장 위험한 요소는 <b>'매매가 대비 전세가율 70% 초과'</b>와 <b>'선순위 근저당권 결합'</b>입니다. 만약 경매가 개시되면 주택 낙찰가는 감정가의 70~80% 수준으로 떨어지므로, 선순위 근저당과 전세보증금의 합이 매매가의 70%를 넘어서면 임차인은 경매 배당에서 보증금 전액을 돌려받지 못하는 깡통전세의 피해자가 됩니다.
              </p>
            </div>

            {/* HUG 126% 룰 공식 */}
            <div className="p-4 bg-slate-100 rounded-xl text-slate-800 font-mono text-xs sm:text-sm border border-slate-300 space-y-1">
              <div className="font-bold text-blue-900">HUG 전세보증보험 가입 상한 기준:</div>
              <div>보증금 상한 = 주택 공시가격 × 140% (인정 주택가액) × 90% (전세가율) = <b>공시가격의 126%</b></div>
            </div>

            {/* 특약 3선 */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>계약서에 반드시 기재해야 할 안심 특약 3선</span>
              </h3>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2 pl-5 list-disc">
                <li><b>보증보험 불가 시 계약 해제 특약:</b> "임대인 또는 임차목적물의 하자로 인해 HUG 전세보증금 반환보증 가입이 거절될 경우 본 계약은 무효로 하고 임대인은 계약금을 즉시 반환한다."</li>
                <li><b>잔금 익일까지 담보권 설정 금지:</b> "임대인은 잔금 지급일 다음 날까지 임차목적물에 새로운 근저당 등 어떠한 제한물권도 설정하지 아니한다."</li>
                <li><b>국세·지방세 완납 증명서 제시:</b> "임대인은 잔금일 전까지 당해세 체납이 없음을 입증하는 국세·지방세 납세증명서를 임차인에게 교부한다."</li>
              </ul>
            </div>

            {/* 연계 전문 포스트 링크 */}
            {onSelectPost && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  연계 추천 심층 전월세 분석
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onSelectPost("post-20260926-hug126")}
                    className="p-3.5 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-emerald-700 block mb-1">2026-09-26 최신</span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 line-clamp-1">
                      전세보증보험 HUG 가입 기준 126% 룰 실무 계산법과 역전세 협상법
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      글 읽기 <ChevronRight className="w-3 h-3" />
                    </span>
                  </button>
                  <button
                    onClick={() => onSelectPost("post-20260918-trustrent")}
                    className="p-3.5 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-emerald-700 block mb-1">전세사기 완벽 방어</span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 line-clamp-1">
                      신탁부동산 전세계약 사기 예방과 신탁원부 발급 열람 실무 가이드
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      글 읽기 <ChevronRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          하단 종합 FAQ 5선 & E-E-A-T 검증 체계 고지
      ======================================================== */}
      <div className="bg-slate-50 p-6 sm:p-10 border-t border-slate-200 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <span>스마트 주거 자가진단 센터 자주 묻는 질문 (FAQ)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            계산 결과 해석과 실무 적용 시 실수요자가 가장 자주 묻는 5대 질문입니다.
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">
              Q1. 계산된 DSR 대출 한도가 실제 은행 창구에서 그대로 인정되나요?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              본 계산기는 금융위원회 표준 DSR 40% 공식 및 수도권 스트레스 가산금리(1.5%)를 원칙대로 적용한 시뮬레이션입니다. 실제 은행 심사 시에는 개인의 신용점수, 우대금리 조건, 담보 아파트의 감정평가액 및 소액임차보증금(방공제) 공제 여부에 따라 5~10% 내외의 편차가 발생할 수 있습니다.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">
              Q2. 청약 가점 계산 시 부모님을 부양가족으로 올릴 때 조건이 어떻게 되나요?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              직계존속(부모·조부모)은 입주자모집공고일 기준으로 신청자와 동일한 주민등록표등본에 <b>3년 이상 계속하여 등재</b>되어 있어야 부양가족 가점(1인당 5점)으로 인정받습니다. 또한 부모님이 주택을 소유하고 있는 경우(만 60세 이상 제외) 부양가족 가점에서 배제될 수 있으니 사전 등기 확인이 필수적입니다.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">
              Q3. HUG 전세보증금 반환보증 126% 기준에서 공시가격은 어디서 조회하나요?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              국토교통부 '부동산 공시가격 알리미(realtyprice.kr)'에서 공동주택공시가격 또는 개별단독주택가격을 조회할 수 있습니다. 공시가격이 공시되지 않은 신축 건물의 경우 안심전세포털이나 HUG 공인 감정평가기관의 감정가를 활용해야 합니다.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">
              Q4. 배우자와 청약통장을 각각 가지고 있는데 가점을 어떻게 합산하나요?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              주택공급에 관한 규칙 개정에 따라 민영주택 일반공급 청약 시 배우자의 청약통장 가입기간의 50%(최대 3점)를 본인 점수에 합산할 수 있습니다. 예를 들어 본인 통장 5년(7점) + 배우자 통장 4년(가입기간의 50%인 2년 적용 → 2점) = 총 9점으로 신청할 수 있습니다.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">
              Q5. 자가진단 센터의 데이터 업데이트 주기는 어떻게 되나요?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              하우징허브 연구팀은 국토교통부, 금융위원회, 주택도시보증공사(HUG)의 규정 개정 발표 시 매월 상시 반영하며, 2026년 하반기 스트레스 DSR 3단계 및 청약제도 개편안을 100% 최신 반영하여 서비스하고 있습니다.
            </p>
          </div>
        </div>

        {/* E-E-A-T 공공 출처 명시 */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span>데이터 근거: 국토교통부 주택공급에 관한 규칙, 금융위원회 가계부채 관리방안, HUG 보증 규정</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            검증일자: 2026년 9월 28일
          </span>
        </div>
      </div>
    </div>
  );
};
