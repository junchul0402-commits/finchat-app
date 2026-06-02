/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck, Zap, HeartHandshake } from "lucide-react";

interface HeroSectionProps {
  onStartDiagnosis: () => void;
}

interface SimulatedMessage {
  sender: "ai" | "user";
  text: string;
}

export default function HeroSection({ onStartDiagnosis }: HeroSectionProps) {
  // Chat Simulation sequence
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  useEffect(() => {
    // Sequence of chat messages in preview box
    const sequence = [
      {
        delay: 500,
        action: () => {
          setMessages([
            {
              sender: "ai",
              text: "안녕하세요! 저는 핀챗 이에요 😊 먼저 간단한 질문 하나 드려도 될까요? 이번 달 월급이 들어왔다면, 첫 번째로 뭘 하고 싶으세요?",
            },
          ]);
          setSimulationStep(1);
        },
      },
      {
        delay: 2000,
        action: () => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "user",
              text: "일단 적금은 넣어야 할 것 같은데… 뭐가 맞는지 잘 모르겠어요 😅",
            },
          ]);
          setSimulationStep(2);
        },
      },
      {
        delay: 3800,
        action: () => {
          setIsTyping(true);
        },
      },
      {
        delay: 5500,
        action: () => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: "그렇군요, 불확실한 게 당연해요! 조금 더 여쭤볼게요 — 지금 가장 걱정되는 게 뭔가요?\n\n① 당장 목돈 모으기\n② 나중을 위한 투자 시작\n③ 비상금 먼저 마련하기",
            },
          ]);
          setSimulationStep(3);
        },
      },
      {
        delay: 10000,
        action: () => {
          // Restart simulation
          setMessages([]);
          setIsTyping(false);
          setSimulationStep(0);
        },
      },
    ];

    const currentAction = sequence[simulationStep];
    if (currentAction) {
      const timer = setTimeout(currentAction.action, currentAction.delay);
      return () => clearTimeout(timer);
    }
  }, [simulationStep]);

  return (
    <div id="page-main" className="relative min-h-screen flex flex-col justify-between overflow-x-hidden pt-6">
      {/* Navbar */}
      <header className="w-full max-w-5xl mx-auto px-6 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C6FF0] to-[#5A4ED4] flex items-center justify-center font-bold text-white shadow-md shadow-[#7C6FF0]/20">
            핀
          </div>
          <span className="font-sans font-bold text-lg tracking-tight text-white">FinChat</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#1A1740] border border-[#2D2A5E] text-xs font-mono font-medium text-[#4ECFA8] flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ECFA8] animate-pulse"></span>
          BETA 1.0
        </span>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative">
        
        {/* Glow Element */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-radial from-[#7C6FF0]/15 to-transparent blur-3xl rounded-full -z-10" />

        {/* Hero Section Copy */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A1740] border border-[#2D2A5E] text-[#4ECFA8] text-xs font-medium mb-6 shadow-sm shadow-black/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>가입 없이 · 무료로 금융 고민 해결</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sans font-extrabold text-3xl md:text-5xl leading-[1.25] text-white tracking-tight"
          >
            내 금융 가치관부터 <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#7C6FF0] via-[#AFA9EC] to-[#4ECFA8] bg-clip-text text-transparent">
              딱 맞게
            </span>{" "}
            알아보고 상담하기
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#9CA3AF] text-sm md:text-base leading-relaxed mt-6 max-w-lg"
          >
            첫 월급 받고 어떻게 관리해야 할지 막막하셨나요? <br />
            핀챗은 특정 상품 가입 권유 없이, 오직 당신의 금융 성향과 가치관에 꼭 맞춘 안심 맞춤형 상담을 선사합니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 w-full sm:w-auto"
          >
            <button
              onClick={onStartDiagnosis}
              id="btn-start-diagnosis-main"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C6FF0] to-[#5A4ED4] text-white px-8 py-4 rounded-xl font-semibold text-base shadow-lg shadow-[#7C6FF0]/30 hover:shadow-[#7C6FF0]/45 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              지금 바로 진단 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-4 flex flex-wrap justify-center lg:justify-start items-center gap-4 text-xs font-medium text-[#9CA3AF]">
              <span className="flex items-center gap-1">✓ 회원가입 불필요</span>
              <span className="text-[#2D2A5E]">|</span>
              <span className="flex items-center gap-1">✓ 앱 설치 없음</span>
              <span className="text-[#2D2A5E]">|</span>
              <span className="flex items-center gap-1">✓ 안전한 완전 무료</span>
            </div>
          </motion.div>
        </div>

        {/* Visual Simulated Chat Preview Section */}
        <div className="flex-1 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full bg-[#1A1740]/80 backdrop-blur-md rounded-2xl border border-[#2D2A5E] overflow-hidden shadow-2xl shadow-black/40 flex flex-col h-[400px]"
          >
            {/* Mock Header */}
            <div className="px-4 py-3 bg-[#131133] border-b border-[#2D2A5E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#7C6FF0]/20 flex items-center justify-center text-xs text-[#7C6FF0] font-sans font-bold">
                  Fin
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">핀챗 AI 금융상담원</div>
                  <div className="text-[10px] text-[#4ECFA8] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ECFA8] animate-ping"></span>
                    상담 중
                  </div>
                </div>
              </div>
              <div className="px-2 py-0.5 rounded bg-[#2D2A5E] text-[9px] text-[#9CA3AF] font-mono">
                SIMULATOR
              </div>
            </div>

            {/* Simulated Chat Messages Panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none scroll-smooth">
              <span className="block text-center text-[10px] text-[#4B4870] my-2">핀챗 체험 시뮬레이션입니다</span>
              
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === "user" ? "ml-auto items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`text-xs p-3 rounded-2xl leading-relaxed whitespace-pre-wrap select-none ${
                        msg.sender === "user"
                          ? "bg-gradient-to-br from-[#4ECFA8]/15 to-[#3cb18b]/10 text-[#A8EDD8] rounded-br-none border border-[#4ECFA8]/20"
                          : "bg-gradient-to-br from-[#7C6FF0]/15 to-[#5A4ED4]/10 text-[#D4CFFF] rounded-bl-none border border-[#7C6FF0]/20"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-1 bg-[#1E1B4B]/50 px-3.5 py-2.5 rounded-2xl rounded-bl-none border border-[#7C6FF0]/10 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C6FF0] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C6FF0] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C6FF0] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            {/* Mock Input Area */}
            <div className="p-3 bg-[#131133] border-t border-[#2D2A5E] flex items-center justify-between text-[#4B4870]">
              <span className="text-xs select-none">진단 결과를 바탕으로 자유롭게 이야기 나눠요...</span>
              <div className="w-7 h-7 rounded-lg bg-[#2D2A5E] flex items-center justify-center text-white">
                <MessageSquare className="w-3.5 h-3.5 text-[#4B4870]" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature Bento Grid ( 차별점 3가지 카드 ) */}
      <section className="bg-[#120F33]/60 border-t border-b border-[#2D2A5E] py-16">
        <div className="w-full max-w-5xl mx-auto px-6">
          <div className="text-center max-w-lg mx-auto mb-12">
            <h2 className="text-[#4ECFA8] text-xs font-bold uppercase tracking-widest">핀챗만의 차별점</h2>
            <p className="text-white text-xl md:text-2xl font-bold mt-2">첫 금융 지식, 왜 핀챗이어야 할까요?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-[#1A1740]/40 rounded-xl border border-[#2D2A5E] hover:border-[#7C6FF0]/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#7C6FF0]/10 flex items-center justify-center text-[#7C6FF0] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">100% 중립 금융 정보</h3>
              <p className="text-[#9CA3AF] text-xs mt-2 leading-relaxed">
                특정 금융 제휴사의 광고성 수수료를 받지 않습니다. 무리한 상품 입점 및 판매 유도 없이 객관적인 정보만을 필터링합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-[#1A1740]/40 rounded-xl border border-[#2D2A5E] hover:border-[#7C6FF0]/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#4ECFA8]/10 flex items-center justify-center text-[#4ECFA8] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">내 가치관별 개인화</h3>
              <p className="text-[#9CA3AF] text-xs mt-2 leading-relaxed">
                7개의 간결한 생활 문항으로 심플 테스트를 거친 후 결과를 기반으로 금융 상담 내용을 다듬어 개인화 피드백을 제공합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-[#1A1740]/40 rounded-xl border border-[#2D2A5E] hover:border-[#7C6FF0]/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#AFA9EC]/10 flex items-center justify-center text-[#AFA9EC] mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">딸깍 진입, 안전 무관</h3>
              <p className="text-[#9CA3AF] text-xs mt-2 leading-relaxed">
                회원가입, 자산공개, 인증서 등록 등 귀찮고 껄끄러운 절차가 전혀 없습니다. 브라우저 탭 하나로 똑똑해져보세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Utilization section ( 이용방법 3단계 ) */}
      <section className="py-16 pb-24 text-center">
        <div className="w-full max-w-5xl mx-auto px-6">
          <h2 className="text-[#4ECFA8] text-xs font-bold uppercase tracking-widest mb-12">엄청 쉬운 핀챗 이용법</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-[#2D2A5E] bg-[#1A1740] flex items-center justify-center text-[#7C6FF0] font-sans font-extrabold text-base mb-3 shadow-md">
                1
              </div>
              <h3 className="text-sm font-bold text-white">금융 가치관 진단</h3>
              <p className="text-[#9CA3AF] text-xs mt-1 max-w-[180px]">7개 질문에 가볍게 대답하고 내 투자 성향을 알아봐요.</p>
            </div>
            
            <div className="hidden md:block text-[#2D2A5E] text-2xl font-light">→</div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-[#2D2A5E] bg-[#1A1740] flex items-center justify-center text-[#7C6FF0] font-sans font-extrabold text-base mb-3 shadow-md">
                2
              </div>
              <h3 className="text-sm font-bold text-white">성향 리포트 다운로드</h3>
              <p className="text-[#9CA3AF] text-xs mt-1 max-w-[180px]">성향 진단 요약을 영구 보존할 텍스트 파일로 저장해요.</p>
            </div>

            <div className="hidden md:block text-[#2D2A5E] text-2xl font-light">→</div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-[#2D2A5E] bg-[#1A1740] flex items-center justify-center text-[#4ECFA8] font-sans font-extrabold text-base mb-3 shadow-md">
                3
              </div>
              <h3 className="text-sm font-bold text-white">1:1 AI 맞춤 금융 상담</h3>
              <p className="text-[#9CA3AF] text-xs mt-1 max-w-[180px]">내 가치관이 연동된 똑똑한 핀챗 봇과 금융 질문을 탐색해보세요.</p>
            </div>
          </div>

          <div className="mt-16">
            <button
              onClick={onStartDiagnosis}
              id="btn-start-diagnosis-bottom"
              className="px-8 py-4 rounded-xl bg-transparent border border-[#7C6FF0]/40 text-[#AFA9EC] text-sm font-semibold hover:bg-[#7C6FF0]/10 hover:text-white transition-all cursor-pointer"
            >
              무료 금융 진단 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#2D2A5E] py-6 text-center text-[11px] text-[#4B4870]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <span>© 2026 FinChat (핀챗). All rights reserved.</span>
          <span className="flex items-center gap-1 text-[#9CA3AF]">
            ⚠ 이 솔루션은 금융 상품의 강매나 직접적 추천이 아닌 정보 상호작용 지식 목적입니다.
          </span>
        </div>
      </footer>
    </div>
  );
}
