// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title TutorAgent
 * @dev Interacts with Ritual TEE precompiles for LLM and HTTP.
 *      Supports mock mode for demo purposes.
 */
contract TutorAgent {
    using Strings for uint256;
    using Strings for address;

    // ---------------------------------------------------------------
    // State
    // ---------------------------------------------------------------
    bool public isMockMode; // when true, bypass precompiles

    // ---------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------
    event MockModeToggled(bool enabled);

    // ---------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------
    constructor(bool _mock) {
        isMockMode = _mock;
    }

    // ---------------------------------------------------------------
    // Admin functions
    // ---------------------------------------------------------------
    function setMockMode(bool _mock) external {
        // In production this would be restricted, for demo we keep open
        isMockMode = _mock;
        emit MockModeToggled(_mock);
    }

    // ---------------------------------------------------------------
    // Precompile interactions
    // ---------------------------------------------------------------
    // LLM precompile address (Ritual TEE)
    address constant LLM_PRECOMPILE = address(0x0802);
    // HTTP precompile address
    address constant HTTP_PRECOMPILE = address(0x0801);

    /**
     * @dev Generate a quiz for a user-course pair.
     * @param user address of the learner
     * @param courseId id of the course
     * @return quizId identifier string (could be JSON encoded)
     */
    function generateQuiz(address user, uint256 courseId) external view returns (string memory quizId) {
        if (isMockMode) {
            // simple deterministic mock
            quizId = string(abi.encodePacked("mock-quiz-", user.toHexString(), "-", courseId.toString()));
        } else {
            // Call LLM precompile – custom ABI assumed: (address,uint256) -> (string)
            bytes memory payload = abi.encodeWithSignature("generateQuiz(address,uint256)", user, courseId);
            (bool success, bytes memory ret) = LLM_PRECOMPILE.staticcall(payload);
            require(success, "LLM precompile failed");
            quizId = abi.decode(ret, (string));
        }
    }

    /**
     * @dev Evaluate an answer using the LLM precompile.
     * @return correct boolean result
     */
    function evaluateAnswer(address user, uint256 courseId, string memory quizId, string memory answer) external view returns (bool correct) {
        if (isMockMode) {
            // Mock mode: answer is correct if it's reasonably long (> 10 chars)
            correct = bytes(answer).length > 10;
        } else {
            bytes memory payload = abi.encodeWithSignature("evaluateAnswer(address,uint256,string,string)", user, courseId, quizId, answer);
            (bool success, bytes memory ret) = LLM_PRECOMPILE.staticcall(payload);
            require(success, "LLM evaluate failed");
            correct = abi.decode(ret, (bool));
        }
    }
}
