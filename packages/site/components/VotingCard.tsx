"use client";

import { VotingSession } from "../hooks/useFHEMultiSessionVoting";

interface VotingCardProps {
  session: VotingSession;
  sessionIndex: number;
  hasVoted: boolean;
  onVoteClick: (sessionIndex: number) => void;
  onViewDetails?: (sessionIndex: number) => void;
  type: "active" | "upcoming" | "ended";
  votingQuestion: string;
}

export const VotingCard = ({
  session,
  sessionIndex,
  hasVoted,
  onVoteClick,
  onViewDetails,
  type,
  votingQuestion
}: VotingCardProps) => {
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

  const getTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    
    if (remaining <= 0) return "Ended";
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStartsIn = (startTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = startTime - now;
    
    if (remaining <= 0) return "Started";
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  };

  const timeRemaining = getTimeRemaining(session.endTime);
  const startsIn = getStartsIn(session.startTime);
  const isEnded = timeRemaining === "Ended";

  return (
    <div className="bg-gray-800 border border-gray-600 rounded p-4 hover:bg-gray-700 transition-colors h-[240px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPhaseColor(session.phase)}`}>
            {getPhaseText(session.phase)}
          </span>
          {hasVoted && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              📝  ✓
            </span>
          )}
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
            👤 {session.voteCount || 0}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-white">Proposal #{sessionIndex + 1}</div>
        </div>
      </div>

      {/* Content - flex grow để chiếm không gian */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Proposal Title */}
        <div className="mb-3">
          <p className="text-xs text-gray-300 line-clamp-3">
            <span className="text-xs font-medium text-white">Proposal Title: </span>
            <span className="text-sm text-gray-300">
              {(session.title || "FHE Voting System Implementation").length > 75 
                ? `${(session.title || "FHE Voting System Implementation").substring(0, 75)}...`
                : (session.title || "FHE Voting System Implementation")
              }
            </span>
          </p>
        </div>

        {/* Time Info - đẩy xuống dưới */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">
              {type === "upcoming" ? "Starts In:" : "Time Remaining:"}
            </span>
            <span className={`font-medium ${
              type === "upcoming" 
                ? "text-blue-400" 
                : isEnded ? "text-red-400" : "text-green-400"
            }`}>
              {type === "upcoming" ? startsIn : timeRemaining}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-gray-400">Options:</span>
            <span className="text-white">{session.candidates.length}</span>
          </div>
        </div>
      </div>

      {/* Action Button - ở dưới cùng */}
      <button
        onClick={() => type === "upcoming" ? onViewDetails?.(sessionIndex) : onVoteClick(sessionIndex)}
        className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
          type === "upcoming" 
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : type === "ended"
            ? "bg-purple-500 text-white hover:bg-purple-600"
            : (session.phase === 1 || Date.now() / 1000 >= session.startTime) && !hasVoted
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-500 text-gray-300 cursor-not-allowed"
        }`}
        disabled={
          type === "active" && (hasVoted || (session.phase !== 1 && Date.now() / 1000 < session.startTime))
        }
      >
        {type === "upcoming" 
          ? "View Details" 
          : type === "ended"
          ? "View Results"
          : "Vote Now"
        }
      </button>
    </div>
  );
};
