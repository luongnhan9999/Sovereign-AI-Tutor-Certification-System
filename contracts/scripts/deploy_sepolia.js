import { ethers } from "ethers";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Using public Base Sepolia RPC (gas is usually cheaper here)
  const rpc = "https://sepolia.base.org";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("Missing PRIVATE_KEY in .env");

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying to Base Sepolia Testnet...");
  console.log("Deployer address:", wallet.address);

  // Deploy TutorAgent (with mock mode = true)
  const tutorAgentArtifact = JSON.parse(fs.readFileSync("./artifacts/src/TutorAgent.sol/TutorAgent.json", "utf8"));
  const TutorAgentFactory = new ethers.ContractFactory(tutorAgentArtifact.abi, tutorAgentArtifact.bytecode, wallet);
  console.log("Deploying TutorAgent (in Mock Mode)...");
  
  const agent = await TutorAgentFactory.deploy(true);
  await agent.waitForDeployment();
  const agentAddress = await agent.getAddress();
  console.log("TutorAgent deployed to:", agentAddress);

  // Deploy SovereignAITutor
  const tutorArtifact = JSON.parse(fs.readFileSync("./artifacts/src/SovereignAITutor.sol/SovereignAITutor.json", "utf8"));
  const SovereignFactory = new ethers.ContractFactory(tutorArtifact.abi, tutorArtifact.bytecode, wallet);
  console.log("Deploying SovereignAITutor...");
  const tutor = await SovereignFactory.deploy(agentAddress);
  await tutor.waitForDeployment();
  const tutorAddress = await tutor.getAddress();
  console.log("SovereignAITutor deployed to:", tutorAddress);
  
  console.log("\n==================================");
  console.log("Save these addresses for the frontend:");
  console.log("NEXT_PUBLIC_AGENT_ADDRESS=" + agentAddress);
  console.log("NEXT_PUBLIC_TUTOR_ADDRESS=" + tutorAddress);
  console.log("==================================");
}

main().catch(console.error);
