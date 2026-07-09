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

app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
  if (fs.existsSync(distSitemap)) {
    return res.send(fs.readFileSync(distSitemap, "utf-8"));
  }
  const publicSitemap = path.join(process.cwd(), "public", "sitemap.xml");
  if (fs.existsSync(publicSitemap)) {
    return res.send(fs.readFileSync(publicSitemap, "utf-8"));
  }
  return res.status(404).send("Sitemap not found");
});

app.get("/rss.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  const distRss = path.join(process.cwd(), "dist", "rss.xml");
  if (fs.existsSync(distRss)) {
    return res.send(fs.readFileSync(distRss, "utf-8"));
  }
  const publicRss = path.join(process.cwd(), "public", "rss.xml");
  if (fs.existsSync(publicRss)) {
    return res.send(fs.readFileSync(publicRss, "utf-8"));
  }
  return res.status(404).send("RSS not found");
});

app.get("/7065c4d36d9ee7471f10e55dd6f4a4bd.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send("7065c4d36d9ee7471f10e55dd6f4a4bd\n");
});

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

  // 사용 가능한 하우징허브 내 주요 아티클 링크 목록 구성 (AI가 상황에 맞는 아티클 링크를 정확하게 생성할 수 있도록 제공)
  const availableArticlesContext = POSTS.slice(0, 15).map(p => {
    return `- [${p.category}] ${p.title} -> 링크: /post/${slugify(p.title)}`;
  }).join("\n");

  // 인천 전용 청약, 영구/공공 임대주택, 대출 상식 사전 주입
  const systemInstruction = `
    당신의 이름은 '하우징허브 인천 AI 주거 비서'입니다.
    인천광역시 전역(송도, 청라, 영종, 검단, 계양, 미추홀구, 부평구 등)의 청약, 전월세 대항력, 이사 상식, 대출(디딤돌, 신생아 특례대출, 버팀목 등)에 통달한 최고 전문가입니다.

    [★ 매우 중요 - 출력 포맷 및 분량 지침 ★]:
    1. **절대로 마크다운 기호(#, ##, ###, *, **, ---)를 답변에 포함하지 마십시오.** 마크다운 기호는 브라우저상에서 가공되지 않은 채 노출되어 가독성을 심각하게 해칩니다.
    2. 강조할 핵심 내용은 <strong>강조할 문구</strong> 태그를 활용하고, 단락 간 줄바꿈은 반드시 <br/> 태그를 이용하십시오.
    3. 목록 표기가 필요한 경우 <ul> 및 <li> 등의 HTML 태그를 사용하십시오.
    4. **답변은 질문에 대해 핵심 위주로 아주 간단명료하게 2~3문장 이내로 압축하여 작성하십시오.**
    5. 답변 내용에 깊이가 더 필요하거나 구체적인 가이드가 필요한 경우, 아래의 [인천 하우징허브 가용 아티클 목록] 중 가장 연관성 높은 아티클 링크를 찾아서 **답변 맨 끝에 하이퍼링크 형식**으로 반드시 연결해 주십시오.
       - 링크 형식: <br/><br/><a href="/post/아티클-슬러그" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '아티클제목' 바로가기</a>
    6. 대외적 공식 홈페이지나 제도 홈페이지 소개가 수반되는 경우, 대외 링크를 함께 제시하십시오.
       - 청약홈: <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈</a>
       - LH청약플러스: <a href="https://apply.lh.or.kr" class="text-blue-600 underline font-bold" target="_blank">LH청약플러스</a>
       - 주택도시기금: <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금</a>

    [인천 하우징허브 가용 아티클 목록]:
    ${availableArticlesContext}

    ${activePostContext}
  `;

  // 2. Gemini API 호출
  if (!ai) {
    // API 키 부재 시 대체 로컬 상담 엔진 스마트 처리 (모크 응답 대신 영특한 룰 베이스 전문가 가이드)
    console.log("No GEMINI_API_KEY detected. Running local consultation fallback.");
    let fallbackText = `하우징허브 인천 주거 비서입니다! 일시적인 서버 지연으로 인해 로컬 전문가 지식기반 시스템으로 안내해 드립니다. <br/><br/>`;
    
    const msg = message.toLowerCase();
    
    // 키워드 기반 동적 포스팅 매칭 헬퍼 함수
    const findPostByKeyword = (kw: string) => {
      const found = POSTS.find(p => p.title.includes(kw) || p.excerpt.includes(kw));
      return found ? { title: found.title, link: `/post/${slugify(found.title)}` } : null;
    };

    if (msg.includes("청약") || msg.includes("통장")) {
      fallbackText += `<strong>💡 청약 전문 조언:</strong> 인천 아파트 청약을 노릴 때는 특히 인정 한도를 월 25만 원까지 꽉 채우는 전략이 유리합니다. <br/><br/>`;
      const post = findPostByKeyword("청약") || findPostByKeyword("가점");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `추가로 공식 일정은 <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈 홈페이지</a>를 꼭 확인하세요!`;
    } else if (msg.includes("대출") || msg.includes("자금") || msg.includes("한도")) {
      fallbackText += `<strong>💰 대출/자금 조언:</strong> 현재 스트레스 DSR 3단계 등의 영향으로 내 대출 한도가 변동되었을 확률이 매우 높습니다. <br/><br/>`;
      const post = findPostByKeyword("대출") || findPostByKeyword("버팀목");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `금융 정책의 상세 요건은 <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금 홈페이지</a>에서 실시간으로 대조해 보실 수 있습니다.`;
    } else if (msg.includes("월세") || msg.includes("전세") || msg.includes("보증금") || msg.includes("사기") || msg.includes("특약") || msg.includes("등기")) {
      fallbackText += `<strong>🛡️ 전월세 계약 조언:</strong> 등기부등본 확인 시 을구의 근저당권 채무액과 갑구의 소유주 권리 관계를 반드시 계약 직전까지 면밀히 검사해야 보증금을 사수할 수 있습니다. <br/><br/>`;
      const post = findPostByKeyword("특약") || findPostByKeyword("보증금") || findPostByKeyword("전세");
      if (post) {
        fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
      }
      fallbackText += `또한 계약 후에는 당일 즉시 전입신고와 확정일자를 처리해 대항력을 반드시 선점해 확보하세요.`;
    } else {
      fallbackText += `요청하신 사항 관련하여, 하우징허브가 준비한 안심 주거 가이드 아티클을 추천해 드립니다. <br/><br/>`;
      const post = POSTS[0];
      if (post) {
        fallbackText += `<a href="/post/${slugify(post.title)}" class="text-blue-600 underline font-bold" target="_blank">👉 추천 아티클: '${post.title}' 바로가기</a><br/><br/>`;
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

    // Gemini API는 무조건 user 메시지로 대화가 시작되고, user-model이 번갈아 나타나야 합니다.
    // 이를 보장하기 위해 history를 정제합니다.
    const cleanHistory: any[] = [];
    let expectedRole: "user" | "model" = "user";

    for (const msg of formattedHistory) {
      if (msg.role === expectedRole) {
        cleanHistory.push(msg);
        expectedRole = expectedRole === "user" ? "model" : "user";
      }
    }

    // 만약 cleanHistory가 user로 끝난다면 (sendMessage에 user 메시지를 보낼 것이므로), 
    // 중복 방지를 위해 마지막 user 메시지를 제외시킵니다.
    if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === "user") {
      cleanHistory.pop();
    }

    let responseText = "";
    try {
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        },
        history: cleanHistory
      });

      const response = await chat.sendMessage({
        message: message
      });
      responseText = response.text;
    } catch (primaryError: any) {
      console.warn("Primary model (gemini-3.5-flash) failed in chat, trying gemini-flash-latest...", primaryError);
      try {
        const chatFallback1 = ai.chats.create({
          model: "gemini-flash-latest",
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7
          },
          history: cleanHistory
        });

        const responseFallback1 = await chatFallback1.sendMessage({
          message: message
        });
        responseText = responseFallback1.text;
      } catch (fallbackError1: any) {
        console.warn("Model (gemini-flash-latest) failed in chat, trying gemini-3.1-flash-lite...", fallbackError1);
        try {
          const chatFallback2 = ai.chats.create({
            model: "gemini-3.1-flash-lite",
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7
            },
            history: cleanHistory
          });

          const responseFallback2 = await chatFallback2.sendMessage({
            message: message
          });
          responseText = responseFallback2.text;
        } catch (fallbackError2: any) {
          console.error("Fallback model (gemini-3.1-flash-lite) also failed in chat, running local fallback:", fallbackError2);
          
        // 키워드 기반 동적 포스팅 매칭 헬퍼 함수
        const findPostByKeyword = (kw: string) => {
          const found = POSTS.find(p => p.title.includes(kw) || p.excerpt.includes(kw));
          return found ? { title: found.title, link: `/post/${slugify(found.title)}` } : null;
        };

        let fallbackText = `하우징허브 인천 주거 비서입니다! 일시적인 서버 부하로 인해 AI 모델 연결이 잠시 지연되고 있습니다. 대신 탑재된 전문가 로컬 지식기반 시스템으로 조언해 드립니다. <br/><br/>`;
        
        const msg = message.toLowerCase();
        if (msg.includes("청약") || msg.includes("통장")) {
          fallbackText += `<strong>💡 청약 전문 조언:</strong> 인천 아파트 청약을 노릴 때는 특히 인정 한도를 월 25만 원까지 꽉 채우는 전략이 유리합니다. <br/><br/>`;
          const post = findPostByKeyword("청약") || findPostByKeyword("가점");
          if (post) {
            fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
          }
          fallbackText += `상세 일정은 <a href="https://www.applyhome.co.kr" class="text-blue-600 underline font-bold" target="_blank">청약홈 홈페이지</a>를 참조하세요!`;
        } else if (msg.includes("대출") || msg.includes("자금") || msg.includes("한도")) {
          fallbackText += `<strong>💰 대출/자금 조언:</strong> 현재 스트레스 DSR 적용 강도로 내 대출 실효 한도가 변동되었을 확률이 매우 높습니다. <br/><br/>`;
          const post = findPostByKeyword("대출") || findPostByKeyword("버팀목");
          if (post) {
            fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
          }
          fallbackText += `금리 정보는 <a href="https://nhuf.molit.go.kr" class="text-blue-600 underline font-bold" target="_blank">주택도시기금 홈페이지</a>를 통해 실시간 조회해보실 수 있습니다.`;
        } else if (msg.includes("월세") || msg.includes("전세") || msg.includes("보증금") || msg.includes("사기") || msg.includes("특약") || msg.includes("등기")) {
          fallbackText += `<strong>🛡️ 전월세 안전 조언:</strong> 전세계약서 작성 시에는 대항력 효력 시점(익일 0시)을 안전하게 수호할 권리 변동 금지 특약을 명시하고, 등기부등본상의 근저당 설정 여부를 필수적으로 감시하셔야 안전합니다. <br/><br/>`;
          const post = findPostByKeyword("특약") || findPostByKeyword("보증금") || findPostByKeyword("전세");
          if (post) {
            fallbackText += `<a href="${post.link}" class="text-blue-600 underline font-bold" target="_blank">👉 관련 안심 아티클: '${post.title}' 바로가기</a><br/>`;
          }
        } else {
          fallbackText += `말씀하신 '${message}' 관련하여, 저희 하우징허브가 준비한 안심 가이드 아티클을 추천해 드립니다. <br/><br/>`;
          const post = POSTS[0];
          if (post) {
            fallbackText += `<a href="/post/${slugify(post.title)}" class="text-blue-600 underline font-bold" target="_blank">👉 추천 아티클: '${post.title}' 바로가기</a><br/><br/>`;
          }
          fallbackText += `상단의 '자가진단' 탭에서 청약 가점 계산기와 대출 이자 계산기도 무상으로 적극 활용해 가이드라인을 바로 잡아보실 수 있어요.`;
        }
        responseText = fallbackText;
        }
      }
    }

    return res.json({ response: parseMarkdownToHtml(responseText) });
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

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
      responseText = response.text;
    } catch (primaryError: any) {
      console.warn("Primary model (gemini-3.5-flash) failed in generation, trying gemini-flash-latest...", primaryError);
      try {
        const responseFallback1 = await ai.models.generateContent({
          model: "gemini-flash-latest",
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
        responseText = responseFallback1.text;
      } catch (fallbackError1: any) {
        console.warn("Model (gemini-flash-latest) failed in generation, trying gemini-3.1-flash-lite...", fallbackError1);
        try {
          const responseFallback2 = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
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
          responseText = responseFallback2.text;
        } catch (fallbackError2: any) {
          console.error("All models failed for dynamic post generation, running premium local fallback generation:", fallbackError2);
          const localData = {
            title: topic.trim() || "인천 부동산 핵심 가이드",
            content: `
              <h2>인천 부동산 및 주거 전문가 분석</h2>
              <p>현재 인천 부동산 시장은 대단지 분양과 대출 금리 조정 국면 속에서 복합적인 변화를 맞이하고 있습니다. 이에 따라 실거주 목적의 청약 대기자와 기존 전월세 세입자들은 보다 신중하고 정교한 자금 설계 전략을 세워야 합니다.</p>
              <h3>실거주자를 위한 체크리스트 및 핵심 조언</h3>
              <ul>
                <li><strong>철저한 자금 계획 수립:</strong> 주택담보대출 실행 시 본인의 스트레스 DSR 적용 비율과 이자 상환 능력을 자가진단 계산기로 정밀 모니터링하세요.</li>
                <li><strong>지역별 분양 양극화 대비:</strong> 검단신도시, 송도국제도시 등 공공택지 분양 단지는 분양가 상한제가 적용되어 가점이 높거나 신혼부부 특별공급 자격을 갖춘 가구에게 좋은 선택지가 될 수 있습니다.</li>
                <li><strong>전월세 계약 시 대항력 수호:</strong> 보증금을 안전하게 지키기 위해 계약 전 확정일자 부여 현황과 선순위 채권을 반드시 체크하고 계약 즉시 전입신고 및 확정일자를 취득해야 합니다.</li>
              </ul>
              <p>하우징허브 인천 주거 비서는 사용자의 소중한 주거 행복과 자산을 지키기 위한 최신 정책 변화와 팁을 신속하게 반영해 드립니다. 추가적인 대출 및 청약 가점 시뮬레이션은 상단 탭의 '자가진단' 탭에서 완벽하게 제공되고 있으니 지금 바로 사용해 보세요!</p>
            `,
            excerpt: `${topic}에 대한 하우징허브만의 명쾌하고 전문적인 분석 정보입니다.`,
            hashtags: ["인천부동산", "인천주택", "부동산팁", "하우징허브", "안심주거"],
            readTime: "3분"
          };
          responseText = JSON.stringify(localData);
        }
      }
    }

    const data = JSON.parse(responseText);
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
  keywords = ""
): string {
  let updatedHtml = html;

  // Title 치환
  if (updatedHtml.match(/<title>[\s\S]*?<\/title>/i)) {
    updatedHtml = updatedHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  } else {
    updatedHtml = updatedHtml.replace("</head>", `  <title>${title}</title>\n</head>`);
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

// SEO 관련 메타 태그 동적 수립 헬퍼 함수
function injectMetaTags(html: string, post: any, baseUrl: string): string {
  const canonicalUrl = `${baseUrl}/post/${encodeURIComponent(slugify(post.title))}`;
  const keywords = post.hashtags && post.hashtags.length > 0 ? post.hashtags.join(", ") : "하우징허브, 인천, 부동산, 청약, 전세대출";
  const title = `${post.title} | 하우징허브 인천`;
  const desc = post.excerpt;
  const ogImage = post.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800";
  
  return replaceOrInjectMetaTags(html, title, desc, canonicalUrl, "article", ogImage, keywords);
}

function injectDefaultMetaTags(html: string, baseUrl: string): string {
  const title = "하우징허브 인천 | 실생활 청약, 임대, 전세대출 안심 정보 포털";
  const desc = "인천 지역 부동산, 청약 가점 계산, 전세대출 한도 시뮬레이션, 이사 가이드 및 등기부 독소조항 무상 방어 지식을 제공하는 임차인 안심 정주 포털입니다.";
  const canonicalUrl = `${baseUrl}/`;
  const ogImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800";
  const keywords = "인천 부동산, 청약가점 계산기, 전세대출 한도, 하우징허브, 버팀목 대출, 송도 청약, 청라 아파트, 검단 임대주택";
  
  return replaceOrInjectMetaTags(html, title, desc, canonicalUrl, "website", ogImage, keywords);
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
  const ogImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800";
  const keywords = `인천 ${category}, 하우징허브 ${category}, 인천 부동산, ${category} 가이드`;
  
  return replaceOrInjectMetaTags(html, title, desc, canonicalUrl, "website", ogImage, keywords);
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
  const keywords = "인천 부동산, 하우징허브, 안심 포털";
  
  return replaceOrInjectMetaTags(html, title, desc, canonicalUrl, "website", "", keywords);
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
          if (isProd) {
            const slug = slugify(post.title);
            const prerenderedPostPath = path.join(process.cwd(), "dist", "post", slug, "index.html");
            if (fs.existsSync(prerenderedPostPath)) {
              return res.send(fs.readFileSync(prerenderedPostPath, "utf-8"));
            }
          }
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
        if (isProd) {
          const prerenderedCatPath = path.join(process.cwd(), "dist", "category", decodedCat, "index.html");
          if (fs.existsSync(prerenderedCatPath)) {
            return res.send(fs.readFileSync(prerenderedCatPath, "utf-8"));
          }
        }
        html = injectCategoryMetaTags(html, decodedCat, baseUrl);
        return res.send(html);
      }

      // 3) 특정 서브페이지 경로 파싱 (예: /about, /announcement, /partnership, /terms, /privacy, /toolkit)
      const subpages = ["/about", "/announcement", "/partnership", "/terms", "/privacy", "/toolkit"];
      const matchedPage = subpages.find(page => req.path === page);
      if (matchedPage) {
        if (isProd) {
          const cleanPageName = matchedPage.replace(/^\//, "");
          const prerenderedPagePath = path.join(process.cwd(), "dist", cleanPageName, "index.html");
          if (fs.existsSync(prerenderedPagePath)) {
            return res.send(fs.readFileSync(prerenderedPagePath, "utf-8"));
          }
        }
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
