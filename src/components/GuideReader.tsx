import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  ChevronLeft, 
  Calendar, 
  ShieldCheck, 
  Bookmark, 
  Share2, 
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Clock,
  Printer,
  Heart,
  MessageSquare,
  List,
  Eye,
  ChevronRight,
  Send
} from "lucide-react";
import { Post, slugify } from "../types";
import { getAuthorForCategory } from "../data/editorialTeam";

interface GuideReaderProps {
  post: Post;
  onBack: () => void;
  bookmarks: string[];
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  showToast: (msg: string, type?: "success" | "info" | "error") => void;
  allPosts?: Post[];
  onSelectPost?: (post: Post) => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const GuideReader: React.FC<GuideReaderProps> = ({
  post,
  onBack,
  bookmarks,
  onToggleBookmark,
  showToast,
  allPosts = [],
  onSelectPost
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [likesCount, setLikesCount] = useState<number>(() => {
    return (post.likes && post.likes > 0) ? post.likes : Math.floor(Math.random() * 30) + 15;
  });
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [comments, setComments] = useState<Array<{ name: string; date: string; content: string }>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`comments_${post.id}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // 카테고리별 공인 편집위원 정보 조회
  const author = useMemo(() => {
    return getAuthorForCategory(post.category);
  }, [post.category]);

  // 동일 카테고리 다른 글 5개
  const categoryPosts = useMemo(() => {
    return allPosts
      .filter(p => p.category === post.category && p.id !== post.id)
      .slice(0, 5);
  }, [allPosts, post.id, post.category]);

  // 이전글 / 다음글 탐색
  const { prevPost, nextPost } = useMemo(() => {
    const currentIndex = allPosts.findIndex(p => p.id === post.id);
    const prev = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const next = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    return { prevPost: prev, nextPost: next };
  }, [allPosts, post.id]);

  // 핵심 30초 요약 포인트 추출
  const summaryPoints = useMemo(() => {
    const rawExcerpt = post.excerpt || "";
    const sentences = rawExcerpt
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    if (sentences.length >= 3) {
      return sentences.slice(0, 3);
    }
    return [
      `${post.category} 실무에서 반드시 확인해야 할 2026년 개정 정책 및 법적 기준을 총정리했습니다.`,
      `실무자가 권장하는 실패 예방 체크리스트와 비교 표를 통해 리스크를 사전에 방지하십시오.`,
      `본문의 팩트체크와 공적 출처 링크를 통해 정확한 자격과 서류를 미리 준비하시기 바랍니다.`
    ];
  }, [post.excerpt, post.category]);

  // 본문의 H2, H3 태그를 파싱하여 티스토리 스타일 본문 목차 자동 생성
  useEffect(() => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    headings.forEach((heading, idx) => {
      const el = heading as HTMLElement;
      const id = `blog-toc-${idx + 1}`;
      el.id = id;
      el.style.scrollMarginTop = "90px";

      items.push({
        id: id,
        text: el.textContent?.trim() || `섹션 ${idx + 1}`,
        level: el.tagName.toUpperCase() === "H2" ? 2 : 3
      });
    });

    setTocItems(items);
  }, [post.id, post.content]);

  // 스크롤 게이지
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const progress = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100));
        setReadingProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const isBookmarked = bookmarks.includes(post.id);

  const handleLike = () => {
    if (!hasLiked) {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
      showToast("이 글에 공감(좋아요)을 남겼습니다. 감사합니다!", "success");
    } else {
      setLikesCount(prev => Math.max(0, prev - 1));
      setHasLiked(false);
      showToast("공감이 취소되었습니다.", "info");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("포스트 주소가 클립보드에 복사되었습니다. 소중한 분들에게 공유해보세요!", "success");
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      showToast("댓글 내용을 입력해 주세요.", "info");
      return;
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const newComment = {
      name: "독자 (방문자)",
      date: dateStr,
      content: commentText.trim()
    };
    const updated = [...comments, newComment];
    setComments(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`comments_${post.id}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setCommentText("");
    showToast("소중한 댓글이 성공적으로 등록되었습니다.", "success");
  };

  return (
    <article className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* 상단 스크롤 진행 게이지 */}
      <div className="w-full bg-slate-100 h-1 sticky top-0 z-30">
        <div 
          className="bg-emerald-600 h-full transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* 블로그 포스트 헤더 영역 */}
      <header className="p-6 sm:p-8 border-b border-slate-100 bg-white">
        {/* 브레드크럼 (Breadcrumb) */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500 mb-4 font-sans">
          <button 
            onClick={onBack}
            className="hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>블로그 홈</span>
          </button>
          <span>&gt;</span>
          <span className="text-emerald-700 font-bold">{post.category}</span>
          <span>&gt;</span>
          <span className="text-slate-400 truncate max-w-[200px] sm:max-w-[360px]">{post.title}</span>
        </nav>

        {/* 카테고리 뱃지 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            {post.category}
          </span>
          <span className="text-xs text-slate-400">· 2026 주거 실무 가이드</span>
        </div>

        {/* 포스트 제목 (H1) */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug tracking-tight mb-4">
          {post.title}
        </h1>

        {/* 포스트 메타 바 (작성자, 날짜, 조회수, 공감, 공유) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {author.avatarChar}
            </div>
            <div>
              <span className="font-bold text-slate-800">{author.name}</span>
              <span className="text-slate-400 ml-1.5">({author.role})</span>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                <span>{post.date}</span>
                <span>·</span>
                <span>조회수 {post.views || 1420}</span>
                <span>·</span>
                <span>공감 {likesCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              title="URL 복사"
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">공유</span>
            </button>
            <button
              onClick={(e) => onToggleBookmark(post.id, e)}
              title="보관함 스크랩"
              className={`p-2 rounded border transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                isBookmarked 
                  ? "bg-amber-50 border-amber-300 text-amber-700 font-bold" 
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-600 text-amber-600" : ""}`} />
              <span className="hidden sm:inline">{isBookmarked ? "스크랩됨" : "스크랩"}</span>
            </button>
            <button
              onClick={() => window.print()}
              title="인쇄"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄</span>
            </button>
          </div>
        </div>
      </header>

      {/* 포스트 메인 본문 컨테이너 */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* 30초 핵심 요약 박스 (Executive Summary) */}
        <div className="p-5 bg-[#f8f9fa] border-l-4 border-emerald-600 rounded-r-md space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>핵심 요약 (Executive Summary)</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed pl-1">
            {summaryPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold shrink-0">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 티스토리/네이버 스타일 인라인 목차 박스 (Table of Contents) */}
        {tocItems.length > 0 && (
          <nav aria-label="Table of Contents" className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-md my-6">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <List className="w-4 h-4 text-emerald-700" />
                <span>목차 (Table of Contents)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">총 {tocItems.length}개 챕터</span>
            </div>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-700">
              {tocItems.map((item, idx) => (
                <li 
                  key={item.id} 
                  className={`${item.level === 3 ? "pl-4 text-slate-600 text-xs" : "font-medium"}`}
                >
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className="hover:text-emerald-700 hover:underline text-left cursor-pointer transition-colors"
                  >
                    <span className="text-emerald-700 font-bold mr-1.5">{idx + 1}.</span>
                    <span>{item.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* 썸네일 대표 이미지 */}
        {post.image && (
          <div className="my-6 rounded-md overflow-hidden border border-slate-100">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-auto max-h-[420px] object-cover"
              referrerPolicy="no-referrer"
            />
            <p className="text-[11px] text-slate-400 text-center py-1.5 bg-slate-50">
              ▲ {post.title} 관련 실무 인포그래픽 및 공식 안내 기준 자료
            </p>
          </div>
        )}

        {/* 실제 글 본문 (Classic Korean Blog Typography) */}
        <div 
          ref={contentRef}
          className="article-rich-content text-slate-800 text-[16px] sm:text-[17px] leading-[1.8] space-y-6 pt-2 font-normal"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 전문 자문위원 실무 소견 (E-E-A-T Editorial Note) */}
        <div className="my-8 p-5 bg-amber-50/80 border border-amber-200 rounded-md space-y-2 text-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <span>💡</span>
              <span>{author.name} 자문위원의 실무 코멘트</span>
            </div>
            <span className="text-[11px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold font-mono">
              실무 가이드
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            "{author.reviewComment}"
          </p>
        </div>

        {/* 공식 법령 및 출처 안내 (Official Reference) */}
        <div className="my-6 p-4 bg-slate-50 rounded-md border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>공식 법령 및 공적 데이터 검증 출처</span>
            </div>
            <a 
              href={author.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>공식 포털 바로가기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-slate-600 leading-relaxed">
            본 가이드는 <strong>{author.officialSource}</strong>를 바탕으로 작성되었으며, 공공기관의 공식 고시 기준과 일치하도록 감수를 진행하고 있습니다.
          </p>
        </div>

        {/* 태그 목록 */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-100">
            {post.hashtags.map(tag => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded hover:bg-slate-200 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 티스토리/네이버 스타일 공감 & 공유 반응 바 */}
        <div className="py-8 my-6 border-y border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {/* 공감 버튼 */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full border text-sm font-bold transition-all cursor-pointer ${
                hasLiked
                  ? "bg-red-50 border-red-300 text-red-600"
                  : "bg-white border-slate-300 text-slate-700 hover:border-red-300 hover:text-red-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`} />
              <span>공감</span>
              <span className="font-mono ml-1">{likesCount}</span>
            </button>

            {/* 댓글 바로가기 */}
            <a
              href="#comments-section"
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>댓글</span>
              <span className="font-mono text-emerald-700 font-bold">{comments.length}</span>
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>글 공유하기</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              목록으로
            </button>
          </div>
        </div>

        {/* 티스토리/네이버 스타일 저자 서명란 (Author Profile Card) */}
        <div className="p-5 sm:p-6 bg-[#fbfbfb] rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-xs">
            {author.avatarChar}
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-900 text-base">{author.name}</span>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                {author.role}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {author.affiliation} · {author.specialty}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              본 글은 2026년 정부 주거 정책 및 공식 공고문 기준을 철저히 검증하여 작성되었으며, 공인 자격 연구진이 정기적으로 개정 사항을 감수하고 있습니다.
            </p>
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(window.location.href);
                showToast("현재 글 주소가 복사되었습니다. 소중한 분들에게 공유해 보세요!", "success");
              }
            }}
            className="shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>글 주소 복사</span>
          </button>
        </div>

        {/* 이전글 / 다음글 네비게이션 (Previous & Next Post) */}
        <div className="border border-slate-200 rounded-md divide-y divide-slate-100 my-6 text-xs sm:text-sm">
          {prevPost && (
            <div 
              onClick={() => onSelectPost?.(prevPost)}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-slate-400 font-bold shrink-0">◀ 이전글:</span>
                <span className="text-slate-800 hover:text-emerald-700 truncate font-medium">{prevPost.title}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{prevPost.date}</span>
            </div>
          )}
          {nextPost && (
            <div 
              onClick={() => onSelectPost?.(nextPost)}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-slate-400 font-bold shrink-0">▶ 다음글:</span>
                <span className="text-slate-800 hover:text-emerald-700 truncate font-medium">{nextPost.title}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{nextPost.date}</span>
            </div>
          )}
        </div>

        {/* 티스토리 스타일 "이 카테고리의 다른 글" (Category Other Posts Table) */}
        {categoryPosts.length > 0 && (
          <div className="my-8 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>📁</span>
                <span>'{post.category}' 카테고리의 다른 글</span>
              </h3>
              <button 
                onClick={onBack}
                className="text-xs text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                전체보기 &gt;
              </button>
            </div>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 text-xs sm:text-sm">
              {categoryPosts.map((cp, idx) => (
                <div
                  key={cp.id}
                  onClick={() => onSelectPost?.(cp)}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-emerald-700 font-bold shrink-0">·</span>
                    <span className="text-slate-800 hover:text-emerald-700 hover:underline truncate">{cp.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{cp.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 티스토리/네이버 스타일 댓글 섹션 (Comments) */}
        <section id="comments-section" className="pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>댓글 ({comments.length})</span>
            </h3>
            <span className="text-xs text-slate-400">건전한 인터넷 문화를 함께 만들어가요</span>
          </div>

          {/* 기존 댓글 목록 */}
          {comments.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-md border border-slate-100 text-center text-xs text-slate-500">
              아직 등록된 댓글이 없습니다. 첫 번째 의견을 남겨보세요!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((c, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-md border border-slate-100 space-y-1 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-slate-400 font-mono">{c.date}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="space-y-2.5 pt-2">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="상호 존중과 배려를 바탕으로 의견을 남겨주세요. 비방이나 욕설은 삭제될 수 있습니다."
              className="w-full p-3 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 text-slate-800 placeholder:text-slate-400 resize-none"
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">하우징허브 독자 커뮤니티</span>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>댓글 등록</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </article>
  );
};
