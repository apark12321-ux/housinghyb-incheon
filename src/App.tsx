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

interface Message {
  role: "user" | "model";
  text: string;
  time: string;
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
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
  const [activeLegalTab, setActiveLegalTab] = useState<"privacy" | "terms" | "disclaimer" | "contact" | "indexing" | null>(null);

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
      } else if (pathname === "/indexing") {
        setActiveLegalTab("indexing");
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
      document.title = `${activePost.title} | 하우징허브 인천`;
    } else if (showDiagnosticPage) {
      if (pathname !== "/toolkit") {
        window.history.pushState(null, "", "/toolkit");
      }
      document.title = "스마트 주거 자가진단 툴킷 | 하우징허브 인천";
    } else if (activeLegalTab) {
      const targetPath = `/${activeLegalTab}`;
      if (pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
      if (activeLegalTab === "privacy") {
        document.title = "개인정보처리방침 | 하우징허브 인천";
      } else if (activeLegalTab === "terms") {
        document.title = "서비스 이용약관 | 하우징허브 인천";
      } else if (activeLegalTab === "disclaimer") {
        document.title = "정보이용 면책고지 | 하우징허브 인천";
      } else if (activeLegalTab === "contact") {
        document.title = "1:1 안심 상담 및 문의 | 하우징허브 인천";
      } else if (activeLegalTab === "indexing") {
        document.title = "Google Indexing API 제어 | 하우징허브 인천";
      }
    } else {
      const subpages = ["/toolkit", "/privacy", "/terms", "/disclaimer", "/contact", "/partnership", "/indexing"];
      const isSubpage = subpages.includes(pathname) || pathname.startsWith("/post/");
      if (isSubpage) {
        window.history.pushState(null, "", "/");
      }
      document.title = "하우징허브 인천 | 실생활 청약, 임대, 전세대출 안심 정보 포털";
    }
  }, [activePost, showDiagnosticPage, activeLegalTab]);

  // 페이지 전환 시 스크롤 상단 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePost, activeLegalTab, showDiagnosticPage]);
  // --- Google Indexing API 관련 상태 ---
  const [isIndexingConfigured, setIsIndexingConfigured] = useState<boolean>(false);
  const [indexingClientEmail, setIndexingClientEmail] = useState<string>("");
  const [indexingHistory, setIndexingHistory] = useState<any[]>([]);
  const [credentialsText, setCredentialsText] = useState<string>("");
  const [isConfiguringLoading, setIsConfiguringLoading] = useState<boolean>(false);
  const [isSubmitUrlLoading, setIsSubmitUrlLoading] = useState<boolean>(false);
  const [indexingFeedbackMessage, setIndexingFeedbackMessage] = useState<string>("");
  const [customIndexingUrl, setCustomIndexingUrl] = useState<string>("");

  const fetchIndexingStatus = async () => {
    try {
      const res = await fetch("/api/indexing/status");
      if (res.ok) {
        const data = await res.json();
        setIsIndexingConfigured(data.isConfigured);
        setIndexingClientEmail(data.clientEmail || "");
        setIndexingHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch Indexing API status:", err);
    }
  };

  useEffect(() => {
    if (activeLegalTab === "indexing") {
      fetchIndexingStatus();
    }
  }, [activeLegalTab]);

  const handleSaveCredentials = async () => {
    if (!credentialsText.trim()) {
      alert("서비스 계정 JSON 내용을 입력해 주세요.");
      return;
    }
    setIsConfiguringLoading(true);
    setIndexingFeedbackMessage("");
    try {
      const res = await fetch("/api/indexing/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialsJson: credentialsText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "자격 증명 등록 실패");
      
      alert(data.message);
      setCredentialsText("");
      fetchIndexingStatus();
    } catch (err: any) {
      alert(err.message || "설정 저장 중 에러가 발생했습니다.");
    } finally {
      setIsConfiguringLoading(false);
    }
  };

  const handleDeleteCredentials = async () => {
    if (!confirm("정말 등록된 Google Indexing API 자격증명을 삭제하시겠습니까?")) return;
    setIsConfiguringLoading(true);
    try {
      const res = await fetch("/api/indexing/credentials", { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      fetchIndexingStatus();
    } catch (err: any) {
      alert(err.message || "설정 삭제 중 에러가 발생했습니다.");
    } finally {
      setIsConfiguringLoading(false);
    }
  };

  const handlePublishUrl = async (url: string, type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED") => {
    if (!url.trim()) {
      alert("색인요청을 보낼 URL을 지정해 주세요.");
      return;
    }
    setIsSubmitUrlLoading(true);
    setIndexingFeedbackMessage(`색인 전송 처리 중: ${url}`);
    try {
      const res = await fetch("/api/indexing/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type })
      });
      const data = await res.json();
      if (!res.ok) {
        setIndexingFeedbackMessage(`❌ 구글 호출 실패: ${data.details || data.error}`);
      } else {
        setIndexingFeedbackMessage(`✅ 구글 Indexing API 전송 성공!\nGoogle 메타에 즉각 반영되어 봇 크롤링이 우선 배정됩니다.\n응답 ID: ${data.log?.id || "성공"}`);
        setCustomIndexingUrl("");
      }
      fetchIndexingStatus();
    } catch (err: any) {
      setIndexingFeedbackMessage(`❌ 전송 실패: ${err.message}`);
    } finally {
      setIsSubmitUrlLoading(false);
    }
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
    const list = POSTS.filter(post => {
      if (!post) return false;
      const matchCategory = selectedCategory === "전체" || post.category === selectedCategory;
      const matchTag = !selectedTag || (post.hashtags && post.hashtags.includes(selectedTag));
      const matchSearch = !searchTerm || 
        (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.hashtags && post.hashtags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchCategory && matchTag && matchSearch;
    });
    // 최신 날짜 역순 기사 배치 (최신글 선두 배치 및 시각성 보장)
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
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
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => {
            setSelectedCategory("전체");
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
                <span className="text-blue-600 text-sm font-semibold bg-blue-50 px-2 py-0.5 rounded-md ml-1.5">인천</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Incheon Housing encyclopaedia</p>
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

      {/* 메인 허브 레이아웃 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activePost ? (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            {/* 상단 브레드크럼 / 뒤로가기 버튼 */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <button 
                onClick={() => setActivePost(null)}
                className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>메인 가이드 목록으로 돌아가기</span>
              </button>
              <div className="text-[11px] font-mono text-slate-400">
                현재 위치: 하우징허브 &gt; {activePost.category}
              </div>
            </div>

            {/* 메인 이미지 헤더 */}
            <div className="relative h-64 sm:h-96 bg-slate-100 flex-shrink-0">
              <img 
                src={activePost.image} 
                alt={activePost.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white space-y-3">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {activePost.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight max-w-4xl text-white">
                  {activePost.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-300 text-xs font-mono">
                  <span>작성일자: {activePost.date}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>필진: {activePost.author}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {activePost.readTime}
                  </span>
                </div>
              </div>
            </div>

            {/* 본문 에어리어 */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* 퀵 챗 연계 배너 */}
              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">이 아티클의 맞춤형 실전 조언이 더 필요하신가요?</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">하우징허브 AI 주거 비서에게 실시간으로 기사 내용에 대해 더 깊이 물어보세요.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const askText = `방금 열람한 '${activePost.title}' 관련해서 자격요건이나 꿀팁을 인천 입지에 맞춰 더 깊이 조언해줘!`;
                    setIsChatOpen(true);
                    handleQuickQuestion(askText);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm whitespace-nowrap cursor-pointer"
                >
                  <span>AI 조언 구하기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 실제 정밀 본문 */}
              <div 
                className="article-rich-content text-slate-800 text-sm sm:text-base leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: activePost.content }}
              />

              {/* 해시태그 목록 */}
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100/80 pt-6">
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
                    alert("하우징허브 인천 주소지가 클립보드에 복사되었습니다! 소중한 분들에게 안심 정보를 나누어 보세요.");
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 text-xs font-semibold px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>안심 가이드 공유</span>
                </button>
                <button
                  onClick={() => setActivePost(null)}
                  className="flex-1 sm:flex-initial py-3 px-5 text-xs font-bold transition-all text-slate-700 hover:bg-slate-200 border border-slate-200 bg-white rounded-xl"
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
                🎯 청약 가점(84만점) 판정
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
              <button
                onClick={() => { setActiveLegalTab("indexing"); setIsContactSubmitted(false); }}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold transition-all rounded-lg flex items-center justify-center space-x-1.5 ${
                  activeLegalTab === "indexing" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                🚀 구글 색인 대행 (SEO API)
              </button>
            </div>

            {/* 본문 콘텐츠 스크롤 및 탭 렌더링 */}
            <div className="p-6 sm:p-10 space-y-6 bg-slate-50/50 min-h-[400px]">
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
                    <h4 className="text-base font-bold text-slate-900">1:1 지원 정책 및 소통 센터 (Contact Desktop)</h4>
                    <p className="text-xs text-slate-400 mt-1">구글 퍼블리셔 정책 조항을 준수하여 활성화된 공식 이용자 건의 채널입니다.</p>
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

              {activeLegalTab === "indexing" && (
                <div className="space-y-8 text-left font-sans">
                  {/* 헤더 섹션 */}
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">C안 가동안</span>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900">Google Indexing API 기동 및 전용 검색색인 제어 센터</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      구글 서치콘솔 수동 등록 지연 시, 구글 Indexing API 연동을 즉각 실행하여 포커싱 글 발행 즉시 크롤러 봇이 패치해가도록 자동화하는 실전 시스템입니다.
                    </p>
                  </div>

                  {/* 전략 가이드 브리핑 */}
                  <div className="bg-blue-900 text-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
                    <div className="flex items-center space-x-2.5">
                      <TrendingUp className="w-5 h-5 text-blue-300" />
                      <h5 className="font-bold text-sm sm:text-base">구글 애드센스 승인 및 순위 선점 '선택과 집중' 전략 기획</h5>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      네 개 필터드 사이트 심사가 동치 지연되거나 전면 반려될 조짐이 있을 시, 가장 완성도가 높고 기획 완성도가 고도화된 <strong>주력 단일 사이트(예: zip9.kr 및 nutube.kr) 한 곳에 리소스와 트래픽을 100% 올인 집중</strong>하는 전략으로 즉각 선회하십시오. 단 한 사이트만 최종 관문(애드센스 고시)을 뚫어내면, 나머지 보조 영역들은 '하위 도메인(Subdomain) 연결' 기법을 태워 전방위 무검토 전면 승인으로 끌어올릴 수 있어 고도 성장이 편리합니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 크리덴셜 입력 창 */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">1</span>
                          <h6 className="font-bold text-xs text-slate-800">구글 서비스 계정 키값(JSON) 등록</h6>
                        </div>
                        {isIndexingConfigured ? (
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md font-bold">● 연결됨</span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md font-bold">● 연결되지 않음</span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        Google Cloud Console에서 서비스 계정을 발급받은 뒤, <strong className="text-slate-700">Indexing API 권한 활성화 및 소유권 확인</strong> 조치를 완료하고 다운로드 받으신 비공개 키 JSON 텍스트 전문을 아래에 그대로 기입해 주십시오. (보관은 서버측 별도 안심 계정에 격리 보관됩니다)
                      </p>

                      {isIndexingConfigured && (
                        <div className="bg-slate-50 p-2.5 rounded-lg text-slate-600 text-[10px] font-mono border border-slate-150 space-y-1">
                          <p className="font-semibold text-slate-700">✓ 등록된 서비스 계정 이메일:</p>
                          <p className="overflow-x-auto select-all">{indexingClientEmail || "분석 완료"}</p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <textarea
                          placeholder='{"type": "service_account", "project_id": ...}'
                          rows={6}
                          value={credentialsText}
                          onChange={(e) => setCredentialsText(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white leading-normal font-sans"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveCredentials}
                          disabled={isConfiguringLoading}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer"
                        >
                          {isConfiguringLoading ? "설정 저장 중..." : "자격 증명 저장"}
                        </button>
                        {isIndexingConfigured && (
                          <button
                            onClick={handleDeleteCredentials}
                            disabled={isConfiguringLoading}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer"
                          >
                            자격 삭제
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 실시간 색인 요청 실행기 */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">2</span>
                        <h6 className="font-bold text-xs text-slate-800">실시간 검색색인 호출 실행기</h6>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        등록된 구글 API를 기동하여 특정 주소의 노출(색인 추가/업데이트) 또는 삭제를 요청합니다. 색인 상태 업데이트는 대개 수분에서 수시간 내 반영됩니다.
                      </p>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">색인 요청 대상 주소(URL)</label>
                        <input 
                          type="url"
                          placeholder="https://zip9.kr/article/1"
                          value={customIndexingUrl}
                          onChange={(e) => setCustomIndexingUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white font-sans"
                          disabled={!isIndexingConfigured}
                        />
                      </div>

                      {indexingFeedbackMessage && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 whitespace-pre-wrap font-mono">
                          {indexingFeedbackMessage}
                        </div>
                      )}

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handlePublishUrl(customIndexingUrl, "URL_UPDATED")}
                          disabled={isSubmitUrlLoading || !isIndexingConfigured}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>색인 추가/업데이트 요청</span>
                        </button>
                        <button
                          onClick={() => handlePublishUrl(customIndexingUrl, "URL_DELETED")}
                          disabled={isSubmitUrlLoading || !isIndexingConfigured}
                          className="bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-700 border border-slate-200 transition-colors font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer"
                        >
                          색인 삭제 요청
                        </button>
                      </div>

                      {/* 최근 색인 요청 기록 목록 */}
                      <div className="pt-2 space-y-2">
                        <h6 className="font-bold text-xs text-slate-800">최근 색인 실행 로그 (최대 5건)</h6>
                        {indexingHistory && indexingHistory.length === 0 ? (
                          <p className="text-[10px] text-slate-400">색인 요청 내역이 없습니다.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {indexingHistory && indexingHistory.map((item: any, idx: number) => (
                              <div key={idx} className="p-2 bg-slate-50/50 rounded-lg border border-slate-100 text-[10px] space-y-1">
                                <div className="flex justify-between text-[9px] text-slate-400">
                                  <span>{item.time || "방금 전"}</span>
                                  <span className="font-bold uppercase text-blue-600">{item.type}</span>
                                </div>
                                <p className="text-slate-700 font-mono truncate">{item.url}</p>
                                <p className={`text-[9px] ${item.status === "success" ? "text-green-600" : "text-red-500"}`}>
                                  {item.status === "success" ? "✓ 성공" : `✗ 실패: ${item.error || "알 수 없음"}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
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
                    onClick={() => setShowDiagnosticPage(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <Calculator className="w-4.5 h-4.5" />
                    <span>스마트 주거 자가진단 실행</span>
                  </button>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium px-5 py-3 rounded-xl transition-all flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <MessageSquare className="w-4.5 h-4.5 text-blue-400" />
                    <span>AI 컨설턴트 무료 대화</span>
                  </button>
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
                        <span>📚 지식백과 보도실</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">인천 시민과 유주택 예정자를 위한 하우징 전문가 기고문 66선</p>
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
                                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                                  <span>{post.date}</span>
                                  <span>•</span>
                                  <span className="flex items-center">
                                    <Clock className="w-3.5 h-3.5 mr-0.5" />
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
            </div>
          </>
        )}
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
                  <li>
                    <button 
                      onClick={() => { setActivePost(null); setActiveLegalTab("indexing"); }}
                      className="hover:text-blue-400 transition-colors cursor-pointer text-left focus:outline-none flex items-center space-x-1 font-semibold text-blue-300"
                    >
                      <span>🚀 구글 색인(SEO) 도구</span>
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


    </div>
  );
}
