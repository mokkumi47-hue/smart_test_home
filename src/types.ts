export interface Question {
  id: number;
  text: string;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SimilarQuestion {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface WeaknessItem {
  type: string;
  description: string;
}

export interface StudyPlanItem {
  day: string;
  topic: string;
  problems: number;
}

export interface AnalysisResult {
  score: string;
  summary: string;
  questions: Question[];
  weaknesses: string[];
  studyTips: string[];
  similarQuestions: SimilarQuestion[];
  weaknesses_structured?: WeaknessItem[];
  study_plan?: StudyPlanItem[];
}

export interface GeminiExamInfo {
  school: string;
  grade: string;
  subject: string;
  unit: string;
  student: string;
  total_pages: number;
}

export interface GeminiQuestion {
  no: number;
  page: number;
  content: string;
  student_answer: string;
  correct: boolean;
}

export interface GeminiScore {
  correct_count: number;
  total: number;
  percentage: number;
}

export interface GeminiAnalysisResult {
  info: GeminiExamInfo;
  questions: GeminiQuestion[];
  score: GeminiScore;
  weaknesses?: WeaknessItem[];
  study_plan?: StudyPlanItem[];
}

export interface PresetSample {
  id: string;
  name: string;
  subject: string;
  imageUrl: string;
  difficulty: "쉬움" | "보통" | "어려움";
  mockData: AnalysisResult;
}
