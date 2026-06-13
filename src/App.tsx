import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  BookOpen,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Trash2,
  ChevronRight,
  HelpCircle,
  MapPin,
  ClipboardList,
  Eye,
  EyeOff
} from "lucide-react";
import { AnalysisResult, PresetSample, GeminiAnalysisResult, GeminiQuestion } from "./types";
import { PRESET_SAMPLES } from "./presets";

export default function App() {
  const [uploadedImages, setUploadedImages] = useState<{
    id: string;
    name: string;
    type: string;
    size: number;
    base64: string;
  }[]>([]);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);
  const [selectedExamIdx, setSelectedExamIdx] = useState<number>(0);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [questionFilter, setQuestionFilter] = useState<"all" | "correct" | "incorrect">("all");
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    setErrorMsg(null);
    let hasInvalid = false;
    let hasTooLarge = false;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isImage && !isPdf) {
        hasInvalid = true;
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB size limit
        hasTooLarge = true;
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type || (isPdf ? "application/pdf" : "image/jpeg"),
            size: file.size,
            base64: base64,
          },
        ]);
        // Reset result when new files are being added
        setResult(null);
      };
      reader.readAsDataURL(file);
    });

    if (hasInvalid) {
      setErrorMsg("이미지 파일(jpg, png, webp 등) 또는 PDF 파일만 업로드할 수 있습니다.");
    }
    if (hasTooLarge) {
      setErrorMsg("각 파일의 최대 업로드 제한 용량은 15MB입니다.");
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    setResult(null);
    setSelectedExamIdx(0);
  };

  const clearAllImages = () => {
    setUploadedImages([]);
    setResult(null);
    setSelectedExamIdx(0);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Run Preset Simulation instantly
  const handleSelectPreset = (preset: PresetSample) => {
    setErrorMsg(null);
    setIsLoading(true);
    setProgress(20);
    setLoadingStep("선택한 샘플 데이터 불러오는 중...");
    setShowRawJson(false);
    
    // Simulate preset page
    setUploadedImages([
      {
        id: "preset_" + preset.id,
        name: preset.name,
        type: "image/svg+xml",
        size: 5000,
        base64: preset.imageUrl,
      },
    ]);

    setTimeout(() => {
      setProgress(100);
      setResult(preset.mockData);
      setSelectedExamIdx(0);
      setIsLoading(false);
      setLoadingStep("");
    }, 1200);
  };

  // Trigger server-side analysis
  const handleStartAnalysis = async () => {
    if (uploadedImages.length === 0) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setSelectedExamIdx(0);
    setRevealedAnswers({});
    setProgress(15);
    setShowRawJson(false);

    try {
      setLoadingStep("1. 시험지 고해상도 픽셀 변환 및 OCR 추출 중...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProgress(45);
      setLoadingStep(`2. 총 ${uploadedImages.length}개의 정답 영역 정밀 분석 및 마킹 해독 중...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProgress(75);
      setLoadingStep("3. 취약 오답 유형 교정 및 유사 복습 문제 출제 중...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: uploadedImages.map((img) => ({
            imageBase64: img.base64,
            mimeType: img.type,
          })),
        }),
      });

      setProgress(90);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "시험지 분석 중 알 수 없는 서버 오류가 발생했습니다.");
      }

      const data = await response.json();
      setProgress(100);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "서버와 통신하는 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const toggleRevealAnswer = (id: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // If result is wrapped in an exams array (multi-school support), use the selected index, otherwise fallback to the result itself.
  const hasExamsArray = result && Array.isArray(result.exams) && result.exams.length > 0;
  const activeExam = hasExamsArray ? result.exams[selectedExamIdx] : result;

  // Filtered Questions list
  const filteredQuestions = activeExam && activeExam.questions
    ? activeExam.questions.filter((q: any) => {
        const isCorrect = q.correct !== undefined ? q.correct : q.isCorrect;
        if (questionFilter === "correct") return isCorrect;
        if (questionFilter === "incorrect") return !isCorrect;
        return true;
      })
    : [];

  // Parse structured weaknesses and study plan safely with fallbacks
  const weaknessesList = activeExam
    ? (Array.isArray(activeExam.weaknesses_structured)
      ? activeExam.weaknesses_structured
      : (Array.isArray(activeExam.weaknesses) && activeExam.weaknesses.length > 0 && typeof activeExam.weaknesses[0] === 'object'
        ? activeExam.weaknesses
        : (Array.isArray(activeExam.weaknesses)
          ? activeExam.weaknesses.map((w: string) => {
              let type = "취약";
              if (w.includes("우수") || w.includes("성공") || w.includes("완벽")) { type = "우수"; }
              else if (w.includes("주의") || w.includes("실수") || w.includes("오류") || w.includes("미흡")) { type = "주의"; }
              return { type, description: w };
            })
          : [])))
    : [];

  const studyPlanList = activeExam ? (activeExam.study_plan || []) : [];

  return (
    <div className="min-h-screen bg-[#f5f0eb] pb-20">
      {/* Top Header Logo */}
      <header className="border-b border-[#e6dcce] bg-white/70 backdrop-blur-md sticky top-0 z-10 shadow-sm" id="main-header">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-[#1a2744] text-white p-2 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-[#f97316]" />
            </span>
            <span className="font-extrabold text-xl tracking-tight text-[#1a2744] font-sans">
              시험지<span className="text-[#f97316]">분석기</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#e6dcce]/60 px-3 py-1.5 rounded-full font-medium text-[#1a2744] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#f97316] animate-pulse" />
              AI 채점 엔진 2.5
            </span>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-5xl mx-auto px-4 pt-10" id="main-content">
        {/* Intro Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a2744] tracking-tight mb-3">
            시험지 분석기
          </h1>
          <p className="text-[#1a2744]/80 text-base md:text-lg max-w-2xl mx-auto font-medium">
            시험지 사진을 업로드하면 AI가 자동으로 채점하고 분석합니다
          </p>
        </div>

        {/* Upload Container Zone */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-[#e6dcce]/20 border border-[#e8dfd3] mb-10" id="upload-panel">
          <div className="grid md:grid-cols-5 gap-6">
            
            {/* Left Upload Module (3 cols) */}
            <div className="md:col-span-3 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-[#1a2744] flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-[#f97316] rounded-full inline-block"></span>
                    시험지 등록
                  </h3>
                  {uploadedImages.length > 0 && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs bg-[#f97316]/10 text-[#f97316] font-bold px-2.5 py-1 rounded-full border border-[#f97316]/20">
                        {uploadedImages.length}장의 시험지가 업로드됨
                      </span>
                      <button
                        type="button"
                        onClick={clearAllImages}
                        className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1 hover:underline transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        전체 삭제
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Drag and Drop Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-3 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] transition-all ${
                    isDragOver
                      ? "border-[#f97316] bg-[#fbf5ee]"
                      : "border-[#e6dcce] hover:border-[#1a2744]/30 hover:bg-[#faf6f0]"
                  }`}
                  id="dropzone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                  />

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#faf5ee] rounded-full flex items-center justify-center mb-3 border border-[#f4ebdf] text-[#f97316]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-[#1a2744] mb-1">
                      시험지 이미지 또는 PDF를 여기에 놓거나 클릭하세요
                    </p>
                    <p className="text-xs text-[#1a2744]/60">
                      여러 파일 선택 가능 (PNG, JPG, WEBP, PDF / 파일당 최대 15MB)
                    </p>
                  </div>
                </div>

                {/* Horizontal Small Thumbnails display list */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 bg-[#fbfaf8] border border-[#f0e7dc] rounded-2xl p-4">
                    <p className="text-xs text-[#1a2744]/70 font-bold mb-3">등록된 시험지 페이지 (가로 슬라이드 가능)</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="relative w-20 h-28 bg-white border border-[#e6dcce] rounded-xl flex-shrink-0 flex items-center justify-center cursor-pointer select-none group shadow-sm hover:border-[#f97316] transition-all"
                          onClick={() => setActiveLightboxImage(img.base64)}
                          title="클릭하여 무제한 선명 미리보기"
                        >
                          {/* Sequence index badge */}
                          <span className="absolute top-1 left-1 z-10 bg-[#1a2744] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                            {idx + 1}
                          </span>

                          {/* Light exit remove badge */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(img.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 z-10 bg-white hover:bg-rose-50 border border-gray-200 text-gray-400 hover:text-rose-600 rounded-full p-1.5 transition-all shadow-md cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Image crop thumb */}
                          <div className="w-full h-full p-1 overflow-hidden rounded-xl flex items-center justify-center bg-gray-50">
                            {img.type === "application/pdf" || img.name.toLowerCase().endsWith(".pdf") ? (
                              <div className="flex flex-col items-center justify-center p-2 text-center h-full w-full">
                                <FileText className="w-8 h-8 text-rose-500 mb-1 shrink-0" />
                                <span className="text-[9px] font-bold text-[#1a2744] truncate w-full px-0.5">
                                  {img.name}
                                </span>
                              </div>
                            ) : (
                              <img
                                src={img.base64}
                                alt={img.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                          
                          {/* Magnifier glass info overlap */}
                          <div className="absolute inset-0 bg-black/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[9px] text-white font-semibold bg-[#1a2744] px-1.5 py-0.5 rounded shadow-sm">
                              미리보기
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Analyze Trigger Buttons */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={uploadedImages.length === 0 || isLoading}
                  className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all ${
                    uploadedImages.length === 0 || isLoading
                      ? "bg-gray-300 shadow-none cursor-not-allowed text-gray-500"
                      : "bg-[#f97316] hover:bg-[#e05e0c] active:scale-[0.98] cursor-pointer shadow-orange-500/20 hover:shadow-orange-500/30"
                  }`}
                  id="btn-analyze"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>AI 채점 분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                      <span>{uploadedImages.length > 0 ? `${uploadedImages.length}장 분석 시작` : "분석 시작"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Presets Panel (2 cols) */}
            <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-[#ecdcc7] pt-6 md:pt-0 md:pl-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1a2744] mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4.5 h-4.5 text-[#1a2744] opacity-85" />
                  샘플 시험지로 테스트하기
                </h3>
                <p className="text-xs text-[#1a2744]/70 mb-4 leading-relaxed">
                  마땅한 시험지 사진이 없으신가요? 실제 오답이 마킹된 아래 과목 표본을 클릭하시면 즉시 AI 채점과 오답 처방 시뮬레이션을 체험하실 수 있습니다.
                </p>

                <div className="space-y-3">
                  {PRESET_SAMPLES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      disabled={isLoading}
                      className="w-full text-left bg-[#fcfbfa] hover:bg-[#faf5ee] border border-[#e6dcce] hover:border-[#f97316]/50 p-3.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-12 h-16 overflow-hidden rounded border border-gray-200 bg-white group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center">
                        <img
                          src={preset.imageUrl}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1a2744]/10 text-[#1a2744]">
                            {preset.subject}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            preset.difficulty === "쉬움" ? "bg-green-100 text-green-700" :
                            preset.difficulty === "보통" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          }`}>
                            난이도: {preset.difficulty}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-[#1a2744] truncate">{preset.name}</p>
                        <p className="text-[11px] text-gray-500">클릭 즉시 가상 분석 결과 가동</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Hint */}
              <div className="mt-6 bg-[#fbf9f5] border border-[#f0e6da] rounded-xl p-3 flex gap-2.5 items-start">
                <AlertCircle className="w-4.5 h-4.5 text-[#f97316] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#1a2744]/75 leading-relaxed">
                  <strong>안심하고 활용하세요!</strong><br />
                  업로드하신 시험 문서는 개인 보관되거나 외부 수집 목적으로 쓰이지 않으며 오직 1회성 AI 성적 채점 및 오답 개념 복습 문제 추출에만 가동됩니다.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Loading Indicator with status steps */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#e8dfd3] text-center max-w-xl mx-auto mb-10 transition-all">
            <div className="relative inline-flex mb-5">
              <div className="w-16 h-16 rounded-full border-4 border-[#e5dccf] border-t-[#f97316] animate-spin"></div>
              <Sparkles className="w-6 h-6 text-[#f97316] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h4 className="font-extrabold text-[#1a2744] text-lg mb-1">
              AI가 {uploadedImages.length}장의 시험지를 분석 중입니다...
            </h4>
            <p className="text-xs text-gray-400 mb-5">통합 채점과 정오답 진단 보고서를 구성하고 있습니다.</p>

            {/* Progress bar container */}
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-4 border border-[#e5dccf]">
              <div
                className="bg-gradient-to-r from-[#f97316] to-amber-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center px-1 text-[10px] font-bold text-gray-500 mb-4 font-mono">
              <span>업로드 ({Math.min(progress, 30)}%)</span>
              <span>마킹 판독 및 분석 ({Math.min(progress, 80)}%)</span>
              <span>정리 완료 ({progress}%)</span>
            </div>

            <div className="bg-[#fcfaf5] border border-[#f2eae1] rounded-xl p-3 inline-block w-full">
              <p className="text-xs font-mono font-medium text-[#f97316]">{loadingStep || "인공지능 모델 초기화 중..."}</p>
            </div>
          </div>
        )}

        {/* ANALYSIS RESULTS PANEL */}
        {result && !isLoading && (
          <div className="space-y-8 animate-fadeIn" id="result-view">
            
            {/* RAW JSON TOGGLER (Requested explicitly: "일단 JSON 결과가 화면에 보이기만 하면 됨") */}
            <div className="bg-white rounded-3xl p-6 border border-[#ecdcc7]/80 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#f97316]" />
                  <span className="font-extrabold text-[#1a2744] text-sm">AI 분석 완료! 정답지 원본 JSON 데이터</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="bg-[#1a2744]/10 hover:bg-[#1a2744]/20 text-[#1a2744] text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {showRawJson ? "숨기기" : "눌러서 실시간 원본 JSON 보기"}
                </button>
              </div>
              
              {showRawJson && (
                <div className="mt-4 bg-[#1a2744]/95 text-green-400 p-5 rounded-2xl overflow-x-auto text-xs font-mono border border-[#0d1526]">
                  <div className="flex justify-between items-center pb-2 mb-3 border-b border-white/10 text-white/60">
                    <span>💡 Gemini API 실시간 파싱 결과 JSON 세그먼트</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                        alert("JSON 데이터가 클립보드에 복사되었습니다!");
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer"
                    >
                      JSON 복사하기
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Check if it's the requested Gemini structured output format */}
            {activeExam && 'info' in activeExam ? (
              <>
                {/* MULTI-SCHOOL SELECTOR CONTROL BOARD */}
                {hasExamsArray && (
                  <div className="bg-white rounded-3xl p-6 border border-[#ecdcc7] shadow-lg flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#f97316]" />
                      <h3 className="font-extrabold text-[#1a2744] text-sm">🏫 업로드된 시험 고유 식별 분리 보고서 ({result.exams.length}개 시험지 분리 완료)</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      업로드된 문서에서 <strong>{result.exams.length}개</strong>의 서로 다른 학교/시험지가 복수로 감지되었습니다. 
                      아래 각각의 카드 탭중 하나를 누르시면 해당 학교 시험지의 인공지능 정밀 채점 내역과 오답 및 보완 보고서가 즉시 활성화됩니다:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {result.exams.map((exam: any, idx: number) => {
                        const isSelected = selectedExamIdx === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedExamIdx(idx)}
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#1a2744] border-[#1a2744] text-white shadow-md ring-2 ring-[#f97316]"
                                : "bg-[#fcfaf5] border-[#ecdcc7] text-[#1a2744] hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-[#1a2744]/10 text-[#1a2744]'
                              }`}>
                                {exam.info?.subject || "과목 미확인"}
                              </span>
                              <span className={`text-base font-black ${
                                isSelected ? "text-[#f97316]" : "text-[#1a2744]"
                              }`}>
                                {exam.score?.percentage}점
                              </span>
                            </div>
                            <p className="font-extrabold text-xs truncate max-w-full" title={exam.info?.school}>
                              {exam.info?.school || "학교명 미상"}
                            </p>
                            <div className="flex justify-between items-center mt-2 text-[9px] opacity-75">
                              <span>학생: {exam.info?.student || "미확인"}</span>
                              <span>{exam.score?.correct_count}/{exam.score?.total} 문항</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* GEMINI SPECIFIC VISUAL LAYOUT */}
                <div className="bg-[#1a2744] inline-block w-full text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f97316] to-[#e05e0c] rounded-full opacity-10 translate-x-20 -translate-y-20"></div>
                  <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#f97316] rounded-full opacity-5"></div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center md:justify-between gap-6">
                    <div className="text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs text-white/95 font-semibold mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-[#f97316]" /> AI 시험지 자동 채점 완료
                      </div>
                      <h2 className="text-2xl font-extrabold max-w-xl leading-snug">
                        {activeExam.info.student} 학생의 시험 채점 및 분석 보고서입니다.
                      </h2>
                      <p className="text-xs text-white/70 mt-2 font-medium">
                        총 {activeExam.info.total_pages}장의 시험지를 연속 분석하여 통합 채점 결과를 수집했습니다.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center min-w-[200px] shadow-inner">
                      <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">분석 점수</p>
                      <p className="text-5xl font-black text-[#f97316] my-1">{activeExam.score.percentage}점</p>
                      <div className="inline-block mt-0.5 text-[11px] font-bold py-0.5 px-3 rounded-full bg-white/15">
                        {activeExam.score.correct_count} / {activeExam.score.total} 문항 정답
                      </div>
                    </div>
                  </div>
                </div>

                {/* 두 분석 카드 (취약 유형 분석 & AI 추천 학습 계획) */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 취약 유형 분석 카드 */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e8dfd3] shadow-md flex flex-col h-full hover:shadow-lg transition-transform md:hover:scale-[1.01] duration-300">
                    <h3 className="text-sm font-extrabold text-[#1a2744] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-red-500 rounded-full inline-block"></span>
                      취약 유형 분석
                    </h3>
                    <div className="space-y-3 flex-1 overflow-auto">
                      {weaknessesList.length > 0 ? (
                        weaknessesList.map((item: any, idx: number) => {
                          let tagBg = "bg-rose-50 border-rose-200 text-rose-700";
                          if (item.type === "주의" || item.type.includes("주의")) {
                            tagBg = "bg-amber-50 border-amber-200 text-amber-700";
                          } else if (item.type === "우수" || item.type.includes("우수")) {
                            tagBg = "bg-emerald-50 border-emerald-200 text-emerald-700";
                          }
                          return (
                            <div key={idx} className="flex gap-3 items-start bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border shrink-0 ${tagBg}`}>
                                {item.type}
                              </span>
                              <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-400">분석된 취약 유형 데이터가 없습니다.</p>
                      )}
                    </div>
                  </div>

                  {/* AI 추천 학습 계획 카드 */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e8dfd3] shadow-md flex flex-col h-full hover:shadow-lg transition-transform md:hover:scale-[1.01] duration-300">
                    <h3 className="text-sm font-extrabold text-[#1a2744] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#1a2744] rounded-full inline-block"></span>
                      AI 추천 학습 계획
                    </h3>
                    <div className="space-y-2.5 flex-1 overflow-auto">
                      {studyPlanList.length > 0 ? (
                        studyPlanList.map((plan: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 hover:border-[#f97316]/20 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1a2744] text-white shrink-0">
                                {plan.day}
                              </span>
                              <p className="text-xs text-[#1a2744] font-extrabold">
                                {plan.topic}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] bg-[#f97316]/10 text-[#f97316] font-bold px-2 py-0.5 rounded border border-[#f97316]/20">
                                추천: <span className="font-extrabold text-[#f97316]">{plan.problems}제</span>
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">학습 계획 데이터가 아직 준비되지 않았습니다.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info details grid */}
                <div className="bg-white rounded-3xl p-6 border border-[#e8dfd3] shadow-md">
                  <h3 className="text-sm font-bold text-[#1a2744] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#f97316] rounded-full inline-block animate-pulse"></span>
                    추출된 시험 기본 정보
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block mb-1">학교/학원명</span>
                      <span className="font-extrabold text-sm text-[#1a2744] block truncate">{activeExam.info.school || "(미기재)"}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block mb-1">학년</span>
                      <span className="font-extrabold text-sm text-[#1a2744] block truncate">{activeExam.info.grade || "(미기재)"}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block mb-1">과목</span>
                      <span className="font-extrabold text-sm text-[#1a2744] block truncate">{activeExam.info.subject || "(미기재)"}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block mb-1">단원/시험범위</span>
                      <span className="font-extrabold text-sm text-[#1a2744] block truncate" title={activeExam.info.unit}>{activeExam.info.unit || "(전 범위)"}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block mb-1">학생 이름</span>
                      <span className="font-extrabold text-sm text-[#f97316] block truncate">{activeExam.info.student || "(기록 없음)"}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block mb-1">분석 시험지 수</span>
                      <span className="font-extrabold text-sm text-[#1a2744] block truncate">{activeExam.info.total_pages || 1}장</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Gemini Grading Cards */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8dfd3] shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a2744]">인공지능 정밀 채점 내역</h3>
                      <p className="text-xs text-[#1a2744]/60 mt-1">
                        식별된 모든 문항의 페이지별 채점 내역과 학생 작성 답안입니다.
                      </p>
                    </div>

                    {/* Filter Selector */}
                    <div className="flex items-center gap-1 bg-[#f5f0eb] p-1.5 rounded-xl border border-[#ecdcc7]/60">
                      <button
                        type="button"
                        onClick={() => setQuestionFilter("all")}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                          questionFilter === "all"
                            ? "bg-[#1a2744] text-white"
                            : "text-[#1a2744]/80 hover:bg-[#e8decb]/50"
                        }`}
                      >
                        전체 ({filteredQuestions.length}개)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionFilter("correct")}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                          questionFilter === "correct"
                            ? "bg-green-600 text-white"
                            : "text-[#1a2744]/80 hover:bg-[#e8decb]/50"
                        }`}
                      >
                        정답만
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionFilter("incorrect")}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                          questionFilter === "incorrect"
                            ? "bg-rose-600 text-white"
                            : "text-[#1a2744]/80 hover:bg-[#e8decb]/50"
                        }`}
                      >
                        오답만
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredQuestions.length > 0 ? (
                      filteredQuestions.map((q: any) => {
                        const isCorrect = q.correct !== undefined ? q.correct : q.isCorrect;
                        const key = q.no !== undefined ? q.no : q.id;
                        return (
                          <div
                            key={key}
                            className={`border p-4 sm:p-5 rounded-2xl transition-all ${
                              isCorrect
                                ? "bg-green-50/20 border-green-100"
                                : "bg-red-50/10 border-red-100"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-gray-100 pb-2">
                              <div className="flex items-center gap-2.5">
                                <span className={`text-sm font-extrabold w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {q.no || q.id}번
                                </span>
                                {q.page && (
                                  <span className="text-[10px] bg-gray-105 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                    시험지 {q.page}페이지
                                  </span>
                                )}
                              </div>

                              <span className={`text-[11px] font-extrabold py-1 px-3.5 rounded-full flex items-center gap-1.5 border w-fit ${
                                isCorrect
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-rose-100 text-rose-700 border-rose-200"
                              }`}>
                                {isCorrect ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" /> 정답
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" /> 오답
                                  </>
                                )}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              {/* Left Text / Content summary */}
                              <div className="md:col-span-3">
                                <p className="text-xs text-gray-400 font-bold block mb-0.5">문항 설명 요약</p>
                                <p className="text-sm text-[#1a2744] font-semibold">{q.content || q.text}</p>
                              </div>

                              {/* Right Student Answer */}
                              <div className="bg-white border border-gray-100 rounded-xl p-2.5 flex flex-col justify-center">
                                <span className="text-[9px] text-gray-400 font-bold block leading-none mb-1">제출한 학생 답안</span>
                                <span className={`text-sm font-black ${isCorrect ? "text-green-600" : "text-rose-600"}`}>
                                  {q.student_answer || q.studentAnswer || "(미작성 / 공백)"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-sm font-bold text-[#1a2744] mb-1">조건에 만족하는 문항이 없습니다.</p>
                        <p className="text-xs text-gray-400">필터 요건을 변경해 주세요.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* PRESET/OLD VISUAL LAYOUT FOR BACKWARD COMPATIBILITY */}
                {/* 1. Score & Summary Banner Card */}
                <div className="bg-[#1a2744] inline-block w-full text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f97316] to-[#e05e0c] rounded-full opacity-10 translate-x-20 -translate-y-20"></div>
                  <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#f97316] rounded-full opacity-5"></div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center md:justify-between gap-6">
                    <div className="text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs text-white/90 font-semibold mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-[#f97316]" /> AI 채점 분석 피드백
                      </div>
                      <h2 className="text-2xl font-extrabold max-w-xl leading-snug">
                        {result.summary}
                      </h2>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center min-w-[150px] shadow-inner">
                      <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">분석 점수</p>
                      <p className="text-4xl font-black text-[#f97316] my-1">{result.score}</p>
                      <div className="inline-block mt-0.5 text-[10px] py-0.5 px-2.5 rounded-full bg-white/15">
                        100점 환산 기준
                      </div>
                    </div>
                  </div>
                </div>

                 {/* 두 분석 카드 (취약 유형 분석 & AI 추천 학습 계획) */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 취약 유형 분석 카드 */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e8dfd3] shadow-md flex flex-col h-full hover:shadow-lg transition-transform md:hover:scale-[1.01] duration-300">
                    <h3 className="text-sm font-extrabold text-[#1a2744] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-red-500 rounded-full inline-block"></span>
                      취약 유형 분석
                    </h3>
                    <div className="space-y-3 flex-1 overflow-auto">
                      {weaknessesList.length > 0 ? (
                        weaknessesList.map((item: any, idx: number) => {
                          let tagBg = "bg-rose-50 border-rose-200 text-rose-700";
                          if (item.type === "주의" || item.type.includes("주의")) {
                            tagBg = "bg-amber-50 border-amber-200 text-amber-700";
                          } else if (item.type === "우수" || item.type.includes("우수")) {
                            tagBg = "bg-emerald-50 border-emerald-200 text-emerald-700";
                          }
                          return (
                            <div key={idx} className="flex gap-3 items-start bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border shrink-0 ${tagBg}`}>
                                {item.type}
                              </span>
                              <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-400">분석된 취약 유형 데이터가 없습니다.</p>
                      )}
                    </div>
                  </div>

                  {/* AI 추천 학습 계획 카드 */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e8dfd3] shadow-md flex flex-col h-full hover:shadow-lg transition-transform md:hover:scale-[1.01] duration-300">
                    <h3 className="text-sm font-extrabold text-[#1a2744] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#1a2744] rounded-full inline-block"></span>
                      AI 추천 학습 계획
                    </h3>
                    <div className="space-y-2.5 flex-1 overflow-auto">
                      {studyPlanList.length > 0 ? (
                        studyPlanList.map((plan: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 hover:border-[#f97316]/20 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1a2744] text-white shrink-0">
                                {plan.day}
                              </span>
                              <p className="text-xs text-[#1a2744] font-extrabold">
                                {plan.topic}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] bg-[#f97316]/10 text-[#f97316] font-bold px-2 py-0.5 rounded border border-[#f97316]/20">
                                추천: <span className="font-extrabold text-[#f97316]">{plan.problems}제</span>
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">학습 계획 데이터가 아직 준비되지 않았습니다.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Detailed Question Scoring List */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8dfd3] shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a2744]">인공지능 정밀 채점 내역</h3>
                      <p className="text-xs text-[#1a2744]/60 mt-1">
                        인식된 문항 번호와 정정 내역, AI 과외 오답 해설 가이드입니다.
                      </p>
                    </div>

                    {/* Filter Selector */}
                    <div className="flex items-center gap-1 bg-[#f5f0eb] p-1.5 rounded-xl border border-[#ecdcc7]/60">
                      <button
                        type="button"
                        onClick={() => setQuestionFilter("all")}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                          questionFilter === "all"
                            ? "bg-[#1a2744] text-white"
                            : "text-[#1a2744]/80 hover:bg-[#e8decb]/50"
                        }`}
                      >
                        전체 보기
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionFilter("correct")}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                          questionFilter === "correct"
                            ? "bg-green-600 text-white"
                            : "text-[#1a2744]/80 hover:bg-[#e8decb]/50"
                        }`}
                      >
                        맞은 문항
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionFilter("incorrect")}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                          questionFilter === "incorrect"
                            ? "bg-rose-600 text-white"
                            : "text-[#1a2744]/80 hover:bg-[#e8decb]/50"
                        }`}
                      >
                        오답 문항
                      </button>
                    </div>
                  </div>

                  {/* Questions Stack */}
                  {filteredQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {filteredQuestions.map((q: any) => {
                        const isCorrect = q.correct !== undefined ? q.correct : q.isCorrect;
                        return (
                          <div
                            key={q.id}
                            className={`border p-5 rounded-2xl transition-all ${
                              isCorrect
                                ? "bg-green-50/20 border-green-100"
                                : "bg-red-50/10 border-red-100"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2.5">
                                <span className={`text-sm font-extrabold w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {q.id}
                                </span>
                                <span className="font-bold text-sm text-[#1a2744]">{q.text}</span>
                              </div>

                              <span className={`text-[11px] font-bold py-1 px-3.5 rounded-full flex items-center gap-1.5 border ${
                                isCorrect
                                  ? "bg-green-100/60 text-green-700 border-green-200"
                                  : "bg-rose-100/60 text-rose-700 border-rose-200"
                              }`}>
                                {isCorrect ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" /> 정답
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" /> 오답
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Score compare segment */}
                            <div className="grid grid-cols-2 gap-4 bg-white/70 border border-gray-100 rounded-xl p-3 mb-3">
                              <div>
                                <p className="text-[10px] text-gray-500 font-semibold mb-0.5">실제 정답</p>
                                <p className="text-xs font-bold text-gray-900">{q.correctAnswer}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 font-semibold mb-0.5">학생 마킹 답안</p>
                                <p className={`text-xs font-bold ${isCorrect ? "text-green-600" : "text-red-500 font-black"}`}>
                                  {q.studentAnswer || "(미기록 / 공란)"}
                                </p>
                              </div>
                            </div>

                            {/* AI Overhaul explanation */}
                            <div className="bg-[#fcfbf9] border border-[#ecdcc7]/50 rounded-xl p-3">
                              <p className="text-[10px] text-[#f97316] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#f97316]" /> 오답 해치우기 처방 가이드
                              </p>
                              <p className="text-xs text-[#1a2744]/90 leading-relaxed font-medium">
                                {q.explanation}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm font-bold text-[#1a2744] mb-1">
                        필터 조건에 부합하는 채점 데이터가 없습니다.
                      </p>
                      <p className="text-xs text-gray-400">우물정 상단 필터 단추에서 필터를 다른 요건으로 변경하세요.</p>
                    </div>
                  )}
                </div>

                {/* 4. Similar Practice Questions Section (취약점 완벽 보완) */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8dfd3] shadow-xl">
                  <div className="flex items-center gap-2.5 border-b border-gray-100 pb-5 mb-6">
                    <span className="bg-[#f97316]/10 p-2 rounded-xl flex items-center justify-center border border-[#f97316]/20">
                      <BookOpen className="w-5 h-5 text-[#f97316]" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-[#1a2744]">취약점 자동 극복: 유사 보완 추천 문제</h3>
                      <p className="text-xs text-[#1a2744]/60 mt-0.5">
                        방금 틀렸던 유형의 핵심 문제를 맞춤형으로 풀면서 완벽한 처방 학습을 완성하세요!
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {result.similarQuestions && result.similarQuestions.length > 0 ? (
                      result.similarQuestions.map((sq: any) => {
                        const isRevealed = !!revealedAnswers[sq.id];
                        return (
                          <div
                            key={sq.id}
                            className="bg-[#fcfaf7] border border-[#f2ebe0] hover:border-[#1a2744]/20 rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs bg-[#f97316] text-white px-2.5 py-0.5 rounded-full font-bold">
                                  밀착 실전 추천 {sq.id}
                                </span>
                              </div>

                              <p className="font-bold text-sm text-[#1a2744] leading-relaxed mb-4">
                                {sq.question}
                              </p>

                              {/* Options if exist */}
                              {sq.options && sq.options.length > 0 && (
                                <div className="space-y-2 mb-4">
                                  {sq.options.map((opt: any, oIdx: number) => (
                                    <div
                                      key={oIdx}
                                      className="text-xs text-gray-700 font-medium bg-white border border-gray-200 p-2.5 rounded-xl flex items-center gap-2"
                                    >
                                      <span className="w-4.5 h-4.5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-500">
                                        {oIdx + 1}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Interactive Self-Test Action Reveal */}
                            <div className="border-t border-[#f2eae1] pt-4 mt-2">
                              <button
                                type="button"
                                onClick={() => toggleRevealAnswer(sq.id)}
                                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[#1a2744] bg-white border-[#e6dcce] hover:bg-[#faf6f0]"
                              >
                                {isRevealed ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" /> 해설 가리기
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" /> 정답 및 처방 해설 보기
                                  </>
                                )}
                              </button>

                              {isRevealed && (
                                <div className="bg-[#1a2744]/5 rounded-xl p-3.5 mt-3 border border-[#1a2744]/10 select-all animate-fadeIn">
                                  <p className="text-xs font-bold text-[#1a2744] mb-1">
                                    <span className="text-[#f97316]">🎯 예시 정답:</span> {sq.answer}
                                  </p>
                                  <div className="text-xs text-gray-600 leading-relaxed font-medium pt-1 border-t border-[#1a2744]/10 mt-1">
                                    {sq.explanation}
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">유사 보완 문제가 생성되지 않았습니다.</p>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

      </main>

      {/* Lightbox Pop-up Modal window */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 transition-all"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close bar */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-105">
              <span className="text-xs font-bold text-[#1a2744]">시험지 크게 보기</span>
              <button
                type="button"
                onClick={() => setActiveLightboxImage(null)}
                className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 font-bold p-1 rounded-full cursor-pointer transition-colors"
                title="닫기"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable container */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50/50">
              {activeLightboxImage.startsWith("data:application/pdf") ? (
                <iframe
                  src={activeLightboxImage}
                  className="w-full h-[60vh] rounded-lg border border-gray-200 shadow-sm"
                  title="PDF 시험지 미리보기"
                />
              ) : (
                <img
                  src={activeLightboxImage}
                  alt="시험지 인쇄물 원본 크기"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-gray-200 shadow-sm"
                />
              )}
            </div>

            {/* Bottom info section */}
            <div className="bg-[#fcfaf7] px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#1a2744]/75">
              <span>💡 빈 공간을 클릭하셔도 창이 닫힙니다.</span>
              <button
                type="button"
                onClick={() => setActiveLightboxImage(null)}
                className="bg-[#1a2744] text-white font-bold px-4 py-1.5 rounded-lg hover:bg-opacity-90 transition-all cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
