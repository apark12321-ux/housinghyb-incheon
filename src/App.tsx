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
import { Post, Category } from "./types";

interface Message {
  role: "user" | "model";
  text: string;
  time: string;
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchTerm, setSearchTerm] = useState<string>("Incheon");
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

  // URL에서 초기 /post/xxx 혹은 ?post=xxx 값을 읽어 상세 포스터 세팅 및 popstate 감지 (SEO 및 서치콘솔 최적화용)
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      let postId: string | null = null;

      if (pathname.startsWith("/post/")) {
        postId = pathname.replace("/post/", "");
      } else {
        postId = params.get("post");
      }

      if (postId) {
        const found = POSTS.find(p => p.id === postId);
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

  // activePost의 변화에 따른 브라우저 주소 구체적 동기화 (SEO 친화적인 Path-based Routing 및 서치콘솔 안심 주소 적용)
  useEffect(() => {
    const pathname = window.location.pathname;
    const isPostPath = pathname.startsWith("/post/");
    const pathPostId = isPostPath ? pathname.replace("/post/", "") : null;

    if (activePost) {
      if (pathPostId !== activePost.id) {
        // 주소를 /post/아이디 로 깔끔하고 세밀하게 바꿉니다.
        window.history.pushState({ postId: activePost.id }, "", `/post/${activePost.id}`);
      }
      // 동적으로 문서 타이틀 및 메타태그 보완 (브라우저 수준)
      document.title = `${activePost.title} | 하우징허브 인천`;
    } else {
      if (isPostPath) {
        // 상세보기를 닫았으므로 메인 사이트 주소인 / 로 깔끔하게 복귀합니다.
        window.history.pushState(null, "", "/");
      }
      document.title = "하우징허브 인천 | 실생활 청약, 임대, 전세대출 안심 정보 포털";
    }
  }, [activePost]);

  // 자가진단 계산기 탭: 'loan' (대출한도) | 'score' (청약가점)
  const [toolTab, setToolTab] = useState<"loan" | "score">("loan");

  // --- 법률 및 애드센스 정책 안심 확보 상태 ---
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<"privacy" | "terms" | "disclaimer" | "contact">("privacy");
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
      alert("이름, 이메일, 그리고 상세 의견 기재는 필수 항목입니다.");
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
      alert("전송 중 네트워크 일시 혼선이 발생했습니다. 다시 접수해 주세요.");
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
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("hh_chats");
    return saved ? JSON.parse(saved) : [
      { 
        role: "model", 
        text: "반갑습니다! <strong>하우징허브 인천 AI 안심 비서</strong>입니다. <br/>인천 송도·청라 등 분양 입지 가치, 전월세 사기 방어 안전조항, 스트레스 DSR 한도 대안까지 무엇이든 쉽고 정확하게 물어보세요! 😊", 
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
    return POSTS.filter(post => {
      const matchCategory = selectedCategory === "전체" || post.category === selectedCategory;
      const matchTag = !selectedTag || post.hashtags?.includes(selectedTag);
      const matchSearch = !searchTerm || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchTag && matchSearch;
    });
  }, [selectedCategory, selectedTag, searchTerm]);

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
      {/* 최상단 장식 바 - 테크놀로지 어보이드 규정에 귀속하여 온라인 핑, 포트 등의 슬롭 배제 */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
        🎉 2026 하우징허브 프리미엄 인천 주거 안심 통합 가이드라인 가동 중
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {
            setSelectedCategory("전체");
            setSelectedTag(null);
            setSearchTerm("");
          }}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display flex items-center space-x-1">
                <span>HousingHub</span>
                <span className="text-blue-600 text-sm font-semibold bg-blue-50 px-2 py-0.5 rounded-md ml-1.5">인천</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Incheon Housing encyclopaedia</p>
            </div>
          </div>

          {/* 데스크톱 통합 내비게이션 주거 정보 카테고리 기둥 */}
          <nav className="hidden md:flex items-center space-x-1">
            {["전체", "청약-분양", "전월세", "이사-인테리어", "대출-금융"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedTag(null);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsChatOpen(prev => !prev)}
              className="relative p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-700 hover:border-slate-300"
            >
              <MessageSquare className="w-5 h-5 text-blue-600 animate-pulse" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 허브 레이아웃 - bento style */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 히어로 환영 안내 */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200')` }}></div>
          <div className="relative p-8 sm:p-12 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>실시간 주거 안심 정보 마이크로 포털</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display leading-tight">
              소중한 내 집 계약부터 대출 가치까지,<br/>인천 맞춤형 해결법을 한눈에.
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
              하우징허브 인천은 송도·청라 등 분양 핵심 전략, 등기부 독소조항 무력화 특약, 스트레스 DSR 연도별 실익 등 실수요자가 반드시 숙지해야 할 지식백과 66선을 제공합니다.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  const el = document.getElementById("diagnostic-card");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center space-x-2 text-sm"
              >
                <Calculator className="w-4.5 h-4.5" />
                <span>스마트 주거 자가진단 실행</span>
              </button>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium px-5 py-3 rounded-xl transition-all flex items-center space-x-2 text-sm"
              >
                <MessageSquare className="w-4.5 h-4.5 text-blue-400" />
                <span>AI 컨설턴트 무료 대화</span>
              </button>
            </div>
          </div>
        </section>

        {/* 벤트 격자 1층: 자가진단 툴킷 (Bento Diagnostic Tools) */}
        <section id="diagnostic-card" className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Calculator className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">하우징 통합 자가진단 툴킷</h3>
                  <p className="text-xs text-slate-500 font-medium">데이터 연산 기반 LTV, DSR 역산 모의 진산기</p>
                </div>
              </div>
              <div className="flex p-1 bg-slate-200/80 rounded-xl max-w-fit">
                <button
                  onClick={() => setToolTab("loan")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    toolTab === "loan" 
                      ? "bg-white text-indigo-600 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  💰 DSR/LTV 대출 한도기
                </button>
                <button
                  onClick={() => setToolTab("score")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    toolTab === "score" 
                      ? "bg-white text-indigo-600 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🎯 청약 가점(84만점) 판정
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1">
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

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center space-x-3 text-xs text-slate-600">
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
                        <p className="text-3xl font-extrabold text-indigo-900 font-display mt-1">
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-indigo-600"
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-indigo-600"
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-indigo-600"
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
                  <div className="bg-slate-9 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
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
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-400 block">무주택</span>
                          <span className="font-bold text-slate-700">{subscriptionScore.homeless} / 32</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-400 block">부양가족</span>
                          <span className="font-bold text-slate-700">{subscriptionScore.dependents} / 35</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
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
                        <p className="text-xs text-slate-700 mt-2 leading-relaxed word-break:keep-all">
                          {subscriptionScore.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          {post.category} • {post.readTime}
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
              <h4 className="text-base font-bold font-display">인천 실수요 세금/공급 달력</h4>
              
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
        </section>

        {/* 벤트 격자 2층: 66선 주거 지식 라이브러리 목록 */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">지식백과 보도실</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">인천 시민과 유주택 예정자를 위한 하우징 전문가 기고문</p>
            </div>
            
            {/* 검색 및 검색정돈 */}
            <div className="flex items-center space-x-2 w-full md:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="예: 송도 청약, 전세 사기 방지, DSR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
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
                className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
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
                  className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
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

          {/* 글 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500/30 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-[380px]"
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
                        onClick={(e) => toggleBookmark(post.id, e)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs hover:scale-110 transition-all"
                      >
                        <Heart className={`w-4 h-4 transition-colors ${
                          isBookmarked ? "fill-rose-500 text-rose-500" : "text-slate-400"
                        }`} />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-0.5" />
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
      </main>

      {/* 리얼타임 AI 대화 전담 챗봇 모달 사이드 바 (Floating Messenger) */}
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
                  <p className="text-[10px] text-green-400 font-medium">● 2026 인천 주거 컨설턴트 가동 중</p>
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
                onClick={() => handleQuickQuestion("인천 신혼 가구인데 신생아 대출이랑 보금자리론 중 무엇이 유리해?")}
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

      {/* 아티클 집중 정독 서브-모달 (Modal View Overlay) */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 배경 흐림 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePost(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* 모달 박스 */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-3xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              {/* 이미지 헤더 */}
              <div className="relative h-64 bg-slate-100 flex-shrink-0">
                <img 
                  src={activePost.image} 
                  alt={activePost.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <button 
                  onClick={() => setActivePost(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-md cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {activePost.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                    {activePost.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-slate-350 text-[11px] font-mono">
                    <span>{activePost.date}</span>
                    <span>•</span>
                    <span>필진: {activePost.author}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {activePost.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* 본문 에어리어 */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                
                {/* 퀵 챗 연계 배너 */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">이 아티클의 조언이 더 필요하신가요?</p>
                      <p className="text-[10px] text-slate-500">인천 전문 AI 주거 비서방으로 정보 자질을 실시간 질의하세요.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const askText = `방금 열람한 '${activePost.title}' 관련해서 자격요건이나 꿀팁을 인천 입지에 맞춰 더 깊이 조언해줘!`;
                      setActivePost(null);
                      setIsChatOpen(true);
                      handleChatSend(askText);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>비서 연계하기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 실제 정밀 렌더러 */}
                <div 
                  className="article-rich-content"
                  dangerouslySetInnerHTML={{ __html: activePost.content }}
                />

                {/* 해시태그 목록 */}
                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-6">
                  {activePost.hashtags?.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 하단 단추 */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
                <button
                  onClick={(e) => toggleBookmark(activePost.id, e)}
                  className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarks.includes(activePost.id) ? "fill-red-500 text-red-500" : ""}`} />
                  <span>{bookmarks.includes(activePost.id) ? "보관 해제" : "내 보관함 스크랩"}</span>
                </button>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("하우징허브 인천 주소지가 클립보드에 복사되었습니다! 소중한 분들에게 안심 정보를 나누어 보세요.");
                  }}
                  className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>안심 가이드 공유</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                하우징허브 인천은 실수요자의 권리보호와 주거복지 증진을 목적으로 하는 무상의 정보 포털입니다. 법률 가이드, 시뮬레이션 계산 인프라를 철저히 검증해 세세히 전달합니다.
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
                      onClick={() => { setLegalModalTab("privacy"); setIsLegalModalOpen(true); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      개인정보처리방침
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setLegalModalTab("terms"); setIsLegalModalOpen(true); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      이용약관 (Terms)
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setLegalModalTab("disclaimer"); setIsLegalModalOpen(true); }}
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
                      onClick={() => { setLegalModalTab("contact"); setIsLegalModalOpen(true); setIsContactSubmitted(false); }}
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 font-medium">
            <p>© 2026 HousingHub Incheon. Adhered to Google AdSense Publisher Policies & Global Privacy Standards.</p>
            <p className="mt-2 sm:mt-0">All references are valid in South Korea regulations.</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800/50 text-[10px] text-slate-600 leading-relaxed">
            <p><strong>[AdSense Compliance Statement]</strong> 본 주거 마이크로 포털 하우징허브 인천은 구글 애드센스(Google AdSense) 프로그램 정책을 엄격히 준수하며, 사용자 맞춤형 광고 매칭 및 트래픽 분석을 위해 서드파티 제공업체 쿠키(Cookie)를 조화롭게 활용할 수 있습니다. 사용자는 개인정보처리방침을 언제든지 검토하고 브라우저 설정 조율로 맞춤 수집을 강제 해제할 수 있습니다.</p>
          </div>
        </div>
      </footer>

      {/* 법률 및 안심 약관 센터 통합 모달 (AdSense & Legal Desk) */}
      <AnimatePresence>
        {isLegalModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* 배경 흐림 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLegalModalOpen(false)}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs"
            />

            {/* 모달 박스 */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 border border-slate-200"
            >
              {/* 모달 헤더 */}
              <div className="p-6 bg-slate-900 text-white flex-shrink-0 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-mono">HousingHub Trust Center</span>
                  </div>
                  <h3 className="text-lg font-bold mt-1 tracking-tight font-display text-white">
                    법률 및 보도 안심 지원 서비스 센터
                  </h3>
                </div>
                <button 
                  onClick={() => setIsLegalModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 탭 네비게이터 */}
              <div className="flex bg-slate-100 p-1 flex-shrink-0 border-b border-slate-200 overflow-x-auto">
                <button
                  onClick={() => { setLegalModalTab("privacy"); setIsContactSubmitted(false); }}
                  className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                    legalModalTab === "privacy" 
                      ? "bg-white text-blue-600 shadow-xs animate-pulse" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  🛡️ 개인정보처리방침
                </button>
                <button
                  onClick={() => { setLegalModalTab("terms"); setIsContactSubmitted(false); }}
                  className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                    legalModalTab === "terms" 
                      ? "bg-white text-blue-600 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  📄 이용약관 (Terms)
                </button>
                <button
                  onClick={() => { setLegalModalTab("disclaimer"); setIsContactSubmitted(false); }}
                  className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg ${
                    legalModalTab === "disclaimer" 
                      ? "bg-white text-blue-600 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  ⚖️ 정보이용 면책고지
                </button>
                <button
                  onClick={() => { setLegalModalTab("contact"); setIsContactSubmitted(false); }}
                  className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg flex items-center justify-center space-x-1.5 ${
                    legalModalTab === "contact" 
                      ? "bg-white text-blue-600 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  ✉️ 1:1 안심 상담 및 문의
                </button>
              </div>

              {/* 본문 콘텐츠 스크롤 및 탭 렌더링 */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50/50">
                {legalModalTab === "privacy" && (
                  <div className="space-y-6 text-sm text-slate-700 leading-relaxed text-left">
                    <div className="border-b border-slate-200 pb-4">
                      <h4 className="text-base font-bold text-slate-900">개인정보처리방침 (Privacy Policy)</h4>
                      <p className="text-xs text-slate-400 mt-1">공고일자 및 시행일자: 2026년 6월 9일</p>
                    </div>
                    
                    <section className="space-y-2.5">
                      <h5 className="font-bold text-slate-900">제 1조 (목적 및 기본원칙)</h5>
                      <p className="text-xs">
                        하우징허브 인천(이하 '포털')은 이용자의 개인정보 수집 및 보호를 매우 중요하게 생각하며, 대한민국의 개인정보보호법 및 글로벌 프라이버시 표준 가이드라인을 완전하게 준수합니다. 본 방침은 포털이 이용자의 데이터를 보관, 가공, 보호하는 절차를 안내합니다.
                      </p>
                    </section>

                    <section className="space-y-2.5">
                      <h5 className="font-bold text-slate-900">제 2조 (개인정보 수집 항목 및 가공 범위)</h5>
                      <p className="text-xs">
                        포털은 회원제 가입 유무 및 본인인증을 원칙적으로 강제하지 않는 완전 공개형 안심 주거 매뉴얼로서, 단순 서비스 조회와 웹 자가진단 연산기 사용 중에 이용자의 실명, 주민등록번호, 연락처 등의 민감 정보를 <strong>일체 수집하거나 서버에 강제 기록하지 않습니다.</strong> 문의하기 등을 통해 남겨주신 연락 메일(Email)은 오직 질문 회신의 용도로만 사용하며 24시간 동안 임시 접수 처리 후 지체 없이 영구 파기합니다.
                      </p>
                    </section>

                    <section className="space-y-2.5">
                      <h5 className="font-bold text-slate-900">제 3조 (Google AdSense 광고 프로그램 및 제3자 쿠키 고지)</h5>
                      <p className="text-xs">
                        본 사이트는 사용성과 질적 서비스 충족을 위한 인프라 유지를 위해 구글(Google Inc.)을 포함한 제3자 제공업체의 광고 게재용 <strong>DoubleClick DART 쿠키(Cookie)</strong>를 활용할 수 있습니다.
                      </p>
                      <ul className="list-disc pl-5 text-xs text-slate-500 space-y-1">
                        <li>구글을 포함한 제3자 제공업체는 사용자가 당사 웹사이트 또는 기타 다른 인터넷 사이트를 과거에 방문한 기록을 바탕으로 개개인 맞춤형 맞춤식 광고를 송출합니다.</li>
                        <li>쿠키를 사용하는 것은 구글과 구글의 파트너사가 부적절한 로그 수집 없이 맞춤식 광고를 게재하기 위한 기술적 표준 조치입니다.</li>
                        <li>이용자는 브라우저 설정에 진입하여 쿠키 저장을 거부할 수 있으며, Google 광고 설정 또는 www.aboutads.info를 통해 개인정보 맞춤형 정보수집 거부 설정 조치를 수시로 이관할 수 있습니다.</li>
                      </ul>
                    </section>

                    <section className="space-y-2.5">
                      <h5 className="font-bold text-slate-900">제 4조 (데이터의 안전성 보증을 위한 암호화 조치)</h5>
                      <p className="text-xs flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>포털로 전송되는 모든 데이터 및 모의 진산 연산 데이터는SSL/TLS 웹보안 프로토콜 암호화 처리 후 통신되어 제3자 탈취 위협으로부터 안전하게 방어됩니다.</span>
                      </p>
                    </section>
                  </div>
                )}

                {legalModalTab === "terms" && (
                  <div className="space-y-6 text-sm text-slate-700 leading-relaxed text-left">
                    <div className="border-b border-slate-200 pb-4">
                      <h4 className="text-base font-bold text-slate-900">이용약관 (Terms of Service)</h4>
                      <p className="text-xs text-slate-400 mt-1">최종 개정: 2026년 6월 9일</p>
                    </div>

                    <section className="space-y-2.5">
                      <h5 className="font-bold text-slate-900">개요 및 효력 선언</h5>
                      <p className="text-xs">
                        본 약관은 하우징허브 인천 포털에서 무상 제공하는 인천 송도, 청라, 검단 신도시 등 주택 계약 자가진단 툴, 이사 지식, 등기부 독소 계약 방어 가이드 등에 관한 이용 규칙을 규정합니다. 사용자는 본 사이트에 접속하여 지식을 정독함에 따라 이 약관 규범 전반에 동의한 것으로 간주합니다.
                      </p>
                    </section>

                    <section className="space-y-2.5">
                      <h5 className="font-bold text-slate-900">글 및 저작 가치의 보호</h5>
                      <p className="text-xs">
                        하우징허브 인천이 보증하는 66선 전문 기고문, 무주택 지표, 대출 이자 역산 알고리즘 및 UI 레이아웃의 소유권은 하우징허브 인천에 전속되어 보호받습니다. 사용자는 무단 발췌 도용이나 불법 복제로 다른 매체에 전파할 수 없으며 위반 시 구상권 배상 조치가 취해집니다.
                      </p>
                    </section>

                    <section className="space-y-2.5">
                      <h5 className="font-bold text-slate-900">서비스 제공의 한계와 성격</h5>
                      <p className="text-xs">
                        본 포털이 연산해 제공하는 점수 결과와 예측 금액은 모의 참고용 계산으로써 금융기관의 최종 승인 내용과 상이할 수 있으며, 이로 인한 직접적인 피해에 포털은 법적 구속 보정을 부과하지 않습니다.
                      </p>
                    </section>
                  </div>
                )}

                {legalModalTab === "disclaimer" && (
                  <div className="space-y-6 text-sm text-slate-700 leading-relaxed text-left">
                    <div className="border-b border-slate-200 pb-4">
                      <h4 className="text-base font-bold text-slate-900">포털 정보이용 면책고지 (Disclaimer)</h4>
                      <p className="text-xs text-slate-400 mt-1">공시일자: 2026년 6월 9일</p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex items-start space-x-3 text-xs text-amber-950">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">반드시 정독해 주시기 바랍니다.</p>
                        <p className="leading-relaxed">당 포털의 자가 계산 도구의 판단 지식과 LTV 계산 결과는 단순 모의 진단용 자료입니다. 시중 은행의 여신 자격과 금리 변동 요건에 비추어 차이가 극대화될 수 있습니다.</p>
                      </div>
                    </div>

                    <section className="space-y-2.5">
                      <h5 className="font-bold text-slate-900">가치 예측 정보 오류 가능성 선언</h5>
                      <p className="text-xs">
                        하우징허브 포털은 국토부 고시에 귀속하여 최고 품질의 기사와 가이드를 배포하지만, 수시로 개정되는 부동산 및 주택법 지침 전반을 일체의 지체 없이 완벽하게 반영하지 못할 수 있습니다. 본 사이트 계산 및 정보를 토대로 수행하는 재산적 판단, 계약 귀속 전반에 관해 당 포털은 보상 혹은 법리 책임을 보증하지 않음을 고지합니다.
                      </p>
                    </section>
                  </div>
                )}

                {legalModalTab === "contact" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-slate-200 pb-4">
                      <h4 className="text-base font-bold text-slate-900">1:1 지원 정책 및 소통 센터 (Contact Desktop)</h4>
                      <p className="text-xs text-slate-400 mt-1">구글 퍼블리셔 정책 조항을 준수하여 활성화된 공식 이용자 건의 채널입니다.</p>
                    </div>

                    {isContactSubmitted ? (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-green-50 rounded-2xl p-6 border border-green-200 text-center space-y-4 max-w-lg mx-auto"
                      >
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
                      </motion.div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-4 max-w-2xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 block">회일받으실 성함</label>
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
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md focus:outline-none flex items-center space-x-2"
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

              {/* 하단 단추 */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end flex-shrink-0">
                <button
                  onClick={() => setIsLegalModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  확인 완료 및 안심창 닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
