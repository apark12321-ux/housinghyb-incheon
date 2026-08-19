/**
 * SEO 키워드 자동 분석 및 메타태그 동적 업데이트 유틸리티
 */

// 불용어 및 무의미한 일반 단어 목록
const STOP_WORDS = new Set([
  "그리고", "하지만", "그러나", "따라서", "때문에", "통해", "위해", "대한",
  "있습니다", "합니다", "됩니다", "보는", "하는", "있는", "없는", "것을",
  "경우", "관련", "대해", "가장", "매우", "모든", "어떤", "이러한", "저러한",
  "방법", "기준", "내용", "정보", "확인", "필수", "주의", "포털", "제공",
  "가이드", "정리", "핵심", "분석", "리포트", "이유", "원인", "결과",
  "이것", "저것", "그것", "여기", "저기", "어디", "누구", "무엇", "어떻게",
  "이번", "오늘", "내일", "지금", "바로", "다시", "항상", "자주", "직접",
  "수", "등", "및", "더", "또", "잘", "못", "안", "점", "곳", "중", "후", "전"
]);

// 부동산/주거/금융 도메인 고가치 핵심 가중치 키워드 사전
const DOMAIN_WEIGHT_MAP: Record<string, number> = {
  "청약": 5, "가점": 4, "특별공급": 4, "일반공급": 4, "무순위": 4, "줍줍": 4,
  "전세": 5, "월세": 4, "임대차": 4, "확정일자": 4, "전입신고": 4, "대항력": 5,
  "우선변제권": 5, "근저당": 4, "보증금": 4, "반환보증": 4, "HUG": 4, "HF": 4,
  "전세사기": 5, "깡통전세": 5, "등기부등본": 4, "특약": 4, "표준계약서": 3,
  "디딤돌대출": 5, "버팀목대출": 5, "신생아특례": 5, "보금자리론": 4, "주택담보대출": 5,
  "DSR": 5, "LTV": 4, "DTI": 4, "스트레스DSR": 5, "금리": 4, "중도상환수수료": 3,
  "이사": 4, "손없는날": 3, "인테리어": 4, "도배": 3, "장판": 3, "하자보수": 4,
  "양도소득세": 4, "취득세": 4, "종부세": 4, "재산세": 3, "비과세": 4,
  "분양가상한제": 4, "전매제한": 4, "실거주의무": 4, "재당첨제한": 4,
  "무주택자": 4, "생애최초": 4, "신혼부부": 4, "다자녀": 4, "노부모부양": 3
};

/**
 * HTML 태그 제거 및 순수 텍스트 정제
 */
function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[^\w\uAC00-\uD7A3\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 텍스트 및 제목, 해시태그로부터 SEO 최적화 메타 키워드 10개 추출
 */
export function extractTopSeoKeywords(options: {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  hashtags?: string[];
  maxCount?: number;
}): string[] {
  const { title = "", excerpt = "", content = "", category = "", hashtags = [], maxCount = 10 } = options;
  const scoreMap = new Map<string, number>();

  // 1. 기존 태그/해시태그 반영 (높은 초기 점수)
  if (Array.isArray(hashtags)) {
    hashtags.forEach((tag) => {
      const cleanTag = tag.replace(/^#/, "").trim();
      if (cleanTag.length >= 2 && !STOP_WORDS.has(cleanTag)) {
        scoreMap.set(cleanTag, (scoreMap.get(cleanTag) || 0) + 12);
      }
    });
  }

  // 2. 카테고리 가중치
  if (category) {
    const catWords = category.split(/[-\s,]+/);
    catWords.forEach((cw) => {
      if (cw.length >= 2 && !STOP_WORDS.has(cw)) {
        scoreMap.set(cw, (scoreMap.get(cw) || 0) + 8);
      }
    });
  }

  // 3. 제목(Title) 내 단어 분석 (높은 가중치)
  const titleClean = cleanText(title);
  const titleWords = titleClean.split(/\s+/);
  titleWords.forEach((word) => {
    if (word.length >= 2 && !STOP_WORDS.has(word)) {
      scoreMap.set(word, (scoreMap.get(word) || 0) + 6);
    }
  });

  // 4. 요약(Excerpt) 및 본문(Content) 분석
  const bodyText = cleanText(`${excerpt} ${content}`);
  
  // 복합 전문용어 탐색 (사전 매칭)
  for (const [dictWord, weight] of Object.entries(DOMAIN_WEIGHT_MAP)) {
    const regex = new RegExp(dictWord, "gi");
    const matches = bodyText.match(regex);
    if (matches && matches.length > 0) {
      const freqScore = Math.min(matches.length, 10) * 1.5;
      scoreMap.set(dictWord, (scoreMap.get(dictWord) || 0) + weight * 2 + freqScore);
    }
  }

  // 일반 형태소/단어 빈도수 분석 (2글자 이상)
  const words = bodyText.split(/\s+/);
  for (const w of words) {
    if (w.length < 2 || w.length > 12) continue;
    if (STOP_WORDS.has(w)) continue;
    // 숫자만 있는 경우 제외
    if (/^\d+$/.test(w)) continue;

    scoreMap.set(w, (scoreMap.get(w) || 0) + 1);
  }

  // 점수 기준 내림차순 정렬
  const sortedKeywords = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword);

  // 중복 단어 부분 매칭 정리 (예: '청약가점'이 있으면 '가점' 우선순위 조정)
  const uniqueKeywords: string[] = [];
  for (const kw of sortedKeywords) {
    if (!uniqueKeywords.includes(kw)) {
      uniqueKeywords.push(kw);
    }
    if (uniqueKeywords.length >= maxCount) break;
  }

  // 만약 10개가 부족한 경우 기본 필수 키워드로 보충
  const defaultFallback = [
    "하우징허브", "주택청약", "전월세계약", "전세보증금", "디딤돌대출",
    "버팀목대출", "DSR계산", "확정일자", "주거정책", "내집마련"
  ];

  for (const fallback of defaultFallback) {
    if (uniqueKeywords.length >= maxCount) break;
    if (!uniqueKeywords.includes(fallback)) {
      uniqueKeywords.push(fallback);
    }
  }

  return uniqueKeywords.slice(0, maxCount);
}

/**
 * DOM의 <meta name="keywords"> 태그를 동적으로 생성 또는 갱신
 */
export function updateMetaKeywords(keywords: string[]): void {
  if (typeof document === "undefined") return;

  const keywordString = keywords.join(", ");
  let metaTag = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;

  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.setAttribute("name", "keywords");
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute("content", keywordString);
}

/**
 * 사용자가 입력한 검색어와 현재 선택된 카테고리를 분석하여
 * 구글 검색 결과에서 가장 관련도 높은 정부 공문, 법령 및 고신뢰 주거 정보를 얻을 수 있도록
 * 검색 쿼리를 정교하게 조합 및 확장합니다.
 */
export function buildRefinedGoogleSearchUrl(rawQuery: string, category?: string): {
  url: string;
  displayQuery: string;
  suggestions: { label: string; query: string }[];
} {
  const trimmed = (rawQuery || "").trim();
  
  // 검색어가 없을 경우 기본 카테고리 기반 쿼리
  if (!trimmed) {
    const baseCat = category && category !== "전체" ? category : "주택청약 및 전월세대출";
    const displayQuery = `${baseCat} 최신 주거 가이드`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(displayQuery + " site:kr OR 국토교통부 OR 청약홈")}`;
    return {
      url,
      displayQuery,
      suggestions: [
        { label: "청약 가점 계산법", query: "주택 청약 가점 계산 기준 국토교통부" },
        { label: "전세보증금 반환보증", query: "전세보증보험 가입조건 HUG HF" },
        { label: "디딤돌·버팀목 대출", query: "2026 주택도시기금 디딤돌 버팀목 대출 금리 한도" },
      ]
    };
  }

  // 1. 특정 핵심 주제별 타깃 키워드 매칭
  const lower = trimmed.toLowerCase();
  let intentKeyword = "";
  const extraSuggestions: { label: string; query: string }[] = [];

  if (/디딤돌|버팀목|신생아|대출|금리|한도|dsr|ltv|스트레스/i.test(lower)) {
    intentKeyword = "주택도시기금 대출 자격 한도 금리 조건";
    extraSuggestions.push(
      { label: `"${trimmed}" 최신 금리·한도`, query: `${trimmed} 대출 금리 한도 계산` },
      { label: `"${trimmed}" 신청 자격 및 서류`, query: `${trimmed} 신청 자격 서류 주택도시기금` },
      { label: `"${trimmed}" DSR 규제 적용 여부`, query: `${trimmed} 스트레스 DSR 적용 기준` }
    );
  } else if (/청약|가점|특공|특별공급|무순위|줍줍|분양|청약통장|1순위/i.test(lower)) {
    intentKeyword = "한국부동산원 청약홈 청약 자격 가점 계산";
    extraSuggestions.push(
      { label: `"${trimmed}" 청약 자격 및 1순위 조건`, query: `${trimmed} 청약 1순위 자격 조건` },
      { label: `"${trimmed}" 무순위 줍줍 분양가`, query: `${trimmed} 무순위 줍줍 청약 일정 분양가` },
      { label: `"${trimmed}" 특별공급 소득 자산 기준`, query: `${trimmed} 특별공급 소득 자산 기준` }
    );
  } else if (/전세|월세|임대차|보증금|대항력|확정일자|전입신고|깡통|사기|특약|등기부/i.test(lower)) {
    intentKeyword = "주택임대차보호법 대항력 전세보증금 반환보증";
    extraSuggestions.push(
      { label: `"${trimmed}" 안전 계약 특약 문구`, query: `${trimmed} 부동산 표준계약서 안전 특약` },
      { label: `"${trimmed}" 대항력 및 확정일자 효력`, query: `${trimmed} 확정일자 대항력 전입신고 효력` },
      { label: `"${trimmed}" HUG 반환보증 가입 기준`, query: `${trimmed} HUG 전세보증보험 가입 요건` }
    );
  } else if (/이사|손없는날|폐기물|입주청소|도배|인테리어|하자보수/i.test(lower)) {
    intentKeyword = "이사 체크리스트 지자체 대형폐기물 하자보수";
    extraSuggestions.push(
      { label: `"${trimmed}" 온라인 신청 방법`, query: `${trimmed} 인터넷 신청 발급 방법` },
      { label: `"${trimmed}" 비용 및 체크리스트`, query: `${trimmed} 비용 견적 체크리스트` },
      { label: `"${trimmed}" 주의사항 및 피해 예방`, query: `${trimmed} 소비자 주의사항 분쟁 예방` }
    );
  } else {
    // 일반 키워드: 카테고리 맥락을 결합
    const catPrefix = category && category !== "전체" ? category : "부동산 주거 정책";
    intentKeyword = `${catPrefix} 실무 가이드`;
    extraSuggestions.push(
      { label: `"${trimmed}" 관련 공식 정책 및 공고`, query: `${trimmed} 국토교통부 보도자료 공고` },
      { label: `"${trimmed}" 질문과 답변(Q&A)`, query: `${trimmed} 자주 묻는 질문 실무 FAQ` },
      { label: `"${trimmed}" 2026 최신 개정 기준`, query: `${trimmed} 2026년 최신 개정 변경사항` }
    );
  }

  // 검색어 정제 (특수기호 과다 정리)
  const cleanQ = trimmed.replace(/[+&|!(){}[\]^"~*?:\\/]/g, " ").replace(/\s+/g, " ").trim();
  
  // 구글 검색창에 최종 전달되는 정밀 쿼리
  const refinedQuery = `${cleanQ} ${intentKeyword}`;
  const encoded = encodeURIComponent(refinedQuery);
  const url = `https://www.google.com/search?q=${encoded}`;

  return {
    url,
    displayQuery: cleanQ,
    suggestions: extraSuggestions.slice(0, 3)
  };
}

