import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpc = "https://sepolia.base.org";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("Missing PRIVATE_KEY in .env");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  const tutorAddress = "0x4152723f23574eDB63284f21a99596609d2E3E92";
  const tutorAbi = [
    "function registerCourse(string memory name, uint256 totalQuizzes, uint256 rewardAmount) external",
    "function nextCourseId() view returns (uint256)"
  ];

  const tutor = new ethers.Contract(tutorAddress, tutorAbi, wallet);

  console.log("Registering first course...");
  const tx = await tutor.registerCourse("Introduction to Sovereign AI", 3, ethers.parseEther("10"));
  await tx.wait();
  console.log("Course registered!");

  const nextId = await tutor.nextCourseId();
  console.log("Next Course ID is now:", nextId.toString());
}

main().catch(console.error);
