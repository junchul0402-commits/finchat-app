/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import HeroSection from "./components/HeroSection";
import DiagnosisSection from "./components/DiagnosisSection";
import ChatSection from "./components/ChatSection";
import { UserType } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'diagnosis' | 'chat'>('main');
  const [userType, setUserType] = useState<UserType | null>(null);

  // Sync state with simple URI anchors to allow intuitive browser history back gestures
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#diagnosis") {
        setCurrentPage('diagnosis');
      } else if (hash === "#chat" && userType) {
        setCurrentPage('chat');
      } else {
        setCurrentPage('main');
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    
    // Check initial hash
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [userType]);

  const navigateTo = (page: 'main' | 'diagnosis' | 'chat') => {
    setCurrentPage(page);
    window.location.hash = page === 'main' ? '' : page;
  };

  const handleStartDiagnosis = () => {
    navigateTo('diagnosis');
  };

  const handleDiagnosisComplete = (determinedType: UserType) => {
    setUserType(determinedType);
    // After complete diagnosis state, go to the active secure chat window.
    navigateTo('chat');
  };

  return (
    <div className="min-h-screen bg-[#0F0C2A] text-[#F0EEF8] flex flex-col font-sans selection:bg-[#7C6FF0]/30 selection:text-white">
      
      {/* Visual background atmospheric lights */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#1E194D]/30 to-transparent -z-10 blur-3xl" />

      {/* Page Routing Container */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentPage === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <HeroSection onStartDiagnosis={handleStartDiagnosis} />
            </motion.div>
          )}

          {currentPage === 'diagnosis' && (
            <motion.div
              key="diagnosis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex items-center justify-center"
            >
              <DiagnosisSection
                onBackToMain={() => navigateTo('main')}
                onComplete={handleDiagnosisComplete}
              />
            </motion.div>
          )}

          {currentPage === 'chat' && userType && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex items-center justify-center pt-4 md:pt-8"
            >
              <ChatSection
                userType={userType}
                onBackToDiagnosis={() => navigateTo('diagnosis')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
