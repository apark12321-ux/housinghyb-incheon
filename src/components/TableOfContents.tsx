import React, { useState, useEffect, useRef } from "react";
import { List, ArrowUp, ChevronRight, BookOpen, Layers, X } from "lucide-react";

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3
}

interface TableOfContentsProps {
  items: TocItem[];
  activeId: string;
  progress?: number;
  onItemClick: (id: string) => void;
  onScrollToTop?: () => void;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  activeId,
  progress = 0,
  onItemClick,
  onScrollToTop,
  className = ""
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navContainerRef = useRef<HTMLElement>(null);

  // 활성 항목이 긴 목차 리스트 내에서 시야에 머물도록 사이드바 스크롤 보정
  useEffect(() => {
    if (!activeId || !navContainerRef.current) return;
    const activeBtn = document.getElementById(`toc-nav-item-${activeId}`);
    if (activeBtn) {
      const container = navContainerRef.current;
      const btnTop = activeBtn.offsetTop;
      const btnHeight = activeBtn.offsetHeight;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (btnTop < containerScrollTop || btnTop + btnHeight > containerScrollTop + containerHeight) {
        container.scrollTo({
          top: btnTop - containerHeight / 2 + btnHeight / 2,
          behavior: "smooth"
        });
      }
    }
  }, [activeId]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      {/* 데스크톱 전용 사이드바 목차 (Sticky Sidebar) */}
      <aside 
        id="guide-reader-toc-sidebar"
        className={`w-full bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all ${className}`}
      >
        {/* 헤더 & 읽기 진행률 바 */}
        <div className="space-y-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <List className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 font-display">본문 목차</span>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              총 {items.length}개 항목
            </span>
          </div>

          {/* 읽기 진척도 게이지 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-500" />
                <span>읽기 진행률</span>
              </span>
              <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-200 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 목차 리스트 */}
        <nav 
          ref={navContainerRef}
          className="mt-3.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 space-y-1 text-xs scroll-smooth"
        >
          {items.map((item, idx) => {
            const isActive = activeId === item.id;
            const isH2 = item.level === 2;

            return (
              <button
                key={`${item.id}-${idx}`}
                id={`toc-nav-item-${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onItemClick(item.id);
                }}
                title={item.text}
                className={`w-full text-left rounded-lg py-2 px-2.5 flex items-center space-x-2 group cursor-pointer transition-all ${
                  isH2 ? "font-semibold text-slate-900" : "pl-5 font-normal text-slate-600"
                } ${
                  isActive 
                    ? "bg-blue-50/90 text-blue-700 font-bold border-l-3 border-blue-600 shadow-2xs" 
                    : "hover:bg-slate-50 hover:text-slate-900 border-l-3 border-transparent"
                }`}
              >
                <span className={`shrink-0 transition-colors ${
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                }`}>
                  {isH2 ? (
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isActive ? "bg-blue-600 scale-125" : "bg-slate-400"}`} />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </span>
                <span className="truncate flex-1 block leading-normal">
                  {item.text}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 하단 퀵 액션 */}
        {onScrollToTop && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onScrollToTop}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
              <span>맨 위로 이동</span>
            </button>
          </div>
        )}
      </aside>

      {/* 모바일/태블릿 전용 플로팅 목차 토글 버튼 및 모달 */}
      <div className="xl:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-full shadow-2xl border border-slate-700 font-bold text-xs transition-transform active:scale-95 cursor-pointer"
          aria-label="목차 열기"
        >
          <Layers className="w-4 h-4 text-blue-400" />
          <span>목차 ({Math.round(progress)}%)</span>
        </button>

        {isMobileOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsMobileOpen(false)}
          >
            <div 
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <List className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">본문 목차 바로가기</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-1.5 text-xs pr-1">
                {items.map((item, idx) => {
                  const isActive = activeId === item.id;
                  const isH2 = item.level === 2;
                  return (
                    <button
                      key={`mobile-${item.id}-${idx}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onItemClick(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={`w-full text-left py-2.5 px-3 rounded-xl transition-colors flex items-center space-x-2 cursor-pointer ${
                        isH2 ? "font-bold text-slate-900" : "pl-6 text-slate-600 font-normal"
                      } ${
                        isActive ? "bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="shrink-0 text-slate-400">
                        {isH2 ? "•" : "↳"}
                      </span>
                      <span className="truncate flex-1 block">{item.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    onScrollToTop?.();
                    setIsMobileOpen(false);
                  }}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>맨 위로</span>
                </button>
                <span className="text-slate-400 font-mono text-[11px]">진행률 {Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
