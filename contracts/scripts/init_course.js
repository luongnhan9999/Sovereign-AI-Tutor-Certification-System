import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpc = process.env.RITUAL_RPC || "https://rpc.ritualfoundation.org";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("Missing PRIVATE_KEY in .env");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  const tutorAddress = "0x949f655ea660CC6FD620f2866CE7eE9f924C8368";
  
  const tutorAbi = [
    "function registerCourse(string memory name, uint256 totalQuizzes, uint256 rewardAmount) external",
    "function nextCourseId() view returns (uint256)"
  ];

  const tutor = new ethers.Contract(tutorAddress, tutorAbi, wallet);

  console.log("Registering first course...");
  const tx = await tutor.registerCourse("Introduction to Sovereign AI", 3, ethers.parseEther("10"));
  await tx.wait();
  console.log("Course registered!");

  console.log("Registering second course...");
  const tx2 = await tutor.registerCourse("Symphony Whitepaper: Execution-Aware Consensus", 3, ethers.parseEther("15"));
  await tx2.wait();
  console.log("Course 2 registered!");

  const nextId = await tutor.nextCourseId();
  console.log("Next Course ID is now:", nextId.toString());
}

main().catch(console.error);
