"use client";

import { ethers } from "ethers";
import { useEffect, useState, useLayoutEffect } from "react";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useWagmiEthersSigner } from "../hooks/useWagmiEthersSigner";
import { useFHEMultiSessionVoting } from "../hooks/useFHEMultiSessionVoting";
import { Toast } from "./Toast";
import { CreateSessionModal } from "./CreateSessionModal";
import { VotingTabs } from "./VotingTabs";

export const FHEVoting = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [votingQuestion, setVotingQuestion] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"active" | "upcoming" | "ended" | "owner">("active");
  
  // New state for grid/vote view management
  const [viewMode, setViewMode] = useState<"grid" | "vote">("grid");
  const [selectedSessionForVote, setSelectedSessionForVote] = useState<number | null>(null);
  const [selectedVoteOption, setSelectedVoteOption] = useState<number | null>(null);
  
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    provider,
    chainId,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
  } = useWagmiEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    enabled: true,
  });

  const {
    status: fheVotingStatus,
    error: fheVotingError,
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    results,
    decryptedResults,
    hasVotedMap,
    isOwner,
    lastTx,
    toastMessage,
    toastType,
    setToastMessage,
    createSession,
    openSession,
    closeSession,
    makeTalliesPublic,
    vote,
    getResults,
    decryptPublicResults,
    refreshSessions,
  } = useFHEMultiSessionVoting({
    fhevmInstance,
    fhevmStatus,
    ethersSigner,
    ethersReadonlyProvider,
    chainId,
    fhevmDecryptionSignatureStorage,
  });

  // Tránh hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
        <p className="text-gray-600">You need to connect your wallet to use Multi-Session FHE Voting</p>
      </div>
    );
  }

  if (fhevmStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Initializing FHEVM...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (fhevmStatus === "error" || fhevmError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-red-600">FHEVM Error</h2>
        <p className="text-red-600 mb-4">{fhevmError?.message || "Failed to initialize FHEVM"}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getPhaseText = (phase: number) => {
    switch (phase) {
      case 0: return "Setup";
      case 1: return "Open";
      case 2: return "Closed";
      default: return "Unknown";
    }
  };

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 0: return "bg-yellow-100 text-yellow-800";
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };


  // Filter sessions based on active filter
  const getFilteredSessions = sessions.filter((session, index) => {
    const now = Math.floor(Date.now() / 1000);
    const isUpcoming = now < session.startTime; // Chưa đến giờ bắt đầu
    const isActive = now >= session.startTime && now <= session.endTime; // Đang trong thời gian vote
    const isEnded = now > session.endTime; // Đã hết thời gian vote
    
    switch (activeFilter) {
      case "upcoming": return isUpcoming;
      case "active": return isActive;
      case "ended": return isEnded;
      case "owner": return true; // Show all sessions for owner view
      default: return true;
    }
  });

  // Handle vote click - switch to vote view
  const handleVoteClick = (sessionIndex: number) => {
    setSelectedSessionForVote(sessionIndex);
    setViewMode("vote");
    setSelectedVoteOption(null);
  };

  // Handle view details click for upcoming sessions
  const handleViewDetails = (sessionIndex: number) => {
    setSelectedSessionForVote(sessionIndex);
    setViewMode("vote");
  };

  // Handle vote option selection
  const handleSelectVoteOption = (optionIndex: number) => {
    setSelectedVoteOption(optionIndex);
  };

  // Handle confirm vote
  const handleConfirmVote = () => {
    if (selectedSessionForVote !== null && selectedVoteOption !== null) {
      vote(selectedSessionForVote, selectedVoteOption);
    }
  };

  // Handle back to grid
  const handleBackToGrid = () => {
    setViewMode("grid");
    setSelectedSessionForVote(null);
    setSelectedVoteOption(null);
  };

  // Reset view mode when switching tabs
  const handleTabChange = (tabId: "active" | "upcoming" | "ended" | "owner") => {
    setActiveFilter(tabId);
    if (tabId !== "active" && tabId !== "upcoming" && tabId !== "ended") {
      setViewMode("grid");
      setSelectedSessionForVote(null);
      setSelectedVoteOption(null);
    }
  };

  const handleCreateSession = async (title: string, question: string, startTimeStr: string, endTimeStr: string) => {
    // Parse datetime strings to Unix timestamps
    const startTimeUnix = Math.floor(new Date(startTimeStr).getTime() / 1000);
    const endTimeUnix = Math.floor(new Date(endTimeStr).getTime() / 1000);
    
    // Fixed voting options for FHE Voting
    const candidates = ["Yes", "No", "Abstain"];
    
    // Debug log
    // console.log("Creating session with:", {
    //   question,
    //   candidates,
    //   startTimeUnix,
    //   endTimeUnix,
    //   startTimeStr,
    //   endTimeStr
    // });
    
    await createSession(
      title,
      question,
      candidates,
      startTimeUnix,
      endTimeUnix
    );
    
    setShowCreateSession(false);
    setVotingQuestion("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <>
      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={showCreateSession}
        onClose={() => setShowCreateSession(false)}
        onCreateSession={handleCreateSession}
        isCreating={fheVotingStatus === "loading"}
      />

      {/* Tab Navigation - Always show */}
      <VotingTabs
        activeFilter={activeFilter}
        viewMode={viewMode}
        selectedSessionForVote={selectedSessionForVote}
        sessions={sessions}
        getFilteredSessions={getFilteredSessions}
        hasVotedMap={hasVotedMap}
        isOwner={isOwner}
        selectedVoteOption={selectedVoteOption}
        onTabChange={handleTabChange}
        onVoteClick={handleVoteClick}
        onViewDetails={handleViewDetails}
        onSelectVoteOption={handleSelectVoteOption}
        onConfirmVote={handleConfirmVote}
        onViewResults={(sessionIndex) => {
          setSelectedSessionId(sessionIndex);
          getResults(sessionIndex);
        }}
        onOpenSession={openSession}
        onCloseSession={closeSession}
        onMakeTalliesPublic={makeTalliesPublic}
        onDecryptResults={decryptPublicResults}
        results={results}
        decryptedResults={decryptedResults}
        fheVotingStatus={fheVotingStatus}
        votingQuestion={votingQuestion}
        onBackToGrid={handleBackToGrid}
        showCreateSession={showCreateSession}
        onShowCreateSession={() => setShowCreateSession(true)}
      />

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={!!toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
};
