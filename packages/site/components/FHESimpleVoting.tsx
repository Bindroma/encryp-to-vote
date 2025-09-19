"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useWagmiEthersSigner } from "../hooks/useWagmiEthersSigner";
import { useFHESimpleVoting } from "@/hooks/useFHESimpleVoting";
import { Toast } from "./Toast";

interface FHESimpleVotingProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const FHESimpleVoting = ({ activeTab, onTabChange }: FHESimpleVotingProps) => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
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
    vote,
    getResults,
    decryptPublicResults,
    candidates,
    results,
    decryptedResults,
    openVoting,
    closeVoting,
    initTallies,
    makeTalliesPublic,
    phase,
    isOwner,
    hasVoted,
    toastMessage,
    toastType,
    setToastMessage,
  } = useFHESimpleVoting({
    fhevmInstance,
    ethersSigner,
    ethersReadonlyProvider,
    chainId,
    fhevmDecryptionSignatureStorage,
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet to continue</h2>
      </div>
    );
  }

  if (fhevmStatus === "error") {
    return <p className="text-red-600">FHEVM Error: {fhevmError}</p>;
  }

  if (fheVotingStatus === "error") {
    return <p className="text-red-600">Voting Error: {fheVotingError}</p>;
  }

  return (
    <div className="w-full">
      {/* Toast Notification */}
      <Toast
        message={toastMessage || ""}
        type={toastType}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage(null)}
      />
      
      {activeTab === "active" && (
          <>
            {/* Active Voting Cards */}
            <div className="mb-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center">
                {/* Card 1 - Zama Mascot Voting */}
                <div className="bg-white shadow-md rounded-[8px] flex flex-col items-center px-5 pt-3 pb-5 w-64 border border-gray-400">
                  <span className="font-bold text-2xl">Zama Mascot</span>
                  <div className="w-52 h-52 rounded-[8px] mt-2 mb-4 overflow-hidden relative border border-gray-400">
                    <img 
                      src="/voting-01.png" 
                      alt="Zama Voting"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => onTabChange("voting")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                  >
                    Join
                  </button>
                </div>

                {/* Card 2 - Empty */}
                <div className="bg-white shadow-md rounded-[8px] flex flex-col items-center px-5 pt-3 pb-5 w-64 border border-gray-400">
                  <span className="font-bold text-2xl text-gray-400">Coming Soon</span>
                  <div className="w-52 h-52 rounded-[8px] mt-2 mb-4 overflow-hidden relative border border-gray-400 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Empty</span>
                  </div>
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded w-full cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>

                {/* Card 3 - Empty */}
                <div className="bg-white shadow-md rounded-[8px] flex flex-col items-center px-5 pt-3 pb-5 w-64 border border-gray-400">
                  <span className="font-bold text-2xl text-gray-400">Coming Soon</span>
                  <div className="w-52 h-52 rounded-[8px] mt-2 mb-4 overflow-hidden relative border border-gray-400 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Empty</span>
                  </div>
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded w-full cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "voting" && (
          <>
            {/* Voting Interface */}
            <div className="mb-4 w-full">
              <div className="relative flex items-center justify-center mb-4">
                <h3 className="text-3xl font-bold text-center">Zama Mascot Voting</h3>
                <button
                  onClick={() => onTabChange("active")}
                  className="absolute right-0 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  ← Back
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center">
                {/* Card 1 */}
                <div className="bg-white shadow-md rounded-[8px] flex flex-col items-center px-5 pt-3 pb-5 w-fit border border-gray-400">
                  <span className="font-bold text-2xl">Zama Fox</span>
                  <div className="w-52 h-52 rounded-[8px] mt-2 mb-4 overflow-hidden relative border border-gray-400">
                    <img 
                      src="/zama-fox.png" 
                      alt="Zama Fox"
                      className="w-full h-full object-cover"
                    />
                    {/* Vote count overlay - chỉ hiện khi có kết quả */}
                    {decryptedResults && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-[6px] w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {decryptedResults[0]}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => vote(0)}
                    disabled={phase !== 1 || fheVotingStatus === "loading" || hasVoted}
                    className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-full"
                  >
                    {hasVoted ? "Already Voted" : "Vote for Zama Fox"}
                  </button>
                </div>

                {/* Card 2 */}
                <div className="bg-white shadow-md rounded-[8px] flex flex-col items-center px-5 pt-3 pb-5 w-fit border border-gray-400">
                  <span className="font-bold text-2xl">Zama Rabit</span>
                  <div className="w-52 h-52 rounded-[8px] mt-2 mb-4 overflow-hidden relative border border-gray-400">
                    <img 
                      src="/zama-rabit.png" 
                      alt="Zama Rabit"
                      className="w-full h-full object-cover"
                    />
                    {/* Vote count overlay - chỉ hiện khi có kết quả */}
                    {decryptedResults && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-[6px] w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {decryptedResults[1]}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => vote(1)}
                    disabled={phase !== 1 || fheVotingStatus === "loading" || hasVoted}
                    className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-full"
                  >
                    {hasVoted ? "Already Voted" : "Vote for Zama Rabit"}
                  </button>
                </div>

                {/* Card 3 */}
                <div className="bg-white shadow-md rounded-[8px] flex flex-col items-center px-5 pt-3 pb-5 w-fit border border-gray-400">
                  <span className="font-bold text-2xl">Zama Bear</span>
                  <div className="w-52 h-52 rounded-[8px] mt-2 mb-4 overflow-hidden relative border border-gray-400">
                    <img 
                      src="/zama-bear.png" 
                      alt="Zama Bear"
                      className="w-full h-full object-cover"
                    />
                    {/* Vote count overlay - chỉ hiện khi có kết quả */}
                    {decryptedResults && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-[6px] w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {decryptedResults[2]}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => vote(2)}
                    disabled={phase !== 1 || fheVotingStatus === "loading" || hasVoted}
                    className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-full"
                  >
                    {hasVoted ? "Already Voted" : "Vote for Zama Bear"}
                  </button>
                </div>
              </div>
            </div>

            {/* Owner Controls */}
            {isOwner && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3 text-center">Owner Controls</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={initTallies}
                    disabled={phase !== 0 || fheVotingStatus === "loading"}
                    className="bg-yellow-500 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-[200px]"
                  >
                    Initialize Tallies
                  </button>

                  <button
                    onClick={openVoting}
                    disabled={phase !== 0 || fheVotingStatus === "loading"}
                    className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-[200px]"
                  >
                    Open Voting
                  </button>

                  <button
                    onClick={closeVoting}
                    disabled={phase !== 1 || fheVotingStatus === "loading"}
                    className="bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-[200px]"
                  >
                    Close Voting
                  </button>

                  <button
                    onClick={makeTalliesPublic}
                    disabled={phase !== 2 || fheVotingStatus === "loading"}
                    className="bg-orange-500 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-[200px]"
                  >
                    Make Tallies Public
                  </button>
                </div>
              </div>
            )}

            {/* Results Section */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button
                onClick={getResults}
                disabled={phase !== 2 || fheVotingStatus === "loading"}
                className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-[200px]"
              >
                Get Results
              </button>

              <button
                onClick={decryptPublicResults}
                disabled={phase !== 2 || fheVotingStatus === "loading" || !results}
                className="bg-purple-500 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-[200px]"
              >
                Decrypt Results
              </button>
            </div>
          </>
        )}

        {activeTab === "end" && (
          <div className="flex flex-col items-center justify-center p-8">
            <h3 className="text-xl font-bold mb-4">Voting Results</h3>
            <p className="text-gray-600">This tab will show the final voting results and statistics.</p>
          </div>
        )}
    </div>
  );
};
