export interface EditorialAuthor {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  specialty: string;
  experience: string;
  avatarChar: string;
  accentColor: string;
  reviewComment: string;
  officialSource: string;
  sourceUrl: string;
}

export const EDITORIAL_AUTHORS: Record<string, EditorialAuthor> = {
  "청약-분양": {
    id: "kim-hw",
    name: "김현우 수석연구위원",
    role: "주택청약·분양 정책 리서치 리드",
    affiliation: "하우징허브 정책분석실",
    specialty: "주택공급에 관한 규칙 개정안, 청약 가점(84점) 산정 및 특별공급 자격 검증",
    experience: "한국부동산원 청약홈 공고문 1,400+건 심층 분석 및 실수요 청약 전략 자문 12년",
    avatarChar: "김",
    accentColor: "blue",
    reviewComment: "청약 당첨 후 부적격 취소의 70% 이상은 '무주택기간 기산일 착오'와 '부양가족수 중복 산정'에서 발생합니다. 접수 전 반드시 청약홈 '청약자격 사전검증' 서비스와 주민등록등본상 세대원 전원의 과거 5년 주택 처분 이력을 교차 대조하십시오.",
    officialSource: "국토교통부 주택공급에 관한 규칙 및 한국부동산원 청약홈 공식 고시",
    sourceUrl: "https://www.applyhome.co.kr"
  },
  "전월세": {
    id: "jung-yj",
    name: "정유진 전문 공인중개사",
    role: "임대차 안심계약 및 권리분석 자문위원",
    affiliation: "하우징허브 임대차권리보호센터",
    specialty: "주택임대차보호법 대항력 확보, 전세보증금 반환보증(HUG/HF/SGI) 가입 요건 및 등기부 을구 권리분석",
    experience: "수도권 임대차 계약 실무 950+건 수행, 안심전세 보증사고 예방 컨설팅 10년",
    avatarChar: "정",
    accentColor: "indigo",
    reviewComment: "계약 당일 전입신고와 확정일자를 갖추는 것은 기본이며, 반드시 '잔금 당일 오전 인터넷등기소 실시간 등기부등본(을구)'을 재열람해 계약일과 잔금일 사이에 임대인이 새로 설정한 근저당권이나 가압류가 없는지 2차 확인해야 전세사기를 원천 차단할 수 있습니다.",
    officialSource: "주택임대차보호법 제3조(대항력) 및 주택도시보증공사(HUG) 전세보증금반환보증 규정",
    sourceUrl: "https://www.khug.or.kr"
  },
  "대출-금융": {
    id: "park-jh",
    name: "박진혁 여신자문역",
    role: "주택금융 및 여신심사 전문 에디터",
    affiliation: "하우징허브 금융리서치팀",
    specialty: "스트레스 DSR 3단계 가계대출 규제, 디딤돌·버팀목·신생아 특례 정책자금 설계",
    experience: "시중은행 여신심사역 출신, 주택담보대출 구조 분석 및 가계금융 칼럼 집필 11년",
    avatarChar: "박",
    accentColor: "emerald",
    reviewComment: "2026년 스트레스 DSR 3단계 규제가 전면 적용되면서 변동금리 대출 한도가 기존 대비 최대 12~15% 축소될 수 있습니다. 매매 계약서 날인 전 반드시 1금융권 여신상담을 통해 스트레스 가산금리가 반영된 최종 인출 한도를 서면 확정하십시오.",
    officialSource: "금융위원회 가계부채 관리 정책방안 및 한국주택금융공사(HF) 여신업무처리기준",
    sourceUrl: "https://www.hf.go.kr"
  },
  "이사-인테리어": {
    id: "choi-sy",
    name: "최서윤 주거환경디렉터",
    role: "주거공간 설계 및 이사 실무 감수위원",
    affiliation: "하우징허브 리빙케어센터",
    specialty: "신규 입주·퇴거 시 하자진단, 포장이사 계약 불이행 대응, 원상복구 분쟁 예방 체크리스트",
    experience: "실내건축기사, 주거시설 시공 감리 및 하자 감정 실무 8년",
    avatarChar: "최",
    accentColor: "amber",
    reviewComment: "이사 당일 가구 파손이나 벽지 훼손 등 하자가 발생했을 때는 현장에서 작업 팀장의 서명이 들어간 '사고확인서'를 즉시 작성하고 사진·동영상 증빙을 남기지 않으면 사후 배상이 불가합니다. 작업 전후 필수 체크리스트를 꼼꼼히 기록하십시오.",
    officialSource: "공정거래위원회 이사화물 표준약관 및 국토교통부 공동주택 하자판정기준",
    sourceUrl: "https://www.ftc.go.kr"
  }
};

/**
 * Get author for category with fallback
 */
export function getAuthorForCategory(category: string): EditorialAuthor {
  return EDITORIAL_AUTHORS[category] || EDITORIAL_AUTHORS["청약-분양"];
}

/**
 * Editorial Standards (3대 발행 원칙)
 */
export const EDITORIAL_STANDARDS = [
  {
    title: "공식 고시 및 법령 원문 교차 검증",
    description: "국토교통부, 한국부동산원 청약홈, 법제처 국가법령정보센터, 주택도시보증공사(HUG)의 최신 공고문을 1차 원천으로 삼아 매주 화·금 정책 변경 사항을 교차 대조합니다.",
    icon: "ShieldCheck"
  },
  {
    title: "100% 무상·비영리 실수요자 관점",
    description: "특정 건설사, 분양대행사, 금융 중개업체의 대가성 광고 및 유료 추천을 일체 배제하며, 오직 무주택자와 신혼부부의 권익 보호와 금융 손실 방지 목적으로 집필합니다.",
    icon: "HeartHandshake"
  },
  {
    title: "신속한 오류 정정 및 투명한 이력 공개",
    description: "정부 주거 정책 및 대출 금리가 변동될 경우 24시간 이내에 해당 가이드 본문을 최신 개정판으로 개편하고, 개정 일자와 검수 책임자 서명을 투명하게 공개합니다.",
    icon: "RefreshCw"
  }
];
