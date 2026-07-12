// lib/web3.ts
import { ethers } from 'ethers';

// Public RPC endpoint for read‑only calls (no wallet needed)
const PUBLIC_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ritualfoundation.org';

/**
 * Returns a read-only provider pointing directly to our network (Base Sepolia).
 * This ensures we can fetch course data even if the user's wallet is on the wrong network.
 */
export function getReadProvider(): ethers.Provider {
  return new ethers.JsonRpcProvider(PUBLIC_RPC);
}

/**
 * Returns the user's wallet provider if available.
 */
export function getProvider(): ethers.Provider {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return getReadProvider();
}

/** Returns a signer attached to MetaMask (if present). */
export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    return await provider.getSigner();
  }
  return null;
}

/** Prompts MetaMask to switch to the Ritual Testnet (Chain ID 1979). Adds it if missing. */
export async function switchNetwork() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const chainIdHex = '0x' + (1979).toString(16); // '0x7bb'
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: 'Ritual Testnet',
                nativeCurrency: { name: 'Ritual', symbol: 'RITUAL', decimals: 18 },
                rpcUrls: ['https://rpc.ritualfoundation.org'],
                blockExplorerUrls: ['https://explorer.ritualfoundation.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Ritual network', addError);
        }
      } else {
        console.error('Failed to switch to Ritual network', switchError);
      }
    }
  }
}

/**
 * Load contract ABIs and addresses.
 * After deployment, replace the placeholder addresses with the real ones.
 */
export const CONTRACTS = {
  tutor: {
    address: process.env.NEXT_PUBLIC_TUTOR_ADDRESS || '0xCD5040C63Bc25F4F1c82C21221Dd2CdbC8823b81',
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
    address: process.env.NEXT_PUBLIC_AGENT_ADDRESS || '0xa5Cc4Df4F874484fDb073f220F6F45354326aD71',
    abi: [
      'function isMockMode() view returns (bool)',
      'function setMockMode(bool)',
    ],
  },
};

export type Contracts = typeof CONTRACTS;
