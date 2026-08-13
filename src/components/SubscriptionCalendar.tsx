import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Building2,
  Tag,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  X,
  Search,
  Sparkles,
  Clock,
  LayoutGrid,
  List
} from "lucide-react";
import { Post } from "../types";

export interface SubscriptionItem {
  id: string;
  complexName: string;
  location: string;
  regionCategory: "서울" | "경기/인천" | "기타";
  totalUnits: number;
  generalUnits: number;
  priceRange: string;
  specialDate: string; // YYYY-MM-DD
  rank1Date: string;   // YYYY-MM-DD
  rank2Date?: string;  // YYYY-MM-DD
  winnerDate: string;  // YYYY-MM-DD
  contractDate?: string;
  status: "접수예정" | "청약중" | "당첨발표" | "계약진행";
  regulationType: "투기과열지구·분양가상한제" | "비규제지역" | "공공분양" | "무순위/줍줍";
  highlights: string[];
  description: string;
  relatedPostId?: number;
}

// 2026년 8월 기준 주요 전국 청약/분양 단지 시점 데이터
export const MOCK_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: "sub-1",
    complexName: "잠실 래미안 아이파크",
    location: "서울 송파구 신천동",
    regionCategory: "서울",
    totalUnits: 2678,
    generalUnits: 589,
    priceRange: "3.3㎡당 5,405만 원 (84㎡ 기준 약 18.5억 원)",
    specialDate: "2026-08-18",
    rank1Date: "2026-08-19",
    rank2Date: "2026-08-20",
    winnerDate: "2026-08-27",
    contractDate: "2026-09-08 ~ 09-12",
    status: "접수예정",
    regulationType: "투기과열지구·분양가상한제",
    highlights: ["송파구 신축 대단지", "실거주의무 3년 적용", "전매제한 3년", "분양가상한제 시세차익 기대"],
    description: "송파구 잠실 핵심 입지에 공급되는 2,678세대 대단지 재건축 단지. 실거주의무 및 DSR 2단계 규제 대조 필요.",
    relatedPostId: 1
  },
  {
    id: "sub-2",
    complexName: "신반포 메이플자이",
    location: "서울 서초구 잠원동",
    regionCategory: "서울",
    totalUnits: 3307,
    generalUnits: 162,
    priceRange: "3.3㎡당 6,700만 원 (59㎡ 기준 약 17.4억 원)",
    specialDate: "2026-08-11",
    rank1Date: "2026-08-12",
    rank2Date: "2026-08-13",
    winnerDate: "2026-08-21",
    contractDate: "2026-09-01 ~ 09-05",
    status: "청약중",
    regulationType: "투기과열지구·분양가상한제",
    highlights: ["서초구 초역세권", "59㎡ 위주 일반분양", "가점제 40% / 추첨제 60%", "신생아 특례 적용 가능"],
    description: "서초구 잠원동 신반포4지구 재건축. 한강변 인접 및 신반포역, 잠원역 트리플 역세권 입지.",
    relatedPostId: 2
  },
  {
    id: "sub-3",
    complexName: "동탄 레이크파크 자연앤 e편한세상",
    location: "경기 화성시 동탄2신도시",
    regionCategory: "경기/인천",
    totalUnits: 1224,
    generalUnits: 980,
    priceRange: "3.3㎡당 1,480만 원 (84㎡ 기준 약 4.8억 원)",
    specialDate: "2026-08-25",
    rank1Date: "2026-08-26",
    rank2Date: "2026-08-27",
    winnerDate: "2026-09-03",
    status: "접수예정",
    regulationType: "공공분양",
    highlights: ["동탄호수공원 입지", "공공분양 특별공급 80%", "소득 및 자산요건 필수", "저렴한 분양가"],
    description: "경기도시공사(GH)와 DL이앤씨가 공동 시공하는 동탄2신도시 공공분양 단지. 신혼부부 및 생애최초 특공 비중 높음.",
    relatedPostId: 3
  },
  {
    id: "sub-4",
    complexName: "송도 자이 풍경채 그란노블 1~5단지",
    location: "인천 연수구 송도동 11공구",
    regionCategory: "경기/인천",
    totalUnits: 3270,
    generalUnits: 2728,
    priceRange: "3.3㎡당 2,150만 원 (84㎡ 기준 약 8.2억 원)",
    specialDate: "2026-08-04",
    rank1Date: "2026-08-05",
    rank2Date: "2026-08-06",
    winnerDate: "2026-08-13",
    status: "당첨발표",
    regulationType: "비규제지역",
    highlights: ["송도 11공구 첫 대단지", "전매제한 6개월", "실거주의무 없음", "유주택자 1순위 가능"],
    description: "인천 송도국제도시 11공구 바이오단지 인접 대규모 단지. 비규제지역으로 대출 및 전매 조건 비교적 완화.",
    relatedPostId: 10
  },
  {
    id: "sub-5",
    complexName: "고덕 강일3단지 토지임대부 공공분양",
    location: "서울 강동구 강일동",
    regionCategory: "서울",
    totalUnits: 1305,
    generalUnits: 500,
    priceRange: "추정분양가 59㎡ 기준 약 3.5억 원 (토지임대료 별도)",
    specialDate: "2026-08-21",
    rank1Date: "2026-08-22",
    winnerDate: "2026-08-29",
    status: "접수예정",
    regulationType: "공공분양",
    highlights: ["반값 아파트 건물만 분양", "청년·신혼 특공 우대", "SH공사 주관", "한강변 인접"],
    description: "토지는 SH가 소유하고 건물만 분양하는 토지임대부 분양주택. 초기 자금 부담을 획기적으로 낮춘 반값 아파트.",
    relatedPostId: 5
  },
  {
    id: "sub-6",
    complexName: "성남 복정1지구 B3블록 (무순위 줍줍)",
    location: "경기 성남시 수정구 복정동",
    regionCategory: "경기/인천",
    totalUnits: 510,
    generalUnits: 12,
    priceRange: "최초 분양가 84㎡ 기준 약 7.2억 원",
    specialDate: "2026-08-14",
    rank1Date: "2026-08-14",
    winnerDate: "2026-08-19",
    status: "청약중",
    regulationType: "무순위/줍줍",
    highlights: ["부적격 해지분 12세대", "위례신도시 인접", "청약통장 유무 무관", "전국 만 19세 이상"],
    description: "위례 인접 성남 복정1지구 계약취소 및 부적격 잔여 세대 무순위 청약. 거주지 제한 없이 신청 가능.",
    relatedPostId: 6
  },
  {
    id: "sub-7",
    complexName: "용산 호반써밋 에이디션",
    location: "서울 용산구 한강로2가",
    regionCategory: "서울",
    totalUnits: 110,
    generalUnits: 90,
    priceRange: "3.3㎡당 4,800만 원 (84㎡ 기준 약 16.2억 원)",
    specialDate: "2026-08-28",
    rank1Date: "2026-08-29",
    winnerDate: "2026-09-05",
    status: "접수예정",
    regulationType: "투기과열지구·분양가상한제",
    highlights: ["용산역 도보 3분", "초역세권 주상복합", "분양가상한제 적용", "높은 경쟁률 예상"],
    description: "용산 한강로 핵심지에 들어서는 주상복합. 희소성 높은 서울 도심 주거단지로 높은 청약가점 필요.",
    relatedPostId: 7
  }
];

interface SubscriptionCalendarProps {
  onSelectPost?: (post: Post) => void;
  posts?: Post[];
}

export const SubscriptionCalendar: React.FC<SubscriptionCalendarProps> = ({
  onSelectPost,
  posts = []
}) => {
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 8 });
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");
  const [selectedType, setSelectedType] = useState<string>("전체");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [activeItem, setActiveItem] = useState<SubscriptionItem | null>(null);

  // 날짜별 이벤트 맵 생성 (2026년 8월 기준)
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const daysInAugust = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfWeek(currentMonth.year, currentMonth.month);

  // 필터링 적용된 청약 단지 목록
  const filteredSubscriptions = MOCK_SUBSCRIPTIONS.filter((sub) => {
    if (selectedRegion !== "전체" && sub.regionCategory !== selectedRegion) return false;
    if (selectedType !== "전체") {
      if (selectedType === "특별공급" && !sub.specialDate) return false;
      if (selectedType === "1순위" && !sub.rank1Date) return false;
      if (selectedType === "무순위/줍줍" && sub.regulationType !== "무순위/줍줍") return false;
      if (selectedType === "공공분양" && sub.regulationType !== "공공분양") return false;
    }
    if (selectedDateFilter) {
      const matchSpecial = sub.specialDate === selectedDateFilter;
      const matchRank1 = sub.rank1Date === selectedDateFilter;
      const matchWinner = sub.winnerDate === selectedDateFilter;
      if (!matchSpecial && !matchRank1 && !matchWinner) return false;
    }
    return true;
  });

  // 해당 날짜에 어떤 이벤트가 있는지 반환
  const getEventsForDate = (dateStr: string) => {
    const events: { item: SubscriptionItem; eventType: "special" | "rank1" | "winner"; label: string; color: string }[] = [];
    
    filteredSubscriptions.forEach((sub) => {
      if (sub.specialDate === dateStr) {
        events.push({ item: sub, eventType: "special", label: `${sub.complexName} (특공)`, color: "bg-blue-600 text-white" });
      }
      if (sub.rank1Date === dateStr) {
        events.push({ item: sub, eventType: "rank1", label: `${sub.complexName} (1순위)`, color: "bg-emerald-600 text-white" });
      }
      if (sub.winnerDate === dateStr) {
        events.push({ item: sub, eventType: "winner", label: `${sub.complexName} (당첨발표)`, color: "bg-rose-600 text-white" });
      }
    });

    return events;
  };

  const handlePostClick = (sub: SubscriptionItem) => {
    if (sub.relatedPostId && onSelectPost && posts.length > 0) {
      const found = posts.find((p) => p.id === sub.relatedPostId);
      if (found) {
        onSelectPost(found);
        return;
      }
    }
    setActiveItem(sub);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-7 space-y-6">
      {/* 캘린더 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>실시간 청약홈 연동</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
              {currentMonth.year}년 {currentMonth.month}월
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <span>🗓️ 당월 주요 청약 일정 캘린더</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            전국 주요 아파트 및 공공분양·무순위(줍줍) 단지의 접수일, 1순위, 당첨자 발표 일정을 한눈에 확인하세요.
          </p>
        </div>

        {/* 뷰 모드 전환 버튼 & 날짜 이동 */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200/80">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>달력 뷰</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>리스트 뷰</span>
            </button>
          </div>
        </div>
      </div>

      {/* 필터 제어 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
        {/* 지역 필터 */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>지역:</span>
          </span>
          {["전체", "서울", "경기/인천", "기타"].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRegion === reg
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        {/* 청약 유형 필터 */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>유형:</span>
          </span>
          {["전체", "특별공급", "1순위", "공공분양", "무순위/줍줍"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === type
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 날짜 선택 해제 버튼 */}
        {selectedDateFilter && (
          <button
            onClick={() => setSelectedDateFilter(null)}
            className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl flex items-center space-x-1 transition-all cursor-pointer ml-auto"
          >
            <span>{selectedDateFilter} 날짜 선택 해제</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 이벤트 범례 */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 px-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          <span>특별공급 접수</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
          <span>1순위 청약</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
          <span>당첨자 발표</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-400 font-normal">
          <span>* 날짜를 클릭하면 해당 일자의 단지만 집중 필터링됩니다.</span>
        </div>
      </div>

      {/* 1. 달력 뷰 (Grid Calendar) */}
      {viewMode === "calendar" ? (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center font-bold text-xs py-2.5 text-slate-700">
            <div className="text-rose-600">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="text-blue-600">토</div>
          </div>

          {/* 달력 날짜 그리드 */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/80 bg-white">
            {/* 빈 시작 일수 */}
            {Array.from({ length: firstDay }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[90px] sm:min-h-[110px] bg-slate-50/40 p-1" />
            ))}

            {/* 날짜 박스들 */}
            {Array.from({ length: daysInAugust }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `2026-08-${dayNum < 10 ? `0${dayNum}` : dayNum}`;
              const dayOfWeek = (firstDay + idx) % 7;
              const isSunday = dayOfWeek === 0;
              const isSaturday = dayOfWeek === 6;
              const events = getEventsForDate(dateStr);
              const isSelected = selectedDateFilter === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    if (events.length > 0) {
                      setSelectedDateFilter(isSelected ? null : dateStr);
                    }
                  }}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 transition-all flex flex-col justify-start relative ${
                    events.length > 0 ? "cursor-pointer hover:bg-blue-50/40" : ""
                  } ${isSelected ? "bg-blue-50/90 ring-2 ring-blue-500 ring-inset" : "bg-white"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        isSunday
                          ? "text-rose-600 font-extrabold"
                          : isSaturday
                          ? "text-blue-600 font-extrabold"
                          : "text-slate-800"
                      } ${isSelected ? "bg-blue-600 text-white" : ""}`}
                    >
                      {dayNum}
                    </span>
                    {events.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                        {events.length}건
                      </span>
                    )}
                  </div>

                  {/* 날짜별 청약 이벤트 배지 리스트 */}
                  <div className="space-y-1 overflow-y-auto max-h-[75px] scrollbar-none">
                    {events.map((evt, eIdx) => (
                      <button
                        key={`${dateStr}-${eIdx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePostClick(evt.item);
                        }}
                        className={`w-full text-left text-[10px] sm:text-xs font-bold px-1.5 py-1 rounded truncate shadow-2xs hover:opacity-90 transition-opacity ${evt.color}`}
                        title={evt.label}
                      >
                        {evt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. 리스트 뷰 (List View) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubscriptions.map((sub) => (
            <div
              key={sub.id}
              onClick={() => handlePostClick(sub)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
                    {sub.regulationType}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      sub.status === "접수예정"
                        ? "bg-blue-600 text-white"
                        : sub.status === "청약중"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {sub.complexName}
                </h3>

                <p className="text-xs text-slate-600 flex items-center space-x-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sub.location}</span>
                  <span className="text-slate-300">•</span>
                  <span>총 {sub.totalUnits.toLocaleString()}세대 (일반 {sub.generalUnits.toLocaleString()}세대)</span>
                </p>

                <p className="text-xs font-bold text-blue-700 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                  💰 분양가: {sub.priceRange}
                </p>
              </div>

              {/* 주요 일정 요약 띠 */}
              <div className="pt-2 border-t border-slate-100 text-xs font-medium space-y-1 text-slate-700">
                <div className="flex items-center justify-between">
                  <span>특별공급:</span>
                  <strong className="text-blue-600 font-bold">{sub.specialDate}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>1순위 청약:</span>
                  <strong className="text-emerald-600 font-bold">{sub.rank1Date}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>당첨자 발표:</span>
                  <strong className="text-rose-600 font-bold">{sub.winnerDate}</strong>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>상세 분석 리포트 보기 →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 선택된 날짜에 포함된 단지 카드 목록 (달력 뷰 하단 표시) */}
      {selectedDateFilter && viewMode === "calendar" && (
        <div className="bg-blue-50/80 rounded-2xl border border-blue-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{selectedDateFilter} 청약/발표 단지 목록</span>
            </h3>
            <span className="text-xs text-blue-700 font-semibold">
              총 {filteredSubscriptions.length}개 단지 검색됨
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSubscriptions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => handlePostClick(sub)}
                className="bg-white p-3.5 rounded-xl border border-blue-100 hover:border-blue-400 shadow-2xs cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {sub.complexName}
                  </h4>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                    {sub.location}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {sub.priceRange}
                </p>
                <div className="flex items-center space-x-2 text-[11px] font-bold text-blue-600 pt-1">
                  <span>특공: {sub.specialDate}</span>
                  <span>•</span>
                  <span>1순위: {sub.rank1Date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 단지 상세 정보 모달 */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {activeItem.regulationType}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  {activeItem.status}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-display">
                {activeItem.complexName}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeItem.location}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">단지 및 분양 개요</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800">
                <div>총 세대수: <strong className="text-slate-900">{activeItem.totalUnits.toLocaleString()}세대</strong></div>
                <div>일반 분양: <strong className="text-slate-900">{activeItem.generalUnits.toLocaleString()}세대</strong></div>
                <div className="col-span-2 text-blue-700 font-bold mt-1">
                  분양가: {activeItem.priceRange}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">주요 일정 체크</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                  <div className="text-[10px] text-blue-600 font-bold">특별공급</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{activeItem.specialDate}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <div className="text-[10px] text-emerald-600 font-bold">1순위 청약</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{activeItem.rank1Date}</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                  <div className="text-[10px] text-rose-600 font-bold">당첨자 발표</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{activeItem.winnerDate}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">핵심 포인트 &amp; 실무 특약</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeItem.highlights.map((h, hIdx) => (
                  <span key={hIdx} className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200/80">
                    ✓ {h}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {activeItem.description}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
