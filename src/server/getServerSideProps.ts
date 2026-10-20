import { ManualArticle, ALL_MANUAL_ARTICLES, getActiveManualArticles, getManualArticleBySlug, MANUAL_CATEGORY } from "../data/manual-articles";
import { slugify } from "../types";

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
  pageType: "home" | "post" | "category" | "subpage" | "404" | "410";
  statusCode?: number;
  article: ManualArticle | null;
  category: string | null;
  subpage: string | null;
  meta: ServerSideMeta;
  breadcrumbs: BreadcrumbItem[];
  jsonLd: any;
  htmlBody: string;
  initialArticles: ManualArticle[];
  initialState: {
    selectedCategory: string;
    activeArticleSlug: string | null;
    activeLegalTab: string | null;
  };
}

const SITE_URL = "https://zip9.kr";
const SITE_NAME = "하우징허브 (HousingHub)";
const DEFAULT_TITLE = "하우징허브 | 주거 생활 및 이사 홈케어 실무 매뉴얼";
const DEFAULT_DESCRIPTION = "이사 견적 비교, 공과금 정산, 입주 청소 순서, 대형 폐기물 배출 및 실내 설비 유지보수를 위한 주거 기술 표준 실무 매뉴얼 포털입니다.";
const DEFAULT_OG_IMAGE = "https://zip9.kr/og-image.png";

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlEscape(s: any): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getServerSideProps(
  urlPath: string,
  query: Record<string, any> = {},
  customArticles?: ManualArticle[],
  overrideBaseUrl?: string
): ServerSideProps {
  const baseUrl = overrideBaseUrl || SITE_URL;
  const cleanPath = (urlPath || "/").split("?")[0];
  const todayStr = new Date().toISOString().split("T")[0];
  const activeArticles = customArticles || getActiveManualArticles(todayStr);

  // 1. Article Detail Page (/post/:slug or /article/:slug or ?post=)
  let targetArticle: ManualArticle | null = null;
  if (cleanPath.startsWith("/post/") || cleanPath.startsWith("/article/")) {
    const rawSlug = decodeURIComponent(
      cleanPath.replace(/^\/(post|article)\//, "").replace(/\/$/, "")
    );
    targetArticle = activeArticles.find(
      a => a.slug === rawSlug || a.id === rawSlug || slugify(a.title) === rawSlug
    ) || null;

    // 만약 activeArticles에 없더라도 전체 30개 중 미래 예약 발행분인 경우 확인
    if (!targetArticle) {
      const scheduledOne = getManualArticleBySlug(rawSlug);
      if (scheduledOne && scheduledOne.publishedAt > todayStr) {
        // 예약 발행 대기 중인 문서 (공개 전 상태)
        targetArticle = null;
      }
    }
  } else if (query.post || query.article) {
    const rawSlug = decodeURIComponent((query.post || query.article) as string);
    targetArticle = activeArticles.find(
      a => a.slug === rawSlug || a.id === rawSlug || slugify(a.title) === rawSlug
    ) || null;
  }

  if (targetArticle) {
    const pageUrl = `${baseUrl}/post/${encodeURIComponent(targetArticle.slug)}`;
    const keywords = [
      "이사매뉴얼",
      "홈케어",
      "주거관리",
      "입주청소",
      "공과금정산",
      "폐기물배출",
      "하우징허브"
    ];

    const faqSchemaItems = targetArticle.faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }));

    const jsonLdGraph: any[] = [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        "isPartOf": { "@type": "WebPage", "@id": pageUrl },
        "headline": targetArticle.title,
        "description": targetArticle.summary.join(" "),
        "datePublished": targetArticle.publishedAt,
        "dateModified": targetArticle.date,
        "inLanguage": "ko-KR",
        "isAccessibleForFree": true,
        "articleSection": MANUAL_CATEGORY,
        "author": {
          "@type": "Organization",
          "name": targetArticle.author,
          "url": `${baseUrl}/about`
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "url": baseUrl
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": `${baseUrl}/` },
          { "@type": "ListItem", "position": 2, "name": MANUAL_CATEGORY, "item": `${baseUrl}/category/manual` },
          { "@type": "ListItem", "position": 3, "name": targetArticle.title, "item": pageUrl }
        ]
      }
    ];

    if (faqSchemaItems.length > 0) {
      jsonLdGraph.push({
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        "mainEntity": faqSchemaItems
      });
    }

    const summaryHtml = targetArticle.summary
      .map(line => `<li class="text-slate-800 leading-relaxed">${htmlEscape(line)}</li>`)
      .join("");

    const faqHtml = targetArticle.faq
      .map(
        f => `
        <div class="p-5 bg-slate-50 border border-slate-200 rounded-xl mb-4">
          <dt class="font-bold text-slate-900 text-base mb-2">Q. ${htmlEscape(f.q)}</dt>
          <dd class="text-slate-700 text-sm leading-relaxed">${htmlEscape(f.a)}</dd>
        </div>`
      )
      .join("");

    const htmlBody = `
      <div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors">
              ${SITE_NAME}
            </a>
            <nav class="flex items-center gap-6 text-sm font-medium">
              <a href="/" class="text-slate-300 hover:text-white transition-colors">홈</a>
              <a href="/category/manual" class="text-blue-400 font-semibold hover:text-blue-300 transition-colors">이사·홈케어 매뉴얼</a>
            </nav>
          </div>
        </header>

        <main class="max-w-4xl mx-auto py-10 px-4 sm:px-6">
          <article class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
            <nav aria-label="Breadcrumb" class="text-xs sm:text-sm text-slate-500 mb-4 flex items-center gap-2">
              <a href="/" class="hover:text-slate-800 hover:underline">홈</a>
              <span>/</span>
              <a href="/category/manual" class="text-blue-600 font-medium hover:underline">${MANUAL_CATEGORY}</a>
            </nav>

            <header class="mb-8 pb-6 border-b border-slate-200">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-snug tracking-tight mb-4">
                ${htmlEscape(targetArticle.title)}
              </h1>
              <div class="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 font-mono">
                <span>발행: ${targetArticle.publishedAt}</span>
                <span>·</span>
                <span>작성: ${htmlEscape(targetArticle.author)}</span>
                <span>·</span>
                <span>열람시간: ${htmlEscape(targetArticle.readTime)}</span>
              </div>
            </header>

            <section class="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-xl" aria-label="3줄 핵심 요약">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">실무 핵심 요약</h2>
              <ul class="space-y-2 list-disc list-inside text-sm sm:text-base">
                ${summaryHtml}
              </ul>
            </section>

            <section class="manual-content space-y-6 text-slate-800 text-base leading-relaxed">
              ${targetArticle.content}
            </section>

            <section class="mt-12 pt-8 border-t border-slate-200" aria-label="자주 묻는 질문 FAQ">
              <h2 class="text-xl font-bold text-slate-900 mb-6">자주 묻는 질문 (FAQ)</h2>
              <dl class="space-y-4">
                ${faqHtml}
              </dl>
            </section>

            <div class="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
              <a href="/category/manual" class="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                ← 매뉴얼 목록으로 돌아가기
              </a>
              <a href="/" class="text-sm text-blue-600 hover:underline">
                홈으로 이동
              </a>
            </div>
          </article>
        </main>

        <footer class="bg-white border-t border-slate-200 py-10 mt-16 text-slate-600 text-xs sm:text-sm">
          <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p class="font-bold text-slate-800">${SITE_NAME} · 주거환경기술연구팀</p>
              <p class="text-slate-500 mt-1">문의: apark12321@gmail.com · 평일 09:00~18:00</p>
              <p class="text-slate-400 text-xs mt-1">본 사이트는 쾌적한 주거 관리를 위한 순수 공익 실무 기술 매뉴얼을 제공합니다.</p>
            </div>
            <nav class="flex gap-4 font-medium">
              <a href="/about" class="hover:text-slate-900 hover:underline">사이트 소개</a>
              <a href="/contact" class="hover:text-slate-900 hover:underline">문의하기</a>
              <a href="/privacy" class="hover:text-slate-900 hover:underline">개인정보처리방침</a>
            </nav>
          </div>
        </footer>
      </div>
    `;

    return {
      pageType: "post",
      article: targetArticle,
      category: MANUAL_CATEGORY,
      subpage: null,
      meta: {
        title: `${targetArticle.title} | ${SITE_NAME}`,
        description: targetArticle.summary.join(" ").slice(0, 155),
        canonical: pageUrl,
        ogType: "article",
        ogImage: DEFAULT_OG_IMAGE,
        keywords
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: MANUAL_CATEGORY, url: `${baseUrl}/category/manual` },
        { name: targetArticle.title, url: pageUrl }
      ],
      jsonLd: { "@context": "https://schema.org", "@graph": jsonLdGraph },
      htmlBody,
      initialArticles: activeArticles,
      initialState: {
        selectedCategory: MANUAL_CATEGORY,
        activeArticleSlug: targetArticle.slug,
        activeLegalTab: null
      }
    };
  }

  // 2. Category Page (/category/manual or /category/:name)
  if (cleanPath.startsWith("/category/")) {
    const pageUrl = `${baseUrl}/category/manual`;
    const catItemsHtml = activeArticles
      .map(
        a => `
        <li class="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 transition-colors shadow-sm">
          <a href="/post/${encodeURIComponent(a.slug)}" class="block group">
            <div class="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
              <time datetime="${a.publishedAt}">${a.publishedAt}</time>
              <span>·</span>
              <span>${htmlEscape(a.author)}</span>
              <span>·</span>
              <span>${htmlEscape(a.readTime)}</span>
            </div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
              ${htmlEscape(a.title)}
            </h2>
            <p class="text-sm text-slate-600 leading-relaxed mb-3">
              ${htmlEscape(a.summary[0])}
            </p>
            <div class="inline-flex items-center text-xs font-semibold text-blue-600 group-hover:underline">
              전체 매뉴얼 전문 읽기 →
            </div>
          </a>
        </li>`
      )
      .join("");

    const htmlBody = `
      <div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors">
              ${SITE_NAME}
            </a>
            <nav class="flex items-center gap-6 text-sm font-medium">
              <a href="/" class="text-slate-300 hover:text-white transition-colors">홈</a>
              <a href="/category/manual" class="text-blue-400 font-semibold hover:text-blue-300 transition-colors">이사·홈케어 매뉴얼</a>
            </nav>
          </div>
        </header>

        <main class="max-w-5xl mx-auto py-10 px-4 sm:px-6">
          <header class="mb-8 border-b border-slate-200 pb-6">
            <nav aria-label="Breadcrumb" class="text-xs sm:text-sm text-slate-500 mb-3">
              <a href="/" class="hover:underline">홈</a> &gt; <span class="text-slate-800 font-semibold">${MANUAL_CATEGORY}</span>
            </nav>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">${MANUAL_CATEGORY}</h1>
            <p class="text-sm sm:text-base text-slate-600">포장이사 계약, 공과금 정산, 입주 청소, 폐기물 처리 및 주거 설비 유지보수 전반의 공학적 실무 매뉴얼 모음입니다.</p>
          </header>

          <section>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono text-slate-500">현재 공개된 정규 매뉴얼 ${activeArticles.length}편</span>
            </div>
            <ul class="space-y-4">
              ${catItemsHtml}
            </ul>
          </section>
        </main>

        <footer class="bg-white border-t border-slate-200 py-10 mt-16 text-slate-600 text-xs sm:text-sm">
          <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p class="font-bold text-slate-800">${SITE_NAME} · 주거환경기술연구팀</p>
              <p class="text-slate-500 mt-1">문의: apark12321@gmail.com · 평일 09:00~18:00</p>
            </div>
            <nav class="flex gap-4 font-medium">
              <a href="/about" class="hover:text-slate-900 hover:underline">사이트 소개</a>
              <a href="/contact" class="hover:text-slate-900 hover:underline">문의하기</a>
              <a href="/privacy" class="hover:text-slate-900 hover:underline">개인정보처리방침</a>
            </nav>
          </div>
        </footer>
      </div>
    `;

    return {
      pageType: "category",
      article: null,
      category: MANUAL_CATEGORY,
      subpage: null,
      meta: {
        title: `${MANUAL_CATEGORY} | ${SITE_NAME}`,
        description: "포장이사 계약, 공과금 정산, 입주 청소, 대형 폐기물 배출 및 실내 설비 유지관리 실무 매뉴얼 모음",
        canonical: pageUrl,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        keywords: ["이사매뉴얼", "홈케어", "입주청소", "주거환경", "하우징허브"]
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: MANUAL_CATEGORY, url: pageUrl }
      ],
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${MANUAL_CATEGORY} - ${SITE_NAME}`,
        "url": pageUrl
      },
      htmlBody,
      initialArticles: activeArticles,
      initialState: {
        selectedCategory: MANUAL_CATEGORY,
        activeArticleSlug: null,
        activeLegalTab: null
      }
    };
  }

  // 3. Subpages (/about, /contact, /privacy)
  if (cleanPath === "/about") {
    const pageUrl = `${baseUrl}/about`;
    const htmlBody = `
      <div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors">
              ${SITE_NAME}
            </a>
            <nav class="flex items-center gap-6 text-sm font-medium">
              <a href="/" class="text-slate-300 hover:text-white transition-colors">홈</a>
              <a href="/category/manual" class="text-slate-300 hover:text-white transition-colors">이사·홈케어 매뉴얼</a>
            </nav>
          </div>
        </header>

        <main class="max-w-3xl mx-auto py-12 px-4 sm:px-6">
          <article class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 pb-4 border-b border-slate-200">
              사이트 소개 (About Us)
            </h1>

            <section class="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
              <h2 class="text-lg font-bold text-slate-900">1. 운영 목적 및 설립 취지</h2>
              <p>
                하우징허브(HousingHub) 주거환경기술연구팀은 주택 입주와 이사 과정에서 발생하는 수많은 실무적 혼선과 경제적 손실을 예방하고, 누구나 쉽게 따라 할 수 있는 객관적이고 과학적인 주거 기술 매뉴얼을 보급하기 위해 설립되었습니다.
              </p>
              <p>
                주택 이사 견적 비교부터 공과금 정산, 입주 청소 약품 안전 사용법, 가전 및 가구 운반 역학, 대형 폐기물 적법 배출, 실내 결로 및 환기 설비 관리에 이르기까지 공인된 표준 시방서와 법령 규격을 기반으로 한 건조하고 전문적인 기술 지침만을 엄선하여 제공합니다.
              </p>
            </section>

            <section class="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
              <h2 class="text-lg font-bold text-slate-900">2. 편집 원칙 및 무상 제공 원칙</h2>
              <p>
                본 포털의 모든 콘텐츠는 상업적 특정 업체의 홍보나 후원을 일체 배제하며, 순수한 공익적 정보 제공을 목적으로 합니다. 독자가 현장에서 직관적으로 적용할 수 있도록 비교 표와 단계별 절차서, 자주 묻는 질문(FAQ) 형태로 구성되어 있습니다.
              </p>
            </section>

            <section class="space-y-3 pt-6 border-t border-slate-200 text-xs sm:text-sm text-slate-600 font-mono">
              <p><strong>운영 주체:</strong> 하우징허브 주거환경기술연구팀</p>
              <p><strong>공식 도메인:</strong> zip9.kr</p>
              <p><strong>문의 이메일:</strong> apark12321@gmail.com</p>
              <p><strong>호스팅 인프라:</strong> Google Cloud Platform</p>
            </section>
          </article>
        </main>

        <footer class="bg-white border-t border-slate-200 py-10 mt-16 text-slate-600 text-xs sm:text-sm">
          <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p class="font-bold text-slate-800">${SITE_NAME}</p>
              <p class="text-slate-500 mt-1">문의: apark12321@gmail.com</p>
            </div>
            <nav class="flex gap-4 font-medium">
              <a href="/about" class="text-blue-600 font-semibold">사이트 소개</a>
              <a href="/contact" class="hover:text-slate-900 hover:underline">문의하기</a>
              <a href="/privacy" class="hover:text-slate-900 hover:underline">개인정보처리방침</a>
            </nav>
          </div>
        </footer>
      </div>
    `;

    return {
      pageType: "subpage",
      article: null,
      category: null,
      subpage: "about",
      meta: {
        title: `사이트 소개 | ${SITE_NAME}`,
        description: "하우징허브 주거환경기술연구팀의 운영 목적, 편집 원칙 및 주거 기술 매뉴얼 소개입니다.",
        canonical: pageUrl,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        keywords: ["하우징허브", "소개", "주거환경기술연구팀"]
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: "사이트 소개", url: pageUrl }
      ],
      jsonLd: { "@context": "https://schema.org", "@type": "AboutPage", "name": "사이트 소개", "url": pageUrl },
      htmlBody,
      initialArticles: activeArticles,
      initialState: {
        selectedCategory: "전체",
        activeArticleSlug: null,
        activeLegalTab: "about"
      }
    };
  }

  if (cleanPath === "/contact") {
    const pageUrl = `${baseUrl}/contact`;
    const htmlBody = `
      <div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors">
              ${SITE_NAME}
            </a>
            <nav class="flex items-center gap-6 text-sm font-medium">
              <a href="/" class="text-slate-300 hover:text-white transition-colors">홈</a>
              <a href="/category/manual" class="text-slate-300 hover:text-white transition-colors">이사·홈케어 매뉴얼</a>
            </nav>
          </div>
        </header>

        <main class="max-w-3xl mx-auto py-12 px-4 sm:px-6">
          <article class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 pb-4 border-b border-slate-200">
              문의하기 (Contact Us)
            </h1>

            <section class="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
              <h2 class="text-lg font-bold text-slate-900">공식 연락처 및 접수 창구 안내</h2>
              <p>
                하우징허브는 독자 여러분의 소중한 의견과 기술적 피드백을 환영합니다. 게재된 매뉴얼 내용 중 개정된 법령이나 시방서 수치에 따른 수정 요청, 오탈자 제보, 기술적 자문 제안은 아래의 공식 전자우편으로 접수해 주시기 바랍니다.
              </p>
              <div class="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-sm">
                <p><strong>공식 문의 전자우편:</strong> <span class="text-blue-600 font-bold">apark12321@gmail.com</span></p>
                <p><strong>접수 대상:</strong> 콘텐츠 기술적 오류 제보, 정정 신청, 권리 침해 신고, 일반 문의</p>
                <p><strong>회신 기한:</strong> 접수일 기준 영업일 48시간 이내 전담 검수팀 검토 후 회신</p>
                <p><strong>운영 시간:</strong> 평일 09:00 ~ 18:00 (토·일요일 및 공휴일 휴무)</p>
              </div>
              <p class="text-xs text-slate-500">
                ※ 전송 오류나 개인정보 유출을 방지하기 위해 웹 폼 입력 방식 대신 이용자가 직접 사용하는 이메일 클라이언트에서 메일을 발송하는 단일 창구 방식을 적용하고 있습니다.
              </p>
            </section>
          </article>
        </main>

        <footer class="bg-white border-t border-slate-200 py-10 mt-16 text-slate-600 text-xs sm:text-sm">
          <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p class="font-bold text-slate-800">${SITE_NAME}</p>
              <p class="text-slate-500 mt-1">문의: apark12321@gmail.com</p>
            </div>
            <nav class="flex gap-4 font-medium">
              <a href="/about" class="hover:text-slate-900 hover:underline">사이트 소개</a>
              <a href="/contact" class="text-blue-600 font-semibold">문의하기</a>
              <a href="/privacy" class="hover:text-slate-900 hover:underline">개인정보처리방침</a>
            </nav>
          </div>
        </footer>
      </div>
    `;

    return {
      pageType: "subpage",
      article: null,
      category: null,
      subpage: "contact",
      meta: {
        title: `문의하기 | ${SITE_NAME}`,
        description: "하우징허브 공식 문의 및 콘텐츠 정정 요청 안내 이메일 접수 창구입니다.",
        canonical: pageUrl,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        keywords: ["문의하기", "하우징허브", "이메일접수"]
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: "문의하기", url: pageUrl }
      ],
      jsonLd: { "@context": "https://schema.org", "@type": "ContactPage", "name": "문의하기", "url": pageUrl },
      htmlBody,
      initialArticles: activeArticles,
      initialState: {
        selectedCategory: "전체",
        activeArticleSlug: null,
        activeLegalTab: "contact"
      }
    };
  }

  if (cleanPath === "/privacy") {
    const pageUrl = `${baseUrl}/privacy`;
    const htmlBody = `
      <div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors">
              ${SITE_NAME}
            </a>
            <nav class="flex items-center gap-6 text-sm font-medium">
              <a href="/" class="text-slate-300 hover:text-white transition-colors">홈</a>
              <a href="/category/manual" class="text-slate-300 hover:text-white transition-colors">이사·홈케어 매뉴얼</a>
            </nav>
          </div>
        </header>

        <main class="max-w-3xl mx-auto py-12 px-4 sm:px-6">
          <article class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 pb-4 border-b border-slate-200">
              개인정보처리방침 (Privacy Policy)
            </h1>

            <p class="text-slate-600">
              하우징허브(이하 '사이트')는 이용자의 개인정보를 중요시하며, '개인정보 보호법' 및 관련 법령을 준수합니다. 본 방침은 사이트가 어떠한 정보를 수집하고 어떻게 이용하며 쿠키를 어떻게 관리하는지 규정합니다.
            </p>

            <section class="space-y-3">
              <h2 class="text-lg font-bold text-slate-900">1. 수집하는 개인정보 항목 및 수집 방법</h2>
              <p>
                본 사이트는 별도의 회원가입 절차 없이 모든 콘텐츠를 자유롭게 열람할 수 있습니다. 단, 이용자가 전자우편(이메일)을 통해 문의를 제기하는 경우 원활한 상담 회신을 위해 이메일 주소 및 문의 내용이 수집될 수 있으며, 해당 정보는 상담 목적 달성 즉시 파기됩니다.
              </p>
            </section>

            <section class="space-y-3 p-5 bg-blue-50/50 border border-blue-200 rounded-xl">
              <h2 class="text-lg font-bold text-blue-950">2. Google 애드센스 광고 송출 및 제3자 쿠키(Cookie) 안내</h2>
              <p class="text-slate-700">
                본 웹사이트는 Google 및 공인 제3자 광고 사업자가 제공하는 광고 서비스인 <strong>Google AdSense</strong>를 통해 광고를 게재할 수 있습니다.
              </p>
              <ul class="list-disc list-inside space-y-2 text-slate-700 text-sm">
                <li>Google을 포함한 제3자 공급업체는 쿠키(Cookie)를 사용하여 사용자의 본 웹사이트 방문 기록 또는 다른 웹사이트 방문 기록을 기반으로 맞춤형 광고를 게재합니다.</li>
                <li>Google의 광고 쿠키 사용을 통해 Google과 파트너는 사용자의 본 사이트 및 인터넷의 다른 사이트 방문 기록을 바탕으로 관련성 높은 광고를 게재할 수 있습니다.</li>
              </ul>
            </section>

            <section class="space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <h2 class="text-lg font-bold text-slate-900">3. Google DART 쿠키 사용 및 옵트아웃(거부) 안내</h2>
              <p class="text-slate-700">
                Google은 파트너 웹사이트에 게재되는 광고를 통해 사용자 브라우저에 DART 쿠키를 저장할 수 있습니다. 사용자는 언제든지 맞춤 광고 게재를 위한 DART 쿠키 사용을 선택 해제(Opt-out)할 수 있습니다.
              </p>
              <p class="text-slate-700">
                맞춤형 광고 설정을 변경하거나 DART 쿠키 사용을 해제하고자 하는 경우, <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold underline">Google 광고 설정 페이지 (policies.google.com/technologies/ads)</a>를 방문하여 직접 설정을 변경하실 수 있습니다.
              </p>
            </section>

            <section class="space-y-3">
              <h2 class="text-lg font-bold text-slate-900">4. 웹 브라우저를 통한 쿠키 거부 및 삭제 권리</h2>
              <p class="text-slate-700">
                이용자는 언제든지 쿠키의 설치 및 저장을 거부하거나 삭제할 권리가 있습니다. 브라우저의 옵션 설정을 조정하여 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
              </p>
              <div class="p-4 bg-slate-100 rounded-lg text-xs sm:text-sm font-mono text-slate-600 space-y-1">
                <p><strong>Chrome 브라우저:</strong> 설정 > 개인정보 보호 및 보안 > 서드 파티 쿠키 > 서드 파티 쿠키 차단</p>
                <p><strong>Edge 브라우저:</strong> 설정 > 쿠키 및 사이트 권한 > 쿠키 및 사이트 데이터 관리 및 삭제</p>
                <p><strong>Safari 브라우저:</strong> 환경설정 > 개인정보 보호 > 모든 쿠키 차단</p>
              </div>
            </section>

            <section class="space-y-2 pt-6 border-t border-slate-200 text-xs sm:text-sm text-slate-500 font-mono">
              <p>공고일자: 2026년 10월 20일</p>
              <p>시행일자: 2026년 10월 20일</p>
              <p>개인정보 보호 책임자: 하우징허브 편집팀 (apark12321@gmail.com)</p>
            </section>
          </article>
        </main>

        <footer class="bg-white border-t border-slate-200 py-10 mt-16 text-slate-600 text-xs sm:text-sm">
          <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p class="font-bold text-slate-800">${SITE_NAME}</p>
              <p class="text-slate-500 mt-1">문의: apark12321@gmail.com</p>
            </div>
            <nav class="flex gap-4 font-medium">
              <a href="/about" class="hover:text-slate-900 hover:underline">사이트 소개</a>
              <a href="/contact" class="hover:text-slate-900 hover:underline">문의하기</a>
              <a href="/privacy" class="text-blue-600 font-semibold">개인정보처리방침</a>
            </nav>
          </div>
        </footer>
      </div>
    `;

    return {
      pageType: "subpage",
      article: null,
      category: null,
      subpage: "privacy",
      meta: {
        title: `개인정보처리방침 | ${SITE_NAME}`,
        description: "하우징허브 개인정보처리방침, Google AdSense 광고 송출 및 제3자 DART 쿠키 사용 고지 안내입니다.",
        canonical: pageUrl,
        ogType: "website",
        ogImage: DEFAULT_OG_IMAGE,
        keywords: ["개인정보처리방침", "구글애드센스쿠키", "DART쿠키", "하우징허브"]
      },
      breadcrumbs: [
        { name: "홈", url: `${baseUrl}/` },
        { name: "개인정보처리방침", url: pageUrl }
      ],
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", "name": "개인정보처리방침", "url": pageUrl },
      htmlBody,
      initialArticles: activeArticles,
      initialState: {
        selectedCategory: "전체",
        activeArticleSlug: null,
        activeLegalTab: "privacy"
      }
    };
  }

  // 4. Default: Home Page (/)
  const homeArticlesHtml = activeArticles
    .map(
      a => `
      <article class="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 transition-colors shadow-sm">
        <a href="/post/${encodeURIComponent(a.slug)}" class="block group">
          <div class="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <time datetime="${a.publishedAt}">${a.publishedAt}</time>
            <span>·</span>
            <span>${htmlEscape(a.author)}</span>
            <span>·</span>
            <span>${htmlEscape(a.readTime)}</span>
          </div>
          <h2 class="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
            ${htmlEscape(a.title)}
          </h2>
          <p class="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-2">
            ${htmlEscape(a.summary[0])}
          </p>
          <div class="inline-flex items-center text-xs font-semibold text-blue-600 group-hover:underline">
            매뉴얼 전문 열람 →
          </div>
        </a>
      </article>`
    )
    .join("");

  const homeHtmlBody = `
    <div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" class="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors">
            ${SITE_NAME}
          </a>
          <nav class="flex items-center gap-6 text-sm font-medium">
            <a href="/" class="text-blue-400 font-semibold hover:text-blue-300 transition-colors">홈</a>
            <a href="/category/manual" class="text-slate-300 hover:text-white transition-colors">이사·홈케어 매뉴얼</a>
          </nav>
        </div>
      </header>

      <main class="max-w-5xl mx-auto py-10 px-4 sm:px-6">
        <header class="mb-10 text-center sm:text-left border-b border-slate-200 pb-8">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            ${SITE_NAME}
          </h1>
          <p class="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            ${DEFAULT_DESCRIPTION}
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="/category/manual" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors">
              ${MANUAL_CATEGORY} 전체 보기
            </a>
            <a href="/about" class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium rounded-lg transition-colors">
              연구팀 소개
            </a>
          </div>
        </header>

        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900">최신 발행 주거 기술 매뉴얼</h2>
            <span class="text-xs font-mono text-slate-400">총 ${activeArticles.length}편 정규 공개</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${homeArticlesHtml}
          </div>
        </section>
      </main>

      <footer class="bg-white border-t border-slate-200 py-10 mt-16 text-slate-600 text-xs sm:text-sm">
        <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p class="font-bold text-slate-800">${SITE_NAME} · 주거환경기술연구팀</p>
            <p class="text-slate-500 mt-1">문의: apark12321@gmail.com · 평일 09:00~18:00</p>
            <p class="text-slate-400 text-xs mt-1">본 사이트는 건축 설비 및 이사 실무에 관한 객관적 표준 매뉴얼을 무료로 제공합니다.</p>
          </div>
          <nav class="flex gap-4 font-medium">
            <a href="/about" class="hover:text-slate-900 hover:underline">사이트 소개</a>
            <a href="/contact" class="hover:text-slate-900 hover:underline">문의하기</a>
            <a href="/privacy" class="hover:text-slate-900 hover:underline">개인정보처리방침</a>
          </nav>
        </div>
      </footer>
    </div>
  `;

  return {
    pageType: "home",
    article: null,
    category: "전체",
    subpage: null,
    meta: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: `${baseUrl}/`,
      ogType: "website",
      ogImage: DEFAULT_OG_IMAGE,
      keywords: ["이사매뉴얼", "홈케어", "입주청소", "공과금정산", "하우징허브"]
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
          "name": SITE_NAME,
          "url": baseUrl
        }
      ]
    },
    htmlBody: homeHtmlBody,
    initialArticles: activeArticles,
    initialState: {
      selectedCategory: "전체",
      activeArticleSlug: null,
      activeLegalTab: null
    }
  };
}
