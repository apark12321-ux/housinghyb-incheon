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
  const h3Count = (newContent.match(/<h3/g) || []).length;
  const h2Count = (newContent.match(/<h2/g) || []).length;

  if (imgCount === 0) {
    if (h3Count >= 3) {
      let matchCount = 0;
      newContent = newContent.replace(/<h3/g, (match) => {
        matchCount++;
        if (matchCount === 2) return imgHtml1 + match;
        if (matchCount === 3) return imgHtml2 + match;
        return match;
      });
    } else if (h2Count >= 3) {
      let matchCount = 0;
      newContent = newContent.replace(/<h2/g, (match) => {
        matchCount++;
        if (matchCount === 2) return imgHtml1 + match;
        if (matchCount === 3) return imgHtml2 + match;
        return match;
      });
    } else {
      // subheading이 적은 경우 본문 첫 단락 뒤에 배치
      if (newContent.includes("</p>")) {
        newContent = newContent.replace("</p>", "</p>" + imgHtml1);
      } else {
        newContent = newContent + imgHtml1;
      }
    }
  } else if (imgCount === 1) {
    // 1개의 이미지만 본문에 있는 경우 두 번째 이미지를 3번째 subheading 또는 끝부분 근처에 보정 주입
    if (h3Count >= 3) {
      let matchCount = 0;
      newContent = newContent.replace(/<h3/g, (match) => {
        matchCount++;
        if (matchCount === 3) return imgHtml2 + match;
        return match;
      });
    } else if (h2Count >= 3) {
      let matchCount = 0;
      newContent = newContent.replace(/<h2/g, (match) => {
        matchCount++;
        if (matchCount === 3) return imgHtml2 + match;
        return match;
      });
    } else {
      newContent = newContent + imgHtml2;
    }
  }

  return {
    ...post,
    content: newContent
  };
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

export const POSTS: Post[] = RAW_POSTS.map(p => enrichPostContent(p));

// 카테고리별 편리한 지름길 리스트 지원
export const POSTS_BY_CATEGORY = {
  "청약-분양": POSTS.filter(p => p.category === "청약-분양"),
  "전월세": POSTS.filter(p => p.category === "전월세"),
  "이사-인테리어": POSTS.filter(p => p.category === "이사-인테리어"),
  "대출-금융": POSTS.filter(p => p.category === "대출-금융")
};
