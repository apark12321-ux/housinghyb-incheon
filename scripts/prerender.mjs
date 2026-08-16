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
const DEFAULT_TITLE = "하우징허브 - 대한민국 최고의 부동산 & 주거 정보 가이드";
const DEFAULT_DESCRIPTION = "청약 정보, 전월세 계약 팁, 담보대출 가이드 등 실용적인 주거 정보를 제공하는 하우징허브입니다.";
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
          <span>작성자: ${htmlEscape(post.author)}</span> ·
          <time datetime="${post.date}">게재일: ${post.date}</time> ·
          <span>분류: ${htmlEscape(post.category)}</span>
        </p>
        <img src="${htmlEscape(post.image)}" alt="${htmlEscape(post.title)}" />
      </header>
      <main>${plainContent}</main>
      <footer>
        <p>© 알고파트너스 · 운영: ${SITE_NAME} 편집팀 · 문의: apark12321@gmail.com</p>
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
        "name": post.author,
        "jobTitle": "주거정책 수석 연구원",
        "worksFor": { "@type": "Organization", "name": "알고파트너스" }
      },
      "publisher": {
        "@type": "Organization",
        "name": "알고파트너스",
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
      title: `하우징허브 소개 및 E-E-A-T 편집·발행 신뢰 선언 | ${SITE_NAME}`,
      desc: `${SITE_NAME}는 무주택자, 생애 최초 청약자, 전월세 임차인의 보증금 보호와 내 집 마련을 위한 공익성 주거 지식 전문 포털입니다.`,
      url: `${SITE_URL}/about`,
      body: buildStaticPageBody(
        `${SITE_NAME} 소개 및 E-E-A-T 신뢰 정책`,
        `<div class="about-us-container">
          <p><strong>하우징허브(HousingHub)</strong>는 무주택 가구, 생애 최초 주택 마련 수요자, 그리고 전월세 임차인의 소중한 권리와 보증금 자산을 투명하게 사수하고 정보 비대칭을 영구적으로 제거하기 위해 설립된 <strong>비영리 공익성 종합 주거 지식 전문 포털</strong>입니다. 당사는 독자들이 복잡하고 이해하기 어려운 정부 주거 복지 정책, 세금 규율, 그리고 시중 적격 금융 대출 상품 지표에 대하여 누구나 즉각적이고 명확하게 인지하고 자가진단을 완비할 수 있도록 최우선 가치를 두고 있습니다.</p>
          
          <h2>E-E-A-T (경험·전문성·권위성·신뢰성) 콘텐츠 제작 지침</h2>
          <p>하우징허브 인천 미디어의 모든 보도물 및 칼럼 지식은 단순 짜깁기식 AI 생성이나 스크랩을 철저히 배격하며, 구글이 보장하는 최고의 검색 품질 기준인 E-E-A-T 원칙에 부합하도록 엄격히 기획, 검증 및 최종 배포하고 있습니다.</p>
          <ul>
            <li><strong>공식 유관 출처 대조 (Accuracy):</strong> 국토교통부, 한국토지주택공사(LH), 주택도시보증공사(HUG), 서울주택도시공사(SH), 대법원 인터넷등기소 등 공식 공공 입법 규제안과 모집 보도 공고 일정을 100% 실시간 대조하여 팩트 크로스 체킹을 의무 진행합니다.</li>
            <li><strong>실무 자문단 협업 (Expertise):</strong> 업력 10년 이상의 베테랑 공인중개사, 공인 금융 자산 설계사, 그리고 부동산 법률 감수 전문 연구진과의 지속 가능한 피드백 연대를 구성하여 실효 지식을 제공합니다.</li>
            <li><strong>비강제성 투명 정보 (Transparency):</strong> 어떠한 주택 판매 대행사나 특정 대출 중개업체로부터 원고료 수혜 목적의 편향된 홍보 스폰서십 글을 게재하지 않으며, 이용자의 기밀 정보 수집 목적의 어떠한 유료 가입도 일절 강제하거나 요구하지 않는 순수 영구 무상 개방 형태를 선언합니다.</li>
          </ul>

          <h2>하우징허브 편집팀 및 자문진 소개 (Editorial Team & Advisors)</h2>
          <div class="team-grid">
            <div class="team-card">
              <h3>박예준 (Chief Editor / 대표자)</h3>
              <p class="role">알고파트너스 대표 / 주거복지 정책 분석가</p>
              <p>무주택 실수요자 권익보호를 위한 미디어 기획을 총괄합니다. 주택 임대차 분쟁 사례집 편찬 및 지자체 주거 기획 칼럼을 정기 기고하고 있습니다. (연락처: apark12321@gmail.com)</p>
            </div>
            <div class="team-card">
              <h3>김현우 (Real Estate Consultant)</h3>
              <p class="role">공인중개사 (인천 연수구 지부 자문)</p>
              <p>수도권 아파트 분양권 전매 제한 및 전세 안심 보증 사기 예방 특약 조항의 실무 검수를 주관하고 실물 기재 프로세스를 조언합니다.</p>
            </div>
            <div class="team-card">
              <h3>이소율 (Financial Writer)</h3>
              <p class="role">공인 금융설계 위원 / 주택 자금 칼럼니스트</p>
              <p>스트레스 DSR 등 최신 금융 규제에 기반한 적격 대출 상환 계획 산출식 감수 및 버팀목 디딤돌 서민 보조 저리 자금 운용 매뉴얼을 전담합니다.</p>
            </div>
          </div>

          <h2>콘텐츠 팩트체킹 및 정정 절차 (Fact-Checking & Corrections)</h2>
          <p>당사 미디어는 모든 게재 지식물에 대하여 매주 월요일 최신 법률 적용 사항을 주간 단위로 크로스 확인합니다. 만약 정책 개편 시차나 단순 자판 오기로 인한 오류가 발견되거나 제보될 경우, 24시간 이내에 보도 정정 위원회 소정 기획안을 거쳐 정밀 수정 보완 조치를 시행하고 투명하게 공개 정정 목록을 보도실에 적재합니다. 정보 기재 오류 및 제안 의견은 공식 소통 이메일(apark12321@gmail.com)로 항시 제출해 주시면 적극 감사 수렴하겠습니다.</p>
        </div>`
      ),
    },
    {
      path: "privacy/index.html",
      title: `개인정보 처리방침 | ${SITE_NAME}`,
      desc: `${SITE_NAME}의 개인정보 수집, 이용, 구글 애드센스(AdSense) 맞춤 쿠키 수집 및 거부 절차에 관한 표준 보호 방침 안내입니다.`,
      url: `${SITE_URL}/privacy`,
      body: buildStaticPageBody(
        "개인정보 처리방침 (Privacy Policy)",
        `<div class="privacy-container leading-relaxed space-y-4">
          <p><strong>발행처:</strong> 알고파트너스 (대표자: 박예준) | <strong>개인정보 보호책임자:</strong> 박예준 (apark12321@gmail.com)</p>
          <h3>제 1 조 (목적 및 수집 범위)</h3>
          <p>${SITE_NAME}(https://zip9.kr)는 이용자의 개인정보를 매우 소중히 다루며, 대한민국 개인정보보호법 및 구글 애드센스(Google AdSense) 프로그램 정책 기준을 준수합니다. 본 사이트는 회원가입이나 필수 수집 절차 없이 누구나 무상으로 이용 가능한 비회원제 포털입니다.</p>
          
          <h3>제 2 조 (Google AdSense 및 제3자 맞춤 광고 쿠키 수집 고지)</h3>
          <p>본 사이트는 서비스 운영 및 품질 개선 비용 조달을 위하여 Google Inc. 및 제3자 광고 네트워크의 맞춤형 광고(Google AdSense)를 활용합니다.</p>
          <ul>
            <li>Google을 포함한 제3자 제공업체는 쿠키(Cookie)를 사용하여 사용자의 이전 웹사이트 방문 기록을 바탕으로 맞춤형 광고를 제공합니다.</li>
            <li>Google의 광고 쿠키 사용으로 Google 및 파트너는 사용자의 본 사이트 및 인터넷상의 다른 사이트 방문을 바탕으로 적절한 광고를 게재할 수 있습니다.</li>
            <li>사용자는 <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google 맞춤형 광고 설정</a>을 방문하여 맞춤형 광고 수집을 거부할 수 있으며, <a href="https://www.aboutads.info" target="_blank" rel="noopener">aboutads.info</a>를 통해 제3자 제공업체의 맞춤형 광고용 쿠키 사용을 차단할 수 있습니다.</li>
          </ul>

          <h3>제 3 조 (개인정보 보호책임자 및 문의)</h3>
          <p>개인정보 처리와 관련된 문의, 불만 처리, 개인정보 파기 요청은 공식 이메일(apark12321@gmail.com)로 접수해 주시면 24시간 이내에 신속히 수렴 조치합니다.</p>
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
          <p><strong>운영 주체:</strong> 알고파트너스 (대표자: 박예준)</p>
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
    const html = renderPage(
      template,
      {
        title: `${cat} 정보 | ${SITE_NAME}`,
        description: `${cat} 관련 주거 정보와 가이드를 모았습니다.`,
        canonical: `${SITE_URL}/category/${encodeURIComponent(cat)}`,
        ogType: "website",
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
    const html = renderPage(
      template,
      {
        title: `${post.title} | ${SITE_NAME}`,
        description: post.excerpt || stripHtml(sanitizeContent(post.content)).slice(0, 155),
        canonical: `${SITE_URL}/post/${encodeURIComponent(slug)}`,
        ogType: "article",
        ogImage: post.image,
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
