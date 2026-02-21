'use client';

import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Boardroom } from '@/components/Boardroom';
import { FactoryFloor } from '@/components/FactoryFloor';
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
    startOrchestration,
    handleUserMessage,
  } = useOrchestration();

  // Kick off Phase 1 on mount (after a brief moment to let the UI settle)
  useEffect(() => {
    const t = setTimeout(startOrchestration, 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Header systemStatus={systemStatus} deployHash={deployHash} />

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
          />
        </div>

        {/* Right: Factory Floor (React Flow) — 60% */}
        <div className="w-[60%] overflow-hidden">
          <FactoryFloor nodes={nodes} phase={phase} />
        </div>
      </main>
    </div>
  );
}
