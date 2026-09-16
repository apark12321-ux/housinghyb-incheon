import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  Bookmark, 
  Calculator, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Share2, 
  TrendingUp, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  Filter, 
  ExternalLink, 
  BookOpen,
  Eye,
  List,
  FolderOpen,
  Tag,
  CheckCircle2,
  Clock,
  ArrowRight,
  Star,
  Trophy,
  HelpCircle
} from "lucide-react";
import { POSTS } from "./data/posts";
import { Post, Category, slugify } from "./types";
import { GuideReader } from "./components/GuideReader";
import { DiagnosticToolkit } from "./components/DiagnosticToolkit";
import { LegalPages } from "./components/LegalPages";
import { EDITORIAL_AUTHORS } from "./data/editorialTeam";

const POSTS_PER_PAGE = 10;

const CATEGORIES: Category[] = ["청약-분양", "전월세", "대출-금융", "이사-인테리어"];

const SUBCATEGORY_MAP: Record<string, string[]> = {
  "청약-분양": ["전체 보기", "공공·민간 특별공급", "무순위·줍줍", "청약통장·가점"],
  "전월세": ["전체 보기", "계약·등기부 실무", "반환보증·대항력", "임대차3법·갱신"],
  "대출-금융": ["전체 보기", "정책금융 (디딤돌/버팀목)", "시중은행 주담대·DSR", "취득세·양도세 자금플랜"],
  "이사-인테리어": ["전체 보기", "이사준비·체크리스트", "리모델링·공간배치", "입주청소·손해배상"]
};

const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  "공공·민간 특별공급": ["특별공급", "특공", "공공분양", "민간분양", "신생아", "생애최초", "신혼부부", "다자녀", "노부모"],
  "무순위·줍줍": ["무순위", "줍줍", "잔여세대", "계약취소", "무순위청약"],
  "청약통장·가점": ["청약통장", "가점", "무주택", "저축", "납입", "부양가족", "점수", "1순위", "인정금액"],
  "계약·등기부 실무": ["계약", "등기부", "등기", "특약", "갑구", "을구", "근저당", "가압류", "신탁", "임대차"],
  "반환보증·대항력": ["반환보증", "보증", "보증보험", "대항력", "확정일자", "전입신고", "전세사기", "깡통전세", "HUG", "HF"],
  "임대차3법·갱신": ["임대차", "계약갱신", "갱신청구권", "전월세상한제", "전월세신고제", "임대차3법", "묵시적"],
  "정책금융 (디딤돌/버팀목)": ["디딤돌", "버팀목", "신생아", "특례", "정책", "기금", "주택도시기금"],
  "시중은행 주담대·DSR": ["주담대", "주택담보대출", "DSR", "LTV", "스트레스", "은행", "금리"],
  "취득세·양도세 자금플랜": ["취득세", "양도세", "세금", "자금조달", "증여", "공제", "절세", "비과세"],
  "이사준비·체크리스트": ["이사", "체크리스트", "손없는날", "포장이사", "공과금", "전출", "입주"],
  "리모델링·공간배치": ["리모델링", "인테리어", "공간", "배치", "시공", "셀프"],
  "입주청소·손해배상": ["입주청소", "청소", "손해배상", "하자", "보수", "원상복구"]
};

function getInitialServerData(): any {
  if (typeof window !== "undefined") {
    const el = document.getElementById("__INITIAL_DATA__");
    if (el && el.textContent) {
      try {
        return JSON.parse(el.textContent);
      } catch (e) {
        console.error("Failed to parse __INITIAL_DATA__", e);
      }
    }
  }
  return null;
}

export default function App() {
  const initialData = useMemo(() => getInitialServerData(), []);

  const [posts] = useState<Post[]>(() => {
    return initialData?.initialPosts || POSTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return initialData?.initialState?.selectedCategory || "전체";
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("전체 보기");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<"latest" | "recommended">("latest");

  // 북마크 관리
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hh_bookmarks");
      return saved ? JSON.parse(saved) : ["sub-1", "rent-1", "finance-1"];
    }
    return ["sub-1", "rent-1", "finance-1"];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hh_bookmarks", JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  // 활성 뷰 상태
  const [activePostId, setActivePostId] = useState<string | null>(() => {
    if (initialData?.initialState?.activePostId) {
      return initialData.initialState.activePostId;
    }
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/post/")) {
        const rawSlug = decodeURIComponent(pathname.replace(/^\/post\//, "").replace(/\/$/, ""));
        const pool = initialData?.initialPosts || POSTS;
        const matched = pool.find((p: Post) => p.id === rawSlug || slugify(p.title) === rawSlug);
        if (matched) return matched.id;
      }
    }
    return null;
  });

  const [showDiagnosticPage, setShowDiagnosticPage] = useState<boolean>(() => {
    if (initialData?.initialState?.showDiagnosticPage) return true;
    if (typeof window !== "undefined") {
      return window.location.pathname === "/toolkit";
    }
    return false;
  });

  const [activeLegalTab, setActiveLegalTab] = useState<"about" | "privacy" | "terms" | "disclaimer" | null>(() => {
    if (initialData?.initialState?.activeLegalTab) return initialData.initialState.activeLegalTab;
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p === "/about") return "about";
      if (p === "/privacy") return "privacy";
      if (p === "/terms") return "terms";
      if (p === "/disclaimer") return "disclaimer";
    }
    return null;
  });

  // 토스트 알림 상태
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "error">("info");

  const showToast = (msg: string, type: "success" | "info" | "error" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast("보관함에서 글이 제거되었습니다.", "info");
        return prev.filter(item => item !== id);
      } else {
        showToast("관심 글로 보관함에 저장되었습니다.", "success");
        return [...prev, id];
      }
    });
  };

  // URL 라우팅 동기화
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith("/post/")) {
        const rawSlug = decodeURIComponent(path.replace(/^\/post\//, "").replace(/\/$/, ""));
        const matched = posts.find(p => p.id === rawSlug || slugify(p.title) === rawSlug);
        if (matched) {
          setActivePostId(matched.id);
          setShowDiagnosticPage(false);
          setActiveLegalTab(null);
          return;
        }
      }
      if (path === "/toolkit") {
        setShowDiagnosticPage(true);
        setActivePostId(null);
        setActiveLegalTab(null);
        return;
      }
      if (["/about", "/privacy", "/terms", "/disclaimer"].includes(path)) {
        setActiveLegalTab(path.replace("/", "") as any);
        setActivePostId(null);
        setShowDiagnosticPage(false);
        return;
      }
      // 홈 복귀
      setActivePostId(null);
      setShowDiagnosticPage(false);
      setActiveLegalTab(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [posts]);

  // 글 선택 시 URL 업데이트 및 스크롤
  const handleSelectPost = (post: Post) => {
    setActivePostId(post.id);
    setShowDiagnosticPage(false);
    setActiveLegalTab(null);
    const slug = slugify(post.title);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/post/${encodeURIComponent(slug)}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoHome = () => {
    setActivePostId(null);
    setShowDiagnosticPage(false);
    setActiveLegalTab(null);
    setSelectedCategory("전체");
    setSelectedSubCategory("전체 보기");
    setSearchTerm("");
    setSearchInput("");
    setSelectedTag(null);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory("전체 보기");
    setActivePostId(null);
    setShowDiagnosticPage(false);
    setActiveLegalTab(null);
    setSearchTerm("");
    setSearchInput("");
    setSelectedTag(null);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", cat === "전체" ? "/" : `/category/${encodeURIComponent(cat)}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenToolkit = () => {
    setShowDiagnosticPage(true);
    setActivePostId(null);
    setActiveLegalTab(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/toolkit");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenLegal = (tab: "about" | "privacy" | "terms" | "disclaimer") => {
    setActiveLegalTab(tab);
    setActivePostId(null);
    setShowDiagnosticPage(false);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/${tab}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchTerm(searchInput.trim());
      setActivePostId(null);
      setShowDiagnosticPage(false);
      setActiveLegalTab(null);
      setCurrentPage(1);
    }
  };

  // 현재 활성 글 객체
  const activePost = useMemo(() => {
    if (!activePostId) return null;
    return posts.find(p => p.id === activePostId) || null;
  }, [activePostId, posts]);

  // 클라이언트 사이드 SEO 메타데이터 동적 동기화 및 URL 정규화
  useEffect(() => {
    if (typeof window === "undefined") return;

    const baseUrl = "https://zip9.kr";
    let title = "하우징허브 (HousingHub) | 2026 주거·청약·대출 실무 가이드";
    let desc = "신혼부부와 무주택자를 위한 청약 공고문 실무 분석, 전월세 대항력 및 안전 계약 가이드, 디딤돌·버팀목 대출 분석 실무 지식 포털입니다.";
    let canonical = `${baseUrl}/`;

    if (activePost) {
      const slug = slugify(activePost.title);
      title = `${activePost.title} | 하우징허브`;
      desc = activePost.excerpt || desc;
      canonical = `${baseUrl}/post/${encodeURIComponent(slug)}`;

      // URL 정규화: ID 형태로 진입 시 주소창을 표준 슬러그로 즉시 치환 (검색엔진 정규화)
      const currentPath = window.location.pathname;
      const targetPath = `/post/${encodeURIComponent(slug)}`;
      if (currentPath !== targetPath && currentPath.startsWith("/post/")) {
        window.history.replaceState(null, "", targetPath);
      }
    } else if (showDiagnosticPage) {
      title = "스마트 주거 자가진단 툴킷 (청약 가점·DSR 계산기) | 하우징허브";
      desc = "LTV/DSR 역산 공식과 청약 가점(84점 만점) 모의 계산기를 통해 내 집 마련 대출 한도와 당첨 가능성을 즉시 진단하세요.";
      canonical = `${baseUrl}/toolkit`;
    } else if (activeLegalTab === "about") {
      title = "하우징허브 소개 (About Us) & 기획자 박 실장 스토리 | 하우징허브";
      desc = "부동산 금융 10년 차 실무자 박 실장과 리서치팀이 전하는 하우징허브(HousingHub)의 경험 기반 주거·청약·대출 운영 철학입니다.";
      canonical = `${baseUrl}/about`;
    } else if (activeLegalTab === "privacy") {
      title = "개인정보처리방침 (Privacy Policy) | 하우징허브";
      desc = "하우징허브의 개인정보 보호 및 구글 애드센스 쿠키 운용 방침 안내입니다.";
      canonical = `${baseUrl}/privacy`;
    } else if (activeLegalTab === "terms") {
      title = "서비스 이용약관 (Terms of Service) | 하우징허브";
      desc = "하우징허브 서비스 이용에 관한 약관입니다.";
      canonical = `${baseUrl}/terms`;
    } else if (activeLegalTab === "disclaimer") {
      title = "면책 조항 및 법적 고지 (Disclaimer) | 하우징허브";
      desc = "하우징허브가 제공하는 모든 콘텐츠는 법적·공식 공고 기준을 토대로 한 공익 정보 제공용 자료입니다.";
      canonical = `${baseUrl}/disclaimer`;
    } else if (selectedCategory && selectedCategory !== "전체") {
      title = `${selectedCategory} 실무 가이드 및 분석 리포트 | 하우징허브`;
      desc = `${selectedCategory} 관련 최신 정책과 공고문 실무 분석 정보를 확인하세요.`;
      canonical = `${baseUrl}/category/${encodeURIComponent(selectedCategory)}`;
    }

    document.title = title;

    // description 메타태그
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", desc);
    }

    // canonical 태그
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
      linkCanonical.setAttribute("href", canonical);
    } else {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      linkCanonical.setAttribute("href", canonical);
      document.head.appendChild(linkCanonical);
    }

    // OG 태그
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", canonical);

    // Twitter 태그
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", desc);
  }, [activePost, showDiagnosticPage, activeLegalTab, selectedCategory]);

  // 필터링된 포스트 목록
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (selectedCategory !== "전체" && p.category !== selectedCategory) {
        return false;
      }
      if (selectedSubCategory !== "전체 보기") {
        const keywords = SUBCATEGORY_KEYWORDS[selectedSubCategory] || [];
        const matchesSub = keywords.some(k => 
          p.title.includes(k) || p.excerpt.includes(k) || (p.hashtags && p.hashtags.some(h => h.includes(k)))
        );
        if (!matchesSub) return false;
      }
      if (selectedTag) {
        if (!p.hashtags || !p.hashtags.includes(selectedTag)) {
          return false;
        }
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchExcerpt = p.excerpt.toLowerCase().includes(q);
        const matchTag = p.hashtags && p.hashtags.some(h => h.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt && !matchTag) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortOrder === "recommended") {
        const aScore = (a.isEssential ? 2 : 0) + (a.isHot ? 1 : 0);
        const bScore = (b.isEssential ? 2 : 0) + (b.isHot ? 1 : 0);
        if (bScore !== aScore) return bScore - aScore;
      }
      return (b.date || "").localeCompare(a.date || "");
    });
  }, [posts, selectedCategory, selectedSubCategory, selectedTag, searchTerm, sortOrder]);

  // 페이징 계산
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPagedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // 가장 추천하는 핵심 가이드 (Favourite Guides)
  const favouritePosts = useMemo(() => {
    return posts.filter(p => p.isEssential || p.isHot).slice(0, 6);
  }, [posts]);

  // 최신 등록 실무 가이드 TOP 5
  const topRecentPosts = useMemo(() => {
    return [...posts].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 5);
  }, [posts]);

  // 태그 목록
  const popularTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => {
      p.hashtags?.forEach(tag => set.add(tag));
    });
    return Array.from(set).slice(0, 14);
  }, [posts]);

  // 카테고리별 글 수
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 전체: posts.length };
    CATEGORIES.forEach(cat => {
      counts[cat] = posts.filter(p => p.category === cat).length;
    });
    return counts;
  }, [posts]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans antialiased flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 메인 블로그 헤더 (티스토리/네이버 블로그 스타일) */}
      <header className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div 
                onClick={handleGoHome}
                className="cursor-pointer group inline-block"
              >
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 group-hover:text-emerald-700 transition-colors">
                  <span>하우징허브</span>
                  <span className="text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    블로그
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                  신혼부부와 무주택자를 위한 2026 주택청약·전월세 안심 계약·부동산금융 실무 아카이브
                </p>
              </div>
            </div>

            {/* 헤더 검색창 */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="블로그 내 검색 (예: 신생아특공)"
                className="w-full pl-3.5 pr-9 py-2 text-xs sm:text-sm border border-slate-300 rounded-md bg-[#fafafa] focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all text-slate-800"
              />
              <button 
                type="submit" 
                title="검색"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* 가로형 블로그 메뉴바 (GNB) */}
        <nav aria-label="메인 카테고리 메뉴" className="border-t border-slate-100 bg-[#fafbfc]">
          <div className="max-w-6xl mx-auto px-4 flex items-center overflow-x-auto no-scrollbar text-sm font-medium">
            <button
              onClick={() => handleSelectCategory("전체")}
              className={`py-3 px-4 border-b-2 font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === "전체" && !showDiagnosticPage && !activeLegalTab
                  ? "border-emerald-600 text-emerald-800 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>전체글</span>
              <span className="text-xs font-normal text-slate-400">({posts.length})</span>
            </button>

            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat && !showDiagnosticPage && !activeLegalTab
                    ? "border-emerald-600 text-emerald-800 font-bold bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{cat}</span>
                <span className="text-xs text-slate-400">({categoryCounts[cat] || 0})</span>
              </button>
            ))}

            <button
              onClick={handleOpenToolkit}
              className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                showDiagnosticPage
                  ? "border-emerald-600 text-emerald-800 font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>자가진단 계산기</span>
            </button>

            <button
              onClick={() => handleOpenLegal("about")}
              className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeLegalTab === "about"
                  ? "border-emerald-600 text-emerald-800 font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>블로그 소개</span>
            </button>
          </div>
        </nav>
      </header>

      {/* 3. 블로그 2-컬럼 레이아웃 (본문 + 우측 사이드바) */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ==================================================== */}
          {/* [좌측 본문 영역 - flex-1 min-w-0] */}
          {/* ==================================================== */}
          <main className="flex-1 min-w-0 w-full space-y-6">

            {/* A. 개별 글 상세 보기 (GuideReader) */}
            {activePost ? (
              <GuideReader
                post={activePost}
                onBack={handleGoHome}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                showToast={showToast}
                allPosts={posts}
                onSelectPost={handleSelectPost}
              />
            ) : showDiagnosticPage ? (
              /* B. 스마트 자가진단 툴킷 페이지 */
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleGoHome}
                      className="text-xs text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      홈으로
                    </button>
                    <span className="text-slate-300">&gt;</span>
                    <span className="text-xs font-bold text-emerald-700">스마트 주거 자가진단 툴킷</span>
                  </div>
                  <span className="text-xs text-slate-400">실시간 금융 모의 계산</span>
                </div>
                <DiagnosticToolkit onBack={handleGoHome} />
              </div>
            ) : activeLegalTab ? (
              /* C. 법률 및 정책 헌장 페이지 (About / Privacy / Terms / Disclaimer) */
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleGoHome}
                      className="text-xs text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      홈으로
                    </button>
                    <span className="text-slate-300">&gt;</span>
                    <span className="text-xs font-bold text-emerald-700">블로그 안내 및 운영정책</span>
                  </div>
                </div>
                <LegalPages 
                  activeTab={activeLegalTab} 
                  onTabChange={(tab) => handleOpenLegal(tab as any)} 
                />
              </div>
            ) : (
              /* D. 메인 글 목록 (티스토리 웹진형/리스트형 블로그 피드) */
              <div className="space-y-6">
                
                {/* 상단 분류 헤더 및 소분류 필터 바 */}
                <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="w-5 h-5 text-emerald-700" />
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedCategory === "전체" ? "전체 글 목록" : `'${selectedCategory}' 카테고리의 글`}
                      </h2>
                      <span className="text-xs text-slate-500 font-mono">
                        (총 {filteredPosts.length}개)
                      </span>
                    </div>

                    {/* 정렬 필터 */}
                    <div className="flex items-center space-x-2 text-xs">
                      <button
                        onClick={() => setSortOrder("latest")}
                        className={`px-2.5 py-1 rounded cursor-pointer ${
                          sortOrder === "latest" ? "bg-slate-800 text-white font-bold" : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        최신순
                      </button>
                      <button
                        onClick={() => setSortOrder("recommended")}
                        className={`px-2.5 py-1 rounded cursor-pointer ${
                          sortOrder === "recommended" ? "bg-slate-800 text-white font-bold" : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        추천순
                      </button>
                    </div>
                  </div>

                  {/* 세부 서브카테고리 필터 태그 (카테고리 선택 시 노출) */}
                  {selectedCategory !== "전체" && SUBCATEGORY_MAP[selectedCategory] && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SUBCATEGORY_MAP[selectedCategory].map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setSelectedSubCategory(sub);
                            setCurrentPage(1);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                            selectedSubCategory === sub
                              ? "bg-emerald-700 text-white font-bold shadow-2xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 검색어 또는 태그 활성 배너 */}
                  {(searchTerm || selectedTag) && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200 text-xs">
                      <div className="flex items-center space-x-2">
                        <Search className="w-3.5 h-3.5" />
                        <span>
                          {searchTerm ? `검색어: "${searchTerm}"` : `태그: #${selectedTag}`} 검색 결과
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedTag(null);
                          setCurrentPage(1);
                        }}
                        className="text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>초기화</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 포스트 리스트 (웹진형 티스토리 블로그 피드) */}
                {currentPagedPosts.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-lg border border-slate-200 text-slate-500 space-y-2">
                    <p className="text-base font-bold text-slate-700">해당 조건에 맞는 글이 없습니다.</p>
                    <p className="text-xs">다른 검색어나 카테고리를 선택해 보세요.</p>
                    <button
                      onClick={handleGoHome}
                      className="mt-3 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      전체글 보기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {currentPagedPosts.map(post => (
                      <article
                        key={post.id}
                        onClick={() => handleSelectPost(post)}
                        className="p-5 sm:p-6 bg-white rounded-lg border border-slate-200 hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer space-y-2.5 group"
                      >
                        {/* 상단 메타 바 */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {post.category}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{post.date}</span>
                        </div>

                        {/* 제목 (dwqa-question-title) */}
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 group-hover:underline transition-colors leading-snug">
                          {post.title}
                        </h2>

                        {/* 요약 발췌문 (excerpt) */}
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>

                        {/* 하단 태그 */}
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.hashtags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tag);
                                  setCurrentPage(1);
                                }}
                                className="text-[11px] text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                {/* ko.phongnhaexplorer.com 스타일 블로그 안내 & 전문성 정보 블록 (category_info) */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-3 mt-8">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                    <BookOpen className="w-5 h-5 text-emerald-700" />
                    <h2>하우징허브 2026 주택청약 & 부동산 금융 지식 허브</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    신혼부부, 청년, 무주택 실수요자를 위해 2026년 정부 주거 정책 및 공고문, 전월세 대항력 확보, 스트레스 DSR 대출 심사 기준을 정확하고 투명하게 제공하는 독립 아카이브입니다. 복잡한 부동산 법령과 금융 심사 기준을 알기 쉽게 정리하여 안전한 내 집 마련을 돕습니다.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600">
                    <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                      <strong className="text-slate-900 font-bold block">다양성 (Comprehensive)</strong>
                      <p className="text-slate-500">청약 가점 계산부터 전세사기 예방, DSR 대출 한도까지 A to Z 망라</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                      <strong className="text-slate-900 font-bold block">최신성 (2026 Updated)</strong>
                      <p className="text-slate-500">2026년 최신 개정 청약 시행령 및 정책 대출 요건 실시간 반영</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                      <strong className="text-slate-900 font-bold block">신뢰성 (Cross-Verified)</strong>
                      <p className="text-slate-500">한국부동산원 청약홈, 주택도시기금 등 공식 공고문 교차 검증</p>
                    </div>
                  </div>
                </div>

                {/* 클래식 블로그 페이지네이션 (Pagination) */}
                {totalPages > 1 && (
                  <nav aria-label="블로그 페이지 이동" className="py-6 flex items-center justify-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      이전
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? "bg-emerald-700 text-white border border-emerald-700 shadow-2xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      다음
                    </button>
                  </nav>
                )}
              </div>
            )}
          </main>

          {/* ==================================================== */}
          {/* [우측 사이드바 영역 - w-72 or w-80] */}
          {/* ==================================================== */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">

            {/* 1. ko.phongnhaexplorer.com 벤치마킹: 가장 추천하는 핵심 가이드 (favourite) */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>가장 추천하는 핵심 가이드</span>
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {favouritePosts.map((fp) => (
                  <li 
                    key={fp.id}
                    onClick={() => handleSelectPost(fp)}
                    className="hover:bg-slate-50 p-1.5 rounded cursor-pointer transition-colors group"
                  >
                    <p className="text-slate-800 group-hover:text-emerald-700 group-hover:underline font-medium line-clamp-2 leading-snug text-xs">
                      · {fp.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">
                      {fp.category} · {fp.date}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. 최신 실무 가이드 TOP 5 */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>최신 실무 가이드 TOP 5</span>
                </h3>
              </div>
              <ol className="space-y-2.5 text-xs sm:text-sm">
                {topRecentPosts.map((pp, idx) => (
                  <li 
                    key={pp.id}
                    onClick={() => handleSelectPost(pp)}
                    className="flex items-start gap-2.5 hover:bg-slate-50 p-1.5 rounded cursor-pointer transition-colors group"
                  >
                    <span className="w-4 h-4 rounded bg-slate-100 text-slate-700 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 group-hover:text-emerald-700 group-hover:underline font-medium line-clamp-2 leading-snug text-xs">
                        {pp.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {pp.category} · {pp.date}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* 3. 카테고리 트리 위젯 (Categories) */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <List className="w-4 h-4 text-emerald-700" />
                  <span>카테고리별 분류</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">총 {posts.length}편</span>
              </div>
              <ul className="space-y-1 text-xs sm:text-sm">
                <li>
                  <button
                    onClick={() => handleSelectCategory("전체")}
                    className={`w-full py-1.5 px-2 rounded flex items-center justify-between text-left transition-colors cursor-pointer ${
                      selectedCategory === "전체" && !showDiagnosticPage && !activeLegalTab
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>전체 글 보기</span>
                    <span className="text-slate-400 text-xs font-mono">({posts.length})</span>
                  </button>
                </li>
                {CATEGORIES.map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => handleSelectCategory(cat)}
                      className={`w-full py-1.5 px-2 rounded flex items-center justify-between text-left transition-colors cursor-pointer ${
                        selectedCategory === cat && !showDiagnosticPage && !activeLegalTab
                          ? "bg-emerald-50 text-emerald-900 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-emerald-700">├</span>
                        <span>{cat}</span>
                      </span>
                      <span className="text-slate-400 text-xs font-mono">({categoryCounts[cat] || 0})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. 자가진단 계산기 바로가기 배너 */}
            <div 
              onClick={handleOpenToolkit}
              className="bg-gradient-to-br from-emerald-800 to-slate-900 text-white rounded-lg p-5 shadow-xs cursor-pointer hover:opacity-95 transition-opacity space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-bold">
                  2026 실시간 계산
                </span>
                <Calculator className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold leading-snug">
                주택 대출한도 DSR 및 청약 가점 계산기
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                수도권 스트레스 DSR 3단계 대출 한도와 청약 가점 84점 만점 산정을 즉시 모의 시뮬레이션하세요.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs text-emerald-400 font-bold">
                <span>계산기 실행하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 5. 블로그 안내 & 운영원칙 위젯 */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-2.5 text-xs text-slate-600">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>하우징허브 블로그 소개 & 운영원칙</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                하우징허브의 모든 콘텐츠는 정부 고시 공고문 및 법원 판례를 바탕으로 공인 자격 연구진이 작성하며, 무단 복제 및 불법 배포를 엄격히 금합니다.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-600 font-medium">
                <button onClick={() => handleOpenLegal("about")} className="hover:text-emerald-700 underline cursor-pointer">블로그 소개</button>
                <span>·</span>
                <button onClick={() => handleOpenLegal("privacy")} className="hover:text-emerald-700 underline cursor-pointer">개인정보처리방침</button>
                <span>·</span>
                <button onClick={() => handleOpenLegal("terms")} className="hover:text-emerald-700 underline cursor-pointer">이용약관</button>
                <span>·</span>
                <button onClick={() => handleOpenLegal("disclaimer")} className="hover:text-emerald-700 underline cursor-pointer">법적고지</button>
              </div>
            </div>

          </aside>
        </div>
      </div>

      {/* 4. 블로그 푸터 (클래식 티스토리/네이버 스타일) */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-12 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* 상단 푸터 링크 */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 text-xs font-medium">
            <div className="flex flex-wrap items-center gap-4 text-slate-700">
              <button onClick={() => handleOpenLegal("about")} className="hover:text-emerald-700 cursor-pointer font-bold">블로그 소개</button>
              <span>|</span>
              <button onClick={() => handleOpenLegal("privacy")} className="hover:text-emerald-700 cursor-pointer font-bold text-slate-900">개인정보처리방침</button>
              <span>|</span>
              <button onClick={() => handleOpenLegal("terms")} className="hover:text-emerald-700 cursor-pointer">이용약관</button>
              <span>|</span>
              <button onClick={() => handleOpenLegal("disclaimer")} className="hover:text-emerald-700 cursor-pointer">책임한계 및 법적고지</button>
            </div>
            <div className="text-slate-400 text-[11px]">
              문의: <a href="mailto:apark12321@gmail.com" className="hover:text-emerald-700 underline">apark12321@gmail.com</a>
            </div>
          </div>

          {/* 블로그 안내 및 법적 면책 고지 */}
          <div className="space-y-1.5 text-[11px] text-slate-500 leading-relaxed">
            <p className="text-slate-600">
              <strong>블로그명</strong>: 하우징허브 (HousingHub) · <strong>운영</strong>: 하우징허브 편집팀 · <strong>문의 이메일</strong>: <a href="mailto:apark12321@gmail.com" className="underline hover:text-emerald-700">apark12321@gmail.com</a>
            </p>
            <p className="pt-1 text-slate-400">
              본 블로그에서 제공하는 모든 주택청약 및 부동산 금융 정보는 단순 참고용 가이드이며, 개별 계약 및 대출 심사에 대한 법적 보증 효력을 갖지 않습니다. 실제 청약 신청 및 대출 실행 전 반드시 관계 기관(한국부동산원 청약홈, 주택도시기금, 취급 은행)의 최신 공식 공고를 확인하시기 바랍니다.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
            <p>Copyright © 2026 하우징허브 (HousingHub). All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* 토스트 알림 메시지 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-md bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center space-x-2 animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
