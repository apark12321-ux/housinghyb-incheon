/**
 * 빌드 후 각 페이지를 정적 HTML로 프리렌더링.
 * - index.html을 템플릿으로 사용해 page별로 메타태그·본문 일부·JSON-LD를 미리 박아넣음
 * - dist/post/{slug}/index.html, dist/about/index.html 등 생성
 * - Vercel rewrite로 사용자가 /post/slug 접속 시 이 파일을 받음
 * - JS는 그대로 로드되어 React가 hydration → 사용자 경험은 동일
 *
 * 목적: 크롤러(애드센스 봇, 네이버 등)가 JS 실행 없이도 본문 텍스트를 볼 수 있도록 함.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";
import { POSTS } from "../src/data/posts.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const SITE_URL = "https://zip9.kr";
const SITE_NAME = "하우징허브";
const DEFAULT_TITLE = "하우징허브 (HousingHub) | 2026 주거·청약·대출 실무 가이드";
const DEFAULT_DESCRIPTION = "신혼부부와 무주택자를 위한 청약 공고문 팩트체크, 전월세 대항력 및 안전 계약 가이드, 디딤돌·버팀목 대출 분석 실무 지식 포털입니다.";
const CATEGORIES = ["청약-분양", "전월세", "이사-인테리어", "대출-금융"];

function slugify(title) {
  if (!title) return "";
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_:\-\+·\.\?,\!\[\]\(\)"']/g, "-")
    .replace(/[^\w\uAC00-\uD7A3\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 본문 콘텐츠에서 렌더링되지 않는 마크다운 잔재를 정리.
 * 글에 실수로 ** 같은 마크다운 패턴이 들어가도 정적 HTML 출력 시
 * 그대로 노출되지 않도록 안전한 HTML로 자동 변환한다.
 * (utils.ts of sanitizeContent와 동일 로직)
 */
function sanitizeContent(content) {
  if (!content) return "";
  let html = content;
  // **굵게** → <strong>굵게</strong>
  html = html.replace(/\*\*([^\*\n]+?)\*\*/g, "<strong>$1</strong>");
  // __굵게__ → <strong>굵게</strong>
  html = html.replace(/__([^_\n]+?)__/g, "<strong>$1</strong>");
  // *기울임* → <em>기울임</em> (앞뒤가 공백/문장부호일 때만)
  html = html.replace(/(?:^|[\s\(])\*([^\*\n]+?)\*(?=[\s\.,;:\)\!\?]|$)/g, (match, text) => {
    const prefix = match.charAt(0) === "*" ? "" : match.charAt(0);
    return `${prefix}<em>${text}</em>`;
  });
  // _기울임_ → <em>기울임</em>
  html = html.replace(/(?:^|[\s\(])_([^_\n]+?)_(?=[\s\.,;:\)\!\?]|$)/g, (match, text) => {
    const prefix = match.charAt(0) === "_" ? "" : match.charAt(0);
    return `${prefix}<em>${text}</em>`;
  });
  // 짝 안 맞는 잔여 ** 또는 __ 제거 (안전망)
  html = html.replace(/\*\*/g, "");
  html = html.replace(/__/g, "");
  return html;
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const STOP_WORDS = new Set([
  "그리고", "하지만", "그러나", "따라서", "때문에", "통해", "위해", "대한",
  "있습니다", "합니다", "됩니다", "보는", "하는", "있는", "없는", "것을",
  "경우", "관련", "대해", "가장", "매우", "모든", "어떤", "이러한", "저러한",
  "방법", "기준", "내용", "정보", "확인", "필수", "주의", "포털", "제공",
  "가이드", "정리", "핵심", "분석", "리포트", "이유", "원인", "결과",
  "이것", "저것", "그것", "여기", "저기", "어디", "누구", "무엇", "어떻게",
  "이번", "오늘", "내일", "지금", "바로", "다시", "항상", "자주", "직접",
  "수", "등", "및", "더", "또", "잘", "못", "안", "점", "곳", "중", "후", "전"
]);

const DOMAIN_WEIGHT_MAP = {
  "청약": 5, "가점": 4, "특별공급": 4, "일반공급": 4, "무순위": 4, "줍줍": 4,
  "전세": 5, "월세": 4, "임대차": 4, "확정일자": 4, "전입신고": 4, "대항력": 5,
  "우선변제권": 5, "근저당": 4, "보증금": 4, "반환보증": 4, "HUG": 4, "HF": 4,
  "전세사기": 5, "깡통전세": 5, "등기부등본": 4, "특약": 4, "표준계약서": 3,
  "디딤돌대출": 5, "버팀목대출": 5, "신생아특례": 5, "보금자리론": 4, "주택담보대출": 5,
  "DSR": 5, "LTV": 4, "DTI": 4, "스트레스DSR": 5, "금리": 4, "중도상환수수료": 3,
  "이사": 4, "손없는날": 3, "인테리어": 4, "도배": 3, "장판": 3, "하자보수": 4,
  "양도소득세": 4, "취득세": 4, "종부세": 4, "재산세": 3, "비과세": 4,
  "분양가상한제": 4, "전매제한": 4, "실거주의무": 4, "재당첨제한": 4,
  "무주택자": 4, "생애최초": 4, "신혼부부": 4, "다자녀": 4, "노부모부양": 3
};

function extractTopKeywords({ title = "", excerpt = "", content = "", category = "", hashtags = [], maxCount = 10 }) {
  const scoreMap = new Map();

  if (Array.isArray(hashtags)) {
    hashtags.forEach((tag) => {
      const cleanTag = tag.replace(/^#/, "").trim();
      if (cleanTag.length >= 2 && !STOP_WORDS.has(cleanTag)) {
        scoreMap.set(cleanTag, (scoreMap.get(cleanTag) || 0) + 12);
      }
    });
  }

  if (category) {
    const catWords = category.split(/[-\s,]+/);
    catWords.forEach((cw) => {
      if (cw.length >= 2 && !STOP_WORDS.has(cw)) {
        scoreMap.set(cw, (scoreMap.get(cw) || 0) + 8);
      }
    });
  }

  const cleanTitle = stripHtml(title);
  cleanTitle.split(/\s+/).forEach((w) => {
    if (w.length >= 2 && !STOP_WORDS.has(w)) {
      scoreMap.set(w, (scoreMap.get(w) || 0) + 6);
    }
  });

  const fullBody = stripHtml(`${excerpt} ${content}`);
  for (const [dictWord, weight] of Object.entries(DOMAIN_WEIGHT_MAP)) {
    const regex = new RegExp(dictWord, "gi");
    const matches = fullBody.match(regex);
    if (matches && matches.length > 0) {
      const freqScore = Math.min(matches.length, 10) * 1.5;
      scoreMap.set(dictWord, (scoreMap.get(dictWord) || 0) + weight * 2 + freqScore);
    }
  }

  const words = fullBody.split(/\s+/);
  for (const w of words) {
    if (w.length < 2 || w.length > 12) continue;
    if (STOP_WORDS.has(w)) continue;
    if (/^\d+$/.test(w)) continue;
    scoreMap.set(w, (scoreMap.get(w) || 0) + 1);
  }

  const sorted = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword);

  const uniqueKeywords = [];
  for (const kw of sorted) {
    if (!uniqueKeywords.includes(kw)) {
      uniqueKeywords.push(kw);
    }
    if (uniqueKeywords.length >= maxCount) break;
  }

  const defaultFallback = [
    "하우징허브", "주택청약", "전월세계약", "전세보증금", "디딤돌대출",
    "버팀목대출", "DSR계산", "확정일자", "주거정책", "내집마련"
  ];
  for (const fb of defaultFallback) {
    if (uniqueKeywords.length >= maxCount) break;
    if (!uniqueKeywords.includes(fb)) {
      uniqueKeywords.push(fb);
    }
  }

  return uniqueKeywords.slice(0, maxCount);
}

/**
 * POSTS를 반환합니다. (기본 POSTS + auto-posts.json 병합)
 */
function loadPosts() {
  try {
    const autoPath = resolve(ROOT, "src", "data", "auto-posts.json");
    if (existsSync(autoPath)) {
      const raw = readFileSync(autoPath, "utf-8");
      const autoPosts = JSON.parse(raw);
      if (Array.isArray(autoPosts) && autoPosts.length > 0) {
        return [...autoPosts, ...POSTS];
      }
    }
  } catch (e) {
    console.warn("Failed to load auto-posts for prerender:", e);
  }
  return POSTS;
}

/**
 * 정적 HTML 한 페이지를 만든다.
 * - template: dist/index.html 원본
 * - meta: { title, description, canonical, ogImage, ogType }
 * - bodyContent: <noscript>안에 들어갈 본문(크롤러용)
 * - jsonLd: 추가 JSON-LD 객체 또는 null
 */
function renderPage(template, meta, bodyContent, jsonLd) {
  let html = template;

  // <title>
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${htmlEscape(meta.title)}</title>`
  );

  // <meta name="description">
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${htmlEscape(meta.description)}" />`
  );

  // <meta name="keywords">
  if (meta.keywords && meta.keywords.length > 0) {
    const kwString = Array.isArray(meta.keywords) ? meta.keywords.join(", ") : meta.keywords;
    if (html.includes('name="keywords"')) {
      html = html.replace(
        /<meta name="keywords" content="[^"]*"\s*\/?>/,
        `<meta name="keywords" content="${htmlEscape(kwString)}" />`
      );
    } else {
      html = html.replace(
        /<meta name="description"[^>]*\/?>/,
        (match) => `${match}\n    <meta name="keywords" content="${htmlEscape(kwString)}" />`
      );
    }
  }

  // <link rel="canonical">
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${htmlEscape(meta.canonical)}" />`
  );

  // OG meta들 (간단 치환)
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${htmlEscape(meta.title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${htmlEscape(meta.description)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${htmlEscape(meta.canonical)}" />`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${htmlEscape(meta.ogType || "website")}" />`
  );

  // og:image 추가 (게시물 페이지에만)
  if (meta.ogImage) {
    if (html.includes('property="og:image"')) {
      html = html.replace(
        /<meta property="og:image" content="[^"]*"\s*\/?>/,
        `<meta property="og:image" content="${htmlEscape(meta.ogImage)}" />`
      );
    } else {
      html = html.replace(
        /<meta property="og:url"[^>]*\/?>/,
        (match) =>
          `${match}\n    <meta property="og:image" content="${htmlEscape(meta.ogImage)}" />`
      );
    }
  }

  // Twitter
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${htmlEscape(meta.title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${htmlEscape(meta.description)}" />`
  );

  // JSON-LD 추가 (head 끝에)
  if (jsonLd) {
    const ld = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    html = html.replace("</head>", `${ld}\n  </head>`);
  }

  // Google Site Verification
  const siteVerificationToken = process.env.GOOGLE_SITE_VERIFICATION || "U1U64IvSTSjySxIRO1Sr598xGZz85FYPdKSSvo3B_BQ";
  if (siteVerificationToken) {
    const verTag = `<meta name="google-site-verification" content="${siteVerificationToken}" />`;
    html = html.replace("</head>", `  ${verTag}\n  </head>`);
  }

  // <div id="root"></div>에 정적 본문 prerendered 콘텐츠 주입.
  // React가 hydration할 때 이 내용은 root.innerHTML로 대체되므로 사용자 화면은 동일.
  // 크롤러는 JS 실행 없이 이 내용을 본다.
  if (bodyContent) {
    html = html.replace(
      /<div id="root"><\/div>/,
      `<div id="root"><div id="prerendered-content" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;">${bodyContent}</div></div>`
    );
  }

  return html;
}

/**
 * 게시물의 정적 본문 HTML (크롤러용).
 * 사용자에겐 보이지 않지만 크롤러가 읽을 수 있도록 head/main 구조로 작성.
 */
function buildPostBody(post) {
  const plainContent = sanitizeContent(post.content); // 마크다운 잔재 정리 후 사용
  const slug = slugify(post.title) || post.id;

  return `
    <article>
      <header>
        <nav aria-label="breadcrumb">
          <a href="/">홈</a> &gt; <a href="/category/${encodeURIComponent(post.category)}">${htmlEscape(post.category)}</a>
        </nav>
        <h1>${htmlEscape(post.title)}</h1>
        <p class="excerpt">${htmlEscape(post.excerpt)}</p>
        <p class="meta">
          <time datetime="${post.date}">게재일: ${post.date}</time> ·
          <span>분류: ${htmlEscape(post.category)}</span>
        </p>
        <img src="${htmlEscape(post.image)}" alt="${htmlEscape(post.title)}" />
      </header>
      <main>${plainContent}</main>
      <footer>
        <p>© 알고파트너스 · 하우징허브 (${SITE_NAME}) · 문의: apark12321@gmail.com</p>
      </footer>
    </article>
  `;
}

function buildCategoryBody(category, posts) {
  const list = posts
    .filter((p) => p.category === category)
    .map(
      (p) => `
        <li>
          <a href="/post/${encodeURIComponent(slugify(p.title) || p.id)}">
            <h2>${htmlEscape(p.title)}</h2>
            <p>${htmlEscape(p.excerpt)}</p>
            <time datetime="${p.date}">${p.date}</time>
          </a>
        </li>`
    )
    .join("");
  return `
    <main>
      <h1>${htmlEscape(category)} 정보</h1>
      <p>${htmlEscape(category)} 관련 주거 정보와 가이드를 모았습니다.</p>
      <ul>${list}</ul>
    </main>
  `;
}

function buildHomeBody(posts) {
  const recent = posts.slice(0, 10);
  const list = recent
    .map(
      (p) => `
        <li>
          <a href="/post/${encodeURIComponent(slugify(p.title) || p.id)}">
            <h2>${htmlEscape(p.title)}</h2>
            <p>${htmlEscape(p.excerpt)}</p>
            <span>${htmlEscape(p.category)}</span> · <time>${p.date}</time>
          </a>
        </li>`
    )
    .join("");
  return `
    <main>
      <h1>하우징허브</h1>
      <p>${DEFAULT_DESCRIPTION}</p>
      <h2>최근 게시물</h2>
      <ul>${list}</ul>
      <nav>
        <h2>카테고리</h2>
        <ul>
          ${CATEGORIES.map((c) => `<li><a href="/category/${encodeURIComponent(c)}">${htmlEscape(c)}</a></li>`).join("")}
        </ul>
      </nav>
    </main>
  `;
}

function buildStaticPageBody(title, body) {
  return `<main><h1>${htmlEscape(title)}</h1>${body}</main>`;
}

function articleJsonLd(post) {
  const slug = slugify(post.title) || post.id;
  const pageUrl = `${SITE_URL}/post/${encodeURIComponent(slug)}`;

  // 간단한 FAQ 추출기 (본문에서 h3나 h2 및 뒤따르는 p 태그를 파싱하여 FAQPage 스키마로 가공)
  const faqItems = [];
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

  const graph = [
    {
      "@type": "NewsArticle",
      "@id": `${pageUrl}#article`,
      "isPartOf": { "@type": "WebPage", "@id": pageUrl },
      "headline": post.title,
      "description": post.excerpt,
      "image": [post.image],
      "datePublished": post.date,
      "dateModified": post.date,
      "inLanguage": "ko-KR",
      "isAccessibleForFree": true,
      "articleSection": post.category,
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".direct-answer-box", "h1", ".excerpt"]
      },
      "author": {
        "@type": "Person",
        "name": "박 실장",
        "jobTitle": "부동산 금융 기획 총괄 및 주거 실무 리드",
        "url": `${SITE_URL}/about`,
        "description": "부동산 금융 데이터 분석 10년, 전월세 계약 및 청약·정책대출 현장 실무 800여 건 직접 수행"
      },
      "publisher": {
        "@type": "Organization",
        "name": "상상아트",
        "alternateName": SITE_NAME,
        "url": SITE_URL,
        "logo": { "@type": "ImageObject", "url": `${SITE_URL}/icon.svg` }
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": `${SITE_URL}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": post.category,
          "item": `${SITE_URL}/category/${encodeURIComponent(post.category)}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": pageUrl
        }
      ]
    }
  ];

  if (faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      "mainEntity": faqItems
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

function writeFile(p, content) {
  const dir = dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, content, "utf8");
}

function main() {
  const indexPath = join(DIST, "index.html");
  if (!existsSync(indexPath)) {
    console.error("[prerender] dist/index.html not found. Run vite build first.");
    process.exit(1);
  }
  const template = readFileSync(indexPath, "utf8");
  const posts = loadPosts();

  let count = 0;

  // 1) 홈
  const homeHtml = renderPage(
    template,
    {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: `${SITE_URL}/`,
      ogType: "website",
    },
    buildHomeBody(posts),
    null
  );
  writeFile(indexPath, homeHtml);
  count++;

  // 2) 정적 페이지들
  const staticPages = [
    {
      path: "toolkit/index.html",
      title: `스마트 주거 자가진단 툴킷 | ${SITE_NAME}`,
      desc: `인천 임차인 및 내집마련 수요자를 위한 실시간 LTV/DSR 대출한도 모의계산 및 청약 가점(84점 만점) 판정 통합 진단기.`,
      url: `${SITE_URL}/toolkit`,
      body: buildStaticPageBody(
        "하우징 통합 자가진단 툴킷",
        `<p>하우징허브 인천 안심 자가진단 툴킷 페이지입니다. 본 진단기는 LTV, DSR 역산 공식을 결합한 대출 한도 모의 연산과 청약 가점(84점 만점)의 세부 지표 판정을 동시 실행하여 사용자의 안심 주거 계획 수립을 입체적으로 돕습니다.</p>`
      ),
    },
    {
      path: "about/index.html",
      title: `하우징허브 소개 (About Us) & 기획자 박 실장 스토리 | ${SITE_NAME}`,
      desc: `부동산 금융 10년 차 실무자 박 실장과 리서치팀이 전하는 하우징허브(HousingHub)의 경험 기반 주거·청약·대출 운영 철학입니다.`,
      url: `${SITE_URL}/about`,
      body: buildStaticPageBody(
        `하우징허브 이야기와 운영 철학 (E-E-A-T)`,
        `<div class="about-us-container">
          <p><strong>하우징허브(HousingHub)</strong>는 신혼부부, 예비 청약자, 청년 및 무주택 실수요자를 위한 주거·청약·대출 정보 전문 미디어입니다. 본 포털은 <strong>상상아트(사업자등록번호: 272-14-01256)</strong>에서 운영합니다.</p>
          
          <h2>운영자 페르소나: 기획 총괄 박 실장</h2>
          <p>부동산 금융 데이터 분석 10년, 전월세 계약 및 청약·정책대출 현장 실무 800여 건을 직접 수행한 현장 실무자입니다. 복잡한 공고문 뒤에 숨은 함정과 현장 실패를 방지하기 위해 10년의 실무 경험과 피눈물 나는 시행착오를 있는 그대로 공유합니다.</p>

          <h2>하우징허브 3대 운영 원칙</h2>
          <ul>
            <li><strong>1. 경험 기반 팩트체크:</strong> 법조문 단순 나열이 아닌, 실제 계약 현장과 은행 창구에서 발생하는 변수와 부적격 사례를 직접 검증하여 전달합니다.</li>
            <li><strong>2. AI 상투적 어구 배제:</strong> 기계적인 서론과 뻔한 결론을 거부하고, 독자가 오늘 당장 실천할 수 있는 명확한 1개의 행동 지침(Action Item)을 제시합니다.</li>
            <li><strong>3. 상업적 독립성:</strong> 특정 분양 대행사나 대출 중개사의 청탁을 배제하고 오직 무주택 실수요자의 권익을 위해 운영됩니다.</li>
          </ul>

          <h2>데이터 출처 및 검증 체계</h2>
          <p>국토교통부, 한국부동산원 청약홈, 주택도시기금(HUG), 한국주택금융공사(HF), LH 등 공공 기관의 공식 배포 공고문 및 개정 시행령을 교차 대조하여 작성됩니다.</p>

          <h2>문의 및 제안</h2>
          <p>콘텐츠 문의 및 제보는 공식 이메일(apark12321@gmail.com)로 접수해 주시면 신속하게 검토 후 반영하겠습니다.</p>
        </div>`
      ),
    },
    {
      path: "privacy/index.html",
      title: `개인정보처리방침 (Privacy Policy) | ${SITE_NAME}`,
      desc: `${SITE_NAME}의 개인정보 보호 및 구글 애드센스 쿠키 운용 방침 안내입니다.`,
      url: `${SITE_URL}/privacy`,
      body: buildStaticPageBody(
        "개인정보처리방침 (Privacy Policy)",
        `<div class="privacy-container leading-relaxed space-y-4">
          <p><strong>발행처:</strong> 상상아트 (하우징허브 HousingHub) | <strong>책임 관리자:</strong> 박 실장 | <strong>문의:</strong> apark12321@gmail.com</p>
          
          <h3>1. 수집하는 개인정보 항목 및 이용 목적</h3>
          <p>${SITE_NAME}(https://zip9.kr)는 별도의 회원가입 없이 누구나 자유롭게 이용할 수 있는 열린 포털입니다. 서비스 개선 및 사이트 이용 통계 확인을 위해 브라우저 접속 기록(쿠키 등)이 생성될 수 있습니다.</p>
          
          <h3>2. 구글 애드센스(Google AdSense) 및 제3자 광고 쿠키 안내</h3>
          <p>본 사이트는 Google 등의 제3자 광고 사업자를 통해 웹사이트에 광고를 게재합니다.</p>
          <ul>
            <li>Google을 포함한 제3자 공급업체는 쿠키를 사용하여 사용자의 이전 방문 기록(본 웹사이트 또는 타 웹사이트)을 기반으로 맞춤형 광고를 게재합니다.</li>
            <li>Google의 광고 쿠키 사용으로 인해 Google 및 파트너는 사용자의 본 사이트 및 기타 인터넷 사이트 방문 기록을 바탕으로 적절한 광고를 게재할 수 있습니다.</li>
            <li>사용자는 <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google 광고 설정</a>에서 개인 맞춤 광고를 언제든지 사용 중지할 수 있습니다.</li>
          </ul>

          <h3>3. 쿠키 설정 및 거부 방법</h3>
          <p>사용자는 웹 브라우저 설정을 통해 쿠키 허용 여부를 지정하거나 저장을 거부할 수 있습니다.</p>

          <h3>4. 문의 창구</h3>
          <p>사이트 이용과 관련된 문의나 제안은 공식 이메일(apark12321@gmail.com)로 접수해 주시면 신속히 확인하여 답변드리겠습니다.</p>
        </div>`
      ),
    },
    {
      path: "terms/index.html",
      title: `이용약관 | ${SITE_NAME}`,
      desc: `${SITE_NAME} 서비스 이용에 관한 약관입니다.`,
      url: `${SITE_URL}/terms`,
      body: buildStaticPageBody(
        "서비스 이용약관 (Terms of Service)",
        `<div class="terms-container leading-relaxed space-y-4">
          <p><strong>운영 주체:</strong> 하우징허브 (HousingHub)</p>
          <h3>제 1 조 (목적)</h3>
          <p>본 약관은 알고파트너스가 운영하는 ${SITE_NAME}(https://zip9.kr)에서 무상으로 제공하는 부동산 정보, 자가진단 계산기, 주거 가이드라인 서비스의 이용 조건 및 절차를 규정합니다.</p>

          <h3>제 2 조 (저작권 및 지적재산권)</h3>
          <p>${SITE_NAME}가 직접 제작한 기사, 이미지, 수식 계산 모듈 등 모든 콘텐츠의 저작권은 알고파트너스에 귀속됩니다. 비영리 목적으로의 공유는 자유로우나, 무단 전재 및 무단 상업적 재배포는 금지됩니다.</p>

          <h3>제 3 조 (면책조항)</h3>
          <p>본 사이트의 모든 정보는 참고용 공익 정보이며, 개별 실제 부동산 계약이나 대출 실행 전 반드시 금융기관 및 공인중개사, 법률 전문가를 통해 최종 확인하시기 바랍니다.</p>
        </div>`
      ),
    },
    {
      path: "partnership/index.html",
      title: `제휴 및 비즈니스 문의 | ${SITE_NAME}`,
      desc: `${SITE_NAME}와 광고, 콘텐츠 협업, 파트너십 문의를 위한 안내 페이지입니다.`,
      url: `${SITE_URL}/partnership`,
      body: buildStaticPageBody(
        "제휴 및 비즈니스 문의",
        `<p>제휴, 광고, 콘텐츠 협업 문의는 apark12321@gmail.com으로 보내주시면 영업일 3일 이내 회신드립니다.</p>`
      ),
    },
    {
      path: "contact/index.html",
      title: `문의 및 독자 제보 | ${SITE_NAME}`,
      desc: `${SITE_NAME}에 전하는 주거 관련 문의 및 독자 의견 수렴 창구입니다.`,
      url: `${SITE_URL}/contact`,
      body: buildStaticPageBody(
        "독자 제보 및 문의하기",
        `<p>주거 관련 질문, 정정 요청, 제휴 제보는 공식 이메일 apark12321@gmail.com 또는 온라인 접수 창구를 이용해 주시기 바랍니다.</p>`
      ),
    },
    {
      path: "disclaimer/index.html",
      title: `면책 조항 및 법적 고지 | ${SITE_NAME}`,
      desc: `${SITE_NAME}가 제공하는 모든 콘텐츠는 법적·공식 공고 기준을 토대로 한 정보 제공용 자료입니다.`,
      url: `${SITE_URL}/disclaimer`,
      body: buildStaticPageBody(
        "면책 조항 (Disclaimer)",
        `<div class="disclaimer-container leading-relaxed space-y-4">
          <p>하우징허브가 제공하는 모든 주거·청약·대출 가이드는 국토교통부, 한국부동산원, 주택도시기금의 공식 발표 자료와 법령을 기초로 작성된 공익 정보입니다.</p>
          <p>개별 금융 대출 및 부동산 계약 실행 시에는 반드시 해당 시점의 최신 공고문과 금융기관 공식 심사 기준을 확인하시기 바랍니다.</p>
        </div>`
      ),
    },
    {
      path: "announcement/index.html",
      title: `공지사항 | ${SITE_NAME}`,
      desc: `${SITE_NAME}의 서비스 운영 관련 공지사항을 안내합니다.`,
      url: `${SITE_URL}/announcement`,
      body: buildStaticPageBody(
        "공지사항",
        `<p>${SITE_NAME} 운영 관련 공지사항을 안내합니다.</p>`
      ),
    },
    {
      path: "404.html",
      title: `페이지를 찾을 수 없습니다 | ${SITE_NAME}`,
      desc: `요청하신 페이지가 존재하지 않거나 이동되었습니다.`,
      url: `${SITE_URL}/404.html`,
      body: buildStaticPageBody(
        "404 - 페이지를 찾을 수 없습니다",
        `<div class="text-center py-10 space-y-4">
          <p class="text-lg font-bold">요청하신 주소가 올바르지 않거나 변경되었습니다.</p>
          <p>하우징허브 메인 홈으로 이동하여 최신 주거 지식을 확인하세요.</p>
          <a href="/" style="display:inline-block; margin-top:16px; padding:12px 24px; background:#1e293b; color:#fff; border-radius:12px; font-weight:bold; text-decoration:none;">하우징허브 메인 홈으로 이동</a>
        </div>`
      ),
    },
  ];

  for (const p of staticPages) {
    const html = renderPage(
      template,
      { title: p.title, description: p.desc, canonical: p.url, ogType: "website" },
      p.body,
      null
    );
    writeFile(join(DIST, p.path), html);
    count++;
  }

  // 3) 카테고리 페이지
  for (const cat of CATEGORIES) {
    const path = `category/${encodeURIComponent(cat)}/index.html`;
    const catKeywords = extractTopKeywords({
      title: `${cat} 정보`,
      category: cat,
      maxCount: 10
    });
    const html = renderPage(
      template,
      {
        title: `${cat} 정보 | ${SITE_NAME}`,
        description: `${cat} 관련 주거 정보와 가이드를 모았습니다.`,
        canonical: `${SITE_URL}/category/${encodeURIComponent(cat)}`,
        ogType: "website",
        keywords: catKeywords,
      },
      buildCategoryBody(cat, posts),
      null
    );
    writeFile(join(DIST, path), html);
    count++;
  }

  // 4) 게시물 페이지 (가장 중요)
  for (const post of posts) {
    const slug = slugify(post.title) || post.id;
    const path = `post/${slug}/index.html`;
    const postKeywords = extractTopKeywords({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      hashtags: post.hashtags,
      maxCount: 10
    });
    const html = renderPage(
      template,
      {
        title: `${post.title} | ${SITE_NAME}`,
        description: post.excerpt || stripHtml(sanitizeContent(post.content)).slice(0, 155),
        canonical: `${SITE_URL}/post/${encodeURIComponent(slug)}`,
        ogType: "article",
        ogImage: post.image,
        keywords: postKeywords,
      },
      buildPostBody(post),
      articleJsonLd(post)
    );
    writeFile(join(DIST, path), html);
    count++;
  }

  console.log(`[prerender] generated ${count} static HTML files (home + ${staticPages.length} static + ${CATEGORIES.length} categories + ${posts.length} posts)`);
}

main();
