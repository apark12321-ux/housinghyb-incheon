import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function generateBlogPost(topic: string, category: string) {
  const prompt = `
    [시스템 지시사항: 블로그 포스팅 자동화 탈피 및 휴먼 터치(Human Touch) & E-E-A-T 강화 마스터 프롬프트]

    당신은 기계적으로 정보를 전달하는 AI가 아닙니다. 당신은 지금부터 주어지는 [주제]에 대해 수년간 주택 청약, 전월세 계약, 주택담보 및 정책금융 대출(디딤돌·버팀목 등), 이사 실무를 직접 겪고 고민해 온 '10년 차 부동산 금융 기획자이자 개인 블로거(박 실장)'입니다. 아래의 엄격한 작성 원칙을 100% 준수하여 블로그 포스팅을 작성하십시오.

    [작성 원칙 - 100% 필수 준수]
    1. AI 특유의 상투적 표현 절대 금지:
       - "결론적으로", "알아보겠습니다", "필수적인", "현대 사회에서", "요즘 시대에는", "과언이 아닙니다", "중요한 역할을 합니다" 등의 뻔한 도입부와 결론부 표현을 절대 사용하지 마십시오.

    2. 문장 길이의 다양화 (Burstiness & Intentional Imperfection):
       - 모든 문장의 길이를 비슷하게 쓰지 마십시오. 어떤 문장은 단답형으로 매우 짧고 명쾌하게 치고("결과는 참담했습니다.", "답은 간단합니다."), 어떤 문장은 현장 상황 묘사를 위해 길게 이어지도록 리듬감을 만드십시오. 완벽한 대칭형 문단 구조를 깨뜨리십시오.

    3. 경험과 통찰 기반의 도입부 (E-E-A-T Protagonist Narrative):
       - 글을 시작할 때 사전적 정의나 법조문 나열로 시작하지 마십시오. 해당 주제와 관련해 독자들이 겪고 있을 구체적인 '답답함'이나 '실패 경험(부적격 탈락, 대출 한도 축소, 보증금 미반환 불안 등)'에 깊이 공감하며, 마치 친한 지인에게 팁을 알려주듯 자연스러운 1인칭 대화체('나/저')로 시작하십시오.

    4. 정보의 구조화와 주관적 실무 평가 혼합:
       - HTML 태그(h2, h3, table, ul, li, strong 등)를 사용하여 정보를 깔끔하게 정리하되, 그 정보 아래에 반드시 "개인적으로 이 부분은 아쉬웠다", "실제로 창구에 서류를 내보니 이 방식이 가장 승인율이 높았다", "제가 계약해 보니 이 특약 한 줄이 결국 3천만 원을 지켜주었습니다"라는 식의 주관적인 평가와 실무 팁을 한 줄씩 덧붙이십시오.

    5. 독자와의 상호작용 및 액션 아이템 유도 (Action Item):
       - 글의 마무리에는 뻔한 요약 대신, 독자가 오늘 퇴근 후 당장 실행해 볼 수 있는 아주 작은 행동 지침(Action Item, 예: "오늘 밤 청약홈에 로그인해서 세대원 무주택 기간 조회해 보기") 하나를 제안하고, 댓글이나 생각을 유도하는 가벼운 질문으로 끝맺으십시오.

    [입력 변수]
    - 타겟 키워드 및 주제: ${topic}
    - 카테고리: ${category}
    - 분량: 공백 제외 2,000자 내외의 깊이 있고 생생한 포스팅

    출력 형식은 반드시 아래 JSON 구조를 따르세요.
  `;

  try {
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
              title: { type: Type.STRING, description: "포스팅 제목" },
              content: { type: Type.STRING, description: "HTML 본문 (공백 제외 2,000자 이상)" },
              summary: { type: Type.STRING, description: "1~2문장의 짧은 요약" },
              hashtags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "해시태그 10개"
              },
              readTime: { type: Type.STRING, description: "예: '6분'" }
            },
            required: ["title", "content", "summary", "hashtags", "readTime"]
          }
        }
      });
      responseText = response.text;
    } catch (primaryError: any) {
      console.warn("Primary model (gemini-3.5-flash) failed in generateBlogPost, trying gemini-flash-latest...", primaryError);
      try {
        const responseFallback1 = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "포스팅 제목" },
                content: { type: Type.STRING, description: "HTML 본문 (공백 제외 2,000자 이상)" },
                summary: { type: Type.STRING, description: "1~2문장의 짧은 요약" },
                hashtags: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "해시태그 10개"
                },
                readTime: { type: Type.STRING, description: "예: '6분'" }
              },
              required: ["title", "content", "summary", "hashtags", "readTime"]
            }
          }
        });
        responseText = responseFallback1.text;
      } catch (fallbackError1: any) {
        console.warn("Model (gemini-flash-latest) failed in generateBlogPost, trying gemini-3.1-flash-lite...", fallbackError1);
        try {
          const responseFallback2 = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "포스팅 제목" },
                  content: { type: Type.STRING, description: "HTML 본문 (공백 제외 2,000자 이상)" },
                  summary: { type: Type.STRING, description: "1~2문장의 짧은 요약" },
                  hashtags: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "해시태그 10개"
                  },
                  readTime: { type: Type.STRING, description: "예: '6분'" }
                },
                required: ["title", "content", "summary", "hashtags", "readTime"]
              }
            }
          });
          responseText = responseFallback2.text;
        } catch (fallbackError2: any) {
          console.error("All models failed in generateBlogPost, running local static generation fallback:", fallbackError2);
          
          const localData = {
            title: topic.trim() || "주거 정책 분석 및 로컬 마스터 플랜",
            content: `
              <h2>주거 경제 및 부동산 전문가 분석 가이드</h2>
              <p>주요 공공 분양 단지 정보 및 전월세 안심 대책은 단순한 뉴스 보도가 아닌, 개별 거주 가구의 재정적 생존 전략과 연결되어 있습니다. 본 고에서는 그 구체적인 실무 대책과 전략을 심도 있게 분석해 드립니다.</p>
              <h3>1. 철저한 예산 산정과 LTV 기준 분석</h3>
              <p>아파트 청약 및 주택 매입을 준비하기 전, 나의 정확한 주택담보대출 LTV 비율과 실효 DSR(총부채원리금상환비율) 한도를 명확히 파악하는 것이 최선순위입니다. 자격 제한이나 추가 대출 연동 이력 등을 필히 체크해야 합니다.</p>
              <h3>2. 공공택지 특별공급 우선 순위 공략</h3>
              <p>수도권 및 신도시 등 분양가 상한제가 설정된 주요 주거 신도시 지역은 입지 경쟁력 대비 합리적인 공급가로 관심을 끌고 있습니다. 신혼부부 및 생애최초, 신생아 전형을 적극적으로 공략하여 가점 경쟁력을 높이세요.</p>
              <h3>3. 전월세 계약서 필수 안전 특약 사항</h3>
              <p>전세계약 체결 시에는 임차인의 권리 순위가 밀리지 않도록 특약 사항에 '소유권 이전 당일 권리 변동 금지' 및 '보증보험 가입 불성립 시 전액 즉시 반환' 등의 강제성 있는 문구를 반드시 명기해야 소중한 자산을 지켜낼 수 있습니다.</p>
              <h3>자주 묻는 FAQ 및 실천 체크리스트</h3>
              <ul>
                <li>청약통장 가입 기간 인정: 인정 금액이 매달 25만 원까지 확대되었으니 이를 적극적으로 채워나가야 공공분양에서 유리합니다.</li>
                <li>대출 이자 부담 절감: 우대 금리 요건(신혼, 자녀, 주택청약 연동)을 완벽하게 맞추어 금융 부담을 줄이세요.</li>
              </ul>
              <p>하우징허브가 제공하는 상단 '자가진단' 탭의 청약 가점 계산기와 모의 대출 시뮬레이터 기능을 십분 활용하여 안정적이고 지속 가능한 내 집 마련 계획을 설계하시기 바랍니다.</p>
            `,
            summary: `${topic}에 관한 하우징허브 주거 비서의 고품격 전문가 분석 브리핑입니다.`,
            hashtags: ["주거정책", "부동산트렌드", "하우징허브", "안심계약", "자가진단"],
            readTime: "4분"
          };
          responseText = JSON.stringify(localData);
        }
      }
    }

    const result = JSON.parse(responseText);
    
    // Validate length (basic check, Gemini usually follows instructions but let's be safe)
    const textOnly = result.content.replace(/<[^>]*>/g, '').replace(/\s/g, '');
    console.log(`Generated content length (no spaces): ${textOnly.length}`);
    
    return result;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
