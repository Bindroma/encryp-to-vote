"use client";

import { VotingCard } from "./VotingCard";
import { VotingSessionDetail } from "./VotingSessionDetail";
import { VotingSession } from "../hooks/useFHEMultiSessionVoting";

interface VotingTabsProps {
  activeFilter: "active" | "upcoming" | "ended" | "owner";
  viewMode: "grid" | "vote";
  selectedSessionForVote: number | null;
  sessions: VotingSession[];
  getFilteredSessions: VotingSession[];
  hasVotedMap: Record<number, boolean>;
  isOwner: boolean;
  selectedVoteOption: number | null;
  onTabChange: (tabId: "active" | "upcoming" | "ended" | "owner") => void;
  onVoteClick: (sessionIndex: number) => void;
  onViewDetails: (sessionIndex: number) => void;
  onSelectVoteOption: (optionIndex: number) => void;
  onConfirmVote: () => void;
  onViewResults: (sessionIndex: number) => void;
  onOpenSession: (sessionIndex: number) => void;
  onCloseSession: (sessionIndex: number) => void;
  onMakeTalliesPublic: (sessionIndex: number) => void;
  onDecryptResults: (sessionIndex: number) => void;
  results: any;
  decryptedResults: number[];
  fheVotingStatus: string;
  votingQuestion: string;
  onBackToGrid: () => void;
  showCreateSession: boolean;
  onShowCreateSession: () => void;
}

export const VotingTabs = ({
  activeFilter,
  viewMode,
  selectedSessionForVote,
  sessions,
  getFilteredSessions,
  hasVotedMap,
  isOwner,
  selectedVoteOption,
  onTabChange,
  onVoteClick,
  onViewDetails,
  onSelectVoteOption,
  onConfirmVote,
  onViewResults,
  onOpenSession,
  onCloseSession,
  onMakeTalliesPublic,
  onDecryptResults,
  results,
  decryptedResults,
  fheVotingStatus,
  votingQuestion,
  onBackToGrid,
  showCreateSession,
  onShowCreateSession
}: VotingTabsProps) => {
  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 0: return "bg-yellow-100 text-yellow-800";
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPhaseText = (phase: number) => {
    switch (phase) {
      case 0: return "Setup";
      case 1: return "Open";
      case 2: return "Closed";
      default: return "Unknown";
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };


  return (
    <>
      {/* Filter Tabs */}
      <div className="mb-6 mt-0">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {[
              { id: "active", label: "Active" },
              { id: "upcoming", label: "Upcoming" },
              { id: "ended", label: "Ended" },
              ...(isOwner ? [{ id: "owner", label: "Owner" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as "active" | "upcoming" | "ended" | "owner")}
                className={`group relative px-4 py-2 rounded text-sm font-bold transition-all duration-200 ${
                  activeFilter === tab.id
                    ? "primary-accent"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="font-semibold">
                  {tab.label}
                </div>
              </button>
            ))}
          </div>
          
          {/* Back to Grid Button - Show in Active, Upcoming and Ended tab vote view */}
          {(activeFilter === "active" || activeFilter === "upcoming" || activeFilter === "ended") && viewMode === "vote" && (
            <button
              onClick={onBackToGrid}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              ← Back to Grid
            </button>
          )}
        </div>
      </div>

      {/* Active Tab - Grid View */}
      {activeFilter === "active" && viewMode === "grid" && (
        <div className="mb-4">
          {getFilteredSessions.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-gray-500 text-lg">No active voting sessions</p>
              <p className="text-gray-400 mt-2">Sessions will appear here when voting is open</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getFilteredSessions.map((session, filteredIndex) => {
                const originalIndex = sessions.findIndex(s => s === session);
                return (
                  <VotingCard
                    key={originalIndex}
                    session={session}
                    sessionIndex={originalIndex}
                    hasVoted={hasVotedMap[originalIndex] || false}
                    onVoteClick={onVoteClick}
                    type="active"
                    votingQuestion={votingQuestion}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Tab - Vote View */}
      {activeFilter === "active" && viewMode === "vote" && selectedSessionForVote !== null && (
        <div className="mb-4">
          <div className="w-full">
            <VotingSessionDetail
              session={sessions[selectedSessionForVote]}
              sessionIndex={selectedSessionForVote}
              hasVoted={hasVotedMap[selectedSessionForVote] || false}
              isOwner={isOwner}
              selectedVoteOption={selectedVoteOption}
              onSelectVoteOption={onSelectVoteOption}
              onConfirmVote={onConfirmVote}
              onViewResults={() => onViewResults(selectedSessionForVote)}
              onOpenSession={() => onOpenSession(selectedSessionForVote)}
              onCloseSession={() => onCloseSession(selectedSessionForVote)}
              onMakeTalliesPublic={() => onMakeTalliesPublic(selectedSessionForVote)}
              onDecryptResults={() => onDecryptResults(selectedSessionForVote)}
              results={results}
              decryptedResults={decryptedResults}
              fheVotingStatus={fheVotingStatus}
              votingQuestion={votingQuestion}
              type="active"
            />
          </div>
        </div>
      )}

      {/* Upcoming Tab - Grid View */}
      {activeFilter === "upcoming" && viewMode === "grid" && (
        <div className="mb-4">
          {getFilteredSessions.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🕒</div>
              <p className="text-gray-500 text-lg">No upcoming voting sessions</p>
              <p className="text-gray-400 mt-2">Scheduled sessions will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getFilteredSessions.map((session, filteredIndex) => {
                const originalIndex = sessions.findIndex(s => s === session);
                return (
                  <VotingCard
                    key={originalIndex}
                    session={session}
                    sessionIndex={originalIndex}
                    hasVoted={hasVotedMap[originalIndex] || false}
                    onViewDetails={onViewDetails}
                    type="upcoming"
                    votingQuestion={votingQuestion}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Tab - Vote View */}
      {activeFilter === "upcoming" && viewMode === "vote" && selectedSessionForVote !== null && (
        <div className="mb-4">
          <div className="w-full">
            <VotingSessionDetail
              session={sessions[selectedSessionForVote]}
              sessionIndex={selectedSessionForVote}
              hasVoted={hasVotedMap[selectedSessionForVote] || false}
              isOwner={isOwner}
              selectedVoteOption={selectedVoteOption}
              onSelectVoteOption={onSelectVoteOption}
              onConfirmVote={onConfirmVote}
              onViewResults={() => onViewResults(selectedSessionForVote)}
              onOpenSession={() => onOpenSession(selectedSessionForVote)}
              onCloseSession={() => onCloseSession(selectedSessionForVote)}
              onMakeTalliesPublic={() => onMakeTalliesPublic(selectedSessionForVote)}
              onDecryptResults={() => onDecryptResults(selectedSessionForVote)}
              results={results}
              decryptedResults={decryptedResults}
              fheVotingStatus={fheVotingStatus}
              votingQuestion={votingQuestion}
              type="upcoming"
            />
          </div>
        </div>
      )}

      {/* Ended Tab - Grid View */}
      {activeFilter === "ended" && viewMode === "grid" && (
        <div className="mb-4">
          {getFilteredSessions.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🏁</div>
              <p className="text-gray-500 text-lg">No ended voting sessions</p>
              <p className="text-gray-400 mt-2">Completed sessions will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getFilteredSessions.map((session, filteredIndex) => {
                const originalIndex = sessions.findIndex(s => s === session);
                return (
                  <VotingCard
                    key={originalIndex}
                    session={session}
                    sessionIndex={originalIndex}
                    hasVoted={hasVotedMap[originalIndex] || false}
                    onVoteClick={onVoteClick}
                    type="ended"
                    votingQuestion={votingQuestion}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ended Tab - Vote View */}
      {activeFilter === "ended" && viewMode === "vote" && selectedSessionForVote !== null && (
        <div className="w-full">
          <VotingSessionDetail
            session={sessions[selectedSessionForVote]}
            sessionIndex={selectedSessionForVote}
            hasVoted={hasVotedMap[selectedSessionForVote] || false}
            isOwner={isOwner}
            selectedVoteOption={selectedVoteOption}
            onSelectVoteOption={onSelectVoteOption}
            onConfirmVote={onConfirmVote}
            onViewResults={() => onViewResults(selectedSessionForVote)}
            onOpenSession={() => onOpenSession(selectedSessionForVote)}
            onCloseSession={() => onCloseSession(selectedSessionForVote)}
            onMakeTalliesPublic={() => onMakeTalliesPublic(selectedSessionForVote)}
            onDecryptResults={() => onDecryptResults(selectedSessionForVote)}
            results={results}
            decryptedResults={decryptedResults}
            fheVotingStatus={fheVotingStatus}
            votingQuestion={votingQuestion}
            type="ended"
          />
        </div>
      )}

      {/* Owner Tab - Owner Controls */}
      {activeFilter === "owner" && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={onShowCreateSession}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium transition-colors"
            >
              Create New Session
            </button>
            <h2 className="text-2xl font-bold text-white">Owner Controls</h2>
          </div>
          
          {!isOwner ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">👑</div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Owner Access Required</h2>
              <p className="text-gray-600">Only the contract owner can access these controls.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Owner Tab - All Sessions Grid */}
      {activeFilter === "owner" && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-4">All Voting Sessions</h3>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg">No voting sessions created yet</p>
              <p className="text-gray-400 mt-2">Create your first session using the button above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sessions.map((session, index) => (
                <VotingCard
                  key={index}
                  session={session}
                  sessionIndex={index}
                  hasVoted={hasVotedMap[index] || false}
                  onVoteClick={onVoteClick}
                  type="owner"
                  votingQuestion={votingQuestion}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </>
  );
};
