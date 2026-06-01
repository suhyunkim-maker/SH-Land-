import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3005;

// Logs Directory Setup
const LOGS_DIR = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function writeLog(filename: string, message: string) {
  const filePath = path.join(LOGS_DIR, filename);
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(filePath, logLine, "utf8");
}

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please supply it via Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API endpoint for summarizing meeting text
app.post("/api/summarize", async (req, res) => {
  try {
    const { title, department, participants, date, content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "음성 인식된 텍스트 내용이 비어 있습니다." });
    }

    const ai = getGeminiClient();
    
    const prompt = `
당신은 대모산 SH호텔사업부의 유능한 IT 서비스 기획 담당자이자 회의 지원 AI 비서입니다.
다음 미팅 정보를 분석하고 고품질의 실무 맞춤형 '회의록 요약 및 Action Item(To-Do)'을 도출해 주세요.

[미팅 메타데이터]
- 제목: ${title || "미지정 미팅"}
- 부서/참석자: ${department || "미지정"} | ${participants || "미지정"}
- 날짜: ${date || "오늘"}

[회의 녹취본 (STT) 내용]
${content}

이 내용을 기반으로 다음 형태의 상세한 요약을 만들어 주십시오.
1. 요약(summary)은 SH 공식 미팅 템플릿 양식에 맞추어 마크다운 포맷으로 가독성 높게 작성해 주세요. (핵심 안건, 주요 논의 사안 포함)
2. Action Items(Action Item 목록)는 각 업무별 기한이나 담당자가 대화 내용에 명시되어 있다면 해당 내용을 세부적으로 포함하여 분리된 배열 형태로 반환해 주세요.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "당신은 호텔사업부의 IT 서비스 PM입니다. 업무 효율성을 극대화할 수 있는 비즈니스 어조를 사용하고 요약을 구조화하여 마크다운 형태로 반환하세요.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "SH 호텔사업부 양식에 맞춘 논리적 마크다운 회의록 요약 (각종 섹션 헤딩, 글머리 목록 등 포함)"
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "실행 주체와 구체적인 미팅 후 이행해야 할 To-Do 목록"
            }
          },
          required: ["summary", "actionItems"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("AI 요약 생성에 실패했습니다.");
    }

    const parsedResult = JSON.parse(resultText);
    return res.json({
      summary: parsedResult.summary,
      actionItems: parsedResult.actionItems || []
    });

  } catch (err: any) {
    console.error("AI Summarize error:", err);
    return res.status(500).json({ 
      error: err.message || "AI 요약 생성 중 서버 오류가 발생했습니다." 
    });
  }
});

// GET /api/sync-blog - Fetches post metadata from suhyunkim-maker.github.io
app.get("/api/sync-blog", async (req, res) => {
  try {
    const response = await fetch("https://suhyunkim-maker.github.io/posts.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch posts.json: ${response.statusText}`);
    }
    const posts = await response.json();

    writeLog("blog_sync.log", `INFO: Blog synchronized successfully. Found ${posts.length} posts.`);
    writeLog("system_activity.log", `INFO: Synced suhyunkim-maker portfolio blog. Total posts: ${posts.length}`);

    return res.json({ posts });
  } catch (err: any) {
    console.error("Sync blog error:", err);
    writeLog("blog_sync.log", `ERROR: Sync failed. ${err.message}`);
    return res.status(500).json({ error: err.message || "블로그 연동 실패" });
  }
});

// POST /api/fetch-blog-post - Fetches raw markdown content for a post
app.post("/api/fetch-blog-post", async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: "파일 이름이 전달되지 않았습니다." });
    }

    const response = await fetch(`https://suhyunkim-maker.github.io/pages/${file}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch post file '${file}': ${response.statusText}`);
    }
    const content = await response.text();

    writeLog("system_activity.log", `INFO: Fetched blog post content: ${file}`);

    return res.json({ content });
  } catch (err: any) {
    console.error("Fetch blog post error:", err);
    return res.status(500).json({ error: err.message || "포스트 내용 로드 실패" });
  }
});

// POST /api/log-meeting - Logs a meeting summary and action items to the server file
app.post("/api/log-meeting", async (req, res) => {
  try {
    const { id, title, department, participants, date, summary, actionItems } = req.body;

    const logData = {
      id,
      title,
      department,
      participants,
      date,
      summary,
      actionItems,
      loggedAt: new Date().toISOString()
    };

    writeLog("meetings.log", `MEETING_SAVED: ${JSON.stringify(logData)}`);
    writeLog("system_activity.log", `INFO: Meeting record logged. Title: "${title || 'Untitled'}"`);

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Log meeting error:", err);
    return res.status(500).json({ error: err.message || "회의록 서버 로그 저장 실패" });
  }
});

// GET /api/logs - Reads system logs for the frontend Log Viewer
app.get("/api/logs", async (req, res) => {
  try {
    const syncLogPath = path.join(LOGS_DIR, "blog_sync.log");
    const meetingsLogPath = path.join(LOGS_DIR, "meetings.log");
    const activityLogPath = path.join(LOGS_DIR, "system_activity.log");

    const syncLogs = fs.existsSync(syncLogPath) ? fs.readFileSync(syncLogPath, "utf8") : "";
    const meetingLogs = fs.existsSync(meetingsLogPath) ? fs.readFileSync(meetingsLogPath, "utf8") : "";
    const activityLogs = fs.existsSync(activityLogPath) ? fs.readFileSync(activityLogPath, "utf8") : "";

    return res.json({
      syncLogs: syncLogs.trim().split("\n").filter(Boolean),
      meetingLogs: meetingLogs.trim().split("\n").filter(Boolean),
      activityLogs: activityLogs.trim().split("\n").filter(Boolean),
    });
  } catch (err: any) {
    console.error("Fetch logs error:", err);
    return res.status(500).json({ error: err.message || "로그 파일 읽기 실패" });
  }
});

// Setup Vite middleware in dev or Static serving in production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SH Hotel Meeting Recorder Server listening on port ${PORT}`);
  });
}

setupViteOrStatic().catch(err => {
  console.error("Failed to start server:", err);
});
