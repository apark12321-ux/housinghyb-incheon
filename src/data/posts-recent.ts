import { Post } from "../types";

export const POSTS_RECENT: Post[] = [
  {
    id: "post-20260927-dsr3",
    title: "2026년 9월 최신 스트레스 DSR 3단계 시행과 주담대 한도 축소: 내 한도 직접 계산하고 사수하는 실전 5대 전략",
    category: "대출-금융",
    author: "하우징허브",
    date: "2026-09-27",
    time: "08:15:30",
    readTime: "9분",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    excerpt: "2026년 9월 금융위원회의 스트레스 DSR 3단계 본격 시행으로 수도권 주담대 한도가 최대 수천만 원까지 축소되었습니다. 실제 소득별 한도 축소 시뮬레이션 표와 고정금리 혼합형 선택, 만기 연장 등 내 한도를 사수하는 5대 실무 전략을 하우징허브가 단독 공개합니다.",
    content: `<p>2026년 9월, 주택담보대출 시장에 가장 큰 분기점이 찾아왔습니다. 금융당국이 가계부채 관리 강화를 위해 예고했던 <b>'스트레스 DSR 3단계'</b>가 전면 시행되면서, 수도권과 비수도권의 주담대 가용 한도가 대폭 깎여나갔기 때문입니다. 실제로 최근 내 집 마련 계약을 앞두고 은행 창구를 찾았다가, 전달까지만 해도 나오던 대출 한도에서 3,000만~6,000만 원이 줄어들어 잔금 마련에 비상이 걸린 매수자들의 문의가 쏟아지고 있습니다.</p>

<p>하우징허브 금융분석팀은 이번 규제의 핵심 원리와 차주별 한도 감소 폭을 실증 분석하고, 변화된 금융 환경 속에서 실수요자가 내 집 마련 자금 계획을 안전하게 지켜낼 수 있는 실전 5대 대응 전략을 정리했습니다.</p>

<h2>1. 스트레스 DSR 3단계 핵심 규제 구조와 가산금리</h2>
<p>스트레스 DSR이란 향후 금리 인상 위험을 미리 반영하여, 실제 적용 대출금리에 <b>가산금리(스트레스 금리)</b>를 덧붙여 상환 능력을 심사하는 제도입니다. 금리가 오를 때 원리금 상환 부담이 커질 것을 대비해 대출 가능 총액 자체를 줄여버리는 강력한 거시건전성 규제입니다.</p>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">구분</th>
        <th class="border border-slate-200 p-2.5 font-bold">1단계 (과거)</th>
        <th class="border border-slate-200 p-2.5 font-bold">2단계 (2024~2025)</th>
        <th class="border border-slate-200 p-2.5 font-bold bg-blue-50 text-blue-900">3단계 (2026년 9월 전면 시행)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">스트레스 가산금리</td>
        <td class="border border-slate-200 p-2.5">0.38% (기본형 25%)</td>
        <td class="border border-slate-200 p-2.5">0.75% ~ 1.20% (수도권 차등)</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700 bg-blue-50/50">최대 1.50% ~ 1.75% (100% 반영)</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">적용 대상 대출</td>
        <td class="border border-slate-200 p-2.5">은행권 주택담보대출</td>
        <td class="border border-slate-200 p-2.5">은행권 주담대 + 신용대출 + 2금융 주담대</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700 bg-blue-50/50">전 금융권 주담대·신용대출·기타 대출 전면 확대</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">수도권 차등 규제</td>
        <td class="border border-slate-200 p-2.5">전국 동일</td>
        <td class="border border-slate-200 p-2.5">수도권 1.20% / 비수도권 0.75%</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700 bg-blue-50/50">수도권 주담대 1.50% 이상 초강력 적용</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">DSR 상한 비율</td>
        <td class="border border-slate-200 p-2.5">1금융 40% / 2금융 50%</td>
        <td class="border border-slate-200 p-2.5">1금융 40% 유지</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700 bg-blue-50/50">1금융 40% 엄격 적용 (예외 인정 축소)</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 연소득별 실제 대출 가능 한도 축소 시뮬레이션</h2>
<p>실제로 30년 만기 원리금균등분할상환(기본금리 4.0% 가정) 조건에서, 스트레스 DSR 3단계가 적용되었을 때 한도가 얼마나 줄어드는지 구체적인 수치로 비교해보겠습니다.</p>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">연간 소득</th>
        <th class="border border-slate-200 p-2.5 font-bold">기존 한도 (스트레스 미적용)</th>
        <th class="border border-slate-200 p-2.5 font-bold">2단계 한도 (1.2% 가산)</th>
        <th class="border border-slate-200 p-2.5 font-bold text-rose-700">3단계 한도 (1.5% 가산)</th>
        <th class="border border-slate-200 p-2.5 font-bold text-rose-700">최종 감소액</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">5,000만 원</td>
        <td class="border border-slate-200 p-2.5">약 3억 4,900만 원</td>
        <td class="border border-slate-200 p-2.5">약 3억 500만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">약 2억 9,400만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">- 5,500만 원 (-15.8%)</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">7,000만 원</td>
        <td class="border border-slate-200 p-2.5">약 4억 8,800만 원</td>
        <td class="border border-slate-200 p-2.5">약 4억 2,700만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">약 4억 1,200만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">- 7,600만 원 (-15.6%)</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">1억 원</td>
        <td class="border border-slate-200 p-2.5">약 6억 9,700만 원</td>
        <td class="border border-slate-200 p-2.5">약 6억 1,000만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">약 5억 8,900만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">- 1억 800만 원 (-15.5%)</td>
      </tr>
    </tbody>
  </table>
</div>
<p class="text-xs text-slate-500">* 기타 부채가 없는 순수 주담대 기준이며, 은행별 우대금리 및 세부 조건에 따라 다소 상이할 수 있습니다.</p>

<h2>3. 내 대출 한도를 사수하는 실전 5대 솔루션</h2>
<p>한도가 깎였다고 해서 무조건 계약을 포기할 수는 없습니다. 은행권 규정의 세부 틈새를 공략하여 가용 한도를 합법적으로 방어하는 5가지 실전 해법을 전수합니다.</p>

<ul>
  <li><b>전략 1. 주기형(5년 주기 고정금리) 또는 혼합형 선택하기:</b> 변동금리 대출은 스트레스 가산금리가 100% 반영되지만, 5년 이상 금리가 고정되는 '주기형 대출'은 가산금리 반영 비율이 대폭 감면(30~40% 수준)됩니다. 따라서 변동금리보다 주기형을 선택하는 것만으로 한도를 수천만 원 복구할 수 있습니다.</li>
  <li><b>전략 2. 대출 만기를 30년에서 35년 또는 40년으로 연장:</b> 매월 상환하는 원리금 규모가 분산되면서 DSR 40% 한도 내에 더 많은 대출 총액을 담을 수 있습니다. 만 39세 이하 청년 또는 신혼부부는 40년 만기 상품을 우선 검토하십시오.</li>
  <li><b>전략 3. 소액 마이너스통장 및 불필요한 신용대출 사전 상환:</b> 신용대출은 사용하지 않고 한도만 열려 있어도 DSR 산정 시 연간 원리금 상환 부담으로 잡힙니다. 주담대 신청 1주일 전 불필요한 마이너스통장을 해지하면 DSR 여력이 즉각 확보됩니다.</li>
  <li><b>전략 4. 주택금융공사 정책 모기지(디딤돌·보금자리론) 교차 검토:</b> 정책모기지는 시중은행의 스트레스 DSR 규제가 적용되지 않고 DTI 규제를 적용받으므로, 일반 은행 창구보다 한도가 훨씬 높게 산출됩니다. 주택가격 6억 원(신혼 9억 원) 이하 매물이라면 정책대출을 최우선으로 배치하십시오.</li>
  <li><b>전략 5. 하우징허브 대출 계산기로 사전 정밀 진단:</b> 상단 메뉴의 [진단 도구] - [대출 한도 계산기]를 활용하여 본인의 소득과 부채 조건을 대입하면 스트레스 DSR 3단계가 적용된 정확한 한도를 1분 만에 시뮬레이션할 수 있습니다.</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 이미 매매 계약서를 작성하고 계약금을 넣었는데, 스트레스 DSR 3단계가 소급 적용되나요?</h3>
<p>A. 아닙니다. 시행일 이전에 입주자모집공고가 난 분양 단지나, 시행일 이전에 부동산 매매계약을 체결하고 계약금을 납입한 사실이 공인중개사 날인 계약서 및 금융 이체 내역으로 증명되는 경우에는 종전 규정(2단계 또는 미적용)이 경과 규정으로 보호 적용됩니다.</p>

<h3>Q2. 맞벌이 부부의 경우 부부 소득을 합산하여 DSR을 계산할 수 있나요?</h3>
<p>A. 네, 가능합니다. 주택담보대출 취급 시 배우자의 소득을 합산할 수 있습니다. 다만, 배우자의 신용대출, 자동차 할부, 학자금 대출 등 모든 금융 부채도 함께 합산되므로 부부 중 부채가 적고 소득이 높은 조합을 면밀히 대조해야 합니다.</p>

<h3>Q3. 오피스텔이나 빌라(다세대)를 담보로 대출받을 때도 동일하게 적용되나요?</h3>
<p>A. 3단계 규제에서는 오피스텔 담보대출 역시 전면 적용 대상에 포함됩니다. 오피스텔은 통상 아파트보다 상환 만기가 짧게 설정되는 경향이 있어 DSR 한도 축소 타격이 더 클 수 있으므로 분할상환 기간 설정을 은행과 긴밀히 협의해야 합니다.</p>`,
    hashtags: ["스트레스DSR", "주택담보대출", "DSR3단계", "대출한도", "부동산금융", "하우징허브"]
  },
  {
    id: "post-20260927-sub84",
    title: "2026년 가을 분양 성수기 청약홈 완전 개편 분석: 무주택 가점 84점 만점표와 신혼·신생아 우선배정 완벽 공략",
    category: "청약-분양",
    author: "하우징허브",
    date: "2026-09-27",
    time: "14:30:22",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    excerpt: "9월 가을 분양 성수기를 맞아 청약홈의 신혼부부·신생아 특별공급 우선배정 비율 확대와 배우자 청약통장 가입기간 합산 제도가 본격 정착되었습니다. 부적격 0%를 위한 84점 가점표 정밀 계산법과 실전 당첨 가이드를 정리했습니다.",
    content: `<p>본격적인 가을 분양 성수기가 시작되면서 수도권 핵심 입지의 아파트들이 잇따라 입주자모집공고를 발표하고 있습니다. 특히 2026년 하반기 청약 제도는 저출생 대책의 일환으로 개편된 <b>신생아 우선배정, 부부 중복 청약 허용, 배우자 통장 가입 기간 합산(최대 3점)</b>이 완전히 정착된 첫 가을 시즌입니다.</p>

<p>하지만 많은 청약 대기자들이 바뀐 규정을 명확히 숙지하지 못해 잘못된 가점을 기재했다가, 귀중한 당첨 자격을 박탈당하고 최장 1년간 청약 통장 사용이 정지되는 비극을 겪고 있습니다. 오늘 하우징허브 청약분석실에서는 84점 만점표 산정 원칙과 특별공급 당첨 확률을 2배로 끌어올리는 실무 전략을 총정리해 드립니다.</p>

<h2>1. 2026년 주택청약 가점표 84점 만점 완벽 해부</h2>
<p>민영주택 일반공급의 당락을 가르는 가점제는 3가지 항목(총 84점 만점)으로 구성됩니다. 단 1점 차이로 수만 명의 등수가 엇갈리는 만큼 공식 기준을 오차 없이 계산해야 합니다.</p>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">평가 항목</th>
        <th class="border border-slate-200 p-2.5 font-bold">배점 한도</th>
        <th class="border border-slate-200 p-2.5 font-bold">가점 산정 세부 기준</th>
        <th class="border border-slate-200 p-2.5 font-bold">주의할 점 (실수 다발)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">1. 무주택 기간</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">최대 32점</td>
        <td class="border border-slate-200 p-2.5">1년 미만(2점)부터 매년 2점씩 가산, 15년 이상 시 32점 만점</td>
        <td class="border border-slate-200 p-2.5 text-rose-600">만 30세부터 기산 (단, 만 30세 이전 혼인신고 시 혼인신고일부터 기산)</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">2. 부양가족 수</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">최대 35점</td>
        <td class="border border-slate-200 p-2.5">0명(5점)부터 1인당 5점씩 가산, 6명 이상 시 35점 만점</td>
        <td class="border border-slate-200 p-2.5 text-rose-600">직계존속은 3년 이상 주민등록등본상 계속 동거해야 인정</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">3. 청약통장 가입기간</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">최대 17점</td>
        <td class="border border-slate-200 p-2.5">6개월 미만(1점)부터 매년 1점씩 가산, 15년 이상 시 17점 만점</td>
        <td class="border border-slate-200 p-2.5 text-rose-600">배우자 통장 보유기간 50%(최대 3점) 합산 신청 가능</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 2026년 가을 청약 당첨을 위한 3대 핵심 공략 포인트</h2>
<ul>
  <li><b>부부 중복 청약 적극 활용:</b> 동일 단지에 부부가 동시에 일반공급 또는 특별공급을 각각 청약할 수 있습니다. 둘 다 당첨될 경우 먼저 접수된 청약 건이 유효하게 처리되므로 당첨 확률이 실질적으로 2배가 됩니다.</li>
  <li><b>신혼부부 소득 기준 대폭 완화:</b> 맞벌이 가구의 경우 도시근로자 월평균 소득의 200%까지 특별공급 신청 자격이 열려 있습니다. 고소득 전문직 부부라도 가점 부족 시 추첨제 물량을 노려볼 수 있습니다.</li>
  <li><b>미성년자 납입 인정 기간 확대:</b> 자녀가 만 14세부터 납입한 최대 5년(최대 60회차) 기간이 성인이 된 후 온전히 인정되므로, 자녀 청약 계좌를 조기에 활성화해 주는 것이 장기적으로 유리합니다.</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 오피스텔을 분양받아 보유하고 있는 경우 무주택자로 인정되나요?</h3>
<p>A. 네, 건축법상 업무시설에 해당하는 주거용 오피스텔은 청약 시 주택으로 보지 않으므로 무주택 자격이 유지됩니다. 다만 분양권이나 입주권(아파트)의 경우 공급계약 체결일로부터 유주택자로 간주되니 혼동하지 않도록 주의하십시오.</p>

<h3>Q2. 배우자의 과거 청약 당첨 이력이 있으면 특별공급에 아예 넣을 수 없나요?</h3>
<p>A. 규정 개편으로 결혼 전 배우자의 청약 당첨 이력은 배제됩니다. 즉, 혼인 전 배우자가 주택 청약에 당첨된 적이 있더라도, 신청자 본인이 무주택 요건을 갖추었다면 신혼부부·생애최초 특별공급에 지원할 수 있습니다.</p>

<h3>Q3. 청약 당일 가점을 잘못 입력해 당첨된 경우 사후 수정이 가능한가요?</h3>
<p>A. 불가능합니다. 당첨자 서류 검수 과정에서 입력한 가점보다 실제 입증 서류상의 점수가 낮으면 '부적격 당첨'으로 자동 취소되며, 수도권은 1년간 청약 신청이 전면 제한됩니다. 접수 전 반드시 가족관계증명서와 등본을 떼어 직접 확인해야 합니다.</p>`,
    hashtags: ["주택청약", "청약홈", "청약가점", "신혼부부특공", "신생아특례", "내집마련"]
  },
  {
    id: "post-20260926-hug126",
    title: "전세보증보험 HUG 가입 기준 126% 룰 실무 계산법: 공시가격 하락 시 전세 안전도 진단과 임대인 역전세 협상법",
    category: "전월세",
    author: "하우징허브",
    date: "2026-09-26",
    time: "09:40:15",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
    excerpt: "공시가격의 126%(공시가격 140% × 전세가율 90%)를 초과하면 HUG 반환보증 가입이 거절됩니다. 전세 만기를 앞둔 세입자가 역전세 위험을 피하고 보증금을 안전하게 돌려받기 위한 감정평가 활용법과 임대인 보증금 일부 반환 협상 스킬을 전수합니다.",
    content: `<p>빌라와 오피스텔, 다세대 주택에 거주하는 임차인들에게 가장 무서운 단어는 단연 <b>'126% 룰'</b>입니다. 주택도시보증공사(HUG)와 서울보증보험(SGI)이 전세보증금 반환보증 가입 기준을 <b>'공시가격의 140%에 전세가율 90%'</b>로 제한하면서, 계산상 공시가격의 126%를 1원이라도 초과하는 전세계약은 보증보험 가입이 원천 거절되기 때문입니다.</p>

<p>특히 2년 전 높은 전세가율로 계약했던 빌라들의 만기가 도래하는 2026년 현재, 임대인이 "다음 세입자가 126% 기준 때문에 안 구해져서 보증금을 못 돌려준다"고 버티는 역전세 분쟁이 급증하고 있습니다. 내 소중한 보증금을 한 푼도 떼이지 않고 온전히 회수하는 실무 매뉴얼을 공개합니다.</p>

<h2>1. HUG 보증보험 126% 룰 산정 공식과 실제 사례</h2>
<p>보증보험 가입 가능 여부는 다음 공식에 따라 기계적으로 판정됩니다.</p>

<div class="p-4 bg-slate-100 rounded-lg text-slate-800 font-mono text-sm my-3 border border-slate-300">
  <b>보증금 상한선 = 주택 공시가격 × 140% (주택가격 인정비율) × 90% (전세가율) = 공시가격 × 126%</b>
</div>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">주택 공시가격</th>
        <th class="border border-slate-200 p-2.5 font-bold">HUG 인정 주택가격 (140%)</th>
        <th class="border border-slate-200 p-2.5 font-bold text-blue-700">최대 보증 가능 금액 (126%)</th>
        <th class="border border-slate-200 p-2.5 font-bold text-rose-700">기존 전세 2억 원일 때 보증 차액</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">1억 2,000만 원</td>
        <td class="border border-slate-200 p-2.5">1억 6,800만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">1억 5,120만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">4,880만 원 초과 (가입 불가)</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">1억 5,000만 원</td>
        <td class="border border-slate-200 p-2.5">2억 1,000만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">1억 8,900만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">1,100만 원 초과 (가입 불가)</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">1억 6,000만 원</td>
        <td class="border border-slate-200 p-2.5">2억 2,400만 원</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">2억 160만 원</td>
        <td class="border border-slate-200 p-2.5 text-emerald-700 font-bold">전액 가입 가능 (통과)</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 126% 초과 시 임차인의 실전 생존 대응법</h2>
<ul>
  <li><b>HUG 공인 감정평가 제도 활용:</b> 공시가격이 지나치게 낮게 산정된 신축·준신축 주택이라면, HUG가 지정한 공인 감정평가법인의 감정가를 통해 주택가격을 상향 인정받아 보증에 가입할 수 있는 통로가 열려 있습니다.</li>
  <li><b>초과분 월세 전환(반전세) 협상:</b> 만기 시 임대인이 전세보증금 전액을 돌려주기 어렵다면, 126% 기준에 맞춘 금액만 신규 전세로 세팅하고 나머지 차액은 임대인에게 분할 상환 확약서를 받거나 월세로 전환하여 보증보험을 살려야 합니다.</li>
  <li><b>만기 3개월 전 내용증명 필수 발송:</b> 임대차 만기 후 보증금을 반환하지 않을 경우를 대비해, 계약 갱신 거절 및 만기일 반환 요구를 담은 내용증명을 우체국을 통해 미리 발송해 두어야 임차권등기명령 신청 요건을 갖출 수 있습니다.</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 계약 당시에는 126% 이내였는데, 갱신 시점에 공시가격이 떨어져서 126%를 초과하면 보증 연장이 안 되나요?</h3>
<p>A. HUG는 기존 가입자에 한해 갱신 시 전세가율 90% 대신 완화된 기준을 적용하는 경과 조치를 두고 있습니다. 단, 보증금을 증액하지 않는 조건이어야 하므로 만기 1개월 전 HUG 지사에 기존 계약 갱신 특례 적용 여부를 확인해야 합니다.</p>

<h3>Q2. 아파트도 126% 룰이 적용되나요?</h3>
<p>A. 아파트는 KB부동산 시세나 한국부동산원 시세가 우선 적용됩니다. KB시세의 90% 이내이면 보증보험 가입이 가능하며, 공시가격 126% 룰은 KB시세가 없는 나홀로 아파트나 다세대·연립·빌라에 주로 엄격하게 적용됩니다.</p>

<h3>Q3. 집주인이 임대사업자인데 보증보험 가입을 미루고 있으면 어떻게 하나요?</h3>
<p>A. 등록임대사업자는 민간임대주택에 관한 특별법에 따라 보증보험 가입이 법적 의무사항입니다. 미가입 시 임대인에게 보증금의 최대 10%에 달하는 과태료가 부과되므로, 관할 구청 주택과에 임대사업자 보증 미가입 신고를 진행할 수 있습니다.</p>`,
    hashtags: ["HUG보증보험", "126룰", "역전세", "전세보증금반환", "임차권등기", "하우징허브"]
  },
  {
    id: "post-20260925-move30",
    title: "아파트 입주·이사 전 필수 체크리스트 30선: 잔금 납부, 관리비 정산, 하자보수 내용증명 발송 실전 가이드",
    category: "이사-인테리어",
    author: "하우징허브",
    date: "2026-09-25",
    time: "11:20:00",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    excerpt: "이사 당일에는 수억 원의 잔금과 수많은 행정 절차가 동시에 맞물립니다. 선수관리비 정산, 장기수선충당금 반환, 도시가스 검침, 사전점검 하자보수 이행 확약서 작성까지 놓치면 수백만 원 손해 보는 실전 체크리스트를 체계적으로 정리했습니다.",
    content: `<p>이사 당일은 정신없이 지나갑니다. 이삿짐 사다리차가 오르내리고, 매도인·임대인과 수억 원의 잔금을 송금하며, 공인중개사 복비를 정산하는 동안 정작 챙겨야 할 핵심 행정 절차를 놓치기 십상입니다. 실제로 이사 후 며칠이 지나서야 "도시가스 명의 변경을 안 해서 전 세입자 요금을 물었다", "장기수선충당금 80만 원을 돌려받지 못했다"며 발을 동동 구르는 사례가 허다합니다.</p>

<p>하우징허브 주거실무팀이 수백 건의 이사 현장 데이터를 바탕으로, 이사 전후 3일간 절대 놓쳐서는 안 될 필수 점검 리스트와 법적 방어책을 정리했습니다.</p>

<h2>1. 이사 당일 타임라인별 필수 행정 과업표</h2>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">시간대</th>
        <th class="border border-slate-200 p-2.5 font-bold">핵심 점검 과업</th>
        <th class="border border-slate-200 p-2.5 font-bold">담당 주체</th>
        <th class="border border-slate-200 p-2.5 font-bold">증빙 및 확인 서류</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">오전 08:00</td>
        <td class="border border-slate-200 p-2.5">공과금 계량기 검침 (수도, 전기, 도시가스 계량기 사진 촬영)</td>
        <td class="border border-slate-200 p-2.5">본인 및 이사팀</td>
        <td class="border border-slate-200 p-2.5">계량기 수치 사진 보관</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">오전 10:00</td>
        <td class="border border-slate-200 p-2.5">관리사무소 방문: 관리비 일할 정산 및 장기수선충당금 수령</td>
        <td class="border border-slate-200 p-2.5">관리사무소·임대인</td>
        <td class="border border-slate-200 p-2.5 text-blue-700 font-bold">장기수선충당금 납부 확인서</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">오전 11:30</td>
        <td class="border border-slate-200 p-2.5">잔금 송금 전 등기부등본 최종 열람 (을구 근저당 변동 확인)</td>
        <td class="border border-slate-200 p-2.5">공인중개사·법무사</td>
        <td class="border border-slate-200 p-2.5 text-rose-700 font-bold">잔금 당일 발행 등기사항전부증명서</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">오후 02:00</td>
        <td class="border border-slate-200 p-2.5">새 집 전입신고 및 확정일자 부여 (정부24 또는 주민센터)</td>
        <td class="border border-slate-200 p-2.5">임차인 본인</td>
        <td class="border border-slate-200 p-2.5 text-emerald-700 font-bold">주민등록등본 및 확정일자 날인 계약서</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">오후 04:00</td>
        <td class="border border-slate-200 p-2.5">도시가스 연결 기사 방문 및 안전점검, 자동이체 등록</td>
        <td class="border border-slate-200 p-2.5">도시가스 공급사</td>
        <td class="border border-slate-200 p-2.5">가스 공급 안전점검표</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 세입자가 놓치면 피눈물 나는 돈: 장기수선충당금</h2>
<p>아파트 관리비 고지서에 매달 청구되는 <b>'장기수선충당금'</b>은 아파트 주요 시설의 수리와 교체를 위해 적립하는 돈으로, 공동주택관리법상 원칙적으로 집주인이 부담해야 합니다. 하지만 거주 기간 동안 세입자가 관리비에 포함해 대신 납부해 왔으므로, 이사 당일 임대인에게 전액 반환을 청구해야 합니다.</p>
<p>2년 계약 기준 아파트 평형에 따라 적게는 40만 원에서 많게는 100만 원 이상 환급받을 수 있습니다. 관리사무소 경리 창구에서 "이사 정산용 장기수선충당금 납부확인서"를 발급받아 임대인에게 제시하면 즉시 정산받을 수 있습니다.</p>

<h2>3. 잔금 치르기 전 마지막 5분 확인: 등기부 을구 재열람</h2>
<p>가장 치명적인 전세 사고는 <b>'계약일과 잔금일 사이'</b>에 집주인이 대출을 받아 근저당을 설정하는 경우입니다. 계약 당시 깨끗했던 등기부라도 잔금 지급 당일 아침 인터넷등기소(iros.go.kr)에서 반드시 열람일시(초 단위까지 표시됨)를 확인하고 잔금을 이체해야 대항력 1순위를 보장받을 수 있습니다.</p>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 전입신고를 금요일 오후 늦게 주민센터에 했는데 대항력은 언제 발생하나요?</h3>
<p>A. 주택임대차보호법상 대항력은 주민등록(전입신고)과 주택의 인도(이사)를 모두 마친 다음 날 0시부터 발생합니다. 만약 금요일에 전입신고를 마쳤다면 토요일 0시부터 제3자에 대한 대항력이 발생합니다.</p>

<h3>Q2. 새로 이사 간 집에 누수나 결로 하자가 발견되었을 때 수리비는 누가 부담하나요?</h3>
<p>A. 민법 제623조에 따라 임대인은 목적물을 임차인이 사용·수익할 수 있는 상태로 유지할 수선의무를 집니다. 주요 배관 누수, 보일러 고장, 심각한 결로 등은 임대인이 전액 수리해야 하며, 입주 직후 사진과 동영상을 촬영해 집주인에게 즉각 통보해야 분쟁을 방지할 수 있습니다.</p>

<h3>Q3. 선수관리비(관리비 예치금)는 누가 내는 돈인가요?</h3>
<p>A. 신축 아파트 첫 입주 시 또는 기존 아파트 매매 시 발생하는 선수관리비는 주택 소유자(집주인)가 관리사무소에 예치하는 금액입니다. 전세 세입자는 선수관리비 부담 의무가 없으며 매매 거래 시에만 매수인이 매도인에게 승계 정산합니다.</p>`,
    hashtags: ["이사체크리스트", "장기수선충당금", "전입신고", "확정일자", "등기부등본", "하우징허브"]
  },
  {
    id: "post-20260924-didimdol",
    title: "디딤돌·버팀목 전세자금대출 소득 기준 완화와 대환대출 인프라: 1%대 저금리 갈아타기 성공 수기 및 주의점",
    category: "대출-금융",
    author: "하우징허브",
    date: "2026-09-24",
    time: "15:10:45",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=800",
    excerpt: "신혼부부 및 다자녀 가구를 위한 정책대출 소득 요건이 대폭 완화되면서 시중은행의 4~5%대 고금리 대출을 1~2%대 기금 대출로 갈아타는 대환 수요가 급증했습니다. 중도상환수수료 면제 조건과 대환대출 인프라 앱 신청 절차를 공유합니다.",
    content: `<p>고금리 기조가 장기화되면서 매달 나가는 주택담보대출과 전세대출 이자는 가계 경제의 가장 큰 부담입니다. 하지만 2026년 들어 정부가 주택도시기금의 대표 서민 금융 상품인 <b>디딤돌 대출(구입자금)</b>과 <b>버팀목 대출(전세자금)</b>의 소득 요건을 신혼부부 및 다자녀 가구 중심으로 대폭 완화하면서, 연 1~2%대 저금리로 갈아탈 수 있는 기회의 문이 열렸습니다.</p>

<p>특히 온라인 '대환대출 인프라'를 통해 은행 영업점에 방문하지 않고도 스마트폰 터치 몇 번으로 기존 고금리 대출을 저금리 정책 상품으로 대환하는 실수요자들이 크게 늘고 있습니다. 성공적인 대환을 위한 실무 자격 조건과 이자 절감 계산표를 정리했습니다.</p>

<h2>1. 2026년 주택도시기금 정책대출 소득 기준 완화 내역</h2>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">상품명</th>
        <th class="border border-slate-200 p-2.5 font-bold">기존 소득 기준</th>
        <th class="border border-slate-200 p-2.5 font-bold text-blue-700">2026년 완화 소득 기준</th>
        <th class="border border-slate-200 p-2.5 font-bold text-emerald-700">적용 금리 대역</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">신혼부부 디딤돌 대출 (구입)</td>
        <td class="border border-slate-200 p-2.5">부부합산 연 8,500만 원 이하</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">부부합산 연 1억 원 이하 (신생아 가구 1.3억)</td>
        <td class="border border-slate-200 p-2.5 text-emerald-700 font-bold">연 2.15% ~ 3.25%</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">신혼부부 버팀목 대출 (전세)</td>
        <td class="border border-slate-200 p-2.5">부부합산 연 7,500만 원 이하</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">부부합산 연 1억 원 이하</td>
        <td class="border border-slate-200 p-2.5 text-emerald-700 font-bold">연 1.80% ~ 2.70%</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">신생아 특례 버팀목 대출</td>
        <td class="border border-slate-200 p-2.5">부부합산 연 1.3억 원 이하</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">부부합산 연 2억 원 이하 (대폭 확대)</td>
        <td class="border border-slate-200 p-2.5 text-emerald-700 font-bold">연 1.10% ~ 3.00%</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 2억 원 대환 시 실질 월 이자 절감 효과</h2>
<p>시중은행에서 연 4.5% 전세대출(만기일시상환 2억 원)을 이용하던 차주가 버팀목 전세대출 연 2.2%로 대환했을 때의 금융 비용 절감액은 놀랍습니다.</p>
<ul>
  <li><b>기존 시중은행 (연 4.5%):</b> 매월 이자 75만 원 (연간 900만 원)</li>
  <li><b>버팀목 대환 후 (연 2.2%):</b> 매월 이자 약 36만 7천 원 (연간 440만 원)</li>
  <li><b>순 절감액:</b> <b>매월 38만 3천 원 절약 (2년간 총 920만 원 절감)</b></li>
</ul>

<h2>3. 대환 신청 전 반드시 체크해야 할 3가지 주의점</h2>
<ul>
  <li><b>주택가격 및 전세보증금 상한:</b> 디딤돌은 담보주택 가격 5억 원(신혼 6억), 전용 85㎡ 이하이어야 하며, 버팀목은 수도권 전세보증금 3억 원(신혼 4억) 이하여야 합니다. 보증금이 1원이라도 초과하면 신청 자체가 불가능합니다.</li>
  <li><b>순자산 가액 심사:</b> 2026년 기준 소득뿐 아니라 부부 합산 순자산 가액이 소상공인 자산 요건(구입 5.11억, 전세 3.45억 수준)을 초과할 경우 가산금리가 부과되거나 대출이 거절됩니다.</li>
  <li><b>중도상환수수료 여부:</b> 기존 대출을 받은 지 3년이 경과했다면 중도상환수수료가 100% 면제되지만, 3년 이내라면 통상 0.5~1.2%의 중도상환수수료가 발생하므로 이자 절감액과 비교 계산해야 합니다.</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 기존에 은행 일반 전세대출을 받고 살고 있는 도중에도 버팀목으로 갈아탈 수 있나요?</h3>
<p>A. 네, 가능합니다. 이를 '기금 전세대출 대환'이라 부릅니다. 임대차 계약 체결일로부터 3개월 이내이거나, 계약을 갱신하는 시점에 주택도시기금 버팀목 대출로 전환 신청을 진행할 수 있습니다.</p>

<h3>Q2. 대환대출 인프라 앱으로 신청하면 심사 기간은 얼마나 걸리나요?</h3>
<p>A. 주택도시보증공사(HUG) 또는 한국주택금융공사(HF)의 자격 심사 및 보증서 발급에 통상 2~3주가 소요됩니다. 따라서 기존 대출 만기 최소 1달 전에는 신청을 완료해야 안전합니다.</p>

<h3>Q3. 프리랜서나 개인사업자도 정책대출 소득 인정이 가능한가요?</h3>
<p>A. 국세청에서 발급하는 전년도 소득금액증명원을 통해 소득을 공식 증빙할 수 있습니다. 사업자등록 1년 미만인 경우 신용카드 사용액이나 건강보험료 납부액을 환산소득으로 활용할 수 있는 예외 규정이 있습니다.</p>`,
    hashtags: ["디딤돌대출", "버팀목대출", "대환대출", "신생아특례", "주택도시기금", "하우징허브"]
  },
  {
    id: "post-20260923-sub25",
    title: "청약통장 월 납입 인정 한도 25만 원 상향 실전 활용법: 공공분양 당첨 합격선과 청약예금 전환 최적 타이밍",
    category: "청약-분양",
    author: "하우징허브",
    date: "2026-09-23",
    time: "10:05:12",
    readTime: "7분",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    excerpt: "41년 만에 청약통장 월 납입 인정액이 10만 원에서 25만 원으로 상향되었습니다. 공공분양 일반공급 당첨선이 어떻게 재편되는지, 매월 25만 원을 납입할 때의 세액공제 혜택과 민영주택 전환 전략을 꼼꼼하게 비교 분석했습니다.",
    content: `<p>1983년 이후 무려 41년간 월 10만 원으로 묶여 있던 <b>주택청약종합저축 월 납입 인정 한도가 25만 원으로 공식 상향</b>되었습니다. 이에 따라 공공분양(LH, SH, GH) 일반공급의 당첨 자격인 '저축 총액 인정 기준'이 급격한 변곡점을 맞이하고 있습니다.</p>

<p>지금까지는 매달 10만 원씩 15~20년을 꼬박 부어야 공공분양 인기 단지 당첨선인 1,800만~2,500만 원에 도달할 수 있었지만, 이제 매월 25만 원을 납입하는 가입자는 저축 총액을 2.5배 빠른 속도로 누적할 수 있게 되었습니다. 변화된 청약 납입 전략의 핵심을 짚어드립니다.</p>

<h2>1. 공공분양 당첨선 변화 예측과 25만 원 납입 시뮬레이션</h2>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">납입 플랜</th>
        <th class="border border-slate-200 p-2.5 font-bold">월 납입액</th>
        <th class="border border-slate-200 p-2.5 font-bold">5년 누적 인정액</th>
        <th class="border border-slate-200 p-2.5 font-bold text-blue-700">10년 누적 인정액</th>
        <th class="border border-slate-200 p-2.5 font-bold">수도권 공공분양 도달 시점</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">종전 방식 유지</td>
        <td class="border border-slate-200 p-2.5">10만 원</td>
        <td class="border border-slate-200 p-2.5">600만 원</td>
        <td class="border border-slate-200 p-2.5">1,200만 원</td>
        <td class="border border-slate-200 p-2.5 text-slate-500">약 16~18년 소요 (당첨선 2,000만 기준)</td>
      </tr>
      <tr class="bg-blue-50/60 font-semibold">
        <td class="border border-slate-200 p-2.5 text-blue-900">25만 원 상향 납입</td>
        <td class="border border-slate-200 p-2.5 text-blue-900">25만 원</td>
        <td class="border border-slate-200 p-2.5 text-blue-900">1,500만 원</td>
        <td class="border border-slate-200 p-2.5 text-blue-700 font-bold">3,000만 원</td>
        <td class="border border-slate-200 p-2.5 text-blue-800 font-bold">약 6~7년으로 대폭 단축</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 연말정산 소득공제 300만 원 혜택 완벽 연계</h2>
<p>총급여 7,000만 원 이하 무주택 세대주는 연간 청약 납입액(최대 300만 원 한도)의 40%인 <b>120만 원까지 소득공제</b>를 받을 수 있습니다. 월 25만 원씩 12개월을 납입하면 정확히 300만 원 한도를 100% 채울 수 있어, 공공분양 가점 누적과 연말정산 세금 환급이라는 두 마리 토끼를 완벽하게 잡을 수 있습니다.</p>

<h2>3. 어떤 사람이 25만 원으로 올려야 할까?</h2>
<ul>
  <li><b>추천 대상:</b> 3기 신도시, 공공택지 공공분양 일반공급 당첨을 노리는 무주택자, 연말정산 공제 혜택이 절실한 근로소득자.</li>
  <li><b>기존 유지 추천 대상:</b> 민영주택 특별공급(신혼·생초·다자녀)이나 가점제 위주로만 청약할 분들은 저축 총액이 무의미하며, 지역별 예치 기준금액(서울 300만~1,500만 원)만 충족하면 되므로 무리해서 25만 원을 넣을 필요가 없습니다.</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 기존에 자동이체를 10만 원 걸어두었는데 자동으로 25만 원으로 바뀌나요?</h3>
<p>A. 아닙니다. 거래 은행(국민, 신한, 우리, 하나, 농협 등) 스마트뱅킹 앱이나 영업점을 통해 청약통장 자동이체 금액을 직접 25만 원으로 변경 신청해야 합니다.</p>

<h3>Q2. 과거 청약저축, 청약예금 가입자도 청약종합저축으로 전환할 수 있나요?</h3>
<p>A. 네, 정부 규정 개정에 따라 종전 청약저축·부금·예금 가입자가 모든 주택 유형에 청약 가능한 '주택청약종합저축'으로 전환할 수 있으며, 기존 납입 실적과 기간은 온전히 승계 인정됩니다.</p>

<h3>Q3. 매달 25만 원을 납입하다가 경제 사정이 어려워지면 다시 10만 원으로 낮출 수 있나요?</h3>
<p>A. 언제든지 자유롭게 납입 금액을 변경할 수 있으며, 일시적으로 미납하더라도 통장 자격이 박탈되지 않고 추후 분할 입금하여 회차를 인정받을 수 있습니다.</p>`,
    hashtags: ["청약통장", "25만원상향", "공공분양", "연말정산소득공제", "청약홈", "하우징허브"]
  },
  {
    id: "post-20260922-rentrenew",
    title: "임대차 계약 갱신청구권 행사와 집주인 실거주 입증 의무: 갱신 거절 손해배상 청구 소송과 실전 합의 노하우",
    category: "전월세",
    author: "하우징허브",
    date: "2026-09-22",
    time: "13:45:50",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
    excerpt: "집주인이 '직접 들어가 살겠다'며 계약 갱신을 거부한 후 제3자에게 전세를 놓거나 매도하는 사례가 빈번합니다. 대법원 판례에 따른 실거주 입증 책임, 확정일자 부여현황 열람 방법, 법정 손해배상액 산정 공식을 명쾌하게 해설합니다.",
    content: `<p>"만기 때 저희 부모님이 들어와서 사실 예정이니 방을 빼주세요." 전세계약 만기를 앞둔 세입자들이 가장 자주 듣는 말입니다. 주택임대차보호법 제6조의3에 따르면 임차인은 1회에 한해 계약갱신요구권을 행사할 수 있지만, 임대인(직계존비속 포함)이 <b>실제 거주하려는 경우</b>에는 세입자의 갱신 요구를 거절할 수 있기 때문입니다.</p>

<p>그러나 최근 대법원 판례는 단순히 "내가 들어가 살겠다"는 말만으로는 부족하며, 임대인이 실거주 의사를 객관적으로 입증해야 한다고 명확히 판시했습니다. 또한 실거주를 이유로 세입자를 내보낸 뒤 제3자에게 집을 임대하거나 매도할 경우 막대한 손해배상 책임을 지게 됩니다. 허위 실거주를 판별하고 권리를 찾는 방법을 정리합니다.</p>

<h2>1. 집주인 실거주 거절 후 사후 모니터링 3단계</h2>
<p>억울하게 쫓겨났더라도 아래 3단계를 거치면 집주인의 위법 행위를 적발해 손해배상을 청구할 수 있습니다.</p>

<ul>
  <li><b>1단계. 이사 직후 확정일자 부여현황 열람:</b> 주택임대차보호법에 따라 계약 갱신을 거절당한 임차인은 이사 후에도 해당 주택의 주민센터를 방문해 <b>'확정일자 부여현황(임대차 정보제공 내역)'</b>을 정당하게 발급받을 수 있습니다. 여기에 새로운 세입자의 확정일자가 찍혀 있다면 100% 허위 실거주 적발입니다.</li>
  <li><b>2단계. 전입세대확인서 열람:</b> 실제로 집주인이 전입신고를 하고 거주하고 있는지 주민센터에서 전입세대확인서를 떼어 전입 여부를 확인합니다.</li>
  <li><b>3단계. 등기부등본 확인:</b> 실거주하지 않고 제3자에게 매도했는지 여부를 대법원 인터넷등기소에서 확인합니다.</li>
</ul>

<h2>2. 주택임대차보호법상 법정 손해배상금 산정 공식</h2>
<p>허위 실거주로 밝혀진 경우, 세입자는 다음 세 가지 금액 중 <b>가장 큰 금액</b>을 집주인에게 손해배상금으로 청구할 수 있습니다.</p>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">산정 기준</th>
        <th class="border border-slate-200 p-2.5 font-bold">법적 계산 산식</th>
        <th class="border border-slate-200 p-2.5 font-bold">사례 예시 (보증금 3억 전세)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">1. 3개월분 환산월세</td>
        <td class="border border-slate-200 p-2.5">갱신 거절 당시 환산월차임의 3개월분</td>
        <td class="border border-slate-200 p-2.5">약 300만 ~ 375만 원</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">2. 신규 임대료 차액 2년분</td>
        <td class="border border-slate-200 p-2.5">(신규 세입자 월차임 - 기존 월차임) × 24개월</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">전세 3억 → 3.8억 인상 시 약 400만~600만 원</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">3. 실제 발생한 손해액</td>
        <td class="border border-slate-200 p-2.5">이사비 + 부동산 중개수수료 + 새 전세대출 이자 차액 등</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">증빙 영수증 일체 합산 (통상 500만~800만 원)</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 갱신청구권은 언제까지 집주인에게 통보해야 하나요?</h3>
<p>A. 임대차 기간이 끝나기 6개월 전부터 2개월 전까지의 기간 내에 임대인에게 도달해야 합니다. 문자메시지, 카카오톡, 통화 녹취, 또는 내용증명을 활용하여 증거를 남겨두어야 합니다.</p>

<h3>Q2. 집주인이 실거주하겠다고 해서 이사 나왔는데, 집을 비워두고 매물로 내놓은 상태입니다. 손해배상이 되나요?</h3>
<p>A. 네, 실거주 의사 없이 공실 상태로 매물로 내놓거나 제3자에게 매도한 경우에도 세입자를 부당하게 기망하여 갱신권을 침해한 것으로 보아 민법 제750조 불법행위 손해배상 청구가 인정된 법원 판례가 확립되어 있습니다.</p>

<h3>Q3. 집주인이 실거주하다가 6개월 만에 직장 이동으로 불가피하게 이사 나간 경우는 어떻게 되나요?</h3>
<p>A. 해외 이민, 지방 발령, 질병 치료 등 법령이 인정하는 '정당한 사유'가 객관적으로 입증되면 손해배상 책임이 면제될 수 있습니다. 그러나 단순 변심이나 시세 차익 목적이었다면 정당한 사유로 인정되지 않습니다.</p>`,
    hashtags: ["계약갱신청구권", "실거주입증", "전세손해배상", "임대차3법", "확정일자부여현황", "하우징허브"]
  },
  {
    id: "post-20260921-interior",
    title: "인테리어 턴키 계약서 특약 작성법: 공사 지연 배상금(지체상금), 자재 변경 동의권, 하자보수이행증권 발급 요령",
    category: "이사-인테리어",
    author: "하우징허브",
    date: "2026-09-21",
    time: "09:15:30",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
    excerpt: "인테리어 공사 중 추가 공사비 요구, 공기 지연, 부실시공으로 고통받는 소비자가 많습니다. 공정거래위원회 표준계약서 필수 조항과 지체상금율(1일 1000분의 1~2), 서울보증보험 하자이행보증증권 수령법까지 실전 방어 특약을 공개합니다.",
    content: `<p>아파트 매수나 입주를 앞두고 수천만 원을 들여 인테리어 턴키 공사를 진행하다가, 공사가 차일피일 미뤄져 입주 날짜에 길바닥에 나앉거나, 듣도 보도 못한 자재로 엉터리 시공을 당해 눈물 흘리는 피해 사례가 한국소비자원에 매년 수천 건씩 접수됩니다.</p>

<p>인테리어 사기를 예방하는 유일한 방패는 <b>'정교하게 작성된 표준계약서와 특약사항'</b>입니다. 계약서에 단 몇 줄의 특약을 적어 넣는 것만으로도 시공 업체의 태도가 180도 달라집니다. 업계 전문가들이 절대 먼저 알려주지 않는 3대 필수 특약 작성법을 안내합니다.</p>

<h2>1. 인테리어 계약서에 반드시 넣어야 할 3대 안전 특약</h2>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">특약 명칭</th>
        <th class="border border-slate-200 p-2.5 font-bold">표준 문구 가이드</th>
        <th class="border border-slate-200 p-2.5 font-bold">법적 효력 및 보호 기능</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold text-rose-700">1. 공사 지체상금 특약</td>
        <td class="border border-slate-200 p-2.5 font-mono text-xs">"시공사의 귀책사유로 준공 기일을 초과할 경우, 지체 1일당 총 공사금액의 1,000분의 2(0.2%)를 잔금에서 차감한다."</td>
        <td class="border border-slate-200 p-2.5">공사 지연을 방지하고, 이사 일정 차질에 따른 호텔비·보관이사 비용을 잔금에서 상계</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold text-blue-700">2. 자재 변경 사전동의권</td>
        <td class="border border-slate-200 p-2.5 font-mono text-xs">"견적서에 명시된 자재의 제조사 및 모델명을 임의 변경할 수 없으며, 단종 시 발주자의 서면 동의를 얻어 동급 이상으로 교체한다."</td>
        <td class="border border-slate-200 p-2.5">저가 중국산 유사 자재 바꿔치기 시공 및 추가금 강요 원천 차단</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold text-emerald-700">3. 하자이행보증증권 발급</td>
        <td class="border border-slate-200 p-2.5 font-mono text-xs">"잔금 지급과 동시에 시공사는 서울보증보험(SGI)이 발행한 하자보수보증보험증권(공사금액의 10%, 1년 이상)을 제출한다."</td>
        <td class="border border-slate-200 p-2.5">업체가 폐업하거나 연락 두절되더라도 보증보험사에서 직접 하자보수 비용 환급</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 안전한 대금 지급 비율: 1-4-4-1 공식</h2>
<p>인테리어 공사비는 절대로 선금을 과도하게 주면 안 됩니다. 공사가 진행되기도 전에 돈이 넘어가면 소비자는 끌려다닐 수밖에 없습니다.</p>
<ul>
  <li><b>계약금 (10%):</b> 계약 체결 시 지급</li>
  <li><b>중도금 1차 (40%):</b> 철거 및 배관, 전기 등 기초 골조 공사 완료 확인 후 지급</li>
  <li><b>중도금 2차 (40%):</b> 타일, 목공, 도배, 싱크대 설치 등 마감 시공 완료 확인 후 지급</li>
  <li><b>잔금 (10%):</b> 최종 입주 청소 및 하자 점검을 마치고, <b>하자보수이행보증증권을 수령한 후</b> 최종 지급</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 공사 금액이 1,500만 원 이상이면 실내건축공사업 면허 업체인지 확인해야 하나요?</h3>
<p>A. 건설산업기본법에 따라 부가세 포함 1,500만 원 이상의 실내건축공사는 국토교통부에 등록된 '실내건축공사업 면허' 보유 업체만 시공할 수 있습니다. 키스콘(KISCON, 건설산업지식정보시스템)에서 상호나 대표자명으로 무면허 업체 여부를 조회할 수 있습니다.</p>

<h3>Q2. 공사 후 타일 들뜸이나 마루 틈새 하자가 발생했는데 업체가 연락을 피합니다. 어떻게 해야 하나요?</h3>
<p>A. 하자보수이행보증증권이 있다면 서울보증보험에 청구하여 타 업체를 통한 재시공 견적대로 보험금을 지급받을 수 있습니다. 증권이 없다면 내용증명으로 14일 이내 보수를 최고하고 한국소비자원 피해구제 신청 또는 지급명령을 진행해야 합니다.</p>

<h3>Q3. 추가 공사비를 갑자기 요구할 때 거부할 수 있나요?</h3>
<p>A. 사전 견적서에 포함되지 않은 공사는 원칙적으로 계약 외 사항입니다. 소비자의 사전 서면 동의 없는 시공사의 일방적 추가 공사에 대해서는 대금 지급 의무가 없다는 것이 법원의 일관된 판례입니다.</p>`,
    hashtags: ["인테리어계약서", "턴키공사", "지체상금", "하자이행보증", "실내건축표준계약서", "하우징허브"]
  },
  {
    id: "post-20260920-ltv80",
    title: "생애최초 주택구입 LTV 80% 활용 시 주의할 점: 방공제(MCI/MCG) 가입 여부에 따른 대출금 차이와 부대비용 총정리",
    category: "대출-금융",
    author: "하우징허브",
    date: "2026-09-20",
    time: "16:20:10",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?auto=format&fit=crop&q=80&w=800",
    excerpt: "생애최초 주택구입자는 집값의 최대 80%(한도 6억 원)까지 대출이 가능하지만, 소액임차보증금 최우선변제금(방공제 5,500만 원)을 차감당하면 잔금이 모자라는 낭패를 겪을 수 있습니다. MCI·MCG 가입 조건과 취득세 200만 원 감면 신청 실무를 안내합니다.",
    content: `<p>세대 구성원 모두가 과거에 주택을 소유한 사실이 없는 <b>'생애최초 주택구입자'</b>는 지역이나 주택가격 규제와 상관없이 LTV(주택담보대출비율)를 <b>최대 80%(대출 한도 최대 6억 원)</b>까지 완화 적용받습니다. 초기 자본이 부족한 3040 실수요자에게는 최고의 레버리지 수단입니다.</p>

<p>그러나 은행 창구에서 "LTV 80%가 다 나오는 줄 알았는데, 방공제로 5,500만 원이 빠진다고 합니다"라는 청천벽력 같은 말을 듣는 경우가 많습니다. '방공제'의 실체와 이를 무력화하는 모기지신용보험(MCI/MCG) 활용법, 그리고 취득세 200만 원 감면 팁을 완벽히 정리해 드립니다.</p>

<h2>1. 방공제(소액임차보증금 최우선변제액)란 무엇인가?</h2>
<p>주택임대차보호법에 따르면 경매 시 소액임차인의 최소한의 주거 안정을 위해 보증금 중 일정액(최우선변제금)을 1순위 근저당권자보다 먼저 배당해 줍니다. 은행 입장에서는 경매에 넘어갔을 때 이 돈을 떼일 위험이 있으므로, 대출 한도를 산정할 때 방 1개당 최우선변제금만큼을 미리 빼고(차감하고) 빌려주는데, 이를 <b>'방공제'</b>라고 부릅니다.</p>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">지역 구분</th>
        <th class="border border-slate-200 p-2.5 font-bold">소액임차인 범위</th>
        <th class="border border-slate-200 p-2.5 font-bold text-rose-700">방공제 차감 금액 (방 1개당)</th>
        <th class="border border-slate-200 p-2.5 font-bold">한도 축소 영향</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">서울특별시</td>
        <td class="border border-slate-200 p-2.5">보증금 1억 6,500만 원 이하</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">5,500만 원 차감</td>
        <td class="border border-slate-200 p-2.5">대출 가능액에서 즉시 5,500만 원 증발</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold">수도권 과밀억제권역·세종·용인·화성 등</td>
        <td class="border border-slate-200 p-2.5">보증금 1억 4,500만 원 이하</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">4,800만 원 차감</td>
        <td class="border border-slate-200 p-2.5">대출 가능액에서 즉시 4,800만 원 증발</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">광역시·안산·광주·파주·이천 등</td>
        <td class="border border-slate-200 p-2.5">보증금 8,500만 원 이하</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">2,800만 원 차감</td>
        <td class="border border-slate-200 p-2.5">대출 가능액에서 2,800만 원 차감</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 방공제 없이 LTV 80% 풀 한도 받는 법: MCI와 MCG</h2>
<p>방공제 금액만큼 대출 한도가 깎이는 것을 막으려면 은행에 <b>MCI(모기지신용보험, SGI서울보증)</b> 또는 <b>MCG(모기지신용보증, 한국주택금융공사)</b> 가입을 요청해야 합니다.</p>
<ul>
  <li><b>MCI:</b> 은행이 보험료를 전액 부담하며 방공제 차감 없이 대출 한도를 채워줍니다. (차주 1인당 2건까지)</li>
  <li><b>MCG:</b> 보금자리론이나 디딤돌대출 등 공적 모기지에서 주로 사용되며, 연 0.05~0.1% 수준의 저렴한 보증료를 부담하고 방공제를 면제받습니다.</li>
</ul>

<h2>3. 생애최초 주택구입 취득세 감면(최대 200만 원) 필수 신청</h2>
<p>생애최초로 실거래가 12억 원 이하의 주택을 구입하는 경우, 소득과 관계없이 <b>취득세를 최대 200만 원까지 전액 면제</b>받습니다. 잔금일 관할 구청 세무과에 취득세 신고 시 '생애최초 주택구입 감면 신청서'와 주민등록등본을 제출하면 즉시 200만 원이 차감 고지됩니다. (단, 취득 후 3개월 이내 전입신고 및 3년간 실거주 유지 요건 필수)</p>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 미혼 1인 가구도 생애최초 LTV 80% 혜택을 받을 수 있나요?</h3>
<p>A. 네, 가능합니다. 만 19세 이상 성년이라면 단독 세대주인 미혼 청년도 과거 주택 보유 이력이 없다면 생애최초 LTV 80%와 취득세 200만 원 감면 혜택을 동일하게 적용받습니다.</p>

<h3>Q2. 분양권이나 입주권을 샀다가 피(프리미엄)를 받고 판 적이 있습니다. 생애최초에 해당하나요?</h3>
<p>A. 2018년 12월 이후 취득한 분양권이나 재개발 입주권은 세법 및 대출 규정상 주택을 소유했던 것으로 간주되므로, 생애최초 대상에서 제외됩니다.</p>

<h3>Q3. 은행에서 가계대출 총량 관리 때문에 MCI 발급을 중단했다고 하면 어떻게 하나요?</h3>
<p>A. 금융당국의 대출 조이기 시기에 시중은행들이 자체적으로 MCI 가입을 일시 중단하는 경우가 있습니다. 이 경우 주택금융공사의 MCG가 적용되는 정책대출이나, MCI를 취급하는 타 은행 및 보험사 주담대로 우회 신청해야 합니다.</p>`,
    hashtags: ["생애최초LTV80", "방공제", "MCI", "MCG", "취득세감면", "하우징허브"]
  },
  {
    id: "post-20260919-musunwi",
    title: "무순위 줍줍(사후 무순위) 청약 자격 제한 완화와 실거주 의무: 수도권 줍줍 청약 시 자금조달계획서 작성 및 세금 분석",
    category: "청약-분양",
    author: "하우징허브",
    date: "2026-09-19",
    time: "11:05:40",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800",
    excerpt: "수억 원 시세차익이 기대되는 로또 줍줍 청약! 거주지역 무관 전국구 청약 가능 여부, 재당첨 제한 규정, 당첨 즉시 필요한 계약금 10~20% 마련 방안과 증빙 서류 철저 대비 가이드를 생생한 사례와 함께 전달합니다.",
    content: `<p>수도권 주요 단지에서 부적격 당첨이나 계약 포기로 인해 발생하는 이른바 <b>'무순위 줍줍(사후 무순위 청약)'</b>은 수십만 대 일의 경쟁률을 기록하며 청약홈 서버를 마비시키는 전국민의 관심사입니다. 시세보다 수억 원 저렴한 분양가로 새 아파트를 취득할 수 있는 마지막 로또로 불리기 때문입니다.</p>

<p>하지만 '선당후곰(먼저 당첨되고 나중에 고민한다)'이라는 안일한 생각으로 덤벼들었다가는, 당첨 직후 수천만 원의 계약금을 조달하지 못해 계약을 포기하고 최장 10년간 재당첨 제한에 묶이거나 자금조달계획서 소명에 걸려 세무 조사를 받는 낭패를 볼 수 있습니다. 무순위 줍줍의 유형별 핵심 규정과 자금 전략을 공개합니다.</p>

<h2>1. 무순위 청약의 3가지 유형과 신청 자격</h2>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">유형</th>
        <th class="border border-slate-200 p-2.5 font-bold">발생 원인</th>
        <th class="border border-slate-200 p-2.5 font-bold">거주지역 요건</th>
        <th class="border border-slate-200 p-2.5 font-bold">주택 소유 여부</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold text-blue-700">1. 사후 무순위 (일반 줍줍)</td>
        <td class="border border-slate-200 p-2.5">미계약, 미분양 물량</td>
        <td class="border border-slate-200 p-2.5 font-bold text-emerald-700">전국 누구나 가능</td>
        <td class="border border-slate-200 p-2.5">유주택자도 가능 (단지별 공고문 상이)</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold text-rose-700">2. 계약취소주택 재공급</td>
        <td class="border border-slate-200 p-2.5">위장전입, 불법전매 등 교란행위 적발 취소분</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">해당 시·군 거주자 한정</td>
        <td class="border border-slate-200 p-2.5 font-bold text-rose-700">무주택 세대구성원 필수</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">3. 임의공급</td>
        <td class="border border-slate-200 p-2.5">사후 무순위 반복 후 잔여 물량</td>
        <td class="border border-slate-200 p-2.5 font-bold text-emerald-700">전국 누구나 가능</td>
        <td class="border border-slate-200 p-2.5">유주택자 가능</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 줍줍 당첨 시 자금 계획 체크리스트</h2>
<ul>
  <li><b>계약금 10~20% 현금 보유 필수:</b> 무순위 청약은 당첨 발표 후 계약 체결일까지의 기간이 통상 1~2주로 매우 촉박합니다. 당첨 즉시 분양가의 10~20%(서울 기준 1억~2억 원)를 현금으로 납부해야 하므로 마이너스통장이나 예금 해지 등 유동성을 미리 확보해 두어야 합니다.</li>
  <li><b>실거주 의무 유예 3년 활용:</b> 분양가상한제 적용 주택의 실거주 의무 시작 시점이 '최초 입주일'에서 '입주 후 3년 이내'로 유예되었습니다. 따라서 입주 시점에 잔금이 부족하다면 일단 전세를 놓아 전세보증금으로 분양 잔금을 치른 뒤 3년 내에 실입주하는 전략이 가능합니다.</li>
  <li><b>자금조달계획서 증빙 서류 사전 준비:</b> 수도권 규제지역 또는 6억 원 이상 거래는 자금조달계획서 제출이 의무입니다. 예금 잔액증명서, 주식 매도 내역, 증여세 신고 내역을 철저히 소명해야 국세청 자금출처 조사를 피할 수 있습니다.</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 무순위 청약에 당첨되면 청약통장이 소멸되나요?</h3>
<p>A. 아닙니다. 무순위 청약은 청약통장을 사용하지 않고 신청하는 추첨제이므로 당첨되더라도 본인의 기존 청약통장은 그대로 유지됩니다. 추후 다른 공공/민영 분양에 언제든지 통장을 다시 쓸 수 있습니다.</p>

<h3>Q2. 분양가상한제 단지 무순위 당첨 시 재당첨 제한이 적용되나요?</h3>
<p>A. 규제지역 또는 분양가상한제 적용 주택의 무순위 청약에 당첨된 경우, 본인 및 세대원 전원에게 최장 10년간 재당첨 제한이 적용됩니다. 따라서 묻지마 청약은 절대 금물입니다.</p>

<h3>Q3. 부부가 둘 다 무순위 청약에 넣어도 되나요?</h3>
<p>A. 사후 무순위(전국구)의 경우 부부가 각각 1건씩 신청할 수 있습니다. 둘 다 당첨될 경우 둘 중 1건을 선택하여 계약을 체결할 수 있습니다.</p>`,
    hashtags: ["무순위청약", "줍줍", "로또청약", "실거주의무", "자금조달계획서", "하우징허브"]
  },
  {
    id: "post-20260918-trustrent",
    title: "신탁부동산 전세계약 사기 예방 완벽 가이드: 신탁원부 발급 열람법과 위탁자·수탁자 동의서 확인 실무",
    category: "전월세",
    author: "하우징허브",
    date: "2026-09-18",
    time: "14:50:00",
    readTime: "8분",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
    excerpt: "등기부등본 갑구에 '신탁'이라고 적혀 있는 신축 빌라나 오피스텔, 위탁자(원래 집주인) 말만 믿고 계약했다가는 전세보증금을 한 푼도 못 건집니다. 등기소에서 신탁원부를 발급받아 수탁자 및 1순위 수익자 동의권을 검증하는 필수 절차를 알기 쉽게 설명합니다.",
    content: `<p>신축 빌라나 신축 오피스텔 전세를 알아보다 보면, 등기부등본 소유권(갑구)란에 집주인 개인 이름 대신 <b>'OO부동산신탁 주식회사'</b>라는 상호와 함께 신탁등기가 경료된 매물을 흔히 보게 됩니다. 이때 공인중개사나 원소유자(위탁자)가 "대출받으려고 형식상 신탁해 둔 것이니 나랑 계약하고 내 계좌로 보증금을 넣으면 아무 문제 없다"고 안심시키는 경우가 많습니다.</p>

<p><b>단언컨대, 이 말을 믿고 계약서에 도장을 찍는 순간 보증금은 공중에 날아갑니다.</b> 신탁부동산의 법적 소유권은 엄연히 신탁회사(수탁자)에 있으며, 신탁회사의 사전 승낙 없이 위탁자와 체결한 임대차계약은 주택임대차보호법상 대항력이 전혀 없는 '불법 점유'에 불과하기 때문입니다. 신탁 사기를 100% 예방하는 실무 확인법을 공개합니다.</p>

<h2>1. 신탁부동산 임대차계약의 3대 주체와 권리 관계</h2>

<div class="overflow-x-auto my-4">
  <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
    <thead>
      <tr class="bg-slate-100 text-slate-800">
        <th class="border border-slate-200 p-2.5 font-bold">주체</th>
        <th class="border border-slate-200 p-2.5 font-bold">법적 지위</th>
        <th class="border border-slate-200 p-2.5 font-bold">임대차계약 권한</th>
        <th class="border border-slate-200 p-2.5 font-bold">보증금 수령 권한</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold text-blue-700">수탁자 (신탁회사)</td>
        <td class="border border-slate-200 p-2.5 font-bold">대내외적 완전한 법적 소유자</td>
        <td class="border border-slate-200 p-2.5 text-blue-700 font-bold">원칙적 임대 권한 보유</td>
        <td class="border border-slate-200 p-2.5 font-bold text-blue-700">신탁회사 법인 명의 계좌</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-200 p-2.5 font-semibold text-rose-700">위탁자 (원소유자·건축주)</td>
        <td class="border border-slate-200 p-2.5">신탁을 맡긴 자 (소유권 상실 상태)</td>
        <td class="border border-slate-200 p-2.5 text-rose-700 font-bold">신탁사 사전 승낙 없으면 무권한</td>
        <td class="border border-slate-200 p-2.5 text-rose-700 font-bold">개인 계좌 입금 시 전액 횡령 위험</td>
      </tr>
      <tr>
        <td class="border border-slate-200 p-2.5 font-semibold">우선수익자 (대출 금융기관)</td>
        <td class="border border-slate-200 p-2.5">돈을 빌려준 1순위 채권자</td>
        <td class="border border-slate-200 p-2.5">임대 동의권 및 채권 회수 권한</td>
        <td class="border border-slate-200 p-2.5">대출 원리금 우선 변제 권한</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>2. 인터넷으로 안 나오는 '신탁원부' 발급 및 해독법</h2>
<p>신탁부동산의 진짜 법적 규정은 일반 등기부등본에는 나오지 않으며, <b>'신탁원부'</b>에만 기재되어 있습니다. 신탁원부는 인터넷 열람이 불가능하므로 반드시 <b>가까운 등기소(전국 무관)에 직접 방문하여 발급</b>받아야 합니다.</p>

<ul>
  <li><b>체크포인트 1: 임대차계약 체결 조항 (제9조~15조 부근):</b> "신탁계약 체결 후 위탁자가 임대차계약을 체결할 경우, 반드시 수탁자(신탁사) 및 우선수익자(대출은행)의 사전 서면 승낙을 받아야 한다"는 조항이 있는지 확인합니다. 99%의 담보신탁에 이 조항이 있습니다.</li>
  <li><b>체크포인트 2: 임대차보증금 입금 계좌:</b> "임대보증금은 수탁자 또는 우선수익자가 지정한 별도 관리계좌에 입금하여야 효력이 있다"고 명시되어 있습니다. 위탁자 개인 통장으로 송금하면 신탁사는 임대차를 부인하며 명도(강제퇴거) 소송을 제기할 수 있습니다.</li>
</ul>

<h2>3. 신탁부동산 안전 계약 4대 불패 공식</h2>
<ol class="list-decimal pl-5 space-y-2">
  <li>신탁회사 명의의 <b>공식 임대차 동의서(신탁사 직인 날인 원본)</b>와 우선수익자(은행)의 <b>동의서 원본</b>을 계약 당일 눈으로 직접 확인하고 교부받을 것.</li>
  <li>계약금 및 잔금은 반드시 <b>신탁회사 법인 명의 계좌</b>로 직접 송금할 것.</li>
  <li>가장 안전한 방법은 <b>'잔금 지급과 동시에 신탁등기를 전액 말소하고 위탁자 명의로 소유권을 온전히 환원하는 특약'</b>을 걸고 법무사가 등기소에 말소 접수하는 것을 현장에서 확인하는 것입니다.</li>
  <li>신탁 물건은 전세보증보험(HUG, SGI) 가입이 극히 까다롭거나 거절되므로, 보증보험 가입 불발 시 계약금을 위약금 없이 전액 반환하는 특약을 명기하십시오.</li>
</ol>

<h2>자주 묻는 질문 (FAQ)</h2>
<h3>Q1. 공인중개사가 "신탁사 동의서 없어도 전입신고와 확정일자 받으면 보호된다"고 하는데요?</h3>
<p>A. 완전히 거짓말입니다. 판례에 따르면 무권한자인 위탁자와 맺은 임대차는 수탁자에게 효력이 없으므로, 전입신고와 확정일자를 갖추었더라도 신탁회사가 집을 비우라고 요구하면 대항하지 못하고 강제 퇴거당합니다. 공인중개사 역시 중개과실 손해배상 책임을 지게 됩니다.</p>

<h3>Q2. 신탁원부는 관할 주소지 등기소에만 가야 발급되나요?</h3>
<p>A. 아닙니다. 전국의 모든 법원 등기소나 등기국 민원실 창구에서 부동산 주소와 신탁번호(등기부 갑구에 기재됨)를 제시하면 10분 만에 즉시 발급받을 수 있습니다.</p>

<h3>Q3. 신탁 말소 조건으로 계약할 때 계약금은 누구에게 줘야 하나요?</h3>
<p>A. 신탁 말소 조건이라 하더라도 계약금은 신탁사 확인 계좌나 에스크로(반환보증 예치)에 넣거나, 잔금일에 신탁 대출 상환 및 말소 서류가 완비될 때까지 안전하게 보관하는 특약을 작성해야 합니다.</p>`,
    hashtags: ["신탁부동산", "신탁원부", "전세사기예방", "담보신탁", "부동산등기", "하우징허브"]
  }
];
