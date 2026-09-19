import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { POSTS } from "./src/data/posts";
import { getServerSideProps } from "./src/server/getServerSideProps";

dotenv.config();

// Gemini AI 클라이언트 초기화
const aiApiKey = process.env.GEMINI_API_KEY;
let ai: any = null;
if (aiApiKey) {
  ai = new GoogleGenAI({
    apiKey: aiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// [완전 고정 정적 포스트 관리 체계]
// ==========================================
function getActivePostsList(): any[] {
  return POSTS;
}



// WWW -> non-WWW 301 Redirect (SEO 최적화: 도메인 파편화 방지 및 검색엔진 노출 통일)
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (host === "www.zip9.kr") {
    return res.redirect(301, `https://zip9.kr${req.originalUrl}`);
  }
  next();
});

// 구글 서치 콘솔 파일 업로드식 인증 자동화 라우트
// 구글 서치콘솔이 제공하는 어떠한 임의의 google[인증코드].html 파일 요청도 즉시 성공 응답하여 인증 완료 유도
app.get("/google:verification_id.html", (req, res) => {
  const code = req.params.verification_id;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(`google-site-verification: google${code}.html`);
});

// 구글 애드센스 및 검색 엔진 크롤러를 위한 최상단 정적 파일 전용 라우트
app.get("/ads.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send("google.com, pub-9552509372228899, DIRECT, f08c47fec0942fa0\n");
});

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  const distRobots = path.join(process.cwd(), "dist", "robots.txt");
  if (fs.existsSync(distRobots)) {
    return res.send(fs.readFileSync(distRobots, "utf-8"));
  }
  const publicRobots = path.join(process.cwd(), "public", "robots.txt");
  if (fs.existsSync(publicRobots)) {
    return res.send(fs.readFileSync(publicRobots, "utf-8"));
  }
  return res.send("User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://zip9.kr/sitemap.xml\n");
});

function generateDynamicSitemapXml(): string {
  const activePosts = getActivePostsList();
  const todayStr = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. 메인 홈페이지
  xml += `  <url>\n    <loc>https://zip9.kr/</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // 2. 카테고리 페이지
  const categories = ["청약-분양", "전월세", "대출-금융", "이사-인테리어"];
  for (const cat of categories) {
    xml += `  <url>\n    <loc>https://zip9.kr/category/${encodeURIComponent(cat)}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }

  // 3. 서브 페이지
  const subpages = ["toolkit", "about", "terms", "privacy", "disclaimer", "contact", "announcement"];
  for (const page of subpages) {
    xml += `  <url>\n    <loc>https://zip9.kr/${page}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // 4. 전체 포스트 상세 페이지
  for (const post of activePosts) {
    const slug = slugify(post.title);
    const postDate = post.date || todayStr;
    xml += `  <url>\n    <loc>https://zip9.kr/post/${encodeURIComponent(slug)}</loc>\n    <lastmod>${postDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

function generateDynamicRssXml(): string {
  const activePosts = getActivePostsList();
  const todayDate = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  rss += `  <channel>\n`;
  rss += `    <title>하우징허브 (HousingHub)</title>\n`;
  rss += `    <link>https://zip9.kr/</link>\n`;
  rss += `    <description>신혼부부와 무주택자를 위한 2026 주거·청약·대출 실무 가이드</description>\n`;
  rss += `    <language>ko-KR</language>\n`;
  rss += `    <lastBuildDate>${todayDate}</lastBuildDate>\n`;
  rss += `    <atom:link href="https://zip9.kr/rss.xml" rel="self" type="application/rss+xml"/>\n`;

  // 최신 50개 포스트 피드 생성
  const recentPosts = activePosts.slice(0, 50);
  for (const post of recentPosts) {
    const slug = slugify(post.title);
    const pubDate = post.date ? new Date(post.date).toUTCString() : todayDate;
    const cleanDesc = (post.excerpt || post.title).replace(/<[^>]*>/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cleanTitle = (post.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    rss += `    <item>\n`;
    rss += `      <title>${cleanTitle}</title>\n`;
    rss += `      <link>https://zip9.kr/post/${encodeURIComponent(slug)}</link>\n`;
    rss += `      <guid>https://zip9.kr/post/${encodeURIComponent(slug)}</guid>\n`;
    rss += `      <pubDate>${pubDate}</pubDate>\n`;
    rss += `      <category>${post.category || "주거"}</category>\n`;
    rss += `      <description>${cleanDesc}</description>\n`;
    rss += `    </item>\n`;
  }

  rss += `  </channel>\n`;
  rss += `</rss>`;
  return rss;
}

app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  return res.send(generateDynamicSitemapXml());
});

app.get("/rss.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  return res.send(generateDynamicRssXml());
});

app.get("/7065c4d36d9ee7471f10e55dd6f4a4bd.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send("7065c4d36d9ee7471f10e55dd6f4a4bd\n");
});

// API 1: 헬스체크 및 환경정보 제공
app.get("/api/health", (req, res) => {
  const activePosts = getActivePostsList();
  res.json({
    status: "ok",
    aiConfigured: !!aiApiKey,
    postCount: activePosts.length
  });
});

// API 1.5: 고정 정적 포스팅 목록 조회
app.get("/api/posts", (req, res) => {
  const posts = getActivePostsList();
  res.json({
    posts,
    totalCount: posts.length,
  });
});

// API 1.8: 구글 서치콘솔 및 검색엔진 색인 자동 삭제(De-indexing) 백단 자동 처리
// 삭제되거나 만료된 포스트 URL 요청 시 백엔드에서 HTTP 410 Gone + X-Robots-Tag: noindex를 자동 반환하며
// IndexNow에 즉시 전송하여 구글 서치콘솔 및 검색엔진에서 색인이 자동으로 삭제되도록 처리합니다.
const deletedPostsFilePath = path.join(process.cwd(), "src", "data", "deleted-posts.json");

function loadDeletedPosts(): any[] {
  try {
    if (fs.existsSync(deletedPostsFilePath)) {
      const data = fs.readFileSync(deletedPostsFilePath, "utf-8");
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.error("Deleted posts load error:", err);
  }
  return [];
}

function saveDeletedPosts(list: any[]) {
  try {
    const dir = path.dirname(deletedPostsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(deletedPostsFilePath, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Deleted posts save error:", err);
  }
}

app.get("/api/deindex", (req, res) => {
  const list = loadDeletedPosts();
  res.json({
    status: "ok",
    deletedCount: list.length,
    deletedPosts: list,
    policy: "HTTP 410 Gone + X-Robots-Tag: noindex, nofollow, noarchive (백단 자동 색인 삭제)"
  });
});

app.post("/api/deindex", async (req, res) => {
  try {
    const { slug, reason } = req.body || {};
    if (!slug) {
      return res.status(400).json({ error: "slug is required" });
    }
    const cleanSlug = String(slug).trim().toLowerCase().replace(/^\/post\//, "").replace(/\/$/, "");
    const list = loadDeletedPosts();
    const existing = list.find((item: any) => item.slug === cleanSlug);
    if (!existing) {
      list.push({
        slug: cleanSlug,
        deletedAt: new Date().toISOString(),
        reason: reason || "Auto de-indexed by user or admin request"
      });
      saveDeletedPosts(list);
    }

    // IndexNow를 통해 검색엔진에 즉시 삭제 및 변경 신호 자동 발송
    const targetUrl = `https://zip9.kr/post/${encodeURIComponent(cleanSlug)}`;
    fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "zip9.kr",
        key: "7065c4d36d9ee7471f10e55dd6f4a4bd",
        keyLocation: "https://zip9.kr/7065c4d36d9ee7471f10e55dd6f4a4bd.txt",
        urlList: [targetUrl]
      })
    }).catch(() => {});

    res.json({
      status: "success",
      statusCode: 410,
      slug: cleanSlug,
      url: targetUrl,
      message: "구글 서치콘솔 및 크롤러 대상 HTTP 410 Gone + noindex 자동 설정 완료"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process de-indexing" });
  }
});

// API 2: 실시간 주거 컨설턴트 챗봇 (Gemini API 기반)
app.post("/api/advisor", async (req, res) => {
  const { message, chatHistory = [], activePostId = null } = req.body;
  const activePosts = getActivePostsList();

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // 1. 관련 정보 컨텍스트 제공 준비
  let activePostContext = "";
  if (activePostId) {
    const post = activePosts.find(p => p.id === activePostId);
    if (post) {
      activePostContext = `\n[사용자 열람 중인 아티클 정보]:\n제목: ${post.title}\n요약: ${post.excerpt}`;
    }
  }

  // 사용 가능한 하우징허브 내 주요 아티클 링크 목록 구성
  const availableArticlesContext = activePosts.slice(0, 15).map(p => {
    return `- [${p.category}] ${p.title} -> 링크: /post/${slugify(p.title)}`;
  }).join("\n");

  // 청약, 임대주택, 대출 상식 사전 주입
  const systemInstruction = `
    당신의 이름은 '하우징허브 주거 전문 상담원'입니다.
    청약 자격, 전월세 대항력 및 안전 계약, 이사 절차, 대출(디딤돌, 신생아 특례대출, 버팀목, DSR 규제 등)을 직접 겪어보고 꿰뚫고 있는 주거·금융 실무 상담 멘토입니다.

    [상담 지침 - 친절하고 명쾌한 사람 전문가 톤]:
    1. 인공지능이나 로봇이라는 표현을 일절 쓰지 마십시오. 실제로 질문자의 상황을 공감하고 도와주는 다정하고 전문적인 실무 선배처럼 답변하십시오.
    2. **절대로 마크다운 기호(#, ##, ###, *, **, ---)를 답변에 포함하지 마십시오.**
    3. 강조할 핵심 내용은 <strong>강조할 문구</strong> 태그를 활용하고, 단락 간 줄바꿈은 반드시 <br/> 태그를 이용하십시오.
    4. 목록 표기가 필요한 경우 <ul> 및 <li> 등의 HTML 태그를 사용하십시오.
    5. **답변은 질문에 대해 핵심 위주로 아주 간단명료하게 2~3문장 이내로 압축하여 작성하십시오.**
    6. 답변 내용에 깊이가 더 필요하거나 구체적인 가이드가 필요한 경우, 아래의 [하우징허브 가용 아티클 목록] 중 가장 연관성 높은 아티클 링크를 찾아서 **답변 맨 끝에 하이퍼링크 형식**으로 반드시 연결해 주십시오.
       - 링크 형식: <br/><br/><a href="/post/아티클-슬러그" class="text-blue-600 underline font-bold" target="_blank">관련 실전 가이드: '아티클제목' 바로가기</a>
    7. 대외적 공식 홈페이지나 제도 홈페이지 소개가 수반되는 경우, 공식 링크를 함께 제시하십시오.
       - 청약홈: <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈</a>
       - LH청약플러스: <a href="https://apply.lh.or.kr" class="text-blue-600 underline font-bold" target="_blank">LH청약플러스</a>
       - 주택도시기금: <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금</a>

    [하우징허브 가용 아티클 목록]:
    ${availableArticlesContext}

    ${activePostContext}
  `;

  const findPostByKeyword = (kw: string) => {
    const found = activePosts.find(p => p.title.includes(kw) || p.excerpt.includes(kw));
    return found ? { title: found.title, link: `/post/${slugify(found.title)}` } : null;
  };

  // 2. Gemini API 호출
  if (!ai) {
    console.log("No GEMINI_API_KEY detected. Running local consultation fallback.");
    let fallbackText = `안녕하세요! 하우징허브 주거 실무 상담실입니다. 질문하신 내용에 대한 핵심 가이드를 안내해 드립니다. <br/><br/>`;
    
    const msg = message.toLowerCase();

    if (msg.includes("청약") || msg.includes("통장")) {
      fallbackText += `<strong>[청약 전문 조언]</strong> 주택 청약을 노릴 때는 청약통장 인정 한도를 월 25만 원까지 꽉 채우는 전략이 유리합니다. <br/><br/>`;
      const post = findPostByKeyword("청약") || findPostByKeyword("가점");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `추가로 공식 일정은 <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈 홈페이지</a>를 꼭 확인하세요!`;
    } else if (msg.includes("대출") || msg.includes("자금") || msg.includes("한도")) {
      fallbackText += `<strong>[대출/자금 조언]</strong> 스트레스 DSR 3단계 등의 영향으로 본인의 대출 실효 한도가 변동되었을 확률이 매우 높습니다. <br/><br/>`;
      const post = findPostByKeyword("대출") || findPostByKeyword("버팀목");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `금융 정책의 상세 요건은 <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금 홈페이지</a>에서 실시간으로 대조해 보실 수 있습니다.`;
    } else if (msg.includes("월세") || msg.includes("전세") || msg.includes("보증금") || msg.includes("사기") || msg.includes("특약") || msg.includes("등기")) {
      fallbackText += `<strong>[전월세 계약 조언]</strong> 등기부등본 확인 시 을구의 근저당권 채무액과 갑구의 소유주 권리 관계를 반드시 계약 직전까지 면밀히 검사해야 보증금을 사수할 수 있습니다. <br/><br/>`;
      const post = findPostByKeyword("특약") || findPostByKeyword("보증금") || findPostByKeyword("전세");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `또한 계약 후에는 당일 즉시 전입신고와 확정일자를 처리해 대항력을 반드시 선점해 확보하세요.`;
    } else {
      fallbackText += `요청하신 사항 관련하여, 하우징허브가 준비한 안심 주거 가이드 아티클을 추천해 드립니다. <br/><br/>`;
      const post = activePosts[0];
      if (post) {
        fallbackText += `<a href="/post/${slugify(post.title)}" class="text-blue-600 underline font-bold" target="_blank">추천 아티클: '${post.title}' 바로가기</a><br/><br/>`;
      }
      fallbackText += `더 세밀한 맞춤형 LTV 및 청약 가점 조율은 상단 '자가진단' 탭의 계산기를 통해 무료로 진단해보실 수 있어요.`;
    }
    return res.json({ response: fallbackText });
  }

  try {
    const formattedHistory = chatHistory.map((h: any) => ({
      role: h.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: h.text }]
    }));

    const cleanHistory: any[] = [];
    let expectedRole: "user" | "model" = "user";

    for (const msg of formattedHistory) {
      if (msg.role === expectedRole) {
        cleanHistory.push(msg);
        expectedRole = expectedRole === "user" ? "model" : "user";
      }
    }

    let responseText = "";
    try {
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemInstruction,
        },
        history: cleanHistory
      });

      const result = await chat.sendMessage({ message });
      responseText = result.text;
    } catch (chatErr: any) {
      console.warn("Primary chat model failed, falling back to local guidance:", chatErr);
      let fallbackText = `하우징허브 주거 비서입니다! 일시적인 서버 부하로 인해 AI 모델 연결이 잠시 지연되고 있습니다. 대신 탑재된 전문가 로컬 지식기반 시스템으로 조언해 드립니다. <br/><br/>`;
      
      const msg = message.toLowerCase();
      if (msg.includes("청약") || msg.includes("통장")) {
        fallbackText += `<strong>[청약 전문 조언]</strong> 아파트 청약을 노릴 때는 특히 인정 한도를 월 25만 원까지 꽉 채우는 전략이 유리합니다. <br/><br/>`;
        const post = findPostByKeyword("청약") || findPostByKeyword("가점");
        if (post) {
          fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
        }
        fallbackText += `상세 일정은 <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈 홈페이지</a>를 참조하세요!`;
      } else if (msg.includes("대출") || msg.includes("자금") || msg.includes("한도")) {
        fallbackText += `<strong>[대출/자금 조언]</strong> 현재 스트레스 DSR 적용 강도로 내 대출 실효 한도가 변동되었을 확률이 매우 높습니다. <br/><br/>`;
        const post = findPostByKeyword("대출") || findPostByKeyword("버팀목");
        if (post) {
          fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
        }
        fallbackText += `금리 정보는 <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금 홈페이지</a>를 통해 실시간 조회해보실 수 있습니다.`;
      } else if (msg.includes("월세") || msg.includes("전세") || msg.includes("보증금") || msg.includes("사기") || msg.includes("특약") || msg.includes("등기")) {
        fallbackText += `<strong>[전월세 안전 조언]</strong> 전세계약서 작성 시에는 대항력 효력 시점(익일 0시)을 안전하게 수호할 권리 변동 금지 특약을 명시하고, 등기부등본상의 근저당 설정 여부를 필수적으로 감시하셔야 안전합니다. <br/><br/>`;
        const post = findPostByKeyword("특약") || findPostByKeyword("보증금") || findPostByKeyword("전세");
        if (post) {
          fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
        }
      } else {
        fallbackText += `말씀하신 '${message}' 관련하여, 저희 하우징허브가 준비한 안심 가이드 아티클을 추천해 드립니다. <br/><br/>`;
        const post = activePosts[0];
        if (post) {
          fallbackText += `<a href="/post/${slugify(post.title)}" class="text-blue-600 underline font-bold" target="_blank">추천 아티클: '${post.title}' 바로가기</a><br/><br/>`;
        }
        fallbackText += `상단의 '자가진단' 탭에서 청약 가점 계산기와 대출 이자 계산기도 무상으로 적극 활용해 가이드라인을 바로 잡아보실 수 있어요.`;
      }
      responseText = fallbackText;
    }

    return res.json({ response: parseMarkdownToHtml(responseText) });
  } catch (error) {
    console.error("Gemini Conversation Action Error:", error);
    return res.status(500).json({ error: "AI Consultation server error." });
  }
});

function slugify(title: string): string {
  if (!title) return "";
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_:\-\+·\.\?,\!\[\]\(\)"']/g, "-")
    .replace(/[^\w\uAC00-\uD7A3\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseMarkdownToHtml(text: string): string {
  if (!text) return "";
  let html = text;

  // 1. 마크다운 헤더 변환 (#, ##, ###, ####)
  html = html.replace(/^#### (.*?)$/gm, '<h5 class="font-bold text-xs text-slate-800 mt-2">$1</h5>');
  html = html.replace(/^### (.*?)$/gm, '<h4 class="font-bold text-sm text-slate-900 mt-2.5">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 class="font-bold text-base text-slate-900 mt-3">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 class="font-bold text-lg text-slate-900 mt-4">$1</h2>');

  // 2. 가로선 (---)
  html = html.replace(/^---$/gm, '<hr class="my-3 border-slate-200" />');

  // 3. 리스트 항목 (* 또는 - 로 시작하는 라인)
  const lines = html.split("\n");
  let inList = false;
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const content = trimmed.substring(2);
      let res = "";
      if (!inList) {
        res += '<ul class="list-disc pl-5 my-2 space-y-1">';
        inList = true;
      }
      res += `<li>${content}</li>`;
      return res;
    } else {
      let res = "";
      if (inList) {
        res += "</ul>";
        inList = false;
      }
      res += line;
      return res;
    }
  });
  if (inList) {
    processedLines.push("</ul>");
  }
  html = processedLines.join("\n");

  // 4. 볼드 및 이탤릭 (**text**, *text*)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. 일반 줄바꿈 문자를 <br/>로 치환하되 중복 방지
  html = html.replace(/\n/g, "<br/>");
  html = html.replace(/(<br\s*\/?>){3,}/g, "<br/><br/>");

  return html;
}

// 통합 SEO 메타 태그 검색-치환 및 주입 헬퍼 함수
function replaceOrInjectMetaTags(
  html: string,
  title: string,
  desc: string,
  canonicalUrl: string,
  ogType = "website",
  ogImage = "",
  keywords = "",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
): string {
  let updatedHtml = html;

  // Title 치환
  if (updatedHtml.match(/<title>[\s\S]*?<\/title>/i)) {
    updatedHtml = updatedHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <title>${title}</title>\n</head>`);
  }

  // Robots 태그 치환 또는 삽입 (410/404 시 noindex, nofollow, noarchive)
  if (updatedHtml.match(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${robots}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta name="robots" content="${robots}" />\n</head>`);
  }

  // Description 치환
  if (updatedHtml.match(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${desc}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta name="description" content="${desc}" />\n</head>`);
  }

  // Canonical 치환
  if (updatedHtml.match(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  // OG Title 치환
  if (updatedHtml.match(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:title" content="${title}" />\n</head>`);
  }

  // OG Description 치환
  if (updatedHtml.match(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${desc}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:description" content="${desc}" />\n</head>`);
  }

  // OG Url 치환
  if (updatedHtml.match(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:url" content="${canonicalUrl}" />\n</head>`);
  }

  // OG Type 치환
  if (updatedHtml.match(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:type" content="${ogType}" />\n</head>`);
  }

  // Twitter Title 치환
  if (updatedHtml.match(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  }

  // Twitter Description 치환
  if (updatedHtml.match(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i)) {
    updatedHtml = updatedHtml.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${desc}" />`);
  }

  // OG Image 치환 및 삽입
  if (ogImage) {
    if (updatedHtml.match(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i)) {
      updatedHtml = updatedHtml.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${ogImage}" />`);
    } else {
      updatedHtml = updatedHtml.replace("</head>", `  <meta property="og:image" content="${ogImage}" />\n</head>`);
    }
  }

  // Keywords 치환 및 삽입
  if (keywords) {
    if (updatedHtml.match(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i)) {
      updatedHtml = updatedHtml.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${keywords}" />`);
    } else {
      updatedHtml = updatedHtml.replace("</head>", `  <meta name="keywords" content="${keywords}" />\n</head>`);
    }
  }

  // Google Site Verification 태그 동적 삽입 (환경 변수 혹은 기본 코드 제공시)
  const siteVerificationToken = process.env.GOOGLE_SITE_VERIFICATION || "U1U64IvSTSjySxIRO1Sr598xGZz85FYPdKSSvo3B_BQ";
  if (siteVerificationToken) {
    const verTag = `<meta name="google-site-verification" content="${siteVerificationToken}" />`;
    if (updatedHtml.match(/<meta\s+name="google-site-verification"\s+content="[^"]*"\s*\/?>/i)) {
      updatedHtml = updatedHtml.replace(/<meta\s+name="google-site-verification"\s+content="[^"]*"\s*\/?>/i, verTag);
    } else {
      updatedHtml = updatedHtml.replace("</head>", `  ${verTag}\n</head>`);
    }
  }

  return updatedHtml;
}

// Vite Middleware & Static Assets 서빙
async function startServer() {
  let viteInstance: any = null;

  const getBaseUrl = (req: express.Request): string => {
    const host = req.headers.host || "";
    if (host.includes("zip9.kr")) {
      return "https://zip9.kr";
    }
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    return `${protocol}://${host}`;
  };

  const handleHtmlServing = async (req: express.Request, res: express.Response) => {
    try {
      const isProd = process.env.NODE_ENV === "production";
      const indexHtmlPath = isProd 
        ? path.join(process.cwd(), "dist", "index.html")
        : path.join(process.cwd(), "index.html");

      if (!fs.existsSync(indexHtmlPath)) {
        return res.status(404).send("파일을 찾을 수 없습니다. 빌드를 먼저 수행해 주십시오.");
      }

      let html = fs.readFileSync(indexHtmlPath, "utf-8");

      // 개발환경 모드 빌드
      if (!isProd && viteInstance) {
        html = await viteInstance.transformIndexHtml(req.originalUrl, html);
      }

      const baseUrl = getBaseUrl(req);
      const activePosts = getActivePostsList();

      // [getServerSideProps] 동적 데이터 페칭 및 시맨틱 HTML/메타/스키마/초기 상태 생성
      const ssrProps = getServerSideProps(req.path, req.query, activePosts, baseUrl);

      // 구글 검색엔진 색인 표준화: ID 형태나 비표준 슬러그로 진입 시 표준 URL로 301 영구 리디렉션
      if (ssrProps.pageType === "post" && ssrProps.post) {
        const canonicalSlug = slugify(ssrProps.post.title);
        const currentSlug = decodeURIComponent(req.path.replace(/^\/post\//, "").replace(/\/$/, ""));
        if (currentSlug && currentSlug !== canonicalSlug) {
          return res.redirect(301, `/post/${encodeURIComponent(canonicalSlug)}`);
        }
      }

      // 운영 환경에서 이미 빌드된 완전 정적 HTML 파일이 존재하는 경우 해당 파일 즉시 서빙 (크롤러 최적화)
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      if (isProd) {
        if (ssrProps.pageType === "post" && ssrProps.post) {
          const slug = slugify(ssrProps.post.title);
          const prerenderedPostPath = path.join(process.cwd(), "dist", "post", slug, "index.html");
          if (fs.existsSync(prerenderedPostPath)) {
            return res.send(fs.readFileSync(prerenderedPostPath, "utf-8"));
          }
        } else if (ssrProps.pageType === "category" && ssrProps.category) {
          const prerenderedCatPath = path.join(process.cwd(), "dist", "category", ssrProps.category, "index.html");
          if (fs.existsSync(prerenderedCatPath)) {
            return res.send(fs.readFileSync(prerenderedCatPath, "utf-8"));
          }
        } else if (ssrProps.pageType === "subpage" && ssrProps.subpage) {
          const prerenderedPagePath = path.join(process.cwd(), "dist", ssrProps.subpage, "index.html");
          if (fs.existsSync(prerenderedPagePath)) {
            return res.send(fs.readFileSync(prerenderedPagePath, "utf-8"));
          }
        } else if (ssrProps.pageType === "home") {
          const prerenderedHomePath = path.join(process.cwd(), "dist", "index.html");
          if (fs.existsSync(prerenderedHomePath)) {
            return res.send(fs.readFileSync(prerenderedHomePath, "utf-8"));
          }
        }
      }

      // 1. Title 및 Meta 태그 통합 주입
      html = replaceOrInjectMetaTags(
        html,
        ssrProps.meta.title,
        ssrProps.meta.description,
        ssrProps.meta.canonical,
        ssrProps.meta.ogType,
        ssrProps.meta.ogImage,
        ssrProps.meta.keywords.join(", "),
        ssrProps.meta.robots
      );

      // 2. JSON-LD 스키마 주입
      if (ssrProps.jsonLd) {
        const jsonLdTag = `<script type="application/ld+json">${JSON.stringify(ssrProps.jsonLd)}</script>`;
        html = html.replace("</head>", `  ${jsonLdTag}\n</head>`);
      }

      // 3. __INITIAL_DATA__ 스크립트 주입 (클라이언트 컴포넌트 0ms 즉시 Hydration용)
      const initialDataTag = `<script id="__INITIAL_DATA__" type="application/json">${JSON.stringify(ssrProps)}</script>`;
      html = html.replace("</head>", `  ${initialDataTag}\n</head>`);

      // 4. 구글 봇 및 검색엔진 크롤러를 위한 완전한 시맨틱 HTML 본문 주입 (#root 내부)
      if (html.includes('<div id="root"></div>')) {
        html = html.replace(
          '<div id="root"></div>',
          `<div id="root"><div id="ssr-container">${ssrProps.htmlBody}</div></div>`
        );
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      if (ssrProps.statusCode === 410 || ssrProps.pageType === "410") {
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
        return res.status(410).send(html);
      }
      if (ssrProps.statusCode === 404 || ssrProps.pageType === "404") {
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
        return res.status(404).send(html);
      }
      return res.status(ssrProps.statusCode || 200).send(html);
    } catch (err) {
      console.error("HTML 렌더링 서빙 오류:", err);
      return res.status(500).send("서버 서빙 오류가 발생했습니다.");
    }
  };

  if (process.env.NODE_ENV !== "production") {
    viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    // 라우터 처리 우선순위
    app.get("/", handleHtmlServing);
    app.get("/post/:id", handleHtmlServing);
    app.get("/category/:category", handleHtmlServing);
    app.get("/toolkit", handleHtmlServing);
    app.get("/about", handleHtmlServing);
    app.get("/privacy", handleHtmlServing);
    app.get("/terms", handleHtmlServing);
    app.get("/disclaimer", handleHtmlServing);

    app.use(viteInstance.middlewares);
    app.get("*", handleHtmlServing);
  } else {
    // 운영용 라우터 처리 우선순위
    app.get("/", handleHtmlServing);
    app.get("/post/:id", handleHtmlServing);
    app.get("/category/:category", handleHtmlServing);
    app.get("/toolkit", handleHtmlServing);
    app.get("/about", handleHtmlServing);
    app.get("/privacy", handleHtmlServing);
    app.get("/terms", handleHtmlServing);
    app.get("/disclaimer", handleHtmlServing);

    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false })); // 자동 index.html 방지하여 메타 인젝터 오버라이드 유도

    app.get("*", handleHtmlServing);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HostingHub Incheon] Full-stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
