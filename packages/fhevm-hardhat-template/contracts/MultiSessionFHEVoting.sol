// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint8, euint32, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MultiSessionFHEVoting is SepoliaConfig {
    using FHE for *;

    address public owner;

    enum Phase { Setup, Open, Closed }

    struct VotingSession {
        string title;
        string description;
        address creator;
        string[] candidates;
        mapping(uint256 => euint32) tally;
        mapping(address => bool) hasVoted;
        uint256 voteCount;
        uint256 startTime;
        uint256 endTime;
        Phase phase;
    }

    uint256 public sessionCount;
    mapping(uint256 => VotingSession) private sessions;

    event SessionCreated(uint256 indexed sessionId, uint256 startTime, uint256 endTime, address creator);
    event Opened(uint256 indexed sessionId);
    event Closed(uint256 indexed sessionId);
    event VoteSubmitted(uint256 indexed sessionId, address indexed voter);
    event TalliesPublic(uint256 indexed sessionId);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier validSession(uint256 sessionId) {
        require(sessionId < sessionCount, "invalid session");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createSession(
        string memory title,
        string memory description,
        string[] memory candidates,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner {
        require(candidates.length > 0 && candidates.length <= 255, "1..255 candidates");
        require(startTime < endTime, "bad time range");

        uint256 id = sessionCount++;
        VotingSession storage s = sessions[id];
        s.title = title;
        s.description = description;
        s.creator = msg.sender;
        s.candidates = candidates;
        s.startTime = startTime;
        s.endTime = endTime;
        s.phase = Phase.Setup;

        for (uint256 i = 0; i < candidates.length; i++) {
            s.tally[i] = FHE.asEuint32(0);
            FHE.allow(s.tally[i], address(this));
        }

        emit SessionCreated(id, startTime, endTime, msg.sender);
    }

    function open(uint256 sessionId) external onlyOwner validSession(sessionId) {
        VotingSession storage s = sessions[sessionId];
        require(s.phase == Phase.Setup, "bad phase");
        s.phase = Phase.Open;
        emit Opened(sessionId);
    }

    function close(uint256 sessionId) public onlyOwner validSession(sessionId) {
        VotingSession storage s = sessions[sessionId];
        require(s.phase == Phase.Open, "bad phase");
        s.phase = Phase.Closed;
        emit Closed(sessionId);
    }

    function submitVote(
        uint256 sessionId,
        externalEuint8 choice,
        bytes calldata attestation
    ) external validSession(sessionId) {
        VotingSession storage s = sessions[sessionId];
        require(s.phase == Phase.Open, "not open");
        require(block.timestamp >= s.startTime && block.timestamp <= s.endTime, "not in time");
        require(!s.hasVoted[msg.sender], "already voted");
        s.hasVoted[msg.sender] = true;
        s.voteCount += 1;

        euint8 v = FHE.fromExternal(choice, attestation);
        uint256 n = s.candidates.length;
        ebool inRange = FHE.lt(v, FHE.asEuint8(uint8(n)));
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);

        for (uint256 i = 0; i < n; i++) {
            ebool isI = FHE.eq(v, FHE.asEuint8(uint8(i)));
            ebool shouldCount = FHE.and(inRange, isI);
            euint32 inc = FHE.select(shouldCount, one, zero);

            s.tally[i] = FHE.add(s.tally[i], inc);
            FHE.allow(s.tally[i], address(this));
        }

        emit VoteSubmitted(sessionId, msg.sender);
    }

    function getEncryptedTally(uint256 sessionId, uint256 i)
        external
        view
        validSession(sessionId)
        returns (bytes32)
    {
        VotingSession storage s = sessions[sessionId];
        require(i < s.candidates.length, "bad index");
        return FHE.toBytes32(s.tally[i]);
    }

    function makeTalliesPublic(uint256 sessionId)
        external
        onlyOwner
        validSession(sessionId)
    {
        VotingSession storage s = sessions[sessionId];
        require(s.phase == Phase.Closed, "not closed");

        for (uint256 i = 0; i < s.candidates.length; i++) {
            FHE.makePubliclyDecryptable(s.tally[i]);
        }
        emit TalliesPublic(sessionId);
    }

    function candidateCount(uint256 sessionId)
        external
        view
        validSession(sessionId)
        returns (uint256)
    {
        return sessions[sessionId].candidates.length;
    }

    function getSession(uint256 sessionId)
        external
        view
        validSession(sessionId)
        returns (
            string memory title,
            string memory description,
            string[] memory candidates,
            uint256 startTime,
            uint256 endTime,
            Phase phase,
            address creator
        )
    {
        VotingSession storage s = sessions[sessionId];
        return (s.title, s.description, s.candidates, s.startTime, s.endTime, s.phase, s.creator);
    }

    function hasUserVoted(uint256 sessionId, address user)
        external
        view
        validSession(sessionId)
        returns (bool)
    {
        return sessions[sessionId].hasVoted[user];
    }

    function getVoteCount(uint256 sessionId)
        external
        view
        validSession(sessionId)
        returns (uint256)
    {
        return sessions[sessionId].voteCount;
    }
}
