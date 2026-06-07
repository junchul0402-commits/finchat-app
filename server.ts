import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";

// Environment-safe directory path determination for both ESM and CommonJS
const dirName = typeof __dirname !== "undefined"
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `
당신은 FinChat(핀챗)의 AI 금융 상담원입니다.

## 역할과 원칙
- 사회초년생을 위한 중립적이고 친절한 금융 정보 제공자입니다
- 특정 금융기관이나 상품을 추천·권유하지 않습니다
- 모든 정보는 금융감독원 공공 데이터 기준으로 제공합니다
- 전문 용어는 반드시 쉬운 설명을 함께 제공합니다
- 판매 압박 없는 중립적인 대화를 유지합니다

## 사용자 금융 가치관 유형
현재 사용자의 진단 결과: [USER_TYPE]

유형별 상담 방향:
- 안정형: 원금 보존 중심, 예금·적금 위주로 설명, 리스크 최소화 강조. (예: 예·적금, 주택청약, 원금보장형 ISA에 관심이 많습니다)
- 균형형: 안정과 성장 균형, 분산 투자 관점, 중간 리스크 상품 설명. (예: 예·적금과 주식형 ETF 분산 포트폴리오, IRP, 균형형 ISA 등에 관심이 많습니다)
- 성장형: 성장 잠재력 강조, ETF·투자 상품 설명, 단 비상금 먼저 강조. (예: 주식형 ETF, 글로벌 펀드, 공격형 ISA 투자 등에 관심이 많습니다. 단 비상금 마련의 중요성도 일깨워주세요)

## 답변 형식 (반드시 준수)
1. 친근하고 쉬운 언어 사용 (존댓말, 이모티콘을 대화에 어울리게 적절히 활용)
2. 전문 용어 등장 시 괄호 안에 쉬운 설명 추가
   예: "IRP(개인형 퇴직연금 — 세금 혜택을 받으며 노후를 준비하는 계좌)"
   예: "ISA(개인종합자산관리계좌 — 한 계좌에서 다양한 금융 상품을 굴리며 세금 혜택을 받는 절세 계좌)"
   예: "ETF(상장지수펀드 — 주식처럼 편리하게 편리하게 사고팔 수 있는 분산 투자 펀드)"
3. 답변 길이: 3~5문장으로 친근하고 컴팩트하게 작성 (너무 길지 않게)
4. 구체적인 수치나 금리는 "참고용"임을 명시
5. 마지막에 반드시 면책 고지 문장을 줄바꿈 후 추가:
   "⚠ 이 내용은 금융 상품 권유가 아닌 정보 제공 목적입니다. 실제 가입 전 해당 금융기관에 확인하세요."

## 금지 사항
- "A 은행 상품이 더 좋습니다" 또는 "B 카드사가 낫습니다" 같은 특정 상업 기관/상품의 직접적인 지칭이나 부추김 절대 금지 (중립성 유지)
- 확실하지 않은 미래 수익률·금리 단정 금지
- 매수·매도 직접적 종용 금지
- 개인 식별 정보(실명, 주민등록번호, 구체적인 계좌번호, 실제 비밀번호 등) 요청 금지
`;

function getUserTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    'A': '안정형 투자자 🛡️ — 원금 보존 최우선, 안전한 저축과 비상금 확보를 원함',
    'B': '균형형 투자자 ⚖️ — 안정과 성장 균형, 예·적금+적당한 ETF 투자를 원함',
    'C': '성장형 투자자 🚀 — 적극적인 자산 증식, 투자 리스크 감수 및 고수익 투자 원함'
  };
  return type ? (labels[type] || '미진단') : '미진단';
}

// AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userType, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message parameter is required and must be a string." });
    }

    // Attempt to initialize or fetch the Gemini client
    let ai;
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      console.error("Gemini init error:", e);
      return res.status(500).json({
        error: "GEMINI_API_KEY가 설정되지 않았습니다. AI Studio Settings > Secrets 패널에서 설정해주세요."
      });
    }

    const typeLabel = getUserTypeLabel(userType);
    const systemPrompt = SYSTEM_PROMPT.replace('[USER_TYPE]', typeLabel);

    // Build context with history
    let contents = "";
    if (Array.isArray(history) && history.length > 0) {
      contents += "이전 상담 나눈 내용:\n";
      // Limit to last 6 messages
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        const roleName = h.sender === "ai" ? "핀챗 AI" : "사용자";
        contents += `${roleName}: ${h.text}\n`;
      }
      contents += "\n";
    }
    contents += `신규 질문내용:\n사용자: ${message}\n핀챗 AI:`;

    // 10 seconds timeout support via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Robust retry with fallback mechanism using valid, modern models
      const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash"];
      let lastError: any = null;
      let replyText = "";
      
      for (const modelName of modelsToTry) {
        let retries = 2; // Tries with backoff
        let delay = 600; // start with 600ms backoff
        
        while (retries >= 0) {
          if (controller.signal.aborted) {
            throw new Error("AbortError");
          }
          
          try {
            console.log(`[FinChat] Requesting generation using ${modelName} (${retries} retries remaining)`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: contents,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
              },
            });
            
            if (response.text) {
              replyText = response.text;
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`[FinChat] ${modelName} failed:`, err);
            
            if (err.name === "AbortError" || controller.signal.aborted) {
              throw err;
            }
            
            const errStatus = err.status || err.statusCode || (err.error && err.error.code);
            const errMsg = err.message || "";
            const isTransient = errStatus === 503 || errStatus === 429 || errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("demand");
            
            if (isTransient && retries > 0) {
              console.log(`[FinChat] Rentention delay for ${delay}ms...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
              delay *= 2;
              retries--;
              continue;
            }
          }
          break; // break retry loop if not transient or no retries left
        }
        
        if (replyText) {
          break; // break out of fallback list since we got a reply
        }
      }

      clearTimeout(timeoutId);

      if (!replyText && lastError) {
        throw lastError;
      }

      res.json({ text: replyText || "죄송해요, 답변을 생성하지 못했습니다. 다시 한 번 질문해주세요." });
    } catch (apiError: any) {
      clearTimeout(timeoutId);
      console.error("Gemini API call failed:", apiError);
      
      if (apiError.name === "AbortError" || apiError.message?.includes("abort")) {
        return res.status(504).json({ error: "상담원의 답변이 10초 내에 도착하지 않았습니다. 네트워크 환경을 보거나 재시도 해주세요." });
      }

      const errMsg = apiError.message || "";
      const errStatus = apiError.status || apiError.statusCode || (apiError.error && apiError.error.code);
      const isQuotaExhausted = errStatus === 429 || 
                               errMsg.includes("RESOURCE_EXHAUSTED") || 
                               errMsg.toLowerCase().includes("quota") || 
                               errMsg.toLowerCase().includes("rate limit") ||
                               errMsg.toLowerCase().includes("exhausted") ||
                               errMsg.toLowerCase().includes("limitexceeded");

      if (isQuotaExhausted) {
        return res.status(429).json({
          error: "현재 사용 중이신 Gemini API 키의 **크레딧 또는 할당량(Quota)이 소진**되었거나 **분당 호출 한도(Rate Limit)**에 도달했습니다.\n\n💡 해결 방법:\n1) **분당 호출제한(RPM)초과**: 약 1분 정도 잠시만 대기 후 전송해 보세요.\n2) **일일 무료 할당량 소진**: 하루 제공량이 끝나서 대기해야 할 수 있습니다.\n3) **API 키는 그대로 유지하면서 즉시 한도 늘리기**: Google AI Studio의 Billing 메뉴에서 결제 카드만 등록(Pay-as-you-go 요금제 연동)해주시면, API 키를 바꾸지 않아도 바로 한도가 대폭 상향되어 즉시 원활하게 정상 대화가 가능해집니다."
        });
      }
      
      return res.status(502).json({ error: `금융 상담원과의 연결이 원활하지 않습니다. (에러: ${apiError.message || "UNAVAILABLE"}) 잠시 후 질문을 다시 보내주세요.` });
    }
  } catch (err: any) {
    console.error("General API Error:", err);
    res.status(500).json({ error: "인터널 서버 에러가 발생했습니다." });
  }
});

// Configure Vite or Static Serve middleware
async function startApp() {
  let isDevMode = process.env.NODE_ENV !== "production";
  let vite: any = null;

  if (isDevMode) {
    try {
      // Development server with HMR / middleware mode dynamically loading Vite
      const { createServer: createViteServer } = await import("vite");
      vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[FinChat Config] Development server with Vite middleware started successfully.");
    } catch (devLoadErr) {
      console.warn("[FinChat Warning] Failed to load Vite middleware, falling back to static build serve.", devLoadErr);
      isDevMode = false;
    }
  }

  if (isDevMode && vite) {
    // Development catch-all to serve index.html with Vite's HTML transforming
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const rootIndex = path.join(process.cwd(), "index.html");
        if (fs.existsSync(rootIndex)) {
          let template = fs.readFileSync(rootIndex, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    });
  } else {
    // Production static asset serving
    let distPath = path.join(process.cwd(), "dist");

    // Robust multi-path fallback checking to support various container structures
    if (!fs.existsSync(path.join(distPath, "index.html"))) {
      const parentDir = path.dirname(dirName); // parent dir of current file/bundle
      const pathsToTry = [
        dirName,                                  // maybe we are running within dist itself
        path.join(parentDir, "dist"),               // root/dist from outside dist
        path.join(process.cwd(), "workspace", "dist"), // workspace dir
        "/workspace/dist"                           // absolute fallback
      ];
      for (const p of pathsToTry) {
        if (p && fs.existsSync(path.join(p, "index.html"))) {
          distPath = p;
          break;
        }
      }
    }

    console.log(`[FinChat Config] Production assets path selected: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const htmlFile = path.join(distPath, "index.html");
      if (fs.existsSync(htmlFile)) {
        res.sendFile(htmlFile);
      } else {
        console.error(`[FinChat Error] index.html not found in distPath: ${distPath}`);
        res.status(404).send("Error: index.html not found on server.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FinChat App] running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
  });
}

startApp().catch((err) => {
  console.error("Failed to start server on port 3000:", err);
});
