import { PresetSample } from "./types";

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "math_mid",
    name: "중공수학 1학기 중간고사 (방정식)",
    subject: "수학",
    difficulty: "보통",
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" style="background:%23ffffff;font-family:sans-serif;padding:20px;box-sizing:border-box;">
      <rect width="100%" height="100%" fill="%23fcfcfc" stroke="%23cccccc" stroke-width="2"/>
      <text x="20" y="40" font-size="16" font-weight="bold" fill="%231a2744">제 1회 수학 모의고사 (방정식과 함수)</text>
      <line x1="20" y1="55" x2="280" y2="55" stroke="%231a2744" stroke-width="1.5"/>
      <text x="20" y="80" font-size="11" fill="%23666666">학년: 중등 2학년   이름: 김푸름</text>
      
      <!-- Q1 -->
      <text x="20" y="120" font-size="11" font-weight="bold" fill="%23333333">1. 일차방정식 2x + 6 = 12의 해를 구하시오. [15점]</text>
      <text x="35" y="140" font-size="11" fill="%23e11d48" font-family="cursive" font-weight="bold">풀이: 2x = 6  =>  x = 3  (정답: 3)</text>
      <circle cx="150" cy="130" r="15" stroke="%23e10000" stroke-width="2" fill="none" opacity="0.7"/>
      
      <!-- Q2 -->
      <text x="20" y="175" font-size="11" font-weight="bold" fill="%23333333">2. 두 일차방정식의 교점의 좌표를 고르시오. [25점]</text>
      <text x="35" y="195" font-size="10" fill="%23555555">① (1, 2)  ② (2, 3)  ③ (3, 4)  ④ (4,-1)</text>
      <text x="35" y="215" font-size="11" fill="%23555555">작성한 답: ② (2, 3)</text>
      <!-- Red check mark for incorrect -->
      <path d="M120,185 L150,225" stroke="%23e11d48" stroke-width="2" opacity="0.8"/>
      
      <!-- Q3 -->
      <text x="20" y="250" font-size="11" font-weight="bold" fill="%23333333">3. 함수 y = ax + 3의 그래프가 점 (2, 7)을 지나갈 때</text>
      <text x="32" y="265" font-size="11" font-weight="bold" fill="%23333333">상수 a의 값을 구하시오. [30점]</text>
      <text x="35" y="285" font-size="11" fill="%23e11d48" font-family="cursive" font-weight="bold">답: a = 2  (풀이과정 없음)</text>
      <path d="M110,260 L140,290" stroke="%23e11d48" stroke-width="2" opacity="0.8"/>
      
      <!-- Score circle -->
      <circle cx="240" cy="330" r="40" stroke="%23f97316" stroke-width="3" fill="none" stroke-dasharray="5 2"/>
      <text x="240" y="325" font-size="20" font-weight="bold" fill="%23f97316" text-anchor="middle">45점</text>
      <text x="240" y="345" font-size="10" fill="%23f97316" text-anchor="middle">재분석 요망</text>
    </svg>`,
    mockData: {
      score: "45 / 100점",
      summary: "방정식의 기본 연산은 잘 수행하고 있으나, 일차함수와 연립방정식의 관계를 연결 짓는 응용 단계와 미지수 대입 과정에서 빈번한 실수가 발견됩니다. 개념 복습과 다양한 풀이과정 수립 연습이 필요합니다.",
      questions: [
        {
          id: 1,
          text: "일차방정식 2x + 6 = 12의 해 구하기 (15점)",
          correctAnswer: "x = 3",
          studentAnswer: "x = 3",
          isCorrect: true,
          explanation: "이항정리와 나눗셈을 정확히 수행했습니다. 2x = 6 이므로 x = 3이 완벽한 정답입니다."
        },
        {
          id: 2,
          text: "두 일차방정식의 교점의 좌표 구하기 (25점)",
          correctAnswer: "① (1, 2)",
          studentAnswer: "② (2, 3)",
          isCorrect: false,
          explanation: "두 식을 열립하여 정확한 미지수 x, y 값을 도출해야 했으나 단순 육안 대입 과정에서 오차가 발생했습니다. 연립방정식 가감법과 대입법 개념을 다시 살펴봅시다."
        },
        {
          id: 3,
          text: "함수 y = ax + 3의 그래프가 점 (2, 7)을 지날 때 상수 a 구하기 (30점)",
          correctAnswer: "a = 2",
          studentAnswer: "a = 2 (풀이 누락)",
          isCorrect: false,
          explanation: "정답 값은 일치하나 대입식과 이항 과정의 수식이 전혀 증명되지 않았고, 문제 제시 조건에서 계산 실수로 판단하여 채점 기준상 부분 점수 없이 오답 처리되었습니다. y에 7, x에 2를 대입하면 7 = 2a + 3 => 2a = 4 => a = 2 입니다. 다음부턴 반드시 풀이를 써주세요."
        }
      ],
      weaknesses: [
        "일차함수 그래프 위의 점에 대한 좌표 대입법",
        "연립방정식의 기하학적 의미 (두 그래프의 교점 구하기)",
        "식 계산 풀이과정 논리정연하게 작성하기"
      ],
      weaknesses_structured: [
        { type: "취약", description: "일차함수 그래프 위의 점에 대한 좌표 대입법 연산 실수" },
        { type: "주의", description: "연립방정식의 기하학적 의미 (두 그래프의 교점 구하기) 이해 부족" },
        { type: "우수", description: "단순 일차방정식 수식 전개 능력 우수" }
      ],
      study_plan: [
        { day: "월요일", topic: "일차함수의 정의와 미지수에 상수 좌표값 대입 훈련", problems: 15 },
        { day: "화요일", topic: "연립 방정식 가감법과 대입법 개념 복습 및 기본 연습", problems: 20 },
        { day: "수요일", topic: "일차함수의 교점과 연립방정식 해의 관계 증명 학습", problems: 15 },
        { day: "목요일", topic: "다양한 서술형 교점 구하기 문제 및 가감법 반복 계산", problems: 20 },
        { day: "금요일", topic: "연립방정식과 그래프 교점 응용 심화 문제 풀이", problems: 25 }
      ],
      studyTips: [
        "풀이과정을 연습장에 반으로 선을 그어 단계별로 누락 없이 쓰는 습관을 가지세요.",
        "일차함수의 그래프를 눈으로 직접 그리고 식을 손으로 대입하며 이해의 폭을 넓히는 좌표 학습법을 추천합니다."
      ],
      similarQuestions: [
        {
          id: 1,
          question: "일차함수 y = 3x - k 의 그래프가 점 (1, 5)를 지날 때, 상수 k의 값을 구하시오.",
          options: ["-2", "-1", "2", "3", "5"],
          answer: "-2",
          explanation: "점 (1, 5)를 y = 3x - k 에 대입해 봅니다. 5 = 3(1) - k  => 5 = 3 - k => k = 3 - 5 = -2 가 됩니다. 따라서 정답은 -2 입니다."
        },
        {
          id: 2,
          question: "두 일차방정식 x + y = 5 와 2x - y = 4 의 교점의 x좌표값을 구하시오.",
          options: [],
          answer: "3",
          explanation: "두 방정식을 더하는 가감법을 적용합시다. (x + y) + (2x - y) = 5 + 4 => 3x = 9 => x = 3 입니다. 이때 y = 2가 되어 교점은 (3, 2)입니다."
        }
      ]
    }
  },
  {
    id: "english_test",
    name: "고1 수능모의평가 외국어영역 (어법)",
    subject: "영어",
    difficulty: "어려움",
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" style="background:%23ffffff;font-family:sans-serif;padding:20px;box-sizing:border-box;">
      <rect width="100%" height="100%" fill="%23fcfcfc" stroke="%23cccccc" stroke-width="2"/>
      <text x="20" y="40" font-size="14" font-weight="bold" fill="%231a2744">High School English Mock Test (Grammar)</text>
      <line x1="20" y1="52" x2="280" y2="52" stroke="%231a2744" stroke-width="1.5"/>
      
      <!-- Q1 -->
      <text x="20" y="90" font-size="11" font-weight="bold" fill="%23333333">28. 어법상 어색한 부분을 고르시오. [3점]</text>
      <text x="25" y="110" font-size="9" fill="%23555555">The standard view of how the brain ① processes language...</text>
      <text x="25" y="125" font-size="9" fill="%23555555">the ways which ② we interact are crucial...</text>
      <text x="20" y="150" font-size="11" fill="%23e11d48" font-family="cursive" font-weight="bold">checked: ② we interact </text>
      <circle cx="150" cy="115" r="15" stroke="%23e10000" stroke-width="2" fill="none" opacity="0.7"/>

      <!-- Q2 -->
      <text x="20" y="190" font-size="11" font-weight="bold" fill="%23333333">29. 다음 글의 빈칸 (A), (B)에 들어갈 말은? [3.5점]</text>
      <text x="25" y="210" font-size="9" fill="%23555555">Humans are unique in (A) [adaptation/adapted] and finding...</text>
      <text x="20" y="235" font-size="11" font-weight="bold" fill="%23333333">선택한 답: ③ (A) adapted - (B) however</text>
      <!-- Cross for wrong -->
      <path d="M120,200 L150,240" stroke="%23e11d48" stroke-width="2" opacity="0.8"/>
      
      <!-- Score badge -->
      <rect x="20" y="320" width="260" height="50" rx="6" fill="%231a2744" opacity="0.05"/>
      <text x="150" y="350" font-size="16" font-weight="bold" fill="%231a2744" text-anchor="middle">Score: 88점 (우수)</text>
    </svg>`,
    mockData: {
      score: "85 / 100점",
      summary: "전체적인 영작과 관계대명사의 쓰임은 파악하고 있으나, 전치사 + 관계대명사(인 관계부사의 대용) 구조와 목적격 보어 및 분사구문 수식 관계에서 살짝 흔들리는 모습이 보입니다. 기본 구문 독해력을 더 보완합시다.",
      questions: [
        {
          id: 28,
          text: "수능형 어법상 어색한 부분 고르기 (3점)",
          correctAnswer: "②의 'the ways which' -> 'the ways in which' 또는 'how'",
          studentAnswer: "②",
          isCorrect: true,
          explanation: "정확하게 정답을 지목했습니다. 뒤에 'we interact'라는 완전한 문장이 이어지므로, 관계대명사 which가 아닌 관계부사 how나 전치사+관계대명사인 in which가 쓰여야 합니다. (이때 way와 how는 함께 쓸 수 없음에 주의하세요!)"
        },
        {
          id: 29,
          text: "지문 빈칸 (A), (B)에 알맞은 표현 넣기 (3.5점)",
          correctAnswer: "⑤ (A) adaptation - (B) therefore",
          studentAnswer: "③ (A) adapted - (B) however",
          isCorrect: false,
          explanation: "(A)가 위치한 자리는 전치사 'in'의 목적어 역할을 해야 하므로 명사형인 'adaptation'이 와야 하며, (B)는 앞뒤 인과관계를 완성해 주는 접속부사 'therefore'가 자연스럽습니다. 해석의 결을 잘못 짚어 역접으로 착각한 오답입니다."
        }
      ],
      weaknesses: [
        "전치사의 쓰임과 결합하는 동명사/명사 목적어의 자리 판별",
        "순접(Inference) vs 역접(Concession) 접속사의 정확한 의미 교정"
      ],
      weaknesses_structured: [
        { type: "취약", description: "전치사의 쓰임과 결합하는 동명사/명사 목적어의 자리 판별 실수" },
        { type: "주의", description: "순접(Inference) vs 역접(Concession) 접속사의 정확한 의미 교정 필요" },
        { type: "우수", description: "관계대명사의 기본 구조 파악 능력 우수" }
      ],
      study_plan: [
        { day: "월요일", topic: "전치사 + 관계대명사의 핵심 기본 역할 및 수식 구조 이해", problems: 10 },
        { day: "화요일", topic: "동명사 및 일반 명사 목적어의 판별법 문장 교정 훈련", problems: 15 },
        { day: "수요일", topic: "순접과 역접을 구분하는 핵심 접속부사의 구조와 쓰임 암기", problems: 15 },
        { day: "목요일", topic: "지문의 전후 맥락(인과 관계)을 통한 적합한 접속사 고르기 훈련", problems: 20 },
        { day: "금요일", topic: "관계사 및 전치사의 복합 문법 변형 실전 모의 문제 풀이", problems: 25 }
      ],
      studyTips: [
        "접속부사가 들어가는 수능 지문을 풀 때는 빈칸 문장 바로 앞뒤 두 줄의 원인과 결과를 유기적으로 연결해 보는 노트를 적어보세요.",
        "영어 동사의 특징(자동사인지 타동사인지)과 함정에 자주 나오는 다기능 전치사의 고정 구를 10개씩 암기합시다."
      ],
      similarQuestions: [
        {
          id: 1,
          question: "Choose the grammatically INCORRECT sentence.",
          options: [
            "This is the museum which we visited last year.",
            "This is the museum in which we visited last year.",
            "This is the museum where we took many photos.",
            "This is the housing where he was born."
          ],
          answer: "This is the museum in which we visited last year.",
          explanation: "'visited'는 타동사로서 뒤에 목적어가 빠진 불완전한 문장이 오므로 목적격 관계대명사 'which'를 쓰는 것이 옳습니다. 따라서 전치사를 덧붙인 'in which'는 비문법적입니다."
        }
      ]
    }
  }
];
