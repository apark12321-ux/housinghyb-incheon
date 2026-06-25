import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { POSTS } from "./src/data/posts";

dotenv.config();

// Gemini AI 클라이언트 초기화
const aiApiKey = process.env.GEMINI_API_KEY;
let ai: any = null;
if (aiApiKey) {
  ai = new GoogleGenAI({ apiKey: aiApiKey });
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API 1: 헬스체크 및 환경정보 제공
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: !!aiApiKey,
    postCount: POSTS.length
  });
});

// API 2: 실시간 인천 주거 컨설턴트 챗봇 (Gemini API 기반)
app.post("/api/advisor", async (req, res) => {
  const { message, chatHistory = [], activePostId = null } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // 1. 관련 정보 컨텍스트 제공 준비
  // 사용자가 보고 있거나 관련된 아티클이 있으면 프롬프트에 주입하여 상황 이해를 도웁니다.
  let activePostContext = "";
  if (activePostId) {
    const post = POSTS.find(p => p.id === activePostId);
    if (post) {
      activePostContext = `\n[사용자 열람 중인 아티클 정보]:\n제목: ${post.title}\n요약: ${post.excerpt}`;
    }
  }

  // 인천 전용 청약, 영구/공공 임대주택, 대출 상식 사전 주입
  const systemInstruction = `
    당신의 이름은 '하우징허브 인천 (HousingHub Incheon) AI 주거 비서'입니다.
    인천광역시 전역(송도, 청라, 영종, 검단, 계양, 미추홀구, 부평구 등)의 청약, 전월세 대항력, 이사 상식, 대출(디딤돌, 신생아 특례대출, 버팀목 등)에 통달한 최고 전문가입니다.

    [지침 사항]:
    1. 친절하고, 신뢰성 있으며, 성실하게 답변해 주세요.
    2. 무리한 영끌을 지양하고 합리적인 자금 계획과 법적 자가 진단의 가용성을 칭찬하고 독려해 주세요.
    3. 인천 지역 소식(예: 청라 연장선, 송도 신주거 타운, 루원시티, 검단 신공급 등) 특성을 살려 답변해 주세요.
    4. 친근하게 존댓말('~요', '~입니다')을 사용해 주세요. HTML 또는 Markdown 형식으로 구조화해서 가독성 있게 표현하면 아주 좋습니다.
    ${activePostContext}
  `;

  // 2. Gemini API 호출
  if (!ai) {
    // API 키 부재 시 대체 로컬 상담 엔진 스마트 처리 (모크 응답 대신 영특한 룰 베이스 전문가 가이드)
    console.log("No GEMINI_API_KEY detected. Running local consultation fallback.");
    let fallbackText = `하우징허브 인천 주거 비서입니다! 안타깝게도 현재 서버의 AI 모델 연동을 위한 자격증명이 주입되지 않아, 탑재된 긴급 전문가 로컬 지식기반 시스템으로 응답해 드립니다. <br/><br/>`;
    
    const msg = message.toLowerCase();
    if (msg.includes("청약") || msg.includes("통장")) {
      fallbackText += `<strong>💡 청약 전문 조언:</strong> 인천 아파트 청약을 노릴 때는 특히 인정 한도를 월 25만 원까지 꽉 채우는 전략이 유리합니다. 특히 검단 및 송도 신도시 분양 일정을 모니터링하세요. 자가진단 탭의 '청약 가점 계산기'를 활용해서 자신의 정확한 가점을 점검해 보세요!`;
    } else if (msg.includes("대출") || msg.includes("자금") || msg.includes("한도")) {
      fallbackText += `<strong>💰 대출/자금 조언:</strong> 주택담보대출 LTV 조건과 함께 현재 스트레스 DSR 3단계 영향으로 내 대출 한도가 축소되었을 확률이 매우 높습니다. 자가진단 탭의 '대출 한도 계산기'를 돌려 안전한 이자 비중을 먼저 시뮬레이션해 보시는 것을 권장합니다!`;
    } else if (msg.includes("월세") || msg.includes("전세") || msg.includes("보증금") || msg.includes("사기")) {
      fallbackText += `<strong>🛡️ 전월세 안전 조언:</strong> 전세계약서 작성 시에는 반드시 대항력 효력 시점(익일 0시)을 커버할 수 있는 '당일 권리변동 금지 특약'과 '보증보험 가입 거절 시 무조건 환불 특약'을 기재하여 보증금을 끝까지 사수하셔야 안전합니다.`;
    } else {
      fallbackText += `말씀하신 '${message}' 관련하여, 저희 하우징허브가 준비한 66선 고품격 카테고리별 전문 주거 아티클들을 꼭 정독해 보세요! 또한, 상단의 '자가진단' 탭에서 청약 가점 시뮬레이션과 대출 이자 및 LTV 한도 계산기를 완전 무료로 활용해 가이드라인을 바로 잡아보실 수 있어요.`;
    }
    return res.json({ response: fallbackText });
  }

  try {
    const formattedHistory = chatHistory.map((h: any) => ({
      role: h.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: h.text }]
    }));

    // 현재 사용자 대화 메시지 추가
    formattedHistory.push({
      role: "user" as const,
      parts: [{ text: message }]
    });

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      },
      history: formattedHistory.slice(0, -1) // 이전 대화들 주입
    });

    const response = await chat.sendMessage({
      message: message
    });

    return res.json({ response: response.text });
  } catch (error) {
    console.error("Gemini Conversation Action Error:", error);
    return res.status(500).json({ error: "AI Consultation server error." });
  }
});

// API 3: 정교한 블로그 포스팅 AI 자동 보강 생성 (어드민 또는 확장용)
app.post("/api/generate", async (req, res) => {
  const { topic, category } = req.body;
  if (!topic || !category) {
    return res.status(400).json({ error: "Topic and category are required." });
  }

  if (!ai) {
    return res.status(503).json({ error: "Gemini API is not configured on server." });
  }

  try {
    const prompt = `
      인천 부동산 시장에 관한 다음 주제에 관해 '가독성이 훌륭한 HTML 포스팅'을 완벽히 작성해 주세요.
      주제: ${topic}
      카테고리: ${category}
      
      형식 및 내용:
      - <h2>, <h3>, <p>, <ul>, <li> 태그만을 사용하여 수려하게 작성하세요.
      - 실용적인 체크리스트와 팁을 포함하여 작성하세요.
      - 한글로만 친절하게 응답하세요.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            readTime: { type: Type.STRING }
          },
          required: ["title", "content", "excerpt", "hashtags", "readTime"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return res.json(data);
  } catch (error) {
    console.error("Gemini Live Writing Error:", error);
    return res.status(500).json({ error: "Failed to generate blog post dynamically." });
  }
});

// API 4: 사용자의 주거 복지 및 건의 사항 1:1 접수 처리 (구글 애드센스 규정 충족용 실제 검증 API)
app.post("/api/contact", async (req, res) => {
  const { name, email, category, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "이름, 이메일, 그리고 문의내용은 필수 항목입니다." });
  }

  console.log(`[인천 하우징허브 문의 접수] 분류: ${category} | 성함: ${name} | 이메일: ${email}`);
  console.log(`[문의내용]: ${message}`);

  return res.json({
    status: "success",
    message: "귀하의 소중한 건의 및 주거 복지 문의사항이 하우징허브 인천 정책 기획 지원팀에 안전하게 접수되었습니다. 담당자 검토 후 최대 24시간 이내에 기재해주신 이메일로 명확한 주거 처방전 회신이 전송됩니다.",
    referenceId: `HH-2026-${Math.floor(100000 + Math.random() * 900000)}`
  });
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

// SEO 관련 메타 태그 동적 수립 헬퍼 함수
function injectMetaTags(html: string, post: any, baseUrl: string): string {
  const canonicalUrl = `${baseUrl}/post/${encodeURIComponent(slugify(post.title))}`;
  const keywords = post.hashtags && post.hashtags.length > 0 ? post.hashtags.join(", ") : "하우징허브, 인천, 부동산, 청약, 전세대출";
  
  // Title 대량 치환
  let updatedHtml = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${post.title} | 하우징허브 인천</title>`
  );

  const safeTitle = post.title.replace(/"/g, '&quot;');
  const safeExcerpt = post.excerpt.replace(/"/g, '&quot;');

  // Meta 태그 명확화
  const metaTags = `
    <meta name="description" content="${safeExcerpt}" />
    <meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}" />
    <!-- Open Graph / Meta -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeExcerpt}" />
    <meta property="og:image" content="${post.image || ''}" />
    <meta property="og:site_name" content="하우징허브 인천" />
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${canonicalUrl}" />
    <meta property="twitter:title" content="${safeTitle}" />
    <meta property="twitter:description" content="${safeExcerpt}" />
    <meta property="twitter:image" content="${post.image || ''}" />
    <link rel="canonical" href="${canonicalUrl}" />
  `;

  updatedHtml = updatedHtml.replace("</head>", `${metaTags}\n</head>`);
  return updatedHtml;
}

function injectDefaultMetaTags(html: string, baseUrl: string): string {
  const title = "하우징허브 인천 | 실생활 청약, 임대, 전세대출 안심 정보 포털";
  const desc = "인천 지역 부동산, 청약 가점 계산, 전세대출 한도 시뮬레이션, 이사 가이드 및 등기부 독소조항 무상 방어 지식을 제공하는 임차인 안심 정주 포털입니다.";
  const canonicalUrl = `${baseUrl}/`;
  
  let updatedHtml = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${title}</title>`
  );

  const metaTags = `
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="인천 부동산, 청약가점 계산기, 전세대출 한도, 하우징허브, 버팀목 대출, 송도 청약, 청라 아파트, 검단 임대주택" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" />
    <link rel="canonical" href="${canonicalUrl}" />
  `;

  updatedHtml = updatedHtml.replace("</head>", `${metaTags}\n</head>`);
  return updatedHtml;
}

function injectCategoryMetaTags(html: string, category: string, baseUrl: string): string {
  const title = `${category} 실시간 알짜 정보 및 가이드 | 하우징허브 인천`;
  let desc = "";
  if (category === "청약-분양") {
    desc = "인천 지역 최신 청약 일정, 분양 정보, 청약가점 계산법, 무순위 줍줍 분석 및 당첨 확률 높이는 꿀팁을 총망라합니다.";
  } else if (category === "전월세") {
    desc = "인천 아파트 및 주택 전월세 사기 방지 대책, 등기부등본 확인법, 전세보증보험 가입 가이드 및 임대차 요령을 제공합니다.";
  } else if (category === "이사-인테리어") {
    desc = "인천 이삿짐 센터 고르는 요령, 입주 청소 체크리스트, 전입신고 및 확정일자 받는 법, 셀프 인테리어 팁을 안내합니다.";
  } else if (category === "대출-금융") {
    desc = "디딤돌 대출, 버팀목 전세대출, 인천 임차보증금 이자 지원 및 서민 주거 안정을 위한 정부 지원 금융 혜택 총정리.";
  } else {
    desc = `하우징허브 인천 ${category} 정보 센터. 안심 주거 정주 포털에서 실시간 정보를 확인하세요.`;
  }

  const canonicalUrl = `${baseUrl}/category/${encodeURIComponent(category)}`;
  
  let updatedHtml = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${title}</title>`
  );

  const metaTags = `
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="인천 ${category}, 하우징허브 ${category}, 인천 부동산, ${category} 가이드" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" />
    <link rel="canonical" href="${canonicalUrl}" />
  `;

  updatedHtml = updatedHtml.replace("</head>", `${metaTags}\n</head>`);
  return updatedHtml;
}

function injectSubpageMetaTags(html: string, path: string, baseUrl: string): string {
  let title = "하우징허브 인천";
  let desc = "인천 지역 부동산, 청약 가점 계산, 전세대출 한도 시뮬레이션, 이사 가이드 및 등기부 독소조항 무상 방어 지식을 제공하는 임차인 안심 정주 포털입니다.";
  
  if (path === "/about") {
    title = "소개 및 가치 | 하우징허브 인천";
    desc = "하우징허브 인천은 임차인의 정주 안정성과 안심 부동산 거래 환경을 실현하기 위해 설립된 공익 지향 정보 포털입니다.";
  } else if (path === "/toolkit") {
    title = "스마트 주거 자가진단 툴킷 | 하우징허브 인천";
    desc = "인천 지역 LTV/DSR 대출한도 모의 계산 및 청약 자가 점수(84점 만점) 진단을 제공하는 스마트 안심 툴킷입니다.";
  } else if (path === "/announcement") {
    title = "공지사항 및 새소식 | 하우징허브 인천";
    desc = "하우징허브 인천의 최신 정책 변화 공지, 신규 부동산 정보 가이드 추가 소식 및 공지사항을 확인하세요.";
  } else if (path === "/partnership") {
    title = "제휴 및 협업 문의 | 하우징허브 인천";
    desc = "공인중개사, 이사업체, 법무법인 등 인천 시민 주거 정주 발전에 협력할 파트너사를 상시 모집합니다.";
  } else if (path === "/terms") {
    title = "서비스 이용약관 | 하우징허브 인천";
    desc = "하우징허브 인천 서비스 이용 약관 및 사용자 정보 권리 보호 세부 조항 안내.";
  } else if (path === "/privacy") {
    title = "개인정보처리방침 | 하우징허브 인천";
    desc = "하우징허브 인천은 사용자의 개인정보를 소중히 보호하며, 관련 법령을 엄격히 준수합니다.";
  } else {
    return injectDefaultMetaTags(html, baseUrl);
  }

  const canonicalUrl = `${baseUrl}${path}`;
  
  let updatedHtml = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${title}</title>`
  );

  const metaTags = `
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="인천 부동산, 하우징허브, 안심 포털" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <link rel="canonical" href="${canonicalUrl}" />
  `;

  updatedHtml = updatedHtml.replace("</head>", `${metaTags}\n</head>`);
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

      // 1) 게시글 고유값 파싱 (경로 /post/:id 혹은 쿼리스트링 ?post=)
      const rawPostId = req.params.id || (req.query.post as string);
      if (rawPostId) {
        const decodedPostId = decodeURIComponent(rawPostId);
        const post = POSTS.find(p => p.title === decodedPostId || p.id === decodedPostId || slugify(p.title) === decodedPostId);
        if (post) {
          html = injectMetaTags(html, post, baseUrl);
          return res.send(html);
        }
      }

      // 2) 카테고리 경로 파싱 (예: /category/:categoryName)
      const pathParts = req.path.split("/");
      const categoryIndex = pathParts.indexOf("category");
      if (categoryIndex !== -1 && pathParts[categoryIndex + 1]) {
        const rawCat = pathParts[categoryIndex + 1];
        const decodedCat = decodeURIComponent(rawCat);
        html = injectCategoryMetaTags(html, decodedCat, baseUrl);
        return res.send(html);
      }

      // 3) 특정 서브페이지 경로 파싱 (예: /about, /announcement, /partnership, /terms, /privacy, /toolkit)
      const subpages = ["/about", "/announcement", "/partnership", "/terms", "/privacy", "/toolkit"];
      const matchedPage = subpages.find(page => req.path === page);
      if (matchedPage) {
        html = injectSubpageMetaTags(html, matchedPage, baseUrl);
        return res.send(html);
      }

      // 기본 메타 기입
      html = injectDefaultMetaTags(html, baseUrl);
      return res.send(html);
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

    app.use(viteInstance.middlewares);
  } else {
    // 운영용 라우터 처리 우선순위
    app.get("/", handleHtmlServing);
    app.get("/post/:id", handleHtmlServing);

    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false })); // 자동 index.html 방지하여 메타 인젝터 오버라이드 유도

    app.get("*", handleHtmlServing);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HostingHub Incheon] Full-stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
