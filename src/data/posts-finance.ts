import { Post } from "../types";

export const POSTS_FINANCE: Post[] = [
  {
    id: "finance-1",
    title: "인천 내 집 마련 대출 한도 계산: LTV·DSR·DTI 완벽 해설",
    excerpt: "인천에서 집을 사려는 실수요자를 위해 대출 한도를 결정하는 LTV·DSR·DTI 개념과 계산법을 쉽게 풀었습니다.",
    content: `
      <div class="toc-card">
        <p><strong>목차</strong></p>
        <ul>
          <li><a href="#section1">1. LTV (주택담보인정비율) - \"내가 사려는 집값의 몇 %까지 빌려주나\"</a></li>
          <li><a href="#section2">2. DSR (총부채원리금상환비율) - \"내 연소득 대비 총 빚의 비중\"</a></li>
          <li><a href="#section3">3. DTI (총부채상환비율) - \"주담대 원리금과 기타 이자의 비중\"</a></li>
          <li><a href="#section4">4. 2024-2025 핵심 규제 변화: 스트레스 DSR의 이해와 대응</a></li>
          <li><a href="#section5">5. 생애 최초 주택 구입자 및 서민 실거주 목적의 매수자 우대 조건</a></li>
        </ul>
      </div>
      <h2>주택담보대출 LTV, DSR, DTI 완벽 해설: 내 대출 한도 계산법</h2>
      <p>대출 한도는 자금 조달의 기본입니다. 내 연소득에 따른 DSR 차단선을 파악하지 않고 섣부르게 가계약을 맺으면 계약금을 몰취당하는 치명적인 위기를 부를 수 있습니다.</p>

      <h3 id="section1">1. LTV (주택담보인정비율)</h3>
      <p>LTV는 담보가치 대비 대출 가능 비율을 한정합니다. 생애 첫 매수자는 지역 무관 80%까지 지원되지만, 실제로는 DSR이 가용 한도를 깎아내립니다.</p>

      <h3 id="section2">2. DSR (총부채원리금상환비율) - 최대 방화벽</h3>
      <p>DSR 40%(은행권) 제한으로 인해, 신용 대출과 자동차 할부 등을 선제 상환하여 개인 DSR 분모 여유 폭을 최대화하는 지혜가 필요합니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-12</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-12",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    readTime: "21분",
    hashtags: ["주택담보대출", "LTV", "DSR", "DTI"]
  },
  {
    id: "finance-2",
    title: "인천 주택담보대출 상환 방식 비교: 원리금·원금·체증식 무엇이 유리할까",
    excerpt: "인천에서 주택담보대출을 받는 분들을 위해 세 가지 상환 방식의 차이와 본인에게 맞는 선택 기준을 정리했습니다.",
    content: `
      <h2>인천 주택담보대출 상환 방식 비교</h2>
      <p>매달 동일액을 상환하는 원리금균등, 원금이 빠르게 줄며 이자를 줄이는 원금균등, 청년들의 미래 소득 향상을 전진 배치하는 체증식 상환의 세 가지 흐름을 실전 시뮬레이션과 함께 대조해 드립니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-08</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-08",
    image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=800",
    readTime: "19분",
    hashtags: ["원리금균등", "원금균등", "체증식상환"]
  },
  {
    id: "finance-4",
    title: "인천 실수요자를 위한 디딤돌 대출 분석: 자격·한도·금리·절차",
    excerpt: "인천에서 내 집 마련을 준비하는 분들을 위해 디딤돌 대출의 자격 조건과 신청 절차를 한 번에 정리했습니다.",
    content: `
      <h2>디딤돌 대출 완벽 분석 가이드</h2>
      <p>주택도시기금 무주택 구입자금 공급망: 부부소득 합산 6,000만원 이하(신혼 8,500만원) 실수요자들을 위한 최적의 금리 할인 적용법과 절차 세부 정리를 기록했습니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-03</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-03",
    image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=800",
    readTime: "13분",
    hashtags: ["디딤돌대출", "정부지원대출", "주택도시기금"]
  },
  {
    id: "finance-5",
    title: "인천 주택연금 가입 전 따져야 할 5가지: 종신 vs 확정기간 수령액 비교",
    excerpt: "인천에서 주택연금을 고민하는 분들을 위해 지급 방식별 수령액과 가입 전 점검 사항을 정리했습니다.",
    content: `
      <h2>주택연금 완벽 가이드: 노후 자산 운용의 핵심 옵션</h2>
      <p>만 55세 이상 1주택자를 위한 평생 수령 종신지급과, 과도기에 자금을 집중하는 확정기간 지급의 세부 연금액 추산 자료를 수치와 함께 해석해 드립니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-14</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-14",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    readTime: "14분",
    hashtags: ["주택연금", "노후자금", "한국주택금융공사"]
  },
  {
    id: "finance-6",
    title: "인천 전세대출 한도 늘리는 5가지 방법: 소득·신용·우대조건 활용",
    excerpt: "인천에서 전세대출을 받는 분들을 위해 한도를 늘리는 현실적인 방법을 정리했습니다.",
    content: `
      <h2>전세대출 한도 늘리는 5가지 실전 방법</h2>
      <p>부부합산 소득 합산 신청, 미사용 카드 약정 한도 해제 통한 신용점수 정비, HUG와 HF 보증 기준별 한도 비교 등 세입자의 전세대금 승인액을 늘리는 알짜 노하우입니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-04</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-04",
    image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=800",
    readTime: "13분",
    hashtags: ["전세대출", "대출한도", "부부소득합산"]
  },
  {
    id: "finance-7",
    title: "인천 신혼·신생아 가구: 신생아 특례대출 vs 보금자리론 비교",
    excerpt: "인천에서 집을 마련하는 신혼·신생아 가구를 위해 두 정책대출의 유불리를 비교했습니다.",
    content: `
      <h2>신생아 특례대출 vs 보금자리론 완벽 비교</h2>
      <p>출산 가구 전용 1.6-3.3% 초저금리 특례 전입 한도(최대 5억)와, 장기 안정적인 고정금리로 거주 안정을 가꾸는 보금자리론(최대 3.6억)의 자격 우대를 1:1 대조합니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-15</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-15",
    image: "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?auto=format&fit=crop&q=80&w=800",
    readTime: "13분",
    hashtags: ["신생아특례대출", "보금자리론", "정책대출비교"]
  },
  {
    id: "finance-8",
    title: "주택담보대출 중도상환 수수료 줄이는 법: 면제 조건과 부분상환 전략",
    excerpt: "인천에서 주택담보대출을 보유한 분들을 위해 중도상환 수수료 면제 조건과 부분상환 전략을 정리했습니다.",
    content: `
      <h2>중도상환 수수료 줄이는 완벽 가이드</h2>
      <p>통상 대출 3년 경과 전 부과되는 1.2% 부근의 차감율을 줄이는 슬라이딩 원리, 매년 원금의 10~30%까지 무수료 상환하는 부분상환 우대 세팅을 가르쳐 드립니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-14</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-14",
    image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80&w=800",
    readTime: "13분",
    hashtags: ["중도상환수수료", "주택담보대출", "부분상환"]
  },
  {
    id: "finance-9",
    title: "다주택자 양도세 중과 재시행: 인천 다주택자가 알아야 할 변화",
    excerpt: "다주택자 양도세 중과 재시행으로 무엇이 달라졌는지, 인천에 집을 가진 분들 관점에서 정리했습니다.",
    content: `
      <h2>다주택자 양도세 중과 재시행 완벽 정리</h2>
      <p>조정대상지역 내 다주택 매도시 기본 소득 누진 구간에 최대 20~30%p 가산 중과가 진행되는 과세기준일(5월 10일) 대응 및 실효 양도세 시뮬레이션 지침입니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-13</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-13",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    readTime: "14분",
    hashtags: ["양도세중과", "다주택자", "양도소득세"]
  },
  {
    id: "finance-10",
    title: "1주택 장기보유특별공제 개편 논의: 인천 실거주자 영향은",
    excerpt: "장기보유특별공제 개편 논의가 인천의 똘똘한 한 채 실거주자에게 어떤 영향을 주는지 정리했습니다.",
    content: `
      <h2>1주택자 장기보유특별공제 개편, 무엇이 쟁점인가</h2>
      <p>1세대 1주택자의 실거주 보호(최대 80% 공제율 유지)와, 시세 띄우기 및 잦은 갈아타기 트랙의 횟수 제한 입법 검토 방향에 대비하는 전량 세무 분석입니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-14</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-14",
    image: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?auto=format&fit=crop&q=80&w=800",
    readTime: "13분",
    hashtags: ["장기보유특별공제", "1주택자", "양도세"]
  },
  {
    id: "finance-11",
    title: "스트레스 DSR 3단계 시행: 인천 실수요자 대출 한도 변화",
    excerpt: "스트레스 DSR 3단계 시행으로 줄어든 대출 한도를, 인천 소득별 사례로 시뮬레이션했습니다.",
    content: `
      <h2>스트레스 DSR 3단계, 무엇이 어떻게 달라지나</h2>
      <p>3단계 전면 가행 및 10.15 부동산 대책 대환 연동 가산세율 주입(수도권 주담대 최대 3% 적용)에 다른 연소득별(5천·7천·1억) 정밀 가용 한도 하락을 비교합니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-17</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-17",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800",
    readTime: "14분",
    hashtags: ["스트레스DSR", "DSR3단계", "대출한도"]
  },
  {
    id: "finance-12",
    title: "다주택자 주담대 만기연장 금지: 인천 매물 출회 전망",
    excerpt: "다주택자 주담대 만기연장 금지 시행이 인천 부동산 매물 흐름에 미칠 영향을 정리했습니다.",
    content: `
      <h2>다주택자 주담대 만기연장 금지, 무엇이 어떻게 달라지나</h2>
      <p>수도권 아파트 다주택 소유자들의 은행권 대출 연장 봉쇄 조치 시행에 따른 채무 정산 기한 임박과, 매수 기회를 맞이하게 된 무주택 실수요자들의 행동 전략입니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-18</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-18",
    image: "https://images.unsplash.com/photo-1559589689-577aabd1db4f?auto=format&fit=crop&q=80&w=800",
    readTime: "13분",
    hashtags: ["다주택자대출", "주담대만기연장", "가계부채관리"]
  },
  {
    id: "finance-13",
    title: "다주택자 양도세 중과 유예 종료: 인천 다주택자 점검 사항",
    excerpt: "양도세 중과 유예 종료로 달라진 점을, 인천에 집을 둔 다주택자 관점에서 정리했습니다.",
    content: `
      <h2>4년 만에 돌아온 중과세, 다주택자가 알아야 할 변화</h2>
      <p>다주택 가상세율 부활 시점 확인, 장기보유특별공제 폐지 영향 산정, 배우자 양도차익 합비 시점 분산 등 위기에서 한 발 앞서 전술을 펼치는 조세 체크입니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-19</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-19",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
    readTime: "13분",
    hashtags: ["다주택자", "양도세중과", "유예종료"]
  },
  {
    id: "finance-14",
    title: "'결혼 페널티' 논란: 인천 신혼부부 정책대출 소득 합산 문제",
    excerpt: "정책대출 소득 합산 탓에 혼인신고를 미루는 현상을, 인천 신혼부부 관점에서 정리했습니다.",
    content: `
      <h2>결혼이 대출에 불리해지는 역설</h2>
      <p>단독 소득 시 혜택 보장에서 혼인 신고 시 합산 기준 초과라는 주거 세테크 모순을 극복하는 대출 계약 실행 시점 조율 및 정책 트랙 정돈법을 설명합니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-20</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-20",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800",
    readTime: "12분",
    hashtags: ["결혼페널티", "정책대출", "소득합산"]
  },
  {
    id: "finance-15",
    title: "수도권 풍선효과 본격화: 서울 외곽서 경기·인천으로, 대체지역 옮겨가는 실수요",
    excerpt: "대출 규제와 토지거래허가구역 지정을 피해 실수요가 서울 외곽에서 경기·인천 비규제지역으로 옮겨가고 있습니다.",
    content: `
      <h2>규제를 피해 이동하는 수요, 풍선효과의 구조</h2>
      <p>서울 핵심지 토지거래허가와 대출 조임 풍선이 인천 송도·청라 등 비규제 신축 신도시로 갭메우기 수요를 유입시키는 수도권 세부 수급 사이클 규명서입니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-22</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-22",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    readTime: "11분",
    hashtags: ["풍선효과", "수도권부동산", "갭메우기"]
  },
  {
    id: "finance-16",
    title: "보유세 기준일 6월 1일: 인천 주택 보유자를 위한 절세 타이밍",
    excerpt: "6월 1일 보유세 기준일의 의미와 재산세·종부세 절세 타이밍을, 인천 주택 보유자 관점에서 정리했습니다.",
    content: `
      <h2>단 하루로 한 해 세금이 갈립니다</h2>
      <p>한 해의 소유세를 결정하는 6월 1일 과세 시점 판정의 법적 권리 이전 원리, 5월 31일 등기 마감과 6월 2일 매수 타이밍을 다룹니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-05-23</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-05-23",
    image: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&q=80&w=800",
    readTime: "11분",
    hashtags: ["보유세", "재산세", "종합부동산세"]
  },
  {
    id: "finance-17",
    title: "보유세 기준일, 인천 내 보유세 직접 계산하는 법과 공시가격 조회",
    excerpt: "인천 주택 보유자를 위해 보유세를 직접 계산하는 법과 공시가격 조회 방법을 정리했습니다.",
    content: `
      <h2>인천 내 보유세 직접 계산하는 법</h2>
      <p>부동산공시가격알리미 활용을 통한 공동주택 공시지가 확인, 재산새 및 종부세 계산 공식 주입, 고령/장유 공제 시뮬레이션 적용 수단을 다룹니다.</p>
      <p class="text-xs text-gray-400 mt-6">최종 업데이트: 2026-06-01</p>
    `,
    category: "대출-금융",
    author: "편집팀",
    date: "2026-06-01",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    readTime: "12분",
    hashtags: ["보유세시뮬레이션", "재산세계산", "종합부동산세"]
  }
];
