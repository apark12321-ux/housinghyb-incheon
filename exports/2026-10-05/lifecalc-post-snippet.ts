// ==============================================================================
// [라이프캘크 life-calc.kr] 포스팅 추가 스니펫 (2026-10-05)
// 라이프캘크 프로젝트의 포스트 데이터 배열(`blog-posts-data.ts` 등) 상단에 복사하여 붙여넣으세요.
// ==============================================================================

export const POST_LIFECALC_20261005 = {
  id: "post-work-10",
  title: "2026년 10월 5일 기준 퇴직연금 DB형 vs DC형 전환 손익 계산기: 임금상승률과 투자수익률 분기점 및 IRP 퇴직소득세 30% 감면 가이드",
  summary: "2026년 하반기 퇴직연금 DB형에서 DC형 전환 고민 완벽 해결! 본인의 향후 임금상승률이 4% 미만일 때 DC형으로 갈아타야 하는 결정적 이유와 임금피크제 진입 전 원금 보존 요령, IRP 연금 수령 시 퇴직소득세 30~40% 절세 공식을 박과장이 실측 계산합니다.",
  category: "work",
  categoryName: "직장·급여·퇴직",
  categoryIcon: "■",
  author: "박과장 (11년차 직장인)",
  authorRole: "데이터 기획자 & 블로그 운영자",
  authorNote: "※ 박과장의 실전 메모: DB형에서 DC형 전환은 일방통행(낙장불입)이므로, 본인의 정년까지 잔여 연봉 인상률과 ETF 운용 자신감을 대조한 후 신청서에 서명해야 합니다.",
  date: "2026-10-05",
  readTime: "8분",
  tags: ["퇴직연금", "DB형DC형비교", "IRP절세", "퇴직소득세", "임금피크제", "박과장생활경제"],
  content: `<p>2026년 하반기, 국내 기업들의 인사평가와 연봉 협상 시즌이 다가오면서 직장인들의 가장 큰 재테크 고민 중 하나는 바로 <b>'퇴직연금 DB(확정급여형)에서 DC(확정기여형)로의 전환 여부'</b>입니다. 임금상승률이 둔화되는 시점에 잘못된 선택을 하면 수천만 원의 퇴직금이 허공으로 사라질 수 있습니다. 라이프캘크 금융팀이 DB형과 DC형의 결정적 손익 분기점과 IRP(개인형 퇴직연금) 이전 시 퇴직소득세를 최대 40%까지 감면받는 절세 공식을 공개합니다.</p>

<div class="summary-card my-6 p-5 sm:p-6 bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/60 border-2 border-blue-200/80 rounded-2xl shadow-xs space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-200/60">
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-blue-700 text-white rounded-full text-xs font-bold tracking-wide">💡 30초 핵심 요약 카드</span>
      <span class="text-xs text-slate-500 font-medium">🎯 대상: <strong class="text-slate-700">근속 5년 이상 직장인 및 퇴직 예정자</strong></span>
    </div>
    <span class="text-xs font-mono font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600">⏱️ 8분 완독</span>
  </div>
  <ul class="space-y-2.5 my-2 list-none p-0">
    <li class="flex items-start gap-2.5"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">✓</span><span class="text-slate-800 font-medium text-sm sm:text-base"><strong>손익 분기점 공식:</strong> 본인의 향후 '예상 연봉 상승률'이 4% 미만이라면 DC형으로 전환하여 글로벌 인덱스 ETF에 직접 굴리는 것이 절대적으로 유리</span></li>
    <li class="flex items-start gap-2.5"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">✓</span><span class="text-slate-800 font-medium text-sm sm:text-base"><strong>임금피크제 진입 전 DC 필수 전환:</strong> 임금피크제가 적용되어 급여가 삭감되기 직전 해에 DC형으로 전환해야 기존 높은 급여 기준의 퇴직금 원금을 100% 보존</span></li>
    <li class="flex items-start gap-2.5"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">✓</span><span class="text-slate-800 font-medium text-sm sm:text-base"><strong>IRP 연금 수령 시 퇴직소득세 감면:</strong> 일시금 대신 IRP로 이전해 10년간 연금으로 수령 시 퇴직소득세의 30%(11년 차 이후는 40%) 전액 감면</span></li>
  </ul>
  <div class="pt-3 border-t border-blue-200/60 flex items-start gap-2 text-xs sm:text-sm text-blue-900 bg-blue-100/50 p-3 rounded-xl">
    <span class="font-bold shrink-0 text-blue-700">✨ 실무 팁:</span>
    <span class="leading-relaxed">DB형에서 DC형으로의 전환은 가능하지만, 한 번 DC형으로 전환하면 다시 DB형으로 되돌아갈 수 없으므로 신중한 계산이 선행되어야 합니다.</span>
  </div>
</div>

<h2>1. 2026년 퇴직연금 DB형 vs DC형 구조 및 유불리 비교표</h2>
<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left"><thead><tr class="bg-slate-100 text-slate-800"><th class="border border-slate-200 p-2.5 font-bold">비교 항목</th><th class="border border-slate-200 p-2.5 font-bold">DB형 (확정급여형)</th><th class="border border-slate-200 p-2.5 font-bold text-blue-700 bg-blue-50">DC형 (확정기여형)</th></tr></thead><tbody><tr><td class="border border-slate-200 p-2.5 font-semibold">퇴직금 계산 공식</td><td class="border border-slate-200 p-2.5">퇴직 전 3개월 평균임금 × 근속연수</td><td class="border border-slate-200 p-2.5 font-bold text-blue-700 bg-blue-50/50">매년 연봉의 1/12 납입 + 본인 운용수익</td></tr><tr class="bg-slate-50"><td class="border border-slate-200 p-2.5 font-semibold">운용 책임 주체</td><td class="border border-slate-200 p-2.5">회사 (기업이 책임지고 정액 지급)</td><td class="border border-slate-200 p-2.5 font-bold text-blue-700 bg-blue-50/50">근로자 본인 (본인이 직접 상품 선택)</td></tr><tr><td class="border border-slate-200 p-2.5 font-semibold">유리한 근로자 유형</td><td class="border border-slate-200 p-2.5">승진 기회가 많고 연봉 인상률이 높은 경우</td><td class="border border-slate-200 p-2.5 font-bold text-emerald-700 bg-blue-50/50">승진 정체, 임금피크제 진입 직전, ETF 투자자</td></tr><tr class="bg-slate-50"><td class="border border-slate-200 p-2.5 font-semibold">중도인출 가능 여부</td><td class="border border-slate-200 p-2.5 text-red-600">원칙적 불가 (담보대출만 가능)</td><td class="border border-slate-200 p-2.5 text-emerald-700 font-bold bg-blue-50/50">무주택자 주택 구입 등 법정 사유 시 가능</td></tr></tbody></table></div>

<h2>2. DC형 포트폴리오의 3대 안전 자산 배분 원칙</h2>
<ul>
  <li><b>위험자산 70% 한도 채우기:</b> 미국 S&P500, 나스닥100 인덱스 ETF에 분산 투자하여 장기 복리 성장률(연 7~8%) 달성</li>
  <li><b>안전자산 30% 방어막:</b> 미국 단기 국채 또는 우량 회사채 ETF, TDF에 투자해 안정적 이자 수익 확보</li>
  <li><b>연 1회 리밸런싱:</b> 주가 급등 시 위험자산 일부를 안전자산으로 이동하여 확정 이익 보존</li>
</ul>

<div class="checklist-block my-8 p-5 sm:p-6 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-2 border-emerald-300 rounded-2xl shadow-xs space-y-4">
  <div class="flex items-center justify-between pb-3 border-b border-emerald-200">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <span class="p-1.5 bg-emerald-600 text-white rounded-lg inline-flex items-center justify-center text-xs">✓</span>
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 m-0 tracking-tight">📋 퇴직연금 전환 전 5대 점검 체크리스트</h3>
      </div>
      <p class="text-xs text-slate-500 m-0">신청서 서명 전 손익을 가르는 5대 핵심 요건을 점검하세요.</p>
    </div>
    <span class="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full shrink-0">총 5개 항목</span>
  </div>
  <ul class="space-y-2.5 my-3 list-none p-0">
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3"><input type="checkbox" id="pen-chk-1" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" /><label for="pen-chk-1" class="cursor-pointer flex-1"><div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">1. 향후 본인의 연간 예상 임금인상률(호봉승급분 포함) 대조</span><span class="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">필수</span></div><p class="text-xs text-slate-600 m-0">임금인상률이 5% 이상인 고성장 직무라면 DB형 유지가 압도적으로 유리</p></label></li>
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3"><input type="checkbox" id="pen-chk-2" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" /><label for="pen-chk-2" class="cursor-pointer flex-1"><div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">2. 회사 취업규칙상 임금피크제 적용 시점(만 55~58세) 확인</span><span class="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">필수</span></div><p class="text-xs text-slate-600 m-0">임금피크제가 시작되기 전년도 12월까지 반드시 DC형으로 전환 완료</p></label></li>
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3"><input type="checkbox" id="pen-chk-3" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" /><label for="pen-chk-3" class="cursor-pointer flex-1"><div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">3. DC형 운용 금융기관의 실시간 ETF 매매 지원 여부</span><span class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">수익률</span></div><p class="text-xs text-slate-600 m-0">원리금보장형에만 묶여 있지 않고 다양한 지수 ETF 거래가 가능한지 확인</p></label></li>
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3"><input type="checkbox" id="pen-chk-4" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" /><label for="pen-chk-4" class="cursor-pointer flex-1"><div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">4. 퇴직 시 IRP 계좌 이전 후 10년 이상 연금 수령 계획 수립</span><span class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">절세</span></div><p class="text-xs text-slate-600 m-0">일시금 인출 시 수천만 원 부과되는 퇴직소득세를 연금 수령으로 30~40% 절감</p></label></li>
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3"><input type="checkbox" id="pen-chk-5" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" /><label for="pen-chk-5" class="cursor-pointer flex-1"><div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">5. 라이프캘크 퇴직연금 계산기로 예상 손익 분기점 산출</span></div><p class="text-xs text-slate-600 m-0">과거 3개년 연봉 상승률과 목표 투자수익률을 대조해 최종 의사결정</p></label></li>
  </ul>
  <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2"><span class="font-bold shrink-0 text-amber-700">⚠️ 사전 주의:</span><span class="leading-relaxed">DC형 전환 후 시장 급락기에 공포심으로 손절매하거나 원리금보장형에 무기한 방치할 경우 DB형 유지보다 퇴직금이 크게 줄어들 수 있으므로 장기 적립식 마인드가 필수입니다.</span></div>
</div>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. DC형으로 전환하면 회사에서 돈을 언제 입금해 주나요?</h3>
<p>A. 회사는 매년 1회 이상 근로자의 연간 임금총액의 1/12 이상에 해당하는 금액을 근로자의 DC 계좌에 현금으로 의무 입금해야 합니다.</p>
<h3>Q2. 퇴직금을 일시금으로 찾으면 세금이 얼마나 나오나요?</h3>
<p>A. 보통 퇴직금의 6~15% 수준의 퇴직소득세가 원천징수됩니다. 이를 IRP에 넣어 55세 이후 연금으로 쪼개 받으면 세금의 30~40%를 아낄 수 있습니다.</p>
<h3>Q3. 무주택자가 내 집 마련을 할 때 DC형 퇴직금을 중간정산할 수 있나요?</h3>
<p>A. 네, 근로자퇴직급여보장법상 무주택자인 근로자가 본인 명의로 주택을 구입하거나 주거 목적의 전세보증금을 납부할 경우 DC형 적립금의 중도인출이 법적으로 허용됩니다.</p>`
};
