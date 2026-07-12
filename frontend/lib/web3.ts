// lib/web3.ts
import { ethers } from 'ethers';

// Public RPC endpoint for read‑only calls (no wallet needed)
const PUBLIC_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';

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
export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    return await provider.getSigner();
  }
  return null;
}

/**
 * Load contract ABIs and addresses.
 * After deployment, replace the placeholder addresses with the real ones.
 */
export const CONTRACTS = {
  tutor: {
    address: process.env.NEXT_PUBLIC_TUTOR_ADDRESS || '0x4152723f23574eDB63284f21a99596609d2E3E92',
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
    address: process.env.NEXT_PUBLIC_AGENT_ADDRESS || '0x6f854279b0910037A27491511Ddc0670E0Bb1711',
    abi: [
      'function isMockMode() view returns (bool)',
      'function setMockMode(bool)',
    ],
  },
};

export type Contracts = typeof CONTRACTS;
