// lib/web3.ts
import { ethers } from 'ethers';

// Public RPC endpoint for read‑only calls (no wallet needed)
const PUBLIC_RPC = 'https://rpc.ritualfoundation.org';

/**
 * Returns an ethers provider. If MetaMask is available it will be used for write
 * operations, otherwise the public RPC is returned for read‑only calls.
 */
export function getProvider(): ethers.Provider {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return new ethers.JsonRpcProvider(PUBLIC_RPC);
}

/** Returns a signer attached to MetaMask (if present). */
export function getSigner(): ethers.Signer {
  const provider = getProvider();
  // BrowserProvider has getSigner method
  // @ts-ignore – TypeScript guard for BrowserProvider
  return (provider as any).getSigner?.();
}

/**
 * Load contract ABIs and addresses.
 * After deployment, replace the placeholder addresses with the real ones.
 */
export const CONTRACTS = {
  tutor: {
    address: process.env.NEXT_PUBLIC_TUTOR_ADDRESS || '',
    abi: [
      // Minimal ABI needed for the dashboard UI
      'function nextCourseId() view returns (uint256)',
      'function courses(uint256) view returns (uint256 id, string name, uint256 totalQuizzes, uint256 rewardAmount)',
      'function userProgress(address,uint256) view returns (uint256 completedQuizzes, uint256 lastQuizTimestamp, bool certificateMinted)',
      'function requestQuiz(uint256)',
      'function submitAnswer(uint256,string,string)',
      'event QuizGenerated(address indexed user, uint256 indexed courseId, string quizId)',
    ],
  },
  agent: {
    address: process.env.NEXT_PUBLIC_AGENT_ADDRESS || '',
    abi: [
      'function isMockMode() view returns (bool)',
      'function setMockMode(bool)',
    ],
  },
};

export type Contracts = typeof CONTRACTS;
