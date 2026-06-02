/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, ShieldAlert, Sparkles, CheckCircle, Download, Landmark } from "lucide-react";
import { Question, UserType, TypeDetail } from "../types";

// Explicit 7 Questions as documented in the specification
const QUESTIONS: Question[] = [
  {
    q: "이번 달 예상치 못한 여유 자금 50만 원이 생겼어요. 가장 먼저 하고 싶은 건?",
    choices: [
      { text: "적금이나 예금에 넣어둔다", scores: { A: 2 } },
      { text: "일부는 저축, 일부는 소비한다", scores: { B: 2 } },
      { text: "투자 기회를 찾아본다", scores: { C: 2 } },
      { text: "비상금으로 따로 둔다", scores: { A: 1, B: 1 } }
    ]
  },
  {
    q: "투자한 금액이 10% 손실 났습니다. 어떻게 하시겠어요?",
    choices: [
      { text: "즉시 손절하고 원금 보전에 집중한다", scores: { A: 2 } },
      { text: "상황을 지켜보다가 판단한다", scores: { B: 2 } },
      { text: "오히려 더 매수 기회라고 생각한다", scores: { C: 2 } }
    ]
  },
  {
    q: "지금 가장 중요하게 생각하는 금융 목표는?",
    choices: [
      { text: "비상금 확보와 안정적인 자산 보존", scores: { A: 2 } },
      { text: "내 집 마련 등 중장기 목표 달성", scores: { B: 2 } },
      { text: "빠른 자산 증식과 재정적 자유", scores: { C: 2 } },
      { text: "아직 잘 모르겠다", scores: { A: 1, B: 1 } }
    ]
  },
  {
    q: "연 수익률 8%를 기대하는 대신 원금 손실 위험이 있는 상품, 어떻게 느끼시나요?",
    choices: [
      { text: "원금 손실은 절대 안 된다", scores: { A: 2 } },
      { text: "일부 손실은 감수할 수 있다", scores: { B: 2 } },
      { text: "그 정도 리스크는 충분히 감수한다", scores: { C: 2 } }
    ]
  },
  {
    q: "새로운 금융 상품을 알게 됐을 때, 나의 행동은?",
    choices: [
      { text: "검증된 기관(은행, 공공기관) 정보를 먼저 찾는다", scores: { A: 2 } },
      { text: "여러 출처를 비교해서 결정한다", scores: { B: 2 } },
      { text: "빠르게 가입 후 직접 경험해본다", scores: { C: 2 } }
    ]
  },
  {
    q: "지금 내 재정 상황을 한 마디로 표현한다면?",
    choices: [
      { text: "아직 기반이 부족해서 안전하게 쌓아가야 한다", scores: { A: 2 } },
      { text: "조금씩 자산을 늘려가는 단계다", scores: { B: 2 } },
      { text: "적극적으로 불려야 할 시기다", scores: { C: 2 } },
      { text: "잘 모르겠다", scores: { A: 1, B: 1 } }
    ]
  },
  {
    q: "돈을 대하는 나의 가장 중요한 원칙은?",
    choices: [
      { text: "잃지 않는 것이 버는 것보다 중요하다", scores: { A: 2 } },
      { text: "균형 잡힌 포트폴리오가 최선이다", scores: { B: 2 } },
      { text: "과감한 투자 없이는 큰 수익도 없다", scores: { C: 2 } }
    ]
  }
];

// Persona Data
const TYPE_DETAILS: Record<UserType, TypeDetail> = {
  A: {
    icon: "🛡️",
    name: "안정형 투자자",
    tagline: "잃지 않는 것이 최고의 전략",
    desc: "당신은 안정을 최우선으로 생각하는 신중한 투자자예요. 원금 보존을 중시하고 예측 가능한 수익을 선호합니다. 적금, 예금, 주택청약, 원금보장형 ISA가 제일 궁합이 맞는 상품들이에요. 성급하게 주식 시장이나 가상 자산에 뛰어들기보다, 일차적으로 비상금 조달 및 착실한 예금 계좌를 완성하시는 생활 리듬을 깊게 권장드려요.",
    keywords: ["적금", "안전 예금", "주택 청약", "비상금 통장", "원금보장 ISA"]
  },
  B: {
    icon: "⚖️",
    name: "균형형 투자자",
    tagline: "안정과 성장, 두 마리 토끼를 잡는다",
    desc: "당신은 위험 관리와 이익 창출을 합리적으로 절충하는 군더더기 없는 균형 잡힌 투자자예요. 적합한 변동성을 수긍하며 가랑비 옷 젖듯 꾸준히 불리는 자산 설계를 희망합니다. 혼합형 ISA, 적금과 소액 인덱스 ETF 혼용, 혹은 안정성 가미 IRP 포트폴리오가 환상적인 궁합이 되겠네요.",
    keywords: ["혼합형 ISA", "IRP 계좌", "인덱스 ETF", "적금+주식 병행"]
  },
  C: {
    icon: "🚀",
    name: "성장형 투자자",
    tagline: "과감한 도전이 큰 수익을 만든다",
    desc: "당신은 복리 효과와 투자 성과 극대화에 심장이 뛰는 패기 있는 성장 지향 투자자예요. 긴 투자 시야로 확실한 방향만 있다면 하락 리스크를 흔쾌히 감수할 단단한 심지를 지녔죠. 지수 추종 주식형 ETF, 일반형 ISA, 공격형 IRP 하이 펀드가 최적의 짝꿍입니다. 다만 3~6개월 치의 버퍼 비상금은 반드시 별도 마련 후 본격 레이스를 하세요!",
    keywords: ["소수점 해외주식", "성장주 ETF", "일반형 ISA", "공격형 IRP", "안전 비상금"]
  }
};

interface DiagnosisSectionProps {
  onBackToMain: () => void;
  onComplete: (userType: UserType) => void;
}

export default function DiagnosisSection({ onBackToMain, onComplete }: DiagnosisSectionProps) {
  const [step, setStep] = useState<'intro' | 'question' | 'loading' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [scores, setScores] = useState<{ A: number; B: number; C: number }>({ A: 0, B: 0, C: 0 });
  const [userFinishedType, setUserFinishedType] = useState<UserType | null>(null);

  const startSurvey = () => {
    setStep('question');
    setCurrentQ(0);
    setAnswers([]);
    setScores({ A: 0, B: 0, C: 0 });
  };

  const selectChoice = (choiceIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQ] = choiceIndex;
    setAnswers(updatedAnswers);

    // Auto trigger move forward with tiny delay to let user see selection highlight
    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(prev => prev + 1);
      } else {
        // Complete the test!
        calculateAndFinish(updatedAnswers);
      }
    }, 250);
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1);
    } else {
      setStep('intro');
    }
  };

  const calculateAndFinish = (finalAnswers: number[]) => {
    setStep('loading');

    // Run scores tally
    const finalScores = { A: 0, B: 0, C: 0 };
    finalAnswers.forEach((choiceIndex, qIndex) => {
      const q = QUESTIONS[qIndex];
      const ch = q.choices[choiceIndex];
      if (ch && ch.scores) {
        if (ch.scores.A) finalScores.A += ch.scores.A;
        if (ch.scores.B) finalScores.B += ch.scores.B;
        if (ch.scores.C) finalScores.C += ch.scores.C;
      }
    });

    setScores(finalScores);

    // Classify
    // Max calculation, with priority: A > B > C (safer direction first)
    const maxVal = Math.max(finalScores.A, finalScores.B, finalScores.C);
    let determinedType: UserType = 'A';
    if (finalScores.A === maxVal) {
      determinedType = 'A';
    } else if (finalScores.B === maxVal) {
      determinedType = 'B';
    } else {
      determinedType = 'C';
    }

    setUserFinishedType(determinedType);

    // Simulate analysis delay
    setTimeout(() => {
      setStep('result');
    }, 1500);
  };

  // Export Results to TXT Download
  const downloadResultTxt = () => {
    if (!userFinishedType) return;
    const details = TYPE_DETAILS[userFinishedType];
    const today = new Date().toLocaleDateString("ko-KR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const fileContent = `=========================================
FinChat (핀챗) 금융 가치관 진단 결과 보고서
=========================================
진단 일시: ${today}
나의 진단 결과: [${details.name}] ${details.icon}
슬로건: "${details.tagline}"

-----------------------------------------
[종합 심층 설명]
${details.desc}

[추천 핵심 금융 키워드]
${details.keywords.map(k => `* ${k}`).join('\n')}

-----------------------------------------
[진단 문항별 답변 일람]
${QUESTIONS.map((q, idx) => {
  const chosenIndex = answers[idx];
  const choiceText = chosenIndex !== undefined ? q.choices[chosenIndex].text : "미응답";
  return `Q${idx + 1}. ${q.q}\n=> 내가 선택한 답변: "${choiceText}"`;
}).join('\n\n')}

=========================================
* 본 진단결과는 사용자의 주관적인 성향 조사를 기반으로 AI 도우미 맞춤화를 위해 제공되는 참고적 시뮬레이션 데이터입니다.
* 핀챗 AI 상담을 시작하려면 웹 페이지에서 상담하기 버튼을 클릭해보세요!
=========================================`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const plainDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    link.download = `finchat_result_${plainDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const progressPercentage = ((currentQ + 1) / QUESTIONS.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto min-h-[60vh] flex flex-col justify-center px-4 py-8 relative">
      <AnimatePresence mode="wait">
        
        {/* Step 1: Intro */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1A1740]/80 border border-[#2D2A5E] rounded-2xl p-6 md:p-8 shadow-xl text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#7C6FF0]/10 flex items-center justify-center text-[#7C6FF0] mx-auto mb-6">
              <Landmark className="w-6 h-6 animate-pulse" />
            </div>
            
            <h1 className="font-sans font-bold text-2xl text-white mb-2 leading-tight">
              나의 금융 가치관 진단
            </h1>
            <p className="text-[#9CA3AF] text-xs leading-relaxed max-w-sm mx-auto mb-8">
              총 7개의 생활 밀착형 금융 질문을 통해 당신만의 돈 관리 우선순위를 해부해 드립니다.<br />
              시간은 약 3분 소요됩니다.
            </p>

            <div className="space-y-3 max-w-xs mx-auto mb-8 text-left text-xs text-[#9CA3AF]">
              <div className="flex items-center gap-2 bg-[#0F0C2A] p-2.5 rounded-lg border border-[#2D2A5E]">
                <CheckCircle className="w-4 h-4 text-[#4ECFA8] shrink-0" />
                <span>회원가입/개인인증이 일절 불필요합니다</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0F0C2A] p-2.5 rounded-lg border border-[#2D2A5E]">
                <CheckCircle className="w-4 h-4 text-[#4ECFA8] shrink-0" />
                <span>답변 내용은 서버에 영구히 수집되지 않습니다</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0F0C2A] p-2.5 rounded-lg border border-[#2D2A5E]">
                <CheckCircle className="w-4 h-4 text-[#4ECFA8] shrink-0" />
                <span>진단 즉시 결과 분석 다운로드를 지원합니다</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <button
                onClick={onBackToMain}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#2D2A5E] text-[#9CA3AF] text-xs font-semibold hover:bg-[#1A1740] hover:text-white transition-all cursor-pointer"
              >
                메인 페이지로
              </button>
              <button
                onClick={startSurvey}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#7C6FF0] text-white text-xs font-semibold hover:bg-[#5A4ED4] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#7C6FF0]/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                진단 시작하기
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Questions Box */}
        {step === 'question' && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1A1740]/80 border border-[#2D2A5E] rounded-2xl p-6 md:p-8 shadow-xl"
          >
            {/* Nav & Progress */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                뒤로가기
              </button>
              <span className="text-[11px] font-mono font-bold text-[#4ECFA8] bg-[#0F0C2A] px-2.5 py-1 rounded-full border border-[#2D2A5E]">
                문항 {currentQ + 1} / {QUESTIONS.length}
              </span>
            </div>

            {/* Visual Progress Bar filled dynamically */}
            <div className="progress-bar w-full h-[6px] rounded-full bg-[#131133] border border-[#2D2A5E] overflow-hidden mb-8">
              <div
                className="progress-fill h-full bg-gradient-to-r from-[#7C6FF0] to-[#4ECFA8] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="min-h-[70px] mb-8">
              <h2 className="text-white font-sans text-base md:text-lg font-bold leading-relaxed whitespace-pre-wrap select-none">
                {QUESTIONS[currentQ].q}
              </h2>
            </div>

            {/* Choice Cards */}
            <div className="space-y-3">
              {QUESTIONS[currentQ].choices.map((choice, idx) => {
                const isSelected = answers[currentQ] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => selectChoice(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-[#7C6FF0]/15 border-[#7C6FF0] text-white font-semibold"
                        : "bg-[#0F0C2A]/65 border-[#2D2A5E] text-[#9CA3AF] hover:bg-[#1C194f] hover:border-[#7C6FF0]/40 hover:text-[#F0EEF8]"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#131133] border border-[#2D2A5E] text-[10px] font-bold mr-3 text-[#7C6FF0]">
                      {idx + 1}
                    </span>
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Loading Screen */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            {/* Spinning Indicator */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[#2D2A5E]" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#7C6FF0] border-r-[#4ECFA8] animate-spin" />
            </div>
            
            <h3 className="text-white font-sans text-base font-bold animate-pulse mb-2">
              금융 가치관 해독 중...
            </h3>
            <p className="text-[#9CA3AF] text-xs leading-relaxed max-w-xs">
              어떤 저축 타입과 리스크 대처능력을 지니셨는지 <br />
              핀챗 시스템이 똑똑하게 분류 요약하고 있습니다.
            </p>
          </motion.div>
        )}

        {/* Step 4: Result Box */}
        {step === 'result' && userFinishedType && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="bg-[#1A1740]/85 border border-[#2D2A5E] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Result Header Badge */}
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4ECFA8]/10 border border-[#4ECFA8]/30 text-[#4ECFA8] text-[11px] font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>진단 해독 완료</span>
            </div>

            {/* Persona Visual Representation */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#0F0C2A] border border-[#2D2A5E] flex items-center justify-center text-4xl shadow-inner shadow-black/40">
                {TYPE_DETAILS[userFinishedType].icon}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#AFA9EC]">FINANCIAL PERSONALITY</span>
                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                  {TYPE_DETAILS[userFinishedType].name}
                </h2>
              </div>
            </div>

            {/* Tagline */}
            <div className="bg-[#0F0C2A] border border-[#2D2A5E] rounded-xl px-4 py-3 text-center mb-6">
              <span className="text-[#4ECFA8] font-sans font-extrabold text-sm">
                &ldquo;{TYPE_DETAILS[userFinishedType].tagline}&rdquo;
              </span>
            </div>

            {/* Core Description Text */}
            <p className="text-[#9CA3AF] text-xs leading-relaxed mb-6 whitespace-pre-wrap">
              {TYPE_DETAILS[userFinishedType].desc}
            </p>

            {/* Recommended Keyword tags list */}
            <div className="mb-8">
              <span className="block text-[10px] font-bold text-[#AFA9EC] mb-2.5 uppercase tracking-wider">추천 핵심 금융 키워드</span>
              <div className="flex flex-wrap gap-2">
                {TYPE_DETAILS[userFinishedType].keywords.map((keyword, kIdx) => (
                  <span
                    key={kIdx}
                    className="px-2.5 py-1 rounded-lg bg-[#231F50]/60 border border-[#2D2A5E] text-[11px] text-[#AFA9EC] font-medium"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-4 border-t border-[#2D2A5E]">
              <button
                onClick={() => onComplete(userFinishedType)}
                id="btn-goto-chat"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C6FF0] to-[#5A4ED4] text-white text-xs font-semibold hover:shadow-lg hover:shadow-[#7C6FF0]/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                이 결과로 맞춤형 상담 시작하기
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={startSurvey}
                  className="flex-1 py-2.5 rounded-xl border border-[#2D2A5E] text-[#9CA3AF] text-xs hover:bg-[#0F0C2A] hover:text-white transition-all cursor-pointer"
                >
                  다시 진단하기
                </button>
                <button
                  onClick={downloadResultTxt}
                  className="flex-1 py-2.5 rounded-xl bg-[#231F50] text-[#4ECFA8] text-xs hover:bg-[#2D2A5E] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  보고서 저장 (.txt)
                </button>
              </div>
            </div>

            {/* Regulatory Disclaimer bottom */}
            <div className="mt-6 flex items-start gap-1.5 p-2.5 rounded bg-[#131133] border border-[#2D2A5E] text-[10px] text-[#4B4870]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#4B4870] shrink-0 mt-0.5" />
              <span>본 진단은 심리 금융 성향 분류용 모의 리포트이며, 금융소비자 보호를 위해 특정 직접 계좌 가입이나 연동은 절대 요구하지 않습니다.</span>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
