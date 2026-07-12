// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SovereignAITutor.sol";
import "../src/TutorAgent.sol";

/**
 * @title MockLLM
 * @dev Simple mock for LLM precompile used in tests.
 */
contract MockLLM {
    function generateQuiz(address, uint256) external pure returns (string memory) {
        return "mock-quiz-id";
    }

    function evaluateAnswer(address, uint256, string memory, string memory answer) external pure returns (bool) {
        // Return true if answer equals "42"
        return keccak256(bytes(answer)) == keccak256(bytes("42"));
    }
}

/**
 * @title SovereignAITutorTest
 * @dev Unit tests covering course registration, quiz flow, reward, and certificate minting.
 */
contract SovereignAITutorTest is Test {
    SovereignAITutor public tutor;
    TutorAgent public agent;
    address public constant USER = address(0xBEEF);

    function setUp() public {
        // Deploy mock LLM at the precompile address
        MockLLM mock = new MockLLM();
        vm.etch(address(0x0802), address(mock).code);
        // Deploy Agent with mock mode disabled (we rely on mocked precompile)
        agent = new TutorAgent(false);
        tutor = new SovereignAITutor(address(agent));
        // Give USER some ether for txs
        vm.deal(USER, 10 ether);
    }

    function testCourseRegistrationAndQuizFlow() public {
        // Owner registers a course
        tutor.registerCourse("Solidity 101", 1, 100 ether);
        uint256 courseId = tutor.nextCourseId();
        // USER requests a quiz
        vm.prank(USER);
        tutor.requestQuiz(courseId);
        // USER submits correct answer "42"
        vm.prank(USER);
        tutor.submitAnswer(courseId, "mock-quiz-id", "42");
        // Verify ERC20 reward minted
        assertEq(tutor.balanceOf(USER), 100 ether);
        // Verify certificate minted (since totalQuizzes=1)
        assertTrue(tutor.userProgress(USER, courseId).certificateMinted);
        // ERC721 token ownership check
        uint256 tokenId = tutor.userProgress(USER, courseId).certificateMinted ? tutor.ownerOf(1) : address(0);
        assertEq(tokenId, USER);
    }
}
