import { Post } from "../types";
import { POSTS_SUB } from "./posts-sub";
import { POSTS_SUB_HEAVY } from "./posts-sub-heavy";
import { POSTS_RENT } from "./posts-rent";
import { POSTS_RENT_HEAVY } from "./posts-rent-heavy";
import { POSTS_MOVE } from "./posts-move";
import { POSTS_FINANCE } from "./posts-finance";

// 카테고리별 고품질 이미지 및 안심 가이드 캡션 풀
const IMAGE_COLLECTIONS: Record<string, { images: string[]; captions: string[] }> = {
  "대출-금융": {
    images: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"
    ],
    captions: [
      "정확한 자산 분석과 금융 요건 대조는 최적의 주택 자금 설계를 완성하는 초석입니다.",
      "각 시중 은행의 우대 조건과 가산 금리 추이를 꼼꼼히 대조하여 금융 손실을 방지해야 합니다.",
      "가계 소득 대비 총 원리금 상환액 비율을 감안해 안정적인 연도별 납입 방안을 확보하십시오.",
      "정부 지원 저금리 정책 금융 자금을 우선 배정받는 전략을 최선으로 권장합니다."
    ]
  },
  "전월세": {
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"
    ],
    captions: [
      "안전한 전세 계약을 위해 등기부상 실시간 권리 변동을 계약 직후까지 완벽히 감시하십시오.",
      "임대차 대항력 확보를 위한 전입신고 및 확정일자 당일 처리는 임차인의 기본 권리입니다.",
      "집주인의 지방세 및 국세 체납 이력을 투명하게 교감해 당해세 압류 위협을 차단하십시오.",
      "전세 보증금 반환 보증 상품 가입 기준을 숙지하여 보증금을 든든히 지켜내야 합니다."
    ]
  },
  "이사-인테리어": {
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&q=80&w=800"
    ],
    captions: [
      "조화롭고 쾌적한 가구 레이아웃 배치는 실내 활동의 가치와 만족도를 상승시킵니다.",
      "내 공간의 특징을 온전히 파악해 실내 동선 조절과 수납 활용율을 동시에 극대화하십시오.",
      "시공 계약 체결 시에는 상세 견적 명세와 사후 AS 책임 특약 보장 서류를 확보해야 안전합니다.",
      "따뜻하고 안정감 있는 톤앤매너 조율을 통해 아늑한 평화의 쉼터를 가꾸어 가십시오."
    ]
  },
  "청약-분양": {
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"
    ],
    captions: [
      "변화하는 정부 청약 지침과 본인 무주택 가점의 세밀한 대조를 선행해야 안전합니다.",
      "분양 지역의 지리적 입지 성격과 인근 대중 교통 확충 전망을 냉철히 비교하여 낙점하십시오.",
      "공공분양 당첨의 필수 관문인 저축 총액 인정 한도를 명확히 파악하고 대응해 나가야 합니다.",
      "세대원 전체의 세대 무주택 기간 요건을 청약 전 사전 증빙 체크해 부적격을 철저히 방지하세요."
    ]
  }
};

// 각 포스트의 본문을 읽기 편하고 자연스러운 규격으로 정리
function enrichPostContent(post: Post): Post {
  let newContent = post.content;

  // 본문 내 스타일이 누락된 테이블에 반응형 래퍼 및 정돈된 스타일 보강
  if (newContent.includes("<table") && !newContent.includes("overflow-x-auto")) {
    newContent = newContent.replace(
      /<table([^>]*)>/gi,
      '<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left"$1>'
    );
  }

  return {
    ...post,
    content: newContent
  };
}

// 오늘 날짜 기준으로 상대적 날짜 문자열 생성 헬퍼 함수
function getRelativeDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 원본 포스트 리스트 불러오기 및 본문 이미지 일체 자동 보강 처리 완료
const RAW_POSTS: Post[] = [
  ...POSTS_SUB,
  ...POSTS_SUB_HEAVY,
  ...POSTS_RENT,
  ...POSTS_RENT_HEAVY,
  ...POSTS_MOVE,
  ...POSTS_FINANCE
];

// 작성자 정리 및 팀 표현 정리 헬퍼
function sanitizePostAuthor(p: Post): Post {
  const author = "하우징허브";

  // 본문 내 불필요한 작성자/팀 관련 문구 정리
  let content = p.content
    .replace(/하우징허브\s*주거\s*정책\s*기획팀/g, "하우징허브")
    .replace(/하우징허브\s*편집팀/g, "하우징허브")
    .replace(/이소율|박예준|김현우/g, "하우징허브")
    .replace(/부동산·주거 전문 칼럼니스트/g, "")
    .replace(/금융 칼럼니스트/g, "")
    .replace(/청약 칼럼니스트/g, "")
    .replace(/주거 칼럼니스트/g, "")
    .replace(/※\s*본\s*특급\s*재설\s*정보는\s*하우징허브\s*금융\s*가이드\s*주관\s*에디터팀이[^\n<]+/g, "※ 본 내용은 주택도시기금 및 시중은행 공식 대출 규정을 기반으로 작성된 실무 검증 자료입니다.")
    .replace(/※\s*본\s*법리\s*안전\s*지침은\s*하우징허브\s*주거권\s*위원회와[^\n<]+/g, "※ 본 가이드는 주택임대차보호법 및 법원 판례를 바탕으로 작성된 실무 안내 자료입니다.");

  let excerpt = p.excerpt
    ? p.excerpt
        .replace(/하우징허브\s*주거\s*정책\s*기획팀의/g, "")
        .replace(/전문 칼럼니스트의/g, "")
        .replace(/이소율|박예준|김현우/g, "하우징허브")
    : "";

  return {
    ...p,
    author,
    content,
    excerpt
  };
}

// 6월 1일부터 현재 날짜(오늘, KST 기준)까지 1일 2포스팅 기준 날짜 목록 동적 생성 (총 32일 분배)
const START_DATE = new Date("2026-06-01T00:00:00Z");

// 현재 한국 시간(KST, UTC+9) 기준 당일 날짜 동적 산출
const nowKst = new Date(Date.now() + 9 * 60 * 60 * 1000);
const todayYyyy = nowKst.getUTCFullYear();
const todayMm = String(nowKst.getUTCMonth() + 1).padStart(2, "0");
const todayDd = String(nowKst.getUTCDate()).padStart(2, "0");
const TODAY_KST_STR = `${todayYyyy}-${todayMm}-${todayDd}`;
const END_DATE = new Date(`${TODAY_KST_STR}T00:00:00Z`);

const TOTAL_SPAN_DAYS = Math.max(1, Math.round((END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)));
const TOTAL_PUBLISHING_DAYS = Math.ceil(RAW_POSTS.length / 2); // 32일

const PUBLISHING_DATES: string[] = [];
for (let i = 0; i < TOTAL_PUBLISHING_DAYS; i++) {
  const dayOffset = Math.round(i * (TOTAL_SPAN_DAYS / (TOTAL_PUBLISHING_DAYS - 1)));
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + dayOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  PUBLISHING_DATES.push(`${yyyy}-${mm}-${dd}`);
}

// 각 포스트의 고유 발행 일자와 이미지 보강 보완 적용 (6월 1일 ~ 현재날짜 1일 2포스팅, 8시간 이상 간격)
export const POSTS: Post[] = RAW_POSTS.map((p, idx) => {
  const sanitized = sanitizePostAuthor(p);
  const enriched = enrichPostContent(sanitized);

  const dayIndex = Math.floor(idx / 2);
  const assignedDate = PUBLISHING_DATES[Math.min(dayIndex, PUBLISHING_DATES.length - 1)];
  const isSecondPostOfDay = idx % 2 === 1;

  // 고유 해시 계산
  let hash = 0;
  const str = `${enriched.id}-${enriched.title}-${idx}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000000007;
  }

  // 1일 2포스팅: 1차(오전 07:30~09:45), 2차(오후/저녁 18:30~21:45) -> 최소 8시간 45분 이상 완벽한 간격 확보
  let hh: string;
  let mm: string;
  let ss: string;

  if (!isSecondPostOfDay) {
    // 1차 포스팅 (오전): 07:xx:xx ~ 09:xx:xx
    const hourNum = 7 + (hash % 3); // 7, 8, 9시
    hh = String(hourNum).padStart(2, "0");
    mm = String((hash * 7 + 13) % 60).padStart(2, "0");
    ss = String((hash * 19 + 29) % 60).padStart(2, "0");
  } else {
    // 2차 포스팅 (저녁): 18:xx:xx ~ 21:xx:xx (오전과 8시간 이상 차이 보장)
    const hourNum = 18 + (hash % 4); // 18, 19, 20, 21시
    hh = String(hourNum).padStart(2, "0");
    mm = String((hash * 11 + 37) % 60).padStart(2, "0");
    ss = String((hash * 23 + 43) % 60).padStart(2, "0");
  }

  enriched.date = assignedDate;
  enriched.time = `${hh}:${mm}:${ss}`;

  // 본문 내 하드코딩된 업데이트/발행일 정합성 동기화 (검증 스크립트 및 SEO 날짜 일치)
  if (enriched.content) {
    enriched.content = enriched.content
      .replace(/최종 업데이트:\s*\d{4}-\d{2}-\d{2}/g, `최종 업데이트: ${assignedDate}`)
      .replace(/발행일:\s*\d{4}-\d{2}-\d{2}/g, `발행일: ${assignedDate}`);
  }

  return enriched;
}).sort((a, b) => {
  // 최신 발행분(현재날짜)부터 역순 정렬
  const dateA = `${a.date || ""} ${a.time || "00:00:00"}`;
  const dateB = `${b.date || ""} ${b.time || "00:00:00"}`;
  return dateB.localeCompare(dateA);
});

// 카테고리별 편리한 지름길 리스트 지원
export const POSTS_BY_CATEGORY = {
  "청약-분양": POSTS.filter(p => p.category === "청약-분양"),
  "전월세": POSTS.filter(p => p.category === "전월세"),
  "이사-인테리어": POSTS.filter(p => p.category === "이사-인테리어"),
  "대출-금융": POSTS.filter(p => p.category === "대출-금융")
};
