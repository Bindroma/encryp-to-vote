// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint8, euint32, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SimpleFHEVoting is SepoliaConfig {
    using FHE for *;

    address public owner;
    enum Phase { Setup, Open, Closed }
    Phase public phase;

    string[] public candidates;
    mapping(uint256 => euint32) private tally;
    mapping(address => bool) public hasVoted;

    event Opened();
    event Closed();
    event VoteSubmitted(address indexed voter, uint8 candidateIndex);
    event TalliesPublic();

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier inPhase(Phase p) {
        require(phase == p, "bad phase");
        _;
    }

    constructor(string[] memory names) {
        owner = msg.sender;
        require(names.length > 0 && names.length <= 255, "1..255 candidates");
        candidates = names;
        phase = Phase.Setup;
    }

    function initTallies() external onlyOwner inPhase(Phase.Setup) {
        for (uint256 i = 0; i < candidates.length; i++) {
            tally[i] = FHE.asEuint32(0);
            FHE.allow(tally[i], address(this));
        }
    }

    function open() external onlyOwner inPhase(Phase.Setup) {
        phase = Phase.Open;
        emit Opened();
    }

    function close() public onlyOwner inPhase(Phase.Open) {
        phase = Phase.Closed;
        emit Closed();
    }

    /// @notice Người dùng bỏ phiếu
    /// @param choice externalEuint8 (encrypted vote)
    /// @param attestation proof (attestation + extraData từ SDK)
    function submitVote(
        externalEuint8 choice,
        bytes calldata attestation
    ) external inPhase(Phase.Open) {
        require(!hasVoted[msg.sender], "already voted");
        hasVoted[msg.sender] = true;

        euint8 v = FHE.fromExternal(choice, attestation);

        uint256 n = candidates.length;
        ebool inRange = FHE.lt(v, FHE.asEuint8(uint8(n)));
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);

        for (uint256 i = 0; i < n; i++) {
            ebool isI = FHE.eq(v, FHE.asEuint8(uint8(i)));
            ebool shouldCount = FHE.and(inRange, isI);
            euint32 inc = FHE.select(shouldCount, one, zero);

            tally[i] = FHE.add(tally[i], inc);
            FHE.allow(tally[i], address(this));
        }

        emit VoteSubmitted(msg.sender, 0);
    }

    function getEncryptedTally(uint256 i) external view returns (bytes32) {
        require(i < candidates.length, "bad index");
        return FHE.toBytes32(tally[i]);
    }

    function makeTalliesPublic() external onlyOwner inPhase(Phase.Closed) {
        for (uint256 i = 0; i < candidates.length; i++) {
            FHE.makePubliclyDecryptable(tally[i]);
        }
        emit TalliesPublic();
    }

    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }
}
