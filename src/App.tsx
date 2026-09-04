import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Building2, 
  Search, 
  Bookmark, 
  Calculator, 
  Calculator as CalcIcon, 
  MessageSquare, 
  X, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  BookmarkCheck, 
  Share2, 
  TrendingUp, 
  AlertTriangle, 
  Percent, 
  CheckCircle2, 
  User, 
  Calendar, 
  RefreshCcw, 
  Send,
  HelpCircle,
  FileText,
  BadgeAlert,
  Menu,
  Heart,
  ShieldCheck,
  Filter,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { POSTS, POSTS_BY_CATEGORY } from "./data/posts";
import { Post, Category, slugify } from "./types";
import { extractTopSeoKeywords, updateMetaKeywords, buildRefinedGoogleSearchUrl } from "./utils/seoKeywords";
import { SubscriptionCalendar } from "./components/SubscriptionCalendar";
import { GuideReader } from "./components/GuideReader";

interface Message {
  role: "user" | "model";
  text: string;
  time: string;
}


const SUBCATEGORY_MAP: Record<string, string[]> = {
  "청약-분양": ["전체 보기", "공공·민간 특별공급", "무순위·줍줍", "청약통장·가점"],
  "전월세": ["전체 보기", "계약·등기부 실무", "반환보증·대항력", "임대차3법·갱신"],
  "대출-금융": ["전체 보기", "정책금융 (디딤돌/버팀목)", "시중은행 주담대·DSR", "취득세·양도세 자금플랜"],
  "이사-인테리어": ["전체 보기", "이사준비·체크리스트", "리모델링·공간배치", "입주청소·손해배상"]
};

// 각 세부 주제(중분류)별 고도화 키워드 매핑 (리포트 유실 방지 및 정밀 검색)
const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  // 청약-분양
  "공공·민간 특별공급": ["특별공급", "특공", "공공분양", "민간분양", "신생아", "생애최초", "신혼부부", "다자녀", "노부모", "공공", "분양"],
  "무순위·줍줍": ["무순위", "줍줍", "잔여세대", "계약취소", "무순위청약", "잔여", "임대주택"],
  "청약통장·가점": ["청약통장", "가점", "무주택", "저축", "납입", "부양가족", "점수", "1순위", "통장", "인정금액"],

  // 전월세
  "계약·등기부 실무": ["계약", "등기부", "등기", "특약", "갑구", "을구", "근저당", "가압류", "신탁", "임대차", "전세", "월세", "임차인", "임대인", "등기부등본"],
  "반환보증·대항력": ["반환보증", "보증", "보증보험", "대항력", "확정일자", "전입신고", "전세사기", "깡통전세", "HUG", "HF", "SGI", "우선변제", "최우선변제"],
  "임대차3법·갱신": ["임대차", "계약갱신", "갱신청구권", "전월세상한제", "전월세신고제", "임대차3법", "묵시적", "임대인", "임차인", "갱신", "상한제"],

  // 대출-금융
  "정책금융 (디딤돌/버팀목)": ["디딤돌", "버팀목", "신생아", "특례", "정책", "기금", "주택도시기금", "보금자리론", "안심전세", "정책대출"],
  "시중은행 주담대·DSR": ["주담대", "주택담보대출", "DSR", "LTV", "스트레스", "은행", "금리", "변동금리", "고정금리", "한도", "대출"],
  "취득세·양도세 자금플랜": ["취득세", "양도세", "세금", "자금조달", "증여", "공제", "절세", "비과세", "보유세", "종부세", "자금플랜"],

  // 이사-인테리어
  "이사준비·체크리스트": ["이사", "체크리스트", "손없는날", "포장이사", "공과금", "전출", "입주", "이삿날", "관리비"],
  "리모델링·공간배치": ["리모델링", "인테리어", "공간", "배치", "시공", "셀프", "디자인", "가구", "홈", "구축"],
  "입주청소·손해배상": ["입주청소", "청소", "손해배상", "하자", "보수", "원상복구", "체크", "점검", "폐기물", "방문수거"]
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

  const [posts, setPosts] = useState<Post[]>(() => {
    return initialData?.initialPosts || POSTS;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return initialData?.initialState?.selectedCategory || "전체";
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("전체 보기");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 북마크 관리
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem("hh_bookmarks");
    return saved ? JSON.parse(saved) : ["sub-1", "rent-1", "finance-1"];
  });

  // 백엔드 자동 발행 포스팅 실시간 수신 및 동기화 (1일 1포스팅+ 스케줄 반영)
  useEffect(() => {
    const syncPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
            setPosts(data.posts);
          }
        }
      } catch (err) {
        console.log("Post sync status:", err);
      }
    };

    syncPosts();
    const timer = setInterval(syncPosts, 30000);
    return () => clearInterval(timer);
  }, []);

  // 검색어를 초기 "Incheon" -> "" 로 편안히 리셋하거나, 전체 글이 잘 드러나도록 기본은 빈값으로 세팅 후 편리한 기둥 제작
  useEffect(() => {
    setSearchTerm("");
  }, []);

  // 카테고리 변경 시 세부주제 및 태그 선택 상태 초기화
  useEffect(() => {
    setSelectedSubCategory("전체 보기");
    setSelectedTag(null);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("hh_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // 상세 보기 모달 관련 (초기 서버 전달 게시글 즉시 반영)
  const [activePost, setActivePost] = useState<Post | null>(() => {
    return initialData?.post || null;
  });

  // 자가진단 계산기 탭: 'loan' (대출한도) | 'score' (청약가점)
  const [toolTab, setToolTab] = useState<"loan" | "score">("loan");

  // 별도 페이지용 스마트 자가진단 툴킷 페이지 상태 활성화
  const [showDiagnosticPage, setShowDiagnosticPage] = useState<boolean>(() => {
    return initialData?.initialState?.showDiagnosticPage || false;
  });

  // --- 법률 및 애드센스 정책 안심 확보 상태 (인라인 페이지화) ---
  const [activeLegalTab, setActiveLegalTab] = useState<"privacy" | "terms" | "disclaimer" | "about" | null>(() => {
    const tab = initialData?.initialState?.activeLegalTab;
    if (tab === "contact") return null;
    return tab || null;
  });

  // URL에서 초기 /post/xxx 혹은 ?post=xxx 혹은 서브페이지(/toolkit, /privacy, /terms 등)를 읽어 세팅 및 popstate 감지
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      let postIdentifier: string | null = null;

      if (pathname === "/toolkit") {
        setShowDiagnosticPage(true);
        setActiveLegalTab(null);
        setActivePost(null);
        return;
      } else if (pathname === "/privacy") {
        setActiveLegalTab("privacy");
        setShowDiagnosticPage(false);
        setActivePost(null);
        return;
      } else if (pathname === "/about") {
        setActiveLegalTab("about");
        setShowDiagnosticPage(false);
        setActivePost(null);
        return;
      } else if (pathname === "/terms") {
        setActiveLegalTab("terms");
        setShowDiagnosticPage(false);
        setActivePost(null);
        return;
      } else if (pathname === "/disclaimer") {
        setActiveLegalTab("disclaimer");
        setShowDiagnosticPage(false);
        setActivePost(null);
        return;
      } else if (pathname === "/contact" || pathname === "/partnership") {
        setActiveLegalTab(null);
        setShowDiagnosticPage(false);
        setActivePost(null);
        window.history.replaceState(null, "", "/");
        return;
      } else {
        // Reset subpages states if navigating back to home
        if (pathname === "/") {
          setActiveLegalTab(null);
          setShowDiagnosticPage(false);
        }
      }

      if (pathname.startsWith("/post/")) {
        postIdentifier = decodeURIComponent(pathname.replace("/post/", ""));
      } else {
        const queryPost = params.get("post");
        if (queryPost) {
          postIdentifier = decodeURIComponent(queryPost);
        }
      }

      if (postIdentifier) {
        const found = posts.find(
          p => p.title === postIdentifier || p.id === postIdentifier || slugify(p.title) === postIdentifier
        );
        if (found) {
          setActivePost(found);
        } else {
          setActivePost(null);
        }
      } else {
        setActivePost(null);
      }
    };

    // 첫 실행시 파싱
    handleLocationChange();

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [posts]);

  // 상태 변화에 따른 브라우저 주소, 문서 타이틀 및 메타 키워드 동기화 (SEO / AEO 최적화)
  useEffect(() => {
    const pathname = window.location.pathname;

    if (activePost) {
      const targetSlug = slugify(activePost.title);
      if (pathname !== `/post/${targetSlug}`) {
        window.history.pushState({ postTitle: activePost.title }, "", `/post/${targetSlug}`);
      }
      document.title = `${activePost.title} | 하우징허브`;

      // 본문 콘텐츠를 심층 분석하여 구글 SEO에 최적화된 고가치 메타 키워드 10개 자동 추출 및 메타태그 갱신
      const autoKeywords = extractTopSeoKeywords({
        title: activePost.title,
        excerpt: activePost.excerpt,
        content: activePost.content,
        category: activePost.category,
        hashtags: activePost.hashtags,
        maxCount: 10
      });
      updateMetaKeywords(autoKeywords);
    } else if (showDiagnosticPage) {
      if (pathname !== "/toolkit") {
        window.history.pushState(null, "", "/toolkit");
      }
      document.title = "스마트 주거 자가진단 툴킷 | 하우징허브";
      updateMetaKeywords([
        "하우징허브", "주택청약가점계산기", "DSR대출한도계산", "LTV계산", "스트레스DSR",
        "신혼부부청약가점", "무주택기간계산", "부양가족가점", "디딤돌대출한도", "버팀목대출자가진단"
      ]);
    } else if (activeLegalTab) {
      const targetPath = `/${activeLegalTab}`;
      if (pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
      if (activeLegalTab === "privacy") {
        document.title = "개인정보처리방침 | 하우징허브";
      } else if (activeLegalTab === "terms") {
        document.title = "서비스 이용약관 | 하우징허브";
      } else if (activeLegalTab === "disclaimer") {
        document.title = "정보이용 면책고지 | 하우징허브";
      } else if (activeLegalTab === "about") {
        document.title = "소개 및 콘텐츠 신뢰 선언 | 하우징허브";
      }
      updateMetaKeywords([
        "하우징허브", "개인정보처리방침", "이용약관", "면책고지", "콘텐츠운영원칙",
        "주거정책리포트", "무주택실수요자", "안심주거포털", "주택정보검증"
      ]);
    } else {
      const subpages = ["/toolkit", "/privacy", "/terms", "/disclaimer", "/about"];
      const isSubpage = subpages.includes(pathname) || pathname.startsWith("/post/");
      if (isSubpage) {
        window.history.pushState(null, "", "/");
      }
      document.title = "하우징허브 (HousingHub) | 주택청약·전월세안심·주택금융 가이드";
      updateMetaKeywords([
        "하우징허브", "HousingHub", "주택청약", "청약가점계산기", "전세대출",
        "디딤돌대출", "버팀목대출", "DSR계산기", "전월세계약특약", "주거정책리포트"
      ]);
    }
  }, [activePost, showDiagnosticPage, activeLegalTab]);

  // 페이지 전환 시 스크롤 상단 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePost, activeLegalTab, showDiagnosticPage]);

  // 토스트 알림 상태 및 기동 함수
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 4500);
  };

  // --- 대출 계산기 상태 변수 ---
  const [annualIncome, setAnnualIncome] = useState<number>(6000); // 연소득 6000만원
  const [otherDebtInterest, setOtherDebtInterest] = useState<number>(0); // 기타 대출 연 이자료
  const [propertyValue, setPropertyValue] = useState<number>(50000); // 주택평가액 5억원
  const [loanTerm, setLoanTerm] = useState<number>(30); // 30년 상환
  const [interestRate, setInterestRate] = useState<number>(3.8); // 금리 3.8%
  const [ltvLimit, setLtvLimit] = useState<number>(70); // 일반 LTV 70%

  // --- 청약 가점 계산기 상태 변수 ---
  const [homelessYears, setHomelessYears] = useState<number>(5); // 무주택 기간 요건 (0~15년)
  const [dependents, setDependents] = useState<number>(2); // 부양 가족 수 (0~6명)
  const [bankbookYears, setBankbookYears] = useState<number>(7); // 통장 가입 기간 (0~15년)

  // --- AI 챗봇 관련 상태 ---
  const IS_CHAT_ENABLED = true;
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("hh_chats");
    return saved ? JSON.parse(saved) : [
      { 
        role: "model", 
        text: "반갑습니다! <strong>하우징허브 AI 주거 안심 비서</strong>입니다. <br/>청약 자격요건, 전월세 사기 차단 특약 조항, 스트레스 DSR 한도 분석부터 맞춤 주거 정책 분석까지 무엇이든 편하게 물어보세요! 😊", 
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
      }
    ];
  });
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("hh_chats", JSON.stringify(chatMessages));
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // 북마크 토글 함수
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  // 선택된 카테고리별 유니크 해시태그 목록 추출
  const popularHashtags = useMemo(() => {
    const targetPosts = selectedCategory === "전체"
      ? posts 
      : posts.filter(p => p.category === selectedCategory);

    const tagsMap: Record<string, number> = {};
    targetPosts.forEach(p => {
      p.hashtags?.forEach(tag => {
        if (tag) {
          tagsMap[tag] = (tagsMap[tag] || 0) + 1;
        }
      });
    });
    return Object.entries(tagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }, [posts, selectedCategory]);

  // 피드 필터링 로직
  const filteredPosts = useMemo(() => {
    const list = posts.filter(post => {
      if (!post) return false;
      const matchCategory = selectedCategory === "전체" 
        ? true 
        : post.category === selectedCategory;
      
      let matchSubCategory = true;
      if (selectedSubCategory && selectedSubCategory !== "전체 보기") {
        const keywords = SUBCATEGORY_KEYWORDS[selectedSubCategory];
        if (keywords && keywords.length > 0) {
          matchSubCategory = keywords.some(kw => 
            (post.title && post.title.includes(kw)) ||
            (post.excerpt && post.excerpt.includes(kw)) ||
            (post.content && post.content.includes(kw)) ||
            (post.hashtags && post.hashtags.some(t => t.includes(kw)))
          );
        } else {
          // 예외 상황 시 세부주제 명칭 단어 분할 매칭
          const subKwList = selectedSubCategory.replace(/[\(\)\/·]/g, " ").split(/\s+/).filter(Boolean);
          matchSubCategory = subKwList.some(kw => 
            (post.title && post.title.includes(kw)) ||
            (post.excerpt && post.excerpt.includes(kw)) ||
            (post.content && post.content.includes(kw)) ||
            (post.hashtags && post.hashtags.some(t => t.includes(kw)))
          );
        }
      }

      const matchTag = !selectedTag || (post.hashtags && post.hashtags.includes(selectedTag));
      const matchSearch = !searchTerm || 
        (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.hashtags && post.hashtags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      return matchCategory && matchSubCategory && matchTag && matchSearch;
    });
    // 최신 날짜 역순 기사 배치 (최신글 선두 배치 및 시각성 보장)
    return [...list].sort((a, b) => {
      const dateA = `${a.date || ""} ${a.time || "00:00"}`;
      const dateB = `${b.date || ""} ${b.time || "00:00"}`;
      return dateB.localeCompare(dateA);
    });
  }, [posts, selectedCategory, selectedSubCategory, selectedTag, searchTerm]);

  // 대출 계산 결과 산식 (실시간 정밀 모의 분석)
  const loanAnalysisResult = useMemo(() => {
    // 1. LTV 한도액 계산
    const ltvMaxLoan = (propertyValue * ltvLimit) / 100;

    // 2. DSR 한도액 계산 (DSR 40% 한계치 기준)
    // 연간 사용 가능한 최대 상환원리금 = 연소득 * 40% - 기타대출이비용
    const yearlyDsrBudget = Math.max(0, (annualIncome * 40) / 100 - otherDebtInterest);
    const monthlyDsrBudget = yearlyDsrBudget / 12;

    // 원리금 균등상환 시, 매달 DSR 예산 한도 내에서 빌릴 수 있는 대출총액 산출 (PMT 역산 공식)
    // r = 연이율 / 12, n = 납입 개월 수
    const r = interestRate / 100 / 12;
    const n = loanTerm * 12;

    let dsrMaxLoan = 0;
    if (r > 0) {
      dsrMaxLoan = (monthlyDsrBudget * (1 - Math.pow(1 + r, -n))) / r;
    } else {
      dsrMaxLoan = monthlyDsrBudget * n;
    }

    // 최종 최대 가용 대출액 = LTV와 DSR 한도 중 최소값 (안전 가이드라인)
    const finalLoanAmount = Math.round(Math.min(ltvMaxLoan, dsrMaxLoan));

    // 매월 예상 원리금 상환액 계산 (실제 최대로 빌렸을 때 기준)
    let monthlyRepayment = 0;
    if (finalLoanAmount > 0) {
      if (r > 0) {
        monthlyRepayment = Math.round(
          (finalLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        );
      } else {
        monthlyRepayment = Math.round(finalLoanAmount / n);
      }
    }

    // 소득 대비 주거 상환액 안심 지수 (25% 미만: 안전, 35% 미만: 보통, 35% 이상: 주의)
    const monthlyIncome = annualIncome / 12;
    const repaymentRatio = monthlyIncome > 0 ? (monthlyRepayment / monthlyIncome) * 100 : 0;
    let safetyLevel: "안전" | "주의요망" | "위험영끌" = "안전";
    if (repaymentRatio >= 35) {
      safetyLevel = "위험영끌";
    } else if (repaymentRatio >= 25) {
      safetyLevel = "주의요망";
    }

    return {
      ltvMax: Math.round(ltvMaxLoan),
      dsrMax: Math.round(dsrMaxLoan),
      finalAmount: finalLoanAmount,
      monthlyRepayment: monthlyRepayment,
      ratio: Math.round(repaymentRatio),
      safety: safetyLevel
    };
  }, [annualIncome, otherDebtInterest, propertyValue, loanTerm, interestRate, ltvLimit]);

  // 청약 가점 점수 상세 합산 산식
  const subscriptionScore = useMemo(() => {
    // 1. 무주택 기간 가점 산식 (최대 32점)
    // 30세 미만 미혼 무주택자 등은0점, 1년 미만 2점, 1년이상 2년미만 4점... 15년 이상 32점
    let homelessScore = 0;
    if (homelessYears > 0) {
      homelessScore = Math.min(32, (homelessYears + 1) * 2);
    }

    // 2. 부양가족 수 가점 산식 (최대 35점)
    // 0명 5점, 1명 10점, 2명 15점, 3명 20점, 4명 25점, 5명 30점, 6명 이상 35점
    const dependentsScore = Math.min(35, 5 + dependents * 5);

    // 3. 청약통장 가입 기간 가점 산식 (최대 17점)
    // 6개월 미만 1점, 1년 미만 2점, 2년 미만 3점... 15년 이상 17점
    let bankbookScore = 0;
    if (bankbookYears >= 15) {
      bankbookScore = 17;
    } else {
      bankbookScore = bankbookYears + 2;
    }

    const total = homelessScore + dependentsScore + bankbookScore;

    // 인천 합격 타깃 분석 보고
    let targetAdvice = "";
    if (total >= 65) {
      targetAdvice = "✨ 초고득점! 송도 센트럴파크 주변 및 핵심 역세권 분양 단지 아파트 84㎡ 당첨 안정권입니다.";
    } else if (total >= 50) {
      targetAdvice = "👍 우수 가점! 검단 신도시, 청라 연장역 인근 신축 아파트 일반공급 당첨 가능권입니다.";
    } else if (total >= 30) {
      targetAdvice = "🔔 보통 점수! 일반공급보다는 '신생아 우선공급', '생애최초 특별공급' 추첨제 트랙 정조준을 권장합니다.";
    } else {
      targetAdvice = "⚠️ 신축 청약은 추첨 한도 20%를 영특하게 공략하거나, 공공임대주택(행복주택) 및 전세 임시 전략 우회 가정이 효과적입니다.";
    }

    return {
      homeless: homelessScore,
      dependents: dependentsScore,
      bankbook: bankbookScore,
      total: total,
      advice: targetAdvice
    };
  }, [homelessYears, dependents, bankbookYears]);

  // 챗봇 대화 전송 핸들러
  const handleChatSend = async (textToSend?: string) => {
    const rawText = textToSend || chatInput;
    if (!rawText.trim()) return;

    const userMsg: Message = {
      role: "user",
      text: rawText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawText,
          chatHistory: chatMessages.map(m => ({ role: m.role, text: m.text })),
          activePostId: activePost?.id || null
        })
      });

      if (!response.ok) {
        throw new Error("Server response error");
      }

      const data = await response.json();
      const assistantMsg: Message = {
        role: "model",
        text: data.response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        role: "model",
        text: "일시적인 서버 부하로 지연이 발생하고 있어요. 하단의 상시 지침 조언 혹은 자가진단 시스템을 활용해 우선 참고해 보시기 바랍니다! 국토부 및 청약홈 링크는 상시 유지됩니다.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 퀵챗 질문 링크 생성
  const handleQuickQuestion = (question: string) => {
    handleChatSend(question);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* 상단 안내 바 */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              주거 실무 가이드
            </span>
            <span className="text-slate-300 text-xs font-medium">
              신혼부부 &amp; 무주택자를 위한 실전 청약·전월세·주택금융 정보
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-sans">
            <button 
              onClick={() => { setActivePost(null); setActiveLegalTab("about"); }}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              서비스 소개
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => { setActivePost(null); setActiveLegalTab("privacy"); }}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              개인정보처리방침
            </button>
          </div>
        </div>
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* 브랜드 로고 및 명확한 슬로건 */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => {
            setSelectedCategory("전체");
            setSelectedTag(null);
            setSearchTerm("");
            setActivePost(null);
            setActiveLegalTab(null);
            setShowDiagnosticPage(false);
          }}>
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-display">
                  하우징허브 <span className="text-blue-600 text-sm sm:text-base font-bold font-sans">HousingHub</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                신혼부부 &amp; 무주택자를 위한 안심 주거·청약·대출 가이드
              </p>
            </div>
          </div>

          {/* 주요 카테고리 메뉴 내비게이션 */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: "전체", label: "📝 전체 칼럼" },
              { id: "청약-분양", label: "🏢 청약·분양" },
              { id: "전월세", label: "🔑 전월세 안심" },
              { id: "대출-금융", label: "💰 대출·금융" },
              { id: "이사-인테리어", label: "🚚 이사·주거" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedCategory(item.id);
                  setSelectedSubCategory("전체 보기");
                  setSelectedTag(null);
                  setActivePost(null);
                  setActiveLegalTab(null);
                  setShowDiagnosticPage(false);
                }}
                className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCategory === item.id && !showDiagnosticPage && !activeLegalTab && !activePost
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* 우측 툴킷 액션 버튼 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setShowDiagnosticPage(true);
                setActivePost(null);
                setActiveLegalTab(null);
                setSelectedCategory("전체");
                setSelectedTag(null);
              }}
              className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                showDiagnosticPage
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "text-slate-800 hover:text-slate-900 hover:bg-slate-100 border-slate-200 bg-white"
              }`}
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>자가진단 계산기</span>
            </button>

            {IS_CHAT_ENABLED && (
              <button 
                onClick={() => setIsChatOpen(prev => !prev)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all text-slate-700 cursor-pointer relative"
                title="실시간 주거 상담실"
              >
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
              </button>
            )}
          </div>
        </div>

        {/* 모바일 가로 스크롤 메뉴 바 */}
        <div className="lg:hidden border-t border-slate-100 bg-slate-50/80 px-4 py-2 overflow-x-auto scrollbar-none flex items-center space-x-2">
          {[
            { id: "전체", label: "🏠 전체" },
            { id: "청약-분양", label: "🏢 청약·분양" },
            { id: "전월세", label: "🔑 전월세" },
            { id: "대출-금융", label: "💰 대출·금융" },
            { id: "이사-인테리어", label: "🚚 이사·주거" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedCategory(item.id);
                setSelectedSubCategory("전체 보기");
                setSelectedTag(null);
                setActivePost(null);
                setActiveLegalTab(null);
                setShowDiagnosticPage(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer ${
                selectedCategory === item.id && !showDiagnosticPage && !activeLegalTab && !activePost
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setActiveLegalTab("about");
              setActivePost(null);
              setShowDiagnosticPage(false);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap text-slate-700 bg-white border border-slate-200 cursor-pointer"
          >
            ℹ️ 소개
          </button>
        </div>
      </header>

      {/* 메인 허브 레이아웃 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activePost ? (
          <GuideReader
            post={activePost}
            onBack={() => setActivePost(null)}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            showToast={showToast}
          />
        ) : showDiagnosticPage ? (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {/* 상단 헤더 */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white animate-pulse">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-mono">HousingHub Calculator</span>
                </div>
                <h2 className="text-xl font-bold mt-1 tracking-tight font-display text-white">
                  청약 가점 &amp; 대출 한도 계산기
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">최신 DSR/LTV 규제 기준과 청약 가점(84점 만점)을 쉽게 계산해 보세요</p>
              </div>
              <button 
                onClick={() => setShowDiagnosticPage(false)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 border border-slate-700 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>메인 페이지로 복귀</span>
              </button>
            </div>

            {/* 탭 네비게이터 */}
            <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 overflow-x-auto gap-2">
              <button
                onClick={() => setToolTab("loan")}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg cursor-pointer ${
                  toolTab === "loan" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                💰 DSR/LTV 대출 한도 계산
              </button>
              <button
                onClick={() => setToolTab("score")}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg cursor-pointer ${
                  toolTab === "score" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                🎯 청약 가점(84점 만점) 계산
              </button>
            </div>

            <div className="p-6 sm:p-10 flex-1">
              {toolTab === "loan" ? (
                /* 대출한도 계산기 인터랙티브 폼 */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                          <span>연 소득액</span>
                          <span className="text-[10px] text-slate-400 font-medium">(부부합산 권장)</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-indigo-600">{annualIncome.toLocaleString()}만원</span>
                      </div>
                      <input 
                        type="range" min="2000" max="25000" step="500"
                        value={annualIncome} 
                        onChange={(e) => setAnnualIncome(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                        <span>2,000만원</span>
                        <span>2.5억원</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700">기타 신용대출 연 이자 상환 부담액</label>
                        <span className="text-xs font-mono font-bold text-indigo-600">{otherDebtInterest.toLocaleString()}만원</span>
                      </div>
                      <input 
                        type="range" min="0" max="3000" step="100"
                        value={otherDebtInterest} 
                        onChange={(e) => setOtherDebtInterest(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                        <span>없음</span>
                        <span>3,000만원</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700">매수 타깃 주택 평가 가치액</label>
                        <span className="text-xs font-mono font-bold text-indigo-600">{(propertyValue / 10000).toFixed(1)}억원 ({propertyValue.toLocaleString()}만)</span>
                      </div>
                      <input 
                        type="range" min="15000" max="200000" step="5000"
                        value={propertyValue} 
                        onChange={(e) => setPropertyValue(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                        <span>1.5억원 (빌라/소형)</span>
                        <span>20억원 (송도대형)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700">대출 적용 상환 기간 & 금리 조건</label>
                        <span className="text-xs font-mono font-bold text-indigo-600">{loanTerm}년형 / 연 {interestRate}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select 
                          value={loanTerm} 
                          onChange={(e) => setLoanTerm(Number(e.target.value))}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-indigo-600"
                        >
                          <option value={10}>10년 상환</option>
                          <option value={20}>20년 상환</option>
                          <option value={30}>30년 상환</option>
                          <option value={40}>40년 최장 상환</option>
                        </select>
                        <select 
                          value={interestRate} 
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-indigo-600"
                        >
                          <option value={2.5}>연 2.5% (신생아)</option>
                          <option value={3.2}>연 3.2% (디딤돌)</option>
                          <option value={3.8}>연 3.8% (고정우대)</option>
                          <option value={4.5}>연 4.5% (시중변동)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">LTV 한도 설정</span>
                    <label className="inline-flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="radio" name="ltv" checked={ltvLimit === 80} 
                        onChange={() => setLtvLimit(80)} 
                        className="accent-indigo-600" 
                      />
                      <span>생애 처음 매수자 (80%)</span>
                    </label>
                    <label className="inline-flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="radio" name="ltv" checked={ltvLimit === 70} 
                        onChange={() => setLtvLimit(70)} 
                        className="accent-indigo-600" 
                      />
                      <span>무주택 가구 일반 (70%)</span>
                    </label>
                  </div>

                  {/* 계산 결과 배너 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">최대 안전 조달 대출액</p>
                        <p className="text-3xl font-extrabold text-indigo-950 font-display mt-1">
                          {loanAnalysisResult.finalAmount === 0 
                            ? "소득대비 자격 미달" 
                            : `${(loanAnalysisResult.finalAmount / 10000).toFixed(2)}억 원`
                          }
                          <span className="text-sm font-semibold text-slate-600 ml-2">({loanAnalysisResult.finalAmount.toLocaleString()} 만원)</span>
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">LTV 순수 차단선</span>
                          <span className="font-bold font-mono text-slate-700">{(loanAnalysisResult.ltvMax / 10000).toFixed(1)}억 ({ltvLimit}%)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">DSR 40% 한계선</span>
                          <span className="font-bold font-mono text-slate-700">{(loanAnalysisResult.dsrMax / 10000).toFixed(1)}억</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-indigo-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center space-y-2">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500">매달 원리금 상환 부담</span>
                        <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                          {loanAnalysisResult.monthlyRepayment.toLocaleString()}원
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-500">주거 안심 비율</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          loanAnalysisResult.safety === "안전" 
                            ? "bg-green-100 text-green-700" 
                            : loanAnalysisResult.safety === "주의요망" 
                            ? "bg-amber-100 text-amber-700" 
                            : "bg-rose-100 text-rose-700"
                        }`}>
                          {loanAnalysisResult.ratio}% ({loanAnalysisResult.safety})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 청약 가점 계산기 */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">1. 무주택 유지 기간 (최대 32점)</label>
                      <select
                        value={homelessYears}
                        onChange={(e) => setHomelessYears(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-indigo-600 cursor-pointer"
                      >
                        <option value={0}>무주택자 아님 (0점)</option>
                        <option value={1}>1년 미만 (2점)</option>
                        <option value={3}>3년 이상 4년 미만 (8점)</option>
                        <option value={5}>5년 이상 6년 미만 (12점)</option>
                        <option value={8}>8년 이상 9년 미만 (18점)</option>
                        <option value={10}>10년 이상 11년 미만 (22점)</option>
                        <option value={12}>12년 이상 13년 미만 (26점)</option>
                        <option value={15}>15년 이상 장기 무주택 (32점 만점)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">※ 미혼 가입자는 만 30세 도달 시점부터 기산합니다.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">2. 부양 가족 수 (최대 35점)</label>
                      <select
                        value={dependents}
                        onChange={(e) => setDependents(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-indigo-600 cursor-pointer"
                      >
                        <option value={0}>단독 가구주 - 0명 (5점)</option>
                        <option value={1}>배우자 혹은 미성년 자녀 1명 부양 (10점)</option>
                        <option value={2}>부양가족 2명 (15점)</option>
                        <option value={3}>부양가족 3명 (20점)</option>
                        <option value={4}>부양가족 4명 – 성실가구 (25점)</option>
                        <option value={5}>부양가족 5명 (30점)</option>
                        <option value={6}>부양가족 6명 이상 (35점 만점)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">※ 직계 존속은 3년 이상 주민등록표에 등재되어 있어야 합니다.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">3. 청약 통장 유지 지표 (최대 17점)</label>
                      <select
                        value={bankbookYears}
                        onChange={(e) => setBankbookYears(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-indigo-600 cursor-pointer"
                      >
                        <option value={0}>가입 6개월 미만 (1점)</option>
                        <option value={1}>6개월 이상 1년 미만 (2점)</option>
                        <option value={3}>3년 이상 4년 미만 (5점)</option>
                        <option value={5}>5년 이상 6년 미만 (7점)</option>
                        <option value={8}>8년 이상 9년 미만 (10점)</option>
                        <option value={10}>10년 이상 11년 미만 (12점)</option>
                        <option value={12}>12년 이상 13년 미만 (14점)</option>
                        <option value={15}>15년 이상 납입 완비 (17점 만점)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">※ 타 저축에서 청약종합저축으로 갈아탄 승계 기간도 온전히 포함됩니다.</p>
                    </div>
                  </div>

                  {/* 가점 결과지 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-display text-2xl font-bold">
                          {subscriptionScore.total}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">자가 정밀 진단 총 가산 가점</span>
                          <p className="text-lg font-bold text-slate-900 mt-0.5">84점 만점 중 {subscriptionScore.total}점 획득</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white border border-slate-200 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-400 block">무주택</span>
                          <span className="font-bold text-slate-700">{subscriptionScore.homeless} / 32</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-400 block">부양가족</span>
                          <span className="font-bold text-slate-700">{subscriptionScore.dependents} / 35</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-400 block">통장기간</span>
                          <span className="font-bold text-slate-700">{subscriptionScore.bankbook} / 17</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 md:border-l border-slate-200 md:pl-6 flex flex-col justify-center">
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                        <span className="text-xs font-bold text-indigo-900 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          <span>전문가의 가점 진단 및 조언</span>
                        </span>
                        <p className="text-xs text-slate-700 mt-2 leading-relaxed keep-all">
                          {subscriptionScore.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 하단 단추 */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDiagnosticPage(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                계산 완료 및 메인으로 돌아가기
              </button>
            </div>
          </div>
        ) : activeLegalTab ? (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {/* 상단 헤더 */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-mono">HousingHub Center</span>
                </div>
                <h2 className="text-xl font-bold mt-1 tracking-tight font-display text-white">
                  하우징허브 안내 &amp; 정책 센터
                </h2>
              </div>
              <button 
                onClick={() => setActiveLegalTab(null)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 border border-slate-700 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>메인 페이지로 복귀</span>
              </button>
            </div>

            {/* 탭 네비게이터 */}
            <div className="flex bg-slate-100 p-1 border-b border-slate-200 overflow-x-auto">
              <button
                onClick={() => { setActiveLegalTab("about"); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                  activeLegalTab === "about" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                🏠 서비스 소개
              </button>
              <button
                onClick={() => { setActiveLegalTab("privacy"); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                  activeLegalTab === "privacy" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                🛡️ 개인정보처리방침
              </button>
              <button
                onClick={() => { setActiveLegalTab("terms"); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                  activeLegalTab === "terms" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                📄 이용약관
              </button>
              <button
                onClick={() => { setActiveLegalTab("disclaimer"); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                  activeLegalTab === "disclaimer" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                ⚖️ 면책고지
              </button>
            </div>

            {/* 본문 콘텐츠 스크롤 및 탭 렌더링 */}
            <div className="p-6 sm:p-10 space-y-6 bg-slate-50/50 min-h-[400px]">
              {activeLegalTab === "about" && (
                <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed text-left font-sans">
                  {/* 헤더 & 페르소나 배너 */}
                  <div className="border-b border-slate-200 pb-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                        E-E-A-T 공인 가이드
                      </span>
                      <span className="text-slate-500 text-xs font-mono">10년 차 실무진 직필 미디어</span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                      하우징허브(HousingHub) 이야기와 운영 철학
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5">
                      "공고문 뒤에 숨은 함정과 현장 실패를 막기 위해, 10년의 실무 경험을 있는 그대로 공유합니다."
                    </p>
                  </div>

                  {/* 운영자 페르소나 소개 카드 */}
                  <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-blue-900/30 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold text-2xl shrink-0">
                        👨‍💼
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-lg font-bold text-white">기획 총괄 · 박 실장 (Lead Editor)</h5>
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">실무 10년차</span>
                        </div>
                        <p className="text-xs text-blue-200 leading-relaxed">
                          부동산 금융 데이터 분석 10년 · 전월세 계약 및 청약·정책대출 현장 실무 800여 건 직접 수행 · 무주택 청년·신혼부부 안심 주거 멘토
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-700/60 text-xs text-slate-300 leading-relaxed space-y-2">
                      <p>
                        "저 역시 20대 시절, 좁은 원룸 전세계약을 맺으며 등기부등본을 볼 줄 몰라 며칠 밤을 잠 못 이루던 사회초년생이었습니다. 은행 창구에 서류를 들고 갔다가 DSR 한도 계산 착오로 대출이 거절되어 눈물을 머금고 계약금을 날릴 뻔했던 쓰라린 경험도 있습니다."
                      </p>
                      <p>
                        "인터넷에는 광고성 복사-붙여넣기 글과 딱딱한 공고문만 넘쳐납니다. 하우징허브는 <strong>제가 직접 부딪치고 깨지며 배운 실전 노하우와 피눈물 나는 실패 사례</strong>를 바탕으로, 독자 여러분이 소중한 보증금을 지키고 내 집 마련에 성공할 수 있도록 돕기 위해 시작되었습니다."
                      </p>
                    </div>
                  </div>

                  {/* 하우징허브 3대 운영 원칙 */}
                  <section className="space-y-4">
                    <h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      하우징허브의 3대 핵심 원칙 (Human Touch & E-E-A-T)
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">
                          1
                        </div>
                        <h6 className="font-bold text-slate-900 text-sm">실무 검증 및 분석</h6>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          단순 법조문 나열이 아닙니다. 실제 계약 현장과 은행 창구에서 발생하는 변수와 부적격 사례를 직접 검증하여 전달합니다.
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">
                          2
                        </div>
                        <h6 className="font-bold text-slate-900 text-sm">AI 상투적 어구 배제</h6>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          기계적인 서론과 뻔한 결론을 거부합니다. 독자가 오늘 당장 확인하고 적용할 수 있는 1개의 명확한 Action Item을 제시합니다.
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">
                          3
                        </div>
                        <h6 className="font-bold text-slate-900 text-sm">상업적 유혹 배제</h6>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          특정 분양 대행사나 대출 중개업체의 입김에 휘둘리지 않고, 오직 무주택 실수요자의 권익만을 위해 독립적으로 운영됩니다.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 정보 출처 및 검증 체계 */}
                  <section className="space-y-3 bg-slate-100/70 p-5 rounded-2xl border border-slate-200">
                    <h5 className="font-bold text-slate-900 text-sm">데이터 출처 및 정합성 검증 체계</h5>
                    <p className="leading-relaxed text-xs text-slate-600">
                      하우징허브의 모든 가이드와 시뮬레이터 수식은 <strong>국토교통부, 한국부동산원 청약홈, 주택도시기금(HUG), 한국주택금융공사(HF), LH</strong> 등 공공 기관의 공식 배포 공고문 및 개정 시행령을 교차 대조하여 작성됩니다.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium text-slate-600">
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">✓ 2026 청약 제도 개편안 반영</span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">✓ 스트레스 DSR 3단계 수식 적용</span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">✓ 신생아·신혼부부 특례대출 기준 대조</span>
                    </div>
                  </section>

                  {/* 운영 안내 */}
                  <section className="space-y-2 border-t border-slate-200 pt-5">
                    <h5 className="font-bold text-slate-900 text-sm">운영 정보 안내</h5>
                    <p className="leading-relaxed text-xs text-slate-600">
                      하우징허브는 <strong>상상아트 (사업자등록번호: 272-14-01256)</strong>에서 책임 운영합니다. 콘텐츠에 대한 오류 제보, 주거 정책 관련 안내는 공식 채널을 통해 확인하실 수 있습니다.
                    </p>
                    <p className="text-xs text-slate-600">
                      공식 이메일: <strong className="text-slate-900 font-mono">apark12321@gmail.com</strong>
                    </p>
                  </section>
                </div>
              )}

              {activeLegalTab === "privacy" && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed text-left font-sans">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">개인정보처리방침 (Privacy Policy) | 하우징허브 (HousingHub)</h4>
                    <p className="text-xs text-slate-400 mt-1">최종 시행 일자: 2026년 8월 30일</p>
                  </div>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">1. 수집하는 개인정보 항목 및 이용 목적</h5>
                    <p className="leading-relaxed">
                      하우징허브(https://zip9.kr)는 별도의 회원가입 없이 누구나 자유롭게 이용할 수 있는 개방형 전문 정보 포털입니다. 본 사이트는 이용자의 직접적인 식별 정보(이름, 주민번호 등)를 임의 수집하지 않으며, 사이트 이용 통계 분석 및 맞춤형 서비스 제공을 위해 브라우저 접속 기록(IP 주소, 쿠키, 접속 일시 등)이 자동 생성될 수 있습니다.
                    </p>
                  </section>

                  <section className="space-y-2.5 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                    <h5 className="font-bold text-slate-900 text-sm text-blue-950">2. 구글 애드센스(Google AdSense) 및 제3자 광고 쿠키 안내</h5>
                    <p className="leading-relaxed text-slate-800">
                      하우징허브는 Google 등의 제3자 광고 사업자를 통해 웹사이트에 광고를 게재합니다.
                    </p>
                    <ul className="list-disc pl-5 text-slate-700 space-y-1.5 font-sans mt-1">
                      <li>Google을 포함한 제3자 공급업체는 쿠키를 사용하여 사용자의 이전 방문 기록(본 웹사이트 또는 타 웹사이트)을 기반으로 맞춤형 광고를 게재합니다.</li>
                      <li>Google의 광고 쿠키 사용으로 인해 Google 및 파트너는 사용자의 본 사이트 및 기타 인터넷 사이트 방문 기록을 바탕으로 적절한 광고를 게재할 수 있습니다.</li>
                      <li>사용자는 <strong><a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Google 광고 설정</a></strong>에서 개인 맞춤 광고를 언제든지 사용 중지(Opt-out)할 수 있습니다.</li>
                    </ul>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">3. 쿠키(Cookie) 운용 및 거부 방법</h5>
                    <p className="leading-relaxed">
                      사용자는 웹 브라우저의 옵션을 조정하여 모든 쿠키의 저장을 허용하거나, 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
                    </p>
                    <p className="text-xs text-slate-500">
                      * 설정 방법: 웹 브라우저 상단 도구 &gt; 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터에서 차단 또는 삭제 가능 (단, 쿠키 저장을 거부할 경우 일부 서비스 기능 이용에 제한이 따를 수 있습니다.)
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">4. 개인정보 보호책임자 및 안내</h5>
                    <p className="leading-relaxed">
                      운영 주체: 상상아트 (사업자등록번호: 272-14-01256)<br />
                      책임 관리자: 박 실장 (Lead Editor)<br />
                      공식 이메일: <strong className="text-slate-900 font-mono">apark12321@gmail.com</strong><br />
                      소재지: 대한민국 서울특별시
                    </p>
                  </section>
                </div>
              )}

              {activeLegalTab === "terms" && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed text-left font-sans">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">서비스 이용약관 (Terms of Service)</h4>
                    <p className="text-xs text-slate-400 mt-1">최종 시행 일자: 2026년 6월 14일</p>
                  </div>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 1조 (목적 및 서비스 범위)</h5>
                    <p className="leading-relaxed">
                      본 약관은 하우징허브 포털에서 제공하는 주택 청약, 전월세 대항력 분석, 이사 수칙 가이드 및 주택 대출 계산기 서비스의 이용 조건과 절차를 규정합니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 2조 (저작권 및 콘텐츠 이용)</h5>
                    <p className="leading-relaxed">
                      하우징허브 포털 내 게시된 칼럼, 데이터 지식, 시뮬레이터 수식의 저작권은 하우징허브에 귀속됩니다.
                    </p>
                    <ul className="list-disc pl-5 text-slate-600 space-y-1 mt-1">
                      <li>저작권자의 사전 동의 없는 무단 전재, 상업적 재배포 및 무단 복제를 금합니다.</li>
                      <li>비영리적 목적의 단순 링크 공유나 가이드 출처 명시 공유는 허용됩니다.</li>
                    </ul>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 3조 (시뮬레이터 및 정보 활용의 한계)</h5>
                    <p className="leading-relaxed">
                      본 서비스에서 제공하는 시뮬레이션 및 데이터는 참고용 결과입니다. 개인별 신용도, 소득 조건, 금융기관 규제 변경에 따라 실제 창구에서의 결과와 차이가 발생할 수 있으므로, 최종 계약 시에는 공식 기관이나 금융 상담사와 직접 확인하시기 바랍니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 4조 (관할 법원)</h5>
                    <p className="leading-relaxed">
                      본 약관에 관한 분쟁은 대한민국 법령을 적용하며, 관할 법원은 민사소송법상 관할 법원에 따릅니다.
                    </p>
                  </section>
                </div>
              )}

              {activeLegalTab === "disclaimer" && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed text-left font-sans">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">정보이용 면책고지 (Disclaimer)</h4>
                    <p className="text-xs text-slate-400 mt-1">최종 시행 일자: 2026년 6월 14일</p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex items-start space-x-3 text-xs text-amber-950 font-sans">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">⚠️ 임대차 계약 및 대출 신청 전 최종 확인 안내</p>
                      <p className="leading-relaxed">하우징허브에서 제공하는 지식 칼럼과 계산기는 이용자의 이해를 돕기 위한 무상 참고 자료입니다. 개별 법률 계약이나 대출 실행 결과에 대해서는 본 사이트가 법적 책임을 지지 않으므로 최종 실행 전 관련 공식 공고문 및 담당 기관 확인을 권장합니다.</p>
                    </div>
                  </div>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 1조 (정책 변경 및 정보 업데이트 시차)</h5>
                    <p className="leading-relaxed">
                      국토교통부, 한국부동산원, LH 등 관련 기관의 공고 및 법령 개정 사항을 반영하고 있으나, 실시간 정책 변경으로 인한 업데이트 시차가 존재할 수 있습니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 2조 (실시간 주거 상담 답변의 참고성)</h5>
                    <p className="leading-relaxed">
                      실시간 주거 상담에서 제공하는 답변은 일반적인 제도 및 공고 요건 안내 목적이며, 개별적인 특수 상황이나 복잡한 사안의 경우 최종 판단 전 전문 금융 창구나 법률 전문가와의 대면 상담을 권장합니다.
                    </p>
                  </section>
                </div>
              )}
            </div>
          </div>
        ) : selectedCategory === "청약일정" ? (
          /* 청약일정 전용 카테고리 페이지 */
          <div className="space-y-8">
            {/* 청약일정 전용 카테고리 헤더 배너 */}
            <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-blue-900/40 relative overflow-hidden space-y-4">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>2026 전국 청약일정 캘린더</span>
                  </span>
                  <span className="bg-slate-800/90 text-slate-300 text-xs font-medium px-3 py-1 rounded-full border border-slate-700">
                    한국부동산원 청약홈 기준 실시간 검증
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white">
                  전국 아파트 분양·청약 일정 캘린더
                </h2>
                <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                  특별공급, 1·2순위 청약 접수일부터 당첨자 발표, 계약 진행 일정까지 스마트하게 모아보세요. 
                  단지별 규제 사항(분양가상한제, 실거주의무, 전매제한) 및 예상 분양가를 한눈에 비교할 수 있습니다.
                </p>
              </div>
            </section>

            {/* 청약일정 캘린더 전용 컴포넌트 */}
            <SubscriptionCalendar 
              onSelectPost={(post) => setActivePost(post)} 
              posts={POSTS} 
            />

            {/* 청약관련 추천 칼럼 목록 */}
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2 font-display">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>🏢 청약 가점 &amp; 신청 전 필독 가이드</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">청약홈 신청 전 반드시 알아야 할 2026년 최신 개정 가이드라인</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.filter(p => p.category === "청약-분양").slice(0, 3).map(post => (
                  <article 
                    key={post.id}
                    onClick={() => setActivePost(post)}
                    className="group bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-500 p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                        {post.category}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                      <span>{post.date}{post.time ? ` ${post.time}` : ""}</span>
                      <span className="text-blue-600 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>리포트 보기</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            {/* 하우징허브 안내 히어로 배너 */}
            <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-9 shadow-sm border border-slate-800 relative overflow-hidden space-y-5">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>2026 주거·청약·금융 실전 기록</span>
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full border border-slate-700">
                    실무 경험담 및 최신 주거 정책 분석
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug font-display">
                  직접 겪고 발로 뛰며 체득한 주거 가이드,<br className="hidden sm:block"/>
                  <span className="text-blue-400">하우징허브</span>에서 검증된 실전 가이드로 확인하세요.
                </h2>
                
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed font-sans">
                  청약 당첨과 특공 신청, 전월세 보증금 사수, 디딤돌·버팀목 대출 승인부터 이사까지 직접 겪은 실무 경험과 국토교통부·청약홈·주택도시기금의 최신 공식 기준을 하나로 담았습니다.
                </p>

                <div className="pt-2 flex flex-wrap gap-2.5 text-xs font-bold">
                  <button 
                    onClick={() => {
                      setSelectedCategory("청약일정");
                      setActivePost(null);
                      setActiveLegalTab(null);
                      setShowDiagnosticPage(false);
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>청약 캘린더 보기</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowDiagnosticPage(true);
                      setActivePost(null);
                      setActiveLegalTab(null);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 cursor-pointer flex items-center space-x-1.5"
                  >
                    <Calculator className="w-4 h-4 text-blue-400" />
                    <span>가점 &amp; 대출 자가진단</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveLegalTab("about");
                      setActivePost(null);
                      setShowDiagnosticPage(false);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 cursor-pointer flex items-center space-x-1"
                  >
                    <span>서비스 소개</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </section>

            {/* 추천 칼럼 배너 */}
            {filteredPosts.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">오늘의 추천 칼럼</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">직접 작성한 최신 가이드</span>
                </div>

                <div 
                  onClick={() => setActivePost(filteredPosts[0])}
                  className="group bg-slate-900 text-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3.5 border border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        추천 칼럼
                      </span>
                      <span className="bg-slate-800 text-slate-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">
                        {filteredPosts[0].category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{filteredPosts[0].date}{filteredPosts[0].time ? ` ${filteredPosts[0].time}` : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold font-display leading-snug text-white group-hover:text-blue-300 transition-colors">
                      {filteredPosts[0].title}
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {filteredPosts[0].excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-medium text-slate-300">하우징허브 주거 리포트</span>
                    </div>
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>전문 읽기</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* 메인 2컬럼 레이아웃 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
              {/* 왼쪽 컬럼: 전체 블로그 칼럼 목록 */}
              <div className="lg:col-span-8 space-y-6">
                <section className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
                        <span>📝 전체 주거 리포트</span>
                        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          총 {filteredPosts.length}편
                        </span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                        국토교통부·청약홈·주택도시기금 최신 공식 발표 기준 실무 분석 리포트입니다.
                      </p>
                    </div>
                    
                    {/* 검색 영역 */}
                    <div className="flex items-center space-x-2 w-full md:max-w-md">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="검색어 입력 (예: 청약, 전세, DSR, 디딤돌...)"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium shadow-2xs"
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 세부 주제 중분류 서브 내비게이션 바 */}
                  {selectedCategory !== "전체" && SUBCATEGORY_MAP[selectedCategory] && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                          <Filter className="w-4 h-4 text-blue-600" />
                          <span>{selectedCategory} 세부 주제</span>
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          선택: <strong className="text-blue-600">{selectedSubCategory}</strong>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap scrollbar-none pt-1">
                        {SUBCATEGORY_MAP[selectedCategory].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubCategory(sub)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              selectedSubCategory === sub
                                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 해시태그 목록 */}
                  {selectedCategory !== "전체" && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <button 
                        onClick={() => setSelectedTag(null)}
                        className={`px-3 py-1.5 text-xs rounded-full transition-all font-medium cursor-pointer ${
                          !selectedTag 
                            ? "bg-blue-600 text-white" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        전체 키워드
                      </button>
                      {popularHashtags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                          className={`px-3 py-1.5 text-xs rounded-full transition-all font-medium cursor-pointer ${
                            tag === selectedTag 
                              ? "bg-blue-600 text-white" 
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 아티클 카드 그리드 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredPosts.length === 0 ? (
                      <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center text-slate-600 space-y-6 shadow-xs">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                          <Search className="w-8 h-8 text-blue-600" />
                        </div>

                        <div className="space-y-1.5 max-w-md mx-auto">
                          <p className="font-bold text-lg text-slate-900">
                            {searchTerm ? `"${searchTerm}"에 대한 검색 결과를 찾지 못했습니다.` : "일치하는 주거 리포트가 없습니다."}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            {searchTerm 
                              ? "하우징허브 내 등록된 칼럼 외에 정부 정책·공문·법령 원문까지 탐색할 수 있는 구글 정밀 검색을 활용해 보세요."
                              : "검색어를 다시 확인하거나 다른 카테고리를 선택해 보세요."}
                          </p>
                        </div>

                        {/* 구글 정교 매칭 외부 검색 추천 카드 */}
                        {(() => {
                          const refined = buildRefinedGoogleSearchUrl(searchTerm, selectedCategory);
                          return (
                            <div className="max-w-xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 text-left space-y-4 border border-slate-800 shadow-lg">
                              <div className="flex items-center justify-between">
                                <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                  <span>구글 정밀 외부 검색 추천</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">Google Web Search</span>
                              </div>

                              <div>
                                <h4 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
                                  <span>'{refined.displayQuery}' 관련 공식 법령 &amp; 정부 공문 검색</span>
                                </h4>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                  국토교통부, 한국부동산원, 주택도시기금의 최신 지침과 공식 해석을 직접 조회할 수 있도록 최적화된 검색어를 구성했습니다.
                                </p>
                              </div>

                              {/* 추천 연관 쿼리 칩 */}
                              {refined.suggestions.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <div className="text-[11px] text-slate-400 font-semibold">정교 추천 검색어:</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {refined.suggestions.map((sug, idx) => (
                                      <a
                                        key={idx}
                                        href={`https://www.google.com/search?q=${encodeURIComponent(sug.query)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-slate-800/90 hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-colors inline-flex items-center space-x-1"
                                      >
                                        <span>{sug.label}</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                                <a
                                  href={refined.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer"
                                >
                                  <span>구글에서 '{refined.displayQuery}' 정밀 검색하기</span>
                                  <ExternalLink className="w-4 h-4" />
                                </a>

                                {searchTerm && (
                                  <button
                                    onClick={() => {
                                      setSearchTerm("");
                                      setSelectedCategory("전체");
                                      setSelectedSubCategory("전체 보기");
                                      setSelectedTag("");
                                    }}
                                    className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                                  >
                                    검색 필터 초기화
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      filteredPosts.map(post => {
                        const isBookmarked = bookmarks.includes(post.id);
                        
                        return (
                          <article 
                            key={post.id}
                            onClick={() => setActivePost(post)}
                            className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md border border-blue-100">
                                    {post.category}
                                  </span>
                                  <span className="text-slate-500 font-medium">{post.date}{post.time ? ` ${post.time}` : ""}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleBookmark(post.id, e); }}
                                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                  >
                                    <Heart className={`w-4 h-4 ${isBookmarked ? "fill-rose-500 text-rose-500" : ""}`} />
                                  </button>
                                </div>
                              </div>

                              <h4 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
                                {post.title}
                              </h4>

                              <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-3">
                                {post.excerpt}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex flex-wrap gap-1">
                                {post.hashtags?.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <span className="text-blue-600 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                                <span>리포트 읽기</span>
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>

          {/* 오른쪽 사이드바 영역 */}
          <div className="lg:col-span-4 space-y-6">
            {/* 추천 주거 가이드 TOP 5 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
                  <span>추천 주거 가이드 TOP 5</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">필독 추천</span>
              </div>

              <div className="space-y-3">
                {posts.slice(0, 5).map((post, idx) => (
                  <div
                    key={post.id}
                    onClick={() => setActivePost(post)}
                    className="group flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      idx === 0 ? "bg-slate-900 text-white" :
                      idx === 1 ? "bg-slate-700 text-white" :
                      idx === 2 ? "bg-slate-600 text-white" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.date}{post.time ? ` ${post.time}` : ""}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 청약일정 캘린더 사이드바 배너 */}
            <div 
              onClick={() => {
                setSelectedCategory("청약일정");
                setActivePost(null);
                setActiveLegalTab(null);
                setShowDiagnosticPage(false);
              }}
              className="bg-white rounded-3xl p-6 shadow-xs space-y-3 border border-slate-200 cursor-pointer hover:border-slate-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-100">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>2026 청약 일정</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                전국 아파트 분양·청약 캘린더 확인하기
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                특별공급, 1순위 접수, 당첨자 발표일을 날짜별로 꼼꼼하게 정리한 청약 일정표입니다.
              </p>
            </div>

            {/* 내 집 마련 계산기 배너 */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs space-y-3 border border-slate-800">
              <div className="inline-flex items-center space-x-1.5 bg-slate-800 text-blue-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-700">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                <span>실무 자가진단</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold leading-snug">
                청약 가점 &amp; 대출 한도 계산기
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                실제 적용되는 DSR/LTV 기준과 청약 가점(84점 만점)을 직접 확인해 보세요.
              </p>
              <button
                onClick={() => {
                  setShowDiagnosticPage(true);
                  setActivePost(null);
                  setActiveLegalTab(null);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>자가진단 계산기 열기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 정보 출처 안내 */}
            <div className="bg-slate-100/70 rounded-3xl p-5 border border-slate-200/80 space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>공식 자료 안내</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                국토교통부, 한국부동산원 청약홈, 주택도시기금의 최신 발표 공고를 바탕으로 알기 쉽게 정리한 가이드입니다.
              </p>
            </div>

            {/* 북마크 리딩 리스트 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col h-[260px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Bookmark className="w-4 h-4 text-blue-600" />
                  <span>내가 저장한 칼럼</span>
                </span>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {bookmarks.length}개
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {bookmarks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-1 p-2">
                    <Heart className="w-5 h-5 text-slate-300 stroke-1" />
                    <p className="text-[11px]">보관 중인 아티클이 없습니다.</p>
                  </div>
                ) : (
                  posts.filter(p => bookmarks.includes(p.id)).map(post => (
                    <div 
                      key={post.id}
                      onClick={() => setActivePost(post)}
                      className="group p-2 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2 flex-1">
                        <h4 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h4>
                      </div>
                      <button 
                        onClick={(e) => toggleBookmark(post.id, e)}
                        className="text-slate-300 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
            </div>
          </>
        )}
      </main>

      {/* 리얼타임 AI 대화 전담 챗봇 모달 사이드 바 (Floating Messenger) */}
      {IS_CHAT_ENABLED && (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end`}>
          {/* 플로팅 트리거 */}
          {!isChatOpen && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl hover:shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          )}

          {/* 챗봇 메신저 카드 */}
          {isChatOpen && (
            <div className="w-[calc(100vw-32px)] sm:w-[420px] max-h-[85vh] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
              {/* 챗봇 톱바 */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-display">주거 실무 Q&amp;A 상담</h4>
                    <p className="text-[10px] text-slate-400 font-medium">하우징허브 실시간 주거 상담실</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 메시지 바디 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                    }`}>
                      <p dangerouslySetInnerHTML={{ __html: msg.text }}></p>
                      <span className="block text-[9px] text-slate-400 mt-1.5 text-right font-mono">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-500 shadow-sm flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* 퀵버튼 추천 */}
              <div className="p-2 border-t border-slate-100 bg-white grid grid-cols-1 gap-1">
                <button 
                  onClick={() => handleQuickQuestion("신혼 가구인데 신생아 대출이랑 보금자리론 중 무엇이 유리해?")}
                  className="text-[10px] text-left text-slate-600 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors truncate"
                >
                  ❓ 신생아 특례 vs 보금자리론 비교해줘
                </button>
                <button 
                  onClick={() => handleQuickQuestion("월세 계약할 때 등기부등본 확인법이랑 필수 특약 알려줘!")}
                  className="text-[10px] text-left text-slate-600 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors truncate"
                >
                  ❓ 월세계약 시 필수 특약과 등기부등본 팁
                </button>
              </div>

              {/* 입력 폼 */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleChatSend(); }}
                className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
              >
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="질문을 입력해 조언을 구하세요..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}



      {/* 푸터 */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-800/80">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-lg font-bold font-display tracking-tight">HousingHub</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                하우징허브는 실수요자의 권리보호와 주거복지 증진을 목적으로 하는 무상의 공익 정보 포털입니다. 주택 청약, 전월세 대항력, 주택 대출 심층 분석 지식을 세세히 전달합니다.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-400 font-medium">
              <div className="space-y-2">
                <span className="text-white font-semibold flex items-center space-x-1">
                  <span>공식 권장 링크</span>
                </span>
                <ul className="space-y-1">
                  <li>
                    <a href="https://www.applyhome.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                      청약홈 (민영청약)
                    </a>
                  </li>
                  <li>
                    <a href="https://apply.lh.or.kr" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                      LH 청약플러스 (공공)
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <span className="text-white font-semibold">실거래 조사</span>
                <ul className="space-y-1">
                  <li>
                    <a href="https://rt.molit.go.kr" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                      국토교통부 실거래가
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <span className="text-white font-semibold flex items-center space-x-1">
                  <BadgeAlert className="w-3.5 h-3.5 text-blue-400" />
                  <span>블로그 정책 및 소개</span>
                </span>
                <ul className="space-y-1.5">
                  <li>
                    <button 
                      onClick={() => { setActivePost(null); setActiveLegalTab("about"); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      서비스 소개 (About Us)
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setActivePost(null); setActiveLegalTab("privacy"); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      개인정보처리방침
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setActivePost(null); setActiveLegalTab("terms"); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      이용약관 (Terms)
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setActivePost(null); setActiveLegalTab("disclaimer"); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      정보이용 면책고지
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 발행인 및 신뢰성 고지 배너 */}
          <div className="pt-6 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-slate-300 font-semibold">
              <span>서비스명: 하우징허브 (HousingHub)</span>
              <span>운영: 상상아트 (사업자등록번호: 272-14-01256)</span>
              <span>공식 이메일: apark12321@gmail.com</span>
            </div>
            <p className="text-slate-500">
              하우징허브(zip9.kr)는 신혼부부 및 무주택자를 위한 주거·청약·대출 실무 지식 포털입니다. 본 사이트에 수록된 분석 칼럼 및 계산기 결과는 참고용 자료이며, 실제 청약 신청이나 대출 실행 시에는 해당 금융기관 및 지자체/LH/청약홈의 공식 공고문을 반드시 최종 확인하시기 바랍니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 font-medium pt-2">
            <p>© 2026 HousingHub (zip9.kr). All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Housing &amp; Finance Information Portal</p>
          </div>
          
        </div>
      </footer>



      {/* 토스트 알림창 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[60] max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-white rounded-2xl p-4 shadow-2xl flex items-start space-x-3"
          >
            <div className="mt-0.5">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
              {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {toast.type === "info" && <BadgeAlert className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-semibold leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-0.5 hover:bg-slate-800/80 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
