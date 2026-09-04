import { Post, Category, slugify } from "../types";
import { POSTS } from "../data/posts";
import { extractTopSeoKeywords } from "../utils/seoKeywords";

export interface ServerSideMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  ogImage: string;
  keywords: string[];
  robots?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ServerSideProps {
  pageType: "home" | "post" | "category" | "subpage" | "toolkit" | "404" | "410";
  statusCode?: number;
  post: Post | null;
  category: string | null;
  subpage: string | null;
  meta: ServerSideMeta;
  breadcrumbs: BreadcrumbItem[];
  jsonLd: any;
  htmlBody: string;
  initialPosts: Post[];
  initialState: {
    selectedCategory: string;
    activePostId: string | null;
    activeLegalTab: string | null;
    showDiagnosticPage: boolean;
  };
}

const SITE_URL = "https://zip9.kr";
const SITE_NAME = "하우징허브";
const DEFAULT_TITLE = "하우징허브 (HousingHub) | 2026 실전 주택청약·전월세안심·주택금융 가이드";
const DEFAULT_DESCRIPTION = "신혼부부와 무주택자를 위한 청약 공고문 실무 분석, 전월세 대항력 및 안전 계약 가이드, 디딤돌·버팀목 대출 분석 실무 지식 포털입니다.";
const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800";
const CATEGORIES: Category[] = ["청약-분양", "전월세", "대출-금융", "이사-인테리어"];

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeContent(content: string): string {
  if (!content) return "";
  let html = content;
  html = html.replace(/\*\*([^\*\n]+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_\n]+?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*\*/g, "");
  html = html.replace(/__/g, "");
  return html;
}

function htmlEscape(s: any): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Builds FAQ Schema from Post Content
 */
function extractFaqSchema(post: Post, pageUrl: string) {
  const faqItems: any[] = [];
  const headingMatches = [...post.content.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gi)];
  const pMatches = [...post.content.matchAll(/<p[^>]*>(.*?)<\/p>/gi)];

  for (let i = 0; i < Math.min(headingMatches.length, 4); i++) {
    const qText = stripHtml(headingMatches[i][1]);
    const aText = pMatches[i] ? stripHtml(pMatches[i][1]) : post.excerpt;
    if (qText && aText && qText.length > 5) {
      faqItems.push({
        "@type": "Question",
        "name": qText,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": aText
        }
      });
    }
  }
  return faqItems;
}

/**
 * Core Data Fetching Mechanism (equivalent to Next.js getServerSideProps)
 * Fetches and resolves all dynamic content, metadata, structured schema, and initial state
 * on initial page load for fast SEO indexing and instantaneous client hydration.
 */
export function getServerSideProps(
  urlPath: string,
  query: Record<string, any> = {},
  customPosts?: Post[],
  overrideBaseUrl?: string
): ServerSideProps {
  const posts = customPosts && customPosts.length > 0 ? customPosts : POSTS;
  const baseUrl = overrideBaseUrl || SITE_URL;
  const cleanPath = (urlPath || "/").split("?")[0];

  // 1. Post Detail Page (/post/:slug or query ?post=)
  let targetPost: Post | null = null;
  if (cleanPath.startsWith("/post/")) {
    const rawSlug = decodeURIComponent(cleanPath.replace(/^\/post\//, "").replace(/\/$/, ""));
    targetPost = posts.find(
      p => p.id === rawSlug || p.title === rawSlug || slugify(p.title) === rawSlug
    ) || null;
  } else if (query.post) {
    const rawPost = decodeURIComponent(query.post as string);
    targetPost = posts.find(
      p => p.id === rawPost || p.title === rawPost || slugify(p.title) === rawPost
    ) || null;
  }

  if (targetPost) {
    const slug = slugify(targetPost.title) || targetPost.id;
    const pageUrl = `${baseUrl}/post/${encodeURIComponent(slug)}`;
    const keywords = extractTopSeoKeywords({
      title: targetPost.title,
      excerpt: targetPost.excerpt,
      content: targetPost.content,
      category: targetPost.category,
      hashtags: targetPost.hashtags,
      maxCount: 10
    });

    const faqItems = extractFaqSchema(targetPost, pageUrl);

    const jsonLdGraph: any[] = [
      {
        "@type": "NewsArticle",
        "@id": `${pageUrl}#article`,
        "isPartOf": { "@type": "WebPage", "@id": pageUrl },
        "headline": targetPost.title,
        "description": targetPost.excerpt,
        "image": [targetPost.image || DEFAULT_OG_IMAGE],
        "datePublished": targetPost.date,
        "dateModified": targetPost.date,
        "inLanguage": "ko-KR",
        "isAccessibleForFree": true,
        "articleSection": targetPost.category,
        "author": {
          "@type": "Person",
          "name": targetPost.author || "박 실장",
          "jobTitle": "부동산 금융 기획 총괄 및 주거 실무 리드",
          "url": `${baseUrl}/about`
        },
        "publisher": {
          "@type": "Organization",
          "name": "상상아트",
          "alternateName": SITE_NAME,
          "url": baseUrl,
          "logo": { "@type": "ImageObject", "url": `${baseUrl}/icon.svg` }
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": `${baseUrl}/` },
          { "@type": "ListItem", "position": 2, "name": targetPost.category, "item": `${baseUrl}/category/${encodeURIComponent(targetPost.category)}` },
          { "@type": "ListItem", "position": 3, "name": targetPost.title, "item": pageUrl }
        ]
      }
    ];

    if (faqItems.length > 0) {
      jsonLdGraph.push({
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        "mainEntity": faqItems
      });
    }

    const htmlBody = `
      <article class="prose max-w-4xl mx-auto py-8 px-4 font-sans text-slate-800">
        <header class="mb-8 border-b border-slate-200 pb-6">
          <nav aria-label="breadcrumb" class="text-sm text-slate-500 mb-3">
            <a href="/" class="hover:underline">홈</a> &gt; 
            <a href="/category/${encodeURIComponent(targetPost.category)}" class="hover:underline text-blue-600 font-medium">${htmlEscape(targetPost.category)}</a>
          </nav>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-4">${htmlEscape(targetPost.title)}</h1>
          <p class="text-base text-slate-600 leading-relaxed mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">${htmlEscape(targetPost.excerpt)}</p>
          <div class="flex items-center gap-4 text-xs sm:text-sm text-slate-500 font-mono">
            <time datetime="${targetPost.date}">발행일: ${targetPost.date}</time>
            <span>작성자: ${htmlEscape(targetPost.author || "박 실장")}</span>
            <span>분류: ${htmlEscape(targetPost.category)}</span>
            <span>읽는 시간: ${htmlEscape(targetPost.readTime || "5분")}</span>
          </div>
        </header>
        <div class="mb-6 rounded-2xl overflow-hidden shadow-sm">
          <img src="${htmlEscape(targetPost.image || DEFAULT_OG_IMAGE)}" alt="${htmlEscape(targetPost.title)}" class="w-full h-auto object-cover max-h-96" />
        </div>
        <main class="space-y-6 text-slate-800 leading-relaxed text-base">
          ${sanitizeContent(targetPost.content)}
        </main>
        <footer class="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <p>© 2026 하우징허브 (HousingHub) · 발행처: 상상아트 · 문의: apark12321@gmail.com</p>
        </footer>
      </article>
    `;

    return {
      pageType: "post",
      post: targetPost,
      category: targetPost.category,
      subpage: null,
      meta: {
        title: `${targetPost.title} | ${SITE_NAME}`,
        description: targetPost.excerpt || stripHtml(targetPost.content).slice(0, 155),
        canonical: pageUrl,
        ogType: "article",
        ogImage: targetPost.image || DEFAULT_OG_IMAGE,
        keywords
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: targetPost.category, url: `${baseUrl}/category/${encodeURIComponent(targetPost.category)}` },
        { name: targetPost.title, url: pageUrl }
      ],
      jsonLd: { "@context": "https://schema.org", "@graph": jsonLdGraph },
      htmlBody,
      initialPosts: posts,
      initialState: {
        selectedCategory: targetPost.category,
        activePostId: targetPost.id,
        activeLegalTab: null,
        showDiagnosticPage: false
      }
    };
  }

  // 1.5. Deleted or Non-existent Post Handling (/post/:slug 요청 중 게시글이 없는 경우)
  // 구글 서치콘솔 및 크롤러 색인 자동 삭제(De-indexing) 지원: HTTP 410 Gone / 404 Not Found 및 noindex 반환
  if (cleanPath.startsWith("/post/")) {
    const rawSlug = decodeURIComponent(cleanPath.replace(/^\/post\//, "").replace(/\/$/, ""));
    const pageUrl = `${baseUrl}/post/${encodeURIComponent(rawSlug)}`;
    const htmlBody = `
      <section class="max-w-3xl mx-auto py-16 px-4 text-center font-sans">
        <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold text-2xl">
          !
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">삭제되었거나 변경된 주거 가이드입니다</h1>
        <p class="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
          요청하신 게시글은 주거 정책 개정 및 최신 실무 가이드 통합으로 인해 영구 삭제(410 Gone)되었거나 주소가 변경되었습니다.<br/>
          하우징허브 메인 홈에서 2026년 최신 주택청약·전월세안심·주택금융 가이드를 확인해보세요.
        </p>
        <div class="flex justify-center gap-3">
          <a href="/" class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow hover:bg-blue-700 transition-colors">
            하우징허브 홈 바로가기
          </a>
          <a href="/category/청약-분양" class="px-5 py-2.5 bg-slate-100 text-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
            최신 청약 가이드 보기
          </a>
        </div>
      </section>
    `;

    return {
      pageType: "410",
      statusCode: 410,
      post: null,
      category: null,
      subpage: null,
      meta: {
        title: `삭제된 게시글 안내 (410 Gone) | ${SITE_NAME}`,
        description: "요청하신 게시글은 주거 정책 개정 및 최신 실무 가이드 통합으로 인해 영구 삭제되었습니다.",
        canonical: pageUrl,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        keywords: ["삭제된페이지", "하우징허브"],
        robots: "noindex, nofollow, noarchive"
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: "삭제된 안내", url: pageUrl }
      ],
      jsonLd: null,
      htmlBody,
      initialPosts: posts,
      initialState: {
        selectedCategory: "전체",
        activePostId: null,
        activeLegalTab: null,
        showDiagnosticPage: false
      }
    };
  }

  // 2. Category Page (/category/:name)
  if (cleanPath.startsWith("/category/")) {
    const rawCat = decodeURIComponent(cleanPath.replace(/^\/category\//, "").replace(/\/$/, ""));
    const matchedCategory = CATEGORIES.find(c => c === rawCat) || rawCat;
    const catPosts = posts.filter(p => p.category === matchedCategory);
    const catUrl = `${baseUrl}/category/${encodeURIComponent(matchedCategory)}`;

    let catDesc = `${matchedCategory} 관련 검증된 실무 주거 정보와 정책 가이드를 제공합니다.`;
    if (matchedCategory === "청약-분양") {
      catDesc = "최신 아파트 분양 일정, 특별공급 소득 요건, 청약 가점(84점) 계산 및 무순위 줍줍 실전 노하우를 제공합니다.";
    } else if (matchedCategory === "전월세") {
      catDesc = "전세보증금 반환보증 보험 가입 기준, 등기부등본 을구 근저당 분석 및 깡통전세 예방 특약 조항을 안내합니다.";
    } else if (matchedCategory === "대출-금융") {
      catDesc = "2026 신생아 특례대출, 디딤돌·버팀목 전세대출 한도, 스트레스 DSR 주택담보대출 이자 절감 전략을 총정리합니다.";
    } else if (matchedCategory === "이사-인테리어") {
      catDesc = "이사 당일 전입신고·확정일자 필수 절차, 포장이사 하자 예방 체크리스트 및 셀프 인테리어 가이드를 안내합니다.";
    }

    const catKeywords = extractTopSeoKeywords({
      title: `${matchedCategory} 가이드`,
      category: matchedCategory,
      maxCount: 10
    });

    const postItemsHtml = catPosts
      .map(
        p => `
        <li class="p-4 border border-slate-200 rounded-xl hover:border-blue-400 bg-white transition-all">
          <a href="/post/${encodeURIComponent(slugify(p.title) || p.id)}" class="block">
            <h2 class="text-lg font-bold text-slate-900 mb-2">${htmlEscape(p.title)}</h2>
            <p class="text-sm text-slate-600 line-clamp-2 mb-2">${htmlEscape(p.excerpt)}</p>
            <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <time datetime="${p.date}">${p.date}</time>
              <span>${htmlEscape(p.readTime || "5분")}</span>
            </div>
          </a>
        </li>`
      )
      .join("");

    const htmlBody = `
      <section class="max-w-4xl mx-auto py-8 px-4 font-sans">
        <header class="mb-8 border-b border-slate-200 pb-6">
          <nav aria-label="breadcrumb" class="text-sm text-slate-500 mb-3">
            <a href="/" class="hover:underline">홈</a> &gt; <span class="text-slate-900 font-semibold">${htmlEscape(matchedCategory)}</span>
          </nav>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">${htmlEscape(matchedCategory)} 가이드 & 칼럼</h1>
          <p class="text-sm sm:text-base text-slate-600">${htmlEscape(catDesc)}</p>
        </header>
        <main>
          <ul class="space-y-4">${postItemsHtml}</ul>
        </main>
      </section>
    `;

    return {
      pageType: "category",
      post: null,
      category: matchedCategory,
      subpage: null,
      meta: {
        title: `${matchedCategory} 실전 가이드 및 칼럼 | ${SITE_NAME}`,
        description: catDesc,
        canonical: catUrl,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        keywords: catKeywords
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: matchedCategory, url: catUrl }
      ],
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${matchedCategory} - ${SITE_NAME}`,
        "description": catDesc,
        "url": catUrl
      },
      htmlBody,
      initialPosts: posts,
      initialState: {
        selectedCategory: matchedCategory,
        activePostId: null,
        activeLegalTab: null,
        showDiagnosticPage: false
      }
    };
  }

  // 3. Toolkit Page (/toolkit)
  if (cleanPath === "/toolkit") {
    const toolkitUrl = `${baseUrl}/toolkit`;
    const htmlBody = `
      <section class="max-w-4xl mx-auto py-8 px-4 font-sans">
        <header class="mb-8">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">스마트 주거 자가진단 툴킷</h1>
          <p class="text-slate-600">LTV·DSR 대출한도 모의 계산 및 청약 가점(84점 만점) 지표 판정 시뮬레이터입니다.</p>
        </header>
        <main class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <p class="text-sm text-slate-700">본 툴킷은 소득 수준과 보유 부채, 부양가족 수 및 무주택 기간을 결합하여 실시간 대출 가능액과 청약 경쟁력을 즉시 판정합니다.</p>
        </main>
      </section>
    `;

    return {
      pageType: "toolkit",
      post: null,
      category: null,
      subpage: "toolkit",
      meta: {
        title: `스마트 주거 자가진단 툴킷 | ${SITE_NAME}`,
        description: "실시간 LTV/DSR 주택 대출한도 모의 계산기 및 주택청약 84점 만점 가점 자가진단기",
        canonical: toolkitUrl,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        keywords: ["주택대출계산기", "청약가점계산기", "DSR계산기", "LTV계산", "하우징허브"]
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: "자가진단 툴킷", url: toolkitUrl }
      ],
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": `스마트 주거 자가진단 툴킷 - ${SITE_NAME}`,
        "url": toolkitUrl,
        "applicationCategory": "FinanceApplication"
      },
      htmlBody,
      initialPosts: posts,
      initialState: {
        selectedCategory: "전체",
        activePostId: null,
        activeLegalTab: null,
        showDiagnosticPage: true
      }
    };
  }

  // 4. Subpages (/about, /privacy, /terms, /disclaimer, /announcement)
  const legalSubpages: Record<string, { title: string; desc: string; legalTab: "about" | "privacy" | "terms" | "disclaimer" }> = {
    "/about": {
      title: `하우징허브 이야기와 운영 철학 (About Us) | ${SITE_NAME}`,
      desc: "부동산 금융 10년 차 기획자 박 실장의 1인칭 실전 경험과 공식 공고문 기준 심층 분석 원칙 소개입니다.",
      legalTab: "about"
    },
    "/privacy": {
      title: `개인정보처리방침 (Privacy Policy) | ${SITE_NAME}`,
      desc: "하우징허브의 개인정보 처리 방침 및 구글 애드센스 제3자 쿠키 운용 고지 안내입니다.",
      legalTab: "privacy"
    },
    "/terms": {
      title: `서비스 이용약관 (Terms of Service) | ${SITE_NAME}`,
      desc: "하우징허브 포털의 무료 주거 정보 서비스 이용 약관 및 저작권 안내입니다.",
      legalTab: "terms"
    },
    "/disclaimer": {
      title: `면책 조항 및 법적 고지 (Disclaimer) | ${SITE_NAME}`,
      desc: "하우징허브가 제공하는 콘텐츠의 정보 제공 목적 및 금융·계약 시 면책 사항 고지입니다.",
      legalTab: "disclaimer"
    }
  };

  if (legalSubpages[cleanPath]) {
    const pageInfo = legalSubpages[cleanPath];
    const pageUrl = `${baseUrl}${cleanPath}`;
    const htmlBody = `
      <section class="max-w-4xl mx-auto py-8 px-4 font-sans">
        <header class="mb-6 border-b border-slate-200 pb-4">
          <nav aria-label="breadcrumb" class="text-sm text-slate-500 mb-2">
            <a href="/" class="hover:underline">홈</a> &gt; <span>${htmlEscape(pageInfo.title.split("|")[0].trim())}</span>
          </nav>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">${htmlEscape(pageInfo.title.split("|")[0].trim())}</h1>
        </header>
        <main class="prose max-w-none text-slate-800 leading-relaxed text-sm sm:text-base">
          <p>${htmlEscape(pageInfo.desc)}</p>
          <div class="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p><strong>운영 주체:</strong> 상상아트 (사업자등록번호: 272-14-01256)</p>
            <p><strong>책임 관리자:</strong> 박 실장 (Lead Editor)</p>
            <p><strong>공식 이메일:</strong> apark12321@gmail.com</p>
          </div>
        </main>
      </section>
    `;

    return {
      pageType: "subpage",
      post: null,
      category: null,
      subpage: pageInfo.legalTab,
      meta: {
        title: pageInfo.title,
        description: pageInfo.desc,
        canonical: pageUrl,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        keywords: ["하우징허브", "운영원칙", "개인정보처리방침", "이용약관"]
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: pageInfo.title.split("|")[0].trim(), url: pageUrl }
      ],
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pageInfo.title,
        "description": pageInfo.desc,
        "url": pageUrl
      },
      htmlBody,
      initialPosts: posts,
      initialState: {
        selectedCategory: "전체",
        activePostId: null,
        activeLegalTab: pageInfo.legalTab,
        showDiagnosticPage: false
      }
    };
  }

  // 5. Default: Home Page (/)
  const recentPosts = posts.slice(0, 12);
  const homePostsHtml = recentPosts
    .map(
      p => `
      <article class="p-5 border border-slate-200 rounded-2xl bg-white hover:shadow-md transition-all">
        <a href="/post/${encodeURIComponent(slugify(p.title) || p.id)}" class="block">
          <span class="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 mb-2">${htmlEscape(p.category)}</span>
          <h2 class="text-lg font-bold text-slate-900 mb-2 hover:text-blue-600 transition-colors">${htmlEscape(p.title)}</h2>
          <p class="text-sm text-slate-600 line-clamp-2 mb-3">${htmlEscape(p.excerpt)}</p>
          <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <time datetime="${p.date}">${p.date}</time>
            <span>작성자: ${htmlEscape(p.author || "박 실장")}</span>
          </div>
        </a>
      </article>`
    )
    .join("");

  const homeHtmlBody = `
    <div class="max-w-6xl mx-auto py-8 px-4 font-sans">
      <header class="mb-10 text-center sm:text-left border-b border-slate-200 pb-8">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">하우징허브 (HousingHub)</h1>
        <p class="text-base sm:text-lg text-slate-600 max-w-3xl">${DEFAULT_DESCRIPTION}</p>
        <div class="mt-6 flex flex-wrap gap-2">
          ${CATEGORIES.map(c => `<a href="/category/${encodeURIComponent(c)}" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-all">${htmlEscape(c)}</a>`).join("")}
        </div>
      </header>
      <main>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900">최신 추천 주거·금융 실무 칼럼</h2>
          <span class="text-xs text-slate-400 font-mono">총 ${posts.length}편의 심층 가이드</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${homePostsHtml}
        </div>
      </main>
      <footer class="mt-16 pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p><strong>상상아트</strong> · 사업자등록번호: 272-14-01256 · 책임관리자: 박 실장</p>
          <p>공식 이메일: apark12321@gmail.com · 소재지: 대한민국 서울특별시</p>
        </div>
        <div class="flex gap-4">
          <a href="/about" class="hover:underline">소개</a>
          <a href="/privacy" class="hover:underline">개인정보처리방침</a>
          <a href="/terms" class="hover:underline">이용약관</a>
          <a href="/disclaimer" class="hover:underline">면책고지</a>
        </div>
      </footer>
    </div>
  `;

  return {
    pageType: "home",
    post: null,
    category: "전체",
    subpage: null,
    meta: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: `${baseUrl}/`,
      ogType: "website",
      ogImage: DEFAULT_OG_IMAGE,
      keywords: ["주택청약", "청약가점계산기", "전세대출", "디딤돌대출", "버팀목대출", "하우징허브", "전세사기방지", "DSR계산기"]
    },
    breadcrumbs: [{ name: "홈", url: `${baseUrl}/` }],
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          "url": baseUrl,
          "name": SITE_NAME,
          "description": DEFAULT_DESCRIPTION,
          "inLanguage": "ko-KR"
        },
        {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
          "name": "상상아트",
          "alternateName": SITE_NAME,
          "url": baseUrl,
          "logo": `${baseUrl}/icon.svg`
        }
      ]
    },
    htmlBody: homeHtmlBody,
    initialPosts: posts,
    initialState: {
      selectedCategory: "전체",
      activePostId: null,
      activeLegalTab: null,
      showDiagnosticPage: false
    }
  };
}
