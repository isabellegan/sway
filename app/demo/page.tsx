'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Boardroom } from '@/components/Boardroom';
import { FactoryFloor } from '@/components/FactoryFloor';
import { PRModal } from '@/components/PRModal';
import { useOrchestration } from '@/hooks/useOrchestration';

export default function Demo() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const checkedRef = useRef(false);

  // On mount: consume the one-time session flag set by the landing page CTA.
  // If absent (direct URL, refresh, back-button) → bounce to landing.
  // useRef guard prevents StrictMode double-invocation from clearing the flag
  // before the second run can read it.
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    const flag = sessionStorage.getItem('sway_authorized');
    if (!flag) {
      router.replace('/');
      return;
    }
    sessionStorage.removeItem('sway_authorized');
    setAuthorized(true);
  }, [router]);

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
    selectedStakeholderId,
    startOrchestration,
    handleUserMessage,
    approvePR,
    requestChanges,
    selectStakeholder,
  } = useOrchestration();

  // Only start the orchestration once we've confirmed the session is valid
  useEffect(() => {
    if (!authorized) return;
    const t = setTimeout(startOrchestration, 600);
    return () => clearTimeout(t);
  }, [authorized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render nothing while checking (prevents flash before redirect)
  if (!authorized) return null;

  return (
    <div className="flex flex-col h-full">
      <Header systemStatus={systemStatus} deployHash={deployHash} phase={phase} />

      <main className="flex flex-1 overflow-hidden">
        <div className="w-[40%] overflow-hidden">
          <Boardroom
            messages={messages}
            isTyping={isTyping}
            typingAs={typingAs}
            inputLocked={inputLocked}
            handleUserMessage={handleUserMessage}
            phase={phase}
            selectStakeholder={selectStakeholder}
            selectedStakeholderId={selectedStakeholderId}
          />
        </div>
        <div className="w-[60%] overflow-hidden">
          <FactoryFloor nodes={nodes} phase={phase} />
        </div>
      </main>

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
