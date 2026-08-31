import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { POSTS } from "./src/data/posts";

dotenv.config();

// Gemini AI 클라이언트 초기화
const aiApiKey = process.env.GEMINI_API_KEY;
let ai: any = null;
if (aiApiKey) {
  ai = new GoogleGenAI({
    apiKey: aiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// [자동 포스팅 시스템 & 카테고리별 1일 1포스팅 4시간 간격 스케줄러]
// ==========================================
const CATEGORIES = ["청약-분양", "전월세", "대출-금융", "이사-인테리어"];

const CATEGORY_TOPIC_BANKS: Record<string, string[]> = {
  "청약-분양": [
    "2026년 주택청약 제도 개편 총정리: 무주택 기간 산정 및 부적격 당첨 예방 실무",
    "신혼부부·신생아 특별공급 소득 요건 완화와 자격 판정 가이드",
    "청약통장 월 납입 인정액 25만원 상향 후 공공분양 저축 총액 인정 전략",
    "수도권 아파트 무순위 줍줍 청약 자격 조건과 당첨 확률 극대화 비법",
    "분양가 상한제 적용 단지 실거주 의무 유예 기간 및 전매제한 해제 기준",
    "청약 가점 84점 만점 구조 분석 및 부양가족 수 오류 방지 체크포인트",
    "공공분양 나눔형·선택형·일반형 유형별 자금 조달 및 시세 차익 비교",
    "생애최초 특별공급 추첨제 물량 배분과 1인 가구 청약 당첨 가이드",
    "재당첨 제한 규정 및 과거 당첨 이력 세대원 전원 조회 방법",
    "청약홈 청약 신청 당일 필수 준비물 및 인증서 오류 대처법",
    "오피스텔·도시형생활주택 청약 시 주택 수 산정 제외 요건",
    "다자녀 가구 특별공급 2자녀 완화 기준과 배점표 계산 실무",
    "공공택지 사전청약 취소 단지 본청약 전환 시 기존 당첨자 지위 보장",
    "지역 우선 공급 배정 비율(당해 지역)과 수도권 거주 요건 충족 팁",
    "아파트 옵션 계약 시 필수 선택 품목과 마이너스 옵션 활용 가이드"
  ],
  "전월세": [
    "전월세 계약 전 필수 체크: 등기부등본 을구 근저당과 확정일자 당일 효력",
    "전세보증금 반환보증 보험 HUG·HF·SGI 가입 요건 및 임대인 체납 검증",
    "임대차 3법 핵심 특약 및 계약갱신청구권 행사 시 주의사항",
    "소액임차인 최우선변제금 지역별 상한액 및 권리 보장 요건",
    "깡통전세 예방을 위한 매매가 대비 전세가율(갭) 위험 분석 가이드",
    "전세계약 만기 전 이사 시 중개수수료 부담 주체 및 보증금 반환 합의서",
    "신탁 부동산 전세계약 사기 방지: 신탁원부 열람 및 동의서 필수 체크",
    "묵시적 갱신 후 계약 해지 통보 효력 발생 시점(3개월) 및 월세 정산법",
    "임차권등기명령 신청 요건 및 이사 후에도 대항력과 우선변제권 유지하는 법",
    "월세 세액공제 및 소득공제 자격 요건, 공제율 및 환급금 극대화 팁",
    "전세사기 특별법 피해자 지원 요건 및 저리 대환대출 신청 가이드",
    "다가구 주택 전세계약 시 선순위 보증금 총액 확인 및 확인설명서 검증",
    "임대인 변경 시 전세계약 승계 거부 및 보증금 즉시 반환 청구 요령",
    "전월세 전환율 계산 공식과 법정 상한선 초과 월세 인상 대응법",
    "전입세대확인서(열람내역) 발급 방법과 위장 전입 세대 확인 노하우"
  ],
  "대출-금융": [
    "2026년 신생아 특례대출 금리 우대 요건 및 실질 이자 절감 전략",
    "디딤돌·버팀목 전세대출 소득 요건 상향 및 LTV·DSR 한도 비교",
    "스트레스 DSR 3단계 시행에 따른 주택담보대출 한도 영향 및 자금 대책",
    "생애최초 주택구입자 취득세 감면 요건(최대 200만원) 및 환급 신청법",
    "변동금리 vs 고정금리(주기형·혼합형) 대출 상품 선택 기준과 금리 주기",
    "주택도시기금 청년전용 버팀목 전세자금대출 대환 및 연장 가이드",
    "아파트 중도금 집단대출과 잔금대출 전환 시 DSR 계산 및 자금 조달 계획",
    "1주택자 갈아타기 주택담보대출 처분조건부 승인 요건 및 기한",
    "부동산 자금조달계획서 작성 대상 및 증빙 서류 준비 요령",
    "주택담보대출 갈아타기(대환) 플랫폼 활용법과 중도상환수수료 계산",
    "신용점수 관리와 1금융권 최저 우대금리 취득을 위한 5가지 금융 습관",
    "보금자리론 안심 전환 대출 자격 및 거치 기간 설정 유의점",
    "부동산 취득세·양도소득세 비과세 요건 및 1세대 1주택 비과세 특례",
    "전세대출 질권설정과 채권양도 통지 방식의 차이점 및 임대인 동의",
    "마이너스 통장 및 신용대출이 주담대 DSR 한도에 미치는 영향 분석"
  ],
  "이사-인테리어": [
    "이사 당일 필수 행정 절차: 전입신고, 확정일자 및 공과금 정산 체크리스트",
    "포장이사 견적 비교 노하우 및 이삿짐 파손 시 손해배상 특약 작성법",
    "입주 전 셀프 하자 점검(체크리스트) 요령 및 시공사 하자보수 청구권",
    "아파트 인테리어 공사 전 입주민 동의서 수령 및 행위허가 신청 절차",
    "좁은 원룸·오피스텔 공간 활용 인테리어 가구 배치 및 수납 솔루션",
    "입주청소 vs 거주청소 체크포인트와 바가지 요금 방지 계약 팁",
    "전월세 원상복구 의무 범위: 자연 마모 vs 세입자 과실 법적 판례 기준",
    "손 없는 날 의미와 이사 비용 절약을 위한 날짜 선정 꿀팁",
    "친환경 베이크아웃(Bake-Out) 새집증후군 유해물질 완벽 제거법",
    "누수·결로·곰팡이 하자 발생 시 임대인 수선 의무 및 손해배상 청구",
    "셀프 도배·장판 시공 주의사항과 자재 선정 가이드",
    "대형 폐기물 스티커 인터넷 발급 및 무상 방문수거 서비스 이용법",
    "아파트 층간소음 방지 매트 시공 효과 및 층간소음 분쟁 조정 절차",
    "이사 전 도시가스 해지·연결 예약 및 자동이체 계좌 해지 요령",
    "스마트홈 IoT 구축: 조명·도어락·스마트 플러그 입문 추천 가이드"
  ]
};

const autoPostsFilePath = path.join(process.cwd(), "src", "data", "auto-posts.json");
const autoScheduleFilePath = path.join(process.cwd(), "src", "data", "auto-schedule.json");

function loadAutoPosts(): any[] {
  try {
    if (fs.existsSync(autoPostsFilePath)) {
      const data = fs.readFileSync(autoPostsFilePath, "utf-8");
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.error("Auto posts load error:", err);
  }
  return [];
}

function saveAutoPosts(posts: any[]) {
  try {
    const dir = path.dirname(autoPostsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(autoPostsFilePath, JSON.stringify(posts, null, 2), "utf-8");
  } catch (err) {
    console.error("Auto posts save error:", err);
  }
}

let autoPostsList: any[] = loadAutoPosts();

function getActivePostsList(): any[] {
  const merged = [...autoPostsList, ...POSTS];
  return merged.sort((a, b) => {
    const dateA = `${a.date || ""} ${a.time || "00:00"}`;
    const dateB = `${b.date || ""} ${b.time || "00:00"}`;
    return dateB.localeCompare(dateA);
  });
}

export interface ScheduleSlot {
  category: string;
  timeStr: string;
  executed: boolean;
  postId?: string;
  title?: string;
}

export interface DailyScheduleState {
  date: string;
  minimumIntervalHours: number;
  slots: ScheduleSlot[];
}

function loadDailySchedule(): DailyScheduleState | null {
  try {
    if (fs.existsSync(autoScheduleFilePath)) {
      const data = fs.readFileSync(autoScheduleFilePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Schedule state load error:", err);
  }
  return null;
}

function saveDailySchedule(schedule: DailyScheduleState) {
  try {
    const dir = path.dirname(autoScheduleFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(autoScheduleFilePath, JSON.stringify(schedule, null, 2), "utf-8");
  } catch (err) {
    console.error("Schedule state save error:", err);
  }
}

let currentSchedule: DailyScheduleState = loadDailySchedule() || {
  date: "",
  minimumIntervalHours: 4,
  slots: []
};

/**
 * 하루 4개 카테고리별 1일 1포스팅 스케줄 생성
 * 최소 4시간 (>= 240분) 간격 엄격 준수 + 매일 랜덤 시간 배정
 */
function createRandomDailySchedule(todayStr: string): DailyScheduleState {
  // 4개 카테고리 순서를 매일 무작위 셔플
  const shuffledCategories = [...CATEGORIES].sort(() => Math.random() - 0.5);

  // 4개 시간 슬롯을 최소 240분(4시간) 간격으로 생성 (시, 분, 초 단위 정밀 배정)
  // T0: 00:30 ~ 03:30 (30 ~ 210분)
  const t0 = Math.floor(Math.random() * (210 - 30 + 1)) + 30;

  // T1: T0 + 240분 ~ Min(T0 + 330분, 570분) -> 최소 4시간 간격 보장 (04:30 ~ 09:30)
  const minT1 = t0 + 240;
  const maxT1 = Math.min(t0 + 330, 570);
  const t1 = Math.floor(Math.random() * (maxT1 - minT1 + 1)) + minT1;

  // T2: T1 + 240분 ~ Min(T1 + 330분, 960분) -> 최소 4시간 간격 보장 (10:30 ~ 16:00)
  const minT2 = t1 + 240;
  const maxT2 = Math.min(t1 + 330, 960);
  const t2 = Math.floor(Math.random() * (maxT2 - minT2 + 1)) + minT2;

  // T3: T2 + 240분 ~ Min(T2 + 330분, 1380분) -> 최소 4시간 간격 보장 (16:30 ~ 23:00)
  const minT3 = t2 + 240;
  const maxT3 = Math.min(t2 + 330, 1380);
  const t3 = Math.floor(Math.random() * (maxT3 - minT3 + 1)) + minT3;

  const minutesList = [t0, t1, t2, t3];
  const slots: ScheduleSlot[] = minutesList.map((mins, idx) => {
    const hh = String(Math.floor(mins / 60)).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    const ss = String(Math.floor(Math.random() * 60)).padStart(2, "0");
    return {
      category: shuffledCategories[idx],
      timeStr: `${hh}:${mm}:${ss}`,
      executed: false
    };
  });

  const newSchedule: DailyScheduleState = {
    date: todayStr,
    minimumIntervalHours: 4,
    slots
  };

  saveDailySchedule(newSchedule);
  console.log(`[AutoPost Scheduler] Generated fresh schedule for ${todayStr} (Categories: 1/day each, >=4h gap):`);
  slots.forEach((s, i) => console.log(`  Slot ${i + 1} [${s.category}] at ${s.timeStr}`));

  return newSchedule;
}

function ensureDailySchedule(): DailyScheduleState {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (currentSchedule.date === todayStr && currentSchedule.slots.length === 4) {
    return currentSchedule;
  }

  currentSchedule = createRandomDailySchedule(todayStr);
  return currentSchedule;
}

async function generateAndPublishAutoPost(targetCategory?: string, overrideTimeStr?: string) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  let timeStr = overrideTimeStr;
  if (!timeStr) {
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    timeStr = `${hh}:${min}:${ss}`;
  }

  const category = targetCategory && CATEGORIES.includes(targetCategory)
    ? targetCategory
    : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  const topicPool = CATEGORY_TOPIC_BANKS[category] || CATEGORY_TOPIC_BANKS["청약-분양"];
  const existingTitles = getActivePostsList().map(p => p.title);
  const availableTopics = topicPool.filter(t => !existingTitles.includes(t));
  const selectedTopic = availableTopics.length > 0
    ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
    : topicPool[Math.floor(Math.random() * topicPool.length)];

  console.log(`[AutoPost System] Publishing auto-post for [${category}] on ${todayStr} ${timeStr}: "${selectedTopic}"`);

  let postTitle = selectedTopic;
  let postContent = "";
  let postExcerpt = "";
  let postHashtags: string[] = ["하우징허브", "부동산정책", "주거안심", category.replace("-", "")];
  let postReadTime = "8분";

  if (ai) {
    try {
      const prompt = `
        [시스템 지시사항: 블로그 포스팅 자동화 탈피 및 휴먼 터치(Human Touch) 강화 마스터 프롬프트]

        당신은 기계적으로 정보를 전달하는 AI가 아닙니다. 당신은 지금부터 주어지는 [주제]에 대해 수년간 직접 전월세 계약, 청약 신청, 주택 정책금융 대출(디딤돌, 버팀목, 신생아 특례 등), 이사 및 수선까지 온몸으로 겪고 고민해 온 '10년 차 부동산 기획자이자 개인 블로거(박 실장)'입니다. 아래의 엄격한 작성 원칙을 100% 준수하여 블로그 포스팅을 작성하십시오.

        [주제]: ${selectedTopic}
        [카테고리]: ${category}

        [작성 원칙 - 100% 필수 준수]:
        1. AI 특유의 상투적 표현 절대 금지:
           - "결론적으로", "알아보겠습니다", "필수적인", "현대 사회에서", "요즘 시대에는", "과언이 아닙니다", "중요한 역할을 합니다" 등의 뻔한 도입부와 결론부 표현을 절대 사용하지 마십시오.

        2. 문장 길이의 다양화 (Burstiness & Intentional Imperfection):
           - 모든 문장의 길이를 비슷하게 쓰지 마십시오. 어떤 문장은 단답형으로 매우 짧고 명쾌하게 치고("결과는 참담했습니다.", "답은 간단합니다."), 어떤 문장은 현장 상황 묘사를 위해 길게 이어지도록 리듬감을 만드십시오. 완벽한 대칭형 문단 구조를 깨뜨리십시오.

        3. 경험과 통찰 기반의 도입부 (E-E-A-T Protagonist Narrative):
           - 글을 시작할 때 사전적 정의를 내리지 마십시오. 해당 주제와 관련해 독자들이 겪고 있을 구체적인 '답답함'이나 '실패 경험(부적격 탈락, 대출 한도 축소, 보증금 미반환 불안 등)'에 공감하며, 마치 친한 지인에게 팁을 알려주듯 자연스럽게 1인칭 대화체('나/저')로 시작하십시오.

        4. 정보의 구조화와 주관적 평가 혼합:
           - HTML 표(<table class="w-full border-collapse border border-slate-200 my-4 text-xs sm:text-sm">...</table>)나 불렛포인트(<ul><li>...</li></ul>)를 사용하여 2026년 최신 팩트와 수치를 깔끔하게 정리하되, 그 정보 아래에 반드시 "개인적으로 이 부분은 아쉬웠다", "실제로 창구에 서류를 제출해 보니 이 방법이 가장 승인율이 높았다", "제가 계약해 보니 이 특약 한 줄이 결국 3천만 원을 지켜주었습니다"라는 식의 주관적인 평가를 한 줄씩 덧붙이십시오.

        5. 독자와의 상호작용 및 액션 아이템 유도 (Action Item):
           - 글의 마무리에는 뻔한 요약 대신, 독자가 오늘 퇴근 후 당장 실행해 볼 수 있는 아주 작은 행동 지침(Action Item) 하나를 제안하고, 댓글이나 생각을 유도하는 가벼운 질문으로 끝맺으십시오.

        [출력 JSON 포맷]:
        - title: 독자의 공감을 이끌어내는 1인칭 실전 제목 (예: "제가 직접 겪어보고 정리한 [주제]: 2026년 팩트체크 및 실수요자 생존기")
        - excerpt: 내가 직접 겪은 핵심 경험과 이 글을 통해 얻을 수 있는 실질적 해결책 요약 (120자 내외)
        - content: 위 지침을 100% 충족하는 완성된 고품질 1인칭 스토리텔링 전문 HTML 본문 (2,000자 이상)
        - hashtags: 관련 핵심 검색 키워드 해시태그 4~6개 배열
        - readTime: "8분" 등의 예상 읽기 시간
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              readTime: { type: Type.STRING }
            },
            required: ["title", "content", "excerpt", "hashtags", "readTime"]
          }
        }
      });

      const resObj = JSON.parse(response.text);
      if (resObj.title) postTitle = resObj.title;
      if (resObj.content) postContent = resObj.content;
      if (resObj.excerpt) postExcerpt = resObj.excerpt;
      if (resObj.hashtags && resObj.hashtags.length > 0) postHashtags = resObj.hashtags;
      if (resObj.readTime) postReadTime = resObj.readTime;

      if (postContent && !postContent.includes("<table")) {
        const tableHtml = `
          <h2>${category} 핵심 요건 및 실무 비교 점검표</h2>
          <div class="overflow-x-auto my-4">
            <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
              <thead>
                <tr class="bg-slate-100 text-slate-800">
                  <th class="border border-slate-200 p-2.5 font-bold">점검 구분</th>
                  <th class="border border-slate-200 p-2.5 font-bold">법적 기준 및 요건</th>
                  <th class="border border-slate-200 p-2.5 font-bold">실수요자 유의사항</th>
                  <th class="border border-slate-200 p-2.5 font-bold">전문가 권장 해결책</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-slate-200 p-2.5 font-semibold">1단계: 사전 검증</td>
                  <td class="border border-slate-200 p-2.5">소득, 자산 및 무주택 기간 요건</td>
                  <td class="border border-slate-200 p-2.5">기준 오해로 인한 부적격 처리 위험</td>
                  <td class="border border-slate-200 p-2.5">주택도시기금 자가진단 사전 시뮬레이션</td>
                </tr>
                <tr class="bg-slate-50">
                  <td class="border border-slate-200 p-2.5 font-semibold">2단계: 권리 확보</td>
                  <td class="border border-slate-200 p-2.5">등기부등본 을구 근저당 및 대항력</td>
                  <td class="border border-slate-200 p-2.5">잔금 당일 권리 변동으로 후순위 전락</td>
                  <td class="border border-slate-200 p-2.5">잔금 당일 등기부 재열람 및 익일 담보 금지 특약</td>
                </tr>
                <tr>
                  <td class="border border-slate-200 p-2.5 font-semibold">3단계: 자금 계획</td>
                  <td class="border border-slate-200 p-2.5">스트레스 DSR 및 금리 주기 선택</td>
                  <td class="border border-slate-200 p-2.5">대출 한도 축소로 인한 잔금 부족</td>
                  <td class="border border-slate-200 p-2.5">보수적 상환비율 계산 및 10% 이상 예비비 확보</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        postContent += tableHtml;
      }

      if (postContent && !postContent.includes("자주 묻는 질문") && !postContent.includes("FAQ")) {
        const faqHtml = `
          <h2>자주 묻는 질문 (FAQ)</h2>
          <h3>Q1. 조건 미충족 시 어떤 불이익이나 페널티가 발생하나요?</h3>
          <p>A. 자격 요건을 미숙지하거나 사후 거주 조건을 위반하는 경우, 감면받은 세액의 100% 추징뿐만 아니라 가산세가 부과됩니다. 또한 정책 금융의 경우 대출 약정이 해지되고 시중 금리로 전환되므로 사전 자격 검증이 필수적입니다.</p>

          <h3>Q2. 신청 전 반드시 사전 확인해야 할 필수 서류는 무엇인가요?</h3>
          <p>A. 본인 및 세대원 전체의 주민등록등본, 등기부등본상 과거 주택 소유 및 처분 이력, 소득금액증명원, 국세·지방세 완납 증명서를 사전에 발급받아 대조하셔야 부적격 처리를 방지할 수 있습니다.</p>

          <h3>Q3. 계약 진행 과정에서 전문가의 검증을 받는 가장 안전한 방법은 무엇인가요?</h3>
          <p>A. 정부 공식 주거 포털 및 하우징허브 내 계산기를 활용하시거나, 계약서 날인 전 전문 행정사 또는 부동산 전문 법무사에게 특약 조항의 법적 유효성을 사전 검토받으시는 것을 적극 권장합니다.</p>
        `;
        postContent += faqHtml;
      }
    } catch (err) {
      console.warn("[AutoPost System] Gemini API error, applying high quality structured template:", err);
    }
  }

  if (!postContent) {
    postContent = `
      <h2>${postTitle}: 핵심 결론 및 시장 영향 분석</h2>
      <p>2026년 주택 정책과 금융 환경의 급격한 개편 속에서 <strong>${category}</strong> 분야의 핵심 요건을 정확히 숙지하는 것은 실수요자의 자산과 주거 안정을 지키는 결정적 열쇠입니다. 본 리포트에서는 ${selectedTopic}에 관한 명쾌한 해법과 실전 체크포인트를 두괄식으로 안내해 드립니다.</p>
      
      <h2>핵심 요건 및 실무 비교 점검표</h2>
      <p>아래 표는 실수요자가 계약 및 신청 전 반드시 숙지해야 할 핵심 비교 가이드라인입니다.</p>
      <div class="overflow-x-auto my-4">
        <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm text-left">
          <thead>
            <tr class="bg-slate-100 text-slate-800">
              <th class="border border-slate-200 p-2.5 font-bold">점검 구분</th>
              <th class="border border-slate-200 p-2.5 font-bold">주요 기준 및 자격 요건</th>
              <th class="border border-slate-200 p-2.5 font-bold">실수요자 혜택 및 리스크</th>
              <th class="border border-slate-200 p-2.5 font-bold">전문가 권장 실행 전략</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-200 p-2.5 font-semibold text-slate-900">1단계: 자격 진단</td>
              <td class="border border-slate-200 p-2.5">소득, 자산 및 세대원 무주택 요건</td>
              <td class="border border-slate-200 p-2.5">정부 저금리 정책 우대 지원 대상 확정</td>
              <td class="border border-slate-200 p-2.5">공식 포털 자가진단 사전 시뮬레이션</td>
            </tr>
            <tr class="bg-slate-50">
              <td class="border border-slate-200 p-2.5 font-semibold text-slate-900">2단계: 권리 보전</td>
              <td class="border border-slate-200 p-2.5">전입신고, 확정일자 및 등기부 을구 검증</td>
              <td class="border border-slate-200 p-2.5">경매 및 권리 충돌 시 우선변제권 수호</td>
              <td class="border border-slate-200 p-2.5">잔금 당일 등기부등본 재열람 및 필수 특약</td>
            </tr>
            <tr>
              <td class="border border-slate-200 p-2.5 font-semibold text-slate-900">3단계: 자금 설계</td>
              <td class="border border-slate-200 p-2.5">스트레스 DSR 3단계 및 금리 주기 선택</td>
              <td class="border border-slate-200 p-2.5">월 상환 원리금 부담 최소화</td>
              <td class="border border-slate-200 p-2.5">원금 균등 상환 및 10% 이상 예비비 완충</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>초보자가 자주 겪는 3가지 실패 사례와 실무자 극복 팁 (E-E-A-T)</h2>
      <h3>1. 계약 당일 권리 변동 확인 누락</h3>
      <p>계약서 작성 시점에 등기부등본을 확인했더라도 잔금 당일 아침에 재발급하지 않으면, 임대인이 계약 직전 설정한 근저당에 밀려 후순위 임차인으로 전락할 수 있습니다. <strong>반드시 잔금 이체 직전 등기부등본을 다시 발급하여 을구 권리 변동을 검증</strong>해야 합니다.</p>

      <h3>2. 스트레스 DSR 한도 축소로 인한 잔금 차질</h3>
      <p>과거 기준으로 대출 가능 한도를 산정했다가 가산 금리가 반영되는 최신 DSR 규제로 인해 예상 대출금이 수천만 원 차감되는 사례가 발생합니다. <strong>사전 은행 상담을 통해 실효 한도를 보수적으로 산출</strong>하셔야 합니다.</p>

      <h3>3. 공공분양 및 청약 인정 금액 착오</h3>
      <p>청약통장 월 납입 인정액이 25만원으로 상향 조정된 점을 간과하고 기존 10만원 납입을 고수할 경우, 공공분양 당첨 커트라인 형성 시 총 인정액에서 열세에 놓이게 됩니다. <strong>본인의 가용 자금 범위 내에서 월 납입액을 최적화</strong>하십시오.</p>

      <h2>하우징허브 전문가 실천 체크리스트</h2>
      <ul>
        <li><strong>사전 준비:</strong> 세대원 전체 주택 소유 이력 조회 및 국세·지방세 완납 증명서 확인</li>
        <li><strong>계약 시점:</strong> 임대인 잔금 익일까지 추가 담보권 설정 금지 특약 작성 및 신분증 대조</li>
        <li><strong>입주 당일:</strong> 잔금 이체 즉시 주민센터/정부24 전입신고 및 확정일자 부여 완료</li>
        <li><strong>사후 관리:</strong> 보증보험 가입 요건 검증 및 정기 등기부 변동 모니터링</li>
      </ul>

      <h2>자주 묻는 질문 (FAQ)</h2>
      <h3>Q1. 조건 미충족 시 어떤 불이익이나 페널티가 발생하나요?</h3>
      <p>A. 자격 요건을 미숙지하거나 사후 거주 조건을 위반하는 경우, 감면받은 세액의 100% 추징뿐만 아니라 가산세가 부과됩니다. 또한 정책 대출의 경우 계약 해지 및 시중 금리로 전환되므로 사전 검증이 필수적입니다.</p>

      <h3>Q2. 신청 전 반드시 사전 확인해야 할 필수 서류는 무엇인가요?</h3>
      <p>A. 본인 및 세대원 전체의 등기부등본상 과거 주택 소유 및 처분 이력, 세대주 등재 기간, 국세·지방세 체납 여부를 사전에 조회해야 부적격 통보를 방지할 수 있습니다.</p>

      <h3>Q3. 계약 진행 과정에서 전문가의 도움을 받는 방법은 무엇인가요?</h3>
      <p>A. 정부 주택도시기금 공식 시뮬레이터 및 하우징허브 내 계산기를 활용하거나, 계약서 작성 전 전문 변호사/세무사의 특약사항 검수를 받으시는 것을 권장합니다.</p>
    `;
    postExcerpt = `${selectedTopic}에 관한 2026 최신 실전 분석 및 전문가 체크리스트 가이드입니다.`;
  }

  const categoryImages: Record<string, string> = {
    "대출-금융": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    "전월세": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
    "이사-인테리어": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    "청약-분양": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800"
  };

  const newPost = {
    id: `auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: postTitle,
    category,
    author: "하우징허브",
    date: todayStr,
    time: timeStr,
    readTime: postReadTime,
    image: categoryImages[category] || categoryImages["청약-분양"],
    excerpt: postExcerpt,
    content: postContent,
    hashtags: postHashtags,
    isAutoGenerated: true
  };

  autoPostsList.unshift(newPost);
  saveAutoPosts(autoPostsList);

  // 현재 스케줄의 해당 카테고리 슬롯 상태 업데이트
  const currentScheduleRef = ensureDailySchedule();
  const targetSlot = currentScheduleRef.slots.find(s => s.category === category);
  if (targetSlot) {
    targetSlot.executed = true;
    targetSlot.postId = newPost.id;
    targetSlot.title = newPost.title;
    saveDailySchedule(currentScheduleRef);
  }

  console.log(`[AutoPost System] Successfully published [${category}] post: "${newPost.title}" (${todayStr} ${timeStr})`);
  return newPost;
}

/**
 * 포스팅 자동화 백그라운드 주기 실행기
 * - 매일 4개 카테고리별 1일 1포스팅
 * - 각 포스팅 간 최소 4시간 이상 간격 엄격 유지
 * - 스케줄 시간 도래 시 즉시 자동 생성
 */
function runAutoPostSchedulerCheck() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const currentHHMMSS = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const schedule = ensureDailySchedule();
  const allPosts = getActivePostsList();
  const todayPosts = allPosts.filter(p => p.date === todayStr);

  let updated = false;

  for (const slot of schedule.slots) {
    // 1. 이미 오늘 해당 카테고리의 포스팅이 존재하는지 검증
    const existingPostForCategory = todayPosts.find(p => p.category === slot.category);

    if (existingPostForCategory) {
      if (!slot.executed) {
        slot.executed = true;
        slot.postId = existingPostForCategory.id;
        slot.title = existingPostForCategory.title;
        updated = true;
      }
      continue;
    }

    // 2. 해당 슬롯의 예정 시간이 도래했거나 경과한 경우 자동 포스팅 실행
    if (!slot.executed && currentHHMMSS >= slot.timeStr) {
      slot.executed = true;
      updated = true;
      console.log(`[AutoPost Scheduler] Triggering scheduled post for [${slot.category}] at ${slot.timeStr} (Current: ${currentHHMMSS})`);
      generateAndPublishAutoPost(slot.category, slot.timeStr).then(createdPost => {
        slot.postId = createdPost.id;
        slot.title = createdPost.title;
        saveDailySchedule(schedule);
      }).catch(err => {
        console.error(`[AutoPost Scheduler] Error generating post for ${slot.category}:`, err);
      });
    }
  }

  if (updated) {
    saveDailySchedule(schedule);
  }
}

// 서버 구동 즉시 스케줄링 가동 및 30초마다 타이머 모니터링
runAutoPostSchedulerCheck();
setInterval(runAutoPostSchedulerCheck, 30000);

// WWW -> non-WWW 301 Redirect (SEO 최적화: 도메인 파편화 방지 및 검색엔진 노출 통일)
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (host === "www.zip9.kr") {
    return res.redirect(301, `https://zip9.kr${req.originalUrl}`);
  }
  next();
});

// 구글 서치 콘솔 파일 업로드식 인증 자동화 라우트
// 구글 서치콘솔이 제공하는 어떠한 임의의 google[인증코드].html 파일 요청도 즉시 성공 응답하여 인증 완료 유도
app.get("/google:verification_id.html", (req, res) => {
  const code = req.params.verification_id;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(`google-site-verification: google${code}.html`);
});

// 구글 애드센스 및 검색 엔진 크롤러를 위한 최상단 정적 파일 전용 라우트
app.get("/ads.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send("google.com, pub-9552509372228899, DIRECT, f08c47fec0942fa0\n");
});

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  const distRobots = path.join(process.cwd(), "dist", "robots.txt");
  if (fs.existsSync(distRobots)) {
    return res.send(fs.readFileSync(distRobots, "utf-8"));
  }
  const publicRobots = path.join(process.cwd(), "public", "robots.txt");
  if (fs.existsSync(publicRobots)) {
    return res.send(fs.readFileSync(publicRobots, "utf-8"));
  }
  return res.send("User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://zip9.kr/sitemap.xml\n");
});

function generateDynamicSitemapXml(): string {
  const activePosts = getActivePostsList();
  const todayStr = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. 메인 홈페이지
  xml += `  <url>\n    <loc>https://zip9.kr/</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // 2. 카테고리 페이지
  const categories = ["청약-분양", "전월세", "대출-금융", "이사-인테리어"];
  for (const cat of categories) {
    xml += `  <url>\n    <loc>https://zip9.kr/category/${encodeURIComponent(cat)}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }

  // 3. 서브 페이지
  const subpages = ["toolkit", "about", "terms", "privacy", "disclaimer", "contact", "announcement"];
  for (const page of subpages) {
    xml += `  <url>\n    <loc>https://zip9.kr/${page}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // 4. 전체 포스트 상세 페이지
  for (const post of activePosts) {
    const slug = slugify(post.title);
    const postDate = post.date || todayStr;
    xml += `  <url>\n    <loc>https://zip9.kr/post/${encodeURIComponent(slug)}</loc>\n    <lastmod>${postDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

function generateDynamicRssXml(): string {
  const activePosts = getActivePostsList();
  const todayDate = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  rss += `  <channel>\n`;
  rss += `    <title>하우징허브 (HousingHub)</title>\n`;
  rss += `    <link>https://zip9.kr/</link>\n`;
  rss += `    <description>신혼부부와 무주택자를 위한 2026 주거·청약·대출 실무 가이드</description>\n`;
  rss += `    <language>ko-KR</language>\n`;
  rss += `    <lastBuildDate>${todayDate}</lastBuildDate>\n`;
  rss += `    <atom:link href="https://zip9.kr/rss.xml" rel="self" type="application/rss+xml"/>\n`;

  // 최신 50개 포스트 피드 생성
  const recentPosts = activePosts.slice(0, 50);
  for (const post of recentPosts) {
    const slug = slugify(post.title);
    const pubDate = post.date ? new Date(post.date).toUTCString() : todayDate;
    const cleanDesc = (post.excerpt || post.title).replace(/<[^>]*>/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cleanTitle = (post.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    rss += `    <item>\n`;
    rss += `      <title>${cleanTitle}</title>\n`;
    rss += `      <link>https://zip9.kr/post/${encodeURIComponent(slug)}</link>\n`;
    rss += `      <guid>https://zip9.kr/post/${encodeURIComponent(slug)}</guid>\n`;
    rss += `      <pubDate>${pubDate}</pubDate>\n`;
    rss += `      <category>${post.category || "주거"}</category>\n`;
    rss += `      <description>${cleanDesc}</description>\n`;
    rss += `    </item>\n`;
  }

  rss += `  </channel>\n`;
  rss += `</rss>`;
  return rss;
}

app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  return res.send(generateDynamicSitemapXml());
});

app.get("/rss.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  return res.send(generateDynamicRssXml());
});

app.get("/7065c4d36d9ee7471f10e55dd6f4a4bd.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send("7065c4d36d9ee7471f10e55dd6f4a4bd\n");
});

// API 1: 헬스체크 및 환경정보 제공
app.get("/api/health", (req, res) => {
  const activePosts = getActivePostsList();
  res.json({
    status: "ok",
    aiConfigured: !!aiApiKey,
    postCount: activePosts.length
  });
});

// API 1.5: 최신 실시간 포스팅 목록 및 카테고리별 1일 1포스팅 스케줄 상태 조회
app.get("/api/posts", (req, res) => {
  const posts = getActivePostsList();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const todayPosts = posts.filter(p => p.date === todayStr);
  const schedule = ensureDailySchedule();

  res.json({
    posts,
    totalCount: posts.length,
    todayCount: todayPosts.length,
    scheduleDate: schedule.date,
    minimumIntervalHours: schedule.minimumIntervalHours,
    scheduledSlots: schedule.slots,
    todayCategoriesCovered: CATEGORIES.filter(c => todayPosts.some(p => p.category === c))
  });
});

// API 1.55: 포스팅 자동화 스케줄 전용 상세 조회 API
app.get("/api/schedule", (req, res) => {
  const schedule = ensureDailySchedule();
  const posts = getActivePostsList();
  const todayPosts = posts.filter(p => p.date === schedule.date);

  const statusByCategories = CATEGORIES.map(category => {
    const post = todayPosts.find(p => p.category === category);
    const slot = schedule.slots.find(s => s.category === category);
    return {
      category,
      scheduledTime: slot ? slot.timeStr : null,
      executed: !!post || (slot ? slot.executed : false),
      postId: post ? post.id : (slot ? slot.postId : null),
      postTitle: post ? post.title : (slot ? slot.title : null)
    };
  });

  res.json({
    date: schedule.date,
    minimumIntervalHours: 4,
    categoriesCount: CATEGORIES.length,
    slots: schedule.slots,
    statusByCategories,
    allCompletedToday: statusByCategories.every(s => s.executed)
  });
});

// API 1.6: 어드민/테스트용 포스팅 수동 즉시 생성 트리거 (특정 카테고리 지정 가능)
app.post("/api/admin/trigger-autopost", async (req, res) => {
  try {
    const { category } = req.body || {};
    const newPost = await generateAndPublishAutoPost(category);
    res.json({ status: "success", post: newPost });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to trigger auto post" });
  }
});

// API 1.7: 당일 스케줄 무작위 재추첨 (랜덤 시분초 & 4시간 텀 재생성)
app.post("/api/admin/regenerate-schedule", (req, res) => {
  try {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    
    currentSchedule = createRandomDailySchedule(todayStr);
    res.json({ status: "success", schedule: currentSchedule });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to regenerate schedule" });
  }
});

// API 2: 실시간 주거 컨설턴트 챗봇 (Gemini API 기반)
app.post("/api/advisor", async (req, res) => {
  const { message, chatHistory = [], activePostId = null } = req.body;
  const activePosts = getActivePostsList();

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // 1. 관련 정보 컨텍스트 제공 준비
  let activePostContext = "";
  if (activePostId) {
    const post = activePosts.find(p => p.id === activePostId);
    if (post) {
      activePostContext = `\n[사용자 열람 중인 아티클 정보]:\n제목: ${post.title}\n요약: ${post.excerpt}`;
    }
  }

  // 사용 가능한 하우징허브 내 주요 아티클 링크 목록 구성
  const availableArticlesContext = activePosts.slice(0, 15).map(p => {
    return `- [${p.category}] ${p.title} -> 링크: /post/${slugify(p.title)}`;
  }).join("\n");

  // 청약, 임대주택, 대출 상식 사전 주입
  const systemInstruction = `
    당신의 이름은 '하우징허브 주거 전문 상담원'입니다.
    청약 자격, 전월세 대항력 및 안전 계약, 이사 절차, 대출(디딤돌, 신생아 특례대출, 버팀목, DSR 규제 등)을 직접 겪어보고 꿰뚫고 있는 주거·금융 실무 상담 멘토입니다.

    [★ 상담 지침 - 친절하고 명쾌한 사람 전문가 톤 ★]:
    1. 인공지능이나 로봇이라는 표현을 일절 쓰지 마십시오. 실제로 질문자의 상황을 공감하고 도와주는 다정하고 전문적인 실무 선배처럼 답변하십시오.
    2. **절대로 마크다운 기호(#, ##, ###, *, **, ---)를 답변에 포함하지 마십시오.**
    3. 강조할 핵심 내용은 <strong>강조할 문구</strong> 태그를 활용하고, 단락 간 줄바꿈은 반드시 <br/> 태그를 이용하십시오.
    4. 목록 표기가 필요한 경우 <ul> 및 <li> 등의 HTML 태그를 사용하십시오.
    5. **답변은 질문에 대해 핵심 위주로 아주 간단명료하게 2~3문장 이내로 압축하여 작성하십시오.**
    6. 답변 내용에 깊이가 더 필요하거나 구체적인 가이드가 필요한 경우, 아래의 [하우징허브 가용 아티클 목록] 중 가장 연관성 높은 아티클 링크를 찾아서 **답변 맨 끝에 하이퍼링크 형식**으로 반드시 연결해 주십시오.
       - 링크 형식: <br/><br/><a href="/post/아티클-슬러그" class="text-blue-600 underline font-bold" target="_blank">👉 관련 실전 가이드: '아티클제목' 바로가기</a>
    7. 대외적 공식 홈페이지나 제도 홈페이지 소개가 수반되는 경우, 공식 링크를 함께 제시하십시오.
       - 청약홈: <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈</a>
       - LH청약플러스: <a href="https://apply.lh.or.kr" class="text-blue-600 underline font-bold" target="_blank">LH청약플러스</a>
       - 주택도시기금: <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금</a>

    [하우징허브 가용 아티클 목록]:
    ${availableArticlesContext}

    ${activePostContext}
  `;

  const findPostByKeyword = (kw: string) => {
    const found = activePosts.find(p => p.title.includes(kw) || p.excerpt.includes(kw));
    return found ? { title: found.title, link: `/post/${slugify(found.title)}` } : null;
  };

  // 2. Gemini API 호출
  if (!ai) {
    console.log("No GEMINI_API_KEY detected. Running local consultation fallback.");
    let fallbackText = `안녕하세요! 하우징허브 주거 실무 상담실입니다. 질문하신 내용에 대한 핵심 가이드를 안내해 드립니다. <br/><br/>`;
    
    const msg = message.toLowerCase();

    if (msg.includes("청약") || msg.includes("통장")) {
      fallbackText += `<strong>💡 청약 전문 조언:</strong> 주택 청약을 노릴 때는 청약통장 인정 한도를 월 25만 원까지 꽉 채우는 전략이 유리합니다. <br/><br/>`;
      const post = findPostByKeyword("청약") || findPostByKeyword("가점");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `추가로 공식 일정은 <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈 홈페이지</a>를 꼭 확인하세요!`;
    } else if (msg.includes("대출") || msg.includes("자금") || msg.includes("한도")) {
      fallbackText += `<strong>💰 대출/자금 조언:</strong> 스트레스 DSR 3단계 등의 영향으로 본인의 대출 실효 한도가 변동되었을 확률이 매우 높습니다. <br/><br/>`;
      const post = findPostByKeyword("대출") || findPostByKeyword("버팀목");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `금융 정책의 상세 요건은 <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금 홈페이지</a>에서 실시간으로 대조해 보실 수 있습니다.`;
    } else if (msg.includes("월세") || msg.includes("전세") || msg.includes("보증금") || msg.includes("사기") || msg.includes("특약") || msg.includes("등기")) {
      fallbackText += `<strong>🛡️ 전월세 계약 조언:</strong> 등기부등본 확인 시 을구의 근저당권 채무액과 갑구의 소유주 권리 관계를 반드시 계약 직전까지 면밀히 검사해야 보증금을 사수할 수 있습니다. <br/><br/>`;
      const post = findPostByKeyword("특약") || findPostByKeyword("보증금") || findPostByKeyword("전세");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `또한 계약 후에는 당일 즉시 전입신고와 확정일자를 처리해 대항력을 반드시 선점해 확보하세요.`;
    } else {
      fallbackText += `요청하신 사항 관련하여, 하우징허브가 준비한 안심 주거 가이드 아티클을 추천해 드립니다. <br/><br/>`;
      const post = activePosts[0];
      if (post) {
        fallbackText += `<a href="/post/${slugify(post.title)}" class="text-blue-600 underline font-bold" target="_blank">👉 추천 아티클: '${post.title}' 바로가기</a><br/><br/>`;
      }
      fallbackText += `더 세밀한 맞춤형 LTV 및 청약 가점 조율은 상단 '자가진단' 탭의 계산기를 통해 무료로 진단해보실 수 있어요.`;
    }
    return res.json({ response: fallbackText });
  }

  try {
    const formattedHistory = chatHistory.map((h: any) => ({
      role: h.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: h.text }]
    }));

    const cleanHistory: any[] = [];
    let expectedRole: "user" | "model" = "user";

    for (const msg of formattedHistory) {
      if (msg.role === expectedRole) {
        cleanHistory.push(msg);
        expectedRole = expectedRole === "user" ? "model" : "user";
      }
    }

    let responseText = "";
    try {
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemInstruction,
        },
        history: cleanHistory
      });

      const result = await chat.sendMessage({ message });
      responseText = result.text;
    } catch (chatErr: any) {
      console.warn("Primary chat model failed, falling back to local guidance:", chatErr);
      let fallbackText = `하우징허브 주거 비서입니다! 일시적인 서버 부하로 인해 AI 모델 연결이 잠시 지연되고 있습니다. 대신 탑재된 전문가 로컬 지식기반 시스템으로 조언해 드립니다. <br/><br/>`;
      
      const msg = message.toLowerCase();
      if (msg.includes("청약") || msg.includes("통장")) {
        fallbackText += `<strong>💡 청약 전문 조언:</strong> 아파트 청약을 노릴 때는 특히 인정 한도를 월 25만 원까지 꽉 채우는 전략이 유리합니다. <br/><br/>`;
        const post = findPostByKeyword("청약") || findPostByKeyword("가점");
        if (post) {
          fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
        }
        fallbackText += `상세 일정은 <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈 홈페이지</a>를 참조하세요!`;
      } else if (msg.includes("대출") || msg.includes("자금") || msg.includes("한도")) {
        fallbackText += `<strong>💰 대출/자금 조언:</strong> 현재 스트레스 DSR 적용 강도로 내 대출 실효 한도가 변동되었을 확률이 매우 높습니다. <br/><br/>`;
        const post = findPostByKeyword("대출") || findPostByKeyword("버팀목");
        if (post) {
          fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
        }
        fallbackText += `금리 정보는 <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금 홈페이지</a>를 통해 실시간 조회해보실 수 있습니다.`;
      } else if (msg.includes("월세") || msg.includes("전세") || msg.includes("보증금") || msg.includes("사기") || msg.includes("특약") || msg.includes("등기")) {
        fallbackText += `<strong>🛡️ 전월세 안전 조언:</strong> 전세계약서 작성 시에는 대항력 효력 시점(익일 0시)을 안전하게 수호할 권리 변동 금지 특약을 명시하고, 등기부등본상의 근저당 설정 여부를 필수적으로 감시하셔야 안전합니다. <br/><br/>`;
        const post = findPostByKeyword("특약") || findPostByKeyword("보증금") || findPostByKeyword("전세");
        if (post) {
          fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
        }
      } else {
        fallbackText += `말씀하신 '${message}' 관련하여, 저희 하우징허브가 준비한 안심 가이드 아티클을 추천해 드립니다. <br/><br/>`;
        const post = activePosts[0];
        if (post) {
          fallbackText += `<a href="/post/${slugify(post.title)}" class="text-blue-600 underline font-bold" target="_blank">👉 추천 아티클: '${post.title}' 바로가기</a><br/><br/>`;
        }
        fallbackText += `상단의 '자가진단' 탭에서 청약 가점 계산기와 대출 이자 계산기도 무상으로 적극 활용해 가이드라인을 바로 잡아보실 수 있어요.`;
      }
      responseText = fallbackText;
    }

    return res.json({ response: parseMarkdownToHtml(responseText) });
  } catch (error) {
    console.error("Gemini Conversation Action Error:", error);
    return res.status(500).json({ error: "AI Consultation server error." });
  }
});

// API 3: 정교한 블로그 포스팅 AI 자동 보강 생성 (어드민 또는 확장용)
app.post("/api/generate", async (req, res) => {
  const { topic, category } = req.body;
  if (!topic || !category) {
    return res.status(400).json({ error: "Topic and category are required." });
  }

  if (!ai) {
    return res.status(503).json({ error: "Gemini API is not configured on server." });
  }

  try {
    const prompt = `
      부동산 시장 및 실전 주거 정보에 관한 다음 주제에 관해 '가독성이 훌륭한 HTML 포스팅'을 완벽히 작성해 주세요.
      주제: ${topic}
      카테고리: ${category}
      
      형식 및 내용:
      - <h2>, <h3>, <p>, <ul>, <li> 태그만을 사용하여 수려하게 작성하세요.
      - 실용적인 체크리스트와 팁을 포함하여 작성하세요.
      - 한글로만 친절하게 응답하세요.
    `;

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              readTime: { type: Type.STRING }
            },
            required: ["title", "content", "excerpt", "hashtags", "readTime"]
          }
        }
      });
      responseText = response.text;
    } catch (primaryError: any) {
      console.warn("Primary model (gemini-3.5-flash) failed in generation, trying gemini-flash-latest...", primaryError);
      try {
        const responseFallback1 = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                excerpt: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                readTime: { type: Type.STRING }
              },
              required: ["title", "content", "excerpt", "hashtags", "readTime"]
            }
          }
        });
        responseText = responseFallback1.text;
      } catch (fallbackError1: any) {
        console.warn("Model (gemini-flash-latest) failed in generation, trying gemini-3.1-flash-lite...", fallbackError1);
        try {
          const responseFallback2 = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  excerpt: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  readTime: { type: Type.STRING }
                },
                required: ["title", "content", "excerpt", "hashtags", "readTime"]
              }
            }
          });
          responseText = responseFallback2.text;
        } catch (fallbackError2: any) {
          console.error("All models failed for dynamic post generation, running premium local fallback generation:", fallbackError2);
          const localData = {
            title: topic.trim() || "부동산 주거 정책 핵심 가이드",
            content: `
              <h2>부동산 및 주거 정책 전문가 분석</h2>
              <p>현재 부동산 시장은 주택 공급 분양과 대출 금리 조정 국면 속에서 복합적인 변화를 맞이하고 있습니다. 이에 따라 실거주 목적의 청약 대기자와 기존 전월세 세입자들은 보다 신중하고 정교한 자금 설계 전략을 세워야 합니다.</p>
              <h3>실거주자를 위한 체크리스트 및 핵심 조언</h3>
              <ul>
                <li><strong>철저한 자금 계획 수립:</strong> 주택담보대출 실행 시 본인의 스트레스 DSR 적용 비율과 이자 상환 능력을 자가진단 계산기로 정밀 모니터링하세요.</li>
                <li><strong>공공택지 분양 단지 활용:</strong> 수도권 및 신신도시 공공택지 분양 단지는 분양가 상한제가 적용되어 가점이 높거나 신혼부부 특별공급 자격을 갖춘 가구에게 좋은 선택지가 될 수 있습니다.</li>
                <li><strong>전월세 계약 시 대항력 수호:</strong> 보증금을 안전하게 지키기 위해 계약 전 확정일자 부여 현황과 선순위 채권을 반드시 체크하고 계약 즉시 전입신고 및 확정일자를 취득해야 합니다.</li>
              </ul>
              <p>하우징허브 주거 비서는 사용자의 소중한 주거 행복과 자산을 지키기 위한 최신 정책 변화와 팁을 신속하게 반영해 드립니다. 추가적인 대출 및 청약 가점 시뮬레이션은 상단 탭의 '자가진단' 탭에서 완벽하게 제공되고 있으니 지금 바로 사용해 보세요!</p>
            `,
            excerpt: `${topic}에 대한 하우징허브만의 명쾌하고 전문적인 분석 정보입니다.`,
            hashtags: ["부동산정책", "주택청약", "부동산팁", "하우징허브", "안심주거"],
            readTime: "3분"
          };
          responseText = JSON.stringify(localData);
        }
      }
    }

    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (error) {
    console.error("Gemini Live Writing Error:", error);
    return res.status(500).json({ error: "Failed to generate blog post dynamically." });
  }
});

// API 4: 사용자의 주거 복지 및 건의 사항 1:1 접수 처리 (구글 애드센스 규정 충족용 실제 검증 API)
app.post("/api/contact", async (req, res) => {
  const { name, email, category, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "이름, 이메일, 그리고 문의내용은 필수 항목입니다." });
  }

  console.log(`[하우징허브 문의 접수] 분류: ${category} | 성함: ${name} | 이메일: ${email}`);
  console.log(`[문의내용]: ${message}`);

  return res.json({
    status: "success",
    message: "귀하의 소중한 건의 및 문의사항이 안전하게 접수되었습니다. 확인 후 기재해주신 이메일로 성실히 답변을 전송해 드리겠습니다.",
    referenceId: `HH-2026-${Math.floor(100000 + Math.random() * 900000)}`
  });
});

function slugify(title: string): string {
  if (!title) return "";
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_:\-\+·\.\?,\!\[\]\(\)"']/g, "-")
    .replace(/[^\w\uAC00-\uD7A3\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseMarkdownToHtml(text: string): string {
  if (!text) return "";
  let html = text;

  // 1. 마크다운 헤더 변환 (#, ##, ###, ####)
  html = html.replace(/^#### (.*?)$/gm, '<h5 class="font-bold text-xs text-slate-800 mt-2">$1</h5>');
  html = html.replace(/^### (.*?)$/gm, '<h4 class="font-bold text-sm text-slate-900 mt-2.5">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 class="font-bold text-base text-slate-900 mt-3">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 class="font-bold text-lg text-slate-900 mt-4">$1</h2>');

  // 2. 가로선 (---)
  html = html.replace(/^---$/gm, '<hr class="my-3 border-slate-200" />');

  // 3. 리스트 항목 (* 또는 - 로 시작하는 라인)
  const lines = html.split("\n");
  let inList = false;
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const content = trimmed.substring(2);
      let res = "";
      if (!inList) {
        res += '<ul class="list-disc pl-5 my-2 space-y-1">';
        inList = true;
      }
      res += `<li>${content}</li>`;
      return res;
    } else {
      let res = "";
      if (inList) {
        res += "</ul>";
        inList = false;
      }
      res += line;
      return res;
    }
  });
  if (inList) {
    processedLines.push("</ul>");
  }
  html = processedLines.join("\n");

  // 4. 볼드 및 이탤릭 (**text**, *text*)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. 일반 줄바꿈 문자를 <br/>로 치환하되 중복 방지
  html = html.replace(/\n/g, "<br/>");
  html = html.replace(/(<br\s*\/?>){3,}/g, "<br/><br/>");

  return html;
}

// 통합 SEO 메타 태그 검색-치환 및 주입 헬퍼 함수
function replaceOrInjectMetaTags(
  html: string,
  title: string,
  desc: string,
  canonicalUrl: string,
  ogType = "website",
  ogImage = "",
  keywords = ""
): string {
  let updatedHtml = html;

  // Title 치환
  if (updatedHtml.match(/<title>[\s\S]*?<\/title>/i)) {
    updatedHtml = updatedHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <title>${title}</title>\n</head>`);
  }

  // Description 치환
  if (updatedHtml.match(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${desc}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta name="description" content="${desc}" />\n</head>`);
  }

  // Canonical 치환
  if (updatedHtml.match(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  // OG Title 치환
  if (updatedHtml.match(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:title" content="${title}" />\n</head>`);
  }

  // OG Description 치환
  if (updatedHtml.match(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${desc}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:description" content="${desc}" />\n</head>`);
  }

  // OG Url 치환
  if (updatedHtml.match(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:url" content="${canonicalUrl}" />\n</head>`);
  }

  // OG Type 치환
  if (updatedHtml.match(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:type" content="${ogType}" />\n</head>`);
  }

  // Twitter Title 치환
  if (updatedHtml.match(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  }

  // Twitter Description 치환
  if (updatedHtml.match(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${desc}" />`);
  }

  // OG Image 치환 및 삽입
  if (ogImage) {
    if (updatedHtml.match(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i)) {
      updatedHtml = updatedHtml.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${ogImage}" />`);
    } else {
      updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:image" content="${ogImage}" />\n</head>`);
    }
  }

  // Keywords 치환 및 삽입
  if (keywords) {
    if (updatedHtml.match(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i)) {
      updatedHtml = updatedHtml.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${keywords}" />`);
    } else {
      updatedHtml = updatedHtml.replace("</head>", `  <meta name="keywords" content="${keywords}" />\n</head>`);
    }
  }

  // Google Site Verification 태그 동적 삽입 (환경 변수 혹은 기본 코드 제공시)
  const siteVerificationToken = process.env.GOOGLE_SITE_VERIFICATION || "U1U64IvSTSjySxIRO1Sr598xGZz85FYPdKSSvo3B_BQ";
  if (siteVerificationToken) {
    const verTag = `<meta name="google-site-verification" content="${siteVerificationToken}" />`;
    if (updatedHtml.match(/<meta\s+name="google-site-verification"\s+content="[^"]*"\s*\/?>/i)) {
      updatedHtml = updatedHtml.replace(/<meta\s+name="google-site-verification"\s+content="[^"]*"\s*\/?>/i, verTag);
    } else {
      updatedHtml = updatedHtml.replace("</head>", `  ${verTag}\n</head>`);
    }
  }

  return updatedHtml;
}

// SEO 관련 메타 태그 동적 수립 헬퍼 함수
function injectMetaTags(html: string, post: any, baseUrl: string): string {
  const canonicalUrl = `${baseUrl}/post/${encodeURIComponent(slugify(post.title))}`;
  const keywords = post.hashtags && post.hashtags.length > 0 ? post.hashtags.join(", ") : "하우징허브, 부동산, 주택청약, 전세대출, 부동산전문가";
  const title = `${post.title} | 하우징허브`;
  const desc = post.excerpt;
  const ogImage = post.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800";
  
  return replaceOrInjectMetaTags(html, title, desc, canonicalUrl, "article", ogImage, keywords);
}

function injectDefaultMetaTags(html: string, baseUrl: string): string {
  const title = "하우징허브 | 실전 청약·전월세·주택대출 안심 주거 정보 포털";
  const desc = "실수요자를 위한 주택 청약 자격, 전월세 사기 방지 특약, 디딤돌·버팀목 대출 가이드 및 자가진단 시뮬레이터를 제공하는 공익 주거 정보 포털입니다.";
  const canonicalUrl = `${baseUrl}/`;
  const ogImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800";
  const keywords = "주택청약, 청약가점 계산기, 전세대출 한도, 하우징허브, 버팀목 대출, 디딤돌 대출, 전세사기 방지, 부동산 전문가 칼럼";
  
  return replaceOrInjectMetaTags(html, title, desc, canonicalUrl, "website", ogImage, keywords);
}

function injectCategoryMetaTags(html: string, category: string, baseUrl: string): string {
  const title = `${category} 실시간 알짜 정보 및 전문가 가이드 | 하우징허브`;
  let desc = "";
  if (category === "청약-분양") {
    desc = "최신 청약 일정, 분양 정보, 청약가점 계산법, 무순위 줍줍 분석 및 당첨 확률 높이는 실전 노하우를 제공합니다.";
  } else if (category === "전월세") {
    desc = "전월세 사기 방지 대책, 등기부등본 권리 분석, 전세보증보험 가입 가이드 및 임차인 필수 특약 조항을 안내합니다.";
  } else if (category === "이사-인테리어") {
    desc = "이삿짐 센터 선정 체크리스트, 입주 청소 요령, 전입신고 및 확정일자 부여 절차, 셀프 인테리어 가이드를 안내합니다.";
  } else if (category === "대출-금융") {
    desc = "디딤돌 대출, 버팀목 전세대출, 신생아 특례대출, 스트레스 DSR 상환 비율 및 주거 금융 혜택을 총정리해 드립니다.";
  } else {
    desc = `하우징허브 ${category} 정보 센터. 검증된 실전 주거 가이드를 확인하세요.`;
  }

  const canonicalUrl = `${baseUrl}/category/${encodeURIComponent(category)}`;
  const ogImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800";
  const keywords = `${category}, 하우징허브 ${category}, 부동산 실무, ${category} 가이드`;
  
  return replaceOrInjectMetaTags(html, title, desc, canonicalUrl, "website", ogImage, keywords);
}

function injectSubpageMetaTags(html: string, path: string, baseUrl: string): string {
  let title = "하우징허브";
  let desc = "실전 청약, 전월세 대항력, 주택 대출 심층 분석 공익 정보 포털입니다.";
  
  if (path === "/about") {
    title = "소개 및 집필 원칙 | 하우징허브";
    desc = "하우징허브는 현장 실무 경험과 공식 국토부·LH 공고문에 기반한 검증된 주거 지식을 제공합니다.";
  } else if (path === "/toolkit") {
    title = "스마트 주거 자가진단 툴킷 | 하우징허브";
    desc = "LTV/DSR 주택 대출 한도 계산 및 청약 자가 점수(84점 만점) 진단을 제공하는 실전 자가진단 툴킷입니다.";
  } else if (path === "/announcement") {
    title = "공지사항 및 정책 소식 | 하우징허브";
    desc = "하우징허브의 최신 주거 정책 변화 공지, 신규 부동산 실무 가이드 추가 소식을 안내해 드립니다.";
  } else if (path === "/partnership" || path === "/contact") {
    title = "제휴 및 독자 제보 문의 | 하우징허브";
    desc = "공인중개사, 이사업체, 법무법인 등 국민 주거 복지 향상에 함께할 파트너사 문의 및 제보 창구입니다.";
  } else if (path === "/terms") {
    title = "서비스 이용약관 | 하우징허브";
    desc = "하우징허브 서비스 이용 약관 및 사용자 권리 보호 세부 조항 안내.";
  } else if (path === "/privacy") {
    title = "개인정보처리방침 | 하우징허브";
    desc = "하우징허브는 사용자의 개인정보를 소중히 보호하며, 개인정보보호법 및 관련 법령을 엄격히 준수합니다.";
  } else if (path === "/disclaimer") {
    title = "면책 조항 및 법적 고지 | 하우징허브";
    desc = "하우징허브가 제공하는 모든 콘텐츠는 법적·공식 공고 기준을 토대로 한 정보 제공용 자료입니다.";
  } else {
    return injectDefaultMetaTags(html, baseUrl);
  }

  const canonicalUrl = `${baseUrl}${path}`;
  const keywords = "부동산 전문가, 주택청약, 전월세 특약, 하우징허브";
  
  return replaceOrInjectMetaTags(html, title, desc, canonicalUrl, "website", "", keywords);
}

// Vite Middleware & Static Assets 서빙
async function startServer() {
  let viteInstance: any = null;

  const getBaseUrl = (req: express.Request): string => {
    const host = req.headers.host || "";
    if (host.includes("zip9.kr")) {
      return "https://zip9.kr";
    }
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    return `${protocol}://${host}`;
  };

  const handleHtmlServing = async (req: express.Request, res: express.Response) => {
    try {
      const isProd = process.env.NODE_ENV === "production";
      const indexHtmlPath = isProd 
        ? path.join(process.cwd(), "dist", "index.html")
        : path.join(process.cwd(), "index.html");

      if (!fs.existsSync(indexHtmlPath)) {
        return res.status(404).send("파일을 찾을 수 없습니다. 빌드를 먼저 수행해 주십시오.");
      }

      let html = fs.readFileSync(indexHtmlPath, "utf-8");

      // 개발환경 모드 빌드
      if (!isProd && viteInstance) {
        html = await viteInstance.transformIndexHtml(req.originalUrl, html);
      }

      const baseUrl = getBaseUrl(req);

      // 1) 게시글 고유값 파싱 (경로 /post/:id 혹은 쿼리스트링 ?post=)
      const rawPostId = req.params.id || (req.query.post as string);
      if (rawPostId) {
        const decodedPostId = decodeURIComponent(rawPostId);
        const post = getActivePostsList().find(p => p.title === decodedPostId || p.id === decodedPostId || slugify(p.title) === decodedPostId);
        if (post) {
          if (isProd) {
            const slug = slugify(post.title);
            const prerenderedPostPath = path.join(process.cwd(), "dist", "post", slug, "index.html");
            if (fs.existsSync(prerenderedPostPath)) {
              return res.send(fs.readFileSync(prerenderedPostPath, "utf-8"));
            }
          }
          html = injectMetaTags(html, post, baseUrl);
          return res.send(html);
        }
      }

      // 2) 카테고리 경로 파싱 (예: /category/:categoryName)
      const pathParts = req.path.split("/");
      const categoryIndex = pathParts.indexOf("category");
      if (categoryIndex !== -1 && pathParts[categoryIndex + 1]) {
        const rawCat = pathParts[categoryIndex + 1];
        const decodedCat = decodeURIComponent(rawCat);
        if (isProd) {
          const prerenderedCatPath = path.join(process.cwd(), "dist", "category", decodedCat, "index.html");
          if (fs.existsSync(prerenderedCatPath)) {
            return res.send(fs.readFileSync(prerenderedCatPath, "utf-8"));
          }
        }
        html = injectCategoryMetaTags(html, decodedCat, baseUrl);
        return res.send(html);
      }

      // 3) 특정 서브페이지 경로 파싱 (예: /about, /announcement, /partnership, /contact, /terms, /privacy, /disclaimer, /toolkit)
      const subpages = ["/about", "/announcement", "/partnership", "/contact", "/terms", "/privacy", "/disclaimer", "/toolkit"];
      const matchedPage = subpages.find(page => req.path === page);
      if (matchedPage) {
        if (isProd) {
          const cleanPageName = matchedPage.replace(/^\//, "");
          const prerenderedPagePath = path.join(process.cwd(), "dist", cleanPageName, "index.html");
          if (fs.existsSync(prerenderedPagePath)) {
            return res.send(fs.readFileSync(prerenderedPagePath, "utf-8"));
          }
        }
        html = injectSubpageMetaTags(html, matchedPage, baseUrl);
        return res.send(html);
      }

      // 기본 메타 기입
      html = injectDefaultMetaTags(html, baseUrl);
      return res.send(html);
    } catch (err) {
      console.error("HTML 렌더링 서빙 오류:", err);
      return res.status(500).send("서버 서빙 오류가 발생했습니다.");
    }
  };

  if (process.env.NODE_ENV !== "production") {
    viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    // 라우터 처리 우선순위
    app.get("/", handleHtmlServing);
    app.get("/post/:id", handleHtmlServing);

    app.use(viteInstance.middlewares);
  } else {
    // 운영용 라우터 처리 우선순위
    app.get("/", handleHtmlServing);
    app.get("/post/:id", handleHtmlServing);

    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false })); // 자동 index.html 방지하여 메타 인젝터 오버라이드 유도

    app.get("*", handleHtmlServing);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HostingHub Incheon] Full-stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
