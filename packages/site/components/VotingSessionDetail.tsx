"use client";

import { VotingSession } from "../hooks/useFHEMultiSessionVoting";

interface VotingSessionDetailProps {
  session: VotingSession;
  sessionIndex: number;
  hasVoted: boolean;
  isOwner: boolean;
  selectedVoteOption: number | null;
  onSelectVoteOption: (optionIndex: number) => void;
  onConfirmVote: () => void;
  onViewResults: () => void;
  onOpenSession?: () => void;
  onCloseSession?: () => void;
  onMakeTalliesPublic?: () => void;
  onDecryptResults?: () => void;
  results?: any;
  decryptedResults?: number[];
  fheVotingStatus: string;
  votingQuestion: string;
  type: "active" | "upcoming" | "ended";
}

export const VotingSessionDetail = ({
  session,
  sessionIndex,
  hasVoted,
  isOwner,
  selectedVoteOption,
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
  type
}: VotingSessionDetailProps) => {
  // Logic dựa trên phase, không dựa trên thời gian
  const isVotingActive = session.phase === 1;
  const canUserVote = !isOwner && isVotingActive && !hasVoted;

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

  const isEnded = session.phase === 2;

  return (
    <div className="rounded p-6 shadow-sm hover:shadow-md transition-shadow" style={{border: '1px solid #001f1f', backgroundColor: '#001f1f'}}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-4 py-2 rounded text-sm font-medium ${getPhaseColor(session.phase)}`}>
              {getPhaseText(session.phase)}
            </span>
            {hasVoted && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Voted
              </span>
            )}
            <span className="px-4 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300 font-medium">
              {session.candidates.length} options
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Proposal #{sessionIndex + 1}
          </h3>
        </div>
        <div className="text-right text-sm text-gray-300">
          <div className="font-medium text-white">Time Range</div>
          <div>Start: {formatTime(session.startTime)}</div>
          <div>End: {formatTime(session.endTime)}</div>
        </div>
      </div>

      {/* Proposal Title */}
      <div className="mb-4">
        <h4 className="font-medium text-white mb-2">Proposal Title:</h4>
        <div className="px-4 py-3 bg-gray-800 border border-gray-600 rounded">
          <p className="text-white font-medium text-lg">
            {session.title || "FHE Voting System Implementation"}
          </p>
        </div>
      </div>

      {/* Voting Question */}
      <div className="mb-4">
        <h4 className="font-medium text-white mb-2">Voting Question:</h4>
        <div className="px-4 py-3 bg-gray-800 border border-gray-600 rounded">
          <p className="text-white font-medium text-lg">
            "{session.description || "Do you agree to implement the FHE Voting system trial?"}"
          </p>
        </div>
      </div>

      {/* Voting Options */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">Voting Options:</h4>
        <div className="grid grid-cols-3 gap-2 w-full min-w-0">
          {session.candidates.map((candidate, idx) => (
            <button
              key={idx}
              onClick={() => onSelectVoteOption(idx)}
              className={`px-3 py-2 border rounded text-sm transition-colors ${
                selectedVoteOption === idx
                  ? "bg-blue-500 border-blue-400 text-white"
                  : isOwner
                    ? "bg-gray-800 border-gray-600 text-white hover:bg-gray-700 cursor-pointer"
                    : (type === "active" && session.phase === 1 && !hasVoted)
                      ? "bg-gray-800 border-gray-600 text-white hover:bg-gray-700 cursor-pointer"
                      : "bg-gray-800 border-gray-600 text-white opacity-50"
              }`}
              disabled={!canUserVote && !isOwner}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2 ${
                    selectedVoteOption === idx
                      ? "bg-white text-blue-600"
                      : "bg-blue-500 text-white"
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-medium">{candidate}</span>
                </div>
                <div className="flex items-center">
                  {results && decryptedResults ? (
                    <span className="text-xs text-white mr-2 font-bold">
                      {decryptedResults[idx] || 0} votes ({decryptedResults.reduce((sum, v) => sum + v, 0) > 0 ? Math.round(((decryptedResults[idx] || 0) / decryptedResults.reduce((sum, v) => sum + v, 0)) * 100) : 0}%)
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 mr-2">
                      No results
                    </span>
                  )}
                  {selectedVoteOption === idx && (
                    <span className="text-xs text-blue-200">Selected</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>



      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {/* Owner Controls */}
        {isOwner && (
          <>
            {session.phase === 0 && onOpenSession && (
              <button
                onClick={onOpenSession}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 font-medium transition-colors"
                disabled={fheVotingStatus === "loading"}
              >
                Open Session
              </button>
            )}
            {isOwner && onCloseSession && (
              <button
                onClick={onCloseSession}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium transition-colors"
              >
                Close Session
              </button>
            )}
            {session.phase === 2 && onMakeTalliesPublic && (
              <button
                onClick={onMakeTalliesPublic}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 font-medium transition-colors"
                disabled={fheVotingStatus === "loading"}
              >
                Make Results Public
              </button>
            )}
          </>
        )}


        {/* User Actions */}
        <button
          onClick={onViewResults}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium transition-colors"
          disabled={fheVotingStatus === "loading"}
        >
          View Results
        </button>

        {(isOwner || canUserVote) && (
          <button
            onClick={onConfirmVote}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              selectedVoteOption !== null
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
            disabled={selectedVoteOption === null || fheVotingStatus === "loading"}
          >
            {fheVotingStatus === "loading" ? "Processing..." : "Vote Now"}
          </button>
        )}
      </div>
    </div>
  );
};
