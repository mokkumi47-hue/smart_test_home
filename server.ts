import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limit for base64 image uploads
app.use(express.json({ limit: "50mb" }));

// Initialize GoogleGenAI with custom User-Agent for telemetry as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API endpoint to analyze exam sheet
app.post("/api/analyze", async (req, res): Promise<any> => {
  try {
    const { imageBase64, mimeType, images } = req.body;

    const hasImages = (images && Array.isArray(images) && images.length > 0) || imageBase64;
    if (!hasImages) {
      return res.status(400).json({ error: "분석할 시험지 파일(이미지 또는 PDF)이 누락되었습니다." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY가 서버에 설정되지 않았습니다. 설정 > Secrets 메뉴에서 설정을 확인해 주세요.",
      });
    }

    const contents: any[] = [];

    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.imageBase64) {
          const cleanBase64 = img.imageBase64.replace(/^data:[^;]+;base64,/, "");
          contents.push({
            inlineData: {
              mimeType: img.mimeType || "image/jpeg",
              data: cleanBase64,
            },
          });
        }
      }
    } else if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const prompt = `
      첨부된 파일(이미지 또는 PDF)들을 분석하여 개별 학교/학원의 시험지 분석 보고서를 생성하세요.

      [중요 - 다중 학교 지원 수칙]:
      - 사용자가 11개 등의 다수의 여러 다른 학교 시험지를 한번에 업로드할 수 있으므로, 각 파일의 헤더 및 문제를 파악하여 서로 다른 학교(또는 서로 다른 과목/시험)인 경우 반드시 각각 별개의 시험 정보 항목으로 구분 및 분할 분석하여 'exams' 배열 내에 각각 분석 데이터를 저장하세요.
      - 만약 같은 학교의 여러 페이지인 경우 하나의 시험 항목으로 병합하여 분석해 주세요. 
      - 단 1개의 시험지만 포함된 경우에도 'exams' 배열 내에 1개의 항목으로 구조화해서 반환하세요.

      각 시험마다 다음을 상세히 수행하십시오:
      1. 시험지 기본정보를 추출하세요 (학교/학원명, 학년, 과목, 단원, 학생이름 - 시험지에 기재되지 않은 경우 추론하여 기입하거나 '미확인'으로 입력)
      2. 해당 시험의 전 문제를 분석하여 번호 고유화, 문항 내용 요약, 학생 정답, 채점 결과(정오답)를 산출하세요.
      3. 점수(100점 만점 환산)와 정답 수, 총 문제 수를 계산하세요.
      4. 위 채점 결과를 바탕으로 추가 취약 유형 분석(취약/주의/우수 등급과 패턴 요약)과 일별 맞춤 학습 계획(월~금)을 포함하세요.
      5. 반드시 지정된 JSON 규격 구조(전체 root가 'exams' 배열을 가짐)로 완벽히 구조화하여 출력하세요.
    `;

    contents.push({
      text: prompt,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exams: {
              type: Type.ARRAY,
              description: "식별된 각 개별 시험지 분석 목록 (업로드된 11개 등 다수의 학교별 시험을 독립 채점)",
              items: {
                type: Type.OBJECT,
                properties: {
                  info: {
                    type: Type.OBJECT,
                    properties: {
                      school: {
                        type: Type.STRING,
                        description: "학교 또는 학원명",
                      },
                      grade: {
                        type: Type.STRING,
                        description: "대상 학년",
                      },
                      subject: {
                        type: Type.STRING,
                        description: "과목명",
                      },
                      unit: {
                        type: Type.STRING,
                        description: "단원 또는 시험 범위",
                      },
                      student: {
                        type: Type.STRING,
                        description: "학생 이름 (본문에 없을 시 '미확인')",
                      },
                      total_pages: {
                        type: Type.INTEGER,
                        description: "해당 시험지에 포함된 페이지 수",
                      },
                    },
                    required: ["school", "grade", "subject", "unit", "student", "total_pages"],
                  },
                  questions: {
                    type: Type.ARRAY,
                    description: "해당 시험에서 찾아낸 개별 문항 채점 내역 목록",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        no: {
                          type: Type.INTEGER,
                          description: "문제 번호",
                        },
                        page: {
                          type: Type.INTEGER,
                          description: "해당 문제의 페이지 번호",
                        },
                        content: {
                          type: Type.STRING,
                          description: "문제 요약",
                        },
                        student_answer: {
                          type: Type.STRING,
                          description: "학생이 쓴 답",
                        },
                        correct: {
                          type: Type.BOOLEAN,
                          description: "정답 여부 (true/false)",
                        },
                      },
                      required: ["no", "page", "content", "student_answer", "correct"],
                    },
                  },
                  score: {
                    type: Type.OBJECT,
                    properties: {
                      correct_count: {
                        type: Type.INTEGER,
                        description: "맞춘 문항 수",
                      },
                      total: {
                        type: Type.INTEGER,
                        description: "총 문항 수",
                      },
                      percentage: {
                        type: Type.INTEGER,
                        description: "100점 만점 기준 환산 점수",
                      },
                    },
                    required: ["correct_count", "total", "percentage"],
                  },
                  weaknesses: {
                    type: Type.ARRAY,
                    description: "취약 유형 유형들과 심각도 판정 목록",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: {
                          type: Type.STRING,
                          description: "심각도 (취약, 주의, 우수 중 선택)",
                        },
                        description: {
                          type: Type.STRING,
                          description: "패턴 요약 설명",
                        },
                      },
                      required: ["type", "description"],
                    },
                  },
                  study_plan: {
                    type: Type.ARRAY,
                    description: "월~금 요일별 추천 학습 주제와 추천제 수 계획",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: {
                          type: Type.STRING,
                          description: "요일 (월요일, 화요일, 수요일, 목요일, 금요일)",
                        },
                        topic: {
                          type: Type.STRING,
                          description: "추천 복습 주제 및 보완 설명",
                        },
                        problems: {
                          type: Type.INTEGER,
                          description: "추천 연습 문제 개수",
                        },
                      },
                      required: ["day", "topic", "problems"],
                    },
                  },
                },
                required: ["info", "questions", "score", "weaknesses", "study_plan"],
              },
            },
          },
          required: ["exams"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini로부터 올바른 분석 데이터를 수신하지 못했습니다.");
    }

    const jsonResult = JSON.parse(resultText);
    res.json(jsonResult);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "시험지 분석 중 내부 서버 오류가 발생했습니다." });
  }
});

// Setup Vite Dev Server / Static Hosting
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

start();
