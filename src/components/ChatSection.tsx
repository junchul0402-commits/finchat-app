/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Send, Download, Sparkles, AlertCircle, BookOpen, ThumbsUp, ThumbsDown, RefreshCw, X
} from "lucide-react";
import { ChatMessage, UserType } from "../types";

// Core terms glossary dictionary from documentation
const TERM_DICTIONARY: Record<string, string> = {
  'IRP': '개인형 퇴직연금. 세금 혜택을 받으며 노후 자금을 적립하는 계좌예요. 연간 최대 세액공제 한도가 높습니다.',
  'ISA': '개인종합자산관리계좌. 예금·펀드·ETF 등 여러 금융상품을 하나의 계좌에서 운용하고 세금 혜택을 받을 수 있어요.',
  'ETF': '상장지수펀드. 주식처럼 편리하게 편리하게 사고팔 수 있는 분산 투자형 펀드예요.',
  '청약': '주택청약. 아파트 분양 신청 자격을 선제적으로 축적하는 적금으로, 사회초년생의 필수 상품입니다.',
  '적금': '매달 다달이 일정액을 납입하고 만기에 확정 원리금을 이자와 수령하는 전통 저축 상품입니다.',
  '예금': '목돈을 일시에 예치해두고 만기에 고정 이자와 함께 원금을 일시 회수하는 정기 저축성 금융상품입니다.',
  '펀드': '다수 고객들의 자금을 취합하여 신탁 전문가 자산운용사가 대신 투자 운용해 실적 분배하는 적립/거치식 수탁자산입니다.',
  '세액공제': '산출된 근로/평가 연 소득 납부세액 중에서 법정 공제율에 따라 세금을 마이너스 경감해주는 혜택입니다.',
  '비상금': '돌발 지출에 신속히 방어하는 유휴 현금성 예비자산으로, 통상 평균 가계 지출의 3~6개월치 잔액을 권유합니다.'
};

const GREETING_MESSAGES: Record<UserType, string> = {
  A: `안녕하세요! 진단 결과, **안정형 투자자** 성향이시네요 🛡️\n원금을 소중히 여기고 안전하게 예·적금을 쌓는 성향이 핀챗 시스템에 해독되었습니다.\n\n"처음 적금을 들려는데 이율 높은 특별 상품이 뭔지?", "비상금 통장은 어떻게 쪼개야 하는지" 등 무엇이든 물어보세요!`,

  B: `안녕하세요! 진단 결과, **균형형 투자자** 성향이시네요 ⚖️\n안정성과 과감성 모두 영리하게 밸런스를 저울질하는 합리적 마인드를 가졌군요!\n\n"적금과 ETF 주식을 조합하는 똑똑한 비중법이 뭔지?", "세금 공제받기 좋은 IRP가 무엇인지" 등 대화를 통해 풀어봐요!`,

  C: `안녕하세요! 진단 결과, **성장형 투자자** 성향이시네요 🚀\n자본 소득 복리 효과에 열정적이며 리스크도 현명하게 안고 가는 성장형 투자자 성향이 매칭되었습니다.\n\n"사회초년생 추천 배당/지수 ETF가 무엇인지?", "ISA 절세 혜택 극대화 전략은 어떻게 하는지" 등 궁금한 것을 격의 없이 채팅으로 이야기해주세요!`
};

interface ChatSectionProps {
  userType: UserType;
  onBackToDiagnosis: () => void;
}

export default function ChatSection({ userType, onBackToDiagnosis }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<{ term: string; definition: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Greeting message when mounting
  useEffect(() => {
    setMessages([
      {
        id: "greeting",
        sender: "ai",
        text: GREETING_MESSAGES[userType],
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        feedback: null
      }
    ]);
  }, [userType]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiLoading]);

  // Analyze message text for glossary keywords and return unique matches
  const detectGlossaryTerms = (text: string): string[] => {
    const matched: string[] = [];
    Object.keys(TERM_DICTIONARY).forEach(term => {
      if (text.includes(term)) {
        matched.push(term);
      }
    });
    return matched;
  };

  // Submit User Message
  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isAiLoading) return;

    if (trimmed.length > 200) {
      alert("질문 길이는 최대 200자까지만 적어주세요!");
      return;
    }

    setApiError(null);
    setInputText("");

    const timestampStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

    // User Message push
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: timestampStr,
      feedback: null
    };

    setMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      // Create request payload history
      const reqHistory = messages.map(m => ({
        sender: m.sender === "ai" ? "ai" : "user",
        text: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          userType: userType,
          history: reqHistory
        })
      });

      let responseText = "";
      try {
        responseText = await response.text();
      } catch (readErr) {
        throw new Error("서버 응답을 수신하는 데 실패했습니다.");
      }

      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.warn("Expected JSON but received alternative format:", responseText);
        throw new Error("금융 상담원 서버가 현재 준비 중이거나 패치를 배포 중입니다. 잠시 후 다시 전송해주세요.");
      }

      if (!response.ok) {
        throw new Error(data?.error || `상담원 응답 과정에서 지연이 존재합니다. (상수: ${response.status})`);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        feedback: null
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Chat API processing failure:", err);
      setApiError(err.message || "금융 상담원과의 무선 통신망 일시 지연이 감지되었습니다.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle Input text change with character limitation limit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 200) {
      setInputText(val);
    }
  };

  // Export full discussion contents to TXT File on client
  const exportFullConversation = () => {
    if (messages.length <= 1) {
      alert("상담 중인 대화 내역이 빈약하여 저장하지 못했습니다.");
      return;
    }

    const today = new Date().toLocaleDateString("ko-KR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const fileHeader = `=====================================================
FinChat (핀챗) — 전문 성향 맞춤형 금융 상담 대화 기록
=====================================================
기록 일시: ${today}
나의 진단 가치관: [${userType === 'A' ? '안정형 🛡️' : userType === 'B' ? '균형형 ⚖️' : '성장형 🚀'}]

-----------------------------------------------------
`;

    const chatText = messages.map(m => {
      const senderName = m.sender === 'ai' ? '핀챗 AI 금융전문가' : '사용자 (나)';
      const likedLabel = m.feedback ? `  [피드백: ${m.feedback === 'like' ? '유용함 👍' : '부족함 👎'}]` : '';
      return `[${m.timestamp}] ${senderName}:\n${m.text}${likedLabel}`;
    }).join("\n\n-----------------------------------------------------\n\n");

    const fileContent = fileHeader + chatText + `\n\n=====================================================
* 본 기록 파일은 수집되지 않으며 오로지 사용자의 로컬 보존 편익을 위해 임시 다운로드 링크로 지원됩니다.
* FinChat 서비스를 애용해주셔서 감사드립니다.
=====================================================`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const plainDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    link.download = `finchat_chat_${plainDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Likes Feedback
  const handleFeedback = (msgId: string, rating: 'like' | 'dislike') => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId) {
          return { ...m, feedback: m.feedback ? m.feedback : rating };
        }
        return m;
      })
    );
  };

  // Re-request AI reply for retry
  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === "user");
    if (lastUserMsg) {
      handleSend(lastUserMsg.text);
    }
  };

  return (
    <div id="page-chat" className="w-full max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[450px] relative px-4 pt-4">
      
      {/* Top Banner indicating the user finished profile with beautiful back button */}
      <div className="bg-[#100D2D] border border-[#2D2A5E] rounded-xl px-4 py-3 mb-4 flex items-center justify-between shadow-lg">
        <button
          onClick={onBackToDiagnosis}
          className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          진단 결과 보기
        </button>
        <div className="flex items-center gap-1.5 bg-[#4ECFA8]/10 px-2.5 py-1 rounded-lg border border-[#4ECFA8]/20 text-[#4ECFA8] text-xs font-bold leading-none">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>성향 프로필 동기화: {userType === 'A' ? '안정형 🛡️' : userType === 'B' ? '균형형 ⚖️' : '성장형 🚀'}</span>
        </div>
        <button
          onClick={exportFullConversation}
          title="상담 대화 내용 txt로 백업하기"
          className="flex items-center gap-1 bg-[#1E194D] hover:bg-[#2A236C] border border-[#2D2A5E] text-[11px] text-[#AFA9EC] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          대화 백업
        </button>
      </div>

      {/* Main chat window box */}
      <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-xl bg-[#1A1740]/60 border border-[#2D2A5E] shadow-inner space-y-4 scrollbar-thin scroll-smooth">
        
        {messages.map((m) => {
          const matchedTerms = m.sender === 'ai' ? detectGlossaryTerms(m.text) : [];
          
          return (
            <div key={m.id} className="flex flex-col space-y-1">
              
              <div className={`flex w-full ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                
                <div className={`flex flex-col max-w-[85%] ${m.sender === "user" ? "items-end" : "items-start"}`}>
                  
                  {/* Sender Name above AI bubbles */}
                  {m.sender === 'ai' && (
                    <span className="text-[10px] font-sans font-bold text-[#AFA9EC] ml-1 mb-1 block">핀챗 금융 인공지능</span>
                  )}

                  {/* Speech Balloon Body */}
                  <div
                    className={`text-xs p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-gradient-to-br from-[#4ECFA8]/15 to-[#3cb18b]/10 text-[#A8EDD8] rounded-br-none border border-[#4ECFA8]/30"
                        : "bg-gradient-to-br from-[#7C6FF0]/15 to-[#5A4ED4]/10 text-[#D4CFFF] rounded-bl-none border border-[#7C6FF0]/30"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* AI Bubble Bottom Info Section */}
                  {m.sender === 'ai' && (
                    <div className="flex flex-col w-full text-[10px] text-[#4B4870] mt-1.5 px-1 space-y-1">
                      
                      {/* Sub footer tags for AI messages */}
                      {m.id !== 'greeting' && (
                        <div className="flex flex-wrap items-center justify-between gap-1 mt-0.5">
                          <span className="text-[9px] text-[#4B4870]">📋 금융감독원 공공 데이터 기준 자료</span>
                          
                          {/* Feedback like / dislikes toggle buttons */}
                          <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                            <button
                              onClick={() => handleFeedback(m.id, 'like')}
                              disabled={m.feedback !== undefined && m.feedback !== null}
                              className={`p-1.5 rounded-lg hover:bg-[#1E1949] hover:text-[#4ECFA8] transition-all cursor-pointer ${
                                m.feedback === 'like' ? 'text-[#4ECFA8] bg-[#4ECFA8]/10' : ''
                              }`}
                              title="답변이 유용합니다"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(m.id, 'dislike')}
                              disabled={m.feedback !== undefined && m.feedback !== null}
                              className={`p-1.5 rounded-lg hover:bg-[#1E1949] hover:text-[#EF4444] transition-all cursor-pointer ${
                                m.feedback === 'dislike' ? 'text-[#EF4444] bg-[#EF4444]/10' : ''
                              }`}
                              title="내용이나 설명이 부족합니다"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Glossarry Term Quick badge selector helper */}
                      {matchedTerms.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1 border-t border-[#2D2A5E]/40">
                          <span className="text-[9px] text-[#AFA9EC] font-semibold flex items-center gap-1 shrink-0">
                            <BookOpen className="w-2.5 h-2.5" />
                            쉬운 금융 용어 보기:
                          </span>
                          {matchedTerms.map((term) => (
                            <button
                              key={term}
                              onClick={() => setActiveGlossaryTerm({ term: term, definition: TERM_DICTIONARY[term] })}
                              className="px-2.5 py-0.5 rounded bg-[#2D2A5E] hover:bg-[#7C6FF0]/20 text-[#AFA9EC] hover:text-white transition-all text-[9px] font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              {term} ?
                            </button>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                  {/* Stamp of Message Time */}
                  <span className="text-[9px] text-[#4B4870] mt-1 block select-none">
                    {m.timestamp}
                  </span>

                </div>

              </div>

            </div>
          );
        })}

        {/* Loader Pulsing Dot */}
        {isAiLoading && (
          <div className="flex flex-col space-y-1 items-start max-w-[85%] animate-fade-in">
            <span className="text-[10px] font-sans font-bold text-[#AFA9EC] ml-1 mb-1 block">핀챗 금융 전문 AI 설계중</span>
            <div className="flex items-center gap-1.5 bg-[#1E1B4B]/50 px-4 py-3 rounded-2xl rounded-bl-none border border-[#7C6FF0]/20">
              <span className="w-2 h-2 rounded-full bg-[#7C6FF0] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#7C6FF0] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#7C6FF0] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Error notification card */}
        {apiError && (
          <div className="p-4 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/20 text-xs text-white max-w-md mx-auto space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#EF4444]">네트워크 일시 지연 혹은 API Key 점검이 필요합니다</p>
                <p className="text-[#9CA3AF] text-[11px] leading-relaxed mt-1">{apiError}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#2D2A5E]/40">
              <button
                onClick={handleRetry}
                className="px-3.5 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/35 text-white font-semibold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                지연된 내용 다시 전송하기
              </button>
            </div>
          </div>
        )}

        {/* Scroll endpoint */}
        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Glossary Dictionary Overlay Popup banner */}
      <AnimatePresence>
        {activeGlossaryTerm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-[90px] left-4 right-4 z-20 p-4 rounded-xl bg-[#231F50] border border-[#7C6FF0]/40 shadow-2xl space-y-1.5 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[#2D2A5E] pb-1.5">
              <span className="font-sans font-bold text-xs text-[#4ECFA8] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#4ECFA8]" />
                용어 뜻풀이 : {activeGlossaryTerm.term}
              </span>
              <button
                onClick={() => setActiveGlossaryTerm(null)}
                className="text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#F0EEF8] leading-relaxed py-1.5">
              {activeGlossaryTerm.definition}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Input area panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="relative bg-[#1A1740] border border-[#2D2A5E] rounded-xl p-2.5 flex items-center justify-between h-[60px] shadow-lg mb-6 gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="가치관 맞춤 핀챗에게 안전하게 금융 질문을 하세요..."
          className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none placeholder-[#4B4870] px-2 h-full"
          disabled={isAiLoading}
        />
        
        {/* Character cap indicator */}
        <span className="text-[9px] text-[#4B4870] shrink-0 font-mono select-none px-1">
          {inputText.length} / 200
        </span>

        <button
          type="submit"
          disabled={!inputText.trim() || isAiLoading}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            inputText.trim() && !isAiLoading
              ? "bg-[#7C6FF0] text-white shadow shadow-[#7C6FF0]/20 hover:bg-[#5A4ED4] hover:scale-105"
              : "bg-[#2D2A5E] text-[#4B4870]"
          }`}
          title="질문 전송"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
