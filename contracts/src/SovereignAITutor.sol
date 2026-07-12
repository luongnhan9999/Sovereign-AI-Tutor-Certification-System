// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TutorAgent.sol";

/**
 * @title SovereignAITutor
 * @dev Main contract managing users, courses, progress, rewards, and certificates.
 *      Integrates with TutorAgent for AI-driven quiz generation and evaluation.
 */
contract SovereignAITutor is ERC721URIStorage, Ownable {
    // ---------------------------------------------------------------------
    // Types & Structs
    // ---------------------------------------------------------------------
    struct Course {
        uint256 id;
        string name;
        uint256 totalQuizzes;
        uint256 rewardAmount; // amount of reward points per completed quiz
    }

    struct Progress {
        uint256 completedQuizzes;
        uint256 lastQuizTimestamp;
        bool certificateMinted;
    }

    // ---------------------------------------------------------------------
    // State Variables
    // ---------------------------------------------------------------------
    uint256 public nextCourseId;
    mapping(uint256 => Course) public courses;                 // courseId => Course
    mapping(address => mapping(uint256 => Progress)) public userProgress; // user => courseId => Progress
    mapping(address => int256) public rewardBalance;          // allow negative balances
    TutorAgent public tutorAgent;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------
    event CourseRegistered(uint256 indexed courseId, string name);
    event QuizGenerated(address indexed user, uint256 indexed courseId, string quizId);
    event QuizAnswered(address indexed user, uint256 indexed courseId, bool correct);
    event CertificateMinted(address indexed user, uint256 indexed courseId, uint256 tokenId);

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    constructor(address _agent) ERC721("TutorCertificate", "TCERT") Ownable(msg.sender) {
        tutorAgent = TutorAgent(_agent);
    }

    // ---------------------------------------------------------------------
    // Course Management
    // ---------------------------------------------------------------------
    function registerCourse(string memory name, uint256 totalQuizzes, uint256 rewardAmount) external onlyOwner {
        uint256 courseId = ++nextCourseId;
        courses[courseId] = Course({id: courseId, name: name, totalQuizzes: totalQuizzes, rewardAmount: rewardAmount});
        emit CourseRegistered(courseId, name);
    }

    // ---------------------------------------------------------------------
    // Tutor Interaction
    // ---------------------------------------------------------------------
    function requestQuiz(uint256 courseId) external {
        require(courses[courseId].id != 0, "Course does not exist");
        // Call Agent to generate quiz (returns a quiz identifier string)
        string memory quizId = tutorAgent.generateQuiz(msg.sender, courseId);
        emit QuizGenerated(msg.sender, courseId, quizId);
    }

    function submitAnswer(uint256 courseId, string memory quizId, string memory answer) external {
        require(courses[courseId].id != 0, "Course does not exist");
        // Evaluate answer via Agent
        bool correct = tutorAgent.evaluateAnswer(msg.sender, courseId, quizId, answer);
        // Update progress
        Progress storage prog = userProgress[msg.sender][courseId];
        if (correct) {
            prog.completedQuizzes += 1;
            // Reward points
            rewardBalance[msg.sender] += int256(courses[courseId].rewardAmount);
        } else {
            // Deduct points
            rewardBalance[msg.sender] -= int256(courses[courseId].rewardAmount);
        }
        prog.lastQuizTimestamp = block.timestamp;
        emit QuizAnswered(msg.sender, courseId, correct);
        // Auto-mint certificate if course completed and not yet minted
        if (prog.completedQuizzes >= courses[courseId].totalQuizzes && !prog.certificateMinted) {
            uint256 tokenId = uint256(keccak256(abi.encodePacked(msg.sender, courseId, block.timestamp)));
            _safeMint(msg.sender, tokenId);
            // In a real implementation, set token URI to metadata JSON
            prog.certificateMinted = true;
            emit CertificateMinted(msg.sender, courseId, tokenId);
        }
    }
}
