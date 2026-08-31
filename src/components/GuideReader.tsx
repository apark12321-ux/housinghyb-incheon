import React, { useEffect, useState, useRef } from "react";
import { 
  ChevronLeft, 
  Calendar, 
  ShieldCheck, 
  Bookmark, 
  Share2, 
  CheckCircle2
} from "lucide-react";
import { Post } from "../types";
import { TableOfContents, TocItem } from "./TableOfContents";

interface GuideReaderProps {
  post: Post;
  onBack: () => void;
  bookmarks: string[];
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onContactClick: () => void;
  showToast: (msg: string, type?: "success" | "info" | "error") => void;
}

export const GuideReader: React.FC<GuideReaderProps> = ({
  post,
  onBack,
  bookmarks,
  onToggleBookmark,
  onContactClick,
  showToast
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const isSmoothScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. 본문의 H2, H3 태그를 파싱하고 안정적인 고유 ID 부여 및 목차 생성
  useEffect(() => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    headings.forEach((heading, idx) => {
      const el = heading as HTMLElement;
      const id = `toc-sec-${idx + 1}`;
      el.id = id;
      el.style.scrollMarginTop = "110px";

      items.push({
        id: id,
        text: el.textContent?.trim() || `섹션 ${idx + 1}`,
        level: el.tagName.toUpperCase() === "H2" ? 2 : 3
      });
    });

    setTocItems(items);
    if (items.length > 0) {
      setActiveHeadingId(items[0].id);
    }
  }, [post.id, post.content]);

  // 2. 스크롤에 따른 현재 활성 목차 및 읽기 진행률(Progress) 감지 (Scroll Spy)
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const container = contentRef.current;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;

      // 전체 아티클 기준 읽기 진행률 계산
      const totalHeight = container.offsetHeight;
      const containerTop = container.offsetTop;
      const scrolled = scrollY - (containerTop - 120);
      const progress = Math.min(100, Math.max(0, (scrolled / Math.max(1, totalHeight - windowHeight / 2)) * 100));
      setReadingProgress(isNaN(progress) ? 0 : progress);

      // 사용자가 목차 클릭으로 부드럽게 스크롤 중일 때는 Scroll Spy 임시 스킵
      if (isSmoothScrollingRef.current) return;

      // 현재 뷰포트에 위치한 H2, H3 헤딩 탐지 (Scroll Spy)
      const headings = container.querySelectorAll("h2, h3");
      let currentActiveId = "";

      headings.forEach((heading) => {
        const top = heading.getBoundingClientRect().top;
        if (top <= 150) {
          currentActiveId = heading.id;
        }
      });

      if (currentActiveId) {
        setActiveHeadingId(currentActiveId);
      } else if (headings.length > 0 && scrollY < 200) {
        setActiveHeadingId(headings[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [tocItems]);

  // 특정 목차 클릭 시 부드럽게 스크롤 및 활성화
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      isSmoothScrollingRef.current = true;
      setActiveHeadingId(id);

      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isSmoothScrollingRef.current = false;
      }, 750);
    }
  };

  const scrollToTop = () => {
    isSmoothScrollingRef.current = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (tocItems.length > 0) {
      setActiveHeadingId(tocItems[0].id);
    }
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isSmoothScrollingRef.current = false;
    }, 750);
  };

  const isBookmarked = bookmarks.includes(post.id);

  return (
    <article className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      {/* 상단 브레드크럼 / 뒤로가기 바 */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <button 
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-slate-700 hover:text-blue-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>목록으로 돌아가기</span>
        </button>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-slate-500 font-semibold">하우징허브 &gt; {post.category}</span>
        </div>
      </div>

      {/* 본문 + 우측 고정 목차 2컬럼 레이아웃 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 pt-8 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* 좌측 메인 아티클 영역 */}
          <div className="xl:col-span-8 2xl:col-span-8 min-w-0">
            {/* 카테고리 태그 */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs sm:text-sm font-bold text-blue-600 tracking-wider font-mono bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {post.category}
              </span>
            </div>

            {/* 굵고 대담한 제목 */}
            <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-extrabold text-slate-900 leading-snug tracking-tight mb-6">
              {post.title}
            </h1>

            {/* 메타 정보 바 & 작성자 페르소나 (E-E-A-T) */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 mb-8 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                  <span>글: <strong>박 실장</strong> (10년 차 주거 기획자)</span>
                </span>
                <span className="inline-flex items-center text-slate-800 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-lg font-mono font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  <span>게재일: {post.date}{post.time ? ` ${post.time}` : ""}</span>
                </span>
              </div>
              <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-bold text-[11px] border border-blue-100">
                ✓ 실무 경험 기반 검증
              </span>
            </div>

            {/* 본문 콘텐츠 (H2, H3 자동 파싱 타겟) */}
            <div 
              ref={contentRef}
              className="article-rich-content text-slate-800 text-[15px] sm:text-[16.5px] leading-8 space-y-6 pt-2 font-normal"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 실무자 주관적 인사이트 & 휴먼 터치 박스 (E-E-A-T) */}
            <div className="my-8 p-5 sm:p-6 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5 text-slate-800">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span className="text-base">💡</span>
                <span>박 실장의 현장 실무 코멘트 (Human Insight)</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed font-sans">
                "이론과 공고문 수치만 보고 안심했다가, 계약 당일이나 청약 서류 검수 단계에서 작은 서류 미비로 부적격 판정을 받는 분들을 현장에서 수없이 보았습니다. 항상 <strong>'최악의 시나리오(예비비 10% 이상 확보, 잔금 당일 아침 등기부등본 재발급)'</strong>를 전제로 대비하시는 것이 가장 확실한 자산 방어책입니다."
              </p>
            </div>

            {/* 하우징허브 E-E-A-T 작성자 프로필 & 정보 검증 박스 */}
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      👨‍💼
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">기획 총괄 박 실장 & 주거 리서치팀</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">10년 차 실무</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        부동산 금융 데이터 분석 10년 · 현장 계약 실무 800여 건 직접 수행 · 국토교통부·청약홈 공고문 교차 검증
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onContactClick}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    1:1 문의 및 의견 제안
                  </button>
                </div>
                <div className="pt-3 border-t border-slate-200/70 text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>하우징허브는 특정 분양 대행사 및 대출 중개사의 광고성 청탁을 받지 않고 오직 실수요자 관점에서 집필합니다.</span>
                </div>
              </div>
            </div>

            {/* 해시태그 목록 */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-6">
                {post.hashtags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 우측 고정 목차 (Table of Contents Sidebar) */}
          <div className="xl:col-span-4 2xl:col-span-4 xl:sticky xl:top-24 space-y-4">
            <TableOfContents
              items={tocItems}
              activeId={activeHeadingId}
              progress={readingProgress}
              onItemClick={scrollToHeading}
              onScrollToTop={scrollToTop}
            />

            {/* 우측 사이드바 보조 팁 카드 (데스크톱 전용) */}
            <div className="hidden xl:block bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>스마트 목차 탐색 팁</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                긴 공고문과 정책 분석 글에서 원하는 목차를 클릭하면 해당 항목으로 즉시 이동합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 제어 리브 */}
      <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
        <button
          onClick={(e) => onToggleBookmark(post.id, e)}
          className="flex items-center justify-center space-x-2 text-xs font-semibold px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-red-500 text-red-500" : ""}`} />
          <span>{isBookmarked ? "보관 해제" : "내 보관함 스크랩"}</span>
        </button>

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast("하우징허브 주소지가 클립보드에 복사되었습니다! 소중한 분들에게 안심 정보를 나누어 보세요.", "success");
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 text-xs font-semibold px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>안심 가이드 공유</span>
          </button>
          <button
            onClick={onBack}
            className="flex-1 sm:flex-initial py-3 px-5 text-xs font-bold transition-all text-slate-700 hover:bg-slate-200 border border-slate-200 bg-white rounded-xl cursor-pointer"
          >
            목록으로 가기
          </button>
        </div>
      </div>
    </article>
  );
};
