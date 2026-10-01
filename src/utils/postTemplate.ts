/**
 * 4개 블로그 통합 고품질 포스팅 템플릿 엔진
 * - [핵심 요약 카드 (Executive Summary Card)]
 * - [체크리스트 요약 블록 (Actionable Checklist Block)]
 * 구글 애드센스 E-E-A-T 및 체류 시간 극대화 표준 규격
 */

export interface SummaryCardOptions {
  badge?: string;
  targetAudience: string;
  readTime?: string;
  keyTakeaways: string[];
  practicalTip?: string;
}

export interface ChecklistItem {
  title: string;
  desc: string;
  required?: boolean;
}

export interface ChecklistBlockOptions {
  title?: string;
  subtitle?: string;
  items: ChecklistItem[];
  cautionTip?: string;
}

/**
 * 1. 핵심 요약 카드 HTML 생성기
 */
export function renderSummaryCard(options: SummaryCardOptions): string {
  const {
    badge = "💡 30초 핵심 요약 카드",
    targetAudience,
    readTime = "10분 완독",
    keyTakeaways,
    practicalTip
  } = options;

  const listHtml = keyTakeaways
    .map(
      (point) => `
      <li class="flex items-start gap-2.5">
        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">✓</span>
        <span class="text-slate-800 font-medium text-sm sm:text-base leading-relaxed">${point}</span>
      </li>`
    )
    .join("");

  return `
<!-- [고도화 템플릿] 핵심 요약 카드 -->
<div class="summary-card my-6 p-5 sm:p-6 bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/60 border-2 border-blue-200/80 rounded-2xl shadow-xs space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-200/60">
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-blue-700 text-white rounded-full text-xs font-bold tracking-wide shadow-2xs">
        ${badge}
      </span>
      <span class="text-xs text-slate-500 font-medium">🎯 대상: <strong class="text-slate-700">${targetAudience}</strong></span>
    </div>
    <span class="text-xs font-mono font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
      ⏱️ ${readTime}
    </span>
  </div>

  <ul class="space-y-2.5 my-2">
    ${listHtml}
  </ul>

  ${
    practicalTip
      ? `
  <div class="pt-3 border-t border-blue-200/60 flex items-start gap-2 text-xs sm:text-sm text-blue-900 bg-blue-100/50 p-3 rounded-xl">
    <span class="font-bold shrink-0 text-blue-700">✨ 실무 팁:</span>
    <span class="leading-relaxed">${practicalTip}</span>
  </div>`
      : ""
  }
</div>
`;
}

/**
 * 2. 체크리스트 요약 블록 HTML 생성기
 */
export function renderChecklistBlock(options: ChecklistBlockOptions): string {
  const {
    title = "📋 실행 전 필수 점검 체크리스트",
    subtitle = "실제 진행 전 아래 필수 확인 사항을 하나씩 대조해 보세요.",
    items,
    cautionTip = "단순 변심이나 자격 요건 오판 시 불이익(계약금 몰수, 신청 반려)이 발생할 수 있으니 사전 검증이 필수입니다."
  } = options;

  const itemsHtml = items
    .map(
      (item, idx) => `
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 hover:border-emerald-400 transition-colors shadow-2xs flex items-start gap-3">
      <div class="mt-0.5 shrink-0">
        <input type="checkbox" id="chk-${idx}" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600" />
      </div>
      <label for="chk-${idx}" class="cursor-pointer flex-1">
        <div class="flex items-center gap-2 mb-0.5">
          <span class="font-bold text-sm sm:text-base text-slate-900">${item.title}</span>
          ${item.required ? `<span class="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">필수</span>` : ""}
        </div>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">${item.desc}</p>
      </label>
    </li>`
    )
    .join("");

  return `
<!-- [고도화 템플릿] 체크리스트 요약 블록 -->
<div class="checklist-block my-8 p-5 sm:p-6 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-2 border-emerald-300 rounded-2xl shadow-xs space-y-4">
  <div class="flex items-center justify-between pb-3 border-b border-emerald-200">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <span class="p-1.5 bg-emerald-600 text-white rounded-lg inline-flex items-center justify-center text-xs">✓</span>
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 m-0 tracking-tight">${title}</h3>
      </div>
      <p class="text-xs text-slate-500 m-0">${subtitle}</p>
    </div>
    <span class="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full shrink-0">
      총 ${items.length}개 항목
    </span>
  </div>

  <ul class="space-y-2.5 my-3 list-none p-0">
    ${itemsHtml}
  </ul>

  ${
    cautionTip
      ? `
  <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
    <span class="font-bold shrink-0 text-amber-700">⚠️ 사전 주의:</span>
    <span class="leading-relaxed">${cautionTip}</span>
  </div>`
      : ""
  }
</div>
`;
}

/**
 * 3. 4개 블로그 자동 주입 헬퍼 (기존 글 및 신규 글 공통)
 * 본문에 summary-card나 checklist-block이 누락된 경우 내용과 카테고리에 맞춰 정밀 주입
 */
export function injectSummaryAndChecklist(
  content: string,
  meta: { title: string; category?: string; excerpt?: string }
): string {
  let enriched = content;

  // A. 핵심 요약 카드 자동 주입 (본문 맨 앞 첫 p 태그 직후)
  if (!enriched.includes("summary-card") && !enriched.includes("핵심 요약 카드")) {
    const summaryCardHtml = renderSummaryCard({
      badge: "💡 30초 핵심 요약 카드",
      targetAudience: meta.category ? `${meta.category} 관심 실수요자` : "대한민국 실수요자",
      readTime: "약 8~10분 완독",
      keyTakeaways: [
        `<strong>핵심 쟁점 분석:</strong> ${meta.title.slice(0, 50)}... 관련 최신 법령 및 실무 기준을 명확히 대조했습니다.`,
        `<strong>실질 비용 및 혜택 비교:</strong> 본문 내 표(Table)와 계산기 산식을 통해 본인의 실제 절감액과 가용 한도를 직접 산출할 수 있습니다.`,
        `<strong>실행 전 체크리스트 완비:</strong> 신청 전 탈락·위약금 리스크를 방지하기 위한 필수 서류 및 특약 조항을 하단에 수록했습니다.`
      ],
      practicalTip: "본문의 비교표와 시뮬레이션을 참고하여 본인의 조건에 부합하는지 꼼꼼히 대조해 보세요."
    });

    // 첫 번째 </p> 뒤에 삽입
    const firstPIdx = enriched.indexOf("</p>");
    if (firstPIdx !== -1) {
      enriched =
        enriched.slice(0, firstPIdx + 4) +
        "\n" +
        summaryCardHtml +
        "\n" +
        enriched.slice(firstPIdx + 4);
    } else {
      enriched = summaryCardHtml + "\n" + enriched;
    }
  }

  // B. 체크리스트 요약 블록 자동 주입 (FAQ 섹션 직전 또는 본문 최하단)
  if (!enriched.includes("checklist-block") && !enriched.includes("체크리스트 요약 블록")) {
    const checklistHtml = renderChecklistBlock({
      title: "📋 실행 전 필수 점검 체크리스트 (5대 항목)",
      subtitle: "신청 또는 계약 체결 전 누락된 항목이 없는지 하나씩 체크하세요.",
      items: [
        {
          title: "1. 최신 자격 요건 및 소득 기준 대조",
          desc: "홈택스 소득금액증명원 및 건강보험료 납부확인서 상의 실제 부부합산 기준 부합 여부 확인",
          required: true
        },
        {
          title: "2. 담보 대상물 시세 및 권리관계 점검",
          desc: "등기부등본 갑구/을구 실시간 열람을 통한 선순위 근저당, 가압류, 임차권등기 여부 확인",
          required: true
        },
        {
          title: "3. 계약서 상 필수 안전 특약 명시",
          desc: "대출 미발생 또는 사전심사 부적격 시 계약금 전액 무조건 반환 특약 조항 기재",
          required: true
        },
        {
          title: "4. 중도상환수수료 및 부대비용 기회비용 계산",
          desc: "대환 또는 전환 시 발생하는 인지세, 보증료, 기존 은행 수수료 상쇄 시점 확인",
          required: false
        },
        {
          title: "5. 플랫폼 내 자가진단 계산기 모의 산출",
          desc: "정부 스트레스 DSR 및 LTV/DTI 실제 가용한도를 사전에 수치로 시뮬레이션",
          required: false
        }
      ],
      cautionTip: "금융 규제 및 부동산 계약은 조건 불충족 시 계약금 몰수 등 중대한 재산상 손실로 이어질 수 있으므로 반드시 사전에 모든 서류를 대조하시기 바랍니다."
    });

    // FAQ 섹션 직전에 삽입하거나, 없으면 맨 끝에 부착
    const faqIdx = enriched.indexOf("<h2>자주 묻는 질문");
    if (faqIdx !== -1) {
      enriched =
        enriched.slice(0, faqIdx) +
        checklistHtml +
        "\n\n" +
        enriched.slice(faqIdx);
    } else {
      enriched = enriched + "\n\n" + checklistHtml;
    }
  }

  return enriched;
}
