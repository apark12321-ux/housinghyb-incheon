import React, { useEffect, useState, useRef } from "react";
import { 
  ChevronLeft, 
  Calendar, 
  ShieldCheck, 
  Bookmark, 
  Share2, 
  Clock, 
  Eye, 
  Heart, 
  CheckCircle2, 
  ExternalLink 
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

  // 1. 본문의 H2, H3 태그를 파싱하고 ID를 부여하여 목차 생성
  useEffect(() => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    headings.forEach((heading, idx) => {
      const el = heading as HTMLElement;
      let id = el.id;

      if (!id || id.trim() === "") {
        // 기존 ID가 없는 경우 고유 ID 생성 부여
        id = `guide-heading-${idx + 1}`;
        el.id = id;
      }

      // 스크롤 시 상단 고정 헤더(약 80px)에 가려지지 않도록 CSS scroll-margin-top 적용
      el.style.scrollMarginTop = "100px";

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

      // 전체 아티클 기준 읽기 진행률 계산
      const totalHeight = container.offsetHeight;
      const scrolled = window.scrollY - (container.offsetTop - 120);
      const progress = Math.min(100, Math.max(0, (scrolled / Math.max(1, totalHeight - windowHeight / 2)) * 100));
      setReadingProgress(isNaN(progress) ? 0 : progress);

      // 사용자가 목차 클릭으로 부드럽게 스크롤 중일 때는 Scroll Spy 임시 스킵
      if (isSmoothScrollingRef.current) return;

      // 현재 뷰포트에 위치한 H2, H3 헤딩 탐지 (Scroll Spy)
      const headings = container.querySelectorAll("h2, h3");
      let currentActiveId = "";

      // 상단 헤더 기준(120px)에서 가장 가까운 활성 헤딩 결정
      headings.forEach((heading) => {
        const top = heading.getBoundingClientRect().top;
        if (top <= 140) {
          currentActiveId = heading.id;
        }
      });

      if (currentActiveId) {
        setActiveHeadingId(currentActiveId);
      } else if (headings.length > 0 && window.scrollY < 200) {
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

      const topOffset = 95;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isSmoothScrollingRef.current = false;
      }, 700);
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
    }, 700);
  };

  const isBookmarked = bookmarks.includes(post.id);

  return (
    <article className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      {/* 상단 브레드크럼 / 뒤로가기 바 */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/95 backdrop-blur-xs sticky top-0 sm:top-16 z-30 shadow-2xs">
        <button 
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
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
          {/* 좌측 메인 아티클 영역 (xl:col-span-8 또는 9) */}
          <div className="xl:col-span-8 2xl:col-span-8 min-w-0">
            {/* 카테고리 태그 */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs sm:text-sm font-bold text-blue-600 tracking-wider font-mono bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {post.category}
              </span>
              {post.readTime && (
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.readTime}</span>
                </span>
              )}
            </div>

            {/* 굵고 대담한 제목 */}
            <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-extrabold text-slate-900 leading-snug tracking-tight mb-6">
              {post.title}
            </h1>

            {/* 메타 정보 바 */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 mb-8 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center text-slate-800 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-lg font-mono font-semibold">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  <span>게재일: {post.date}{post.time ? ` ${post.time}` : ""}</span>
                </span>
                {post.views && (
                  <span className="inline-flex items-center text-slate-500 font-mono">
                    <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>조회 {post.views.toLocaleString()}</span>
                  </span>
                )}
              </div>
              <span className="text-slate-400 font-medium">하우징허브 가이드</span>
            </div>

            {/* 본문 콘텐츠 (H2, H3 자동 파싱 타겟) */}
            <div 
              ref={contentRef}
              className="article-rich-content text-slate-800 text-[15px] sm:text-[16.5px] leading-8 space-y-6 pt-2 font-normal"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 하우징허브 정보 검증 및 피드백 박스 */}
            <div className="mt-10 pt-6 border-t border-slate-200 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">공식 자료 기반 안내</span>
                      <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">공식 공고 기준</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      국토교통부, 한국부동산원 청약홈, 주택도시기금의 최신 발표 공고를 바탕으로 정리한 글입니다.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onContactClick}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shrink-0"
                >
                  문의 및 수정 제안
                </button>
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
          <div className="hidden xl:block xl:col-span-4 2xl:col-span-4 sticky top-24 space-y-4">
            <TableOfContents
              items={tocItems}
              activeId={activeHeadingId}
              progress={readingProgress}
              onItemClick={scrollToHeading}
              onScrollToTop={scrollToTop}
            />

            {/* 우측 사이드바 보조 팁 카드 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs text-slate-600">
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

      {/* 모바일 화면용 플로팅 목차 (TOC) 연동 */}
      <div className="xl:hidden">
        <TableOfContents
          items={tocItems}
          activeId={activeHeadingId}
          progress={readingProgress}
          onItemClick={scrollToHeading}
          onScrollToTop={scrollToTop}
        />
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
