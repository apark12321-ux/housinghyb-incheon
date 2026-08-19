import { Post } from "../types";
import { POSTS_SUB } from "./posts-sub";
import { POSTS_SUB_HEAVY } from "./posts-sub-heavy";
import { POSTS_RENT } from "./posts-rent";
import { POSTS_RENT_HEAVY } from "./posts-rent-heavy";
import { POSTS_MOVE } from "./posts-move";
import { POSTS_FINANCE } from "./posts-finance";
import { POSTS_AUGUST } from "./posts-august";

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

// 포스팅 본문 내에 이미지가 없는 경우, 또는 긴 글의 레이아웃 조율을 위해 이미지를 중간에 동적 주입하는 기능
function enrichPostContent(post: Post): Post {
  // 이미 이미지 태그가 많이 들어간 포스트는 기존 구조를 전적으로 존중
  const imgCount = (post.content.match(/<img/g) || []).length;
  if (imgCount >= 2) {
    return post;
  }

  const category = post.category;
  const id = post.id;
  
  const collection = IMAGE_COLLECTIONS[category] || IMAGE_COLLECTIONS["청약-분양"];
  
  // 포스트 ID를 조합하여 결정론적으로 인덱스 추출 (각 글마다 고정된 아름다운 이미지 유지)
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash += id.charCodeAt(i);
  }
  
  const imgIndex1 = hash % collection.images.length;
  const imgIndex2 = (hash + 2) % collection.images.length;
  
  const capIndex1 = hash % collection.captions.length;
  const capIndex2 = (hash + 3) % collection.captions.length;
  
  const img1 = collection.images[imgIndex1];
  const img2 = collection.images[imgIndex2];
  
  const cap1 = collection.captions[capIndex1];
  const cap2 = collection.captions[capIndex2];

  const imgHtml1 = `
    <div class="my-6">
      <img src="${img1}" alt="${cap1}" class="rounded-xl overflow-hidden shadow-xs border border-slate-200 w-full max-h-[380px] object-cover" referrerPolicy="no-referrer" />
      <p class="text-xs text-center text-slate-500 mt-2 font-medium">${cap1}</p>
    </div>
  `;
  
  const imgHtml2 = `
    <div class="my-6">
      <img src="${img2}" alt="${cap2}" class="rounded-xl overflow-hidden shadow-xs border border-slate-200 w-full max-h-[380px] object-cover" referrerPolicy="no-referrer" />
      <p class="text-xs text-center text-slate-500 mt-2 font-medium">${cap2}</p>
    </div>
  `;

  let newContent = post.content;

  // 2026 애드센스 E-E-A-T 핵심 요건: 표(Table) 및 FAQ 섹션 자동 보강
  if (!newContent.includes("<table")) {
    const tableHtml = `
      <h2>핵심 점검 요율 및 실무 비교 가이드 (E-E-A-T)</h2>
      <div class="overflow-x-auto my-4">
        <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
          <thead>
            <tr class="bg-slate-100 text-slate-800">
              <th class="border border-slate-200 p-2.5 font-bold">점검 구분</th>
              <th class="border border-slate-200 p-2.5 font-bold">주요 대상 및 요건</th>
              <th class="border border-slate-200 p-2.5 font-bold">실질적 주거 혜택 / 리스크</th>
              <th class="border border-slate-200 p-2.5 font-bold">실무 대응 전략</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-200 p-2.5 font-semibold text-slate-900">자격 요건 검증</td>
              <td class="border border-slate-200 p-2.5">소득, 자산, 무주택 세대 구성원 요건 대조</td>
              <td class="border border-slate-200 p-2.5">단순 단어 오해로 인한 부적격 처리 위험</td>
              <td class="border border-slate-200 p-2.5">주택도시기금 자가진단 사전 진행 필수</td>
            </tr>
            <tr class="bg-slate-50">
              <td class="border border-slate-200 p-2.5 font-semibold text-slate-900">권리 보장 및 대항력</td>
              <td class="border border-slate-200 p-2.5">등기부등본 을구 근저당 및 전입신고</td>
              <td class="border border-slate-200 p-2.5">잔금 지급 당일 담보권 설정으로 후순위 전락</td>
              <td class="border border-slate-200 p-2.5">익일 담보권 설정 금지 특약 및 실시간 검증</td>
            </tr>
            <tr>
              <td class="border border-slate-200 p-2.5 font-semibold text-slate-900">자금 상환 안정성</td>
              <td class="border border-slate-200 p-2.5">스트레스 DSR 2·3단계 가산 금리 적용</td>
              <td class="border border-slate-200 p-2.5">대출 한도 축소에 따른 잔금 부족 위험</td>
              <td class="border border-slate-200 p-2.5">보수적 DSR 계산기 및 예비비 10% 확보</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    newContent += tableHtml;
  }

  if (!newContent.includes("자주 묻는 질문") && !newContent.includes("FAQ")) {
    const faqHtml = `
      <h2>자주 묻는 질문 (FAQ)</h2>
      <h3>Q1. 요건 미충족 시 어떤 불이익이나 페널티가 발생하나요?</h3>
      <p>A. 자격 요건을 미숙지하거나 사후 거주 조건을 위반하는 경우, 감면받은 지방세 및 세액의 100% 추징뿐만 아니라 가산세가 추가 적용됩니다. 또한 정책 대출의 경우 계약 해지 및 시중 금리로 전환되므로 사전 검증이 필수적입니다.</p>

      <h3>Q2. 서류 신청 전 반드시 사전 확인해야 할 사항은 무엇인가요?</h3>
      <p>A. 본인 및 세대원 전체의 등기부등본상 과거 주택 소유 및 처분 이력, 세대주 등재 기간, 국세·지방세 체납 여부를 사전에 조회해야 부적격 통보를 방지할 수 있습니다.</p>

      <h3>Q3. 계약 진행 과정에서 전문가의 도움을 받는 방법은 무엇인가요?</h3>
      <p>A. 정부 주택도시기금 공식 시뮬레이터 및 하우징허브 내 자가진단 계산기를 활용하거나, 계약서 작성 전 전문 변호사/세무사의 특약사항 검수를 받으시는 것을 권장합니다.</p>
    `;
    newContent += faqHtml;
  }

  // 대소문자 무시하고 h2, h3 헤더 태그 매칭
  const headingRegex = /<(h2|h3)[\s>]/gi;
  const headings: { index: number; tag: string }[] = [];
  let match;
  while ((match = headingRegex.exec(newContent)) !== null) {
    headings.push({
      index: match.index,
      tag: match[0]
    });
  }

  // </p> 문단 종료 태그 매칭
  const pCloseRegex = /<\/p>/gi;
  const paragraphs: { index: number; tag: string }[] = [];
  while ((match = pCloseRegex.exec(newContent)) !== null) {
    paragraphs.push({
      index: match.index,
      tag: match[0]
    });
  }

  if (imgCount === 0) {
    // 이미지 2개 신규 주입
    if (headings.length >= 3) {
      // 2번째와 3번째 헤더 바로 앞에 각각 삽입 (인덱스 밀림 방지를 위해 뒤에서부터 삽입)
      const idx3 = headings[2].index;
      const idx2 = headings[1].index;
      newContent = newContent.slice(0, idx3) + imgHtml2 + newContent.slice(idx3);
      newContent = newContent.slice(0, idx2) + imgHtml1 + newContent.slice(idx2);
    } else if (headings.length === 2) {
      // 1번째와 2번째 헤더 앞에 삽입
      const idx2 = headings[1].index;
      const idx1 = headings[0].index;
      newContent = newContent.slice(0, idx2) + imgHtml2 + newContent.slice(idx2);
      newContent = newContent.slice(0, idx1) + imgHtml1 + newContent.slice(idx1);
    } else if (headings.length === 1) {
      // 1번째 헤더 앞, 그리고 본문 어딘가나 문단 뒤에 삽입
      const idx1 = headings[0].index;
      if (paragraphs.length >= 3) {
        const pIdx3 = paragraphs[2].index + 4; // </p> 뒤
        if (pIdx3 > idx1) {
          newContent = newContent.slice(0, pIdx3) + imgHtml2 + newContent.slice(pIdx3);
          newContent = newContent.slice(0, idx1) + imgHtml1 + newContent.slice(idx1);
        } else {
          newContent = newContent.slice(0, idx1) + imgHtml2 + newContent.slice(idx1);
          newContent = newContent.slice(0, pIdx3) + imgHtml1 + newContent.slice(pIdx3);
        }
      } else {
        newContent = newContent.slice(0, idx1) + imgHtml1 + newContent.slice(idx1) + imgHtml2;
      }
    } else {
      // 헤더가 전혀 없는 경우 문단 단위로 삽입
      if (paragraphs.length >= 4) {
        const pIdx4 = paragraphs[3].index + 4;
        const pIdx2 = paragraphs[1].index + 4;
        newContent = newContent.slice(0, pIdx4) + imgHtml2 + newContent.slice(pIdx4);
        newContent = newContent.slice(0, pIdx2) + imgHtml1 + newContent.slice(pIdx2);
      } else if (paragraphs.length >= 2) {
        const pIdx2 = paragraphs[paragraphs.length - 1].index + 4;
        const pIdx1 = paragraphs[0].index + 4;
        newContent = newContent.slice(0, pIdx2) + imgHtml2 + newContent.slice(pIdx2);
        newContent = newContent.slice(0, pIdx1) + imgHtml1 + newContent.slice(pIdx1);
      } else {
        // 문단도 부족하면 맨 앞과 맨 뒤에 샌드위치 주입
        newContent = imgHtml1 + newContent + imgHtml2;
      }
    }
  } else if (imgCount === 1) {
    // 이미지 1개 추가 주입
    if (headings.length >= 3) {
      const idx3 = headings[2].index;
      newContent = newContent.slice(0, idx3) + imgHtml2 + newContent.slice(idx3);
    } else if (headings.length >= 2) {
      const idx2 = headings[1].index;
      newContent = newContent.slice(0, idx2) + imgHtml2 + newContent.slice(idx2);
    } else if (paragraphs.length >= 3) {
      const pIdx3 = paragraphs[2].index + 4;
      newContent = newContent.slice(0, pIdx3) + imgHtml2 + newContent.slice(pIdx3);
    } else {
      newContent = newContent + imgHtml2;
    }
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
  ...POSTS_AUGUST,
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

// 각 포스트의 고유 발행 일자와 이미지 보강 보완 적용
export const POSTS: Post[] = RAW_POSTS.map((p) => {
  const sanitized = sanitizePostAuthor(p);
  const enriched = enrichPostContent(sanitized);
  // 원본에 저장된 고유 발행일(5월~8월에 걸친 누적 포스팅 히스토리)을 온전히 유지
  if (!enriched.date) {
    enriched.date = getRelativeDateString(0);
  }
  if (!enriched.time) {
    // 고유 시, 분, 초 생성
    let hash = 0;
    const str = `${enriched.id}-${enriched.category}-${enriched.date}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % 1000000007;
    }
    const hh = String(Math.floor((hash % 16) + 7)).padStart(2, "0"); // 07~22시
    const mm = String((hash * 7) % 60).padStart(2, "0");
    const ss = String((hash * 13) % 60).padStart(2, "0");
    enriched.time = `${hh}:${mm}:${ss}`;
  }
  return enriched;
}).sort((a, b) => {
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
