'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Boardroom } from '@/components/Boardroom';
import { FactoryFloor } from '@/components/FactoryFloor';
import { PRModal } from '@/components/PRModal';
import { useOrchestration } from '@/hooks/useOrchestration';

export default function Home() {
  const {
    phase,
    messages,
    nodes,
    systemStatus,
    deployHash,
    isTyping,
    typingAs,
    inputLocked,
    showPRModal,
    prVersion,
    startOrchestration,
    handleUserMessage,
    approvePR,
    requestChanges,
    selectStakeholder,
  } = useOrchestration();

  // Kick off Phase 1 on mount (after a brief moment to let the UI settle)
  useEffect(() => {
    const t = setTimeout(startOrchestration, 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Header systemStatus={systemStatus} deployHash={deployHash} phase={phase} />

      {/* ── Split-screen body ──────────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Boardroom (Chat) — 40% */}
        <div className="w-[40%] overflow-hidden">
          <Boardroom
            messages={messages}
            isTyping={isTyping}
            typingAs={typingAs}
            inputLocked={inputLocked}
            handleUserMessage={handleUserMessage}
            phase={phase}
            selectStakeholder={selectStakeholder}
          />
        </div>

        {/* Right: Factory Floor (React Flow) — 60% */}
        <div className="w-[60%] overflow-hidden">
          <FactoryFloor nodes={nodes} phase={phase} />
        </div>
      </main>
      {/* ── PR Approval Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPRModal && (
          <PRModal
            onApprove={approvePR}
            onRequestChanges={requestChanges}
            prVersion={prVersion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
