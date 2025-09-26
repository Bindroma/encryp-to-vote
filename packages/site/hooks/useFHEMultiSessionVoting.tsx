"use client";
import { useCallback, useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { MultiSessionFHEVotingABI } from "../abi/MultiSessionFHEVotingABI";
import { MultiSessionFHEVotingAddresses } from "../abi/MultiSessionFHEVotingAddresses";

type Status = "idle" | "loading" | "success" | "error";

interface UseFHEMultiSessionVotingProps {
  fhevmInstance: any;
  ethersSigner: ethers.Signer | null;
  ethersReadonlyProvider: ethers.Provider | null;
  chainId: number;
  fhevmDecryptionSignatureStorage: any;
}

export interface VotingSession {
  title: string;
  description: string;
  creator: string;
  candidates: string[];
  voteCount: number;
  startTime: number;
  endTime: number;
  phase: number; // 0: Setup, 1: Open, 2: Closed
}

export const useFHEMultiSessionVoting = ({
  fhevmInstance,
  ethersSigner,
  ethersReadonlyProvider,
  chainId,
  fhevmDecryptionSignatureStorage,
}: UseFHEMultiSessionVotingProps) => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<VotingSession[]>([]);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [owner, setOwner] = useState<string>("");
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const [results, setResults] = useState<string[] | null>(null);
  const [decryptedResults, setDecryptedResults] = useState<number[] | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [hasVotedMap, setHasVotedMap] = useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("error");

  const contractAddress =
    chainId ? MultiSessionFHEVotingAddresses[chainId.toString() as keyof typeof MultiSessionFHEVotingAddresses]?.address : undefined;


  const contract = useMemo(() => {
    if (!contractAddress || !ethersReadonlyProvider) return null;
    return new ethers.Contract(contractAddress, MultiSessionFHEVotingABI.abi, ethersReadonlyProvider);
  }, [contractAddress, ethersReadonlyProvider]);

  const contractWithSigner = useMemo(() => {
    if (!contractAddress || !ethersSigner) return null;
    return new ethers.Contract(contractAddress, MultiSessionFHEVotingABI.abi, ethersSigner);
  }, [contractAddress, ethersSigner]);

  const refreshSessions = useCallback(async () => {
    if (!contract) return;
    
    try {
      const count = await contract.sessionCount();
      setSessionCount(Number(count));
      
      const sessionsData: VotingSession[] = [];
      for (let i = 0; i < Number(count); i++) {
        const sessionData = await contract.getSession(i);
        const voteCount = await contract.getVoteCount(i);
        sessionsData.push({
          title: sessionData[0],
          description: sessionData[1],
          candidates: sessionData[2],
          startTime: Number(sessionData[3]),
          endTime: Number(sessionData[4]),
          phase: Number(sessionData[5]),
          creator: sessionData[6],
          voteCount: Number(voteCount)
        });
      }
      setSessions(sessionsData);
      
    } catch (e) {
      console.error("Failed to refresh sessions:", e);
    }
  }, [contract, selectedSessionId]);

  const refreshOwner = useCallback(async () => {
    if (!contract || !ethersSigner) return;
    try {
      const o = await contract.owner();
      setOwner(String(o).toLowerCase());
      const me = (await ethersSigner.getAddress())?.toLowerCase();
      setIsOwner(!!me && me === String(o).toLowerCase());
    } catch (e) {
      console.error("Failed to refresh owner:", e);
    }
  }, [contract, ethersSigner]);

  // Refresh hasVoted status for current user
  const refreshHasVoted = useCallback(async (sessionId: number) => {
    if (!contract || !ethersSigner) return;
    try {
      const userAddress = await ethersSigner.getAddress();
      const hasVotedStatus = await contract.hasUserVoted(sessionId, userAddress);
      setHasVotedMap(prev => ({ ...prev, [sessionId]: hasVotedStatus }));
    } catch (e) {
      console.error("Failed to refresh has voted:", e);
    }
  }, [contract, ethersSigner]);

  // Load all votes when sessions are loaded
  const loadAllVotes = useCallback(async () => {
    if (!contract || !ethersSigner || sessions.length === 0) return;
    try {
      const userAddress = await ethersSigner.getAddress();
      const votesMap: Record<number, boolean> = {};
      
      for (let i = 0; i < sessions.length; i++) {
        const hasVotedStatus = await contract.hasUserVoted(i, userAddress);
        votesMap[i] = hasVotedStatus;
      }
      
      setHasVotedMap(votesMap);
    } catch (e) {
      console.error("Failed to load all votes:", e);
    }
  }, [contract, ethersSigner, sessions]);

  // Auto-refresh sessions when contract is ready
  useEffect(() => {
    if (contract) {
      refreshSessions();
      refreshOwner();
    }
  }, [contract, refreshSessions, refreshOwner]);

  // Load votes when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      loadAllVotes();
    }
  }, [sessions, loadAllVotes]);

  // Auto-refresh hasVoted when selectedSessionId changes
  useEffect(() => {
    if (contract && ethersSigner && selectedSessionId !== null) {
      refreshHasVoted(selectedSessionId);
    }
  }, [contract, ethersSigner, selectedSessionId, refreshHasVoted]);

  // Create new session
  const createSession = useCallback(async (title: string, description: string, candidates: string[], startTime: number, endTime: number) => {
    if (!contractWithSigner) return;
    
    setStatus("loading");
    setError(null);
    
    try {
      const tx = await contractWithSigner.createSession(title, description, candidates, startTime, endTime);
      setLastTx(tx.hash);
      await tx.wait();
      
      await refreshSessions();
      setStatus("success");
      setToastMessage("Session created successfully!");
      setToastType("success");
    } catch (e: any) {
      console.error("Create session failed:", e);
      setError(e.message || "Failed to create session");
      setStatus("error");
      setToastMessage("Failed to create session");
      setToastType("error");
    }
  }, [contractWithSigner, refreshSessions]);

  // Open session
  const openSession = useCallback(async (sessionId: number) => {
    if (!contractWithSigner) return;
    
    setStatus("loading");
    setError(null);
    
    try {
      const tx = await contractWithSigner.open(sessionId);
      setLastTx(tx.hash);
      await tx.wait();
      
      await refreshSessions();
      setStatus("success");
      setToastMessage("Session opened successfully!");
      setToastType("success");
    } catch (e: any) {
      console.error("Open session failed:", e);
      setError(e.message || "Failed to open session");
      setStatus("error");
      setToastMessage("Failed to open session");
      setToastType("error");
    }
  }, [contractWithSigner, refreshSessions]);

  // Close session
  const closeSession = useCallback(async (sessionId: number) => {
    if (!contractWithSigner) return;
    
    setStatus("loading");
    setError(null);
    
    try {
      const tx = await contractWithSigner.close(sessionId);
      setLastTx(tx.hash);
      await tx.wait();
      
      await refreshSessions();
      setStatus("success");
      setToastMessage("Session closed successfully!");
      setToastType("success");
    } catch (e: any) {
      console.error("Close session failed:", e);
      setError(e.message || "Failed to close session");
      setStatus("error");
      setToastMessage("Failed to close session");
      setToastType("error");
    }
  }, [contractWithSigner, refreshSessions]);

  // Make tallies public
  const makeTalliesPublic = useCallback(async (sessionId: number) => {
    if (!contractWithSigner) return;
    
    setStatus("loading");
    setError(null);
    
    try {
      const tx = await contractWithSigner.makeTalliesPublic(sessionId);
      setLastTx(tx.hash);
      await tx.wait();
      
      setStatus("success");
      setToastMessage("Tallies made public successfully!");
      setToastType("success");
    } catch (e: any) {
      console.error("Make tallies public failed:", e);
      setError(e.message || "Failed to make tallies public");
      setStatus("error");
      setToastMessage("Failed to make tallies public");
      setToastType("error");
    }
  }, [contractWithSigner]);

  // Vote
  const vote = useCallback(async (sessionId: number, candidateIndex: number) => {
    if (!contractWithSigner || !fhevmInstance || !contractAddress) return;

    if (hasVotedMap[sessionId]) {
      setToastMessage("You have already voted in this session!");
      setToastType("warning");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      if (!ethersSigner) {
        setError("Wallet not connected");
        setStatus("error");
        return;
      }
      
      const caller = await ethersSigner.getAddress();
      const input = fhevmInstance.createEncryptedInput(contractAddress, caller);
      input.add8(candidateIndex);
      const enc = await input.encrypt();
      
      const tx = await contractWithSigner.submitVote(sessionId, enc.handles[0], enc.inputProof);
      setLastTx(tx.hash);
      await tx.wait();

      setHasVotedMap(prev => ({ ...prev, [sessionId]: true }));
      setStatus("success");
      
      // Get candidate name for better feedback
      const session = sessions[sessionId];
      const candidateName = session?.candidates[candidateIndex] || `Option ${candidateIndex + 1}`;
      setToastMessage(`Vote submitted successfully! You voted for: ${candidateName}`);
      setToastType("success");
      
    } catch (e: any) {
      console.error("Vote failed:", e);
      if (e.message?.includes("missing revert data") || e.message?.includes("CALL_EXCEPTION")) {
        setToastMessage("You have already voted! Each address can only vote once per session.");
        setToastType("warning");
        setHasVoted(true);
      } else if (e.message?.includes("not in time")) {
        setToastMessage("Voting period has ended or not started yet.");
        setToastType("warning");
      } else if (e.message?.includes("not open")) {
        setToastMessage("This session is not open for voting.");
        setToastType("warning");
      } else {
        setError(e.message || "Vote failed");
        setStatus("error");
        setToastMessage("Vote failed. Please try again.");
        setToastType("error");
      }
    }
  }, [contractWithSigner, fhevmInstance, contractAddress, ethersSigner, hasVotedMap, sessions]);

  // Get results for a session
  const getResults = useCallback(async (sessionId: number) => {
    // console.log("getResults called with sessionId:", sessionId);
    // console.log("contract:", contract);
    // console.log("fhevmInstance:", fhevmInstance);
    
    if (!contract || !fhevmInstance) {
      // console.log("Missing contract or fhevmInstance");
      setToastMessage("Contract or FHEVM not initialized");
      setToastType("error");
      return;
    }
    
    try {
      const session = sessions[sessionId];
      if (!session) {
        // console.log("Session not found:", sessionId);
        setToastMessage("Session not found");
        setToastType("error");
        return;
      }
      
      // console.log("Getting results for session:", sessionId, "with", session.candidates.length, "candidates");
      
      const candidateCount = session.candidates.length;
      const encryptedTallies: string[] = [];
      
      for (let i = 0; i < candidateCount; i++) {
        // console.log("Getting tally for candidate", i);
        try {
          const tally = await contract.getEncryptedTally(sessionId, i);
          // console.log("Tally for candidate", i, ":", tally);
          encryptedTallies.push(tally); // tally is bytes32, will be converted to string
        } catch (tallyError) {
          console.error("Error getting tally for candidate", i, ":", tallyError);
          throw tallyError;
        }
      }
      
      // console.log("All encrypted tallies:", encryptedTallies);
      setResults(encryptedTallies);
      
      // Tự động decrypt sau khi có results
      await decryptPublicResults(sessionId);
      
      setToastMessage("Results loaded successfully");
      setToastType("success");
    } catch (e) {
      console.error("Failed to get results:", e);
      setToastMessage("Failed to get results: " + (e as Error).message);
      setToastType("error");
    }
  }, [contract, fhevmInstance, sessions, setToastMessage, setToastType]);

  // Decrypt public results using publicDecrypt (anyone can decrypt after makeTalliesPublic)
  const decryptPublicResults = useCallback(async (sessionId: number) => {
    if (!fhevmInstance || !results) {
      // console.log("Missing fhevmInstance or results");
      return;
    }
    
    // Check if session is closed (phase 2)
    const session = sessions[sessionId];
    if (!session || session.phase !== 2) {
      setToastMessage("Session must be closed and made public before decrypting results");
      setToastType("warning");
      return;
    }
    
    try {
      // console.log("Decrypting public results for session:", sessionId);
      const decrypted: number[] = [];
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        // console.log(`Decrypting tally ${i}:`, result);
        
        // Thử nhiều cách gọi khác nhau
        let vals: any;
        try {
          // Cách 1: Array of strings
          vals = await fhevmInstance.publicDecrypt([result]);
        } catch (e1) {
          // console.log("Method 1 failed, trying method 2:", e1);
          try {
            // Cách 2: Array of objects
            vals = await fhevmInstance.publicDecrypt([{ handle: result }]);
          } catch (e2) {
            // console.log("Method 2 failed, trying method 3:", e2);
            // Cách 3: Single string
            vals = await fhevmInstance.publicDecrypt(result);
          }
        }
        
        // console.log("Decrypt raw:", vals);
        
        // Xử lý kết quả linh hoạt
        let parsed: number;
        if (Array.isArray(vals)) {
          // Nếu vals là array
          parsed = Number(vals[0] || vals);
        } else if (typeof vals === 'object' && vals !== null) {
          // Nếu vals là object, tìm value đầu tiên
          const firstValue = Object.values(vals)[0];
          parsed = Number(firstValue);
        } else {
          // Nếu vals là primitive
          parsed = Number(vals);
        }
        
        // console.log(`Decrypted value for candidate ${i}:`, parsed);
        decrypted.push(parsed);
      }
      
      // console.log("All decrypted results:", decrypted);
      setDecryptedResults(decrypted);
      setToastMessage("Results decrypted successfully!");
      setToastType("success");
    } catch (e) {
      console.error("Failed to decrypt public results:", e);
      setToastMessage("Failed to decrypt results: " + (e as Error).message);
      setToastType("error");
    }
  }, [fhevmInstance, results, sessions, setToastMessage, setToastType]);

  // Auto-refresh data
  useEffect(() => {
    if (contract) {
      refreshSessions();
      refreshOwner();
    }
  }, [contract, refreshSessions, refreshOwner]);

  // Check if user has voted for a specific session
  const checkHasVoted = useCallback(async (sessionId: number, userAddress: string) => {
    if (!contract) return false;
    try {
      const hasVoted = await contract.hasUserVoted(sessionId, userAddress);
      return hasVoted;
    } catch (e) {
      console.error("Failed to check has voted:", e);
      return false;
    }
  }, [contract]);

  return {
    // State
    status,
    error,
    sessions,
    sessionCount,
    selectedSessionId,
    setSelectedSessionId,
    owner,
    isOwner,
    results,
    decryptedResults,
    lastTx,
    hasVotedMap,
    toastMessage,
    toastType,
    setToastMessage,
    
    // Actions
    createSession,
    openSession,
    closeSession,
    makeTalliesPublic,
    vote,
    getResults,
    decryptPublicResults,
    refreshSessions,
    checkHasVoted,
    refreshHasVoted,
  };
};
