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
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { POSTS, POSTS_BY_CATEGORY } from "./data/posts";
import { Post, Category, slugify } from "./types";
import { AdSenseSlot } from "./components/AdSenseSlot";

interface Message {
  role: "user" | "model";
  text: string;
  time: string;
}


export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 북마크 관리
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem("hh_bookmarks");
    return saved ? JSON.parse(saved) : ["sub-1", "rent-1", "finance-1"];
  });

  // 검색어를 초기 "Incheon" -> "" 로 편안히 리셋하거나, 전체 글이 잘 드러나도록 기본은 빈값으로 세팅 후 편리한 기둥 제작
  useEffect(() => {
    setSearchTerm("");
  }, []);

  useEffect(() => {
    localStorage.setItem("hh_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // 상세 보기 모달 관련
  const [activePost, setActivePost] = useState<Post | null>(null);

  // 자가진단 계산기 탭: 'loan' (대출한도) | 'score' (청약가점)
  const [toolTab, setToolTab] = useState<"loan" | "score">("loan");

  // 별도 페이지용 스마트 자가진단 툴킷 페이지 상태 활성화
  const [showDiagnosticPage, setShowDiagnosticPage] = useState<boolean>(false);

  // --- 법률 및 애드센스 정책 안심 확보 상태 (인라인 페이지화) ---
  const [activeLegalTab, setActiveLegalTab] = useState<"privacy" | "terms" | "disclaimer" | "contact" | "about" | null>(null);

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
        setActiveLegalTab("contact");
        setShowDiagnosticPage(false);
        setActivePost(null);
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
        const found = POSTS.find(
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
  }, []);

  // 상태 변화에 따른 브라우저 주소 및 문서 타이틀 동기화 (Path-based Routing 통합 처리)
  useEffect(() => {
    const pathname = window.location.pathname;

    if (activePost) {
      const targetSlug = slugify(activePost.title);
      if (pathname !== `/post/${targetSlug}`) {
        window.history.pushState({ postTitle: activePost.title }, "", `/post/${targetSlug}`);
      }
      document.title = `${activePost.title} | 하우징허브`;
    } else if (showDiagnosticPage) {
      if (pathname !== "/toolkit") {
        window.history.pushState(null, "", "/toolkit");
      }
      document.title = "스마트 주거 자가진단 툴킷 | 하우징허브";
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
      } else if (activeLegalTab === "contact") {
        document.title = "1:1 안심 상담 및 문의 | 하우징허브";
      }
    } else {
      const subpages = ["/toolkit", "/privacy", "/terms", "/disclaimer", "/contact", "/partnership", "/about"];
      const isSubpage = subpages.includes(pathname) || pathname.startsWith("/post/");
      if (isSubpage) {
        window.history.pushState(null, "", "/");
      }
      document.title = "하우징허브 | 전국 실생활 청약, 임대, 전세대출 안심 정보 포털";
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

  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactCategory, setContactCategory] = useState<string>("general");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [isContactLoading, setIsContactLoading] = useState<boolean>(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState<boolean>(false);
  const [contactResultId, setContactResultId] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast("이름, 이메일, 그리고 상세 의견 기재는 필수 항목입니다.", "error");
      return;
    }
    setIsContactLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          category: contactCategory,
          message: contactMessage
        })
      });
      if (!response.ok) throw new Error("서버 접수 에러");
      const data = await response.json();
      if (data.status === "success") {
        setIsContactSubmitted(true);
        setContactResultId(data.referenceId);
        // 입력값 리셋
        setContactName("");
        setContactEmail("");
        setContactMessage("");
      }
    } catch (err) {
      console.error(err);
      showToast("전송 중 네트워크 일시 혼선이 발생했습니다. 다시 접수해 주세요.", "error");
    } finally {
      setIsContactLoading(false);
    }
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
        text: "반갑습니다! <strong>하우징허브 AI 주거 안심 비서</strong>입니다. <br/>전국의 청약 자격요건, 전월세 사기 차단 특약 조항, 스트레스 DSR 한도 분석부터 서울·인천·경기 등 관심 지역의 맞춤 입지 분석까지 무엇이든 물어보세요! 😊", 
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

  // 모든 사용가능한 유니크 해시태그 목록 추출 (가장 많이 나오는 우수 인디안 8선)
  const popularHashtags = useMemo(() => {
    const tagsMap: Record<string, number> = {};
    POSTS.forEach(p => {
      p.hashtags?.forEach(tag => {
        tagsMap[tag] = (tagsMap[tag] || 0) + 1;
      });
    });
    return Object.entries(tagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }, []);

  // 피드 필터링 로직
  const filteredPosts = useMemo(() => {
    const list = POSTS.filter(post => {
      if (!post) return false;
      const matchCategory = selectedCategory === "전체" || post.category === selectedCategory;
      const matchTag = !selectedTag || (post.hashtags && post.hashtags.includes(selectedTag));
      const matchSearch = !searchTerm || 
        (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.hashtags && post.hashtags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      let matchRegion = true;
      if (selectedRegion !== "전체") {
        const titleLower = (post.title || "").toLowerCase();
        const excerptLower = (post.excerpt || "").toLowerCase();
        const tagsLower = (post.hashtags || []).map(t => t.toLowerCase());

        const isIncheon = titleLower.includes("인천") || titleLower.includes("송도") || titleLower.includes("청라") || titleLower.includes("검단") || titleLower.includes("계양") || excerptLower.includes("인천") || excerptLower.includes("송도") || excerptLower.includes("청라") || tagsLower.includes("인천") || tagsLower.includes("송도") || tagsLower.includes("청라") || tagsLower.includes("검단") || tagsLower.includes("계양");
        const isSeoul = titleLower.includes("서울") || titleLower.includes("강남") || titleLower.includes("여의도") || titleLower.includes("용산") || titleLower.includes("마포") || excerptLower.includes("서울") || excerptLower.includes("강남") || excerptLower.includes("여의도") || tagsLower.includes("서울") || tagsLower.includes("강남") || tagsLower.includes("여의도") || tagsLower.includes("용산") || tagsLower.includes("마포");
        const isGyeonggi = titleLower.includes("경기") || titleLower.includes("분당") || titleLower.includes("판교") || titleLower.includes("일산") || titleLower.includes("수원") || titleLower.includes("광교") || excerptLower.includes("경기") || excerptLower.includes("분당") || tagsLower.includes("경기") || tagsLower.includes("분당") || tagsLower.includes("판교") || tagsLower.includes("일산") || tagsLower.includes("수원");

        if (selectedRegion === "인천") {
          matchRegion = isIncheon || (!isSeoul && !isGyeonggi);
        } else if (selectedRegion === "서울") {
          matchRegion = isSeoul || (!isIncheon && !isGyeonggi);
        } else if (selectedRegion === "경기") {
          matchRegion = isGyeonggi || (!isIncheon && !isSeoul);
        }
      }

      return matchCategory && matchTag && matchSearch && matchRegion;
    });
    // 최신 날짜 역순 기사 배치 (최신글 선두 배치 및 시각성 보장)
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedCategory, selectedTag, searchTerm, selectedRegion]);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => {
            setSelectedCategory("전체");
            setSelectedRegion("전체");
            setSelectedTag(null);
            setSearchTerm("");
            setActivePost(null);
            setActiveLegalTab(null);
            setShowDiagnosticPage(false);
          }}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display flex items-center space-x-1">
                <span>HousingHub</span>
                <span className="text-blue-600 text-[11px] font-semibold bg-blue-50 px-2 py-0.5 rounded-md ml-1.5 shadow-3xs">
                  {selectedRegion === "전체" ? "전국" : selectedRegion}
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">National Housing Encyclopaedia</p>
            </div>
          </div>

          {/* 데스크톱 및 모바일 가로 스크롤 통합 내비게이션 주거 정보 카테고리 기둥 */}
          <nav className="flex items-center space-x-1 overflow-x-auto whitespace-nowrap scrollbar-none max-w-[60%] sm:max-w-none px-1 py-1">
            {["전체", "청약-분양", "전월세", "이사-인테리어", "대출-금융"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedTag(null);
                  setActivePost(null);
                  setActiveLegalTab(null);
                  setShowDiagnosticPage(false);
                }}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat && !showDiagnosticPage && !activeLegalTab && !activePost
                    ? "bg-slate-900 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => {
                setShowDiagnosticPage(true);
                setActivePost(null);
                setActiveLegalTab(null);
                setSelectedCategory("전체");
                setSelectedTag(null);
              }}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center space-x-1 cursor-pointer border ${
                showDiagnosticPage
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "text-blue-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 border-blue-200 bg-blue-50/40"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>📊 안심 자가진단</span>
            </button>
          </nav>

          {IS_CHAT_ENABLED && (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsChatOpen(prev => !prev)}
                className="relative p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-700 hover:border-slate-300"
              >
                <MessageSquare className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 메인 허브 레이아웃 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activePost ? (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {/* 상단 브레드크럼 / 뒤로가기 버튼 */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <button 
                onClick={() => setActivePost(null)}
                className="inline-flex items-center space-x-2 text-slate-600 hover:text-purple-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>목록으로 돌아가기</span>
              </button>
              <div className="text-[11px] font-mono text-slate-400">
                하우징허브 &gt; {activePost.category}
              </div>
            </div>

            {/* 요즘IT 테마의 화이트 아티클 타이포그래피 헤더 영역 */}
            <div className="px-6 pt-8 pb-4 sm:px-10 sm:pt-10 max-w-4xl mx-auto">
              {/* 카테고리 태그 */}
              <span className="text-xs sm:text-sm font-bold text-purple-600 tracking-wider block mb-2 font-mono">
                {activePost.category}
              </span>

              {/* 굵고 대담한 제목 */}
              <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-extrabold text-slate-900 leading-snug tracking-tight mb-6">
                {activePost.title}
              </h1>

              {/* 작성자 아바타 프로필 & 메타 정보 카드 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-slate-100 mb-8">
                {/* 프로필 좌측 */}
                <div className="flex items-center space-x-3">
                  <img 
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(activePost.author)}`}
                    alt={activePost.author} 
                    className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100/50"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{activePost.author}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">하우징허브 주거정책 수석 전문위원</p>
                  </div>
                </div>

                {/* 메타 정보 우측 */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="inline-flex items-center text-slate-800 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono font-semibold">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    <span>게재일: {activePost.date}</span>
                  </span>
                  <span className="inline-flex items-center text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{activePost.readTime}</span>
                  </span>
                  <span className="bg-purple-50 text-purple-700 font-bold px-2 py-1 rounded-lg text-[11px] border border-purple-100">
                    ✨ 인기 보도지식
                  </span>
                </div>
              </div>

              {/* 아티클 대표 이미지 (모던한 규격으로 헤더 아래 단정히 안착시킴) */}
              <div className="rounded-2xl overflow-hidden shadow-xs border border-slate-100/50 my-6 max-h-[420px] bg-slate-50 flex items-center justify-center">
                <img 
                  src={activePost.image} 
                  alt={activePost.title} 
                  className="w-full h-full object-cover max-h-[420px]"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* 실제 정밀 본문 */}
              <div 
                className="article-rich-content text-slate-800 text-[15px] sm:text-[16.5px] leading-8 space-y-6 pt-4 font-normal"
                dangerouslySetInnerHTML={{ __html: activePost.content }}
              />

              {/* 구글 애드센스 디스플레이 광고 영역 */}
              <AdSenseSlot label="본문 맞춤 정보 광고" />

              {/* 해시태그 목록 */}
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-8 mt-8">
                {activePost.hashtags?.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 하단 제어 리브 */}
            <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
              <button
                onClick={(e) => toggleBookmark(activePost.id, e)}
                className="flex items-center justify-center space-x-2 text-xs font-semibold px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <Bookmark className={`w-4 h-4 ${bookmarks.includes(activePost.id) ? "fill-red-500 text-red-500" : ""}`} />
                <span>{bookmarks.includes(activePost.id) ? "보관 해제" : "내 보관함 스크랩"}</span>
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
                  onClick={() => setActivePost(null)}
                  className="flex-1 sm:flex-initial py-3 px-5 text-xs font-bold transition-all text-slate-700 hover:bg-slate-200 border border-slate-200 bg-white rounded-xl cursor-pointer"
                >
                  목록으로 가기
                </button>
              </div>
            </div>
          </div>
        ) : showDiagnosticPage ? (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {/* 상단 헤더 */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white animate-pulse">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-mono">HousingHub Diagnostic</span>
                </div>
                <h2 className="text-xl font-bold mt-1 tracking-tight font-display text-white">
                  하우징 통합 자가진단 스마트 툴킷
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">데이터 연산 기반 LTV, DSR 역산 모의 진산기 & 청약 가점(84점) 판정기</p>
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
                💰 DSR/LTV 대출 한도기
              </button>
              <button
                onClick={() => setToolTab("score")}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg cursor-pointer ${
                  toolTab === "score" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                🎯 청약 가점(84점) 판정
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
                          <span>하우징 가이드라인 가점 처방</span>
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
                자가진단 완료 및 메인으로 돌아가기
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
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-mono">HousingHub Trust Center</span>
                </div>
                <h2 className="text-xl font-bold mt-1 tracking-tight font-display text-white">
                  법률 및 보도 안심 지원 서비스 센터
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
                onClick={() => { setActiveLegalTab("about"); setIsContactSubmitted(false); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                  activeLegalTab === "about" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                🏠 하우징허브 소개
              </button>
              <button
                onClick={() => { setActiveLegalTab("privacy"); setIsContactSubmitted(false); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                  activeLegalTab === "privacy" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                🛡️ 개인정보처리방침
              </button>
              <button
                onClick={() => { setActiveLegalTab("terms"); setIsContactSubmitted(false); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                  activeLegalTab === "terms" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                📄 이용약관 (Terms)
              </button>
              <button
                onClick={() => { setActiveLegalTab("disclaimer"); setIsContactSubmitted(false); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                  activeLegalTab === "disclaimer" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                ⚖️ 정보이용 면책고지
              </button>
              <button
                onClick={() => { setActiveLegalTab("contact"); setIsContactSubmitted(false); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg flex items-center justify-center space-x-1.5 ${
                  activeLegalTab === "contact" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                ✉️ 1:1 안심 상담 및 문의
              </button>
            </div>

            {/* 본문 콘텐츠 스크롤 및 탭 렌더링 */}
            <div className="p-6 sm:p-10 space-y-6 bg-slate-50/50 min-h-[400px]">
              {activeLegalTab === "about" && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed text-left font-sans">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">하우징허브 소개 및 E-E-A-T 편집·발행 신뢰 선언 (About Us & Editorial Standards)</h4>
                    <p className="text-xs text-slate-400 mt-1">공고 및 최종 적용 일자: 2026년 7월 20일</p>
                  </div>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">하우징허브(HousingHub) 미디어 소개</h5>
                    <p className="leading-relaxed">
                      하우징허브는 무주택 가구, 생애 최초 주택 마련 수요자, 그리고 전월세 임차인의 소중한 권리와 보증금 자산을 투명하게 사수하고 정보 비대칭을 영구적으로 제거하기 위해 설립된 <strong>비영리 공익성 종합 주거 지식 전문 포털</strong>입니다. 당사는 독자들이 복잡하고 이해하기 어려운 정부 주거 복지 정책, 세금 규율, 그리고 시중 적격 금융 대출 상품 지표에 대하여 누구나 즉각적이고 명확하게 인지하고 자가진단을 완비할 수 있도록 최우선 가치를 두고 있습니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">E-E-A-T (경험·전문성·권위성·신뢰성) 콘텐츠 제작 지침</h5>
                    <p className="leading-relaxed">
                      하우징허브 인천 미디어의 모든 보도물 및 칼럼 지식은 단순 짜깁기식 AI 생성이나 스크랩을 철저히 배격하며, 구글이 보장하는 최고의 검색 품질 기준인 E-E-A-T 원칙에 부합하도록 엄격히 기획, 검증 및 최종 배포하고 있습니다.
                    </p>
                    <ul className="list-disc pl-5 text-slate-600 space-y-1 mt-1.5 font-sans">
                      <li><strong>공식 유관 출처 대조 (Accuracy):</strong> 국토교통부, 한국토지주택공사(LH), 주택도시보증공사(HUG), 서울주택도시공사(SH), 대법원 인터넷등기소 등 공식 공공 입법 규제안과 모집 보도 공고 일정을 100% 실시간 대조하여 팩트 크로스 체킹을 의무 진행합니다.</li>
                      <li><strong>실무 자문단 협업 (Expertise):</strong> 업력 10년 이상의 베테랑 공인중개사, 공인 금융 자산 설계사, 그리고 부동산 법률 감수 전문 연구진과의 지속 가능한 피드백 연대를 구성하여 실효 지식을 제공합니다.</li>
                      <li><strong>비강제성 투명 정보 (Transparency):</strong> 어떠한 주택 판매 대행사나 특정 대출 중개업체로부터 원고료 수혜 목적의 편향된 홍보 스폰서십 글을 게재하지 않으며, 이용자의 기밀 정보 수집 목적의 어떠한 유료 가입도 일절 강제하거나 요구하지 않는 순수 영구 무상 개방 형태를 선언합니다.</li>
                    </ul>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">하우징허브 편집팀 및 자문진 소개 (Editorial Team & Advisors)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs">
                        <div className="flex items-center space-x-2 mb-2">
                          <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Yejun" className="w-8 h-8 rounded-full bg-slate-50" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">박예준 (Chief Editor / 대표자)</p>
                            <p className="text-[10px] text-slate-400">알고파트너스 대표 / 주거복지 정책 분석가</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          무주택 실수요자 권익보호를 위한 미디어 기획을 총괄합니다. 주택 임대차 분쟁 사례집 편찬 및 지자체 주거 기획 칼럼을 정기 기고하고 있습니다.
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs">
                        <div className="flex items-center space-x-2 mb-2">
                          <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Hyunwoo" className="w-8 h-8 rounded-full bg-slate-50" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">김현우 (Real Estate Consultant)</p>
                            <p className="text-[10px] text-slate-400">공인중개사 (인천 연수구 지부 자문)</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          수도권 아파트 분양권 전매 제한 및 전세 안심 보증 사기 예방 특약 조항의 실무 검수를 주관하고 실물 기재 프로세스를 조언합니다.
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs">
                        <div className="flex items-center space-x-2 mb-2">
                          <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Soyul" className="w-8 h-8 rounded-full bg-slate-50" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">이소율 (Financial Writer)</p>
                            <p className="text-[10px] text-slate-400">공인 금융설계 위원 / 주택 자금 칼럼니스트</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          스트레스 DSR 등 최신 금융 규제에 기반한 적격 대출 상환 계획 산출식 감수 및 버팀목 디딤돌 서민 보조 저리 자금 운용 매뉴얼을 전담합니다.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">콘텐츠 팩트체킹 및 정정 절차 (Fact-Checking & Corrections)</h5>
                    <p className="leading-relaxed">
                      당사 미디어는 모든 게재 지식물에 대하여 매주 월요일 최신 법률 적용 사항을 주간 단위로 크로스 확인합니다. 만약 정책 개편 시차나 단순 자판 오기로 인한 오류가 발견되거나 제보될 경우, 24시간 이내에 보도 정정 위원회 소정 기획안을 거쳐 정밀 수정 보완 조치를 시행하고 투명하게 공개 정정 목록을 보도실에 적재합니다. 정보 기재 오류 및 제안 의견은 하단의 [1:1 안심 상담 및 문의] 채널 혹은 공식 소통 이메일(<strong className="text-slate-900 font-mono">apark12321@gmail.com</strong>)로 항시 제출해 주시면 적극 감사 수렴하겠습니다.
                    </p>
                  </section>
                </div>
              )}

              {activeLegalTab === "privacy" && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed text-left font-sans">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">개인정보처리방침 (Comprehensive Privacy Policy)</h4>
                    <p className="text-xs text-slate-400 mt-1">공고일자 및 시행일자: 2026년 6월 14일 (최종 고장 수정본)</p>
                  </div>
                  
                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 1조 (기본이념 및 목적)</h5>
                    <p className="leading-relaxed">
                      하우징허브 인천(이하 ‘본 포털’)은 귀하의 소중한 사생활 및 개인정보 보호를 언제나 최우선 가치로 추구합니다. 대한민국 개인정보보호법 실무 규정에 준하여 수립되었으며, 글로벌 프라이버시 데이터 표준인 유럽연합 일반개인정보보호법(GDPR) 및 미국 캘리포니아 소비자프라이버시법(CCPA)의 권장 사항을 널리 포괄적으로 수용하고 있습니다. 본 보호 처리 기안은 본 주거 안심 보도 포털이 기동하는 동안 수집하는 인프라 데이터 및 상담 문의 내역이 어떤 방식과 공정으로 암호화 관리, 제어 및 영구 파기되는지를 입체적으로 투명 고시합니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 2조 (개인정보의 처리 수집 범위 및 무저장 기본 원칙)</h5>
                    <p className="leading-relaxed">
                      본 포털은 이용자들에게 임차 대항력 보정용 점수 연산기, 대출 규제 주택 LTV 모의 가중기, 주거 가이드라인 등의 질적 고도 조언을 <strong>완전 개방된 비회원제 무상 형태</strong>로 공급하는 것을 철칙으로 삼고 있습니다.
                    </p>
                    <ul className="list-disc pl-5 text-slate-600 space-y-1 mt-1">
                      <li><strong>비수집의 원칙:</strong> 사용자가 LTV 시뮬레이터 및 취득세 연산기 이용 시 타이핑하는 자산 가격, 연간 근로 소득 수치, 대출액 등은 일시적인 모바일 클라이언트(React state) 상에서 휘발적으로 기동될 뿐, 어떠한 가상 서버 데이터베이스로도 통신 추출되거나 영구 저장되지 않습니다.</li>
                      <li><strong>1:1 상담 시의 한계 수집:</strong> 유일하게 상담 질의 채널(Contact Center) 접수 시 작성되는 <em>성함, 이메일 주소, 자가 기입 피드백 의견 내용</em>은 고객 응대가 가닿는 단말 피드백 용도로만 소지되며, 접수 즉시 SSL 암호화 방화벽을 터널링하여 안심 보관 후 수렴 답변이 이뤄지는 24시간 도정 즉시 전면 영구적(물리적 로우 파일 포맷 복구 불능화)으로 소멸 조치 처리됩니다.</li>
                    </ul>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 3조 (Google AdSense 광고 프로그램 운용 및 서드파티 맞춤 쿠키 고지)</h5>
                    <p className="leading-relaxed">
                      본 포털은 지속 가능한 안심 주거 매뉴얼 공급 인프라의 전용 관리 비용 채택을 도모하기 위해 Google Inc.(구글 엘엘씨) 및 공인 제3자 협력 광고 송출사의 DoubleClick 맞춤식 스폰서십 전용 광고 알고리즘을 부착 활용하고 있으며, 이에 귀속된 쿠키(Cookie) 기술 방식을 원만히 기술합니다.
                    </p>
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-205 leading-relaxed space-y-2 text-slate-600 mt-1.5 font-sans">
                      <p><strong>1. 맞춤 데이터 수집:</strong> 구글 협력업체들은 사용자가 본 주거 서비스 포털은 물론 도외의 다양한 웹페이지들을 과거에 방문 탐색한 쿠키 및 이동 이력 흔적 가치(DART 쿠키 기술)를 자동 추적 인지하여 본 사용자에게 실효가 극대화된 맞춤형 타겟 광고를 노출하게 됩니다.</p>
                      <p><strong>2. 로그 관리 비강제성:</strong> 어떠한 장치에서도 사용자의 본질적 보안 주소나 기밀 데이터는 가로채지지 않으며 단순한 카테고리 선점 로그 패턴만 활용됩니다.</p>
                      <p><strong>3. 쿠키 거절 가동 조치:</strong> 사용자는 언제든지 이용하시는 크롬, 엣지, 사파리 등의 브라우저 옵션 메뉴에 진입하여 [쿠키 및 기타 사이트 데이터 차단] 권한 지정을 클릭함으로써 무단 추적을 완전히 일절 강제 차단할 수 있습니다. 또한 글로벌 표준인 구글 맞춤형 광고 설정 사이트 혹은 Network Advertising Initiative 거절 권리 도구(<a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.aboutads.info</a>)를 상시 이관 적용할 수 있습니다.</p>
                    </div>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 4조 (데이터 전송 구간의 첨단 SSL 암호 프로토콜 적용)</h5>
                    <p className="leading-relaxed">
                      상담 센터에서 제공되는 전용 데이터 교환 구간은 최첨단 웹 보안 통신 표준 규격인 <strong>SSL/TLS 대칭 가상 터널 키 암호화</strong> 처리를 전반 완비하여 인터넷 상의 어떠한 스니핑이나 가상 오염 소지로부터 완강히 보호함을 선포합니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 5조 (개인정보 의무 주체의 권리 보증 및 소통 연락 기점)</h5>
                    <p className="leading-relaxed">
                      이용자는 24시간 가동되는 개인정보 파기 요구를 행사할 자격이 주어집니다. 본 포털의 프라이버시 안심 위원장 연락 창구는 이메일 <strong className="text-slate-900 font-mono">apark12321@gmail.com</strong> 로 매칭 편성되어 접수 즉시 철저히 교감하겠습니다.
                    </p>
                  </section>
                </div>
              )}

              {activeLegalTab === "terms" && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed text-left font-sans">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">서비스 이용약관 (Standard Terms of Service)</h4>
                    <p className="text-xs text-slate-400 mt-1">최종 공시 및 개정 일자: 2026년 6월 14일</p>
                  </div>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 1조 (목적 및 서비스 범위 선포)</h5>
                    <p className="leading-relaxed">
                      본 약관은 하우징허브 인천 포털에서 무상 공급하는 인천 송도, 청라, 검단, 계양 신도시 등 주거 점포 계약 자가 구제 진산 시뮬레이터 프로그램, 이사 시 안전 등기 관리 수칙 지식 가이드, 독소 부동산 조약 피하기 레슨 등에 관한 구체적 이용 질서 및 주체 간 책임을 엄밀히 규정합니다. 사용자는 본 시스템을 관람 개별 인가하거나 가치를 취한 즉시 약관 조항 전체에 순결히 영구 동의 수여한 것으로 법적 귀속 선언됩니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 2조 (저작가치 보호 및 지적재산권 한계)</h5>
                    <p className="leading-relaxed">
                      하우징허브 인천 포털 내 게재된 임차 전조 가인 66선 기사, 독점 보도 데이터 에디토리얼, LTV 세목 이자 역산 기법 기술 자바스크립트 수식, 반응형 비서 UI 구성 일체 등의 재산적 권리 및 특허 무형물 가치는 하우징허브 인천 개발 편집팀에 엄정히 전속 지분 귀속됩니다.
                    </p>
                    <ul className="list-disc pl-5 text-slate-600 space-y-1 mt-1">
                      <li>사용자는 저작권자의 사전 정식 라이선스 날인 동의서 없이 상업적 매체나 타사 주거 블로그, 부동산 카페 등에 대단위 긁어가기 백도어 유통 및 무단 인쇄 복제를 완전 엄금합니다.</li>
                      <li>다만, 비영리 목적의 공인 인프라 활용, 임대차 가해 사기 예방 공익 활동, 친구 및 소중한 친가 가족들에게 안심 가이드 주소를 단순 복사 전송하는 공유 권능은 널리 무상으로 허락 격려됩니다.</li>
                    </ul>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 3조 (연산 시뮬레이터 활용 상의 제한 및 보칙)</h5>
                    <p className="leading-relaxed">
                      본 주거 사이트가 행하는 시중 금융 예측 데이터 한도는 단순 모의 점수 데이터에 기초합니다. 개개 이용자의 주택 신용 스코어 지수, 연체 가중 내역, 정부의 기습적 고가 주택 금융제한 긴급조치 발령 여부에 따라 각 금융 창구 실무 수리 내역과 엄밀한 시차가 성립할 수 있습니다. 사용자는 반드시 가결정 계약 집행 단계 직전, 공인 시중 은행 전용 부서 대부 실무 상담사 혹은 정식 소속 감정평가사 주체를 통해 크로스 체크를 선험해야 합니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 4조 (관할 법원의 규정 및 특약)</h5>
                    <p className="leading-relaxed">
                      본 약관 조항 및 사이트 정보 수혜 과정상 성립 또는 논란되는 소송 전반에 관해서는 하우징허브 인천 본부를 관장하는 대한민국 <strong>인천지방법원</strong>을 유일무이한 합의 전속 관할 거점으로 선언합니다.
                    </p>
                  </section>
                </div>
              )}

              {activeLegalTab === "disclaimer" && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed text-left font-sans">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">정보이용 면책고지 및 리스크 선언문 (Formal Disclaimer Cover)</h4>
                    <p className="text-xs text-slate-450 mt-1">최종 개정 및 유효 효력 발효일: 2026년 6월 14일</p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex items-start space-x-3 text-xs text-amber-950 font-sans">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">⚠️ 임대인/임차인 계약 성사 전 최종 민형사 책임 경고 고지</p>
                      <p className="leading-relaxed">하우징허브 인천 포털의 지식 보도는 선의의 목적 아래 배포되는 무상 공익 정보에 불과합니다. 귀하가 집행하시는 어떤 법리 계약의 결과에 대해서도 본 포털 관계자, 보도 주간사, AI 개발팀 등은 어떠한 직접적 법적 재정 보증이나 구제 변제 지급 보증을 일절 수립하지 않음을 엄히 공표 고지합니다.</p>
                    </div>
                  </div>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 1조 (국토교통부 수시 개정 정책 시차 및 자격 요건의 한계)</h5>
                    <p className="leading-relaxed">
                      본 서비스는 최대한 공기업 및 유관 연계 부처 공식 고사 일자에 결부하여 면밀히 사실 교정을 처리 중이나, 실시간 급개정 부동산 세액법, 취득 규율 수치 지형이 즉시 일사천리로 반영 완료 수립되지 못하여 발생하는 단기 수치 격차에 법리 책임을 보증하지 않습니다. 세입자 및 소유 이관 신청자 본인은 계약 조약 명시전 필수적으로 관할 주민동 자치 기획관, 구청 토지과 대장 공문, 혹은 현장 담당 노련 공인중개사의 실효 인허 확인 도장을 병행 점검해 나가시기를 권고합니다.
                    </p>
                  </section>

                  <section className="space-y-2.5">
                    <h5 className="font-bold text-slate-900 text-sm">제 2조 (AI 주거 비서 솔루션 생성 정보의 참고 제한성)</h5>
                    <p className="leading-relaxed">
                      본 주거 포털에 내장 작동되는 생성적 인공지능 주택 컨설턴트 요법 및 인천 최적 입지 점수 추천 정보는 신소 기술 시너지의 보조 구상으로서, 고차원적 인과 맥락 번역 가치를 지니나 완강한 영구적 팩트를 정사하지 않을 성격이 희박 수준 내포됩니다. AI 추천 정보는 온당히 조력 장치 지식으로 고이 활용하시되 중대하고 막대한 예산 이송 투자 거래 결정 시점에서는 다각의 등본 및 현지 답사 등을 교차 대조 판단하셔야 합니다.
                    </p>
                  </section>
                </div>
              )}

              {activeLegalTab === "contact" && (
                <div className="space-y-6 text-left">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-base font-bold text-slate-900">1:1 주거 안심 제안 및 공식 문의 소통 센터</h4>
                    <p className="text-xs text-slate-400 mt-1">이용자 권익 보호와 주거 복지 제안 수렴을 위한 하우징허브 공식 소통 채널입니다.</p>
                  </div>

                  {isContactSubmitted ? (
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200 text-center space-y-4 max-w-lg mx-auto">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-700">
                        <CheckCircle2 className="w-6 h-6 animate-bounce" />
                      </div>
                      <h5 className="text-base font-bold text-slate-900">문의 접수 완수</h5>
                      <div className="text-xs text-slate-600 leading-relaxed space-y-2 mx-auto max-w-xs">
                        <p>당신의 소중한 개선 정보가 지원팀에 안전하게 접수 완료되었습니다.</p>
                        <div className="bg-white border border-green-100 px-3 py-1.5 rounded-lg font-mono font-bold text-green-700">
                          접수 ID: {contactResultId}
                        </div>
                        <p>최대 24시간 이내 입력 이메일로 명쾌한 가치를 회신 전송하겠습니다.</p>
                      </div>
                      <button 
                        onClick={() => { setIsContactSubmitted(false); }}
                        className="bg-slate-900 text-white font-medium px-4 py-2 rounded-xl text-xs hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        새 문의 작성하기
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4 max-w-2xl mx-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">회신받으실 성함</label>
                          <input 
                            type="text" 
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="예: 홍길동"
                            className="w-full px-3.5 py-2g bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">회신받으실 이메일 주소</label>
                          <input 
                            type="email" 
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="example@mail.com"
                            className="w-full px-3.5 py-2g bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">문의 성격 대분류</label>
                        <select
                          value={contactCategory}
                          onChange={(e) => setContactCategory(e.target.value)}
                          className="w-full px-3.5 py-2g bg-white border border-slate-200 rounded-xl text-xs focus:outline-none font-medium text-slate-700"
                        >
                          <option value="general">포털 개선 건의 / 데이터 보도 오류 제보</option>
                          <option value="financial">계산기 가산 정보 오류 가치 정정 피드백</option>
                          <option value="alli">포털 광고 및 공식 업무 제휴안 제안</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">상세 문의 사유 및 의견 전달</label>
                        <textarea 
                          required
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="이곳에 문의하실 자가 판단 규정 의견이나 질문 사항을 자유롭게 적어주시면 안심 지원 조치하겠습니다..."
                          className="w-full px-3.5 py-2g bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
                        />
                      </div>

                      <div className="pt-2">
                        <button 
                          type="submit"
                          disabled={isContactLoading}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md focus:outline-none flex items-center space-x-2 cursor-pointer"
                        >
                          {isContactLoading ? (
                            <>
                              <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>정리안 전송 중...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>소통 문의사항 무료 제출</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* 히어로 환영 안내 */}
            <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
              <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200')` }}></div>
              <div className="relative p-8 sm:p-12 max-w-3xl space-y-5">
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>실시간 주거 안심 정보 마이크로 포털</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display leading-tight">
                  소중한 내 집 계약부터 대출 가치까지,<br/>전국 실생활 주거 안심 해결법.
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  하우징허브는 주택 청약 분양 입지 분석, 임대차 계약 등기 안전조항, 스트레스 DSR 대안 한도까지 무주택 실수요자가 반드시 숙지해야 할 지식백과 66선을 제공합니다.
                </p>

                {/* 지역별 스마트 허브 선택기 */}
                <div className="py-1">
                  <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider block mb-2.5">원하는 지역의 밀착 지식 허브 선택</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "전체", label: "🌐 전국 종합", color: "bg-blue-600 border-blue-500" },
                      { key: "서울", label: "🗼 서울 허브", color: "bg-indigo-600 border-indigo-500" },
                      { key: "인천", label: "⚓ 인천 허브", color: "bg-teal-600 border-teal-500" },
                      { key: "경기", label: "🌳 경기 허브", color: "bg-emerald-600 border-emerald-500" }
                    ].map(reg => (
                      <button
                        key={reg.key}
                        onClick={() => setSelectedRegion(reg.key)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          selectedRegion === reg.key 
                            ? `${reg.color} border-white text-white shadow-md scale-102` 
                            : "bg-slate-800/65 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {reg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap gap-3">
                  <button 
                    onClick={() => setShowDiagnosticPage(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <Calculator className="w-4.5 h-4.5" />
                    <span>스마트 주거 자가진단 실행</span>
                  </button>
                  {IS_CHAT_ENABLED && (
                    <button 
                      onClick={() => setIsChatOpen(true)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium px-5 py-3 rounded-xl transition-all flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <MessageSquare className="w-4.5 h-4.5 text-blue-400" />
                      <span>AI 컨설턴트 무료 대화</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* 메인 투컬럼 벤트 레이아웃 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              {/* 왼쪽 컬럼: 지식백과 보도실 아티클 라이브러리 목록 */}
              <div className="lg:col-span-8 space-y-6">
                <section className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                        <span>📚 {selectedRegion === "전체" ? "전국" : selectedRegion} 지식백과 보도실</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {selectedRegion === "전체" && "전국 무주택 서민과 실수요자를 위한 하우징 전문가 기고문 66선"}
                        {selectedRegion === "인천" && "인천 시민과 인천지역 주거 청약 예정자를 위한 하우징 전문가 기고문"}
                        {selectedRegion === "서울" && "서울 시민과 서울 수도권 주거 청약 예정자를 위한 하우징 전문가 기고문"}
                        {selectedRegion === "경기" && "경기 도민과 경기 수도권 주거 청약 예정자를 위한 하우징 전문가 기고문"}
                      </p>
                    </div>
                    
                    {/* 검색 영역 */}
                    <div className="flex items-center space-x-2 w-full md:max-w-md">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="예: 송도 청약, 전세 사기 방지, DSR..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium shadow-2xs"
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 태그 모음 */}
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
                      <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                        <p className="font-bold">일치하는 지식 아티클이 없습니다.</p>
                        <p className="text-xs text-slate-400 mt-1">검색어를 지우거나 카테고리 기둥에서 찾아보세요.</p>
                      </div>
                    ) : (
                      filteredPosts.map(post => {
                        const isBookmarked = bookmarks.includes(post.id);
                        return (
                          <article 
                            key={post.id}
                            onClick={() => setActivePost(post)}
                            className="group bg-white rounded-2xl border border-slate-200/85 hover:border-blue-500/30 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-[380px]"
                          >
                            <div className="relative h-44 overflow-hidden bg-slate-100">
                              <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[11px] font-bold text-slate-800 px-2.5 py-1 rounded-full shadow-xs">
                                {post.category}
                              </span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleBookmark(post.id, e); }}
                                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs hover:scale-110 transition-all"
                              >
                                <Heart className={`w-4 h-4 transition-colors ${
                                  isBookmarked ? "fill-rose-500 text-rose-500" : "text-slate-400"
                                }`} />
                              </button>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="flex items-center font-bold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200/50">
                                    <Calendar className="w-3 h-3 mr-1 text-blue-600" />
                                    {post.date}
                                  </span>
                                  <span className="flex items-center text-slate-400 font-medium">
                                    <Clock className="w-3 h-3 mr-1 text-slate-300" />
                                    {post.readTime}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                  {post.title}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              </div>

                              {/* 해시태그 프롬프트 */}
                              <div className="flex flex-wrap gap-1 mt-3">
                                {post.hashtags?.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>

          {/* 타임라인 및 트렌드 미니 위젯 (Bento Mini Widgets) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 북마크 리딩 리스트 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col h-[280px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <Bookmark className="w-4.5 h-4.5 text-blue-600" />
                  <span>나의 주거 보관함</span>
                </span>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                  {bookmarks.length}개
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {bookmarks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-1.5 p-4">
                    <Heart className="w-6 h-6 text-slate-300 stroke-1" />
                    <p className="text-xs font-medium">보관 중인 아티클이 없습니다.</p>
                  </div>
                ) : (
                  POSTS.filter(p => bookmarks.includes(p.id)).map(post => (
                    <div 
                      key={post.id}
                      onClick={() => setActivePost(post)}
                      className="group p-2.5 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="truncate pr-4 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span className="text-slate-600 font-medium">{post.category}</span>
                          <span>•</span>
                          <span className="text-blue-600 font-semibold">{post.date}</span>
                        </span>
                      </div>
                      <button 
                        onClick={(e) => toggleBookmark(post.id, e)}
                        className="text-slate-300 hover:text-red-500 p-1.5"
                      >
                        <X className="w-4 h-4 cursor-pointer" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 실시간 2026 트렌드 타임라인 */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs space-y-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">2026 부동산 시행 예고</span>
              <h4 className="text-base font-bold font-display">{selectedRegion === "전체" ? "전국" : selectedRegion} 실수요 세금/공급 달력</h4>
              
              <div className="space-y-4 pl-1">
                <div className="relative pl-4 border-l border-slate-700">
                  <div className="absolute -left-[4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">5월 10일자 시행</span>
                  <p className="text-xs font-bold mt-0.5">다주택자 양도세 중과 수수료 복원</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">계약금 입금 영수증 제출 의무화 연계 작동</p>
                </div>
                <div className="relative pl-4 border-l border-slate-700">
                  <div className="absolute -left-[4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">6월 1일 과세기준</span>
                  <p className="text-xs font-bold mt-0.5">종부세 세액 전정 등 공시지가 적용일</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">단 하루 등기 일자에 따라 1년 치 세액 주체 확정</p>
                </div>
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
            <div className="w-[360px] sm:w-[420px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
              {/* 챗봇 톱바 */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-display">하우징허브 스마트 AI 안심 비서</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{selectedRegion === "전체" ? "전국" : selectedRegion} 지역 맞춤형 주거 컨설턴트</p>
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
                  onClick={() => handleQuickQuestion(`${selectedRegion === "전체" ? "수도권" : selectedRegion} 신혼 가구인데 신생아 대출이랑 보금자리론 중 무엇이 유리해?`)}
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
                하우징허브는 실수요자의 권리보호와 주거복지 증진을 목적으로 하는 무상의 정보 포털입니다. 전국 종합 주거 지식과 서울·인천·경기 등 핵심 지역별 밀착 가이드를 철저히 검증해 세세히 전달합니다.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-slate-400 font-medium">
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
                  <span>법률 및 신뢰정책</span>
                </span>
                <ul className="space-y-1.5">
                  <li>
                    <button 
                      onClick={() => { setActivePost(null); setActiveLegalTab("about"); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      하우징허브 미디어 소개
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
              <div className="space-y-2">
                <span className="text-white font-semibold">포털 소통 창구</span>
                <ul className="space-y-1.5">
                  <li>
                    <button 
                      onClick={() => { setActivePost(null); setActiveLegalTab("contact"); setIsContactSubmitted(false); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none flex items-center space-x-1"
                    >
                      <span>1:1 문의 제안 접수</span>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 발행인 및 신뢰성 고지 배너 */}
          <div className="pt-6 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-slate-300 font-semibold">
              <span>발행처: 알고파트너스 (Algo Partners)</span>
              <span>대표자 및 편집책임자: 박예준</span>
              <span>공식 이메일: apark12321@gmail.com</span>
              <span>애드센스 파트너: ca-pub-9552509372228899</span>
            </div>
            <p className="text-slate-500">
              하우징허브(zip9.kr)는 무주택자, 임차인, 내 집 마련 수요자를 위해 검증된 공공 주거 정책 및 적격 금융 지식을 무상으로 제공하는 정론 종합 지식 포털입니다. 본 사이트 내 수록된 정보 및 모의 연산 결과는 사용자 이해를 돕기 위한 공익성 참고 자료이며, 어떠한 개별 가입 및 입금 요구도 일절 강제하지 않습니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 font-medium pt-2">
            <p>© 2026 HousingHub (zip9.kr). All rights reserved. Global Privacy & Information Standards Compliant.</p>
            <p className="mt-2 sm:mt-0">E-E-A-T Verified Housing Knowledge Portal</p>
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
